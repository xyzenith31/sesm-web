// contoh-sesm-web/pages/admin/ManajemenKuis.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiChevronRight, FiBookOpen, FiTrash2, FiLoader, FiGrid,
    FiCheckSquare, FiCopy, FiEdit, FiFileText, FiAlertTriangle, FiTrendingUp, FiSettings,
    FiSearch
} from 'react-icons/fi';
import DataService from '../../services/dataService';
import CreateQuizModal from '../../components/admin/CreateQuizModal';
import AddQuestionToQuizModal from '../../components/admin/AddQuestionToQuizModal';
import { useAuth } from '../../hooks/useAuth';
import BankSoalQuizModal from '../../components/admin/BankSoalModal';
import EditQuestionToQuizModal from '../../components/admin/EditQuestionToQuizModal';
import DraftQuizModal from '../../components/admin/DraftQuizModal';
import QuizSettingsModal from '../../components/admin/QuizSettingsModal';
import Notification from '../../components/ui/Notification';
import CustomSelect from '../../components/ui/CustomSelect';

const StatCard = ({ icon: Icon, value, label, color }) => ( <div className="bg-gray-100 p-4 rounded-lg flex-1 border hover:border-sesm-teal transition-colors"><div className="flex items-center"><Icon className={`text-xl mr-3 ${color}`} /><div><p className="text-xl font-bold text-sesm-deep">{value}</p><p className="text-xs text-gray-500 font-semibold">{label}</p></div></div></div> );
const DashboardView = ({ userName, stats }) => ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col justify-center h-full text-center px-4"><FiBookOpen className="text-6xl text-gray-300 mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-800">Selamat Datang, {userName || 'Guru'}!</h2><p className="text-gray-500 max-w-md mx-auto mb-8">Pilih kuis dari daftar di sebelah kiri untuk melihat detail atau kelola soal. Gunakan tombol di atas untuk membuat kuis baru.</p><div className="space-y-6 text-left"><div><h3 className="font-bold text-gray-700 mb-3">Ringkasan Kuis</h3><div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"><StatCard icon={FiGrid} value={stats.totalQuizzes} label="Total Kuis" color="text-blue-500" /><StatCard icon={FiCheckSquare} value={stats.totalQuestions} label="Total Soal" color="text-orange-500" /></div></div></div></motion.div> );

const ManajemenKuis = ({ onNavigate }) => {
    const { user } = useAuth();
    const API_URL = 'http://localhost:8080';
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [isCreateQuizOpen, setCreateQuizOpen] = useState(false);
    const [isAddQuestionOpen, setAddQuestionOpen] = useState(false);
    const [isBankSoalOpen, setBankSoalOpen] = useState(false);
    const [isEditQuestionOpen, setEditQuestionOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isDraftQuizOpen, setDraftQuizOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const [drafts, setDrafts] = useState([]);
    const [showDraftsNotification, setShowDraftsNotification] = useState(false);

    const [notif, setNotif] = useState({
        isOpen: false,
        title: '',
        message: '',
        success: true,
        isConfirmation: false,
        onConfirm: () => {}
    });

    const handleCloseNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));


    const fetchQuizzes = useCallback((selectIdAfterFetch = null) => {
        setLoading(true);
        DataService.getAllQuizzes()
            .then(res => {
                setQuizzes(res.data);
                if (selectIdAfterFetch) {
                    const updatedQuiz = res.data.find(q => q.id === selectIdAfterFetch);
                    if (updatedQuiz) {
                        setSelectedQuiz(updatedQuiz);
                    }
                }
            })
            .catch(err => {
                console.error(err);
                setNotif({ isOpen: true, title: "Error", message: "Gagal memuat daftar kuis.", success: false });
            })
            .finally(() => setLoading(false));
    }, []);

    const fetchDrafts = useCallback(async () => {
        try {
            const response = await DataService.getAllDrafts();
            if (response.data && response.data.length > 0) {
                const quizDrafts = response.data.filter(d => d.draft_key.startsWith('quiz_'));
                if (quizDrafts.length > 0) {
                    setDrafts(quizDrafts);
                    setShowDraftsNotification(true);
                } else {
                    setDrafts([]);
                }
            } else {
                setDrafts([]);
            }
        } catch (error) {
            console.error("Gagal mengambil draft kuis:", error);
            setNotif({ isOpen: true, title: "Error", message: "Gagal memuat draf kuis.", success: false });
        }
    }, []);

    useEffect(() => {
        fetchQuizzes();
        fetchDrafts();
    }, [fetchQuizzes, fetchDrafts]);

    const fetchQuizDetails = useCallback((quizId) => {
        setDetailLoading(true);
        DataService.getQuizDetailsForAdmin(quizId)
            .then(res => setQuestions(res.data))
            .catch(err => {
                console.error(err);
                setNotif({ isOpen: true, title: "Error", message: "Gagal memuat detail soal kuis.", success: false });
            })
            .finally(() => setDetailLoading(false));
     }, []);

    useEffect(() => { if (selectedQuiz) fetchQuizDetails(selectedQuiz.id); else setQuestions([]); }, [selectedQuiz, fetchQuizDetails]);

    const handleCreateQuiz = async (formData) => {
        try {
            await DataService.createQuiz(formData);
            fetchQuizzes();
            setNotif({ isOpen: true, title: "Sukses", message: "Kuis baru berhasil dibuat!", success: true });
        } catch (error) {
            console.error("Gagal membuat kuis:", error);
            setNotif({ isOpen: true, title: "Gagal", message: error.response?.data?.message || "Gagal membuat kuis baru.", success: false });
        }
    };

    const handleDeleteQuiz = (e, quizId, quizTitle) => {
        e.stopPropagation();
        setNotif({
            isOpen: true,
            title: "Konfirmasi Hapus",
            message: `Yakin ingin menghapus kuis "${quizTitle}" beserta semua soal di dalamnya?`,
            isConfirmation: true,
            success: false,
            onConfirm: () => confirmDeleteQuiz(quizId, quizTitle)
        });
    };

    const confirmDeleteQuiz = async (quizId, quizTitle) => {
        try {
            await DataService.deleteQuiz(quizId);
            fetchQuizzes();
            if (selectedQuiz?.id === quizId) {
                setSelectedQuiz(null);
            }
            setNotif({ isOpen: true, title: "Sukses", message: `Kuis "${quizTitle}" berhasil dihapus.`, success: true, isConfirmation: false });
        } catch (e) {
            console.error("Gagal menghapus kuis:", e);
            setNotif({ isOpen: true, title: "Gagal", message: e.response?.data?.message || "Gagal menghapus kuis.", success: false, isConfirmation: false });
        }
    };

    const handleDeleteAllQuestions = (quizId) => {
        if (!selectedQuiz || questions.length === 0) {
            setNotif({ isOpen: true, title: "Info", message: "Tidak ada soal untuk dihapus.", success: true });
            return;
        }
        setNotif({
            isOpen: true,
            title: "Konfirmasi Hapus Semua Soal",
            message: `Anda yakin ingin menghapus SEMUA (${questions.length}) soal dari kuis "${selectedQuiz.title}"?`,
            isConfirmation: true,
            success: false,
            onConfirm: () => confirmDeleteAllQuestions(quizId)
        });
    };

    const confirmDeleteAllQuestions = async (quizId) => {
         try {
            for (const question of questions) {
                await DataService.deleteQuestionFromQuiz(question.id);
            }
            setNotif({ isOpen: true, title: "Sukses", message: "Semua soal berhasil dihapus.", success: true, isConfirmation: false });
            fetchQuizDetails(quizId);
            fetchQuizzes(quizId);
        } catch (error) {
            console.error("Gagal menghapus semua soal:", error);
            setNotif({ isOpen: true, title: "Gagal", message: "Gagal menghapus semua soal.", success: false, isConfirmation: false });
        }
    };

    const handleSaveSettings = async (quizId, settings) => {
        try {
            await DataService.updateQuizSettings(quizId, settings);
            setNotif({ isOpen: true, title: "Sukses", message: "Pengaturan berhasil disimpan!", success: true });
            setIsSettingsModalOpen(false);
            fetchQuizzes(quizId);
        } catch (error) {
            console.error("Gagal menyimpan pengaturan:", error);
            setNotif({ isOpen: true, title: "Gagal", message: "Gagal menyimpan pengaturan kuis.", success: false });
        }
    };

    const handleQuestionsFromBankAdded = (updatedQuizId) => {
        setBankSoalOpen(false);
        setNotif({ isOpen: true, title: "Sukses", message: "Soal berhasil ditambahkan dari bank!", success: true });
        fetchQuizzes(updatedQuizId);
        if (updatedQuizId === selectedQuiz?.id) {
            fetchQuizDetails(updatedQuizId);
        }
    };

    const handleBatchAddQuestions = async (quizId, questionsArray) => {
        setDetailLoading(true);
        try {
            for (const q of questionsArray) {
                const formData = new FormData();
                formData.append('question_text', q.question);
                formData.append('question_type', q.type);
                if (q.type.includes('pilihan-ganda')) {
                    const formattedOptions = q.options.map(opt => ({ text: opt, isCorrect: opt === q.correctAnswer }));
                    if (formattedOptions.filter(opt => opt.isCorrect).length === 0 && q.options.filter(opt => opt.trim() !== '').length > 0) {
                        throw new Error(`Soal "${q.question.substring(0,20)}..." belum punya jawaban.`);
                    }
                    formData.append('options', JSON.stringify(formattedOptions));
                }
                formData.append('essayAnswer', q.essayAnswer || '');

                const links = q.media.filter(m => m.type === 'link').map(m => m.url);
                const files = q.media.filter(m => m.type === 'file').map(m => m.file);

                if (links.length > 0) formData.append('links', JSON.stringify(links));
                if (files.length > 0) files.forEach(file => formData.append('mediaFiles', file));

                await DataService.addQuestionToQuiz(quizId, formData);
            }
             setNotif({ isOpen: true, title: "Sukses", message: `${questionsArray.length} soal berhasil dipublikasikan!`, success: true });
        } catch (error) {
             console.error("Gagal menambah soal batch:", error);
             setNotif({ isOpen: true, title: "Gagal", message: `Gagal menambah soal: ${error.message}`, success: false });
        } finally {
            fetchQuizDetails(quizId);
            fetchQuizzes(quizId);
        }
    };

    const handleOpenEditModal = (question) => { setEditingQuestion(question); setEditQuestionOpen(true); };

    const handleUpdateQuestion = async (questionId, updatedData) => {
        try {
            await DataService.updateQuestionInQuiz(questionId, updatedData);
            setEditQuestionOpen(false);
            setEditingQuestion(null);
            setNotif({ isOpen: true, title: "Sukses", message: "Soal berhasil diperbarui!", success: true });
            fetchQuizDetails(selectedQuiz.id);
        } catch (error) {
            console.error("Gagal memperbarui soal:", error);
             setNotif({ isOpen: true, title: "Gagal", message: error.response?.data?.message || "Gagal memperbarui soal.", success: false });
        }
    };

    const handleDeleteQuestion = (questionId, questionText) => {
        setNotif({
            isOpen: true,
            title: "Konfirmasi Hapus Soal",
            message: `Yakin ingin menghapus soal "${questionText.substring(0, 30)}..."?`,
            isConfirmation: true,
            success: false,
            onConfirm: () => confirmDeleteQuestion(questionId, questionText)
        });
    };

    const confirmDeleteQuestion = async (questionId, questionText) => {
        try {
            await DataService.deleteQuestionFromQuiz(questionId);
            setNotif({ isOpen: true, title: "Sukses", message: "Soal berhasil dihapus.", success: true, isConfirmation: false });
            fetchQuizDetails(selectedQuiz.id);
            fetchQuizzes(selectedQuiz.id);
        } catch (error) {
             console.error("Gagal menghapus soal:", error);
             setNotif({ isOpen: true, title: "Gagal", message: "Gagal menghapus soal.", success: false, isConfirmation: false });
        }
    };

    const handleContinueQuestionDraft = (quizId) => {
        const quizToSelect = quizzes.find(q => q.id === quizId);
        if (quizToSelect) {
            setSelectedQuiz(quizToSelect);
            setShowDraftsNotification(false);
            setDraftQuizOpen(false);
            setTimeout(() => setAddQuestionOpen(true), 100);
        } else {
             setNotif({ isOpen: true, title: "Error", message: "Kuis untuk draf ini tidak ditemukan. Mungkin sudah dihapus.", success: false });
        }
    };
    
    // Filter kuis berdasarkan search term (bukan debounced lagi)
    const filteredQuizzes = useMemo(() => {
        if (!searchTerm) return quizzes;
        return quizzes.filter(quiz =>
            quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [quizzes, searchTerm]);

    const stats = useMemo(() => ({ totalQuizzes: quizzes.length, totalQuestions: quizzes.reduce((sum, quiz) => sum + (quiz.question_count || 0), 0) }), [quizzes]);

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
                        isConfirmation={notif.isConfirmation}
                        onConfirm={notif.onConfirm}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showDraftsNotification && (
                    <Notification
                        isOpen={showDraftsNotification}
                        onClose={() => setShowDraftsNotification(false)}
                        onConfirm={() => { setShowDraftsNotification(false); setDraftQuizOpen(true); }}
                        title="Anda Memiliki Draf Soal Kuis"
                        message={`Anda memiliki ${drafts.length} draf soal kuis yang belum selesai. Ingin melanjutkannya?`}
                        isConfirmation={true} confirmText="Ya, Lanjutkan" cancelText="Nanti Saja" success={true}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isCreateQuizOpen && <CreateQuizModal isOpen={isCreateQuizOpen} onClose={() => setCreateQuizOpen(false)} onSubmit={handleCreateQuiz} />}
                {isAddQuestionOpen && <AddQuestionToQuizModal isOpen={isAddQuestionOpen} onClose={() => setAddQuestionOpen(false)} onSubmit={handleBatchAddQuestions} quizId={selectedQuiz?.id} />}
                {isBankSoalOpen && <BankSoalQuizModal isOpen={isBankSoalOpen} onClose={() => setBankSoalOpen(false)} onQuestionsAdded={handleQuestionsFromBankAdded} />}
                {isEditQuestionOpen && <EditQuestionToQuizModal isOpen={isEditQuestionOpen} onClose={() => setEditQuestionOpen(false)} onSubmit={handleUpdateQuestion} questionData={editingQuestion} />}
                {isDraftQuizOpen && (
                    <DraftQuizModal
                        isOpen={isDraftQuizOpen} onClose={() => setDraftQuizOpen(false)} allQuizzes={quizzes}
                        drafts={drafts} onContinueQuestionDraft={handleContinueQuestionDraft} onDraftDeleted={fetchDrafts}
                    />
                )}
                {isSettingsModalOpen && <QuizSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onSave={handleSaveSettings} quizData={selectedQuiz} />}
            </AnimatePresence>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col flex-grow">
                <div className="grid md:grid-cols-12 flex-grow">
                    <div className="md:col-span-4 lg:col-span-3 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                             <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari kuis..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 pl-9 border rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-sesm-teal"
                                />
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto p-2">
                            {loading ? (<div className="p-10 flex justify-center"><FiLoader className="animate-spin text-2xl text-sesm-teal"/></div>) : (
                                <div className="space-y-1">
                                    {filteredQuizzes.map(quiz => (
                                        <div key={quiz.id} className={`group w-full p-3 rounded-lg flex justify-between items-center transition-colors ${selectedQuiz?.id === quiz.id ? 'bg-sesm-teal/20' : 'hover:bg-gray-100'}`}>
                                            <button onClick={() => setSelectedQuiz(quiz)} className="flex-grow text-left">
                                                <p className={`font-semibold ${selectedQuiz?.id === quiz.id ? 'text-sesm-deep' : 'text-gray-800'}`}>{quiz.title}</p>
                                                <p className="text-xs text-gray-500">{quiz.question_count} Soal</p>
                                            </button>
                                            <button onClick={(e) => handleDeleteQuiz(e, quiz.id, quiz.title)} className="p-2 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 ml-2" title="Hapus Kuis">
                                                <FiTrash2 size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-8 lg:col-span-9 flex flex-col">
                        <div className="p-6 flex-shrink-0">
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                                <h1 className="text-3xl font-bold text-sesm-deep">Manajemen Kuis</h1>
                                <p className="text-gray-500 mt-1">Buat kuis baru, kelola soal, atau lihat hasil pengerjaan siswa.</p>
                                
                                {/* --- KUMPULAN TOMBOL BARU SESUAI GAMBAR --- */}
                                <div className="flex items-center gap-3 my-6">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setDraftQuizOpen(true)}
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
                                    
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setBankSoalOpen(true) } className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-sesm-teal text-sesm-deep rounded-lg font-semibold hover:bg-sesm-teal/10 shadow-sm"><FiBookOpen/> Bank Soal</motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => onNavigate('evaluasiKuis')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 shadow-sm"><FiTrendingUp /> Manajemen Nilai</motion.button>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCreateQuizOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-sesm-teal text-white rounded-lg font-semibold shadow-sm"><FiPlus /> Buat Kuis</motion.button>
                                </div>

                            </motion.div>
                        </div>
                        <div className="border-t-2 border-dashed border-gray-200 mx-6"></div>
                        <div className="flex-grow overflow-y-auto p-6">
                            <AnimatePresence mode="wait">
                                <motion.div key={selectedQuiz ? selectedQuiz.id : 'dashboard'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="h-full">
                                    {!selectedQuiz ? ( <DashboardView userName={user?.nama} stats={stats} />
                                    ) : detailLoading ? ( <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                                    ) : (
                                        <div>
                                            <div className="pb-4 mb-4 flex-shrink-0">
                                                <div className="flex justify-between items-start gap-4">
                                                    <h2 className="text-2xl font-bold text-sesm-deep">{selectedQuiz.title}</h2>
                                                    <div className="flex-shrink-0 flex gap-2">
                                                        <button onClick={() => setAddQuestionOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-sesm-deep text-white rounded-lg font-semibold text-sm hover:bg-opacity-90"><FiPlus/> Tambah Soal</button>
                                                        <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-300"><FiSettings/> Pengaturan</button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{selectedQuiz.description}</p>
                                            </div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-gray-700">Daftar Soal ({questions.length})</h3>
                                                <button onClick={() => handleDeleteAllQuestions(selectedQuiz.id)} disabled={questions.length === 0} className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg font-semibold text-xs hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500"><FiTrash2 /> Hapus Semua Soal</button>
                                            </div>
                                            <div className="space-y-3 max-h-[calc(100vh-35rem)] overflow-y-auto pr-2">
                                                {questions.length > 0 ? questions.map((q, index) => {
                                                    const creatorAvatar = q.creator_avatar
                                                        ? (q.creator_avatar.startsWith('http') ? q.creator_avatar : `${API_URL}/${q.creator_avatar}`)
                                                        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(q.creator_name || 'G')}`;

                                                    return (
                                                        <motion.div key={q.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="group bg-gray-50 hover:bg-gray-100 p-4 rounded-lg border">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex-grow">
                                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                                        <img src={creatorAvatar} alt={q.creator_name} className="w-6 h-6 rounded-full object-cover bg-gray-200"/>
                                                                        <span>Dibuat oleh <strong>{q.creator_name || 'Tidak diketahui'}</strong></span>
                                                                    </div>
                                                                    <p className="font-semibold text-gray-800">{index + 1}. {q.question_text}</p>
                                                                    {q.options && q.options.find(opt => opt.is_correct) && (
                                                                        <p className="text-sm text-green-600 font-bold mt-1">Jawaban: {q.options.find(opt => opt.is_correct).option_text}</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleOpenEditModal(q)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit Soal"><FiEdit size={16}/></button>
                                                                    <button onClick={() => handleDeleteQuestion(q.id, q.question_text)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus Soal"><FiTrash2 size={16}/></button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                }) : (
                                                    <p className="text-center text-gray-500 py-8">Belum ada soal untuk kuis ini.</p>
                                                )}
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

export default ManajemenKuis;