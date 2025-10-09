import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiChevronRight, FiPlus, FiEdit, FiTrash2, FiLoader } from 'react-icons/fi';
import DataService from '../../services/dataService';

// Komponen Modal untuk Form Tambah/Edit Soal
const QuestionFormModal = ({ isOpen, onClose, onSubmit, questionData }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // Jika `questionData` ada, berarti ini mode edit. Jika tidak, mode tambah.
        setFormData(questionData || { type: 'multiple-choice', question: '', options: ['', '', '', ''], correctAnswer: '' });
    }, [questionData, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                className="bg-white rounded-2xl w-full max-w-lg shadow-xl"
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-sesm-deep">{questionData ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
                        <div className="mt-4 space-y-4">
                            <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border rounded-md">
                                <option value="multiple-choice">Pilihan Ganda</option>
                                <option value="essay">Esai</option>
                            </select>
                            <textarea name="question" value={formData.question} onChange={handleInputChange} placeholder="Tulis pertanyaan di sini..." className="w-full p-2 border rounded-md h-24" required />
                            {formData.type === 'multiple-choice' && (
                                <>
                                    <div className="grid grid-cols-2 gap-2">
                                        {formData.options.map((opt, i) => (
                                            <input key={i} type="text" value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} placeholder={`Pilihan ${i + 1}`} className="w-full p-2 border rounded-md" required/>
                                        ))}
                                    </div>
                                    <input type="text" name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} placeholder="Jawaban Benar (harus sama persis dengan salah satu pilihan)" className="w-full p-2 border rounded-md" required/>
                                </>
                            )}
                             {formData.type === 'essay' && (
                                <input type="text" name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} placeholder="Jawaban Benar (opsional)" className="w-full p-2 border rounded-md"/>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end space-x-2 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-sesm-deep text-white rounded-lg font-semibold">Simpan</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};


// Halaman Utama Manajemen Materi
const ManajemenMateri = () => {
    const [materiList, setMateriList] = useState({});
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedMateri, setSelectedMateri] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // 1. Ambil daftar semua bab saat komponen dimuat
    useEffect(() => {
        const fetchAllMateri = async () => {
            try {
                const response = await DataService.getAllMateriForAdmin();
                const groupedByMapel = response.data.reduce((acc, materi) => {
                    (acc[materi.mapel] = acc[materi.mapel] || []).push(materi);
                    return acc;
                }, {});
                setMateriList(groupedByMapel);
            } catch (error) {
                console.error("Gagal mengambil daftar materi:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllMateri();
    }, []);

    // 2. Ambil detail soal saat sebuah bab dipilih
    const handleSelectMateri = useCallback(async (materiKey) => {
        setSelectedKey(materiKey);
        setIsLoading(true);
        try {
            const response = await DataService.getMateriDetail(materiKey);
            setSelectedMateri(response.data);
        } catch (error) {
            console.error("Gagal mengambil detail materi:", error);
            setSelectedMateri(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 3. Handler untuk hapus, tambah, dan edit
    const handleDeleteQuestion = async (questionId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus soal ini?")) {
            await DataService.deleteQuestion(selectedKey, questionId);
            handleSelectMateri(selectedKey); // Muat ulang data
        }
    };
    
    const handleFormSubmit = async (formData) => {
        const payload = { ...formData, options: formData.type === 'multiple-choice' ? formData.options : [] };
        if (editingQuestion) {
            await DataService.updateQuestion(selectedKey, editingQuestion.id, payload);
        } else {
            await DataService.addQuestion(selectedKey, payload);
        }
        setIsModalOpen(false);
        setEditingQuestion(null);
        handleSelectMateri(selectedKey); // Muat ulang data
    };

    const openAddModal = () => {
        setEditingQuestion(null);
        setIsModalOpen(true);
    };

    const openEditModal = (question) => {
        setEditingQuestion(question);
        setIsModalOpen(true);
    };

    return (
        <>
            <QuestionFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                questionData={editingQuestion}
            />
            <div>
                <h1 className="text-3xl font-bold text-sesm-deep mb-6">Manajemen Materi & Soal</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Kolom Kiri: Daftar Bab */}
                    <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-md">
                        <h2 className="text-lg font-bold border-b pb-2 mb-2">Pilih Bab</h2>
                        {Object.keys(materiList).map(mapel => (
                            <div key={mapel}>
                                <h3 className="font-bold text-sesm-teal mt-3">{mapel}</h3>
                                <div className="space-y-1 mt-1">
                                    {materiList[mapel].map(materi => (
                                        <button key={materi.materiKey} onClick={() => handleSelectMateri(materi.materiKey)} className={`w-full text-left p-2 rounded-md flex justify-between items-center ${selectedKey === materi.materiKey ? 'bg-sesm-teal/10 font-bold' : 'hover:bg-gray-100'}`}>
                                            <span>{materi.judul}</span>
                                            <FiChevronRight/>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Kolom Kanan: Detail Soal */}
                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md min-h-[60vh]">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                        ) : selectedMateri ? (
                            <div>
                                <div className="flex justify-between items-center border-b pb-3 mb-4">
                                    <h2 className="text-xl font-bold text-sesm-deep">{selectedMateri.judul}</h2>
                                    <button onClick={openAddModal} className="flex items-center gap-2 px-3 py-2 bg-sesm-deep text-white rounded-lg font-semibold text-sm"><FiPlus/> Tambah Soal</button>
                                </div>
                                <div className="space-y-3">
                                    {selectedMateri.questions.map((q, index) => (
                                        <div key={q.id} className="bg-gray-50 p-3 rounded-md">
                                            <p className="font-semibold">{index + 1}. {q.question}</p>
                                            <p className="text-sm text-green-600 font-bold mt-1">Jawaban: {q.correctAnswer}</p>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => openEditModal(q)} className="p-2 hover:bg-gray-200 rounded-md"><FiEdit className="text-blue-500"/></button>
                                                <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 hover:bg-gray-200 rounded-md"><FiTrash2 className="text-red-500"/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedMateri.questions.length === 0 && <p className="text-center text-gray-500 mt-8">Belum ada soal untuk bab ini.</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-full text-center text-gray-500">
                                <FiBook className="text-4xl mb-2"/>
                                <p>Pilih bab dari daftar di samping untuk melihat dan mengelola soal.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManajemenMateri;