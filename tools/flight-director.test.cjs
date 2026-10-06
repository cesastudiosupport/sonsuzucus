const test = require('node:test');
const assert = require('node:assert/strict');
const director = require('../app/wwwroot/game/flight-director.js');

test('all 75 routes have attainable stars, regular fuel and separated hazards', () => {
  for (let w = 0; w < 5; w++) for (let s = 0; s < 15; s++) {
    const cfg = director.config(w, s);
    const route = director.route(cfg);
    assert.deepEqual(route, director.route(cfg), 'retries must preserve the route');
    const crystals = route.filter(e => e.type === 'coins').length * 4;
    const gates = route.filter(e => e.type === 'gate').length;
    assert.ok(crystals >= cfg.crystalQuota && crystals >= (cfg.objType === 'coins' ? cfg.objTarget : 0));
    assert.ok(gates >= (cfg.objType === 'gates' ? cfg.objTarget : 0));
    const fuelStops = [0, ...route.filter(e => e.type === 'fuel').map(e => e.at), cfg.targetMeters];
    for (let i = 1; i < fuelStops.length; i++) assert.ok(fuelStops[i] - fuelStops[i - 1] <= 420);
    const hazards = route.filter(e => ['obstacle', 'laser', 'drone'].includes(e.type));
    for (let i = 1; i < hazards.length; i++) assert.ok(hazards[i].at - hazards[i - 1].at >= 190);
    assert.equal(director.stars(cfg, { crystals, gates, hits: 0 }, true), 3);
    assert.equal(director.stars(cfg, { crystals, gates, hits: 0 }, false), 0);
    assert.equal(director.stars(cfg, { crystals: 0, gates: 0, hits: 3 }, true), 1);
  }
});

test('progress and speed are bounded and early flight is forgiving', () => {
  const first = director.config(0, 0);
  assert.equal(director.route(first).some(e => ['obstacle', 'laser', 'drone'].includes(e.type)), false);
  assert.ok(director.cruise(first, 0, 0, false) < director.cruise(first, 0, 1, false));
  assert.ok(director.cruise(director.config(4, 14), 1, 1, false) <= 380);
  assert.equal(director.phase(0.95), 'SON YAKLAŞMA');
});

test('daily route is stable in UTC, rotates and has attainable objectives', () => {
  const a = director.daily(new Date('2026-09-27T00:01:00Z'));
  assert.deepEqual(a, director.daily(new Date('2026-09-27T23:59:59Z')));
  assert.notEqual(a.seed, director.daily(new Date('2026-09-28T00:00:00Z')).seed);
  for (let day = 0; day < 60; day++) {
    const cfg = director.daily(new Date(Date.UTC(2026, 8, 1 + day)));
    const route = director.route(cfg);
    assert.ok(route.filter(e => e.type === 'gate').length >= cfg.objTarget);
    assert.ok(route.filter(e => e.type === 'coins').length * 4 >= cfg.crystalQuota);
    assert.equal(cfg.finale, false);
  }
});

test('finales clear the final escape corridor and maintain speed limits', () => {
  for (let w = 0; w < 5; w++) {
    const cfg = director.config(w, 14);
    assert.equal(cfg.finale, true);
    assert.equal(director.route(cfg).filter(e => ['laser','drone','obstacle'].includes(e.type) && e.at > cfg.targetMeters * .9).length, 0);
    assert.ok(director.cruise(cfg, 1, .99, false) <= 380);
  }
});

test('environment forces are bounded and warning precedes force', () => {
  for (let w = 0; w < 5; w++) {
    for (let m = 0; m < 1500; m++) assert.ok(Math.abs(director.environment(w, m).force) <= 65);
    if (w === 1 || w === 4) {
      assert.equal(director.environment(w, 185).warning, true);
      assert.equal(director.environment(w, 185).force, 0);
      assert.equal(director.environment(w, 220).active, true);
    }
  }
});

test('mastery requires actual completion and all clean stages in one world', () => {
  assert.deepEqual(director.earned({}), []);
  assert.deepEqual(director.earned({ wins: 1 }).map(a => a.id), ['pilot']);
  const clean = Object.fromEntries(Array.from({length:15}, (_, s) => [`1-${s}`, true]));
  assert.ok(director.earned({clean}).some(a => a.id === 'master'));
  delete clean['1-7']; assert.ok(!director.earned({clean}).some(a => a.id === 'master'));
});

test('ghost interpolates normalized lanes and does not extrapolate beyond recorded flight', () => {
  assert.deepEqual(director.ghostAt([[0,0,0],[1,40,.5]], .5), { meters:20, lane:.25 });
  assert.equal(director.ghostAt([[0,0,0],[1,40,.5]], 2), null);
  assert.equal(director.ghostAt([], .5), null);
});
