import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Camera,
  Upload,
  HeartPulse,
  Sliders,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  FileText,
  Activity,
  Plus,
  X,
  Stethoscope,
  Info,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface DiseaseDiagnosis {
  nama: string;
  keyakinan: number;
  deskripsi: string;
  gejala: string[];
  karantina: string[];
  obat: string[];
  tingkatBahaya: 'Tinggi' | 'Sedang' | 'Rendah';
  modelUsed?: string;
  providerUsed?: string;
}

const formatMedicineItem = (item: unknown): string => {
  if (typeof item === 'string') {
    return item;
  }

  if (item && typeof item === 'object') {
    const medicine = item as { nama?: unknown; fungsi?: unknown; dosis?: unknown };
    const nama = typeof medicine.nama === 'string' ? medicine.nama : '';
    const fungsi = typeof medicine.fungsi === 'string' ? medicine.fungsi : '';
    const dosis = typeof medicine.dosis === 'string' ? medicine.dosis : '';

    const parts = [nama, fungsi && `Fungsi: ${fungsi}`, dosis && `Dosis: ${dosis}`].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' - ');
    }
  }

  return 'Rekomendasi tidak tersedia';
};

const penyakitMock: Record<string, DiseaseDiagnosis> = {
  ND: {
    nama: 'Newcastle Disease (ND / Tetelo)',
    keyakinan: 89,
    deskripsi: 'Penyakit virus yang sangat menular menyerang sistem pernapasan, saraf, dan pencernaan unggas. Dapat menyebabkan tingkat kematian hingga 100% pada kawanan yang tidak divaksinasi.',
    gejala: ['Nafas sesak & ngorok', 'Kaki lumpuh atau sayap lunglai', 'Kepala berputar (tortikolis)', 'Diare encer berwarna hijau'],
    karantina: [
      'Pisahkan ayam sakit ke kandang isolasi khusus minimal 50 meter dari kandang utama.',
      'Lakukan desinfeksi menyeluruh pada kandang, tempat pakan, dan peralatan menggunakan desinfektan virus.',
      'Perketat biosekuriti pintu masuk farm (semprot alas kaki & cuci tangan).',
    ],
    obat: [
      'ND adalah virus, tidak ada obat khusus. Berikan terapi suportif berupa multivitamin dosis tinggi untuk mendongkrak daya tahan tubuh ayam yang sehat.',
      'Segera lakukan vaksinasi darurat (Emergency Vaccination) untuk ayam yang masih terlihat sehat menggunakan vaksin ND aktif.',
    ],
    tingkatBahaya: 'Tinggi',
  },
  Coryza: {
    nama: 'Infectious Coryza (Snot / Pilek Ayam)',
    keyakinan: 92,
    deskripsi: 'Penyakit pernapasan akut pada ayam yang disebabkan oleh bakteri *Avibacterium paragallinarum*. Menular cepat namun tingkat kematian relatif rendah jika ditangani cepat.',
    gejala: ['Muka bengkak (terutama sekitar mata)', 'Keluar lendir kental berbau busuk dari hidung', 'Mata berair dan menutup', 'Nafsu makan anjlok'],
    karantina: [
      'Karantina seluruh ayam bergejala muka bengkak ke sekat tersendiri.',
      'Pastikan sirkulasi udara kandang berjalan lancar untuk mengurangi kadar amonia yang memperparah pernapasan.',
      'Kosongkan wadah air minum secara berkala dan cuci bersih untuk memutus jalur penularan bakteri.',
    ],
    obat: [
      'Berikan antibiotik spektrum luas yang larut air (seperti Amoxicillin, Ciprofloxacin, atau Erythromycin) selama 3-5 hari berturut-turut.',
      'Campurkan vitamin pernapasan untuk melancarkan lendir hidung.',
    ],
    tingkatBahaya: 'Sedang',
  },
  Coccidiosis: {
    nama: 'Koksidiosis (Berak Darah)',
    keyakinan: 85,
    deskripsi: 'Penyakit parasit saluran pencernaan yang disebabkan oleh protozoa genus *Eimeria*. Merusak dinding usus ayam, mengganggu penyerapan pakan, dan memicu anemia parah.',
    gejala: ['Feses/kotoran berwarna coklat kemerahan atau berdarah', 'Ayam terlihat lesu, mengantuk, dan bulu berdiri', 'Sayap menggantung lemas', 'FCR membengkak tajam'],
    karantina: [
      'Segera ganti sekam/litter kandang yang basah atau lembab, karena kelembaban tinggi mempercepat siklus parasit.',
      'Jaga agar kotoran tidak bercampur dengan wadah pakan.',
    ],
    obat: [
      'Berikan koksidiostat (anti-koksidia) seperti Toltrazuril atau Amprolium ke dalam air minum selama 3 hari.',
      'Tambahkan vitamin K3 untuk menghentikan pendarahan di dalam usus ayam.',
    ],
    tingkatBahaya: 'Tinggi',
  },
};

function parseMarkdownOrText(text: string, selectedSymptoms: string[]): DiseaseDiagnosis {
  const result: DiseaseDiagnosis = {
    nama: 'Diagnosis AI',
    keyakinan: 85,
    deskripsi: '',
    gejala: [],
    karantina: [],
    obat: [],
    tingkatBahaya: 'Sedang'
  };

  const lowerInput = text.toLowerCase();

  // 1. Try to find the title/nama
  const namaMatch = text.match(/(?:Nama Penyakit|Penyakit|Diagnosis|Disease):\s*([^\n]+)/i) || 
                    text.match(/###\s*([^\n]+)/) ||
                    text.match(/\*\*([^\*]+)\*\*/);
  if (namaMatch) {
    result.nama = namaMatch[1].replace(/[\*#]/g, '').trim();
  } else {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      result.nama = lines[0].replace(/[\*#]/g, '').trim();
    }
  }

  // 2. Try to find confidence level (keyakinan)
  const keyakinanMatch = text.match(/(?:Keyakinan|Confidence|Akurasi|Probabilitas|Persentase):\s*(\d+)/i) || 
                         text.match(/(\d+)\s*%/);
  if (keyakinanMatch) {
    result.keyakinan = Math.min(100, Math.max(1, parseInt(keyakinanMatch[1], 10)));
  }

  // 3. Try to find danger level (tingkat bahaya)
  if (/tingkat\s*bahaya:\s*tinggi|bahaya:\s*tinggi|danger:\s*high/i.test(lowerInput)) {
    result.tingkatBahaya = 'Tinggi';
  } else if (/tingkat\s*bahaya:\s*rendah|bahaya:\s*rendah|danger:\s*low/i.test(lowerInput)) {
    result.tingkatBahaya = 'Rendah';
  } else {
    result.tingkatBahaya = 'Sedang';
  }

  // Helper to extract list items under headings
  const extractList = (sectionKeywords: string[]): string[] => {
    const regex = new RegExp(`(?:##|###|\\*\\*)\\s*(?:${sectionKeywords.join('|')})[^\\n]*\\n([\\s\\S]*?)(?:\\n\\s*(?:##|###|\\*\\*)|$)`, 'i');
    const match = text.match(regex);
    let sectionText = match ? match[1] : '';

    if (!sectionText) {
      const lines = text.split('\n');
      let inSection = false;
      const collected: string[] = [];
      for (const line of lines) {
        const clean = line.trim();
        if (clean.startsWith('#') || clean.startsWith('**')) {
          if (new RegExp(sectionKeywords.join('|'), 'i').test(clean)) {
            inSection = true;
            continue;
          } else {
            inSection = false;
          }
        }
        if (inSection && (clean.startsWith('-') || clean.startsWith('*') || /^\d+\./.test(clean))) {
          collected.push(clean.replace(/^[-*\d\.\s]+/, '').trim());
        }
      }
      if (collected.length > 0) return collected;
    }

    if (sectionText) {
      const items: string[] = [];
      const lines = sectionText.split('\n');
      for (const line of lines) {
        const clean = line.trim();
        if (clean.startsWith('-') || clean.startsWith('*') || /^\d+\./.test(clean)) {
          items.push(clean.replace(/^[-*\d\.\s]+/, '').trim());
        } else if (clean && items.length > 0 && !clean.startsWith('#')) {
          items[items.length - 1] += ' ' + clean;
        }
      }
      if (items.length > 0) return items;
    }

    return [];
  };

  result.gejala = extractList(['gejala', 'symptom', 'tanda-tanda', 'tanda']);
  result.karantina = extractList(['karantina', 'isolasi', 'pencegahan', 'biosekuriti', 'biosecurity', 'penanganan']);
  result.obat = extractList(['obat', 'penanganan', 'medis', 'rekomendasi obat', 'pengobatan', 'terapi']);

  // Description extraction
  const descMatch = text.match(/(?:##|###|\*\*)\s*(?:Deskripsi|Description|Keterangan)[^\n]*\n([\s\S]*?)(?:\n\s*(?:##|###|\*\*)|$)/i);
  if (descMatch && descMatch[1].trim()) {
    result.deskripsi = descMatch[1].replace(/[-*]/g, '').trim().split('\n').map(l => l.trim()).filter(Boolean).join(' ');
  } else {
    const paragraphs = text.split('\n\n').map(p => p.trim()).filter(p => p && !p.startsWith('#') && !p.startsWith('-') && !p.startsWith('*') && !/^\d+\./.test(p));
    if (paragraphs.length > 0) {
      result.deskripsi = paragraphs[0];
      if (result.deskripsi.includes('JSON') || result.deskripsi.includes('{')) {
        result.deskripsi = 'Deskripsi klinis berhasil dianalisis oleh Vet AI.';
      }
    }
  }

  // Fallbacks if empty
  if (result.gejala.length === 0) {
    result.gejala = selectedSymptoms.length > 0 ? selectedSymptoms : ['Nafas sesak / ngorok'];
  }
  if (result.karantina.length === 0) {
    result.karantina = [
      'Pisahkan ayam yang sakit segera ke kandang isolasi khusus.',
      'Lakukan desinfeksi menyeluruh pada seluruh area kandang dan peralatan.',
      'Perketat biosekuriti pintu masuk kandang, ganti alas kaki, dan cuci tangan sebelum masuk.'
    ];
  }
  if (result.obat.length === 0) {
    result.obat = [
      'Berikan terapi suportif berupa multivitamin dosis tinggi untuk mendongkrak imun.',
      'Hubungi petugas mantri atau dokter hewan terdekat untuk diagnosis dan resep obat yang lebih akurat.'
    ];
  }

  return result;
}

const daftarGejala = [
  { id: 'ngorok', label: 'Nafas sesak, rales, atau ngorok basah' },
  { id: 'muka_bengkak', label: 'Muka/pial bengkak & keluar leleran kental (Snot)' },
  { id: 'lumpuh', label: 'Kaki lumpuh/lemah, atau sayap menggantung lemas' },
  { id: 'tortikolis', label: 'Leher terpelintir/tortikolis (Tetelo/ND)' },
  { id: 'diare_hijau', label: 'Diare encer berwarna hijau pekat' },
  { id: 'diare_kapur', label: 'Diare putih kapur menempel di dubur (Berak Kapur)' },
  { id: 'diare_darah', label: 'Diare coklat kemerahan / berak darah berlendir' },
  { id: 'feces_air', label: 'Feces sangat basah dan berair (Watery Droppings)' },
  { id: 'bulu_kusam', label: 'Ayam lesu, mengantuk & bulu berdiri (kusam)' },
  { id: 'jengger_biru', label: 'Pial/jengger berwarna biru, pucat, atau mengkerut' },
  { id: 'telur_turun', label: 'Produksi telur anjlok mendadak (>10%)' },
  { id: 'cangkang_rusak', label: 'Cangkang telur lembek/tipis/tanpa kerabang/retak' },
  { id: 'telur_kecil', label: 'Ukuran telur sangat kecil atau bentuk abnormal (IB/EDS)' },
  { id: 'makan_turun', label: 'Nafsu makan dan minum turun drastis (anoreksia)' },
];


export default function DiagnosisPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // App state
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepText, setScanStepText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiseaseDiagnosis | null>(null);
  const [diagnosisModel, setDiagnosisModel] = useState<string>('');
  const [diagnosisProvider, setDiagnosisProvider] = useState<string>('');

  // Toggle Symptom
  const handleToggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Auto recommend symptoms based on files sometimes, but let user click
    }
  };

  // Trigger Scanner Simulation with real Vet AI integration
  const handleStartAnalysis = async () => {
    if (selectedSymptoms.length === 0 && !imageFile) {
      alert('Pilihlah minimal 1 gejala fisik ayam ATAU unggah foto kotoran/kondisi ayam untuk memulai analisis.');
      return;
    }

    setIsScanning(true);
    setScanProgress(5);
    setScanStepText('Menginisialisasi Vet AI Engine...');

    // 1. Prepare Base64 Image if uploaded
    let base64Image: string | null = null;
    try {
      if (imageFile) {
        const getBase64 = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
        };
        base64Image = await getBase64(imageFile);
      }
    } catch (err) {
      console.error('Gagal membaca gambar:', err);
    }

    // 2. Prepare message prompt
    const symptomLabels = selectedSymptoms.map(id => {
      const match = daftarGejala.find(g => g.id === id);
      return match ? match.label : id;
    });
    
    // Explicit instructions to prevent hallucinated image analysis if image is null
    const message = `Minta diagnosis klinis unggas petelur dengan gejala fisik terpilih: ${symptomLabels.join(', ')}. ` +
      (imageFile 
        ? 'Mohon analisis juga gambar kotoran/kondisi fisik ayam yang disertakan.' 
        : 'PENTING: Pengguna tidak menyertakan foto. Lakukan diagnosis HANYA berdasarkan gejala tertulis di atas, jangan sebutkan atau lakukan analisis visual terhadap gambar kosong.');

    // Start background API call
    let apiErrorOccurred = false;
    const apiPromise = supabase.functions.invoke('poultry-ai', {
      body: {
        message,
        image: base64Image,
        isClinicalDiagnosis: true
      }
    }).then(({ data, error }) => {
      if (error) throw error;
      if (data && data.reply) {
        const cleanText = data.reply.replace(/```json/g, "").replace(/```/g, "").trim();
        
        let parsed: any;
        try {
          parsed = JSON.parse(cleanText);
        } catch (jsonErr) {
          const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[0]);
            } catch (innerErr) {
              try {
                parsed = parseMarkdownOrText(cleanText, selectedSymptoms);
              } catch (mdErr) {
                throw jsonErr;
              }
            }
          } else {
            try {
              parsed = parseMarkdownOrText(cleanText, selectedSymptoms);
            } catch (mdErr) {
              throw jsonErr;
            }
          }
        }

        return {
          nama: parsed.nama || 'Diagnosis AI',
          keyakinan: Number(parsed.keyakinan) || 85,
          deskripsi: parsed.deskripsi || 'Tidak ada deskripsi rinci.',
          gejala: Array.isArray(parsed.gejala) ? parsed.gejala : [],
          karantina: Array.isArray(parsed.karantina) ? parsed.karantina : [],
          obat: Array.isArray(parsed.obat) ? parsed.obat.map(formatMedicineItem) : [],
          tingkatBahaya: (parsed.tingkatBahaya as 'Tinggi' | 'Sedang' | 'Rendah') || 'Sedang',
          modelUsed: data.modelUsed || 'kimi-k2.5',
          providerUsed: data.providerUsed || 'BluesMinds'
        } as DiseaseDiagnosis;
      }
      throw new Error('Respons tidak valid');
    }).catch(err => {
      console.warn('Gagal memanggil AI, jalankan fallback local rule:', err);
      apiErrorOccurred = true;
      // Fallback local rules
      let diseaseKey = 'ND';
      if (selectedSymptoms.includes('diare_darah') || (imageFile && imageFile.name.toLowerCase().includes('darah'))) {
        diseaseKey = 'Coccidiosis';
      } else if (selectedSymptoms.includes('muka_bengkak') || selectedSymptoms.includes('ngorok')) {
        diseaseKey = 'Coryza';
      }
      return {
        ...penyakitMock[diseaseKey],
        modelUsed: 'local-fallback',
        providerUsed: 'Lokal'
      } as DiseaseDiagnosis;
    });

    // Run premium visual scanning progress ticks (Total 3 seconds)
    const steps = [
      { p: 20, t: base64Image ? 'Mengompresi dan menganalisis foto udara gejala...' : 'Memproses parameter klinis gejala tertulis...' },
      { p: 45, t: base64Image ? 'Memindai konsistensi warna, bentuk, & pigmen feces...' : 'Menghubungkan parameter klinis ke database patogen...' },
      { p: 70, t: 'Menyusun kalkulasi probabilitas patogen unggas...' },
      { p: 90, t: 'Memformulasikan rekomendasi medis, karantina & resep obat...' },
      { p: 100, t: 'Menyelesaikan berkas rekam medis Vet AI...' }
    ];

    let currentStep = 0;
    const interval = setInterval(async () => {
      if (currentStep < steps.length) {
        setScanProgress(steps[currentStep].p);
        setScanStepText(steps[currentStep].t);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Wait for the API promise to settle
        const result = await apiPromise;
        
        setTimeout(() => {
          setIsScanning(false);
          setDiagnosisResult(result);
          setDiagnosisModel(result.modelUsed || '');
          setDiagnosisProvider(result.providerUsed || '');
        }, 500);
      }
    }, 600);
  };

  // Reset
  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setSelectedSymptoms([]);
    setDiagnosisResult(null);
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-warm-earth md:text-2xl">Klinik Vet AI</h2>
          <p className="text-sm text-slate-500">Gunakan kecerdasan buatan untuk mendeteksi gejala klinis penyakit ayam petelur sedini mungkin.</p>
        </div>
        
        {diagnosisResult && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all cursor-pointer border border-slate-200/40"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Mulai Diagnosis Baru</span>
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isScanning && !diagnosisResult ? (
          /* ─── PHASE 1: DIAGNOSTIC INPUT FORM ─── */
          <motion.div
            key="input-phase"
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: -15 }}
            transition={isMobile ? { duration: 0 } : { duration: 0.3 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-5"
          >
            {/* Left side: Upload Image Native Access */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-warm-earth uppercase tracking-wider mb-2">Unggah Foto Gejala / Feces</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Ambil foto kotoran ayam (feces) atau bagian tubuh ayam yang terindikasi sakit (mata berlendir, lumpuh) menggunakan kamera HP.
                </p>
                
                {/* Drag and Drop Container */}
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50/90 transition-all aspect-video flex flex-col items-center justify-center p-4 text-center group cursor-pointer">
                  {imagePreview ? (
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <img src={imagePreview} alt="Preview Foto Gejala" className="h-full w-full object-cover" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 rounded-lg bg-black/60 hover:bg-black/80 p-1 text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="camera-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                      <div className="rounded-2xl bg-white p-3 shadow-md shadow-slate-100 text-slate-400 group-hover:text-primary-gold transition-colors mb-3">
                        <Camera className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-warm-earth block">Tekan untuk Ambil Foto Kamera HP</span>
                      <span className="text-[10px] text-slate-400 mt-1 block">Mendukung format JPG, PNG hingga 5MB</span>
                    </label>
                  )}
                  
                  {/* Native Camera Access tag! */}
                  <input
                    type="file"
                    id="camera-upload"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Tips banner */}
              <div className="rounded-2xl bg-primary-gold/5 border border-primary-gold/15 p-3.5 flex gap-2.5 items-start">
                <Info className="h-4.5 w-4.5 text-primary-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-bold text-warm-earth">Tips Foto Feces yang Baik</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                    Gunakan pencahayaan terang alami, pastikan fokus kamera tajam tepat pada objek kotoran untuk mendeteksi cacing/protozoa.
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: Checklist Symptoms */}
            <div className="lg:col-span-3 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-warm-earth uppercase tracking-wider">Pilih Gejala Fisik Ayam</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Centang seluruh gejala klinis yang Anda amati pada ayam di dalam kandang untuk meningkatkan akurasi diagnosa Vet AI.
                  </p>
                </div>

                {/* Checklist grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {daftarGejala.map((symptom) => {
                    const isChecked = selectedSymptoms.includes(symptom.id);
                    return (
                      <button
                        key={symptom.id}
                        type="button"
                        onClick={() => handleToggleSymptom(symptom.id)}
                        className={`flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-primary-gold/5 border-primary-gold text-warm-earth shadow-sm'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className={`h-4.5 w-4.5 rounded flex items-center justify-center border shrink-0 transition-colors ${
                          isChecked ? 'bg-primary-gold border-primary-gold text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Plus className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span className="text-xs font-bold">{symptom.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-400 max-w-xs leading-tight">
                  Menekan tombol analisis berarti menyetujui diagnosa ini sebagai asisten referensi awal, bukan diagnosis dokter hewan resmi.
                </div>
                <button
                  onClick={handleStartAnalysis}
                  className="flex items-center gap-2 rounded-xl bg-primary-gold px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-gold/20 hover:bg-primary-gold/90 transition-all cursor-pointer shrink-0"
                >
                  <Stethoscope className="h-4.5 w-4.5" />
                  <span>Analisa Menggunakan AI</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : isScanning ? (
          /* ─── PHASE 2: SCANNING INTERACTIVE PROGRESS ─── */
          <motion.div
            key="scan-phase"
            initial={isMobile ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={isMobile ? { opacity: 1 } : { opacity: 0 }}
            transition={isMobile ? { duration: 0 } : { duration: 0.3 }}
            className="rounded-3xl border border-slate-100 bg-white p-12 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center space-y-6"
          >
            {/* Visual Scanning ring */}
            <div className="relative">
              {/* Outer Pulsing Ring */}
              <div className="absolute inset-0 rounded-full bg-primary-gold/20 animate-ping opacity-60" />
              {/* Spinning Ring */}
              <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-primary-gold animate-spin flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary-gold" />
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-base font-bold text-warm-earth">Sedang Menganalisis Kondisi Kandang...</h3>
              <p className="text-xs text-slate-500 font-medium h-4">{scanStepText}</p>
            </div>

            {/* Custom progress bar */}
            <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-primary-gold h-full rounded-full"
                animate={{ width: `${scanProgress}%` }}
                transition={isMobile ? { duration: 0 } : { duration: 0.4 }}
              />
            </div>
            
            <span className="text-xs font-black text-primary-gold font-mono">{scanProgress}%</span>
          </motion.div>
        ) : (
          /* ─── PHASE 3: COMPREHENSIVE RESULT CARD ─── */
          <motion.div
            key="result-phase"
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={isMobile ? { duration: 0 } : { duration: 0.3 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Suspect summary card */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Diagnosa AI</span>
                    {diagnosisModel && (
                      <span className="text-[9px] font-semibold text-primary-gold bg-primary-gold/5 border border-primary-gold/10 px-2 py-0.5 rounded-full inline-block w-fit">
                        Dianalisis oleh {diagnosisModel} {diagnosisProvider ? `via ${diagnosisProvider}` : ''}
                      </span>
                    )}
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    diagnosisResult?.tingkatBahaya === 'Tinggi'
                      ? 'bg-red-50 text-red-500 border border-red-100'
                      : 'bg-amber-50 text-amber-500 border border-amber-100'
                  }`}>
                    Tingkat Bahaya: {diagnosisResult?.tingkatBahaya}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-warm-earth">{diagnosisResult?.nama}</h3>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                      <div className="bg-primary-gold h-full rounded-full" style={{ width: `${diagnosisResult?.keyakinan}%` }} />
                    </div>
                    <span className="text-xs font-black text-primary-gold font-mono">{diagnosisResult?.keyakinan}% Keyakinan</span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-slate-600">{diagnosisResult?.deskripsi}</p>
              </div>

              {/* Photo preview used in diagnosis */}
              {imagePreview && (
                <div className="rounded-2xl overflow-hidden aspect-video border border-slate-100 shadow-sm relative">
                  <img src={imagePreview} alt="Foto input" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 bg-black/60 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Gambar Berhasil Dipindai</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quarantine instructions & medicines */}
            <div className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              {/* Block 1: Quarantine */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Prosedur Karantina Darurat</span>
                </h4>
                
                <ul className="space-y-2">
                  {diagnosisResult?.karantina.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-700">
                      <span className="h-4.5 w-4.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Block 2: Medicines */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 shrink-0" />
                  <span>Rekomendasi Penanganan & Obat Darurat</span>
                </h4>

                <ul className="space-y-2">
                  {diagnosisResult?.obat.map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Veterinarian Advisory warning */}
              <div className="rounded-2xl bg-amber-50/40 border border-amber-100 p-4 flex gap-3 items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-warm-earth">Pemberitahuan Penting Dokter Hewan</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    Penyakit unggas dapat berkembang cepat dalam hitungan jam. Disarankan untuk segera menghubungi mantri hewan atau layanan dinas peternakan terdekat di wilayah Anda jika gejala menyebar ke kandang lainnya dalam waktu 24 jam.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
