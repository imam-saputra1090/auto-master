/**
 * ============================================================
 * AutoMaster Game - Google Apps Script Backend
 * Project: PROJEK GIM
 * ============================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Paste this entire file into Code.gs in your Apps Script project
 * 2. Run the SETUP() function once to create sheets with headers
 * 3. Deploy as Web App (Execute as: Me, Access: Anyone)
 * 4. Copy the Web App URL and use it in your game client
 * 
 * ENDPOINTS (via doGet / doPost):
 *   POST /register      - Student self-registration
 *   POST /login         - Student login
 *   POST /syncProgress  - Save student progress/scores
 *   GET  /getProgress   - Retrieve student progress
 *   GET  /leaderboard   - Get top scores per level
 *   GET  /getStudents   - Get all students (teacher mode)
 * 
 * SHEETS:
 *   "users"    : NIS | Nama | Kelas | WA | PasswordHash | RegisteredAt
 *   "scores"   : NIS | Nama | Level | Phase | Score | Stars | XP | Timestamp
 *   "sessions" : NIS | LoginTime | Device | UserAgent
 * ============================================================
 */

// ===================== CONFIGURATION =====================

var TEACHER_SECRET = "AutoMaster2024!Guru";  // Change this to your own secret key
var SPREADSHEET_ID = "";  // Leave empty to use the bound spreadsheet, or set a specific ID
var MAX_LEADERBOARD = 20; // Max entries per leaderboard query
var SESSION_TOKEN_LENGTH = 32;

// ===================== SETUP FUNCTION =====================

/**
 * Run this function ONCE to create the required sheets with headers.
 * Go to Run > SETUP in the Apps Script editor.
 */
function SETUP() {
  var ss = getSpreadsheet_();
  
  // --- Sheet: users ---
  var usersSheet = ss.getSheetByName("users");
  if (!usersSheet) {
    usersSheet = ss.insertSheet("users");
    Logger.log("Created sheet: users");
  }
  var usersHeaders = ["NIS", "Nama", "Kelas", "WA", "PasswordHash", "RegisteredAt"];
  usersSheet.getRange(1, 1, 1, usersHeaders.length).setValues([usersHeaders]);
  usersSheet.getRange(1, 1, 1, usersHeaders.length)
    .setFontWeight("bold")
    .setBackground("#4285f4")
    .setFontColor("#ffffff");
  usersSheet.setFrozenRows(1);
  // Set column widths
  usersSheet.setColumnWidth(1, 120); // NIS
  usersSheet.setColumnWidth(2, 200); // Nama
  usersSheet.setColumnWidth(3, 100); // Kelas
  usersSheet.setColumnWidth(4, 150); // WA
  usersSheet.setColumnWidth(5, 300); // PasswordHash
  usersSheet.setColumnWidth(6, 180); // RegisteredAt
  
  // --- Sheet: scores ---
  var scoresSheet = ss.getSheetByName("scores");
  if (!scoresSheet) {
    scoresSheet = ss.insertSheet("scores");
    Logger.log("Created sheet: scores");
  }
  var scoresHeaders = ["NIS", "Nama", "Level", "Phase", "Score", "Stars", "XP", "Timestamp"];
  scoresSheet.getRange(1, 1, 1, scoresHeaders.length).setValues([scoresHeaders]);
  scoresSheet.getRange(1, 1, 1, scoresHeaders.length)
    .setFontWeight("bold")
    .setBackground("#34a853")
    .setFontColor("#ffffff");
  scoresSheet.setFrozenRows(1);
  scoresSheet.setColumnWidth(1, 120);
  scoresSheet.setColumnWidth(2, 200);
  scoresSheet.setColumnWidth(3, 100);
  scoresSheet.setColumnWidth(4, 100);
  scoresSheet.setColumnWidth(5, 100);
  scoresSheet.setColumnWidth(6, 80);
  scoresSheet.setColumnWidth(7, 80);
  scoresSheet.setColumnWidth(8, 180);
  
  // --- Sheet: sessions ---
  var sessionsSheet = ss.getSheetByName("sessions");
  if (!sessionsSheet) {
    sessionsSheet = ss.insertSheet("sessions");
    Logger.log("Created sheet: sessions");
  }
  var sessionsHeaders = ["NIS", "LoginTime", "Device", "UserAgent"];
  sessionsSheet.getRange(1, 1, 1, sessionsHeaders.length).setValues([sessionsHeaders]);
  sessionsSheet.getRange(1, 1, 1, sessionsHeaders.length)
    .setFontWeight("bold")
    .setBackground("#fbbc05")
    .setFontColor("#333333");
  sessionsSheet.setFrozenRows(1);
  sessionsSheet.setColumnWidth(1, 120);
  sessionsSheet.setColumnWidth(2, 180);
  sessionsSheet.setColumnWidth(3, 150);
  sessionsSheet.setColumnWidth(4, 400);
  
  // Remove default "Sheet1" if it exists and is empty
  var defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      var lastRow = defaultSheet.getLastRow();
      if (lastRow === 0) {
        ss.deleteSheet(defaultSheet);
        Logger.log("Removed empty Sheet1");
      }
    } catch (e) {
      // Ignore if can't delete
    }
  }
  
  Logger.log("✅ SETUP complete! All sheets created with headers.");
  Logger.log("Now deploy this project as a Web App.");
  Logger.log("   Execute as: Me");
  Logger.log("   Who has access: Anyone");
}

// ===================== HTTP HANDLERS =====================

/**
 * Handles GET requests
 * URL params: action, nis, level, secret, token
 */
function doGet(e) {
  var params = e.parameter || {};
  var action = (params.action || "").toLowerCase().trim();
  
  var result;
  
  try {
    switch (action) {
      case "getprogress":
        result = handleGetProgress_(params);
        break;
      case "leaderboard":
        result = handleLeaderboard_(params);
        break;
      case "getstudents":
        result = handleGetStudents_(params);
        break;
      case "ping":
        result = makeResponse_(true, "AutoMaster API is running", { 
          version: "1.0.0", 
          timestamp: new Date().toISOString() 
        });
        break;
      default:
        result = makeResponse_(false, "Unknown action: " + action + ". Valid GET actions: getProgress, leaderboard, getStudents, ping", null);
    }
  } catch (err) {
    result = makeResponse_(false, "Server error: " + err.message, null);
  }
  
  return jsonOutput_(result);
}

/**
 * Handles POST requests
 * Body JSON: { action, ... }
 */
function doPost(e) {
  var body;
  
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput_(makeResponse_(false, "Invalid JSON in request body", null));
  }
  
  var action = (body.action || "").toLowerCase().trim();
  var result;
  
  try {
    switch (action) {
      case "register":
        result = handleRegister_(body);
        break;
      case "login":
        result = handleLogin_(body);
        break;
      case "syncprogress":
        result = handleSyncProgress_(body);
        break;
      case "updateprofile":
        result = handleUpdateProfile_(body);
        break;
      default:
        result = makeResponse_(false, "Unknown action: " + action + ". Valid POST actions: register, login, syncProgress, updateProfile", null);
    }
  } catch (err) {
    result = makeResponse_(false, "Server error: " + err.message, null);
  }
  
  return jsonOutput_(result);
}

// ===================== ENDPOINT HANDLERS =====================

/**
 * POST /register
 * Body: { action: "register", nis, nama, kelas, wa, password }
 */
function handleRegister_(body) {
  var nis      = sanitize_(body.nis);
  var nama     = sanitize_(body.nama);
  var kelas    = sanitize_(body.kelas);
  var wa       = sanitize_(body.wa);
  var password = body.password || "";
  
  // --- Validation ---
  if (!nis || !nama || !kelas || !wa || !password) {
    return makeResponse_(false, "Semua field wajib diisi: nis, nama, kelas, wa, password", null);
  }
  
  if (!/^\d{4,20}$/.test(nis)) {
    return makeResponse_(false, "NIS harus berupa angka (4-20 digit)", null);
  }
  
  if (nama.length < 2 || nama.length > 100) {
    return makeResponse_(false, "Nama harus 2-100 karakter", null);
  }
  
  if (kelas.length < 1 || kelas.length > 20) {
    return makeResponse_(false, "Kelas tidak valid", null);
  }
  
  if (!/^08\d{8,13}$/.test(wa)) {
    return makeResponse_(false, "Nomor WA harus diawali 08 dan berisi 10-15 digit", null);
  }
  
  if (password.length < 4) {
    return makeResponse_(false, "Password minimal 4 karakter", null);
  }
  
  // --- Check duplicate NIS ---
  var usersSheet = getSheet_("users");
  var existingUser = findUserByNIS_(usersSheet, nis);
  
  if (existingUser) {
    return makeResponse_(false, "NIS " + nis + " sudah terdaftar", null);
  }
  
  // --- Hash password and save ---
  var passwordHash = hashSHA256_(password);
  var registeredAt = formatDateTime_(new Date());
  
  usersSheet.appendRow([nis, nama, kelas, wa, passwordHash, registeredAt]);
  
  // Flush to make sure data is written
  SpreadsheetApp.flush();
  
  return makeResponse_(true, "Registrasi berhasil! Selamat datang, " + nama, {
    nis: nis,
    nama: nama,
    kelas: kelas,
    registeredAt: registeredAt
  });
}

/**
 * POST /login
 * Body: { action: "login", nis, password, device?, userAgent? }
 */
function handleLogin_(body) {
  var nis      = sanitize_(body.nis);
  var password = body.password || "";
  var device   = sanitize_(body.device || "Unknown");
  var userAgent = sanitize_(body.userAgent || "Unknown");
  
  // --- Validation ---
  if (!nis || !password) {
    return makeResponse_(false, "NIS dan password wajib diisi", null);
  }
  
  if (!/^\d{4,20}$/.test(nis)) {
    return makeResponse_(false, "NIS harus berupa angka", null);
  }
  
  // --- Find user ---
  var usersSheet = getSheet_("users");
  var user = findUserByNIS_(usersSheet, nis);
  
  if (!user) {
    return makeResponse_(false, "NIS tidak ditemukan. Silakan registrasi terlebih dahulu", null);
  }
  
  // --- Verify password ---
  var passwordHash = hashSHA256_(password);
  var storedPassword = user.passwordHash;
  
  // A SHA-256 hash is exactly 64 characters long and contains only hex chars
  var isHash = /^[0-9a-f]{64}$/i.test(storedPassword);
  var passwordCorrect = false;
  
  if (isHash) {
    passwordCorrect = (storedPassword === passwordHash);
  } else {
    // If teacher set a plain password in spreadsheet
    passwordCorrect = (storedPassword === password);
    
    // Auto-hash the plain password and save it back to protect it!
    if (passwordCorrect) {
      var data = usersSheet.getDataRange().getValues();
      var nisStr = parseNis_(nis);
      for (var i = 1; i < data.length; i++) {
        if (parseNis_(data[i][0]) === nisStr) {
          usersSheet.getRange(i + 1, 5).setValue(passwordHash); // Column 5 is PasswordHash (E)
          break;
        }
      }
    }
  }
  
  if (!passwordCorrect) {
    return makeResponse_(false, "Password salah", null);
  }
  
  // --- Generate session token ---
  var sessionToken = generateSessionToken_();
  
  // --- Log session ---
  var sessionsSheet = getSheet_("sessions");
  var loginTime = formatDateTime_(new Date());
  sessionsSheet.appendRow([nis, loginTime, device, userAgent]);
  
  SpreadsheetApp.flush();
  
  // --- Get existing progress summary ---
  var progressSummary = getProgressSummary_(nis);
  
  return makeResponse_(true, "Login berhasil! Selamat bermain, " + user.nama, {
    nis: user.nis,
    nama: user.nama,
    kelas: user.kelas,
    sessionToken: sessionToken,
    loginTime: loginTime,
    progress: progressSummary
  });
}

/**
 * POST /syncProgress
 * Body: { action: "syncProgress", nis, level, phase, score, stars, xp }
 */
function handleSyncProgress_(body) {
  var nis   = sanitize_(body.nis);
  var level = sanitize_(body.level);
  var phase = sanitize_(body.phase);
  var score = parseInt(body.score, 10);
  var stars = parseInt(body.stars, 10);
  var xp    = parseInt(body.xp, 10);
  
  // --- Validation ---
  if (!nis || !level) {
    return makeResponse_(false, "NIS dan level wajib diisi", null);
  }
  
  if (!/^\d{4,20}$/.test(nis)) {
    return makeResponse_(false, "NIS tidak valid", null);
  }
  
  if (isNaN(score) || score < 0) {
    return makeResponse_(false, "Score harus berupa angka positif", null);
  }
  
  if (isNaN(stars) || stars < 0 || stars > 5) {
    stars = Math.max(0, Math.min(5, stars || 0));
  }
  
  if (isNaN(xp) || xp < 0) {
    xp = Math.max(0, xp || 0);
  }
  
  // --- Verify user exists ---
  var usersSheet = getSheet_("users");
  var user = findUserByNIS_(usersSheet, nis);
  
  if (!user) {
    return makeResponse_(false, "NIS tidak ditemukan", null);
  }
  
  // --- Check for existing score on same level+phase and update if higher ---
  var scoresSheet = getSheet_("scores");
  var timestamp = formatDateTime_(new Date());
  var phaseStr = phase || "-";
  
  var existingRow = findScoreRow_(scoresSheet, nis, level, phaseStr);
  
  if (existingRow) {
    var oldScore = existingRow.score;
    if (score > oldScore) {
      // Update with higher score
      var rowNum = existingRow.rowNumber;
      scoresSheet.getRange(rowNum, 1, 1, 8).setValues([
        [nis, user.nama, level, phaseStr, score, stars, xp, timestamp]
      ]);
      SpreadsheetApp.flush();
      return makeResponse_(true, "Score diperbarui! " + oldScore + " → " + score, {
        nis: nis,
        level: level,
        phase: phaseStr,
        oldScore: oldScore,
        newScore: score,
        stars: stars,
        xp: xp,
        updated: true,
        timestamp: timestamp
      });
    } else {
      return makeResponse_(true, "Score tidak berubah (score lama lebih tinggi: " + oldScore + ")", {
        nis: nis,
        level: level,
        phase: phaseStr,
        currentScore: oldScore,
        attemptedScore: score,
        updated: false,
        timestamp: timestamp
      });
    }
  } else {
    // New entry
    scoresSheet.appendRow([nis, user.nama, level, phaseStr, score, stars, xp, timestamp]);
    SpreadsheetApp.flush();
    return makeResponse_(true, "Progress tersimpan!", {
      nis: nis,
      level: level,
      phase: phaseStr,
      score: score,
      stars: stars,
      xp: xp,
      updated: true,
      isNew: true,
      timestamp: timestamp
    });
  }
}

/**
 * POST /updateProfile
 * Body: { action: "updateProfile", nis, nama }
 */
function handleUpdateProfile_(body) {
  var nis  = sanitize_(body.nis);
  var nama = sanitize_(body.nama);
  
  if (!nis || !nama) {
    return makeResponse_(false, "NIS dan nama wajib diisi", null);
  }
  
  var nisStr = parseNis_(nis);
  if (!nisStr) {
    return makeResponse_(false, "NIS tidak valid", null);
  }
  
  if (nama.length < 2 || nama.length > 100) {
    return makeResponse_(false, "Nama harus 2-100 karakter", null);
  }
  
  var usersSheet = getSheet_("users");
  var user = findUserByNIS_(usersSheet, nisStr);
  
  if (!user) {
    return makeResponse_(false, "User tidak ditemukan", null);
  }
  
  // Update name in users sheet
  var data = usersSheet.getDataRange().getValues();
  var updated = false;
  
  for (var i = 1; i < data.length; i++) {
    if (parseNis_(data[i][0]) === nisStr) {
      usersSheet.getRange(i + 1, 2).setValue(nama); // Column 2 is Nama
      updated = true;
      break;
    }
  }
  
  if (!updated) {
    return makeResponse_(false, "Gagal memperbarui profil di database", null);
  }
  
  // Also update name in scores sheet for all existing records of this student
  var scoresSheet = getSheet_("scores");
  var scoresData = scoresSheet.getDataRange().getValues();
  for (var j = 1; j < scoresData.length; j++) {
    if (parseNis_(scoresData[j][0]) === nisStr) {
      scoresSheet.getRange(j + 1, 2).setValue(nama);
    }
  }
  
  SpreadsheetApp.flush();
  
  return makeResponse_(true, "Profil berhasil diperbarui di database!", {
    nis: nis,
    nama: nama
  });
}

/**
 * GET /getProgress
 * Params: action=getProgress, nis=xxxxx
 */
function handleGetProgress_(params) {
  var nis = sanitize_(params.nis);
  var nisStr = parseNis_(nis);
  
  if (!nisStr) {
    return makeResponse_(false, "Parameter nis wajib diisi", null);
  }
  
  // Verify user exists
  var usersSheet = getSheet_("users");
  var user = findUserByNIS_(usersSheet, nisStr);
  
  if (!user) {
    return makeResponse_(false, "NIS tidak ditemukan", null);
  }
  
  // Get all scores for this NIS
  var scoresSheet = getSheet_("scores");
  var data = scoresSheet.getDataRange().getValues();
  var scores = [];
  var totalXP = 0;
  var totalStars = 0;
  var totalScore = 0;
  var levelsCompleted = {};
  
  for (var i = 1; i < data.length; i++) {
    if (parseNis_(data[i][0]) === nisStr) {
      var entry = {
        level: String(data[i][2]),
        phase: String(data[i][3]),
        score: Number(data[i][4]) || 0,
        stars: Number(data[i][5]) || 0,
        xp: Number(data[i][6]) || 0,
        timestamp: String(data[i][7])
      };
      scores.push(entry);
      totalXP += entry.xp;
      totalStars += entry.stars;
      totalScore += entry.score;
      levelsCompleted[entry.level] = true;
    }
  }
  
  return makeResponse_(true, "Progress ditemukan", {
    nis: nis,
    nama: user.nama,
    kelas: user.kelas,
    scores: scores,
    summary: {
      totalScore: totalScore,
      totalStars: totalStars,
      totalXP: totalXP,
      levelsCompleted: Object.keys(levelsCompleted).length,
      totalEntries: scores.length
    }
  });
}

/**
 * GET /leaderboard
 * Params: action=leaderboard, level=xxx (optional), limit=N (optional)
 */
function handleLeaderboard_(params) {
  var levelFilter = sanitize_(params.level || "");
  var limit = parseInt(params.limit, 10);
  if (isNaN(limit) || limit < 1 || limit > 100) {
    limit = MAX_LEADERBOARD;
  }
  
  var scoresSheet = getSheet_("scores");
  var data = scoresSheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return makeResponse_(true, "Belum ada data skor", { entries: [], level: levelFilter || "all" });
  }
  
  // Aggregate best scores per NIS (optionally per level)
  // Key: NIS or NIS+Level
  var bestScores = {};
  
  for (var i = 1; i < data.length; i++) {
    var nis = String(data[i][0]).trim();
    var nama = String(data[i][1]).trim();
    var level = String(data[i][2]).trim();
    var score = Number(data[i][4]) || 0;
    var stars = Number(data[i][5]) || 0;
    var xp = Number(data[i][6]) || 0;
    
    // Apply level filter if specified (skip if levelFilter is "all")
    if (levelFilter && levelFilter !== "all" && level !== levelFilter) {
      continue;
    }
    
    var key = nis;
    
    if (!bestScores[key]) {
      bestScores[key] = {
        nis: nis,
        nama: nama,
        totalScore: 0,
        totalStars: 0,
        totalXP: 0,
        entries: 0
      };
    }
    
    bestScores[key].totalScore += score;
    bestScores[key].totalStars += stars;
    bestScores[key].totalXP += xp;
    bestScores[key].entries += 1;
  }
  
  // Convert to array and sort by totalScore descending
  var leaderboard = [];
  for (var k in bestScores) {
    if (bestScores.hasOwnProperty(k)) {
      leaderboard.push(bestScores[k]);
    }
  }
  
  leaderboard.sort(function(a, b) {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
    return b.totalXP - a.totalXP;
  });
  
  // Add rank
  for (var r = 0; r < leaderboard.length; r++) {
    leaderboard[r].rank = r + 1;
  }
  
  // Limit results
  leaderboard = leaderboard.slice(0, limit);
  
  return makeResponse_(true, "Leaderboard loaded", {
    level: levelFilter || "all",
    totalPlayers: leaderboard.length,
    entries: leaderboard
  });
}

/**
 * GET /getStudents
 * Params: action=getStudents, secret=TEACHER_SECRET, kelas=xxx (optional)
 */
function handleGetStudents_(params) {
  var secret = params.secret || "";
  
  if (secret !== TEACHER_SECRET) {
    return makeResponse_(false, "Akses ditolak. Secret key tidak valid", null);
  }
  
  var kelasFilter = sanitize_(params.kelas || "");
  
  var usersSheet = getSheet_("users");
  var data = usersSheet.getDataRange().getValues();
  
  var students = [];
  
  for (var i = 1; i < data.length; i++) {
    var nis   = String(data[i][0]).trim();
    var nama  = String(data[i][1]).trim();
    var kelas = String(data[i][2]).trim();
    var wa    = String(data[i][3]).trim();
    var regAt = String(data[i][5]).trim();
    
    if (kelasFilter && kelas !== kelasFilter) {
      continue;
    }
    
    // Get progress summary for each student
    var summary = getProgressSummary_(nis);
    
    students.push({
      nis: nis,
      nama: nama,
      kelas: kelas,
      wa: wa,
      registeredAt: regAt,
      progress: summary
    });
  }
  
  // Sort by kelas, then nama
  students.sort(function(a, b) {
    if (a.kelas !== b.kelas) return a.kelas.localeCompare(b.kelas);
    return a.nama.localeCompare(b.nama);
  });
  
  return makeResponse_(true, "Data siswa berhasil dimuat", {
    totalStudents: students.length,
    filter: kelasFilter || "all",
    students: students,
    recentSessions: getRecentSessions_()
  });
}

/**
 * Get the last 20 sessions for the teacher monitor
 */
function getRecentSessions_() {
  var sessionsSheet;
  try {
    sessionsSheet = getSheet_("sessions");
  } catch (e) {
    return [];
  }
  
  var data = sessionsSheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  // Create NIS to Name map
  var usersSheet = getSheet_("users");
  var usersData = usersSheet.getDataRange().getValues();
  var nisToName = {};
  for (var u = 1; u < usersData.length; u++) {
    nisToName[parseNis_(usersData[u][0])] = String(usersData[u][1]).trim();
  }
  
  var sessions = [];
  var start = Math.max(1, data.length - 20);
  for (var i = data.length - 1; i >= start; i--) {
    var nis = parseNis_(data[i][0]);
    sessions.push({
      nis: nis,
      nama: nisToName[nis] || "Mekanik (" + nis + ")",
      loginTime: String(data[i][1]),
      device: String(data[i][2]),
      userAgent: String(data[i][3])
    });
  }
  return sessions;
}

// ===================== HELPER FUNCTIONS =====================

/**
 * Get the spreadsheet instance
 */
function getSpreadsheet_() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.length > 0) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Get a specific sheet by name, create if not exists
 */
function getSheet_(name) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    // Auto-create sheet if missing (failsafe)
    SETUP();
    sheet = ss.getSheetByName(name);
    if (!sheet) {
      throw new Error("Sheet '" + name + "' tidak ditemukan. Jalankan SETUP() terlebih dahulu.");
    }
  }
  return sheet;
}

/**
 * Find a user row by NIS in the users sheet
 * Returns object with user data or null
 */
function findUserByNIS_(sheet, nis) {
  var data = sheet.getDataRange().getValues();
  var nisStr = parseNis_(nis);
  
  for (var i = 1; i < data.length; i++) {
    if (parseNis_(data[i][0]) === nisStr) {
      return {
        rowNumber: i + 1,
        nis: parseNis_(data[i][0]),
        nama: String(data[i][1]).trim(),
        kelas: String(data[i][2]).trim(),
        wa: String(data[i][3]).trim(),
        passwordHash: String(data[i][4]).trim(),
        registeredAt: String(data[i][5]).trim()
      };
    }
  }
  
  return null;
}

/**
 * Find a score row by NIS + Level + Phase
 */
/**
 * Find a score row in the scores sheet.
 * Normalizes NIS, level, and phase for robust matching.
 */
function findScoreRow_(sheet, nis, level, phase) {
  var data = sheet.getDataRange().getValues();
  var nisStr = parseNis_(nis);
  var levelStr = parseLevel_(level);
  var phaseStr = String(phase || "").toLowerCase().trim();
  
  for (var i = 1; i < data.length; i++) {
    var rowNis = parseNis_(data[i][0]);
    var rowLevel = parseLevel_(data[i][2]);
    var rowPhase = String(data[i][3] || "").toLowerCase().trim();
    
    if (rowNis === nisStr && rowLevel === levelStr && rowPhase === phaseStr) {
      return {
        rowNumber: i + 1,
        nis: rowNis,
        nama: String(data[i][1]).trim(),
        level: rowLevel,
        phase: rowPhase,
        score: Number(data[i][4]) || 0,
        stars: Number(data[i][5]) || 0,
        xp: Number(data[i][6]) || 0,
        timestamp: String(data[i][7]).trim()
      };
    }
  }
  
  return null;
}

/**
 * Get a progress summary for a student
 */
function getProgressSummary_(nis) {
  var scoresSheet;
  try {
    scoresSheet = getSheet_("scores");
  } catch (e) {
    return { totalScore: 0, totalStars: 0, totalXP: 0, levelsCompleted: 0, completedLevels: [] };
  }
  
  var data = scoresSheet.getDataRange().getValues();
  var totalScore = 0;
  var totalStars = 0;
  var totalXP = 0;
  var levels = {};
  var nisStr = parseNis_(nis);
  
  for (var i = 1; i < data.length; i++) {
    if (parseNis_(data[i][0]) === nisStr) {
      totalScore += Number(data[i][4]) || 0;
      totalStars += Number(data[i][5]) || 0;
      totalXP += Number(data[i][6]) || 0;
      
      var lvl = parseLevel_(data[i][2]);
      var phase = String(data[i][3] || "").toLowerCase().trim();
      if (phase === "quiz") {
        levels[lvl] = true;
      }
    }
  }
  
  var completedLevelsArr = Object.keys(levels);
  
  return {
    totalScore: totalScore,
    totalStars: totalStars,
    totalXP: totalXP,
    levelsCompleted: completedLevelsArr.length,
    completedLevels: completedLevelsArr
  };
}

/**
 * Parse Level to a clean numeric string (strips decimals, non-digits)
 */
function parseLevel_(val) {
  if (val === null || val === undefined) return "";
  var str = String(val).trim();
  if (str.indexOf('.') !== -1) {
    str = str.split('.')[0];
  }
  return str.replace(/\D/g, "");
}

/**
 * Parse NIS to a clean numeric string (strips decimals, non-digits)
 */
function parseNis_(val) {
  if (val === null || val === undefined) return "";
  var str = String(val).trim();
  if (str.indexOf('.') !== -1) {
    str = str.split('.')[0];
  }
  return str.replace(/\D/g, "");
}

/**
 * SHA-256 hash using Apps Script Utilities
 */
function hashSHA256_(input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  var hex = "";
  for (var i = 0; i < rawHash.length; i++) {
    var byte = rawHash[i];
    if (byte < 0) byte += 256;
    var hexByte = byte.toString(16);
    if (hexByte.length === 1) hexByte = "0" + hexByte;
    hex += hexByte;
  }
  return hex;
}

/**
 * Generate a random session token
 */
function generateSessionToken_() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var token = "";
  for (var i = 0; i < SESSION_TOKEN_LENGTH; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Add timestamp component for uniqueness
  var ts = new Date().getTime().toString(36);
  return token + "_" + ts;
}

/**
 * Sanitize input string (trim whitespace, prevent injection)
 */
function sanitize_(input) {
  if (input === null || input === undefined) return "";
  return String(input).trim().replace(/[<>\"']/g, "");
}

/**
 * Format date-time to Indonesian-friendly format
 * Returns: "2024-03-15 14:30:00"
 */
function formatDateTime_(date) {
  // Use Asia/Jakarta timezone
  var formatted = Utilities.formatDate(date, "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  return formatted;
}

/**
 * Create a standardized response object
 */
function makeResponse_(success, message, data) {
  return {
    success: success,
    message: message,
    data: data || null,
    serverTime: formatDateTime_(new Date())
  };
}

/**
 * Create JSON output with CORS headers
 */
function jsonOutput_(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ===================== UTILITY / TEST FUNCTIONS =====================

/**
 * Test function - Run this to verify the API works locally
 * Check the Execution Log for output
 */
function TEST_Register() {
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: "register",
        nis: "12345",
        nama: "Budi Santoso",
        kelas: "XII TKR 1",
        wa: "081234567890",
        password: "budi1234"
      })
    }
  };
  
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}

function TEST_Login() {
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: "login",
        nis: "12345",
        password: "budi1234",
        device: "Chrome Desktop",
        userAgent: "Mozilla/5.0 Test"
      })
    }
  };
  
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}

function TEST_SyncProgress() {
  var mockEvent = {
    postData: {
      contents: JSON.stringify({
        action: "syncProgress",
        nis: "12345",
        level: "1",
        phase: "quiz",
        score: 850,
        stars: 3,
        xp: 120
      })
    }
  };
  
  var result = doPost(mockEvent);
  Logger.log(result.getContent());
}

function TEST_GetProgress() {
  var mockEvent = {
    parameter: {
      action: "getProgress",
      nis: "12345"
    }
  };
  
  var result = doGet(mockEvent);
  Logger.log(result.getContent());
}

function TEST_Leaderboard() {
  var mockEvent = {
    parameter: {
      action: "leaderboard",
      limit: "10"
    }
  };
  
  var result = doGet(mockEvent);
  Logger.log(result.getContent());
}

function TEST_GetStudents() {
  var mockEvent = {
    parameter: {
      action: "getStudents",
      secret: TEACHER_SECRET
    }
  };
  
  var result = doGet(mockEvent);
  Logger.log(result.getContent());
}

function TEST_Ping() {
  var mockEvent = {
    parameter: {
      action: "ping"
    }
  };
  
  var result = doGet(mockEvent);
  Logger.log(result.getContent());
}
