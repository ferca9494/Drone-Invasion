const path = require('path');
const fs = require('fs');

module.exports = class Formatter {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.mapPath = path.join(projectRoot, 'project.map');
    this.idxPath = path.join(projectRoot, 'project.idx');
  }

  write(graph) {
    this._writeMap(graph);
    this._writeIdx(graph);
  }

  _writeMap(graph) {
    const lines = [];
    lines.push('; project.map — Cognitive project map for LLM');
    lines.push(`; Generated: ${new Date().toISOString()}`);
    lines.push(`; Nodes: ${graph.nodes.length}, Edges: ${graph.edges.length}`);
    lines.push('');

    const entryPoints = graph.nodes.filter(n => {
      if (n.exported) return true;
      const isCalled = graph.edges.some(e => e.to === n.name);
      return !isCalled && graph.adjList.get(n.name)?.length > 0;
    });

    if (entryPoints.length) {
      lines.push('; === ENTRY POINTS ===');
      for (const ep of entryPoints) {
        lines.push(`;  ${ep.id} ${ep.name}`);
      }
      lines.push('');
    }

    const files = new Map();
    for (const node of graph.nodes) {
      if (!node.file) continue;
      if (!files.has(node.file)) files.set(node.file, []);
      files.get(node.file).push(node);
    }

    for (const [filePath, funcs] of files) {
      const relPath = path.relative(this.projectRoot, filePath).replace(/\\/g, '/');
      lines.push(`FILE:${relPath}`);

      const fileImports = funcs[0]?.fileImports || [];
      if (fileImports.length) {
        lines.push(`  IMP:${fileImports.join(',')}`);
      }

      const fileExports = funcs[0]?.fileExports || [];
      if (fileExports.length) {
        lines.push(`  EXP:${fileExports.join(',')}`);
      }

      for (const fn of funcs) {
        const p = fn.priority || 'LOW';
        lines.push(`  F:${fn.id}:${fn.name}`);
        lines.push(`    P:${p}`);

        if (fn.params && fn.params.length) {
          lines.push(`    I:${fn.params.join(',')}`);
        }

        if (fn.calls && fn.calls.length) {
          const mappedCalls = fn.calls
            .map(c => {
              const target = graph.getNode(c);
              return target ? `${target.id}:${c}` : c;
            })
            .join(',');
          lines.push(`    C:${mappedCalls}`);
        }

        if (fn.isAsync) lines.push(`    A:async`);
        if (fn.throws) lines.push(`    A:throws`);
        if (fn.exported) lines.push(`    A:exported`);
      }
      lines.push('');
    }

    lines.push('; === GRAPH EDGES ===');
    for (const edge of graph.edges) {
      const fromNode = graph.getNode(edge.from);
      const toNode = graph.getNode(edge.to);
      if (fromNode && toNode) {
        lines.push(`${fromNode.id}>${toNode.id} ; ${edge.from} -> ${edge.to}`);
      } else if (fromNode) {
        lines.push(`${fromNode.id}>${edge.to} ; ${edge.from} -> ${edge.to}`);
      }
    }
    lines.push('');

    lines.push('; === COMPRESSED ===');
    const compressed = [];
    for (const edge of graph.edges) {
      const fromNode = graph.getNode(edge.from);
      const toNode = graph.getNode(edge.to);
      if (fromNode && toNode) {
        compressed.push(`${fromNode.id}>${toNode.id}`);
      }
    }
    lines.push(compressed.join(' '));
    lines.push('');

    lines.push('; === NODE INDEX ===');
    for (const node of graph.nodes) {
      lines.push(`${node.id}=${node.name}`);
    }

    fs.writeFileSync(this.mapPath, lines.join('\n'), 'utf-8');
    console.log(`[projectmap] Written ${this.mapPath} (${Buffer.byteLength(lines.join('\n'), 'utf-8')} bytes)`);
  }

  _writeIdx(graph) {
    const buf = Buffer.alloc(4 + graph.nodes.length * 12 + graph.edges.length * 8);
    let offset = 0;

    buf.writeUInt16LE(graph.nodes.length, offset);
    offset += 2;
    buf.writeUInt16LE(graph.edges.length, offset);
    offset += 2;

    for (const node of graph.nodes) {
      const idNum = parseInt(node.id.replace('N', ''));
      buf.writeUInt16LE(idNum, offset);
      offset += 2;
      buf.writeUInt8(node.priority === 'HIGH' ? 2 : node.priority === 'MID' ? 1 : 0, offset);
      offset += 1;
      buf.writeUInt8(node.centrality * 100, offset);
      offset += 1;
      buf.writeUInt16LE(node.params?.length || 0, offset);
      offset += 2;
      buf.writeUInt16LE(node.calls?.length || 0, offset);
      offset += 2;
      buf.writeUInt16LE(node.line || 0, offset);
      offset += 2;
    }

    for (const edge of graph.edges) {
      const fromNode = graph.getNode(edge.from);
      const toNode = graph.getNode(edge.to);
      if (fromNode && toNode) {
        const fromId = parseInt(fromNode.id.replace('N', ''));
        const toId = parseInt(toNode.id.replace('N', ''));
        buf.writeUInt16LE(fromId, offset);
        offset += 2;
        buf.writeUInt16LE(toId, offset);
        offset += 2;
        buf.writeUInt16LE(0, offset);
        offset += 2;
        buf.writeUInt16LE(0, offset);
        offset += 2;
      }
    }

    fs.writeFileSync(this.idxPath, buf);
    console.log(`[projectmap] Written ${this.idxPath} (${buf.length} bytes)`);
  }
};
