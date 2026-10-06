const { chromium } = require('playwright');
const assert = require('node:assert/strict');

// Inject test access into a preview response, never into the Android bundle.
const access = `window.flightTest = {
  simulate(w, s) {
    startStage(w, s); awaitingFirstInput = false;
    soundOn = false; hapticsOn = false; stopAudio();
    const dt = 1 / 120;
    let frames = 0, escaped = false;
    while (state === 'play' && frames++ < 20000) {
      const ahead = shipX() + speed * 1.15;
      const choices = [...gates.filter(g => !g.passed), ...pickups.filter(p => !p.got)]
        .filter(p => p.x - worldX > shipX() - 5 && p.x - worldX < ahead)
        .sort((a, b) => a.x - b.x);
      let target = choices.length ? choices[0].y : centerY(worldX + shipX() + 70);
      const danger = [...obstacles, ...drones, ...lasers].find(o => o.x - worldX > shipX() - 10 && o.x - worldX < shipX() + speed * 0.6 && Math.abs(o.y - target) < 50);
      if (danger) target = centerY(worldX + shipX()) + (danger.y < H / 2 ? 1 : -1) * 45;
      const bounds = wallBounds(); target = clamp(target, bounds.top + 24, bounds.bottom - 24);
      thrusting = shipY + vy * 0.22 > target + 2;
      tNow += dt; update(dt);
      const after = wallBounds();
      if (state === 'play' && (shipY < after.top - 0.01 || shipY > after.bottom + 0.01)) escaped = true;
    }
    return { w, s, won: campaign.won, meters: Math.floor(dist), hp, fuel: Math.round(fuel), crystals: runCrystals, gates: gatesPassed, stars: campaign.lastStars, frames, escaped };
  },
  boundary() {
    startStage(0, 0); awaitingFirstInput = false; shipY = H + 400; invUntil = tNow + 100;
    update(1/60); const bottom = shipY <= wallBounds().bottom;
    shipY = -400; update(1/60); return bottom && shipY >= wallBounds().top;
  },
  lockedNext() {
    campaign.stars = {}; return stageAfter(stageConfig(0, 14)) === null;
  },
  mission() {
    startStage(0, 0); awaitingFirstInput = false; gatesPassed = campaign.cfg.objTarget;
    tNow += 1/60; update(1/60);
    const saved = mission; tNow += 1/60; update(1/60);
    return {same: saved === mission, completed: mission.completed, count: missionsDone, crystals: runCrystals, coins: runCoins};
  }
};`;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const [width, height] of [[390, 844], [844, 390]]) {
      const page = await browser.newPage({ viewport: { width, height } });
      await page.route('http://localhost:8824/', async route => {
        const response = await route.fetch();
        await route.fulfill({ response, body: (await response.text()).replace('  installFlightUi();', access + '\n  installFlightUi();') });
      });
      await page.goto('http://localhost:8824', { waitUntil: 'domcontentloaded' });
      assert.equal(await page.evaluate(() => flightTest.boundary()), true, 'both walls clamp during invulnerability');
      assert.equal(await page.evaluate(() => flightTest.lockedNext()), true, 'no bypass into a locked world');
      const mission = await page.evaluate(() => flightTest.mission());
      assert.equal(mission.same && mission.completed && mission.count === 1 && mission.crystals === 0 && mission.coins > 0, true, 'stable mission and separated bonus accounting');
      const results = await page.evaluate(() => {
        const results = [];
        for (let w = 0; w < 5; w++) for (const s of [0, 7, 14]) results.push(flightTest.simulate(w, s));
        return results;
      });
      console.log(`${width}x${height}`, JSON.stringify(results));
      assert.ok(results.every(r => !r.escaped), 'ship never leaves hard boundaries');
      assert.ok(results.every(r => r.won), 'a feedback controller can finish representative routes without cheats');
      await page.close();
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
