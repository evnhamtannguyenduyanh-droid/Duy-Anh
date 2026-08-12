# Kết nối dữ liệu dùng chung bằng Google Sheets

Làm theo 6 bước dưới đây (khoảng 10 phút, chỉ cần tài khoản Google). Sau khi xong, gửi lại cho Claude **link Web App** ở Bước 5 — Claude sẽ nối vào trang web.

## Bước 1 — Tạo Google Sheet mới
Vào [sheets.google.com](https://sheets.google.com) → **Trống** để tạo bảng tính mới. Đặt tên ví dụ: `Du lieu Cong xa PCLD`.

## Bước 2 — Mở Apps Script
Trong Google Sheet vừa tạo: menu **Tiện ích mở rộng (Extensions) → Apps Script**. Một tab mới sẽ mở ra với file `Code.gs` trống.

## Bước 3 — Dán code
Mở file [`Code.gs`](Code.gs) trong thư mục này, copy toàn bộ nội dung, dán đè vào file `Code.gs` trong Apps Script (xoá nội dung mẫu `function myFunction(){}` có sẵn). Bấm biểu tượng 💾 **Lưu** (hoặc Ctrl+S).

## Bước 4 — Chạy để tạo bảng + nạp 15 xe
- Ở thanh công cụ phía trên, chọn hàm **`setupAndSeed`** trong ô dropdown (cạnh nút ▷ Run).
- Bấm **▷ Run**.
- Lần đầu chạy, Google sẽ hỏi cấp quyền — chọn tài khoản của bạn → **Advanced/Nâng cao** → **Go to (tên project) (unsafe)** → **Allow/Cho phép**. (An toàn — đây là script do bạn tự dán vào, không phải bên thứ ba.)
- Chạy xong, quay lại Google Sheet sẽ thấy 3 tab mới: `Vehicles` (15 xe), `Drivers`, `Maintenance`.

## Bước 5 — Deploy thành Web App
Trong Apps Script: **Deploy → New deployment**.
- Bấm biểu tượng ⚙️ cạnh "Select type" → chọn **Web app**.
- **Execute as**: `Me (email của bạn)`
- **Who has access**: `Anyone` (bắt buộc — để trang web gọi được, không cần đăng nhập Google)
- Bấm **Deploy**, cấp quyền lần nữa nếu được hỏi.
- Copy **Web app URL** hiện ra (dạng `https://script.google.com/macros/s/xxxxxxx/exec`).

## Bước 6 — Gửi link cho Claude
Dán URL đó vào chat cho Claude — Claude sẽ điền vào `config.js` của trang web và kiểm tra kết nối.

---

### Sau này muốn sửa cấu trúc dữ liệu?
Quay lại tab Apps Script, sửa `Code.gs`, **Deploy → Manage deployments → biểu tượng bút chì → New version → Deploy** (không tạo deployment mới, giữ nguyên URL cũ).

### Ai xem được / sửa được dữ liệu?
Bất kỳ ai có **link trang web** đều đọc/ghi được dữ liệu qua Web App này (không có đăng nhập/phân quyền ở bước này). Bản thân Google Sheet gốc thì chỉ ai được bạn **chia sẻ (Share)** mới xem trực tiếp được.
