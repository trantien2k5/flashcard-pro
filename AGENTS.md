# 🤖 AGENTS.md — System Context & Development Directives

> **Tài liệu SSOT (Single Source of Truth)** dành cho AI Agent khi làm việc với dự án **Flashcard English Pro**.
> Phiên bản hiện tại: **`v3.76.29`** | Kiến trúc: **Vanilla ES6+ Modules, Offline-First PWA, FSRS-6 Spaced Repetition**.

---

## 🚨 1. Nguyên Tắc Thực Thi Bắt Buộc (Prime Directives)

1. **Tuyệt đối chuẩn xác & Không phát sinh lỗi**:
   - Mọi thay đổi code JS/CSS phải hợp lệ 100% cú pháp V8 AST, đúng tên named exports/imports, đầy đủ biến CSS và dấu chấm phẩy.
   - Không tự ý thêm bớt ngoài phạm vi yêu cầu của người dùng. Đi thẳng vào tệp tin đích cần chỉnh sửa.
2. **Quy trình bắt buộc sau mỗi lần sửa code (Self-Testing)**:
   - Chạy ngay: `node test/check.js` (hoặc `npm test`).
   - Nếu có lỗi AST, import sai hàm, hoặc thiếu biến CSS: **Tự động phân tích và khắc phục triệt để ngay lập tức**, không chờ người dùng nhắc.
3. **Cơ chế nâng phiên bản một nơi duy nhất (Single-Source Version Bump)**:
   - **Tuyệt đối không sửa tay** lần lượt `package.json`, `sw.js`, `js/config.js`, `index.html`.
   - Tự động tăng patch: `npm run bump` (hoặc `node scripts/bump.js`).
   - Đặt phiên bản cụ thể: `node scripts/bump.js <version>` (ví dụ: `node scripts/bump.js 3.77.0`).
   - Đồng bộ từ `package.json`: `npm run bump:sync` (hoặc `node scripts/bump.js --sync`).
   - Script sẽ đồng bộ tự động 4 file và tự chạy `node test/check.js` kiểm tra tính toàn vẹn.
4. **Quy tắc xác nhận trước khi viết code (Confirmation Gate)**:
   - **Mặc định:** Luôn trình bày tóm tắt giải pháp / các file dự định can thiệp và **chờ người dùng xác nhận đồng ý trước khi tiến hành viết hoặc sửa code**.
   - **Ngoại lệ (Thực thi ngay không cần hỏi):** Chỉ khi người dùng yêu cầu rõ ràng bằng các lệnh hoặc từ khóa như: *"code luôn"*, *"fix ngay"*, *"làm ngay"*, *"sửa luôn"*, *"thực thi ngay"* (hoặc ngữ cảnh tương đương), AI mới tiến hành sửa code trực tiếp mà không cần hỏi lại.

---

## 📌 2. Tổng Quan Dự Án & Thông Số Kỹ Thuật

- **Quy mô dữ liệu:** **4.157** từ vựng CEFR, **22** chủ đề gốc, **569** chặng học phân tầng, **2.582+** ảnh WebP cục bộ (100% Offline).
- **Tech Stack:**
  - **Core & Logic:** Pure Vanilla JavaScript (ES6+ Native Modules), không dùng framework cồng kềnh (No React/Vue).
  - **Giao diện:** Semantic HTML5, CSS Variables, 3D CSS Transforms (Flip Card), Dark/Light theme.
  - **Lưu trữ Client-Side:** `IndexedDB` (`FlashcardProDB`) kết hợp **In-Memory Write-Through RAM Cache** và fallback `localStorage`.
  - **Âm thanh:** Web Speech API kết hợp AudioContext và AI TTS fallback cục bộ.
  - **Thuật toán cốt lõi:** **FSRS-6** (Free Spaced Repetition Scheduler 6) với 19 tham số tối ưu hóa chu kỳ ôn tập.

---

## 📁 3. Bản Đồ Cấu Trúc Mã Nguồn (Standard `src/` Architecture)

```
flashcard-pro/
├── index.html                    # Layout SPA chính, navigation bar, modal containers
├── AGENTS.md                     # File quy tắc & kiến trúc cho AI Agent (Tệp này)
├── sw.js                         # Service Worker PWA (Cache-first offline & auto-update)
├── manifest.json                 # Web App Manifest PWA
├── package.json                  # Scripts test, build, bump version (SSOT: v3.76.26)
├── jsconfig.json                 # Cấu hình Path Aliases (@core, @views, @services, @data)
│
├── assets/                       # Tài nguyên tĩnh (Static Assets)
│   ├── icons/                    # App Icons PWA
│   └── images/words/             # 2.582+ ảnh WebP cục bộ phân tầng a-z
│
├── src/                          # 🌟 TOÀN BỘ MÃ NGUỒN DỰ ÁN
│   ├── js/                       # Tầng JavaScript Logic
│   │   ├── app.js                # [Main Orchestrator] Bootstrap, Tab Switching Router, Event Bus
│   │   ├── config.js             # App config, Storage Keys, FSRS constants, Topic metadata
│   │   ├── utils.js              # Helper functions (DOM, async, debounce, sanitize, format)
│   │   │
│   │   ├── core/                 # Lõi Nghiệp vụ & Thuật toán
│   │   │   ├── fsrs.js           # Thuật toán FSRS-6 thuần JS (Stability, Difficulty, Retrievability)
│   │   │   ├── session.js        # State machine phiên học Flashcard, queue FSRS (relearnInSession: false)
│   │   │   ├── selectors.js      # DeckManager (Lọc từ vựng, tính toán chặng học, phân tầng chủ đề)
│   │   │   ├── stats.js          # StatsManager (Phân tích FSRS, heatmap 7 ngày, streak, dự báo)
│   │   │   ├── timer.js          # StudyTimer (Bộ đếm thời gian học chuẩn xác, tự động pause khi đổi tab)
│   │   │   └── optimizer.js      # BehavioralOptimizer (Tự động tinh chỉnh tham số FSRS ngầm Zero-touch)
│   │   │
│   │   ├── services/             # Tầng Dịch vụ & Ngoại vi
│   │   │   ├── storage.js        # StorageManager (Facade, IndexedDB + RAM Cache Write-Through)
│   │   │   ├── storage/          # Module con phân tầng của StorageManager
│   │   │   │   ├── streak.js     # Thuật toán Streak State Engine, Đóng băng Streak & Thưởng cột mốc
│   │   │   │   └── backup.js     # Đóng gói/giải nén Nano FSRS Compact Tuple, Tải & nạp file sao lưu JSON
│   │   │   └── audio.js          # AudioManager (Web Speech API, AudioContext sfx)
│   │   │
│   │   └── views/                # Các màn hình giao diện (View Controllers)
│   │       ├── study.js          # [Controller Facade] Giao diện học Flashcard 3D & 4 nút đánh giá
│   │       ├── study/            # Module con phân tầng của Study View
│   │       │   ├── autoplay.js   # Cỗ máy học tự động rảnh tay (Hands-free Autoplay Engine)
│   │       │   ├── prefs.js      # Quản lý cấu hình & tùy chọn học tập (Autoplay, Flashcard Prefs)
│   │       │   ├── shell.js      # Cấu trúc khung DOM màn hình học & bắt sự kiện vuốt chạm cử chỉ
│   │       │   ├── pomodoro.js   # Bộ đếm Pomodoro tập trung chuyên biệt cho phiên học
│   │       │   └── summary-modal.js # Modal tổng kết thành tích sau khi hoàn thành phiên học
│   │       ├── modals/           # Modal độc lập dùng chung cho các màn hình
│   │       │   └── goal-modal.js # Modal thiết lập mục tiêu hàng ngày & chi tiết dự báo tải ôn tập
│   │       ├── components.js     # [Barrel Facade] Tái xuất khẩu các thành phần UI dùng chung
│   │       ├── components/       # Các thành phần UI chuyên biệt dùng chung
│   │       │   ├── shell.js      # Khởi tạo khung chứa modal toàn cục (mountGlobalModals)
│   │       │   ├── toast.js      # Hệ thống thông báo Toast linh hoạt
│   │       │   ├── search.js     # Hộp thoại tìm kiếm từ vựng toàn cục (Global Search)
│   │       │   ├── streak-hub.js # Trung tâm quản lý chuỗi ngày học & khôi phục Streak
│   │       │   ├── custom-study.js # Hộp thoại tùy chỉnh cấu hình phiên học Flashcard nâng cao
│   │       │   └── optimizer-modal.js # Modal hiển thị báo cáo tự động tối ưu hóa FSRS ngầm
│   │       ├── review.js         # Màn hình Trang chủ: Nhiệm vụ hôm nay, Kho từ vựng & Tiến độ
│   │       ├── decks.js          # Duyệt Chủ đề 4 cấp, danh sách từ vựng & chặng học
│   │       ├── library.js        # Thư viện Từ vựng tổng, tìm kiếm & bộ lọc FSRS-6
│   │       ├── stats.js          # Màn hình thống kê chi tiết & biểu đồ FSRS
│   │       ├── settings.js       # Cài đặt ứng dụng, tùy chỉnh FSRS, hồ sơ học tập (Profile)
│   │       ├── quiz.js           # Trắc nghiệm thông minh ôn tập FSRS Smart Quiz
│   │       ├── reels.js          # Lướt từ vựng dạng Reels cuộn dọc (TikTok style, chuẩn 100% CSS Tokens)
│   │       └── toeic-test.js     # Kiểm tra trình độ TOEIC Mini & Full Test
│   │
│   ├── css/                      # Hệ thống Stylesheet Module hóa
│   │   ├── style.css             # Master CSS nạp toàn bộ bundle stylesheets
│   │   ├── main.css              # Design Tokens, Base Reset, Layout Shell & Animations
│   │   ├── flashcard.css         # 3D Flip Card, rating buttons, audio controls
│   │   ├── components.css        # Modals, Toast notifications, Dialogs
│   │   └── views/*.css           # CSS chuyên biệt cho từng màn hình tương ứng
│   │
│   └── data/                     # Dữ liệu tĩnh & Schema
│       ├── index.js              # Điểm tập kết dữ liệu, xuất hàm validateData()
│       ├── words.js & words/     # 4.157 từ vựng chuẩn hóa phân chia theo module (a1-c1, toeic-500)
│       ├── topics.js             # Cây chủ đề 22 danh mục & 547 chủ đề con
│       ├── toeic-tests.js        # Đề thi trắc nghiệm TOEIC
│       ├── schemas.js            # Schema định nghĩa cấu trúc Word & Topic
│       └── validators.js         # Bộ xác thực dữ liệu từ vựng & taxonomy
│
├── scripts/
│   ├── bump.js                   # Script đồng bộ phiên bản tự động toàn dự án (SSOT)
│   └── data_gen/                 # Các script Python tạo dữ liệu & migration
│
└── test/
    ├── check.js                  # Bộ test AST, Export/Import, CSS, Data Schema (< 0.2s)
    ├── refactor_guide.js         # Công cụ quét Code Smell & phân tích độ tinh gọn
    ├── test_fsrs_sync.js         # Test đồng bộ thuật toán FSRS & nhãn khoảng thời gian UI
    └── test_quiz_balance.js      # Test cân bằng xác suất đề thi Quiz
```

---

## 🧠 4. Cơ Chế Nghiệp Vụ Cốt Lõi (Core Mechanics)

### 4.1. Đánh giá FSRS-6 (4 mức đánh giá Anki chuẩn)
| Rating | Tên hiển thị | Ý nghĩa FSRS | Hành vi |
| :--- | :--- | :--- | :--- |
| **1** | **Again** | Quên hoàn toàn từ vựng | Reset Stability, tăng Difficulty, lên lịch học lại ngày mai |
| **2** | **Hard** | Nhớ nhưng mất nhiều thời gian | Tăng nhẹ Stability, tăng Difficulty |
| **3** | **Good** | Nhớ chính xác, bình thường | Tăng chuẩn Stability theo trọng số FSRS-6 |
| **4** | **Easy** | Nhớ ngay lập tức | Tăng mạnh Stability, giảm Difficulty |

> **Lưu ý:** Phiên học flashcard áp dụng `relearnInSession: false` (không lặp lại từ quên ngay giữa phiên học hiện tại, mà chuyển vào hàng đợi ôn tập ngày tiếp theo).

### 4.2. Quản lý Dữ liệu & Storage (`storage.js`)
- Dữ liệu tiến độ học được lưu tại `IndexedDB` (`FlashcardProDB`).
- **RAM Cache Write-Through**: Để giao diện đọc tức thì mà không cần `await` async ở mọi thao tác render, `StorageManager` duy trì một bản sao State trên RAM. Khi ghi, State được cập nhật đồng thời lên RAM và đẩy ngầm vào IndexedDB.

### 4.3. Bản Đồ ID Màn Hình & Layout Chính (DOM Selectors)
- `#tab-review`: Trang chủ ôn tập (Dashboard, nhiệm vụ FSRS hôm nay, tiến độ 7 ngày).
- `#tab-decks`: Duyệt 22 danh mục chủ đề gốc cấp cao nhất.
- `#tab-subtopics`: Danh sách các chủ đề nhánh con phân cấp.
- `#tab-subtopic-words`: Danh sách từ vựng chi tiết theo từng chặng học.
- `#tab-reels`: Giao diện lướt từ vựng dạng Reels cuộn dọc (TikTok style).
- `#tab-library`: Thư viện tra cứu từ điển toàn diện kèm bộ lọc FSRS sâu.
- `#tab-test`: Kiểm tra trình độ TOEIC (Mini Test 20 câu & Full Test 100 câu).
- `#tab-settings`: Màn hình cấu hình thông số FSRS, sao lưu & hồ sơ cá nhân.
- `#study-overlay`: Lớp phủ toàn màn hình lật thẻ Flashcard 3D và 4 nút FSRS.
- `#modals-root`: Vùng mount động các popup modal (Search, Custom Study, Streak Hub).

### 4.4. Cấu Trúc Dữ Liệu Từ Vựng Chuẩn (Word Schema)
Mỗi từ vựng trong `src/data/words/*.js` tuân thủ nghiêm ngặt cấu trúc:
```javascript
{
  "id": "wake-up",                                      // Slug ID duy nhất
  "word": "Wake up",                                    // Từ / Cụm từ tiếng Anh
  "meaning": "Thức giấc, mở mắt tỉnh dậy",               // Nghĩa tiếng Việt ngắn gọn
  "ipa": "/weɪk ʌp/",                                   // Phiên âm chuẩn IPA
  "definition": "To stop sleeping and become conscious.",// Định nghĩa tiếng Anh
  "example": "I usually wake up at 6:30 AM.",          // Câu ví dụ tiếng Anh
  "exampleVi": "Tôi thường thức giấc lúc 6:30 sáng.",  // Dịch nghĩa câu ví dụ
  "level": "A1",                                        // Cấp độ: A1, A2, B1, B2, C1
  "pos": "phrasal verb",                                // Loại từ: noun, verb, adj, v.v.
  "img": "assets/images/words/w/wake-up.webp",          // Đường dẫn ảnh WebP cục bộ
  "topicIds": ["daily-life-routines-chặng-1"],         // Mảng ID các chặng học chứa từ
  "tags": []                                            // Mảng nhãn bổ sung
}
```

### 4.5. Các Quy Tắc Kỹ Thuật Bắt Buộc (Technical Gotchas)
1. **ES Modules thuần:** Mọi lệnh `import` file cục bộ bắt buộc phải có đuôi `.js` (Ví dụ: `import { ... } from './utils.js';`).
2. **Đọc State đồng bộ (Synchronous):** Nhờ cơ chế RAM Write-Through, các hàm như `StorageManager.getCard(id)`, `StorageManager.getSettings()` là hàm đồng bộ (Sync), **không dùng `await`** khi đọc.
3. **Quy tắc đường dẫn ảnh:** Ảnh từ vựng luôn nằm theo thư mục chữ cái đầu: `assets/images/words/<ký_tự_đầu_viết_thường>/<id>.webp`.

### 4.6. Bảng Tra Cứu Nhanh: Tính Năng ➔ File Đích (Feature-to-File Matrix)

| Bạn muốn sửa / tối ưu tính năng gì? | File đích chính xác 100% | Vai trò trách nhiệm |
| :--- | :--- | :--- |
| **Lật thẻ Flashcard 3D, cử chỉ vuốt, phím tắt** | `src/js/views/study/shell.js` | Khung DOM thẻ học & sự kiện vuốt chạm |
| **Tự động lật thẻ, học rảnh tay, đếm lùi** | `src/js/views/study/autoplay.js` | Cỗ máy Autoplay, timer & lặp vô tận |
| **Tùy chọn tốc độ đọc, font, cỡ chữ thẻ** | `src/js/views/study/prefs.js` | Tùy chọn học tập & preferences |
| **Đồng hồ Pomodoro trong lúc học thẻ** | `src/js/views/study/pomodoro.js` | Bộ đếm Pomodoro 25p / 5p |
| **Bảng tổng kết sau khi hoàn thành phiên thẻ** | `src/js/views/study/summary-modal.js` | Modal chúc mừng & thống kê phiên |
| **Thuật toán FSRS-6, Stability, Difficulty** | `src/js/core/fsrs.js` | Tính toán lịch ôn tập FSRS chuẩn |
| **Hàng đợi phiên học, củng cố thẻ quên** | `src/js/core/session.js` | State Machine phiên học flashcard |
| **Lọc từ vựng, tính chặng học, sắp xếp Due-first** | `src/js/core/selectors.js` | DeckManager lọc và gom nhóm từ |
| **Chuỗi ngày học, đóng băng Streak, cứu chuỗi** | `src/js/services/storage/streak.js` | Streak State Engine & phần thưởng |
| **Sao lưu Nano FSRS, xuất/nhập JSON, GZIP** | `src/js/services/storage/backup.js` | Positional Tuples & tải file JSON |
| **IndexedDB, RAM Cache Write-Through** | `src/js/services/storage.js` | StorageManager Facade & driver |
| **Phát âm từ vựng, Web Speech, hiệu ứng âm thanh**| `src/js/services/audio.js` | AudioManager & AudioContext |
| **Màn hình Lướt Reels từ vựng dạng TikTok** | `src/js/views/reels.js` | Lướt thẻ dọc 100% CSS Tokens |
| **Màn hình Trắc nghiệm thông minh Smart Quiz** | `src/js/views/quiz.js` | Quiz 4 phương án cân bằng xác suất |
| **Màn hình Trang chủ Dashboard & nhiệm vụ FSRS** | `src/js/views/review.js` | Thẻ nhiệm vụ hôm nay & kho từ vựng |
| **Màn hình Thi thử TOEIC bấm giờ** | `src/js/views/toeic-test.js` | Mini Test & Full Test TOEIC |
| **Màn hình Thư viện từ vựng & bộ lọc FSRS** | `src/js/views/library.js` | Tra cứu từ điển & lọc chuyên sâu |
| **Màn hình Duyệt 22 chủ đề gốc & chặng học** | `src/js/views/decks.js` | Cây phân cấp chủ đề 4 tầng |
| **Màn hình Thống kê FSRS & biểu đồ dự báo** | `src/js/views/stats.js` | Biểu đồ Retention, Heatmap 7 ngày |
| **Màn hình Cài đặt & hồ sơ cá nhân** | `src/js/views/settings.js` | Cấu hình FSRS, Profile & nạp file |
| **Tìm kiếm từ vựng toàn cục (Global Search)** | `src/js/views/components/search.js` | Modal Search tra cứu nhanh |
| **Trung tâm quản lý chuỗi học & bảo vệ Streak** | `src/js/views/components/streak-hub.js` | Modal Streak Hub & Recovery |
| **Tùy chỉnh phiên học nâng cao (Custom Study)**| `src/js/views/components/custom-study.js` | Hộp thoại lọc thẻ theo yêu cầu |
| **Thiết lập mục tiêu ngày & chi tiết dự báo** | `src/js/views/modals/goal-modal.js` | Modal mục tiêu & forecast FSRS |
| **Tự động tối ưu FSRS ngầm Zero-touch** | `src/js/core/optimizer.js` | BehavioralOptimizer tự điều chỉnh |
| **Đồng hồ đếm thời gian học tập chính xác** | `src/js/core/timer.js` | StudyTimer tự pause khi đổi tab |

---

## 🛠️ 5. Lệnh Thao Tác Nhanh (Cheatsheet)

```bash
# Kiểm tra toàn bộ mã nguồn, AST, CSS & Schema
npm test                # hoặc: node test/check.js

# Kiểm tra dữ liệu từ vựng & taxonomy
npm run validate:data

# Tăng phiên bản tự động (tăng patch và đồng bộ toàn dự án)
npm run bump

# Chạy server thử nghiệm cục bộ
npm run dev             # Port 3000 (npx serve)
# hoặc: npm start       # Port 3000 (python http.server)
```
