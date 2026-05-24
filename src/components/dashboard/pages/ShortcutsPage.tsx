import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  Terminal,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Cpu,
  Keyboard,
  Info,
  Layers,
  HelpCircle,
  Copy,
  Zap,
} from 'lucide-react';

interface ShortcutItem {
  code: string;
  metric: string;
  type: 'Wajib' | 'Opsional';
  example: string;
  desc: string;
  dbField: string;
}

const SHORTCUT_ITEMS: ShortcutItem[] = [
  { code: 'TL', metric: 'Produksi Telur Utuh', type: 'Wajib', example: 'TL 5000', desc: 'Jumlah telur utuh yang dikumpulkan hari ini (butir).', dbField: 'eggs_qty_pcs (telurButir)' },
  { code: 'TR', metric: 'Telur Rusak / BS', type: 'Opsional', example: 'TR 4', desc: 'Jumlah telur pecah, retak, atau cangkang tipis (butir).', dbField: 'eggs_damaged_pcs (telurBS)' },
  { code: 'TB', metric: 'Total Berat Telur', type: 'Wajib', example: 'TB 270', desc: 'Total timbangan seluruh telur yang dipanen (kg).', dbField: 'eggs_weight_kg (telurBeratKg)' },
  { code: 'PK', metric: 'Konsumsi Pakan', type: 'Wajib', example: 'PK 480', desc: 'Total pakan yang dituangkan/diberikan ke ayam hari ini (kg).', dbField: 'feed_consumed_kg (pakanKeluarKg)' },
  { code: 'PS', metric: 'Sisa Pakan Gudang', type: 'Opsional', example: 'PS 15', desc: 'Sisa stok pakan konsentrat yang berada di gudang penyimpanan (kg).', dbField: 'feed_remaining_kg (pakanSisaKg)' },
  { code: 'AM', metric: 'Mortalitas / Ayam Mati', type: 'Wajib', example: 'AM 2', desc: 'Jumlah ayam mati atau diafkir hari ini (ekor).', dbField: 'mortality_count (ayamMati)' },
  { code: 'SH', metric: 'Suhu Siang Hari', type: 'Wajib', example: 'SH 30.5', desc: 'Suhu udara maksimal di dalam kandang pada siang hari (°C).', dbField: 'temp_afternoon_c (suhuSiang)' },
  { code: 'FC', metric: 'Kondisi Feces / Kotoran', type: 'Wajib', example: 'FC normal', desc: 'Status kebasahan kotoran ayam: ketik "normal" atau "basah".', dbField: 'feces_condition (fecesKondisi)' },
  { code: 'VT', metric: 'Vitamin / Vaksin / Obat', type: 'Opsional', example: 'VT VitaStress', desc: 'Merek atau dosis vitamin, vaksin, atau disinfektan yang diberikan.', dbField: 'vitamin_dose_time (vitaminDosisTime)' },
  { code: 'AB', metric: 'Jam Ambil / Bersih', type: 'Opsional', example: 'AB 09:00', desc: 'Catatan waktu pengambilan telur atau pengerjaan sapu kandang.', dbField: 'egg_collection_time (ambilTelurJam)' },
];

const PRESETS = [
  {
    label: 'Format Log Lengkap Harian',
    text: 'TL 4850; TR 2; TB 300; PK 480; PS 12; AM 1; SH 30.2; FC normal; VT VitaStress; AB 09:00',
    icon: '✨',
  },
  {
    label: 'Hanya Telur & Pakan',
    text: 'TL 4300; TB 268; PK 485',
    icon: '🥚',
  },
  {
    label: 'Kesehatan & Suhu',
    text: 'AM 3; SH 31.5; FC basah; VT Medivac',
    icon: '🌡️',
  },
];

export default function ShortcutsPage() {
  const [inputText, setInputValue] = useState(
    'TL 4850; TR 2; TB 300; PK 480; PS 12; AM 1; SH 30.2; FC normal; VT VitaStress; AB 09:00'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Berhasil menyalin kode: "${text}"`);
  };

  // Real-time Parser Logic
  const parsedData = useMemo(() => {
    const lowerInput = inputText.toLowerCase();
    const result: Record<string, any> = {};

    // 1. Telur Butir
    const tlMatch = lowerInput.match(/tl\s*(\d+(\.\d+)?)/);
    if (tlMatch) result.telurButir = parseInt(tlMatch[1], 10);

    // 2. Telur BS
    const trMatch = lowerInput.match(/tr\s*(\d+(\.\d+)?)/);
    if (trMatch) result.telurBS = parseInt(trMatch[1], 10);

    // 3. Telur Berat
    const tbMatch = lowerInput.match(/tb\s*(\d+(\.\d+)?)/);
    if (tbMatch) result.telurBeratKg = parseFloat(tbMatch[1]);

    // 4. Pakan Keluar
    const pkMatch = lowerInput.match(/pk\s*(\d+(\.\d+)?)/);
    if (pkMatch) {
      result.pakanKeluarKg = parseFloat(pkMatch[1]);
      result.pakanKeluarSak = Number((result.pakanKeluarKg / 50).toFixed(1));
    }

    // 5. Pakan Sisa
    const psMatch = lowerInput.match(/ps\s*(\d+(\.\d+)?)/);
    if (psMatch) result.pakanSisaKg = parseFloat(psMatch[1]);

    // 6. Ayam Mati
    const amMatch = lowerInput.match(/am\s*(\d+(\.\d+)?)/);
    if (amMatch) result.ayamMati = parseInt(amMatch[1], 10);

    // 7. Suhu Siang
    const shMatch = lowerInput.match(/sh\s*(\d+(\.\d+)?)/);
    if (shMatch) result.suhuSiang = parseFloat(shMatch[1]);

    // 8. Feces
    const fcMatch = lowerInput.match(/fc\s*(normal|basah)/);
    if (fcMatch) {
      result.fecesKondisi = fcMatch[1] === 'basah' ? 'Basah' : 'Normal';
    }

    // 9. Vitamin / Vaksin
    const vtMatch = lowerInput.match(/vt\s*([^;]+)/);
    if (vtMatch) result.vitaminDosisTime = vtMatch[1].trim();

    // 10. Ambil Jam
    const abMatch = lowerInput.match(/ab\s*([^;]+)/);
    if (abMatch) result.ambilTelurJam = abMatch[1].trim();

    // FCR Instant Calculation
    if (result.pakanKeluarKg && result.telurBeratKg) {
      result.fcrEstimasi = Number((result.pakanKeluarKg / result.telurBeratKg).toFixed(2));
    }

    return result;
  }, [inputText]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 text-sm text-white shadow-2xl border border-white/10"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden rounded-3xl border border-primary-gold/15 bg-gradient-to-br from-amber-500/10 via-white to-orange-500/5 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-gold/10 px-3 py-1 text-xs font-bold text-primary-gold uppercase tracking-wider">
              <Cpu className="h-3.5 w-3.5" />
              Sistem parsing log otomatis
            </div>
            <h2 className="text-xl font-extrabold text-warm-earth md:text-3xl">Pusat Dokumentasi Shortcut AI</h2>
            <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
              Gunakan sintaksis kode singkat di bawah untuk mempercepat pencatatan harian kandang ayam Anda.
              Cukup ketik rangkaian kode singkat ini langsung di dalam <strong className="font-extrabold text-primary-gold">Chat AI Agent</strong>, dan sistem kami akan otomatis mem-parsing dan mencatatnya ke dalam database dalam 1 detik!
            </p>
          </div>
          <div className="shrink-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-gold/10 text-primary-gold shadow-md">
            <BookOpen className="h-7 w-7" />
          </div>
        </div>
        {/* Background glow styling */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-gold/5 rounded-full blur-3xl -mr-16 -mt-16" />
      </div>

      {/* ── ALUR CARA KERJA CEPAT ── */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3 Langkah Cepat Mencatat Laporan</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              step: '1',
              title: 'Ingat Kode Singkat',
              desc: 'Gunakan inisial kode kamus, misalnya: TL untuk Telur, PK untuk Pakan, dan AM untuk Ayam Mati.',
              icon: Keyboard,
              color: 'bg-primary-gold/10 text-primary-gold',
            },
            {
              step: '2',
              title: 'Ketik di Obrolan AI',
              desc: 'Kirim kode terpisah dengan titik koma (;), contoh: "TL 5000; PK 480; AM 1; SH 30".',
              icon: Terminal,
              color: 'bg-indigo-50 text-indigo-600',
            },
            {
              step: '3',
              title: 'Log Tercatat Otomatis',
              desc: 'Sistem AI mengekstrak data secara instan dan memperbarui spreadsheet serta grafik dashboard Anda.',
              icon: ClipboardList,
              color: 'bg-emerald-50 text-emerald-600',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-sm ${item.color}`}>
                    {item.step}
                  </span>
                  <Icon className="h-5 w-5 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-warm-earth uppercase tracking-wider">{item.title}</h4>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── DUA KOLOM: KAMUS & PLAYGROUND ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Kolom Kiri: Kamus Kode Lengkap (API Doc Style) */}
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-xs font-bold text-warm-earth uppercase tracking-wider">Kamus Lengkap Kode Shortcut AI</h4>
              <p className="text-[10px] text-slate-400">Seluruh parameter log yang didukung oleh sistem parser AI.</p>
            </div>
            <span className="text-[10px] bg-slate-50 font-bold border border-slate-200 text-slate-500 rounded-full px-2.5 py-1">
              {SHORTCUT_ITEMS.length} Kode Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto scrollbar-thin dashboard-scroll rounded-2xl border border-slate-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 text-center">Kode</th>
                  <th className="px-4 py-3">Variabel Log</th>
                  <th className="px-4 py-3 text-center">Tipe</th>
                  <th className="px-4 py-3">Contoh Ngetik</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {SHORTCUT_ITEMS.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block font-mono font-black text-xs text-primary-gold bg-primary-gold/10 border border-primary-gold/10 px-2.5 py-1 rounded-xl">
                        {item.code}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-warm-earth">{item.metric}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.dbField}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        item.type === 'Wajib' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <code className="bg-slate-100 border border-slate-200 text-rose-600 rounded px-1.5 py-0.5 text-[11px] font-mono whitespace-nowrap">
                        {item.example}
                      </code>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleCopy(item.example)}
                        className="p-1 rounded-lg text-slate-300 hover:text-primary-gold hover:bg-primary-gold/5 transition-all cursor-pointer"
                        title="Salin contoh kode"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan: Playground Interaktif / Live JSON Parser */}
        <div className="lg:col-span-5 space-y-6">
          {/* Playground Playground Card */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h4 className="text-xs font-bold text-warm-earth uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-primary-gold" />
                Playground & Uji Coba Shortcut
              </h4>
              <p className="text-[10px] text-slate-400">Simulasikan cara peternak mengetik di chat dan lihat parsing data AI secara live.</p>
            </div>

            {/* Template Buttons */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gunakan Template Contoh:</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputValue(p.text);
                      showToast(`Memuat template: "${p.label}"`);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-50 border border-slate-200/50 hover:bg-slate-100 hover:text-primary-gold px-3 py-2 text-[10.5px] font-bold text-slate-600 cursor-pointer transition-colors"
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input Box */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ketik Kode Shortcut Anda:</p>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Contoh: TL 5000; TB 310; PK 480..."
                  className="w-full pl-3.5 pr-10 py-3 bg-slate-50 focus:bg-white border-2 border-slate-200/60 focus:border-primary-gold/60 focus:ring-4 focus:ring-primary-gold/10 rounded-2xl text-xs font-mono text-slate-800 focus:outline-none transition-all"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400">
                  <Zap className="h-4 w-4 text-primary-gold animate-pulse" />
                </div>
              </div>
            </div>

            {/* Live Parsing Output: Structured Preview Card */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Visualisasi Hasil Log Kandang:</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Produksi Telur</p>
                  <p className="text-base font-extrabold text-slate-700 mt-1">
                    {parsedData.telurButir ? `${parsedData.telurButir.toLocaleString('id-ID')} butir` : '-'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {parsedData.telurBeratKg ? `Berat: ${parsedData.telurBeratKg} kg` : ''}
                    {parsedData.telurBS ? ` (BS: ${parsedData.telurBS})` : ''}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Konsumsi Pakan</p>
                  <p className="text-base font-extrabold text-slate-700 mt-1">
                    {parsedData.pakanKeluarKg ? `${parsedData.pakanKeluarKg} kg` : '-'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {parsedData.pakanKeluarSak ? `Estimasi: ${parsedData.pakanKeluarSak} sak` : ''}
                    {parsedData.pakanSisaKg ? ` (Sisa: ${parsedData.pakanSisaKg} kg)` : ''}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">FCR & Mortalitas</p>
                  <p className="text-base font-extrabold text-slate-700 mt-1">
                    FCR: {parsedData.fcrEstimasi ? `${parsedData.fcrEstimasi}` : '-'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {parsedData.ayamMati !== undefined ? `Kematian: ${parsedData.ayamMati} ekor` : ''}
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Iklim & Feces</p>
                  <p className="text-base font-extrabold text-slate-700 mt-1">
                    Suhu: {parsedData.suhuSiang ? `${parsedData.suhuSiang}°C` : '-'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {parsedData.fecesKondisi ? `Feces: ${parsedData.fecesKondisi}` : ''}
                  </p>
                </div>
              </div>

              {/* Extra Info (Vitamin & Jam Ambil) */}
              {(parsedData.vitaminDosisTime || parsedData.ambilTelurJam) && (
                <div className="bg-primary-gold/5 border border-primary-gold/15 p-3 rounded-2xl space-y-1">
                  {parsedData.vitaminDosisTime && (
                    <p className="text-[11px] text-slate-700 font-medium">
                      🧪 <strong className="font-extrabold text-primary-gold">Vitamin/Vaksin</strong>: {parsedData.vitaminDosisTime}
                    </p>
                  )}
                  {parsedData.ambilTelurJam && (
                    <p className="text-[11px] text-slate-700 font-medium">
                      ⏰ <strong className="font-extrabold text-primary-gold">Waktu Operasional</strong>: Jam {parsedData.ambilTelurJam}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* JSON Code Block Viewer */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">JSON Output yang Ter-ekstrak:</p>
                <button
                  onClick={() => handleCopy(JSON.stringify(parsedData, null, 2))}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-primary-gold transition-colors cursor-pointer"
                  title="Salin JSON"
                >
                  <Copy className="h-3 w-3" />
                  <span>Salin JSON</span>
                </button>
              </div>
              <pre className="overflow-x-auto text-[10.5px] font-mono text-slate-600 bg-slate-900 rounded-2xl p-4 border border-white/5 shadow-inner leading-relaxed">
                {JSON.stringify(parsedData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* ── TIPS & TRIK SECTION ── */}
      <div className="rounded-3xl border border-primary-gold/20 bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-5 shadow-sm">
        <div className="flex gap-3 items-start">
          <Info className="h-5 w-5 text-primary-gold shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-warm-earth uppercase tracking-wider">Tips & Trik Menulis Shortcut</h4>
            <p className="text-[11.5px] text-slate-500 leading-relaxed font-medium">
              Gunakan tanda <strong className="font-extrabold text-primary-gold">titik koma ( ; )</strong> untuk memisahkan antar kode yang berbeda. Urutan kode penulisan Anda adalah <strong className="font-extrabold text-primary-gold">BEBAS</strong> (misal: PK 480 dulu baru TL 5000, atau sebaliknya). 
              Sistem parser AI Agent SmartPoultry kami cukup cerdas untuk mengekstrak dan membedakan masing-masing parameter secara otomatis tanpa ada resiko tertukar data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
