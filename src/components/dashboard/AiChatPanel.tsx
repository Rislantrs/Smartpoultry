import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, X, Send, Sparkles, Bot, User, 
  Minimize2, Maximize2, Loader2, Sparkle
} from 'lucide-react';
import {
  type DetailedDailyLog,
  type VaccinationLog,
  type WeeklyProductionLog,
  type MaintenanceLog,
  type FinancialSalesLog,
  type LogSource,
} from './data/mockData';
import { supabase } from '../../lib/supabase';

export function findBestMatchedItem(inputName: string): string | null {
  const standardItems = [
    'Konsentrat Pakan Malindo 8202',
    'Pakan Jadi Jagung Giling CP',
    'Telur Ayam Segar (Gudang)',
    'Vaksin ND-Lasota (Aktif)',
    'Multivitamin Vita Stress'
  ];

  const lowerInput = inputName.toLowerCase();

  // Exact or direct inclusion check
  for (const item of standardItems) {
    const lowerItem = item.toLowerCase();
    if (lowerItem.includes(lowerInput) || lowerInput.includes(lowerItem)) {
      return item;
    }
  }

  // Keywords-based checks with common synonyms & spelling errors (typos)
  if (/stress|steess|stres|vita|vitamin|vitas|multivitamin/i.test(lowerInput)) {
    return 'Multivitamin Vita Stress';
  }
  if (/lasota|vaksin|nd|vaccine|active/i.test(lowerInput)) {
    return 'Vaksin ND-Lasota (Aktif)';
  }
  if (/malindo|8202|konsentrat|pakan malindo/i.test(lowerInput)) {
    return 'Konsentrat Pakan Malindo 8202';
  }
  if (/cp|jagung|pakan cp|giling|pakan jadi/i.test(lowerInput)) {
    return 'Pakan Jadi Jagung Giling CP';
  }
  if (/telur|egg|telur ayam|telor/i.test(lowerInput)) {
    return 'Telur Ayam Segar (Gudang)';
  }

  return null;
}


interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isSpecialCard?: boolean;
}

interface AiChatPanelProps {
  dailyList: DetailedDailyLog[];
  addDailyLog: (log: DetailedDailyLog) => Promise<void>;
  vaccineList: VaccinationLog[];
  addVaccineLog: (log: VaccinationLog) => Promise<void>;
  weeklyList: WeeklyProductionLog[];
  addWeeklyLog: (log: WeeklyProductionLog) => Promise<void>;
  maintList: MaintenanceLog[];
  addMaintLog: (log: MaintenanceLog) => Promise<void>;
  salesList: FinancialSalesLog[];
  addSalesLog: (log: FinancialSalesLog) => Promise<void>;
  inventoryList: any[];
  addInventoryLog: (log: any) => Promise<void>;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    content: 'Halo, Peternak Cerdas! 🐔 Saya asisten AI SmartPoultry. \n\nSaya terintegrasi penuh dengan seluruh Buku Catatan Digital Anda! Anda bisa menanyakan analisis performa FCR, peringatan heat stress harian, inventaris pakan, hingga *menugaskan saya mencatat data harian otomatis* via chat.\n\nContoh: *"Tolong catat harian telur 4300 butir, berat 268 kg, pakan 480 kg, ayam mati 1 ekor, feces normal, suhu siang 30 derajat"*',
    timestamp: new Date(),
  },
];

const SUGGESTIONS = [
  {
    icon: '📊',
    title: 'Analisis FCR Kandang',
    desc: 'Hitung efisiensi pakan vs berat telur dari log riwayat Anda',
    prompt: 'Berapa hasil FCR aktual kandang saya saat ini jika dihitung dari data log harian?'
  },
  {
    icon: '🌡️',
    title: 'Risiko Heat Stress',
    desc: 'Evaluasi suhu siang dan kelembapan kotoran ayam',
    prompt: 'Apakah ada risiko stres panas atau amonia tinggi berdasarkan suhu dan kondisi feces?'
  },
  {
    icon: '📦',
    title: 'Kritis Stok Pakan',
    desc: 'Berapa hari lagi persediaan pakan di gudang aman',
    prompt: 'Berapa hari lagi sisa stok pakan saya di gudang akan habis?'
  },
  {
    icon: '✍️',
    title: 'Catat Harian Otomatis',
    desc: 'Ketik laporan harian secara cepat dengan bahasa santai',
    prompt: 'Tolong catat harian telur 5000 butir, pakan 480 kg, ayam mati 0 ekor'
  }
];

const renderMarkdown = (content: string, role: 'user' | 'assistant') => {
  const lines = content.split('\n');
  const isUser = role === 'user';
  
  return lines.map((line, lineIdx) => {
    const cleanLine = line.trim();
    
    // Deteksi header ###
    if (cleanLine.startsWith('### ')) {
      return (
        <h4 key={lineIdx} className={`text-xs font-extrabold uppercase mt-2 mb-1 tracking-wider ${isUser ? 'text-white' : 'text-slate-800'}`}>
          {parseInlineMarkdown(cleanLine.slice(4), role)}
        </h4>
      );
    }
    // Deteksi header ##
    if (cleanLine.startsWith('## ')) {
      return (
        <h3 key={lineIdx} className={`text-sm font-bold mt-2.5 mb-1 ${isUser ? 'text-white' : 'text-slate-900'}`}>
          {parseInlineMarkdown(cleanLine.slice(3), role)}
        </h3>
      );
    }

    // Deteksi list / bullet point (- atau *)
    if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 ml-1.5 my-0.5">
          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isUser ? 'bg-white' : 'bg-[#FF9F1C]'}`} />
          <span className={`text-[13px] leading-relaxed ${isUser ? 'text-white/95' : 'text-slate-700'}`}>
            {parseInlineMarkdown(cleanLine.slice(2), role)}
          </span>
        </div>
      );
    }

    // Baris kosong
    if (line.trim() === '') {
      return <div key={lineIdx} className="h-1.5" />;
    }

    // Paragraf biasa
    return (
      <p key={lineIdx} className={`text-[13px] leading-relaxed my-0.5 ${isUser ? 'text-white' : 'text-slate-700'} font-medium`}>
        {parseInlineMarkdown(line, role)}
      </p>
    );
  });
};

const parseInlineMarkdown = (text: string, role: 'user' | 'assistant'): React.ReactNode[] => {
  const isUser = role === 'user';
  const nodes: React.ReactNode[] = [];
  
  let i = 0;
  while (i < text.length) {
    // 1. Code block: `code`
    if (text[i] === '`') {
      const close = text.indexOf('`', i + 1);
      if (close !== -1) {
        const content = text.substring(i + 1, close);
        nodes.push(
          <code key={i} className={`px-1 py-0.5 rounded font-mono text-[11.5px] ${
            isUser 
              ? 'bg-white/10 text-white border border-white/20' 
              : 'bg-slate-100 border border-slate-200 text-rose-600'
          }`}>
            {content}
          </code>
        );
        i = close + 1;
        continue;
      }
    }
    
    // 2. Bold block: **bold**
    if (text[i] === '*' && text[i + 1] === '*') {
      const close = text.indexOf('**', i + 2);
      if (close !== -1) {
        const content = text.substring(i + 2, close);
        nodes.push(
          <strong key={i} className={`font-extrabold px-1 py-0.5 rounded text-[12.5px] ${
            isUser 
              ? 'bg-white/20 text-white' 
              : 'bg-amber-100/70 text-[#c86f03] border border-amber-200/50'
          }`}>
            {parseInlineMarkdown(content, role)}
          </strong>
        );
        i = close + 2;
        continue;
      }
    }
    
    // 3. Italic block: *italic*
    if (text[i] === '*') {
      let close = -1;
      let searchIdx = i + 1;
      while (searchIdx < text.length) {
        const found = text.indexOf('*', searchIdx);
        if (found === -1) break;
        
        // Skip bold boundaries
        if (text[found + 1] === '*') {
          searchIdx = found + 2;
        } else if (text[found - 1] === '*') {
          searchIdx = found + 1;
        } else {
          close = found;
          break;
        }
      }
      
      if (close === -1) {
        const lastStar = text.lastIndexOf('*');
        if (lastStar > i) {
          close = lastStar;
        }
      }
      
      if (close !== -1) {
        const content = text.substring(i + 1, close);
        nodes.push(
          <em key={i} className={`italic font-semibold ${isUser ? 'text-white' : 'text-slate-800'}`}>
            {parseInlineMarkdown(content, role)}
          </em>
        );
        i = close + 1;
        continue;
      }
    }
    
    // 4. Plain text
    let nextSpecial = i;
    while (nextSpecial < text.length && text[nextSpecial] !== '*' && text[nextSpecial] !== '`') {
      nextSpecial++;
    }
    
    if (nextSpecial > i) {
      nodes.push(text.substring(i, nextSpecial));
      i = nextSpecial;
    } else {
      nodes.push(text[i]);
      i++;
    }
  }
  
  return nodes;
};

export default function AiChatPanel({
  dailyList,
  addDailyLog,
  vaccineList,
  addVaccineLog,
  weeklyList,
  addWeeklyLog,
  maintList,
  addMaintLog,
  salesList,
  addSalesLog,
  inventoryList,
  addInventoryLog,
}: AiChatPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: isMobile ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), isMobile ? 0 : 300);
    }
  }, [isOpen, isMobile]);

  // Extract latest metrics for AI prompt evaluations
  const latestLog = useMemo(() => {
    return dailyList[0] || {
      telurButir: 4380,
      telurBeratKg: 270,
      telurBS: 4,
      pakanKeluarKg: 485,
      pakanKeluarSak: 9.7,
      pakanSisaKg: 15,
      airStatus: 'Bersih' as const,
      ayamMati: 2,
      suhuPagi: 24.5,
      suhuSiang: 30.2,
      fecesKondisi: 'Normal' as const,
      sumber: 'Telegram' as LogSource,
      tanggal: '20 Mei 2026',
    };
  }, [dailyList]);

  const fcrValue = useMemo(() => {
    return latestLog.telurBeratKg 
      ? Number((latestLog.pakanKeluarKg / latestLog.telurBeratKg).toFixed(2)) 
      : 1.80;
  }, [latestLog]);

  const prevLog = useMemo(() => {
    return dailyList[1] || {
      telurButir: 4420,
      telurBeratKg: 275,
      telurBS: 2,
      pakanKeluarKg: 490,
      pakanKeluarSak: 9.8,
      pakanSisaKg: 10,
      airStatus: 'Bersih' as const,
      ayamMati: 1,
      suhuPagi: 23.8,
      suhuSiang: 29.5,
      fecesKondisi: 'Normal' as const,
      sumber: 'Web' as LogSource,
      tanggal: '19 Mei 2026',
    };
  }, [dailyList]);

  const prevFcrValue = useMemo(() => {
    return prevLog.telurBeratKg 
      ? Number((prevLog.pakanKeluarKg / prevLog.telurBeratKg).toFixed(2)) 
      : 1.78;
  }, [prevLog]);

  const basePopulasi = 4850;
  const mortalityRate = useMemo(() => {
    return Number(((latestLog.ayamMati / basePopulasi) * 100).toFixed(2));
  }, [latestLog]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userRawText = inputValue.trim();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userRawText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Persiapkan data histori percakapan (maksimal 5 pesan terakhir agar hemat token)
    const chatHistory = messages
      .slice(-5)
      .map(msg => ({ role: msg.role, content: msg.content }));

    try {
      const latestForAI = dailyList[0];
      const farmSnapshot = {
        logHarian: dailyList.slice(0, 10).map(l => ({
          tanggal: l.tanggal,
          telurButir: l.telurButir,
          telurBeratKg: l.telurBeratKg,
          pakanKg: l.pakanKeluarKg,
          ayamMati: l.ayamMati,
          suhuSiang: l.suhuSiang,
          feces: l.fecesKondisi,
          gejala: l.gejalaPenyakit || 'tidak ada'
        })),
        rekapMingguan: weeklyList.slice(0, 4).map(w => ({
          minggu: w.mingguTanggal,
          totalTelurButir: w.totalTelurButir,
          totalTelurKg: w.totalTelurKg,
          totalPakanKg: w.totalPakanKg,
          fcr: w.fcr
        })),
        inventarisGudang: (inventoryList || []).slice(0, 10).map(i => ({
          item_name: i.item_name,
          stock_initial: i.stock_initial,
          stock_in: i.stock_in,
          stock_out: i.stock_out,
          stock_final: i.stock_final,
          log_date: i.log_date
        })),
        kondisiTerkini: latestForAI ? {
          tanggal: latestForAI.tanggal,
          suhuSiang: latestForAI.suhuSiang,
          feces: latestForAI.fecesKondisi,
          mortalitas: latestForAI.ayamMati,
          telurHariIni: latestForAI.telurButir,
          telurBeratKg: latestForAI.telurBeratKg,
          pakanHariIni: latestForAI.pakanKeluarKg
        } : {}
      };

      // Panggil Supabase Edge Function 'poultry-ai'
      const { data, error } = await supabase.functions.invoke('poultry-ai', {
        body: { 
          message: userRawText, 
          history: chatHistory,
          modelProvider: 'gemini',
          farmData: farmSnapshot
        }
      });

      if (error) throw error;

      if (data && data.reply) {
        let isSpecial = false;
        
        // Pemicu update state harian terstruktur jika dikembalikan oleh Edge Function
        if (data.action === 'record_daily' && data.payload) {
          isSpecial = true;
          const newLogId = `harian-${Date.now()}`;
          const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          const calculatedTelurButir = data.payload.telurButir ?? 4350;
          const calculatedPakan = data.payload.pakanKeluarKg ?? (latestLog.pakanKeluarKg || 480);
          const newDailyLog: DetailedDailyLog = {
            id: newLogId,
            tanggal: todayStr,
            telurButir: calculatedTelurButir,
            telurBeratKg: data.payload.telurBeratKg ?? Math.round(calculatedTelurButir * 0.062),
            telurBS: data.payload.telurBS ?? (Math.round(calculatedTelurButir * 0.001) || 1),
            pakanKeluarKg: calculatedPakan,
            pakanKeluarSak: Number((calculatedPakan / 50).toFixed(1)),
            airStatus: data.payload.airStatus ?? 'Bersih',
            ayamMati: data.payload.ayamMati ?? 0,
            suhuPagi: 24.2,
            suhuSiang: data.payload.suhuSiang ?? 30.0,
            fecesKondisi: (data.payload.fecesKondisi as 'Normal' | 'Basah') ?? 'Normal',
            sumber: 'AI Agent',
          };
          await addDailyLog(newDailyLog);
        } else if (data.action === 'adjust_inventory' && data.payload) {
          isSpecial = true;
          const { item_name, adjust_type, quantity } = data.payload;
          
          const standardItems = [
            { nama: 'Konsentrat Pakan Malindo 8202', stok: 42 },
            { nama: 'Pakan Jadi Jagung Giling CP', stok: 120 },
            { nama: 'Telur Ayam Segar (Gudang)', stok: 320 },
            { nama: 'Vaksin ND-Lasota (Aktif)', stok: 15 },
            { nama: 'Multivitamin Vita Stress', stok: 4 }
          ];

          const matchedItemName = findBestMatchedItem(item_name);
          const matchedItem = matchedItemName
            ? standardItems.find(i => i.nama === matchedItemName)
            : null;

          if (matchedItem) {
            const itemLogs = (inventoryList || []).filter(l => l.item_name === matchedItem.nama);
            const currentStock = itemLogs.length > 0 ? itemLogs[0].stock_final : matchedItem.stok;
            const qty = Number(quantity);
            const newStok = adjust_type === 'Masuk' 
              ? currentStock + qty 
              : Math.max(0, currentStock - qty);

            const newLog = {
              item_name: matchedItem.nama,
              stock_initial: currentStock,
              stock_in: adjust_type === 'Masuk' ? qty : 0,
              stock_out: adjust_type === 'Keluar' ? qty : 0,
              stock_final: newStok,
              log_date: new Date().toISOString().split('T')[0],
            };
            await addInventoryLog(newLog);
          }
        } else {
          // Fallback parsing pencatatan harian lokal dari teks asisten jika mengandung kata kunci tertentu atau shortcut
          const lowerInput = userRawText.toLowerCase();
          const hasShortcuts = /tl\s*\d+/i.test(lowerInput) || /pk\s*\d+/i.test(lowerInput) || /am\s*\d+/i.test(lowerInput) || /tb\s*\d+/i.test(lowerInput);
          if (lowerInput.includes('catat') || lowerInput.includes('tulis') || lowerInput.includes('input') || lowerInput.includes('pencatatan') || hasShortcuts) {
            isSpecial = true;
            
            // Ekstraksi angka lokal via regex
            const telurButirMatch = lowerInput.match(/telur\s*(\d+)\s*butir/) || lowerInput.match(/(\d+)\s*butir/) || lowerInput.match(/telur\s*(\d+)/) || lowerInput.match(/tl\s*(\d+)/);
            const telurButir = telurButirMatch ? parseInt(telurButirMatch[1], 10) : 4350;
            
            const telurBeratMatch = lowerInput.match(/berat\s*(\d+)\s*kg/) || lowerInput.match(/(\d+)\s*kg\s*telur/) || lowerInput.match(/telur\s*(\d+)\s*kg/) || lowerInput.match(/tb\s*(\d+(\.\d+)?)/);
            const telurBerat = telurBeratMatch ? parseFloat(telurBeratMatch[1]) : Math.round(telurButir * 0.062);
            
            const pakanMatch = lowerInput.match(/pakan\s*(\d+)\s*kg/) || lowerInput.match(/(\d+)\s*kg\s*pakan/) || lowerInput.match(/pakan\s*(\d+)/) || lowerInput.match(/pk\s*(\d+(\.\d+)?)/);
            const pakan = pakanMatch ? parseFloat(pakanMatch[1]) : (latestLog.pakanKeluarKg || 480);
            
            const matiMatch = lowerInput.match(/mati\s*(\d+)\s*ekor/) || lowerInput.match(/mati\s*(\d+)/) || lowerInput.match(/(\d+)\s*ekor/) || lowerInput.match(/am\s*(\d+)/);
            const mati = matiMatch ? parseInt(matiMatch[1], 10) : 0;
            
            const fecesMatch = lowerInput.match(/fc\s*(normal|basah)/);
            const feces = fecesMatch ? (fecesMatch[1] === 'basah' ? 'Basah' : 'Normal') : (lowerInput.includes('basah') ? 'Basah' : 'Normal');
            
            const tempMatch = lowerInput.match(/suhu\s*(\d+(\.\d+)?)/) || lowerInput.match(/(\d+(\.\d+)?)\s*derajat/) || lowerInput.match(/sh\s*(\d+(\.\d+)?)/);
            const suhuSiang = tempMatch ? parseFloat(tempMatch[1]) : 29.8;

            const newLogId = `harian-${Date.now()}`;
            const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            
            const newDailyLog: DetailedDailyLog = {
              id: newLogId,
              tanggal: todayStr,
              telurButir,
              telurBeratKg: telurBerat,
              telurBS: Math.round(telurButir * 0.001) || 1,
              pakanKeluarKg: pakan,
              pakanKeluarSak: Number((pakan / 50).toFixed(1)),
              airStatus: 'Bersih',
              ayamMati: mati,
              suhuPagi: 24.2,
              suhuSiang,
              fecesKondisi: feces as 'Normal' | 'Basah',
              sumber: 'AI Agent',
            };
            await addDailyLog(newDailyLog);
          }
        }

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date(),
          isSpecialCard: isSpecial,
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      } else {
        throw new Error('Format respons tidak valid');
      }
    } catch (err) {
      console.warn('Gagal menghubungi Supabase Edge Function, menjalankan fallback Local NLP Regex Parser:', err);
      
      // Fallback ke pemrosesan regex lokal super cepat (Offline / Local Fallback)
      setTimeout(async () => {
        const lowerInput = userRawText.toLowerCase();
        let aiReply = '';
        let isSpecial = false;
        const hasShortcuts = /tl\s*\d+/i.test(lowerInput) || /pk\s*\d+/i.test(lowerInput) || /am\s*\d+/i.test(lowerInput) || /tb\s*\d+/i.test(lowerInput);

        // ── PERSISTENT AI MUTASI STOK GUDANG LOKAL ──
        if (lowerInput.includes('tambah') || lowerInput.includes('kurang') || lowerInput.includes('stok') || lowerInput.includes('gudang')) {
          const isMasuk = lowerInput.includes('tambah') || lowerInput.includes('masuk') || lowerInput.includes('+');
          
          const matchedItemName = findBestMatchedItem(lowerInput) || '';
          let unit = 'Sak';
          if (matchedItemName === 'Telur Ayam Segar (Gudang)' || matchedItemName === 'Multivitamin Vita Stress') {
            unit = 'Kg';
          } else if (matchedItemName === 'Vaksin ND-Lasota (Aktif)') {
            unit = 'Vial';
          }
          
          if (matchedItemName) {
            isSpecial = true;
            const qtyMatch = lowerInput.match(/(\d+)/);
            const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 5;
            
            const itemLogs = (inventoryList || []).filter(l => l.item_name === matchedItemName);
            const standardItems = [
              { nama: 'Konsentrat Pakan Malindo 8202', stok: 42 },
              { nama: 'Pakan Jadi Jagung Giling CP', stok: 120 },
              { nama: 'Telur Ayam Segar (Gudang)', stok: 320 },
              { nama: 'Vaksin ND-Lasota (Aktif)', stok: 15 },
              { nama: 'Multivitamin Vita Stress', stok: 4 },
            ];
            const baseStok = standardItems.find(i => i.nama === matchedItemName)?.stok || 0;
            const currentStock = itemLogs.length > 0 ? itemLogs[0].stock_final : baseStok;
            
            const newStok = isMasuk ? currentStock + qty : Math.max(0, currentStock - qty);
            
            const newLog = {
              item_name: matchedItemName,
              stock_initial: currentStock,
              stock_in: isMasuk ? qty : 0,
              stock_out: isMasuk ? 0 : qty,
              stock_final: newStok,
              log_date: new Date().toISOString().split('T')[0],
            };
            
            await addInventoryLog(newLog);
            
            aiReply = `⚠️ *[Menghubungi AI Edge Gagal - Menjalankan Mode Offline]* 📦\n\n` +
              `✨ **[Penyesuaian Persediaan Gudang Berhasil!]**\n\n` +
              `Saya mendeteksi penyesuaian stok secara lokal:\n` +
              `- 📦 **Item**: **${matchedItemName}**\n` +
              `- 🔄 **Jenis**: **Stok ${isMasuk ? 'Masuk (+)' : 'Keluar (-)'}**\n` +
              `- 🔢 **Jumlah Mutasi**: **${qty} ${unit}**\n` +
              `- 📈 **Stok Akhir**: **${newStok} ${unit}**\n\n` +
              `*Dashboard Inventaris Anda telah diperbarui secara instan!*`;
          }
        }

        // ── TYPE 1: NATURAL LANGUAGE DATA ENTRY PARSER (PENCATATAN OTOMATIS) ──
        if (!aiReply && (lowerInput.includes('catat') || lowerInput.includes('tulis') || lowerInput.includes('input') || lowerInput.includes('pencatatan') || hasShortcuts)) {
          isSpecial = true;
          
          const telurButirMatch = lowerInput.match(/telur\s*(\d+)\s*butir/i) || lowerInput.match(/(\d+)\s*butir/i) || lowerInput.match(/telur\s*(\d+)/i) || lowerInput.match(/tl\s*(\d+)/i);
          const telurButir = telurButirMatch ? parseInt(telurButirMatch[1], 10) : 4350;
          
          const telurBeratMatch = lowerInput.match(/berat\s*(\d+(\.\d+)?)\s*kg/i) || lowerInput.match(/(\d+(\.\d+)?)\s*kg\s*telur/i) || lowerInput.match(/telur\s*(\d+(\.\d+)?)\s*kg/i) || lowerInput.match(/tb\s*(\d+(\.\d+)?)/i);
          const telurBerat = telurBeratMatch ? parseFloat(telurBeratMatch[1]) : Math.round(telurButir * 0.062);
          
          const pakanMatch = lowerInput.match(/pakan\s*(\d+(\.\d+)?)\s*kg/i) || lowerInput.match(/(\d+(\.\d+)?)\s*kg\s*pakan/i) || lowerInput.match(/pakan\s*(\d+(\.\d+)?)/i) || lowerInput.match(/pk\s*(\d+(\.\d+)?)/i);
          const pakan = pakanMatch ? parseFloat(pakanMatch[1]) : (latestLog.pakanKeluarKg || 480);
          
          const matiMatch = lowerInput.match(/mati\s*(\d+)\s*ekor/i) || lowerInput.match(/mati\s*(\d+)/i) || lowerInput.match(/(\d+)\s*ekor/i) || lowerInput.match(/am\s*(\d+)/i);
          const mati = matiMatch ? parseInt(matiMatch[1], 10) : 0;
          
          const fecesMatch = lowerInput.match(/fc\s*(normal|basah)/i);
          const feces = fecesMatch ? (fecesMatch[1].toLowerCase() === 'basah' ? 'Basah' : 'Normal') : (lowerInput.includes('basah') ? 'Basah' : 'Normal');
          
          const tempMatch = lowerInput.match(/suhu\s*(\d+(\.\d+)?)/i) || lowerInput.match(/(\d+(\.\d+)?)\s*derajat/i) || lowerInput.match(/sh\s*(\d+(\.\d+)?)/i);
          const suhuSiang = tempMatch ? parseFloat(tempMatch[1]) : 29.8;

          const newLogId = `harian-${Date.now()}`;
          const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          
          const newDailyLog: DetailedDailyLog = {
            id: newLogId,
            tanggal: todayStr,
            telurButir,
            telurBeratKg: telurBerat,
            telurBS: Math.round(telurButir * 0.001) || 1,
            pakanKeluarKg: pakan,
            pakanKeluarSak: Number((pakan / 50).toFixed(1)),
            airStatus: 'Bersih',
            ayamMati: mati,
            suhuPagi: 24.2,
            suhuSiang,
            fecesKondisi: feces as 'Normal' | 'Basah',
            sumber: 'AI Agent',
          };

          await addDailyLog(newDailyLog);

          aiReply = `⚠️ *[Menghubungi AI Edge Gagal - Menjalankan Mode Offline]* 🐔\n\n` + 
            `✨ **[Pencatatan Otomatis Berhasil!]**\n\n` +
            `Saya telah mendeteksi data harian Anda secara lokal:\n` +
            `- 📅 **Tanggal**: ${todayStr} (Hari ini)\n` +
            `- 🥚 **Produksi Telur**: **${telurButir.toLocaleString('id-ID')} butir** (~${telurBerat} Kg)\n` +
            `- 🌾 **Pakan Diberikan**: **${pakan} Kg** (~${Number((pakan / 50).toFixed(1))} Sak)\n` +
            `- 💀 **Mortalitas**: **${mati} ekor** ${mati > 0 ? '⚠️' : '✅ (Normal)'}\n` +
            `- 🌡️ **Suhu Siang**: **${suhuSiang}°C** (Feces: **${feces}**)\n\n` +
            `*FCR instan hari ini: **${Number((pakan / telurBerat).toFixed(2))}**. Grafik dan Dashboard telah diperbarui secara real-time!*`;
        } 
        
        // ── TYPE 2: LOGISTICS / INVENTORY / STOCK ALERTS ──
        else if (lowerInput.includes('pakan') || lowerInput.includes('stok') || lowerInput.includes('habis') || lowerInput.includes('inventaris')) {
          aiReply = `📦 **[Laporan Analisis Logistik & Stok Pakan AI - Offline Mode]**\n\n` +
            `Berdasarkan data lokal:\n` +
            `- **Penggunaan Harian**: Rata-rata **${latestLog.pakanKeluarKg} kg / hari**.\n` +
            `- **Sisa Pakan**: **${latestLog.pakanSisaKg || '15'} kg**.\n` +
            `- **Status Gudang**: ⚠️ **Kritis (Tersisa estimasi 3 hari)**.\n\n` +
            `💡 **Rekomendasi AI**: FCR terbaik diperoleh dari konsentrat **Malindo** (FCR **1.81**). Segera pesan **15 sak (750 kg)** untuk mengamankan produksi.`;
        } 
        
        // ── TYPE 3: HEALTH / HEAT STRESS / VET CLINICAL ALERTS ──
        else if (lowerInput.includes('sehat') || lowerInput.includes('mati') || lowerInput.includes('sakit') || lowerInput.includes('feces') || lowerInput.includes('kotoran') || lowerInput.includes('suhu') || lowerInput.includes('panas') || lowerInput.includes('amonia')) {
          const isHeatStress = latestLog.suhuSiang > 31 && latestLog.fecesKondisi === 'Basah';
          aiReply = `🩺 **[Sistem Monitoring Kesehatan & Amonia AI - Offline Mode]**\n\n` +
            `Kondisi kandang terakhir (${latestLog.tanggal}):\n` +
            `- **Mortalitas**: **${latestLog.ayamMati} ekor** (${mortalityRate}% - Sangat Sehat).\n` +
            `- **Suhu**: **${latestLog.suhuSiang}°C** (Feces: **${latestLog.fecesKondisi}**).\n\n` +
            `${isHeatStress 
              ? `⚠️ **DETEKSI PANAS EKSTRIM (HEAT STRESS) & AMONIA TINGGI!**\nSuhu siang **${latestLog.suhuSiang}°C** dengan feces **Basah**. Berikan multivitamin Vita Stress dan tambah kecepatan exhaust blower kandang.`
              : `✅ **STATUS BIOLOGICAL SECURITY: AMAN**\nTingkat mortalitas berada jauh di bawah ambang batas bahaya.`
            }`;
        } 
        
        // ── TYPE 4: PERFORMANCE / FCR / PRODUCTION ANALYTICS ──
        else if (lowerInput.includes('produksi') || lowerInput.includes('telur') || lowerInput.includes('fcr') || lowerInput.includes('analisis') || lowerInput.includes('kinerja') || lowerInput.includes('untung') || lowerInput.includes('rugi')) {
          const avgFcr = (weeklyList.reduce((acc, curr) => acc + curr.fcr, 0) / weeklyList.length).toFixed(2);
          aiReply = `📊 **[Analisis Performa Telur & Efisiensi FCR - Offline Mode]**\n\n` +
            `- **Produksi Harian**: **${latestLog.telurButir.toLocaleString('id-ID')} butir** (~${latestLog.telurBeratKg} kg).\n` +
            `- **FCR Hari Ini**: **${fcrValue.toFixed(2)}** (Kemarin: ${prevFcrValue.toFixed(2)}).\n` +
            `- **FCR Rata-rata**: **${avgFcr}** (Target standard industri: **2.15**).\n\n` +
            `🚀 **Saran AI**: Formulasi pakan berjalan sangat efisien. Pertahankan pakan Malindo saat ini.`;
        } 
        
        // ── TYPE 5: VACCINATIONS / MEDICAL SCHEDULES ──
        else if (lowerInput.includes('vaksin') || lowerInput.includes('obat') || lowerInput.includes('jadwal') || lowerInput.includes('kalender') || lowerInput.includes('rencana')) {
          const lastVaks = vaccineList[0] || { tanggal: '15 Mei 2026', vaksinName: 'Vaksin ND-Lasota', dosisMetode: 'Air Minum', targetGroup: 'Kandang 1 & 2' };
          aiReply = `📅 **[Kalender Vaksinasi & Penjadwalan AI - Offline Mode]**\n\n` +
            `- **Terakhir**: **${lastVaks.vaksinName}** pada ${lastVaks.tanggal}.\n` +
            `- **Berikutnya**: **30 Mei 2026** - Vaksinasi ND+EDS (Egg Drop Syndrome) via injeksi IM dada.`;
        } 
        
        // ── DEFAULT AI FALLBACK RESPONSE ──
        else {
          aiReply = `Halo! Saya asisten AI SmartPoultry Anda (Mode Offline). 🐔 \n\n` +
            `Gagal menghubungi asisten cloud, namun saya siap melayani operasional lokal berikut:\n\n` +
            `1. **Pencatatan Harian (NLP)**: *"Catat harian telur 4300 butir, berat 268 kg, pakan 480 kg, ayam mati 1"* \n` +
            `2. **Kesehatan & Feces**: *"Cek suhu dan kesehatan kandang"* \n` +
            `3. **Performa & FCR**: *"Berapa FCR dan efisiensi pakan?"*`;
        }

        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: aiReply,
          timestamp: new Date(),
          isSpecialCard: isSpecial,
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={isMobile ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={isMobile ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={isMobile ? { duration: 0 } : undefined}
            whileHover={isMobile ? {} : { scale: 1.08 }}
            whileTap={isMobile ? {} : { scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#FF9F1C] to-[#e8890a] text-white shadow-xl shadow-[#FF9F1C]/30 flex items-center justify-center cursor-pointer ${
              isMobile ? '' : 'hover:shadow-2xl hover:shadow-[#FF9F1C]/40 transition-shadow'
            }`}
          >
            <MessageCircle className="w-6 h-6" />
            {/* Pulse ring */}
            <span className={`absolute inset-0 rounded-full bg-[#FF9F1C] opacity-20 ${isMobile ? '' : 'animate-ping'}`} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={isMobile ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl shadow-black/10 border border-[#e2e8f0] overflow-hidden ${
              isExpanded 
                ? 'bottom-4 right-4 left-4 top-4 sm:left-auto sm:top-4 sm:w-[520px]' 
                : 'bottom-6 right-6 w-[410px] h-[580px]'
            } ${isMobile ? '' : 'transition-all duration-300'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF9F1C] to-[#FFC107] flex items-center justify-center shadow-md">
                  <Sparkles className="w-4.5 h-4.5 text-[#0f172a]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">SmartPoultry AI Agent</h3>
                  <p className="text-[11px] text-white/60 font-medium flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isMobile ? '' : 'animate-pulse'}`} />
                    Asisten Peternakan Terintegrasi
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`p-2 rounded-lg hover:bg-white/10 cursor-pointer ${isMobile ? '' : 'transition-colors'}`}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-lg hover:bg-white/10 cursor-pointer ${isMobile ? '' : 'transition-colors'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 dashboard-scroll bg-[#f8fafc]">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={isMobile ? { duration: 0 } : { duration: 0.3 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${
                    msg.role === 'assistant' 
                      ? 'bg-gradient-to-br from-[#FF9F1C] to-[#FFC107]' 
                      : 'bg-[#0f172a]'
                  }`}>
                    {msg.role === 'assistant' 
                      ? <Bot className="w-3.5 h-3.5 text-[#0f172a]" /> 
                      : <User className="w-3.5 h-3.5 text-white" />
                    }
                  </div>
                  
                  {/* Bubble */}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'assistant'
                      ? msg.isSpecialCard
                        ? 'bg-gradient-to-br from-amber-50 to-orange-50/50 text-[#1e293b] border-2 border-primary-gold/30 rounded-tl-sm'
                        : 'bg-white text-[#334155] border border-[#e2e8f0] rounded-tl-sm'
                      : 'bg-gradient-to-br from-[#FF9F1C] to-[#e8890a] text-white shadow-md shadow-[#FF9F1C]/15 rounded-tr-sm'
                  }`}>
                    {msg.isSpecialCard && (
                      <div className="flex items-center gap-1.5 text-primary-gold font-bold mb-1.5 uppercase text-[10px] tracking-wider">
                        <Sparkle className={`w-3.5 h-3.5 text-amber-500 ${isMobile ? '' : 'animate-spin'}`} />
                        <span>NLP Database Action Performed</span>
                      </div>
                    )}
                    <div className="space-y-1 font-medium text-[13px]">
                      {renderMarkdown(msg.content, msg.role)}
                    </div>
                    <p className={`text-[10px] mt-2 text-right ${
                      msg.role === 'assistant' ? 'text-[#94a3b8]' : 'text-white/60'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Gemini-style Floating Suggestion Cards */}
              {messages.length === 1 && !isTyping && (
                <div className="mt-6 space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-primary-gold">Template Pertanyaan Cepat</p>
                    <h4 className="text-xs font-bold text-slate-500">Pilih rekomendasi di bawah untuk berinteraksi:</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {SUGGESTIONS.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setInputValue(sug.prompt);
                          inputRef.current?.focus();
                        }}
                        className="flex flex-col text-left p-3.5 bg-white border border-[#e2e8f0] hover:border-[#FF9F1C]/45 hover:shadow-md hover:shadow-[#FF9F1C]/5 rounded-2xl cursor-pointer transition-all duration-200 group space-y-1"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">{sug.icon}</span>
                        <h5 className="text-[12px] font-bold text-slate-800 group-hover:text-primary-gold transition-colors">{sug.title}</h5>
                        <p className="text-[10px] text-slate-500 leading-tight font-medium">{sug.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={isMobile ? { duration: 0 } : undefined}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-br from-[#FF9F1C] to-[#FFC107]">
                    <Bot className="w-3.5 h-3.5 text-[#0f172a]" />
                  </div>
                  <div className="bg-white border border-[#e2e8f0] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className={`w-2 h-2 bg-[#94a3b8] rounded-full ${isMobile ? '' : 'animate-bounce'}`} style={{ animationDelay: '0ms' }} />
                      <span className={`w-2 h-2 bg-[#94a3b8] rounded-full ${isMobile ? '' : 'animate-bounce'}`} style={{ animationDelay: '150ms' }} />
                      <span className={`w-2 h-2 bg-[#94a3b8] rounded-full ${isMobile ? '' : 'animate-bounce'}`} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-[#e2e8f0] bg-white shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-1 dashboard-scroll">
                {[
                  '📊 Analisis FCR & telur',
                  '🩺 Cek suhu & heat stress',
                  '📦 Cek stok pakan',
                  '📅 Jadwal vaksinasi',
                  '✍️ Catat harian otomatis'
                ].map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      if (action.includes('Catat harian')) {
                        setInputValue('Tolong catat harian telur 4350 butir, berat 270 kg, pakan 485 kg, ayam mati 0, feces normal, suhu siang 30');
                      } else {
                        setInputValue(action.replace(/^.{2}\s/, ''));
                      }
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-full bg-[#f1f5f9] hover:bg-[#FF9F1C]/10 hover:text-[#FF9F1C] text-[11px] font-bold text-[#64748b] cursor-pointer border border-transparent hover:border-[#FF9F1C]/20 whitespace-nowrap ${
                      isMobile ? '' : 'transition-colors'
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-[#e2e8f0] bg-white shrink-0">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pertanyaan atau catat harian..."
                  disabled={isTyping}
                  className={`flex-1 bg-[#f1f5f9] border border-[#e2e8f0] rounded-xl px-4 py-2.5 text-sm text-[#334155] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#FF9F1C] focus:ring-2 focus:ring-[#FF9F1C]/15 disabled:opacity-50 font-semibold ${
                    isMobile ? '' : 'transition-all'
                  }`}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF9F1C] to-[#e8890a] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 ${
                    isMobile ? '' : 'hover:shadow-lg hover:shadow-[#FF9F1C]/25 transition-all active:scale-95'
                  }`}
                >
                  {isTyping ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <Send className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
