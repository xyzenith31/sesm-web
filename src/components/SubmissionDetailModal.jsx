// contoh-sesm-web/components/SubmissionDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheckCircle, FiXCircle, FiLoader, FiSave, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import DataService from '../services/dataService';

const SubmissionDetailModal = ({ submission, isViewOnly, onClose, onGradeSubmitted }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(submission.score || '');
    const [isSaving, setIsSaving] = useState(false);
    const [overridingId, setOverridingId] = useState(null); // State untuk loading per tombol

    useEffect(() => {
        if (submission) {
            setLoading(true);
            DataService.getSubmissionDetails(submission.id)
                .then(response => {
                    setDetails(response.data);
                })
                .catch(err => {
                    console.error(err);
                    alert("Gagal memuat detail jawaban siswa.");
                })
                .finally(() => setLoading(false));
        }
    }, [submission]);

    const handleOverride = async (answerId, newStatus) => {
        setOverridingId(answerId);
        try {
            const response = await DataService.overrideAnswer(answerId, newStatus);
            // Perbarui skor di footer
            setScore(response.data.newScore);
            // Perbarui tampilan detail secara lokal
            setDetails(prevDetails => 
                prevDetails.map(d => d.answerId === answerId ? { ...d, is_correct: newStatus } : d)
            );
        } catch (error) {
            alert("Gagal mengubah status jawaban.");
        } finally {
            setOverridingId(null);
        }
    };

    const handleClose = () => {
        // Jika skor berubah, panggil onGradeSubmitted untuk refresh daftar di belakang
        if (score !== submission.score) {
            onGradeSubmitted();
        } else {
            onClose();
        }
    };

    const handleSubmitGrade = async () => {
        // Fungsi ini tetap untuk penilaian manual pertama kali
        if (score === '' || isNaN(score)) {
            alert("Harap masukkan nilai yang valid."); return;
        }
        setIsSaving(true);
        try {
            await DataService.gradeSubmission(submission.id, parseInt(score));
            alert("Nilai berhasil disimpan!");
            onGradeSubmitted();
        } catch (error) {
            alert("Gagal menyimpan nilai.");
        } finally {
            setIsSaving(false);
        }
    };


    if (!submission) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[85vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-5 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-sesm-deep">Detail Jawaban Siswa</h3>
                            <p className="text-sm text-gray-500">Nama Siswa: <span className="font-semibold">{submission.student_name}</span></p>
                        </div>
                        <button type="button" onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={22}/></button>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                    ) : (
                        <div className="space-y-4">
                            {details.map((item, index) => {
                                const correctAnswer = item.correct_mcq || item.correct_essay;
                                return (
                                <div key={item.answerId} className="bg-white p-4 rounded-lg border">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-gray-800 flex-grow pr-4">{index + 1}. {item.pertanyaan}</p>
                                        {item.is_correct !== null && (
                                            item.is_correct 
                                            ? <FiCheckCircle className="text-green-500 text-2xl flex-shrink-0" title="Benar" /> 
                                            : <FiXCircle className="text-red-500 text-2xl flex-shrink-0" title="Salah" />
                                        )}
                                    </div>
                                    <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                        <p className="text-xs font-semibold text-blue-800">Jawaban Siswa:</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.answer_text || "(Tidak dijawab)"}</p>
                                    </div>
                                    {correctAnswer && (
                                        <div className="mt-2 bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                                            <p className="text-xs font-semibold text-green-800">Kunci Jawaban:</p>
                                            <p className="text-sm text-green-900">{correctAnswer}</p>
                                        </div>
                                    )}
                                    {/* --- Tombol Override --- */}
                                    {isViewOnly && (
                                        <div className="mt-3 pt-3 border-t flex items-center justify-end gap-2">
                                            {overridingId === item.answerId ? <FiLoader className="animate-spin"/> : (
                                                item.is_correct ? (
                                                    <button onClick={() => handleOverride(item.answerId, false)} className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded-md hover:bg-red-200">
                                                        <FiThumbsDown size={14}/> Batalkan (Salah)
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleOverride(item.answerId, true)} className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-md hover:bg-green-200">
                                                        <FiThumbsUp size={14}/> Benarkan Jawaban
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            )})}
                        </div>
                    )}
                </main>

                {/* --- Footer Disesuaikan --- */}
                {!isViewOnly ? (
                    <footer className="p-5 border-t flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <label htmlFor="score" className="font-bold text-lg text-sesm-deep">Nilai Akhir:</label>
                            <input
                                type="number" id="score" value={score} onChange={(e) => setScore(e.target.value)}
                                className="w-32 p-2 text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                                placeholder="0-100" min="0" max="100"
                            />
                        </div>
                        <button onClick={handleSubmitGrade} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                            {isSaving ? <FiLoader className="animate-spin"/> : <FiSave/>}
                            <span>{isSaving ? 'Menyimpan...' : 'Simpan Nilai'}</span>
                        </button>
                    </footer>
                ) : (
                    <footer className="p-5 border-t text-center">
                        <p className="text-gray-600">Skor Akhir Siswa: <span className="font-bold text-2xl text-sesm-deep">{score}</span></p>
                    </footer>
                )}
            </motion.div>
        </motion.div>
    );
};

export default SubmissionDetailModal;