// contoh-sesm-web/pages/admin/ManajemenBookmark.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// --- Impor FiFileText ---
import { FiPlus, FiTrash2, FiLoader, FiAlertCircle, FiEdit, FiBookmark, FiFileText, FiBookOpen, FiTrendingUp } from 'react-icons/fi';
import BookmarkService from '../../services/bookmarkService';
import DataService from '../../services/dataService';
import Notification from '../../components/ui/Notification';
import AddMaterialModal from '../../components/admin/AddMaterialModal';
import EditMaterialModal from '../../components/admin/EditMaterialModal';
import DraftBookmarkModal from '../../components/admin/DraftBookmarkModal';
import BankSoalBookmarkModal from '../../components/admin/BankSoalBookmarkModal';
import ManajemenNilaiBookmark from './ManajemenNilaiBookmark';

const ManajemenBookmark = ({ onNavigate }) => {
    // ... (state dan fungsi lainnya tetap sama) ...
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notif, setNotif] = useState({
        isOpen: false,
        message: '',
        success: true,
        title: '',
        isConfirmation: false,
        onConfirm: () => {}
    });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
    const [isBankSoalOpen, setIsBankSoalOpen] = useState(false);

    const [editingMaterial, setEditingMaterial] = useState(null);
    const [selectedDraft, setSelectedDraft] = useState(null);

    const [drafts, setDrafts] = useState([]);
    const [showDraftsNotification, setShowDraftsNotification] = useState(false);
    const [hasDismissedDraftNotif, setHasDismissedDraftNotif] = useState(false);

    const [view, setView] = useState('list');

    const fetchBookmarks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await BookmarkService.getAllBookmarks();
            setBookmarks(response.data);
        } catch (error) {
            setNotif({ isOpen: true, message: "Gagal memuat materi.", success: false, title: "Error" });
        } finally {
            setLoading(false);
        }
    }, []);

     const fetchDrafts = useCallback(async () => {
        try {
            // Kombinasi dari Server dan Local Storage
            const serverDraftsRes = await DataService.getAllDrafts();
            const bookmarkServerDrafts = (serverDraftsRes.data || []).filter(d => d.draft_key.startsWith('bookmark_draft_'));

            const localDraftKeys = Object.keys(localStorage).filter(key => key.startsWith('bookmark_draft_'));
            const bookmarkLocalDrafts = localDraftKeys.map(key => {
                try {
                    const content = JSON.parse(localStorage.getItem(key));
                    // Cek apakah content valid (misalnya, punya formData)
                    if (content && content.formData) {
                        return {
                            draft_key: key,
                            content,
                            last_saved: new Date(parseInt(key.split('_').pop())).toISOString() // Ambil timestamp dari key
                        };
                    }
                    return null;
                } catch(e) {
                    console.warn(`Gagal parse local draft ${key}:`, e);
                    localStorage.removeItem(key); // Hapus draf lokal yang rusak
                    return null;
                }
            }).filter(Boolean);

            // Gabungkan dan prioritaskan draf server (lebih baru)
            const allDraftsMap = new Map();
            bookmarkLocalDrafts.forEach(ld => allDraftsMap.set(ld.draft_key, ld));
            bookmarkServerDrafts.forEach(sd => allDraftsMap.set(sd.draft_key, sd)); // Timpa local dengan server jika key sama

            const finalDrafts = Array.from(allDraftsMap.values());

            setDrafts(finalDrafts);

            if (finalDrafts.length > 0 && !hasDismissedDraftNotif) {
                setShowDraftsNotification(true);
            }
        } catch (error) {
            console.error("Gagal mengambil draf:", error);
        }
    }, [hasDismissedDraftNotif]);

    useEffect(() => {
        fetchBookmarks();
        fetchDrafts();
    }, [fetchBookmarks, fetchDrafts]);

    const handleOpenAddModal = (draft = null) => {
        setSelectedDraft(draft);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (material) => {
        setEditingMaterial(material);
        setIsEditModalOpen(true);
    };

    const handleSave = async (data, id) => {
        try {
            let message = '';
            let isNew = !id; // Tentukan apakah ini operasi create atau update
            let draftKeyToDelete = null;

            if (id) {
                // Update
                await BookmarkService.updateBookmark(id, data);
                message = "Materi berhasil diperbarui!";
                draftKeyToDelete = `bookmark_draft_edit_${id}`; // Kunci draf edit
            } else {
                // Create
                const response = await BookmarkService.createBookmark(data);
                message = "Materi baru berhasil ditambahkan!";
                 draftKeyToDelete = selectedDraft?.draft_key || `bookmark_draft_new`; // Kunci draf baru atau dari draf yang dilanjutkan
                 // Jika melanjutkan draf, hapus juga draf dengan timestamp
                if (selectedDraft) {
                    const timestampKey = `bookmark_draft_${selectedDraft.draft_key.split('_').pop()}`;
                    if(timestampKey !== draftKeyToDelete) {
                         DataService.deleteDraft(timestampKey).catch(err => console.warn("Failed to delete timestamped draft:", err));
                         localStorage.removeItem(timestampKey);
                    }
                }
            }

            setNotif({ isOpen: true, message, success: true, title: "Sukses" });
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            fetchBookmarks(); // Muat ulang daftar bookmark

            // Hapus draf setelah berhasil
            if (draftKeyToDelete) {
                DataService.deleteDraft(draftKeyToDelete)
                    .then(() => localStorage.removeItem(draftKeyToDelete)) // Hapus juga dari local
                    .catch(err => console.warn(`Gagal menghapus draf ${draftKeyToDelete}:`, err))
                    .finally(fetchDrafts); // Muat ulang daftar draf
            } else {
                fetchDrafts(); // Muat ulang daftar draf
            }
            setSelectedDraft(null); // Reset selected draft

        } catch (error) {
            setNotif({
                isOpen: true,
                message: error.response?.data?.message || "Gagal menyimpan. Periksa kembali isian Anda.",
                success: false,
                title: "Gagal Menyimpan"
            });
            throw error; // Lemparkan error agar modal tidak tertutup
        }
    };

     // Fungsi untuk menampilkan modal konfirmasi hapus
    const handleDelete = (id, title) => {
        setNotif({
            isOpen: true,
            title: "Konfirmasi Hapus",
            message: `Anda yakin ingin menghapus materi "${title}"? Tindakan ini tidak dapat diurungkan.`,
            isConfirmation: true,
            success: false, // Warna merah untuk aksi berbahaya
            onConfirm: () => confirmDeleteAction(id, title),
            confirmText: "Ya, Hapus"
        });
    };

    // Fungsi yang dijalankan setelah konfirmasi hapus
    const confirmDeleteAction = async (id, title) => {
         // Tutup modal notifikasi konfirmasi dulu
        setNotif(prev => ({ ...prev, isOpen: false }));
        // Beri jeda singkat
        await new Promise(resolve => setTimeout(resolve, 300));
        try {
            await BookmarkService.deleteBookmark(id);
             // Tampilkan notifikasi sukses
            setNotif({
                isOpen: true,
                message: `Materi "${title}" berhasil dihapus.`,
                success: true,
                title: "Sukses",
                isConfirmation: false
            });
            setBookmarks(prev => prev.filter(b => b.id !== id));
             // Hapus juga draf edit terkait jika ada
            const draftKey = `bookmark_draft_edit_${id}`;
            DataService.deleteDraft(draftKey)
                .then(() => localStorage.removeItem(draftKey))
                .catch(err => console.warn("Gagal hapus draf edit terkait:", err))
                .finally(fetchDrafts); // Refresh draf list
        } catch (error) {
            // Tampilkan notifikasi error
             setNotif({
                isOpen: true,
                message: "Gagal menghapus materi.",
                success: false,
                title: "Error",
                isConfirmation: false
            });
        }
    };

    const handleContinueDraft = (draft) => {
        setIsDraftModalOpen(false);
        // Cek apakah key mengandung '_edit_'
        if (draft && draft.draft_key && draft.draft_key.includes('_edit_')) {
            const materialId = parseInt(draft.draft_key.split('_edit_')[1], 10);
            const materialToEdit = bookmarks.find(b => b.id === materialId);
            if (materialToEdit) {
                 handleOpenEditModal({ ...materialToEdit, _draftData: draft }); // Kirim data draf juga
            } else {
                setNotif({ isOpen: true, title: "Gagal Memuat Draf", message: "Materi asli untuk draf ini tidak ditemukan, mungkin telah dihapus.", success: false });
                 // Hapus draf yang tidak valid
                DataService.deleteDraft(draft.draft_key)
                    .then(() => localStorage.removeItem(draft.draft_key))
                    .catch(err => console.warn("Gagal hapus draf invalid:", err))
                    .finally(fetchDrafts);
            }
        } else {
            // Jika draf baru (key tidak mengandung _edit_)
            handleOpenAddModal(draft);
        }
    };

    const closeDraftNotification = () => {
        setShowDraftsNotification(false);
        setHasDismissedDraftNotif(true);
    }

    const handleQuestionsFromBankAdded = () => {
        setIsBankSoalOpen(false);
        setNotif({ isOpen: true, title: "Sukses", message: "Soal berhasil ditambahkan dari bank!", success: true });
        fetchBookmarks();
    };

    const closeNotification = () => {
        setNotif({ ...notif, isOpen: false });
    };

    if (view === 'grading') {
        return <ManajemenNilaiBookmark onNavigate={() => setView('list')} />;
    }

    return (
        <>
             {/* ... (kode AnimatePresence untuk modal-modal tetap sama) ... */}
              <AnimatePresence>
                {isAddModalOpen && <AddMaterialModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={(data) => handleSave(data, null)} initialDraft={selectedDraft} />}
                {isEditModalOpen && <EditMaterialModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSave} initialData={editingMaterial} />}
                {isDraftModalOpen && <DraftBookmarkModal isOpen={isDraftModalOpen} onClose={() => setIsDraftModalOpen(false)} drafts={drafts} onContinue={handleContinueDraft} onDraftDeleted={fetchDrafts} />}
                {isBankSoalOpen && <BankSoalBookmarkModal isOpen={isBankSoalOpen} onClose={() => setIsBankSoalOpen(false)} onQuestionsAdded={handleQuestionsFromBankAdded} />}
            </AnimatePresence>


            {/* Notifikasi Umum & Konfirmasi */}
            <Notification
                isOpen={notif.isOpen}
                onClose={closeNotification}
                title={notif.title}
                message={notif.message}
                success={notif.success}
                isConfirmation={notif.isConfirmation}
                onConfirm={notif.onConfirm}
                confirmText={notif.confirmText}
            />

            {/* Notifikasi Draf */}
            <Notification
                isOpen={showDraftsNotification}
                onClose={closeDraftNotification}
                onConfirm={() => {
                    closeDraftNotification();
                    setIsDraftModalOpen(true);
                }}
                title="Anda Memiliki Draf Materi"
                message={`Anda memiliki ${drafts.length} draf yang belum selesai. Ingin melanjutkannya?`}
                isConfirmation={true}
                confirmText="Lanjutkan"
                cancelText="Tidak"
            />

            <div className="bg-white p-6 rounded-xl shadow-lg flex-grow flex flex-col h-full">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-sesm-deep flex items-center gap-3"><FiBookmark /> Manajemen Bookmark</h1>
                    <p className="text-gray-500 mt-1">Kelola materi, soal, dan penilaian untuk siswa.</p>

                    {/* --- Perbarui Tombol Draf --- */}
                    <div className='flex items-center gap-3 my-6'>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsDraftModalOpen(true)}
                            className="relative flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-500 shadow-sm"
                        >
                            <FiFileText />
                            <span>Draf</span>
                            {/* Badge Jumlah Draf */}
                            {drafts.length > 0 && (
                                <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white">
                                    {drafts.length}
                                </span>
                            )}
                        </motion.button>
                        {/* Tombol lainnya tetap sama */}
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsBankSoalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-sesm-teal text-sesm-deep rounded-lg font-semibold hover:bg-sesm-teal/10 shadow-sm">
                            <FiBookOpen/> Bank Soal
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView('grading')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 shadow-sm">
                            <FiTrendingUp /> Manajemen Nilai
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleOpenAddModal(null)} className="flex items-center gap-2 px-5 py-2.5 bg-sesm-teal text-white rounded-lg font-semibold hover:bg-sesm-deep shadow-sm">
                            <FiPlus /> Buat Materi Baru
                        </motion.button>
                    </div>
                </motion.div>

                <div className="border-t-2 border-dashed border-gray-200 mb-6"></div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="flex-grow flex items-center justify-center py-16"><FiLoader className="animate-spin text-3xl"/></div>
                    ) : (
                        <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {bookmarks.length === 0 ? <div className="text-center py-16 text-gray-400"><FiAlertCircle size={48} className="mx-auto"/><p>Belum ada materi.</p></div> : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Judul</th>
                                            <th className="px-6 py-3 text-left">Mapel</th>
                                            <th className="px-6 py-3 text-center">Jenjang</th>
                                            <th className="px-6 py-3 text-center">Jumlah Soal</th>
                                            <th className="px-6 py-3 text-center">Penilaian</th>
                                            <th className="px-6 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>{bookmarks.map(item => ( <tr key={item.id} className="hover:bg-gray-50 border-b">
                                        <td className="px-6 py-4 font-bold text-gray-800">{item.title}</td>
                                        <td className="px-6 py-4">{item.subject}</td>
                                        <td className="px-6 py-4 text-center">{item.recommended_level}</td>
                                        <td className="px-6 py-4 text-center">{item.tasks?.length || 0}</td>
                                        <td className="px-6 py-4 capitalize text-center">{item.grading_type}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center items-center gap-4">
                                                <button onClick={() => handleOpenEditModal(item)} className="text-blue-600 hover:text-blue-800"><FiEdit/></button>
                                                <button onClick={() => handleDelete(item.id, item.title)} className="text-red-600 hover:text-red-800"><FiTrash2/></button>
                                            </div>
                                        </td>
                                    </tr>))}</tbody>
                                </table>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default ManajemenBookmark;