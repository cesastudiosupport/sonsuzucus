import math
import os
import random
import struct
import sys
import wave


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIRS = [
    os.path.join(ROOT, "app", "wwwroot", "game", "assets", "audio"),
    os.path.join(ROOT, "web", "assets", "audio"),
]
SR = 44100
random.seed(6042)


def clamp(v, lo=-1.0, hi=1.0):
    return max(lo, min(hi, v))


def lowpass_noise(n, cutoff=0.035):
    out = []
    y = 0.0
    for _ in range(n):
        y += ((random.random() * 2.0 - 1.0) - y) * cutoff
        out.append(y)
    return out


def highpass_from_lowpass(n, cutoff=0.04):
    out = []
    y = 0.0
    for _ in range(n):
        x = random.random() * 2.0 - 1.0
        y += (x - y) * cutoff
        out.append(x - y)
    return out


def white(n):
    return [random.uniform(-1.0, 1.0) for _ in range(n)]


def lp(sig, hz):
    """Tek kutuplu alcak geciren."""
    a = 1.0 - math.exp(-2.0 * math.pi * hz / SR)
    y = 0.0
    out = []
    for x in sig:
        y += (x - y) * a
        out.append(y)
    return out


def hp(sig, hz):
    """Yuksek geciren: sinyalden alcak gecireni cikar."""
    low = lp(sig, hz)
    return [x - l for x, l in zip(sig, low)]


def bp(sig, low_hz, high_hz):
    return hp(lp(sig, high_hz), low_hz)


def seamless(samples, xfade=0.3):
    """Dongu icin kusursuz birlestirme.

    Iki ucu sifira indirmek yerine kuyrugu basin uzerine capraz
    gecisle bindirir. Boylece dosya her dondugunde ses kisilmaz.
    """
    xf = int(SR * xfade)
    n = len(samples)
    if xf <= 0 or n <= xf * 2:
        return samples
    core = n - xf
    out = samples[:core]
    for i in range(xf):
        k = i / xf
        out[i] = samples[i] * k + samples[core + i] * (1.0 - k)
    return out


def envelope(i, n, attack=0.01, release=0.06):
    a = min(1.0, i / max(1, int(SR * attack)))
    r = min(1.0, (n - i - 1) / max(1, int(SR * release)))
    return max(0.0, min(a, r))


# Kaynak dosyalar esit ALGILANAN yukseklige getirilir (RMS).
#
# Neden tepe normalizasyonu degil: tepeyi esitlemek algilanan yuksekligi
# savurur. Eski hal butun dosyalari 0.92 tepeye cekiyordu, ama RMS'leri
# 0.12 ile 0.52 arasinda dagiliyordu - yani motor dongusu tik sesinden
# kulakta ~3 kat gurultulu cikiyordu.
#
# Neden hiyerarsiyi buraya koymuyoruz: oyunda zaten katmanli ve dinamik
# bir kazanc zinciri var (engineGain -> idleGain/thrustGain, hiza gore
# degisiyor; musicGain ayri). Hiyerarsiyi dosyalara da yazmak ayni
# duzenlemeyi iki kez uygulamak olur. Kaynak esit olunca oyundaki
# kazanc sayilari ne diyorsa o olur.
TARGET_RMS = {}

DEFAULT_RMS = 0.18
PEAK_CEILING = 0.95


def normalize(samples, name):
    """Hedef RMS'e getirir, sonra tepeyi tavana sinirlar.

    Once yukseklik ayarlanir; kirpma riski varsa tum dosya olcek
    kucultulur. Transient agirlikli sesler (carpma) tavana dayanip
    biraz daha sessiz kalir - bu dogru davranis, ic dinamikleri ezilmez.
    """
    n = len(samples)
    if n == 0:
        return samples

    rms = math.sqrt(sum(x * x for x in samples) / n)
    if rms <= 1e-6:
        return samples

    target = TARGET_RMS.get(name, DEFAULT_RMS)
    k = target / rms
    scaled = [x * k for x in samples]

    peak = max(abs(x) for x in scaled)
    if peak > PEAK_CEILING:
        k2 = PEAK_CEILING / peak
        scaled = [x * k2 for x in scaled]

    return [clamp(x) for x in scaled]


MANIFEST = os.path.join(ROOT, "tools", "imported_audio.txt")


def _imported_names():
    """Gercek kayittan gelen ses adlari (import_audio.py kunyesi).

    Bu dosyalar sentezle EZILMEZ. Aksi halde bu betigi calistirmak
    indirilen profesyonel sesleri sessizce geri alirdi.
    """
    if not os.path.isfile(MANIFEST):
        return set()
    names = set()
    with open(MANIFEST, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if line and not line.startswith("#"):
                names.add(line)
    return names


IMPORTED = _imported_names()
FORCE = "--force" in sys.argv


def write_wav(name, samples):
    if name in IMPORTED and not FORCE:
        print("  %-24s atlandi (gercek kayit korunuyor)" % name)
        return
    samples = normalize(samples, name)
    for out_dir in OUT_DIRS:
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, name)
        with wave.open(path, "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(SR)
            payload = bytearray()
            for s in samples:
                payload += struct.pack("<h", int(clamp(s) * 32767))
            wav.writeframes(payload)


def add_tone(samples, start, dur, hz, vol, wave_type="sine", attack=0.02, release=0.12):
    offset = int(start * SR)
    length = int(dur * SR)
    phase = 0.0
    for i in range(length):
        idx = offset + i
        if idx >= len(samples):
            break
        phase += 2 * math.pi * hz / SR
        env = envelope(i, length, attack, release)
        if wave_type == "tri":
            tone = 2.0 * abs(2.0 * ((phase / (2 * math.pi)) % 1.0) - 1.0) - 1.0
        else:
            tone = math.sin(phase)
        samples[idx] += tone * vol * env


def rocket_loop(name, duration, thrust=False):
    """Roket motoru: genis bantli gurultunun uc bandi.

    Sinus harmonikleri kullanilmaz - saf ton yigini kulaga vizilti
    (cizirti) gelir. Gercek itki sesi turbulanstan doger:
      gurultu tabani  30-110 Hz  govdede hissedilen gumburtu
      cekirdek kukreme 180-900 Hz sesin govdesi
      egzoz tislamasi  2-7 kHz    hava kesme sesi
    Itiste yuksek bant ve toplam enerji artar, rolantide gumburtu baskin.
    """
    xfade = 0.3
    n = int(SR * (duration + xfade))
    src = white(n)

    rumble = lp(src, 110.0)
    rumble = lp(rumble, 90.0)              # ikinci kademe: daha yumusak dip

    # Ust bant (2-7 kHz tislama) kaldirildi: o araliktaki filtrelenmis
    # gurultu kulakta telsiz parazitine benziyor. Itis ile rolanti
    # farki artik ayri bir tiz katman eklenerek degil, govde bandini
    # yukari kaydirarak veriliyor - parlaklik geliyor, parazit gelmiyor.
    if thrust:
        core = bp(src, 170.0, 850.0)
        top = 850.0
        g_rumble, g_core = 1.0, 0.80
    else:
        core = bp(src, 120.0, 480.0)
        top = 480.0
        g_rumble, g_core = 1.0, 0.42

    # Tek kutuplu filtre oktav basina yalnizca 6 dB dusurur, yani tiz
    # ciddi bicimde sizar ve parazit hissi geri gelir. Iki kademe daha
    # ekleyip egimi diklestiriyoruz.
    core = lp(core, top)
    core = lp(core, top)

    # Turbulans: yavas ve duzensiz genlik dalgalanmasi. Periyodik
    # olmamali, yoksa kulak ritim olarak yakalar.
    turb = lp(white(n), 3.5)
    tmax = max(abs(x) for x in turb) or 1.0

    samples = []
    for i in range(n):
        wob = 1.0 + 0.22 * (turb[i] / tmax)
        s = (rumble[i] * g_rumble + core[i] * g_core) * wob
        samples.append(s)

    write_wav(name, seamless(samples, xfade))


def add_kick(samples, start, vol=0.5):
    """Kisa alcak vurus: 110 Hz'den 45 Hz'e dusen sinus."""
    offset = int(start * SR)
    length = int(SR * 0.16)
    phase = 0.0
    for i in range(length):
        idx = offset + i
        if idx >= len(samples):
            break
        k = i / length
        hz = 110.0 * math.exp(-3.2 * k) + 42.0
        phase += 2 * math.pi * hz / SR
        samples[idx] += math.sin(phase) * vol * math.exp(-5.5 * k)


def add_hat(samples, start, vol=0.16, dur=0.045):
    """Yuksek gecirilmis kisa gurultu: ritmi tasiyan tik."""
    offset = int(start * SR)
    length = int(SR * dur)
    noise = hp(white(length), 6000.0)
    for i in range(length):
        idx = offset + i
        if idx >= len(samples):
            break
        k = i / length
        samples[idx] += noise[i] * vol * math.exp(-9.0 * k)


def arcade_music(name):
    """Arka plan muzigi: hafif ritimli, on plana cikmayan dongü.

    Onceki hali yalnizca uzayan akorlardan olusuyordu - ritim yoktu.
    Buraya alcak vurus + hi-hat katmani ve basit bir arpej eklendi;
    akor yatagi altta kalarak devam ediyor.
    """
    bpm = 104
    beat = 60.0 / bpm
    bars = 8
    duration = beat * 4 * bars
    n = int(SR * duration)
    samples = [0.0] * n
    chords = [
        (82.41, 123.47, 164.81),
        (98.00, 146.83, 196.00),
        (73.42, 110.00, 146.83),
        (87.31, 130.81, 174.61),
    ]

    for bar in range(bars):
        bar_start = bar * beat * 4
        chord = chords[bar % len(chords)]

        # Akor yatagi - altta, yumusak
        add_tone(samples, bar_start, beat * 3.8, chord[0], 0.085, "sine", 0.20, 0.45)
        add_tone(samples, bar_start + beat * 0.12, beat * 3.3, chord[1], 0.042, "sine", 0.24, 0.50)
        add_tone(samples, bar_start + beat * 0.32, beat * 2.9, chord[2], 0.030, "sine", 0.26, 0.50)

        # Ritim: 1 ve 3'te vurus, aralarda hi-hat
        add_kick(samples, bar_start, 0.42)
        add_kick(samples, bar_start + beat * 2, 0.32)
        for step in range(8):
            t = bar_start + step * beat * 0.5
            add_hat(samples, t, 0.13 if step % 2 == 0 else 0.075)

        # Arpej: hafif hareket, her barda son iki vurusta
        for j, mul in enumerate((2.0, 3.0, 2.5)):
            add_tone(samples, bar_start + beat * (2.5 + j * 0.5), beat * 0.4,
                     chord[j % 3] * mul, 0.022, "tri", 0.01, 0.22)

    write_wav(name, seamless(samples, 0.25))


def sweep(name, duration, start_hz, end_hz, volume=0.55, noise=0.0, shape="down"):
    """Itki sesi: suzulen hava gurultusu + altta destek tonu.

    Eskiden sinus supurmesi baskindi ve retro arcade gibi duyuluyordu.
    Roket/jet karakteri havadan gelir: bant genisligi hareket eden
    filtrelenmis gurultu. Ton yalnizca govde katar, on planda degil.
    """
    n = int(SR * duration)
    src = white(n)
    # Suzulen bant: tepe frekansi start->end arasinda hareket eder.
    # Filtreyi ornek ornek gezdirmek yerine iki uc bandi karistiriyoruz;
    # ucuz ve kulakta ayni hareketi veriyor.
    lo_band = bp(src, min(start_hz, end_hz) * 0.7, min(start_hz, end_hz) * 3.2)
    hi_band = bp(src, max(start_hz, end_hz) * 0.7, max(start_hz, end_hz) * 3.4)
    air = hp(src, 3500.0)

    phase = 0.0
    samples = []
    for i in range(n):
        x = i / max(1, n - 1)
        curve = x * x if shape == "down" else 1.0 - (1.0 - x) * (1.0 - x)
        hz = start_hz + (end_hz - start_hz) * curve
        phase += 2 * math.pi * hz / SR
        env = envelope(i, n, 0.006, 0.10)

        blend = curve if start_hz < end_hz else 1.0 - curve
        rush = lo_band[i] * (1.0 - blend) + hi_band[i] * blend
        body = math.sin(phase) * 0.35 + math.sin(phase * 0.5) * 0.12

        s = rush * (0.9 + noise)
        s += air[i] * 0.28 * blend
        s += body * volume * 0.55
        samples.append(s * env)
    write_wav(name, samples)


def impact(name, duration, strength=1.0, metal=False):
    """Carpma: keskin catirti + govde gumburtusu (+ metal cinlamasi).

    Eskiden gurultu tabani cok agir alcak gecirilmisti (kesim ~0.018),
    bu yuzden sadece bogук bir tok ses cikiyordu. Darbenin "carpti"
    hissi genis bantli transientten gelir; onu geri koyduk.
    """
    n = int(SR * duration)
    src = white(n)
    crack = hp(src, 1800.0)          # ilk anin catirtisi
    mid = bp(src, 300.0, 1600.0)     # govde
    debris = lp(src, 220.0)          # dagilan enkaz gumburtusu

    samples = []
    for i in range(n):
        t = i / SR
        # Catirti cok hizli soner, gumburtu uzun surer: kulak bunu
        # "sert darbe + arkasindan dagilma" olarak okur.
        e_crack = math.exp(-t * (55 if metal else 34))
        e_mid = math.exp(-t * (16 if metal else 10))
        e_low = math.exp(-t * (9 if metal else 5))

        thump = math.sin(2 * math.pi * (86 if metal else 52) * t) * math.exp(-t * 11)
        ring = 0.0
        if metal:
            # Inharmonik cift: metalik cinlama, saf ton degil
            ring = (math.sin(2 * math.pi * 317 * t) * 0.6
                    + math.sin(2 * math.pi * 743 * t) * 0.4) * math.exp(-t * 19)

        s = (crack[i] * 0.85 * e_crack
             + mid[i] * 0.55 * e_mid
             + debris[i] * 0.9 * e_low
             + thump * 0.75
             + ring * 0.18)
        samples.append(s * strength)
    write_wav(name, samples)


def alarm(name):
    n = int(SR * 0.7)
    samples = [0.0] * n
    for start in (0.0, 0.24, 0.48):
        offset = int(start * SR)
        length = int(0.13 * SR)
        phase = 0.0
        for i in range(length):
            idx = offset + i
            if idx >= n:
                break
            t = i / SR
            hz = 520 - 110 * (i / length)
            phase += 2 * math.pi * hz / SR
            env = envelope(i, length, 0.008, 0.04)
            samples[idx] += math.sin(phase) * 0.58 * env
            samples[idx] += math.sin(phase * 0.5) * 0.18 * env
    write_wav(name, samples)


def chime(name, notes, base_volume=0.48):
    duration = max(t + d for t, _, d in notes) + 0.08
    n = int(SR * duration)
    samples = [0.0] * n
    for start, hz, dur in notes:
        offset = int(start * SR)
        length = int(dur * SR)
        phase = 0.0
        for i in range(length):
            idx = offset + i
            if idx >= n:
                break
            phase += 2 * math.pi * hz / SR
            env = envelope(i, length, 0.004, 0.055)
            samples[idx] += (math.sin(phase) + 0.11 * math.sin(phase * 2)) * base_volume * env
    write_wav(name, samples)


def ui_click(name):
    """Arayuz tiki: gurultu transienti, bip degil.

    620 Hz sinus "bip" gibi duyuluyordu. Gercek tik sesi cok kisa
    genis bantli bir transienttir; altina hafif bir ton konur.
    """
    n = int(SR * 0.05)
    src = white(n)
    tick = bp(src, 1200.0, 9000.0)
    samples = []
    for i in range(n):
        t = i / SR
        env = math.exp(-t * 110)
        body = math.sin(2 * math.pi * 480 * t) * math.exp(-t * 150)
        samples.append((tick[i] * 0.9 + body * 0.3) * env)
    write_wav(name, samples)


def main():
    rocket_loop("engine_idle.wav", 2.8, thrust=False)
    rocket_loop("engine_thrust.wav", 2.8, thrust=True)
    arcade_music("music_arcade_loop.wav")
    sweep("launch.wav", 0.46, 95, 430, 0.26, 0.12, "up")
    sweep("thrust_on.wav", 0.16, 130, 340, 0.18, 0.08, "up")
    sweep("idle_down.wav", 0.18, 220, 90, 0.12, 0.04, "down")
    impact("wall_hit.wav", 0.28, 1.0, metal=True)
    impact("ground_crash.wav", 0.8, 1.15, metal=False)
    alarm("fuel_warn.wav")
    chime("coin.wav", [(0.0, 760, 0.07), (0.06, 1140, 0.08)], 0.28)
    chime("fuel.wav", [(0.0, 260, 0.12), (0.09, 390, 0.13), (0.18, 520, 0.11)], 0.30)
    chime("boost.wav", [(0.0, 390, 0.11), (0.08, 620, 0.14), (0.19, 880, 0.10)], 0.32)
    chime("shield.wav", [(0.0, 320, 0.15), (0.09, 480, 0.15), (0.18, 640, 0.12)], 0.28)
    chime("magnet.wav", [(0.0, 220, 0.12), (0.075, 540, 0.14)], 0.26)
    chime("perfect.wav", [(0.0, 620, 0.08), (0.065, 820, 0.09), (0.14, 1040, 0.08)], 0.28)
    chime("warn.wav", [(0.0, 220, 0.12), (0.12, 180, 0.12)], 0.28)
    ui_click("tap.wav")


if __name__ == "__main__":
    main()
