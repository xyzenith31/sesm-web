// contoh-sesm-web/pages/FeedbackPage.jsx
import React, { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiSend, FiTag, FiFileText, FiUpload, FiLoader,
    FiCheckCircle, FiAlertCircle, FiPaperclip, FiX, FiChevronDown,
    FiMessageSquare, FiInfo
} from 'react-icons/fi';
import { FaBug, FaLightbulb, FaCommentDots } from 'react-icons/fa';
import { Listbox, Transition } from '@headlessui/react';
import Notification from '../components/ui/Notification'; // Sesuaikan path jika perlu
// import FeedbackService from '../services/feedbackService'; // Komentari atau hapus
import { useNavigation } from '../hooks/useNavigation';

// Opsi tipe feedback
const feedbackTypes = [
    { id: 'bug', name: 'Laporkan Bug', icon: FaBug, color: 'text-red-500', bgColor: 'bg-red-100' },
    { id: 'fitur', name: 'Usulkan Fitur', icon: FaLightbulb, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { id: 'saran', name: 'Saran Umum', icon: FaCommentDots, color: 'text-green-500', bgColor: 'bg-green-100' },
];

// Opsi halaman terkait
const pages = [
    { id: 'home', name: 'Halaman Utama (Home)' },
    { id: 'mapel', name: 'Halaman Mata Pelajaran' },
    { id: 'worksheet', name: 'Halaman Pengerjaan Materi' },
    { id: 'explore', name: 'Halaman Jelajahi (Explore)' },
    { id: 'kreatif', name: 'Zona Kreatif (Gambar/Tulis)' },
    { id: 'bookmark', name: 'Halaman Bookmark' },
    { id: 'kuis', name: 'Halaman Kuis' },
    { id: 'profil', name: 'Halaman Profil' },
    { id: 'login', name: 'Halaman Login/Register' },
    { id: 'lainnya', name: 'Lainnya / Tidak Spesifik' },
];

const FeedbackPage = () => {
    const { navigate } = useNavigation();
    const [selectedType, setSelectedType] = useState(feedbackTypes[0]);
    const [title, setTitle] = useState('');
    const [selectedPage, setSelectedPage] = useState(pages[pages.length - 1]);
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });

    // Fungsi handleFileChange, removeAttachment, resetForm (TIDAK BERUBAH)
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { setNotif({ isOpen: true, title: "Gagal", message: "Ukuran file maksimal 5MB.", success: false }); return; }
            setAttachment(file); setAttachmentName(file.name);
        }
    };
    const removeAttachment = () => {
        setAttachment(null); setAttachmentName('');
        const fileInput = document.getElementById('file-upload'); if (fileInput) fileInput.value = null;
    };
    const resetForm = () => {
        setSelectedType(feedbackTypes[0]); setTitle(''); setSelectedPage(pages[pages.length - 1]);
        setDescription(''); removeAttachment(); setIsLoading(false);
    };

    // Fungsi handleSubmit (Simulasi)
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validasi
        if ((selectedType.id === 'bug' || selectedType.id === 'fitur') && !title.trim()) { setNotif({ isOpen: true, title: "Input Kurang", message: "Judul wajib diisi untuk laporan bug atau usulan fitur.", success: false }); return; }
        if (!description.trim()) { setNotif({ isOpen: true, title: "Input Kurang", message: "Deskripsi wajib diisi.", success: false }); return; }
        setIsLoading(true); setNotif(prev => ({ ...prev, isOpen: false }));

        console.log("Data yang akan dikirim (simulasi):", { type: selectedType.id, title: title.trim(), page_context: selectedPage.name, description: description, attachment: attachment ? attachment.name : null, });
        await new Promise(resolve => setTimeout(resolve, 1500));
        setNotif({ isOpen: true, title: "Berhasil!", message: "Masukan Anda telah diterima (simulasi). Terima kasih!", success: true });
        resetForm(); setIsLoading(false);
    };

    // Fungsi handleCloseNotif (TIDAK BERUBAH)
    const handleCloseNotif = () => setNotif({ ...notif, isOpen: false });


    return (
        <>
            <Notification
                isOpen={notif.isOpen}
                onClose={handleCloseNotif}
                title={notif.title}
                message={notif.message}
                success={notif.success}
            />

            {/* Layout Utama Halaman (Full Width) */}
            {/* Menggunakan min-h-screen agar mengisi tinggi layar, bg-gray-100 untuk latar belakang */}
            <div className="min-h-screen bg-gray-100 flex flex-col">

                {/* Header */}
                <header className="bg-white p-4 pt-8 md:pt-4 flex items-center sticky top-0 z-10 shadow-sm flex-shrink-0">
                    <motion.button
                        onClick={() => navigate('profile')}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors" // Ganti hover bg
                        whileTap={{ scale: 0.9 }}
                    >
                        <FiArrowLeft size={24} className="text-gray-700" />
                    </motion.button>
                    <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep flex items-center justify-center gap-2">
                        <FiMessageSquare /> Saran & Masukan
                    </h1>
                    <div className="w-10"></div> {/* Spacer */}
                </header>

                {/* Konten Utama (Scrollable jika perlu) */}
                <main className="flex-grow overflow-y-auto p-4 md:p-8"> {/* Tambahkan padding */}
                    {/* Wadah untuk Form dengan max-width agar tidak terlalu lebar di desktop */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden" // max-w-3xl atau sesuaikan
                    >
                        <form onSubmit={handleSubmit}>
                            {/* Konten Form */}
                            <div className="p-6 md:p-8 space-y-6"> {/* Tambahkan padding */}
                                {/* Tipe Feedback */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Jenis Masukan</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {feedbackTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setSelectedType(type)}
                                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-center h-24 ${
                                                    selectedType.id === type.id
                                                    ? `border-sesm-teal bg-sesm-teal/10 ${type.color}`
                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <type.icon size={24} />
                                                <span className="text-xs font-semibold">{type.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Judul */}
                                <div>
                                    <label htmlFor="title" className="block text-sm font-bold text-gray-700">
                                        Judul Singkat {selectedType.id !== 'saran' ? '*' : '(Opsional)'}
                                    </label>
                                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={
                                            selectedType.id === 'bug' ? 'cth: Tombol submit hilang' :
                                            selectedType.id === 'fitur' ? 'cth: Fitur leaderboard mingguan' :
                                            'cth: Tampilan kurang jelas'
                                        } className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sesm-teal focus:border-transparent bg-white" required={selectedType.id !== 'saran'} />
                                </div>

                                {/* Halaman Terkait */}
                                <div>
                                    <Listbox value={selectedPage} onChange={setSelectedPage}>
                                        <Listbox.Label className="block text-sm font-bold text-gray-700">Halaman Terkait (Opsional)</Listbox.Label>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-sesm-teal focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-sesm-teal/50 sm:text-sm">
                                                <span className="block truncate">{selectedPage.name}</span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"> <FiChevronDown className="h-5 w-5 text-gray-400" /> </span>
                                            </Listbox.Button>
                                            <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                                <Listbox.Options className="absolute mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
                                                    {pages.map((page) => (
                                                        <Listbox.Option key={page.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${ active ? 'bg-sesm-teal/10 text-sesm-deep' : 'text-gray-900' }`} value={page}>
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${ selected ? 'font-medium' : 'font-normal' }`}>{page.name}</span>
                                                                    {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sesm-teal"><FiCheckCircle className="h-5 w-5" /></span>) : null}
                                                                </>
                                                            )}
                                                        </Listbox.Option>
                                                    ))}
                                                </Listbox.Options>
                                            </Transition>
                                        </div>
                                    </Listbox>
                                </div>

                                {/* Deskripsi */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-bold text-gray-700">Deskripsi Detail *</label>
                                    <textarea id="description" rows="5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={
                                            selectedType.id === 'bug' ? 'Jelaskan masalah yang Anda temui, langkah-langkahnya, dan apa yang seharusnya terjadi...' :
                                            selectedType.id === 'fitur' ? 'Jelaskan fitur yang Anda inginkan dan mengapa itu berguna...' :
                                            'Tuliskan saran atau masukan umum Anda di sini...'
                                        } className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sesm-teal focus:border-transparent resize-y bg-white" required></textarea>
                                </div>

                                {/* Lampiran */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Lampiran (Opsional)</label>
                                    <label htmlFor="file-upload" className="mt-1 flex justify-center px-6 py-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"> {/* Ganti bg */}
                                        <div className="space-y-1 text-center">
                                            <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
                                            {attachmentName ? (
                                                <div className="flex items-center justify-center text-sm text-sesm-deep font-semibold">
                                                    <FiPaperclip className="mr-1.5" />
                                                    <span className="truncate max-w-[200px]">{attachmentName}</span>
                                                    <button type="button" onClick={(e) => { e.preventDefault(); removeAttachment(); }} className="ml-2 text-red-500 hover:text-red-700" title="Hapus file"> <FiX size={16}/> </button>
                                                </div>
                                            ) : (
                                                <div className="flex text-sm text-gray-600">
                                                    <span className="font-medium text-sesm-deep hover:text-sesm-teal">Upload file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/mp4,video/quicktime,.pdf,.doc,.docx" />
                                                    <p className="pl-1">atau drag and drop</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500">Gambar, Video, PDF, Dokumen (Max. 5MB)</p>
                                        </div>
                                    </label>
                                </div>
                            </div> {/* Akhir dari padding konten form */}

                            {/* Footer Form */}
                            <footer className="p-6 bg-gray-50 border-t border-gray-200"> {/* Ganti bg dan tambah border */}
                                <motion.button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-sesm-deep text-white font-bold py-3 rounded-lg shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sesm-deep disabled:bg-gray-400 disabled:cursor-not-allowed" whileTap={{ scale: 0.98 }}>
                                    {isLoading ? <FiLoader className="animate-spin" /> : <FiSend />}
                                    {isLoading ? 'Mengirim...' : 'Kirim Masukan'}
                                </motion.button>
                            </footer>
                        </form>
                    </motion.div>

                    {/* Blok Info Bantuan di Bawah Kartu */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="mt-8 w-full max-w-3xl mx-auto bg-gradient-to-r from-cyan-100 to-blue-100 p-4 rounded-lg flex items-start gap-3 border border-cyan-200"
                    >
                        <FiInfo size={24} className="mt-0.5 flex-shrink-0 text-cyan-700" />
                        <p className="text-sm text-cyan-800">
                            Jika Anda butuh bantuan teknis atau jawaban cepat, silakan kunjungi
                            <span
                                onClick={() => navigate('bantuan')}
                                className="font-bold text-sesm-deep cursor-pointer ml-1 transition-colors duration-200 hover:text-sesm-teal hover:underline"
                            >
                                Pusat Bantuan
                            </span>.
                        </p>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default FeedbackPage;