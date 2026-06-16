// ============================================================
// PERSISTENCE
// ============================================================
var gameData = { points: 0, upgrades: {}, activeSkin: 'default', totalPointsSpent: 0 };
var DEFAULT_EQUIPPED = ['double', 'triple'];

function initPlanetData() {
  if (!gameData.planetKills) gameData.planetKills = {};
  if (!gameData.bossDefeats) gameData.bossDefeats = {};
  if (!gameData.beatenPlanets) gameData.beatenPlanets = [];
  for (var pk = 0; pk < PLANET_IDS.length; pk++) { if (gameData.planetKills[PLANET_IDS[pk]] === undefined) gameData.planetKills[PLANET_IDS[pk]] = 0; }
  for (var bd = 0; bd < PLANET_IDS.length; bd++) { if (gameData.bossDefeats[PLANET_IDS[bd]] === undefined) gameData.bossDefeats[PLANET_IDS[bd]] = 0; }
}
var DRONE_EQUIP_IDS = ['drones', 'smartDrone', 'circularDrone', 'protectDrone'];
function initEquippedDrones() {
  if (!gameData.equippedDrones) {
    gameData.equippedDrones = {};
    var cap = maxDroneCap();
    var total = 0;
    for (var de = 0; de < DRONE_EQUIP_IDS.length && total < cap; de++) {
      var owned = gameData.upgrades[DRONE_EQUIP_IDS[de]] || 0;
      var take = Math.min(owned, cap - total);
      gameData.equippedDrones[DRONE_EQUIP_IDS[de]] = take;
      total += take;
    }
  } else {
    for (var de = 0; de < DRONE_EQUIP_IDS.length; de++) { if (gameData.equippedDrones[DRONE_EQUIP_IDS[de]] === undefined) gameData.equippedDrones[DRONE_EQUIP_IDS[de]] = 0; }
  }
}
function maxDroneCap() {
  return 20 + ((gameData.upgrades.maxDrones || 0) * 5);
}
function totalEquippedDrones() {
  var t = 0;
  if (gameData.equippedDrones) { for (var id in gameData.equippedDrones) t += gameData.equippedDrones[id] || 0; }
  return t;
}
function loadData() {
  try {
    var raw = localStorage.getItem('ssData');
     if (raw) { var d = JSON.parse(raw); gameData.points = d.points || 0; gameData.upgrades = d.upgrades || {}; gameData.beatenDifficulty = d.beatenDifficulty || []; gameData.equipped = d.equipped || []; gameData.unlockedUpgrades = d.unlockedUpgrades || []; gameData.activeSkin = d.activeSkin || 'default'; gameData.totalPointsSpent = d.totalPointsSpent || 0; gameData.threatBarLocked = d.threatBarLocked || false; gameData.planetKills = d.planetKills || {}; gameData.beatenPlanets = d.beatenPlanets || []; gameData.bossDefeats = d.bossDefeats || {}; gameData.equippedDrones = d.equippedDrones || {}; }
  } catch (e) { }
  for (var i = 0; i < SHOP_ITEMS.length; i++) { if (gameData.upgrades[SHOP_ITEMS[i].id] === undefined) gameData.upgrades[SHOP_ITEMS[i].id] = 0; }
  if (!gameData.beatenDifficulty) gameData.beatenDifficulty = [];
  if (!gameData.equipped || gameData.equipped.length === 0) gameData.equipped = DEFAULT_EQUIPPED.slice();
  if (!gameData.unlockedUpgrades) gameData.unlockedUpgrades = [];
  if (!gameData.activeSkin) gameData.activeSkin = 'default';
  initPlanetData();
  initEquippedDrones();
}
function saveData() { try { localStorage.setItem('ssData', JSON.stringify(gameData)); } catch (e) { } }

// ============================================================
// OPTIONS DATA
// ============================================================
var optionsData = { soundEnabled: true, mouseControl: false };
function loadOptions() {
  try { var raw = localStorage.getItem('ssOptions'); if (raw) { var d = JSON.parse(raw); optionsData.soundEnabled = d.soundEnabled !== undefined ? d.soundEnabled : true; optionsData.mouseControl = d.mouseControl !== undefined ? d.mouseControl : false; } } catch (e) { }
}
function saveOptions() { try { localStorage.setItem('ssOptions', JSON.stringify(optionsData)); } catch (e) { } }
function updateOptionsUI() {
  if (optSoundSpan) { optSoundSpan.textContent = optionsData.soundEnabled ? 'ON' : 'OFF'; optSoundSpan.className = 'opt-toggle' + (optionsData.soundEnabled ? ' on' : ''); }
  if (optMouseSpan) { optMouseSpan.textContent = optionsData.mouseControl ? 'ON' : 'OFF'; optMouseSpan.className = 'opt-toggle' + (optionsData.mouseControl ? ' on' : ''); }
}
window.toggleSound = function () { optionsData.soundEnabled = !optionsData.soundEnabled; saveOptions(); updateOptionsUI(); };
window.toggleMouse = function () { optionsData.mouseControl = !optionsData.mouseControl; saveOptions(); updateOptionsUI(); };
