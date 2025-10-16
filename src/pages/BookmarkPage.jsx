import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiVideo,
  FiBookOpen,
  FiFileText,
  FiSearch,
  FiTag,
  FiLayout,
  FiRefreshCw,
  FiLoader,
  FiAlertCircle,
  FiClipboard
} from 'react-icons/fi';
import MaterialDetailModal from '../components/mod/MaterialDetailModal';
import BookmarkService from '../services/bookmarkService';

// Komponen Card Materi (tidak berubah dari sebelumnya)
const MaterialCard = ({ material, onSelect }) => {
    const API_URL = 'http://localhost:8080';
    const typeInfo = {
        video_link: { icon: FiVideo, label: 'Video', color: 'bg-red-500' },
        video: { icon: FiVideo, label: 'Video', color: 'bg-red-500' },
        image: { icon: FiBookOpen, label: 'Gambar', color: 'bg-blue-500' },
        pdf: { icon: FiFileText, label: 'PDF', color: 'bg-green-500' },
        document: { icon: FiFileText, label: 'Dokumen', color: 'bg-purple-500' },
        file: { icon: FiFileText, label: 'File', color: 'bg-gray-500' },
    };
    const { icon: Icon, label, color } = typeInfo[material.type] || typeInfo.file;
    const imageUrl = material.cover_image_url ? `${API_URL}/${material.cover_image_url}` : 'https://images.pexels.com/photos/3747505/pexels-photo-3747505.jpeg?auto=compress&cs=tinysrgb&w=600';
    return (
        <motion.div onClick={() => onSelect(material)} className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group break-inside-avoid border" whileHover={{ y: -8, boxShadow: "0px 20px 30px -10px rgba(0,0,0,0.1)" }} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <div className="relative h-40 overflow-hidden">
                <img src={imageUrl} alt={material.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className={`absolute top-2 right-2 flex items-center space-x-1.5 text-white text-xs font-bold py-1 px-2 rounded-full ${color}`}><Icon size={14} /><span>{label}</span></div>
            </div>
            <div className="p-4">
                <span className="text-xs font-semibold text-sesm-teal bg-sesm-teal/10 px-2 py-1 rounded-full">{material.subject}</span>
                <h3 className="font-bold text-md text-sesm-deep leading-tight group-hover:text-sesm-teal transition-colors mt-2">{material.title}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{material.description}</p>
            </div>
        </motion.div>
    );
};


// Komponen Kartu Riwayat Nilai (BARU)
const HistoryCard = ({ item }) => (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
        <div>
            <p className="font-bold text-gray-800">{item.title}</p>
            <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="text-right">
            <p className={`font-bold text-2xl ${item.score === null ? 'text-gray-400' : 'text-sesm-teal'}`}>{item.score ?? '...'}</p>
            <p className={`text-xs font-semibold capitalize ${item.status === 'dinilai' ? 'text-green-600' : 'text-yellow-600'}`}>{item.status}</p>
        </div>
    </motion.div>
);

// Helper lain (tidak berubah)
const FilterButton = ({ label, icon: Icon, isActive, onClick, className = '' }) => ( <motion.button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm ${ isActive ? 'bg-sesm-deep text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'} ${className}`} whileTap={{scale: 0.95}}>{Icon && <Icon size={16} />}<span>{label}</span></motion.button> );
const EmptyState = ({message}) => ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center col-span-full py-16"><FiSearch size={48} className="mx-auto text-gray-300" /><h3 className="mt-4 text-lg font-semibold text-gray-700">{message}</h3></motion.div> );
const SectionHeader = ({ title, count }) => ( <div className="flex items-center space-x-2 mb-4 px-2"><h2 className="text-xl font-bold text-gray-800">{title}</h2><span className="bg-sesm-sky/20 text-sesm-deep text-xs font-bold px-2 py-0.5 rounded-full">{count}</span></div> );


const BookmarkPage = () => {
    const [activeTab, setActiveTab] = useState('materi');
    const [materials, setMaterials] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTypeFilter, setActiveTypeFilter] = useState('semua');
    const [activeSubjectFilter, setActiveSubjectFilter] = useState('Semua');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [materialsRes, historyRes] = await Promise.all([
                BookmarkService.getAllBookmarks(),
                BookmarkService.getMySubmissions()
            ]);
            setMaterials(materialsRes.data);
            setHistory(historyRes.data);
        } catch (err) {
            setError("Gagal memuat data dari server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const subjects = useMemo(() => ['Semua', ...Array.from(new Set(materials.map(m => m.subject).filter(Boolean)))], [materials]);
    const types = useMemo(() => ['semua', ...Array.from(new Set(materials.map(m => m.type)))], [materials]);

    const filteredMaterials = useMemo(() => {
        return materials
            .filter(m => activeTypeFilter === 'semua' || m.type === activeTypeFilter)
            .filter(m => activeSubjectFilter === 'Semua' || m.subject === activeSubjectFilter)
            .filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [materials, searchTerm, activeTypeFilter, activeSubjectFilter]);

    const resetFilters = () => {
      setSearchTerm('');
      setActiveTypeFilter('semua');
      setActiveSubjectFilter('Semua');
    };
    const isFilterActive = searchTerm !== '' || activeTypeFilter !== 'semua' || activeSubjectFilter !== 'Semua';
    useEffect(() => {
        document.body.style.overflow = selectedMaterial ? 'hidden' : 'unset';
    }, [selectedMaterial]);
    
    const handleCloseModal = () => {
        setSelectedMaterial(null);
        fetchData(); // Muat ulang data setelah modal ditutup, untuk update riwayat
    };

    const renderContent = () => {
        if (loading) return <div className="col-span-full flex justify-center py-16"><FiLoader className="animate-spin text-3xl text-sesm-teal" /></div>;
        if (error) return <div className="col-span-full text-center py-16 text-red-500"><FiAlertCircle size={48} className="mx-auto" /><p className="mt-4">{error}</p></div>;

        if (activeTab === 'materi') {
            if (filteredMaterials.length === 0) return <EmptyState message="Materi tidak ditemukan"/>;
            return (
                <motion.section layout className="w-full">
                    <div className="columns-1 sm:columns-2 lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-6 space-y-6 lg:space-y-0">
                        {filteredMaterials.map(material => (<MaterialCard key={material.id} material={material} onSelect={setSelectedMaterial} />))}
                    </div>
                </motion.section>
            );
        }

        if (activeTab === 'nilai') {
            if (history.length === 0) return <EmptyState message="Belum ada riwayat pengerjaan"/>;
            return <div className="space-y-4"><SectionHeader title="Riwayat Nilai" count={history.length}/>{history.map(item => <HistoryCard key={item.id} item={item} />)}</div>;
        }
    };

    return (
        <>
            <AnimatePresence>
                {selectedMaterial && <MaterialDetailModal material={selectedMaterial} onClose={handleCloseModal} />}
            </AnimatePresence>
            
            <div className="md:hidden">
              <div className="min-h-screen bg-gray-100 flex flex-col">
                <header className="bg-gradient-to-br from-sesm-teal to-sesm-deep text-white p-4 pt-8 sticky top-0 z-10 shadow-lg rounded-b-2xl space-y-4">
                    <h1 className="text-xl font-bold text-center">Bookmark</h1>
                    <div className="flex items-center bg-black/20 rounded-full p-1">
                        <button onClick={() => setActiveTab('materi')} className={`w-1/2 py-2 text-sm font-bold rounded-full ${activeTab === 'materi' ? 'bg-white text-sesm-deep' : 'text-white/80'}`}><FiBookOpen className="inline mr-1"/> Materi</button>
                        <button onClick={() => setActiveTab('nilai')} className={`w-1/2 py-2 text-sm font-bold rounded-full ${activeTab === 'nilai' ? 'bg-white text-sesm-deep' : 'text-white/80'}`}><FiClipboard className="inline mr-1"/> Nilai</button>
                    </div>
                </header>
                <main className="flex-grow p-4 pb-28">
                    {activeTab === 'materi' && <div className="relative mb-4"><FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Cari judul..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border rounded-full py-2 pl-10 pr-4"/></div>}
                    {renderContent()}
                </main>
              </div>
            </div>

            <div className="hidden md:flex flex-col h-screen bg-gray-100 p-8">
                <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow bg-white p-8 rounded-2xl shadow-xl overflow-hidden">
                    <header className="w-full flex-shrink-0 flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold text-sesm-deep tracking-wider">Bookmark</h1>
                        <div className="flex items-center bg-gray-100 rounded-full p-1">
                            <button onClick={() => setActiveTab('materi')} className={`px-5 py-2 text-sm font-semibold rounded-full ${activeTab === 'materi' ? 'bg-white shadow' : ''}`}>Daftar Materi</button>
                            <button onClick={() => setActiveTab('nilai')} className={`px-5 py-2 text-sm font-semibold rounded-full ${activeTab === 'nilai' ? 'bg-white shadow' : ''}`}>Riwayat & Nilai</button>
                        </div>
                    </header>
                    <main className="flex-grow w-full overflow-y-auto pr-4">
                         {activeTab === 'materi' && (
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center space-x-3">{types.map(type => ( <FilterButton key={type} label={type.replace(/_/g, ' ')} isActive={activeTypeFilter === type} onClick={() => setActiveTypeFilter(type)} /> ))}
                                    <AnimatePresence>{isFilterActive && (<motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}><FilterButton label="Reset" icon={FiRefreshCw} onClick={resetFilters} className="!bg-red-500/10 !text-red-600 hover:!bg-red-500/20" /></motion.div>)}</AnimatePresence>
                                </div>
                                <div className="relative">
                                    <select value={activeSubjectFilter} onChange={(e) => setActiveSubjectFilter(e.target.value)} className="appearance-none bg-white border rounded-full py-2 pl-4 pr-10 font-semibold">{subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select>
                                    <FiTag className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                         )}
                        {renderContent()}
                    </main>
                </div>
            </div>
        </>
    );
};

export default BookmarkPage;