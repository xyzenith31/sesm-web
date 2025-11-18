import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCheckCircle, FiXCircle, FiLoader, FiSave, FiThumbsUp, FiThumbsDown } from 'react-icons/fi';
import BookmarkService from '../../services/bookmarkService';

const toAlpha = (num) => String.fromCharCode(65 + num);

const SubmissionDetailBookmarkModal = ({ submission, onClose, onGradeSubmitted }) => {
    const [details, setDetails] = useState({ questions: [], answers: [] });
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(submission.score ?? '');
    const [isSaving, setIsSaving] = useState(false);
    const [answerUpdates, setAnswerUpdates] = useState({});

    useEffect(() => {
        if (submission) {
            setLoading(true);
            Promise.all([
                BookmarkService.getSubmissionDetails(submission.id),
                BookmarkService.getAllBookmarks()
            ]).then(([answersRes, bookmarksRes]) => {
                const bookmark = bookmarksRes.data.find(b => b.id === submission.bookmark_id);
                setDetails({
                    answers: answersRes.data,
                    questions: bookmark ? bookmark.tasks : []
                });

                const initialUpdates = {};
                answersRes.data.forEach(ans => {
                    initialUpdates[ans.id] = {
                        is_correct: ans.is_correct,
                        correction_text: ans.correction_text || ''
                    };
                });
                setAnswerUpdates(initialUpdates);

            }).catch(err => {
                console.error(err);
                alert("Gagal memuat detail pengerjaan siswa.");
            }).finally(() => setLoading(false));
        }
    }, [submission]);

    const handleUpdateChange = (answerId, field, value) => {
        setAnswerUpdates(prev => ({
            ...prev,
            [answerId]: {
                ...prev[answerId],
                [field]: value,
            }
        }));
    };
    
    const handleSubmitGrade = async () => {
        if (score === '' || isNaN(score) || score < 0 || score > 100) {
            alert("Harap masukkan nilai yang valid (0-100).");
            return;
        }
        setIsSaving(true);

        const answersPayload = Object.entries(answerUpdates).map(([id, data]) => ({ id: parseInt(id), ...data }));

        try {
            await BookmarkService.gradeSubmission(submission.id, parseInt(score), answersPayload);
            alert("Nilai berhasil disimpan!");
            onGradeSubmitted();
        } catch (error) {
            alert("Gagal menyimpan nilai.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col h-[90vh]">
                <header className="p-5 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-sesm-deep">Detail Jawaban Siswa</h3>
                        <p className="text-sm text-gray-500">Siswa: <span className="font-semibold">{submission.student_name}</span></p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={22} /></button>
                </header>

                <main className="flex-grow overflow-y-auto p-6 bg-gray-50">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal" /></div>
                    ) : (
                        <div className="space-y-4">
                            {details.questions.map((task, index) => {
                                const studentAnswer = details.answers.find(a => a.question_index === index);
                                if (!studentAnswer) return null;

                                const currentUpdate = answerUpdates[studentAnswer.id] || { is_correct: null, correction_text: '' };
                                const isCorrectBySystem = studentAnswer.is_correct;
                                const isCorrectByTeacher = currentUpdate.is_correct;

                                return (
                                    <div key={studentAnswer.id} className="bg-white p-4 rounded-lg border">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-gray-800 flex-grow pr-4">{index + 1}. {task.question}</p>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {isCorrectByTeacher === true && <FiCheckCircle className="text-green-500 text-2xl" title="Benar (oleh Guru)" />}
                                                {isCorrectByTeacher === false && <FiXCircle className="text-red-500 text-2xl" title="Salah (oleh Guru)" />}
                                                {isCorrectByTeacher === null && <span className="text-xs font-semibold px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Perlu dinilai</span>}
                                            </div>
                                        </div>

                                        <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg">
                                            <p className="text-xs font-semibold text-blue-800">Jawaban Siswa:</p>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{studentAnswer.answer_text || "(Tidak dijawab)"}</p>
                                        </div>

                                        {(task.type.includes('pilihan-ganda') && task.correctAnswer) && (
                                            <div className="mt-2 bg-green-50 border-l-4 border-green-400 p-3 rounded-r-lg">
                                                <p className="text-xs font-semibold text-green-800">Kunci Jawaban Sistem (PG):</p>
                                                <p className="text-sm text-green-900">{task.correctAnswer}</p>
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 pt-4 border-t">
                                            <label className="text-sm font-bold text-gray-600 mb-2 block">Umpan Balik / Pembenaran Esai</label>
                                            <textarea
                                                value={currentUpdate.correction_text}
                                                onChange={(e) => handleUpdateChange(studentAnswer.id, 'correction_text', e.target.value)}
                                                placeholder="Tuliskan jawaban esai yang benar atau berikan umpan balik..."
                                                className="w-full h-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                                            />
                                            <div className="mt-3 flex items-center justify-end gap-2">
                                                <button onClick={() => handleUpdateChange(studentAnswer.id, 'is_correct', true)} className={`flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-md ${isCorrectByTeacher === true ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}>
                                                    <FiThumbsUp size={14} /> Tandai Benar
                                                </button>
                                                <button onClick={() => handleUpdateChange(studentAnswer.id, 'is_correct', false)} className={`flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-md ${isCorrectByTeacher === false ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                                                    <FiThumbsDown size={14} /> Tandai Salah
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

                <footer className="p-5 border-t flex justify-between items-center bg-white flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <label htmlFor="score" className="font-bold text-lg text-sesm-deep">Nilai Akhir:</label>
                        <input
                            type="number" id="score" value={score} onChange={(e) => setScore(e.target.value)}
                            className="w-32 p-2 text-lg font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                            placeholder="0-100" min="0" max="100"
                        />
                    </div>
                    <button onClick={handleSubmitGrade} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:bg-gray-400">
                        {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        <span>{isSaving ? 'Menyimpan...' : 'Simpan Nilai'}</span>
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default SubmissionDetailBookmarkModal;