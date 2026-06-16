// ============================================================
// SHOP DATA
// ============================================================
var ITEM_SYMBOLS = {
  hp: '\u2665', speed: '\u27a4', fireRate: '\u26a1', shield: '\u2666', shipAmmo: '\u25a3', bomb: '\u2297', bombFull: '\u2622', magnet: '\u2318', heart: '\u2764', weaponSlots: '\u25a4', weaponFusion: '\u25ce',
  laser: '\u25c0', homing: '\u25ce', double: '\u2551', pulse: '\u25ef', explosive: '\u2726', ricochet: '\u27f3', super: '\u2605',
  sine: '\u223f', cola: '\u25cf', feline: '\u25b2', chicken: '\u2727', superLaser: '\u229e', dim4: '\u271a',
  spread: '\u2b21', triple: '\u4e09',
  drones: '\u25c7', droneAmmo: '\u25a8', formationCircle: '\u25cc', formationTriangle: '\u25b3', formationCentrifuge: '\u27f3',
  droneHp: '\u2b1b', protectDrone: '\u25c8', selfDestruct: '\u2622', droneFusion: '\u25ce', smartDrone: '\u25b6', circularDrone: '\u21bb',
  skin_red: '\u25c6', skin_green: '\u25cf', skin_purple: '\u25b2', skin_gold: '\u2605', skin_white: '\u25c7',
  dash: '\u27eb', dashCooldown: '\u27f3', autoEquip: '\u21c4', droneAutoEquip: '\u21bb',
  sobrecarga: '\u21c8', eficienciaMult: '\u23f1', inflacion: '\u2191', maxDrones: '\u25a3',
  supercalifragilistico: '\u2605'
};
var TAB_COLORS = ['#f80', '#0f0', '#08f'];
var DISPERSION_WEAPONS = ['double', 'triple', 'spread', 'dim4', 'chicken', 'sine'];
var SPECIAL_LASER_WEAPONS = ['feline', 'homing', 'pulse', 'explosive', 'ricochet', 'cola', 'super', 'laser', 'superLaser', 'supercalifragilistico'];
var WEAPON_GLOW = { double: '#a0f', triple: '#a0f', spread: '#a0f', dim4: '#a0f', chicken: '#a0f', sine: '#a0f', feline: '#f80', homing: '#f80', pulse: '#f80', explosive: '#f80', ricochet: '#f80', cola: '#f80', super: '#f80', laser: '#f80', superLaser: '#f80', supercalifragilistico: '#0f0' };
var SKIN_DATA = {
  default: { fill: '#09c', stroke: '#0cf', cockpit: '#0cf', engine: '0,200,255' },
  skin_red: { fill: '#c00', stroke: '#f44', cockpit: '#f44', engine: '255,50,50' },
  skin_green: { fill: '#0c0', stroke: '#0f0', cockpit: '#0f0', engine: '50,255,50' },
  skin_purple: { fill: '#a0f', stroke: '#c0f', cockpit: '#c0f', engine: '200,50,255' },
  skin_gold: { fill: '#c90', stroke: '#fc0', cockpit: '#fc0', engine: '255,200,50' },
  skin_white: { fill: '#999', stroke: '#fff', cockpit: '#fff', engine: '200,200,200' },
};
var SHOP_ITEMS = [
  { id: 'hp', name: 'Vida Extra', desc: '+1 punto de vida', cost: 200, max: 3, tab: 'nave' },
  { id: 'speed', name: 'Motor Mejorado', desc: '+20% velocidad', cost: 150, max: 3, tab: 'nave' },
  { id: 'fireRate', name: 'Cañon Rapido', desc: '-15ms entre disparos', cost: 200, max: 3, tab: 'nave' },
  { id: 'shield', name: 'Escudo', desc: '1 golpe gratis al empezar', cost: 300, max: 1, tab: 'nave' },
  { id: 'shipAmmo', name: 'Municion Nave', desc: '+capacidad municion nave', cost: 200, max: 5, tab: 'nave' },
  { id: 'bomb', name: 'Antibalas', desc: 'Tecla B: destruye solo balas enemigas (+2 por nivel)', cost: 200, max: 3, tab: 'nave' },
  { id: 'bombFull', name: 'Bomba Total', desc: 'Tecla X: destruye todo (solo 1)', cost: 500, max: 1, tab: 'nave' },
  { id: 'magnet', name: 'Imán', desc: 'Atrae objetos hasta +15px por nivel', cost: 200, max: 10, tab: 'nave' },
  { id: 'heart', name: 'Corazón Mejorado', desc: '+1 de curación por nivel', cost: 250, max: 3, tab: 'nave' },
  { id: 'weaponSlots', name: 'Aumento de Armas', desc: '+1 espacio de armas equipables', cost: 400, max: 4, tab: 'nave' },
  { id: 'weaponFusion', name: 'Sistema de Fusion', desc: 'Fusiona armas de dispersion con especiales (Q)', cost: 500, max: 1, tab: 'nave' },
  { id: 'skin_red', name: 'Piel: Roja', desc: 'Nave de combate roja', cost: 200, max: 1, tab: 'nave', isSkin: true },
  { id: 'skin_green', name: 'Piel: Verde', desc: 'Nave camuflaje verde', cost: 200, max: 1, tab: 'nave', isSkin: true },
  { id: 'skin_purple', name: 'Piel: Púrpura', desc: 'Nave real púrpura', cost: 250, max: 1, tab: 'nave', isSkin: true },
  { id: 'skin_gold', name: 'Piel: Dorada', desc: 'Nave élite dorada', cost: 300, max: 1, tab: 'nave', isSkin: true },
  { id: 'skin_white', name: 'Piel: Plateada', desc: 'Nave cromada plateada', cost: 250, max: 1, tab: 'nave', isSkin: true },
  { id: 'dash', name: 'Dash', desc: 'N1:80px · N2:140px · N3:200px · N4:teletransp', cost: 300, max: 4, tab: 'nave' },
  { id: 'dashCooldown', name: 'Enfriamiento Dash', desc: 'N1:4s · N2:3s · N3:2s', cost: 250, max: 3, tab: 'nave' },
  { id: 'laser', name: 'Arma: Laser', desc: 'Rayo laser continuo', cost: 400, max: 1, tab: 'armas' },
  { id: 'homing', name: 'Arma: Homing', desc: 'Misiles con guia automatica', cost: 350, max: 1, tab: 'armas' },
  { id: 'pulse', name: 'Pulso Eléctrico', desc: 'Destruye misiles en área', cost: 450, max: 1, tab: 'armas' },
  { id: 'explosive', name: 'Bala Explosiva', desc: 'Explota en multi-disparo al impactar', cost: 400, max: 1, tab: 'armas' },
  { id: 'ricochet', name: 'Bala Rebotante', desc: 'Rebota entre objetivos', cost: 450, max: 1, tab: 'armas' },
  { id: 'super', name: 'Plasma', desc: 'Bala púrpura que atraviesa todo', cost: 800, max: 1, tab: 'armas' },
  { id: 'sine', name: 'Disparo Senosoidal', desc: 'Oscilacion senoidal', cost: 350, max: 1, tab: 'armas' },
  { id: 'cola', name: 'Disparo de Coca Cola', desc: 'Explota en burbujas', cost: 350, max: 1, tab: 'armas' },
  { id: 'feline', name: 'Disparo Felino', desc: 'Misiles que acechan', cost: 400, max: 1, tab: 'armas' },
  { id: 'chicken', name: 'Disparo de Pollo', desc: 'Racimo de perdigones', cost: 350, max: 1, tab: 'armas' },
  { id: 'superLaser', name: 'Super Laser Infinito', desc: 'Laser continuo devastador', cost: 600, max: 1, tab: 'armas' },
  { id: 'dim4', name: 'Disparo en 4 Dimensiones', desc: 'Dispara en 4 direcciones', cost: 400, max: 1, tab: 'armas' },
  { id: 'supercalifragilistico', name: 'Perforante', desc: 'Bala verde que atraviesa todo', cost: 9999, max: 1, tab: 'armas' },
  { id: 'spread', name: 'Abanico', desc: 'Disparo en abanico', cost: 300, max: 1, tab: 'armas' },
  { id: 'drones', name: 'Minidron', desc: '1 dron orbital que dispara', cost: 300, max: 999, tab: 'drones' },
  { id: 'maxDrones', name: 'Capacidad de Drones', desc: '+5 de capacidad maxima (20→25→30→35→40→45→50)', cost: 500, max: 6, tab: 'drones' },
  { id: 'droneAmmo', name: 'Municion Dron', desc: '+capacidad municion dron', cost: 200, max: 5, tab: 'drones' },
  { id: 'formationCircle', name: 'Formacion: Circulo', desc: 'Drones orbitan la nave', cost: 250, max: 1, tab: 'drones' },
  { id: 'formationTriangle', name: 'Formacion: Triangulo', desc: 'Drones en formacion triangular', cost: 250, max: 1, tab: 'drones' },
  { id: 'formationCentrifuge', name: 'Formacion: Centrifugadora', desc: 'Drones disparan desde el centro hacia afuera', cost: 400, max: 1, tab: 'drones' },
  { id: 'droneHp', name: 'Resistencia de Dron', desc: '+1 HP por nivel', cost: 150, max: 100, tab: 'drones' },
  { id: 'protectDrone', name: 'Dron de Proteccion', desc: 'Dron escudo violeta que absorbe golpes', cost: 500, max: 5, tab: 'drones' },
  { id: 'smartDrone', name: 'Minidron Inteligente', desc: 'Apunta al enemigo mas cercano', cost: 350, max: 999, tab: 'drones' },
  { id: 'circularDrone', name: 'Minidron Circular', desc: 'Disparo en todas direcciones', cost: 400, max: 999, tab: 'drones' },
  { id: 'selfDestruct', name: 'Autodestruccion', desc: 'Tecla F: lanza un dron como bomba', cost: 400, max: 1, tab: 'drones' },
  { id: 'droneFusion', name: 'Fusion de Drones', desc: 'Drones usan la fusion del arma activa (E)', cost: 600, max: 1, tab: 'drones' },
  { id: 'autoEquip', name: 'Auto-Equipar Nave', desc: 'Equipa arma de la cola si tenes arma normal · N1:5s · N2:3s · N3:inmediato', cost: 350, max: 3, tab: 'nave' },
  { id: 'droneAutoEquip', name: 'Auto-Equipar Dron', desc: 'Asigna arma de la cola al dron si tiene arma normal · N1:5s · N2:3s · N3:inmediato', cost: 350, max: 3, tab: 'drones' },
  { id: 'sobrecarga', name: 'Sobrecarga', desc: 'cada x2 VEL suma +1 al mult. de disparo (max 10)', cost: 300, max: 10, tab: 'nave' },
  { id: 'eficienciaMult', name: 'Eficiencia de Multiplicadores', desc: '+1s de duracion de multiplicadores por nivel', cost: 250, max: 5, tab: 'nave' },
  { id: 'inflacion', name: 'Inflacion Momentanea', desc: 'cada recogida de multiplicador suma +1 al mult. de puntos (max 5)', cost: 300, max: 5, tab: 'nave' },
];
var REWARD_POOLS = {
  easy: { pool: ['spread', 'laser', 'homing', 'sine', 'cola', 'chicken', 'feline', 'dim4', 'drones', 'smartDrone', 'droneAmmo', 'formationCircle', 'formationTriangle'], count: 3 },
  normal: { pool: ['pulse', 'explosive', 'ricochet', 'formationCentrifuge', 'droneHp', 'circularDrone', 'protectDrone', 'droneFusion'], count: 2 },
  hard: { pool: ['super', 'superLaser', 'selfDestruct'], count: 1 }
};

var DIFFICULTY = {
  easy: { levelMax: [0, 3, 5, 7, 7, 9], riskThresholds: [60, 120, 240], pointValue: 3, enemyPointValue: 5, enemyPowerupChance: 0.3, asteroidPowerupChance: 0.15, enemyHpBonus: 0, bossHpMult: 1 },
  normal: { levelMax: [0, 4, 8, 10, 10, 12], riskThresholds: [80, 160, 320], pointValue: 6, enemyPointValue: 10, enemyPowerupChance: 0.45, asteroidPowerupChance: 0.25, enemyHpBonus: 0, bossHpMult: 2 },
  hard: { levelMax: [0, 5, 9, 13, 13, 15], riskThresholds: [110, 220, 440], pointValue: 9, enemyPointValue: 15, enemyPowerupChance: 0.5, asteroidPowerupChance: 0.3, enemyHpBonus: 1, bossHpMult: 3 }
};
var RISK_MULTIPLIERS = [1.0, 1.25, 1.5, 2.0];
var PLANET_DATA = {
  tierra: {
    id: 'tierra', name: 'TIERRA', desc: 'Detén la invasión del planeta', difficulty: 'easy',
    unlock: null,
    boss: { name: 'Dron Conquistador', maxHp: 100, w: 80, h: 60, speed: 1.5, bodyColor: '#800', strokeColor: '#f44', cockpitColor: '#f44', wingColor: '#a00', engineGradient: '255,68,68' }
  },
  marte: {
    id: 'marte', name: 'MARTE', desc: 'Asalto a base enemiga', difficulty: 'normal',
    unlock: [{ planet: 'tierra', count: 1 }],
    boss: { name: 'Mecha Guardian', maxHp: 200, w: 90, h: 70, speed: 1.2, bodyColor: '#860', strokeColor: '#fa0', cockpitColor: '#fa0', wingColor: '#a40', engineGradient: '255,170,0' }
  },
  jupiter: {
    id: 'jupiter', name: 'JÚPITER', desc: 'Ataque directo a la base principal', difficulty: 'hard',
    unlock: [{ planet: 'marte', count: 1 }],
    boss: { name: 'Ciudadela', maxHp: 300, w: 100, h: 80, speed: 0.8, bodyColor: '#808', strokeColor: '#f0f', cockpitColor: '#f0f', wingColor: '#a0a', engineGradient: '255,0,255' }
  },
  saturno: {
    id: 'saturno', name: 'SATURNO', desc: 'Infiltración en el anillo enemigo', difficulty: 'normal',
    unlock: [{ planet: 'jupiter', count: 1 }],
    boss: { name: 'Señor de los Anillos', maxHp: 220, w: 90, h: 70, speed: 1.0, bodyColor: '#848', strokeColor: '#f0f', cockpitColor: '#f0f', wingColor: '#a0a', engineGradient: '200,50,200' }
  },
  neptuno: {
    id: 'neptuno', name: 'NEPTUNO', desc: 'Enfrentamiento final', difficulty: 'hard',
    unlock: [{ planet: 'tierra', count: 5 }, { planet: 'marte', count: 5 }],
    boss: { name: 'Leviatán', maxHp: 400, w: 110, h: 90, speed: 0.7, bodyColor: '#044', strokeColor: '#0ff', cockpitColor: '#0ff', wingColor: '#088', engineGradient: '0,200,200' }
  }
};
var PLANET_IDS = ['tierra', 'marte', 'jupiter', 'saturno', 'neptuno'];
var BOSS_DATA_ESPIA = { name: 'El Espia', maxHp: 200, w: 80, h: 60, speed: 1.5, bodyColor: '#060', strokeColor: '#0f0', cockpitColor: '#0f0', wingColor: '#090', engineGradient: '0,255,0' };
var SPECIAL_LEVEL_CONFIG = { levelMax: [0, 6, 8, 10], asteroidRate: 20, enemyHpBonus: 4, asteroidSize: 'small' };

var ALL_WEAPONS = [
  { id: 'double', name: 'Cañon Doble', desc: 'Dos disparos paralelos' },
  { id: 'triple', name: 'Triple', desc: 'Tres disparos paralelos' },
  { id: 'supercalifragilistico', name: 'Perforante', desc: 'Bala verde que atraviesa todo' },
];
var ARMES_CATEGORIES = [
  { name: 'Dispersion', items: ['double', 'triple', 'spread', 'dim4', 'chicken', 'sine'] },
  { name: 'Balas Especiales', items: ['feline', 'homing', 'pulse', 'explosive', 'ricochet', 'cola', 'super', 'supercalifragilistico'] },
  { name: 'Láser', items: ['laser', 'superLaser'] },
];
var DRONES_CATEGORIES = [
  { name: 'Tipo de Dron', items: ['drones', 'smartDrone', 'circularDrone', 'protectDrone'] },
  { name: 'Atributos', items: ['maxDrones', 'droneAmmo', 'droneHp'] },
  { name: 'Formación', items: ['formationCircle', 'formationTriangle', 'formationCentrifuge'] },
  { name: 'Habilidades Activas', items: ['selfDestruct', 'droneFusion', 'droneAutoEquip'] },
];
var NAVE_CATEGORIES = [
  { name: 'Armadura', items: ['hp', 'shield'] },
  { name: 'Motores', items: ['speed', 'dash', 'dashCooldown'] },
  { name: 'Cañón', items: ['fireRate', 'shipAmmo', 'weaponSlots', 'weaponFusion', 'autoEquip', 'sobrecarga'] },
  { name: 'Bombas', items: ['bomb', 'bombFull'] },
  { name: 'Recolección', items: ['magnet', 'heart', 'eficienciaMult', 'inflacion'] },
  { name: 'Pinturas', items: ['skin_red', 'skin_green', 'skin_purple', 'skin_gold', 'skin_white'] },
];
