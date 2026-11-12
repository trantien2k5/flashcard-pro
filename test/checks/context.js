/**
 * Shared Integrity Suite Context, File Scanner & Reporting Accumulators
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rootDir = path.resolve(__dirname, '..', '..');

export const colors = {
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

export const checkState = {
  totalFilesChecked: 0,
  errors: [],
  warnings: [],
  moduleMap: new Map(),
  importGraph: new Map(),
  definedCssVars: new Set(),
  usedCssVars: [],
  keyframesMap: new Map()
};

export function addError(file, message) {
  checkState.errors.push({ file, message });
}

export function addWarning(file, message) {
  checkState.warnings.push({ file, message });
}

export function getAllFiles(dirPath, arrayOfFiles = []) {
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

