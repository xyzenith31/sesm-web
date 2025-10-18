// contoh-sesm-web/components/admin/BankSoalBookmarkModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiLoader, FiInbox, FiCheckSquare, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import DataService from '../../services/dataService';
import BookmarkService from '../../services/bookmarkService'; // Pastikan ini diimpor
import CustomSelect from '../ui/CustomSelect'; // 1. Impor CustomSelect
import Notification from '../ui/Notification'; // 2. Impor Notification

const jenjangOptions = {
    'TK': { jenjang: 'TK', kelas: null },
    'SD Kelas 1': { jenjang: 'SD', kelas: 1 },
    'SD Kelas 2': { jenjang: 'SD', kelas: 2 },
    'SD Kelas 3': { jenjang: 'SD', kelas: 3 },
    'SD Kelas 4': { jenjang: 'SD', kelas: 4 },
    'SD Kelas 5': { jenjang: 'SD', kelas: 5 },
    'SD Kelas 6': { jenjang: 'SD', kelas: 6 },
};

// 3. Siapkan options untuk CustomSelect jenjang
const jenjangSelectOptions = Object.keys(jenjangOptions).map(key => ({
    value: key,
    label: key,
}));

const BankSoalBookmarkModal = ({ isOpen, onClose, onQuestionsAdded }) => {
    const [step, setStep] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    // State error tidak lagi digunakan langsung untuk UI, diganti notifikasi
    // const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('Semua');
    const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
    const [selectedFilterKey, setSelectedFilterKey] = useState('TK');

    // State untuk Step 2
    const [allBookmarks, setAllBookmarks] = useState([]);
    const [targetBookmarkLoading, setTargetBookmarkLoading] = useState(false);
    const [targetBookmarkId, setTargetBookmarkId] = useState('');

    // 4. State untuk Notifikasi
    const [notif, setNotif] = useState({
        isOpen: false,
        message: '',
        success: true,
        title: '',
    });

    // Effect untuk Step 1 (Mengambil daftar soal dari bank)
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // setError(null); // Tidak perlu lagi
            const { jenjang, kelas } = jenjangOptions[selectedFilterKey];
            DataService.getAllQuestionsForBank(jenjang, kelas)
                .then(response => setQuestions(response.data))
                .catch(err => {
                    // 5. Ganti alert dengan Notifikasi error
                    setNotif({
                        isOpen: true,
                        title: "Error",
                        message: "Gagal memuat bank soal. Coba lagi nanti.",
                        success: false,
                    });
                    console.error("Gagal memuat bank soal:", err);
                })
                .finally(() => setLoading(false));
        } else {
            // Reset state saat modal ditutup
            setStep(1);
            setQuestions([]);
            setSelectedQuestionIds(new Set());
            setSearchTerm('');
            setSelectedSubject('Semua');
            setTargetBookmarkId(''); // Reset pilihan target
            // setError(null); // Tidak perlu lagi
        }
    }, [isOpen, selectedFilterKey]);

    // Fungsi untuk mengambil daftar bookmark tujuan
    const fetchTargetBookmarks = useCallback(() => {
        setTargetBookmarkLoading(true);
        BookmarkService.getAllBookmarks() // Gunakan BookmarkService
            .then(response => {
                setAllBookmarks(response.data);
            })
            .catch(err => {
                // 6. Ganti alert dengan Notifikasi error
                setNotif({
                    isOpen: true,
                    title: "Error",
                    message: "Gagal memuat daftar materi bookmark tujuan.",
                    success: false,
                });
                console.error("Gagal memuat daftar bookmark:", err);
                setAllBookmarks([]);
            })
            .finally(() => {
                setTargetBookmarkLoading(false);
            });
    }, []);

    // Effect untuk Step 2 (Mengambil daftar bookmark tujuan)
    useEffect(() => {
        if (isOpen && step === 2) {
            fetchTargetBookmarks();
        }
    }, [isOpen, step, fetchTargetBookmarks]);

    // 7. Siapkan options untuk CustomSelect Subject
    const subjectOptions = useMemo(() => [
        { value: 'Semua', label: 'Semua Mapel' },
        ...Array.from(new Set(questions.map(q => q.nama_mapel)))
               .map(subject => ({ value: subject, label: subject }))
    ], [questions]);


    const filteredQuestions = useMemo(() => {
        return questions.filter(q =>
            q.pertanyaan.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedSubject === 'Semua' || q.nama_mapel === selectedSubject)
        );
    }, [questions, searchTerm, selectedSubject]);

    const toggleQuestionSelection = (questionId) => {
        setSelectedQuestionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) newSet.delete(questionId);
            else newSet.add(questionId);
            return newSet;
        });
    };

    const handleNextStep = () => {
        if (selectedQuestionIds.size === 0) {
            // 8. Ganti alert dengan Notifikasi info
            setNotif({
                isOpen: true,
                title: "Info",
                message: "Pilih setidaknya satu soal untuk melanjutkan.",
                success: true, // atau false jika dianggap warning
            });
            return;
        }
        setStep(2);
    };

    const handleAddQuestionsToBookmark = async () => {
        if (!targetBookmarkId) {
             // 9. Ganti alert dengan Notifikasi info
            setNotif({
                isOpen: true,
                title: "Info",
                message: "Pilih materi bookmark tujuan terlebih dahulu.",
                success: true, // atau false jika dianggap warning
            });
            return;
        }
        setIsAdding(true);
        try {
            // Gunakan addQuestionsFromBankToBookmark dari DataService
            await DataService.addQuestionsFromBankToBookmark(targetBookmarkId, Array.from(selectedQuestionIds));
            onQuestionsAdded(targetBookmarkId); // Kirim ID bookmark yang diperbarui
            // Tidak perlu notifikasi sukses di sini karena parent (ManajemenBookmark) akan menampilkannya
        } catch (error) {
             // 10. Ganti alert dengan Notifikasi error
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: error.response?.data?.message || "Gagal menambahkan soal dari bank ke materi bookmark.",
                success: false,
            });
            console.error("Gagal tambah soal ke bookmark:", error);
        } finally {
            setIsAdding(false);
        }
    };

    // 11. Siapkan options untuk CustomSelect Target Bookmark
    const targetBookmarkOptions = useMemo(() =>
        allBookmarks.map(b => ({
            value: b.id,
            label: b.title
        })),
    [allBookmarks]);

    // 12. Handler untuk menutup notifikasi
    const handleCloseNotif = () => setNotif({ ...notif, isOpen: false });


    if (!isOpen) return null;

    return (
        <>
            {/* 13. Render komponen Notifikasi */}
            <Notification
                isOpen={notif.isOpen}
                onClose={handleCloseNotif}
                title={notif.title}
                message={notif.message}
                success={notif.success}
            />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col h-[90vh]">
                    <div className="p-5 border-b flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-sesm-deep">Bank Soal untuk Materi Bookmark</h3>
                            <p className="text-sm text-gray-500">
                               {step === 1 ? 'Langkah 1: Pilih soal yang ingin ditambahkan.' : 'Langkah 2: Tentukan materi bookmark tujuan.'}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={22}/></button>
                    </div>

                    {step === 1 && (
                        <>
                           <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-4">
                               {/* 14. Ganti select Jenjang */}
                               <div className="w-full md:w-56">
                                    <CustomSelect
                                        options={jenjangSelectOptions}
                                        value={selectedFilterKey}
                                        onChange={setSelectedFilterKey}
                                    />
                                </div>
                                <div className="relative flex-grow">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" placeholder="Cari pertanyaan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 border rounded-lg"/>
                                </div>
                               {/* 15. Ganti select Mapel */}
                               <div className="w-full md:w-56">
                                    <CustomSelect
                                        options={subjectOptions}
                                        value={selectedSubject}
                                        onChange={setSelectedSubject}
                                        disabled={loading || questions.length === 0}
                                    />
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto p-4">
                                {loading ? <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                                : filteredQuestions.length === 0 ? ( // Tidak perlu cek error lagi
                                    <div className="text-center text-gray-400 h-full flex flex-col items-center justify-center"><FiInbox size={48} /><p className="mt-2 font-semibold">Tidak ada soal ditemukan.</p></div>
                                ) : (
                                    <div className="space-y-3">
                                        {filteredQuestions.map(q => {
                                            const isSelected = selectedQuestionIds.has(q.id);
                                            return (
                                                <motion.div key={q.id} onClick={() => toggleQuestionSelection(q.id)} className={`p-4 border rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-sesm-teal/20 border-sesm-teal' : 'bg-white hover:bg-gray-50'}`} whileTap={{ scale: 0.98 }}>
                                                    <div className="flex items-start gap-4">
                                                        <div className={`mt-1 w-6 h-6 rounded-md flex items-center justify-center border-2 ${isSelected ? 'bg-sesm-teal border-sesm-teal' : 'bg-gray-200'}`}>
                                                            {isSelected && <FiCheckSquare className="text-white" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{q.pertanyaan}</p>
                                                            <div className="text-xs text-gray-500 mt-1"><span className="font-semibold">{q.nama_mapel}</span> &bull; {q.chapter_judul}</div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="flex-grow flex flex-col justify-center items-center p-8 bg-gray-50">
                            <div className='w-full max-w-md space-y-6'>
                                <h4 className='text-center text-lg font-bold text-gray-700'>Pilih Materi Bookmark Tujuan</h4>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Materi Bookmark</label>
                                    {/* 16. Ganti select Target Bookmark */}
                                    <CustomSelect
                                        options={targetBookmarkOptions}
                                        value={targetBookmarkId}
                                        onChange={setTargetBookmarkId}
                                        placeholder={targetBookmarkLoading ? 'Memuat...' : '-- Pilih Materi Bookmark --'}
                                        disabled={targetBookmarkLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-100 p-4 flex justify-between items-center rounded-b-2xl border-t">
                        <p className="font-semibold text-sesm-deep">{selectedQuestionIds.size} soal dipilih</p>
                        {step === 1 ? (
                            <button onClick={handleNextStep} disabled={selectedQuestionIds.size === 0} className="px-6 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400 flex items-center gap-2">
                               Lanjutkan <FiArrowRight />
                            </button>
                        ) : (
                            <div className='flex gap-3'>
                                 <button onClick={() => setStep(1)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 flex items-center gap-2">
                                    <FiArrowLeft /> Kembali
                                </button>
                                <button onClick={handleAddQuestionsToBookmark} disabled={isAdding || !targetBookmarkId} className="px-6 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400 flex items-center gap-2">
                                    {isAdding ? <FiLoader className="animate-spin" /> : 'Tambahkan Soal'}
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
};

export default BankSoalBookmarkModal;