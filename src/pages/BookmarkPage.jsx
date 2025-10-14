import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiVideo,
  FiBookOpen,
  FiFileText,
  FiSearch,
  FiTag,
  FiLayout,
  FiRefreshCw
} from 'react-icons/fi';
import MaterialDetailModal from '../components/MaterialDetailModal';

// Data dummy yang diperbarui tanpa properti 'pinned'
const dummyMaterials = [
    {
        id: 1, type: 'video', title: 'Video Tutorial Perkalian Dasar',
        description: 'Konsep perkalian dengan animasi seru.',
        imageUrl: 'https://images.pexels.com/photos/54632/calc-calculator-math-study-54632.jpeg?auto=compress&cs=tinysrgb&w=600',
        url: 'https://www.youtube.com/watch?v=5_fO_q1i_sA',
        subject: 'Matematika',
        tasks: [
            '1. Berapa hasil dari 7 x 6?',
            '2. Apa yang dimaksud dengan perkalian sebagai penjumlahan berulang?',
            '3. Jika ada 5 kantong dan setiap kantong berisi 4 kelereng, berapa total kelereng?',
            '4. Buatlah soal ceritamu sendiri tentang perkalian!',
            '5. Berapa hasil dari 9 x 9?'
        ],
        completedTasks: 2,
    },
    {
        id: 2, type: 'buku', title: 'Buku Cerita: Si Kancil',
        description: 'Buku digital interaktif untuk melatih membaca.',
        imageUrl: 'https://images.unsplash.com/photo-1593340523736-2a663953f9e4?w=500&auto=format&fit=crop&q=60',
        subject: 'B.Indo',
        tasks: [
            '1. Sebutkan sifat baik dari tokoh Si Kancil!',
            '2. Siapa tokoh yang menjadi lawan Si Kancil dalam cerita?'
        ],
        completedTasks: 1,
    },
    {
        id: 3, type: 'modul', title: 'Modul Latihan Puisi',
        description: 'Kumpulan latihan membuat puisi dan majas.',
        imageUrl: 'https://images.unsplash.com/photo-1524995767962-b1f09defa2a3?w=500&auto=format&fit=crop&q=60',
        subject: 'B.Indo',
        tasks: [
            '1. Buatlah satu bait puisi tentang alam.',
            '2. Apa yang dimaksud dengan majas personifikasi?'
        ],
        completedTasks: 0,
    },
    {
        id: 4, type: 'video', title: 'Video Sejarah Kemerdekaan',
        description: 'Film pendek tentang perjuangan pahlawan.',
        imageUrl: 'https://images.unsplash.com/photo-1557471885-d9124343e578?w=500&auto=format&fit=crop&q=60',
        url: 'https://www.youtube.com/watch?v=O5fW3a-1RNE',
        subject: 'IPS',
        tasks: [
            '1. Sebutkan satu pahlawan yang kamu kagumi dari video ini!',
            '2. Kapan Proklamasi Kemerdekaan Indonesia dibacakan?'
        ],
        completedTasks: 2,
    },
    {
        id: 5, type: 'buku', title: 'Atlas Dunia untuk Anak',
        description: 'Mengenal benua dan negara-negara di dunia.',
        imageUrl: 'https://images.unsplash.com/photo-1588421323985-781335136894?w=500&auto=format&fit=crop&q=60',
        subject: 'IPS',
        tasks: [
            '1. Tuliskan nama ibukota dari negara Australia!',
            '2. Sebutkan 3 negara yang berada di benua Asia!'
        ],
        completedTasks: 0,
    },
    {
        id: 6, type: 'modul', title: 'Panduan Menggambar Hewan',
        description: 'Langkah-langkah mudah menggambar hewan.',
        imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&auto=format&fit=crop&q=60',
        subject: 'Seni Budaya',
        tasks: [
            '1. Coba gambar seekor kucing berdasarkan panduan!',
            '2. Sebutkan 3 warna yang bisa digunakan untuk mewarnai jerapah!'
        ],
        completedTasks: 1,
    },
];

const subjects = ['Semua', 'Matematika', 'B.Indo', 'IPS', 'IPA', 'Seni Budaya'];

// Komponen Kartu Materi yang Diperbarui (tanpa tombol pin)
const MaterialCard = ({ material, onSelect }) => {
    const typeInfo = {
        video: { icon: FiVideo, label: 'Video', color: 'bg-red-500' },
        buku: { icon: FiBookOpen, label: 'Buku', color: 'bg-blue-500' },
        modul: { icon: FiFileText, label: 'Modul', color: 'bg-green-500' },
    };
    const { icon: Icon, label, color } = typeInfo[material.type];
    const progress = material.tasks.length > 0 ? (material.completedTasks / material.tasks.length) * 100 : 0;

    return (
        <motion.div
            onClick={() => onSelect(material)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group break-inside-avoid border border-gray-200/50"
            whileHover={{ y: -8, boxShadow: "0px 20px 30px -10px rgba(0,0,0,0.15)" }}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="relative h-40 overflow-hidden">
                <img src={material.imageUrl} alt={material.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className={`absolute top-2 right-2 flex items-center space-x-1.5 text-white text-xs font-bold py-1 px-2 rounded-full ${color}`}>
                    <Icon size={14} />
                    <span>{label}</span>
                </div>
            </div>
            <div className="p-4">
                <span className="text-xs font-semibold text-sesm-teal bg-sesm-teal/10 px-2 py-1 rounded-full">{material.subject}</span>
                <h3 className="font-bold text-md text-sesm-deep leading-tight group-hover:text-sesm-teal transition-colors mt-2">{material.title}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{material.description}</p>
                {material.tasks.length > 0 && (
                    <div className="mt-3">
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                            <span>Progress Tugas</span>
                            <span>{material.completedTasks}/{material.tasks.length}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <motion.div
                                className="bg-sesm-sky h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Tombol Filter yang diperbarui
const FilterButton = ({ label, icon: Icon, isActive, onClick, className = '' }) => (
    <motion.button
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm ${
            isActive ? 'bg-sesm-deep text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'
        } ${className}`}
        whileTap={{scale: 0.95}}
    >
        {Icon && <Icon size={16} />}
        <span>{label}</span>
    </motion.button>
);
// Tampilan State Kosong
const EmptyState = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center col-span-full py-16"
    >
        <FiSearch size={48} className="mx-auto text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-700">Materi Tidak Ditemukan</h3>
        <p className="mt-1 text-sm text-gray-500">Coba ubah kata kunci pencarian atau filter Anda.</p>
    </motion.div>
);
// Judul Seksi dengan Counter
const SectionHeader = ({ title, count }) => (
    <div className="flex items-center space-x-2 mb-4 px-2">
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      <span className="bg-sesm-sky/20 text-sesm-deep text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
    </div>
);

const BookmarkPage = () => {
    const [materials, setMaterials] = useState(dummyMaterials.map(({ pinned, ...rest }) => rest));
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTypeFilter, setActiveTypeFilter] = useState('semua');
    const [activeSubjectFilter, setActiveSubjectFilter] = useState('Semua');
    const [selectedMaterial, setSelectedMaterial] = useState(null);

    const resetFilters = () => {
      setSearchTerm('');
      setActiveTypeFilter('semua');
      setActiveSubjectFilter('Semua');
    }

    const isFilterActive = searchTerm !== '' || activeTypeFilter !== 'semua' || activeSubjectFilter !== 'Semua';

    const filteredMaterials = useMemo(() => {
        return materials
            .filter(m => activeTypeFilter === 'semua' || m.type === activeTypeFilter)
            .filter(m => activeSubjectFilter === 'Semua' || m.subject === activeSubjectFilter)
            .filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [materials, searchTerm, activeTypeFilter, activeSubjectFilter]);

    useEffect(() => {
        document.body.style.overflow = selectedMaterial ? 'hidden' : 'unset';
    }, [selectedMaterial]);

    const renderContent = (materialsToRender) => {
      const hasMaterials = materialsToRender.length > 0;
      return hasMaterials ? (
          <motion.section layout className="w-full">
            <SectionHeader title="Materi" count={materialsToRender.length} />
            <div className="columns-1 sm:columns-2 lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-6 space-y-6 lg:space-y-0">
              <AnimatePresence>
                {materialsToRender.map(material => (
                  <MaterialCard 
                    key={material.id} 
                    material={material} 
                    onSelect={setSelectedMaterial} 
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.section>
      ) : <EmptyState />;
    };

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
            
            {/* Tampilan Mobile */}
            <div className="md:hidden">
              <div className="min-h-screen bg-gray-100 flex flex-col">
                <header className="bg-gradient-to-br from-sesm-teal to-sesm-deep text-white p-4 pt-8 sticky top-0 z-10 shadow-lg space-y-4 rounded-b-2xl">
                  <h1 className="text-xl font-bold text-center">Bank Materi</h1>
                  <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70" />
                    <input type="text" placeholder="Cari judul materi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white/20 border border-white/30 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white placeholder:text-white/70"/>
                  </div>
                </header>
                <main className="flex-grow overflow-y-auto p-4 pb-28">
                  <div className="flex justify-center space-x-2 mb-6">
                      <FilterButton label="Semua" isActive={activeTypeFilter === 'semua'} onClick={() => setActiveTypeFilter('semua')} />
                      <FilterButton label="Video" isActive={activeTypeFilter === 'video'} onClick={() => setActiveTypeFilter('video')} />
                      <FilterButton label="Buku" isActive={activeTypeFilter === 'buku'} onClick={() => setActiveTypeFilter('buku')} />
                      <FilterButton label="Modul" isActive={activeTypeFilter === 'modul'} onClick={() => setActiveTypeFilter('modul')} />
                  </div>
                  {renderContent(filteredMaterials)}
                </main>
              </div>
            </div>

            {/* Tampilan Desktop (Struktur Diperbarui) */}
            <div className="hidden md:flex flex-col h-screen bg-gray-100 p-8">
                <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow bg-white p-8 rounded-2xl shadow-xl overflow-hidden">
                    <header className="w-full flex-shrink-0 flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold text-sesm-deep tracking-wider">Bank Materi</h1>
                        <div className="relative w-1/3">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Cari materi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-300 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-sesm-deep"/>
                        </div>
                    </header>

                    <main className="flex-grow w-full overflow-y-auto pr-4">
                        <div className="flex items-start justify-between mb-8">
                            <div className="flex items-center space-x-3">
                                <FilterButton label="Semua Tipe" icon={FiLayout} isActive={activeTypeFilter === 'semua'} onClick={() => setActiveTypeFilter('semua')} />
                                <FilterButton label="Video" icon={FiVideo} isActive={activeTypeFilter === 'video'} onClick={() => setActiveTypeFilter('video')} />
                                <FilterButton label="Buku" icon={FiBookOpen} isActive={activeTypeFilter === 'buku'} onClick={() => setActiveTypeFilter('buku')} />
                                <FilterButton label="Modul" icon={FiFileText} isActive={activeTypeFilter === 'modul'} onClick={() => setActiveTypeFilter('modul')} />
                                <AnimatePresence>
                                {isFilterActive && (
                                    <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.8}}>
                                        <FilterButton label="Reset" icon={FiRefreshCw} onClick={resetFilters} className="!bg-red-500/10 !text-red-600 hover:!bg-red-500/20" />
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                            <div className="relative">
                                <select 
                                    value={activeSubjectFilter} 
                                    onChange={(e) => setActiveSubjectFilter(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-full py-2 pl-4 pr-10 font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-sesm-deep"
                                >
                                    {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                                </select>
                                <FiTag className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        
                        {renderContent(filteredMaterials)}

                    </main>
                </div>
            </div>
        </>
    );
};

export default BookmarkPage;