function startGame() {
  menuDiv.style.display = 'none'; shopDiv.style.display = 'none'; uiDiv.style.display = 'none';
  gameOverDiv.style.display = 'none'; levelIntroDiv.style.display = 'block';
  bossHpBar.style.display = 'none';
  var rs = document.getElementById('rewardScreen'); if (rs) rs.style.display = 'none';
  resetGame();
  weaponSpan.textContent = weaponLabel(player.weapon);
  scoreSpan.textContent = '0';
  levelNumSpan.textContent = '1';
  gameRunning = true;
}
window.gameStart = function () { playClick(); startGame(); };

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
  updateDiffUI();
};

function openOptions() {
  updateOptionsUI(); menuDiv.style.display = 'none'; optionsDiv.style.display = 'flex';
}
function closeOptions() {
  optionsDiv.style.display = 'none'; menuDiv.style.display = 'flex'; menuPtsSpan.textContent = gameData.points; updateDiffUI();
}
window.gameOpenOptions = function () { playClick(); openOptions(); };
window.gameCloseOptions = function () { playClick(); closeOptions(); };

window.resetAllData = function () {
  if (confirm('Seguro? Se borraran todos los datos guardados.')) {
    try { localStorage.removeItem('ssData'); } catch (e) { }
    gameData.points = 0; gameData.upgrades = {}; gameData.beatenDifficulty = [];
    gameData.equipped = DEFAULT_EQUIPPED.slice(); gameData.unlockedUpgrades = [];
    gameData.activeSkin = 'default'; gameData.totalPointsSpent = 0; gameData.threatBarLocked = false;
    difficulty = 'easy'; gameData.difficulty = 'easy';
    for (var i = 0; i < SHOP_ITEMS.length; i++) gameData.upgrades[SHOP_ITEMS[i].id] = 0;
    menuPtsSpan.textContent = '0'; playClick(); updateShopUI(); updateDiffUI();
  }
};
