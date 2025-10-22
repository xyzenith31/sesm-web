import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFileText, FiTrash2 } from 'react-icons/fi';
import DataService from '../../services/dataService';
import Notification from '../ui/Notification';

const DraftQuizModal = ({ isOpen, onClose, allQuizzes, drafts: initialDrafts, onContinueQuestionDraft, onDraftDeleted }) => {
    const [localDrafts, setLocalDrafts] = useState([]);

    const [notif, setNotif] = useState({
        isOpen: false,
        title: '',
        message: '',
        success: true,
    });
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState(null);

    useEffect(() => {
        if (isOpen && initialDrafts) {
            const loadedDrafts = initialDrafts.map(draft => {
                try {
                    const quizIdMatch = draft.draft_key.match(/^quiz_(\d+)/);
                    if (!quizIdMatch) return null;
                    const quizId = parseInt(quizIdMatch[1], 10);

                    const quizInfo = allQuizzes.find(q => q.id === quizId);

                    if (!quizInfo) return null;

                    return {
                        key: draft.draft_key,
                        quizId,
                        title: `Soal untuk: ${quizInfo.title}`,
                        questionCount: draft.content?.length || 0,
                        lastSaved: draft.last_saved ? new Date(draft.last_saved).toLocaleString('id-ID') : 'Tanggal tidak valid' // Tambah fallback
                    };
                } catch (e) {
                    console.error("Gagal memproses draf kuis:", draft.draft_key, e);
                    return null;
                }
            }).filter(Boolean);

            setLocalDrafts(loadedDrafts.sort((a, b) => {
                const dateA = a.lastSaved !== 'Tanggal tidak valid' ? new Date(a.lastSaved.split(', ')[0].split('/').reverse().join('-') + ' ' + a.lastSaved.split(', ')[1]?.replace(/\./g,':')) : new Date(0);
                const dateB = b.lastSaved !== 'Tanggal tidak valid' ? new Date(b.lastSaved.split(', ')[0].split('/').reverse().join('-') + ' ' + b.lastSaved.split(', ')[1]?.replace(/\./g,':')) : new Date(0);
                 if (isNaN(dateA) || isNaN(dateB)) return 0;
                return dateB - dateA;
            }));
        } else if (!isOpen) {
            setLocalDrafts([]);
            setDraftToDelete(null);
            setIsDeleteConfirmOpen(false);
            setNotif(prev => ({ ...prev, isOpen: false }));
        }
    }, [isOpen, allQuizzes, initialDrafts]);

    const handleCloseNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));

    const handleDeleteClick = (draft, e) => {
        e.stopPropagation();
        setDraftToDelete(draft);
        setIsDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        setTimeout(() => setDraftToDelete(null), 300);
    };

    const confirmDelete = async () => {
        if (!draftToDelete) return;

        const draftKeyToDelete = draftToDelete.key;
        const draftTitle = draftToDelete.title;

        setIsDeleteConfirmOpen(false);
        setDraftToDelete(null); 

        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            await DataService.deleteDraft(draftKeyToDelete);

            setLocalDrafts(prev => prev.filter(d => d.key !== draftKeyToDelete));

            if (onDraftDeleted) {
                onDraftDeleted();
            }

            setNotif({
                isOpen: true,
                title: "Berhasil",
                message: `Draf "${draftTitle}" berhasil dihapus.`,
                success: true,
            });

        } catch (error) {
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: "Gagal menghapus draf dari server.",
                success: false,
            });
            console.error("Gagal hapus draf:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <Notification
                isOpen={notif.isOpen}
                onClose={handleCloseNotif}
                title={notif.title}
                message={notif.message}
                success={notif.success}
                isConfirmation={false}
            />

            <AnimatePresence>
                {isDeleteConfirmOpen && draftToDelete && (
                     <Notification
                        isOpen={isDeleteConfirmOpen}
                        onClose={handleCloseDeleteConfirm}
                        onConfirm={confirmDelete}
                        title="Konfirmasi Hapus"
                        message={`Yakin ingin menghapus draf "${draftToDelete.title}"?`}
                        success={false}
                        isConfirmation={true}
                        confirmText="Ya, Hapus"
                        cancelText="Batal"
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[70vh]"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-6 border-b flex justify-between items-center">
                         <h3 className="text-xl font-bold text-sesm-deep">Draf Soal Kuis</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                    </div>
                     <p className="text-sm text-gray-500 px-6 pt-2">Lanjutkan mengerjakan soal atau hapus draf yang tidak diperlukan.</p>

                    <div className="flex-grow overflow-y-auto p-6">
                        {localDrafts.length > 0 ? (
                            <div className="space-y-3">
                                {localDrafts.map(draft => (
                                    <div
                                        key={draft.key}
                                        className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center"
                                    >
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
                                            <button onClick={(e) => handleDeleteClick(draft, e)} className="p-2 text-red-500 hover:bg-red-100 rounded-md" title="Hapus Draf">
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
        </>
    );
};

export default DraftQuizModal;