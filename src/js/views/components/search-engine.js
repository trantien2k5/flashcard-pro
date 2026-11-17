/**
 * Spotlight Search Submodule: Full-Text Matching, Scoring & Filtering Engine
 */

import { State } from '../../core/fsrs.js';
import { MASTERY_STABILITY_THRESHOLD } from '../../config.js';

function scoreCardMatch(card, q) {
  const word = (card.word || '').toLowerCase();
  const meaning = (card.meaning || '').toLowerCase();
  const pos = (card.pos || '').toLowerCase();
  const cefr = (card.level || card.cefr || '').toLowerCase();
  const ipa = (card.ipa || card.phonetic || '').toLowerCase();
  const example = (card.example || '').toLowerCase();
  const exampleVi = (card.exampleVi || '').toLowerCase();
  const subtopic = (card.subtopic || '').toLowerCase();

  if (word === q) return { score: 100, pos, cefr };
  if (word.startsWith(q)) return { score: 60, pos, cefr };
  if (word.includes(q)) return { score: 30, pos, cefr };
  if (meaning.includes(q)) return { score: 25, pos, cefr };
  if (cefr === q) return { score: 20, pos, cefr };
  if (pos === q) return { score: 15, pos, cefr };
  if (ipa.includes(q) || example.includes(q) || exampleVi.includes(q) || subtopic.includes(q)) {
    return { score: 10, pos, cefr };
  }
  return null;
}

function passesSearchFilter(filter, { pos, cefr, state, isLearned, isMastered }, now) {
  if (filter === 'pos:noun') return pos === 'noun';
  if (filter === 'pos:verb') return pos === 'verb';
  if (filter === 'pos:adj') return pos === 'adjective' || pos === 'adj';
  if (filter === 'cefr:b1') return cefr === 'b1' || cefr === 'b2';
  if (filter === 'cefr:c1') return cefr === 'c1' || cefr === 'c2';
  if (filter === 'state:due') {
    return Boolean(state && state.state !== State.New && state.due && new Date(state.due) <= now);
  }
  if (filter === 'state:new' || filter === 'new') return !isLearned;
  if (filter === 'learned') return isLearned;
  if (filter === 'mastered') return isMastered;
  return true;
}

export function searchCards(allCards, cardStates, rawQuery, currentFilter = 'all') {
  const q = rawQuery.toLowerCase().trim();
  const now = new Date();
  const matches = [];

  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i];
    const match = scoreCardMatch(card, q);
    if (!match) continue;

    const state = cardStates[card.id];
    const isLearned = Boolean(state && state.state !== State.New && state.state !== 0);
    const isMastered = isLearned && state.stability >= MASTERY_STABILITY_THRESHOLD;

    if (!passesSearchFilter(currentFilter, { pos: match.pos, cefr: match.cefr, state, isLearned, isMastered }, now)) {
      continue;
    }

    matches.push({ card, score: match.score, state, isLearned, isMastered });
  }

  matches.sort((a, b) => b.score - a.score);
  return {
    totalMatches: matches.length,
    results: matches.slice(0, 50)
  };
}
