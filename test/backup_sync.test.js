/**
 * Automated Test Suite for Storage Backup Export/Import & Sync Smart Merge
 */

import { StorageManager } from '../js/services/storage.js';
import { SyncManager } from '../js/services/sync.js';
import { State, Rating } from '../js/config.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runBackupSyncTests() {
  console.log('======================================================');
  console.log('🧪 RUNNING BACKUP EXPORT/IMPORT & SYNC TEST SUITE');
  console.log('======================================================\n');

  // TEST 1: Export Backup
  console.log('--- TEST GROUP 1: Export Backup Structure ---');
  const backup = StorageManager.exportBackup();
  assert(backup && typeof backup === 'object', 'Backup object is valid');
  assert(backup.version === '2.0', 'Backup version is 2.0');
  assert(typeof backup.exportDate === 'string', 'Backup has ISO exportDate');
  assert(typeof backup.settings === 'object', 'Backup includes settings');
  assert(typeof backup.cards === 'object', 'Backup includes cards');
  assert(Array.isArray(backup.logs), 'Backup includes logs array');
  assert(typeof backup.studyTime === 'object', 'Backup includes studyTime');
  assert(typeof backup.userProgress === 'object', 'Backup includes userProgress');

  // TEST 2: Import Backup with normalization
  console.log('\n--- TEST GROUP 2: Import Backup Normalization ---');
  const testPayload = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    settings: { requestRetention: 0.85, dailyNewLimit: 15 },
    cards: {
      'test_card_1': { state: State.Review, stability: 12.5, difficulty: 4.2, reps: 3, lapses: 0, scheduled_days: 12, due: '2026-09-20T00:00:00.000Z' },
      'test_card_2': { state: State.Learning, stability: 1.2, difficulty: 6.0, reps: 1, lapses: 0, scheduled_days: 0, due: '2026-09-12T15:00:00.000Z' }
    },
    logs: [
      { cardId: 'test_card_1', word: 'hello', rating: Rating.Good, timestamp: '2026-09-12T10:00:00.000Z' },
      { cardId: 'test_card_1', word: 'hello', rating: Rating.Good, timestamp: '2026-09-12T10:00:00.000Z' }, // Duplicate
      { cardId: 'test_card_2', word: 'world', rating: Rating.Hard, timestamp: '2026-09-12T11:00:00.000Z' }
    ],
    studyTime: {
      '2026-09-12': 180
    },
    userProgress: {
      completedSubtopics: ['topic_1_sub_1'],
      pinnedTopics: ['daily-life-routines']
    }
  };

  const importResult = await StorageManager.importBackup(testPayload);
  assert(importResult.success === true, 'importBackup returns success: true');
  assert(importResult.count >= 2, 'importBackup restored at least 2 cards');

  const card1 = StorageManager.getCardState('test_card_1');
  assert(card1 && card1.stability === 12.5, 'Card 1 stability restored correctly');
  assert(card1 && card1.state === State.Review, 'Card 1 state restored as Review');

  const logs = StorageManager.getStudyLogs();
  const testLogs = logs.filter(l => l.cardId === 'test_card_1');
  assert(testLogs.length === 1, 'Duplicate study logs were successfully deduplicated');

  const progress = StorageManager.getUserProgress();
  assert(progress.completedSubtopics.includes('topic_1_sub_1'), 'Completed subtopics restored correctly');
  assert(progress.pinnedTopics.includes('daily-life-routines'), 'Pinned topics restored correctly');

  // TEST 3: Smart Merge in SyncManager
  console.log('\n--- TEST GROUP 3: SyncManager Smart Merge ---');
  const incomingSync = {
    cards: {
      'test_card_1': { state: State.Review, stability: 25.0, difficulty: 3.8, reps: 4, lapses: 0, scheduled_days: 25, last_review: '2026-09-13T10:00:00.000Z' },
      'test_card_3': { state: State.Review, stability: 4.0, difficulty: 5.0, reps: 1, lapses: 0, scheduled_days: 4, last_review: '2026-09-12T12:00:00.000Z' }
    },
    logs: [
      { cardId: 'test_card_3', word: 'computer', rating: Rating.Easy, timestamp: '2026-09-12T12:00:00.000Z' }
    ],
    studyTime: {
      '2026-09-12': 300
    },
    userProgress: {
      completedSubtopics: ['topic_2_sub_1'],
      pinnedTopics: ['work-jobs']
    }
  };

  const mergeResult = SyncManager.mergeProgress(incomingSync);
  assert(mergeResult && mergeResult.data, 'mergeProgress returned valid merged data');
  assert(mergeResult.data.cards['test_card_1'].stability === 25.0, 'Newer card state replaced older state in merge');
  assert(mergeResult.data.cards['test_card_3'] !== undefined, 'New card from remote was added');
  assert(mergeResult.data.studyTime['2026-09-12'] === 300, 'Study time took max value (300s)');
  assert(mergeResult.data.userProgress.pinnedTopics.includes('daily-life-routines') && mergeResult.data.userProgress.pinnedTopics.includes('work-jobs'), 'Pinned topics from both devices merged successfully');
  assert(mergeResult.data.userProgress.completedSubtopics.includes('topic_1_sub_1') && mergeResult.data.userProgress.completedSubtopics.includes('topic_2_sub_1'), 'Completed subtopics from both devices merged successfully');

  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${passed + failed} PASSED (${failed} FAILED)`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runBackupSyncTests().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
