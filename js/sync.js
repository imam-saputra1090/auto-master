/**
 * SyncManager — Progress Synchronization Module
 * AutoMaster v2.0
 * 
 * Synchronizes game progress with Google Sheets via Apps Script API.
 * Supports offline queuing with automatic flush on reconnect.
 */
const SyncManager = {
  _queue: [],
  _syncing: false,
  _flushTimer: null,
  _initialized: false,

  /**
   * Initialize SyncManager — load offline queue from localStorage and set up listeners.
   */
  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Load pending queue from localStorage
    try {
      const stored = localStorage.getItem('automaster_sync_queue');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this._queue = parsed;
        }
      }
    } catch (e) {
      console.warn('[SyncManager] Failed to load sync queue from storage:', e);
      this._queue = [];
    }

    // Set up network listeners
    this._setupNetworkListeners();

    // If we have queued items and we're online, flush them
    if (this._queue.length > 0 && navigator.onLine) {
      this.flushQueue();
    }
  },

  /**
   * Get the API URL from AuthManager.
   * @returns {string}
   */
  _getApiUrl() {
    if (typeof AuthManager !== 'undefined' && AuthManager.API_URL) {
      return AuthManager.API_URL;
    }
    return '';
  },

  /**
   * Get the current user's NIS from AuthManager session.
   * @returns {string|null}
   */
  _getNis() {
    if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
      const session = AuthManager.getSession();
      return session ? session.nis : null;
    }
    return null;
  },

  /**
   * Push progress data to the cloud.
   * If offline, the data is queued and will be sent when connectivity returns.
   * 
   * @param {number|string} levelId - Level identifier
   * @param {string} phase - Game phase ('learn', 'quiz', 'simulation')
   * @param {number} score - Score achieved (0-100)
   * @param {number} stars - Stars earned (0-3)
   * @param {number} xp - Experience points earned
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async pushProgress(levelId, phase, score, stars, xp) {
    const nis = this._getNis();
    if (!nis) {
      return { success: false, message: 'User belum login.' };
    }

    const progressData = {
      action: 'syncProgress',
      nis: nis,
      level: levelId,     // For server (Code.gs)
      levelId: levelId,   // Keep just in case client needs it
      phase: phase,
      score: Math.max(0, Math.min(100, Math.round(score))),
      stars: Math.max(0, Math.min(3, Math.round(stars))),
      xp: Math.max(0, Math.round(xp)),
      timestamp: new Date().toISOString()
    };

    // If offline, add to queue immediately
    if (!navigator.onLine) {
      this._addToQueue(progressData);
      return { success: true, message: 'Progress disimpan offline. Akan disinkronkan saat online.' };
    }

    const apiUrl = this._getApiUrl();
    if (!apiUrl) {
      this._addToQueue(progressData);
      return { success: false, message: 'API URL belum dikonfigurasi. Progress disimpan offline.' };
    }

    try {
      const url = apiUrl + '?action=syncProgress';
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(progressData)
      });

      if (!response.ok) {
        this._addToQueue(progressData);
        return { success: false, message: 'Server error. Progress disimpan offline.' };
      }

      const result = await response.json();

      if (result.success) {
        return { success: true, message: 'Progress berhasil disinkronkan.' };
      }

      // Server returned failure — queue it for retry
      this._addToQueue(progressData);
      return { success: false, message: result.message || 'Gagal sinkronisasi. Progress disimpan offline.' };
    } catch (err) {
      console.error('[SyncManager] Push progress error:', err);
      this._addToQueue(progressData);
      return { success: false, message: 'Gagal menghubungi server. Progress disimpan offline.' };
    }
  },

  /**
   * Pull progress data from the cloud and merge with local ProgressManager data.
   * @returns {Promise<{success: boolean, message: string, data: object|null}>}
   */
  async pullProgress() {
    const nis = this._getNis();
    if (!nis) {
      return { success: false, message: 'User belum login.', data: null };
    }

    if (!navigator.onLine) {
      return { success: false, message: 'Tidak ada koneksi internet.', data: null };
    }

    const apiUrl = this._getApiUrl();
    if (!apiUrl) {
      return { success: false, message: 'API URL belum dikonfigurasi.', data: null };
    }

    try {
      const url = apiUrl + '?action=getProgress&nis=' + encodeURIComponent(nis);
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors'
      });

      if (!response.ok) {
        return { success: false, message: 'Server error: ' + response.status, data: null };
      }

      const result = await response.json();

      if (!result.success || !result.data) {
        return {
          success: false,
          message: result.message || 'Tidak ada data progress di server.',
          data: null
        };
      }

      // Merge cloud data with local ProgressManager data
      const mergedData = this._mergeProgress(result.data);

      return {
        success: true,
        message: 'Progress berhasil dimuat dari server.',
        data: mergedData
      };
    } catch (err) {
      console.error('[SyncManager] Pull progress error:', err);
      return { success: false, message: 'Gagal mengambil data dari server.', data: null };
    }
  },

  /**
   * Merge cloud progress data with local ProgressManager data.
   * Uses "highest score wins" strategy for each level/phase combination.
   * 
   * @param {object} cloudData - Progress data from the cloud
   * @returns {object} Merged progress data
   */
  _mergeProgress(cloudData) {
    let localData = {};

    // Get local data from ProgressManager if available
    if (typeof ProgressManager !== 'undefined' && ProgressManager) {
      if (typeof ProgressManager.getAllProgress === 'function') {
        localData = ProgressManager.getAllProgress() || {};
      } else if (typeof ProgressManager._data !== 'undefined') {
        localData = ProgressManager._data || {};
      }
    }

    const merged = JSON.parse(JSON.stringify(localData));
    if (!merged.levels) {
      merged.levels = {};
    }

    // Normalize cloudData into an array of score entries
    let cloudScores = [];
    if (cloudData) {
      if (Array.isArray(cloudData.scores)) {
        cloudScores = cloudData.scores;
      } else if (cloudData.levels) {
        for (const levelId in cloudData.levels) {
          const phases = cloudData.levels[levelId];
          for (const phase in phases) {
            cloudScores.push({
              level: levelId,
              phase: phase,
              score: phases[phase].score || 0,
              stars: phases[phase].stars || 0,
              xp: phases[phase].xp || 0,
              timestamp: phases[phase].timestamp
            });
          }
        }
      }
    }

    // Merge each score entry into merged.levels
    cloudScores.forEach(entry => {
      const levelId = parseInt(entry.level, 10);
      if (isNaN(levelId) || levelId < 1 || levelId > 6) return;

      if (!merged.levels[levelId]) {
        merged.levels[levelId] = {
          unlocked: levelId === 1,
          learnCompleted: false,
          simCompleted: false,
          quizCompleted: false,
          bestScore: 0,
          stars: 0
        };
      }

      const lvl = merged.levels[levelId];
      const phase = (entry.phase || '').toLowerCase().trim();

      if (phase === 'learn') {
        lvl.learnCompleted = true;
      } else if (phase === 'simulate' || phase === 'simulation') {
        lvl.simCompleted = true;
        // Keep the highest simulation score if applicable
        if (entry.score > (lvl.bestScore || 0) && !lvl.quizCompleted) {
          lvl.bestScore = entry.score;
        }
      } else if (phase === 'quiz') {
        lvl.quizCompleted = true;
        lvl.stars = Math.max(lvl.stars || 0, entry.stars || 0);
        lvl.bestScore = Math.max(lvl.bestScore || 0, entry.score || 0);
      }
    });

    // Auto-unlock logic based on progression rules
    // Level 1 is always unlocked
    if (merged.levels[1]) {
      merged.levels[1].unlocked = true;
    }

    // Levels 2 to 5: unlocked if the previous level has quiz completed and stars >= 1
    for (let i = 2; i <= 5; i++) {
      const prevLvl = merged.levels[i - 1];
      if (prevLvl && prevLvl.quizCompleted && prevLvl.stars >= 1) {
        if (merged.levels[i]) {
          merged.levels[i].unlocked = true;
        }
      }
    }

    // Level 6: unlocked if levels 1 to 5 all have stars >= 1
    let lvl6Unlockable = true;
    for (let i = 1; i <= 5; i++) {
      const lvl = merged.levels[i];
      if (!lvl || lvl.stars < 1) {
        lvl6Unlockable = false;
        break;
      }
    }
    if (lvl6Unlockable && merged.levels[6]) {
      merged.levels[6].unlocked = true;
    }

    // Update total XP to be at least the total XP from the cloud
    let cloudTotalXp = 0;
    if (cloudData && cloudData.summary && typeof cloudData.summary.totalXP === 'number') {
      cloudTotalXp = cloudData.summary.totalXP;
    } else {
      cloudScores.forEach(s => cloudTotalXp += (s.xp || 0));
    }
    merged.totalXP = Math.max(merged.totalXP || 0, cloudTotalXp);

    // Save back to local ProgressManager
    if (typeof ProgressManager !== 'undefined' && ProgressManager) {
      ProgressManager._data = merged;
      if (typeof ProgressManager.save === 'function') {
        ProgressManager.save();
      }
      if (typeof ProgressManager.checkAchievements === 'function') {
        ProgressManager.checkAchievements();
      }
    }

    return merged;
  },

  /**
   * Get leaderboard data for a specific level.
   * @param {number|string} levelId - Level identifier
   * @returns {Promise<{success: boolean, message: string, data: Array}>}
   */
  async getLeaderboard(levelId) {
    if (!navigator.onLine) {
      return { success: false, message: 'Tidak ada koneksi internet.', data: { entries: [] } };
    }

    const apiUrl = this._getApiUrl();
    if (!apiUrl) {
      return { success: false, message: 'API URL belum dikonfigurasi.', data: { entries: [] } };
    }

    try {
      const url = apiUrl + '?action=leaderboard&level=' + encodeURIComponent(levelId);
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors'
      });

      if (!response.ok) {
        return { success: false, message: 'Server error: ' + response.status, data: { entries: [] } };
      }

      const result = await response.json();

      let entries = [];
      if (result.success && result.data) {
        if (Array.isArray(result.data.entries)) {
          entries = result.data.entries;
        } else if (Array.isArray(result.data)) {
          entries = result.data;
        }
      }

      if (entries.length > 0) {
        // Sort by totalScore descending, then totalStars descending, then totalXP descending
        entries.sort(function (a, b) {
          const scoreA = typeof a.totalScore === 'number' ? a.totalScore : (a.score || 0);
          const scoreB = typeof b.totalScore === 'number' ? b.totalScore : (b.score || 0);
          const starsA = typeof a.totalStars === 'number' ? a.totalStars : (a.stars || 0);
          const starsB = typeof b.totalStars === 'number' ? b.totalStars : (b.stars || 0);
          const xpA = typeof a.totalXP === 'number' ? a.totalXP : (a.xp || 0);
          const xpB = typeof b.totalXP === 'number' ? b.totalXP : (b.xp || 0);

          if (scoreB !== scoreA) return scoreB - scoreA;
          if (starsB !== starsA) return starsB - starsA;
          return xpB - xpA;
        });

        return {
          success: true,
          message: 'Leaderboard berhasil dimuat.',
          data: {
            entries: entries.slice(0, 50) // Top 50
          }
        };
      }

      return {
        success: false,
        message: result.message || 'Tidak ada data leaderboard.',
        data: { entries: [] }
      };
    } catch (err) {
      console.error('[SyncManager] Leaderboard error:', err);
      return { success: false, message: 'Gagal mengambil data leaderboard.', data: { entries: [] } };
    }
  },

  /**
   * Flush all queued items to the server.
   * Called automatically when the browser comes back online.
   * @returns {Promise<void>}
   */
  async flushQueue() {
    if (this._syncing) return;
    if (this._queue.length === 0) return;
    if (!navigator.onLine) return;

    const apiUrl = this._getApiUrl();
    if (!apiUrl) return;

    this._syncing = true;

    // Clone the queue and work through it
    const itemsToSync = this._queue.slice();
    const failedItems = [];

    for (let i = 0; i < itemsToSync.length; i++) {
      const item = itemsToSync[i];
      // Ensure level key exists for older offline queued items
      if (item.levelId && !item.level) {
        item.level = item.levelId;
      }

      try {
        const url = apiUrl + '?action=syncProgress';
        const response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(item)
        });

        if (!response.ok) {
          failedItems.push(item);
          continue;
        }

        const result = await response.json();
        if (!result.success) {
          failedItems.push(item);
        }
      } catch (err) {
        console.warn('[SyncManager] Failed to flush item:', err);
        failedItems.push(item);
        // If we're offline now, stop flushing
        if (!navigator.onLine) {
          // Add remaining un-attempted items back
          for (let j = i + 1; j < itemsToSync.length; j++) {
            failedItems.push(itemsToSync[j]);
          }
          break;
        }
      }
    }

    // Replace queue with only the failed items
    this._queue = failedItems;
    this._saveQueue();
    this._syncing = false;

    if (failedItems.length > 0) {
      console.log('[SyncManager] ' + failedItems.length + ' item(s) masih menunggu sinkronisasi.');
    } else {
      console.log('[SyncManager] Semua data berhasil disinkronkan.');
    }
  },

  /**
   * Add an item to the offline queue.
   * @param {object} data - Progress data to queue
   */
  _addToQueue(data) {
    this._queue.push(data);
    this._saveQueue();
    console.log('[SyncManager] Item ditambahkan ke antrian offline. Total: ' + this._queue.length);
  },

  /**
   * Save the queue to localStorage for persistence.
   */
  _saveQueue() {
    try {
      localStorage.setItem('automaster_sync_queue', JSON.stringify(this._queue));
    } catch (e) {
      console.warn('[SyncManager] Failed to save queue to localStorage:', e);
    }
  },

  /**
   * Get the current queue length (for UI display).
   * @returns {number}
   */
  getQueueLength() {
    return this._queue.length;
  },

  /**
   * Check if currently syncing.
   * @returns {boolean}
   */
  isSyncing() {
    return this._syncing;
  },

  /**
   * Set up network event listeners for auto-flush.
   */
  _setupNetworkListeners() {
    var self = this;

    window.addEventListener('online', function () {
      console.log('[SyncManager] Koneksi kembali online. Memulai sinkronisasi...');
      // Small delay to ensure connection is stable
      clearTimeout(self._flushTimer);
      self._flushTimer = setTimeout(function () {
        self.flushQueue();
      }, 2000);
    });

    window.addEventListener('offline', function () {
      console.log('[SyncManager] Koneksi terputus. Data akan disimpan secara offline.');
    });
  }
};
