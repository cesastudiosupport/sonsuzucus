"""Render distinct gate and completion cues without sharp arcade oscillators."""
import math
from import_audio import SR, write_wav


def finish(name, samples, peak):
    maximum = max(map(abs, samples)) or 1
    samples = [v * peak / maximum for v in samples]
    fade = int(SR * 0.012)
    for i in range(fade):
        samples[i] *= i / fade
        samples[-1-i] *= i / fade
    write_wav(name, samples)
    print(f'{name}: {len(samples)/SR:.2f}s, peak {peak}')


def gate():
    duration = 0.32
    samples = []
    phase = 0
    for i in range(int(SR * duration)):
        t = i / SR
        k = t / duration
        phase += 2 * math.pi * (390 + 170 * (1 - math.exp(-k * 4))) / SR
        envelope = (1 - math.exp(-t * 120)) * math.exp(-t * 13) * (1 - k) ** 2
        samples.append((math.sin(phase) + 0.12 * math.sin(phase * 2)) * envelope)
    finish('gate_pass.wav', samples, 0.48)


def complete():
    duration = 1.35
    samples = [0.0] * int(SR * duration)
    for start, frequency, gain in [(.05, 329.63, .50), (.22, 392, .42), (.39, 523.25, .34)]:
        for i in range(int(start * SR), len(samples)):
            t = i / SR - start
            remaining = duration - i / SR
            envelope = (1 - math.exp(-t * 55)) * math.exp(-t * 4.3) * min(1, remaining / .18)
            phase = 2 * math.pi * frequency * t
            samples[i] += gain * envelope * (math.sin(phase) + .08 * math.sin(phase * 2))
    finish('stage_complete.wav', samples, 0.65)


if __name__ == '__main__':
    gate()
    complete()
