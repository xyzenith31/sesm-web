// contoh-sesm-web/components/admin/EditMaterialModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiSave, FiLoader, FiTrash2 } from 'react-icons/fi';
import DataService from '../../services/dataService';
import CustomSelect from '../ui/CustomSelect';
import useDebounce from '../../hooks/useDebounce';
import SaveStatusIcon from '../ui/SaveStatusIcon';
import Notification from '../ui/Notification';

// Komponen QuestionItem dan StepIndicator (TIDAK BERUBAH, tetap sama seperti sebelumnya)
const toAlpha = (num) => String.fromCharCode(65 + num);
// ... (Kode QuestionItem tetap sama) ...
const QuestionItem = ({ q, qIndex, onUpdate, onRemove }) => {
    // ... (Kode lengkap QuestionItem) ...
    const handleInputChange = (field, value) => onUpdate(qIndex, { ...q, [field]: value });
    const handleOptionChange = (optIndex, value) => {
        const newOptions = [...q.options];
        const oldOptionValue = newOptions[optIndex];
        newOptions[optIndex] = value;
        if (q.correctAnswer === oldOptionValue) {
            handleInputChange('correctAnswer', value);
        }
        onUpdate(qIndex, { ...q, options: newOptions });
    };
    const addOption = () => onUpdate(qIndex, { ...q, options: [...q.options, ''] });
    const removeOption = (optIndex) => {
        if (q.options.length <= 2) return;
        const optionToRemove = q.options[optIndex];
        const newOptions = q.options.filter((_, i) => i !== optIndex);
        if (q.correctAnswer === optionToRemove) {
            handleInputChange('correctAnswer', '');
        }
        onUpdate(qIndex, { ...q, options: newOptions });
    };

    const inputStyle = "w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal";

    const questionTypeOptions = [
        { value: 'pilihan-ganda', label: 'Pilihan Ganda' },
        { value: 'esai', label: 'Esai' },
        { value: 'pilihan-ganda-esai', label: 'Pilihan Ganda & Esai' }
    ];

    const answerOptions = q.options
        .filter(opt => opt && opt.trim() !== '') // Pastikan opsi tidak kosong
        .map((opt, index) => ({ value: opt, label: `${toAlpha(index)}. ${opt}` }));

    return (
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-sesm-teal space-y-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 w-full">
                    <span className="font-bold text-gray-700">{qIndex + 1}.</span>
                    <CustomSelect
                        options={questionTypeOptions}
                        value={q.type}
                        onChange={(value) => handleInputChange('type', value)}
                    />
                </div>
                <button type="button" onClick={onRemove} className="p-2 text-red-500 hover:bg-red-100 rounded-full ml-2"><FiTrash2 size={16}/></button>
            </div>
            <textarea value={q.question} onChange={(e) => handleInputChange('question', e.target.value)} placeholder="Tulis pertanyaan..." className={`${inputStyle} h-20`} required />
            {(q.type === 'pilihan-ganda' || q.type === 'pilihan-ganda-esai') && (
                <div className="space-y-2 pt-2 border-t">
                    {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                            <span className="font-bold text-gray-600">{toAlpha(oIndex)}.</span>
                            <input type="text" value={opt} onChange={(e) => handleOptionChange(oIndex, e.target.value)} placeholder={`Pilihan ${toAlpha(oIndex)}`} className="w-full p-2 border rounded-md bg-white" required />
                            <button type="button" onClick={() => removeOption(oIndex)} disabled={q.options.length <= 2} className="p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300"><FiTrash2 /></button>
                        </div>
                    ))}
                    <button type="button" onClick={addOption} className="text-sm font-semibold text-sesm-deep"><FiPlus className="inline"/> Tambah Opsi</button>
                    <div className="mt-2">
                       <CustomSelect
                            options={answerOptions}
                            value={q.correctAnswer}
                            onChange={(value) => handleInputChange('correctAnswer', value)}
                            placeholder="-- Pilih Jawaban Benar --"
                        />
                    </div>
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
// ... (Kode StepIndicator tetap sama) ...
const StepIndicator = ({ stepNumber, label, isActive, onClick, isDisabled }) => (
    <button type="button" onClick={onClick} disabled={isDisabled} className="flex items-center gap-4 w-full text-left disabled:cursor-not-allowed group">
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold border-2 transition-all duration-300 ${isActive ? 'bg-sesm-deep text-white border-sesm-deep' : 'bg-gray-200 text-gray-500 border-gray-200 group-hover:border-sesm-teal disabled:group-hover:border-gray-200'}`}>
            {stepNumber}
        </div>
        <span className={`font-semibold transition-colors duration-300 ${isActive ? 'text-sesm-deep' : 'text-gray-500 group-hover:text-sesm-deep disabled:group-hover:text-gray-500'}`}>{label}</span>
    </button>
);


const EditMaterialModal = ({ isOpen, onClose, onSave, initialData }) => {
    const API_URL = 'http://localhost:8080';
    const DRAFT_KEY = useMemo(() => `bookmark_draft_edit_${initialData?.id}`, [initialData]);
    const [saveStatus, setSaveStatus] = useState('Tersimpan');
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ title: '', description: '', subject: '', url_link: '', grading_type: 'manual', recommended_level: 'Semua' });
    const [tasks, setTasks] = useState([]);
    const [mainFile, setMainFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [mainFilePreview, setMainFilePreview] = useState('');
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const [mediaSourceType, setMediaSourceType] = useState('file');

    const debouncedFormData = useDebounce(formData, 1500);
    const debouncedTasks = useDebounce(tasks, 1500);

    const levelOptions = [
        { value: 'Semua', label: 'Semua Jenjang' }, { value: 'TK', label: 'TK' },
        { value: 'SD 1-2', label: 'SD Kelas 1-2' }, { value: 'SD 3-4', label: 'SD Kelas 3-4' },
        { value: 'SD 5-6', label: 'SD Kelas 5-6' }
    ];
    const gradingTypeOptions = [ { value: 'manual', label: 'Manual (Guru menilai)' }, { value: 'otomatis', label: 'Otomatis (hanya PG)' } ];
    const getNewQuestionObject = () => ({ id: Date.now() + Math.random(), type: 'pilihan-ganda', question: '', options: ['', ''], correctAnswer: '', essayAnswer: '' });

    // --- Fungsi Simpan Draf (Auto-Save saat Edit) ---
    const saveDraftToBackend = useCallback(async () => {
        // Hanya simpan jika ada perubahan signifikan
        if (!formData.title.trim() && !formData.subject.trim() && tasks.length === 0 && !mainFile && !coverImage && mediaSourceType === 'file') {
            setSaveStatus('Tersimpan'); // Anggap tersimpan jika masih kosong/default
            return;
        }
        setSaveStatus('Menyimpan...');
        const draftData = { formData, tasks, mediaSourceType }; // File tidak disimpan di draf server
        try {
            await DataService.saveDraft(DRAFT_KEY, draftData);
            setSaveStatus('Tersimpan');
        } catch (error) {
            console.error("Gagal menyimpan draf (edit):", error);
            setSaveStatus('Gagal');
            // Tampilkan notifikasi gagal simpan draf (opsional, bisa mengganggu)
            // setNotif({ isOpen: true, title: "Gagal Simpan Draf", message: "Gagal menyimpan draf otomatis.", success: false });
        }
    }, [formData, tasks, mediaSourceType, DRAFT_KEY, mainFile, coverImage]); // Tambahkan file state ke dependency jika perlu

    // --- useEffect untuk memicu simpan draf ---
    useEffect(() => {
        // Hanya auto-save jika modal terbuka dan tidak sedang menyimpan
        if (isOpen && saveStatus !== 'Menyimpan...') {
            saveDraftToBackend();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedFormData, debouncedTasks, isOpen]); // Picu saat data debounced berubah


    // --- useEffect untuk Memuat Data Awal ---
    useEffect(() => {
        if (isOpen && initialData) {
            // ✅ **PERUBAHAN UTAMA: Langsung muat dari initialData, hapus pemanggilan getDraft**
            console.log("Loading initial data for edit:", initialData); // Log untuk debug
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                subject: initialData.subject || '',
                url_link: initialData.type === 'video_link' ? initialData.url : '',
                grading_type: initialData.grading_type || 'manual',
                recommended_level: initialData.recommended_level || 'Semua'
            });
            // Pastikan tasks selalu array, bahkan jika null/undefined dari DB
            setTasks((initialData.tasks || []).map(t => ({...getNewQuestionObject(), ...t}))); // Gunakan map untuk memastikan struktur default
            const sourceType = initialData.type === 'video_link' ? 'link' : 'file';
            setMediaSourceType(sourceType);
            // Set preview berdasarkan initialData
            setMainFilePreview(sourceType === 'file' && initialData.url ? initialData.url.split('/').pop() : '');
            setCoverImagePreview(initialData.cover_image_url ? `${API_URL}/${initialData.cover_image_url}` : '');
            // Reset file input states
            setMainFile(null);
            setCoverImage(null);
            setSaveStatus('Tersimpan'); // Set status awal ke 'Tersimpan'
            setStep(1); // Mulai dari step 1
            setNotif(prev => ({...prev, isOpen: false})); // Pastikan notif tertutup

            // Hapus kode fetch draft:
            // DataService.getDraft(DRAFT_KEY).then(...) dihapus

        } else if (!isOpen) {
             // Reset state saat modal ditutup (opsional, tergantung behavior yang diinginkan)
             setFormData({ title: '', description: '', subject: '', url_link: '', grading_type: 'manual', recommended_level: 'Semua' });
             setTasks([]);
             setMediaSourceType('file');
             setMainFile(null);
             setCoverImage(null);
             setMainFilePreview('');
             setCoverImagePreview('');
             setSaveStatus('Tersimpan');
             setStep(1);
        }
    // Hanya bergantung pada isOpen dan initialData
    }, [isOpen, initialData, API_URL]);


    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMainFileChange = (e) => { const file = e.target.files[0]; if (file) { setMainFile(file); setMainFilePreview(file.name); setFormData(prev => ({ ...prev, url_link: '' })); setMediaSourceType('file'); } }; // Otomatis set type ke file
    const handleCoverImageChange = (e) => { const file = e.target.files[0]; if (file) { setCoverImage(file); setCoverImagePreview(URL.createObjectURL(file)); } };
    const handleUrlLinkChange = (e) => { setFormData(prev => ({ ...prev, url_link: e.target.value })); setMainFile(null); setMainFilePreview(''); setMediaSourceType('link'); }; // Otomatis set type ke link

    const updateTask = (index, updatedTask) => setTasks(prev => prev.map((task, i) => i === index ? updatedTask : task));
    const addTask = () => setTasks(prev => [...prev, getNewQuestionObject()]);
    const removeTask = (index) => setTasks(prev => prev.filter((_, i) => i !== index));

    const navigateToStep = (targetStep) => {
        if (targetStep > 1 && (!formData.title.trim() || !formData.subject.trim())) {
             setNotif({isOpen: true, title: "Info", message: "Judul dan Mapel wajib diisi sebelum melanjutkan.", success: true });
            return;
        }
        setStep(targetStep);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step < 3) {
            navigateToStep(step + 1);
            return;
        }

        setIsSaving(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        data.append('tasks', JSON.stringify(tasks));
        if (mainFile) data.append('mainFile', mainFile);
        if (coverImage) data.append('coverImage', coverImage);
        // Tentukan tipe berdasarkan state mediaSourceType saat submit
        data.append('type', mediaSourceType === 'link' ? 'video_link' : determineType(mainFile, null)); // Tentukan type saat submit
        // Hapus url_link jika tipe adalah file, atau hapus mainFile jika tipe adalah link
        if (mediaSourceType === 'file') {
            data.delete('url_link');
        } else {
            // Jika tipe link, URL sudah ada di formData.url_link
        }

        try {
            await onSave(data, initialData.id); // Kirim ID untuk mode edit
             // Hapus draf setelah berhasil publish (tetap lakukan ini)
            DataService.deleteDraft(DRAFT_KEY).catch(err => console.warn("Gagal menghapus draf edit setelah publish:", err));
        } catch (error) {
            // Error handling sudah ada di parent
            // setNotif({isOpen: true, title: "Gagal Simpan", message: error.message || "Gagal menyimpan perubahan.", success: false});
        } finally {
            setIsSaving(false);
        }
    };
    // Helper determineType (jika belum ada)
    const determineType = (file, link) => {
        if (link) return 'video_link';
        if (file) {
            const mime = file.type;
            if (mime.startsWith('image/')) return 'image';
            if (mime.startsWith('video/')) return 'video';
            if (mime === 'application/pdf') return 'pdf';
            if (mime.includes('word')) return 'document';
            return 'file'; // Default
        }
        return 'unknown'; // Fallback
    };


    const inputStyle = "w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal";
    const stepVariants = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };

    const renderStepContent = () => {
        switch(step) {
             case 1:
                return ( <motion.div key={1} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4"> <div><label className="font-semibold text-sm">Judul</label><input type="text" name="title" value={formData.title} onChange={handleFormChange} className={inputStyle} required /></div> <div><label className="font-semibold text-sm">Mapel</label><input type="text" name="subject" value={formData.subject} onChange={handleFormChange} className={inputStyle} required /></div> <div><label className="font-semibold text-sm">Disarankan Untuk</label><CustomSelect name="recommended_level" options={levelOptions} value={formData.recommended_level} onChange={(value) => setFormData(prev => ({...prev, recommended_level: value}))} /></div> <div><label className="font-semibold text-sm">Deskripsi</label><textarea name="description" value={formData.description} onChange={handleFormChange} className={`${inputStyle} h-24`}></textarea></div> </motion.div> );
            case 2:
                return ( <motion.div key={2} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4"> <div className="space-y-2"> <label className="font-semibold text-sm">Sumber Materi</label> <div className="flex gap-4"> <label className="flex items-center gap-2"><input type="radio" name="mediaSource" value="file" checked={mediaSourceType === 'file'} onChange={(e) => setMediaSourceType(e.target.value)} /> File</label> <label className="flex items-center gap-2"><input type="radio" name="mediaSource" value="link" checked={mediaSourceType === 'link'} onChange={(e) => setMediaSourceType(e.target.value)} /> Link Video</label> </div> </div> <AnimatePresence mode="wait"> <motion.div key={mediaSourceType} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4"> {mediaSourceType === 'file' ? ( <div><label className="font-semibold text-sm">Ganti File Utama (Opsional)</label><div className="border-2 border-dashed p-4 mt-1 rounded-lg text-center"><input type="file" id="main-upload-edit" className="hidden" onChange={handleMainFileChange} /><label htmlFor="main-upload-edit" className="cursor-pointer text-sesm-teal font-semibold flex flex-col items-center justify-center gap-1"><FiPlus /><span>{mainFilePreview || "Pilih file baru..."}</span></label></div><p className="text-xs text-gray-500 mt-1">File saat ini: {initialData?.url ? initialData.url.split('/').pop() : 'Tidak ada'}</p></div> ) : ( <div><label className="font-semibold text-sm">Link Video</label><input type="url" name="url_link" value={formData.url_link} onChange={handleUrlLinkChange} className={inputStyle} placeholder="https://www.youtube.com/..." /></div> )} </motion.div> </AnimatePresence> <div><label className="font-semibold text-sm">Ganti Gambar Sampul (Opsional)</label><div className="border-2 border-dashed p-4 mt-1 rounded-lg text-center"><input type="file" id="cover-upload-edit" className="hidden" onChange={handleCoverImageChange} accept="image/*" /><label htmlFor="cover-upload-edit" className="cursor-pointer text-sesm-teal font-semibold flex flex-col items-center justify-center gap-1">{coverImagePreview ? <img src={coverImagePreview} alt="Preview" className="h-24 rounded-md mb-2 object-cover" /> : <FiPlus />}<span>{coverImage ? coverImage.name : "Pilih gambar baru..."}</span></label></div></div> </motion.div> );
            case 3:
                return ( <motion.div key={3} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-3"> <div><label className="font-semibold text-sm">Tipe Penilaian</label><CustomSelect name="grading_type" options={gradingTypeOptions} value={formData.grading_type} onChange={(value) => setFormData(prev => ({...prev, grading_type: value}))} /><p className="text-xs text-gray-500 mt-1">{formData.grading_type === 'otomatis' ? 'Jawaban esai tidak akan dinilai otomatis.' : 'Semua jenis soal akan dinilai manual oleh guru.'}</p></div> <div className="border-t pt-4"><h4 className="font-semibold">Soal & Tugas</h4><div className="space-y-3 mt-2 max-h-[280px] overflow-y-auto pr-2">{tasks.map((task, index) => (<QuestionItem key={task.id || `q-${index}`} q={task} qIndex={index} onUpdate={updateTask} onRemove={() => removeTask(index)} />))}<button type="button" onClick={addTask} className="text-sm font-semibold text-sesm-deep mt-2"><FiPlus className="inline"/> Tambah Soal</button></div></div> </motion.div> );
            default:
                return null;
        }
    }

    if (!isOpen || !initialData) return null; // Pastikan initialData ada

    return (
        <>
             <Notification isOpen={notif.isOpen} onClose={() => setNotif({ ...notif, isOpen: false })} title={notif.title} message={notif.message} success={notif.success} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col">
                    <form onSubmit={handleSubmit}>
                        <header className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-sesm-deep">Edit Materi</h3>
                            <div className="flex items-center gap-4">
                                <SaveStatusIcon status={saveStatus} />
                                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                            </div>
                        </header>
                        <main className="p-6 flex gap-8 max-h-[70vh] overflow-y-auto"> {/* Tambah max-h dan overflow */}
                            <div className="w-1/3 border-r pr-6 space-y-6 pt-2 sticky top-0"> {/* Buat sidebar sticky */}
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
                                <button type="submit" disabled={isSaving} className="px-5 py-2 bg-sesm-deep text-white rounded-lg flex items-center gap-2 disabled:bg-gray-400">{isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                            )}
                        </footer>
                    </form>
                </motion.div>
            </motion.div>
        </>
    );
};

export default EditMaterialModal;