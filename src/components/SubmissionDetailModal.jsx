// contoh-sesm-web/components/SubmissionDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiFileText, FiCheckCircle, FiLoader, FiSave } from 'react-icons/fi';
import DataService from '../services/dataService';

const SubmissionDetailModal = ({ submission, onClose, onGradeSubmitted }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState('');
    const [isSaving, setIsSaving] = useState(false);

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

    const handleSubmitGrade = async () => {
        if (score === '' || isNaN(score)) {
            alert("Harap masukkan nilai yang valid.");
            return;
        }
        setIsSaving(true);
        try {
            await DataService.gradeSubmission(submission.id, parseInt(score));
            alert("Nilai berhasil disimpan!");
            onGradeSubmitted(); // Memicu refresh di halaman sebelumnya
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
            >
                <header className="p-5 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-sesm-deep">Detail Jawaban Siswa</h3>
                            <p className="text-sm text-gray-500">Nama Siswa: <span className="font-semibold">{submission.student_name}</span></p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={22}/></button>
                    </div>
                </header>

                <main className="flex-grow overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                    ) : (
                        <div className="space-y-4">
                            {details.map((item, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border">
                                    <p className="font-bold text-gray-800">{index + 1}. {item.pertanyaan}</p>
                                    <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                        <p className="text-xs font-semibold text-blue-800">Jawaban Siswa:</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.answer_text || "(Tidak dijawab)"}</p>
                                    </div>
                                    {item.correct_essay_answer && (
                                        <div className="mt-2 bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                                            <p className="text-xs font-semibold text-green-800">Kunci Jawaban:</p>
                                            <p className="text-sm text-green-900">{item.correct_essay_answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <footer className="p-5 border-t flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <label htmlFor="score" className="font-bold text-lg text-sesm-deep">Nilai Akhir:</label>
                        <input
                            type="number"
                            id="score"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            className="w-32 p-2 text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                            placeholder="0-100"
                            min="0"
                            max="100"
                        />
                    </div>
                    <button 
                        onClick={handleSubmitGrade}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-3 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:bg-gray-400"
                    >
                        {isSaving ? <FiLoader className="animate-spin"/> : <FiSave/>}
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Nilai'}</span>
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default SubmissionDetailModal;