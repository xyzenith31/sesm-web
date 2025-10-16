// contoh-sesm-web/components/admin/DraftQuizModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiFileText, FiTrash2 } from 'react-icons/fi';
import DataService from '../../services/dataService'; // Impor DataService

const DraftQuizModal = ({ isOpen, onClose, allQuizzes, drafts: initialDrafts, onContinueQuestionDraft, onDraftDeleted }) => {
    const [drafts, setDrafts] = useState([]);

    useEffect(() => {
        if (isOpen && initialDrafts) {
            const loadedDrafts = initialDrafts.map(draft => {
                try {
                    const quizId = parseInt(draft.draft_key.replace('quiz_', ''), 10);
                    const quizInfo = allQuizzes.find(q => q.id === quizId);
                    
                    // Hanya tampilkan draf jika kuis terkait masih ada
                    if (!quizInfo) return null;

                    return {
                        key: draft.draft_key,
                        quizId,
                        title: `Soal untuk: ${quizInfo.title}`,
                        questionCount: draft.content?.length || 0,
                        lastSaved: new Date(draft.last_saved).toLocaleString('id-ID')
                    };
                } catch (e) {
                    console.error("Gagal memproses draf kuis:", draft.draft_key, e);
                    return null;
                }
            }).filter(Boolean); // Hapus draf yang tidak valid atau tidak memiliki kuis

            setDrafts(loadedDrafts.sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved)));
        }
    }, [isOpen, allQuizzes, initialDrafts]);

    const handleDelete = async (draftKey, title) => {
        if (window.confirm(`Yakin ingin menghapus draf untuk "${title}"?`)) {
            try {
                await DataService.deleteDraft(draftKey);
                // Panggil fungsi callback untuk memberitahu parent agar me-refresh daftar draft
                if (onDraftDeleted) {
                    onDraftDeleted(); 
                }
                // Hapus dari state lokal untuk update UI instan
                setDrafts(prevDrafts => prevDrafts.filter(d => d.key !== draftKey));
            } catch (error) {
                alert("Gagal menghapus draf dari server.");
                console.error("Gagal hapus draf:", error);
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[70vh]">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-sesm-deep">Draf Soal Kuis</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                    </div>
                     <p className="text-sm text-gray-500">Lanjutkan mengerjakan soal atau hapus draf yang tidak diperlukan.</p>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    {drafts.length > 0 ? (
                        <div className="space-y-3">
                            {drafts.map(draft => (
                                <div key={draft.key} className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <FiFileText className="text-sesm-teal flex-shrink-0" size={24}/>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-gray-800 truncate">{draft.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {draft.questionCount} soal • Disimpan: {draft.lastSaved}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => handleDelete(draft.key, draft.title)} className="p-2 text-red-500 hover:bg-red-100 rounded-md" title="Hapus Draf">
                                            <FiTrash2/>
                                        </button>
                                        <button onClick={() => onContinueQuestionDraft(draft.quizId)} className="px-4 py-2 text-sm bg-sesm-teal text-white font-semibold rounded-md hover:bg-sesm-deep">
                                            Lanjutkan
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
                           <FiFileText size={48}/>
                           <p className="mt-2 font-semibold">Tidak ada draf soal tersimpan.</p>
                           <p className="text-sm mt-1">Draf akan muncul di sini setelah Anda mulai membuat soal.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DraftQuizModal;