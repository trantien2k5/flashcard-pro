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

#### 📁 [`src/js/core/fsrs.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js) (416 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `isCardDue` | [`#L13-L35`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L13-L35) | `function` | Kiểm tra xem thẻ đã đến hạn cần ôn tập theo thuật toán FSRS hay chưa |
| `FSRS` | [`#L37-L415`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L37-L415) | `class` | Thực thi logic nội bộ |
| `FSRS.constructor` | [`#L38-L38`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L38-L38) | `method` | Thực thi logic nội bộ |
| `FSRS.createEmptyCard` | [`#L55-L71`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L55-L71) | `method` | Tạo cấu trúc dữ liệu thẻ FSRS mới |
| `FSRS.initStability` | [`#L96-L99`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L96-L99) | `method` | Tính Stability ban đầu theo Rating FSRS-6: S_0(G) = w[G - 1] |
| `FSRS.initDifficulty` | [`#L105-L108`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L105-L108) | `method` | Tính Difficulty ban đầu theo Rating (Thang điểm 1 - 10) FSRS-6: D_0(G) = w_ |
| `FSRS.nextDifficulty` | [`#L117-L123`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L117-L123) | `method` | Cập nhật độ khó (Difficulty) sau mỗi lần ôn FSRS-6 Linear Damping & Mean Re |
| `FSRS.nextRecallStability` | [`#L130-L150`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L130-L150) | `method` | Tính Stability tiếp theo khi nhớ đúng (Rating: Hard, Good, Easy) FSRS-6 (21 |
| `FSRS.nextForgetStability` | [`#L157-L172`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L157-L172) | `method` | Tính Stability tiếp theo khi bị quên (Rating: Again) FSRS-6 (21 parameters) |
| `FSRS.rawInterval` | [`#L178-L182`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L178-L182) | `method` | Tính khoảng thời gian chính xác (dạng số thực) dựa trên Stability và Target |
| `FSRS.nextInterval` | [`#L187-L191`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L187-L191) | `method` | Tính khoảng thời gian ôn tập tiếp theo (theo ngày nguyên) dựa trên Stabilit |
| `FSRS.getFuzzedInterval` | [`#L196-L218`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L196-L218) | `method` | Tính Fuzz Factor chuẩn Anki để làm mờ ngẫu nhiên khoảng cách ôn tập, chống  |
| `FSRS.formatInterval` | [`#L398-L414`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/fsrs.js#L398-L414) | `method` | Định dạng interval thành chuỗi thân thiện chuẩn Anki (1m, 10m, 3d, 16d, 1mo |

#### 📁 [`src/js/core/optimizer.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/optimizer.js) (495 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `BehavioralOptimizer` | [`#L16-L494`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/optimizer.js#L16-L494) | `class` | ==========================================================================  |
| `BehavioralOptimizer.analyze` | [`#L21-L434`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/optimizer.js#L21-L434) | `method` | Phân tích chuyên sâu hành vi học tập thực tế và tính toán khuyến nghị cá nh |
| `BehavioralOptimizer.autoCalibrateBackground` | [`#L439-L458`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/optimizer.js#L439-L458) | `method` | Tự động phân tích và tối ưu hóa thông số FSRS-6 hoàn toàn trong nền (Zero-T |
| `BehavioralOptimizer.applyOptimizations` | [`#L463-L493`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/optimizer.js#L463-L493) | `method` | Áp dụng toàn bộ cấu hình tối ưu hóa vào StorageManager |

#### 📁 [`src/js/core/selectors.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js) (994 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `DeckManager` | [`#L11-L993`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L11-L993) | `class` | Thực thi logic nội bộ |
| `DeckManager.constructor` | [`#L12-L21`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L12-L21) | `method` | Thực thi logic nội bộ |
| `DeckManager.init` | [`#L26-L68`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L26-L68) | `method` | Khởi tạo danh mục Decks và nạp từ vựng sẵn sàng |
| `DeckManager.preloadAllWordsInBackground` | [`#L73-L94`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L73-L94) | `method` | Nạp ngầm toàn bộ từ vựng vào Map O(1) |
| `DeckManager.ensureTopicLoaded` | [`#L99-L128`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L99-L128) | `method` | Đảm bảo từ vựng của một chủ đề đã được nạp đầy đủ (On-Demand / Lazy Load) |
| `DeckManager.hydrateDeckCards` | [`#L133-L167`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L133-L167) | `method` | Hydrate danh sách thẻ của một deck từ wordsMap |
| `DeckManager.rebuildAllCardsList` | [`#L169-L180`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L169-L180) | `method` | Thực thi logic nội bộ |
| `DeckManager.getAllDecks` | [`#L182-L184`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L182-L184) | `method` | Thực thi logic nội bộ |
| `DeckManager.getDeckById` | [`#L186-L188`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L186-L188) | `method` | Thực thi logic nội bộ |
| `DeckManager.getCardsByDeckId` | [`#L190-L204`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L190-L204) | `method` | Thực thi logic nội bộ |
| `DeckManager.getDeckCards` | [`#L209-L211`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L209-L211) | `method` | Alias tương thích với getCardsByDeckId |
| `DeckManager.getAllCards` | [`#L213-L215`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L213-L215) | `method` | Thực thi logic nội bộ |
| `DeckManager.getAllWords` | [`#L217-L219`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L217-L219) | `method` | Thực thi logic nội bộ |
| `DeckManager.getSubtopicCards` | [`#L224-L263`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L224-L263) | `method` | Lấy danh sách thẻ từ vựng đầy đủ của một chủ đề con (Subtopic) |
| `DeckManager.getCardById` | [`#L268-L281`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L268-L281) | `method` | Tra cứu thẻ từ vựng O(1) tức thời theo wordId |
| `DeckManager.invalidateStatsCache` | [`#L286-L289`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L286-L289) | `method` | Làm mới cache thống kê khi có thay đổi trạng thái hoặc chuyển tab |
| `DeckManager.getDueCards` | [`#L294-L310`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L294-L310) | `method` | Lấy danh sách thẻ tới hạn cần ôn tập (Bỏ qua thẻ bị tạm dừng) |
| `DeckManager.getWeakWords` | [`#L316-L349`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L316-L349) | `method` | Lấy danh sách từ vựng yếu / hay quên nhất ("Bệnh Án Từ Vựng") Tiêu chí: Từn |
| `DeckManager.getAttentionCards` | [`#L355-L397`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L355-L397) | `method` | Lấy danh sách từ khó (ngưỡng quên lapses >= 8 hoặc isLeech === true). Ẩn th |
| `DeckManager.getDeckStats` | [`#L402-L476`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L402-L476) | `method` | Tính toán thống kê tiến độ học của một bộ thẻ (New, Learning, Review, Maste |
| `DeckManager.getStudyQueue` | [`#L485-L485`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L485-L485) | `method` | Lấy danh sách thẻ ưu tiên thông minh theo thuật toán FSRS @param {string-nu |
| `isCardStudiedToday` | [`#L573-L577`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L573-L577) | `arrow_function` | Thực thi logic nội bộ |
| `addCard` | [`#L833-L840`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L833-L840) | `arrow_function` | Thực thi logic nội bộ |
| `DeckManager.getStudyModeCounts` | [`#L935-L935`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L935-L935) | `method` | Thống kê số lượng thẻ tương ứng cho từng Chế Độ Học Có Chủ Đích (Targeted M |
| `DeckManager.searchCards` | [`#L952-L970`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L952-L970) | `method` | Tìm kiếm từ vựng độc nhất theo từ khóa |
| `DeckManager.createCustomDeck` | [`#L975-L992`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/selectors.js#L975-L992) | `method` | Tạo bộ từ vựng tùy chỉnh mới |

#### 📁 [`src/js/core/session.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js) (546 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `preloadCardImage` | [`#L27-L54`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L27-L54) | `function` | Tải trước và giải mã hình ảnh vào GPU/Browser RAM cache Đảm bảo khi hiển th |
| `StudySession` | [`#L56-L545`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L56-L545) | `class` | Thực thi logic nội bộ |
| `StudySession.constructor` | [`#L57-L57`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L57-L57) | `method` | Thực thi logic nội bộ |
| `StudySession.updateSettings` | [`#L101-L119`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L101-L119) | `method` | Thực thi logic nội bộ |
| `StudySession.start` | [`#L124-L175`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L124-L175) | `method` | Khởi động phiên học với hàng đợi thẻ (queue) & Kích hoạt tải trước âm thanh |
| `StudySession.preloadSessionAudio` | [`#L180-L189`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L180-L189) | `method` | Tải trước âm thanh cho thẻ hiện tại và thẻ kế tiếp (nhẹ nhàng, không nghẽn  |
| `StudySession.preloadSessionImages` | [`#L194-L211`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L194-L211) | `method` | Tải trước hình ảnh trong phiên học chỉ khi người dùng BẬT hiển thị hình ảnh |
| `StudySession.loadCurrentCard` | [`#L213-L281`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L213-L281) | `method` | Thực thi logic nội bộ |
| `StudySession.flipCard` | [`#L283-L286`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L283-L286) | `method` | Thực thi logic nội bộ |
| `StudySession.rateCard` | [`#L291-L291`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L291-L291) | `method` | Đánh giá thẻ với điểm FSRS (Again: 1, Hard: 2, Good: 3, Easy: 4) |
| `StudySession.stepNextAutoplayCard` | [`#L484-L497`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L484-L497) | `method` | Chuyển sang thẻ tiếp theo trong chế độ Auto-Play (Nghe/Xem thụ động) Giữ ng |
| `StudySession.suspendCurrentCard` | [`#L502-L511`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L502-L511) | `method` | Tạm dừng thẻ hiện tại và chuyển sang thẻ tiếp theo |
| `StudySession.resetCurrentCard` | [`#L516-L523`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L516-L523) | `method` | Đặt lại tiến độ thẻ hiện tại về New |
| `StudySession.speak` | [`#L528-L530`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L528-L530) | `method` | Phát âm từ vựng với Dual Native Audio Engine |
| `StudySession.speakTTS` | [`#L535-L537`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L535-L537) | `method` | Phát âm bằng giọng đọc Neural/Natural của trình duyệt (Web Speech API) |
| `StudySession.stopAudio` | [`#L542-L544`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/session.js#L542-L544) | `method` | Dừng toàn bộ âm thanh đang phát an toàn |

#### 📁 [`src/js/core/stats.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js) (1277 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `StatsManager` | [`#L14-L1274`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L14-L1274) | `class` | Thực thi logic nội bộ |
| `StatsManager.getMemoryIntelligence` | [`#L18-L171`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L18-L171) | `method` | Phân tích chuyên sâu Trí Nhớ Thật & Năng Lực Nhận Thức FSRS-6 |
| `StatsManager.getOverallStats` | [`#L176-L277`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L176-L277) | `method` | Tính toán toàn bộ chỉ số thống kê tổng hợp |
| `StatsManager.calculateStreak` | [`#L286-L398`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L286-L398) | `method` | Tính toán chuỗi ngày học liên tục (Streak) Tự động tích hợp Khiên bảo vệ (f |
| `StatsManager.detectBrokenStreak` | [`#L404-L489`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L404-L489) | `method` | Tự động phân tích xem chuỗi ngày học có vừa bị đứt trong 24h - 48h gần nhất |
| `isValidDate` | [`#L431-L443`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L431-L443) | `arrow_function` | Thực thi logic nội bộ |
| `StatsManager.getComprehensionPower` | [`#L495-L557`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L495-L557) | `method` | Tính toán Thước Đo Năng Lực Đọc Hiểu Tiếng Anh Thực Tế (Comprehension Power |
| `StatsManager.getCefrRoadmapAndForecast` | [`#L562-L562`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L562-L562) | `method` | Tính toán toàn diện Lộ trình Trình độ CEFR & Dự báo nhịp độ học thích ứng ( |
| `StatsManager.getDailyMicroQuests` | [`#L852-L852`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L852-L852) | `method` | Tính toán trạng thái 3 Nhiệm Vụ Nhỏ Hôm Nay (Daily 3-Step Micro-Quests) |
| `StatsManager.getPrimeStudyHour` | [`#L913-L961`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L913-L961) | `method` | Phân tích Khung Giờ Vàng Nhận Thức (Prime Cognitive Study Hour) |
| `StatsManager.getWeeklyProgress` | [`#L966-L1001`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L966-L1001) | `method` | Lấy số từ ghi nhớ được / tích lũy theo từng ngày trong 7 ngày qua |
| `StatsManager.get7DaysForecast` | [`#L1006-L1040`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L1006-L1040) | `method` | Dự báo số thẻ đến hạn trong 7 ngày tới |
| `StatsManager.getMonthJournalData` | [`#L1047-L1215`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L1047-L1215) | `method` | Lấy dữ liệu nhật ký ô vuông theo tháng phong cách Trader (P&L Calendar) @pa |
| `StatsManager.getYearJournalData` | [`#L1221-L1266`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L1221-L1266) | `method` | Lấy dữ liệu 12 tháng trong năm (Year Overview) @param {number} year - Năm ( |
| `StatsManager.getYearlyJournalData` | [`#L1271-L1273`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/stats.js#L1271-L1273) | `method` | Alias cho getYearJournalData để đảm bảo tương thích ngược |

#### 📁 [`src/js/core/timer.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js) (254 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `StudyTimeTracker` | [`#L8-L250`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L8-L250) | `class` | Thực thi logic nội bộ |
| `StudyTimeTracker.constructor` | [`#L9-L25`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L9-L25) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker.subscribe` | [`#L30-L38`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L30-L38) | `method` | Đăng ký lắng nghe nhịp tick thời gian học trực tiếp (cho Header Quiz/Study) |
| `StudyTimeTracker.unsubscribe` | [`#L40-L42`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L40-L42) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker._notifySubscribers` | [`#L44-L53`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L44-L53) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker.getTimerState` | [`#L55-L64`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L55-L64) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker.formatDuration` | [`#L66-L77`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L66-L77) | `method` | Thực thi logic nội bộ |
| `pad` | [`#L70-L75`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L70-L75) | `arrow_function` | Thực thi logic nội bộ |
| `StudyTimeTracker.startSession` | [`#L82-L108`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L82-L108) | `method` | Bắt đầu theo dõi thời gian cho phiên học (Study/Quiz Modal) |
| `StudyTimeTracker.recordActivity` | [`#L113-L125`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L113-L125) | `method` | Ghi nhận người dùng vừa có hành vi học (lật thẻ, chấm điểm, nghe âm thanh,  |
| `StudyTimeTracker._onVisibilityChange` | [`#L130-L138`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L130-L138) | `method` | Tạm dừng hoặc tiếp tục khi tab thay đổi trạng thái ẩn/hiện |
| `StudyTimeTracker.pause` | [`#L140-L146`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L140-L146) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker.resume` | [`#L148-L156`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L148-L156) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker._startTicker` | [`#L158-L163`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L158-L163) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker._tick` | [`#L165-L202`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L165-L202) | `method` | Thực thi logic nội bộ |
| `StudyTimeTracker.flush` | [`#L207-L221`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L207-L221) | `method` | Lưu số giây tích lũy vào StorageManager |
| `StudyTimeTracker.endSession` | [`#L226-L249`](file:///storage/emulated/0/Code/flashcard-pro/src/js/core/timer.js#L226-L249) | `method` | Kết thúc phiên học, gỡ bỏ listeners và flush toàn bộ thời gian còn lại |

---

### TẦNG 2: DỊCH VỤ & LƯU TRỮ (Services Layer — `src/js/services/`)

#### 📁 [`src/js/services/audio.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js) (485 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `onAudioPlayStateChange` | [`#L21-L27`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L21-L27) | `function` | Đăng ký lắng nghe trạng thái phát âm thanh (để cập nhật UI equalizer sống đ |
| `notifyPlayState` | [`#L29-L37`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L29-L37) | `function` | Thực thi logic nội bộ |
| `unlockAudioContext` | [`#L42-L59`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L42-L59) | `function` | Mở khóa quyền Autoplay của trình duyệt qua thao tác đầu tiên của người dùng |
| `handleFirstInteraction` | [`#L62-L68`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L62-L68) | `arrow_function` | Thực thi logic nội bộ |
| `scoreVoice` | [`#L75-L100`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L75-L100) | `function` | Thực thi logic nội bộ |
| `initVoiceCache` | [`#L102-L124`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L102-L124) | `function` | Thực thi logic nội bộ |
| `update` | [`#L104-L117`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L104-L117) | `arrow_function` | Thực thi logic nội bộ |
| `getNativeAudioUrls` | [`#L134-L168`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L134-L168) | `function` | SĂN TẤT CẢ GIỌNG BẢN XỨ (Native Audio Hunter Engine): Tạo danh sách URL âm  |
| `preloadWordAudio` | [`#L173-L228`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L173-L228) | `function` | Tải trước (Preload) 1 từ vựng vào bộ nhớ đệm RAM |
| `preloadBothAccents` | [`#L233-L237`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L233-L237) | `function` | Tải trước cả 2 giọng US và UK cho danh sách thẻ |
| `stopAudio` | [`#L242-L256`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L242-L256) | `function` | Dừng toàn bộ âm thanh đang phát |
| `speakTTS` | [`#L261-L327`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L261-L327) | `function` | Phát âm bằng giọng đọc Neural/Natural của trình duyệt (Web Speech API) |
| `finish` | [`#L301-L304`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L301-L304) | `arrow_function` | Thực thi logic nội bộ |
| `speak` | [`#L332-L332`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L332-L332) | `function` | Phát âm từ vựng với Dual Native Audio Engine & Kích hoạt hiệu ứng Equalizer |
| `handleEnded` | [`#L365-L371`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L365-L371) | `arrow_function` | Thực thi logic nội bộ |
| `handlePlaying` | [`#L373-L376`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L373-L376) | `arrow_function` | Thực thi logic nội bộ |
| `speakVi` | [`#L424-L483`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L424-L483) | `function` | Phát âm Tiếng Việt (Web Speech API vi-VN) |
| `finish` | [`#L460-L464`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/audio.js#L460-L464) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src/js/services/storage.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js) (1513 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `migrateLegacyCardStates` | [`#L69-L100`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L69-L100) | `function` | Tự động di chuyển tiến độ học của các ID cũ sang Canonical ID chuẩn sau khi |
| `StorageManager` | [`#L102-L1462`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L102-L1462) | `class` | Thực thi logic nội bộ |
| `StorageManager.getStateRevision` | [`#L103-L105`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L103-L105) | `method` | Thực thi logic nội bộ |
| `StorageManager.bumpStateRevision` | [`#L107-L109`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L107-L109) | `method` | Thực thi logic nội bộ |
| `StorageManager.initStorage` | [`#L114-L167`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L114-L167) | `method` | Khởi tạo kết nối IndexedDB và nạp trước dữ liệu vào RAM Cache |
| `StorageManager._preloadFromIndexedDB` | [`#L169-L324`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L169-L324) | `method` | Thực thi logic nội bộ |
| `StorageManager._getAllFromStore` | [`#L326-L339`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L326-L339) | `method` | Thực thi logic nội bộ |
| `StorageManager._putToStore` | [`#L341-L359`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L341-L359) | `method` | Thực thi logic nội bộ |
| `StorageManager.invalidateCache` | [`#L361-L369`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L361-L369) | `method` | Thực thi logic nội bộ |
| `StorageManager.getSettings` | [`#L371-L382`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L371-L382) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveSettings` | [`#L384-L402`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L384-L402) | `method` | Thực thi logic nội bộ |
| `StorageManager.getAllCardStates` | [`#L404-L416`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L404-L416) | `method` | Thực thi logic nội bộ |
| `StorageManager.getCardState` | [`#L418-L430`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L418-L430) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveCardState` | [`#L464-L492`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L464-L492) | `method` | Thực thi logic nội bộ |
| `StorageManager._scheduleCardsLocalStorageSync` | [`#L494-L507`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L494-L507) | `method` | Thực thi logic nội bộ |
| `StorageManager._scheduleLogsLocalStorageSync` | [`#L509-L522`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L509-L522) | `method` | Thực thi logic nội bộ |
| `StorageManager._scheduleTimeLocalStorageSync` | [`#L524-L535`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L524-L535) | `method` | Thực thi logic nội bộ |
| `StorageManager.flushPendingSync` | [`#L537-L556`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L537-L556) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveMultipleCardStates` | [`#L558-L588`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L558-L588) | `method` | Thực thi logic nội bộ |
| `StorageManager.suspendCard` | [`#L593-L617`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L593-L617) | `method` | Tạm dừng thẻ (Suspend) - ẩn khỏi hàng đợi ôn tập |
| `StorageManager.unsuspendCard` | [`#L622-L629`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L622-L629) | `method` | Bỏ tạm dừng thẻ (Unsuspend) |
| `StorageManager.resetLeechStatus` | [`#L634-L641`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L634-L641) | `method` | Đặt lại cờ thẻ khó và đưa thẻ trở lại hàng đợi học tập |
| `StorageManager.toggleCardSuspended` | [`#L646-L656`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L646-L656) | `method` | Đảo trạng thái tạm dừng của thẻ |
| `StorageManager.resetCardProgress` | [`#L661-L680`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L661-L680) | `method` | Đặt lại tiến độ thẻ về từ mới hoàn toàn (Reset / Forget) |
| `StorageManager.isCardSuspended` | [`#L685-L689`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L685-L689) | `method` | Kiểm tra xem thẻ có đang bị tạm dừng hay không |
| `StorageManager.recordStudiedDate` | [`#L695-L715`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L695-L715) | `method` | Ghi nhận ngày học hợp lệ vào hệ thống (lưu trữ vĩnh viễn không bao giờ bị c |
| `StorageManager.logReview` | [`#L717-L743`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L717-L743) | `method` | Thực thi logic nội bộ |
| `StorageManager.getStudyLogs` | [`#L745-L756`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L745-L756) | `method` | Thực thi logic nội bộ |
| `StorageManager.getStudyTimeMap` | [`#L758-L769`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L758-L769) | `method` | Thực thi logic nội bộ |
| `StorageManager.getTodayStudySeconds` | [`#L771-L775`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L771-L775) | `method` | Thực thi logic nội bộ |
| `StorageManager.getTotalStudySeconds` | [`#L777-L784`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L777-L784) | `method` | Thực thi logic nội bộ |
| `StorageManager.addStudySeconds` | [`#L786-L810`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L786-L810) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveToeicTestResult` | [`#L816-L834`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L816-L834) | `method` | Thực thi logic nội bộ |
| `StorageManager.getToeicTestHistory` | [`#L836-L845`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L836-L845) | `method` | Thực thi logic nội bộ |
| `StorageManager.getUserProgress` | [`#L851-L862`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L851-L862) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveUserProgress` | [`#L864-L878`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L864-L878) | `method` | Thực thi logic nội bộ |
| `StorageManager.completeSubtopic` | [`#L880-L890`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L880-L890) | `method` | Thực thi logic nội bộ |
| `StorageManager.isSubtopicCompleted` | [`#L892-L896`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L892-L896) | `method` | Thực thi logic nội bộ |
| `StorageManager.getPinnedTopicIds` | [`#L902-L908`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L902-L908) | `method` | Thực thi logic nội bộ |
| `StorageManager.isTopicPinned` | [`#L910-L914`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L910-L914) | `method` | Thực thi logic nội bộ |
| `StorageManager.togglePinTopic` | [`#L916-L933`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L916-L933) | `method` | Thực thi logic nội bộ |
| `StorageManager.getStreakState` | [`#L939-L954`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L939-L954) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveStreakState` | [`#L956-L972`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L956-L972) | `method` | Thực thi logic nội bộ |
| `StorageManager.useStreakFreeze` | [`#L974-L980`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L974-L980) | `method` | Thực thi logic nội bộ |
| `StorageManager.redeemStreak` | [`#L982-L988`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L982-L988) | `method` | Thực thi logic nội bộ |
| `StorageManager.checkAndAwardStreakFreeze` | [`#L990-L1000`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L990-L1000) | `method` | Thực thi logic nội bộ |
| `StorageManager.getCustomDecks` | [`#L1002-L1013`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1002-L1013) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveCustomDeck` | [`#L1015-L1036`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1015-L1036) | `method` | Thực thi logic nội bộ |
| `StorageManager.deleteCustomDeck` | [`#L1038-L1057`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1038-L1057) | `method` | Thực thi logic nội bộ |
| `StorageManager.createSafetySnapshot` | [`#L1062-L1077`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1062-L1077) | `method` | Tự động chụp bản sao lưu bảo hiểm an toàn (Safety Snapshot) trước khi thao  |
| `StorageManager.restoreSafetySnapshot` | [`#L1082-L1096`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1082-L1096) | `method` | Khôi phục bản sao lưu bảo hiểm gần nhất |
| `StorageManager.getUserProfile` | [`#L1102-L1114`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1102-L1114) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveUserProfile` | [`#L1116-L1124`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1116-L1124) | `method` | Thực thi logic nội bộ |
| `StorageManager.getUserPreferences` | [`#L1126-L1145`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1126-L1145) | `method` | Thực thi logic nội bộ |
| `StorageManager.saveUserPreferences` | [`#L1147-L1158`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1147-L1158) | `method` | Thực thi logic nội bộ |
| `StorageManager.exportBackup` | [`#L1160-L1162`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1160-L1162) | `method` | Thực thi logic nội bộ |
| `StorageManager.exportCompactBackup` | [`#L1167-L1179`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1167-L1179) | `method` | Xuất bản sao lưu Nano FSRS siêu nhẹ (giảm 85-95% dung lượng, giữ 100% dữ li |
| `StorageManager._normalizeCardState` | [`#L1181-L1183`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1181-L1183) | `method` | Thực thi logic nội bộ |
| `StorageManager.importBackup` | [`#L1185-L1416`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1185-L1416) | `method` | Thực thi logic nội bộ |
| `normalizeLog` | [`#L1236-L1246`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1236-L1246) | `arrow_function` | Thực thi logic nội bộ |
| `StorageManager.clearAllData` | [`#L1418-L1461`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1418-L1461) | `method` | Thực thi logic nội bộ |
| `BackupService` | [`#L1468-L1501`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1468-L1501) | `class` | Thực thi logic nội bộ |
| `BackupService.exportToJSON` | [`#L1472-L1475`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1472-L1475) | `method` | Xuất toàn bộ dữ liệu người dùng ra tệp sao lưu Nano JSON siêu nhẹ (.json) |
| `BackupService.importFromFile` | [`#L1480-L1493`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1480-L1493) | `method` | Nhập dữ liệu từ tệp File hoặc văn bản JSON đã sao lưu (hỗ trợ cả chuẩn Nano |
| `BackupService.resetAll` | [`#L1498-L1500`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage.js#L1498-L1500) | `method` | Đặt lại toàn bộ dữ liệu và tiến trình học về trạng thái ban đầu |

#### 📁 [`src/js/services/storage/backup.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/backup.js) (231 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `serializeCompactCards` | [`#L10-L10`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/backup.js#L10-L10) | `function` | Nén mảng trạng thái thẻ FSRS sang dạng mảng Positional Tuples rút gọn |
| `serializeCompactLogs` | [`#L47-L58`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/backup.js#L47-L58) | `function` | Nén lịch sử học tập logs sang định dạng tuple rút gọn |
| `normalizeCardState` | [`#L93-L93`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/backup.js#L93-L93) | `function` | Chuẩn hóa trạng thái thẻ từ cả định dạng Positional Tuple rút gọn lẫn Legac |
| `normalizeBackupLog` | [`#L154-L168`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/backup.js#L154-L168) | `function` | Chuẩn hóa một item log lịch sử học tập |
| `triggerJSONDownload` | [`#L173-L209`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/backup.js#L173-L209) | `function` | Kích hoạt tải tệp JSON về trình duyệt an toàn |
| `readBackupFileText` | [`#L214-L230`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/backup.js#L214-L230) | `function` | Đọc nội dung file sao lưu (hỗ trợ giải nén GZIP .gz / .fcpro nếu có) |

#### 📁 [`src/js/services/storage/streak.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/streak.js) (88 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `applyStreakFreeze` | [`#L11-L27`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/streak.js#L11-L27) | `function` | Áp dụng vật phẩm đóng băng chuỗi (Streak Freeze) cho một ngày bị lỡ |
| `applyStreakRedeem` | [`#L32-L47`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/streak.js#L32-L47) | `function` | Khôi phục chuỗi ngày học bằng lượt cứu trợ (Streak Redeem) |
| `evaluateStreakReward` | [`#L52-L87`](file:///storage/emulated/0/Code/flashcard-pro/src/js/services/storage/streak.js#L52-L87) | `function` | Kiểm tra và trao thưởng đóng băng chuỗi khi đạt các cột mốc streak (mỗi 7 n |

---

### TẦNG 3: MÀN HÌNH GIAO DIỆN (Presentation Views — `src/js/views/`)

#### 📁 [`src/js/views/components.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components.js) (22 dòng)

*Tệp cấu hình hoặc dữ liệu, không chứa khai báo hàm/class lớn.*

#### 📁 [`src/js/views/decks.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks.js) (377 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `savePinnedDecks` | [`#L40-L44`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks.js#L40-L44) | `function` | Thực thi logic nội bộ |
| `getDeckCategory` | [`#L69-L82`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks.js#L69-L82) | `function` | Thực thi logic nội bộ |
| `renderDecksTabShell` | [`#L88-L143`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks.js#L88-L143) | `function` | Thực thi logic nội bộ |
| `renderDecksTab` | [`#L145-L343`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks.js#L145-L343) | `function` | Thực thi logic nội bộ |
| `setupDecksToolbarEvents` | [`#L345-L376`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks.js#L345-L376) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/decks/subtopics.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/subtopics.js) (356 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderSubtopicsPageShell` | [`#L14-L40`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/subtopics.js#L14-L40) | `function` | Thực thi logic nội bộ |
| `openSubtopicsPage` | [`#L42-L46`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/subtopics.js#L42-L46) | `function` | Thực thi logic nội bộ |
| `renderSubtopicsPage` | [`#L48-L247`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/subtopics.js#L48-L247) | `function` | Thực thi logic nội bộ |
| `openSubtopicDetailPage` | [`#L249-L264`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/subtopics.js#L249-L264) | `function` | Thực thi logic nội bộ |
| `renderSubtopicDetailPage` | [`#L266-L355`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/subtopics.js#L266-L355) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/decks/words.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/words.js) (305 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderSubtopicWordsPageShell` | [`#L12-L44`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/words.js#L12-L44) | `function` | Thực thi logic nội bộ |
| `openSubtopicWordsPage` | [`#L46-L54`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/words.js#L46-L54) | `function` | Thực thi logic nội bộ |
| `renderSubtopicWordsPage` | [`#L56-L304`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/words.js#L56-L304) | `function` | Thực thi logic nội bộ |
| `getCardStatus` | [`#L97-L103`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/words.js#L97-L103) | `arrow_function` | Thực thi logic nội bộ |
| `renderFilteredWords` | [`#L140-L297`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/decks/words.js#L140-L297) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/library.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library.js) (861 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `buildSearchIndex` | [`#L31-L50`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library.js#L31-L50) | `function` | Thực thi logic nội bộ |
| `isFilterActive` | [`#L64-L73`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library.js#L64-L73) | `function` | Kiểm tra xem có bộ lọc nào khác mặc định đang hoạt động không |
| `renderLibraryTab` | [`#L78-L280`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library.js#L78-L280) | `function` | Khởi tạo và hiển thị toàn bộ giao diện màn hình Thư viện từ vựng |
| `setupLibraryEventListeners` | [`#L285-L419`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library.js#L285-L419) | `function` | Gắn các sự kiện tương tác cho View Thư viện |
| `getFilteredAndSortedCards` | [`#L426-L559`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library.js#L426-L559) | `function` | Lọc và sắp xếp danh sách từ vựng theo State |
| `renderLibraryWords` | [`#L564-L770`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library.js#L564-L770) | `function` | Hiển thị danh sách từ vựng dạng 1 dòng/từ siêu gọn đẹp kèm phân trang |
| `formatShortPos` | [`#L662-L674`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library.js#L662-L674) | `function` | Thực thi logic nội bộ |
| `renderPaginationBar` | [`#L775-L860`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library.js#L775-L860) | `function` | Hiển thị thanh điều hướng phân trang (Pagination Bar) |

#### 📁 [`src/js/views/library/detail-modal.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library/detail-modal.js) (368 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `formatFSRSDueText` | [`#L16-L141`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library/detail-modal.js#L16-L141) | `function` | Định dạng trạng thái FSRS, hạn ôn tập và nhãn phân tầng trí nhớ |
| `openWordDetailModal` | [`#L146-L367`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library/detail-modal.js#L146-L367) | `function` | Mở Modal Popup Chi Tiết Từ Vựng Đầy Đủ (Word Detail Modal) |
| `closeModal` | [`#L308-L311`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library/detail-modal.js#L308-L311) | `arrow_function` | Sự kiện đóng Modal |
| `handleEsc` | [`#L320-L325`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/library/detail-modal.js#L320-L325) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/quiz.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js) (970 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `playFeedbackTone` | [`#L50-L86`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L50-L86) | `function` | Phát âm thanh phản hồi nhẹ nhàng bằng Web Audio API |
| `generateDistractors` | [`#L91-L151`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L91-L151) | `function` | Sinh 3 đáp án gây nhiễu thông minh (Smart Distractors) |
| `renderQuizOverlayShell` | [`#L156-L232`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L156-L232) | `function` | Render Khung Shell của Quiz Overlay |
| `setupQuizEvents` | [`#L234-L330`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L234-L330) | `function` | Thực thi logic nội bộ |
| `advanceQuizQuestion` | [`#L332-L335`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L332-L335) | `function` | Thực thi logic nội bộ |
| `startQuizSession` | [`#L340-L340`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L340-L340) | `function` | Bắt đầu phiên ôn tập / học từ mới trắc nghiệm FSRS |
| `pushCard` | [`#L383-L390`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L383-L390) | `arrow_function` | Thực thi logic nội bộ |
| `getCardStatusInfo` | [`#L476-L491`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L476-L491) | `function` | Phân tích trạng thái FSRS của từ vựng hiện tại |
| `loadQuizQuestion` | [`#L496-L600`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L496-L600) | `function` | Nạp câu hỏi trắc nghiệm hiện tại |
| `handleOptionSelected` | [`#L605-L730`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L605-L730) | `function` | Xử lý khi người dùng chọn một phương án |
| `finishQuizSession` | [`#L735-L738`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L735-L738) | `function` | Kết thúc phiên trắc nghiệm & Tổng kết |
| `updateQuizLiveTimerUI` | [`#L740-L758`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L740-L758) | `function` | Thực thi logic nội bộ |
| `closeQuizSession` | [`#L760-L779`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L760-L779) | `function` | Thực thi logic nội bộ |
| `showQuizSummaryModal` | [`#L784-L969`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/quiz.js#L784-L969) | `function` | Modal Báo Cáo Tổng Kết Sau Khi Hoàn Thành Bài Trắc Nghiệm |

#### 📁 [`src/js/views/reels.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js) (1324 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getMainContentEl` | [`#L32-L37`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L32-L37) | `function` | Thực thi logic nội bộ |
| `loadUserInteractions` | [`#L62-L91`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L62-L91) | `function` | ========================================== PERSISTENCE HELPERS ============ |
| `saveUserInteractions` | [`#L93-L100`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L93-L100) | `function` | Thực thi logic nội bộ |
| `buildSmartFeedQueue` | [`#L105-L187`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L105-L187) | `function` | ========================================== QUEUE BUILDER (SMART FACEBOOK FE |
| `highlightTargetWord` | [`#L192-L202`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L192-L202) | `function` | ========================================== STRING & HTML HELPERS ========== |
| `getGradientForWord` | [`#L205-L218`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L205-L218) | `function` | Sinh Avatar Gradient ngẫu nhiên đẹp mắt (Dùng CSS Tokens để tương thích The |
| `renderFacebookPostCardHTML` | [`#L223-L454`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L223-L454) | `function` | ========================================== RENDER 1 FACEBOOK POST CARD ==== |
| `renderFilterModalHTML` | [`#L459-L553`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L459-L553) | `function` | ========================================== RENDER BỘ LỌC TỪ VỰNG MODAL / BO |
| `spawnFloatingReaction` | [`#L558-L566`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L558-L566) | `function` | ========================================== HIỆU ỨNG TIM BAY & REACTION FLOA |
| `appendNextBatch` | [`#L571-L594`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L571-L594) | `function` | ========================================== INFINITE FEED OBSERVER & BATCHIN |
| `updateFilterPillLabel` | [`#L596-L606`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L596-L606) | `function` | Thực thi logic nội bộ |
| `setupFeedIntersectionObserver` | [`#L608-L632`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L608-L632) | `function` | Thực thi logic nội bộ |
| `handleCardInView` | [`#L634-L649`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L634-L649) | `function` | Thực thi logic nội bộ |
| `checkAndPronounceCenterCard` | [`#L655-L684`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L655-L684) | `function` | Phát âm bài viết nằm chính giữa màn hình sau khi dừng lướt (Scroll Settled) |
| `handleRateCardFSRS` | [`#L689-L748`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L689-L748) | `function` | ========================================== RATING FSRS-6 HANDLER ========== |
| `openFilterModal` | [`#L753-L756`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L753-L756) | `function` | ========================================== FILTER DIALOG LOGIC ============ |
| `closeFilterModal` | [`#L758-L761`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L758-L761) | `function` | Thực thi logic nội bộ |
| `applyCurrentFilter` | [`#L763-L784`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L763-L784) | `function` | Thực thi logic nội bộ |
| `pauseReelsSession` | [`#L789-L803`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L789-L803) | `function` | ========================================== PAUSE, CLOSE & CLEANUP ========= |
| `renderReelsTab` | [`#L808-L808`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L808-L808) | `function` | ========================================== MAIN ENTRY POINT (TAB LƯỚT TỪ VỰ |
| `handleScroll` | [`#L1009-L1046`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L1009-L1046) | `arrow_function` | Thực thi logic nội bộ |
| `keyHandler` | [`#L1301-L1308`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L1301-L1308) | `arrow_function` | Phím tắt bàn phím |
| `startReelsSession` | [`#L1313-L1313`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/reels.js#L1313-L1313) | `function` | Giữ tương thích ngược với các lời gọi startReelsSession cũ |

#### 📁 [`src/js/views/review.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review.js) (674 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderReviewShell` | [`#L30-L204`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review.js#L30-L204) | `function` | Thực thi logic nội bộ |
| `renderReviewTab` | [`#L206-L381`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review.js#L206-L381) | `function` | Thực thi logic nội bộ |
| `updateHomeStatsRealtime` | [`#L386-L659`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review.js#L386-L659) | `function` | Cập nhật toàn bộ các chỉ số thống kê trên Home Dashboard theo thời gian thự |
| `updateLineFill` | [`#L550-L558`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review.js#L550-L558) | `arrow_function` | Cập nhật thanh fill nối giữa các chặng |

#### 📁 [`src/js/views/review/stat-modals.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review/stat-modals.js) (638 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `setStatModalsApp` | [`#L20-L22`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review/stat-modals.js#L20-L22) | `function` | Thực thi logic nội bộ |
| `triggerStatsRefresh` | [`#L24-L30`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review/stat-modals.js#L24-L30) | `function` | Thực thi logic nội bộ |
| `showAttentionCardsModal` | [`#L35-L202`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review/stat-modals.js#L35-L202) | `function` | ========================================================================== |
| `updateModalView` | [`#L87-L179`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review/stat-modals.js#L87-L179) | `arrow_function` | Thực thi logic nội bộ |
| `showDueWordsModal` | [`#L207-L295`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review/stat-modals.js#L207-L295) | `function` | ========================================================================== |
| `showReviewedTodayModal` | [`#L300-L406`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review/stat-modals.js#L300-L406) | `function` | ========================================================================== |
| `showStudyTimeModal` | [`#L411-L504`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review/stat-modals.js#L411-L504) | `function` | ========================================================================== |
| `showMasteredTiersModal` | [`#L509-L636`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/review/stat-modals.js#L509-L636) | `function` | ========================================================================== |

#### 📁 [`src/js/views/settings.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/settings.js) (964 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `saveAppSettings` | [`#L7-L12`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/settings.js#L7-L12) | `function` | Thực thi logic nội bộ |
| `renderSettingsTabShell` | [`#L18-L361`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/settings.js#L18-L361) | `function` | Thực thi logic nội bộ |
| `setupSettingsUI` | [`#L363-L912`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/settings.js#L363-L912) | `function` | Thực thi logic nội bộ |
| `updateLineFill` | [`#L538-L545`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/settings.js#L538-L545) | `arrow_function` | Thực thi logic nội bộ |
| `syncPresetButtons` | [`#L588-L600`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/settings.js#L588-L600) | `arrow_function` | Đồng bộ nút preset hồ sơ học tập cá nhân hóa |
| `updateSettingsUIValues` | [`#L914-L941`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/settings.js#L914-L941) | `function` | Thực thi logic nội bộ |
| `executeBackupImport` | [`#L943-L961`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/settings.js#L943-L961) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/stats.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats.js) (376 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `renderStatsTab` | [`#L32-L375`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats.js#L32-L375) | `function` | Điều phối render toàn bộ nội dung của màn hình Thống Kê & Năng Lực Trí Nhớ |
| `setTierCnt` | [`#L336-L341`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats.js#L336-L341) | `arrow_function` | Thực thi logic nội bộ |
| `setReflex` | [`#L355-L360`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats.js#L355-L360) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/stats/forecast-modal.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/forecast-modal.js) (378 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `openCalendarForecastModal` | [`#L19-L377`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/forecast-modal.js#L19-L377) | `function` | Mở Modal Lịch Tháng Dự Báo Chi Tiết |
| `renderModalContent` | [`#L32-L354`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/forecast-modal.js#L32-L354) | `arrow_function` | Thực thi logic nội bộ |
| `closeModal` | [`#L356-L359`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/forecast-modal.js#L356-L359) | `arrow_function` | Thực thi logic nội bộ |
| `onKeyDown` | [`#L365-L370`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/forecast-modal.js#L365-L370) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/stats/journal.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/journal.js) (499 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getCurrentJournalPeriod` | [`#L10-L12`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/journal.js#L10-L12) | `function` | Thực thi logic nội bộ |
| `renderStatsTabShell` | [`#L17-L370`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/journal.js#L17-L370) | `function` | Khởi tạo khung DOM tĩnh ban đầu của Stats Tab |
| `setupJournalEvents` | [`#L375-L424`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/journal.js#L375-L424) | `function` | Gắn sự kiện điều hướng tháng trên Journal Heatmap |
| `showDayPopover` | [`#L429-L483`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/journal.js#L429-L483) | `function` | Hiển thị Tooltip Popover thông tin học tập của một ngày khi rê chuột / clic |
| `hideDayPopover` | [`#L488-L498`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/stats/journal.js#L488-L498) | `function` | Ẩn Tooltip Popover |

#### 📁 [`src/js/views/study.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js) (1402 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `startFrontActiveRecallTimer` | [`#L78-L125`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L78-L125) | `function` | Thực thi logic nội bộ |
| `updateCountdown` | [`#L102-L121`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L102-L121) | `arrow_function` | Thực thi logic nội bộ |
| `updateStudyPriorityUI` | [`#L134-L154`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L134-L154) | `function` | Cập nhật hiển thị nhãn và biểu tượng chế độ ưu tiên trên Header thanh học F |
| `switchStudyPriority` | [`#L159-L205`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L159-L205) | `function` | Thay đổi thứ tự ưu tiên học trực tiếp trong phiên học (Zero-exit, liền mạch |
| `setupStudyControls` | [`#L207-L894`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L207-L894) | `function` | Thực thi logic nội bộ |
| `syncCheckboxesFromPrefs` | [`#L247-L263`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L247-L263) | `arrow_function` | Khởi tạo trạng thái điều khiển theo Preferences hiện tại |
| `updatePrefFromControls` | [`#L265-L296`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L265-L296) | `arrow_function` | Thực thi logic nội bộ |
| `switchToQuizMode` | [`#L333-L362`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L333-L362) | `arrow_function` | Chuyển đổi trực tiếp sang Chế độ Trắc nghiệm (Quiz) trong phiên học |
| `openDrawer` | [`#L374-L377`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L374-L377) | `arrow_function` | Mở / Đóng Drawer 3 chấm |
| `closeDrawer` | [`#L378-L380`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L378-L380) | `arrow_function` | Thực thi logic nội bộ |
| `openPriorityModal` | [`#L398-L402`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L398-L402) | `arrow_function` | Thực thi logic nội bộ |
| `closePriorityModal` | [`#L403-L405`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L403-L405) | `arrow_function` | Thực thi logic nội bộ |
| `triggerFlip` | [`#L468-L544`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L468-L544) | `arrow_function` | Lật thẻ khi chạm, vuốt hoặc bấm nút lật (hỗ trợ vuốt lên 360 độ liên tục) |
| `safeRateCard` | [`#L571-L620`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L571-L620) | `arrow_function` | Thực thi logic nội bộ |
| `getStudyDom` | [`#L899-L947`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L899-L947) | `function` | Thực thi logic nội bộ |
| `updateStudyLiveTimerUI` | [`#L951-L977`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L951-L977) | `function` | Thực thi logic nội bộ |
| `generateClozeSentence` | [`#L981-L991`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L981-L991) | `function` | Thực thi logic nội bộ |
| `startStudySession` | [`#L993-L1025`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L993-L1025) | `function` | Thực thi logic nội bộ |
| `applyFieldVisibility` | [`#L1027-L1097`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L1027-L1097) | `function` | Thực thi logic nội bộ |
| `handleCardChange` | [`#L1099-L1343`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L1099-L1343) | `function` | Thực thi logic nội bộ |
| `handleStudyFinish` | [`#L1345-L1399`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study.js#L1345-L1399) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/study/autoplay.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/autoplay.js) (288 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `isAutoPlayActive` | [`#L14-L16`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/autoplay.js#L14-L16) | `function` | Thực thi logic nội bộ |
| `updateAutoPlayUI` | [`#L18-L48`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/autoplay.js#L18-L48) | `function` | Thực thi logic nội bộ |
| `stopAutoPlay` | [`#L50-L57`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/autoplay.js#L50-L57) | `function` | Thực thi logic nội bộ |
| `triggerAutoPlayStep` | [`#L59-L153`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/autoplay.js#L59-L153) | `function` | Thực thi logic nội bộ |
| `onBackFinished` | [`#L93-L145`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/autoplay.js#L93-L145) | `arrow_function` | --- BƯỚC 2: MẶT SAU (Đọc Tiếng Việt nếu bật -> Chờ tiếp thu -> Sang thẻ kế  |
| `setupAutoPlayControls` | [`#L155-L287`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/autoplay.js#L155-L287) | `function` | Thực thi logic nội bộ |
| `syncAutoplayInputs` | [`#L177-L184`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/autoplay.js#L177-L184) | `arrow_function` | Thực thi logic nội bộ |
| `openAutoplayModal` | [`#L188-L191`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/autoplay.js#L188-L191) | `arrow_function` | Thực thi logic nội bộ |
| `closeAutoplayModal` | [`#L193-L195`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/autoplay.js#L193-L195) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/study/pomodoro.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/pomodoro.js) (145 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `initPomodoroTracker` | [`#L17-L75`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/pomodoro.js#L17-L75) | `function` | Thực thi logic nội bộ |
| `startPomodoroTicker` | [`#L77-L100`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/pomodoro.js#L77-L100) | `function` | Thực thi logic nội bộ |
| `stopPomodoroTracker` | [`#L102-L108`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/pomodoro.js#L102-L108) | `function` | Thực thi logic nội bộ |
| `recordPomodoroCardReviewed` | [`#L110-L116`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/pomodoro.js#L110-L116) | `function` | Thực thi logic nội bộ |
| `updatePomodoroUI` | [`#L118-L144`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/pomodoro.js#L118-L144) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/study/prefs.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/prefs.js) (116 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getAutoPlayPrefs` | [`#L16-L30`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/prefs.js#L16-L30) | `function` | Thực thi logic nội bộ |
| `saveAutoPlayPrefs` | [`#L32-L36`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/prefs.js#L32-L36) | `function` | Thực thi logic nội bộ |
| `getStudyPrefs` | [`#L57-L82`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/prefs.js#L57-L82) | `function` | Thực thi logic nội bộ |
| `saveStudyPrefs` | [`#L84-L88`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/prefs.js#L84-L88) | `function` | Thực thi logic nội bộ |
| `applyRatingButtonsMode` | [`#L90-L115`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/prefs.js#L90-L115) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/study/shell.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/shell.js) (527 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getStudyOverlay` | [`#L8-L13`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/shell.js#L8-L13) | `function` | Thực thi logic nội bộ |
| `renderStudyOverlayShell` | [`#L15-L526`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/shell.js#L15-L526) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/study/summary-modal.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/summary-modal.js) (59 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `showSummaryModal` | [`#L6-L58`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/study/summary-modal.js#L6-L58) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/toeic-test.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js) (1034 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getToeicOverlay` | [`#L24-L29`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L24-L29) | `function` | Thực thi logic nội bộ |
| `renderToeicTestTab` | [`#L34-L175`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L34-L175) | `function` | Hiển thị Màn hình Hub của Tab Thi Thử TOEIC (Danh sách đề thi) |
| `showTestModeSelectorModal` | [`#L180-L252`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L180-L252) | `function` | Hiển thị Popup đơn giản tùy chọn: Luyện tập vs Thi thật |
| `closeModal` | [`#L226-L228`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L226-L228) | `arrow_function` | Thực thi logic nội bộ |
| `startToeicTestBySet` | [`#L257-L286`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L257-L286) | `function` | Khởi động phiên làm bài / thi thử theo bộ đề cụ thể |
| `startToeicTest` | [`#L291-L294`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L291-L294) | `function` | Hàm hỗ trợ tương thích |
| `ensureArenaOverlayCreated` | [`#L299-L308`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L299-L308) | `function` | Tạo khung shell phòng thi nếu chưa có |
| `togglePalletDrawer` | [`#L313-L321`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L313-L321) | `function` | Mở / Đóng Bảng câu hỏi (Drawer/Bottom Sheet) |
| `renderArenaLayout` | [`#L326-L520`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L326-L520) | `function` | Render bố cục phòng thi ETS CBT |
| `loadArenaQuestion` | [`#L525-L648`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L525-L648) | `function` | Nạp câu hỏi tại index vào giao diện |
| `updatePalletMatrix` | [`#L653-L685`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L653-L685) | `function` | Cập nhật ma trận số câu hỏi ở thanh bên |
| `toggleFlagCurrentQuestion` | [`#L687-L694`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L687-L694) | `function` | Thực thi logic nội bộ |
| `startArenaTimer` | [`#L699-L713`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L699-L713) | `function` | Bắt đầu đồng hồ đếm ngược |
| `updateTimerDigitsUI` | [`#L715-L733`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L715-L733) | `function` | Thực thi logic nội bộ |
| `confirmAndSubmitTest` | [`#L738-L766`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L738-L766) | `function` | Xác nhận & Nộp bài thi |
| `finishToeicTest` | [`#L771-L811`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L771-L811) | `function` | Tính toán kết quả bài thi, lưu vào Storage và hiển thị Modal giải thích |
| `closeArenaSession` | [`#L813-L821`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L813-L821) | `function` | Thực thi logic nội bộ |
| `showToeicResultModal` | [`#L826-L976`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L826-L976) | `function` | Hiển thị Modal Báo Cáo Kết Quả & Lời Giải Thích Chi Tiết Từng Câu |
| `closeModal` | [`#L959-L964`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L959-L964) | `arrow_function` | Thực thi logic nội bộ |
| `setupArenaKeyShortcuts` | [`#L981-L1033`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/toeic-test.js#L981-L1033) | `function` | Lắng nghe phím tắt bàn phím trong phòng thi |

---

### TẦNG 4: THÀNH PHẦN & MODALS (Components & Modals — `src/js/views/components/`, `modals/`)

#### 📁 [`src/js/views/components/custom-study.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/custom-study.js) (394 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `openCustomStudyModal` | [`#L16-L392`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/custom-study.js#L16-L392) | `function` | Thực thi logic nội bộ |
| `updateMatchingCards` | [`#L163-L245`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/custom-study.js#L163-L245) | `arrow_function` | Hàm tính toán danh sách từ thỏa mãn |
| `closeModal` | [`#L289-L291`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/custom-study.js#L289-L291) | `arrow_function` | Đóng Modal |
| `getTier` | [`#L329-L335`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/custom-study.js#L329-L335) | `arrow_function` | Bậc ưu tiên: 1: Due, 2: Learning, 3: New, 4: Mastered |

#### 📁 [`src/js/views/components/optimizer-modal.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/optimizer-modal.js) (259 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `openBehavioralOptimizerModal` | [`#L15-L256`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/optimizer-modal.js#L15-L256) | `function` | Thực thi logic nội bộ |
| `closeModal` | [`#L215-L217`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/optimizer-modal.js#L215-L217) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/components/search.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js) (440 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `setupSearch` | [`#L29-L435`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L29-L435) | `function` | Thực thi logic nội bộ |
| `getSearchHistory` | [`#L49-L56`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L49-L56) | `arrow_function` | Thực thi logic nội bộ |
| `saveSearchHistory` | [`#L58-L62`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L58-L62) | `arrow_function` | Thực thi logic nội bộ |
| `addQueryToHistory` | [`#L64-L71`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L64-L71) | `arrow_function` | Thực thi logic nội bộ |
| `removeQueryFromHistory` | [`#L73-L78`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L73-L78) | `arrow_function` | Thực thi logic nội bộ |
| `openSearchModal` | [`#L80-L90`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L80-L90) | `arrow_function` | Thực thi logic nội bộ |
| `closeSearchModal` | [`#L92-L104`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L92-L104) | `arrow_function` | Thực thi logic nội bộ |
| `updateSelectedResult` | [`#L149-L160`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L149-L160) | `arrow_function` | Thực thi logic nội bộ |
| `renderSearchSuggestions` | [`#L162-L231`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L162-L231) | `arrow_function` | Thực thi logic nội bộ |
| `performSearch` | [`#L270-L354`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L270-L354) | `arrow_function` | Thực thi logic nội bộ |
| `renderSearchResults` | [`#L356-L430`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/search.js#L356-L430) | `arrow_function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/components/shell.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/shell.js) (230 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `mountGlobalModals` | [`#L10-L227`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/shell.js#L10-L227) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/components/streak-hub.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/streak-hub.js) (222 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `showStreakHubModal` | [`#L15-L219`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/streak-hub.js#L15-L219) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/views/components/toast.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/toast.js) (159 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `cleanup` | [`#L51-L60`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/toast.js#L51-L60) | `arrow_function` | Thực thi logic nội bộ |
| `showToast` | [`#L111-L156`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/toast.js#L111-L156) | `function` | Upgraded In-App Floating Toast Notification (thay thế window.alert) Tối ưu  |
| `dismiss` | [`#L143-L149`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/components/toast.js#L143-L149) | `arrow_function` | Cho phép bấm trực tiếp vào toast để tắt ngay |

#### 📁 [`src/js/views/modals/goal-modal.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/modals/goal-modal.js) (416 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `showGoalCustomizerModal` | [`#L13-L286`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/modals/goal-modal.js#L13-L286) | `function` | ========================================================================== |
| `renderModalContent` | [`#L29-L282`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/modals/goal-modal.js#L29-L282) | `arrow_function` | Thực thi logic nội bộ |
| `showForecastDetailModal` | [`#L291-L413`](file:///storage/emulated/0/Code/flashcard-pro/src/js/views/modals/goal-modal.js#L291-L413) | `function` | ========================================================================== |

---

### TẦNG 5: ĐIỀU PHỐI CHÍNH & NỀN TẢNG (`src/js/app.js`, `config.js`, `utils.js`)

#### 📁 [`src/js/app.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js) (770 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `FlashcardApp` | [`#L41-L748`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L41-L748) | `class` | Thực thi logic nội bộ |
| `FlashcardApp.constructor` | [`#L42-L60`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L42-L60) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.init` | [`#L62-L129`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L62-L129) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.registerServiceWorker` | [`#L131-L246`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L131-L246) | `method` | Thực thi logic nội bộ |
| `performReload` | [`#L160-L167`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L160-L167) | `arrow_function` | Thực thi logic nội bộ |
| `handleUpdateDetected` | [`#L169-L177`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L169-L177) | `arrow_function` | Thực thi logic nội bộ |
| `FlashcardApp.checkUpdate` | [`#L253-L253`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L253-L253) | `method` | Kiểm tra và áp dụng cập nhật phiên bản mới một cách minh bạch, có phản hồi  |
| `FlashcardApp.scrollToTop` | [`#L357-L359`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L357-L359) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.setupNavigation` | [`#L361-L460`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L361-L460) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.switchTab` | [`#L462-L515`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L462-L515) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.refreshAllViews` | [`#L517-L546`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L517-L546) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.updateHeaderBadges` | [`#L548-L576`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L548-L576) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.applyTheme` | [`#L578-L615`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L578-L615) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderReviewTab` | [`#L618-L620`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L618-L620) | `method` | Delegated View Methods |
| `FlashcardApp.renderLibraryTab` | [`#L622-L624`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L622-L624) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderDecksTab` | [`#L626-L628`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L626-L628) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.openSubtopicsPage` | [`#L630-L632`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L630-L632) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderSubtopicsPage` | [`#L634-L636`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L634-L636) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.openSubtopicDetailPage` | [`#L638-L640`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L638-L640) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderSubtopicDetailPage` | [`#L642-L644`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L642-L644) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.openSubtopicWordsPage` | [`#L646-L648`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L646-L648) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderSubtopicWordsPage` | [`#L650-L652`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L650-L652) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderStatsTab` | [`#L654-L656`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L654-L656) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderSettingsTab` | [`#L658-L660`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L658-L660) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderToeicTestTab` | [`#L662-L664`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L662-L664) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.startStudySession` | [`#L666-L666`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L666-L666) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.changeStudyPriority` | [`#L702-L704`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L702-L704) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.startQuizSession` | [`#L706-L706`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L706-L706) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.renderReelsTab` | [`#L720-L720`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L720-L720) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.startReelsSession` | [`#L728-L728`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L728-L728) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.showConfirm` | [`#L741-L743`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L741-L743) | `method` | Thực thi logic nội bộ |
| `FlashcardApp.showToast` | [`#L745-L747`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L745-L747) | `method` | Thực thi logic nội bộ |
| `bootstrap` | [`#L750-L761`](file:///storage/emulated/0/Code/flashcard-pro/src/js/app.js#L750-L761) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/config.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/config.js) (389 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `getLearningGoal` | [`#L157-L161`](file:///storage/emulated/0/Code/flashcard-pro/src/js/config.js#L157-L161) | `function` | Thực thi logic nội bộ |
| `getSubtopicColor` | [`#L273-L283`](file:///storage/emulated/0/Code/flashcard-pro/src/js/config.js#L273-L283) | `function` | Thực thi logic nội bộ |
| `getSubtopicIcon` | [`#L285-L388`](file:///storage/emulated/0/Code/flashcard-pro/src/js/config.js#L285-L388) | `function` | Thực thi logic nội bộ |

#### 📁 [`src/js/utils.js`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js) (160 dòng)

| Tên Hàm / Phương Thức | Vị Trí Dòng | Loại | Trách Nhiệm & Mô Tả |
| :--- | :---: | :---: | :--- |
| `escapeHTML` | [`#L9-L17`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L9-L17) | `function` | Mã hóa ký tự đặc biệt HTML chống tấn công XSS |
| `safeColor` | [`#L22-L25`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L22-L25) | `function` | Kiểm tra và làm sạch chuỗi mã màu CSS hợp lệ |
| `escapeRegex` | [`#L30-L32`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L30-L32) | `function` | Thoát các ký tự đặc biệt khi tạo RegExp động |
| `formatCleanInterval` | [`#L37-L39`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L37-L39) | `function` | Làm sạch chuỗi chu kỳ FSRS cho nhãn nút ngắn gọn (bỏ ký tự <, ≤, khoảng trắ |
| `getLocalDateKey` | [`#L46-L61`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L46-L61) | `function` | Lấy khóa ngày dạng YYYY-MM-DD theo giờ địa phương của thiết bị (chống lệch  |
| `scrollToTop` | [`#L66-L89`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L66-L89) | `function` | Cuộn mượt mà cửa sổ hoặc container lên đầu trang |
| `highlightKeyword` | [`#L94-L100`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L94-L100) | `function` | Đánh dấu từ khóa tìm kiếm trong chuỗi văn bản an toàn với thẻ <mark> |
| `debounce` | [`#L105-L111`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L105-L111) | `function` | Hàm Debounce trì hoãn gọi hàm liên tục (tối ưu gõ phím tìm kiếm) |
| `sleep` | [`#L116-L118`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L116-L118) | `function` | Hàm trì hoãn Async Promise (Sleep) |
| `normalizePos` | [`#L123-L130`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L123-L130) | `function` | Chuẩn hóa nhãn từ loại (Part of Speech) thành 'noun' - 'verb' - 'adj' - 'ot |
| `getCurrentSettings` | [`#L135-L146`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L135-L146) | `function` | Lấy settings hiện tại ưu tiên từ window.app.settings hoặc StorageManager fa |
| `shuffle` | [`#L151-L158`](file:///storage/emulated/0/Code/flashcard-pro/src/js/utils.js#L151-L158) | `function` | Trộn mảng ngẫu nhiên (Fisher-Yates shuffle) |

---

