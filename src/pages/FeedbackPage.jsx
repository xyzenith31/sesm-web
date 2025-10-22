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
// import FeedbackService from '../services/feedbackService'; // Komentari atau hapus jika hanya simulasi
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

// Simulasi fungsi submit (Ganti dengan API call asli jika sudah ada)
const submitFeedbackSim = async (formData) => {
    console.log("Mengirim feedback ke server (simulasi):", {
        type: formData.get('type'),
        title: formData.get('title'),
        page: formData.get('page_context'), // Ganti nama field jika diperlukan
        description: formData.get('description'),
        attachment: formData.get('attachment'),
    });
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Simulate success/failure
    if (Math.random() > 0.1) { // 90% chance of success
        return { success: true, message: "Masukan Anda telah diterima! Terima kasih." };
    } else {
        throw new Error("Gagal mengirim laporan. Silakan coba lagi nanti.");
    }
};

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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                 setNotif({ isOpen: true, title: "Gagal", message: "Ukuran file maksimal 5MB.", success: false });
                 return;
            }
            setAttachment(file);
            setAttachmentName(file.name);
        }
    };
    const removeAttachment = () => {
        setAttachment(null);
        setAttachmentName('');
        // Reset file input value agar bisa memilih file yang sama lagi
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = null;
    };
    const resetForm = () => {
        setSelectedType(feedbackTypes[0]);
        setTitle('');
        setSelectedPage(pages[pages.length - 1]);
        setDescription('');
        removeAttachment(); // Panggil fungsi remove attachment
        setIsLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validasi
        if ((selectedType.id === 'bug' || selectedType.id === 'fitur') && !title.trim()) {
            setNotif({ isOpen: true, title: "Input Kurang", message: "Judul wajib diisi untuk laporan bug atau usulan fitur.", success: false });
            return;
        }
        if (!description.trim()) {
            setNotif({ isOpen: true, title: "Input Kurang", message: "Deskripsi wajib diisi.", success: false });
            return;
        }

        setIsLoading(true);
        setNotif(prev => ({ ...prev, isOpen: false })); // Tutup notif sebelumnya

        const formData = new FormData();
        formData.append('type', selectedType.id);
        formData.append('title', title.trim());
        formData.append('page_context', selectedPage.name); // Nama field bisa disesuaikan dengan backend
        formData.append('description', description);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            // Ganti submitFeedbackSim dengan FeedbackService.submitFeedback(formData) jika menggunakan API asli
            const result = await submitFeedbackSim(formData);
            setNotif({ isOpen: true, title: "Berhasil!", message: result.message, success: true });
            resetForm(); // Reset form setelah berhasil
        } catch (error) {
            setNotif({ isOpen: true, title: "Gagal!", message: error.message || "Terjadi kesalahan saat mengirim.", success: false });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseNotif = () => setNotif({ ...notif, isOpen: false });


    return (
        <>
            {/* Notifikasi */}
            <Notification
                isOpen={notif.isOpen}
                onClose={handleCloseNotif}
                title={notif.title}
                message={notif.message}
                success={notif.success}
            />

            {/* Layout Utama Halaman (Full Width) */}
            <div className="min-h-screen bg-gray-100 flex flex-col">

                {/* Header */}
                <header className="bg-white p-4 pt-8 md:pt-4 flex items-center sticky top-0 z-10 shadow-sm flex-shrink-0">
                    <motion.button
                        onClick={() => navigate('profile')}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        whileTap={{ scale: 0.9 }}
                    >
                        <FiArrowLeft size={24} className="text-gray-700" />
                    </motion.button>
                    <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep flex items-center justify-center gap-2">
                        <FiMessageSquare /> Saran & Masukan
                    </h1>
                    <div className="w-10"></div> {/* Spacer */}
                </header>

                {/* Konten Utama (Scrollable) */}
                <main className="flex-grow overflow-y-auto p-4 md:p-8">
                    {/* Wadah untuk Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        // ✅ PERBAIKAN: Hapus lg:max-w-3xl dan mx-auto
                        className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        <form onSubmit={handleSubmit}>
                            {/* Konten Form */}
                            <div className="p-6 md:p-8 space-y-6">
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
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={
                                            selectedType.id === 'bug' ? 'cth: Tombol submit hilang saat...' :
                                            selectedType.id === 'fitur' ? 'cth: Usulan fitur leaderboard mingguan' :
                                            'cth: Tampilan profil kurang jelas'
                                        }
                                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sesm-teal focus:border-transparent bg-white text-gray-900"
                                        required={selectedType.id !== 'saran'}
                                    />
                                </div>

                                {/* Halaman Terkait */}
                                <div>
                                    <Listbox value={selectedPage} onChange={setSelectedPage}>
                                        <Listbox.Label className="block text-sm font-bold text-gray-700">Halaman Terkait (Opsional)</Listbox.Label>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-3 pl-4 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-sesm-teal focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-sesm-teal/50 sm:text-sm text-gray-900">
                                                <span className="block truncate">{selectedPage.name}</span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <FiChevronDown className="h-5 w-5 text-gray-400" />
                                                </span>
                                            </Listbox.Button>
                                            <Transition
                                                as={Fragment}
                                                leave="transition ease-in duration-100"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <Listbox.Options className="absolute mt-1 max-h-48 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
                                                    {pages.map((page) => (
                                                        <Listbox.Option
                                                            key={page.id}
                                                            className={({ active }) =>
                                                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                active ? 'bg-sesm-teal/10 text-sesm-deep' : 'text-gray-900'
                                                                }`
                                                            }
                                                            value={page}
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${ selected ? 'font-medium' : 'font-normal' }`}>
                                                                        {page.name}
                                                                    </span>
                                                                    {selected ? (
                                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sesm-teal">
                                                                            <FiCheckCircle className="h-5 w-5" />
                                                                        </span>
                                                                    ) : null}
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
                                    <textarea
                                        id="description"
                                        rows="5"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={
                                            selectedType.id === 'bug' ? 'Jelaskan masalah yang Anda temui, langkah-langkah untuk mereproduksinya, dan apa yang seharusnya terjadi...' :
                                            selectedType.id === 'fitur' ? 'Jelaskan fitur baru yang Anda inginkan dan mengapa fitur ini akan berguna bagi pengguna lain...' :
                                            'Tuliskan saran atau masukan umum Anda untuk pengembangan SESM di sini...'
                                        }
                                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sesm-teal focus:border-transparent resize-y bg-white text-gray-900"
                                        required
                                    ></textarea>
                                </div>

                                {/* Lampiran */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Lampiran (Opsional)</label>
                                    <label htmlFor="file-upload" className="mt-1 flex justify-center px-6 py-8 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="space-y-1 text-center">
                                            <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
                                            {attachmentName ? (
                                                <div className="flex items-center justify-center text-sm text-sesm-deep font-semibold">
                                                    <FiPaperclip className="mr-1.5" />
                                                    <span className="truncate max-w-[200px]">{attachmentName}</span>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.preventDefault(); removeAttachment(); }}
                                                        className="ml-2 text-red-500 hover:text-red-700"
                                                        title="Hapus file"
                                                    >
                                                        <FiX size={16}/>
                                                    </button>
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
                            <footer className="p-6 bg-gray-50 border-t border-gray-200">
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-sesm-deep text-white font-bold py-3 rounded-lg shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sesm-deep disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading ? <FiLoader className="animate-spin" /> : <FiSend />}
                                    {isLoading ? 'Mengirim...' : 'Kirim Masukan'}
                                </motion.button>
                            </footer>
                        </form>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export default FeedbackPage;