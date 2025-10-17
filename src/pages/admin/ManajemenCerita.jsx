import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiPlus, FiLoader, FiAlertCircle, FiEdit, FiTrash2, FiUsers } from 'react-icons/fi';
import InteractiveStoryService from '../../services/interactiveStoryService';
import StoryEditorModal from '../../components/admin/StoryEditorModal';
import Notification from '../../components/ui/Notification';
import PengerjaanCeritaModal from '../../components/admin/PengerjaanCeritaModal'; // [TAMBAHAN] Impor modal baru

const ManajemenCerita = () => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingStory, setEditingStory] = useState(null);

    // [TAMBAHAN] State untuk modal pengerjaan
    const [viewingSubmissions, setViewingSubmissions] = useState(null);

    const API_URL = 'http://localhost:8080';

    const fetchStories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await InteractiveStoryService.getAllStories();
            setStories(response.data);
        } catch (error) {
            setNotif({ isOpen: true, message: "Gagal memuat daftar cerita.", success: false, title: "Error" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    const handleOpenEditor = (story = null) => {
        setEditingStory(story);
        setIsEditorOpen(true);
    };

    const handleSave = async (data, id) => {
        try {
            const message = id ? "Cerita berhasil diperbarui!" : "Cerita baru berhasil dibuat!";
            if (id) {
                await InteractiveStoryService.updateStory(id, data);
            } else {
                await InteractiveStoryService.createStory(data);
            }
            setNotif({ isOpen: true, message, success: true, title: "Sukses" });
            setIsEditorOpen(false);
            fetchStories();
        } catch (error) {
            setNotif({ isOpen: true, message: error.response?.data?.message || "Gagal menyimpan.", success: false, title: "Gagal" });
            throw error;
        }
    };
    
    const handleDelete = async (id, title) => {
        if (window.confirm(`Yakin ingin menghapus cerita "${title}"?`)) {
            try {
                await InteractiveStoryService.deleteStory(id);
                setNotif({ isOpen: true, message: `Cerita "${title}" berhasil dihapus.`, success: true, title: "Sukses" });
                fetchStories();
            } catch (error) {
                setNotif({ isOpen: true, message: "Gagal menghapus cerita.", success: false, title: "Error" });
            }
        }
    };

    return (
        <>
            <AnimatePresence>
                {isEditorOpen && <StoryEditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} onSubmit={handleSave} initialData={editingStory} />}
                {/* [TAMBAHAN] Render modal pengerjaan */}
                {viewingSubmissions && (
                    <PengerjaanCeritaModal 
                        isOpen={!!viewingSubmissions}
                        story={viewingSubmissions}
                        onClose={() => setViewingSubmissions(null)}
                    />
                )}
            </AnimatePresence>
            <Notification isOpen={notif.isOpen} onClose={() => setNotif({ ...notif, isOpen: false })} title={notif.title} message={notif.message} success={notif.success} />
            
            <div className="bg-white p-6 rounded-xl shadow-lg flex-grow flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-sesm-deep flex items-center gap-3"><FiBook /> Manajemen Cerita Interaktif</h1>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleOpenEditor()} className="flex items-center gap-2 px-5 py-2.5 bg-sesm-teal text-white rounded-lg font-semibold hover:bg-sesm-deep shadow-sm"><FiPlus /> Buat Cerita Baru</motion.button>
                </div>

                <div className="flex-grow overflow-y-auto">
                    {loading ? <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl"/></div>
                    : stories.length === 0 ? <div className="text-center py-16 text-gray-400"><FiAlertCircle size={48} className="mx-auto"/><p>Belum ada cerita interaktif.</p></div>
                    : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 w-2/5">Judul</th>
                                    <th className="px-6 py-3">Kategori</th>
                                    <th className="px-6 py-3 text-center">Akhir Cerita</th>
                                    <th className="px-6 py-3 text-center">Dibuat Oleh</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stories.map(story => (
                                    <tr key={story.id} className="hover:bg-gray-50 border-b">
                                        <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-4">
                                            <img src={story.cover_image ? `${API_URL}/${story.cover_image}` : `https://api.dicebear.com/7.x/shapes/svg?seed=${story.title}`} alt={story.title} className="w-16 h-10 rounded-md object-cover"/>
                                            <span>{story.title}</span>
                                        </td>
                                        <td className="px-6 py-4">{story.category}</td>
                                        <td className="px-6 py-4 text-center">{story.total_endings}</td>
                                        <td className="px-6 py-4 text-center">{story.creator_name}</td>
                                        <td className="px-6 py-4">
                                            {/* [PERBAIKAN] Tambahkan tombol "Lihat Pengerjaan" */}
                                            <div className="flex justify-center items-center gap-4">
                                                <button onClick={() => setViewingSubmissions(story)} className="font-medium text-green-600 hover:text-green-800" title="Lihat Pengerjaan"><FiUsers /></button>
                                                <button onClick={() => handleOpenEditor(story)} className="font-medium text-blue-600 hover:text-blue-800" title="Edit"><FiEdit/></button>
                                                <button onClick={() => handleDelete(story.id, story.title)} className="font-medium text-red-600 hover:text-red-800" title="Hapus"><FiTrash2/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default ManajemenCerita;