const { parse } = require('acorn');
const walk = require('acorn-walk');

const SUPPORTED_EXTS = ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'];

function isSupported(filePath) {
  const ext = require('path').extname(filePath).toLowerCase();
  return SUPPORTED_EXTS.includes(ext);
}

function parseFile(filePath, code) {
  const functions = [];
  const imports = [];
  const exports = [];

  const isModule = filePath.endsWith('.mjs') || filePath.endsWith('.mts');
  let ast;

  try {
    ast = parse(code, {
      ecmaVersion: 'latest',
      sourceType: isModule ? 'module' : 'unambiguous',
      locations: true,
      ranges: true,
    });
  } catch (err) {
    try {
      ast = parse(code, {
        ecmaVersion: 'latest',
        sourceType: 'script',
        locations: true,
        ranges: true,
      });
    } catch (err2) {
      console.warn(`  [warn] Failed to parse ${filePath}: ${err.message}`);
      return { functions, imports, exports };
    }
  }

  walk.simple(ast, {
    ImportDeclaration(node) {
      const source = node.source.value;
      for (const spec of node.specifiers) {
        imports.push({
          source,
          local: spec.local?.name,
          imported: spec.type === 'ImportDefaultSpecification' ? 'default'
            : spec.type === 'ImportNamespaceSpecification' ? '*'
            : spec.imported?.name || spec.local?.name,
        });
      }
      if (node.specifiers.length === 0) {
        imports.push({ source, local: null, imported: null });
      }
    },

    ExportNamedDeclaration(node) {
      _collectExports(node.declaration, exports);
      if (node.specifiers) {
        for (const spec of node.specifiers) {
          exports.push(spec.exported?.name || spec.local?.name);
        }
      }
    },

    ExportDefaultDeclaration(node) {
      _collectExports(node.declaration, exports);
      if (node.declaration && !['FunctionDeclaration', 'ClassDeclaration'].includes(node.declaration.type)) {
        exports.push('default');
      }
    },

    ExportAllDeclaration(node) {
      exports.push(`*:${node.source.value}`);
    },
  });

  const allNodes = [];
  walk.full(ast, (node) => { allNodes.push(node); });

  const funcNodes = [];

  for (const node of allNodes) {
    if (node.type === 'ClassDeclaration' && node.id?.name) {
      exports.push(node.id.name);
      for (const member of node.body?.body || []) {
        if (member.type === 'MethodDefinition' && member.value && member.value.range) {
          const methodName = member.key?.name || '(computed)';
          const fullName = `${node.id.name}.${methodName}`;
          funcNodes.push({
            name: fullName,
            node: member.value,
            range: member.value.range,
            line: member.value.loc?.start?.line || 0,
          });
        }
      }
    }
  }

  for (const node of allNodes) {
    if (node.type === 'FunctionDeclaration' && node.id && node.range) {
      funcNodes.push({
        name: node.id.name,
        node,
        range: node.range,
        line: node.loc?.start?.line || 0,
      });
    }
  }

  for (const node of allNodes) {
    if (node.type === 'VariableDeclarator') {
      const init = node.init;
      if (init && (init.type === 'FunctionExpression' || init.type === 'ArrowFunctionExpression') && init.range) {
        const name = _varDeclName(node) || `anon_${funcNodes.length}`;
        funcNodes.push({
          name, node: init,
          range: init.range,
          line: init.loc?.start?.line || 0,
        });
      }
    }
  }

  for (const node of allNodes) {
    if (node.type === 'Property' && (node.value?.type === 'FunctionExpression' || node.value?.type === 'ArrowFunctionExpression') && node.value.range) {
      const propName = node.key?.name || node.key?.value || '(computed)';
      funcNodes.push({
        name: propName, node: node.value,
        range: node.value.range,
        line: node.value.loc?.start?.line || 0,
      });
    }
  }

  for (const node of allNodes) {
    if (node.type === 'AssignmentExpression' && (node.right?.type === 'FunctionExpression' || node.right?.type === 'ArrowFunctionExpression') && node.right.range) {
      const target = _memberExprToString(node.left);
      if (target && !target.includes('[')) {
        funcNodes.push({
          name: target, node: node.right,
          range: node.right.range,
          line: node.right.loc?.start?.line || 0,
        });
      }
    }
  }

  for (const fn of funcNodes) {
    functions.push({
      name: fn.name,
      file: filePath,
      line: fn.line,
      params: (fn.node.params || []).map(p => _paramToString(p)),
      calls: [],
      exported: false,
      isAsync: fn.node.async || false,
      isGenerator: fn.node.generator || false,
      hasReturn: false,
      throws: false,
    });
  }

  const callExprs = [];
  for (const node of allNodes) {
    if (node.type === 'CallExpression' && node.range) {
      const callee = _memberExprToString(node.callee);
      if (callee) callExprs.push({ callee, range: node.range });
    }
    if (node.type === 'NewExpression' && node.range) {
      const callee = _memberExprToString(node.callee);
      if (callee) callExprs.push({ callee: `new ${callee}`, range: node.range });
    }
  }

  const returnRanges = [];
  const throwRanges = [];
  for (const node of allNodes) {
    if (node.type === 'ReturnStatement' && node.range) returnRanges.push(node.range);
    if (node.type === 'ThrowStatement' && node.range) throwRanges.push(node.range);
  }

  for (const call of callExprs) {
    const idx = _findContainingFunc(funcNodes, call.range[0], call.range[1]);
    if (idx !== -1 && !functions[idx].calls.includes(call.callee)) {
      functions[idx].calls.push(call.callee);
    }
  }

  for (const rng of returnRanges) {
    const idx = _findContainingFunc(funcNodes, rng[0], rng[1]);
    if (idx !== -1) functions[idx].hasReturn = true;
  }

  for (const rng of throwRanges) {
    const idx = _findContainingFunc(funcNodes, rng[0], rng[1]);
    if (idx !== -1) functions[idx].throws = true;
  }

  return { functions, imports, exports };
}

function _findContainingFunc(funcNodes, start, end) {
  let best = -1;
  let bestSize = Infinity;
  for (let i = 0; i < funcNodes.length; i++) {
    const [rStart, rEnd] = funcNodes[i].range;
    if (rStart <= start && rEnd >= end) {
      const size = rEnd - rStart;
      if (size < bestSize) {
        bestSize = size;
        best = i;
      }
    }
  }
  return best;
}

function _paramToString(p) {
  if (!p) return '?';
  if (p.type === 'Identifier') return p.name;
  if (p.type === 'AssignmentPattern') return `${p.left?.name || '?'}=${p.right?.name || p.right?.value || '?'}`;
  if (p.type === 'ObjectPattern') return '{' + p.properties.map(pp => pp.key?.name || pp.value?.name || '?').join(',') + '}';
  if (p.type === 'ArrayPattern') return '[' + p.elements.map(e => e?.name || '?').join(',') + ']';
  if (p.type === 'RestElement') return `...${p.argument?.name || '?'}`;
  return p.name || '?';
}

function _varDeclName(node) {
  if (!node.id) return null;
  if (node.id.type === 'Identifier') return node.id.name;
  if (node.id.type === 'MemberExpression') return _memberExprToString(node.id);
  return '?';
}

function _memberExprToString(node) {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression') {
    const obj = _memberExprToString(node.object);
    const prop = node.computed
      ? (node.property?.value ?? node.property?.name ?? '?')
      : (node.property?.name ?? '?');
    if (!obj) return prop;
    if (obj === 'this') return prop;
    return `${obj}.${prop}`;
  }
  if (node.type === 'CallExpression') {
    const callee = _memberExprToString(node.callee);
    return callee ? `${callee}()` : null;
  }
  return null;
}

function _collectExports(node, exports) {
  if (!node) return;
  if (node.type === 'FunctionDeclaration' && node.id) {
    exports.push(node.id.name);
  } else if (node.type === 'ClassDeclaration' && node.id) {
    exports.push(node.id.name);
  } else if (node.type === 'VariableDeclaration') {
    for (const decl of node.declarations) {
      const name = _varDeclName(decl);
      if (name) exports.push(name);
    }
  } else if (node.type === 'AssignmentExpression') {
    const name = _memberExprToString(node.left);
    if (name) exports.push(name);
  }
}

module.exports = { parseFile, isSupported };
