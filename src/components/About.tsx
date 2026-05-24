import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, ScanLine, TabletSmartphone } from 'lucide-react';

export default function About() {
  return (
    <section id="tentang" className="relative overflow-hidden bg-eggshell py-24 select-none">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          <div className="lg:col-span-6 relative flex items-center justify-center w-full">
            {/* Majestic, un-cropped leaf/rooster shaped image - ENLARGED to match right column */}
            <div className="relative w-full max-w-full lg:max-w-2xl xl:max-w-[660px] z-10 flex items-center justify-center p-0">
              <motion.img 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1.25 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                src="/assets/about.png" 
                alt="SmartPoultry overview" 
                className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(44,30,17,0.12)] select-none pointer-events-none origin-center" 
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-primary-gold font-extrabold tracking-widest text-xs uppercase font-sans">
                Tentang SmartPoultry
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-warm-earth mb-6 leading-tight font-sans">
              Satu pintu untuk <br />
              <span className="text-primary-gold">catatan, analitik, dan diagnosis</span>
            </h2>
            
            <p className="text-earth-light/90 mb-8 text-[16px] leading-relaxed font-sans font-medium">
              SmartPoultry dibuat untuk peternak layer yang ingin mencatat log harian lewat Telegram, melihat efisiensi pakan ke telur di dashboard, dan mendapatkan notifikasi dini saat performa kandang mulai turun.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
              <div className="flex items-start gap-3.5">
                <div className="bg-primary-gold/10 p-2.5 rounded-full text-primary-gold mt-1 shrink-0">
                  <CheckCircle2 className="w-5 h-5 fill-primary-gold/10" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-warm-earth mb-1 leading-tight">Telegram input cepat</h4>
                  <p className="text-earth-light/80 text-sm font-medium">Peternak cukup mengetik laporan singkat dari kandang.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="bg-primary-gold/10 p-2.5 rounded-full text-primary-gold mt-1 shrink-0">
                  <CheckCircle2 className="w-5 h-5 fill-primary-gold/10" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-warm-earth mb-1 leading-tight">Laporan jadi rapi</h4>
                  <p className="text-earth-light/80 text-sm font-medium">AI memetakan pakan, telur, mortalitas, dan vitamin otomatis.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="bg-primary-gold/10 p-2.5 rounded-full text-primary-gold mt-1 shrink-0">
                  <ScanLine className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-warm-earth mb-1 leading-tight">Diagnosa visual</h4>
                  <p className="text-earth-light/80 text-sm font-medium">Foto ayam atau kotoran untuk pemeriksaan awal yang lebih cepat.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="bg-primary-gold/10 p-2.5 rounded-full text-primary-gold mt-1 shrink-0">
                  <TabletSmartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-warm-earth mb-1 leading-tight">Dashboard mobile-first</h4>
                  <p className="text-earth-light/80 text-sm font-medium">Pantau kandang dari HP tanpa alur yang rumit.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pt-6 border-t border-warm-earth/10">
              <div className="flex flex-col">
                <span className="font-serif italic text-3xl text-primary-gold tracking-wide font-semibold">
                  SmartPoultry Team
                </span>
                <span className="text-xs text-earth-light/60 font-bold tracking-widest uppercase mt-0.5">
                  AI Agent & Dashboard for Layer Farms
                </span>
              </div>

              <button className="flex items-center gap-2 px-8 py-3.5 bg-primary-gold text-warm-earth text-sm font-bold rounded-full hover:bg-yolk-accent transition-all shadow-lg hover:translate-x-1 duration-200 cursor-pointer">
                Lihat alur kerja
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
