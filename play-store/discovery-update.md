# Discovery Update - Local Preview

This is a local development APK, not a Play Store submission. Package identity and signing key are unchanged.

## Features

- Daily route in the level selector. UTC date determines route, seed and world; first completion pays 35 crystals once per date. Best scores are local, not a server leaderboard. Daily flights never unlock campaign stages or consume a saved rewarded shield.
- Optional personal-best ghost for campaign and daily routes. Samples are bounded to 2400 per flight and the ten most recent saved routes. Route version and viewport aspect distinguish records. Rotating during a flight disables that flight's replay recording. Random endless flights do not have ghosts.
- Five subtle atmospheric profiles. Thermal and storm forces have a visible warning phase, then bounded force. Ice and space have gentler inertia; emerald settles faster.
- World final stages clear the closing hazard corridor, gently increase cruise speed within the existing cap, open the camera by 3.5 percent, frame the exit and lift music volume without changing controls.
- Five cosmetic mastery rewards: first completion, clean completion, world final, three distinct daily completions, and all fifteen clean stages in one world. Ship colors tint the rendered sprite, and trail colors use the existing exhaust system. No power advantage.
- Result screen generates a 1080x1350 PNG challenge card with score, distance, crystals, route/date and stars. Android opens the system share sheet; browsers use file sharing or PNG download. Native input size is bounded, the filename is fixed and output stays in app cache.
- Success audio begins with the result stars, rather than at the earlier flight-completion instant.
- Tablet result layout repaired to prevent overlapping controls.

## Validation

- `node --test tools/flight-director.test.cjs`: seven tests including all 75 campaign routes, 60 daily dates, force bounds, achievement criteria and ghost interpolation.
- `tools/flight-simulation-test.cjs`: 30 completed flights across portrait and landscape; hard tunnel bounds preserved.
- `tools/discovery-browser-test.cjs`: daily state isolation and one-time reward, replay isolation, cosmetic grants, native-share bridge mock, PNG download and five viewport sizes.
- `tools/flight-browser-test.cjs`: launch, pause, backgrounding, rotation, results, next-stage controls, audio mixer and rendered canvas across five viewports.
- `tools/event-audio-test.cjs`: success waits for visible results and remains separate from gate/crash sounds.

## Remaining Device Checks

No Android device was connected during this update. Verify system sharing, final-stage camera comfort, touch latency and headphone audio on a real device before publishing. Existing AndroidX dependency-range warnings remain.

There is no online account, remote leaderboard, anti-cheat service or verified competition in this update. Daily routes depend on the device date. Frame rate, viewport and local clock can affect comparison; shared cards are personal results, not verified records.
