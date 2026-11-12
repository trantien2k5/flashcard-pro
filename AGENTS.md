# 🤖 AGENTS.md — System Context & Development Directives

> **Tài liệu SSOT (Single Source of Truth)** dành cho AI Agent khi làm việc với dự án **Flashcard English Pro**.
> Kiến trúc: **Vanilla ES6+ Modules, Offline-First PWA, FSRS-6 Spaced Repetition** (Phiên bản hiện hành: xem [`package.json`](./package.json)).
> **Tài liệu liên quan**: [`docs/CODE_MAP.md`](./docs/CODE_MAP.md) (Bản đồ định vị hàm & số dòng), [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) (Kiến trúc, ADR & Quy chuẩn code), [`docs/PROGRESS.md`](./docs/PROGRESS.md) (Tiến độ & Backlog).

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
5. **Quy tắc khảo sát tinh gọn & Tối ưu tốc độ (Lightweight Exploration)**:
   - Khi người dùng yêu cầu *"đọc sơ qua"*, *"tìm hiểu"*, *"khảo sát"*, *"xem qua"* hoặc hỏi đáp chung: Chỉ đọc nhanh các file tài liệu tóm tắt (`docs/ARCHITECTURE.md`, `docs/PROGRESS.md`).
   - **Tuyệt đối KHÔNG** tự ý chạy `npm test`, quét AST 70 file, hoặc chạy các lệnh quét index nặng (`git status` trên toàn bộ repo lớn) gây nghẽn và làm chậm phản hồi trên môi trường Termux / Mobile. Phải ưu tiên phản hồi nhanh, trực diện, không để người dùng chờ đợi.
6. **Điều kiện kích hoạt kiểm thử tự động (Testing Trigger Gate)**:
   - Chỉ chạy `node test/check.js` hoặc `npm test` **SAU KHI ĐÃ SỬA ĐỔI CODE** hoặc khi người dùng **yêu cầu rõ ràng** (*"chạy test"*, *"kiểm tra lỗi"*). Tuyệt đối không tự ý chạy trong các tác vụ chỉ đọc/khảo sát.
7. **Quy tắc đọc tập trung & Chống lãng phí I/O (Targeted Reading Only)**:
   - **Tuyệt đối không đọc full code, không đọc file dạo khi không cần thiết**: Chỉ đọc chính xác phạm vi dòng (line range) hoặc tệp đích trực tiếp liên quan đến vấn đề. Không mở đọc tràn lan các file ngoài lề gây chậm trễ và nghẽn tài nguyên trên thiết bị.
8. **Phân cấp độ kỹ lưỡng theo mức độ rủi ro (Risk-Based Rigor)**:
   - Các tác vụ nhẹ hoặc cục bộ (chỉnh sửa giao diện nhỏ, sửa text, fix lỗi đơn lẻ): Giải quyết dứt điểm, nhanh gọn.
   - **Chỉ khi gặp vấn đề lớn hoặc rủi ro gây bug cao** (thay đổi cấu trúc FSRS State, IndexedDB migration, logic dữ liệu cốt lõi, breaking change liên module) mới cần đào sâu, khảo sát kỹ lưỡng và kiểm chứng đa tầng.
9. **Chủ động đề xuất giải pháp tối ưu lâu dài (Long-Term Scalability)**:
   - Khi nhận thấy dự án hoặc module có dấu hiệu phình to (>300–500 dòng), cấu trúc trở nên rắc rối, lặp code hoặc tăng độ phức tạp bất thường: Phải luôn chủ động đề xuất giải pháp tối ưu/bóc tách bền vững về lâu dài cho dự án, ngăn chặn tích tụ nợ kỹ thuật (technical debt).
10. **Quy tắc tự động nâng phiên bản & Đẩy mã nguồn (Auto Bump & Push)**:
   - Khi hoàn thành một nhiệm vụ và kiểm thử đạt 100% hoàn hảo, **tự động thực hiện toàn trình mà không cần dừng lại hỏi người dùng**:
     1. Chạy `npm run bump` để nâng patch version và đồng bộ 4 file SSOT.
     2. Tạo Git commit chuẩn Conventional Commits (`feat(scope): ...`, `fix(scope): ...`).
     3. Đẩy trực tiếp lên nhánh `main`: `git push origin main`.
     4. Báo cáo ngắn gọn mã commit và phiên bản mới.

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

*(Chi tiết từng tệp JS, hàm và số dòng xem tại [`docs/CODE_MAP.md`](./docs/CODE_MAP.md) hoặc chạy `npm run locate <tên>`)*

```
flashcard-pro/
├── index.html, sw.js, manifest.json   # Entry SPA, Service Worker PWA & Manifest
├── package.json, jsconfig.json        # Scripts (test/bump/map) & Path Aliases
├── AGENTS.md                          # Quy tắc & ngữ cảnh AI Agent (Tệp này)
│
├── docs/                              # Tài liệu hệ thống (3 file SSOT)
│   ├── ARCHITECTURE.md                # Kiến trúc 4 tầng, ADR-001..006 & Coding Standards
│   ├── PROGRESS.md                    # Trạng thái, lịch sử mốc & Backlog
│   └── CODE_MAP.md                    # Bản đồ định vị hàm & dòng code (auto-generated)
│
├── assets/                            # App Icons PWA & 2.582+ ảnh WebP cục bộ (a-z)
│
├── src/
│   ├── js/                            # Tầng Logic ES6+
│   │   ├── app.js, app/, config.js, utils.js
│   │   ├── core/                      # fsrs, session, selectors/, stats/, timer, optimizer
│   │   ├── services/                  # storage/, audio
│   │   └── views/                     # study/, decks/, library/, review/, stats/, quiz/, reels/, settings/, toeic/, components/, modals/
│   │
│   ├── css/                           # Stylesheet 4 tầng (23 module)
│   │   ├── style.css, main.css, components.css   # Master & Barrel Facades
│   │   ├── base/                      # tokens.css, reset.css, animations.css
│   │   ├── layout/                    # shell.css, responsive.css
│   │   ├── components/                # modals, toast, search, optimizer, streak, custom-study
│   │   └── views/                     # flashcard, review, decks, stats, library, settings, quiz, reels, toeic-test
│   │
│   └── data/                          # 4.157 từ vựng (words/), 569 chủ đề (topics/), toeic-tests, schemas, validators
│
├── scripts/                           # bump.js (SSOT version), locate.js (code map), optimize_images.js
└── test/                              # check.js (+ checks/), test_fsrs_sync.js, test_quiz_balance.js, test_selectors_backup.js, refactor_guide.js
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
| **5 Modal phân tích chỉ số Trang chủ (Due, Time)**| `src/js/views/review/stat-modals.js` | Popup xem chi tiết chỉ số Dashboard |
| **Màn hình Thi thử TOEIC bấm giờ** | `src/js/views/toeic-test.js` | Mini Test & Full Test TOEIC |
| **Màn hình Thư viện từ vựng & bộ lọc FSRS** | `src/js/views/library.js` | Tra cứu từ điển & lọc chuyên sâu |
| **Modal chi tiết từ vựng & FSRS state inspector** | `src/js/views/library/detail-modal.js` | Xem chi tiết từ, S, D, lịch FSRS |
| **Màn hình Duyệt 22 chủ đề gốc Cấp 1** | `src/js/views/decks.js` | Cây phân cấp chủ đề gốc Cấp 1 |
| **Duyệt chủ đề con Cấp 2 và Cấp 3** | `src/js/views/decks/subtopics.js` | Chi tiết danh mục con & chặng học |
| **Danh sách từ vựng & chi tiết từ Cấp 4** | `src/js/views/decks/words.js` | Danh sách từ theo chủ đề con |
| **Màn hình Thống kê FSRS & biểu đồ dự báo** | `src/js/views/stats.js` | Biểu đồ Retention, tổng quan chỉ số |
| **Lịch học tập Calendar Heatmap & nhật ký ôn** | `src/js/views/stats/journal.js` | Nhật ký ôn tập & lịch chi tiết |
| **Modal xem trước dự báo số lượng từ ôn tập** | `src/js/views/stats/forecast-modal.js` | Dự báo tải ôn tập theo từng ngày |
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
