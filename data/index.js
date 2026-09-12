/**
 * DATA GATEWAY & TAXONOMY FACADE - Flashcard English Pro
 * Cổng truy cập tập trung dữ liệu Word-Centric SSOT & Hệ thống phân cấp chủ đề
 * Hỗ trợ tra cứu O(1), Taxonomy đệ quy (Ancestors/Descendants) và Semantic Filter thống nhất
 */

import { WORDS, WORDS_MAP, LEGACY_ID_MAP } from './words.js';
import { TOPICS, TOPICS_MAP } from './topics.js';
import { validateDataset, validateWord, validateTopic } from './validators.js';
import { CEFR_LEVELS, POS_TYPES, TOPIC_CATEGORIES, LEARNING_PHASES } from './schemas.js';

export {
  WORDS,
  WORDS_MAP,
  LEGACY_ID_MAP,
  TOPICS,
  TOPICS_MAP,
  CEFR_LEVELS,
  POS_TYPES,
  TOPIC_CATEGORIES,
  LEARNING_PHASES,
  validateDataset,
  validateWord,
  validateTopic
};

// ==========================================
// 1. DERIVED IN-MEMORY INDEXES (O(1) CACHE)
// ==========================================
const _childTopicIdsByParentId = new Map();
const _parentTopicIdByTopicId = new Map();
const _wordsByDirectTopicId = new Map();
const _rootTopics = [];
let _topicTreeCache = null;

// Khởi tạo derived indexes 1 lần duy nhất từ canonical data
for (const topic of TOPICS) {
  if (topic.parentId === null || topic.parentId === undefined) {
    _rootTopics.push(topic);
  } else {
    if (!_childTopicIdsByParentId.has(topic.parentId)) {
      _childTopicIdsByParentId.set(topic.parentId, []);
    }
    const childList = _childTopicIdsByParentId.get(topic.parentId);
    if (childList) childList.push(topic.id);
    _parentTopicIdByTopicId.set(topic.id, topic.parentId);
  }
}

const CEFR_WEIGHT_MAP = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };

for (const word of WORDS) {
  if (Array.isArray(word.topicIds)) {
    for (const tid of word.topicIds) {
      if (!_wordsByDirectTopicId.has(tid)) {
        _wordsByDirectTopicId.set(tid, []);
      }
      const directList = _wordsByDirectTopicId.get(tid);
      if (directList) directList.push(word);
    }
  }
}

// Đảm bảo thứ tự trong từng nhóm 10 từ luôn tuân thủ chuẩn sư phạm: A1 (Cốt lõi) -> A2 -> B1 -> B2
for (const list of _wordsByDirectTopicId.values()) {
  list.sort((a, b) => {
    const wA = CEFR_WEIGHT_MAP[(a.level || 'A1').toUpperCase()] || 1;
    const wB = CEFR_WEIGHT_MAP[(b.level || 'A1').toUpperCase()] || 1;
    return wA - wB;
  });
}

// ==========================================
// 2. RECURSIVE TAXONOMY NAVIGATION
// ==========================================

/**
 * Lấy danh sách ID các chủ đề con trực tiếp (Direct Children)
 * @param {string} topicId
 * @returns {string[]}
 */
export function getChildTopicIds(topicId) {
  return _childTopicIdsByParentId.get(topicId) || [];
}

/**
 * Lấy đệ quy toàn bộ ID các chủ đề hậu duệ (Descendants: con, cháu,...)
 * @param {string} topicId
 * @returns {string[]}
 */
export function getDescendantTopicIds(topicId) {
  const result = [];
  const queue = [...getChildTopicIds(topicId)];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId) continue;
    result.push(currentId);
    const children = getChildTopicIds(currentId);
    if (children.length > 0) {
      queue.push(...children);
    }
  }

  return result;
}

/**
 * Lấy danh sách ID các chủ đề tổ tiên (Ancestors: cha, ông,...)
 * @param {string} topicId
 * @returns {string[]}
 */
export function getAncestorTopicIds(topicId) {
  const ancestors = [];
  let currentParentId = _parentTopicIdByTopicId.get(topicId);

  while (currentParentId) {
    ancestors.push(currentParentId);
    currentParentId = _parentTopicIdByTopicId.get(currentParentId);
  }

  return ancestors;
}

/**
 * Phân giải phạm vi chủ đề (Topic Scope): Bao gồm topicId và toàn bộ hậu duệ
 * @param {string} topicId
 * @returns {Set<string>}
 */
export function resolveTopicScope(topicId) {
  if (!topicId) return new Set();
  const scope = new Set([topicId]);
  const descendants = getDescendantTopicIds(topicId);
  for (const did of descendants) {
    scope.add(did);
  }
  return scope;
}

// ==========================================
// 3. UNIFIED QUERY APIS
// ==========================================

/**
 * Lấy thông tin từ vựng theo ID (hỗ trợ tự động alias legacy ID)
 * Trả về canonical object nguyên trạng (không mutate)
 * @param {string} id - Định danh từ vựng (ví dụ: 'dl-001')
 * @returns {Object|null}
 */
export function getWord(id) {
  if (!id) return null;
  const canonicalId = (LEGACY_ID_MAP && LEGACY_ID_MAP[id]) || id;
  return WORDS_MAP.get(canonicalId) || null;
}

/**
 * Lấy toàn bộ danh sách từ vựng gốc
 * @returns {Array<Object>}
 */
export function getAllWords() {
  return WORDS;
}

/**
 * Lấy thông tin một chủ đề theo ID
 * @param {string} topicId
 * @returns {Object|null}
 */
export function getTopic(topicId) {
  if (!topicId) return null;
  return TOPICS_MAP.get(topicId) || null;
}
export const getTopicById = getTopic;

/**
 * Lấy danh sách các chủ đề gốc (Root Topics)
 * @returns {Array<Object>}
 */
export function getRootTopics() {
  return _rootTopics;
}

/**
 * Lấy danh sách các chủ đề con theo parentId
 * @param {string} parentId
 * @returns {Array<Object>}
 */
export function getSubtopics(parentId) {
  const childIds = getChildTopicIds(parentId);
  return childIds.map(id => TOPICS_MAP.get(id)).filter(Boolean);
}

/**
 * Lấy toàn bộ danh sách chủ đề
 * @returns {Array<Object>}
 */
export function getAllTopics() {
  return TOPICS;
}

/**
 * Lấy danh sách từ vựng theo Chủ đề (Tự động mở rộng theo Taxonomy đệ quy)
 * @param {string} topicId - ID chủ đề cha hoặc con
 * @param {Object} [options] - Bộ lọc tùy chọn ({ level, pos, limit })
 * @returns {Array<Object>}
 */
export function getWordsByTopic(topicId, options = {}) {
  if (!topicId) return [];

  const topicScope = resolveTopicScope(topicId);
  const matchedWordsSet = new Set();
  const result = [];

  for (const tid of topicScope) {
    const wordsInTopic = _wordsByDirectTopicId.get(tid) || [];
    for (const w of wordsInTopic) {
      if (!matchedWordsSet.has(w.id)) {
        matchedWordsSet.add(w.id);
        result.push(w);
      }
    }
  }

  let filtered = result;

  if (options.level) {
    const levelStr = String(options.level).toUpperCase();
    filtered = filtered.filter(w => w.level && w.level.toUpperCase() === levelStr);
  }
  if (options.pos) {
    const posStr = String(options.pos).toLowerCase();
    filtered = filtered.filter(w => w.pos && w.pos.toLowerCase().includes(posStr));
  }
  if (options.limit && typeof options.limit === 'number' && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

/**
 * Lọc từ vựng linh hoạt với Semantic Scope thống nhất
 * @param {Function|Object} criteria - Tiêu chí lọc hoặc hàm predicate
 * @returns {Array<Object>}
 */
export function filterWords(criteria) {
  if (typeof criteria === 'function') {
    return WORDS.filter(criteria);
  }

  if (!criteria || typeof criteria !== 'object') {
    return [...WORDS];
  }

  let dataset = WORDS;

  // Lọc theo topic (sử dụng resolveTopicScope đệ quy đồng nhất)
  if (criteria.topicId) {
    const scope = resolveTopicScope(criteria.topicId);
    dataset = dataset.filter(w => w.topicIds && w.topicIds.some(tid => scope.has(tid)));
  }

  // Lọc theo level (CEFR)
  if (criteria.level) {
    const lvl = String(criteria.level).toUpperCase();
    dataset = dataset.filter(w => w.level && w.level.toUpperCase() === lvl);
  }

  // Lọc theo từ loại (pos)
  if (criteria.pos) {
    const p = String(criteria.pos).toLowerCase();
    dataset = dataset.filter(w => w.pos && w.pos.toLowerCase().includes(p));
  }

  // Lọc theo tag
  if (criteria.tag) {
    dataset = dataset.filter(w => w.tags && w.tags.includes(criteria.tag));
  }

  // Lọc tìm kiếm từ khóa
  if (criteria.search || criteria.query) {
    const q = String(criteria.search || criteria.query).toLowerCase().trim();
    if (q) {
      dataset = dataset.filter(w => {
        const matchWord = w.word && w.word.toLowerCase().includes(q);
        const matchMeaning = w.meaning && w.meaning.toLowerCase().includes(q);
        const matchDef = w.definition && w.definition.toLowerCase().includes(q);
        return Boolean(matchWord || matchMeaning || matchDef);
      });
    }
  }

  return dataset;
}

/**
 * Xây dựng cây chủ đề đệ quy bất tận (Recursive Subtree Builder)
 * @param {string} topicId
 * @returns {Object|null}
 */
function buildSubtree(topicId) {
  const topic = TOPICS_MAP.get(topicId);
  if (!topic) return null;

  const childIds = getChildTopicIds(topicId);
  const subtopics = childIds.map(cid => buildSubtree(cid)).filter(Boolean);

  // Tập hợp tất cả wordIds thuộc nhánh con này
  const scope = resolveTopicScope(topicId);
  const matchedWordIds = [];
  const seenIds = new Set();

  for (const tid of scope) {
    const wordsInTopic = _wordsByDirectTopicId.get(tid) || [];
    for (const w of wordsInTopic) {
      if (!seenIds.has(w.id)) {
        seenIds.add(w.id);
        matchedWordIds.push(w.id);
      }
    }
  }

  return {
    ...topic,
    subtopics,
    wordIds: matchedWordIds,
    totalWords: matchedWordIds.length
  };
}

/**
 * Lấy cây chủ đề hoàn chỉnh đa tầng đệ quy (Hierarchical Recursive Topic Tree)
 * @returns {Array<Object>}
 */
export function getTopicTree() {
  if (_topicTreeCache) return _topicTreeCache;
  _topicTreeCache = _rootTopics.map(root => buildSubtree(root.id)).filter(Boolean);
  return _topicTreeCache;
}

// ==========================================
// 4. COMPATIBILITY LAYER (DECKMANAGER & VIEWS)
// ==========================================

export class TopicRepository {
  static getAllTopics() {
    return getTopicTree();
  }

  static getTopicById(topicId) {
    if (!topicId) return null;
    const tree = getTopicTree();
    return tree.find(t => t.id === topicId) || TOPICS_MAP.get(topicId) || null;
  }

  static getTopicTotalWords(topic) {
    if (!topic) return 0;
    if (typeof topic.totalWords === 'number') return topic.totalWords;
    if (Array.isArray(topic.subtopics)) {
      return topic.subtopics.reduce((acc, sub) => acc + (sub.wordIds?.length || 0), 0);
    }
    return 0;
  }

  static getTopicWordIds(topic) {
    if (!topic) return [];
    if (Array.isArray(topic.wordIds) && topic.wordIds.length > 0) return topic.wordIds;
    if (Array.isArray(topic.subtopics)) {
      return topic.subtopics.flatMap(sub => sub.wordIds || []);
    }
    return [];
  }

  static getSubtopicById(subtopicId) {
    if (!subtopicId) return null;
    const tree = getTopicTree();
    for (const topic of tree) {
      if (Array.isArray(topic.subtopics)) {
        const found = topic.subtopics.find(s => s.id === subtopicId);
        if (found) return { topic, subtopic: found };
      }
    }
    return null;
  }

  static isSubtopicUnlocked(subtopic, userProgress = {}) {
    if (!subtopic) return false;
    if (!subtopic.unlockRule) return true;

    const completed = userProgress.completedSubtopics || [];
    if (subtopic.unlockRule.type === 'completeSubtopic') {
      const requiredId = subtopic.unlockRule.subtopicId;
      return completed.includes(requiredId);
    }

    return true;
  }
}

export class WordRepository {
  static async loadWordsByTopicId(topicId) {
    const wordsList = getWordsByTopic(topicId);
    const dict = {};
    for (const w of wordsList) {
      const item = { ...w, phonetic: w.ipa, pronunciation: w.ipa };
      dict[w.id] = item;
    }
    return dict;
  }

  static async getWordsBatch(topicId, wordIds = []) {
    return wordIds.map(id => getWord(id)).filter(Boolean);
  }

  static getWordFromIndex(wordId) {
    return getWord(wordId);
  }

  static getAllWords() {
    return getAllWords();
  }
}

export const INITIAL_DECKS = getTopicTree();

export async function loadAllWords() {
  const dict = {};
  for (const w of WORDS) {
    const item = { ...w, phonetic: w.ipa, pronunciation: w.ipa };
    dict[w.id] = item;
  }
  // Also register legacy aliases
  for (const [legacyId, canonicalId] of Object.entries(LEGACY_ID_MAP)) {
    if (!dict[legacyId]) {
      const target = dict[canonicalId];
      if (target) dict[legacyId] = target;
    }
  }
  return dict;
}

export async function loadTopicWords(topicId) {
  return WordRepository.loadWordsByTopicId(topicId);
}

/**
 * Kiểm tra toàn diện Dataset ngay khi cần
 */
export function validateData() {
  return validateDataset({ words: WORDS, topics: TOPICS });
}



