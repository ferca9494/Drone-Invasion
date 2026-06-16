// ============================================================
// AUDIO
// ============================================================
var audioCtx = null;
function initAudio() { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { } }
function playSound(f, d, t, v) {
  if (!audioCtx || !optionsData.soundEnabled) return;
  try {
    var o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = t || 'square'; o.frequency.setValueAtTime(f, audioCtx.currentTime);
    g.gain.setValueAtTime(v || 0.1, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + d);
    o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + d);
  } catch (e) { }
}
function playNoise(d, v) {
  if (!audioCtx || !optionsData.soundEnabled) return;
  try {
    var sr = audioCtx.sampleRate, bs = sr * d, b = audioCtx.createBuffer(1, bs, sr), d2 = b.getChannelData(0);
    for (var i = 0; i < bs; i++) d2[i] = Math.random() * 2 - 1;
    var s = audioCtx.createBufferSource(), g = audioCtx.createGain();
    s.buffer = b; g.gain.setValueAtTime(v || 0.08, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + d);
    s.connect(g); g.connect(audioCtx.destination); s.start();
  } catch (e) { }
}
function playShoot() { playSound(880, 0.08, 'square', 0.07); }
function playExplosion() { playNoise(0.25, 0.1); playSound(120, 0.2, 'sawtooth', 0.08); }
function playAsteroidBreak() { playNoise(0.35, 0.12); playSound(80, 0.3, 'sawtooth', 0.1); }
function playClick() { playSound(660, 0.04, 'square', 0.05); }
function playPowerup() { playSound(523, 0.1, 'sine', 0.08); setTimeout(function () { playSound(659, 0.1, 'sine', 0.08); }, 100); setTimeout(function () { playSound(784, 0.15, 'sine', 0.08); }, 200); }
function playBossExplosion() { playNoise(0.8, 0.2); playSound(60, 0.6, 'sawtooth', 0.15); }
function playLaser() { playSound(440, 0.06, 'sawtooth', 0.03); }
