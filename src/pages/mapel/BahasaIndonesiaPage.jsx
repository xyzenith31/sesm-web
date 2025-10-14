import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowLeft, FiLoader, FiAlertCircle, FiBookOpen, FiClipboard, FiX, FiAward, FiTarget, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import { FaBook } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import DataService from '../../services/dataService';

const ChapterButton = ({ chapter, onClick, Icon }) => (
    <motion.button
        onClick={onClick} className="w-full bg-white rounded-2xl p-3 flex items-center space-x-4 shadow-sm border border-gray-200/80 text-left"
        whileTap={{ scale: 0.97, backgroundColor: '#f9fafb' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    >
        <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl bg-red-100 flex-shrink-0">
            <Icon size={32} className="text-red-500" />
        </div>
        <div className="flex-1"><h4 className="font-bold text-sesm-deep text-md md:text-lg">{chapter.judul}</h4></div>
    </motion.button>
);

const HistoryCard = ({ item, onSelect }) => (
    <motion.div
        className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-200/80"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    >
        <div className="flex justify-between items-start">
            <div><h4 className="font-bold text-sesm-deep text-md">{item.title}</h4><p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleString('id-ID')}</p></div>
            <button onClick={() => onSelect(item)} className="text-sm font-semibold text-sesm-teal hover:underline">Lihat Detail</button>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 flex space-x-4">
            <div className="flex items-center space-x-2"><FiTarget className="text-blue-500" />
                <div><p className="text-lg font-bold text-sesm-deep">{item.score ?? 'N/A'}</p><p className="text-xs text-gray-500 -mt-1">Nilai</p></div>
            </div>
            <div className="flex items-center space-x-2"><FiAward className="text-yellow-500" />
                <div><p className="text-lg font-bold text-sesm-deep">+{item.points}</p><p className="text-xs text-gray-500 -mt-1">Poin</p></div>
            </div>
        </div>
    </motion.div>
);

const DetailModal = ({ item, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose} >
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} >
            <header className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold text-sesm-deep">Detail Pengerjaan</h3>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX /></button>
            </header>
            <main className="p-6 overflow-y-auto">
                <p className="text-center text-gray-500">Detail per soal belum tersedia untuk riwayat.</p>
            </main>
        </motion.div>
    </motion.div>
);

const StatCard = ({ icon: Icon, value, label, color }) => (
    <div className="bg-white p-3 rounded-xl shadow-sm flex-1">
        <div className="flex items-center">
            <Icon className={`${color} text-2xl mr-3`} />
            <div>
                <p className="text-lg font-bold text-sesm-deep">{value}</p>
                <p className="text-xs text-gray-500 font-semibold">{label}</p>
            </div>
        </div>
    </div>
);

const BahasaIndonesiaPage = ({ onNavigate, onNavigateToWorksheet }) => {
    const { user } = useAuth();
    const [chapters, setChapters] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('materi');
    const [selectedHistory, setSelectedHistory] = useState(null);

    const SUBJECT_NAME = 'Bahasa Indonesia';
    const HEADER_TITLE = 'B. INDONESIA';
    const ICON = FaBook;

    useEffect(() => {
        if (user?.jenjang) {
            setLoading(true);
            setError(null);
            DataService.getChaptersForSubject(user.jenjang, user.kelas, SUBJECT_NAME)
                .then(response => setChapters(response.data))
                .catch(err => setError("Gagal memuat daftar bab."))
                .finally(() => setLoading(false));

            setHistoryLoading(true);
            DataService.getSubjectHistory(SUBJECT_NAME)
                .then(response => setHistory(response.data))
                .catch(err => console.error("Gagal memuat riwayat", err))
                .finally(() => setHistoryLoading(false));
        } else {
            setError("Informasi jenjang/kelas pengguna tidak ditemukan.");
            setLoading(false);
            setHistoryLoading(false);
        }
    }, [user]);

    const stats = useMemo(() => {
        const gradedHistory = history.filter(h => h.score !== null);
        const completedCount = history.length;
        const bestScore = gradedHistory.length > 0 ? Math.max(...gradedHistory.map(h => h.score)) : 0;
        const avgScore = gradedHistory.length > 0 ? Math.round(gradedHistory.reduce((sum, h) => sum + h.score, 0) / gradedHistory.length) : 0;
        return { completedCount, bestScore, avgScore };
    }, [history]);


    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-48"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
        if (error) return <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg"><FiAlertCircle className="mx-auto text-3xl mb-2"/><p>{error}</p></div>;
        
        if (activeTab === 'materi') {
            if (chapters.length === 0) return <p className="text-center text-gray-500 mt-8">Belum ada bab untuk mata pelajaran ini.</p>;
            return <div className="space-y-4">{chapters.map((chapter) => <ChapterButton key={chapter.id} chapter={chapter} onClick={() => onNavigateToWorksheet({ materiKey: chapter.materiKey, chapterTitle: chapter.judul, subjectName: SUBJECT_NAME, navigationKey: 'bahasaIndonesia' })} Icon={ICON} />)}</div>;
        }

        if (activeTab === 'nilai') {
            if (historyLoading) return <div className="flex justify-center items-center h-48"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
            if (history.length === 0) return <p className="text-center text-gray-500 mt-8">Anda belum pernah mengerjakan bab apapun.</p>;
            return <div className="space-y-4">{history.map(item => <HistoryCard key={item.id} item={item} onSelect={setSelectedHistory} />)}</div>;
        }
    };

    return (
        <>
        <AnimatePresence>
            {selectedHistory && <DetailModal item={selectedHistory} onClose={() => setSelectedHistory(null)} />}
        </AnimatePresence>
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex flex-col md:items-center w-full min-h-screen">
                <div className="w-full md:max-w-2xl md:mx-auto flex flex-col flex-grow">
                    <header className="bg-sesm-teal pt-8 pb-4 px-6 rounded-b-[2.5rem] shadow-lg text-white md:bg-white md:p-6 md:rounded-2xl md:shadow-md md:mt-8 md:mb-6">
                        <div className="flex items-center mb-4">
                            <motion.button onClick={() => onNavigate('home')} className="p-2 -ml-2 mr-2 rounded-full md:hover:bg-gray-100" whileTap={{ scale: 0.9 }}><FiArrowLeft size={24} className="text-white md:text-gray-600"/></motion.button>
                            <div className="hidden md:flex flex-1 items-center">
                                <h1 className="text-3xl font-bold text-sesm-deep tracking-wide">{HEADER_TITLE}</h1>
                                <ICON size={40} className="text-sesm-teal ml-auto"/>
                            </div>
                        </div>
                        <div className="relative mb-4 md:hidden">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800/60" size={20} />
                            <input type="text" placeholder={`Cari di ${HEADER_TITLE}...`} className="w-full bg-white text-gray-800 placeholder:text-gray-500 rounded-full py-3 pl-12 pr-4 text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/50" />
                        </div>
                        <div className="flex justify-between items-center md:hidden">
                            <h1 className="text-2xl font-bold tracking-wide">{HEADER_TITLE}</h1>
                            <ICON size={40} className="opacity-80"/>
                        </div>
                    </header>

                     <div className="px-6 md:px-0 mb-4">
                        <div className="flex space-x-4">
                            <StatCard label="Materi Dikerjakan" value={historyLoading ? '...' : stats.completedCount} icon={FiCheckCircle} color="text-green-500"/>
                            <StatCard label="Nilai Rata-rata" value={historyLoading ? '...' : stats.avgScore} icon={FiBarChart2} color="text-blue-500"/>
                            <StatCard label="Akurasi Terbaik" value={historyLoading ? '...' : `${stats.bestScore}%`} icon={FiTarget} color="text-orange-500"/>
                        </div>
                    </div>

                    <div className="p-4 md:p-0">
                        <div className="flex items-center bg-gray-200/70 rounded-full p-1 max-w-sm mx-auto">
                            <button onClick={() => setActiveTab('materi')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'materi' ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}><FiBookOpen className="inline mr-1 mb-0.5"/> Daftar Bab</button>
                            <button onClick={() => setActiveTab('nilai')} className={`w-1/2 py-2 text-sm font-bold rounded-full transition-colors ${activeTab === 'nilai' ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}><FiClipboard className="inline mr-1 mb-0.5"/> Riwayat & Nilai</button>
                        </div>
                    </div>
                    <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
                </div>
            </div>
        </div>
        </>
    );
};

export default BahasaIndonesiaPage;