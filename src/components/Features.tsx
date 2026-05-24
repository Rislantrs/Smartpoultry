import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowLeft, ArrowRight, Bot, ClipboardCheck, Scale } from 'lucide-react';

export default function Features() {
  const navigate = useNavigate();
  const services = [
    {
      tabId: "ai-telegram",
      image: "/assets/ai_1_compressed.webp",
      icon: Bot,
      iconColor: "text-[#D35400] bg-[#D35400]/10",
      arrowBg: "bg-yolk-accent hover:bg-[#E0A800]",
      title: "AI Agent Telegram",
      description: "Peternak cukup kirim laporan singkat, lalu AI mengekstrak pakan, telur, vitamin, dan kondisi ayam ke format rapi."
    },
    {
      tabId: "auto-ledger",
      image: "/assets/ai_2_compressed.webp",
      icon: ClipboardCheck,
      iconColor: "text-primary-gold bg-primary-gold/10",
      arrowBg: "bg-primary-gold hover:bg-yolk-accent text-warm-earth",
      title: "Auto-Ledger Dashboard",
      description: "Semua log masuk ke tabel produksi agar stok, tren, dan histori kandang bisa dibaca cepat dari web."
    },
    {
      tabId: "diagnosis-warning",
      image: "/assets/ai_3_compressed.webp",
      icon: Scale,
      iconColor: "text-[#3E2723] bg-[#3E2723]/10",
      arrowBg: "bg-[#3E2723] hover:bg-[#2C1E11] text-white",
      title: "Diagnosa & peringatan",
      description: "Saat produksi turun atau ada gejala sakit, sistem memberi sinyal awal agar tindakan lapangan lebih cepat."
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Sync window resize to adjust visible cards and slider logic
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const maxIndex = isMobile ? 2 : isTablet ? 1 : 0;

  // Auto slide interval (4 seconds)
  useEffect(() => {
    if (isPaused || isDesktop) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, maxIndex, isDesktop]);

  const handlePrev = () => {
    setIsPaused(true);
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setIsPaused(true);
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  // Compute transform translation value
  const getTranslationStyle = () => {
    if (isDesktop) return 'translate3d(0px, 0, 0)';
    if (isTablet) return `translate3d(calc(-${activeIndex} * (50% + 12px)), 0, 0)`;
    return `translate3d(calc(-${activeIndex} * (100% + 24px)), 0, 0)`;
  };

  return (
    <section id="analisis" className="relative overflow-hidden bg-soft-beige py-24 select-none">
      
      {/* Background Backdrop (bg_2) with 100% opacity as configured by the user */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/bg_2.webp" 
          alt="SmartPoultry farm landscape backdrop" 
          className="h-full w-full object-cover object-center pointer-events-none select-none" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 mb-4">
              <Leaf className="w-4 h-4 text-primary-gold fill-primary-gold/10 animate-pulse" />
              <span className="text-primary-gold font-extrabold tracking-widest text-xs uppercase font-sans">
                Fitur utama
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-warm-earth tracking-tight font-sans leading-tight">
              Tiga lapis alat untuk kerja kandang yang lebih tenang
            </h2>
          </div>
          
          {/* Navigation Controls (Visible on mobile/tablet or when sliding) */}
          <div className="flex items-center gap-3 shrink-0 lg:hidden">
            <button 
              onClick={handlePrev}
              className="w-12 h-12 rounded-full border border-warm-earth/10 flex items-center justify-center text-warm-earth hover:bg-warm-earth hover:text-white transition-all cursor-pointer shadow-sm active:scale-90 duration-150"
              aria-label="Previous Slide"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext}
              className="w-12 h-12 rounded-full bg-primary-gold flex items-center justify-center text-warm-earth hover:bg-yolk-accent transition-all cursor-pointer shadow-md active:scale-90 duration-150"
              aria-label="Next Slide"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Slider Track Container */}
        <div className="overflow-hidden py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div 
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{
              transform: getTranslationStyle(),
            }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 flex flex-col filter drop-shadow-lg group hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Card Top Image */}
                <div className="w-full h-80 rounded-4xl overflow-hidden shadow-md relative">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-warm-earth/10 rounded-4xl"></div>
                </div>

                {/* Card Bottom Overlay Details */}
                <div className="relative z-10 -mt-20 mx-5 bg-white rounded-3xl p-6 shadow-xl border border-warm-earth/5">
                  <div className="flex justify-between items-center mb-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${service.iconColor}`}>
                      <service.icon className="w-6 h-6" />
                    </div>

                    <button 
                      onClick={() => navigate(`/layanan?tab=${service.tabId}`)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${service.arrowBg} transition-all shadow-md cursor-pointer hover:scale-110 active:scale-90 duration-150`}
                    >
                      <ArrowRight className="w-4 h-4 text-warm-earth font-black" />
                    </button>
                  </div>

                  <h3 
                    onClick={() => navigate(`/layanan?tab=${service.tabId}`)}
                    className="text-2xl font-bold text-warm-earth mb-2 font-sans cursor-pointer hover:text-primary-gold transition-colors"
                  >
                    {service.title}
                  </h3>
                  <p className="text-earth-light/70 text-sm leading-relaxed font-medium">
                    {service.description}
                  </p>

                  <div className="absolute right-3 bottom-3 opacity-[0.03] pointer-events-none select-none">
                    <Leaf className="w-16 h-16 text-primary-gold" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress dots at the bottom (visible on mobile and tablet) */}
        <div className="flex justify-center items-center gap-2 mt-10 lg:hidden">
          {Array.from({ length: isMobile ? 3 : 2 }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsPaused(true);
                setActiveIndex(index);
              }}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === index 
                  ? 'w-8 bg-primary-gold' 
                  : 'w-2.5 bg-warm-earth/20 hover:bg-warm-earth/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
