// contoh-sesm-web/components/admin/EditQuizModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUpload, FiLoader, FiSave } from 'react-icons/fi'; // Tambahkan FiLoader & FiSave
import CustomSelect from '../ui/CustomSelect'; // Pastikan path benar

const EditQuizModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    // State untuk form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState(null); // File baru
    const [preview, setPreview] = useState(''); // URL preview (bisa object URL atau URL dari server)
    const [recommendedLevel, setRecommendedLevel] = useState('Semua');
    const [isSaving, setIsSaving] = useState(false); // State loading

    const API_URL = 'http://localhost:8080'; // Sesuaikan jika perlu

    // Opsi level
    const levelOptions = [
        { value: 'Semua', label: 'Semua Jenjang' },
        { value: 'TK', label: 'TK' },
        { value: 'SD 1-2', label: 'SD Kelas 1-2' },
        { value: 'SD 3-4', label: 'SD Kelas 3-4' },
        { value: 'SD 5-6', label: 'SD Kelas 5-6' }
    ];

    // Mengisi form saat modal dibuka dengan initialData
    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setRecommendedLevel(initialData.recommended_level || 'Semua');
            // Jika ada gambar sampul sebelumnya, tampilkan
            if (initialData.cover_image_url) {
                setPreview(`${API_URL}/${initialData.cover_image_url}`);
            } else {
                setPreview('');
            }
            // Reset state file baru
            setCoverImage(null);
        }
    }, [isOpen, initialData, API_URL]);

    // Handler ganti gambar
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file); // Simpan file baru
            setPreview(URL.createObjectURL(file)); // Tampilkan preview file baru
        }
    };

    // Handler submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!initialData?.id) return; // Pastikan ada ID untuk update

        setIsSaving(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('recommended_level', recommendedLevel);
        // Hanya kirim coverImage jika ada file baru yang dipilih
        if (coverImage) {
            formData.append('coverImage', coverImage);
        }
        // Jika tidak ada gambar baru DAN preview masih ada (artinya gambar lama tidak dihapus),
        // backend harusnya tidak menghapus gambar lama.
        // Jika preview KOSONG (user menghapus), backend harus tahu untuk menghapus gambar.
        // Kita bisa tambahkan field flag jika perlu, misal:
        // if (!coverImage && !preview) {
        //     formData.append('removeCoverImage', 'true');
        // }

        try {
            await onSubmit(initialData.id, formData); // Panggil fungsi onSubmit dari parent
            // Reset dan tutup modal ditangani oleh parent jika sukses
        } catch (error) {
            // Error handling (misalnya notifikasi) sudah ada di parent
            console.error("Error updating quiz from modal:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !initialData) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" // z-index lebih tinggi dari modal utama
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl w-full max-w-lg shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-sesm-deep">Edit Detail Kuis</h3>
                            <button type="button" onClick={onClose} disabled={isSaving} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                        </div>
                        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2"> {/* Tambah scroll */}
                            <div>
                                <label className="font-semibold text-sm">Judul Kuis</label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-md mt-1" required />
                            </div>
                            <div>
                                <label className="font-semibold text-sm">Disarankan Untuk</label>
                                <div className="mt-1">
                                    <CustomSelect
                                        options={levelOptions}
                                        value={recommendedLevel}
                                        onChange={setRecommendedLevel} // Langsung set value
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="font-semibold text-sm">Deskripsi Singkat</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded-md mt-1 h-24" />
                            </div>
                            <div>
                                <label className="font-semibold text-sm">Gambar Sampul (Opsional)</label>
                                <div className="mt-1 border-2 border-dashed rounded-lg p-4 text-center">
                                    <input type="file" id="cover-upload-edit" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    <label htmlFor="cover-upload-edit" className="cursor-pointer text-sesm-teal font-semibold flex flex-col items-center justify-center">
                                        {/* Tampilkan preview */}
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="h-24 rounded-md mb-2 object-cover" />
                                        ) : (
                                            <FiUpload size={32} className="mb-2 text-gray-400" />
                                        )}
                                        {/* Tampilkan nama file baru atau pesan default */}
                                        {coverImage ? coverImage.name : "Ganti gambar (jika perlu)"}
                                    </label>
                                    {/* Tombol hapus preview (opsional) */}
                                    {preview && !coverImage && ( // Tampil jika ada preview gambar lama tapi belum pilih baru
                                        <button
                                            type="button"
                                            onClick={() => setPreview('')} // Hapus preview
                                            className="mt-2 text-xs text-red-500 hover:underline"
                                        >
                                            Hapus Gambar Sampul
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200">
                            Batal
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 flex items-center gap-2 disabled:bg-gray-400">
                           {isSaving ? <FiLoader className="animate-spin"/> : <FiSave />}
                           {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditQuizModal;