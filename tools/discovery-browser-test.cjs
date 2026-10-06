const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dir = path.join(__dirname, 'snapshots/discovery');
fs.mkdirSync(dir, { recursive: true });

const access = `window.discoveryTest = {
  daily() {
    const before = JSON.stringify(campaign.stars);
    dailyRecords = {}; localStorage.setItem(STORE.rewardShield, '1');
    startDailyFlight(); const fairStart = shields === 0 && localStorage.getItem(STORE.rewardShield) === '1';
    const seed1 = seed; runCrystals = 20; gatesPassed = 6; dist = 1150; stageWin();
    const bonus1 = runBonus, key = campaign.cfg.dailyKey;
    startDailyFlight(); runCrystals = 20; gatesPassed = 6; dist = 1150; stageWin();
    return { fairStart, sameSeed: seed1 === seed, bonus1, bonus2: runBonus,
      unchanged: before === JSON.stringify(campaign.stars), dailyWon: dailyRecords[key].won,
      uniqueDays: flightStats.days.filter(d => d === key).length };
  },
  ghost() {
    startStage(0,0); ghostFrames = [[0,0,0],[.1,3,.1],[.2,6,.2]];
    runCrystals = 20; gatesPassed = 6; dist = 720; stageWin();
    startStage(0,0); const loaded = !!rivalGhost;
    startStage(0,1); const differentRoute = !rivalGhost;
    startEndless(); return { loaded, differentRoute, endlessClear: !rivalGhost && ghostKey === '' };
  },
  result() { startStage(0,14); runHits = 0; dist = 1140; runCrystals = 40; gatesPassed = 8; stageWin(); },
  inventory() { state = 'menu'; els.over.classList.remove('show'); els.levels.classList.remove('show'); els.menu.classList.add('show'); openInventory(); },
  finale() { startStage(1,14); awaitingFirstInput = false; dist = campaign.cfg.targetMeters * .85; worldX = dist * METERS_TO_PX; finaleAnnounced = true; shipY = centerY(worldX + shipX()); draw(0); },
  card() { return challengeCanvas().toDataURL('image/png'); },
  stopped() { state = 'menu'; stopAudio(); },
  mastery() { return { ship: ownedShips.includes('award-world'), trail: ownedTrails.includes('award-clean') }; }
  ,livery() { return !!shipLivery('shipIdle', 'award-world'); }
};`;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    for (const [name, width, height] of [['phone',390,844],['small',360,640],['landscape',844,390],['tablet',1024,768],['desktop',1440,900]]) {
      const page = await browser.newPage({ viewport:{width,height} });
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => localStorage.setItem('ucus_guide_seen_v1','1'));
      await page.route('http://localhost:8824/', async route => {
        const response = await route.fetch();
        await route.fulfill({response, body:(await response.text()).replace('  installFlightUi();', access + '\n  installFlightUi();')});
      });
      await page.goto('http://localhost:8824/', {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => [...document.images].every(i => i.complete));
      await page.waitForTimeout(1100);
      const shot = suffix => page.screenshot({path:path.join(dir,`${name}-${suffix}.png`)});
      await page.locator('#playBtn').click();
      await page.locator('#dailyRouteOpen').click();
      await shot('daily');
      const fits = await page.locator('#dailyRoutePanel .flight-sheet').evaluate(e => e.scrollWidth <= e.clientWidth + 1);
      assert.equal(fits, true, `${name} daily content width`);
      await page.locator('#dailyRouteBack').click();
      await page.locator('.stage-btn[data-stage="0"]').click();
      await shot('brief');
      await page.locator('#briefBack').click();
      assert.deepEqual(await page.evaluate(() => discoveryTest.daily()), {
        fairStart:true,sameSeed:true,bonus1:35,bonus2:0,unchanged:true,dailyWon:true,uniqueDays:1
      });
      assert.deepEqual(await page.evaluate(() => discoveryTest.ghost()), {loaded:true,differentRoute:true,endlessClear:true});
      await page.evaluate(() => discoveryTest.result());
      await page.waitForTimeout(950);
      await shot('result');
      assert.deepEqual(await page.evaluate(() => discoveryTest.mastery()),{ship:true,trail:true});
      assert.equal(await page.evaluate(() => discoveryTest.livery()), true);
      const image = await page.evaluate(() => discoveryTest.card());
      fs.writeFileSync(path.join(dir,`${name}-challenge.png`),Buffer.from(image.split(',')[1],'base64'));
      await page.evaluate(() => Object.defineProperty(navigator, 'canShare', { value: () => false, configurable: true }));
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#shareChallenge').click();
      const download = await downloadPromise;
      assert.equal(download.suggestedFilename(),'sonsuz-ucus-meydan-okuma.png');
      await page.evaluate(() => { window.sharedCard = null; window.ucusAudioBridge = { shareCard: data => { window.sharedCard = data; } }; });
      await page.locator('#shareChallenge').click();
      assert.equal(await page.evaluate(() => window.sharedCard.startsWith('data:image/png;base64,')), true);
      await page.evaluate(() => discoveryTest.inventory());
      await page.locator('#masteryList').scrollIntoViewIfNeeded(); await shot('mastery');
      await page.evaluate(() => discoveryTest.finale()); await shot('finale');
      await page.evaluate(() => discoveryTest.stopped());
      assert.deepEqual(errors, [], `${name} browser errors`);
      await page.close();
    }
    console.log('PASS: daily isolation/reward, ghost replay isolation, mastery grants, PNG download and five responsive viewports.');
  } finally { await browser.close(); }
})().catch(e => {console.error(e);process.exitCode=1;});
