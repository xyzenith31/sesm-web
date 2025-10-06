import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiDownload, FiZap, FiFileText, FiRefreshCw, FiSave, FiStar } from 'react-icons/fi';

// === DATABASE KONTEN "AI" (SIMULASI) ===

// 1. Paragraf pembuka cerita
const storyStarters = [
  "Di sebuah desa yang tersembunyi di balik pegunungan berkabut, hiduplah seorang anak bernama Elara yang memiliki kemampuan unik: ia bisa berbicara dengan angin. Setiap pagi, angin membisikkan rahasia hutan kepadanya.",
  "Kapal angkasa 'Orion' meluncur menembus keheningan galaksi. Misinya sederhana: menemukan planet baru yang bisa dihuni. Namun, di tengah perjalanan, sebuah sinyal aneh tertangkap oleh radar, berasal dari asteroid yang tak dikenal.",
  "Leo menemukan sebuah jam saku tua di loteng rumah kakeknya. Saat ia memutarnya, bukan suara 'tik-tok' yang terdengar, melainkan seluruh dunia di sekitarnya berhenti bergerak. Hanya Leo yang bisa bergerak bebas.",
  "Di kedalaman samudra, terdapat kota Atlantis yang hilang, diterangi oleh kristal raksasa. Seorang putri duyung muda bernama Coralia merasa bosan dengan kehidupannya yang damai dan bermimpi untuk melihat dunia di atas permukaan.",
];

// 2. Kalimat untuk melanjutkan cerita
const storyContinuations = [
  "Tiba-tiba, sebuah suara misterius memanggil namanya dari kedalaman hutan...",
  "Namun, petualangan mereka baru saja akan dimulai ketika mereka menemukan...",
  "Tanpa mereka sadari, seseorang dengan jubah gelap sedang mengawasi dari kejauhan.",
  "Kejadian tak terduga itu mengubah segalanya.",
  "Sebuah pilihan sulit kini ada di hadapannya: kembali atau melanjutkan perjalanan.",
];


// === Komponen Utama ===

const WritingPage = ({ onNavigate }) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [saveStatus, setSaveStatus] = useState('Tersimpan'); // 'Menyimpan...', 'Tersimpan'

  // Load tulisan dari localStorage saat komponen pertama kali dibuka
  useEffect(() => {
    const savedText = localStorage.getItem('sesm-writing-draft');
    const savedTitle = localStorage.getItem('sesm-writing-title');
    if (savedText) {
      setText(savedText);
    }
    if (savedTitle) {
      setTitle(savedTitle);
    }
  }, []);

  // Simpan tulisan ke localStorage secara otomatis dengan jeda (debounce)
  useEffect(() => {
    setSaveStatus('Menyimpan...');
    const handler = setTimeout(() => {
      localStorage.setItem('sesm-writing-draft', text);
      localStorage.setItem('sesm-writing-title', title);
      setSaveStatus('Tersimpan');
    }, 1000); // Simpan setelah 1 detik tidak mengetik

    return () => {
      clearTimeout(handler);
    };
  }, [text, title]);

  // Fungsi untuk membersihkan semua tulisan
  const clearAll = () => {
    setText('');
    setTitle('');
    localStorage.removeItem('sesm-writing-draft');
    localStorage.removeItem('sesm-writing-title');
  };

  // === FUNGSI "AI" (SIMULASI) ===

  const handleGenerateStory = () => {
    const randomIndex = Math.floor(Math.random() * storyStarters.length);
    setText(storyStarters[randomIndex]);
    setTitle(''); // Hapus judul lama saat cerita baru dibuat
  };

  const handleContinueStory = () => {
    if (text.trim() === '') {
      alert("Mulai tulis sesuatu dulu untuk bisa dilanjutkan oleh AI!");
      return;
    }
    const randomIndex = Math.floor(Math.random() * storyContinuations.length);
    setText(prevText => prevText + " " + storyContinuations[randomIndex]);
  };

  const handleGenerateTitle = () => {
    if (text.trim() === '') {
      alert("Tulis ceritamu dulu, baru AI bisa membuatkan judul!");
      return;
    }
    // "AI" akan mencari kata-kata penting (lebih dari 4 huruf) dan menjadikannya judul
    const stopWords = ['dengan', 'sebuah', 'untuk', 'yang', 'dari', 'namun', 'ketika'];
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    const importantWords = words.filter(word => word.length > 4 && !stopWords.includes(word));
    
    if (importantWords.length < 2) {
        setTitle("Petualangan Ajaib");
        return;
    }
    
    const titleWords = [importantWords[0], importantWords[1]];
    const generatedTitle = titleWords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' dan ');
    setTitle(generatedTitle);
  };
  
  const wordCount = useMemo(() => text.trim() === '' ? 0 : text.trim().split(/\s+/).length, [text]);

  return (
    <div className="w-full h-screen bg-amber-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }} animate={{ y: 0 }}
        className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex justify-between items-center shadow-lg z-20"
      >
        <button onClick={() => onNavigate('creativeZone')} className="p-2 rounded-full text-white hover:bg-white/20"><FiArrowLeft size={24} /></button>
        <div className='flex items-center space-x-2 text-white/80 text-sm'>
            <FiSave size={16} className={saveStatus === 'Menyimpan...' ? 'animate-spin' : ''} />
            <span>{saveStatus}</span>
        </div>
        <button onClick={clearAll} className="p-2 rounded-full text-white hover:bg-white/20"><FiTrash2 size={24} /></button>
      </motion.header>

      {/* Area Menulis Utama */}
      <main className="flex-1 flex flex-col p-4 md:p-8 relative overflow-y-auto">
        <motion.div 
            className="w-full flex-1 flex flex-col bg-white rounded-2xl shadow-inner overflow-hidden"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
            <AnimatePresence>
              {title && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border-b bg-gray-50"
                >
                  <h2 className="text-xl font-bold text-center text-sesm-deep">{title}</h2>
                </motion.div>
              )}
            </AnimatePresence>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-full p-6 text-gray-800 text-lg leading-relaxed resize-none focus:outline-none placeholder:text-gray-400"
                placeholder="Mulai tulis ceritamu atau minta bantuan AI ✨"
            />
            <div className="p-3 bg-gray-50 text-right text-sm text-gray-500 font-semibold border-t">
                {wordCount} Kata
            </div>
        </motion.div>
      </main>
      
      {/* Toolbar AI Bawah */}
      <motion.footer 
        className="p-4 pt-2"
        initial={{ y: 100 }} animate={{ y: 0 }} transition={{ delay: 0.2 }}
      >
        <div className='bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-lg border'>
          <p className="text-center text-xs font-bold text-gray-500 mb-2">Didukung oleh AI ✨</p>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={handleGenerateStory} className="flex flex-col items-center p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200">
              <FiZap size={20}/>
              <span className="text-xs font-semibold mt-1">Buat Cerita</span>
            </button>
            <button onClick={handleContinueStory} className="flex flex-col items-center p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200">
              <FiRefreshCw size={20}/>
              <span className="text-xs font-semibold mt-1">Lanjutkan</span>
            </button>
            <button onClick={handleGenerateTitle} className="flex flex-col items-center p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200">
              <FiStar size={20}/>
              <span className="text-xs font-semibold mt-1">Buat Judul</span>
            </button>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default WritingPage;