// contoh-sesm-web/components/admin/AddMaterialModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiSave, FiLoader, FiTrash2 } from 'react-icons/fi';
import DataService from '../../services/dataService';

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

const StepIndicator = ({ stepNumber, label, isActive, onClick, isDisabled }) => (
    <button type="button" onClick={onClick} disabled={isDisabled} className="flex items-center gap-4 w-full text-left disabled:cursor-not-allowed group">
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold border-2 transition-all duration-300 ${isActive ? 'bg-sesm-deep text-white border-sesm-deep' : 'bg-gray-200 text-gray-500 border-gray-200 group-hover:border-sesm-teal disabled:group-hover:border-gray-200'}`}>
            {stepNumber}
        </div>
        <span className={`font-semibold transition-colors duration-300 ${isActive ? 'text-sesm-deep' : 'text-gray-500 group-hover:text-sesm-deep disabled:group-hover:text-gray-500'}`}>{label}</span>
    </button>
);


const AddMaterialModal = ({ isOpen, onClose, onSave, initialDraft }) => {
    const DRAFT_KEY = useMemo(() => `bookmark_draft_${initialDraft?.draft_key || 'new'}`, [initialDraft]);
    
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ title: '', description: '', subject: '', url_link: '', grading_type: 'manual', recommended_level: 'Semua' });
    const [tasks, setTasks] = useState([]);
    const [mainFile, setMainFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [mainFilePreview, setMainFilePreview] = useState('');
    const [coverImagePreview, setCoverImagePreview] = useState('');
    const [mediaSourceType, setMediaSourceType] = useState('file');

    const getNewQuestionObject = () => ({ id: Date.now() + Math.random(), type: 'pilihan-ganda', question: '', options: ['', ''], correctAnswer: '', essayAnswer: '' });

    useEffect(() => {
        if (isOpen) {
            const draftContent = initialDraft?.content;
            if (draftContent) {
                setFormData(draftContent.formData || { title: '', description: '', subject: '', url_link: '', grading_type: 'manual', recommended_level: 'Semua' });
                setTasks(draftContent.tasks || []);
                setMediaSourceType(draftContent.mediaSourceType || 'file');
            } else {
                setFormData({ title: '', description: '', subject: '', url_link: '', grading_type: 'manual', recommended_level: 'Semua' });
                setTasks([]);
                setMediaSourceType('file');
            }
        }
    }, [isOpen, initialDraft]);

    // PERBAIKAN: Hapus `useDebounce` dan simpan setiap ada perubahan `formData` atau `tasks`
    useEffect(() => {
        if (isOpen && (formData.title.trim() || tasks.length > 0 || formData.subject.trim() || formData.description.trim())) {
            const draftData = { formData, tasks, mediaSourceType };
            DataService.saveDraft(DRAFT_KEY, draftData).catch(err => console.error("Autosave failed:", err));
        }
    }, [formData, tasks, mediaSourceType, isOpen, DRAFT_KEY]);
    
    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMainFileChange = (e) => { const file = e.target.files[0]; if (file) { setMainFile(file); setMainFilePreview(file.name); } };
    const handleCoverImageChange = (e) => { const file = e.target.files[0]; if (file) { setCoverImage(file); setCoverImagePreview(URL.createObjectURL(file)); } };
    
    const updateTask = (index, updatedTask) => setTasks(prev => prev.map((task, i) => i === index ? updatedTask : task));
    const addTask = () => setTasks(prev => [...prev, getNewQuestionObject()]);
    const removeTask = (index) => setTasks(prev => prev.filter((_, i) => i !== index));

    const navigateToStep = (targetStep) => {
        if (targetStep > 1 && (!formData.title.trim() || !formData.subject.trim())) {
            alert("Judul dan Mapel wajib diisi sebelum melanjutkan.");
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
        if (mediaSourceType === 'file') data.delete('url_link');
        
        try {
            await onSave(data);
            DataService.deleteDraft(DRAFT_KEY).catch(err => console.warn("Failed to delete server draft:", err));
        } catch (error) {
            // Error handling is in parent
        } finally {
            setIsSaving(false);
        }
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
                return ( <motion.div key={3} variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-3"> <div><label className="font-semibold text-sm">Tipe Penilaian</label><select name="grading_type" value={formData.grading_type} onChange={handleFormChange} className={`${inputStyle} mt-1`}><option value="manual">Manual (Guru menilai)</option><option value="otomatis">Otomatis (hanya PG)</option></select><p className="text-xs text-gray-500 mt-1">{formData.grading_type === 'otomatis' ? 'Jawaban esai tidak akan dinilai otomatis.' : 'Semua jenis soal akan dinilai manual oleh guru.'}</p></div> <div className="border-t pt-4"><h4 className="font-semibold">Soal & Tugas</h4><div className="space-y-3 mt-2 max-h-[280px] overflow-y-auto pr-2">{tasks.map((task, index) => (<QuestionItem key={task.id} q={task} qIndex={index} onUpdate={updateTask} onRemove={() => removeTask(index)} />))}<button type="button" onClick={addTask} className="text-sm font-semibold text-sesm-deep mt-2"><FiPlus className="inline"/> Tambah Soal</button></div></div> </motion.div> );
            default:
                return null;
        }
    }

    if (!isOpen) return null;

    return (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col">
                <form onSubmit={handleSubmit}>
                    <header className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold text-sesm-deep">Tambah Materi Baru</h3>
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

export default AddMaterialModal;