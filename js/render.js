// ============================================================
// DRAW
// ============================================================
function weaponLabel(w) { var n = { spread: 'Ab', triple: 'Tr', laser: 'La', homing: 'Ho', double: 'Db', pulse: 'Pu', explosive: 'Ex', ricochet: 'Re', super: 'Pl', sine: 'Si', cola: 'Co', feline: 'Fe', chicken: 'Ch', superLaser: 'SL', dim4: '4D', supercalifragilistico: 'Pe', normal: 'Nor' }; return n[w] || w; }

function drawBoss() {
  if (!boss) return;
  var bd = isSpecialLevel ? BOSS_DATA_ESPIA : (BOSS_DATA[difficulty] || BOSS_DATA.easy);
  ctx.save();
  ctx.translate(boss.x, boss.y);
  ctx.fillStyle = bd.bodyColor;
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.lineTo(-35, -10);
  ctx.lineTo(-40, 20);
  ctx.lineTo(-20, 30);
  ctx.lineTo(20, 30);
  ctx.lineTo(40, 20);
  ctx.lineTo(35, -10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = bd.strokeColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = bd.cockpitColor;
  ctx.beginPath();
  ctx.ellipse(0, -5, 12, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = bd.wingColor;
  ctx.fillRect(-45, 5, 10, 18);
  ctx.fillRect(35, 5, 10, 18);
  var g = ctx.createRadialGradient(0, 32, 0, 0, 32, 15);
  g.addColorStop(0, 'rgba(' + bd.engineGradient + ',0.8)');
  g.addColorStop(1, 'rgba(' + bd.engineGradient + ',0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 35, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function draw() {
  var c = ctx;
  c.save();
  if (screenShake > 0) { c.translate(rand(-3, 3), rand(-3, 3)); screenShake--; }

  var pb = (level - 1) / 4;
  function lerpCol(a, b, t) {
    var ah = parseInt(a.slice(1), 16), bh = parseInt(b.slice(1), 16);
    var ar = (ah >> 16) & 255, ag = (ah >> 8) & 255, ab = ah & 255;
    var br = (bh >> 16) & 255, bg = (bh >> 8) & 255, bb = bh & 255;
    var rr = Math.round(ar + (br - ar) * t), rg = Math.round(ag + (bg - ag) * t), rb = Math.round(ab + (bb - ab) * t);
    return 'rgb(' + rr + ',' + rg + ',' + rb + ')';
  }
  var bgColor;
  if (isSpecialLevel) {
    bgColor = '#020010';
  } else switch (difficulty) {
    case 'easy': bgColor = lerpCol('#0a0a1a', '#1a3a5a', pb); break;
    case 'normal': bgColor = lerpCol('#0a050a', '#3a1a0a', pb); break;
    case 'hard': bgColor = lerpCol('#0a0500', '#2a1505', pb); break;
    default: bgColor = '#0a0a1a';
  }
  c.fillStyle = bgColor; c.fillRect(0, 0, 480, 720);

  if (isSpecialLevel) {
    var deepGrd = c.createRadialGradient(240, 360, 0, 240, 360, 300);
    deepGrd.addColorStop(0, 'rgba(20,0,60,0.3)');
    deepGrd.addColorStop(0.5, 'rgba(0,20,40,0.2)');
    deepGrd.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = deepGrd; c.fillRect(0, 0, 480, 720);
    var bandAlpha2 = 0.08;
    for (var bi = 0; bi < 5; bi++) {
      c.fillStyle = 'rgba(0,255,100,' + (bandAlpha2 * 0.5) + ')';
      c.fillRect(0, (bi * 150 + frame * 0.1) % 720, 480, 2);
    }
  }

  if (pb > 0) {
    var grd = c.createLinearGradient(0, 720, 0, 720 - pb * 200);
    switch (difficulty) {
      case 'easy': grd.addColorStop(0, 'rgba(100,180,255,' + (pb * 0.15) + ')'); grd.addColorStop(1, 'rgba(100,180,255,0)'); break;
      case 'normal': grd.addColorStop(0, 'rgba(200,100,50,' + (pb * 0.2) + ')'); grd.addColorStop(1, 'rgba(200,100,50,0)'); break;
      case 'hard': grd.addColorStop(0, 'rgba(180,120,60,' + (pb * 0.2) + ')'); grd.addColorStop(1, 'rgba(180,120,60,0)'); break;
    }
    c.fillStyle = grd; c.fillRect(0, 0, 480, 720);
  }

  if (difficulty === 'hard') {
    var bandAlpha = 0.1 + pb * 0.2;
    var bandColors = ['#a80', '#c60', '#840', '#a80', '#630', '#c60', '#840'];
    for (var bi = 0; bi < bandColors.length; bi++) {
      var by2 = 50 + bi * 100 + frame * 0.2;
      c.fillStyle = bandColors[bi]; c.globalAlpha = bandAlpha;
      c.fillRect(0, by2 % 720 - 50, 480, 30);
    }
    c.globalAlpha = 1;
  }

  var starCol = isSpecialLevel ? '180,200,255' : difficulty === 'hard' ? '255,220,180' : difficulty === 'normal' ? '255,200,180' : '255,255,255';
  for (var i = 0; i < stars.length; i++) {
    c.fillStyle = 'rgba(' + starCol + ',' + (0.3 + Math.random() * 0.7) + ')';
    c.beginPath(); c.arc(stars[i].x, stars[i].y, stars[i].size, 0, 6.28); c.fill();
  }

  for (i = 0; i < lasers.length; i++) {
    var l = lasers[i];
    var maxT = l.super ? 30 : 8;
    var alpha = 1 - l.timer / maxT;
    var ex = l.x2 || l.x;
    var ey = l.y2 || (l.y - l.length);
    c.strokeStyle = l.super ? 'rgba(255,255,0,' + alpha * 0.9 + ')' : 'rgba(0,200,255,' + alpha * 0.8 + ')';
    c.lineWidth = l.super ? 12 : 6;
    c.beginPath(); c.moveTo(l.x, l.y); c.lineTo(ex, ey); c.stroke();
    c.strokeStyle = l.super ? 'rgba(255,255,255,' + alpha * 0.7 + ')' : 'rgba(255,255,255,' + alpha * 0.5 + ')';
    c.lineWidth = l.super ? 4 : 2;
    c.beginPath(); c.moveTo(l.x, l.y); c.lineTo(ex, ey); c.stroke();
  }

  for (i = 0; i < powerups.length; i++) {
    var p = powerups[i];
    var glow = WEAPON_GLOW[p.type] || '#0ff';
    var g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, 22);
    g.addColorStop(0, glow); g.addColorStop(0.4, glow); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(p.x, p.y, 22, 0, 6.28); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(p.x - 12, p.y - 12, 24, 24);
    c.strokeStyle = glow; c.lineWidth = 2; c.strokeRect(p.x - 12, p.y - 12, 24, 24);
    c.fillStyle = '#fff'; c.font = 'bold 14px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    var icons = { spread: 'W', triple: 'T', laser: 'L', homing: 'H', double: 'D', pulse: 'P', explosive: 'X', ricochet: 'R', super: 'S', sine: '~', cola: 'C', feline: 'F', chicken: 'P', superLaser: '!', dim4: '4', supercalifragilistico: 'E' };
    c.fillText(icons[p.type] || '?', p.x, p.y);
  }

  for (i = 0; i < drones.length; i++) {
    var d = drones[i];
    c.save(); c.translate(d.x, d.y);
    if (droneFormation === 'centrifuge') {
      var ang = Math.atan2(d.y - player.y, d.x - player.x);
      c.rotate(ang);
    }
    if (d.protect) {
      c.fillStyle = '#a0f';
      c.beginPath();
      c.moveTo(0, -10); c.lineTo(-8, 8); c.lineTo(0, 5); c.lineTo(8, 8);
      c.closePath(); c.fill();
      c.strokeStyle = '#c0f'; c.lineWidth = 2; c.stroke();
      c.fillStyle = 'rgba(170,0,255,0.2)'; c.beginPath(); c.arc(0, 0, 14, 0, 6.28); c.fill();
    } else {
      c.fillStyle = '#0af';
      c.beginPath();
      c.moveTo(0, -8); c.lineTo(-6, 6); c.lineTo(0, 4); c.lineTo(6, 6);
      c.closePath(); c.fill();
      c.strokeStyle = '#0ff'; c.lineWidth = 1; c.stroke();
    }
    c.restore();
  }

  for (i = 0; i < selfDestructProjectiles.length; i++) {
    var sd = selfDestructProjectiles[i];
    var grd = c.createRadialGradient(sd.x, sd.y, 0, sd.x, sd.y, 20);
    grd.addColorStop(0, '#fff'); grd.addColorStop(0.3, '#f80'); grd.addColorStop(1, 'rgba(255,136,0,0)');
    c.fillStyle = grd; c.beginPath(); c.arc(sd.x, sd.y, 20, 0, 6.28); c.fill();
    c.fillStyle = '#ff0'; c.beginPath(); c.arc(sd.x, sd.y, 5, 0, 6.28); c.fill();
  }

  if (dashEffectTimer > 0) {
    var dalph = dashEffectTimer / 15;
    c.strokeStyle = 'rgba(0,200,255,' + (dalph * 0.5) + ')'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(dashFromX, dashFromY); c.lineTo(player.x, player.y); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,' + (dalph * 0.3) + ')'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(dashFromX, dashFromY); c.lineTo(player.x, player.y); c.stroke();
  }

  if (!(player.invincible > 0 && Math.floor(player.invincible / 6) % 2 === 0)) {
    c.save(); c.translate(player.x, player.y);
    var pskin = SKIN_DATA[gameData.activeSkin] || SKIN_DATA['default'];
    if (player.hasShield && player.invincible > 0) {
      c.strokeStyle = pskin.stroke; c.lineWidth = 2; c.globalAlpha = 0.3;
      c.beginPath(); c.arc(0, 0, 24, 0, 6.28); c.stroke();
      c.globalAlpha = 1;
    }
    if (shipImg && shipImg.complete && shipImg.naturalWidth > 0) {
      c.drawImage(shipImg, -15, -19, 30, 38);
    } else {
      c.fillStyle = pskin.fill;
      c.beginPath();
      c.moveTo(0, -19); c.lineTo(-15, 19); c.lineTo(-8, 14); c.lineTo(0, 15); c.lineTo(8, 14); c.lineTo(15, 19);
      c.closePath(); c.fill();
      c.strokeStyle = pskin.stroke; c.lineWidth = 2; c.stroke();
      c.fillStyle = pskin.cockpit;
      c.beginPath(); c.ellipse(0, -4, 4, 7, 0, 0, 6.28); c.fill();
    }

    var ug = gameData.upgrades;
    var engSize = 9 + (ug.speed || 0) * 3;
    var grd = c.createRadialGradient(0, 18, 0, 0, 18, engSize);
    grd.addColorStop(0, 'rgba(' + pskin.engine + ',0.8)'); grd.addColorStop(1, 'rgba(' + pskin.engine + ',0)');
    c.fillStyle = grd; c.beginPath(); c.arc(0, 21, engSize, 0, 6.28); c.fill();
    if (ug.speed > 1) { c.strokeStyle = 'rgba(' + pskin.engine + ',0.4)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-4, 22); c.lineTo(-8, 30); c.moveTo(4, 22); c.lineTo(8, 30); c.stroke(); }
    if (ug.speed > 2) { c.strokeStyle = 'rgba(' + pskin.engine + ',0.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-2, 23); c.lineTo(-5, 34); c.moveTo(2, 23); c.lineTo(5, 34); c.stroke(); }

    if (ug.fireRate > 0) {
      c.fillStyle = '#555'; c.strokeStyle = '#aaa'; c.lineWidth = 1;
      var fl = -16, fr = 16;
      c.fillRect(fl - 2, 10, 4, 6); c.strokeRect(fl - 2, 10, 4, 6);
      c.fillRect(fr - 2, 10, 4, 6); c.strokeRect(fr - 2, 10, 4, 6);
    }
    if (ug.fireRate > 1) {
      c.fillRect(-20, 6, 3, 5); c.strokeRect(-20, 6, 3, 5);
      c.fillRect(17, 6, 3, 5); c.strokeRect(17, 6, 3, 5);
    }

    if (ug.bomb > 0) {
      c.fillStyle = '#f44'; c.strokeStyle = '#a00'; c.lineWidth = 1;
      c.beginPath(); c.arc(-11, 18, 3, 0, 6.28); c.fill(); c.stroke();
      c.beginPath(); c.arc(11, 18, 3, 0, 6.28); c.fill(); c.stroke();
    }
    if (ug.bomb > 1) {
      c.beginPath(); c.arc(-11, 12, 2, 0, 6.28); c.fill(); c.stroke();
      c.beginPath(); c.arc(11, 12, 2, 0, 6.28); c.fill(); c.stroke();
    }

    if (ug.hp > 0) {
      c.strokeStyle = pskin.cockpit; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-8, 5); c.lineTo(8, 5); c.stroke();
      c.beginPath(); c.moveTo(-6, 10); c.lineTo(6, 10); c.stroke();
    }
    if (ug.hp > 1) {
      c.strokeStyle = pskin.stroke; c.globalAlpha = 0.5;
      c.beginPath(); c.moveTo(-12, 2); c.lineTo(12, 2); c.stroke();
      c.globalAlpha = 1;
    }

    if (ug.magnet > 0) {
      c.strokeStyle = 'rgba(0,255,255,' + (0.08 + ug.magnet * 0.02) + ')'; c.lineWidth = 1;
      c.beginPath(); c.arc(0, 0, 28, -1.2, 1.2); c.stroke();
      c.beginPath(); c.arc(0, 0, 34, -0.8, 0.8); c.stroke();
    }

    if (ug.dash > 0) {
      c.fillStyle = '#666'; c.strokeStyle = '#0cf'; c.lineWidth = 1;
      c.fillRect(-19, 10, 4, 6); c.strokeRect(-19, 10, 4, 6);
      c.fillRect(15, 10, 4, 6); c.strokeRect(15, 10, 4, 6);
    }
    if (ug.dash > 1) {
      c.fillRect(-19, -4, 4, 4); c.strokeRect(-19, -4, 4, 4);
      c.fillRect(15, -4, 4, 4); c.strokeRect(15, -4, 4, 4);
    }

    if (ug.weaponSlots > 0) {
      c.strokeStyle = '#0cf'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, -19); c.lineTo(0, -25); c.stroke();
      c.fillStyle = '#0cf'; c.beginPath(); c.arc(0, -26, 2, 0, 6.28); c.fill();
    }

    var eq = gameData.equipped || [];
    if (eq.length > 0) {
    var wicons = { double:'║', triple:'三', laser:'◄', homing:'◎', pulse:'◯', explosive:'✦', ricochet:'⟳', super:'★', sine:'∿', cola:'●', feline:'▲', chicken:'✧', superLaser:'⊞', dim4:'✚', spread:'⬡', supercalifragilistico:'☆' };
      var n = Math.min(eq.length, 5);
      var startX = -(n * 5);
      c.font = '7px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (var wi2 = 0; wi2 < n; wi2++) {
        var wid = eq[wi2];
        c.fillStyle = WEAPON_GLOW[wid] || '#fff';
        c.fillText(wicons[wid] || '?', startX + wi2 * 10, 12);
      }
    }

    c.restore();
  }

  for (i = 0; i < trails.length; i++) {
    var tr = trails[i];
    c.globalAlpha = tr.life / tr.maxLife;
    c.fillStyle = tr.color;
    c.beginPath(); c.arc(tr.x, tr.y, tr.size * (tr.life / tr.maxLife), 0, 6.28); c.fill();
  }
  c.globalAlpha = 1;

  for (i = 0; i < bullets.length; i++) {
    var b = bullets[i];
    if (!b.friendly) continue;
    if (b.homing) {
      c.fillStyle = '#fa0';
      c.beginPath(); c.arc(b.x, b.y, 5, 0, 6.28); c.fill();
    } else if (b.pulse) {
      var gp = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, 20);
      gp.addColorStop(0, '#fff'); gp.addColorStop(0.3, '#0ff'); gp.addColorStop(1, 'rgba(0,255,255,0)');
      c.fillStyle = gp; c.beginPath(); c.arc(b.x, b.y, 20, 0, 6.28); c.fill();
    } else if (b.explosive) {
      c.fillStyle = '#f80'; c.beginPath(); c.arc(b.x, b.y, 5, 0, 6.28); c.fill();
      c.fillStyle = 'rgba(255,136,0,0.3)'; c.beginPath(); c.arc(b.x, b.y, 10, 0, 6.28); c.fill();
    } else if (b.ricochet) {
      c.fillStyle = '#0f0'; c.beginPath(); c.arc(b.x, b.y, 4, 0, 6.28); c.fill();
      c.fillStyle = 'rgba(0,255,0,0.3)'; c.beginPath(); c.arc(b.x, b.y, 8, 0, 6.28); c.fill();
    } else if (b.supercali) {
      var scg = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, 14);
      scg.addColorStop(0, '#fff'); scg.addColorStop(0.3, '#0f0'); scg.addColorStop(1, 'rgba(0,255,0,0)');
      c.fillStyle = scg; c.beginPath(); c.arc(b.x, b.y, 14, 0, 6.28); c.fill();
      c.fillStyle = '#0f0';
      c.beginPath(); c.arc(b.x, b.y, 8, 0, 6.28); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(b.x, b.y, 8, 0, 6.28); c.stroke();
    } else if (b.pierce) {
      c.fillStyle = '#f0f';
      c.beginPath(); c.arc(b.x, b.y, 10, 0, 6.28); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.arc(b.x, b.y, 10, 0, 6.28); c.stroke();
    } else if (b.sine) {
      c.fillStyle = '#0ff';
      c.beginPath(); c.arc(b.x, b.y, 4, 0, 6.28); c.fill();
      c.strokeStyle = 'rgba(0,255,255,0.4)'; c.lineWidth = 1;
      c.beginPath(); c.arc(b.x, b.y, 8, 0, 6.28); c.stroke();
    } else if (b.cola || b.colaShard) {
      c.fillStyle = '#a50';
      c.beginPath(); c.arc(b.x, b.y, b.colaShard ? 3 : 5, 0, 6.28); c.fill();
      if (!b.colaShard) { c.fillStyle = 'rgba(170,85,0,0.3)'; c.beginPath(); c.arc(b.x, b.y, 10, 0, 6.28); c.fill(); }
    } else if (b.feline) {
      c.fillStyle = '#f80';
      c.beginPath(); c.arc(b.x, b.y, 5, 0, 6.28); c.fill();
      c.strokeStyle = '#fa0'; c.lineWidth = 1;
      c.beginPath(); c.arc(b.x, b.y, 8, 0, 6.28); c.stroke();
    } else {
      var g2 = c.createLinearGradient(b.x, b.y - b.h / 2, b.x, b.y + b.h / 2);
      g2.addColorStop(0, '#fff'); g2.addColorStop(0.3, '#0ff'); g2.addColorStop(1, 'rgba(0,255,255,0)');
      c.fillStyle = g2; c.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
    }
  }

  for (i = 0; i < enemies.length; i++) {
    var e = enemies[i];
    c.save(); c.translate(e.x, e.y);
    if (e.bossMinion) {
      c.fillStyle = '#a0a'; c.strokeStyle = '#f0f'; c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, -12); c.lineTo(10, 0); c.lineTo(0, 12); c.lineTo(-10, 0); c.closePath();
      c.fill(); c.stroke();
      c.fillStyle = '#f0f'; c.beginPath(); c.arc(0, 0, 4, 0, 6.28); c.fill();
    } else if (e.type === 0 || e.type === 1) {
      var isOrange = e.type === 1;
      c.fillStyle = isOrange ? '#a60' : '#a00';
      c.beginPath();
      c.moveTo(0, 18); c.lineTo(-18, -18); c.lineTo(-9, -10); c.lineTo(0, -12); c.lineTo(9, -10); c.lineTo(18, -18);
      c.closePath(); c.fill();
      c.strokeStyle = isOrange ? '#f84' : '#f44'; c.lineWidth = 2; c.stroke();
      c.fillStyle = isOrange ? '#f84' : '#f44'; c.beginPath(); c.arc(0, -2, 5, 0, 6.28); c.fill();
      var g3 = c.createRadialGradient(0, -18, 0, 0, -18, 10);
      var r = isOrange ? 'rgba(255,136,68,0.8)' : 'rgba(255,68,68,0.8)';
      g3.addColorStop(0, r); g3.addColorStop(1, 'rgba(255,68,68,0)');
      c.fillStyle = g3; c.beginPath(); c.arc(0, -22, 10, 0, 6.28); c.fill();
    } else {
      var isOrange = e.type === 3;
      c.fillStyle = isOrange ? '#a60' : '#a00';
      c.beginPath(); c.arc(0, 0, 18, 0, 6.28); c.fill();
      c.strokeStyle = isOrange ? '#f84' : '#f44'; c.lineWidth = 2; c.stroke();
      c.fillStyle = isOrange ? '#f84' : '#f44'; c.beginPath(); c.arc(0, 0, 5, 0, 6.28); c.fill();
    }
    c.restore();
  }

  for (i = 0; i < enemyBullets.length; i++) {
    var eb = enemyBullets[i];
    if (eb.supercali) {
      var scg = c.createRadialGradient(eb.x, eb.y, 0, eb.x, eb.y, 10);
      scg.addColorStop(0, '#fff'); scg.addColorStop(0.3, '#0f0'); scg.addColorStop(1, 'rgba(0,255,0,0)');
      c.fillStyle = scg; c.beginPath(); c.arc(eb.x, eb.y, 10, 0, 6.28); c.fill();
      c.fillStyle = '#0f0'; c.beginPath(); c.arc(eb.x, eb.y, 5, 0, 6.28); c.fill();
    } else {
      var g4 = c.createRadialGradient(eb.x, eb.y, 0, eb.x, eb.y, 6);
      g4.addColorStop(0, '#fff'); g4.addColorStop(0.3, '#f44'); g4.addColorStop(1, 'rgba(255,68,68,0)');
      c.fillStyle = g4; c.beginPath(); c.arc(eb.x, eb.y, 6, 0, 6.28); c.fill();
    }
  }

  for (i = 0; i < asteroids.length; i++) {
    var a = asteroids[i];
    c.save(); c.translate(a.x, a.y); c.rotate(a.rot);
    if (isSpecialLevel) {
      c.fillStyle = '#446'; c.strokeStyle = '#669'; c.lineWidth = 1;
      c.beginPath();
      for (var j = 0; j < 6; j++) {
        var ang = j / 6 * 6.28, r = a.w / 2 * (0.6 + Math.sin(j * 2.5 + a.rot) * 0.3);
        if (j === 0) c.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
        else c.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      c.closePath(); c.fill(); c.stroke();
    } else if (difficulty === 'easy') {
      var bw = a.w * 0.5, bh = a.h * 0.7;
      c.fillStyle = '#889'; c.strokeStyle = '#aab'; c.lineWidth = 1.5;
      c.fillRect(-bw / 2, -bh / 2, bw, bh); c.strokeRect(-bw / 2, -bh / 2, bw, bh);
      c.fillStyle = '#558'; c.strokeStyle = '#77a';
      c.fillRect(-a.w / 2, -bh * 0.4, a.w * 0.25, bh * 0.3); c.strokeRect(-a.w / 2, -bh * 0.4, a.w * 0.25, bh * 0.3);
      c.fillRect(a.w / 2 - a.w * 0.25, -bh * 0.4, a.w * 0.25, bh * 0.3); c.strokeRect(a.w / 2 - a.w * 0.25, -bh * 0.4, a.w * 0.25, bh * 0.3);
      c.strokeStyle = '#aaa'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, -bh / 2); c.lineTo(0, -bh / 2 - 6); c.stroke();
      c.fillStyle = '#f44'; c.beginPath(); c.arc(0, -bh / 2 - 7, 2, 0, 6.28); c.fill();
      c.strokeStyle = '#667'; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(-bw * 0.2, -bh * 0.1); c.lineTo(bw * 0.1, bh * 0.1); c.lineTo(bw * 0.3, 0); c.stroke();
      c.beginPath(); c.moveTo(-bw * 0.1, bh * 0.2); c.lineTo(bw * 0.15, bh * 0.3); c.stroke();
    } else if (difficulty === 'normal') {
      c.fillStyle = '#a76'; c.strokeStyle = '#c98'; c.lineWidth = 2;
      c.beginPath();
      for (var j = 0; j < 8; j++) {
        var ang = j / 8 * 6.28, r = a.w / 2 * (0.7 + Math.sin(j * 3.7 + a.rot) * 0.3);
        if (j === 0) c.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
        else c.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      c.closePath(); c.fill(); c.stroke();
      c.globalAlpha = 0.3; c.fillStyle = '#d82';
      c.beginPath(); c.arc(a.w * 0.15, -a.h * 0.1, a.w * 0.12, 0, 6.28); c.fill();
      c.beginPath(); c.arc(-a.w * 0.1, a.h * 0.15, a.w * 0.1, 0, 6.28); c.fill();
      c.globalAlpha = 1;
    } else {
      c.fillStyle = '#dde'; c.strokeStyle = '#eef'; c.lineWidth = 2;
      c.beginPath();
      for (var j = 0; j < 8; j++) {
        var ang = j / 8 * 6.28, r = a.w / 2 * (0.7 + Math.sin(j * 3.7 + a.rot) * 0.3);
        if (j === 0) c.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
        else c.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      c.closePath(); c.fill(); c.stroke();
      c.globalAlpha = 0.3; c.fillStyle = '#fff';
      c.beginPath(); c.arc(a.w * 0.1, -a.h * 0.1, a.w * 0.15, 0, 6.28); c.fill();
      c.beginPath(); c.arc(-a.w * 0.2, a.h * 0.1, a.w * 0.1, 0, 6.28); c.fill();
      c.globalAlpha = 0.2; c.strokeStyle = '#ccf'; c.lineWidth = 1;
      for (var li = 0; li < 3; li++) { c.beginPath(); c.moveTo(-a.w * 0.3 + li * a.w * 0.3, -a.h * 0.4); c.lineTo(-a.w * 0.1 + li * a.w * 0.3, a.h * 0.4); c.stroke(); }
      c.globalAlpha = 1;
    }
    c.restore();
  }

  for (i = 0; i < points.length; i++) {
    var pt = points[i];
    var alpha = Math.min(1, pt.life / 30);
    c.globalAlpha = alpha;
    c.fillStyle = '#ff0';
    c.beginPath();
    c.moveTo(pt.x, pt.y - 5);
    c.lineTo(pt.x + 4, pt.y + 3);
    c.lineTo(pt.x - 4, pt.y + 3);
    c.closePath();
    c.fill();
    c.fillStyle = 'rgba(255,255,0,' + alpha * 0.3 + ')';
    c.beginPath();
    c.arc(pt.x, pt.y, 7, 0, 6.28);
    c.fill();
  }
  c.globalAlpha = 1;

  for (i = 0; i < hearts.length; i++) {
    var h = hearts[i];
    var alpha = Math.min(1, h.life / 30);
    c.globalAlpha = alpha;
    c.save(); c.translate(h.x, h.y);
    c.fillStyle = '#f22';
    c.beginPath();
    c.moveTo(0, 4);
    c.bezierCurveTo(-8, -4, -12, -4, -12, 2);
    c.bezierCurveTo(-12, 8, 0, 14, 0, 14);
    c.bezierCurveTo(0, 14, 12, 8, 12, 2);
    c.bezierCurveTo(12, -4, 8, -4, 0, 4);
    c.fill();
    c.restore();
  }
  c.globalAlpha = 1;

  for (i = 0; i < shieldPickups.length; i++) {
    var sh = shieldPickups[i];
    var alpha = Math.min(1, sh.life / 30);
    c.globalAlpha = alpha;
    var sg = c.createRadialGradient(sh.x, sh.y, 0, sh.x, sh.y, 16);
    sg.addColorStop(0, '#4df'); sg.addColorStop(0.6, '#08f'); sg.addColorStop(1, 'rgba(0,136,255,0)');
    c.fillStyle = sg; c.beginPath(); c.arc(sh.x, sh.y, 16, 0, 6.28); c.fill();
    c.fillStyle = 'rgba(0,50,100,0.4)'; c.beginPath(); c.arc(sh.x, sh.y, 10, 0, 6.28); c.fill();
    c.strokeStyle = '#4df'; c.lineWidth = 2; c.beginPath(); c.arc(sh.x, sh.y, 10, 0, 6.28); c.stroke();
    c.fillStyle = '#fff'; c.font = 'bold 10px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('S', sh.x, sh.y);
    c.globalAlpha = 1;
  }

  for (i = 0; i < specialPickups.length; i++) {
    var sp = specialPickups[i];
    var alpha = Math.min(1, sp.life / 30);
    c.globalAlpha = alpha;
    var mg = c.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 16);
    mg.addColorStop(0, '#fff'); mg.addColorStop(0.3, '#f0f'); mg.addColorStop(0.6, '#0ff'); mg.addColorStop(1, 'rgba(255,0,255,0)');
    c.fillStyle = mg; c.beginPath(); c.arc(sp.x, sp.y, 16, 0, 6.28); c.fill();
    var mg2 = c.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 12);
    mg2.addColorStop(0, '#fff'); mg2.addColorStop(0.5, '#ff0'); mg2.addColorStop(1, 'rgba(255,255,0,0)');
    c.fillStyle = mg2; c.beginPath(); c.arc(sp.x, sp.y, 12, 0, 6.28); c.fill();
    c.fillStyle = '#fff'; c.font = 'bold 10px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('x2', sp.x, sp.y);
    c.globalAlpha = 1;
  }

  c.globalAlpha = 1;

  drawBoss();

  for (i = 0; i < explosions.length; i++) {
    var ex = explosions[i];
    c.globalAlpha = ex.life / ex.maxLife;
    c.fillStyle = ex.color;
    c.beginPath(); c.arc(ex.x, ex.y, ex.size * (ex.life / ex.maxLife), 0, 6.28); c.fill();
  }
  c.globalAlpha = 1;

  // HUD
  c.fillStyle = 'rgba(0,10,20,0.85)';
  c.strokeStyle = '#0cf';
  c.lineWidth = 1;
  c.beginPath(); roundRect(c, 8, 8, 464, 28, 4); c.fill(); c.stroke();

  c.font = '13px Arial'; c.textBaseline = 'middle';
  c.fillStyle = '#f44'; c.textAlign = 'left';
  var hpStr = '';
  for (var hi = 0; hi < player.hp; hi++) hpStr += '\u2665';
  for (hi = player.hp; hi < player.maxHp; hi++) hpStr += '\u2661';
  c.fillText(hpStr, 16, 22);
  c.fillStyle = '#ff0'; c.textAlign = 'center';
  c.fillText('PTS: ' + score, 240, 22);
  c.fillStyle = '#0ff'; c.textAlign = 'right';
  c.fillText((PLANET_DATA[difficulty] ? PLANET_DATA[difficulty].name + ' ' : '') + level, 464, 22);

  var by = 660;
  c.fillStyle = 'rgba(0,10,20,0.88)';
  c.strokeStyle = '#0cf';
  c.lineWidth = 1;
  c.beginPath(); roundRect(c, 8, by, 464, 52, 4); c.fill(); c.stroke();

  c.font = '12px Arial'; c.textBaseline = 'middle';
  c.textAlign = 'left';
  c.fillStyle = '#8cf';
  c.fillText('NAV', 16, by + 14);
  c.fillStyle = '#fff';
  c.fillText(weaponLabel(player.weapon), 50, by + 14);
  if (weaponAmmo > 0) {
    c.fillStyle = '#ff0';
    c.fillText('[' + weaponAmmo + ']', 88, by + 14);
  }

  c.fillStyle = '#f8c';
  c.fillText('DRN', 140, by + 14);
  c.fillStyle = '#fff';
  c.fillText(weaponLabel(droneWeapon) + (droneFusion ? '+' + weaponLabel(droneFusion.dispersion) : ''), 174, by + 14);
  if (droneAmmo > 0) {
    c.fillStyle = '#ff0';
    c.fillText('[' + droneAmmo + ']', 212, by + 14);
  }
  if ((gameData.upgrades.droneAutoEquip || 0) > 0 && droneWeapon === 'normal') {
    c.fillStyle = 'rgba(255,100,200,0.3)'; c.textAlign = 'left';
    c.fillText('AUTO', 238, by + 14);
  }

  c.fillStyle = '#fa0';
  if (bombs > 0) c.fillText('\u2737' + bombs, 290, by + 14);
  if (bombFull > 0) {
    c.fillStyle = '#f44';
    c.fillText('\u2622' + bombFull, 314, by + 14);
  }

  c.textAlign = 'left'; c.font = '10px Arial';
  var multX = 330;
  if (scoreMultTimer > 0) {
    var secs = Math.ceil(scoreMultTimer / 60);
    c.fillStyle = '#fd0'; c.fillText('x' + scoreMult + ' PTS ' + secs + 's', multX, by + 14);
    multX += 80;
  }
  if (fireRateMultTimer > 0) {
    var secs = Math.ceil(fireRateMultTimer / 60);
    c.fillStyle = '#f60'; c.fillText('x' + fireRateMult + ' VEL ' + secs + 's', multX, by + 14);
  }

  c.fillStyle = '#8f8'; c.textAlign = 'right';
  c.font = '10px Arial';
  c.fillText(droneFormation.toUpperCase(), 464, by + 14);

  c.textAlign = 'left';
  c.fillStyle = '#aa0'; c.font = '11px Arial';
  c.fillText('COLA [' + weaponQueue.length + '/' + POINTS_QUEUE_MAX + ']:', 16, by + 36);
  var wicons = { spread: 'W', triple: 'T', laser: 'L', homing: 'H', double: 'D', pulse: 'P', explosive: 'X', ricochet: 'R', super: 'S', sine: '~', cola: 'C', feline: 'F', chicken: 'P', superLaser: '!', dim4: '4', supercalifragilistico: 'E' };
  for (var qi = 0; qi < weaponQueue.length && qi < 5; qi++) {
    var wt = weaponQueue[qi];
    var qc = WEAPON_GLOW[wt] || '#fff';
    c.fillStyle = '#000'; c.fillRect(124 + qi * 22, by + 28, 20, 18);
    c.strokeStyle = qc; c.lineWidth = 1;
    c.strokeRect(124 + qi * 22, by + 28, 20, 18);
    c.fillStyle = qc;
    c.font = 'bold 11px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(wicons[wt] || '?', 134 + qi * 22, by + 37);
  }

  if (gameData.upgrades.dash) {
    c.fillStyle = dashCooldownTimer > 0 ? '#666' : '#0ff';
    c.textAlign = 'right';
    c.fillText('DASH', 464, by + 36);
    if (dashCooldownTimer > 0) {
      c.fillStyle = '#888'; c.font = '10px Arial';
      c.fillText((dashCooldownTimer / 60).toFixed(1) + 's', 464, by + 46);
    }
  }

  var aeLevel = gameData.upgrades.autoEquip || 0;
  if (aeLevel > 0) {
    c.fillStyle = 'rgba(0,255,200,0.3)'; c.textAlign = 'right';
    c.fillText('AUTO', 464, by + 56);
    if (aeLevel < 3 && autoEquipTimer > 0) {
      var aeMax = aeLevel === 1 ? 300 : 180;
      c.fillStyle = '#0fc'; c.font = '10px Arial';
      c.fillText(Math.ceil((aeMax - autoEquipTimer) / 60) + 's', 464, by + 66);
    }
  }

  c.strokeStyle = 'rgba(0,204,255,0.15)';
  c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, 0); c.lineTo(480, 0); c.stroke();
  c.beginPath(); c.moveTo(0, 720); c.lineTo(480, 720); c.stroke();

  if (paused) {
    c.fillStyle = 'rgba(0,0,0,0.6)'; c.fillRect(0, 0, 480, 720);
    c.fillStyle = '#fff'; c.font = 'bold 48px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('PAUSA', 240, 320);
    c.font = '16px Arial'; c.fillStyle = '#0cf'; c.fillText('Presiona ESC para continuar', 240, 380);
  }

  c.restore();
}
