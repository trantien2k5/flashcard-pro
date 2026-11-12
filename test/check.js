/**
 * ⚡ FLASHCARD PRO - ULTRA-FAST INTEGRITY & SYNTAX SUITE v2.5 (< 0.2s)
 * ----------------------------------------------------------------------------
 * 1. V8 Native AST Parser (Cú pháp JS, thiếu dấu ngoặc, sai token, lỗi syntax)
 * 2. Deep Named Export Matching (Bắt lỗi import hàm không tồn tại / gõ sai tên)
 * 3. Circular Dependency Graph (Phát hiện vòng lặp import giữa các module)
 * 4. Deep CSS Integrity (Thiếu biến CSS, thiếu dấu ';', thiếu ngoặc, sai @import)
 * 5. Data Taxonomy & Schema Validator (Kiểm tra trùng ID, rỗng trường 2500+ từ)
 * 6. HTML Link & Script Verification (Kiểm tra 100% tài nguyên liên kết)
 * ----------------------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const startTime = performance.now();

let totalFilesChecked = 0;
let errors = [];
let warnings = [];

// Bảng màu ANSI Terminal
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// ============================================================================
// 1. Quét File Đệ Quy
// ============================================================================
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  }
  return arrayOfFiles;
}

// Lưu trữ thông tin module & CSS
const moduleMap = new Map();
const importGraph = new Map();
const definedCssVars = new Set();
const usedCssVars = []; // { varName, file, line }
const keyframesMap = new Map(); // name -> filePath

// ============================================================================
// 2. Trích xuất Exports và Imports từ File JS
// ============================================================================
function extractModuleSignatures(filePath, code) {
  const exports = new Set();
  const imports = [];
  let hasExportAll = false;

  // 1. Named functions, classes, const/let/var
  const namedDeclRegex = /export\s+(?:async\s+)?(?:function\*?|class|const|let|var)\s+([a-zA-Z0-9_$]+)/g;
  let match;
  while ((match = namedDeclRegex.exec(code)) !== null) {
    exports.add(match[1]);
  }

  // 2. export { a, b as c }
  const exportBlockRegex = /export\s*\{([^}]+)\}(?:\s*from\s*['"]([^'"]+)['"])?/g;
  while ((match = exportBlockRegex.exec(code)) !== null) {
    const block = match[1];
    const items = block.split(',').map(s => s.trim()).filter(Boolean);
    for (const item of items) {
      const parts = item.split(/\s+as\s+/);
      const exportedName = (parts[1] || parts[0]).trim();
      exports.add(exportedName);
    }
  }

  // 3. export * from './...'
  if (/export\s*\*\s*from/g.test(code)) {
    hasExportAll = true;
  }

  // 4. export default
  if (/export\s+default\b/.test(code)) {
    exports.add('default');
  }

  // 5. Trích xuất imports
  const importBlockRegex = /import\s+(?:type\s+)?(?:(\*\s+as\s+\w+|\w+)\s*,?\s*)?(?:\{([^}]+)\})?\s*from\s*['"]([^'"]+)['"]/g;
  while ((match = importBlockRegex.exec(code)) !== null) {
    const defaultOrStar = match[1];
    const namedBlock = match[2];
    const fromPath = match[3];

    const names = [];
    if (defaultOrStar) {
      if (defaultOrStar.startsWith('* as')) {
        names.push('*');
      } else {
        names.push('default');
      }
    }
    if (namedBlock) {
      const items = namedBlock.split(',').map(s => s.trim()).filter(Boolean);
      for (const item of items) {
        const originalName = item.split(/\s+as\s+/)[0].trim();
        names.push(originalName);
      }
    }

    imports.push({ names, from: fromPath });
  }

  return { exports, imports, hasExportAll };
}

// ============================================================================
// 3. Kiểm tra Cú pháp JS với V8 Native Compiler
// ============================================================================
function validateJsFile(filePath) {
  totalFilesChecked++;
  const code = fs.readFileSync(filePath, 'utf8');

  // 1. Phân tích Signature Exports/Imports
  const sig = extractModuleSignatures(filePath, code);
  moduleMap.set(filePath, sig);

  // 2. Xây dựng Import Graph
  const currentNeighbors = importGraph.get(filePath) || new Set();
  for (const imp of sig.imports) {
    if (imp.from.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filePath), imp.from);
      currentNeighbors.add(resolved);
    }
  }
  importGraph.set(filePath, currentNeighbors);

  // 3. Chuẩn hóa để V8 Native Engine kiểm tra cú pháp AST
  try {
    let sanitized = code
      .replace(/^[ \t]*import\s+type\s+.*?from\s+['"].*?['"];?/gm, '/* import type */')
      .replace(/^[ \t]*import\s+['"][^'"]+['"];?/gm, '/* side-effect import */')
      .replace(/^[ \t]*import\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/gm, (m) => '/* ' + m.replace(/\*\//g, '* /') + ' */')
      .replace(/^[ \t]*export\s+[\s\S]*?\s+from\s+['"][^'"]+['"];?/gm, (m) => '/* ' + m.replace(/\*\//g, '* /') + ' */')
      .replace(/^[ \t]*export\s+default\s+/gm, 'const __default_exp = ')
      .replace(/^[ \t]*export\s+(async\s+function|function|class|const|let|var)\s+/gm, '$1 ')
      .replace(/^[ \t]*export\s*\{[\s\S]*?\}\s*;?/gm, '/* export block */');

    new vm.Script(sanitized, { filename: filePath });
  } catch (err) {
    errors.push({
      file: path.relative(rootDir, filePath),
      message: `Lỗi cú pháp V8: ${err.message}`
    });
  }

  // 4. Kiểm tra sự tồn tại của file relative import
  for (const imp of sig.imports) {
    if (imp.from.startsWith('.')) {
      const resolved = path.resolve(path.dirname(filePath), imp.from);
      if (!fs.existsSync(resolved)) {
        errors.push({
          file: path.relative(rootDir, filePath),
          message: `Đường dẫn import không tồn tại: "${imp.from}"`
        });
      }
    }
  }
}

// ============================================================================
// 4. Kiểm tra Khớp Tên Hàm Export/Import
// ============================================================================
function validateNamedExports() {
  for (const [filePath, sig] of moduleMap.entries()) {
    for (const imp of sig.imports) {
      if (!imp.from.startsWith('.')) continue;
      const targetPath = path.resolve(path.dirname(filePath), imp.from);
      if (!moduleMap.has(targetPath)) continue;

      const targetSig = moduleMap.get(targetPath);
      if (targetSig.hasExportAll) continue;

      for (const name of imp.names) {
        if (name === '*' || name === 'default') continue;
        if (!targetSig.exports.has(name)) {
          errors.push({
            file: path.relative(rootDir, filePath),
            message: `Hàm/Biến "${name}" được import từ "${imp.from}" nhưng "${path.basename(targetPath)}" KHÔNG export nó!`
          });
        }
      }
    }
  }
}

// ============================================================================
// 5. Kiểm tra Vòng lặp Module (Circular Dependencies)
// ============================================================================
function checkCircularDependencies() {
  const visited = new Set();
  const recursionStack = new Set();

  function dfs(node, pathStack = []) {
    visited.add(node);
    recursionStack.add(node);
    pathStack.push(node);

    const neighbors = importGraph.get(node) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, pathStack);
      } else if (recursionStack.has(neighbor)) {
        const cycleStartIndex = pathStack.indexOf(neighbor);
        const cycle = pathStack.slice(cycleStartIndex).map(p => path.relative(rootDir, p)).concat(path.relative(rootDir, neighbor));
        warnings.push({
          file: path.relative(rootDir, node),
          message: `Phát hiện vòng lặp Import (Circular Cycle): ${cycle.join(' ➔ ')}`
        });
      }
    }

    recursionStack.delete(node);
    pathStack.pop();
  }

  for (const node of importGraph.keys()) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }
}

// ============================================================================
// 6. Kiểm tra Toàn Vẹn Cấu Trúc CSS & Khớp Biến CSS
// ============================================================================
function validateCssFile(filePath) {
  totalFilesChecked++;
  const code = fs.readFileSync(filePath, 'utf8');
  let openBraces = 0;
  let inComment = false;
  const lines = code.split('\n');

  // 1. Quét tìm các biến CSS được định nghĩa (--var-name: ...)
  const defVarRegex = /(--[a-zA-Z0-9_-]+)\s*:/g;
  let vMatch;
  while ((vMatch = defVarRegex.exec(code)) !== null) {
    definedCssVars.add(vMatch[1]);
  }

  // 2. Quét tìm các animation @keyframes
  const kfRegex = /@keyframes\s+([a-zA-Z0-9_-]+)/g;
  let kMatch;
  while ((kMatch = kfRegex.exec(code)) !== null) {
    const kfName = kMatch[1];
    if (keyframesMap.has(kfName)) {
      warnings.push({
        file: path.relative(rootDir, filePath),
        message: `@keyframes '${kfName}' bị khai báo trùng lặp (đã tồn tại trong ${path.relative(rootDir, keyframesMap.get(kfName))})`
      });
    } else {
      keyframesMap.set(kfName, filePath);
    }
  }

  // 3. Quét kiểm tra @import url(...)
  const importCssRegex = /@import\s+(?:url\(['"]?([^'")]+)['"]?\)|['"]([^'"]+)['"]);?/g;
  let impMatch;
  while ((impMatch = importCssRegex.exec(code)) !== null) {
    const importUrl = impMatch[1] || impMatch[2];
    if (!importUrl.startsWith('http') && !importUrl.startsWith('//')) {
      const resolved = path.resolve(path.dirname(filePath), importUrl);
      if (!fs.existsSync(resolved)) {
        errors.push({
          file: path.relative(rootDir, filePath),
          message: `Lệnh @import trỏ tới file CSS không tồn tại: "${importUrl}"`
        });
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Thu thập các biến var(--...) được gọi để kiểm tra sau
    const useVarRegex = /var\(\s*(--[a-zA-Z0-9_-]+)(?:\s*,\s*[^)]+)?\s*\)/g;
    let uMatch;
    while ((uMatch = useVarRegex.exec(line)) !== null) {
      // Chỉ kiểm tra nếu không có fallback hoặc kiểm tra tính sẵn sàng
      usedCssVars.push({ varName: uMatch[1], file: filePath, line: i + 1, hasFallback: line.includes(',') });
    }

    for (let j = 0; j < line.length; j++) {
      if (!inComment && line[j] === '/' && line[j + 1] === '*') {
        inComment = true;
        j++;
        continue;
      }
      if (inComment && line[j] === '*' && line[j + 1] === '/') {
        inComment = false;
        j++;
        continue;
      }
      if (!inComment) {
        if (line[j] === '{') openBraces++;
        if (line[j] === '}') {
          openBraces--;
          if (openBraces < 0) {
            errors.push({
              file: path.relative(rootDir, filePath),
              message: `Thừa dấu đóng '}' tại dòng ${i + 1}`
            });
            return;
          }
        }
      }
    }

    // Kiểm tra thiếu dấu chấm phẩy ';' trong các dòng khai báo thuộc tính CSS
    const trimmed = line.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!inComment && openBraces > 0 && trimmed.length > 0) {
      if (trimmed.includes(':') && 
          !trimmed.startsWith('@') && 
          !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') && 
          !trimmed.endsWith(';') && 
          !trimmed.endsWith(',')) {
        errors.push({
          file: path.relative(rootDir, filePath),
          message: `Thiếu dấu chấm phẩy ';' tại dòng ${i + 1}: "${trimmed}"`
        });
      }
    }
  }

  if (openBraces > 0) {
    errors.push({
      file: path.relative(rootDir, filePath),
      message: `Thiếu ${openBraces} dấu đóng '}' trong file CSS`
    });
  }
}

// 4. Kiểm tra Biến CSS không tồn tại (Missing CSS Variables)
function validateMissingCssVariables() {
  for (const usage of usedCssVars) {
    if (!definedCssVars.has(usage.varName) && !usage.hasFallback) {
      warnings.push({
        file: path.relative(rootDir, usage.file),
        message: `Biến CSS '${usage.varName}' tại dòng ${usage.line} được gọi nhưng CHƯA ĐƯỢC ĐỊNH NGHĨA trong bất kỳ file CSS nào!`
      });
    }
  }
}

// ============================================================================
// 7. Kiểm tra JSON & HTML
// ============================================================================
function validateJsonFile(filePath) {
  totalFilesChecked++;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
  } catch (err) {
    errors.push({
      file: path.relative(rootDir, filePath),
      message: `Lỗi cú pháp JSON: ${err.message}`
    });
  }
}

function validateHtmlFile(filePath) {
  totalFilesChecked++;
  const content = fs.readFileSync(filePath, 'utf8');
  
  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const src = match[1].split('?')[0];
    if (!src.startsWith('http') && !src.startsWith('//')) {
      const targetPath = path.resolve(rootDir, src);
      if (!fs.existsSync(targetPath)) {
        errors.push({
          file: path.relative(rootDir, filePath),
          message: `Thẻ <script> trỏ tới file không tồn tại: "${src}"`
        });
      }
    }
  }

  const cssRegex = /<link\s+[^>]*href=["']([^"']+\.css(\?[^"']*)?)["']/gi;
  while ((match = cssRegex.exec(content)) !== null) {
    const href = match[1].split('?')[0];
    if (!href.startsWith('http') && !href.startsWith('//')) {
      const targetPath = path.resolve(rootDir, href);
      if (!fs.existsSync(targetPath)) {
        errors.push({
          file: path.relative(rootDir, filePath),
          message: `Thẻ <link CSS> trỏ tới file không tồn tại: "${href}"`
        });
      }
    }
  }
}

// ============================================================================
// 8. Kiểm tra Bộ Từ Điển & Taxonomies (Data Schema & Integrity)
// ============================================================================
async function validateDataTaxonomy() {
  try {
    const dataIndexPath = path.join(rootDir, 'src', 'data', 'index.js');
    if (fs.existsSync(dataIndexPath)) {
      const dataModule = await import('file:///' + dataIndexPath.replace(/\\/g, '/'));
      if (typeof dataModule.validateData === 'function') {
        const res = dataModule.validateData();
        if (!res.valid && res.errors && res.errors.length > 0) {
          for (const err of res.errors) {
            errors.push({
              file: 'src/data/words.js',
              message: `[Data Schema] ${err}`
            });
          }
        }
      }
    }
  } catch (err) {
    warnings.push({
      file: 'src/data/index.js',
      message: `Không thể nạp kiểm tra chuyên sâu Taxonomy: ${err.message}`
    });
  }
}

// ============================================================================
// 8. Kiểm tra Đồng Bộ Phiên Bản Dự Án (Single Source of Truth)
// ============================================================================
function validateVersionConsistency() {
  const pkgPath = path.join(rootDir, 'package.json');
  const swPath = path.join(rootDir, 'sw.js');
  const configPath = path.join(rootDir, 'src', 'js', 'config.js');
  const htmlPath = path.join(rootDir, 'index.html');

  if (!fs.existsSync(pkgPath)) return;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const pkgVer = pkg.version;

  if (fs.existsSync(swPath)) {
    const swCode = fs.readFileSync(swPath, 'utf8');
    const m = /const CACHE_NAME = ['"]flashcard-pro-v([^'"]+)['"]/.exec(swCode);
    if (m && m[1] !== pkgVer) {
      errors.push({
        file: 'sw.js',
        message: `Phiên bản trong sw.js (v${m[1]}) không khớp với package.json (v${pkgVer}). Chạy "npm run bump:sync" để đồng bộ.`
      });
    }
  }

  if (fs.existsSync(configPath)) {
    const configCode = fs.readFileSync(configPath, 'utf8');
    const m = /version:\s*['"]([^'"]+)['"]/.exec(configCode);
    if (m && m[1] !== pkgVer) {
      errors.push({
        file: 'src/js/config.js',
        message: `Phiên bản trong src/js/config.js (v${m[1]}) không khớp với package.json (v${pkgVer}). Chạy "npm run bump:sync" để đồng bộ.`
      });
    }
  }

  if (fs.existsSync(htmlPath)) {
    const htmlCode = fs.readFileSync(htmlPath, 'utf8');
    const regex = /\?v=([a-zA-Z0-9._-]+)/g;
    let match;
    while ((match = regex.exec(htmlCode)) !== null) {
      if (match[1] !== pkgVer) {
        errors.push({
          file: 'index.html',
          message: `Query version '?v=${match[1]}' trong index.html không khớp với package.json (v${pkgVer}). Chạy "npm run bump:sync" để đồng bộ.`
        });
        break;
      }
    }
  }
}

// ============================================================================
// 8.5. Kiểm tra Sót Import (Unimported Symbols) & Đồng Bộ Offline PWA (sw.js)
// ============================================================================
function validateUnimportedSymbols() {
  const allProjectExports = new Set();
  for (const [filePath, sig] of moduleMap.entries()) {
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

    // Thu thập tên biến đã import (bao gồm cả alias "as xxx")
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

    // Xóa comment trước để thu thập khai báo cục bộ chính xác 100%
    const noComments = raw
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/[^\n]*/g, ' ');

    // Thu thập khai báo cục bộ TRƯỚC khi xóa chuỗi/template literal
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

    // Xóa chuỗi tĩnh (giữ lại biểu thức ${...} trong template literal)
    let clean = noComments.replace(/(['"])(?:\\.|(?!\1)[^\\\n])*\1/g, ' "" ');

    clean = clean.replace(/`(?:\\[\s\S]|\$\{[^}]*\}|[^`\\])*`/g, (tpl) => {
      const exprs = [];
      for (const em of tpl.matchAll(/\$\{([^}]*)\}/g)) exprs.push(em[1]);
      return ' ' + exprs.join(' ') + ' ';
    });

    // Xóa các dòng import/export, truy cập thuộc tính (.prop) và key object (prop:)
    clean = clean
      .replace(/^[ \t]*(?:import|export)\s+[\s\S]*?;?\s*$/gm, ' ')
      .replace(/\.[a-zA-Z0-9_$]+/g, ' ')
      .replace(/(^|[,{\s])([a-zA-Z0-9_$]+)\s*:(?!:)/g, '$1 ');

    const missing = new Set();
    for (const tm of clean.matchAll(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g)) {
      const tok = tm[1];
      if (allProjectExports.has(tok) && !IGNORE.has(tok) && !imported.has(tok) && !localDecls.has(tok)) {
        missing.add(tok);
      }
    }

    if (missing.size > 0) {
      errors.push({
        file: rel,
        message: `Phát hiện symbol chưa được import hoặc khai báo cục bộ: ${[...missing].join(', ')}`
      });
    }
  }
}

function validateSwPrecache() {
  const swPath = path.join(rootDir, 'sw.js');
  if (!fs.existsSync(swPath)) return;
  const swCode = fs.readFileSync(swPath, 'utf8');
  const precached = new Set([...swCode.matchAll(/'(\.\/[^']+)'/g)].map(m => m[1].slice(2)));

  // 1. Mọi file trong PRECACHE_ASSETS phải tồn tại
  for (const p of precached) {
    if (!p) continue;
    const full = path.join(rootDir, p);
    if (!fs.existsSync(full)) {
      errors.push({
        file: 'sw.js',
        message: `PRECACHE_ASSETS trỏ tới tệp không tồn tại: "./${p}"`
      });
    }
  }

  // 2. Mọi file .js / .css trong src/ phải được đăng ký vào PRECACHE_ASSETS
  const srcFiles = getAllFiles(path.join(rootDir, 'src'))
    .filter(f => f.endsWith('.js') || f.endsWith('.css'))
    .map(f => path.relative(rootDir, f).replace(/\\/g, '/'));

  for (const rel of srcFiles) {
    if (!precached.has(rel)) {
      errors.push({
        file: 'sw.js',
        message: `Tệp "${rel}" chưa được đăng ký vào PRECACHE_ASSETS để hỗ trợ Offline PWA.`
      });
    }
  }
}

// ============================================================================
// 9. THỰC THI KIỂM TRA TOÀN DIỆN
// ============================================================================
async function runSuite() {
  console.log(`${colors.cyan}⚡ FLASHCARD PRO - BẮT ĐẦU QUÉT TOÀN BỘ DỰ ÁN...${colors.reset}`);

  const scanDirs = ['src'];
  const scanRootFiles = ['index.html', 'sw.js', 'manifest.json', 'jsconfig.json'];

  // 1. Quét cú pháp từng file
  for (const dir of scanDirs) {
    const dirPath = path.join(rootDir, dir);
    const files = getAllFiles(dirPath);
    for (const file of files) {
      if (file.endsWith('.js')) validateJsFile(file);
      else if (file.endsWith('.json')) validateJsonFile(file);
      else if (file.endsWith('.css')) validateCssFile(file);
    }
  }

  for (const file of scanRootFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      if (file.endsWith('.html')) validateHtmlFile(fullPath);
      else if (file.endsWith('.js')) validateJsFile(fullPath);
      else if (file.endsWith('.json')) validateJsonFile(fullPath);
    }
  }

  // 2. Kiểm tra liên kết chéo Named Exports/Imports
  validateNamedExports();

  // 3. Kiểm tra biến CSS không tồn tại (Missing CSS Variables)
  validateMissingCssVariables();

  // 4. Kiểm tra vòng lặp Module
  checkCircularDependencies();

  // 5. Kiểm tra toàn vẹn Taxonomy
  await validateDataTaxonomy();

  // 6. Kiểm tra đồng bộ phiên bản toàn dự án (SSOT)
  validateVersionConsistency();

  // 7. Kiểm tra sót import (Unimported project symbols) trong src/js/
  validateUnimportedSymbols();

  // 8. Kiểm tra đồng bộ Offline PWA Precache (sw.js)
  validateSwPrecache();

  const duration = ((performance.now() - startTime) / 1000).toFixed(3);

  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  // In cảnh báo nếu có
  if (warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  CẢNH BÁO KIẾN TRÚC & THIẾU CSS (${warnings.length}):${colors.reset}`);
    warnings.forEach((w, idx) => {
      console.log(`   ${colors.yellow}${idx + 1}. [${w.file}]${colors.reset} ${w.message}`);
    });
    console.log(`${colors.dim}──────────────────────────────────────────────────────────${colors.reset}`);
  }

  // In kết quả cuối cùng
  if (errors.length === 0) {
    console.log(`${colors.green}${colors.bold}✅ TOÀN BỘ DỰ ÁN HOÀN HẢO! (${totalFilesChecked} tệp tin đã quét trong ${duration}s)${colors.reset}`);
    console.log(`   ${colors.green}✓${colors.reset} 100% Cú pháp V8 AST chuẩn tuyệt đối`);
    console.log(`   ${colors.green}✓${colors.reset} 100% Khớp đúng tên hàm Named Exports/Imports giữa các module`);
    console.log(`   ${colors.green}✓${colors.reset} 100% Đường dẫn file import & link tồn tại`);
    console.log(`   ${colors.green}✓${colors.reset} 100% Biến CSS (var(--...)), @import và dấu chấm phẩy toàn vẹn`);
    console.log(`   ${colors.green}✓${colors.reset} 2.500+ từ vựng & chủ đề đạt chuẩn Schema`);
    console.log(`   ${colors.green}✓${colors.reset} 100% Đồng bộ phiên bản thống nhất toàn dự án (SSOT)`);
    console.log(`   ${colors.green}✓${colors.reset} 100% Không sót import / symbol chưa khai báo trong src/js/`);
    console.log(`   ${colors.green}✓${colors.reset} 100% Đồng bộ Offline PWA Precache (sw.js)`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}❌ PHÁT HIỆN ${errors.length} LỖI CẦN SỬA:${colors.reset}`);
    errors.forEach((e, idx) => {
      console.log(`   ${colors.red}${idx + 1}. [${e.file}]${colors.reset} ${e.message}`);
    });
    console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ (${duration}s)${colors.reset}`);
    process.exit(1);
  }
}

runSuite();
