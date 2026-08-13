// Cấu hình nguồn dữ liệu dùng chung (Google Sheets qua Apps Script Web App).
// Chưa có URL -> app tự chạy ở chế độ lưu trên máy (localStorage), không lỗi gì cả.
// Có URL -> mọi người mở cùng link sẽ đọc/ghi chung một nguồn dữ liệu.
//
// Lấy URL theo hướng dẫn tại google-apps-script/README.md, rồi dán vào dòng dưới đây:
window.APP_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbzOTSyJFvusitOrsQ_WpOzn_2TRM14z0B_Ak0Sw3SpBfWlVA0W3SaQ8uwRMH9wUT9TU/exec"
};
