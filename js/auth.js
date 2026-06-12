/**
 * AuthManager — Student Login & Registration Module
 * AutoMaster v2.0
 * 
 * Handles student authentication via Google Apps Script API.
 * Uses sessionStorage for session persistence within a browser tab.
 */
const AuthManager = {
  API_URL: '',
  _session: null,

  /**
   * Initialize AuthManager — load any existing session from sessionStorage.
   */
  init() {
    try {
      const stored = sessionStorage.getItem('automaster_session');
      if (stored) {
        this._session = JSON.parse(stored);
        // Validate session structure
        if (!this._session || !this._session.nis || !this._session.token) {
          this._session = null;
          sessionStorage.removeItem('automaster_session');
        }
      }
    } catch (e) {
      console.warn('[AuthManager] Failed to load session from storage:', e);
      this._session = null;
      sessionStorage.removeItem('automaster_session');
    }
  },

  /**
   * Set the Google Apps Script API URL.
   * @param {string} url - The deployed Apps Script web app URL.
   */
  setApiUrl(url) {
    if (!url || typeof url !== 'string') {
      console.error('[AuthManager] Invalid API URL provided.');
      return;
    }
    this.API_URL = url.trim();
  },

  /**
   * Check if a user is currently logged in.
   * @returns {boolean}
   */
  isLoggedIn() {
    return this._session !== null && typeof this._session === 'object' && !!this._session.token;
  },

  /**
   * Get the current session data.
   * @returns {object|null} Session object or null if not logged in.
   */
  getSession() {
    return this._session;
  },

  /**
   * Validate NIS (Nomor Induk Siswa).
   * Must be numeric, 4-10 digits.
   * @param {string} nis
   * @returns {{valid: boolean, message: string}}
   */
  _validateNis(nis) {
    if (!nis || typeof nis !== 'string') {
      return { valid: false, message: 'NIS wajib diisi.' };
    }
    const trimmed = nis.trim();
    if (!/^\d{4,10}$/.test(trimmed)) {
      return { valid: false, message: 'NIS harus berupa angka, 4-10 digit.' };
    }
    return { valid: true, message: '' };
  },

  /**
   * Validate Nama (student name).
   * Must be non-empty, minimum 3 characters.
   * @param {string} nama
   * @returns {{valid: boolean, message: string}}
   */
  _validateNama(nama) {
    if (!nama || typeof nama !== 'string') {
      return { valid: false, message: 'Nama wajib diisi.' };
    }
    const trimmed = nama.trim();
    if (trimmed.length < 3) {
      return { valid: false, message: 'Nama minimal 3 karakter.' };
    }
    return { valid: true, message: '' };
  },

  /**
   * Validate WA (WhatsApp number).
   * Must start with 08, 10-13 digits total.
   * @param {string} wa
   * @returns {{valid: boolean, message: string}}
   */
  _validateWa(wa) {
    if (!wa || typeof wa !== 'string') {
      return { valid: false, message: 'Nomor WhatsApp wajib diisi.' };
    }
    const trimmed = wa.trim();
    if (!/^08\d{8,11}$/.test(trimmed)) {
      return { valid: false, message: 'Nomor WA harus diawali 08 dan terdiri dari 10-13 digit.' };
    }
    return { valid: true, message: '' };
  },

  /**
   * Validate password.
   * Minimum 6 characters.
   * @param {string} password
   * @returns {{valid: boolean, message: string}}
   */
  _validatePassword(password) {
    if (!password || typeof password !== 'string') {
      return { valid: false, message: 'Password wajib diisi.' };
    }
    if (password.length < 6) {
      return { valid: false, message: 'Password minimal 6 karakter.' };
    }
    return { valid: true, message: '' };
  },

  /**
   * Register a new student account.
   * @param {string} nis - Nomor Induk Siswa (4-10 digits)
   * @param {string} nama - Student name (min 3 chars)
   * @param {string} kelas - Class/grade
   * @param {string} wa - WhatsApp number (starts with 08, 10-13 digits)
   * @param {string} password - Password (min 6 chars)
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async register(nis, nama, kelas, wa, password) {
    // Client-side validation
    const nisCheck = this._validateNis(nis);
    if (!nisCheck.valid) return { success: false, message: nisCheck.message };

    const namaCheck = this._validateNama(nama);
    if (!namaCheck.valid) return { success: false, message: namaCheck.message };

    if (!kelas || typeof kelas !== 'string' || kelas.trim().length === 0) {
      return { success: false, message: 'Kelas wajib diisi.' };
    }

    const waCheck = this._validateWa(wa);
    if (!waCheck.valid) return { success: false, message: waCheck.message };

    const passCheck = this._validatePassword(password);
    if (!passCheck.valid) return { success: false, message: passCheck.message };

    // API URL check
    if (!this.API_URL) {
      return { success: false, message: 'API URL belum dikonfigurasi. Hubungi administrator.' };
    }

    try {
      const url = this.API_URL + '?action=register';
      const payload = {
        action: 'register',
        nis: nis.trim(),
        nama: nama.trim(),
        kelas: kelas.trim(),
        wa: wa.trim(),
        password: password
      };

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return { success: false, message: 'Server error: ' + response.status + '. Coba lagi nanti.' };
      }

      const result = await response.json();
      return {
        success: !!result.success,
        message: result.message || (result.success ? 'Registrasi berhasil!' : 'Registrasi gagal.')
      };
    } catch (err) {
      console.error('[AuthManager] Register error:', err);
      if (!navigator.onLine) {
        return { success: false, message: 'Tidak ada koneksi internet. Periksa jaringan Anda.' };
      }
      return { success: false, message: 'Gagal menghubungi server. Coba lagi nanti.' };
    }
  },

  /**
   * Login with NIS and password.
   * @param {string} nis - Nomor Induk Siswa
   * @param {string} password - Password
   * @returns {Promise<{success: boolean, message: string, data: object|null}>}
   */
  async login(nis, password) {
    // Client-side validation
    const nisCheck = this._validateNis(nis);
    if (!nisCheck.valid) return { success: false, message: nisCheck.message, data: null };

    const passCheck = this._validatePassword(password);
    if (!passCheck.valid) return { success: false, message: passCheck.message, data: null };

    // API URL check
    if (!this.API_URL) {
      return { success: false, message: 'API URL belum dikonfigurasi. Hubungi administrator.', data: null };
    }

    try {
      const url = this.API_URL + '?action=login';
      const payload = {
        action: 'login',
        nis: nis.trim(),
        password: password
      };

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return { success: false, message: 'Server error: ' + response.status + '. Coba lagi nanti.', data: null };
      }

      const result = await response.json();

      if (result.success && result.data) {
        // Build session object
        this._session = {
          nis: result.data.nis || nis.trim(),
          nama: result.data.nama || '',
          kelas: result.data.kelas || '',
          token: result.data.token || this._generateLocalToken(),
          loginTime: new Date().toISOString()
        };

        // Persist to sessionStorage
        try {
          sessionStorage.setItem('automaster_session', JSON.stringify(this._session));
        } catch (e) {
          console.warn('[AuthManager] Failed to save session to storage:', e);
        }

        return {
          success: true,
          message: result.message || 'Login berhasil! Selamat datang, ' + this._session.nama + '.',
          data: this._session
        };
      }

      return {
        success: false,
        message: result.message || 'NIS atau password salah.',
        data: null
      };
    } catch (err) {
      console.error('[AuthManager] Login error:', err);
      if (!navigator.onLine) {
        return { success: false, message: 'Tidak ada koneksi internet. Periksa jaringan Anda.', data: null };
      }
      return { success: false, message: 'Gagal menghubungi server. Coba lagi nanti.', data: null };
    }
  },

  /**
   * Logout the current user.
   * Clears session from memory and sessionStorage.
   */
  logout() {
    this._session = null;
    try {
      sessionStorage.removeItem('automaster_session');
    } catch (e) {
      console.warn('[AuthManager] Failed to clear session from storage:', e);
    }

    // Notify the app if available
    if (typeof App !== 'undefined' && App && typeof App.showScreen === 'function') {
      App.showScreen('login');
    }
  },

  /**
   * Update student profile name in the cloud database.
   * @param {string} nis - Student NIS
   * @param {string} nama - Student's new name
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async updateProfile(nis, nama) {
    if (!nis || !nama) {
      return { success: false, message: 'NIS dan nama wajib diisi.' };
    }

    if (!this.API_URL) {
      return { success: false, message: 'API URL belum dikonfigurasi.' };
    }

    try {
      const url = this.API_URL + '?action=updateprofile';
      const payload = {
        action: 'updateprofile',
        nis: nis.trim(),
        nama: nama.trim()
      };

      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        return { success: false, message: 'Server error: ' + response.status };
      }

      const result = await response.json();
      return {
        success: !!result.success,
        message: result.message || 'Profil berhasil diperbarui.'
      };
    } catch (err) {
      console.error('[AuthManager] Update profile error:', err);
      return { success: false, message: 'Gagal sinkronisasi ke database awan.' };
    }
  },

  /**
   * Generate a local fallback token when the server doesn't provide one.
   * @returns {string}
   */
  _generateLocalToken() {
    const array = new Uint8Array(24);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, function (byte) {
      return byte.toString(16).padStart(2, '0');
    }).join('');
  }
};
