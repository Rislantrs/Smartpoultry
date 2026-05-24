import { motion } from 'motion/react';
import { Cpu, TrendingUp, Zap, Headphones, Sprout, ArrowUpRight } from 'lucide-react';

export default function WhyChooseUs() {
  return (
    <section id="mengapa-kami" className="bg-eggshell py-24 select-none overflow-hidden relative">
      {/* Decorative background grids/details */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#2C1E11] blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#FFAE19] blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-[#2C1E11] font-extrabold tracking-widest text-xs uppercase font-sans px-3.5 py-1.5 bg-[#FFAE19]/10 text-[#FF9F1C] rounded-full">
            Why Choose Us
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2C1E11] tracking-tight mt-4 mb-6 font-sans leading-tight">
            Kenapa Peternak Memilih SmartPoultry AI
          </h2>
          <p className="text-[#2C1E11]/75 text-base md:text-lg font-medium leading-relaxed font-sans">
            Solusi pintar peternakan kami dirancang untuk menyederhanakan manajemen kandang, mengoptimalkan rasio pakan ke telur, dan mendukung kesuksesan jangka panjang peternak layer di Indonesia.
          </p>
        </div>

        {/* 3x2 Alternating Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Dark (Warm Earth) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-[#2C1E11] rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] border border-[#2C1E11]/10 shadow-lg relative group overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFAE19] flex items-center justify-center text-[#2C1E11] mb-8">
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
            className="bg-[#FFAE19] rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] border border-[#FFAE19]/10 shadow-lg relative group overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#2C1E11] flex items-center justify-center text-[#FFAE19] mb-8">
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
            className="bg-[#2C1E11] rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] border border-[#2C1E11]/10 shadow-lg relative group overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFAE19] flex items-center justify-center text-[#2C1E11] mb-8">
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
            className="bg-[#FFAE19] rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] border border-[#FFAE19]/10 shadow-lg relative group overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#2C1E11] flex items-center justify-center text-[#FFAE19] mb-8">
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
            className="bg-[#2C1E11] rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] border border-[#2C1E11]/10 shadow-lg relative group overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#FFAE19] flex items-center justify-center text-[#2C1E11] mb-8">
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
            className="bg-[#FFAE19] rounded-[2rem] p-8 flex flex-col justify-between min-h-[380px] border border-[#FFAE19]/10 shadow-lg relative overflow-hidden group pb-0"
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold text-[#2C1E11] mb-5 tracking-tight font-sans">
                Pilih SmartPoultry Hari Ini
              </h3>
              <button className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#2C1E11] hover:bg-[#1E140B] text-[#FFAE19] hover:text-white text-sm font-bold rounded-full transition-all shadow-md active:scale-95 duration-200 cursor-pointer">
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
  );
}
