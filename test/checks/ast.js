/**
 * JS V8 AST Syntax, Export/Import Matching, Circular Graph & Unimported Symbols Checker
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { rootDir, checkState, addError, addWarning, getAllFiles } from './context.js';

export function extractModuleSignatures(code) {
  const exports = new Set();
  const imports = [];
  let hasExportAll = false;

  const namedDeclRegex = /export\s+(?:async\s+)?(?:function\*?|class|const|let|var)\s+([a-zA-Z0-9_$]+)/g;
  let match;
  while ((match = namedDeclRegex.exec(code)) !== null) {
    exports.add(match[1]);
  }

  const exportBlockRegex = /export\s*\{([^}]+)\}(?:\s*from\s*['"]([^'"]+)['"])?/g;
  while ((match = exportBlockRegex.exec(code)) !== null) {
    const items = match[1].split(',').map(s => s.trim()).filter(Boolean);
    for (const item of items) {
      const parts = item.split(/\s+as\s+/);
      exports.add((parts[1] || parts[0]).trim());
    }
  }

  if (/export\s*\*\s*from/g.test(code)) hasExportAll = true;
  if (/export\s+default\b/.test(code)) exports.add('default');

  const importBlockRegex = /import\s+(?:type\s+)?(?:(\*\s+as\s+\w+|\w+)\s*,?\s*)?(?:\{([^}]+)\})?\s*from\s*['"]([^'"]+)['"]/g;
  while ((match = importBlockRegex.exec(code)) !== null) {
    const defaultOrStar = match[1];
    const namedBlock = match[2];
    const fromPath = match[3];

    const names = [];
    if (defaultOrStar) {
      names.push(defaultOrStar.startsWith('* as') ? '*' : 'default');
    }
    if (namedBlock) {
      for (const item of namedBlock.split(',').map(s => s.trim()).filter(Boolean)) {
        names.push(item.split(/\s+as\s+/)[0].trim());
      }
    }
    imports.push({ names, from: fromPath });
  }

  return { exports, imports, hasExportAll };
}

export function validateJsFile(filePath) {
  checkState.totalFilesChecked++;
  const code = fs.readFileSync(filePath, 'utf8');

  const sig = extractModuleSignatures(code);
  checkState.moduleMap.set(filePath, sig);

  const currentNeighbors = checkState.importGraph.get(filePath) || new Set();
  for (const imp of sig.imports) {
    if (imp.from.startsWith('.')) {
      currentNeighbors.add(path.resolve(path.dirname(filePath), imp.from));
    }
  }
  checkState.importGraph.set(filePath, currentNeighbors);

  try {
    const sanitized = code
      .replace(/^[ \t]*import\s+type\s+.*?from\s+['"].*?['"];?/gm, '/* import type */')
      .replace(/^[ \t]*import\s+['"][^'"]+['"];?/gm, '/* side-effect import */')
      .replace(/^[ \t]*import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/gm, (m) => '/* ' + m.replace(/\*\//g, '* /') + ' */')
      .replace(/^[ \t]*export\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/gm, (m) => '/* ' + m.replace(/\*\//g, '* /') + ' */')
      .replace(/^[ \t]*export\s+default\s+/gm, 'const __default_exp = ')
      .replace(/^[ \t]*export\s+(async\s+function|function|class|const|let|var)\s+/gm, '$1 ')
      .replace(/^[ \t]*export\s*\{[\s\S]*?\}\s*;?/gm, '/* export block */');

    new vm.Script(sanitized, { filename: filePath });
  } catch (err) {
    addError(path.relative(rootDir, filePath), `Lỗi cú pháp V8: ${err.message}`);
  }

  for (const imp of sig.imports) {
    if (imp.from.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filePath), imp.from);
      if (!fs.existsSync(resolved)) {
        addError(path.relative(rootDir, filePath), `Đường dẫn import không tồn tại: "${imp.from}"`);
      }
    }
  }
}

export function validateNamedExports() {
  for (const [filePath, sig] of checkState.moduleMap.entries()) {
    for (const imp of sig.imports) {
      if (!imp.from.startsWith('.')) continue;
      const targetPath = path.resolve(path.dirname(filePath), imp.from);
      if (!checkState.moduleMap.has(targetPath)) continue;

      const targetSig = checkState.moduleMap.get(targetPath);
      if (targetSig.hasExportAll) continue;

      for (const name of imp.names) {
        if (name === '*' || name === 'default') continue;
        if (!targetSig.exports.has(name)) {
          addError(
            path.relative(rootDir, filePath),
            `Hàm/Biến "${name}" được import từ "${imp.from}" nhưng "${path.basename(targetPath)}" KHÔNG export nó!`
          );
        }
      }
    }
  }
}

export function checkCircularDependencies() {
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node, pathStack = []) {
    visited.add(node);
    recursionStack.add(node);
    pathStack.push(node);

    const neighbors = checkState.importGraph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, pathStack);
      } else if (recursionStack.has(neighbor)) {
        const cycleStartIndex = pathStack.indexOf(neighbor);
        const cycle = pathStack.slice(cycleStartIndex).map(p => path.relative(rootDir, p)).concat(path.relative(rootDir, neighbor));
        addWarning(path.relative(rootDir, node), `Phát hiện vòng lặp Import (Circular Cycle): ${cycle.join(' ➔ ')}`);
      }
    }

    recursionStack.delete(node);
    pathStack.pop();
  }

  for (const node of checkState.importGraph.keys()) {
    if (!visited.has(node)) dfs(node);
  }
}

export function validateUnimportedSymbols() {
  const allProjectExports = new Set();
  for (const [filePath, sig] of checkState.moduleMap.entries()) {
    const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
    if (!rel.startsWith('src/')) continue;
    for (const exp of sig.exports) {
      allProjectExports.add(exp);
    }
  }

  const IGNORE = new Set([
    'default', 'State', 'Rating', 'FSRS', 'init', 'state', 'render',
    'open', 'close', 'stop', 'start', 'reset', 'clear', 'data', 'app',
    'id', 'name', 'type', 'key', 'value', 'mode'
  ]);

  const jsDir = path.join(rootDir, 'src', 'js');
  const jsFiles = getAllFiles(jsDir).filter(f => f.endsWith('.js'));

  for (const filePath of jsFiles) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');

    const imported = new Set();
    const importRegex = /import\s+(?:(\*\s+as\s+\w+|\w+)\s*,?\s*)?(?:\{([^}]+)\})?\s*from\s*['"][^'"]+['"]/g;
    let m;
    while ((m = importRegex.exec(raw)) !== null) {
      if (m[1]) imported.add(m[1].replace(/^\*\s+as\s+/, '').trim());
      if (m[2]) {
        m[2].split(',').forEach(item => {
          const parts = item.trim().split(/\s+as\s+/);
          const localName = (parts[1] || parts[0]).trim();
          if (localName) imported.add(localName);
        });
      }
    }

    const noComments = raw
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/[^\n]*/g, ' ');

    const localDecls = new Set();
    for (const dm of noComments.matchAll(/\b(?:function\*?|class|const|let|var)\s+([a-zA-Z0-9_$]+)/g)) {
      localDecls.add(dm[1]);
    }
    for (const mm of noComments.matchAll(/^[ \t]*(?:static\s+|async\s+|get\s+|set\s+)*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*\{/gm)) {
      if (!['if', 'for', 'while', 'switch', 'catch'].includes(mm[1])) {
        localDecls.add(mm[1]);
      }
    }
    for (const destruct of noComments.matchAll(/\b(?:const|let|var)\s*[\[{]([^\]}]+)[\]}]/g)) {
      destruct[1].split(',').forEach(part => {
        const cleaned = part.split('=')[0].split(':').pop().trim();
        if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(cleaned)) localDecls.add(cleaned);
      });
    }
    for (const pm of noComments.matchAll(/\bcatch\s*\(\s*(_[a-zA-Z0-9_$]+)\s*\)/g)) {
      localDecls.add(pm[1]);
    }
    for (const fp of noComments.matchAll(/(?:function[^(]*|=>)\s*\(([^)]*)\)|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\{/g)) {
      const args = fp[1] || fp[3] || '';
      for (const am of args.matchAll(/\b(_[a-zA-Z0-9_$]+)\b/g)) localDecls.add(am[1]);
    }
    for (const am of noComments.matchAll(/\b(_[a-zA-Z0-9_$]+)\s*=>/g)) {
      localDecls.add(am[1]);
    }

    let clean = noComments.replace(/(['"])(?:\\.|(?!\1)[^\\\n])*\1/g, ' "" ');
    clean = clean.replace(/`(?:\\[\s\S]|\$\{[^}]*\}|[^`\\])*`/g, (tpl) => {
      const exprs = [];
      for (const em of tpl.matchAll(/\$\{([^}]*)\}/g)) exprs.push(em[1]);
      return ' ' + exprs.join(' ') + ' ';
    });

    clean = clean
      .replace(/^[ \t]*(?:import|export)\s+[\s\S]*?;?\s*$/gm, ' ')
      .replace(/\.[a-zA-Z0-9_$]+/g, ' ')
      .replace(/(^|[,{\s])([a-zA-Z0-9_$]+)\s*:(?!:)/g, '$1 ');

    const missing = new Set();
    for (const tm of clean.matchAll(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g)) {
      const tok = tm[1];
      if (allProjectExports.has(tok) && !IGNORE.has(tok) && !imported.has(tok) && !localDecls.has(tok)) {
        missing.add(tok);
      } else if (tok.startsWith('_') && tok !== '_' && !tok.startsWith('__') && !tok.startsWith('_0x') && !imported.has(tok) && !localDecls.has(tok)) {
        missing.add(tok);
      }
    }

    if (missing.size > 0) {
      addError(rel, `Phát hiện symbol chưa được import hoặc khai báo cục bộ: ${[...missing].join(', ')}`);
    }
  }
}

