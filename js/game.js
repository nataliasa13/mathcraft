const SAVE_KEY = 'mathcraft-tablas-v1';
const FACTORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const TABLES = [
  { n: 2, icon: '🏡' },
  { n: 3, icon: '🌬️' },
  { n: 4, icon: '🐴' },
  { n: 5, icon: '🌾' },
  { n: 6, icon: '🏰' },
  { n: 7, icon: '🗼' },
  { n: 8, icon: '👑' },
  { n: 9, icon: '💎' }
];
const STAGES = [
  [2, 3, 4],
  [5, 6],
  [7, 8, 9]
];
const PICKER_ORDER = [2, 3, 4, 5, 6, 7, 8, 9];
const MAT_KEYS = ['wood', 'stone', 'iron', 'gold', 'diamond'];
const BONUS = [
  ['diamond', 1, 'loot_1_diamond'],
  ['wood', 4, 'loot_4_wood'],
  ['stone', 4, 'loot_4_stone'],
  ['iron', 2, 'loot_2_iron']
];
const MAX_STARS = 5;
const RECIPES = [
  { id: 'wood_sword', type: 'wood', cost: 6, icon: '🗡️', category: 'weapon', item: 'wood_sword' },
  { id: 'stone_pick', type: 'stone', cost: 6, icon: '⛏️', category: 'weapon', item: 'stone_pick' },
  { id: 'iron_armor', type: 'iron', cost: 4, icon: '🛡️', category: 'armor', item: 'iron' },
  { id: 'gold_apple', type: 'gold', cost: 3, icon: '🍎', category: 'weapon', item: 'gold_apple' },
  { id: 'diamond_sword', type: 'diamond', cost: 2, icon: '⚔️', category: 'weapon', item: 'diamond_sword' },
  { id: 'diamond_armor', type: 'diamond', cost: 4, icon: '💎', category: 'armor', item: 'diamond' }
];

function defaultState() {
  const mastered = {};
  const pending = {};
  TABLES.forEach(t => { mastered[t.n] = []; });
  return {
    currentTable: 2,
    mastered,
    pending,
    inventory: { wood: 0, stone: 0, iron: 0, gold: 0, diamond: 0 },
    armor: null,
    weapon: null,
    crafted: {},
    stars: {},
    sound: true,
    unaidedCount: 0,
    streak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    streakGoal: 3
  };
}

const MASTER_TITLES = [
  { at: 0, key: 'title_0' },
  { at: 15, key: 'title_15' },
  { at: 40, key: 'title_40' },
  { at: 80, key: 'title_80' },
  { at: 150, key: 'title_150' },
  { at: 250, key: 'title_250' },
  { at: 400, key: 'title_400' }
];
function masterTitle(total) {
  let key = MASTER_TITLES[0].key;
  MASTER_TITLES.forEach(item => { if (total >= item.at) key = item.key; });
  return t(key);
}
function nextMasterAt(total) {
  for (let i = 0; i < MASTER_TITLES.length; i++) {
    if (total < MASTER_TITLES[i].at) return MASTER_TITLES[i].at;
  }
  return null;
}
function nextStreakGoal(current) {
  const ladder = [3, 5, 8, 10, 15, 20, 30];
  for (let i = 0; i < ladder.length; i++) {
    if (current < ladder[i]) return ladder[i];
  }
  return current + 10;
}

function starLevel(id) {
  const n = Number(state.stars[id]) || 0;
  return Math.max(0, Math.min(MAX_STARS, Math.floor(n)));
}
function starsText(n) {
  if (n <= 0) return '';
  return ' ' + '★'.repeat(n);
}
function upgradeCost(rec) {
  const s = starLevel(rec.id);
  return rec.cost + s * Math.max(2, Math.ceil(rec.cost / 2));
}
function recipeByItem(category, item) {
  return RECIPES.find(r => r.category === category && r.item === item) || null;
}
function equippedStars() {
  let total = 0;
  const arm = recipeByItem('armor', state.armor);
  const wep = recipeByItem('weapon', state.weapon);
  if (arm) total += starLevel(arm.id);
  if (wep) total += starLevel(wep.id);
  return total;
}

let state = defaultState();
let chestOpen = false;
let practice = false;
let inputLocked = false;
let currentQ = null;
let activeTab = 'aldea'; // aldea | minar | cofre

const AudioSys = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(freq, dur, type, vol) {
    if (!state.sound || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  },
  playPop() { this.init(); this.tone(180, 0.08, 'triangle', 0.2); },
  playDing() { this.init(); this.tone(880, 0.22, 'sine', 0.18); },
  playOof() { this.init(); this.tone(140, 0.16, 'triangle', 0.12); },
  playFanfare() {
    this.init();
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.22, 'triangle', 0.16), i * 90));
  }
};

function tableBy(n) { return TABLES.find(t => t.n === Number(n)); }
function stageOf(n) { return STAGES.findIndex(s => s.includes(Number(n))); }
function isComplete(n) { return state.mastered[n] && state.mastered[n].length >= 10; }
function isStageClear(i) { return STAGES[i].every(isComplete); }
function isUnlocked(n) {
  return Boolean(tableBy(n)); // Todas libres: el niño elige cuál practicar
}
function joinEs(parts) {
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(', ') + t('and') + parts[parts.length - 1];
}
function vecesPhrase(a, b) {
  return t(a === 1 ? 'times_one' : 'times', { a, b });
}
function helpIntro(a, b) {
  const rows = a === 1 ? t('row_one') : t('row_many', { n: a });
  const cols = b === 1 ? t('block_one') : t('block_many', { n: b });
  return t('help_intro', { phrase: vecesPhrase(a, b), rows, cols });
}
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}
function generateOptions(ans, table) {
  const set = new Set([ans]);
  let guard = 0;
  while (set.size < 4 && guard < 40) {
    guard++;
    let cand;
    if (Math.random() < 0.55) {
      cand = ans + (Math.random() < 0.5 ? table : -table);
    } else {
      cand = (Math.floor(Math.random() * 10) + 1) * table;
    }
    if (cand > 0 && cand < 250) set.add(cand);
  }
  let extra = 1;
  while (set.size < 4 && extra < 20) {
    if (ans + extra > 0) set.add(ans + extra);
    extra++;
  }
  return shuffle(Array.from(set).slice(0, 4));
}
function makeQuestion(table, n) {
  const swap = n !== table && Math.random() < 0.5;
  const a = swap ? n : table;
  const b = swap ? table : n;
  const ans = table * n;
  return { table, n, a, b, ans, fails: 0, revealed: false, options: generateOptions(ans, table) };
}
function factorsLeft(table) {
  const have = state.mastered[table] || [];
  return FACTORS.filter(n => !have.includes(n));
}
function pickFactor(table, avoid) {
  // Si la obra ya está terminada, se puede seguir practicando toda la tabla
  let pool = (practice || isComplete(table)) ? FACTORS.slice() : factorsLeft(table);
  if (!pool.length) pool = FACTORS.slice();
  if (pool.length > 1 && avoid != null) {
    const filtered = pool.filter(n => n !== avoid);
    if (filtered.length) pool = filtered;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
function normalizeQuestion(q) {
  if (!q || typeof q !== 'object') return null;
  const table = Number(q.table);
  const n = Number(q.n);
  if (!tableBy(table) || n < 1 || n > 10) return null;
  const ans = table * n;
  let a = Number(q.a);
  let b = Number(q.b);
  if (a * b !== ans) { a = table; b = n; }
  let options = Array.isArray(q.options) ? q.options.map(Number).filter(x => x > 0) : [];
  if (!options.includes(ans) || new Set(options).size < 4) options = generateOptions(ans, table);
  return {
    table, n, a, b, ans,
    fails: Math.max(0, Number(q.fails) || 0),
    revealed: Boolean(q.revealed) || (Number(q.fails) || 0) >= 2,
    options: options.slice(0, 4)
  };
}

function save() {
  try {
    const copy = {
      currentTable: state.currentTable,
      mastered: state.mastered,
      pending: state.pending,
      inventory: state.inventory,
      armor: state.armor,
      weapon: state.weapon,
      crafted: state.crafted,
      stars: state.stars,
      sound: state.sound,
      unaidedCount: state.unaidedCount,
      streak: state.streak,
      bestStreak: state.bestStreak,
      totalCorrect: state.totalCorrect,
      streakGoal: state.streakGoal
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(copy));
  } catch (e) {}
}
function load() {
  const base = defaultState();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return base;
    const data = JSON.parse(raw);
    TABLES.forEach(t => {
      const arr = data.mastered && data.mastered[t.n];
      base.mastered[t.n] = Array.isArray(arr)
        ? [...new Set(arr.map(Number).filter(x => x >= 1 && x <= 10))]
        : [];
      base.pending[t.n] = normalizeQuestion(data.pending && data.pending[t.n]);
      if (base.pending[t.n] && base.mastered[t.n].includes(base.pending[t.n].n)) base.pending[t.n] = null;
    });
    MAT_KEYS.forEach(key => {
      const n = Number(data.inventory && data.inventory[key]);
      base.inventory[key] = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    });
    if (tableBy(data.currentTable) && isUnlockedTable(base, Number(data.currentTable))) {
      base.currentTable = Number(data.currentTable);
    } else if (Number(data.currentTable) === 10) {
      base.currentTable = 2; // la tabla del 10 ya no existe
    }
    base.armor = data.armor === 'iron' || data.armor === 'diamond' ? data.armor : null;
    base.weapon = typeof data.weapon === 'string' ? data.weapon : null;
    base.crafted = data.crafted && typeof data.crafted === 'object' ? data.crafted : {};
    base.stars = {};
    if (data.stars && typeof data.stars === 'object') {
      RECIPES.forEach(rec => {
        const n = Number(data.stars[rec.id]);
        if (Number.isFinite(n) && n > 0) base.stars[rec.id] = Math.min(MAX_STARS, Math.floor(n));
      });
    }
    // Si estaba craftado sin estrellas, cuenta como ★ base
    RECIPES.forEach(rec => {
      if (base.crafted[rec.id] && !base.stars[rec.id]) base.stars[rec.id] = 1;
    });
    base.sound = data.sound !== false;
    base.unaidedCount = Math.max(0, Number(data.unaidedCount) || 0);
    base.streak = Math.max(0, Number(data.streak) || 0);
    base.bestStreak = Math.max(0, Number(data.bestStreak) || 0);
    base.totalCorrect = Math.max(0, Number(data.totalCorrect) || 0);
    base.streakGoal = Math.max(3, Number(data.streakGoal) || 3);
    if (!isUnlockedTable(base, base.currentTable)) base.currentTable = 2;
  } catch (e) {
    return defaultState();
  }
  return base;
}
function isUnlockedTable(snapshot, n) {
  return Boolean(tableBy(n));
}

function setFeedback(text) {
  document.getElementById('feedback').textContent = text;
}
let toastTimer = null;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}
function updateStreakUI() {
  document.getElementById('streak-num').textContent = String(state.streak);
  document.getElementById('streak-goal').textContent = t('streak_goal', { n: state.streakGoal });
  document.getElementById('streak-box').classList.toggle('hot', state.streak >= 3);
  const next = nextMasterAt(state.totalCorrect);
  const title = masterTitle(state.totalCorrect);
  document.getElementById('master-line').textContent = next == null
    ? t('master_line', { title, n: state.totalCorrect })
    : t('master_line_next', { title, n: state.totalCorrect, next });
}
function registerWrong() {
  state.streak = 0;
  updateStreakUI();
  save();
}
function registerCorrect(unaided) {
  const beforeTitle = masterTitle(state.totalCorrect);
  state.totalCorrect += 1;
  if (unaided) {
    state.streak += 1;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;
  } else {
    state.streak = 0;
  }

  // Premios de racha / meta
  if (unaided && state.streak > 0 && state.streak === state.streakGoal) {
    const bonusXPFeel = state.streakGoal;
    if (bonusXPFeel >= 10) {
      state.inventory.diamond += 1;
      state.inventory.gold += 1;
      showToast(t('toast_streak_dia', { n: state.streak }));
    } else if (bonusXPFeel >= 5) {
      state.inventory.gold += 1;
      state.inventory.iron += 1;
      showToast(t('toast_streak_gold', { n: state.streak }));
    } else {
      state.inventory.iron += 1;
      state.inventory.stone += 2;
      showToast(t('toast_streak_iron', { n: state.streak }));
    }
    AudioSys.playFanfare();
    state.streakGoal = nextStreakGoal(state.streakGoal);
  } else if (unaided && (state.streak === 3 || state.streak === 8 || state.streak === 15)) {
    state.inventory.wood += 2;
    showToast(t('toast_streak_wood', { n: state.streak }));
    AudioSys.playDing();
  }

  const afterTitle = masterTitle(state.totalCorrect);
  if (afterTitle !== beforeTitle) {
    state.inventory.diamond += 1;
    state.inventory.gold += 2;
    showToast(t('toast_title', { title: afterTitle }));
    AudioSys.playFanfare();
  }

  updateStreakUI();
  save();
}
function rememberQuestion() {
  if (!practice && currentQ) state.pending[currentQ.table] = currentQ;
}

const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

function px(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
function drawSky(g) {
  px(0, 0, 400, 240, '#6ca6f0');
  px(330, 16, 28, 28, '#fff4a8');
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.fillRect(24, 22, 70, 14);
  ctx.fillRect(36, 14, 40, 10);
  ctx.fillRect(150, 30, 64, 12);
  px(0, g, 400, 12, '#5b8c32');
  px(0, g + 12, 400, 28, '#866043');
  px(0, g + 40, 400, 240, '#5a5a5a');
  px(356, g - 36, 8, 36, '#4a2d13');
  px(344, g - 54, 32, 20, '#2e631b');
}
function drawSign(g) {
  px(188, g - 28, 28, 16, '#e6d2a8');
  px(198, g - 12, 8, 12, '#6b4423');
}
function drawCabin(p, g) {
  if (p >= 1) px(150, g - 8, 128, 8, '#737373');
  if (p >= 2) px(156, g - 14, 116, 8, '#8d8d8d');
  if (p >= 3) px(158, g - 48, 12, 36, '#4a2d13');
  if (p >= 4) px(258, g - 48, 12, 36, '#4a2d13');
  if (p >= 5) px(170, g - 42, 88, 28, '#ba8c63');
  if (p >= 6) px(170, g - 54, 88, 14, '#a07850');
  if (p >= 7) {
    ctx.fillStyle = '#633c1a';
    ctx.beginPath();
    ctx.moveTo(146, g - 52);
    ctx.lineTo(214, g - 86);
    ctx.lineTo(214, g - 52);
    ctx.fill();
  }
  if (p >= 8) {
    ctx.fillStyle = '#633c1a';
    ctx.beginPath();
    ctx.moveTo(146, g - 52);
    ctx.lineTo(214, g - 92);
    ctx.lineTo(282, g - 52);
    ctx.fill();
  }
  if (p >= 9) px(206, g - 36, 16, 22, '#331a06');
  if (p >= 10) {
    px(178, g - 46, 14, 12, '#b8e3ff');
    px(236, g - 46, 14, 12, '#b8e3ff');
  }
}
function drawFarm(p, g) {
  if (p >= 1) px(132, g - 8, 150, 8, '#6b4423');
  if (p >= 2) px(124, g - 16, 176, 8, '#8a5a32');
  if (p >= 3) {
    px(128, g - 32, 6, 18, '#c4a574');
    px(290, g - 32, 6, 18, '#c4a574');
  }
  if (p >= 4) px(128, g - 30, 168, 5, '#c4a574');
  if (p >= 5) {
    for (let i = 0; i < 5; i++) px(150 + i * 22, g - 24, 8, 10, '#d6c04a');
  }
  if (p >= 6) px(176, g - 58, 72, 42, '#a33b32');
  if (p >= 7) px(186, g - 78, 52, 22, '#c4844a');
  if (p >= 8) {
    ctx.fillStyle = '#6b4423';
    ctx.beginPath();
    ctx.moveTo(168, g - 74);
    ctx.lineTo(212, g - 102);
    ctx.lineTo(256, g - 74);
    ctx.fill();
  }
  if (p >= 9) px(204, g - 48, 16, 24, '#3a2414');
  if (p >= 10) px(214, g - 112, 8, 14, '#f2e2a0');
}
function drawMill(p, g) {
  if (p >= 1) px(168, g - 8, 90, 8, '#737373');
  if (p >= 2) px(176, g - 36, 74, 28, '#d9c4a0');
  if (p >= 3) px(176, g - 58, 74, 24, '#cbb892');
  if (p >= 4) px(196, g - 78, 34, 22, '#8d8d8d');
  if (p >= 5) {
    ctx.fillStyle = '#6e4b32';
    ctx.beginPath();
    ctx.moveTo(166, g - 56);
    ctx.lineTo(213, g - 96);
    ctx.lineTo(260, g - 56);
    ctx.fill();
  }
  if (p >= 6) px(206, g - 40, 14, 24, '#4a2d13');
  if (p >= 7) px(184, g - 50, 12, 12, '#b8e3ff');
  if (p >= 8) {
    ctx.fillStyle = '#f0e2b0';
    ctx.fillRect(178, g - 92, 70, 6);
  }
  if (p >= 9) {
    ctx.fillStyle = '#f0e2b0';
    ctx.fillRect(207, g - 122, 6, 64);
  }
  if (p >= 10) px(204, g - 128, 12, 10, '#ffd043');
}
function drawStable(p, g) {
  if (p >= 1) px(140, g - 10, 140, 10, '#6b4423');
  if (p >= 2) px(136, g - 28, 8, 20, '#c4a574');
  if (p >= 3) px(276, g - 28, 8, 20, '#c4a574');
  if (p >= 4) px(136, g - 26, 148, 5, '#c4a574');
  if (p >= 5) px(168, g - 52, 84, 42, '#b5653b');
  if (p >= 6) px(160, g - 64, 100, 14, '#8c4630');
  if (p >= 7) {
    ctx.fillStyle = '#6b3030';
    ctx.beginPath();
    ctx.moveTo(156, g - 62);
    ctx.lineTo(210, g - 96);
    ctx.lineTo(264, g - 62);
    ctx.fill();
  }
  if (p >= 8) px(198, g - 40, 22, 28, '#3a2414');
  if (p >= 9) px(176, g - 48, 14, 12, '#f2e2a0');
  if (p >= 10) px(228, g - 48, 14, 12, '#f2e2a0');
}
function drawCastle(p, g) {
  if (p >= 1) px(132, g - 12, 156, 12, '#6e6e6e');
  if (p >= 2) px(140, g - 36, 140, 26, '#8a8a8a');
  if (p >= 3) px(140, g - 58, 140, 24, '#7a7a7a');
  if (p >= 4) px(132, g - 86, 28, 76, '#9a9a9a');
  if (p >= 5) px(260, g - 86, 28, 76, '#9a9a9a');
  if (p >= 6) {
    for (let i = 0; i < 6; i++) px(144 + i * 22, g - 70, 12, 10, '#666');
  }
  if (p >= 7) px(196, g - 34, 28, 24, '#3a3a3a');
  if (p >= 8) px(148, g - 98, 16, 14, '#c44536');
  if (p >= 9) px(268, g - 98, 16, 14, '#3a6ec4');
  if (p >= 10) {
    px(206, g - 108, 8, 22, '#ffd043');
    px(202, g - 112, 16, 6, '#ffd043');
  }
}
function drawTower(p, g) {
  const floors = Math.max(p, 0);
  px(186, g - 10, 52, 10, '#6e6e6e');
  for (let i = 0; i < floors && i < 9; i++) {
    px(190, g - 22 - i * 14, 44, 14, i % 2 ? '#8d8d8d' : '#b9b9b9');
  }
  if (p >= 10) {
    px(184, g - 22 - 9 * 14, 56, 10, '#6a8f3a');
    px(206, g - 40 - 9 * 14, 12, 18, '#ffd043');
  }
}
function drawPalace(p, g) {
  const colors = ['#f0d36a', '#7fe7ef', '#f7e7a1', '#49c4d4', '#ffe98a', '#b8fff8', '#e6c14a', '#ffffff', '#8cf0ff', '#fff4b0'];
  if (p >= 1) px(140, g - 12, 140, 12, colors[0]);
  for (let i = 1; i < p && i < 8; i++) {
    px(148 + i * 2, g - 12 - i * 14, 124 - i * 4, 14, colors[i]);
  }
  if (p >= 9) px(196, g - 130, 28, 22, '#fff');
  if (p >= 10) px(206, g - 148, 8, 20, '#55ffff');
}
function drawLighthouse(p, g) {
  const h = 12 + p * 9;
  px(188, g - h, 40, h, p >= 10 ? '#f4f1ea' : '#ddd6cc');
  if (p >= 2) px(188, g - h, 40, 8, '#d04538');
  if (p >= 5) px(188, g - Math.floor(h / 2), 40, 8, '#d04538');
  if (p >= 8) px(200, g - 28, 16, 16, '#9fd7ff');
  if (p >= 10) {
    px(196, g - h - 16, 24, 16, '#ffe566');
    px(204, g - h - 28, 8, 14, '#4a2d13');
  }
}
function drawBuild(table, p, g) {
  if (p <= 0) { drawSign(g); return; }
  if (table === 2) drawCabin(p, g);
  else if (table === 3) drawMill(p, g);
  else if (table === 4) drawStable(p, g);
  else if (table === 5) drawFarm(p, g);
  else if (table === 6) drawCastle(p, g);
  else if (table === 7) drawTower(p, g);
  else if (table === 8) drawPalace(p, g);
  else if (table === 9) drawLighthouse(p, g);
}
function drawFullSteve(c, x, y, scale) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  const armor = state.armor;
  const weapon = state.weapon;
  const armorCol = armor === 'diamond' ? '#55ffff' : (armor === 'iron' ? '#e2c6b2' : null);
  const armorDark = armor === 'diamond' ? '#00aaaa' : (armor === 'iron' ? '#999' : null);
  c.fillStyle = '#b8825c';
  c.fillRect(4, 0, 16, 16);
  c.fillStyle = '#4a2d13';
  c.fillRect(4, 0, 16, 5);
  c.fillRect(4, 5, 2, 4);
  c.fillRect(18, 5, 2, 4);
  c.fillStyle = '#fff';
  c.fillRect(6, 6, 4, 3);
  c.fillRect(14, 6, 4, 3);
  c.fillStyle = '#2b3b8c';
  c.fillRect(8, 7, 2, 2);
  c.fillRect(14, 7, 2, 2);
  c.fillStyle = '#6b3c1b';
  c.fillRect(8, 12, 8, 2);
  if (armorCol) {
    c.fillStyle = armorCol;
    c.fillRect(3, -2, 18, 6);
    c.fillRect(3, 4, 3, 8);
    c.fillRect(18, 4, 3, 8);
    c.fillStyle = armorDark;
    c.fillRect(3, -2, 18, 2);
    c.fillStyle = armorCol;
    c.fillRect(4, 16, 16, 16);
    c.fillStyle = armorDark;
    c.fillRect(4, 30, 16, 2);
  } else {
    c.fillStyle = '#00aaaa';
    c.fillRect(4, 16, 16, 16);
  }
  if (armorCol) {
    c.fillStyle = armorCol;
    c.fillRect(0, 16, 4, 8);
    c.fillStyle = '#b8825c';
    c.fillRect(0, 24, 4, 8);
    c.fillStyle = armorCol;
    c.fillRect(4, 32, 7, 12);
    c.fillRect(13, 32, 7, 12);
    c.fillStyle = armorDark;
    c.fillRect(4, 44, 7, 4);
    c.fillRect(13, 44, 7, 4);
    c.fillStyle = armorCol;
    c.fillRect(20, 16, 4, 8);
    c.fillStyle = '#b8825c';
    c.fillRect(20, 24, 4, 8);
  } else {
    c.fillStyle = '#00aaaa';
    c.fillRect(0, 16, 4, 6);
    c.fillRect(20, 16, 4, 6);
    c.fillStyle = '#b8825c';
    c.fillRect(0, 22, 4, 10);
    c.fillRect(20, 22, 4, 10);
    c.fillStyle = '#2b3b8c';
    c.fillRect(4, 32, 7, 12);
    c.fillRect(13, 32, 7, 12);
    c.fillStyle = '#444';
    c.fillRect(4, 44, 7, 4);
    c.fillRect(13, 44, 7, 4);
  }
  if (weapon === 'diamond_sword' || weapon === 'wood_sword') {
    const blade = weapon === 'diamond_sword' ? '#55ffff' : '#ba8c63';
    c.fillStyle = '#4a2d13';
    c.fillRect(22, 28, 2, 6);
    c.fillStyle = blade;
    c.fillRect(22, 10, 3, 16);
  } else if (weapon === 'stone_pick') {
    c.fillStyle = '#6b3c1b';
    c.fillRect(23, 16, 2, 14);
    c.fillStyle = '#7a7a7a';
    c.fillRect(18, 12, 12, 4);
  } else if (weapon === 'gold_apple') {
    c.fillStyle = '#ffd043';
    c.fillRect(22, 24, 7, 7);
    c.fillStyle = '#6b3c1b';
    c.fillRect(25, 22, 2, 2);
  }
  // Brillo según estrellas del equipo puesto
  const glow = equippedStars();
  if (glow >= 2) {
    c.fillStyle = glow >= 4 ? '#fff7a0' : '#ffe566';
    c.fillRect(2, -4, 2, 2);
    c.fillRect(20, -3, 2, 2);
    c.fillRect(-1, 10, 2, 2);
    c.fillRect(24, 18, 2, 2);
  }
  if (glow >= 4) {
    c.fillStyle = '#ffffff';
    c.fillRect(10, -6, 2, 2);
    c.fillRect(26, 8, 2, 2);
  }
  c.restore();
}
function drawScene() {
  const g = 176;
  const info = tableBy(state.currentTable);
  const p = Math.min(10, (state.mastered[info.n] || []).length);
  drawSky(g);
  drawBuild(info.n, p, g);
  drawFullSteve(ctx, 16, g - 56, 1.15);
}
function renderHudSteve() {
  const hud = document.getElementById('hud-steve');
  const hctx = hud.getContext('2d');
  hctx.clearRect(0, 0, hud.width, hud.height);
  drawFullSteve(hctx, 10, 4, 1.05);
}

function renderHeader() {
  const info = tableBy(state.currentTable);
  const count = (state.mastered[info.n] || []).length;
  document.getElementById('build-name').textContent = tableName(info.n);
  document.getElementById('build-progress').textContent = t('table_of', { n: info.n, count });
  document.getElementById('sound-btn').textContent = state.sound ? '🔊' : '🔇';
  document.getElementById('tab-aldea').classList.toggle('on', activeTab === 'aldea');
  document.getElementById('tab-minar').classList.toggle('on', activeTab === 'minar');
  document.getElementById('tab-cofre').classList.toggle('on', activeTab === 'cofre');
  updateStreakUI();
  const box = document.getElementById('pips');
  box.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const pip = document.createElement('div');
    pip.className = 'pip' + (i < count ? ' on' : '');
    box.appendChild(pip);
  }
}
function renderPicker() {
  const root = document.getElementById('picker');
  root.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'group-row';
  row.style.marginBottom = '10px';
  PICKER_ORDER.forEach(n => {
    const info = tableBy(n);
    const btn = document.createElement('button');
    btn.type = 'button';
    const done = isComplete(n);
    const on = n === state.currentTable && !chestOpen;
    let cls = 'mc-btn chip';
    if (on) cls += ' mc-btn-gold';
    else if (done) cls += ' chip-done';
    else cls += ' mc-btn-stone';
    btn.className = cls;
    btn.title = tableName(info.n);
    btn.textContent = info.icon + ' ×' + n + (done ? ' ★' : '');
    btn.addEventListener('click', () => selectTable(n));
    row.appendChild(btn);
  });
  root.appendChild(row);
}
function styleMineCube(ans) {
  const cube = document.getElementById('mine-cube');
  const label = document.getElementById('mine-ore-label');
  cube.className = 'mine-cube';
  if (ans <= 15) {
    cube.classList.add('stone');
    label.textContent = t('ore_stone');
  } else if (ans <= 30) {
    cube.classList.add('iron');
    label.textContent = t('ore_iron');
  } else if (ans <= 45) {
    cube.classList.add('gold');
    label.textContent = t('ore_gold');
  } else {
    cube.classList.add('diamond');
    label.textContent = t('ore_diamond');
  }
}
function renderMineLoot() {
  const box = document.getElementById('mine-loot');
  if (!box) return;
  box.innerHTML =
    '<span>🪵 ' + state.inventory.wood + '</span>' +
    '<span>🪨 ' + state.inventory.stone + '</span>' +
    '<span>⚙️ ' + state.inventory.iron + '</span>' +
    '<span>🪙 ' + state.inventory.gold + '</span>' +
    '<span>💎 ' + state.inventory.diamond + '</span>';
}
function grantMineLoot(ans) {
  const got = [];
  if (ans <= 15) {
    state.inventory.stone += 2;
    state.inventory.wood += 1;
    got.push(t('loot_2_stone'), t('loot_1_wood'));
  } else if (ans <= 30) {
    state.inventory.iron += 2;
    state.inventory.stone += 1;
    got.push(t('loot_2_iron_plain'), t('loot_1_stone'));
  } else if (ans <= 45) {
    state.inventory.gold += 1;
    state.inventory.iron += 1;
    got.push(t('loot_1_gold'), t('loot_1_iron'));
  } else {
    state.inventory.diamond += 1;
    state.inventory.gold += 1;
    got.push(t('loot_1_diamond'), t('loot_1_gold'));
  }
  return got;
}
function renderAnswers() {
  const mining = activeTab === 'minar';
  const finished = isComplete(state.currentTable);
  document.getElementById('play-ask').classList.remove('hidden');
  document.getElementById('done-banner').classList.toggle('hidden', mining || !finished);
  document.getElementById('ask-kicker').textContent = mining
    ? t('ask_mine')
    : (finished ? t('ask_practice') : t('ask_tap'));
  if (!currentQ) return;
  if (mining) styleMineCube(currentQ.ans);
  document.getElementById('ask-main').textContent = vecesPhrase(currentQ.a, currentQ.b);
  document.getElementById('ask-symbol').textContent = currentQ.a + ' × ' + currentQ.b;
  const box = document.getElementById('answers');
  box.innerHTML = '';
  currentQ.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mc-btn answer';
    btn.textContent = String(opt);
    btn.dataset.answer = String(opt);
    btn.addEventListener('click', () => onAnswer(opt));
    box.appendChild(btn);
  });
}
function renderChest() {
  const inv = document.getElementById('inventory');
  inv.innerHTML = '';
  MAT_KEYS.forEach(key => {
    const el = document.createElement('div');
    el.className = 'mat';
    el.innerHTML = '<span>' + matLabel(key) + '</span><b>' + state.inventory[key] + '</b>';
    inv.appendChild(el);
  });
  const list = document.getElementById('recipes');
  list.innerHTML = '';
  RECIPES.forEach(rec => {
    const have = state.inventory[rec.type];
    const crafted = Boolean(state.crafted[rec.id]);
    const stars = starLevel(rec.id);
    const equipped = rec.category === 'armor' ? state.armor === rec.item : state.weapon === rec.item;
    const upCost = upgradeCost(rec);
    const rName = recipeName(rec.id);
    const rDesc = recipeDesc(rec.id);
    const card = document.createElement('div');
    card.className = 'recipe';
    const info = document.createElement('div');
    info.innerHTML = '<div class="ico">' + rec.icon + '</div>';
    const text = document.createElement('div');
    const h = document.createElement('h3');
    h.textContent = rName + starsText(stars);
    const p = document.createElement('p');
    p.textContent = crafted
      ? (stars >= MAX_STARS ? t('desc_max') : t('desc_upgrade', { desc: rDesc }))
      : rDesc;
    const cost = document.createElement('p');
    if (!crafted) {
      cost.textContent = t('cost_craft', { cost: rec.cost, mat: matLower(rec.type), have });
    } else if (stars >= MAX_STARS) {
      cost.textContent = t('cost_max', { stars: '★'.repeat(MAX_STARS) });
    } else {
      cost.textContent = t('cost_upgrade', {
        stars: '★'.repeat(stars + 1),
        cost: upCost,
        mat: matLower(rec.type),
        have
      });
    }
    text.appendChild(h);
    text.appendChild(p);
    text.appendChild(cost);
    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.gap = '8px';
    left.appendChild(info);
    left.appendChild(text);
    const actions = document.createElement('div');
    actions.className = 'recipe-actions';

    if (!crafted) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mc-btn';
      if (have >= rec.cost) {
        btn.textContent = t('craft');
        btn.classList.add('mc-btn-gold');
        btn.addEventListener('click', () => equipCraft(rec, true));
      } else {
        btn.textContent = t('missing');
        btn.disabled = true;
        btn.classList.add('mc-btn-stone');
      }
      actions.appendChild(btn);
    } else {
      const wear = document.createElement('button');
      wear.type = 'button';
      wear.className = 'mc-btn';
      if (equipped) {
        wear.textContent = t('equipped');
        wear.disabled = true;
      } else {
        wear.textContent = t('wear');
        wear.addEventListener('click', () => equipCraft(rec, false));
      }
      actions.appendChild(wear);

      const up = document.createElement('button');
      up.type = 'button';
      up.className = 'mc-btn';
      if (stars >= MAX_STARS) {
        up.textContent = t('max_stars');
        up.disabled = true;
        up.classList.add('mc-btn-stone');
      } else if (have >= upCost) {
        up.textContent = t('upgrade_star');
        up.classList.add('mc-btn-gold');
        up.addEventListener('click', () => upgradeCraft(rec));
      } else {
        up.textContent = t('upgrade');
        up.disabled = true;
        up.classList.add('mc-btn-stone');
      }
      actions.appendChild(up);
    }

    card.appendChild(left);
    card.appendChild(actions);
    list.appendChild(card);
  });
}
function renderViews() {
  chestOpen = activeTab === 'cofre';
  practice = activeTab === 'minar';
  const mining = activeTab === 'minar';
  document.getElementById('play').classList.toggle('hidden', chestOpen);
  document.getElementById('picker').classList.toggle('hidden', chestOpen);
  document.getElementById('chest').classList.toggle('hidden', !chestOpen);
  document.getElementById('aldea-view').classList.toggle('hidden', mining || chestOpen);
  document.getElementById('mine-view').classList.toggle('hidden', !mining || chestOpen);
  renderHeader();
  renderHudSteve();
  if (chestOpen) renderChest();
  else {
    if (!mining) drawScene();
    else renderMineLoot();
    renderPicker();
    renderAnswers();
  }
}

function switchTab(tab) {
  if (tab === activeTab) return;
  AudioSys.playPop();
  // Guardar pregunta de la obra al salir de Aldea
  if (activeTab === 'aldea' && currentQ && !practice) rememberQuestion();

  activeTab = tab;
  chestOpen = tab === 'cofre';

  if (tab === 'aldea') {
    practice = false;
    if (isComplete(state.currentTable)) {
      currentQ = makeQuestion(state.currentTable, pickFactor(state.currentTable, null));
      setFeedback(t('fb_done_practice', { name: tableName(state.currentTable) }));
    } else if (state.pending[state.currentTable] && !state.mastered[state.currentTable].includes(state.pending[state.currentTable].n)) {
      currentQ = state.pending[state.currentTable];
      setFeedback(t('fb_build_block'));
    } else {
      openQuestion(state.currentTable, null);
      setFeedback(t('fb_build_block'));
    }
  } else if (tab === 'minar') {
    practice = true;
    currentQ = makeQuestion(state.currentTable, pickFactor(state.currentTable, null));
    setFeedback(t('fb_mine'));
  } else {
    practice = false;
  }

  inputLocked = false;
  closeVictory();
  renderViews();
}

function burst(el) {
  const rect = el.getBoundingClientRect();
  const colors = ['#7CFF6B', '#ffd043', '#fff', '#55ffff'];
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.style.position = 'fixed';
    p.style.left = (rect.left + rect.width / 2) + 'px';
    p.style.top = (rect.top + rect.height / 2) + 'px';
    p.style.width = '10px';
    p.style.height = '10px';
    p.style.background = colors[i % colors.length];
    p.style.zIndex = '30';
    p.style.pointerEvents = 'none';
    document.body.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 50;
    p.animate([
      { transform: 'translate(0,0)', opacity: 1 },
      { transform: 'translate(' + Math.cos(angle) * dist + 'px,' + Math.sin(angle) * dist + 'px)', opacity: 0 }
    ], { duration: 450, easing: 'ease-out' }).onfinish = () => p.remove();
  }
}

function grantUnaided() {
  const got = [t('loot_2_wood'), t('loot_1_stone')];
  state.inventory.wood += 2;
  state.inventory.stone += 1;
  state.unaidedCount += 1;
  if (state.unaidedCount % 6 === 0) {
    state.inventory.iron += 1;
    got.push(t('loot_1_iron'));
  }
  if (state.unaidedCount % 4 === 0) {
    state.inventory.gold += 1;
    got.push(t('loot_1_gold'));
  }
  return got;
}
function grantComplete() {
  BONUS.forEach(([key, amount]) => { state.inventory[key] += amount; });
  return BONUS.map(item => t(item[2]));
}
function nextLineAfter(table) {
  return t('victory_next', { n: table });
}
function showVictory(table, hit, bonus) {
  document.getElementById('victory-title').textContent = t('victory_title', { name: tableName(table) });
  document.getElementById('victory-known').textContent = t('victory_known', { n: table });
  document.getElementById('victory-hit').textContent = t('victory_hit', { list: joinEs(hit) });
  document.getElementById('victory-prize').textContent = t('victory_prize', { list: joinEs(bonus) });
  document.getElementById('victory-next').textContent = nextLineAfter(table);
  document.getElementById('victory-modal').classList.remove('hidden');
  AudioSys.playFanfare();
  burst(canvas);
}
function rebuildTable(n) {
  const table = Number(n) || state.currentTable;
  if (!tableBy(table)) return;
  state.mastered[table] = [];
  state.pending[table] = null;
  state.currentTable = table;
  activeTab = 'aldea';
  practice = false;
  chestOpen = false;
  closeVictory();
  currentQ = makeQuestion(table, pickFactor(table, null));
  rememberQuestion();
  inputLocked = false;
  setFeedback(t('fb_rebuild', { n: table }));
  save();
  AudioSys.playPop();
  renderViews();
}
function openQuestion(table, avoid) {
  currentQ = makeQuestion(table, pickFactor(table, avoid));
  // Solo guarda pendiente mientras la obra no esté terminada
  if (!isComplete(table) && !practice) rememberQuestion();
}
function finishCorrect(q) {
  const unaided = !q.revealed;
  registerCorrect(unaided);

  if (practice) {
    const cube = document.getElementById('mine-cube');
    if (unaided) {
      const got = grantMineLoot(q.ans);
      setFeedback(t('fb_mineral', { list: joinEs(got) }) + (state.streak > 1 ? ' · 🔥' + state.streak : ''));
      if (cube) burst(cube);
    } else {
      setFeedback(t('fb_mine_help'));
    }
    renderMineLoot();
    save();
    window.setTimeout(() => {
      openQuestion(q.table, q.n);
      inputLocked = false;
      renderViews();
    }, 450);
    return;
  }
  // Obra ya terminada: practicar en Aldea sin poner más bloques
  if (isComplete(q.table)) {
    if (unaided) {
      state.inventory.wood += 1;
      setFeedback(t('fb_practice_wood') + (state.streak > 1 ? ' · 🔥' + state.streak : '') + '.');
    } else {
      setFeedback(t('fb_practice_help'));
    }
    save();
    window.setTimeout(() => {
      openQuestion(q.table, q.n);
      inputLocked = false;
      renderViews();
    }, 450);
    return;
  }
  if (!unaided) {
    setFeedback(t('fb_retry'));
    save();
    window.setTimeout(() => {
      openQuestion(q.table, q.n);
      inputLocked = false;
      renderViews();
    }, 550);
    return;
  }
  if (!state.mastered[q.table].includes(q.n)) state.mastered[q.table].push(q.n);
  const hit = grantUnaided();
  state.pending[q.table] = null;
  burst(canvas);
  if (isComplete(q.table)) {
    const bonus = grantComplete();
    setFeedback(t('fb_build_done', { hit: joinEs(hit), bonus: joinEs(bonus) }));
    save();
    renderViews();
    showVictory(q.table, hit, bonus);
    // Tras la victoria se podrá seguir practicando
    currentQ = makeQuestion(q.table, pickFactor(q.table, q.n));
    inputLocked = false;
    return;
  }
  setFeedback(t('fb_block', { list: joinEs(hit) }) + (state.streak > 1 ? ' · 🔥' + state.streak : ''));
  save();
  renderHeader();
  drawScene();
  window.setTimeout(() => {
    openQuestion(q.table, q.n);
    inputLocked = false;
    renderViews();
  }, 450);
}
function onAnswer(val) {
  if (inputLocked || !currentQ) return;
  const q = currentQ;
  if (Number(val) === q.ans) {
    inputLocked = true;
    AudioSys.playPop();
    AudioSys.playDing();
    finishCorrect(q);
    return;
  }
  inputLocked = true;
  registerWrong();
  q.fails += 1;
  if (q.fails >= 2) q.revealed = true;
  rememberQuestion();
  setFeedback(q.revealed ? t('fb_help2') : t('fb_help1'));
  save();
  AudioSys.playOof();
  document.getElementById('play-ask').classList.remove('shake');
  void document.getElementById('play-ask').offsetWidth;
  document.getElementById('play-ask').classList.add('shake');
  showHelp(q);
}
function showHelp(q) {
  const revealed = q.revealed;
  document.getElementById('help-title').textContent = revealed ? t('help_counted_title') : t('help_count_title');
  document.getElementById('help-intro').textContent = helpIntro(q.a, q.b);
  document.getElementById('help-result').textContent = revealed ? t('help_result', { n: q.ans }) : '';
  const countEl = document.getElementById('help-count');
  countEl.textContent = revealed ? '' : t('help_count', { n: 0 });
  const grid = document.getElementById('help-grid');
  grid.innerHTML = '';
  let counted = 0;
  const tiny = q.ans > 40;
  for (let r = 0; r < q.a; r++) {
    const row = document.createElement('div');
    row.className = 'help-row';
    for (let c = 0; c < q.b; c++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'help-cell' + (tiny ? ' tiny' : '');
      const num = r * q.b + c + 1;
      if (revealed) cell.textContent = String(num);
      else {
        cell.addEventListener('click', () => {
          if (cell.dataset.counted) return;
          cell.dataset.counted = '1';
          cell.classList.add('on');
          counted += 1;
          countEl.textContent = t('help_count', { n: counted });
          AudioSys.playPop();
        });
      }
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
  document.getElementById('help-modal').classList.remove('hidden');
}
function closeHelp() {
  document.getElementById('help-modal').classList.add('hidden');
  inputLocked = false;
}
function closeVictory() {
  document.getElementById('victory-modal').classList.add('hidden');
}
function selectTable(n) {
  if (!tableBy(n)) return;
  if (currentQ && activeTab === 'aldea') rememberQuestion();
  state.currentTable = n;
  closeVictory();
  chestOpen = false;

  if (activeTab === 'minar') {
    practice = true;
    currentQ = makeQuestion(n, pickFactor(n, null));
    setFeedback(t('fb_mining_table', { n }));
  } else {
    if (activeTab === 'cofre') activeTab = 'aldea';
    practice = false;
    if (isComplete(n)) {
      currentQ = makeQuestion(n, pickFactor(n, null));
      setFeedback(t('fb_done_practice', { name: tableName(n) }));
    } else if (state.pending[n] && !state.mastered[n].includes(state.pending[n].n)) {
      currentQ = state.pending[n];
      setFeedback(t('fb_build_block'));
    } else {
      openQuestion(n, null);
      setFeedback(t('fb_build_block'));
    }
  }
  inputLocked = false;
  save();
  renderViews();
}
function equipCraft(rec, pay) {
  if (pay) {
    if (state.inventory[rec.type] < rec.cost) return;
    state.inventory[rec.type] -= rec.cost;
    state.crafted[rec.id] = true;
    state.stars[rec.id] = 1;
    AudioSys.playDing();
    AudioSys.playFanfare();
  } else {
    AudioSys.playPop();
  }
  if (rec.category === 'armor') state.armor = rec.item;
  else state.weapon = rec.item;
  document.getElementById('chest-note').textContent =
    t('steve_wears', { name: recipeName(rec.id) + starsText(starLevel(rec.id)) });
  save();
  renderHudSteve();
  drawScene();
  renderChest();
}
function upgradeCraft(rec) {
  if (!state.crafted[rec.id]) return;
  const stars = starLevel(rec.id);
  if (stars >= MAX_STARS) return;
  const cost = upgradeCost(rec);
  if (state.inventory[rec.type] < cost) return;
  state.inventory[rec.type] -= cost;
  state.stars[rec.id] = stars + 1;
  if (rec.category === 'armor') state.armor = rec.item;
  else state.weapon = rec.item;
  AudioSys.playDing();
  AudioSys.playFanfare();
  document.getElementById('chest-note').textContent =
    t('upgraded', { name: recipeName(rec.id) + starsText(stars + 1) });
  save();
  renderHudSteve();
  drawScene();
  renderChest();
}
function toggleChest(open) {
  switchTab(open ? 'cofre' : 'aldea');
}
function resetGame() {
  if (!confirm(t('reset_confirm'))) return;
  const sound = state.sound;
  state = defaultState();
  state.sound = sound;
  practice = false;
  chestOpen = false;
  activeTab = 'aldea';
  inputLocked = false;
  currentQ = makeQuestion(2, pickFactor(2, null));
  rememberQuestion();
  save();
  setFeedback(t('fb_reset'));
  renderViews();
}

document.getElementById('sound-btn').addEventListener('click', () => {
  state.sound = !state.sound;
  save();
  renderHeader();
});
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang')));
});
document.getElementById('tab-aldea').addEventListener('click', () => switchTab('aldea'));
document.getElementById('tab-minar').addEventListener('click', () => switchTab('minar'));
document.getElementById('tab-cofre').addEventListener('click', () => switchTab('cofre'));
document.getElementById('chest-back').addEventListener('click', () => switchTab('aldea'));
document.getElementById('help-close').addEventListener('click', closeHelp);
document.getElementById('victory-close').addEventListener('click', closeVictory);
document.getElementById('victory-rebuild').addEventListener('click', () => rebuildTable(state.currentTable));
document.getElementById('rebuild-btn').addEventListener('click', () => rebuildTable(state.currentTable));
document.getElementById('reset-btn').addEventListener('click', resetGame);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!document.getElementById('help-modal').classList.contains('hidden')) closeHelp();
  else if (!document.getElementById('victory-modal').classList.contains('hidden')) closeVictory();
  else if (chestOpen) toggleChest(false);
});
document.body.addEventListener('pointerdown', () => AudioSys.init(), { once: true });

loadLang();
applyStaticLang();
state = load();
practice = false;
chestOpen = false;
activeTab = 'aldea';
if (!isUnlocked(state.currentTable)) state.currentTable = 2;
if (isComplete(state.currentTable)) {
  currentQ = makeQuestion(state.currentTable, pickFactor(state.currentTable, null));
} else if (state.pending[state.currentTable]) {
  currentQ = state.pending[state.currentTable];
} else {
  currentQ = makeQuestion(state.currentTable, pickFactor(state.currentTable, null));
  rememberQuestion();
}
setFeedback(t('feedback_start'));
renderViews();
