var shopIndex = 0, shopTab = 0;
var TAB_NAMES = ['armas', 'drones', 'nave'];

function maxEquipped() { return 1 + (gameData.upgrades.weaponSlots || 0); }
window.shopSetTab = function (t) { playClick(); shopTab = t; shopIndex = 0; updateShopUI(); };
window.shopEquipWeapon = function (id) {
  var eq = gameData.equipped || [];
  var idx = eq.indexOf(id);
  if (idx >= 0) { eq.splice(idx, 1); }
  else if (eq.length < maxEquipped()) { eq.push(id); }
  gameData.equipped = eq; saveData(); updateShopUI();
};
window.shopSelectSkin = function (id) { playClick(); gameData.activeSkin = id; saveData(); updateShopUI(); };
function updateShopSelection() {
  var items = shopItemsDiv.querySelectorAll('.shop-item');
  for (var i = 0; i < items.length; i++) items[i].classList.toggle('selected', i === shopIndex);
}
function getItemCost(item, owned) {
  var base = item.cost;
  var rate = item.tab === 'drones' ? 0.2 : item.tab === 'nave' ? 0.15 : 0;
  return rate > 0 ? Math.round(base * Math.pow(1 + rate, owned)) : base;
}
function findShopItem(id) {
  for (var i = 0; i < SHOP_ITEMS.length; i++) { if (SHOP_ITEMS[i].id === id) return SHOP_ITEMS[i]; }
  for (var i = 0; i < ALL_WEAPONS.length; i++) { if (ALL_WEAPONS[i].id === id) return ALL_WEAPONS[i]; }
  return null;
}
function addShopSeparator(name) {
  var sep = document.createElement('div'); sep.className = 'shop-separator'; sep.textContent = name;
  shopItemsDiv.appendChild(sep);
}
function shopRenderItem(div, item, owned, maxed, actualCost, idx, buyBtn, equipBtn, equipped) {
  if (idx === shopIndex) div.classList.add('selected');
  var left = document.createElement('div'); left.className = 'shop-left';
  var symSpan = document.createElement('span'); symSpan.className = 'item-sym'; symSpan.textContent = ITEM_SYMBOLS[item.id] || ' '; symSpan.style.color = WEAPON_GLOW[item.id] || TAB_COLORS[shopTab];
  var info = document.createElement('div'); info.style.cssText = 'text-align:left';
  var nameEl = document.createElement('div'); nameEl.className = 'name'; nameEl.textContent = item.name;
  var descEl = document.createElement('div'); descEl.className = 'desc';
  var showMax = item.max > 1 && item.id !== 'drones' ? item.max : null;
  if (showMax) descEl.textContent = item.desc + ' (' + owned + '/' + showMax + ')';
  else descEl.textContent = item.desc + (item.max === 1 && owned > 0 ? ' (COMPRADO)' : '');
  info.appendChild(nameEl); info.appendChild(descEl); left.appendChild(symSpan); left.appendChild(info); div.appendChild(left);
  if (equipBtn) {
    var ebtn = document.createElement('button');
    ebtn.textContent = equipped ? 'EQUIPADO' : 'EQUIPAR';
    if (equipped) { ebtn.style.borderColor = '#0f0'; ebtn.style.color = '#0f0'; }
    else if (gameData.equipped.length >= maxEquipped()) ebtn.disabled = true;
    ebtn.onclick = function (id) { return function () { playClick(); window.shopEquipWeapon(id); }; }(item.id);
    div.appendChild(ebtn);
  }
  if (buyBtn) {
    var c = document.createElement('span'); c.className = 'cost'; c.textContent = actualCost + ' pts'; div.appendChild(c);
    var btn = document.createElement('button'); btn.textContent = 'COMPRAR';
    if (gameData.points < actualCost) btn.disabled = true;
    btn.onclick = function (id, cost, itemIdx) {
      return function () {
        if (gameData.points >= cost) { playClick(); gameData.points -= cost; gameData.upgrades[id] = (gameData.upgrades[id] || 0) + 1; gameData.totalPointsSpent += cost; saveData(); shopIndex = itemIdx; updateShopUI(); }
      };
    }(item.id, actualCost, idx);
    div.appendChild(btn);
  }
}
function updateShopUI() {
  menuPtsSpan.textContent = gameData.points;
  shopPtsSpan.textContent = gameData.points;
  updateThreatBar();
  var tabs = shopDiv.querySelectorAll('.tab-btn');
  for (var ti = 0; ti < tabs.length; ti++) tabs[ti].classList.toggle('active', ti === shopTab);
  shopItemsDiv.innerHTML = '';
  var idx = 0;
  if (shopTab === 0) {
    for (var ci = 0; ci < ARMES_CATEGORIES.length; ci++) {
      addShopSeparator(ARMES_CATEGORIES[ci].name);
      for (var wj = 0; wj < ARMES_CATEGORIES[ci].items.length; wj++) {
        var w = findShopItem(ARMES_CATEGORIES[ci].items[wj]);
        if (!w) continue;
        var owned = gameData.upgrades[w.id] || 0;
        var isFree = w.id === 'double' || w.id === 'triple';
        var purchased = isFree || owned > 0;
        var equipped = (gameData.equipped || []).indexOf(w.id) >= 0;
        var locked = !isFree && w.tab && gameData.unlockedUpgrades.indexOf(w.id) === -1;
        var div = document.createElement('div'); div.className = 'shop-item' + (locked ? ' locked' : '');
        if (locked) {
          var left = document.createElement('div'); left.className = 'shop-left';
          var symSpan = document.createElement('span'); symSpan.className = 'item-sym'; symSpan.textContent = ITEM_SYMBOLS[w.id] || ' '; symSpan.style.color = WEAPON_GLOW[w.id] || TAB_COLORS[shopTab];
          var info = document.createElement('div'); info.style.cssText = 'text-align:left';
          var nameEl = document.createElement('div'); nameEl.className = 'name'; nameEl.textContent = w.name;
          var descEl = document.createElement('div'); descEl.className = 'desc'; descEl.textContent = 'BLOQUEADO';
          info.appendChild(nameEl); info.appendChild(descEl); left.appendChild(symSpan); left.appendChild(info); div.appendChild(left);
          var lockSpan = document.createElement('span'); lockSpan.textContent = '\u2716'; lockSpan.style.fontSize = '20px';
          div.appendChild(lockSpan);
        } else if (purchased) { shopRenderItem(div, w, owned, false, 0, idx, false, true, equipped); }
        else { shopRenderItem(div, w, owned, false, w.cost, idx, true, false, false); }
        shopItemsDiv.appendChild(div);
        idx++;
      }
    }
  } else {
    var tabFilter = TAB_NAMES[shopTab];
    var cats = tabFilter === 'drones' ? DRONES_CATEGORIES : NAVE_CATEGORIES;
    for (var ci = 0; ci < cats.length; ci++) {
      addShopSeparator(cats[ci].name);
      for (var wj = 0; wj < cats[ci].items.length; wj++) {
        var item = findShopItem(cats[ci].items[wj]);
        if (!item) continue;
        var owned = gameData.upgrades[item.id] || 0;
        var actualCost = getItemCost(item, owned);
        var maxed = owned >= item.max;
        var locked = tabFilter !== 'nave' && gameData.unlockedUpgrades.indexOf(item.id) === -1;
        var div = document.createElement('div'); div.className = 'shop-item' + (locked ? ' locked' : '');
        if (locked) {
          var left = document.createElement('div'); left.className = 'shop-left';
          var symSpan = document.createElement('span'); symSpan.className = 'item-sym'; symSpan.textContent = ITEM_SYMBOLS[item.id] || ' '; symSpan.style.color = WEAPON_GLOW[item.id] || TAB_COLORS[shopTab];
          var info = document.createElement('div'); info.style.cssText = 'text-align:left';
          var nameEl = document.createElement('div'); nameEl.className = 'name'; nameEl.textContent = item.name;
          var descEl = document.createElement('div'); descEl.className = 'desc'; descEl.textContent = 'BLOQUEADO';
          info.appendChild(nameEl); info.appendChild(descEl); left.appendChild(symSpan); left.appendChild(info); div.appendChild(left);
          var lockSpan = document.createElement('span'); lockSpan.textContent = '\u2716'; lockSpan.style.fontSize = '20px';
          div.appendChild(lockSpan);
        } else if (item.isSkin && owned > 0) {
          if (idx === shopIndex) div.classList.add('selected');
          var left = document.createElement('div'); left.className = 'shop-left';
          var symSpan = document.createElement('span'); symSpan.className = 'item-sym'; symSpan.textContent = ITEM_SYMBOLS[item.id] || ' '; symSpan.style.color = WEAPON_GLOW[item.id] || TAB_COLORS[shopTab];
          var info = document.createElement('div'); info.style.cssText = 'text-align:left';
          var nameEl = document.createElement('div'); nameEl.className = 'name'; nameEl.textContent = item.name;
          var descEl = document.createElement('div'); descEl.className = 'desc'; descEl.textContent = item.desc + ' (COMPRADO)';
          info.appendChild(nameEl); info.appendChild(descEl); left.appendChild(symSpan); left.appendChild(info); div.appendChild(left);
          var sbtn = document.createElement('button');
          var isSelected = gameData.activeSkin === item.id;
          sbtn.textContent = isSelected ? 'SELECCIONADO' : 'SELECCIONAR';
          if (isSelected) { sbtn.style.borderColor = '#0f0'; sbtn.style.color = '#0f0'; }
          sbtn.onclick = function (id) { return function () { window.shopSelectSkin(id); }; }(item.id);
          div.appendChild(sbtn);
        } else if (maxed) {
          if (idx === shopIndex) div.classList.add('selected');
          var left = document.createElement('div'); left.className = 'shop-left';
          var symSpan = document.createElement('span'); symSpan.className = 'item-sym'; symSpan.textContent = ITEM_SYMBOLS[item.id] || ' '; symSpan.style.color = WEAPON_GLOW[item.id] || TAB_COLORS[shopTab];
          var info = document.createElement('div'); info.style.cssText = 'text-align:left';
          var nameEl = document.createElement('div'); nameEl.className = 'name'; nameEl.textContent = item.name;
          var descEl = document.createElement('div'); descEl.className = 'desc';
          var showMax = item.max > 1 && item.id !== 'drones' ? item.max : null;
          if (showMax) descEl.textContent = item.desc + ' (' + owned + '/' + showMax + ')';
          else descEl.textContent = item.desc + ' (COMPRADO)';
          info.appendChild(nameEl); info.appendChild(descEl); left.appendChild(symSpan); left.appendChild(info); div.appendChild(left);
          var m = document.createElement('span'); m.className = 'maxed'; m.textContent = 'MAX'; div.appendChild(m);
        } else if (DRONE_EQUIP_IDS.indexOf(item.id) >= 0) {
          if (idx === shopIndex) div.classList.add('selected');
          var left = document.createElement('div'); left.className = 'shop-left';
          var symSpan = document.createElement('span'); symSpan.className = 'item-sym'; symSpan.textContent = ITEM_SYMBOLS[item.id] || ' '; symSpan.style.color = WEAPON_GLOW[item.id] || TAB_COLORS[shopTab];
          var info = document.createElement('div'); info.style.cssText = 'text-align:left';
          var nameEl = document.createElement('div'); nameEl.className = 'name'; nameEl.textContent = item.name;
          var descEl = document.createElement('div'); descEl.className = 'desc'; descEl.textContent = 'Comprados: ' + owned;
          info.appendChild(nameEl); info.appendChild(descEl); left.appendChild(symSpan); left.appendChild(info); div.appendChild(left);
          var eq = gameData.equippedDrones[item.id] || 0;
          var mBtn = document.createElement('button'); mBtn.textContent = '-'; mBtn.style.minWidth = '30px'; mBtn.style.padding = '4px 8px';
          if (eq <= 0) mBtn.disabled = true;
          mBtn.onclick = function (id) { return function () { playClick(); gameData.equippedDrones[id] = Math.max(0, (gameData.equippedDrones[id] || 0) - 1); saveData(); updateShopUI(); }; }(item.id);
          div.appendChild(mBtn);
          var eqSpan = document.createElement('span'); eqSpan.style.cssText = 'color:#fff;min-width:24px;text-align:center;font-size:15px;letter-spacing:1px'; eqSpan.textContent = eq;
          div.appendChild(eqSpan);
          var pBtn = document.createElement('button'); pBtn.textContent = '+'; pBtn.style.minWidth = '30px'; pBtn.style.padding = '4px 8px';
          if (eq >= owned || totalEquippedDrones() >= maxDroneCap()) pBtn.disabled = true;
          pBtn.onclick = function (id) { return function () { playClick(); if ((gameData.equippedDrones[id] || 0) < (gameData.upgrades[id] || 0) && totalEquippedDrones() < maxDroneCap()) { gameData.equippedDrones[id] = (gameData.equippedDrones[id] || 0) + 1; saveData(); updateShopUI(); } }; }(item.id);
          div.appendChild(pBtn);
          var c = document.createElement('span'); c.className = 'cost'; c.textContent = actualCost + ' pts'; div.appendChild(c);
          var btn = document.createElement('button'); btn.textContent = 'COMPRAR';
          if (gameData.points < actualCost || owned >= item.max) btn.disabled = true;
          btn.onclick = function (id, cost, itemIdx) {
            return function () {
              if (gameData.points >= cost) { playClick(); gameData.points -= cost; gameData.upgrades[id] = (gameData.upgrades[id] || 0) + 1; gameData.totalPointsSpent += cost; saveData(); shopIndex = itemIdx; updateShopUI(); }
            };
          }(item.id, actualCost, idx);
          div.appendChild(btn);
        } else {
          shopRenderItem(div, item, owned, false, actualCost, idx, true, false, false);
        }
        shopItemsDiv.appendChild(div);
        idx++;
      }
    }
  }
  shopIndex = Math.min(shopIndex, shopItemsDiv.children.length - 1);
}
function openShop() {
  shopTab = 0; shopIndex = 0; updateShopUI(); menuDiv.style.display = 'none'; shopDiv.style.display = 'flex';
}
function closeShop() {
  shopDiv.style.display = 'none'; menuDiv.style.display = 'flex'; menuPtsSpan.textContent = gameData.points;
}
window.gameOpenShop = function () { playClick(); openShop(); };
window.gameCloseShop = function () { playClick(); closeShop(); };
function updateThreatBar() {
  var skullBtn = document.getElementById('skullBtn');
  if (gameData.threatBarLocked) {
    if (skullBtn) { skullBtn.disabled = true; skullBtn.title = 'COMPLETADO'; skullBtn.style.borderColor = '#345'; skullBtn.style.color = '#345'; }
  } else {
    if (skullBtn) { skullBtn.disabled = false; skullBtn.title = 'Nivel Espacial'; skullBtn.style.borderColor = ''; skullBtn.style.color = ''; }
  }
  var spent = Math.min(gameData.totalPointsSpent || 0, 3000);
  var pct = (spent / 3000) * 100;
  var fill = document.getElementById('threat-fill');
  if (fill) fill.style.width = pct + '%';
  var bar = document.getElementById('threat-bar');
  var el = document.getElementById('threat-level');
  if (!el) return;
  var threat = spent;
  if (gameData.threatBarLocked) {
    el.textContent = 'AMENAZA BLOQUEADA';
    el.style.color = '#666';
    if (fill) fill.classList.add('locked');
    if (bar) bar.classList.add('locked');
    return;
  }
  el.style.color = '#8af';
  if (fill) fill.classList.remove('locked');
  if (bar) bar.classList.remove('locked');
  var names = [];
  if (threat >= 1000) names.push('Circulares Rojos');
  if (threat >= 2000) names.push('Triangulares Naranja');
  if (threat >= 3000) names.push('Circulares Naranja');
  if (names.length === 0) el.textContent = 'AMENAZA: ' + spent + '/3000 — Enemigos basicos';
  else el.textContent = 'AMENAZA: ' + spent + '/3000 — Desbloqueados: ' + names.join(', ');
}
