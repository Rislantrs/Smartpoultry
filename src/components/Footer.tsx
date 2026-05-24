import { ArrowUp, ArrowRight, Mail, Headphones, Send, Facebook, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="kontak" className="relative overflow-hidden bg-[#1c130c] text-eggshell select-none">
      {/* Background overlay image with dark blend */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/section_cr.webp"
          alt="SmartPoultry footer background"
          className="w-full h-full object-cover object-center opacity-20 mix-blend-overlay"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/hero1_compressed.webp'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c130c]/40 via-[#1c130c]/70 to-[#120b06]/95 pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6">
        {/* Top Row: Newsletter, Contact Info, and Golden Rooster */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-white/10 pb-8 mb-10">
          
          {/* Left: Newsletter card (deep warm brown & gold accents, NO green) */}
          <div className="lg:col-span-4 z-20 -mt-10 lg:-mt-16">
            <div className="bg-[#241910] text-white rounded-3xl p-5 lg:p-6 shadow-2xl relative overflow-hidden border border-[#FF9F1C]/15">
              {/* Decorative background envelope */}
              <div className="absolute right-0 top-0 opacity-[0.03] translate-x-4 -translate-y-4 pointer-events-none">
                <Mail className="w-28 h-28 text-white" />
              </div>

              {/* Envelope Outline Box */}
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                <Mail className="w-4 h-4 text-[#FF9F1C]" />
              </div>

              <h3 className="text-sm lg:text-base font-extrabold mb-1.5 leading-tight uppercase tracking-tight">
                Sign Up To Our
                <br />Newsletters
              </h3>

              <p className="text-white/60 text-[10px] mb-3 max-w-xs leading-relaxed">
                Subscribe to our Newsletter & Event right now to be updated
              </p>

              <form className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Email address*"
                  className="w-full bg-[#1c130c] text-white placeholder:text-slate-500 px-3 py-2 rounded-full focus:outline-none text-[10px] font-semibold border border-white/5 focus:ring-1 focus:ring-[#FF9F1C]"
                  required
                />
                <button 
                  type="submit" 
                  className="w-full bg-[#FF9F1C] hover:bg-[#e08b14] active:scale-95 transition-all text-[#1c130c] font-black px-3 py-2 rounded-full shadow-lg flex items-center justify-center gap-1 cursor-pointer text-[10px] uppercase tracking-wider"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>
            </div>
          </div>

          {/* Middle: Side-by-side Contact info (protected against wrapping) */}
          <div className="lg:col-span-6 flex items-center pt-4 lg:pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 w-full">
              
              {/* Email Block */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FF9F1C] shrink-0">
                  <Send className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-[#FF9F1C] font-black uppercase tracking-widest">General enquiries</div>
                  <a 
                    href="mailto:support@smartpoultry.com" 
                    className="block text-xs font-black text-white hover:text-[#FF9F1C] transition-colors mt-0.5 whitespace-nowrap"
                  >
                    support@smartpoultry.com
                  </a>
                </div>
              </div>

              {/* Phone Block */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#FF9F1C] shrink-0">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] text-[#FF9F1C] font-black uppercase tracking-widest">Give us a call</div>
                  <a 
                    href="tel:+62812XXXXxxxx" 
                    className="block text-xs font-black text-white hover:text-[#FF9F1C] transition-colors mt-0.5 whitespace-nowrap"
                  >
                    +62 812-XXXX-XXXX
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Golden Rooster image overlapping nicely */}
          <div className="lg:col-span-2 hidden lg:flex items-end justify-end -mt-10 lg:-mt-16 self-end">
            <img 
              src="/assets/about.png" 
              alt="Golden Rooster Logo" 
              className="w-auto h-40 object-contain pointer-events-none select-none drop-shadow-2xl" 
            />
          </div>

        </div>

        {/* Middle Row: Links and Brand info (with smaller elegant font sizing) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-10">
          
          {/* Column 1: Useful Links */}
          <div className="lg:col-span-3 text-left">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Useful Links
            </h4>
            <ul className="space-y-2.5 text-eggshell/70 text-xs font-bold font-sans">
              <li><a href="/#tentang" className="hover:text-[#FF9F1C] transition-colors">About Us</a></li>
              <li><a href="/#fitur" className="hover:text-[#FF9F1C] transition-colors">Why Choose Us</a></li>
              <li><a href="/#proses" className="hover:text-[#FF9F1C] transition-colors">Meet Our Team</a></li>
              <li><a href="/#kontak" className="hover:text-[#FF9F1C] transition-colors">Contact Us</a></li>
              <li><a href="/#faq" className="hover:text-[#FF9F1C] transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Column 2: Explore */}
          <div className="lg:col-span-3 text-left">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              Explore
            </h4>
            <ul className="space-y-2.5 text-eggshell/70 text-xs font-bold font-sans">
              <li><a href="/layanan" className="hover:text-[#FF9F1C] transition-colors">What We Offer</a></li>
              <li><a href="/#proses" className="hover:text-[#FF9F1C] transition-colors">Latest News</a></li>
              <li><a href="/#testimoni" className="hover:text-[#FF9F1C] transition-colors">Project</a></li>
              <li><a href="/#kontak" className="hover:text-[#FF9F1C] transition-colors">Terms & Condition</a></li>
              <li><a href="/#faq" className="hover:text-[#FF9F1C] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Column 3: Brand Description and minimal Socials */}
          <div className="lg:col-span-6 text-left">
            <div className="mb-4 flex items-center gap-3">
              <img 
                src="/assets/logo.png" 
                alt="SmartPoultry logo" 
                className="h-10 w-10 rounded-full object-cover shadow-lg ring-1 ring-white/10" 
              />
              <div>
                <span className="block text-[8px] font-bold uppercase tracking-[0.3em] text-[#FF9F1C]">SmartPoultry AI</span>
                <span className="block text-xl font-black tracking-tight text-white leading-none mt-0.5">
                  Peternak<span className="text-[#FF9F1C]">Cerdas</span>
                </span>
              </div>
            </div>

            <p className="text-eggshell/65 text-xs leading-relaxed mb-6 font-semibold max-w-md">
              We carry out our mission based on the values of impeccable business reputation, social responsibility, respect for human dignity and synergetic and result-oriented partnerships.
            </p>

            {/* Social media icons exactly like the mockup */}
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FF9F1C] hover:text-[#1c130c] transition-all flex items-center justify-center border border-white/10 text-white" 
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FF9F1C] hover:text-[#1c130c] transition-all flex items-center justify-center border border-white/10 text-white" 
                aria-label="X (formerly Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FF9F1C] hover:text-[#1c130c] transition-all flex items-center justify-center border border-white/10 text-white" 
                aria-label="Linkedin"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FF9F1C] hover:text-[#1c130c] transition-all flex items-center justify-center border border-white/10 text-white" 
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

        {/* Lower Banner Bottom Copyright bar centered */}
        <div className="pt-6 border-t border-white/5 flex flex-col justify-center items-center gap-3 relative">
          
          <p className="text-eggshell/40 text-[10px] font-bold tracking-wider font-sans text-center uppercase">
            © Copyright 2026 <span className="text-[#FF9F1C]">SmartPoultry</span>. All Rights Reserved.
          </p>

          <div className="absolute right-0 bottom-2">
            <button 
              onClick={scrollToTop}
              className="bg-black/60 text-white p-2.5 rounded-full hover:bg-[#FF9F1C] hover:text-[#1c130c] transition-all duration-300 shadow-2xl relative z-30 cursor-pointer border border-white/5"
              aria-label="Back to Top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </footer>
  );
}



