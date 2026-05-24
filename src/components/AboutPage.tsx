import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { motion } from 'motion/react';
import { CheckCircle2, ScanLine, TabletSmartphone, ArrowRight, Play, Cpu, TrendingUp, Zap, Headphones, Sprout, ArrowUpRight, Facebook, Twitter, Instagram } from 'lucide-react';

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C1E11] relative overflow-x-hidden font-sans">
      <Header onOpenLogin={() => { window.location.href = '/login'; }} />

      <main className="pt-28 pb-20 select-none">
        
        {/* Page Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-left">
          <span className="text-[#FF9F1C] font-extrabold tracking-widest text-xs uppercase block mb-3 font-sans">
            Tentang Kami — SmartPoultry
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2C1E11] tracking-tight leading-tight uppercase mb-6 font-sans">
            Mendedikasikan teknologi untuk masa depan <span className="text-[#FF9F1C]">Peternakan Indonesia</span>.
          </h1>
          <p className="text-[#2C1E11]/75 text-base sm:text-lg font-medium leading-relaxed max-w-3xl font-sans">
            Kami adalah rekan lapangan peternak unggas yang berkomitmen memecahkan tantangan operasional harian melalui integrasi kecerdasan buatan dan antarmuka percakapan yang ramah.
          </p>
        </div>
        
        {/* ── SECTION 1: TENTANG SMARTPOULTRY (Rooster circle mask - Image 1) ── */}
        <section className="bg-[#FDFBF7] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Left Side: Circular Rooster Mask Image */}
              <div className="lg:col-span-6 relative flex items-center justify-center w-full">
                <div className="relative w-full max-w-full lg:max-w-2xl xl:max-w-[660px] z-10 flex items-center justify-center p-0">
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1.0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    src="/assets/about.png" 
                    alt="SmartPoultry overview" 
                    className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(44,30,17,0.12)] select-none pointer-events-none origin-center" 
                  />
                </div>
              </div>

              {/* Right Side: Description and 4 Bullet points */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-6 text-left"
              >
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="text-[#FF9F1C] font-extrabold tracking-widest text-xs uppercase font-sans">
                    Tentang SmartPoultry
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-extrabold text-[#2C1E11] mb-6 leading-tight font-sans">
                  Satu pintu untuk <br />
                  <span className="text-[#FF9F1C]">catatan, analitik, dan diagnosis</span>
                </h2>
                
                <p className="text-[#3E2723]/90 mb-8 text-[16px] leading-relaxed font-sans font-medium">
                  SmartPoultry dibuat untuk peternak layer yang ingin mencatat log harian lewat Telegram, melihat efisiensi pakan ke telur di dashboard, dan mendapatkan notifikasi dini saat performa kandang mulai turun.
                </p>

                {/* 2x2 Clean bullet list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <div className="flex items-start gap-3.5">
                    <div className="bg-[#FF9F1C]/10 p-2.5 rounded-full text-[#FF9F1C] mt-1 shrink-0">
                      <CheckCircle2 className="w-5 h-5 fill-[#FF9F1C]/10" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#2C1E11] mb-1 leading-tight font-sans">Telegram input cepat</h4>
                      <p className="text-[#3E2723]/80 text-sm font-medium font-sans">Peternak cukup mengetik laporan singkat dari kandang.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="bg-[#FF9F1C]/10 p-2.5 rounded-full text-[#FF9F1C] mt-1 shrink-0">
                      <CheckCircle2 className="w-5 h-5 fill-[#FF9F1C]/10" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#2C1E11] mb-1 leading-tight font-sans">Laporan jadi rapi</h4>
                      <p className="text-[#3E2723]/80 text-sm font-medium font-sans">AI memetakan pakan, telur, mortalitas, dan vitamin otomatis.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="bg-[#FF9F1C]/10 p-2.5 rounded-full text-[#FF9F1C] mt-1 shrink-0">
                      <ScanLine className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#2C1E11] mb-1 leading-tight font-sans">Diagnosa visual</h4>
                      <p className="text-[#3E2723]/80 text-sm font-medium font-sans">Foto ayam atau kotoran untuk pemeriksaan awal yang lebih cepat.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="bg-[#FF9F1C]/10 p-2.5 rounded-full text-[#FF9F1C] mt-1 shrink-0">
                      <TabletSmartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#2C1E11] mb-1 leading-tight font-sans">Dashboard mobile-first</h4>
                      <p className="text-[#3E2723]/80 text-sm font-medium font-sans">Pantau kandang dari HP tanpa alur yang rumit.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pt-6 border-t border-[#2C1E11]/10">
                  <div className="flex flex-col">
                    <span className="font-serif italic text-3xl text-[#FF9F1C] tracking-wide font-semibold">
                      SmartPoultry Team
                    </span>
                    <span className="text-[10px] text-[#3E2723]/60 font-bold tracking-widest uppercase mt-0.5 font-sans">
                      AI Agent & Dashboard for Layer Farms
                    </span>
                  </div>

                  <button 
                    onClick={() => { window.location.href = '/layanan'; }}
                    className="flex items-center gap-2 px-8 py-3.5 bg-[#FF9F1C] text-[#2C1E11] text-sm font-bold rounded-full hover:bg-[#FFC107] transition-all shadow-lg hover:translate-x-1 duration-200 cursor-pointer"
                  >
                    Lihat alur kerja
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>

            </div>
          </div>
        </section>

        {/* ── SECTION 2: WHY CHOOSE US (3x2 Alternating Grid - Image 2) ── */}
        <section className="bg-[#FDFBF7] py-20 border-t border-[#2C1E11]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header Section */}
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-[#FF9F1C] font-extrabold tracking-widest text-xs uppercase font-sans px-3.5 py-1.5 bg-[#FF9F1C]/10 rounded-full">
                Why Choose Us
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-[#2C1E11] tracking-tight mt-4 mb-6 font-sans leading-tight">
                Kenapa Peternak Memilih SmartPoultry AI
              </h2>
              <p className="text-[#2C1E11]/75 text-base md:text-lg font-medium leading-relaxed font-sans">
                Solusi pintar peternakan kami dirancang untuk menyederhanakan manajemen kandang, mengoptimalkan rasio pakan ke telur, dan mendukung kesuksesan jangka panjang peternak layer di Indonesia.
              </p>
            </div>

            {/* 3x2 Symmetrical Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Dark (Warm Earth) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-[#2C1E11] rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] border border-[#2C1E11]/10 shadow-lg relative group overflow-hidden text-left"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FF9F1C] flex items-center justify-center text-[#2C1E11] mb-8">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#FDFBF7] mb-4 font-sans tracking-tight">
                    Teknologi Kandang Pintar
                  </h3>
                  <p className="text-[#FDFBF7]/80 text-sm leading-relaxed font-medium font-sans">
                    Akses asisten AI otomatis untuk memantau kesehatan ayam, mencatat produksi harian, dan mendeteksi anomali secara instan.
                  </p>
                </div>
              </motion.div>

              {/* Card 2: Light (Egg Yolk Gold) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-[#FF9F1C] rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] border border-[#FF9F1C]/10 shadow-lg relative group overflow-hidden text-left"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#2C1E11] flex items-center justify-center text-[#FF9F1C] mb-8">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2C1E11] mb-4 font-sans tracking-tight">
                    Produktivitas Telur Optimal
                  </h3>
                  <p className="text-[#2C1E11]/85 text-sm leading-relaxed font-medium font-sans">
                    Solusi berbasis AI kami membantu mengoptimalkan rasio pakan-ke-telur (FCR) guna memaksimalkan hasil panen harian Anda.
                  </p>
                </div>
              </motion.div>

              {/* Card 3: Dark (Warm Earth) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-[#2C1E11] rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] border border-[#2C1E11]/10 shadow-lg relative group overflow-hidden text-left"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FF9F1C] flex items-center justify-center text-[#2C1E11] mb-8">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#FDFBF7] mb-4 font-sans tracking-tight">
                    Efisiensi Sumber Daya
                  </h3>
                  <p className="text-[#FDFBF7]/80 text-sm leading-relaxed font-medium font-sans">
                    Kurangi pemborosan pakan, air, listrik, dan biaya operasional kandang dengan kalkulasi presisi kecerdasan buatan.
                  </p>
                </div>
              </motion.div>

              {/* Card 4: Light (Egg Yolk Gold) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-[#FF9F1C] rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] border border-[#FF9F1C]/10 shadow-lg relative group overflow-hidden text-left"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#2C1E11] flex items-center justify-center text-[#FF9F1C] mb-8">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#2C1E11] mb-4 font-sans tracking-tight">
                    Dukungan Konsultasi Ahli
                  </h3>
                  <p className="text-[#2C1E11]/85 text-sm leading-relaxed font-medium font-sans">
                    Dapatkan bimbingan berkelanjutan dan asisten AI responsif 24/7 untuk memantau tantangan kendala peternakan harian.
                  </p>
                </div>
              </motion.div>

              {/* Card 5: Dark (Warm Earth) */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-[#2C1E11] rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] border border-[#2C1E11]/10 shadow-lg relative group overflow-hidden text-left"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#FF9F1C] flex items-center justify-center text-[#2C1E11] mb-8">
                    <Sprout className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#FDFBF7] mb-4 font-sans tracking-tight">
                    Peternakan Berkelanjutan
                  </h3>
                  <p className="text-[#FDFBF7]/80 text-sm leading-relaxed font-medium font-sans">
                    Terapkan pola biosekuriti modern ramah lingkungan untuk melestarikan lingkungan sekitar sekaligus profit bisnis jangka panjang.
                  </p>
                </div>
              </motion.div>

              {/* Card 6: Light (Egg Yolk Gold) with Image and CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-[#FF9F1C] rounded-[2rem] p-8 flex flex-col justify-between min-h-[380px] border border-[#FF9F1C]/10 shadow-lg relative overflow-hidden group pb-0 text-left"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-extrabold text-[#2C1E11] mb-5 tracking-tight font-sans">
                    Pilih SmartPoultry Hari Ini
                  </h3>
                  <button className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#2C1E11] hover:bg-[#1E140B] text-[#FF9F1C] hover:text-white text-sm font-bold rounded-full transition-all shadow-md active:scale-95 duration-200 cursor-pointer">
                    Mulai Sekarang
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Farmer overlap at the bottom */}
                <div className="relative mt-auto w-full flex justify-center items-end h-[210px] overflow-hidden select-none pointer-events-none">
                  <img 
                    src="/assets/4_compressed.webp" 
                    alt="Poultry Farmer" 
                    className="w-auto h-[210px] object-cover origin-bottom translate-y-3 group-hover:scale-105 group-hover:translate-y-1 transition-all duration-300 drop-shadow-md"
                  />
                </div>
              </motion.div>

            </div>

          </div>
        </section>

        {/* ── SECTION 3: STATISTICS & METRICS BANNER (Hills backdrop - Image 4) ── */}
        <section className="relative overflow-hidden h-[450px] lg:h-[400px]">
          {/* background image */}
          <img 
            src="/assets/paralax.webp" 
            alt="Peternakan Hijau Luas" 
            className="w-full h-full object-cover absolute inset-0 z-0 scale-[1.02]"
          />
          {/* Overlay mask */}
          <div className="absolute inset-0 bg-black/45 z-10"></div>

          {/* Banner content */}
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center text-center text-white">
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase mb-12 max-w-4xl mx-auto leading-tight font-sans">
              Menyehatkan Hasil Unggas Organik & <br />
              <span className="text-[#FF9F1C]">Presisi Teknologi Berkelanjutan</span>
            </h2>

            {/* Metrics Banner Overlay (Direct flat design from image 4) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-6xl bg-[#FDFBF7] text-[#2C1E11] shadow-2xl rounded-t-[2.5rem] p-8 sm:p-10 border-b-0 border border-slate-200/50 flex flex-col md:flex-row gap-8 items-center justify-between z-30">
              {/* Play video element */}
              <div className="flex shrink-0 items-center justify-center">
                <button className="h-16 w-16 rounded-full bg-[#FF9F1C] text-[#2C1E11] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </button>
              </div>

              {/* 4 Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 flex-1 w-full text-left">
                {[
                  { count: "678+", label: "Produk Peternakan" },
                  { count: "750+", label: "Proyek Selesai" },
                  { count: "999+", label: "Pelanggan Puas" },
                  { count: "700+", label: "Peternak Ahli" }
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-[#2C1E11] font-mono tracking-tight">{stat.count}</span>
                      <div className="h-2.5 w-2.5 rounded-full bg-[#FF9F1C]" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase mt-1 tracking-tight leading-tight">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Spacious padding gap between stats banner and members */}
        <div className="h-32 sm:h-24" />

        {/* ── SECTION 4: MEET EXPERT MEMBERS (Exactly like Image 3) ── */}
        <section className="bg-[#FDFBF7] py-20 border-t border-[#2C1E11]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-[#2C1E11] tracking-tight uppercase leading-none">
                Meet Expert Members
              </h2>
              <div className="h-1 w-16 bg-[#FF9F1C] mx-auto mt-4" />
            </div>

            {/* 4 Member Cards Symmetrical Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: "Sunardi", role: "Founder", img: "/assets/worker_1.webp" },
                { name: "Sunarno", role: "Expert Farmer", img: "/assets/worker_2.webp" },
                { name: "Budi Santoso", role: "IT Specialist", img: "/assets/worker_3.webp" },
                { name: "Ms. Egg", role: "Master Egg", img: "/assets/4_compressed.webp" }
              ].map((member, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group"
                >
                  {/* Photo area */}
                  <div className="w-full aspect-[4/3] sm:aspect-square bg-slate-100 overflow-hidden relative">
                    <img 
                      src={member.img} 
                      alt={member.name} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                  </div>

                  {/* Detail area */}
                  <div className="p-6 text-center space-y-2.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold text-[#2C1E11] font-sans tracking-tight">{member.name}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{member.role}</p>
                    </div>

                    {/* Symmetrical Social Icons */}
                    <div className="flex items-center justify-center gap-4 pt-2 text-slate-400 group-hover:text-[#FF9F1C] transition-colors border-t border-slate-50">
                      <a href="#" className="hover:text-[#FF9F1C] transition-colors"><Facebook className="w-4.5 h-4.5" /></a>
                      <a href="#" className="hover:text-[#FF9F1C] transition-colors"><Twitter className="w-4.5 h-4.5" /></a>
                      <a href="#" className="hover:text-[#FF9F1C] transition-colors"><Instagram className="w-4.5 h-4.5" /></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
