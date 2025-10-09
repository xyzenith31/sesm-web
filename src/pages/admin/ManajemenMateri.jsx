// contoh-sesm-web/src/pages/admin/ManajemenMateri.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiChevronRight, FiPlus, FiTrash2, FiLoader, FiAlertCircle } from 'react-icons/fi';
import DataService from '../../services/dataService';

import AddChapterModal from '../../components/AddChapterModal';
import QuestionFormModal from '../../components/QuestionFormModal';

const jenjangOptions = {
    'TK': { jenjang: 'TK', kelas: null },
    'SD Kelas 1': { jenjang: 'SD', kelas: 1 },
    'SD Kelas 2': { jenjang: 'SD', kelas: 2 },
    'SD Kelas 3': { jenjang: 'SD', kelas: 3 },
    'SD Kelas 4': { jenjang: 'SD', kelas: 4 },
    'SD Kelas 5': { jenjang: 'SD', kelas: 5 },
    'SD Kelas 6': { jenjang: 'SD', kelas: 6 },
};

const ManajemenMateri = () => {
    const [materiList, setMateriList] = useState({});
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedMateri, setSelectedMateri] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    
    const [selectedFilterKey, setSelectedFilterKey] = useState('TK');

    const fetchMateriList = useCallback(() => {
        const { jenjang, kelas } = jenjangOptions[selectedFilterKey];
        setIsLoading(true);
        setError(null);
        setSelectedKey(null);
        setSelectedMateri(null);

        DataService.getMateriForAdmin(jenjang, kelas)
            .then(response => {
                setMateriList(response.data);
            })
            .catch(err => {
                const message = err.response?.data?.message || "Gagal memuat data materi.";
                setError(message);
                setMateriList({});
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [selectedFilterKey]);
    
    useEffect(() => {
        fetchMateriList();
    }, [fetchMateriList]);

    const fetchDetailMateri = useCallback(() => {
        if (!selectedKey) {
            setSelectedMateri(null);
            return;
        }
        setIsDetailLoading(true);
        
        // Cari info materi dari struktur data yang sudah ada
        let materiInfo = null;
        for (const mapelData of Object.values(materiList)) {
            const foundChapter = mapelData.chapters.find(m => m.materiKey === selectedKey);
            if (foundChapter) {
                materiInfo = foundChapter;
                break;
            }
        }
        
        DataService.getDetailMateriForAdmin(selectedKey)
            .then(response => {
                setSelectedMateri({
                    ...materiInfo,
                    questions: response.data.questions || []
                });
            })
            .catch(err => {
                alert("Gagal memuat detail soal.");
            })
            .finally(() => {
                setIsDetailLoading(false);
            });
    }, [selectedKey, materiList]);

    useEffect(() => {
        fetchDetailMateri();
    }, [fetchDetailMateri]);

    const handleAddChapterSubmit = async ({ subjectId, judul }) => {
        try {
            await DataService.addChapter({ subjectId, judul });
            fetchMateriList();
        } catch (error) {
            alert("Gagal menambah bab baru: " + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteChapter = async (materiKey) => {
        if (window.confirm("Yakin ingin menghapus bab ini beserta semua soal di dalamnya?")) {
            try {
                await DataService.deleteChapter(materiKey);
                fetchMateriList();
            } catch (error) {
                alert("Gagal menghapus bab.");
            }
        }
    };
    
    const handleBatchQuestionSubmit = async (newQuestions) => {
        if (!selectedKey) return;
        
        try {
            for (const question of newQuestions) {
                await DataService.addQuestion(selectedKey, question);
            }
            alert(`${newQuestions.length} soal berhasil dipublikasikan!`);
            fetchDetailMateri(); // Refresh detail
        } catch (error) {
            alert("Gagal mempublikasikan soal.");
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm("Yakin ingin menghapus soal ini?")) return;
        try {
            await DataService.deleteQuestion(questionId);
            fetchDetailMateri(); // Refresh detail
        } catch (error) {
            alert("Gagal menghapus soal.");
        }
    };

    // --- PERBAIKAN LOGIKA UNTUK MODAL DROPDOWN ---
    const currentMapelList = useMemo(() => {
        if (!materiList || Object.keys(materiList).length === 0) return [];
        // Ubah cara memetakan data sesuai struktur baru dari backend
        return Object.entries(materiList)
            .map(([nama_mapel, data]) => ({
                id: data.subject_id, // Ambil ID langsung dari properti data
                nama_mapel
            }))
            .filter(m => m.id); // Filter untuk memastikan ID valid
    }, [materiList]);

    return (
        <>
            <AnimatePresence>
                {isAddChapterModalOpen && <AddChapterModal isOpen={isAddChapterModalOpen} onClose={() => setIsAddChapterModalOpen(false)} onSubmit={handleAddChapterSubmit} mapelList={currentMapelList} jenjang={selectedFilterKey} />}
            </AnimatePresence>
            {isQuestionModalOpen && <QuestionFormModal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} onSubmit={handleBatchQuestionSubmit} chapterId={selectedKey} />}

            <div>
                <h1 className="text-3xl font-bold text-sesm-deep mb-6">Manajemen Materi & Soal</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-md flex flex-col h-[75vh]">
                        <div className="flex-shrink-0 border-b pb-3 mb-2">
                             <h2 className="text-lg font-bold mb-2">Pilih Jenjang & Kelas</h2>
                            <select value={selectedFilterKey} onChange={(e) => setSelectedFilterKey(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sesm-teal">
                                {Object.keys(jenjangOptions).map(key => (<option key={key} value={key}>{key}</option>))}
                            </select>
                        </div>
                        <div className="flex-shrink-0 mb-3">
                            <button onClick={() => setIsAddChapterModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sesm-teal text-white rounded-lg font-semibold text-sm hover:bg-sesm-deep transition-colors">
                                <FiPlus/> Tambah Bab
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                            {isLoading ? ( <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div> ) 
                            : error ? (
                                <div className="text-center text-red-500 p-4"><FiAlertCircle className="mx-auto text-3xl mb-2"/><p>{error}</p></div>
                            )
                            : (Object.keys(materiList).length > 0 ? Object.keys(materiList).sort().map(mapel => (
                                    <div key={mapel}>
                                        <h3 className="font-bold text-sesm-teal mt-4 first:mt-0">{mapel}</h3>
                                        <div className="space-y-1 mt-1">
                                            {/* --- PERBAIKAN LOGIKA RENDER DAFTAR BAB --- */}
                                            {materiList[mapel].chapters.map(materi => (
                                                <div key={materi.materiKey} className={`group w-full text-left p-2 rounded-md flex justify-between items-center text-sm transition-colors ${selectedKey === materi.materiKey ? 'bg-sesm-teal/10' : 'hover:bg-gray-100'}`}>
                                                    <button onClick={() => setSelectedKey(materi.materiKey)} className={`flex-grow flex justify-between items-center text-left pr-2 ${selectedKey === materi.materiKey ? 'font-bold text-sesm-deep' : 'text-gray-700'}`}>
                                                        <span>{materi.judul}</span>
                                                        <FiChevronRight/>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChapter(materi.materiKey); }} className="ml-2 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity" title="Hapus bab">
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : <p className="text-center text-gray-500 mt-8">Tidak ada materi untuk jenjang ini.</p>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md min-h-[75vh]">
                       {isDetailLoading ? ( <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div> ) 
                        : selectedMateri ? (
                            <div>
                                <div className="flex justify-between items-center border-b pb-3 mb-4">
                                    <h2 className="text-xl font-bold text-sesm-deep">{selectedMateri.judul}</h2>
                                    <button onClick={() => setIsQuestionModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-sesm-deep text-white rounded-lg font-semibold text-sm">
                                        <FiPlus/> Tambah Soal
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {selectedMateri.questions && selectedMateri.questions.length > 0 ? selectedMateri.questions.map((q, index) => (
                                        <div key={q.id} className="bg-gray-50 p-3 rounded-md">
                                            <p className="font-semibold">{index + 1}. {q.pertanyaan}</p>
                                            <p className="text-sm text-green-600 font-bold mt-1">Jawaban: {q.correctAnswer || q.jawaban_esai || "N/A"}</p>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 hover:bg-gray-200 rounded-md" title="Hapus Soal"><FiTrash2 className="text-red-500"/></button>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 mt-8">Belum ada soal untuk bab ini. Silakan tambahkan soal baru.</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col justify-center items-center h-full text-center text-gray-400">
                                <FiBook className="text-5xl mb-3"/>
                                <p className="font-semibold">Pilih bab dari daftar di samping</p>
                                <p className="text-sm">untuk melihat dan mengelola soal.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManajemenMateri;