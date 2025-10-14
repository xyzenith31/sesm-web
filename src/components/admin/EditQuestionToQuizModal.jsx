// contoh-sesm-web/components/admin/EditQuestionToQuizModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiPaperclip, FiLink, FiImage, FiFilm, FiMusic, FiFile, FiTrash2, FiPlus } from 'react-icons/fi';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};


const MediaPreview = ({ item, onRemove }) => {
    const getIcon = (url) => {
        const ext = url.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FiImage className="text-blue-500" size={24} />;
        if (['mp4', 'webm'].includes(ext)) return <FiFilm className="text-purple-500" size={24} />;
        if (['mp3', 'wav', 'ogg'].includes(ext)) return <FiMusic className="text-pink-500" size={24} />;
        return <FiFile className="text-gray-500" size={24} />;
    };
    
    return (
        <div className="bg-white border rounded-lg p-2 flex items-center gap-3">
            {item.type === 'link' ? <FiLink className="text-green-500" size={24} /> : getIcon(item.url)}
            <p className="text-sm font-medium text-gray-800 truncate flex-grow">{item.url}</p>
            <button type="button" onClick={onRemove} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100"><FiX size={16} /></button>
        </div>
    );
};

const EditQuestionToQuizModal = ({ isOpen, onClose, onSubmit, questionData }) => {
    const DRAFT_KEY = `edit_quiz_question_draft_${questionData?.id}`;
    const [question, setQuestion] = useState(null);
    const [isLinkInputVisible, setLinkInputVisible] = useState(false);
    const [linkValue, setLinkValue] = useState('');

    // Fungsi untuk menyimpan draft
    const saveDraft = (data) => {
        if (!data) return;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    };

    // Debounce untuk autosave
    const debouncedQuestion = useDebounce(question, 1500);
    useEffect(() => {
        if (isOpen) {
            saveDraft(debouncedQuestion);
        }
    }, [debouncedQuestion, isOpen]);


    useEffect(() => {
        if (questionData) {
            const savedDraft = localStorage.getItem(DRAFT_KEY);
            if (savedDraft) {
                setQuestion(JSON.parse(savedDraft));
            } else {
                const options = Array.isArray(questionData.options) ? questionData.options : [];
                const correctAnswer = options.find(opt => opt.is_correct)?.option_text || '';

                setQuestion({
                    id: questionData.id,
                    question: questionData.question_text,
                    type: questionData.question_type || 'pilihan-ganda',
                    options: options.length > 0 ? options.map(opt => opt.option_text) : ['', ''],
                    correctAnswer: correctAnswer,
                    essayAnswer: questionData.correct_essay_answer || '',
                    media: questionData.media_attachments || [],
                });
            }
            setLinkInputVisible(false);
            setLinkValue('');
        }
    }, [questionData, isOpen]);
    
    if (!isOpen || !question) return null;

    const handleUpdate = (field, value) => setQuestion(prev => ({ ...prev, [field]: value }));
    const handleOptionChange = (index, value) => {
        const newOptions = [...question.options];
        const oldOption = newOptions[index];
        newOptions[index] = value;
        if(question.correctAnswer === oldOption) {
            handleUpdate('correctAnswer', value)
        }
        handleUpdate('options', newOptions);
    };
    const addOption = () => handleUpdate('options', [...question.options, '']);
    const removeOption = (index) => {
        const optionToRemove = question.options[index];
        const newOptions = question.options.filter((_, i) => i !== index)
        if(question.correctAnswer === optionToRemove){
             handleUpdate('correctAnswer', '');
        }
        handleUpdate('options', newOptions)
    };
    
    const handleAddLink = () => {
        if (!linkValue.startsWith('http')) { alert('URL tidak valid.'); return; }
        const newLink = { type: 'link', url: linkValue };
        handleUpdate('media', [...question.media, newLink]);
        setLinkValue('');
        setLinkInputVisible(false);
    };

    const handleSaveDraft = () => {
        saveDraft(question);
        alert('Perubahan disimpan sebagai draf!');
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(question.id, question);
        localStorage.removeItem(DRAFT_KEY);
    };

    return (
        <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold text-sesm-deep">Edit Soal</h3>
                        <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX/></button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <select value={question.type} onChange={(e) => handleUpdate('type', e.target.value)} className="w-full p-2 border rounded-md bg-gray-50">
                            <option value="pilihan-ganda">Pilihan Ganda</option>
                            <option value="esai">Esai</option>
                            <option value="pilihan-ganda-esai">Pilihan Ganda & Esai</option>
                        </select>
                        <div>
                            <label className="font-semibold text-sm mb-1 block">Teks Pertanyaan</label>
                            <textarea value={question.question} onChange={(e) => handleUpdate('question', e.target.value)} className="w-full p-2 border rounded-md h-24" required />
                        </div>
                        
                        <div>
                            <label className="font-semibold text-sm mb-1 block">Lampiran Media</label>
                             <div className="flex items-center gap-2 mb-2">
                                <button type="button" onClick={() => setLinkInputVisible(v => !v)} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                                    <FiLink /> {isLinkInputVisible ? 'Batal' : 'Tambah Link'}
                                </button>
                            </div>
                            {isLinkInputVisible && (
                                <div className="flex gap-2 items-center mb-2">
                                    <input type="url" placeholder="https://www.youtube.com/..." value={linkValue} onChange={(e) => setLinkValue(e.target.value)} className="w-full p-2 border rounded-md" />
                                    <button type="button" onClick={handleAddLink} className="px-3 py-2 bg-sesm-teal text-white rounded-md text-sm font-semibold">Simpan</button>
                                </div>
                            )}
                            {question.media.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md bg-gray-100">
                                    {question.media.map((item, index) => <MediaPreview key={index} item={item} onRemove={() => handleUpdate('media', question.media.filter((_, i) => i !== index))} />)}
                                </div>
                            )}
                        </div>
                        
                        {(question.type.includes('pilihan-ganda')) && (
                            <fieldset className="border p-3 rounded-md space-y-2">
                                <legend className="text-sm font-semibold text-gray-600 px-1">Opsi Jawaban</legend>
                                {question.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <input type="text" value={opt} onChange={(e) => handleOptionChange(oIndex, e.target.value)} className="w-full p-2 border rounded-md" required/>
                                        <button type="button" onClick={() => removeOption(oIndex)} disabled={question.options.length <= 2} className="p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300"><FiTrash2/></button>
                                    </div>
                                ))}
                                <button type="button" onClick={addOption} className="text-sm font-semibold flex items-center gap-1 px-3 py-1 bg-gray-100 border rounded-md hover:bg-gray-200"><FiPlus size={16}/> Tambah Opsi</button>
                                <select value={question.correctAnswer} onChange={(e) => handleUpdate('correctAnswer', e.target.value)} className="w-full p-2 border rounded-md mt-2 bg-white" required>
                                    <option value="" disabled>-- Pilih Jawaban Benar --</option>
                                    {question.options.filter(opt => opt && opt.trim() !== '').map((opt, oIndex) => (<option key={oIndex} value={opt}>{opt}</option>))}
                                </select>
                            </fieldset>
                        )}

                        {(question.type.includes('esai')) && (
                            <fieldset className="border p-3 rounded-md">
                                <legend className="text-sm font-semibold text-gray-600 px-1">Kunci Jawaban Esai</legend>
                                <input
                                    type="text"
                                    value={question.essayAnswer}
                                    onChange={(e) => handleUpdate('essayAnswer', e.target.value)}
                                    placeholder="Kunci Jawaban Esai (opsional)"
                                    className="w-full p-2 border rounded-md"
                                />
                            </fieldset>
                        )}

                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200">Batal</button>
                        <button type="button" onClick={handleSaveDraft} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">Simpan Sementara</button>
                        <button type="submit" className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 flex items-center gap-2"><FiSave /> Simpan Perubahan</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditQuestionToQuizModal;