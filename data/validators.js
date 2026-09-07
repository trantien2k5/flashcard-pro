/**
 * DATA VALIDATORS - Flashcard English Pro
 * Kiểm tra tính hợp lệ và toàn vẹn của cấu trúc Word & Topic Dataset
 */

import { CEFR_LEVELS, POS_TYPES } from './schemas.js';

const CEFR_SET = new Set(CEFR_LEVELS);
const POS_SET = new Set(POS_TYPES);

/**
 * Kiểm tra tính hợp lệ của một Word object
 * @param {Object} word
 * @param {Object} ctx - Context chứa topicIdsSet, seenWordIds, parentTopicMap
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateWord(word, ctx = {}) {
  const errors = [];
  const warnings = [];

  if (!word || typeof word !== 'object') {
    return { valid: false, errors: ['Word record must be an object'], warnings: [] };
  }

  // 1. ID check
  if (!word.id || typeof word.id !== 'string' || !word.id.trim()) {
    errors.push(`Invalid word id: ${JSON.stringify(word.id)}`);
  } else if (ctx.seenWordIds) {
    if (ctx.seenWordIds.has(word.id)) {
      errors.push(`Duplicate word ID: "${word.id}"`);
    } else {
      ctx.seenWordIds.add(word.id);
    }
  }

  // 2. Word text
  if (!word.word || typeof word.word !== 'string' || !word.word.trim()) {
    errors.push(`Word "${word.id || 'unknown'}": Missing or empty "word" field`);
  }

  // 3. Meaning
  if (!word.meaning || typeof word.meaning !== 'string' || !word.meaning.trim()) {
    errors.push(`Word "${word.id || 'unknown'}": Missing or empty "meaning" field`);
  }

  // 4. CEFR Level
  if (!word.level || !CEFR_SET.has(word.level.toUpperCase())) {
    errors.push(`Word "${word.id || 'unknown'}": Invalid level "${word.level}". Must be one of: ${CEFR_LEVELS.join(', ')}`);
  }

  // 5. Part of Speech (POS)
  if (!word.pos || !POS_SET.has(word.pos.toLowerCase())) {
    errors.push(`Word "${word.id || 'unknown'}": Invalid pos "${word.pos}". Must be one of: ${POS_TYPES.join(', ')}`);
  }

  // 6. topicIds
  if (!Array.isArray(word.topicIds)) {
    errors.push(`Word "${word.id || 'unknown'}": "topicIds" must be an array`);
  } else {
    if (word.topicIds.length === 0) {
      warnings.push(`Word "${word.id || 'unknown'}": "topicIds" is empty`);
    }

    const seenTopicsInWord = new Set();
    for (const tid of word.topicIds) {
      if (typeof tid !== 'string' || !tid.trim()) {
        errors.push(`Word "${word.id || 'unknown'}": Contains invalid topicId: ${JSON.stringify(tid)}`);
      } else {
        if (seenTopicsInWord.has(tid)) {
          errors.push(`Word "${word.id || 'unknown'}": Duplicate topicId "${tid}" in topicIds`);
        }
        seenTopicsInWord.add(tid);

        if (ctx.topicIdsSet && !ctx.topicIdsSet.has(tid)) {
          errors.push(`Word "${word.id || 'unknown'}": References non-existent topicId "${tid}"`);
        }
      }
    }

    // Semantic check: Không được chứa đồng thời cả topic cha và topic con (redundant ancestor topic)
    if (ctx.parentTopicMap) {
      for (const tid of word.topicIds) {
        let ancestorId = ctx.parentTopicMap.get(tid);
        while (ancestorId) {
          if (seenTopicsInWord.has(ancestorId)) {
            errors.push(`Word "${word.id}": Contains both child topic "${tid}" and its ancestor topic "${ancestorId}" in topicIds`);
          }
          ancestorId = ctx.parentTopicMap.get(ancestorId);
        }
      }
    }
  }

  // 7. Tags (no redundant level, pos, or topicIds)
  if (Array.isArray(word.tags)) {
    const redundant = word.tags.filter(tag => {
      if (CEFR_SET.has(tag.toUpperCase())) return true;
      if (POS_SET.has(tag.toLowerCase())) return true;
      if (word.topicIds && word.topicIds.includes(tag)) return true;
      return false;
    });
    if (redundant.length > 0) {
      warnings.push(`Word "${word.id || 'unknown'}": Tags contain redundant metadata [${redundant.join(', ')}]`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Kiểm tra tính hợp lệ của một Topic object
 * @param {Object} topic
 * @param {Object} ctx - Context chứa topicIdsSet, seenTopicIds
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateTopic(topic, ctx = {}) {
  const errors = [];
  const warnings = [];

  if (!topic || typeof topic !== 'object') {
    return { valid: false, errors: ['Topic record must be an object'], warnings: [] };
  }

  // 1. ID check
  if (!topic.id || typeof topic.id !== 'string' || !topic.id.trim()) {
    errors.push(`Invalid topic id: ${JSON.stringify(topic.id)}`);
  } else if (ctx.seenTopicIds) {
    if (ctx.seenTopicIds.has(topic.id)) {
      errors.push(`Duplicate topic ID: "${topic.id}"`);
    } else {
      ctx.seenTopicIds.add(topic.id);
    }
  }

  // 2. Name check
  if (!topic.name || typeof topic.name !== 'string' || !topic.name.trim()) {
    errors.push(`Topic "${topic.id || 'unknown'}": Missing or empty "name" field`);
  }

  // 3. Parent ID check
  if (topic.parentId !== null && topic.parentId !== undefined) {
    if (typeof topic.parentId !== 'string' || !topic.parentId.trim()) {
      errors.push(`Topic "${topic.id || 'unknown'}": parentId must be string or null`);
    } else if (topic.parentId === topic.id) {
      errors.push(`Topic "${topic.id}": Cannot be parent of itself (self-parent)`);
    } else if (ctx.topicIdsSet && !ctx.topicIdsSet.has(topic.parentId)) {
      errors.push(`Topic "${topic.id}": References non-existent parentId "${topic.parentId}"`);
    }
  }

  // 4. Unlock rule semantic check
  if (topic.unlockRule && typeof topic.unlockRule === 'object') {
    if (topic.unlockRule.type === 'completeSubtopic') {
      const requiredId = topic.unlockRule.subtopicId;
      if (!requiredId || typeof requiredId !== 'string') {
        errors.push(`Topic "${topic.id}": unlockRule is missing subtopicId`);
      } else if (requiredId === topic.id) {
        errors.push(`Topic "${topic.id}": unlockRule cannot require itself (self-lock)`);
      } else if (ctx.topicIdsSet && !ctx.topicIdsSet.has(requiredId)) {
        errors.push(`Topic "${topic.id}": unlockRule references non-existent subtopic "${requiredId}"`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Phát hiện vòng lặp phân cấp cha-con (Taxonomy cycle)
 * @param {Array<Object>} topics
 * @returns {string[]} Danh sách lỗi vòng lặp nếu có
 */
export function detectTaxonomyCycles(topics = []) {
  const topicMap = new Map(topics.map(t => [t.id, t.parentId]));
  const errors = [];

  for (const topic of topics) {
    const visited = new Set();
    let currentId = topic.id;

    while (currentId) {
      if (visited.has(currentId)) {
        errors.push(`Taxonomy cycle detected starting at topic "${topic.id}" (cycle involves "${currentId}")`);
        break;
      }
      visited.add(currentId);
      currentId = topicMap.get(currentId) || null;
    }
  }

  return errors;
}

/**
 * Phát hiện vòng lặp trong chuỗi mở khóa (Unlock Rule cycle)
 * @param {Array<Object>} topics
 * @returns {string[]} Danh sách lỗi vòng lặp mở khóa nếu có
 */
export function detectUnlockRuleCycles(topics = []) {
  const topicMap = new Map(topics.map(t => [t.id, t]));
  const errors = [];

  for (const topic of topics) {
    const visited = new Set();
    let current = topic;

    while (current && current.unlockRule && current.unlockRule.type === 'completeSubtopic') {
      if (visited.has(current.id)) {
        errors.push(`Unlock rule cycle detected starting at topic "${topic.id}" (cycle involves "${current.id}")`);
        break;
      }
      visited.add(current.id);
      current = topicMap.get(current.unlockRule.subtopicId);
    }
  }

  return errors;
}

/**
 * Kiểm tra toàn diện toàn bộ Dataset
 * @param {{ words: Array<Object>, topics: Array<Object> }} dataset
 * @returns {{ valid: boolean, errors: string[], warnings: string[], stats: Object }}
 */
export function validateDataset({ words = [], topics = [] } = {}) {
  const allErrors = [];
  const allWarnings = [];

  const topicIdsSet = new Set(topics.map(t => t.id).filter(Boolean));
  const parentTopicMap = new Map(topics.map(t => [t.id, t.parentId || null]));
  const seenTopicIds = new Set();
  const seenWordIds = new Set();

  // 1. Validate all topics
  for (const topic of topics) {
    const res = validateTopic(topic, { topicIdsSet, seenTopicIds });
    if (!res.valid) allErrors.push(...res.errors);
    if (res.warnings.length) allWarnings.push(...res.warnings);
  }

  // 2. Detect taxonomy cycles
  const cycleErrors = detectTaxonomyCycles(topics);
  if (cycleErrors.length) allErrors.push(...cycleErrors);

  // 3. Detect unlock rule cycles
  const unlockCycleErrors = detectUnlockRuleCycles(topics);
  if (unlockCycleErrors.length) allErrors.push(...unlockCycleErrors);

  // 4. Validate all words
  for (const word of words) {
    const res = validateWord(word, { topicIdsSet, parentTopicMap, seenWordIds });
    if (!res.valid) allErrors.push(...res.errors);
    if (res.warnings.length) allWarnings.push(...res.warnings);
  }

  const rootTopicsCount = topics.filter(t => t.parentId === null).length;
  const subtopicsCount = topics.length - rootTopicsCount;

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
    stats: {
      totalWords: words.length,
      totalTopics: topics.length,
      rootTopics: rootTopicsCount,
      subtopics: subtopicsCount,
      errorCount: allErrors.length,
      warningCount: allWarnings.length
    }
  };
}


