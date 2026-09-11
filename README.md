# ⚡ Flashcard English Pro — Spaced Repetition (FSRS-6)

<p align="center">
  <img src="assets/icons/icon.svg" width="96" height="96" alt="Flashcard English Pro Logo" />
</p>

<p align="center">
  <strong>Ứng dụng web học 2.552 từ vựng tiếng Anh theo phương pháp Lặp lại ngắt quãng khoa học (FSRS-6).</strong><br>
  <em>100% Client-side • Offline-First • Âm thanh bản xứ US/UK • Trực quan hóa tiến độ thông minh • PWA Ready.</em>
</p>

<p align="center">
  <a href="https://trantien2k5.github.io/flashcard-pro/"><img src="https://img.shields.io/badge/Live_Demo-trantien2k5.github.io-6366f1?style=for-the-badge&logo=githubpages&logoColor=white" alt="Live Demo"></a>
  <img src="https://img.shields.io/badge/Algorithm-FSRS--6_(19_Params)-10b981?style=for-the-badge" alt="Algorithm">
  <img src="https://img.shields.io/badge/Vocabulary-2%2C552_Words-f59e0b?style=for-the-badge" alt="Vocabulary">
  <img src="https://img.shields.io/badge/Storage-IndexedDB_%2B_RAM_Cache-06b6d4?style=for-the-badge" alt="Storage">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License">
</p>

---

## 📖 Mục Lục

1. [Tổng Quan Dự Án](#-tổng-quan-dự-án)
2. [Tính Năng Nổi Bật](#-tính-năng-nổi-bật)
3. [Thuật Toán FSRS-6 & Lõi Khoa Học](#-thuật-toán-fsrs-6--lõi-khoa-học)
4. [Kiến Trúc Tinh Gọn (Lean Architecture)](#-kiến-trúc-tinh-gọn-lean-architecture)
5. [Bản Đồ Cấu Trúc Mã Nguồn](#-bản-đồ-cấu-trúc-mã-nguồn)
6. [Hướng Dẫn Cài Đặt & Chạy Ứng Dụng](#-hướng-dẫn-cài-đặt--chạy-ứng-dụng)
7. [Bảo Mật & Quản Lý Dữ Liệu](#-bảo-mật--quản-lý-dữ-liệu)
8. [Tác Giả & Giấy Phép](#-tác-giả--giấy-phép)

---

## 🌟 Tổng Quan Dự Án

**Flashcard English Pro** là ứng dụng học từ vựng tiếng Anh chuyên sâu được thiết kế theo triết lý **Lean Modular Architecture** (Kiến trúc mô-đun tinh gọn thuần Native JavaScript, không framework cồng kềnh, không phụ thuộc thư viện bên ngoài).

Ứng dụng ứng dụng thuật toán **Free Spaced Repetition Scheduler v6 (FSRS-6)** tiên tiến nhất hiện nay, giúp tối ưu hóa thời gian ghi nhớ dài hạn, tự động lên lịch ôn tập thông minh dựa trên độ bền trí nhớ (*Stability*) và độ khó thực tế của từng từ vựng.

---

## 🚀 Tính Năng Nổi Bật

### 1. 🧠 Lõi Lặp Lại Ngắt Quãng FSRS-6 (Spaced Repetition Engine)
- **Tính toán chính xác theo 19 tham số $W$**: Tự động dự đoán xác suất nhớ $R = (1 + \text{factor} \times \frac{t}{S})^{-\text{decay}}$ cho từng từ vựng.
- **4 mức phản hồi chuẩn mực**:
  - `Again (1)`: Quên hoàn toàn — Đưa thẻ về trạng thái học lại (*Relearning*).
  - `Hard (2)`: Nhớ nhưng chật vật — Thu hẹp khoảng cách ôn tập tiếp theo.
  - `Good (3)`: Nhớ chuẩn hạn — Tăng dần khoảng cách ôn tập theo hệ số ổn định.
  - `Easy (4)`: Ghi nhớ sâu sắc — Nhảy vọt chu kỳ ôn tập dài hạn.
- **5 Cấp độ Trí nhớ (Stability Tiers)**: Phân tầng trí nhớ rõ ràng: *Mức 1: Mới học ($<3$ ngày)* $\rightarrow$ *Mức 2: Ngắn hạn ($3-7$ ngày)* $\rightarrow$ *Mức 3: Trung hạn ($7-14$ ngày)* $\rightarrow$ *Mức 4: Bền vững ($14-30$ ngày)* $\rightarrow$ *Mức 5: Ghi nhớ sâu ($\ge 30$ ngày)*.

### 2. 🔊 Động Cơ Âm Thanh Bản Xứ Kép (Dual Native Audio Engine)
- **Phát âm chuẩn Studio US / UK**: Tích hợp 2 nút nghe độc lập cho giọng Anh - Mỹ và Anh - Anh.
- **Preloading Buffer 0ms**: Tải trước âm thanh của các từ tiếp theo trong hàng đợi vào RAM Audio Context, bấm là phát tức thì không trễ.
- **Dự phòng thông minh (Neural Web Speech Fallback)**: Tự động chuyển đổi sang giọng đọc AI tổng hợp khi thiết bị ngoại tuyến hoặc mất kết nối CDN.

### 3. 🖼️ Hình Ảnh Minh Họa 100% Cục Bộ (Local WebP Assets)
- **2.552 hình ảnh WebP chuẩn hóa**: Lưu trữ trực tiếp tại `assets/images/words/`, tải trang tức thì, hoạt động 100% ngoại tuyến không phụ thuộc mạng.
- **Khớp mã định danh 1-1**: Mỗi từ vựng được ánh xạ trực tiếp theo `slugId` chuẩn hóa, loại bỏ hoàn toàn lỗi hình ảnh hoặc sai lệch dữ liệu.

### 4. 📚 16 Chủ Đề Lớn & 382 Bài Học Phân Tầng
- **Kho tri thức đa lĩnh vực**: Đời sống, Con người, Cảm xúc, Ẩm thực, Sức khỏe, Du lịch, Công nghệ, **Tài chính & Ngân hàng**, **Kinh doanh & Thương mại**, **Học thuật & TOEIC**...
- **Cây danh mục 4 cấp độ**: `Chủ đề lớn (Domain)` $\rightarrow$ `Chặng học (Stage)` $\rightarrow$ `Chủ đề chi tiết (Topic)` $\rightarrow$ `Thẻ từ vựng (Flashcard)`.
- **Bộ lọc & Điều hướng tức thì**: Lọc theo cấp độ CEFR (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`), tìm kiếm thời gian thực và phân trang thông minh.

### 5. 📅 Nhật Ký Học Tập & Biểu Đồ Hoạt Động (Calendar Heatmap)
- **Activity Heatmap 7 cột (T2 $\rightarrow$ CN)**: Trực quan hóa số lượng từ tích lũy mỗi ngày theo 5 mức nhiệt độ màu sắc chuẩn mực.
- **Floating Day Popover**: Chạm hoặc rê chuột vào ô ngày bất kỳ để xem nhanh bảng thông tin tích lũy, số lượt ôn và thời gian tập trung.
- **4 Hộp Chỉ số Hiệu suất**: Theo dõi *Từ đã học*, *Tỷ lệ chuyên cần*, *Chuỗi ngày học liên tục (Streak)* và *Thời gian tập trung*.
- **Ma trận 12 tháng theo năm**: Xem toàn cảnh tiến trình tích lũy từ vựng trong suốt cả năm.

### 6. 🔍 Spotlight Global Search (`Ctrl + K`)
- **Tìm kiếm toàn cục siêu tốc**: Tìm tức thì theo từ vựng, phiên âm IPA, nghĩa tiếng Việt, câu ví dụ hoặc chủ đề.
- **Bộ lọc nhanh bằng Chip**: Lọc theo từ mới (*New*), đang học (*Learning*), cần ôn (*Due*), đã thuộc (*Mastered*).
- **Hỗ trợ phím tắt**: Điều hướng bằng phím mũi tên `↑` `↓` và `Enter` để mở ngay thẻ học.

### 7. 🔄 Đồng Bộ 2 Chiều Thông Minh Qua QR (Universal 2-Way Smart Merge)
- **Giao thức Handshake không máy chủ**: Quét mã QR giữa 2 thiết bị bất kỳ để tự động trao đổi và gộp dữ liệu FSRS mới nhất trong $<1.5$s.
- **Bảo toàn dữ liệu**: Tự động so sánh mốc thời gian học (*timestamp*) của từng thẻ để giữ lại tiến độ cao nhất.

---

## 📁 Bản Đồ Cấu Trúc Mã Nguồn

```
simple-flashcard/
├── index.html                    # Layout SPA chính, Navigation, Container & Modals
├── README.md                     # Tài liệu hướng dẫn & Giới thiệu dự án (Tệp này)
├── AGENTS.md                     # Tài liệu ngữ cảnh kiến trúc cho AI Agent
├── sw.js                         # PWA Service Worker (Cache-First + Network Fallback)
├── manifest.json                 # Cấu hình PWA Web App Manifest
├── jsconfig.json                 # Cấu hình JS Language Server & Path Aliases
│
├── assets/
│   ├── icons/                    # App Icons & Favicons (favicon.svg, icon-192, icon-512)
│   └── images/
│       └── words/                # 2.552 hình ảnh từ vựng WebP cục bộ (100% Offline)
│
├── css/                          # Hệ thống Styling mô-đun hóa (Vanilla CSS3)
│   ├── style.css                 # Master CSS nạp toàn bộ bundle stylesheets
│   ├── main.css                  # Design Tokens, CSS Variables, Reset & Layout Shell
│   ├── flashcard.css             # 3D Flip Card, Rating Buttons, Audio Waves & Progress
│   ├── components.css            # Spotlight Search, Feedback Toast, Dialogs, Sync Modal
│   └── views/                    # CSS giao diện các màn hình chức năng
│       ├── review.css            # Màn hình Trang chủ: Nhiệm vụ hôm nay, Lịch 7 ngày, Tiến bộ
│       ├── decks.css             # Màn hình Duyệt 4 cấp chủ đề & Danh sách từ
│       ├── stats.css             # Màn hình Nhật ký học tập & Activity Heatmap
│       └── settings.css          # Màn hình Cài đặt hệ thống & Hồ sơ cá nhân
│
├── js/                           # Kiến trúc JavaScript tinh gọn (~10 files, ES6 Modules)
│   ├── app.js                    # [Main Controller] Bootstrap, Tab Router & Event Orchestrator
│   ├── config.js                 # App Config, Storage Keys, FSRS Constants & Metadata
│   ├── utils.js                  # Tiện ích DOM, async, format, sanitize, debounce
│   ├── core/                     # Lõi Nghiệp vụ & Thuật toán trung tâm
│   │   ├── fsrs.js               # Thuật toán FSRS-6 thuần JS (19 tham số W, Stability, Difficulty)
│   │   ├── session.js            # State Machine phiên học, FSRS Queue & Audio Preload
│   │   ├── stats.js              # Tính toán số liệu FSRS, Heatmap, Streak & StudyTimeTracker
│   │   └── selectors.js          # DeckManager & Selector Engine truy vấn từ vựng O(1)
│   ├── services/                 # Dịch vụ hạ tầng & Lưu trữ ngoại vi
│   │   ├── storage.js            # IndexedDB + In-Memory Write-Through RAM Cache O(1)
│   │   ├── audio.js              # Dual Native Audio Engine (CDN MP3 + Neural Web Speech TTS)
│   │   └── sync.js               # Universal 2-Way Handshake & Smart Merge FSRS
│   └── views/                    # Giao diện các màn hình người dùng
│       ├── review.js             # Màn hình Nhiệm vụ hôm nay & Kế hoạch ôn tập
│       ├── decks.js              # Màn hình Bộ đề, chặng học & danh mục từ
│       ├── study.js              # Trình phát Flashcard 3D, cử chỉ vuốt & phím tắt
│       ├── stats.js              # Màn hình Báo cáo thống kê & Activity Heatmap
│       ├── settings.js           # Màn hình Cài đặt thuật toán, âm thanh & sao lưu
│       └── components.js         # Spotlight Search Modal, Toast alerts & Sync Modal
│
└── data/                         # Cấu trúc dữ liệu chuẩn hóa (SSOT Normalized Data)
    ├── index.js                  # Central Hub & Dynamic Loaders (`loadTopicWords`, `getAllTopics`)
    ├── schemas.js                # Định nghĩa Schema & Enums (Phases, Categories, CEFR, States)
    ├── validators.js             # Hàm kiểm tra toàn vẹn dữ liệu từ vựng
    ├── topics.js                 # Danh mục 16 chủ đề lớn & 382 chủ đề chi tiết
    └── words.js                  # Từ điển 2.552 từ vựng chi tiết chuẩn hóa (SSOT)
```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Hạng mục | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Frontend Core** | Pure HTML5 & Vanilla ES6+ | Semantic HTML, Native ES Modules, DocumentFragment DOM batching |
| **Styling** | Vanilla CSS3 | CSS Variables, Flexbox, CSS Grid, 3D Transforms, Dark/Light Mode |
| **Spaced Repetition** | FSRS-6 Engine | 19 tham số tối ưu hóa độ bền (*Stability*) & độ khó (*Difficulty*) |
| **Client Storage** | IndexedDB + RAM Cache | `FlashcardProDB` kết hợp In-Memory Cache $O(1)$ & fallback `localStorage` |
| **Audio Engine** | Web Audio API + SpeechSynthesis | Studio CDN MP3 (US/UK) + Neural Web Speech AI TTS fallback |
| **PWA & Offline** | Service Worker Cache API | Chiến lược Network-First, tự động cập nhật và chạy Offline 100% |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

Ứng dụng chạy thuần túy phía Client (**100% Client-side Standalone SPA**), không cần cài đặt Node.js backend hay build step phức tạp:

### Cách 1: Sử dụng Live Server trên Visual Studio Code / IDE
1. Mở thư mục dự án trong Visual Studio Code.
2. Cài đặt tiện ích mở rộng **Live Server**.
3. Nhấp chuột phải vào `index.html` và chọn **Open with Live Server**.
4. Ứng dụng sẽ tự động mở tại `http://127.0.0.1:5500`.

### Cách 2: Chạy Web Server cục bộ với Python hoặc Node
```bash
# Sử dụng Python 3:
python -m http.server 8080

# Hoặc sử dụng npx serve (Node.js):
npx serve .
```
Truy cập trình duyệt tại `http://localhost:8080`.

---

## 💾 Bảo Mật & Quản Lý Dữ Liệu

1. **Dữ liệu thuộc về người dùng (100% Privacy):** Toàn bộ lịch sử học tập, số lượt ôn và đánh giá FSRS được lưu trữ cục bộ trên trình duyệt thiết bị của bạn.
2. **Sao lưu & Khôi phục dễ dàng:** Hỗ trợ xuất toàn bộ cơ sở dữ liệu ra tệp tin `flashcard_backup_YYYY-MM-DD.json` và nhập lại bất kỳ lúc nào tại tab **Cài Đặt**.
3. **Đồng bộ không dây tức thì:** Quét mã QR để chuyển toàn bộ tiến độ học tập sang điện thoại hoặc máy tính khác chỉ trong vài giây.

---

## 📄 Giấy Phép & Tác Giả

- **Tác giả:** Trần Tiến ([@trantien2k5](https://github.com/trantien2k5))
- **Mã nguồn:** [GitHub Repository](https://github.com/trantien2k5/flashcard-pro)
- **Bản quyền:** Phát hành theo giấy phép mã nguồn mở [MIT License](LICENSE).
