import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUpload, FiLoader, FiSave } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';

const EditQuizModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [preview, setPreview] = useState(''); 
    const [recommendedLevel, setRecommendedLevel] = useState('Semua');
    const [isSaving, setIsSaving] = useState(false); 

    const API_URL = 'http://localhost:8080';

    const levelOptions = [
        { value: 'Semua', label: 'Semua Jenjang' },
        { value: 'TK', label: 'TK' },
        { value: 'SD 1-2', label: 'SD Kelas 1-2' },
        { value: 'SD 3-4', label: 'SD Kelas 3-4' },
        { value: 'SD 5-6', label: 'SD Kelas 5-6' }
    ];

    useEffect(() => {
        if (isOpen && initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setRecommendedLevel(initialData.recommended_level || 'Semua');
            if (initialData.cover_image_url) {
                setPreview(`${API_URL}/${initialData.cover_image_url}`);
            } else {
                setPreview('');
            }
            setCoverImage(null);
        }
    }, [isOpen, initialData, API_URL]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file); 
            setPreview(URL.createObjectURL(file)); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!initialData?.id) return; 

        setIsSaving(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('recommended_level', recommendedLevel);
        if (coverImage) {
            formData.append('coverImage', coverImage);
        }
        try {
            await onSubmit(initialData.id, formData);
        } catch (error) {
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
            className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" 
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
                        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2"> 
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
                                        onChange={setRecommendedLevel} 
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
                                        {preview ? (
                                            <img src={preview} alt="Preview" className="h-24 rounded-md mb-2 object-cover" />
                                        ) : (
                                            <FiUpload size={32} className="mb-2 text-gray-400" />
                                        )}
                                        {coverImage ? coverImage.name : "Ganti gambar (jika perlu)"}
                                    </label>
                                    {preview && !coverImage && ( 
                                        <button
                                            type="button"
                                            onClick={() => setPreview('')}  
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