import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiUpload } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';

const CreateQuizModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [recommendedLevel, setRecommendedLevel] = useState('Semua');

    const levelOptions = [
        { value: 'Semua', label: 'Semua Jenjang' },
        { value: 'TK', label: 'TK' },
        { value: 'SD 1-2', label: 'SD Kelas 1-2' },
        { value: 'SD 3-4', label: 'SD Kelas 3-4' },
        { value: 'SD 5-6', label: 'SD Kelas 5-6' }
    ];

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('recommended_level', recommendedLevel);
        if (coverImage) {
            formData.append('coverImage', coverImage);
        }
        onSubmit(formData);
        
        setTitle('');
        setDescription('');
        setCoverImage(null);
        setPreview('');
        setRecommendedLevel('Semua');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9 }} 
                animate={{ scale: 1 }} 
                className="bg-white rounded-2xl w-full max-w-lg shadow-xl" 
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-sesm-deep">Buat Kuis Baru</h3>
                            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                        </div>
                        <div className="space-y-4">
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
                                    <input type="file" id="cover-upload" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    <label htmlFor="cover-upload" className="cursor-pointer text-sesm-teal font-semibold flex flex-col items-center justify-center">
                                        {preview ? <img src={preview} alt="Preview" className="h-24 rounded-md mb-2" /> : <FiUpload size={32} className="mb-2 text-gray-400" />}
                                        {coverImage ? coverImage.name : "Pilih atau jatuhkan file gambar"}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end rounded-b-2xl">
                        <button type="submit" className="px-6 py-2 bg-sesm-deep text-white rounded-lg font-semibold">Simpan Kuis</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default CreateQuizModal;