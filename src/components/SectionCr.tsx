import { useEffect, useRef } from 'react';

export default function SectionCr() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const bg = bgRef.current;
    if (!container || !bg) return;

    let animationFrameId: number;

    const updateParallax = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const totalHeight = rect.height + viewportHeight;
        const scrolled = viewportHeight - rect.top;
        const percentage = Math.max(0, Math.min(1, scrolled / totalHeight));
        const translateY = (percentage - 0.5) * -160; 
        bg.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(updateParallax);
    };

    animationFrameId = requestAnimationFrame(updateParallax);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full h-[500px] sm:h-[550px] lg:h-[600px] overflow-hidden mt-16 select-none"
    >
      <img
        ref={bgRef}
        src="/assets/paralax.webp"
        alt="Scenic background"
        className="absolute left-0 w-full h-[135%] top-[-17.5%] object-cover select-none pointer-events-none will-change-transform"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#2C1E11]/90 via-[#2C1E11]/30 to-[#1c130c]/70 z-5" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 z-5" />

      {/* Maskot dipindah ke kanan: Menggunakan right-0 dan negative right margin jika perlu */}
      <img
        src="/assets/maskot.png"
        alt="Maskot"
        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/farmer_smiling.png'; }}
        className="absolute -right-20 sm:-right-26 lg:-right-40 bottom-0 
                   w-72 sm:w-[450px] md:w-[520px] lg:w-[600px] xl:w-[1000px] 
                   h-auto pointer-events-none select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.45)] z-10"
      />

      {/* Konten Teks dipindah ke tengah dengan justify-center */}
      <div className="relative z-20 max-w-4xl mx-auto h-full flex items-center justify-center px-6">
        <div className="w-full flex flex-col items-center text-center">
          
          <span className="text-xs sm:text-sm font-extrabold text-primary-gold uppercase tracking-[0.25em] mb-4 drop-shadow-md">
            SMARTPOULTRY AI SYSTEM
          </span>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6.5xl font-black text-white leading-[1.1] tracking-tight mb-8 drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
            Peternakan Ayam <br />
            <span className="text-primary-gold">Cerdas & Modern.</span>
          </h2>
          
          <button 
            className="group flex items-center gap-3 px-9 py-4.5 bg-primary-gold hover:bg-yolk-accent text-warm-earth font-black rounded-full shadow-[0_10px_30px_rgba(255,159,28,0.3)] hover:shadow-[0_15px_35px_rgba(255,159,28,0.45)] transition-all duration-300 hover:scale-105 active:scale-95 border-none cursor-pointer text-base uppercase tracking-wider"
          >
            <span>Mulai Sekarang</span>
            <div className="flex items-center justify-center w-6.5 h-6.5 rounded-full bg-white text-warm-earth transition-transform duration-300 group-hover:translate-x-1.5 shadow-sm">
              <svg className="w-3.5 h-3.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>
          
        </div>
      </div>
    </section>
  );
}