"""Gercek ses dosyalarini oyuna alir.

Kullanim:
  1. Indirdigin sesleri  tools/audio_src/  klasorune at.
  2. Dosya adi hedefle ayni olsun (ornek: engine_thrust.wav).
  3. python tools/import_audio.py

Ne yapar:
  - WAV cozer (16/24/32-bit tamsayi ve 32-bit float, mono/stereo, her ornekleme hizi)
  - Mono'ya indirger, 44100 Hz'e cevirir
  - Bas/son sessizligi kirpar
  - Dongu dosyalarinda kuyrugu basa capraz gecisle bindirir (dikissiz dongu)
  - Algilanan yuksekligi (RMS) esitler, tepeyi tavana sinirlar
  - Hem web/ hem app/wwwroot/game/ altina yazar

Kaynagi olmayan sesler oldugu gibi kalir; hepsini birden degistirmek
zorunda degilsin, teker teker gecebilirsin.

Not: ffmpeg gerektirmez. MP3/OGG desteklenmez - kaynaklari WAV olarak
indir ya da once WAV'a cevir.
"""

import math
import os
import struct
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_DIR = os.path.join(ROOT, "tools", "audio_src")
MANIFEST = os.path.join(ROOT, "tools", "imported_audio.txt")
OUT_DIRS = [
    os.path.join(ROOT, "app", "wwwroot", "game", "assets", "audio"),
    os.path.join(ROOT, "web", "assets", "audio"),
]
SR = 44100

# Oyunun bekledigi dosyalar. Dongu olanlar dikissiz hale getirilir.
TARGETS = {
    "engine_idle.wav": {"loop": True},
    "engine_thrust.wav": {"loop": True},
    "music_arcade_loop.wav": {"loop": True},
    "launch.wav": {},
    "thrust_on.wav": {},
    "idle_down.wav": {},
    "boost.wav": {},
    "coin.wav": {},
    "fuel.wav": {},
    "shield.wav": {},
    "magnet.wav": {},
    "perfect.wav": {},
    "warn.wav": {"max_sec": 0.9},
    # Tekrar tekrar calan uyari kisa olmali; kaynak uzunsa bastan kirp.
    "fuel_warn.wav": {"max_sec": 0.8},
    "wall_hit.wav": {},
    "ground_crash.wav": {},
    "tap.wav": {},
}

TARGET_RMS = 0.18
PEAK_CEILING = 0.95
SILENCE_FLOOR = 0.004


def read_wav(path):
    """Minimal RIFF cozucu. float ve 24-bit dahil.

    wave modulu yalnizca PCM okur; indirilen ses dosyalari sik sik
    32-bit float gelir, o yuzden elle cozuyoruz.
    """
    with open(path, "rb") as fh:
        data = fh.read()

    if data[0:4] != b"RIFF" or data[8:12] != b"WAVE":
        raise ValueError("RIFF/WAVE degil")

    pos = 12
    fmt = None
    raw = None
    while pos + 8 <= len(data):
        cid = data[pos:pos + 4]
        size = struct.unpack("<I", data[pos + 4:pos + 8])[0]
        body = data[pos + 8:pos + 8 + size]
        if cid == b"fmt ":
            fmt = body
        elif cid == b"data":
            raw = body
        pos += 8 + size + (size & 1)

    if fmt is None or raw is None:
        raise ValueError("fmt/data parcasi yok")

    audio_fmt, channels, rate, _, _, bits = struct.unpack("<HHIIHH", fmt[:16])
    if audio_fmt == 0xFFFE and len(fmt) >= 26:
        audio_fmt = struct.unpack("<H", fmt[24:26])[0]

    if audio_fmt == 1:
        if bits == 16:
            n = len(raw) // 2
            vals = struct.unpack("<%dh" % n, raw[:n * 2])
            samples = [v / 32768.0 for v in vals]
        elif bits == 24:
            n = len(raw) // 3
            samples = []
            for i in range(n):
                b = raw[i * 3:i * 3 + 3]
                v = int.from_bytes(b, "little", signed=True)
                samples.append(v / 8388608.0)
        elif bits == 32:
            n = len(raw) // 4
            vals = struct.unpack("<%di" % n, raw[:n * 4])
            samples = [v / 2147483648.0 for v in vals]
        elif bits == 8:
            samples = [(b - 128) / 128.0 for b in raw]
        else:
            raise ValueError("desteklenmeyen bit derinligi: %d" % bits)
    elif audio_fmt == 3 and bits == 32:
        n = len(raw) // 4
        samples = list(struct.unpack("<%df" % n, raw[:n * 4]))
    else:
        raise ValueError("desteklenmeyen format: %d/%d bit" % (audio_fmt, bits))

    if channels > 1:
        mixed = []
        for i in range(0, len(samples) - channels + 1, channels):
            mixed.append(sum(samples[i:i + channels]) / channels)
        samples = mixed

    return samples, rate


def resample(samples, src_rate, dst_rate=SR):
    if src_rate == dst_rate or not samples:
        return samples
    ratio = dst_rate / src_rate
    out_n = int(len(samples) * ratio)
    out = []
    for i in range(out_n):
        p = i / ratio
        i0 = int(p)
        i1 = min(i0 + 1, len(samples) - 1)
        f = p - i0
        out.append(samples[i0] * (1 - f) + samples[i1] * f)
    return out


def trim_silence(samples):
    n = len(samples)
    start = 0
    while start < n and abs(samples[start]) < SILENCE_FLOOR:
        start += 1
    end = n - 1
    while end > start and abs(samples[end]) < SILENCE_FLOOR:
        end -= 1
    return samples[start:end + 1] if end > start else samples


def seamless(samples, xfade=0.3):
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


def normalize(samples):
    n = len(samples)
    if n == 0:
        return samples
    rms = math.sqrt(sum(x * x for x in samples) / n)
    if rms <= 1e-6:
        return samples
    scaled = [x * (TARGET_RMS / rms) for x in samples]
    peak = max(abs(x) for x in scaled)
    if peak > PEAK_CEILING:
        k = PEAK_CEILING / peak
        scaled = [x * k for x in scaled]
    return [max(-1.0, min(1.0, x)) for x in scaled]


def write_wav(name, samples):
    payload = bytearray()
    for s in samples:
        payload += struct.pack("<h", int(max(-1.0, min(1.0, s)) * 32767))
    for out_dir in OUT_DIRS:
        os.makedirs(out_dir, exist_ok=True)
        with open(os.path.join(out_dir, name), "wb") as fh:
            fh.write(b"RIFF")
            fh.write(struct.pack("<I", 36 + len(payload)))
            fh.write(b"WAVEfmt ")
            fh.write(struct.pack("<IHHIIHH", 16, 1, 1, SR, SR * 2, 2, 16))
            fh.write(b"data")
            fh.write(struct.pack("<I", len(payload)))
            fh.write(payload)


def main():
    if not os.path.isdir(SRC_DIR):
        os.makedirs(SRC_DIR, exist_ok=True)
        print("Kaynak klasoru olusturuldu:", SRC_DIR)
        print("Ses dosyalarini buraya at, sonra tekrar calistir.")
        return

    found = 0
    for name, opts in TARGETS.items():
        src = os.path.join(SRC_DIR, name)
        if not os.path.isfile(src):
            continue
        try:
            samples, rate = read_wav(src)
        except Exception as err:
            print("  %-24s ATLANDI (%s)" % (name, err))
            continue

        before = len(samples) / rate
        samples = resample(samples, rate)
        samples = trim_silence(samples)

        max_sec = opts.get("max_sec")
        if max_sec and len(samples) > int(SR * max_sec):
            cut = int(SR * max_sec)
            fade = min(int(SR * 0.03), cut // 4)
            samples = samples[:cut]
            # Kesim noktasinda tik olmasin diye kisa sonum
            for i in range(fade):
                samples[cut - 1 - i] *= i / fade

        if opts.get("loop"):
            samples = seamless(samples)
        samples = normalize(samples)
        write_wav(name, samples)
        found += 1

        peak = max((abs(x) for x in samples), default=0.0)
        print("  %-24s %5.2fs @%dHz -> %5.2fs  tepe %.2f%s"
              % (name, before, rate, len(samples) / SR, peak,
                 "  [dikissiz dongu]" if opts.get("loop") else ""))

    if found == 0:
        print("Kaynak bulunamadi. Dosya adlari hedeflerle ayni olmali:")
        for name in TARGETS:
            print("   ", name)
        return

    # Kunye: hangi sesler gercek kayittan geldi. generate_audio_assets.py
    # bu listeyi okuyup o dosyalari ezmez - yoksa sentez sesler gercek
    # kayitlarin uzerine sessizce yazilirdi.
    imported = sorted(
        n for n in TARGETS if os.path.isfile(os.path.join(SRC_DIR, n))
    )
    with open(MANIFEST, "w", encoding="utf-8") as fh:
        fh.write("# import_audio.py tarafindan uretildi.\n")
        fh.write("# Bu dosyalar gercek kayittan geliyor, sentezle uzerine yazilmaz.\n")
        for n in imported:
            fh.write(n + "\n")

    print("\n%d dosya alindi, iki dizine de yazildi." % found)
    print("Kunye yazildi:", os.path.relpath(MANIFEST, ROOT))


if __name__ == "__main__":
    main()
