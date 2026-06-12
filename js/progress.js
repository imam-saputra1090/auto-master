/**
 * ============================================================
 * AutoMaster — Bengkel Virtual
 * progress.js — Sistem Progres & Gamifikasi Pemain
 * ============================================================
 * Mengelola seluruh data progres pemain termasuk:
 * - Penyimpanan & pemuatan data dari localStorage
 * - Sistem XP dan peringkat (rank)
 * - Penyelesaian fase belajar, simulasi, dan kuis
 * - Pembukaan level baru
 * - Sistem pencapaian (achievement)
 * ============================================================
 */

const ProgressManager = {

  // ── Kunci penyimpanan localStorage ──────────────────────────
  STORAGE_KEY: 'automaster_progress',

  // ── Data pemain yang sedang aktif ──────────────────────────
  _data: null,

  // ── Template data bawaan untuk pemain baru ─────────────────
  defaultData: {
    playerName: '',
    avatar: '🧑‍🔧',
    sekolah: 'SMK Amal Bakti Jatimulyo',
    totalXP: 0,
    levels: {
      1: { unlocked: true,  learnCompleted: false, simCompleted: false, quizCompleted: false, bestScore: 0, stars: 0 },
      2: { unlocked: false, learnCompleted: false, simCompleted: false, quizCompleted: false, bestScore: 0, stars: 0 },
      3: { unlocked: false, learnCompleted: false, simCompleted: false, quizCompleted: false, bestScore: 0, stars: 0 },
      4: { unlocked: false, learnCompleted: false, simCompleted: false, quizCompleted: false, bestScore: 0, stars: 0 },
      5: { unlocked: false, learnCompleted: false, simCompleted: false, quizCompleted: false, bestScore: 0, stars: 0 },
      6: { unlocked: false, learnCompleted: false, simCompleted: false, quizCompleted: false, bestScore: 0, stars: 0 }
    },
    achievements: [],
    quizHistory: []
  },

  // ════════════════════════════════════════════════════════════
  //  INISIALISASI
  // ════════════════════════════════════════════════════════════

  /**
   * Memuat data dari localStorage, atau membuat data baru
   * jika belum pernah menyimpan sebelumnya.
   */
  init() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this._data = JSON.parse(stored);
        // Pastikan semua properti ada (migrasi data lama)
        this._migrateData();
      } else {
        this._data = JSON.parse(JSON.stringify(this.defaultData));
      }
    } catch (err) {
      console.warn('ProgressManager: Gagal memuat data, membuat data baru.', err);
      this._data = JSON.parse(JSON.stringify(this.defaultData));
    }
    this.save();
  },

  /**
   * Migrasi data lama — memastikan semua field ada
   * jika pemain pernah menyimpan versi sebelumnya.
   */
  _migrateData() {
    const def = this.defaultData;

    if (!this._data.achievements) this._data.achievements = [];
    if (!this._data.quizHistory) this._data.quizHistory = [];
    if (typeof this._data.totalXP !== 'number') this._data.totalXP = 0;
    if (typeof this._data.avatar === 'undefined') this._data.avatar = '🧑‍🔧';
    if (typeof this._data.sekolah === 'undefined') this._data.sekolah = 'SMK Amal Bakti Jatimulyo';

    // Pastikan semua level 1–6 ada
    if (!this._data.levels) this._data.levels = {};
    for (let i = 1; i <= 6; i++) {
      if (!this._data.levels[i]) {
        this._data.levels[i] = JSON.parse(JSON.stringify(def.levels[i]));
      } else {
        // Tambahkan properti yang mungkin belum ada
        const lvl = this._data.levels[i];
        if (typeof lvl.unlocked === 'undefined')       lvl.unlocked = def.levels[i].unlocked;
        if (typeof lvl.learnCompleted === 'undefined')  lvl.learnCompleted = false;
        if (typeof lvl.simCompleted === 'undefined')    lvl.simCompleted = false;
        if (typeof lvl.quizCompleted === 'undefined')   lvl.quizCompleted = false;
        if (typeof lvl.bestScore === 'undefined')       lvl.bestScore = 0;
        if (typeof lvl.stars === 'undefined')           lvl.stars = 0;
      }
    }
  },

  // ════════════════════════════════════════════════════════════
  //  PENYIMPANAN & AKSES DATA
  // ════════════════════════════════════════════════════════════

  /** Simpan data pemain ke localStorage */
  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._data));
    } catch (err) {
      console.error('ProgressManager: Gagal menyimpan data.', err);
    }
  },

  /** Mengambil salinan data pemain saat ini */
  getPlayerData() {
    return this._data;
  },

  /** Mengatur nama pemain */
  setPlayerName(name) {
    this._data.playerName = name;
    this.save();
  },

  /** Mengatur avatar pemain */
  setAvatar(avatar) {
    this._data.avatar = avatar;
    this.save();
  },

  /** Mengatur sekolah pemain */
  setSekolah(sekolah) {
    this._data.sekolah = sekolah;
    this.save();
  },

  // ════════════════════════════════════════════════════════════
  //  SISTEM PERINGKAT (RANK)
  // ════════════════════════════════════════════════════════════

  /**
   * Mengembalikan objek peringkat saat ini berdasarkan total XP.
   * Menggunakan data dari GAME_DATA.ranks jika tersedia.
   * @returns {{ name: string, icon: string, minXP: number, index: number }}
   */
  getRank() {
    const xp = this._data.totalXP;

    // Gunakan data peringkat dari GAME_DATA jika tersedia
    if (typeof GAME_DATA !== 'undefined' && GAME_DATA.ranks && GAME_DATA.ranks.length > 0) {
      let currentRank = GAME_DATA.ranks[0];
      let currentIndex = 0;
      for (let i = 0; i < GAME_DATA.ranks.length; i++) {
        if (xp >= GAME_DATA.ranks[i].minXP) {
          currentRank = GAME_DATA.ranks[i];
          currentIndex = i;
        }
      }
      return { ...currentRank, name: currentRank.title || currentRank.name, index: currentIndex };
    }

    // Fallback peringkat bawaan
    const fallbackRanks = [
      { name: 'Pemula',           icon: '🔧', minXP: 0 },
      { name: 'Mekanik Magang',   icon: '🛠️', minXP: 200 },
      { name: 'Mekanik Junior',   icon: '⚙️', minXP: 500 },
      { name: 'Mekanik Senior',   icon: '🔩', minXP: 1000 },
      { name: 'Kepala Mekanik',   icon: '🏆', minXP: 1800 },
      { name: 'Master Otomotif',  icon: '👑', minXP: 2500 }
    ];

    let currentRank = fallbackRanks[0];
    let currentIndex = 0;
    for (let i = 0; i < fallbackRanks.length; i++) {
      if (xp >= fallbackRanks[i].minXP) {
        currentRank = fallbackRanks[i];
        currentIndex = i;
      }
    }
    return { ...currentRank, index: currentIndex };
  },

  /**
   * Mendapatkan XP yang diperlukan untuk peringkat berikutnya.
   * @returns {number|null} — XP minimum untuk rank berikutnya, atau null jika sudah tertinggi
   */
  getNextRankXP() {
    const ranks = (typeof GAME_DATA !== 'undefined' && GAME_DATA.ranks) ? GAME_DATA.ranks : [
      { minXP: 0 }, { minXP: 200 }, { minXP: 500 }, { minXP: 1000 }, { minXP: 1800 }, { minXP: 2500 }
    ];
    const xp = this._data.totalXP;
    for (let i = 0; i < ranks.length; i++) {
      if (xp < ranks[i].minXP) return ranks[i].minXP;
    }
    return null; // Sudah peringkat tertinggi
  },

  // ════════════════════════════════════════════════════════════
  //  SISTEM XP
  // ════════════════════════════════════════════════════════════

  /**
   * Menambahkan XP ke pemain.
   * @param {number} amount — Jumlah XP yang ditambahkan
   * @returns {{ newXP: number, rankUp: boolean, newRank: object }}
   */
  addXP(amount) {
    const oldRank = this.getRank();
    this._data.totalXP += amount;
    const newRank = this.getRank();
    const rankUp = newRank.index > oldRank.index;
    this.save();
    return {
      newXP: this._data.totalXP,
      rankUp: rankUp,
      newRank: newRank
    };
  },

  // ════════════════════════════════════════════════════════════
  //  PENYELESAIAN FASE
  // ════════════════════════════════════════════════════════════

  /**
   * Menandai fase Belajar (Learn) sebagai selesai dan memberikan 50 XP.
   * @param {number} levelId — ID level (1–6)
   * @returns {{ xpResult: object }}
   */
  completeLearn(levelId) {
    const lvl = this._data.levels[levelId];
    if (!lvl) return { xpResult: null };

    // Hanya berikan XP jika belum pernah menyelesaikan fase ini
    let xpResult = { newXP: this._data.totalXP, rankUp: false, newRank: this.getRank() };
    let isNew = false;
    if (!lvl.learnCompleted) {
      lvl.learnCompleted = true;
      xpResult = this.addXP(50);
      isNew = true;
    }

    this.save();

    // Hook SyncManager
    if (typeof SyncManager !== 'undefined' && typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
      SyncManager.pushProgress(levelId, 'learn', 100, 0, isNew ? 50 : 0);
    }

    return { xpResult };
  },

  /**
   * Menandai fase Simulasi sebagai selesai dan memberikan XP berdasarkan skor.
   * @param {number} levelId — ID level (1–6)
   * @param {number} score — Skor simulasi (0–100)
   * @returns {{ xpResult: object, score: number }}
   */
  completeSim(levelId, score) {
    const lvl = this._data.levels[levelId];
    if (!lvl) return { xpResult: null, score: 0 };

    // Hitung XP berdasarkan skor (maks 100 XP)
    const xpEarned = Math.round(score);

    // Update skor terbaik
    if (score > lvl.bestScore) {
      lvl.bestScore = score;
    }

    let xpResult = { newXP: this._data.totalXP, rankUp: false, newRank: this.getRank() };
    let finalXpEarned = 0;
    if (!lvl.simCompleted) {
      lvl.simCompleted = true;
      finalXpEarned = xpEarned;
      xpResult = this.addXP(xpEarned);
    } else {
      // Jika sudah pernah selesai, berikan setengah XP untuk replay
      finalXpEarned = Math.round(xpEarned / 2);
      xpResult = this.addXP(finalXpEarned);
    }

    this.save();

    // Hook SyncManager
    if (typeof SyncManager !== 'undefined' && typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
      SyncManager.pushProgress(levelId, 'simulate', score, 0, finalXpEarned);
    }

    return { xpResult, score };
  },

  /**
   * Menandai fase Kuis sebagai selesai, menghitung bintang dan XP.
   * @param {number} levelId — ID level (1–6)
   * @param {number} score — Jumlah jawaban benar
   * @param {number} total — Jumlah total soal
   * @returns {{ xpResult: object, stars: number, percentage: number, xpEarned: number }}
   */
  completeQuiz(levelId, score, total) {
    const lvl = this._data.levels[levelId];
    if (!lvl) return { xpResult: null, stars: 0, percentage: 0, xpEarned: 0 };

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    // Hitung bintang dan XP berdasarkan persentase
    let stars = 0;
    let xpEarned = 50; // Default untuk < 50%

    if (percentage >= 90) {
      stars = 3;
      xpEarned = 200;
    } else if (percentage >= 70) {
      stars = 2;
      xpEarned = 150;
    } else if (percentage >= 50) {
      stars = 1;
      xpEarned = 100;
    }

    // Simpan bintang terbaik (tidak pernah menurun)
    if (stars > lvl.stars) {
      lvl.stars = stars;
    }

    // Simpan skor terbaik
    if (percentage > lvl.bestScore) {
      lvl.bestScore = percentage;
    }

    lvl.quizCompleted = true;

    // Simpan riwayat kuis
    this._data.quizHistory.push({
      levelId: levelId,
      score: score,
      total: total,
      percentage: percentage,
      stars: stars,
      timestamp: Date.now()
    });

    // Batasi riwayat kuis max 50 entri
    if (this._data.quizHistory.length > 50) {
      this._data.quizHistory = this._data.quizHistory.slice(-50);
    }

    const xpResult = this.addXP(xpEarned);
    this.save();

    // Hook SyncManager
    if (typeof SyncManager !== 'undefined' && typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
      SyncManager.pushProgress(levelId, 'quiz', percentage, stars, xpEarned);
    }

    return { xpResult, stars, percentage, xpEarned };
  },

  // ════════════════════════════════════════════════════════════
  //  MANAJEMEN LEVEL
  // ════════════════════════════════════════════════════════════

  /**
   * Membuka level berikutnya jika level saat ini sudah selesai.
   * @param {number} currentLevel — Level yang baru diselesaikan
   * @returns {boolean} — true jika level baru berhasil dibuka
   */
  unlockNextLevel(currentLevel) {
    const nextLevel = currentLevel + 1;

    // Level 6 memerlukan pengecekan khusus
    if (nextLevel === 6) {
      if (this.isLevel6Unlockable()) {
        this._data.levels[6].unlocked = true;
        this.save();
        return true;
      }
      return false;
    }

    // Level 2–5: buka jika level saat ini punya minimal 1 bintang
    if (nextLevel >= 2 && nextLevel <= 5) {
      const currentLvl = this._data.levels[currentLevel];
      if (currentLvl && currentLvl.quizCompleted && currentLvl.stars >= 1) {
        this._data.levels[nextLevel].unlocked = true;
        this.save();
        return true;
      }
    }

    return false;
  },

  /**
   * Memeriksa apakah level tertentu sudah dibuka.
   * @param {number} levelId — ID level (1–6)
   * @returns {boolean}
   */
  isLevelUnlocked(levelId) {
    const lvl = this._data.levels[levelId];
    return lvl ? lvl.unlocked : false;
  },

  /**
   * Memeriksa apakah Level 6 bisa dibuka.
   * Syarat: Level 1–5 semua harus minimal 1 bintang.
   * @returns {boolean}
   */
  isLevel6Unlockable() {
    for (let i = 1; i <= 5; i++) {
      const lvl = this._data.levels[i];
      if (!lvl || lvl.stars < 1) return false;
    }
    return true;
  },

  // ════════════════════════════════════════════════════════════
  //  SISTEM PENCAPAIAN (ACHIEVEMENT)
  // ════════════════════════════════════════════════════════════

  /**
   * Daftar semua pencapaian yang tersedia.
   */
  _achievementDefinitions: [
    {
      id: 'first_learn',
      name: 'Siswa Baru',
      icon: '📖',
      description: 'Menyelesaikan materi pertama',
      check: function(data) {
        for (let i = 1; i <= 6; i++) {
          if (data.levels[i] && data.levels[i].learnCompleted) return true;
        }
        return false;
      }
    },
    {
      id: 'first_sim',
      name: 'Tangan Terampil',
      icon: '🔧',
      description: 'Menyelesaikan simulasi pertama',
      check: function(data) {
        for (let i = 1; i <= 6; i++) {
          if (data.levels[i] && data.levels[i].simCompleted) return true;
        }
        return false;
      }
    },
    {
      id: 'first_quiz',
      name: 'Penguji Pemula',
      icon: '📝',
      description: 'Menyelesaikan kuis pertama',
      check: function(data) {
        for (let i = 1; i <= 6; i++) {
          if (data.levels[i] && data.levels[i].quizCompleted) return true;
        }
        return false;
      }
    },
    {
      id: 'perfect_quiz',
      name: 'Nilai Sempurna',
      icon: '💯',
      description: 'Mendapat 3 bintang di kuis',
      check: function(data) {
        for (let i = 1; i <= 6; i++) {
          if (data.levels[i] && data.levels[i].stars >= 3) return true;
        }
        return false;
      }
    },
    {
      id: 'three_levels',
      name: 'Setengah Jalan',
      icon: '🛤️',
      description: 'Menyelesaikan 3 level',
      check: function(data) {
        let count = 0;
        for (let i = 1; i <= 6; i++) {
          if (data.levels[i] && data.levels[i].quizCompleted) count++;
        }
        return count >= 3;
      }
    },
    {
      id: 'all_levels',
      name: 'Mekanik Sejati',
      icon: '🏆',
      description: 'Menyelesaikan semua level',
      check: function(data) {
        for (let i = 1; i <= 5; i++) {
          if (!data.levels[i] || !data.levels[i].quizCompleted) return false;
        }
        return true;
      }
    },
    {
      id: 'all_stars',
      name: 'Bintang Penuh',
      icon: '⭐',
      description: 'Mendapat 3 bintang di semua level',
      check: function(data) {
        for (let i = 1; i <= 5; i++) {
          if (!data.levels[i] || data.levels[i].stars < 3) return false;
        }
        return true;
      }
    },
    {
      id: 'xp_500',
      name: 'XP Hunter',
      icon: '🎯',
      description: 'Mengumpulkan 500 XP',
      check: function(data) {
        return data.totalXP >= 500;
      }
    },
    {
      id: 'xp_1000',
      name: 'XP Master',
      icon: '🌟',
      description: 'Mengumpulkan 1000 XP',
      check: function(data) {
        return data.totalXP >= 1000;
      }
    },
    {
      id: 'level6_unlocked',
      name: 'Tantangan Akhir',
      icon: '🔓',
      description: 'Membuka Level 6',
      check: function(data) {
        return data.levels[6] && data.levels[6].unlocked;
      }
    }
  ],

  /**
   * Memeriksa semua syarat pencapaian dan membuka yang baru.
   * @returns {Array} — Daftar pencapaian yang baru dibuka
   */
  checkAchievements() {
    const newlyUnlocked = [];

    this._achievementDefinitions.forEach(achievement => {
      // Lewati jika sudah pernah didapat
      if (this._data.achievements.includes(achievement.id)) return;

      // Periksa syarat
      if (achievement.check(this._data)) {
        this._data.achievements.push(achievement.id);
        newlyUnlocked.push(achievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.save();
    }

    return newlyUnlocked;
  },

  /**
   * Mendapatkan daftar semua pencapaian beserta status terbuka/terkunci.
   * @returns {Array}
   */
  getAllAchievements() {
    return this._achievementDefinitions.map(ach => ({
      ...ach,
      earned: this._data.achievements.includes(ach.id)
    }));
  },

  // ════════════════════════════════════════════════════════════
  //  STATISTIK
  // ════════════════════════════════════════════════════════════

  /**
   * Mengembalikan ringkasan statistik pemain.
   * @returns {{ totalXP: number, levelsCompleted: number, totalStars: number, rank: object, achievementsEarned: number, totalAchievements: number }}
   */
  getStats() {
    let levelsCompleted = 0;
    let totalStars = 0;

    for (let i = 1; i <= 6; i++) {
      const lvl = this._data.levels[i];
      if (lvl) {
        if (lvl.quizCompleted) levelsCompleted++;
        totalStars += lvl.stars || 0;
      }
    }

    return {
      totalXP: this._data.totalXP,
      levelsCompleted: levelsCompleted,
      totalStars: totalStars,
      maxStars: 18, // 6 level × 3 bintang
      rank: this.getRank(),
      achievementsEarned: this._data.achievements.length,
      totalAchievements: this._achievementDefinitions.length
    };
  },

  // ════════════════════════════════════════════════════════════
  //  RESET
  // ════════════════════════════════════════════════════════════

  /**
   * Menghapus seluruh progres pemain.
   * @returns {boolean} — true jika berhasil direset
   */
  resetProgress() {
    this._data = JSON.parse(JSON.stringify(this.defaultData));
    this.save();
    return true;
  }
};
