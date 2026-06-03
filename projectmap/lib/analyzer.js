const path = require('path');
const fs = require('fs');
const Graph = require('./graph');

const JS_PARSER = require('../parsers/js-parser');

const PARSERS = [JS_PARSER];

const IGNORE_DIRS = new Set([
  'node_modules', '.git', '.svn', 'dist', 'build', '.next',
  '.projectmap_cache', 'projectmap', '__pycache__', '.cache',
]);

const IGNORE_FILES = new Set(['package-lock.json', 'yarn.lock']);

const DOM_APIS = new Set([
  'document.getElementById', 'document.querySelector', 'document.querySelectorAll',
  'document.createElement', 'document.addEventListener', 'window.addEventListener',
  'element.addEventListener', 'console.log', 'console.error', 'console.warn',
  'JSON.parse', 'JSON.stringify', 'fetch', 'Math.round', 'Math.floor',
  'Math.ceil', 'Math.max', 'Math.min', 'Math.abs', 'Math.random',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'fs.existsSync', 'fs.mkdirSync', 'fs.readFileSync', 'fs.writeFileSync',
  'fs.unlinkSync', 'fs.readdirSync', 'fs.statSync', 'fs.watch',
  'path.join', 'path.resolve', 'path.extname', 'path.basename',
  'path.relative', 'path.dirname', 'path.parse',
  'Buffer.from', 'String().trim', 'Array.isArray',
  'Object.keys', 'Object.values', 'Object.entries',
  'Promise.resolve', 'Promise.reject',
  'confirm', 'prompt', 'alert',
]);

module.exports = class Analyzer {
  constructor(projectRoot, cache) {
    this.projectRoot = projectRoot;
    this.cache = cache;
    this.files = [];
    this.parsedFiles = new Map();
  }

  async analyze() {
    this._discoverFiles(this.projectRoot);
    console.log(`[projectroot] Found ${this.files.length} files to analyze`);
    await this._parseFiles();

    const graph = new Graph();
    this._buildGraph(graph);
    this._linkFileData(graph);
    graph.computeCentrality();

    const entryPoints = this._findEntryPoints(graph);
    graph.computePriorities(entryPoints);

    return graph;
  }

  _discoverFiles(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const base = path.basename(fullPath);
        if (!IGNORE_DIRS.has(base) && !base.startsWith('.')) {
          this._discoverFiles(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(fullPath).toLowerCase();
        const base = path.basename(fullPath);
        if (IGNORE_FILES.has(base)) continue;
        if (PARSERS.some(p => p.isSupported && p.isSupported(fullPath))) {
          this.files.push(fullPath);
        }
      }
    }
  }

  async _parseFiles() {
    for (const filePath of this.files) {
      const cached = this.cache?.get(filePath);
      if (cached) {
        this.parsedFiles.set(filePath, cached);
        continue;
      }
      let code;
      try {
        code = fs.readFileSync(filePath, 'utf-8');
      } catch {
        continue;
      }
      let result = null;
      if (JS_PARSER.isSupported(filePath)) {
        result = JS_PARSER.parseFile(filePath, code);
      }
      if (result) {
        this.parsedFiles.set(filePath, result);
        this.cache?.set(filePath, result);
      }
    }
    console.log(`[projectmap] Parsed ${this.parsedFiles.size} files`);
  }

  _buildGraph(graph) {
    const fileImportsMap = new Map();

    for (const [filePath, parsed] of this.parsedFiles) {
      for (const fn of parsed.functions) {
        const fullName = fn.name || `anon_${fn.id}`;
        graph.addNode(fullName, {
          file: filePath,
          line: fn.line,
          params: fn.params,
          calls: fn.calls,
          exported: fn.exported,
          isAsync: fn.isAsync,
          throws: fn.throws,
        });
      }
      fileImportsMap.set(filePath, {
        imports: parsed.imports,
        exports: parsed.exports,
      });
    }

    const classNameMap = new Map();
    for (const node of graph.nodes) {
      const dotIdx = node.name.indexOf('.');
      if (dotIdx > 0) {
        const cls = node.name.substring(0, dotIdx);
        classNameMap.set(cls, true);
      }
    }

    for (const [, parsed] of this.parsedFiles) {
      for (const fn of parsed.functions) {
        const fnName = fn.name || `anon_${fn.id}`;
        if (!graph.hasNode(fnName)) continue;

        for (const call of fn.calls) {
          if (DOM_APIS.has(call)) continue;
          if (call.startsWith('new ')) {
            const ctor = call.substring(4);
            if (graph.hasNode(ctor)) {
              graph.addEdge(fnName, ctor);
            } else if (graph.hasNode(`${ctor}.constructor`)) {
              graph.addEdge(fnName, `${ctor}.constructor`);
            }
            continue;
          }

          const resolved = this._resolveCall(call, fnName, graph, classNameMap, fileImportsMap);
          if (resolved && resolved !== fnName) {
            graph.addEdge(fnName, resolved);
          }
        }
      }
    }
  }

  _resolveCall(callName, callerName, graph, classNameMap, fileImportsMap) {
    if (!callName || callName.startsWith('_')) return null;

    if (graph.hasNode(callName)) {
      if (callName !== callerName) {
        const callerClass = callerName.includes('.') ? callerName.split('.')[0] : null;
        if (callerClass) {
          const classMethod = `${callerClass}.${callName}`;
          if (graph.hasNode(classMethod)) return classMethod;
        }
        if (!callName.includes('.')) {
          for (const node of graph.nodes) {
            const parts = node.name.split('.');
            if (parts.length > 1 && parts[parts.length - 1] === callName && parts[0] === callerClass) {
              return node.name;
            }
          }
        }
        return callName;
      }
      return null;
    }

    if (callName.startsWith('this.')) {
      return this._resolveThisCall(callName, callerName, graph);
    }

    if (classNameMap.has(callName)) return null;

    const resolved = this._resolveSimpleCall(callName, callerName, graph);
    if (resolved) return resolved;

    return null;
  }

  _resolveThisCall(callName, callerName, graph) {
    const method = callName.substring(5);
    const callerClass = callerName.includes('.') ? callerName.split('.')[0] : null;
    if (callerClass) {
      const fullName = `${callerClass}.${method}`;
      if (graph.hasNode(fullName)) return fullName;
    }
    for (const node of graph.nodes) {
      const nodeMethod = node.name.split('.').slice(1).join('.');
      if (nodeMethod === method) return node.name;
    }
    return null;
  }

  _resolveSimpleCall(callName, callerName, graph) {
    const callerClass = callerName.includes('.') ? callerName.split('.')[0] : null;

    if (callerClass) {
      const asClassMethod = `${callerClass}.${callName}`;
      if (graph.hasNode(asClassMethod)) return asClassMethod;
    }

    let best = null;
    let bestParts = -1;
    for (const node of graph.nodes) {
      const parts = node.name.split('.');
      const simpleName = parts[parts.length - 1];
      if (simpleName === callName && callerName !== node.name) {
        if (!callerClass && parts.length === 1) return node.name;
        if (parts.length === 1) {
          best = node.name;
          bestParts = 1;
        } else if (parts.length > bestParts) {
          if (callerClass && parts[0] === callerClass) return node.name;
          if (parts.length > bestParts) {
            best = node.name;
            bestParts = parts.length;
          }
        }
      }
    }
    return best || null;
  }

  _linkFileData(graph) {
    for (const [filePath, parsed] of this.parsedFiles) {
      for (const node of graph.nodes) {
        if (node.file === filePath) {
          const imports = parsed.imports.map(i => i.source);
          const exports = parsed.exports;
          node.fileImports = [...new Set(imports)];
          node.fileExports = [...new Set(exports)];
        }
      }
    }
  }

  _findEntryPoints(graph) {
    const called = new Set();
    for (const edge of graph.edges) {
      called.add(edge.to);
      const from = edge.from;
    }

    const entryPoints = [];
    for (const node of graph.nodes) {
      if (node.exported && !called.has(node.name)) {
        entryPoints.push(node.name);
      }
    }

    for (const node of graph.nodes) {
      const hasOutgoing = (graph.adjList.get(node.name)?.length || 0) > 0;
      if (!called.has(node.name) && hasOutgoing) {
        if (!entryPoints.includes(node.name)) entryPoints.push(node.name);
      }
    }

    for (const node of graph.nodes) {
      const base = node.name.includes('.') ? node.name.split('.')[1] : node.name;
      if (['main', 'start', 'run', 'init', 'setup', 'createWindow'].includes(base)) {
        if (!entryPoints.includes(node.name)) entryPoints.push(node.name);
      }
    }

    return entryPoints;
  }
};
