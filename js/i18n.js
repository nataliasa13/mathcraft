const LANG_KEY = 'mathcraft-lang';
let lang = 'es';

const I18N = {
  es: {
    doc_title: 'Tablas de la aldea',
    tab_aldea: '🏰 ALDEA',
    tab_minar: '⛏️ MINAR',
    tab_cofre: '🔨 CRAFTEO',
    sound: 'Sonido',
    language: 'Idioma',
    sections: 'Secciones',
    streak_title: 'Aciertos seguidos',
    streak_goal: 'meta {n}',
    master_line: '{title} · {n} aciertos',
    master_line_next: '{title} · {n}/{next}',
    table_of: 'Tabla del {n} · {count} de 10',
    feedback_start: 'Practica siempre que quieras. Cada acierto pone un bloque.',
    ask_tap: 'Toca el número',
    ask_practice: 'Practica la tabla (la obra ya está lista)',
    ask_mine: 'Rompe el bloque con la cuenta',
    mine_kicker: 'Responde y ganas minerales',
    mine_pick: '¡PÍCAME!',
    ore_stone: 'Piedra / carbón',
    ore_iron: 'Mena de hierro',
    ore_gold: 'Mena de oro',
    ore_diamond: 'Mena de diamante',
    done_banner: 'Obra lista · puedes practicar sin parar',
    rebuild: 'Construir otra vez',
    chest_title: 'Crafteo',
    chest_back: 'VOLVER',
    chest_intro: 'Fabrica, pon y mejora con ★ (hasta 5)',
    reset: 'Borrar la partida',
    reset_confirm: '¿Seguro? Se borra la aldea, las tablas y el cofre.',
    help_count_title: '¡Vamos a contar!',
    help_counted_title: 'Ya los hemos contado',
    help_try: 'VOLVER A PROBAR',
    help_count: 'Toca cada bloque. Vas contando: {n}',
    help_result: 'Son {n} bloques.',
    victory_keep: 'SEGUIR PRACTICANDO',
    victory_rebuild: 'CONSTRUIR OTRA VEZ',
    victory_title: '¡{name} lista!',
    victory_known: 'Buen trabajo con la tabla del {n}.',
    victory_hit: 'Por el último bloque: {list}.',
    victory_prize: 'Premio: {list}.',
    victory_next: 'Puedes seguir practicando la del {n} sin parar, o construirla otra vez.',
    craft: 'FABRICAR',
    missing: 'TE FALTA',
    equipped: 'PUESTO',
    wear: 'PONER',
    upgrade: 'MEJORAR',
    upgrade_star: 'MEJORAR ★',
    max_stars: '★ MÁX',
    cost_craft: 'Cuesta {cost} de {mat}. Tienes {have}.',
    cost_upgrade: 'Mejorar a {stars}: {cost} de {mat} (tienes {have}).',
    cost_max: '{stars} ¡Al máximo!',
    desc_max: 'Nivel máximo de estrellas',
    desc_upgrade: '{desc} · mejora con minerales',
    steve_wears: 'Steve lleva {name}.',
    upgraded: '¡{name} mejorado!',
    times: '{a} veces {b}',
    times_one: '{a} vez {b}',
    help_intro: '{phrase} son {rows} de {cols}.',
    row_one: '1 fila',
    row_many: '{n} filas',
    block_one: '1 bloque',
    block_many: '{n} bloques',
    mat_wood: 'Madera',
    mat_stone: 'Piedra',
    mat_iron: 'Hierro',
    mat_gold: 'Oro',
    mat_diamond: 'Diamante',
    mat_wood_l: 'madera',
    mat_stone_l: 'piedra',
    mat_iron_l: 'hierro',
    mat_gold_l: 'oro',
    mat_diamond_l: 'diamante',
    table_2: 'La cabaña',
    table_3: 'El molino',
    table_4: 'El establo',
    table_5: 'La granja',
    table_6: 'El castillo',
    table_7: 'La torre',
    table_8: 'El palacio',
    table_9: 'El faro',
    rec_wood_sword: 'Espada de madera',
    rec_wood_sword_d: 'Steve la lleva en la mano',
    rec_stone_pick: 'Pico de piedra',
    rec_stone_pick_d: 'Un pico de verdad',
    rec_iron_armor: 'Armadura de hierro',
    rec_iron_armor_d: 'Casco y pechera de hierro',
    rec_gold_apple: 'Manzana de oro',
    rec_gold_apple_d: 'Un premio brillante',
    rec_diamond_sword: 'Espada de diamante',
    rec_diamond_sword_d: 'Brilla de color celeste',
    rec_diamond_armor: 'Armadura de diamante',
    rec_diamond_armor_d: 'La armadura más brillante',
    title_0: 'Aprendiz',
    title_15: 'Explorador',
    title_40: 'Minero',
    title_80: 'Constructor',
    title_150: 'Maestro',
    title_250: 'Leyenda',
    title_400: 'Héroe de tablas',
    loot_1_diamond: '1 diamante',
    loot_4_wood: '4 de madera',
    loot_4_stone: '4 de piedra',
    loot_2_iron: '2 de hierro',
    loot_2_wood: '2 de madera',
    loot_1_stone: '1 de piedra',
    loot_1_iron: '1 de hierro',
    loot_1_gold: '1 de oro',
    loot_1_wood: '1 de madera',
    loot_2_stone: '2 de piedra',
    loot_2_iron_plain: '2 de hierro',
    and: ' y ',
    toast_streak_dia: '🔥 ¡{n} seguidos! +diamante +oro',
    toast_streak_gold: '🔥 ¡{n} seguidos! +oro +hierro',
    toast_streak_iron: '🔥 ¡{n} seguidos! +hierro',
    toast_streak_wood: '🔥 Racha ×{n} · +2 madera',
    toast_title: '🏆 ¡Nuevo título: {title}!',
    fb_build_block: 'Cada acierto pone un bloque en la obra.',
    fb_mine: 'Cada acierto te da minerales para el crafteo.',
    fb_done_practice: '{name} lista. ¡Sigue practicando!',
    fb_rebuild: 'Nueva obra de la tabla del {n}. ¡A construir otra vez!',
    fb_mineral: '¡Mineral! {list}',
    fb_mine_help: 'Bien. Prueba otra veta sin ayuda para la racha.',
    fb_practice_wood: '¡Bien! +1 madera',
    fb_practice_help: 'Bien. Sin ayuda sube la racha 🔥',
    fb_retry: 'Bien. Esta cuenta volverá a salir.',
    fb_build_done: '¡Obra terminada! {hit}. Premio: {bonus}.',
    fb_block: '¡Bloque puesto! {list}',
    fb_help2: 'Mira cuántos bloques son y prueba otra vez.',
    fb_help1: 'Cuenta los bloques y prueba otra vez.',
    fb_mining_table: 'Minando la tabla del {n}. Cada acierto da minerales.',
    fb_reset: 'Cada acierto pone un bloque.'
  },
  en: {
    doc_title: 'Village Tables',
    tab_aldea: '🏰 VILLAGE',
    tab_minar: '⛏️ MINE',
    tab_cofre: '🔨 CRAFT',
    sound: 'Sound',
    language: 'Language',
    sections: 'Sections',
    streak_title: 'Correct streak',
    streak_goal: 'goal {n}',
    master_line: '{title} · {n} correct',
    master_line_next: '{title} · {n}/{next}',
    table_of: 'Times table {n} · {count} of 10',
    feedback_start: 'Practice anytime. Each correct answer places a block.',
    ask_tap: 'Tap the number',
    ask_practice: 'Practice the table (build is already done)',
    ask_mine: 'Break the block with the answer',
    mine_kicker: 'Answer to earn ores',
    mine_pick: 'MINE ME!',
    ore_stone: 'Stone / coal',
    ore_iron: 'Iron ore',
    ore_gold: 'Gold ore',
    ore_diamond: 'Diamond ore',
    done_banner: 'Build done · keep practicing',
    rebuild: 'Build again',
    chest_title: 'Craft',
    chest_back: 'BACK',
    chest_intro: 'Craft, equip and upgrade with ★ (up to 5)',
    reset: 'Reset save',
    reset_confirm: 'Are you sure? This erases the village, tables and chest.',
    help_count_title: "Let's count!",
    help_counted_title: 'We already counted them',
    help_try: 'TRY AGAIN',
    help_count: 'Tap each block. Counting: {n}',
    help_result: 'That makes {n} blocks.',
    victory_keep: 'KEEP PRACTICING',
    victory_rebuild: 'BUILD AGAIN',
    victory_title: '{name} complete!',
    victory_known: 'Nice work on the {n} times table.',
    victory_hit: 'For the last block: {list}.',
    victory_prize: 'Reward: {list}.',
    victory_next: 'You can keep practicing the {n}s forever, or build again.',
    craft: 'CRAFT',
    missing: 'NEED MORE',
    equipped: 'EQUIPPED',
    wear: 'EQUIP',
    upgrade: 'UPGRADE',
    upgrade_star: 'UPGRADE ★',
    max_stars: '★ MAX',
    cost_craft: 'Costs {cost} {mat}. You have {have}.',
    cost_upgrade: 'Upgrade to {stars}: {cost} {mat} (you have {have}).',
    cost_max: '{stars} Maxed out!',
    desc_max: 'Maximum star level',
    desc_upgrade: '{desc} · upgrade with ores',
    steve_wears: 'Steve wears {name}.',
    upgraded: '{name} upgraded!',
    times: '{a} times {b}',
    times_one: '{a} time {b}',
    help_intro: '{phrase} means {rows} of {cols}.',
    row_one: '1 row',
    row_many: '{n} rows',
    block_one: '1 block',
    block_many: '{n} blocks',
    mat_wood: 'Wood',
    mat_stone: 'Stone',
    mat_iron: 'Iron',
    mat_gold: 'Gold',
    mat_diamond: 'Diamond',
    mat_wood_l: 'wood',
    mat_stone_l: 'stone',
    mat_iron_l: 'iron',
    mat_gold_l: 'gold',
    mat_diamond_l: 'diamond',
    table_2: 'The cabin',
    table_3: 'The mill',
    table_4: 'The stable',
    table_5: 'The farm',
    table_6: 'The castle',
    table_7: 'The tower',
    table_8: 'The palace',
    table_9: 'The lighthouse',
    rec_wood_sword: 'Wooden sword',
    rec_wood_sword_d: 'Steve holds it',
    rec_stone_pick: 'Stone pickaxe',
    rec_stone_pick_d: 'A real pickaxe',
    rec_iron_armor: 'Iron armor',
    rec_iron_armor_d: 'Iron helmet and chestplate',
    rec_gold_apple: 'Golden apple',
    rec_gold_apple_d: 'A shiny prize',
    rec_diamond_sword: 'Diamond sword',
    rec_diamond_sword_d: 'Glows light blue',
    rec_diamond_armor: 'Diamond armor',
    rec_diamond_armor_d: 'The brightest armor',
    title_0: 'Learner',
    title_15: 'Explorer',
    title_40: 'Miner',
    title_80: 'Builder',
    title_150: 'Master',
    title_250: 'Legend',
    title_400: 'Times-table hero',
    loot_1_diamond: '1 diamond',
    loot_4_wood: '4 wood',
    loot_4_stone: '4 stone',
    loot_2_iron: '2 iron',
    loot_2_wood: '2 wood',
    loot_1_stone: '1 stone',
    loot_1_iron: '1 iron',
    loot_1_gold: '1 gold',
    loot_1_wood: '1 wood',
    loot_2_stone: '2 stone',
    loot_2_iron_plain: '2 iron',
    and: ' and ',
    toast_streak_dia: '🔥 {n} in a row! +diamond +gold',
    toast_streak_gold: '🔥 {n} in a row! +gold +iron',
    toast_streak_iron: '🔥 {n} in a row! +iron',
    toast_streak_wood: '🔥 Streak ×{n} · +2 wood',
    toast_title: '🏆 New title: {title}!',
    fb_build_block: 'Each correct answer places a block.',
    fb_mine: 'Each correct answer gives ores for crafting.',
    fb_done_practice: '{name} done. Keep practicing!',
    fb_rebuild: 'New build for the {n} times table. Build again!',
    fb_mineral: 'Ore! {list}',
    fb_mine_help: 'Good. Try the next vein without help for a streak.',
    fb_practice_wood: 'Nice! +1 wood',
    fb_practice_help: 'Good. No help = streak goes up 🔥',
    fb_retry: 'Good. This fact will come back.',
    fb_build_done: 'Build finished! {hit}. Reward: {bonus}.',
    fb_block: 'Block placed! {list}',
    fb_help2: 'Look how many blocks there are and try again.',
    fb_help1: 'Count the blocks and try again.',
    fb_mining_table: 'Mining the {n} times table. Each hit gives ores.',
    fb_reset: 'Each correct answer places a block.'
  }
};

function t(key, vars) {
  const pack = I18N[lang] || I18N.es;
  let s = pack[key] != null ? pack[key] : (I18N.es[key] != null ? I18N.es[key] : key);
  if (vars) {
    Object.keys(vars).forEach(k => {
      s = s.split('{' + k + '}').join(String(vars[k]));
    });
  }
  return s;
}
function loadLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'es') lang = saved;
    else {
      const nav = (navigator.language || '').toLowerCase();
      lang = nav.startsWith('en') ? 'en' : 'es';
    }
  } catch (e) {}
}
function saveLang() {
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
}
function tableName(n) { return t('table_' + n); }
function recipeName(id) { return t('rec_' + id); }
function recipeDesc(id) { return t('rec_' + id + '_d'); }
function matLabel(key) { return t('mat_' + key); }
function matLower(key) { return t('mat_' + key + '_l'); }

function applyStaticLang() {
  document.documentElement.lang = lang;
  document.title = t('doc_title');
  const setTxt = (id, key) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  };
  setTxt('tab-aldea', 'tab_aldea');
  setTxt('tab-minar', 'tab_minar');
  setTxt('tab-cofre', 'tab_cofre');
  setTxt('mine-kicker', 'mine_kicker');
  setTxt('mine-pick-label', 'mine_pick');
  setTxt('mine-ore-label', 'ore_stone');
  setTxt('done-banner-text', 'done_banner');
  setTxt('rebuild-btn', 'rebuild');
  setTxt('chest-title', 'chest_title');
  setTxt('chest-back', 'chest_back');
  setTxt('chest-intro', 'chest_intro');
  setTxt('reset-btn', 'reset');
  setTxt('help-title', 'help_count_title');
  setTxt('help-close', 'help_try');
  setTxt('victory-close', 'victory_keep');
  setTxt('victory-rebuild', 'victory_rebuild');
  setTxt('ask-kicker', 'ask_tap');
  setTxt('feedback', 'feedback_start');

  const sound = document.getElementById('sound-btn');
  if (sound) sound.setAttribute('aria-label', t('sound'));
  const tabs = document.querySelector('.tabs');
  if (tabs) tabs.setAttribute('aria-label', t('sections'));
  const streak = document.getElementById('streak-box');
  if (streak) streak.title = t('streak_title');
  const flags = document.getElementById('lang-flags');
  if (flags) flags.setAttribute('aria-label', t('language'));

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('on', btn.getAttribute('data-lang') === lang);
  });
}
function setLang(next) {
  lang = next === 'en' ? 'en' : 'es';
  saveLang();
  applyStaticLang();
  if (typeof renderViews === 'function') {
    renderViews();
    if (typeof setFeedback === 'function') {
      // keep a clear status line in the new language
      if (typeof activeTab !== 'undefined' && activeTab === 'minar') setFeedback(t('fb_mine'));
      else if (typeof state !== 'undefined' && state && typeof isComplete === 'function' && isComplete(state.currentTable)) {
        setFeedback(t('fb_done_practice', { name: tableName(state.currentTable) }));
      } else setFeedback(t('fb_build_block'));
    }
  } else if (typeof setFeedback === 'function') {
    setFeedback(t('feedback_start'));
  }
}
