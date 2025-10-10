import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiLoader, FiCalendar } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import DataService from '../../services/dataService';

const EvaluasiKuis = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [selectedQuizId, setSelectedQuizId] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    useEffect(() => {
        setLoadingQuizzes(true);
        DataService.getAllQuizzes()
            .then(res => setQuizzes(res.data))
            .catch(err => console.error("Gagal memuat daftar kuis:", err))
            .finally(() => setLoadingQuizzes(false));
    }, []);

    const fetchSubmissions = useCallback(() => {
        if (!selectedQuizId) {
            setSubmissions([]);
            return;
        }
        setLoadingSubmissions(true);
        DataService.getSubmissionsForQuiz(selectedQuizId)
            .then(res => {
                setSubmissions(res.data);
            })
            .catch(err => {
                // Log ini akan muncul di console browser
                console.error("Gagal memuat hasil kuis:", err); 
            })
            .finally(() => {
                setLoadingSubmissions(false);
            });
    }, [selectedQuizId]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const getTrophyColor = (index) => {
        if (index === 0) return 'text-yellow-400';
        if (index === 1) return 'text-slate-400';
        if (index === 2) return 'text-yellow-600';
        return 'text-gray-300';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-sesm-deep mb-6">Evaluasi Kuis Pengetahuan</h1>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="mb-6">
                    <label htmlFor="quiz-select" className="block text-sm font-bold text-gray-700 mb-2">
                        Pilih Kuis untuk Melihat Papan Skor
                    </label>
                    <select
                        id="quiz-select"
                        value={selectedQuizId}
                        onChange={(e) => setSelectedQuizId(e.target.value)}
                        className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                        disabled={loadingQuizzes}
                    >
                        <option value="">-- {loadingQuizzes ? 'Memuat kuis...' : 'Pilih Kuis'} --</option>
                        {quizzes.map(quiz => (
                            <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                        ))}
                    </select>
                </div>

                <div className="border-t pt-4">
                    <h2 className="text-xl font-bold text-sesm-deep mb-4">Papan Skor (Leaderboard)</h2>
                    {loadingSubmissions ? (
                        <div className="flex justify-center items-center h-48"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                    ) : !selectedQuizId ? (
                        <div className="text-center text-gray-400 py-16"><p>Silakan pilih kuis terlebih dahulu.</p></div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center text-gray-400 py-16"><p>Belum ada siswa yang mengerjakan kuis ini.</p></div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.map((sub, index) => (
                                <motion.div
                                    key={sub.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 w-12">
                                            <FaTrophy size={20} className={getTrophyColor(index)} />
                                            <span className="font-bold text-lg text-gray-600">{index + 1}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{sub.student_name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <FiCalendar size={12}/> {new Date(sub.submission_date).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-sesm-teal">{sub.score}</p>
                                        <p className="text-xs font-semibold text-gray-500">Poin</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluasiKuis;