// contoh-sesm-web/components/admin/DraftQuizModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Pastikan AnimatePresence diimpor
import { FiX, FiFileText, FiTrash2 } from 'react-icons/fi';
import DataService from '../../services/dataService';
import Notification from '../ui/Notification'; // Impor Notification

const DraftQuizModal = ({ isOpen, onClose, allQuizzes, drafts: initialDrafts, onContinueQuestionDraft, onDraftDeleted }) => {
    // State lokal untuk daftar draf agar UI update instan
    const [localDrafts, setLocalDrafts] = useState([]);

    // State untuk notifikasi umum (sukses/gagal setelah aksi)
    const [notif, setNotif] = useState({
        isOpen: false,
        title: '',
        message: '',
        success: true,
    });
    // State khusus untuk modal konfirmasi hapus
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    // State untuk menyimpan draft yang akan dihapus
    const [draftToDelete, setDraftToDelete] = useState(null);

    // Proses initialDrafts saat modal dibuka atau data berubah
    useEffect(() => {
        if (isOpen && initialDrafts) {
            const loadedDrafts = initialDrafts.map(draft => {
                try {
                    // Ekstrak ID kuis dari draft_key
                    const quizIdMatch = draft.draft_key.match(/^quiz_(\d+)/);
                    if (!quizIdMatch) return null; // Skip jika format key salah
                    const quizId = parseInt(quizIdMatch[1], 10);

                    const quizInfo = allQuizzes.find(q => q.id === quizId);

                    // Hanya tampilkan draf jika kuis terkait masih ada
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
            }).filter(Boolean); // Hapus draf yang tidak valid atau tidak memiliki kuis

            // Urutkan berdasarkan tanggal terakhir disimpan (terbaru dulu)
            setLocalDrafts(loadedDrafts.sort((a, b) => {
                const dateA = a.lastSaved !== 'Tanggal tidak valid' ? new Date(a.lastSaved.split(', ')[0].split('/').reverse().join('-') + ' ' + a.lastSaved.split(', ')[1]?.replace(/\./g,':')) : new Date(0);
                const dateB = b.lastSaved !== 'Tanggal tidak valid' ? new Date(b.lastSaved.split(', ')[0].split('/').reverse().join('-') + ' ' + b.lastSaved.split(', ')[1]?.replace(/\./g,':')) : new Date(0);
                 if (isNaN(dateA) || isNaN(dateB)) return 0; // Fallback jika parsing tanggal gagal
                return dateB - dateA;
            }));
        } else if (!isOpen) {
            // Reset state saat modal ditutup
            setLocalDrafts([]);
            setDraftToDelete(null);
            setIsDeleteConfirmOpen(false);
            setNotif(prev => ({ ...prev, isOpen: false }));
        }
    }, [isOpen, allQuizzes, initialDrafts]);

    // Fungsi untuk menutup notifikasi umum
    const handleCloseNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));

    // Fungsi untuk menampilkan modal konfirmasi hapus
    const handleDeleteClick = (draft, e) => {
        e.stopPropagation(); // Mencegah klik menyebar ke elemen di belakangnya (misal ke tombol Lanjutkan)
        setDraftToDelete(draft); // Simpan draft yang akan dihapus
        setIsDeleteConfirmOpen(true); // Buka modal konfirmasi
    };

    // Fungsi untuk menutup modal konfirmasi hapus
    const handleCloseDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        // Jeda singkat agar animasi exit selesai sebelum reset
        setTimeout(() => setDraftToDelete(null), 300);
    };

    // Fungsi yang dijalankan saat tombol "Ya, Hapus" diklik
    const confirmDelete = async () => {
        if (!draftToDelete) return;

        // 1. Ambil info penting sebelum state direset
        const draftKeyToDelete = draftToDelete.key;
        const draftTitle = draftToDelete.title;

        // 2. Tutup modal konfirmasi terlebih dahulu
        setIsDeleteConfirmOpen(false);
        setDraftToDelete(null); // Reset state draftToDelete

        // Jeda singkat agar animasi exit modal konfirmasi selesai
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            // 3. Lakukan penghapusan di backend
            await DataService.deleteDraft(draftKeyToDelete);

            // 4. Update UI lokal secara instan
            setLocalDrafts(prev => prev.filter(d => d.key !== draftKeyToDelete));

            // 5. Panggil callback parent (jika ada) untuk refresh data global
            if (onDraftDeleted) {
                onDraftDeleted();
            }

            // 6. Tampilkan notifikasi sukses
            setNotif({
                isOpen: true,
                title: "Berhasil",
                message: `Draf "${draftTitle}" berhasil dihapus.`,
                success: true,
            });

        } catch (error) {
            // 7. Tampilkan notifikasi error jika gagal
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: "Gagal menghapus draf dari server.",
                success: false,
            });
            console.error("Gagal hapus draf:", error);
        }
    };

    // Jangan render jika modal tidak terbuka
    if (!isOpen) return null;

    return (
        <>
            {/* Modal Notifikasi Umum (Sukses/Gagal setelah aksi) */}
            <Notification
                isOpen={notif.isOpen}
                onClose={handleCloseNotif}
                title={notif.title}
                message={notif.message}
                success={notif.success}
                isConfirmation={false} // Ini bukan modal konfirmasi
            />

            {/* Modal Konfirmasi Hapus (Menggunakan Komponen Notification) */}
            <AnimatePresence>
                {isDeleteConfirmOpen && draftToDelete && (
                     <Notification
                        isOpen={isDeleteConfirmOpen}
                        onClose={handleCloseDeleteConfirm} // Handler penutup khusus
                        onConfirm={confirmDelete}        // Handler konfirmasi khusus
                        title="Konfirmasi Hapus"
                        message={`Yakin ingin menghapus draf "${draftToDelete.title}"?`}
                        success={false} // Styling merah/warning
                        isConfirmation={true} // Mode konfirmasi
                        confirmText="Ya, Hapus"
                        cancelText="Batal"
                    />
                )}
            </AnimatePresence>

            {/* Modal Utama Daftar Draf */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
                // Hapus onClick={onClose} dari backdrop agar modal konfirmasi tidak tertutup
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[70vh]"
                    onClick={e => e.stopPropagation()} // Cegah penutupan saat klik di dalam modal
                >
                    {/* Header Modal */}
                    <div className="p-6 border-b flex justify-between items-center">
                         <h3 className="text-xl font-bold text-sesm-deep">Draf Soal Kuis</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                    </div>
                     <p className="text-sm text-gray-500 px-6 pt-2">Lanjutkan mengerjakan soal atau hapus draf yang tidak diperlukan.</p>

                    {/* Konten (Daftar Draf) */}
                    <div className="flex-grow overflow-y-auto p-6">
                        {localDrafts.length > 0 ? (
                            <div className="space-y-3">
                                {localDrafts.map(draft => (
                                    <div
                                        key={draft.key}
                                        // Jangan pakai onClick di sini, gunakan tombol "Lanjutkan"
                                        className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center"
                                    >
                                        {/* Info Draf */}
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <FiFileText className="text-sesm-teal flex-shrink-0" size={24}/>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-gray-800 truncate">{draft.title}</p>
                                                <p className="text-sm text-gray-500">
                                                    {draft.questionCount} soal • Disimpan: {draft.lastSaved}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Tombol Aksi */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Tombol Hapus memanggil handleDeleteClick */}
                                            <button onClick={(e) => handleDeleteClick(draft, e)} className="p-2 text-red-500 hover:bg-red-100 rounded-md" title="Hapus Draf">
                                                <FiTrash2/>
                                            </button>
                                            {/* Tombol Lanjutkan */}
                                            <button onClick={() => onContinueQuestionDraft(draft.quizId)} className="px-4 py-2 text-sm bg-sesm-teal text-white font-semibold rounded-md hover:bg-sesm-deep">
                                                Lanjutkan
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // State Kosong
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