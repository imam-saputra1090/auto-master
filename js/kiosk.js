/**
 * KioskManager — Exam/Kiosk Anti-Cheat Module
 * AutoMaster v2.0
 * 
 * Prevents cheating during quizzes and simulations via:
 * - Fullscreen enforcement
 * - Tab/app switch detection (Page Visibility API)
 * - Progressive warning & penalty system
 * - Keyboard shortcut blocking
 * - Right-click disable
 * - Page close prevention
 * - Wake Lock API (screen sleep prevention)
 */
const KioskManager = {
  isActive: false,
  leaveCount: 0,
  maxLeaves: 3,
  _mode: null, // 'quiz', 'simulation', or 'learn'
  _wakeLock: null,
  _leaveTimestamps: [],
  _penaltyApplied: 0,
  _paused: false,
  _pauseTime: null,
  _totalPausedMs: 0,

  // Bound handler references for proper removal
  _boundOnVisibilityChange: null,
  _boundBlockKeyboard: null,
  _boundBlockContextMenu: null,
  _boundOnBeforeUnload: null,
  _boundOnFullscreenChange: null,

  /**
   * Initialize KioskManager.
   */
  init() {
    console.log('[KioskManager] Inisialisasi pengaman ujian (anti-cheat).');
  },

  /**
   * Activate kiosk mode with the specified strictness level.
   * 
   * @param {string} mode - 'quiz' (strictest), 'simulation' (medium), or 'learn' (relaxed)
   */
  activate(mode) {
    if (this.isActive) {
      this.deactivate();
    }

    this._mode = mode || 'quiz';
    this.isActive = true;
    this.leaveCount = 0;
    this._leaveTimestamps = [];
    this._penaltyApplied = 0;
    this._paused = false;
    this._pauseTime = null;
    this._totalPausedMs = 0;

    // Create bound references
    this._boundOnVisibilityChange = this._onVisibilityChange.bind(this);
    this._boundBlockKeyboard = this._blockKeyboard.bind(this);
    this._boundBlockContextMenu = this._blockContextMenu.bind(this);
    this._boundOnBeforeUnload = this._onBeforeUnload.bind(this);
    this._boundOnFullscreenChange = this._onFullscreenChange.bind(this);

    if (this._mode === 'learn') {
      // Learn mode: no restrictions at all
      console.log('[KioskManager] Mode belajar aktif — tanpa pembatasan.');
      return;
    }

    // Simulation and Quiz modes: fullscreen + visibility detection
    this._requestFullscreen();
    document.addEventListener('visibilitychange', this._boundOnVisibilityChange);
    document.addEventListener('fullscreenchange', this._boundOnFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this._boundOnFullscreenChange);

    if (this._mode === 'quiz') {
      // Quiz mode: add all strict protections
      document.addEventListener('keydown', this._boundBlockKeyboard, true);
      document.addEventListener('contextmenu', this._boundBlockContextMenu, true);
      window.addEventListener('beforeunload', this._boundOnBeforeUnload);
      this._requestWakeLock();
    }

    console.log('[KioskManager] Mode ' + this._mode + ' diaktifkan.');
  },

  /**
   * Deactivate kiosk mode and remove all restrictions.
   */
  deactivate() {
    if (!this.isActive) return;

    this.isActive = false;
    var prevMode = this._mode;
    this._mode = null;

    // Remove all event listeners
    if (this._boundOnVisibilityChange) {
      document.removeEventListener('visibilitychange', this._boundOnVisibilityChange);
    }
    if (this._boundOnFullscreenChange) {
      document.removeEventListener('fullscreenchange', this._boundOnFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', this._boundOnFullscreenChange);
    }
    if (this._boundBlockKeyboard) {
      document.removeEventListener('keydown', this._boundBlockKeyboard, true);
    }
    if (this._boundBlockContextMenu) {
      document.removeEventListener('contextmenu', this._boundBlockContextMenu, true);
    }
    if (this._boundOnBeforeUnload) {
      window.removeEventListener('beforeunload', this._boundOnBeforeUnload);
    }

    // Release Wake Lock
    this._releaseWakeLock();

    // Exit fullscreen
    this._exitFullscreen();

    // Clear bound references
    this._boundOnVisibilityChange = null;
    this._boundBlockKeyboard = null;
    this._boundBlockContextMenu = null;
    this._boundOnBeforeUnload = null;
    this._boundOnFullscreenChange = null;

    // Resume if paused
    if (this._paused) {
      this._paused = false;
      this._resumeQuizTimer();
    }

    console.log('[KioskManager] Mode ' + prevMode + ' dinonaktifkan.');
  },

  /**
   * Request fullscreen on the document element.
   */
  _requestFullscreen() {
    var elem = document.documentElement;
    try {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(function (err) {
          console.warn('[KioskManager] Fullscreen request denied:', err.message);
        });
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } catch (e) {
      console.warn('[KioskManager] Fullscreen API not available:', e);
    }
  },

  /**
   * Exit fullscreen mode.
   */
  _exitFullscreen() {
    try {
      if (document.exitFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(function () {});
        }
      } else if (document.webkitExitFullscreen) {
        if (document.webkitFullscreenElement) {
          document.webkitExitFullscreen();
        }
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } catch (e) {
      console.warn('[KioskManager] Exit fullscreen error:', e);
    }
  },

  /**
   * Handle fullscreen change — re-request if user exits fullscreen during quiz.
   */
  _onFullscreenChange() {
    if (!this.isActive) return;

    var isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);

    if (!isFullscreen && (this._mode === 'quiz' || this._mode === 'simulation')) {
      // User exited fullscreen — treat as a "leave" and re-request
      console.warn('[KioskManager] Fullscreen exited during ' + this._mode + ' mode.');
      // Small delay before re-requesting to avoid browser blocking
      var self = this;
      setTimeout(function () {
        if (self.isActive) {
          self._requestFullscreen();
        }
      }, 500);
    }
  },

  /**
   * Handle visibility change (tab/app switch detection).
   * Implements the progressive penalty system.
   */
  _onVisibilityChange() {
    if (!this.isActive) return;

    if (document.hidden || document.visibilityState === 'hidden') {
      // User LEFT the page
      this.leaveCount++;
      this._leaveTimestamps.push({
        time: new Date().toISOString(),
        count: this.leaveCount
      });

      console.warn('[KioskManager] Siswa meninggalkan halaman! Pelanggaran ke-' + this.leaveCount);

      // Pause quiz timer
      this._pauseQuizTimer();

      if (this._mode === 'quiz') {
        if (this.leaveCount === 1) {
          // 1st leave: Warning toast
          this._showWarningToast(
            '⚠️ Peringatan!',
            'Anda terdeteksi meninggalkan halaman ujian. Jangan beralih ke aplikasi lain!',
            'warning'
          );
        } else if (this.leaveCount === 2) {
          // 2nd leave: -10% score penalty
          this._penaltyApplied += 10;
          this._applyScorePenalty(10);
          this._showWarningToast(
            '🚫 Pelanggaran Kedua!',
            'Skor dikurangi 10%! Pelanggaran berikutnya akan mengakhiri ujian secara otomatis.',
            'danger'
          );
        } else if (this.leaveCount >= this.maxLeaves) {
          // 3rd+ leave: Auto-submit
          this._showWarningToast(
            '❌ Ujian Dihentikan!',
            'Terlalu banyak pelanggaran. Ujian disubmit otomatis dengan skor saat ini.',
            'danger'
          );
          this._autoSubmitQuiz();
        }
      } else if (this._mode === 'simulation') {
        // Simulation mode: just warn
        this._showWarningToast(
          '⚠️ Perhatian',
          'Anda meninggalkan simulasi. Timer dijeda.',
          'warning'
        );
      }
    } else {
      // User RETURNED to the page
      console.log('[KioskManager] Siswa kembali ke halaman.');

      // Resume quiz timer
      this._resumeQuizTimer();

      // Re-request fullscreen if needed
      var isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
      if (!isFullscreen) {
        this._requestFullscreen();
      }
    }
  },

  /**
   * Pause the quiz/simulation timer when student leaves.
   */
  _pauseQuizTimer() {
    if (this._paused) return;
    this._paused = true;
    this._pauseTime = Date.now();

    // Notify QuizEngine if available
    if (typeof QuizEngine !== 'undefined' && QuizEngine && typeof QuizEngine.pauseTimer === 'function') {
      QuizEngine.pauseTimer();
    }

    // Notify SimulationEngine if available
    if (typeof SimulationEngine !== 'undefined' && SimulationEngine && typeof SimulationEngine.pause === 'function') {
      SimulationEngine.pause();
    }
  },

  /**
   * Resume the quiz/simulation timer when student returns.
   */
  _resumeQuizTimer() {
    if (!this._paused) return;
    this._paused = false;

    if (this._pauseTime) {
      this._totalPausedMs += (Date.now() - this._pauseTime);
      this._pauseTime = null;
    }

    // Notify QuizEngine if available
    if (typeof QuizEngine !== 'undefined' && QuizEngine && typeof QuizEngine.resumeTimer === 'function') {
      QuizEngine.resumeTimer();
    }

    // Notify SimulationEngine if available
    if (typeof SimulationEngine !== 'undefined' && SimulationEngine && typeof SimulationEngine.resume === 'function') {
      SimulationEngine.resume();
    }
  },

  /**
   * Block keyboard shortcuts that could be used for cheating.
   * Blocks: Ctrl+C, Ctrl+V, Ctrl+U, Ctrl+Shift+I, Ctrl+Shift+J, F12, PrintScreen, etc.
   * 
   * @param {KeyboardEvent} e
   */
  _blockKeyboard(e) {
    if (!this.isActive || this._mode !== 'quiz') return;

    var blocked = false;

    // F12 — Dev Tools
    if (e.key === 'F12' || e.keyCode === 123) {
      blocked = true;
    }

    // PrintScreen
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
      blocked = true;
    }

    // F5 — Refresh
    if (e.key === 'F5' || e.keyCode === 116) {
      blocked = true;
    }

    // Ctrl-based shortcuts
    if (e.ctrlKey || e.metaKey) {
      var key = e.key ? e.key.toLowerCase() : '';
      var keyCode = e.keyCode || e.which;

      // Ctrl+C (Copy)
      if (key === 'c' || keyCode === 67) blocked = true;
      // Ctrl+V (Paste)
      if (key === 'v' || keyCode === 86) blocked = true;
      // Ctrl+X (Cut)
      if (key === 'x' || keyCode === 88) blocked = true;
      // Ctrl+A (Select All)
      if (key === 'a' || keyCode === 65) blocked = true;
      // Ctrl+U (View Source)
      if (key === 'u' || keyCode === 85) blocked = true;
      // Ctrl+S (Save)
      if (key === 's' || keyCode === 83) blocked = true;
      // Ctrl+P (Print)
      if (key === 'p' || keyCode === 80) blocked = true;
      // Ctrl+F (Find)
      if (key === 'f' || keyCode === 70) blocked = true;
      // Ctrl+R (Refresh)
      if (key === 'r' || keyCode === 82) blocked = true;
      // Ctrl+W (Close tab)
      if (key === 'w' || keyCode === 87) blocked = true;
      // Ctrl+T (New tab)
      if (key === 't' || keyCode === 84) blocked = true;
      // Ctrl+N (New window)
      if (key === 'n' || keyCode === 78) blocked = true;
      // Ctrl+L (Address bar)
      if (key === 'l' || keyCode === 76) blocked = true;
      // Ctrl+Tab (Switch tab)
      if (key === 'tab' || keyCode === 9) blocked = true;

      // Ctrl+Shift combinations
      if (e.shiftKey) {
        // Ctrl+Shift+I (Dev Tools)
        if (key === 'i' || keyCode === 73) blocked = true;
        // Ctrl+Shift+J (Console)
        if (key === 'j' || keyCode === 74) blocked = true;
        // Ctrl+Shift+C (Inspect Element)
        if (key === 'c' || keyCode === 67) blocked = true;
        // Ctrl+Shift+K (Console in Firefox)
        if (key === 'k' || keyCode === 75) blocked = true;
        // Ctrl+Shift+Delete (Clear data)
        if (key === 'delete' || keyCode === 46) blocked = true;
      }
    }

    // Alt-based shortcuts
    if (e.altKey) {
      var altKey = e.key ? e.key.toLowerCase() : '';
      var altKeyCode = e.keyCode || e.which;

      // Alt+Tab (task switch — detection only, can't fully block)
      if (altKey === 'tab' || altKeyCode === 9) blocked = true;
      // Alt+F4 (Close window)
      if (altKey === 'f4' || altKeyCode === 115) blocked = true;
      // Alt+Left/Right (Navigate back/forward)
      if (altKey === 'arrowleft' || altKeyCode === 37) blocked = true;
      if (altKey === 'arrowright' || altKeyCode === 39) blocked = true;
    }

    // Escape — prevent exiting fullscreen
    if (e.key === 'Escape' || e.keyCode === 27) {
      blocked = true;
    }

    if (blocked) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  },

  /**
   * Block right-click context menu during quiz mode.
   * @param {MouseEvent} e
   */
  _blockContextMenu(e) {
    if (!this.isActive || this._mode !== 'quiz') return;
    e.preventDefault();
    e.stopPropagation();
    return false;
  },

  /**
   * Prevent page close/refresh during quiz.
   * @param {BeforeUnloadEvent} e
   */
  _onBeforeUnload(e) {
    if (!this.isActive) return;

    var message = 'Ujian sedang berlangsung! Jika Anda meninggalkan halaman, jawaban Anda akan hilang.';
    e.preventDefault();
    e.returnValue = message;
    return message;
  },

  /**
   * Request a Wake Lock to prevent screen from sleeping.
   */
  async _requestWakeLock() {
    if (!('wakeLock' in navigator)) {
      console.warn('[KioskManager] Wake Lock API tidak tersedia di browser ini.');
      return;
    }

    try {
      this._wakeLock = await navigator.wakeLock.request('screen');

      this._wakeLock.addEventListener('release', function () {
        console.log('[KioskManager] Wake Lock dilepas.');
      });

      console.log('[KioskManager] Wake Lock aktif — layar tidak akan mati.');

      // Re-acquire Wake Lock when page becomes visible again (it gets released on hidden)
      var self = this;
      document.addEventListener('visibilitychange', function onWakeLockVisibility() {
        if (!self.isActive) {
          document.removeEventListener('visibilitychange', onWakeLockVisibility);
          return;
        }
        if (document.visibilityState === 'visible' && self._wakeLock === null) {
          self._requestWakeLock();
        }
      });
    } catch (err) {
      console.warn('[KioskManager] Wake Lock request failed:', err.message);
    }
  },

  /**
   * Release the Wake Lock.
   */
  _releaseWakeLock() {
    if (this._wakeLock) {
      try {
        this._wakeLock.release();
      } catch (e) {
        // Already released
      }
      this._wakeLock = null;
    }
  },

  /**
   * Apply a score penalty to the current quiz.
   * @param {number} percent - Percentage to deduct
   */
  _applyScorePenalty(percent) {
    if (typeof QuizEngine !== 'undefined' && QuizEngine) {
      if (typeof QuizEngine.applyPenalty === 'function') {
        QuizEngine.applyPenalty(percent);
      } else if (typeof QuizEngine._score !== 'undefined') {
        // Direct manipulation fallback
        var penalty = Math.round((QuizEngine._maxScore || 100) * (percent / 100));
        QuizEngine._score = Math.max(0, (QuizEngine._score || 0) - penalty);
        console.log('[KioskManager] Penalti ' + percent + '% diterapkan. Skor dikurangi ' + penalty + ' poin.');
      }
    }
  },

  /**
   * Auto-submit the quiz with current score.
   */
  _autoSubmitQuiz() {
    // Deactivate kiosk first to prevent interference
    var report = this.getCheatReport();

    // Try QuizEngine auto-submit
    if (typeof QuizEngine !== 'undefined' && QuizEngine) {
      if (typeof QuizEngine.autoSubmit === 'function') {
        QuizEngine.autoSubmit(report);
      } else if (typeof QuizEngine.submit === 'function') {
        QuizEngine.submit();
      } else if (typeof QuizEngine.finish === 'function') {
        QuizEngine.finish();
      }
    }

    this.deactivate();
  },

  /**
   * Show a warning toast notification to the student.
   * 
   * @param {string} title - Toast title
   * @param {string} message - Toast message
   * @param {string} type - 'warning', 'danger', or 'info'
   */
  _showWarningToast(title, message, type) {
    // Try to use App's toast system first
    if (typeof App !== 'undefined' && App && typeof App.showToast === 'function') {
      App.showToast(title + ' ' + message, type);
      return;
    }

    // Fallback: create our own toast
    var existingToast = document.getElementById('kiosk-warning-toast');
    if (existingToast) {
      existingToast.remove();
    }

    var toast = document.createElement('div');
    toast.id = 'kiosk-warning-toast';

    var bgColor = type === 'danger' ? '#dc3545' : (type === 'warning' ? '#ffc107' : '#17a2b8');
    var textColor = type === 'warning' ? '#212529' : '#ffffff';

    toast.style.cssText = [
      'position: fixed',
      'top: 20px',
      'left: 50%',
      'transform: translateX(-50%)',
      'z-index: 999999',
      'padding: 16px 24px',
      'border-radius: 12px',
      'background: ' + bgColor,
      'color: ' + textColor,
      'font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      'font-size: 15px',
      'font-weight: 600',
      'box-shadow: 0 8px 32px rgba(0,0,0,0.3)',
      'max-width: 500px',
      'text-align: center',
      'animation: kioskToastIn 0.4s ease-out',
      'line-height: 1.5'
    ].join('; ') + ';';

    toast.innerHTML = '<div style="font-size: 17px; margin-bottom: 6px;">' + title + '</div>' +
                      '<div style="font-weight: 400; font-size: 13px;">' + message + '</div>';

    // Add animation keyframes if not already present
    if (!document.getElementById('kiosk-toast-styles')) {
      var style = document.createElement('style');
      style.id = 'kiosk-toast-styles';
      style.textContent = [
        '@keyframes kioskToastIn {',
        '  from { opacity: 0; transform: translateX(-50%) translateY(-30px); }',
        '  to { opacity: 1; transform: translateX(-50%) translateY(0); }',
        '}',
        '@keyframes kioskToastOut {',
        '  from { opacity: 1; transform: translateX(-50%) translateY(0); }',
        '  to { opacity: 0; transform: translateX(-50%) translateY(-30px); }',
        '}'
      ].join('\n');
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Auto-dismiss after 5 seconds (longer for danger)
    var dismissTime = type === 'danger' ? 7000 : 5000;
    setTimeout(function () {
      if (toast.parentNode) {
        toast.style.animation = 'kioskToastOut 0.4s ease-in forwards';
        setTimeout(function () {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 400);
      }
    }, dismissTime);
  },

  /**
   * Get a detailed cheat report for logging / grading purposes.
   * @returns {{leaveCount: number, timestamps: Array, penaltyApplied: number, totalPausedMs: number, mode: string}}
   */
  getCheatReport() {
    return {
      leaveCount: this.leaveCount,
      timestamps: this._leaveTimestamps.slice(),
      penaltyApplied: this._penaltyApplied,
      totalPausedMs: this._totalPausedMs + (this._paused && this._pauseTime ? (Date.now() - this._pauseTime) : 0),
      mode: this._mode || 'inactive'
    };
  },

  /**
   * Check if the quiz is currently paused due to a tab switch.
   * @returns {boolean}
   */
  isPaused() {
    return this._paused;
  },

  /**
   * Get the current mode.
   * @returns {string|null}
   */
  getMode() {
    return this._mode;
  }
};
