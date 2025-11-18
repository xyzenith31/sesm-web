import React, { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiX, FiGift, FiFileText, FiUpload, FiLoader,
    FiCheckCircle, FiAlertCircle, FiTag, FiPaperclip, FiChevronDown,
    FiTool 
} from 'react-icons/fi';
import { FaBug, FaCommentDots, FaLightbulb } from 'react-icons/fa';
import { Listbox, Transition } from '@headlessui/react';
import FeedbackService from '../../services/feedbackService';

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

const feedbackTypeDetails = {
    bug: {
        name: 'Lapor Bug',
        icon: FaBug,
        color: 'sesm-deep',
        placeholderTitle: 'cth: Tombol Home tidak bisa diklik',
        placeholderDesc: 'Jelaskan langkah-langkah agar bug ini terjadi...'
    },
    fitur: {
        name: 'Usul Fitur',
        icon: FaLightbulb, 
        color: 'sesm-teal',
        placeholderTitle: 'cth: Tambah fitur dark mode',
        placeholderDesc: 'Jelaskan bagaimana fitur ini akan bekerja...'
    },
    saran: {
        name: 'Saran Umum',
        icon: FaCommentDots,
        color: 'green-600',
        placeholderTitle: 'cth: Tampilan profil kurang jelas (Opsional)',
        placeholderDesc: 'Tuliskan saran umum Anda di sini...'
    },
    kendala: {
        name: 'Lapor Kendala',
        icon: FiTool,
        color: 'orange-600',
        placeholderTitle: 'cth: Materi sulit dipahami (Opsional)',
        placeholderDesc: 'Jelaskan kendala yang Anda alami...'
    }
};

const FeedbackModal = ({ isOpen, onClose }) => {
    const [feedbackType, setFeedbackType] = useState('bug');
    const [title, setTitle] = useState('');
    const [selectedPage, setSelectedPage] = useState(pages[pages.length - 1]);
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [attachmentName, setAttachmentName] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); 

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { 
                 setSubmitStatus({ success: false, message: "Ukuran file maksimal 5MB." });
                 return;
            }
            setAttachment(file);
            setAttachmentName(file.name);
        }
    };

    const resetForm = () => {
        setFeedbackType('bug');
        setTitle('');
        setSelectedPage(pages[pages.length - 1]);
        setDescription('');
        setAttachment(null);
        setAttachmentName('');
        setIsLoading(false);
        setSubmitStatus(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!description.trim()) {
            setSubmitStatus({ success: false, message: "Deskripsi wajib diisi." });
            return;
        }
        if ((feedbackType === 'bug' || feedbackType === 'fitur') && !title.trim()) {
             setSubmitStatus({ success: false, message: "Judul wajib diisi untuk Bug/Fitur." });
            return;
        }

        setIsLoading(true);
        setSubmitStatus(null);

        const formData = new FormData();
        formData.append('type', feedbackType);
        formData.append('title', title.trim());
        formData.append('page_context', selectedPage.name);
        formData.append('description', description);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            const response = await FeedbackService.submitFeedback(formData);

            setIsLoading(false);
            setSubmitStatus({ success: true, message: response.data.message || "Laporan berhasil dikirim!" });

            setTimeout(() => {
                onClose(); 
                setTimeout(resetForm, 300);
            }, 2000);

        } catch (error) {
            setIsLoading(false);
            const message = error.response?.data?.message || error.message || "Gagal mengirim laporan.";
            setSubmitStatus({ success: false, message: message });
        }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
        exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } }
    };

    const CurrentIcon = feedbackTypeDetails[feedbackType].icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className={`text-lg font-bold text-${feedbackTypeDetails[feedbackType].color} flex items-center gap-2`}>
                                <CurrentIcon />
                                {feedbackTypeDetails[feedbackType].name}
                            </h3>
                            <motion.button
                                onClick={onClose}
                                disabled={isLoading}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
                                whileTap={{ scale: 0.9 }}
                            >
                                <FiX size={20} />
                            </motion.button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
                            <fieldset disabled={isLoading}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Masukan</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(feedbackTypeDetails).map(([key, { name, icon: Icon, color }]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setFeedbackType(key)}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                                    feedbackType === key
                                                    ? `bg-${color}/10 border-${color} text-${color}`
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                                                }`}
                                            >
                                                <Icon /> <span className="font-semibold text-sm">{name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Judul Singkat {feedbackType === 'saran' || feedbackType === 'kendala' ? '(Opsional)' : ''}
                                    </label>
                                    <div className="relative mt-1">
                                        <input
                                            type="text"
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder={feedbackTypeDetails[feedbackType].placeholderTitle}
                                            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-sesm-deep focus:border-sesm-deep"
                                            required={feedbackType === 'bug' || feedbackType === 'fitur'}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Listbox value={selectedPage} onChange={setSelectedPage}>
                                        <Listbox.Label className="block text-sm font-medium text-gray-700">Halaman Terkait (Opsional)</Listbox.Label>
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus-visible:border-sesm-deep focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-sesm-teal/50 sm:text-sm">
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
                                                <Listbox.Options className="absolute mt-1 max-h-40 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-10">
                                                    {pages.map((page) => (
                                                        <Listbox.Option
                                                            key={page.id}
                                                            className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                                active ? 'bg-sesm-teal/10 text-sesm-deep' : 'text-gray-900'
                                                            }`}
                                                            value={page}
                                                        >
                                                            {({ selected }) => (
                                                                <>
                                                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
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

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Deskripsi Detail</label>
                                    <textarea
                                        id="description"
                                        rows="4"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={feedbackTypeDetails[feedbackType].placeholderDesc} 
                                        className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:ring-sesm-deep focus:border-sesm-deep"
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lampiran (Screenshot/Video Pendek)</label>
                                    <label htmlFor="file-upload-modal" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="space-y-1 text-center">
                                            <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
                                            {attachmentName ? (
                                                <p className="text-sm font-semibold text-sesm-deep flex items-center gap-1.5"><FiPaperclip /> {attachmentName}</p>
                                            ) : (
                                                <div className="flex text-sm text-gray-600">
                                                    <span className="font-medium text-sesm-deep hover:text-sesm-teal">Upload file</span>
                                                    <input id="file-upload-modal" name="file-upload-modal" type="file" className="sr-only" onChange={handleFileChange} accept="image/*,video/mp4,video/quicktime,.pdf,.doc,.docx" />
                                                    <p className="pl-1">atau drag and drop</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500">Gambar, Video, PDF, Dokumen (Max. 5MB)</p>
                                        </div>
                                    </label>
                                </div>
                            </fieldset>
                        </form>

                        <div className="p-4 bg-gray-50 border-t space-y-3">
                            <AnimatePresence>
                                {submitStatus && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                                            submitStatus.success
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {submitStatus.success ? <FiCheckCircle /> : <FiAlertCircle />}
                                        <span className="font-medium">{submitStatus.message}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                                <motion.button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Batal
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    onClick={handleSubmit} 
                                    disabled={isLoading || (submitStatus && submitStatus.success)}
                                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-sesm-deep text-base font-medium text-white hover:bg-opacity-90 focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50 disabled:bg-sesm-deep/60"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isLoading ? (
                                        <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                    ) : (
                                        <FiCheckCircle className="-ml-1 mr-2 h-5 w-5" />
                                    )}
                                    {isLoading ? 'Mengirim...' : 'Kirim Masukan'}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;