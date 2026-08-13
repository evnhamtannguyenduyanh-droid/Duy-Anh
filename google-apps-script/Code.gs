/**
 * Backend du lieu dung chung cho "Quan ly cong xa - Van phong PCLD".
 * Trien khai: Extensions > Apps Script trong Google Sheet, dan file nay vao Code.gs,
 * chay setupAndSeed() mot lan, roi Deploy > New deployment > Web app.
 * Xem huong dan day du trong README.md cung thu muc.
 */

var SHEET_VEHICLES = 'Vehicles';
var SHEET_DRIVERS = 'Drivers';
var SHEET_MAINTENANCE = 'Maintenance';

var VEHICLE_FIELDS = ['id', 'plate', 'type', 'brand', 'year', 'odo', 'status', 'regExpiry', 'lastInspection', 'insuranceStart', 'insuranceExpiry', 'driverId', 'owner', 'site', 'fuelNorm', 'note', 'kmBD1', 'kmBD2', 'photoDangKy', 'photoDangKiem', 'photoBaoHiem', 'photoXe'];
// Luu y: cac truong moi (kmBD1/kmBD2, roi photoDangKy/photoDangKiem/photoBaoHiem/photoXe)
// deu duoc them VAO CUOI danh sach (khong chen giua) de khong lam lech vi tri cac cot
// da co du lieu. Xem migrateAddKmFields() / migrateAddPhotoFields() ben duoi.
var DRIVER_FIELDS = ['id', 'name', 'phone', 'licenseClass', 'licenseExpiry', 'status'];
var MAINTENANCE_FIELDS = ['id', 'vehicleId', 'type', 'date', 'odo', 'cost', 'nextDue', 'note'];

/* ============ HTTP entry points ============ */

function doGet(e) {
  var data = {
    vehicles: readSheet_(SHEET_VEHICLES, VEHICLE_FIELDS),
    drivers: readSheet_(SHEET_DRIVERS, DRIVER_FIELDS),
    maintenance: readSheet_(SHEET_MAINTENANCE, MAINTENANCE_FIELDS)
  };
  return jsonOutput_(data);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var req = JSON.parse(e.postData.contents);
    var fields = fieldsFor_(req.sheet);
    if (req.action === 'upsert') {
      upsertRow_(req.sheet, fields, req.record);
    } else if (req.action === 'delete') {
      deleteRow_(req.sheet, req.id);
    } else {
      throw new Error('Unknown action: ' + req.action);
    }
    return jsonOutput_({ success: true });
  } catch (err) {
    return jsonOutput_({ success: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* ============ Sheet helpers ============ */

function fieldsFor_(sheetName) {
  if (sheetName === SHEET_VEHICLES) return VEHICLE_FIELDS;
  if (sheetName === SHEET_DRIVERS) return DRIVER_FIELDS;
  if (sheetName === SHEET_MAINTENANCE) return MAINTENANCE_FIELDS;
  throw new Error('Unknown sheet: ' + sheetName);
}

function getSheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) throw new Error('Khong tim thay sheet: ' + name);
  return sh;
}

function isDateValue_(val) {
  // Dung duck-typing thay vi "instanceof Date" vi gia tri tra ve tu getValues()
  // doi khi khong pass instanceof do khac boi canh thuc thi trong Apps Script.
  return Object.prototype.toString.call(val) === '[object Date]' && !isNaN(val.getTime());
}

function readSheet_(name, fields) {
  var sh = getSheet_(name);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  var values = sh.getRange(2, 1, lastRow - 1, fields.length).getValues();
  var tz = Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';
  return values
    .filter(function (row) { return row[0] !== ''; })
    .map(function (row) {
      var obj = {};
      fields.forEach(function (f, i) {
        var val = row[i];
        if (isDateValue_(val)) val = Utilities.formatDate(val, tz, 'yyyy-MM-dd');
        obj[f] = val;
      });
      return obj;
    });
}

function upsertRow_(sheetName, fields, record) {
  var sh = getSheet_(sheetName);
  var lastRow = sh.getLastRow();
  var rowIndex = -1;
  if (lastRow >= 2) {
    var ids = sh.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (ids[i][0] === record.id) { rowIndex = i + 2; break; }
    }
  }
  var rowValues = fields.map(function (f) { return record[f] !== undefined && record[f] !== null ? record[f] : ''; });
  // Ep dinh dang Van ban (Plain text) truoc khi ghi de Sheets tu dong doi
  // chuoi ngay ("2026-05-13") hay so dien thoai thanh kieu Date/Number.
  var targetRow = rowIndex > 0 ? rowIndex : sh.getLastRow() + 1;
  var range = sh.getRange(targetRow, 1, 1, fields.length);
  range.setNumberFormat('@');
  range.setValues([rowValues]);
}

function deleteRow_(sheetName, id) {
  var sh = getSheet_(sheetName);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return;
  var ids = sh.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === id) { sh.deleteRow(i + 2); return; }
  }
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ============ One-time setup ============ */

/**
 * Chay ham nay MOT LAN tu trinh soan thao Apps Script (chon setupAndSeed
 * trong thanh cong cu > bam Run) de tao 3 sheet va nap san 15 xe thuc te.
 * Neu sheet Vehicles da co du lieu, ham se KHONG ghi de.
 */
function setupAndSeed() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  createSheetIfMissing_(ss, SHEET_VEHICLES, VEHICLE_FIELDS);
  createSheetIfMissing_(ss, SHEET_DRIVERS, DRIVER_FIELDS);
  createSheetIfMissing_(ss, SHEET_MAINTENANCE, MAINTENANCE_FIELDS);

  var vehSheet = ss.getSheetByName(SHEET_VEHICLES);
  if (vehSheet.getLastRow() < 2) {
    var seed = seedVehicleRows_();
    var seedRange = vehSheet.getRange(2, 1, seed.length, VEHICLE_FIELDS.length);
    seedRange.setNumberFormat('@'); // tranh Sheets tu doi chuoi ngay thanh kieu Date
    seedRange.setValues(seed);
  }
  SpreadsheetApp.getActiveSpreadsheet().toast('Da tao sheet va nap du lieu xe. Tiep tuc Deploy > New deployment > Web app.', 'Hoan tat', 8);
}

/**
 * Chay ham nay MOT LAN neu sheet Vehicles cua ban da co du lieu tu truoc
 * (tao bang setupAndSeed() phien ban cu, chi co 16 cot) de bo sung header
 * "kmBD1"/"kmBD2" vao cuoi hang tieu de. Khong dong gi den du lieu da co.
 * An toan chay lai nhieu lan (bo qua neu da co header).
 */
function migrateAddKmFields() {
  var sh = getSheet_(SHEET_VEHICLES);
  var lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  if (headers.indexOf('kmBD1') > -1) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Da co san cot kmBD1/kmBD2, khong can migrate lai.', 'Bo qua', 6);
    return;
  }
  sh.getRange(1, lastCol + 1, 1, 2).setValues([['kmBD1', 'kmBD2']]);
  SpreadsheetApp.getActiveSpreadsheet().toast('Da them cot kmBD1/kmBD2 vao sheet Vehicles.', 'Hoan tat', 6);
}

/**
 * Chay ham nay MOT LAN de bo sung 4 cot anh giay to (photoDangKy, photoDangKiem,
 * photoBaoHiem, photoXe) vao cuoi hang tieu de sheet Vehicles. Khong dong gi den
 * du lieu da co. An toan chay lai nhieu lan (bo qua neu da co header).
 * Luu y: cac cot nay se luu chuoi anh nen (data URL base64) do client gui len,
 * moi o toi da ~50.000 ky tu theo gioi han cua Google Sheets.
 */
function migrateAddPhotoFields() {
  var sh = getSheet_(SHEET_VEHICLES);
  var lastCol = sh.getLastColumn();
  var headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  if (headers.indexOf('photoDangKy') > -1) {
    SpreadsheetApp.getActiveSpreadsheet().toast('Da co san cac cot anh, khong can migrate lai.', 'Bo qua', 6);
    return;
  }
  sh.getRange(1, lastCol + 1, 1, 4).setValues([['photoDangKy', 'photoDangKiem', 'photoBaoHiem', 'photoXe']]);
  SpreadsheetApp.getActiveSpreadsheet().toast('Da them 4 cot anh giay to vao sheet Vehicles.', 'Hoan tat', 6);
}

function createSheetIfMissing_(ss, name, fields) {
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, fields.length).setValues([fields]);
    sh.setFrozenRows(1);
  }
}

function seedVehicleRows_() {
  // Thu tu cot: id, plate, type, brand, year, odo, status, regExpiry, lastInspection,
  // insuranceStart, insuranceExpiry, driverId, owner, site, fuelNorm, note, kmBD1, kmBD2
  return [
    ['v1', '86H-0711', 'Xe con 8-9 chỗ', 'Toyota Land Cruiser', 2001, 462820, 'active', '2026-05-13', '2025-05-14', '2026-06-30', '2026-12-31', '', 'Công ty Điện lực Bình Thuận', 'CS2', '24 lít/100km', 'Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 450.102 km, cấp 2 ở 456.314 km (ngưỡng 5.000 km / 30.000 km — Xe con).', 450102, 456314],
    ['v2', '86A-016.98', 'Xe con 7 chỗ', 'Toyota Fortuner', 2013, 349697, 'active', '2026-08-12', '2025-09-12', '2026-06-30', '2026-12-31', '', 'Công ty Điện lực Bình Thuận', 'CS2', '17 lít/100km', 'Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 337.190 km, cấp 2 ở 343.490 km (ngưỡng 5.000 km / 30.000 km — Xe con).', 337190, 343490],
    ['v3', '86A-275.58', 'Xe con 7 chỗ', 'Toyota Fortuner', 2023, 76000, 'active', '2026-12-28', '2023-12-29', '2026-06-30', '2026-12-31', '', 'Công ty Điện lực Bình Thuận', 'CS2', '17 lít/100km', 'Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 72.508 km, cấp 2 ở 67.320 km (ngưỡng 5.000 km / 30.000 km — Xe con).', 72508, 67320],
    ['v4', '86H-3885', 'Xe bán tải', 'Isuzu D-Max', 2008, 30038, 'active', '2026-09-09', '2026-10-03', '2026-06-30', '2026-12-31', '', 'Công ty Điện lực Bình Thuận', 'CS2', '14 lít/100km', 'Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 28.113 km, cấp 2 ở 19.985 km (ngưỡng 5.000 km / 30.000 km — Xe con/ Xe bán tải).', 28113, 19985],
    ['v5', '86C-031.86', 'Xe tải thùng kín', 'Isuzu NPR85LK Cab', 2013, 126429, 'active', '2026-08-24', '2026-02-25', '2026-06-30', '2026-12-31', '', 'Công ty Điện lực Bình Thuận', 'CS2', '19 lít/100km', 'Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 124.861 km, cấp 2 ở 120.684 km (ngưỡng 4.000 km / 80.000 km — Xe con / Xe tải).', 124861, 120684],
    ['v6', '86A-181.81', 'Xe con 7 chỗ', 'Hyundai Santa Fe', 2020, 99839, 'active', '2028-04-18', '2026-10-19', '2026-06-30', '2026-12-31', '', 'Công ty Điện lực Bình Thuận', 'CS2', '15 lít/100km', 'Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 89.372 km, cấp 2 ở 95.172 km (ngưỡng 5.000 km / 30.000 km — Xe con).', 95000, 95172],
    ['v7', '86B-014.73', 'Xe khách 16 chỗ', 'Hyundai Solati', 2019, 86449, 'active', '2027-01-07', '2026-07-08', '2026-06-30', '2026-12-31', '', 'Công ty Điện lực Bình Thuận', 'CS2', '17 lít/100km', 'Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 77.119 km, cấp 2 ở 81.714 km (ngưỡng 5.000 km / 30.000 km — Xe ô tô 04 đến 16 chỗ).', 77119, 81714],
    ['v8', '86A-015.56', 'Xe con 5 chỗ', 'Honda Civic', 2013, 273028, 'active', '2026-12-03', '2025-12-04', '2026-06-30', '2026-12-31', '', 'Công ty Điện lực Bình Thuận', 'CS2', '12 lít/100km', 'Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 272.886 km, cấp 2 ở 265.791 km (ngưỡng 5.000 km / 30.000 km — Xe con).', 272886, 265791],
    ['v9', '86A-086.15', 'Xe con 7 chỗ', 'Nissan X-Trail', 2018, 149817, 'active', '2027-03-17', '2026-03-18', '2026-06-30', '2026-12-31', '', 'Công ty Điện lực Bình Thuận', 'CS2', '16 lít/100km', 'Đăng ký tại: ĐL T.Đ.Thắng, Xuân An, Phan Thiết, Bình Thuận. Bảo dưỡng gần nhất: cấp 1 ở 141.888 km, cấp 2 ở 134.965 km (ngưỡng 5.000 km / 80.000 km — Xe con).', 141888, 134965],
    ['v10', '48A-088.82', 'Xe con 7 chỗ', 'Nissan X-Trail', 2019, 121216, 'active', '2027-11-04', '2025-11-05', '2026-01-31', '2027-01-30', '', 'Công ty Điện lực Đắk Nông', 'CS3', '16 lít/100km', 'Đăng ký tại: Số 02 Lê Duẩn, phường Nghĩa Tân, TP Gia Nghĩa, tỉnh Đắk Nông. Bảo dưỡng gần nhất: cấp 1 ở 120.000 km, cấp 2 ở 120.000 km (ngưỡng 5.000 km / 30.000 km — Xe con).', 120000, 120000],
    ['v11', '49A-995.16', 'Xe khách 16 chỗ', 'Ford Transit', 2018, 295330, 'active', '2026-10-13', '2026-04-14', '2025-12-31', '2026-12-31', '', 'Công ty Điện lực Lâm Đồng', 'CS3', '20 lít/100km', 'Đăng ký tại: Số 02 Hùng Vương, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng. Bảo dưỡng gần nhất: cấp 1 ở 295.000 km, cấp 2 ở 270.000 km (ngưỡng 5.000 km / 30.000 km — Xe con).', 295000, 270000],
    ['v12', '49A-996.67', 'Xe tải cẩu (gầu)', 'Hino FG8', 2016, 142912, 'active', '2026-12-22', '2026-06-23', '2025-12-31', '2026-12-31', '', 'Công ty Điện lực Lâm Đồng', 'CS3', '27 lít/100km + 7 lít/giờ cẩu', 'Đăng ký tại: Số 02 Hùng Vương, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng. Bảo dưỡng gần nhất: cấp 1 ở 140.000 km, cấp 2 ở 120.000 km (ngưỡng 4.000 km / 24.000 km — xe cẩu).', 140000, 120000],
    ['v13', '49B-172.35', 'Xe con 7 chỗ', 'Mitsubishi Pajero', 2004, 919636, 'active', '2026-09-22', '2026-03-24', '2025-12-31', '2026-12-31', '', 'Công ty Điện lực Lâm Đồng', 'CS3', '21 lít/100km', 'Đăng ký tại: Số 02 Hùng Vương, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng. Bảo dưỡng gần nhất: cấp 1 ở 915.000 km, cấp 2 ở 900.000 km (ngưỡng 5.000 km / 30.000 km — Xe con).', 915000, 900000],
    ['v14', '49B-172.63', 'Xe con 8-9 chỗ', 'Hyundai Starex', 2016, 371699, 'active', '2027-07-06', '2026-07-07', '2025-12-31', '2026-12-31', '', 'Công ty Điện lực Lâm Đồng', 'CS3', '18 lít/100km', 'Đăng ký tại: Số 02 Hùng Vương, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng. Bảo dưỡng gần nhất: cấp 1 ở 370.000 km, cấp 2 ở 360.000 km (ngưỡng 5.000 km / 30.000 km — Xe con).', 370000, 360000],
    ['v15', '49B-173.07', 'Xe con 5 chỗ', 'Toyota Camry', 2010, 470178, 'active', '2027-03-10', '2026-03-11', '2025-12-31', '2026-12-31', '', 'Công ty Điện lực Lâm Đồng', 'CS3', '20 lít/100km', 'Đăng ký tại: Số 02 Hùng Vương, phường Xuân Hương - Đà Lạt, tỉnh Lâm Đồng. Bảo dưỡng gần nhất: cấp 1 ở 470.000 km, cấp 2 ở 450.000 km (ngưỡng 5.000 km / 30.000 km — Xe con).', 470000, 450000]
  ];
}
