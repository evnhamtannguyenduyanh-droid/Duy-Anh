// Cấu hình nguồn dữ liệu dùng chung (Google Sheets qua Apps Script Web App).
// Chưa có URL -> app tự chạy ở chế độ lưu trên máy (localStorage), không lỗi gì cả.
// Có URL -> mọi người mở cùng link sẽ đọc/ghi chung một nguồn dữ liệu.
//
// Lấy URL theo hướng dẫn tại google-apps-script/README.md, rồi dán vào dòng dưới đây:
window.APP_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycby9gj0YR5wiUovNwlZLbZ7vBx6AUl44OnQztBvGKCtw4yiAnYpOoN74Y3pFB6hxSFOC/exec"
};
