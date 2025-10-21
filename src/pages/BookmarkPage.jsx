// contoh-sesm-web/pages/BookmarkPage.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiVideo, FiBookOpen, FiFileText, FiSearch, FiTag, FiRefreshCw, FiLoader,
  FiAlertCircle, FiClipboard, FiBarChart2, FiX, FiCheckCircle, FiXCircle,
  FiExternalLink // <-- Tambahkan ikon ini
} from 'react-icons/fi';
import MaterialDetailModal from '../components/mod/MaterialDetailModal';
import BookmarkService from '../services/bookmarkService';
// --- ✅ 1. Impor komponen baru ---
import Notification from '../components/ui/Notification';
import CustomSelect from '../components/ui/CustomSelect';

// --- KOMPONEN BARU: Modal untuk menampilkan hasil pengerjaan siswa ---
const SubmissionResultModal = ({ submission, onClose }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_URL = 'http://localhost:8080'; // Pastikan base URL API benar

    useEffect(() => {
        if (submission) {
            setLoading(true);
            BookmarkService.getStudentSubmissionDetails(submission.id)
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
                         {getGraderInfo()} {/* Tampilkan info penilai */}
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


// Komponen Card Materi (Sedikit penyesuaian visual)
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
    const imageUrl = material.cover_image_url ? `${API_URL}/${material.cover_image_url}` : `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(material.title)}&backgroundColor=a855f7,b45309,0d9488,c026d3,059669,d97706`; // Fallback dengan Dicebear
    const creatorAvatar = material.creator_avatar ? (material.creator_avatar.startsWith('http') ? material.creator_avatar : `${API_URL}/${material.creator_avatar}`) : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(material.creator_name || 'G')}`;

    return (
        <motion.div
            onClick={() => onSelect(material)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group break-inside-avoid border flex flex-col"
            whileHover={{ y: -8, boxShadow: "0px 20px 30px -10px rgba(0,0,0,0.1)" }}
            layout // Enable layout animation
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="relative h-40 overflow-hidden">
                <img src={imageUrl} alt={material.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className={`absolute top-2 right-2 flex items-center space-x-1.5 text-white text-xs font-bold py-1 px-2.5 rounded-full ${color} shadow-sm backdrop-blur-sm bg-opacity-80`}>
                    <Icon size={14} />
                    <span>{label}</span>
                </div>
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold text-sesm-teal bg-sesm-teal/10 px-2 py-1 rounded-full">{material.subject}</span>
                    <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-2 py-1 rounded-full">{material.recommended_level}</span>
                </div>
                <h3 className="font-bold text-md text-sesm-deep leading-tight group-hover:text-sesm-teal transition-colors flex-grow">{material.title}</h3>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{material.description || "Tidak ada deskripsi."}</p>
            </div>
             <div className="p-4 border-t flex items-center gap-2">
                <img src={creatorAvatar} alt={material.creator_name} className="w-6 h-6 rounded-full object-cover" onError={(e) => e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(material.creator_name || 'G')}`} />
                <span className="text-xs font-semibold text-gray-500">Oleh {material.creator_name || 'Guru'}</span>
            </div>
        </motion.div>
    );
};


// Komponen Kartu Riwayat Nilai (Tambahkan info penilai)
const HistoryCard = ({ item, onClick }) => {
    const API_URL = 'http://localhost:8080';
    const graderAvatar = item.grader_avatar
      ? (item.grader_avatar.startsWith('http') ? item.grader_avatar : `${API_URL}/${item.grader_avatar}`)
      : (item.grader_name ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.grader_name)}` : null);

    return (
        <motion.div
            layout // Enable layout animation
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
        >
            <div>
                <p className="font-bold text-gray-800">{item.title}</p>
                <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {/* Info Penilai */}
                {item.grader_name && (
                    <div className="flex items-center gap-2 mt-2">
                        {graderAvatar && <img src={graderAvatar} alt={item.grader_name} className="w-5 h-5 rounded-full object-cover" onError={(e) => e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.grader_name)}`} />}
                        <p className="text-xs text-gray-500">Dinilai oleh: <span className="font-semibold">{item.grader_name}</span></p>
                    </div>
                )}
            </div>
            <div className="text-right">
                <p className={`font-bold text-2xl ${item.score === null ? 'text-gray-400' : 'text-sesm-teal'}`}>{item.score ?? '...'}</p>
                <p className={`text-xs font-semibold capitalize rounded-full px-2 py-0.5 inline-block ${item.status === 'dinilai' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</p>
            </div>
        </motion.div>
    );
};


// Helper lain
const FilterButton = ({ label, icon: Icon, isActive, onClick, className = '' }) => ( <motion.button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center space-x-2 shadow-sm ${ isActive ? 'bg-sesm-deep text-white shadow-lg' : 'bg-white text-gray-700 hover:bg-gray-100'} ${className}`} whileTap={{scale: 0.95}}>{Icon && <Icon size={16} />}<span>{label}</span></motion.button> );
const EmptyState = ({message}) => ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center col-span-full py-16"><FiSearch size={48} className="mx-auto text-gray-300" /><h3 className="mt-4 text-lg font-semibold text-gray-700">{message}</h3><p className="text-sm text-gray-500 mt-1">Coba ubah filter atau kata kunci pencarianmu.</p></motion.div> );
const SectionHeader = ({ title, count }) => ( <div className="flex items-center space-x-2 mb-4 px-2"><h2 className="text-xl font-bold text-gray-800">{title}</h2><span className="bg-sesm-sky/20 text-sesm-deep text-xs font-bold px-2 py-0.5 rounded-full">{count}</span></div> );


const BookmarkPage = () => {
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

    // --- ✅ 2. State untuk Notifikasi ---
    const [notif, setNotif] = useState({
        isOpen: false,
        message: '',
        success: true,
        title: '',
    });

    // Fungsi fetch data (tanpa perubahan signifikan, kecuali error handling)
    const fetchData = useCallback(async () => {
        setLoading(true);
        // Reset notifikasi error sebelumnya
        setNotif(prev => ({ ...prev, isOpen: false }));
        try {
            const [materialsRes, historyRes] = await Promise.all([
                BookmarkService.getAllBookmarks(),
                BookmarkService.getMySubmissions()
            ]);
            setMaterials(materialsRes.data || []); // Pastikan array
            setHistory(historyRes.data || []);   // Pastikan array
        } catch (err) {
            console.error("Fetch data error:", err);
            // --- ✅ 3. Tampilkan Notifikasi Error ---
            setNotif({
                isOpen: true,
                title: "Gagal Memuat Data",
                message: "Tidak dapat mengambil data dari server. Silakan coba lagi nanti.",
                success: false,
            });
            setMaterials([]); // Kosongkan data jika error
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }, []); // Dependency kosong karena fetch awal saja


    useEffect(() => {
        fetchData();
    }, [fetchData]); // Hanya panggil sekali saat mount

    // --- ✅ 4. Siapkan options untuk CustomSelect ---
    const subjectOptions = useMemo(() => [
        { value: 'Semua', label: 'Semua Mapel' },
        ...Array.from(new Set(materials.map(m => m.subject).filter(Boolean)))
               .map(subject => ({ value: subject, label: subject }))
    ], [materials]);

    const levelOptions = useMemo(() => [
        { value: 'Semua', label: 'Semua Jenjang' },
        { value: 'TK', label: 'TK' },
        { value: 'SD 1-2', label: 'SD Kelas 1-2' },
        { value: 'SD 3-4', label: 'SD Kelas 3-4' },
        { value: 'SD 5-6', label: 'SD Kelas 5-6' }
    ], []);

    const filteredMaterials = useMemo(() => {
        return materials
            // Filter tipe tidak diubah karena masih pakai button
            .filter(m => activeTypeFilter === 'semua' || m.type === activeTypeFilter)
            // Filter subject menggunakan state activeSubjectFilter
            .filter(m => activeSubjectFilter === 'Semua' || m.subject === activeSubjectFilter)
            // Filter level menggunakan state activeLevelFilter
            .filter(m => activeLevelFilter === 'Semua' || m.recommended_level === activeLevelFilter)
            .filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [materials, searchTerm, activeTypeFilter, activeSubjectFilter, activeLevelFilter]);

    const resetFilters = () => {
      setSearchTerm('');
      setActiveTypeFilter('semua');
      setActiveSubjectFilter('Semua');
      setActiveLevelFilter('Semua');
    };
    const isFilterActive = searchTerm !== '' || activeTypeFilter !== 'semua' || activeSubjectFilter !== 'Semua' || activeLevelFilter !== 'Semua';

    useEffect(() => {
        // Efek untuk mengunci scroll body saat modal terbuka
        document.body.style.overflow = selectedMaterial || selectedSubmission ? 'hidden' : 'unset';
         // Cleanup function untuk mengembalikan scroll saat komponen unmount
         return () => { document.body.style.overflow = 'unset'; }
    }, [selectedMaterial, selectedSubmission]);

    const handleCloseModal = () => {
        setSelectedMaterial(null);
        // Mungkin perlu refresh data jika ada aksi di modal
        // fetchData(); // Uncomment jika perlu
    };

    const handleHistoryClick = (item) => {
        if (item.status === 'dinilai' || item.grading_type === 'otomatis') { // Tampilkan jika sudah dinilai atau otomatis
            setSelectedSubmission(item);
        } else {
            // --- ✅ 5. Gunakan Notifikasi untuk info ---
            setNotif({
                isOpen: true,
                title: "Info",
                message: "Hasil pengerjaan ini masih menunggu untuk dinilai oleh guru.",
                success: true, // Warna hijau untuk info
            });
        }
    };

    // --- ✅ 6. Handler untuk menutup notifikasi ---
    const handleCloseNotif = () => {
        setNotif({ ...notif, isOpen: false });
    };

    // Render konten (dengan penyesuaian error handling)
    const renderContent = () => {
        if (loading) return <div className="col-span-full flex justify-center py-16"><FiLoader className="animate-spin text-3xl text-sesm-teal" /></div>;
        // Tidak perlu cek error di sini karena sudah ditangani notifikasi
        // if (error) return <div className="col-span-full text-center py-16 text-red-500"><FiAlertCircle size={48} className="mx-auto" /><p className="mt-4">{error}</p></div>;

        if (activeTab === 'materi') {
            if (filteredMaterials.length === 0 && !loading) return <EmptyState message={isFilterActive ? "Tidak ada materi cocok" : "Belum ada materi bookmark"}/>;
            return (
                <motion.section layout className="w-full">
                    {/* Menggunakan Masonry-like layout dengan grid dan break-inside-avoid */}
                    <div className="columns-1 sm:columns-2 lg:grid lg:grid-cols-2 xl:grid-cols-4 gap-6 space-y-6 lg:space-y-0">
                        {filteredMaterials.map(material => (<MaterialCard key={material.id} material={material} onSelect={setSelectedMaterial} />))}
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
            {/* --- ✅ 7. Render komponen Notifikasi --- */}
             <Notification
                isOpen={notif.isOpen}
                onClose={handleCloseNotif}
                title={notif.title}
                message={notif.message}
                success={notif.success}
                isConfirmation={false} // Ini bukan modal konfirmasi
            />
            <AnimatePresence>
                {selectedMaterial && <MaterialDetailModal material={selectedMaterial} onClose={handleCloseModal} />}
                {selectedSubmission && <SubmissionResultModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />}
            </AnimatePresence>

            {/* Tampilan Mobile & Tablet */}
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

            {/* Tampilan Desktop */}
            <div className="hidden md:flex flex-col h-screen bg-gray-100 p-8">
                <div className="w-full max-w-7xl mx-auto flex flex-col flex-grow bg-white p-8 rounded-2xl shadow-xl overflow-hidden">
                    <header className="w-full flex-shrink-0 flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold text-sesm-deep tracking-wider">Bookmark</h1>
                        <div className="flex items-center bg-gray-100 rounded-full p-1">
                            <button onClick={() => setActiveTab('materi')} className={`px-5 py-2 text-sm font-semibold rounded-full ${activeTab === 'materi' ? 'bg-white shadow' : 'text-gray-600 hover:text-sesm-deep'}`}>Daftar Materi</button>
                            <button onClick={() => setActiveTab('nilai')} className={`px-5 py-2 text-sm font-semibold rounded-full ${activeTab === 'nilai' ? 'bg-white shadow' : 'text-gray-600 hover:text-sesm-deep'}`}>Riwayat & Nilai</button>
                        </div>
                    </header>
                    <main className="flex-grow w-full overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                         {activeTab === 'materi' && (
                            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white py-4 z-10">
                                <div className="relative flex-grow max-w-xs">
                                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari judul materi..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full border-2 border-gray-200 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-sesm-teal transition-colors"
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    {isFilterActive && (
                                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                            <FilterButton label="Reset Filter" icon={FiRefreshCw} onClick={resetFilters} className="!bg-red-100 !text-red-700 hover:!bg-red-200" />
                                        </motion.div>
                                    )}
                                     {/* --- ✅ 8. Ganti select dengan CustomSelect --- */}
                                    <div className="w-48 z-20">
                                        <CustomSelect
                                            options={levelOptions}
                                            value={activeLevelFilter}
                                            onChange={setActiveLevelFilter}
                                        />
                                    </div>
                                    <div className="w-48 z-20">
                                        <CustomSelect
                                            options={subjectOptions}
                                            value={activeSubjectFilter}
                                            onChange={setActiveSubjectFilter}
                                        />
                                    </div>
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