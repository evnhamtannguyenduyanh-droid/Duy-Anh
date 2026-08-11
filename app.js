(function () {
"use strict";

/* ==========================================================================
   Constants & helpers
   ========================================================================== */
var STORAGE_KEY = "congxa-pcld-v1";
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
var DISPATCH_STATUS = {
  pending:  { label: "Chờ duyệt",       tone: "muted" },
  approved: { label: "Đã duyệt",        tone: "info" },
  ongoing:  { label: "Đang thực hiện",  tone: "warning" },
  done:     { label: "Hoàn thành",      tone: "success" },
  rejected: { label: "Từ chối",         tone: "danger" }
};
var SERVICE_TYPES = ["Bảo dưỡng định kỳ", "Sửa chữa", "Đăng kiểm"];

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

  // Chưa có dữ liệu lái xe / lệnh điều xe / bảo dưỡng / nhiên liệu thật — để trống, tự nhập qua giao diện.
  var drivers = [];
  var dispatches = [];
  var maintenance = [];
  var fuel = [];

  return { vehicles: vehicles, drivers: drivers, dispatches: dispatches, maintenance: maintenance, fuel: fuel };
}

/* ==========================================================================
   Persistence
   ========================================================================== */
var DB = load();
function load() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* fall through to reseed */ }
  var seed = buildSeedData();
  save(seed);
  return seed;
}
function save(db) {
  db = db || DB;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function getVehicle(id) { return DB.vehicles.find(function (v) { return v.id === id; }); }
function getDriver(id) { return DB.drivers.find(function (dr) { return dr.id === id; }); }

/* ==========================================================================
   Global UI state
   ========================================================================== */
var state = { view: "dashboard", dispatchStatus: "", maintSub: "service", lastFocused: null };

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
   Last N months bucketing (fuel + maintenance costs)
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
   Notifications (upcoming / overdue registration, license, maintenance)
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
  dashboard: { title: "Tổng quan", sub: "Toàn cảnh hoạt động công xa hôm nay" },
  vehicles: { title: "Danh sách xe", sub: "Hồ sơ và tình trạng toàn bộ đội xe" },
  dispatch: { title: "Lịch điều xe", sub: "Đăng ký, duyệt và theo dõi lệnh điều động" },
  drivers: { title: "Lái xe", sub: "Hồ sơ lái xe và phân công phương tiện" },
  maintenance: { title: "Bảo dưỡng & Nhiên liệu", sub: "Lịch sử bảo dưỡng, đăng kiểm và nhiên liệu" },
  reports: { title: "Báo cáo", sub: "Chi phí vận hành và hiệu suất sử dụng xe" }
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
}
$$(".nav-item").forEach(function (btn) { btn.addEventListener("click", function () { switchView(btn.dataset.view); }); });

function openSidebar() { $("#sidebar").classList.add("is-open"); $("#scrim").classList.add("is-visible"); $("#menuToggle").setAttribute("aria-expanded", "true"); }
function closeSidebar() { $("#sidebar").classList.remove("is-open"); $("#scrim").classList.remove("is-visible"); $("#menuToggle").setAttribute("aria-expanded", "false"); }
$("#menuToggle").addEventListener("click", function () { $("#sidebar").classList.contains("is-open") ? closeSidebar() : openSidebar(); });
$("#scrim").addEventListener("click", closeSidebar);

function renderView(view) {
  if (view === "dashboard") renderDashboard();
  else if (view === "vehicles") renderVehicles();
  else if (view === "dispatch") renderDispatch();
  else if (view === "drivers") renderDrivers();
  else if (view === "maintenance") renderMaintenance();
  else if (view === "reports") renderReports();
}

/* ==========================================================================
   Dashboard
   ========================================================================== */
function renderDashboard() {
  $("#todayLabel").textContent = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });

  var todayIso = isoDate(new Date());
  var activeCount = DB.vehicles.filter(function (v) { return v.status === "active"; }).length;
  var maintCount = DB.vehicles.filter(function (v) { return v.status === "maintenance"; }).length;
  var todayDispatch = DB.dispatches.filter(function (p) { return p.date === todayIso; }).length;

  var kpis = [
    { icon: "ic-truck", tone: "primary", label: "Tổng số xe", value: DB.vehicles.length },
    { icon: "ic-check", tone: "success", label: "Đang hoạt động", value: activeCount },
    { icon: "ic-wrench", tone: "warning", label: "Đang bảo dưỡng", value: maintCount },
    { icon: "ic-calendar", tone: "info", label: "Lệnh điều xe hôm nay", value: todayDispatch }
  ];
  $("#kpiGrid").innerHTML = kpis.map(function (k) {
    return '<div class="kpi-card"><div class="kpi-top"><span class="kpi-icon" style="background:var(--color-' + k.tone + (k.tone === "primary" ? "-light" : "-bg") + ');color:var(--color-' + k.tone + (k.tone === "primary" ? "" : "") + ')"><svg class="icon"><use href="#' + k.icon + '"/></svg></span></div>' +
      '<span class="kpi-value">' + k.value + '</span><span class="kpi-label">' + k.label + '</span></div>';
  }).join("");

  // fuel cost, last 6 months
  var months = lastMonths(6);
  var points = months.map(function (m) {
    var sum = DB.fuel.filter(function (f) { return inSameMonth(f.date, m); }).reduce(function (s, f) { return s + f.liters * f.price; }, 0);
    return { label: monthLabel(m), value: sum };
  });
  renderBarChart($("#fuelChart"), points, { valueFormatter: function (v) { return v >= 1000000 ? (v / 1000000).toFixed(1) + "tr" : v ? (v / 1000).toFixed(0) + "k" : "0"; } });

  // alerts
  var alerts = collectAlerts();
  var alertList = $("#alertList");
  if (!alerts.length) {
    alertList.innerHTML = '<li class="notif-empty">Không có cảnh báo nào trong 30 ngày tới.</li>';
  } else {
    alertList.innerHTML = alerts.slice(0, 6).map(function (a) {
      var tone = a.due < 0 ? "danger" : a.due <= 7 ? "warning" : "info";
      return '<li class="alert-item"><span class="alert-icon" style="background:var(--color-' + tone + '-bg);color:var(--color-' + tone + ')"><svg class="icon icon-sm"><use href="#' + a.icon + '"/></svg></span>' +
        '<div class="alert-body"><p>' + escapeHtml(a.title) + '</p><small>' + escapeHtml(a.detail) + '</small></div></li>';
    }).join("");
  }

  // recent dispatch
  var recent = DB.dispatches.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 5);
  $("#recentDispatchTable").innerHTML = dispatchTableHtml(recent, false);

  wireDispatchRowActions($("#recentDispatchTable"));
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
      save();
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
  save();
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
   Dispatch
   ========================================================================== */
function dispatchTableHtml(list, withActions) {
  if (withActions === undefined) withActions = true;
  if (!list.length) return "";
  return '<thead><tr><th>Ngày</th><th>Xe</th><th>Lái xe</th><th>Người yêu cầu</th><th>Tuyến đường</th><th>Mục đích</th><th>Trạng thái</th>' + (withActions ? "<th></th>" : "") + '</tr></thead><tbody>' +
    list.map(function (p) {
      var v = getVehicle(p.vehicleId), dr = getDriver(p.driverId), st = DISPATCH_STATUS[p.status];
      return '<tr data-id="' + p.id + '">' +
        '<td class="cell-primary">' + fmtDate(p.date) + '<div class="cell-muted">' + p.start + (p.end ? " – " + p.end : "") + '</div></td>' +
        '<td>' + (v ? escapeHtml(v.plate) : "—") + '</td>' +
        '<td>' + (dr ? escapeHtml(dr.name) : "—") + '</td>' +
        '<td>' + escapeHtml(p.requester) + '<div class="cell-muted">' + escapeHtml(p.dept) + '</div></td>' +
        '<td class="cell-muted">' + escapeHtml(p.from) + ' → ' + escapeHtml(p.to) + '</td>' +
        '<td>' + escapeHtml(p.purpose) + '</td>' +
        '<td>' + badge(st.tone, st.label) + '</td>' +
        (withActions ? '<td><div class="row-actions">' + dispatchActionButtons(p) + '</div></td>' : "") +
      '</tr>';
    }).join("") + "</tbody>";
}
function dispatchActionButtons(p) {
  if (p.status === "pending") {
    return '<button class="btn btn-sm btn-primary" data-action="approve" data-id="' + p.id + '">Duyệt</button>' +
      '<button class="btn btn-sm btn-danger" data-action="reject" data-id="' + p.id + '">Từ chối</button>';
  }
  if (p.status === "approved") {
    return '<button class="btn btn-sm btn-primary" data-action="start" data-id="' + p.id + '">Bắt đầu</button>';
  }
  if (p.status === "ongoing") {
    return '<button class="btn btn-sm btn-primary" data-action="complete" data-id="' + p.id + '">Hoàn thành</button>';
  }
  return '<span class="cell-muted">—</span>';
}
function wireDispatchRowActions(root) {
  $$('[data-action="approve"]', root).forEach(function (b) { b.addEventListener("click", function () { setDispatchStatus(b.dataset.id, "approved", "Đã duyệt lệnh điều xe"); }); });
  $$('[data-action="reject"]', root).forEach(function (b) { b.addEventListener("click", function () { setDispatchStatus(b.dataset.id, "rejected", "Đã từ chối lệnh điều xe"); }); });
  $$('[data-action="start"]', root).forEach(function (b) { b.addEventListener("click", function () { setDispatchStatus(b.dataset.id, "ongoing", "Đã bắt đầu chuyến đi"); }); });
  $$('[data-action="complete"]', root).forEach(function (b) { b.addEventListener("click", function () { setDispatchStatus(b.dataset.id, "done", "Đã hoàn thành chuyến đi"); }); });
}
function setDispatchStatus(id, status, msg) {
  var p = DB.dispatches.find(function (x) { return x.id === id; });
  if (!p) return;
  p.status = status;
  save();
  toast(msg, status === "rejected" ? "danger" : "success");
  renderView(state.view);
}

function renderDispatch() {
  var list = DB.dispatches.filter(function (p) { return !state.dispatchStatus || p.status === state.dispatchStatus; })
    .slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
  var table = $("#dispatchTable");
  if (!list.length) {
    table.innerHTML = "";
    $("#dispatchEmpty").hidden = false;
  } else {
    $("#dispatchEmpty").hidden = true;
    table.innerHTML = dispatchTableHtml(list, true);
    wireDispatchRowActions(table);
  }
}
$$("#dispatchTabs .tab").forEach(function (tab) {
  tab.addEventListener("click", function () {
    $$("#dispatchTabs .tab").forEach(function (t) { t.classList.remove("is-active"); });
    tab.classList.add("is-active");
    state.dispatchStatus = tab.dataset.status;
    renderDispatch();
  });
});

function activeVehicleOptions(selectedId) {
  return DB.vehicles.filter(function (v) { return v.status !== "stopped"; }).map(function (v) {
    return '<option value="' + v.id + '"' + (v.id === selectedId ? " selected" : "") + '>' + escapeHtml(v.plate) + " — " + escapeHtml(v.type) + '</option>';
  }).join("");
}
function driverSelectOptions(selectedId) {
  return DB.drivers.map(function (dr) {
    return '<option value="' + dr.id + '"' + (dr.id === selectedId ? " selected" : "") + '>' + escapeHtml(dr.name) + '</option>';
  }).join("");
}

function openDispatchForm() {
  var body =
    '<form id="dispatchForm" class="form-grid" novalidate>' +
      field("Ngày sử dụng", '<input name="date" type="date" required autofocus value="' + isoDate(new Date()) + '">') +
      field("Giờ đi / Giờ về dự kiến", '<div style="display:flex;gap:8px"><input name="start" type="time" required value="08:00" style="flex:1"><input name="end" type="time" value="17:00" style="flex:1"></div>') +
      field("Chọn xe", '<select name="vehicleId" required>' + activeVehicleOptions() + '</select>') +
      field("Chọn lái xe", '<select name="driverId" required>' + driverSelectOptions() + '</select>') +
      field("Người yêu cầu", '<input name="requester" required placeholder="Họ và tên">') +
      field("Đơn vị / Phòng ban", '<input name="dept" required placeholder="Ví dụ: Phòng Kỹ thuật">') +
      field("Điểm đi", '<input name="from" required placeholder="Văn phòng PCLĐ — Cơ sở…">') +
      field("Điểm đến", '<input name="to" required placeholder="Nơi đến">') +
      field("Mục đích công tác", '<textarea name="purpose" required placeholder="Nội dung công việc cần thực hiện"></textarea>', true) +
      '<div class="form-actions full">' +
        '<button type="button" class="btn btn-ghost" id="dispatchCancelBtn">Huỷ</button>' +
        '<button type="submit" class="btn btn-primary">Gửi lệnh điều xe</button>' +
      '</div>' +
    '</form>';

  openModal("Tạo lệnh điều xe", body, function (root) {
    $("#dispatchCancelBtn", root).addEventListener("click", closeModal);
    var vSel = root.querySelector('[name="vehicleId"]');
    var dSel = root.querySelector('[name="driverId"]');
    vSel.addEventListener("change", function () {
      var v = getVehicle(vSel.value);
      if (v && v.driverId) dSel.value = v.driverId;
    });
    $("#dispatchForm", root).addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      var rec = {
        id: uid("p"), date: f.get("date"), start: f.get("start"), end: f.get("end") || "",
        vehicleId: f.get("vehicleId"), driverId: f.get("driverId"),
        requester: f.get("requester").trim(), dept: f.get("dept").trim(),
        from: f.get("from").trim(), to: f.get("to").trim(), purpose: f.get("purpose").trim(),
        status: "pending"
      };
      DB.dispatches.unshift(rec);
      save();
      closeModal();
      toast("Đã gửi lệnh điều xe, chờ duyệt", "success");
      switchView("dispatch");
    });
  });
}
document.addEventListener("click", function (e) {
  if (e.target.closest('[data-action="new-dispatch"]')) openDispatchForm();
  if (e.target.closest('[data-action="goto-dispatch"]')) switchView("dispatch");
});

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
      DB.vehicles.forEach(function (v) { if (v.driverId === id && v.id !== newVehicleId) v.driverId = ""; });
      if (newVehicleId) {
        var target = getVehicle(newVehicleId);
        if (target) target.driverId = id;
      }
      save();
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
  DB.vehicles.forEach(function (v) { if (v.driverId === id) v.driverId = ""; });
  save();
  toast("Đã xoá lái xe " + dr.name, "danger");
  renderView(state.view);
}
document.addEventListener("click", function (e) { if (e.target.closest('[data-action="new-driver"]')) openDriverForm(null); });

/* ==========================================================================
   Maintenance & Fuel
   ========================================================================== */
function serviceStatusMeta(m) {
  if (!m.nextDue) return { tone: "muted", label: "Đã hoàn thành" };
  var du = daysUntil(m.nextDue);
  if (du < 0) return { tone: "danger", label: "Quá hạn " + (-du) + " ngày" };
  if (du <= 30) return { tone: "warning", label: "Còn " + du + " ngày" };
  return { tone: "success", label: "Còn hạn" };
}
function renderMaintenance() {
  $$("#maintSubTabs .tab").forEach(function (t) { t.classList.toggle("is-active", t.dataset.sub === state.maintSub); });
  $("#serviceCard").hidden = state.maintSub !== "service";
  $("#fuelCard").hidden = state.maintSub !== "fuel";
  $("#newServiceLabel").textContent = state.maintSub === "service" ? "Thêm bản ghi bảo dưỡng" : "Thêm nhật ký nhiên liệu";

  if (state.maintSub === "service") {
    var list = DB.maintenance.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    $("#serviceTable").innerHTML = '<thead><tr><th>Xe</th><th>Loại</th><th>Ngày thực hiện</th><th>Số km</th><th>Chi phí</th><th>Hạn tiếp theo</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
      list.map(function (m) {
        var v = getVehicle(m.vehicleId), st = serviceStatusMeta(m);
        return '<tr><td class="cell-primary">' + (v ? escapeHtml(v.plate) : "—") + '</td><td>' + escapeHtml(m.type) + '</td>' +
          '<td class="cell-muted">' + fmtDate(m.date) + '</td><td class="cell-muted">' + fmtKm(m.odo) + '</td>' +
          '<td>' + fmtCurrency(m.cost) + '</td><td class="cell-muted">' + (m.nextDue ? fmtDate(m.nextDue) : "—") + '</td>' +
          '<td>' + badge(st.tone, st.label) + '</td>' +
          '<td><div class="row-actions"><button class="icon-btn btn-sm" data-action="delete-service" data-id="' + m.id + '" aria-label="Xoá"><svg class="icon icon-sm"><use href="#ic-trash"/></svg></button></div></td></tr>';
      }).join("") + "</tbody>";
    $$('[data-action="delete-service"]', $("#serviceTable")).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!window.confirm("Xoá bản ghi bảo dưỡng này?")) return;
        DB.maintenance = DB.maintenance.filter(function (x) { return x.id !== b.dataset.id; });
        save(); renderMaintenance(); renderNotif();
      });
    });
  } else {
    var flist = DB.fuel.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
    $("#fuelTable").innerHTML = '<thead><tr><th>Xe</th><th>Ngày đổ</th><th>Số lít</th><th>Đơn giá</th><th>Thành tiền</th><th>Số km</th><th>Trạm xăng</th><th></th></tr></thead><tbody>' +
      flist.map(function (f) {
        var v = getVehicle(f.vehicleId);
        return '<tr><td class="cell-primary">' + (v ? escapeHtml(v.plate) : "—") + '</td><td class="cell-muted">' + fmtDate(f.date) + '</td>' +
          '<td>' + f.liters + ' L</td><td class="cell-muted">' + fmtCurrency(f.price) + '</td><td>' + fmtCurrency(f.liters * f.price) + '</td>' +
          '<td class="cell-muted">' + fmtKm(f.odo) + '</td><td class="cell-muted">' + escapeHtml(f.station) + '</td>' +
          '<td><div class="row-actions"><button class="icon-btn btn-sm" data-action="delete-fuel" data-id="' + f.id + '" aria-label="Xoá"><svg class="icon icon-sm"><use href="#ic-trash"/></svg></button></div></td></tr>';
      }).join("") + "</tbody>";
    $$('[data-action="delete-fuel"]', $("#fuelTable")).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!window.confirm("Xoá nhật ký nhiên liệu này?")) return;
        DB.fuel = DB.fuel.filter(function (x) { return x.id !== b.dataset.id; });
        save(); renderMaintenance();
      });
    });
  }
}
$$("#maintSubTabs .tab").forEach(function (tab) { tab.addEventListener("click", function () { state.maintSub = tab.dataset.sub; renderMaintenance(); }); });

function allVehicleOptions(selectedId) {
  return DB.vehicles.map(function (v) { return '<option value="' + v.id + '"' + (v.id === selectedId ? " selected" : "") + '>' + escapeHtml(v.plate) + '</option>'; }).join("");
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
  openModal("Thêm bản ghi bảo dưỡng / đăng kiểm", body, function (root) {
    $("#serviceCancelBtn", root).addEventListener("click", closeModal);
    $("#serviceForm", root).addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      DB.maintenance.unshift({ id: uid("m"), vehicleId: f.get("vehicleId"), type: f.get("type"), date: f.get("date"), odo: Number(f.get("odo")), cost: Number(f.get("cost")), nextDue: f.get("nextDue") || "", note: (f.get("note") || "").trim() });
      save(); closeModal(); toast("Đã lưu bản ghi bảo dưỡng", "success"); state.maintSub = "service"; renderMaintenance(); renderNotif();
    });
  });
}
function openFuelForm() {
  var body =
    '<form id="fuelForm" class="form-grid" novalidate>' +
      field("Chọn xe", '<select name="vehicleId" required autofocus>' + allVehicleOptions() + '</select>') +
      field("Ngày đổ", '<input name="date" type="date" required value="' + isoDate(new Date()) + '">') +
      field("Số lít", '<input name="liters" type="number" min="0" step="0.1" required>') +
      field("Đơn giá (VNĐ/lít)", '<input name="price" type="number" min="0" required value="21500">') +
      field("Số km", '<input name="odo" type="number" min="0" required>') +
      field("Trạm xăng", '<input name="station" placeholder="Petrolimex…">') +
      '<div class="form-actions full"><button type="button" class="btn btn-ghost" id="fuelCancelBtn">Huỷ</button><button type="submit" class="btn btn-primary">Lưu nhật ký</button></div>' +
    '</form>';
  openModal("Thêm nhật ký nhiên liệu", body, function (root) {
    $("#fuelCancelBtn", root).addEventListener("click", closeModal);
    $("#fuelForm", root).addEventListener("submit", function (e) {
      e.preventDefault();
      var f = new FormData(e.target);
      DB.fuel.unshift({ id: uid("f"), vehicleId: f.get("vehicleId"), date: f.get("date"), liters: Number(f.get("liters")), price: Number(f.get("price")), odo: Number(f.get("odo")), station: (f.get("station") || "").trim() || "Chưa rõ" });
      save(); closeModal(); toast("Đã lưu nhật ký nhiên liệu", "success"); state.maintSub = "fuel"; renderMaintenance();
    });
  });
}
document.addEventListener("click", function (e) {
  if (e.target.closest('[data-action="new-service"]')) {
    if (state.maintSub === "service") openServiceForm(); else openFuelForm();
  }
});

/* ==========================================================================
   Reports
   ========================================================================== */
function renderReports() {
  var months = lastMonths(6);
  var thisMonth = months[months.length - 1];
  var fuelThisMonth = DB.fuel.filter(function (f) { return inSameMonth(f.date, thisMonth); }).reduce(function (s, f) { return s + f.liters * f.price; }, 0);
  var maintThisMonth = DB.maintenance.filter(function (m) { return inSameMonth(m.date, thisMonth); }).reduce(function (s, m) { return s + m.cost; }, 0);
  var totalKmFuel = DB.fuel.length; // proxy metric: number of refuel logs, as a simple activity indicator
  var activeRatio = Math.round(DB.vehicles.filter(function (v) { return v.status === "active"; }).length / DB.vehicles.length * 100);

  $("#reportKpiGrid").innerHTML = [
    { icon: "ic-droplet", tone: "info", label: "Chi phí nhiên liệu tháng này", value: fmtCurrency(fuelThisMonth) },
    { icon: "ic-wrench", tone: "warning", label: "Chi phí bảo dưỡng tháng này", value: fmtCurrency(maintThisMonth) },
    { icon: "ic-fuel-pump", tone: "primary", label: "Lượt đổ nhiên liệu (6 tháng)", value: totalKmFuel },
    { icon: "ic-check", tone: "success", label: "Tỷ lệ xe hoạt động", value: activeRatio + "%" }
  ].map(function (k) {
    return '<div class="kpi-card"><div class="kpi-top"><span class="kpi-icon" style="background:var(--color-' + k.tone + (k.tone === "primary" ? "-light" : "-bg") + ');color:var(--color-' + k.tone + ')"><svg class="icon"><use href="#' + k.icon + '"/></svg></span></div>' +
      '<span class="kpi-value">' + k.value + '</span><span class="kpi-label">' + k.label + '</span></div>';
  }).join("");

  var costPoints = months.map(function (m) {
    var fuelSum = DB.fuel.filter(function (f) { return inSameMonth(f.date, m); }).reduce(function (s, f) { return s + f.liters * f.price; }, 0);
    var maintSum = DB.maintenance.filter(function (mm) { return inSameMonth(mm.date, m); }).reduce(function (s, mm) { return s + mm.cost; }, 0);
    return { label: monthLabel(m), value: fuelSum + maintSum };
  });
  renderBarChart($("#reportCostChart"), costPoints, { valueFormatter: function (v) { return v >= 1000000 ? (v / 1000000).toFixed(1) + "tr" : v ? (v / 1000).toFixed(0) + "k" : "0"; } });

  var byStatus = {};
  DB.vehicles.forEach(function (v) { byStatus[v.status] = (byStatus[v.status] || 0) + 1; });
  var colorMap = { active: "var(--color-success)", maintenance: "var(--color-warning)", stopped: "var(--color-danger)" };
  renderDonutChart($("#statusDonut"), Object.keys(VEHICLE_STATUS).map(function (k) {
    return { label: VEHICLE_STATUS[k].label, value: byStatus[k] || 0, color: colorMap[k] };
  }));

  var perVehicle = DB.vehicles.map(function (v) {
    var fuelCost = DB.fuel.filter(function (f) { return f.vehicleId === v.id; }).reduce(function (s, f) { return s + f.liters * f.price; }, 0);
    var maintCost = DB.maintenance.filter(function (m) { return m.vehicleId === v.id; }).reduce(function (s, m) { return s + m.cost; }, 0);
    return { v: v, fuelCost: fuelCost, maintCost: maintCost, total: fuelCost + maintCost };
  }).sort(function (a, b) { return b.total - a.total; });

  $("#costByVehicleTable").innerHTML = '<thead><tr><th>Xe</th><th>Chi phí nhiên liệu</th><th>Chi phí bảo dưỡng</th><th>Tổng chi phí</th><th>Trạng thái</th></tr></thead><tbody>' +
    perVehicle.map(function (r) {
      var st = VEHICLE_STATUS[r.v.status];
      return '<tr><td class="cell-primary">' + escapeHtml(r.v.plate) + '<div class="cell-muted">' + escapeHtml(r.v.brand) + '</div></td>' +
        '<td>' + fmtCurrency(r.fuelCost) + '</td><td>' + fmtCurrency(r.maintCost) + '</td><td class="cell-primary">' + fmtCurrency(r.total) + '</td><td>' + badge(st.tone, st.label) + '</td></tr>';
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
  switchView("dispatch");
  toast('Không tìm thấy "' + q + '" trong xe hoặc lái xe — hiển thị lệnh điều xe', undefined);
});

/* ==========================================================================
   Init
   ========================================================================== */
renderNotif();
renderUnitScope();
switchView("dashboard");

})();
