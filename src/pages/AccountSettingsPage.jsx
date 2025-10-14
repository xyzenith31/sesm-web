import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiCamera, FiTrash2, FiLoader, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Notification from '../components/Notification'; // Pastikan komponen Notifikasi ada

// --- Komponen Modal Cropping (Tidak berubah) ---
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

// --- Komponen Utama Halaman ---
const AccountSettingsPage = ({ onNavigate }) => {
    const { user, updateProfile } = useAuth();
    
    // Daftar 50 avatar bawaan
    const defaultAvatars = [ 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mimi', 'https://api.dicebear.com/7.x/bottts/svg?seed=Trouble', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Peanut', 'https://api.dicebear.com/7.x/micah/svg?seed=Lucy', 'https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=Max', 'https://api.dicebear.com/7.x/miniavs/svg?seed=Leo', 'https://api.dicebear.com/7.x/lorelei/svg?seed=Zoe', 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Toby', 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Sam', 'https://api.dicebear.com/7.x/personas/svg?seed=Jack', 'https://api.dicebear.com/7.x/rings/svg?seed=Aneka', 'https://api.dicebear.com/7.x/shapes/svg?seed=Jesse', 'https://api.dicebear.com/7.x/thumbs/svg?seed=Abby', 'https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Luna', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Simba', 'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Joy', 'https://api.dicebear.com/7.x/micah/svg?seed=Oliver', 'https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=Zelda', 'https://api.dicebear.com/7.x/miniavs/svg?seed=Felix', 'https://api.dicebear.com/7.x/lorelei/svg?seed=Cleo', 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Milo', 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Ruby', 'https://api.dicebear.com/7.x/personas/svg?seed=Oscar', 'https://api.dicebear.com/7.x/rings/svg?seed=Nala', 'https://api.dicebear.com/7.x/shapes/svg?seed=Charlie', 'https://api.dicebear.com/7.x/thumbs/svg?seed=Piper', 'https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Jasper', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Coco', 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Sunny', 'https://api.dicebear.com/7.x/micah/svg?seed=Finn', 'https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=Penny', 'https://api.dicebear.com/7.x/miniavs/svg?seed=Gus', 'https://api.dicebear.com/7.x/lorelei/svg?seed=Hazel', 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Rocky', 'https://api.dicebear.com/7.x/open-peeps/svg?seed=Stella', 'https://api.dicebear.com/7.x/personas/svg?seed=Bear', 'https://api.dicebear.com/7.x/rings/svg?seed=Willow', 'https://api.dicebear.com/7.x/shapes/svg?seed=Bubbles', 'https://api.dicebear.com/7.x/thumbs/svg?seed=Loki', 'https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Ivy', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow', 'https://api.dicebear.com/7.x/bottts/svg?seed=Whiskers', 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Waffles', 'https://api.dicebear.com/7.x/micah/svg?seed=Apollo', 'https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=Kiki', 'https://api.dicebear.com/7.x/miniavs/svg?seed=Peaches', 'https://api.dicebear.com/7.x/lorelei/svg?seed=Midnight', 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Smokey' ];

    const [formData, setFormData] = useState({ username: '', email: '', nama: '', umur: '' });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [upImg, setUpImg] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true });
    const [avatarPage, setAvatarPage] = useState(0);
    const avatarsPerPage = 6;
    
    const fileInputRef = useRef(null);
    const API_URL = 'http://localhost:8080';

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                nama: user.nama || '',
                umur: user.umur ?? '', // Gunakan '' jika null atau undefined
            });
            const currentAvatar = user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `${API_URL}/${user.avatar}`) : defaultAvatars[0];
            setAvatarPreview(currentAvatar);
        }
    }, [user]);

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            setNotif({ isOpen: true, message: 'Konfirmasi password tidak cocok!', success: false });
            return;
        }
        
        setIsSaving(true);
        const dataToUpdate = { ...formData };
        if (password) dataToUpdate.password = password;

        if (defaultAvatars.includes(avatarPreview) && user.avatar !== avatarPreview) {
            dataToUpdate.avatar = avatarPreview;
        }

        const result = await updateProfile(dataToUpdate, avatarFile);
        setIsSaving(false);
        setAvatarFile(null);

        setNotif({ isOpen: true, message: result.message, success: result.success });
    };

    // --- PERBAIKAN: Fungsi notifikasi tidak lagi mengarahkan halaman ---
    const handleNotifClose = () => {
        setNotif({ ...notif, isOpen: false });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setUpImg(reader.result?.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setIsCropModalOpen(true);
            e.target.value = null;
        }
    };

    const getCroppedImage = useCallback((image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const targetWidth = 256;
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
            setAvatarPreview(URL.createObjectURL(blob));
            setAvatarFile(new File([blob], "avatar.jpeg", { type: "image/jpeg" }));
            setIsCropModalOpen(false);
            setUpImg(null);
        }, 'image/jpeg', 0.95);
    }, []);

    const handleDeleteAvatar = () => { 
        setAvatarPreview(defaultAvatars[0]);
        setAvatarFile(null);
        setFormData(prev => ({...prev, avatar: 'DELETE'}));
    };

    const handleSelectDefaultAvatar = (url) => {
        setAvatarPreview(url);
        setAvatarFile(null);
        const { avatar, ...rest } = formData;
        if (avatar === 'DELETE') setFormData(rest);
    };
    
    const nextAvatarPage = () => setAvatarPage(p => (p + 1) * avatarsPerPage >= defaultAvatars.length ? 0 : p + 1);
    const prevAvatarPage = () => setAvatarPage(p => p - 1 < 0 ? Math.floor((defaultAvatars.length - 1) / avatarsPerPage) : p - 1);
    const displayedAvatars = defaultAvatars.slice(avatarPage * avatarsPerPage, (avatarPage + 1) * avatarsPerPage);

    if (!user || !avatarPreview) {
        return <div className="min-h-screen bg-gray-100 flex justify-center items-center"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
    }

    const inputStyle = "w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal";

    return (
        <>
            <AnimatePresence>
                {isCropModalOpen && <CropModal upImg={upImg} onClose={() => setIsCropModalOpen(false)} onCropComplete={getCroppedImage} />}
            </AnimatePresence>
            <Notification isOpen={notif.isOpen} onClose={handleNotifClose} title={notif.success ? "Berhasil!" : "Gagal"} message={notif.message} success={notif.success} />

            <div className="min-h-screen bg-gray-100 flex flex-col">
                <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
                    <button onClick={() => onNavigate('profile')} className="p-2 rounded-full hover:bg-gray-100"><FiArrowLeft size={24} className="text-gray-700" /></button>
                    <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep">Pengaturan Akun</h1>
                    <div className="w-10"></div>
                </header>
                <main className="flex-grow overflow-y-auto p-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto">
                        <form onSubmit={handleSaveChanges} className="bg-white p-6 md:p-8 rounded-2xl shadow-md">
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative mb-4">
                                    <img src={avatarPreview} alt="User Avatar" className="w-32 h-32 rounded-full border-4 border-sesm-sky object-cover" />
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="absolute -right-2 bottom-0 bg-sesm-teal text-white p-2 rounded-full border-2 border-white shadow-md hover:bg-sesm-deep" title="Unggah foto profil"><FiCamera size={18} /></button>
                                    <button type="button" onClick={handleDeleteAvatar} className="absolute -left-2 bottom-0 p-2 rounded-full border-2 border-white shadow-md bg-red-500 text-white hover:bg-red-700" title="Hapus foto profil"><FiTrash2 size={18} /></button>
                                </div>
                                
                                <h3 className="font-bold text-gray-700 mb-3">Pilih Avatar Bawaan</h3>
                                <div className="flex justify-center items-center w-full max-w-sm gap-2">
                                    <button type="button" onClick={prevAvatarPage} className="p-2 rounded-full hover:bg-gray-100"><FiChevronLeft size={20}/></button>
                                    <div className="flex-grow flex justify-center items-center flex-wrap gap-2">
                                        {displayedAvatars.map((url, index) => (
                                            <motion.img key={index} src={url} alt={`Avatar ${index + 1}`} className={`w-14 h-14 rounded-full cursor-pointer border-2 transition-all ${avatarPreview === url ? 'border-sesm-teal scale-110' : 'border-gray-200'}`} onClick={() => handleSelectDefaultAvatar(url)} whileHover={{ scale: 1.1 }}/>
                                        ))}
                                    </div>
                                    <button type="button" onClick={nextAvatarPage} className="p-2 rounded-full hover:bg-gray-100"><FiChevronRight size={20}/></button>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg"/>
                            </div>

                            <div className="space-y-4">
                                <div><label className="text-sm font-bold text-gray-600">Username</label><input type="text" name="username" value={formData.username} onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))} className={inputStyle} /></div>
                                <div><label className="text-sm font-bold text-gray-600">Email</label><input type="email" name="email" value={formData.email} className="w-full px-4 py-3 bg-gray-200 rounded-lg text-gray-500 cursor-not-allowed" disabled /></div>
                                <div><label className="text-sm font-bold text-gray-600">Nama Lengkap</label><input type="text" name="nama" value={formData.nama} onChange={(e) => setFormData(p => ({ ...p, nama: e.target.value }))} className={inputStyle} /></div>
                                
                                <div>
                                    <label className="text-sm font-bold text-gray-600">Umur</label>
                                    <input 
                                        type="number" 
                                        name="umur" 
                                        value={formData.umur} 
                                        onChange={(e) => setFormData(p => ({ ...p, umur: e.target.value }))} 
                                        className={inputStyle} 
                                        placeholder="Kosong" 
                                    />
                                </div>

                                <hr className="my-6"/>
                                <div><label className="text-sm font-bold text-gray-600">Ganti Password (Opsional)</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} placeholder="Password Baru"/></div>
                                <div><label className="text-sm font-bold text-gray-600">Konfirmasi Password Baru</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputStyle} placeholder="Ulangi Password Baru"/></div>
                                <div className="pt-4"><motion.button type="submit" className="w-full bg-sesm-deep text-white font-bold py-3 rounded-lg shadow-lg disabled:bg-gray-400 flex items-center justify-center" whileTap={{ scale: 0.98 }} disabled={isSaving}>{isSaving ? <><FiLoader className="animate-spin mr-2"/> Menyimpan...</> : 'Simpan Perubahan'}</motion.button></div>
                            </div>
                        </form>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default AccountSettingsPage;