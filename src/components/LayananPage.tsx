import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, ClipboardCheck, Scale, BarChart3, PackageOpen, HeartPulse, 
  ArrowRight, Phone, Send, Headphones, ArrowLeft, Mail, ChevronRight, Leaf, ShieldAlert
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface ServiceContent {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc1: string;
  fullDesc2: string;
  landscapeImage: string;
  benefitTitle: string;
  benefitDesc: string;
  benefits: {
    title: string;
    desc: string;
  }[];
  portraitImage1: string;
  portraitImage2: string;
  workingProcessTitle: string;
  workingProcessDesc: string;
  workingSteps: {
    num: string;
    title: string;
    desc: string;
  }[];
}

const servicesData: ServiceContent[] = [
  {
    id: "ai-telegram",
    title: "AI Agent Telegram",
    shortDesc: "Asisten chatbot Telegram untuk pencatatan logs instan tanpa repot.",
    fullDesc1: "SmartPoultry AI menghadirkan asisten chatbot Telegram revolusioner yang dirancang khusus untuk peternak sibuk di lapangan. Peternak cukup mengirimkan laporan harian dalam bahasa percakapan sehari-hari atau bahkan melalui rekaman suara (voice note) saat berada di dalam kandang.",
    fullDesc2: "Kecerdasan buatan kami langsung mengurai, mengklasifikasi, dan mengekstrak informasi pakan keluar, sisa pakan, jumlah telur terambil, telur pecah/BS, jumlah kematian ayam, hingga kondisi lingkungan ke dalam basis data cloud secara real-time.",
    landscapeImage: "/assets/step_telegram.png",
    benefitTitle: "Keunggulan AI Agent Telegram",
    benefitDesc: "Solusi pencatatan modern tanpa ribet yang menghemat waktu kerja operasional kandang hingga 80% setiap harinya.",
    benefits: [
      {
        title: "Pencatatan Instan Tanpa Aplikasi Berat",
        desc: "Cukup chat santai di Telegram, tanpa perlu membuka laptop atau mengisi formulir tabel yang rumit di tengah kandang."
      },
      {
        title: "Pemrosesan Bahasa Alami (NLP) Canggih",
        desc: "AI memahami bahasa sehari-hari, singkatan lokal peternakan ayam, dan kebal dari saltik (typo) pengetikan."
      },
      {
        title: "Dukungan Pesan Suara (Voice Note)",
        desc: "Sambil membawa keranjang telur, Anda bisa merekam suara Anda langsung dan AI akan mentranskrip ke tabel database."
      }
    ],
    portraitImage1: "/assets/hero1_compressed.webp",
    portraitImage2: "/assets/maskot.png",
    workingProcessTitle: "Cara Kerja Chatbot Telegram",
    workingProcessDesc: "Bagaimana integrasi sederhana Telegram Anda bekerja otomatis menyusun laporan komprehensif.",
    workingSteps: [
      {
        num: "01",
        title: "Hubungkan Bot",
        desc: "Tambahkan kontak bot Telegram resmi SmartPoultry di smartphone Anda melalui tautan aman."
      },
      {
        num: "02",
        title: "Kirim Laporan",
        desc: "Ketik laporan santai atau rekam suara saat panen telur (misal: 'pakan keluar 2 sak, telur retak 3 butir')."
      },
      {
        num: "03",
        title: "Ekstraksi AI",
        desc: "AI memproses pesan secara instan, mengekstrak metrik kuantitatif, dan memetakan log ke kategori yang tepat."
      },
      {
        num: "04",
        title: "Sinkronisasi Cloud",
        desc: "Data langsung tersimpan di cloud database, memicu kalkulasi FCR dan memperbarui grafik dashboard."
      }
    ]
  },
  {
    id: "auto-ledger",
    title: "Auto-Ledger Dashboard",
    shortDesc: "Spreadsheet logs otomatis terintegrasi kalkulasi FCR langsung.",
    fullDesc1: "Modul spreadsheet pintar kami adalah pusat kendali administratif peternakan Anda. Semua data yang dikirim oleh AI Telegram atau dimasukkan secara manual ditata rapi ke dalam tabel database yang dinamis dan terstruktur dengan visualisasi Grid modern.",
    fullDesc2: "Lupakan kalkulator manual dan rumus Excel yang rumit. Dashboard Auto-Ledger secara real-time menghitung FCR (Feed Conversion Ratio), rasio produksi harian, mortalitas kumulatif, dan melacak penyusutan inventaris pakan dari waktu ke waktu secara presisi.",
    landscapeImage: "/assets/step_dashboard.png",
    benefitTitle: "Kelebihan Auto-Ledger",
    benefitDesc: "Menghadirkan transparansi administratif tingkat korporasi bagi operasional peternakan mandiri Anda.",
    benefits: [
      {
        title: "Pencatatan Multi-Tab Terstruktur",
        desc: "Memisahkan Lembar Harian, Vaksinasi, Produksi Mingguan, Pemeliharaan Alat, dan Transaksi Penjualan secara rapi."
      },
      {
        title: "Kalkulasi FCR Instan",
        desc: "Rumus matematis terintegrasi menghitung rasio pakan terhadap berat telur langsung setiap kali entri data disimpan."
      },
      {
        title: "Responsif & Bebas Potong",
        desc: "Spreadsheet modern dengan scroll horizontal premium, memastikan teks catatan klinis tidak terpotong elipsis."
      }
    ],
    portraitImage1: "/assets/hero2_compressed.webp",
    portraitImage2: "/assets/eggs_basket.png",
    workingProcessTitle: "Siklus Pemrosesan Ledger",
    workingProcessDesc: "Bagaimana data harian mengalir menjadi dokumen keuangan dan produksi siap saji.",
    workingSteps: [
      {
        num: "01",
        title: "Data Masuk",
        desc: "Aliran data dari Telegram atau form input cepat dashboard didaftarkan langsung ke sistem."
      },
      {
        num: "02",
        title: "Komputasi Rumus",
        desc: "Algoritma memproses rumus konversi pakan, persentase mortalitas, dan margin profit penjualan telur."
      },
      {
        num: "03",
        title: "Validasi Entri",
        desc: "Sistem menandai kolom wajib (required) dan opsional untuk menjaga kualitas audit data."
      },
      {
        num: "04",
        title: "Laporan Siap Unduh",
        desc: "Tabel harian & mingguan siap diekspor ke format Excel/PDF untuk evaluasi bersama dokter hewan atau investor."
      }
    ]
  },
  {
    id: "diagnosis-warning",
    title: "Diagnosis & Peringatan",
    shortDesc: "Sistem deteksi dini penurunan produksi dan indikasi klinis penyakit.",
    fullDesc1: "Keselamatan populasi ayam petelur Anda adalah prioritas utama. Modul Diagnosis & Peringatan bertindak sebagai pengawas 24 jam yang terus memantau metrik klinis dan operasional untuk mendeteksi tanda-tanda awal bahaya.",
    fullDesc2: "Jika terjadi penurunan produksi telur mendadak di bawah batas aman, fluktuasi suhu siang yang ekstrem, atau laporan feces basah yang tidak normal, sistem langsung meluncurkan sinyal waspada berupa alert klinis berwarna merah dengan rekomendasi tindakan darurat lapangan.",
    landscapeImage: "/assets/step_ai.png",
    benefitTitle: "Kekuatan Deteksi Dini",
    benefitDesc: "Mencegah kerugian finansial akibat keterlambatan penanganan medis pada kawanan ayam petelur.",
    benefits: [
      {
        title: "Alert Anomali Real-Time",
        desc: "Memberi peringatan instan begitu mortalitas harian melampaui ambang batas aman yang disyaratkan."
      },
      {
        title: "Diagnosis Gejala Medis",
        desc: "Menganalisis indikator feces (kotoran kapur, feces basah) untuk mendiagnosis kemungkinan wabah flu burung atau ND."
      },
      {
        title: "Mitigasi Kerugian Cepat",
        desc: "Menyediakan panduan klinis pertolongan pertama, prosedur karantina kandang, dan rujukan dosis vitamin pendukung."
      }
    ],
    portraitImage1: "/assets/about.png",
    portraitImage2: "/assets/paralax.webp",
    workingProcessTitle: "Alur Diagnosis & Proteksi",
    workingProcessDesc: "Bagaimana kecerdasan buatan menyaring anomali menjadi panduan aksi lapangan.",
    workingSteps: [
      {
        num: "01",
        title: "Pemantauan Gejala",
        desc: "Data klinis harian seperti warna feces, keaktifan makan, dan fluktuasi suhu dipantau konstan."
      },
      {
        num: "02",
        title: "Pencocokan Kasus",
        desc: "AI mencocokkan pola penurunan produksi atau mortalitas dengan database epidemiologi kedokteran unggas."
      },
      {
        num: "03",
        title: "Pemicu Peringatan",
        desc: "Jika kritis, alarm merah akan menyala di dasbor utama peternak lengkap dengan detail indikasi penyakit."
      },
      {
        num: "04",
        title: "Panduan Penanganan",
        desc: "Sistem menyajikan panduan medis terarah (karantina blok, desinfeksi kandang, rekomendasi obat awal)."
      }
    ]
  },
  {
    id: "smart-analytics",
    title: "Smart Analytics",
    shortDesc: "Visualisasi analitik interaktif berbasis grafik Recharts untuk keputusan presisi.",
    fullDesc1: "Smart Analytics mengubah tumpukan logs yang membosankan menjadi presentasi visual interaktif yang kaya akan wawasan bisnis. Menggunakan visualisasi grafik modern berbasis library Recharts, Anda dapat meninjau tren operasional kandang dalam hitungan detik.",
    fullDesc2: "Modul ini memetakan fluktuasi produksi telur harian vs mingguan, melacak efisiensi rasio FCR sepanjang siklus panen, memantau konsumsi pakan aktual terhadap standar teoritis, serta menganalisis korelasi kelembaban & suhu siang hari terhadap kenyamanan ayam.",
    landscapeImage: "/assets/hero2_compressed.webp",
    benefitTitle: "Kelebihan Smart Analytics",
    benefitDesc: "Membantu peternak mandiri mengambil keputusan bisnis berbasis data yang solid layaknya peternakan industri.",
    benefits: [
      {
        title: "Grafik Interaktif Multi-Metrik",
        desc: "Menampilkan grafik garis, grafik batang, dan bagan donat yang responsif lengkap dengan tooltip informatif."
      },
      {
        title: "Analisis Efisiensi Nutrisi pakan",
        desc: "Memvisualisasikan korelasi biaya pakan yang dikeluarkan terhadap bobot telur yang dihasilkan secara komparatif."
      },
      {
        title: "Prediksi Hasil Panen AI",
        desc: "Membantu memproyeksikan produksi telur bulan depan untuk mempermudah perencanaan distribusi dan stok gudang."
      }
    ],
    portraitImage1: "/assets/step_dashboard.png",
    portraitImage2: "/assets/eggs_basket.png",
    workingProcessTitle: "Metodologi Analisis Data",
    workingProcessDesc: "Proses penerjemahan logs mentah menjadi grafik dan prediksi masa depan yang akurat.",
    workingSteps: [
      {
        num: "01",
        title: "Agregasi logs",
        desc: "Data logs harian dan mingguan disatukan dan dibersihkan dari noise entri."
      },
      {
        num: "02",
        title: "Plotting Tren",
        desc: "Data divisualisasikan secara dinamis pada sumbu grafik produksi, pakan, dan iklim kandang."
      },
      {
        num: "03",
        title: "Analisis Korelasi",
        desc: "Algoritma menghitung korelasi suhu luar terhadap efisiensi konversi pakan harian."
      },
      {
        num: "04",
        title: "Wawasan Keputusan",
        desc: "Menghasilkan ringkasan grafik siap saji untuk bahan evaluasi efisiensi biaya pakan dan energi."
      }
    ]
  },
  {
    id: "inventory-pakan",
    title: "Inventory & Pakan",
    shortDesc: "Pelacakan gudang pakan otomatis, prediksi sisa hari, dan alarm belanja.",
    fullDesc1: "Keterlambatan pengiriman pakan bisa berakibat fatal pada berat badan ayam dan produksi telur harian. Sistem Inventory & Pakan kami melacak kuantitas sak pakan di gudang penyimpanan Anda secara presisi dan waktu nyata.",
    fullDesc2: "Setiap kali logs pakan keluar dilaporkan oleh peternak, kuantitas inventaris gudang langsung dipotong secara otomatis. Sistem kemudian memproyeksikan sisa hari persediaan berdasarkan tingkat konsumsi aktif dan secara otomatis menyalakan alarm pembelian kembali (reorder) ke supplier sebelum stok kritis.",
    landscapeImage: "/assets/maskot.png",
    benefitTitle: "Keuntungan Pelacakan Inventaris",
    benefitDesc: "Menjaga kontinuitas nutrisi kawanan ayam tanpa risiko kehabisan stok logistik pakan di gudang.",
    benefits: [
      {
        title: "Pemotongan Stok Gudang Otomatis",
        desc: "Stok sak pakan terpotong instan begitu laporan harian pakan keluar disetujui di logs harian."
      },
      {
        title: "Estimasi Tanggal Stok Habis",
        desc: "AI menganalisis rata-rata kecepatan konsumsi harian untuk memprediksi hari dan tanggal pakan akan habis."
      },
      {
        title: "Notifikasi Pembelian Kembali",
        desc: "Sistem menyalakan alarm visual saat sisa pakan kurang dari batas aman pemesanan logistik (3 hari)."
      }
    ],
    portraitImage1: "/assets/eggs_basket.png",
    portraitImage2: "/assets/step_telegram.png",
    workingProcessTitle: "Alur Manajemen Inventaris",
    workingProcessDesc: "Bagaimana logistik pakan dan pengeluaran barang terpantau aman tanpa human error.",
    workingSteps: [
      {
        num: "01",
        title: "Log Pakan Keluar",
        desc: "Jumlah sak pakan yang dibawa ke kandang dicatat melalui input chat Telegram atau logs page."
      },
      {
        num: "02",
        title: "Pembaruan Gudang",
        desc: "Stok terdaftar di gudang langsung dikurangi dan disesuaikan nilainya secara waktu nyata."
      },
      {
        num: "03",
        title: "Proyeksi AI",
        desc: "Algoritma menghitung rata-rata laju konsumsi mingguan dan memproyeksikan sisa hari persediaan."
      },
      {
        num: "04",
        title: "Alert Supplier",
        desc: "Notifikasi 'Segera Pesan Kembali' dikirimkan kepada manajer gudang saat kuantitas menyentuh batas aman."
      }
    ]
  },
  {
    id: "vet-ai-advisor",
    title: "Vet AI Advisor",
    shortDesc: "Konsultan medis unggas digital 24 jam dengan analisis sains medis kedokteran.",
    fullDesc1: "Vet AI Advisor menghadirkan kepakaran dokter hewan spesialis unggas ke genggaman tangan Anda selama 24 jam penuh. Ditenagai oleh model bahasa AI yang dilatih khusus dengan literatur kedokteran hewan terakreditasi.",
    fullDesc2: "Peternak dapat berkonsultasi mengenai anomali kesehatan ayam, dosis vaksinasi berkala, hingga tips nutrisi pakan. Vet AI Advisor membaca histori logs klinis kandang Anda untuk menyajikan wawasan medis yang presisi, kontekstual, dan aman untuk segera diimplementasikan.",
    landscapeImage: "/assets/step_ai.png",
    benefitTitle: "Kelebihan Vet AI Advisor",
    benefitDesc: "Konsultasi medis unggas tepercaya tanpa ketergantungan waktu untuk tindakan darurat kandang.",
    benefits: [
      {
        title: "Konsultasi Klinis Siaga 24/7",
        desc: "Dapatkan analisis awal medis unggas secara instan di tengah malam sekalipun saat mendeteksi ayam lesu."
      },
      {
        title: "Manajemen Jadwal Vaksinasi",
        desc: "Menyusun jadwal imunisasi unggas otomatis lengkap dengan dosis, metode pemberian, dan log efek samping."
      },
      {
        title: "Rekomendasi Suplemen Nutrisi",
        desc: "Merekomendasikan komposisi kalsium tambahan jika laporan mendeteksi maraknya telur berkulit tipis/retak."
      }
    ],
    portraitImage1: "/assets/.png",
    portraitImage2: "/assets/about.png",
    workingProcessTitle: "Metodologi Kerja Vet AI",
    workingProcessDesc: "Proses diagnosis cerdas berbasis sains kedokteran hewan untuk kesehatan kandang Anda.",
    workingSteps: [
      {
        num: "01",
        title: "Input Keluhan",
        desc: "Peternak mendeskripsikan gejala fisik unggas (lemas, bersin) atau anomali telur di Ai Floating Chat."
      },
      {
        num: "02",
        title: "Analisis Rekam Medis",
        desc: "Model memindai tren logs klinis, mortalitas harian, dan kebiasaan pakan kandang Anda terdahulu."
      },
      {
        num: "03",
        title: "Terapi Kedokteran",
        desc: "Vet AI menyusun rencana tindakan medis (isolasi kandang, dosis suplemen vitamin, sanitasi tempat air)."
      },
      {
        num: "04",
        title: "Pemantauan Lanjutan",
        desc: "Proses pemulihan kawanan ayam dipantau berkala melalui logs harian pasca terapi dijalankan."
      }
    ]
  }
];

export default function LayananPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (tabParam && servicesData.some(s => s.id === tabParam)) {
      return tabParam;
    }
    return "ai-telegram";
  });

  // Sync activeTab when URL search parameter changes (e.g. Back/Forward button)
  useEffect(() => {
    if (tabParam && servicesData.some(s => s.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // Get active service details
  const activeService = servicesData.find(s => s.id === activeTab) || servicesData[0];

  // Find index of active service for next navigation
  const activeIndex = servicesData.findIndex(s => s.id === activeTab);
  const nextService = servicesData[(activeIndex + 1) % servicesData.length];

  // Scroll to top on tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-warm-earth relative overflow-x-hidden font-sans">
      {/* Dynamic Header */}
      <Header onOpenLogin={() => {
        // Redirect to home or show modal
        window.location.href = '/';
      }} />

      {/* Main Content Padding Top to accommodate Fixed Navbar */}
      <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="mb-10 text-left border-b border-warm-earth/10 pb-6">
          <div className="inline-flex items-center gap-1.5 mb-2.5">
            <Leaf className="w-4 h-4 text-primary-gold fill-primary-gold/10" />
            <span className="text-primary-gold font-extrabold tracking-widest text-[11px] uppercase font-sans">
              Detail Solusi Cerdas
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-warm-earth tracking-tight leading-none uppercase">
            Our Services & <span className="text-primary-gold">Features</span>
          </h1>
          <p className="text-earth-light/60 text-xs sm:text-sm mt-2 max-w-2xl font-medium leading-relaxed">
            Jelajahi ekosistem lengkap SmartPoultry AI. Setiap fitur dirancang secara sinergis untuk meningkatkan kualitas FCR, menjamin kesehatan unggas, dan melipatgandakan produktivitas panen telur Anda.
          </p>
        </div>

        {/* 12-Column Grid Layout matching the Mockup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Main Feature Details (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -25 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col"
              >
                {/* Title and Short Description */}
                <div className="text-left mb-6">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-warm-earth mb-4 tracking-tight leading-tight">
                    {activeService.title} Overview
                  </h2>
                  <p className="text-earth-light/80 text-sm leading-relaxed mb-4 font-semibold">
                    {activeService.fullDesc1}
                  </p>
                  <p className="text-earth-light/75 text-sm leading-relaxed font-medium">
                    {activeService.fullDesc2}
                  </p>
                </div>

                {/* Main Landscape Product Image */}
                <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-xl border border-warm-earth/5 relative mb-10">
                  <img 
                    src={activeService.landscapeImage} 
                    alt={activeService.title}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/hero2_compressed.webp'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Benefits Section */}
                <div className="text-left mb-10">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-warm-earth mb-3 tracking-tight">
                    {activeService.benefitTitle}
                  </h3>
                  <p className="text-earth-light/70 text-sm mb-6 leading-relaxed">
                    {activeService.benefitDesc}
                  </p>

                  {/* Benefit Bullets (With orange/gold bullet dots) */}
                  <ul className="space-y-4 mb-8">
                    {activeService.benefits.map((benefit, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-gold shrink-0 mt-1.5 shadow-md shadow-primary-gold/30"></div>
                        <div>
                          <h4 className="text-sm font-extrabold text-warm-earth leading-tight">
                            {benefit.title}
                          </h4>
                          <p className="text-earth-light/65 text-xs sm:text-sm mt-1 leading-relaxed">
                            {benefit.desc}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Dual Portrait Images Grid */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-4">
                    <div className="h-60 sm:h-80 rounded-3xl overflow-hidden shadow-lg border border-warm-earth/5">
                      <img 
                        src={activeService.portraitImage1} 
                        alt="Kandang Detail 1"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/eggs_basket.png'; }}
                      />
                    </div>
                    <div className="h-60 sm:h-80 rounded-3xl overflow-hidden shadow-lg border border-warm-earth/5">
                      <img 
                        src={activeService.portraitImage2} 
                        alt="Kandang Detail 2"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/farmer_smiling.png'; }}
                      />
                    </div>
                  </div>
                </div>

                {/* Working Process Section */}
                <div className="text-left border-t border-warm-earth/10 pt-10 mb-6">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-warm-earth mb-3 tracking-tight">
                    {activeService.workingProcessTitle}
                  </h3>
                  <p className="text-earth-light/70 text-sm mb-8 leading-relaxed">
                    {activeService.workingProcessDesc}
                  </p>

                  {/* 2x2 Grid of Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                    {activeService.workingSteps.map((step, sIdx) => (
                      <div key={sIdx} className="flex gap-4 items-start p-4 bg-white rounded-2xl border border-warm-earth/5 shadow-sm hover:shadow-md transition-all duration-300">
                        {/* Huge outline digits (01, 02...) exactly like mockup */}
                        <span className="text-3xl sm:text-4xl font-black text-primary-gold/30 tracking-tighter leading-none shrink-0 font-mono">
                          {step.num}
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-warm-earth leading-tight uppercase tracking-tight">
                            {step.title}
                          </h4>
                          <p className="text-earth-light/65 text-xs sm:text-sm mt-1 leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom paragraph description */}
                  <p className="text-earth-light/60 text-xs sm:text-sm mt-8 italic leading-relaxed border-l-2 border-primary-gold/30 pl-3">
                    *Implementasi sistem SmartPoultry AI sepenuhnya diproteksi oleh protokol keamanan database terenkripsi end-to-end, menjamin kerahasiaan data produksi peternakan mandiri Anda.
                  </p>
                </div>

                {/* Bottom Sequential Link to Next Service */}
                <div className="flex justify-end items-center mt-6 border-t border-warm-earth/10 pt-6">
                  <button
                    onClick={() => handleTabChange(nextService.id)}
                    className="group flex flex-col items-end text-right cursor-pointer"
                  >
                    <span className="text-[10px] text-earth-light/50 font-bold uppercase tracking-widest flex items-center gap-1 group-hover:text-primary-gold transition-colors">
                      Next Service <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="text-base sm:text-lg font-black text-warm-earth group-hover:text-primary-gold transition-colors mt-0.5 leading-none">
                      {nextService.title}
                    </span>
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>

          </div>

          {/* RIGHT COLUMN: Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
            
            {/* CARD 1: All Services Menu List */}
            <div className="bg-[#FAF6F0] rounded-3xl p-5 shadow-lg border border-warm-earth/10">
              
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-warm-earth/10">
                <Leaf className="w-4.5 h-4.5 text-primary-gold" />
                <h3 className="text-sm font-extrabold text-warm-earth uppercase tracking-wider">
                  All Services
                </h3>
              </div>

              {/* Stacked Interactive Buttons */}
              <div className="flex flex-col gap-2">
                {servicesData.map((service, sIdx) => {
                  const isActive = service.id === activeTab;
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleTabChange(service.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 font-bold text-xs sm:text-sm text-left cursor-pointer group active:scale-98 ${
                        isActive 
                          ? 'bg-[#2C1E11] text-[#FF9F1C] shadow-md border border-[#FF9F1C]/20' 
                          : 'bg-white text-warm-earth hover:bg-white hover:text-primary-gold border border-warm-earth/5 hover:border-primary-gold/20'
                      }`}
                    >
                      <span className="truncate pr-2">{service.title}</span>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-[#FF9F1C] translate-x-1' : 'text-warm-earth/40 group-hover:text-primary-gold group-hover:translate-x-1'
                      }`} />
                    </button>
                  );
                })}
              </div>

            </div>

            {/* CARD 2: support Hotline with Image Overlay */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-warm-earth/5 h-64 sm:h-72 group">
              {/* background Image */}
              <img 
                src="/assets/maskot.png" 
                alt="SmartPoultry Mascot"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/about.png'; }}
              />
              {/* dark Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

              {/* support detail overlay */}
              <div className="absolute bottom-5 left-5 right-5 text-left flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-full bg-primary-gold flex items-center justify-center text-[#1c130c] shadow-lg shrink-0">
                    <Phone className="w-4 h-4 fill-current stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase tracking-widest text-[#FF9F1C] leading-none mb-0.5">Hotline</span>
                    <span className="block text-sm font-black text-white leading-none">Siaga Medis Kandang</span>
                  </div>
                </div>
                <a 
                  href="tel:+62812XXXXxxxx" 
                  className="text-base sm:text-lg font-black text-white hover:text-[#FF9F1C] transition-colors leading-none tracking-tight whitespace-nowrap"
                >
                  +62 812-XXXX-XXXX
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Dynamic Footer */}
      <Footer />
    </div>
  );
}
