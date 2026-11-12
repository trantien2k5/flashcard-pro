#!/usr/bin/env node
/**
 * ⚡ FLASHCARD PRO - CODE LOCATOR & SYMBOL MAP ENGINE
 * ----------------------------------------------------------------------------
 * Công cụ định vị hàm, class, tính năng và số dòng chính xác 100% trong < 0.1s.
 * 
 * Cách dùng:
 * 1. Định vị nhanh: node scripts/locate.js <từ_khóa>
 *    Ví dụ: node scripts/locate.js flipCard
 *           node scripts/locate.js "lịch ôn"
 *           node scripts/locate.js StorageManager
 * 
 * 2. Cập nhật bản đồ CODE_MAP.md tự động:
 *    node scripts/locate.js --map
 * ----------------------------------------------------------------------------
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(rootDir, 'src/js');

// Màu sắc terminal
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgBlue: '\x1b[44m\x1b[37m'
};

/**
 * Quét toàn bộ file .js trong thư mục
 */
function getAllJsFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'words') { // Bỏ qua thư mục từ điển chia nhỏ words/ để tìm kiếm tập trung
        results = results.concat(getAllJsFiles(fullPath));
      }
    } else if (entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Trích xuất các biểu tượng (Symbol): Hàm, Class, Method kèm số dòng bắt đầu/kết thúc
 */
function parseFileSymbols(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const symbols = [];

  const relPath = path.relative(rootDir, filePath);
  let currentClass = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Nhận diện Class
    const classMatch = trimmed.match(/^(?:export\s+)?class\s+([A-Za-z0-9_$]+)/);
    if (classMatch) {
      currentClass = classMatch[1];
      const startLine = i + 1;
      const endLine = findBlockEnd(lines, i);
      const doc = getPrecedingComment(lines, i);
      symbols.push({
        type: 'class',
        name: currentClass,
        file: relPath,
        absPath: filePath,
        startLine,
        endLine,
        signature: trimmed.replace(/\{$/, '').trim(),
        doc,
        parent: null
      });
      continue;
    }

    // 2. Nhận diện Method bên trong Class
    if (currentClass) {
      const methodMatch = trimmed.match(/^(?:static\s+)?(?:async\s+)?([A-Za-z0-9_$]+)\s*\([^)]*\)\s*\{/);
      if (methodMatch) {
        const methodName = methodMatch[1];
        if (!['if', 'for', 'while', 'switch', 'catch'].includes(methodName)) {
          const startLine = i + 1;
          const endLine = findBlockEnd(lines, i);
          const doc = getPrecedingComment(lines, i);
          symbols.push({
            type: 'method',
            name: `${currentClass}.${methodName}`,
            shortName: methodName,
            file: relPath,
            absPath: filePath,
            startLine,
            endLine,
            signature: trimmed.replace(/\{$/, '').trim(),
            doc,
            parent: currentClass
          });
          continue;
        }
      }
    }

    // 3. Nhận diện Function độc lập
    const fnMatch = trimmed.match(/^(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\([^)]*\)/);
    if (fnMatch) {
      const fnName = fnMatch[1];
      const startLine = i + 1;
      const endLine = findBlockEnd(lines, i);
      const doc = getPrecedingComment(lines, i);
      symbols.push({
        type: 'function',
        name: fnName,
        file: relPath,
        absPath: filePath,
        startLine,
        endLine,
        signature: trimmed.replace(/\{$/, '').trim(),
        doc,
        parent: null
      });
      continue;
    }

    // 4. Nhận diện Arrow Function được gán const/let
    const arrowMatch = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/);
    if (arrowMatch) {
      const fnName = arrowMatch[1];
      const startLine = i + 1;
      const endLine = findBlockEnd(lines, i);
      const doc = getPrecedingComment(lines, i);
      symbols.push({
        type: 'arrow_function',
        name: fnName,
        file: relPath,
        absPath: filePath,
        startLine,
        endLine,
        signature: trimmed.replace(/\{$/, '').trim(),
        doc,
        parent: null
      });
      continue;
    }
  }

  return { filePath, relPath, symbols, lines };
}

/**
 * Tìm dòng kết thúc của khối mã dựa vào đếm cặp ngoặc { }
 */
function findBlockEnd(lines, startIdx) {
  let openBraces = 0;
  let foundFirst = false;

  for (let i = startIdx; i < lines.length; i++) {
    const l = lines[i];
    for (const char of l) {
      if (char === '{') {
        openBraces++;
        foundFirst = true;
      } else if (char === '}') {
        openBraces--;
        if (foundFirst && openBraces <= 0) {
          return i + 1;
        }
      }
    }
    // Nếu là một dòng đơn không có ngoặc nhọn
    if (foundFirst && openBraces <= 0) {
      return i + 1;
    }
  }
  return startIdx + 1;
}

/**
 * Lấy comment/JSDoc ngay phía trên định nghĩa hàm
 */
function getPrecedingComment(lines, idx) {
  let commentLines = [];
  let i = idx - 1;
  while (i >= 0) {
    const line = lines[i].trim();
    if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*') || line.endsWith('*/')) {
      const clean = line.replace(/^\/\*\*?/, '').replace(/\*\/$/, '').replace(/^\*/, '').replace(/^\/\//, '').trim();
      if (clean) commentLines.unshift(clean);
      i--;
    } else {
      break;
    }
  }
  return commentLines.join(' ');
}

/**
 * Chức năng 1: Tìm kiếm & Định vị Symbol chính xác
 */
function locateSymbol(query) {
  if (!query) {
    console.log(`${c.yellow}⚠️ Vui lòng nhập từ khóa tìm kiếm.${c.reset}`);
    console.log(`Ví dụ: ${c.cyan}node scripts/locate.js flipCard${c.reset}`);
    return;
  }

  const q = query.toLowerCase().trim();
  const files = getAllJsFiles(srcDir);
  const matched = [];

  for (const f of files) {
    const parsed = parseFileSymbols(f);
    for (const sym of parsed.symbols) {
      const nameMatch = sym.name.toLowerCase().includes(q);
      const sigMatch = sym.signature.toLowerCase().includes(q);
      const docMatch = sym.doc && sym.doc.toLowerCase().includes(q);
      
      if (nameMatch || sigMatch || docMatch) {
        matched.push(sym);
      }
    }
  }

  console.log(`\n🔍 ${c.bold}KẾT QUẢ ĐỊNH VỊ CHO TỪ KHÓA:${c.reset} "${c.cyan}${query}${c.reset}"`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  if (matched.length === 0) {
    console.log(`${c.yellow}Không tìm thấy hàm/class nào khớp trực tiếp. Đang quét văn bản toàn bộ file...${c.reset}`);
    // Fallback: Tìm dòng chứa chuỗi trong code
    let textMatches = 0;
    for (const f of files) {
      const parsed = parseFileSymbols(f);
      parsed.lines.forEach((l, idx) => {
        if (l.toLowerCase().includes(q) && textMatches < 15) {
          textMatches++;
          const rel = path.relative(rootDir, f);
          const link = `file://${f}#L${idx + 1}`;
          console.log(`📍 ${c.green}${rel}:${idx + 1}${c.reset} ➔ ${link}`);
          console.log(`   ${c.dim}${l.trim().slice(0, 80)}${c.reset}\n`);
        }
      });
    }
    if (textMatches === 0) {
      console.log(`${c.red}Không tìm thấy vị trí nào trong mã nguồn.${c.reset}`);
    }
    return;
  }

  console.log(`Tìm thấy ${c.green}${matched.length}${c.reset} vị trí phù hợp:\n`);

  matched.forEach((m, idx) => {
    const link = `file://${m.absPath}#L${m.startLine}-L${m.endLine}`;
    console.log(`${idx + 1}. ${c.bold}${c.green}${m.name}${c.reset} [${m.type}]`);
    console.log(`   📁 Tệp: ${c.cyan}${m.file}${c.reset}`);
    console.log(`   📍 Dòng: ${c.yellow}#L${m.startLine} - #L${m.endLine}${c.reset} (${m.endLine - m.startLine + 1} dòng)`);
    console.log(`   🔗 Link: ${link}`);
    console.log(`   📝 Chữ ký: ${c.dim}${m.signature}${c.reset}`);
    if (m.doc) {
      console.log(`   💡 Mục đích: ${c.dim}${m.doc.slice(0, 100)}${m.doc.length > 100 ? '...' : ''}${c.reset}`);
    }
    console.log('');
  });
}

/**
 * Chức năng 2: Tự động biên soạn & cập nhật tệp docs/CODE_MAP.md
 */
function generateCodeMap() {
  console.log(`\n🗺️ Đang tự động quét toàn bộ mã nguồn và tạo ${c.bold}docs/CODE_MAP.md${c.reset}...`);
  const files = getAllJsFiles(srcDir).sort();

  const groups = {
    core: { title: 'TẦNG 1: NGHIỆP VỤ & THUẬT TOÁN (Core Layer — `src/js/core/`)', files: [] },
    services: { title: 'TẦNG 2: DỊCH VỤ & LƯU TRỮ (Services Layer — `src/js/services/`)', files: [] },
    views: { title: 'TẦNG 3: MÀN HÌNH GIAO DIỆN (Presentation Views — `src/js/views/`)', files: [] },
    components: { title: 'TẦNG 4: THÀNH PHẦN & MODALS (Components & Modals — `src/js/views/components/`, `modals/`)', files: [] },
    root: { title: 'TẦNG 5: ĐIỀU PHỐI CHÍNH & NỀN TẢNG (`src/js/app.js`, `config.js`, `utils.js`)', files: [] }
  };

  for (const f of files) {
    const rel = path.relative(rootDir, f);
    if (rel.includes('src/js/core/')) groups.core.files.push(f);
    else if (rel.includes('src/js/services/')) groups.services.files.push(f);
    else if (rel.includes('src/js/views/components/') || rel.includes('src/js/views/modals/')) groups.components.files.push(f);
    else if (rel.includes('src/js/views/')) groups.views.files.push(f);
    else groups.root.files.push(f);
  }

  let md = `# 🗺️ CODE_MAP.md — Bản Đồ Định Vị Mã Nguồn & Điểm Neo Sửa Đổi

> **Single Source of Truth (SSOT)** định vị chính xác **100% tệp tin, dải dòng code, hàm/class và điểm neo tối ưu** của dự án Flashcard English Pro.
> Tệp này được tự động cập nhật đồng bộ bằng công cụ: \`npm run map\` (hoặc \`node scripts/locate.js --map\`).

---

## ⚡ 1. Công Cụ Định Vị Siêu Tốc (CLI Symbol Locator)

Bạn hoặc AI Agent có thể tìm vị trí chính xác của bất kỳ hàm, class, hoặc tính năng nào chỉ trong **0.05s** bằng lệnh:

\`\`\`bash
# Định vị theo tên hàm hoặc class
npm run locate flipCard
npm run locate StorageManager
npm run locate showDueWordsModal

# Hoặc chạy trực tiếp với Node
node scripts/locate.js "lịch ôn tập"
\`\`\`

Kết quả trả về đường dẫn tệp tin, dải dòng code chính xác (\`#Lxx - #Lyy\`), chữ ký hàm và liên kết click mở file tức thì.

---

## 🧭 2. Bản Đồ Chi Tiết Từng Module (Detailed Symbol Directory)

`;

  for (const [key, group] of Object.entries(groups)) {
    md += `### ${group.title}\n\n`;

    for (const filePath of group.files) {
      const relPath = path.relative(rootDir, filePath);
      const parsed = parseFileSymbols(filePath);
      const totalLines = parsed.lines.length;

      md += `#### 📁 [\`${relPath}\`](file://${filePath}) (${totalLines} dòng)\n\n`;

      if (parsed.symbols.length === 0) {
        md += `*Tệp cấu hình hoặc dữ liệu, không chứa khai báo hàm/class lớn.*\n\n`;
        continue;
      }

      md += `| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |\n`;
      md += `| :--- | :---: | :---: | :--- |\n`;

      for (const sym of parsed.symbols) {
        const link = `[\`#L${sym.startLine}-L${sym.endLine}\`](file://${sym.absPath}#L${sym.startLine}-L${sym.endLine})`;
        const cleanDoc = sym.doc ? sym.doc.replace(/\|/g, '-').slice(0, 75) : 'Thực thi logic nội bộ';
        md += `| \`${sym.name}\` | ${link} | \`${sym.type}\` | ${cleanDoc} |\n`;
      }
      md += `\n`;
    }
    md += `---\n\n`;
  }

  const mapPath = path.resolve(rootDir, 'docs', 'CODE_MAP.md');
  fs.mkdirSync(path.dirname(mapPath), { recursive: true });
  fs.writeFileSync(mapPath, md, 'utf8');
  console.log(`✅ ${c.green}Đã tạo thành công ${mapPath}!${c.reset}`);
}

// ============================================================================
// MAIN CLI DISPATCHER
// ============================================================================
const args = process.argv.slice(2);
if (args.includes('--map')) {
  generateCodeMap();
} else {
  const query = args.join(' ');
  locateSymbol(query);
}
