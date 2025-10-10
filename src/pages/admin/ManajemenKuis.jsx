import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiChevronRight, FiBookOpen, FiTrash2, FiLoader } from 'react-icons/fi';
import DataService from '../../services/dataService';
import CreateQuizModal from '../../components/admin/CreateQuizModal';
import AddQuestionToQuizModal from '../../components/admin/AddQuestionToQuizModal';

const ManajemenKuis = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    
    const [isCreateQuizOpen, setCreateQuizOpen] = useState(false);
    const [isAddQuestionOpen, setAddQuestionOpen] = useState(false);

    const fetchQuizzes = useCallback(() => {
        setLoading(true);
        DataService.getAllQuizzes()
            .then(res => setQuizzes(res.data))
            .catch(err => console.error("Gagal fetch kuis:", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchQuizzes();
    }, [fetchQuizzes]);

    useEffect(() => {
        if (selectedQuiz) {
            setDetailLoading(true);
            DataService.getQuizDetailsForAdmin(selectedQuiz.id)
                .then(res => setQuestions(res.data))
                .catch(err => console.error("Gagal fetch detail kuis:", err))
                .finally(() => setDetailLoading(false));
        } else {
            setQuestions([]);
        }
    }, [selectedQuiz]);
    
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
            setDetailLoading(true);
            DataService.getQuizDetailsForAdmin(quizId)
                .then(res => setQuestions(res.data))
                .finally(() => setDetailLoading(false));
        } catch (error) {
            alert("Gagal menambah soal.");
        }
    }

    return (
        <>
            <AnimatePresence>
                {isCreateQuizOpen && <CreateQuizModal isOpen={isCreateQuizOpen} onClose={() => setCreateQuizOpen(false)} onSubmit={handleCreateQuiz} />}
                {isAddQuestionOpen && <AddQuestionToQuizModal isOpen={isAddQuestionOpen} onClose={() => setAddQuestionOpen(false)} onSubmit={handleAddQuestion} quizId={selectedQuiz?.id} />}
            </AnimatePresence>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-sesm-deep">Manajemen Kuis Pengetahuan</h1>
                    <button onClick={() => setCreateQuizOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-sesm-teal text-white rounded-lg font-semibold hover:bg-sesm-deep">
                        <FiPlus/> Buat Kuis Baru
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Daftar Kuis */}
                    <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-md h-[75vh] flex flex-col">
                        <h2 className="font-bold text-lg border-b pb-2 mb-2">Daftar Kuis</h2>
                        <div className="flex-grow overflow-y-auto pr-2">
                             {loading ? <FiLoader className="mx-auto my-10 animate-spin text-3xl"/> : (
                                <div className="space-y-2">
                                    {quizzes.map(quiz => (
                                        <button key={quiz.id} onClick={() => setSelectedQuiz(quiz)} className={`w-full text-left p-3 rounded-lg flex justify-between items-center ${selectedQuiz?.id === quiz.id ? 'bg-sesm-teal/20' : 'hover:bg-gray-100'}`}>
                                            <div>
                                                <p className="font-semibold">{quiz.title}</p>
                                                <p className="text-xs text-gray-500">{quiz.question_count} Soal</p>
                                            </div>
                                            <FiChevronRight/>
                                        </button>
                                    ))}
                                </div>
                             )}
                        </div>
                    </div>

                    {/* Detail Kuis */}
                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md min-h-[75vh]">
                        {selectedQuiz ? (
                            <div>
                                <div className="border-b pb-4 mb-4">
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-xl font-bold text-sesm-deep">{selectedQuiz.title}</h2>
                                        <div className="flex gap-2">
                                            <button onClick={() => setAddQuestionOpen(true)} className="flex-shrink-0 px-3 py-2 bg-sesm-deep text-white rounded-lg font-semibold text-sm"><FiPlus/> Tambah Soal</button>
                                            <button onClick={() => handleDeleteQuiz(selectedQuiz.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><FiTrash2/></button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">{selectedQuiz.description}</p>
                                </div>
                                {detailLoading ? <FiLoader className="mx-auto my-10 animate-spin text-3xl"/> : (
                                    <div className="space-y-3">
                                        {questions.length > 0 ? questions.map((q, index) => (
                                            <div key={q.id} className="bg-gray-50 p-3 rounded-md">
                                                <p className="font-semibold">{index + 1}. {q.question_text}</p>
                                                {q.options.map(opt => (
                                                    <p key={opt.id} className={`text-sm ml-4 ${opt.is_correct ? 'text-green-600 font-bold' : 'text-gray-600'}`}>- {opt.option_text}</p>
                                                ))}
                                            </div>
                                        )) : <p className="text-center text-gray-500">Belum ada soal.</p>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center items-center h-full text-center text-gray-400">
                                <FiBookOpen className="text-5xl mb-3"/>
                                <p className="font-semibold">Pilih kuis dari daftar</p>
                                <p className="text-sm">untuk melihat detail dan mengelola soal.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManajemenKuis;