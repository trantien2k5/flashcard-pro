/**
 * ⚡ FLASHCARD PRO - ONE-CLICK VERSION BUMP & SYNC SCRIPT
 * ----------------------------------------------------------------------------
 * Tự động đồng bộ & cập nhật phiên bản tại MỘT NƠI DUY NHẤT (SSOT):
 * 1. package.json ("version": "...")
 * 2. sw.js (const CACHE_NAME = 'flashcard-pro-v...')
 * 3. src/js/config.js (APP_CONFIG.version)
 * 4. index.html (?v=... cache-busting queries)
 *
 * Cách sử dụng:
 *   node scripts/bump.js          -> Tự động tăng patch version (vd: 3.76.8 -> 3.76.9)
 *   node scripts/bump.js minor    -> Tăng minor (vd: 3.76.8 -> 3.77.0)
 *   node scripts/bump.js major    -> Tăng major (vd: 3.76.8 -> 4.0.0)
 *   node scripts/bump.js 3.77.0   -> Đặt đích danh phiên bản 3.77.0
 *   node scripts/bump.js --sync   -> Lấy version trong package.json đồng bộ sang 3 file còn lại
 * ----------------------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const packageJsonPath = path.join(rootDir, 'package.json');
const swJsPath = path.join(rootDir, 'sw.js');
const configJsPath = path.join(rootDir, 'src', 'js', 'config.js');
const indexHtmlPath = path.join(rootDir, 'index.html');

// 1. Đọc package.json hiện tại
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = pkg.version || '3.76.8';

const arg = (process.argv[2] || '').trim().toLowerCase();

let nextVersion = currentVersion;

if (arg === '--sync' || arg === 'sync') {
  // Giữ nguyên version từ package.json để đồng bộ các file khác
  nextVersion = currentVersion;
  console.log(`\x1b[36m🔄 Đồng bộ toàn bộ dự án về phiên bản SSOT trong package.json: v${nextVersion}\x1b[0m`);
} else if (arg === 'major') {
  const parts = currentVersion.split('.').map(Number);
  parts[0] = (parts[0] || 0) + 1;
  parts[1] = 0;
  parts[2] = 0;
  nextVersion = parts.join('.');
} else if (arg === 'minor') {
  const parts = currentVersion.split('.').map(Number);
  parts[1] = (parts[1] || 0) + 1;
  parts[2] = 0;
  nextVersion = parts.join('.');
} else if (arg === 'patch' || !arg) {
  const parts = currentVersion.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1;
  nextVersion = parts.join('.');
} else if (/^\d+\.\d+\.\d+$/.test(arg)) {
  nextVersion = arg;
} else {
  console.error(`\x1b[31m❌ Tham số không hợp lệ: "${arg}". Vui lòng dùng: patch, minor, major, <x.y.z> hoặc --sync\x1b[0m`);
  process.exit(1);
}

console.log(`\x1b[32m🚀 Bắt đầu nâng cấp phiên bản: v${currentVersion} ➔ v${nextVersion}\x1b[0m`);

// 2. Cập nhật package.json
pkg.version = nextVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`   ✓ Đã cập nhật package.json ➔ v${nextVersion}`);

// 3. Cập nhật sw.js
if (fs.existsSync(swJsPath)) {
  let swContent = fs.readFileSync(swJsPath, 'utf8');
  swContent = swContent.replace(
    /const CACHE_NAME = ['"]flashcard-pro-v[^'"]+['"];/,
    `const CACHE_NAME = 'flashcard-pro-v${nextVersion}';`
  );
  fs.writeFileSync(swJsPath, swContent, 'utf8');
  console.log(`   ✓ Đã cập nhật sw.js ➔ flashcard-pro-v${nextVersion}`);
}

// 4. Cập nhật src/js/config.js
if (fs.existsSync(configJsPath)) {
  let configContent = fs.readFileSync(configJsPath, 'utf8');
  configContent = configContent.replace(
    /version:\s*['"][^'"]+['"]/,
    `version: '${nextVersion}'`
  );
  fs.writeFileSync(configJsPath, configContent, 'utf8');
  console.log(`   ✓ Đã cập nhật src/js/config.js ➔ v${nextVersion}`);
}

// 5. Cập nhật index.html (tất cả các query params ?v=... và nhãn hiển thị phiên bản ở logo)
if (fs.existsSync(indexHtmlPath)) {
  let htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
  htmlContent = htmlContent.replace(/\?v=[0-9a-zA-Z._-]+/g, `?v=${nextVersion}`);
  htmlContent = htmlContent.replace(
    /<span class="brand-sub" id="app-version-badge">v[^<]+<\/span>/,
    `<span class="brand-sub" id="app-version-badge">v${nextVersion}</span>`
  );
  fs.writeFileSync(indexHtmlPath, htmlContent, 'utf8');
  console.log(`   ✓ Đã cập nhật index.html (query strings & logo badge) ➔ v${nextVersion}`);
}

// 5.5. Tự động đồng bộ bản đồ mã nguồn CODE_MAP.md
try {
  execSync('node scripts/locate.js --map', { stdio: 'pipe', cwd: rootDir });
  console.log(`   ✓ Đã đồng bộ bản đồ mã nguồn ➔ CODE_MAP.md`);
} catch (e) {}

// 6. Tự động chạy lại test check runner
console.log(`\n\x1b[33m🔍 Đang tự động kiểm tra toàn vẹn dự án với node test/check.js...\x1b[0m`);
try {
  execSync('node test/check.js', { stdio: 'inherit', cwd: rootDir });
  console.log(`\x1b[32m\x1b[1m✨ NÂNG CẤP PHIÊN BẢN v${nextVersion} THÀNH CÔNG VÀ ĐÃ TEST 100% HOÀN HẢO!\x1b[0m\n`);
} catch (e) {
  console.error(`\x1b[31m❌ Kiểm thử sau khi nâng version thất bại! Vui lòng kiểm tra lại.\x1b[0m`);
  process.exit(1);
}

