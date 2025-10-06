import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCamera, FiEye, FiEyeOff, FiUpload, FiTrash2 } from 'react-icons/fi';

// Daftar avatar default
const defaultAvatars = [
    'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=SiswaCerdas',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Juara',
    'https://api.dicebear.com/7.x/pixel-art/svg?seed=Semangat',
    'https://api.dicebear.com/7.x/micah/svg?seed=Ceria',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Kreatif'
];

const AccountSettingsPage = ({ onNavigate }) => {
    const [formData, setFormData] = useState({
        username: 'siswacerdas',
        email: 'siswa.cerdas@email.com',
        nama: 'Siswa Cerdas',
        umur: '10',
        password: '',
        confirmPassword: '',
    });
    const [avatar, setAvatar] = useState(defaultAvatars[0]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const fileInputRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert('Konfirmasi password tidak cocok!');
            return;
        }
        alert('Perubahan berhasil disimpan!');
        onNavigate('profile');
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setAvatar(URL.createObjectURL(file));
        }
    };

    const handleDeleteAvatar = () => {
        setAvatar(defaultAvatars[0]);
    };

    const inputStyle = "w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal focus:bg-white transition";
    const isDefaultAvatar = avatar === defaultAvatars[0];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
                <button onClick={() => onNavigate('profile')} className="p-2 rounded-full hover:bg-gray-100">
                    <FiArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep">Pengaturan Akun</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-grow overflow-y-auto p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-xl mx-auto"
                >
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative mb-4">
                                <img src={avatar} alt="User Avatar" className="w-32 h-32 rounded-full border-4 border-sesm-sky object-cover" />
                                <button 
                                    onClick={handleUploadClick}
                                    className="absolute -right-2 bottom-0 bg-sesm-teal text-white p-2 rounded-full border-2 border-white shadow-md hover:bg-sesm-deep transition-colors"
                                    title="Unggah foto profil"
                                >
                                    <FiCamera size={18} />
                                </button>
                                {/* === BAGIAN YANG DIPERBAIKI === */}
                                <button 
                                    onClick={handleDeleteAvatar}
                                    disabled={isDefaultAvatar}
                                    className={`absolute -left-2 bottom-0 p-2 rounded-full border-2 border-white shadow-md transition-colors ${
                                        isDefaultAvatar 
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                        : 'bg-red-500 text-white hover:bg-red-700'
                                    }`}
                                    title="Hapus foto profil"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                            
                            <h3 className="font-bold text-gray-700 mb-3">Pilih Avatar Bawaan</h3>
                            <div className="flex justify-center items-center flex-wrap gap-3">
                                {defaultAvatars.map((avatarUrl, index) => (
                                    <motion.img 
                                        key={index}
                                        src={avatarUrl} 
                                        alt={`Avatar ${index + 1}`} 
                                        className={`w-12 h-12 rounded-full cursor-pointer border-2 transition-all ${avatar === avatarUrl ? 'border-sesm-teal scale-110' : 'border-gray-200'}`}
                                        onClick={() => setAvatar(avatarUrl)}
                                        whileHover={{ scale: 1.1 }}
                                    />
                                ))}
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileChange}
                                accept="image/png, image/jpeg"
                            />
                        </div>

                        <form onSubmit={handleSaveChanges} className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-600">Username</label>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600">Nama Lengkap</label>
                                <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-600">Umur</label>
                                <input type="number" name="umur" value={formData.umur} onChange={handleInputChange} className={inputStyle} />
                            </div>
                            
                            <hr className="my-6"/>

                            <div>
                                <label className="text-sm font-bold text-gray-600">Ganti Password (Opsional)</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} className={inputStyle} placeholder="Password Baru"/>
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500">
                                        {showPassword ? <FiEyeOff/> : <FiEye/>}
                                    </button>
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-bold text-gray-600">Konfirmasi Password Baru</label>
                                 <div className="relative">
                                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={inputStyle} placeholder="Ulangi Password Baru"/>
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500">
                                        {showConfirmPassword ? <FiEyeOff/> : <FiEye/>}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <motion.button
                                    type="submit"
                                    className="w-full bg-sesm-deep text-white font-bold py-3 rounded-lg shadow-lg hover:bg-opacity-90"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Simpan Perubahan
                                </motion.button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default AccountSettingsPage;