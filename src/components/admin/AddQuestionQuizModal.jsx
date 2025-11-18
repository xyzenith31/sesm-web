import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiPaperclip, FiImage, FiFilm, FiMusic, FiFile, FiX, FiLink, FiType } from 'react-icons/fi';
import DataService from '../../services/dataService';
import CustomSelect from '../ui/CustomSelect';
import useDebounce from '../../hooks/useDebounce';
import SaveStatusIcon from '../ui/SaveStatusIcon';
import Notification from '../ui/Notification';

const toAlpha = (num) => String.fromCharCode(65 + num);

const MediaPreview = ({ item, onRemove }) => {
    const getIcon = (file) => {
        if (!file || !file.type) return <FiFile className="text-gray-500" size={24} />;
        if (file.type.startsWith('image/')) return <FiImage className="text-blue-500" size={24} />;
        if (file.type.startsWith('video/')) return <FiFilm className="text-purple-500" size={24} />;
        if (file.type.startsWith('audio/')) return <FiMusic className="text-pink-500" size={24} />;
        return <FiFile className="text-gray-500" size={24} />;
    };
    const fileName = item.type === 'file' && item.file ? item.file.name : item.url;
    const fileSize = item.type === 'file' && item.file ? (item.file.size / 1024).toFixed(1) + ' KB' : '';

    return (
        <div className="bg-white border rounded-lg p-2 flex items-center gap-3">
            {item.type === 'link' ? <FiLink className="text-green-500" size={24} /> : getIcon(item.file)}
            <div className="flex-grow overflow-hidden">
                <p className="text-sm font-medium text-gray-800 truncate">{fileName}</p>
                {fileSize && <p className="text-xs text-gray-500">{fileSize}</p>}
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

    const questionTypeOptions = [
        { value: 'pilihan-ganda', label: 'Pilihan Ganda' },
        { value: 'esai', label: 'Esai' },
        { value: 'pilihan-ganda-esai', label: 'Pilihan Ganda & Esai' }
    ];

    const handleInputChange = (field, value) => onUpdate(index, { ...question, [field]: value });
    const handleOptionChange = (optIndex, value) => {
        const newOptions = [...question.options];
        const oldOptionValue = newOptions[optIndex];
        newOptions[optIndex] = value;
        if (question.correctAnswer === oldOptionValue) {
            handleInputChange('correctAnswer', value);
        }
        onUpdate(index, { ...question, options: newOptions });
    };
    const addOption = () => onUpdate(index, { ...question, options: [...question.options, ''] });
    const removeOption = (optIndex) => {
        if (question.options.length <= 2) return;
        const optionToRemove = question.options[optIndex];
        const newOptions = question.options.filter((_, i) => i !== optIndex);
        if (question.correctAnswer === optionToRemove) {
            handleInputChange('correctAnswer', '');
        }
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
                    <CustomSelect
                        options={questionTypeOptions}
                        value={question.type}
                        onChange={(value) => handleInputChange('type', value)}
                    />
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
                                <span className="font-bold text-gray-600">{toAlpha(oIndex)}.</span>
                                <input type="text" value={opt} onChange={(e) => handleOptionChange(oIndex, e.target.value)} placeholder={`Pilihan ${toAlpha(oIndex)}`} className="w-full p-2 border rounded-md" required />
                                <button type="button" onClick={() => removeOption(oIndex)} disabled={question.options.length <= 2} className="p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300">
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                        <button type="button" onClick={addOption} className="text-sm font-semibold flex items-center gap-1 px-3 py-1 bg-gray-100 border rounded-md hover:bg-gray-200">
                            <FiPlus size={16} /> Tambah Opsi
                        </button>
                        <CustomSelect
                            options={question.options.filter(opt => opt.trim() !== '').map((opt, index) => ({ value: opt, label: `${toAlpha(index)}. ${opt}` }))}
                            value={question.correctAnswer}
                            onChange={(value) => handleInputChange('correctAnswer', value)}
                            placeholder="-- Pilih Jawaban Benar --"
                        />
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


const AddQuestionQuizModal = ({ isOpen, onClose, onSubmit, quizId }) => {
    const DRAFT_KEY = `quiz_${quizId}`;
    const [questions, setQuestions] = useState([getNewQuestion()]);
    const [saveStatus, setSaveStatus] = useState('Tersimpan');
    const debouncedQuestions = useDebounce(questions, 200);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });


    const saveDraft = useCallback(async (data) => {
        if (!data || (data.length === 1 && data[0].question.trim() === '' && data[0].media.length === 0)) {
            setSaveStatus('Tersimpan');
            return;
        }
        setSaveStatus('Menyimpan...');
        try {
            const serializableData = data.map(({ media, ...rest }) => ({
                ...rest,
                media: media.filter(m => m.type === 'link')
            }));
            await DataService.saveDraft(DRAFT_KEY, serializableData);
            setSaveStatus('Tersimpan');
        } catch (error) {
            console.error("Gagal menyimpan draf kuis:", error);
            setSaveStatus('Gagal');
        }
    }, [DRAFT_KEY]);

    useEffect(() => {
        if (isOpen) {
            saveDraft(debouncedQuestions);
        }
    }, [debouncedQuestions, isOpen, saveDraft]);

    useEffect(() => {
        if (isOpen) {
            setSaveStatus('Memuat...');
            DataService.getDraft(DRAFT_KEY)
                .then(response => {
                    if (response.data && response.data.content && response.data.content.length > 0) {
                        setQuestions(response.data.content.map(q => ({
                             ...getNewQuestion(),
                             ...q,
                             media: (q.media || []).map(link => ({...link, id: Math.random()})) 
                         })));
                    } else {
                        setQuestions([getNewQuestion()]);
                    }
                })
                .catch(() => {
                    setQuestions([getNewQuestion()]);
                })
                .finally(() => setSaveStatus('Tersimpan'));
        } else {
             setQuestions([]);
             setNotif({ isOpen: false, message: '', success: true, title: '' });
        }
    }, [isOpen, DRAFT_KEY]);

    const handleUpdateQuestion = (index, updatedQuestion) => {
        setQuestions(prev => prev.map((q, i) => i === index ? updatedQuestion : q));
    };
    const handleAddQuestionField = () => setQuestions(prev => [...prev, getNewQuestion()]);
    const handleRemoveQuestionField = (index) => {
        if (questions.length > 1) { 
            setQuestions(prev => prev.filter((_, i) => i !== index));
        } else {
            setQuestions([getNewQuestion()]);
        }
    };

    const handleSaveAndClose = () => {
        saveDraft(questions);
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if ((q.type === 'pilihan-ganda' || q.type === 'pilihan-ganda-esai') && (!q.correctAnswer || q.correctAnswer.trim() === '')) {
                setNotif({
                    isOpen: true,
                    title: "Validasi Gagal",
                    message: `Soal nomor ${i + 1} (${q.type}) belum memiliki jawaban benar. Silakan pilih jawaban yang benar.`,
                    success: false
                });
                return; 
            }
        }

        onSubmit(quizId, questions);
        DataService.deleteDraft(DRAFT_KEY).catch(err => console.error("Gagal menghapus draf kuis:", err));
        onClose();
    };

    const handleCloseNotif = () => setNotif({ ...notif, isOpen: false });


    if (!isOpen) return null;

    return (
         <>
            <Notification
                isOpen={notif.isOpen}
                onClose={handleCloseNotif}
                title={notif.title}
                message={notif.message}
                success={notif.success}
            />
            <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col h-[90vh]">
                    <form onSubmit={handleSubmit} className="flex flex-col h-full">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-sesm-deep">Tambah Soal Baru ke Kuis</h3>
                                <p className="text-sm text-gray-500">Perubahan akan disimpan otomatis sebagai draf.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <SaveStatusIcon status={saveStatus} />
                                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                            </div>
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
                                <button type="button" onClick={handleSaveAndClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 mr-3">Simpan & Tutup</button>
                                <button type="submit" className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90">Publish Soal</button>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </>
    );
};

export default AddQuestionQuizModal;