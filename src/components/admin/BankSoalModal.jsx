// contoh-sesm-web/components/admin/BankSoalModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiSearch, FiLoader, FiInbox, FiCheckSquare } from 'react-icons/fi';
import DataService from '../../services/dataService';

// Opsi filter Jenjang & Kelas
const jenjangOptions = {
    'TK': { jenjang: 'TK', kelas: null },
    'SD Kelas 1': { jenjang: 'SD', kelas: 1 },
    'SD Kelas 2': { jenjang: 'SD', kelas: 2 },
    'SD Kelas 3': { jenjang: 'SD', kelas: 3 },
    'SD Kelas 4': { jenjang: 'SD', kelas: 4 },
    'SD Kelas 5': { jenjang: 'SD', kelas: 5 },
    'SD Kelas 6': { jenjang: 'SD', kelas: 6 },
};

const BankSoalModal = ({ isOpen, onClose, quizId, onQuestionsAdded }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('Semua');
    const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
    
    // --- STATE BARU UNTUK FILTER JENJANG ---
    const [selectedFilterKey, setSelectedFilterKey] = useState('TK');

    // --- EFFECT DIPERBAIKI UNTUK MENGGUNAKAN FILTER JENJANG ---
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setError(null);
            
            // Ambil jenjang dan kelas dari state filter, bukan dari user
            const { jenjang, kelas } = jenjangOptions[selectedFilterKey];

            DataService.getAllQuestionsForBank(jenjang, kelas)
                .then(response => {
                    setQuestions(response.data);
                })
                .catch(err => {
                    setError("Gagal memuat bank soal. Pastikan ada soal di jenjang ini.");
                    console.error(err);
                })
                .finally(() => setLoading(false));
        } else {
            // Reset state saat modal ditutup
            setQuestions([]);
            setSelectedQuestionIds(new Set());
            setSearchTerm('');
            setSelectedSubject('Semua');
        }
    }, [isOpen, selectedFilterKey]); // <-- Dependensi diubah ke selectedFilterKey

    const subjects = useMemo(() => {
        const allSubjects = questions.map(q => q.nama_mapel);
        return ['Semua', ...Array.from(new Set(allSubjects))];
    }, [questions]);

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => {
            const matchesSearch = q.pertanyaan.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubject = selectedSubject === 'Semua' || q.nama_mapel === selectedSubject;
            return matchesSearch && matchesSubject;
        });
    }, [questions, searchTerm, selectedSubject]);

    const toggleQuestionSelection = (questionId) => {
        setSelectedQuestionIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const handleAddQuestions = async () => {
        if (selectedQuestionIds.size === 0) return;
        setIsAdding(true);
        try {
            await DataService.addQuestionsFromBank(quizId, Array.from(selectedQuestionIds));
            onQuestionsAdded();
        } catch (error) {
            alert("Gagal menambahkan soal dari bank.");
            console.error(error);
        } finally {
            setIsAdding(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-4xl shadow-xl flex flex-col h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b flex justify-between items-center flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-sesm-deep">Bank Soal</h3>
                        <p className="text-sm text-gray-500">Pilih soal dari materi yang sudah ada untuk ditambahkan ke kuis.</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={22}/></button>
                </div>

                {/* --- KONTROL FILTER DIPERBAIKI --- */}
                <div className="p-4 border-b flex-shrink-0 bg-gray-50 flex flex-col md:flex-row gap-4">
                    <select
                        value={selectedFilterKey}
                        onChange={(e) => setSelectedFilterKey(e.target.value)}
                        className="w-full md:w-56 p-2 border rounded-lg bg-white"
                    >
                        {Object.keys(jenjangOptions).map(key => (<option key={key} value={key}>{key}</option>))}
                    </select>
                    <div className="relative flex-grow">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari pertanyaan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-lg"
                        />
                    </div>
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full md:w-56 p-2 border rounded-lg bg-white"
                        disabled={loading || questions.length === 0}
                    >
                        {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
                    </select>
                </div>

                <div className="flex-grow overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                    ) : error ? (
                        <div className="text-center text-red-500 h-full flex items-center justify-center p-4">{error}</div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="text-center text-gray-400 h-full flex flex-col items-center justify-center">
                            <FiInbox size={48} />
                            <p className="mt-2 font-semibold">Tidak ada soal yang ditemukan.</p>
                            <p className="text-sm">Coba ubah filter atau kata kunci pencarian Anda.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredQuestions.map(q => {
                                const isSelected = selectedQuestionIds.has(q.id);
                                return (
                                    <motion.div
                                        key={q.id}
                                        onClick={() => toggleQuestionSelection(q.id)}
                                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'bg-sesm-teal/20 border-sesm-teal shadow-md' : 'bg-white hover:bg-gray-50'}`}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center border-2 ${isSelected ? 'bg-sesm-teal border-sesm-teal' : 'bg-gray-200 border-gray-300'}`}>
                                                {isSelected && <FiCheckSquare className="text-white" />}
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-semibold text-gray-800">{q.pertanyaan}</p>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    <span className="font-semibold">{q.nama_mapel}</span> &bull; {q.chapter_judul}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-gray-100 p-4 flex justify-between items-center rounded-b-2xl border-t flex-shrink-0">
                    <p className="font-semibold text-sesm-deep">{selectedQuestionIds.size} soal dipilih</p>
                    <button
                        onClick={handleAddQuestions}
                        disabled={isAdding || selectedQuestionIds.size === 0}
                        className="px-6 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isAdding ? <FiLoader className="animate-spin" /> : 'Tambahkan Soal'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default BankSoalModal;