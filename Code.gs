// ═══════════════════════════════════════════════════════════════
//  PhoOS — Apps Script Backend v1.0
//  Dành cho: Nhà hàng phở / Vietnamese Restaurant
//
//  Tính năng:
//  - Form đặt bàn online (party size, location, date, time)
//  - Email notification khi có reservation mới
//  - Telegram notification khi có reservation mới
//  - Admin API: Reservations, Menu, Gallery, Reviews, About, Settings
//  - Stats endpoint (today/week/month, revenue)
//  - Polling endpoint cho admin dashboard
//
//  Google Sheet cần 6 tabs (đúng thứ tự):
//  Reservations | Menu | Gallery | Reviews | About | Settings
//
//  Deploy: Extensions → Apps Script → Deploy → New deployment
//          Type: Web App | Execute as: Me | Access: Anyone
// ═══════════════════════════════════════════════════════════════

const ALLOWED_EMAIL = "owner@gmail.com";  // ← ĐỔI: Gmail chủ nhà hàng
const ADMIN_SECRET  = "your-secret-123";  // ← ĐỔI: chuỗi bí mật tự đặt

// ─── ROUTER: GET ─────────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action;
  const secret = e.parameter.secret;

  // ── Public — landing page đọc ──
  if (action === "getMenu")         return respond(getMenu());
  if (action === "getServices")     return respond(getMenu());      // alias cho Next.js
  if (action === "getSettings")     return respond(getSettings());
  if (action === "getGallery")      return respond(getGallery());
  if (action === "getTestimonials") return respond(getReviews());   // alias
  if (action === "getReviews")      return respond(getReviews());
  if (action === "getAbout")        return respond(getAbout());
  if (action === "getStaffPublic")  return respond([]);             // nhà hàng không cần

  // ── Protected — admin dashboard ──
  if (!verifySecret(secret)) return respond({ error: "Unauthorized" });

  if (action === "getReservations") return respond(getReservations());
  if (action === "getBookings")     return respond(getReservations()); // alias
  if (action === "getStaff")        return respond([]);               // nhà hàng không dùng
  if (action === "getStats")        return respond(getStats());
  if (action === "pollBookings")    return respond(pollReservations(e.parameter.since));
  if (action === "pollReservations")return respond(pollReservations(e.parameter.since));

  return respond({ error: "Unknown action" });
}

// ─── ROUTER: POST ────────────────────────────────────────────
function doPost(e) {
  let rawData;
  try {
    rawData = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond({ error: "Invalid JSON" });
  }

  // Bỏ qua Telegram webhook
  if (rawData.message || rawData.callback_query) {
    return respond({ ok: true });
  }

  const action = rawData.action;
  const secret = rawData.secret;

  // ── Public ──
  if (action === "submitReservation") return respond(submitReservation(rawData));
  if (action === "submitBooking")     return respond(submitReservation(rawData)); // alias
  if (action === "submitContact")     return respond(submitContact(rawData));

  // ── Protected ──
  if (!verifySecret(secret)) return respond({ error: "Unauthorized" });

  if (action === "updateBookingStatus")   return respond(updateReservationStatus(rawData));
  if (action === "updateReservationStatus") return respond(updateReservationStatus(rawData));

  // Menu CRUD
  if (action === "addService")      return respond(addMenuItem(rawData));
  if (action === "addMenuItem")     return respond(addMenuItem(rawData));
  if (action === "updateService")   return respond(updateMenuItem(rawData));
  if (action === "updateMenuItem")  return respond(updateMenuItem(rawData));
  if (action === "deleteService")   return respond(deleteMenuItem(rawData));
  if (action === "deleteMenuItem")  return respond(deleteMenuItem(rawData));

  // Gallery CRUD
  if (action === "addGallery")        return respond(addGallery(rawData));
  if (action === "updateGallery")     return respond(updateGallery(rawData));
  if (action === "deleteGallery")     return respond(deleteGallery(rawData));

  // Reviews CRUD
  if (action === "addTestimonial")    return respond(addReview(rawData));
  if (action === "addReview")         return respond(addReview(rawData));
  if (action === "updateTestimonial") return respond(updateReview(rawData));
  if (action === "updateReview")      return respond(updateReview(rawData));
  if (action === "deleteTestimonial") return respond(deleteReview(rawData));
  if (action === "deleteReview")      return respond(deleteReview(rawData));

  // Staff — nhà hàng không dùng, trả về empty
  if (action === "addStaff")    return respond({ success: true });
  if (action === "updateStaff") return respond({ success: true });
  if (action === "deleteStaff") return respond({ success: true });

  // About & Settings
  if (action === "updateAbout")    return respond(updateAbout(rawData));
  if (action === "updateSettings") return respond(updateSettings(rawData));

  return respond({ error: "Unknown action" });
}

// ─── AUTH ────────────────────────────────────────────────────
function verifySecret(secret) {
  return secret === ADMIN_SECRET;
}

// ─── HELPERS ─────────────────────────────────────────────────
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function sheetToObjects(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => String(h).trim());
  return rows.slice(1).map((row, i) => {
    const obj = { _row: i + 2 };
    headers.forEach((h, j) => { obj[h] = row[j]; });
    return obj;
  });
}

function keyValueToObject(sheet) {
  if (!sheet) return {};
  const rows = sheet.getDataRange().getValues();
  const result = {};
  rows.slice(1).forEach(row => {
    if (row[0]) result[String(row[0]).trim()] = row[1];
  });
  return result;
}

function updateKeyValue(sheet, data) {
  const rows   = sheet.getDataRange().getValues();
  const keyMap = {};
  rows.forEach((row, i) => {
    const key = String(row[0]).trim();
    if (key) keyMap[key] = i + 1;
  });
  Object.keys(data).forEach(key => {
    if (["action","_row","secret"].includes(key)) return;
    if (data[key] === undefined || data[key] === null) return;
    if (keyMap[key]) {
      sheet.getRange(keyMap[key], 2).setValue(data[key]);
    } else {
      const lastRow = sheet.getLastRow() + 1;
      sheet.getRange(lastRow, 1).setValue(key);
      sheet.getRange(lastRow, 2).setValue(data[key]);
      keyMap[key] = lastRow;
    }
  });
  return { success: true };
}

function getNextId(sheet) {
  const rows = sheet.getDataRange().getValues();
  return rows.length > 1 ? Number(rows[rows.length - 1][0]) + 1 : 1;
}

// ─── TELEGRAM ────────────────────────────────────────────────
function sendTelegram(text, settings) {
  const s      = settings || getSettings();
  const token  = s.telegram_bot_token;
  const chatId = s.telegram_chat_id;
  if (!token || !chatId) return;
  try {
    UrlFetchApp.fetch(
      "https://api.telegram.org/bot" + token + "/sendMessage",
      {
        method:      "post",
        contentType: "application/json",
        payload: JSON.stringify({
          chat_id:    chatId,
          text:       text,
          parse_mode: "Markdown",
        }),
      }
    );
  } catch (e) {
    Logger.log("Telegram error: " + e.message);
  }
}

function sendTelegramReservationAlert(data, settings) {
  const msg = [
    "🍜 *New Reservation!*",
    "",
    "👤 *Guest:*     " + data.name,
    "📞 *Phone:*    " + data.phone,
    "👥 *Party:*     " + (data.party || data.service || ""),
    "📍 *Location:*  " + (data.location || "Main"),
    "📅 *Date:*      " + data.date,
    "🕐 *Time:*      " + data.time,
    data.notes ? "📝 *Notes:*    " + data.notes : "",
  ].filter(Boolean).join("\n");
  sendTelegram(msg, settings);
}

// ─── PUBLIC: GET MENU ────────────────────────────────────────
function getMenu() {
  const sheet = getSheet("Menu");
  if (!sheet) return [];
  return sheetToObjects(sheet)
    .filter(item => item.Active === true || item.Active === "TRUE")
    .map(item => ({
      _row:     item._row,
      ID:       item.ID,
      Category: item.Category || "",
      Name:     item.Name     || "",
      Price:    item.Price    || "",
      Desc:     item.Desc     || "",
      Tags:     item.Tags     ? String(item.Tags).split(",").map(t => t.trim()).filter(Boolean) : [],
      Img:      item.Img      || "",
      Featured: item.Featured === true || item.Featured === "TRUE",
      Active:   true,
      // Alias cho compatibility
      Tag:      item.Category || "",
      Duration: "",
    }));
}

// ─── PUBLIC: GET SETTINGS ────────────────────────────────────
function getSettings() {
  return keyValueToObject(getSheet("Settings"));
}

// ─── PUBLIC: GET GALLERY ─────────────────────────────────────
function getGallery() {
  const sheet = getSheet("Gallery");
  if (!sheet) return [];
  return sheetToObjects(sheet)
    .filter(g => (g.Active === true || g.Active === "TRUE") && g.Image_URL);
}

// ─── PUBLIC: GET REVIEWS ─────────────────────────────────────
function getReviews() {
  const sheet = getSheet("Reviews");
  if (!sheet) return [];
  return sheetToObjects(sheet)
    .filter(r => r.Active === true || r.Active === "TRUE")
    .map(r => ({
      _row:       r._row,
      ID:         r.ID,
      Name:       r.Name,
      Review:     r.Review,
      Stars:      r.Stars,
      Avatar_URL: r.Avatar_URL || "",
      Active:     true,
    }));
}

// ─── PUBLIC: GET ABOUT ───────────────────────────────────────
function getAbout() {
  return keyValueToObject(getSheet("About"));
}

// ─── PUBLIC: SUBMIT RESERVATION ──────────────────────────────
function submitReservation(data) {
  // Validate bắt buộc
  const required = ["name", "phone", "date", "time"];
  for (const field of required) {
    if (!data[field]) return { error: "Missing: " + field };
  }

  const sheet = getSheet("Reservations");
  const ts    = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

  // Party size — từ field "guests" hoặc "service" (alias)
  const party = data.party || data.guests || data.service || "";

  sheet.appendRow([
    ts,               // Timestamp
    data.name,        // Name
    data.phone,       // Phone
    data.email || "", // Email
    party,            // Party
    data.date,        // Date
    data.time,        // Time
    data.location || "Main", // Location
    data.notes || "", // Notes
    "Pending",        // Status
  ]);

  const settings      = getSettings();
  const notifyEmail   = settings.notify_email || ALLOWED_EMAIL;
  const restaurantName = settings.salon_name  || "AN PHỞ";
  const phone          = settings.phone       || "";

  // ── Email cho nhà hàng ──
  MailApp.sendEmail({
    to:      notifyEmail,
    subject: "🍜 New Reservation: " + data.name + " — " + (party || data.time),
    body: [
      "New table reservation!\n",
      "Guest:    " + data.name,
      "Phone:    " + data.phone,
      "Email:    " + (data.email    || "N/A"),
      "Party:    " + (party         || "N/A"),
      "Location: " + (data.location || "Main"),
      "Date:     " + data.date,
      "Time:     " + data.time,
      "Notes:    " + (data.notes    || "None"),
      "\n→ Login to Admin Dashboard to confirm.",
    ].join("\n"),
  });

  // ── Email xác nhận cho khách ──
  if (data.email) {
    MailApp.sendEmail({
      to:      data.email,
      subject: "Your table reservation — " + restaurantName + " 🍜",
      body: [
        "Hi " + data.name + ",\n",
        "Thank you for your reservation at " + restaurantName + "!\n",
        "Party:    " + (party         || ""),
        "Location: " + (data.location || "Main"),
        "Date:     " + data.date,
        "Time:     " + data.time,
        "\nWe'll confirm within 2 hours during business hours.",
        phone ? "\nCall us: " + phone : "",
        "\nSee you soon! 🍜\n" + restaurantName,
      ].filter(Boolean).join("\n"),
    });
  }

  // ── Telegram ──
  sendTelegramReservationAlert({ ...data, party }, settings);

  return { success: true };
}

// ─── PUBLIC: SUBMIT CONTACT ──────────────────────────────────
function submitContact(data) {
  const settings    = getSettings();
  const notifyEmail = settings.notify_email || ALLOWED_EMAIL;

  MailApp.sendEmail({
    to:      notifyEmail,
    subject: "📬 Contact Form: " + (data.name || "Unknown"),
    body: [
      "New contact form submission:\n",
      "Name:    " + (data.name    || ""),
      "Phone:   " + (data.phone   || ""),
      "Email:   " + (data.email   || ""),
      "Message: " + (data.message || ""),
    ].join("\n"),
  });

  const msg = [
    "📬 *Contact Form*",
    "",
    "👤 " + (data.name    || ""),
    "📞 " + (data.phone   || ""),
    "✉️ " + (data.email   || ""),
    "💬 " + (data.message || ""),
  ].join("\n");
  sendTelegram(msg, settings);

  return { success: true };
}

// ─── ADMIN: RESERVATIONS ─────────────────────────────────────
function getReservations() {
  return sheetToObjects(getSheet("Reservations")).reverse();
}

function pollReservations(since) {
  const all = sheetToObjects(getSheet("Reservations"));
  if (!since) return { bookings: all.reverse(), count: all.length };

  const sinceTime = new Date(since).getTime();
  const newOnes   = all.filter(r => {
    try { return new Date(r.Timestamp).getTime() > sinceTime; }
    catch (_) { return false; }
  });

  return {
    bookings: newOnes.reverse(),
    count:    newOnes.length,
    hasNew:   newOnes.length > 0,
  };
}

function updateReservationStatus(data) {
  const sheet = getSheet("Reservations");

  // Reservations columns:
  // 1=Timestamp 2=Name 3=Phone 4=Email 5=Party 6=Date 7=Time 8=Location 9=Notes 10=Status
  if (data.status   !== undefined) sheet.getRange(data._row, 10).setValue(data.status);
  if (data.date     !== undefined) sheet.getRange(data._row, 6).setValue(data.date);
  if (data.time     !== undefined) sheet.getRange(data._row, 7).setValue(data.time);
  if (data.location !== undefined) sheet.getRange(data._row, 8).setValue(data.location);
  if (data.staff    !== undefined) {} // nhà hàng không cần staff field

  // Telegram khi đổi status
  if (data.status && data.clientName) {
    const settings = getSettings();
    const emoji    = data.status === "Confirmed" ? "✅"
                   : data.status === "Done"      ? "🎉"
                   : data.status === "Cancelled"  ? "❌" : "🔄";
    const msg = [
      emoji + " *Reservation " + data.status + "*",
      "",
      "👤 " + data.clientName,
      "👥 " + (data.service || ""),
      "📅 " + (data.date    || "") + " 🕐 " + (data.time || ""),
    ].join("\n");
    sendTelegram(msg, settings);
  }

  return { success: true };
}

// ─── ADMIN: STATS ────────────────────────────────────────────
function getStats() {
  const reservations = sheetToObjects(getSheet("Reservations"));
  const today        = Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyy-MM-dd");
  const thisMonth    = Utilities.formatDate(new Date(), "America/Los_Angeles", "M/yyyy");

  const todayList = reservations.filter(r => String(r.Date) === today);
  const weekList  = reservations.filter(r => isInThisWeek(r.Date));
  const monthList = reservations.filter(r => isInMonth(r.Date, thisMonth));
  const pending   = reservations.filter(r => r.Status === "Pending");
  const confirmed = reservations.filter(r => r.Status === "Confirmed");
  const done      = reservations.filter(r => r.Status === "Done");
  const cancelled = reservations.filter(r => r.Status === "Cancelled");

  // Revenue: đếm từ menu theo tên party size (ước tính)
  // Với nhà hàng, revenue tính theo số bàn Done × avg spend
  const avgSpend = 45; // $45/người trung bình
  const revenueMonth = monthList
    .filter(r => r.Status === "Done")
    .reduce((sum, r) => {
      const guests = String(r.Party || "").match(/(\d+)/);
      const num    = guests ? Number(guests[1]) : 2;
      return sum + num * avgSpend;
    }, 0);

  // Top locations
  const locationCount = {};
  reservations.forEach(r => {
    const loc = r.Location || "Main";
    locationCount[loc] = (locationCount[loc] || 0) + 1;
  });
  const topServices = Object.entries(locationCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // Top party sizes
  const partyCount = {};
  reservations.forEach(r => {
    if (r.Party) partyCount[r.Party] = (partyCount[r.Party] || 0) + 1;
  });
  const topStaff = Object.entries(partyCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    today:        todayList.length,
    thisWeek:     weekList.length,
    thisMonth:    monthList.length,
    total:        reservations.length,
    pending:      pending.length,
    confirmed:    confirmed.length,
    done:         done.length,
    cancelled:    cancelled.length,
    revenueMonth,
    topServices,   // top locations
    topStaff,      // top party sizes
  };
}

function isInThisWeek(dateStr) {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const start = new Date(now); start.setDate(now.getDate() - now.getDay());
    const end   = new Date(now); end.setDate(now.getDate() + (6 - now.getDay()));
    return d >= start && d <= end;
  } catch (_) { return false; }
}

function isInMonth(dateStr, monthStr) {
  try {
    const d = new Date(dateStr);
    return Utilities.formatDate(d, "America/Los_Angeles", "M/yyyy") === monthStr;
  } catch (_) { return false; }
}

// ─── ADMIN: MENU CRUD ────────────────────────────────────────
function addMenuItem(data) {
  const sheet = getSheet("Menu");
  sheet.appendRow([
    getNextId(sheet),
    data.Category || "",
    data.Name     || "",
    data.Price    || "",
    data.Desc     || "",
    data.Tags     || "",
    data.Img      || "",
    data.Featured || false,
    true,
  ]);
  return { success: true };
}

function updateMenuItem(data) {
  const sheet = getSheet("Menu");
  // Columns: ID | Category | Name | Price | Desc | Tags | Img | Featured | Active
  const cols = ["ID","Category","Name","Price","Desc","Tags","Img","Featured","Active"];
  cols.forEach((col, i) => {
    if (data[col] !== undefined) sheet.getRange(data._row, i + 1).setValue(data[col]);
  });
  return { success: true };
}

function deleteMenuItem(data) {
  getSheet("Menu").deleteRow(data._row);
  return { success: true };
}

// ─── ADMIN: GALLERY CRUD ─────────────────────────────────────
function addGallery(data) {
  const sheet = getSheet("Gallery");
  sheet.appendRow([getNextId(sheet), data.Image_URL || "", data.Caption || "", data.Category || "Food", true]);
  return { success: true };
}

function updateGallery(data) {
  const sheet = getSheet("Gallery");
  sheet.getRange(data._row, 2).setValue(data.Image_URL || "");
  sheet.getRange(data._row, 3).setValue(data.Caption   || "");
  sheet.getRange(data._row, 4).setValue(data.Category  || "Food");
  sheet.getRange(data._row, 5).setValue(data.Active);
  return { success: true };
}

function deleteGallery(data) {
  getSheet("Gallery").deleteRow(data._row);
  return { success: true };
}

// ─── ADMIN: REVIEWS CRUD ─────────────────────────────────────
function addReview(data) {
  const sheet = getSheet("Reviews");
  sheet.appendRow([getNextId(sheet), data.Name || "", data.Review || "", data.Stars || 5, data.Avatar_URL || "", true]);
  return { success: true };
}

function updateReview(data) {
  const sheet = getSheet("Reviews");
  sheet.getRange(data._row, 2).setValue(data.Name       || "");
  sheet.getRange(data._row, 3).setValue(data.Review     || "");
  sheet.getRange(data._row, 4).setValue(data.Stars      || 5);
  sheet.getRange(data._row, 5).setValue(data.Avatar_URL || "");
  sheet.getRange(data._row, 6).setValue(data.Active);
  return { success: true };
}

function deleteReview(data) {
  getSheet("Reviews").deleteRow(data._row);
  return { success: true };
}

// ─── ADMIN: ABOUT & SETTINGS ─────────────────────────────────
function updateAbout(data) {
  return updateKeyValue(getSheet("About"), data);
}

function updateSettings(data) {
  return updateKeyValue(getSheet("Settings"), data);
}

// ═══════════════════════════════════════════════════════════════
//  TEST FUNCTIONS — Chạy trong Apps Script Editor để test
// ═══════════════════════════════════════════════════════════════

function testSubmitReservation() {
  const result = doPost({
    postData: {
      contents: JSON.stringify({
        action:   "submitReservation",
        name:     "Nguyen Van An",
        phone:    "916-000-0000",
        email:    ALLOWED_EMAIL,
        party:    "3–4 guests",
        location: "Elk Grove (Main)",
        date:     "2026-07-01",
        time:     "7:00 PM",
        notes:    "Anniversary dinner, please prepare a candle",
      })
    }
  });
  Logger.log(result.getContent());
}

function testTelegram() {
  const settings = getSettings();
  Logger.log("token:  " + settings.telegram_bot_token);
  Logger.log("chatId: " + settings.telegram_chat_id);
  sendTelegram("✅ Telegram bot kết nối thành công với " + (settings.salon_name || "AN PHỞ") + "! 🍜", settings);
  Logger.log("Sent!");
}

function testReservationAlert() {
  const settings = getSettings();
  sendTelegramReservationAlert({
    name:     "Test Guest",
    phone:    "916-555-0000",
    party:    "4–5 guests",
    location: "Elk Grove (Main)",
    date:     "2026-07-01",
    time:     "7:00 PM",
    notes:    "Test notification",
  }, settings);
  Logger.log("Reservation alert sent!");
}

function testEmail() {
  const settings = getSettings();
  Logger.log("notify_email: " + settings.notify_email);
  MailApp.sendEmail({
    to:      settings.notify_email || ALLOWED_EMAIL,
    subject: "🍜 Test Email — " + (settings.salon_name || "AN PHỞ"),
    body:    "Email notification hoạt động bình thường!",
  });
  Logger.log("Email sent!");
}

function testGetStats() {
  Logger.log(JSON.stringify(getStats()));
}

function testGetMenu() {
  Logger.log(JSON.stringify(getMenu()));
}
