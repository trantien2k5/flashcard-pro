# ⚡ Flashcard English Pro - Spaced Repetition (FSRS)

> Ứng dụng web học từ vựng tiếng Anh thông minh ứng dụng thuật toán **Lặp lại ngắt quãng (Spaced Repetition)** hiện đại, giao diện chuẩn **Mobile-First**, phát âm giọng bản xứ **Zero-Delay** và bảng phân tích tiến độ trực quan.

🔗 **Live Demo:** [https://trantien2k5.github.io/flashcard-pro/](https://trantien2k5.github.io/flashcard-pro/)

---

## 🌟 Tính Năng Nổi Bật

### 1. 🧠 Thuật toán Ghi nhớ Thông minh (FSRS Engine)

- **Tính toán khoa học**: Phân tích độ bền trí nhớ (_Stability_), độ khó của từ (_Difficulty_) và khoảng cách ôn tập tối ưu (_Interval_) cho từng từ vựng.
- **4 mức đánh giá phản hồi**: `Quên (Again)`, `Khó (Hard)`, `Nhớ (Good)`, `Dễ (Easy)` với thời gian dự kiến hiển thị trực tiếp trên nút bấm.
- **Biểu đồ 5 Cấp độ Trí nhớ**: Phản ánh chính xác cấu trúc bộ nhớ thực tế của học viên (_Mới học_, _Nhớ yếu_, _Đang nhớ_, _Nhớ tốt_, _Ghi nhớ sâu_).

### 2. 🔊 Động cơ Âm thanh Bản xứ Kép (Dual Native Audio Engine)

- **Studio Native Audio (US / UK)**: Ưu tiên phát âm giọng người bản xứ chuẩn phòng thu từ các kho từ điển quốc tế.
- **Tải trước tức thì (0ms Preloading)**: Tự động tải trước toàn bộ âm thanh trong phiên học, bấm là phát ngay không độ trễ.
- **Dự phòng thông minh (Offline Neural TTS)**: Tự động chuyển đổi mượt mà sang giọng đọc AI (Web Speech API) khi ngoại tuyến hoặc mất kết nối mạng.

### 3. 📚 Kho 16 Chủ đề & 2.600 Từ Vựng Chuẩn Hóa

- **16 Chủ đề toàn diện**: Đời sống, Con người, Cảm xúc, Ẩm thực, Nhà cửa, Sức khỏe, Mua sắm, Giao thông, Công việc, Giáo dục, Du lịch, Giải trí, Công nghệ, Thiên nhiên, Xã hội và **TOEIC B1**.
- **167 Lộ trình con chia nhỏ (10-15 từ/bài)**: Mỗi chủ đề được phân tách thành các bài học vừa vặn, khoa học và dễ tiếp thu.
- **Cơ chế Khóa tiến độ (Progressive Mastery Locking)**: Học viên hoàn thành và nắm vững bài học trước để mở khóa chặng tiếp theo.
- **Bộ lọc & Phân trang thông minh**: Lọc nhanh theo trạng thái (_Tất cả_, _Mới_, _Đang học_, _Cần ôn_, _Đã thuộc_), tìm kiếm tức thì và phân trang linh hoạt.

### 4. 📈 Bảng Thống Kê Tiến Độ Tinh Gọn (4 Phần Chuẩn Mực)

- **Tổng quan**: Nắm bắt ngay _Số từ đã học_, _Số từ đang nhớ tốt_ và _Tỷ lệ ghi nhớ (%)_ trong 3 giây.
- **Tiến bộ 7 ngày**: Biểu đồ đo lường số lượng từ vựng ghi nhớ thành công tích lũy theo từng ngày.
- **Độ bền trí nhớ**: Thống kê 4 chặng đường ghi nhớ (`Mới học` $\rightarrow$ `Đang củng cố` $\rightarrow$ `Nhớ trung hạn` $\rightarrow$ `Nhớ dài hạn`).
- **Dự báo ôn tập**: Xem trước khối lượng từ tới hạn cần ôn tập trong 7 ngày kế tiếp.

### 5. ⚡ Đồng Bộ Thông Minh 2 Chiều 1 Chạm (Universal 2-Way Smart Sync)

- **Không cần chọn Gửi/Nhận**: 1 máy mở mã QR — 1 máy quét mã QR là cả 2 thiết bị tự động bắt tay và trao đổi dữ liệu 2 chiều.
- **Smart Merge FSRS**: Tự động so sánh mốc thời gian học, gộp bài học mới nhất của từng từ vựng và cập nhật đồng thời lên cả 2 máy trong $\le 1.5$s.
- **Tương thích đa nền tảng**: Hỗ trợ quét bằng Camera trong ứng dụng hoặc mở bằng Camera mặc định trên iPhone/Android/Zalo.

### 6. 🎨 Giao diện Người dùng Cao Cấp (Modern UI/UX)

- **Chế độ Giao diện**: Hỗ trợ đầy đủ **Dark Mode (Tối)** sang trọng và **Light Mode (Sáng)** thanh lịch.
- **Thẻ Flashcard 3D**: Lật thẻ mượt mà với hiệu ứng 3D transform sống động.
- **Tìm kiếm toàn cục (Global Search)**: Tìm nhanh bất kỳ từ vựng, phiên âm hoặc định nghĩa với cơ chế _Debounce 150ms_.
- **Quản trị dữ liệu an toàn**: Sao lưu (Export JSON), Khôi phục (Import JSON) và Đặt lại tiến độ học tập.

---

## 📁 Cấu Trúc Mã Nguồn (Project Structure)

Dự án được xây dựng theo kiến trúc **Module ES6 thuần** đối xứng 1-1 giữa CSS và JS, không phụ thuộc vào framework cồng kềnh:

```
simple-flashcard/
├── index.html                    # Single-Page Application Layout chính
├── README.md                     # Tài liệu giới thiệu dự án
├── AGENTS.md                     # Tài liệu kiến trúc cho AI Agent
├── sw.js                         # PWA Service Worker (Offline Cache & Auto Update)
├── assets/
│   └── icons/                    # App Icons (favicon.svg, favicon.ico)
│
├── css/                          # Hệ thống Styling phân tầng
│   ├── variables.css             # Design Tokens (Màu sắc, Font, Spacing, Theme)
│   ├── layout.css                # Khung Mobile-First, Header & Bottom Nav
│   ├── animations.css            # Hiệu ứng chuyển động & Micro-interactions
│   ├── style.css                 # Master Stylesheet (quản lý @import có cache-busting)
│   ├── components/               # CSS cho từng component độc lập
│   │   ├── flashcard.css         # Thẻ Flashcard 3D & nút đánh giá FSRS
│   │   ├── search.css            # Modal tìm kiếm từ vựng toàn cục
│   │   ├── feedback.css          # Toast thông báo & Modal tổng kết phiên
│   │   └── sync-modal.css        # Modal đồng bộ 2 chiều thông minh
│   └── views/                    # CSS riêng biệt cho từng màn hình
│       ├── decks.css             # Danh sách bộ đề, chủ đề con & danh sách từ
│       ├── review.css            # Màn hình Ôn tập & biểu đồ phân bố trí nhớ
│       ├── stats.css             # Màn hình Thống kê tiến độ & biểu đồ 7 ngày
│       ├── profile.css           # Màn hình Cá nhân & xuất/nhập sao lưu
│       └── settings.css          # Màn hình Cài đặt & cấu hình FSRS
│
├── js/                           # JavaScript ES Modules (Toàn bộ logic nghiệp vụ)
│   ├── app.js                    # Controller chính & điều hướng ứng dụng
│   ├── constants.js              # Hằng số hệ thống & ánh xạ nhãn
│   ├── fsrs.js                   # Thuật toán Spaced Repetition FSRS-6
│   ├── storage.js                # Tầng dữ liệu: IndexedDB + RAM Cache
│   ├── study-session.js          # Quản lý phiên học & Dual Audio Engine
│   ├── deck-manager.js           # Quản lý metadata chủ đề từ data/
│   ├── sync-manager.js           # Lõi Bắt tay 2 Chiều & Smart Merge
│   ├── timer.js / stats.js       # Bộ đếm thời gian, Streak & Thống kê FSRS
│   ├── components/
│   │   ├── study.js              # Giao diện phiên học & phím tắt
│   │   ├── search.js             # Tìm kiếm từ vựng toàn cục
│   │   ├── sync.js               # Controller Đồng bộ 2 Chiều & Camera Scanner
│   │   └── feedback.js           # Toast thông báo & Confirm dialog
│   └── views/
│       ├── review-view.js        # Màn hình Ôn tập & 5 cấp độ trí nhớ
│       ├── decks-view.js         # Màn hình Bộ đề (Topics -> Subtopics -> Words)
│       ├── stats-view.js         # Màn hình Báo cáo Thống kê
│       ├── profile-view.js       # Màn hình Cá nhân & Backup/Restore
│       └── settings-view.js      # Màn hình Cài đặt FSRS & Âm thanh
│
└── data/                         # Cấu trúc dữ liệu chuẩn hóa (SSOT)
    ├── index.js                  # Central Hub & Dynamic Loaders
    ├── schemas.js                # Định nghĩa Schema & Enums
    ├── validators.js             # Hàm kiểm tra toàn vẹn dữ liệu
    ├── topics.js                 # 183 Chủ đề phân cấp
    └── words.js                  # 2.367 Từ vựng chi tiết
```

---

## 🚀 Hướng Dẫn Sử Dụng (Getting Started)

Dự án là ứng dụng Web thuần Client-side (Pure Standalone SPA), **hoạt động 100% Offline-First** ngay trên trình duyệt mà không cần cài đặt bất kỳ server backend nào:

- **Mở trực tiếp trên Trình duyệt:** Mở `index.html` bằng bất kỳ trình duyệt hiện đại nào (Chrome, Edge, Safari, Firefox) hoặc thông qua **Live Server / Web Server** cục bộ.
- **Lưu trữ dữ liệu:** Tự động lưu trữ ngoại tuyến vào **IndexedDB** và **LocalStorage** bền vững, kèm tính năng Xuất/Nhập file `.json` sao lưu trong tab **Cá nhân**.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **HTML5**: Cấu trúc ngữ nghĩa Semantic, Accessibility (ARIA).
- **Vanilla CSS3**: CSS Variables, CSS Grid, Flexbox, 3D Transforms, Glassmorphism, Theme toggling.
- **Vanilla JavaScript (ES6+)**: ES Modules, Async/Await, Web Speech API, AudioContext, DocumentFragment DOM optimization.
- **Storage**: Browser `localStorage` kết hợp kiến trúc **Write-Through In-Memory RAM Cache** đạt tốc độ truy xuất $O(1)$.
- **FSRS Algorithm**: Thuật toán lặp lại ngắt quãng tối ưu hóa khoảng cách thời gian ghi nhớ khoa học.

---

## 📄 Bản Quyền & Tác Giả

- Phát triển bởi **Trần Tiến**
- GitHub: [@trantien2k5](https://github.com/trantien2k5)
- Giấy phép: MIT License

- Website: [https://trantien2k5.github.io/flashcard-pro/](https://trantien2k5.github.io/flashcard-pro/)
