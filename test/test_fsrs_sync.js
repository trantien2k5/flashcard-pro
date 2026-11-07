/**
 * Test Suite: Kiểm Tra Tính Nhất Quán FSRS-6, Lưu Trữ & Đồng Bộ Nhãn Dán Sau Lượt Quên
 */
import { FSRS, Rating, State, isCardDue } from '../src/js/core/fsrs.js';
import { StudySession } from '../src/js/core/session.js';
import { StorageManager } from '../src/js/services/storage.js';
import { DeckManager } from '../src/js/core/selectors.js';

console.log('🧪 BẮT ĐẦU KIỂM THỬ ĐỒNG BỘ THUẬT TOÁN FSRS & LƯU TRỮ TRẠNG THÁI...');

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    console.log(`   \x1b[32m✓\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`   \x1b[31m✗\x1b[0m ${testName} - ${detail}`);
    failed++;
  }
}

// ----------------------------------------------------
// Mock môi trường Storage & DeckManager
// ----------------------------------------------------
const mockCards = {
  'test_word_1': {
    id: 'test_word_1',
    word: 'persevere',
    state: State.Review,
    stability: 5.2,
    difficulty: 5.0,
    elapsed_days: 5,
    scheduled_days: 5,
    reps: 3,
    lapses: 0,
    last_review: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    due: new Date(Date.now() - 1000).toISOString() // Đã đến hạn
  }
};

StorageManager.saveCardState(mockCards['test_word_1']);

// ====================================================
// TEST 1: Kiểm tra Thẻ đến hạn ban đầu
// ====================================================
const initialCard = StorageManager.getCardState('test_word_1');
assert(isCardDue(initialCard, new Date()), 'Test 1.1: Thẻ ban đầu ở trạng thái Đến Hạn (Due)');

// ====================================================
// TEST 2: Lượt 1 - Người dùng bấm "Quên" (Rating.Again)
// ====================================================
const queue = [
  { id: 'test_word_1', word: 'persevere' },
  { id: 'dummy_1', word: 'dummy1' },
  { id: 'dummy_2', word: 'dummy2' },
  { id: 'dummy_3', word: 'dummy3' },
  { id: 'dummy_4', word: 'dummy4' }
];

const session = new StudySession({
  relearnInSession: true,
  relearnStepOffset: 3
});

session.start(queue);
assert(session.currentCard.id === 'test_word_1', 'Test 2.1: Bắt đầu học đúng thẻ kiểm thử');

// Bấm Quên
session.rateCard(Rating.Again);

const stateAfterAgain = StorageManager.getCardState('test_word_1');
assert(stateAfterAgain.state === State.Relearning, 'Test 2.2: Trạng thái thẻ chuyển sang Relearning (State 3)');
assert(stateAfterAgain.lapses === 1, 'Test 2.3: Số lần quên (lapses) tăng lên 1');
assert(session.queue.some(c => c.id === 'test_word_1' && c._isRelearnPass === true), 'Test 2.4: Thẻ được chèn vào hàng đợi để củng cố (isRelearnPass)');

// ====================================================
// TEST 3: Học tiếp các thẻ khác cho đến khi gặp lại thẻ củng cố
// ====================================================
while (session.currentCard && (!session.currentCard._isRelearnPass || session.currentCard.id !== 'test_word_1')) {
  session.rateCard(Rating.Good);
}

assert(session.currentCard && session.currentCard.id === 'test_word_1' && session.currentCard._isRelearnPass, 'Test 3.1: Thẻ củng cố xuất hiện lại thành công trong phiên');

// ====================================================
// TEST 4: Kiểm tra Nhãn Preview trên các nút đánh giá
// ====================================================
const previews = session.currentCard.previews;
assert(previews && previews[Rating.Good], 'Test 4.1: Tính toán được preview interval cho nút Good');
assert(previews[Rating.Good].card.state === State.Review, 'Test 4.2: Preview nút Good dự báo chuyển hóa thành công về State.Review');
assert(previews[Rating.Good].card.scheduled_days >= 1, `Test 4.3: Preview nút Good có lịch ôn >= 1 ngày (thực tế: ${previews[Rating.Good].card.scheduled_days} ngày)`);

// ====================================================
// TEST 5: Lượt 2 - Người dùng bấm "Nhớ" (Rating.Good) ở lượt củng cố
// ====================================================
session.rateCard(Rating.Good);

const finalSavedState = StorageManager.getCardState('test_word_1');
assert(finalSavedState.state === State.Review, 'Test 5.1: Sau khi bấm Nhớ, trạng thái lưu vào Storage ĐÃ ĐƯỢC CHUYỂN HÓA thành Review');
assert(finalSavedState.scheduled_days >= 1, `Test 5.2: Số ngày lên lịch (scheduled_days) ĐÃ ĐƯỢC LƯU chính xác (${finalSavedState.scheduled_days} ngày)`);

const dueDiffDays = (new Date(finalSavedState.due).getTime() - Date.now()) / (24 * 60 * 60 * 1000);
assert(dueDiffDays >= 0.9, `Test 5.3: Hạn ôn (due) được dời sang tương lai (sau ${dueDiffDays.toFixed(1)} ngày)`);

// ====================================================
// TEST 6: Kiểm tra Hiện tượng "Thoát ra vào lại bị xuất hiện ngay"
// ====================================================
const nowCheck = new Date();
const isStillDue = isCardDue(finalSavedState, nowCheck);
assert(!isStillDue, 'Test 6.1: isCardDue trả về FALSE (Thẻ KHÔNG CÒN bị đến hạn ngay lập tức)');

// Giả lập mở một phiên học mới ngay sau đó
const newSessionQueue = [finalSavedState].filter(s => isCardDue(s, nowCheck));
assert(newSessionQueue.length === 0, 'Test 6.2: Mở phiên học mới không bị xuất hiện lại từ vừa học');

// ====================================================
// TEST 7: Kiểm tra vòng lặp củng cố khép kín - Quên tối đa 2 lần, lần 3 đẩy ra sau cùng
// ====================================================
const failCardState = {
  id: 'fail_card_1',
  word: 'difficult_word',
  state: State.Review,
  stability: 3.0,
  difficulty: 6.0,
  reps: 2,
  lapses: 1,
  due: new Date(Date.now() - 1000).toISOString()
};
StorageManager.saveCardState(failCardState);

const failSession = new StudySession({ relearnInSession: true, relearnStepOffset: 1 });
failSession.start([
  { id: 'fail_card_1', word: 'difficult_word' },
  { id: 'due_card_2', word: 'due2' },
  { id: 'new_card_1', word: 'new1' }
]);

failSession.rateCard(Rating.Again); // Lượt 1: Bấm Quên lần 1 (againCount = 1) -> Chèn sau 1-2 thẻ
// Tiến tới thẻ fail_card_1
while (failSession.currentCard && failSession.currentCard.id !== 'fail_card_1') {
  failSession.rateCard(Rating.Good);
}
assert(failSession.currentCard && failSession.currentCard.id === 'fail_card_1' && failSession.currentCard._isRelearnPass, 'Test 7.1: Gặp lại fail_card_1 ở lượt củng cố');

failSession.rateCard(Rating.Again); // Lượt 2: Bấm Quên lần 2 (againCount = 2) -> Tiếp tục củng cố ngắn hạn
while (failSession.currentCard && failSession.currentCard.id !== 'fail_card_1') {
  failSession.rateCard(Rating.Good);
}
assert(failSession.currentCard && failSession.currentCard.id === 'fail_card_1', 'Test 7.2: Gặp lại fail_card_1 ở lượt củng cố lần 2');

failSession.rateCard(Rating.Again); // Lượt 3: Bấm Quên lần 3 (againCount = 3) -> ĐẨY RA SAU CÙNG HÀNG ĐỢI
const lastCardInQueue = failSession.queue[failSession.queue.length - 1];
assert(lastCardInQueue.id === 'fail_card_1' && lastCardInQueue._isDeferredStubborn, 'Test 7.3: Thẻ khó nhai (quên lần 3) ĐÃ ĐƯỢC ĐẨY RA SAU CÙNG HÀNG ĐỢI');

const stateAfterThirdAgain = StorageManager.getCardState('fail_card_1');
const dueBreakMin = (new Date(stateAfterThirdAgain.due).getTime() - Date.now()) / (60 * 1000);
assert(dueBreakMin <= 1.2, `Test 7.4: Lịch hẹn FSRS Quên đồng bộ chuẩn 1m với nhãn UI preview (thực tế: ${dueBreakMin.toFixed(2)} phút)`);

// ====================================================
// TEST 8: Kiểm tra Thẻ khó (lapses >= 2, diff >= 7) sau khi bấm Good 3 ngày TUYỆT ĐỐI không xuất hiện lại trong hàng đợi cùng ngày
// ====================================================
const dm = new DeckManager();
await dm.init();

const weakCard = {
  id: 'wake-up',
  word: 'Wake up',
  state: State.Review,
  stability: 3.2,
  difficulty: 7.8,
  lapses: 2,
  reps: 4,
  last_review: new Date().toISOString(),
  due: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 ngày sau
};
StorageManager.saveCardState(weakCard);
StorageManager.logReview({
  cardId: 'wake-up',
  word: 'Wake up',
  rating: Rating.Good,
  oldState: State.Learning,
  newState: State.Review,
  scheduledDays: 3
});

const defaultStudyQueue = dm.getStudyQueue(null, { rolloverHour: 0 }, null, { mode: 'due_first' });
const inDefaultQueue = (defaultStudyQueue.queue || []).some(c => c.id === 'wake-up');
assert(!inDefaultQueue, 'Test 8.1: Thẻ khó bấm Good 3 ngày TUYỆT ĐỐI không bị xen vào hàng đợi due_first');

const weakHunterQueue = dm.getStudyQueue(null, { rolloverHour: 0 }, null, { mode: 'weak_hunter' });
const inWeakHunterQueue = (weakHunterQueue.queue || []).some(c => c.id === 'wake-up');
assert(!inWeakHunterQueue, 'Test 8.2: Thẻ khó đã học hôm nay và hạn ôn ở tương lai không xuất hiện trong weak_hunter');

// ====================================================
// TEST 9: Phiên học khi tắt củng cố (relearnInSession = false): Bấm Quên KHÔNG chèn lại vào phiên
// ====================================================
const noRelearnSession = new StudySession({ relearnInSession: false });
const noRelearnQueue = [
  { id: 'nr_1', word: 'apple' },
  { id: 'nr_2', word: 'banana' },
  { id: 'nr_3', word: 'cherry' }
];
noRelearnSession.start(noRelearnQueue);
assert(noRelearnSession.currentCard.id === 'nr_1', 'Test 9.1: Bắt đầu thẻ nr_1');
noRelearnSession.rateCard(Rating.Again);
assert(noRelearnSession.queue.length === 3, 'Test 9.2: Hàng đợi không bị chèn thêm thẻ (độ dài giữ nguyên 3)');
assert(!noRelearnSession.queue.some(c => c._isRelearnPass), 'Test 9.3: Không có thẻ củng cố _isRelearnPass trong hàng đợi');
assert(noRelearnSession.currentCard.id === 'nr_2', 'Test 9.4: Chuyển tiếp ngay sang thẻ tiếp theo');
const nrState = StorageManager.getCardState('nr_1');
const nrDueDiffMin = (new Date(nrState.due).getTime() - Date.now()) / (60 * 1000);
assert(nrDueDiffMin <= 1.2, `Test 9.5: Lịch hẹn Quên khớp chuẩn 1m với nhãn UI (thực tế: ${nrDueDiffMin.toFixed(2)} phút)`);

// ====================================================
// TEST 10: Quy tắc Từ Khó (lapses >= 8) & Ẩn Thẻ Tạm Ẩn khỏi UI Thông Báo
// ====================================================
const testCardsAttention = [
  { id: 'card_lapse_3', word: 'moderate', lapses: 3, state: State.Review },
  { id: 'card_lapse_7', word: 'frequent', lapses: 7, state: State.Review },
  { id: 'card_hard_8', word: 'difficult', lapses: 8, state: State.Review },
  { id: 'card_suspended', word: 'paused', lapses: 9, suspended: true, state: State.Review }
];

testCardsAttention.forEach(c => {
  StorageManager.saveCardState({
    id: c.id,
    word: c.word,
    state: c.state,
    stability: 2.0,
    difficulty: 6.0,
    reps: 10,
    lapses: c.lapses,
    suspended: Boolean(c.suspended),
    last_review: new Date().toISOString(),
    due: new Date().toISOString()
  });
});

const dmAttention = new DeckManager();
dmAttention.allCards = testCardsAttention;

const attentionResult = dmAttention.getAttentionCards();

assert(!attentionResult.difficultCards.some(c => c.id === 'card_lapse_3'), 'Test 10.1: Từ quên 3 lần KHÔNG hiển thị là từ khó (bỏ nhãn hay quên cũ)');
assert(!attentionResult.difficultCards.some(c => c.id === 'card_lapse_7'), 'Test 10.2: Từ quên 7 lần chưa đạt ngưỡng 8 nên KHÔNG đưa vào từ khó');
assert(attentionResult.difficultCards.some(c => c.id === 'card_hard_8'), 'Test 10.3: Từ quên 8 lần ĐƯỢC XÁC NHẬN là Từ Khó chính xác');
assert(!attentionResult.difficultCards.some(c => c.id === 'card_suspended'), 'Test 10.4: Từ tạm ẩn ĐÃ ĐƯỢC ẨN KHỎI UI thông báo theo yêu cầu');
assert(StorageManager.isCardSuspended('card_suspended'), 'Test 10.5: Logic tạm ẩn trong Storage & FSRS vẫn hoạt động ngầm trọn vẹn');
assert(attentionResult.suspendedCards.length === 0, 'Test 10.6: Danh sách suspendedCards trả về rỗng để sạch UI');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (failed === 0) {
  console.log(`\x1b[32m✅ TOÀN BỘ ${passed} TEST CASES ĐÃ ĐẠT 100% THÀNH CÔNG!\x1b[0m\n`);
} else {
  console.error(`\x1b[31m❌ CÓ ${failed} TEST CASE THẤT BẠI!\x1b[0m\n`);
  process.exit(1);
}

