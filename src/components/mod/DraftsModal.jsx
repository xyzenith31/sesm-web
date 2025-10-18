// contoh-sesm-web/components/mod/DraftsModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFileText, FiTrash2 } from 'react-icons/fi';
import DataService from '../../services/dataService';
import Notification from '../ui/Notification'; // Impor Notification

const DraftsModal = ({ isOpen, onClose, allData, drafts: initialDrafts, onContinue, onDraftDeleted }) => {
    const [drafts, setDrafts] = useState([]);
    // State untuk notifikasi
    const [notif, setNotif] = useState({ isOpen: false, title: '', message: '', success: true });
    // State untuk konfirmasi hapus
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, draftKey: null, title: '' });

    useEffect(() => {
        if (isOpen && initialDrafts) {
            const loadedDrafts = initialDrafts.map(draft => {
                try {
                    const materiKey = draft.draft_key.replace('materi_', '');
                    let chapterTitle = 'Bab Tidak Ditemukan';
                    if (allData) {
                        for (const mapelName in allData) {
                            const mapel = allData[mapelName];
                            const found = mapel.chapters.find(ch => ch.materiKey === materiKey);
                            if (found) {
                                chapterTitle = found.judul;
                                break;
                            }
                        }
                    }
                    return {
                        key: draft.draft_key,
                        materiKey: materiKey,
                        title: chapterTitle,
                        questionCount: draft.content?.length || 0,
                        lastSaved: new Date(draft.last_saved).toLocaleString('id-ID')
                    };
                } catch (e) {
                    console.error("Gagal memproses draf:", draft.draft_key, e);
                    return null;
                }
            }).filter(Boolean);
            setDrafts(loadedDrafts.sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved)));
        }
    }, [isOpen, allData, initialDrafts]);

    // Fungsi untuk menampilkan konfirmasi hapus
    const handleDeleteClick = (draftKey, title, e) => {
        e.stopPropagation(); // Mencegah klik menyebar ke elemen parent
        setConfirmDelete({ isOpen: true, draftKey, title });
    };

    // Fungsi yang dijalankan saat konfirmasi hapus
    const confirmDeleteAction = async () => {
        const { draftKey, title } = confirmDelete;
        setConfirmDelete({ isOpen: false, draftKey: null, title: '' }); // Tutup modal konfirmasi dulu

        try {
            await DataService.deleteDraft(draftKey);
            // Tampilkan notifikasi sukses
            setNotif({ isOpen: true, title: "Berhasil", message: `Draf "${title}" berhasil dihapus.`, success: true });
            if (onDraftDeleted) {
                onDraftDeleted(); // Panggil callback parent
            }
            // Update UI lokal
            setDrafts(prevDrafts => prevDrafts.filter(d => d.key !== draftKey));
        } catch (error) {
            // Tampilkan notifikasi error
            setNotif({ isOpen: true, title: "Gagal", message: "Gagal menghapus draf dari server.", success: false });
            console.error("Gagal hapus draf:", error);
        }
    };

    // Fungsi untuk menutup notifikasi
    const handleCloseNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));
    // Fungsi untuk menutup modal konfirmasi
    const handleCloseConfirm = () => setConfirmDelete({ isOpen: false, draftKey: null, title: '' });


    return (
        <>
             {/* Notifikasi Umum */}
            <Notification
                isOpen={notif.isOpen}
                onClose={handleCloseNotif}
                title={notif.title}
                message={notif.message}
                success={notif.success}
            />
             {/* Modal Konfirmasi Hapus */}
            <AnimatePresence>
                {confirmDelete.isOpen && (
                    <Notification
                        isOpen={confirmDelete.isOpen}
                        onClose={handleCloseConfirm}
                        onConfirm={confirmDeleteAction}
                        title="Konfirmasi Hapus Draf"
                        message={`Yakin ingin menghapus draf untuk "${confirmDelete.title}"?`}
                        success={false} // Tampilan warning
                        isConfirmation={true}
                        confirmText="Ya, Hapus"
                    />
                )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[70vh]" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold text-sesm-deep">Soal Tersimpan (Draf)</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                    </div>
                     <p className="text-sm text-gray-500 px-6 pt-2">Lanjutkan mengerjakan atau hapus draf yang sudah tidak diperlukan.</p>
                    <div className="flex-grow overflow-y-auto p-6">
                        {drafts.length > 0 ? (
                            <div className="space-y-3">
                                {drafts.map(draft => (
                                    <div key={draft.key} className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => onContinue(draft.materiKey)}>
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <FiFileText className="text-sesm-teal flex-shrink-0" size={24}/>
                                            <div className='overflow-hidden'>
                                                <p className="font-bold text-gray-800 truncate">{draft.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {draft.questionCount} soal • Disimpan: {draft.lastSaved}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Panggil handleDeleteClick */}
                                            <button onClick={(e) => handleDeleteClick(draft.key, draft.title, e)} className="p-2 text-red-500 hover:bg-red-100 rounded-md" title="Hapus Draf">
                                                <FiTrash2/>
                                            </button>
                                            {/* Tombol Lanjutkan tidak perlu onClick, ditangani oleh div parent */}
                                            <span className="px-4 py-2 text-sm bg-sesm-teal text-white font-semibold rounded-md">
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
                               <p className="text-sm mt-1">Draf yang sudah dipublikasikan atau dihapus tidak akan muncul di sini.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
};

export default DraftsModal;