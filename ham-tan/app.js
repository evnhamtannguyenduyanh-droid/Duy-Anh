// Quản lý xe — Điện lực Hàm Tân
// Port từ bản Apps Script HtmlService gốc: giữ nguyên toàn bộ UI/logic hiển thị,
// chỉ thay lớp gọi dữ liệu (google.script.run) bằng fetch() gọi API_URL trong config.js.

const API_URL = (typeof window !== "undefined" && window.APP_CONFIG && window.APP_CONFIG.API_URL) || "";
let SHEET_URL = "";
const TODAY = new Date();

const GROUP_INFO = {
  xe_tai_cau_nang: { label: "Xe tải, cẩu, khoan, nâng", cap1: 4000, cap2: 24000 },
  xe_con_bantai:   { label: "Xe con / xe bán tải",       cap1: 5000, cap2: 30000 },
};

const VEHICLE_STATIC = {
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

const REG_REFS = {
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

const PHOTO_SLOTS = [
  { key:"Truoc",    label:"Mặt trước — Giấy ĐK xe" },
  { key:"Sau",      label:"Mặt sau — Giấy ĐK xe" },
  { key:"KiemDinh", label:"Giấy chứng nhận kiểm định" },
  { key:"Khac",     label:"Ảnh khác (thế chấp, bảo hiểm...)" },
];

// ============================================================= API BRIDGE (fetch, thay cho google.script.run)
function apiGet(action, params){
  if (!API_URL) return Promise.reject(new Error("Chưa cấu hình API_URL trong config.js"));
  const url = new URL(API_URL);
  url.searchParams.set("action", action);
  Object.keys(params || {}).forEach(function (k) {
    if (params[k] !== undefined && params[k] !== null) url.searchParams.set(k, params[k]);
  });
  return fetch(url.toString()).then(function (r) { return r.json(); });
}
function apiPost(action, payload){
  if (!API_URL) return Promise.reject(new Error("Chưa cấu hình API_URL trong config.js"));
  return fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(Object.assign({ action: action }, payload))
  }).then(function (r) { return r.json(); });
}

// ============================================================= STATE
let vehicles = [];
let currentView = { screen:"home", plate:null, tab:"canh-bao" };
let loading = false;

async function loadData(){
  const data = await apiGet("vehicles");
  if (data && data.__error) {
    const err = new Error(data.message + (data.stack ? ("\n" + data.stack) : ""));
    throw err;
  }
  vehicles = (data.vehicles || []).map(r=>Object.assign({}, r, VEHICLE_STATIC[r.BienSo] || {}));
  if (data.sheetUrl) SHEET_URL = data.sheetUrl;
}

// ============================================================= HELPERS
function daysUntil(dateStr){
  if(!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - new Date(TODAY.toDateString()).getTime()) / 86400000);
}
function fmtDate(dateStr){
  if(!dateStr) return "—";
  const [y,m,d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}
function dateStatus(dateStr){
  const dd = daysUntil(dateStr);
  if(dd === null) return { level:"gray", label:"Chưa cập nhật" };
  if(dd < 0) return { level:"red", label:`Đã quá hạn ${Math.abs(dd)} ngày` };
  if(dd <= 15) return { level:"red", label:`Còn ${dd} ngày` };
  if(dd <= 30) return { level:"amber", label:`Còn ${dd} ngày` };
  return { level:"green", label:`Còn ${dd} ngày` };
}
function kmStatus(hientai, lastMocKm, threshold){
  const cur = Number(hientai), last = Number(lastMocKm);
  if(hientai==="" || hientai==null || lastMocKm==="" || lastMocKm==null || isNaN(cur) || isNaN(last)){
    return { level:"gray", label:"Chưa cập nhật", pct:0 };
  }
  const used = cur - last;
  const remain = threshold - used;
  const pct = Math.max(0, Math.min(100, Math.round((used/threshold)*100)));
  if(remain <= 0) return { level:"red", label:`Đã vượt ${Math.abs(remain).toLocaleString("vi-VN")} km`, pct:100 };
  if(remain <= 500) return { level:"amber", label:`Còn ${remain.toLocaleString("vi-VN")} km`, pct };
  return { level:"green", label:`Còn ${remain.toLocaleString("vi-VN")} km`, pct };
}
function kmBarHtml(status){
  return `<div class="kmbar"><div class="kmbar-fill ${status.level}" style="width:${status.pct}%;"></div></div>`;
}
const VEHICLE_ICON = { xe_tai_cau_nang: "🏗️", xe_con_bantai: "🛻" };
function overallDot(v){
  const g = GROUP_INFO[v.nhom];
  const levels = [
    dateStatus(v.DangKiemHetHan).level, dateStatus(v.BaoHiemHetHan).level,
    kmStatus(v.KmHienTai, v.KmBD1, g.cap1).level, kmStatus(v.KmHienTai, v.KmBD2, g.cap2).level,
  ];
  if(levels.includes("red")) return "red";
  if(levels.includes("amber")) return "amber";
  if(levels.includes("gray")) return "gray";
  return "green";
}
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=>t.classList.remove("show"), 2600);
}
function todayStr(){
  const d = new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

// ============================================================= RENDER: HOME
function renderHome(){
  let redCount=0, amberCount=0, greenCount=0;
  vehicles.forEach(v=>{ const d=overallDot(v); if(d==="red")redCount++; else if(d==="amber")amberCount++; else if(d==="green")greenCount++; });

  const cards = vehicles.map(v=>{
    const dk=dateStatus(v.DangKiemHetHan), bh=dateStatus(v.BaoHiemHetHan), g=GROUP_INFO[v.nhom];
    const bd1=kmStatus(v.KmHienTai,v.KmBD1,g.cap1), bd2=kmStatus(v.KmHienTai,v.KmBD2,g.cap2);
    return `
    <div class="card" onclick="openDetail('${v.BienSo}')">
      <div class="card-top">
        <div class="card-main">
          <div class="veh-icon">${VEHICLE_ICON[v.nhom]||"🚗"}</div>
          <div><div class="plate">${v.BienSo}</div><div class="vname">${v.hieu} — ${v.loai}</div></div>
        </div>
        <span class="dot ${overallDot(v)}"></span>
      </div>
      <div class="card-badges">
        <span class="badge ${dk.level}">🛂 Đăng kiểm: <b>${dk.label}</b></span>
        <span class="badge ${bh.level}">🛡️ Bảo hiểm: <b>${bh.label}</b></span>
        <span class="badge ${bd1.level}">🔧 BD1: <b>${bd1.label}</b></span>
        <span class="badge ${bd2.level}">⚙️ BD2: <b>${bd2.label}</b></span>
      </div>
      ${v.CapNhatLuc? `<div class="last-update">🕒 Cập nhật lần cuối: ${v.CapNhatLuc}</div>`:""}
    </div>`;
  }).join("");

  return `
    <div class="alert-strip">
      <div class="alert-chip red"><div class="num">${redCount}</div><div class="lbl">CẦN XỬ LÝ NGAY</div></div>
      <div class="alert-chip amber"><div class="num">${amberCount}</div><div class="lbl">SẮP ĐẾN HẠN</div></div>
      <div class="alert-chip green"><div class="num">${greenCount}</div><div class="lbl">BÌNH THƯỜNG</div></div>
    </div>
    <div class="section-title">Danh sách xe (${vehicles.length})</div>
    <div id="debugBox"></div>
    ${cards}
    <div class="note" style="text-align:center;margin:10px 0 4px;">Chạm vào 1 xe để xem chi tiết, cập nhật số km, hạn đăng kiểm/bảo hiểm, ảnh giấy tờ và quy định liên quan.</div>
    <button class="btn secondary" onclick="refreshAll()">🔄 Làm mới dữ liệu</button>
    <button class="btn secondary" onclick="exportExcel()">⬇️ Tải file Excel backup toàn bộ 4 xe</button>
    ${SHEET_URL ? `<a href="${SHEET_URL}" target="_blank" style="text-decoration:none;">
      <button class="btn secondary" type="button">📄 Mở Google Sheet dữ liệu gốc</button>
    </a>` : ""}
  `;
}
async function refreshAll(){
  showToast("Đang làm mới…");
  await loadData();
  render();
  showToast("Đã cập nhật dữ liệu mới nhất");
}

// ============================================================= RENDER: DETAIL
async function openDetail(plate){
  currentView = { screen:"detail", plate, tab:"canh-bao" };
  render();
  await loadData(); // lấy dữ liệu mới nhất (phòng khi tài xế khác vừa cập nhật)
  if(currentView.plate===plate) render();
}
function goHome(){ currentView = { screen:"home", plate:null, tab:"canh-bao" }; render(); }
function setTab(tab){ currentView.tab = tab; render(); }

function renderDetail(){
  const v = vehicles.find(x=>x.BienSo===currentView.plate);
  if(!v){ goHome(); return ""; }
  const g = GROUP_INFO[v.nhom];
  const dk=dateStatus(v.DangKiemHetHan), bh=dateStatus(v.BaoHiemHetHan);
  const bd1=kmStatus(v.KmHienTai,v.KmBD1,g.cap1), bd2=kmStatus(v.KmHienTai,v.KmBD2,g.cap2);

  const tabs = [{k:"canh-bao",label:"Cảnh báo"},{k:"chi-tiet",label:"Chi tiết"},{k:"cap-nhat",label:"Cập nhật"},{k:"quy-dinh",label:"Quy định"}];
  const tabBar = `<div class="tabs">${tabs.map(t=>`<div class="tab ${currentView.tab===t.k?'active':''}" onclick="setTab('${t.k}')">${t.label}</div>`).join("")}</div>`;

  let body = "";
  if(currentView.tab==="canh-bao"){
    body = `
      <div class="panel"><h3><span class="n">1</span>Đăng kiểm & Bảo hiểm</h3>
        <div class="status-row"><span class="lab">Hạn đăng kiểm</span><span class="val"><span class="pill ${dk.level}">${v.DangKiemHetHan?fmtDate(v.DangKiemHetHan)+" · ":""}${dk.label}</span></span></div>
        <div class="status-row"><span class="lab">Hạn bảo hiểm bắt buộc (TNDS)</span><span class="val"><span class="pill ${bh.level}">${v.BaoHiemHetHan?fmtDate(v.BaoHiemHetHan)+" · ":""}${bh.label}</span></span></div>
      </div>
      <div class="panel"><h3><span class="n">2</span>Bảo dưỡng định kỳ theo km (${g.label})</h3>
        <div class="status-row"><span class="lab">Km hiện tại</span><span class="val">${v.KmHienTai?Number(v.KmHienTai).toLocaleString("vi-VN")+" km":"Chưa cập nhật"}</span></div>
        <div style="margin-top:4px;">
          <div class="status-row" style="border-bottom:none;padding-bottom:2px;"><span class="lab">Bảo dưỡng cấp 1 (mỗi ${g.cap1.toLocaleString("vi-VN")} km)</span><span class="val"><span class="pill ${bd1.level}">${bd1.label}</span></span></div>
          ${kmBarHtml(bd1)}
        </div>
        <div style="margin-top:14px;">
          <div class="status-row" style="border-bottom:none;padding-bottom:2px;"><span class="lab">Bảo dưỡng cấp 2 (mỗi ${g.cap2.toLocaleString("vi-VN")} km)</span><span class="val"><span class="pill ${bd2.level}">${bd2.label}</span></span></div>
          ${kmBarHtml(bd2)}
        </div>
      </div>
      ${v.ghichu_full? `<div class="panel"><h3><span class="n">!</span>Ghi chú</h3><div class="note" style="font-size:13px;color:var(--ink);">${v.ghichu_full}</div></div>`:""}
      <div class="panel"><h3><span class="n">🕒</span>Lịch sử cập nhật gần đây</h3>
        <div id="historyBox"><div class="note">Đang tải lịch sử…</div></div>
      </div>
    `;
    loadHistoryBox(v.BienSo);
  } else if(currentView.tab==="chi-tiet"){
    const rowsHtml=(rows)=>(rows||[]).map(([lab,val])=>`<div class="status-row"><span class="lab">${lab}</span><span class="val" style="text-align:right;max-width:58%;">${val}</span></div>`).join("");
    body = `
      <div class="panel"><h3><span class="n">📷</span>Ảnh giấy tờ xe (4 ảnh)</h3>
        <div class="photo-grid">
          ${PHOTO_SLOTS.map(s=>{
            const src = v["Photo_"+s.key];
            return `<div class="photo-cell">
              <div class="photo-label">${s.label}</div>
              ${src? `
                <img src="${src}" alt="${s.label}" class="photo-thumb" onclick="openLightbox('${v.BienSo}','${s.key}')">
                <div class="photo-actions">
                  <span onclick="triggerPhotoUpload('${v.BienSo}','${s.key}')">🔄 Đổi</span>
                  <span onclick="removePhotoUI('${v.BienSo}','${s.key}')" style="color:var(--red);">🗑️ Xóa</span>
                </div>` : `<div class="photo-empty" onclick="triggerPhotoUpload('${v.BienSo}','${s.key}')">📷 Chụp / Tải lên</div>`}
            </div>`;
          }).join("")}
        </div>
        <div class="note" style="margin-top:8px;">Chạm vào ảnh để xem cỡ lớn. Ảnh lưu vào Google Drive dùng chung — mọi tài xế cùng thấy.</div>
      </div>
      <div class="panel"><h3><span class="n">1</span>Thông tin đăng ký xe</h3>${rowsHtml(v.dangky)}</div>
      <div class="panel"><h3><span class="n">2</span>Thông số kỹ thuật</h3>${rowsHtml(v.thongso)}</div>
      ${v.the_chap? `<div class="panel"><h3><span class="n">3</span>Tình trạng thế chấp</h3>${rowsHtml(v.the_chap)}</div>`:""}
      ${v.ghichu_full? `<div class="panel"><h3><span class="n">!</span>Ghi chú / cảnh báo đầy đủ</h3><div class="note" style="font-size:13px;color:var(--ink);">${v.ghichu_full}</div></div>`:""}
      <button class="btn secondary" onclick="exportExcel('${v.BienSo}')">⬇️ Tải file Excel riêng xe này (backup)</button>
    `;
  } else if(currentView.tab==="cap-nhat"){
    body = `
      <div class="panel"><h3><span class="n">✎</span>Cập nhật đăng kiểm</h3>
        <div class="field-row">
          <div class="field"><label>Ngày kiểm định gần nhất</label><input type="date" id="f_dk_ngay" value="${v.DangKiemNgay||''}"></div>
          <div class="field"><label>Hạn đăng kiểm (hết hạn)</label><input type="date" id="f_dk_han" value="${v.DangKiemHetHan||''}"></div>
        </div>
      </div>
      <div class="panel"><h3><span class="n">✎</span>Cập nhật bảo hiểm bắt buộc</h3>
        <div class="field-row">
          <div class="field"><label>Ngày mua bảo hiểm</label><input type="date" id="f_bh_ngay" value="${v.BaoHiemNgay||''}"></div>
          <div class="field"><label>Hạn bảo hiểm (hết hạn)</label><input type="date" id="f_bh_han" value="${v.BaoHiemHetHan||''}"></div>
        </div>
      </div>
      <div class="panel"><h3><span class="n">✎</span>Cập nhật số km &amp; mốc bảo dưỡng</h3>
        <div class="field"><label>Km hiện tại</label><input type="number" inputmode="numeric" id="f_km_hientai" value="${v.KmHienTai||''}" placeholder="VD: 45000"></div>
        <div class="field-row">
          <div class="field"><label>Km lần bảo dưỡng cấp 1 gần nhất</label><input type="number" inputmode="numeric" id="f_km_bd1" value="${v.KmBD1||''}" placeholder="VD: 42000"></div>
          <div class="field"><label>Km lần bảo dưỡng cấp 2 gần nhất</label><input type="number" inputmode="numeric" id="f_km_bd2" value="${v.KmBD2||''}" placeholder="VD: 24000"></div>
        </div>
        <div class="note">Sau khi bảo dưỡng xong (theo BM-08), cập nhật lại km bảo dưỡng gần nhất tương ứng.</div>
      </div>
      <button class="btn" id="saveBtn" onclick="saveDetail()">💾 Lưu cập nhật</button>
    `;
  } else {
    const refs = [...REG_REFS.common, ...REG_REFS[v.nhom], ...REG_REFS.process];
    body = `<div class="panel"><h3><span class="n">§</span>Quy định áp dụng cho xe này</h3>
      ${refs.map(r=>`<div class="reg-item"><span class="tag">${r.tag}</span><div class="txt">${r.txt}</div></div>`).join("")}
      <div class="note" style="margin-top:10px;">Nguồn: Quy định Quản lý, sử dụng xe ô tô trong Công ty Điện lực Lâm Đồng (bản đầy đủ — xem file Word/Excel tổng hợp đã lập).</div>
    </div>`;
  }

  return `
    <div class="detail-hero">
      <div class="card-main">
        <div class="veh-icon" style="width:52px;height:52px;font-size:26px;">${VEHICLE_ICON[v.nhom]||"🚗"}</div>
        <div>
          <div class="plate-big">${v.BienSo}</div>
          <div class="vname">${v.hieu} — ${v.loai}</div>
        </div>
      </div>
      <div class="meta-grid">
        <div class="meta-item"><div class="k">Chủ sở hữu</div><div class="v">${v.chusohuu}</div></div>
        <div class="meta-item"><div class="k">Định mức nhiên liệu</div><div class="v">${v.dinhmuc}</div></div>
      </div>
      ${v.CapNhatLuc? `<div class="last-update">🕒 Cập nhật lần cuối: ${v.CapNhatLuc}</div>`:""}
    </div>
    ${tabBar}${body}
  `;
}

async function loadHistoryBox(plate){
  const box = document.getElementById("historyBox");
  if(!box) return;
  try{
    const data = await apiGet("history", { plate, limit: 8 });
    const items = data && data.history;
    const target = document.getElementById("historyBox");
    if(!target) return; // người dùng có thể đã chuyển tab trong lúc chờ
    if(!items || items.length===0){
      target.innerHTML = `<div class="note">Chưa có lịch sử thay đổi nào cho xe này.</div>`;
      return;
    }
    target.innerHTML = items.map(it=>`
      <div class="history-item">
        <div class="h-time">${it.ThoiGian}</div>
        <div class="h-body"><span class="h-action">${it.HanhDong}</span>${it.ChiTiet? " — "+it.ChiTiet : ""}</div>
      </div>
    `).join("");
  }catch(e){
    const target = document.getElementById("historyBox");
    if(target) target.innerHTML = `<div class="note" style="color:var(--red);">Không tải được lịch sử: ${e && e.message ? e.message : e}</div>`;
  }
}

async function saveDetail(){
  const v = vehicles.find(x=>x.BienSo===currentView.plate);
  if(!v) return;
  const btn = document.getElementById("saveBtn");
  btn.innerHTML = '<span class="spin"></span>Đang lưu…'; btn.disabled = true;
  const payload = {
    BienSo: v.BienSo,
    DangKiemNgay: document.getElementById("f_dk_ngay").value,
    DangKiemHetHan: document.getElementById("f_dk_han").value,
    BaoHiemNgay: document.getElementById("f_bh_ngay").value,
    BaoHiemHetHan: document.getElementById("f_bh_han").value,
    KmHienTai: document.getElementById("f_km_hientai").value,
    KmNgayCapNhat: todayStr(),
    KmBD1: document.getElementById("f_km_bd1").value,
    KmBD2: document.getElementById("f_km_bd2").value,
  };
  try{
    await apiPost("saveVehicle", { record: payload });
    await loadData();
    showToast("Đã lưu — mọi tài xế mở app sẽ thấy cập nhật này");
    currentView.tab = "canh-bao";
    render();
  }catch(e){
    showToast("Lỗi lưu dữ liệu: " + (e && e.message ? e.message : e));
    btn.innerHTML = '💾 Lưu cập nhật'; btn.disabled = false;
  }
}

// ============================================================= PHOTOS
function triggerPhotoUpload(plate, slot){
  const input = document.getElementById("photoInput");
  input.dataset.plate = plate; input.dataset.slot = slot; input.value = "";
  input.onchange = handlePhotoFile;
  input.click();
}
function handlePhotoFile(event){
  const plate = event.target.dataset.plate, slot = event.target.dataset.slot;
  const file = event.target.files && event.target.files[0];
  if(!file) return;
  showToast("Đang xử lý ảnh…");
  const reader = new FileReader();
  reader.onload = function(e){
    const img = new Image();
    img.onload = function(){
      const maxW = 1100;
      const scale = Math.min(1, maxW / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width*scale); canvas.height = Math.round(img.height*scale);
      canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
      const base64 = dataUrl.split(",")[1];
      savePhoto(plate, slot, base64, "image/jpeg");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
async function savePhoto(plate, slot, base64, mimeType){
  showToast("Đang tải ảnh lên Google Drive…");
  try{
    await apiPost("uploadPhoto", { plate, slot, base64Data: base64, mimeType });
    await loadData();
    showToast("Đã lưu ảnh");
    render();
  }catch(e){
    showToast("Lỗi tải ảnh: " + (e && e.message ? e.message : e));
  }
}
async function removePhotoUI(plate, slot){
  try{
    await apiPost("deletePhoto", { plate, slot });
    await loadData();
    showToast("Đã xóa ảnh");
    render();
  }catch(e){
    showToast("Lỗi xóa ảnh");
  }
}
function openLightbox(plate, slotKey){
  const v = vehicles.find(x=>x.BienSo===plate);
  const src = v && v["Photo_"+slotKey];
  if(!src) return;
  const slotInfo = PHOTO_SLOTS.find(s=>s.key===slotKey);
  document.getElementById("lightboxRoot").innerHTML = `
    <div class="lightbox" onclick="closeLightbox()">
      <div class="lb-close" onclick="closeLightbox()">✕</div>
      <img src="${src}" alt="${slotInfo?slotInfo.label:''}">
      <div class="lb-label">${plate} — ${slotInfo?slotInfo.label:''}</div>
    </div>`;
}
function closeLightbox(){ document.getElementById("lightboxRoot").innerHTML = ""; }

// ============================================================= EXPORT EXCEL (backup)
function buildOverviewSheet(list){
  const header=["Biển số","Hiệu xe","Loại xe","Chủ sở hữu","Ngày kiểm định","Hạn đăng kiểm","Ngày mua bảo hiểm","Hạn bảo hiểm","Km hiện tại","Ngày cập nhật km","Km BD cấp 1","Km BD cấp 2","Định mức nhiên liệu"];
  const rows = list.map(v=>[v.BienSo,v.hieu,v.loai,v.chusohuu,
    v.DangKiemNgay?fmtDate(v.DangKiemNgay):"", v.DangKiemHetHan?fmtDate(v.DangKiemHetHan):"",
    v.BaoHiemNgay?fmtDate(v.BaoHiemNgay):"", v.BaoHiemHetHan?fmtDate(v.BaoHiemHetHan):"",
    v.KmHienTai||"", v.KmNgayCapNhat?fmtDate(v.KmNgayCapNhat):"", v.KmBD1||"", v.KmBD2||"", v.dinhmuc]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  ws["!cols"] = header.map(()=>({wch:20}));
  return ws;
}
function buildVehicleSheet(v){
  const g = GROUP_INFO[v.nhom];
  const aoa = [[`XE ${v.BienSo} — ${v.hieu} ${v.loai}`],[],
    ["TÌNH TRẠNG HIỆN TẠI"],
    ["Ngày kiểm định gần nhất", v.DangKiemNgay?fmtDate(v.DangKiemNgay):"(chưa cập nhật)"],
    ["Hạn đăng kiểm", v.DangKiemHetHan?fmtDate(v.DangKiemHetHan):"(chưa cập nhật)"],
    ["Ngày mua bảo hiểm", v.BaoHiemNgay?fmtDate(v.BaoHiemNgay):"(chưa cập nhật)"],
    ["Hạn bảo hiểm", v.BaoHiemHetHan?fmtDate(v.BaoHiemHetHan):"(chưa cập nhật)"],
    ["Km hiện tại", v.KmHienTai||"(chưa cập nhật)"],
    ["Km bảo dưỡng cấp 1 gần nhất", v.KmBD1||"(chưa cập nhật)"],
    ["Km bảo dưỡng cấp 2 gần nhất", v.KmBD2||"(chưa cập nhật)"],
    ["Ngưỡng bảo dưỡng cấp 1/2", `${g.cap1} km / ${g.cap2} km — ${g.label}`],
    ["Định mức nhiên liệu", v.dinhmuc],[],
    ["THÔNG TIN ĐĂNG KÝ XE"]];
  (v.dangky||[]).forEach(r=>aoa.push(r));
  aoa.push([],["THÔNG SỐ KỸ THUẬT"]);
  (v.thongso||[]).forEach(r=>aoa.push(r));
  if(v.the_chap){ aoa.push([],["TÌNH TRẠNG THẾ CHẤP"]); v.the_chap.forEach(r=>aoa.push(r)); }
  if(v.ghichu_full){ aoa.push([],["GHI CHÚ", v.ghichu_full]); }
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{wch:32},{wch:55}];
  return ws;
}
function safeSheetName(name){ return name.replace(/[\\/?*\[\]:]/g,"_").slice(0,31); }
function exportExcel(plate){
  try{
    const list = plate ? vehicles.filter(v=>v.BienSo===plate) : vehicles;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, buildOverviewSheet(vehicles), "Tong hop");
    list.forEach(v=>XLSX.utils.book_append_sheet(wb, buildVehicleSheet(v), safeSheetName(v.BienSo)));
    const fname = plate ? `Backup_${plate.replace(/[^\w-]/g,"_")}_${todayStr()}.xlsx` : `Backup_TatCaXe_DienLucHamTan_${todayStr()}.xlsx`;
    XLSX.writeFile(wb, fname);
    showToast("Đã tải file Excel backup");
  }catch(e){ showToast("Không tạo được file Excel"); }
}

// ============================================================= SHELL
function render(){
  const isHome = currentView.screen === "home";
  document.getElementById("app").innerHTML = `
    <header class="topbar">
      <div class="back-row">
        ${isHome? "": `<div class="icon-btn" onclick="goHome()">←</div>`}
        <div>
          <div class="eyebrow">Điện lực Hàm Tân</div>
          <h1>${isHome? "Quản lý xe ô tô": currentView.plate}</h1>
          <div class="sub">${isHome? "Cảnh báo đăng kiểm · bảo hiểm · bảo dưỡng định kỳ": "Chi tiết xe & cập nhật thông tin"}</div>
        </div>
      </div>
      <div class="synced"><span class="dotpulse"></span>Dữ liệu lưu trên Google Sheet/Drive — mọi tài xế cùng xem, cùng cập nhật</div>
    </header>
    <main>${isHome? renderHome(): renderDetail()}</main>
  `;
  if (isHome && vehicles.length === 0) {
    showDebugInfo();
  }
}
async function showDebugInfo(){
  const box = document.getElementById("debugBox");
  if(!box) return;
  box.innerHTML = `<div class="note" style="text-align:center;">Đang lấy thông tin chẩn đoán…</div>`;
  try{
    const info = await apiGet("debug");
    if (info.ok) {
      box.innerHTML = `
        <div class="panel" style="border-color:#F0C36D;background:#FFFDF6;">
          <h3 style="color:#B5670A;"><span class="n" style="background:#FCEFD9;color:#B5670A;">i</span>Thông tin chẩn đoán (chưa thấy xe nào)</h3>
          <div class="status-row"><span class="lab">Spreadsheet đang đọc (qua đúng hàm getSheet_)</span><span class="val"><a href="${info.spreadsheetUrl}" target="_blank">${info.spreadsheetId.slice(0,14)}...</a></span></div>
          <div class="status-row"><span class="lab">Tên sheet</span><span class="val">${info.sheetName}</span></div>
          <div class="status-row"><span class="lab">Tổng số dòng (kể cả tiêu đề)</span><span class="val">${info.totalRows}</span></div>
          <div class="status-row"><span class="lab">Số dòng dữ liệu xe đọc được</span><span class="val">${info.dataRowCount}</span></div>
          <div class="note" style="margin-top:8px;"><b>Dòng tiêu đề:</b><br><pre style="white-space:pre-wrap;font-size:11px;background:#fff;padding:8px;border-radius:6px;">${JSON.stringify(info.headers)}</pre></div>
          <div class="note"><b>Dòng dữ liệu đầu tiên đọc được:</b><br><pre style="white-space:pre-wrap;font-size:11px;background:#fff;padding:8px;border-radius:6px;">${JSON.stringify(info.firstDataRow)}</pre></div>
          <div class="note" style="margin-top:8px;">Chụp lại toàn bộ khối này (kéo xuống hết) gửi để được hỗ trợ.</div>
        </div>`;
    } else {
      box.innerHTML = `<div class="panel" style="border-color:#F0C36D;"><div class="note" style="color:#B3241C;">Lỗi lấy chẩn đoán: ${info.message}<br><pre style="white-space:pre-wrap;font-size:11px;">${info.stack||''}</pre></div></div>`;
    }
  }catch(e){
    box.innerHTML = `<div class="panel"><div class="note" style="color:#B3241C;">Không gọi được debug: ${e && e.message ? e.message : e}</div></div>`;
  }
}

// ============================================================= INIT
(async function init(){
  const app = document.getElementById("app");
  if (!API_URL) {
    app.innerHTML = `<main style="padding:30px 18px;text-align:left;color:#B3241C;">
      <div style="font-weight:800;margin-bottom:8px;">Chưa cấu hình API_URL</div>
      <div class="note">Điền link Web App (Code_HamTan.gs) vào <code>config.js</code> rồi tải lại trang.</div>
    </main>`;
    return;
  }
  app.innerHTML = `<main style="padding:40px 20px;text-align:center;color:#5B6472;">Đang tải dữ liệu từ Google Sheet…</main>`;
  try{
    await loadData();
    render();
  }catch(e){
    app.innerHTML = `<main style="padding:30px 18px;text-align:left;color:#B3241C;">
      <div style="font-weight:800;margin-bottom:8px;">Lỗi tải dữ liệu:</div>
      <pre style="white-space:pre-wrap;word-break:break-word;background:#FBE6E4;padding:12px;border-radius:8px;font-size:12px;">${(e && e.message) ? e.message : e}</pre>
      <div style="margin-top:10px;color:#5B6472;font-size:12px;">Chụp màn hình đúng đoạn chữ đỏ ở trên gửi lại để được hỗ trợ chính xác.</div>
    </main>`;
  }
})();
