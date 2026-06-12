// ============================================================================
// GAME_DATA — AutoMaster: Bengkel Virtual
// Kurikulum Merdeka — Kelas X TKR (Fase E)
// Dasar-Dasar Teknik Otomotif
// ============================================================================
// Elemen 1: Proses bisnis dan K3 bidang otomotif
// Elemen 4: Dasar-dasar komponen otomotif (fungsi, letak, bentuk)
// Elemen 6: Alat ukur dasar otomotif
// ============================================================================

const GAME_DATA = {

  // =====================================================================
  // LEVELS
  // =====================================================================
  levels: [

    // ===================================================================
    // LEVEL 1 — SISTEM REM (Brake System)
    // ===================================================================
    {
      id: 1,
      title: "Sistem Rem",
      subtitle: "Brake System",
      icon: "🔴",
      color: "#ef4444",
      description: "Pelajari komponen-komponen sistem rem kendaraan ringan, mulai dari rem cakram, rem tromol, hingga sistem ABS. Pahami fungsi, letak, dan cara kerja setiap komponen agar kendaraan dapat berhenti dengan aman.",
      objectives: [
        "Mengidentifikasi komponen utama sistem rem kendaraan ringan",
        "Memahami fungsi setiap komponen sistem rem",
        "Mengetahui letak komponen rem pada kendaraan",
        "Membedakan rem cakram dan rem tromol",
        "Memahami prinsip kerja dasar sistem rem hidraulis"
      ],

      // -----------------------------------------------------------------
      learning: [
        {
          title: "K3 & Alat Pelindung Diri (APD)",
          content: "<h3>Prinsip Keselamatan dan Kesehatan Kerja (K3)</h3><p>Keselamatan dan Kesehatan Kerja (K3) adalah prioritas nomor satu di bengkel otomotif. Tujuannya adalah melindungi diri dari kecelakaan kerja dan menjaga kesehatan lingkungan kerja.</p><h3>Alat Pelindung Diri (APD) Wajib</h3><ul><li><strong>Pakaian Kerja (Wearpack)</strong> — melindungi tubuh dari kotoran, percikan api, dan gesekan benda tajam.</li><li><strong>Sepatu Safety (Safety Shoes)</strong> — memiliki pelindung besi di ujung untuk melindungi kaki dari kejatuhan alat berat dan mencegah terpeleset oleh oli.</li><li><strong>Kacamata Pelindung (Safety Glasses)</strong> — melindungi mata dari percikan cairan kimia, debu rem, atau gram besi.</li><li><strong>Sarung Tangan</strong> — melindungi tangan dari suhu panas atau zat kimia korosif (minyak rem/asam baterai).</li><li><strong>Masker</strong> — menyaring debu rem atau gas CO beracun.</li></ul><h3>Potensi Bahaya di Bengkel</h3><ul><li><strong>Kebakaran</strong> — akibat hubungan pendek sirkuit kelistrikan atau tumpahan BBM dekat percikan api.</li><li><strong>Luka Bakar</strong> — dari knalpot panas, cairan pendingin radiator panas, atau percikan las.</li><li><strong>Keracunan Gas</strong> — gas buang mesin (karbon monoksida) di area tertutup.</li><li><strong>Cedera Fisik</strong> — kejatuhan benda berat atau tergelincir tumpahan oli.</li></ul>",
          keyPoints: [
            "K3 bertujuan mencegah kecelakaan dan melindungi kesehatan di tempat kerja",
            "APD wajib: Wearpack, Sepatu Safety, Kacamata Pelindung, Sarung Tangan, dan Masker",
            "Potensi bahaya utama: Kebakaran, luka bakar, gas beracun, dan tergelincir"
          ],
          animation: "safety-apd"
        },
        {
          title: "Budaya Kerja & Prosedur Darurat",
          content: "<h3>Budaya Kerja Otomotif (5S / 5R)</h3><p>Budaya kerja di bengkel otomotif menerapkan prinsip <strong>5S / 5R (Seiri/Ringkas, Seiton/Rapi, Seiso/Resik, Seiketsu/Rawat, Shitsuke/Rajin)</strong>:</p><ul><li><strong>Ringkas & Rapi</strong> — pisahkan barang yang tidak terpakai, tata alat kerja di toolbox sesuai posisinya agar mudah dicari.</li><li><strong>Resik & Rawat</strong> — selalu bersihkan tumpahan oli segera setelah bekerja untuk mencegah bahaya tergelincir. Bersihkan peralatan setelah digunakan.</li><li><strong>Rajin</strong> — patuhi Standar Operasional Prosedur (SOP) dan disiplin waktu.</li></ul><h3>Prosedur Keadaan Darurat</h3><p>Jika terjadi kecelakaan atau kebakaran di bengkel:</p><ul><li><strong>Matikan Aliran Listrik & Mesin</strong> — segera matikan kunci kontak utama atau saklar darurat.</li><li><strong>Gunakan APAR (Alat Pemadam Api Ringan)</strong> — semprotkan pada titik api kecil dengan teknik PASS (Pull, Aim, Squeeze, Sweep). Jangan siram kebakaran listrik dengan air!</li><li><strong>Evakuasi</strong> — ikuti jalur evakuasi menuju titik kumpul jika kondisi tidak aman.</li></ul><h3>Prosedur Perawatan & Perbaikan</h3><ul><li><strong>Perawatan (Maintenance)</strong> — tindakan pencegahan agar komponen tidak cepat rusak (misal: cek level minyak rem berkala).</li><li><strong>Perbaikan (Repair)</strong> — membetulkan komponen yang sudah rusak/aus (misal: mengganti kampas rem yang tipis).</li></ul>",
          keyPoints: [
            "Budaya kerja 5S/5R menjamin efisiensi, kebersihan, dan keselamatan di bengkel",
            "Keadaan darurat: matikan daya sirkuit, gunakan APAR untuk api kecil, evakuasi",
            "Perawatan bersifat preventif, sedangkan perbaikan bersifat restoratif/kuratif"
          ],
          animation: "work-culture"
        },
        {
          title: "Pengenalan Sistem Rem",
          content: "<h3>Apa Itu Sistem Rem?</h3><p>Sistem rem adalah salah satu sistem keselamatan paling penting pada kendaraan. Fungsinya adalah <strong>memperlambat</strong> dan <strong>menghentikan</strong> laju kendaraan secara aman dan terkendali.</p><p>Prinsip dasar kerja rem adalah <strong>gesekan (friction)</strong>. Ketika pengemudi menginjak pedal rem, komponen rem akan saling bergesekan sehingga energi kinetik (gerak) kendaraan diubah menjadi energi panas, dan kendaraan melambat.</p><h3>Jenis Sistem Rem</h3><ul><li><strong>Rem Cakram (Disc Brake)</strong> — menggunakan kaliper dan kampas rem yang menjepit piringan/cakram</li><li><strong>Rem Tromol (Drum Brake)</strong> — menggunakan sepatu rem yang menekan dinding tromol dari dalam</li><li><strong>Rem Tangan / Rem Parkir</strong> — mengunci roda saat kendaraan diparkir</li></ul><p><em>⚠️ K3: Selalu pastikan sistem rem berfungsi baik sebelum mengendarai kendaraan. Rem yang aus dapat menyebabkan kecelakaan fatal!</em></p>",
          keyPoints: [
            "Sistem rem berfungsi memperlambat dan menghentikan kendaraan",
            "Prinsip kerja rem adalah gesekan (friction)",
            "Ada tiga jenis utama: rem cakram, rem tromol, dan rem tangan"
          ],
          animation: "brake-overview"
        },
        {
          title: "Komponen Utama Sistem Rem Hidraulis",
          content: "<h3>Brake Line & Brake Hose (Pipa dan Selang Rem)</h3><p><strong>Fungsi:</strong> Menyalurkan minyak rem bertekanan dari master cylinder ke setiap roda.</p><ul><li><strong>Brake line</strong> — pipa logam kaku, terletak di sepanjang bodi bawah kendaraan</li><li><strong>Brake hose</strong> — selang karet fleksibel, menghubungkan pipa rem ke kaliper/wheel cylinder di roda</li></ul><h3>Pemeriksaan & Kebocoran (Maintenance)</h3><p><em>⚠️ K3: Minyak rem bersifat korosif terhadap cat bodi kendaraan dan dapat menyebabkan iritasi kulit. Gunakan sarung tangan karet saat menangani minyak rem!</em></p><p>Periksa ketebalan selang rem dan pastikan tidak ada kebocoran minyak rem di sambungan pipa karena kebocoran sirkuit rem hidrolik dapat menyebabkan rem blong.</p>",
          keyPoints: [
            "Brake line (pipa) dan brake hose (selang) menyalurkan minyak rem ke roda",
            "Minyak rem bersifat korosif dan berbahaya untuk kulit (gunakan sarung tangan)",
            "Kebocoran minyak rem harus dideteksi dini untuk mencegah rem blong"
          ],
          animation: "brake-hydraulic"
        },
        {
          title: "Rem Cakram (Disc Brake)",
          content: "<h3>Apa Itu Rem Cakram?</h3><p>Rem cakram menggunakan <strong>piringan/cakram (rotor)</strong> yang berputar bersama roda. Kaliper yang berisi kampas rem akan <strong>menjepit</strong> cakram untuk menghentikan putaran roda.</p><p>Rem cakram umumnya dipasang di <strong>roda depan</strong>, dan pada kendaraan modern sering dipasang di keempat roda karena pendinginannya lebih baik.</p><h3>Komponen Rem Cakram</h3><ul><li><strong>Rotor/Disc (Cakram/Piringan)</strong> — piringan logam yang berputar bersama roda.</li><li><strong>Caliper (Kaliper)</strong> — komponen yang menjepit cakram. Di dalamnya terdapat piston hidraulis yang mendorong kampas rem.</li><li><strong>Brake Pad (Kampas Rem)</strong> — bantalan yang menempel di kaliper dan bergesekan langsung dengan cakram.</li></ul><h3>K3 Pemeriksaan Cakram</h3><p><em>⚠️ K3: Debu hasil gesekan kampas rem mengandung partikel halus berbahaya. Gunakan masker saat membersihkan kaliper dan kampas rem, serta hindari menyemprot debu dengan angin kompresor secara langsung!</em></p>",
          keyPoints: [
            "Rem cakram menggunakan kaliper yang menjepit piringan/cakram",
            "Komponen utama: rotor/disc, caliper, brake pad",
            "Pekerjaan kampas rem menghasilkan debu berbahaya (gunakan masker saat bekerja)"
          ],
          animation: "disc-brake"
        },
        {
          title: "Rem Tromol (Drum Brake)",
          content: "<h3>Apa Itu Rem Tromol?</h3><p>Rem tromol adalah jenis rem yang menggunakan <strong>tromol (drum)</strong> berbentuk mangkuk besar yang berputar bersama roda. Di dalamnya terdapat sepatu rem yang menekan dinding tromol untuk menghentikan putaran.</p><p>Rem tromol umumnya dipasang di <strong>roda belakang</strong> kendaraan ringan.</p><h3>Komponen Rem Tromol</h3><ul><li><strong>Brake Shoe (Sepatu Rem)</strong> — komponen melengkung dengan lapisan kampas yang menekan dinding tromol.</li><li><strong>Wheel Cylinder (Silinder Roda)</strong> — menerima tekanan hidraulis dan mendorong brake shoe ke luar.</li><li><strong>Return Spring (Pegas Pengembali)</strong> — menarik brake shoe kembali ke posisi semula saat pedal rem dilepas.</li><li><strong>Backing Plate (Plat Penahan)</strong> — dudukan semua komponen rem tromol.</li></ul><h3>Prosedur Perawatan</h3><p>Secara berkala bersihkan rem tromol menggunakan brake cleaner khusus. Jangan hirup debu rem tromol karena dapat mengganggu pernapasan.</p>",
          keyPoints: [
            "Rem tromol menggunakan sepatu rem yang menekan dinding tromol dari dalam",
            "Umumnya dipasang di roda belakang kendaraan ringan",
            "Pembersihan harus menggunakan cairan khusus pembersih rem (brake cleaner)"
          ],
          animation: "drum-brake"
        },
        {
          title: "Master Silinder & Brake Booster",
          content: "<h3>Master Cylinder (Silinder Master)</h3><p><strong>Fungsi:</strong> Mengubah tekanan mekanis dari pedal rem menjadi tekanan hidraulis (cairan). Komponen ini terletak di <strong>ruang mesin</strong>, tepat di depan dinding pembatas (firewall).</p><p><strong>Bentuk:</strong> Tabung logam silinder dengan reservoir minyak rem di atasnya.</p><h3>Brake Booster (Penguat Rem)</h3><p><strong>Fungsi:</strong> Memperbesar tenaga pengereman agar pengemudi tidak perlu menginjak pedal terlalu kuat. Menggunakan tekanan vakum dari intake manifold mesin.</p><p><strong>Letak:</strong> Di antara pedal rem dan master cylinder, menempel pada firewall.</p><h3>Tips Perawatan</h3><p>Pastikan volume minyak rem di dalam reservoir silinder master selalu berada di antara garis MIN dan MAX. Jangan biarkan minyak rem habis karena udara akan masuk ke sistem dan menyebabkan kegagalan rem.</p>",
          keyPoints: [
            "Master cylinder mengubah tekanan mekanis menjadi tekanan hidraulis",
            "Brake booster memperbesar tenaga pengereman menggunakan tekanan vakum",
            "Periksa level minyak rem secara teratur di reservoir silinder master"
          ],
          animation: "master-cylinder"
        },
        {
          title: "Rem Tangan & Sistem ABS",
          content: "<h3>Rem Tangan (Parking Brake)</h3><p>Berfungsi untuk <strong>mengunci roda belakang</strong> saat kendaraan diparkir, terutama di jalan yang miring/menanjak. Menggunakan kabel baja mekanis.</p><h3>Sistem ABS (Anti-lock Braking System)</h3><p>ABS adalah sistem keselamatan yang <strong>mencegah roda terkunci (lock)</strong> saat pengereman mendadak di jalan licin, sehingga kendaraan tetap bisa dikendalikan arahnya.</p><h3>Komponen ABS</h3><ul><li><strong>Wheel Speed Sensor</strong> — mendeteksi kecepatan putaran roda.</li><li><strong>ECU ABS</strong> — unit kontrol elektronik yang memproses data sensor.</li><li><strong>Hydraulic Modulator</strong> — mengatur tekanan hidraulis rem secara cepat (puluhan kali per detik).</li></ul><p><em>⚠️ K3: Sistem rem parkir dan ABS adalah fitur keselamatan mutlak. Pastikan indikator lampu ABS di dashboard mati saat mesin hidup (tanda sistem berfungsi normal).</em></p>",
          keyPoints: [
            "Rem tangan berfungsi mengunci roda belakang saat parkir lewat kabel mekanis",
            "ABS mencegah roda terkunci saat rem mendadak agar setir tetap dapat dikendalikan",
            "Indikator ABS di dashboard mendeteksi malfungsi sistem pengaman pengereman"
          ],
          animation: "abs-system"
        }
      ],

      // -----------------------------------------------------------------
      // SIMULATION — Drag & Drop
      // -----------------------------------------------------------------
      simulation: {
        title: "Pasang Komponen Sistem Rem",
        instruction: "Seret komponen rem ke posisi yang benar pada kendaraan!",
        components: [
          {
            id: "brake-pad",
            name: "Kampas Rem (Brake Pad)",
            description: "Bantalan yang bergesekan langsung dengan cakram/rotor untuk menghentikan putaran roda. Terletak di dalam kaliper, ada 2 buah (dalam dan luar).",
            correctZone: "zone-caliper",
            image: "🔲"
          },
          {
            id: "caliper",
            name: "Kaliper (Caliper)",
            description: "Komponen yang menjepit cakram dengan kampas rem di dalamnya. Berisi piston hidraulis. Terletak mengapit rotor/cakram di setiap roda depan.",
            correctZone: "zone-disc-area",
            image: "🔧"
          },
          {
            id: "rotor-disc",
            name: "Cakram/Piringan (Rotor/Disc)",
            description: "Piringan logam bundar yang berputar bersama roda. Permukaannya halus dan rata sebagai bidang gesekan untuk kampas rem. Terletak di balik velg roda.",
            correctZone: "zone-wheel-hub",
            image: "💿"
          },
          {
            id: "master-cylinder",
            name: "Master Silinder (Master Cylinder)",
            description: "Tabung silinder logam yang mengubah tekanan mekanis pedal menjadi tekanan hidraulis. Terletak di ruang mesin, menempel pada brake booster di depan firewall.",
            correctZone: "zone-firewall",
            image: "🔩"
          },
          {
            id: "brake-booster",
            name: "Penguat Rem (Brake Booster)",
            description: "Komponen bulat besar yang memperbesar tenaga pengereman menggunakan vakum mesin. Terletak di antara pedal rem dan master cylinder, menempel pada firewall.",
            correctZone: "zone-booster-area",
            image: "⭕"
          },
          {
            id: "brake-line",
            name: "Pipa & Selang Rem (Brake Line/Hose)",
            description: "Pipa logam dan selang karet yang menyalurkan minyak rem bertekanan dari master cylinder ke setiap roda. Pipa terletak di sepanjang bodi bawah kendaraan.",
            correctZone: "zone-undercarriage",
            image: "〰️"
          },
          {
            id: "wheel-cylinder",
            name: "Silinder Roda (Wheel Cylinder)",
            description: "Silinder kecil yang menerima tekanan hidraulis dan mendorong sepatu rem (brake shoe) ke dinding tromol. Terletak di bagian atas backing plate pada rem tromol roda belakang.",
            correctZone: "zone-drum-area",
            image: "🔘"
          },
          {
            id: "brake-shoe",
            name: "Sepatu Rem (Brake Shoe)",
            description: "Komponen melengkung dengan lapisan kampas yang menekan dinding tromol dari dalam. Terdapat sepasang (leading dan trailing shoe) pada setiap roda belakang.",
            correctZone: "zone-drum-inner",
            image: "👟"
          }
        ],
        dropZones: [
          { id: "zone-caliper", label: "Dalam Kaliper", x: 11, y: 35 },
          { id: "zone-disc-area", label: "Area Cakram (Roda Depan)", x: 25, y: 66 },
          { id: "zone-wheel-hub", label: "Hub Roda Depan", x: 18, y: 51 },
          { id: "zone-firewall", label: "Firewall (Ruang Mesin)", x: 52, y: 16 },
          { id: "zone-booster-area", label: "Depan Firewall", x: 43, y: 32 },
          { id: "zone-undercarriage", label: "Kolong Kendaraan", x: 50, y: 72 },
          { id: "zone-drum-area", label: "Area Tromol (Roda Belakang)", x: 79, y: 43 },
          { id: "zone-drum-inner", label: "Dalam Tromol", x: 87, y: 60 }
        ]
      },

      // -----------------------------------------------------------------
      // QUIZ — 10 Questions
      // -----------------------------------------------------------------
      quiz: [
        {
          id: "q1-1",
          question: "Apa fungsi utama master cylinder pada sistem rem?",
          image: null,
          options: [
            "Mengubah tekanan pedal menjadi tekanan hidraulis",
            "Menyimpan minyak rem",
            "Mendinginkan sistem rem",
            "Mengatur tekanan angin ban"
          ],
          correct: 0,
          explanation: "Master cylinder berfungsi mengubah tekanan mekanis dari pedal rem menjadi tekanan hidraulis yang disalurkan ke kaliper atau wheel cylinder melalui saluran rem. Ini adalah komponen inti dari sistem rem hidraulis."
        },
        {
          id: "q1-2",
          question: "Di manakah letak brake booster pada kendaraan?",
          image: null,
          options: [
            "Di bawah dashboard, dekat pedal gas",
            "Di antara pedal rem dan master cylinder, menempel pada firewall",
            "Di belakang roda depan",
            "Di dalam tangki bahan bakar"
          ],
          correct: 1,
          explanation: "Brake booster (penguat rem) terletak di antara pedal rem dan master cylinder, menempel pada firewall (dinding pembatas antara ruang mesin dan kabin). Bentuknya bulat besar dan berfungsi memperbesar tenaga pengereman."
        },
        {
          id: "q1-3",
          question: "Komponen rem cakram yang bergesekan langsung dengan rotor/piringan adalah…",
          image: null,
          options: [
            "Kaliper",
            "Wheel cylinder",
            "Kampas rem (brake pad)",
            "Return spring"
          ],
          correct: 2,
          explanation: "Kampas rem (brake pad) adalah komponen yang bergesekan langsung dengan rotor/cakram. Kampas rem terpasang di dalam kaliper dan akan menjepit cakram saat pedal rem ditekan, sehingga roda melambat."
        },
        {
          id: "q1-4",
          question: "Pada kendaraan ringan, rem tromol umumnya dipasang di roda bagian mana?",
          image: null,
          options: [
            "Roda depan saja",
            "Semua roda",
            "Roda belakang",
            "Hanya roda cadangan"
          ],
          correct: 2,
          explanation: "Pada kendaraan ringan, rem tromol umumnya dipasang di roda belakang. Roda depan biasanya menggunakan rem cakram karena membutuhkan pengereman lebih kuat (saat mengerem, beban kendaraan bergeser ke depan)."
        },
        {
          id: "q1-5",
          question: "Apa fungsi return spring pada rem tromol?",
          image: null,
          options: [
            "Mendorong brake shoe ke dinding tromol",
            "Menarik brake shoe kembali ke posisi semula saat pedal rem dilepas",
            "Mendinginkan tromol setelah pengereman",
            "Menghubungkan tromol ke roda"
          ],
          correct: 1,
          explanation: "Return spring (pegas pengembali) berfungsi menarik brake shoe kembali ke posisi semula setelah pedal rem dilepas. Tanpa return spring, brake shoe akan tetap menekan tromol dan rem tidak bisa melepas."
        },
        {
          id: "q1-6",
          question: "Prinsip dasar kerja sistem rem adalah…",
          image: null,
          options: [
            "Elektromagnetik",
            "Gesekan (friction)",
            "Gravitasi",
            "Tekanan udara"
          ],
          correct: 1,
          explanation: "Prinsip dasar kerja rem adalah gesekan (friction). Komponen rem (kampas rem atau sepatu rem) bergesekan dengan cakram atau tromol, mengubah energi kinetik (gerak) menjadi energi panas sehingga kendaraan melambat."
        },
        {
          id: "q1-7",
          question: "Apa fungsi utama sistem ABS pada kendaraan?",
          image: null,
          options: [
            "Membuat rem lebih keras",
            "Mempercepat kendaraan",
            "Mencegah roda terkunci saat pengereman mendadak",
            "Menghemat bahan bakar"
          ],
          correct: 2,
          explanation: "ABS (Anti-lock Braking System) berfungsi mencegah roda terkunci saat pengereman mendadak. Dengan roda tetap berputar, pengemudi masih dapat mengendalikan arah kendaraan saat mengerem keras."
        },
        {
          id: "q1-8",
          question: "Komponen yang mendorong brake shoe menekan dinding tromol pada rem tromol adalah…",
          image: null,
          options: [
            "Master cylinder",
            "Brake booster",
            "Wheel cylinder (silinder roda)",
            "Backing plate"
          ],
          correct: 2,
          explanation: "Wheel cylinder (silinder roda) menerima tekanan hidraulis dari master cylinder dan mendorong brake shoe ke luar agar menekan dinding tromol. Wheel cylinder terletak di bagian atas backing plate pada rem tromol."
        },
        {
          id: "q1-9",
          question: "Keunggulan rem cakram dibandingkan rem tromol antara lain…",
          image: null,
          options: [
            "Harganya lebih murah",
            "Tidak membutuhkan minyak rem",
            "Pendinginan lebih baik dan performa stabil saat panas",
            "Lebih ringan dan tidak perlu perawatan"
          ],
          correct: 2,
          explanation: "Rem cakram memiliki keunggulan pendinginan lebih baik karena desainnya terbuka (tidak tertutup seperti tromol), sehingga performa pengereman lebih stabil saat kondisi panas. Rem cakram juga lebih mudah diperiksa."
        },
        {
          id: "q1-10",
          question: "Minyak rem disalurkan dari master cylinder ke setiap roda melalui komponen apa?",
          image: null,
          options: [
            "Kabel baja",
            "Rantai penggerak",
            "Pipa rem (brake line) dan selang rem (brake hose)",
            "Propeller shaft"
          ],
          correct: 2,
          explanation: "Minyak rem bertekanan disalurkan dari master cylinder ke kaliper/wheel cylinder di setiap roda melalui pipa rem (brake line) yang terbuat dari logam dan selang rem (brake hose) yang terbuat dari karet fleksibel."
        },
        {
          id: "q1-11",
          question: "Mengapa minyak rem yang mengenai cat bodi kendaraan harus segera dibersihkan dengan air?",
          image: null,
          options: [
            "Minyak rem dapat menyerap air di udara",
            "Minyak rem bersifat korosif dan dapat merusak cat bodi kendaraan",
            "Minyak rem dapat membeku jika dibiarkan",
            "Minyak rem dapat mengurangi tekanan hidrolik roda"
          ],
          correct: 1,
          explanation: "Minyak rem bersifat sangat korosif terhadap cat bodi kendaraan. Jika tidak sengaja tumpah atau menetes ke bodi kendaraan, harus segera dibilas menggunakan air mengalir agar cat tidak melepuh."
        },
        {
          id: "q1-12",
          question: "Alat pemadam kebakaran (APAR) jenis apa yang TIDAK boleh digunakan untuk memadamkan kebakaran akibat korsleting listrik di bengkel?",
          image: null,
          options: [
            "APAR jenis Powder (serbuk kimia kering)",
            "APAR jenis Karbon Dioksida (CO2)",
            "Air",
            "APAR jenis foam khusus non-konduktif"
          ],
          correct: 2,
          explanation: "Air adalah penghantar listrik yang baik. Menggunakan air untuk memadamkan korsleting listrik sangat berbahaya karena dapat memicu sengatan listrik dan memperluas hubungan pendek."
        }
      ]
    },

    // ===================================================================
    // LEVEL 2 — MESIN KENDARAAN (Vehicle Engine)
    // ===================================================================
    {
      id: 2,
      title: "Mesin Kendaraan",
      subtitle: "Vehicle Engine",
      icon: "⚙️",
      color: "#3b82f6",
      description: "Kenali bagian-bagian mesin kendaraan ringan, mulai dari prinsip motor bakar 4 langkah, komponen blok mesin, kepala silinder, hingga sistem pelumasan. Pahami perbedaan mesin bensin dan diesel.",
      objectives: [
        "Memahami prinsip kerja motor bakar 4 langkah",
        "Mengidentifikasi komponen blok mesin dan kepala silinder",
        "Menjelaskan fungsi setiap komponen mesin",
        "Membedakan mesin bensin dan mesin diesel",
        "Mengenal sistem pelumasan mesin"
      ],

      // -----------------------------------------------------------------
      // LEARNING SLIDES
      // -----------------------------------------------------------------
      learning: [
        {
          title: "Prinsip Kerja Motor Bakar",
          content: "<h3>Konversi Energi pada Mesin</h3><p>Mesin kendaraan adalah <strong>motor bakar dalam (internal combustion engine)</strong> yang mengubah <strong>energi kimia</strong> bahan bakar menjadi <strong>energi mekanis</strong> (gerak) untuk menggerakkan kendaraan.</p><p>Proses konversi energi:</p><ol><li>Bahan bakar dicampur dengan udara</li><li>Campuran dikompresi (ditekan) di ruang bakar</li><li>Campuran dibakar → menghasilkan tekanan gas yang sangat tinggi</li><li>Tekanan gas mendorong piston → menghasilkan gerakan</li></ol><h3>Komponen Dasar</h3><p>Mesin terdiri dari dua bagian utama:</p><ul><li><strong>Blok Silinder (Cylinder Block)</strong> — bagian bawah mesin, tempat piston bergerak naik-turun</li><li><strong>Kepala Silinder (Cylinder Head)</strong> — bagian atas mesin, tempat ruang bakar, katup, dan mekanisme penggerak katup</li></ul>",
          keyPoints: [
            "Mesin mengubah energi kimia bahan bakar menjadi energi mekanis (gerak)",
            "Pembakaran terjadi di dalam ruang bakar (internal combustion)",
            "Dua bagian utama: blok silinder dan kepala silinder"
          ],
          animation: "engine-overview"
        },
        {
          title: "Siklus 4 Langkah (Four-Stroke Cycle)",
          content: "<h3>Langkah 1 — Hisap (Intake)</h3><p>Piston bergerak <strong>turun</strong>, katup masuk (intake valve) <strong>terbuka</strong>. Campuran udara dan bahan bakar masuk ke ruang silinder. Katup buang tertutup.</p><h3>Langkah 2 — Kompresi (Compression)</h3><p>Kedua katup <strong>tertutup</strong>. Piston bergerak <strong>naik</strong> dan memampatkan (mengkompresi) campuran udara-bahan bakar. Tekanan dan suhu naik drastis.</p><h3>Langkah 3 — Usaha (Power)</h3><p>Pada mesin bensin: <strong>busi menyala</strong> dan membakar campuran. Pada mesin diesel: campuran <strong>terbakar sendiri</strong> karena tekanan tinggi. Ledakan gas mendorong piston <strong>turun</strong> dengan kuat — inilah langkah yang menghasilkan tenaga!</p><h3>Langkah 4 — Buang (Exhaust)</h3><p>Katup buang (exhaust valve) <strong>terbuka</strong>. Piston bergerak <strong>naik</strong> dan mendorong gas sisa pembakaran keluar melalui saluran buang. Siklus berulang dari langkah 1.</p><p><em>Satu siklus penuh = 2 putaran penuh poros engkol (crankshaft) = 720°</em></p>",
          keyPoints: [
            "4 langkah: Hisap → Kompresi → Usaha → Buang",
            "Hanya langkah Usaha (power) yang menghasilkan tenaga",
            "Satu siklus penuh = 2 putaran crankshaft (720°)"
          ],
          animation: "four-stroke"
        },
        {
          title: "Komponen Blok Mesin",
          content: "<h3>Cylinder Block (Blok Silinder)</h3><p><strong>Fungsi:</strong> Sebagai rangka utama mesin dan tempat silinder (lubang tempat piston bergerak). Terbuat dari besi tuang atau aluminium. Terletak di bagian bawah mesin.</p><h3>Piston</h3><p><strong>Fungsi:</strong> Bergerak naik-turun di dalam silinder untuk menghisap, mengkompresi, menerima tekanan pembakaran, dan mendorong gas buang. <strong>Bentuk:</strong> Silinder logam dengan ring piston (seal) di sekelilingnya.</p><h3>Connecting Rod (Batang Penghubung/Stang Piston)</h3><p><strong>Fungsi:</strong> Menghubungkan piston dengan crankshaft, mengubah gerak naik-turun piston menjadi gerak putar crankshaft. <strong>Bentuk:</strong> Batang logam dengan lubang di kedua ujungnya.</p><h3>Crankshaft (Poros Engkol)</h3><p><strong>Fungsi:</strong> Menerima gerak bolak-balik dari piston (melalui connecting rod) dan mengubahnya menjadi gerak putar untuk menggerakkan roda. Terletak di bagian paling bawah blok mesin.</p><p><strong>Bentuk:</strong> Poros baja dengan bentuk engkol (crank) yang khas, memiliki jurnal dan counterweight.</p>",
          keyPoints: [
            "Blok silinder adalah rangka utama mesin tempat piston bergerak",
            "Connecting rod menghubungkan piston ke crankshaft",
            "Crankshaft mengubah gerak bolak-balik piston menjadi gerak putar"
          ],
          animation: "engine-block"
        },
        {
          title: "Komponen Kepala Silinder",
          content: "<h3>Cylinder Head (Kepala Silinder)</h3><p><strong>Fungsi:</strong> Menutup bagian atas silinder dan membentuk ruang bakar. Tempat katup, busi (mesin bensin), dan saluran masuk/buang. Terpasang di atas blok silinder dengan gasket sebagai penyekat.</p><h3>Valve / Katup (Intake & Exhaust)</h3><p><strong>Fungsi:</strong> Mengatur masuknya campuran udara-bahan bakar (katup masuk) dan keluarnya gas buang (katup buang). <strong>Bentuk:</strong> Seperti jamur/payung logam dengan batang panjang. Terletak di kepala silinder.</p><h3>Camshaft (Poros Nok/Poros Kam)</h3><p><strong>Fungsi:</strong> Menggerakkan katup agar membuka dan menutup sesuai waktu (timing) yang tepat. Memiliki tonjolan (nok/cam lobe) yang mendorong katup. Diputar oleh crankshaft melalui timing chain/belt.</p><h3>Rocker Arm (Pelatuk Katup)</h3><p><strong>Fungsi:</strong> Meneruskan gerakan dari camshaft ke katup. Bekerja seperti tuas ungkit. Terletak di atas kepala silinder pada mesin tipe OHV.</p><h3>Gasket Kepala Silinder (Head Gasket)</h3><p><strong>Fungsi:</strong> Menyekat sambungan antara blok silinder dan kepala silinder agar tidak bocor (gas, air pendingin, oli). Terbuat dari bahan komposit berlapis logam.</p>",
          keyPoints: [
            "Kepala silinder menutup silinder dan membentuk ruang bakar",
            "Katup (valve) mengatur aliran gas masuk dan keluar",
            "Camshaft menggerakkan katup sesuai timing yang tepat"
          ],
          animation: "cylinder-head"
        },
        {
          title: "Sistem Pelumasan Mesin",
          content: "<h3>Mengapa Pelumasan Penting?</h3><p>Komponen mesin bergerak sangat cepat dan menghasilkan gesekan serta panas. Oli mesin berfungsi untuk:</p><ul><li><strong>Melumasi</strong> — mengurangi gesekan antar komponen</li><li><strong>Mendinginkan</strong> — menyerap dan menyebarkan panas</li><li><strong>Membersihkan</strong> — mengangkut kotoran dan partikel logam</li><li><strong>Menyekat</strong> — membantu piston ring menyekat ruang bakar</li></ul><h3>Komponen Sistem Pelumasan</h3><ul><li><strong>Oil Pan / Carter</strong> — wadah penampung oli di bagian paling bawah mesin. Bentuknya seperti bak dangkal.</li><li><strong>Oil Pump (Pompa Oli)</strong> — memompa oli dari carter ke seluruh bagian mesin. Digerakkan oleh crankshaft.</li><li><strong>Oil Filter (Saringan Oli)</strong> — menyaring kotoran dan partikel logam dari oli sebelum disirkulasikan kembali. Berbentuk tabung silinder, terletak di luar blok mesin.</li><li><strong>Oil Gallery (Saluran Oli)</strong> — saluran-saluran di dalam blok mesin yang mendistribusikan oli ke bearing, camshaft, dan komponen lainnya.</li></ul><p><em>⚠️ K3: Ganti oli mesin secara berkala sesuai rekomendasi pabrikan. Oli yang kotor dapat merusak mesin!</em></p>",
          keyPoints: [
            "Oli mesin melumasi, mendinginkan, membersihkan, dan menyekat",
            "Komponen utama: oil pan, oil pump, oil filter, oil gallery",
            "Penggantian oli berkala sangat penting untuk umur mesin"
          ],
          animation: "lubrication-system"
        },
        {
          title: "Mesin Bensin vs Diesel",
          content: "<h3>Perbedaan Utama</h3><table><tr><th>Aspek</th><th>Mesin Bensin</th><th>Mesin Diesel</th></tr><tr><td><strong>Pembakaran</strong></td><td>Menggunakan busi (spark plug) untuk membakar campuran</td><td>Pembakaran sendiri akibat tekanan tinggi (compression ignition)</td></tr><tr><td><strong>Bahan Bakar</strong></td><td>Bensin (gasoline) — lebih mudah terbakar</td><td>Solar (diesel fuel) — lebih berat</td></tr><tr><td><strong>Rasio Kompresi</strong></td><td>Lebih rendah (8:1 – 12:1)</td><td>Lebih tinggi (14:1 – 25:1)</td></tr><tr><td><strong>Tenaga</strong></td><td>RPM tinggi, putaran halus</td><td>Torsi besar, cocok untuk beban berat</td></tr><tr><td><strong>Efisiensi BBM</strong></td><td>Lebih boros</td><td>Lebih irit</td></tr></table><h3>Penggunaan</h3><ul><li><strong>Mesin bensin</strong> — umumnya pada kendaraan penumpang (sedan, hatchback, city car)</li><li><strong>Mesin diesel</strong> — umumnya pada kendaraan niaga, truk, bus, dan beberapa SUV/pick-up</li></ul>",
          keyPoints: [
            "Mesin bensin menggunakan busi, mesin diesel menggunakan tekanan tinggi",
            "Mesin diesel memiliki rasio kompresi dan torsi lebih tinggi",
            "Mesin bensin untuk kendaraan penumpang, diesel untuk beban berat"
          ],
          animation: "gasoline-vs-diesel"
        },
        {
          title: "Konfigurasi dan Tipe Mesin",
          content: "<h3>Konfigurasi Silinder</h3><ul><li><strong>Inline (Segaris)</strong> — silinder tersusun dalam satu baris lurus. Paling umum digunakan. Contoh: I4 (4 silinder segaris) pada Toyota Avanza, Honda Brio.</li><li><strong>V-Engine</strong> — silinder tersusun dalam dua baris membentuk huruf V. Digunakan pada mesin bersilinder banyak. Contoh: V6, V8 pada kendaraan besar dan mewah.</li><li><strong>Boxer / Flat</strong> — silinder tersusun mendatar saling berhadapan. Titik gravitasi rendah. Contoh: mesin Subaru.</li></ul><h3>Spesifikasi Mesin yang Perlu Diketahui</h3><ul><li><strong>Kapasitas Mesin (cc)</strong> — volume total semua silinder, contoh: 1.500 cc (1,5 liter)</li><li><strong>Jumlah Silinder</strong> — 3, 4, 6, atau 8 silinder</li><li><strong>DOHC/SOHC</strong> — jumlah camshaft (Dual/Single Overhead Camshaft)</li><li><strong>Jumlah Katup</strong> — contoh: 16V = 4 katup per silinder pada mesin 4 silinder</li></ul><p><em>Pada kendaraan ringan Indonesia, konfigurasi paling umum adalah <strong>Inline 4 (I4)</strong> dengan kapasitas 1.000–2.500 cc.</em></p>",
          keyPoints: [
            "Konfigurasi utama: Inline (segaris), V-Engine, dan Boxer (flat)",
            "Inline 4 silinder paling umum pada kendaraan ringan Indonesia",
            "Spesifikasi penting: kapasitas (cc), jumlah silinder, DOHC/SOHC"
          ],
          animation: "engine-configurations"
        }
      ],

      // -----------------------------------------------------------------
      // SIMULATION — Drag & Drop
      // -----------------------------------------------------------------
      simulation: {
        title: "Pasang Komponen Mesin Kendaraan",
        instruction: "Seret komponen mesin ke posisi yang benar pada blok mesin!",
        components: [
          {
            id: "piston",
            name: "Piston",
            description: "Komponen silinder logam yang bergerak naik-turun di dalam silinder. Memiliki ring piston sebagai penyekat. Terletak di dalam lubang silinder pada blok mesin.",
            correctZone: "zone-cylinder-bore",
            image: "🔵"
          },
          {
            id: "connecting-rod",
            name: "Batang Penghubung (Connecting Rod)",
            description: "Batang logam yang menghubungkan piston dengan crankshaft. Mengubah gerak naik-turun menjadi gerak putar. Terletak di antara piston dan crankshaft.",
            correctZone: "zone-connecting",
            image: "📏"
          },
          {
            id: "crankshaft",
            name: "Poros Engkol (Crankshaft)",
            description: "Poros baja berbentuk engkol yang menerima gerak dari connecting rod dan mengubahnya menjadi gerak putar. Terletak di bagian paling bawah blok mesin.",
            correctZone: "zone-bottom-block",
            image: "⚙️"
          },
          {
            id: "camshaft",
            name: "Poros Nok (Camshaft)",
            description: "Poros dengan tonjolan (nok) yang menggerakkan katup sesuai timing pembakaran. Terletak di atas kepala silinder (tipe OHC/DOHC) atau di blok mesin (tipe OHV).",
            correctZone: "zone-top-head",
            image: "🔄"
          },
          {
            id: "valve-intake",
            name: "Katup Masuk (Intake Valve)",
            description: "Katup berbentuk jamur yang mengatur masuknya campuran udara-bahan bakar ke ruang bakar. Terbuka saat langkah hisap. Terletak di kepala silinder.",
            correctZone: "zone-intake-port",
            image: "🔽"
          },
          {
            id: "valve-exhaust",
            name: "Katup Buang (Exhaust Valve)",
            description: "Katup yang mengatur keluarnya gas sisa pembakaran. Terbuka saat langkah buang. Terletak di kepala silinder sisi saluran buang.",
            correctZone: "zone-exhaust-port",
            image: "🔼"
          },
          {
            id: "cylinder-head",
            name: "Kepala Silinder (Cylinder Head)",
            description: "Penutup atas silinder yang membentuk ruang bakar. Tempat katup, saluran masuk/buang, dan busi. Terpasang di atas blok silinder.",
            correctZone: "zone-head-area",
            image: "🏗️"
          },
          {
            id: "spark-plug",
            name: "Busi (Spark Plug)",
            description: "Komponen yang menghasilkan percikan api untuk membakar campuran udara-bahan bakar pada mesin bensin. Terpasang di kepala silinder, ujungnya masuk ke ruang bakar.",
            correctZone: "zone-spark-hole",
            image: "⚡"
          }
        ],
        dropZones: [
          { id: "zone-cylinder-bore", label: "Lubang Silinder", x: 38, y: 44 },
          { id: "zone-connecting", label: "Antara Piston & Crankshaft", x: 62, y: 58 },
          { id: "zone-bottom-block", label: "Bawah Blok Mesin", x: 38, y: 75 },
          { id: "zone-top-head", label: "Atas Kepala Silinder", x: 38, y: 10 },
          { id: "zone-intake-port", label: "Saluran Masuk (Kepala Silinder)", x: 22, y: 22 },
          { id: "zone-exhaust-port", label: "Saluran Buang (Kepala Silinder)", x: 78, y: 22 },
          { id: "zone-head-area", label: "Atas Blok Silinder", x: 62, y: 26 },
          { id: "zone-spark-hole", label: "Lubang Busi (Kepala Silinder)", x: 50, y: 18 }
        ]
      },

      // -----------------------------------------------------------------
      // QUIZ — 10 Questions
      // -----------------------------------------------------------------
      quiz: [
        {
          id: "q2-1",
          question: "Urutan siklus kerja mesin 4 langkah yang benar adalah…",
          image: null,
          options: [
            "Hisap → Usaha → Kompresi → Buang",
            "Hisap → Kompresi → Usaha → Buang",
            "Kompresi → Hisap → Buang → Usaha",
            "Usaha → Buang → Hisap → Kompresi"
          ],
          correct: 1,
          explanation: "Urutan siklus 4 langkah yang benar adalah: Hisap (intake) → Kompresi (compression) → Usaha (power) → Buang (exhaust). Campuran dihisap, dimampatkan, dibakar untuk menghasilkan tenaga, lalu gas buang dikeluarkan."
        },
        {
          id: "q2-2",
          question: "Apa fungsi connecting rod (batang penghubung)?",
          image: null,
          options: [
            "Mendinginkan piston",
            "Menghubungkan piston dengan crankshaft dan mengubah gerak naik-turun menjadi gerak putar",
            "Menyekat ruang bakar",
            "Menggerakkan katup masuk"
          ],
          correct: 1,
          explanation: "Connecting rod (batang penghubung/stang piston) menghubungkan piston dengan crankshaft. Fungsinya mengubah gerak naik-turun (translasi) piston menjadi gerak putar (rotasi) pada crankshaft."
        },
        {
          id: "q2-3",
          question: "Pada langkah kompresi, kondisi katup adalah…",
          image: null,
          options: [
            "Kedua katup terbuka",
            "Katup masuk terbuka, katup buang tertutup",
            "Kedua katup tertutup",
            "Katup masuk tertutup, katup buang terbuka"
          ],
          correct: 2,
          explanation: "Pada langkah kompresi, kedua katup (masuk dan buang) harus tertutup rapat agar campuran udara-bahan bakar dapat dimampatkan oleh piston yang bergerak naik. Jika ada katup terbuka, kompresi tidak akan tercapai."
        },
        {
          id: "q2-4",
          question: "Komponen yang menggerakkan katup agar membuka dan menutup sesuai timing adalah…",
          image: null,
          options: [
            "Crankshaft",
            "Piston",
            "Camshaft (poros nok)",
            "Flywheel"
          ],
          correct: 2,
          explanation: "Camshaft (poros nok) memiliki tonjolan-tonjolan (nok/cam lobe) yang mendorong katup agar membuka pada waktu yang tepat. Camshaft diputar oleh crankshaft melalui timing chain atau timing belt."
        },
        {
          id: "q2-5",
          question: "Perbedaan utama mesin diesel dan mesin bensin dalam hal pembakaran adalah…",
          image: null,
          options: [
            "Mesin diesel menggunakan busi, mesin bensin tidak",
            "Mesin diesel menggunakan tekanan tinggi (compression ignition), mesin bensin menggunakan busi (spark ignition)",
            "Mesin diesel tidak memiliki piston",
            "Keduanya sama-sama menggunakan busi"
          ],
          correct: 1,
          explanation: "Mesin diesel menggunakan compression ignition — campuran terbakar sendiri karena tekanan dan suhu yang sangat tinggi saat kompresi. Mesin bensin menggunakan spark ignition — busi menghasilkan percikan api untuk membakar campuran."
        },
        {
          id: "q2-6",
          question: "Fungsi oil pump (pompa oli) pada sistem pelumasan mesin adalah…",
          image: null,
          options: [
            "Menyaring kotoran dalam oli",
            "Menampung oli bekas",
            "Memompa oli dari carter ke seluruh bagian mesin yang bergerak",
            "Mendinginkan oli dengan udara"
          ],
          correct: 2,
          explanation: "Oil pump berfungsi memompa oli dari oil pan (carter) ke seluruh komponen mesin yang bergerak dan membutuhkan pelumasan, seperti bearing crankshaft, camshaft, dan piston. Oil pump digerakkan oleh crankshaft."
        },
        {
          id: "q2-7",
          question: "Di manakah letak crankshaft pada mesin?",
          image: null,
          options: [
            "Di atas kepala silinder",
            "Di samping blok mesin",
            "Di bagian paling bawah blok mesin",
            "Di dalam saluran buang"
          ],
          correct: 2,
          explanation: "Crankshaft (poros engkol) terletak di bagian paling bawah blok mesin, ditopang oleh bearing utama (main bearing). Di bawah crankshaft terdapat oil pan (carter) yang menampung oli mesin."
        },
        {
          id: "q2-8",
          question: "Langkah pada siklus 4 langkah yang menghasilkan tenaga untuk menggerakkan kendaraan adalah…",
          image: null,
          options: [
            "Langkah hisap (intake)",
            "Langkah kompresi (compression)",
            "Langkah usaha (power)",
            "Langkah buang (exhaust)"
          ],
          correct: 2,
          explanation: "Langkah usaha (power stroke) adalah satu-satunya langkah yang menghasilkan tenaga. Pada langkah ini, pembakaran campuran menghasilkan tekanan gas yang sangat tinggi, mendorong piston turun dengan kuat dan memutar crankshaft."
        },
        {
          id: "q2-9",
          question: "Fungsi gasket kepala silinder (head gasket) adalah…",
          image: null,
          options: [
            "Menggerakkan katup",
            "Menyekat sambungan antara blok silinder dan kepala silinder agar tidak bocor",
            "Menyimpan oli mesin",
            "Mendinginkan ruang bakar"
          ],
          correct: 1,
          explanation: "Head gasket (gasket kepala silinder) berfungsi menyekat sambungan antara blok silinder dan kepala silinder agar gas pembakaran, air pendingin, dan oli tidak bocor atau saling tercampur. Gasket yang rusak menyebabkan overheating."
        },
        {
          id: "q2-10",
          question: "Konfigurasi mesin yang paling umum digunakan pada kendaraan ringan di Indonesia adalah…",
          image: null,
          options: [
            "V8",
            "Boxer / Flat",
            "Inline 4 silinder (I4)",
            "Rotary (Wankel)"
          ],
          correct: 2,
          explanation: "Konfigurasi Inline 4 silinder (I4) adalah yang paling umum pada kendaraan ringan di Indonesia, dengan kapasitas 1.000–2.500 cc. Contohnya pada Toyota Avanza, Honda Brio, Daihatsu Xenia, dan banyak lagi."
        }
      ]
    },

    // ===================================================================
    // LEVEL 3 — SISTEM KELISTRIKAN (Electrical System)
    // ===================================================================
    {
      id: 3,
      title: "Sistem Kelistrikan",
      subtitle: "Electrical System",
      icon: "⚡",
      color: "#eab308",
      description: "Pelajari sistem kelistrikan kendaraan ringan, mulai dari baterai/aki, sistem pengisian, sistem starter, hingga sistem penerangan. Pahami cara kerja sirkuit dasar dan pentingnya keselamatan kelistrikan.",
      objectives: [
        "Mengidentifikasi komponen utama sistem kelistrikan kendaraan",
        "Memahami fungsi baterai, alternator, dan motor starter",
        "Mengenal sistem penerangan kendaraan",
        "Memahami sirkuit kelistrikan dasar",
        "Menerapkan keselamatan kerja (K3) pada sistem kelistrikan"
      ],

      // -----------------------------------------------------------------
      // LEARNING SLIDES
      // -----------------------------------------------------------------
      learning: [
        {
          title: "Pengenalan Sistem Kelistrikan Kendaraan",
          content: "<h3>Mengapa Kelistrikan Penting?</h3><p>Sistem kelistrikan kendaraan berfungsi untuk <strong>menyediakan dan mendistribusikan energi listrik</strong> ke seluruh komponen yang membutuhkan, mulai dari menghidupkan mesin, menyalakan lampu, hingga mengoperasikan AC dan audio.</p><h3>Sirkuit Dasar Kelistrikan</h3><p>Setiap sirkuit kelistrikan kendaraan memiliki komponen dasar:</p><ul><li><strong>Sumber arus</strong> — baterai/aki atau alternator</li><li><strong>Penghantar (Kabel)</strong> — menyalurkan arus listrik</li><li><strong>Beban (Load)</strong> — komponen yang menggunakan listrik (lampu, motor, dll)</li><li><strong>Saklar (Switch)</strong> — mengontrol on/off sirkuit</li><li><strong>Pengaman (Fuse/Sekring)</strong> — melindungi sirkuit dari arus berlebih</li></ul><h3>Sistem Kelistrikan Utama</h3><ul><li>Sistem pengisian (charging system)</li><li>Sistem starter (starting system)</li><li>Sistem penerangan (lighting system)</li><li>Sistem sinyal dan indikator</li></ul><p><em>⚠️ K3: Listrik kendaraan 12V DC umumnya aman, tetapi arus besar dari baterai dapat menyebabkan percikan api dan kebakaran! Selalu lepas terminal negatif (-) terlebih dahulu saat bekerja pada kelistrikan.</em></p>",
          keyPoints: [
            "Sistem kelistrikan menyediakan dan mendistribusikan energi listrik",
            "Sirkuit dasar: sumber arus, penghantar, beban, saklar, pengaman",
            "Tiga sistem utama: pengisian, starter, dan penerangan"
          ],
          animation: "electrical-overview"
        },
        {
          title: "Baterai / Aki (Battery)",
          content: "<h3>Fungsi Baterai</h3><p>Baterai (aki) adalah <strong>sumber energi listrik utama</strong> saat mesin belum hidup. Berfungsi untuk:</p><ul><li>Menyuplai arus ke motor starter untuk menghidupkan mesin</li><li>Menyuplai listrik ke semua peralatan saat mesin mati</li><li>Menstabilkan tegangan pada sistem kelistrikan</li></ul><h3>Komponen Baterai</h3><ul><li><strong>Sel (Cell)</strong> — baterai 12V terdiri dari 6 sel, masing-masing menghasilkan ±2,1V</li><li><strong>Pelat positif & negatif</strong> — pelat timbal (lead) yang terendam dalam elektrolit</li><li><strong>Elektrolit</strong> — larutan asam sulfat (H₂SO₄) dan air suling</li><li><strong>Terminal</strong> — kutub positif (+) lebih besar dari kutub negatif (-)</li><li><strong>Kotak baterai (case)</strong> — wadah plastik tahan asam</li></ul><h3>Spesifikasi Baterai</h3><ul><li><strong>Tegangan</strong> — 12 Volt DC untuk kendaraan ringan</li><li><strong>Kapasitas (Ah)</strong> — contoh: 45Ah, 60Ah — semakin besar, semakin lama mampu menyuplai arus</li><li><strong>CCA (Cold Cranking Amps)</strong> — kemampuan starter pada suhu dingin</li></ul><p><strong>Letak:</strong> Di ruang mesin, biasanya di salah satu sudut depan.</p>",
          keyPoints: [
            "Baterai menyuplai listrik untuk starter dan peralatan saat mesin mati",
            "Baterai 12V terdiri dari 6 sel dengan elektrolit asam sulfat",
            "Spesifikasi penting: tegangan (V), kapasitas (Ah), CCA"
          ],
          animation: "battery-detail"
        },
        {
          title: "Sistem Pengisian (Charging System)",
          content: "<h3>Mengapa Perlu Sistem Pengisian?</h3><p>Baterai menyuplai listrik saat menghidupkan mesin, tetapi kapasitasnya terbatas. Sistem pengisian berfungsi <strong>mengisi kembali baterai</strong> dan <strong>menyuplai listrik</strong> ke seluruh kendaraan saat mesin hidup.</p><h3>Alternator</h3><p><strong>Fungsi:</strong> Menghasilkan arus listrik AC (bolak-balik) yang kemudian disearahkan menjadi DC untuk mengisi baterai dan menyuplai kelistrikan kendaraan.</p><p><strong>Letak:</strong> Di bagian depan mesin, diputar oleh drive belt (V-belt/serpentine belt) yang terhubung ke puli crankshaft.</p><p><strong>Komponen utama:</strong></p><ul><li><strong>Rotor</strong> — bagian yang berputar, membawa kumparan medan magnet</li><li><strong>Stator</strong> — kumparan diam yang menghasilkan arus listrik</li><li><strong>Dioda (Rectifier)</strong> — menyearahkan arus AC menjadi DC</li><li><strong>Regulator</strong> — mengatur tegangan keluaran agar stabil di sekitar 13,8–14,4V</li></ul><h3>IC Regulator</h3><p><strong>Fungsi:</strong> Menjaga agar tegangan yang dihasilkan alternator tetap stabil, tidak terlalu tinggi (merusak komponen) atau terlalu rendah (baterai tidak terisi).</p>",
          keyPoints: [
            "Alternator menghasilkan listrik saat mesin hidup untuk mengisi baterai",
            "Alternator diputar oleh drive belt dari crankshaft",
            "Regulator menjaga tegangan stabil di 13,8–14,4V"
          ],
          animation: "charging-system"
        },
        {
          title: "Sistem Starter (Starting System)",
          content: "<h3>Fungsi Sistem Starter</h3><p>Sistem starter berfungsi <strong>memutar mesin untuk pertama kali</strong> hingga mesin dapat hidup dan berputar sendiri. Motor starter mengubah energi listrik dari baterai menjadi gerak putar.</p><h3>Komponen Sistem Starter</h3><ul><li><strong>Motor Starter</strong> — motor listrik DC yang menghasilkan putaran dan torsi besar dalam waktu singkat. Terletak di bagian bawah mesin, dekat flywheel/flexplate.</li><li><strong>Solenoid</strong> — terpasang di atas motor starter, berfungsi menghubungkan gigi pinion dengan ring gear pada flywheel dan sekaligus mengalirkan arus besar ke motor starter.</li><li><strong>Pinion Gear</strong> — gigi kecil pada motor starter yang berkaitan dengan ring gear flywheel saat starter diaktifkan.</li><li><strong>Relay Starter</strong> — saklar elektromagnetik yang mengontrol aliran arus dari baterai ke solenoid. Terletak di fuse box atau dekat baterai.</li></ul><h3>Cara Kerja</h3><ol><li>Pengemudi memutar kunci kontak ke posisi START</li><li>Arus dari baterai mengaktifkan relay → solenoid</li><li>Solenoid mendorong pinion gear berkaitan dengan ring gear flywheel</li><li>Motor starter berputar → mesin ikut berputar → mesin hidup</li><li>Kunci kontak dilepas → pinion terlepas dari flywheel</li></ol>",
          keyPoints: [
            "Motor starter memutar mesin pertama kali untuk menghidupkannya",
            "Solenoid menghubungkan pinion dengan ring gear flywheel",
            "Relay mengontrol aliran arus besar dari baterai ke motor starter"
          ],
          animation: "starter-system"
        },
        {
          title: "Sistem Penerangan (Lighting System)",
          content: "<h3>Jenis Lampu Kendaraan</h3><ul><li><strong>Headlamp (Lampu Utama)</strong> — lampu depan untuk penerangan jalan. Memiliki mode: lampu jauh (high beam) dan lampu dekat (low beam).</li><li><strong>Tail Lamp (Lampu Belakang)</strong> — lampu merah di belakang, menyala bersamaan dengan lampu kota/kepala.</li><li><strong>Brake Light (Lampu Rem)</strong> — lampu merah terang di belakang, menyala saat pedal rem ditekan. Memberi tanda pada kendaraan di belakang.</li><li><strong>Turn Signal / Sein (Lampu Penunjuk Arah)</strong> — lampu berkedip kuning/oranye untuk memberi tanda belok kiri/kanan. Dikendalikan oleh flasher relay.</li><li><strong>Hazard Light (Lampu Bahaya)</strong> — semua sein berkedip bersamaan, menandakan kondisi darurat.</li><li><strong>Reverse Light (Lampu Mundur)</strong> — lampu putih di belakang, menyala otomatis saat gigi mundur dimasukkan.</li></ul><h3>Komponen Pendukung</h3><ul><li><strong>Saklar Lampu (Light Switch)</strong> — mengontrol nyala/mati lampu, terletak di tuas di belakang setir</li><li><strong>Flasher Relay</strong> — komponen elektronik yang membuat lampu sein berkedip</li><li><strong>Dimmer Switch</strong> — mengatur perpindahan antara lampu jauh dan dekat</li></ul>",
          keyPoints: [
            "Lampu kendaraan meliputi headlamp, tail lamp, brake light, sein, dan lainnya",
            "Lampu sein dikendalikan oleh flasher relay agar berkedip",
            "Setiap lampu memiliki fungsi keselamatan yang spesifik"
          ],
          animation: "lighting-system"
        },
        {
          title: "Wiring Diagram & Kunci Kontak",
          content: "<h3>Wiring Diagram (Diagram Kelistrikan)</h3><p>Wiring diagram adalah <strong>gambar skema</strong> yang menunjukkan hubungan kelistrikan antar komponen kendaraan menggunakan simbol-simbol standar.</p><p>Manfaat memahami wiring diagram:</p><ul><li>Memudahkan pencarian kerusakan (troubleshooting)</li><li>Memahami alur arus listrik pada setiap sirkuit</li><li>Mengetahui lokasi komponen dan konektornya</li></ul><h3>Simbol Penting pada Wiring Diagram</h3><ul><li><strong>Garis lurus</strong> — kabel/penghantar</li><li><strong>Titik pertemuan</strong> — sambungan kabel</li><li><strong>Simbol sekring</strong> — pengaman sirkuit</li><li><strong>Simbol saklar</strong> — pemutus/penghubung arus</li><li><strong>Simbol ground</strong> — sambungan ke bodi kendaraan (massa)</li></ul><h3>Kunci Kontak (Ignition Switch)</h3><p><strong>Posisi kunci kontak:</strong></p><ul><li><strong>LOCK</strong> — semua sistem mati, setir terkunci</li><li><strong>ACC (Accessory)</strong> — radio, power window aktif</li><li><strong>ON</strong> — semua sistem kelistrikan aktif, dashboard menyala</li><li><strong>START</strong> — motor starter aktif, memutar mesin</li></ul><p><strong>Letak:</strong> Di kolom kemudi (steering column) atau tombol start pada kendaraan modern.</p>",
          keyPoints: [
            "Wiring diagram menunjukkan hubungan kelistrikan antar komponen",
            "Kunci kontak memiliki 4 posisi: LOCK, ACC, ON, START",
            "Memahami wiring diagram penting untuk troubleshooting kelistrikan"
          ],
          animation: "wiring-diagram"
        }
      ],

      // -----------------------------------------------------------------
      // SIMULATION — Drag & Drop
      // -----------------------------------------------------------------
      simulation: {
        title: "Pasang Komponen Sistem Kelistrikan",
        instruction: "Seret komponen kelistrikan ke posisi yang benar pada kendaraan!",
        components: [
          {
            id: "battery",
            name: "Baterai / Aki (Battery)",
            description: "Sumber energi listrik utama kendaraan, 12V DC. Menyuplai arus ke semua komponen kelistrikan saat mesin mati. Terletak di ruang mesin, biasanya di sudut depan.",
            correctZone: "zone-engine-corner",
            image: "🔋"
          },
          {
            id: "alternator",
            name: "Alternator",
            description: "Generator listrik yang mengisi baterai dan menyuplai listrik saat mesin hidup. Diputar oleh drive belt dari crankshaft. Terletak di depan mesin.",
            correctZone: "zone-front-engine",
            image: "🔌"
          },
          {
            id: "starter-motor",
            name: "Motor Starter (Starter Motor)",
            description: "Motor listrik DC yang memutar mesin untuk pertama kali. Memiliki solenoid dan pinion gear. Terletak di bagian bawah mesin, dekat flywheel.",
            correctZone: "zone-lower-engine",
            image: "🔄"
          },
          {
            id: "relay",
            name: "Relay",
            description: "Saklar elektromagnetik yang mengontrol aliran arus besar menggunakan arus kecil sebagai pengontrol. Terletak di fuse box / relay box di ruang mesin.",
            correctZone: "zone-fuse-box",
            image: "🔲"
          },
          {
            id: "fuse",
            name: "Sekring (Fuse)",
            description: "Pengaman sirkuit yang akan putus jika arus berlebih, melindungi kabel dan komponen dari kerusakan. Terletak di fuse box (ruang mesin dan dashboard).",
            correctZone: "zone-fuse-box-cabin",
            image: "⚡"
          },
          {
            id: "body-ground",
            name: "Kabel Body / Ground",
            description: "Kabel tebal yang menghubungkan terminal negatif baterai ke bodi/rangka kendaraan sebagai jalur arus balik (ground/massa). Terhubung ke bodi di dekat baterai.",
            correctZone: "zone-chassis-ground",
            image: "➖"
          },
          {
            id: "ignition-switch",
            name: "Kunci Kontak (Ignition Switch)",
            description: "Saklar utama yang mengendalikan seluruh sistem kelistrikan kendaraan. Memiliki posisi LOCK, ACC, ON, dan START. Terletak di kolom kemudi.",
            correctZone: "zone-steering-column",
            image: "🔑"
          },
          {
            id: "headlamp",
            name: "Lampu Utama (Headlamp)",
            description: "Lampu depan untuk penerangan jalan, memiliki mode high beam dan low beam. Terletak di bagian depan kendaraan, kiri dan kanan.",
            correctZone: "zone-front-body",
            image: "💡"
          }
        ],
        dropZones: [
          { id: "zone-engine-corner", label: "Sudut Ruang Mesin", x: 26, y: 28 },
          { id: "zone-front-engine", label: "Depan Mesin (Belt Area)", x: 36, y: 38 },
          { id: "zone-lower-engine", label: "Bawah Mesin (Flywheel)", x: 45, y: 65 },
          { id: "zone-fuse-box", label: "Fuse Box Ruang Mesin", x: 14, y: 18 },
          { id: "zone-fuse-box-cabin", label: "Fuse Box Kabin", x: 65, y: 22 },
          { id: "zone-chassis-ground", label: "Bodi / Rangka Kendaraan", x: 28, y: 70 },
          { id: "zone-steering-column", label: "Kolom Kemudi", x: 52, y: 36 },
          { id: "zone-front-body", label: "Depan Kendaraan", x: 10, y: 40 }
        ]
      },

      // -----------------------------------------------------------------
      // QUIZ — 10 Questions
      // -----------------------------------------------------------------
      quiz: [
        {
          id: "q3-1",
          question: "Berapa tegangan baterai/aki standar pada kendaraan ringan?",
          image: null,
          options: [
            "6 Volt DC",
            "12 Volt DC",
            "24 Volt AC",
            "220 Volt AC"
          ],
          correct: 1,
          explanation: "Baterai/aki standar kendaraan ringan memiliki tegangan 12 Volt DC (arus searah). Baterai terdiri dari 6 sel yang masing-masing menghasilkan sekitar 2,1 Volt, sehingga totalnya ±12,6 Volt saat penuh."
        },
        {
          id: "q3-2",
          question: "Apa fungsi utama alternator pada kendaraan?",
          image: null,
          options: [
            "Menghidupkan mesin pertama kali",
            "Menghasilkan listrik untuk mengisi baterai dan menyuplai kelistrikan saat mesin hidup",
            "Menyimpan energi listrik",
            "Mengontrol sistem pengereman"
          ],
          correct: 1,
          explanation: "Alternator berfungsi menghasilkan arus listrik saat mesin hidup. Listrik yang dihasilkan digunakan untuk mengisi kembali baterai dan menyuplai seluruh kebutuhan kelistrikan kendaraan. Alternator diputar oleh drive belt."
        },
        {
          id: "q3-3",
          question: "Komponen pada motor starter yang mendorong pinion gear berkaitan dengan ring gear flywheel adalah…",
          image: null,
          options: [
            "Relay",
            "Sekring (fuse)",
            "Solenoid",
            "Alternator"
          ],
          correct: 2,
          explanation: "Solenoid adalah komponen yang terpasang di atas motor starter. Ketika mendapat arus, solenoid akan mendorong pinion gear agar berkaitan dengan ring gear pada flywheel, sekaligus menghubungkan arus besar ke motor starter."
        },
        {
          id: "q3-4",
          question: "Apa fungsi sekring (fuse) pada sirkuit kelistrikan kendaraan?",
          image: null,
          options: [
            "Meningkatkan tegangan listrik",
            "Melindungi sirkuit dari arus berlebih dengan cara putus otomatis",
            "Menghasilkan arus listrik",
            "Menstabilkan putaran mesin"
          ],
          correct: 1,
          explanation: "Sekring (fuse) berfungsi sebagai pengaman sirkuit. Jika terjadi hubungan pendek (short circuit) atau arus berlebih, sekring akan putus lebih dahulu untuk melindungi kabel dan komponen dari kerusakan atau kebakaran."
        },
        {
          id: "q3-5",
          question: "Posisi kunci kontak yang mengaktifkan motor starter untuk menghidupkan mesin adalah…",
          image: null,
          options: [
            "LOCK",
            "ACC (Accessory)",
            "ON",
            "START"
          ],
          correct: 3,
          explanation: "Posisi START pada kunci kontak mengalirkan arus ke relay dan solenoid starter, sehingga motor starter aktif dan memutar mesin. Setelah mesin hidup, kunci kontak dilepas dan kembali ke posisi ON."
        },
        {
          id: "q3-6",
          question: "Komponen yang membuat lampu sein berkedip adalah…",
          image: null,
          options: [
            "Alternator",
            "Flasher relay",
            "Voltage regulator",
            "Baterai"
          ],
          correct: 1,
          explanation: "Flasher relay adalah komponen elektronik yang membuat lampu sein (turn signal) berkedip secara otomatis. Flasher relay menghubungkan dan memutuskan arus ke lampu sein secara berkala, menghasilkan efek berkedip."
        },
        {
          id: "q3-7",
          question: "Saat bekerja pada sistem kelistrikan kendaraan, terminal baterai yang harus dilepas terlebih dahulu adalah…",
          image: null,
          options: [
            "Terminal positif (+)",
            "Terminal negatif (-)",
            "Boleh mana saja",
            "Tidak perlu melepas terminal"
          ],
          correct: 1,
          explanation: "Untuk keselamatan (K3), selalu lepas terminal negatif (-) terlebih dahulu saat bekerja pada kelistrikan. Ini mencegah hubungan pendek (short circuit) jika kunci pas tidak sengaja menyentuh bodi kendaraan yang merupakan jalur ground."
        },
        {
          id: "q3-8",
          question: "Tegangan keluaran alternator yang normal saat mesin hidup adalah sekitar…",
          image: null,
          options: [
            "6,0 – 8,0 Volt",
            "10,0 – 11,5 Volt",
            "13,8 – 14,4 Volt",
            "18,0 – 20,0 Volt"
          ],
          correct: 2,
          explanation: "Tegangan keluaran alternator yang normal adalah sekitar 13,8–14,4 Volt. Tegangan ini lebih tinggi dari tegangan baterai (12,6V) agar baterai dapat terisi. Regulator menjaga agar tegangan tidak melebihi batas ini."
        },
        {
          id: "q3-9",
          question: "Di manakah letak motor starter pada kendaraan?",
          image: null,
          options: [
            "Di atas kepala silinder",
            "Di bagian bawah mesin, dekat flywheel",
            "Di dalam dashboard",
            "Di belakang kendaraan dekat tangki BBM"
          ],
          correct: 1,
          explanation: "Motor starter terletak di bagian bawah mesin, dekat flywheel/flexplate. Posisi ini memungkinkan pinion gear pada motor starter berkaitan dengan ring gear pada flywheel untuk memutar mesin."
        },
        {
          id: "q3-10",
          question: "Kabel ground/massa menghubungkan terminal negatif baterai ke…",
          image: null,
          options: [
            "Terminal positif baterai",
            "Alternator",
            "Bodi/rangka kendaraan",
            "Lampu utama"
          ],
          correct: 2,
          explanation: "Kabel ground menghubungkan terminal negatif baterai ke bodi/rangka kendaraan. Bodi kendaraan yang terbuat dari logam digunakan sebagai jalur arus balik (ground/massa), sehingga tidak perlu kabel negatif terpisah ke setiap komponen."
        }
      ]
    },

    // ===================================================================
    // LEVEL 4 — PEMINDAH TENAGA (Power Train / Drive Train)
    // ===================================================================
    {
      id: 4,
      title: "Pemindah Tenaga",
      subtitle: "Power Train / Drive Train",
      icon: "🔄",
      color: "#8b5cf6",
      description: "Pelajari sistem pemindah tenaga dari mesin ke roda, mulai dari kopling, transmisi manual dan otomatis, propeller shaft, hingga diferensial. Pahami bagaimana tenaga mesin tersalurkan untuk menggerakkan kendaraan.",
      objectives: [
        "Mengidentifikasi komponen sistem pemindah tenaga",
        "Memahami fungsi kopling dan cara kerjanya",
        "Membedakan transmisi manual dan otomatis",
        "Mengenal fungsi propeller shaft dan diferensial",
        "Memahami alur penyaluran tenaga dari mesin ke roda"
      ],

      // -----------------------------------------------------------------
      // LEARNING SLIDES
      // -----------------------------------------------------------------
      learning: [
        {
          title: "Pengenalan Sistem Pemindah Tenaga",
          content: "<h3>Apa Itu Sistem Pemindah Tenaga?</h3><p>Sistem pemindah tenaga (power train/drive train) adalah serangkaian komponen yang berfungsi <strong>menyalurkan tenaga putar dari mesin ke roda penggerak</strong> kendaraan.</p><h3>Alur Penyaluran Tenaga</h3><p>Tenaga dari mesin disalurkan melalui urutan berikut:</p><ol><li><strong>Mesin</strong> → menghasilkan tenaga putar</li><li><strong>Kopling (Clutch)</strong> → menghubungkan/memutuskan aliran tenaga</li><li><strong>Transmisi</strong> → mengatur kecepatan dan torsi</li><li><strong>Propeller Shaft</strong> → menyalurkan ke gardan (pada kendaraan FR/4WD)</li><li><strong>Diferensial (Gardan)</strong> → membagi tenaga ke roda kiri dan kanan</li><li><strong>Poros Roda (Axle Shaft)</strong> → memutar roda</li></ol><h3>Konfigurasi Penggerak</h3><ul><li><strong>FR (Front engine, Rear drive)</strong> — mesin depan, penggerak belakang</li><li><strong>FF (Front engine, Front drive)</strong> — mesin depan, penggerak depan</li><li><strong>4WD/AWD</strong> — penggerak empat roda</li></ul>",
          keyPoints: [
            "Sistem pemindah tenaga menyalurkan tenaga dari mesin ke roda",
            "Alur: Mesin → Kopling → Transmisi → Propeller Shaft → Diferensial → Roda",
            "Konfigurasi umum: FR, FF, dan 4WD/AWD"
          ],
          animation: "powertrain-overview"
        },
        {
          title: "Kopling (Clutch)",
          content: "<h3>Fungsi Kopling</h3><p>Kopling berfungsi untuk <strong>menghubungkan dan memutuskan</strong> penyaluran tenaga dari mesin ke transmisi. Kopling diperlukan saat:</p><ul><li>Menghidupkan mesin (mesin berputar tanpa menggerakkan roda)</li><li>Memindahkan gigi transmisi</li><li>Menghentikan kendaraan tanpa mematikan mesin</li></ul><h3>Komponen Utama Kopling</h3><ul><li><strong>Flywheel (Roda Gila)</strong> — piringan berat yang terpasang di ujung crankshaft. Berfungsi menyimpan energi putar dan menjadi permukaan gesekan untuk clutch disc. <strong>Letak:</strong> Antara mesin dan kopling.</li><li><strong>Clutch Disc (Kampas Kopling)</strong> — piringan dengan lapisan gesekan di kedua sisi. Terjepit antara flywheel dan pressure plate. <strong>Letak:</strong> Tepat di belakang flywheel.</li><li><strong>Pressure Plate (Plat Penekan)</strong> — menekan clutch disc ke flywheel menggunakan pegas diafragma. <strong>Letak:</strong> Di belakang clutch disc, terbungkus dalam clutch cover.</li><li><strong>Release Bearing (Bearing Pembebas)</strong> — bantalan yang menekan pegas diafragma saat pedal kopling diinjak, sehingga pressure plate melepaskan clutch disc. <strong>Letak:</strong> Pada poros input transmisi.</li></ul><h3>Cara Kerja</h3><p><strong>Kopling terhubung (pedal dilepas):</strong> Pressure plate menekan clutch disc ke flywheel → tenaga mesin tersalurkan ke transmisi.</p><p><strong>Kopling terputus (pedal diinjak):</strong> Release bearing menekan diafragma → pressure plate mundur → clutch disc bebas → tenaga terputus.</p>",
          keyPoints: [
            "Kopling menghubungkan/memutuskan tenaga dari mesin ke transmisi",
            "Komponen utama: flywheel, clutch disc, pressure plate, release bearing",
            "Pedal kopling diinjak = tenaga terputus, dilepas = tenaga terhubung"
          ],
          animation: "clutch-assembly"
        },
        {
          title: "Transmisi Manual",
          content: "<h3>Fungsi Transmisi</h3><p>Transmisi berfungsi <strong>mengatur perbandingan gigi (gear ratio)</strong> untuk menyesuaikan kecepatan dan torsi (momen putar) yang disalurkan ke roda sesuai kondisi berkendara.</p><ul><li><strong>Gigi rendah</strong> (1, 2) — kecepatan rendah, torsi besar → untuk jalan menanjak atau mulai berjalan</li><li><strong>Gigi tinggi</strong> (4, 5) — kecepatan tinggi, torsi lebih kecil → untuk jalan datar, kecepatan tinggi</li></ul><h3>Komponen Transmisi Manual</h3><ul><li><strong>Input Shaft (Poros Masuk)</strong> — menerima putaran dari clutch disc, terhubung ke mesin melalui kopling.</li><li><strong>Output Shaft (Poros Keluar)</strong> — menyalurkan putaran ke propeller shaft atau diferensial.</li><li><strong>Counter Shaft (Poros Perantara)</strong> — poros dengan roda gigi tetap yang menjadi perantara perpindahan gigi.</li><li><strong>Roda Gigi (Gear)</strong> — pasangan roda gigi dengan ukuran berbeda untuk menghasilkan perbandingan gigi yang berbeda.</li><li><strong>Synchronizer (Sinkroniser)</strong> — menyamakan kecepatan putaran gigi sebelum berkaitan, agar perpindahan gigi halus.</li><li><strong>Shift Fork (Garpu Pemindah)</strong> — mendorong sinkroniser untuk memindahkan gigi.</li></ul><p>Transmisi manual pada kendaraan ringan umumnya memiliki <strong>5 gigi maju + 1 gigi mundur</strong>.</p>",
          keyPoints: [
            "Transmisi mengatur perbandingan gigi untuk kecepatan dan torsi",
            "Gigi rendah = torsi besar, gigi tinggi = kecepatan tinggi",
            "Sinkroniser membuat perpindahan gigi lebih halus"
          ],
          animation: "manual-transmission"
        },
        {
          title: "Transmisi Otomatis",
          content: "<h3>Apa Itu Transmisi Otomatis?</h3><p>Transmisi otomatis memindahkan gigi <strong>secara otomatis</strong> tanpa pedal kopling dan tanpa perlu pengemudi memindahkan gigi secara manual. Perpindahan gigi diatur oleh <strong>TCU (Transmission Control Unit)</strong> berdasarkan kecepatan dan beban kendaraan.</p><h3>Torque Converter (Konverter Torsi)</h3><p>Pada transmisi otomatis, kopling digantikan oleh <strong>torque converter</strong> yang berfungsi:</p><ul><li>Menghubungkan mesin dengan transmisi melalui <strong>cairan (ATF)</strong> tanpa kontak langsung</li><li>Melipatgandakan torsi saat kendaraan mulai bergerak</li></ul><p><strong>Komponen torque converter:</strong></p><ul><li><strong>Impeller (Pump)</strong> — terhubung ke mesin, memutar cairan ATF</li><li><strong>Turbine</strong> — terhubung ke transmisi, diputar oleh cairan ATF</li><li><strong>Stator</strong> — mengarahkan aliran cairan untuk melipatgandakan torsi</li></ul><h3>Tuas Transmisi Otomatis</h3><ul><li><strong>P (Park)</strong> — roda terkunci, untuk parkir</li><li><strong>R (Reverse)</strong> — gigi mundur</li><li><strong>N (Neutral)</strong> — bebas, tidak ada gigi yang berkaitan</li><li><strong>D (Drive)</strong> — gigi maju otomatis</li><li><strong>L/2/3</strong> — membatasi gigi tertinggi untuk tanjakan atau engine brake</li></ul>",
          keyPoints: [
            "Transmisi otomatis memindahkan gigi secara otomatis tanpa pedal kopling",
            "Torque converter menggantikan kopling menggunakan cairan ATF",
            "Posisi tuas: P-R-N-D-L (Park, Reverse, Neutral, Drive, Low)"
          ],
          animation: "automatic-transmission"
        },
        {
          title: "Propeller Shaft & Universal Joint",
          content: "<h3>Propeller Shaft (Poros Propeler)</h3><p><strong>Fungsi:</strong> Menyalurkan tenaga putar dari output transmisi ke diferensial (gardan). Digunakan pada kendaraan dengan konfigurasi <strong>FR (Front engine Rear drive)</strong> dan <strong>4WD</strong>.</p><p><strong>Letak:</strong> Membentang di bawah kendaraan dari transmisi ke gardan belakang.</p><p><strong>Bentuk:</strong> Tabung/pipa baja panjang dan ringan. Propeller shaft harus kuat, ringan, dan seimbang agar tidak bergetar saat berputar cepat.</p><h3>Universal Joint (Sambungan Universal / Cross Joint)</h3><p><strong>Fungsi:</strong> Menghubungkan propeller shaft agar dapat menyalurkan tenaga meski sudut antara transmisi dan gardan berubah-ubah (karena suspensi bergerak naik-turun).</p><p><strong>Letak:</strong> Di kedua ujung propeller shaft.</p><p><strong>Bentuk:</strong> Berbentuk silang (+) dengan 4 bantalan (bearing cap) di setiap ujungnya.</p><h3>Slip Joint</h3><p><strong>Fungsi:</strong> Mengizinkan propeller shaft berubah panjang saat suspensi bergerak. Berupa sambungan bergerigi (spline) di salah satu ujung propeller shaft.</p><p><em>Pada kendaraan FF (Front engine Front drive), propeller shaft tidak digunakan karena mesin, transmisi, dan diferensial berada di bagian depan, terhubung langsung melalui drive shaft/axle shaft pendek.</em></p>",
          keyPoints: [
            "Propeller shaft menyalurkan tenaga dari transmisi ke diferensial",
            "Universal joint memungkinkan penyaluran tenaga meski sudut berubah",
            "Kendaraan FF tidak memerlukan propeller shaft"
          ],
          animation: "propeller-shaft"
        },
        {
          title: "Diferensial & Gardan",
          content: "<h3>Fungsi Diferensial</h3><p>Diferensial (gardan) berfungsi untuk:</p><ul><li><strong>Membelokkan arah putaran</strong> 90° dari propeller shaft ke poros roda</li><li><strong>Mengurangi kecepatan putaran</strong> dan meningkatkan torsi (reduksi akhir / final reduction)</li><li><strong>Memungkinkan roda kiri dan kanan berputar dengan kecepatan berbeda</strong> saat belok</li></ul><p>Saat kendaraan belok, roda luar harus berputar lebih cepat dari roda dalam (karena jaraknya lebih jauh). Diferensial memungkinkan hal ini.</p><h3>Komponen Diferensial</h3><ul><li><strong>Drive Pinion Gear</strong> — gigi kecil yang menerima putaran dari propeller shaft. Terletak di ujung masuk housing diferensial.</li><li><strong>Ring Gear (Crown Gear)</strong> — gigi besar yang diputar oleh drive pinion. Membelokkan arah putaran 90°.</li><li><strong>Side Gear</strong> — gigi yang terhubung langsung ke poros roda (axle shaft) kiri dan kanan.</li><li><strong>Pinion Gear (Spider Gear)</strong> — gigi kecil di antara kedua side gear yang memungkinkan perbedaan kecepatan roda kiri-kanan.</li><li><strong>Differential Case</strong> — wadah/housing yang menampung semua komponen diferensial.</li></ul><p><strong>Letak:</strong> Di bagian tengah poros belakang (rear axle) pada kendaraan FR, atau terintegrasi dengan transmisi pada kendaraan FF.</p>",
          keyPoints: [
            "Diferensial membelokkan arah putaran dan membagi tenaga ke kedua roda",
            "Memungkinkan roda kiri dan kanan berputar dengan kecepatan berbeda saat belok",
            "Komponen utama: drive pinion, ring gear, side gear, spider gear"
          ],
          animation: "differential"
        }
      ],

      // -----------------------------------------------------------------
      // SIMULATION — Drag & Drop
      // -----------------------------------------------------------------
      simulation: {
        title: "Pasang Komponen Sistem Pemindah Tenaga",
        instruction: "Seret komponen pemindah tenaga ke posisi yang benar!",
        components: [
          {
            id: "clutch-disc",
            name: "Kampas Kopling (Clutch Disc)",
            description: "Piringan dengan lapisan gesekan yang terjepit antara flywheel dan pressure plate. Menyalurkan tenaga dari mesin ke transmisi. Terletak tepat di belakang flywheel.",
            correctZone: "zone-clutch-area",
            image: "⭕"
          },
          {
            id: "pressure-plate",
            name: "Plat Penekan (Pressure Plate)",
            description: "Menekan clutch disc ke flywheel menggunakan pegas diafragma agar tenaga mesin tersalurkan. Terletak di belakang clutch disc, terbungkus dalam clutch cover.",
            correctZone: "zone-pressure-area",
            image: "🔘"
          },
          {
            id: "flywheel",
            name: "Roda Gila (Flywheel)",
            description: "Piringan besi berat di ujung crankshaft yang menyimpan energi putar dan menjadi permukaan gesekan untuk clutch disc. Terletak di ujung belakang mesin.",
            correctZone: "zone-engine-rear",
            image: "💿"
          },
          {
            id: "release-bearing",
            name: "Bearing Pembebas (Release Bearing)",
            description: "Bantalan yang menekan pegas diafragma saat pedal kopling diinjak, melepaskan tekanan pressure plate. Terletak pada poros input transmisi.",
            correctZone: "zone-input-shaft",
            image: "🔵"
          },
          {
            id: "input-shaft",
            name: "Poros Masuk Transmisi (Input Shaft)",
            description: "Poros yang menerima putaran dari clutch disc dan meneruskannya ke roda gigi dalam transmisi. Terletak di bagian depan transmisi.",
            correctZone: "zone-transmission-front",
            image: "📏"
          },
          {
            id: "transmission-gear",
            name: "Roda Gigi Transmisi (Transmission Gear)",
            description: "Pasangan roda gigi dengan ukuran berbeda yang menghasilkan perbandingan gigi (gear ratio) berbeda untuk mengatur kecepatan dan torsi. Terletak di dalam housing transmisi.",
            correctZone: "zone-transmission-body",
            image: "⚙️"
          },
          {
            id: "propeller-shaft",
            name: "Poros Propeler (Propeller Shaft)",
            description: "Tabung baja panjang yang menyalurkan tenaga putar dari transmisi ke diferensial. Terletak di bawah kendaraan (lantai). Digunakan pada kendaraan FR dan 4WD.",
            correctZone: "zone-underbody",
            image: "🔩"
          },
          {
            id: "ring-pinion",
            name: "Ring Gear & Drive Pinion",
            description: "Pasangan roda gigi pada diferensial yang membelokkan arah putaran 90° dan mereduksi kecepatan. Ring gear berbentuk gigi besar, drive pinion berbentuk gigi kerucut kecil. Terletak di dalam housing diferensial.",
            correctZone: "zone-differential",
            image: "🔄"
          }
        ],
        dropZones: [
          { id: "zone-clutch-area", label: "Area Kopling (Belakang Flywheel)", x: 28, y: 30 },
          { id: "zone-pressure-area", label: "Belakang Clutch Disc", x: 35, y: 56 },
          { id: "zone-engine-rear", label: "Ujung Belakang Mesin", x: 21, y: 56 },
          { id: "zone-input-shaft", label: "Depan Transmisi", x: 42, y: 30 },
          { id: "zone-transmission-front", label: "Poros Masuk Transmisi", x: 49, y: 56 },
          { id: "zone-transmission-body", label: "Dalam Transmisi", x: 56, y: 30 },
          { id: "zone-underbody", label: "Bawah Kendaraan (Lantai)", x: 68, y: 68 },
          { id: "zone-differential", label: "Housing Diferensial (Belakang)", x: 84, y: 50 }
        ]
      },

      // -----------------------------------------------------------------
      // QUIZ — 10 Questions
      // -----------------------------------------------------------------
      quiz: [
        {
          id: "q4-1",
          question: "Apa fungsi utama kopling (clutch) pada kendaraan bertransmisi manual?",
          image: null,
          options: [
            "Mendinginkan transmisi",
            "Menghubungkan dan memutuskan penyaluran tenaga dari mesin ke transmisi",
            "Mengatur kecepatan mesin",
            "Menyaring oli transmisi"
          ],
          correct: 1,
          explanation: "Kopling berfungsi menghubungkan dan memutuskan penyaluran tenaga dari mesin ke transmisi. Kopling dibutuhkan saat memindahkan gigi, menghidupkan mesin, dan menghentikan kendaraan tanpa mematikan mesin."
        },
        {
          id: "q4-2",
          question: "Komponen kopling yang menekan clutch disc ke flywheel adalah…",
          image: null,
          options: [
            "Release bearing",
            "Pedal kopling",
            "Pressure plate (plat penekan)",
            "Input shaft"
          ],
          correct: 2,
          explanation: "Pressure plate (plat penekan) menggunakan pegas diafragma untuk menekan clutch disc ke permukaan flywheel. Saat pedal kopling diinjak, release bearing menekan diafragma dan pressure plate melepaskan tekanan."
        },
        {
          id: "q4-3",
          question: "Mengapa roda luar harus berputar lebih cepat dari roda dalam saat kendaraan belok?",
          image: null,
          options: [
            "Karena roda luar lebih berat",
            "Karena roda luar menempuh jarak yang lebih jauh",
            "Karena rem roda dalam lebih kuat",
            "Karena roda luar lebih kecil diameternya"
          ],
          correct: 1,
          explanation: "Saat belok, roda luar menempuh lintasan yang lebih panjang (jari-jari lebih besar) dibandingkan roda dalam. Oleh karena itu, roda luar harus berputar lebih cepat. Diferensial memungkinkan perbedaan kecepatan ini."
        },
        {
          id: "q4-4",
          question: "Pada transmisi manual, gigi rendah (1, 2) menghasilkan…",
          image: null,
          options: [
            "Kecepatan tinggi, torsi kecil",
            "Kecepatan rendah, torsi besar",
            "Kecepatan dan torsi sama besar",
            "Kecepatan tinggi, torsi besar"
          ],
          correct: 1,
          explanation: "Gigi rendah (1, 2) menghasilkan kecepatan rendah tetapi torsi (momen putar) besar. Ini diperlukan saat mulai berjalan dari berhenti atau saat menanjak, karena dibutuhkan tenaga besar untuk menggerakkan kendaraan."
        },
        {
          id: "q4-5",
          question: "Pada transmisi otomatis, komponen yang menggantikan fungsi kopling adalah…",
          image: null,
          options: [
            "Synchronizer",
            "Torque converter (konverter torsi)",
            "Propeller shaft",
            "Shift fork"
          ],
          correct: 1,
          explanation: "Torque converter menggantikan kopling pada transmisi otomatis. Komponen ini menghubungkan mesin dengan transmisi melalui cairan ATF (Automatic Transmission Fluid) tanpa kontak mekanis langsung, sehingga tidak memerlukan pedal kopling."
        },
        {
          id: "q4-6",
          question: "Apa fungsi universal joint pada propeller shaft?",
          image: null,
          options: [
            "Memperkuat propeller shaft agar tidak patah",
            "Memungkinkan penyaluran tenaga meskipun sudut antara transmisi dan gardan berubah",
            "Mengurangi kecepatan putaran",
            "Meredam suara propeller shaft"
          ],
          correct: 1,
          explanation: "Universal joint (cross joint) memungkinkan propeller shaft menyalurkan tenaga putar meskipun sudut antara transmisi dan diferensial berubah-ubah akibat gerakan naik-turun suspensi. Bentuknya silang (+) dengan bearing di setiap ujung."
        },
        {
          id: "q4-7",
          question: "Komponen diferensial yang membelokkan arah putaran 90° dari propeller shaft ke poros roda adalah…",
          image: null,
          options: [
            "Side gear dan spider gear",
            "Drive pinion dan ring gear",
            "Synchronizer",
            "Release bearing"
          ],
          correct: 1,
          explanation: "Drive pinion (gigi kerucut kecil) menerima putaran dari propeller shaft dan memutar ring gear (gigi besar). Pasangan gigi ini membelokkan arah putaran 90° dan sekaligus mereduksi kecepatan putaran (memperbesar torsi)."
        },
        {
          id: "q4-8",
          question: "Pada kendaraan dengan konfigurasi FF (Front engine, Front drive), komponen yang TIDAK digunakan adalah…",
          image: null,
          options: [
            "Kopling",
            "Transmisi",
            "Propeller shaft (poros propeler panjang)",
            "Diferensial"
          ],
          correct: 2,
          explanation: "Pada kendaraan FF, mesin, transmisi, dan diferensial berada di bagian depan dan tergabung dalam satu unit (transaxle). Oleh karena itu, propeller shaft panjang tidak diperlukan. Tenaga disalurkan langsung melalui drive shaft pendek ke roda depan."
        },
        {
          id: "q4-9",
          question: "Posisi 'P' pada tuas transmisi otomatis berfungsi untuk…",
          image: null,
          options: [
            "Mengaktifkan gigi mundur",
            "Melepaskan semua gigi (netral)",
            "Mengunci roda penggerak agar kendaraan tidak bergerak saat diparkir",
            "Mengaktifkan gigi maju otomatis"
          ],
          correct: 2,
          explanation: "Posisi P (Park) pada transmisi otomatis mengunci output shaft transmisi menggunakan pawl (pengunci) sehingga roda penggerak tidak dapat berputar. Posisi ini digunakan saat kendaraan diparkir."
        },
        {
          id: "q4-10",
          question: "Flywheel (roda gila) terletak di…",
          image: null,
          options: [
            "Di dalam transmisi",
            "Di ujung belakang crankshaft (antara mesin dan kopling)",
            "Di dalam diferensial",
            "Di ujung propeller shaft"
          ],
          correct: 1,
          explanation: "Flywheel terpasang di ujung belakang crankshaft, tepatnya antara mesin dan kopling. Flywheel berfungsi menyimpan energi putar agar putaran mesin stabil, dan permukaannya menjadi bidang gesekan untuk clutch disc."
        }
      ]
    },

    // ===================================================================
    // LEVEL 5 — BAHAN BAKAR & PENDINGIN (Fuel & Cooling System)
    // ===================================================================
    {
      id: 5,
      title: "Bahan Bakar & Pendingin",
      subtitle: "Fuel & Cooling System",
      icon: "⛽",
      color: "#22c55e",
      description: "Pelajari sistem bahan bakar (bensin & diesel) dan sistem pendingin kendaraan. Kenali komponen-komponen seperti fuel injector, radiator, thermostat, dan cara kerja sistem Electronic Fuel Injection (EFI).",
      objectives: [
        "Mengidentifikasi komponen sistem bahan bakar",
        "Memahami perbedaan sistem karburator dan injeksi elektronik (EFI)",
        "Mengenal komponen sistem pendingin mesin",
        "Memahami cara kerja sistem pendingin air",
        "Mengetahui dasar-dasar perawatan sistem BBM dan pendingin"
      ],

      // -----------------------------------------------------------------
      // LEARNING SLIDES
      // -----------------------------------------------------------------
      learning: [
        {
          title: "Sistem Bahan Bakar Bensin",
          content: "<h3>Fungsi Sistem Bahan Bakar</h3><p>Sistem bahan bakar berfungsi <strong>menyimpan, menyalurkan, dan menyuplai bahan bakar</strong> ke ruang bakar mesin dalam jumlah yang tepat sesuai kebutuhan mesin.</p><h3>Komponen Utama</h3><ul><li><strong>Tangki Bahan Bakar (Fuel Tank)</strong> — wadah penyimpan BBM. Terletak di bagian bawah belakang kendaraan, di bawah jok belakang atau bagasi. Kapasitas umumnya 40-65 liter.</li><li><strong>Fuel Pump (Pompa Bahan Bakar)</strong> — memompa BBM dari tangki ke mesin. Pada sistem EFI, pompa listrik terletak <strong>di dalam tangki</strong> (in-tank type). Tekanan pompa sekitar 2,5-4 bar.</li><li><strong>Fuel Filter (Saringan BBM)</strong> — menyaring kotoran dan partikel dari BBM sebelum masuk ke injector/karburator. Mencegah penyumbatan.</li><li><strong>Fuel Line (Saluran BBM)</strong> — pipa dan selang yang menghubungkan tangki, filter, dan mesin.</li></ul><h3>Sistem Karburator vs Injeksi</h3><ul><li><strong>Karburator</strong> — mencampur BBM dan udara secara mekanis menggunakan venturi. Sistem lama, jarang digunakan pada kendaraan baru.</li><li><strong>Fuel Injection (EFI)</strong> — menyemprotkan BBM secara elektronik melalui injector. Lebih akurat, efisien, dan ramah lingkungan.</li></ul>",
          keyPoints: [
            "Sistem BBM menyimpan, menyalurkan, dan menyuplai bahan bakar ke mesin",
            "Komponen utama: tangki, fuel pump, fuel filter, fuel line",
            "Sistem EFI lebih akurat dan efisien dibanding karburator"
          ],
          animation: "fuel-system-gasoline"
        },
        {
          title: "Sistem Injeksi Elektronik (EFI)",
          content: "<h3>Apa Itu EFI?</h3><p><strong>Electronic Fuel Injection (EFI)</strong> adalah sistem yang menyemprotkan bahan bakar ke dalam saluran masuk (intake manifold) atau langsung ke ruang bakar secara elektronik, dikontrol oleh komputer kendaraan.</p><h3>Komponen EFI</h3><ul><li><strong>ECU (Electronic Control Unit)</strong> — komputer kendaraan yang mengontrol jumlah dan waktu penyemprotan BBM berdasarkan data dari berbagai sensor. Terletak di ruang mesin atau di bawah dashboard.</li><li><strong>Injector (Injektor)</strong> — katup elektromagnetik yang menyemprotkan BBM dalam bentuk kabut halus ke saluran masuk. Terletak di intake manifold dekat kepala silinder. Setiap silinder memiliki 1 injector.</li><li><strong>Throttle Body</strong> — mengatur jumlah udara yang masuk ke mesin berdasarkan posisi pedal gas.</li></ul><h3>Sensor-Sensor Penting</h3><ul><li><strong>MAP/MAF Sensor</strong> — mengukur tekanan/jumlah udara masuk</li><li><strong>TPS (Throttle Position Sensor)</strong> — mendeteksi posisi katup throttle</li><li><strong>O₂ Sensor (Lambda Sensor)</strong> — mengukur kadar oksigen pada gas buang</li><li><strong>CKP (Crankshaft Position Sensor)</strong> — mendeteksi posisi dan kecepatan crankshaft</li><li><strong>ECT (Engine Coolant Temperature)</strong> — mengukur suhu air pendingin mesin</li></ul>",
          keyPoints: [
            "EFI mengontrol penyemprotan BBM secara elektronik melalui ECU",
            "Injector menyemprotkan BBM dalam bentuk kabut halus",
            "Sensor-sensor memberikan data ke ECU untuk perhitungan BBM yang tepat"
          ],
          animation: "efi-system"
        },
        {
          title: "Sistem Bahan Bakar Diesel",
          content: "<h3>Perbedaan dengan Sistem Bensin</h3><p>Sistem bahan bakar diesel berbeda dari bensin dalam beberapa hal:</p><ul><li>Tekanan penyemprotan jauh lebih tinggi (hingga 2.000+ bar pada Common Rail)</li><li>BBM disemprotkan langsung ke ruang bakar (direct injection)</li><li>Tidak menggunakan busi — pembakaran terjadi karena tekanan tinggi</li></ul><h3>Sistem Common Rail</h3><p>Sistem diesel modern menggunakan <strong>Common Rail Direct Injection (CRDi)</strong>:</p><ul><li><strong>High Pressure Pump</strong> — memompa solar bertekanan sangat tinggi ke common rail</li><li><strong>Common Rail</strong> — pipa penampung (accumulator) yang menyimpan solar bertekanan tinggi dan mendistribusikannya ke setiap injector</li><li><strong>Injector Piezoelectric/Solenoid</strong> — menyemprotkan solar ke ruang bakar dengan waktu dan jumlah yang dikontrol ECU</li></ul><h3>Komponen Pendukung</h3><ul><li><strong>Fuel Water Separator</strong> — memisahkan air dari solar (air merusak komponen diesel)</li><li><strong>Glow Plug (Busi Pemanas)</strong> — memanaskan ruang bakar saat mesin dingin untuk membantu starting</li></ul><p><em>⚠️ K3: Jangan pernah mengisi tangki diesel dengan bensin atau sebaliknya! Hal ini dapat merusak seluruh sistem bahan bakar.</em></p>",
          keyPoints: [
            "Sistem diesel menggunakan tekanan sangat tinggi untuk penyemprotan",
            "Common Rail menyimpan solar bertekanan tinggi untuk semua injector",
            "Mesin diesel tidak menggunakan busi tetapi glow plug untuk starting dingin"
          ],
          animation: "diesel-fuel-system"
        },
        {
          title: "Sistem Pendingin Mesin",
          content: "<h3>Mengapa Mesin Perlu Didinginkan?</h3><p>Pembakaran di dalam mesin menghasilkan panas hingga <strong>2.000°C+</strong>. Tanpa pendinginan, mesin akan <strong>overheat</strong> (terlalu panas) yang menyebabkan:</p><ul><li>Oli menipis dan kehilangan fungsi pelumasan</li><li>Komponen mesin memuai dan macet</li><li>Head gasket rusak</li><li>Mesin mengalami kerusakan permanen</li></ul><h3>Jenis Sistem Pendingin</h3><ul><li><strong>Pendingin Udara (Air Cooling)</strong> — menggunakan sirip-sirip pendingin pada silinder. Sederhana, digunakan pada sepeda motor.</li><li><strong>Pendingin Air (Water Cooling)</strong> — menggunakan cairan pendingin (coolant) yang disirkulasikan melalui water jacket di blok mesin. Digunakan pada hampir semua kendaraan ringan.</li></ul><h3>Suhu Kerja Normal</h3><p>Mesin bekerja optimal pada suhu <strong>80–95°C</strong>. Suhu di bawah itu membuat mesin kurang efisien, di atasnya berisiko overheat.</p>",
          keyPoints: [
            "Mesin harus didinginkan untuk mencegah overheat dan kerusakan",
            "Kendaraan ringan menggunakan sistem pendingin air (water cooling)",
            "Suhu kerja normal mesin: 80–95°C"
          ],
          animation: "cooling-overview"
        },
        {
          title: "Komponen Sistem Pendingin",
          content: "<h3>Radiator</h3><p><strong>Fungsi:</strong> Mendinginkan cairan pendingin (coolant) yang telah menyerap panas dari mesin. Coolant panas mengalir melalui inti radiator (core) yang memiliki sirip-sirip tipis, dan didinginkan oleh aliran udara.</p><p><strong>Letak:</strong> Di bagian paling depan kendaraan, di belakang bumper/grille depan.</p><h3>Thermostat</h3><p><strong>Fungsi:</strong> Katup otomatis yang mengatur aliran coolant berdasarkan suhu. Tertutup saat mesin dingin (agar mesin cepat mencapai suhu kerja), terbuka saat suhu mencapai sekitar 80-90°C.</p><p><strong>Letak:</strong> Pada saluran coolant antara mesin dan radiator (biasanya di housing thermostat pada kepala silinder).</p><h3>Water Pump (Pompa Air)</h3><p><strong>Fungsi:</strong> Memompa dan mensirkulasikan coolant melalui water jacket di mesin dan radiator.</p><p><strong>Letak:</strong> Di bagian depan mesin, digerakkan oleh timing belt atau drive belt.</p><h3>Kipas Pendingin (Cooling Fan)</h3><p><strong>Fungsi:</strong> Menarik atau mendorong udara melewati radiator, terutama saat kendaraan berjalan lambat atau berhenti.</p><h3>Coolant (Cairan Pendingin)</h3><p>Campuran air suling dan <strong>anti-freeze/coolant</strong> (etilen glikol). Mencegah pembekuan, menaikkan titik didih, dan mencegah korosi.</p>",
          keyPoints: [
            "Radiator mendinginkan coolant dengan aliran udara",
            "Thermostat mengatur aliran coolant berdasarkan suhu mesin",
            "Water pump mensirkulasikan coolant melalui mesin dan radiator"
          ],
          animation: "cooling-components"
        },
        {
          title: "Sistem AC Kendaraan — Pengenalan Dasar",
          content: "<h3>Fungsi Sistem AC</h3><p>Sistem AC (Air Conditioning) berfungsi <strong>mendinginkan, mengeringkan, dan menyaring udara</strong> di dalam kabin kendaraan untuk kenyamanan penumpang.</p><h3>Prinsip Kerja</h3><p>AC bekerja berdasarkan prinsip <strong>refrigerasi</strong> — refrigeran (freon) berubah fase antara cair dan gas, menyerap dan melepaskan panas.</p><h3>Komponen Utama AC</h3><ul><li><strong>Kompresor (Compressor)</strong> — memompa dan mengkompresi refrigeran. Digerakkan oleh mesin melalui drive belt. Terletak di depan mesin.</li><li><strong>Kondensor (Condenser)</strong> — melepaskan panas dari refrigeran ke udara luar. Bentuknya seperti radiator mini. Terletak di depan radiator.</li><li><strong>Evaporator</strong> — menyerap panas dari udara kabin. Refrigeran cair menguap di sini, mendinginkan udara yang dihembuskan ke kabin. Terletak di dalam dashboard.</li><li><strong>Expansion Valve</strong> — menurunkan tekanan refrigeran sebelum masuk evaporator.</li><li><strong>Dryer/Receiver</strong> — menyaring dan menghilangkan kelembaban dari refrigeran.</li></ul><p><em>⚠️ K3: Refrigeran bertekanan tinggi dan dapat menyebabkan luka beku (frostbite). Perbaikan AC harus dilakukan oleh teknisi berpengalaman dengan peralatan yang sesuai!</em></p>",
          keyPoints: [
            "AC mendinginkan udara kabin menggunakan siklus refrigerasi",
            "Komponen utama: kompresor, kondensor, evaporator, expansion valve",
            "Refrigeran berubah fase (cair ↔ gas) untuk menyerap dan melepas panas"
          ],
          animation: "ac-system"
        },
        {
          title: "Perawatan Sistem BBM & Pendingin",
          content: "<h3>Perawatan Sistem Bahan Bakar</h3><ul><li><strong>Gunakan BBM yang sesuai</strong> — perhatikan angka oktan (RON) untuk bensin atau cetane number untuk solar sesuai rekomendasi pabrikan</li><li><strong>Ganti fuel filter</strong> secara berkala (setiap 40.000–60.000 km)</li><li><strong>Jangan biarkan tangki kosong</strong> — BBM yang sangat sedikit menyebabkan fuel pump cepat rusak karena tidak terendam dan tidak terdinginkan oleh BBM</li><li><strong>Perhatikan indikator Check Engine</strong> — sering berkaitan dengan masalah sensor atau injector</li></ul><h3>Perawatan Sistem Pendingin</h3><ul><li><strong>Periksa level coolant</strong> secara berkala — pada reservoir dan radiator (saat mesin dingin!)</li><li><strong>Ganti coolant</strong> setiap 2 tahun atau 40.000 km</li><li><strong>Periksa kondisi selang radiator</strong> — jangan sampai retak, bocor, atau menggelembung</li><li><strong>Bersihkan sirip radiator</strong> dari kotoran yang menyumbat aliran udara</li><li><strong>Periksa kerja kipas pendingin</strong> — pastikan menyala saat suhu mesin tinggi</li></ul><p><em>⚠️ K3: JANGAN PERNAH membuka tutup radiator saat mesin panas! Cairan bertekanan dapat menyembur dan menyebabkan luka bakar parah!</em></p>",
          keyPoints: [
            "Gunakan BBM sesuai rekomendasi pabrikan (oktan/cetane yang benar)",
            "Periksa dan ganti coolant secara berkala",
            "Jangan buka tutup radiator saat mesin panas — risiko luka bakar!"
          ],
          animation: "maintenance-fuel-cooling"
        }
      ],

      // -----------------------------------------------------------------
      // SIMULATION — Drag & Drop
      // -----------------------------------------------------------------
      simulation: {
        title: "Pasang Komponen Sistem BBM & Pendingin",
        instruction: "Seret komponen sistem bahan bakar dan pendingin ke posisi yang benar!",
        components: [
          {
            id: "fuel-tank",
            name: "Tangki Bahan Bakar (Fuel Tank)",
            description: "Wadah penyimpan BBM, kapasitas 40-65 liter. Terletak di bagian bawah belakang kendaraan, di bawah lantai jok belakang atau bagasi.",
            correctZone: "zone-rear-under",
            image: "⛽"
          },
          {
            id: "fuel-pump",
            name: "Pompa Bahan Bakar (Fuel Pump)",
            description: "Pompa listrik yang memompa BBM dari tangki ke mesin dengan tekanan 2,5-4 bar. Pada sistem EFI, terletak di dalam tangki (in-tank type).",
            correctZone: "zone-in-tank",
            image: "🔌"
          },
          {
            id: "fuel-filter",
            name: "Saringan BBM (Fuel Filter)",
            description: "Menyaring kotoran dan partikel dari BBM sebelum masuk ke injector. Terletak di antara tangki BBM dan mesin, biasanya di bawah kendaraan atau di ruang mesin.",
            correctZone: "zone-fuel-line-mid",
            image: "🔲"
          },
          {
            id: "injector",
            name: "Injektor (Fuel Injector)",
            description: "Katup elektromagnetik yang menyemprotkan BBM dalam bentuk kabut halus ke saluran masuk atau ruang bakar. Terletak di intake manifold dekat kepala silinder.",
            correctZone: "zone-intake-manifold",
            image: "💉"
          },
          {
            id: "radiator",
            name: "Radiator",
            description: "Mendinginkan coolant yang telah menyerap panas dari mesin. Coolant panas mengalir melalui inti radiator dan didinginkan oleh udara. Terletak di paling depan kendaraan.",
            correctZone: "zone-front-grille",
            image: "🌡️"
          },
          {
            id: "thermostat",
            name: "Termostat (Thermostat)",
            description: "Katup otomatis yang mengatur aliran coolant berdasarkan suhu. Tertutup saat dingin, terbuka saat suhu ±80-90°C. Terletak pada housing di kepala silinder.",
            correctZone: "zone-engine-top",
            image: "🌡️"
          },
          {
            id: "water-pump",
            name: "Pompa Air (Water Pump)",
            description: "Memompa dan mensirkulasikan coolant melalui water jacket di mesin dan radiator. Terletak di depan mesin, digerakkan oleh timing belt atau drive belt.",
            correctZone: "zone-engine-front",
            image: "🔄"
          },
          {
            id: "fan-belt",
            name: "Fan Belt / Drive Belt",
            description: "Sabuk karet yang menghubungkan puli crankshaft ke alternator, water pump, kompresor AC, dan pompa power steering. Terletak di bagian depan mesin.",
            correctZone: "zone-belt-area",
            image: "➰"
          }
        ],
        dropZones: [
          { id: "zone-rear-under", label: "Bawah Belakang Kendaraan", x: 78, y: 72 },
          { id: "zone-in-tank", label: "Dalam Tangki BBM", x: 88, y: 56 },
          { id: "zone-fuel-line-mid", label: "Saluran BBM (Tengah)", x: 55, y: 70 },
          { id: "zone-intake-manifold", label: "Intake Manifold (Mesin)", x: 38, y: 36 },
          { id: "zone-front-grille", label: "Depan Kendaraan (Grille)", x: 8, y: 40 },
          { id: "zone-engine-top", label: "Atas Mesin (Kepala Silinder)", x: 30, y: 22 },
          { id: "zone-engine-front", label: "Depan Mesin", x: 24, y: 33 },
          { id: "zone-belt-area", label: "Area Belt (Depan Mesin)", x: 15, y: 47 }
        ]
      },

      // -----------------------------------------------------------------
      // QUIZ — 10 Questions
      // -----------------------------------------------------------------
      quiz: [
        {
          id: "q5-1",
          question: "Di manakah letak fuel pump (pompa BBM) pada sistem EFI modern?",
          image: null,
          options: [
            "Di ruang mesin, dekat karburator",
            "Di dalam tangki bahan bakar (in-tank type)",
            "Di bawah radiator",
            "Di dalam transmisi"
          ],
          correct: 1,
          explanation: "Pada sistem EFI modern, fuel pump (pompa BBM) listrik terletak di dalam tangki bahan bakar (in-tank type). Posisi ini membantu mendinginkan pompa dengan BBM di sekitarnya dan mengurangi kemungkinan vapor lock."
        },
        {
          id: "q5-2",
          question: "Apa fungsi injector (injektor) pada sistem EFI?",
          image: null,
          options: [
            "Menyaring kotoran dari BBM",
            "Menyimpan BBM bertekanan tinggi",
            "Menyemprotkan BBM dalam bentuk kabut halus ke saluran masuk/ruang bakar",
            "Mengukur jumlah udara masuk"
          ],
          correct: 2,
          explanation: "Injector (injektor) adalah katup elektromagnetik yang menyemprotkan BBM dalam bentuk kabut halus ke intake manifold atau langsung ke ruang bakar. Waktu dan jumlah penyemprotan dikontrol oleh ECU berdasarkan data sensor."
        },
        {
          id: "q5-3",
          question: "Fungsi thermostat pada sistem pendingin adalah…",
          image: null,
          options: [
            "Memompa coolant ke seluruh mesin",
            "Mengatur aliran coolant berdasarkan suhu — tertutup saat dingin, terbuka saat panas",
            "Mendinginkan coolant seperti radiator",
            "Mengukur level coolant"
          ],
          correct: 1,
          explanation: "Thermostat adalah katup otomatis yang tertutup saat mesin dingin (agar mesin cepat mencapai suhu kerja) dan terbuka saat suhu mencapai 80-90°C (agar coolant mengalir ke radiator untuk didinginkan)."
        },
        {
          id: "q5-4",
          question: "Suhu kerja normal mesin kendaraan ringan adalah sekitar…",
          image: null,
          options: [
            "40–55°C",
            "80–95°C",
            "120–150°C",
            "200–250°C"
          ],
          correct: 1,
          explanation: "Suhu kerja normal mesin kendaraan ringan adalah sekitar 80–95°C. Pada suhu ini, mesin bekerja paling efisien. Di bawah suhu ini mesin kurang efisien, di atasnya berisiko overheat yang dapat merusak mesin."
        },
        {
          id: "q5-5",
          question: "Komponen sistem pendingin yang terletak paling depan pada kendaraan adalah…",
          image: null,
          options: [
            "Water pump",
            "Thermostat",
            "Radiator",
            "Oil cooler"
          ],
          correct: 2,
          explanation: "Radiator terletak di bagian paling depan kendaraan, di belakang bumper dan grille depan. Posisi ini memungkinkan radiator mendapatkan aliran udara maksimal saat kendaraan berjalan untuk mendinginkan coolant."
        },
        {
          id: "q5-6",
          question: "Apa yang TIDAK boleh dilakukan saat mesin dalam kondisi panas?",
          image: null,
          options: [
            "Menyalakan AC",
            "Memeriksa level oli mesin",
            "Membuka tutup radiator",
            "Mematikan mesin"
          ],
          correct: 2,
          explanation: "JANGAN PERNAH membuka tutup radiator saat mesin panas! Cairan pendingin bertekanan tinggi dan bersuhu tinggi dapat menyembur keluar dan menyebabkan luka bakar serius. Tunggu mesin benar-benar dingin sebelum membuka tutup radiator."
        },
        {
          id: "q5-7",
          question: "ECU pada sistem EFI berfungsi sebagai…",
          image: null,
          options: [
            "Pompa bahan bakar cadangan",
            "Komputer yang mengontrol jumlah dan waktu penyemprotan BBM",
            "Sensor pengukur suhu mesin",
            "Filter udara elektronik"
          ],
          correct: 1,
          explanation: "ECU (Electronic Control Unit) adalah komputer kendaraan yang menerima data dari berbagai sensor dan menghitung jumlah serta waktu penyemprotan BBM yang optimal. ECU mengontrol injector untuk menyemprotkan BBM dengan presisi."
        },
        {
          id: "q5-8",
          question: "Pada sistem diesel Common Rail, fungsi common rail adalah…",
          image: null,
          options: [
            "Menyaring solar dari air",
            "Menyimpan solar bertekanan tinggi dan mendistribusikannya ke setiap injector",
            "Mendinginkan solar sebelum disemprotkan",
            "Menghasilkan percikan api untuk pembakaran"
          ],
          correct: 1,
          explanation: "Common rail adalah pipa penampung (accumulator) yang menyimpan solar bertekanan sangat tinggi dan mendistribusikannya ke setiap injector. Sistem ini memungkinkan tekanan penyemprotan yang konsisten dan kontrol yang lebih presisi."
        },
        {
          id: "q5-9",
          question: "Water pump pada kendaraan digerakkan oleh…",
          image: null,
          options: [
            "Motor listrik terpisah",
            "Timing belt atau drive belt dari crankshaft",
            "Tekanan air pendingin",
            "Tenaga baterai"
          ],
          correct: 1,
          explanation: "Water pump digerakkan oleh timing belt atau drive belt yang terhubung ke puli crankshaft. Saat mesin berputar, water pump ikut berputar dan mensirkulasikan coolant melalui water jacket di mesin dan radiator."
        },
        {
          id: "q5-10",
          question: "Mengapa tangki BBM tidak boleh dibiarkan hampir kosong dalam waktu lama?",
          image: null,
          options: [
            "Tangki akan berkarat karena udara masuk",
            "Fuel pump dapat cepat rusak karena tidak terendam dan terdinginkan oleh BBM",
            "Bensin akan berubah menjadi air",
            "Kendaraan tidak bisa dikunci"
          ],
          correct: 1,
          explanation: "Fuel pump yang terendam di dalam tangki BBM menggunakan BBM di sekitarnya untuk pendinginan. Jika tangki hampir kosong, pompa tidak terendam sehingga kepanasan dan cepat rusak. Selalu isi BBM minimal ¼ tangki."
        }
      ]
    },

    // ===================================================================
    // LEVEL 6 — UJIAN AKHIR: MASTER TEST (Final Exam)
    // ===================================================================
    {
      id: 6,
      title: "Ujian Akhir — Master Test",
      subtitle: "Final Comprehensive Exam",
      icon: "🏆",
      color: "#f59e0b",
      description: "Ujian akhir komprehensif yang menguji seluruh pengetahuan dari Level 1 sampai 5. Buktikan kemampuanmu dan raih gelar Master Technician! Soal mencakup semua sistem: rem, mesin, kelistrikan, pemindah tenaga, BBM, dan pendingin.",
      objectives: [
        "Menguasai seluruh materi dari Level 1 hingga Level 5",
        "Memahami hubungan antar sistem pada kendaraan",
        "Menerapkan pengetahuan K3 di bengkel otomotif",
        "Mengidentifikasi komponen dari berbagai sistem secara tepat",
        "Siap menjadi mekanik pemula yang kompeten"
      ],

      // -----------------------------------------------------------------
      // LEARNING SLIDES — Ringkasan
      // -----------------------------------------------------------------
      learning: [
        {
          title: "Ringkasan Seluruh Sistem Kendaraan",
          content: "<h3>6 Sistem Utama yang Telah Dipelajari</h3><ul><li><strong>🔴 Sistem Rem</strong> — menghentikan kendaraan menggunakan gesekan. Komponen: master cylinder, brake booster, kaliper, kampas rem, brake shoe, wheel cylinder, ABS.</li><li><strong>⚙️ Mesin (Engine)</strong> — mengubah energi BBM menjadi gerak melalui siklus 4 langkah. Komponen: piston, connecting rod, crankshaft, camshaft, valve, cylinder head.</li><li><strong>⚡ Sistem Kelistrikan</strong> — menyediakan listrik untuk semua komponen. Komponen: baterai, alternator, motor starter, sekring, relay, lampu.</li><li><strong>🔄 Pemindah Tenaga</strong> — menyalurkan tenaga dari mesin ke roda. Komponen: kopling, transmisi, propeller shaft, diferensial.</li><li><strong>⛽ Bahan Bakar</strong> — menyuplai BBM ke mesin. Komponen: tangki, fuel pump, fuel filter, injector, ECU.</li><li><strong>🌡️ Sistem Pendingin</strong> — menjaga suhu mesin optimal. Komponen: radiator, thermostat, water pump, coolant, kipas.</li></ul><p><em>Setiap sistem saling terhubung dan bekerja sama agar kendaraan berjalan dengan aman, nyaman, dan efisien.</em></p>",
          keyPoints: [
            "Kendaraan memiliki 6 sistem utama yang saling terhubung",
            "Setiap sistem memiliki komponen dengan fungsi spesifik",
            "Pemahaman menyeluruh diperlukan untuk menjadi mekanik yang kompeten"
          ],
          animation: "vehicle-systems-overview"
        },
        {
          title: "Hubungan Antar Sistem",
          content: "<h3>Bagaimana Sistem Saling Terhubung?</h3><p>Tidak ada sistem yang bekerja sendiri. Semuanya saling bergantung:</p><ul><li><strong>Mesin</strong> menghasilkan tenaga → disalurkan melalui <strong>pemindah tenaga</strong> ke roda</li><li><strong>Sistem BBM</strong> menyuplai bahan bakar ke <strong>mesin</strong></li><li><strong>Sistem pendingin</strong> menjaga suhu <strong>mesin</strong> agar optimal</li><li><strong>Sistem kelistrikan</strong> menyuplai listrik ke <strong>semua sistem</strong> (busi, sensor, ECU, pompa, starter, lampu)</li><li><strong>Alternator</strong> diputar oleh <strong>mesin</strong> untuk menghasilkan listrik</li><li><strong>Sistem rem</strong> menggunakan <strong>vakum dari intake mesin</strong> untuk brake booster</li><li><strong>ECU</strong> mengontrol injector (<strong>BBM</strong>), ignition coil (<strong>kelistrikan</strong>), dan berbagai aktuator</li></ul><h3>Contoh Keterkaitan</h3><p>Jika <strong>alternator rusak</strong> → baterai tidak terisi → <strong>semua sistem kelistrikan terganggu</strong> → mesin bisa mati.</p><p>Jika <strong>thermostat macet tertutup</strong> → coolant tidak mengalir ke radiator → <strong>mesin overheat</strong> → bisa merusak head gasket, mesin, dan sistem pelumasan.</p>",
          keyPoints: [
            "Semua sistem kendaraan saling terhubung dan bergantung satu sama lain",
            "Kerusakan pada satu sistem dapat memengaruhi sistem lainnya",
            "ECU menghubungkan dan mengontrol banyak sistem sekaligus"
          ],
          animation: "system-interconnection"
        },
        {
          title: "Tips Menjadi Mekanik Profesional & K3",
          content: "<h3>Keselamatan dan Kesehatan Kerja (K3)</h3><p>K3 adalah prioritas utama di bengkel otomotif:</p><ul><li><strong>APD (Alat Pelindung Diri)</strong> — selalu gunakan sarung tangan, kacamata pelindung, sepatu safety, dan pakaian kerja</li><li><strong>Ventilasi</strong> — pastikan area kerja berventilasi baik, terutama saat mesin hidup (gas buang beracun/CO)</li><li><strong>Peralatan</strong> — gunakan alat sesuai fungsinya, periksa kondisi alat sebelum digunakan</li><li><strong>Kendaraan</strong> — gunakan jack stand (penyangga), jangan hanya andalkan dongkrak saat bekerja di bawah kendaraan</li><li><strong>Kebersihan</strong> — bersihkan tumpahan oli dan BBM segera, risiko tergelincir dan kebakaran</li></ul><h3>Tips untuk Calon Mekanik</h3><ul><li>📚 Terus belajar — teknologi otomotif berkembang pesat (EV, hybrid, ADAS)</li><li>🔧 Latihan praktek — keterampilan tangan sama pentingnya dengan teori</li><li>📋 Disiplin — ikuti SOP dan manual servis pabrikan</li><li>💬 Komunikasi — kemampuan menjelaskan masalah ke pelanggan sangat penting</li><li>🎯 Sertifikasi — kejar sertifikasi kompetensi dari LSP/BNSP untuk karir yang lebih baik</li></ul><p><em>Selamat! Kamu telah mempelajari dasar-dasar teknik otomotif. Terus semangat belajar dan berlatih!</em></p>",
          keyPoints: [
            "K3 adalah prioritas utama — selalu gunakan APD dan ikuti prosedur keselamatan",
            "Mekanik profesional harus menguasai teori DAN praktek",
            "Kejar sertifikasi kompetensi untuk meningkatkan karir"
          ],
          animation: "safety-tips"
        }
      ],

      // -----------------------------------------------------------------
      // SIMULATION — Mixed Components from All Levels
      // -----------------------------------------------------------------
      simulation: {
        title: "Ujian Simulasi — Kenali Semua Komponen!",
        instruction: "Seret komponen dari berbagai sistem ke posisi yang benar pada kendaraan!",
        components: [
          {
            id: "final-brake-pad",
            name: "Kampas Rem (Brake Pad)",
            description: "Bantalan yang bergesekan dengan cakram untuk menghentikan roda. Terletak di dalam kaliper pada roda depan.",
            correctZone: "zone-f-front-wheel",
            image: "🔲"
          },
          {
            id: "final-piston",
            name: "Piston",
            description: "Komponen yang bergerak naik-turun di dalam silinder mesin. Menerima tekanan pembakaran dan menggerakkan crankshaft melalui connecting rod.",
            correctZone: "zone-f-cylinder",
            image: "🔵"
          },
          {
            id: "final-battery",
            name: "Baterai / Aki",
            description: "Sumber listrik utama kendaraan, 12V DC. Menyuplai arus ke starter dan peralatan. Terletak di sudut ruang mesin.",
            correctZone: "zone-f-engine-corner",
            image: "🔋"
          },
          {
            id: "final-clutch-disc",
            name: "Kampas Kopling (Clutch Disc)",
            description: "Piringan gesekan yang menghubungkan tenaga mesin ke transmisi. Terjepit antara flywheel dan pressure plate.",
            correctZone: "zone-f-clutch",
            image: "⭕"
          },
          {
            id: "final-radiator",
            name: "Radiator",
            description: "Mendinginkan cairan pendingin mesin menggunakan aliran udara. Terletak di bagian paling depan kendaraan, di belakang grille.",
            correctZone: "zone-f-front",
            image: "🌡️"
          },
          {
            id: "final-alternator",
            name: "Alternator",
            description: "Generator listrik yang mengisi baterai dan menyuplai listrik saat mesin hidup. Diputar oleh drive belt. Terletak di depan mesin.",
            correctZone: "zone-f-engine-front",
            image: "🔌"
          },
          {
            id: "final-injector",
            name: "Injektor (Fuel Injector)",
            description: "Menyemprotkan BBM dalam bentuk kabut halus ke intake manifold. Dikontrol oleh ECU. Terletak di dekat kepala silinder.",
            correctZone: "zone-f-intake",
            image: "💉"
          },
          {
            id: "final-propeller-shaft",
            name: "Propeller Shaft",
            description: "Poros panjang yang menyalurkan tenaga dari transmisi ke diferensial. Terletak di bawah kendaraan pada konfigurasi FR.",
            correctZone: "zone-f-underbody",
            image: "🔩"
          },
          {
            id: "final-thermostat",
            name: "Thermostat",
            description: "Katup otomatis yang mengatur aliran coolant berdasarkan suhu mesin. Tertutup saat dingin, terbuka saat ±80-90°C.",
            correctZone: "zone-f-engine-top",
            image: "🌡️"
          },
          {
            id: "final-master-cylinder",
            name: "Master Silinder",
            description: "Mengubah tekanan pedal rem menjadi tekanan hidraulis. Terletak di ruang mesin, menempel pada brake booster di depan firewall.",
            correctZone: "zone-f-firewall",
            image: "🔩"
          }
        ],
        dropZones: [
          { id: "zone-f-front-wheel", label: "Roda Depan (Kaliper)", x: 15, y: 55 },
          { id: "zone-f-cylinder", label: "Silinder Mesin", x: 35, y: 48 },
          { id: "zone-f-engine-corner", label: "Sudut Ruang Mesin", x: 15, y: 22 },
          { id: "zone-f-clutch", label: "Area Kopling", x: 44, y: 44 },
          { id: "zone-f-front", label: "Depan Kendaraan (Grille)", x: 8, y: 40 },
          { id: "zone-f-engine-front", label: "Depan Mesin (Belt)", x: 24, y: 35 },
          { id: "zone-f-intake", label: "Intake Manifold", x: 39, y: 31 },
          { id: "zone-f-underbody", label: "Bawah Kendaraan", x: 58, y: 68 },
          { id: "zone-f-engine-top", label: "Atas Mesin", x: 30, y: 17 },
          { id: "zone-f-firewall", label: "Firewall", x: 52, y: 23 }
        ]
      },

      // -----------------------------------------------------------------
      // QUIZ — 20 Questions (Mixed from all levels)
      // -----------------------------------------------------------------
      quiz: [
        // --- Sistem Rem (4 soal) ---
        {
          id: "q6-1",
          question: "Komponen rem cakram yang menjepit rotor/piringan adalah…",
          image: null,
          options: [
            "Wheel cylinder",
            "Brake shoe",
            "Kaliper (caliper)",
            "Return spring"
          ],
          correct: 2,
          explanation: "Kaliper (caliper) adalah komponen yang menjepit cakram/rotor dari kedua sisi menggunakan kampas rem. Di dalamnya terdapat piston hidraulis yang mendorong kampas rem saat pedal rem ditekan."
        },
        {
          id: "q6-2",
          question: "Brake booster menggunakan sumber tenaga apa untuk memperbesar gaya pengereman?",
          image: null,
          options: [
            "Tekanan oli mesin",
            "Tekanan vakum dari intake manifold mesin",
            "Tekanan udara ban",
            "Tenaga listrik baterai"
          ],
          correct: 1,
          explanation: "Brake booster memanfaatkan tekanan vakum (kevakuman) dari intake manifold mesin. Perbedaan tekanan antara vakum dan tekanan atmosfer digunakan untuk memperbesar gaya yang dihasilkan pengemudi saat menginjak pedal rem."
        },
        {
          id: "q6-3",
          question: "Sensor kecepatan roda pada sistem ABS berfungsi untuk…",
          image: null,
          options: [
            "Mengukur tekanan minyak rem",
            "Mendeteksi kecepatan putaran setiap roda",
            "Mengukur suhu kampas rem",
            "Menghitung jarak tempuh kendaraan"
          ],
          correct: 1,
          explanation: "Sensor kecepatan roda (wheel speed sensor) mendeteksi kecepatan putaran setiap roda dan mengirim data ke ECU ABS. Jika ECU mendeteksi roda hampir terkunci (kecepatan turun drastis), ABS akan mengatur tekanan rem untuk mencegah penguncian."
        },
        {
          id: "q6-4",
          question: "Backing plate pada rem tromol berfungsi sebagai…",
          image: null,
          options: [
            "Permukaan gesekan yang berputar bersama roda",
            "Plat logam dudukan semua komponen rem tromol, terpasang pada poros roda",
            "Pegas yang menarik brake shoe kembali",
            "Saluran minyak rem"
          ],
          correct: 1,
          explanation: "Backing plate adalah pelat logam yang menjadi dudukan atau tempat pemasangan semua komponen rem tromol (brake shoe, wheel cylinder, return spring). Backing plate terpasang tetap pada poros roda (axle) dan tidak ikut berputar."
        },

        // --- Mesin (4 soal) ---
        {
          id: "q6-5",
          question: "Pada langkah usaha (power stroke) mesin bensin 4 langkah, apa yang terjadi?",
          image: null,
          options: [
            "Campuran udara-BBM masuk ke silinder",
            "Piston bergerak naik memampatkan campuran",
            "Busi membakar campuran → gas mengembang → mendorong piston turun",
            "Gas buang dikeluarkan dari silinder"
          ],
          correct: 2,
          explanation: "Pada langkah usaha (power stroke), busi menghasilkan percikan api yang membakar campuran udara-BBM. Pembakaran menghasilkan tekanan gas yang sangat tinggi, mendorong piston turun dengan kuat. Inilah satu-satunya langkah yang menghasilkan tenaga."
        },
        {
          id: "q6-6",
          question: "Ring piston (piston ring) pada piston berfungsi untuk…",
          image: null,
          options: [
            "Menghubungkan piston ke crankshaft",
            "Menyekat ruang bakar agar gas tidak bocor ke bawah, dan mengontrol oli",
            "Membuat piston berputar",
            "Mendinginkan piston"
          ],
          correct: 1,
          explanation: "Ring piston berfungsi menyekat celah antara piston dan dinding silinder agar gas pembakaran tidak bocor ke crankcase (compression ring) dan agar oli tidak naik ke ruang bakar (oil ring). Ada 2-3 ring pada setiap piston."
        },
        {
          id: "q6-7",
          question: "Apa fungsi oil filter (saringan oli) pada sistem pelumasan?",
          image: null,
          options: [
            "Memompa oli ke seluruh mesin",
            "Menyaring kotoran dan partikel logam dari oli sebelum disirkulasikan",
            "Menampung oli bekas",
            "Mendinginkan oli mesin"
          ],
          correct: 1,
          explanation: "Oil filter menyaring kotoran, partikel logam, dan sisa pembakaran dari oli mesin sebelum oli disirkulasikan kembali ke komponen mesin. Oli yang bersih melindungi komponen dari keausan. Oil filter perlu diganti berkala."
        },
        {
          id: "q6-8",
          question: "Mesin dengan konfigurasi V6 memiliki…",
          image: null,
          options: [
            "6 silinder tersusun segaris",
            "6 silinder tersusun dalam 2 baris membentuk huruf V",
            "6 silinder tersusun mendatar berhadapan",
            "3 silinder vertikal dan 3 horizontal"
          ],
          correct: 1,
          explanation: "Mesin V6 memiliki 6 silinder yang tersusun dalam 2 baris (masing-masing 3 silinder) membentuk huruf V jika dilihat dari depan. Konfigurasi V lebih kompak dibandingkan inline untuk mesin bersilinder banyak."
        },

        // --- Kelistrikan (4 soal) ---
        {
          id: "q6-9",
          question: "Komponen alternator yang menyearahkan arus AC menjadi DC adalah…",
          image: null,
          options: [
            "Rotor",
            "Stator",
            "Dioda (rectifier)",
            "Regulator"
          ],
          correct: 2,
          explanation: "Dioda (rectifier) pada alternator berfungsi menyearahkan arus AC (bolak-balik) yang dihasilkan stator menjadi arus DC (searah) yang dibutuhkan baterai dan komponen kelistrikan kendaraan. Biasanya terdapat 6 dioda dalam bridge rectifier."
        },
        {
          id: "q6-10",
          question: "Apa yang terjadi jika sekring (fuse) pada sirkuit lampu putus?",
          image: null,
          options: [
            "Lampu menjadi lebih terang",
            "Lampu mati karena arus terputus",
            "Baterai terisi lebih cepat",
            "Alternator berhenti bekerja"
          ],
          correct: 1,
          explanation: "Jika sekring putus, arus listrik pada sirkuit tersebut terputus sehingga lampu (atau komponen lain yang dilindungi sekring tersebut) tidak dapat menyala. Sekring putus berarti ada masalah — arus berlebih atau hubungan pendek yang harus diperbaiki."
        },
        {
          id: "q6-11",
          question: "Baterai kendaraan 12V terdiri dari berapa sel?",
          image: null,
          options: [
            "2 sel",
            "4 sel",
            "6 sel",
            "12 sel"
          ],
          correct: 2,
          explanation: "Baterai 12V terdiri dari 6 sel yang terhubung seri. Setiap sel menghasilkan tegangan sekitar 2,1 Volt, sehingga totalnya 6 × 2,1V = 12,6 Volt saat baterai terisi penuh."
        },
        {
          id: "q6-12",
          question: "Pinion gear pada motor starter berkaitan dengan komponen apa saat starter diaktifkan?",
          image: null,
          options: [
            "Puli alternator",
            "Ring gear pada flywheel",
            "Timing chain",
            "Drive belt"
          ],
          correct: 1,
          explanation: "Saat starter diaktifkan, solenoid mendorong pinion gear agar berkaitan dengan ring gear pada flywheel. Motor starter kemudian memutar pinion → flywheel → crankshaft → mesin berputar dan hidup."
        },

        // --- Pemindah Tenaga (4 soal) ---
        {
          id: "q6-13",
          question: "Saat pedal kopling diinjak penuh, apa yang terjadi pada penyaluran tenaga?",
          image: null,
          options: [
            "Tenaga mesin tersalurkan maksimal ke roda",
            "Tenaga mesin terputus dari transmisi",
            "Transmisi otomatis berpindah ke gigi tinggi",
            "Mesin berputar lebih cepat"
          ],
          correct: 1,
          explanation: "Saat pedal kopling diinjak penuh, release bearing menekan pegas diafragma, pressure plate mundur, dan clutch disc terlepas dari flywheel. Akibatnya, tenaga mesin TERPUTUS dari transmisi sehingga gigi dapat dipindahkan."
        },
        {
          id: "q6-14",
          question: "Synchronizer pada transmisi manual berfungsi untuk…",
          image: null,
          options: [
            "Memperbesar torsi",
            "Menyamakan kecepatan putaran gigi sebelum berkaitan agar perpindahan halus",
            "Mengurangi suara mesin",
            "Mendinginkan oli transmisi"
          ],
          correct: 1,
          explanation: "Synchronizer (sinkroniser) berfungsi menyamakan kecepatan putaran antara gigi yang akan dikaitan dengan output shaft. Tanpa sinkroniser, perpindahan gigi akan kasar dan berbunyi (grinding) karena perbedaan kecepatan putaran."
        },
        {
          id: "q6-15",
          question: "Pada torque converter transmisi otomatis, komponen yang terhubung ke mesin adalah…",
          image: null,
          options: [
            "Turbine",
            "Stator",
            "Impeller (pump)",
            "Valve body"
          ],
          correct: 2,
          explanation: "Impeller (pump) adalah bagian torque converter yang terhubung langsung ke crankshaft mesin dan berputar bersama mesin. Impeller memutar cairan ATF yang kemudian menggerakkan turbine yang terhubung ke transmisi."
        },
        {
          id: "q6-16",
          question: "Alur penyaluran tenaga yang benar pada kendaraan FR adalah…",
          image: null,
          options: [
            "Mesin → Transmisi → Diferensial → Roda Depan",
            "Mesin → Kopling → Transmisi → Propeller Shaft → Diferensial → Roda Belakang",
            "Mesin → Propeller Shaft → Kopling → Roda",
            "Mesin → Diferensial → Transmisi → Roda"
          ],
          correct: 1,
          explanation: "Pada kendaraan FR (Front engine, Rear drive), alur penyaluran tenaga: Mesin → Kopling → Transmisi → Propeller Shaft → Diferensial → Poros Roda → Roda Belakang. Propeller shaft diperlukan karena mesin di depan sedangkan roda penggerak di belakang."
        },

        // --- Bahan Bakar & Pendingin (4 soal) ---
        {
          id: "q6-17",
          question: "Sensor yang mengukur jumlah/tekanan udara masuk ke mesin pada sistem EFI adalah…",
          image: null,
          options: [
            "O₂ Sensor",
            "TPS (Throttle Position Sensor)",
            "MAP atau MAF Sensor",
            "CKP Sensor"
          ],
          correct: 2,
          explanation: "MAP (Manifold Absolute Pressure) sensor mengukur tekanan udara di intake manifold, sedangkan MAF (Mass Air Flow) sensor mengukur jumlah massa udara yang masuk. Data ini digunakan ECU untuk menghitung jumlah BBM yang tepat."
        },
        {
          id: "q6-18",
          question: "Fungsi kondensor (condenser) pada sistem AC kendaraan adalah…",
          image: null,
          options: [
            "Menyerap panas dari udara kabin",
            "Melepaskan panas dari refrigeran ke udara luar",
            "Memompa refrigeran",
            "Menyaring udara kabin"
          ],
          correct: 1,
          explanation: "Kondensor berfungsi melepaskan panas dari refrigeran ke udara luar. Refrigeran panas bertekanan tinggi dari kompresor mengalir melalui kondensor dan didinginkan oleh udara, berubah dari gas menjadi cairan. Kondensor terletak di depan radiator."
        },
        {
          id: "q6-19",
          question: "Glow plug pada mesin diesel berfungsi untuk…",
          image: null,
          options: [
            "Menghasilkan percikan api seperti busi",
            "Memanaskan ruang bakar saat mesin dingin untuk membantu starting",
            "Mendinginkan solar sebelum disemprotkan",
            "Menyaring kotoran dari solar"
          ],
          correct: 1,
          explanation: "Glow plug berfungsi memanaskan ruang bakar saat mesin dingin agar solar lebih mudah terbakar saat starting. Berbeda dengan busi yang menghasilkan percikan api, glow plug hanya memanaskan udara di ruang bakar dan hanya aktif saat starting dingin."
        },
        {
          id: "q6-20",
          question: "Coolant (cairan pendingin) mesin terdiri dari campuran…",
          image: null,
          options: [
            "Oli mesin dan air",
            "Air suling dan anti-freeze (etilen glikol)",
            "Bensin dan air",
            "Minyak rem dan air"
          ],
          correct: 1,
          explanation: "Coolant mesin terdiri dari campuran air suling dan anti-freeze (etilen glikol). Anti-freeze mencegah pembekuan pada suhu rendah, menaikkan titik didih agar tidak mendidih pada suhu tinggi, dan mengandung inhibitor korosi untuk melindungi komponen mesin."
        }
      ]
    }
  ],

  // =====================================================================
  // ACHIEVEMENTS
  // =====================================================================
  achievements: [
    // -- Completing each level (6) --
    {
      id: "brake-beginner",
      title: "Pemula Rem",
      description: "Selesaikan Level 1 — Sistem Rem",
      icon: "🔴",
      condition: { type: "level_complete", level: 1 }
    },
    {
      id: "engine-beginner",
      title: "Pemula Mesin",
      description: "Selesaikan Level 2 — Mesin Kendaraan",
      icon: "⚙️",
      condition: { type: "level_complete", level: 2 }
    },
    {
      id: "electrical-beginner",
      title: "Pemula Kelistrikan",
      description: "Selesaikan Level 3 — Sistem Kelistrikan",
      icon: "⚡",
      condition: { type: "level_complete", level: 3 }
    },
    {
      id: "powertrain-beginner",
      title: "Pemula Pemindah Tenaga",
      description: "Selesaikan Level 4 — Pemindah Tenaga",
      icon: "🔄",
      condition: { type: "level_complete", level: 4 }
    },
    {
      id: "fuel-cooling-beginner",
      title: "Pemula BBM & Pendingin",
      description: "Selesaikan Level 5 — Bahan Bakar & Pendingin",
      icon: "⛽",
      condition: { type: "level_complete", level: 5 }
    },
    {
      id: "final-exam-complete",
      title: "Lulus Ujian Akhir",
      description: "Selesaikan Level 6 — Ujian Akhir Master Test",
      icon: "🏆",
      condition: { type: "level_complete", level: 6 }
    },

    // -- Getting 3 stars on each level (6) --
    {
      id: "brake-expert",
      title: "Ahli Rem",
      description: "Raih 3 bintang pada Level 1 — Sistem Rem",
      icon: "⭐",
      condition: { type: "level_stars", level: 1, stars: 3 }
    },
    {
      id: "engine-expert",
      title: "Ahli Mesin",
      description: "Raih 3 bintang pada Level 2 — Mesin Kendaraan",
      icon: "⭐",
      condition: { type: "level_stars", level: 2, stars: 3 }
    },
    {
      id: "electrical-expert",
      title: "Ahli Kelistrikan",
      description: "Raih 3 bintang pada Level 3 — Sistem Kelistrikan",
      icon: "⭐",
      condition: { type: "level_stars", level: 3, stars: 3 }
    },
    {
      id: "powertrain-expert",
      title: "Ahli Pemindah Tenaga",
      description: "Raih 3 bintang pada Level 4 — Pemindah Tenaga",
      icon: "⭐",
      condition: { type: "level_stars", level: 4, stars: 3 }
    },
    {
      id: "fuel-cooling-expert",
      title: "Ahli BBM & Pendingin",
      description: "Raih 3 bintang pada Level 5 — Bahan Bakar & Pendingin",
      icon: "⭐",
      condition: { type: "level_stars", level: 5, stars: 3 }
    },
    {
      id: "final-exam-expert",
      title: "Juara Ujian Akhir",
      description: "Raih 3 bintang pada Level 6 — Ujian Akhir",
      icon: "👑",
      condition: { type: "level_stars", level: 6, stars: 3 }
    },

    // -- Special achievements (4+) --
    {
      id: "perfect-quiz",
      title: "Nilai Sempurna!",
      description: "Jawab semua soal kuis dengan benar pada salah satu level (skor 100%)",
      icon: "💯",
      condition: { type: "perfect_quiz" }
    },
    {
      id: "simulation-master",
      title: "Simulator Ahli",
      description: "Selesaikan simulasi tanpa kesalahan pada salah satu level",
      icon: "🎯",
      condition: { type: "perfect_simulation" }
    },
    {
      id: "master-technician",
      title: "Master Technician",
      description: "Selesaikan SEMUA level dan raih minimal 2 bintang di setiap level",
      icon: "🏆",
      condition: { type: "master_technician" }
    },
    {
      id: "speed-learner",
      title: "Belajar Cepat",
      description: "Selesaikan fase pembelajaran dalam waktu kurang dari 3 menit",
      icon: "⚡",
      condition: { type: "speed_learning", maxSeconds: 180 }
    },
    {
      id: "all-stars",
      title: "Bintang Penuh",
      description: "Raih 3 bintang di SEMUA 6 level — kamu benar-benar menguasai semuanya!",
      icon: "🌟",
      condition: { type: "all_stars" }
    }
  ],

  // =====================================================================
  // PLAYER RANKS
  // =====================================================================
  ranks: [
    { minXP: 0, title: "Magang Baru", icon: "🔰" },
    { minXP: 500, title: "Mekanik Junior", icon: "🔧" },
    { minXP: 1500, title: "Mekanik", icon: "🛠️" },
    { minXP: 3000, title: "Mekanik Senior", icon: "⚙️" },
    { minXP: 5000, title: "Kepala Mekanik", icon: "🏅" },
    { minXP: 8000, title: "Master Technician", icon: "🏆" }
  ]

};
