// contoh-sesm-web/pages/FeedbackPage.jsx
import React, { useState, Fragment, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiSend, FiUpload, FiLoader,
    FiCheckCircle, FiAlertCircle, FiPaperclip, FiX, FiChevronDown,
    FiMessageSquare, FiInfo, FiTool, FiClock, FiCheck, FiXCircle,
    FiList, FiEdit, FiCornerDownRight // ✅ Tambah FiEdit
} from 'react-icons/fi';
import { FaBug, FaLightbulb, FaCommentDots } from 'react-icons/fa';
import { Listbox, Transition } from '@headlessui/react';
import Notification from '../components/ui/Notification'; 
import FeedbackService from '../services/feedbackService'; 
import { useNavigation } from '../hooks/useNavigation';

// --- (Opsi Tipe & Halaman tetap sama) ---
const feedbackTypes = [
    { id: 'bug', name: 'Laporkan Bug', icon: FaBug, color: 'text-red-500', bgColor: 'bg-red-100' },
    { id: 'fitur', name: 'Usulkan Fitur', icon: FaLightbulb, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { id: 'saran', name: 'Saran Umum', icon: FaCommentDots, color: 'text-green-500', bgColor: 'bg-green-100' },
    { id: 'kendala', name: 'Lapor Kendala', icon: FiTool, color: 'text-orange-500', bgColor: 'bg-orange-100' },
];
const pages = [
    { id: 'home', name: 'Halaman Utama (Home)' }, { id: 'mapel', name: 'Halaman Mata Pelajaran' },
    { id: 'worksheet', name: 'Halaman Pengerjaan Materi' }, { id: 'explore', name: 'Halaman Jelajahi (Explore)' },
    { id: 'kreatif', name: 'Zona Kreatif (Gambar/Tulis)' }, { id: 'bookmark', name: 'Halaman Bookmark' },
    { id: 'kuis', name: 'Halaman Kuis' }, { id: 'profil', name: 'Halaman Profil' },
    { id: 'login', name: 'Halaman Login/Register' }, { id: 'lainnya', name: 'Lainnya / Tidak Spesifik' },
];

// --- (Helper Status tetap sama) ---
const mapUserStatus = (status) => {
    switch (status) {
        case 'baru':
        case 'dilihat':
            return { text: 'Belum Diproses', icon: FiClock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
        case 'diproses':
        case 'selesai':
            return { text: 'Sudah Diproses', icon: FiCheck, color: 'text-green-600', bg: 'bg-green-100' };
        case 'ditolak':
            return { text: 'Ditolak', icon: FiXCircle, color: 'text-red-600', bg: 'bg-red-100' };
        default:
            return { text: status, icon: FiInfo, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
};

// --- (Varian Animasi tetap sama) ---
const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
    exit: { opacity: 0, y: -10 }
};

// --- (Komponen Input & Textarea tetap sama) ---
const AnimatedInput = ({ id, label, required, ...props }) => (
    <motion.div variants={itemVariants}>
        <label htmlFor={id} className="block text-sm font-bold text-gray-800 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <motion.input id={id} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none bg-gray-50 text-gray-900 transition-colors focus:bg-white" whileFocus={{ ring: '2px solid #14b8a6', borderColor: '#14b8a6', boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.2)' }} {...props} />
    </motion.div>
);
const AnimatedTextarea = ({ id, label, required, ...props }) => (
    <motion.div variants={itemVariants}>
        <label htmlFor={id} className="block text-sm font-bold text-gray-800 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <motion.textarea id={id} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none bg-gray-50 text-gray-900 resize-y transition-colors focus:bg-white" rows="5" whileFocus={{ ring: '2px solid #14b8a6', borderColor: '#14b8a6', boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.2)' }} {...props} />
    </motion.div>
);


const FeedbackPage = () => {
    const { navigate } = useNavigation();
    const [currentView, setCurrentView] = useState('form'); // 'form' | 'history'

    // --- (Semua state & fungsi helper lainnya tetap sama) ---
    const [selectedType, setSelectedType] = useState(feedbackTypes[0]);
    const [title, setTitle] = useState('');
    const [selectedPage, setSelectedPage] = useState(pages[pages.length - 1]);
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });
    const [myReports, setMyReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);

    const fetchMyReports = useCallback(async () => {
        setLoadingReports(true);
        try {
            const response = await FeedbackService.getMyFeedbackReports();
            setMyReports(response.data);
        } catch (error) { console.error("Gagal memuat riwayat:", error); } 
        finally { setLoadingReports(false); }
    }, []);

    useEffect(() => { fetchMyReports(); }, [fetchMyReports]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { 
                 setNotif({ isOpen: true, title: "Gagal", message: "Ukuran file maksimal 5MB.", success: false });
                 return;
            }
            setAttachment(file); setAttachmentName(file.name);
        }
    };
    
    const removeAttachment = () => {
        setAttachment(null); setAttachmentName('');
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = null;
    };

    const resetForm = useCallback(() => {
        setSelectedType(feedbackTypes[0]); setTitle('');
        setSelectedPage(pages[pages.length - 1]); setDescription('');
        removeAttachment(); setIsLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((selectedType.id === 'bug' || selectedType.id === 'fitur') && !title.trim()) {
            setNotif({ isOpen: true, title: "Input Kurang", message: "Judul wajib diisi.", success: false }); return;
        }
        if (!description.trim()) {
            setNotif({ isOpen: true, title: "Input Kurang", message: "Deskripsi wajib diisi.", success: false }); return;
        }

        setIsLoading(true);
        setNotif(prev => ({ ...prev, isOpen: false })); 

        const formData = new FormData();
        formData.append('type', selectedType.id); formData.append('title', title.trim());
        formData.append('page_context', selectedPage.name); formData.append('description', description);
        if (attachment) { formData.append('attachment', attachment); }

        try {
            const response = await FeedbackService.submitFeedback(formData);
            setNotif({ isOpen: true, title: "Berhasil!", message: response.data.message || "Masukan Anda telah diterima!", success: true });
            resetForm(); 
            fetchMyReports();
        } catch (error) {
            const message = error.response?.data?.message || error.message || "Terjadi kesalahan saat mengirim.";
            setNotif({ isOpen: true, title: "Gagal!", message: message, success: false });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseNotif = () => setNotif({ ...notif, isOpen: false });

    // ✅ Tombol kembali sekarang SELALU ke profil
    const handleBackClick = () => {
        navigate('profile');
    };

    return (
        <>
            <div className="fixed top-5 right-5 z-[100]">
                <AnimatePresence>
                    {notif.isOpen && (
                        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                            <Notification isOpen={notif.isOpen} onClose={handleCloseNotif} title={notif.title} message={notif.message} success={notif.success} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <motion.div 
                className="min-h-screen w-full flex flex-col"
                style={{ background: 'linear-gradient(135deg, #e0fdfa, #f0f9ff, #fefce8, #f0f9ff)', backgroundSize: '400% 400%' }}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
            >

                {/* --- ✅ HEADER YANG DISERDERHANAKAN --- */}
                <motion.header 
                    className="bg-white/80 backdrop-blur-sm p-4 pt-8 md:pt-4 flex items-center justify-between sticky top-0 z-10 shadow-sm flex-shrink-0"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                    <motion.button
                        onClick={handleBackClick} // <-- Fungsi kembali yang simpel
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FiArrowLeft size={16} />
                        Kembali
                    </motion.button>
                    
                    {/* Judul Statis */}
                    <h1 className="text-lg font-bold text-center text-sesm-deep flex items-center justify-center gap-2">
                        <FiMessageSquare className="text-sesm-teal" /> Saran & Masukan
                    </h1>

                    {/* Hapus tombol ikon di kanan */}
                    <div className="w-20"></div>
                </motion.header>

                <main className="flex-grow overflow-y-auto p-4 md:p-8">
                    <div className="w-full">
                        
                        {/* --- ✅ TOMBOL TAB PENGGANTI --- */}
                        <motion.div 
                            className="flex p-1 bg-gray-200/80 rounded-xl mb-6"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <TabButton
                                text="Tulis Laporan"
                                icon={<FiEdit />}
                                active={currentView === 'form'}
                                onClick={() => setCurrentView('form')}
                            />
                            <TabButton
                                text="Riwayat Laporan"
                                icon={<FiList />}
                                active={currentView === 'history'}
                                onClick={() => setCurrentView('history')}
                            />
                        </motion.div>


                        <AnimatePresence mode="wait">
                            
                            {/* --- VIEW 1: FORM PENGISIAN --- */}
                            {currentView === 'form' && (
                                <motion.div
                                    key="form-view"
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                                >
                                    <motion.div
                                        className="w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="show"
                                    >
                                        <motion.form onSubmit={handleSubmit} variants={containerVariants} initial="hidden" animate="show">
                                            <div className="p-6 md:p-8 space-y-6">
                                                {/* (Semua item form Anda: Tipe, Judul, Halaman, Deskripsi, Lampiran) */}
                                                <motion.div variants={itemVariants}>
                                                    <label className="block text-sm font-bold text-gray-800 mb-2">Jenis Masukan *</label>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {feedbackTypes.map((type) => (
                                                            <motion.button key={type.id} type="button" onClick={() => setSelectedType(type)} className={`relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-center h-24 ${ selectedType.id === type.id ? `font-bold ${type.color}` : 'border-gray-200 bg-gray-50/50 text-gray-600 hover:border-gray-300 hover:bg-white' }`} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} >
                                                                <type.icon size={24} /> <span className="text-xs font-semibold">{type.name}</span>
                                                                {selectedType.id === type.id && ( <motion.div layoutId="selected-type-border" className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-b-full bg-sesm-teal" /> )}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                                <AnimatedInput id="title" label="Judul Singkat" required={(selectedType.id === 'bug' || selectedType.id === 'fitur')} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={ selectedType.id === 'bug' ? 'cth: Tombol submit hilang...' : 'cth: Usulan fitur leaderboard...' } />
                                                <motion.div variants={itemVariants}>
                                                    <Listbox value={selectedPage} onChange={setSelectedPage}>
                                                        <Listbox.Label className="block text-sm font-bold text-gray-800">Halaman Terkait (Opsional)</Listbox.Label>
                                                        <div className="relative mt-2">
                                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-50 py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sesm-teal sm:text-sm text-gray-900 transition-colors focus:bg-white">
                                                                <span className="block truncate">{selectedPage.name}</span> <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"> <FiChevronDown className="h-5 w-5 text-gray-400" /> </span>
                                                            </Listbox.Button>
                                                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                                <Listbox.Options className="absolute mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
                                                                    {pages.map((page) => (
                                                                        <Listbox.Option key={page.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-sesm-teal/10 text-sesm-deep' : 'text-gray-900' }`} value={page} >
                                                                            {({ selected }) => ( <> <span className={`block truncate ${ selected ? 'font-medium' : 'font-normal' }`}> {page.name} </span> {selected ? ( <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sesm-teal"> <FiCheckCircle className="h-5 w-5" /> </span> ) : null} </> )}
                                                                        </Listbox.Option>
                                                                    ))}
                                                                </Listbox.Options>
                                                            </Transition>
                                                        </div>
                                                    </Listbox>
                                                </motion.div>
                                                <AnimatedTextarea id="description" label="Deskripsi Detail" required={true} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tuliskan saran, usulan, atau kendala Anda secara rinci di sini..." />
                                                <motion.div variants={itemVariants}>
                                                    <label className="block text-sm font-bold text-gray-800">Lampiran (Opsional)</label>
                                                    <motion.label htmlFor="file-upload" className="mt-2 flex justify-center px-6 py-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50/50 hover:bg-white transition-colors hover:border-sesm-teal" whileHover={{ scale: 1.02 }}>
                                                        <div className="space-y-1 text-center">
                                                            <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
                                                            <AnimatePresence mode="wait">
                                                                {attachmentName ? (
                                                                    <motion.div key="file-name" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-center justify-center text-sm text-sesm-deep font-semibold">
                                                                        <FiPaperclip className="mr-1.5" /> <span className="truncate max-w-[200px]">{attachmentName}</span>
                                                                        <motion.button type="button" onClick={(e) => { e.preventDefault(); removeAttachment(); }} className="ml-2 text-red-500 hover:text-red-700" title="Hapus file" whileHover={{ scale: 1.2 }}> <FiX size={16}/> </motion.button>
                                                                    </motion.div>
                                                                ) : (
                                                                    <motion.div key="upload-prompt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                                                        <div className="flex text-sm text-gray-600">
                                                                            <span className="font-medium text-sesm-deep hover:text-sesm-teal">Upload file</span>
                                                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/mp4,video/quicktime,.pdf,.doc,.docx" />
                                                                            <p className="pl-1">atau drag and drop</p>
                                                                        </div>
                                                                        <p className="text-xs text-gray-500">Gambar, Video, Dokumen (Max. 5MB)</p>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </motion.label>
                                                </motion.div>
                                            </div> 
                                            <motion.footer className="p-6 bg-gray-50/80 border-t border-gray-200" variants={itemVariants}>
                                                <motion.button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2.5 bg-sesm-deep text-white font-bold py-3 px-5 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sesm-deep disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed" whileHover={{ scale: isLoading ? 1 : 1.03, boxShadow: isLoading ? 'none' : '0px 8px 25px -10px rgba(20, 184, 166, 0.6)' }} whileTap={{ scale: isLoading ? 1 : 0.98 }} transition={{ type: 'spring', stiffness: 300 }}>
                                                    <AnimatePresence mode="wait">
                                                        {isLoading ? ( <motion.div key="loader" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}> <FiLoader className="animate-spin" /> </motion.div> ) : ( <motion.div key="icon" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}> <FiSend /> </motion.div> )}
                                                    </AnimatePresence>
                                                    <span>{isLoading ? 'Mengirim...' : 'Kirim Masukan'}</span>
                                                </motion.button>
                                            </motion.footer>
                                        </motion.form>
                                    </motion.div>
                                </motion.div>
                            )}
                            
                            {/* --- VIEW 2: RIWAYAT LAPORAN (Desain Kartu) --- */}
                            {currentView === 'history' && (
                                <motion.div
                                    key="history-view"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                                >
                                    <div className="w-full">
                                        {loadingReports ? (
                                            <div className="flex justify-center items-center p-8"><FiLoader className="animate-spin text-2xl text-sesm-teal" /></div>
                                        ) : myReports.length === 0 ? (
                                            <div className="text-center text-gray-500 p-8 bg-white/80 rounded-2xl shadow-lg border border-gray-100">
                                                <FiMessageSquare size={40} className="mx-auto mb-3 text-gray-400" />
                                                <h3 className="font-bold text-lg text-gray-700">Belum Ada Laporan</h3>
                                                <p className="text-sm">Anda belum pernah mengirimkan laporan.</p>
                                            </div>
                                        ) : (
                                            <motion.div 
                                                className="space-y-4"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="show"
                                            >
                                                {myReports.map(report => {
                                                    const status = mapUserStatus(report.status);
                                                    const StatusIcon = status.icon;
                                                    const typeInfo = feedbackTypes.find(t => t.id === report.type) || { icon: FiInfo, color: 'text-gray-500', bgColor: 'bg-gray-100' };
                                                    const TypeIcon = typeInfo.icon;

                                                    return (
                                                        <motion.div 
                                                            key={report.id} 
                                                            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                                                            variants={itemVariants}
                                                            layout
                                                            whileHover={{ scale: 1.02, shadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                                        >
                                                            <div className="p-5 flex items-start gap-4">
                                                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${typeInfo.bgColor} ${typeInfo.color}`}>
                                                                    <TypeIcon size={24} />
                                                                </div>
                                                                <div className="flex-grow min-w-0">
                                                                    <p className="text-base font-bold text-sesm-deep capitalize truncate" title={report.title || `Laporan ${report.type}`}>
                                                                        {report.title || `Laporan ${report.type}`}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 mt-1">
                                                                        {new Date(report.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.color}`}>
                                                                        <StatusIcon size={12} />
                                                                        {status.text}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <AnimatePresence>
                                                            {report.admin_notes && (
                                                                <motion.div 
                                                                    className="bg-purple-50 border-t border-purple-200 px-5 py-4"
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                >
                                                                    <div className="flex gap-3">
                                                                        <FiCornerDownRight size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                                                        <div>
                                                                            <p className="text-sm font-bold text-purple-800">Catatan dari Admin:</p>
                                                                            <p className="text-sm text-purple-700 mt-1 whitespace-pre-wrap">
                                                                                {report.admin_notes}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    );
                                                })}
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </motion.div>
        </>
    );
};

// --- ✅ KOMPONEN BARU UNTUK TAB ---
const TabButton = ({ text, icon, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`relative w-1/2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-bold transition-colors ${
                active ? "text-sesm-deep" : "text-gray-500 hover:text-gray-800"
            }`}
        >
            {active && (
                <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-white rounded-lg shadow-md"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
            )}
            <span className="relative z-10">{icon}</span>
            <span className="relative z-10">{text}</span>
        </button>
    );
};

export default FeedbackPage;