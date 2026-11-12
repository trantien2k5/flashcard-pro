/**
 * Test Suite: DeckManager Selectors & Nano FSRS-6 Backup Roundtrip
 */

import { DeckManager } from '../src/js/core/selectors.js';
import { StorageManager } from '../src/js/services/storage.js';
import { State } from '../src/js/core/fsrs.js';
import {
  normalizeCardState,
  normalizeBackupLog,
  serializeCompactCards,
  serializeCompactLogs
} from '../src/js/services/storage/backup.js';

console.log('🧪 BẮT ĐẦU KIỂM THỬ SELECTORS (DECK MANAGER) & NANO BACKUP ROUNDTRIP...');

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`   \x1b[32m✓\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`   \x1b[31m✗\x1b[0m ${testName}${detail ? ' - ' + detail : ''}`);
    failed++;
  }
}

async function runTests() {
  // ====================================================
  // PART A: DeckManager Initialization, Stats & Search
  // ====================================================
  const dm = new DeckManager();
  await dm.init();

  assert(dm.decks.length >= 22, 'Test 1.1: Khởi tạo tối thiểu 22 chủ đề gốc thành công', `thực tế: ${dm.decks.length}`);
  assert(dm.allCards.length >= 4000, 'Test 1.2: Nạp đầy đủ kho từ vựng CEFR >= 4.000 từ', `thực tế: ${dm.allCards.length}`);

  const coreStatsBefore = dm.getDeckStats('top-1000-core');
  assert(coreStatsBefore.total > 0, 'Test 1.3: Thống kê deck top-1000-core có tổng từ > 0', `total=${coreStatsBefore.total}`);

  const sampleCoreCard = dm.getCardsByDeckId('top-1000-core')[0];
  assert(Boolean(sampleCoreCard && sampleCoreCard.id), 'Test 1.4: Lấy được từ mẫu trong deck top-1000-core');

  const pastDue = new Date(Date.now() - 3600 * 1000).toISOString();
  StorageManager.saveCardState({
    id: sampleCoreCard.id,
    state: State.Review,
    reps: 4,
    lapses: 0,
    stability: 12.5,
    difficulty: 4.2,
    due: pastDue,
    last_review: new Date(Date.now() - 86400 * 1000).toISOString()
  });

  const coreStatsAfter = dm.getDeckStats('top-1000-core');
  assert(coreStatsAfter.dueCount >= 1, 'Test 1.5: Stats cache tự động invalidate khi Storage revision thay đổi', `dueCount=${coreStatsAfter.dueCount}`);

  const settings = { dailyNewLimit: 10, dailyReviewLimit: 20 };
  const qRes = dm.getStudyQueue('top-1000-core', settings, null, { mode: 'due_first' });
  assert(Array.isArray(qRes.queue) && qRes.queue.length > 0, 'Test 1.6: getStudyQueue tạo được hàng đợi hợp lệ');
  assert(qRes.queue.some(c => c.id === sampleCoreCard.id), 'Test 1.7: Hàng đợi due_first chứa từ đến hạn vừa lưu');

  const modeCounts = dm.getStudyModeCounts('top-1000-core', settings);
  assert(
    typeof modeCounts.dueCount === 'number' &&
    typeof modeCounts.newCount === 'number' &&
    typeof modeCounts.weakCount === 'number' &&
    typeof modeCounts.sprintCount === 'number',
    'Test 1.8: getStudyModeCounts trả đủ các bộ đếm chế độ học'
  );

  const searchRes = dm.searchCards(sampleCoreCard.word);
  assert(searchRes.some(c => c.id === sampleCoreCard.id), 'Test 1.9: searchCards tìm thấy từ vựng theo từ khóa chính xác');

  const customDeck = dm.createCustomDeck('My Test Deck', 'Bộ từ kiểm thử', '🧪', '#6366f1', [sampleCoreCard]);
  assert(
    Boolean(customDeck && customDeck.isCustom && dm.getDeckById(customDeck.id)),
    'Test 1.10: createCustomDeck đăng ký bộ đề tùy chỉnh thành công'
  );

  // ====================================================
  // PART B: Nano FSRS-6 Backup Export & Import Roundtrip
  // ====================================================
  const leechWord = dm.allCards[1];
  const leechDue = new Date(Date.now() + 86400 * 1000 * 5).toISOString();
  StorageManager.saveCardState({
    id: leechWord.id,
    state: State.Review,
    reps: 9,
    lapses: 8,
    stability: 4.75,
    difficulty: 8.3,
    isLeech: true,
    suspended: true,
    due: leechDue,
    last_review: new Date().toISOString()
  });

  StorageManager.saveSettings({
    requestRetention: 0.95,
    dailyNewLimit: 15,
    dailyReviewLimit: 30
  });

  StorageManager.logReview({
    cardId: leechWord.id,
    rating: 3,
    timestamp: new Date().toISOString(),
    latencySec: 1.45,
    backViewSec: 2.1
  });

  const backup = StorageManager.exportBackup();
  assert(backup && backup.v === '3.1' && backup.type === 'fc_fsrs_nano', 'Test 2.1: exportBackup tạo payload Nano FSRS v3.1 chuẩn');
  assert(Array.isArray(backup.c) && backup.c.length >= 2, 'Test 2.2: Payload nén positional tuples chứa đủ các thẻ đã tương tác');
  assert(Array.isArray(backup.l) && backup.l.length >= 1, 'Test 2.3: Payload nén chứa đủ study logs');

  await StorageManager.clearAllData();
  const wipedCard = StorageManager.getCardState(leechWord.id);
  assert(!wipedCard, 'Test 2.4: clearAllData xóa sạch dữ liệu thẻ trước khi khôi phục');

  const importRes = await StorageManager.importBackup(backup);
  assert(importRes && importRes.success === true, 'Test 2.5: importBackup khôi phục bản sao lưu thành công');

  const restoredSettings = StorageManager.getSettings();
  assert(
    restoredSettings.requestRetention === 0.95 && restoredSettings.dailyNewLimit === 15,
    'Test 2.6: Settings (requestRetention=0.95, dailyNewLimit=15) khôi phục chính xác',
    JSON.stringify(restoredSettings)
  );

  const restoredLeech = StorageManager.getCardState(leechWord.id);
  assert(
    Boolean(restoredLeech && restoredLeech.reps === 9 && restoredLeech.lapses === 8 && restoredLeech.isLeech === true && restoredLeech.suspended === true),
    'Test 2.7: Bit-flags (isLeech & suspended) và chỉ số FSRS của thẻ được khôi phục nguyên vẹn'
  );

  const restoredCustomDecks = StorageManager.getCustomDecks();
  assert(
    restoredCustomDecks.some(d => d.id === customDeck.id),
    'Test 2.8: Custom decks được khôi phục đầy đủ qua Backup Roundtrip'
  );

  const restoredLogs = StorageManager.getStudyLogs();
  assert(
    restoredLogs.some(l => l.cardId === leechWord.id && l.rating === 3 && Math.abs((l.latencySec || 0) - 1.45) < 0.01),
    'Test 2.9: Study logs và latencySec khôi phục chính xác'
  );

  // ====================================================
  // PART C: Backup Tuple & Legacy Format Normalizers
  // ====================================================
  const compactTuple = serializeCompactCards({
    w_sample: { state: 2, reps: 5, lapses: 1, stability: 10.256, difficulty: 5.123, isLeech: false, suspended: true, due: new Date(1700000000000).toISOString() }
  })[0];
  assert(Array.isArray(compactTuple) && compactTuple[8] === 2, 'Test 3.1: serializeCompactCards mã hóa đúng bit flag suspended (2)');

  const decodedLegacy = normalizeCardState(
    { id: 'old_word_key', s: 2, r: 6, l: 8, st: 7.5, d: 6.4, du: 1700000000 },
    { old_word_key: 'canonical_word_id' }
  );
  assert(
    decodedLegacy && decodedLegacy.id === 'canonical_word_id' && decodedLegacy.isLeech === true && decodedLegacy.reps === 6,
    'Test 3.2: normalizeCardState giải mã đúng Legacy v2 object & ánh xạ LEGACY_ID_MAP'
  );

  const logTuples = serializeCompactLogs([{ cardId: 'abc', rating: 4, timestamp: '2026-01-01T10:00:00.000Z', latencySec: 0.85, backViewSec: 1.2 }]);
  const decodedLog = normalizeBackupLog(logTuples[0]);
  assert(
    decodedLog && decodedLog.cardId === 'abc' && decodedLog.rating === 4 && decodedLog.latencySec === 0.85,
    'Test 3.3: normalizeBackupLog giải mã chính xác positional log tuple'
  );

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (failed === 0) {
    console.log(`\x1b[32m✅ TOÀN BỘ ${passed} TEST CASES SELECTORS & BACKUP ĐÃ ĐẠT 100% THÀNH CÔNG!\x1b[0m\n`);
    process.exit(0);
  } else {
    console.error(`\x1b[31m❌ CÓ ${failed}/${passed + failed} TEST CASES THẤT BẠI!\x1b[0m\n`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('❌ Lỗi không mong đợi trong test_selectors_backup:', err);
  process.exit(1);
});
