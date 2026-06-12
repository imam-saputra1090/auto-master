/**
 * ============================================================
 * AutoMaster — Bengkel Virtual
 * app.js — Pengontrol Utama Aplikasi
 * ============================================================
 * Mengikat seluruh modul (Progress, Quiz, Simulation) dan
 * mengontrol navigasi layar, rendering konten, serta
 * interaksi pengguna di seluruh aplikasi.
 * ============================================================
 * FILE INI HARUS DIMUAT TERAKHIR setelah:
 *   data.js → progress.js → quiz.js → simulation.js → app.js
 * ============================================================
 */

// ── FAILSAFE AUDIOMANAGER ────────────────────────────────────
// Jika js/audio.js gagal dimuat (misal: belum diunggah atau 404),
// buat objek dummy agar aplikasi tidak crash saat diakses.
if (typeof AudioManager === 'undefined') {
  window.AudioManager = {
    bgmVolume: 0.3,
    sfxVolume: 0.5,
    isBgmMuted: true,
    isSfxMuted: true,
    init() {},
    playBGM() {},
    pauseBGM() {},
    setBGMVolume() {},
    toggleBGMMute() { return true; },
    playSFX() {},
    setSFXVolume() {},
    toggleSFXMute() { return true; }
  };
  console.warn('⚠️ AudioManager tidak ditemukan (js/audio.js mungkin gagal dimuat). Menggunakan dummy AudioManager.');
}

const App = {

  // ── State aplikasi ─────────────────────────────────────────
  currentScreen: 'landing',
  currentLevel: null,
  currentSlide: 0,
  lastPhase: null, // Untuk mengetahui fase terakhir saat retry
  learningSource: null, // Untuk melacak asal belajar ('library' atau 'map')

  // ════════════════════════════════════════════════════════════
  //  INISIALISASI
  // ════════════════════════════════════════════════════════════

  /**
   * Inisialisasi aplikasi saat DOM siap.
   */
  init() {
    try {
      console.log('🔄 Memulai inisialisasi AutoMaster...');

      // Cek dan terapkan tema tampilan (Terang/Gelap)
      const savedTheme = localStorage.getItem('automaster_theme') || 'light';
      if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
      }

      // Inisialisasi AudioManager
      if (typeof AudioManager !== 'undefined') {
        AudioManager.playBGM();
      }

      // Inisialisasi new modules
      if (typeof AuthManager !== 'undefined') {
        let savedApiUrl = localStorage.getItem('automaster_api_url');
        if (!savedApiUrl) {
          savedApiUrl = 'https://script.google.com/macros/s/AKfycbyF7CfDM7Bl6QcYESb0WkjhhrysDN4J8RtVedzZvnc2A7UMyWQtGqUMTxHcEw8zaa52/exec';
          localStorage.setItem('automaster_api_url', savedApiUrl);
        }
        AuthManager.setApiUrl(savedApiUrl);
        AuthManager.init();
      }

      if (typeof SyncManager !== 'undefined') {
        SyncManager.init();
      }

      if (typeof KioskManager !== 'undefined' && typeof KioskManager.init === 'function') {
        KioskManager.init();
      }

      if (typeof SwfPlayer !== 'undefined' && typeof SwfPlayer.init === 'function') {
        SwfPlayer.init();
      }

      // Inisialisasi sistem progres
      ProgressManager.init();

      // Setup network status indicators (online/offline dot)
      this.setupNetworkIndicator();

      // Cek apakah guru atau pemain sudah login
      const savedTeacherSecret = sessionStorage.getItem('automaster_teacher_secret');
      if (savedTeacherSecret) {
        this.teacherSecret = savedTeacherSecret;
        this.showScreen('teacher');
        this.refreshTeacherData();
      } else if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
        const session = AuthManager.getSession();
        if (session && session.nama) {
          ProgressManager.setPlayerName(session.nama);
        }
        this.showScreen('menu');
        this.updatePlayerInfo();
        this.syncProgressFromCloud();
      } else {
        this.showScreen('landing');
      }

      // Pasang semua event listener
      this.bindEvents();
    } catch (e) {
      console.error('⚠️ Terjadi kesalahan saat inisialisasi aplikasi:', e);
    } finally {
      // Sembunyikan loading overlay (selalu dilakukan meskipun ada error)
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 500);
      }
    }

    console.log('🚗 AutoMaster — Bengkel Virtual berhasil diinisialisasi!');
  },

  setupNetworkIndicator() {
    let indicator = document.getElementById('network-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'network-indicator';
      indicator.className = 'sync-status-indicator';
      indicator.innerHTML = '<span class="status-dot online"></span><span class="status-text">Online</span>';
      document.body.appendChild(indicator);
    }

    const updateStatus = () => {
      const dot = indicator.querySelector('.status-dot');
      const text = indicator.querySelector('.status-text');
      if (navigator.onLine) {
        dot.className = 'status-dot online';
        text.textContent = 'Online';
      } else {
        dot.className = 'status-dot offline';
        text.textContent = 'Offline';
      }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
  },

  async syncProgressFromCloud() {
    if (typeof SyncManager === 'undefined' || !navigator.onLine) return;
    try {
      this.showToast('🔄 Menyelaraskan progres...', 'info');
      const result = await SyncManager.pullProgress();
      if (result.success && result.data) {
        this.updatePlayerInfo();
        this.showToast('✅ Progres diselaraskan!', 'success');
      }
    } catch (e) {
      console.warn('[App] Cloud sync failed:', e);
    }
  },

  // ════════════════════════════════════════════════════════════
  //  EVENT BINDING
  // ════════════════════════════════════════════════════════════

  /**
   * Memasang semua event listener di seluruh elemen UI.
   */
  bindEvents() {
    // ── Login / Register Flow ──
    this._bindClick('link-to-register', () => {
      this.showScreen('register');
    });

    this._bindClick('link-to-login', () => {
      this.showScreen('login');
    });

    this._bindClick('link-to-landing-from-login', () => {
      this.showScreen('landing');
    });

    this._bindClick('link-to-landing-from-register', () => {
      this.showScreen('landing');
    });

    // Form Login Submit
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nis = document.getElementById('login-nis').value.trim();
        const pass = document.getElementById('login-password').value;
        
        if (!nis || !pass) {
          this.showToast('⚠️ Silakan isi semua bidang.', 'warning');
          return;
        }

        this.showToast('🔄 Mencoba masuk...', 'info');
        try {
          const res = await AuthManager.login(nis, pass);
          if (res.success) {
            this.showToast(`🎉 ${res.message}`, 'success');
            
            // Clear any dirty local storage progress from previous user before loading new progress
            if (typeof ProgressManager !== 'undefined' && typeof ProgressManager.resetProgress === 'function') {
              ProgressManager.resetProgress();
            }
            
            ProgressManager.setPlayerName(res.data.nama);
            this.showScreen('menu');
            this.updatePlayerInfo();
            await this.syncProgressFromCloud();
          } else {
            this.showToast(`❌ ${res.message}`, 'error');
          }
        } catch (err) {
          this.showToast('❌ Terjadi kesalahan saat menghubungi server.', 'error');
        }
      });
    }

    // Forgot Password Link Click
    this._bindClick('link-forgot-password', () => {
      this._showAlertDialog(
        'Lupa Password? 🔑',
        'Untuk keamanan akun Anda, silakan hubungi Pak <strong>Imam Saputra, S.T.</strong> selaku Guru Pengampu di kelas untuk mereset password Anda.<br><br>Guru Anda cukup mengetikkan password baru sementara di spreadsheet database, dan password tersebut akan otomatis terenkripsi saat Anda masuk pertama kali.'
      );
    });

    // Form Register Submit
    const formRegister = document.getElementById('form-register');
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nis = document.getElementById('register-nis').value.trim();
        const nama = document.getElementById('register-nama').value.trim();
        const kelas = document.getElementById('register-kelas').value;
        const wa = document.getElementById('register-wa').value.trim();
        const pass = document.getElementById('register-password').value;

        if (!nis || !nama || !kelas || !wa || !pass) {
          this.showToast('⚠️ Silakan isi semua bidang.', 'warning');
          return;
        }

        this.showToast('🔄 Mendaftarkan akun...', 'info');
        try {
          const res = await AuthManager.register(nis, nama, kelas, wa, pass);
          if (res.success) {
            this.showToast(`✅ ${res.message}`, 'success');
            this.showScreen('login');
            document.getElementById('login-nis').value = nis;
          } else {
            this.showToast(`❌ ${res.message}`, 'error');
          }
        } catch (err) {
          this.showToast('❌ Terjadi kesalahan saat menghubungi server.', 'error');
        }
      });
    }

    this._bindClick('btn-logout', () => {
      if (confirm('Apakah Anda yakin ingin keluar? Kemajuan Anda akan disimpan.')) {
        if (typeof SyncManager !== 'undefined') {
          SyncManager.flushQueue();
        }
        AuthManager.logout();
        this.showScreen('login');
        this.showToast('👋 Berhasil keluar.', 'info');
      }
    });

    // ── Leaderboard Refresh ──
    this._bindClick('btn-refresh-leaderboard', async () => {
      if (!navigator.onLine) {
        this.showToast('⚠️ Tidak ada internet. Papan peringkat tidak dapat diperbarui.', 'warning');
        return;
      }
      this.showToast('🔄 Memperbarui papan peringkat...', 'info');
      await this.renderLeaderboardTable();
    });
    // ── Landing Screen ──
    this._bindClick('btn-start', () => {
      if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
        const session = AuthManager.getSession();
        if (session && session.nama) {
          ProgressManager.setPlayerName(session.nama);
        }
        this.showScreen('menu');
        this.updatePlayerInfo();
        this.syncProgressFromCloud();
      } else {
        this.showScreen('login');
      }
    });

    // ── Modal Input Nama ──
    this._bindClick('btn-save-name', () => {
      const input = document.getElementById('input-name');
      const name = input ? input.value.trim() : '';
      if (name.length > 0) {
        ProgressManager.setPlayerName(name);
        this.hideModal('modal-name');
        this.showScreen('menu');
        this.updatePlayerInfo();
        this.showToast(`🎉 Selamat datang, ${name}!`, 'success');
      } else {
        this.showToast('⚠️ Silakan masukkan nama kamu.', 'warning');
      }
    });

    // Dukung Enter pada input nama
    const inputName = document.getElementById('input-name');
    if (inputName) {
      inputName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          document.getElementById('btn-save-name')?.click();
        }
      });
    }

    // Klik overlay modal untuk menutup
    const modalName = document.getElementById('modal-name');
    if (modalName) {
      modalName.addEventListener('click', (e) => {
        if (e.target === modalName) {
          // Jangan tutup jika belum ada nama
          const data = ProgressManager.getPlayerData();
          if (data.playerName) {
            this.hideModal('modal-name');
          }
        }
      });
    }

    // ── Menu Buttons ──
    this._bindClick('btn-goto-map', () => {
      this.showScreen('map');
      this.renderMap();
    });

    this._bindClick('btn-goto-library', () => {
      this.showScreen('library');
      this.renderLibrary();
    });

    this._bindClick('btn-goto-scores', () => {
      this.showScreen('scores');
      this.renderScoreboard();
    });

    this._bindClick('btn-goto-settings', () => {
      this.showScreen('settings');
      this.renderSettings();
    });

    // ── Back Buttons ──
    this._bindClick('btn-back-from-map', () => {
      this.showScreen('menu');
    });

    this._bindClick('btn-back-from-level', () => {
      this.showScreen('map');
      this.renderMap();
    });

    this._bindClick('btn-back-from-learn', () => {
      if (this.learningSource === 'library') {
        this.showScreen('library');
        this.renderLibrary();
      } else if (this.currentLevel) {
        this.openLevel(this.currentLevel);
      } else {
        this.showScreen('map');
        this.renderMap();
      }
    });

    this._bindClick('btn-back-from-animations', () => {
      if (this.currentLevel) {
        this.openLevel(this.currentLevel);
      } else {
        this.showScreen('map');
        this.renderMap();
      }
    });

    this._bindClick('btn-back-from-simulate', () => {
      if (typeof KioskManager !== 'undefined') {
        KioskManager.deactivate();
      }
      if (this.currentLevel) {
        this.openLevel(this.currentLevel);
      } else {
        this.showScreen('map');
        this.renderMap();
      }
    });

    this._bindClick('btn-back-from-quiz', () => {
      if (typeof KioskManager !== 'undefined') {
        KioskManager.deactivate();
      }
      // Hentikan timer kuis sebelum keluar
      if (QuizEngine && QuizEngine.stopTimer) {
        QuizEngine.stopTimer();
      }
      if (this.currentLevel) {
        this.openLevel(this.currentLevel);
      } else {
        this.showScreen('map');
        this.renderMap();
      }
    });

    this._bindClick('btn-back-from-library', () => {
      this.showScreen('menu');
    });

    this._bindClick('btn-back-from-scores', () => {
      this.showScreen('menu');
    });

    this._bindClick('btn-back-from-settings', () => {
      this.showScreen('menu');
    });

    // ── Map — Level Card Click (Event Delegation) ──
    const screenMap = document.getElementById('screen-map');
    if (screenMap) {
      screenMap.addEventListener('click', (e) => {
        const card = e.target.closest('.level-card');
        if (card && !card.classList.contains('locked')) {
          const levelId = parseInt(card.dataset.level);
          if (!isNaN(levelId)) {
            this.openLevel(levelId);
          }
        }
      });
    }

    // ── Level Hub — Phase Buttons ──
    this._bindClick('btn-phase-learn', () => {
      if (this.currentLevel) {
        this.startLearn(this.currentLevel);
      }
    });

    this._bindClick('btn-phase-animation', () => {
      if (this.currentLevel) {
        this.startAnimations(this.currentLevel);
      }
    });

    this._bindClick('btn-phase-simulate', () => {
      if (this.currentLevel) {
        const progress = ProgressManager.getPlayerData().levels[this.currentLevel];
        if (progress && progress.learnCompleted) {
          this.startSimulation(this.currentLevel);
        } else {
          this.showToast('📖 Selesaikan materi belajar terlebih dahulu!', 'warning');
        }
      }
    });

    this._bindClick('btn-phase-quiz', () => {
      if (this.currentLevel) {
        const progress = ProgressManager.getPlayerData().levels[this.currentLevel];
        if (progress && progress.simCompleted) {
          this.startQuiz(this.currentLevel);
        } else {
          this.showToast('🔧 Selesaikan simulasi terlebih dahulu!', 'warning');
        }
      }
    });

    // ── Learning Navigation ──
    this._bindClick('btn-learn-prev', () => this.prevLearnSlide());
    this._bindClick('btn-learn-next', () => this.nextLearnSlide());

    // ── Quiz Next Button ──
    this._bindClick('btn-quiz-next', () => {
      QuizEngine.nextQuestion();
    });

    // ── Simulation Finish Button ──
    this._bindClick('btn-sim-finish', () => {
      SimulationEngine.finish();
    });

    // ── Simulation Reset Button ──
    this._bindClick('btn-sim-reset', () => {
      SimulationEngine.reset();
    });

    // ── Results Buttons ──
    this._bindClick('btn-retry', () => {
      if (this.currentLevel && this.lastPhase) {
        if (this.lastPhase === 'quiz') {
          this.startQuiz(this.currentLevel);
        } else if (this.lastPhase === 'simulation') {
          this.startSimulation(this.currentLevel);
        }
      }
    });

    this._bindClick('btn-next-level', () => {
      if (this.currentLevel) {
        const nextLevel = this.currentLevel + 1;
        if (nextLevel <= 6 && ProgressManager.isLevelUnlocked(nextLevel)) {
          this.openLevel(nextLevel);
        } else {
          this.showScreen('map');
          this.renderMap();
          this.showToast('🏆 Selesaikan level ini untuk membuka level berikutnya!', 'info');
        }
      }
    });

    this._bindClick('btn-back-to-map', () => {
      this.showScreen('map');
      this.renderMap();
    });

    // ── Settings — Player Name Update ──
    const inputPlayerName = document.getElementById('input-player-name');
    if (inputPlayerName) {
      inputPlayerName.addEventListener('change', (e) => {
        const newName = e.target.value.trim();
        if (newName) {
          ProgressManager.setPlayerName(newName);
          this.updatePlayerInfo();
          this.showToast('✅ Nama berhasil diperbarui!', 'success');
        }
      });
    }

    // ── Settings — Reset Progress ──
    this._bindClick('btn-reset-progress', () => {
      this._showConfirmDialog(
        'Yakin ingin menghapus semua progres? Tindakan ini tidak bisa dibatalkan!',
        () => {
          ProgressManager.resetProgress();
          this.showScreen('landing');
          this.showToast('🗑️ Progres berhasil direset.', 'info');
        }
      );
    });

    // ── Edit Profile & Logout Bindings ──
    const playerInfoEl = document.getElementById('player-info');
    if (playerInfoEl) {
      playerInfoEl.addEventListener('click', (e) => {
        if (e.target.closest('#btn-header-profile') || e.target.closest('#header-avatar')) {
          this.showProfileModal();
        } else if (e.target.closest('#btn-header-logout')) {
          this.handleQuickLogout();
        }
      });
    }

    // Avatar selector clicks
    const avatarBtns = document.querySelectorAll('.avatar-option-btn');
    avatarBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedBtn = e.currentTarget;
        const avatar = selectedBtn.dataset.avatar;
        this.selectedAvatar = avatar;
        
        avatarBtns.forEach(b => b.classList.remove('selected'));
        selectedBtn.classList.add('selected');
      });
    });

    // Close profile button
    this._bindClick('btn-close-profile', () => {
      this.hideModal('modal-profile');
    });

    // Save profile form submit
    const formEditProfile = document.getElementById('form-edit-profile');
    if (formEditProfile) {
      formEditProfile.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    // Close modal on overlay click
    const modalProfile = document.getElementById('modal-profile');
    if (modalProfile) {
      modalProfile.addEventListener('click', (e) => {
        if (e.target === modalProfile) {
          this.hideModal('modal-profile');
        }
      });
    }

    // Toggle Guru/Siswa Login Form
    const linkTeacher = document.getElementById('link-to-teacher-login');
    const studentLoginForm = document.getElementById('form-login');
    const formTeacher = document.getElementById('form-teacher-login');
    const loginCard = document.querySelector('#screen-login .auth-card');
    const loginHeading = loginCard ? loginCard.querySelector('h2') : null;
    
    if (linkTeacher && studentLoginForm && formTeacher) {
      linkTeacher.addEventListener('click', () => {
        const studentRegInfo = document.getElementById('student-reg-info');
        const teacherRegInfo = document.getElementById('teacher-reg-info');
        const linkForgotPassword = document.getElementById('link-forgot-password');
        
        if (formTeacher.style.display === 'none') {
          formTeacher.style.display = 'block';
          studentLoginForm.style.display = 'none';
          linkTeacher.textContent = 'Masuk sebagai Siswa 🧑‍🔧';
          if (loginHeading) loginHeading.textContent = 'Area Guru 🧑‍🏫';
          
          if (studentRegInfo) studentRegInfo.style.display = 'none';
          if (teacherRegInfo) teacherRegInfo.style.display = 'block';
          if (linkForgotPassword) linkForgotPassword.style.display = 'none';
        } else {
          formTeacher.style.display = 'none';
          studentLoginForm.style.display = 'block';
          linkTeacher.textContent = 'Masuk sebagai Guru 🧑‍🏫';
          if (loginHeading) loginHeading.textContent = 'Masuk Mekanik';
          
          if (studentRegInfo) studentRegInfo.style.display = 'inline';
          if (teacherRegInfo) teacherRegInfo.style.display = 'none';
          if (linkForgotPassword) linkForgotPassword.style.display = 'inline-block';
        }
      });
    }

    // Form Login Guru Submit
    if (formTeacher) {
      formTeacher.addEventListener('submit', async (e) => {
        e.preventDefault();
        const secret = document.getElementById('teacher-password').value;
        if (!secret) {
          this.showToast('⚠️ Masukkan password guru.', 'warning');
          return;
        }
        this.showToast('🔑 Memverifikasi password...', 'info');
        try {
          const url = `${AuthManager.API_URL}?action=getstudents&secret=${encodeURIComponent(secret)}`;
          const response = await fetch(url);
          if (!response.ok) throw new Error('Network response not ok');
          const res = await response.json();
          
          if (res.success) {
            this.showToast('🔓 Verifikasi sukses! Selamat datang, Guru.', 'success');
            // Simpan secret agar bisa refresh
            this.teacherSecret = secret;
            sessionStorage.setItem('automaster_teacher_secret', secret);
            
            // Masuk ke Dasbor Guru
            this.showScreen('teacher');
            this.renderTeacherDashboard(res.data);
          } else {
            this.showToast(`❌ ${res.message}`, 'error');
          }
        } catch (err) {
          console.error(err);
          this.showToast('❌ Gagal menghubungi server database. Pastikan URL Web App Google Apps Script Anda benar, sudah dideploy sebagai "Anyone", dan telah menyetujui izin akses (Authorize).', 'error', 7000);
        }
      });
    }

    // Back from teacher screen & Logout buttons
    this._bindClick('btn-back-from-teacher', () => {
      this.handleTeacherLogout();
    });
    this._bindClick('btn-teacher-logout', () => {
      this.handleTeacherLogout();
    });
    this._bindClick('btn-refresh-teacher-data', () => {
      this.refreshTeacherData();
    });
    this._bindClick('btn-save-db-url', () => {
      const newUrl = document.getElementById('teacher-db-url').value.trim();
      if (newUrl) {
        localStorage.setItem('automaster_api_url', newUrl);
        AuthManager.setApiUrl(newUrl);
        this.showToast('✅ API URL database berhasil disimpan!', 'success');
        this.refreshTeacherData();
      } else {
        this.showToast('⚠️ API URL tidak boleh kosong.', 'warning');
      }
    });

    // Copy Apps Script code click handler
    this._bindClick('btn-copy-script-code', () => {
      const textarea = document.getElementById('textarea-script-code');
      if (textarea && textarea.value) {
        if (textarea.value.startsWith('// Gagal')) {
          this.showToast('⚠️ Tidak ada kode yang valid untuk disalin.', 'warning');
          return;
        }
        navigator.clipboard.writeText(textarea.value)
          .then(() => {
            this.showToast('📋 Kode Apps Script berhasil disalin!', 'success');
          })
          .catch(err => {
            console.error('Gagal menyalin kode via clipboard API:', err);
            // Fallback selection copy
            try {
              textarea.select();
              document.execCommand('copy');
              window.getSelection().removeAllRanges(); // clear selection
              this.showToast('📋 Kode Apps Script berhasil disalin (fallback)!', 'success');
            } catch (fallbackErr) {
              this.showToast('❌ Gagal menyalin kode. Silakan salin secara manual.', 'error');
            }
          });
      } else {
        this.showToast('⚠️ Kode belum siap disalin.', 'warning');
      }
    });

    // Class filter & Student search changes
    const classFilter = document.getElementById('teacher-class-filter');
    if (classFilter) {
      classFilter.addEventListener('change', () => {
        this.filterTeacherData();
      });
    }

    const studentSearch = document.getElementById('teacher-student-search');
    if (studentSearch) {
      studentSearch.addEventListener('input', () => {
        this.filterTeacherData();
      });
    }

    // Global click sound player
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .btn, .level-card, .menu-item, a');
      if (btn && typeof AudioManager !== 'undefined') {
        AudioManager.playSFX('click');
      }
    });

    // Global bottom navigation bar bindings
    const bottomNav = document.getElementById('global-bottom-nav');
    if (bottomNav) {
      bottomNav.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
          const targetScreen = item.getAttribute('data-screen');
          if (targetScreen) {
            this.showScreen(targetScreen);
          }
        });
      });
    }
  },

  /**
   * Helper: Bind click event dengan null-check.
   * @param {string} elementId — ID elemen
   * @param {Function} handler — Fungsi handler
   */
  _bindClick(elementId, handler) {
    const el = document.getElementById(elementId);
    if (el) {
      el.addEventListener('click', handler);
    }
  },

  // ════════════════════════════════════════════════════════════
  //  MANAJEMEN LAYAR (SCREEN)
  // ════════════════════════════════════════════════════════════

  /**
   * Menampilkan layar tertentu dan menyembunyikan layar lain.
   * @param {string} screenId — ID layar tanpa prefix "screen-"
   */
  showScreen(screenId) {
    // Sembunyikan semua layar
    document.querySelectorAll('[id^="screen-"]').forEach(s => {
      s.classList.remove('active');
    });

    // Tampilkan layar target
    const screen = document.getElementById(`screen-${screenId}`);
    if (screen) {
      screen.classList.add('active');
      this.currentScreen = screenId;

      // Scroll ke atas saat berpindah layar
      screen.scrollTop = 0;
    }

    // Reset login form to student mode when showing login screen
    if (screenId === 'login') {
      const studentLoginForm = document.getElementById('form-login');
      const formTeacher = document.getElementById('form-teacher-login');
      const linkTeacher = document.getElementById('link-to-teacher-login');
      const loginCard = document.querySelector('#screen-login .auth-card');
      const loginHeading = loginCard ? loginCard.querySelector('h2') : null;
      const studentRegInfo = document.getElementById('student-reg-info');
      const teacherRegInfo = document.getElementById('teacher-reg-info');
      const linkForgotPassword = document.getElementById('link-forgot-password');

      if (studentLoginForm) studentLoginForm.style.display = 'block';
      if (formTeacher) formTeacher.style.display = 'none';
      if (linkTeacher) linkTeacher.textContent = 'Masuk sebagai Guru 🧑‍🏫';
      if (loginHeading) loginHeading.textContent = 'Masuk Mekanik';
      if (studentRegInfo) studentRegInfo.style.display = 'inline';
      if (teacherRegInfo) teacherRegInfo.style.display = 'none';
      if (linkForgotPassword) linkForgotPassword.style.display = 'inline-block';
    }
  },

  /**
   * Menampilkan modal.
   * @param {string} modalId — ID modal
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  },

  /**
   * Menyembunyikan modal.
   * @param {string} modalId — ID modal
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  },

  // ════════════════════════════════════════════════════════════
  //  INFO PEMAIN
  // ════════════════════════════════════════════════════════════

  /**
   * Memperbarui tampilan info pemain di header menu.
   */
  updatePlayerInfo() {
    const data = ProgressManager.getPlayerData();
    const rank = ProgressManager.getRank();
    const nextRankXP = ProgressManager.getNextRankXP();
    const stats = ProgressManager.getStats();

    const playerInfoEl = document.getElementById('player-info');
    if (!playerInfoEl) return;

    // Hitung progress bar XP
    let xpProgress = 100; // default untuk rank tertinggi
    let xpDisplay = '';

    if (nextRankXP !== null) {
      // Cari XP minimum rank saat ini
      const currentRankMinXP = rank.minXP || 0;
      const xpInRank = data.totalXP - currentRankMinXP;
      const xpNeeded = nextRankXP - currentRankMinXP;
      xpProgress = xpNeeded > 0 ? Math.min(100, Math.round((xpInRank / xpNeeded) * 100)) : 100;
      xpDisplay = `${data.totalXP} / ${nextRankXP} XP`;
    } else {
      xpDisplay = `${data.totalXP} XP (MAX)`;
    }

    // List slogan motivasi otomotif
    const slogans = [
      "Mekanik Juara: Teliti, Disiplin, dan Utamakan K3! 🥽",
      "Kerja Keras & Presisi: Kunci Sukses Diagnosa Kerusakan! 🛠️",
      "Ayo, jadilah yang pertama merajai Papan Skor kelas! 🏆",
      "Budaya 5R (Ringkas, Rapi, Resik, Rawat, Rajin) cermin mekanik hebat! 🏁",
      "Setiap kegagalan di kuis adalah langkah menuju pemahaman ahli! ⚡",
      "Keadaan darurat? Tenang, ingat langkah evakuasi & penggunaan APAR! 🚨",
      "Siklus 4-tak: Hisap, Kompresi, Usaha, Buang. Hidupkan semangatmu! 🔥",
      "Rem yang pakem dimulai dari bleeding minyak rem yang sempurna! 🔴",
      "Kelistrikan bodi stabil, performa berkendara semakin mantap! ⚡"
    ];
    const sloganIndex = (data.totalXP + (data.playerName || '').length) % slogans.length;
    const currentSlogan = slogans[sloganIndex];

    playerInfoEl.innerHTML = `
      <div class="player-avatar-wrapper" style="grid-area: avatar; position: relative;">
        <div class="avatar-ring"></div>
        <div class="player-avatar" id="header-avatar" style="cursor: pointer; position: relative; z-index: 2;" title="Ubah Profil">${data.avatar || '🧑‍🔧'}</div>
      </div>
      <div class="player-details" style="grid-area: details;">
        <div class="player-name-row" style="display: flex; align-items: baseline; gap: 8px;">
          <div class="player-name">${data.playerName || 'Pemain'}</div>
          <div class="player-school" style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">(${data.sekolah || 'SMK Amal Bakti Jatimulyo'})</div>
        </div>
        <div class="player-rank-row" style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--clr-secondary); font-weight: 500; margin-top: 2px;">
          <span>${rank.icon || '🔧'}</span>
          <span class="player-rank">${rank.name || 'Pemula'}</span>
        </div>
        <div class="xp-bar-container" style="margin-top: 4px;">
          <div class="xp-bar">
            <div class="xp-bar-fill" id="xp-bar-fill" style="width: ${xpProgress}%;"></div>
          </div>
        </div>
        <div class="xp-text">${xpDisplay}</div>
      </div>
      <div class="player-stars" style="grid-area: stars; margin-right: 15px;">⭐ ${stats.totalStars}</div>
      <div class="player-actions" style="grid-area: actions;">
        <button id="btn-header-profile" class="btn-action" type="button" title="Edit Profil">👤 Profil</button>
        <button id="btn-header-logout" class="btn-action btn-action-danger" type="button" title="Keluar">🚪 Keluar</button>
      </div>
      <div class="player-motivate-slogan" style="grid-area: slogan;">
        <span class="slogan-icon">💡</span>
        <span class="slogan-text">${currentSlogan}</span>
      </div>
    `;

    // Update the dynamic class ranking banner
    this.updateRankingBanner();
  },

  /**
   * Memperbarui banner peringkat kelas di menu utama.
   */
  async updateRankingBanner() {
    const bannerEl = document.getElementById('ranking-banner');
    if (!bannerEl) return;

    // Default state if user is not logged in
    if (typeof AuthManager === 'undefined' || !AuthManager.isLoggedIn()) {
      bannerEl.style.display = 'none';
      return;
    }

    const session = AuthManager.getSession();
    const currentNis = session ? session.nis : null;

    if (!currentNis) {
      bannerEl.style.display = 'none';
      return;
    }

    // Helper SVG icons for the slides
    const getBannerIconSvg = (type) => {
      switch (type) {
        case 'sayembara':
          return `
            <svg width="60" height="60" viewBox="0 0 48 48" class="svg-banner-icon color-gold">
              <path d="M 12 12 L 36 12 L 34 26 C 34 32 29 36 24 36 C 19 36 14 32 14 26 Z" fill="none" stroke="currentColor" stroke-width="2.5" class="pulse-glow" />
              <path d="M 20 36 L 20 42 M 28 36 L 28 42 M 16 42 L 32 42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
              <g class="spin-cw" style="transform-origin: 24px 22px;">
                <circle cx="24" cy="22" r="5" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3, 2" />
              </g>
            </svg>
          `;
        case 'medsos':
          return `
            <svg width="60" height="60" viewBox="0 0 48 48" class="svg-banner-icon color-ig">
              <rect x="8" y="8" width="32" height="32" rx="10" fill="none" stroke="currentColor" stroke-width="3" />
              <circle cx="24" cy="24" r="7" fill="none" stroke="currentColor" stroke-width="3" class="spin-cw" />
              <circle cx="33" cy="15" r="2.5" fill="currentColor" />
            </svg>
          `;
        case 'k3':
          return `
            <svg width="60" height="60" viewBox="0 0 48 48" class="svg-banner-icon color-teal">
              <path d="M 14 20 H 34 C 36 20 36 30 34 30 H 14 C 12 30 12 20 14 20 Z" fill="none" stroke="currentColor" stroke-width="2.5" />
              <path d="M 22 24 Q 24 22 26 24" fill="none" stroke="currentColor" stroke-width="2.5" />
              <circle cx="18" cy="25" r="3" fill="currentColor" opacity="0.6" class="pulse-glow" />
              <circle cx="30" cy="25" r="3" fill="currentColor" opacity="0.6" class="pulse-glow" />
              <path d="M 16 18 C 16 12 32 12 32 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
            </svg>
          `;
        case 'peringkat':
          return `
            <svg width="60" height="60" viewBox="0 0 48 48" class="svg-banner-icon color-blue">
              <circle cx="24" cy="30" r="12" fill="none" stroke="currentColor" stroke-width="2.5" />
              <path d="M 24 18 L 18 6 L 30 6 Z" fill="none" stroke="currentColor" stroke-width="2.5" />
              <path d="M 20 6 L 24 18 L 28 6" fill="none" stroke="currentColor" stroke-width="1.5" />
              <polygon points="24,24 26,27 30,27 27,29 28,33 24,31 20,33 21,29 18,27 22,27" fill="currentColor" class="pulse-glow" />
            </svg>
          `;
        default:
          return '🏁';
      }
    };

    // Base slides of Direktorat SMK program & guidelines
    const slides = [
      {
        icon: getBannerIconSvg('sayembara'),
        title: "Sayembara Direktorat SMK",
        desc: "Dukungan penuh dari <b>Direktorat SMK Kemendikbudristek</b> dalam melahirkan lulusan vokasi otomotif TKR yang hebat!",
        btnText: "Buka Portal 🌐",
        btnAction: () => window.open('https://smk.kemdikbud.go.id/', '_blank')
      },
      {
        icon: getBannerIconSvg('medsos'),
        title: "Instagram @direktoratsmk",
        desc: "Kunjungi akun resmi Instagram <b>@direktoratsmk</b> untuk update lomba, prestasi, beasiswa, dan pameran SMK vokasi!",
        btnText: "Buka Instagram 📸",
        btnAction: () => window.open('https://www.instagram.com/direktoratsmk/', '_blank')
      },
      {
        icon: getBannerIconSvg('k3'),
        title: "Penerapan K3 & Budaya 5R",
        desc: "Latih kesiapan kerja Anda! Terapkan Ringkas, Rapi, Resik, Rawat, Rajin (5R) serta alat pelindung diri lengkap di bengkel.",
        btnText: "Mulai Belajar 🏁",
        btnAction: () => this.showScreen('map')
      }
    ];

    // Fetch leaderboard to append Rank slide if online & synced
    let playerRankData = null;
    if (navigator.onLine && typeof SyncManager !== 'undefined' && SyncManager._getApiUrl()) {
      try {
        const res = await SyncManager.getLeaderboard('all');
        if (res.success && res.data && Array.isArray(res.data.entries)) {
          const entries = res.data.entries;
          const totalStudents = entries.length;
          const playerIndex = entries.findIndex(player => String(player.nis) === String(currentNis));
          if (playerIndex !== -1) {
            const rank = playerIndex + 1;
            let emoji = '🏅';
            let motivationText = '';
            if (rank === 1) {
              emoji = '🏆';
              motivationText = 'Luar biasa! Anda adalah Juara 1 di kelas! Pertahankan prestasimu! 🥇';
            } else if (rank === 2) {
              emoji = '🥈';
              motivationText = 'Keren sekali! Anda menempati peringkat 2 kelas! Kejar peringkat 1! 🚀';
            } else if (rank === 3) {
              emoji = '🥉';
              motivationText = 'Hebat! Anda berada di peringkat 3 kelas! Tingkatkan kemampuanmu! 🛠️';
            } else if (rank <= 10) {
              motivationText = `Mantap! Anda masuk Top 10 besar kelas (Peringkat ${rank} dari ${totalStudents} siswa). 🌟`;
            } else {
              motivationText = `Peringkat ${rank} dari ${totalStudents} siswa. Terus kumpulkan XP untuk naik peringkat! 💪`;
            }
            playerRankData = {
              icon: getBannerIconSvg('peringkat'),
              title: `Live Rank: Ke-${rank} dari ${totalStudents} Siswa`,
              desc: motivationText,
              btnText: "Papan Skor 🏆",
              btnAction: () => this.showScreen('scores')
            };
          }
        }
      } catch (err) {
        console.warn('[App] Could not fetch live rank for banner slider:', err);
      }
    }

    if (playerRankData) {
      slides.push(playerRankData);
    }

    // Render slider layout inside bannerEl
    bannerEl.style.display = 'block';
    bannerEl.className = 'ranking-banner-container banner-slider-active';
    bannerEl.innerHTML = `
      <div class="banner-slide-wrapper">
        <div class="ranking-banner-content banner-fade-slide" id="ranking-banner-slide-area">
          <div class="ranking-banner-icon">${slides[0].icon}</div>
          <div class="ranking-banner-info">
            <div class="ranking-banner-title">${slides[0].title}</div>
            <div class="ranking-banner-desc">${slides[0].desc}</div>
          </div>
        </div>
        <div class="ranking-banner-action" id="ranking-banner-action-area">
          <button type="button" class="ranking-banner-btn">${slides[0].btnText}</button>
        </div>
      </div>
      <div class="banner-slider-dots" id="banner-slider-dots-area">
        ${slides.map((_, i) => `<span class="banner-slider-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
      </div>
    `;

    // Bind action to initial slide button
    const initBtn = bannerEl.querySelector('.ranking-banner-btn');
    if (initBtn) {
      initBtn.addEventListener('click', slides[0].btnAction);
    }

    // Set up slider logic variables
    let activeIdx = 0;
    const slideArea = document.getElementById('ranking-banner-slide-area');
    const actionArea = document.getElementById('ranking-banner-action-area');
    const dotsArea = document.getElementById('banner-slider-dots-area');

    const changeSlide = (idx) => {
      activeIdx = idx;
      if (!slideArea || !actionArea) return;
      
      // Transition out
      slideArea.classList.add('fade-slide-out');
      actionArea.classList.add('fade-slide-out');

      setTimeout(() => {
        const slide = slides[activeIdx];
        slideArea.innerHTML = `
          <div class="ranking-banner-icon">${slide.icon}</div>
          <div class="ranking-banner-info">
            <div class="ranking-banner-title">${slide.title}</div>
            <div class="ranking-banner-desc">${slide.desc}</div>
          </div>
        `;
        actionArea.innerHTML = `<button type="button" class="ranking-banner-btn">${slide.btnText}</button>`;
        
        const btn = actionArea.querySelector('.ranking-banner-btn');
        if (btn) {
          btn.addEventListener('click', slide.btnAction);
        }

        // Update active dot
        if (dotsArea) {
          dotsArea.querySelectorAll('.banner-slider-dot').forEach((dot, dotIdx) => {
            if (dotIdx === activeIdx) dot.classList.add('active');
            else dot.classList.remove('active');
          });
        }

        // Transition back in
        slideArea.classList.remove('fade-slide-out');
        actionArea.classList.remove('fade-slide-out');
      }, 300);
    };

    // Bind dots click listener
    if (dotsArea) {
      dotsArea.addEventListener('click', (e) => {
        const dot = e.target.closest('.banner-slider-dot');
        if (dot) {
          const targetIdx = parseInt(dot.dataset.index);
          if (!isNaN(targetIdx) && targetIdx !== activeIdx) {
            changeSlide(targetIdx);
          }
        }
      });
    }

    // Start auto slide rotation
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
    }
    this.bannerInterval = setInterval(() => {
      const nextIdx = (activeIdx + 1) % slides.length;
      changeSlide(nextIdx);
    }, 5500); // changes every 5.5 seconds
  },

  // ════════════════════════════════════════════════════════════
  //  PETA LEVEL (MAP)
  // ════════════════════════════════════════════════════════════

  /**
   * Menghasilkan SVG custom interaktif untuk masing-masing level otomotif.
   */
  getLevelIconSVG(levelId) {
    switch (levelId) {
      case 1: // Sistem Rem
        return `
          <svg width="48" height="48" viewBox="0 0 48 48" class="svg-level svg-level-1">
            <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="6,4" class="spin-cw" />
            <circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M 6 24 C 6 14 14 6 24 6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" class="pulse-glow" />
            <circle cx="24" cy="24" r="4" fill="currentColor" />
          </svg>
        `;
      case 2: // Mesin Kendaraan
        return `
          <svg width="48" height="48" viewBox="0 0 48 48" class="svg-level svg-level-2">
            <g class="spin-cw" style="transform-origin: 24px 24px;">
              <circle cx="24" cy="24" r="14" fill="none" stroke="currentColor" stroke-width="3.5" />
              <path d="M 24 6 L 24 10 M 24 38 L 24 42 M 6 24 L 10 24 M 38 24 L 42 24 M 11.3 11.3 L 14.1 14.1 M 33.9 33.9 L 36.7 36.7 M 11.3 33.9 L 14.1 31.1 M 33.9 11.3 L 36.7 14.1" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
            </g>
            <circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="2" />
            <circle cx="24" cy="24" r="2" fill="currentColor" />
          </svg>
        `;
      case 3: // Sistem Kelistrikan
        return `
          <svg width="48" height="48" viewBox="0 0 48 48" class="svg-level svg-level-3">
            <path d="M 26 6 L 12 26 L 24 26 L 22 42 L 36 22 L 24 22 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" class="pulse-glow" />
            <path d="M 26 6 L 12 26 L 24 26 L 22 42 L 36 22 L 24 22 Z" fill="currentColor" opacity="0.3" />
          </svg>
        `;
      case 4: // Pemindah Tenaga
        return `
          <svg width="48" height="48" viewBox="0 0 48 48" class="svg-level svg-level-4">
            <g class="spin-ccw" style="transform-origin: 24px 24px;">
              <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="10, 5" />
            </g>
            <g class="spin-cw" style="transform-origin: 24px 24px;">
              <circle cx="24" cy="24" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6, 4" />
            </g>
            <path d="M 14 24 L 34 24 M 24 14 L 24 34" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          </svg>
        `;
      case 5: // Bahan Bakar & Pendingin
        return `
          <svg width="48" height="48" viewBox="0 0 48 48" class="svg-level svg-level-5">
            <path d="M 12 10 L 28 10 A 4 4 0 0 1 32 14 L 32 38 A 2 2 0 0 1 30 40 L 10 40 A 2 2 0 0 1 8 38 L 8 14 A 4 4 0 0 1 12 10 Z" fill="none" stroke="currentColor" stroke-width="2.5" />
            <circle cx="20" cy="18" r="4" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M 32 20 Q 38 22 38 28 L 38 34" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
            <rect x="35" y="34" width="6" height="4" fill="currentColor" />
            <g class="spin-cw" style="transform-origin: 20px 29px;">
              <circle cx="20" cy="29" r="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4, 2" />
            </g>
          </svg>
        `;
      case 6: // Ujian Akhir
        return `
          <svg width="48" height="48" viewBox="0 0 48 48" class="svg-level svg-level-6">
            <path d="M 12 12 L 36 12 L 34 26 C 34 32 29 36 24 36 C 19 36 14 32 14 26 Z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" />
            <path d="M 12 16 C 8 16 8 22 12 22 M 36 16 C 40 16 40 22 36 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            <path d="M 20 36 L 20 42 M 28 36 L 28 42 M 16 42 L 32 42" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
            <polygon points="24,16 26,20 31,21 27,24 28,29 24,27 20,29 21,24 17,21 22,20" fill="currentColor" class="pulse-glow" />
          </svg>
        `;
      default:
        return `
          <svg width="48" height="48" viewBox="0 0 48 48" class="svg-level">
            <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M 18 18 L 30 30 M 30 18 L 18 30" stroke="currentColor" stroke-width="2" />
          </svg>
        `;
    }
  },

  /**
   * Merender peta level dengan semua kartu level.
   */
  renderMap() {
    const container = document.querySelector('#screen-map .level-grid') ||
                      document.querySelector('#screen-map .map-container');

    if (!container) return;
    container.innerHTML = '';

    // Ambil data level dari GAME_DATA
    const levels = (typeof GAME_DATA !== 'undefined' && GAME_DATA.levels) ? GAME_DATA.levels : [];
    const playerData = ProgressManager.getPlayerData();

    levels.forEach((level, index) => {
      const levelId = index + 1;
      const progress = playerData.levels[levelId] || {};
      const isUnlocked = ProgressManager.isLevelUnlocked(levelId);

      // Special check untuk Level 6
      const isLevel6Special = levelId === 6;
      const level6Unlockable = isLevel6Special && ProgressManager.isLevel6Unlockable();

      // Jika Level 6, cek apakah bisa dibuka
      const finalUnlocked = isLevel6Special ? (isUnlocked || level6Unlockable) : isUnlocked;

      // Hitung persentase penyelesaian level
      let phasesDone = 0;
      if (progress.learnCompleted) phasesDone++;
      if (progress.simCompleted) phasesDone++;
      if (progress.quizCompleted) phasesDone++;
      const completionPercent = Math.round((phasesDone / 3) * 100);

      // Buat kartu level
      const card = document.createElement('div');
      card.className = `level-card lib-level-${levelId} ${finalUnlocked ? '' : 'locked'} ${progress.quizCompleted ? 'completed' : ''}`;
      card.dataset.level = levelId;

      // Render bintang
      const starsHTML = this._renderStars(progress.stars || 0);

      // Auto-unlock Level 6 jika memenuhi syarat
      if (isLevel6Special && level6Unlockable && !isUnlocked) {
        ProgressManager._data.levels[6].unlocked = true;
        ProgressManager.save();
      }

      // Tentukan badge status level
      let statusBadgeHTML = '';
      if (!finalUnlocked) {
        statusBadgeHTML = '<span class="badge-status-level badge-locked">🔒 Terkunci</span>';
      } else if (progress.quizCompleted) {
        statusBadgeHTML = '<span class="badge-status-level badge-completed">🏆 Tuntas</span>';
      } else {
        statusBadgeHTML = '<span class="badge-status-level badge-active">🛠️ Aktif</span>';
      }

      card.innerHTML = `
        <div class="level-card-badge">LEVEL 0${levelId}</div>
        <div class="level-card-graphic">${this._getLibraryIconSvg(levelId)}</div>
        <h3 class="level-card-title">${level.title || 'Level ' + levelId}</h3>
        <p class="level-card-desc">${level.description || ''}</p>
        <div class="level-card-footer">
          ${finalUnlocked ? `
            <div class="level-card-stars">${starsHTML}</div>
            ${statusBadgeHTML}
          ` : `
            <span class="level-card-progress-text" style="color: var(--text-muted); font-size: 0.75rem; font-style: italic;">
              ${isLevel6Special ? '🔒 Selesaikan Level 1–5' : '🔒 Selesaikan level sebelumnya'}
            </span>
            ${statusBadgeHTML}
          `}
        </div>
        <div class="level-card-progress-bar">
          <div class="level-card-progress-fill" style="width: ${finalUnlocked ? completionPercent : 0}%"></div>
        </div>
      `;

      container.appendChild(card);
    });
  },

  // ════════════════════════════════════════════════════════════
  //  DETAIL LEVEL (LEVEL HUB)
  // ════════════════════════════════════════════════════════════

  /**
   * Membuka halaman hub untuk level tertentu.
   * @param {number} levelId — ID level (1–6)
   */
  openLevel(levelId) {
    this.currentLevel = levelId;

    const levels = (typeof GAME_DATA !== 'undefined' && GAME_DATA.levels) ? GAME_DATA.levels : [];
    const level = levels[levelId - 1];
    if (!level) {
      this.showToast('⚠️ Data level tidak ditemukan.', 'warning');
      return;
    }

    const progress = ProgressManager.getPlayerData().levels[levelId] || {};

    // ── Update judul dan deskripsi level ──
    const titleEl = document.querySelector('#screen-level .level-detail-title') ||
                    document.querySelector('#screen-level h2');
    if (titleEl) {
      titleEl.textContent = `${level.icon || '📘'} Level ${levelId}: ${level.title || ''}`;
    }

    const descEl = document.querySelector('#screen-level .level-detail-desc') ||
                   document.querySelector('#screen-level .level-description');
    if (descEl) {
      descEl.textContent = level.description || '';
    }

    // ── Update tujuan pembelajaran jika ada ──
    const objectivesEl = document.querySelector('#screen-level .level-objectives');
    if (objectivesEl && level.objectives) {
      const objList = Array.isArray(level.objectives) ? level.objectives : [level.objectives];
      objectivesEl.innerHTML = '<h4>🎯 Tujuan Pembelajaran:</h4><ul>' +
        objList.map(o => `<li>${o}</li>`).join('') + '</ul>';
    }

    // ── Update status tombol fase ──
    this._updatePhaseButton('btn-phase-learn', true, progress.learnCompleted);
    this._updatePhaseButton('btn-phase-animation', true, progress.learnCompleted);
    this._updatePhaseButton('btn-phase-simulate', progress.learnCompleted, progress.simCompleted);
    this._updatePhaseButton('btn-phase-quiz', progress.simCompleted, progress.quizCompleted);

    // ── Tampilkan bintang ──
    const starsContainer = document.querySelector('#screen-level .level-detail-stars');
    if (starsContainer) {
      starsContainer.innerHTML = this._renderStars(progress.stars || 0);
    }

    // ── Tampilkan skor terbaik ──
    const bestScoreEl = document.querySelector('#screen-level .level-best-score');
    if (bestScoreEl) {
      bestScoreEl.textContent = progress.bestScore > 0 ? `Skor terbaik: ${progress.bestScore}%` : '';
    }

    this.showScreen('level');
  },

  /**
   * Memperbarui tampilan tombol fase (terkunci/terbuka/selesai).
   * @param {string} buttonId — ID tombol
   * @param {boolean} isAvailable — Apakah fase bisa diakses
   * @param {boolean} isCompleted — Apakah fase sudah diselesaikan
   */
  _updatePhaseButton(buttonId, isAvailable, isCompleted) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    // Bersihkan kelas status lama dari tombol utama
    btn.classList.remove('locked', 'phase-locked', 'phase-available', 'phase-completed');
    btn.disabled = !isAvailable;

    // Dapatkan elemen status text pill
    const statusEl = btn.querySelector('.phase-status');

    if (isCompleted) {
      btn.classList.add('phase-completed');
      if (statusEl) {
        statusEl.className = 'phase-status completed';
        statusEl.textContent = 'Selesai';
      }
      
      // Tambahkan centang jika belum ada
      if (!btn.querySelector('.phase-check')) {
        const check = document.createElement('span');
        check.className = 'phase-check';
        check.textContent = ' ✅';
        btn.appendChild(check);
      }
    } else if (isAvailable) {
      btn.classList.add('phase-available');
      if (statusEl) {
        statusEl.className = 'phase-status available';
        statusEl.textContent = 'Tersedia';
      }
      
      // Hapus centang jika ada
      const check = btn.querySelector('.phase-check');
      if (check) check.remove();
    } else {
      btn.classList.add('phase-locked', 'locked');
      if (statusEl) {
        statusEl.className = 'phase-status locked';
        statusEl.textContent = 'Terkunci';
      }
      
      // Hapus centang jika ada
      const check = btn.querySelector('.phase-check');
      if (check) check.remove();
    }
  },

  // ════════════════════════════════════════════════════════════
  //  FASE BELAJAR (LEARN)
  // ════════════════════════════════════════════════════════════

  /**
   * Memulai fase belajar untuk level tertentu.
   * @param {number} levelId — ID level
   */
  startLearn(levelId) {
    this.learningSource = 'map';
    this.currentLevel = levelId;
    this.currentSlide = 0;
    this.showScreen('learn');
    this.renderLearnSlide();
  },

  /**
   * Memulai galeri animasi untuk level tertentu.
   * @param {number} levelId — ID level
   */
  startAnimations(levelId) {
    this.currentLevel = levelId;
    this.showScreen('animations');
    this.renderAnimationsGrid();
  },

  /**
   * Merender grid daftar animasi SWF untuk level saat ini.
   */
  renderAnimationsGrid() {
    const gridEl = document.getElementById('animations-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';

    const animations = (typeof SwfPlayer !== 'undefined') ? SwfPlayer.getAnimationsForLevel(this.currentLevel) : [];

    if (animations.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
          <span class="empty-icon" style="font-size: 3rem; display: block; margin-bottom: 10px;">🎬</span>
          <p>Belum ada animasi pendukung untuk level ini.</p>
        </div>
      `;
      return;
    }

    animations.forEach(anim => {
      const card = document.createElement('div');
      card.className = 'animation-card';
      
      const slideNum = anim.slide + 1;
      
      card.innerHTML = `
        <div class="anim-card-icon">🎬</div>
        <div class="anim-card-info">
          <h4 class="anim-card-title">${anim.title}</h4>
          <p class="anim-card-desc">${anim.desc || 'Animasi flash interaktif untuk materi ini.'}</p>
          <span class="anim-card-meta">Materi Slide ${slideNum}</span>
        </div>
        <button class="btn btn-primary btn-sm anim-card-play-btn" type="button">
          Putar ➔
        </button>
      `;

      card.querySelector('.anim-card-play-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof SwfPlayer !== 'undefined') {
          SwfPlayer.play(anim.path, anim.title);
        }
      });

      card.addEventListener('click', () => {
        if (typeof SwfPlayer !== 'undefined') {
          SwfPlayer.play(anim.path, anim.title);
        }
      });

      gridEl.appendChild(card);
    });
  },

  /**
   * Merender slide materi belajar saat ini.
   */
  renderLearnSlide() {
    const levels = (typeof GAME_DATA !== 'undefined' && GAME_DATA.levels) ? GAME_DATA.levels : [];
    const level = levels[this.currentLevel - 1];
    if (!level || !level.learning || level.learning.length === 0) {
      this.showToast('⚠️ Materi belajar belum tersedia.', 'warning');
      return;
    }

    const slide = level.learning[this.currentSlide];
    if (!slide) return;

    const totalSlides = level.learning.length;

    // ── Konten utama slide ──
    const contentEl = document.getElementById('learn-content');
    if (contentEl) {
      let contentHTML = '';

      // Judul slide
      if (slide.title) {
        contentHTML += `<h3 class="learn-slide-title">${slide.title}</h3>`;
      }

      // Konten/penjelasan
      if (slide.content) {
        contentHTML += `<div class="learn-slide-content">${slide.content}</div>`;
      }

      // Poin-poin penting
      if (slide.keyPoints && Array.isArray(slide.keyPoints)) {
        contentHTML += '<div class="learn-key-points"><h4>📌 Poin Penting:</h4><ul>';
        slide.keyPoints.forEach(point => {
          contentHTML += `<li>${point}</li>`;
        });
        contentHTML += '</ul></div>';
      }

      // Gambar ilustrasi
      if (slide.image) {
        contentHTML += `<div class="learn-image-container">
          <img src="${slide.image}" alt="${slide.title || 'Ilustrasi'}" class="learn-image" />
        </div>`;
      }

      // Progress indicator
      contentHTML += `<div class="learn-progress">
        <span class="learn-progress-text">Halaman ${this.currentSlide + 1} dari ${totalSlides}</span>
        <div class="learn-dots">`;
      for (let i = 0; i < totalSlides; i++) {
        contentHTML += `<span class="learn-dot ${i === this.currentSlide ? 'active' : ''} ${i < this.currentSlide ? 'done' : ''}"></span>`;
      }
      contentHTML += `</div></div>`;

      contentEl.innerHTML = contentHTML;
    }

    // ── Animasi slide (jika ada elemen terpisah) ──
    const animEl = document.getElementById('learn-animation');
    if (animEl) {
      const animations = (typeof SwfPlayer !== 'undefined') ? SwfPlayer.getAnimationsForSlide(this.currentLevel, this.currentSlide) : [];
      let animHTML = '';

      if (animations.length > 0) {
        animHTML += '<div class="slide-swf-container">';
        animHTML += '<h4>🎬 Animasi Flash Pendukung:</h4>';
        animHTML += '<div class="swf-buttons-grid">';
        animations.forEach(anim => {
          animHTML += `<button class="btn swf-play-btn" type="button" onclick="SwfPlayer.play('${anim.path}', '${anim.title}')">
            <span>🎬</span> ${anim.title}
          </button>`;
        });
        animHTML += '</div></div>';
      }

      if (slide.animation) {
        animHTML += `<div class="original-animation-content" style="margin-top: 15px;">${slide.animation}</div>`;
      }

      if (animHTML) {
        animEl.innerHTML = animHTML;
        animEl.style.display = 'block';
      } else {
        animEl.innerHTML = '';
        animEl.style.display = 'none';
      }
    }

    // ── Update tombol navigasi ──
    const btnPrev = document.getElementById('btn-learn-prev');
    const btnNext = document.getElementById('btn-learn-next');

    if (btnPrev) {
      btnPrev.disabled = this.currentSlide === 0;
      btnPrev.style.visibility = this.currentSlide === 0 ? 'hidden' : 'visible';
    }

    if (btnNext) {
      if (this.currentSlide >= totalSlides - 1) {
        if (this.learningSource === 'library') {
          btnNext.textContent = 'Kembali ke Perpustakaan 📚';
          btnNext.classList.remove('btn-finish-learn');
        } else {
          btnNext.textContent = 'Selesai ✅';
          btnNext.classList.add('btn-finish-learn');
        }
      } else {
        btnNext.textContent = 'Selanjutnya →';
        btnNext.classList.remove('btn-finish-learn');
      }
    }
  },

  /**
   * Navigasi ke slide sebelumnya.
   */
  prevLearnSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.renderLearnSlide();
    }
  },

  /**
   * Navigasi ke slide berikutnya, atau selesaikan belajar.
   */
  nextLearnSlide() {
    const levels = (typeof GAME_DATA !== 'undefined' && GAME_DATA.levels) ? GAME_DATA.levels : [];
    const level = levels[this.currentLevel - 1];
    if (!level || !level.learning) return;

    if (this.currentSlide < level.learning.length - 1) {
      this.currentSlide++;
      this.renderLearnSlide();
    } else {
      if (this.learningSource === 'library') {
        this.showScreen('library');
        this.renderLibrary();
      } else {
        // Selesaikan fase belajar
        const result = ProgressManager.completeLearn(this.currentLevel);
        this.showToast('📖 Materi selesai! +50 XP', 'success');

        // Cek pencapaian baru
        const newAchievements = ProgressManager.checkAchievements();
        if (newAchievements.length > 0) {
          newAchievements.forEach((ach, idx) => {
            setTimeout(() => this.showAchievement(ach), (idx + 1) * 1500);
          });
        }

        this.updatePlayerInfo();
        this.openLevel(this.currentLevel);
      }
    }
  },

  // ════════════════════════════════════════════════════════════
  //  FASE SIMULASI
  // ════════════════════════════════════════════════════════════

  /**
   * Memulai fase simulasi.
   * @param {number} levelId — ID level
   */
  startSimulation(levelId) {
    this.lastPhase = 'simulation';
    if (typeof KioskManager !== 'undefined') {
      KioskManager.activate('simulation');
    }
    SimulationEngine.start(levelId);
  },

  // ════════════════════════════════════════════════════════════
  //  FASE KUIS
  // ════════════════════════════════════════════════════════════

  /**
   * Memulai fase kuis.
   * @param {number} levelId — ID level
   */
  startQuiz(levelId) {
    this.lastPhase = 'quiz';
    if (typeof KioskManager !== 'undefined') {
      KioskManager.activate('quiz');
    }
    QuizEngine.start(levelId);
  },

  // ════════════════════════════════════════════════════════════
  //  LAYAR HASIL
  // ════════════════════════════════════════════════════════════

  /**
   * Menampilkan layar hasil kuis atau simulasi.
   * @param {object} data — Data hasil:
   *   { phase, score, total, percentage, stars, xpEarned, levelId, answers }
   */
  showResults(data) {
    if (typeof KioskManager !== 'undefined') {
      KioskManager.deactivate();
    }
    this.lastPhase = data.phase;
    this.showScreen('results');

    // ── Skor ──
    const scoreEl = document.getElementById('result-score');
    if (scoreEl) {
      scoreEl.innerHTML = `
        <div class="result-percentage">${data.percentage}%</div>
        <div class="result-detail">${data.score} dari ${data.total} ${data.phase === 'quiz' ? 'soal benar' : 'komponen tepat'}</div>
      `;
    }

    // ── XP yang didapat ──
    const xpEl = document.getElementById('result-xp');
    if (xpEl) {
      xpEl.innerHTML = `<span class="xp-earned">+${data.xpEarned} XP</span>`;
      // Animasi counter XP
      this._animateXP(xpEl, data.xpEarned);
    }

    // ── Bintang dengan animasi ──
    const starsEl = document.getElementById('result-stars');
    if (starsEl) {
      starsEl.innerHTML = '';
      const stars = data.stars || 0;
      for (let i = 1; i <= 3; i++) {
        const star = document.createElement('span');
        star.className = `result-star ${i <= stars ? 'earned' : 'empty'}`;
        star.textContent = i <= stars ? '⭐' : '☆';
        star.style.animationDelay = `${i * 0.3}s`;
        starsEl.appendChild(star);
      }
    }

    // ── Pesan motivasi ──
    const messageEl = document.querySelector('#screen-results .result-message');
    if (messageEl) {
      const messages = {
        3: ['Luar Biasa! 🎉', 'Sempurna! Kamu memang calon mekanik handal!'],
        2: ['Bagus Sekali! 👏', 'Tinggal sedikit lagi untuk mendapat 3 bintang!'],
        1: ['Lumayan! 💪', 'Terus berlatih untuk hasil yang lebih baik!'],
        0: ['Jangan Menyerah! 📚', 'Pelajari materinya lagi dan coba kembali!']
      };
      const msg = messages[data.stars || 0];
      messageEl.innerHTML = `<h3>${msg[0]}</h3><p>${msg[1]}</p>`;
    }

    // ── Tombol aksi ──
    const btnRetry = document.getElementById('btn-retry');
    const btnNextLevel = document.getElementById('btn-next-level');
    const btnBackToMap = document.getElementById('btn-back-to-map');

    if (btnRetry) {
      btnRetry.textContent = data.phase === 'quiz' ? '🔄 Ulangi Kuis' : '🔄 Ulangi Simulasi';
      btnRetry.style.display = 'inline-block';
    }

    if (btnNextLevel) {
      const nextLevel = (data.levelId || this.currentLevel) + 1;
      if (nextLevel <= 6 && ProgressManager.isLevelUnlocked(nextLevel)) {
        btnNextLevel.style.display = 'inline-block';
        btnNextLevel.textContent = `Level ${nextLevel} →`;
      } else {
        btnNextLevel.style.display = 'none';
      }
    }

    if (btnBackToMap) {
      btnBackToMap.style.display = 'inline-block';
    }

    // Update info pemain
    this.updatePlayerInfo();
  },

  /**
   * Animasi counter XP.
   * @param {Element} element — Elemen target
   * @param {number} targetXP — Jumlah XP final
   */
  _animateXP(element, targetXP) {
    let current = 0;
    const increment = Math.ceil(targetXP / 30);
    const interval = setInterval(() => {
      current += increment;
      if (current >= targetXP) {
        current = targetXP;
        clearInterval(interval);
      }
      const spanEl = element.querySelector('.xp-earned');
      if (spanEl) {
        spanEl.textContent = `+${current} XP`;
      }
    }, 50);
  },

  // ════════════════════════════════════════════════════════════
  //  PERPUSTAKAAN (LIBRARY)
  // ════════════════════════════════════════════════════════════

  /**
   * Merender perpustakaan referensi materi.
   */
  _getLibraryIconSvg(levelId) {
    switch(levelId) {
      case 1:
        return `<svg width="70" height="70" viewBox="0 0 80 80" class="svg-lib-icon lib-rem">
          <g class="anim-rotor-spin" style="transform-origin: 40px 40px;">
            <circle cx="40" cy="40" r="28" fill="none" stroke="#64748b" stroke-width="4" />
            <circle cx="40" cy="40" r="20" fill="none" stroke="#cbd5e1" stroke-width="6" stroke-dasharray="6, 6" />
            <circle cx="40" cy="40" r="12" fill="none" stroke="#475569" stroke-width="2" />
          </g>
          <g class="anim-caliper-clamp" style="transform-origin: 58px 22px;">
            <path d="M 50 12 C 55 12 66 16 66 24 C 66 32 55 36 50 36 L 54 28 L 54 20 Z" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
            <rect x="44" y="18" width="6" height="12" rx="1" fill="#1e293b" />
          </g>
        </svg>`;
      case 2:
        return `<svg width="70" height="70" viewBox="0 0 80 80" class="svg-lib-icon lib-mesin">
          <path d="M 25 15 L 25 65 M 55 15 L 55 65" stroke="#475569" stroke-width="3" stroke-linecap="round" opacity="0.6" />
          <g class="anim-conrod-move" style="transform-origin: 40px 60px;">
            <line x1="40" y1="40" x2="40" y2="60" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" />
            <circle cx="40" cy="60" r="6" fill="#64748b" />
          </g>
          <g class="anim-piston-move" style="transform-origin: 40px 32px;">
            <rect x="28" y="18" width="24" height="20" rx="3" fill="#0ea5e9" stroke="#ffffff" stroke-width="1.5" />
            <line x1="28" y1="23" x2="52" y2="23" stroke="#ffffff" stroke-width="1.5" />
            <line x1="28" y1="28" x2="52" y2="28" stroke="#ffffff" stroke-width="1.5" />
            <circle cx="40" cy="30" r="4.5" fill="#1e293b" stroke="#ffffff" stroke-width="1" />
          </g>
          <path d="M 36 8 L 40 14 L 44 8" stroke="#ffc300" stroke-width="2.5" fill="none" stroke-linecap="round" class="anim-spark-flash" />
        </svg>`;
      case 3:
        return `<svg width="70" height="70" viewBox="0 0 80 80" class="svg-lib-icon lib-listrik">
          <rect x="22" y="24" width="36" height="34" rx="4" fill="none" stroke="#eab308" stroke-width="3" />
          <rect x="28" y="16" width="6" height="8" rx="1" fill="#eab308" />
          <rect x="46" y="16" width="6" height="8" rx="1" fill="#eab308" />
          <text x="31" y="36" fill="#eab308" font-size="10" font-weight="900" text-anchor="middle">-</text>
          <text x="49" y="36" fill="#eab308" font-size="10" font-weight="900" text-anchor="middle">+</text>
          <g class="anim-lightning" style="transform-origin: 40px 40px;">
            <path d="M 42 28 L 32 42 L 39 42 L 36 54 L 48 38 L 41 38 Z" fill="#eab308" stroke="#ffffff" stroke-width="1" />
          </g>
        </svg>`;
      case 4:
        return `<svg width="70" height="70" viewBox="0 0 80 80" class="svg-lib-icon lib-transmisi">
          <g transform="translate(32, 45) scale(0.95)" class="anim-gear-cw-slow" style="transform-origin: 0px 0px;">
            <circle cx="0" cy="0" r="16" fill="none" stroke="#a855f7" stroke-width="3" />
            <circle cx="0" cy="0" r="5" fill="none" stroke="#a855f7" stroke-width="2.5" />
            <path d="M 0 -16 L 0 -21 M 0 16 L 0 21 M -16 0 L -21 0 M 16 0 L 21 0 M 11.3 -11.3 L 14.8 -14.8 M -11.3 11.3 L -14.8 14.8 M -11.3 -11.3 L -14.8 -14.8 M 11.3 11.3 L 14.8 14.8" stroke="#a855f7" stroke-width="3" stroke-linecap="round" />
          </g>
          <g transform="translate(52, 25) scale(0.65)" class="anim-gear-ccw-slow" style="transform-origin: 0px 0px;">
            <circle cx="0" cy="0" r="16" fill="none" stroke="#ffffff" stroke-width="3" />
            <circle cx="0" cy="0" r="5" fill="none" stroke="#ffffff" stroke-width="2.5" />
            <path d="M 0 -16 L 0 -21 M 0 16 L 0 21 M -16 0 L -21 0 M 16 0 L 21 0 M 11.3 -11.3 L 14.8 -14.8 M -11.3 11.3 L -14.8 14.8 M -11.3 -11.3 L -14.8 -14.8 M 11.3 11.3 L 14.8 14.8" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
          </g>
        </svg>`;
      case 5:
        return `<svg width="70" height="70" viewBox="0 0 80 80" class="svg-lib-icon lib-pendingin">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="4, 4" opacity="0.5" />
          <g class="anim-fan-spin" style="transform-origin: 40px 40px;">
            <circle cx="40" cy="40" r="6" fill="#cbd5e1" stroke="#ffffff" stroke-width="1.5" />
            <path d="M 38 34 C 34 22 46 22 42 34 Z" fill="#22c55e" stroke="#ffffff" stroke-width="1" />
            <path d="M 40 40 L 46 38 C 58 34 58 46 46 42 Z" fill="#22c55e" stroke="#ffffff" stroke-width="1" />
            <path d="M 40 40 L 42 46 C 46 58 34 58 38 46 Z" fill="#22c55e" stroke="#ffffff" stroke-width="1" />
            <path d="M 40 40 L 34 42 C 22 46 22 34 34 38 Z" fill="#22c55e" stroke="#ffffff" stroke-width="1" />
          </g>
        </svg>`;
      case 6:
        return `<svg width="70" height="70" viewBox="0 0 80 80" class="svg-lib-icon lib-bodi">
          <path d="M 20 40 C 20 28 35 20 40 20 L 40 60 C 35 60 20 52 20 40 Z" fill="none" stroke="#f97316" stroke-width="3" />
          <path d="M 40 32 L 48 32 L 48 48 L 40 48" fill="none" stroke="#f97316" stroke-width="2.5" />
          <g class="anim-light-rays">
            <line x1="52" y1="28" x2="68" y2="20" stroke="#f97316" stroke-width="3" stroke-linecap="round" />
            <line x1="56" y1="40" x2="72" y2="40" stroke="#f97316" stroke-width="3.5" stroke-linecap="round" />
            <line x1="52" y1="52" x2="68" y2="60" stroke="#f97316" stroke-width="3" stroke-linecap="round" />
          </g>
        </svg>`;
      default:
        return `<div class="library-card-icon">📘</div>`;
    }
  },

  /**
   * Merender perpustakaan referensi materi.
   */
  renderLibrary() {
    const container = document.querySelector('#screen-library .library-grid') ||
                      document.querySelector('#screen-library .library-content');
    if (!container) return;
    container.innerHTML = '';

    const levels = (typeof GAME_DATA !== 'undefined' && GAME_DATA.levels) ? GAME_DATA.levels : [];

    if (levels.length === 0) {
      container.innerHTML = '<p class="empty-state">📚 Belum ada materi tersedia.</p>';
      return;
    }

    levels.forEach((level, index) => {
      const levelId = index + 1;

      const card = document.createElement('div');
      card.className = `library-card lib-level-${levelId}`;

      const iconSvg = this._getLibraryIconSvg(levelId);
      const isCompleted = typeof ProgressManager !== 'undefined' && ProgressManager.isLevelCompleted ? ProgressManager.isLevelCompleted(levelId) : false;
      const completedClass = isCompleted ? 'completed' : '';

      card.innerHTML = `
        <div class="library-card-badge">MODUL 0${levelId}</div>
        <div class="library-card-graphic">${iconSvg}</div>
        <h3 class="library-card-title">${level.title || ''}</h3>
        <p class="library-card-desc">${level.description || ''}</p>
        <div class="library-card-footer">
          <span class="library-card-pages">📄 ${level.learning ? level.learning.length + ' Halaman' : 'Belum tersedia'}</span>
          <span class="library-card-status-pill ${completedClass}">${isCompleted ? 'Selesai ✅' : 'Tersedia 🔓'}</span>
        </div>
        <div class="library-card-progress-bar">
          <div class="library-card-progress-fill" style="width: ${isCompleted ? '100%' : '15%'};"></div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.learningSource = 'library';
        this.currentLevel = levelId;
        this.currentSlide = 0;
        this.showScreen('learn');
        this.renderLearnSlide();
      });

      container.appendChild(card);
    });
  },

  // ════════════════════════════════════════════════════════════
  //  PAPAN SKOR (SCOREBOARD)
  // ════════════════════════════════════════════════════════════

  /**
   * Merender papan skor dan pencapaian.
   */
  renderScoreboard() {
    const stats = ProgressManager.getStats();
    const achievements = ProgressManager.getAllAchievements();
    const playerData = ProgressManager.getPlayerData();

    // 1. Update static elements if they exist in index.html
    const totalXpEl = document.getElementById('total-xp');
    if (totalXpEl) totalXpEl.textContent = stats.totalXP;

    const totalLevelsEl = document.getElementById('total-levels');
    if (totalLevelsEl) totalLevelsEl.textContent = `${stats.levelsCompleted}/6`;

    const totalStarsEl = document.getElementById('total-stars');
    if (totalStarsEl) totalStarsEl.textContent = `${stats.totalStars}/18`;

    const totalBadgesEl = document.getElementById('total-badges');
    if (totalBadgesEl) totalBadgesEl.textContent = stats.achievementsEarned;

    // 2. Render achievements grid if it exists in index.html
    const achievementsGrid = document.querySelector('#screen-scores .achievements-grid');
    if (achievementsGrid) {
      let achHTML = '';
      achievements.forEach((ach, index) => {
        achHTML += `
          <div class="badge-card ${ach.earned ? '' : 'locked'}" data-badge="${ach.id}" style="animation-delay: ${0.1 + index * 0.05}s;">
            <div class="badge-icon">${ach.earned ? ach.icon : '🔒'}</div>
            <div class="badge-name">${ach.name}</div>
            <div class="badge-desc">${ach.description}</div>
          </div>
        `;
      });
      achievementsGrid.innerHTML = achHTML;
    }

    // 3. Fallback to full rendering if dynamic container exists
    const container = document.querySelector('#screen-scores .scores-content') ||
                      document.querySelector('#screen-scores .scoreboard-content');
    if (container) {
      let html = '';
      html += `
        <div class="stats-summary">
          <h3>📊 Statistik Kamu</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-value">${stats.totalXP}</span>
              <span class="stat-label">Total XP</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">${stats.rank.icon} ${stats.rank.name}</span>
              <span class="stat-label">Peringkat</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">${stats.levelsCompleted}/6</span>
              <span class="stat-label">Level Selesai</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">⭐ ${stats.totalStars}/${stats.maxStars}</span>
              <span class="stat-label">Total Bintang</span>
            </div>
          </div>
        </div>
      `;

      html += '<div class="level-overview"><h3>🗺️ Ikhtisar Level</h3><div class="level-overview-grid">';
      const levels = (typeof GAME_DATA !== 'undefined' && GAME_DATA.levels) ? GAME_DATA.levels : [];
      for (let i = 1; i <= Math.max(6, levels.length); i++) {
        const lvl = playerData.levels[i] || {};
        const levelData = levels[i - 1] || {};
        html += `
          <div class="level-overview-card ${lvl.quizCompleted ? 'completed' : ''}">
            <span class="lo-level">Level ${i}</span>
            <span class="lo-title">${levelData.title || '-'}</span>
            <div class="lo-stars">${this._renderStars(lvl.stars || 0)}</div>
            <span class="lo-score">${lvl.bestScore > 0 ? lvl.bestScore + '%' : '-'}</span>
          </div>
        `;
      }
      html += '</div></div>';

      html += '<div class="achievements-section"><h3>🏅 Pencapaian</h3><div class="achievements-grid">';
      achievements.forEach(ach => {
        html += `
          <div class="achievement-card ${ach.earned ? 'earned' : 'locked'}">
            <span class="ach-icon">${ach.earned ? ach.icon : '🔒'}</span>
            <div class="ach-info">
              <strong>${ach.name}</strong>
              <span>${ach.description}</span>
            </div>
          </div>
        `;
      });
      html += '</div></div>';

      html += `
        <div class="ach-progress">
          ${stats.achievementsEarned} dari ${stats.totalAchievements} pencapaian terbuka
        </div>
      `;

      container.innerHTML = html;
    }

    // 4. Render leaderboard table
    this.renderLeaderboardTable();
  },

  async renderLeaderboardTable() {
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) return;

    if (!navigator.onLine) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">Offline (Tidak ada internet)</td></tr>`;
      return;
    }

    if (typeof SyncManager === 'undefined' || !SyncManager._getApiUrl()) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">Database belum dikonfigurasi di pengaturan.</td></tr>`;
      return;
    }

    try {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">Memuat data...</td></tr>`;
      const res = await SyncManager.getLeaderboard('all');
      if (res.success && res.data && res.data.entries && res.data.entries.length > 0) {
        let html = '';
        res.data.entries.forEach((player, index) => {
          const rank = index + 1;
          const rankClass = rank <= 3 ? `leaderboard-rank-${rank}` : '';
          html += `
            <tr>
              <td class="leaderboard-rank ${rankClass}">#${rank}</td>
              <td class="leaderboard-name">${player.nama || 'Mekanik'}</td>
              <td>X TKR</td>
              <td class="leaderboard-score">${player.totalScore}</td>
              <td class="leaderboard-xp">${player.totalXP} XP</td>
            </tr>
          `;
        });
        tbody.innerHTML = html;
      } else {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">Belum ada data nilai di server.</td></tr>`;
      }
    } catch (e) {
      console.error('[App] Failed to load leaderboard:', e);
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--clr-error-light); padding: 20px;">Gagal memuat papan peringkat.</td></tr>`;
    }
  },

  // ════════════════════════════════════════════════════════════
  //  PENGATURAN (SETTINGS)
  // ════════════════════════════════════════════════════════════

  /**
   * Merender halaman pengaturan.
   */
  renderSettings() {
    const container = document.querySelector('#screen-settings .settings-content');
    if (!container) return;

    const data = ProgressManager.getPlayerData();
    const session = (typeof AuthManager !== 'undefined') ? AuthManager.getSession() : null;

    container.innerHTML = `
      <div class="settings-section">
        <h3>👤 Profil Pemain</h3>
        <div class="settings-field">
          <label for="input-player-name">Nama:</label>
          <input type="text" id="input-player-name" value="${data.playerName || ''}" 
                 placeholder="Masukkan nama kamu" maxlength="30" />
        </div>
      </div>

      <div class="settings-section">
        <h3>🎵 Pengaturan Audio</h3>
        <div class="settings-field" style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="margin-bottom: 0; font-weight: 500;">Musik Latar (BGM) 🎵</label>
            <label class="toggle-switch">
              <input type="checkbox" id="toggle-music" ${!AudioManager.isBgmMuted ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div style="margin-top: 8px;">
            <span style="font-size: 0.78rem; color: var(--text-muted);">Volume Musik</span>
            <input type="range" id="volume-music" min="0" max="1" step="0.05" value="${AudioManager.bgmVolume}" style="width: 100%; height: 6px; border-radius: 3px; accent-color: var(--clr-primary); background: rgba(255,255,255,0.1); outline: none; margin-top: 4px;">
          </div>
        </div>

        <div class="settings-field">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <label style="margin-bottom: 0; font-weight: 500;">Efek Suara (SFX) 🔊</label>
            <label class="toggle-switch">
              <input type="checkbox" id="toggle-sound" ${!AudioManager.isSfxMuted ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div style="margin-top: 8px;">
            <span style="font-size: 0.78rem; color: var(--text-muted);">Volume Efek Suara</span>
            <input type="range" id="volume-sound" min="0" max="1" step="0.05" value="${AudioManager.sfxVolume}" style="width: 100%; height: 6px; border-radius: 3px; accent-color: var(--clr-secondary); background: rgba(255,255,255,0.1); outline: none; margin-top: 4px;">
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3>🎨 Tema Tampilan</h3>
        <div class="settings-field" style="display: flex; justify-content: space-between; align-items: center; gap: var(--sp-md);">
          <div>
            <label style="margin-bottom: 0;">Mode Terang / Gelap</label>
            <small style="color: var(--text-muted); display: block; margin-top: 2px;">Sesuaikan warna tampilan game agar nyaman di mata.</small>
          </div>
          <button id="btn-toggle-theme" class="btn btn-secondary" type="button" style="flex-shrink: 0; padding: 8px 16px; border-radius: var(--radius-md); font-weight: 500; display: flex; align-items: center; gap: 8px;">
            ${document.body.classList.contains('light-theme') ? '☀️ Mode Terang' : '🌙 Mode Gelap'}
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3>🧑‍🔧 Akun Siswa</h3>
        ${session ? `
          <p>Status: <strong style="color: var(--clr-success);">Terkoneksi (Online)</strong></p>
          <p>Nama: <strong>${session.nama}</strong></p>
          <p>NIS: <strong>${session.nis}</strong></p>
          <p>Kelas: <strong>${session.kelas}</strong></p>
          <button id="btn-logout-settings" class="btn btn-secondary" style="margin-top: 10px;">🚪 Logout / Keluar</button>
        ` : `
          <p>Status: <strong style="color: var(--clr-error);">Offline (Belum Login)</strong></p>
          <p>Silakan kembali ke halaman login depan untuk sinkronisasi cloud.</p>
        `}
      </div>

      <div class="settings-section">
        <h3>📊 Ringkasan Progres</h3>
        <p>Total XP: <strong>${data.totalXP}</strong></p>
        <p>Level Selesai: <strong>${Object.values(data.levels).filter(l => l.quizCompleted).length}/6</strong></p>
        <p>Pencapaian: <strong>${data.achievements.length}/${ProgressManager._achievementDefinitions.length}</strong></p>
      </div>

      <div class="settings-section settings-danger">
        <h3>⚠️ Zona Bahaya</h3>
        <p>Menghapus progres akan menghilangkan semua data permainan kamu.</p>
        <button id="btn-reset-progress" class="btn btn-danger">🗑️ Hapus Semua Progres</button>
      </div>

      <div class="settings-section">
        <h3>ℹ️ Tentang</h3>
        <p><strong>AutoMaster — Bengkel Virtual</strong></p>
        <p>Game edukasi interaktif untuk siswa SMK jurusan Teknik Kendaraan Ringan.</p>
        <p>Versi 2.1 — 2026</p>
      </div>
    `;

    // Re-bind event setelah render karena elemen baru dibuat
    const inputPlayerName = document.getElementById('input-player-name');
    if (inputPlayerName) {
      inputPlayerName.addEventListener('change', (e) => {
        const newName = e.target.value.trim();
        if (newName) {
          ProgressManager.setPlayerName(newName);
          this.updatePlayerInfo();
          this.showToast('✅ Nama berhasil diperbarui!', 'success');
        }
      });
    }

    // Bind Audio Controls
    const toggleMusic = document.getElementById('toggle-music');
    if (toggleMusic) {
      toggleMusic.addEventListener('change', () => {
        AudioManager.toggleBGMMute();
      });
    }

    const toggleSound = document.getElementById('toggle-sound');
    if (toggleSound) {
      toggleSound.addEventListener('change', () => {
        AudioManager.toggleSFXMute();
      });
    }

    const volumeMusic = document.getElementById('volume-music');
    if (volumeMusic) {
      volumeMusic.addEventListener('input', (e) => {
        AudioManager.setBGMVolume(parseFloat(e.target.value));
      });
    }

    const volumeSound = document.getElementById('volume-sound');
    if (volumeSound) {
      volumeSound.addEventListener('input', (e) => {
        AudioManager.setSFXVolume(parseFloat(e.target.value));
      });
    }

    // Bind Theme Toggle
    const btnToggleTheme = document.getElementById('btn-toggle-theme');
    if (btnToggleTheme) {
      btnToggleTheme.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        localStorage.setItem('automaster_theme', isLight ? 'light' : 'dark');
        btnToggleTheme.innerHTML = isLight ? '☀️ Mode Terang' : '🌙 Mode Gelap';
        this.showToast(isLight ? '☀️ Mode Terang aktif' : '🌙 Mode Gelap aktif', 'info');
      });
    }

    // Bind Logout
    const btnLogoutSettings = document.getElementById('btn-logout-settings');
    if (btnLogoutSettings) {
      btnLogoutSettings.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
          if (typeof SyncManager !== 'undefined') {
            SyncManager.flushQueue();
          }
          AuthManager.logout();
          this.showScreen('landing');
          this.showToast('👋 Berhasil keluar.', 'info');
        }
      });
    }

    const btnReset = document.getElementById('btn-reset-progress');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this._showConfirmDialog(
          'Yakin ingin menghapus semua progres? Tindakan ini tidak bisa dibatalkan!',
          () => {
            ProgressManager.resetProgress();
            this.showScreen('landing');
            this.showToast('🗑️ Progres berhasil direset.', 'info');
          }
        );
      });
    }
  },

  // ════════════════════════════════════════════════════════════
  //  NOTIFIKASI
  // ════════════════════════════════════════════════════════════

  /**
   * Menampilkan notifikasi toast.
   * @param {string} message — Pesan yang ditampilkan
   * @param {string} type — Tipe: 'info', 'success', 'warning', 'error'
   */
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) {
      // Fallback: buat toast jika belum ada
      const fallback = document.createElement('div');
      fallback.id = 'toast';
      document.body.appendChild(fallback);
      return this.showToast(message, type);
    }

    // Set icon based on type
    const iconEl = toast.querySelector('.toast-icon');
    if (iconEl) {
      const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
        achievement: '🏆'
      };
      iconEl.textContent = icons[type] || 'ℹ️';
    }

    // Set title based on type
    const titleEl = toast.querySelector('.toast-title');
    if (titleEl) {
      const titles = {
        success: 'Berhasil',
        error: 'Gagal',
        info: 'Informasi',
        warning: 'Peringatan',
        achievement: 'Pencapaian Baru!'
      };
      titleEl.textContent = titles[type] || 'Info';
    }

    // Set message
    const messageEl = toast.querySelector('.toast-message');
    if (messageEl) {
      messageEl.textContent = message;
    } else {
      // Fallback if structure is missing
      toast.textContent = message;
    }

    // Reset class dan timer
    clearTimeout(this._toastTimer);
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');

    // Auto-hide
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },

  /**
   * Menampilkan notifikasi pencapaian baru.
   * @param {object} achievement — Objek pencapaian { name, icon, description }
   */
  showAchievement(achievement) {
    // Buat notifikasi pencapaian khusus
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
      <div class="ach-notif-content">
        <span class="ach-notif-icon">${achievement.icon || '🏅'}</span>
        <div class="ach-notif-text">
          <strong>Pencapaian Baru!</strong>
          <span>${achievement.name}</span>
          <small>${achievement.description}</small>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animasi masuk
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Hapus setelah 4 detik
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 4000);
  },

  // ════════════════════════════════════════════════════════════
  //  DIALOG KONFIRMASI
  // ════════════════════════════════════════════════════════════

  /**
   * Menampilkan dialog konfirmasi sederhana.
   * @param {string} message — Pesan konfirmasi
   * @param {Function} onConfirm — Callback jika dikonfirmasi
   * @param {string} confirmText — Teks tombol konfirmasi (default: 'Ya, Hapus')
   */
  _showConfirmDialog(message, onConfirm, confirmText = 'Ya, Hapus') {
    // Buat overlay dialog
    const overlay = document.createElement('div');
    overlay.className = 'confirm-dialog-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <p>${message}</p>
        <div class="confirm-dialog-buttons">
          <button class="btn btn-cancel" id="confirm-cancel">Batal</button>
          <button class="btn btn-danger" id="confirm-yes">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animasi masuk
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Event handler
    overlay.querySelector('#confirm-cancel').addEventListener('click', () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    });

    overlay.querySelector('#confirm-yes').addEventListener('click', () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
      onConfirm();
    });

    // Klik overlay untuk batal
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
      }
    });
  },

  /**
   * Menampilkan dialog alert sederhana.
   */
  _showAlertDialog(title, message) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-dialog-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog" style="max-width: 400px; text-align: center;">
        <h3 style="margin-bottom: 12px; font-family: var(--ff-heading); color: var(--clr-primary); font-size: 1.25rem;">${title}</h3>
        <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 20px; text-align: left;">${message}</p>
        <div class="confirm-dialog-buttons" style="justify-content: center;">
          <button class="btn btn-primary" id="alert-ok" style="padding: 8px 30px; font-size: 0.85rem;">Siap, Mengerti! 👍</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('active'));

    const closeAlert = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('#alert-ok').addEventListener('click', closeAlert);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeAlert();
      }
    });
  },

  // ════════════════════════════════════════════════════════════
  //  UTILITAS
  // ════════════════════════════════════════════════════════════

  /**
   * Render bintang visual (0–3).
   * @param {number} stars — Jumlah bintang (0–3)
   * @returns {string} — HTML bintang
   */
  _renderStars(stars) {
    let html = '';
    for (let i = 1; i <= 3; i++) {
      html += `<span class="star ${i <= stars ? 'filled' : 'empty'}">${i <= stars ? '⭐' : '☆'}</span>`;
    }
    return html;
  },

  /**
   * Menampilkan modal edit profil dan mengisi form dengan data saat ini.
   */
  showProfileModal() {
    const data = ProgressManager.getPlayerData();
    this.selectedAvatar = data.avatar || '🧑‍🔧';
    
    // Isi field input nama & sekolah
    const inputName = document.getElementById('profile-name');
    if (inputName) inputName.value = data.playerName || '';
    
    const inputSchool = document.getElementById('profile-school');
    if (inputSchool) inputSchool.value = data.sekolah || 'SMK Amal Bakti Jatimulyo';

    // Highlight avatar yang terpilih
    const avatarBtns = document.querySelectorAll('.avatar-option-btn');
    avatarBtns.forEach(btn => {
      if (btn.dataset.avatar === this.selectedAvatar) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });

    // Isi data sesi read-only
    const session = (typeof AuthManager !== 'undefined') ? AuthManager.getSession() : null;
    const displayNis = document.getElementById('profile-display-nis');
    const displayKelas = document.getElementById('profile-display-kelas');
    const displayWa = document.getElementById('profile-display-wa');

    if (session) {
      if (displayNis) displayNis.textContent = session.nis || '-';
      if (displayKelas) displayKelas.textContent = session.kelas || '-';
      if (displayWa) displayWa.textContent = session.wa || '-';
    } else {
      if (displayNis) displayNis.textContent = 'Offline';
      if (displayKelas) displayKelas.textContent = 'Offline';
      if (displayWa) displayWa.textContent = 'Offline';
    }

    this.showModal('modal-profile');
  },

  /**
   * Menyimpan perubahan profil (lokal & awan jika masuk sesi login).
   */
  async saveProfile() {
    const inputName = document.getElementById('profile-name');
    const inputSchool = document.getElementById('profile-school');
    
    const newName = inputName ? inputName.value.trim() : '';
    const newSchool = inputSchool ? inputSchool.value.trim() : '';
    const newAvatar = this.selectedAvatar || '🧑‍🔧';

    if (!newName) {
      this.showToast('⚠️ Nama lengkap wajib diisi.', 'warning');
      return;
    }
    if (!newSchool) {
      this.showToast('⚠️ Asal sekolah wajib diisi.', 'warning');
      return;
    }

    this.showToast('💾 Menyimpan perubahan profil...', 'info');

    // Simpan data ke ProgressManager
    ProgressManager.setPlayerName(newName);
    ProgressManager.setSekolah(newSchool);
    ProgressManager.setAvatar(newAvatar);

    // Sinkronisasi ke session dan database awan jika siswa login
    if (typeof AuthManager !== 'undefined' && AuthManager.isLoggedIn()) {
      const session = AuthManager.getSession();
      if (session) {
        session.nama = newName;
        try {
          sessionStorage.setItem('automaster_session', JSON.stringify(session));
        } catch (e) {
          console.warn('[App] Gagal menyimpan sesi saat edit nama:', e);
        }

        // Jalankan API updateProfile ke awan
        try {
          const res = await AuthManager.updateProfile(session.nis, newName);
          if (res.success) {
            this.showToast('✅ Profil berhasil disinkronkan ke database!', 'success');
          } else {
            console.warn('[App] Gagal sinkronisasi profil:', res.message);
            this.showToast('⚠️ Profil disimpan lokal (Gagal sinkronisasi database)', 'warning');
          }
        } catch (err) {
          console.warn('[App] Error sinkronisasi profil:', err);
          this.showToast('⚠️ Profil disimpan lokal (Kesalahan jaringan)', 'warning');
        }
      }
    } else {
      this.showToast('✅ Profil lokal berhasil diperbarui!', 'success');
    }

    // Perbarui UI info pemain dan sembunyikan modal
    this.updatePlayerInfo();
    this.hideModal('modal-profile');
  },

  /**
   * Menangani logout cepat langsung dari dashboard beranda.
   */
  handleQuickLogout() {
    this._showConfirmDialog(
      'Apakah Anda yakin ingin keluar dari akun? Progres Anda akan disimpan di perangkat ini.',
      () => {
        if (typeof SyncManager !== 'undefined') {
          SyncManager.flushQueue();
        }
        AuthManager.logout();
        this.showScreen('landing');
        this.showToast('👋 Berhasil keluar.', 'info');
      },
      'Ya, Keluar'
    );
  },

  handleTeacherLogout() {
    this.teacherSecret = null;
    sessionStorage.removeItem('automaster_teacher_secret');
    this.showScreen('login');
    this.showToast('👋 Berhasil keluar dari dasbor guru.', 'info');
  },

  async refreshTeacherData() {
    const secret = this.teacherSecret;
    if (!secret) return;
    this.showToast('🔄 Memperbarui data...', 'info');
    try {
      const url = `${AuthManager.API_URL}?action=getstudents&secret=${encodeURIComponent(secret)}`;
      const response = await fetch(url);
      const res = await response.json();
      if (res.success) {
        this.renderTeacherDashboard(res.data);
        this.showToast('✅ Data berhasil diperbarui!', 'success');
      } else {
        this.showToast(`❌ ${res.message}`, 'error');
      }
    } catch (e) {
      console.error('[Dashboard Guru] Gagal refresh data:', e);
      this.showToast('❌ Gagal menyinkronkan data. Pastikan URL Web App Google Apps Script Anda benar, sudah dideploy sebagai "Anyone", dan telah menyetujui izin akses (Authorize).', 'error', 7000);
    }
  },

  renderTeacherDashboard(data) {
    this.teacherData = data;
    
    // Check if any student has progress but lacks completedLevels array (outdated deployment warning)
    let isOutdated = false;
    if (data && data.students) {
      for (const s of data.students) {
        if (s.progress && typeof s.progress.completedLevels === 'undefined') {
          isOutdated = true;
          break;
        }
      }
    }

    const container = document.querySelector('.teacher-dashboard-content');
    if (container) {
      let warningBanner = document.getElementById('teacher-outdated-warning');
      if (isOutdated) {
        if (!warningBanner) {
          warningBanner = document.createElement('div');
          warningBanner.id = 'teacher-outdated-warning';
          warningBanner.style.cssText = `
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%);
            border: 1px solid rgba(239, 68, 68, 0.35);
            color: #fca5a5;
            padding: var(--sp-md, 16px);
            border-radius: 8px;
            margin-bottom: var(--sp-lg, 24px);
            font-size: 0.9rem;
            line-height: 1.6;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
          `;
          container.insertBefore(warningBanner, container.firstChild);
        }
        warningBanner.innerHTML = `
          <div style="display: flex; gap: 12px; align-items: flex-start;">
            <span style="font-size: 1.4rem; line-height: 1; filter: drop-shadow(0 0 4px rgba(239,68,68,0.5));">⚠️</span>
            <div>
              <strong style="color: #fff; font-size: 0.95rem; display: block; margin-bottom: 4px;">PENTING: Versi Web App Google Apps Script Anda Belum Diperbarui!</strong>
              <span>Dasbor mendeteksi bahwa Web App Google Apps Script Anda menjalankan kode versi lama. Akibatnya, status ketuntasan level (L1–L6) siswa tidak dapat dibaca dari spreadsheet dan semuanya muncul sebagai tanda silang merah (❌).</span>
              <div style="margin-top: 8px; font-weight: 600; color: #fff;">Cara memperbaikinya:</div>
              <ol style="margin: 4px 0 0 20px; padding: 0;">
                <li>Gulir ke bawah ke bagian <strong>"Panduan Menyalin Kode Google Apps Script Backend"</strong>.</li>
                <li>Klik tombol <strong>"Salin Kode gs ke Clipboard"</strong>.</li>
                <li>Buka editor Apps Script Anda di Google Drive, hapus semua kode lama, dan tempel kode baru tersebut.</li>
                <li>Klik tombol <strong>Deploy</strong> di kanan atas → pilih <strong>Manage Deployments</strong>.</li>
                <li>Klik ikon <strong>Pensil (Edit)</strong> di sebelah deployment aktif Anda, lalu ubah opsi <strong>Version</strong> menjadi <strong>"New Version" (Versi Baru)</strong>.</li>
                <li>Klik <strong>Deploy</strong>, lalu salin URL Web App yang baru ke kolom di bawah ini dan klik Simpan.</li>
              </ol>
            </div>
          </div>
        `;
      } else {
        if (warningBanner) {
          warningBanner.remove();
        }
      }
    }
    
    // Set database URL input
    const dbUrlInput = document.getElementById('teacher-db-url');
    if (dbUrlInput) {
      dbUrlInput.value = AuthManager.API_URL;
    }

    // Load Apps Script code into the textarea
    if (!this.appsScriptCode) {
      fetch('google-apps-script/Code.gs')
        .then(response => {
          if (!response.ok) throw new Error('File Code.gs tidak dapat dimuat');
          return response.text();
        })
        .then(code => {
          this.appsScriptCode = code;
          const textarea = document.getElementById('textarea-script-code');
          if (textarea) {
            textarea.value = code;
          }
        })
        .catch(err => {
          console.error('[Dashboard Guru] Gagal memuat Code.gs:', err);
          const textarea = document.getElementById('textarea-script-code');
          if (textarea) {
            textarea.value = '// Gagal memuat file Code.gs secara otomatis.\n// Silakan hubungi pengembang di 085664236522 atau salin secara manual dari folder proyek Anda.';
          }
        });
    } else {
      const textarea = document.getElementById('textarea-script-code');
      if (textarea) {
        textarea.value = this.appsScriptCode;
      }
    }

    // Populate class filter dropdown if it has only one option (default)
    const classFilter = document.getElementById('teacher-class-filter');
    if (classFilter && data.students) {
      const uniqueClasses = [...new Set(data.students.map(s => s.kelas).filter(Boolean))].sort();
      let optionsHtml = '<option value="">Semua Kelas</option>';
      uniqueClasses.forEach(c => {
        optionsHtml += `<option value="${c}">${c}</option>`;
      });
      const currentSelected = classFilter.value;
      classFilter.innerHTML = optionsHtml;
      if (uniqueClasses.includes(currentSelected)) {
        classFilter.value = currentSelected;
      }
    }

    // Render session logs
    const sessionLogsEl = document.getElementById('teacher-session-logs');
    if (sessionLogsEl && data.recentSessions) {
      if (data.recentSessions.length > 0) {
        sessionLogsEl.innerHTML = data.recentSessions.map(s => {
          return `<div style="margin-bottom: 6px; border-bottom: 1px dashed rgba(255,255,255,0.05); padding-bottom: 4px;">
            <span style="color: var(--clr-primary); font-weight:600;">[${s.loginTime}]</span> 
            <strong>${s.nama}</strong> (Kelas: ${s.kelas || '-'}, NIS: ${s.nis}) 
            masuk via <em>${s.device}</em>
          </div>`;
        }).join('');
      } else {
        sessionLogsEl.innerHTML = '<div style="color: var(--text-muted);">Belum ada log masuk.</div>';
      }
    }

    // Run filtering and render KPIs + Charts + Table
    this.filterTeacherData();
  },

  filterTeacherData() {
    if (!this.teacherData || !this.teacherData.students) return;

    const classFilterVal = document.getElementById('teacher-class-filter')?.value || '';
    const searchVal = document.getElementById('teacher-student-search')?.value.toLowerCase().trim() || '';

    // Filter students
    let filteredStudents = this.teacherData.students;
    if (classFilterVal) {
      filteredStudents = filteredStudents.filter(s => s.kelas === classFilterVal);
    }
    if (searchVal) {
      filteredStudents = filteredStudents.filter(s => 
        (s.nama || '').toLowerCase().includes(searchVal) || 
        (s.nis || '').includes(searchVal)
      );
    }

    // Calculate metrics
    const totalStudents = filteredStudents.length;
    let totalScore = 0;
    let totalXP = 0;
    filteredStudents.forEach(s => {
      totalScore += s.progress?.totalScore || 0;
      totalXP += s.progress?.totalXP || 0;
    });

    const avgScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;
    const avgXP = totalStudents > 0 ? Math.round(totalXP / totalStudents) : 0;

    // Active Today count (Jakarta timezone YYYY-MM-DD)
    const todayStr = new Date().toLocaleDateString('en-CA');
    let activeTodayCount = 0;
    if (this.teacherData.recentSessions) {
      const filteredNisSet = new Set(filteredStudents.map(s => s.nis));
      const activeNisSet = new Set();
      this.teacherData.recentSessions.forEach(s => {
        if (s.loginTime.startsWith(todayStr) && filteredNisSet.has(s.nis)) {
          activeNisSet.add(s.nis);
        }
      });
      activeTodayCount = activeNisSet.size;
    }

    // Update KPI UI elements
    const totalStudentsEl = document.getElementById('teacher-metric-total-students');
    const avgScoreEl = document.getElementById('teacher-metric-avg-score');
    const avgXpEl = document.getElementById('teacher-metric-avg-xp');
    const activeTodayEl = document.getElementById('teacher-metric-active-today');
    
    if (totalStudentsEl) totalStudentsEl.textContent = totalStudents;
    if (avgScoreEl) avgScoreEl.textContent = avgScore;
    if (avgXpEl) avgXpEl.textContent = avgXP;
    if (activeTodayEl) activeTodayEl.textContent = activeTodayCount;

    // Render Table
    const tbody = document.getElementById('teacher-student-tbody');
    if (tbody) {
      if (filteredStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; padding: 30px; color: var(--text-muted);">Tidak ada data siswa yang cocok dengan filter.</td></tr>`;
      } else {
        tbody.innerHTML = filteredStudents.map(s => {
          const waFormatted = s.wa ? (s.wa.startsWith('0') ? '62' + s.wa.slice(1) : s.wa) : '';
          const waLink = waFormatted ? `<a href="https://wa.me/${waFormatted}" target="_blank" style="color: var(--clr-primary); text-decoration: underline; font-weight: 500;">${s.wa}</a>` : '-';
          
          const completedLevels = (s.progress?.completedLevels || []).map(l => {
            let str = String(l).trim();
            if (str.indexOf('.') !== -1) str = str.split('.')[0];
            return str.replace(/\D/g, "");
          });
          const l1 = completedLevels.includes('1') ? '<span style="color:#10b981; font-weight:bold;">✅</span>' : '<span style="color:#ef4444; font-weight:bold;">❌</span>';
          const l2 = completedLevels.includes('2') ? '<span style="color:#10b981; font-weight:bold;">✅</span>' : '<span style="color:#ef4444; font-weight:bold;">❌</span>';
          const l3 = completedLevels.includes('3') ? '<span style="color:#10b981; font-weight:bold;">✅</span>' : '<span style="color:#ef4444; font-weight:bold;">❌</span>';
          const l4 = completedLevels.includes('4') ? '<span style="color:#10b981; font-weight:bold;">✅</span>' : '<span style="color:#ef4444; font-weight:bold;">❌</span>';
          const l5 = completedLevels.includes('5') ? '<span style="color:#10b981; font-weight:bold;">✅</span>' : '<span style="color:#ef4444; font-weight:bold;">❌</span>';
          const l6 = completedLevels.includes('6') ? '<span style="color:#10b981; font-weight:bold;">✅</span>' : '<span style="color:#ef4444; font-weight:bold;">❌</span>';
          
          let predikat = 'Pemula';
          const xp = s.progress?.totalXP || 0;
          if (xp >= 5000) predikat = '🛠️ Master Mekanik';
          else if (xp >= 3000) predikat = '⚙️ Mekanik Senior';
          else if (xp >= 1000) predikat = '🔧 Asisten Mekanik';

          return `<tr>
            <td style="padding: 10px 8px; font-weight:500;">${s.nama}</td>
            <td style="padding: 10px 8px;">${s.nis}</td>
            <td style="padding: 10px 8px;">${s.kelas || '-'}</td>
            <td style="padding: 10px 8px;">${waLink}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight:600;">${s.progress?.totalScore || 0}</td>
            <td style="padding: 10px 8px; text-align: center; color:#f59e0b;">⭐ ${s.progress?.totalStars || 0}</td>
            <td style="padding: 10px 8px; text-align: center; font-weight:600; color:#10b981;">${xp}</td>
            <td style="padding: 10px 8px; font-size:0.8rem; font-weight:500;">${predikat}</td>
            <td style="padding: 10px 4px; text-align: center;">${l1}</td>
            <td style="padding: 10px 4px; text-align: center;">${l2}</td>
            <td style="padding: 10px 4px; text-align: center;">${l3}</td>
            <td style="padding: 10px 4px; text-align: center;">${l4}</td>
            <td style="padding: 10px 4px; text-align: center;">${l5}</td>
            <td style="padding: 10px 4px; text-align: center;">${l6}</td>
          </tr>`;
        }).join('');
      }
    }

    // Render Charts
    this.updateCharts(filteredStudents);
  },

  updateCharts(students) {
    if (!this.charts) {
      this.charts = { completion: null, xp: null };
    }

    if (typeof Chart === 'undefined') {
      console.warn('[App] Chart.js is not loaded.');
      return;
    }

    // Destroy existing charts
    if (this.charts.completion) {
      this.charts.completion.destroy();
      this.charts.completion = null;
    }
    if (this.charts.xp) {
      this.charts.xp.destroy();
      this.charts.xp = null;
    }

    const total = students.length;
    if (total === 0) return;

    // 1. Completion Chart (Level 1-6)
    const levels = ['1', '2', '3', '4', '5', '6'];
    const completionPercentages = levels.map(lvl => {
      const completedCount = students.filter(s => {
        const completedLevels = (s.progress?.completedLevels || []).map(String);
        return completedLevels.includes(lvl);
      }).length;
      return Math.round((completedCount / total) * 100);
    });

    const completionCtx = document.getElementById('chart-level-completion');
    if (completionCtx) {
      const isLightTheme = document.body.classList.contains('light-theme');
      const textColor = isLightTheme ? '#4b5563' : '#9ca3af';
      const gridColor = isLightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';

      this.charts.completion = new Chart(completionCtx, {
        type: 'bar',
        data: {
          labels: ['Lvl 1: Dasar', 'Lvl 2: Engine', 'Lvl 3: Rem', 'Lvl 4: Transmisi', 'Lvl 5: Listrik', 'Lvl 6: Diagnosis'],
          datasets: [{
            label: 'Persentase Ketuntasan (%)',
            data: completionPercentages,
            backgroundColor: 'rgba(255, 107, 53, 0.6)',
            borderColor: 'rgba(255, 107, 53, 1)',
            borderWidth: 1.5,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: function(context) { return ` ${context.parsed.y}% Siswa`; }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: gridColor },
              ticks: { color: textColor }
            },
            x: {
              grid: { display: false },
              ticks: { color: textColor }
            }
          }
        }
      });
    }

    // 2. XP Distribution Chart
    const xpRanges = {
      'Pemula (<1000 XP)': 0,
      'Asisten (1000-3000 XP)': 0,
      'Senior (3001-5000 XP)': 0,
      'Master (>5000 XP)': 0
    };

    students.forEach(s => {
      const xp = s.progress?.totalXP || 0;
      if (xp >= 5000) xpRanges['Master (>5000 XP)']++;
      else if (xp >= 3001) xpRanges['Senior (3001-5000 XP)']++;
      else if (xp >= 1000) xpRanges['Asisten (1000-3000 XP)']++;
      else xpRanges['Pemula (<1000 XP)']++;
    });

    const xpCtx = document.getElementById('chart-xp-distribution');
    if (xpCtx) {
      const isLightTheme = document.body.classList.contains('light-theme');
      const textColor = isLightTheme ? '#4b5563' : '#d1d5db';

      this.charts.xp = new Chart(xpCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(xpRanges),
          datasets: [{
            data: Object.values(xpRanges),
            backgroundColor: [
              'rgba(239, 68, 68, 0.65)',
              'rgba(245, 158, 11, 0.65)',
              'rgba(59, 130, 246, 0.65)',
              'rgba(16, 185, 129, 0.65)'
            ],
            borderColor: [
              'rgba(239, 68, 68, 1)',
              'rgba(245, 158, 11, 1)',
              'rgba(59, 130, 246, 1)',
              'rgba(16, 185, 129, 1)'
            ],
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: textColor,
                boxWidth: 12,
                font: { size: 10 }
              }
            }
          }
        }
      });
    }
  }
};

// ════════════════════════════════════════════════════════════
//  INISIALISASI SAAT DOM SIAP
// ════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => App.init());
