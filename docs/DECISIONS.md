# ⚖️ DECISIONS.md — Technical Architecture Decisions (ADR)

> **Nhật ký quyết định kiến trúc (Architectural Decision Records - ADR)** của dự án Flashcard English Pro.
> Tài liệu này lưu trữ các quyết định kỹ thuật bất biến nhằm ngăn chặn AI Agent và lập trình viên tự ý thay đổi gây lỗi hệ thống.

---

## ADR-001: Bộ Nhớ RAM Đọc Đồng Bộ (In-Memory Write-Through Cache)
- **Trạng thái:** Được chấp thuận (Active)
- **Bối cảnh:** Các ứng dụng học từ vựng cần phản hồi lật thẻ và chuyển câu hỏi với tốc độ 60fps (dưới 16ms). Nếu đọc dữ liệu từ IndexedDB bằng hàm bất đồng bộ (`await StorageManager.getCard(id)`), giao diện sẽ bị khựng, nhấp nháy (layout shift) hoặc rơi vào race condition.
- **Quyết định:** Toàn bộ dữ liệu trạng thái thẻ học và cấu hình được nạp sẵn vào bộ nhớ RAM (Map/Object) ngay khi khởi động. Mọi hàm đọc như `StorageManager.getCard()`, `StorageManager.getSettings()` đều là **hàm đồng bộ (Synchronous)** trả về giá trị tức thì. Thao tác ghi sẽ cập nhật vào RAM trước rồi debounce ghi ngầm xuống IndexedDB (Write-Through Pattern).
- **Hệ quả:** Tuyệt đối cấm biến các hàm đọc trạng thái thành hàm `async/await`.

---

## ADR-002: Lịch Ôn FSRS Không Nhồi Nhét Giữa Phiên (`relearnInSession: false`)
- **Trạng thái:** Được chấp thuận (Active)
- **Bối cảnh:** Thuật toán Anki truyền thống thường bắt người học lặp lại thẻ quên nhiều lần ngay trong phiên học (treadmill loop), gây kiệt sức và cảm giác ức chế tâm lý khi gặp từ khó.
- **Quyết định:** Khi người học bấm *Quên (Again)*, thẻ được ghi nhận tăng số lần quên (`lapses++`), chuyển sang trạng thái ôn tập lại (`State.Relearning`), và dời lịch ôn tập sang ngày mai theo đúng công thức giãn cách thời gian FSRS-6, không chèn lặp vô tận trong phiên học hiện tại.
- **Hệ quả:** Người học hoàn thành phiên học đúng số lượng thẻ đã định sẵn, không bị kẹt vô tận.

---

## ADR-003: Mô Hình Facade Re-export Khi Chia Nhỏ Module (Barrel Facade Pattern)
- **Trạng thái:** Được chấp thuận (Active)
- **Bối cảnh:** Khi các tệp điều khiển giao diện (`views/stats.js`, `views/decks.js`, `views/library.js`, `views/review.js`) phình to trên 1.000 dòng và cần tách nhỏ thành các module con, việc thay đổi đường dẫn import ở hàng chục tệp khác sẽ gây rủi ro đứt gãy rất cao.
- **Quyết định:** Tệp gốc tiếp tục giữ tên cũ và đóng vai trò **Facade Barrel**: import các thành phần từ thư mục con và xuất khẩu lại (`export { ... }`). Mọi module bên ngoài vẫn có thể import từ tệp gốc mà không cần thay đổi đường dẫn.
- **Hệ quả:** Bảo đảm 100% tương thích ngược (Zero Breaking Changes), chia tách an toàn tuyệt đối.

---

## ADR-004: Thứ Tự Khai Báo Module ESM & Cổng Kiểm Soát Cú Pháp V8 AST
- **Trạng thái:** Được chấp thuận (Active)
- **Bối cảnh:** Bộ kiểm tra cú pháp native `test/check.js` sử dụng V8 Native Compiler và các biểu thức chính quy để phân tích AST. Nếu các câu lệnh `export` hoặc biến `let/const` nằm xen kẽ giữa các câu lệnh `import`, regex phân tách sẽ gặp lỗi hoặc gây xung đột cú pháp.
- **Quyết định:** Tất cả các câu lệnh `import` bắt buộc phải nằm ở **đầu tệp tin**, tiếp theo là các `export`, và sau cùng mới đến các biến trạng thái hoặc khai báo hàm/class.
- **Hệ quả:** Toàn bộ 70+ tệp mã nguồn luôn vượt qua kiểm tra cú pháp AST trong vòng chưa tới 1 giây.

---

## ADR-005: Cơ Chế Nâng Phiên Bản Một Nguồn Duy Nhất (SSOT Version Bump)
- **Trạng thái:** Được chấp thuận (Active)
- **Bối cảnh:** Dự án phân phối dưới dạng PWA ngoại tuyến, có 4 tệp lưu trữ phiên bản: `package.json`, `sw.js`, `src/js/config.js`, và `index.html`. Việc sửa tay từng tệp rất dễ dẫn đến việc lệch phiên bản, làm Service Worker không kích hoạt cập nhật cache.
- **Quyết định:** Tuyệt đối không sửa tay số phiên bản. Luôn sử dụng lệnh `npm run bump` (hoặc `node scripts/bump.js`). Script này tự động cập nhật đồng thời cả 4 tệp và chạy kiểm thử tự động.
- **Hệ quả:** Phiên bản toàn dự án luôn đồng nhất 100%.

---

## ADR-006: Precache Ngoại Tuyến Toàn Phần PWA (`STATIC_ASSETS`)
- **Trạng thái:** Được chấp thuận (Active)
- **Bối cảnh:** Flashcard English Pro là ứng dụng PWA ưu tiên hoạt động không cần mạng (Offline-First).
- **Quyết định:** Mọi tệp `.js` hoặc `.css` mới được tạo trong `src/` bắt buộc phải được đăng ký vào danh sách `STATIC_ASSETS` trong `sw.js`.
- **Hệ quả:** Ứng dụng luôn tải được đầy đủ các module và hoạt động bình thường kể cả khi thiết bị mất kết nối Internet hoàn toàn.
