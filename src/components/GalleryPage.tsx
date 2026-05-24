import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryItem {
  image: string;
  title: string;
  category: string;
  desc: string;
}

const galleryData: GalleryItem[] = [
  {
    image: "/assets/eggs_basket.png",
    title: "Pemanenan Telur Harian",
    category: "Operasional",
    desc: "Hasil panen telur ayam layer ras berkualitas tinggi, dihitung presisi sebelum didistribusikan."
  },
  {
    image: "/assets/hero1_compressed.webp",
    title: "Kandang Modern Laying",
    category: "Fasilitas",
    desc: "Kandang tertutup (closed-house) yang dilengkapi pengaturan suhu otomatis demi kenyamanan populasi ayam."
  },
  {
    image: "/assets/step_telegram.png",
    title: "Catat Cepat Lewat Telegram",
    category: "Teknologi",
    desc: "Antarmuka integrasi bot AI Telegram, membantu operator kandang melapor tanpa hambatan waktu."
  },
  {
    image: "/assets/proses.png",
    title: "Alur Pemrosesan AI",
    category: "Teknologi",
    desc: "Siklus pemetaan otomatis dari input bahasa sehari-hari peternak langsung ke baris cloud database."
  },
  {
    image: "/assets/hero2_compressed.webp",
    title: "Pakan Bernutrisi Tinggi",
    category: "Nutrisi",
    desc: "Pemberian pakan konsentrat seimbang yang dipantau sisa beratnya demi menjaga efisiensi FCR."
  },
  {
    image: "/assets/section_cr.webp",
    title: "Kesehatan Populasi Unggas",
    category: "Imunisasi",
    desc: "Pemantauan berkala kawanan ayam petelur untuk memastikan deteksi awal gejala klinis penyakit."
  },
  {
    image: "/assets/step_dashboard.png",
    title: "Auto-Ledger & Analytics",
    category: "Dashboard",
    desc: "Spreadsheet dan grafik visual interaktif untuk evaluasi FCR mingguan dan profitabilitas penjualan."
  },
  {
    image: "/assets/farmer_smiling.png",
    title: "Peternak Mitra Tersenyum",
    category: "Kemitraan",
    desc: "Kerja sama erat dengan peternak lokal untuk meningkatkan taraf hidup dan modernisasi agrikultur."
  },
  {
    image: "/assets/maskot.png",
    title: "Maskot SmartPoultry",
    category: "Branding",
    desc: "Karakter representasi SmartPoultry yang ramah dan siap mendampingi perjalanan peternakan Anda."
  },
  {
    image: "/assets/paralax.webp",
    title: "Kandang Terbuka Klasik",
    category: "Fasilitas",
    desc: "Dokumentasi kandang terbuka (open-house) konvensional sebelum dioptimalkan oleh sistem sensor AI."
  },
  {
    image: "/assets/step_ai.png",
    title: "Deteksi Gejala Visual",
    category: "Teknologi",
    desc: "Uji coba analisis feces dan fisik unggas melalui kamera sensor pintar AI untuk diagnosis dini penyakit."
  },
  {
    image: "/assets/about.png",
    title: "Analitik Performa FCR",
    category: "Dashboard",
    desc: "Visualisasi korelasi konsumsi pakan terhadap berat telur untuk mengukur titik efisiensi pakan harian."
  }
];

export default function GalleryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Pagination calculations
  const totalPages = Math.ceil(galleryData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = galleryData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C1E11] relative overflow-x-hidden font-sans">
      <Header onOpenLogin={() => { window.location.href = '/login'; }} />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 select-none">
        
        {/* Gallery Header */}
        <div className="max-w-7xl mx-auto mb-16 text-left">
          <span className="text-[#FF9F1C] font-extrabold tracking-widest text-xs uppercase block mb-3 font-sans">
            Dokumentasi Visual — Galeri
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2C1E11] tracking-tight leading-tight uppercase mb-6 font-sans">
            Melihat lebih dekat <span className="text-[#FF9F1C]">kegiatan kandang kami</span>.
          </h1>
          <p className="text-[#2C1E11]/75 text-base sm:text-lg font-medium leading-relaxed max-w-3xl font-sans">
            Dari pemanenan telur harian, pemantauan kondisi populasi closed-house, hingga visualisasi antarmuka AI yang membantu melipatgandakan produktivitas peternakan unggas Anda.
          </p>
        </div>

        {/* 3-Column Responsive Grid with Hover Overlays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch mb-16 min-h-[750px]">
          <AnimatePresence mode="wait">
            {currentItems.map((item, idx) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group relative overflow-hidden rounded-[2rem] shadow-lg border border-[#2C1E11]/5 bg-[#2C1E11]/5 aspect-[4/3] w-full flex flex-col justify-end"
              >
                {/* Background Image */}
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover absolute inset-0 z-0"
                />

                {/* SOLID ACTIVE THEME HOVER OVERLAY (Strictly matching user screenshot but styled for our site theme) */}
                <div className="absolute inset-0 bg-[#2C1E11]/95 z-10 flex flex-col justify-center items-center text-center p-8 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 ease-out">
                  
                  {/* Category Badge */}
                  <span className="text-[#FF9F1C] font-extrabold text-[10px] uppercase tracking-widest bg-[#FF9F1C]/10 px-3 py-1 rounded-full border border-[#FF9F1C]/20 mb-4">
                    {item.category}
                  </span>

                  {/* Title (Large bold) */}
                  <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tight mb-3 font-sans">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium max-w-xs mb-6">
                    {item.desc}
                  </p>

                  {/* Symmetrical white arrow in bottom-center exactly like screenshot */}
                  <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center text-white mt-2 group-hover:scale-110 transition-transform duration-300">
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </div>

                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── PREMIUM PAGINATION SYSTEM ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-[#2C1E11]/10 pt-10">
            {/* Previous Page Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 rounded-full border border-[#2C1E11]/10 bg-white text-[#2C1E11] hover:bg-[#FF9F1C] hover:text-[#2C1E11] hover:border-[#FF9F1C] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#2C1E11] disabled:hover:border-[#2C1E11]/10 transition-all cursor-pointer shadow-sm"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`h-11 w-11 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
                  currentPage === pageNumber
                    ? 'bg-[#2C1E11] text-[#FF9F1C] shadow-md border border-[#2C1E11]'
                    : 'bg-white text-[#2C1E11] border border-[#2C1E11]/10 hover:bg-[#FF9F1C]/25 hover:border-[#FF9F1C]'
                }`}
              >
                {pageNumber}
              </button>
            ))}

            {/* Next Page Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 rounded-full border border-[#2C1E11]/10 bg-white text-[#2C1E11] hover:bg-[#FF9F1C] hover:text-[#2C1E11] hover:border-[#FF9F1C] disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#2C1E11] disabled:hover:border-[#2C1E11]/10 transition-all cursor-pointer shadow-sm"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
