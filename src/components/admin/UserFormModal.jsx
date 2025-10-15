import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        nama: '',
        umur: '',
        role: 'siswa',
        password: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEditMode = Boolean(initialData);

    useEffect(() => {
        if (isEditMode) {
            setFormData({
                username: initialData.username || '',
                email: initialData.email || '',
                nama: initialData.nama || '',
                umur: initialData.umur || '',
                role: initialData.role || 'siswa',
                password: '', // Password dikosongkan saat edit
            });
        } else {
            // Reset form untuk mode create
            setFormData({ username: '', email: '', nama: '', umur: '', role: 'siswa', password: '' });
        }
    }, [initialData, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit(formData);
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    const inputStyle = "w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal";

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <header className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold text-sesm-deep">{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX /></button>
                    </header>

                    <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold text-sm">Nama Lengkap</label>
                                <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className={inputStyle} required />
                            </div>
                            <div>
                                <label className="font-semibold text-sm">Username</label>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className={inputStyle} required />
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold text-sm">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputStyle} required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="font-semibold text-sm">Umur</label>
                                <input type="number" name="umur" value={formData.umur} onChange={handleInputChange} className={inputStyle} required />
                            </div>
                            <div>
                                <label className="font-semibold text-sm">Role</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} className={inputStyle}>
                                    <option value="siswa">Siswa</option>
                                    <option value="guru">Guru</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold text-sm">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={inputStyle} placeholder={isEditMode ? 'Kosongkan jika tidak ingin mengubah' : ''} required={!isEditMode} />
                        </div>
                    </main>

                    <footer className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200">Batal</button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 flex items-center gap-2 disabled:bg-gray-400">
                            {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSave />}
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan'}</span>
                        </button>
                    </footer>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default UserFormModal;