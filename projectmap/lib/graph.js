module.exports = class Graph {
  constructor() {
    this.nodes = [];
    this.edges = [];
    this.nodeMap = new Map();
    this.adjList = new Map();
    this.edgeSet = new Set();
  }

  addNode(name, data) {
    if (this.nodeMap.has(name)) return this.nodeMap.get(name);
    const id = this.nodes.length + 1;
    const node = { id: `N${id}`, name, ...data, centrality: 0, priority: 'LOW' };
    this.nodes.push(node);
    this.nodeMap.set(name, node);
    this.adjList.set(name, []);
    return node;
  }

  addEdge(from, to, type = 'call') {
    if (!this.nodeMap.has(from) || !this.nodeMap.has(to)) return;
    const key = `${from}>${to}`;
    if (this.edgeSet.has(key)) return;
    this.edgeSet.add(key);
    const edge = { from, to, type };
    this.edges.push(edge);
    this.adjList.get(from).push(to);
  }

  getNode(name) {
    return this.nodeMap.get(name) || null;
  }

  hasNode(name) {
    return this.nodeMap.has(name);
  }

  computeCentrality() {
    const names = this.nodes.map(n => n.name);
    const n = names.length;
    if (n === 0) return;

    const idx = new Map();
    names.forEach((name, i) => idx.set(name, i));

    let matrix = Array.from({ length: n }, () => Array(n).fill(0));
    for (const edge of this.edges) {
      const i = idx.get(edge.from);
      const j = idx.get(edge.to);
      if (i !== undefined && j !== undefined) {
        matrix[i][j] = 1;
      }
    }

    let total = Array(n).fill(0);
    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (matrix[i][k] && matrix[k][j]) {
            if (matrix[i][j] === 0 || matrix[i][k] + matrix[k][j] < matrix[i][j]) {
              matrix[i][j] = matrix[i][k] + matrix[k][j];
            }
          }
        }
      }
    }

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && matrix[i][j] > 0) {
          total[i] += 1 / matrix[i][j];
        }
      }
    }

    const max = Math.max(...total, 1);
    for (let i = 0; i < n; i++) {
      this.nodes[i].centrality = Math.round((total[i] / max) * 100) / 100;
    }
  }

  computePriorities(entryPoints) {
    const callCount = new Map();
    for (const edge of this.edges) {
      callCount.set(edge.to, (callCount.get(edge.to) || 0) + 1);
    }

    const fanOut = new Map();
    for (const [from, tos] of this.adjList) {
      fanOut.set(from, tos.length);
    }

    for (const node of this.nodes) {
      let score = 0;
      score += (callCount.get(node.name) || 0) * 2;
      score += (fanOut.get(node.name) || 0) * 1.5;
      if (entryPoints.includes(node.name)) score += 5;
      score += (node.centrality || 0) * 3;
      if (node.exported) score += 2;

      if (score >= 8) node.priority = 'HIGH';
      else if (score >= 3) node.priority = 'MID';
      else node.priority = 'LOW';
    }
  }

  toJSON() {
    return {
      nodes: this.nodes,
      edges: this.edges,
    };
  }
};
