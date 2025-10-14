// contoh-sesm-web/components/admin/AddQuestionToQuizModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiPaperclip, FiImage, FiFilm, FiMusic, FiFile, FiX, FiLink } from 'react-icons/fi';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const MediaPreview = ({ item, onRemove }) => {
    const getIcon = (file) => {
        if (file.type.startsWith('image/')) return <FiImage className="text-blue-500" size={24} />;
        if (file.type.startsWith('video/')) return <FiFilm className="text-purple-500" size={24} />;
        if (file.type.startsWith('audio/')) return <FiMusic className="text-pink-500" size={24} />;
        return <FiFile className="text-gray-500" size={24} />;
    };
    return (
        <div className="bg-white border rounded-lg p-2 flex items-center gap-3">
            {item.type === 'link' ? <FiLink className="text-green-500" size={24} /> : getIcon(item.file)}
            <div className="flex-grow overflow-hidden">
                <p className="text-sm font-medium text-gray-800 truncate">{item.type === 'link' ? item.url : item.file.name}</p>
                {item.type === 'file' && <p className="text-xs text-gray-500">{(item.file.size / 1024).toFixed(1)} KB</p>}
            </div>
            <button type="button" onClick={onRemove} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100">
                <FiX size={16} />
            </button>
        </div>
    );
};

const getNewQuestion = () => ({
    id: Date.now() + Math.random(),
    question: '',
    type: 'pilihan-ganda',
    options: ['', ''],
    correctAnswer: '',
    essayAnswer: '',
    media: [],
});

const QuestionForm = ({ question, index, onUpdate, onRemove }) => {
    const [isLinkInputVisible, setLinkInputVisible] = useState(false);
    const [linkValue, setLinkValue] = useState('');

    const handleInputChange = (field, value) => onUpdate(index, { ...question, [field]: value });
    const handleOptionChange = (optIndex, value) => {
        const newOptions = [...question.options];
        newOptions[optIndex] = value;
        onUpdate(index, { ...question, options: newOptions });
    };
    const addOption = () => onUpdate(index, { ...question, options: [...question.options, ''] });
    const removeOption = (optIndex) => {
        const newOptions = question.options.filter((_, i) => i !== optIndex);
        onUpdate(index, { ...question, options: newOptions });
    };
    const handleMediaUpload = (e) => {
        const files = Array.from(e.target.files);
        const newMedia = files.map(file => ({ type: 'file', file, id: Math.random() }));
        onUpdate(index, { ...question, media: [...question.media, ...newMedia] });
    };
    const handleAddLink = () => {
        if (linkValue.trim() === '' || !linkValue.startsWith('http')) {
            alert('URL tidak valid. Pastikan dimulai dengan http:// atau https://');
            return;
        }
        const newLink = { type: 'link', url: linkValue, id: Math.random() };
        onUpdate(index, { ...question, media: [...question.media, newLink] });
        setLinkValue('');
        setLinkInputVisible(false);
    };
    const removeMediaItem = (itemId) => {
        const newMedia = question.media.filter(item => item.id !== itemId);
        onUpdate(index, { ...question, media: newMedia });
    };

    return (
        <div className="bg-white p-5 rounded-xl border shadow-sm relative">
            <button type="button" onClick={() => onRemove(index)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-700" title="Hapus Soal Ini">
                <FiX size={16} />
            </button>
            <div className="flex-grow space-y-4">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-gray-700">{index + 1}.</span>
                    <select value={question.type} onChange={(e) => handleInputChange('type', e.target.value)} className="p-2 border rounded-md bg-gray-50">
                        <option value="pilihan-ganda">Pilihan Ganda</option>
                        <option value="esai">Esai</option>
                        <option value="pilihan-ganda-esai">Pilihan Ganda & Esai</option>
                    </select>
                </div>
                <textarea value={question.question} onChange={(e) => handleInputChange('question', e.target.value)} placeholder="Tulis pertanyaan..." className="w-full p-2 border rounded-md h-24" required />
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 cursor-pointer">
                            <FiPaperclip /> Lampirkan File
                            <input type="file" multiple onChange={handleMediaUpload} className="hidden" />
                        </label>
                        <button type="button" onClick={() => setLinkInputVisible(v => !v)} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                            <FiLink /> Lampirkan Link
                        </button>
                    </div>
                    <AnimatePresence>
                        {isLinkInputVisible && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex gap-2 items-center">
                                <input type="url" placeholder="https://www.youtube.com/..." value={linkValue} onChange={(e) => setLinkValue(e.target.value)} className="w-full p-2 border rounded-md" />
                                <button type="button" onClick={handleAddLink} className="px-3 py-2 bg-sesm-teal text-white rounded-md text-sm font-semibold">Simpan</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {question.media.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md bg-gray-100">
                            {question.media.map(item => <MediaPreview key={item.id} item={item} onRemove={() => removeMediaItem(item.id)} />)}
                        </div>
                    )}
                </div>

                {(question.type === 'pilihan-ganda' || question.type === 'pilihan-ganda-esai') && (
                    <fieldset className="border p-3 rounded-md space-y-2">
                        <legend className="text-sm font-semibold text-gray-600 px-1">Opsi Pilihan Ganda</legend>
                        {question.options.map((opt, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                                <input type="text" value={opt} onChange={(e) => handleOptionChange(oIndex, e.target.value)} placeholder={`Pilihan ${oIndex + 1}`} className="w-full p-2 border rounded-md" required />
                                <button type="button" onClick={() => removeOption(oIndex)} disabled={question.options.length <= 2} className="p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300">
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addOption} className="text-sm font-semibold flex items-center gap-1 px-3 py-1 bg-gray-100 border rounded-md hover:bg-gray-200">
                            <FiPlus size={16} /> Tambah Opsi
                        </button>
                        <select value={question.correctAnswer} onChange={(e) => handleInputChange('correctAnswer', e.target.value)} className="w-full p-2 border rounded-md mt-2 bg-white" required>
                            <option value="" disabled>-- Pilih Jawaban Benar --</option>
                            {question.options.filter(opt => opt.trim() !== '').map((opt, oIndex) => (
                                <option key={oIndex} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </fieldset>
                )}

                {(question.type === 'esai' || question.type === 'pilihan-ganda-esai') && (
                    <fieldset className="border p-3 rounded-md">
                        <legend className="text-sm font-semibold text-gray-600 px-1">Kunci Jawaban Esai</legend>
                        <input
                            type="text"
                            value={question.essayAnswer}
                            onChange={(e) => handleInputChange('essayAnswer', e.target.value)}
                            placeholder="Kunci Jawaban Esai (opsional)"
                            className="w-full p-2 border rounded-md"
                        />
                    </fieldset>
                )}
            </div>
        </div>
    );
};


const AddQuestionToQuizModal = ({ isOpen, onClose, onSubmit, quizId }) => {
    const DRAFT_KEY = `quiz_question_draft_${quizId}`;
    const [questions, setQuestions] = useState([getNewQuestion()]);
    
    // Fungsi untuk menyimpan draft
    const saveDraft = (data) => {
        const draftToSave = {
            lastSaved: new Date().toISOString(),
            questions: data.map(({ media, ...rest }) => rest)
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
    };
    
    // Debounce untuk autosave
    const debouncedQuestions = useDebounce(questions, 1500);
    useEffect(() => {
        if (isOpen && debouncedQuestions.length > 0 && debouncedQuestions.some(q => q.question.trim() !== '')) {
            saveDraft(debouncedQuestions);
        }
    }, [debouncedQuestions, DRAFT_KEY, isOpen]);

    // Memuat draft saat modal dibuka
    useEffect(() => {
        if (isOpen) {
            try {
                const savedDraft = localStorage.getItem(DRAFT_KEY);
                if (savedDraft) {
                    const parsedDraft = JSON.parse(savedDraft);
                    if (parsedDraft.questions && parsedDraft.questions.length > 0) {
                        setQuestions(parsedDraft.questions.map(q => ({ ...getNewQuestion(), ...q, media: [] })));
                    } else {
                        setQuestions([getNewQuestion()]);
                    }
                } else {
                    setQuestions([getNewQuestion()]);
                }
            } catch (error) {
                console.error("Gagal memuat draf soal kuis:", error);
                setQuestions([getNewQuestion()]);
            }
        }
    }, [isOpen, quizId]);
    
    const handleUpdateQuestion = (index, updatedQuestion) => {
        setQuestions(prev => prev.map((q, i) => i === index ? updatedQuestion : q));
    };
    const handleAddQuestionField = () => setQuestions(prev => [...prev, getNewQuestion()]);
    const handleRemoveQuestionField = (index) => {
        if (questions.length > 1) {
            setQuestions(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleSaveDraft = () => {
        if (questions.length === 0 || questions.every(q => q.question.trim() === '')) {
            alert('Tidak ada soal untuk disimpan.');
            return;
        }
        saveDraft(questions);
        alert('Draf berhasil disimpan!');
        onClose();
    };

    const handleSubmit = (e) => { e.preventDefault(); onSubmit(quizId, questions); localStorage.removeItem(DRAFT_KEY); onClose(); };

    if (!isOpen) return null;

    return (
        <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col h-[90vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-bold text-sesm-deep">Tambah Soal Baru ke Kuis</h3>
                        <p className="text-sm text-gray-500">Perubahan akan disimpan otomatis sebagai draf.</p>
                    </div>
                    <div className="p-6 space-y-6 flex-grow overflow-y-auto bg-gray-50/50">
                        {questions.map((q, qIndex) => (
                            <QuestionForm key={q.id} question={q} index={qIndex} onUpdate={handleUpdateQuestion} onRemove={handleRemoveQuestionField} />
                        ))}
                        <button type="button" onClick={handleAddQuestionField} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded-lg text-sesm-deep hover:bg-sesm-teal/10">
                            <FiPlus/> Tambah Soal Lagi
                        </button>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-between items-center rounded-b-2xl border-t">
                        <span className="text-sm text-gray-600 font-semibold">Total: {questions.length} soal</span>
                        <div>
                            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 mr-2">Batal</button>
                            <button type="button" onClick={handleSaveDraft} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 mr-3">Simpan Sementara</button>
                            <button type="submit" className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90">Publish Soal</button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default AddQuestionToQuizModal;