import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

// Data contoh untuk entri harian yang sudah ada
const previousEntries = [
  {
    date: "3 Oktober 2025",
    content: "Hari ini aku belajar tentang perkalian di sekolah. Awalnya susah, tapi setelah latihan di SESM jadi lebih mengerti! Besok mau coba lagi ah."
  },
  {
    date: "2 Oktober 2025",
    content: "Pelajaran IPS tentang peta Indonesia seru sekali. Aku jadi tahu letak pulau Bali dan Sumatera. Kapan-kapan ingin liburan ke sana."
  },
];

// Komponen untuk setiap entri sebelumnya
const DiaryEntry = ({ date, content }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm w-full">
    <p className="text-xs font-bold text-sesm-deep mb-1">{date}</p>
    <p className="text-sm text-gray-700">{content}</p>
  </div>
);

const DiaryPage = ({ onNavigate }) => {
  const [newEntry, setNewEntry] = useState('');
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleSave = () => {
    if (newEntry.trim() === '') {
        alert('Tulisan tidak boleh kosong!');
        return;
    }
    // Di aplikasi nyata, fungsi ini akan mengirim 'newEntry' ke database.
    // Untuk sekarang, kita hanya tampilkan notifikasi.
    alert('Catatan harian berhasil disimpan!');
    setNewEntry('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Halaman */}
      <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => onNavigate('profile')} className="p-2 rounded-full hover:bg-gray-100">
          <FiArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep">Buku Harian Saya</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      {/* Konten Utama */}
      <main className="flex-grow overflow-y-auto p-6 space-y-6">
        {/* Area Menulis Catatan Baru */}
        <div className="bg-white p-5 rounded-xl shadow-md">
            <p className="font-bold text-gray-800">Catatan untuk hari ini</p>
            <p className="text-xs text-gray-500 mb-3">{today}</p>
            <textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                placeholder="Apa yang kamu rasakan atau pelajari hari ini?"
            ></textarea>
            <motion.button
                onClick={handleSave}
                className="w-full mt-3 flex items-center justify-center space-x-2 bg-sesm-deep text-white font-bold py-3 rounded-lg shadow-lg hover:bg-opacity-90"
                whileTap={{ scale: 0.95 }}
            >
                <FiSave />
                <span>Simpan Catatan</span>
            </motion.button>
        </div>

        {/* Daftar Catatan Sebelumnya */}
        <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">Catatan Sebelumnya</h2>
            <div className="space-y-4">
                {previousEntries.map((entry, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 }}
                    >
                        <DiaryEntry {...entry} />
                    </motion.div>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
};

export default DiaryPage;