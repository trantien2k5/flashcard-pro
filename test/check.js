/**
 * ⚡ FLASHCARD PRO - ULTRA-FAST INTEGRITY & SYNTAX SUITE v3.0
 * Orchestrator điều phối AST, CSS, Taxonomy, SSOT Version & PWA Precache checks.
 */

import fs from 'fs';
import path from 'path';
import { rootDir, colors, checkState, getAllFiles } from './checks/context.js';
import {
  validateJsFile,
  validateNamedExports,
  checkCircularDependencies,
  validateUnimportedSymbols
} from './checks/ast.js';
import { validateCssFile, validateMissingCssVariables } from './checks/css.js';
import {
  validateJsonFile,
  validateHtmlFile,
  validateDataTaxonomy,
  validateVersionConsistency,
  validateSwPrecache
} from './checks/pwa-version.js';

const startTime = performance.now();

async function runSuite() {
  console.log(`${colors.cyan}⚡ FLASHCARD PRO - BẮT ĐẦU QUÉT TOÀN BỘ DỰ ÁN...${colors.reset}`);

  const scanDirs = ['src'];
  const scanRootFiles = ['index.html', 'sw.js', 'manifest.json', 'jsconfig.json'];

  for (const dir of scanDirs) {
    const files = getAllFiles(path.join(rootDir, dir));
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

  validateNamedExports();
  validateMissingCssVariables();
  checkCircularDependencies();
  await validateDataTaxonomy();
  validateVersionConsistency();
  validateUnimportedSymbols();
  validateSwPrecache();

  const duration = ((performance.now() - startTime) / 1000).toFixed(3);
  const { totalFilesChecked, errors, warnings } = checkState;

  console.log(`${colors.dim}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

  if (warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  CẢNH BÁO KIẾN TRÚC & THIẾU CSS (${warnings.length}):${colors.reset}`);
    warnings.forEach((w, idx) => {
      console.log(`   ${colors.yellow}${idx + 1}. [${w.file}]${colors.reset} ${w.message}`);
    });
    console.log(`${colors.dim}──────────────────────────────────────────────────────────${colors.reset}`);
  }

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
