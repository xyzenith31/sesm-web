// contoh-sesm-web/components/admin/EditMaterialModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiSave, FiLoader, FiTrash2 } from 'react-icons/fi';
import DataService from '../../services/dataService'; // Impor DataService
import CustomSelect from '../ui/CustomSelect';
import useDebounce from '../../hooks/useDebounce'; // Impor useDebounce
import SaveStatusIcon from '../ui/SaveStatusIcon'; // Impor SaveStatusIcon
import Notification from '../ui/Notification'; // Impor Notification

// Komponen QuestionItem dan StepIndicator tetap sama ...
// ... (Kode QuestionItem dan StepIndicator disembunyikan untuk brevity) ...
// Helper untuk mengubah indeks menjadi huruf
const toAlpha = (num) => String.fromCharCode(65 + num);

const QuestionItem = ({ q, qIndex, onUpdate, onRemove }) => {
    // ... (Kode QuestionItem tidak berubah) ...
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

const StepIndicator = ({ stepNumber, label, isActive, onClick, isDisabled }) => (
    // ... (Kode StepIndicator tidak berubah) ...
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
        { value: 'Semua', label: 'Semua Jenjang' },
        { value: 'TK', label: 'TK' },
        { value: 'SD 1-2', label: 'SD Kelas 1-2' },
        { value: 'SD 3-4', label: 'SD Kelas 3-4' },
        { value: 'SD 5-6', label: 'SD Kelas 5-6' }
    ];

    const gradingTypeOptions = [
        { value: 'manual', label: 'Manual (Guru menilai)' },
        { value: 'otomatis', label: 'Otomatis (hanya PG)' },
    ];

    const getNewQuestionObject = () => ({ id: Date.now() + Math.random(), type: 'pilihan-ganda', question: '', options: ['', ''], correctAnswer: '', essayAnswer: '' });

    const saveDraftToBackend = useCallback(async () => {
        // ... (Fungsi saveDraftToBackend tidak berubah) ...
        if (!formData.title.trim() && !formData.subject.trim() && tasks.length === 0) {
            setSaveStatus('Tersimpan');
            return;
        }
        setSaveStatus('Menyimpan...');
        const draftData = { formData, tasks, mediaSourceType };
        try {
            await DataService.saveDraft(DRAFT_KEY, draftData);
            setSaveStatus('Tersimpan');
        } catch (error) {
            console.error("Gagal menyimpan draf (edit):", error);
            setSaveStatus('Gagal');
            setNotif({ isOpen: true, title: "Gagal Simpan Draf", message: "Gagal menyimpan draf otomatis.", success: false });
        }
    }, [formData, tasks, mediaSourceType, DRAFT_KEY]);

    useEffect(() => {
        if (isOpen && saveStatus !== 'Menyimpan...') {
            saveDraftToBackend();
        }
    }, [debouncedFormData, debouncedTasks, isOpen, saveDraftToBackend]); // Tambahkan saveDraftToBackend ke dependency

    // --- MODIFIED USEEFFECT ---
    useEffect(() => {
        const loadInitialData = (dataToLoad) => {
            setFormData({
                title: dataToLoad.title || '',
                description: dataToLoad.description || '',
                subject: dataToLoad.subject || '',
                url_link: dataToLoad.type === 'video_link' ? dataToLoad.url : '',
                grading_type: dataToLoad.grading_type || 'manual',
                recommended_level: dataToLoad.recommended_level || 'Semua'
            });
            // Pastikan tasks selalu array, parse jika perlu
             let parsedTasks = [];
             if (Array.isArray(dataToLoad.tasks)) {
                 parsedTasks = dataToLoad.tasks;
             } else if (typeof dataToLoad.tasks === 'string') {
                 try {
                     parsedTasks = JSON.parse(dataToLoad.tasks);
                 } catch (e) {
                     console.warn("Could not parse tasks from string:", dataToLoad.tasks);
                 }
             }
             // Map tasks to ensure structure consistency
             setTasks(parsedTasks.map(t => ({ ...getNewQuestionObject(), ...t })));

            const sourceType = dataToLoad.type === 'video_link' ? 'link' : 'file';
            setMediaSourceType(sourceType);
            setMainFilePreview(sourceType === 'file' && dataToLoad.url ? dataToLoad.url.split('/').pop() : '');
            setCoverImagePreview(dataToLoad.cover_image_url ? `${API_URL}/${dataToLoad.cover_image_url}` : '');
            setMainFile(null);
            setCoverImage(null);
        };

        if (isOpen && initialData) {
            setSaveStatus('Memuat...');
            DataService.getDraft(DRAFT_KEY)
                .then(response => {
                    const draftContent = response.data?.content;
                    if (draftContent) {
                        // Muat dari draf jika ada
                        loadInitialData({
                            ...initialData, // Use initialData as base
                            ...draftContent.formData, // Override with formData from draft
                            tasks: draftContent.tasks || initialData.tasks, // Use tasks from draft, fallback to initial
                            type: draftContent.mediaSourceType === 'link' ? 'video_link' : initialData.type, // Infer type from draft
                            // Keep original url and cover_image_url from initialData for previews
                        });
                        setMediaSourceType(draftContent.mediaSourceType || 'file');
                         setNotif({isOpen:true, title: "Info", message: "Melanjutkan draf terakhir.", success: true});
                    } else {
                        // Muat dari initialData jika tidak ada draf
                        loadInitialData(initialData);
                    }
                    setSaveStatus('Tersimpan');
                })
                .catch((error) => { // Handle 404 gracefully
                    if (error.response && error.response.status === 404) {
                        // Draft not found, load from initial data
                        loadInitialData(initialData);
                        setSaveStatus('Tersimpan');
                        console.log("Draft not found, loading initial data."); // Log this instead of error
                    } else {
                        // Other errors, load initial data as fallback
                        console.error("Error fetching draft:", error);
                        loadInitialData(initialData); // Fallback if getDraft fails for other reasons
                        setSaveStatus('Gagal Memuat Draf');
                         setNotif({isOpen:true, title: "Peringatan", message: "Gagal memuat draf terakhir, data asli ditampilkan.", success: false});
                    }
                });
        }
    }, [isOpen, initialData, DRAFT_KEY, API_URL]); // Dependencies remain the same
    // --- END OF MODIFIED USEEFFECT ---


    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMainFileChange = (e) => { const file = e.target.files[0]; if (file) { setMainFile(file); setMainFilePreview(file.name); setMediaSourceType('file'); setFormData(prev=>({...prev, url_link: ''})); } };
    const handleCoverImageChange = (e) => { const file = e.target.files[0]; if (file) { setCoverImage(file); setCoverImagePreview(URL.createObjectURL(file)); } };

    const updateTask = (index, updatedTask) => setTasks(prev => prev.map((task, i) => i === index ? updatedTask : task));
    const addTask = () => setTasks(prev => [...prev, getNewQuestionObject()]);
    const removeTask = (index) => setTasks(prev => prev.filter((_, i) => i !== index));

    const navigateToStep = (targetStep) => {
        // ... (Fungsi navigateToStep tidak berubah) ...
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

        // Append text fields from formData
        Object.keys(formData).forEach(key => data.append(key, formData[key]));

        // Append tasks as JSON string
        data.append('tasks', JSON.stringify(tasks));

        // Append files if they exist
        if (mainFile) data.append('mainFile', mainFile);
        if (coverImage) data.append('coverImage', coverImage);

        // Ensure url_link is deleted if mediaSourceType is 'file'
        if (mediaSourceType === 'file') {
            data.delete('url_link');
        } else {
            // If link type, ensure mainFile is not sent (even if user selected one then switched)
            data.delete('mainFile');
            // Ensure type is set correctly for link
            data.set('type', 'video_link');
        }

        try {
            await onSave(data, initialData.id); // Kirim ID untuk mode edit
            await DataService.deleteDraft(DRAFT_KEY); // Hapus draf setelah berhasil publish
            localStorage.removeItem(DRAFT_KEY); // Hapus juga dari local storage
        } catch (error) {
            // Error handling is delegated to the parent component (ManajemenBookmark)
            // Parent should display the notification based on the error thrown by onSave
            console.error("Error during save:", error);
            // Re-throw error so the parent knows it failed
             throw error;
        } finally {
            setIsSaving(false);
        }
    };



    const inputStyle = "w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal";
    const stepVariants = { hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } };

    const renderStepContent = () => {
        // ... (renderStepContent tidak berubah) ...
        switch(step) {
             case 1:
                return ( <motion.div key={1} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4"> <div><label className="font-semibold text-sm">Judul</label><input type="text" name="title" value={formData.title} onChange={handleFormChange} className={inputStyle} required /></div> <div><label className="font-semibold text-sm">Mapel</label><input type="text" name="subject" value={formData.subject} onChange={handleFormChange} className={inputStyle} required /></div> <div><label className="font-semibold text-sm">Disarankan Untuk</label><CustomSelect name="recommended_level" options={levelOptions} value={formData.recommended_level} onChange={(value) => setFormData(prev => ({...prev, recommended_level: value}))} /></div> <div><label className="font-semibold text-sm">Deskripsi</label><textarea name="description" value={formData.description} onChange={handleFormChange} className={`${inputStyle} h-24`}></textarea></div> </motion.div> );
            case 2:
                return ( <motion.div key={2} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4"> <div className="space-y-2"> <label className="font-semibold text-sm">Sumber Materi</label> <div className="flex gap-4"> <label className="flex items-center gap-2"><input type="radio" name="mediaSource" value="file" checked={mediaSourceType === 'file'} onChange={(e) => setMediaSourceType(e.target.value)} /> File</label> <label className="flex items-center gap-2"><input type="radio" name="mediaSource" value="link" checked={mediaSourceType === 'link'} onChange={(e) => setMediaSourceType(e.target.value)} /> Link Video</label> </div> </div> <AnimatePresence mode="wait"> <motion.div key={mediaSourceType} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4"> {mediaSourceType === 'file' ? ( <div><label className="font-semibold text-sm">Ganti File Utama (Opsional)</label><div className="border-2 border-dashed p-4 mt-1 rounded-lg text-center"><input type="file" id="main-upload-edit" className="hidden" onChange={handleMainFileChange} /><label htmlFor="main-upload-edit" className="cursor-pointer text-sesm-teal font-semibold flex flex-col items-center justify-center gap-1"><FiPlus /><span>{mainFilePreview || "Pilih file baru..."}</span></label></div></div> ) : ( <div><label className="font-semibold text-sm">Link Video</label><input type="url" name="url_link" value={formData.url_link} onChange={handleFormChange} className={inputStyle} placeholder="https://www.youtube.com/..." /></div> )} </motion.div> </AnimatePresence> <div><label className="font-semibold text-sm">Ganti Gambar Sampul (Opsional)</label><div className="border-2 border-dashed p-4 mt-1 rounded-lg text-center"><input type="file" id="cover-upload-edit" className="hidden" onChange={handleCoverImageChange} accept="image/*" /><label htmlFor="cover-upload-edit" className="cursor-pointer text-sesm-teal font-semibold flex flex-col items-center justify-center gap-1">{coverImagePreview ? <img src={coverImagePreview} alt="Preview" className="h-24 rounded-md mb-2 object-cover" /> : <FiPlus />}<span>{coverImage ? coverImage.name : "Pilih gambar baru..."}</span></label></div></div> </motion.div> );
            case 3:
                return ( <motion.div key={3} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-3"> <div><label className="font-semibold text-sm">Tipe Penilaian</label><CustomSelect name="grading_type" options={gradingTypeOptions} value={formData.grading_type} onChange={(value) => setFormData(prev => ({...prev, grading_type: value}))} /><p className="text-xs text-gray-500 mt-1">{formData.grading_type === 'otomatis' ? 'Jawaban esai tidak akan dinilai otomatis.' : 'Semua jenis soal akan dinilai manual oleh guru.'}</p></div> <div className="border-t pt-4"><h4 className="font-semibold">Soal & Tugas</h4><div className="space-y-3 mt-2 max-h-[280px] overflow-y-auto pr-2">{tasks.map((task, index) => (<QuestionItem key={task.id || `task-${index}`} q={task} qIndex={index} onUpdate={updateTask} onRemove={() => removeTask(index)} />))}<button type="button" onClick={addTask} className="text-sm font-semibold text-sesm-deep mt-2"><FiPlus className="inline"/> Tambah Soal</button></div></div> </motion.div> );
            default:
                return null;
        }
    }

    if (!isOpen) return null;

    return (
        <>
            <Notification isOpen={notif.isOpen} onClose={() => setNotif({ ...notif, isOpen: false })} title={notif.title} message={notif.message} success={notif.success} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col">
                    <form onSubmit={handleSubmit}>
                        <header className="p-6 border-b flex justify-between items-center">
                            <h3 className="text-xl font-bold text-sesm-deep">Edit Materi</h3>
                            <div className="flex items-center gap-4"> <SaveStatusIcon status={saveStatus} /> <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button> </div>
                        </header>
                        <main className="p-6 flex gap-8">
                             <div className="w-1/3 border-r pr-6 space-y-6 pt-2">
                                <StepIndicator stepNumber={1} label="Informasi Dasar" isActive={step === 1} onClick={() => navigateToStep(1)} />
                                <StepIndicator stepNumber={2} label="Media & Materi" isActive={step === 2} onClick={() => navigateToStep(2)} isDisabled={!formData.title.trim() || !formData.subject.trim()} />
                                <StepIndicator stepNumber={3} label="Soal & Tugas" isActive={step === 3} onClick={() => navigateToStep(3)} isDisabled={!formData.title.trim() || !formData.subject.trim()} />
                            </div>
                            <div className="w-2/3"> <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence> </div>
                        </main>
                        <footer className="bg-gray-50 p-4 flex justify-end items-center gap-3 rounded-b-2xl border-t">
                            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300">Batal</button>
                            {step < 3 ? ( <button type="button" onClick={() => navigateToStep(step + 1)} className="px-5 py-2 bg-sesm-teal text-white rounded-lg font-semibold hover:bg-opacity-90">Lanjutkan</button> ) : ( <button type="submit" disabled={isSaving} className="px-5 py-2 bg-sesm-deep text-white rounded-lg flex items-center gap-2 disabled:bg-gray-400">{isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</button> )}
                        </footer>
                    </form>
                </motion.div>
            </motion.div>
        </>
    );
};

export default EditMaterialModal;