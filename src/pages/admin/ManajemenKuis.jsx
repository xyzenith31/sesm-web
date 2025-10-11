import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiChevronRight, FiBookOpen, FiTrash2, FiLoader, FiGrid, FiCheckSquare, FiCopy } from 'react-icons/fi';
import DataService from '../../services/dataService';
import CreateQuizModal from '../../components/admin/CreateQuizModal';
import AddQuestionToQuizModal from '../../components/admin/AddQuestionToQuizModal';
import { useAuth } from '../../hooks/useAuth';
import BankSoalModal from '../../components/admin/BankSoalModal';

// --- Helper Components ---
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

const DashboardView = ({ userName, stats, onCreateQuiz, onOpenBankSoal }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col justify-center h-full text-center px-4">
        <FiBookOpen className="text-6xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Selamat Datang, {userName || 'Guru'}!</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">Pilih kuis dari daftar di sebelah kiri untuk melihat detail atau mengelola soal.</p>
        
        <div className="space-y-6 text-left">
             <div>
                <h3 className="font-bold text-gray-700 mb-3">Ringkasan Kuis</h3>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <StatCard icon={FiGrid} value={stats.totalQuizzes} label="Total Kuis" color="text-blue-500" />
                    <StatCard icon={FiCheckSquare} value={stats.totalQuestions} label="Total Soal" color="text-orange-500" />
                </div>
            </div>
             <div>
                <h3 className="font-bold text-gray-700 mb-3">Aksi Cepat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={onCreateQuiz} className="flex items-center justify-center gap-3 p-4 bg-sesm-teal/10 text-sesm-deep rounded-xl hover:bg-sesm-teal/20 transition-colors">
                        <FiPlus size={20}/> <span className="font-semibold">Buat Kuis Baru</span>
                    </button>
                     {/* --- PERBAIKAN DI SINI: Atribut `disabled` dan `cursor-not-allowed` dihapus --- */}
                     <button 
                        onClick={onOpenBankSoal} 
                        className="flex items-center justify-center gap-3 p-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                     >
                        <FiCopy size={20}/> <span className="font-semibold">Bank Soal</span>
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
);


const ManajemenKuis = () => {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    
    const [isCreateQuizOpen, setCreateQuizOpen] = useState(false);
    const [isAddQuestionOpen, setAddQuestionOpen] = useState(false);
    const [isBankSoalOpen, setBankSoalOpen] = useState(false);


    const fetchQuizzes = useCallback(() => {
        setLoading(true);
        DataService.getAllQuizzes()
            .then(res => setQuizzes(res.data))
            .catch(err => console.error("Gagal fetch kuis:", err))
            .finally(() => setLoading(false));
    }, []);

    const fetchQuizDetails = useCallback((quizId) => {
        setDetailLoading(true);
        DataService.getQuizDetailsForAdmin(quizId)
            .then(res => setQuestions(res.data))
            .catch(err => console.error("Gagal fetch detail kuis:", err))
            .finally(() => setDetailLoading(false));
    }, []);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    useEffect(() => {
        if (selectedQuiz) {
            fetchQuizDetails(selectedQuiz.id);
        } else {
            setQuestions([]);
        }
    }, [selectedQuiz, fetchQuizDetails]);
    
    const handleCreateQuiz = async (formData) => {
        try {
            await DataService.createQuiz(formData);
            fetchQuizzes();
        } catch (error) {
            alert("Gagal membuat kuis.");
        }
    };
    
    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm("Yakin ingin menghapus kuis ini beserta semua soal di dalamnya?")) {
            try {
                await DataService.deleteQuiz(quizId);
                fetchQuizzes();
                setSelectedQuiz(null);
            } catch (error) {
                 alert("Gagal menghapus kuis.");
            }
        }
    };

    const handleAddQuestion = async (quizId, formData) => {
        try {
            await DataService.addQuestionToQuiz(quizId, formData);
            fetchQuizDetails(quizId);
            fetchQuizzes();
        } catch (error) {
            alert("Gagal menambah soal.");
        }
    };
    
    const handleQuestionsFromBankAdded = () => {
        setBankSoalOpen(false);
        if (selectedQuiz) {
            alert("Soal berhasil ditambahkan dari bank soal!");
            fetchQuizDetails(selectedQuiz.id);
            fetchQuizzes();
        }
    };

    const stats = useMemo(() => ({
        totalQuizzes: quizzes.length,
        totalQuestions: quizzes.reduce((sum, quiz) => sum + quiz.question_count, 0)
    }), [quizzes]);

    return (
        <>
            <AnimatePresence>
                {isCreateQuizOpen && <CreateQuizModal isOpen={isCreateQuizOpen} onClose={() => setCreateQuizOpen(false)} onSubmit={handleCreateQuiz} />}
                {isAddQuestionOpen && <AddQuestionToQuizModal isOpen={isAddQuestionOpen} onClose={() => setAddQuestionOpen(false)} onSubmit={handleAddQuestion} quizId={selectedQuiz?.id} />}
                {isBankSoalOpen && <BankSoalModal isOpen={isBankSoalOpen} onClose={() => setBankSoalOpen(false)} quizId={selectedQuiz?.id} onQuestionsAdded={handleQuestionsFromBankAdded} />}
            </AnimatePresence>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-sesm-deep">Manajemen Kuis</h1>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                if (!selectedQuiz) {
                                    alert("Pilih salah satu kuis dari daftar di bawah terlebih dahulu.");
                                    return;
                                }
                                setBankSoalOpen(true)
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-sesm-teal text-sesm-deep rounded-lg font-semibold hover:bg-sesm-teal/10"
                            title="Buka Bank Soal"
                        >
                            <FiCopy/> Bank Soal
                        </button>
                        <button onClick={() => setCreateQuizOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-sesm-teal text-white rounded-lg font-semibold hover:bg-sesm-deep">
                            <FiPlus/> Buat Kuis Baru
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="grid md:grid-cols-12 min-h-[calc(100vh-12rem)]">
                        {/* Left Pane: List */}
                        <div className="md:col-span-4 lg:col-span-3 border-r border-gray-200 flex flex-col">
                            <div className="p-3 border-b border-gray-200 flex-shrink-0">
                                <h2 className="font-bold text-gray-800">Daftar Kuis</h2>
                            </div>
                            <div className="flex-grow overflow-y-auto p-2">
                                {loading ? <div className="p-10 flex justify-center"><FiLoader className="animate-spin text-2xl text-sesm-teal"/></div> : (
                                    <div className="space-y-1">
                                        {quizzes.map(quiz => (
                                            <button key={quiz.id} onClick={() => setSelectedQuiz(quiz)} className={`w-full text-left p-3 rounded-lg flex justify-between items-center transition-colors ${selectedQuiz?.id === quiz.id ? 'bg-sesm-teal/20' : 'hover:bg-gray-100'}`}>
                                                <div>
                                                    <p className={`font-semibold ${selectedQuiz?.id === quiz.id ? 'text-sesm-deep' : 'text-gray-800'}`}>{quiz.title}</p>
                                                    <p className="text-xs text-gray-500">{quiz.question_count} Soal</p>
                                                </div>
                                                <FiChevronRight className={selectedQuiz?.id === quiz.id ? 'text-sesm-deep' : 'text-gray-400'}/>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Pane: Details */}
                        <div className="md:col-span-8 lg:col-span-9 p-6 overflow-y-auto">
                           {!selectedQuiz ? (
                                <DashboardView 
                                    userName={user?.nama} 
                                    stats={stats} 
                                    onCreateQuiz={() => setCreateQuizOpen(true)} 
                                    onOpenBankSoal={() => alert('Pilih kuis terlebih dahulu dari daftar di sebelah kiri.')} 
                                />
                           ) : detailLoading ? (
                                <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                           ) : (
                                <motion.div key={selectedQuiz.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="border-b border-gray-200 pb-4 mb-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <h2 className="text-2xl font-bold text-sesm-deep">{selectedQuiz.title}</h2>
                                            <div className="flex-shrink-0 flex gap-2">
                                                <button onClick={() => setAddQuestionOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-sesm-deep text-white rounded-lg font-semibold text-sm"><FiPlus/> Tambah Soal</button>
                                                <button onClick={() => handleDeleteQuiz(selectedQuiz.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><FiTrash2/></button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{selectedQuiz.description}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="font-bold text-gray-700">Daftar Soal</h3>
                                        {questions.length > 0 ? questions.map((q, index) => (
                                            <div key={q.id} className="bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors">
                                                <p className="font-semibold">{index + 1}. {q.question_text}</p>
                                                {q.options && q.options.map(opt => (
                                                    <p key={opt.id} className={`text-sm ml-4 ${opt.is_correct ? 'text-green-600 font-bold' : 'text-gray-600'}`}>- {opt.option_text}</p>
                                                ))}
                                            </div>
                                        )) : <p className="text-center text-gray-400 py-8">Belum ada soal untuk kuis ini.</p>}
                                    </div>
                                </motion.div>
                           )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManajemenKuis;