// contoh-sesm-web/components/mod/StudentSubmissionDetailModal.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import DataService from '../../services/dataService';

const StudentSubmissionDetailModal = ({ submission, onClose }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (submission) {
            setLoading(true);
            // Untuk materi biasa, endpoint ini yang digunakan
            const fetchDetails = submission.bookmark_id 
                ? DataService.getStudentBookmarkSubmissionDetails(submission.id) // Asumsi ada fungsi ini untuk bookmark
                : DataService.getStudentSubmissionDetails(submission.id);

            fetchDetails
                .then(res => setDetails(res.data))
                .catch(err => console.error("Gagal memuat detail nilai:", err))
                .finally(() => setLoading(false));
        }
    }, [submission]);
    
    const getTypeLabel = (tipe_soal) => {
        switch (tipe_soal) {
            case 'pilihan-ganda': return { label: 'Pilihan Ganda', color: 'bg-blue-100 text-blue-800' };
            case 'esai': return { label: 'Esai', color: 'bg-orange-100 text-orange-800' };
            case 'pilihan-ganda-esai': return { label: 'PG & Esai', color: 'bg-purple-100 text-purple-800' };
            default: return { label: 'Lainnya', color: 'bg-gray-100 text-gray-800' };
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[85vh]">
                <header className="p-5 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-sesm-deep">Hasil Pengerjaan</h3>
                        <p className="text-sm text-gray-500">{submission.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX/></button>
                </header>
                <main className="flex-grow overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                    ) : (
                        <div className="space-y-4">
                            {details.map((item, index) => {
                                const correctAnswer = item.correct_mcq || item.correct_essay;
                                const typeInfo = getTypeLabel(item.tipe_soal);
                                // Untuk bookmark, question_text ada di level atas, untuk materi biasa ada di dalam
                                const questionText = item.question_text || item.pertanyaan; 
                                const questionIndex = item.question_index ?? index;

                                return (
                                    <div key={item.answerId || item.id} className="bg-white p-4 rounded-lg border">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-gray-800 flex-grow pr-4">{questionIndex + 1}. {questionText}</p>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeInfo.color}`}>{typeInfo.label}</span>
                                                {item.is_correct === true && <FiCheckCircle className="text-green-500 text-2xl" title="Benar"/>}
                                                {item.is_correct === false && <FiXCircle className="text-red-500 text-2xl" title="Salah"/>}
                                            </div>
                                        </div>
                                        <div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                            <p className="text-xs font-semibold text-blue-800">Jawaban Kamu:</p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.answer_text || "(Tidak dijawab)"}</p>
                                        </div>
                                        {/* Tampilkan kunci jawaban hanya jika penilaian otomatis & jawaban salah */}
                                        {correctAnswer && item.is_correct === false && (
                                            <div className="mt-2 bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                                                <p className="text-xs font-semibold text-green-800">Kunci Jawaban:</p>
                                                <p className="text-sm text-green-900">{correctAnswer}</p>
                                            </div>
                                        )}
                                        {/* ✅ BAGIAN YANG DITAMBAHKAN */}
                                        {item.correction_text && (
                                            <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg">
                                                <p className="text-xs font-semibold text-yellow-800">Umpan Balik dari Guru:</p>
                                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.correction_text}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
                 <footer className="p-4 border-t bg-white text-center">
                    <p className="text-gray-600">Skor Akhir: <span className="font-bold text-2xl text-sesm-deep">{submission.score ?? 'Belum dinilai'}</span></p>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default StudentSubmissionDetailModal;