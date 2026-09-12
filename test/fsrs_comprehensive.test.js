/**
 * Comprehensive FSRS-6 Automated Test Suite
 * Tests Spaced Repetition logic, Interval Expansion, Due Date Filtering & Queue Selection
 */

import { FSRS, Rating, State, isCardDue, isCardLearned } from '../js/core/fsrs.js';
import { StorageManager } from '../js/services/storage.js';
import { DeckManager } from '../js/core/selectors.js';

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

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE FSRS-6 TEST SUITE');
  console.log('======================================================\n');

  const fsrs = new FSRS({ requestRetention: 0.90 });
  const now = new Date('2026-09-12T12:00:00Z');

  // ----------------------------------------------------
  // TEST GROUP 1: New Card Ratings (Initial State Transitions)
  // ----------------------------------------------------
  console.log('--- TEST GROUP 1: Initial Ratings on New Card ---');
  const emptyCard = FSRS.createEmptyCard('test-word-1');
  assert(emptyCard.state === State.New, 'Initial card state is State.New (0)');
  assert(!isCardDue(emptyCard, now), 'New card isCardDue returns false');

  // 1.1 New Card -> Easy
  const nextEasy = fsrs.calculateNextState(emptyCard, Rating.Easy, now);
  assert(nextEasy.state === State.Review, 'New card with Easy transitions directly to State.Review (2)');
  assert(nextEasy.scheduled_days >= 4, `New card with Easy scheduled_days is >= 4 days (actual: ${nextEasy.scheduled_days})`);
  assert(nextEasy.stability >= 3.5, `New card with Easy stability is >= 3.5 (actual: ${nextEasy.stability})`);
  assert(!isCardDue(nextEasy, now), 'Easy card is NOT due right now (isCardDue === false)');
  assert(!isCardDue(nextEasy, new Date('2026-09-13T12:00:00Z')), 'Easy card is NOT due after 1 day');
  assert(isCardDue(nextEasy, new Date('2026-09-17T12:00:00Z')), 'Easy card IS due after 5 days');

  // 1.2 New Card -> Good
  const nextGood = fsrs.calculateNextState(emptyCard, Rating.Good, now);
  assert(nextGood.state === State.Review, 'New card with Good transitions to State.Review (2)');
  assert(nextGood.scheduled_days >= 1, `New card with Good scheduled_days is >= 1 day (actual: ${nextGood.scheduled_days})`);
  assert(!isCardDue(nextGood, now), 'Good card is NOT due right now');
  assert(isCardDue(nextGood, new Date('2026-09-13T12:00:01Z')), 'Good card IS due tomorrow');

  // 1.3 New Card -> Hard
  const nextHard = fsrs.calculateNextState(emptyCard, Rating.Hard, now);
  assert(nextHard.state === State.Learning, 'New card with Hard enters State.Learning (1)');
  assert(nextHard.scheduled_days === 0, 'New card with Hard scheduled_days is 0 (short intraday step)');
  assert(!isCardDue(nextHard, now), 'Hard card is NOT due immediately');
  assert(isCardDue(nextHard, new Date(now.getTime() + 11 * 60 * 1000)), 'Hard card IS due after 11 minutes');

  // 1.4 New Card -> Again
  const nextAgain = fsrs.calculateNextState(emptyCard, Rating.Again, now);
  assert(nextAgain.state === State.Learning, 'New card with Again enters State.Learning (1)');
  assert(nextAgain.scheduled_days === 0, 'New card with Again scheduled_days is 0 (< 1m step)');
  assert(isCardDue(nextAgain, new Date(now.getTime() + 2 * 60 * 1000)), 'Again card IS due after 2 minutes');

  // ----------------------------------------------------
  // TEST GROUP 2: Review Card Consecutive Recall & Stability Growth
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 2: Consecutive Reviews & Exponential Stability Growth ---');
  let currentCard = nextGood; // Starts at Review, S = 3.2, 1d
  const intervals = [];

  for (let rep = 1; rep <= 5; rep++) {
    const reviewDate = new Date(currentCard.due);
    currentCard = fsrs.calculateNextState(currentCard, Rating.Good, reviewDate);
    intervals.push(currentCard.scheduled_days);
    assert(currentCard.state === State.Review, `Rep ${rep}: Card remains in State.Review`);
  }
  console.log(`  📊 Consecutive Good intervals: ${intervals.join('d -> ')}d`);
  assert(intervals[intervals.length - 1] > intervals[0], 'Interval expands exponentially with consecutive Good ratings');
  assert(currentCard.stability > 15, `Stability grows to > 15 days after 5 Good reps (actual: ${currentCard.stability.toFixed(1)}d)`);

  // ----------------------------------------------------
  // TEST GROUP 3: Review Card Lapse (Forgetting & Relearning)
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 3: Card Lapse Handling ---');
  const lapsedDate = new Date(currentCard.due);
  const lapsedCard = fsrs.calculateNextState(currentCard, Rating.Again, lapsedDate);
  assert(lapsedCard.state === State.Relearning, 'Forgetting a Review card sets state to State.Relearning (3)');
  assert(lapsedCard.lapses === 1, 'Lapse count increments to 1');
  assert(lapsedCard.stability < currentCard.stability, `Stability reduces on lapse (${currentCard.stability.toFixed(1)}d -> ${lapsedCard.stability.toFixed(1)}d)`);
  assert(lapsedCard.scheduled_days === 0, 'Lapsed card has scheduled_days === 0 (1 minute re-test)');

  // Relearn -> Good graduation
  const relearnGrad = fsrs.calculateNextState(lapsedCard, Rating.Good, new Date(lapsedDate.getTime() + 5 * 60 * 1000));
  assert(relearnGrad.state === State.Review, 'Relearned card graduates back to State.Review upon Good');
  assert(relearnGrad.scheduled_days >= 1, `Graduated card receives multi-day interval (actual: ${relearnGrad.scheduled_days}d)`);

  // ----------------------------------------------------
  // TEST GROUP 4: Queue Integration & Leak Prevention
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 4: DeckManager Queue & Leak Prevention ---');
  
  // Set up mock card states in StorageManager
  const mockCardId = 'banana-test-card';
  const easyRatedState = fsrs.calculateNextState(FSRS.createEmptyCard(mockCardId), Rating.Easy, now);
  StorageManager.saveCardState(easyRatedState);

  // Query state back
  const retrievedState = StorageManager.getCardState(mockCardId);
  assert(retrievedState !== null, 'StorageManager.getCardState successfully retrieves saved card');
  assert(retrievedState.state === State.Review, 'Retrieved state is State.Review');
  assert(retrievedState.scheduled_days >= 4, 'Retrieved state scheduled_days >= 4');
  assert(!isCardDue(retrievedState, now), 'Retrieved state is NOT due today');

  // Test Queue Selection with mixed set (1 due card, 1 future card, 1 new card)
  const dueCardId = 'apple-due-card';
  const newCardId = 'orange-new-card';
  
  // Set apple as due today
  const dueState = {
    id: dueCardId,
    state: State.Review,
    stability: 2.0,
    difficulty: 5.0,
    scheduled_days: 1,
    reps: 2,
    lapses: 0,
    due: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  };
  StorageManager.saveCardState(dueState);

  const deckManager = new DeckManager();
  deckManager.wordsMap.set(mockCardId, { id: mockCardId, word: 'Banana', meaning: 'Quả chuối' });
  deckManager.wordsMap.set(dueCardId, { id: dueCardId, word: 'Apple', meaning: 'Quả táo' });
  deckManager.wordsMap.set(newCardId, { id: newCardId, word: 'Orange', meaning: 'Quả cam' });
  deckManager.allCards = [
    { id: mockCardId, word: 'Banana', meaning: 'Quả chuối' },
    { id: dueCardId, word: 'Apple', meaning: 'Quả táo' },
    { id: newCardId, word: 'Orange', meaning: 'Quả cam' }
  ];

  // Test mode: due_only
  const dueOnlyResult = deckManager.getStudyQueue(null, { dailyNewLimit: 10, dailyReviewLimit: 50 }, null, { mode: 'due_only' });
  assert(dueOnlyResult.queue.length === 1, `mode: due_only contains exactly 1 card (actual: ${dueOnlyResult.queue.length})`);
  assert(dueOnlyResult.queue[0].id === dueCardId, 'mode: due_only contains ONLY the due card');
  assert(!dueOnlyResult.queue.some(c => c.id === mockCardId), 'Future card is NOT in due_only queue');
  assert(!dueOnlyResult.queue.some(c => c.id === newCardId), 'New card is NOT mixed into due_only queue');

  // Test mode: new_only
  const newOnlyResult = deckManager.getStudyQueue(null, { dailyNewLimit: 10, dailyReviewLimit: 50 }, null, { mode: 'new_only' });
  assert(newOnlyResult.queue.length === 1, `mode: new_only contains exactly 1 card (actual: ${newOnlyResult.queue.length})`);
  assert(newOnlyResult.queue[0].id === newCardId, 'mode: new_only contains ONLY the new card');
  assert(!newOnlyResult.queue.some(c => c.id === dueCardId), 'Due card is NOT in new_only queue');
  assert(!newOnlyResult.queue.some(c => c.id === mockCardId), 'Future card is NOT in new_only queue');

  // Test default/auto mode when due cards exist -> auto isolates due cards
  const autoResult = deckManager.getStudyQueue(null, { dailyNewLimit: 10, dailyReviewLimit: 50 });
  assert(autoResult.queue.length === 1, 'Auto mode isolates due cards when due cards exist');
  assert(autoResult.queue[0].id === dueCardId, 'Auto mode prioritized due card');

  // Test when 5 days pass
  const futureNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  assert(isCardDue(retrievedState, futureNow), 'Card correctly becomes DUE 5 days later');

  // ----------------------------------------------------
  // TEST GROUP 5: 30-Day Multi-Card Simulation
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 5: 30-Day Real-World Simulation (20 Cards) ---');
  const simCards = Array.from({ length: 20 }, (_, i) => ({
    id: `sim-word-${i}`,
    word: `Word ${i}`,
    state: FSRS.createEmptyCard(`sim-word-${i}`)
  }));

  let totalReviews = 0;
  let simulatedDate = new Date('2026-09-01T08:00:00Z');

  for (let day = 1; day <= 30; day++) {
    // Check due cards on this simulated day
    const dueOnDay = simCards.filter(c => isCardDue(c.state, simulatedDate));
    
    // If day 1, learn 5 new cards
    if (day === 1) {
      for (let i = 0; i < 5; i++) {
        simCards[i].state = fsrs.calculateNextState(simCards[i].state, Rating.Easy, simulatedDate);
        totalReviews++;
      }
    } else if (day === 3) {
      for (let i = 5; i < 10; i++) {
        simCards[i].state = fsrs.calculateNextState(simCards[i].state, Rating.Good, simulatedDate);
        totalReviews++;
      }
    }

    // Review due cards
    dueOnDay.forEach(c => {
      // Deterministic simulation: every 10th review is an Again (lapse), which is then reviewed as Good
      const rating = (totalReviews % 10 === 0 && totalReviews > 0) ? Rating.Again : Rating.Good;
      c.state = fsrs.calculateNextState(c.state, rating, simulatedDate);
      totalReviews++;

      if (rating === Rating.Again) {
        // Relearned with Good on same day
        c.state = fsrs.calculateNextState(c.state, Rating.Good, new Date(simulatedDate.getTime() + 10 * 60 * 1000));
        totalReviews++;
      }
    });

    // Advance 1 day
    simulatedDate = new Date(simulatedDate.getTime() + 24 * 60 * 60 * 1000);
  }

  const learnedCount = simCards.filter(c => c.state.state === State.Review).length;
  assert(learnedCount === 10, `All 10 learned cards ended in State.Review (actual: ${learnedCount})`);
  assert(totalReviews >= 15, `Simulation performed spaced repetition reviews (total: ${totalReviews} reviews)`);

  // ----------------------------------------------------
  // TEST SUMMARY
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Lỗi chạy test suite:', err);
  process.exit(1);
});
