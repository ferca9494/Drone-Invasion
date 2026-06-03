#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const LIB = path.join(ROOT, 'lib');

const Analyzer = require(path.join(LIB, 'analyzer'));
const Formatter = require(path.join(LIB, 'formatter'));
const Cache = require(path.join(LIB, 'cache'));

const cmd = process.argv[2];
const projectRoot = process.argv[3] || process.cwd();

async function main() {
  switch (cmd) {
    case 'generate': {
      console.log(`[projectmap] Analyzing ${projectRoot}...`);
      const cache = new Cache(projectRoot);
      const analyzer = new Analyzer(projectRoot, cache);
      const graph = await analyzer.analyze();
      const formatter = new Formatter(projectRoot);
      formatter.write(graph);
      console.log(`[projectmap] Done. ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
      break;
    }
    case 'watch': {
      console.log(`[projectmap] Watching ${projectRoot}...`);
      const cache = new Cache(projectRoot);
      const analyzer = new Analyzer(projectRoot, cache);
      let graph = await analyzer.analyze();
      const formatter = new Formatter(projectRoot);
      formatter.write(graph);
      console.log(`[projectmap] Initial map generated. Watching for changes...`);

      const watcher = fs.watch(projectRoot, { recursive: true }, async (event, filename) => {
        if (!filename) return;
        const ext = path.extname(filename);
        if (!['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.py', '.cs'].includes(ext)) return;
        const fullPath = path.join(projectRoot, filename);
        if (!fs.existsSync(fullPath)) return;
        console.log(`[projectmap] Change detected: ${filename}`);
        cache.invalidate(filename);
        graph = await analyzer.analyze();
        formatter.write(graph);
        console.log(`[projectmap] Updated. ${graph.nodes.length} nodes`);
      });

      process.on('SIGINT', () => {
        watcher.close();
        process.exit(0);
      });

      break;
    }
    default: {
      console.log('Usage:');
      console.log('  projectmap generate [path]   Generate project.map');
      console.log('  projectmap watch [path]      Watch and auto-update');
      break;
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
