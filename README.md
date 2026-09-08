# ⚡ Flashcard English Pro - Spaced Repetition (FSRS-6)

> Ứng dụng web học từ vựng tiếng Anh thông minh ứng dụng thuật toán **Lặp lại ngắt quãng (Spaced Repetition FSRS-6)** hiện đại, giao diện chuẩn **Mobile-First**, phát âm giọng bản xứ **Dual Native Audio (US/UK) Zero-Delay** và bảng phân tích tiến độ trực quan.

🔗 **Live Demo:** [https://trantien2k5.github.io/flashcard-pro/](https://trantien2k5.github.io/flashcard-pro/)

---

## 🌟 Tính Năng Nổi Bật

### 1. 🧠 Thuật toán Ghi nhớ Khoa học (FSRS-6 Engine)
- **Tính toán tối ưu**: Phân tích độ bền trí nhớ (*Stability*), độ khó của từ (*Difficulty*) và khoảng cách ôn tập tối ưu (*Interval*) cho từng từ vựng dựa trên 19 tham số $W$ của FSRS-6.
- **4 mức đánh giá phản hồi**: `Quên (Again)`, `Khó (Hard)`, `Nhớ (Good)`, `Dễ (Easy)` với thời gian dự kiến ôn tập tiếp theo hiển thị trực quan trực tiếp trên từng nút bấm.
- **Biểu đồ 5 Cấp độ Trí nhớ**: Phản ánh chính xác cấu trúc bộ nhớ thực tế của học viên (*Mức 1: Mới học*, *Mức 2: Ngắn hạn*, *Mức 3: Trung hạn*, *Mức 4: Bền vững*, *Mức 5: Ghi nhớ sâu*).

### 2. 🔊 Động cơ Âm thanh Bản xứ Kép (Dual Native Audio Engine)
- **Hai nút phát âm US / UK độc lập**: Cho phép người học chủ động luyện nghe cả giọng Anh-Mỹ (US) và Anh-Anh (UK) với hiệu ứng sóng âm nhạc sống động (*Live Equalizer Waves*).
- **Studio Native Audio Hunter**: Tự động săn nguồn MP3 chuẩn phòng thu từ các CDN từ điển quốc tế (Oxford, Cambridge, Webster, Youdao, Google Dict).
- **Tải trước tức thì (0ms Preloading Cache)**: Tự động tải trước toàn bộ âm thanh trong hàng đợi phiên học vào Audio RAM buffer, bấm là phát ngay lập tức.
- **Kích hoạt phát âm khi lật thẻ**: Tự động phát âm chuẩn xác ngay khi người học lật mở mặt sau của thẻ học.
- **Dự phòng thông minh (Offline Neural TTS)**: Tự động chuyển đổi mượt mà sang giọng đọc AI (*Web Speech API*) khi ngoại tuyến hoặc mất kết nối mạng.

### 3. 📚 Kho 17 Chủ đề & 2.700+ Từ Vựng Chuẩn Hóa
- **17 Chủ đề toàn diện**: Đời sống, Con người, Cảm xúc, Ẩm thực, Nhà cửa, Sức khỏe, Mua sắm, Giao thông, Công việc, Giáo dục, Du lịch, Giải trí, Công nghệ, Thiên nhiên, Xã hội, **Tài chính & Ngân hàng** và **TOEIC B1**.
- **175 Lộ trình con chia nhỏ (10-20 từ/bài)**: Mỗi chủ đề được phân tách thành các bài học vừa vặn, khoa học và dễ tiếp thu.
- **Cơ chế Khóa tiến độ (Progressive Mastery Locking)**: Học viên hoàn thành và nắm vững bài học trước để mở khóa chặng tiếp theo.
- **Bộ lọc & Phân trang thông minh**: Lọc nhanh theo trạng thái (*Tất cả*, *Mới*, *Đang học*, *Cần ôn*, *Đã thuộc*), tìm kiếm tức thì và phân trang mượt mà.

### 4. 📈 Bảng Thống Kê Tiến Độ Tinh Gọn (4 Phần Chuẩn Mực)
- **Tổng quan**: Nắm bắt ngay *Số từ đã học*, *Số từ đang nhớ tốt* và *Tỷ lệ ghi nhớ (%)* trong 3 giây.
- **Tiến bộ 7 ngày**: Biểu đồ đo lường số lượng từ vựng ghi nhớ thành công tích lũy theo từng ngày.
- **Độ bền trí nhớ**: Thống kê 4 chặng đường ghi nhớ (`Mới học` $\rightarrow$ `Đang củng cố` $\rightarrow$ `Nhớ trung hạn` $\rightarrow$ `Nhớ dài hạn`).
- **Dự báo ôn tập**: Xem trước khối lượng từ tới hạn cần ôn tập trong 7 ngày kế tiếp.

### 5. ⚡ Đồng Bộ Thông Minh 2 Chiều 1 Chạm (Universal 2-Way Smart Sync)
- **Không cần chọn Gửi/Nhận**: 1 máy mở mã QR — 1 máy quét mã QR là cả 2 thiết bị tự động bắt tay và trao đổi dữ liệu 2 chiều.
- **Smart Merge FSRS**: Tự động so sánh mốc thời gian học, gộp bài học mới nhất của từng từ vựng và cập nhật đồng thời lên cả 2 máy trong $\le 1.5$s.
- **Tương thích đa nền tảng**: Hỗ trợ quét bằng Camera tích hợp trong ứng dụng hoặc mở bằng Camera mặc định trên iPhone/Android/Zalo.

### 6. 🎨 Giao diện Người dùng Cao Cấp (Modern UI/UX)
- **Chế độ Giao diện**: Hỗ trợ đầy đủ **Dark Mode (Tối)** sang trọng và **Light Mode (Sáng)** thanh lịch.
- **Thanh tiến độ thiết kế mới**: Deep-track gradient, ánh sáng bóng loáng (*Specular highlight*) và hiệu ứng sóng óng ánh (*Shimmering wave*).
- **Tự động nhận diện thiết bị thông minh**: Hiển thị gợi ý lật thẻ linh hoạt (*Mobile: 👆 Chạm để xem nghĩa*, *Desktop: 🖱️ Click hoặc phím Space để xem nghĩa*).
- **Thẻ Flashcard 3D**: Lật thẻ mượt mà với hiệu ứng 3D transform sống động, hỗ trợ phím tắt số 1-4 và phím Space.
- **Tìm kiếm toàn cục (Global Search)**: Tìm nhanh bất kỳ từ vựng, phiên âm hoặc định nghĩa với cơ chế *Debounce 150ms*.
- **Quản trị dữ liệu an toàn**: Sao lưu (Export JSON), Khôi phục (Import JSON) và Đặt lại tiến độ học tập.

---

## 📁 Cấu Trúc Mã Nguồn (Clean Architecture)

Dự án được xây dựng theo kiến trúc **Clean Modular Architecture** phân lớp trực quan, chia theo domain nghiệp vụ và hoàn toàn thuần Vanilla JS ES Modules:

```
simple-flashcard/
├── index.html                    # Single-Page Application Layout chính
├── README.md                     # Tài liệu giới thiệu dự án
├── AGENTS.md                     # Tài liệu ngữ cảnh kiến trúc cho AI Agent
├── sw.js                         # PWA Service Worker (Offline Cache & Auto Update)
├── manifest.json                 # Cấu hình PWA Web App Manifest
├── jsconfig.json                 # Cấu hình JS Language Server & Path Aliases (@app, @core, @features...)
├── assets/
│   └── icons/                    # App Icons & Favicons (favicon.svg, favicon.ico)
│
├── css/                          # Hệ thống Styling phân tầng (Layered CSS)
│   ├── variables.css             # Design Tokens (Màu sắc, Font, Spacing, Theme)
│   ├── layout.css                # Khung Mobile-First, Header & Bottom Nav
│   ├── animations.css            # Hiệu ứng chuyển động & Micro-interactions
│   ├── style.css                 # Master Stylesheet (quản lý @import có cache-busting)
│   ├── components/               # CSS cho từng component độc lập
│   │   ├── flashcard.css         # Thẻ Flashcard 3D, Dual US/UK Audio & Progress Bar
│   │   ├── search.css            # Modal tìm kiếm từ vựng toàn cục
│   │   ├── feedback.css          # Toast thông báo & Modal tổng kết phiên
│   │   └── sync-modal.css        # Modal đồng bộ 2 chiều thông minh
│   └── views/                    # CSS riêng biệt cho từng màn hình
│       ├── review.css            # Màn hình Ôn tập & biểu đồ 5 cấp độ nhớ
│       ├── decks.css             # Danh sách bộ đề, chủ đề con & danh sách từ
│       ├── stats.css             # Màn hình Thống kê tiến độ & biểu đồ 7 ngày
│       ├── profile.css           # Màn hình Cá nhân & xuất/nhập sao lưu
│       └── settings.css          # Màn hình Cài đặt & cấu hình FSRS
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
│   │   ├── learning/             # Lõi học tập Spaced Repetition (FSRS-6 & Study Session)
│   │   ├── vocabulary/           # Lõi dữ liệu từ vựng (DeckManager & Selectors)
│   │   └── statistics/           # Lõi tính toán thống kê (StatsManager & Study Timer)
│   ├── features/                 # Tính năng theo màn hình người dùng
│   │   ├── home/                 # Màn hình Ôn tập (review-view.js)
│   │   ├── topics/               # Màn hình Bộ đề, chặng con & danh sách từ (decks-view.js, subtopics-view.js...)
│   │   ├── study/                # Trình phát Flashcard 3D & controls (study-view.js)
│   │   ├── stats/                # Báo cáo thống kê tiến độ FSRS (stats-view.js)
│   │   ├── profile/              # Màn hình Cá nhân & sao lưu (profile-view.js)
│   │   └── settings/             # Cài đặt FSRS, âm thanh & giao diện (settings-view.js)
│   ├── services/                 # Dịch vụ hạ tầng & Lưu trữ ngoại vi
│   │   ├── storage.js            # IndexedDB + In-Memory RAM Cache O(1) + LocalStorage
│   │   ├── audio.js              # Dual Native Audio Engine (CDN MP3 + Neural TTS)
│   │   ├── sync.js               # Universal 2-Way Handshake & Smart Merge FSRS
│   │   └── backup.js             # JSON Export / Import & Reset dữ liệu
│   ├── shared/                   # Thành phần giao diện dùng chung (search, feedback, modal, sync-modal)
│   └── utils/                    # Tiện ích độc lập (sanitize, format, async, dom)
│
└── data/                         # Cấu trúc dữ liệu chuẩn hóa (SSOT Normalized Data)
    ├── index.js                  # Central Hub & Dynamic Loaders (`loadTopicWords`, `getAllTopics`)
    ├── schemas.js                # Định nghĩa Schema & Enums (Phases, Categories, CEFR, States)
    ├── validators.js             # Hàm kiểm tra toàn vẹn dữ liệu từ vựng
    ├── topics/                   # 16 file metadata chủ đề phân cấp
    └── words/                    # 16 từ điển từ vựng chi tiết theo domain (SSOT)
```

---

## 🚀 Hướng Dẫn Sử Dụng (Getting Started)

Dự án là ứng dụng Web thuần Client-side (Pure Standalone SPA), **hoạt động 100% Offline-First** ngay trên trình duyệt mà không cần cài đặt bất kỳ server backend nào:

- **Mở trực tiếp trên Trình duyệt:** Mở `index.html` bằng bất kỳ trình duyệt hiện đại nào (Chrome, Edge, Safari, Firefox) hoặc thông qua **Live Server / Web Server** cục bộ.
- **Lưu trữ dữ liệu:** Tự động lưu trữ ngoại tuyến vào **IndexedDB** (`FlashcardProDB`) kết hợp **In-Memory RAM Cache** và fallback **LocalStorage**, kèm tính năng Xuất/Nhập file `.json` sao lưu trong tab **Cá nhân**.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **HTML5**: Cấu trúc ngữ nghĩa Semantic, Accessibility (ARIA).
- **Vanilla CSS3**: CSS Variables, CSS Grid, Flexbox, 3D Transforms, Glassmorphism, Theme toggling.
- **Vanilla JavaScript (ES6+)**: ES Modules, Async/Await, Web Speech API, AudioContext, DocumentFragment DOM optimization.
- **Client Storage**: `IndexedDB` (`FlashcardProDB`) kết hợp kiến trúc **Write-Through In-Memory RAM Cache** đạt tốc độ truy xuất $O(1)$, fallback `localStorage`.
- **FSRS-6 Algorithm**: Thuật toán lặp lại ngắt quãng hiện đại nhất với 19 tham số tối ưu hóa khoảng cách thời gian ghi nhớ khoa học.

---

## 📄 Bản Quyền & Tác Giả

- Phát triển bởi **Trần Tiến**
- GitHub: [@trantien2k5](https://github.com/trantien2k5)
- Giấy phép: MIT License
- Website: [https://trantien2k5.github.io/flashcard-pro/](https://trantien2k5.github.io/flashcard-pro/)
