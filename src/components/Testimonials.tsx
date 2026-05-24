import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
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

  return (
    <section id="testimoni" className="relative overflow-hidden bg-eggshell py-24">
      
      {/* Background Backdrop (bg_1) blended seamlessly with matching desaturated bg-eggshell */}
      <div className="absolute inset-0 z-0 bg-eggshell">
        <img 
          src="/assets/bg_1.webp" 
          alt="Testimonials backdrop" 
          className="h-full w-full object-cover object-center opacity-20 pointer-events-none select-none mix-blend-multiply" 
        />
        {/* Soft radial overlay to smoothly transition the background with adjacent sections */}
        <div className="absolute inset-0 bg-gradient-to-r from-eggshell/40 via-transparent to-eggshell/40"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-warm-earth mb-16">
          Apa kata peternak yang sudah coba?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-3xl p-10 shadow-lg shadow-warm-earth/5 relative border border-warm-earth/5"
            >
              <Quote className="w-16 h-16 text-yolk-accent/30 absolute top-8 right-8" />
              <div className="flex gap-1 mb-6 text-primary-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-earth-light text-lg mb-8 relative z-10 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              <div>
                <h4 className="font-bold text-warm-earth text-lg">{testimonial.name}</h4>
                <p className="text-sm text-terracotta">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
