// ============================================================
// GAME STATE
// ============================================================
var gameRunning = false, paused = false, score = 0, screenShake = 0, frame = 0, lastPlayerShot = 0, baseFireRate = 250;
var isSpecialLevel = false;
var shipImg = new Image(); shipImg.src = 'assets/nave-sprite1.png';
var player = { x: 240, y: 640, w: 30, h: 38, speed: 4, hp: 3, maxHp: 3, invincible: 0, weapon: 'normal', hasShield: false, fusion: null };
var playerLastDirX = 0, playerLastDirY = -1;
var bullets = [], enemies = [], enemyBullets = [], asteroids = [], powerups = [], explosions = [], trails = [];
var hearts = [];
var lasers = [];
var drones = [];
var selfDestructProjectiles = [];
var dashCooldownTimer = 0, dashEffectTimer = 0, dashFromX = 0, dashFromY = 0;
var boss = null;
var bombs = 0, bombFull = 0;
var scoreMult = 1, scoreMultTimer = 0, fireRateMult = 1, fireRateMultTimer = 0;
var specialPickups = [], shieldPickups = [];
var autoEquipTimer = 0, droneAutoEquipTimer = 0;

// Level system
var level = 1, enemiesSpawned = 0, enemiesKilledInLevel = 0;
var gameState = 'playing';
var stateTimer = 0;
var levelIntroText = '';

// Weapon queue system
var weaponQueue = [];
var droneWeapon = 'normal';
var droneFusion = null;
var POINTS_QUEUE_MAX = 5;
var points = [];
var droneFormation = 'line';
var difficulty = 'normal';
var weaponAmmo = 0, droneAmmo = 0;

function maxShipAmmo() { var l = gameData.upgrades.shipAmmo || 0; return 20 + Math.min(l, 2) * 5 + Math.max(0, l - 2) * 10; }
function maxDroneAmmo() { var l = gameData.upgrades.droneAmmo || 0; return 20 + Math.min(l, 2) * 5 + Math.max(0, l - 2) * 10; }

// ============================================================
// STARS
// ============================================================
var stars = [];
function initStars() {
  for (var i = 0; i < 100; i++) stars.push({ x: Math.random() * 480, y: Math.random() * 720, size: Math.random() * 2 + 0.5, speed: Math.random() * 3 + 1 });
}

// ============================================================
// UTILITY
// ============================================================
function rand(a, b) { return Math.random() * (b - a) + a; }
function roundRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}
function collide(a, b) {
  return a.x - a.w / 2 < b.x + b.w / 2 && a.x + a.w / 2 > b.x - b.w / 2 &&
    a.y - a.h / 2 < b.y + b.h / 2 && a.y + a.h / 2 > b.y - b.h / 2;
}
function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }

// ============================================================
// RESET
// ============================================================
function resetPlayer() {
  var u = gameData.upgrades;
  player.speed = 4 + (u.speed || 0) * 0.8;
  player.maxHp = 3 + (u.hp || 0);
  player.hp = player.maxHp;
  player.hasShield = (u.shield || 0) > 0;
  player.invincible = player.hasShield ? 90 : 0;
  baseFireRate = 250 - (u.fireRate || 0) * 15;
  bombs = (u.bomb || 0) * 2;
  bombFull = (u.bombFull || 0) >= 1 ? 1 : 0;
  if (u.homing) player.weapon = 'homing';
  else if (u.laser) player.weapon = 'laser';
  else player.weapon = 'normal';
  player.fusion = null;
  player.x = 240; player.y = 640;
  player.w = 30; player.h = 38;
  dashCooldownTimer = 0; dashEffectTimer = 0;
}
function initDrones() {
  drones = [];
  var hpBase = 1 + (gameData.upgrades.droneHp || 0);
  var n = gameData.upgrades.drones || 0;
  for (var i = 0; i < n; i++) {
    drones.push({ angle: (i / n) * Math.PI * 2, dist: 38, shootTimer: 0, hp: hpBase, maxHp: hpBase, type: 'normal' });
  }
  var sn = gameData.upgrades.smartDrone || 0;
  for (var i = 0; i < sn; i++) {
    drones.push({ angle: (i / sn) * Math.PI * 2, dist: 38, shootTimer: 0, hp: hpBase, maxHp: hpBase, type: 'smart' });
  }
  var cn = gameData.upgrades.circularDrone || 0;
  for (var i = 0; i < cn; i++) {
    drones.push({ angle: (i / cn) * Math.PI * 2, dist: 38, shootTimer: 0, hp: hpBase, maxHp: hpBase, type: 'circular' });
  }
  var pc = gameData.upgrades.protectDrone || 0;
  for (var i = 0; i < pc; i++) {
    drones.push({ angle: (i / pc) * Math.PI * 2, dist: 40, shootTimer: 0, protect: true, hp: 999 });
  }
}
function resetGame() {
  score = 0; screenShake = 0; frame = 0; lastPlayerShot = 0;
  bullets = []; enemies = []; enemyBullets = []; asteroids = []; powerups = []; explosions = []; lasers = []; points = []; trails = [];
  selfDestructProjectiles = [];
  weaponQueue = []; droneWeapon = 'normal'; droneFusion = null; weaponAmmo = 0; droneAmmo = 0;
  specialPickups = []; shieldPickups = []; scoreMult = 1; scoreMultTimer = 0; fireRateMult = 1; fireRateMultTimer = 0;
  autoEquipTimer = 0; droneAutoEquipTimer = 0;
  boss = null;
  level = 1; enemiesSpawned = 0; enemiesKilledInLevel = 0;
  gameState = 'levelIntro'; stateTimer = 120; levelIntroText = 'NIVEL 1';
  isSpecialLevel = false;
  levelIntroDiv.textContent = levelIntroText;
  levelIntroDiv.style.display = 'block';
  bossHpBar.style.display = 'none';
  bossHpBar.classList.remove('green');
  resetPlayer();
  initDrones();
  updateBombUI();
}

// ============================================================
// SPAWN
// ============================================================
function spawnEnemy() {
  if (enemiesSpawned >= (isSpecialLevel ? SPECIAL_LEVEL_CONFIG.levelMax[level] : DIFFICULTY[difficulty].levelMax[level])) return;
  if (isSpecialLevel) {
    var type = 3;
    enemies.push({ x: rand(30, 450), y: -30, w: 36, h: 36, hp: 4 + Math.floor(level * 2) + SPECIAL_LEVEL_CONFIG.enemyHpBonus, speed: rand(0.8, 1.8), shootTimer: rand(0, 60), type: type });
    enemiesSpawned++;
    return;
  }
  var threat = gameData.totalPointsSpent || 0;
  if (gameData.threatBarLocked) threat = 0;
  var unlocked = [0];
  if (threat >= 1000) unlocked.push(2);
  if (threat >= 2000) unlocked.push(1);
  if (threat >= 3000) unlocked.push(3);
  var type = unlocked[Math.floor(Math.random() * unlocked.length)];
  enemies.push({ x: rand(30, 450), y: -30, w: 36, h: 36, hp: 2 + Math.floor(level / 2) + DIFFICULTY[difficulty].enemyHpBonus, speed: rand(1, 2.5), shootTimer: rand(0, 60), type: type });
  enemiesSpawned++;
}
function spawnAsteroid() {
  if (isSpecialLevel) {
    var sSize = 12 + rand(0, 8);
    asteroids.push({ x: rand(30, 450), y: -40, w: sSize, h: sSize, size: 0, hp: 1, speed: rand(1.5, 3), rot: rand(0, 6.28), rotSpeed: rand(-0.1, 0.1) });
    return;
  }
  var s, sz;
  if (difficulty === 'hard') {
    s = Math.random() < 0.5 ? 2 : 3;
    sz = { 2: 60, 3: 80 };
  } else {
    s = Math.random() < 0.33 ? 1 : (Math.random() < 0.5 ? 2 : 3);
    sz = { 1: 24, 2: 36, 3: 50 };
  }
  asteroids.push({ x: rand(30, 450), y: -40, w: sz[s], h: sz[s], size: s, hp: s + (difficulty === 'hard' ? 2 : 0), speed: rand(0.8, 2), rot: rand(0, 6.28), rotSpeed: rand(-0.05, 0.05) });
}
function spawnPowerup(x, y) {
  var eq = gameData.equipped || [];
  if (eq.length === 0) return;
  var type = eq[Math.floor(Math.random() * eq.length)];
  powerups.push({ x: x, y: y, w: 20, h: 20, type: type, speed: 1.5 });
}
function addExplosion(x, y, color, n) {
  for (var i = 0; i < (n || 12); i++) {
    var a = rand(0, 6.28), s = rand(1, 4);
    explosions.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(20, 50), maxLife: 50, size: rand(2, 5), color: color || '#ff0' });
  }
}
function spawnPoints(x, y, count, value) {
  var pv = value || DIFFICULTY[difficulty].pointValue;
  for (var i = 0; i < count; i++) {
    points.push({ x: x + rand(-12, 12), y: y + rand(-12, 12), vx: rand(-0.5, 0.5), vy: rand(0.3, 1), w: 8, h: 8, life: 300, value: pv });
  }
}

// ============================================================
// BOSS
// ============================================================
function spawnBoss() {
  var bd = BOSS_DATA[difficulty] || BOSS_DATA.easy;
  boss = {
    x: 240, y: -80, w: bd.w, h: bd.h, hp: bd.maxHp, maxHp: bd.maxHp,
    speed: bd.speed, dir: 1, shootTimer: 0, moveTimer: 0, droneTimer: 0
  };
  bossHpFill.style.width = '100%';
  bossHpBar.style.display = 'block';
}
function updateBoss() {
  if (!boss) return;
  var bd = BOSS_DATA[difficulty] || BOSS_DATA.easy;
  if (boss.y < 80) { boss.y += 1; return; }
  boss.x += boss.speed * boss.dir;
  if (boss.x > 400) boss.dir = -1;
  if (boss.x < 80) boss.dir = 1;

  boss.shootTimer++;
  boss.moveTimer++;

  if (difficulty === 'easy') {
    if (boss.shootTimer >= 90) {
      boss.shootTimer = 0;
      var n = 12 + level;
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2;
        enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5, w: 7, h: 7 });
      }
    }
    if (boss.moveTimer % 45 === 0) {
      var dx = player.x - boss.x, dy = player.y - boss.y;
      var a = Math.atan2(dy, dx);
      enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * 3.5, vy: Math.sin(a) * 3.5, w: 7, h: 7 });
    }
  } else if (difficulty === 'normal') {
    if (boss.shootTimer >= 100) {
      boss.shootTimer = 0;
      for (var i = 0; i < 5; i++) {
        var a = Math.atan2(player.y - boss.y, player.x - boss.x) + (i - 2) * 0.15;
        enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, w: 8, h: 8, homing: true });
      }
    }
    if (boss.moveTimer % 60 === 0) {
      for (var i = 0; i < 8; i++) {
        var a = (i / 8) * Math.PI * 2;
        enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * 2.8, vy: Math.sin(a) * 2.8, w: 6, h: 6 });
      }
    }
  } else {
    if (boss.shootTimer >= 60) {
      boss.shootTimer = 0;
      for (var ring = 0; ring < 2; ring++) {
        var n = 16 + ring * 8;
        for (var i = 0; i < n; i++) {
          var a = (i / n) * Math.PI * 2 + ring * 0.2;
          var spd = 1.5 + ring * 0.8;
          enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 5, h: 5 });
        }
      }
    }
    if (boss.moveTimer % 30 === 0) {
      var dx = player.x - boss.x, dy = player.y - boss.y;
      var a = Math.atan2(dy, dx);
      enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4, w: 7, h: 7 });
    }
    boss.droneTimer = (boss.droneTimer || 0) + 1;
    if (boss.droneTimer >= 180 && enemies.length < 10) {
      boss.droneTimer = 0;
      var isCircular = Math.random() < 0.5;
      enemies.push({
        x: boss.x + rand(-60, 60), y: boss.y + 30, w: 24, h: 24,
        hp: 5, speed: rand(0.5, 1), shootTimer: rand(0, 60), type: isCircular ? 'circular' : 'straight',
        bossMinion: true
      });
    }
  }

  bossHpFill.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%';
  if (boss.hp <= 0) {
    playBossExplosion();
    addExplosion(boss.x, boss.y, '#f88', 40);
    addExplosion(boss.x, boss.y, '#ff0', 30);
    boss = null;
    bossHpBar.style.display = 'none';
    gameWon();
  }
}

function spawnBossEspia() {
  var bd = BOSS_DATA_ESPIA;
  boss = {
    x: 240, y: -80, w: bd.w, h: bd.h, hp: bd.maxHp, maxHp: bd.maxHp,
    speed: bd.speed, dir: 1, shootTimer: 0, moveTimer: 0, droneTimer: 0
  };
  bossHpFill.style.width = '100%';
  bossHpBar.style.display = 'block';
  bossHpBar.classList.add('green');
}
function updateBossEspia() {
  if (!boss) return;
  if (boss.y < 80) { boss.y += 0.8; return; }
  boss.x += boss.speed * boss.dir;
  if (boss.x > 400) boss.dir = -1;
  if (boss.x < 80) boss.dir = 1;
  boss.shootTimer++;
  boss.moveTimer++;
  if (boss.shootTimer >= 50) {
    boss.shootTimer = 0;
    var n = 5 + level;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2 + boss.moveTimer * 0.02;
      enemyBullets.push({
        x: boss.x, y: boss.y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3,
        w: 8, h: 8, supercali: true, dmg: 2
      });
    }
  }
  if (boss.moveTimer % 40 === 0) {
    var dx = player.x - boss.x, dy = player.y - boss.y;
    var a = Math.atan2(dy, dx);
    enemyBullets.push({
      x: boss.x, y: boss.y, vx: Math.cos(a) * 4, vy: Math.sin(a) * 4,
      w: 10, h: 10, supercali: true, dmg: 3
    });
  }
  bossHpFill.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%';
  if (boss.hp <= 0) {
    playBossExplosion();
    addExplosion(boss.x, boss.y, '#0f0', 50);
    addExplosion(boss.x, boss.y, '#ff0', 30);
    boss = null;
    bossHpBar.style.display = 'none';
    gameWon();
  }
}

window.startSpecialLevel = function() {
  playClick();
  menuDiv.style.display = 'none'; shopDiv.style.display = 'none'; uiDiv.style.display = 'none';
  gameOverDiv.style.display = 'none'; levelIntroDiv.style.display = 'block';
  bossHpBar.style.display = 'none';
  var rs = document.getElementById('rewardScreen'); if (rs) rs.style.display = 'none';
  resetGame();
  isSpecialLevel = true;
  level = 1;
  enemiesSpawned = 0;
  gameState = 'levelIntro';
  stateTimer = 90;
  levelIntroText = 'NIVEL ESPECIAL';
  levelIntroDiv.textContent = levelIntroText;
  weaponSpan.textContent = weaponLabel(player.weapon);
  scoreSpan.textContent = '0';
  levelNumSpan.textContent = '1';
  gameRunning = true;
};

// ============================================================
// WEAPONS
// ============================================================
function shoot() {
  playShoot();
  if (player.fusion) {
    var disp = player.fusion.dispersion;
    var special = player.fusion.special;
    var fb = [];
    switch (disp) {
      case 'spread':
        for (var fi = -2; fi <= 2; fi++) fb.push({ x: player.x, y: player.y - 19, vx: fi * 1.2, vy: -6, w: 4, h: 14, dmg: 1 });
        break;
      case 'triple':
        fb.push({ x: player.x, y: player.y - 19, vx: -2, vy: -6, w: 4, h: 14, dmg: 1 });
        fb.push({ x: player.x, y: player.y - 19, vx: 0, vy: -6, w: 4, h: 14, dmg: 1 });
        fb.push({ x: player.x, y: player.y - 19, vx: 2, vy: -6, w: 4, h: 14, dmg: 1 });
        break;
      case 'double':
        fb.push({ x: player.x - 10, y: player.y - 19, vx: 0, vy: -7, w: 4, h: 16, dmg: 1 });
        fb.push({ x: player.x + 10, y: player.y - 19, vx: 0, vy: -7, w: 4, h: 16, dmg: 1 });
        break;
      case 'sine':
        for (var si = -1; si <= 1; si++) fb.push({ x: player.x, y: player.y - 19, baseX: player.x + si * 8, vx: 0, vy: -5, w: 4, h: 14, dmg: 1, sine: true });
        break;
      case 'chicken':
        for (var ck = 0; ck < 7; ck++) { var cAng = -0.5 + Math.random() * 1; fb.push({ x: player.x + rand(-8, 8), y: player.y - 19, vx: Math.sin(cAng) * 3, vy: -4 - Math.random() * 2, w: 3, h: 6, dmg: 1 }); }
        break;
      case 'dim4':
        fb.push({ x: player.x, y: player.y - 19, vx: 0, vy: -7, w: 4, h: 16, dmg: 1 });
        fb.push({ x: player.x, y: player.y + 25, vx: 0, vy: 7, w: 4, h: 16, dmg: 1 });
        fb.push({ x: player.x - 25, y: player.y, vx: -7, vy: 0, w: 16, h: 4, dmg: 1 });
        fb.push({ x: player.x + 25, y: player.y, vx: 7, vy: 0, w: 16, h: 4, dmg: 1 });
        break;
    }
    if (special === 'laser' || special === 'superLaser') {
      playLaser();
      var isSuper = special === 'superLaser';
      for (var li = 0; li < fb.length; li++) {
        var bx = fb[li].x;
        lasers.push({ x: bx, y: player.y - 19, length: 600, timer: 0, super: isSuper });
        var dmg = isSuper ? 3 : 1;
        for (var ei = 0; ei < enemies.length; ei++) {
          var e = enemies[ei];
          if (Math.abs(e.x - bx) < 20 && e.y < player.y - 19 && e.y > player.y - 19 - 600) { e.hp -= dmg; if (e.hp <= 0) { addExplosion(e.x, e.y, '#f44', 16); playExplosion(); enemies.splice(ei, 1); score += 100 * scoreMult; screenShake = 6; ei--; } }
        }
        for (var ai = 0; ai < asteroids.length; ai++) {
          var a = asteroids[ai];
          if (Math.abs(a.x - bx) < (isSuper ? 25 : 25) && a.y < player.y - 19 && a.y > player.y - 19 - 600) { a.hp -= dmg; if (a.hp <= 0) { onAsteroidDestroy(a, ai); ai--; } }
        }
        if (boss && Math.abs(boss.x - bx) < (isSuper ? 45 : 45) && boss.y < player.y - 19 && boss.y > player.y - 19 - 600) boss.hp -= isSuper ? 2 : 0.5;
      }
      var ammoCost = isSuper ? 3 : 1;
      weaponAmmo -= ammoCost;
      if (weaponAmmo <= 0) { player.weapon = 'normal'; player.fusion = null; weaponAmmo = 0; weaponSpan.textContent = 'Normal'; }
      return;
    }
    for (var bi = 0; bi < fb.length; bi++) {
      var b = fb[bi];
      b.friendly = true; b.t = 0;
      switch (special) {
        case 'ricochet': b.ricochet = true; b.bounces = 3; break;
        case 'explosive': b.dmg = 2; b.explosive = true; break;
        case 'pulse': b.w = 20; b.h = 20; b.vx = 0; b.vy = -4; b.pulse = true; break;
        case 'super': b.w = 16; b.h = 24; b.dmg = 5; b.pierce = true; b.vy = -8; break;
        case 'supercalifragilistico': b.w = 14; b.h = 26; b.dmg = 6; b.pierce = true; b.supercali = true; b.vy = -9; break;
        case 'cola': b.w = 6; b.h = 14; b.dmg = 2; b.cola = true; break;
        case 'homing': {
          var target = null, minD = 999;
          for (var hi = 0; hi < enemies.length; hi++) { var hd = dist(player, enemies[hi]); if (hd < minD) { minD = hd; target = enemies[hi]; } }
          if (!target && boss) target = boss;
          b.homing = target; b.w = 6; b.h = 12; b.dmg = 2;
          b.getTarget = function () { return this.homing && this.homing.hp > 0 ? this.homing : null; };
          break;
        }
        case 'feline': {
          var ftarget = null, fminD = 999;
          for (var fi = 0; fi < enemies.length; fi++) { var fd = dist(player, enemies[fi]); if (fd < fminD) { fminD = fd; ftarget = enemies[fi]; } }
          if (!ftarget && boss) ftarget = boss;
          b.homing = ftarget; b.w = 5; b.h = 10; b.dmg = 2;
          b.getTarget = function () { return this.homing && this.homing.hp > 0 ? this.homing : null; };
          break;
        }
      }
      bullets.push(b);
    }
      var ammoCost = special === 'super' || special === 'supercalifragilistico' ? 3 : 1;
      weaponAmmo -= ammoCost;
    if (weaponAmmo <= 0) { player.weapon = 'normal'; player.fusion = null; weaponAmmo = 0; weaponSpan.textContent = 'Normal'; }
    return;
  }
  switch (player.weapon) {
    case 'spread':
      for (var i = -2; i <= 2; i++) bullets.push({ x: player.x, y: player.y - 19, vx: i * 1.2, vy: -6, w: 4, h: 14, dmg: 1, friendly: true, t: 0 });
      break;
    case 'triple':
      bullets.push({ x: player.x, y: player.y - 19, vx: -2, vy: -6, w: 4, h: 14, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: player.x, y: player.y - 19, vx: 0, vy: -6, w: 4, h: 14, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: player.x, y: player.y - 19, vx: 2, vy: -6, w: 4, h: 14, dmg: 1, friendly: true, t: 0 });
      break;
    case 'homing': {
      var target = null, minD = 999;
      for (var i = 0; i < enemies.length; i++) { var d = dist(player, enemies[i]); if (d < minD) { minD = d; target = enemies[i]; } }
      if (!target && boss) { target = boss; }
      bullets.push({
        x: player.x, y: player.y - 19, vx: 0, vy: -5, w: 6, h: 12, dmg: 2, friendly: true, t: 0, homing: target,
        getTarget: function () { return this.homing && this.homing.hp > 0 ? this.homing : null; }
      });
      break;
    }
    case 'double':
      bullets.push({ x: player.x - 10, y: player.y - 19, vx: 0, vy: -7, w: 4, h: 16, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: player.x + 10, y: player.y - 19, vx: 0, vy: -7, w: 4, h: 16, dmg: 1, friendly: true, t: 0 });
      break;
    case 'pulse':
      bullets.push({ x: player.x, y: player.y - 19, vx: 0, vy: -4, w: 20, h: 20, dmg: 1, friendly: true, t: 0, pulse: true });
      break;
    case 'explosive':
      bullets.push({ x: player.x, y: player.y - 19, vx: 0, vy: -6, w: 6, h: 14, dmg: 2, friendly: true, t: 0, explosive: true });
      break;
    case 'ricochet':
      bullets.push({ x: player.x, y: player.y - 19, vx: 0, vy: -7, w: 4, h: 14, dmg: 1, friendly: true, t: 0, ricochet: true, bounces: 3 });
      break;
    case 'super':
      bullets.push({ x: player.x, y: player.y - 19, vx: 0, vy: -8, w: 16, h: 24, dmg: 5, friendly: true, t: 0, pierce: true });
      break;
    case 'supercalifragilistico':
      var sc = { x: player.x, y: player.y - 19, vx: 0, vy: -9, w: 14, h: 26, dmg: 6, friendly: true, t: 0, pierce: true, supercali: true };
      sc.getDamage = function() { return 6; };
      bullets.push(sc);
      break;
    case 'sine':
      for (var si = -1; si <= 1; si++) bullets.push({ x: player.x, y: player.y - 19, baseX: player.x + si * 8, vx: 0, vy: -5, w: 4, h: 14, dmg: 1, friendly: true, t: 0, sine: true });
      break;
    case 'cola':
      bullets.push({ x: player.x, y: player.y - 19, vx: 0, vy: -6, w: 6, h: 14, dmg: 2, friendly: true, t: 0, cola: true });
      break;
    case 'feline': {
      var ftarget = null, fminD = 999;
      for (var fi = 0; fi < enemies.length; fi++) { var fd = dist(player, enemies[fi]); if (fd < fminD) { fminD = fd; ftarget = enemies[fi]; } }
      if (!ftarget && boss) ftarget = boss;
      for (var fj = -1; fj <= 1; fj++) {
        bullets.push({
          x: player.x, y: player.y - 19, vx: 0, vy: -4, w: 5, h: 10, dmg: 2, friendly: true, t: 0, homing: ftarget,
          getTarget: function () { return this.homing && this.homing.hp > 0 ? this.homing : null; }
        });
      }
      break;
    }
    case 'chicken':
      for (var ck = 0; ck < 7; ck++) {
        var cAng = -0.5 + Math.random() * 1;
        bullets.push({ x: player.x + rand(-8, 8), y: player.y - 19, vx: Math.sin(cAng) * 3, vy: -4 - Math.random() * 2, w: 3, h: 6, dmg: 1, friendly: true, t: 0 });
      }
      break;
    case 'superLaser':
      playLaser();
      lasers.push({ x: player.x, y: player.y - 19, length: 600, timer: 0, super: true });
      for (var sli = 0; sli < enemies.length; sli++) {
        var sle = enemies[sli];
        if (Math.abs(sle.x - player.x) < 20 && sle.y < player.y - 19 && sle.y > player.y - 19 - 600) { sle.hp -= 3; if (sle.hp <= 0) { addExplosion(sle.x, sle.y, '#f44', 16); playExplosion(); enemies.splice(sli, 1); score += 100 * scoreMult; screenShake = 6; sli--; } }
      }
      for (var sli = 0; sli < asteroids.length; sli++) {
        var sla = asteroids[sli];
        if (Math.abs(sla.x - player.x) < 25 && sla.y < player.y - 19 && sla.y > player.y - 19 - 600) { sla.hp -= 3; if (sla.hp <= 0) { onAsteroidDestroy(sla, sli); sli--; } }
      }
      if (boss && Math.abs(boss.x - player.x) < 45 && boss.y < player.y - 19 && boss.y > player.y - 19 - 600) boss.hp -= 2;
      break;
    case 'dim4':
      bullets.push({ x: player.x, y: player.y - 19, vx: 0, vy: -7, w: 4, h: 16, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: player.x, y: player.y + 25, vx: 0, vy: 7, w: 4, h: 16, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: player.x - 25, y: player.y, vx: -7, vy: 0, w: 16, h: 4, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: player.x + 25, y: player.y, vx: 7, vy: 0, w: 16, h: 4, dmg: 1, friendly: true, t: 0 });
      break;
    default:
      bullets.push({ x: player.x, y: player.y - 19, vx: 0, vy: -7, w: 4, h: 16, dmg: 1, friendly: true, t: 0 });
  }
  if (player.weapon !== 'normal') {
    var ammoCost = player.weapon === 'super' || player.weapon === 'superLaser' || player.weapon === 'supercalifragilistico' ? 3 : 1;
    weaponAmmo -= ammoCost;
  if (weaponAmmo <= 0) { player.weapon = 'normal'; player.fusion = null; weaponAmmo = 0; weaponSpan.textContent = 'Normal'; }
  }
}
function shootLaser() {
  playLaser();
  lasers.push({ x: player.x, y: player.y - 19, length: 600, timer: 0 });
  var bx = player.x, by = player.y - 19;
  for (var i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    if (Math.abs(e.x - bx) < 20 && e.y < by && e.y > by - 600) { e.hp--; if (e.hp <= 0) { addExplosion(e.x, e.y, '#f44', 16); playExplosion(); enemies.splice(i, 1); score += 100 * scoreMult; screenShake = 6; i--; } }
  }
  for (var i = 0; i < asteroids.length; i++) {
    var a = asteroids[i];
    if (Math.abs(a.x - bx) < 25 && a.y < by && a.y > by - 600) { a.hp--; if (a.hp <= 0) { onAsteroidDestroy(a, i); i--; } }
  }
  if (boss && Math.abs(boss.x - bx) < 45 && boss.y < by && boss.y > by - 600) { boss.hp -= 0.5; }
  weaponAmmo--;
  if (weaponAmmo <= 0) { player.weapon = 'normal'; weaponAmmo = 0; weaponSpan.textContent = 'Normal'; }
}
function droneShoot(drone) {
  var target = null, minD = 999;
  var a;
  if (drone.type === 'normal' || (!drone.type && drone.protect)) {
    a = -Math.PI / 2;
  } else {
    for (var i = 0; i < enemies.length; i++) { var d = dist(drone, enemies[i]); if (d < minD) { minD = d; target = enemies[i]; } }
    if (!target && boss) target = boss;
    var dx = target ? target.x - drone.x : 0;
    var dy = target ? target.y - drone.y : -1;
    a = Math.atan2(dy, dx);
  }
  if (droneFormation === 'centrifuge') { a = Math.atan2(drone.y - player.y, drone.x - player.x); }
  var spd = 5;
  var useWeapon = droneWeapon !== 'normal' ? droneWeapon : 'normal';
  if (droneFusion) {
    var disp = droneFusion.dispersion;
    var special = droneFusion.special;
    if (drone.type === 'circular') {
      var baseBullet = { x: drone.x, y: drone.y, w: 3, h: 8, dmg: 1, friendly: true, t: 0 };
      switch (special) {
        case 'ricochet': baseBullet.ricochet = true; baseBullet.bounces = 3; break;
        case 'explosive': baseBullet.dmg = 2; baseBullet.explosive = true; break;
        case 'pulse': baseBullet.w = 16; baseBullet.h = 16; baseBullet.pulse = true; break;
        case 'super': baseBullet.w = 12; baseBullet.h = 18; baseBullet.dmg = 5; baseBullet.pierce = true; break;
        case 'supercalifragilistico': baseBullet.w = 14; baseBullet.h = 22; baseBullet.dmg = 6; baseBullet.pierce = true; baseBullet.supercali = true; break;
        case 'cola': baseBullet.w = 5; baseBullet.h = 10; baseBullet.dmg = 2; baseBullet.cola = true; break;
        case 'homing': case 'feline':
          baseBullet.dmg = 2; break;
      }
      for (var cj = 0; cj < 8; cj++) {
        var ca = (cj / 8) * Math.PI * 2;
        var cb = Object.assign({}, baseBullet, { vx: Math.cos(ca) * 4, vy: Math.sin(ca) * 4 });
        bullets.push(cb);
      }
      var ammoCost = special === 'super' || special === 'supercalifragilistico' ? 3 : 1;
      droneAmmo -= ammoCost;
      if (droneAmmo <= 0) { droneWeapon = 'normal'; droneFusion = null; droneAmmo = 0; }
      return;
    }
    for (var bi = 0; bi < fb.length; bi++) {
      var b = fb[bi];
      b.friendly = true; b.t = 0;
      switch (special) {
        case 'ricochet': b.ricochet = true; b.bounces = 3; break;
        case 'explosive': b.dmg = 2; b.explosive = true; break;
        case 'pulse': b.w = 16; b.h = 16; b.pulse = true; break;
        case 'super': b.w = 12; b.h = 18; b.dmg = 5; b.pierce = true; break;
        case 'supercalifragilistico': b.w = 14; b.h = 22; b.dmg = 6; b.pierce = true; b.supercali = true; break;
        case 'cola': b.w = 5; b.h = 10; b.dmg = 2; b.cola = true; break;
        case 'homing': {
          var ht = target;
          b.homing = ht; b.dmg = 2;
          b.getTarget = function () { return this.homing && this.homing.hp > 0 ? this.homing : null; };
          break;
        }
        case 'feline': {
          var ft = target;
          b.homing = ft; b.dmg = 2;
          b.getTarget = function () { return this.homing && this.homing.hp > 0 ? this.homing : null; };
          break;
        }
      }
      bullets.push(b);
    }
    var ammoCost = special === 'super' || special === 'supercalifragilistico' ? 3 : 1;
    droneAmmo -= ammoCost;
    if (droneAmmo <= 0) { droneWeapon = 'normal'; droneFusion = null; droneAmmo = 0; }
    return;
  }
  switch (useWeapon) {
    case 'spread':
      for (var j = -1; j <= 1; j++) {
        var ang = a + j * 0.3;
        bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      }
      break;
    case 'triple':
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a - 0.2) * spd, vy: Math.sin(a - 0.2) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a + 0.2) * spd, vy: Math.sin(a + 0.2) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      break;
    case 'laser': {
      var lx = drone.x, ly = drone.y;
      var ex = lx + Math.cos(a) * 300, ey = ly + Math.sin(a) * 300;
      lasers.push({ x: lx, y: ly, x2: ex, y2: ey, timer: 0 });
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (Math.abs(e.x - lx) < 20 && ((e.y < ly && e.y > ey) || (e.y > ly && e.y < ey))) { e.hp--; if (e.hp <= 0) { addExplosion(e.x, e.y, '#f44', 16); playExplosion(); enemies.splice(i, 1); score += 100 * scoreMult; screenShake = 6; i--; } }
      }
      if (boss && Math.abs(boss.x - lx) < 45 && ((boss.y < ly && boss.y > ey) || (boss.y > ly && boss.y < ey))) boss.hp -= 0.3;
      break;
    }
    case 'homing': {
      var ht = target;
      bullets.push({
        x: drone.x, y: drone.y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, w: 5, h: 10, dmg: 2, friendly: true, t: 0, homing: ht,
        getTarget: function () { return this.homing && this.homing.hp > 0 ? this.homing : null; }
      });
      break;
    }
    case 'double':
      bullets.push({ x: drone.x - 6, y: drone.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: drone.x + 6, y: drone.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      break;
    case 'pulse':
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, w: 16, h: 16, dmg: 1, friendly: true, t: 0, pulse: true });
      break;
    case 'explosive':
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 5, h: 10, dmg: 2, friendly: true, t: 0, explosive: true });
      break;
    case 'ricochet':
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0, ricochet: true, bounces: 3 });
      break;
    case 'super':
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 12, h: 18, dmg: 5, friendly: true, t: 0, pierce: true });
      break;
    case 'supercalifragilistico':
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 14, h: 22, dmg: 6, friendly: true, t: 0, pierce: true, supercali: true });
      break;
    case 'sine':
      for (var si = -1; si <= 1; si++) bullets.push({ x: drone.x + si * 6, y: drone.y, baseX: drone.x + si * 6, vx: 0, vy: -5, w: 3, h: 8, dmg: 1, friendly: true, t: 0, sine: true });
      break;
    case 'cola':
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 5, h: 10, dmg: 2, friendly: true, t: 0, cola: true });
      break;
    case 'feline': {
      var ft2 = target;
      for (var fj = -1; fj <= 1; fj++) {
        bullets.push({
          x: drone.x, y: drone.y, vx: Math.cos(a + fj * 0.15) * 3, vy: Math.sin(a + fj * 0.15) * 3, w: 4, h: 8, dmg: 2, friendly: true, t: 0, homing: ft2,
          getTarget: function () { return this.homing && this.homing.hp > 0 ? this.homing : null; }
        });
      }
      break;
    }
    case 'chicken':
      for (var ck = 0; ck < 7; ck++) {
        var cAng = a - 0.4 + Math.random() * 0.8;
        bullets.push({ x: drone.x + rand(-6, 6), y: drone.y, vx: Math.cos(cAng) * (3 + Math.random() * 2), vy: Math.sin(cAng) * (3 + Math.random() * 2), w: 2, h: 5, dmg: 1, friendly: true, t: 0 });
      }
      break;
    case 'superLaser': {
      var slx = drone.x, sly = drone.y;
      var sex = slx + Math.cos(a) * 400, sey = sly + Math.sin(a) * 400;
      lasers.push({ x: slx, y: sly, x2: sex, y2: sey, timer: 0, super: true });
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (Math.abs(e.x - slx) < 25 && ((e.y < sly && e.y > sey) || (e.y > sly && e.y < sey))) { e.hp -= 3; if (e.hp <= 0) { addExplosion(e.x, e.y, '#f44', 16); playExplosion(); enemies.splice(i, 1); score += 100 * scoreMult; screenShake = 6; i--; } }
      }
      if (boss && Math.abs(boss.x - slx) < 45 && ((boss.y < sly && boss.y > sey) || (boss.y > sly && boss.y < sey))) boss.hp -= 2;
      break;
    }
    case 'dim4':
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a) * -spd, vy: Math.sin(a) * -spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a + 1.57) * spd, vy: Math.sin(a + 1.57) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a - 1.57) * spd, vy: Math.sin(a - 1.57) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      break;
    default:
      if (drone.type === 'circular') {
        for (var cj = 0; cj < 8; cj++) {
          var ca = (cj / 8) * Math.PI * 2;
          bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(ca) * spd, vy: Math.sin(ca) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
        }
      } else {
        bullets.push({ x: drone.x, y: drone.y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, w: 3, h: 8, dmg: 1, friendly: true, t: 0 });
      }
  }
  if (useWeapon !== 'normal') {
    var ammoCost = useWeapon === 'super' || useWeapon === 'superLaser' || useWeapon === 'supercalifragilistico' ? 3 : 1;
    droneAmmo -= ammoCost;
    if (droneAmmo <= 0) { droneWeapon = 'normal'; droneFusion = null; droneAmmo = 0; }
  }
}
function useBomb() {
  if (bombs <= 0) return;
  bombs--;
  updateBombUI();
  playShoot();
  screenShake = 5;
  for (var i = 0; i < enemyBullets.length; i++) addExplosion(enemyBullets[i].x, enemyBullets[i].y, '#0ff', 5);
  enemyBullets = [];
}
function useBombFull() {
  if (bombFull <= 0) return;
  bombFull--;
  updateBombUI();
  playBossExplosion();
  screenShake = 15;
  for (var i = 0; i < enemies.length; i++) addExplosion(enemies[i].x, enemies[i].y, '#fa0', 12);
  enemies = [];
  enemyBullets = [];
  if (boss) boss.hp -= 10;
  for (var i = 0; i < 30; i++) addExplosion(rand(0, 480), rand(0, 720), '#ff0', 1);
}
function updateBombUI() {
  if (bombs > 0) { bombCountSpan.style.display = 'inline'; bombsLeftSpan.textContent = bombs; }
  else bombCountSpan.style.display = 'none';
  if (bombFull > 0) { bombFullCountSpan.style.display = 'inline'; bombFullLeftSpan.textContent = bombFull; }
  else bombFullCountSpan.style.display = 'none';
}
function useSelfDestruct() {
  for (var i = drones.length - 1; i >= 0; i--) {
    if (!drones[i].protect) {
      var d = drones[i]; drones.splice(i, 1);
      selfDestructProjectiles.push({ x: d.x, y: d.y - 8, vx: 0, vy: -10, w: 10, h: 10, timer: 0 });
      playShoot(); break;
    }
  }
}
function doDash() {
  var level = gameData.upgrades.dash || 0;
  if (level === 0 || dashCooldownTimer > 0) return;
  var distances = [0, 80, 140, 200, 400];
  var dist = distances[level] || 0;
  var dx = playerLastDirX, dy = playerLastDirY;
  if (dx === 0 && dy === 0) dy = -1;
  if (level >= 4 && optionsData.mouseControl) {
    player.x = mouseX; player.y = mouseY;
  } else {
    player.x += dx * dist; player.y += dy * dist;
  }
  player.x = Math.max(20, Math.min(460, player.x));
  player.y = Math.max(25, Math.min(695, player.y));
  player.invincible = 20;
  dashEffectTimer = 15;
  dashFromX = player.x; dashFromY = player.y;
  var cooldownLevel = gameData.upgrades.dashCooldown || 0;
  var cooldownFrames = [300, 240, 180, 120];
  dashCooldownTimer = cooldownFrames[cooldownLevel] || 300;
  screenShake = 3;
}

// ============================================================
// HIT
// ============================================================
function hitPlayer() {
  for (var i = drones.length - 1; i >= 0; i--) {
    if (drones[i].protect) {
      addExplosion(drones[i].x, drones[i].y, '#a0f', 16); playExplosion();
      drones.splice(i, 1); return;
    }
  }
  player.hp--;
  player.invincible = 60;
  screenShake = 10;
  if (player.hp <= 0) {
    gameRunning = false;
    gameOverDiv.style.display = 'block';
    earnedPtsSpan.textContent = score;
    document.getElementById('finalScore2').textContent = gameData.points + score;
    gameData.points += score;
    if (isSpecialLevel) {
      gameData.totalPointsSpent = (gameData.totalPointsSpent || 0) + 1000;
    }
    saveData();
  }
}
function onAsteroidDestroy(a, ai) {
  addExplosion(a.x, a.y, '#fa0', 20);
  playAsteroidBreak();
  spawnPoints(a.x, a.y, 3, DIFFICULTY[difficulty].pointValue);
  if (Math.random() < 0.1) {
    var spType = Math.random() < 0.5 ? 'multPoints' : 'multFireRate';
    specialPickups.push({ x: a.x, y: a.y, w: 20, h: 20, type: spType, life: 300, vy: 0.8 });
  } else if (Math.random() < DIFFICULTY[difficulty].asteroidPowerupChance) {
    if (Math.random() < 0.3) shieldPickups.push({ x: a.x, y: a.y, w: 18, h: 18, vy: 0.8, life: 300 });
    else spawnPowerup(a.x, a.y);
  }
  if (a.size > 1) {
    for (var j = 0; j < 3; j++) asteroids.push({ x: a.x + rand(-20, 20), y: a.y + rand(-20, 20), w: a.w * 0.6, h: a.h * 0.6, size: a.size - 1, hp: a.size - 1, speed: a.speed + 1, rot: rand(0, 6.28), rotSpeed: rand(-0.08, 0.08) });
  }
  asteroids.splice(ai, 1);
  screenShake = 4;
}

// ============================================================
// LEVEL MANAGEMENT
// ============================================================
function startLevelIntro() {
  stateTimer = 90;
  if (isSpecialLevel) {
    levelIntroText = level === 3 ? 'El Espia' : 'NIVEL ' + level;
  } else {
    levelIntroText = level === 5 ? (BOSS_DATA[difficulty] ? BOSS_DATA[difficulty].name : 'JEFE FINAL') : 'NIVEL ' + level;
  }
  levelIntroDiv.textContent = levelIntroText;
  levelIntroDiv.style.display = 'block';
  gameState = 'levelIntro';
}
function nextLevel() {
  level++;
  enemiesSpawned = 0;
  enemiesKilledInLevel = 0;
  var maxLevel = isSpecialLevel ? 3 : 5;
  if (level > maxLevel) {
    level = maxLevel;
  }
  startLevelIntro();
}
function checkLevelComplete() {
  if (gameState === 'bossFight') return;
  var maxLevel = isSpecialLevel ? 3 : 5;
  var allSpawned = enemiesSpawned >= (isSpecialLevel ? SPECIAL_LEVEL_CONFIG.levelMax[level] : DIFFICULTY[difficulty].levelMax[level]);
  var allDead = enemies.length === 0;
  if (allSpawned && allDead) {
    if (level < maxLevel) {
      nextLevel();
    } else {
      gameState = 'bossFight';
      if (isSpecialLevel) {
        levelIntroText = 'El Espia';
        spawnBossEspia();
      } else {
        levelIntroText = BOSS_DATA[difficulty] ? BOSS_DATA[difficulty].name : 'JEFE FINAL';
        spawnBoss();
      }
      levelIntroDiv.textContent = levelIntroText;
      levelIntroDiv.style.display = 'block';
      stateTimer = 90;
    }
  }
}
function gameWon() {
  gameRunning = false;
  if (isSpecialLevel) {
    gameData.threatBarLocked = true;
    if (gameData.unlockedUpgrades.indexOf('supercalifragilistico') === -1) {
      gameData.unlockedUpgrades.push('supercalifragilistico');
      gameData.upgrades.supercalifragilistico = 1;
    }
    var rl = document.getElementById('rewardList'); rl.innerHTML = '';
    var rewardNames = {};
    for (var i = 0; i < SHOP_ITEMS.length; i++) rewardNames[SHOP_ITEMS[i].id] = SHOP_ITEMS[i].name;
    for (var i = 0; i < ALL_WEAPONS.length; i++) rewardNames[ALL_WEAPONS[i].id] = ALL_WEAPONS[i].name;
    var el = document.createElement('div'); el.className = 'reward-item r-new';
    var symSpan = document.createElement('span'); symSpan.className = 'r-sym';
    symSpan.textContent = '\u2605';
    symSpan.style.color = '#0f0';
    el.appendChild(symSpan);
    var nameSpan = document.createElement('span');
    nameSpan.textContent = 'Perforante';
    nameSpan.style.color = '#0f0';
    el.appendChild(nameSpan);
    rl.appendChild(el);
  } else {
    var pool = REWARD_POOLS[difficulty];
    var available = pool.pool.filter(function (id) { return gameData.unlockedUpgrades.indexOf(id) === -1; });
    var rewards = [];
    for (var ri = 0; ri < pool.count && available.length > 0; ri++) {
      var pick = available.splice(Math.floor(Math.random() * available.length), 1)[0];
      rewards.push(pick);
      gameData.unlockedUpgrades.push(pick);
    }
    var rl = document.getElementById('rewardList'); rl.innerHTML = '';
    if (rewards.length > 0) {
      var rewardNames = {};
      for (var i = 0; i < SHOP_ITEMS.length; i++) rewardNames[SHOP_ITEMS[i].id] = SHOP_ITEMS[i].name;
      for (var i = 0; i < ALL_WEAPONS.length; i++) rewardNames[ALL_WEAPONS[i].id] = ALL_WEAPONS[i].name;
      for (var i = 0; i < rewards.length; i++) {
        var el = document.createElement('div'); el.className = 'reward-item r-new';
        var sym = ITEM_SYMBOLS[rewards[i]] || '';
        var symSpan = document.createElement('span'); symSpan.className = 'r-sym';
        symSpan.textContent = sym || ' ';
        symSpan.style.color = WEAPON_GLOW[rewards[i]] || TAB_COLORS[1];
        el.appendChild(symSpan);
        var nameSpan = document.createElement('span');
        nameSpan.textContent = rewardNames[rewards[i]] || rewards[i];
        nameSpan.style.color = WEAPON_GLOW[rewards[i]] || '#0f0';
        el.appendChild(nameSpan);
        rl.appendChild(el);
      }
    } else {
      var el = document.createElement('div'); el.className = 'reward-item'; el.textContent = '(sin recompensas disponibles)'; rl.appendChild(el);
    }
    if (difficulty === 'easy' && gameData.beatenDifficulty.indexOf('easy') === -1) { gameData.beatenDifficulty.push('easy'); }
    if (difficulty === 'normal' && gameData.beatenDifficulty.indexOf('normal') === -1) { gameData.beatenDifficulty.push('normal'); }
  }
  document.getElementById('rewardScreen').style.display = 'flex';
  document.getElementById('finalScore').textContent = score;
  gameData.points += score;
  saveData();
  levelIntroDiv.style.display = 'none';
}

// ============================================================
// UPDATE
// ============================================================
function update() {
  if (!gameRunning) return;
  if (paused) return;
  frame++;

  // Stars
  for (var i = 0; i < stars.length; i++) { stars[i].y += stars[i].speed; if (stars[i].y > 720) { stars[i].y = 0; stars[i].x = Math.random() * 480; } }

  // Level intro countdown
  if (gameState === 'levelIntro') {
    stateTimer--;
    if (stateTimer <= 0) {
      levelIntroDiv.style.display = 'none';
      if (level === 5 && enemiesSpawned >= DIFFICULTY[difficulty].levelMax[5] && boss) gameState = 'bossFight';
      else gameState = 'playing';
    }
  }

  // Player movement
  if (optionsData.mouseControl) {
    var dx = mouseX - player.x, dy = mouseY - player.y;
    var d2 = Math.sqrt(dx * dx + dy * dy);
    if (d2 > 5) { player.x += (dx / d2) * player.speed; player.y += (dy / d2) * player.speed; playerLastDirX = dx / d2; playerLastDirY = dy / d2; }
  } else {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) { player.x -= player.speed; playerLastDirX = -1; playerLastDirY = 0; }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) { player.x += player.speed; playerLastDirX = 1; playerLastDirY = 0; }
    if (keys['ArrowUp'] || keys['w'] || keys['W']) { player.y -= player.speed; playerLastDirX = 0; playerLastDirY = -1; }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) { player.y += player.speed; playerLastDirX = 0; playerLastDirY = 1; }
  }
  player.x = Math.max(20, Math.min(460, player.x));
  player.y = Math.max(25, Math.min(695, player.y));
  if (player.invincible > 0) player.invincible--;
  if (dashCooldownTimer > 0) dashCooldownTimer--;
  if (dashEffectTimer > 0) dashEffectTimer--;

  // Shooting
  var autoFire = gameData.upgrades.autofire > 0;
  if ((keys[' '] || keys['Space']) || autoFire) {
    var now = Date.now();
    var fireInterval = baseFireRate / fireRateMult;
    if (player.weapon === 'laser' && !player.fusion) {
      if (now - lastPlayerShot > fireInterval) { shootLaser(); lastPlayerShot = now; }
    } else {
      if (now - lastPlayerShot > fireInterval) { shoot(); lastPlayerShot = now; }
    }
  }

  // Q: assign weapon from queue to player
  if (keys['q'] || keys['Q']) {
    keys['q'] = false; keys['Q'] = false;
    if (weaponQueue.length > 0) {
      var qWeapon = weaponQueue.shift();
      var isDisp = DISPERSION_WEAPONS.indexOf(qWeapon) !== -1;
      var isSpec = SPECIAL_LASER_WEAPONS.indexOf(qWeapon) !== -1;
      var curDisp = DISPERSION_WEAPONS.indexOf(player.weapon) !== -1;
      var curSpec = SPECIAL_LASER_WEAPONS.indexOf(player.weapon) !== -1;
      var canFusion = (gameData.upgrades.weaponFusion || 0) > 0;
      if (canFusion && player.fusion) {
        player.fusion = null;
        player.weapon = qWeapon;
      } else if (canFusion && ((curDisp && isSpec) || (curSpec && isDisp))) {
        if (curDisp) player.fusion = { dispersion: player.weapon, special: qWeapon };
        else player.fusion = { dispersion: qWeapon, special: player.weapon };
        player.weapon = player.fusion.special;
      } else {
        player.weapon = qWeapon;
      }
      weaponAmmo = maxShipAmmo();
      var wnames = { spread: 'Abanico', triple: 'Triple', laser: 'Laser', homing: 'Homing', double: 'Doble', pulse: 'Pulso', explosive: 'Explosiva', ricochet: 'Rebote', super: 'Plasma', sine: 'Seno', cola: 'Cola', feline: 'Felino', chicken: 'Pollo', superLaser: 'SLaser', dim4: '4D', supercalifragilistico: 'Perfo', normal: 'Normal' };
      if (player.fusion) weaponSpan.textContent = (wnames[player.fusion.special] || player.fusion.special) + '+' + (wnames[player.fusion.dispersion] || player.fusion.dispersion);
      else weaponSpan.textContent = wnames[player.weapon] || player.weapon;
      playClick();
    }
  }
  // E: assign weapon from queue to drones
  if (keys['e'] || keys['E']) {
    keys['e'] = false; keys['E'] = false;
    if (weaponQueue.length > 0) {
      var hasDroneFusion = (gameData.upgrades.droneFusion || 0) > 0;
      if (hasDroneFusion && player.fusion) {
        droneFusion = { dispersion: player.fusion.dispersion, special: player.fusion.special };
        droneWeapon = player.fusion.special;
        weaponQueue.shift();
      } else {
        droneWeapon = weaponQueue.shift();
        droneFusion = null;
      }
      droneAmmo = maxDroneAmmo();
      playClick();
    }
  }
  // Z: cycle drone formation
  if (keys['z'] || keys['Z']) {
    keys['z'] = false; keys['Z'] = false;
    var avail = ['line'];
    if (gameData.upgrades.formationCircle) avail.push('circle');
    if (gameData.upgrades.formationTriangle) avail.push('triangle');
    if (gameData.upgrades.formationCentrifuge) avail.push('centrifuge');
    var idx = avail.indexOf(droneFormation);
    droneFormation = avail[(idx + 1) % avail.length];
    playClick();
  }

  // Auto-equip nave
  var aeLevel = gameData.upgrades.autoEquip || 0;
  if (aeLevel > 0 && player.weapon === 'normal' && weaponQueue.length > 0) {
    var aeReady = false;
    if (aeLevel >= 3) { aeReady = true; autoEquipTimer = 0; }
    else {
      autoEquipTimer++;
      var aeCd = aeLevel === 1 ? 300 : 180;
      if (autoEquipTimer >= aeCd) { aeReady = true; autoEquipTimer = 0; }
    }
    if (aeReady) {
      var qw = weaponQueue.shift();
      player.weapon = qw; player.fusion = null; weaponAmmo = maxShipAmmo();
      var wnames = { spread:'Abanico',triple:'Triple',laser:'Laser',homing:'Homing',double:'Doble',pulse:'Pulso',explosive:'Explosiva',ricochet:'Rebote',super:'Plasma',sine:'Seno',cola:'Cola',feline:'Felino',chicken:'Pollo',superLaser:'SLaser',dim4:'4D',supercalifragilistico:'Perfo',normal:'Normal' };
          weaponSpan.textContent = wnames[player.weapon] || player.weapon;
          playClick();
        }
      } else {
        autoEquipTimer = 0;
      }

      // Auto-equip dron
  var daeLevel = gameData.upgrades.droneAutoEquip || 0;
  if (daeLevel > 0 && droneWeapon === 'normal' && weaponQueue.length > 0) {
    var daeReady = false;
    if (daeLevel >= 3) { daeReady = true; droneAutoEquipTimer = 0; }
    else {
      droneAutoEquipTimer++;
      var daeCd = daeLevel === 1 ? 300 : 180;
      if (droneAutoEquipTimer >= daeCd) { daeReady = true; droneAutoEquipTimer = 0; }
    }
    if (daeReady) {
      var dqw = weaponQueue.shift();
          droneWeapon = dqw; droneFusion = null; droneAmmo = maxDroneAmmo();
      var wnames = { spread:'Abanico',triple:'Triple',laser:'Laser',homing:'Homing',double:'Doble',pulse:'Pulso',explosive:'Explosiva',ricochet:'Rebote',super:'Plasma',sine:'Seno',cola:'Cola',feline:'Felino',chicken:'Pollo',superLaser:'SLaser',dim4:'4D',supercalifragilistico:'Perfo',normal:'Normal' };
          playClick();
    }
  } else {
    droneAutoEquipTimer = 0;
  }

  // Bullets
  for (i = 0; i < bullets.length; i++) {
    var b = bullets[i];
    if (b.homing) {
      var t = b.homing;
      if (!t || t.hp <= 0) {
        t = null;
        var md = 999;
        for (var j = 0; j < enemies.length; j++) { var d = dist(b, enemies[j]); if (d < md) { md = d; t = enemies[j]; } }
        if (!t && boss && boss.hp > 0) t = boss;
        b.homing = t;
      }
      if (t) {
        var a = Math.atan2(t.y - b.y, t.x - b.x);
        var ca = Math.atan2(b.vy, b.vx);
        var diff = a - ca;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        ca += Math.sign(diff) * 0.06;
        var sp = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        b.vx = Math.cos(ca) * sp;
        b.vy = Math.sin(ca) * sp;
      }
    }
    if (b.sine) {
      b.x = (b.baseX || b.x) + Math.sin(b.t * 0.12) * 35;
    }
    b.x += b.vx; b.y += b.vy; b.t++;
    if ((b.pierce || b.supercali) && b.t % 2 === 0) {
      var tc = b.supercali ? '#0f0' : '#f0f';
      trails.push({ x: b.x, y: b.y, life: 8, maxLife: 8, size: 3 + b.t % 3, color: tc, vx: 0, vy: 0 });
    }
  }
  bullets = bullets.filter(function (b) { return b.y > -20 && b.y < 740 && b.x > -20 && b.x < 500; });

  // Lasers
  for (i = 0; i < lasers.length; i++) {
    var lz = lasers[i];
    lz.timer++;
    if (lz.super) {
      var lx = lz.x, ly = lz.y;
      var lex = lz.x2 || lx, ley = lz.y2 || (ly - lz.length);
      for (var sli = 0; sli < enemies.length; sli++) {
        var sle = enemies[sli];
        var onBeam = (sle.x > Math.min(lx, lex) - 25 && sle.x < Math.max(lx, lex) + 25 && sle.y > Math.min(ly, ley) && sle.y < Math.max(ly, ley));
        if (onBeam) { sle.hp -= 0.5; if (sle.hp <= 0) { addExplosion(sle.x, sle.y, '#f44', 16); playExplosion(); spawnPoints(sle.x, sle.y, 4, DIFFICULTY[difficulty].enemyPointValue); if (Math.random() < DIFFICULTY[difficulty].enemyPowerupChance) spawnPowerup(sle.x, sle.y); enemies.splice(sli, 1); score += 100 * scoreMult; screenShake = 6; sli--; } }
      }
      for (var sla = 0; sla < asteroids.length; sla++) {
        var asla = asteroids[sla];
        if (asla.x > Math.min(lx, lex) - 25 && asla.x < Math.max(lx, lex) + 25 && asla.y > Math.min(ly, ley) && asla.y < Math.max(ly, ley)) { asla.hp -= 0.5; if (asla.hp <= 0) { onAsteroidDestroy(asla, sla); sla--; } }
      }
      if (boss && boss.x > Math.min(lx, lex) - 45 && boss.x < Math.max(lx, lex) + 45 && boss.y > Math.min(ly, ley) && boss.y < Math.max(ly, ley)) boss.hp -= 0.5;
    }
  }
  lasers = lasers.filter(function (l) { return l.timer < (l.super ? 30 : 8); });

      // Pulse bullets destroy enemy bullets in radius (except supercali)
      for (i = 0; i < bullets.length; i++) {
        var bp = bullets[i];
        if (!bp.friendly || !bp.pulse) continue;
        for (var ebi = enemyBullets.length - 1; ebi >= 0; ebi--) {
          var eb = enemyBullets[ebi];
          if (eb.supercali) continue;
          var dx = bp.x - eb.x, dy = bp.y - eb.y;
          if (Math.sqrt(dx * dx + dy * dy) < 40) enemyBullets.splice(ebi, 1);
        }
      }

  // Enemies
  if (gameState === 'playing') {
    if (frame % Math.max(30, 60 - level * 5) === 0) spawnEnemy();
  }
  for (i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    e.y += e.speed;
    e.shootTimer++;
    if (e.bossMinion) {
      if (e.type === 'circular' && e.shootTimer >= 60) {
        var n = 8;
        for (var j = 0; j < n; j++) {
          var a = (j / n) * Math.PI * 2;
          enemyBullets.push({ x: e.x, y: e.y + 18, vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5, w: 6, h: 6 });
        }
        e.shootTimer = 0;
      } else if (e.type === 'straight' && e.shootTimer >= 40) {
        var dx = player.x - e.x, dy = player.y - e.y, a = Math.atan2(dy, dx);
        enemyBullets.push({ x: e.x, y: e.y + 18, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, w: 6, h: 6 });
        e.shootTimer = 0;
      }
    } else if (e.shootTimer >= Math.max(30, 60 - level * 3)) {
      if (e.type === 0) {
        enemyBullets.push({ x: e.x, y: e.y + 18, vx: 0, vy: 3, w: 6, h: 6 });
      } else if (e.type === 1) {
        var dx = player.x - e.x, dy = player.y - e.y, a = Math.atan2(dy, dx);
        enemyBullets.push({ x: e.x, y: e.y + 18, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, w: 6, h: 6 });
      } else if (e.type === 2) {
        var n = 6 + Math.floor(level / 2);
        for (var j = 0; j < n; j++) {
          var a = (j / n) * Math.PI * 2;
          enemyBullets.push({ x: e.x, y: e.y + 18, vx: Math.cos(a) * 2.5, vy: Math.sin(a) * 2.5, w: 6, h: 6 });
        }
      } else if (e.type === 3) {
        var n = 4 + Math.floor(level / 2);
        for (var j = 0; j < n; j++) {
          var a = (j / n) * Math.PI * 2 + 0.3;
          var dx2 = player.x - e.x, dy2 = player.y - e.y, a2 = Math.atan2(dy2, dx2);
          var spreadA = a2 + (j / n - 0.5) * 0.8;
          enemyBullets.push({ x: e.x, y: e.y + 18, vx: Math.cos(spreadA) * 2.5, vy: Math.sin(spreadA) * 2.5, w: 6, h: 6 });
        }
      }
      e.shootTimer = 0;
    }
  }
  enemies = enemies.filter(function (e) { return e.y < 760; });

  // Enemy bullets
  for (i = 0; i < enemyBullets.length; i++) {
    var eb = enemyBullets[i];
    if (eb.homing) {
      var dx = player.x - eb.x, dy = player.y - eb.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d > 1) { eb.vx += dx / d * 0.05; eb.vy += dy / d * 0.05; }
      var spd = Math.sqrt(eb.vx * eb.vx + eb.vy * eb.vy);
      if (spd > 3) { eb.vx = eb.vx / spd * 3; eb.vy = eb.vy / spd * 3; }
    }
    eb.x += eb.vx; eb.y += eb.vy;
  }
  enemyBullets = enemyBullets.filter(function (b) { return b.y > -20 && b.y < 740 && b.x > -20 && b.x < 500; });

      // Asteroids
      if (isSpecialLevel) {
        if (frame % 15 === 0) spawnAsteroid();
      } else if (frame % (difficulty === 'hard' ? 270 : 90) === 0) spawnAsteroid();
  for (i = 0; i < asteroids.length; i++) { asteroids[i].y += asteroids[i].speed; asteroids[i].rot += asteroids[i].rotSpeed; }
  asteroids = asteroids.filter(function (a) { return a.y < 770; });

  // Powerups
  for (i = 0; i < powerups.length; i++) powerups[i].y += powerups[i].speed;
  powerups = powerups.filter(function (p) { return p.y < 750; });

  // Points
  for (i = 0; i < points.length; i++) { points[i].x += points[i].vx; points[i].y += points[i].vy; points[i].life--; }
  points = points.filter(function (p) { return p.y < 750 && p.life > 0; });

  // Hearts
  for (i = 0; i < hearts.length; i++) { hearts[i].y += hearts[i].vy; hearts[i].life--; }
  hearts = hearts.filter(function (h) { return h.y < 750 && h.life > 0; });

  // Shield pickups
  for (i = 0; i < shieldPickups.length; i++) { shieldPickups[i].y += shieldPickups[i].vy; shieldPickups[i].life--; }
  shieldPickups = shieldPickups.filter(function (s) { return s.y < 750 && s.life > 0; });

  // Special pickups
  for (i = 0; i < specialPickups.length; i++) { specialPickups[i].y += specialPickups[i].vy; specialPickups[i].life--; }
  specialPickups = specialPickups.filter(function (s) { return s.y < 750 && s.life > 0; });

  // Magnet attraction
  var magnetLevel = gameData.upgrades.magnet || 0;
  if (magnetLevel > 0) {
    var magnetRange = magnetLevel * 15;
    var magnetSpeed = 2 + magnetLevel * 0.4;
    for (var mi = 0; mi < points.length; mi++) {
      var obj = points[mi];
      var dx = player.x - obj.x, dy = player.y - obj.y;
      var d = Math.sqrt(dx * dx + dy * dy);
      if (d < magnetRange && d > 1) {
        var f = magnetSpeed / d;
        obj.x += dx * f; obj.y += dy * f;
      }
    }
    for (mi = 0; mi < powerups.length; mi++) {
      obj = powerups[mi];
      dx = player.x - obj.x; dy = player.y - obj.y;
      d = Math.sqrt(dx * dx + dy * dy);
      if (d < magnetRange && d > 1) {
        f = magnetSpeed / d;
        obj.x += dx * f; obj.y += dy * f;
      }
    }
    for (mi = 0; mi < hearts.length; mi++) {
      obj = hearts[mi];
      dx = player.x - obj.x; dy = player.y - obj.y;
      d = Math.sqrt(dx * dx + dy * dy);
      if (d < magnetRange && d > 1) {
        f = magnetSpeed / d;
        obj.x += dx * f; obj.y += dy * f;
      }
    }
    for (mi = 0; mi < shieldPickups.length; mi++) {
      obj = shieldPickups[mi];
      dx = player.x - obj.x; dy = player.y - obj.y;
      d = Math.sqrt(dx * dx + dy * dy);
      if (d < magnetRange && d > 1) {
        f = magnetSpeed / d;
        obj.x += dx * f; obj.y += dy * f;
      }
    }
    for (mi = 0; mi < specialPickups.length; mi++) {
      obj = specialPickups[mi];
      dx = player.x - obj.x; dy = player.y - obj.y;
      d = Math.sqrt(dx * dx + dy * dy);
      if (d < magnetRange && d > 1) {
        f = magnetSpeed / d;
        obj.x += dx * f; obj.y += dy * f;
      }
    }
  }

  // Multiplier timers
  if (scoreMultTimer > 0) { scoreMultTimer--; if (scoreMultTimer <= 0) scoreMult = 1; }
  if (fireRateMultTimer > 0) { fireRateMultTimer--; if (fireRateMultTimer <= 0) fireRateMult = 1; }

  // Explosions
  for (i = 0; i < explosions.length; i++) {
    var ex = explosions[i]; ex.x += ex.vx; ex.y += ex.vy; ex.vx *= 0.95; ex.vy *= 0.95; ex.life--;
  }
  explosions = explosions.filter(function (ex) { return ex.life > 0; });
  // Trails
  for (i = 0; i < trails.length; i++) {
    trails[i].life--;
  }
  trails = trails.filter(function (tr) { return tr.life > 0; });

  // Drones
  for (i = 0; i < drones.length; i++) {
    var d = drones[i];
    var t = drones.length;
    var pos = i;
    if (droneFormation === 'circle' || droneFormation === 'centrifuge') {
      d.angle += 0.03;
      var ox = Math.cos(d.angle) * d.dist;
      var oy = Math.sin(d.angle) * d.dist;
      d.x = player.x + ox; d.y = player.y + oy;
    } else if (droneFormation === 'triangle') {
      var spacing = 30;
      var rows = Math.ceil(Math.sqrt(t));
      var col = pos % rows;
      var row = Math.floor(pos / rows);
      var ox = (col - (rows - 1) / 2) * spacing;
      var oy = -(row * spacing + 20);
      d.x = player.x + ox; d.y = player.y + oy;
    } else if (droneFormation === 'line') {
      var spacing = 35;
      var ox = (pos - (t - 1) / 2) * spacing;
      d.x = player.x + ox; d.y = player.y - 10;
    }
    d.shootTimer++;
    if (d.shootTimer >= 30 && !d.protect) { droneShoot(d); d.shootTimer = 0; }
  }

  // Self-destruct projectiles
  for (i = 0; i < selfDestructProjectiles.length; i++) {
    var sd = selfDestructProjectiles[i];
    sd.x += sd.vx; sd.y += sd.vy; sd.timer++;
    var sdHit = false;
    for (var sei = enemies.length - 1; sei >= 0; sei--) {
      if (collide(sd, enemies[sei])) { sdHit = true; break; }
    }
    if (sdHit || sd.y < -60) {
      var cx = sd.x, cy = sd.y;
      for (var sei = enemies.length - 1; sei >= 0; sei--) {
        var se = enemies[sei];
        if (dist(sd, se) < 100) {
          addExplosion(se.x, se.y, '#f80', 20); playExplosion();
          spawnPoints(se.x, se.y, 6, DIFFICULTY[difficulty].enemyPointValue);
          if (Math.random() < DIFFICULTY[difficulty].enemyPowerupChance) spawnPowerup(se.x, se.y);
          enemies.splice(sei, 1); screenShake = 8;
        }
      }
      for (var sai = asteroids.length - 1; sai >= 0; sai--) {
        if (dist(sd, asteroids[sai]) < 100) {
          onAsteroidDestroy(asteroids[sai], sai); sai--;
        }
      }
      if (boss && dist(sd, boss) < 120) boss.hp -= 5;
      for (var ebi = enemyBullets.length - 1; ebi >= 0; ebi--) {
        if (dist(sd, enemyBullets[ebi]) < 100) enemyBullets.splice(ebi, 1);
      }
      addExplosion(cx, cy, '#ff0', 40);
      screenShake = 20; playBossExplosion();
      selfDestructProjectiles.splice(i, 1); i--;
    }
  }

      // Boss
      if (gameState === 'bossFight' && boss) {
        if (isSpecialLevel) updateBossEspia();
        else updateBoss();
      }

  // Drones -> Enemies
  for (var di = drones.length - 1; di >= 0; di--) {
    var dr = drones[di];
    if (dr.protect) continue;
    for (var ei = enemies.length - 1; ei >= 0; ei--) {
      if (collide(dr, enemies[ei])) {
        dr.hp--;
        if (dr.hp <= 0) {
          var ec = enemies[ei].type === 1 || enemies[ei].type === 3 ? '#f84' : '#f44';
          addExplosion(dr.x, dr.y, '#0af', 12);
          drones.splice(di, 1);
        }
        break;
      }
    }
  }

  // ---- COLLISIONS ----
  // Player bullets -> Enemies
  for (var bi = bullets.length - 1; bi >= 0; bi--) {
    var b = bullets[bi];
    if (!b.friendly) continue;
    for (var ei = enemies.length - 1; ei >= 0; ei--) {
      if (collide(b, enemies[ei])) {
        var shouldSplice = !b.pierce;
        if (b.ricochet && b.bounces > 0) {
          var nextTarget = null, minD2 = 999;
          for (var ri = 0; ri < enemies.length; ri++) {
            if (ri === ei) continue;
            var d2 = dist(b, enemies[ri]);
            if (d2 < minD2) { minD2 = d2; nextTarget = enemies[ri]; }
          }
          if (nextTarget) {
            var dx = nextTarget.x - b.x, dy = nextTarget.y - b.y;
            var ang = Math.atan2(dy, dx);
            var spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            b.vx = Math.cos(ang) * spd; b.vy = Math.sin(ang) * spd;
            b.bounces--;
            shouldSplice = false;
          }
        }
        if (b.explosive) {
          var nExp = 8;
          for (var ej = 0; ej < nExp; ej++) {
            var aj = (ej / nExp) * Math.PI * 2;
            bullets.push({ x: b.x, y: b.y, vx: Math.cos(aj) * 4, vy: Math.sin(aj) * 4, w: 3, h: 6, dmg: 1, friendly: true, t: 0 });
          }
        }
        if (b.cola) {
          bullets.push({ x: b.x, y: b.y, vx: -3, vy: 0, w: 4, h: 4, dmg: 1, friendly: true, t: 0, colaShard: true });
          bullets.push({ x: b.x, y: b.y, vx: 3, vy: 0, w: 4, h: 4, dmg: 1, friendly: true, t: 0, colaShard: true });
          bullets.push({ x: b.x, y: b.y, vx: 0, vy: -3, w: 4, h: 4, dmg: 1, friendly: true, t: 0, colaShard: true });
          bullets.push({ x: b.x, y: b.y, vx: 0, vy: 3, w: 4, h: 4, dmg: 1, friendly: true, t: 0, colaShard: true });
        }
        if (shouldSplice) { bullets.splice(bi, 1); }
        enemies[ei].hp -= b.dmg;
        if (enemies[ei].hp <= 0) {
          var eColor = enemies[ei].type === 1 || enemies[ei].type === 3 ? '#f84' : '#f44';
          addExplosion(enemies[ei].x, enemies[ei].y, eColor, 16);
          playExplosion();
          spawnPoints(enemies[ei].x, enemies[ei].y, 4, DIFFICULTY[difficulty].enemyPointValue);
          if (Math.random() < DIFFICULTY[difficulty].enemyPowerupChance) spawnPowerup(enemies[ei].x, enemies[ei].y);
          if (Math.random() < 0.25) hearts.push({ x: enemies[ei].x, y: enemies[ei].y, w: 16, h: 16, vy: 0.8, life: 300 });
          enemies.splice(ei, 1);
          screenShake = 6;
        }
        break;
      }
    }
  }

  // Player bullets -> Asteroids
  for (bi = bullets.length - 1; bi >= 0; bi--) {
    b = bullets[bi];
    if (!b.friendly) continue;
    for (var ai = asteroids.length - 1; ai >= 0; ai--) {
      if (collide(b, asteroids[ai])) {
        var shouldSplice = !b.pierce;
        if (b.ricochet && b.bounces > 0) {
          var nextTarget = null, minD2 = 999;
          for (var ri = 0; ri < enemies.length; ri++) {
            var d2 = dist(b, enemies[ri]);
            if (d2 < minD2) { minD2 = d2; nextTarget = enemies[ri]; }
          }
          if (nextTarget) {
            var dx = nextTarget.x - b.x, dy = nextTarget.y - b.y;
            var ang = Math.atan2(dy, dx);
            var spd = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            b.vx = Math.cos(ang) * spd; b.vy = Math.sin(ang) * spd;
            b.bounces--;
            shouldSplice = false;
          }
        }
        if (b.explosive) {
          var nExp = 8;
          for (var ej = 0; ej < nExp; ej++) {
            var aj = (ej / nExp) * Math.PI * 2;
            bullets.push({ x: b.x, y: b.y, vx: Math.cos(aj) * 4, vy: Math.sin(aj) * 4, w: 3, h: 6, dmg: 1, friendly: true, t: 0 });
          }
        }
        if (b.cola) {
          bullets.push({ x: b.x, y: b.y, vx: -3, vy: 0, w: 4, h: 4, dmg: 1, friendly: true, t: 0, colaShard: true });
          bullets.push({ x: b.x, y: b.y, vx: 3, vy: 0, w: 4, h: 4, dmg: 1, friendly: true, t: 0, colaShard: true });
          bullets.push({ x: b.x, y: b.y, vx: 0, vy: -3, w: 4, h: 4, dmg: 1, friendly: true, t: 0, colaShard: true });
          bullets.push({ x: b.x, y: b.y, vx: 0, vy: 3, w: 4, h: 4, dmg: 1, friendly: true, t: 0, colaShard: true });
        }
        if (shouldSplice) { bullets.splice(bi, 1); }
        asteroids[ai].hp -= b.dmg;
        if (asteroids[ai].hp <= 0) { onAsteroidDestroy(asteroids[ai], ai); }
        break;
      }
    }
  }

  // Player bullets -> Boss
  if (boss) {
    for (bi = bullets.length - 1; bi >= 0; bi--) {
      b = bullets[bi];
      if (!b.friendly) continue;
      if (collide(b, boss)) {
        if (!b.pierce) { bullets.splice(bi, 1); }
        boss.hp -= b.dmg;
        break;
      }
    }
  }
  // Player -> Enemies
  for (ei = enemies.length - 1; ei >= 0; ei--) {
    if (player.invincible > 0) break;
    if (collide(player, enemies[ei])) { var ec = enemies[ei].type === 1 || enemies[ei].type === 3 ? '#f84' : '#f44'; addExplosion(enemies[ei].x, enemies[ei].y, ec, 12); enemies.splice(ei, 1); hitPlayer(); break; }
  }
  // Player -> Asteroids
  for (ai = asteroids.length - 1; ai >= 0; ai--) {
    if (player.invincible > 0) break;
    if (collide(player, asteroids[ai])) { addExplosion(asteroids[ai].x, asteroids[ai].y, '#fa0', 15); asteroids.splice(ai, 1); hitPlayer(); break; }
  }
  // Player -> Enemy bullets
  for (ebi = enemyBullets.length - 1; ebi >= 0; ebi--) {
    if (player.invincible > 0) break;
    if (collide(player, enemyBullets[ebi])) { enemyBullets.splice(ebi, 1); hitPlayer(); break; }
  }
  // Player -> Boss
  if (boss && player.invincible <= 0 && collide(player, boss)) { hitPlayer(); }

  // Player -> Powerups
  for (var pi = powerups.length - 1; pi >= 0; pi--) {
    if (collide(player, powerups[pi])) {
      if (weaponQueue.length < POINTS_QUEUE_MAX) {
        weaponQueue.push(powerups[pi].type);
        playPowerup();
      }
      powerups.splice(pi, 1);
    }
  }

  // Player -> Points
  for (var ppi = points.length - 1; ppi >= 0; ppi--) {
    if (collide(player, points[ppi])) {
      score += points[ppi].value * scoreMult;
      points.splice(ppi, 1);
    }
  }

  // Player -> Hearts
  var heartLevel = gameData.upgrades.heart || 0;
  var healAmount = 1 + heartLevel;
  for (var hi = hearts.length - 1; hi >= 0; hi--) {
    if (collide(player, hearts[hi])) {
      player.hp = Math.min(player.maxHp, player.hp + healAmount);
      playPowerup();
      hearts.splice(hi, 1);
    }
  }

  // Player -> Shield pickups
  for (var shi = shieldPickups.length - 1; shi >= 0; shi--) {
    if (collide(player, shieldPickups[shi])) {
      player.hasShield = true;
      player.invincible = 90;
      playPowerup();
      shieldPickups.splice(shi, 1);
    }
  }

  // Player -> Special pickups
  for (var spi = specialPickups.length - 1; spi >= 0; spi--) {
    if (collide(player, specialPickups[spi])) {
      var sp = specialPickups[spi];
      var baseDur = 300 + (gameData.upgrades.eficienciaMult || 0) * 60;
      var inflacionLevel = gameData.upgrades.inflacion || 0;
      var sobrecargaLevel = gameData.upgrades.sobrecarga || 0;
      if (sp.type === 'multPoints') {
        if (scoreMult < 2) scoreMult = 2;
        scoreMultTimer = baseDur;
      } else if (sp.type === 'multFireRate') {
        if (sobrecargaLevel > 0) {
          fireRateMult = Math.min(fireRateMult + 1, 1 + sobrecargaLevel);
        } else {
          fireRateMult = 2;
        }
        fireRateMultTimer = baseDur;
      }
      if (inflacionLevel > 0) {
        scoreMult = Math.min(scoreMult + 1, 2 + inflacionLevel);
        if (scoreMultTimer <= 0) scoreMultTimer = baseDur;
      }
      playPowerup();
      specialPickups.splice(spi, 1);
    }
  }

  // Check level complete
  if (gameState === 'playing') checkLevelComplete();

  // UI
  scoreSpan.textContent = score;
  levelNumSpan.textContent = level;
}
