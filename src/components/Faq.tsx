import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default function Faq() {
  const [activeId, setActiveId] = useState<number | null>(1);

  const faqs: FaqItem[] = [
    {
      id: 1,
      question: 'Apa itu SmartPoultry?',
      answer: 'SmartPoultry adalah platform AI untuk peternak layer yang mengubah chat Telegram menjadi log otomatis, dashboard produksi, dan bantuan diagnosa awal.'
    },
    {
      id: 2,
      question: 'Siapa yang bisa pakai?',
      answer: 'Peternak ayam petelur, mandor kandang, dan pemilik usaha yang ingin pencatatan harian lebih rapi tanpa harus paham sistem yang rumit.'
    },
    {
      id: 3,
      question: 'Bagaimana cara mulai?',
      answer: 'Hubungkan bot Telegram, kirim laporan harian seperti pakan dan telur, lalu lihat hasilnya masuk ke dashboard secara otomatis.'
    },
    {
      id: 4,
      question: 'Apakah bisa deteksi masalah kesehatan?',
      answer: 'Bisa. Peternak dapat mengunggah foto ayam atau kotoran ayam untuk mendapat analisis awal dan saran tindak lanjut.'
    },
    {
      id: 5,
      question: 'Apakah data aman?',
      answer: 'Data dirancang untuk disimpan terstruktur di backend sehingga lebih aman daripada pencatatan manual yang tercecer di chat.'
    }
  ];

  return (
    <section id="faq" className="relative overflow-hidden bg-soft-beige py-24 sm:py-32 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="block text-terracotta font-bold tracking-widest text-xs uppercase mb-3">
            Pertanyaan umum
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#112211] tracking-tight leading-tight font-sans">
            Yang paling sering ditanyakan peternak
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4">
            {faqs.map((faq) => {
              const isOpen = activeId === faq.id;
              return (
                <div 
                  key={faq.id}
                  className={`rounded-2xl transition-all duration-300 border-2 overflow-hidden
                    ${isOpen 
                      ? 'bg-eggshell/95 border-primary-gold shadow-lg shadow-primary-gold/10' 
                      : 'bg-white border-warm-earth/5 hover:border-warm-earth/15 hover:shadow-md'
                    }
                  `}
                >
                  <button
                    onClick={() => setActiveId(isOpen ? null : faq.id)}
                    className="w-full flex justify-between items-center p-6 text-left cursor-pointer focus:outline-none"
                  >
                    <span className="font-extrabold text-[16px] md:text-lg text-warm-earth font-sans leading-snug">
                      {faq.question}
                    </span>
                    <div className={`p-1 rounded-full bg-warm-earth/5 text-warm-earth transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-1 border-t border-warm-earth/5">
                          <p className="text-earth-light/85 text-[15px] leading-relaxed font-semibold">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-87.5 sm:h-112.5 lg:h-150 rounded-4xl overflow-hidden shadow-2xl group"
          >
            <div className="absolute inset-0 bg-[#1c130c]/5 z-10"></div>
            <img 
              src="/assets/hero2_compressed.webp" 
              alt="SmartPoultry dashboard preview" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 select-none pointer-events-none"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
