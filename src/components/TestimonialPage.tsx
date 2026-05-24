import { useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import { motion } from 'motion/react';
import { Quote, Star, ArrowUpRight, TrendingUp } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  content: string;
}

const marqueeRow1: Testimonial[] = [
  {
    name: 'Pak Budi',
    role: 'Peternak Layer Mandiri — Blitar',
    content: 'FCR adalah urat nadi bisnis peternakan. Dengan SmartPoultry, kebocoran pakan sekecil apa pun langsung terdeteksi di dasbor sebelum kami merugi.'
  },
  {
    name: 'Ibu Hesti',
    role: 'Pemilik Hesti Poultry — Kendal',
    content: 'Operator kandang saya cukup mengetik logs di Telegram sambil membawa keranjang telur. Efisiensi FCR bulanan kami meningkat pesat!'
  },
  {
    name: 'Pak Gunawan',
    role: 'Manajer Kandang — Payakumbuh',
    content: 'Laporan pagi otomatis via bot Telegram jam 07:00 WIB sangat membantu saya mengevaluasi performa mandor harian secara langsung.'
  },
  {
    name: 'Bapak Joko',
    role: 'Mitra Joko Farm — Magelang',
    content: 'Dengan Auto-Ledger, kami tidak lagi pusing menyusun laporan bulanan untuk investor. Semua data bersih dan valid setiap hari.'
  },
  {
    name: 'Bapak Slamet',
    role: 'Peternak Skala Kecil — Kediri',
    content: 'Sangat praktis. Sambil berkeliling kandang, saya bisa merekam laporan suara di Telegram dan AI langsung mencatatnya ke database.'
  },
  {
    name: 'Ibu Fitri',
    role: 'Manajer Gudang Pakan — Solo',
    content: 'Alarm otomatis reorder pakan benar-benar menyelamatkan kami dari keterlambatan logistik. Stok pakan terpantau aman setiap minggu.'
  }
];

const marqueeRow2: Testimonial[] = [
  {
    name: 'Pak Rian',
    role: 'Peternak Muda Layer — Denpasar',
    content: 'Tampilan dasbornya sangat modern dan mobile-first. Saya bisa memantau tren pakan dan FCR kandang langsung dari HP dengan nyaman.'
  },
  {
    name: 'Bapak Agus',
    role: 'Agus Poultry Farm — Malang',
    content: 'Vet AI Advisor sangat responsif ketika ayam kami menunjukkan gejala lesu di malam hari. Panduan penanganannya tepercaya dan presisi.'
  },
  {
    name: 'Bapak Heru',
    role: 'Owner Heru Layer — Ciamis',
    content: 'Imunisasi harian dan jadwal vaksinasi unggas kini tercatat rapi tanpa takut terlewat. SmartPoultry melipatgandakan produktivitas kami.'
  },
  {
    name: 'Ibu Ani',
    role: 'Ani Poultry — Palembang',
    content: 'Integrasi bot Telegram sangat ringan sinyal. Bahkan di daerah peternakan kami yang susah sinyal, bot tetap mengirim data secara instan.'
  },
  {
    name: 'Bapak Supardi',
    role: 'Pemilik Farm Layer 12.000 Ekor',
    content: 'Dulu rekap telur tiap sore sering salah tulis. Sekarang mandor tinggal kirim chat, data langsung masuk ke dashboard dan stok lebih gampang dicek.'
  },
  {
    name: 'Ibu Rahma',
    role: 'Peternak Skala Menengah',
    content: 'Fitur kamera AI-nya berguna sekali. Saat ada ayam lemas, saya foto lalu dapat arahan awal untuk dipisahkan sebelum masalah makin menyebar.'
  }
];

export default function TestimonialPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C1E11] relative overflow-x-hidden font-sans">
      <Header onOpenLogin={() => { window.location.href = '/login'; }} />

      <main className="pt-32 pb-20 select-none">
        
        {/* Testimonials Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-left">
          <span className="text-[#FF9F1C] font-extrabold tracking-widest text-xs uppercase block mb-3 font-sans">
            Ulasan Peternak — Testimoni
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#2C1E11] tracking-tight leading-tight uppercase mb-6 font-sans">
            Cerita sukses dari <span className="text-[#FF9F1C]">lapangan peternakan</span>.
          </h1>
          <p className="text-[#2C1E11]/75 text-base sm:text-lg font-medium leading-relaxed max-w-3xl font-sans">
            Bagaimana ekosistem AI Telegram dan dasbor Auto-Ledger kami membantu produktivitas harian peternak unggas di seluruh penjuru Indonesia.
          </p>
        </div>

        {/* ── SECTION 1: INTERACTIVE BENTO GRID (Varying Sizes - Symmetrical Theme Style) ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Bento Card 1: Wide Featured Testimonial (col-span-2) */}
            <div className="md:col-span-2 bg-white rounded-[2rem] p-8 sm:p-10 shadow-lg shadow-[#2C1E11]/5 relative border border-[#2C1E11]/5 flex flex-col justify-between text-left">
              <Quote className="w-16 h-16 text-[#FF9F1C]/15 absolute top-8 right-8" />
              
              <div>
                {/* 5 stars */}
                <div className="flex gap-1 mb-6 text-[#FF9F1C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>

                {/* Testimony */}
                <blockquote className="text-xl sm:text-2xl font-serif italic text-[#3E2723]/95 leading-relaxed font-semibold mb-8 max-w-3xl">
                  "Kami berhasil menghemat hingga 1.2 ton pakan konsentrat dalam sebulan karena anomali kebocoran pakan terdeteksi 3 hari lebih awal di grafik FCR SmartPoultry sebelum menjadi kerugian menumpuk."
                </blockquote>
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between gap-6 pt-6 border-t border-slate-100 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9F1C] to-[#FFC107] flex items-center justify-center font-bold text-[#2C1E11] text-base shadow-md">
                    SR
                  </div>
                  <div className="leading-tight">
                    <span className="block font-black text-[#2C1E11] text-base uppercase tracking-tight">Pak Sofyan Rofi</span>
                    <span className="block text-xs text-[#FF9F1C] font-bold uppercase tracking-wider mt-0.5">Pemilik Rofi Layer Farm — Kendal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card 2: Metrics / Highlights Card (col-span-1) */}
            <div className="bg-[#2C1E11] rounded-[2rem] p-8 sm:p-10 shadow-lg relative border border-[#2C1E11]/10 flex flex-col justify-between text-left group overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-5">
                <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-[#FF9F1C] blur-2xl"></div>
              </div>

              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF9F1C] flex items-center justify-center text-[#2C1E11] mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF9F1C] block">
                  Efisiensi Nutrisi Pakan
                </span>
                <h3 className="text-3xl font-black text-white leading-none font-sans tracking-tight">
                  FCR 2.38 → 2.12
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  Rata-rata peningkatan efisiensi rasio pakan terhadap telur yang dicapai oleh peternak mitra kami di Blitar.
                </p>
              </div>

              <div className="text-[11px] font-extrabold text-[#FF9F1C] uppercase tracking-widest bg-[#FF9F1C]/10 border border-[#FF9F1C]/20 px-4 py-2 rounded-full inline-block mt-8 relative z-10 w-fit">
                📈 Naik 11% Profitabilitas
              </div>
            </div>

            {/* Bento Card 3: Standard Card Supardi (col-span-1) */}
            <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-[#2C1E11]/5 relative border border-[#2C1E11]/5 flex flex-col justify-between text-left">
              <Quote className="w-12 h-12 text-[#FF9F1C]/15 absolute top-6 right-6" />
              <div>
                <div className="flex gap-1 mb-5 text-[#FF9F1C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-[#3E2723]/90 text-sm sm:text-base leading-relaxed mb-6 italic">
                  "Dulu rekap telur tiap sore sering salah tulis. Sekarang mandor tinggal kirim chat, data langsung masuk ke dashboard dan stok lebih gampang dicek."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-black text-[#2C1E11] text-base">{marqueeRow2[4].name}</h4>
                <p className="text-xs text-[#FF9F1C] font-bold mt-0.5">{marqueeRow2[4].role}</p>
              </div>
            </div>

            {/* Bento Card 4: Standard Card Rahma (col-span-1) */}
            <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-[#2C1E11]/5 relative border border-[#2C1E11]/5 flex flex-col justify-between text-left">
              <Quote className="w-12 h-12 text-[#FF9F1C]/15 absolute top-6 right-6" />
              <div>
                <div className="flex gap-1 mb-5 text-[#FF9F1C]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-[#3E2723]/90 text-sm sm:text-base leading-relaxed mb-6 italic">
                  "Fitur kamera AI-nya berguna sekali. Saat ada ayam lemas, saya foto lalu dapat arahan awal untuk dipisahkan sebelum masalah makin menyebar."
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-black text-[#2C1E11] text-base">{marqueeRow2[5].name}</h4>
                <p className="text-xs text-[#FF9F1C] font-bold mt-0.5">{marqueeRow2[5].role}</p>
              </div>
            </div>

            {/* Bento Card 5: Call to Action Bento (col-span-1) */}
            <div className="bg-[#FF9F1C] rounded-[2rem] p-8 shadow-lg border border-[#FF9F1C]/10 flex flex-col justify-between text-left relative overflow-hidden group">
              <div className="absolute inset-0 pointer-events-none opacity-5">
                <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-[#2C1E11] blur-2xl"></div>
              </div>

              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2C1E11] block mb-2">
                  Siap Bergabung?
                </span>
                <h3 className="text-2xl font-extrabold text-[#2C1E11] tracking-tight leading-tight uppercase mb-4">
                  Optimalkan pakan & FCR kandang layer Anda hari ini!
                </h3>
              </div>

              <button 
                onClick={() => { window.location.href = '/login'; }}
                className="inline-flex items-center justify-center gap-2 w-full py-4 bg-[#2C1E11] hover:bg-[#1E140B] text-[#FF9F1C] hover:text-white text-sm font-bold rounded-full transition-all shadow-md active:scale-98 duration-200 cursor-pointer mt-6 relative z-10"
              >
                Mulai Sekarang
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </section>

        {/* ── SECTION 2: INFINITE AUTOMATIC SCROLLING MARQUEES (Row by Row) ── */}
        <section className="bg-eggshell py-16 overflow-hidden border-t border-[#2C1E11]/10 relative">
          
          {/* Symmetrical desaturated backdrop map overlay */}
          <div className="absolute inset-0 z-0 bg-[#FDFBF7]">
            <img 
              src="/assets/bg_1.webp" 
              alt="Testimonials backdrop" 
              className="h-full w-full object-cover object-center opacity-10 pointer-events-none select-none mix-blend-multiply" 
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C1E11] uppercase tracking-tight font-sans">
              Testimoni Mengalir Otomatis
            </h2>
            <div className="h-1 w-16 bg-[#FF9F1C] mx-auto mt-4" />
          </div>

          {/* Scrolling Marquees Wrapper */}
          <div className="relative z-10 space-y-8 mt-12 w-full">
            
            {/* ROW 1: RIGHT TO LEFT SCROLL */}
            <div className="flex w-full overflow-hidden select-none">
              <div className="flex w-max gap-6 animate-marquee-left hover:[animation-play-state:paused]">
                {/* Original set */}
                {marqueeRow1.map((item, i) => (
                  <div 
                    key={`row1-orig-${i}`}
                    className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 w-[350px] sm:w-[400px] flex flex-col justify-between shrink-0 relative text-left"
                  >
                    <Quote className="w-12 h-12 text-[#FF9F1C]/15 absolute top-6 right-6" />
                    <div>
                      <div className="flex gap-1 mb-5 text-[#FF9F1C]">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star key={starIdx} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-[#3E2723]/95 text-[14px] leading-relaxed mb-6 italic">
                        "{item.content}"
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="font-black text-[#2C1E11] text-base">{item.name}</h4>
                      <p className="text-xs text-[#FF9F1C] font-bold mt-0.5">{item.role}</p>
                    </div>
                  </div>
                ))}
                {/* Duplicated set for seamless wrapping */}
                {marqueeRow1.map((item, i) => (
                  <div 
                    key={`row1-dup-${i}`}
                    className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 w-[350px] sm:w-[400px] flex flex-col justify-between shrink-0 relative text-left"
                  >
                    <Quote className="w-12 h-12 text-[#FF9F1C]/15 absolute top-6 right-6" />
                    <div>
                      <div className="flex gap-1 mb-5 text-[#FF9F1C]">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star key={starIdx} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-[#3E2723]/95 text-[14px] leading-relaxed mb-6 italic">
                        "{item.content}"
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="font-black text-[#2C1E11] text-base">{item.name}</h4>
                      <p className="text-xs text-[#FF9F1C] font-bold mt-0.5">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROW 2: LEFT TO RIGHT SCROLL */}
            <div className="flex w-full overflow-hidden select-none">
              <div className="flex w-max gap-6 animate-marquee-right hover:[animation-play-state:paused]">
                {/* Original set */}
                {marqueeRow2.map((item, i) => (
                  <div 
                    key={`row2-orig-${i}`}
                    className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 w-[350px] sm:w-[400px] flex flex-col justify-between shrink-0 relative text-left"
                  >
                    <Quote className="w-12 h-12 text-[#FF9F1C]/15 absolute top-6 right-6" />
                    <div>
                      <div className="flex gap-1 mb-5 text-[#FF9F1C]">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star key={starIdx} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-[#3E2723]/95 text-[14px] leading-relaxed mb-6 italic">
                        "{item.content}"
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="font-black text-[#2C1E11] text-base">{item.name}</h4>
                      <p className="text-xs text-[#FF9F1C] font-bold mt-0.5">{item.role}</p>
                    </div>
                  </div>
                ))}
                {/* Duplicated set for seamless wrapping */}
                {marqueeRow2.map((item, i) => (
                  <div 
                    key={`row2-dup-${i}`}
                    className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 w-[350px] sm:w-[400px] flex flex-col justify-between shrink-0 relative text-left"
                  >
                    <Quote className="w-12 h-12 text-[#FF9F1C]/15 absolute top-6 right-6" />
                    <div>
                      <div className="flex gap-1 mb-5 text-[#FF9F1C]">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star key={starIdx} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-[#3E2723]/95 text-[14px] leading-relaxed mb-6 italic">
                        "{item.content}"
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="font-black text-[#2C1E11] text-base">{item.name}</h4>
                      <p className="text-xs text-[#FF9F1C] font-bold mt-0.5">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom styling description */}
          <p className="text-earth-light/50 text-[11px] italic leading-relaxed text-center mt-12 block relative z-10">
            *Sorot kartu untuk menghentikan guliran otomatis dan membaca testimoni lebih saksama.
          </p>

        </section>

      </main>

      <Footer />
    </div>
  );
}
