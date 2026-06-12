/**
 * SwfPlayer — SWF Animation Player Module
 * AutoMaster v2.0
 * 
 * Loads and displays SWF animations using the Ruffle Flash emulator.
 * Provides a modal-based player with title bar and close button.
 */
const SwfPlayer = {
  _modal: null,
  _rufflePlayer: null,
  _isRuffleLoaded: false,
  _currentSwf: null,

  /**
   * Initialize SwfPlayer — check for Ruffle and create modal container.
   */
  init() {
    // Check if Ruffle is already loaded
    if (window.RufflePlayer && typeof window.RufflePlayer.newest === 'function') {
      this._isRuffleLoaded = true;
    }

    // Create modal container if it doesn't exist
    if (!document.getElementById('swf-player-modal')) {
      this._createModal();
    } else {
      this._modal = document.getElementById('swf-player-modal');
    }

    // Inject styles if not present
    if (!document.getElementById('swf-player-styles')) {
      this._injectStyles();
    }
  },

  /**
   * Load and initialize Ruffle from local files or CDN.
   * @returns {Promise<boolean>} True if Ruffle was loaded successfully.
   */
  async loadRuffle() {
    if (this._isRuffleLoaded) return true;

    // Set up Ruffle config
    window.RufflePlayer = window.RufflePlayer || {};
    window.RufflePlayer.config = window.RufflePlayer.config || {
      autoplay: 'on',
      unmuteOverlay: 'hidden',
      backgroundColor: '#1a1a2e',
      letterbox: 'on',
      warnOnUnsupportedContent: false,
      contextMenu: 'off',
      showSwfDownload: false
    };

    // Try loading Ruffle from local path first, then CDN
    var ruffleUrls = [
      'ruffle/ruffle.js',
      'lib/ruffle/ruffle.js',
      'vendor/ruffle/ruffle.js',
      'js/ruffle/ruffle.js',
      'https://unpkg.com/@ruffle-rs/ruffle/ruffle.js'
    ];

    for (var i = 0; i < ruffleUrls.length; i++) {
      try {
        await this._loadScript(ruffleUrls[i]);
        if (window.RufflePlayer && typeof window.RufflePlayer.newest === 'function') {
          this._isRuffleLoaded = true;
          console.log('[SwfPlayer] Ruffle berhasil dimuat dari: ' + ruffleUrls[i]);
          return true;
        }
      } catch (e) {
        console.warn('[SwfPlayer] Gagal memuat Ruffle dari: ' + ruffleUrls[i]);
      }
    }

    console.error('[SwfPlayer] Gagal memuat Ruffle dari semua sumber.');
    return false;
  },

  /**
   * Load a JavaScript file dynamically.
   * @param {string} src - Script URL
   * @returns {Promise<void>}
   */
  _loadScript(src) {
    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = function () { resolve(); };
      script.onerror = function () { reject(new Error('Failed to load: ' + src)); };
      document.head.appendChild(script);
    });
  },

  /**
   * Play a SWF file in the modal player.
   * 
   * @param {string} swfPath - Path to the SWF file (relative to OTOMOTIF/ folder)
   * @param {string} title - Display title for the animation
   * @returns {Promise<void>}
   */
  async play(swfPath, title) {
    if (!swfPath) {
      console.error('[SwfPlayer] Tidak ada path SWF yang diberikan.');
      this._showError('Path file animasi tidak valid.');
      return;
    }

    // Ensure Ruffle is loaded
    if (!this._isRuffleLoaded) {
      this._showLoading('Memuat Ruffle Flash Player...');
      var loaded = await this.loadRuffle();
      if (!loaded) {
        this._showError('Gagal memuat Flash Player (Ruffle). Pastikan file Ruffle tersedia.');
        return;
      }
    }

    // Check for file:// protocol CORS restriction
    if (window.location.protocol === 'file:') {
      this._showModal(title || 'Animasi');
      this._showError(
        'Keamanan Browser (CORS Block):\n' +
        'Browser memblokir pemutaran file Flash (.swf) jika game dibuka langsung klik file komputer (file://).\n\n' +
        'Cara Mengatasi:\n' +
        '1. Jalankan lewat Local Server (misal: jalankan Live Server di VS Code, atau ketik "python -m http.server" di Command Prompt pada folder GIM).\n' +
        '2. Atau, buka game setelah di-deploy secara online (menggunakan link HTTP/HTTPS).'
      );
      return;
    }

    // Build the full SWF path
    var fullPath = swfPath;
    if (!swfPath.startsWith('OTOMOTIF/') && !swfPath.startsWith('OTOMOTIF\\') && !swfPath.startsWith('http')) {
      fullPath = 'OTOMOTIF/' + swfPath;
    }

    this._currentSwf = fullPath;

    // Show modal with loading state
    this._showModal(title || 'Animasi');
    this._showLoading('Memuat animasi: ' + (title || swfPath) + '...');

    try {
      // Get Ruffle instance
      var ruffle = window.RufflePlayer.newest();
      var player = ruffle.createPlayer();

      // Configure player dimensions
      var container = document.getElementById('swf-player-container');
      if (!container) {
        this._showError('Container player tidak ditemukan.');
        return;
      }

      // Clear previous content
      container.innerHTML = '';

      // Style the player element
      player.style.width = '100%';
      player.style.height = '100%';

      container.appendChild(player);

      // Load the SWF
      await player.load({ url: fullPath });

      this._rufflePlayer = player;
      console.log('[SwfPlayer] SWF berhasil dimuat: ' + fullPath);
    } catch (err) {
      console.error('[SwfPlayer] Error loading SWF:', err);
      this._showError(
        'Gagal memuat animasi: ' + (title || swfPath) + '.\n' +
        'Pastikan file SWF tersedia di folder OTOMOTIF/.'
      );
    }
  },

  /**
   * Close the SWF player and clean up.
   */
  close() {
    // Stop and remove the Ruffle player
    if (this._rufflePlayer) {
      try {
        if (typeof this._rufflePlayer.pause === 'function') {
          this._rufflePlayer.pause();
        }
        if (typeof this._rufflePlayer.remove === 'function') {
          this._rufflePlayer.remove();
        } else if (this._rufflePlayer.parentNode) {
          this._rufflePlayer.parentNode.removeChild(this._rufflePlayer);
        }
      } catch (e) {
        console.warn('[SwfPlayer] Cleanup error:', e);
      }
      this._rufflePlayer = null;
    }

    // Clear the container
    var container = document.getElementById('swf-player-container');
    if (container) {
      container.innerHTML = '';
    }

    // Hide modal
    this._hideModal();
    this._currentSwf = null;
  },

  /**
   * Get list of animations for a specific level.
   * @param {number|string} levelId - Level identifier (1-6)
   * @returns {Array<{file: string, path: string, title: string, slide: number, desc: string}>}
   */
  getAnimationsForLevel(levelId) {
    var id = parseInt(levelId, 10);
    var animations = SWF_ANIMATIONS[id];

    if (!animations || !Array.isArray(animations)) {
      return [];
    }

    return animations.map(function (anim) {
      return {
        file: anim.file,
        path: 'OTOMOTIF/' + anim.file,
        title: anim.title,
        slide: anim.slide,
        desc: anim.desc
      };
    });
  },

  /**
   * Get animations for a specific slide within a level.
   * @param {number|string} levelId - Level identifier (1-6)
   * @param {number} slideIndex - Slide index (0-based)
   * @returns {Array<{file: string, path: string, title: string, slide: number, desc: string}>}
   */
  getAnimationsForSlide(levelId, slideIndex) {
    var allAnims = this.getAnimationsForLevel(levelId);
    var idx = parseInt(slideIndex, 10);

    return allAnims.filter(function (anim) {
      return anim.slide === idx;
    });
  },

  /**
   * Get the total number of SWF animations available.
   * @returns {number}
   */
  getTotalAnimationCount() {
    var count = 0;
    for (var level in SWF_ANIMATIONS) {
      if (SWF_ANIMATIONS.hasOwnProperty(level)) {
        count += SWF_ANIMATIONS[level].length;
      }
    }
    return count;
  },

  /**
   * Check if a SWF file exists for a given level and filename.
   * @param {number|string} levelId
   * @param {string} filename
   * @returns {object|null}
   */
  findAnimation(levelId, filename) {
    var id = parseInt(levelId, 10);
    var animations = SWF_ANIMATIONS[id];
    if (!animations) return null;

    for (var i = 0; i < animations.length; i++) {
      if (animations[i].file === filename) {
        return animations[i];
      }
    }
    return null;
  },

  // ========== Modal UI Methods ==========

  /**
   * Create the modal DOM structure.
   */
  _createModal() {
    var modal = document.createElement('div');
    modal.id = 'swf-player-modal';
    modal.className = 'swf-modal-overlay';
    modal.style.display = 'none';

    modal.innerHTML =
      '<div class="swf-modal-content">' +
        '<div class="swf-modal-header">' +
          '<div class="swf-modal-title" id="swf-player-title">Animasi</div>' +
          '<div class="swf-modal-controls">' +
            '<button class="swf-btn-fullscreen" id="swf-btn-fullscreen" title="Fullscreen">⛶</button>' +
            '<button class="swf-btn-close" id="swf-btn-close" title="Tutup">&times;</button>' +
          '</div>' +
        '</div>' +
        '<div class="swf-modal-body">' +
          '<div id="swf-player-container" class="swf-player-container"></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
    this._modal = modal;

    // Event listeners
    var self = this;

    // Close button
    var closeBtn = document.getElementById('swf-btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        self.close();
      });
    }

    // Fullscreen button
    var fsBtn = document.getElementById('swf-btn-fullscreen');
    if (fsBtn) {
      fsBtn.addEventListener('click', function () {
        self._togglePlayerFullscreen();
      });
    }

    // Click overlay to close
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        self.close();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.keyCode === 27) && self._modal && self._modal.style.display !== 'none') {
        // Only close if KioskManager is not in quiz mode
        if (typeof KioskManager === 'undefined' || !KioskManager.isActive || KioskManager.getMode() !== 'quiz') {
          self.close();
        }
      }
    });
  },

  /**
   * Show the modal with a title.
   * @param {string} title
   */
  _showModal(title) {
    if (!this._modal) {
      this._createModal();
    }

    var titleEl = document.getElementById('swf-player-title');
    if (titleEl) {
      titleEl.textContent = title || 'Animasi';
    }

    this._modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  },

  /**
   * Hide the modal.
   */
  _hideModal() {
    if (this._modal) {
      this._modal.style.display = 'none';
    }
    document.body.style.overflow = '';
  },

  /**
   * Show a loading indicator in the player container.
   * @param {string} message
   */
  _showLoading(message) {
    var container = document.getElementById('swf-player-container');
    if (!container) return;

    container.innerHTML =
      '<div class="swf-loading">' +
        '<div class="swf-spinner"></div>' +
        '<p>' + (message || 'Memuat...') + '</p>' +
      '</div>';
  },

  /**
   * Show an error message in the player container.
   * @param {string} message
   */
  _showError(message) {
    // Ensure modal is visible
    if (this._modal && this._modal.style.display === 'none') {
      this._showModal('Error');
    }

    var container = document.getElementById('swf-player-container');
    if (!container) return;

    container.innerHTML =
      '<div class="swf-error">' +
        '<div class="swf-error-icon">⚠️</div>' +
        '<p>' + (message || 'Terjadi kesalahan.') + '</p>' +
        '<button class="swf-retry-btn" onclick="SwfPlayer.close()">Tutup</button>' +
      '</div>';
  },

  /**
   * Toggle fullscreen on the player content area.
   */
  _togglePlayerFullscreen() {
    var content = this._modal ? this._modal.querySelector('.swf-modal-content') : null;
    if (!content) return;

    var isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);

    if (isFs) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } else {
      if (content.requestFullscreen) content.requestFullscreen();
      else if (content.webkitRequestFullscreen) content.webkitRequestFullscreen();
    }
  },

  /**
   * Inject CSS styles for the modal player.
   */
  _injectStyles() {
    var style = document.createElement('style');
    style.id = 'swf-player-styles';
    style.textContent = [
      '.swf-modal-overlay {',
      '  position: fixed;',
      '  top: 0; left: 0; right: 0; bottom: 0;',
      '  background: rgba(0, 0, 0, 0.85);',
      '  z-index: 99999;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  animation: swfFadeIn 0.3s ease-out;',
      '}',
      '@keyframes swfFadeIn {',
      '  from { opacity: 0; }',
      '  to { opacity: 1; }',
      '}',
      '.swf-modal-content {',
      '  background: #1a1a2e;',
      '  border-radius: 16px;',
      '  width: 90vw;',
      '  max-width: 960px;',
      '  height: 80vh;',
      '  max-height: 720px;',
      '  display: flex;',
      '  flex-direction: column;',
      '  overflow: hidden;',
      '  box-shadow: 0 20px 60px rgba(0,0,0,0.5);',
      '  border: 1px solid rgba(255,255,255,0.1);',
      '}',
      '.swf-modal-header {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: space-between;',
      '  padding: 12px 20px;',
      '  background: linear-gradient(135deg, #16213e, #0f3460);',
      '  border-bottom: 1px solid rgba(255,255,255,0.1);',
      '  flex-shrink: 0;',
      '}',
      '.swf-modal-title {',
      '  color: #e0e0e0;',
      '  font-size: 16px;',
      '  font-weight: 600;',
      '  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;',
      '  white-space: nowrap;',
      '  overflow: hidden;',
      '  text-overflow: ellipsis;',
      '  flex: 1;',
      '  margin-right: 12px;',
      '}',
      '.swf-modal-controls {',
      '  display: flex;',
      '  gap: 8px;',
      '  flex-shrink: 0;',
      '}',
      '.swf-btn-fullscreen, .swf-btn-close {',
      '  background: rgba(255,255,255,0.1);',
      '  border: 1px solid rgba(255,255,255,0.2);',
      '  color: #e0e0e0;',
      '  width: 36px;',
      '  height: 36px;',
      '  border-radius: 8px;',
      '  cursor: pointer;',
      '  font-size: 18px;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  transition: all 0.2s;',
      '}',
      '.swf-btn-fullscreen:hover, .swf-btn-close:hover {',
      '  background: rgba(255,255,255,0.2);',
      '  transform: scale(1.1);',
      '}',
      '.swf-btn-close:hover {',
      '  background: #dc3545;',
      '  border-color: #dc3545;',
      '}',
      '.swf-modal-body {',
      '  flex: 1;',
      '  overflow: hidden;',
      '  position: relative;',
      '}',
      '.swf-player-container {',
      '  width: 100%;',
      '  height: 100%;',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  background: #000;',
      '}',
      '.swf-player-container ruffle-player,',
      '.swf-player-container ruffle-embed {',
      '  width: 100% !important;',
      '  height: 100% !important;',
      '}',
      '.swf-loading {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  color: #aaa;',
      '  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;',
      '  font-size: 14px;',
      '  gap: 16px;',
      '}',
      '.swf-spinner {',
      '  width: 48px;',
      '  height: 48px;',
      '  border: 4px solid rgba(255,255,255,0.1);',
      '  border-top-color: #4fc3f7;',
      '  border-radius: 50%;',
      '  animation: swfSpin 0.8s linear infinite;',
      '}',
      '@keyframes swfSpin {',
      '  to { transform: rotate(360deg); }',
      '}',
      '.swf-error {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  color: #ff6b6b;',
      '  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;',
      '  font-size: 14px;',
      '  gap: 12px;',
      '  padding: 20px;',
      '  text-align: center;',
      '}',
      '.swf-error-icon {',
      '  font-size: 48px;',
      '}',
      '.swf-retry-btn {',
      '  background: #0f3460;',
      '  color: #e0e0e0;',
      '  border: 1px solid rgba(255,255,255,0.2);',
      '  padding: 10px 24px;',
      '  border-radius: 8px;',
      '  cursor: pointer;',
      '  font-size: 14px;',
      '  margin-top: 8px;',
      '  transition: background 0.2s;',
      '}',
      '.swf-retry-btn:hover {',
      '  background: #16213e;',
      '}'
    ].join('\n');

    document.head.appendChild(style);
  }
};


/**
 * Complete SWF animation mapping for ALL 177 files across 6 levels.
 * SWF files are located in the OTOMOTIF/ subfolder relative to the game root.
 * 
 * Structure: { levelId: [ { file, title, slide, desc }, ... ] }
 */
const SWF_ANIMATIONS = {
  // ===== Level 1: Sistem Rem (33 files) =====
  1: [
    { file: 'AAA brake sys.swf', title: 'Sistem Rem Lengkap', slide: 2, desc: 'Animasi sistem rem kendaraan secara keseluruhan' },
    { file: 'AAA OTO brake-simple.swf', title: 'Prinsip Dasar Rem', slide: 2, desc: 'Cara kerja dasar sistem pengereman' },
    { file: 'AAA OTO brake-hydraulic1.swf', title: 'Rem Hidrolik (Bagian 1)', slide: 3, desc: 'Sistem rem hidrolik bagian pertama' },
    { file: 'AAA OTO brake-hydraulic2.swf', title: 'Rem Hidrolik (Bagian 2)', slide: 3, desc: 'Sistem rem hidrolik bagian kedua' },
    { file: 'AAA OTO brake-hydraulic3.swf', title: 'Rem Hidrolik (Bagian 3)', slide: 3, desc: 'Sistem rem hidrolik bagian ketiga' },
    { file: 'AAA OTO disc-brake.swf', title: 'Rem Cakram', slide: 4, desc: 'Animasi cara kerja rem cakram' },
    { file: 'AAA disk brake.swf', title: 'Detail Rem Cakram', slide: 4, desc: 'Detail komponen rem cakram' },
    { file: 'AAA BRAKE DISK INST.swf', title: 'Pemasangan Rem Cakram', slide: 4, desc: 'Prosedur pemasangan rem cakram' },
    { file: 'AAA DISK BRAKE TORQUE.swf', title: 'Torsi Rem Cakram', slide: 4, desc: 'Pengukuran torsi rem cakram' },
    { file: 'AAA OTO drum-brake1.swf', title: 'Rem Tromol (Bagian 1)', slide: 5, desc: 'Animasi cara kerja rem tromol' },
    { file: 'AAA OTO drum-brake3.swf', title: 'Rem Tromol (Bagian 3)', slide: 5, desc: 'Detail rem tromol' },
    { file: 'AAA drum brake.swf', title: 'Detail Rem Tromol', slide: 5, desc: 'Komponen rem tromol' },
    { file: 'AAA drum_brake.swf', title: 'Animasi Rem Tromol', slide: 5, desc: 'Animasi kerja rem tromol' },
    { file: 'drum_brake.swf', title: 'Rem Tromol', slide: 5, desc: 'Cara kerja rem tromol' },
    { file: 'AAA BRAKE DRUM ADJ.swf', title: 'Penyetelan Rem Tromol', slide: 5, desc: 'Prosedur penyetelan rem tromol' },
    { file: 'AAA BRAKE DRUM REMV.swf', title: 'Pembongkaran Rem Tromol', slide: 5, desc: 'Prosedur pembongkaran rem tromol' },
    { file: 'AAA master_silinder.swf', title: 'Master Silinder', slide: 6, desc: 'Animasi kerja master silinder rem' },
    { file: 'master_silinder.swf', title: 'Detail Master Silinder', slide: 6, desc: 'Komponen master silinder' },
    { file: 'AAA booster.swf', title: 'Brake Booster', slide: 6, desc: 'Animasi brake booster / penguat rem' },
    { file: 'AAA OTO power-brake5.swf', title: 'Power Brake', slide: 6, desc: 'Sistem power brake' },
    { file: 'AAA leading.swf', title: 'Leading & Trailing Shoe', slide: 6, desc: 'Animasi leading dan trailing shoe' },
    { file: 'AAA abs.swf', title: 'Sistem ABS', slide: 7, desc: 'Animasi cara kerja Anti-lock Braking System' },
    { file: 'AAA abs ecu.swf', title: 'ECU ABS', slide: 7, desc: 'Electronic Control Unit untuk ABS' },
    { file: 'AAA HAND BRAKE.swf', title: 'Rem Tangan / Parkir', slide: 7, desc: 'Animasi sistem rem tangan' },
    { file: 'AAA BRAKE CHECK0.swf', title: 'Pemeriksaan Rem', slide: 7, desc: 'Prosedur pemeriksaan sistem rem' },
    { file: 'AAA BRAKE01.swf', title: 'Rem Dasar', slide: 2, desc: 'Animasi rem dasar' },
    { file: 'AAA RAKE-01.swf', title: 'Komponen Rem', slide: 2, desc: 'Detail komponen sistem rem' },
    { file: 'dual_brake.swf', title: 'Rem Ganda / Dual Brake', slide: 6, desc: 'Sistem rem ganda' },
    { file: 'ADJUST BRAKE.swf', title: 'Penyetelan Rem', slide: 7, desc: 'Cara menyetel rem' },
    { file: 'BRAKE SHOE CLN.swf', title: 'Pembersihan Sepatu Rem', slide: 7, desc: 'Prosedur pembersihan sepatu rem' },
    { file: 'OPEN DISK.swf', title: 'Pembukaan Disk Rem', slide: 4, desc: 'Cara membuka komponen disk rem' },
    { file: 'AAA DISK PREE LOAD.swf', title: 'Pre-load Disk', slide: 4, desc: 'Penyetelan pre-load disk rem' },
    { file: 'melepas roda.swf', title: 'Melepas Roda', slide: 7, desc: 'Prosedur melepas roda kendaraan' }
  ],

  // ===== Level 2: Mesin Kendaraan (24 files) =====
  2: [
    { file: 'engine.swf', title: 'Mesin Kendaraan Lengkap', slide: 0, desc: 'Animasi mesin kendaraan secara keseluruhan' },
    { file: 'engines.swf', title: 'Jenis-jenis Mesin', slide: 0, desc: 'Berbagai jenis mesin kendaraan' },
    { file: 'OTO engine.swf', title: 'Engine Overview', slide: 0, desc: 'Pengenalan mesin otomotif' },
    { file: 'ENGINES4 stroke.swf', title: 'Mesin 4 Langkah', slide: 1, desc: 'Animasi siklus 4 langkah' },
    { file: 'ENGINES4 stroke (1).swf', title: 'Mesin 4 Langkah (Detail 1)', slide: 1, desc: 'Detail siklus 4 langkah bagian 1' },
    { file: 'ENGINES4 stroke (2).swf', title: 'Mesin 4 Langkah (Detail 2)', slide: 1, desc: 'Detail siklus 4 langkah bagian 2' },
    { file: 'mesin_bensin_4_langkah.swf', title: 'Mesin Bensin 4 Langkah', slide: 1, desc: 'Siklus mesin bensin 4 langkah' },
    { file: 'mesin_bensin_2_langkah.swf', title: 'Mesin Bensin 2 Langkah', slide: 1, desc: 'Siklus mesin bensin 2 langkah' },
    { file: 'crankshaft&piston.swf', title: 'Crankshaft & Piston', slide: 2, desc: 'Animasi crankshaft dan piston' },
    { file: 'OTO camshaft-cam.swf', title: 'Camshaft & Cam', slide: 2, desc: 'Animasi camshaft' },
    { file: 'OTO camshaft-pushrod.swf', title: 'Pushrod Camshaft', slide: 2, desc: 'Sistem pushrod camshaft' },
    { file: 'OTO camshaft-sohc.swf', title: 'SOHC Camshaft', slide: 2, desc: 'Single Overhead Camshaft' },
    { file: 'BLOCK CYL.swf', title: 'Blok Silinder', slide: 3, desc: 'Detail blok silinder mesin' },
    { file: 'cylinder head.swf', title: 'Kepala Silinder', slide: 3, desc: 'Komponen kepala silinder' },
    { file: 'CYL HEAD.swf', title: 'Detail Cylinder Head', slide: 3, desc: 'Detail cylinder head mesin' },
    { file: 'CYL HEAD RETAK.swf', title: 'Kerusakan Cylinder Head', slide: 3, desc: 'Analisis kerusakan cylinder head' },
    { file: 'karter.swf', title: 'Karter / Oil Pan', slide: 3, desc: 'Komponen karter mesin' },
    { file: 'CARTER OPENED.swf', title: 'Karter Terbuka', slide: 3, desc: 'Detail bagian dalam karter' },
    { file: 'OTO engine-ignition.swf', title: 'Sistem Pengapian', slide: 4, desc: 'Animasi sistem pengapian mesin' },
    { file: 'engine-ignition.swf', title: 'Detail Pengapian', slide: 4, desc: 'Detail sistem pengapian' },
    { file: 'OTO engine-qotd.swf', title: 'Engine Quiz', slide: 4, desc: 'Kuis tentang mesin' },
    { file: 'diesel_engine.swf', title: 'Mesin Diesel', slide: 5, desc: 'Animasi mesin diesel' },
    { file: 'OTO diesel.swf', title: 'Prinsip Mesin Diesel', slide: 5, desc: 'Prinsip kerja mesin diesel' },
    { file: 'disel comustions.swf', title: 'Pembakaran Diesel', slide: 5, desc: 'Proses pembakaran mesin diesel' }
  ],

  // ===== Level 3: Sistem Kelistrikan (26 files) =====
  3: [
    { file: 'OTO ALAT UKUR listrik.swf', title: 'Alat Ukur Listrik', slide: 0, desc: 'Penggunaan alat ukur kelistrikan otomotif' },
    { file: 'accu.swf', title: 'Aki / Baterai', slide: 1, desc: 'Animasi komponen aki kendaraan' },
    { file: 'AKI.swf', title: 'Detail Aki', slide: 1, desc: 'Detail spesifikasi aki' },
    { file: 'ACCU SPEC.swf', title: 'Spesifikasi Aki', slide: 1, desc: 'Spesifikasi teknis aki' },
    { file: 'ACCU SPECC.swf', title: 'Aki Spesifikasi 2', slide: 1, desc: 'Spesifikasi aki bagian 2' },
    { file: 'ACCUSPEEC.swf', title: 'Aki Detail', slide: 1, desc: 'Detail tambahan aki' },
    { file: 'charging_sytem_voltage.swf', title: 'Sistem Pengisian', slide: 2, desc: 'Animasi sistem pengisian/charging' },
    { file: 'ALTERNAT.swf', title: 'Alternator', slide: 2, desc: 'Animasi kerja alternator' },
    { file: 'ALTERNAT IC REG.swf', title: 'IC Regulator Alternator', slide: 2, desc: 'IC regulator pada alternator' },
    { file: 'motor_starter.swf', title: 'Motor Starter', slide: 3, desc: 'Animasi kerja motor starter' },
    { file: 'basic statre wire.swf', title: 'Rangkaian Starter', slide: 3, desc: 'Rangkaian kelistrikan starter' },
    { file: 'KUNCI KONTAK.swf', title: 'Kunci Kontak', slide: 3, desc: 'Sistem kunci kontak kendaraan' },
    { file: 'headlamp.swf', title: 'Lampu Kepala', slide: 4, desc: 'Animasi sistem lampu kepala' },
    { file: 'head lamp.swf', title: 'Detail Head Lamp', slide: 4, desc: 'Detail sistem head lamp' },
    { file: 'head lamp bulp.swf', title: 'Bohlam Lampu', slide: 4, desc: 'Jenis-jenis bohlam lampu kendaraan' },
    { file: 'head lamp relay.swf', title: 'Relay Lampu', slide: 4, desc: 'Rangkaian relay lampu kepala' },
    { file: 'HEAD LAMP SWT.swf', title: 'Saklar Lampu', slide: 4, desc: 'Saklar lampu kepala' },
    { file: 'HEAD LAMP WICH.swf', title: 'Switch Lampu', slide: 4, desc: 'Switch lampu kepala' },
    { file: 'flasher.swf', title: 'Flasher / Sein', slide: 4, desc: 'Animasi kerja flasher lampu sein' },
    { file: 'DASHBOARD.swf', title: 'Dashboard', slide: 5, desc: 'Animasi dashboard kendaraan lengkap' },
    { file: 'OTO car-computer-intro.swf', title: 'Komputer Mobil', slide: 5, desc: 'Pengenalan sistem komputer mobil' },
    { file: 'OTO car-alarm-mercury.swf', title: 'Alarm Mercury', slide: 5, desc: 'Sistem alarm tipe mercury' },
    { file: 'OTO car-alarm-shock.swf', title: 'Alarm Shock Sensor', slide: 5, desc: 'Alarm dengan sensor getaran' },
    { file: 'OTO fuel-gauge.swf', title: 'Fuel Gauge', slide: 5, desc: 'Animasi pengukur bahan bakar' },
    { file: 'INTE TEST RADIO.SWF', title: 'Test Radio', slide: 5, desc: 'Pengujian sistem radio' },
    { file: 'INTELEGENCE TEST2.swf', title: 'Intelligence Test', slide: 5, desc: 'Test kecerdasan otomotif' }
  ],

  // ===== Level 4: Pemindah Tenaga (46 files) =====
  4: [
    { file: 'clutch.swf', title: 'Kopling', slide: 0, desc: 'Animasi sistem kopling kendaraan' },
    { file: 'CLUTH.swf', title: 'Detail Kopling', slide: 0, desc: 'Detail komponen kopling' },
    { file: 'OTO clutch-fig2.swf', title: 'Kopling (Gambar 2)', slide: 0, desc: 'Ilustrasi kopling bagian 2' },
    { file: 'OTO clutch-fig3.swf', title: 'Kopling (Gambar 3)', slide: 0, desc: 'Ilustrasi kopling bagian 3' },
    { file: 'OTO clutch-fig5.swf', title: 'Kopling (Gambar 5)', slide: 0, desc: 'Ilustrasi kopling bagian 5' },
    { file: 'cluth sistem.swf', title: 'Sistem Kopling', slide: 0, desc: 'Sistem kopling lengkap' },
    { file: 'cluth works.swf', title: 'Cara Kerja Kopling', slide: 0, desc: 'Animasi cara kerja kopling' },
    { file: 'KOPLINGS.swf', title: 'Kopling Detail', slide: 0, desc: 'Detail kopling kendaraan' },
    { file: 'CLUTH OVER HOUL.swf', title: 'Overhaul Kopling', slide: 0, desc: 'Prosedur overhaul kopling' },
    { file: 'manual tranaxle.swf', title: 'Transmisi Manual', slide: 1, desc: 'Animasi transmisi manual lengkap' },
    { file: 'eaton_transmission.swf', title: 'Transmisi Eaton', slide: 1, desc: 'Transmisi model Eaton' },
    { file: 'OTO automatic-transmission-gears-diagram.swf', title: 'Diagram Transmisi Otomatis', slide: 1, desc: 'Diagram roda gigi transmisi otomatis' },
    { file: 'OTO automatic-transmission-planetary.swf', title: 'Planetary Gear', slide: 1, desc: 'Animasi planetary gear transmisi otomatis' },
    { file: 'OTO gear-animation.swf', title: 'Animasi Roda Gigi', slide: 2, desc: 'Animasi dasar roda gigi' },
    { file: 'OTO gear-detail.swf', title: 'Detail Roda Gigi', slide: 2, desc: 'Detail komponen roda gigi' },
    { file: 'OTO gear-involute.swf', title: 'Roda Gigi Involute', slide: 2, desc: 'Profil involute roda gigi' },
    { file: 'OTO gearline-animation.swf', title: 'Gearline Animation', slide: 2, desc: 'Animasi gearline' },
    { file: 'OTO geartrain-animation.swf', title: 'Gear Train', slide: 2, desc: 'Animasi gear train' },
    { file: 'HUB GEAR.swf', title: 'Hub Gear', slide: 2, desc: 'Animasi hub gear' },
    { file: 'CHAINS4-01.swf', title: 'Rantai Penggerak', slide: 2, desc: 'Sistem rantai penggerak' },
    { file: 'DIFFERENTIAL.swf', title: 'Diferensial', slide: 3, desc: 'Animasi sistem diferensial' },
    { file: 'DIFFERNTIAL.swf', title: 'Diferensial Detail', slide: 3, desc: 'Detail sistem diferensial' },
    { file: 'OTO differential.swf', title: 'Differential Animation', slide: 3, desc: 'Animasi diferensial' },
    { file: 'OTO differential-straight.swf', title: 'Diferensial Lurus', slide: 3, desc: 'Diferensial saat jalan lurus' },
    { file: 'OTO differential-turning.swf', title: 'Diferensial Belok', slide: 3, desc: 'Diferensial saat berbelok' },
    { file: 'OTO differential-turning2.swf', title: 'Diferensial Belok 2', slide: 3, desc: 'Detail diferensial saat berbelok' },
    { file: 'OTO differential-viscous.swf', title: 'Diferensial Viscous', slide: 3, desc: 'Viscous coupling diferensial' },
    { file: 'DIFFERENTIAL OPEN.swf', title: 'Pembukaan Diferensial', slide: 3, desc: 'Prosedur buka diferensial' },
    { file: 'DIFFERENTAL INST.swf', title: 'Pemasangan Diferensial', slide: 3, desc: 'Prosedur pasang diferensial' },
    { file: 'DIFFERNTIAL RUN OUT.swf', title: 'Run Out Diferensial', slide: 3, desc: 'Pengukuran run out diferensial' },
    { file: 'BACKLASH SIDE GEAR.swf', title: 'Backlash Side Gear', slide: 3, desc: 'Pengukuran backlash side gear' },
    { file: 'BACKLAH SIDE.swf', title: 'Backlash Side', slide: 3, desc: 'Detail backlash' },
    { file: 'lsd_limited.swf', title: 'LSD (Limited Slip)', slide: 3, desc: 'Limited Slip Differential' },
    { file: 'OTO four-wheel-drive-basic.swf', title: 'Penggerak 4 Roda Dasar', slide: 4, desc: 'Sistem 4WD dasar' },
    { file: 'OTO four-wheel-drive-advanced.swf', title: 'Penggerak 4 Roda Lanjut', slide: 4, desc: 'Sistem 4WD lanjutan' },
    { file: 'OTO four-wheel-drive-traction.swf', title: '4WD Traction', slide: 4, desc: 'Sistem traksi 4WD' },
    { file: 'fwa.swf', title: 'Front Wheel Assembly', slide: 4, desc: 'Perakitan roda depan' },
    { file: 'engine 4 wd.swf', title: 'Engine 4WD System', slide: 4, desc: 'Mesin pada sistem 4WD' },
    { file: 'CONNECTOR.SWF', title: 'Konektor', slide: 5, desc: 'Jenis-jenis konektor' },
    { file: 'CONECTOR.swf', title: 'Detail Konektor', slide: 5, desc: 'Detail konektor' },
    { file: 'CONECTOR REMOVE.swf', title: 'Pelepasan Konektor', slide: 5, desc: 'Cara melepas konektor' },
    { file: 'CONECTOR REPLACE.swf', title: 'Penggantian Konektor', slide: 5, desc: 'Cara mengganti konektor' },
    { file: 'OTO convertible-basic.swf', title: 'Convertible Basic', slide: 5, desc: 'Sistem convertible dasar' },
    { file: 'MASANG BEARING.SWF', title: 'Pemasangan Bearing', slide: 5, desc: 'Prosedur pemasangan bearing' },
    { file: 'NTALLER MUR.swf', title: 'Pemasangan Mur', slide: 5, desc: 'Prosedur pemasangan mur' },
    { file: 'CLIP-02.swf', title: 'Clip Pengikat', slide: 5, desc: 'Jenis clip pengikat' },
    { file: 'CLIP02.swf', title: 'Detail Clip', slide: 5, desc: 'Detail clip' }
  ],

  // ===== Level 5: Bahan Bakar & Pendingin (27 files) =====
  5: [
    { file: 'fuel_tank.swf', title: 'Tangki Bahan Bakar', slide: 0, desc: 'Animasi tangki bahan bakar' },
    { file: 'fuel pump inlet.swf', title: 'Pompa Bahan Bakar', slide: 0, desc: 'Animasi pompa bahan bakar' },
    { file: 'fuel_meter.swf', title: 'Pengukur Bahan Bakar', slide: 0, desc: 'Animasi fuel meter' },
    { file: 'air filter.swf', title: 'Filter Udara', slide: 0, desc: 'Animasi filter udara mesin' },
    { file: 'AIR FLOW.swf', title: 'Air Flow Sensor', slide: 0, desc: 'Sensor aliran udara' },
    { file: 'injection gasolin.swf', title: 'Injeksi Bensin', slide: 1, desc: 'Animasi sistem injeksi bensin' },
    { file: 'injector disel.swf', title: 'Injektor Diesel', slide: 1, desc: 'Animasi injektor diesel' },
    { file: 'injectorr diesl.swf', title: 'Detail Injektor Diesel', slide: 1, desc: 'Detail injektor diesel' },
    { file: 'injektor & ECU.swf', title: 'Injektor & ECU', slide: 1, desc: 'Hubungan injektor dengan ECU' },
    { file: 'Common-rail.swf', title: 'Common Rail System', slide: 2, desc: 'Animasi sistem common rail' },
    { file: 'common rail.swf', title: 'Detail Common Rail', slide: 2, desc: 'Detail common rail' },
    { file: 'commonn rail.swf', title: 'Common Rail Injection', slide: 2, desc: 'Injeksi common rail' },
    { file: 'flow diesel fuel.swf', title: 'Aliran BBM Diesel', slide: 2, desc: 'Aliran bahan bakar diesel' },
    { file: 'flow disell fuel.swf', title: 'Detail Aliran BBM', slide: 2, desc: 'Detail aliran bahan bakar diesel' },
    { file: 'FLOWS3.swf', title: 'Aliran Fluida', slide: 2, desc: 'Animasi aliran fluida' },
    { file: 'OTO fuel-cell-animation.swf', title: 'Fuel Cell', slide: 2, desc: 'Animasi fuel cell' },
    { file: 'OTO cooling-system.swf', title: 'Sistem Pendingin', slide: 3, desc: 'Animasi sistem pendingin mesin lengkap' },
    { file: 'OTO cooling-system-pump.swf', title: 'Pompa Air', slide: 3, desc: 'Animasi pompa air pendingin' },
    { file: 'OTO cooling-system-cap.swf', title: 'Tutup Radiator', slide: 3, desc: 'Cara kerja tutup radiator' },
    { file: 'fan_clutch.swf', title: 'Fan Clutch', slide: 3, desc: 'Animasi fan clutch pendingin' },
    { file: 'AC SERVCE.swf', title: 'Servis AC', slide: 4, desc: 'Prosedur servis AC kendaraan' },
    { file: 'ac control.swf', title: 'Kontrol AC', slide: 4, desc: 'Sistem kontrol AC' },
    { file: 'CONTROL AC.swf', title: 'Panel Kontrol AC', slide: 4, desc: 'Panel kontrol AC kendaraan' },
    { file: 'CAONTRL AC.swf', title: 'Detail Kontrol AC', slide: 4, desc: 'Detail kontrol AC' },
    { file: 'CONTROL.swf', title: 'Kontrol Sistem', slide: 4, desc: 'Sistem kontrol umum' },
    { file: 'HOSE INST REMOVER.swf', title: 'Pelepasan Selang', slide: 5, desc: 'Prosedur pelepasan selang' },
    { file: 'HOSE INSTAL.swf', title: 'Pemasangan Selang', slide: 5, desc: 'Prosedur pemasangan selang' }
  ],

  // ===== Level 6: Ujian Akhir — Hybrid/Hi-Tech (11 files) =====
  6: [
    { file: 'CBT.swf', title: 'Computer Based Test', slide: 0, desc: 'Ujian berbasis komputer' },
    { file: 'OTO HITECH hybrid-car-electric.swf', title: 'Hybrid Car Electric', slide: 1, desc: 'Sistem elektrik mobil hybrid' },
    { file: 'OTO HITECH hybrid-car-gas.swf', title: 'Hybrid Car Gas', slide: 1, desc: 'Sistem gas mobil hybrid' },
    { file: 'OTO HITECH hybrid-car-gearset.swf', title: 'Hybrid Gearset', slide: 2, desc: 'Gearset mobil hybrid' },
    { file: 'OTO HITECH hybrid-car-parallel.swf', title: 'Hybrid Parallel', slide: 2, desc: 'Sistem hybrid parallel' },
    { file: 'OTO HITECH hybrid-car-series.swf', title: 'Hybrid Series', slide: 3, desc: 'Sistem hybrid series' },
    { file: 'OTO HITECH hybrid-car-insight-layout.swf', title: 'Honda Insight Layout', slide: 3, desc: 'Layout Honda Insight hybrid' },
    { file: 'OTO HITECH hybrid-car-prius-layout.swf', title: 'Toyota Prius Layout', slide: 4, desc: 'Layout Toyota Prius hybrid' },
    { file: 'OTO HITECH hy-wire-diagram.swf', title: 'Hy-Wire Diagram', slide: 4, desc: 'Diagram sistem hy-wire' },
    { file: 'OTO hang-gliding-fly.swf', title: 'Aerodinamika Fly', slide: 5, desc: 'Prinsip aerodinamika terbang' },
    { file: 'OTO hang-gliding-up.swf', title: 'Aerodinamika Up', slide: 5, desc: 'Prinsip aerodinamika naik' }
  ]
};
