'use strict';

// Gelistirme sirasinda hangi surumun calistigini dogrulamak icin.
// DOM'a yazilir: tarayici otomasyonu izole dunyada calistigi icin
// window global'leri disaridan gorunmez, data-* nitelikleri gorunur.
document.documentElement.dataset.ucusBuild = 'biyom-v2';

(function () {
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');

  const els = {
    stage: document.getElementById('stage'),
    dist: document.getElementById('dist'),
    score: document.getElementById('score'),
    best: document.getElementById('best'),
    coinhud: document.getElementById('coinhud'),
    biome: document.getElementById('biome'),
    missionText: document.getElementById('missionText'),
    missionFill: document.getElementById('missionFill'),
    combohud: document.getElementById('combohud'),
    fuelFill: document.getElementById('fuelFill'),
    fuelText: document.getElementById('fuelText'),
    hpFill: document.getElementById('hpFill'),
    hpText: document.getElementById('hpText'),
    boostBtn: document.getElementById('boostBtn'),
    boostText: document.getElementById('boostText'),
    banner: document.getElementById('banner'),
    flash: document.getElementById('flash'),
    menu: document.getElementById('menu'),
    guide: document.getElementById('guide'),
    levels: document.getElementById('levels'),
    soundTest: document.getElementById('soundTest'),
    overTitle: document.getElementById('overTitle'),
    retryBtn: document.getElementById('retryBtn'),
    menuBtn: document.getElementById('menu-btn'),
    stageStars: document.getElementById('stageStars'),
    stageProgress: document.getElementById('stageProgress'),
    stageProgressLabel: document.getElementById('stageProgressLabel'),
    stageProgressFill: document.getElementById('stageProgressFill'),
    stageGrid: document.getElementById('stageGrid'),
    worldName: document.getElementById('worldName'),
    worldMeta: document.getElementById('worldMeta'),
    worldPrev: document.getElementById('worldPrev'),
    worldNext: document.getElementById('worldNext'),
    settings: document.getElementById('settings'),
    privacy: document.getElementById('privacy'),
    over: document.getElementById('over'),
    final: document.getElementById('final'),
    rec: document.getElementById('rec'),
    finalScore: document.getElementById('finalScore'),
    finalCoins: document.getElementById('finalCoins'),
    finalFuel: document.getElementById('finalFuel'),
    finalShield: document.getElementById('finalShield'),
    finalMagnet: document.getElementById('finalMagnet'),
    finalBoost: document.getElementById('finalBoost'),
    finalGates: document.getElementById('finalGates'),
    finalNear: document.getElementById('finalNear'),
    finalCombo: document.getElementById('finalCombo'),
    finalMissions: document.getElementById('finalMissions'),
    finalMission: document.getElementById('finalMission'),
    finalXp: document.getElementById('finalXp'),
    finalRank: document.getElementById('finalRank'),
    rewardAdBtn: document.getElementById('rewardAdBtn'),
    finalGrade: document.getElementById('finalGrade'),
    coachText: document.getElementById('coachText'),
    runDelta: document.getElementById('runDelta'),
    menuBest: document.getElementById('menuBest'),
    menuRuns: document.getElementById('menuRuns'),
    menuMeters: document.getElementById('menuMeters'),
    dailyTitle: document.getElementById('dailyTitle'),
    dailyMeta: document.getElementById('dailyMeta'),
    dailyProgress: document.getElementById('dailyProgress'),
    dailyFill: document.getElementById('dailyFill'),
    pilotRank: document.getElementById('pilotRank'),
    pilotXp: document.getElementById('pilotXp'),
    pilotXpFill: document.getElementById('pilotXpFill'),
    stockCoins: document.getElementById('stockCoins'),
    stockFuel: document.getElementById('stockFuel'),
    stockShield: document.getElementById('stockShield'),
    stockMagnet: document.getElementById('stockMagnet'),
    stockBoost: document.getElementById('stockBoost'),
    shopShipsMeta: document.getElementById('shopShipsMeta'),
    shopTrailsMeta: document.getElementById('shopTrailsMeta'),
    settingsSound: document.getElementById('settingsSound'),
    settingsMusic: document.getElementById('settingsMusic'),
    settingsEngine: document.getElementById('settingsEngine'),
    settingsHaptic: document.getElementById('settingsHaptic'),
    settingsEffects: document.getElementById('settingsEffects'),
    settingsShake: document.getElementById('settingsShake'),
    settingsRoute: document.getElementById('settingsRoute')
  };

  const ICON = {
    coin: '\u{1F48E}',
    trophy: '\u{1F3C6}',
    shield: '\u{1F6E1}',
    magnet: '\u{1F9F2}',
    bolt: '\u26A1',
    speaker: '\u{1F50A}',
    muted: '\u{1F507}'
  };

  const BIOMES = [
    // tint: tek buz magarasi arka planinin biyom rengine ne kadar cekilecegi.
    // Buz kendi rengine yakin oldugu icin dusuk, digerleri yuksek tutulur.
    { name: 'Buz Mağarası', bg: ['#061826', '#0a1020'], wall: '#72d8ff', accent: '#d8f7ff', ship: '#ecffff', particle: '#dff4ff', drift: 24, tint: 0.32 },
    { name: 'Lav Mağarası', bg: ['#1c0806', '#110908'], wall: '#ff7842', accent: '#ffd35a', ship: '#fff0d6', particle: '#ffb14a', drift: -32, tint: 0.88 },
    { name: 'Derin Uzay', bg: ['#071519', '#030609'], wall: '#9bbbbd', accent: '#f1d698', ship: '#f2f5ef', particle: '#e3f3ed', drift: 0, tint: 0.82 },
    { name: 'Zümrüt Geçit', bg: ['#04180f', '#07130d'], wall: '#35df87', accent: '#c8ffdf', ship: '#eaffef', particle: '#9fffcf', drift: 14, tint: 0.68 },
    // Lav ile karismasin diye daha dusuk: notr tonlar gecince kizil
    // turuncudan ayrisip kendi soguk-kirmizi karakterini kazaniyor.
    { name: 'Kızıl Fırtına', bg: ['#170d14', '#09070d'], wall: '#ff5a6a', accent: '#ffd166', ship: '#fff4eb', particle: '#ff9b66', drift: 36, tint: 0.74 }
  ];

  // FlightDirector owns route pacing and attainable campaign objectives.
  const STAGES_PER_WORLD = 15;

  const WORLDS = [
    { id: 'buz', biome: 0 },
    { id: 'lav', biome: 1 },
    { id: 'uzay', biome: 2 },
    { id: 'zumrut', biome: 3 },
    { id: 'kizil', biome: 4 }
  ];

  const WORLDS_ENABLED = FlightDirector.worldCount;

  function stageCount() {
    return WORLDS_ENABLED * STAGES_PER_WORLD;
  }

  function stageKey(world, stage) {
    return world + '-' + stage;
  }

  // world: 0 tabanli dunya, stage: 0 tabanli asama (0..14)
  function stageConfig(world, stage) {
    return FlightDirector.config(world, stage);
  }

  const campaign = {
    active: false,
    cfg: null,
    stars: {},        // { "0-3": 2 }
    won: false
  };

  function loadCampaign() {
    try {
      const raw = localStorage.getItem(STORE.campaign);
      const data = raw ? JSON.parse(raw) : {};
      campaign.stars = {};
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        for (const [key, value] of Object.entries(data)) {
          if (/^[0-4]-(?:[0-9]|1[0-4])$/.test(key) && Number.isInteger(value) && value >= 1 && value <= 3) campaign.stars[key] = value;
        }
      }
    } catch (err) {
      campaign.stars = {};
    }
  }

  function saveCampaign() {
    localStorage.setItem(STORE.campaign, JSON.stringify(campaign.stars));
  }

  function starsFor(world, stage) {
    return campaign.stars[stageKey(world, stage)] || 0;
  }

  function totalStars() {
    let sum = 0;
    for (const key in campaign.stars) sum += campaign.stars[key];
    return sum;
  }

  // Bir sonraki dunyaya gecmek icin onceki dunyadan gereken yildiz.
  // Dunya basina tavan 45 (15 asama x 3). 30 = asama basina ortalama 2.
  const WORLD_STAR_GATE = 30;

  function worldStars(world) {
    let sum = 0;
    for (let s = 0; s < STAGES_PER_WORLD; s++) sum += starsFor(world, s);
    return sum;
  }

  function worldUnlocked(world) {
    if (world === 0) return true;
    if (world >= WORLDS_ENABLED) return false;
    return starsFor(world - 1, STAGES_PER_WORLD - 1) > 0 || worldStars(world - 1) >= WORLD_STAR_GATE;
  }

  // Completing the previous world unlocks the next; legacy star unlocks remain valid.
  function stageUnlocked(world, stage) {
    if (world >= WORLDS_ENABLED) return false;
    if (!worldUnlocked(world)) return false;
    if (stage === 0) return true;
    return starsFor(world, stage - 1) > 0;
  }

  function nextLockedStage() {
    for (let w = 0; w < WORLDS_ENABLED; w++) {
      for (let s = 0; s < STAGES_PER_WORLD; s++) {
        if (starsFor(w, s) === 0 && stageUnlocked(w, s)) return { world: w, stage: s };
      }
    }
    return null;
  }

  const SHIPS = [
    { id: 'def', name: 'Aurora', color: null, cost: 0 },
    { id: 'ember', name: 'Kor', color: '#ff7842', cost: 30 },
    { id: 'mint', name: 'Nane', color: '#35df87', cost: 30 },
    { id: 'gold', name: 'Altın', color: '#ffd35a', cost: 60 },
    { id: 'violet', name: 'Mor', color: '#c8a4ff', cost: 60 }
  ];

  const TRAILS = [
    { id: 'def', name: 'Biyom', color: null, cost: 0 },
    { id: 'cyan', name: 'Siyan', color: '#8fd8ff', cost: 20 },
    { id: 'gold', name: 'Altın', color: '#ffcf4d', cost: 20 },
    { id: 'pink', name: 'Pembe', color: '#ff7ae0', cost: 40 },
    { id: 'white', name: 'Beyaz', color: '#ffffff', cost: 40 }
  ];

  for (const reward of FlightDirector.achievements) {
    (reward.kind === 'ship' ? SHIPS : TRAILS).push({ id: `award-${reward.id}`, name: reward.title,
      color: reward.color, achievement: reward.id, cost: 0 });
  }

  const STORE = {
    best: 'ucus_best_score_v2',
    bestMeters: 'ucus_best',
    wallet: 'ucus_coins',
    ships: 'ucus_ships',
    trails: 'ucus_trails',
    ship: 'ucus_ship',
    trail: 'ucus_trail',
    sound: 'ucus_snd_v2',
    music: 'ucus_music_v2',
    engine: 'ucus_engine_v2',
    haptics: 'ucus_haptics_v1',
    effects: 'ucus_effects_v1',
    shake: 'ucus_shake_v1',
    route: 'ucus_route_v1',
    guide: 'ucus_guide_seen_v1',
    xp: 'ucus_xp_v1',
    rewardShield: 'ucus_reward_shield_v1',
    adBreakCounter: 'ucus_ad_break_counter_v1',
    totalRuns: 'ucus_total_runs_v1',
    lifetimeMeters: 'ucus_lifetime_meters_v1',
    dailyClaim: 'ucus_daily_claim_v1',
    inventory: 'ucus_inventory_v1',
    campaign: 'ucus_campaign_v1'
  };

  const nativeAds = window.nativeAds || {
    showBanner() {},
    hideBanner() {},
    showInterstitial() {},
    showRewarded() {
      setTimeout(() => window.ucusRewardGranted && window.ucusRewardGranted(), 300);
    }
  };

  const nativeAudio = window.nativeAudio || null;
  const nativeLoopState = {};
  let adBannerVisible = false;

  function showAdBanner() {
    if (adBannerVisible) return;
    adBannerVisible = true;
    els.stage.classList.add('ad-visible');
    nativeAds.showBanner();
  }

  function hideAdBanner() {
    if (!adBannerVisible) return;
    adBannerVisible = false;
    els.stage.classList.remove('ad-visible');
    nativeAds.hideBanner();
  }

  function maybeShowInterstitial() {
    const nextCount = readNumber(STORE.adBreakCounter, 0) + 1;
    if (nextCount < 3) {
      localStorage.setItem(STORE.adBreakCounter, nextCount);
      return;
    }

    localStorage.setItem(STORE.adBreakCounter, 0);
    setTimeout(() => {
      if (state === 'over') nativeAds.showInterstitial();
    }, 1200);
  }

  function updateRewardButton() {
    if (!els.rewardAdBtn) return;
    const rewardReady = localStorage.getItem(STORE.rewardShield) === '1';
    els.rewardAdBtn.disabled = rewardReady;
    els.rewardAdBtn.textContent = rewardReady ? 'Kalkan hazır' : 'Reklam izle · sonraki koşuya kalkan';
  }

  window.ucusRewardGranted = function () {
    localStorage.setItem(STORE.rewardShield, '1');
    updateRewardButton();
    banner('Ödül hazır: +1 kalkan', '#8fffd2');
    sfx('coin');
    haptic([18, 26]);
  };

  window.ucusRewardUnavailable = function () {
    if (!els.rewardAdBtn) return;
    els.rewardAdBtn.textContent = 'Reklam hazırlanıyor';
    setTimeout(updateRewardButton, 1400);
  };

  const METERS_TO_PX = 9;
  const BIOME_LEN = 620;
  const SHIP_R = 11;
  const BOOST_COST = 42;
  const BOOST_TIME = 4.2;
  const FUEL_MAX = 100;
  const HP_MAX = 3;
  const DAILY_REWARD = 38;
  const RANKS = [
    { name: 'Çaylak Pilot', xp: 0 },
    { name: 'Kristal Avcısı', xp: 260 },
    { name: 'Mağara Pilotu', xp: 720 },
    { name: 'Neon Usta', xp: 1450 },
    { name: 'Fırtına Kaptanı', xp: 2550 },
    { name: 'Sonsuz As', xp: 4200 }
  ];

  let W = 1;
  let H = 1;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let landscape = false;
  let rafId = null;
  let lastT = 0;
  let tNow = 0;
  let state = 'menu';

  let worldX = 0;
  let speed = 0;
  let dist = 0;
  let seed = 0;
  let shipY = 0;
  let vy = 0;
  let thrusting = false;
  let awaitingFirstInput = false;
  let pointerDownAt = 0;

  let biomeIdx = 0;
  let curBiome = BIOMES[0];
  let bestScore = readNumber(STORE.best, 0);
  let bestMeters = readNumber(STORE.bestMeters, 0);
  let wallet = readNumber(STORE.wallet, 0);
  let inventory = normalizeInventory(readObject(STORE.inventory, {}));
  let totalXp = readNumber(STORE.xp, 0);
  let totalRuns = readNumber(STORE.totalRuns, 0);
  let lifetimeMeters = readNumber(STORE.lifetimeMeters, 0);
  let runXp = 0;
  let runCoins = 0;
  let runCrystals = 0;
  let runBonus = 0;
  let routeEvents = [];
  let routeCursor = 0;
  let engineEnvelope = 0;
  let lastHudAt = -1;
  let endReason = '';
  let resultReadyAt = 0;
  let runEpoch = 0;
  let flightTime = 0;
  let ghostFrames = [];
  let rivalGhost = null;
  let ghostKey = '';
  let ghostOn = localStorage.getItem('ucus_ghost_enabled') !== '0';
  let flightStats = readObject('ucus_mastery_v1', { wins: 0, finals: 0, clean: {}, days: [] });
  let dailyRecords = readObject('ucus_daily_routes_v1', {});
  let resultSnapshot = null;
  let finaleAnnounced = false;
  let activePointer = null;
  const audioLevels = {
    effects: clamp(readNumber('ucus_mix_effects', 0.8), 0, 1),
    music: clamp(readNumber('ucus_mix_music', 0.55), 0, 1),
    engine: clamp(readNumber('ucus_mix_engine', 0.4), 0, 1)
  };
  const lastEffectAt = {};
  let runFuel = 0;
  let runShield = 0;
  let runMagnet = 0;
  let runBoostPickups = 0;
  let runScore = 0;
  let runHits = 0;
  let lowFuelSaves = 0;
  let nearMisses = 0;
  let gatesPassed = 0;
  let gatesPerfect = 0;
  let shields = 0;
  let hp = HP_MAX;
  let invUntil = 0;
  let magnetUntil = 0;
  let boost = 0;
  let boostUntil = 0;
  let multiplier = 1;
  let chain = 0;
  let bestChain = 0;
  let chainUntil = 0;
  let currentForce = 0;
  let fuel = FUEL_MAX;
  let fuelWarned = false;
  let lastMilestone = 0;
  let mission = null;
  let missionLevel = 1;
  let missionsDone = 0;

  let nextObstacleAt = 0;
  let nextOrbAt = 0;
  let nextShieldAt = 0;
  let nextMagnetAt = 0;
  let nextBoostAt = 0;
  let nextGateAt = 0;
  let nextDroneAt = 0;
  let nextLaserAt = 0;
  let nextCurrentAt = 0;
  let nextFuelAt = 0;
  let nextUtilityReadyAt = 0;

  let obstacles = [];
  let pickups = [];
  let gates = [];
  let drones = [];
  let lasers = [];
  let currents = [];
  let particles = [];
  let spriteEffects = [];
  let dust = [];
  let clouds = [];
  let ambient = [];
  let shockwaves = [];
  let shake = 0;
  let hitStopUntil = 0;
  let impactGlowUntil = 0;
  let wallReboundUntil = 0;

  let ownedShips = normalizeOwned(readArray(STORE.ships));
  let ownedTrails = normalizeOwned(readArray(STORE.trails));
  let selectedShip = localStorage.getItem(STORE.ship) || 'def';
  let selectedTrail = localStorage.getItem(STORE.trail) || 'def';
  let daily = dailyContract();

  const AC = window.AudioContext || window.webkitAudioContext;
  let soundOn = localStorage.getItem(STORE.sound) !== '0';
  let musicOn = localStorage.getItem(STORE.music) !== '0';
  let engineOn = localStorage.getItem(STORE.engine) !== '0';
  let hapticsOn = localStorage.getItem(STORE.haptics) !== '0';
  let effectsMode = localStorage.getItem(STORE.effects) || 'rich';
  let shakeOn = localStorage.getItem(STORE.shake) !== '0';
  let routeGuideOn = localStorage.getItem(STORE.route) !== '0';
  let ac = null;
  let master = null;
  let musicGain = null;
  let musicSource = null;
  let musicOscA = null;
  let musicOscB = null;
  let musicOscC = null;
  let nextMusicAt = 0;
  let engineGain = null;
  let engineIdleGain = null;
  let engineThrustGain = null;
  let engineIdleSource = null;
  let engineThrustSource = null;
  let audioPreloadPromise = null;
  let audioDecodePromise = null;
  let appVisible = true;
  let audioSuspendedByApp = false;
  const rawAudioAssets = {};
  const audioBuffers = {};
  const htmlAudio = {};
  const htmlLoopAudio = {};
  const activeHtmlEffects = new Set();
  const activeSampleSources = new Set();

  const FALLBACK_ASSETS = {
    shipIdle: 'assets/generated/ship_idle.png',
    shipThrust: 'assets/generated/ship_thrust.png',
    shipBoost: 'assets/generated/ship_boost.png',
    crystal: 'assets/generated/crystal.png',
    fuel: 'assets/generated/fuel.png',
    drone: 'assets/generated/drone.png',
    gateArc: 'assets/generated/gate_arc.png',
    shieldRing: 'assets/generated/shield_ring.png',
    boostRing: 'assets/generated/boost_ring.png',
    explosion: 'assets/generated/explosion.png',
    smokeLarge: 'assets/generated/smoke_large.png',
    smokeMedium: 'assets/generated/smoke_medium.png',
    smokeSmall: 'assets/generated/smoke_small.png',
    parallaxCave: 'assets/generated/parallax_cave_1600.webp',
    parallaxSpace: 'assets/generated/deep-space-v2.png',
    parallaxLava: 'assets/generated/volcanic-cavern-v2.png',
    audioBoost: 'assets/audio/boost.wav',
    audioCoin: 'assets/audio/coin.wav',
    audioEngineIdle: 'assets/audio/engine_idle.wav',
    audioEngineThrust: 'assets/audio/engine_thrust.wav',
    audioFuel: 'assets/audio/fuel.wav',
    audioFuelWarn: 'assets/audio/fuel_warn.wav',
    audioGroundCrash: 'assets/audio/ground_crash.wav',
    audioIdleDown: 'assets/audio/idle_down.wav',
    audioLaunch: 'assets/audio/launch.wav',
    audioMagnet: 'assets/audio/magnet.wav',
    audioMusicLoop: 'assets/audio/music_arcade_loop.wav',
    audioPerfect: 'assets/audio/perfect.wav',
    audioGatePass: 'assets/audio/gate_pass.wav',
    audioStageComplete: 'assets/audio/stage_complete.wav',
    audioShield: 'assets/audio/shield.wav',
    audioTap: 'assets/audio/tap.wav',
    audioThrustOn: 'assets/audio/thrust_on.wav',
    audioWallHit: 'assets/audio/wall_hit.wav',
    audioWarn: 'assets/audio/warn.wav'
  };
  const ASSET_SOURCES = window.UCUS_ASSETS || FALLBACK_ASSETS;
  const gameAssets = {};
  const AUDIO_KEYS = [
    'audioBoost',
    'audioCoin',
    'audioEngineIdle',
    'audioEngineThrust',
    'audioFuel',
    'audioFuelWarn',
    'audioGroundCrash',
    'audioIdleDown',
    'audioLaunch',
    'audioMagnet',
    'audioMusicLoop',
    'audioPerfect',
    'audioGatePass',
    'audioStageComplete',
    'audioShield',
    'audioTap',
    'audioThrustOn',
    'audioWallHit',
    'audioWarn'
  ];
  const SAMPLE_SFX = {
    tap: { key: 'audioTap', gain: 0.38, vary: 0.015 },
    launch: { key: 'audioLaunch', gain: 0.74, vary: 0.025 },
    thrustOn: { key: 'audioThrustOn', gain: 0.58, vary: 0.02 },
    idle: { key: 'audioIdleDown', gain: 0.42, vary: 0.015 },
    coin: { key: 'audioCoin', gain: 0.62, vary: 0.035 },
    fuel: { key: 'audioFuel', gain: 0.66, vary: 0.025 },
    perfect: { key: 'audioPerfect', gain: 0.62, vary: 0.025 },
    gatePass: { key: 'audioGatePass', gain: 0.48, vary: 0.01 },
    stageComplete: { key: 'audioStageComplete', gain: 0.65 },
    near: { key: 'audioTap', gain: 0.24, rate: 1.55, vary: 0.025 },
    boost: { key: 'audioBoost', gain: 0.76, vary: 0.025 },
    shield: { key: 'audioShield', gain: 0.62, vary: 0.025 },
    magnet: { key: 'audioMagnet', gain: 0.54, vary: 0.025 },
    warn: { key: 'audioWarn', gain: 0.54, vary: 0.015 },
    fuelWarn: { key: 'audioFuelWarn', gain: 0.72, vary: 0.01 },
    wall: { key: 'audioWallHit', gain: 0.82, vary: 0.025 },
    crash: { key: 'audioGroundCrash', gain: 0.68, vary: 0.015 },
    groundCrash: { key: 'audioGroundCrash', gain: 0.78, vary: 0.015 }
  };

  function readNumber(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : ['def'];
    } catch (_) {
      return ['def'];
    }
  }

  function readObject(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === 'object' && !Array.isArray(value) ? value : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function normalizeOwned(list) {
    return Array.from(new Set(['def'].concat(list || [])));
  }

  function normalizeInventory(data) {
    return {
      coin: Math.max(0, Math.floor(Number(data && data.coin) || 0)),
      fuel: Math.max(0, Math.floor(Number(data && data.fuel) || 0)),
      shield: Math.max(0, Math.floor(Number(data && data.shield) || 0)),
      magnet: Math.max(0, Math.floor(Number(data && data.magnet) || 0)),
      boost: Math.max(0, Math.floor(Number(data && data.boost) || 0))
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smoothstep(t) {
    const x = clamp(t, 0, 1);
    return x * x * (3 - 2 * x);
  }

  function rgba(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }

  function mixHex(a, b, t) {
    const A = parseInt(a.slice(1), 16);
    const B = parseInt(b.slice(1), 16);
    const ch = s => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
    const [ar, ag, ab] = ch(A);
    const [br, bg, bb] = ch(B);
    return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
  }

  // Kenarlardan sarmalanan degerli gurultu: doku yatayda kusursuz tekrar eder.
  function makeRockTexture(size) {
    const tex = document.createElement('canvas');
    tex.width = tex.height = size;
    const g = tex.getContext('2d');
    const img = g.createImageData(size, size);
    const d = img.data;

    let seed = 20260813;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

    const octaves = [];
    for (let o = 0; o < 7; o++) {
      const n = 4 << o;
      const grid = new Float32Array(n * n);
      for (let i = 0; i < n * n; i++) grid[i] = rnd();
      octaves.push({ n, grid });
    }

    const sample = (grid, n, u, v) => {
      const fx = u * n;
      const fy = v * n;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const x0 = ((ix % n) + n) % n;
      const y0 = ((iy % n) + n) % n;
      const x1 = (x0 + 1) % n;
      const y1 = (y0 + 1) % n;
      const tx = smoothstep(fx - ix);
      const ty = smoothstep(fy - iy);
      const top = lerp(grid[y0 * n + x0], grid[y0 * n + x1], tx);
      const bot = lerp(grid[y1 * n + x0], grid[y1 * n + x1], tx);
      return lerp(top, bot, ty);
    };

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = x / size;
        const v = y / size;
        let amp = 1;
        let sum = 0;
        let norm = 0;
        for (const oc of octaves) {
          const s = sample(oc.grid, oc.n, u, v);
          // Sirtli gurultu: mutlak deger keskin kaya cizgileri ve catlaklar uretir.
          sum += (1 - Math.abs(s * 2 - 1)) * amp;
          norm += amp;
          amp *= 0.52;
        }
        let n = sum / norm;
        // Tabakalasma: gurultuyle agir burkulmus zayif katmanlar.
        // Bant agirligi dusuk tutulur, aksi halde doku agac halkasina benzer.
        const band = Math.sin((v * 5.5 + n * 5.2) * Math.PI * 2) * 0.5 + 0.5;
        n = n * 0.88 + band * 0.12;
        n = Math.pow(n, 2.1);
        const val = Math.round(12 + n * 224);
        const i = (y * size + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = val;
        d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return tex;
  }

  let rockBase = null;
  const rockCache = { key: null, tex: null, pat: null };
  const shaftCache = { key: null, tex: null };
  const parallaxCache = { key: null, tex: null };

  // Elde tek bir buz magarasi arka plani var. 'color' harmani goruntunun
  // parlaklik yapisini korur, rengini biyomdan alir: lav kizil, uzay mor olur.
  function biomeParallax(biome) {
    if (!assetReady('parallaxCave')) return null;
    if (parallaxCache.key === biome.name && parallaxCache.tex) return parallaxCache.tex;
    const src = gameAssets.parallaxCave;
    const tex = document.createElement('canvas');
    tex.width = src.naturalWidth;
    tex.height = src.naturalHeight;
    const g = tex.getContext('2d');
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = 'color';
    g.globalAlpha = biome.tint === undefined ? 0.8 : biome.tint;
    g.fillStyle = biome.wall;
    g.fillRect(0, 0, tex.width, tex.height);
    parallaxCache.key = biome.name;
    parallaxCache.tex = tex;
    return tex;
  }

  // Isik huzmesi sprite'i: iki eksende de yumusayan alfa, keskin kenar yok.
  function biomeShaft(biome) {
    if (shaftCache.key === biome.name && shaftCache.tex) return shaftCache.tex;
    const w = 64;
    const h = 256;
    const tex = document.createElement('canvas');
    tex.width = w;
    tex.height = h;
    const g = tex.getContext('2d');
    g.fillStyle = biome.accent;
    g.fillRect(0, 0, w, h);

    const edge = g.createLinearGradient(0, 0, w, 0);
    edge.addColorStop(0, 'rgba(0,0,0,0)');
    edge.addColorStop(0.5, 'rgba(0,0,0,1)');
    edge.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'destination-in';
    g.fillStyle = edge;
    g.fillRect(0, 0, w, h);

    const fade = g.createLinearGradient(0, 0, 0, h);
    fade.addColorStop(0, 'rgba(0,0,0,1)');
    fade.addColorStop(0.55, 'rgba(0,0,0,0.35)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fade;
    g.fillRect(0, 0, w, h);

    shaftCache.key = biome.name;
    shaftCache.tex = tex;
    return tex;
  }

  function biomeRock(biome) {
    if (rockCache.key === biome.name && rockCache.tex) return rockCache.tex;
    if (!rockBase) rockBase = makeRockTexture(256);
    const size = rockBase.width;
    const tex = document.createElement('canvas');
    tex.width = tex.height = size;
    const g = tex.getContext('2d');
    // Koyu taban: duvar artik siluet, arka plandan daha karanlik.
    g.fillStyle = mixHex(biome.bg[1], biome.wall, 0.17);
    g.fillRect(0, 0, size, size);
    g.globalCompositeOperation = 'overlay';
    g.drawImage(rockBase, 0, 0);
    g.globalCompositeOperation = 'source-over';
    rockCache.key = biome.name;
    rockCache.tex = tex;
    // Desen de burada uretilir: her karede createPattern cagirmak
    // gereksiz nesne ayirmasi demekti.
    rockCache.pat = ctx.createPattern(tex, 'repeat');
    return tex;
  }

  // Dengeli modda tam ekran kaplayan pahali efektler atlanir.
  // Ayar zaten vardi ama yalnizca parcacik sayisini etkiliyordu.
  function richFx() {
    return effectsMode === 'rich';
  }

  function pathRoundRect(x, y, w, h, r) {
    const rr = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
  }

  function loadGameAssets() {
    const intro = document.getElementById('flightIntro');
    const introShip = document.getElementById('introShip');
    if (intro && introShip) {
      const started = performance.now();
      let dismissed = false;
      const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        setTimeout(() => {
          intro.classList.add('intro-complete');
          intro.setAttribute('aria-hidden', 'true');
          setTimeout(() => intro.remove(), 350);
        }, Math.max(0, 650 - (performance.now() - started)));
      };
      introShip.src = ASSET_SOURCES.shipIdle;
      introShip.decode().then(dismiss, dismiss);
      setTimeout(dismiss, 3500);
    }
    for (const [key, src] of Object.entries(ASSET_SOURCES)) {
      if (AUDIO_KEYS.includes(key)) continue;
      const image = new Image();
      image.decoding = 'async';
      image.src = src;
      gameAssets[key] = image;
    }
    // Menu gemisi ayni kaynaktan beslenir: webde dosya yolu, uygulamada
    // gomulu data URL. Boylece iki ortamda da dogru sprite gorunur.
    const preview = document.getElementById('shipPreviewImg');
    if (preview && ASSET_SOURCES.shipIdle) preview.src = ASSET_SOURCES.shipIdle;
    preloadAudioAssets();
  }

  function assetReady(key) {
    const image = gameAssets[key];
    return image && image.complete && image.naturalWidth > 0;
  }

  function drawAsset(key, x, y, width, height, rotation, alpha, anchorX, anchorY) {
    if (!assetReady(key)) return false;
    const image = gameAssets[key];
    const w = width || image.naturalWidth;
    const h = height || image.naturalHeight;
    ctx.save();
    ctx.translate(x, y);
    if (rotation) ctx.rotate(rotation);
    if (alpha !== undefined) ctx.globalAlpha *= alpha;
    ctx.drawImage(image, -w * (anchorX ?? 0.5), -h * (anchorY ?? 0.5), w, h);
    ctx.restore();
    return true;
  }

  function shipColor() {
    const ship = SHIPS.find(x => x.id === selectedShip);
    return (ship && ship.color) || curBiome.ship;
  }

  function trailColor() {
    const trail = TRAILS.find(x => x.id === selectedTrail);
    return (trail && trail.color) || curBiome.accent;
  }

  function shipX() {
    return landscape ? W * 0.22 : W * 0.29;
  }

  function difficulty() {
    // Kampanyada zorluk mesafeden degil asamadan gelir: asamalar kisa
    // oldugu icin sonsuz moddaki mesafe egrisi burada anlamsiz kalirdi.
    if (campaign.active && campaign.cfg) {
      const cfg = campaign.cfg;
      const inStage = clamp(dist / Math.max(1, cfg.targetMeters), 0, 1);
      return clamp(cfg.diffBase + inStage * cfg.diffRamp, 0, 1);
    }
    return Math.min(1, dist / 2400);
  }

  function wallBounds() {
    const c = centerY(worldX + shipX());
    const g = gapHalf();
    const pad = SHIP_R * lerp(0.88, 1.08, difficulty());
    return {
      top: Math.max(SHIP_R * 1.15, c - g + pad),
      bottom: Math.min(H - SHIP_R * 1.15, c + g - pad)
    };
  }

  function clampToTunnel(rebound, forcedSide = 0) {
    const b = wallBounds();
    if (forcedSide < 0 || shipY < b.top) {
      shipY = b.top;
      if (rebound) vy = Math.max(190, Math.abs(vy) * 0.58);
      return -1;
    }
    if (forcedSide > 0 || shipY > b.bottom) {
      shipY = b.bottom;
      if (rebound) vy = -Math.max(190, Math.abs(vy) * 0.58);
      return 1;
    }
    return 0;
  }

  function scoreValue(base) {
    return Math.round(base * multiplier * (tNow < boostUntil ? 1.35 : 1));
  }

  function addScore(base) {
    runScore += scoreValue(base);
  }

  function addBoost(amount) {
    boost = clamp(boost + amount, 0, 100);
  }

  function rankFor(xp) {
    let rank = RANKS[0];
    for (const item of RANKS) {
      if (xp >= item.xp) rank = item;
      else break;
    }
    const index = RANKS.indexOf(rank);
    const next = RANKS[index + 1] || null;
    const span = next ? next.xp - rank.xp : Math.max(1, rank.xp);
    const progress = next ? clamp((xp - rank.xp) / span, 0, 1) : 1;
    return { rank, next, progress };
  }

  function dayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function seededUnit(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 100000) / 100000;
  }

  function dailyContract() {
    const key = dayKey();
    const roll = seededUnit(key);
    const pool = [
      { type: 'meters', target: 1600, title: 'Günlük Rota', label: '1600 metreye ulaş' },
      { type: 'perfect', target: 5, title: 'Usta Pilot', label: '5 kusursuz kapı geç' },
      { type: 'near', target: 12, title: 'Risk Serisi', label: '12 yakın geçiş yap' },
      { type: 'coins', target: 28, title: 'Kristal Avı', label: '28 kristal topla' },
      { type: 'gates', target: 12, title: 'Kapı Hattı', label: '12 enerji kapısından geç' }
    ];
    return { ...pool[Math.floor(roll * pool.length) % pool.length], key };
  }

  function dailyValue() {
    if (daily.type === 'meters') return dist;
    if (daily.type === 'coins') return runCoins;
    if (daily.type === 'gates') return gatesPassed;
    if (daily.type === 'near') return nearMisses;
    if (daily.type === 'perfect') return gatesPerfect;
    return 0;
  }

  function dailyDone() {
    return localStorage.getItem(STORE.dailyClaim) === daily.key;
  }

  function updateDailyHud() {
    if (!els.dailyTitle) return;
    const done = dailyDone();
    const value = state === 'play' ? dailyValue() : 0;
    const progress = done ? 1 : clamp(value / daily.target, 0, 1);
    els.dailyTitle.textContent = daily.title;
    els.dailyMeta.textContent = done ? `Tamamlandı · +${DAILY_REWARD} kristal alındı` : `${daily.label} · ödül ${DAILY_REWARD} kristal`;
    els.dailyProgress.textContent = done ? 'HAZIR' : `${Math.floor(value)}/${daily.target}`;
    els.dailyFill.style.transform = `scaleX(${progress})`;
  }

  function updateMetaHud() {
    if (els.menuBest) els.menuBest.textContent = bestScore;
    if (els.menuRuns) els.menuRuns.textContent = totalRuns;
    if (els.menuMeters) els.menuMeters.textContent = `${Math.floor(lifetimeMeters)}m`;
    updateDailyHud();
  }

  function checkDailyContract() {
    if (dailyDone() || dailyValue() < daily.target) return;
    localStorage.setItem(STORE.dailyClaim, daily.key);
    addCoins(DAILY_REWARD);
    addBoost(35);
    addScore(2400);
    bumpChain(8, 5.6);
    banner('Günlük rota tamamlandı', '#ffd166');
    burst(shipX(), shipY, '#ffd166', 54, 1.45);
    shockwaves.push({ x: shipX(), y: shipY, age: 0, life: 0.7, color: '#ffd166' });
    sfx('perfect');
    haptic([18, 34, 18]);
    updateDailyHud();
  }

  function gradeForRun(score, meters) {
    const quality = score / Math.max(1, meters * 4.2);
    if (meters >= 3000 && bestChain >= 32 && runHits <= 1) return 'S+';
    if (meters >= 2200 && quality >= 2.1 && runHits <= 2) return 'S';
    if (meters >= 1400 && quality >= 1.65) return 'A';
    if (meters >= 820 || bestChain >= 12) return 'B';
    if (meters >= 360) return 'C';
    return 'D';
  }

  function coachLine(meters) {
    if (fuel < 8 && lowFuelSaves === 0) return 'Yakıt rotalarını biraz daha erken topla; boostu son anda değil, güvenli boşlukta yak.';
    if (runHits >= 3) return 'Çarpışmalar artmış. Kapı merkezini hedefleyip yakın geçişleri sadece boş alanda zorla.';
    if (gatesPerfect < Math.max(2, gatesPassed * 0.24)) return 'Kapıların dış halkası güvenli, iç çekirdeği ise büyük skor verir. Merkez çizgisine daha erken otur.';
    if (bestChain < 10 && meters > 700) return 'Seriyi canlı tutmak için kristal çizgilerini ve kapıları aynı ritimde bağla.';
    if (meters > bestMeters * 0.92 && meters > 500) return 'Rekora çok yakınsın. İlk 600 metrede boost biriktir, ikinci biyomda harca.';
    return 'Temiz rota. Bir sonraki koşuda kusursuz kapı ve yakın geçişleri üst üste bağla.';
  }

  function updatePilotHud() {
    const info = rankFor(totalXp);
    if (els.pilotRank) els.pilotRank.textContent = info.rank.name;
    if (els.pilotXp) els.pilotXp.textContent = info.next ? `${totalXp}/${info.next.xp} XP` : `${totalXp} XP`;
    if (els.pilotXpFill) els.pilotXpFill.style.transform = `scaleX(${info.progress})`;
  }

  function bumpChain(amount, ttl) {
    chain = clamp(chain + amount, 0, 60);
    bestChain = Math.max(bestChain, Math.floor(chain));
    chainUntil = Math.max(chainUntil, tNow + (ttl || 3.8));
    if (Math.floor(chain) > 0 && Math.floor(chain) % 10 === 0) {
      banner(`Seri x${Math.floor(chain)}`, '#ffd166');
      sfx('perfect');
    }
  }

  function breakChain(reason) {
    if (chain >= 8 && reason) {
      banner(reason, '#ff5a6a');
    }
    chain = 0;
    chainUntil = 0;
  }

  function centerY(worldPx) {
    const d = difficulty();
    const x = worldPx * (landscape ? 0.00115 : 0.00145) + seed;
    const raw = H * 0.5
      + Math.sin(x) * H * (landscape ? 0.14 : 0.12)
      + Math.sin(x * 2.1 + 1.8) * H * (0.055 + d * 0.04)
      + Math.sin(x * 4.05 + 3.1) * H * (0.02 + d * 0.025);
    const safeEdge = Math.min(gapHalf() + 28, H * 0.48);
    return clamp(lerp(H * 0.5, raw, smoothstep(dist / 90)), safeEdge, H - safeEdge);
  }

  function gapHalf() {
    const d = difficulty();
    const base = clamp(H * (landscape ? 0.42 : 0.39), 156, landscape ? 236 : 290);
    const late = clamp(H * (landscape ? 0.25 : 0.205), 104, landscape ? 156 : 168);
    return Math.min(H * 0.39, lerp(base, late, smoothstep(d)));
  }

  function safeY(worldPx, margin) {
    const c = centerY(worldPx);
    const g = Math.max(44, gapHalf() - margin);
    return clamp(c + (Math.random() - 0.5) * g * 1.42, c - g, c + g);
  }

  function resize() {
    const oldH = H;
    const oldAspect = Math.round(W / H * 20);
    const rect = els.stage.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    landscape = W > H * 1.12;
    if ((state === 'play' || state === 'paused') && oldAspect !== Math.round(W / H * 20)) {
      ghostKey = ''; rivalGhost = null; ghostFrames = [];
    }
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedDust();
    if (state === 'play' || state === 'paused') {
      const scale = H / Math.max(1, oldH);
      shipY *= scale;
      for (const list of [obstacles, pickups, gates, drones, lasers, currents]) {
        for (const item of list) {
          item.y *= scale;
          if (item.baseY != null) item.baseY *= scale;
        }
      }
      clampToTunnel(false);
    } else shipY = H * 0.5;
  }

  function seedDust() {
    const count = landscape ? 78 : 58;
    dust = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      z: 0.2 + Math.random() * 1,
      r: 0.6 + Math.random() * 1.9
    }));
    const cloudCount = landscape ? 10 : 8;
    clouds = Array.from({ length: cloudCount }, () => ({
      x: Math.random() * W,
      y: H * (0.18 + Math.random() * 0.64),
      w: W * (0.18 + Math.random() * 0.2),
      h: H * (0.045 + Math.random() * 0.055),
      z: 0.18 + Math.random() * 0.28,
      a: 0.025 + Math.random() * 0.04
    }));
  }

  function pickMission(level) {
    const k = 1 + Math.min(1.65, (level - 1) * 0.18);
    const pool = [
      { type: 'meters', target: Math.round(820 * k), label: `${Math.round(820 * k)} metreye ulaş` },
      { type: 'coins', target: Math.round(16 * k), label: `${Math.round(16 * k)} kristal topla` },
      { type: 'gates', target: Math.round(5 * k), label: `${Math.round(5 * k)} enerji kapısından geç` },
      { type: 'near', target: Math.round(6 * k), label: `${Math.round(6 * k)} yakın geçiş yap` },
      { type: 'perfect', target: Math.max(2, Math.round(2.5 * k)), label: `${Math.max(2, Math.round(2.5 * k))} kusursuz kapı geçişi` }
    ];
    return { ...pool[Math.floor(Math.random() * pool.length)], completed: false, level };
  }

  function missionProgress() {
    if (!mission) return 0;
    const value = {
      meters: dist,
      coins: runCrystals,
      gates: gatesPassed,
      near: nearMisses,
      perfect: gatesPerfect
    }[mission.type] || 0;
    return clamp(value / mission.target, 0, 1);
  }

  function updateMissionHud() {
    const progress = missionProgress();
    els.missionText.textContent = mission ? `Görev ${mission.level}: ${mission.label}` : 'Görev hazırlanıyor';
    els.missionFill.style.transform = `scaleX(${progress})`;
  }

  // Sonsuz mod girisi: kampanya bayragini temizler.
  function startEndless() {
    campaign.active = false;
    campaign.cfg = null;
    start();
  }

  // Kampanya girisi. start() sonrasi biyom dunyaya sabitlenir; sirasi
  // onemli cunku start() biyomu 0'a doner.
  function startStage(world, stage) {
    if (!Number.isInteger(world) || !Number.isInteger(stage) || world < 0 || world >= WORLDS_ENABLED || stage < 0 || stage >= STAGES_PER_WORLD) return;
    campaign.active = true;
    campaign.cfg = stageConfig(world, stage);
    campaign.won = false;
    campaign.lastStars = 0;
    start();
    seed = campaign.cfg.seed;
    routeEvents = FlightDirector.route(campaign.cfg);
    setBiome(campaign.cfg.biome, true);
    // Rastgele gorev yerine asamanin kendi hedefi: mission altyapisi
    // ilerleme takibi icin oldugu gibi kullanilir.
    const cfg = campaign.cfg;
    mission = { type: cfg.objType, target: cfg.objTarget, label: cfg.objLabel, completed: false, level: cfg.global + 1 };
    updateMissionHud();
    banner(`Bölüm ${world + 1}-${stage + 1}`, curBiome.accent);
    prepareGhost();
  }

  function start() {
    runEpoch++;
    flightTime = 0;
    ghostFrames = [];
    rivalGhost = null;
    ghostKey = '';
    finaleAnnounced = false;
    state = 'play';
    document.getElementById('flightPause').classList.remove('show');
    document.getElementById('stageBrief').classList.remove('show');
    els.levels.classList.remove('show');
    els.guide.classList.remove('show');
    hideAdBanner();
    seed = Math.random() * 10000;
    worldX = 0;
    speed = landscape ? 245 : 214;
    dist = 0;
    shipY = H * 0.5;
    vy = 0;
    thrusting = false;
    awaitingFirstInput = true;
    biomeIdx = 0;
    curBiome = BIOMES[0];
    runXp = 0;
    runCoins = 0;
    runCrystals = 0;
    runBonus = 0;
    routeEvents = [];
    routeCursor = 0;
    engineEnvelope = 0;
    endReason = '';
    activePointer = null;
    lastHudAt = -1;
    hitStopUntil = 0;
    impactGlowUntil = 0;
    wallReboundUntil = 0;
    runFuel = 0;
    runShield = 0;
    runMagnet = 0;
    runBoostPickups = 0;
    runScore = 0;
    runHits = 0;
    lowFuelSaves = 0;
    nearMisses = 0;
    gatesPassed = 0;
    gatesPerfect = 0;
    const rewardShieldReady = !campaign.cfg?.dailyKey && localStorage.getItem(STORE.rewardShield) === '1';
    shields = rewardShieldReady ? 1 : 0;
    if (rewardShieldReady) localStorage.removeItem(STORE.rewardShield);
    hp = HP_MAX;
    invUntil = tNow + 2.25;
    magnetUntil = 0;
    boost = 18;
    boostUntil = 0;
    multiplier = 1;
    chain = 0;
    bestChain = 0;
    chainUntil = 0;
    currentForce = 0;
    fuel = FUEL_MAX;
    fuelWarned = false;
    lastMilestone = 0;
    missionLevel = 1;
    missionsDone = 0;
    mission = pickMission(missionLevel);

    nextObstacleAt = 230;
    nextOrbAt = 42;
    nextShieldAt = 620;
    nextMagnetAt = 820;
    nextBoostAt = 420;
    nextGateAt = 125;
    nextDroneAt = 1650;
    nextLaserAt = 2700;
    nextCurrentAt = 2150;
    nextFuelAt = 72;
    nextUtilityReadyAt = 72;

    obstacles = [];
    pickups = [];
    gates = [];
    drones = [];
    lasers = [];
    currents = [];
    particles = [];
    spriteEffects = [];
    ambient = [];
    shockwaves = [];
    shake = 0;
    lastT = 0;

    setBiome(0, true);
    updateHud();
    updateMetaHud();
    closeInventory();
    closeSettings();
    els.menu.classList.remove('show');
    els.over.classList.remove('show');
    ensureAudio();
    startMusic();
    banner('Kalkış', '#8fffd2');
    haptic(8);
  }

  // Yerel gelistirme kancasi: biyomlari elle gezip gorsel dogrulama yapmak icin.
  // Veri DOM nitelikleri uzerinden tasinir; tarayici otomasyonu izole dunyada
  // calistigi icin window global'leri paylasilmaz, DOM paylasilir.
  let devBiomeLock = false;
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    document.addEventListener('ucus:dev', () => {
      const ds = document.documentElement.dataset;
      const cmd = ds.ucusCmd || 'biome';

      if (cmd === 'biome') {
        const idx = Number(ds.ucusBiome);
        if (!Number.isFinite(idx)) return;
        // Kilit sart: oyun dongusu her karede biyomu mesafeden yeniden
        // hesapliyor ve elle secimi aninda eziyor.
        devBiomeLock = true;
        setBiome(idx, true);
        return;
      }

      if (cmd === 'stage') {
        const parts = String(ds.ucusStage || '0-0').split('-').map(Number);
        startStage(parts[0] || 0, parts[1] || 0);
        return;
      }

      // Mesafeyi ileri sar: asama sonu ve denge testleri icin.
      if (cmd === 'warp') {
        const m = Number(ds.ucusWarp);
        if (Number.isFinite(m)) worldX = m * METERS_TO_PX;
        return;
      }

      // Kare dongusu beklemeden bitis yollarini sinamak icin.
      if (cmd === 'win') {
        stageWin();
        return;
      }

      if (cmd === 'lose') {
        crash();
        return;
      }

      if (cmd === 'report') {
        ds.ucusReport = JSON.stringify({
          campaign: campaign.active,
          cfg: campaign.cfg && {
            w: campaign.cfg.world + 1,
            s: campaign.cfg.stage + 1,
            hedef: campaign.cfg.targetMeters,
            kota: campaign.cfg.crystalQuota,
            gorev: campaign.cfg.objLabel
          },
          dist: Math.floor(dist),
          coins: runCoins,
          crystals: runCrystals,
          hp, fuel, shipY, vy, speed, tNow, awaitingFirstInput,
          routeCursor, gatesPassed, runHits,
          bounds: wallBounds(),
          objects: { obstacles: obstacles.length, pickups: pickups.length, gates: gates.length, drones: drones.length, lasers: lasers.length },
          audio: { appVisible, soundOn, levels: audioLevels, engineEnvelope, loops: { ...nativeLoopState } },
          state,
          stars: campaign.stars
        });
      }
    });
  }

  function setBiome(index, silent) {
    biomeIdx = index;
    curBiome = BIOMES[index % BIOMES.length];
    els.biome.textContent = curBiome.name;
    els.biome.style.background = rgba(curBiome.wall, 0.18);
    updatePreview();
    if (!silent) {
      banner(curBiome.name, curBiome.accent);
      burst(shipX(), shipY, curBiome.accent, 36, 1.15);
      shockwaves.push({ x: shipX(), y: shipY, age: 0, life: 0.7, color: curBiome.accent });
      flash('warp');
      shake = Math.max(shake, 0.46);
      addScore(450);
      sfx('boost');
    }
  }

  function update(dt) {
    if (awaitingFirstInput) {
      shipY = lerp(shipY, H * 0.5, 0.18);
      vy = 0;
      updateParticles(dt);
      updateSpriteEffects(dt);
      updateShockwaves(dt);
      updateHud();
      return;
    }

    const d = difficulty();
    flightTime += dt;
    const boostOn = tNow < boostUntil;
    if (tNow < hitStopUntil) dt *= 0.14;

    if (chain > 0 && tNow > chainUntil) {
      chain = Math.max(0, chain - dt * 7.5);
      if (chain <= 0.1) breakChain();
    }

    const chainBonus = Math.min(0.9, chain * 0.018);
    multiplier = boostOn
      ? 2.15 + chainBonus * 0.45
      : (1 + Math.min(0.55, (gatesPassed + nearMisses) * 0.01) + chainBonus);
    const progress = campaign.active ? dist / campaign.cfg.targetMeters : dist / 800;
    const targetSpeed = FlightDirector.cruise(campaign.active ? campaign.cfg : null, d, progress, landscape);
    speed = lerp(speed, targetSpeed + (boostOn ? 42 : 0), 1 - Math.exp(-dt * 1.8));
    engineEnvelope = lerp(engineEnvelope, thrusting && fuel > 0.7 ? 1 : 0, 1 - Math.exp(-dt * 9));
    worldX += speed * dt * (boostOn ? 1.08 : 1);
    dist = worldX / METERS_TO_PX;
    runScore += (speed * dt * 0.24) * multiplier;

    // Kampanyada hedef mesafeye ulasmak asamayi bitirir.
    if (campaign.active && campaign.cfg && dist >= campaign.cfg.targetMeters) {
      stageWin();
      return;
    }

    const fuelBurn = 0.82 + (thrusting ? 3.65 : 0) + (boostOn ? 0.9 : 0) + d * 0.32;
    fuel = clamp(fuel - fuelBurn * dt, 0, FUEL_MAX);
    if (fuel < 15 && !fuelWarned) {
      fuelWarned = true;
      banner('YAKIT KRITIK', '#ff5a6a');
      sfx('fuelWarn');
      haptic(10);
    }
    if (fuel > 32) fuelWarned = false;

    const bi = Math.floor(dist / BIOME_LEN);
    // Kampanyada biyom dunyaya sabittir; mesafeye gore degismez.
    if (!devBiomeLock && !campaign.active && bi !== biomeIdx) setBiome(bi);

    const milestone = Math.floor(dist / 500);
    if (milestone > lastMilestone) {
      lastMilestone = milestone;
      addCoins(5);
      addBoost(12);
      addScore(600);
      banner(`${milestone * 500} m`, '#ffe08a');
      burst(shipX(), shipY, '#ffe08a', 22, 1.05);
      sfx('perfect');
    }

    const controlScale = clamp(H / 740, 0.52, 1.15);
    const atmosphere = FlightDirector.environment(biomeIdx, dist);
    const gravity = lerp(540, 690, d) * controlScale * atmosphere.gravity;
    const lift = lerp(-790, -880, d) * controlScale * atmosphere.lift;
    const hasFuel = fuel > 0.7;
    vy += (thrusting && hasFuel ? lift : gravity) * dt;
    if (thrusting && !hasFuel) {
      vy -= 205 * dt;
      if (Math.random() < dt * 3) spawnFuelSmoke();
    }
    if (hp <= 1 && Math.random() < dt * 1.6) spawnDamageSmoke();
    vy += (currentForce + atmosphere.force * controlScale) * dt;
    vy *= Math.pow(atmosphere.drag, dt * 60);
    vy = clamp(vy, -330 * controlScale, 365 * controlScale);
    shipY += vy * dt;

    if (thrusting) spawnTrail();

    spawnWorld();
    updateCurrents(dt);
    updateGates();
    updateObstacles();
    if (state !== 'play') return;
    updateDrones(dt);
    if (state !== 'play') return;
    updateLasers();
    if (state !== 'play') return;
    updatePickups();
    if (state !== 'play') return;
    updateParticles(dt);
    updateSpriteEffects(dt);
    updateShockwaves(dt);

    const wallSide = clampToTunnel(false);
    if (wallSide !== 0) {
      hit(wallSide);
    }
    recordGhostFrame();
    if (campaign.cfg?.finale && progress > .72 && !finaleAnnounced) {
      finaleAnnounced = true;
      banner('ÇIKIŞ KORİDORU', '#f3c76b');
      haptic(15);
    }

    if (mission && missionProgress() >= 1 && !mission.completed) {
      mission.completed = true;
      missionsDone++;
      addCoins(10 + mission.level * 3);
      addBoost(24 + mission.level * 4);
      addScore(1900 + mission.level * 380);
      bumpChain(7, 5.2);
      banner(`Görev ${mission.level} tamamlandı`, '#8fffd2');
      burst(shipX(), shipY, '#8fffd2', 40, 1.35);
      if (!campaign.active) {
        missionLevel++;
        mission = pickMission(missionLevel);
      }
    }

    checkDailyContract();

    if (shake > 0.01) shake *= Math.pow(0.05, dt);
    else shake = 0;

    updateHud();
    updateAudio();
  }

  function spawnWorld() {
    if (campaign.active) {
      spawnCampaignRoute();
      return;
    }
    const d = difficulty();
    const hazardLimit = landscape ? 3.4 : 2.6;

    if (dist >= nextObstacleAt && screenLoad() < hazardLimit) {
      spawnObstacle();
      nextObstacleAt = dist + lerp(260, 165, d) + Math.random() * lerp(92, 44, d);
    }
    while (dist >= nextOrbAt) {
      spawnOrbLine();
      nextOrbAt += 112 + Math.random() * 92;
    }
    if (dist >= nextGateAt && screenLoad() < hazardLimit + 0.45) {
      spawnGate();
      nextGateAt = dist + lerp(390, 280, d) + Math.random() * 118;
    }
    if (dist >= nextDroneAt && d > 0.34 && screenLoad() < hazardLimit) {
      spawnDrone();
      nextDroneAt = dist + lerp(980, 680, d) + Math.random() * 260;
    }
    if (dist >= nextLaserAt && d > 0.56 && screenLoad() < hazardLimit) {
      spawnLaser();
      nextLaserAt = dist + lerp(1320, 940, d) + Math.random() * 340;
    }
    if (dist >= nextCurrentAt && d > 0.46 && screenLoad() < hazardLimit + 0.6) {
      spawnCurrent();
      nextCurrentAt = dist + lerp(1180, 820, d) + Math.random() * 280;
    }
    while (dist >= nextShieldAt && canSpawnUtility()) {
      spawnPickup('shield');
      nextShieldAt += 980 + Math.random() * 450;
      nextUtilityReadyAt = dist + 130;
    }
    while (dist >= nextMagnetAt && canSpawnUtility()) {
      spawnPickup('magnet');
      nextMagnetAt += 1320 + Math.random() * 520;
      nextUtilityReadyAt = dist + 150;
    }
    while (dist >= nextBoostAt && canSpawnUtility()) {
      spawnPickup('boost');
      nextBoostAt += 720 + Math.random() * 360;
      nextUtilityReadyAt = dist + 120;
    }
    while (dist >= nextFuelAt && canSpawnUtility()) {
      spawnPickup('fuel');
      nextFuelAt += lerp(260, 330, d) + Math.random() * 86;
      nextUtilityReadyAt = dist + 92;
    }
  }

  function spawnCampaignRoute() {
    const ahead = worldX + W + 180;
    while (routeCursor < routeEvents.length && routeEvents[routeCursor].at * METERS_TO_PX < ahead) {
      const e = routeEvents[routeCursor++];
      const x = e.at * METERS_TO_PX;
      const y = clamp(centerY(x) + e.lane * gapHalf(), SHIP_R + 36, H - SHIP_R - 36);
      if (e.type === 'coins') {
        for (let i = 0; i < 4; i++) pickups.push({ type: 'coin', x: x + i * 30, y: y + Math.sin(i * 0.8) * 8, got: false });
      } else if (e.type === 'gate') {
        gates.push({ x, y, r: clamp(gapHalf() * 0.4, 42, 65), passed: false, perfect: false });
      } else if (e.type === 'obstacle') {
        obstacles.push({ x, y, r: 14 + difficulty() * 5, spin: 0.4, phase: e.id, near: false, hit: false });
      } else if (e.type === 'drone') {
        drones.push({ x, y, baseY: y, amp: 18, r: 14, phase: e.id, hit: false });
      } else if (e.type === 'laser') {
        lasers.push({ x, y, h: 8, warned: false, hit: false, phase: e.id });
      } else pickups.push({ type: e.type, x, y, got: false });
    }
  }

  function screenLoad() {
    const visible = obj => {
      const sx = obj.x - worldX;
      return sx > -80 && sx < W + 260;
    };
    return obstacles.filter(visible).length
      + gates.filter(visible).length * 0.8
      + drones.filter(visible).length * 1.2
      + lasers.filter(visible).length * 1.2
      + currents.filter(visible).length * 0.7;
  }

  function canSpawnUtility() {
    if (dist < nextUtilityReadyAt) return false;
    const visibleUtility = pickups.filter(p => p.type !== 'coin' && p.x - worldX > -40 && p.x - worldX < W + 230).length;
    return visibleUtility < 1 && screenLoad() < (landscape ? 3.8 : 3);
  }

  function spawnObstacle() {
    const x = worldX + W + 90 + Math.random() * 150;
    const d = difficulty();
    const r = lerp(10, 20, d) + Math.random() * 3;
    obstacles.push({
      x,
      y: safeY(x, r + 38),
      r,
      spin: (Math.random() - 0.5) * 1.5,
      phase: Math.random() * Math.PI * 2,
      near: false,
      hit: false
    });
  }

  function spawnOrbLine() {
    const startX = worldX + W + 74 + Math.random() * 130;
    const count = Math.random() < 0.22 ? 4 : 3;
    const y = safeY(startX, 46);
    for (let i = 0; i < count; i++) {
      pickups.push({
        type: 'coin',
        x: startX + i * 34,
        y: y + Math.sin(i * 0.9 + dist * 0.08) * 16,
        got: false
      });
    }
  }

  function spawnPickup(type) {
    const x = worldX + W + 100 + Math.random() * 170;
    pickups.push({ type, x, y: safeY(x, type === 'fuel' ? 62 : 50), got: false });
  }

  function spawnGate() {
    const x = worldX + W + 130 + Math.random() * 160;
    const cy = centerY(x);
    const radius = clamp(gapHalf() * 0.38, 38, landscape ? 60 : 68);
    gates.push({ x, y: safeY(x, radius + 32), r: radius, passed: false, perfect: false });
  }

  function spawnDrone() {
    const x = worldX + W + 140 + Math.random() * 120;
    drones.push({
      x,
      y: safeY(x, 48),
      baseY: safeY(x, 48),
      amp: 26 + Math.random() * (landscape ? 28 : 42),
      r: 13 + Math.random() * 5,
      phase: Math.random() * Math.PI * 2,
      hit: false
    });
  }

  function spawnLaser() {
    const x = worldX + W + 180;
    const y = safeY(x, 60);
    lasers.push({
      x,
      y,
      h: 8,
      warned: false,
      hit: false,
      phase: Math.random() * Math.PI * 2
    });
  }

  function spawnCurrent() {
    const x = worldX + W + 140 + Math.random() * 150;
    const y = safeY(x, 74);
    const dir = Math.random() < 0.5 ? -1 : 1;
    currents.push({
      x,
      y,
      dir,
      w: landscape ? 245 : 178,
      h: clamp(H * 0.18, 54, landscape ? 86 : 118),
      phase: Math.random() * Math.PI * 2,
      scored: false
    });
  }

  function updateCurrents(dt) {
    let targetForce = 0;
    for (const current of currents) {
      const sx = current.x - worldX;
      const insideX = shipX() > sx && shipX() < sx + current.w;
      const insideY = Math.abs(shipY - current.y) < current.h * 0.5;
      if (insideX && insideY) {
        targetForce += current.dir * lerp(230, 330, difficulty());
        if (!current.scored) {
          current.scored = true;
          addScore(320);
          addBoost(9);
          bumpChain(4, 4.4);
          banner(current.dir < 0 ? 'Yükseliş akımı' : 'Dalış akımı', current.dir < 0 ? '#8fd8ff' : '#ffd166');
          burst(shipX(), shipY, current.dir < 0 ? '#8fd8ff' : '#ffd166', 18, 0.85);
          sfx('fuel');
        }
      }
    }
    currentForce = lerp(currentForce, targetForce, 1 - Math.pow(0.08, dt));
    currents = currents.filter(c => c.x + c.w - worldX > -80);
  }

  function updateGates() {
    for (const gate of gates) {
      const sx = gate.x - worldX;
      if (!gate.passed && sx < shipX()) {
        const dy = Math.abs(shipY - gate.y);
        if (dy < gate.r * 1.13) {
          gate.passed = true;
          gatesPassed++;
          const perfect = dy < gate.r * 0.42;
          if (perfect) gatesPerfect++;
          addScore(perfect ? 980 : 560);
          addBoost(perfect ? 14 : 8);
          bumpChain(perfect ? 6 : 4, perfect ? 4.8 : 4.2);
          burst(shipX(), shipY, perfect ? '#8fffd2' : curBiome.accent, perfect ? 28 : 16, 1.1);
          sfx('gatePass');
          if (perfect) {
            banner('Kusursuz kapı', '#8fffd2');
          }
        } else {
          gate.passed = true;
          addScore(80);
          breakChain('Kapı kaçtı');
        }
      }
    }
    gates = gates.filter(g => g.x - worldX > -80);
  }

  function updateObstacles() {
    for (const obstacle of obstacles) {
      if (obstacle.hit) continue;
      const sx = obstacle.x - worldX;
      const d = Math.hypot(sx - shipX(), obstacle.y - shipY);
      const hitPad = SHIP_R * lerp(0.38, 0.62, difficulty());
      if (d < obstacle.r + hitPad) {
        obstacle.hit = true;
        hit(false);
        return;
      }
      if (!obstacle.near && Math.abs(sx - shipX()) < 15 && d < obstacle.r + 36) {
        obstacle.near = true;
        nearMisses++;
        addCoins(1);
        addBoost(7);
        addScore(260);
        bumpChain(3, 3.9);
        burst(shipX(), shipY, '#ffe08a', 8, 0.72);
        sfx('near');
      }
    }
    obstacles = obstacles.filter(o => !o.hit && o.x - worldX > -70);
  }

  function updateDrones(dt) {
    for (const drone of drones) {
      if (drone.hit) continue;
      const sx = drone.x - worldX;
      drone.y = drone.baseY + Math.sin((campaign.active ? flightTime : tNow) * 2.2 + drone.phase) * drone.amp;
      const d = Math.hypot(sx - shipX(), drone.y - shipY);
      if (d < drone.r + SHIP_R) {
        drone.hit = true;
        hit(false);
        return;
      }
      if (sx < shipX() - 20 && !drone.scored) {
        drone.scored = true;
        addScore(180);
        bumpChain(1.5, 3.4);
      }
      drone.x -= dt * 18 * difficulty();
    }
    drones = drones.filter(d => !d.hit && d.x - worldX > -70);
  }

  function updateLasers() {
    for (const laser of lasers) {
      if (laser.hit) continue;
      const sx = laser.x - worldX;
      if (!laser.warned && sx < W * 0.88) {
        laser.warned = true;
        banner('Lazer hattı', '#ff5a6a');
        sfx('warn');
      }
      if (sx > shipX() - 14 && sx < shipX() + 18 && Math.abs(shipY - laser.y) < 17) {
        laser.hit = true;
        hit(false);
        return;
      }
    }
    lasers = lasers.filter(l => !l.hit && l.x - worldX > -60);
  }

  function updatePickups() {
    const magnet = tNow < magnetUntil;
    for (const pickup of pickups) {
      if (pickup.got) continue;
      if (magnet && (pickup.type === 'coin' || pickup.type === 'fuel')) {
        const sx0 = pickup.x - worldX;
        if (sx0 > -30 && sx0 < shipX() + 260) {
          pickup.x += (worldX + shipX() - pickup.x) * 0.13;
          pickup.y += (shipY - pickup.y) * 0.13;
        }
      }
      const sx = pickup.x - worldX;
      const radius = pickup.type === 'coin' ? 25 : pickup.type === 'fuel' ? 36 : 30;
      if (Math.hypot(sx - shipX(), pickup.y - shipY) < radius) {
        pickup.got = true;
        collectPickup(pickup, sx);
      }
    }
    pickups = pickups.filter(p => !p.got && p.x - worldX > -80);
  }

  function collectPickup(pickup, sx) {
    if (pickup.type === 'coin') {
      runCrystals++;
      addCoins(1);
      addInventory('coin');
      addScore(120);
      addBoost(3);
      bumpChain(1, 3.2);
      burst(sx, pickup.y, curBiome.accent, 12, 0.9);
      sfx('coin');
      return;
    }
    if (pickup.type === 'shield') {
      runShield++;
      addInventory('shield');
      shields = Math.min(2, shields + 1);
      addScore(300);
      bumpChain(2, 3.8);
      burst(sx, pickup.y, '#8fd8ff', 18, 1.15);
      banner('Kalkan hazır', '#8fd8ff');
      sfx('shield');
      return;
    }
    if (pickup.type === 'magnet') {
      runMagnet++;
      addInventory('magnet');
      magnetUntil = tNow + 6.5;
      addScore(260);
      bumpChain(2, 3.8);
      burst(sx, pickup.y, '#ffcf4d', 18, 1.15);
      banner('Mıknatıs aktif', '#ffcf4d');
      sfx('magnet');
      return;
    }
    if (pickup.type === 'fuel') {
      runFuel++;
      addInventory('fuel');
      if (fuel < 24) lowFuelSaves++;
      fuel = clamp(fuel + 34, 0, FUEL_MAX);
      fuelWarned = false;
      addScore(220);
      bumpChain(2, 3.8);
      spriteEffect('boostRing', sx, pickup.y, 48, 0.34, 0.85, 0.4);
      burst(sx, pickup.y, '#57f0b4', 18, 1.05);
      banner('Yakıt +34', '#57f0b4');
      sfx('fuel');
      haptic([6, 18]);
      return;
    }
    addInventory('boost');
    runBoostPickups++;
    addBoost(28);
    addScore(260);
    bumpChain(3, 4);
    burst(sx, pickup.y, '#8fffd2', 22, 1.25);
    banner('Overdrive şarj', '#8fffd2');
    sfx('boost');
  }

  function triggerBoost() {
    if (state !== 'play') return;
    if (boost < BOOST_COST || tNow < boostUntil) {
      sfx('warn');
      haptic(8);
      return;
    }
    boost -= BOOST_COST;
    boostUntil = tNow + BOOST_TIME;
    invUntil = Math.max(invUntil, tNow + 0.9);
    flash('boost');
    banner('Overdrive', '#8fffd2');
    shockwaves.push({ x: shipX(), y: shipY, age: 0, life: 0.7, color: '#8fffd2' });
    spriteEffect('boostRing', shipX(), shipY, 86, 0.42, 1.35, 0.7);
    burst(shipX(), shipY, '#8fffd2', 42, 1.45);
    sfx('boost');
    haptic(22);
  }

  function addCoins(amount) {
    runCoins += amount;
    updateHud();
  }

  function addInventory(type, amount = 1) {
    if (!Object.prototype.hasOwnProperty.call(inventory, type)) return;
    inventory[type] += amount;
    localStorage.setItem(STORE.inventory, JSON.stringify(inventory));
  }

  function impactFeedback(color, severe) {
    hitStopUntil = Math.max(hitStopUntil, tNow + (severe ? 0.1 : 0.065));
    impactGlowUntil = Math.max(impactGlowUntil, tNow + (severe ? 0.58 : 0.42));
    shake = Math.max(shake, severe ? 0.94 : 0.72);
    flash('hit');
    banner(severe ? 'CARPISMA' : 'HASAR', color);
    shockwaves.push({ x: shipX(), y: shipY, age: 0, life: severe ? 0.76 : 0.58, color });
    burst(shipX(), shipY, color, severe ? 54 : 34, severe ? 1.7 : 1.25);
  }

  function hit(pushToCenter) {
    const wallSide = typeof pushToCenter === 'number' ? pushToCenter : 0;
    const wallHit = pushToCenter === true || wallSide !== 0;
    if (wallHit) {
      clampToTunnel(true, wallSide);
      wallReboundUntil = tNow + 0.24;
    }
    if (tNow < invUntil) return;
    if (shields > 0) {
      shields--;
      chain = Math.floor(chain * 0.35);
      chainUntil = tNow + 2;
      invUntil = tNow + 1.2;
      flash('warp');
      hitStopUntil = Math.max(hitStopUntil, tNow + 0.045);
      impactGlowUntil = Math.max(impactGlowUntil, tNow + 0.3);
      shake = Math.max(shake, 0.72);
      spriteEffect('shieldRing', shipX(), shipY, 76, 0.46, 0.8, 0.2);
      burst(shipX(), shipY, '#8fd8ff', 38, 1.55);
      shockwaves.push({ x: shipX(), y: shipY, age: 0, life: 0.55, color: '#8fd8ff' });
      sfx('shield');
      haptic(wallHit ? [18, 28] : 22);
      return;
    }
    hp--;
    runHits++;
    chain = Math.floor(chain * 0.25);
    chainUntil = tNow + 1.2;
    invUntil = tNow + 1.35;
    impactFeedback(hp <= 0 ? '#ff5a6a' : '#ffd166', hp <= 0 || wallHit);
    spriteEffect('explosion', shipX(), shipY, hp <= 0 ? 86 : 58, hp <= 0 ? 0.5 : 0.34, 0.45, 0.18);
    if (hp > 0) sfx(wallHit ? 'wall' : 'warn');
    haptic(hp <= 0 ? [40, 55, 70] : (wallHit ? [24, 34, 26] : [18, 28]));
    if (!wallHit) {
      vy *= -0.28;
    }
    if (hp <= 0) {
      endReason = fuel < 1 ? 'Yakıt tükendi' : wallHit ? 'Koridor sınırına çarptın' : 'Gövde hasarı';
      crash();
    }
  }

  function crash() {
    if (state !== 'play') return;
    state = 'over';
    thrusting = false;
    awaitingFirstInput = false;
    shake = 1;
    flash('hit');
    stopAudio();
    spriteEffect('explosion', shipX(), shipY, 96, 0.55, 0.6, 0.25);
    burst(shipX(), shipY, shipColor(), 54, 1.85);
    sfx('groundCrash');
    haptic([35, 45, 55]);
    finishRun(false);
  }

  // Kampanyada hedef mesafeye ulasilinca: patlama degil kutlama.
  function stageWin() {
    if (state !== 'play') return;
    state = 'over';
    thrusting = false;
    awaitingFirstInput = false;
    stopAudio();
    burst(shipX(), shipY, '#8fffd2', 48, 1.45);
    haptic([18, 26]);
    finishRun(true);
  }

  function objectiveValue(type) {
    return {
      gates: gatesPassed,
      near: nearMisses,
      perfect: gatesPerfect,
      coins: runCrystals
    }[type] || 0;
  }

  // Each bonus star is independent; wallet bonuses never count as pickups.
  function evaluateStars(cfg, won) {
    return FlightDirector.stars(cfg, { crystals: runCrystals, gates: gatesPassed, hits: runHits }, won);
  }

  // Kampanyada sonraki oynanabilir asama (ayni dunya, sonra siradaki dunya).
  function stageAfter(cfg) {
    if (cfg.dailyKey) return null;
    let w = cfg.world;
    let s = cfg.stage + 1;
    if (s >= STAGES_PER_WORLD) {
      w++;
      s = 0;
    }
    if (w >= WORLDS_ENABLED) return null;
    if (!stageUnlocked(w, s)) return null;
    return { world: w, stage: s };
  }

  // Sonuc ekraninin basligi, yildizlari ve eylem butonlari moda gore
  // degisir: sonsuz kosu ile bolum sonu ayni ekrani paylasir.
  function applyResultChrome(won) {
    const inCampaign = campaign.active && campaign.cfg;

    if (els.overTitle) {
      els.overTitle.textContent = inCampaign
        ? (won ? 'BÖLÜM TAMAMLANDI' : 'BÖLÜM BAŞARISIZ')
        : 'GÖREV BİTTİ';
      els.overTitle.classList.toggle('win', !!(inCampaign && won));
    }

    if (els.stageStars) {
      els.stageStars.classList.toggle('show', !!inCampaign);
      if (inCampaign) {
        const stars = campaign.lastStars || 0;
        els.stageStars.textContent = '';
        for (let i = 0; i < 3; i++) {
          const s = document.createElement('span');
          s.textContent = '★';
          // Sinif hemen verilir. Bir sonraki kareye birakilirsa sekme
          // arka plandayken rAF askiya alindigi icin yildizlar hic yanmaz.
          if (i < stars) s.className = 'on';
          els.stageStars.appendChild(s);
        }
      }
    }

    if (els.retryBtn) {
      const nextStage = inCampaign && won ? stageAfter(campaign.cfg) : null;
      els.retryBtn.innerHTML = inCampaign
        ? (nextStage ? '▶ Sonraki bölüm' : (won ? '▶ Bölümler' : '▶ Tekrar dene'))
        : '▶ Tekrar oyna';
      if (campaign.cfg?.dailyKey) els.retryBtn.textContent = 'Günlük rotayı tekrar oyna';
    }

    if (els.menuBtn) {
      els.menuBtn.innerHTML = inCampaign ? '🗺 Bölümler' : '🛒 Hangar';
    }
  }

  function finishRun(won) {
    const epoch = runEpoch;
    resultReadyAt = tNow + 0.85;
    if (won && campaign.active && (campaign.cfg.dailyKey ? !dailyRecords[campaign.cfg.dailyKey]?.won : starsFor(campaign.cfg.world, campaign.cfg.stage) === 0)) {
      runBonus = campaign.cfg.reward;
      addCoins(runBonus);
    }
    const meters = Math.floor(dist);
    const score = Math.round(runScore + meters * 4 + runCoins * 40 + gatesPassed * 80);
    const oldBestMeters = bestMeters;
    runXp = meters < 10 ? 0 : Math.max(8, Math.floor(score / 120 + meters / 32 + bestChain * 1.8 + missionsDone * 38));
    const oldRank = rankFor(totalXp).rank.name;
    totalXp += runXp;
    localStorage.setItem(STORE.xp, totalXp);
    const newRank = rankFor(totalXp).rank.name;
    wallet += runCoins;
    localStorage.setItem(STORE.wallet, wallet);
    totalRuns++;
    lifetimeMeters += meters;
    localStorage.setItem(STORE.totalRuns, totalRuns);
    localStorage.setItem(STORE.lifetimeMeters, lifetimeMeters);

    let line = `Rekor: ${bestScore}`;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem(STORE.best, bestScore);
      line = `${ICON.trophy} Yeni skor rekoru`;
    }
    if (meters > bestMeters) {
      bestMeters = meters;
      localStorage.setItem(STORE.bestMeters, bestMeters);
    }
    if (runCoins > 0) line += ` · ${ICON.coin} +${runCoins}`;
    line += ` · +${runXp} XP`;
    if (newRank !== oldRank) line += ` · Yeni rütbe: ${newRank}`;
    if (missionsDone > 0) line += ` · ${missionsDone} görev`;

    els.final.innerHTML = `${meters}<small>m</small>`;
    els.finalScore.textContent = score;
    if (els.finalCoins) els.finalCoins.textContent = runCoins;
    if (els.finalFuel) els.finalFuel.textContent = runFuel;
    if (els.finalShield) els.finalShield.textContent = runShield;
    if (els.finalMagnet) els.finalMagnet.textContent = runMagnet;
    if (els.finalBoost) els.finalBoost.textContent = runBoostPickups;
    els.finalGates.textContent = gatesPassed;
    els.finalNear.textContent = nearMisses;
    if (els.finalCombo) els.finalCombo.textContent = Math.floor(bestChain);
    if (els.finalMissions) els.finalMissions.textContent = missionsDone;
    els.finalMission.textContent = `${Math.round(missionProgress() * 100)}%`;
    if (els.finalXp) els.finalXp.textContent = `+${runXp}`;
    if (els.finalRank) els.finalRank.textContent = newRank;
    if (els.finalGrade) els.finalGrade.textContent = gradeForRun(score, meters);
    if (els.coachText) els.coachText.textContent = coachLine(meters);
    if (els.runDelta) {
      const delta = meters - oldBestMeters;
      els.runDelta.textContent = delta > 0 ? `Yeni mesafe rekoru: +${delta}m` : `Rekora ${Math.max(0, oldBestMeters - meters)}m kaldı`;
    }
    if (campaign.active && campaign.cfg) {
      const cfg = campaign.cfg;
      const stars = evaluateStars(cfg, won);
      campaign.won = won;
      campaign.lastStars = stars;
      const key = stageKey(cfg.world, cfg.stage);
      // Yalnizca iyilestir: daha dusuk sonuc onceki yildizi silmez.
      if (!cfg.dailyKey && stars > (campaign.stars[key] || 0)) {
        campaign.stars[key] = stars;
        saveCampaign();
      }
      const w = cfg.world + 1;
      const s = cfg.stage + 1;
      line = won
        ? `Bölüm ${w}-${s} tamamlandı`
        : `Bölüm ${w}-${s} · ${meters} / ${cfg.targetMeters} m`;
      if (cfg.dailyKey) line = `${cfg.dailyKey} · ${won ? 'Günlük rota tamamlandı' : `${meters} m`}`;
      if (runCoins > 0) line += ` · ${ICON.coin} +${runCoins}`;
    }

    completeFlightFeatures(won, score, meters);
    applyResultChrome(won);
    const resultObjectives = document.getElementById('resultObjectives');
    resultObjectives.hidden = !campaign.active;
    if (campaign.active) {
      const cfg = campaign.cfg;
      const goals = [
        [won, `${Math.min(meters, cfg.targetMeters)} / ${cfg.targetMeters} m`],
        [runCrystals >= cfg.crystalQuota, `${runCrystals} / ${cfg.crystalQuota} kristal`],
        [objectiveValue(cfg.objType) >= cfg.objTarget && runHits <= 1, `${cfg.objLabel} · en fazla 1 hasar`]
      ];
      resultObjectives.innerHTML = goals.map(([ok, label]) => `<li class="${ok && won ? 'earned' : ''}"><span>${ok && won ? '★' : '☆'}</span>${label}</li>`).join('');
      if (els.coachText) els.coachText.textContent = won
        ? (runBonus ? `İlk tamamlama ödülü: +${runBonus} kristal` : 'Daha iyi bir uçuşla eksik yıldızları tamamlayabilirsin.')
        : `${endReason || 'Uçuş sona erdi'}. Rota aynı kalır; bir sonraki denemede öğrendiklerini kullan.`;
    }

    els.rec.textContent = line;
    updatePilotHud();
    updateMetaHud();
    updateHud();
    setTimeout(() => {
      if (state === 'over' && runEpoch === epoch) {
        els.over.classList.add('show');
        if (won && campaign.active && campaign.lastStars > 0) sfx('stageComplete');
        showAdBanner();
        updateRewardButton();
        maybeShowInterstitial();
      }
    }, 420);
  }

  function updateHud() {
    els.stage.dataset.flightState = state;
    document.getElementById('launchCue').hidden = state !== 'play' || !awaitingFirstInput;
    if (state === 'play' && tNow - lastHudAt < 0.08) return;
    lastHudAt = tNow;
    const meters = Math.floor(dist);
    els.dist.textContent = meters;
    els.score.textContent = Math.round(runScore);
    els.best.textContent = bestScore;

    // Bolum ilerlemesi: yalnizca kampanya kosusunda.
    if (els.stageProgress) {
      const showBar = campaign.active && campaign.cfg && state === 'play';
      els.stageProgress.classList.toggle('show', !!showBar);
      if (showBar) {
        const cfg = campaign.cfg;
        const p = clamp(dist / Math.max(1, cfg.targetMeters), 0, 1);
        els.stageProgressLabel.textContent =
          `${cfg.world + 1}-${cfg.stage + 1} · ${FlightDirector.phase(p)} · ${Math.max(0, cfg.targetMeters - meters)} m`;
        els.stageProgressFill.style.transform = `scaleX(${p})`;
      }
    }

    const active = [];
    if (shields > 0) active.push(`${ICON.shield}${shields}`);
    if (tNow < magnetUntil) active.push(ICON.magnet);
    if (tNow < boostUntil) active.push(`${multiplier.toFixed(1)}x`);
    els.coinhud.textContent = `${runCoins}${active.length ? '  ' + active.join(' ') : ''}`;

    if (els.combohud) {
      const comboLevel = chain > 0 ? multiplier.toFixed(1) : '1.0';
      els.combohud.textContent = chain > 0 ? `SERİ ${Math.floor(chain)} · x${comboLevel}` : 'SERİ HAZIR';
      els.combohud.classList.toggle('hot', chain >= 12);
      els.combohud.classList.toggle('active', chain > 0);
    }

    if (els.fuelFill && els.fuelText) {
      const fuelPct = Math.round(fuel);
      els.fuelFill.style.transform = `scaleX(${fuel / FUEL_MAX})`;
      els.fuelText.textContent = `${fuelPct}%`;
      els.fuelFill.parentElement.parentElement.classList.toggle('low', fuel < 24);
    }

    if (els.hpFill && els.hpText) {
      els.hpFill.style.transform = `scaleX(${hp / HP_MAX})`;
      els.hpText.textContent = `${hp}/${HP_MAX}`;
      els.hpFill.parentElement.parentElement.classList.toggle('low', hp <= 1);
    }

    updateMissionHud();
    const boostPct = Math.round(boost);
    els.boostText.textContent = tNow < boostUntil ? `${Math.ceil(boostUntil - tNow)}sn` : `${boostPct}%`;
    els.boostBtn.classList.toggle('ready', boost >= BOOST_COST && state === 'play' && tNow >= boostUntil);
    els.boostBtn.classList.toggle('active', tNow < boostUntil);
  }

  function banner(text, color) {
    els.banner.textContent = text;
    els.banner.style.color = color || curBiome.accent;
    els.banner.classList.remove('show');
    void els.banner.offsetWidth;
    els.banner.classList.add('show');
  }

  function flash(kind) {
    els.flash.classList.remove('hit', 'warp', 'boost');
    void els.flash.offsetWidth;
    els.flash.classList.add(kind);
  }

  function draw(dt) {
    ctx.save();
    if (shakeOn && shake > 0.01) {
      ctx.translate((Math.random() - 0.5) * shake * 12, (Math.random() - 0.5) * shake * 12);
    }
    drawBackground(dt);
    ctx.save();
    if (campaign.cfg?.finale && finaleAnnounced && state === 'play') {
      const zoom = 1 - .035 * clamp((dist / campaign.cfg.targetMeters - .72) / .15, 0, 1);
      ctx.translate(shipX(), H / 2); ctx.scale(zoom, zoom); ctx.translate(-shipX(), -H / 2);
    }
    drawTunnel();
    drawAtmosphere();
    drawExitBeacon();
    drawRouteGuide();
    drawGates();
    drawCurrents();
    drawPickups();
    drawObstacles();
    drawDrones();
    drawLasers();
    drawSpeedLines();
    drawParticles();
    drawSpriteEffects();
    drawShockwaves();
    if (state !== 'menu') {
      drawShipLight();
      drawGhost();
      drawShip();
    }
    ctx.restore();
    drawVignette();
    drawImpactOverlay();
    drawFinaleFrame();
    ctx.restore();
  }

  function drawBackground(dt) {
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, curBiome.bg[0]);
    bg.addColorStop(1, curBiome.bg[1]);
    ctx.fillStyle = bg;
    ctx.fillRect(-24, -24, W + 48, H + 48);

    const spaceTheme = biomeIdx % BIOMES.length === 2;
    const sceneKey = spaceTheme ? 'parallaxSpace' : biomeIdx % BIOMES.length === 1 ? 'parallaxLava' : null;
    const parallax = sceneKey && assetReady(sceneKey) ? gameAssets[sceneKey] : biomeParallax(curBiome);
    if (parallax) {
      const scale = Math.max(W / parallax.width, H / parallax.height) * 1.05;
      const iw = parallax.width * scale;
      const ih = parallax.height * scale;
      const y = spaceTheme ? 0 : (H - ih) * 0.5;
      const initialOffset = spaceTheme ? clamp(iw * 0.7 - W * 0.68, 0, iw - W) : 0;
      const offset = (worldX * 0.026 + initialOffset) % iw;
      ctx.save();
      // source-over korur: 'screen' goruntunun koyu tonlarini yikayip
      // derinligi duzlestiriyordu.
      ctx.globalAlpha = sceneKey ? 1 : 0.82;
      for (let x = -offset - iw; x < W + iw; x += iw) {
        ctx.drawImage(parallax, x, y, iw, ih);
      }
      ctx.restore();
    }

    drawWorldLandmarks();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    // Dengeli modda bulutlarin yarisi cizilir. Konumlari yine de guncellenir
    // ki moda geciste sahne zipplamasin.
    const cloudStep = richFx() ? 1 : 2;
    for (let ci = 0; ci < clouds.length; ci++) {
      const c = clouds[ci];
      c.x -= (state === 'play' ? speed : 24) * c.z * dt;
      if (c.x < -c.w - 40) {
        c.x = W + Math.random() * 120;
        c.y = H * (0.18 + Math.random() * 0.64);
      }
      if (ci % cloudStep) continue;
      if (spaceTheme) continue;
      const cg = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, c.w);
      cg.addColorStop(0, rgba(curBiome.accent, c.a));
      cg.addColorStop(0.55, rgba(curBiome.particle, c.a * 0.58));
      cg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w, c.h, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Hacimsel isik huzmeleri: sert grid yerine magaraya sizan isik.
    // Tam ekran yuksekliginde screen harmanli cizimler; dengeli modda atlanir.
    if (richFx() && !spaceTheme) {
      const shaft = biomeShaft(curBiome);
      const shaftGap = landscape ? 300 : 210;
      const shaftOff = (worldX * 0.05) % shaftGap;
      const drift = W * 0.14;
      const shaftW = landscape ? 150 : 118;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.22;
      for (let x = -shaftGap + shaftOff; x < W + shaftGap; x += shaftGap) {
        ctx.save();
        // Yatayda kayan egim: huzme asagi indikce yana suzulur.
        ctx.transform(1, 0, -drift / H, 1, x, 0);
        ctx.drawImage(shaft, -shaftW * 0.5, 0, shaftW, H);
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.fillStyle = rgba(curBiome.wall, 0.55);
    for (const d of dust) {
      d.x -= (state === 'play' ? speed * dt : 20 * dt) * d.z;
      if (d.x < -6) {
        d.x = W + 6;
        d.y = Math.random() * H;
      }
      ctx.globalAlpha = 0.12 + d.z * 0.2;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (ambient.length === 0) {
      ambient = Array.from({ length: landscape ? 54 : 42 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.6 + Math.random() * 1.8,
        phase: Math.random() * 7
      }));
    }
    ctx.fillStyle = curBiome.particle;
    for (const p of ambient) {
      p.x -= (state === 'play' ? speed * 0.18 : 14) * dt;
      p.y += curBiome.drift * dt;
      if (p.x < -6) {
        p.x = W + 6;
        p.y = Math.random() * H;
      }
      if (p.y < -6) p.y = H + 6;
      if (p.y > H + 6) p.y = -6;
      ctx.globalAlpha = 0.2 + Math.abs(Math.sin(tNow * 1.8 + p.phase)) * 0.35;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  let sceneryCache = null;
  let sceneryKey = '';

  function drawWorldLandmarks() {
    const theme = biomeIdx % BIOMES.length;
    if (theme === 2) return;
    const key = `${theme}:${Math.round(W)}:${Math.round(H)}`;
    const tileWidth = Math.max(1000, Math.round(W));
    if (key !== sceneryKey) {
      sceneryKey = key;
      sceneryCache = document.createElement('canvas');
      sceneryCache.width = tileWidth;
      sceneryCache.height = Math.ceil(H);
      const g = sceneryCache.getContext('2d');
      const unit = n => { const v = Math.sin(n * 127.1 + theme * 311.7) * 43758.5453; return v - Math.floor(v); };
      if (theme === 2) {
        for (let i = 0; i < 160; i++) {
          g.fillStyle = i % 5 === 0 ? '#e9ce9a' : '#cedae5';
          g.globalAlpha = 0.16 + unit(i + 7) * 0.5;
          g.fillRect(unit(i) * tileWidth, unit(i + 17) * H, i % 9 === 0 ? 2 : 1, 1);
        }
        g.globalAlpha = 1;
        const px = Math.min(tileWidth * 0.7, W * 0.72), py = H * 0.32, r = Math.min(H * 0.16, 110);
        const planet = g.createLinearGradient(px - r, py - r, px + r, py + r);
        planet.addColorStop(0, '#c8c7b3'); planet.addColorStop(0.38, '#666d70'); planet.addColorStop(1, '#131b24');
        g.fillStyle = planet; g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.fill();
        g.save(); g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.clip();
        for (let i = 0; i < 30; i++) {
          g.strokeStyle = '#18252c30'; g.lineWidth = 2 + unit(i) * 5;
          g.beginPath(); g.ellipse(px + (unit(i + 2) - 0.5) * r * 2, py + (unit(i + 9) - 0.5) * r * 2, 4 + unit(i + 1) * 18, 3 + unit(i + 4) * 8, -0.3, 0, Math.PI * 2); g.stroke();
        }
        g.restore();
        g.strokeStyle = '#c9bca052'; g.lineWidth = 8;
        g.beginPath(); g.ellipse(px, py, r * 1.65, r * 0.36, -0.35, 0, Math.PI * 2); g.stroke();
      } else {
        const count = theme === 3 ? 21 : 15;
        for (let i = 0; i < count; i++) {
          const x = tileWidth * (i + 0.5) / count;
          const top = i % 2 === 0;
          const y = top ? -5 : H + 5;
          const h = H * (0.13 + unit(i) * 0.26) * (top ? 1 : -1);
          const width = 18 + unit(i + 2) * 52;
          const shade = g.createLinearGradient(x - width, y, x + width, y + h);
          shade.addColorStop(0, rgba(curBiome.wall, 0.03));
          shade.addColorStop(0.5, rgba(curBiome.wall, theme === 1 ? 0.16 : 0.25));
          shade.addColorStop(1, rgba(curBiome.accent, 0.055));
          g.fillStyle = shade;
          g.beginPath(); g.moveTo(x - width, y); g.lineTo(x - width * 0.46, y + h * 0.64);
          g.lineTo(x + width * 0.05, y + h); g.lineTo(x + width * 0.55, y + h * 0.5); g.lineTo(x + width, y); g.closePath(); g.fill();
          g.strokeStyle = rgba(curBiome.accent, theme === 1 ? 0.34 : 0.14); g.lineWidth = theme === 1 ? 2 : 1;
          g.beginPath(); g.moveTo(x, y); g.lineTo(x - width * 0.15, y + h * 0.6); g.lineTo(x + width * 0.05, y + h); g.stroke();
          if (theme === 4) {
            g.strokeStyle = '#edc8a222'; g.lineWidth = 14;
            g.beginPath(); g.moveTo(x - 60, H * 0.18); g.lineTo(x + 130, H * 0.82); g.stroke();
          }
        }
      }
    }
    const off = (worldX * 0.085) % tileWidth;
    ctx.drawImage(sceneryCache, -off, 0);
    ctx.drawImage(sceneryCache, tileWidth - off, 0);
  }

  function drawExitBeacon() {
    if (!campaign.active || !campaign.cfg || state === 'menu') return;
    const x = campaign.cfg.targetMeters * METERS_TO_PX - worldX + shipX();
    if (x < -80 || x > W + 160) return;
    const y = centerY(worldX + x);
    const r = gapHalf() * 0.78;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#a2efd138'; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.ellipse(0, 0, 22, r, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#d8ffef'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 0, 22, r, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#d8ffef'; ctx.font = '600 10px system-ui'; ctx.textAlign = 'center';
    ctx.fillText('ÇIKIŞ', 0, -r - 14);
    ctx.restore();
  }

  function drawTunnel() {
    const step = Math.max(10, Math.round(W / (landscape ? 52 : 36)));
    const g = gapHalf();
    const tex = biomeRock(curBiome);
    const pat = rockCache.pat;
    const scroll = ((worldX * 0.6) % tex.width + tex.width) % tex.width;

    const xs = [];
    const topEdge = [];
    const botEdge = [];
    for (let sx = -30; sx <= W + 30; sx += step) {
      const c = centerY(worldX + sx);
      xs.push(sx);
      topEdge.push(c - g);
      botEdge.push(c + g);
    }
    const last = xs.length - 1;

    // Duvar govdesi: kaya dokusu + koridordan uzaklastikca koyulasan derinlik.
    const paintWall = (edge, isTop) => {
      const outer = isTop ? -40 : H + 40;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xs[0], outer);
      for (let i = 0; i <= last; i++) ctx.lineTo(xs[i], edge[i]);
      ctx.lineTo(xs[last], outer);
      ctx.closePath();
      ctx.clip();

      ctx.save();
      ctx.translate(-scroll, 0);
      ctx.fillStyle = pat;
      ctx.fillRect(scroll - 40, -40, W + 80 + tex.width, H + 80);
      ctx.restore();

      let lo = Infinity;
      let hi = -Infinity;
      for (const y of edge) {
        if (y < lo) lo = y;
        if (y > hi) hi = y;
      }
      const near = isTop ? hi : lo;
      const far = isTop ? hi - 170 : lo + 170;
      const shade = ctx.createLinearGradient(0, far, 0, near);
      shade.addColorStop(0, rgba(curBiome.bg[1], 0.92));
      shade.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = shade;
      ctx.fillRect(-40, -40, W + 80, H + 80);
      ctx.restore();
    };

    // Kenar isigi: koridor agzi parlak, boylece duvar hacim kazanir.
    const paintRim = edge => {
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i <= last; i++) {
        if (i === 0) ctx.moveTo(xs[i], edge[i]);
        else ctx.lineTo(xs[i], edge[i]);
      }
      // Ucuz sahte bloom: genisten dara azalan uc gecis, shadowBlur yok.
      ctx.strokeStyle = rgba(curBiome.wall, 0.1);
      ctx.lineWidth = 13;
      ctx.stroke();
      ctx.strokeStyle = rgba(curBiome.wall, 0.24);
      ctx.lineWidth = 6;
      ctx.stroke();

      // Parlak cekirdek parca parca cizilir: duz neon boru yerine
      // kaya uzerinde duzensiz yakalanan isik.
      const seg = 3;
      for (let i = 0; i < last; i += seg) {
        const end = Math.min(i + seg, last);
        // Dunya konumuna bagli deterministik dalgalanma: kayarken titremez.
        const h = Math.sin((worldX + xs[i]) * 0.021) * Math.cos((worldX + xs[i]) * 0.0073);
        ctx.strokeStyle = rgba(curBiome.accent, 0.38 + Math.abs(h) * 0.58);
        ctx.lineWidth = 1.5 + Math.abs(h) * 1.4;
        ctx.beginPath();
        ctx.moveTo(xs[i], edge[i]);
        for (let k = i + 1; k <= end; k++) ctx.lineTo(xs[k], edge[k]);
        ctx.stroke();
      }
      ctx.restore();
    };

    paintWall(topEdge, true);
    paintWall(botEdge, false);
    paintRim(topEdge);
    paintRim(botEdge);
  }

  function drawRouteGuide() {
    if (!routeGuideOn) return;
    const g = gapHalf();
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let sx = -20; sx < W + 40; sx += 38) {
      const world = worldX + sx;
      const y = centerY(world);
      const phase = (world * 0.018 + tNow * 2.4) % (Math.PI * 2);
      const a = state === 'play' ? 0.16 + Math.sin(phase) * 0.05 : 0.08;
      ctx.strokeStyle = rgba(curBiome.accent, a);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sx - 9, y);
      ctx.lineTo(sx + 9, y);
      ctx.stroke();

      if (state === 'play' && sx > shipX() + 70 && sx < W - 30) {
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = curBiome.accent;
        ctx.beginPath();
        ctx.arc(sx, y, Math.min(26, g * 0.17), 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }

  // Geminin cevreye vurdugu isik havuzu: duvarlari yalar, gemiyi sahneye gomer.
  function drawShipLight() {
    // Overdrive disinda dengeli modda atlanir: genis yaricapli 'lighter'
    // harmanli radyal dolgu, zayif cihazlarda dolgu hizini yiyor.
    const boostOn = tNow < boostUntil;
    if (!richFx() && !boostOn) return;
    const x = shipX() - 6;
    const y = shipY;
    const r = boostOn ? 200 : 138;
    const tint = boostOn ? '#8fffd2' : curBiome.wall;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const lg = ctx.createRadialGradient(x, y, 2, x, y, r);
    lg.addColorStop(0, rgba(tint, boostOn ? 0.3 : 0.18));
    lg.addColorStop(0.4, rgba(tint, boostOn ? 0.1 : 0.055));
    lg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawMenuShowcase() {
    const y = H * 0.5 + Math.sin(tNow * 1.6) * 8;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 4; i++) {
      const r = 52 + i * 42 + Math.sin(tNow * 1.4 + i) * 4;
      ctx.globalAlpha = 0.12 - i * 0.018;
      ctx.strokeStyle = i % 2 ? '#ffd166' : curBiome.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(shipX(), y, r * 1.5, r * 0.56, -0.12, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // Gemi tam opak ve normal harmanla: sprite detayi korunsun.
    const oldY = shipY;
    shipY = y;
    ctx.save();
    ctx.shadowColor = rgba(curBiome.wall, 0.75);
    ctx.shadowBlur = 26;
    drawShip();
    ctx.restore();
    shipY = oldY;
  }

  function drawGates() {
    for (const gate of gates) {
      const sx = gate.x - worldX;
      if (sx < -80 || sx > W + 80) continue;
      ctx.save();
      ctx.translate(sx, gate.y);
      if (assetReady('gateArc')) {
        const gh = gate.r * 2.45;
        const gw = gh * (gameAssets.gateArc.naturalWidth / gameAssets.gateArc.naturalHeight);
        drawAsset('gateArc', gate.r * 0.46, 0, gw, gh, 0, gate.passed ? 0.22 : 0.72, 0.5, 0.5);
        drawAsset('gateArc', -gate.r * 0.46, 0, gw, gh, Math.PI, gate.passed ? 0.18 : 0.52, 0.5, 0.5);
      }
      ctx.strokeStyle = gate.passed ? rgba('#8fffd2', 0.25) : '#8fffd2';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#8fffd2';
      ctx.shadowBlur = gate.passed ? 0 : 16;
      ctx.beginPath();
      ctx.arc(0, 0, gate.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = gate.passed ? 0.15 : 0.34;
      ctx.beginPath();
      ctx.arc(0, 0, gate.r * 0.34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawCurrents() {
    for (const c of currents) {
      const sx = c.x - worldX;
      if (sx < -c.w - 40 || sx > W + 70) continue;
      const col = c.dir < 0 ? '#8fd8ff' : '#ffd166';
      const alpha = 0.16 + Math.sin(tNow * 3.4 + c.phase) * 0.035;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const grad = ctx.createLinearGradient(sx, c.y, sx + c.w, c.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.35, rgba(col, alpha));
      grad.addColorStop(0.68, rgba(col, alpha * 0.9));
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(sx, c.y - c.h * 0.5, c.w, c.h);

      ctx.strokeStyle = rgba(col, 0.32);
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const px = sx + ((i * 46 + tNow * 90) % (c.w + 46)) - 23;
        const py = c.y + Math.sin(tNow * 2.2 + i + c.phase) * c.h * 0.22;
        ctx.beginPath();
        ctx.moveTo(px - 12, py - c.dir * 8);
        ctx.lineTo(px, py + c.dir * 9);
        ctx.lineTo(px + 12, py - c.dir * 8);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawObstacles() {
    for (const o of obstacles) {
      const sx = o.x - worldX;
      if (sx < -60 || sx > W + 70) continue;
      ctx.save();
      ctx.translate(sx, o.y);
      const warn = sx > shipX() && sx < W * 0.72 ? clamp(1 - (sx - shipX()) / (W * 0.5), 0, 1) : 0;
      if (warn > 0) {
        ctx.globalAlpha = warn * 0.32;
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([5, 7]);
        ctx.beginPath();
        ctx.arc(0, 0, o.r + 14 + Math.sin(tNow * 7 + o.phase) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      }
      ctx.rotate(tNow * o.spin + o.phase);
      ctx.fillStyle = rgba(curBiome.wall, 0.96);
      ctx.strokeStyle = curBiome.accent;
      ctx.lineWidth = 2;
      ctx.shadowColor = curBiome.accent;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        const rr = o.r * (i % 2 ? 0.72 : 1.08);
        const x = Math.cos(a) * rr;
        const y = Math.sin(a) * rr;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawDrones() {
    for (const d of drones) {
      const sx = d.x - worldX;
      if (sx < -60 || sx > W + 70) continue;
      ctx.save();
      ctx.translate(sx, d.y);
      ctx.rotate(Math.sin(tNow * 2 + d.phase) * 0.35);
      if (assetReady('drone')) {
        const dh = d.r * 4.7;
        const dw = dh * (gameAssets.drone.naturalWidth / gameAssets.drone.naturalHeight);
        drawAsset('drone', 0, 0, dw, dh, 0, 1, 0.5, 0.5);
        ctx.restore();
        continue;
      }
      ctx.fillStyle = '#151b28';
      ctx.strokeStyle = '#ff5a6a';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff5a6a';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      pathRoundRect(-d.r * 1.2, -d.r * 0.65, d.r * 2.4, d.r * 1.3, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.arc(0, 0, d.r * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawLasers() {
    for (const l of lasers) {
      const sx = l.x - worldX;
      if (sx < -60 || sx > W + 80) continue;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = l.warned ? '#ff5a6a' : rgba('#ff5a6a', 0.3);
      ctx.lineWidth = l.warned ? 4 : 2;
      ctx.shadowColor = '#ff5a6a';
      ctx.shadowBlur = l.warned ? 18 : 8;
      ctx.beginPath();
      ctx.moveTo(sx, l.y - 48);
      ctx.lineTo(sx, l.y + 48);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawPickups() {
    for (const p of pickups) {
      if (p.got) continue;
      const sx = p.x - worldX;
      if (sx < -40 || sx > W + 50) continue;
      const pulse = 1 + Math.sin(tNow * 6 + p.x * 0.02) * 0.12;
      if (p.type === 'coin') {
        if (assetReady('crystal')) {
          const ch = 40 * pulse;
          const cw = ch * (gameAssets.crystal.naturalWidth / gameAssets.crystal.naturalHeight);
          drawAsset('crystal', sx, p.y, cw, ch, Math.sin(tNow * 2.4) * 0.08, 1, 0.5, 0.5);
          continue;
        }
        ctx.save();
        ctx.translate(sx, p.y);
        ctx.rotate(tNow * 2.2);
        ctx.fillStyle = curBiome.accent;
        ctx.shadowColor = curBiome.accent;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(0, -8 * pulse);
        ctx.lineTo(7 * pulse, 0);
        ctx.lineTo(0, 8 * pulse);
        ctx.lineTo(-7 * pulse, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        continue;
      }
      if (p.type === 'fuel') {
        if (assetReady('fuel')) {
          const fh = 42 * pulse;
          const fw = fh * (gameAssets.fuel.naturalWidth / gameAssets.fuel.naturalHeight);
          drawAsset('fuel', sx, p.y, fw, fh, Math.sin(tNow * 3 + p.x * 0.01) * 0.18, 1, 0.5, 0.5);
          continue;
        }
        ctx.save();
        ctx.translate(sx, p.y);
        ctx.rotate(Math.sin(tNow * 3 + p.x * 0.01) * 0.18);
        ctx.fillStyle = '#10281f';
        ctx.strokeStyle = '#57f0b4';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#57f0b4';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        pathRoundRect(-13 * pulse, -15 * pulse, 26 * pulse, 30 * pulse, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#57f0b4';
        ctx.fillRect(-6 * pulse, -19 * pulse, 12 * pulse, 5 * pulse);
        ctx.fillStyle = 'rgba(255,255,255,.78)';
        ctx.fillRect(-7 * pulse, -5 * pulse, 14 * pulse, 4 * pulse);
        ctx.fillRect(-2 * pulse, -11 * pulse, 4 * pulse, 16 * pulse);
        ctx.restore();
        continue;
      }
      const col = p.type === 'shield' ? '#8fd8ff' : p.type === 'magnet' ? '#ffcf4d' : '#8fffd2';
      ctx.save();
      ctx.translate(sx, p.y);
      ctx.strokeStyle = col;
      ctx.fillStyle = col;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = col;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(0, 0, 12 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = '800 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.type === 'shield' ? ICON.shield : p.type === 'magnet' ? ICON.magnet : ICON.bolt, 0, 0.5);
      ctx.restore();
    }
  }

  function drawSpeedLines() {
    if (state !== 'play' || speed < 320) return;
    const count = Math.min(18, Math.floor((speed - 300) / 20));
    ctx.save();
    ctx.strokeStyle = rgba(tNow < boostUntil ? '#8fffd2' : curBiome.accent, 0.45);
    ctx.lineWidth = tNow < boostUntil ? 2 : 1.4;
    ctx.globalAlpha = 0.24;
    for (let i = 0; i < count; i++) {
      const y = (i * 83 + Math.floor(worldX * 0.35)) % H;
      const x = (i * 131 + Math.floor(worldX * 0.75)) % (W + 100);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 40 - speed * 0.09, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawShip() {
    const x = shipX();
    const y = shipY;
    const angle = clamp(vy / 520, -0.48, 0.62);
    const boostOn = tNow < boostUntil;
    ctx.save();
    ctx.translate(x, y);

    if (shields > 0) {
      ctx.strokeStyle = '#8fd8ff';
      ctx.lineWidth = 2.3;
      ctx.globalAlpha = 0.5 + Math.sin(tNow * 5) * 0.18;
      ctx.shadowColor = '#8fd8ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    if (tNow < magnetUntil) {
      ctx.strokeStyle = '#ffcf4d';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.36 + Math.sin(tNow * 7) * 0.15;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 31, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    if (boostOn) {
      ctx.strokeStyle = '#8fffd2';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.35 + Math.sin(tNow * 11) * 0.12;
      ctx.beginPath();
      ctx.arc(0, 0, 38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (tNow < invUntil) ctx.globalAlpha = 0.45 + Math.abs(Math.sin(tNow * 18)) * 0.5;
    ctx.rotate(angle);

    const sc = shipColor();
    const tc = boostOn ? '#8fffd2' : trailColor();
    const hasFuel = fuel > 0.7;
    const grad = ctx.createLinearGradient(-22, -12, 28, 12);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.42, sc);
    grad.addColorStop(1, '#7e91a8');

    const spriteKey = boostOn ? 'shipBoost' : (thrusting && hasFuel ? 'shipThrust' : 'shipIdle');
    if (assetReady(spriteKey)) {
      const sh = boostOn ? 58 : 49;
      const sw = sh * (gameAssets[spriteKey].naturalWidth / gameAssets[spriteKey].naturalHeight);
      ctx.shadowColor = boostOn ? '#8fffd2' : tc;
      ctx.shadowBlur = boostOn ? 24 : 13;
      drawAsset(spriteKey, 0, 0, sw, sh, 0, 1, 0.66, 0.5);
      if (selectedShip !== 'def') {
        const painted = shipLivery(spriteKey, selectedShip);
        if (painted) ctx.drawImage(painted, -sw * .66, -sh * .5, sw, sh);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
      return;
    }

    if (thrusting || boostOn) {
      ctx.save();
      const flamePower = boostOn ? 1.65 : hasFuel ? 1.1 : 0.36;
      ctx.globalAlpha *= boostOn ? 0.95 : hasFuel ? 0.82 : 0.42;
      ctx.globalCompositeOperation = 'lighter';
      const fl = ctx.createRadialGradient(-18, 0, 1, -38, 0, 24 + flamePower * 22);
      fl.addColorStop(0, '#fff');
      fl.addColorStop(0.18, hasFuel ? '#fff3a8' : 'rgba(200,220,230,.75)');
      fl.addColorStop(0.34, hasFuel ? tc : 'rgba(160,174,190,.42)');
      fl.addColorStop(1, 'rgba(143,216,255,0)');
      ctx.fillStyle = fl;
      ctx.beginPath();
      ctx.moveTo(-15, -6);
      ctx.bezierCurveTo(-34, -11 * flamePower, -54, -3, -36 - 22 * flamePower, 0);
      ctx.bezierCurveTo(-54, 3, -34, 11 * flamePower, -15, 6);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha *= 0.8;
      ctx.fillStyle = hasFuel ? 'rgba(255,255,255,.88)' : 'rgba(210,225,235,.28)';
      ctx.beginPath();
      ctx.moveTo(-21, -3);
      ctx.lineTo(-30 - 18 * flamePower, 0);
      ctx.lineTo(-21, 3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.shadowColor = tc;
    ctx.shadowBlur = boostOn ? 22 : 14;
    ctx.fillStyle = 'rgba(13,20,34,.72)';
    ctx.beginPath();
    ctx.moveTo(-18, -5);
    ctx.lineTo(-30, -17);
    ctx.lineTo(-2, -11);
    ctx.lineTo(14, -4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-18, 5);
    ctx.lineTo(-30, 17);
    ctx.lineTo(-2, 11);
    ctx.lineTo(14, 4);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-21, -9);
    ctx.bezierCurveTo(-8, -17, 18, -13, 31, 0);
    ctx.bezierCurveTo(18, 13, -8, 17, -21, 9);
    ctx.bezierCurveTo(-26, 5, -26, -5, -21, -9);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(255,255,255,.36)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-10, -7);
    ctx.bezierCurveTo(0, -3, 11, -3, 22, 0);
    ctx.stroke();
    ctx.fillStyle = 'rgba(8,14,24,.76)';
    ctx.beginPath();
    ctx.ellipse(-20, 0, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(5,9,16,.88)';
    ctx.beginPath();
    ctx.ellipse(-25, 0, 4.2, 8.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(-3, 9);
    ctx.lineTo(13, 5);
    ctx.moveTo(-4, -10);
    ctx.lineTo(13, -5);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-6 + i * 8, 6.4, 1.05, 0, Math.PI * 2);
      ctx.fill();
    }

    const canopy = ctx.createLinearGradient(2, -8, 15, 6);
    canopy.addColorStop(0, '#fff');
    canopy.addColorStop(0.42, curBiome.accent);
    canopy.addColorStop(1, '#183c5c');
    ctx.fillStyle = canopy;
    ctx.shadowColor = curBiome.accent;
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.ellipse(8, -2, 8, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = curBiome.accent;
    ctx.beginPath();
    ctx.arc(23, 0, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      const life = 1 - p.age / p.life;
      ctx.globalAlpha = Math.max(0, life);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.4 + life), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawSpriteEffects() {
    for (const e of spriteEffects) {
      if (!assetReady(e.key)) continue;
      const k = clamp(e.age / e.life, 0, 1);
      const ease = 1 - Math.pow(1 - k, 2);
      const size = e.size * (1 + ease * (e.grow || 0.45));
      const image = gameAssets[e.key];
      const h = size;
      const w = h * (image.naturalWidth / image.naturalHeight);
      drawAsset(e.key, e.x, e.y, w, h, (e.rot || 0) + k * (e.spin || 0), 1 - k, 0.5, 0.5);
    }
  }

  function drawShockwaves() {
    for (const s of shockwaves) {
      const k = s.age / s.life;
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 18 + k * 90, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawVignette() {
    const vg = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.25, W * 0.5, H * 0.5, H * 0.82);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,.36)');
    ctx.fillStyle = vg;
    ctx.fillRect(-24, -24, W + 48, H + 48);
  }

  function drawImpactOverlay() {
    const k = clamp((impactGlowUntil - tNow) / 0.52, 0, 1);
    if (k <= 0) return;
    const pulse = smoothstep(k);
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = `rgba(255,90,106,${0.06 * pulse})`;
    ctx.fillRect(-24, -24, W + 48, H + 48);
    const line = 5 + pulse * 10;
    ctx.strokeStyle = `rgba(255,90,106,${0.36 * pulse})`;
    ctx.lineWidth = line;
    ctx.strokeRect(line * 0.5, line * 0.5, W - line, H - line);
    if (tNow < wallReboundUntil) {
      const wallK = clamp((wallReboundUntil - tNow) / 0.24, 0, 1);
      const top = shipY < H * 0.5;
      const grad = ctx.createLinearGradient(0, top ? 0 : H, 0, top ? 95 : H - 95);
      grad.addColorStop(0, `rgba(255,209,102,${0.32 * wallK})`);
      grad.addColorStop(1, 'rgba(255,209,102,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, top ? 0 : H - 110, W, 110);
    }
    ctx.restore();
  }

  function spawnTrail() {
    const boostOn = tNow < boostUntil;
    const hasFuel = fuel > 0.7;
    const count = boostOn ? 4 : hasFuel ? (Math.random() < 0.35 ? 3 : 2) : 1;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: shipX() - 22,
        y: shipY + (Math.random() - 0.5) * (boostOn ? 13 : 9),
        vx: -speed * (boostOn ? 0.55 : 0.42) - Math.random() * 70,
        vy: (Math.random() - 0.5) * (boostOn ? 60 : 38),
        life: (hasFuel ? 0.42 : 0.62) + Math.random() * 0.28,
        age: 0,
        r: (hasFuel ? 2 : 3.4) + Math.random() * (boostOn ? 3.6 : 2.6),
        c: hasFuel ? (boostOn ? '#8fffd2' : trailColor()) : 'rgba(180,195,205,.45)',
        drag: hasFuel ? 0.94 : 0.9
      });
    }
    if (hasFuel && Math.random() < (boostOn ? 0.45 : 0.18)) spawnFuelSmoke();
  }

  function spawnFuelSmoke() {
    particles.push({
      x: shipX() - 29,
      y: shipY + (Math.random() - 0.5) * 12,
      vx: -speed * 0.22 - Math.random() * 34,
      vy: (Math.random() - 0.5) * 22,
      life: 0.72 + Math.random() * 0.42,
      age: 0,
      r: 4 + Math.random() * 5,
      c: 'rgba(190,205,214,.22)',
      drag: 0.88
    });
  }

  function spawnDamageSmoke() {
    particles.push({
      x: shipX() - 6,
      y: shipY + (Math.random() - 0.5) * 16,
      vx: -speed * 0.18 - Math.random() * 28,
      vy: -12 - Math.random() * 28,
      life: 0.5 + Math.random() * 0.28,
      age: 0,
      r: 2.6 + Math.random() * 3.4,
      c: Math.random() < 0.45 ? '#ffd166' : 'rgba(190,205,214,.3)',
      drag: 0.9
    });
  }

  function burst(x, y, color, count, force) {
    const particleCount = effectsMode === 'rich' ? count : Math.max(4, Math.ceil(count * 0.55));
    for (let i = 0; i < particleCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = (70 + Math.random() * 190) * (force || 1);
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.42 + Math.random() * 0.4,
        age: 0,
        r: 1.6 + Math.random() * 3.4,
        c: color,
        drag: 0.9
      });
    }
  }

  function spriteEffect(key, x, y, size, life, grow, spin) {
    if (!assetReady(key)) return;
    spriteEffects.push({ key, x, y, size, life: life || 0.45, grow: grow || 0.45, spin: spin || 0, age: 0 });
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(p.drag || 0.92, dt * 60);
      p.vy *= Math.pow(p.drag || 0.92, dt * 60);
      p.age += dt;
      if (p.age >= p.life) particles.splice(i, 1);
    }
  }

  function updateSpriteEffects(dt) {
    for (let i = spriteEffects.length - 1; i >= 0; i--) {
      spriteEffects[i].age += dt;
      if (spriteEffects[i].age >= spriteEffects[i].life) spriteEffects.splice(i, 1);
    }
  }

  function updateShockwaves(dt) {
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      shockwaves[i].age += dt;
      if (shockwaves[i].age >= shockwaves[i].life) shockwaves.splice(i, 1);
    }
  }

  function renderShop() {
    unlockMastery();
    renderMastery();
    const walletEl = document.getElementById('wallet');
    if (walletEl) walletEl.textContent = wallet;
    if (els.stockCoins) els.stockCoins.textContent = inventory.coin;
    if (els.stockFuel) els.stockFuel.textContent = inventory.fuel;
    if (els.stockShield) els.stockShield.textContent = inventory.shield;
    if (els.stockMagnet) els.stockMagnet.textContent = inventory.magnet;
    if (els.stockBoost) els.stockBoost.textContent = inventory.boost;
    if (els.shopShipsMeta) els.shopShipsMeta.textContent = `${ownedShips.length}/${SHIPS.length} sende`;
    if (els.shopTrailsMeta) els.shopTrailsMeta.textContent = `${ownedTrails.length}/${TRAILS.length} sende`;
    updatePreview();
    buildRow('ship-row', SHIPS, ownedShips, selectedShip);
    buildRow('trail-row', TRAILS, ownedTrails, selectedTrail);
  }

  function openInventory() {
    if (!els.menu) return;
    renderShop();
    els.menu.classList.add('inventory-mode');
  }

  function closeInventory() {
    if (!els.menu) return;
    els.menu.classList.remove('inventory-mode');
  }

  let levelWorld = 0;

  function renderLevels() {
    if (!els.stageGrid) return;
    const world = WORLDS[levelWorld];
    els.worldName.textContent = BIOMES[world.biome].name;
    els.levels.style.setProperty('--world-accent', BIOMES[world.biome].wall);
    setBiome(world.biome, true);

    const earned = worldStars(levelWorld);
    if (worldUnlocked(levelWorld)) {
      els.worldMeta.textContent = `${earned} / ${STAGES_PER_WORLD * 3} ★`;
      els.worldMeta.classList.remove('locked');
    } else {
      // Kilitliyse ne eksik oldugu yazilir, oyuncu tahmin etmesin.
      els.worldMeta.textContent = 'Önceki dünyanın son bölümünü tamamla';
      els.worldMeta.classList.add('locked');
    }

    els.worldPrev.disabled = levelWorld === 0;
    els.worldNext.disabled = levelWorld >= WORLDS_ENABLED - 1;

    const next = nextLockedStage();
    els.stageGrid.textContent = '';
    for (let s = 0; s < STAGES_PER_WORLD; s++) {
      const stars = starsFor(levelWorld, s);
      const unlocked = stageUnlocked(levelWorld, s);
      const btn = document.createElement('button');
      btn.className = 'stage-btn'
        + (stars > 0 ? ' done' : '')
        + (unlocked ? '' : ' locked')
        + (next && next.world === levelWorld && next.stage === s ? ' next' : '');
      btn.dataset.stage = String(s);
      btn.setAttribute('aria-label', `${s + 1}. bölüm: ${stageConfig(levelWorld, s).name}, ${stars} yıldız${unlocked ? '' : ', kilitli'}`);

      const label = document.createElement('b');
      label.textContent = unlocked ? String(s + 1) : '🔒';
      btn.appendChild(label);

      const marks = document.createElement('i');
      if (unlocked) {
        marks.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        if (stars === 0) marks.className = 'none';
      } else {
        marks.textContent = '☆☆☆';
        marks.className = 'none';
      }
      btn.appendChild(marks);

      if (!unlocked) btn.disabled = true;
      els.stageGrid.appendChild(btn);
    }
  }

  function openLevels() {
    if (!els.levels) return;
    const next = nextLockedStage();
    if (next) levelWorld = next.world;
    renderLevels();
    els.menu.classList.remove('show');
    els.levels.classList.add('show');
  }

  function closeLevels() {
    if (!els.levels) return;
    els.levels.classList.remove('show');
    els.menu.classList.add('show');
  }


  // ===================================================================
  // GECICI: oyun ici ses karsilastirma paneli
  // Adaylari oyunun kendi ses yolundan calar, boylece telefonda gercek
  // kosullarda karsilastirilir. Secim kesinlestikten sonra bu blok,
  // #soundtest isaretlemesi, csproj joker satiri ve audition/ silinir.
  // ===================================================================
  const AUDITION_GROUPS = [
    { title: 'MOTOR — RÖLANTİ', note: 'Uçarken sürekli duyulan taban', loop: true,
      items: [['idle_a', 'spaceEngineLow_000 (şu anki)'], ['idle_b', 'spaceEngineLow_002'],
              ['idle_c', 'spaceEngine_003'], ['idle_d', 'spaceEngineSmall_000'],
              ['idle_e', 'spaceEngineSmall_002']] },
    { title: 'MOTOR — İTİŞ', note: 'Basılı tutunca', loop: true,
      items: [['thr_a', 'thrusterFire_002 (şu anki)'], ['thr_b', 'thrusterFire_000'],
              ['thr_c', 'spaceEngineLarge_000'], ['thr_d', 'engineCircular_000'],
              ['thr_e', 'engineCircular_002']] },
    { title: 'TOPLAMA', note: 'Kristal, yakıt, mıknatıs',
      items: [['pick_a', 'laserRetro_000 (şu anki)'], ['pick_b', 'laserSmall_001'],
              ['pick_c', 'doorOpen_000'], ['pick_d', 'forceField_004']] },
    { title: 'MENÜ TIKI', note: 'Dokunuş geri bildirimi',
      items: [['tap_a', 'laserSmall_000 (şu anki)'], ['tap_b', 'doorClose_002'],
              ['tap_c', 'laserRetro_001']] },
    { title: 'DUVAR ÇARPMASI', note: 'Sürtünme darbesi',
      items: [['hit_a', 'impactMetal_002 (şu anki)'], ['hit_b', 'impactMetal_004'],
              ['hit_c', 'lowFrequency_explosion_000']] },
    { title: 'ÖLÜM PATLAMASI', note: 'Koşu bitişi',
      items: [['crash_a', 'explosionCrunch_003 (şu anki)'], ['crash_b', 'explosionCrunch_001'],
              ['crash_c', 'explosionCrunch_004']] }
  ];

  const auditionBuffers = {};
  let auditionNode = null;
  let auditionBtn = null;

  function auditionSrc(key) {
    const embedded = window.UCUS_AUDITION;
    if (embedded && embedded[key]) return embedded[key];
    return 'audition/aud_' + key + '.wav';
  }

  function stopAudition() {
    if (auditionNode) {
      try { auditionNode.stop(); } catch (_) {}
      auditionNode = null;
    }
    if (auditionBtn) {
      auditionBtn.classList.remove('playing');
      auditionBtn = null;
    }
  }

  function playAudition(key, loop, btn) {
    ensureAudio();
    if (!ac) return;
    const wasSame = auditionBtn === btn;
    stopAudition();
    if (wasSame) return;

    const start = buffer => {
      // Panel acikken oyun sesi calmadigi icin dogrudan master'a baglanir.
      const src = ac.createBufferSource();
      const gain = ac.createGain();
      src.buffer = buffer;
      src.loop = !!loop;
      gain.gain.value = 0.85;
      src.connect(gain);
      gain.connect(master);
      src.start();
      auditionNode = src;
      auditionBtn = btn;
      btn.classList.add('playing');
      if (!loop) src.onended = () => { if (auditionBtn === btn) stopAudition(); };
    };

    if (auditionBuffers[key]) { start(auditionBuffers[key]); return; }
    fetch(auditionSrc(key))
      .then(r => r.arrayBuffer())
      .then(ab => ac.decodeAudioData(ab))
      .then(buf => { auditionBuffers[key] = buf; start(buf); })
      .catch(() => {});
  }

  function buildSoundTest() {
    const host = document.getElementById('soundTestList');
    if (!host || host.children.length) return;
    AUDITION_GROUPS.forEach(g => {
      const h = document.createElement('div');
      h.className = 'st-head';
      h.textContent = g.title;
      const s = document.createElement('small');
      s.textContent = g.note;
      h.appendChild(s);
      host.appendChild(h);

      const row = document.createElement('div');
      row.className = 'st-row';
      g.items.forEach(([key, label]) => {
        const b = document.createElement('button');
        b.className = 'st-btn';
        b.textContent = label;
        if (g.loop) {
          const t = document.createElement('i');
          t.textContent = 'döngü';
          b.appendChild(t);
        }
        b.addEventListener('pointerdown', e => e.stopPropagation());
        b.addEventListener('click', e => {
          e.stopPropagation();
          playAudition(key, g.loop, b);
        });
        row.appendChild(b);
      });
      host.appendChild(row);
    });
  }

  function openSoundTest() {
    if (!els.soundTest) return;
    buildSoundTest();
    closeSettings();
    els.soundTest.classList.add('show');
  }

  function closeSoundTest() {
    if (!els.soundTest) return;
    stopAudition();
    els.soundTest.classList.remove('show');
    els.menu.classList.add('show');
  }

  function openGuide() {
    if (!els.guide) return;
    els.guide.classList.add('show');
  }

  function closeGuide() {
    if (!els.guide) return;
    localStorage.setItem(STORE.guide, '1');
    els.guide.classList.remove('show');
  }

  function updateSettingsUiLegacy() {
    if (!els.settingsSound) return;
    const stateText = els.settingsSound.querySelector('b');
    if (stateText) stateText.textContent = soundOn ? 'Açık' : 'Kapalı';
  }

  function openSettings() {
    if (!els.settings) return;
    updateSettingsUi();
    els.settings.classList.add('show');
  }

  function closeSettings() {
    if (!els.settings) return;
    els.settings.classList.remove('show');
  }

  function openPrivacy() {
    if (!els.privacy) return;
    els.privacy.classList.add('show');
  }

  function closePrivacy() {
    if (!els.privacy) return;
    els.privacy.classList.remove('show');
  }

  function updateSettingsUi() {
    const soundText = els.settingsSound && els.settingsSound.querySelector('b');
    if (soundText) soundText.textContent = soundOn ? 'Açık' : 'Kapalı';
    const musicText = els.settingsMusic && els.settingsMusic.querySelector('b');
    if (musicText) musicText.textContent = musicOn ? 'Açık' : 'Kapalı';
    const engineText = els.settingsEngine && els.settingsEngine.querySelector('b');
    if (engineText) engineText.textContent = engineOn ? 'Açık' : 'Kapalı';
    const hapticText = els.settingsHaptic && els.settingsHaptic.querySelector('b');
    if (hapticText) hapticText.textContent = hapticsOn ? 'Açık' : 'Kapalı';
    const effectsText = els.settingsEffects && els.settingsEffects.querySelector('b');
    if (effectsText) effectsText.textContent = effectsMode === 'rich' ? 'Zengin' : 'Dengeli';
    const shakeText = els.settingsShake && els.settingsShake.querySelector('b');
    if (shakeText) shakeText.textContent = shakeOn ? 'Açık' : 'Kapalı';
    const routeText = els.settingsRoute && els.settingsRoute.querySelector('b');
    if (routeText) routeText.textContent = routeGuideOn ? 'Açık' : 'Kapalı';
  }

  function playNativeEffect(kind, volume) {
    if (!nativeAudio || !soundOn) return false;
    nativeAudio.sfx(kind, volume == null ? 1 : volume);
    return true;
  }

  function setNativeLoop(kind, volume) {
    if (!nativeAudio) return false;
    const target = soundOn && volume > 0.001 ? clamp(volume, 0, 1) : 0;
    const previous = nativeLoopState[kind];
    if (previous === target || (previous > 0 && target > 0 && Math.abs(previous - target) < 0.012)) return true;
    nativeLoopState[kind] = target;
    nativeAudio.loop(kind, target > 0.001 ? 'start' : 'stop', target);
    return true;
  }

  function stopNativeAudio() {
    if (!nativeAudio) return false;
    nativeLoopState.music = 0;
    nativeLoopState.engine_idle = 0;
    nativeLoopState.engine_thrust = 0;
    nativeAudio.stopAll();
    return true;
  }

  function updatePreview() {
    document.documentElement.style.setProperty('--ship-color', shipColor());
    document.documentElement.style.setProperty('--trail-color', trailColor());
  }

  function buildRow(id, items, ownedList, selected) {
    const row = document.getElementById(id);
    if (!row) return;
    const kind = id === 'ship-row' ? 'ship' : 'trail';
    row.innerHTML = items.map(item => {
      const own = ownedList.includes(item.id);
      const selectedClass = selected === item.id ? 'sel' : '';
      const bg = item.color ? `background:${item.color}` : 'background:conic-gradient(#72d8ff,#ff7842,#c8a4ff,#35df87,#72d8ff)';
      const stateText = selected === item.id ? 'Seçili' : own ? 'Sende' : item.achievement ? 'Ustalık ödülü' : `${ICON.coin}${item.cost}`;
      return `<button class="shop-item ${selectedClass} ${own ? '' : 'locked'}" data-kind="${kind}" data-id="${item.id}" aria-label="${item.name}"><span class="sw" style="${bg}"></span><span class="shop-name">${item.name}</span><span class="cost">${stateText}</span></button>`;
    }).join('');
  }

  // Baglam kullanici hareketinden once de kurulabilir; 'suspended'
  // baslar ama decodeAudioData bu haldeyken de calisir. Onemli olan
  // bu: ornekler ilk dokunustan once cozulmus olur.
  function createAudioContext() {
    if (nativeAudio || ac || !AC) return;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.46;
    const limiter = ac.createDynamicsCompressor();
    limiter.threshold.value = -14;
    limiter.knee.value = 12;
    limiter.ratio.value = 4;
    limiter.attack.value = 0.005;
    limiter.release.value = 0.18;
    master.connect(limiter);
    limiter.connect(ac.destination);
  }

  function ensureAudio() {
    if (!soundOn) return;
    appVisible = true;
    if (nativeAudio) return;
    if (!AC) {
      audioSuspendedByApp = false;
      return;
    }
    createAudioContext();
    if (master) master.gain.setTargetAtTime(0.46, ac.currentTime, 0.08);
    if (ac.state === 'suspended') ac.resume();
    audioSuspendedByApp = false;
    decodeAudioAssets();
  }

  function dataUriToArrayBuffer(src) {
    const comma = src.indexOf(',');
    if (comma < 0) return null;
    const header = src.slice(0, comma);
    const payload = src.slice(comma + 1);
    const text = header.includes(';base64') ? atob(payload) : decodeURIComponent(payload);
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
    return bytes.buffer;
  }

  function preloadAudioAssets() {
    if (nativeAudio) return Promise.resolve();
    if (audioPreloadPromise) return audioPreloadPromise;
    audioPreloadPromise = Promise.all(AUDIO_KEYS.map(key => {
      const src = ASSET_SOURCES[key];
      if (!src) return Promise.resolve();
      if (!htmlAudio[key]) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = 0;
        audio.load();
        htmlAudio[key] = audio;
      }
      if (src.startsWith('data:')) {
        rawAudioAssets[key] = dataUriToArrayBuffer(src);
        return Promise.resolve();
      }
      return fetch(src)
        .then(response => response.ok ? response.arrayBuffer() : null)
        .then(buffer => { if (buffer) rawAudioAssets[key] = buffer; })
        .catch(() => {});
    }));
    return audioPreloadPromise;
  }

  function playHtmlSample(key, gainValue, rateValue, loop) {
    if (!soundOn || !appVisible) return false;
    const original = htmlAudio[key];
    if (!original) return false;
    let audio = original;
    if (loop) {
      if (!htmlLoopAudio[key]) {
        htmlLoopAudio[key] = original.cloneNode(true);
        htmlLoopAudio[key].loop = true;
      }
      audio = htmlLoopAudio[key];
    } else {
      audio = original.cloneNode(true);
      activeHtmlEffects.add(audio);
      audio.addEventListener('ended', () => activeHtmlEffects.delete(audio), { once: true });
    }
    audio.volume = clamp(gainValue ?? 0.45, 0, 1);
    audio.playbackRate = rateValue || 1;
    const played = audio.play();
    if (played && played.catch) played.catch(() => activeHtmlEffects.delete(audio));
    return true;
  }

  function setHtmlLoop(key, gainValue, rateValue) {
    const audio = htmlLoopAudio[key];
    if (!audio) return;
    audio.volume = clamp(gainValue || 0, 0, 1);
    audio.playbackRate = rateValue || 1;
    if (audio.paused && gainValue > 0.001) {
      const played = audio.play();
      if (played && played.catch) played.catch(() => {});
    }
  }

  function stopHtmlAudio() {
    for (const audio of activeHtmlEffects) { audio.pause(); audio.currentTime = 0; }
    activeHtmlEffects.clear();
    for (const audio of Object.values(htmlLoopAudio)) {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (_) {}
    }
  }

  function decodeAudioAssets() {
    if (!ac) return Promise.resolve(false);
    if (audioDecodePromise) return audioDecodePromise;
    audioDecodePromise = preloadAudioAssets().then(() => Promise.all(AUDIO_KEYS.map(key => {
      if (audioBuffers[key] || !rawAudioAssets[key]) return Promise.resolve();
      return ac.decodeAudioData(rawAudioAssets[key].slice(0))
        .then(buffer => { audioBuffers[key] = buffer; })
        .catch(() => {});
    }))).then(() => true);
    return audioDecodePromise;
  }

  function playSample(key, gainValue, rateValue, vary) {
    if (!soundOn || !appVisible || !ac) return false;
    const buffer = audioBuffers[key];
    if (!buffer) {
      decodeAudioAssets();
      return playHtmlSample(key, gainValue, rateValue, false);
    }
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    const jitter = vary ? 1 + (Math.random() * 2 - 1) * vary : 1;
    src.buffer = buffer;
    src.playbackRate.value = (rateValue || 1) * jitter;
    gain.gain.value = clamp(gainValue ?? 0.5, 0, 1);
    src.connect(gain);
    gain.connect(master);
    activeSampleSources.add(src);
    src.onended = () => { activeSampleSources.delete(src); src.disconnect(); gain.disconnect(); };
    src.start();
    return true;
  }

  function startLoopingSample(key, gainNode, rateValue) {
    const buffer = audioBuffers[key];
    if (!buffer || !ac) return null;
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.playbackRate.value = rateValue || 1;
    src.connect(gainNode);
    src.start();
    return src;
  }

  function tone(freq, dur, type, volume) {
    if (!soundOn || !ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    const safeType = type || 'sine';
    const safeVolume = Math.min(volume || 0.09, 0.1);
    osc.type = safeType;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(master);
    gain.gain.setValueAtTime(0.0001, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(safeVolume, ac.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + Math.min(dur, 0.14));
    osc.start();
    osc.stop(ac.currentTime + Math.min(dur, 0.14) + 0.03);
  }

  function noiseBurst(dur, volume, color) {
    if (!soundOn || !ac) return;
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buffer = ac.createBuffer(1, len, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    const filter = ac.createBiquadFilter();
    const gain = ac.createGain();
    filter.type = color || 'bandpass';
    filter.frequency.value = color === 'lowpass' ? 520 : 1600;
    filter.Q.value = 0.8;
    gain.gain.value = Math.min(volume || 0.04, 0.08);
    src.buffer = buffer;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start();
  }

  function startMusic() {
    if (nativeAudio) {
      if (!soundOn || !musicOn || !appVisible || state !== 'play') return;
      setNativeLoop('music', 0.2 * audioLevels.music);
      return;
    }
    if (!soundOn || !musicOn || !appVisible) return;
    if (!ac) return;
    if (!audioBuffers.audioMusicLoop) {
      decodeAudioAssets().then(() => {
        if (audioBuffers.audioMusicLoop && soundOn && musicOn && appVisible && state === 'play') startMusic();
      });
      if (playHtmlSample('audioMusicLoop', 0.2 * audioLevels.music, 1, true)) {
        musicSource = musicSource || { html: true };
      }
      return;
    }
    if (musicSource && musicSource.html) { setHtmlLoop('audioMusicLoop', 0, 1); musicSource = null; }
    if (musicSource) return;
    musicGain = ac.createGain();
    musicGain.gain.value = 0.0001;
    musicGain.connect(master);
    musicSource = startLoopingSample('audioMusicLoop', musicGain, 1);
    musicGain.gain.setTargetAtTime(0.22 * audioLevels.music, ac.currentTime, 0.7);
  }

  function updateMusic() {
    const duck = (tNow < impactGlowUntil ? 0.38 : fuel < 15 ? 0.65 : 1) * (finaleAnnounced ? 1.16 : 1);
    if (nativeAudio) {
      const audible = soundOn && musicOn && appVisible && state === 'play';
      setNativeLoop('music', audible ? 0.2 * audioLevels.music * duck : 0);
      return;
    }
    if (!ac) return;
    const audible = soundOn && musicOn && appVisible && state === 'play';
    if (musicGain) musicGain.gain.setTargetAtTime(audible ? 0.22 * audioLevels.music * duck : 0.0001, ac.currentTime, 0.25);
    setHtmlLoop('audioMusicLoop', audible ? 0.2 * audioLevels.music * duck : 0, 1);
  }

  function stopMusic() {
    if (nativeAudio) {
      setNativeLoop('music', 0);
      return;
    }
    if (musicGain && ac) musicGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.18);
    setHtmlLoop('audioMusicLoop', 0, 1);
  }

  function startEngine() {
    if (nativeAudio) {
      if (!soundOn || !engineOn) return;
      setNativeLoop('engine_idle', 0);
      setNativeLoop('engine_thrust', 0);
      return;
    }
    if (!soundOn || !engineOn || !appVisible) return;
    if (!ac) return;
    if (!audioBuffers.audioEngineIdle || !audioBuffers.audioEngineThrust) {
      decodeAudioAssets().then(() => {
        if (audioBuffers.audioEngineIdle && audioBuffers.audioEngineThrust && soundOn && engineOn && appVisible && state === 'play') startEngine();
      });
      const idle = playHtmlSample('audioEngineIdle', 0, 0.98, true);
      const thrust = playHtmlSample('audioEngineThrust', 0, 1, true);
      if (idle || thrust) {
        engineIdleSource = engineIdleSource || { html: true };
        engineThrustSource = engineThrustSource || { html: true };
      }
      return;
    }
    if (engineIdleSource && engineIdleSource.html) {
      setHtmlLoop('audioEngineIdle', 0, 1); setHtmlLoop('audioEngineThrust', 0, 1);
      engineIdleSource = null; engineThrustSource = null;
    }
    if (engineIdleSource && engineThrustSource) return;
    engineGain = ac.createGain();
    engineIdleGain = ac.createGain();
    engineThrustGain = ac.createGain();
    engineGain.gain.value = 0.0001;
    engineIdleGain.gain.value = 0.0001;
    engineThrustGain.gain.value = 0.0001;
    engineIdleGain.connect(engineGain);
    engineThrustGain.connect(engineGain);
    engineGain.connect(master);
    engineIdleSource = startLoopingSample('audioEngineIdle', engineIdleGain, 1);
    engineThrustSource = startLoopingSample('audioEngineThrust', engineThrustGain, 1);
    updateEngine();
  }

  function updateEngine() {
    const active = soundOn && engineOn && appVisible && state === 'play' && !awaitingFirstInput && fuel > 0.7;
    const boostOn = tNow < boostUntil;
    const idleGain = 0; // Coasting is quiet; no continuous exhaust hiss.
    const thrustGain = active ? (0.28 * engineEnvelope + (boostOn ? 0.045 : 0)) * audioLevels.engine : 0;
    if (nativeAudio) {
      setNativeLoop('engine_idle', 0);
      setNativeLoop('engine_thrust', thrustGain);
      return;
    }
    if (!engineGain || !engineIdleGain || !engineThrustGain || !ac) return;
    const speedLift = clamp(speed / 760, 0, 0.26);
    const fuelDrop = fuel < 2 ? -0.05 : 0;
    const masterGain = active ? 0.45 + speedLift + (boostOn ? 0.13 : 0) + fuelDrop : 0.0001;
    engineGain.gain.setTargetAtTime(masterGain, ac.currentTime, 0.18);
    engineIdleGain.gain.setTargetAtTime(idleGain, ac.currentTime, 0.16);
    engineThrustGain.gain.setTargetAtTime(thrustGain, ac.currentTime, 0.12);
    if (engineIdleSource && engineIdleSource.playbackRate) engineIdleSource.playbackRate.setTargetAtTime(0.96 + speedLift * 0.22, ac.currentTime, 0.2);
    if (engineThrustSource && engineThrustSource.playbackRate) engineThrustSource.playbackRate.setTargetAtTime(1.0 + speedLift * 0.32 + (boostOn ? 0.08 : 0), ac.currentTime, 0.16);
    setHtmlLoop('audioEngineIdle', active ? idleGain * 0.62 : 0, 0.96 + speedLift * 0.22);
    setHtmlLoop('audioEngineThrust', active ? thrustGain * 0.84 : 0, 1.0 + speedLift * 0.32 + (boostOn ? 0.08 : 0));
  }

  function stopEngine() {
    if (nativeAudio) {
      setNativeLoop('engine_idle', 0);
      setNativeLoop('engine_thrust', 0);
      return;
    }
    if (!engineGain || !ac) return;
    engineGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.16);
    if (engineIdleGain) engineIdleGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.14);
    if (engineThrustGain) engineThrustGain.gain.setTargetAtTime(0.0001, ac.currentTime, 0.12);
    setHtmlLoop('audioEngineIdle', 0, 1);
    setHtmlLoop('audioEngineThrust', 0, 1);
  }

  function sfx(kind) {
    if (!soundOn || !appVisible || state === 'paused') return;
    const minGap = kind === 'coin' ? 0.065 : kind === 'thrustOn' || kind === 'idle' ? 0.2 : 0.09;
    if (lastEffectAt[kind] != null && tNow - lastEffectAt[kind] < minGap) return;
    lastEffectAt[kind] = tNow;
    const sample = SAMPLE_SFX[kind];
    const level = audioLevels.effects * ((kind === 'thrustOn' || kind === 'idle') ? audioLevels.engine * (engineOn ? 0.3 : 0) : 1);
    if (sample && playNativeEffect(kind, sample.gain * level)) return;
    if (!appVisible) return;
    if (!ac) return;
    if (sample) {
      playSample(sample.key, sample.gain * level, sample.rate || 1, sample.vary || 0);
      return;
    }
    if (kind === 'tap') {
      tone(360, 0.035, 'sine', 0.035);
      return;
    }
    if (kind === 'launch') {
      noiseBurst(0.12, 0.045, 'lowpass');
      tone(420, 0.08, 'triangle', 0.055);
      setTimeout(() => tone(640, 0.08, 'triangle', 0.05), 55);
      return;
    }
    if (kind === 'thrustOn') {
      noiseBurst(0.055, 0.026, 'lowpass');
      tone(220, 0.045, 'triangle', 0.026);
      setTimeout(() => tone(340, 0.045, 'sine', 0.024), 40);
      return;
    }
    if (kind === 'idle') {
      tone(180, 0.055, 'sine', 0.022);
      setTimeout(() => tone(132, 0.06, 'sine', 0.018), 46);
      return;
    }
    if (kind === 'coin') {
      tone(980, 0.045, 'triangle', 0.052);
      setTimeout(() => tone(1470, 0.04, 'sine', 0.036), 36);
      setTimeout(() => tone(1960, 0.035, 'sine', 0.026), 74);
      return;
    }
    if (kind === 'fuel') {
      noiseBurst(0.11, 0.038, 'lowpass');
      tone(420, 0.09, 'triangle', 0.045);
      setTimeout(() => tone(620, 0.08, 'triangle', 0.044), 52);
      setTimeout(() => tone(780, 0.06, 'sine', 0.03), 104);
      return;
    }
    if (kind === 'perfect') {
      tone(740, 0.06, 'triangle', 0.055);
      setTimeout(() => tone(980, 0.07, 'triangle', 0.05), 55);
      setTimeout(() => tone(1240, 0.06, 'sine', 0.035), 110);
      return;
    }
    if (kind === 'near') {
      noiseBurst(0.045, 0.028, 'bandpass');
      tone(1160, 0.035, 'sine', 0.035);
      return;
    }
    if (kind === 'boost') {
      noiseBurst(0.14, 0.06, 'lowpass');
      tone(620, 0.08, 'triangle', 0.06);
      setTimeout(() => tone(930, 0.09, 'triangle', 0.052), 60);
      setTimeout(() => tone(1240, 0.08, 'sine', 0.034), 118);
      return;
    }
    if (kind === 'shield') {
      tone(460, 0.08, 'sine', 0.045);
      setTimeout(() => tone(690, 0.08, 'triangle', 0.045), 56);
      setTimeout(() => tone(920, 0.06, 'sine', 0.028), 112);
      return;
    }
    if (kind === 'magnet') {
      noiseBurst(0.07, 0.03, 'bandpass');
      tone(320, 0.06, 'sine', 0.035);
      setTimeout(() => tone(760, 0.08, 'triangle', 0.04), 52);
      return;
    }
    if (kind === 'warn') {
      tone(260, 0.07, 'sine', 0.04);
      setTimeout(() => tone(220, 0.07, 'sine', 0.035), 80);
      return;
    }
    if (kind === 'fuelWarn') {
      tone(330, 0.08, 'triangle', 0.045);
      setTimeout(() => tone(250, 0.08, 'triangle', 0.04), 95);
      setTimeout(() => tone(330, 0.07, 'triangle', 0.034), 190);
      return;
    }
    if (kind === 'wall') {
      noiseBurst(0.09, 0.048, 'lowpass');
      tone(150, 0.08, 'triangle', 0.04);
      setTimeout(() => tone(105, 0.07, 'sine', 0.026), 54);
      return;
    }
    if (kind === 'groundCrash') {
      noiseBurst(0.22, 0.058, 'lowpass');
      tone(132, 0.12, 'triangle', 0.044);
      setTimeout(() => tone(82, 0.16, 'sine', 0.032), 80);
      return;
    }
    if (kind === 'crash') {
      noiseBurst(0.18, 0.065, 'lowpass');
      tone(180, 0.12, 'sine', 0.055);
    }
  }

  function startAudio() {
    if (!soundOn) return;
    appVisible = true;
    if (nativeAudio) {
      startMusic();
      startEngine();
      updateAudio();
      return;
    }
    if (!appVisible || !ac) return;
    startMusic();
    startEngine();
    updateAudio();
  }

  function updateAudio() {
    if (nativeAudio) {
      updateMusic();
      updateEngine();
      return;
    }
    if (!appVisible || !ac) return;
    updateMusic();
    updateEngine();
  }

  function stopAudio() {
    for (const src of activeSampleSources) { try { src.stop(); } catch (_) {} }
    activeSampleSources.clear();
    stopNativeAudio();
    stopMusic();
    stopEngine();
    stopHtmlAudio();
  }

  function suspendAudioForBackground() {
    pauseFlight();
    appVisible = false;
    stopAudio();
    if (!ac) return;
    if (master) {
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.03);
    }
    audioSuspendedByApp = true;
    setTimeout(() => {
      if (!appVisible && ac && ac.state === 'running') ac.suspend();
    }, 90);
  }

  function resumeAudioFromBackground() {
    appVisible = true;
    if (nativeAudio) {
      audioSuspendedByApp = false;
      if (soundOn && state === 'play') startAudio();
      return;
    }
    if (!soundOn || !ac) return;
    const resume = ac.state === 'suspended' ? ac.resume() : Promise.resolve();
    resume.then(() => {
      if (!appVisible || !soundOn) return;
      audioSuspendedByApp = false;
      if (master) master.gain.setTargetAtTime(0.46, ac.currentTime, 0.12);
      if (state === 'play') startAudio();
    }).catch(() => {});
  }

  function haptic(pattern) {
    if (!hapticsOn || !appVisible) return;
    const duration = Array.isArray(pattern) ? Math.max(...pattern) : pattern;
    if (window.ucusAudioBridge && window.ucusAudioBridge.haptic) window.ucusAudioBridge.haptic(String(duration));
    else if (navigator.vibrate) navigator.vibrate(pattern);
  }

  function loop(t) {
    const dt = !appVisible || state === 'paused' ? 0 : Math.min(lastT ? (t - lastT) / 1000 : 0, 0.035);
    tNow += dt;
    lastT = t;
    if (els.stage.dataset.flightState !== state) els.stage.dataset.flightState = state;
    if (state === 'play') {
      update(dt);
    } else {
      updateParticles(dt);
      updateSpriteEffects(dt);
      updateShockwaves(dt);
    }
    draw(dt);
    rafId = requestAnimationFrame(loop);
  }

  function pointerDown(e) {
    if (state !== 'play' || activePointer !== null || (e.target.closest && e.target.closest('button,input,.overlay'))) return;
    if (e.target.closest && e.target.closest('#snd,#shop,#menu-btn,#retryBtn,#rewardAdBtn,#boostBtn,#playBtn,#inventoryOpen,#inventoryBack,#settingsOpen,#settings,#settingsOk,#settingsSound,#settingsMusic,#settingsEngine,#settingsHaptic,#settingsEffects,#settingsShake,#settingsRoute,#settingsGuide,#settingsPrivacy,#guide,#guideOpen,#privacy,#privacyOpen,#levels,#endlessOpen,#soundTest,#soundTestOpen')) return;
    if (state === 'menu') return;
    e.preventDefault();
    appVisible = true;
    ensureAudio();
    pointerDownAt = tNow;
    activePointer = e.pointerId;
    els.stage.setPointerCapture(e.pointerId);
    if (state === 'over') return;
    if (awaitingFirstInput) {
      awaitingFirstInput = false;
      startAudio();
      sfx('launch');
      haptic([12, 18]);
    } else {
      sfx('thrustOn');
      haptic(5);
    }
    thrusting = true;
  }

  function pointerUp(e) {
    if (e && activePointer !== null && e.pointerId !== activePointer) return;
    const wasThrusting = thrusting;
    activePointer = null;
    thrusting = false;
    if (state === 'play' && wasThrusting) {
      sfx('idle');
      haptic(3);
    }
  }

  els.stage.addEventListener('pointerdown', pointerDown);
  els.stage.addEventListener('pointerup', pointerUp);
  els.stage.addEventListener('lostpointercapture', pointerUp);
  els.stage.addEventListener('pointercancel', pointerUp);
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 120));
  window.addEventListener('blur', () => {
    thrusting = false;
    suspendAudioForBackground();
  });
  window.addEventListener('pagehide', suspendAudioForBackground);
  window.addEventListener('pageshow', resumeAudioFromBackground);
  window.addEventListener('focus', resumeAudioFromBackground);
  window.addEventListener('beforeunload', suspendAudioForBackground);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') suspendAudioForBackground();
    else resumeAudioFromBackground();
  });
  window.ucusAppPause = () => {
    thrusting = false;
    suspendAudioForBackground();
  };
  window.ucusAppResume = () => {
    resumeAudioFromBackground();
  };

  const soundButton = document.getElementById('snd');
  soundButton.textContent = soundOn ? ICON.speaker : ICON.muted;
  soundButton.addEventListener('pointerdown', e => e.stopPropagation());
  soundButton.addEventListener('click', e => {
    e.stopPropagation();
    soundOn = !soundOn;
    localStorage.setItem(STORE.sound, soundOn ? '1' : '0');
    soundButton.textContent = soundOn ? ICON.speaker : ICON.muted;
    updateSettingsUi();
    if (soundOn) {
      ensureAudio();
      if (state === 'play') startAudio();
    } else {
      stopAudio();
    }
  });

  els.boostBtn.addEventListener('pointerdown', e => e.stopPropagation());
  els.boostBtn.addEventListener('click', e => {
    e.stopPropagation();
    ensureAudio();
    triggerBoost();
  });

  const playButton = document.getElementById('playBtn');
  if (playButton) {
    playButton.addEventListener('pointerdown', e => e.stopPropagation());
    playButton.addEventListener('click', e => {
      e.stopPropagation();
      ensureAudio();
      openLevels();
    });
  }

  const endlessButton = document.getElementById('endlessOpen');
  if (endlessButton) {
    endlessButton.addEventListener('pointerdown', e => e.stopPropagation());
    endlessButton.addEventListener('click', e => {
      e.stopPropagation();
      ensureAudio();
      startEndless();
    });
  }

  if (els.stageGrid) {
    els.stageGrid.addEventListener('pointerdown', e => e.stopPropagation());
    els.stageGrid.addEventListener('click', e => {
      e.stopPropagation();
      const btn = e.target.closest('.stage-btn');
      if (!btn || btn.disabled) return;
      const s = Number(btn.dataset.stage);
      if (!stageUnlocked(levelWorld, s)) return;
      ensureAudio();
      els.levels.classList.remove('show');
      showStageBrief(levelWorld, s);
    });
  }

  if (els.worldPrev) {
    els.worldPrev.addEventListener('pointerdown', e => e.stopPropagation());
    els.worldPrev.addEventListener('click', e => {
      e.stopPropagation();
      if (levelWorld > 0) {
        levelWorld--;
        renderLevels();
      }
    });
  }

  if (els.worldNext) {
    els.worldNext.addEventListener('pointerdown', e => e.stopPropagation());
    els.worldNext.addEventListener('click', e => {
      e.stopPropagation();
      if (levelWorld < WORLDS_ENABLED - 1) {
        levelWorld++;
        renderLevels();
      }
    });
  }

  // GECICI: ses karsilastirma paneli girisi
  const soundTestOpenBtn = document.getElementById('soundTestOpen');
  if (soundTestOpenBtn) {
    soundTestOpenBtn.addEventListener('pointerdown', e => e.stopPropagation());
    soundTestOpenBtn.addEventListener('click', e => {
      e.stopPropagation();
      openSoundTest();
    });
  }

  const soundTestBackBtn = document.getElementById('soundTestBack');
  if (soundTestBackBtn) {
    soundTestBackBtn.addEventListener('pointerdown', e => e.stopPropagation());
    soundTestBackBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeSoundTest();
    });
  }

  const levelsBackBtn = document.getElementById('levelsBack');
  if (levelsBackBtn) {
    levelsBackBtn.addEventListener('pointerdown', e => e.stopPropagation());
    levelsBackBtn.addEventListener('click', e => {
      e.stopPropagation();
      closeLevels();
    });
  }

  const inventoryButton = document.getElementById('inventoryOpen');
  if (inventoryButton) {
    inventoryButton.addEventListener('pointerdown', e => e.stopPropagation());
    inventoryButton.addEventListener('click', e => {
      e.stopPropagation();
      openInventory();
    });
  }

  const inventoryBack = document.getElementById('inventoryBack');
  if (inventoryBack) {
    inventoryBack.addEventListener('pointerdown', e => e.stopPropagation());
    inventoryBack.addEventListener('click', e => {
      e.stopPropagation();
      closeInventory();
    });
  }

  const settingsButton = document.getElementById('settingsOpen');
  if (settingsButton) {
    settingsButton.addEventListener('pointerdown', e => e.stopPropagation());
    settingsButton.addEventListener('click', e => {
      e.stopPropagation();
      openSettings();
    });
  }

  const settingsOk = document.getElementById('settingsOk');
  if (settingsOk) {
    settingsOk.addEventListener('pointerdown', e => e.stopPropagation());
    settingsOk.addEventListener('click', e => {
      e.stopPropagation();
      closeSettings();
    });
  }

  if (els.settingsSound) {
    els.settingsSound.addEventListener('pointerdown', e => e.stopPropagation());
    els.settingsSound.addEventListener('click', e => {
      e.stopPropagation();
      soundOn = !soundOn;
      localStorage.setItem(STORE.sound, soundOn ? '1' : '0');
      soundButton.textContent = soundOn ? ICON.speaker : ICON.muted;
      updateSettingsUi();
      if (soundOn) {
        ensureAudio();
        if (state === 'play') startAudio();
      }
      else stopAudio();
    });
  }

  if (els.settingsMusic) {
    els.settingsMusic.addEventListener('pointerdown', e => e.stopPropagation());
    els.settingsMusic.addEventListener('click', e => {
      e.stopPropagation();
      musicOn = !musicOn;
      localStorage.setItem(STORE.music, musicOn ? '1' : '0');
      if (musicOn && state === 'play') startMusic();
      else stopMusic();
      updateSettingsUi();
      sfx('tap');
    });
  }

  if (els.settingsEngine) {
    els.settingsEngine.addEventListener('pointerdown', e => e.stopPropagation());
    els.settingsEngine.addEventListener('click', e => {
      e.stopPropagation();
      engineOn = !engineOn;
      localStorage.setItem(STORE.engine, engineOn ? '1' : '0');
      if (engineOn && state === 'play') startEngine();
      else stopEngine();
      updateSettingsUi();
      sfx('tap');
    });
  }

  if (els.settingsHaptic) {
    els.settingsHaptic.addEventListener('pointerdown', e => e.stopPropagation());
    els.settingsHaptic.addEventListener('click', e => {
      e.stopPropagation();
      hapticsOn = !hapticsOn;
      localStorage.setItem(STORE.haptics, hapticsOn ? '1' : '0');
      updateSettingsUi();
      haptic([10, 18]);
    });
  }

  if (els.settingsEffects) {
    els.settingsEffects.addEventListener('pointerdown', e => e.stopPropagation());
    els.settingsEffects.addEventListener('click', e => {
      e.stopPropagation();
      effectsMode = effectsMode === 'rich' ? 'balanced' : 'rich';
      localStorage.setItem(STORE.effects, effectsMode);
      updateSettingsUi();
      banner(effectsMode === 'rich' ? 'Efektler zengin' : 'Efektler dengeli', '#8fd8ff');
      sfx('tap');
    });
  }

  if (els.settingsShake) {
    els.settingsShake.addEventListener('pointerdown', e => e.stopPropagation());
    els.settingsShake.addEventListener('click', e => {
      e.stopPropagation();
      shakeOn = !shakeOn;
      localStorage.setItem(STORE.shake, shakeOn ? '1' : '0');
      updateSettingsUi();
      sfx('tap');
    });
  }

  if (els.settingsRoute) {
    els.settingsRoute.addEventListener('pointerdown', e => e.stopPropagation());
    els.settingsRoute.addEventListener('click', e => {
      e.stopPropagation();
      routeGuideOn = !routeGuideOn;
      localStorage.setItem(STORE.route, routeGuideOn ? '1' : '0');
      updateSettingsUi();
      sfx('tap');
    });
  }

  const settingsGuide = document.getElementById('settingsGuide');
  if (settingsGuide) {
    settingsGuide.addEventListener('pointerdown', e => e.stopPropagation());
    settingsGuide.addEventListener('click', e => {
      e.stopPropagation();
      closeSettings();
      localStorage.removeItem(STORE.guide);
      openGuide();
    });
  }

  const settingsPrivacy = document.getElementById('settingsPrivacy');
  if (settingsPrivacy) {
    settingsPrivacy.addEventListener('pointerdown', e => e.stopPropagation());
    settingsPrivacy.addEventListener('click', e => {
      e.stopPropagation();
      closeSettings();
      openPrivacy();
    });
  }

  const shop = document.getElementById('shop');
  if (shop) {
    shop.addEventListener('click', e => {
      const itemEl = e.target.closest('.shop-item');
      if (!itemEl) return;
      e.stopPropagation();
      const kind = itemEl.dataset.kind;
      const id = itemEl.dataset.id;
      const list = kind === 'ship' ? SHIPS : TRAILS;
      const owned = kind === 'ship' ? ownedShips : ownedTrails;
      const item = list.find(x => x.id === id);
      if (!item) return;
      ensureAudio();
      if (!owned.includes(id)) {
        if (item.achievement) { banner('Ustalık hedefini tamamla', item.color); return; }
        if (wallet < item.cost) {
          sfx('warn');
          return;
        }
        wallet -= item.cost;
        localStorage.setItem(STORE.wallet, wallet);
        owned.push(id);
        localStorage.setItem(kind === 'ship' ? STORE.ships : STORE.trails, JSON.stringify(owned));
      }
      if (kind === 'ship') {
        selectedShip = id;
        localStorage.setItem(STORE.ship, id);
      } else {
        selectedTrail = id;
        localStorage.setItem(STORE.trail, id);
      }
      renderShop();
    });
  }

  const menuButton = document.getElementById('menu-btn');
  if (menuButton) {
    menuButton.addEventListener('pointerdown', e => e.stopPropagation());
    menuButton.addEventListener('click', e => {
      e.stopPropagation();
      state = 'menu';
      awaitingFirstInput = false;
      stopAudio();
      els.over.classList.remove('show');
      closeInventory();
      closeSettings();
      renderShop();
      showAdBanner();
      updateMetaHud();
      // Kampanyadan cikarken hangar yerine bolum listesine don.
      if (campaign.active) openLevels();
      else els.menu.classList.add('show');
    });
  }

  const retryButton = document.getElementById('retryBtn');
  if (retryButton) {
    retryButton.addEventListener('pointerdown', e => e.stopPropagation());
    retryButton.addEventListener('click', e => {
      e.stopPropagation();
      if (state !== 'over' || tNow < resultReadyAt) return;
      els.over.classList.remove('show');
      hideAdBanner();
      if (campaign.cfg?.dailyKey) { startDailyFlight(); return; }
      if (campaign.active && campaign.cfg) {
        // Kazandiysa siradaki asama, kaybettiyse ayni asama.
        const next = campaign.won ? stageAfter(campaign.cfg) : null;
        if (campaign.won && !next) {
          // Son asama bitti: acilacak baska bolum yok.
          state = 'menu';
          openLevels();
          return;
        }
        const go = next || campaign.cfg;
        startStage(go.world, go.stage);
      } else {
        startEndless();
      }
    });
  }

  if (els.rewardAdBtn) {
    els.rewardAdBtn.addEventListener('pointerdown', e => e.stopPropagation());
    els.rewardAdBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (localStorage.getItem(STORE.rewardShield) === '1') return;
      els.rewardAdBtn.disabled = true;
      els.rewardAdBtn.textContent = 'Reklam açılıyor...';
      nativeAds.showRewarded();
      setTimeout(updateRewardButton, 2200);
    });
  }

  const guideButton = document.getElementById('guideOpen');
  if (guideButton) {
    guideButton.addEventListener('pointerdown', e => e.stopPropagation());
    guideButton.addEventListener('click', e => {
      e.stopPropagation();
      openGuide();
    });
  }

  const guideOk = document.getElementById('guideOk');
  if (guideOk) {
    guideOk.addEventListener('pointerdown', e => e.stopPropagation());
    guideOk.addEventListener('click', e => {
      e.stopPropagation();
      closeGuide();
    });
  }

  const privacyButton = document.getElementById('privacyOpen');
  if (privacyButton) {
    privacyButton.addEventListener('pointerdown', e => e.stopPropagation());
    privacyButton.addEventListener('click', e => {
      e.stopPropagation();
      openPrivacy();
    });
  }

  const privacyOk = document.getElementById('privacyOk');
  if (privacyOk) {
    privacyOk.addEventListener('pointerdown', e => e.stopPropagation());
    privacyOk.addEventListener('click', e => {
      e.stopPropagation();
      closePrivacy();
    });
  }

  let briefingStage = null;

  function showStageBrief(world, stage) {
    if (!stageUnlocked(world, stage)) return;
    briefingStage = stageConfig(world, stage);
    const cfg = briefingStage;
    document.getElementById('briefIndex').textContent = `BÖLÜM ${world + 1}-${stage + 1} · ${cfg.worldName}`;
    document.getElementById('briefName').textContent = cfg.name;
    document.getElementById('briefAtmosphere').textContent = `${FlightDirector.environments[world].name}: ${FlightDirector.environments[world].detail}${cfg.finale ? ' Finalde açık çıkış koridoru.' : ''}`;
    document.getElementById('briefDistance').textContent = `${cfg.targetMeters} m`;
    document.getElementById('briefReward').textContent = starsFor(world, stage) ? 'Rota keşfedildi' : `İlk tamamlama +${cfg.reward}`;
    document.getElementById('briefGoals').innerHTML = `<li><span>★</span>Çıkışa ulaş</li><li><span>★</span>${cfg.crystalQuota} kristal topla</li><li><span>★</span>${cfg.objLabel} · en fazla 1 hasar</li>`;
    els.levels.classList.remove('show');
    document.getElementById('stageBrief').classList.add('show');
    document.getElementById('briefLaunch').focus({ preventScroll: true });
    sfx('tap');
  }

  function pauseFlight() {
    if (state !== 'play') return;
    state = 'paused';
    thrusting = false;
    activePointer = null;
    stopAudio();
    document.getElementById('pauseDistance').textContent = `${Math.floor(dist)} m · ${campaign.active ? campaign.cfg.name : 'Sonsuz Mod'}`;
    document.getElementById('flightPause').classList.add('show');
    document.getElementById('resumeFlight').focus({ preventScroll: true });
    updateHud();
  }

  function resumeFlight() {
    if (state !== 'paused' || document.hidden) return;
    appVisible = true;
    state = 'play';
    thrusting = false;
    lastT = 0;
    document.getElementById('flightPause').classList.remove('show');
    ensureAudio();
    startAudio();
    updateHud();
  }

  function installFlightUi() {
    els.stage.insertAdjacentHTML('beforeend', `
      <button id="pauseFlight" class="pause-flight" title="Duraklat" aria-label="Duraklat">Ⅱ</button>
      <div id="launchCue" class="launch-cue" hidden><span class="launch-mark"></span>Kalkış için basılı tut</div>
      <div id="stageBrief" class="overlay flight-modal" role="dialog" aria-modal="true" aria-labelledby="briefName">
        <section class="flight-sheet">
          <div class="flight-eyebrow" id="briefIndex"></div><h2 id="briefName"></h2>
          <div class="brief-flight"><img src="${ASSET_SOURCES.shipThrust}" alt=""><b id="briefDistance"></b></div>
          <p id="briefAtmosphere" class="brief-atmosphere"></p><ul class="flight-goals" id="briefGoals"></ul><p class="brief-reward" id="briefReward"></p>
          <button class="flight-primary" id="briefLaunch">Uçuşa başla <span>→</span></button>
          <button class="flight-secondary" id="briefBack">Bölümlere dön</button>
        </section>
      </div>
      <div id="flightPause" class="overlay flight-modal" role="dialog" aria-modal="true" aria-labelledby="pauseHeading">
        <section class="flight-sheet pause-sheet"><div class="flight-eyebrow">UÇUŞ DURAKLATILDI</div>
          <h2 id="pauseHeading">Kaldığın yerden.</h2><p id="pauseDistance"></p>
          <button class="flight-primary" id="resumeFlight">Devam et <span>→</span></button>
          <button class="flight-secondary" id="pauseExit">Uçuşu bitir</button>
        </section>
      </div>`);
    els.stage.dataset.flightState = state;
    const goals = document.createElement('ul');
    goals.id = 'resultObjectives';
    goals.className = 'flight-goals result-objectives';
    goals.hidden = true;
    els.stageStars.after(goals);
    const bind = (id, fn) => {
      const button = document.getElementById(id);
      button.addEventListener('pointerdown', e => e.stopPropagation());
      button.addEventListener('click', e => { e.stopPropagation(); fn(); });
    };
    bind('pauseFlight', pauseFlight);
    bind('resumeFlight', resumeFlight);
    bind('pauseExit', () => {
      if (state !== 'paused') return;
      document.getElementById('flightPause').classList.remove('show');
      state = 'over';
      endReason = 'Uçuşu bitirdin';
      finishRun(false);
    });
    bind('briefLaunch', () => {
      if (!briefingStage) return;
      const cfg = briefingStage;
      briefingStage = null;
      startStage(cfg.world, cfg.stage);
    });
    bind('briefBack', () => {
      document.getElementById('stageBrief').classList.remove('show');
      els.levels.classList.add('show');
    });
    const mixer = document.createElement('div');
    mixer.className = 'audio-mixer';
    mixer.innerHTML = Object.entries({ effects: 'Efekt düzeyi', music: 'Müzik düzeyi', engine: 'Motor düzeyi' }).map(([key, label]) =>
      `<label for="mix-${key}"><span>${label}</span><output id="mix-value-${key}">${Math.round(audioLevels[key] * 100)}%</output><input id="mix-${key}" type="range" min="0" max="100" step="5" value="${Math.round(audioLevels[key] * 100)}"></label>`).join('');
    els.settings.querySelector('.settings-list').prepend(mixer);
    mixer.addEventListener('input', e => {
      const key = e.target.id.replace('mix-', '');
      if (!(key in audioLevels)) return;
      audioLevels[key] = Number(e.target.value) / 100;
      localStorage.setItem(`ucus_mix_${key}`, audioLevels[key]);
      document.getElementById(`mix-value-${key}`).textContent = `${e.target.value}%`;
      updateAudio();
    });
    document.addEventListener('keydown', e => {
      if (e.target.matches('input,button')) return;
      if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); state === 'paused' ? resumeFlight() : pauseFlight(); }
      if (e.code === 'Space' && state === 'play' && !e.repeat) {
        e.preventDefault();
        ensureAudio();
        if (awaitingFirstInput) { awaitingFirstInput = false; startAudio(); sfx('launch'); }
        thrusting = true;
      }
    });
    document.addEventListener('keyup', e => { if (e.code === 'Space') { e.preventDefault(); pointerUp(); } });
  }

  function saveFeature(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }

  const liveryCache = new Map();
  function shipLivery(key, id) {
    const color = SHIPS.find(s => s.id === id)?.color;
    if (!color || !assetReady(key)) return null;
    const cacheKey = `${key}:${id}`;
    if (liveryCache.has(cacheKey)) return liveryCache.get(cacheKey);
    const source = gameAssets[key], canvas = document.createElement('canvas');
    canvas.width = source.naturalWidth; canvas.height = source.naturalHeight;
    const g = canvas.getContext('2d'); g.drawImage(source, 0, 0);
    g.globalCompositeOperation = 'source-atop'; g.globalAlpha = .38;
    g.fillStyle = color; g.fillRect(0, 0, canvas.width, canvas.height);
    liveryCache.set(cacheKey, canvas); return canvas;
  }

  function prepareGhost() {
    const cfg = campaign.cfg;
    if (!cfg) return;
    // A replay belongs to a route revision and viewport class, never a random endless run.
    ghostKey = `v2:${cfg.dailyKey || `${cfg.world}-${cfg.stage}`}:${Math.round(W / H * 20)}`;
    const saved = readObject('ucus_ghosts_v2', {})[ghostKey];
    if (saved && Array.isArray(saved.frames) && saved.frames.length <= 2400 && saved.frames.every(f =>
      Array.isArray(f) && f.length === 3 && f.every(Number.isFinite))) rivalGhost = saved;
    ghostFrames = [[0, 0, 0]];
  }

  function recordGhostFrame() {
    if (!ghostKey || ghostFrames.length >= 2400 || state !== 'play') return;
    if (flightTime - ghostFrames[ghostFrames.length - 1][0] < .1) return;
    ghostFrames.push([+flightTime.toFixed(3), +dist.toFixed(2),
      +clamp((shipY - centerY(worldX + shipX())) / gapHalf(), -1, 1).toFixed(3)]);
  }

  function drawGhost() {
    if (!ghostOn || !rivalGhost || state !== 'play' || awaitingFirstInput) return;
    const frame = FlightDirector.ghostAt(rivalGhost.frames, flightTime);
    if (!frame) return;
    const x = shipX() + (frame.meters - dist) * METERS_TO_PX;
    if (x < -50 || x > W + 50) return;
    const y = centerY(worldX + x) + frame.lane * gapHalf();
    drawAsset('shipIdle', x, y, 48, 30, 0, .25);
    ctx.save(); ctx.fillStyle = '#bfe8df'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('REKOR', x, y - 22); ctx.restore();
  }

  function drawAtmosphere() {
    if (state !== 'play') return;
    const env = FlightDirector.environment(biomeIdx, dist);
    if (!env.active && !env.warning) return;
    ctx.save(); ctx.strokeStyle = biomeIdx % 5 === 1 ? '#f0c479' : '#c5d8e8';
    ctx.globalAlpha = env.warning ? .18 : .32; ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      const x = W * .48 + i * W * .09, y = H * .6 + Math.sin(flightTime * 1.4 + i) * 12;
      const direction = biomeIdx % 5 === 1 ? -1 : 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + direction * 28);
      ctx.lineTo(x - 4, y + direction * 22); ctx.stroke();
    }
    ctx.restore();
  }

  function drawFinaleFrame() {
    if (!campaign.cfg?.finale || !finaleAnnounced || state !== 'play') return;
    const amount = clamp((dist / campaign.cfg.targetMeters - .72) / .12, 0, 1);
    ctx.save(); ctx.fillStyle = `rgba(4,8,12,${amount * .42})`;
    // Edge framing does not obscure the flight corridor or alter collision coordinates.
    ctx.fillRect(0, 0, W, 12 * amount); ctx.fillRect(0, H - 12 * amount, W, 12 * amount);
    ctx.strokeStyle = `rgba(243,199,107,${amount * .5})`; ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, W - 4, H - 4); ctx.restore();
  }

  function startDailyFlight() {
    const cfg = FlightDirector.daily();
    campaign.active = true; campaign.cfg = cfg; campaign.won = false; campaign.lastStars = 0;
    start(); seed = cfg.seed; routeEvents = FlightDirector.route(cfg); setBiome(cfg.biome, true);
    mission = { type: cfg.objType, target: cfg.objTarget, label: cfg.objLabel, completed: false, level: 1 };
    prepareGhost(); updateMissionHud();
    document.getElementById('dailyRoutePanel').classList.remove('show');
    banner('Günün rotası', curBiome.accent);
  }

  function unlockMastery() {
    const unlocked = FlightDirector.earned(flightStats);
    for (const reward of unlocked) {
      const list = reward.kind === 'ship' ? ownedShips : ownedTrails;
      if (!list.includes(`award-${reward.id}`)) list.push(`award-${reward.id}`);
    }
    saveFeature(STORE.ships, ownedShips); saveFeature(STORE.trails, ownedTrails);
    return unlocked;
  }

  function renderMastery() {
    const container = document.getElementById('masteryList');
    if (!container) return;
    const earned = FlightDirector.earned(flightStats).map(a => a.id);
    container.innerHTML = FlightDirector.achievements.map(a => `<li class="${earned.includes(a.id) ? 'earned' : ''}"><span class="mastery-mark" style="--award:${a.color}">${earned.includes(a.id) ? '★' : '☆'}</span><div><b>${a.title}</b><small>${a.detail}</small></div><span>${earned.includes(a.id) ? 'Açıldı' : a.kind === 'ship' ? 'Gemi' : 'İz'}</span></li>`).join('');
  }

  function completeFlightFeatures(won, score, meters) {
    const cfg = campaign.active ? campaign.cfg : null;
    const prior = FlightDirector.earned(flightStats).map(a => a.id);
    if (cfg && won) {
      flightStats.wins = (Number(flightStats.wins) || 0) + 1;
      flightStats.clean ||= {};
      if (!cfg.dailyKey && runHits === 0) flightStats.clean[`${cfg.world}-${cfg.stage}`] = true;
      if (cfg.finale) flightStats.finals = (Number(flightStats.finals) || 0) + 1;
      if (cfg.dailyKey) flightStats.days = [...new Set([...(flightStats.days || []), cfg.dailyKey])].slice(-90);
      saveFeature('ucus_mastery_v1', flightStats);
    }
    if (cfg?.dailyKey) {
      const previous = dailyRecords[cfg.dailyKey] || {};
      dailyRecords[cfg.dailyKey] = { score: Math.max(previous.score || 0, score), won: !!(won || previous.won), meters: Math.max(previous.meters || 0, meters) };
      dailyRecords = Object.fromEntries(Object.entries(dailyRecords).sort().slice(-30));
      saveFeature('ucus_daily_routes_v1', dailyRecords);
    }
    if (ghostKey && ghostFrames.length > 1 && (!rivalGhost || (won && !rivalGhost.won) || (won === rivalGhost.won && score > rivalGhost.score))) {
      const records = readObject('ucus_ghosts_v2', {});
      delete records[ghostKey];
      records[ghostKey] = { score, won, frames: ghostFrames };
      saveFeature('ucus_ghosts_v2', Object.fromEntries(Object.entries(records).slice(-10)));
    }
    const rewards = unlockMastery().filter(a => !prior.includes(a.id));
    document.getElementById('resultUnlock').textContent = rewards.length ? `Yeni görünüm: ${rewards.map(a => a.title).join(', ')}` : '';
    resultSnapshot = { score, meters, crystals: runCrystals, stars: cfg ? campaign.lastStars : 0,
      title: cfg?.dailyKey ? 'GÜNÜN ROTASI' : cfg ? `BÖLÜM ${cfg.world + 1}-${cfg.stage + 1}` : 'SONSUZ MOD',
      route: cfg?.dailyKey || (cfg ? cfg.worldName : curBiome.name), won, ship: selectedShip };
  }

  function challengeCanvas() {
    const data = resultSnapshot;
    if (!data) return null;
    const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 1350;
    const g = canvas.getContext('2d'); g.fillStyle = '#101719'; g.fillRect(0, 0, 1080, 1350);
    if (gameAssets.parallaxSpace) { g.globalAlpha = .5; g.drawImage(gameAssets.parallaxSpace, 0, 0, 1080, 650); g.globalAlpha = 1; }
    const text = (value, y, size, color) => { g.fillStyle = color; g.font = `600 ${size}px sans-serif`; g.textAlign = 'center'; g.fillText(value, 540, y, 940); };
    text('SONSUZ UÇUŞ', 115, 56, '#ffffff');
    text(data.title, 185, 25, '#a2efd1'); text(data.route, 229, 23, '#c9d5d5');
    const ship = shipLivery('shipThrust', data.ship) || gameAssets.shipThrust || gameAssets.shipIdle;
    if (ship) { const h = 280 * ship.height / ship.width; g.drawImage(ship, 400, 355 - h / 2, 280, h); }
    text(data.score.toLocaleString('tr-TR'), 590, 120, '#ffffff'); text('PUAN', 641, 26, '#a2efd1');
    text(`${data.meters} m   ·   ${data.crystals} kristal`, 746, 36, '#ffffff');
    if (data.stars) text('★'.repeat(data.stars) + '☆'.repeat(3 - data.stars), 839, 66, '#f3c76b');
    g.fillStyle = '#a2efd1'; g.fillRect(430, 930, 220, 3);
    text('BU ROTADA SENİN REKORUN KAÇ?', 1030, 32, '#ffffff');
    text('Kişisel uçuş sonucu', 1090, 23, '#c9d5d5'); text('CESA STUDIO', 1270, 25, '#a2efd1');
    return canvas;
  }

  async function shareChallenge() {
    const canvas = challengeCanvas();
    if (!canvas) return;
    const button = document.getElementById('shareChallenge'); button.disabled = true;
    try {
      if (window.ucusAudioBridge?.shareCard) { window.ucusAudioBridge.shareCard(canvas.toDataURL('image/png')); return; }
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG unavailable');
      const file = new File([blob], 'sonsuz-ucus-meydan-okuma.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'Sonsuz Uçuş' });
      else {
        const url = URL.createObjectURL(blob), link = document.createElement('a');
        link.href = url; link.download = file.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 30000);
      }
    } catch (error) { if (error.name !== 'AbortError') banner('Paylaşım açılamadı. Tekrar deneyebilirsin.', '#f3c76b'); }
    finally { button.disabled = false; }
  }

  function installDiscoveryUi() {
    const dailyButton = document.createElement('button'); dailyButton.id = 'dailyRouteOpen'; dailyButton.className = 'flight-secondary daily-route-open';
    dailyButton.textContent = '◷ Günün rotası'; els.stageGrid.before(dailyButton);
    const panel = document.createElement('div'); panel.id = 'dailyRoutePanel'; panel.className = 'overlay flight-modal';
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'dailyRouteTitle');
    panel.innerHTML = `<section class="flight-sheet daily-sheet"><div class="flight-eyebrow">GÜNLÜK MEYDAN OKUMA</div><h2 id="dailyRouteTitle">Günün rotası</h2><p id="dailyRouteDate"></p><div class="brief-flight"><img src="${ASSET_SOURCES.shipThrust}" alt=""><b>1150 m</b></div><p id="dailyRouteBest"></p><p id="dailyRouteEnvironment"></p><p class="brief-reward">İlk tamamlama +35 kristal</p><p class="daily-note">00.00 UTC'de yenilenir · Rekor bu cihazda</p><button class="flight-primary" id="dailyRouteLaunch">Uçuşa başla <span>→</span></button><button class="flight-secondary" id="dailyRouteBack">Bölümlere dön</button></section>`;
    els.stage.append(panel);
    const bind = (button, fn) => { button.addEventListener('pointerdown', e => e.stopPropagation()); button.addEventListener('click', e => { e.stopPropagation(); fn(); }); };
    bind(dailyButton, () => {
      const cfg = FlightDirector.daily(), record = dailyRecords[cfg.dailyKey];
      document.getElementById('dailyRouteDate').textContent = `${cfg.dailyKey} · ${cfg.worldName}`;
      document.getElementById('dailyRouteBest').textContent = record ? `Kişisel rekor: ${record.score} puan · ${record.meters} m` : 'İlk uçuşun seni bekliyor';
      document.getElementById('dailyRouteEnvironment').textContent = FlightDirector.environments[cfg.world].detail;
      panel.querySelector('.brief-reward').textContent = record?.won ? 'Bugünün tamamlama ödülü alındı' : 'İlk tamamlama +35 kristal';
      panel.classList.add('show'); document.getElementById('dailyRouteLaunch').focus();
    });
    bind(document.getElementById('dailyRouteBack'), () => { panel.classList.remove('show'); dailyButton.focus(); });
    bind(document.getElementById('dailyRouteLaunch'), startDailyFlight);
    const mastery = document.createElement('section'); mastery.className = 'mastery-section';
    mastery.innerHTML = '<h3>Ustalık koleksiyonu</h3><ul id="masteryList"></ul>';
    document.getElementById('shop').append(mastery);
    const setting = document.createElement('label'); setting.className = 'ghost-setting';
    setting.innerHTML = `<span>Rekor hayaleti</span><input id="ghostToggle" type="checkbox" ${ghostOn ? 'checked' : ''}>`;
    els.settings.querySelector('.settings-list').append(setting);
    setting.querySelector('input').addEventListener('change', e => { ghostOn = e.target.checked; localStorage.setItem('ucus_ghost_enabled', ghostOn ? '1' : '0'); });
    const resultFooter = document.createElement('div'); resultFooter.className = 'discovery-result';
    resultFooter.innerHTML = '<p id="resultUnlock" role="status"></p><button id="shareChallenge" class="flight-secondary">↗ Meydan okumayı paylaş</button>';
    els.over.append(resultFooter); bind(document.getElementById('shareChallenge'), shareChallenge);
  }

  installFlightUi();
  installDiscoveryUi();
  loadCampaign();
  loadGameAssets();
  // Sesleri pesin coz: ilk dokunusta beklenirse ornekler hazir olmaz ve
  // sesler yuksek gecikmeli HTML Audio yoluna duser. Oyunun ilk
  // saniyeleri tam da en cok ses cikan an.
  createAudioContext();
  decodeAudioAssets();
  renderShop();
  resize();
  updateHud();
  updateRewardButton();
  updateSettingsUi();
  showAdBanner();
  if (localStorage.getItem(STORE.guide) !== '1') {
    setTimeout(openGuide, 250);
  }
  rafId = requestAnimationFrame(loop);
})();
