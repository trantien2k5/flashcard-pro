# 🗺️ CODE_MAP.md — Bản Đồ Định Vị Mã Nguồn & Điểm Neo Sửa Đổi

> **Single Source of Truth (SSOT)** định vị chính xác **100% tệp tin, dải dòng code, hàm/class và điểm neo tối ưu** của dự án Flashcard English Pro.
> Tệp này được tự động cập nhật đồng bộ bằng công cụ: `npm run map` (hoặc `node scripts/locate.js --map`).

---

## ⚡ 1. Công Cụ Định Vị Siêu Tốc (CLI Symbol Locator)

Bạn hoặc AI Agent có thể tìm vị trí chính xác của bất kỳ hàm, class, hoặc tính năng nào chỉ trong **0.05s** bằng lệnh:

```bash
# Định vị theo tên hàm hoặc class
npm run locate flipCard
npm run locate StorageManager
npm run locate showDueWordsModal

# Hoặc chạy trực tiếp với Node
node scripts/locate.js "lịch ôn tập"
```

Kết quả trả về đường dẫn tệp tin, dải dòng code chính xác (`#Lxx - #Lyy`), chữ ký hàm và liên kết click mở file tức thì.

---

## 🧭 2. Bản Đồ Chi Tiết Từng Module (Detailed Symbol Directory)

### TẦNG 1: NGHIỆP VỤ & THUẬT TOÁN (Core Layer — `src/js/core/`)

#### 📁 [`src\js\core\fsrs.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js) (416 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `isCardDue` | [`#L13-L35`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L13-L35) | `function` | Kiểm tra xem thẻ đã đến hạn cần ôn tập theo thuật toán FSRS hay chưa |
| `FSRS` | [`#L37-L415`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L37-L415) | `class` | Thực thi logic nội bộ |
| `FSRS.constructor` | [`#L38-L38`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L38-L38) | `method` | Thực thi logic nội bộ |
| `FSRS.createEmptyCard` | [`#L55-L71`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L55-L71) | `method` | Tạo cấu trúc dữ liệu thẻ FSRS mới |
| `FSRS.initStability` | [`#L96-L99`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L96-L99) | `method` | Tính Stability ban đầu theo Rating FSRS-6: S_0(G) = w[G - 1] |
| `FSRS.initDifficulty` | [`#L105-L108`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L105-L108) | `method` | Tính Difficulty ban đầu theo Rating (Thang điểm 1 - 10) FSRS-6: D_0(G) = w_ |
| `FSRS.nextDifficulty` | [`#L117-L123`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L117-L123) | `method` | Cập nhật độ khó (Difficulty) sau mỗi lần ôn FSRS-6 Linear Damping & Mean Re |
| `FSRS.nextRecallStability` | [`#L130-L150`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L130-L150) | `method` | Tính Stability tiếp theo khi nhớ đúng (Rating: Hard, Good, Easy) FSRS-6 (21 |
| `FSRS.nextForgetStability` | [`#L157-L172`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L157-L172) | `method` | Tính Stability tiếp theo khi bị quên (Rating: Again) FSRS-6 (21 parameters) |
| `FSRS.rawInterval` | [`#L178-L182`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L178-L182) | `method` | Tính khoảng thời gian chính xác (dạng số thực) dựa trên Stability và Target |
| `FSRS.nextInterval` | [`#L187-L191`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L187-L191) | `method` | Tính khoảng thời gian ôn tập tiếp theo (theo ngày nguyên) dựa trên Stabilit |
| `FSRS.getFuzzedInterval` | [`#L196-L218`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L196-L218) | `method` | Tính Fuzz Factor chuẩn Anki để làm mờ ngẫu nhiên khoảng cách ôn tập, chống  |
| `FSRS.formatInterval` | [`#L398-L414`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\fsrs.js#L398-L414) | `method` | Định dạng interval thành chuỗi thân thiện chuẩn Anki (1m, 10m, 3d, 16d, 1mo |

#### 📁 [`src\js\core\optimizer.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\optimizer.js) (495 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `BehavioralOptimizer` | [`#L16-L494`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\optimizer.js#L16-L494) | `class` | ==========================================================================  |
| `BehavioralOptimizer.analyze` | [`#L21-L434`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\optimizer.js#L21-L434) | `method` | Phân tích chuyên sâu hành vi học tập thực tế và tính toán khuyến nghị cá nh |
| `BehavioralOptimizer.autoCalibrateBackground` | [`#L439-L458`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\optimizer.js#L439-L458) | `method` | Tự động phân tích và tối ưu hóa thông số FSRS-6 hoàn toàn trong nền (Zero-T |
| `BehavioralOptimizer.applyOptimizations` | [`#L463-L493`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\optimizer.js#L463-L493) | `method` | Áp dụng toàn bộ cấu hình tối ưu hóa vào StorageManager |

#### 📁 [`src\js\core\selectors.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js) (372 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `DeckManager` | [`#L18-L371`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L18-L371) | `class` | Thực thi logic nội bộ |
| `DeckManager.constructor` | [`#L19-L28`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L19-L28) | `method` | Thực thi logic nội bộ |
| `DeckManager.init` | [`#L33-L71`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L33-L71) | `method` | Khởi tạo danh mục Decks và nạp từ vựng sẵn sàng |
| `DeckManager.preloadAllWordsInBackground` | [`#L76-L97`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L76-L97) | `method` | Nạp ngầm toàn bộ từ vựng vào Map O(1) |
| `DeckManager.ensureTopicLoaded` | [`#L102-L131`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L102-L131) | `method` | Đảm bảo từ vựng của một chủ đề đã được nạp đầy đủ (On-Demand / Lazy Load) |
| `DeckManager.hydrateDeckCards` | [`#L136-L166`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L136-L166) | `method` | Hydrate danh sách thẻ của một deck từ wordsMap |
| `DeckManager.rebuildAllCardsList` | [`#L168-L179`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L168-L179) | `method` | Thực thi logic nội bộ |
| `DeckManager.getAllDecks` | [`#L181-L181`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L181-L181) | `method` | Thực thi logic nội bộ |
| `DeckManager.getDeckById` | [`#L182-L182`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L182-L182) | `method` | Thực thi logic nội bộ |
| `DeckManager.getCardsByDeckId` | [`#L184-L198`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L184-L198) | `method` | Thực thi logic nội bộ |
| `DeckManager.getDeckCards` | [`#L200-L200`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L200-L200) | `method` | Thực thi logic nội bộ |
| `DeckManager.getAllCards` | [`#L201-L201`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L201-L201) | `method` | Thực thi logic nội bộ |
| `DeckManager.getAllWords` | [`#L202-L202`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L202-L202) | `method` | Thực thi logic nội bộ |
| `DeckManager.getSubtopicCards` | [`#L207-L246`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L207-L246) | `method` | Lấy danh sách thẻ từ vựng đầy đủ của một chủ đề con (Subtopic) |
| `DeckManager.getCardById` | [`#L251-L264`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L251-L264) | `method` | Tra cứu thẻ từ vựng O(1) tức thời theo wordId |
| `DeckManager.invalidateStatsCache` | [`#L266-L269`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L266-L269) | `method` | Thực thi logic nội bộ |
| `DeckManager.getDueCards` | [`#L271-L278`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L271-L278) | `method` | Thực thi logic nội bộ |
| `DeckManager.getWeakWords` | [`#L280-L286`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L280-L286) | `method` | Thực thi logic nội bộ |
| `DeckManager.getAttentionCards` | [`#L288-L295`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L288-L295) | `method` | Thực thi logic nội bộ |
| `DeckManager.getDeckStats` | [`#L297-L317`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L297-L317) | `method` | Thực thi logic nội bộ |
| `DeckManager.getStudyQueue` | [`#L319-L319`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L319-L319) | `method` | Thực thi logic nội bộ |
| `DeckManager.getStudyModeCounts` | [`#L323-L323`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L323-L323) | `method` | Thực thi logic nội bộ |
| `DeckManager.searchCards` | [`#L330-L348`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L330-L348) | `method` | Tìm kiếm từ vựng độc nhất theo từ khóa |
| `DeckManager.createCustomDeck` | [`#L353-L370`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors.js#L353-L370) | `method` | Tạo bộ từ vựng tùy chỉnh mới |

#### 📁 [`src\js\core\selectors\deck-stats.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\deck-stats.js) (168 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `hydrateCardWithWordMap` | [`#L9-L14`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\deck-stats.js#L9-L14) | `function` | Thực thi logic nội bộ |
| `selectDueCards` | [`#L19-L19`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\deck-stats.js#L19-L19) | `function` | Lấy danh sách thẻ tới hạn cần ôn tập (Bỏ qua thẻ bị tạm dừng) |
| `selectWeakWords` | [`#L38-L38`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\deck-stats.js#L38-L38) | `function` | Lấy danh sách từ vựng yếu / hay quên nhất ("Bệnh Án Từ Vựng") Tiêu chí: Từn |
| `selectAttentionCards` | [`#L76-L76`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\deck-stats.js#L76-L76) | `function` | Lấy danh sách từ khó (ngưỡng quên lapses >= 8 hoặc isLeech === true). Ẩn th |
| `computeDeckStats` | [`#L115-L166`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\deck-stats.js#L115-L166) | `function` | Tính toán thống kê tiến độ học của một bộ thẻ (New, Learning, Review, Maste |

#### 📁 [`src\js\core\selectors\queue-scoring.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\queue-scoring.js) (168 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getCefrTierScore` | [`#L10-L30`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\queue-scoring.js#L10-L30) | `function` | Thực thi logic nội bộ |
| `scoreAndSortNewCards` | [`#L35-L72`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\queue-scoring.js#L35-L72) | `function` | Chấm điểm ưu tiên cho từng từ mới theo bậc CEFR tuần tự, mục tiêu học và từ |
| `interleaveDueWeakNew` | [`#L77-L118`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\queue-scoring.js#L77-L118) | `function` | SSOT: Phân bổ hàng đợi học chính theo tỷ lệ 5 từ đến hạn : 1 từ mới, bổ sun |
| `addCard` | [`#L86-L93`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\queue-scoring.js#L86-L93) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\core\selectors\study-queue.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\study-queue.js) (297 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `resolveTargetCards` | [`#L16-L74`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\study-queue.js#L16-L74) | `function` | Thực thi logic nội bộ |
| `selectQueueByMode` | [`#L76-L76`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\study-queue.js#L76-L76) | `function` | Thực thi logic nội bộ |
| `buildStudyQueue` | [`#L117-L117`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\study-queue.js#L117-L117) | `function` | Xây dựng hàng đợi học tập thông minh theo thuật toán FSRS và quy tắc phân b |
| `isCardStudiedToday` | [`#L139-L142`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\study-queue.js#L139-L142) | `arrow_function` | Thực thi logic nội bộ |
| `computeStudyModeCounts` | [`#L288-L288`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\selectors\study-queue.js#L288-L288) | `function` | Thống kê số lượng thẻ tương ứng cho từng Chế Độ Học Có Chủ Đích |

#### 📁 [`src\js\core\session.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js) (546 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `preloadCardImage` | [`#L27-L54`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L27-L54) | `function` | Tải trước và giải mã hình ảnh vào GPU/Browser RAM cache Đảm bảo khi hiển th |
| `StudySession` | [`#L56-L545`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L56-L545) | `class` | Thực thi logic nội bộ |
| `StudySession.constructor` | [`#L57-L57`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L57-L57) | `method` | Thực thi logic nội bộ |
| `StudySession.updateSettings` | [`#L101-L119`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L101-L119) | `method` | Thực thi logic nội bộ |
| `StudySession.start` | [`#L124-L175`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L124-L175) | `method` | Khởi động phiên học với hàng đợi thẻ (queue) & Kích hoạt tải trước âm thanh |
| `StudySession.preloadSessionAudio` | [`#L180-L189`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L180-L189) | `method` | Tải trước âm thanh cho thẻ hiện tại và thẻ kế tiếp (nhẹ nhàng, không nghẽn  |
| `StudySession.preloadSessionImages` | [`#L194-L211`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L194-L211) | `method` | Tải trước hình ảnh trong phiên học chỉ khi người dùng BẬT hiển thị hình ảnh |
| `StudySession.loadCurrentCard` | [`#L213-L281`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L213-L281) | `method` | Thực thi logic nội bộ |
| `StudySession.flipCard` | [`#L283-L286`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L283-L286) | `method` | Thực thi logic nội bộ |
| `StudySession.rateCard` | [`#L291-L291`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L291-L291) | `method` | Đánh giá thẻ với điểm FSRS (Again: 1, Hard: 2, Good: 3, Easy: 4) |
| `StudySession.stepNextAutoplayCard` | [`#L484-L497`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L484-L497) | `method` | Chuyển sang thẻ tiếp theo trong chế độ Auto-Play (Nghe/Xem thụ động) Giữ ng |
| `StudySession.suspendCurrentCard` | [`#L502-L511`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L502-L511) | `method` | Tạm dừng thẻ hiện tại và chuyển sang thẻ tiếp theo |
| `StudySession.resetCurrentCard` | [`#L516-L523`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L516-L523) | `method` | Đặt lại tiến độ thẻ hiện tại về New |
| `StudySession.speak` | [`#L528-L530`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L528-L530) | `method` | Phát âm từ vựng với Dual Native Audio Engine |
| `StudySession.speakTTS` | [`#L535-L537`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L535-L537) | `method` | Phát âm bằng giọng đọc Neural/Natural của trình duyệt (Web Speech API) |
| `StudySession.stopAudio` | [`#L542-L544`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\session.js#L542-L544) | `method` | Dừng toàn bộ âm thanh đang phát an toàn |

#### 📁 [`src\js\core\stats.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js) (82 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `StatsManager` | [`#L29-L81`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L29-L81) | `class` | Thực thi logic nội bộ |
| `StatsManager.getMemoryIntelligence` | [`#L30-L32`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L30-L32) | `method` | Thực thi logic nội bộ |
| `StatsManager.getOverallStats` | [`#L34-L36`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L34-L36) | `method` | Thực thi logic nội bộ |
| `StatsManager.calculateStreak` | [`#L38-L40`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L38-L40) | `method` | Thực thi logic nội bộ |
| `StatsManager.detectBrokenStreak` | [`#L42-L44`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L42-L44) | `method` | Thực thi logic nội bộ |
| `StatsManager.getComprehensionPower` | [`#L46-L48`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L46-L48) | `method` | Thực thi logic nội bộ |
| `StatsManager.getCefrRoadmapAndForecast` | [`#L50-L50`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L50-L50) | `method` | Thực thi logic nội bộ |
| `StatsManager.getDailyMicroQuests` | [`#L54-L54`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L54-L54) | `method` | Thực thi logic nội bộ |
| `StatsManager.getPrimeStudyHour` | [`#L58-L60`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L58-L60) | `method` | Thực thi logic nội bộ |
| `StatsManager.getWeeklyProgress` | [`#L62-L64`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L62-L64) | `method` | Thực thi logic nội bộ |
| `StatsManager.get7DaysForecast` | [`#L66-L68`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L66-L68) | `method` | Thực thi logic nội bộ |
| `StatsManager.getMonthJournalData` | [`#L70-L72`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L70-L72) | `method` | Thực thi logic nội bộ |
| `StatsManager.getYearJournalData` | [`#L74-L76`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L74-L76) | `method` | Thực thi logic nội bộ |
| `StatsManager.getYearlyJournalData` | [`#L78-L80`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats.js#L78-L80) | `method` | Thực thi logic nội bộ |

#### 📁 [`src\js\core\stats\journal.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\journal.js) (373 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getPrimeStudyHour` | [`#L10-L58`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\journal.js#L10-L58) | `function` | Thực thi logic nội bộ |
| `getWeeklyProgress` | [`#L63-L98`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\journal.js#L63-L98) | `function` | Lấy số từ ghi nhớ được / tích lũy theo từng ngày trong 7 ngày qua |
| `get7DaysForecast` | [`#L103-L137`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\journal.js#L103-L137) | `function` | Dự báo số thẻ đến hạn trong 7 ngày tới |
| `getMonthJournalData` | [`#L144-L312`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\journal.js#L144-L312) | `function` | Lấy dữ liệu nhật ký ô vuông theo tháng phong cách Trader (P&L Calendar) @pa |
| `getYearJournalData` | [`#L318-L363`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\journal.js#L318-L363) | `function` | Lấy dữ liệu 12 tháng trong năm (Year Overview) @param {number} year - Năm ( |
| `getYearlyJournalData` | [`#L368-L370`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\journal.js#L368-L370) | `function` | Alias cho getYearJournalData để đảm bảo tương thích ngược |

#### 📁 [`src\js\core\stats\memory.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\memory.js) (235 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getMemoryIntelligence` | [`#L12-L233`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\memory.js#L12-L233) | `function` | Phân tích chuyên sâu Trí Nhớ Thật & Năng Lực Nhận Thức FSRS-6. |
| `pct` | [`#L137-L145`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\memory.js#L137-L145) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\core\stats\overview.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\overview.js) (114 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getOverallStats` | [`#L14-L112`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\overview.js#L14-L112) | `function` | Tính toán toàn bộ chỉ số thống kê tổng hợp. |

#### 📁 [`src\js\core\stats\roadmap.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\roadmap.js) (424 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getComprehensionPower` | [`#L12-L74`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\roadmap.js#L12-L74) | `function` | Thực thi logic nội bộ |
| `getCefrRoadmapAndForecast` | [`#L79-L79`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\roadmap.js#L79-L79) | `function` | Tính toán toàn diện Lộ trình Trình độ CEFR & Dự báo nhịp độ học thích ứng ( |
| `getDailyMicroQuests` | [`#L367-L367`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\roadmap.js#L367-L367) | `function` | Tính toán trạng thái 3 Nhiệm Vụ Nhỏ Hôm Nay (Daily 3-Step Micro-Quests) |

#### 📁 [`src\js\core\stats\streak-analytics.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\streak-analytics.js) (197 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `buildStudiedDateSets` | [`#L10-L37`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\streak-analytics.js#L10-L37) | `function` | Thực thi logic nội bộ |
| `calculateStreak` | [`#L42-L124`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\streak-analytics.js#L42-L124) | `function` | Tính toán chuỗi ngày học liên tục (Streak), tích hợp Khiên, Auto-heal & đồn |
| `detectBrokenStreak` | [`#L129-L195`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\streak-analytics.js#L129-L195) | `function` | Phân tích chuỗi ngày học vừa đứt trong 24h - 48h gần nhất để phục vụ cứu ch |
| `isValidDate` | [`#L139-L151`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\stats\streak-analytics.js#L139-L151) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\core\timer.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js) (254 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `StudyTimeTracker` | [`#L8-L250`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L8-L250) | `class` | Thực thi logic nội bộ |
| `StudyTimeTracker.constructor` | [`#L9-L25`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L9-L25) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker.subscribe` | [`#L30-L38`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L30-L38) | `method` | Đăng ký lắng nghe nhịp tick thời gian học trực tiếp (cho Header Quiz/Study) |
| `StudyTimeTracker.unsubscribe` | [`#L40-L42`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L40-L42) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker._notifySubscribers` | [`#L44-L53`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L44-L53) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker.getTimerState` | [`#L55-L64`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L55-L64) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker.formatDuration` | [`#L66-L77`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L66-L77) | `method` | Thực thi logic nội bộ |
| `pad` | [`#L70-L75`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L70-L75) | `arrow_function` | Thực thi logic nội bộ |
| `StudyTimeTracker.startSession` | [`#L82-L108`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L82-L108) | `method` | Bắt đầu theo dõi thời gian cho phiên học (Study/Quiz Modal) |
| `StudyTimeTracker.recordActivity` | [`#L113-L125`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L113-L125) | `method` | Ghi nhận người dùng vừa có hành vi học (lật thẻ, chấm điểm, nghe âm thanh,  |
| `StudyTimeTracker._onVisibilityChange` | [`#L130-L138`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L130-L138) | `method` | Tạm dừng hoặc tiếp tục khi tab thay đổi trạng thái ẩn/hiện |
| `StudyTimeTracker.pause` | [`#L140-L146`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L140-L146) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker.resume` | [`#L148-L156`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L148-L156) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker._startTicker` | [`#L158-L163`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L158-L163) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker._tick` | [`#L165-L202`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L165-L202) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker.flush` | [`#L207-L221`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L207-L221) | `method` | Lưu số giây tích lũy vào StorageManager |
| `StudyTimeTracker.endSession` | [`#L226-L249`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\core\timer.js#L226-L249) | `method` | Kết thúc phiên học, gỡ bỏ listeners và flush toàn bộ thời gian còn lại |

---

### TẦNG 2: DỊCH VỤ & LƯU TRỮ (Services Layer — `src/js/services/`)

#### 📁 [`src\js\services\audio.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js) (485 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `onAudioPlayStateChange` | [`#L21-L27`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L21-L27) | `function` | Đăng ký lắng nghe trạng thái phát âm thanh (để cập nhật UI equalizer sống đ |
| `notifyPlayState` | [`#L29-L37`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L29-L37) | `function` | Thực thi logic nội bộ |
| `unlockAudioContext` | [`#L42-L59`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L42-L59) | `function` | Mở khóa quyền Autoplay của trình duyệt qua thao tác đầu tiên của người dùng |
| `handleFirstInteraction` | [`#L62-L68`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L62-L68) | `arrow_function` | Thực thi logic nội bộ |
| `scoreVoice` | [`#L75-L100`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L75-L100) | `function` | Thực thi logic nội bộ |
| `initVoiceCache` | [`#L102-L124`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L102-L124) | `function` | Thực thi logic nội bộ |
| `update` | [`#L104-L117`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L104-L117) | `arrow_function` | Thực thi logic nội bộ |
| `getNativeAudioUrls` | [`#L134-L168`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L134-L168) | `function` | SĂN TẤT CẢ GIỌNG BẢN XỨ (Native Audio Hunter Engine): Tạo danh sách URL âm  |
| `preloadWordAudio` | [`#L173-L228`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L173-L228) | `function` | Tải trước (Preload) 1 từ vựng vào bộ nhớ đệm RAM |
| `preloadBothAccents` | [`#L233-L237`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L233-L237) | `function` | Tải trước cả 2 giọng US và UK cho danh sách thẻ |
| `stopAudio` | [`#L242-L256`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L242-L256) | `function` | Dừng toàn bộ âm thanh đang phát |
| `speakTTS` | [`#L261-L327`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L261-L327) | `function` | Phát âm bằng giọng đọc Neural/Natural của trình duyệt (Web Speech API) |
| `finish` | [`#L301-L304`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L301-L304) | `arrow_function` | Thực thi logic nội bộ |
| `speak` | [`#L332-L332`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L332-L332) | `function` | Phát âm từ vựng với Dual Native Audio Engine & Kích hoạt hiệu ứng Equalizer |
| `handleEnded` | [`#L365-L371`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L365-L371) | `arrow_function` | Thực thi logic nội bộ |
| `handlePlaying` | [`#L373-L376`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L373-L376) | `arrow_function` | Thực thi logic nội bộ |
| `speakVi` | [`#L424-L483`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L424-L483) | `function` | Phát âm Tiếng Việt (Web Speech API vi-VN) |
| `finish` | [`#L460-L464`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\audio.js#L460-L464) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\services\storage.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js) (186 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `StorageManager` | [`#L72-L137`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L72-L137) | `class` | Thực thi logic nội bộ |
| `StorageManager.getStateRevision` | [`#L73-L73`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L73-L73) | `method` | Thực thi logic nội bộ |
| `StorageManager.bumpStateRevision` | [`#L74-L74`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L74-L74) | `method` | Thực thi logic nội bộ |
| `StorageManager.initStorage` | [`#L76-L76`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L76-L76) | `method` | Thực thi logic nội bộ |
| `StorageManager.invalidateCache` | [`#L77-L77`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L77-L77) | `method` | Thực thi logic nội bộ |
| `StorageManager.flushPendingSync` | [`#L78-L78`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L78-L78) | `method` | Thực thi logic nội bộ |
| `StorageManager.getSettings` | [`#L80-L80`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L80-L80) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveSettings` | [`#L81-L81`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L81-L81) | `method` | Thực thi logic nội bộ |
| `StorageManager.getAllCardStates` | [`#L83-L83`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L83-L83) | `method` | Thực thi logic nội bộ |
| `StorageManager.getCardState` | [`#L84-L84`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L84-L84) | `method` | Thực thi logic nội bộ |
| `StorageManager.applyCardReview` | [`#L85-L85`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L85-L85) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveCardState` | [`#L86-L86`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L86-L86) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveMultipleCardStates` | [`#L87-L87`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L87-L87) | `method` | Thực thi logic nội bộ |
| `StorageManager.suspendCard` | [`#L88-L88`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L88-L88) | `method` | Thực thi logic nội bộ |
| `StorageManager.unsuspendCard` | [`#L89-L89`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L89-L89) | `method` | Thực thi logic nội bộ |
| `StorageManager.resetLeechStatus` | [`#L90-L90`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L90-L90) | `method` | Thực thi logic nội bộ |
| `StorageManager.toggleCardSuspended` | [`#L91-L91`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L91-L91) | `method` | Thực thi logic nội bộ |
| `StorageManager.resetCardProgress` | [`#L92-L92`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L92-L92) | `method` | Thực thi logic nội bộ |
| `StorageManager.isCardSuspended` | [`#L93-L93`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L93-L93) | `method` | Thực thi logic nội bộ |
| `StorageManager.recordStudiedDate` | [`#L95-L95`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L95-L95) | `method` | Thực thi logic nội bộ |
| `StorageManager.logReview` | [`#L96-L96`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L96-L96) | `method` | Thực thi logic nội bộ |
| `StorageManager.getStudyLogs` | [`#L97-L97`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L97-L97) | `method` | Thực thi logic nội bộ |
| `StorageManager.getStudyTimeMap` | [`#L98-L98`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L98-L98) | `method` | Thực thi logic nội bộ |
| `StorageManager.getTodayStudySeconds` | [`#L99-L99`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L99-L99) | `method` | Thực thi logic nội bộ |
| `StorageManager.getTotalStudySeconds` | [`#L100-L100`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L100-L100) | `method` | Thực thi logic nội bộ |
| `StorageManager.addStudySeconds` | [`#L101-L101`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L101-L101) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveToeicTestResult` | [`#L103-L103`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L103-L103) | `method` | Thực thi logic nội bộ |
| `StorageManager.getToeicTestHistory` | [`#L104-L104`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L104-L104) | `method` | Thực thi logic nội bộ |
| `StorageManager.getUserProgress` | [`#L106-L106`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L106-L106) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveUserProgress` | [`#L107-L107`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L107-L107) | `method` | Thực thi logic nội bộ |
| `StorageManager.completeSubtopic` | [`#L108-L108`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L108-L108) | `method` | Thực thi logic nội bộ |
| `StorageManager.isSubtopicCompleted` | [`#L109-L109`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L109-L109) | `method` | Thực thi logic nội bộ |
| `StorageManager.getPinnedTopicIds` | [`#L111-L111`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L111-L111) | `method` | Thực thi logic nội bộ |
| `StorageManager.isTopicPinned` | [`#L112-L112`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L112-L112) | `method` | Thực thi logic nội bộ |
| `StorageManager.togglePinTopic` | [`#L113-L113`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L113-L113) | `method` | Thực thi logic nội bộ |
| `StorageManager.getStreakState` | [`#L115-L115`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L115-L115) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveStreakState` | [`#L116-L116`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L116-L116) | `method` | Thực thi logic nội bộ |
| `StorageManager.useStreakFreeze` | [`#L117-L117`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L117-L117) | `method` | Thực thi logic nội bộ |
| `StorageManager.redeemStreak` | [`#L118-L118`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L118-L118) | `method` | Thực thi logic nội bộ |
| `StorageManager.checkAndAwardStreakFreeze` | [`#L119-L119`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L119-L119) | `method` | Thực thi logic nội bộ |
| `StorageManager.getCustomDecks` | [`#L121-L121`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L121-L121) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveCustomDeck` | [`#L122-L122`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L122-L122) | `method` | Thực thi logic nội bộ |
| `StorageManager.deleteCustomDeck` | [`#L123-L123`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L123-L123) | `method` | Thực thi logic nội bộ |
| `StorageManager.createSafetySnapshot` | [`#L125-L125`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L125-L125) | `method` | Thực thi logic nội bộ |
| `StorageManager.restoreSafetySnapshot` | [`#L126-L126`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L126-L126) | `method` | Thực thi logic nội bộ |
| `StorageManager.getUserProfile` | [`#L128-L128`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L128-L128) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveUserProfile` | [`#L129-L129`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L129-L129) | `method` | Thực thi logic nội bộ |
| `StorageManager.getUserPreferences` | [`#L130-L130`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L130-L130) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveUserPreferences` | [`#L131-L131`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L131-L131) | `method` | Thực thi logic nội bộ |
| `StorageManager.exportBackup` | [`#L133-L133`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L133-L133) | `method` | Thực thi logic nội bộ |
| `StorageManager.exportCompactBackup` | [`#L134-L134`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L134-L134) | `method` | Thực thi logic nội bộ |
| `StorageManager.importBackup` | [`#L135-L135`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L135-L135) | `method` | Thực thi logic nội bộ |
| `StorageManager.clearAllData` | [`#L136-L136`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L136-L136) | `method` | Thực thi logic nội bộ |
| `BackupService` | [`#L143-L176`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L143-L176) | `class` | Thực thi logic nội bộ |
| `BackupService.exportToJSON` | [`#L147-L150`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L147-L150) | `method` | Xuất toàn bộ dữ liệu người dùng ra tệp sao lưu Nano JSON siêu nhẹ (.json) |
| `BackupService.importFromFile` | [`#L155-L168`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L155-L168) | `method` | Nhập dữ liệu từ tệp File hoặc văn bản JSON đã sao lưu |
| `BackupService.resetAll` | [`#L173-L175`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage.js#L173-L175) | `method` | Đặt lại toàn bộ dữ liệu và tiến trình học về trạng thái ban đầu |

#### 📁 [`src\js\services\storage\backup.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\backup.js) (232 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `serializeCompactCards` | [`#L10-L10`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\backup.js#L10-L10) | `function` | Nén mảng trạng thái thẻ FSRS sang dạng mảng Positional Tuples rút gọn |
| `serializeCompactLogs` | [`#L47-L58`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\backup.js#L47-L58) | `function` | Nén lịch sử học tập logs sang định dạng tuple rút gọn |
| `normalizeCardState` | [`#L93-L93`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\backup.js#L93-L93) | `function` | Chuẩn hóa trạng thái thẻ từ cả định dạng Positional Tuple rút gọn lẫn Legac |
| `normalizeBackupLog` | [`#L155-L169`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\backup.js#L155-L169) | `function` | Chuẩn hóa một item log lịch sử học tập |
| `triggerJSONDownload` | [`#L174-L210`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\backup.js#L174-L210) | `function` | Kích hoạt tải tệp JSON về trình duyệt an toàn |
| `readBackupFileText` | [`#L215-L231`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\backup.js#L215-L231) | `function` | Đọc nội dung file sao lưu (hỗ trợ giải nén GZIP .gz / .fcpro nếu có) |

#### 📁 [`src\js\services\storage\cards.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js) (221 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `createInitialCardRecord` | [`#L18-L18`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L18-L18) | `function` | Thực thi logic nội bộ |
| `getAllCardStates` | [`#L37-L49`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L37-L49) | `function` | Thực thi logic nội bộ |
| `getCardState` | [`#L51-L63`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L51-L63) | `function` | Thực thi logic nội bộ |
| `applyCardReview` | [`#L69-L69`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L69-L69) | `function` | Chấm điểm và cập nhật trạng thái FSRS cho từ vựng (Single Source of Truth)  |
| `saveCardState` | [`#L97-L119`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L97-L119) | `function` | Thực thi logic nội bộ |
| `saveMultipleCardStates` | [`#L121-L151`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L121-L151) | `function` | Thực thi logic nội bộ |
| `suspendCard` | [`#L156-L162`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L156-L162) | `function` | Tạm dừng thẻ (Suspend) - ẩn khỏi hàng đợi ôn tập |
| `unsuspendCard` | [`#L167-L174`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L167-L174) | `function` | Bỏ tạm dừng thẻ (Unsuspend) |
| `resetLeechStatus` | [`#L179-L186`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L179-L186) | `function` | Đặt lại cờ thẻ khó và đưa thẻ trở lại hàng đợi học tập |
| `toggleCardSuspended` | [`#L191-L200`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L191-L200) | `function` | Đảo trạng thái tạm dừng của thẻ |
| `resetCardProgress` | [`#L205-L210`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L205-L210) | `function` | Đặt lại tiến độ thẻ về từ mới hoàn toàn (Reset / Forget) |
| `isCardSuspended` | [`#L215-L219`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\cards.js#L215-L219) | `function` | Kiểm tra xem thẻ có đang bị tạm dừng hay không |

#### 📁 [`src\js\services\storage\idb.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\idb.js) (135 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `openIndexedDB` | [`#L19-L62`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\idb.js#L19-L62) | `function` | Thực thi logic nội bộ |
| `getAllFromStore` | [`#L64-L77`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\idb.js#L64-L77) | `function` | Thực thi logic nội bộ |
| `putToStore` | [`#L79-L97`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\idb.js#L79-L97) | `function` | Thực thi logic nội bộ |
| `migrateLegacyCardStates` | [`#L102-L133`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\idb.js#L102-L133) | `function` | Tự động di chuyển tiến độ học của các ID cũ sang Canonical ID chuẩn sau khi |

#### 📁 [`src\js\services\storage\logs.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js) (217 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getSettings` | [`#L18-L29`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L18-L29) | `function` | Thực thi logic nội bộ |
| `saveSettings` | [`#L31-L45`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L31-L45) | `function` | Thực thi logic nội bộ |
| `getStreakState` | [`#L47-L62`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L47-L62) | `function` | Thực thi logic nội bộ |
| `saveStreakState` | [`#L64-L76`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L64-L76) | `function` | Thực thi logic nội bộ |
| `useStreakFreeze` | [`#L78-L84`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L78-L84) | `function` | Thực thi logic nội bộ |
| `redeemStreak` | [`#L86-L92`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L86-L92) | `function` | Thực thi logic nội bộ |
| `checkAndAwardStreakFreeze` | [`#L94-L104`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L94-L104) | `function` | Thực thi logic nội bộ |
| `getStudyLogs` | [`#L106-L117`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L106-L117) | `function` | Thực thi logic nội bộ |
| `getStudyTimeMap` | [`#L119-L130`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L119-L130) | `function` | Thực thi logic nội bộ |
| `recordStudiedDate` | [`#L136-L156`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L136-L156) | `function` | Ghi nhận ngày học hợp lệ vào hệ thống (lưu trữ vĩnh viễn không bị cắt 500 l |
| `logReview` | [`#L158-L179`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L158-L179) | `function` | Thực thi logic nội bộ |
| `getTodayStudySeconds` | [`#L181-L185`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L181-L185) | `function` | Thực thi logic nội bộ |
| `getTotalStudySeconds` | [`#L187-L194`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L187-L194) | `function` | Thực thi logic nội bộ |
| `addStudySeconds` | [`#L196-L215`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\logs.js#L196-L215) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\services\storage\preload.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\preload.js) (187 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `reconcileCardsFromIdb` | [`#L11-L36`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\preload.js#L11-L36) | `function` | Thực thi logic nội bộ |
| `mergeStudiedDatesFromTimestamps` | [`#L38-L56`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\preload.js#L38-L56) | `function` | Thực thi logic nội bộ |
| `reconcileLogsFromIdb` | [`#L58-L79`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\preload.js#L58-L79) | `function` | Thực thi logic nội bộ |
| `reconcileStudyTimeFromIdb` | [`#L81-L103`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\preload.js#L81-L103) | `function` | Thực thi logic nội bộ |
| `preloadFromIndexedDB` | [`#L108-L165`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\preload.js#L108-L165) | `function` | Nạp trước dữ liệu từ IndexedDB vào RAM Cache và hòa giải với LocalStorage |
| `initStorage` | [`#L170-L185`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\preload.js#L170-L185) | `function` | Khởi tạo kết nối IndexedDB và nạp trước dữ liệu vào RAM Cache |

#### 📁 [`src\js\services\storage\state.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js) (169 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getStateRevision` | [`#L52-L54`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L52-L54) | `function` | Trả về phiên bản revision hiện tại của trạng thái lưu trữ |
| `bumpStateRevision` | [`#L59-L61`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L59-L61) | `function` | Tăng bộ đếm revision sau khi trạng thái thay đổi đáng kể |
| `migrateLegacyCardStates` | [`#L66-L68`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L66-L68) | `function` | Tự động di chuyển tiến độ học của các ID cũ sang Canonical ID chuẩn |
| `invalidateCache` | [`#L73-L81`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L73-L81) | `function` | Đặt lại toàn bộ bộ nhớ đệm RAM (buộc đọc lại từ nguồn lưu trữ) |
| `clearPendingSyncTimers` | [`#L86-L90`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L86-L90) | `function` | Hủy các bộ hẹn giờ đồng bộ LocalStorage đang chờ |
| `putToIdb` | [`#L95-L104`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L95-L104) | `function` | Ghi ngầm một bản ghi vào IndexedDB Store không chặn luồng giao diện |
| `writeCacheToLocalStorage` | [`#L106-L115`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L106-L115) | `function` | Thực thi logic nội bộ |
| `scheduleCardsLocalStorageSync` | [`#L117-L124`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L117-L124) | `function` | Thực thi logic nội bộ |
| `scheduleLogsLocalStorageSync` | [`#L126-L134`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L126-L134) | `function` | Thực thi logic nội bộ |
| `scheduleTimeLocalStorageSync` | [`#L136-L143`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L136-L143) | `function` | Thực thi logic nội bộ |
| `flushPendingSync` | [`#L148-L167`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\state.js#L148-L167) | `function` | Đẩy ngay mọi dữ liệu đang chờ debounce vào LocalStorage (khi đóng trang) |

#### 📁 [`src\js\services\storage\streak.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\streak.js) (88 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `applyStreakFreeze` | [`#L11-L27`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\streak.js#L11-L27) | `function` | Áp dụng vật phẩm đóng băng chuỗi (Streak Freeze) cho một ngày bị lỡ |
| `applyStreakRedeem` | [`#L32-L47`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\streak.js#L32-L47) | `function` | Khôi phục chuỗi ngày học bằng lượt cứu trợ (Streak Redeem) |
| `evaluateStreakReward` | [`#L52-L87`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\streak.js#L52-L87) | `function` | Kiểm tra và trao thưởng đóng băng chuỗi khi đạt các cột mốc streak (mỗi 7 n |

#### 📁 [`src\js\services\storage\sync.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\sync.js) (349 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `writeBatchToIdbStore` | [`#L38-L49`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\sync.js#L38-L49) | `function` | Thực thi logic nội bộ |
| `exportCompactBackup` | [`#L54-L66`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\sync.js#L54-L66) | `function` | Xuất bản sao lưu Nano FSRS siêu nhẹ (giảm 85-95% dung lượng, giữ 100% dữ li |
| `importBackup` | [`#L68-L263`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\sync.js#L68-L263) | `function` | Thực thi logic nội bộ |
| `createSafetySnapshot` | [`#L268-L283`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\sync.js#L268-L283) | `function` | Tự động chụp bản sao lưu bảo hiểm an toàn (Safety Snapshot) trước khi thao  |
| `restoreSafetySnapshot` | [`#L288-L302`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\sync.js#L288-L302) | `function` | Khôi phục bản sao lưu bảo hiểm gần nhất |
| `clearAllData` | [`#L304-L347`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\sync.js#L304-L347) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\services\storage\user-data.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js) (246 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `saveToeicTestResult` | [`#L12-L30`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L12-L30) | `function` | Thực thi logic nội bộ |
| `getToeicTestHistory` | [`#L32-L41`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L32-L41) | `function` | Thực thi logic nội bộ |
| `getUserProgress` | [`#L47-L58`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L47-L58) | `function` | Thực thi logic nội bộ |
| `saveUserProgress` | [`#L60-L70`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L60-L70) | `function` | Thực thi logic nội bộ |
| `completeSubtopic` | [`#L72-L82`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L72-L82) | `function` | Thực thi logic nội bộ |
| `isSubtopicCompleted` | [`#L84-L88`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L84-L88) | `function` | Thực thi logic nội bộ |
| `getPinnedTopicIds` | [`#L94-L100`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L94-L100) | `function` | Thực thi logic nội bộ |
| `isTopicPinned` | [`#L102-L106`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L102-L106) | `function` | Thực thi logic nội bộ |
| `togglePinTopic` | [`#L108-L125`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L108-L125) | `function` | Thực thi logic nội bộ |
| `getCustomDecks` | [`#L131-L142`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L131-L142) | `function` | Thực thi logic nội bộ |
| `saveCustomDeck` | [`#L144-L161`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L144-L161) | `function` | Thực thi logic nội bộ |
| `deleteCustomDeck` | [`#L163-L182`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L163-L182) | `function` | Thực thi logic nội bộ |
| `getUserProfile` | [`#L188-L200`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L188-L200) | `function` | Thực thi logic nội bộ |
| `saveUserProfile` | [`#L202-L210`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L202-L210) | `function` | Thực thi logic nội bộ |
| `getUserPreferences` | [`#L212-L231`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L212-L231) | `function` | Thực thi logic nội bộ |
| `saveUserPreferences` | [`#L233-L244`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\services\storage\user-data.js#L233-L244) | `function` | Thực thi logic nội bộ |

---

### TẦNG 3: MÀN HÌNH GIAO DIỆN (Presentation Views — `src/js/views/`)

#### 📁 [`src\js\views\components.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components.js) (22 dòng)

*Tệp cấu hình hoặc dữ liệu, không chứa khai báo hàm/class lớn.*

#### 📁 [`src\js\views\decks.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks.js) (377 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `savePinnedDecks` | [`#L40-L44`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks.js#L40-L44) | `function` | Thực thi logic nội bộ |
| `getDeckCategory` | [`#L69-L82`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks.js#L69-L82) | `function` | Thực thi logic nội bộ |
| `renderDecksTabShell` | [`#L88-L143`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks.js#L88-L143) | `function` | Thực thi logic nội bộ |
| `renderDecksTab` | [`#L145-L343`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks.js#L145-L343) | `function` | Thực thi logic nội bộ |
| `setupDecksToolbarEvents` | [`#L345-L376`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks.js#L345-L376) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\decks\subtopics.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\subtopics.js) (356 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderSubtopicsPageShell` | [`#L14-L40`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\subtopics.js#L14-L40) | `function` | Thực thi logic nội bộ |
| `openSubtopicsPage` | [`#L42-L46`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\subtopics.js#L42-L46) | `function` | Thực thi logic nội bộ |
| `renderSubtopicsPage` | [`#L48-L247`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\subtopics.js#L48-L247) | `function` | Thực thi logic nội bộ |
| `openSubtopicDetailPage` | [`#L249-L264`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\subtopics.js#L249-L264) | `function` | Thực thi logic nội bộ |
| `renderSubtopicDetailPage` | [`#L266-L355`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\subtopics.js#L266-L355) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\decks\words.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\words.js) (305 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderSubtopicWordsPageShell` | [`#L12-L44`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\words.js#L12-L44) | `function` | Thực thi logic nội bộ |
| `openSubtopicWordsPage` | [`#L46-L54`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\words.js#L46-L54) | `function` | Thực thi logic nội bộ |
| `renderSubtopicWordsPage` | [`#L56-L304`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\words.js#L56-L304) | `function` | Thực thi logic nội bộ |
| `getCardStatus` | [`#L97-L103`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\words.js#L97-L103) | `arrow_function` | Thực thi logic nội bộ |
| `renderFilteredWords` | [`#L140-L297`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\decks\words.js#L140-L297) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\library.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library.js) (298 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderLibraryTab` | [`#L16-L179`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library.js#L16-L179) | `function` | Khởi tạo và hiển thị toàn bộ giao diện màn hình Thư viện từ vựng |
| `setupLibraryEventListeners` | [`#L181-L297`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library.js#L181-L297) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\library\detail-modal.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\detail-modal.js) (368 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `formatFSRSDueText` | [`#L16-L141`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\detail-modal.js#L16-L141) | `function` | Định dạng trạng thái FSRS, hạn ôn tập và nhãn phân tầng trí nhớ |
| `openWordDetailModal` | [`#L146-L367`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\detail-modal.js#L146-L367) | `function` | Mở Modal Popup Chi Tiết Từ Vựng Đầy Đủ (Word Detail Modal) |
| `closeModal` | [`#L308-L311`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\detail-modal.js#L308-L311) | `arrow_function` | Sự kiện đóng Modal |
| `handleEsc` | [`#L320-L325`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\detail-modal.js#L320-L325) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\library\filters.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\filters.js) (207 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `buildSearchIndex` | [`#L27-L46`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\filters.js#L27-L46) | `function` | Thực thi logic nội bộ |
| `resetLibFilters` | [`#L51-L59`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\filters.js#L51-L59) | `function` | Đặt lại toàn bộ bộ lọc thư viện về mặc định |
| `isFilterActive` | [`#L64-L73`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\filters.js#L64-L73) | `function` | Kiểm tra xem có bộ lọc nào khác mặc định đang hoạt động không |
| `formatShortPos` | [`#L78-L90`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\filters.js#L78-L90) | `function` | Rút gọn nhãn từ loại POS để hiển thị gọn trên bảng |
| `matchesPosFilter` | [`#L92-L102`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\filters.js#L92-L102) | `function` | Thực thi logic nội bộ |
| `getFilteredAndSortedCards` | [`#L107-L205`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\filters.js#L107-L205) | `function` | Lọc và sắp xếp danh sách từ vựng theo State hiện hành |

#### 📁 [`src\js\views\library\renderer.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\renderer.js) (282 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderLibraryWords` | [`#L28-L192`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\renderer.js#L28-L192) | `function` | Hiển thị danh sách từ vựng dạng 1 dòng/từ kèm phân trang |
| `renderPaginationBar` | [`#L197-L280`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\library\renderer.js#L197-L280) | `function` | Hiển thị thanh điều hướng phân trang |

#### 📁 [`src\js\views\quiz.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz.js) (342 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `openSummaryModal` | [`#L19-L27`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz.js#L19-L27) | `function` | Thực thi logic nội bộ |
| `advanceQuizQuestion` | [`#L29-L32`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz.js#L29-L32) | `function` | Thực thi logic nội bộ |
| `startQuizSession` | [`#L37-L37`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz.js#L37-L37) | `function` | Bắt đầu phiên ôn tập / học từ mới trắc nghiệm FSRS |
| `loadQuizQuestion` | [`#L81-L182`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz.js#L81-L182) | `function` | Nạp câu hỏi trắc nghiệm hiện tại |
| `handleOptionSelected` | [`#L187-L312`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz.js#L187-L312) | `function` | Xử lý khi người dùng chọn một phương án |
| `finishQuizSession` | [`#L317-L320`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz.js#L317-L320) | `function` | Kết thúc phiên trắc nghiệm & Tổng kết |
| `closeQuizSession` | [`#L322-L341`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz.js#L322-L341) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\quiz\engine.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\engine.js) (225 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `playFeedbackTone` | [`#L13-L50`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\engine.js#L13-L50) | `function` | Phát âm thanh phản hồi nhẹ nhàng bằng Web Audio API |
| `generateDistractors` | [`#L55-L115`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\engine.js#L55-L115) | `function` | Sinh 3 đáp án gây nhiễu thông minh (Smart Distractors) |
| `buildQuizQueue` | [`#L120-L120`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\engine.js#L120-L120) | `function` | Xây dựng hàng đợi câu hỏi trắc nghiệm đan xen 3-1-3-1 theo FSRS |
| `pushCard` | [`#L157-L164`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\engine.js#L157-L164) | `arrow_function` | Thực thi logic nội bộ |
| `getCardStatusInfo` | [`#L208-L223`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\engine.js#L208-L223) | `function` | Phân tích trạng thái FSRS của từ vựng hiện tại |

#### 📁 [`src\js\views\quiz\shell.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\shell.js) (221 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderQuizOverlayShell` | [`#L14-L14`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\shell.js#L14-L14) | `function` | Render Khung Shell của Quiz Overlay |
| `setupQuizEvents` | [`#L96-L196`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\shell.js#L96-L196) | `function` | Thực thi logic nội bộ |
| `updateQuizLiveTimerUI` | [`#L201-L219`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\shell.js#L201-L219) | `function` | Cập nhật đồng hồ Live Timer trên UI phiên Quiz |

#### 📁 [`src\js\views\quiz\state.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\state.js) (46 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `createEmptyQuizStats` | [`#L12-L26`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\state.js#L12-L26) | `function` | Tạo đối tượng thống kê phiên trắc nghiệm mặc định |

#### 📁 [`src\js\views\quiz\summary-modal.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\summary-modal.js) (198 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `showQuizSummaryModal` | [`#L13-L13`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\quiz\summary-modal.js#L13-L13) | `function` | Modal Báo Cáo Tổng Kết Sau Khi Hoàn Thành Bài Trắc Nghiệm |

#### 📁 [`src\js\views\reels.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels.js) (383 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `appendNextBatch` | [`#L23-L50`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels.js#L23-L50) | `function` | Thực thi logic nội bộ |
| `updateFilterPillLabel` | [`#L52-L62`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels.js#L52-L62) | `function` | Thực thi logic nội bộ |
| `openFilterModal` | [`#L64-L67`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels.js#L64-L67) | `function` | Thực thi logic nội bộ |
| `closeFilterModal` | [`#L69-L72`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels.js#L69-L72) | `function` | Thực thi logic nội bộ |
| `applyCurrentFilter` | [`#L74-L94`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels.js#L74-L94) | `function` | Thực thi logic nội bộ |
| `bindToolbarAndFilterSheet` | [`#L96-L212`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels.js#L96-L212) | `function` | Thực thi logic nội bộ |
| `pauseReelsSession` | [`#L217-L231`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels.js#L217-L231) | `function` | Tạm dừng observer và âm thanh khi rời tab Reels |
| `renderReelsTab` | [`#L236-L236`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels.js#L236-L236) | `function` | Điểm vào chính dựng Tab Lướt Từ Vựng |
| `startReelsSession` | [`#L372-L372`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels.js#L372-L372) | `function` | Giữ tương thích ngược với các lời gọi startReelsSession cũ |

#### 📁 [`src\js\views\reels\interactions.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\interactions.js) (312 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `handleCardInView` | [`#L13-L26`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\interactions.js#L13-L26) | `function` | Thực thi logic nội bộ |
| `checkAndPronounceCenterCard` | [`#L31-L60`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\interactions.js#L31-L60) | `function` | Phát âm bài viết nằm chính giữa màn hình sau khi dừng lướt (Scroll Settled) |
| `setupFeedIntersectionObserver` | [`#L62-L86`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\interactions.js#L62-L86) | `function` | Thực thi logic nội bộ |
| `handleFeedClick` | [`#L88-L224`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\interactions.js#L88-L224) | `function` | Thực thi logic nội bộ |
| `bindFeedInteractions` | [`#L226-L242`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\interactions.js#L226-L242) | `function` | Thực thi logic nội bộ |
| `bindScrollAndKeyboard` | [`#L247-L247`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\interactions.js#L247-L247) | `function` | Gắn listener cuộn rAF & Escape modal 1 lần duy nhất cho toàn phiên Reels |
| `handleScroll` | [`#L256-L290`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\interactions.js#L256-L290) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\reels\queue.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\queue.js) (154 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `buildSmartFeedQueue` | [`#L15-L96`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\queue.js#L15-L96) | `function` | Xây dựng hàng đợi bảng tin từ vựng thông minh theo bộ lọc FSRS/CEFR/Topic |
| `handleRateCardFSRS` | [`#L101-L152`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\queue.js#L101-L152) | `function` | Xử lý đánh giá FSRS-6 trực tiếp trên thẻ bài viết Newsfeed |

#### 📁 [`src\js\views\reels\state.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\state.js) (82 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getMainContentEl` | [`#L35-L40`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\state.js#L35-L40) | `function` | Thực thi logic nội bộ |
| `loadUserInteractions` | [`#L42-L71`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\state.js#L42-L71) | `function` | Thực thi logic nội bộ |
| `saveUserInteractions` | [`#L73-L80`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\state.js#L73-L80) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\reels\templates.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\templates.js) (388 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `highlightTargetWord` | [`#L13-L23`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\templates.js#L13-L23) | `function` | ========================================== STRING & HTML HELPERS ========== |
| `getGradientForWord` | [`#L26-L39`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\templates.js#L26-L39) | `function` | Sinh Avatar Gradient ngẫu nhiên đẹp mắt (Dùng CSS Tokens để tương thích The |
| `renderFacebookPostCardHTML` | [`#L44-L44`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\templates.js#L44-L44) | `function` | ========================================== RENDER 1 FACEBOOK POST CARD ==== |
| `renderFilterModalHTML` | [`#L280-L280`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\templates.js#L280-L280) | `function` | ========================================== RENDER BỘ LỌC TỪ VỰNG MODAL / BO |
| `spawnFloatingReaction` | [`#L379-L387`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\reels\templates.js#L379-L387) | `function` | ========================================== HIỆU ỨNG TIM BAY & REACTION FLOA |

#### 📁 [`src\js\views\review.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review.js) (154 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `bindClickOnce` | [`#L37-L42`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review.js#L37-L42) | `function` | Thực thi logic nội bộ |
| `bindCardActivateOnce` | [`#L44-L59`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review.js#L44-L59) | `function` | Thực thi logic nội bộ |
| `renderReviewTab` | [`#L61-L149`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review.js#L61-L149) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\review\modal-utils.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modal-utils.js) (47 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `setStatModalsApp` | [`#L7-L9`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modal-utils.js#L7-L9) | `function` | Thực thi logic nội bộ |
| `getStatModalsApp` | [`#L11-L13`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modal-utils.js#L11-L13) | `function` | Thực thi logic nội bộ |
| `triggerStatsRefresh` | [`#L15-L24`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modal-utils.js#L15-L24) | `function` | Thực thi logic nội bộ |
| `ensureQuickModal` | [`#L26-L35`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modal-utils.js#L26-L35) | `function` | Thực thi logic nội bộ |
| `openAndBindQuickModal` | [`#L37-L45`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modal-utils.js#L37-L45) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\review\modals-progress.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modals-progress.js) (320 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `showReviewedTodayModal` | [`#L19-L136`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modals-progress.js#L19-L136) | `function` | Modal Danh sách thẻ đã ôn hôm nay |
| `showStudyTimeModal` | [`#L141-L229`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modals-progress.js#L141-L229) | `function` | Modal Tổng quan thời gian đã học |
| `showMasteredTiersModal` | [`#L234-L318`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modals-progress.js#L234-L318) | `function` | Modal 5 mức độ ghi nhớ FSRS |

#### 📁 [`src\js\views\review\modals-queue.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modals-queue.js) (279 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `showAttentionCardsModal` | [`#L19-L183`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modals-queue.js#L19-L183) | `function` | Modal Danh sách từ khó nhớ (lapses >= 8) |
| `updateModalView` | [`#L56-L162`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modals-queue.js#L56-L162) | `arrow_function` | Thực thi logic nội bộ |
| `showDueWordsModal` | [`#L188-L277`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\modals-queue.js#L188-L277) | `function` | Modal Danh sách từ tới hạn hôm nay |

#### 📁 [`src\js\views\review\realtime.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\realtime.js) (281 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `updateHomeStatsRealtime` | [`#L16-L279`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\realtime.js#L16-L279) | `function` | Cập nhật toàn bộ các chỉ số thống kê trên Home Dashboard theo thời gian thự |
| `updateLineFill` | [`#L180-L187`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\realtime.js#L180-L187) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\review\shell.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\shell.js) (173 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderReviewShell` | [`#L5-L171`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\shell.js#L5-L171) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\review\stat-modals.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\review\stat-modals.js) (24 dòng)

*Tệp cấu hình hoặc dữ liệu, không chứa khai báo hàm/class lớn.*

#### 📁 [`src\js\views\settings.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings.js) (53 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `setupSettingsUI` | [`#L18-L52`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings.js#L18-L52) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\settings\cefr-profile.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\cefr-profile.js) (204 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `bindSettingsProfileAndRoadmap` | [`#L15-L202`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\cefr-profile.js#L15-L202) | `function` | Gắn sự kiện & cập nhật Hồ sơ người dùng cùng Lộ trình CEFR trong Tab Cài Đặ |
| `updateLineFill` | [`#L156-L163`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\cefr-profile.js#L156-L163) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\settings\controls.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\controls.js) (250 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `saveAppSettings` | [`#L7-L12`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\controls.js#L7-L12) | `function` | Thực thi logic nội bộ |
| `bindSettingsControls` | [`#L17-L222`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\controls.js#L17-L222) | `function` | Đồng bộ & gắn sự kiện cho các control FSRS, Âm thanh & Giao diện |
| `syncPresetButtons` | [`#L32-L43`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\controls.js#L32-L43) | `arrow_function` | Thực thi logic nội bộ |
| `updateSettingsUIValues` | [`#L227-L248`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\controls.js#L227-L248) | `function` | Cập nhật lại giá trị UI của các ô select/toggle từ Storage/State hiện hành |

#### 📁 [`src\js\views\settings\data-actions.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\data-actions.js) (150 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `executeBackupImport` | [`#L13-L31`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\data-actions.js#L13-L31) | `function` | Thực thi nạp & phục hồi dữ liệu FSRS từ file JSON sao lưu |
| `bindSettingsDataActions` | [`#L36-L148`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\data-actions.js#L36-L148) | `function` | Gắn sự kiện cho các nút thao tác hệ thống & quản lý dữ liệu |

#### 📁 [`src\js\views\settings\template.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\template.js) (351 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderSettingsTabShell` | [`#L7-L349`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\settings\template.js#L7-L349) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\stats.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats.js) (376 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderStatsTab` | [`#L32-L375`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats.js#L32-L375) | `function` | Điều phối render toàn bộ nội dung của màn hình Thống Kê & Năng Lực Trí Nhớ |
| `setTierCnt` | [`#L336-L341`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats.js#L336-L341) | `arrow_function` | Thực thi logic nội bộ |
| `setReflex` | [`#L355-L360`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats.js#L355-L360) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\stats\forecast-modal.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\forecast-modal.js) (378 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `openCalendarForecastModal` | [`#L19-L377`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\forecast-modal.js#L19-L377) | `function` | Mở Modal Lịch Tháng Dự Báo Chi Tiết |
| `renderModalContent` | [`#L32-L354`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\forecast-modal.js#L32-L354) | `arrow_function` | Thực thi logic nội bộ |
| `closeModal` | [`#L356-L359`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\forecast-modal.js#L356-L359) | `arrow_function` | Thực thi logic nội bộ |
| `onKeyDown` | [`#L365-L370`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\forecast-modal.js#L365-L370) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\stats\journal.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\journal.js) (499 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getCurrentJournalPeriod` | [`#L10-L12`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\journal.js#L10-L12) | `function` | Thực thi logic nội bộ |
| `renderStatsTabShell` | [`#L17-L370`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\journal.js#L17-L370) | `function` | Khởi tạo khung DOM tĩnh ban đầu của Stats Tab |
| `setupJournalEvents` | [`#L375-L424`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\journal.js#L375-L424) | `function` | Gắn sự kiện điều hướng tháng trên Journal Heatmap |
| `showDayPopover` | [`#L429-L483`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\journal.js#L429-L483) | `function` | Hiển thị Tooltip Popover thông tin học tập của một ngày khi rê chuột / clic |
| `hideDayPopover` | [`#L488-L498`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\stats\journal.js#L488-L498) | `function` | Ẩn Tooltip Popover |

#### 📁 [`src\js\views\study.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study.js) (203 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `setupStudyControls` | [`#L62-L107`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study.js#L62-L107) | `function` | Thực thi logic nội bộ |
| `startStudySession` | [`#L109-L138`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study.js#L109-L138) | `function` | Thực thi logic nội bộ |
| `handleCardChange` | [`#L140-L150`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study.js#L140-L150) | `function` | Thực thi logic nội bộ |
| `handleStudyFinish` | [`#L152-L202`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study.js#L152-L202) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\study\actions.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\actions.js) (236 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `switchToQuizMode` | [`#L20-L46`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\actions.js#L20-L46) | `function` | Chuyển đổi trực tiếp từ phiên Flashcard sang Chế độ Trắc nghiệm (Quiz) |
| `createRateHandler` | [`#L51-L103`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\actions.js#L51-L103) | `function` | Tạo hàm chấm điểm FSRS an toàn (hỗ trợ Back Lock chống bấm nhầm theo từng m |
| `bindStudyRatingAndShortcuts` | [`#L108-L108`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\actions.js#L108-L108) | `function` | Gắn nút chấm điểm 4 nút FSRS, nút Đóng phiên, Summary Home & Phím tắt (Spac |

#### 📁 [`src\js\views\study\autoplay.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\autoplay.js) (288 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `isAutoPlayActive` | [`#L14-L16`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\autoplay.js#L14-L16) | `function` | Thực thi logic nội bộ |
| `updateAutoPlayUI` | [`#L18-L48`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\autoplay.js#L18-L48) | `function` | Thực thi logic nội bộ |
| `stopAutoPlay` | [`#L50-L57`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\autoplay.js#L50-L57) | `function` | Thực thi logic nội bộ |
| `triggerAutoPlayStep` | [`#L59-L153`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\autoplay.js#L59-L153) | `function` | Thực thi logic nội bộ |
| `onBackFinished` | [`#L93-L145`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\autoplay.js#L93-L145) | `arrow_function` | --- BƯỚC 2: MẶT SAU (Đọc Tiếng Việt nếu bật -> Chờ tiếp thu -> Sang thẻ kế  |
| `setupAutoPlayControls` | [`#L155-L287`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\autoplay.js#L155-L287) | `function` | Thực thi logic nội bộ |
| `syncAutoplayInputs` | [`#L177-L184`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\autoplay.js#L177-L184) | `arrow_function` | Thực thi logic nội bộ |
| `openAutoplayModal` | [`#L188-L191`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\autoplay.js#L188-L191) | `arrow_function` | Thực thi logic nội bộ |
| `closeAutoplayModal` | [`#L193-L195`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\autoplay.js#L193-L195) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\study\gestures.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\gestures.js) (237 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `createFlipHandler` | [`#L18-L18`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\gestures.js#L18-L18) | `function` | Tạo handler lật thẻ 3D hỗ trợ vuốt lên 360 độ liên tục và vuốt xuống lật lạ |
| `bindCardSwipeAndDragGestures` | [`#L91-L91`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\gestures.js#L91-L91) | `function` | Gắn cử chỉ chạm màn hình, kéo chuột Desktop và nút lật thẻ |
| `bindCardAudioAndInfo` | [`#L173-L235`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\gestures.js#L173-L235) | `function` | Gắn nút loa phát âm (mặt trước, mặt sau, câu ví dụ, audio-blind) và nút FSR |
| `bindWordSpeak` | [`#L184-L197`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\gestures.js#L184-L197) | `arrow_function` | Thực thi logic nội bộ |
| `handleShowCardInfo` | [`#L217-L229`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\gestures.js#L217-L229) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\study\pomodoro.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\pomodoro.js) (145 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `initPomodoroTracker` | [`#L17-L75`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\pomodoro.js#L17-L75) | `function` | Thực thi logic nội bộ |
| `startPomodoroTicker` | [`#L77-L100`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\pomodoro.js#L77-L100) | `function` | Thực thi logic nội bộ |
| `stopPomodoroTracker` | [`#L102-L108`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\pomodoro.js#L102-L108) | `function` | Thực thi logic nội bộ |
| `recordPomodoroCardReviewed` | [`#L110-L116`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\pomodoro.js#L110-L116) | `function` | Thực thi logic nội bộ |
| `updatePomodoroUI` | [`#L118-L144`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\pomodoro.js#L118-L144) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\study\prefs.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\prefs.js) (116 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getAutoPlayPrefs` | [`#L16-L30`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\prefs.js#L16-L30) | `function` | Thực thi logic nội bộ |
| `saveAutoPlayPrefs` | [`#L32-L36`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\prefs.js#L32-L36) | `function` | Thực thi logic nội bộ |
| `getStudyPrefs` | [`#L57-L82`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\prefs.js#L57-L82) | `function` | Thực thi logic nội bộ |
| `saveStudyPrefs` | [`#L84-L88`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\prefs.js#L84-L88) | `function` | Thực thi logic nội bộ |
| `applyRatingButtonsMode` | [`#L90-L115`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\prefs.js#L90-L115) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\study\priority-drawer.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\priority-drawer.js) (282 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `updateStudyPriorityUI` | [`#L18-L38`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\priority-drawer.js#L18-L38) | `function` | Cập nhật hiển thị nhãn và biểu tượng chế độ ưu tiên trên Header thanh học F |
| `switchStudyPriority` | [`#L43-L89`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\priority-drawer.js#L43-L89) | `function` | Thay đổi thứ tự ưu tiên học trực tiếp trong phiên học (Zero-exit, liền mạch |
| `setupStudyPrefsDrawer` | [`#L94-L94`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\priority-drawer.js#L94-L94) | `function` | Gắn sự kiện Drawer tùy chọn học tập, Modal ưu tiên & Đặt lại thẻ hiện tại |
| `syncCheckboxesFromPrefs` | [`#L115-L132`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\priority-drawer.js#L115-L132) | `arrow_function` | Thực thi logic nội bộ |
| `updatePrefFromControls` | [`#L134-L165`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\priority-drawer.js#L134-L165) | `arrow_function` | Thực thi logic nội bộ |
| `openDrawer` | [`#L204-L207`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\priority-drawer.js#L204-L207) | `arrow_function` | Thực thi logic nội bộ |
| `closeDrawer` | [`#L208-L215`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\priority-drawer.js#L208-L215) | `arrow_function` | Thực thi logic nội bộ |
| `openPriorityModal` | [`#L226-L230`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\priority-drawer.js#L226-L230) | `arrow_function` | Thực thi logic nội bộ |
| `closePriorityModal` | [`#L231-L238`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\priority-drawer.js#L231-L238) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\study\renderer.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\renderer.js) (426 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getStudyDom` | [`#L17-L65`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\renderer.js#L17-L65) | `function` | Thực thi logic nội bộ |
| `updateStudyLiveTimerUI` | [`#L67-L93`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\renderer.js#L67-L93) | `function` | Thực thi logic nội bộ |
| `generateClozeSentence` | [`#L97-L107`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\renderer.js#L97-L107) | `function` | Thực thi logic nội bộ |
| `applyFieldVisibility` | [`#L110-L180`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\renderer.js#L110-L180) | `function` | Thực thi logic nội bộ |
| `renderCardChange` | [`#L182-L182`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\renderer.js#L182-L182) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\study\shell.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\shell.js) (531 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getStudyOverlay` | [`#L8-L13`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\shell.js#L8-L13) | `function` | Thực thi logic nội bộ |
| `renderStudyOverlayShell` | [`#L15-L530`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\shell.js#L15-L530) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\study\state.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\state.js) (74 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `clearStudyTimerSubscription` | [`#L18-L23`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\state.js#L18-L23) | `function` | Thực thi logic nội bộ |
| `clearFlipCountdownTimer` | [`#L25-L31`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\state.js#L25-L31) | `function` | Thực thi logic nội bộ |
| `startFrontActiveRecallTimer` | [`#L33-L72`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\state.js#L33-L72) | `function` | Thực thi logic nội bộ |
| `updateCountdown` | [`#L53-L68`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\state.js#L53-L68) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\study\summary-modal.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\summary-modal.js) (59 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `showSummaryModal` | [`#L6-L58`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\study\summary-modal.js#L6-L58) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\toeic-test.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic-test.js) (79 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderToeicTestTab` | [`#L20-L22`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic-test.js#L20-L22) | `function` | Hiển thị Màn hình Hub của Tab Thi Thử TOEIC (Danh sách đề thi) |
| `startToeicTestBySet` | [`#L27-L70`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic-test.js#L27-L70) | `function` | Khởi động phiên làm bài / thi thử theo bộ đề cụ thể |
| `startToeicTest` | [`#L75-L78`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic-test.js#L75-L78) | `function` | Hàm hỗ trợ tương thích |

#### 📁 [`src\js\views\toeic\arena.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\arena.js) (416 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `togglePalletDrawer` | [`#L9-L17`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\arena.js#L9-L17) | `function` | Thực thi logic nội bộ |
| `updatePalletMatrix` | [`#L19-L48`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\arena.js#L19-L48) | `function` | Thực thi logic nội bộ |
| `loadArenaQuestion` | [`#L50-L153`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\arena.js#L50-L153) | `function` | Thực thi logic nội bộ |
| `toggleFlagCurrentQuestion` | [`#L155-L162`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\arena.js#L155-L162) | `function` | Thực thi logic nội bộ |
| `updateTimerDigitsUI` | [`#L164-L178`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\arena.js#L164-L178) | `function` | Thực thi logic nội bộ |
| `startArenaTimer` | [`#L180-L192`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\arena.js#L180-L192) | `function` | Thực thi logic nội bộ |
| `renderArenaLayout` | [`#L197-L197`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\arena.js#L197-L197) | `function` | Render bố cục phòng thi ETS CBT & gắn sự kiện điều hướng |
| `setupArenaKeyShortcuts` | [`#L365-L414`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\arena.js#L365-L414) | `function` | Lắng nghe phím tắt bàn phím trong phòng thi (đăng ký duy nhất 1 lần) |

#### 📁 [`src\js\views\toeic\hub.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\hub.js) (222 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `showTestModeSelectorModal` | [`#L13-L80`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\hub.js#L13-L80) | `function` | Hiển thị Popup tùy chọn: Luyện tập vs Thi thật |
| `closeModal` | [`#L57-L63`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\hub.js#L57-L63) | `arrow_function` | Thực thi logic nội bộ |
| `renderToeicHub` | [`#L85-L220`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\hub.js#L85-L220) | `function` | Hiển thị Màn hình Hub của Tab Thi Thử TOEIC (Danh sách đề thi & Lịch sử) |

#### 📁 [`src\js\views\toeic\results.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\results.js) (236 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `closeArenaSession` | [`#L11-L16`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\results.js#L11-L16) | `function` | Thực thi logic nội bộ |
| `showToeicResultModal` | [`#L21-L162`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\results.js#L21-L162) | `function` | Hiển thị Modal Báo Cáo Kết Quả & Lời Giải Thích Chi Tiết Từng Câu |
| `closeModal` | [`#L147-L152`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\results.js#L147-L152) | `arrow_function` | Thực thi logic nội bộ |
| `finishToeicTest` | [`#L167-L167`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\results.js#L167-L167) | `function` | Tính toán kết quả bài thi, lưu vào Storage và hiển thị Modal giải thích |
| `confirmAndSubmitTest` | [`#L209-L209`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\results.js#L209-L209) | `function` | Xác nhận & Nộp bài thi |

#### 📁 [`src\js\views\toeic\state.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\state.js) (46 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getToeicOverlay` | [`#L20-L25`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\state.js#L20-L25) | `function` | Thực thi logic nội bộ |
| `ensureArenaOverlayCreated` | [`#L27-L37`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\state.js#L27-L37) | `function` | Thực thi logic nội bộ |
| `stopArenaTimer` | [`#L39-L44`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\toeic\state.js#L39-L44) | `function` | Thực thi logic nội bộ |

---

### TẦNG 4: THÀNH PHẦN & MODALS (Components & Modals — `src/js/views/components/`, `modals/`)

#### 📁 [`src\js\views\components\custom-study.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\custom-study.js) (395 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `openCustomStudyModal` | [`#L17-L393`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\custom-study.js#L17-L393) | `function` | Thực thi logic nội bộ |
| `updateMatchingCards` | [`#L164-L246`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\custom-study.js#L164-L246) | `arrow_function` | Hàm tính toán danh sách từ thỏa mãn |
| `closeModal` | [`#L290-L292`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\custom-study.js#L290-L292) | `arrow_function` | Đóng Modal |
| `getTier` | [`#L330-L336`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\custom-study.js#L330-L336) | `arrow_function` | Bậc ưu tiên: 1: Due, 2: Learning, 3: New, 4: Mastered |

#### 📁 [`src\js\views\components\optimizer-modal.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\optimizer-modal.js) (260 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `openBehavioralOptimizerModal` | [`#L16-L257`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\optimizer-modal.js#L16-L257) | `function` | Thực thi logic nội bộ |
| `closeModal` | [`#L216-L218`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\optimizer-modal.js#L216-L218) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\components\search.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js) (440 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `setupSearch` | [`#L29-L435`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L29-L435) | `function` | Thực thi logic nội bộ |
| `getSearchHistory` | [`#L49-L56`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L49-L56) | `arrow_function` | Thực thi logic nội bộ |
| `saveSearchHistory` | [`#L58-L62`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L58-L62) | `arrow_function` | Thực thi logic nội bộ |
| `addQueryToHistory` | [`#L64-L71`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L64-L71) | `arrow_function` | Thực thi logic nội bộ |
| `removeQueryFromHistory` | [`#L73-L78`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L73-L78) | `arrow_function` | Thực thi logic nội bộ |
| `openSearchModal` | [`#L80-L90`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L80-L90) | `arrow_function` | Thực thi logic nội bộ |
| `closeSearchModal` | [`#L92-L104`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L92-L104) | `arrow_function` | Thực thi logic nội bộ |
| `updateSelectedResult` | [`#L149-L160`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L149-L160) | `arrow_function` | Thực thi logic nội bộ |
| `renderSearchSuggestions` | [`#L162-L231`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L162-L231) | `arrow_function` | Thực thi logic nội bộ |
| `performSearch` | [`#L270-L354`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L270-L354) | `arrow_function` | Thực thi logic nội bộ |
| `renderSearchResults` | [`#L356-L430`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\search.js#L356-L430) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\components\shell.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\shell.js) (230 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `mountGlobalModals` | [`#L10-L227`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\shell.js#L10-L227) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\components\streak-hub.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\streak-hub.js) (223 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `showStreakHubModal` | [`#L16-L220`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\streak-hub.js#L16-L220) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\views\components\toast.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\toast.js) (159 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `cleanup` | [`#L51-L60`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\toast.js#L51-L60) | `arrow_function` | Thực thi logic nội bộ |
| `showToast` | [`#L111-L156`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\toast.js#L111-L156) | `function` | Upgraded In-App Floating Toast Notification (thay thế window.alert) Tối ưu  |
| `dismiss` | [`#L143-L149`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\components\toast.js#L143-L149) | `arrow_function` | Cho phép bấm trực tiếp vào toast để tắt ngay |

#### 📁 [`src\js\views\modals\goal-modal.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\modals\goal-modal.js) (417 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `showGoalCustomizerModal` | [`#L14-L287`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\modals\goal-modal.js#L14-L287) | `function` | ========================================================================== |
| `renderModalContent` | [`#L30-L283`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\modals\goal-modal.js#L30-L283) | `arrow_function` | Thực thi logic nội bộ |
| `showForecastDetailModal` | [`#L292-L414`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\views\modals\goal-modal.js#L292-L414) | `function` | ========================================================================== |

---

### TẦNG 5: ĐIỀU PHỐI CHÍNH & NỀN TẢNG (`src/js/app.js`, `config.js`, `utils.js`)

#### 📁 [`src\js\app.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js) (295 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `FlashcardApp` | [`#L49-L273`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L49-L273) | `class` | Thực thi logic nội bộ |
| `FlashcardApp.constructor` | [`#L50-L68`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L50-L68) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.init` | [`#L70-L127`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L70-L127) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.registerServiceWorker` | [`#L129-L131`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L129-L131) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.checkUpdate` | [`#L133-L133`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L133-L133) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.scrollToTop` | [`#L137-L139`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L137-L139) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.setupNavigation` | [`#L141-L143`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L141-L143) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.switchTab` | [`#L145-L147`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L145-L147) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.refreshAllViews` | [`#L149-L161`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L149-L161) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.updateHeaderBadges` | [`#L163-L165`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L163-L165) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.applyTheme` | [`#L167-L169`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L167-L169) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderReviewTab` | [`#L172-L174`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L172-L174) | `method` | Delegated View Methods |
| `FlashcardApp.renderLibraryTab` | [`#L176-L178`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L176-L178) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderDecksTab` | [`#L180-L182`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L180-L182) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.openSubtopicsPage` | [`#L184-L184`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L184-L184) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderSubtopicsPage` | [`#L185-L185`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L185-L185) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.openSubtopicDetailPage` | [`#L186-L186`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L186-L186) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderSubtopicDetailPage` | [`#L187-L187`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L187-L187) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.openSubtopicWordsPage` | [`#L188-L188`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L188-L188) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderSubtopicWordsPage` | [`#L189-L189`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L189-L189) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderStatsTab` | [`#L191-L193`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L191-L193) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderSettingsTab` | [`#L195-L197`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L195-L197) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderToeicTestTab` | [`#L199-L201`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L199-L201) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.startStudySession` | [`#L203-L203`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L203-L203) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.changeStudyPriority` | [`#L238-L240`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L238-L240) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.startQuizSession` | [`#L242-L242`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L242-L242) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderReelsTab` | [`#L251-L251`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L251-L251) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.startReelsSession` | [`#L259-L259`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L259-L259) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.showConfirm` | [`#L271-L271`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L271-L271) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.showToast` | [`#L272-L272`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L272-L272) | `method` | Thực thi logic nội bộ |
| `bootstrap` | [`#L275-L286`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app.js#L275-L286) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\app\navigation.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\navigation.js) (240 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `bindAppNavigation` | [`#L14-L104`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\navigation.js#L14-L104) | `function` | Gắn sự kiện điều hướng Bottom Nav, Header & các nút quay lại |
| `navigateBackToSubtopics` | [`#L84-L90`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\navigation.js#L84-L90) | `arrow_function` | Thực thi logic nội bộ |
| `renderTabContent` | [`#L109-L121`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\navigation.js#L109-L121) | `function` | Render lại nội dung của một tab cụ thể |
| `switchAppTab` | [`#L126-L165`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\navigation.js#L126-L165) | `function` | Chuyển đổi tab 0ms UI lag bằng rAF render |
| `updateAppHeaderBadges` | [`#L170-L198`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\navigation.js#L170-L198) | `function` | Cập nhật huy hiệu Streak trên thanh Header & Desktop Sidebar |
| `applyAppTheme` | [`#L203-L238`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\navigation.js#L203-L238) | `function` | Áp dụng Theme Sáng / Tối đồng bộ với Toggle Header và Settings |

#### 📁 [`src\js\app\pwa.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\pwa.js) (213 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `registerAppServiceWorker` | [`#L11-L110`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\pwa.js#L11-L110) | `function` | Đăng ký Service Worker, tự động kiểm tra cập nhật & thông báo trạng thái On |
| `performReload` | [`#L33-L40`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\pwa.js#L33-L40) | `arrow_function` | Thực thi logic nội bộ |
| `handleUpdateDetected` | [`#L42-L49`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\pwa.js#L42-L49) | `arrow_function` | Thực thi logic nội bộ |
| `checkAppUpdate` | [`#L115-L115`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\app\pwa.js#L115-L115) | `function` | Kiểm tra và áp dụng cập nhật phiên bản mới một cách minh bạch |

#### 📁 [`src\js\config.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\config.js) (389 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getLearningGoal` | [`#L157-L161`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\config.js#L157-L161) | `function` | Thực thi logic nội bộ |
| `getSubtopicColor` | [`#L273-L283`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\config.js#L273-L283) | `function` | Thực thi logic nội bộ |
| `getSubtopicIcon` | [`#L285-L388`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\config.js#L285-L388) | `function` | Thực thi logic nội bộ |

#### 📁 [`src\js\utils.js`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js) (160 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `escapeHTML` | [`#L9-L17`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L9-L17) | `function` | Mã hóa ký tự đặc biệt HTML chống tấn công XSS |
| `safeColor` | [`#L22-L25`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L22-L25) | `function` | Kiểm tra và làm sạch chuỗi mã màu CSS hợp lệ |
| `escapeRegex` | [`#L30-L32`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L30-L32) | `function` | Thoát các ký tự đặc biệt khi tạo RegExp động |
| `formatCleanInterval` | [`#L37-L39`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L37-L39) | `function` | Làm sạch chuỗi chu kỳ FSRS cho nhãn nút ngắn gọn (bỏ ký tự <, ≤, khoảng trắ |
| `getLocalDateKey` | [`#L46-L61`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L46-L61) | `function` | Lấy khóa ngày dạng YYYY-MM-DD theo giờ địa phương của thiết bị (chống lệch  |
| `scrollToTop` | [`#L66-L89`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L66-L89) | `function` | Cuộn mượt mà cửa sổ hoặc container lên đầu trang |
| `highlightKeyword` | [`#L94-L100`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L94-L100) | `function` | Đánh dấu từ khóa tìm kiếm trong chuỗi văn bản an toàn với thẻ <mark> |
| `debounce` | [`#L105-L111`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L105-L111) | `function` | Hàm Debounce trì hoãn gọi hàm liên tục (tối ưu gõ phím tìm kiếm) |
| `sleep` | [`#L116-L118`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L116-L118) | `function` | Hàm trì hoãn Async Promise (Sleep) |
| `normalizePos` | [`#L123-L130`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L123-L130) | `function` | Chuẩn hóa nhãn từ loại (Part of Speech) thành 'noun' - 'verb' - 'adj' - 'ot |
| `getCurrentSettings` | [`#L135-L146`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L135-L146) | `function` | Lấy settings hiện tại ưu tiên từ window.app.settings hoặc StorageManager fa |
| `shuffle` | [`#L151-L158`](file://C:\Users\PC\Downloads\flashcard-pro\src\js\utils.js#L151-L158) | `function` | Trộn mảng ngẫu nhiên (Fisher-Yates shuffle) |

---

