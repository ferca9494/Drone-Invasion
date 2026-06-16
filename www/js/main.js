var canvas, ctx;
var scoreSpan, weaponSpan, levelNumSpan, bombCountSpan, bombsLeftSpan, bombFullCountSpan, bombFullLeftSpan;
var gameOverDiv, earnedPtsSpan, finalScoreSpan;
var menuDiv, shopDiv, optionsDiv, menuPtsSpan, shopPtsSpan, shopItemsDiv, uiDiv;
var levelIntroDiv, bossHpBar, bossHpFill;
var optSoundSpan, optMouseSpan;

function resizeCanvas() {
  var rect = canvas.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;
  canvas.width = 480 * dpr;
  canvas.height = 720 * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function initDOM() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  scoreSpan = document.getElementById('score');
  weaponSpan = document.getElementById('weapon');
  levelNumSpan = document.getElementById('levelNum');
  bombCountSpan = document.getElementById('bombCount');
  bombsLeftSpan = document.getElementById('bombsLeft');
  bombFullCountSpan = document.getElementById('bombFullCount');
  bombFullLeftSpan = document.getElementById('bombFullLeft');
  gameOverDiv = document.getElementById('gameOver');
  earnedPtsSpan = document.getElementById('earnedPts');
  finalScoreSpan = document.getElementById('finalScore');
  menuDiv = document.getElementById('menu');
  shopDiv = document.getElementById('shop');
  menuPtsSpan = document.getElementById('menuPts');
  shopPtsSpan = document.getElementById('shopPts');
  shopItemsDiv = document.getElementById('shopItems');
  optionsDiv = document.getElementById('options');
  optSoundSpan = document.getElementById('optSound');
  optMouseSpan = document.getElementById('optMouse');
  levelIntroDiv = document.getElementById('levelInfo');
  uiDiv = document.getElementById('levelInfo');
  bossHpBar = document.getElementById('bossHpBar');
  bossHpFill = document.getElementById('bossHpFill');
}

function loop() { update(); draw(); requestAnimationFrame(loop); }

function init() {
  initDOM(); loadData(); loadOptions(); initAudio(); initStars();
  menuDiv.style.display = 'flex'; menuPtsSpan.textContent = gameData.points;
  updateOptionsUI();
  if (isMobile()) {
    document.getElementById('touch-controls').style.display = 'block';
    setupTouchControls();
    setupCanvasTouch();
    optionsData.mouseControl = true;
  }
  window.addEventListener('resize', resizeCanvas);
  loop();
}
init();
