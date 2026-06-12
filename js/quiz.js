/**
 * ============================================================
 * AutoMaster — Bengkel Virtual
 * quiz.js — Mesin Kuis Interaktif
 * ============================================================
 * Mengelola seluruh logika kuis termasuk:
 * - Pengacakan dan penampilan soal
 * - Sistem timer dengan countdown
 * - Pemilihan jawaban dengan feedback visual
 * - Perhitungan skor dan penilaian bintang
 * ============================================================
 */

const QuizEngine = {

  // ── State kuis aktif ───────────────────────────────────────
  currentQuiz: null,      // Array soal-soal kuis
  currentIndex: 0,        // Indeks soal saat ini
  currentLevelId: null,   // ID level aktif
  score: 0,               // Jumlah jawaban benar
  answers: [],            // Riwayat semua jawaban
  timerInterval: null,    // ID interval timer
  timeRemaining: 0,       // Waktu tersisa (detik)
  isAnswered: false,      // Apakah soal sudah dijawab

  // ════════════════════════════════════════════════════════════
  //  MEMULAI KUIS
  // ════════════════════════════════════════════════════════════

  /**
   * Memulai kuis untuk level tertentu.
   * @param {number} levelId — ID level (1–6)
   */
  start(levelId) {
    this.currentLevelId = levelId;

    // Ambil data soal dari GAME_DATA
    let questions = [];
    if (typeof GAME_DATA !== 'undefined' && GAME_DATA.levels && GAME_DATA.levels[levelId - 1]) {
      const levelData = GAME_DATA.levels[levelId - 1];
      if (levelData.quiz && Array.isArray(levelData.quiz)) {
        questions = JSON.parse(JSON.stringify(levelData.quiz));
      }
    }

    // Jika tidak ada soal, tampilkan pesan
    if (questions.length === 0) {
      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('⚠️ Data kuis belum tersedia untuk level ini.', 'warning');
      }
      return;
    }

    // Acak urutan soal untuk replayability
    this.currentQuiz = this._shuffleArray(questions);
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
    this.isAnswered = false;

    // Hitung waktu: 30 detik per soal
    this.timeRemaining = this.currentQuiz.length * 30;

    // Tampilkan layar kuis
    if (typeof App !== 'undefined' && App.showScreen) {
      App.showScreen('quiz');
    }

    // Sembunyikan tombol next
    const btnNext = document.getElementById('btn-quiz-next');
    if (btnNext) btnNext.style.display = 'none';

    // Render soal pertama
    this.renderQuestion();

    // Mulai timer
    this.startTimer();
  },

  // ════════════════════════════════════════════════════════════
  //  RENDER SOAL
  // ════════════════════════════════════════════════════════════

  /**
   * Menampilkan soal saat ini beserta pilihan jawaban.
   */
  renderQuestion() {
    if (!this.currentQuiz || this.currentIndex >= this.currentQuiz.length) return;

    const question = this.currentQuiz[this.currentIndex];
    this.isAnswered = false;

    // ── Update counter soal ──
    const counter = document.getElementById('quiz-counter');
    if (counter) {
      counter.textContent = `Soal ${this.currentIndex + 1} dari ${this.currentQuiz.length}`;
    }

    // ── Set pertanyaan ──
    const questionEl = document.getElementById('quiz-question');
    if (questionEl) {
      questionEl.textContent = question.question || question.text || '';
    }

    // ── Set gambar (jika ada) ──
    const imageEl = document.getElementById('quiz-image');
    if (imageEl) {
      if (question.image) {
        imageEl.src = question.image;
        imageEl.alt = 'Gambar soal';
        imageEl.style.display = 'block';
      } else {
        imageEl.style.display = 'none';
        imageEl.src = '';
      }
    }

    // ── Buat pilihan jawaban ──
    const optionsContainer = document.getElementById('quiz-options');
    if (optionsContainer) {
      optionsContainer.innerHTML = '';

      const options = question.options || [];
      options.forEach((option, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.setAttribute('data-index', idx);
        btn.textContent = option;

        // Event handler klik jawaban
        btn.addEventListener('click', () => {
          if (!this.isAnswered) {
            this.selectAnswer(idx);
          }
        });

        optionsContainer.appendChild(btn);
      });
    }

    // ── Sembunyikan feedback dan tombol next ──
    const feedback = document.getElementById('quiz-feedback');
    if (feedback) {
      feedback.style.display = 'none';
      feedback.innerHTML = '';
    }

    const btnNext = document.getElementById('btn-quiz-next');
    if (btnNext) btnNext.style.display = 'none';
  },

  // ════════════════════════════════════════════════════════════
  //  PEMILIHAN JAWABAN
  // ════════════════════════════════════════════════════════════

  /**
   * Memproses jawaban yang dipilih pemain.
   * @param {number} selectedIndex — Indeks jawaban yang dipilih (0–3)
   */
  selectAnswer(selectedIndex) {
    if (this.isAnswered || !this.currentQuiz) return;
    this.isAnswered = true;

    const question = this.currentQuiz[this.currentIndex];
    const correctIndex = question.correct !== undefined ? question.correct : question.answer;
    const isCorrect = selectedIndex === correctIndex;

    // Update skor
    if (isCorrect) {
      this.score++;
    }

    // Simpan jawaban
    this.answers.push({
      questionIndex: this.currentIndex,
      selected: selectedIndex,
      correct: correctIndex,
      isCorrect: isCorrect
    });

    // ── Feedback visual pada tombol jawaban ──
    const optionButtons = document.querySelectorAll('#quiz-options .quiz-option');
    optionButtons.forEach((btn, idx) => {
      // Nonaktifkan semua tombol
      btn.disabled = true;
      btn.style.pointerEvents = 'none';

      if (idx === correctIndex) {
        btn.classList.add('correct');
      }
      if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('wrong');
      }
    });

    // ── Tampilkan feedback penjelasan ──
    const feedback = document.getElementById('quiz-feedback');
    if (feedback) {
      const explanation = question.explanation || question.feedback || '';
      const icon = isCorrect ? '✅' : '❌';
      const statusText = isCorrect ? 'Benar!' : 'Salah!';
      const correctAnswer = question.options ? question.options[correctIndex] : '';

      let feedbackHTML = `<div class="feedback-status ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}">`;
      feedbackHTML += `<span class="feedback-icon">${icon}</span>`;
      feedbackHTML += `<strong>${statusText}</strong>`;
      if (!isCorrect && correctAnswer) {
        feedbackHTML += `<br><span class="feedback-answer">Jawaban benar: ${correctAnswer}</span>`;
      }
      if (explanation) {
        feedbackHTML += `<p class="feedback-explanation">${explanation}</p>`;
      }
      feedbackHTML += '</div>';

      feedback.innerHTML = feedbackHTML;
      feedback.style.display = 'block';
    }

    // ── Tampilkan tombol Next ──
    const btnNext = document.getElementById('btn-quiz-next');
    if (btnNext) {
      if (this.currentIndex < this.currentQuiz.length - 1) {
        btnNext.textContent = 'Soal Berikutnya →';
      } else {
        btnNext.textContent = 'Lihat Hasil 📊';
      }
      btnNext.style.display = 'inline-block';
    }
  },

  // ════════════════════════════════════════════════════════════
  //  NAVIGASI SOAL
  // ════════════════════════════════════════════════════════════

  /**
   * Lanjut ke soal berikutnya atau selesaikan kuis.
   */
  nextQuestion() {
    if (!this.currentQuiz) return;

    if (this.currentIndex < this.currentQuiz.length - 1) {
      this.currentIndex++;
      this.renderQuestion();
    } else {
      this.finish();
    }
  },

  // ════════════════════════════════════════════════════════════
  //  MENYELESAIKAN KUIS
  // ════════════════════════════════════════════════════════════

  /**
   * Mengakhiri kuis, menghitung skor, dan menampilkan hasil.
   */
  finish() {
    // Hentikan timer
    this.stopTimer();

    if (!this.currentQuiz) return;

    const total = this.currentQuiz.length;
    const percentage = total > 0 ? Math.round((this.score / total) * 100) : 0;

    // Simpan ke ProgressManager
    let quizResult = { stars: 0, xpEarned: 50 };
    if (typeof ProgressManager !== 'undefined' && ProgressManager.completeQuiz) {
      quizResult = ProgressManager.completeQuiz(this.currentLevelId, this.score, total);

      // Coba buka level berikutnya
      ProgressManager.unlockNextLevel(this.currentLevelId);

      // Periksa pencapaian baru
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
        phase: 'quiz',
        score: this.score,
        total: total,
        percentage: percentage,
        stars: quizResult.stars || 0,
        xpEarned: quizResult.xpEarned || 50,
        levelId: this.currentLevelId,
        answers: this.answers
      });
    }
  },

  // ════════════════════════════════════════════════════════════
  //  SISTEM TIMER
  // ════════════════════════════════════════════════════════════

  /**
   * Memulai countdown timer.
   */
  startTimer() {
    this.stopTimer(); // Pastikan timer sebelumnya dihentikan
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 1000);
  },

  /**
   * Update timer setiap detik.
   */
  updateTimer() {
    this.timeRemaining--;

    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.updateTimerDisplay();
      // Waktu habis — otomatis selesaikan kuis
      this.finish();

      if (typeof App !== 'undefined' && App.showToast) {
        App.showToast('⏰ Waktu habis! Kuis otomatis diselesaikan.', 'warning');
      }
      return;
    }

    this.updateTimerDisplay();
  },

  /**
   * Memperbarui tampilan timer di layar (format MM:SS).
   */
  updateTimerDisplay() {
    const timerEl = document.getElementById('quiz-timer');
    if (!timerEl) return;

    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    timerEl.textContent = formatted;

    // Peringatan visual saat waktu hampir habis
    if (this.timeRemaining <= 30) {
      timerEl.classList.add('timer-danger');
    } else if (this.timeRemaining <= 60) {
      timerEl.classList.add('timer-warning');
      timerEl.classList.remove('timer-danger');
    } else {
      timerEl.classList.remove('timer-warning', 'timer-danger');
    }
  },

  /**
   * Menghentikan timer.
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
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
