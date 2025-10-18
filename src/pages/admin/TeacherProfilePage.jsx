// contoh-sesm-web/pages/admin/TeacherProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
// Added FiTrash2 for the delete button
import { FiUser, FiSave, FiLoader, FiCamera, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Notification from '../../components/ui/Notification'; // Make sure this path is correct

const TeacherProfilePage = () => {
    // Make sure refreshUser is destructured correctly
    // Added refreshUser here
    const { user, updateProfile, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        nama: '',
        username: '',
        email: '',
        umur: '',
        pendidikan_terakhir: '',
        institusi: '',
        jurusan: '',
        tahun_lulus: '',
        password: '',
        confirmPassword: '',
        // Added 'avatar' state within formData to track deletion intent
        avatar: null
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });
    const fileInputRef = useRef(null);

    const API_URL = 'http://localhost:8080';
    // Use user?.nama directly for potentially null user object
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.nama || user?.username || 'Guru'}`;

    useEffect(() => {
        if (user) {
            setFormData({
                nama: user.nama || '',
                username: user.username || '',
                email: user.email || '',
                umur: user.umur ?? '', // Handle null/undefined gracefully
                pendidikan_terakhir: user.pendidikan_terakhir || '',
                institusi: user.institusi || '',
                jurusan: user.jurusan || '',
                tahun_lulus: user.tahun_lulus ?? '', // Handle null/undefined
                password: '',
                confirmPassword: '',
                avatar: user.avatar // Store original avatar path or null
            });

            let currentAvatar = defaultAvatar;
            // *** FIX: Check if user.avatar is a string before using startsWith ***
            if (user.avatar && typeof user.avatar === 'string') {
                currentAvatar = user.avatar.startsWith('http') ? user.avatar : `${API_URL}/${user.avatar}`;
            }
            setAvatarPreview(currentAvatar);
            // Reset avatarFile state when user data changes
            setAvatarFile(null);
        } else {
             // Reset form data and preview if user becomes null (e.g., after logout)
            setFormData({
                nama: '', username: '', email: '', umur: '',
                pendidikan_terakhir: '', institusi: '', jurusan: '', tahun_lulus: '',
                password: '', confirmPassword: '', avatar: null
            });
            setAvatarPreview(defaultAvatar);
            setAvatarFile(null);
        }
    // Add defaultAvatar dependency
    }, [user, defaultAvatar]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // Basic size check (e.g., 2MB)
                 setNotif({ isOpen: true, title: "Gagal", message: "Ukuran file terlalu besar (maks. 2MB).", success: false });
                 return;
            }
            setAvatarFile(file); // Stage the file for upload
            setAvatarPreview(URL.createObjectURL(file)); // Show preview
            // Signal that avatar is being updated (not deleted)
            setFormData(prev => ({...prev, avatar: null})); // Clear deletion signal if user uploads new image
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            setNotif({ isOpen: true, title: "Gagal", message: "Password dan Konfirmasi Password tidak cocok.", success: false });
            return;
        }

        setIsSaving(true);

        // Prepare data object based on formData state
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) { // Don't send empty passwords
            delete dataToUpdate.password;
            delete dataToUpdate.confirmPassword;
        } else {
             // Only keep the password field if it's set
            delete dataToUpdate.confirmPassword;
        }

        // The 'avatar' field in dataToUpdate now holds either the original path, null, or 'DELETE'
        // Pass the staged avatarFile separately to the updateProfile function

        try {
            // Call updateProfile from useAuth, passing the data object and the separate file
            const result = await updateProfile(dataToUpdate, avatarFile);

            setNotif({ isOpen: true, title: "Sukses", message: result.message || "Profil berhasil diperbarui", success: true });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' })); // Clear password fields
            setAvatarFile(null); // Clear staged file after successful upload

            // Refresh user data in context after successful update
            if (typeof refreshUser === 'function') {
                refreshUser();
            } else {
                 console.error("refreshUser is not available in useAuth");
            }

        } catch (error) {
            console.error("Error updating profile in component:", error);
            setNotif({
                isOpen: true,
                title: "Gagal",
                // Use error message from updateProfile or a fallback
                message: error.message || "Gagal memperbarui profil.",
                success: false
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAvatar = () => {
        setAvatarPreview(defaultAvatar); // Show default avatar preview
        setAvatarFile(null); // Clear any staged file
        // Signal deletion in formData
        setFormData(prev => ({...prev, avatar: 'DELETE'}));
    };


    const inputStyle = "w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal text-sm";
    const labelStyle = "block text-sm font-bold text-gray-600 mb-1";

    return (
        <>
            <Notification
                isOpen={notif.isOpen}
                onClose={() => setNotif({ ...notif, isOpen: false })}
                title={notif.title}
                message={notif.message}
                success={notif.success}
            />
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg flex-grow flex flex-col h-full">
                <h1 className="text-3xl font-bold text-sesm-deep flex items-center gap-3 mb-6 pb-6 border-b">
                    <FiUser /> Profil Saya
                </h1>

                <form onSubmit={handleSubmit} className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Kolom Avatar */}
                    <div className="md:col-span-1 flex flex-col items-center pt-4">
                        <div className="relative mb-4">
                            <img
                                src={avatarPreview || defaultAvatar}
                                alt="Avatar Guru"
                                className="w-40 h-40 rounded-full border-4 border-sesm-sky object-cover shadow-md bg-gray-200"
                                onError={(e) => { e.target.onerror = null; e.target.src=defaultAvatar }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -right-2 bottom-2 bg-sesm-teal text-white p-3 rounded-full border-2 border-white shadow-md hover:bg-sesm-deep transition-colors"
                                title="Ganti Avatar"
                            >
                                <FiCamera size={20} />
                            </button>
                             {/* Added Delete Button */}
                            <button
                                type="button"
                                // Only show delete if there is a non-default avatar to delete
                                onClick={handleDeleteAvatar}
                                className={`absolute -left-2 bottom-2 bg-red-500 text-white p-2 rounded-full border-2 border-white shadow-md hover:bg-red-700 transition-colors ${avatarPreview === defaultAvatar ? 'hidden' : ''}`}
                                title="Hapus Avatar"
                            >
                                <FiTrash2 size={18} />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleAvatarChange}
                                className="hidden"
                                accept="image/png, image/jpeg, image/jpg"
                            />
                        </div>
                        <p className="text-xs text-gray-500 text-center">Klik ikon kamera untuk mengganti foto profil (max. 2MB).</p>
                    </div>

                    {/* Kolom Form */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Nama Lengkap</label>
                                <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className={inputStyle} required />
                            </div>
                            <div>
                                <label className={labelStyle}>Username</label>
                                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className={inputStyle} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className={labelStyle}>Email</label>
                                <input type="email" name="email" value={formData.email} className={`${inputStyle} bg-gray-200 cursor-not-allowed`} disabled title="Email tidak dapat diubah" />
                            </div>
                            <div>
                                <label className={labelStyle}>Umur</label>
                                <input type="number" name="umur" value={formData.umur} onChange={handleInputChange} className={inputStyle} placeholder="Kosong" />
                            </div>
                        </div>

                        <hr className="my-6 border-dashed" />
                        <h2 className="text-lg font-bold text-sesm-deep mb-2 flex items-center gap-2"><FiEdit2 /> Informasi Pendidikan</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className={labelStyle}>Pendidikan Terakhir</label>
                                <input type="text" name="pendidikan_terakhir" placeholder="cth: S1" value={formData.pendidikan_terakhir || ''} onChange={handleInputChange} className={inputStyle} />
                            </div>
                             <div>
                                <label className={labelStyle}>Nama Institusi</label>
                                <input type="text" name="institusi" placeholder="cth: Universitas Pendidikan Indonesia" value={formData.institusi || ''} onChange={handleInputChange} className={inputStyle} />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className={labelStyle}>Jurusan/Program Studi</label>
                                <input type="text" name="jurusan" placeholder="cth: Pendidikan Guru SD" value={formData.jurusan || ''} onChange={handleInputChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Tahun Lulus</label>
                                <input type="number" name="tahun_lulus" placeholder="cth: 2015" value={formData.tahun_lulus || ''} onChange={handleInputChange} className={inputStyle} min="1950" max={new Date().getFullYear()} />
                            </div>
                        </div>

                        <hr className="my-6 border-dashed" />
                         <h2 className="text-lg font-bold text-sesm-deep mb-2">Ganti Password</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Password Baru</label>
                                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={inputStyle} placeholder="Kosongkan jika tidak diubah" />
                            </div>
                            <div>
                                <label className={labelStyle}>Konfirmasi Password Baru</label>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={inputStyle} placeholder="Ulangi password baru" />
                            </div>
                        </div>

                         <div className="pt-4 flex justify-end">
                            <motion.button
                                type="submit"
                                disabled={isSaving}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </motion.button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default TeacherProfilePage;