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
    'https://raw.githubusercontent.com/mdn/webaudio-examples/master/audio-param/viper.mp3'
  ],

  sfxAset: {
    click: [
      'audio/click.mp3',
      'https://raw.githubusercontent.com/scottschiller/SoundManager2/master/demo/_mp3/click-low.mp3'
    ],
    correct: [
      'audio/correct.mp3',
      'https://raw.githubusercontent.com/techieshruti/Quiz-App-with-Timer/master/sounds/correct.mp3'
    ],
    wrong: [
      'audio/wrong.mp3',
      'https://raw.githubusercontent.com/techieshruti/Quiz-App-with-Timer/master/sounds/wrong.mp3'
    ],
    victory: [
      'audio/victory.mp3',
      'https://raw.githubusercontent.com/scottschiller/SoundManager2/master/demo/_mp3/button-1.mp3'
    ]
  },

  // ── Web Audio Synth Fallback (Offline & Zero-Asset) ──────────
  ctx: null,
  synthBgmGain: null,
  bgmInterval: null,
  bgmCurrentNote: 0,

  initSynth() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  },

  playSynthSFX(sfxName) {
    try {
      this.initSynth();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const time = this.ctx.currentTime;
      const vol = this.sfxVolume;

      if (sfxName === 'click') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.04);
        gain.gain.setValueAtTime(vol * 0.15, time);
        gain.gain.linearRampToValueAtTime(0.01, time + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.04);
      } else if (sfxName === 'correct') {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(523.25, time); // C5
        osc1.frequency.setValueAtTime(659.25, time + 0.08); // E5
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783.99, time + 0.16); // G5
        gain.gain.setValueAtTime(vol * 0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        osc1.start(time);
        osc1.stop(time + 0.4);
        osc2.start(time + 0.16);
        osc2.stop(time + 0.4);
      } else if (sfxName === 'wrong') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, time); // A3
        osc.frequency.linearRampToValueAtTime(110, time + 0.3); // A2
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, time);
        gain.gain.setValueAtTime(vol * 0.2, time);
        gain.gain.linearRampToValueAtTime(0.01, time + 0.3);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.3);
      } else if (sfxName === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const durations = [0.1, 0.1, 0.1, 0.35];
        const starts = [0, 0.1, 0.2, 0.3];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, time + starts[idx]);
          gain.gain.setValueAtTime(vol * 0.1, time + starts[idx]);
          gain.gain.exponentialRampToValueAtTime(0.005, time + starts[idx] + durations[idx]);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(time + starts[idx]);
          osc.stop(time + starts[idx] + durations[idx]);
        });
      }
    } catch (e) {
      console.warn('[AudioManager] Gagal memainkan synth SFX:', e);
    }
  },

  playSynthBGM() {
    try {
      this.initSynth();
      if (!this.ctx || this.bgmInterval || this.isBgmMuted) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const melody = [
        261.63, 329.63, 392.00, 329.63, // C E G E
        293.66, 349.23, 440.00, 349.23, // D F A F
        329.63, 392.00, 493.88, 392.00, // E G B G
        349.23, 440.00, 523.25, 440.00  // F A C A
      ];
      
      const tempo = 250;
      this.bgmCurrentNote = 0;
      this.synthBgmGain = this.ctx.createGain();
      this.synthBgmGain.gain.setValueAtTime(this.bgmVolume * 0.05, this.ctx.currentTime);
      this.synthBgmGain.connect(this.ctx.destination);

      this.bgmInterval = setInterval(() => {
        if (this.isBgmMuted || this.ctx.state === 'suspended') return;
        
        try {
          const time = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(melody[this.bgmCurrentNote], time);
          osc.connect(this.synthBgmGain);
          osc.start(time);
          osc.stop(time + 0.23);
          this.bgmCurrentNote = (this.bgmCurrentNote + 1) % melody.length;
        } catch (err) {
          // ignore
        }
      }, tempo);
      console.log('🎵 Retro BGM Synth dinyalakan.');
    } catch (e) {
      console.warn('[AudioManager] Gagal memainkan synth BGM:', e);
    }
  },

  stopSynthBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.synthBgmGain) {
      try {
        this.synthBgmGain.disconnect();
      } catch (e) {}
      this.synthBgmGain = null;
    }
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
        console.error('[AudioManager] Semua alternatif pemuatan file audio gagal. Beralih ke Web Audio Synth.');
        audioElement.failedToLoad = true;
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

    if (this.bgmAudio.failedToLoad) {
      this.playSynthBGM();
      return;
    }

    this.bgmAudio.play().catch(err => {
      console.log('[AudioManager] Autoplay musik tertunda, menunggu interaksi pengguna.');
      // Pasang sekali listener klik pada dokumen untuk memulai BGM
      const startOnInteraction = () => {
        if (this.bgmAudio && !this.isBgmMuted) {
          if (this.bgmAudio.failedToLoad) {
            this.playSynthBGM();
          } else {
            this.bgmAudio.play().catch(e => {
              console.warn('[AudioManager] Gagal memutar BGM, menggunakan Synth fallback.', e);
              this.playSynthBGM();
            });
          }
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
    this.stopSynthBGM();
  },

  /** Set Volume BGM (0.0 sampai 1.0) */
  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('automaster_audio_bgm_vol', this.bgmVolume);
    
    if (this.bgmAudio && !this.isBgmMuted) {
      this.bgmAudio.volume = this.bgmVolume;
    }
    if (this.synthBgmGain) {
      this.synthBgmGain.gain.setValueAtTime(this.bgmVolume * 0.05, this.ctx ? this.ctx.currentTime : 0);
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
        this.stopSynthBGM();
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
      if (audio.failedToLoad) {
        this.playSynthSFX(sfxName);
        return;
      }
      // Reset pemutaran ke awal jika sedang diputar
      audio.currentTime = 0;
      audio.volume = this.sfxVolume;
      audio.play().catch(err => {
        // Fallback ke synth jika play() diblokir atau gagal
        console.warn(`[AudioManager] Gagal memutar SFX ${sfxName}, mencoba Synth fallback.`, err);
        this.playSynthSFX(sfxName);
      });
    } else {
      this.playSynthSFX(sfxName);
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
