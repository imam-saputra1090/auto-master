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
      levelId: levelId,
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

    // cloudData expected format: { levels: { "1": { learn: {...}, quiz: {...}, simulation: {...} }, ... } }
    if (cloudData && cloudData.levels) {
      const cloudLevels = cloudData.levels;

      for (const levelId in cloudLevels) {
        if (!cloudLevels.hasOwnProperty(levelId)) continue;

        if (!merged[levelId]) {
          merged[levelId] = {};
        }

        const cloudLevel = cloudLevels[levelId];

        for (const phase in cloudLevel) {
          if (!cloudLevel.hasOwnProperty(phase)) continue;

          const cloudPhase = cloudLevel[phase];
          const localPhase = merged[levelId][phase];

          if (!localPhase) {
            // No local data for this phase — use cloud
            merged[levelId][phase] = cloudPhase;
          } else {
            // Merge: keep the higher score/stars/xp
            merged[levelId][phase] = {
              score: Math.max(localPhase.score || 0, cloudPhase.score || 0),
              stars: Math.max(localPhase.stars || 0, cloudPhase.stars || 0),
              xp: Math.max(localPhase.xp || 0, cloudPhase.xp || 0),
              completed: (localPhase.completed || false) || (cloudPhase.completed || false),
              timestamp: (localPhase.timestamp && cloudPhase.timestamp)
                ? (localPhase.timestamp > cloudPhase.timestamp ? localPhase.timestamp : cloudPhase.timestamp)
                : (localPhase.timestamp || cloudPhase.timestamp || new Date().toISOString())
            };
          }
        }
      }
    }

    // Update local ProgressManager with merged data
    if (typeof ProgressManager !== 'undefined' && ProgressManager) {
      if (typeof ProgressManager.setAllProgress === 'function') {
        ProgressManager.setAllProgress(merged);
      } else if (typeof ProgressManager._data !== 'undefined') {
        ProgressManager._data = merged;
        if (typeof ProgressManager.save === 'function') {
          ProgressManager.save();
        }
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
      return { success: false, message: 'Tidak ada koneksi internet.', data: [] };
    }

    const apiUrl = this._getApiUrl();
    if (!apiUrl) {
      return { success: false, message: 'API URL belum dikonfigurasi.', data: [] };
    }

    try {
      const url = apiUrl + '?action=leaderboard&level=' + encodeURIComponent(levelId);
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors'
      });

      if (!response.ok) {
        return { success: false, message: 'Server error: ' + response.status, data: [] };
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        // Sort by score descending, then by timestamp ascending (earlier = better)
        const sorted = result.data.sort(function (a, b) {
          if (b.score !== a.score) return b.score - a.score;
          if (b.stars !== a.stars) return b.stars - a.stars;
          return (a.timestamp || '').localeCompare(b.timestamp || '');
        });

        return {
          success: true,
          message: 'Leaderboard berhasil dimuat.',
          data: sorted.slice(0, 50) // Top 50
        };
      }

      return {
        success: false,
        message: result.message || 'Tidak ada data leaderboard.',
        data: []
      };
    } catch (err) {
      console.error('[SyncManager] Leaderboard error:', err);
      return { success: false, message: 'Gagal mengambil data leaderboard.', data: [] };
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
