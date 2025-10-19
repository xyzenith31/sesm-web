import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPlus, FiTrash2, FiPaperclip, FiX, FiLink, FiType, FiSave, FiLoader,
    FiImage, FiFilm, FiMusic, FiFile
} from 'react-icons/fi';
import DataService from '../../services/dataService';
import CustomSelect from '../ui/CustomSelect';
import useDebounce from '../../hooks/useDebounce';
import SaveStatusIcon from '../ui/SaveStatusIcon';

const MediaPreview = ({ item, onRemove }) => {
    const getIcon = () => {
        if (item.type === 'link') return <FiLink className="text-green-500" size={24} />;
        if (item.type === 'text') return <FiType className="text-gray-600" size={24} />;
        
        const nameOrUrl = item.type === 'new-file' ? item.file.name : item.url;
        
        if (!nameOrUrl) return <FiFile className="text-gray-500" size={24} />;

        const ext = nameOrUrl.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FiImage className="text-blue-500" size={24} />;
        if (['mp4', 'webm'].includes(ext)) return <FiFilm className="text-purple-500" size={24} />;
        if (['mp3', 'wav', 'ogg'].includes(ext)) return <FiMusic className="text-pink-500" size={24} />;
        
        return <FiFile className="text-gray-500" size={24} />;
    };

    const getDisplayText = () => {
        switch (item.type) {
            case 'link': return item.url;
            case 'text': return item.content;
            case 'new-file': return item.file.name;
            default:
                return item.url ? item.url.split('/').pop() : 'File tidak dikenal';
        }
    };

    return (
        <div className="bg-white border rounded-lg p-2 flex items-center gap-3">
            {getIcon()}
            <div className="flex-grow overflow-hidden">
                <p className="text-sm font-medium text-gray-800 truncate">{getDisplayText()}</p>
            </div>
            <button type="button" onClick={onRemove} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100"><FiX size={16} /></button>
        </div>
    );
};


const EditQuestionModal = ({ isOpen, onClose, onSubmit, questionData }) => {
    const DRAFT_KEY = useMemo(() => `edit_question_draft_${questionData?.id}`, [questionData]);
    const [question, setQuestion] = useState(null);
    const [linkInputVisible, setLinkInputVisible] = useState(false);
    const [textInputVisible, setTextInputVisible] = useState(false);
    const [linkValue, setLinkValue] = useState('');
    const [textValue, setTextValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // State untuk auto-save
    const [saveStatus, setSaveStatus] = useState('Tersimpan');
    const debouncedQuestion = useDebounce(question, 1500);

    const saveDraftToBackend = useCallback(async (draftData) => {
        if (!draftData) return;
        setSaveStatus('Menyimpan...');
        try {
            // Hapus file object sebelum serialisasi
            const serializableData = {
                ...draftData,
                attachments: draftData.attachments.map(({ file, ...rest }) => rest)
            };
            await DataService.saveDraft(DRAFT_KEY, serializableData);
            setSaveStatus('Tersimpan');
        } catch (error) {
            console.error("Gagal menyimpan draf:", error);
            setSaveStatus('Gagal');
        }
    }, [DRAFT_KEY]);

    useEffect(() => {
        if (isOpen && question) { // Pastikan question tidak null
            saveDraftToBackend(debouncedQuestion);
        }
    }, [debouncedQuestion, isOpen, saveDraftToBackend, question]);

    useEffect(() => {
        if (isOpen && questionData) {
            DataService.getDraft(DRAFT_KEY)
                .then(response => {
                    const draftContent = response.data?.content;
                    if (draftContent) {
                        setQuestion(draftContent);
                    } else {
                        // Inisialisasi dari props jika tidak ada draf
                        const initialAttachments = (questionData.media_urls || []).map(item => ({ id: Math.random(), ...item }));
                        setQuestion({
                            id: questionData.id,
                            type: questionData.tipe_soal,
                            question: questionData.pertanyaan,
                            options: questionData.options || ['', ''],
                            correctAnswer: questionData.correctAnswer || '',
                            essayAnswer: questionData.jawaban_esai || '',
                            attachments: initialAttachments
                        });
                    }
                })
                .catch(() => {
                    // Fallback jika fetch draft gagal
                    const initialAttachments = (questionData.media_urls || []).map(item => ({ id: Math.random(), ...item }));
                    setQuestion({
                        id: questionData.id,
                        type: questionData.tipe_soal,
                        question: questionData.pertanyaan,
                        options: questionData.options || ['', ''],
                        correctAnswer: questionData.correctAnswer || '',
                        essayAnswer: questionData.jawaban_esai || '',
                        attachments: initialAttachments
                    });
                });
            
            setLinkValue('');
            setTextValue('');
            setLinkInputVisible(false);
            setTextInputVisible(false);
        }
    }, [questionData, isOpen, DRAFT_KEY]);


    if (!isOpen || !question) return null;

    const handleUpdate = (field, value) => setQuestion(prev => ({ ...prev, [field]: value }));
    const handleOptionChange = (index, value) => {
        const newOptions = [...question.options];
        const oldOptionValue = newOptions[index];
        newOptions[index] = value;
        if (question.correctAnswer === oldOptionValue) {
            handleUpdate('correctAnswer', value);
        }
        handleUpdate('options', newOptions);
    };
    const addOption = () => handleUpdate('options', [...question.options, '']);
    const removeOption = (index) => {
        if (question.options.length <= 2) return;
        const optionToRemove = question.options[index];
        const newOptions = question.options.filter((_, i) => i !== index);
        if (question.correctAnswer === optionToRemove) {
            handleUpdate('correctAnswer', '');
        }
        handleUpdate('options', newOptions);
    };
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newFileAttachments = files.map(file => ({ id: Math.random(), type: 'new-file', file }));
        handleUpdate('attachments', [...question.attachments, ...newFileAttachments]);
    };
    const handleAddLink = () => {
        if (!linkValue.startsWith('http')) { alert('URL tidak valid'); return; }
        const newLink = { id: Math.random(), type: 'link', url: linkValue };
        handleUpdate('attachments', [...question.attachments, newLink]);
        setLinkValue('');
        setLinkInputVisible(false);
    };
    const handleAddText = () => {
        if (textValue.trim() === '') { alert('Teks tidak boleh kosong'); return; }
        const newText = { id: Math.random(), type: 'text', content: textValue };
        handleUpdate('attachments', [...question.attachments, newText]);
        setTextValue('');
        setTextInputVisible(false);
    };
    const removeAttachment = (id) => {
        handleUpdate('attachments', question.attachments.filter(att => att.id !== id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const newMediaFiles = question.attachments
            .filter(att => att.type === 'new-file')
            .map(att => att.file);

        const existingAttachmentsForBackend = question.attachments
            .filter(att => att.type !== 'new-file')
            .map(({ id, ...rest }) => rest); 

        const finalQuestionData = {
            ...question,
            newMedia: newMediaFiles,
            attachments: existingAttachmentsForBackend
        };
        
        try {
            await onSubmit(question.id, finalQuestionData);
            await DataService.deleteDraft(DRAFT_KEY);
        } catch(error) {
            // Error ditangani oleh parent
        } finally {
            setIsSaving(false);
        }
    };

    const questionTypeOptions = [
        { value: 'pilihan-ganda', label: 'Pilihan Ganda' },
        { value: 'esai', label: 'Esai' },
        { value: 'pilihan-ganda-esai', label: 'Pilihan Ganda & Esai' }
    ];

    return (
        <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col h-[90vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <header className="p-6 border-b flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-800">Edit Soal Materi</h3>
                        <div className="flex items-center gap-4">
                            <SaveStatusIcon status={saveStatus} />
                            <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX size={22} /></button>
                        </div>
                    </header>

                    <main className="flex-grow overflow-y-auto p-6 space-y-6">
                         <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/50 space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg text-sesm-deep">1.</span>
                                <CustomSelect
                                    options={questionTypeOptions}
                                    value={question.type}
                                    onChange={(value) => handleUpdate('type', value)}
                                />
                            </div>

                            <textarea value={question.question} onChange={(e) => handleUpdate('question', e.target.value)} placeholder="Tulis pertanyaan utama di sini..." className="w-full p-3 border rounded-md h-28 resize-y focus:ring-2 focus:ring-sesm-teal focus:border-transparent text-gray-700" required />

                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    <label className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg cursor-pointer hover:bg-gray-300">
                                        <FiPaperclip size={16} /> Lampirkan File
                                        <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                    </label>
                                    <button type="button" onClick={() => { setLinkInputVisible(!linkInputVisible); setTextInputVisible(false); }} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                                        <FiLink size={16} /> Lampirkan Link
                                    </button>
                                    <button type="button" onClick={() => { setTextInputVisible(!textInputVisible); setLinkInputVisible(false); }} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                                        <FiType size={16} /> Lampirkan Teks
                                    </button>
                                </div>
                                <AnimatePresence>
                                    {linkInputVisible && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex gap-2 items-center">
                                            <input type="url" placeholder="https://..." value={linkValue} onChange={(e) => setLinkValue(e.target.value)} className="w-full p-2 border rounded-md" />
                                            <button type="button" onClick={handleAddLink} className="px-3 py-2 bg-sesm-teal text-white rounded-md text-sm font-semibold">Simpan</button>
                                        </motion.div>
                                    )}
                                    {textInputVisible && (
                                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                            <textarea placeholder="Tulis teks atau catatan tambahan..." value={textValue} onChange={(e) => setTextValue(e.target.value)} className="w-full p-2 border rounded-md h-20 mb-2" />
                                            <div className="flex justify-end gap-2">
                                                <button type="button" onClick={handleAddText} className="px-3 py-2 bg-sesm-teal text-white rounded-md text-sm font-semibold">Simpan</button>
                                                <button type="button" onClick={() => setTextInputVisible(false)} className="px-3 py-2 bg-gray-200 rounded-md text-sm font-semibold">Batal</button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {question.attachments.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border border-dashed rounded-md bg-white">
                                        {question.attachments.map(item => <MediaPreview key={item.id} item={item} onRemove={() => removeAttachment(item.id)} />)}
                                    </div>
                                )}
                            </div>

                            {(question.type.includes('pilihan-ganda')) && (
                                <fieldset className="space-y-3 p-4 rounded-md bg-white border">
                                    <legend className="text-sm font-semibold text-gray-600 px-1">Opsi Pilihan Ganda</legend>
                                    {question.options.map((opt, oIndex) => (
                                        <div key={oIndex} className="flex items-center gap-2">
                                            <input type="text" value={opt} onChange={(e) => handleOptionChange(oIndex, e.target.value)} placeholder={`Pilihan ${oIndex + 1}`} className="w-full p-2 border rounded-md focus:ring-1 focus:ring-sesm-teal text-gray-700" required />
                                            <button type="button" onClick={() => removeOption(oIndex)} disabled={question.options.length <= 2} className="p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300"><FiTrash2 size={16} /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addOption} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-sesm-deep bg-gray-100 rounded-lg hover:bg-gray-200"><FiPlus size={16} /> Tambah Opsi</button>
                                    <CustomSelect
                                        options={question.options.filter(opt => opt && opt.trim() !== '').map(opt => ({ value: opt, label: opt }))}
                                        value={question.correctAnswer}
                                        onChange={(value) => handleUpdate('correctAnswer', value)}
                                        placeholder="-- Pilih Jawaban Benar --"
                                    />
                                </fieldset>
                            )}
                            {(question.type.includes('esai')) && (
                                <fieldset className="space-y-3 p-4 rounded-md bg-white border">
                                    <legend className="text-sm font-semibold text-gray-600 px-1">Kunci Jawaban Esai</legend>
                                    <input type="text" value={question.essayAnswer} onChange={(e) => handleUpdate('essayAnswer', e.target.value)} placeholder="Kunci Jawaban Esai (opsional)" className="w-full p-2 border rounded-md focus:ring-1 focus:ring-sesm-teal text-gray-700" />
                                </fieldset>
                            )}
                        </div>
                    </main>

                    <footer className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200">Batal</button>
                        <button type="submit" disabled={isSaving} className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 flex items-center gap-2 disabled:bg-gray-400">
                            {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />} 
                            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </footer>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditQuestionModal;