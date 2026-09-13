import { FSRS, Rating, State } from '../js/core/fsrs.js';
import { DEFAULT_FSRS_PARAMS } from '../js/config.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

console.log('\n======================================================');
console.log('🧪 RUNNING FSRS-6 MATHEMATICAL & GOLDEN VECTOR TESTS');
console.log('======================================================\n');

// Group 1: Initial Stability w[0..3]
console.log('--- TEST GROUP 1: Initial Stability w[0..3] Mapping ---');
const fsrs = new FSRS();
assert(Math.abs(fsrs.initStability(Rating.Again) - DEFAULT_FSRS_PARAMS.w[0]) < 1e-4, 'initStability(Again) equals w[0]');
assert(Math.abs(fsrs.initStability(Rating.Hard) - DEFAULT_FSRS_PARAMS.w[1]) < 1e-4, 'initStability(Hard) equals w[1]');
assert(Math.abs(fsrs.initStability(Rating.Good) - DEFAULT_FSRS_PARAMS.w[2]) < 1e-4, 'initStability(Good) equals w[2]');
assert(Math.abs(fsrs.initStability(Rating.Easy) - DEFAULT_FSRS_PARAMS.w[3]) < 1e-4, 'initStability(Easy) equals w[3]');

// Group 2: Retention Scaling
console.log('\n--- TEST GROUP 2: Target Retention Scaling ---');
const card = FSRS.createEmptyCard('test-card-1');
const fsrs80 = new FSRS({ requestRetention: 0.80 });
const fsrs90 = new FSRS({ requestRetention: 0.90 });
const fsrs97 = new FSRS({ requestRetention: 0.97 });

const state80 = fsrs80.calculateNextState(card, Rating.Easy, new Date('2026-09-13T00:00:00Z'));
const state90 = fsrs90.calculateNextState(card, Rating.Easy, new Date('2026-09-13T00:00:00Z'));
const state97 = fsrs97.calculateNextState(card, Rating.Easy, new Date('2026-09-13T00:00:00Z'));

console.log(`  Easy Intervals with Retention: 80% -> ${state80.raw_days.toFixed(2)}d, 90% -> ${state90.raw_days.toFixed(2)}d, 97% -> ${state97.raw_days.toFixed(2)}d`);
assert(state80.raw_days > state90.raw_days, 'Lower retention (80%) yields longer interval than 90%');
assert(state90.raw_days > state97.raw_days, 'Higher retention (97%) yields shorter interval than 90%');

// Group 3: Difficulty Linear Damping
console.log('\n--- TEST GROUP 3: Difficulty Linear Damping ---');
const d0 = fsrs.initDifficulty(Rating.Good); // w[4]
const dNextGood = fsrs.nextDifficulty(d0, Rating.Good);
const dNextHard = fsrs.nextDifficulty(d0, Rating.Hard);
const dNextEasy = fsrs.nextDifficulty(d0, Rating.Easy);

assert(Math.abs(dNextGood - d0) < 1e-4, 'Rating Good retains mean reversion base difficulty');
assert(dNextHard > d0, 'Rating Hard increases difficulty');
assert(dNextEasy < d0, 'Rating Easy decreases difficulty');

// Group 4: Consecutive Review Progression
console.log('\n--- TEST GROUP 4: Consecutive Reviews Stability Growth ---');
let c = FSRS.createEmptyCard('test-card-2');
c = fsrs.calculateNextState(c, Rating.Good, new Date('2026-01-01T00:00:00Z'));
assert(c.state === State.Review, 'New card with Good reaches State.Review');
let lastS = c.stability;

for (let i = 1; i <= 5; i++) {
  const reviewDate = new Date(new Date(c.last_review).getTime() + c.scheduled_days * 86400000);
  c = fsrs.calculateNextState(c, Rating.Good, reviewDate);
  assert(c.stability > lastS, `Review ${i}: Stability grew from ${lastS.toFixed(2)} to ${c.stability.toFixed(2)}`);
  lastS = c.stability;
}

// Group 5: History Length Capping
console.log('\n--- TEST GROUP 5: Card History Memory Capping ---');
for (let i = 0; i < 20; i++) {
  const reviewDate = new Date(new Date(c.last_review).getTime() + c.scheduled_days * 86400000);
  c = fsrs.calculateNextState(c, Rating.Good, reviewDate);
}
assert(c.history.length <= 10, `History is pruned to max 10 entries (actual: ${c.history.length})`);

console.log('\n======================================================');
console.log(`🏁 TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log('======================================================\n');

if (failedTests > 0) process.exit(1);
