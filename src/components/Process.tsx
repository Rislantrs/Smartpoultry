import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf } from 'lucide-react';

export default function Process() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      num: '01',
      title: 'Kirim Chat ke Telegram',
      desc: 'Tulis laporan harian kandang secara santai (pakan, panen telur, ayam mati) lewat Telegram.',
      img: '/assets/step_telegram.png',
      badge: 'Telegram Input'
    },
    {
      id: 2,
      num: '02',
      title: 'AI Ekstraksi Data',
      desc: 'Kecerdasan buatan menyusun pesan teks acak Anda menjadi format data terstruktur secara otomatis.',
      img: '/assets/step_ai.png',
      badge: 'LangChain AI Parser'
    },
    {
      id: 3,
      num: '03',
      title: 'Hasil Tampil di Dashboard',
      desc: 'Data otomatis terisi di panel analitik untuk memantau FCR, stok, dan alarm dini secara instan.',
      img: '/assets/step_dashboard.png',
      badge: 'Real-time Analytics'
    }
  ];

  return (
    <section id="proses" className="relative overflow-hidden bg-eggshell py-24 select-none">
      
      {/* Left Vertical Scrolling Text (Rotated -90deg) */}
      <div className="hidden lg:block absolute left-[-470px] xl:left-[-450px] 2xl:left-[-430px] top-1/2 -translate-y-1/2 -rotate-90 origin-center select-none pointer-events-none z-0 w-[1000px] overflow-hidden">
        <div className="flex w-max whitespace-nowrap gap-0 animate-marquee-left text-[4.5rem] xl:text-[5.5rem] font-black text-warm-earth/10 tracking-[0.3em] font-sans uppercase">
          <span className="shrink-0">HIDUP TELUR &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span className="shrink-0">HIDUP TELUR &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      {/* Right Vertical Scrolling Text (Rotated 90deg) */}
      <div className="hidden lg:block absolute right-[-470px] xl:right-[-450px] 2xl:right-[-430px] top-1/2 -translate-y-1/2 rotate-90 origin-center select-none pointer-events-none z-0 w-[1000px] overflow-hidden">
        <div className="flex w-max whitespace-nowrap gap-0 animate-marquee-right text-[4.5rem] xl:text-[5.5rem] font-black text-warm-earth/10 tracking-[0.3em] font-sans uppercase">
          <span className="shrink-0">AUTOMATION &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span className="shrink-0">AUTOMATION &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </div>
      </div>

      {/* Subtle organic background elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-gold/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yolk-accent/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-1.5 mb-3">
            <Leaf className="w-4 h-4 text-primary-gold fill-primary-gold/10 animate-pulse" />
            <span className="text-primary-gold font-extrabold tracking-widest text-xs uppercase font-sans px-3 py-1 bg-primary-gold/5 rounded-full">
              Alur kerja
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-warm-earth tracking-tight font-sans leading-tight">
            Dari chat kandang ke insight dalam 3 langkah
          </h2>
        </div>

        {/* ========================================================== */}
        {/* DESKTOP LAYOUT: Gorgeous Orbital Circle Layout (lg:block) */}
        {/* ========================================================== */}
        <div className="hidden lg:block relative w-[960px] h-[650px] mx-auto lg:scale-[0.82] xl:scale-100 origin-center transition-all duration-300">
          
          {/* 1. Slow Rotating Dashed Circle Path */}
          <div className="absolute left-1/2 top-[63%] -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full border-2 border-dashed border-primary-gold/30 animate-[spin_180s_linear_infinite] pointer-events-none" />

          {/* 2. central Hub (Wooden Egg Basket with Glowing Pulses) */}
          <div className="absolute left-1/2 top-[63%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            {/* Glow Aura */}
            <div className="absolute inset-0 bg-primary-gold/20 rounded-full blur-[35px] animate-pulse" />
            
            {/* Main Central Circular Frame */}
            <div className="relative w-52 h-52 rounded-full border-8 border-white bg-white shadow-2xl overflow-hidden hover:scale-105 transition-transform duration-500 cursor-pointer">
              <img 
                src="/assets/eggs_basket.png" 
                alt="Keranjang Telur Segar SmartPoultry" 
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute inset-0 bg-warm-earth/5 mix-blend-multiply pointer-events-none" />
            </div>

            {/* Glowing Accent Label */}
            <div className="absolute -bottom-4 bg-white/95 backdrop-blur-md border border-warm-earth/5 shadow-lg px-4 py-1.5 rounded-full font-bold text-xs text-warm-earth tracking-wide uppercase select-none">
              SmartPoultry Flow
            </div>
          </div>

          {/* ================= STEP 1: Telegram (Bottom-Left / 210°) ================= */}
          {/* Step 1 Thumbnail Node */}
          <div 
            style={{ left: '28.3%', top: '81.4%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            onMouseEnter={() => setHoveredStep(1)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <div className={`relative w-28 h-28 rounded-full border-4 ${hoveredStep === 1 ? 'border-primary-gold scale-110 shadow-[0_0_25px_rgba(255,159,28,0.45)]' : 'border-white'} bg-white shadow-xl overflow-hidden transition-all duration-300 cursor-pointer`}>
              <img src={steps[0].img} alt={steps[0].title} className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Step 1 Text Content */}
          <div 
            style={{ left: '0%', top: '64%', width: '220px' }}
            className="absolute text-right z-20"
            onMouseEnter={() => setHoveredStep(1)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <div className="relative">
              {/* Giant Background Number */}
              <span className="absolute right-0 -top-14 text-[8rem] font-extrabold text-warm-earth/5 -z-10 leading-none select-none font-sans">
                {steps[0].num}
              </span>
              <span className="text-[10px] bg-primary-gold/10 text-primary-gold font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans inline-block mb-2">
                {steps[0].badge}
              </span>
              <h3 className="text-xl font-bold text-warm-earth mb-2 font-sans transition-colors duration-200">
                {steps[0].title}
              </h3>
              <p className="text-earth-light/80 text-[13px] leading-relaxed font-medium font-sans">
                {steps[0].desc}
              </p>
            </div>
          </div>

          {/* ================= STEP 2: AI Core (Top-Center / 90°) ================= */}
          {/* Step 2 Thumbnail Node */}
          <div 
            style={{ left: '50%', top: '26%' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            onMouseEnter={() => setHoveredStep(2)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <div className={`relative w-28 h-28 rounded-full border-4 ${hoveredStep === 2 ? 'border-primary-gold scale-110 shadow-[0_0_25px_rgba(255,159,28,0.45)]' : 'border-white'} bg-white shadow-xl overflow-hidden transition-all duration-300 cursor-pointer`}>
              <img src={steps[1].img} alt={steps[1].title} className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Step 2 Text Content */}
          <div 
            style={{ left: '50%', top: '-3%', transform: 'translateX(-50%)', width: '360px' }}
            className="absolute text-center z-20"
            onMouseEnter={() => setHoveredStep(2)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <div className="relative">
              {/* Giant Background Number */}
              <span className="absolute left-1/2 -translate-x-1/2 -top-14 text-[8rem] font-extrabold text-warm-earth/5 -z-10 leading-none select-none font-sans">
                {steps[1].num}
              </span>
              <span className="text-[10px] bg-terracotta/10 text-terracotta font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans inline-block mb-2">
                {steps[1].badge}
              </span>
              <h3 className="text-xl font-bold text-warm-earth mb-2 font-sans transition-colors duration-200">
                {steps[1].title}
              </h3>
              <p className="text-earth-light/80 text-[13px] leading-relaxed font-medium font-sans">
                {steps[1].desc}
              </p>
            </div>
          </div>

          {/* ================= STEP 3: Dashboard (Bottom-Right / 330°) ================= */}
          {/* Step 3 Thumbnail Node */}
          <div 
            style={{ right: '28.3%', top: '81.4%' }}
            className="absolute translate-x-1/2 -translate-y-1/2 z-20"
            onMouseEnter={() => setHoveredStep(3)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <div className={`relative w-28 h-28 rounded-full border-4 ${hoveredStep === 3 ? 'border-primary-gold scale-110 shadow-[0_0_25px_rgba(255,159,28,0.45)]' : 'border-white'} bg-white shadow-xl overflow-hidden transition-all duration-300 cursor-pointer`}>
              <img src={steps[2].img} alt={steps[2].title} className="w-full h-full object-cover" />
            </div>
          </div>
          {/* Step 3 Text Content */}
          <div 
            style={{ right: '0%', top: '64%', width: '220px' }}
            className="absolute text-left z-20"
            onMouseEnter={() => setHoveredStep(3)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <div className="relative">
              {/* Giant Background Number */}
              <span className="absolute left-0 -top-14 text-[8rem] font-extrabold text-warm-earth/5 -z-10 leading-none select-none font-sans">
                {steps[2].num}
              </span>
              <span className="text-[10px] bg-earth-light/10 text-earth-light font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans inline-block mb-2">
                {steps[2].badge}
              </span>
              <h3 className="text-xl font-bold text-warm-earth mb-2 font-sans transition-colors duration-200">
                {steps[2].title}
              </h3>
              <p className="text-earth-light/80 text-[13px] leading-relaxed font-medium font-sans">
                {steps[2].desc}
              </p>
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* MOBILE & TABLET LAYOUT: Vertical Premium Timeline (lg:hidden) */}
        {/* ========================================================== */}
        <div className="lg:hidden relative">
          
          {/* Dashed Central Timeline Line */}
          <div className="absolute left-[35px] md:left-1/2 top-8 bottom-8 w-0.5 border-l-2 border-dashed border-primary-gold/30 -translate-x-1/2 pointer-events-none" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="flex flex-col md:flex-row items-start md:items-center relative"
              >
                {/* Node thumbnail positioned on the timeline line */}
                <div className="absolute left-[35px] md:left-1/2 -translate-x-1/2 z-10">
                  <div className="w-16 h-16 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                    <img src={step.img} alt={step.title} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Left padding / empty space on desktop side of timeline */}
                <div className="hidden md:block w-1/2 pr-12 text-right">
                  {index % 2 === 0 && (
                    <div className="relative">
                      <span className="text-[8px] bg-primary-gold/10 text-primary-gold font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans inline-block mb-1">
                        {step.badge}
                      </span>
                      <h3 className="text-lg font-bold text-warm-earth mb-1 font-sans">{step.title}</h3>
                      <p className="text-earth-light/75 text-xs leading-relaxed font-sans">{step.desc}</p>
                    </div>
                  )}
                </div>

                {/* spacer for the vertical timeline dot */}
                <div className="w-16 h-16 md:hidden flex-shrink-0" />

                {/* Right side content (used for mobile, and alternating on tablet) */}
                <div className="w-full md:w-1/2 pl-6 md:pl-12 text-left mt-2 md:mt-0">
                  {(index % 2 !== 0 || window.innerWidth < 768) && (
                    <div className="relative bg-white rounded-[2rem] p-6 shadow-md border border-warm-earth/5">
                      {/* Giant absolute number background */}
                      <span className="absolute right-4 top-2 text-6xl font-extrabold text-warm-earth/5 pointer-events-none select-none font-sans">
                        {step.num}
                      </span>
                      <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider font-sans inline-block mb-2 ${
                        step.id === 1 ? 'bg-primary-gold/10 text-primary-gold' : 
                        step.id === 2 ? 'bg-terracotta/10 text-terracotta' : 'bg-earth-light/10 text-earth-light'
                      }`}>
                        {step.badge}
                      </span>
                      <h3 className="text-lg font-bold text-warm-earth mb-2 font-sans">{step.title}</h3>
                      <p className="text-earth-light/75 text-xs leading-relaxed font-sans">{step.desc}</p>
                    </div>
                  )}
                </div>

              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}

