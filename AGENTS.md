# 🤖 AGENTS.md — System Context & Lean Architecture Guide

Tài liệu này cung cấp toàn cảnh kiến trúc, cấu trúc tệp tin tinh gọn, luồng dữ liệu, thuật toán và quy chuẩn phát triển của dự án **Flashcard English Pro** nhằm giúp AI Agent hiểu nhanh codebase mà không cần quét toàn bộ mã nguồn.

---

## 📌 1. Tổng quan Dự án (Project Overview)

- **Tên dự án:** Flashcard English Pro (Spaced Repetition FSRS-6)
- **Mục tiêu:** Ứng dụng web học từ vựng tiếng Anh qua flashcard với thuật toán lặp lại ngắt quãng (FSRS-6), phát âm bản xứ kèm AI TTS fallback, phân tích thống kê tiến độ, chạy thuần Client-side 100% Offline-First.
- **Tech Stack:**
  - **Frontend:** Pure HTML5 (Semantic), Vanilla CSS3 (CSS Variables, Flexbox, Grid, 3D Transforms, Dark/Light Mode), Vanilla JavaScript (ES6+ Native Modules, Web Speech API, AudioContext, DocumentFragment).
  - **Client Storage:** `IndexedDB` (Database: `FlashcardProDB`) kết hợp **In-Memory Write-Through RAM Cache** và fallback `localStorage`.
  - **Kiến trúc Tinh gọn (Lean Modular Architecture):** Không dùng framework cồng kềnh, không micro-files/wrapper rườm rà, tải trang tức thì.

---

## 📁 2. Bản đồ Cấu trúc Tệp tin (Lean Modular Architecture)

```
simple-flashcard/
├── index.html                    # Layout SPA chính, navigation, modals, study card container
├── README.md                     # Tài liệu giới thiệu cho người dùng
├── AGENTS.md                     # Tài liệu ngữ cảnh kiến trúc cho AI Agent (Tệp này)
├── sw.js                         # PWA Service Worker (Offline Cache & Auto Update)
├── manifest.json                 # Cấu hình PWA Web App Manifest
├── jsconfig.json                 # Cấu hình JS Language Server & Path Aliases (@core, @views, @services...)
├── assets/
│   ├── icons/                    # App Icons (favicon.svg, favicon.ico, icon-192, icon-512)
│   └── images/
│       └── words/                # 2.552 hình ảnh WebP từ vựng cục bộ (100% Offline)
│
├── css/                          # Hệ thống CSS module hóa gọn gàng
│   ├── style.css                 # Master CSS nạp toàn bộ bundle stylesheets
│   ├── main.css                  # Design Tokens, Base Reset, Layout Shell & Animations
│   ├── flashcard.css             # 3D Flip Card, rating buttons (Again, Hard, Good, Easy), audio controls
│   ├── components.css            # Global Search Modal, Feedback Toast, Confirm Dialog, Study Summary, Sync Modal
│   └── views/                    # CSS giao diện các màn hình (1-1 với js/views/)
│       ├── review.css            # Giao diện Trang chủ Ôn tập: Nhiệm vụ hôm nay, Kho từ vựng & Tiếp tục học
│       ├── decks.css             # Giao diện duyệt Chủ đề 4 cấp & Danh sách từ vựng
│       ├── stats.css             # Giao diện Báo cáo thống kê FSRS-6 chuyên sâu & Biểu đồ 7 ngày
│       └── settings.css          # Giao diện Cài đặt hệ thống & Hồ sơ cá nhân (Profile)
│
├── js/                           # Kiến trúc JavaScript tinh gọn (~10 files, Clean Modules)
│   ├── app.js                    # [Main Controller] Bootstrap, Tab Switching Router & Event Orchestrator
│   ├── config.js                 # App config, Storage Keys, FSRS constants & Topic metadata
│   ├── utils.js                  # Tiện ích dùng chung (DOM, async, formatting, sanitization, debounce)
│   ├── core/                     # Lõi Nghiệp vụ & Thuật toán trung tâm
│   │   ├── fsrs.js               # Thuật toán FSRS-6 thuần JS (19 tham số W, Stability, Difficulty)
│   │   ├── session.js            # State machine phiên học, queue FSRS & preloading âm thanh
│   │   ├── stats.js              # Tính toán số liệu FSRS, tiến độ 7 ngày, dự báo & StudyTimeTracker
│   │   └── selectors.js          # DeckManager & truy vấn từ vựng theo chủ đề O(1)
│   ├── services/                 # Dịch vụ hạ tầng & Lưu trữ ngoại vi
│   │   ├── storage.js            # IndexedDB + In-Memory Write-Through RAM Cache & BackupService
│   │   ├── audio.js              # Dual Native Audio Engine (CDN MP3 + Neural TTS)
│   │   └── sync.js               # Universal 2-Way Handshake & Smart Merge FSRS
│   └── views/                    # Giao diện các màn hình chức năng
│       ├── review.js             # Màn hình Trang chủ Ôn tập: Nhiệm vụ ngày, Kho từ vựng & Tiếp tục học gần đây
│       ├── decks.js              # Duyệt 4 cấp độ chủ đề (Chủ đề lớn -> Chặng -> Chi tiết -> Danh sách từ)
│       ├── study.js              # Trình phát Flashcard 3D, phím tắt & cử chỉ vuốt
│       ├── stats.js              # Báo cáo thống kê FSRS-6 4 khu vực chuẩn chuyên sâu
│       ├── settings.js           # Cài đặt FSRS, âm thanh, giao diện & Hồ sơ cá nhân (Profile)
│       └── components.js         # Spotlight Search Modal, Toast alerts, Confirm Dialog & Sync Modal
│
└── data/                         # Cấu trúc dữ liệu chuẩn hóa (SSOT Normalized Data)
    ├── index.js                  # Central Hub & Dynamic Loaders (`loadTopicWords`, `getAllTopics`)
    ├── schemas.js                # Định nghĩa Schema & Enums (Phases, Categories, CEFR, States)
    ├── validators.js             # Hàm kiểm tra toàn vẹn dữ liệu từ vựng
    ├── topics.js                 # Danh mục 16 chủ đề phân cấp
    └── words.js                  # Từ điển từ vựng chi tiết theo domain (SSOT)
```

---

## 🧠 3. Luồng Nghiệp vụ & Kiến trúc Lõi

### 3.1. Thuật toán FSRS-6 (`js/core/fsrs.js`)
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

## 🛠️ 4. Quy ước & Hướng dẫn khi Sửa Đổi Code (Agent Guidelines)

1. **Thuần Client-side & Tinh gọn:** Giữ cấu trúc Native ES Modules rõ ràng, không tạo thêm các tầng trung gian hoặc micro-file không cần thiết.
2. **Cấu trúc imports chuẩn:** Mọi module JS đều dùng đường dẫn tương đối rõ ràng có đuôi `.js` (ví dụ `import { StorageManager } from '../services/storage.js';`).
3. **Design Tokens & Styling:** Khi sửa CSS, luôn ưu tiên sử dụng CSS Variables định nghĩa trong `css/main.css` để đảm bảo đồng bộ hoàn hảo giữa Dark Mode và Light Mode.
4. **Lưu trữ dữ liệu:** Bất kỳ thao tác cập nhật tiến độ nào trong `session.js` hay `study.js` đều phải đi qua `StorageManager.saveCardState()` và ghi `StorageManager.logReview()`.
