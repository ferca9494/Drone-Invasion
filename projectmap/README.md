# projectmap

Genera un mapa cognitivo del proyecto (`project.map`) para que un asistente de IA (LLM) pueda entender la estructura del código sin leer archivo por archivo.

## ¿Qué hace?

Analiza archivos JS/TS del proyecto, construye un grafo de llamadas entre funciones, calcula centralidad y prioridades, y genera:

- **`project.map`** — Mapa legible por humanos/IA con funciones, imports, exports, llamadas y prioridades.
- **`project.idx`** — Índice binario del grafo para consumo programático.
- **`.projectmap_cache/`** — Caché para evitar re-analizar archivos sin cambios.

## Requisitos

- Node.js 16+

## Instalación paso a paso

### 1. Agregar al proyecto raíz

Copia la carpeta `projectmap/` en la raíz de tu proyecto.

### 2. Instalar dependencias

```bash
cd projectmap
npm install
```

Esto instala `acorn` y `acorn-walk` (parser de JavaScript).

### 3. Agregar scripts npm (opcional pero recomendado)

En tu `package.json` raíz:

```json
"scripts": {
  "map": "node projectmap/bin/projectmap.js generate",
  "map:watch": "node projectmap/bin/projectmap.js watch"
}
```

### 4. Generar el mapa

```bash
npm run map
```

Esto crea `project.map` y `project.idx` en la raíz del proyecto.

### 5. (Opcional) Modo watch

```bash
npm run map:watch
```

Regenera automáticamente el mapa cuando cambian archivos `.js/.ts/.jsx/.tsx/.mjs/.cjs/.py/.cs`.

## Uso directo

```bash
node projectmap/bin/projectmap.js generate [ruta]
node projectmap/bin/projectmap.js watch [ruta]
```

Si no se especifica ruta, analiza el directorio actual.

## Archivos ignorados

`node_modules`, `.git`, `.svn`, `dist`, `build`, `.next`, `.projectmap_cache`, `projectmap`, `__pycache__`, `.cache`

## Integración con OpenCode/AI agents

El agente leerá `project.map` al inicio para entender la estructura del proyecto. Si no existe, pedirá ejecutar `npm run map`.

Ver `.opencode/project-map.plugin.md` para más detalles del protocolo.
