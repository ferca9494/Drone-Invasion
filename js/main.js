var canvas, ctx;
var scoreSpan, weaponSpan, levelNumSpan, bombCountSpan, bombsLeftSpan, bombFullCountSpan, bombFullLeftSpan;
var gameOverDiv, earnedPtsSpan, finalScoreSpan;
var menuDiv, shopDiv, optionsDiv, menuPtsSpan, shopPtsSpan, shopItemsDiv, uiDiv;
var levelIntroDiv, bossHpBar, bossHpFill;
var optSoundSpan, optMouseSpan, diffDescSpan;

function initDOM() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  canvas.width = 480; canvas.height = 720;
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
  uiDiv = document.getElementById('ui');
  levelIntroDiv = document.getElementById('levelIntro');
  bossHpBar = document.getElementById('bossHpBar');
  bossHpFill = document.getElementById('bossHpFill');
  diffDescSpan = document.getElementById('diffDesc');
}

function loop() { update(); draw(); requestAnimationFrame(loop); }

function init() {
  initDOM(); loadData(); loadOptions(); initAudio(); initStars();
  menuDiv.style.display = 'flex'; menuPtsSpan.textContent = gameData.points;
  updateDiffUI(); updateOptionsUI();
  var diffEl = document.querySelector('.planet-circle[data-diff="' + difficulty + '"]');
  if (!diffEl || diffEl.classList.contains('locked')) {
    difficulty = 'easy'; gameData.difficulty = 'easy'; updateDiffUI();
  }
  loop();
}
init();
