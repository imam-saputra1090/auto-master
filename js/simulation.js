/**
 * ============================================================
 * AutoMaster — Bengkel Virtual
 * simulation.js — Mesin Simulasi Drag & Drop
 * ============================================================
 * Mengelola simulasi interaktif pemasangan komponen:
 * - Drag & drop dengan mouse (desktop)
 * - Touch drag dengan sentuhan (mobile/tablet)
 * - Pengecekan penempatan benar/salah
 * - Feedback visual dan edukatif
 * - Penghitungan skor simulasi
 * ============================================================
 */

const SimulationEngine = {

  // ── State simulasi aktif ───────────────────────────────────
  currentLevel: null,       // ID level aktif
  components: [],           // Komponen yang harus ditempatkan
  dropZones: [],            // Zona target penempatan
  placedCount: 0,           // Jumlah komponen yang sudah ditempatkan
  correctCount: 0,          // Jumlah penempatan yang benar
  totalComponents: 0,       // Total komponen
  draggedElement: null,     // Elemen yang sedang di-drag
  draggedComponentId: null, // ID komponen yang sedang di-drag

  // Touch-specific state
  _touchClone: null,        // Klon visual untuk touch drag
  _touchOffsetX: 0,         // Offset sentuhan X
  _touchOffsetY: 0,         // Offset sentuhan Y
  _touchStartX: 0,          // Posisi awal sentuhan X
  _touchStartY: 0,          // Posisi awal sentuhan Y

  // ════════════════════════════════════════════════════════════
  //  MEMULAI SIMULASI
  // ════════════════════════════════════════════════════════════

  /**
   * Memulai simulasi untuk level tertentu.
   * @param {number} levelId — ID level (1–6)
   */
  start(levelId) {
    this.currentLevel = levelId;
    this.placedCount = 0;
    this.correctCount = 0;
    this.draggedElement = null;
    this.draggedComponentId = null;
    this._touchClone = null;

    // Ambil data simulasi dari GAME_DATA
    let simData = null;
    if (typeof GAME_DATA !== 'undefined' && GAME_DATA.levels && GAME_DATA.levels[levelId - 1]) {
      simData = GAME_DATA.levels[levelId - 1].simulation;
    }

    if (!simData) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('⚠️ Data simulasi belum tersedia untuk level ini.', 'warning');
      }
      return;
    }

    this.components = JSON.parse(JSON.stringify(simData.components || []));
    this.dropZones = JSON.parse(JSON.stringify(simData.dropZones || []));
    this.totalComponents = this.components.length;

    // Tampilkan instruksi
    const instructionEl = document.getElementById('sim-instruction');
    if (instructionEl) {
      instructionEl.textContent = simData.instruction || 'Seret komponen ke posisi yang benar.';
    }

    // Update skor awal
    this._updateScoreDisplay();

    // Sembunyikan tombol finish
    const btnFinish = document.getElementById('btn-sim-finish');
    if (btnFinish) {
      btnFinish.style.display = 'none';
    }

    // Inject background schematic
    this.injectBackground(levelId);

    // Buat komponen dan zona
    this.createComponents();
    this.createDropZones();

    // Tampilkan layar simulasi
    if (typeof App !== 'undefined' && App.showScreen) {
      App.showScreen('simulate');
    }

    // Bersihkan feedback
    this._clearFeedback();
  },

  /**
   * Menyisipkan SVG latar belakang (schematic/blueprint) ke workspace
   * @param {number} levelId — ID level aktif
   */
  injectBackground(levelId) {
    const workspace = document.getElementById('sim-workspace');
    if (!workspace) return;

    // Bersihkan SVG lama jika ada
    const existingBg = workspace.querySelector('.sim-bg-svg');
    if (existingBg) {
      existingBg.remove();
    }

    let svgContent = '';

    if (levelId === 2) {
      // Level 2: Engine Cylinder Cross-section Blueprint
      svgContent = `
<svg class="sim-bg-svg" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="sim-grid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--glass-border)" stroke-width="0.15" />
    </pattern>
  </defs>
  <!-- Grid Background -->
  <rect width="100" height="100" fill="url(#sim-grid)" opacity="0.4" />
  
  <!-- Outer block outline -->
  <path d="M 25,8 L 75,8 L 75,25 L 63,25 L 63,55 A 18,18 0 1,1 37,55 L 37,25 L 25,25 Z" fill="none" stroke="var(--text-muted)" stroke-width="0.5" opacity="0.25" />
  
  <!-- Cylinder Bore Inner Walls -->
  <line x1="40" y1="25" x2="40" y2="55" stroke="var(--text-muted)" stroke-width="0.4" opacity="0.3" />
  <line x1="60" y1="25" x2="60" y2="55" stroke="var(--text-muted)" stroke-width="0.4" opacity="0.3" />
  
  <!-- Crankcase Inner circle -->
  <circle cx="50" cy="73" r="15" fill="none" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
  <circle cx="50" cy="73" r="3" fill="none" stroke="var(--clr-primary)" stroke-width="0.4" opacity="0.3" />
  
  <!-- Intake Manifold Port (Left) -->
  <path d="M 15,22 C 28,22 35,24 40,25" fill="none" stroke="var(--clr-accent)" stroke-width="0.4" opacity="0.3" />
  <path d="M 15,17 C 26,17 34,18 40,20" fill="none" stroke="var(--clr-accent)" stroke-width="0.4" opacity="0.3" />
  
  <!-- Exhaust Manifold Port (Right) -->
  <path d="M 85,22 C 72,22 65,24 60,25" fill="none" stroke="var(--clr-warning)" stroke-width="0.4" opacity="0.3" />
  <path d="M 85,17 C 74,17 66,18 60,20" fill="none" stroke="var(--clr-warning)" stroke-width="0.4" opacity="0.3" />

  <!-- Spark Plug Port (Top Center) -->
  <rect x="47" y="8" width="6" height="10" rx="0.5" fill="none" stroke="var(--text-muted)" stroke-width="0.4" opacity="0.3" />
  <line x1="50" y1="8" x2="50" y2="18" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.25" />

  <!-- Centerline guide -->
  <line x1="50" y1="8" x2="50" y2="92" stroke="var(--text-muted)" stroke-width="0.25" stroke-dasharray="1 1" opacity="0.2" />
  
  <!-- Cooling Fins -->
  <line x1="28" y1="30" x2="37" y2="30" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
  <line x1="28" y1="36" x2="37" y2="36" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
  <line x1="28" y1="42" x2="37" y2="42" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
  <line x1="28" y1="48" x2="37" y2="48" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
  <line x1="63" y1="30" x2="72" y2="30" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
  <line x1="63" y1="36" x2="72" y2="36" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
  <line x1="63" y1="42" x2="72" y2="42" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
  <line x1="63" y1="48" x2="72" y2="48" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
</svg>
      `;
    } else {
      // Levels 1, 3, 4, 5, 6: Side-view Vehicle Chassis Blueprint
      svgContent = `
<svg class="sim-bg-svg" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="sim-grid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--glass-border)" stroke-width="0.15" />
    </pattern>
  </defs>
  <!-- Grid Background -->
  <rect width="100" height="100" fill="url(#sim-grid)" opacity="0.4" />
  
  <!-- Ground reference line -->
  <line x1="2" y1="58" x2="98" y2="58" stroke="var(--text-muted)" stroke-width="0.3" stroke-dasharray="0.5 0.5" opacity="0.3" />
  
  <!-- Vehicle Body Contour -->
  <path d="M 5,50 L 5,40 C 5,38 7,37 10,37 L 24,37 C 26,37 28,34 30,30 L 38,18 C 40,15 43,15 46,15 L 70,15 C 73,15 75,16 77,20 L 84,32 L 93,32 C 95,32 96,34 96,36 L 96,50 C 96,52 95,53 93,53 L 89,53 C 89,45 77,45 77,53 L 24,53 C 24,45 12,45 12,53 L 7,53 C 5,53 5,52 5,50 Z" fill="none" stroke="var(--text-muted)" stroke-width="0.5" opacity="0.3" />
  
  <!-- Wheels -->
  <!-- Front Wheel -->
  <circle cx="18" cy="53" r="5.5" fill="none" stroke="var(--text-muted)" stroke-width="0.4" opacity="0.25" />
  <circle cx="18" cy="53" r="2" fill="none" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
  <circle cx="18" cy="53" r="0.5" fill="var(--text-muted)" opacity="0.2" />
  <!-- Rear Wheel -->
  <circle cx="83" cy="53" r="5.5" fill="none" stroke="var(--text-muted)" stroke-width="0.4" opacity="0.25" />
  <circle cx="83" cy="53" r="2" fill="none" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.2" />
  <circle cx="83" cy="53" r="0.5" fill="var(--text-muted)" opacity="0.2" />
  
  <!-- Firewall (Cabin Divider) -->
  <line x1="48" y1="16" x2="48" y2="53" stroke="var(--text-muted)" stroke-width="0.4" opacity="0.35" stroke-dasharray="1 1" />
  
  <!-- Steering Wheel & Column -->
  <line x1="56" y1="36" x2="52" y2="44" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.25" />
  <ellipse cx="56" cy="36" rx="2" ry="0.8" transform="rotate(-30, 56, 36)" fill="none" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.25" />
  
  <!-- Underbelly line / exhaust pipe -->
  <path d="M 38,48 L 72,48 C 74,48 75,49 76,51 L 78,51" fill="none" stroke="var(--text-muted)" stroke-width="0.25" opacity="0.2" />
  <rect x="71" y="46" width="6" height="3" rx="0.5" fill="none" stroke="var(--text-muted)" stroke-width="0.25" opacity="0.2" />

  <!-- Engine Block Box (Front) -->
  <rect x="23" y="32" width="15" height="15" rx="1" fill="none" stroke="var(--clr-primary)" stroke-width="0.35" opacity="0.25" />
  
  <!-- Radiator Box (Front-most) -->
  <rect x="7" y="34" width="3" height="13" rx="0.5" fill="none" stroke="var(--clr-accent)" stroke-width="0.35" opacity="0.25" stroke-dasharray="0.5 0.5" />
  
  <!-- Fuel Tank Box (Rear) -->
  <rect x="78" y="43" width="10" height="6" rx="0.5" fill="none" stroke="var(--clr-warning)" stroke-width="0.35" opacity="0.25" />
</svg>
      `;
    }

    workspace.insertAdjacentHTML('afterbegin', svgContent);
  },

  // ════════════════════════════════════════════════════════════
  //  PEMBUATAN KOMPONEN DRAGGABLE
  // ════════════════════════════════════════════════════════════

  /**
   * Membuat kartu komponen yang bisa di-drag di toolbox.
   */
  createComponents() {
    const toolbox = document.getElementById('sim-toolbox');
    if (!toolbox) return;

    toolbox.innerHTML = '';

    // Acak urutan komponen agar lebih menantang
    const shuffled = this._shuffleArray([...this.components]);

    shuffled.forEach(component => {
      const card = document.createElement('div');
      card.className = 'draggable component-card';
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-component-id', component.id);

      // Tampilan ikon dan nama komponen
      const icon = component.icon || '🔩';
      card.innerHTML = `
        <span class="component-icon">${icon}</span>
        <span class="component-name">${component.name || 'Komponen'}</span>
      `;

      // ── Event Desktop (Mouse Drag) ──
      card.addEventListener('dragstart', (e) => this.handleDragStart(e, component.id));
      card.addEventListener('dragend', (e) => this.handleDragEnd(e));

      // ── Event Mobile (Touch Drag) ──
      card.addEventListener('touchstart', (e) => this.handleTouchStart(e, component.id), { passive: false });
      card.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
      card.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

      toolbox.appendChild(card);
    });
  },

  // ════════════════════════════════════════════════════════════
  //  PEMBUATAN DROP ZONES
  // ════════════════════════════════════════════════════════════

  /**
   * Membuat zona-zona penempatan di workspace.
   */
  createDropZones() {
    const workspace = document.getElementById('sim-workspace');
    if (!workspace) return;

    // Bersihkan zona lama tapi pertahankan elemen lain (background, dll)
    const existingZones = workspace.querySelectorAll('.drop-zone');
    existingZones.forEach(z => z.remove());

    this.dropZones.forEach(zone => {
      const zoneEl = document.createElement('div');
      zoneEl.className = 'drop-zone';
      zoneEl.setAttribute('data-zone-id', zone.id);

      // Posisi berdasarkan persentase
      if (zone.x !== undefined && zone.y !== undefined) {
        zoneEl.style.left = zone.x + '%';
        zoneEl.style.top = zone.y + '%';
      }

      // Ukuran kustom jika ada
      if (zone.width) zoneEl.style.width = zone.width;
      if (zone.height) zoneEl.style.height = zone.height;

      // Label zona
      zoneEl.innerHTML = `<span class="zone-label">${zone.label || zone.name || '?'}</span>`;

      // ── Event Desktop (Drop) ──
      zoneEl.addEventListener('dragover', (e) => this.handleDragOver(e));
      zoneEl.addEventListener('dragenter', (e) => this.handleDragEnter(e));
      zoneEl.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      zoneEl.addEventListener('drop', (e) => this.handleDrop(e));

      workspace.appendChild(zoneEl);
    });
  },

  // ════════════════════════════════════════════════════════════
  //  EVENT HANDLER — DESKTOP DRAG & DROP
  // ════════════════════════════════════════════════════════════

  /**
   * Menangani awal drag (mouse).
   * @param {DragEvent} e
   * @param {string} componentId — ID komponen yang di-drag
   */
  handleDragStart(e, componentId) {
    this.draggedElement = e.target.closest('.component-card');
    this.draggedComponentId = componentId;

    if (this.draggedElement) {
      this.draggedElement.classList.add('dragging');
    }

    // Simpan ID komponen di dataTransfer
    e.dataTransfer.setData('text/plain', componentId);
    e.dataTransfer.effectAllowed = 'move';
  },

  /**
   * Menangani akhir drag (mouse).
   * @param {DragEvent} e
   */
  handleDragEnd(e) {
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
    }
    this.draggedElement = null;
    this.draggedComponentId = null;

    // Hapus semua highlight drag-over
    document.querySelectorAll('.drop-zone.drag-over').forEach(zone => {
      zone.classList.remove('drag-over');
    });
  },

  /**
   * Menangani dragover di zona drop (izinkan drop).
   * @param {DragEvent} e
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  },

  /**
   * Menangani dragenter di zona drop (highlight visual).
   * @param {DragEvent} e
   */
  handleDragEnter(e) {
    e.preventDefault();
    const zone = e.target.closest('.drop-zone');
    if (zone && !zone.classList.contains('placed-correct')) {
      zone.classList.add('drag-over');
    }
  },

  /**
   * Menangani dragleave dari zona drop (hapus highlight).
   * @param {DragEvent} e
   */
  handleDragLeave(e) {
    const zone = e.target.closest('.drop-zone');
    if (zone) {
      zone.classList.remove('drag-over');
    }
  },

  /**
   * Menangani drop di zona target.
   * @param {DragEvent} e
   */
  handleDrop(e) {
    e.preventDefault();

    const zone = e.target.closest('.drop-zone');
    if (!zone) return;

    zone.classList.remove('drag-over');

    // Jangan terima drop di zona yang sudah terisi
    if (zone.classList.contains('placed-correct')) return;

    const componentId = e.dataTransfer.getData('text/plain');
    const zoneId = zone.getAttribute('data-zone-id');

    this._processPlacement(componentId, zoneId, zone);
  },

  // ════════════════════════════════════════════════════════════
  //  EVENT HANDLER — MOBILE TOUCH
  // ════════════════════════════════════════════════════════════

  /**
   * Menangani touchstart — memulai drag sentuh.
   * @param {TouchEvent} e
   * @param {string} componentId — ID komponen
   */
  handleTouchStart(e, componentId) {
    // Cegah scroll saat drag
    e.preventDefault();

    const touch = e.touches[0];
    this.draggedElement = e.target.closest('.component-card');
    this.draggedComponentId = componentId;

    if (!this.draggedElement) return;

    // Simpan posisi awal
    const rect = this.draggedElement.getBoundingClientRect();
    this._touchOffsetX = touch.clientX - rect.left;
    this._touchOffsetY = touch.clientY - rect.top;
    this._touchStartX = touch.clientX;
    this._touchStartY = touch.clientY;

    // Buat klon visual untuk mengikuti jari
    this._touchClone = this.draggedElement.cloneNode(true);
    this._touchClone.className = 'draggable component-card touch-clone';
    this._touchClone.style.cssText = `
      position: fixed;
      z-index: 10000;
      pointer-events: none;
      opacity: 0.85;
      transform: scale(1.1);
      transition: none;
      left: ${touch.clientX - this._touchOffsetX}px;
      top: ${touch.clientY - this._touchOffsetY}px;
      width: ${rect.width}px;
    `;
    document.body.appendChild(this._touchClone);

    // Tambah class dragging pada elemen asli
    this.draggedElement.classList.add('dragging');
  },

  /**
   * Menangani touchmove — memindahkan klon mengikuti jari.
   * @param {TouchEvent} e
   */
  handleTouchMove(e) {
    e.preventDefault();

    if (!this._touchClone) return;

    const touch = e.touches[0];

    // Pindahkan klon
    this._touchClone.style.left = (touch.clientX - this._touchOffsetX) + 'px';
    this._touchClone.style.top = (touch.clientY - this._touchOffsetY) + 'px';

    // Highlight zona drop di bawah jari
    this._highlightZoneAtPoint(touch.clientX, touch.clientY);
  },

  /**
   * Menangani touchend — mendeteksi zona drop dan memproses penempatan.
   * @param {TouchEvent} e
   */
  handleTouchEnd(e) {
    e.preventDefault();

    // Hapus klon visual
    if (this._touchClone) {
      this._touchClone.remove();
      this._touchClone = null;
    }

    // Hapus class dragging
    if (this.draggedElement) {
      this.draggedElement.classList.remove('dragging');
    }

    // Hapus semua highlight zona
    document.querySelectorAll('.drop-zone.drag-over').forEach(zone => {
      zone.classList.remove('drag-over');
    });

    if (!this.draggedComponentId) return;

    // Deteksi zona drop di posisi akhir sentuhan
    const touch = e.changedTouches[0];
    const dropZone = this._findZoneAtPoint(touch.clientX, touch.clientY);

    if (dropZone && !dropZone.classList.contains('placed-correct')) {
      const zoneId = dropZone.getAttribute('data-zone-id');
      this._processPlacement(this.draggedComponentId, zoneId, dropZone);
    }

    this.draggedElement = null;
    this.draggedComponentId = null;
  },

  /**
   * Menandai zona drop di titik layar tertentu.
   * @param {number} x — Koordinat X layar
   * @param {number} y — Koordinat Y layar
   */
  _highlightZoneAtPoint(x, y) {
    // Hapus semua highlight sebelumnya
    document.querySelectorAll('.drop-zone.drag-over').forEach(zone => {
      zone.classList.remove('drag-over');
    });

    const zone = this._findZoneAtPoint(x, y);
    if (zone && !zone.classList.contains('placed-correct')) {
      zone.classList.add('drag-over');
    }
  },

  /**
   * Mencari zona drop di titik layar tertentu.
   * @param {number} x — Koordinat X layar
   * @param {number} y — Koordinat Y layar
   * @returns {Element|null}
   */
  _findZoneAtPoint(x, y) {
    const zones = document.querySelectorAll('.drop-zone');
    for (const zone of zones) {
      const rect = zone.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return zone;
      }
    }
    return null;
  },

  // ════════════════════════════════════════════════════════════
  //  LOGIKA PENEMPATAN
  // ════════════════════════════════════════════════════════════

  /**
   * Memproses penempatan komponen ke zona.
   * @param {string} componentId — ID komponen yang diletakkan
   * @param {string} zoneId — ID zona target
   * @param {Element} zoneEl — Elemen DOM zona
   */
  _processPlacement(componentId, zoneId, zoneEl) {
    // Cari data komponen
    const component = this.components.find(c => c.id === componentId);
    if (!component) return;

    // Cek apakah penempatan benar
    const isCorrect = component.correctZone === zoneId;

    if (isCorrect) {
      // ── BENAR: Tempatkan komponen ──
      zoneEl.classList.add('placed-correct');
      zoneEl.classList.remove('drag-over');

      // Tampilkan nama komponen di zona
      const icon = component.icon || '✅';
      zoneEl.innerHTML = `
        <span class="zone-placed-icon">${icon}</span>
        <span class="zone-placed-name">${component.name}</span>
      `;

      // Hapus komponen dari toolbox
      const toolbox = document.getElementById('sim-toolbox');
      if (toolbox) {
        const card = toolbox.querySelector(`[data-component-id="${componentId}"]`);
        if (card) {
          card.classList.add('placed-away');
          setTimeout(() => card.remove(), 300);
        }
      }

      this.correctCount++;
      this.placedCount++;

      // Feedback positif
      this.showFeedback(true, component.name, component.description || 'Penempatan benar!');

      // Animasi berhasil
      zoneEl.classList.add('place-success');
      setTimeout(() => zoneEl.classList.remove('place-success'), 600);

    } else {
      // ── SALAH: Animasi penolakan ──
      zoneEl.classList.add('placed-wrong');
      setTimeout(() => zoneEl.classList.remove('placed-wrong'), 600);

      // Cari nama zona yang benar untuk hint
      const correctZoneData = this.dropZones.find(z => z.id === component.correctZone);
      const hint = correctZoneData
        ? `Coba tempatkan "${component.name}" di zona "${correctZoneData.label || correctZoneData.name}".`
        : `"${component.name}" tidak tepat di sini. Coba posisi lain!`;

      // Feedback negatif dengan petunjuk
      this.showFeedback(false, component.name, hint);
    }

    // Update tampilan skor
    this._updateScoreDisplay();

    // Cek apakah semua komponen sudah ditempatkan dengan benar
    if (this.correctCount >= this.totalComponents) {
      this._onAllPlaced();
    }
  },

  /**
   * Dipanggil ketika semua komponen sudah ditempatkan dengan benar.
   */
  _onAllPlaced() {
    // Tampilkan tombol selesai
    const btnFinish = document.getElementById('btn-sim-finish');
    if (btnFinish) {
      btnFinish.style.display = 'inline-block';
    }

    // Feedback "semua terpasang"
    this.showFeedback(true, 'Selesai!', '🎉 Semua komponen berhasil dipasang! Tekan tombol "Selesai" untuk melihat hasil.');
  },

  // ════════════════════════════════════════════════════════════
  //  MENYELESAIKAN SIMULASI
  // ════════════════════════════════════════════════════════════

  /**
   * Mengakhiri simulasi, menghitung skor, dan menampilkan hasil.
   */
  finish() {
    // Hitung skor
    const score = this.totalComponents > 0
      ? Math.round((this.correctCount / this.totalComponents) * 100)
      : 0;

    // Simpan ke ProgressManager
    let simResult = { xpResult: { newXP: 0 } };
    if (typeof ProgressManager !== 'undefined' && ProgressManager.completeSim) {
      simResult = ProgressManager.completeSim(this.currentLevel, score);

      // Cek pencapaian
      if (ProgressManager.checkAchievements) {
        const newAchievements = ProgressManager.checkAchievements();
        if (newAchievements.length > 0 && typeof App !== 'undefined' && App.showAchievement) {
          newAchievements.forEach((ach, idx) => {
            setTimeout(() => App.showAchievement(ach), (idx + 1) * 1500);
          });
        }
      }
    }

    // Tampilkan hasil melalui App
    if (typeof App !== 'undefined' && App.showResults) {
      App.showResults({
        phase: 'simulation',
        score: this.correctCount,
        total: this.totalComponents,
        percentage: score,
        stars: score >= 90 ? 3 : score >= 70 ? 2 : score >= 50 ? 1 : 0,
        xpEarned: score,
        levelId: this.currentLevel
      });
    }
  },

  // ════════════════════════════════════════════════════════════
  //  FEEDBACK
  // ════════════════════════════════════════════════════════════

  /**
   * Menampilkan feedback penempatan komponen.
   * @param {boolean} isCorrect — Apakah penempatan benar
   * @param {string} componentName — Nama komponen
   * @param {string} description — Deskripsi/penjelasan
   */
  showFeedback(isCorrect, componentName, description) {
    const feedbackEl = document.getElementById('sim-feedback');
    if (!feedbackEl) return;

    const icon = isCorrect ? '✅' : '❌';
    const statusClass = isCorrect ? 'sim-feedback-correct' : 'sim-feedback-wrong';

    feedbackEl.innerHTML = `
      <div class="sim-feedback-card ${statusClass}">
        <div class="sim-feedback-header">
          <span class="sim-feedback-icon">${icon}</span>
          <strong>${componentName}</strong>
        </div>
        <p class="sim-feedback-text">${description}</p>
      </div>
    `;

    feedbackEl.style.display = 'block';
    feedbackEl.classList.add('feedback-show');

    // Auto-hide setelah 3 detik (lebih lama untuk penjelasan)
    clearTimeout(this._feedbackTimeout);
    this._feedbackTimeout = setTimeout(() => {
      feedbackEl.classList.remove('feedback-show');
      setTimeout(() => {
        feedbackEl.style.display = 'none';
      }, 300);
    }, 3000);
  },

  /**
   * Membersihkan area feedback.
   */
  _clearFeedback() {
    const feedbackEl = document.getElementById('sim-feedback');
    if (feedbackEl) {
      feedbackEl.innerHTML = '';
      feedbackEl.style.display = 'none';
    }
  },

  // ════════════════════════════════════════════════════════════
  //  UPDATE SKOR TAMPILAN
  // ════════════════════════════════════════════════════════════

  /**
   * Memperbarui tampilan skor di layar simulasi.
   */
  _updateScoreDisplay() {
    const scoreEl = document.getElementById('sim-score');
    if (scoreEl) {
      scoreEl.textContent = `${this.correctCount} / ${this.totalComponents} komponen terpasang`;
    }
  },

  // ════════════════════════════════════════════════════════════
  //  RESET
  // ════════════════════════════════════════════════════════════

  /**
   * Mereset seluruh simulasi ke kondisi awal.
   */
  reset() {
    this.placedCount = 0;
    this.correctCount = 0;
    this.draggedElement = null;
    this.draggedComponentId = null;

    // Hapus klon touch jika ada
    if (this._touchClone) {
      this._touchClone.remove();
      this._touchClone = null;
    }

    // Rebuild jika ada data
    if (this.currentLevel) {
      this.createComponents();
      this.createDropZones();
      this._updateScoreDisplay();
      this._clearFeedback();
    }

    // Sembunyikan tombol selesai
    const btnFinish = document.getElementById('btn-sim-finish');
    if (btnFinish) btnFinish.style.display = 'none';
  },

  // ════════════════════════════════════════════════════════════
  //  UTILITAS
  // ════════════════════════════════════════════════════════════

  /**
   * Mengacak urutan elemen dalam array (Fisher-Yates shuffle).
   * @param {Array} array — Array yang akan diacak
   * @returns {Array} — Array yang sudah diacak
   */
  _shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
};
