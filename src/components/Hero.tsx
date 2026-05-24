import { ArrowUpRight, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onOpenLogin: () => void;
}

export default function Hero({ onOpenLogin }: HeroProps) {
  return (
    <section id="beranda" className="relative min-h-screen flex items-center justify-start overflow-hidden bg-[#1c130c] pt-28 pb-20 select-none">
      
      {/* Background Section with High-Visibility Farm Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/hero1_compressed.webp" 
          alt="SmartPoultry farm backdrop" 
          className="h-full w-full object-cover object-center opacity-85" 
        />
        {/* Double gradient overlay: dark left side for text contrast, completely clear right side for background visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c130c]/95 via-[#1c130c]/70 to-[#1c130c]/15"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#241d13] via-transparent to-[#1c130c]/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col items-start justify-center text-left">
        
        {/* Main Title Heading - Left Aligned */}
        <motion.h1 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl lg:text-7.5xl font-black text-white tracking-tight leading-[1.1] mb-6 font-sans max-w-3xl"
        >
          Catat kandang, <br />
          <span className="text-primary-gold">pantau produksi,</span> <br className="hidden sm:inline" />
          dan cegah rugi lebih cepat.
        </motion.h1>

        {/* Subtitle Description - Left Aligned */}
        <motion.p 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.15 }}
          className="text-lg md:text-xl text-eggshell/90 mb-10 max-w-2xl leading-relaxed font-sans font-medium"
        >
          SmartPoultry mengubah chat harian peternak menjadi log rapi, memantau efisiensi pakan ke telur, dan memberi peringatan awal saat produksi mulai turun.
        </motion.p>

        {/* Call to Actions (CTA) Buttons - Left Aligned */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-start gap-5"
        >
          {/* Main CTA: Pill capsule button with white circle arrow that rotates on hover */}
          <button 
            onClick={onOpenLogin}
            className="group flex items-center gap-4.5 pl-8 pr-3 py-3 bg-primary-gold text-warm-earth font-extrabold rounded-full hover:bg-yolk-accent transition-all shadow-2xl shadow-primary-gold/25 hover:scale-102 active:scale-98 duration-300 cursor-pointer border-none text-base font-sans"
          >
            <span>Hubungkan Telegram</span>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-warm-earth transition-transform duration-300 group-hover:rotate-45 shadow-sm">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
          </button>

          {/* Secondary CTA */}
          <a 
            href="#analisis" 
            className="flex items-center gap-3 px-7 py-4.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-full border border-white/15 transition-all duration-200 cursor-pointer text-base backdrop-blur-xs font-sans hover:scale-102 active:scale-98"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Lihat alurnya</span>
          </a>
        </motion.div>

      </div>

      {/* Elegant wave cut at the bottom which slopes seamlessly into white bg */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-13.75 xl:h-20 text-eggshell fill-current"
        >
          <path d="M0,80 C360,130 840,30 1200,80 L1200,120 L0,120 Z" />
        </svg>
      </div>
      
    </section>
  );
}

