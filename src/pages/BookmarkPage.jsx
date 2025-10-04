import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiVideo, 
  FiBookOpen, 
  FiFileText,
  FiStar,
  FiSearch
} from 'react-icons/fi';
import MaterialDetailModal from '../components/MaterialDetailModal'; 

const dummyMaterials = [
  { 
    id: 1, type: 'video', title: 'Video Tutorial Perkalian Dasar', 
    description: 'Konsep perkalian dengan animasi seru.',
    imageUrl: 'https://images.pexels.com/photos/54632/calc-calculator-math-study-54632.jpeg?auto=compress&cs=tinysrgb&w=600',
    url: 'https://www.youtube.com/watch?v=5_fO_q1i_sA',
    pinned: true,
    tasks: [ 
      '1. Berapa hasil dari 7 x 6?',
      '2. Apa yang dimaksud dengan perkalian sebagai penjumlahan berulang?',
      '3. Jika ada 5 kantong dan setiap kantong berisi 4 kelereng, berapa total kelereng?',
      '4. Buatlah soal ceritamu sendiri tentang perkalian!',
      '5. Berapa hasil dari 9 x 9?'
    ]
  },
  { 
    id: 2, type: 'buku', title: 'Buku Cerita: Si Kancil', 
    description: 'Buku digital interaktif untuk melatih membaca.',
    imageUrl: 'https://images.unsplash.com/photo-1593340523736-2a663953f9e4?w=500&auto=format&fit=crop&q=60', 
    pinned: false,
    tasks: [
        '1. Sebutkan sifat baik dari tokoh Si Kancil!',
        '2. Siapa tokoh yang menjadi lawan Si Kancil dalam cerita?'
    ]
  },
  { 
    id: 3, type: 'modul', title: 'Modul Latihan Puisi', 
    description: 'Kumpulan latihan membuat puisi dan majas.',
    imageUrl: 'https://images.unsplash.com/photo-1524995767962-b1f09defa2a3?w=500&auto=format&fit=crop&q=60', 
    pinned: true,
    tasks: [
        '1. Buatlah satu bait puisi tentang alam.',
        '2. Apa yang dimaksud dengan majas personifikasi?'
    ]
  },
  { 
    id: 4, type: 'video', title: 'Video Sejarah Kemerdekaan', 
    description: 'Film pendek tentang perjuangan pahlawan.',
    imageUrl: 'https://images.unsplash.com/photo-1557471885-d9124343e578?w=500&auto=format&fit=crop&q=60',
    url: 'https://www.youtube.com/watch?v=O5fW3a-1RNE',
    pinned: false,
    tasks: [
        '1. Sebutkan satu pahlawan yang kamu kagumi dari video ini!',
        '2. Kapan Proklamasi Kemerdekaan Indonesia dibacakan?'
    ]
  },
  { 
    id: 5, type: 'buku', title: 'Atlas Dunia untuk Anak', 
    description: 'Mengenal benua dan negara-negara di dunia.',
    imageUrl: 'https://images.unsplash.com/photo-1588421323985-781335136894?w=500&auto=format&fit=crop&q=60', 
    pinned: false,
    tasks: [
        '1. Tuliskan nama ibukota dari negara Australia!',
        '2. Sebutkan 3 negara yang berada di benua Asia!'
    ]
  },
  { 
    id: 6, type: 'modul', title: 'Panduan Menggambar Hewan', 
    description: 'Langkah-langkah mudah menggambar hewan.',
    imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&auto=format&fit=crop&q=60', 
    pinned: false,
    tasks: [
        '1. Coba gambar seekor kucing berdasarkan panduan!',
        '2. Sebutkan 3 warna yang bisa digunakan untuk mewarnai jerapah!'
    ]
  },
];

const MaterialCard = ({ material, onPinToggle, onSelect }) => {
    const typeInfo = {
        video: { icon: FiVideo, label: 'Video', color: 'bg-red-500' },
        buku: { icon: FiBookOpen, label: 'Buku', color: 'bg-blue-500' },
        modul: { icon: FiFileText, label: 'Modul', color: 'bg-green-500' },
    };
    const { icon: Icon, label, color } = typeInfo[material.type];
    const handlePinClick = (e) => { e.stopPropagation(); onPinToggle(material.id); };

    return (
        <motion.div 
            onClick={() => onSelect(material)} 
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group" 
            whileHover={{ y: -8, boxShadow: "0px 20px 30px -10px rgba(0,0,0,0.15)" }} 
            layout 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }} 
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="relative">
                <img src={material.imageUrl} alt={material.title} className="w-full h-32 object-cover" />
                <div className={`absolute top-2 right-2 flex items-center space-x-1.5 text-white text-xs font-bold py-1 px-2 rounded-full ${color}`}>
                    <Icon size={14} />
                    <span>{label}</span>
                </div>
                <button onClick={handlePinClick} className="absolute top-2 left-2 bg-black/30 p-1.5 rounded-full text-white hover:bg-black/50 transition-colors">
                    <FiStar size={16} className={`transition-all ${material.pinned ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`} />
                </button>
            </div>
            <div className="p-4">
                <h3 className="font-bold text-md text-sesm-deep leading-tight group-hover:text-sesm-teal transition-colors">{material.title}</h3>
                <p className="text-xs text-gray-600 mt-1">{material.description}</p>
            </div>
        </motion.div>
    );
};

const FilterButton = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            isActive ? 'bg-sesm-deep text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
    >
        {label}
    </button>
);

const BookmarkPage = () => {
  const [materials, setMaterials] = useState(dummyMaterials);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('semua');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  
  const togglePin = (id) => {
    setMaterials(materials.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m));
  };
 
  const filteredMaterials = useMemo(() => {
    return materials
      .filter(m => activeFilter === 'semua' || m.type === activeFilter)
      .filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [materials, searchTerm, activeFilter]);

  const pinnedMaterials = filteredMaterials.filter(m => m.pinned);
  const otherMaterials = filteredMaterials.filter(m => !m.pinned);
  
  useEffect(() => {
    document.body.style.overflow = selectedMaterial ? 'hidden' : 'unset';
  }, [selectedMaterial]);

  return (
    <>
      <AnimatePresence>
        {selectedMaterial && (
          <MaterialDetailModal
            material={selectedMaterial}
            onClose={() => setSelectedMaterial(null)}
          />
        )}
      </AnimatePresence>

      <div className="md:hidden">
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <header className="bg-white p-4 pt-8 sticky top-0 z-10 shadow-sm space-y-4">
            <h1 className="text-xl font-bold text-center text-sesm-deep">Bank Materi</h1>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Cari judul materi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-sesm-teal"/>
            </div>
          </header>
          <main className="flex-grow overflow-y-auto p-4 pb-28">
            <div className="flex justify-center space-x-2 mb-6">
                <FilterButton label="Semua" isActive={activeFilter === 'semua'} onClick={() => setActiveFilter('semua')} />
                <FilterButton label="Video" isActive={activeFilter === 'video'} onClick={() => setActiveFilter('video')} />
                <FilterButton label="Buku" isActive={activeFilter === 'buku'} onClick={() => setActiveFilter('buku')} />
                <FilterButton label="Modul" isActive={activeFilter === 'modul'} onClick={() => setActiveFilter('modul')} />
            </div>
            <AnimatePresence>
              {pinnedMaterials.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 px-2">Materi yang Dipin</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {pinnedMaterials.map(material => ( <MaterialCard key={material.id} material={material} onPinToggle={togglePin} onSelect={setSelectedMaterial} /> ))}
                  </div>
                </section>
              )}
            </AnimatePresence>
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3 px-2">Semua Materi</h2>
              <div className="grid grid-cols-2 gap-4">
                <AnimatePresence>
                  {otherMaterials.map(material => ( <MaterialCard key={material.id} material={material} onPinToggle={togglePin} onSelect={setSelectedMaterial} /> ))}
                </AnimatePresence>
              </div>
            </section>
          </main>
        </div>
      </div>
     
      <div className="hidden md:flex flex-col p-8 min-h-screen bg-gray-100">
        <header className="w-full flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-sesm-deep tracking-wider">Bank Materi</h1>
            <div className="relative w-1/3">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Cari materi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-300 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-sesm-deep"/>
            </div>
        </header>
        <main className="flex-grow w-full">
            <div className="flex space-x-3 mb-8">
                <FilterButton label="Semua Materi" isActive={activeFilter === 'semua'} onClick={() => setActiveFilter('semua')} />
                <FilterButton label="Video" isActive={activeFilter === 'video'} onClick={() => setActiveFilter('video')} />
                <FilterButton label="Buku" isActive={activeFilter === 'buku'} onClick={() => setActiveFilter('buku')} />
                <FilterButton label="Modul" isActive={activeFilter === 'modul'} onClick={() => setActiveFilter('modul')} />
            </div>
            <AnimatePresence>
              {pinnedMaterials.length > 0 && (
                  <section className="mb-10">
                      <h2 className="text-2xl font-bold text-gray-800 mb-4">Materi yang Dipin</h2>
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {pinnedMaterials.map(material => ( <MaterialCard key={material.id} material={material} onPinToggle={togglePin} onSelect={setSelectedMaterial} /> ))}
                      </div>
                  </section>
              )}
            </AnimatePresence>
            <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Semua Materi</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {otherMaterials.map(material => ( <MaterialCard key={material.id} material={material} onPinToggle={togglePin} onSelect={setSelectedMaterial} /> ))}
                  </AnimatePresence>
                </div>
            </section>
        </main>
      </div>
    </>
  );
};

export default BookmarkPage;