// contoh-sesm-web/pages/admin/ManajemenBookmark.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiLoader, FiAlertCircle, FiEdit, FiBookmark, FiFileText, FiBookOpen, FiTrendingUp } from 'react-icons/fi';
import BookmarkService from '../../services/bookmarkService';
import DataService from '../../services/dataService';
import Notification from '../../components/ui/Notification';
import AddMaterialModal from '../../components/admin/AddMaterialModal';
import EditMaterialModal from '../../components/admin/EditMaterialModal';
import DraftBookmarkModal from '../../components/admin/DraftBookmarkModal';
import BankSoalBookmarkModal from '../../components/admin/BankSoalBookmarkModal';

const ManajemenBookmark = ({ onNavigate }) => {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
    const [isBankSoalOpen, setIsBankSoalOpen] = useState(false);
    
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [selectedDraft, setSelectedDraft] = useState(null);
    
    const [drafts, setDrafts] = useState([]);
    const [showDraftsNotification, setShowDraftsNotification] = useState(false);
    const [hasDismissedDraftNotif, setHasDismissedDraftNotif] = useState(false);


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
            const serverDraftsRes = await DataService.getAllDrafts();
            const bookmarkServerDrafts = serverDraftsRes.data.filter(d => d.draft_key.startsWith('bookmark_draft_'));
            
            const localDraftKeys = Object.keys(localStorage).filter(key => key.startsWith('bookmark_draft_'));
            const bookmarkLocalDrafts = localDraftKeys.map(key => {
                try {
                    const content = JSON.parse(localStorage.getItem(key));
                    return { draft_key: key, content, last_saved: new Date().toISOString() };
                } catch(e) {
                    return null;
                }
            }).filter(Boolean);

            const allDrafts = [
                ...bookmarkServerDrafts,
                ...bookmarkLocalDrafts.filter(ld => !bookmarkServerDrafts.find(sd => sd.draft_key === ld.draft_key))
            ];
            
            setDrafts(allDrafts);
            
            if (allDrafts.length > 0 && !hasDismissedDraftNotif) {
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
            if (id) {
                await BookmarkService.updateBookmark(id, data);
                message = "Materi berhasil diperbarui!";
            } else {
                await BookmarkService.createBookmark(data);
                message = "Materi baru berhasil ditambahkan!";
            }
            setNotif({ isOpen: true, message, success: true, title: "Sukses" });
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            fetchBookmarks();
            fetchDrafts(); 
        } catch (error) {
            setNotif({ 
                isOpen: true, 
                message: error.response?.data?.message || "Gagal menyimpan. Periksa kembali isian Anda.", 
                success: false,
                title: "Gagal Menyimpan"
            });
            throw error;
        }
    };
    
    const handleDelete = (id, title) => {
        if (window.confirm(`Hapus Materi "${title}"? Tindakan ini tidak dapat diurungkan.`)) {
             confirmDeleteAction(id);
        }
    };

    const confirmDeleteAction = async (id) => {
        try {
            await BookmarkService.deleteBookmark(id);
            setNotif({ isOpen: true, message: "Materi berhasil dihapus.", success: true, title: "Sukses" });
            setBookmarks(prev => prev.filter(b => b.id !== id));
        } catch (error) {
            setNotif({ isOpen: true, message: "Gagal menghapus materi.", success: false, title: "Error" });
        }
    };
    
    const handleContinueDraft = (draft) => {
        setIsDraftModalOpen(false);
        if (draft && draft.draft_key && draft.draft_key.includes('_edit_')) {
            const materialId = parseInt(draft.draft_key.split('_edit_')[1], 10);
            const materialToEdit = bookmarks.find(b => b.id === materialId);
            if(materialToEdit) {
                handleOpenEditModal(materialToEdit);
            } else {
                alert("Materi asli untuk draf ini tidak ditemukan, mungkin telah dihapus. Draf ini akan dihapus.");
                DataService.deleteDraft(draft.draft_key);
                localStorage.removeItem(draft.draft_key);
                fetchDrafts();
            }
        } else {
            handleOpenAddModal(draft);
        }
    };
    
    const closeDraftNotification = () => {
        setShowDraftsNotification(false);
        setHasDismissedDraftNotif(true);
    }

    const handleQuestionsFromBankAdded = (updatedBookmarkId) => {
        setIsBankSoalOpen(false);
        setNotif({ isOpen: true, title: "Sukses", message: "Soal berhasil ditambahkan dari bank!", success: true });
        fetchBookmarks();
    };

    return (
        <>
            <AnimatePresence>
                {isAddModalOpen && <AddMaterialModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={(data) => handleSave(data, null)} initialDraft={selectedDraft} />}
                {isEditModalOpen && <EditMaterialModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSave} initialData={editingMaterial} />}
                {isDraftModalOpen && <DraftBookmarkModal isOpen={isDraftModalOpen} onClose={() => setIsDraftModalOpen(false)} drafts={drafts} onContinue={handleContinueDraft} onDraftDeleted={fetchDrafts} />}
                {isBankSoalOpen && (
                    <BankSoalBookmarkModal 
                        isOpen={isBankSoalOpen}
                        onClose={() => setIsBankSoalOpen(false)}
                        onQuestionsAdded={handleQuestionsFromBankAdded}
                    />
                )}
            </AnimatePresence>
            
            <Notification isOpen={notif.isOpen} onClose={() => setNotif({ ...notif, isOpen: false })} title={notif.title} message={notif.message} success={notif.success} />
            
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
                {/* --- PERBAIKAN STRUKTUR HEADER DIMULAI DI SINI --- */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-sesm-deep flex items-center gap-3"><FiBookmark /> Manajemen Bookmark</h1>
                    <p className="text-gray-500 mt-1">Kelola materi, soal, dan penilaian untuk siswa.</p>
                    
                    <div className='flex items-center gap-3 my-6'>
                        <motion.button 
                            whileTap={{ scale: 0.95 }} 
                            onClick={() => setIsDraftModalOpen(true)} 
                            disabled={drafts.length === 0}
                            className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-500 shadow-sm disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed">
                            <FiFileText /> Draf {drafts.length > 0 && `(${drafts.length})`}
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsBankSoalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-sesm-teal text-sesm-deep rounded-lg font-semibold hover:bg-sesm-teal/10 shadow-sm">
                            <FiBookOpen/> Bank Soal
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => onNavigate('manajemenNilai')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 shadow-sm">
                            <FiTrendingUp /> Manajemen Nilai
                        </motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleOpenAddModal(null)} className="flex items-center gap-2 px-5 py-2.5 bg-sesm-teal text-white rounded-lg font-semibold hover:bg-sesm-deep shadow-sm">
                            <FiPlus /> Buat Materi Baru
                        </motion.button>
                    </div>
                </motion.div>
                
                <div className="border-t-2 border-dashed border-gray-200 mb-6"></div>
                {/* --- BATAS AKHIR PERBAIKAN STRUKTUR --- */}


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