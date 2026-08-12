(function () {
"use strict";

/* ==========================================================================
   Constants & helpers
   ========================================================================== */
var STORAGE_KEY = "congxa-pcld-v2";
var DAY = 86400000;

var VEHICLE_TYPES = [
  "Xe con 5 chỗ", "Xe con 7 chỗ", "Xe con 8-9 chỗ", "Xe khách 16 chỗ",
  "Xe bán tải", "Xe tải thùng kín", "Xe tải cẩu (gầu)"
];
var LICENSE_CLASSES = ["B2", "C", "D", "FC"];

var VEHICLE_STATUS = {
  active:      { label: "Đang hoạt động", tone: "success" },
  maintenance: { label: "Đang bảo dưỡng", tone: "warning" },
  stopped:     { label: "Ngừng sử dụng",  tone: "danger" }
};
var DRIVER_STATUS = {
  active:   { label: "Đang làm việc", tone: "success" },
  inactive: { label: "Tạm nghỉ",      tone: "muted" }
};
var SERVICE_TYPES = ["Bảo dưỡng định kỳ", "Sửa chữa"];
var INSPECTION_TYPE = "Đăng kiểm";

function uid(prefix) {
  return prefix + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function addDays(base, n) {
  return new Date(base.getTime() + n * DAY);
}
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function fmtDate(iso) {
  if (!iso) return "—";
  var d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
function fmtCurrency(n) {
  return (Number(n) || 0).toLocaleString("vi-VN") + " ₫";
}
function fmtKm(n) {
  return (Number(n) || 0).toLocaleString("vi-VN") + " km";
}
function daysUntil(iso) {
  var target = new Date(iso + "T00:00:00");
  var today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / DAY);
}
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function initials(name) {
  var parts = String(name || "").trim().split(/\s+/);
  return ((parts[0] || "")[0] || "") .concat((parts[parts.length - 1] || "")[0] || "").toUpperCase();
}
function badge(tone, label) {
  return '<span class="badge-pill badge-' + tone + '">' + escapeHtml(label) + "</span>";
}
function monthLabel(d) {
  return "Th " + (d.getMonth() + 1);
}

/* ==========================================================================
   Seed data — generated relative to "today" so the demo always looks fresh
   ========================================================================== */
function buildSeedData() {
  // Dữ liệu xe thật, trích xuất từ hồ sơ cập nhật của Văn phòng PCLĐ:
  // "2026.08.07 Cap nhat Ho so xe VP_Co so 2.xlsx" (Cơ sở 2 — PC Bình Thuận, 9 xe)
  // "Backup_TatCaXe_VP Cong CS3_2026-08-06.xlsx" (Cơ sở 3 — PC Đắk Nông / PC Lâm Đồng, 6 xe)
  // Lưu ý: xe 48A-088.82 — tab gốc trong file ghi "48A-088.92", nhưng dòng tiêu đề và
  // bảng tổng hợp trong cùng file đều ghi "48A-088.82" — đã dùng bản ghi đa số, cần đối chiếu lại cà-vẹt.
  var vehicles = [
    { id: "v1", plate: "86H-0711", type: "Xe con 8-9 chỗ", brand: "Toyota Land Cruiser", year: 2001, odo: 462820, status: "active", regExpiry: "2026-05-13", lastInspection: "2025-05-14", insuranceStart: "2026-06-30", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Bình Thuận", site: "CS2", fuelNorm: "24 lít/100km", note: "Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 450.102 km, cấp 2 ở 456.314 km (ngưỡng 5.000 km / 30.000 km — Xe con)." },
    { id: "v2", plate: "86A-016.98", type: "Xe con 7 chỗ", brand: "Toyota Fortuner", year: 2013, odo: 349697, status: "active", regExpiry: "2026-08-12", lastInspection: "2025-09-12", insuranceStart: "2026-06-30", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Bình Thuận", site: "CS2", fuelNorm: "17 lít/100km", note: "Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 337.190 km, cấp 2 ở 343.490 km (ngưỡng 5.000 km / 30.000 km — Xe con)." },
    { id: "v3", plate: "86A-275.58", type: "Xe con 7 chỗ", brand: "Toyota Fortuner", year: 2023, odo: 76000, status: "active", regExpiry: "2026-12-28", lastInspection: "2023-12-29", insuranceStart: "2026-06-30", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Bình Thuận", site: "CS2", fuelNorm: "17 lít/100km", note: "Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 72.508 km, cấp 2 ở 67.320 km (ngưỡng 5.000 km / 30.000 km — Xe con)." },
    { id: "v4", plate: "86H-3885", type: "Xe bán tải", brand: "Isuzu D-Max", year: 2008, odo: 30038, status: "active", regExpiry: "2026-09-09", lastInspection: "2026-10-03", insuranceStart: "2026-06-30", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Bình Thuận", site: "CS2", fuelNorm: "14 lít/100km", note: "Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 28.113 km, cấp 2 ở 19.985 km (ngưỡng 5.000 km / 30.000 km — Xe con/ Xe bán tải)." },
    { id: "v5", plate: "86C-031.86", type: "Xe tải thùng kín", brand: "Isuzu NPR85LK Cab", year: 2013, odo: 126429, status: "active", regExpiry: "2026-08-24", lastInspection: "2026-02-25", insuranceStart: "2026-06-30", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Bình Thuận", site: "CS2", fuelNorm: "19 lít/100km", note: "Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 124.861 km, cấp 2 ở 120.684 km (ngưỡng 4.000 km / 80.000 km — Xe con / Xe tải)." },
    { id: "v6", plate: "86A-181.81", type: "Xe con 7 chỗ", brand: "Hyundai Santa Fe", year: 2020, odo: 99839, status: "active", regExpiry: "2028-04-18", lastInspection: "2026-10-19", insuranceStart: "2026-06-30", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Bình Thuận", site: "CS2", fuelNorm: "15 lít/100km", note: "Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 89.372 km, cấp 2 ở 95.172 km (ngưỡng 5.000 km / 30.000 km — Xe con)." },
    { id: "v7", plate: "86B-014.73", type: "Xe khách 16 chỗ", brand: "Hyundai Solati", year: 2019, odo: 86449, status: "active", regExpiry: "2027-01-07", lastInspection: "2026-07-08", insuranceStart: "2026-06-30", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Bình Thuận", site: "CS2", fuelNorm: "17 lít/100km", note: "Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 77.119 km, cấp 2 ở 81.714 km (ngưỡng 5.000 km / 30.000 km — Xe ô tô 04 đến 16 chỗ)." },
    { id: "v8", plate: "86A-015.56", type: "Xe con 5 chỗ", brand: "Honda Civic", year: 2013, odo: 273028, status: "active", regExpiry: "2026-12-03", lastInspection: "2025-12-04", insuranceStart: "2026-06-30", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Bình Thuận", site: "CS2", fuelNorm: "12 lít/100km", note: "Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 272.886 km, cấp 2 ở 265.791 km (ngưỡng 5.000 km / 30.000 km — Xe con)." },
    { id: "v9", plate: "86A-086.15", type: "Xe con 7 chỗ", brand: "Nissan X-Trail", year: 2018, odo: 149817, status: "active", regExpiry: "2027-03-17", lastInspection: "2026-03-18", insuranceStart: "2026-06-30", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Bình Thuận", site: "CS2", fuelNorm: "16 lít/100km", note: "Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 141.888 km, cấp 2 ở 134.965 km (ngưỡng 5.000 km / 80.000 km — Xe con)." },
    { id: "v10", plate: "48A-088.82", type: "Xe con 7 chỗ", brand: "Nissan X-Trail", year: 2019, odo: 121216, status: "active", regExpiry: "2027-11-04", lastInspection: "2025-11-05", insuranceStart: "2026-01-31", insuranceExpiry: "2027-01-30", driverId: "", owner: "Công ty Điện lực Đắk Nông", site: "CS3", fuelNorm: "16 lít/100km", note: "Đăng ký tại: Số 02 Lê Duẩn, phường Nghĩa Tân, TP Gia Nghĩa, tỉnh Đắk Nông. Bảo dưỡng gần nhất: cấp 1 ở 120.000 km, cấp 2 ở 120.000 km (ngưỡng 5.000 km / 30.000 km — Xe con)." },
    { id: "v11", plate: "49A-995.16", type: "Xe khách 16 chỗ", brand: "Ford Transit", year: 2018, odo: 295330, status: "active", regExpiry: "2026-10-13", lastInspection: "2026-04-14", insuranceStart: "2025-12-31", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Lâm Đồng", site: "CS3", fuelNorm: "20 lít/100km", note: "Đăng ký tại: Số 02 Hùng Vương, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng. Bảo dưỡng gần nhất: cấp 1 ở 295.000 km, cấp 2 ở 270.000 km (ngưỡng 5.000 km / 30.000 km — Xe con)." },
    { id: "v12", plate: "49A-996.67", type: "Xe tải cẩu (gầu)", brand: "Hino FG8", year: 2016, odo: 142912, status: "active", regExpiry: "2026-12-22", lastInspection: "2026-06-23", insuranceStart: "2025-12-31", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Lâm Đồng", site: "CS3", fuelNorm: "27 lít/100km + 7 lít/giờ cẩu", note: "Đăng ký tại: Số 02 Hùng Vương, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng. Bảo dưỡng gần nhất: cấp 1 ở 140.000 km, cấp 2 ở 120.000 km (ngưỡng 4.000 km / 24.000 km — xe cẩu)." },
    { id: "v13", plate: "49B-172.35", type: "Xe con 7 chỗ", brand: "Mitsubishi Pajero", year: 2004, odo: 919636, status: "active", regExpiry: "2026-09-22", lastInspection: "2026-03-24", insuranceStart: "2025-12-31", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Lâm Đồng", site: "CS3", fuelNorm: "21 lít/100km", note: "Đăng ký tại: Số 02 Hùng Vương, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng. Bảo dưỡng gần nhất: cấp 1 ở 915.000 km, cấp 2 ở 900.000 km (ngưỡng 5.000 km / 30.000 km — Xe con)." },
    { id: "v14", plate: "49B-172.63", type: "Xe con 8-9 chỗ", brand: "Hyundai Starex", year: 2016, odo: 371699, status: "active", regExpiry: "2027-07-06", lastInspection: "2026-07-07", insuranceStart: "2025-12-31", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Lâm Đồng", site: "CS3", fuelNorm: "18 lít/100km", note: "Đăng ký tại: Số 02 Hùng Vương, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng. Bảo dưỡng gần nhất: cấp 1 ở 370.000 km, cấp 2 ở 360.000 km (ngưỡng 5.000 km / 30.000 km — Xe con)." },
    { id: "v15", plate: "49B-173.07", type: "Xe con 5 chỗ", brand: "Toyota Camry", year: 2010, odo: 470178, status: "active", regExpiry: "2027-03-10", lastInspection: "2026-03-11", insuranceStart: "2025-12-31", insuranceExpiry: "2026-12-31", driverId: "", owner: "Công ty Điện lực Lâm Đồng", site: "CS3", fuelNorm: "20 lít/100km", note: "Đăng ký tại: Số 02 Hùng Vương, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng. Bảo dưỡng gần nhất: cấp 1 ở 470.000 km, cấp 2 ở 450.000 km (ngưỡng 5.000 km / 30.000 km — Xe con)." }
  ];

  // Chưa có dữ liệu lái xe / bảo dưỡng / kiểm định thật — để trống, tự nhập qua giao diện.
  var drivers = [];
  var maintenance = [];

  return { vehicles: vehicles, drivers: drivers, maintenance: maintenance };
}

/* ==========================================================================
   Persistence
   ========================================================================== */
// API_URL trống -> chỉ lưu trên máy (localStorage). Có URL (điền trong config.js,
// trỏ tới một Google Apps Script Web App) -> đọc/ghi vào nguồn dữ liệu dùng chung.
var API_URL = (typeof window !== "undefined" && window.APP_CONFIG && window.APP_CONFIG.API_URL) || "";
var SHEET_VEHICLES = "Vehicles";
var SHEET_DRIVERS = "Drivers";
var SHEET_MAINTENANCE = "Maintenance";

var DB = { vehicles: [], drivers: [], maintenance: [] };

function loadLocal() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* corrupt cache, ignore */ }
  return null;
}
function saveLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DB));
}

function apiFetchAll() {
  return fetch(API_URL).then(function (r) { return r.json(); });
}
function apiUpsert(sheet, record) {
  if (!API_URL) return Promise.resolve();
  return fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ sheet: sheet, action: "upsert", record: record })
  }).then(function (r) { return r.json(); }).then(function (res) {
    if (!res.success) throw new Error(res.error || "Lưu thất bại");
  });
}
function apiDelete(sheet, id) {
  if (!API_URL) return Promise.resolve();
  return fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ sheet: sheet, action: "delete", id: id })
  }).then(function (r) { return r.json(); }).then(function (res) {
    if (!res.success) throw new Error(res.error || "Xoá thất bại");
  });
}
function onSyncError(err) {
  toast("Không đồng bộ được với dữ liệu dùng chung (" + (err && err.message ? err.message : "lỗi mạng") + "). Thay đổi đã lưu tạm trên máy này.", "danger");
}

function persistVehicle(rec) { saveLocal(); apiUpsert(SHEET_VEHICLES, rec).catch(onSyncError); }
function persistVehicleDelete(id) { saveLocal(); apiDelete(SHEET_VEHICLES, id).catch(onSyncError); }
function persistDriver(rec) { saveLocal(); apiUpsert(SHEET_DRIVERS, rec).catch(onSyncError); }
function persistDriverDelete(id) { saveLocal(); apiDelete(SHEET_DRIVERS, id).catch(onSyncError); }
function persistMaintenance(rec) { saveLocal(); apiUpsert(SHEET_MAINTENANCE, rec).catch(onSyncError); }
function persistMaintenanceDelete(id) { saveLocal(); apiDelete(SHEET_MAINTENANCE, id).catch(onSyncError); }

function refreshFromServer(callback) {
  if (!API_URL) { if (callback) callback(); return; }
  apiFetchAll().then(function (data) {
    DB.vehicles = data.vehicles || [];
    DB.drivers = data.drivers || [];
    DB.maintenance = data.maintenance || [];
    saveLocal();
    if (callback) callback();
  }).catch(function () { if (callback) callback(); });
}

function renderSyncStatus() {
  var el = $("#syncStatus");
  if (!el) return;
  el.innerHTML = API_URL
    ? badge("success", "Đồng bộ dữ liệu chung")
    : badge("muted", "Chỉ lưu trên máy này");
}

function getVehicle(id) { return DB.vehicles.find(function (v) { return v.id === id; }); }
function getDriver(id) { return DB.drivers.find(function (dr) { return dr.id === id; }); }

/* ==========================================================================
   Global UI state
   ========================================================================== */
var state = { view: "vehicles", lastFocused: null };

var $ = function (sel, root) { return (root || document).querySelector(sel); };
var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

/* ==========================================================================
   Toast
   ========================================================================== */
function toast(message, tone) {
  var stack = $("#toastStack");
  var el = document.createElement("div");
  el.className = "toast" + (tone ? " toast-" + tone : "");
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(function () {
    el.style.transition = "opacity .2s ease";
    el.style.opacity = "0";
    setTimeout(function () { el.remove(); }, 200);
  }, 2600);
}

/* ==========================================================================
   Modal
   ========================================================================== */
function openModal(title, bodyHtml, onMount) {
  state.lastFocused = document.activeElement;
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHtml;
  $("#modalBackdrop").hidden = false;
  if (typeof onMount === "function") onMount($("#modalBody"));
  var firstField = $("#modalBody [autofocus]") || $("#modalBody input, #modalBody select, #modalBody textarea, #modalBody button");
  if (firstField) firstField.focus();
}
function closeModal() {
  $("#modalBackdrop").hidden = true;
  $("#modalBody").innerHTML = "";
  if (state.lastFocused && typeof state.lastFocused.focus === "function") state.lastFocused.focus();
}
$("#modalClose").addEventListener("click", closeModal);
$("#modalBackdrop").addEventListener("click", function (e) { if (e.target === $("#modalBackdrop")) closeModal(); });
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (!$("#modalBackdrop").hidden) closeModal();
    if (!$("#notifPanel").hidden) toggleNotif(false);
  }
});

/* ==========================================================================
   Charts (dependency-free inline SVG)
   ========================================================================== */
function renderBarChart(container, points, opts) {
  opts = opts || {};
  var w = 560, h = 220, padL = 8, padR = 8, padB = 26, padT = 18;
  var max = Math.max.apply(null, points.map(function (p) { return p.value; }).concat([1]));
  var innerW = w - padL - padR;
  var innerH = h - padT - padB;
  var n = points.length;
  var gap = 14;
  var barW = (innerW - gap * (n - 1)) / n;

  var svg = '<svg class="bar-chart" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Biểu đồ cột">';
  [0.25, 0.5, 0.75, 1].forEach(function (f) {
    var y = padT + innerH * (1 - f);
    svg += '<line class="grid-line" x1="' + padL + '" y1="' + y + '" x2="' + (w - padR) + '" y2="' + y + '" />';
  });
  points.forEach(function (p, i) {
    var bh = max ? (p.value / max) * innerH : 0;
    var x = padL + i * (barW + gap);
    var y = padT + innerH - bh;
    svg += '<rect class="bar" x="' + x + '" y="' + y + '" width="' + barW + '" height="' + Math.max(bh, 1) + '" rx="3"></rect>';
    svg += '<text class="bar-value" x="' + (x + barW / 2) + '" y="' + (y - 5) + '" text-anchor="middle">' + (opts.valueFormatter ? opts.valueFormatter(p.value) : p.value) + '</text>';
    svg += '<text class="bar-label" x="' + (x + barW / 2) + '" y="' + (h - 6) + '" text-anchor="middle">' + escapeHtml(p.label) + '</text>';
  });
  svg += "</svg>";
  container.innerHTML = svg;
}

function renderDonutChart(container, segments) {
  var total = segments.reduce(function (s, seg) { return s + seg.value; }, 0) || 1;
  var size = 168, r = 62, cx = size / 2, cy = size / 2, stroke = 24;
  var circumference = 2 * Math.PI * r;
  var offset = 0;
  var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="Biểu đồ tròn cơ cấu trạng thái xe">';
  svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--color-muted)" stroke-width="' + stroke + '"></circle>';
  segments.forEach(function (seg) {
    var frac = seg.value / total;
    var len = frac * circumference;
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + seg.color + '" stroke-width="' + stroke +
      '" stroke-dasharray="' + len + ' ' + (circumference - len) + '" stroke-dashoffset="' + (-offset) +
      '" transform="rotate(-90 ' + cx + ' ' + cy + ')"></circle>';
    offset += len;
  });
  svg += '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" class="donut-total" font-size="22" fill="var(--color-fg)">' + total + '</text>';
  svg += '<text x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle" font-size="10.5" fill="var(--color-muted-fg)">tổng số xe</text>';
  svg += "</svg>";

  var legend = '<div class="donut-legend">' + segments.map(function (seg) {
    return '<div class="donut-legend-item"><span class="donut-legend-dot" style="background:' + seg.color + '"></span>' + escapeHtml(seg.label) + ' · ' + seg.value + '</div>';
  }).join("") + "</div>";

  container.innerHTML = '<div style="display:flex;align-items:center;">' + svg + legend + "</div>";
}

/* ==========================================================================
   Last N months bucketing (maintenance costs)
   ========================================================================== */
function lastMonths(n) {
  var out = [];
  var now = new Date();
  for (var i = n - 1; i >= 0; i--) {
    var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(d);
  }
  return out;
}
function inSameMonth(iso, ref) {
  var d = new Date(iso + "T00:00:00");
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

/* ==========================================================================
   Notifications (upcoming / overdue registration, license, insurance, maintenance)
   ========================================================================== */
function collectAlerts() {
  var items = [];
  DB.vehicles.forEach(function (v) {
    var du = daysUntil(v.regExpiry);
    if (du <= 30) items.push({ due: du, icon: "ic-truck", title: v.plate + " — hạn đăng kiểm", detail: (du < 0 ? "Quá hạn " + (-du) + " ngày" : du === 0 ? "Hết hạn hôm nay" : "Còn " + du + " ngày") });
    if (v.insuranceExpiry) {
      var iu = daysUntil(v.insuranceExpiry);
      if (iu <= 30) items.push({ due: iu, icon: "ic-id", title: v.plate + " — hạn bảo hiểm", detail: (iu < 0 ? "Quá hạn " + (-iu) + " ngày" : iu === 0 ? "Hết hạn hôm nay" : "Còn " + iu + " ngày") });
    }
  });
  DB.drivers.forEach(function (dr) {
    var du = daysUntil(dr.licenseExpiry);
    if (du <= 30) items.push({ due: du, icon: "ic-id", title: dr.name + " — hạn bằng lái", detail: (du < 0 ? "Quá hạn " + (-du) + " ngày" : du === 0 ? "Hết hạn hôm nay" : "Còn " + du + " ngày") });
  });
  DB.maintenance.forEach(function (m) {
    if (!m.nextDue) return;
    var du = daysUntil(m.nextDue);
    if (du <= 30) {
      var v = getVehicle(m.vehicleId);
      items.push({ due: du, icon: "ic-wrench", title: (v ? v.plate : "?") + " — " + m.type.toLowerCase(), detail: (du < 0 ? "Quá hạn " + (-du) + " ngày" : du === 0 ? "Hết hạn hôm nay" : "Còn " + du + " ngày") });
    }
  });
  items.sort(function (a, b) { return a.due - b.due; });
  return items;
}

function renderUnitScope() {
  var sites = Array.from(new Set(DB.vehicles.map(function (v) { return v.site; }).filter(Boolean))).sort();
  var el = $("#unitScope");
  if (!el) return;
  el.textContent = (sites.length ? sites.join(" · ") : "Chưa phân cơ sở") + " — " + DB.vehicles.length + " xe";
}

function renderNotif() {
  var alerts = collectAlerts();
  var countEl = $("#notifCount");
  if (alerts.length) { countEl.hidden = false; countEl.textContent = alerts.length > 9 ? "9+" : alerts.length; }
  else { countEl.hidden = true; }

  var panel = $("#notifPanel");
  if (!alerts.length) {
    panel.innerHTML = '<h3>Thông báo</h3><p class="notif-empty">Không có cảnh báo nào.</p>';
    return;
  }
  panel.innerHTML = '<h3>Cảnh báo sắp đến hạn</h3>' + alerts.slice(0, 10).map(function (a) {
    var tone = a.due < 0 ? "danger" : a.due <= 7 ? "warning" : "info";
    return '<div class="notif-item"><svg class="icon" style="color:var(--color-' + tone + ')"><use href="#' + a.icon + '"/></svg>' +
      '<div><p>' + escapeHtml(a.title) + '</p><small>' + escapeHtml(a.detail) + '</small></div></div>';
  }).join("");
}

function toggleNotif(force) {
  var panel = $("#notifPanel");
  var open = force !== undefined ? force : panel.hidden;
  panel.hidden = !open;
  $("#notifBtn").setAttribute("aria-expanded", String(open));
}
$("#notifBtn").addEventListener("click", function (e) { e.stopPropagation(); renderNotif(); toggleNotif(); });
document.addEventListener("click", function (e) {
  var panel = $("#notifPanel");
  if (!panel.hidden && !panel.contains(e.target) && e.target !== $("#notifBtn")) toggleNotif(false);
});

/* ==========================================================================
   Navigation
   ========================================================================== */
var PAGE_META = {
  vehicles: { title: "Danh sách xe", sub: "Hồ sơ và tình trạng toàn bộ đội xe" },
  drivers: { title: "Lái xe", sub: "Hồ sơ lái xe và phân công phương tiện" },
  maintenance: { title: "Bảo dưỡng", sub: "Lịch sử bảo dưỡng định kỳ và sửa chữa" },
  inspection: { title: "Kiểm định", sub: "Lịch sử đăng kiểm và hạn kiểm định" },
  reports: { title: "Báo cáo", sub: "Chi phí bảo dưỡng và tình trạng đội xe" }
};

function switchView(view) {
  state.view = view;
  $$(".view").forEach(function (v) { v.classList.toggle("is-active", v.dataset.view === view); });
  $$(".nav-item").forEach(function (b) { b.classList.toggle("is-active", b.dataset.view === view); });
  $("#pageTitle").textContent = PAGE_META[view].title;
  $("#pageSubtitle").textContent = PAGE_META[view].sub;
  closeSidebar();
  renderView(view);
  $("#content").scrollTo({ top: 0, behavior: "auto" });
  // Đồng bộ nền: nạp lại từ nguồn dữ liệu chung (nếu có cấu hình) để thấy thay đổi của người khác.
  refreshFromServer(function () {
    if (state.view === view) { renderView(view); renderNotif(); renderUnitScope(); }
  });
}
$$(".nav-item").forEach(function (btn) { btn.addEventListener("click", function () { switchView(btn.dataset.view); }); });

function openSidebar() { $("#sidebar").classList.add("is-open"); $("#scrim").classList.add("is-visible"); $("#menuToggle").setAttribute("aria-expanded", "true"); }
function closeSidebar() { $("#sidebar").classList.remove("is-open"); $("#scrim").classList.remove("is-visible"); $("#menuToggle").setAttribute("aria-expanded", "false"); }
$("#menuToggle").addEventListener("click", function () { $("#sidebar").classList.contains("is-open") ? closeSidebar() : openSidebar(); });
$("#scrim").addEventListener("click", closeSidebar);

function renderView(view) {
  if (view === "vehicles") renderVehicles();
  else if (view === "drivers") renderDrivers();
  else if (view === "maintenance") renderMaintenance();
  else if (view === "inspection") renderInspection();
  else if (view === "reports") renderReports();
}

/* ==========================================================================
   Vehicles
   ========================================================================== */
function vehicleRowHtml(v) {
  var st = VEHICLE_STATUS[v.status];
  var dr = getDriver(v.driverId);
  var du = daysUntil(v.regExpiry);
  var regTone = du < 0 ? "danger" : du <= 30 ? "warning" : "muted";
  var iu = v.insuranceExpiry ? daysUntil(v.insuranceExpiry) : null;
  var insTone = iu === null ? "muted" : iu < 0 ? "danger" : iu <= 30 ? "warning" : "muted";
  return '<tr data-id="' + v.id + '">' +
    '<td><button class="table-link" data-action="view-vehicle" data-id="' + v.id + '">' + escapeHtml(v.plate) + '</button><div class="cell-muted">' + escapeHtml(v.brand) + ' · ' + v.year + '</div></td>' +
    '<td>' + escapeHtml(v.type) + '</td>' +
    '<td class="cell-muted">' + escapeHtml(v.site || "—") + '</td>' +
    '<td>' + (dr ? escapeHtml(dr.name) : '<span class="cell-muted">Chưa phân công</span>') + '</td>' +
    '<td>' + badge(st.tone, st.label) + '</td>' +
    '<td><span class="badge-pill badge-' + regTone + '">' + fmtDate(v.regExpiry) + '</span></td>' +
    '<td>' + (v.insuranceExpiry ? '<span class="badge-pill badge-' + insTone + '">' + fmtDate(v.insuranceExpiry) + '</span>' : '<span class="cell-muted">—</span>') + '</td>' +
    '<td><div class="row-actions">' +
      '<button class="icon-btn btn-sm" data-action="edit-vehicle" data-id="' + v.id + '" aria-label="Sửa xe"><svg class="icon icon-sm"><use href="#ic-edit"/></svg></button>' +
      '<button class="icon-btn btn-sm" data-action="delete-vehicle" data-id="' + v.id + '" aria-label="Xoá xe"><svg class="icon icon-sm"><use href="#ic-trash"/></svg></button>' +
    '</div></td></tr>';
}

function populateSiteFilter() {
  var sel = $("#vehicleSiteFilter");
  var current = sel.value;
  var sites = Array.from(new Set(DB.vehicles.map(function (v) { return v.site; }).filter(Boolean))).sort();
  sel.innerHTML = '<option value="">Tất cả cơ sở</option>' + sites.map(function (s) {
    return '<option value="' + escapeHtml(s) + '"' + (s === current ? " selected" : "") + '>' + escapeHtml(s) + '</option>';
  }).join("");
}

function renderVehicles() {
  populateSiteFilter();
  var q = ($("#vehicleSearch").value || "").trim().toLowerCase();
  var statusFilter = $("#vehicleStatusFilter").value;
  var siteFilter = $("#vehicleSiteFilter").value;
  var list = DB.vehicles.filter(function (v) {
    var matchQ = !q || v.plate.toLowerCase().indexOf(q) > -1 || v.brand.toLowerCase().indexOf(q) > -1 || v.type.toLowerCase().indexOf(q) > -1;
    var matchS = !statusFilter || v.status === statusFilter;
    var matchSite = !siteFilter || v.site === siteFilter;
    return matchQ && matchS && matchSite;
  });

  var table = $("#vehicleTable");
  if (!list.length) {
    table.innerHTML = "";
    $("#vehicleEmpty").hidden = false;
  } else {
    $("#vehicleEmpty").hidden = true;
    table.innerHTML = '<thead><tr><th>Biển số / Hãng xe</th><th>Loại xe</th><th>Cơ sở</th><th>Lái xe phụ trách</th><th>Trạng thái</th><th>Hạn đăng kiểm</th><th>Hạn bảo hiểm</th><th></th></tr></thead>' +
      "<tbody>" + list.map(vehicleRowHtml).join("") + "</tbody>";
  }

  $$('[data-action="view-vehicle"], [data-action="edit-vehicle"]', table).forEach(function (btn) {
    btn.addEventListener("click", function () { openVehicleForm(btn.dataset.id); });
  });
  $$('[data-action="delete-vehicle"]', table).forEach(function (btn) {
    btn.addEventListener("click", function () { confirmDeleteVehicle(btn.dataset.id); });
  });
}
$("#vehicleSearch").addEventListener("input", debounce(renderVehicles, 150));
$("#vehicleStatusFilter").addEventListener("change", renderVehicles);
$("#vehicleSiteFilter").addEventListener("change", renderVehicles);

function driverOptionsHtml(selectedId) {
  return '<option value="">Chưa phân công</option>' + DB.drivers.map(function (dr) {
    return '<option value="' + dr.id + '"' + (dr.id === selectedId ? " selected" : "") + '>' + escapeHtml(dr.name) + '</option>';
  }).join("");
}

function openVehicleForm(id) {
  var v = id ? getVehicle(id) : null;
  var isEdit = !!v;
  var body =
    '<form id="vehicleForm" class="form-grid" novalidate>' +
      field("Biển số xe", '<input name="plate" required autofocus value="' + escapeHtml(v ? v.plate : "") + '" placeholder="86A-123.45">') +
      field("Cơ sở quản lý", '<input name="site" list="siteOptions" value="' + escapeHtml(v ? v.site : "") + '" placeholder="CS2">') +
      field("Chủ sở hữu (đăng ký)", '<input name="owner" value="' + escapeHtml(v ? v.owner : "") + '" placeholder="Công ty Điện lực…">') +
      field("Loại xe", '<select name="type" required>' + VEHICLE_TYPES.map(function (t) { return '<option' + (v && v.type === t ? " selected" : "") + '>' + t + '</option>'; }).join("") + '</select>') +
      field("Hãng &amp; dòng xe", '<input name="brand" required value="' + escapeHtml(v ? v.brand : "") + '" placeholder="Toyota Vios">') +
      field("Năm sản xuất", '<input name="year" type="number" min="1990" max="2100" required value="' + (v ? v.year : "") + '">') +
      field("Số km hiện tại", '<input name="odo" type="number" min="0" required value="' + (v ? v.odo : 0) + '">') +
      field("Trạng thái", '<select name="status" required>' + Object.keys(VEHICLE_STATUS).map(function (k) { return '<option value="' + k + '"' + (v && v.status === k ? " selected" : "") + '>' + VEHICLE_STATUS[k].label + '</option>'; }).join("") + '</select>') +
      field("Lái xe phụ trách", '<select name="driverId">' + driverOptionsHtml(v ? v.driverId : "") + '</select>') +
      field("Ngày kiểm định gần nhất", '<input name="lastInspection" type="date" value="' + (v ? v.lastInspection : "") + '">') +
      field("Hạn đăng kiểm", '<input name="regExpiry" type="date" required value="' + (v ? v.regExpiry : "") + '">') +
      field("Ngày mua bảo hiểm", '<input name="insuranceStart" type="date" value="' + (v ? v.insuranceStart : "") + '">') +
      field("Hạn bảo hiểm", '<input name="insuranceExpiry" type="date" value="' + (v ? v.insuranceExpiry : "") + '">') +
      field("Định mức nhiên liệu", '<input name="fuelNorm" value="' + escapeHtml(v ? v.fuelNorm : "") + '" placeholder="17 lít/100km">') +
      field("Ghi chú", '<textarea name="note" placeholder="Ghi chú thêm (không bắt buộc)">' + escapeHtml(v ? v.note : "") + '</textarea>', true) +
      '<datalist id="siteOptions">' + Array.from(new Set(DB.vehicles.map(function (x) { return x.site; }).filter(Boolean))).map(function (s) { return '<option value="' + escapeHtml(s) + '">'; }).join("") + '</datalist>' +
      '<div class="form-actions full">' +
        (isEdit ? '<button type="button" class="btn btn-danger" id="vehicleDeleteBtn">Xoá xe</button>' : "") +
        '<button type="button" class="btn btn-ghost" id="vehicleCancelBtn">Huỷ</button>' +
        '<button type="submit" class="btn btn-primary">' + (isEdit ? "Lưu thay đổi" : "Thêm xe") + '</button>' +
      '</div>' +
    '</form>';

  openModal(isEdit ? "Hồ sơ xe · " + v.plate : "Thêm xe mới", body, function (root) {
    $("#vehicleCancelBtn", root).addEventListener("click", closeModal);
    if (isEdit) $("#vehicleDeleteBtn", root).addEventListener("click", function () { closeModal(); confirmDeleteVehicle(v.id); });
    $("#vehicleForm", root).addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var rec = {
        id: v ? v.id : uid("v"),
        plate: f.get("plate").trim(),
        type: f.get("type"),
        brand: f.get("brand").trim(),
        year: Number(f.get("year")),
        odo: Number(f.get("odo")),
        status: f.get("status"),
        regExpiry: f.get("regExpiry"),
        lastInspection: f.get("lastInspection") || "",
        insuranceStart: f.get("insuranceStart") || "",
        insuranceExpiry: f.get("insuranceExpiry") || "",
        driverId: f.get("driverId") || "",
        owner: (f.get("owner") || "").trim(),
        site: (f.get("site") || "").trim(),
        fuelNorm: (f.get("fuelNorm") || "").trim(),
        note: (f.get("note") || "").trim()
      };
      if (v) {
        var idx = DB.vehicles.findIndex(function (x) { return x.id === v.id; });
        DB.vehicles[idx] = rec;
      } else {
        DB.vehicles.push(rec);
      }
      persistVehicle(rec);
      closeModal();
      toast(isEdit ? "Đã cập nhật hồ sơ xe " + rec.plate : "Đã thêm xe " + rec.plate, "success");
      renderView(state.view);
      renderNotif();
      renderUnitScope();
    });
  });
}
function confirmDeleteVehicle(id) {
  var v = getVehicle(id);
  if (!v) return;
  if (!window.confirm('Xoá xe "' + v.plate + '" khỏi hệ thống? Thao tác này không thể hoàn tác.')) return;
  DB.vehicles = DB.vehicles.filter(function (x) { return x.id !== id; });
  persistVehicleDelete(id);
  toast("Đã xoá xe " + v.plate, "danger");
  renderView(state.view);
  renderUnitScope();
}
$("#content").addEventListener("click", function (e) {
  var btn = e.target.closest('[data-action="new-vehicle"]');
  if (btn) openVehicleForm(null);
});

function field(label, controlHtml, full) {
  return '<label class="form-field' + (full ? " full" : "") + '"><span>' + label + '</span>' + controlHtml + '</label>';
}

/* ==========================================================================
   Drivers
   ========================================================================== */
function driverCardHtml(dr) {
  var st = DRIVER_STATUS[dr.status];
  var vAssigned = DB.vehicles.find(function (v) { return v.driverId === dr.id; });
  var du = daysUntil(dr.licenseExpiry);
  var tone = du < 0 ? "danger" : du <= 30 ? "warning" : "muted";
  return '<div class="driver-card" data-id="' + dr.id + '">' +
    '<div class="driver-head"><span class="driver-avatar">' + initials(dr.name) + '</span>' +
      '<div><div class="driver-name">' + escapeHtml(dr.name) + '</div><div class="driver-role">' + badge(st.tone, st.label) + '</div></div></div>' +
    '<div class="driver-meta">' +
      '<div><svg class="icon"><use href="#ic-phone"/></svg>' + escapeHtml(dr.phone) + '</div>' +
      '<div><svg class="icon"><use href="#ic-id"/></svg>Hạng ' + dr.licenseClass + ' · hạn <span class="badge-pill badge-' + tone + '" style="margin-left:4px">' + fmtDate(dr.licenseExpiry) + '</span></div>' +
      '<div><svg class="icon"><use href="#ic-truck"/></svg>' + (vAssigned ? escapeHtml(vAssigned.plate) : "Chưa phân công xe") + '</div>' +
    '</div>' +
    '<div class="driver-foot">' +
      '<button class="link-btn" data-action="edit-driver" data-id="' + dr.id + '"><svg class="icon icon-sm"><use href="#ic-edit"/></svg> Sửa hồ sơ</button>' +
      '<button class="icon-btn btn-sm" data-action="delete-driver" data-id="' + dr.id + '" aria-label="Xoá lái xe"><svg class="icon icon-sm"><use href="#ic-trash"/></svg></button>' +
    '</div></div>';
}
function renderDrivers() {
  var q = ($("#driverSearch").value || "").trim().toLowerCase();
  var list = DB.drivers.filter(function (dr) { return !q || dr.name.toLowerCase().indexOf(q) > -1 || dr.phone.indexOf(q) > -1; });
  var grid = $("#driverGrid");
  grid.innerHTML = list.length ? list.map(driverCardHtml).join("") : '<p class="empty-state">Không tìm thấy lái xe phù hợp.</p>';
  $$('[data-action="edit-driver"]', grid).forEach(function (b) { b.addEventListener("click", function () { openDriverForm(b.dataset.id); }); });
  $$('[data-action="delete-driver"]', grid).forEach(function (b) { b.addEventListener("click", function () { confirmDeleteDriver(b.dataset.id); }); });
}
$("#driverSearch").addEventListener("input", debounce(renderDrivers, 150));

function vehicleOptionsForDriver(selectedId) {
  return '<option value="">Chưa phân công</option>' + DB.vehicles.map(function (v) {
    return '<option value="' + v.id + '"' + (v.id === selectedId ? " selected" : "") + '>' + escapeHtml(v.plate) + '</option>';
  }).join("");
}
function openDriverForm(id) {
  var dr = id ? getDriver(id) : null;
  var isEdit = !!dr;
  var assignedVehicle = dr ? DB.vehicles.find(function (v) { return v.driverId === dr.id; }) : null;
  var body =
    '<form id="driverForm" class="form-grid" novalidate>' +
      field("Họ và tên", '<input name="name" required autofocus value="' + escapeHtml(dr ? dr.name : "") + '">') +
      field("Số điện thoại", '<input name="phone" required pattern="[0-9]{9,11}" value="' + escapeHtml(dr ? dr.phone : "") + '" placeholder="09xxxxxxxx">') +
      field("Hạng bằng lái", '<select name="licenseClass" required>' + LICENSE_CLASSES.map(function (c) { return '<option' + (dr && dr.licenseClass === c ? " selected" : "") + '>' + c + '</option>'; }).join("") + '</select>') +
      field("Hạn bằng lái", '<input name="licenseExpiry" type="date" required value="' + (dr ? dr.licenseExpiry : "") + '">') +
      field("Trạng thái", '<select name="status" required>' + Object.keys(DRIVER_STATUS).map(function (k) { return '<option value="' + k + '"' + (dr && dr.status === k ? " selected" : "") + '>' + DRIVER_STATUS[k].label + '</option>'; }).join("") + '</select>') +
      field("Xe phụ trách", '<select name="vehicleId">' + vehicleOptionsForDriver(assignedVehicle ? assignedVehicle.id : "") + '</select>') +
      '<div class="form-actions full">' +
        (isEdit ? '<button type="button" class="btn btn-danger" id="driverDeleteBtn">Xoá lái xe</button>' : "") +
        '<button type="button" class="btn btn-ghost" id="driverCancelBtn">Huỷ</button>' +
        '<button type="submit" class="btn btn-primary">' + (isEdit ? "Lưu thay đổi" : "Thêm lái xe") + '</button>' +
      '</div>' +
    '</form>';

  openModal(isEdit ? "Hồ sơ lái xe · " + dr.name : "Thêm lái xe mới", body, function (root) {
    $("#driverCancelBtn", root).addEventListener("click", closeModal);
    if (isEdit) $("#driverDeleteBtn", root).addEventListener("click", function () { closeModal(); confirmDeleteDriver(dr.id); });
    $("#driverForm", root).addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var id = dr ? dr.id : uid("d");
      var rec = {
        id: id, name: f.get("name").trim(), phone: f.get("phone").trim(),
        licenseClass: f.get("licenseClass"), licenseExpiry: f.get("licenseExpiry"), status: f.get("status")
      };
      if (dr) { DB.drivers[DB.drivers.findIndex(function (x) { return x.id === id; })] = rec; }
      else { DB.drivers.push(rec); }

      var newVehicleId = f.get("vehicleId") || "";
      var changedVehicles = [];
      DB.vehicles.forEach(function (v) { if (v.driverId === id && v.id !== newVehicleId) { v.driverId = ""; changedVehicles.push(v); } });
      if (newVehicleId) {
        var target = getVehicle(newVehicleId);
        if (target && target.driverId !== id) { target.driverId = id; changedVehicles.push(target); }
      }
      persistDriver(rec);
      changedVehicles.forEach(function (v) { persistVehicle(v); });
      closeModal();
      toast(isEdit ? "Đã cập nhật hồ sơ " + rec.name : "Đã thêm lái xe " + rec.name, "success");
      renderView(state.view);
      renderNotif();
    });
  });
}
function confirmDeleteDriver(id) {
  var dr = getDriver(id);
  if (!dr) return;
  if (!window.confirm('Xoá lái xe "' + dr.name + '" khỏi hệ thống?')) return;
  DB.drivers = DB.drivers.filter(function (x) { return x.id !== id; });
  var affectedVehicles = DB.vehicles.filter(function (v) { return v.driverId === id; });
  affectedVehicles.forEach(function (v) { v.driverId = ""; });
  persistDriverDelete(id);
  affectedVehicles.forEach(function (v) { persistVehicle(v); });
  toast("Đã xoá lái xe " + dr.name, "danger");
  renderView(state.view);
}
document.addEventListener("click", function (e) { if (e.target.closest('[data-action="new-driver"]')) openDriverForm(null); });

/* ==========================================================================
   Maintenance (Bảo dưỡng định kỳ / Sửa chữa)
   ========================================================================== */
function serviceStatusMeta(m) {
  if (!m.nextDue) return { tone: "muted", label: "Đã hoàn thành" };
  var du = daysUntil(m.nextDue);
  if (du < 0) return { tone: "danger", label: "Quá hạn " + (-du) + " ngày" };
  if (du <= 30) return { tone: "warning", label: "Còn " + du + " ngày" };
  return { tone: "success", label: "Còn hạn" };
}
function allVehicleOptions(selectedId) {
  return DB.vehicles.map(function (v) { return '<option value="' + v.id + '"' + (v.id === selectedId ? " selected" : "") + '>' + escapeHtml(v.plate) + '</option>'; }).join("");
}
function maintenanceRowHtml(m, dateLabel) {
  var v = getVehicle(m.vehicleId), st = serviceStatusMeta(m);
  return '<tr><td class="cell-primary">' + (v ? escapeHtml(v.plate) : "—") + '</td><td>' + escapeHtml(m.type) + '</td>' +
    '<td class="cell-muted">' + fmtDate(m.date) + '</td><td class="cell-muted">' + fmtKm(m.odo) + '</td>' +
    '<td>' + fmtCurrency(m.cost) + '</td><td class="cell-muted">' + (m.nextDue ? fmtDate(m.nextDue) : "—") + '</td>' +
    '<td>' + badge(st.tone, st.label) + '</td>' +
    '<td><div class="row-actions"><button class="icon-btn btn-sm" data-action="delete-maint" data-id="' + m.id + '" aria-label="Xoá"><svg class="icon icon-sm"><use href="#ic-trash"/></svg></button></div></td></tr>';
}
function renderMaintenance() {
  var list = DB.maintenance.filter(function (m) { return m.type !== INSPECTION_TYPE; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  var table = $("#serviceTable");
  if (!list.length) {
    table.innerHTML = "";
    $("#serviceEmpty").hidden = false;
  } else {
    $("#serviceEmpty").hidden = true;
    table.innerHTML = '<thead><tr><th>Xe</th><th>Loại</th><th>Ngày thực hiện</th><th>Số km</th><th>Chi phí</th><th>Hạn tiếp theo</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
      list.map(function (m) { return maintenanceRowHtml(m); }).join("") + "</tbody>";
    $$('[data-action="delete-maint"]', table).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!window.confirm("Xoá bản ghi bảo dưỡng này?")) return;
        DB.maintenance = DB.maintenance.filter(function (x) { return x.id !== b.dataset.id; });
        persistMaintenanceDelete(b.dataset.id); renderMaintenance(); renderNotif();
      });
    });
  }
}
function openServiceForm() {
  var body =
    '<form id="serviceForm" class="form-grid" novalidate>' +
      field("Chọn xe", '<select name="vehicleId" required autofocus>' + allVehicleOptions() + '</select>') +
      field("Loại", '<select name="type" required>' + SERVICE_TYPES.map(function (t) { return "<option>" + t + "</option>"; }).join("") + '</select>') +
      field("Ngày thực hiện", '<input name="date" type="date" required value="' + isoDate(new Date()) + '">') +
      field("Số km", '<input name="odo" type="number" min="0" required>') +
      field("Chi phí (VNĐ)", '<input name="cost" type="number" min="0" required>') +
      field("Hạn tiếp theo (nếu có)", '<input name="nextDue" type="date">') +
      field("Ghi chú", '<textarea name="note" placeholder="Nội dung thực hiện"></textarea>', true) +
      '<div class="form-actions full"><button type="button" class="btn btn-ghost" id="serviceCancelBtn">Huỷ</button><button type="submit" class="btn btn-primary">Lưu bản ghi</button></div>' +
    '</form>';
  openModal("Thêm bản ghi bảo dưỡng", body, function (root) {
    $("#serviceCancelBtn", root).addEventListener("click", closeModal);
    $("#serviceForm", root).addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var rec = { id: uid("m"), vehicleId: f.get("vehicleId"), type: f.get("type"), date: f.get("date"), odo: Number(f.get("odo")), cost: Number(f.get("cost")), nextDue: f.get("nextDue") || "", note: (f.get("note") || "").trim() };
      DB.maintenance.unshift(rec);
      persistMaintenance(rec); closeModal(); toast("Đã lưu bản ghi bảo dưỡng", "success"); renderMaintenance(); renderNotif();
    });
  });
}
document.addEventListener("click", function (e) { if (e.target.closest('[data-action="new-service"]')) openServiceForm(); });

/* ==========================================================================
   Inspection (Kiểm định / Đăng kiểm)
   ========================================================================== */
function renderInspection() {
  var list = DB.maintenance.filter(function (m) { return m.type === INSPECTION_TYPE; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  var table = $("#inspectionTable");
  if (!list.length) {
    table.innerHTML = "";
    $("#inspectionEmpty").hidden = false;
  } else {
    $("#inspectionEmpty").hidden = true;
    table.innerHTML = '<thead><tr><th>Xe</th><th>Loại</th><th>Ngày kiểm định</th><th>Số km</th><th>Chi phí</th><th>Hạn kiểm định tiếp theo</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
      list.map(function (m) { return maintenanceRowHtml(m); }).join("") + "</tbody>";
    $$('[data-action="delete-maint"]', table).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!window.confirm("Xoá bản ghi kiểm định này?")) return;
        DB.maintenance = DB.maintenance.filter(function (x) { return x.id !== b.dataset.id; });
        persistMaintenanceDelete(b.dataset.id); renderInspection(); renderNotif();
      });
    });
  }
}
function openInspectionForm() {
  var body =
    '<form id="inspectionForm" class="form-grid" novalidate>' +
      field("Chọn xe", '<select name="vehicleId" required autofocus>' + allVehicleOptions() + '</select>') +
      field("Ngày kiểm định", '<input name="date" type="date" required value="' + isoDate(new Date()) + '">') +
      field("Số km", '<input name="odo" type="number" min="0" required>') +
      field("Chi phí (VNĐ)", '<input name="cost" type="number" min="0" required>') +
      field("Hạn kiểm định tiếp theo", '<input name="nextDue" type="date" required>') +
      field("Ghi chú", '<textarea name="note" placeholder="Ghi chú thêm (không bắt buộc)"></textarea>', true) +
      '<div class="form-hint full">Hạn kiểm định tiếp theo sẽ tự cập nhật vào hồ sơ xe (hạn đăng kiểm).</div>' +
      '<div class="form-actions full"><button type="button" class="btn btn-ghost" id="inspectionCancelBtn">Huỷ</button><button type="submit" class="btn btn-primary">Lưu bản ghi</button></div>' +
    '</form>';
  openModal("Thêm bản ghi kiểm định", body, function (root) {
    $("#inspectionCancelBtn", root).addEventListener("click", closeModal);
    $("#inspectionForm", root).addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var vehicleId = f.get("vehicleId");
      var date = f.get("date");
      var nextDue = f.get("nextDue") || "";
      var rec = { id: uid("m"), vehicleId: vehicleId, type: INSPECTION_TYPE, date: date, odo: Number(f.get("odo")), cost: Number(f.get("cost")), nextDue: nextDue, note: (f.get("note") || "").trim() };
      DB.maintenance.unshift(rec);
      persistMaintenance(rec);
      var v = getVehicle(vehicleId);
      if (v) {
        v.lastInspection = date;
        if (nextDue) v.regExpiry = nextDue;
        persistVehicle(v);
      }
      closeModal(); toast("Đã lưu bản ghi kiểm định", "success"); renderInspection(); renderNotif(); renderView("vehicles");
    });
  });
}
document.addEventListener("click", function (e) { if (e.target.closest('[data-action="new-inspection"]')) openInspectionForm(); });

/* ==========================================================================
   Reports
   ========================================================================== */
function renderReports() {
  var months = lastMonths(6);
  var thisMonth = months[months.length - 1];
  var maintThisMonth = DB.maintenance.filter(function (m) { return inSameMonth(m.date, thisMonth); }).reduce(function (s, m) { return s + m.cost; }, 0);
  var activeRatio = DB.vehicles.length ? Math.round(DB.vehicles.filter(function (v) { return v.status === "active"; }).length / DB.vehicles.length * 100) : 0;
  var dueSoonCount = collectAlerts().length;

  $("#reportKpiGrid").innerHTML = [
    { icon: "ic-truck", tone: "primary", label: "Tổng số xe", value: DB.vehicles.length },
    { icon: "ic-check", tone: "success", label: "Đang hoạt động", value: activeRatio + "%" },
    { icon: "ic-alert", tone: "warning", label: "Sắp đến hạn (30 ngày)", value: dueSoonCount },
    { icon: "ic-wrench", tone: "info", label: "Chi phí bảo dưỡng tháng này", value: fmtCurrency(maintThisMonth) }
  ].map(function (k) {
    return '<div class="kpi-card"><div class="kpi-top"><span class="kpi-icon" style="background:var(--color-' + k.tone + (k.tone === "primary" ? "-light" : "-bg") + ');color:var(--color-' + k.tone + ')"><svg class="icon"><use href="#' + k.icon + '"/></svg></span></div>' +
      '<span class="kpi-value">' + k.value + '</span><span class="kpi-label">' + k.label + '</span></div>';
  }).join("");

  var costPoints = months.map(function (m) {
    var sum = DB.maintenance.filter(function (mm) { return inSameMonth(mm.date, m); }).reduce(function (s, mm) { return s + mm.cost; }, 0);
    return { label: monthLabel(m), value: sum };
  });
  renderBarChart($("#reportCostChart"), costPoints, { valueFormatter: function (v) { return v >= 1000000 ? (v / 1000000).toFixed(1) + "tr" : v ? (v / 1000).toFixed(0) + "k" : "0"; } });

  var byStatus = {};
  DB.vehicles.forEach(function (v) { byStatus[v.status] = (byStatus[v.status] || 0) + 1; });
  var colorMap = { active: "var(--color-success)", maintenance: "var(--color-warning)", stopped: "var(--color-danger)" };
  renderDonutChart($("#statusDonut"), Object.keys(VEHICLE_STATUS).map(function (k) {
    return { label: VEHICLE_STATUS[k].label, value: byStatus[k] || 0, color: colorMap[k] };
  }));

  var perVehicle = DB.vehicles.map(function (v) {
    var cost = DB.maintenance.filter(function (m) { return m.vehicleId === v.id; }).reduce(function (s, m) { return s + m.cost; }, 0);
    return { v: v, cost: cost };
  }).sort(function (a, b) { return b.cost - a.cost; });

  $("#costByVehicleTable").innerHTML = '<thead><tr><th>Xe</th><th>Chi phí bảo dưỡng</th><th>Trạng thái</th></tr></thead><tbody>' +
    perVehicle.map(function (r) {
      var st = VEHICLE_STATUS[r.v.status];
      return '<tr><td class="cell-primary">' + escapeHtml(r.v.plate) + '<div class="cell-muted">' + escapeHtml(r.v.brand) + '</div></td>' +
        '<td class="cell-primary">' + fmtCurrency(r.cost) + '</td><td>' + badge(st.tone, st.label) + '</td></tr>';
    }).join("") + "</tbody>";
}

/* ==========================================================================
   Global search
   ========================================================================== */
function debounce(fn, wait) {
  var t;
  return function () { var args = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, args); }, wait); };
}
$("#globalSearch").addEventListener("keydown", function (e) {
  if (e.key !== "Enter") return;
  var q = e.target.value.trim();
  if (!q) return;
  var qLower = q.toLowerCase();
  var vHit = DB.vehicles.some(function (v) { return v.plate.toLowerCase().indexOf(qLower) > -1; });
  if (vHit) {
    switchView("vehicles");
    $("#vehicleSearch").value = q;
    renderVehicles();
    return;
  }
  var dHit = DB.drivers.some(function (dr) { return dr.name.toLowerCase().indexOf(qLower) > -1; });
  if (dHit) {
    switchView("drivers");
    $("#driverSearch").value = q;
    renderDrivers();
    return;
  }
  toast('Không tìm thấy "' + q + '" trong xe hoặc lái xe', undefined);
});

/* ==========================================================================
   Init
   ========================================================================== */
function showLoading(on) { var el = $("#loadingOverlay"); if (el) el.hidden = !on; }

function afterLoad() {
  renderSyncStatus();
  renderNotif();
  renderUnitScope();
  switchView("vehicles");
}

function initApp() {
  var cached = loadLocal();
  if (cached) {
    DB = cached;
    afterLoad();
    return;
  }
  if (API_URL) {
    showLoading(true);
    apiFetchAll().then(function (data) {
      DB.vehicles = data.vehicles || [];
      DB.drivers = data.drivers || [];
      DB.maintenance = data.maintenance || [];
      saveLocal();
      showLoading(false);
      afterLoad();
    }).catch(function () {
      DB = buildSeedData();
      saveLocal();
      showLoading(false);
      toast("Không kết nối được dữ liệu dùng chung — đang dùng dữ liệu mẫu tạm thời trên máy này", "danger");
      afterLoad();
    });
  } else {
    DB = buildSeedData();
    saveLocal();
    afterLoad();
  }
}

initApp();

})();
