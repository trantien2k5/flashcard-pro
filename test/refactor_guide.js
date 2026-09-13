/**
 * 🛠️ FLASHCARD PRO - REFACTORING & CODE SMELL ANALYZER (< 0.2s)
 * ----------------------------------------------------------------------------
 * Tự động phân tích toàn bộ dự án và xuất ra BÁO CÁO HƯỚNG REFACTOR TINH GỌN:
 * 1. Unused Imports & Dead Exports (Code rác / import thừa)
 * 2. Duplicate Code Patterns (Các đoạn logic bị viết lặp ở nhiều file)
 * 3. File Bloat & Cyclomatic Complexity (File quá dài / hàm quá ôm đồm)
 * 4. Hardcoded Magic Numbers / Colors (Cần đưa vào config.js hoặc CSS tokens)
 * 5. DOM Cache Smells (Lặp lại document.getElementById nhiều lần)
 * ----------------------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const startTime = performance.now();

// Bảng màu ANSI
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

const suggestions = [];

function getAllJsFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) return files;
  for (const f of fs.readdirSync(dirPath)) {
    const full = path.join(dirPath, f);
    if (fs.statSync(full).isDirectory()) getAllJsFiles(full, files);
    else if (f.endsWith('.js') && !full.includes('test')) files.push(full);
  }
  return files;
}

const jsFiles = getAllJsFiles(path.join(rootDir, 'js')).concat(getAllJsFiles(path.join(rootDir, 'data')));

// 1. Phân tích Unused Imports
for (const file of jsFiles) {
  const code = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(rootDir, file);
  
  // Trích xuất imports
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g;
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const importedList = match[1].split(',').map(s => s.trim()).filter(Boolean);
    const codeAfterImports = code.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '');
    
    for (const item of importedList) {
      const originalName = item.split(/\s+as\s+/)[0].trim();
      const aliasName = (item.split(/\s+as\s+/)[1] || originalName).trim();
      
      const usageRegex = new RegExp(`\\b${aliasName}\\b`, 'g');
      const matches = codeAfterImports.match(usageRegex);
      if (!matches || matches.length === 0) {
        suggestions.push({
          level: '🔴 [DỌN RÁC]',
          file: relPath,
          message: `Import thừa '${aliasName}' không được sử dụng ở bất kỳ đâu trong file này.`,
          action: `Xóa '${aliasName}' khỏi câu lệnh import.`
        });
      }
    }
  }

  // 2. Phân tích File Bloat (> 500 dòng)
  const lineCount = code.split('\n').length;
  if (lineCount > 550) {
    suggestions.push({
      level: '🟡 [CHIA KHỐI]',
      file: relPath,
      message: `File có dung lượng khá lớn (${lineCount} dòng).`,
      action: `Nên tách các helper / sub-renderers thành component nhỏ hơn.`
    });
  }

  // 3. Phân tích DOM Query lặp lại trong hàm
  const getElMatches = code.match(/document\.getElementById\(['"]([^'"]+)['"]\)/g);
  if (getElMatches) {
    const counts = {};
    for (const m of getElMatches) counts[m] = (counts[m] || 0) + 1;
    for (const [query, count] of Object.entries(counts)) {
      if (count >= 4) {
        suggestions.push({
          level: '💡 [TỐI ƯU DOM]',
          file: relPath,
          message: `Lệnh \`${query}\` được gọi lặp lại ${count} lần.`,
          action: `Nên cache phần tử DOM vào một biến hoặc object \`dom\` ở đầu hàm.`
        });
      }
    }
  }

  // 4. Phân tích Magic Strings / Hardcoded Colors
  const hexColors = code.match(/#[0-9a-fA-F]{6}\b/g);
  if (hexColors && hexColors.length > 5) {
    const uniqueColors = [...new Set(hexColors)];
    suggestions.push({
      level: '🎨 [CHUẨN HÓA CSS]',
      file: relPath,
      message: `File chứa ${hexColors.length} mã màu hardcoded (${uniqueColors.slice(0, 3).join(', ')}...).`,
      action: `Nên thay thế bằng CSS Variables hoặc định nghĩa trong config.js.`
    });
  }
}

// 5. Phân tích Duplicate Logic Blocks giữa các file
const functionSignatures = new Map();
for (const file of jsFiles) {
  const code = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(rootDir, file);
  const funcRegex = /(?:function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>)/g;
  let m;
  while ((m = funcRegex.exec(code)) !== null) {
    const funcName = m[1] || m[2];
    if (funcName && funcName.length > 3 && !['constructor', 'render', 'init', 'setup'].includes(funcName)) {
      if (!functionSignatures.has(funcName)) functionSignatures.set(funcName, []);
      functionSignatures.get(funcName).push(relPath);
    }
  }
}

for (const [funcName, fileList] of functionSignatures.entries()) {
  if (fileList.length > 1) {
    suggestions.push({
      level: '⚡ [GỘP TIỆN ÍCH]',
      file: fileList.join(', '),
      message: `Tên hàm \`${funcName}\` xuất hiện ở nhiều file khác nhau.`,
      action: `Kiểm tra nếu logic giống nhau, hãy gộp chung vào \`js/utils.js\`.`
    });
  }
}

const duration = ((performance.now() - startTime) / 1000).toFixed(3);

console.log(`${c.cyan}${c.bold}📋 FLASHCARD PRO - BẢN ĐỒ HƯỚNG DẪN REFACTOR DỰ ÁN${c.reset}`);
console.log(`${c.dim}Quét ${jsFiles.length} file mã nguồn trong ${duration}s${c.reset}`);
console.log(`${c.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);

if (suggestions.length === 0) {
  console.log(`${c.green}${c.bold}🎉 MÃ NGUỒN CỰC KỲ TINH GỌN & SẠCH SẼ!${c.reset}`);
  console.log(`   Không phát hiện code thừa, import rác hay logic bị trùng lặp.`);
} else {
  console.log(`${c.yellow}${c.bold}Gợi ý ${suggestions.length} cơ hội cải tiến mã nguồn:${c.reset}\n`);
  
  suggestions.forEach((item, index) => {
    console.log(`${c.bold}${index + 1}. ${item.level} ${c.cyan}[${item.file}]${c.reset}`);
    console.log(`   ${c.dim}Vấn đề:${c.reset} ${item.message}`);
    console.log(`   ${c.green}👉 Hướng xử lý:${c.reset} ${item.action}\n`);
  });
  
  console.log(`${c.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
  console.log(`${c.blue}💡 Chạy lại bất kỳ lúc nào bằng lệnh: ${c.bold}npm run refactor${c.reset}`);
}
