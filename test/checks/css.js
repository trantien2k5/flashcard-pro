/**
 * CSS Syntax, Braces, Semicolons, @import & Missing CSS Variables Validator
 */

import fs from 'fs';
import path from 'path';
import { rootDir, checkState, addError, addWarning } from './context.js';

export function validateCssFile(filePath) {
  checkState.totalFilesChecked++;
  const code = fs.readFileSync(filePath, 'utf8');
  let openBraces = 0;
  let inComment = false;
  const lines = code.split('\n');

  const defVarRegex = /(--[a-zA-Z0-9_-]+)\s*:/g;
  let vMatch;
  while ((vMatch = defVarRegex.exec(code)) !== null) {
    checkState.definedCssVars.add(vMatch[1]);
  }

  const kfRegex = /@keyframes\s+([a-zA-Z0-9_-]+)/g;
  let kMatch;
  while ((kMatch = kfRegex.exec(code)) !== null) {
    const kfName = kMatch[1];
    if (checkState.keyframesMap.has(kfName)) {
      addWarning(
        path.relative(rootDir, filePath),
        `@keyframes '${kfName}' bị khai báo trùng lặp (đã tồn tại trong ${path.relative(rootDir, checkState.keyframesMap.get(kfName))})`
      );
    } else {
      checkState.keyframesMap.set(kfName, filePath);
    }
  }

  const importCssRegex = /@import\s+(?:url\(['"]?([^'")]+)['"]?\)|['"]([^'"]+)['"]);?/g;
  let impMatch;
  while ((impMatch = importCssRegex.exec(code)) !== null) {
    const importUrl = impMatch[1] || impMatch[2];
    if (!importUrl.startsWith('http') && !importUrl.startsWith('//')) {
      const resolved = path.resolve(path.dirname(filePath), importUrl);
      if (!fs.existsSync(resolved)) {
        addError(path.relative(rootDir, filePath), `Lệnh @import trỏ tới file CSS không tồn tại: "${importUrl}"`);
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const useVarRegex = /var\(\s*(--[a-zA-Z0-9_-]+)(?:\s*,\s*[^)]+)?\s*\)/g;
    let uMatch;
    while ((uMatch = useVarRegex.exec(line)) !== null) {
      checkState.usedCssVars.push({
        varName: uMatch[1],
        file: filePath,
        line: i + 1,
        hasFallback: line.includes(',')
      });
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
            addError(path.relative(rootDir, filePath), `Thừa dấu đóng '}' tại dòng ${i + 1}`);
            return;
          }
        }
      }
    }

    const trimmed = line.replace(/\/\*[\s\S]*?\*\//g, '').trim();
    if (!inComment && openBraces > 0 && trimmed.length > 0) {
      if (
        trimmed.includes(':') &&
        !trimmed.startsWith('@') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith(',')
      ) {
        addError(path.relative(rootDir, filePath), `Thiếu dấu chấm phẩy ';' tại dòng ${i + 1}: "${trimmed}"`);
      }
    }
  }

  if (openBraces > 0) {
    addError(path.relative(rootDir, filePath), `Thiếu ${openBraces} dấu đóng '}' trong file CSS`);
  }
}

export function validateMissingCssVariables() {
  for (const usage of checkState.usedCssVars) {
    if (!checkState.definedCssVars.has(usage.varName) && !usage.hasFallback) {
      addWarning(
        path.relative(rootDir, usage.file),
        `Biến CSS '${usage.varName}' tại dòng ${usage.line} được gọi nhưng CHƯA ĐƯỢC ĐỊNH NGHĨA trong bất kỳ file CSS nào!`
      );
    }
  }
}

