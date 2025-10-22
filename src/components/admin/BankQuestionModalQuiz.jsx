import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSearch, FiLoader, FiInbox, FiCheckSquare, FiArrowRight, FiArrowLeft, FiPlus } from 'react-icons/fi';
import DataService from '../../services/dataService';
import CreateQuizModal from './CreateQuizModal';
import Notification from '../ui/Notification';
import CustomSelect from '../ui/CustomSelect';

const jenjangOptions = {
    'TK': { jenjang: 'TK', kelas: null },
    'SD Kelas 1': { jenjang: 'SD', kelas: 1 },
    'SD Kelas 2': { jenjang: 'SD', kelas: 2 },
    'SD Kelas 3': { jenjang: 'SD', kelas: 3 },
    'SD Kelas 4': { jenjang: 'SD', kelas: 4 },
    'SD Kelas 5': { jenjang: 'SD', kelas: 5 },
    'SD Kelas 6': { jenjang: 'SD', kelas: 6 },
};

const jenjangSelectOptions = Object.keys(jenjangOptions).map(key => ({
    value: key,
    label: key,
}));


const BankQuestionModalQuiz = ({ isOpen, onClose, onQuestionsAdded }) => {
    const [step, setStep] = useState(1);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('Semua');
    const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
    const [selectedFilterKey, setSelectedFilterKey] = useState('TK');

    const [allQuizzes, setAllQuizzes] = useState([]);
    const [targetQuizLoading, setTargetQuizLoading] = useState(false);
    const [targetQuizId, setTargetQuizId] = useState('');

    const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);

     const [notif, setNotif] = useState({
        isOpen: false,
        message: '',
        success: true,
        title: '',
    });

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            const { jenjang, kelas } = jenjangOptions[selectedFilterKey];
            DataService.getAllQuestionsForBank(jenjang, kelas)
                .then(response => setQuestions(response.data))
                .catch(err => {
                    setNotif({ isOpen: true, title: "Error", message: "Gagal memuat bank soal.", success: false });
                    console.error(err);
                })
                .finally(() => setLoading(false));
        } else {
            setStep(1);
            setQuestions([]);
            setSelectedQuestionIds(new Set());
            setSearchTerm('');
            setSelectedSubject('Semua');
            setTargetQuizId('');

        }
    }, [isOpen, selectedFilterKey]);

    const fetchTargetQuizzes = useCallback(() => {
        setTargetQuizLoading(true);
        DataService.getAllQuizzes()
            .then(response => {
                setAllQuizzes(response.data);
            })
            .catch(err => {
                 setNotif({ isOpen: true, title: "Error", message: "Gagal memuat daftar kuis tujuan.", success: false });
                console.error("Gagal memuat daftar kuis tujuan:", err);
                setAllQuizzes([]);
            })
            .finally(() => {
                setTargetQuizLoading(false);
            });
    }, []);

    useEffect(() => {
        if (isOpen && step === 2) {
            fetchTargetQuizzes();
        }
    }, [isOpen, step, fetchTargetQuizzes]);

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
            setNotif({ isOpen: true, title: "Info", message: "Pilih setidaknya satu soal.", success: true });
            return;
        }
        setStep(2);
    };

    const handleAddQuestionsToQuiz = async () => {
        if (!targetQuizId) {
            setNotif({ isOpen: true, title: "Info", message: "Pilih kuis tujuan terlebih dahulu.", success: true });
            return;
        }
        setIsAdding(true);
        try {
            await DataService.addQuestionsFromBank(targetQuizId, Array.from(selectedQuestionIds));
            onQuestionsAdded(targetQuizId);
        } catch (error) {
            setNotif({
                isOpen: true,
                title: "Gagal",
                message: error.response?.data?.message || "Gagal menambahkan soal dari bank ke kuis.",
                success: false
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleCreateQuizSubmit = async (formData) => {
        try {
            await DataService.createQuiz(formData);
             setNotif({ isOpen: true, title: "Sukses", message: `Kuis baru berhasil dibuat!`, success: true });
            setIsCreateQuizOpen(false);

            fetchTargetQuizzes();
            setTargetQuizId('');

        } catch (e) {
            setNotif({ isOpen: true, title: "Gagal", message: "Gagal membuat kuis baru: " + e.message, success: false });
        }
    };

    const targetQuizOptions = useMemo(() =>
        allQuizzes.map(q => ({
            value: q.id,
            label: q.title
        })),
    [allQuizzes]);

    const handleCloseNotif = () => setNotif({ ...notif, isOpen: false });


    if (!isOpen) return null;

    return (
        <>
            <Notification
                isOpen={notif.isOpen}
                onClose={handleCloseNotif}
                title={notif.title}
                message={notif.message}
                success={notif.success}
            />
            <AnimatePresence>
                {isCreateQuizOpen && (
                    <CreateQuizModal
                        isOpen={isCreateQuizOpen}
                        onClose={() => setIsCreateQuizOpen(false)}
                        onSubmit={handleCreateQuizSubmit}
                    />
                )}
            </AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col h-[90vh]">
                    <div className="p-5 border-b flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-bold text-sesm-deep">Bank Soal untuk Kuis</h3>
                            <p className="text-sm text-gray-500">
                               {step === 1 ? 'Langkah 1: Pilih soal yang ingin ditambahkan.' : 'Langkah 2: Tentukan kuis tujuan.'}
                            </p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={22}/></button>
                    </div>

                    {step === 1 && (
                        <>
                           <div className="p-4 border-b bg-gray-50 flex flex-col md:flex-row gap-4">
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
                                : filteredQuestions.length === 0 ? ( 
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
                                <h4 className='text-center text-lg font-bold text-gray-700'>Pilih Kuis Tujuan</h4>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <label className="block text-sm font-semibold text-gray-700">Pilih Kuis</label>
                                      <button
                                        type="button"
                                        onClick={() => setIsCreateQuizOpen(true)}
                                        className="text-xs font-bold text-sesm-teal hover:underline flex items-center gap-1"
                                      >
                                        <FiPlus size={14}/> Buat Kuis Baru
                                      </button>
                                    </div>
                                    <CustomSelect
                                        options={targetQuizOptions}
                                        value={targetQuizId}
                                        onChange={setTargetQuizId}
                                        placeholder={targetQuizLoading ? 'Memuat...' : '-- Pilih Kuis --'}
                                        disabled={targetQuizLoading}
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
                                <button onClick={handleAddQuestionsToQuiz} disabled={isAdding || !targetQuizId} className="px-6 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400 flex items-center gap-2">
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

export default BankQuestionModalQuiz;