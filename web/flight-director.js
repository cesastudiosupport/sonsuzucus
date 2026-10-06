(function (root) {
  'use strict';

  const names = ['İlk Işık', 'Kristal İz', 'Sessiz Geçit', 'Dar Koridor', 'Ufuk',
    'Yankı', 'Akıntı', 'Keskin Dönüş', 'İkili Geçit', 'Derinlik',
    'Nabız', 'Yörünge', 'Son Sektör', 'Eşik', 'Çıkış Rotası'];
  const worldNames = ['Buz Mağarası', 'Lav Mağarası', 'Derin Uzay', 'Zümrüt Geçit', 'Kızıl Fırtına'];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function config(world, stage) {
    const global = world * 15 + stage;
    const t = global / 74;
    const targetMeters = 720 + world * 190 + stage * 30;
    const sectionCount = Math.floor((targetMeters - 180) / 100);
    const objType = stage % 3 === 1 ? 'coins' : 'gates';
    const objTarget = objType === 'coins' ? Math.max(6, sectionCount) : Math.max(2, Math.floor(sectionCount * 0.4));
    return {
      world, stage, global, biome: world, name: names[stage], worldName: worldNames[world],
      targetMeters, crystalQuota: Math.max(6, sectionCount),
      diffBase: 0.035 + t * 0.55, diffRamp: 0.1 + stage / 140,
      objType, objTarget,
      objLabel: objType === 'coins' ? `${objTarget} kristal topla` : `${objTarget} kapıdan geç`,
      seed: 1709 + global * 7919,
      cruise: 255 + world * 24 + stage * 3,
      reward: 12 + world * 5 + Math.floor(stage / 3) * 2,
      finale: stage === 14
    };
  }

  // World-space encounters make retries learnable and keep objectives attainable.
  function route(cfg) {
    const events = [];
    let serial = 0;
    const add = (at, type, lane = 0, extra = {}) => events.push({ at, type, lane, id: serial++, ...extra });
    add(54, 'coins', 0);
    add(94, 'fuel', 0);
    for (let at = 150, section = 0; at < cfg.targetMeters - 70; at += 100, section++) {
      const amplitude = 0.24 + cfg.world * 0.06 + cfg.stage * 0.012;
      const shape = (cfg.stage + (cfg.dailyOffset || 0)) % 3;
      const lane = (shape === 0 ? Math.sin(section * 1.7 + cfg.world * 0.6)
        : shape === 1 ? Math.sin(section * 0.85 + 0.4)
        : (section % 2 === 0 ? 1 : -1)) * amplitude;
      const recovery = section % 4 === 3;
      add(at, recovery ? 'fuel' : 'gate', recovery ? 0 : lane);
      add(at + 23, 'coins', recovery ? 0 : lane);
      if (!recovery && cfg.global >= 2 && section % 2 === 1 && !(cfg.finale && at > cfg.targetMeters * .82)) {
        const type = cfg.world >= 2 && section % 6 === 5 ? 'laser'
          : cfg.world >= 1 && section % 4 === 1 ? 'drone' : 'obstacle';
        add(at + 55, type, -Math.sign(lane || 1) * 0.52);
      }
      if (recovery && cfg.global >= 5 && section % 8 === 7) add(at + 48, 'shield', 0);
    }
    const lastFuel = Math.max(...events.filter(e => e.type === 'fuel').map(e => e.at));
    if (cfg.targetMeters - lastFuel > 400) add(cfg.targetMeters - 85, 'fuel', 0);
    return events.filter(e => e.at < cfg.targetMeters - 30).sort((a, b) => a.at - b.at || a.id - b.id);
  }

  function phase(progress) {
    if (progress < 0.15) return 'KALKIŞ';
    if (progress > 0.88) return 'SON YAKLAŞMA';
    return Math.floor(progress * 8) % 4 === 3 ? 'AÇIK KORİDOR' : 'SEYİR';
  }

  function stars(cfg, stats, won) {
    if (!won) return 0;
    const objective = (cfg.objType === 'coins' ? stats.crystals : stats.gates) >= cfg.objTarget;
    return 1 + (stats.crystals >= cfg.crystalQuota ? 1 : 0) + (objective && stats.hits <= 1 ? 1 : 0);
  }

  function cruise(cfg, difficulty, progress, landscape) {
    const base = cfg ? cfg.cruise : 270 + difficulty * 130;
    const intro = 0.82 + 0.18 * clamp(progress / 0.16, 0, 1);
    const escape = cfg && cfg.finale ? 1 + .09 * clamp((progress - .72) / .2, 0, 1) : 1;
    return Math.min(base * intro * escape, landscape ? 420 : 380);
  }

  function daily(date = new Date()) {
    const key = date.toISOString().slice(0, 10);
    const day = Math.floor(Date.parse(key + 'T00:00:00Z') / 86400000);
    const cfg = config(day % 5, 4 + day % 5);
    return { ...cfg, dailyKey: key, name: 'Günün Rotası', seed: 31013 + day * 37,
      dailyOffset: day % 3, reward: 35, finale: false, targetMeters: 1150,
      crystalQuota: 9, objType: 'gates', objTarget: 4, objLabel: '4 kapıdan geç' };
  }

  const environments = [
    { name: 'Buz süzülüşü', detail: 'Daha uzun süzülme, yumuşak motor tepkisi.', gravity: .94, lift: .96, drag: .995 },
    { name: 'Termal akım', detail: 'İşaretli sıcak bölgelerde hafif yükseliş.', gravity: 1, lift: 1, drag: .992 },
    { name: 'Düşük çekim', detail: 'Daha hafif çekim ve daha sakin yükseliş.', gravity: .88, lift: .90, drag: .994 },
    { name: 'Dengeli atmosfer', detail: 'Hızlı dengelenen, kararlı uçuş.', gravity: 1, lift: 1, drag: .988 },
    { name: 'Fırtına akımı', detail: 'İşaretli bölgelerde hafif alçaltıcı rüzgâr.', gravity: 1, lift: 1, drag: .992 }
  ];

  function environment(world, meters) {
    const profile = environments[((world % 5) + 5) % 5];
    const phase = ((meters % 260) + 260) % 260;
    const active = meters > 170 && phase >= 200 && phase < 245 && (world % 5 === 1 || world % 5 === 4);
    const warning = meters > 170 && phase >= 175 && phase < 200 && (world % 5 === 1 || world % 5 === 4);
    return { ...profile, active, warning, force: active ? (world % 5 === 1 ? -65 : 55) * Math.sin((phase - 200) / 45 * Math.PI) : 0 };
  }

  // Progress is stored separately from purchasable equipment. Rewards are cosmetic only.
  const achievements = [
    { id: 'pilot', title: 'İlk Kanat', detail: 'Bir bölümü tamamla', kind: 'ship', color: '#d9f3ff' },
    { id: 'clean', title: 'Kusursuz İz', detail: 'Bir bölümü hasarsız tamamla', kind: 'trail', color: '#90f2d1' },
    { id: 'world', title: 'Ufuk', detail: 'Bir dünyanın finalini tamamla', kind: 'ship', color: '#f3c76b' },
    { id: 'daily', title: 'Gündoğumu', detail: 'Üç farklı günlük rotayı tamamla', kind: 'trail', color: '#ffa4c4' },
    { id: 'master', title: 'Yıldız Ustası', detail: 'Bir dünyanın 15 bölümünü hasarsız tamamla', kind: 'ship', color: '#adebff' }
  ];

  function earned(stats) {
    const clean = stats.clean || {};
    return achievements.filter(a => a.id === 'pilot' ? stats.wins > 0 : a.id === 'clean' ? Object.keys(clean).length > 0
      : a.id === 'world' ? stats.finals > 0 : a.id === 'daily' ? (stats.days || []).length >= 3
      : Array.from({ length: 5 }, (_, w) => Array.from({ length: 15 }, (_, s) => clean[`${w}-${s}`]).every(Boolean)).some(Boolean));
  }

  function ghostAt(frames, time) {
    if (!Array.isArray(frames) || frames.length < 2 || time < frames[0][0] || time > frames[frames.length - 1][0]) return null;
    let lo = 0, hi = frames.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (frames[mid][0] <= time) lo = mid; else hi = mid; }
    const a = frames[lo], b = frames[hi], k = clamp((time - a[0]) / Math.max(.001, b[0] - a[0]), 0, 1);
    return { meters: a[1] + (b[1] - a[1]) * k, lane: a[2] + (b[2] - a[2]) * k };
  }

  const api = { config, route, phase, stars, cruise, daily, environment, environments, achievements, earned, ghostAt, worldCount: 5, stagesPerWorld: 15 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FlightDirector = api;
})(typeof window !== 'undefined' ? window : globalThis);
