// contoh-sesm-web/pages/admin/ManajemenMateri.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiChevronRight, FiBookOpen, FiTrash2, FiLoader, FiGrid,
    FiCheckSquare, FiFileText, FiEdit, FiAlertCircle, FiTrendingUp, FiArchive, FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import DataService from '../../services/dataService';
import AddChapterModal from '../../components/mod/AddChapterModal';
import QuestionFormModal from '../../components/mod/QuestionFormModal';
import DraftsModal from '../../components/mod/DraftsModal';
import BankSoalMateriModal from '../../components/admin/BankSoalMateriModal';
import EditQuestionModal from '../../components/admin/EditQuestionModal';
import ChapterSettingsModal from '../../components/admin/ChapterSettingsModal';

const jenjangOptions = {
    'TK': { jenjang: 'TK', kelas: null },
    'SD Kelas 1': { jenjang: 'SD', kelas: 1 },
    'SD Kelas 2': { jenjang: 'SD', kelas: 2 },
    'SD Kelas 3': { jenjang: 'SD', kelas: 3 },
    'SD Kelas 4': { jenjang: 'SD', kelas: 4 },
    'SD Kelas 5': { jenjang: 'SD', kelas: 5 },
    'SD Kelas 6': { jenjang: 'SD', kelas: 6 },
};

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
    const [materiList, setMateriList] = useState({});
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedMateri, setSelectedMateri] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
    const [selectedFilterKey, setSelectedFilterKey] = useState('TK');
    const [isBankSoalOpen, setIsBankSoalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedChapterForSettings, setSelectedChapterForSettings] = useState(null);

    const fetchMateriList = useCallback((selectKeyAfterFetch = null) => {
        const { jenjang, kelas } = jenjangOptions[selectedFilterKey];
        setIsLoading(true);
        setError(null);
        if (!selectKeyAfterFetch) {
            setSelectedKey(null);
            setSelectedMateri(null);
        }
        DataService.getMateriForAdmin(jenjang, kelas).then(res => {
            setMateriList(res.data)
            if (selectKeyAfterFetch) {
                setSelectedKey(selectKeyAfterFetch);
            }
        }).catch(err => setError(err.response?.data?.message || "Gagal memuat data.")).finally(() => setIsLoading(false));
    }, [selectedFilterKey]);


    useEffect(() => { fetchMateriList(); }, [fetchMateriList]);

    const fetchDetailMateri = useCallback(() => {
        if (!selectedKey) { setSelectedMateri(null); return; }
        setIsDetailLoading(true);
        const materiInfo = Object.values(materiList).flatMap(m => m.chapters).find(m => m.materiKey === selectedKey);
        DataService.getDetailMateriForAdmin(selectedKey).then(res => setSelectedMateri({ ...materiInfo, questions: res.data.questions || [] })).catch(() => alert("Gagal memuat detail soal.")).finally(() => setIsDetailLoading(false));
    }, [selectedKey, materiList]);

    useEffect(() => { fetchDetailMateri(); }, [fetchDetailMateri]);
    
    const stats = useMemo(() => ({
        totalMapel: Object.keys(materiList).length,
        totalBab: Object.values(materiList).reduce((sum, mapel) => sum + (mapel.chapters?.length || 0), 0),
        totalSoal: Object.values(materiList).reduce((sum, mapel) => sum + (mapel.chapters?.reduce((cs, c) => cs + c.questionCount, 0) || 0), 0),
    }), [materiList]);

    const handleAddChapterSubmit = async (data) => {
        try { await DataService.addChapter(data); fetchMateriList(); } catch (e) { alert("Gagal: " + e.message); }
    };
    
    const handleQuestionsFromBankAdded = (targetMateriKey) => {
        setIsBankSoalOpen(false);
        alert("Soal berhasil ditambahkan dari bank!");
        fetchMateriList(targetMateriKey);
    };

    const handleDeleteChapter = async (materiKey) => {
        if (window.confirm("Yakin ingin menghapus materi ini beserta semua soal di dalamnya?")) {
            try { await DataService.deleteChapter(materiKey); fetchMateriList(); if (selectedKey === materiKey) setSelectedKey(null); } catch (e) { alert("Gagal menghapus."); }
        }
    };

    const handleBatchQuestionSubmit = async (newQuestions) => {
        if (!selectedKey) return;
        setIsDetailLoading(true);
        try {
            for (const q of newQuestions) {
                await DataService.addQuestion(selectedKey, q);
            }
            alert(`${newQuestions.length} soal berhasil dipublikasikan!`);
            fetchDetailMateri(); 
            fetchMateriList(selectedKey);
        } catch (e) { alert("Gagal publikasi."); } finally { setIsDetailLoading(false); }
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
            alert("Soal berhasil diperbarui!");
            fetchDetailMateri();
        } catch (error) {
            alert("Gagal memperbarui soal.");
            console.error(error);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm("Yakin ingin menghapus soal ini?")) return;
        try { await DataService.deleteQuestion(questionId); fetchDetailMateri(); fetchMateriList(selectedKey); } catch (e) { alert("Gagal menghapus."); }
    };

    const handleDeleteAllQuestions = async () => {
        if (!selectedMateri || !selectedMateri.questions || selectedMateri.questions.length === 0) {
            alert("Tidak ada soal untuk dihapus."); return;
        }
        if (window.confirm(`Anda yakin ingin menghapus SEMUA (${selectedMateri.questions.length}) soal dari materi "${selectedMateri.judul}"? Tindakan ini tidak dapat diurungkan.`)) {
            setIsDetailLoading(true);
            try {
                await Promise.all(selectedMateri.questions.map(q => DataService.deleteQuestion(q.id)));
                alert("Semua soal berhasil dihapus.");
                fetchDetailMateri(); fetchMateriList(selectedKey);
            } catch (e) { alert("Terjadi kesalahan."); } finally { setIsDetailLoading(false); }
        }
    };

    const handleGradingModeChange = async (chapterId, currentMode) => {
        const newMode = currentMode === 'otomatis' ? 'manual' : 'otomatis';
        try {
            await DataService.updateGradingMode(chapterId, newMode);
            fetchMateriList(selectedKey);
        } catch (err) {
            alert(`Gagal mengubah mode penilaian: ${err.response?.data?.message || err.message}`);
        }
    };
    
    const handleOpenSettingsModal = (chapter) => {
        setSelectedChapterForSettings(chapter);
        setIsSettingsModalOpen(true);
    };

    const handleSaveSettings = async (chapterId, newSettings) => {
        try {
            await DataService.updateChapterSettings(chapterId, newSettings);
            alert("Pengaturan berhasil disimpan!");
            setIsSettingsModalOpen(false);
            fetchMateriList(selectedKey); 
        } catch (error) {
            alert("Gagal menyimpan pengaturan.");
            console.error(error);
        }
    };

    const handleContinueDraft = (key) => { 
        setSelectedKey(key); 
        setIsDraftsModalOpen(false); 
        setTimeout(() => setIsQuestionModalOpen(true), 100);
    };

    const currentMapelList = useMemo(() => Object.entries(materiList).map(([nama, data]) => ({ id: data.subject_id, nama_mapel: nama })).filter(m => m.id), [materiList]);

    return (
        <>
            <AnimatePresence>
                {isAddChapterModalOpen && <AddChapterModal isOpen onClose={() => setIsAddChapterModalOpen(false)} onSubmit={handleAddChapterSubmit} mapelList={currentMapelList} jenjang={selectedFilterKey} />}
                {isDraftsModalOpen && <DraftsModal isOpen onClose={() => setIsDraftsModalOpen(false)} allData={materiList} onContinue={handleContinueDraft} />}
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

            {/* PERBAIKAN 1: Menambahkan min-h-[calc(100vh-4rem)] untuk mengisi ruang vertikal */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[calc(100vh-4rem)]">
                <div className="grid md:grid-cols-12 h-full">
                    <div className="md:col-span-4 lg:col-span-3 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b">
                            <label className="text-sm font-bold text-gray-600 mb-1 block">Pilih Jenjang & Kelas</label>
                            <select value={selectedFilterKey} onChange={e => setSelectedFilterKey(e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sesm-teal">
                                {Object.keys(jenjangOptions).map(key => <option key={key} value={key}>{key}</option>)}
                            </select>
                        </div>
                        <div className="flex-grow overflow-y-auto p-2">
                            {isLoading ? <div className="p-10 flex justify-center"><FiLoader className="animate-spin text-2xl" /></div> : error ? <div className="p-4 text-red-500 text-center"><FiAlertCircle className="mx-auto mb-2" />{error}</div> :
                                Object.keys(materiList).length > 0 ? Object.keys(materiList).sort().map(mapel => (
                                    <div key={mapel}>
                                        <h3 className="font-bold text-sesm-teal mt-4 px-2 text-sm uppercase">{mapel}</h3>
                                        <div className="space-y-1 mt-1">
                                            {materiList[mapel].chapters.map(m => (
                                                <div key={m.materiKey} className={`group w-full p-2 rounded-md flex items-center ${selectedKey === m.materiKey ? 'bg-sesm-teal/20' : 'hover:bg-gray-100'}`}>
                                                    <button onClick={() => setSelectedKey(m.materiKey)} className={`flex-grow flex justify-between items-center text-left pr-2 text-sm ${selectedKey === m.materiKey ? 'font-bold text-sesm-deep' : 'text-gray-700'}`}><span>{m.judul}</span><FiChevronRight /></button>
                                                    <button onClick={e => { e.stopPropagation(); handleDeleteChapter(m.materiKey); }} className="p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600" title="Hapus"><FiTrash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : <p className="p-4 text-center text-gray-500">Tidak ada materi.</p>}
                        </div>
                    </div>

                    <div className="md:col-span-8 lg:col-span-9 flex flex-col">
                        <div className="p-6">
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                                <h1 className="text-3xl font-bold text-sesm-deep">Manajemen Materi & Nilai</h1>
                                <p className="text-gray-500 mt-1">Buat materi baru, kelola soal, dan lihat hasil pengerjaan siswa.</p>
                                
                                {/* PERBAIKAN 2: Mengubah gaya tombol agar sesuai gambar */}
                                <div className="flex items-center gap-3 my-6">
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsDraftsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg font-bold hover:bg-yellow-500 shadow-sm"><FiFileText /> Draf</motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsBankSoalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-sesm-teal text-sesm-deep rounded-lg font-semibold hover:bg-sesm-teal/10 shadow-sm" title="Buka Bank Soal"><FiBookOpen/> Bank Soal</motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => onNavigate('manajemenNilai')} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 shadow-sm"><FiTrendingUp /> Manajemen Nilai</motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsAddChapterModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-sesm-teal text-white rounded-lg font-semibold shadow-sm"><FiPlus /> Buat Materi</motion.button>
                                </div>
                            </motion.div>
                        </div>
                        <div className="border-t-2 border-dashed border-gray-200 mx-6"></div>
                        <div className="flex-grow overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                <motion.div key={selectedMateri ? selectedMateri.materiKey : 'dashboard'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full">
                                    {!selectedMateri ? <DashboardView userName={user?.nama} stats={stats} /> :
                                        isDetailLoading ? <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl" /></div> : (
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
                                                        <ToggleSwitch enabled={selectedMateri.grading_mode === 'manual'} onToggle={() => handleGradingModeChange(selectedMateri.chapter_id, selectedMateri.grading_mode)} />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-gray-700">Daftar Soal ({selectedMateri.questions.length})</h3>
                                                    <button onClick={handleDeleteAllQuestions} disabled={!selectedMateri.questions || selectedMateri.questions.length === 0} className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-semibold text-xs hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500"><FiTrash2 /> Hapus Semua Soal</button>
                                                </div>
                                                <div className="space-y-3 max-h-[calc(100vh-35rem)] overflow-y-auto pr-2">
                                                    {selectedMateri.questions.length > 0 ? selectedMateri.questions.map((q, i) => (
                                                        <motion.div key={q.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="group bg-gray-50 hover:bg-gray-100 p-3 rounded-lg">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-grow">
                                                                    <p className="font-semibold">{i + 1}. {q.pertanyaan}</p>
                                                                    <p className="text-sm text-green-600 font-bold mt-1">Jawaban: {q.correctAnswer || q.jawaban_esai || "N/A"}</p>
                                                                </div>
                                                                <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleOpenEditModal(q)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit Soal"><FiEdit size={16}/></button>
                                                                    <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus Soal"><FiTrash2 size={16} /></button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )) : <p className="text-center text-gray-500 py-8">Belum ada soal.</p>}
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