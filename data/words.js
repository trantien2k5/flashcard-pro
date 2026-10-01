/**
 * CANONICAL VOCABULARY BARREL HUB - Flashcard English Pro
 * Tự động tổng hợp dữ liệu từ điển chuẩn hóa theo từng cấp độ CEFR
 */

import { LEGACY_ID_MAP } from './words/legacy.js';
import { WORDS_A1 } from './words/a1.js';
import { WORDS_A2 } from './words/a2.js';
import { WORDS_B1 } from './words/b1.js';
import { WORDS_B2 } from './words/b2.js';
import { WORDS_C1 } from './words/c1.js';

export { LEGACY_ID_MAP, WORDS_A1, WORDS_A2, WORDS_B1, WORDS_B2, WORDS_C1 };

export const WORDS = [
  ...WORDS_A1,
  ...WORDS_A2,
  ...WORDS_B1,
  ...WORDS_B2,
  ...WORDS_C1
];

export const WORDS_MAP = new Map(WORDS.map(w => [w.id, w]));
