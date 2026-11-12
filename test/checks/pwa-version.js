/**
 * JSON, HTML Links, Taxonomy Schema, SSOT Version & SW Precache Validator
 */

import fs from 'fs';
import path from 'path';
import { rootDir, checkState, addError, addWarning, getAllFiles } from './context.js';

export function validateJsonFile(filePath) {
  checkState.totalFilesChecked++;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
  } catch (err) {
    addError(path.relative(rootDir, filePath), `Lỗi cú pháp JSON: ${err.message}`);
  }
}

export function validateHtmlFile(filePath) {
  checkState.totalFilesChecked++;
  const content = fs.readFileSync(filePath, 'utf8');

  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
  let match;
  while ((match = scriptRegex.exec(content)) !== null) {
    const src = match[1].split('?')[0];
    if (!src.startsWith('http') && !src.startsWith('//')) {
      const targetPath = path.resolve(rootDir, src);
      if (!fs.existsSync(targetPath)) {
        addError(path.relative(rootDir, filePath), `Thẻ <script> trỏ tới file không tồn tại: "${src}"`);
      }
    }
  }

  const cssRegex = /<link\s+[^>]*href=["']([^"']+\.css(\?[^"']*)?)["']/gi;
  while ((match = cssRegex.exec(content)) !== null) {
    const href = match[1].split('?')[0];
    if (!href.startsWith('http') && !href.startsWith('//')) {
      const targetPath = path.resolve(rootDir, href);
      if (!fs.existsSync(targetPath)) {
        addError(path.relative(rootDir, filePath), `Thẻ <link CSS> trỏ tới file không tồn tại: "${href}"`);
      }
    }
  }
}

export async function validateDataTaxonomy() {
  try {
    const dataIndexPath = path.join(rootDir, 'src', 'data', 'index.js');
    if (fs.existsSync(dataIndexPath)) {
      const dataModule = await import('file:///' + dataIndexPath.replace(/\\/g, '/'));
      if (typeof dataModule.validateData === 'function') {
        const res = dataModule.validateData();
        if (!res.valid && res.errors && res.errors.length > 0) {
          for (const err of res.errors) {
            addError('src/data/words.js', `[Data Schema] ${err}`);
          }
        }
      }
    }
  } catch (err) {
    addWarning('src/data/index.js', `Không thể nạp kiểm tra chuyên sâu Taxonomy: ${err.message}`);
  }
}

export function validateVersionConsistency() {
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
      addError('sw.js', `Phiên bản trong sw.js (v${m[1]}) không khớp với package.json (v${pkgVer}). Chạy "npm run bump:sync" để đồng bộ.`);
    }
  }

  if (fs.existsSync(configPath)) {
    const configCode = fs.readFileSync(configPath, 'utf8');
    const m = /version:\s*['"]([^'"]+)['"]/.exec(configCode);
    if (m && m[1] !== pkgVer) {
      addError('src/js/config.js', `Phiên bản trong src/js/config.js (v${m[1]}) không khớp với package.json (v${pkgVer}). Chạy "npm run bump:sync" để đồng bộ.`);
    }
  }

  if (fs.existsSync(htmlPath)) {
    const htmlCode = fs.readFileSync(htmlPath, 'utf8');
    const regex = /\?v=([a-zA-Z0-9._-]+)/g;
    let match;
    while ((match = regex.exec(htmlCode)) !== null) {
      if (match[1] !== pkgVer) {
        addError('index.html', `Query version '?v=${match[1]}' trong index.html không khớp với package.json (v${pkgVer}). Chạy "npm run bump:sync" để đồng bộ.`);
        break;
      }
    }
  }
}

export function validateSwPrecache() {
  const swPath = path.join(rootDir, 'sw.js');
  if (!fs.existsSync(swPath)) return;
  const swCode = fs.readFileSync(swPath, 'utf8');
  const precached = new Set([...swCode.matchAll(/'(\.\/[^']+)'/g)].map(m => m[1].slice(2)));

  for (const p of precached) {
    if (!p) continue;
    const full = path.join(rootDir, p);
    if (!fs.existsSync(full)) {
      addError('sw.js', `PRECACHE_ASSETS trỏ tới tệp không tồn tại: "./${p}"`);
    }
  }

  const srcFiles = getAllFiles(path.join(rootDir, 'src'))
    .filter(f => f.endsWith('.js') || f.endsWith('.css'))
    .map(f => path.relative(rootDir, f).replace(/\\/g, '/'));

  for (const rel of srcFiles) {
    if (!precached.has(rel)) {
      addError('sw.js', `Tệp "${rel}" chưa được đăng ký vào PRECACHE_ASSETS để hỗ trợ Offline PWA.`);
    }
  }
}

