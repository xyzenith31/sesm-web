// contoh-sesm-web/components/admin/BankSoalMateriModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiLoader, FiInbox, FiCheckSquare, FiArrowRight, FiArrowLeft, FiPlus } from 'react-icons/fi';
import DataService from '../../services/dataService';
import AddChapterModal from '../mod/AddChapterModal'; // Impor modal untuk menambah chapter
import CustomSelect from '../ui/CustomSelect'; // Impor CustomSelect
import Notification from '../ui/Notification'; // Impor Notification

const jenjangOptions = {
    'TK': { jenjang: 'TK', kelas: null },
    'SD Kelas 1': { jenjang: 'SD', kelas: 1 },
    'SD Kelas 2': { jenjang: 'SD', kelas: 2 },
    'SD Kelas 3': { jenjang: 'SD', kelas: 3 },
    'SD Kelas 4': { jenjang: 'SD', kelas: 4 },
    'SD Kelas 5': { jenjang: 'SD', kelas: 5 },
    'SD Kelas 6': { jenjang: 'SD', kelas: 6 },
};

// Siapkan options untuk CustomSelect jenjang
const jenjangSelectOptions = Object.keys(jenjangOptions).map(key => ({
    value: key,
    label: key,
}));

const BankSoalMateriModal = ({ isOpen, onClose, onQuestionsAdded }) => {
    const [step, setStep] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    // State error tidak digunakan langsung, diganti notif
    // const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('Semua');
    const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
    const [selectedFilterKey, setSelectedFilterKey] = useState('TK'); // Default TK

    // State untuk Step 2
    const [targetFilterKey, setTargetFilterKey] = useState('TK'); // Default TK
    const [targetMateriList, setTargetMateriList] = useState({});
    const [targetMateriLoading, setTargetMateriLoading] = useState(false);
    const [targetSubjectId, setTargetSubjectId] = useState('');
    const [targetMateriKey, setTargetMateriKey] = useState('');

    // State untuk membuka modal tambah materi
    const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);

    // State Notifikasi
    const [notif, setNotif] = useState({ isOpen: false, title: '', message: '', success: true });

    // Fungsi untuk menutup notifikasi
    const handleCloseNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));

    // Effect untuk Step 1 (Mengambil daftar soal dari bank)
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            // setError(null); // Hapus setError
            const { jenjang, kelas } = jenjangOptions[selectedFilterKey];

            DataService.getAllQuestionsForBank(jenjang, kelas)
                .then(response => setQuestions(response.data))
                .catch(err => {
                    // Tampilkan notifikasi error
                     setNotif({
                        isOpen: true,
                        title: "Gagal Memuat Bank Soal",
                        message: "Tidak dapat mengambil data bank soal dari server.",
                        success: false
                    });
                     setQuestions([]); // Kosongkan soal jika error
                })
                .finally(() => setLoading(false));

            // Set filter jenjang target sama dengan filter sumber soal saat pertama kali buka
            setTargetFilterKey(selectedFilterKey);

        } else { // Reset state saat modal ditutup
            setStep(1);
            setQuestions([]);
            setSelectedQuestionIds(new Set());
            setSearchTerm('');
            setSelectedSubject('Semua');
            setTargetSubjectId('');
            setTargetMateriKey('');
        }
    }, [isOpen, selectedFilterKey]);

    // Fungsi untuk mengambil daftar materi tujuan
    const fetchTargetMateri = useCallback(() => {
        setTargetMateriLoading(true);
        const { jenjang, kelas } = jenjangOptions[targetFilterKey];
        DataService.getMateriForAdmin(jenjang, kelas)
            .then(response => {
                setTargetMateriList(response.data);
            })
            .catch(err => {
                 // Tampilkan notifikasi error
                setNotif({
                    isOpen: true,
                    title: "Gagal Memuat Materi Tujuan",
                    message: "Tidak dapat mengambil daftar materi tujuan.",
                    success: false
                });
                console.error("Gagal memuat daftar materi tujuan:", err);
                setTargetMateriList({});
            })
            .finally(() => {
                setTargetMateriLoading(false);
            });
    }, [targetFilterKey]);


    // Effect untuk Step 2 (Mengambil daftar materi tujuan)
    useEffect(() => {
        if (isOpen && step === 2) {
            fetchTargetMateri();
        }
    }, [isOpen, step, fetchTargetMateri]);

    // Siapkan options untuk CustomSelect Subject
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
            // Tampilkan notifikasi info
             setNotif({
                isOpen: true,
                title: "Info",
                message: "Pilih setidaknya satu soal untuk melanjutkan.",
                success: true // Warna hijau untuk info
            });
            return;
        }
        setStep(2);
    };

    const handleAddQuestions = async () => {
        if (!targetMateriKey) {
             // Tampilkan notifikasi info
            setNotif({
                isOpen: true,
                title: "Info",
                message: "Pilih materi tujuan terlebih dahulu.",
                success: true
            });
            return;
        }
        setIsAdding(true);
        try {
            await DataService.addQuestionsFromBankToChapter(targetMateriKey, Array.from(selectedQuestionIds));
            onQuestionsAdded(targetMateriKey);
             // Notifikasi sukses akan ditangani oleh parent (ManajemenMateri)
        } catch (error) {
             // Tampilkan notifikasi error
             setNotif({
                isOpen: true,
                title: "Gagal Menambahkan",
                message: error.response?.data?.message || "Gagal menambahkan soal dari bank.",
                success: false
            });
        } finally {
            setIsAdding(false);
        }
    };

    const targetMapelOptions = useMemo(() => Object.entries(targetMateriList).map(([nama, data]) => ({ value: data.subject_id, label: nama })), [targetMateriList]);

    // Siapkan options untuk CustomSelect Materi Tujuan
     const targetMateriOptions = useMemo(() => {
        if (!targetSubjectId) return [];
        const selectedMapelData = Object.values(targetMateriList).find(m => m.subject_id === parseInt(targetSubjectId));
        return selectedMapelData ? selectedMapelData.chapters.map(c => ({ value: c.materiKey, label: c.judul })) : [];
    }, [targetMateriList, targetSubjectId]);


    // Handler untuk submit pembuatan materi baru
    const handleAddChapterSubmit = async (data) => {
        try {
            const response = await DataService.addChapter(data);
            const newChapter = response.data;
            // Tampilkan notifikasi sukses
             setNotif({
                isOpen: true,
                title: "Berhasil",
                message: `Materi baru "${newChapter.judul}" berhasil dibuat!`,
                success: true
            });

            setIsAddChapterModalOpen(false);
            fetchTargetMateri(); // Refresh daftar materi

            // Langsung pilih materi yang baru dibuat
            setTargetSubjectId(String(data.subjectId));
            setTargetMateriKey(newChapter.materiKey);

        } catch (e) {
            // Tampilkan notifikasi error
             setNotif({
                isOpen: true,
                title: "Gagal Membuat Materi",
                message: e.response?.data?.message || "Terjadi kesalahan saat membuat materi baru.",
                success: false
            });
        }
    };


    if (!isOpen) return null;

    return (
        <>
             {/* Render Notification */}
            <Notification
                isOpen={notif.isOpen}
                onClose={handleCloseNotif}
                title={notif.title}
                message={notif.message}
                success={notif.success}
            />
            <AnimatePresence>
                {isAddChapterModalOpen && (
                    <AddChapterModal
                        isOpen={isAddChapterModalOpen}
                        onClose={() => setIsAddChapterModalOpen(false)}
                        onSubmit={handleAddChapterSubmit}
                         // Kirim dalam format { value: id, label: nama }
                        mapelList={targetMapelOptions.map(m => ({ subject_id: m.value, nama_mapel: m.label }))}
                        jenjang={targetFilterKey}
                    />
                )}
            </AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col h-[90vh]">
                    <div className="p-5 border-b flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-sesm-deep">Bank Soal untuk Materi</h3>
                            <p className="text-sm text-gray-500">
                               {step === 1 ? 'Langkah 1: Pilih soal yang ingin ditambahkan.' : 'Langkah 2: Tentukan materi tujuan.'}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={22}/></button>
                    </div>

                    {step === 1 && (
                        <>
                            <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-56">
                                    {/* Ganti select Jenjang Sumber */}
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
                                <div className="w-full md:w-56">
                                    {/* Ganti select Mapel Sumber */}
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
                                : filteredQuestions.length === 0 ? ( // Cek error tidak perlu lagi
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
                                <h4 className='text-center text-lg font-bold text-gray-700'>Pilih Materi Tujuan</h4>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Jenjang & Kelas Tujuan</label>
                                    {/* Ganti select Jenjang Tujuan */}
                                     <CustomSelect
                                        options={jenjangSelectOptions}
                                        value={targetFilterKey}
                                        onChange={(value) => { setTargetFilterKey(value); setTargetSubjectId(''); setTargetMateriKey(''); }}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Mata Pelajaran</label>
                                     {/* Ganti select Mapel Tujuan */}
                                     <CustomSelect
                                        options={targetMapelOptions}
                                        value={targetSubjectId}
                                        onChange={(value) => { setTargetSubjectId(value); setTargetMateriKey(''); }}
                                        placeholder={targetMateriLoading ? 'Memuat...' : '-- Pilih Mata Pelajaran --'}
                                        disabled={targetMateriLoading}
                                    />
                                </div>
                                 <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <label className="block text-sm font-semibold text-gray-700">Materi / Bab</label>
                                      <button
                                        type="button"
                                        onClick={() => setIsAddChapterModalOpen(true)}
                                        disabled={!targetSubjectId}
                                        className="text-xs font-bold text-sesm-teal hover:underline disabled:text-gray-400 disabled:no-underline flex items-center gap-1"
                                      >
                                        <FiPlus size={14}/> Buat Materi Baru
                                      </button>
                                    </div>
                                     {/* Ganti select Bab Tujuan */}
                                     <CustomSelect
                                        options={targetMateriOptions}
                                        value={targetMateriKey}
                                        onChange={setTargetMateriKey}
                                        placeholder="-- Pilih Materi --"
                                        disabled={!targetSubjectId || targetMateriLoading}
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
                                <button onClick={handleAddQuestions} disabled={isAdding || !targetMateriKey} className="px-6 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400 flex items-center gap-2">
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

export default BankSoalMateriModal;