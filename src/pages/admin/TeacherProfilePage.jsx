// contoh-sesm-web/pages/admin/TeacherProfilePage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiSave, FiLoader, FiCamera, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import Notification from '../../components/ui/Notification'; // Pastikan path ini benar
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'; // Impor ReactCrop
import 'react-image-crop/dist/ReactCrop.css'; // Impor CSS ReactCrop

// --- Komponen Modal Cropping (Diambil dari AccountSettingsPage) ---
const CropModal = ({ upImg, onClose, onCropComplete }) => {
    const imgRef = useRef(null);
    const [crop, setCrop] = useState();

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const newCrop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
            width,
            height
        );
        setCrop(newCrop);
    }

    const handleCrop = () => {
        if (!crop || !imgRef.current) return;
        onCropComplete(imgRef.current, crop);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-xl"
            >
                <div className="p-6 text-center">
                    <h3 className="text-lg font-bold text-gray-900">Sesuaikan Foto Profil</h3>
                    <p className="text-sm text-gray-500 mt-2">Geser dan ubah ukuran kotak untuk memotong gambar.</p>
                </div>
                <div className="p-4 bg-gray-100">
                    <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        aspect={1}
                        circularCrop
                    >
                        <img ref={imgRef} src={upImg} onLoad={onImageLoad} alt="Crop preview" style={{ maxHeight: '60vh' }} />
                    </ReactCrop>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse rounded-b-2xl">
                    <button onClick={handleCrop} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sesm-deep text-base font-medium text-white hover:bg-opacity-90 sm:ml-3 sm:w-auto sm:text-sm">
                        Simpan
                    </button>
                    <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                        Batal
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};


const TeacherProfilePage = () => {
    const { user, updateProfile, refreshUser } = useAuth();
    const [formData, setFormData] = useState({
        nama: '', username: '', email: '', umur: '',
        pendidikan_terakhir: '', institusi: '', jurusan: '', tahun_lulus: '',
        password: '', confirmPassword: '', avatar: null
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null); // File hasil crop
    const [isSaving, setIsSaving] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });
    const fileInputRef = useRef(null);
    const [upImg, setUpImg] = useState(null); // State untuk gambar sebelum crop
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [avatarPage, setAvatarPage] = useState(0); // State untuk halaman avatar bawaan
    const avatarsPerPage = 6;

    const API_URL = 'http://localhost:8080';
    const defaultAvatars = [ /* ... (Salin array defaultAvatars dari AccountSettingsPage.jsx) ... */
        'https://api.dicebear.com/7.x/adventurer/svg?seed=Mimi', 'https://api.dicebear.com/7.x/bottts/svg?seed=Trouble', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Peanut', 'https://api.dicebear.com/7.x/micah/svg?seed=Lucy', 'https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=Max', 'https://api.dicebear.com/7.x/miniavs/svg?seed=Leo', 'https://api.dicebear.com/7.x/lorelei/svg?seed=Zoe', 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Toby', 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Sam', 'https://api.dicebear.com/7.x/personas/svg?seed=Jack', 'https://api.dicebear.com/7.x/rings/svg?seed=Aneka', 'https://api.dicebear.com/7.x/shapes/svg?seed=Jesse', 'https://api.dicebear.com/7.x/thumbs/svg?seed=Abby', 'https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Luna', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Simba', 'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Joy', 'https://api.dicebear.com/7.x/micah/svg?seed=Oliver', 'https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=Zelda', 'https://api.dicebear.com/7.x/miniavs/svg?seed=Felix', 'https://api.dicebear.com/7.x/lorelei/svg?seed=Cleo', 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Milo', 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Ruby', 'https://api.dicebear.com/7.x/personas/svg?seed=Oscar', 'https://api.dicebear.com/7.x/rings/svg?seed=Nala', 'https://api.dicebear.com/7.x/shapes/svg?seed=Charlie', 'https://api.dicebear.com/7.x/thumbs/svg?seed=Piper', 'https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Jasper', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Coco', 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sunny', 'https://api.dicebear.com/7.x/micah/svg?seed=Finn', 'https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=Penny', 'https://api.dicebear.com/7.x/miniavs/svg?seed=Gus', 'https://api.dicebear.com/7.x/lorelei/svg?seed=Hazel', 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Rocky', 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Stella', 'https://api.dicebear.com/7.x/personas/svg?seed=Bear', 'https://api.dicebear.com/7.x/rings/svg?seed=Willow', 'https://api.dicebear.com/7.x/shapes/svg?seed=Bubbles', 'https://api.dicebear.com/7.x/thumbs/svg?seed=Loki', 'https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Ivy', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow', 'https://api.dicebear.com/7.x/bottts/svg?seed=Whiskers', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Waffles', 'https://api.dicebear.com/7.x/micah/svg?seed=Apollo', 'https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=Kiki', 'https://api.dicebear.com/7.x/miniavs/svg?seed=Peaches', 'https://api.dicebear.com/7.x/lorelei/svg?seed=Midnight', 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Smokey'
    ];
    const defaultInitialAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.nama || user?.username || 'Guru'}`;

    useEffect(() => {
        if (user) {
            setFormData({
                nama: user.nama || '', username: user.username || '', email: user.email || '', umur: user.umur ?? '',
                pendidikan_terakhir: user.pendidikan_terakhir || '', institusi: user.institusi || '', jurusan: user.jurusan || '', tahun_lulus: user.tahun_lulus ?? '',
                password: '', confirmPassword: '', avatar: user.avatar // Simpan path asli
            });
            let currentAvatar = defaultInitialAvatar; // Default awal
            if (user.avatar && typeof user.avatar === 'string') {
                currentAvatar = user.avatar.startsWith('http') ? user.avatar : `${API_URL}/${user.avatar}`;
            }
            setAvatarPreview(currentAvatar);
            setAvatarFile(null); // Reset file saat user data berubah
        } else {
             setFormData({ nama: '', username: '', email: '', umur: '', pendidikan_terakhir: '', institusi: '', jurusan: '', tahun_lulus: '', password: '', confirmPassword: '', avatar: null });
             setAvatarPreview(defaultInitialAvatar);
             setAvatarFile(null);
        }
    }, [user, defaultInitialAvatar]); // Tambahkan defaultInitialAvatar ke dependency

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Buka modal crop saat file dipilih
    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                 setNotif({ isOpen: true, title: "Gagal", message: "Ukuran file terlalu besar (maks. 2MB).", success: false });
                 return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => setUpImg(reader.result?.toString() || ''));
            reader.readAsDataURL(file);
            setIsCropModalOpen(true);
            e.target.value = null; // Reset input file
        }
    };

    // Fungsi setelah crop selesai
    const getCroppedImage = useCallback((image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const targetWidth = 256; // Ukuran target avatar
        canvas.width = targetWidth;
        canvas.height = targetWidth;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;
        const cropWidth = crop.width * scaleX;
        const cropHeight = crop.height * scaleY;
        ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetWidth);
        canvas.toBlob(blob => {
            if (!blob) { console.error('Gagal membuat blob gambar'); return; }
            setAvatarPreview(URL.createObjectURL(blob)); // Tampilkan preview hasil crop
            setAvatarFile(new File([blob], "avatar.jpeg", { type: "image/jpeg" })); // Simpan file hasil crop
            setIsCropModalOpen(false);
            setUpImg(null); // Hapus gambar asli dari state
            // Signal avatar update (bukan delete)
            setFormData(prev => ({...prev, avatar: null}));
        }, 'image/jpeg', 0.95);
    }, []);

    // Pilih avatar bawaan
    const handleSelectDefaultAvatar = (url) => {
        setAvatarPreview(url);
        setAvatarFile(null); // Hapus file jika ada
         // Signal avatar update (bukan delete), simpan URL bawaan
        setFormData(prev => ({...prev, avatar: url}));
    };

    // Hapus avatar (kembali ke default)
    const handleDeleteAvatar = () => {
        setAvatarPreview(defaultInitialAvatar);
        setAvatarFile(null);
        setFormData(prev => ({...prev, avatar: 'DELETE'})); // Signal delete
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            setNotif({ isOpen: true, title: "Gagal", message: "Password dan Konfirmasi Password tidak cocok.", success: false });
            return;
        }

        setIsSaving(true);
        const dataToUpdate = { ...formData };
        if (!dataToUpdate.password) {
            delete dataToUpdate.password;
            delete dataToUpdate.confirmPassword;
        } else {
            delete dataToUpdate.confirmPassword;
        }

        // 'avatar' di dataToUpdate sekarang berisi:
        // - URL avatar bawaan jika dipilih
        // - 'DELETE' jika dihapus
        // - null jika file baru diupload (file ada di avatarFile)
        // - path asli dari server jika tidak diubah

        try {
            const result = await updateProfile(dataToUpdate, avatarFile);
            setNotif({ isOpen: true, title: "Sukses", message: result.message || "Profil berhasil diperbarui", success: true });
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            setAvatarFile(null); // Clear staged file after successful upload/update
            if (typeof refreshUser === 'function') { refreshUser(); }
        } catch (error) {
            setNotif({ isOpen: true, title: "Gagal", message: error.message || "Gagal memperbarui profil.", success: false });
        } finally {
            setIsSaving(false);
        }
    };

    // Navigasi avatar bawaan
    const nextAvatarPage = () => setAvatarPage(p => (p + 1) * avatarsPerPage >= defaultAvatars.length ? 0 : p + 1);
    const prevAvatarPage = () => setAvatarPage(p => p - 1 < 0 ? Math.floor((defaultAvatars.length - 1) / avatarsPerPage) : p - 1);
    const displayedAvatars = defaultAvatars.slice(avatarPage * avatarsPerPage, (avatarPage + 1) * avatarsPerPage);

    const inputStyle = "w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal text-sm";
    const labelStyle = "block text-sm font-bold text-gray-600 mb-1";

    // Loading state
     if (!user || avatarPreview === null) {
        return <div className="min-h-screen bg-gray-100 flex justify-center items-center"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
    }

    return (
        <>
             <AnimatePresence>
                {isCropModalOpen && <CropModal upImg={upImg} onClose={() => setIsCropModalOpen(false)} onCropComplete={getCroppedImage} />}
            </AnimatePresence>
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
                                src={avatarPreview || defaultInitialAvatar}
                                alt="Avatar Guru"
                                className="w-40 h-40 rounded-full border-4 border-sesm-sky object-cover shadow-md bg-gray-200"
                                onError={(e) => { e.target.onerror = null; e.target.src = defaultInitialAvatar; }}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -right-2 bottom-2 bg-sesm-teal text-white p-3 rounded-full border-2 border-white shadow-md hover:bg-sesm-deep transition-colors"
                                title="Ganti Avatar"
                            >
                                <FiCamera size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAvatar}
                                // Tampilkan tombol hapus hanya jika avatar saat ini BUKAN default initial avatar
                                className={`absolute -left-2 bottom-2 bg-red-500 text-white p-2 rounded-full border-2 border-white shadow-md hover:bg-red-700 transition-colors ${avatarPreview === defaultInitialAvatar ? 'hidden' : ''}`}
                                title="Hapus Avatar"
                            >
                                <FiTrash2 size={18} />
                            </button>
                            <input
                                type="file" ref={fileInputRef} onChange={handleAvatarChange}
                                className="hidden" accept="image/png, image/jpeg, image/jpg"
                            />
                        </div>

                        {/* Pemilihan Avatar Bawaan */}
                        <h3 className="font-bold text-gray-700 mb-3 text-center">Pilih Avatar Bawaan</h3>
                        <div className="flex justify-center items-center w-full max-w-sm gap-2 mb-2">
                            <button type="button" onClick={prevAvatarPage} className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0"><FiChevronLeft size={20}/></button>
                            <div className="flex-grow flex justify-center items-center flex-wrap gap-2">
                                {displayedAvatars.map((url, index) => (
                                    <motion.img key={index} src={url} alt={`Avatar ${index + 1}`}
                                        className={`w-14 h-14 rounded-full cursor-pointer border-2 transition-all ${avatarPreview === url ? 'border-sesm-teal scale-110 ring-2 ring-sesm-teal/50' : 'border-gray-200 hover:border-gray-400'}`}
                                        onClick={() => handleSelectDefaultAvatar(url)} whileHover={{ scale: 1.1 }}
                                    />
                                ))}
                            </div>
                            <button type="button" onClick={nextAvatarPage} className="p-2 rounded-full hover:bg-gray-100 flex-shrink-0"><FiChevronRight size={20}/></button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">Klik ikon kamera untuk unggah foto (max. 2MB).</p>
                    </div>

                    {/* Kolom Form (Tetap sama) */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div> <label className={labelStyle}>Nama Lengkap</label> <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} className={inputStyle} required /> </div>
                            <div> <label className={labelStyle}>Username</label> <input type="text" name="username" value={formData.username} onChange={handleInputChange} className={inputStyle} required /> </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div> <label className={labelStyle}>Email</label> <input type="email" name="email" value={formData.email} className={`${inputStyle} bg-gray-200 cursor-not-allowed`} disabled title="Email tidak dapat diubah" /> </div>
                            <div> <label className={labelStyle}>Umur</label> <input type="number" name="umur" value={formData.umur} onChange={handleInputChange} className={inputStyle} placeholder="Kosong" /> </div>
                        </div>
                        <hr className="my-6 border-dashed" />
                        <h2 className="text-lg font-bold text-sesm-deep mb-2 flex items-center gap-2"><FiEdit2 /> Informasi Pendidikan</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div> <label className={labelStyle}>Pendidikan Terakhir</label> <input type="text" name="pendidikan_terakhir" placeholder="cth: S1" value={formData.pendidikan_terakhir || ''} onChange={handleInputChange} className={inputStyle} /> </div>
                            <div> <label className={labelStyle}>Nama Institusi</label> <input type="text" name="institusi" placeholder="cth: Universitas Pendidikan Indonesia" value={formData.institusi || ''} onChange={handleInputChange} className={inputStyle} /> </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div> <label className={labelStyle}>Jurusan/Program Studi</label> <input type="text" name="jurusan" placeholder="cth: Pendidikan Guru SD" value={formData.jurusan || ''} onChange={handleInputChange} className={inputStyle} /> </div>
                            <div> <label className={labelStyle}>Tahun Lulus</label> <input type="number" name="tahun_lulus" placeholder="cth: 2015" value={formData.tahun_lulus || ''} onChange={handleInputChange} className={inputStyle} min="1950" max={new Date().getFullYear()} /> </div>
                        </div>
                        <hr className="my-6 border-dashed" />
                        <h2 className="text-lg font-bold text-sesm-deep mb-2">Ganti Password</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div> <label className={labelStyle}>Password Baru</label> <input type="password" name="password" value={formData.password} onChange={handleInputChange} className={inputStyle} placeholder="Kosongkan jika tidak diubah" /> </div>
                            <div> <label className={labelStyle}>Konfirmasi Password Baru</label> <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className={inputStyle} placeholder="Ulangi password baru" /> </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <motion.button type="submit" disabled={isSaving} className="flex items-center justify-center gap-2 px-6 py-3 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" whileTap={{ scale: 0.98 }}>
                                {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />} {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </motion.button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

export default TeacherProfilePage;