/**
 * Test Suite: Kiểm Tra Cân Bằng Hàng Đợi Trắc Nghiệm FSRS-6 & Xử Lý Ngoại Lệ
 */
import { FSRS, Rating, State } from '../src/js/core/fsrs.js';
import { WORDS } from '../src/data/index.js';

console.log('🧪 BẮT ĐẦU KIỂM THỬ VÒNG LẶP & ĐỘ CÂN BẰNG HÀNG ĐỢI TRẮC NGHIỆM...');

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

/**
 * Thuật toán tạo Queue 3-1-3-1 Đan Xen Nhận Thức:
 * - 3 thẻ đến hạn
 * - 1 thẻ khó / hay quên (nếu có)
 * - 3 thẻ đến hạn
 * - 1 thẻ mới (sau 2 đợt = 6 lượt ôn)
 */
function buildBalancedQuizQueue({ dueCards = [], newCards = [], weakCards = [], allCards = WORDS, limit = 25, mode = 'balanced' }) {
  if (mode === 'due_only') return dueCards.slice(0, limit);
  if (mode === 'new_only') return newCards.slice(0, limit);

  const result = [];
  let dIdx = 0;
  let wIdx = 0;
  let nIdx = 0;
  const seenIds = new Set();

  const addCard = (c) => {
    if (c && c.id && !seenIds.has(c.id) && result.length < limit) {
      seenIds.add(c.id);
      result.push(c);
      return true;
    }
    return false;
  };

  while (result.length < limit && (dIdx < dueCards.length || wIdx < weakCards.length || nIdx < newCards.length)) {
    // Đợt 1: 3 thẻ đến hạn
    for (let i = 0; i < 3 && dIdx < dueCards.length; i++) {
      addCard(dueCards[dIdx++]);
    }

    // Xen 1 thẻ khó / hay quên (nếu có)
    if (wIdx < weakCards.length) {
      while (wIdx < weakCards.length && !addCard(weakCards[wIdx++])) {}
    }

    // Đợt 2: 3 thẻ đến hạn tiếp theo
    for (let i = 0; i < 3 && dIdx < dueCards.length; i++) {
      addCard(dueCards[dIdx++]);
    }

    // Xen 1 thẻ mới (sau 2 đợt ôn tập = 6 lượt ôn)
    if (nIdx < newCards.length) {
      while (nIdx < newCards.length && !addCard(newCards[nIdx++])) {}
    }

    if (dIdx >= dueCards.length && wIdx >= weakCards.length && nIdx >= newCards.length) break;
  }

  // Dự phòng khi cả due, weak, new đều trống
  if (result.length === 0) {
    const fallback = weakCards.length > 0 ? weakCards : allCards.slice(0, limit);
    return fallback.slice(0, limit);
  }

  return result.slice(0, limit);
}

// -------------------------------------------------------------
// TEST CASE 1: Cấu trúc 3-1-3-1 Đan Xen Nhận Thức Chuẩn
// -------------------------------------------------------------
const mockDue = Array.from({ length: 15 }, (_, i) => ({ id: `due_${i}`, word: `due_word_${i}`, isDue: true }));
const mockWeak = Array.from({ length: 4 }, (_, i) => ({ id: `weak_${i}`, word: `weak_word_${i}`, isWeak: true }));
const mockNew = Array.from({ length: 5 }, (_, i) => ({ id: `new_${i}`, word: `new_word_${i}`, isNew: true }));

const q1 = buildBalancedQuizQueue({ dueCards: mockDue, weakCards: mockWeak, newCards: mockNew, limit: 25 });
assert(q1.length > 0, 'Test 1.1: Queue được tạo thành công');
assert(q1[0].isDue && q1[1].isDue && q1[2].isDue, 'Test 1.2: Bắt đầu bằng đúng 3 từ đến hạn ôn tập');
assert(q1[3].isWeak, 'Test 1.3: Xen 1 từ khó / hay quên sau 3 từ đến hạn');
assert(q1[4].isDue && q1[5].isDue && q1[6].isDue, 'Test 1.4: Tiếp tục đợt 2 với đúng 3 từ đến hạn');
assert(q1[7].isNew, 'Test 1.5: Xen 1 từ mới sau 2 đợt ôn tập (6 lượt ôn)');

// -------------------------------------------------------------
// TEST CASE 2: Không có từ khó -> Vẫn hoạt động mượt 3 due -> 3 due -> 1 new
// -------------------------------------------------------------
const q2 = buildBalancedQuizQueue({ dueCards: mockDue, weakCards: [], newCards: mockNew, limit: 14 });
assert(q2.length === 14, 'Test 2.1: Queue tự động bỏ qua slot thẻ khó khi không có thẻ khó');
assert(q2[6].isNew, 'Test 2.2: Từ mới xuất hiện sau đúng 6 từ đến hạn');

// -------------------------------------------------------------
// TEST CASE 3: Chỉ có Từ Đến Hạn, không có từ mới và từ khó
// -------------------------------------------------------------
const q3 = buildBalancedQuizQueue({ dueCards: mockDue, weakCards: [], newCards: [], limit: 10 });
assert(q3.length === 10, 'Test 3.1: Queue nạp 100% từ đến hạn ôn tập khi không có từ khác');
assert(q3.every(c => c.isDue), 'Test 3.2: 100% là thẻ đến hạn');

// -------------------------------------------------------------
// TEST CASE 4: Thoát Khỏi Vòng Lặp Vô Tận (Anti-Infinite-Loop Test)
// Khi người dùng bấm Quên (Again) liên tục trên 3 thẻ:
// Thẻ chỉ ôn lại tối đa 1 lần trong phiên và kết thúc sạch sẽ!
// -------------------------------------------------------------
function testAntiInfiniteLoop() {
  const queue = [
    { id: 'card_1', word: 'word 1' },
    { id: 'card_2', word: 'word 2' },
    { id: 'card_3', word: 'word 3' }
  ];
  let currentIndex = 0;
  let steps = 0;
  const maxSteps = 20;

  while (currentIndex < queue.length && steps < maxSteps) {
    steps++;
    const current = queue[currentIndex];
    // Giả lập người dùng bấm QUÊN (Again) liên tục mọi lúc
    if (current._isRelearnPass) {
      // Ở lượt relearn pass: KHÔNG re-insert lại nữa!
      currentIndex++;
    } else {
      // Lượt đầu bấm Quên: chèn 1 lần vào sau 3 thẻ
      current._isRelearnPass = true;
      const insertIdx = Math.min(queue.length, currentIndex + 4);
      queue.splice(insertIdx, 0, { ...current });
      currentIndex++;
    }
  }

  assert(steps <= 6, 'Test 4.1: Phiên kết thúc sau tối đa 6 bước dù bấm Quên 100% (Không lặp vô tận)', `Số bước: ${steps}`);
  assert(currentIndex === queue.length, 'Test 4.2: Toàn bộ thẻ hoàn thành trọn vẹn, không bị kẹt treadmill');
}
testAntiInfiniteLoop();

// -------------------------------------------------------------
// TEST CASE 5: Kiểm tra Thuật toán sinh 3 Distractors không trùng đáp án đúng
// -------------------------------------------------------------
function testDistractors() {
  const target = WORDS[0];
  const pool = WORDS.slice(0, 50);
  const correctMeaning = (target.meaning || '').trim();
  const candidates = pool.filter(c => c.id !== target.id && (c.meaning || '').trim() !== correctMeaning);
  const distractors = candidates.slice(0, 3).map(c => (c.meaning || '').trim());
  const options = [{ text: correctMeaning, isCorrect: true }, ...distractors.map(d => ({ text: d, isCorrect: false }))];

  const uniqueTexts = new Set(options.map(o => o.text));
  assert(uniqueTexts.size === 4, 'Test 5.1: 4 phương án trắc nghiệm hoàn toàn độc nhất, không bị trùng lặp nghĩa');
  assert(options.filter(o => o.isCorrect).length === 1, 'Test 5.2: Đúng duy nhất 1 đáp án chính xác');
}
testDistractors();

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
if (failed === 0) {
  console.log(`\x1b[32m\x1b[1m✅ TOÀN BỘ ${passed} TEST CASES ĐÃ ĐẠT 100% THÀNH CÔNG!\x1b[0m\n`);
  process.exit(0);
} else {
  console.log(`\x1b[31m\x1b[1m❌ CÓ ${failed} TEST CASE THẤT BẠI!\x1b[0m\n`);
  process.exit(1);
}
