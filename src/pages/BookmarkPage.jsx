// contoh-sesm-web/pages/BookmarkPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiVideo, FiBookOpen, FiFileText, FiSearch, FiTag, FiRefreshCw, FiLoader,
  FiAlertCircle, FiClipboard, FiBook, FiX, FiCheckCircle, FiClock,
  FiExternalLink, FiFilter, FiList, FiGrid, FiArrowUp, FiArrowDown, FiCalendar,
  FiBookmark, FiCheckSquare, FiXCircle
} from 'react-icons/fi';
import MaterialDetailModal from '../components/mod/MaterialDetailModal'; // Modal untuk detail/mengerjakan materi
import BookmarkService from '../services/bookmarkService';
import Notification from '../components/ui/Notification'; // Pastikan path benar
import CustomSelect from '../components/ui/CustomSelect'; // Pastikan path benar

// --- KOMPONEN SubmissionResultModal DIDEFINISIKAN DI SINI ---
const SubmissionResultModal = ({ submission, onClose }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:8080'; // Pastikan base URL API benar

    useEffect(() => {
        if (submission) {
            setLoading(true);
            // ✅ **PERBAIKAN ERROR NAMA FUNGSI DI SINI**
            BookmarkService.getStudentSubmissionDetails(submission.id) // Menggunakan nama fungsi yang benar
                .then(res => setDetails(res.data))
                .catch(err => console.error("Gagal memuat detail nilai:", err))
                .finally(() => setLoading(false));
        }
    }, [submission]);

    const getGraderInfo = () => {
        if (!submission.grader_name) return null;
        const graderAvatar = submission.grader_avatar
          ? (submission.grader_avatar.startsWith('http') ? submission.grader_avatar : `${API_URL}/${submission.grader_avatar}`)
          : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(submission.grader_name)}`;
        return (
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <img src={graderAvatar} alt={submission.grader_name} className="w-5 h-5 rounded-full object-cover"/>
                <span>Dinilai oleh: <strong>{submission.grader_name}</strong></span>
            </div>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[85vh]">
                <header className="p-5 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-sesm-deep">Hasil Pengerjaan</h3>
                        <p className="text-sm text-gray-500">{submission.title}</p>
                         {getGraderInfo()}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX/></button>
                </header>
                <main className="flex-grow overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl"/></div>
                    ) : (
                        <div className="space-y-4">
                            {details.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">Detail jawaban tidak tersedia.</p>
                            ) : details.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-lg border">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-gray-800 flex-grow pr-4">{item.question_index + 1}. {item.question_text}</p>
                                        {item.is_correct === true && <FiCheckCircle className="text-green-500 text-2xl" title="Benar"/>}
                                        {item.is_correct === false && <FiXCircle className="text-red-500 text-2xl" title="Salah"/>}
                                        {item.is_correct === null && <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">Esai</span>}
                                    </div>
                                    <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                        <p className="text-xs font-semibold text-blue-800">Jawaban Kamu:</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.answer_text || "(Tidak dijawab)"}</p>
                                    </div>
                                    {item.correction_text && (
                                        <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                                            <p className="text-xs font-semibold text-yellow-800">Umpan Balik dari Guru:</p>
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.correction_text}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                 <footer className="p-4 border-t bg-white text-center">
                    <p className="text-gray-600">Skor Akhir: <span className="font-bold text-2xl text-sesm-deep">{submission.score ?? 'Belum dinilai'}</span></p>
                </footer>
            </motion.div>
        </motion.div>
    );
};
// --- AKHIR DEFINISI SubmissionResultModal ---

// --- Komponen Kartu Materi (Diperbarui) ---
const MaterialCard = ({ material, onSelect, isCompleted }) => {
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
    const imageUrl = material.cover_image_url ? `${API_URL}/${material.cover_image_url}` : `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(material.title)}&backgroundColor=a855f7,b45309,0d9488,c026d3,059669,d97706`; // Fallback dengan Dicebear
    const creatorAvatar = material.creator_avatar ? (material.creator_avatar.startsWith('http') ? material.creator_avatar : `${API_URL}/${material.creator_avatar}`) : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(material.creator_name || 'G')}`;

    const handleOpenLink = (e) => {
        e.stopPropagation(); // Mencegah modal terbuka saat klik tombol link
        window.open(material.url, '_blank', 'noopener,noreferrer');
    };

    return (
        <motion.div
            onClick={() => onSelect(material)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group border flex flex-col h-full relative" // Added relative for checkmark
            whileHover={{ y: -8, boxShadow: "0px 20px 30px -10px rgba(0,0,0,0.1)" }}
            layout // Enable layout animation
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {/* Indikator Selesai */}
            {isCompleted && (
                 <motion.div
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-3 left-3 z-10 bg-green-500 text-white rounded-full p-1.5 shadow-md" title="Sudah Dikerjakan">
                    <FiCheckCircle size={16} />
                </motion.div>
            )}

            <div className="relative h-40 overflow-hidden">
                <img src={imageUrl} alt={material.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onError={(e) => e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(material.title)}&backgroundColor=a855f7,b45309,0d9488,c026d3,059669,d97706`} />
                <div className={`absolute top-2 right-2 flex items-center space-x-1.5 text-white text-xs font-bold py-1 px-2.5 rounded-full ${color} shadow-sm backdrop-blur-sm bg-opacity-80`}>
                    <Icon size={14} /> <span>{label}</span>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                 <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold text-sesm-teal bg-sesm-teal/10 px-2 py-1 rounded-full">{material.subject}</span>
                    <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded-full">{material.recommended_level}</span>
                </div>
                <h3 className="font-bold text-md text-sesm-deep leading-tight group-hover:text-sesm-teal transition-colors flex-grow">{material.title}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{material.description || "Tidak ada deskripsi."}</p>
                {/* Info tambahan: Jumlah soal & Tombol Link */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <FiCheckSquare size={14} /> {material.tasks?.length || 0} Soal
                    </span>
                     {material.type === 'video_link' && (
                        <button onClick={handleOpenLink} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            Buka Tautan <FiExternalLink size={14} />
                        </button>
                    )}
                </div>
            </div>
             <div className="p-4 border-t flex items-center gap-2 bg-gray-50">
                <img src={creatorAvatar} alt={material.creator_name} className="w-6 h-6 rounded-full object-cover" onError={(e) => e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(material.creator_name || 'G')}`} />
                <span className="text-xs font-semibold text-gray-500">Oleh {material.creator_name || 'Guru'}</span>
            </div>
        </motion.div>
    );
};

// --- Komponen Kartu Riwayat (Diperbarui) ---
const HistoryCard = ({ item, onClick }) => {
    const API_URL = 'http://localhost:8080';
    const graderAvatar = item.grader_avatar ? (item.grader_avatar.startsWith('http') ? item.grader_avatar : `${API_URL}/${item.grader_avatar}`) : (item.grader_name ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.grader_name)}` : null);
    const isCompleted = item.status === 'dinilai';
    const StatusIcon = isCompleted ? FiCheckCircle : FiClock; // Nama variabel Icon diperbaiki
    const statusColor = isCompleted ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100 animate-pulse';

    return (
        <motion.div
            layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={onClick} whileTap={{ scale: 0.98 }}
        >
            <div>
                <p className="font-bold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><FiCalendar size={13}/> {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {item.grader_name && (
                    <div className="flex items-center gap-2 mt-2">
                        {graderAvatar && <img src={graderAvatar} alt={item.grader_name} className="w-5 h-5 rounded-full object-cover" onError={(e) => e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.grader_name)}`} />}
                        <p className="text-xs text-gray-500">Dinilai oleh: <span className="font-semibold">{item.grader_name}</span></p>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-6">
                 <span className={`text-xs font-semibold capitalize rounded-full px-2.5 py-1 flex items-center gap-1.5 ${statusColor}`}>
                    <StatusIcon size={14} className="flex-shrink-0"/> {/* Gunakan StatusIcon */}
                    {item.status}
                 </span>
                 <div className="text-right">
                    <p className={`font-bold text-2xl ${item.score === null ? 'text-gray-400' : 'text-sesm-deep'}`}>{item.score ?? '--'}</p>
                    <p className="text-xs font-semibold text-gray-500 -mt-1">Skor</p>
                 </div>
            </div>
        </motion.div>
    );
};

// --- Komponen Lainnya ---
const EmptyState = ({message}) => ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center col-span-full py-16"><FiSearch size={48} className="mx-auto text-gray-300" /><h3 className="mt-4 text-lg font-semibold text-gray-700">{message}</h3><p className="text-sm text-gray-500 mt-1">Coba ubah filter atau kata kunci pencarianmu.</p></motion.div> );
const SectionHeader = ({ title, count }) => ( <div className="flex items-center space-x-2 mb-4 px-2"><h2 className="text-xl font-bold text-gray-800">{title}</h2><span className="bg-sesm-sky/20 text-sesm-deep text-xs font-bold px-2 py-0.5 rounded-full">{count}</span></div> );

// --- Halaman Utama BookmarkPage ---
const BookmarkPage = () => {
    // ... (state dan fungsi lainnya tetap sama) ...
    const [activeTab, setActiveTab] = useState('materi');
    const [materials, setMaterials] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTypeFilter, setActiveTypeFilter] = useState('semua');
    const [activeSubjectFilter, setActiveSubjectFilter] = useState('Semua');
    const [activeLevelFilter, setActiveLevelFilter] = useState('Semua');
    const [sortOption, setSortOption] = useState('terbaru');
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setNotif(prev => ({ ...prev, isOpen: false }));
        try {
            const [materialsRes, historyRes] = await Promise.all([
                BookmarkService.getAllBookmarks(),
                BookmarkService.getMySubmissions()
            ]);
            setMaterials(materialsRes.data || []);
            setHistory(historyRes.data || []);
        } catch (err) {
            console.error("Fetch data error:", err);
            setNotif({ isOpen: true, title: "Gagal Memuat Data", message: "Tidak dapat mengambil data dari server.", success: false });
            setMaterials([]); setHistory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const subjectOptions = useMemo(() => [{ value: 'Semua', label: 'Semua Mapel' }, ...Array.from(new Set(materials.map(m => m.subject).filter(Boolean))).map(subject => ({ value: subject, label: subject }))], [materials]);
    const levelOptions = useMemo(() => [{ value: 'Semua', label: 'Semua Jenjang' }, { value: 'TK', label: 'TK' }, { value: 'SD 1-2', label: 'SD Kelas 1-2' }, { value: 'SD 3-4', label: 'SD Kelas 3-4' }, { value: 'SD 5-6', label: 'SD Kelas 5-6' }], []);
    const typeOptions = useMemo(() => [{ value: 'semua', label: 'Semua Tipe' }, { value: 'video_link', label: 'Link Video' }, { value: 'video', label: 'Video' }, { value: 'image', label: 'Gambar' }, { value: 'pdf', label: 'PDF' }, { value: 'document', label: 'Dokumen' }, { value: 'file', label: 'File Lain' }], []);
    const sortOptions = useMemo(() => [{ value: 'terbaru', label: 'Terbaru Ditambahkan' }, { value: 'terlama', label: 'Terlama Ditambahkan' }, { value: 'az', label: 'Judul (A-Z)' }, { value: 'za', label: 'Judul (Z-A)' }], []);

    const filteredAndSortedMaterials = useMemo(() => {
        let filtered = materials
            .filter(m => activeTypeFilter === 'semua' || m.type === activeTypeFilter)
            .filter(m => activeSubjectFilter === 'Semua' || m.subject === activeSubjectFilter)
            .filter(m => activeLevelFilter === 'Semua' || m.recommended_level === activeLevelFilter)
            .filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));

        switch (sortOption) {
            case 'terlama': filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
            case 'az': filtered.sort((a, b) => a.title.localeCompare(b.title)); break;
            case 'za': filtered.sort((a, b) => b.title.localeCompare(a.title)); break;
            case 'terbaru': default: filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
        }
        return filtered;
    }, [materials, searchTerm, activeTypeFilter, activeSubjectFilter, activeLevelFilter, sortOption]);

    const resetFilters = () => { setSearchTerm(''); setActiveTypeFilter('semua'); setActiveSubjectFilter('Semua'); setActiveLevelFilter('Semua'); setSortOption('terbaru'); };
    const isFilterActive = searchTerm !== '' || activeTypeFilter !== 'semua' || activeSubjectFilter !== 'Semua' || activeLevelFilter !== 'Semua' || sortOption !== 'terbaru';

    useEffect(() => { document.body.style.overflow = selectedMaterial || selectedSubmission ? 'hidden' : 'unset'; return () => { document.body.style.overflow = 'unset'; } }, [selectedMaterial, selectedSubmission]);
    const handleCloseModal = () => setSelectedMaterial(null);
    const handleHistoryClick = (item) => { if (item.status === 'dinilai' || item.grading_type === 'otomatis') { setSelectedSubmission(item); } else { setNotif({ isOpen: true, title: "Info", message: "Hasil pengerjaan ini masih menunggu dinilai.", success: true }); } };
    const handleCloseNotif = () => setNotif({ ...notif, isOpen: false });

    const completedBookmarkIds = useMemo(() => new Set(history.map(h => h.bookmark_id)), [history]);

    const renderContent = () => {
        if (loading) return <div className="col-span-full flex justify-center py-16"><FiLoader className="animate-spin text-3xl text-sesm-teal" /></div>;
        if (activeTab === 'materi') {
            if (filteredAndSortedMaterials.length === 0 && !loading) return <EmptyState message={isFilterActive ? "Tidak ada materi cocok" : "Belum ada materi bookmark"}/>;
            return (
                <motion.section layout className="w-full">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedMaterials.map(material => (
                             <MaterialCard
                                key={material.id}
                                material={material}
                                onSelect={setSelectedMaterial}
                                isCompleted={completedBookmarkIds.has(material.id)}
                            />
                        ))}
                    </div>
                </motion.section>
            );
        }
        if (activeTab === 'nilai') {
            if (history.length === 0 && !loading) return <EmptyState message="Belum ada riwayat pengerjaan"/>;
            return <div className="space-y-4"><SectionHeader title="Riwayat Nilai" count={history.length}/>{history.map(item => <HistoryCard key={item.id} item={item} onClick={() => handleHistoryClick(item)} />)}</div>;
        }
    };

    return (
        <>
            <AnimatePresence>
                 {/* Notifikasi Umum */}
                {notif.isOpen && (
                    <Notification
                        isOpen={notif.isOpen}
                        onClose={handleCloseNotif}
                        title={notif.title}
                        message={notif.message}
                        success={notif.success}
                    />
                )}
                {selectedMaterial && <MaterialDetailModal material={selectedMaterial} onClose={handleCloseModal} />}
                {selectedSubmission && <SubmissionResultModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />}
            </AnimatePresence>

            {/* Layout Desktop */}
            <div className="hidden md:flex flex-col h-screen bg-gray-100 p-8">
                <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow bg-white p-8 rounded-2xl shadow-xl overflow-hidden">
                    <header className="w-full flex-shrink-0 flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold text-sesm-deep tracking-wider flex items-center gap-3"><FiBookmark/> Bookmark</h1>
                        <div className="flex items-center bg-gray-100 rounded-full p-1">
                            <button onClick={() => setActiveTab('materi')} className={`px-5 py-2 text-sm font-semibold rounded-full ${activeTab === 'materi' ? 'bg-white shadow' : 'text-gray-600 hover:text-sesm-deep'}`}>Daftar Materi</button>
                            <button onClick={() => setActiveTab('nilai')} className={`px-5 py-2 text-sm font-semibold rounded-full ${activeTab === 'nilai' ? 'bg-white shadow' : 'text-gray-600 hover:text-sesm-deep'}`}>Riwayat & Nilai</button>
                        </div>
                    </header>
                    {activeTab === 'materi' && (
                        <div className="flex flex-wrap justify-between items-center mb-6 sticky top-0 bg-white py-4 z-10 border-b -mx-8 px-8 gap-y-3">
                            <div className="relative flex-grow max-w-xs mr-4">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Cari judul materi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border-2 border-gray-200 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-sesm-teal transition-colors text-sm"/>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                {isFilterActive && (
                                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                        <button onClick={resetFilters} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"><FiRefreshCw size={14}/> Reset</button>
                                    </motion.div>
                                )}
                                <div className="w-40 z-20"><CustomSelect options={sortOptions} value={sortOption} onChange={setSortOption}/></div>
                                <div className="w-40 z-20"><CustomSelect options={levelOptions} value={activeLevelFilter} onChange={setActiveLevelFilter}/></div>
                                <div className="w-40 z-20"><CustomSelect options={subjectOptions} value={activeSubjectFilter} onChange={setActiveSubjectFilter}/></div>
                                <div className="w-40 z-20"><CustomSelect options={typeOptions} value={activeTypeFilter} onChange={setActiveTypeFilter}/></div>
                            </div>
                        </div>
                    )}
                    <main className="flex-grow w-full overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {renderContent()}
                    </main>
                </div>
            </div>

            {/* Layout Mobile */}
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
                    {activeTab === 'materi' &&
                        <div className="relative mb-4">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Cari judul..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full border rounded-full py-2 pl-10 pr-4 text-sm"/>
                        </div>
                     }
                    {renderContent()}
                </main>
              </div>
            </div>
        </>
    );
};

export default BookmarkPage;