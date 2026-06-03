# Space Shooter 🚀

Un emocionante juego de disparos en el espacio desarrollado en JavaScript vanilla con Canvas HTML5. ¡Defiéndete de oleadas de enemigos, mejora tu nave y derrota a poderosos jefes!

---

## 📋 Características

- **Gameplay dinámico**: Dispara y esquiva enemigos en un intenso juego de arcade
- **Sistema de armas**: Desbloquea y mejora diferentes tipos de armas
- **Bombas especiales**: Usa bombas poderosas para limpiar la pantalla
- **Tienda integrada**: Compra mejoras con los puntos que ganas
- **Múltiples niveles y planetas**: Elige tu destino y enfrenta diferentes desafíos
- **Jefes finales**: Derrota a poderosos enemigos al final de cada nivel
- **Sistema de puntuación**: Acumula puntos y desbloquea recompensas
- **Audio dinámico**: Efectos de sonido y música inmersivos
- **Compatible con móviles**: Diseñado para funcionar en dispositivos móviles y PC

---

## 🎮 Controles

### Teclado (PC)
- **Movimiento**: Flechas de dirección o WASD
- **Disparar**: Espacio o clic del ratón
- **Bomba**: B (si tienes disponibles)
- **Reiniciar**: R (en game over)

### Táctil (Móvil)
- **Movimiento**: Arrastra tu dedo por la pantalla
- **Disparar**: Toca la pantalla

---

## 🚀 Inicio Rápido

### En el navegador

1. **Abre `index.html` en tu navegador favorito**
   ```bash
   # Opción 1: Abre directamente el archivo
   start index.html
   
   # Opción 2: Usa un servidor local
   npx serve .
   ```

2. **¡A jugar!** 
   - Selecciona un planeta
   - ¡Derrota a todos los enemigos!

### Configuración para desarrollo

```bash
# Instalar dependencias (si usas un servidor local)
npm install

# Ejecutar servidor de desarrollo
npm start
```

---

## 📁 Estructura del Proyecto

```
proyectoJuego/
├── index.html              # Archivo principal del juego
├── css/
│   └── style.css          # Estilos y tema visual
├── js/
│   ├── main.js            # Loop principal del juego
│   ├── data.js            # Datos persistentes (puntos, progreso)
│   ├── entities.js        # Clases de naves, enemigos, proyectiles
│   ├── render.js          # Sistema de renderizado en canvas
│   ├── input.js           # Manejo de controles (teclado/táctil)
│   ├── audio.js           # Sistema de sonido
│   ├── ui.js              # Interfaz de usuario
│   ├── shop.js            # Sistema de tienda
│   └── persistence.js     # Guardado y carga de datos
├── assets/
│   └── naves.pixil        # Sprites de naves
└── README.md              # Este archivo
```

---

## 🛠 Tecnologías Utilizadas

- **HTML5** - Estructura del juego
- **CSS3** - Estilos y animaciones
- **JavaScript (Vanilla)** - Lógica del juego sin dependencias externas
- **Canvas 2D API** - Renderizado gráfico
- **Web Audio API** - Sistema de sonido
- **LocalStorage** - Persistencia de datos

---

## 📱 Compilación para Móvil (Capacitor)

Si quieres compilar el juego como aplicación móvil nativa:

```bash
# Instalar Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Inicializar Capacitor
npx cap init

# Compilar para Android
npx cap build android

# Abrir en Android Studio
npx cap open android
```

Para más detalles, consulta [capacitor-setup.md](capacitor-setup.md)

---

## 🎯 Cómo Jugar

1. **Selecciona un Planeta**: Elige tu nivel de dificultad
2. **Sobrevive**: Esquiva enemigos y dispara
3. **Acumula Puntos**: Derrota enemigos para ganar puntos
4. **Mejora tu Nave**: Usa los puntos en la tienda
5. **Derrota al Jefe**: Completa el nivel derrotando al enemigo final
6. **Repite**: Desbloquea nuevos niveles y mejoras

---

## 💾 Guardado de Progreso

El juego guarda automáticamente:
- Puntuación total
- Mejoras desbloqueadas
- Preferencias de sonido y controles
- Progreso de niveles

Los datos se almacenan en el `LocalStorage` del navegador.

---

## 🐛 Resolución de Problemas

**P: El juego no se inicia**
- Asegúrate de abrir `index.html` desde un servidor local, no directamente desde el archivo
- Comprueba que JavaScript está habilitado en tu navegador

**P: No funciona el sonido**
- Algunos navegadores requieren interacción del usuario antes de reproducir sonido
- Haz clic en el juego primero

**P: Los controles no responden**
- Presiona hacia adentro del juego para asegurar que tiene el enfoque
- En móvil, toca la pantalla para activar

---

## 👨‍💻 Autor

**Fernando Cañete** - Programador & Diseñador

---

## 📝 Licencia

Este proyecto es de código abierto. Siéntete libre de modificarlo y distribuirlo.

---

## 🎮 ¡Que disfrutes jugando!

¿Puedes alcanzar la puntuación más alta? 🏆

---

### Consejos para Jugadores

- 🎯 Mantente en movimiento para evitar balas
- 💪 Mejora tu arma en la tienda cuanto antes
- 💣 Usa las bombas para momentos críticos
- ⭐ Colecciona todas las recompensas desbloqueables
- 🔊 Juega con sonido para una mejor experiencia
