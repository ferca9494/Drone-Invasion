// ============================================================
// INPUT
// ============================================================
var keys = {};
document.addEventListener('keydown', function (e) {
  keys[e.key] = true;
  var key = e.key;
  if ((key === 'r' || key === 'R') && !gameRunning && menuDiv.style.display === 'none') { score = 0; selectPlanet(currentPlanet); }
  if (key === ' ' || key === 'Space') e.preventDefault();
  if ((key === 'b' || key === 'B') && gameRunning) useBomb();
  if ((key === 'x' || key === 'X') && gameRunning) useBombFull();
  if ((key === 'f' || key === 'F') && gameRunning && gameData.upgrades.selfDestruct) useSelfDestruct();
  if ((key === 'c' || key === 'C') && gameRunning && !paused && gameData.upgrades.dash) { e.preventDefault(); doDash(); }
  if (key === 'Escape' && gameRunning) { e.preventDefault(); paused = !paused; return; }
  // Global keyboard shortcuts for overlays
  if (menuDiv.style.display !== 'none' && menuDiv.style.display !== '') {
    if (key === 'Enter') { e.preventDefault(); window.gameStart(); }
    else if (key === 't' || key === 'T') { e.preventDefault(); window.gameOpenShop(); }
    else if (key === 'o' || key === 'O') { e.preventDefault(); window.gameOpenOptions(); }
    else if (key === 'r' || key === 'R') { e.preventDefault(); window.resetAllData(); }

  } else if (shopDiv.style.display !== 'none' && shopDiv.style.display !== '') {
    if (key === 'Escape') { e.preventDefault(); window.gameCloseShop(); }
    else if (key === 'ArrowLeft') { e.preventDefault(); window.shopSetTab(Math.max(shopTab - 1, 0)); }
    else if (key === 'ArrowRight') { e.preventDefault(); window.shopSetTab(Math.min(shopTab + 1, 2)); }
    else if (key === 'ArrowDown') { e.preventDefault(); shopIndex = Math.min(shopIndex + 1, shopItemsDiv.children.length - 1); updateShopSelection(); }
    else if (key === 'ArrowUp') { e.preventDefault(); shopIndex = Math.max(shopIndex - 1, 0); updateShopSelection(); }
    else if (key === ' ' || key === 'Space') {
      e.preventDefault();
      var sel = shopItemsDiv.children[shopIndex];
      if (sel) { var btn = sel.querySelector('button'); if (btn && !btn.disabled) btn.click(); }
    }
  } else if (gameOverDiv.style.display !== 'none' && gameOverDiv.style.display !== '') {
    if (key === 't' || key === 'T') { e.preventDefault(); window.goShop(); }
  } else if (optionsDiv.style.display !== 'none' && optionsDiv.style.display !== '') {
    if (key === 'Escape') { e.preventDefault(); window.gameCloseOptions(); }
  }
});
document.addEventListener('keyup', function (e) { keys[e.key] = false; });

// Mouse control
var mouseX = 240, mouseY = 640;
document.addEventListener('mousemove', function (e) {
  if (!optionsData.mouseControl) return;
  var rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
  mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  mouseX = Math.max(20, Math.min(460, mouseX));
  mouseY = Math.max(25, Math.min(695, mouseY));
});
