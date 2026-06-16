function isPlanetUnlocked(pid) {
  var pd = PLANET_DATA[pid];
  if (!pd || !pd.unlock) return true;
  for (var ui = 0; ui < pd.unlock.length; ui++) {
    var req = pd.unlock[ui];
    if ((gameData.bossDefeats[req.planet] || 0) < req.count) return false;
  }
  return true;
}
function diffLabel(d) {
  return d === 'easy' ? 'FÁCIL' : d === 'normal' ? 'MEDIO' : 'DIFÍCIL';
}
function sphereStyle(pid) {
  var s = {
    tierra: 'radial-gradient(circle at 35% 35%, #4cf, #048)',
    marte: 'radial-gradient(circle at 35% 35%, #f84, #a20)',
    jupiter: 'repeating-linear-gradient(170deg,#e8bf9e 0px,#e8bf9e 3px,#c0855a 3px,#c0855a 5px,#d4a574 5px,#d4a574 8px,#b07040 8px,#b07040 10px,#e8bf9e 10px,#e8bf9e 13px,#f0d5b0 13px,#f0d5b0 16px,#c0855a 16px,#c0855a 18px,#d4a574 18px,#d4a574 20px),radial-gradient(circle at 50% 50%, #f4f, #80a)',
    saturno: 'radial-gradient(circle at 35% 35%, #fd0, #b80)',
    neptuno: 'radial-gradient(circle at 35% 35%, #0df, #048)'
  };
  return s[pid] || 'radial-gradient(circle at 50% 50%, #555, #222)';
}
function buildPlanetGrid() {
  var grid = document.getElementById('planetGrid');
  grid.innerHTML = '';
  for (var pi = 0; pi < PLANET_IDS.length; pi++) {
    var pid = PLANET_IDS[pi];
    var pd = PLANET_DATA[pid];
    var kills = gameData.planetKills[pid] || 0;
    var diff = DIFFICULTY[pd.difficulty];
    var thresholds = diff.riskThresholds;
    var riskLevel = kills >= thresholds[2] ? 3 : kills >= thresholds[1] ? 2 : kills >= thresholds[0] ? 1 : 0;
    var riskPct = 0;
    if (riskLevel < 3) {
      var tLow = riskLevel === 0 ? 0 : thresholds[riskLevel - 1];
      riskPct = (kills - tLow) / (thresholds[riskLevel] - tLow) * 100;
    } else riskPct = 100;
    var unlocked = isPlanetUnlocked(pid);
    var card = document.createElement('div');
    card.className = 'planet-card' + (unlocked ? '' : ' locked');
    var bossName = pd.boss ? pd.boss.name : '';
    card.innerHTML = '<div class="p-sphere" style="background:' + sphereStyle(pid) + '"></div>' +
      '<div class="p-name">' + pd.name + '</div>' +
      '<div style="font-size:10px;color:#8af;letter-spacing:1px;margin-bottom:4px">' + diffLabel(pd.difficulty) + '</div>' +
      '<div class="p-desc">' + pd.desc + '</div>' +
      '<div style="font-size:10px;color:#888;margin-bottom:4px">Jefe: ' + bossName + '</div>' +
      '<div class="p-risk-label">RIESGO ' + riskLevel + '</div>' +
      '<div class="p-risk-bar"><div class="p-risk-fill" style="width:' + riskPct + '%"></div></div>' +
      '<div style="font-size:10px;color:#555;margin-top:3px">' + kills + ' bajas</div>';
    if (unlocked) {
      card.onclick = function (id) { return function () { playClick(); selectPlanet(id); }; }(pid);
    }
    grid.appendChild(card);
  }
}
window.showPlanetSelection = function () {
  menuDiv.style.display = 'none'; shopDiv.style.display = 'none'; uiDiv.style.display = 'none';
  gameOverDiv.style.display = 'none'; levelIntroDiv.style.display = 'none';
  bossHpBar.style.display = 'none';
  var rs = document.getElementById('rewardScreen'); if (rs) rs.style.display = 'none';
  document.getElementById('planetSelect').style.display = 'flex';
  buildPlanetGrid();
};
function selectPlanet(pid) {
  document.getElementById('planetSelect').style.display = 'none';
  gameOverDiv.style.display = 'none';
  var rs = document.getElementById('rewardScreen'); if (rs) rs.style.display = 'none';
  isSpecialLevel = false;
  currentPlanet = pid;
  difficulty = PLANET_DATA[pid].difficulty;
  level = 1;
  enemiesSpawned = 0;
  enemiesKilledInLevel = 0;
  enemies = []; enemyBullets = []; asteroids = []; powerups = []; trails = [];
  specialPickups = []; shieldPickups = []; lasers = []; points = [];
  boss = null; explosions = []; selfDestructProjectiles = [];
  resetPlayer();
  weaponAmmo = 0; droneAmmo = 0; droneWeapon = 'normal'; droneFusion = null; weaponQueue = [];
  screenShake = 0; frame = 0; lastPlayerShot = 0; scoreMult = 1; scoreMultTimer = 0; fireRateMult = 1; fireRateMultTimer = 0;
  autoEquipTimer = 0; droneAutoEquipTimer = 0;
  gameState = 'levelIntro';
  stateTimer = 30;
  levelIntroText = PLANET_DATA[pid].name.toUpperCase() + ' 1';
  levelIntroDiv.textContent = levelIntroText;
  levelIntroDiv.style.display = 'block';
  bossHpBar.style.display = 'none';
  bossHpBar.classList.remove('green');
  initDrones();
  stars = [];
  for (var si = 0; si < 80; si++) { stars.push({ x: rand(0, 480), y: rand(0, 720), speed: 0.2 + rand(0, 0.8), size: rand(0.5, 2) }); }
  uiDiv.style.display = 'block';
  gameRunning = true;
  updateBombUI();
}
window.gameStart = function () { playClick(); showPlanetSelection(); };

window.goShop = function () {
  playClick();
  gameOverDiv.style.display = 'none';
  document.getElementById('rewardScreen').style.display = 'none';
  openShop();
};
window.closeRewards = function () {
  playClick();
  document.getElementById('rewardScreen').style.display = 'none';
  menuDiv.style.display = 'flex';
  menuPtsSpan.textContent = gameData.points;
};
window.goBackToMenu = function () {
  playClick();
  document.getElementById('planetSelect').style.display = 'none';
  menuDiv.style.display = 'flex';
  menuPtsSpan.textContent = gameData.points;
};

function openOptions() {
  updateOptionsUI(); menuDiv.style.display = 'none'; optionsDiv.style.display = 'flex';
}
function closeOptions() {
  optionsDiv.style.display = 'none'; menuDiv.style.display = 'flex'; menuPtsSpan.textContent = gameData.points;
}
window.gameOpenOptions = function () { playClick(); openOptions(); };
window.gameCloseOptions = function () { playClick(); closeOptions(); };

window.resetAllData = function () {
  if (confirm('Seguro? Se borraran todos los datos guardados.')) {
    try { localStorage.removeItem('ssData'); } catch (e) { }
    gameData.points = 0; gameData.upgrades = {}; gameData.beatenDifficulty = [];
    gameData.equipped = DEFAULT_EQUIPPED.slice(); gameData.unlockedUpgrades = [];
    gameData.activeSkin = 'default'; gameData.totalPointsSpent = 0; gameData.threatBarLocked = false;
    gameData.planetKills = {}; gameData.beatenPlanets = []; gameData.bossDefeats = {}; gameData.equippedDrones = {};
    initPlanetData(); initEquippedDrones();
    difficulty = 'easy';
    for (var i = 0; i < SHOP_ITEMS.length; i++) gameData.upgrades[SHOP_ITEMS[i].id] = 0;
    menuPtsSpan.textContent = '0'; playClick(); updateShopUI();
  }
};
