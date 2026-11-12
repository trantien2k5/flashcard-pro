/**
 * TOPICS TAXONOMY BARREL HUB - Flashcard English Pro
 * Tổng hợp phân cấp chủ đề & chặng học vi mô theo từng nhóm lĩnh vực.
 */

import { TOPICS_CORE_1000 } from './topics/core-1000.js';
import { TOPICS_DAILY_LIFE } from './topics/daily-life.js';
import { TOPICS_WORLD_WORK } from './topics/world-work.js';
import { TOPICS_TOEIC_BUSINESS } from './topics/toeic-business.js';

export { TOPICS_CORE_1000, TOPICS_DAILY_LIFE, TOPICS_WORLD_WORK, TOPICS_TOEIC_BUSINESS };

export const TOPICS = [
  ...TOPICS_CORE_1000,
  ...TOPICS_DAILY_LIFE,
  ...TOPICS_WORLD_WORK,
  ...TOPICS_TOEIC_BUSINESS
];

export const TOPICS_MAP = new Map(TOPICS.map(t => [t.id, t]));
