/**
 * AudioManager — Sistem Audio Game (BGM & SFX)
 * AutoMaster v2.1
 * 
 * Mengelola pemutaran musik latar (BGM) dan efek suara (SFX).
 * Mendukung penyimpanan volume & status mute ke localStorage.
 * Memiliki mekanisme pemuatan dual-source (Lokal -> CDN Fallback).
 */
const AudioManager = {
  // ── Pengaturan Volume Default ────────────────────────────────
  bgmVolume: 0.3,
  sfxVolume: 0.5,
  isBgmMuted: false,
  isSfxMuted: false,

  // ── Objek Audio & Aset ──────────────────────────────────────
  bgmAudio: null,
  sfxCache: {},
  _initialized: false,

  // ── Daftar Aset Audio (Lokal -> CDN Cadangan) ────────────────
  bgmAset: [
    'audio/bgm.mp3',
    'https://assets.mixkit.co/music/preview/mixkit-retro-arcade-150.mp3'
  ],

  sfxAset: {
    click: [
      'audio/click.mp3',
      'https://assets.mixkit.co/sfx/preview/mixkit-simple-click-3058.mp3'
    ],
    correct: [
      'audio/correct.mp3',
      'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-reward-952.mp3'
    ],
    wrong: [
      'audio/wrong.mp3',
      'https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'
    ],
    victory: [
      'audio/victory.mp3',
      'https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'
    ]
  },

  // ════════════════════════════════════════════════════════════
  //  INISIALISASI
  // ════════════════════════════════════════════════════════════

  /**
   * Mengambil pengaturan tersimpan dan menyiapkan AudioManager.
   * Harus dipanggil pada interaksi pertama user (karena aturan Autoplay browser).
   */
  init() {
    if (this._initialized) return;
    
    try {
      console.log('🎵 Menginisialisasi AudioManager...');
      
      // Muat preferensi audio dari localStorage jika ada
      const savedBgmVol = localStorage.getItem('automaster_audio_bgm_vol');
      if (savedBgmVol !== null) this.bgmVolume = parseFloat(savedBgmVol);
      
      const savedSfxVol = localStorage.getItem('automaster_audio_sfx_vol');
      if (savedSfxVol !== null) this.sfxVolume = parseFloat(savedSfxVol);
      
      const savedBgmMute = localStorage.getItem('automaster_audio_bgm_mute');
      if (savedBgmMute !== null) this.isBgmMuted = savedBgmMute === 'true';
      
      const savedSfxMute = localStorage.getItem('automaster_audio_sfx_mute');
      if (savedSfxMute !== null) this.isSfxMuted = savedSfxMute === 'true';

      // Setup Musik Latar (BGM)
      this.bgmAudio = new Audio();
      this.bgmAudio.loop = true;
      this._setupAudioSource(this.bgmAudio, this.bgmAset, true);
      this.bgmAudio.volume = this.isBgmMuted ? 0 : this.bgmVolume;

      // Pre-load SFX ke Cache
      for (const sfxName in this.sfxAset) {
        const audioObj = new Audio();
        this._setupAudioSource(audioObj, this.sfxAset[sfxName], false);
        audioObj.volume = this.isSfxMuted ? 0 : this.sfxVolume;
        this.sfxCache[sfxName] = audioObj;
      }

      this._initialized = true;

      // Putar BGM pertama kali jika tidak dalam status mute
      if (!this.isBgmMuted) {
        this.playBGM();
      }
    } catch (e) {
      console.warn('[AudioManager] Gagal melakukan inisialisasi audio:', e);
    }
  },

  /**
   * Mengatur source file audio dengan fallback CDN jika terjadi error memuat file lokal.
   */
  _setupAudioSource(audioElement, pathArray, isBGM = false) {
    let sourceIndex = 0;
    audioElement.src = pathArray[sourceIndex];

    audioElement.addEventListener('error', (e) => {
      sourceIndex++;
      if (sourceIndex < pathArray.length) {
        console.warn(`[AudioManager] File audio lokal tidak ditemukan/error. Beralih ke CDN: ${pathArray[sourceIndex]}`);
        
        // Simpan status pemutaran sebelum disetel ulang oleh load()
        const wasPaused = audioElement.paused;
        
        audioElement.src = pathArray[sourceIndex];
        audioElement.load();
        
        // Jika sebelumnya sedang berjalan (tidak paused) atau ini BGM, coba putar otomatis
        if (isBGM || !wasPaused) {
          audioElement.play().catch(err => {
            console.log('[AudioManager] Autoplay fallback CDN tertunda:', err);
          });
        }
      } else {
        console.error('[AudioManager] Semua alternatif pemuatan file audio gagal.');
      }
    }, true);
  },

  // ════════════════════════════════════════════════════════════
  //  KONTROL MUSIK LATAR (BGM)
  // ════════════════════════════════════════════════════════════

  /** Putar Musik Latar */
  playBGM() {
    this.init(); // Pastikan telah diinisialisasi
    if (!this.bgmAudio || this.isBgmMuted) return;

    this.bgmAudio.play().catch(err => {
      console.log('[AudioManager] Autoplay musik tertunda, menunggu interaksi pengguna.');
      // Pasang sekali listener klik pada dokumen untuk memulai BGM
      const startOnInteraction = () => {
        if (this.bgmAudio && !this.isBgmMuted) {
          this.bgmAudio.play().catch(e => console.warn(e));
        }
        document.removeEventListener('click', startOnInteraction);
        document.removeEventListener('keydown', startOnInteraction);
      };
      document.addEventListener('click', startOnInteraction);
      document.addEventListener('keydown', startOnInteraction);
    });
  },

  /** Hentikan Jeda BGM */
  pauseBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  },

  /** Set Volume BGM (0.0 sampai 1.0) */
  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('automaster_audio_bgm_vol', this.bgmVolume);
    
    if (this.bgmAudio && !this.isBgmMuted) {
      this.bgmAudio.volume = this.bgmVolume;
    }
  },

  /** Bisukan/Aktifkan Suara BGM */
  toggleBGMMute() {
    this.isBgmMuted = !this.isBgmMuted;
    localStorage.setItem('automaster_audio_bgm_mute', this.isBgmMuted);

    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isBgmMuted ? 0 : this.bgmVolume;
      if (this.isBgmMuted) {
        this.bgmAudio.pause();
      } else {
        this.playBGM();
      }
    }
    return this.isBgmMuted;
  },

  // ════════════════════════════════════════════════════════════
  //  KONTROL EFEK SUARA (SFX)
  // ════════════════════════════════════════════════════════════

  /** Play SFX Efek Suara berdasarkan Nama */
  playSFX(sfxName) {
    this.init(); // Pastikan diinisialisasi
    if (this.isSfxMuted) return;

    const audio = this.sfxCache[sfxName];
    if (audio) {
      // Reset pemutaran ke awal jika sedang diputar
      audio.currentTime = 0;
      audio.volume = this.sfxVolume;
      audio.play().catch(err => {
        // Abaikan error autoplay browser pada SFX
      });
    }
  },

  /** Set Volume SFX (0.0 sampai 1.0) */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('automaster_audio_sfx_vol', this.sfxVolume);

    for (const sfxName in this.sfxCache) {
      if (!this.isSfxMuted) {
        this.sfxCache[sfxName].volume = this.sfxVolume;
      }
    }
  },

  /** Bisukan/Aktifkan Suara SFX */
  toggleSFXMute() {
    this.isSfxMuted = !this.isSfxMuted;
    localStorage.setItem('automaster_audio_sfx_mute', this.isSfxMuted);

    for (const sfxName in this.sfxCache) {
      this.sfxCache[sfxName].volume = this.isSfxMuted ? 0 : this.sfxVolume;
    }
    return this.isSfxMuted;
  }
};
