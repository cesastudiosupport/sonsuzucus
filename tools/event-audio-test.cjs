const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('ucus_guide_seen_v1', '1');
      window.calls = [];
      window.nativeAudio = { sfx: kind => calls.push(kind), loop() {}, stopAll() {} };
    });
    await page.route('http://localhost:8824/', async route => {
      const response = await route.fetch();
      const access = `window.checkEventAudio = async () => {
        startStage(0, 0); soundOn = true; appVisible = true;
        window.calls = []; gates = [{ x: worldX + shipX() - 1, y: shipY, r: 60, passed: false }];
        updateGates(); const gateCalls = [...window.calls];
        window.calls = []; stageWin(); const immediateWinCalls = [...window.calls];
        await new Promise(resolve => setTimeout(resolve, 500));
        const winCalls = [...window.calls];
        const resultsVisible = els.over.classList.contains('show');
        startStage(0, 0); window.calls = []; crash();
        return { gateCalls, immediateWinCalls, winCalls, resultsVisible, crashCalls: [...window.calls] };
      };`;
      await route.fulfill({ response, body: (await response.text()).replace('  installFlightUi();', access + '\n  installFlightUi();') });
    });
    await page.goto('http://localhost:8824/', { waitUntil: 'domcontentloaded' });
    const result = await page.evaluate(() => window.checkEventAudio());
    assert.deepEqual(result.gateCalls, ['gatePass']);
    assert.deepEqual(result.winCalls, ['stageComplete']);
    assert.deepEqual(result.immediateWinCalls, []);
    assert.equal(result.resultsVisible, true);
    assert.deepEqual(result.crashCalls, ['groundCrash']);
    for (const file of ['gate_pass.wav', 'stage_complete.wav']) {
      const response = await page.request.get('http://localhost:8824/assets/audio/' + file);
      assert.equal(response.status(), 200);
      assert.equal((await response.body()).toString('ascii', 0, 4), 'RIFF');
    }
    console.log('PASS: separate gate, completion and crash events; both WAV assets load.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
