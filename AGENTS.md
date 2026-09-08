# 🤖 AGENTS.md — System Context & Architecture Guide

Tài liệu này cung cấp toàn cảnh kiến trúc, cấu trúc tệp tin, luồng dữ liệu, thuật toán và quy chuẩn phát triển của dự án **Flashcard English Pro** nhằm giúp AI Agent hiểu nhanh codebase mà không cần quét toàn bộ mã nguồn.

---

## 📌 1. Tổng quan Dự án (Project Overview)

- **Tên dự án:** Flashcard English Pro (Spaced Repetition FSRS-6)
- **Mục tiêu:** Ứng dụng web học từ vựng tiếng Anh qua flashcard với thuật toán lặp lại ngắt quãng (FSRS-6), phát âm bản xứ kèm AI TTS fallback, phân tích thống kê tiến độ, chạy thuần Client-side 100% Offline-First.
- **Tech Stack:**
  - **Frontend:** Pure HTML5 (Semantic), Vanilla CSS3 (CSS Variables, Flexbox, Grid, 3D Transforms, Dark/Light Mode), Vanilla JavaScript (ES6+ Modules, Web Speech API, AudioContext, DocumentFragment).
  - **Client Storage:** `IndexedDB` (Database: `FlashcardProDB`) kết hợp **In-Memory Write-Through RAM Cache** và fallback `localStorage`.
  - **Không dùng framework cồng kềnh, không cần server backend** (No React, Vue, Tailwind, Node server required).

---

## 📁 2. Bản đồ Cấu trúc Tệp tin (Clean Modular Architecture)

```
simple-flashcard/
├── index.html                    # Layout SPA chính, navigation, modals, study card container
├── README.md                     # Tài liệu giới thiệu cho người dùng
├── AGENTS.md                     # Tài liệu ngữ cảnh kiến trúc cho AI Agent (Tệp này)
├── sw.js                         # PWA Service Worker (Offline Cache & Auto Update)
├── manifest.json                 # Cấu hình PWA Web App Manifest
├── jsconfig.json                 # Cấu hình JS Language Server & Path Aliases (@app, @core, @features...)
├── assets/
│   └── icons/                    # App Icons (favicon.svg, favicon.ico)
│
├── css/                          # Hệ thống CSS phân lớp (Layered Modular CSS)
│   ├── style.css                 # Master CSS import tất cả file con kèm version query (?v=2.0.0)
│   ├── variables.css             # Design Tokens (Color palette, dark/light themes, typography, spacing)
│   ├── layout.css                # Mobile-First responsive shell (App container, header, bottom nav)
│   ├── animations.css            # Hiệu ứng chuyển động (Fade, Slide, Shake, Pulse, Ripple, Flip)
│   ├── components/               # CSS cho từng UI Component độc lập
│   │   ├── flashcard.css         # 3D Flip Card, grading buttons (Again, Hard, Good, Easy), audio controls
│   │   ├── search.css            # Global Search Modal & list kết quả
│   │   ├── feedback.css          # Toast thông báo, Confirm Dialog, Study Summary Modal
│   │   └── sync-modal.css        # Modal Đồng bộ 2 Chiều Thông minh (Universal 2-Way Sync)
│   └── views/                    # CSS riêng biệt cho 5 màn hình chính
│       ├── review.css            # Màn hình Ôn tập (Quick stats, 5 cấp độ trí nhớ, Start button)
│       ├── decks.css             # Màn hình Bộ đề (Chủ đề lớn -> Con -> Chi tiết -> Danh sách từ)
│       ├── stats.css             # Màn hình Thống kê (4 cards tổng quan, 7-day chart, độ bền, dự báo)
│       ├── profile.css           # Màn hình Cá nhân (Thông tin, Thành tích, Backup/Restore JSON)
│       └── settings.css          # Màn hình Cài đặt (Target retention, daily limits, voice/accent, theme)
│
├── js/                           # Kiến trúc Clean Architecture 7 nhóm nghiệp vụ (ES6 Modules)
│   ├── app.js                    # Backward-compatibility Root Bridge
│   ├── app/                      # Tầng Khởi tạo & Điều hướng
│   │   ├── app.js                # [Main Controller] FlashcardApp bootstrap & orchestrator
│   │   └── router.js             # [Router] Quản lý chuyển tab, subpage navigation & scroll
│   ├── config/                   # Cấu hình & Hằng số hệ thống
│   │   ├── app.js                # App metadata, default settings, deck names & subtopic icons
│   │   └── fsrs.js               # Tham số FSRS-6 (19 tham số W), Rating, State & Memory Tiers
│   ├── core/                     # Lõi Nghiệp vụ & Thuật toán trung tâm
│   │   ├── learning/             # Lõi học tập Spaced Repetition
│   │   │   ├── fsrs.js           # Thuật toán FSRS-6 thuần JS
│   │   │   └── study-session.js  # State machine phiên học, queue & preloading
│   │   ├── vocabulary/           # Lõi dữ liệu từ vựng
│   │   │   ├── selectors.js      # DeckManager & truy vấn từ vựng theo chủ đề
│   │   │   └── validators.js     # Schema & word data validation bridge
│   │   └── statistics/           # Lõi tính toán thống kê
│   │       ├── stats.js          # Tính toán số liệu FSRS, tiến độ 7 ngày & dự báo
│   │       └── timer.js          # Active study time tracker & streak counter
│   ├── features/                 # Tính năng theo màn hình người dùng
│   │   ├── home/
│   │   │   └── review-view.js    # Màn hình Ôn tập & biểu đồ 5 cấp độ nhớ
│   │   ├── topics/
│   │   │   ├── decks-view.js     # Danh sách 16 bộ đề & bộ lọc
│   │   │   ├── subtopics-view.js # Danh sách chặng / chủ đề con (Level 2)
│   │   │   └── subtopic-words-view.js # Danh sách từ vựng chi tiết & phân trang (Level 4)
│   │   ├── study/
│   │   │   └── study-view.js     # Trình phát Flashcard 3D, phím tắt & cử chỉ vuốt
│   │   ├── stats/
│   │   │   └── stats-view.js     # Báo cáo thống kê 4 khu vực chuẩn
│   │   ├── profile/
│   │   │   └── profile-view.js   # Thông tin người dùng, thành tích & sao lưu
│   │   └── settings/
│   │       └── settings-view.js  # Cài đặt FSRS, âm thanh & giao diện
│   ├── services/                 # Dịch vụ hạ tầng & Lưu trữ ngoại vi
│   │   ├── storage.js            # IndexedDB + In-Memory Write-Through RAM Cache O(1)
│   │   ├── audio.js              # Dual Native Audio Engine (CDN MP3 + Neural TTS)
│   │   ├── sync.js               # Universal 2-Way Handshake & Smart Merge FSRS
│   │   └── backup.js             # JSON Export / Import & Reset dữ liệu
│   ├── shared/                   # Thành phần giao diện dùng chung
│   │   ├── search.js             # Controller tìm kiếm toàn cục (Debounce 150ms)
│   │   ├── feedback.js           # Toast alerts & Confirm dialog
│   │   ├── modal.js              # Modal popup chi tiết chặng học (Level 3)
│   │   └── sync-modal.js         # Modal quét camera QR & ghép đôi đa thiết bị
│   └── utils/                    # Tiện ích bổ trợ độc lập
│       ├── sanitize.js           # Chống XSS & làm sạch chuỗi
│       ├── format.js             # Định dạng ngày giờ, số & interval
│       ├── async.js              # Debounce, throttle & sleep
│       ├── dom.js                # Tiện ích DOM, cuộn mượt & highlight từ khóa
│       ├── index.js              # Barrel export tiện ích
│       └── helpers.js            # Backward compatibility bridge
│
└── data/                         # Cấu trúc dữ liệu chuẩn hóa (SSOT Normalized Data)
    ├── index.js                  # Central Hub & Dynamic Loaders (`loadTopicWords`, `getAllTopics`)
    ├── schemas.js                # Định nghĩa Schema & Enums (Phases, Categories, CEFR, States)
    ├── validators.js             # Hàm kiểm tra toàn vẹn dữ liệu từ vựng
    ├── topics/                   # 16 file metadata chủ đề phân cấp
    └── words/                    # 16 từ điển từ vựng chi tiết theo domain (SSOT)
```

---

## 🧠 3. Luồng Nghiệp vụ & Kiến trúc Lõi

### 3.1. Thuật toán FSRS-6 (`js/core/learning/fsrs.js`)
- **Đánh giá phản hồi (Rating):**
  - `Again (1)`: Quên hoàn toàn.
  - `Hard (2)`: Nhớ nhưng khó khăn, chật vật.
  - `Good (3)`: Nhớ đúng hạn, dễ chịu.
  - `Easy (4)`: Rất dễ, nhớ sâu sắc.
- **Trạng thái thẻ (State):**
  - `New (0)`: Thẻ mới chưa học bao giờ.
  - `Learning (1)`: Đang trong giai đoạn học ban đầu.
  - `Review (2)`: Đã vào chu kỳ lặp lại ngắt quãng định kỳ.
  - `Relearning (3)`: Đã từng nhớ nhưng bị quên (lapsed).
- **Tham số cốt lõi:**
  - `w`: 19 tham số tối ưu hóa độ bền (*Stability*) & độ khó (*Difficulty*).
  - `requestRetention`: Tỷ lệ ghi nhớ mong muốn (Mặc định `0.90` tương đương 90%).
  - `getRetrievability(card, now)`: Tính xác suất nhớ $R = (1 + \text{factor} \times \frac{t}{S})^{-\text{decay}}$.
- **5 Cấp độ Trí nhớ theo Độ bền FSRS (Stability Tiers):**
  - `Mức 1 (Mới học)`: $S < 3$ ngày (Lịch ôn 1 - 3 ngày).
  - `Mức 2 (Ngắn hạn)`: $3 \le S < 7$ ngày (Lịch ôn 3 - 7 ngày / ~1 tuần).
  - `Mức 3 (Trung hạn)`: $7 \le S < 14$ ngày (Lịch ôn 1 - 2 tuần).
  - `Mức 4 (Bền vững)`: $14 \le S < 30$ ngày (Lịch ôn 2 - 4 tuần).
  - `Mức 5 (Ghi nhớ sâu)`: $S \ge 30$ ngày (Lịch ôn $\ge 30$ ngày / trên 1 tháng - Nhiều tháng).

### 3.2. Quản lý Dữ liệu & Cache (`js/services/storage.js`)
- **Đa tầng Client Storage:**
  1. `RAM Cache` (`_cardsCache`, `_settingsCache`, `_logsCache`): Truy xuất $O(1)$, không block DOM.
  2. `IndexedDB` (`FlashcardProDB`): Lưu trữ bền vững tại trình duyệt phía client.
  3. `localStorage`: Dự phòng khi IndexedDB không khả dụng.
  4. `JSON Export / Import`: Sao lưu và phục hồi dữ liệu hoàn chỉnh qua file `.json`.

### 3.3. Âm thanh Kép (Dual Audio Engine in `js/services/audio.js`)
1. **Studio Native Audio (Priority 1):** Tải MP3 trực tiếp từ CDN từ điển chuẩn (US/UK).
2. **Preloading (0ms delay):** Tải trước các từ kế tiếp trong queue học vào Audio RAM buffer.
3. **Neural Web Speech TTS (Fallback):** Tự động phát âm bằng `speechSynthesis` nếu offline hoặc file âm thanh lỗi.

---

## 📊 4. Cấu trúc Schema Dữ liệu Chuẩn

### Thẻ FSRS (`CardState`)
```javascript
{
  id: "daily_001",              // ID duy nhất của từ vựng
  due: "2026-09-07T04:00:00Z",  // Thời điểm đến hạn ôn tập tiếp theo (ISO String)
  stability: 3.17,              // Độ bền trí nhớ (Số ngày R giảm về requestRetention)
  difficulty: 4.82,             // Độ khó của từ (Thang điểm 1 - 10)
  elapsed_days: 2,              // Số ngày kể từ lần ôn trước
  scheduled_days: 3,            // Khoảng cách ngày được lên lịch
  reps: 4,                      // Tổng số lần đã ôn tập
  lapses: 0,                    // Số lần bị quên (Again)
  state: 2,                     // 0: New, 1: Learning, 2: Review, 3: Relearning
  last_review: "2026-09-04...", // Thời điểm ôn gần nhất
  history: [ { rating: 3, review: "...", state: 1, ... } ]
}
```

### Từ vựng (`WordItem` trong `data/words/`)
```javascript
{
  id: "work_001",
  word: "Colleague",
  phonetic: "/ˈkɑːliːɡ/",
  pos: "noun",                  // part of speech (noun, verb, adj, ...)
  cefr: "B1",                   // A1, A2, B1, B2, C1, C2
  meaning: "Đồng nghiệp",
  definition: "A person with whom one works in a profession or business.",
  example: "She discussed the project with her colleagues.",
  exampleVi: "Cô ấy đã thảo luận dự án với các đồng nghiệp của mình.",
  subtopic: "workplace",
  audio: {
    us: "https://dictionary.cambridge.org/media/english/us_pron/c/col/colle/colleague.mp3",
    uk: "https://dictionary.cambridge.org/media/english/uk_pron/u/ukc/ukcol/ukcolle007.mp3"
  }
}
```

---

## 🛠️ 5. Quy ước & Hướng dẫn khi Sửa Đổi Code (Agent Guidelines)

1. **Thuần Client-side:** Giữ nguyên kiến trúc Vanilla JS ES Modules không phụ thuộc server backend.
2. **Cấu trúc imports chuẩn:** Mọi module JS đều dùng đường dẫn tương đối rõ ràng có đuôi `.js` (ví dụ `import { StorageManager } from '../services/storage.js';`).
3. **Design Tokens & Styling:** Khi thêm/sửa CSS, luôn ưu tiên sử dụng CSS Variables định nghĩa trong `css/variables.css` để đảm bảo đồng bộ hoàn hảo giữa Dark Mode và Light Mode.
4. **Lưu trữ dữ liệu:** Bất kỳ thao tác cập nhật tiến độ nào trong `study-session.js` hay `study-view.js` đều phải đi qua `StorageManager.saveCardState()` và ghi `StorageManager.logReview()` để lưu trữ đồng bộ vào RAM Cache và IndexedDB.
