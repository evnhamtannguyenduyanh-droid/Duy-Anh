/**
 * QUẢN LÝ XE Ô TÔ — ĐIỆN LỰC HÀM TÂN
 * Phiên bản API: giữ NGUYÊN toàn bộ logic Sheet/Drive/Lịch sử của bản gốc,
 * chỉ thêm lớp doGet/doPost trả JSON để trang tĩnh (GitHub Pages/Vercel) gọi qua fetch().
 * Dán ĐÈ vào Code.gs trong Apps Script (cùng project cũ) rồi Deploy > Manage deployments
 * > biểu tượng bút chì > New version > Deploy (giữ nguyên URL cũ, không tạo deployment mới).
 *
 * Truy cập trực tiếp link Web App (không kèm ?action=...) vẫn hiển thị giao diện
 * gốc trong Apps Script y như trước — không ai đang dùng link cũ bị ảnh hưởng.
 */

const SHEET_NAME = "Vehicles";
const HISTORY_SHEET_NAME = "LichSu";
const DRIVE_FOLDER_NAME = "QuanLyXe_DienLucHamTan_Anh";

const HEADERS = ["BienSo","DangKiemNgay","DangKiemHetHan","BaoHiemNgay","BaoHiemHetHan",
  "KmHienTai","KmNgayCapNhat","KmBD1","KmBD2",
  "Photo_Truoc","Photo_Sau","Photo_KiemDinh","Photo_Khac","CapNhatLuc"];

const SEED_PLATES = [
  { BienSo: "86C-128.29", DangKiemNgay: "2025-09-05", DangKiemHetHan: "2026-09-04" },
  { BienSo: "86C-153.50", DangKiemNgay: "2025-09-30", DangKiemHetHan: "2026-09-29" },
  { BienSo: "86C-188.93", DangKiemNgay: "2025-11-12", DangKiemHetHan: "2026-11-11" },
  { BienSo: "49C-262.84", DangKiemNgay: "2025-09-29", DangKiemHetHan: "2026-09-28" },
];

const CODE_VERSION = "v11-http-api";

// ============================================================= WEB APP ENTRY
function doGet(e) {
  var action = e && e.parameter && e.parameter.action;

  if (action === 'vehicles') {
    var rows = getVehicles();
    if (rows && rows.__error) return jsonOutput_(rows);
    return jsonOutput_({ vehicles: rows, sheetUrl: getSpreadsheet_().getUrl() });
  }
  if (action === 'history') {
    var plate = e.parameter.plate;
    var limit = e.parameter.limit ? Number(e.parameter.limit) : 10;
    return jsonOutput_({ history: getHistory(plate, limit) });
  }
  if (action === 'debug') {
    return jsonOutput_(getDebugInfo());
  }

  // Không có ?action= -> giữ nguyên hành vi cũ: hiển thị giao diện Apps Script gốc
  const tpl = HtmlService.createTemplateFromFile('index');
  tpl.sheetUrl = getSpreadsheet_().getUrl();
  return tpl.evaluate()
    .setTitle('Quản lý xe — Điện lực Hàm Tân')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput_({ ok: false, error: 'Du lieu gui len khong hop le' });
  }
  try {
    if (req.action === 'saveVehicle') {
      return jsonOutput_(saveVehicle(req.record));
    }
    if (req.action === 'uploadPhoto') {
      return jsonOutput_(uploadPhoto(req.plate, req.slot, req.base64Data, req.mimeType));
    }
    if (req.action === 'deletePhoto') {
      return jsonOutput_(deletePhoto(req.plate, req.slot));
    }
    return jsonOutput_({ ok: false, error: 'Hanh dong khong xac dinh: ' + req.action });
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err) });
  }
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================= SHEET HELPERS
function getSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const ssId = props.getProperty("SPREADSHEET_ID");
  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      // ID cũ không còn hợp lệ (bị xóa...) -> tạo mới bên dưới
    }
  }
  const ss = SpreadsheetApp.create("QuanLyXe_DienLucHamTan_DuLieu");
  props.setProperty("SPREADSHEET_ID", ss.getId());
  return ss;
}

function getSheet_() {
  const ss = getSpreadsheet_();
  return setupSheet_(ss);
}

function setupSheet_(ss) {
  ss = ss || getSpreadsheet_();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
  }
  if (sh.getLastRow() < 1) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  if (sh.getLastRow() <= 1) {
    // Sheet chưa có dữ liệu xe (chỉ có header hoặc trống hẳn) -> thêm dữ liệu mẫu 4 xe
    SEED_PLATES.forEach(function (v) {
      const row = HEADERS.map(function (h) { return v[h] || ""; });
      sh.appendRow(row);
    });
  }
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#1F3864").setFontColor("#FFFFFF");
  sh.autoResizeColumns(1, HEADERS.length);
  // xóa "Sheet1" mặc định nếu còn trống và không phải sheet này
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && defaultSheet.getSheetId() !== sh.getSheetId() && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }
  return sh;
}

/** Chạy hàm này 1 LẦN thủ công trong trình soạn thảo Apps Script để khởi tạo Sheet trước khi Deploy. */
function initSetup() {
  const ss = getSpreadsheet_();
  setupSheet_(ss);
  Logger.log("Đã tạo/xác nhận Google Sheet. Xem tại: " + ss.getUrl());
}

/** CHẠY THỬ TRỰC TIẾP — chọn hàm này trong dropdown rồi bấm Run, sau đó xem View > Logs */
function testGetVehicles() {
  const result = getVehicles();
  Logger.log("KẾT QUẢ getVehicles(): " + JSON.stringify(result));
}

/** CHẠY THỬ TRỰC TIẾP — chọn hàm này trong dropdown rồi bấm Run, sau đó xem View > Logs */
function testGetDebugInfo() {
  const result = getDebugInfo();
  Logger.log("KẾT QUẢ getDebugInfo(): " + JSON.stringify(result));
}

// ============================================================= LỊCH SỬ THAY ĐỔI
const HISTORY_HEADERS = ["ThoiGian", "BienSo", "HanhDong", "ChiTiet"];

function getHistorySheet_() {
  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(HISTORY_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(HISTORY_SHEET_NAME);
    sh.getRange(1, 1, 1, HISTORY_HEADERS.length).setValues([HISTORY_HEADERS]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HISTORY_HEADERS.length).setFontWeight("bold").setBackground("#1F3864").setFontColor("#FFFFFF");
    sh.setColumnWidth(1, 130);
    sh.setColumnWidth(2, 100);
    sh.setColumnWidth(3, 140);
    sh.setColumnWidth(4, 420);
  }
  return sh;
}

function logHistory_(plate, action, detail) {
  try {
    const sh = getHistorySheet_();
    sh.appendRow([new Date(), plate, action, detail || ""]);
  } catch (e) {
    // không để lỗi ghi log làm hỏng thao tác chính
  }
}

/** Lấy tối đa `limit` dòng lịch sử gần nhất của 1 biển số (mới nhất trước) */
function getHistory(plate, limit) {
  try {
    limit = limit || 10;
    const sh = getHistorySheet_();
    const values = sh.getDataRange().getValues();
    const rows = values.slice(1)
      .filter(function (r) { return r[1] === plate; })
      .map(function (r) {
        return { ThoiGian: datetimeToStr_(r[0]), BienSo: r[1], HanhDong: r[2], ChiTiet: r[3] };
      });
    rows.reverse();
    return rows.slice(0, limit);
  } catch (e) {
    return [];
  }
}

// ============================================================= DOC/JSON HELPERS
function dateToStr_(d) {
  if (d instanceof Date) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
  }
  return d || "";
}

function datetimeToStr_(d) {
  if (d instanceof Date) {
    return Utilities.formatDate(d, Session.getScriptTimeZone(), "dd/MM/yyyy HH:mm");
  }
  return d || "";
}

function rowToObj_(headers, row) {
  const obj = {};
  headers.forEach(function (h, i) { obj[h] = row[i]; });
  ["DangKiemNgay", "DangKiemHetHan", "BaoHiemNgay", "BaoHiemHetHan", "KmNgayCapNhat"].forEach(function (f) {
    obj[f] = dateToStr_(obj[f]);
  });
  obj["CapNhatLuc"] = datetimeToStr_(obj["CapNhatLuc"]);
  // đảm bảo mọi giá trị còn lại đều là kiểu đơn giản (string/number), không để sót null/undefined
  headers.forEach(function (h) {
    if (obj[h] === null || obj[h] === undefined) obj[h] = "";
  });
  return obj;
}

// ============================================================= PUBLIC API (gọi từ client qua fetch/HTTP)
function getVehicles() {
  try {
    const sh = getSheet_();
    const values = sh.getDataRange().getValues();
    const headers = values[0];
    return values.slice(1).map(function (r) { return rowToObj_(headers, r); });
  } catch (err) {
    return { __error: true, message: String(err && err.message || err), stack: String(err && err.stack || "") };
  }
}

function getDebugInfo() {
  try {
    const sh = getSheet_(); // dùng ĐÚNG hàm mà getVehicles() đang dùng, không kiểm tra kiểu khác
    const values = sh.getDataRange().getValues();
    const safe = function (row) {
      if (!row) return null;
      return row.map(function (c) { return (c instanceof Date) ? c.toISOString() : c; });
    };
    return {
      ok: true,
      spreadsheetId: sh.getParent().getId(),
      spreadsheetUrl: sh.getParent().getUrl(),
      sheetName: sh.getName(),
      totalRows: values.length,
      dataRowCount: Math.max(0, values.length - 1),
      headers: safe(values.length > 0 ? values[0] : null),
      firstDataRow: safe(values.length > 1 ? values[1] : null)
    };
  } catch (e) {
    return { ok: false, message: String(e && e.message || e), stack: String(e && e.stack || "") };
  }
}

function saveVehicle(data) {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const plateCol = headers.indexOf("BienSo");
  const LABELS = {
    DangKiemNgay: "Ngày kiểm định", DangKiemHetHan: "Hạn đăng kiểm",
    BaoHiemNgay: "Ngày mua bảo hiểm", BaoHiemHetHan: "Hạn bảo hiểm",
    KmHienTai: "Km hiện tại", KmBD1: "Km BD cấp 1", KmBD2: "Km BD cấp 2"
  };
  for (let i = 1; i < values.length; i++) {
    if (values[i][plateCol] === data.BienSo) {
      const changes = [];
      headers.forEach(function (h, colIdx) {
        if (h === "CapNhatLuc") {
          sh.getRange(i + 1, colIdx + 1).setValue(new Date());
        } else if (Object.prototype.hasOwnProperty.call(data, h)) {
          const oldVal = String(values[i][colIdx] || "");
          const newVal = String(data[h] || "");
          if (oldVal !== newVal && LABELS[h]) {
            changes.push(LABELS[h] + ": \"" + (oldVal || "trống") + "\" → \"" + (newVal || "trống") + "\"");
          }
          sh.getRange(i + 1, colIdx + 1).setValue(data[h]);
        }
      });
      if (changes.length) {
        logHistory_(data.BienSo, "Cập nhật thông tin", changes.join("; "));
      }
      return { ok: true };
    }
  }
  return { ok: false, error: "Không tìm thấy biển số " + data.BienSo + " trong Sheet." };
}

function getFolder_() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function extractDriveId_(url) {
  const m = String(url || "").match(/[-\w]{25,}/);
  return m ? m[0] : null;
}

/** slot: "Truoc" | "Sau" | "KiemDinh" | "Khac" ; base64Data: chuỗi base64 KHÔNG kèm tiền tố data:...;base64, */
function uploadPhoto(plate, slot, base64Data, mimeType) {
  const folder = getFolder_();
  const bytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(bytes, mimeType || "image/jpeg", plate + "_" + slot + ".jpg");
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const url = "https://drive.google.com/thumbnail?sz=w1000&id=" + file.getId();

  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const plateCol = headers.indexOf("BienSo");
  const colIdx = headers.indexOf("Photo_" + slot);
  if (colIdx === -1) return { ok: false, error: "Loại ảnh không hợp lệ: " + slot };

  for (let i = 1; i < values.length; i++) {
    if (values[i][plateCol] === plate) {
      const oldUrl = values[i][colIdx];
      if (oldUrl) {
        const oldId = extractDriveId_(oldUrl);
        if (oldId) { try { DriveApp.getFileById(oldId).setTrashed(true); } catch (e) { } }
      }
      sh.getRange(i + 1, colIdx + 1).setValue(url);
      sh.getRange(i + 1, headers.indexOf("CapNhatLuc") + 1).setValue(new Date());
      logHistory_(plate, "Tải ảnh", "Cập nhật ảnh: " + slot);
      return { ok: true, url: url };
    }
  }
  return { ok: false, error: "Không tìm thấy biển số " + plate };
}

function deletePhoto(plate, slot) {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const plateCol = headers.indexOf("BienSo");
  const colIdx = headers.indexOf("Photo_" + slot);
  if (colIdx === -1) return { ok: false, error: "Loại ảnh không hợp lệ: " + slot };

  for (let i = 1; i < values.length; i++) {
    if (values[i][plateCol] === plate) {
      const oldUrl = values[i][colIdx];
      if (oldUrl) {
        const oldId = extractDriveId_(oldUrl);
        if (oldId) { try { DriveApp.getFileById(oldId).setTrashed(true); } catch (e) { } }
      }
      sh.getRange(i + 1, colIdx + 1).setValue("");
      sh.getRange(i + 1, headers.indexOf("CapNhatLuc") + 1).setValue(new Date());
      logHistory_(plate, "Xóa ảnh", "Xóa ảnh: " + slot);
      return { ok: true };
    }
  }
  return { ok: false, error: "Không tìm thấy biển số " + plate };
}
