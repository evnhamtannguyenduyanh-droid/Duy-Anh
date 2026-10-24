// Hồ sơ đăng ký / thông số / thế chấp của các xe Điện lực Hàm Tân, tra theo biển số.
// Dữ liệu cắt nguyên từ ham-tan/app.js (VEHICLE_STATIC, REG_REFS); không sửa ham-tan/.
// Dữ liệu động (hạn, km, ảnh) nằm ở Google Sheet, không nằm ở đây.

var VEHICLE_PROFILES = {
  "86C-128.29": {
    hieu:"ISUZU", loai:"Xe thang nâng người 03 chỗ", chusohuu:"Công ty Điện lực Bình Thuận",
    nhom:"xe_tai_cau_nang", dinhmuc:"12 lít/100km + 3 lít/giờ cẩu",
    dangky:[["Chủ xe (đăng ký)","Công ty Điện lực Bình Thuận"],["Địa chỉ","Tôn Đức Thắng, Xuân An, Phan Thiết, Bình Thuận"],
      ["Nhãn hiệu","ISUZU"],["Loại xe","Tải - Thiết bị nâng người (ô tô nâng người làm việc trên cao)"],
      ["Số loại (Model code)","ATFS"],["Màu sơn","Trắng (biển đăng ký nền trắng)"],["Số máy","RZ4E-SS5165"],
      ["Số khung","MPATFS87JJT005059"],["Số chỗ ngồi / đứng","4 chỗ ngồi / 0 đứng"],
      ["Giấy CN đăng ký xe số","024815 — Công an tỉnh Bình Thuận"],["Ngày đăng ký lần đầu","30/09/2019"],
      ["Đăng ký có giá trị đến","31/12/2043"]],
    thongso:[["Số quản lý phương tiện","8601S-029610"],["Năm sản xuất","2018"],["Công thức bánh xe","4x4"],
      ["Kích thước bao","5900 x 1960 x 2680 mm"],["Chiều dài cơ sở","3095 mm"],["Khối lượng bản thân","3130 kg"],
      ["Khối lượng hàng CC theo TK/CP TGGT","3500 / 3500 kg"],["Cỡ lốp","245/70R16"],["Loại nhiên liệu","Diesel"],
      ["Dung tích xi-lanh","1898 cm3"],["Công suất lớn nhất","120 kW / 3600 vòng/phút"]],
    ghichu_full:"biển đăng ký nền trắng."
  },
  "86C-153.50": {
    hieu:"ISUZU", loai:"Xe cẩu bán tải 03 chỗ", chusohuu:"Công ty Điện lực Bình Thuận",
    nhom:"xe_tai_cau_nang", dinhmuc:"24 lít/100km + 3 lít/giờ cẩu",
    dangky:[["Chủ xe (đăng ký)","Công ty Điện lực Bình Thuận"],["Địa chỉ","Đại lộ T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận"],
      ["Nhãn hiệu","ISUZU"],["Loại xe","Ô tô tải (có gắn cẩu) — xe cẩu bán tải"],["Số loại (Model code)","FVR34QE4 / DUL-TC2"],
      ["Màu sơn","Trắng (biển đăng ký nền trắng)"],["Số máy","6HK1-242250"],["Số khung","RLEFVR347MV000304"],
      ["Số chỗ ngồi","3 chỗ"],["Giấy CN đăng ký xe số","86 004110 — Công an tỉnh Bình Thuận"],
      ["Ngày đăng ký","15/10/2021"],["Đăng ký có giá trị đến","31/12/2046"]],
    thongso:[["Số quản lý phương tiện","8601S-035817"],["Năm SX","2021, Việt Nam"],["Niên hạn sử dụng","2046"],
      ["Công thức bánh xe","4x2"],["Kích thước bao","9460 x 2500 x 3450 mm"],["Kích thước lòng thùng xe","6400 x 2350 x 645 mm"],
      ["Chiều dài cơ sở","5560 mm"],["Khối lượng bản thân","9505 kg"],["Khối lượng hàng CC","5800 / 5800 kg"],
      ["Khối lượng toàn bộ","15500 / 15500 kg"],["Cỡ lốp","10.00R20"],["Loại nhiên liệu","Diesel"],
      ["Dung tích xi-lanh","7790 cm3"],["Công suất lớn nhất","177 kW / 2400 vòng/phút"]],
    ghichu_full:"biển đăng ký nền trắng."
  },
  "86C-188.93": {
    hieu:"SUZUKI", loai:"Xe tải thùng kín 02 chỗ", chusohuu:"Công ty Điện lực Bình Thuận",
    nhom:"xe_tai_cau_nang", dinhmuc:"10 lít/100km",
    dangky:[["Chủ xe (đăng ký)","Công ty Điện lực Bình Thuận"],["Địa chỉ","ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận"],
      ["Nhãn hiệu","SUZUKI"],["Loại xe","Tải thùng kín"],["Số loại (Model code)","SK410K4"],["Màu sơn","Trắng"],
      ["Số máy","F10A-V1017213"],["Số khung","RLSEDA21TNV213686"],["Số chỗ ngồi","2 chỗ"],["Trọng tải","550 kg"],
      ["Khối lượng toàn bộ","1450 kg"],["Giấy CN đăng ký xe số","86013462 — Công an tỉnh Bình Thuận"],
      ["Ngày đăng ký","14/11/2023"],["Đăng ký có giá trị đến","31/12/2048"]],
    thongso:[["Loại nhiên liệu","Xăng"]],
    the_chap:[["Bên nhận thế chấp","Vietinbank — CN TP. Hồ Chí Minh"],["Bên thế chấp","Tổng công ty Điện lực Miền Nam (EVNSPC)"],
      ["Số hợp đồng thế chấp","23.300047/2023/HĐBĐ/NHCT900-EVNSPC"],
      ["Số giấy biên nhận thế chấp","7.13.../GBNTC/NHCT-CN900-DNSL, cấp 17/02/2025 (lần 2)"],
      ["Hiệu lực giấy biên nhận","17/02/2025 — 31/12/2025 (cần kiểm tra gia hạn)"]],
    ghichu_full:"Bản chính Giấy chứng nhận đăng ký xe đang do Vietinbank CN TP.HCM giữ theo hợp đồng thế chấp của EVNSPC; đơn vị chỉ có bản sao chứng thực. Khi cần bản chính để đăng kiểm/điều động, liên hệ trước Văn phòng Công ty/Ban Tài chính EVNSPC."
  },
  "49C-262.84": {
    hieu:"NISSAN NAVARA EL", loai:"Xe bán tải 05 chỗ", chusohuu:"Công ty Điện lực Lâm Đồng",
    nhom:"xe_con_bantai", dinhmuc:"14 lít/100km (QĐ 1627/2021)",
    dangky:[["Chủ xe (đăng ký)","Công ty Điện lực Lâm Đồng"],["Địa chỉ","2 Hùng Vương, Phường 10, Đà Lạt, Lâm Đồng"],
      ["Nhãn hiệu","NISSAN"],["Loại xe","Ô tô tải Pickup cabin kép — xe bán tải"],
      ["Số loại (Model code)","NAVARA EL (mã kiểm định: CVL2LSLD23FYP-D-EQ)"],["Màu sơn","Trắng"],
      ["Số máy","YD25951640T"],["Số khung","MNTCC2D23Z0092346"],["Số chỗ ngồi","5 chỗ"],
      ["Giấy CN đăng ký xe số","49 010012 — Công an tỉnh Lâm Đồng"],["Ngày đăng ký","15/09/2021"],
      ["Đăng ký có giá trị đến","31/12/2045"]],
    thongso:[["Năm SX","2020, Thái Lan"],["Niên hạn sử dụng","2045"],["Có cải tạo","Có"],["Công thức bánh xe","4x2"],
      ["Kích thước bao","5255 x 1850 x 1815 mm"],["Khối lượng bản thân","1950 kg"],["Khối lượng hàng CC","600 / 600 kg"],
      ["Khối lượng toàn bộ","2875 / 2875 kg"],["Động cơ","4 xi-lanh, YD25, 2488 cm3"],
      ["Công suất lớn nhất","120 kW / 3600 vòng/phút"],["Loại nhiên liệu","Diesel"],["Cỡ lốp","255/60R18"]],
    ghichu_full:"Xe điều chuyển từ Điện lực Đà Lạt"
  }
};

var REG_REFS = {
  common: [
    { tag:"Điều 9", txt:"Lái xe phải giữ đầy đủ: Giấy chứng nhận đăng ký xe, GPLX, Giấy chứng nhận kiểm định, Giấy chứng nhận bảo hiểm bắt buộc TNDS." },
    { tag:"Điều 2.3", txt:"Trước khi vận hành phải mua bảo hiểm TNDS bắt buộc, đưa xe đi kiểm định. Rà soát các xe hết hạn bảo hiểm để mua lại kịp thời." },
    { tag:"Điều 12", txt:"Căn cứ hạn kiểm định, lái xe làm đề xuất đưa xe vào bảo dưỡng trước 07 ngày; có thể đăng kiểm trước hạn 1-3 ngày." },
  ],
  xe_tai_cau_nang: [
    { tag:"Điều 13", txt:"Xe nhóm nâng, cẩu phải kiểm định định kỳ thiết bị nâng, cẩu theo tham mưu Phòng An toàn." },
    { tag:"Phụ lục 1", txt:"Bảo dưỡng cấp 1: thay nhớt máy mỗi 4.000km; lọc nhớt mỗi 8.000km." },
    { tag:"Phụ lục 2", txt:"Bảo dưỡng cấp 2: lọc nhiên liệu & lọc gió mỗi 24.000km, cùng các hạng mục khác theo bảng định mức đầy đủ." },
  ],
  xe_con_bantai: [
    { tag:"Phụ lục 1", txt:"Bảo dưỡng cấp 1: thay nhớt máy mỗi 5.000km; lọc nhớt mỗi 10.000km." },
    { tag:"Phụ lục 2", txt:"Bảo dưỡng cấp 2: lọc nhiên liệu & lọc gió mỗi 30.000km, curoa máy phát/máy lạnh mỗi 50.000km..." },
  ],
  process: [
    { tag:"Điều 16.1", txt:"Đến hạn bảo dưỡng: lập Tờ trình BM-06, kèm báo giá, trình TCKT và Lãnh đạo phê duyệt." },
    { tag:"Điều 16.2", txt:"Hư hỏng bất thường: lập thêm Biên bản kiểm tra kỹ thuật (BM-09) trước khi lập BM-06." },
    { tag:"BM-08", txt:"Sau bảo dưỡng/sửa chữa, lập Biên bản nghiệm thu (BM-08) — đồng thời cập nhật lại km bảo dưỡng gần nhất trong app." },
  ],
};
