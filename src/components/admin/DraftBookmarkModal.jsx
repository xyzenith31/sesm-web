import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFileText, FiTrash2 } from 'react-icons/fi';
import DataService from '../../services/dataService';
import Notification from '../ui/Notification';

const DraftBookmarkModal = ({ isOpen, onClose, drafts, onContinue, onDraftDeleted }) => {
    const [notif, setNotif] = useState({
        isOpen: false,
        title: '',
        message: '',
        success: true,
    });
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [draftToDelete, setDraftToDelete] = useState(null);
    const [localDrafts, setLocalDrafts] = useState(drafts || []);

    useEffect(() => {
        setLocalDrafts(drafts || []);
    }, [drafts]);

    const handleCloseNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));

    const handleDeleteClick = (draft, e) => {
        e.stopPropagation();
        setDraftToDelete(draft); 
        setIsDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        setDraftToDelete(null);
    };

    const confirmDelete = async () => {
        if (!draftToDelete) return;

        setIsDeleteConfirmOpen(false);
        const draftKeyToDelete = draftToDelete.draft_key;
        const draftTitle = draftToDelete.content?.formData?.title || 'Draf Tanpa Judul';
        setDraftToDelete(null);

        await new Promise(resolve => setTimeout(resolve, 200));

        try {
            localStorage.removeItem(draftKeyToDelete);
            await DataService.deleteDraft(draftKeyToDelete);

            setNotif({
                isOpen: true,
                title: "Berhasil",
                message: `Draf "${draftTitle}" berhasil dihapus.`,
                success: true,
            });

            setLocalDrafts(prev => prev.filter(d => d.draft_key !== draftKeyToDelete));
            if (onDraftDeleted) {
                onDraftDeleted();
            }

        } catch (error) {
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: "Gagal menghapus draf.",
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
                        message={`Yakin ingin menghapus draf "${draftToDelete.content?.formData?.title || 'Draf Tanpa Judul'}"?`}
                        success={false} 
                        isConfirmation={true}
                        confirmText="Ya, Hapus"
                        cancelText="Batal"
                    />
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b flex justify-between items-center">
                         <h3 className="text-xl font-bold text-sesm-deep">Materi Tersimpan (Draf)</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                    </div>
                     <p className="text-sm text-gray-500 px-6 pt-2">Lanjutkan mengerjakan atau hapus draf yang sudah tidak diperlukan.</p>

                    <div className="flex-grow overflow-y-auto p-6">
                        {localDrafts && localDrafts.length > 0 ? (
                            <div className="space-y-3">
                                {localDrafts.map(draft => (
                                    <div key={draft.draft_key} onClick={() => onContinue(draft)} className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <FiFileText className="text-sesm-teal flex-shrink-0" size={24}/>
                                            <div className='overflow-hidden'>
                                                <p className="font-bold text-gray-800 truncate">{draft.content?.formData?.title || 'Draf Tanpa Judul'}</p>
                                                <p className="text-sm text-gray-500">
                                                    {draft.content?.tasks?.length || 0} soal • Disimpan: {new Date(draft.last_saved).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button onClick={(e) => handleDeleteClick(draft, e)} className="p-2 text-red-500 hover:bg-red-100 rounded-md" title="Hapus Draf">
                                                <FiTrash2/>
                                            </button>
                                            <span className="px-4 py-2 text-sm bg-sesm-teal text-white font-semibold rounded-md cursor-pointer">
                                                Lanjutkan
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
                               <FiFileText size={48}/>
                               <p className="mt-2 font-semibold">Tidak ada draf tersimpan.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
};

export default DraftBookmarkModal;