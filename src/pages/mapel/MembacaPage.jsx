import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowLeft, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { FaBookOpen } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import DataService from '../../services/dataService';
import ChapterDetailModal from '../../components/ChapterDetailModal';

// --- KONFIGURASI UNTUK HALAMAN INI ---
const SUBJECT_NAME = 'Membaca';
const HEADER_TITLE = 'MEMBACA';
const HEADER_SUBTITLE = 'Jenjang TK Kurikulum SESM';
const ICON = FaBookOpen;
const ICON_COLOR = 'text-blue-500';
const ICON_BG_COLOR = 'bg-blue-100';

const ChapterButton = ({ chapter, onClick, Icon, iconBgColor }) => (
    <motion.button
        onClick={onClick}
        className="w-full bg-white rounded-2xl p-3 flex items-center space-x-4 shadow-sm border border-gray-200/80 text-left"
        whileTap={{ scale: 0.97, backgroundColor: '#f9fafb' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
    >
        <div className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-xl ${iconBgColor} flex-shrink-0`}>
            <Icon size={32} className={ICON_COLOR} />
        </div>
        <div className="flex-1">
            <h4 className="font-bold text-sesm-deep text-md md:text-lg">{chapter.judul}</h4>
        </div>
    </motion.button>
);

const MembacaPage = ({ onNavigate }) => {
    const { user } = useAuth();
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMateriKey, setSelectedMateriKey] = useState(null);

    useEffect(() => {
        if (user?.jenjang) {
            setLoading(true);
            setError(null);
            DataService.getChaptersForSubject(user.jenjang, user.kelas, SUBJECT_NAME)
                .then(response => {
                    setChapters(response.data);
                })
                .catch(err => {
                    setError("Gagal memuat daftar bab untuk mata pelajaran ini.");
                    console.error(err);
                })
                .finally(() => setLoading(false));
        } else {
            setError("Informasi jenjang/kelas pengguna tidak ditemukan.");
            setLoading(false);
        }
    }, [user]);

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-48"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
        }
        if (error) {
            return <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg"><FiAlertCircle className="mx-auto text-3xl mb-2"/><p>{error}</p></div>;
        }
        if (chapters.length === 0) {
            return <p className="text-center text-gray-500 mt-8">Belum ada bab untuk mata pelajaran ini.</p>;
        }
        return (
            <div className="space-y-4">
                {chapters.map((chapter) => (
                    <ChapterButton
                        key={chapter.id}
                        chapter={chapter}
                        onClick={() => setSelectedMateriKey(chapter.materiKey)}
                        Icon={ICON}
                        iconBgColor={ICON_BG_COLOR}
                    />
                ))}
            </div>
        );
    };

    return (
        <>
            <AnimatePresence>
                {selectedMateriKey && <ChapterDetailModal materiKey={selectedMateriKey} onClose={() => setSelectedMateriKey(null)} />}
            </AnimatePresence>

            <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
                <div className="flex flex-col h-screen md:h-auto md:items-center w-full md:min-h-screen md:bg-gray-100 md:p-8">
                    <div className="w-full md:max-w-2xl md:mx-auto">
                        <header className="bg-sesm-teal pt-8 pb-4 px-6 rounded-b-[2.5rem] shadow-lg text-white md:bg-white md:p-6 md:rounded-2xl md:shadow-md md:mb-8 md:text-black">
                            <div className="flex items-center mb-4">
                                <motion.button onClick={() => onNavigate('home')} className="p-2 -ml-2 mr-2 rounded-full md:mr-4 md:hover:bg-gray-100" whileTap={{ scale: 0.9 }}>
                                    <FiArrowLeft size={24} className="text-white md:text-gray-600"/>
                                </motion.button>
                                <div className="hidden md:flex flex-1 items-center">
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-bold text-sesm-deep tracking-wide">{HEADER_TITLE}</h1>
                                        <p className="text-md text-gray-500">{HEADER_SUBTITLE}</p>
                                    </div>
                                    <ICON size={40} className="text-sesm-teal"/>
                                </div>
                            </div>
                            <div className="relative mb-4 md:hidden">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800/60" size={20} />
                                <input type="text" placeholder={`Cari materi ${SUBJECT_NAME}...`} className="w-full bg-white text-gray-800 placeholder:text-gray-500 rounded-full py-3 pl-12 pr-4 text-sm border-none focus:outline-none focus:ring-2 focus:ring-white/50" />
                            </div>
                            <div className="flex justify-between items-center md:hidden">
                                <div>
                                    <h1 className="text-2xl font-bold tracking-wide">{HEADER_TITLE}</h1>
                                    <p className="text-sm opacity-90">{HEADER_SUBTITLE}</p>
                                </div>
                                <ICON size={40} className="opacity-80"/>
                            </div>
                        </header>
                        <main className="flex-1 overflow-y-auto pt-6 pb-6 px-6 md:p-0">
                            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:px-2">Semua bab</h2>
                            {renderContent()}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MembacaPage;