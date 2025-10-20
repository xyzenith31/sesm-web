// contoh-sesm-web/components/admin/QuizSubmissionDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import DataService from '../../services/dataService';

const QuizSubmissionDetailModal = ({ submission, onClose }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (submission) {
            setLoading(true);
            DataService.getQuizSubmissionDetails(submission.id)
                .then(res => {
                    setDetails(res.data);
                })
                .catch(err => {
                    console.error("Gagal memuat detail pengerjaan kuis:", err);
                    alert("Gagal memuat detail pengerjaan.");
                })
                .finally(() => setLoading(false));
        }
    }, [submission]);

    if (!submission) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[85vh]">
                <header className="p-5 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-sesm-deep">Detail Pengerjaan Kuis</h3>
                        <p className="text-sm text-gray-500">Siswa: <span className="font-semibold">{submission.student_name}</span></p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={22} /></button>
                </header>

                <main className="flex-grow overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal" /></div>
                    ) : (
                        <div className="space-y-4">
                            {details.map((item, index) => (
                                <div key={item.id || index} className="bg-white p-4 rounded-lg border">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-gray-800 flex-grow pr-4">{index + 1}. {item.question_text}</p>
                                        {item.is_correct ? <FiCheckCircle className="text-green-500 text-2xl" title="Benar"/> : <FiXCircle className="text-red-500 text-2xl" title="Salah"/>}
                                    </div>
                                    <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                        <p className="text-xs font-semibold text-blue-800">Jawaban Siswa:</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.submitted_answer || "(Tidak dijawab)"}</p>
                                    </div>
                                    {!item.is_correct && item.correct_answer && (
                                        <div className="mt-2 bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                                            <p className="text-xs font-semibold text-green-800">Jawaban Benar:</p>
                                            <p className="text-sm text-green-900">{item.correct_answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>
                <footer className="p-4 border-t bg-white text-center flex-shrink-0">
                    <div className="flex justify-center items-center gap-8">
                        <div>
                            <p className="text-gray-600 text-sm">Skor Akhir</p> 
                            <span className="font-bold text-2xl text-sesm-deep">{submission.score ?? 'N/A'}%</span>
                        </div>
                         <div>
                            <p className="text-gray-600 text-sm">Poin Didapat</p> 
                            <span className="font-bold text-2xl text-green-600">+{submission.points_earned ?? 'N/A'}</span>
                        </div>
                    </div>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default QuizSubmissionDetailModal;