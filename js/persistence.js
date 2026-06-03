// ============================================================
// PERSISTENCE
// ============================================================
var gameData = { points: 0, upgrades: {}, activeSkin: 'default', totalPointsSpent: 0 };
var DEFAULT_EQUIPPED = ['double', 'triple'];

function loadData() {
  try {
    var raw = localStorage.getItem('ssData');
    if (raw) { var d = JSON.parse(raw); gameData.points = d.points || 0; gameData.upgrades = d.upgrades || {}; gameData.beatenDifficulty = d.beatenDifficulty || []; gameData.equipped = d.equipped || []; gameData.unlockedUpgrades = d.unlockedUpgrades || []; gameData.activeSkin = d.activeSkin || 'default'; gameData.totalPointsSpent = d.totalPointsSpent || 0; gameData.threatBarLocked = d.threatBarLocked || false; }
  } catch (e) { }
  for (var i = 0; i < SHOP_ITEMS.length; i++) { if (gameData.upgrades[SHOP_ITEMS[i].id] === undefined) gameData.upgrades[SHOP_ITEMS[i].id] = 0; }
  if (!gameData.beatenDifficulty) gameData.beatenDifficulty = [];
  if (!gameData.equipped || gameData.equipped.length === 0) gameData.equipped = DEFAULT_EQUIPPED.slice();
  if (!gameData.unlockedUpgrades) gameData.unlockedUpgrades = [];
  if (gameData.difficulty) difficulty = gameData.difficulty;
  if (!gameData.activeSkin) gameData.activeSkin = 'default';
}
function saveData() { try { localStorage.setItem('ssData', JSON.stringify(gameData)); } catch (e) { } }

window.setDiff = function(d) {
  if (d !== 'easy' && gameData.beatenDifficulty.indexOf(d === 'hard' ? 'normal' : 'easy') === -1) return;
  difficulty = d; gameData.difficulty = d; saveData();
  if (diffDescSpan) {
    var pd = PLANET_DATA[d], poolInfo = REWARD_POOLS[d];
    var uc = 0, tc = poolInfo ? poolInfo.pool.length : 0;
    if (poolInfo) { for (var ri = 0; ri < poolInfo.pool.length; ri++) { if (gameData.unlockedUpgrades.indexOf(poolInfo.pool[ri]) !== -1) uc++; } }
    diffDescSpan.textContent = pd ? pd.desc + ' · Recompensas: ' + uc + '/' + tc + ' (' + (tc > 0 ? Math.round(uc / tc * 100) : 0) + '%)' : '';
  }
};
function updateDiffUI() {
  var order = ['easy', 'normal', 'hard'];
  var displayNames = { easy: 'TIERRA', normal: 'MARTE', hard: 'JÚPITER' };
  for (var i = 0; i < order.length; i++) {
    var el = document.querySelector('.planet-circle[data-diff="' + order[i] + ']');
    if (!el) continue;
    var unlocked = i === 0 || gameData.beatenDifficulty.indexOf(order[i - 1]) !== -1;
    el.classList.toggle('locked', !unlocked);
    el.classList.toggle('selected', order[i] === difficulty && unlocked);
    el.querySelector('.planet-name').textContent = displayNames[order[i]] + (unlocked ? '' : ' ?');
  }
  if (diffDescSpan) {
    var pd = PLANET_DATA[difficulty], poolInfo = REWARD_POOLS[difficulty];
    var unlockedCount = 0, totalCount = poolInfo ? poolInfo.pool.length : 0;
    if (poolInfo) { for (var ri = 0; ri < poolInfo.pool.length; ri++) { if (gameData.unlockedUpgrades.indexOf(poolInfo.pool[ri]) !== -1) unlockedCount++; } }
    diffDescSpan.textContent = pd ? pd.desc + ' · Recompensas: ' + unlockedCount + '/' + totalCount + ' (' + (totalCount > 0 ? Math.round(unlockedCount / totalCount * 100) : 0) + '%)' : '';
  }
}

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
