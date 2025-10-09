import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiChevronRight, FiPlus, FiEdit, FiTrash2, FiLoader } from 'react-icons/fi';

// --- (PERUBAHAN TOTAL): STRUKTUR DATA DISESUAIKAN DENGAN PERMINTAAN ---
// Setiap jenjang kelas sekarang memiliki objek mapel dan bab-nya sendiri yang unik.
const allDataByGrade = {
  'TK': {
    'Membaca': [
      { judul: 'Mengenal Huruf A-Z', materiKey: 'tk-membaca-1' },
      { judul: 'Mengeja Suku Kata', materiKey: 'tk-membaca-2' },
    ],
    'Menulis': [
      { judul: 'Menebalkan Garis dan Bentuk', materiKey: 'tk-menulis-1' },
      { judul: 'Menulis Huruf Lepas', materiKey: 'tk-menulis-2' },
    ],
    'Berhitung': [
      { judul: 'Mengenal Angka 1-10', materiKey: 'tk-berhitung-1' },
      { judul: 'Konsep Penjumlahan Sederhana', materiKey: 'tk-berhitung-2' },
    ],
  },
  'SD Kelas 1': {
    'Pendidikan Agama Islam': [
      { judul: 'Rukun Iman dan Rukun Islam', materiKey: 'sd1-pai-1' },
      { judul: 'Kisah Nabi (Adam & Idris)', materiKey: 'sd1-pai-2' },
    ],
    'Bahasa Indonesia': [
      { judul: 'Perkenalan Diri', materiKey: 'sd1-bi-1' },
      { judul: 'Benda di Sekitarku', materiKey: 'sd1-bi-2' },
    ],
    'Matematika': [
      { judul: 'Bilangan Sampai 20', materiKey: 'sd1-mtk-1' },
      { judul: 'Penjumlahan & Pengurangan Dasar', materiKey: 'sd1-mtk-2' },
    ],
    'Bahasa Inggris': [
      { judul: 'Greetings (Hello, Goodbye)', materiKey: 'sd1-bing-1' },
      { judul: 'Colors (Red, Blue, Yellow)', materiKey: 'sd1-bing-2' },
    ],
    'PKN': [
      { judul: 'Simbol Sila Pancasila', materiKey: 'sd1-pkn-1' },
      { judul: 'Aturan di Rumah', materiKey: 'sd1-pkn-2' },
    ],
  },
  'SD Kelas 2': {
    'Pendidikan Agama Islam': [
      { judul: 'Tata Cara Wudhu', materiKey: 'sd2-pai-1' },
      { judul: 'Asmaul Husna (Dasar)', materiKey: 'sd2-pai-2' },
    ],
    'PKN': [
      { judul: 'Aturan di Sekolah', materiKey: 'sd2-pkn-1' },
      { judul: 'Sikap Tolong Menolong', materiKey: 'sd2-pkn-2' },
    ],
    'Bahasa Indonesia': [
      { judul: 'Membuat Kalimat Tanya', materiKey: 'sd2-bi-1' },
      { judul: 'Membaca Dongeng', materiKey: 'sd2-bi-2' },
    ],
    'Matematika': [
      { judul: 'Perkalian dan Pembagian (1-5)', materiKey: 'sd2-mtk-1' },
      { judul: 'Satuan Waktu (Jam dan Menit)', materiKey: 'sd2-mtk-2' },
    ],
     'Bahasa Inggris': [
      { judul: 'My Family', materiKey: 'sd2-bing-1' },
      { judul: 'Animals', materiKey: 'sd2-bing-2' },
    ],
  },
  'SD Kelas 3 & 4': {
    'Pendidikan Agama Islam': [
        { judul: 'Puasa Ramadhan', materiKey: 'sd34-pai-1' },
    ],
    'PKN': [
        { judul: 'Hak dan Kewajiban', materiKey: 'sd34-pkn-1' },
    ],
    'Bahasa Indonesia': [
      { judul: 'Ide Pokok Paragraf', materiKey: 'sd34-bi-1' },
      { judul: 'Menulis Surat Pribadi', materiKey: 'sd34-bi-2' },
    ],
    'Matematika': [
      { judul: 'Operasi Hitung Campuran', materiKey: 'sd34-mtk-1' },
      { judul: 'Pecahan Sederhana', materiKey: 'sd34-mtk-2' },
    ],
    'Bahasa Inggris': [
        { judul: 'Daily Activities', materiKey: 'sd34-bing-1'},
    ],
    'IPA': [
      { judul: 'Rangka Manusia', materiKey: 'sd34-ipa-1' },
      { judul: 'Wujud dan Sifat Benda', materiKey: 'sd34-ipa-2' },
    ],
    'IPS': [
      { judul: 'Keragaman Budaya Indonesia', materiKey: 'sd34-ips-1' },
      { judul: 'Jenis-jenis Pekerjaan', materiKey: 'sd34-ips-2' },
    ],
  },
  'SD Kelas 5': {
    'Pendidikan Agama Islam': [ { judul: 'Zakat Fitrah', materiKey: 'sd5-pai-1' } ],
    'PKN': [ { judul: 'Organisasi di Lingkungan Sekolah', materiKey: 'sd5-pkn-1' } ],
    'Bahasa Indonesia': [ { judul: 'Iklan Media Cetak', materiKey: 'sd5-bi-1' } ],
    'Matematika': [
        { judul: 'Volume Kubus dan Balok', materiKey: 'sd5-mtk-1' },
        { judul: 'Jaring-jaring Bangun Ruang', materiKey: 'sd5-mtk-2' },
    ],
    'Bahasa Inggris': [ { judul: 'Public Places', materiKey: 'sd5-bing-1' } ],
    'IPA': [
        { judul: 'Sistem Pernapasan Manusia', materiKey: 'sd5-ipa-1' },
        { judul: 'Ekosistem dan Rantai Makanan', materiKey: 'sd5-ipa-2' },
    ],
    'IPS': [
        { judul: 'Perjuangan Melawan Penjajah', materiKey: 'sd5-ips-1' },
    ]
  },
  'SD Kelas 6': {
    'Pendidikan Agama Islam': [ { judul: 'Haji dan Umrah', materiKey: 'sd6-pai-1' } ],
    'PKN': [ { judul: 'Peran Indonesia di ASEAN', materiKey: 'sd6-pkn-1' } ],
    'Bahasa Indonesia': [ { judul: 'Menyimpulkan Isi Berita', materiKey: 'sd6-bi-1'} ],
    'Matematika': [
        { judul: 'Statistika (Mean, Median, Modus)', materiKey: 'sd6-mtk-1' },
        { judul: 'Luas dan Keliling Lingkaran', materiKey: 'sd6-mtk-2' },
    ],
    'Bahasa Inggris': [ { judul: 'Procedure Text', materiKey: 'sd6-bing-1' } ],
    'IPA': [
        { judul: 'Sistem Tata Surya', materiKey: 'sd6-ipa-1' },
        { judul: 'Adaptasi Makhluk Hidup', materiKey: 'sd6-ipa-2' },
    ],
    'IPS': [
        { judul: 'Modernisasi dan Globalisasi', materiKey: 'sd6-ips-1' },
    ]
  }
};

// Komponen Modal (Tidak diubah)
const QuestionFormModal = ({ isOpen, onClose, onSubmit, questionData }) => {
    const [formData, setFormData] = useState({});
    useEffect(() => { setFormData(questionData || { type: 'multiple-choice', question: '', options: ['', '', '', ''], correctAnswer: '' }); }, [questionData, isOpen]);
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleOptionChange = (index, value) => { const newOptions = [...formData.options]; newOptions[index] = value; setFormData(prev => ({ ...prev, options: newOptions }));};
    const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };
    if (!isOpen) return null;
    return (<motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-lg shadow-xl"><form onSubmit={handleSubmit}><div className="p-6"><h3 className="text-lg font-bold text-sesm-deep">{questionData ? 'Edit Soal' : 'Tambah Soal Baru'}</h3><div className="mt-4 space-y-4"><select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-2 border rounded-md"><option value="multiple-choice">Pilihan Ganda</option><option value="essay">Esai</option></select><textarea name="question" value={formData.question} onChange={handleInputChange} placeholder="Tulis pertanyaan di sini..." className="w-full p-2 border rounded-md h-24" required />{formData.type === 'multiple-choice' && (<><div className="grid grid-cols-2 gap-2">{formData.options.map((opt, i) => (<input key={i} type="text" value={opt} onChange={(e) => handleOptionChange(i, e.target.value)} placeholder={`Pilihan ${i + 1}`} className="w-full p-2 border rounded-md" required/>))}</div><input type="text" name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} placeholder="Jawaban Benar (harus sama persis dengan salah satu pilihan)" className="w-full p-2 border rounded-md" required/></>)}{formData.type === 'essay' && (<input type="text" name="correctAnswer" value={formData.correctAnswer} onChange={handleInputChange} placeholder="Jawaban Benar (opsional)" className="w-full p-2 border rounded-md"/>)}</div></div><div className="bg-gray-50 p-4 flex justify-end space-x-2 rounded-b-2xl"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">Batal</button><button type="submit" className="px-4 py-2 bg-sesm-deep text-white rounded-lg font-semibold">Simpan</button></div></form></motion.div></motion.div>);
};


const ManajemenMateri = () => {
    const [materiList, setMateriList] = useState({});
    const [selectedKey, setSelectedKey] = useState(null);
    const [selectedMateri, setSelectedMateri] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('TK'); 

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const dataForSelectedGrade = allDataByGrade[selectedFilter];
            setMateriList(dataForSelectedGrade || {});
            setSelectedKey(null);
            setSelectedMateri(null);
            setIsLoading(false);
        }, 300);
    }, [selectedFilter]);

    const handleSelectMateri = useCallback(async (materiKey, judul) => {
        setSelectedKey(materiKey);
        setIsDetailLoading(true);
        setTimeout(() => {
            setSelectedMateri({
                judul: judul,
                questions: [
                    { id: 1, question: `Contoh soal untuk "${judul}" (${selectedFilter})?`, correctAnswer: 'Jawaban A' },
                ]
            });
            setIsDetailLoading(false);
        }, 500);
    }, [selectedFilter]); // Tambahkan selectedFilter sebagai dependensi

    const handleDeleteChapter = (mapel, materiKey) => {
      if (window.confirm(`Yakin ingin hapus bab ini?`)) {
        setMateriList(currentList => {
            const newList = { ...currentList };
            newList[mapel] = newList[mapel].filter(m => m.materiKey !== materiKey);
            if (newList[mapel].length === 0) {
                delete newList[mapel];
            }
            return newList;
        });
        if (selectedKey === materiKey) {
            setSelectedKey(null);
            setSelectedMateri(null);
        }
      }
    };
    const handleDeleteQuestion = async (questionId) => { alert(`Hapus soal ID: ${questionId}`); };
    const handleFormSubmit = async (formData) => { alert(`Simpan soal...`); setIsModalOpen(false); };
    const openAddModal = () => { setEditingQuestion(null); setIsModalOpen(true); };
    const openEditModal = (question) => { setEditingQuestion(question); setIsModalOpen(true); };

    return (
        <>
            <QuestionFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} questionData={editingQuestion} />
            <div>
                <h1 className="text-3xl font-bold text-sesm-deep mb-6">Manajemen Materi & Soal</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-md flex flex-col h-[75vh]">
                        <h2 className="text-lg font-bold border-b pb-2 mb-2 flex-shrink-0">Pilih Bab</h2>
                        <div className="flex-shrink-0 mb-3">
                            <select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sesm-teal">
                                {Object.keys(allDataByGrade).map(filterName => (
                                    <option key={filterName} value={filterName}>{filterName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2">
                            {isLoading ? ( <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div> ) 
                            : (
                                Object.keys(materiList).length > 0 ? Object.keys(materiList).map(mapel => (
                                    <div key={mapel}>
                                        <h3 className="font-bold text-sesm-teal mt-4 first:mt-0">{mapel}</h3>
                                        <div className="space-y-1 mt-1">
                                            {materiList[mapel].map(materi => (
                                                <div key={materi.materiKey} className={`group w-full text-left p-2 rounded-md flex justify-between items-center text-sm transition-colors ${selectedKey === materi.materiKey ? 'bg-sesm-teal/10' : 'hover:bg-gray-100'}`}>
                                                    <button onClick={() => handleSelectMateri(materi.materiKey, materi.judul)} className={`flex-grow flex justify-between items-center text-left pr-2 ${selectedKey === materi.materiKey ? 'font-bold text-sesm-deep' : 'text-gray-700'}`}>
                                                        <span>{materi.judul}</span>
                                                        <FiChevronRight/>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteChapter(mapel, materi.materiKey); }} className="ml-2 p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-opacity">
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