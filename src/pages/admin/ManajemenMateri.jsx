import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiChevronRight, FiBookOpen, FiTrash2, FiLoader, FiGrid,
    FiCheckSquare, FiFileText, FiEdit, FiAlertCircle, FiTrendingUp, FiSettings, FiCheckCircle
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import DataService from '../../services/dataService';
import AddChapterModal from '../../components/mod/AddChapterMateriModal';
import QuestionFormModal from '../../components/mod/QuestionFormMateriModal';
import DraftsModal from '../../components/mod/DraftsMateriModal';
import BankSoalMateriModal from '../../components/admin/BankSoalMateriModal';
import EditQuestionModal from '../../components/admin/EditQuestionMateriModal';
import ChapterSettingsModal from '../../components/admin/MateriSettingsModal';
import Notification from '../../components/ui/Notification';
import CustomSelect from '../../components/ui/CustomSelect';

const toAlpha = (num) => String.fromCharCode(65 + num);

const jenjangOptions = {
    'TK': { jenjang: 'TK', kelas: null },
    'SD Kelas 1': { jenjang: 'SD', kelas: 1 },
    'SD Kelas 2': { jenjang: 'SD', kelas: 2 },
    'SD Kelas 3': { jenjang: 'SD', kelas: 3 },
    'SD Kelas 4': { jenjang: 'SD', kelas: 4 },
    'SD Kelas 5': { jenjang: 'SD', kelas: 5 },
    'SD Kelas 6': { jenjang: 'SD', kelas: 6 },
};

const jenjangSelectOptions = Object.keys(jenjangOptions).map(key => ({
    value: key,
    label: key,
}));

const StatCard = ({ icon: Icon, value, label, color }) => (
    <div className="bg-gray-100 p-4 rounded-lg flex-1 border hover:border-sesm-teal transition-colors">
        <div className="flex items-center">
            <Icon className={`text-xl mr-3 ${color}`} />
            <div>
                <p className="text-xl font-bold text-sesm-deep">{value}</p>
                <p className="text-xs text-gray-500 font-semibold">{label}</p>
            </div>
        </div>
    </div>
);

const DashboardView = ({ userName, stats }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col justify-center h-full text-center px-4">
        <FiBookOpen className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Selamat Datang, {userName || 'Guru'}!</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">Pilih materi dari daftar di sebelah kiri untuk melihat detail atau kelola soal. Gunakan tombol di atas untuk membuat materi baru.</p>
        <div className="space-y-6 text-left">
            <div>
                <h3 className="font-bold text-gray-700 mb-3">Ringkasan Materi</h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <StatCard icon={FiGrid} value={stats.totalMapel} label="Total Mapel" color="text-blue-500" />
                    <StatCard icon={FiGrid} value={stats.totalBab} label="Total Bab" color="text-green-500" />
                    <StatCard icon={FiCheckSquare} value={stats.totalSoal} label="Total Soal" color="text-orange-500" />
                </div>
            </div>
        </div>
    </motion.div>
);

const ToggleSwitch = ({ enabled, onToggle }) => (
    <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 focus:outline-none ${enabled ? 'bg-sesm-teal' : 'bg-gray-300'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

const ManajemenMateri = ({ onNavigate }) => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:8080';
    const [materiList, setMateriList] = useState({});
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedMateri, setSelectedMateri] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
    const [selectedFilterKey, setSelectedFilterKey] = useState('TK');
    const [isBankSoalOpen, setIsBankSoalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedChapterForSettings, setSelectedChapterForSettings] = useState(null);
    const [drafts, setDrafts] = useState([]);
    const [showDraftsNotification, setShowDraftsNotification] = useState(false);
    const [hasDismissedDraftNotif, setHasDismissedDraftNotif] = useState(false);

    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const handleCloseNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));
    const handleCloseConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

    const fetchMateriList = useCallback((selectKeyAfterFetch = null) => {
        const { jenjang, kelas } = jenjangOptions[selectedFilterKey];
        setIsLoading(true);
        if (!selectKeyAfterFetch) {
            setSelectedKey(null);
            setSelectedMateri(null);
        }
        DataService.getMateriForAdmin(jenjang, kelas).then(res => {
            setMateriList(res.data)
            if (selectKeyAfterFetch) {
                setSelectedKey(selectKeyAfterFetch);
                 const materiInfo = Object.values(res.data).flatMap(m => m.chapters).find(m => m.materiKey === selectKeyAfterFetch);
                 if (materiInfo) {
                    setSelectedMateri(prev => ({ ...prev, ...materiInfo }));
                 }
            }
        }).catch(err => {
             setNotif({
                isOpen: true,
                title: "Gagal Memuat",
                message: err.response?.data?.message || "Gagal memuat data materi.",
                success: false
            });
        }).finally(() => setIsLoading(false));
    }, [selectedFilterKey]);

    const fetchDrafts = useCallback(async () => {
        try {
            const response = await DataService.getAllDrafts();
            if (response.data && response.data.length > 0) {
                const materiDrafts = response.data.filter(d => d.draft_key.startsWith('materi_'));
                if (materiDrafts.length > 0) {
                    setDrafts(materiDrafts);
                    if (!hasDismissedDraftNotif) {
                        setShowDraftsNotification(true);
                    }
                } else {
                    setDrafts([]);
                }
            } else {
                setDrafts([]);
            }
        } catch (error) {
            console.error("Gagal mengambil draft:", error);
             setNotif({
                isOpen: true,
                title: "Gagal Memuat Draf",
                message: "Tidak dapat mengambil data draf dari server.",
                success: false
            });
        }
    }, [hasDismissedDraftNotif]);

    useEffect(() => {
        fetchMateriList();
        fetchDrafts();
    }, [fetchMateriList, fetchDrafts]);

    const fetchDetailMateri = useCallback(() => {
        if (!selectedKey) { setSelectedMateri(null); return; }
        setIsDetailLoading(true);
        const materiInfo = Object.values(materiList).flatMap(m => m.chapters).find(m => m.materiKey === selectedKey);
        DataService.getDetailMateriForAdmin(selectedKey).then(res => setSelectedMateri({ ...materiInfo, questions: res.data.questions || [] })).catch((err) => {
            setNotif({
                isOpen: true,
                title: "Gagal Memuat Soal",
                message: "Gagal memuat detail soal untuk materi ini.",
                success: false
            });
             setSelectedMateri(prev => ({ ...prev, questions: [] }));
        }).finally(() => setIsDetailLoading(false));
    }, [selectedKey, materiList]);

    useEffect(() => { fetchDetailMateri(); }, [fetchDetailMateri]);

    const stats = useMemo(() => ({
        totalMapel: Object.keys(materiList).length,
        totalBab: Object.values(materiList).reduce((sum, mapel) => sum + (mapel.chapters?.length || 0), 0),
        totalSoal: Object.values(materiList).reduce((sum, mapel) => sum + (mapel.chapters?.reduce((cs, c) => cs + c.questionCount, 0) || 0), 0),
    }), [materiList]);

    const handleAddChapterSubmit = async (data) => {
        try {
            await DataService.addChapter(data);
            fetchMateriList();
            setIsAddChapterModalOpen(false);
             setNotif({
                isOpen: true,
                title: "Berhasil",
                message: `Materi "${data.judul}" berhasil ditambahkan.`,
                success: true
            });
        } catch (e) {
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: e.response?.data?.message || "Gagal menambahkan materi baru.",
                success: false
            });
        }
    };

    const handleQuestionsFromBankAdded = (targetMateriKey) => {
        setIsBankSoalOpen(false);
         setNotif({
            isOpen: true,
            title: "Berhasil",
            message: "Soal berhasil ditambahkan dari bank!",
            success: true
        });
        fetchMateriList(targetMateriKey);
        fetchDetailMateri();
    };

    const handleDeleteChapter = (materiKey, chapterTitle) => {
        setConfirmModal({
            isOpen: true,
            title: "Konfirmasi Hapus",
            message: `Yakin ingin menghapus materi "${chapterTitle}" beserta semua soal di dalamnya?`,
            onConfirm: () => confirmDeleteChapter(materiKey, chapterTitle),
        });
    };

    const confirmDeleteChapter = async (materiKey, chapterTitle) => {
        handleCloseConfirmModal();
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            await DataService.deleteChapter(materiKey);
            fetchMateriList();
            if (selectedKey === materiKey) setSelectedKey(null);
            setNotif({
                isOpen: true,
                title: "Berhasil",
                message: `Materi "${chapterTitle}" berhasil dihapus.`,
                success: true,
            });
        } catch (e) {
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: e.response?.data?.message || "Gagal menghapus materi.",
                success: false,
            });
        }
    };


    const handleBatchQuestionSubmit = async (newQuestions) => {
        if (!selectedKey) return;
        setIsDetailLoading(true);
        try {
            for (const q of newQuestions) {
                await DataService.addQuestion(selectedKey, q);
            }
             setNotif({
                isOpen: true,
                title: "Berhasil",
                message: `${newQuestions.length} soal berhasil dipublikasikan!`,
                success: true
            });
            fetchDetailMateri();
            fetchMateriList(selectedKey);
        } catch (e) {
             setNotif({
                isOpen: true,
                title: "Gagal Publikasi",
                message: e.response?.data?.message || "Terjadi kesalahan saat publikasi soal.",
                success: false
            });
        } finally { setIsDetailLoading(false); }
    };

    const handleOpenEditModal = (question) => {
        setEditingQuestion(question);
        setIsEditModalOpen(true);
    };

    const handleUpdateQuestion = async (questionId, updatedData) => {
        try {
            await DataService.updateQuestion(questionId, updatedData);
            setIsEditModalOpen(false);
            setEditingQuestion(null);
             setNotif({
                isOpen: true,
                title: "Berhasil",
                message: "Soal berhasil diperbarui!",
                success: true
            });
            fetchDetailMateri();
        } catch (error) {
             setNotif({
                isOpen: true,
                title: "Gagal",
                message: error.response?.data?.message || "Gagal memperbarui soal.",
                success: false
            });
            console.error(error);
        }
    };

    const handleDeleteQuestion = (questionId, questionText) => {
         setConfirmModal({
            isOpen: true,
            title: "Konfirmasi Hapus Soal",
            message: `Yakin ingin menghapus soal "${questionText.substring(0, 30)}..."?`,
            onConfirm: () => confirmDeleteQuestion(questionId, questionText),
        });
    };

    const confirmDeleteQuestion = async (questionId, questionText) => {
        handleCloseConfirmModal();
        await new Promise(resolve => setTimeout(resolve, 300));

         try {
            await DataService.deleteQuestion(questionId);
             setNotif({
                isOpen: true,
                title: "Berhasil",
                message: "Soal berhasil dihapus.",
                success: true,
            });
            fetchDetailMateri();
            fetchMateriList(selectedKey);
        } catch (e) {
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: e.response?.data?.message || "Gagal menghapus soal.",
                success: false,
            });
        }
    }


    const handleDeleteAllQuestions = () => {
        if (!selectedMateri || !selectedMateri.questions || selectedMateri.questions.length === 0) {
            setNotif({ isOpen: true, title: "Info", message: "Tidak ada soal untuk dihapus.", success: true });
            return;
        }
        setConfirmModal({
            isOpen: true,
            title: "Konfirmasi Hapus Semua Soal",
            message: `Anda yakin ingin menghapus SEMUA (${selectedMateri.questions.length}) soal dari materi "${selectedMateri.judul}"? Tindakan ini tidak dapat diurungkan.`,
            onConfirm: confirmDeleteAllQuestions,
        });
    };

     const confirmDeleteAllQuestions = async () => {
        handleCloseConfirmModal();
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsDetailLoading(true);
        try {
            await Promise.all(selectedMateri.questions.map(q => DataService.deleteQuestion(q.id)));
             setNotif({
                isOpen: true,
                title: "Berhasil",
                message: "Semua soal berhasil dihapus.",
                success: true,
            });
            fetchDetailMateri(); fetchMateriList(selectedKey);
        } catch (e) {
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: "Terjadi kesalahan saat menghapus semua soal.",
                success: false,
            });
        } finally { setIsDetailLoading(false); }
    };

    const handleGradingModeChange = async (chapterId, currentMode) => {
        const newMode = currentMode === 'manual' ? 'otomatis' : 'manual';
        try {
            await DataService.updateGradingMode(chapterId, newMode);
             setNotif({
                isOpen: true,
                title: "Berhasil",
                message: `Mode penilaian diubah ke ${newMode}.`,
                success: true
            });
            fetchMateriList(selectedKey);
        } catch (err) {
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: `Gagal mengubah mode penilaian: ${err.response?.data?.message || err.message}`,
                success: false
            });
        }
    };

    const handleOpenSettingsModal = (chapter) => {
        setSelectedChapterForSettings(chapter);
        setIsSettingsModalOpen(true);
    };

    const handleSaveSettings = async (chapterId, newSettings) => {
        try {
            await DataService.updateChapterSettings(chapterId, newSettings);
             setNotif({
                isOpen: true,
                title: "Berhasil",
                message: "Pengaturan berhasil disimpan!",
                success: true
            });
            setIsSettingsModalOpen(false);
            fetchMateriList(selectedKey);
        } catch (error) {
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: error.response?.data?.message || "Gagal menyimpan pengaturan.",
                success: false
            });
            console.error(error);
        }
    };

    const handleContinueDraft = (materiKey) => {
        setSelectedKey(materiKey);
        setShowDraftsNotification(false);
        setIsDraftsModalOpen(false);
        setTimeout(() => setIsQuestionModalOpen(true), 150);
    };

    const handleDismissDraftNotification = () => {
        setShowDraftsNotification(false);
        setHasDismissedDraftNotif(true);
    };

    const currentMapelList = useMemo(() => Object.entries(materiList).map(([nama, data]) => ({ subject_id: data.subject_id, nama_mapel: nama })).filter(m => m.subject_id), [materiList]);


    return (
        <>
            <AnimatePresence>
                {notif.isOpen && (
                    <Notification
                        isOpen={notif.isOpen}
                        onClose={handleCloseNotif}
                        title={notif.title}
                        message={notif.message}
                        success={notif.success}
                    />
                )}
                {confirmModal.isOpen && (
                     <Notification
                        isOpen={confirmModal.isOpen}
                        onClose={handleCloseConfirmModal}
                        onConfirm={confirmModal.onConfirm}
                        title={confirmModal.title}
                        message={confirmModal.message}
                        isConfirmation={true}
                        success={false}
                        confirmText="Ya, Hapus"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDraftsNotification && (
                    <Notification
                        isOpen={showDraftsNotification}
                        onClose={handleDismissDraftNotification}
                        onConfirm={() => {
                            handleDismissDraftNotification();
                            setIsDraftsModalOpen(true);
                        }}
                        title="Anda Memiliki Draf Materi"
                        message={`Anda memiliki ${drafts.length} draf materi yang belum selesai. Ingin melanjutkannya?`}
                        isConfirmation={true}
                        confirmText="Lanjutkan"
                        cancelText="Tidak"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAddChapterModalOpen && <AddChapterModal isOpen onClose={() => setIsAddChapterModalOpen(false)} onSubmit={handleAddChapterSubmit} mapelList={currentMapelList} jenjang={selectedFilterKey} />}
                 {isDraftsModalOpen && (
                    <DraftsModal
                        isOpen={isDraftsModalOpen}
                        onClose={() => setIsDraftsModalOpen(false)}
                        allData={materiList}
                        drafts={drafts}
                        onContinue={handleContinueDraft}
                        onDraftDeleted={fetchDrafts}
                    />
                )}
                 {isBankSoalOpen && <BankSoalMateriModal isOpen onClose={() => setIsBankSoalOpen(false)} onQuestionsAdded={handleQuestionsFromBankAdded} />}
                 {isEditModalOpen && <EditQuestionModal isOpen onClose={() => setIsEditModalOpen(false)} onSubmit={handleUpdateQuestion} questionData={editingQuestion} />}
                 {isSettingsModalOpen && (
                    <ChapterSettingsModal
                        isOpen={isSettingsModalOpen}
                        onClose={() => setIsSettingsModalOpen(false)}
                        onSave={handleSaveSettings}
                        chapterData={selectedChapterForSettings}
                    />
                )}
            </AnimatePresence>
            {isQuestionModalOpen && <QuestionFormModal isOpen onClose={() => setIsQuestionModalOpen(false)} onSubmit={handleBatchQuestionSubmit} chapterId={selectedKey} />}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col flex-grow h-full">
                <div className="grid md:grid-cols-12 flex-grow h-full">
                    <div className="md:col-span-4 lg:col-span-3 border-r border-gray-200 flex flex-col h-full">
                        <div className="p-4 border-b flex-shrink-0">
                            <label className="text-sm font-bold text-gray-600 mb-1 block">Pilih Jenjang & Kelas</label>
                            <CustomSelect
                                options={jenjangSelectOptions}
                                value={selectedFilterKey}
                                onChange={setSelectedFilterKey}
                            />
                        </div>
                        <div className="flex-grow overflow-y-auto p-2">
                             {isLoading ? (
                                <div className="p-10 flex justify-center"><FiLoader className="animate-spin text-2xl text-sesm-teal"/></div>
                            ) : Object.keys(materiList).length > 0 ? (
                                Object.keys(materiList).sort().map(mapel => (
                                    <div key={mapel}>
                                        <h3 className="font-bold text-sesm-teal mt-4 px-2 text-sm uppercase">{mapel}</h3>
                                        <div className="space-y-1 mt-1">
                                            {materiList[mapel].chapters.sort((a,b) => a.judul.localeCompare(b.judul)).map(m => (
                                                <div key={m.materiKey} className={`group w-full p-2 rounded-md flex items-center ${selectedKey === m.materiKey ? 'bg-sesm-teal/20' : 'hover:bg-gray-100'}`}>
                                                    <button onClick={() => setSelectedKey(m.materiKey)} className={`flex-grow flex justify-between items-center text-left pr-2 text-sm overflow-hidden ${selectedKey === m.materiKey ? 'font-bold text-sesm-deep' : 'text-gray-700'}`}>
                                                        <span className="truncate">{m.judul}</span>
                                                        <FiChevronRight className="flex-shrink-0"/>
                                                    </button>
                                                    <button onClick={e => { e.stopPropagation(); handleDeleteChapter(m.materiKey, m.judul); }} className="p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 flex-shrink-0" title="Hapus"> {/* Tambah flex-shrink-0 */}
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="p-4 text-center text-gray-500">Tidak ada materi untuk jenjang ini.</p>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-8 lg:col-span-9 flex flex-col h-full">
                        <div className="p-6 flex-shrink-0">
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                                <h1 className="text-3xl font-bold text-sesm-deep">Manajemen Materi & Nilai</h1>
                                <p className="text-gray-500 mt-1">Buat materi baru, kelola soal, dan lihat hasil pengerjaan siswa.</p>

                                <div className="flex items-center gap-3 my-6">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsDraftsModalOpen(true)}
                                        className="relative flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-500 shadow-sm"
                                    >
                                        <FiFileText />
                                        <span>Draf</span>
                                        {drafts.length > 0 && (
                                            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white">
                                                {drafts.length}
                                            </span>
                                        )}
                                    </motion.button>

                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsBankSoalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-sesm-teal text-sesm-deep rounded-lg font-semibold hover:bg-sesm-teal/10 shadow-sm" title="Buka Bank Soal"><FiBookOpen/> Bank Soal</motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => onNavigate('manajemenNilai')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 shadow-sm"><FiTrendingUp /> Manajemen Nilai</motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsAddChapterModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-sesm-teal text-white rounded-lg font-semibold shadow-sm"><FiPlus /> Buat Materi</motion.button>
                                </div>
                            </motion.div>
                        </div>
                        <div className="border-t-2 border-dashed border-gray-200 mx-6 flex-shrink-0"></div>
                        <div className="flex-grow overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                <motion.div key={selectedMateri ? selectedMateri.materiKey : 'dashboard'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="h-full">
                                    {!selectedMateri ? <DashboardView userName={user?.nama} stats={stats} /> :
                                        isDetailLoading ? <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal" /></div> : (
                                            <div>
                                                <div className="pb-4 mb-4">
                                                    <div className="flex justify-between items-start gap-4 mb-4">
                                                        <h2 className="text-2xl font-bold text-sesm-deep">{selectedMateri.judul}</h2>
                                                        <div className="flex-shrink-0 flex gap-2">
                                                            <button onClick={() => handleOpenSettingsModal(selectedMateri)} className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-300">
                                                                <FiSettings/> Pengaturan
                                                            </button>
                                                            <button onClick={() => setIsQuestionModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-sesm-deep text-white rounded-lg font-semibold text-sm">
                                                                <FiPlus /> Tambah Soal
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                                                        <div><p className="font-semibold text-sm">Penilaian Manual {selectedMateri.grading_mode === 'manual' ? 'Aktif' : 'Nonaktif'}</p><p className="text-xs text-gray-500">{selectedMateri.grading_mode === 'manual' ? 'Guru akan menilai jawaban esai.' : 'Sistem menilai otomatis (hanya PG).'}</p></div>
                                                        <ToggleSwitch
                                                            enabled={selectedMateri.grading_mode === 'manual'}
                                                            onToggle={() => handleGradingModeChange(selectedMateri.chapter_id, selectedMateri.grading_mode)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-gray-700">Daftar Soal ({selectedMateri.questions?.length || 0})</h3>
                                                    <button onClick={handleDeleteAllQuestions} disabled={!selectedMateri.questions || selectedMateri.questions.length === 0} className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-semibold text-xs hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500"><FiTrash2 /> Hapus Semua Soal</button>
                                                </div>
                                                <div className="space-y-3 pr-2">
                                                     {selectedMateri.questions && selectedMateri.questions.length > 0 ? selectedMateri.questions.map((q, i) => {
                                                        const creatorAvatar = q.creator_avatar
                                                            ? (q.creator_avatar.startsWith('http') ? q.creator_avatar : `${API_URL}/${q.creator_avatar}`)
                                                            : `https://api.dicebear.com/7.x/initials/svg?seed=${q.creator_name || 'G'}`;

                                                        return (
                                                            <motion.div key={q.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="group bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-grow">
                                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                                            <img src={creatorAvatar} alt={q.creator_name} className="w-6 h-6 rounded-full object-cover"/>
                                                                            <span>Dibuat oleh <strong>{q.creator_name || 'Guru'}</strong></span>
                                                                        </div>
                                                                        <p className="font-semibold text-gray-800">{i + 1}. {q.pertanyaan}</p>

                                                                        {q.options && q.options.length > 0 && (
                                                                            <div className='mt-3 space-y-2 text-sm'>
                                                                                {q.options.map((opt, optIndex) => (
                                                                                    <p key={optIndex} className={`flex items-start gap-2 ${opt === q.correctAnswer ? 'text-green-700 font-bold' : 'text-gray-700'}`}>
                                                                                        <span className='font-mono'>{toAlpha(optIndex)}.</span>
                                                                                        <span>{opt}</span>
                                                                                        {opt === q.correctAnswer && <FiCheckCircle className="text-green-600 mt-0.5" />}
                                                                                    </p>
                                                                                ))}
                                                                            </div>
                                                                        )}

                                                                        {(q.jawaban_esai) && (
                                                                            <div className="mt-3 pt-2 border-t border-dashed">
                                                                                <p className="text-sm font-semibold text-blue-700">Kunci Jawaban Esai:</p>
                                                                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{q.jawaban_esai}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button onClick={() => handleOpenEditModal(q)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit Soal"><FiEdit size={16}/></button>
                                                                        <button onClick={() => handleDeleteQuestion(q.id, q.pertanyaan)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus Soal"><FiTrash2 size={16} /></button>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    }) : <p className="text-center text-gray-500 py-8">Belum ada soal.</p>}
                                                </div>
                                            </div>
                                        )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManajemenMateri;