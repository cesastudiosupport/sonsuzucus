"""Reproducible flight mix, from the original recordings; no cumulative processing."""
import math
import os
from import_audio import read_wav, resample, trim_silence, seamless, write_wav, SRC_DIR, SR


def lowpass(samples, hz):
    alpha = 1 - math.exp(-2 * math.pi * hz / SR)
    value = 0
    out = []
    for sample in samples:
        value += alpha * (sample - value)
        out.append(value)
    return out


def master(samples, target=0.13):
    dc = sum(samples) / max(1, len(samples))
    samples = [s - dc for s in samples]
    rms = math.sqrt(sum(s * s for s in samples) / max(1, len(samples)))
    gain = min(target / max(1e-8, rms), 0.82 / max(1e-8, max(map(abs, samples))))
    return [s * gain for s in samples]


def recordings():
    settings = {
        'engine_idle.wav': (600, 0.08, True),
        'engine_thrust.wav': (1050, 0.13, True),
        'thrust_on.wav': (1600, 0.13, False),
        'idle_down.wav': (1000, 0.09, False),
        'wall_hit.wav': (3800, 0.18, False),
        'ground_crash.wav': (2600, 0.17, False),
    }
    for name, (cutoff, rms, loop) in settings.items():
        samples, rate = read_wav(os.path.join(SRC_DIR, name))
        samples = trim_silence(resample(samples, rate))
        bass = lowpass(samples, 65)
        samples = lowpass(lowpass([s - b for s, b in zip(samples, bass)], cutoff), cutoff)
        if loop:
            samples = seamless(samples)
        else:
            fade = min(int(SR * 0.008), len(samples) // 4)
            for i in range(fade):
                samples[i] *= i / fade
                samples[-1-i] *= i / fade
        samples = master(samples, rms)
        write_wav(name, samples)
        print(f'{name}: {len(samples)/SR:.2f}s, peak={max(map(abs, samples)):.3f}')


def score():
    # A quiet original 16-bar score. Wrapped note tails keep the loop musical.
    bpm = 92
    beat = 60 / bpm
    length = round(16 * 4 * beat * SR)
    samples = [0.0] * length
    chords = [(146.83, 220, 293.66, 369.99), (130.81, 196, 261.63, 329.63),
              (164.81, 246.94, 329.63, 392), (110, 164.81, 220, 293.66)]

    def note(start, duration, hz, gain, attack=0.025, decay=2.0):
        offset = round(start * SR)
        for i in range(round(duration * SR)):
            t = i / SR
            envelope = min(1, t / attack) * math.exp(-t * decay) * min(1, (duration - t) / 0.15)
            phase = 2 * math.pi * hz * t
            tone = math.sin(phase) + 0.16 * math.sin(phase * 2) + 0.045 * math.sin(phase * 3)
            samples[(offset + i) % length] += tone * envelope * gain

    for bar in range(16):
        chord = chords[(bar // 2) % 4]
        start = bar * beat * 4
        for hz in chord[:3]:
            note(start, beat * 4.5, hz, 0.021, 0.48, 0.5)
        note(start, beat * 2.1, chord[0] / 2, 0.055, 0.04, 1.4)
        note(start + beat * 2.5, beat * 1.5, chord[0] / 2, 0.035, 0.04, 1.8)
        for pos, key in [(0.5, 2), (1.75, 3), (3, 1)]:
            note(start + beat * pos, beat * 1.8, chord[key] * (2 if bar % 4 == 3 else 1), 0.023, 0.009, 3.2)
        # Soft felt-like low percussion, without noisy hats or buzzing waves.
        for pos in (0, 2):
            note(start + beat * pos, 0.12, 68, 0.03, 0.008, 30)
    write_wav('music_arcade_loop.wav', master(samples, 0.12))
    print(f'music_arcade_loop.wav: {length/SR:.2f}s, original 16-bar score')


if __name__ == '__main__':
    recordings()
    score()
