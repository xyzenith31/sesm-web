// contoh-sesm-web/pages/mapel/PKNPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowLeft, FiLoader, FiAlertCircle, FiBookOpen, FiClipboard, FiX, FiAward, FiTarget, FiCheckCircle, FiBarChart2, FiUser } from 'react-icons/fi'; // <-- Tambah FiUser
import { FaBalanceScale } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import DataService from '../../services/dataService';
import StudentSubmissionDetailModal from '../../components/mod/StudentSubmissionDetailModal'; // <-- Impor modal siswa

// --- Komponen UI Umum ---
// --- ⭐ Modifikasi ChapterButton ---
const ChapterButton = ({ chapter, onClick, Icon, themeStyles, hasCompleted }) => {
    const API_URL = 'http://localhost:8080';
    const creatorNameSeed = encodeURIComponent(chapter.creator_name || 'Guru');
    const defaultAvatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${creatorNameSeed}&backgroundColor=cccccc&fontSize=36`;
    const creatorAvatarUrl = chapter.creator_avatar
        ? (chapter.creator_avatar.startsWith('http') ? chapter.creator_avatar : `${API_URL}/${chapter.creator_avatar}`)
        : defaultAvatarUrl;
    const handleAvatarError = (e) => { e.target.onerror = null; e.target.src = defaultAvatarUrl; };

    return (
        <motion.button
            onClick={onClick}
            className={`relative w-full bg-white rounded-2xl p-4 flex items-center space-x-4 shadow-md border border-gray-200/60 text-left transition-all duration-300 hover:shadow-xl ${themeStyles.hoverBorder} hover:-translate-y-1 group`}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className={`w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br ${themeStyles.bgGradient} flex-shrink-0 shadow-inner`}>
                <Icon size={32} className={themeStyles.color} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sesm-deep text-base truncate">{chapter.judul}</h4>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                     <img src={creatorAvatarUrl} alt={chapter.creator_name || 'Guru'} className="w-4 h-4 rounded-full object-cover bg-gray-300 flex-shrink-0" onError={handleAvatarError} />
                    <span className="truncate">Oleh {chapter.creator_name || 'Guru'}</span>
                </div>
            </div>
            <AnimatePresence>
             {hasCompleted && (
                 <motion.div
                    key="medal-icon"
                    initial={{ scale: 0, opacity: 0, y: -5 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0, y: -5 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15, duration: 0.3 }}
                    className="absolute top-2 right-2 p-1.5 bg-yellow-400 rounded-full text-white shadow-md flex-shrink-0" title="Sudah Dikerjakan & Poin Didapat"
                 > <FiAward size={14} /> </motion.div>
             )}
            </AnimatePresence>
        </motion.button>
    );
};

const HistoryCard = ({ item, onSelect }) => (
    <motion.div className="w-full bg-white rounded-2xl p-4 shadow-sm border" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex justify-between items-start">
            <div><h4 className="font-bold text-sesm-deep text-md">{item.title}</h4><p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleString('id-ID')}</p></div>
            <button onClick={() => onSelect(item)} className="text-sm font-semibold text-sesm-teal hover:underline">Lihat Detail</button>
        </div>
        <div className="mt-3 pt-3 border-t flex space-x-4">
            <div className="flex items-center space-x-2"><FiTarget className="text-blue-500" /><div><p className="text-lg font-bold text-sesm-deep">{item.score ?? 'N/A'}</p><p className="text-xs text-gray-500 -mt-1">Nilai</p></div></div>
            <div className="flex items-center space-x-2"><FiAward className="text-yellow-500" /><div><p className="text-lg font-bold text-sesm-deep">+{item.points}</p><p className="text-xs text-gray-500 -mt-1">Poin</p></div></div>
        </div>
    </motion.div>
);

const StatCard = ({ icon: Icon, value, label, color }) => (
    <div className="bg-white p-3 rounded-xl shadow-sm flex-1 border">
        <div className="flex items-center">
            <Icon className={`${color} text-2xl mr-3`} />
            <div>
                <p className="text-lg font-bold text-sesm-deep">{value}</p>
                <p className="text-xs text-gray-500 font-semibold">{label}</p>
            </div>
        </div>
    </div>
);

// --- Halaman Utama Mapel ---
const PKNPage = ({ onNavigate, onNavigateToWorksheet }) => {
    const { user } = useAuth();
    const [chapters, setChapters] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [error, setError] = useState(null);
    const [historyError, setHistoryError] = useState(null);
    const [activeTab, setActiveTab] = useState('materi');
    const [selectedHistory, setSelectedHistory] = useState(null); // <-- State untuk modal detail siswa
    const [searchTerm, setSearchTerm] = useState('');

    const SUBJECT_NAME = 'PKN';
    const HEADER_TITLE = 'PKN';
    const ICON = FaBalanceScale;
    const THEME_STYLES = {
        color: 'text-yellow-500',
        hoverBorder: 'hover:border-yellow-300',
        bgGradient: 'from-yellow-100 to-yellow-200',
        desktopBg: 'bg-yellow-50',
        desktopHeaderGradient: 'from-yellow-400 to-yellow-600',
        desktopTabBg: 'bg-yellow-100/70',
        desktopTabText: 'text-yellow-800'
    };
    const NAVIGATION_KEY = 'pkn';

    // Fetch data chapters
    useEffect(() => {
        let isMounted = true;
        if (user?.jenjang) {
            setLoading(true); setError(null);
            DataService.getChaptersForSubject(user.jenjang, user.kelas, SUBJECT_NAME)
                .then(res => { if (isMounted) setChapters(res.data); })
                .catch(err => { console.error("Gagal memuat chapters:", err); if (isMounted) setError(`Gagal memuat daftar bab. ${err.response?.data?.message || err.message}`); })
                .finally(() => { if (isMounted) setLoading(false); });
        } else {
            setError("Informasi jenjang/kelas pengguna tidak ditemukan."); setLoading(false);
        }
        return () => { isMounted = false };
    }, [user, SUBJECT_NAME]);

    // Fetch data history
    useEffect(() => {
        let isMounted = true;
        setHistoryLoading(true); setHistoryError(null);
        DataService.getSubjectHistory(SUBJECT_NAME)
            .then(res => { if (isMounted) setHistory(res.data); })
            .catch(err => { console.error("Gagal memuat riwayat:", err); if (isMounted) setHistoryError(`Gagal memuat riwayat nilai. ${err.response?.data?.message || err.message}`); })
            .finally(() => { if (isMounted) setHistoryLoading(false); });
        return () => { isMounted = false };
    }, [SUBJECT_NAME]);


    const stats = useMemo(() => {
        const gradedHistory = history.filter(h => h.score !== null);
        const completedCount = history.length;
        const bestScore = gradedHistory.length > 0 ? Math.max(...gradedHistory.map(h => h.score)) : 0;
        const avgScore = gradedHistory.length > 0 ? Math.round(gradedHistory.reduce((sum, h) => sum + h.score, 0) / gradedHistory.length) : 0;
        return { completedCount, bestScore, avgScore };
    }, [history]);

    const filteredChapters = useMemo(() => {
        if (!searchTerm) return chapters;
        return chapters.filter(chapter => chapter.judul.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [chapters, searchTerm]);

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-48 pt-12"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
        if (error && activeTab === 'materi') return <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg mt-12"><FiAlertCircle className="mx-auto text-3xl mb-2"/><p>{error}</p></div>;
        if (historyError && activeTab === 'nilai') return <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg mt-12"><FiAlertCircle className="mx-auto text-3xl mb-2"/><p>{historyError}</p></div>;

        if (activeTab === 'materi') {
            if (filteredChapters.length === 0) return <div className="text-center text-gray-500 mt-12"><p>{searchTerm ? 'Bab tidak ditemukan.' : 'Belum ada bab untuk mata pelajaran ini.'}</p></div>;
             // ⭐ Teruskan prop hasCompleted ke ChapterButton
            return (
                <div className="space-y-4">
                    {filteredChapters.map((chapter) => (
                        <ChapterButton
                            key={chapter.id || chapter.materiKey}
                            chapter={chapter}
                            onClick={() => onNavigateToWorksheet({ materiKey: chapter.materiKey, chapterTitle: chapter.judul, subjectName: SUBJECT_NAME, navigationKey: NAVIGATION_KEY })}
                            Icon={ICON}
                            themeStyles={THEME_STYLES}
                            hasCompleted={chapter.hasCompleted} // <-- Tambahkan ini
                        />
                    ))}
                </div>
            );
        }
        if (activeTab === 'nilai') {
            if (historyLoading) return <div className="flex justify-center items-center h-48 pt-12"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
            if (history.length === 0 && !historyError) return <div className="text-center text-gray-500 mt-12"><p>Anda belum pernah mengerjakan bab apapun.</p></div>;
             // <-- Panggil setSelectedHistory saat HistoryCard diklik
            return <div className="space-y-4">{history.map(item => <HistoryCard key={item.id} item={item} onSelect={setSelectedHistory} />)}</div>;
        }
    };

    return (
        <>
            {/* --- ⭐ Render StudentSubmissionDetailModal --- */}
            <AnimatePresence>
                {selectedHistory && <StudentSubmissionDetailModal submission={selectedHistory} onClose={() => setSelectedHistory(null)} />}
            </AnimatePresence>

            {/* Layout Mobile */}
            <div className={`md:hidden flex flex-col min-h-screen bg-gray-50 pb-28`}>
                <header className={`bg-gradient-to-b from-sesm-teal to-sesm-deep rounded-b-[2.5rem] p-6 pt-10 text-white z-10 shadow-lg flex-shrink-0`}>
                    <div className="flex justify-between items-center mb-4">
                        <motion.button onClick={() => onNavigate('home')} className="p-2 -ml-2" whileTap={{ scale: 0.9 }}><FiArrowLeft size={24}/></motion.button>
                        <div className="w-8"></div>
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input type="text" placeholder={`Cari di ${HEADER_TITLE}...`} className="w-full bg-white text-gray-800 placeholder:text-gray-500 rounded-full py-3 pl-12 pr-4 text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </header>
                <main className="flex-1 flex flex-col p-6 pt-4 overflow-hidden">
                     <div className="bg-white rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h1 className="text-2xl font-bold text-sesm-deep">{HEADER_TITLE}</h1>
                                <ICON size={40} className={`${THEME_STYLES.color} opacity-80`}/>
                            </div>
                            <div className="flex flex-col space-y-3">
                                <StatCard label="Materi Dikerjakan" value={historyLoading ? '...' : stats.completedCount} icon={FiCheckCircle} color="text-green-500"/>
                                <StatCard label="Nilai Rata-rata" value={historyLoading || historyError ? '...' : stats.avgScore} icon={FiBarChart2} color="text-blue-500"/>
                                <StatCard label="Akurasi Terbaik" value={historyLoading || historyError ? '...' : `${stats.bestScore}%`} icon={FiTarget} color="text-orange-500"/>
                            </div>
                        </div>
                        <div className="px-6 pb-4 flex-shrink-0">
                            <div className="flex items-center bg-gray-100 rounded-full p-1.5 max-w-sm mx-auto">
                                <button onClick={() => setActiveTab('materi')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'materi' ? 'bg-white text-sesm-deep shadow' : 'text-gray-600'}`}>Daftar Bab</button>
                                <button onClick={() => setActiveTab('nilai')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'nilai' ? 'bg-white text-sesm-deep shadow' : 'text-gray-600'}`}>Riwayat & Nilai</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            {renderContent()}
                        </div>
                    </div>
                </main>
            </div>

            {/* Layout Desktop */}
            <div className={`hidden md:flex flex-col min-h-screen ${THEME_STYLES.desktopBg} p-8`}>
                <motion.div
                    className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl flex flex-col flex-grow overflow-hidden"
                    initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    <header className="p-6 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <motion.button onClick={() => onNavigate('home')} className="p-3 rounded-full bg-gray-100 hover:bg-gray-200" whileTap={{ scale: 0.9 }}><FiArrowLeft size={24} className="text-gray-700"/></motion.button>
                            <div className='flex-grow'><h1 className="text-3xl font-bold text-sesm-deep tracking-wide">{HEADER_TITLE}</h1><p className='text-gray-500'>Jadi warga negara yang baik!</p></div>
                            <div className={`w-16 h-16 flex items-center justify-center rounded-2xl bg-gradient-to-br ${THEME_STYLES.desktopHeaderGradient} flex-shrink-0 shadow-lg`}><ICON size={32} className="text-white"/></div>
                        </div>
                    </header>
                    <div className="px-6 mb-6">
                        <div className="relative max-w-md">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input type="text" placeholder={`Cari bab ${HEADER_TITLE}...`} className="w-full bg-white border-2 border-gray-200 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sesm-teal focus:border-transparent transition-colors" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="px-6 mb-6"><div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4"><StatCard label="Materi Dikerjakan" value={historyLoading ? '...' : stats.completedCount} icon={FiCheckCircle} color="text-green-500"/><StatCard label="Nilai Rata-rata" value={historyLoading || historyError ? '...' : stats.avgScore} icon={FiBarChart2} color="text-blue-500"/><StatCard label="Akurasi Terbaik" value={historyLoading || historyError ? '...' : `${stats.bestScore}%`} icon={FiTarget} color="text-orange-500"/></div></div>
                    <div className="flex-grow flex flex-col overflow-hidden">
                        <div className="px-6 pb-4"><div className={`flex items-center ${THEME_STYLES.desktopTabBg} rounded-full p-1.5 max-w-sm mx-auto`}><button onClick={() => setActiveTab('materi')} className={`w-1/2 py-2.5 text-sm font-bold rounded-full transition-all ${activeTab === 'materi' ? 'bg-white text-sesm-deep shadow-md' : THEME_STYLES.desktopTabText}`}><FiBookOpen className="inline mr-2 mb-0.5"/> Daftar Bab</button><button onClick={() => setActiveTab('nilai')} className={`w-1/2 py-2.5 text-sm font-bold rounded-full transition-all ${activeTab === 'nilai' ? 'bg-white text-sesm-deep shadow-md' : THEME_STYLES.desktopTabText}`}><FiClipboard className="inline mr-2 mb-0.5"/> Riwayat & Nilai</button></div></div>
                        <main className="flex-1 overflow-y-auto p-6 pt-2"><AnimatePresence mode="wait"><motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>{renderContent()}</motion.div></AnimatePresence></main>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default PKNPage;