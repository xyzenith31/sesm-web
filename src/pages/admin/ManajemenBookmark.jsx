// contoh-sesm-web/pages/admin/ManajemenBookmark.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiLoader, FiAlertCircle, FiEdit, FiSave, FiX, FiBookmark } from 'react-icons/fi';
import BookmarkService from '../../services/bookmarkService';
import Notification from '../../components/ui/Notification';

// --- Modal Penilaian (Tidak Berubah) ---
const SubmissionDetailModal = ({ submission, onClose, onGradeSubmitted }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (submission) {
            setLoading(true);
            BookmarkService.getSubmissionDetails(submission.id)
                .then(res => {
                    const formattedDetails = res.data.map(d => ({...d, is_correct: d.is_correct === null ? null : Boolean(d.is_correct)}));
                    setDetails(formattedDetails);
                    const correctCount = formattedDetails.filter(d => d.is_correct === true).length;
                    const calculatedScore = formattedDetails.length > 0 ? Math.round((correctCount / formattedDetails.length) * 100) : 0;
                    setScore(submission.score ?? calculatedScore);
                })
                .finally(() => setLoading(false));
        }
    }, [submission]);

    const toggleCorrectness = (answerId) => {
        const newDetails = details.map(d => d.id === answerId ? { ...d, is_correct: d.is_correct === null ? true : !d.is_correct } : d);
        setDetails(newDetails);
        const correctCount = newDetails.filter(d => d.is_correct === true).length;
        setScore(newDetails.length > 0 ? Math.round((correctCount / newDetails.length) * 100) : 0);
    };

    const handleGrade = async () => {
        try {
            const answerPayload = details.map(({ id, is_correct }) => ({ id, is_correct }));
            await BookmarkService.gradeSubmission(submission.id, score, answerPayload);
            onGradeSubmitted();
        } catch (error) { alert("Gagal menyimpan nilai."); }
    };
    
    return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[85vh]"><header className="p-5 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Nilai Pengerjaan: {submission.student_name}</h3><button onClick={onClose}><FiX/></button></header><main className="flex-grow overflow-y-auto p-6 bg-gray-50">{loading ? <div className="flex justify-center"><FiLoader className="animate-spin"/></div> : details.map(item => (<div key={item.id} className="bg-white p-4 rounded-lg border mb-4"><p className="font-bold text-gray-800">{item.question_index + 1}. {item.question_text}</p><div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg"><p>{item.answer_text || "(Tidak dijawab)"}</p></div><div className="mt-3 pt-3 border-t flex justify-end gap-2"><button onClick={() => toggleCorrectness(item.id)} className={`flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-md ${item.is_correct === false ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>Salah</button><button onClick={() => toggleCorrectness(item.id)} className={`flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-md ${item.is_correct === true ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>Benar</button></div></div>))}</main><footer className="p-5 border-t flex justify-between items-center bg-white"><div className="flex items-center gap-3"><label className="font-bold text-lg">Nilai Akhir:</label><input type="number" value={score} onChange={e => setScore(e.target.value)} className="w-24 p-2 text-lg font-bold border rounded-lg" /></div><button onClick={handleGrade} className="px-6 py-3 bg-sesm-deep text-white rounded-lg font-semibold">Simpan Nilai</button></footer></motion.div></motion.div> );
};

// --- Komponen Step Indicator ---
const StepIndicator = ({ stepNumber, label, isActive, onClick, isDisabled }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className="flex items-center gap-4 w-full text-left disabled:cursor-not-allowed group"
    >
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold border-2 transition-all duration-300 ${isActive ? 'bg-sesm-deep text-white border-sesm-deep' : 'bg-gray-200 text-gray-500 border-gray-200 group-hover:border-sesm-teal disabled:group-hover:border-gray-200'}`}>
            {stepNumber}
        </div>
        <span className={`font-semibold transition-colors duration-300 ${isActive ? 'text-sesm-deep' : 'text-gray-500 group-hover:text-sesm-deep disabled:group-hover:text-gray-500'}`}>{label}</span>
    </button>
);

// --- Komponen Form Soal Internal ---
const QuestionItem = ({ q, qIndex, onUpdate, onRemove }) => {
    const handleInputChange = (field, value) => onUpdate(qIndex, { ...q, [field]: value });
    
    const handleOptionChange = (optIndex, value) => {
        const newOptions = [...q.options];
        newOptions[optIndex] = value;
        onUpdate(qIndex, { ...q, options: newOptions });
    };

    const addOption = () => onUpdate(qIndex, { ...q, options: [...q.options, ''] });
    
    const removeOption = (optIndex) => {
        if (q.options.length <= 2) return;
        const newOptions = q.options.filter((_, i) => i !== optIndex);
        onUpdate(qIndex, { ...q, options: newOptions });
    };

    const inputStyle = "w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal";

    return (
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-sesm-teal space-y-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">{qIndex + 1}.</span>
                    <select value={q.type} onChange={(e) => handleInputChange('type', e.target.value)} className="p-2 border rounded-md bg-white text-sm">
                        <option value="pilihan-ganda">Pilihan Ganda</option>
                        <option value="esai">Esai</option>
                        <option value="pilihan-ganda-esai">Pilihan Ganda & Esai</option>
                    </select>
                </div>
                <button type="button" onClick={onRemove} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><FiTrash2 size={16}/></button>
            </div>
            
            <textarea value={q.question} onChange={(e) => handleInputChange('question', e.target.value)} placeholder="Tulis pertanyaan..." className={`${inputStyle} h-20`} required />
            
            {(q.type === 'pilihan-ganda' || q.type === 'pilihan-ganda-esai') && (
                <div className="space-y-2 pt-2 border-t">
                    {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                            <input type="text" value={opt} onChange={(e) => handleOptionChange(oIndex, e.target.value)} placeholder={`Pilihan ${oIndex + 1}`} className="w-full p-2 border rounded-md bg-white" required />
                            <button type="button" onClick={() => removeOption(oIndex)} disabled={q.options.length <= 2} className="p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300"><FiTrash2 /></button>
                        </div>
                    ))}
                    <button type="button" onClick={addOption} className="text-sm font-semibold text-sesm-deep"><FiPlus className="inline"/> Tambah Opsi</button>
                    <select value={q.correctAnswer} onChange={(e) => handleInputChange('correctAnswer', e.target.value)} className={`${inputStyle} mt-2`} required>
                        <option value="" disabled>-- Pilih Jawaban Benar --</option>
                        {q.options.filter(opt => opt.trim() !== '').map((opt, oIndex) => (
                            <option key={oIndex} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}
            
            {(q.type === 'esai' || q.type === 'pilihan-ganda-esai') && (
                 <div className="pt-2 border-t">
                    <label className="text-sm font-semibold text-gray-600">Kunci Jawaban Esai (Opsional)</label>
                    <input type="text" value={q.essayAnswer} onChange={(e) => handleInputChange('essayAnswer', e.target.value)} className={`${inputStyle} mt-1`} />
                </div>
            )}
        </div>
    );
};


// --- Komponen Modal Utama ---
const MaterialFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [step, setStep] = useState(1);
    const isEditMode = Boolean(initialData);

    const [formData, setFormData] = useState({ title: '', description: '', subject: '', url_link: '', grading_type: 'manual', recommended_level: 'Semua' });
    const [tasks, setTasks] = useState([]);
    const [mainFile, setMainFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [mainFilePreview, setMainFilePreview] = useState('');
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const [mediaSourceType, setMediaSourceType] = useState('file');
    
    // State untuk Notifikasi & Konfirmasi di dalam Modal
    const [modalNotif, setModalNotif] = useState({ isOpen: false, message: '', success: false, title: '' });
    const [confirmTaskDelete, setConfirmTaskDelete] = useState({ isOpen: false, index: null });

    const getNewQuestionObject = () => ({ id: Date.now() + Math.random(), type: 'pilihan-ganda', question: '', options: ['', ''], correctAnswer: '', essayAnswer: '' });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            if (initialData) {
                setFormData({
                    title: initialData.title || '', description: initialData.description || '', subject: initialData.subject || '',
                    url_link: initialData.type === 'video_link' ? initialData.url : '',
                    grading_type: initialData.grading_type || 'manual', recommended_level: initialData.recommended_level || 'Semua'
                });
                
                setMediaSourceType(initialData.type === 'video_link' ? 'link' : 'file');
                
                const initialTasks = (initialData.tasks || []).map((task, index) => {
                    if (typeof task === 'string') {
                        if (initialData.grading_type === 'otomatis' && task.includes('@@')) {
                            const [question, correctAnswer] = task.split('@@');
                            return { id: index, type: 'esai', question, options: [], correctAnswer: '', essayAnswer: correctAnswer };
                        }
                        return { id: index, type: 'esai', question: task, options: [], correctAnswer: '', essayAnswer: '' };
                    }
                    return { ...getNewQuestionObject(), ...task, id: task.id || index };
                });
                setTasks(initialTasks.length > 0 ? initialTasks : []);

            } else {
                setFormData({ title: '', description: '', subject: '', url_link: '', grading_type: 'manual', recommended_level: 'Semua' });
                setTasks([]);
            }
            setMainFile(null); setCoverImage(null); setMainFilePreview(''); setCoverImagePreview('');
        }
    }, [initialData, isOpen]);

    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMainFileChange = (e) => { const file = e.target.files[0]; if (file) { setMainFile(file); setMainFilePreview(file.name); } };
    const handleCoverImageChange = (e) => { const file = e.target.files[0]; if (file) { setCoverImage(file); setCoverImagePreview(URL.createObjectURL(file)); } };
    
    const updateTask = (index, updatedTask) => setTasks(prev => prev.map((task, i) => i === index ? updatedTask : task));
    const addTask = () => setTasks(prev => [...prev, getNewQuestionObject()]);
    
    const requestTaskDeletion = (index) => {
        setConfirmTaskDelete({ isOpen: true, index: index });
    };
    
    const confirmTaskDeletion = () => {
        if (confirmTaskDelete.index !== null) {
            setTasks(prev => prev.filter((_, i) => i !== confirmTaskDelete.index));
        }
        setConfirmTaskDelete({ isOpen: false, index: null });
    };

    const navigateToStep = (targetStep) => {
        if (targetStep > 1 && (!formData.title.trim() || !formData.subject.trim())) {
            setModalNotif({ isOpen: true, message: "Judul dan Mapel wajib diisi sebelum melanjutkan.", success: false, title: "Data Belum Lengkap" });
            return;
        }
        setStep(targetStep);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (step === 2 && !isEditMode) {
             if (mediaSourceType === 'file' && !mainFile) {
                setModalNotif({ isOpen: true, message: "Silakan pilih file utama untuk diunggah.", success: false, title: "Validasi Gagal" });
                return;
            }
            if (mediaSourceType === 'link' && !formData.url_link.trim()) {
                setModalNotif({ isOpen: true, message: "Silakan masukkan link video.", success: false, title: "Validasi Gagal" });
                return;
            }
        }

        if (step < 3) {
            navigateToStep(step + 1);
            return;
        }

        const hasAtLeastOneTask = tasks.some(t => t.question && t.question.trim() !== '');
        if (!hasAtLeastOneTask) {
            setModalNotif({ isOpen: true, message: 'Anda harus menambahkan setidaknya satu soal/tugas sebelum menyimpan.', success: false, title: "Validasi Gagal" });
            return;
        }

        setIsSaving(true);
        const data = new FormData();
        
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        
        data.append('tasks', JSON.stringify(tasks));
        
        if (mainFile) data.append('mainFile', mainFile);
        if (coverImage) data.append('coverImage', coverImage);
        
        if (mediaSourceType === 'file') data.delete('url_link');
        
        await onSave(data, initialData?.id);
        setIsSaving(false);
    };

    const inputStyle = "w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal";
    const stepVariants = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };

    const renderStepContent = () => {
        switch(step) {
            case 1:
                return ( <motion.div key={1} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4"> <div><label className="font-semibold text-sm">Judul</label><input type="text" name="title" value={formData.title} onChange={handleFormChange} className={inputStyle} required /></div> <div><label className="font-semibold text-sm">Mapel</label><input type="text" name="subject" value={formData.subject} onChange={handleFormChange} className={inputStyle} required /></div> <div><label className="font-semibold text-sm">Disarankan Untuk</label><select name="recommended_level" value={formData.recommended_level} onChange={handleFormChange} className={`${inputStyle} mt-1`}><option value="Semua">Semua Jenjang</option><option value="TK">TK</option><option value="SD 1-2">SD Kelas 1-2</option><option value="SD 3-4">SD Kelas 3-4</option><option value="SD 5-6">SD Kelas 5-6</option></select></div> <div><label className="font-semibold text-sm">Deskripsi</label><textarea name="description" value={formData.description} onChange={handleFormChange} className={`${inputStyle} h-24`}></textarea></div> </motion.div> );
            case 2:
                return ( <motion.div key={2} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4"> <div className="space-y-2"> <label className="font-semibold text-sm">Sumber Materi</label> <div className="flex gap-4"> <label className="flex items-center gap-2"><input type="radio" name="mediaSource" value="file" checked={mediaSourceType === 'file'} onChange={(e) => setMediaSourceType(e.target.value)} /> File</label> <label className="flex items-center gap-2"><input type="radio" name="mediaSource" value="link" checked={mediaSourceType === 'link'} onChange={(e) => setMediaSourceType(e.target.value)} /> Link Video</label> </div> </div> <AnimatePresence mode="wait"> <motion.div key={mediaSourceType} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4"> {mediaSourceType === 'file' ? ( <div><label className="font-semibold text-sm">File Utama (PDF, Video, dll.)</label><div className="border-2 border-dashed p-4 mt-1 rounded-lg text-center"><input type="file" id="main-upload" className="hidden" onChange={handleMainFileChange} /><label htmlFor="main-upload" className="cursor-pointer text-sesm-teal font-semibold flex flex-col items-center justify-center gap-1"><FiPlus /><span>{mainFilePreview || "Pilih file..."}</span></label></div></div> ) : ( <div><label className="font-semibold text-sm">Link Video</label><input type="url" name="url_link" value={formData.url_link} onChange={handleFormChange} className={inputStyle} placeholder="https://www.youtube.com/..." /></div> )} </motion.div> </AnimatePresence> <div><label className="font-semibold text-sm">Gambar Sampul</label><div className="border-2 border-dashed p-4 mt-1 rounded-lg text-center"><input type="file" id="cover-upload" className="hidden" onChange={handleCoverImageChange} accept="image/*" /><label htmlFor="cover-upload" className="cursor-pointer text-sesm-teal font-semibold flex flex-col items-center justify-center gap-1">{coverImagePreview ? <img src={coverImagePreview} alt="Preview" className="h-24 rounded-md mb-2 object-cover" /> : <FiPlus />}<span>{coverImage ? coverImage.name : "Pilih gambar..."}</span></label></div></div> </motion.div> );
            case 3:
                return ( <motion.div key={3} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-3"> <div><label className="font-semibold text-sm">Tipe Penilaian</label><select name="grading_type" value={formData.grading_type} onChange={handleFormChange} className={`${inputStyle} mt-1`}><option value="manual">Manual (Guru menilai)</option><option value="otomatis">Otomatis (hanya PG)</option></select><p className="text-xs text-gray-500 mt-1">{formData.grading_type === 'otomatis' ? 'Jawaban esai tidak akan dinilai otomatis.' : 'Semua jenis soal akan dinilai manual oleh guru.'}</p></div> <div className="border-t pt-4"><h4 className="font-semibold">Soal & Tugas</h4><div className="space-y-3 mt-2 max-h-[280px] overflow-y-auto pr-2">{tasks.map((task, index) => (<QuestionItem key={task.id} q={task} qIndex={index} onUpdate={updateTask} onRemove={() => requestTaskDeletion(index)} />))}<button type="button" onClick={addTask} className="text-sm font-semibold text-sesm-deep mt-2"><FiPlus className="inline"/> Tambah Soal</button></div></div> </motion.div> );
            default:
                return null;
        }
    }
    
    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <Notification
                isOpen={modalNotif.isOpen}
                onClose={() => setModalNotif({ ...modalNotif, isOpen: false })}
                title={modalNotif.title}
                message={modalNotif.message}
                success={modalNotif.success}
            />
             <Notification
                isOpen={confirmTaskDelete.isOpen}
                onClose={() => setConfirmTaskDelete({ isOpen: false, index: null })}
                onConfirm={confirmTaskDeletion}
                title="Konfirmasi Hapus Soal"
                message="Anda yakin ingin menghapus soal ini?"
                isConfirmation={true}
                success={false}
                confirmText="Ya, Hapus"
            />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col">
                <form onSubmit={handleSubmit}>
                    <header className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold text-sesm-deep">{isEditMode ? 'Edit Materi' : 'Tambah Materi Baru'}</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                    </header>
                    <main className="p-6 flex gap-8">
                        <div className="w-1/3 border-r pr-6 space-y-6 pt-2">
                            <StepIndicator stepNumber={1} label="Informasi Dasar" isActive={step === 1} onClick={() => navigateToStep(1)} />
                            <StepIndicator stepNumber={2} label="Media & Materi" isActive={step === 2} onClick={() => navigateToStep(2)} isDisabled={!formData.title.trim() || !formData.subject.trim()} />
                            <StepIndicator stepNumber={3} label="Soal & Tugas" isActive={step === 3} onClick={() => navigateToStep(3)} isDisabled={!formData.title.trim() || !formData.subject.trim()} />
                        </div>
                        <div className="w-2/3">
                           <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
                        </div>
                    </main>
                    <footer className="bg-gray-50 p-4 flex justify-end items-center gap-3 rounded-b-2xl border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300">Batal</button>
                        {step < 3 ? (
                            <button type="button" onClick={() => navigateToStep(step + 1)} className="px-5 py-2 bg-sesm-teal text-white rounded-lg font-semibold hover:bg-opacity-90">Lanjutkan</button>
                        ) : (
                            <button type="submit" disabled={isSaving} className="px-5 py-2 bg-sesm-deep text-white rounded-lg flex items-center gap-2 disabled:bg-gray-400">{isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}{isSaving ? 'Menyimpan...' : 'Publish Materi'}</button>
                        )}
                    </footer>
                </form>
            </motion.div>
        </motion.div>
    );
};


const ManajemenBookmark = () => {
    const [activeTab, setActiveTab] = useState('materi');
    const [bookmarks, setBookmarks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });
    const [confirmDeleteNotif, setConfirmDeleteNotif] = useState({ isOpen: false, onConfirm: () => {} });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [selectedBookmarkId, setSelectedBookmarkId] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    
    const fetchBookmarks = useCallback(async (selectIdAfterFetch = null) => {
        setLoading(true);
        try {
            const response = await BookmarkService.getAllBookmarks();
            setBookmarks(response.data);
            const initialId = selectIdAfterFetch || response.data[0]?.id;
            if (initialId) {
                setSelectedBookmarkId(initialId);
                if (activeTab === 'nilai') {
                    handleSelectBookmarkForGrading(initialId);
                }
            }
        } catch (error) {
            setNotif({ isOpen: true, message: "Gagal memuat materi.", success: false, title: "Error" });
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

    const handleOpenModal = (material = null) => { setEditingMaterial(material); setIsModalOpen(true); };
    
    const handleSave = async (data, id) => {
        try {
            if (id) {
                await BookmarkService.updateBookmark(id, data);
                setNotif({ isOpen: true, message: "Materi berhasil diperbarui!", success: true, title: "Sukses" });
            } else {
                await BookmarkService.createBookmark(data);
                setNotif({ isOpen: true, message: "Materi baru berhasil ditambahkan!", success: true, title: "Sukses" });
            }
            setIsModalOpen(false);
            fetchBookmarks(id);
        } catch (error) {
            setNotif({ 
                isOpen: true, 
                message: error.response?.data?.message || "Gagal menyimpan. Periksa kembali isian Anda.", 
                success: false,
                title: "Gagal Menyimpan"
            });
        }
    };
    
    const handleDelete = (id, title) => {
        setConfirmDeleteNotif({
            isOpen: true,
            onConfirm: () => confirmDeleteAction(id),
            title: `Hapus Materi "${title}"?`,
            message: "Tindakan ini tidak dapat diurungkan. Semua data terkait materi ini akan dihapus secara permanen."
        });
    };

    const confirmDeleteAction = async (id) => {
        try {
            await BookmarkService.deleteBookmark(id);
            setNotif({ isOpen: true, message: "Materi berhasil dihapus.", success: true, title: "Sukses" });
            setBookmarks(prev => prev.filter(b => b.id !== id));
            if (selectedBookmarkId === id) {
                setSelectedBookmarkId(null);
                setSubmissions([]);
            }
        } catch (error) {
            setNotif({ isOpen: true, message: "Gagal menghapus materi.", success: false, title: "Error" });
        } finally {
            setConfirmDeleteNotif({ isOpen: false, onConfirm: () => {} });
        }
    };

    const handleSelectBookmarkForGrading = async (bookmarkId) => {
        setLoading(true);
        setSelectedBookmarkId(bookmarkId);
        try {
            const res = await BookmarkService.getSubmissions(bookmarkId);
            setSubmissions(res.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isModalOpen && <MaterialFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingMaterial} />}
                {selectedSubmission && <SubmissionDetailModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} onGradeSubmitted={() => { setSelectedSubmission(null); handleSelectBookmarkForGrading(selectedBookmarkId); }} />}
            </AnimatePresence>
            <Notification isOpen={notif.isOpen} onClose={() => setNotif({ ...notif, isOpen: false })} title={notif.title} message={notif.message} success={notif.success} />
            <Notification
                isOpen={confirmDeleteNotif.isOpen}
                onClose={() => setConfirmDeleteNotif({ isOpen: false })}
                onConfirm={confirmDeleteNotif.onConfirm}
                title={confirmDeleteNotif.title}
                message={confirmDeleteNotif.message}
                isConfirmation={true}
                success={false}
                confirmText="Ya, Hapus"
            />

            <div className="bg-white p-6 rounded-xl shadow-lg flex-grow flex flex-col h-full">
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                        <h1 className="text-3xl font-bold text-sesm-deep flex items-center gap-3"><FiBookmark /> Manajemen Bookmark</h1>
                        <p className="text-gray-500">Kelola materi, soal, dan penilaian untuk siswa.</p>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-full p-1">
                        <button onClick={() => setActiveTab('materi')} className={`px-4 py-1.5 text-sm font-semibold rounded-full ${activeTab === 'materi' ? 'bg-white shadow text-sesm-deep' : 'text-gray-500'}`}>Daftar Materi</button>
                        <button onClick={() => setActiveTab('nilai')} className={`px-4 py-1.5 text-sm font-semibold rounded-full ${activeTab === 'nilai' ? 'bg-white shadow text-sesm-deep' : 'text-gray-500'}`}>Manajemen Nilai</button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {loading && <div className="flex-grow flex items-center justify-center py-16"><FiLoader className="animate-spin text-3xl"/></div>}
                        
                        {!loading && activeTab === 'materi' && (
                            <div>
                                <div className="text-right mb-4">
                                    <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-sesm-teal text-white font-semibold rounded-lg flex items-center gap-2"><FiPlus/> Tambah Materi</button>
                                </div>
                                {bookmarks.length === 0 ? <div className="text-center py-16 text-gray-400"><FiAlertCircle size={48} className="mx-auto"/><p>Belum ada materi.</p></div> : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Judul</th>
                                                <th className="px-6 py-3 text-left">Mapel</th>
                                                <th className="px-6 py-3 text-center">Jenjang</th>
                                                <th className="px-6 py-3 text-center">Jumlah Soal</th>
                                                <th className="px-6 py-3 text-center">Penilaian</th>
                                                <th className="px-6 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>{bookmarks.map(item => ( <tr key={item.id} className="hover:bg-gray-50 border-b">
                                            <td className="px-6 py-4 font-bold text-gray-800">{item.title}</td>
                                            <td className="px-6 py-4">{item.subject}</td>
                                            <td className="px-6 py-4 text-center">{item.recommended_level}</td>
                                            <td className="px-6 py-4 text-center">{item.tasks?.length || 0}</td>
                                            <td className="px-6 py-4 capitalize text-center">{item.grading_type}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-4">
                                                    <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-800"><FiEdit/></button>
                                                    <button onClick={() => handleDelete(item.id, item.title)} className="text-red-600 hover:text-red-800"><FiTrash2/></button>
                                                </div>
                                            </td>
                                        </tr>))}</tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {!loading && activeTab === 'nilai' && (
                            <div>
                                <div className="mb-4"><label className="font-semibold text-sm">Pilih Materi untuk Dinilai:</label><select value={selectedBookmarkId || ''} onChange={e => handleSelectBookmarkForGrading(parseInt(e.target.value))} className="w-full mt-1 p-2 border rounded-lg bg-gray-50"><option value="" disabled>-- Pilih Materi --</option>{bookmarks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select></div>
                                {submissions.length === 0 ? <p className="text-center text-gray-400 py-8">Belum ada siswa yang mengerjakan materi ini.</p> : (
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Nama Siswa</th>
                                                <th className="px-6 py-3 text-left">Tanggal</th>
                                                <th className="px-6 py-3 text-center">Status</th>
                                                <th className="px-6 py-3 text-center">Skor</th>
                                                <th className="px-6 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>{submissions.map(sub => (<tr key={sub.id} className="hover:bg-gray-50 border-b">
                                            <td className="px-6 py-4 font-bold">{sub.student_name}</td>
                                            <td className="px-6 py-4">{new Date(sub.submission_date).toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sub.status === 'dinilai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{sub.status}</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-center">{sub.score ?? '-'}</td>
                                            <td className="px-6 py-4 text-center"><button onClick={() => setSelectedSubmission(sub)} className="text-blue-600 hover:underline"><FiEdit/></button></td>
                                        </tr>))}</tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );
};

export default ManajemenBookmark;