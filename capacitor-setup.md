# Capacitor Setup — Space Shooter Mobile

## Requisitos

- Node.js v18+
- npm
- Android Studio + SDK (para compilar APK)
- Opcional: Java 17 (viene con Android Studio)

---

## 1. Inicializar npm y instalar Capacitor

```bash
cd D:\Proyectos\proyectoJuego
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
```

## 2. Configurar Capacitor

```bash
npx cap init
```

Te pedirá:
- **App name**: Space Shooter
- **App ID**: com.tunombre.spaceshooter (dominio reverso)

Luego crear `capacitor.config.json` (se genera solo, pero verificar contenido):

```json
{
  "appId": "com.tunombre.spaceshooter",
  "appName": "Space Shooter",
  "webDir": ".",
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 1000
    }
  }
}
```

> `webDir: "."` porque `index.html` está en la raíz del proyecto.

## 3. Agregar plataforma Android

```bash
npx cap add android
```

Esto crea la carpeta `android/` con un proyecto Android Studio.

## 4. Agregar controles táctiles

### 4.1. Estructura HTML

Dentro de `<body>`, después del canvas, agregar un contenedor con los botones táctiles:

```html
<div id="touch-controls" style="display:none; position:fixed; inset:0; pointer-events:none; z-index:100;">
  <!-- D-pad (opcional) -->
  <div id="touch-dpad" style="position:absolute; bottom:30px; left:20px; pointer-events:auto;">
    <button data-key="ArrowUp">▲</button>
    <button data-key="ArrowDown">▼</button>
    <button data-key="ArrowLeft">◀</button>
    <button data-key="ArrowRight">▶</button>
  </div>

  <!-- Botones de acción -->
  <div id="touch-actions" style="position:absolute; bottom:30px; right:20px; pointer-events:auto;">
    <button data-key=" ">🔥</button>       <!-- Space / disparar -->
    <button data-key="q">Q</button>        <!-- equipar arma -->
    <button data-key="e">E</button>        <!-- asignar a dron -->
    <button data-key="z">Z</button>        <!-- formación -->
    <button data-key="c">C</button>        <!-- dash -->
    <button data-key="f">F</button>        <!-- autodestrucción -->
    <button data-key="b">B</button>        <!-- antibalas -->
    <button data-key="x">X</button>        <!-- bomba total -->
  </div>

  <!-- Pausa / menú -->
  <button id="touch-pause" style="position:absolute; top:10px; right:10px; pointer-events:auto;" data-key="Escape">⏸</button>
</div>
```

### 4.2. CSS de los botones

Agregar estilos para touch controls:

```css
#touch-controls button {
  width: 50px; height: 50px;
  border-radius: 50%;
  background: rgba(0, 204, 255, 0.25);
  border: 2px solid rgba(0, 204, 255, 0.5);
  color: #fff;
  font-size: 16px;
  margin: 4px;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}
#touch-controls button:active {
  background: rgba(0, 204, 255, 0.6);
}
```

### 4.3. JavaScript para simular teclas

```js
function setupTouchControls() {
  var btns = document.querySelectorAll('#touch-controls button[data-key]');
  btns.forEach(function(btn) {
    var key = btn.getAttribute('data-key');
    // Touch start → key down
    btn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      keys[key] = true;
      // Para Space, activar autofire momentáneo
    });
    // Touch end → key up
    btn.addEventListener('touchend', function(e) {
      e.preventDefault();
      keys[key] = false;
    });
    btn.addEventListener('touchcancel', function(e) {
      e.preventDefault();
      keys[key] = false;
    });
  });
}
```

### 4.4. Detectar mobile y mostrar/ocultar

```js
function isMobile() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// En init():
if (isMobile()) {
  document.getElementById('touch-controls').style.display = 'block';
  setupTouchControls();
  // Activar control por mouse (touch → mouseX/mouseY para movimiento)
  optionsData.mouseControl = true;
}
```

### 4.5. Movimiento táctil (control por mouse ya existente)

El juego ya tiene `optionsData.mouseControl`. Al activarlo, los eventos `touchmove` en el canvas actualizan `mouseX/mouseY` y la nave se mueve hacia ahí. Asegurarse que el canvas escuche eventos touch:

```js
canvas.addEventListener('touchmove', function(e) {
  e.preventDefault();
  var rect = canvas.getBoundingClientRect();
  var touch = e.touches[0];
  mouseX = touch.clientX - rect.left;
  mouseY = touch.clientY - rect.top;
});
canvas.addEventListener('touchstart', function(e) {
  e.preventDefault();
  var rect = canvas.getBoundingClientRect();
  var touch = e.touches[0];
  mouseX = touch.clientX - rect.left;
  mouseY = touch.clientY - rect.top;
});
```

## 5. Workflow de desarrollo

### Probar cambios en navegador (rápido)

```bash
# Sigue funcionando como siempre:
# - Abrir index.html directo
# - O usar Live Server de VS Code
```

### Probar en Android

```bash
# 1. Sincronizar cambios web al proyecto nativo
npx cap copy

# 2. Abrir Android Studio y correr en emulador/dispositivo
npx cap open android

# O directamente compilar y correr:
npx cap run android
```

### Build de producción (APK)

```bash
# Generar APK firmado desde Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)

# O desde terminal:
cd android
./gradlew assembleRelease
# APK en: android/app/build/outputs/apk/release/
```

## 6. Consideraciones

- **Touch events**: El juego usa `keydown/keyup` para todo. Los botones táctiles deben disparar esos mismos eventos.
- **Autofire**: En mobile conviene recomendar la mejora "Autodisparo" para no depender del botón de fuego.
- **Rendimiento**: El canvas se renderiza a 60fps. En dispositivos viejos puede consumir batería. Considerar `requestAnimationFrame` (ya implementado).
- **Orientación**: Forzar portrait en `capacitor.config.json`:

```json
{
  "android": {
    "orientation": "portrait"
  }
}
```

- **Splash Screen**: Capacitor genera splash por defecto. Reemplazar `android/app/src/main/res/drawable/` con el splash deseado.
