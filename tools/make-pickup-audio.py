"""Soft fixed-pitch pickup cues. No laser sweeps, noise bursts or distortion."""
import math
import os
import struct
import wave
from import_audio import SR, write_wav, OUT_DIRS

PRESETS = {
    'magnet': (0.46, [(0, 293.66, .65), (.095, 440, .4)], .40),
    'shield': (0.60, [(0, 196, .5), (.04, 293.66, .45), (.08, 392, .25)], .42),
    'boost': (0.55, [(0, 164.81, .65), (.09, 246.94, .35), (.18, 329.63, .22)], .46),
    'fuel': (0.36, [(0, 349.23, .6), (.085, 440, .3)], .36),
    'coin': (0.20, [(0, 659.25, .65), (.025, 987.77, .12)], .30),
    'perfect': (0.52, [(0, 329.63, .5), (.075, 415.30, .35), (.15, 493.88, .3)], .38),
    'tap': (0.10, [(0, 330, .8)], .22),
}


def render(duration, notes, peak):
    samples = [0.0] * round(SR * duration)
    for start, hz, gain in notes:
        for i in range(round(start * SR), len(samples)):
            t = i / SR - start
            remain = duration - i / SR
            envelope = (1 - math.exp(-t / .009)) * math.exp(-t * (6 / duration)) * min(1, remain / .045)
            phase = 2 * math.pi * hz * t
            samples[i] += gain * envelope * (math.sin(phase) + .045 * math.sin(phase * 2) * math.exp(-t * 35))
    scale = peak / max(map(abs, samples))
    samples = [v * scale for v in samples]
    # Click-free endpoints, independent of the note release envelope.
    fade = min(round(SR * .006), len(samples) // 4)
    for i in range(fade):
        samples[i] *= i / fade
        samples[-1-i] *= i / fade
    return samples


if __name__ == '__main__':
    for name, (duration, notes, peak) in PRESETS.items():
        write_wav(name + '.wav', render(duration, notes, peak))
        with wave.open(os.path.join(OUT_DIRS[0], name + '.wav'), 'rb') as wav:
            pcm = struct.unpack('<%dh' % wav.getnframes(), wav.readframes(wav.getnframes()))
            assert wav.getframerate() == SR and wav.getnchannels() == 1
            assert max(map(abs, pcm)) < 32767 and pcm[0] == pcm[-1] == 0
        print(f'{name}.wav: {duration:.2f}s, peak {peak:.2f}, PCM verified')
