const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.resolve(__dirname, 'snapshots/flight-upgrade');
fs.mkdirSync(dir, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const errors = [];
  const failures = [];
  const shots = [];
  try {
    for (const [name, width, height] of [['phone', 390, 844], ['small-phone', 360, 640], ['landscape', 844, 390], ['tablet', 1024, 768], ['desktop', 1440, 900]]) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      page.on('pageerror', e => errors.push(`${name}: ${e.stack}`));
      page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) failures.push(`${r.status()} ${r.url()}`); });
      await page.addInitScript(() => { localStorage.setItem('ucus_guide_seen_v1', '1'); });
      await page.goto('http://localhost:8824', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.getElementById('launchCue') && [...document.images].every(img => img.complete));
      await page.waitForTimeout(350);
      if (await page.locator('#guide').evaluate(e => e.classList.contains('show'))) await page.locator('#guideOk').click();
      const shot = async suffix => { const file = path.join(dir, `${name}-${suffix}.png`); await page.screenshot({ path: file }); shots.push(file); };
      await shot('menu');
      await page.locator('#playBtn').click();
      await page.locator('.stage-btn[data-stage="0"]').click();
      assert.equal(await page.locator('#stageBrief').evaluate(e => e.classList.contains('show')), true);
      await shot('brief');
      await page.locator('#briefLaunch').click();
      const command = async (cmd, data = {}) => page.evaluate(({cmd, data}) => {
        Object.assign(document.documentElement.dataset, data, { ucusCmd: cmd });
        document.dispatchEvent(new Event('ucus:dev'));
        return cmd === 'report' ? JSON.parse(document.documentElement.dataset.ucusReport) : null;
      }, { cmd, data });
      await page.waitForTimeout(300);
      let report = await command('report');
      assert.equal(report.dist, 0, 'no motion before first input');
      assert.equal(report.fuel, 100);
      assert.equal(report.shipY, height / 2);
      const canvas = await page.locator('#cv').evaluate(c => {
        const bytes = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let bright = 0, opaque = 0;
        for (let i = 0; i < bytes.length; i += 16) { if (bytes[i] + bytes[i + 1] + bytes[i + 2] > 80) bright++; if (bytes[i + 3]) opaque++; }
        return { bright, opaque };
      });
      assert.ok(canvas.bright > 500 && canvas.opaque > 10000, 'canvas must render real scenery');
      await shot('flight');
      await page.mouse.move(width * 0.65, height * 0.55);
      await page.mouse.down();
      await page.waitForTimeout(200);
      await page.mouse.up();
      await page.locator('#pauseFlight').click();
      report = await command('report');
      assert.equal(report.state, 'paused');
      const pausedTime = report.tNow;
      await page.waitForTimeout(250);
      assert.equal((await command('report')).tNow, pausedTime, 'pause freezes timers');
      await shot('pause');
      await page.locator('#resumeFlight').click();
      await page.evaluate(() => window.ucusAppPause());
      assert.equal((await command('report')).state, 'paused');
      await page.evaluate(() => window.ucusAppResume());
      assert.equal((await command('report')).state, 'paused', 'foreground must not silently resume');
      await page.locator('#resumeFlight').click();
      await page.setViewportSize({ width: height, height: width });
      await page.waitForTimeout(60);
      const rotated = await command('report');
      assert.ok(rotated.shipY >= rotated.bounds.top && rotated.shipY <= rotated.bounds.bottom, 'rotation preserves hard boundaries');
      await page.setViewportSize({ width, height });
      await command('win');
      await page.waitForTimeout(950);
      assert.equal(await page.locator('#overTitle').innerText(), 'BÖLÜM TAMAMLANDI');
      assert.equal(await page.locator('#resultObjectives li').count(), 3);
      await shot('result');
      await page.mouse.click(width * 0.85, height * 0.8);
      assert.equal((await command('report')).state, 'over', 'canvas tap cannot restart');
      await page.locator('#retryBtn').click();
      assert.equal((await command('report')).cfg.s, 2, 'correct next stage');
      await command('lose');
      await page.waitForTimeout(950);
      assert.equal(await page.locator('#overTitle').innerText(), 'BÖLÜM BAŞARISIZ');
      await page.locator('#menu-btn').click();
      await page.locator('#levelsBack').click();
      await page.locator('#settingsOpen').click();
      await page.locator('#mix-music').fill('25');
      assert.equal(await page.locator('#mix-value-music').innerText(), '25%');
      await shot('settings');
      await page.locator('#settingsOk').click();
      if (name === 'phone') {
        for (let biome = 0; biome < 5; biome++) {
          await command('stage', { ucusStage: `${biome}-0` });
          await page.waitForTimeout(80);
          await shot(`world-${biome + 1}`);
        }
      }
      const overflow = await page.evaluate(() => [...document.querySelectorAll('button')].filter(el => {
        const r = el.getBoundingClientRect();
        return r.width && r.height && getComputedStyle(el).visibility !== 'hidden' && (el.scrollWidth > el.clientWidth + 3);
      }).map(el => el.id || el.className));
      assert.deepEqual(overflow, [], `${name}: button text overflow`);
      await page.close();
      console.log(`PASS ${name} (${width}x${height}): launch, pause, background, results, progression, mixer, canvas`);
    }
    const native = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await native.addInitScript(() => {
      localStorage.setItem('ucus_guide_seen_v1', '1');
      window.audioCalls = [];
      window.nativeAudio = {
        sfx: (kind, volume) => audioCalls.push({ kind, volume, type: 'sfx' }),
        loop: (kind, command, volume) => audioCalls.push({ kind, command, volume, type: 'loop' }),
        stopAll: () => audioCalls.push({ type: 'stop' })
      };
    });
    native.on('pageerror', e => errors.push(e.stack));
    await native.goto('http://localhost:8824', { waitUntil: 'domcontentloaded' });
    await native.locator('#endlessOpen').click();
    await native.mouse.move(260, 420); await native.mouse.down();
    await native.waitForTimeout(200); await native.mouse.up();
    await native.waitForTimeout(650);
    const calls = await native.evaluate(() => audioCalls);
    assert.ok(calls.some(c => c.kind === 'engine_thrust' && c.volume > 0.01));
    assert.equal(calls.filter(c => c.kind === 'engine_thrust').at(-1).command, 'stop', 'coasting stops the engine loop');
    await native.evaluate(() => { window.ucusAppPause(); window.ucusAppResume(); });
    const stoppedAt = await native.evaluate(() => audioCalls.length);
    await native.waitForTimeout(200);
    assert.equal(await native.evaluate(() => audioCalls.length), stoppedAt, 'foreground does not restart paused native audio');
    assert.equal(await native.locator('#flightPause').evaluate(e => e.classList.contains('show')), true);
    await native.close();
    console.log('PASS native bridge: thrust envelope, silent coast, background stop, explicit resume');
    assert.deepEqual(errors, [], 'no JavaScript exceptions');
    assert.deepEqual(failures, [], 'all assets load');
    console.log(`Screenshots: ${shots.length}. No runtime or asset errors.`);
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
