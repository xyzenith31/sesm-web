// src/pages/admin/ManajemenMateri.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiChevronRight, FiPlus, FiEdit, FiTrash2, FiLoader, FiSave } from 'react-icons/fi';

import AddChapterModal from '../../components/AddChapterModal';
import QuestionFormModal from '../../components/QuestionFormModal';
import DraftsModal from '../../components/DraftsModal';

const initialDataByGrade = {
  'TK': { 'Membaca': [ { judul: 'Mengenal Huruf A-Z', materiKey: 'tk-membaca-1', questions: [] }, { judul: 'Mengeja Suku Kata', materiKey: 'tk-membaca-2', questions: [] } ], 'Menulis': [ { judul: 'Menebalkan Garis dan Bentuk', materiKey: 'tk-menulis-1', questions: [] }, { judul: 'Menulis Huruf Lepas', materiKey: 'tk-menulis-2', questions: [] } ], 'Berhitung': [ { judul: 'Mengenal Angka 1-10', materiKey: 'tk-berhitung-1', questions: [] }, { judul: 'Konsep Penjumlahan Sederhana', materiKey: 'tk-berhitung-2', questions: [] } ], },
  'SD Kelas 1': { 'Pendidikan Agama Islam': [ { judul: 'Rukun Iman dan Rukun Islam', materiKey: 'sd1-pai-1', questions: [] }, { judul: 'Kisah Nabi (Adam & Idris)', materiKey: 'sd1-pai-2', questions: [] } ], 'Bahasa Indonesia': [ { judul: 'Perkenalan Diri', materiKey: 'sd1-bi-1', questions: [] }, { judul: 'Benda di Sekitarku', materiKey: 'sd1-bi-2', questions: [] } ], 'Matematika': [ { judul: 'Bilangan Sampai 20', materiKey: 'sd1-mtk-1', questions: [] }, { judul: 'Penjumlahan & Pengurangan Dasar', materiKey: 'sd1-mtk-2', questions: [] } ], 'Bahasa Inggris': [ { judul: 'Greetings (Hello, Goodbye)', materiKey: 'sd1-bing-1', questions: [] }, { judul: 'Colors (Red, Blue, Yellow)', materiKey: 'sd1-bing-2', questions: [] } ], 'PKN': [ { judul: 'Simbol Sila Pancasila', materiKey: 'sd1-pkn-1', questions: [] }, { judul: 'Aturan di Rumah', materiKey: 'sd1-pkn-2', questions: [] } ], },
  'SD Kelas 2': { 'Pendidikan Agama Islam': [ { judul: 'Tata Cara Wudhu', materiKey: 'sd2-pai-1', questions: [] }, { judul: 'Asmaul Husna (Dasar)', materiKey: 'sd2-pai-2', questions: [] } ], 'PKN': [ { judul: 'Aturan di Sekolah', materiKey: 'sd2-pkn-1', questions: [] }, { judul: 'Sikap Tolong Menolong', materiKey: 'sd2-pkn-2', questions: [] } ], 'Bahasa Indonesia': [ { judul: 'Membuat Kalimat Tanya', materiKey: 'sd2-bi-1', questions: [] }, { judul: 'Membaca Dongeng', materiKey: 'sd2-bi-2', questions: [] } ], 'Matematika': [ { judul: 'Perkalian dan Pembagian (1-5)', materiKey: 'sd2-mtk-1', questions: [] }, { judul: 'Satuan Waktu (Jam dan Menit)', materiKey: 'sd2-mtk-2', questions: [] } ], 'Bahasa Inggris': [ { judul: 'My Family', materiKey: 'sd2-bing-1', questions: [] }, { judul: 'Animals', materiKey: 'sd2-bing-2', questions: [] } ], },
  'SD Kelas 3 & 4': { 'Pendidikan Agama Islam': [ { judul: 'Puasa Ramadhan', materiKey: 'sd34-pai-1', questions: [] } ], 'PKN': [ { judul: 'Hak dan Kewajiban', materiKey: 'sd34-pkn-1', questions: [] } ], 'Bahasa Indonesia': [ { judul: 'Ide Pokok Paragraf', materiKey: 'sd34-bi-1', questions: [] }, { judul: 'Menulis Surat Pribadi', materiKey: 'sd34-bi-2', questions: [] } ], 'Matematika': [ { judul: 'Operasi Hitung Campuran', materiKey: 'sd34-mtk-1', questions: [] }, { judul: 'Pecahan Sederhana', materiKey: 'sd34-mtk-2', questions: [] } ], 'Bahasa Inggris': [ { judul: 'Daily Activities', materiKey: 'sd34-bing-1', questions: []} ], 'IPA': [ { judul: 'Rangka Manusia', materiKey: 'sd34-ipa-1', questions: [] }, { judul: 'Wujud dan Sifat Benda', materiKey: 'sd34-ipa-2', questions: [] } ], 'IPS': [ { judul: 'Keragaman Budaya Indonesia', materiKey: 'sd34-ips-1', questions: [] }, { judul: 'Jenis-jenis Pekerjaan', materiKey: 'sd34-ips-2', questions: [] } ], },
  'SD Kelas 5': { 'Pendidikan Agama Islam': [ { judul: 'Zakat Fitrah', materiKey: 'sd5-pai-1', questions: [] } ], 'PKN': [ { judul: 'Organisasi di Lingkungan Sekolah', materiKey: 'sd5-pkn-1', questions: [] } ], 'Bahasa Indonesia': [ { judul: 'Iklan Media Cetak', materiKey: 'sd5-bi-1', questions: [] } ], 'Matematika': [ { judul: 'Volume Kubus dan Balok', materiKey: 'sd5-mtk-1', questions: [] }, { judul: 'Jaring-jaring Bangun Ruang', materiKey: 'sd5-mtk-2', questions: [] } ], 'Bahasa Inggris': [ { judul: 'Public Places', materiKey: 'sd5-bing-1', questions: [] } ], 'IPA': [ { judul: 'Sistem Pernapasan Manusia', materiKey: 'sd5-ipa-1', questions: [] }, { judul: 'Ekosistem dan Rantai Makanan', materiKey: 'sd5-ipa-2', questions: [] } ], 'IPS': [ { judul: 'Perjuangan Melawan Penjajah', materiKey: 'sd5-ips-1', questions: [] } ] },
  'SD Kelas 6': { 'Pendidikan Agama Islam': [ { judul: 'Haji dan Umrah', materiKey: 'sd6-pai-1', questions: [] } ], 'PKN': [ { judul: 'Peran Indonesia di ASEAN', materiKey: 'sd6-pkn-1', questions: [] } ], 'Bahasa Indonesia': [ { judul: 'Menyimpulkan Isi Berita', materiKey: 'sd6-bi-1', questions: []} ], 'Matematika': [ { judul: 'Statistika (Mean, Median, Modus)', materiKey: 'sd6-mtk-1', questions: [] }, { judul: 'Luas dan Keliling Lingkaran', materiKey: 'sd6-mtk-2', questions: [] } ], 'Bahasa Inggris': [ { judul: 'Procedure Text', materiKey: 'sd6-bing-1', questions: [] } ], 'IPA': [ { judul: 'Sistem Tata Surya', materiKey: 'sd6-ipa-1', questions: [] }, { judul: 'Adaptasi Makhluk Hidup', materiKey: 'sd6-ipa-2', questions: [] } ], 'IPS': [ { judul: 'Modernisasi dan Globalisasi', materiKey: 'sd6-ips-1', questions: [] } ] }
};

const ManajemenMateri = () => {
    const [allData, setAllData] = useState(initialDataByGrade);
    const [materiList, setMateriList] = useState({});
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedMateri, setSelectedMateri] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isDraftsModalOpen, setIsDraftsModalOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('TK'); 

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const dataForSelectedGrade = allData[selectedFilter] || {};
            setMateriList(dataForSelectedGrade);
            if (selectedKey) {
                const updatedMateri = Object.values(dataForSelectedGrade).flat().find(m => m.materiKey === selectedKey);
                setSelectedMateri(updatedMateri || null);
            }
            setIsLoading(false);
        }, 300);
    }, [selectedFilter, allData, selectedKey]);

    const handleSelectMateri = useCallback(async (materiKey) => {
        setSelectedKey(materiKey);
    }, []);

    const handleDeleteChapter = (mapel, materiKey) => {
        if (window.confirm(`Yakin ingin hapus bab ini?`)) {
            setAllData(currentAllData => {
                const newAllData = { ...currentAllData };
                const gradeData = { ...newAllData[selectedFilter] };
                gradeData[mapel] = gradeData[mapel].filter(m => m.materiKey !== materiKey);
                if (gradeData[mapel].length === 0) { delete gradeData[mapel]; }
                newAllData[selectedFilter] = gradeData;
                return newAllData;
            });
        }
    };

    const handleAddChapterSubmit = ({ mapel, judul }) => {
        const newMateriKey = `${selectedFilter.toLowerCase().replace(/\s/g, '-')}-${mapel.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
        const newChapter = { judul, materiKey: newMateriKey, questions: [] };
        setAllData(currentAllData => {
            const newAllData = { ...currentAllData };
            const gradeData = { ...(newAllData[selectedFilter] || {}) };
            gradeData[mapel] = [...(gradeData[mapel] || []), newChapter];
            newAllData[selectedFilter] = gradeData;
            return newAllData;
        });
    };

    const handleBatchQuestionSubmit = (newQuestions) => {
        if (!selectedKey) return;
        setAllData(currentData => {
            const newData = JSON.parse(JSON.stringify(currentData));
            const gradeData = newData[selectedFilter];
            for (const mapel in gradeData) {
                const chapterIndex = gradeData[mapel].findIndex(ch => ch.materiKey === selectedKey);
                if (chapterIndex !== -1) {
                    const questionsWithId = newQuestions.map(q => ({ ...q, id: q.id || Date.now() + Math.random() }));
                    gradeData[mapel][chapterIndex].questions.push(...questionsWithId);
                    break;
                }
            }
            return newData;
        });
        alert(`${newQuestions.length} soal berhasil dipublikasikan!`);
    };

    const handleDeleteQuestion = (questionId) => {
        if (!selectedKey || !window.confirm("Yakin ingin menghapus soal ini?")) return;
        setAllData(currentData => {
            const newData = JSON.parse(JSON.stringify(currentData));
            const gradeData = newData[selectedFilter];
            for (const mapel in gradeData) {
                const chapterIndex = gradeData[mapel].findIndex(ch => ch.materiKey === selectedKey);
                if (chapterIndex !== -1) {
                    gradeData[mapel][chapterIndex].questions = gradeData[mapel][chapterIndex].questions.filter(q => q.id !== questionId);
                    break;
                }
            }
            return newData;
        });
    };

    const handleContinueDraft = (chapterId) => {
        handleSelectMateri(chapterId);
        setIsQuestionModalOpen(true);
    };

    const handleDeleteDraft = (draftKey) => {
        if (window.confirm("Yakin ingin menghapus draf ini secara permanen?")) {
            localStorage.removeItem(draftKey);
        }
    };
    
    const currentMapelList = useMemo(() => Object.keys(materiList).sort(), [materiList]);

    return (
        <>
            <AnimatePresence>
                {isAddChapterModalOpen && <AddChapterModal isOpen={isAddChapterModalOpen} onClose={() => setIsAddChapterModalOpen(false)} onSubmit={handleAddChapterSubmit} mapelList={currentMapelList} jenjang={selectedFilter} />}
                {isDraftsModalOpen && <DraftsModal isOpen={isDraftsModalOpen} onClose={() => setIsDraftsModalOpen(false)} allData={allData} onContinue={handleContinueDraft} onDelete={handleDeleteDraft}/>}
            </AnimatePresence>
            {isQuestionModalOpen && <QuestionFormModal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} onSubmit={handleBatchQuestionSubmit} chapterId={selectedKey} />}

            <div>
                <h1 className="text-3xl font-bold text-sesm-deep mb-6">Manajemen Materi & Soal</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-md flex flex-col h-[75vh]">
                        <div className="flex-shrink-0 border-b pb-3 mb-2">
                             <h2 className="text-lg font-bold mb-2">Pilih Jenjang & Kelas</h2>
                            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sesm-teal">
                                {Object.keys(allData).map(filterName => (<option key={filterName} value={filterName}>{filterName}</option>))}
                            </select>
                        </div>
                        <div className="flex-shrink-0 mb-3">
                            <button onClick={() => setIsAddChapterModalOpen(true)} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sesm-teal text-white rounded-lg font-semibold text-sm hover:bg-sesm-deep transition-colors">
                                <FiPlus/> Tambah Bab / Mapel
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                            {isLoading ? ( <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div> ) 
                            : (Object.keys(materiList).length > 0 ? Object.keys(materiList).sort().map(mapel => (
                                    <div key={mapel}>
                                        <h3 className="font-bold text-sesm-teal mt-4 first:mt-0">{mapel}</h3>
                                        <div className="space-y-1 mt-1">
                                            {materiList[mapel].map(materi => (
                                                <div key={materi.materiKey} className={`group w-full text-left p-2 rounded-md flex justify-between items-center text-sm transition-colors ${selectedKey === materi.materiKey ? 'bg-sesm-teal/10' : 'hover:bg-gray-100'}`}>
                                                    <button onClick={() => handleSelectMateri(materi.materiKey)} className={`flex-grow flex justify-between items-center text-left pr-2 ${selectedKey === materi.materiKey ? 'font-bold text-sesm-deep' : 'text-gray-700'}`}>
                                                        <span>{materi.judul}</span>
                                                        <FiChevronRight/>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChapter(mapel, materi.materiKey); }} className="ml-2 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity" title="Hapus bab">
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
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setIsDraftsModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200" title="Lihat semua draf tersimpan">
                                            <FiSave/> Draf
                                        </button>
                                        <button onClick={() => setIsQuestionModalOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-sesm-deep text-white rounded-lg font-semibold text-sm">
                                            <FiPlus/> Tambah Soal
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {selectedMateri.questions && selectedMateri.questions.length > 0 ? selectedMateri.questions.map((q, index) => (
                                        <div key={q.id} className="bg-gray-50 p-3 rounded-md">
                                            <p className="font-semibold">{index + 1}. {q.question}</p>
                                            <p className="text-sm text-green-600 font-bold mt-1">Jawaban: {q.correctAnswer}</p>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <button disabled className="p-2 text-gray-400 cursor-not-allowed" title="Edit Soal (Segera Hadir)"><FiEdit/></button>
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