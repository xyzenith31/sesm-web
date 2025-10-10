// src/components/QuestionFormModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiPaperclip, FiImage, FiFilm, FiMusic, FiFile, FiX, FiLink, FiType } from 'react-icons/fi';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const MediaPreview = ({ file, onRemove }) => {
    const getIcon = () => {
        if (file.type.startsWith('image/')) return <FiImage className="text-blue-500" size={24} />;
        if (file.type.startsWith('video/')) return <FiFilm className="text-purple-500" size={24} />;
        if (file.type.startsWith('audio/')) return <FiMusic className="text-pink-500" size={24} />;
        return <FiFile className="text-gray-500" size={24} />;
    };
    return (<div className="bg-white border rounded-lg p-2 flex items-center gap-3">{getIcon()}<div className="flex-grow overflow-hidden"><p className="text-sm font-medium text-gray-800 truncate">{file.name}</p><p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p></div><button type="button" onClick={onRemove} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100"><FiX size={16} /></button></div>);
};

const LinkPreview = ({ link, onRemove }) => (
    <div className="bg-white border rounded-lg p-2 flex items-center gap-3">
        <FiLink className="text-green-500" size={24} />
        <div className="flex-grow overflow-hidden">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 truncate hover:underline">{link.url}</a>
        </div>
        <button type="button" onClick={onRemove} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100">
            <FiX size={16} />
        </button>
    </div>
);

const TextPreview = ({ text, onRemove }) => (
    <div className="bg-white border rounded-lg p-2 flex items-start gap-3">
        <FiType className="text-gray-600" size={24} />
        <div className="flex-grow">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{text}</p>
        </div>
        <button type="button" onClick={onRemove} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100">
            <FiX size={16} />
        </button>
    </div>
);

const QuestionFormModal = ({ isOpen, onClose, onSubmit, chapterId }) => {
    const DRAFT_KEY = `question_draft_${chapterId}`;
    const [questions, setQuestions] = useState([]);
    const [linkInput, setLinkInput] = useState({ qIndex: null, value: '' });
    const [textInput, setTextInput] = useState({ qIndex: null, value: '' });

    const getNewQuestion = () => ({ type: 'pilihan-ganda', question: '', options: ['', ''], correctAnswer: '', essayAnswer: '', media: [], links: [], texts: [], subQuestions: [], id: Date.now() + Math.random() });
    const getNewSubQuestion = () => ({ type: 'pilihan-ganda', question: '', options: ['', ''], correctAnswer: '', essayAnswer: '', id: Date.now() + Math.random() + '_sub' });
    
    // Autosave (tetap ada sebagai backup)
    const debouncedQuestions = useDebounce(questions, 1500);
    useEffect(() => {
        if (isOpen && debouncedQuestions.length > 0 && debouncedQuestions.some(q => q.question.trim() !== '')) {
            const draftToSave = {
                lastSaved: new Date().toISOString(),
                questions: debouncedQuestions.map(({ media, ...rest }) => ({ ...rest, media: media.map(f => ({ name: f.name, type: f.type, size: f.size }))}))
            };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
        }
    }, [debouncedQuestions, DRAFT_KEY, isOpen]);

    useEffect(() => {
        if (isOpen) {
            const savedDraft = localStorage.getItem(DRAFT_KEY);
            if (savedDraft) {
                const loadedDraft = JSON.parse(savedDraft).questions.map(q => ({ ...q, media: [], links: q.links || [], texts: q.texts || [], subQuestions: q.subQuestions || [] }));
                setQuestions(loadedDraft);
            } else {
                setQuestions([getNewQuestion()]);
            }
        }
    }, [isOpen, chapterId]);

    const handleQuestionChange = (index, field, value) => { const newQuestions = [...questions]; newQuestions[index][field] = value; setQuestions(newQuestions); };
    const handleOptionChange = (qIndex, oIndex, value) => { const newQuestions = [...questions]; newQuestions[qIndex].options[oIndex] = value; if (newQuestions[qIndex].correctAnswer === questions[qIndex].options[oIndex]) { newQuestions[qIndex].correctAnswer = value; } setQuestions(newQuestions); };
    const addOptionField = (qIndex) => { const newQuestions = [...questions]; newQuestions[qIndex].options.push(''); setQuestions(newQuestions); };
    const removeOptionField = (qIndex, oIndex) => { const newQuestions = [...questions]; const removedOption = newQuestions[qIndex].options[oIndex]; if (newQuestions[qIndex].correctAnswer === removedOption) { newQuestions[qIndex].correctAnswer = ''; } newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex); setQuestions(newQuestions); };
    const handleMediaUpload = (qIndex, event) => { const files = Array.from(event.target.files); const newQuestions = [...questions]; newQuestions[qIndex].media = [...newQuestions[qIndex].media, ...files]; setQuestions(newQuestions); };
    const removeMedia = (qIndex, mediaIndex) => { const newQuestions = [...questions]; newQuestions[qIndex].media = newQuestions[qIndex].media.filter((_, i) => i !== mediaIndex); setQuestions(newQuestions); };
    const addQuestionField = () => { setQuestions([...questions, getNewQuestion()]); };
    const removeQuestionField = (index) => { setQuestions(questions.filter((_, i) => i !== index)); };
    const handleAddLink = (qIndex) => { if (!linkInput.value.startsWith('http')) { alert('URL tidak valid.'); return; } const newQuestions = [...questions]; newQuestions[qIndex].links.push({ id: Date.now(), url: linkInput.value }); setQuestions(newQuestions); setLinkInput({ qIndex: null, value: '' }); };
    const removeLink = (qIndex, linkId) => { const newQuestions = [...questions]; newQuestions[qIndex].links = newQuestions[qIndex].links.filter(link => link.id !== linkId); setQuestions(newQuestions); };
    const handleAddText = (qIndex) => { if (textInput.value.trim() === '') { alert('Teks tidak boleh kosong.'); return; } const newQuestions = [...questions]; newQuestions[qIndex].texts.push({ id: Date.now(), content: textInput.value }); setQuestions(newQuestions); setTextInput({ qIndex: null, value: '' }); };
    const removeText = (qIndex, textId) => { const newQuestions = [...questions]; newQuestions[qIndex].texts = newQuestions[qIndex].texts.filter(text => text.id !== textId); setQuestions(newQuestions); };
    const addSubQuestion = (qIndex) => { const newQuestions = [...questions]; newQuestions[qIndex].subQuestions.push(getNewSubQuestion()); setQuestions(newQuestions); };
    const removeSubQuestion = (qIndex, subQIndex) => { const newQuestions = [...questions]; newQuestions[qIndex].subQuestions = newQuestions[qIndex].subQuestions.filter((_, i) => i !== subQIndex); setQuestions(newQuestions); };
    const handleSubQuestionChange = (qIndex, subQIndex, field, value) => { const newQuestions = [...questions]; newQuestions[qIndex].subQuestions[subQIndex][field] = value; setQuestions(newQuestions); };
    const handleSubOptionChange = (qIndex, subQIndex, oIndex, value) => { const newQuestions = [...questions]; const subQ = newQuestions[qIndex].subQuestions[subQIndex]; subQ.options[oIndex] = value; if (subQ.correctAnswer === subQ.options[oIndex]) { subQ.correctAnswer = value; } setQuestions(newQuestions); };
    const addSubOptionField = (qIndex, subQIndex) => { const newQuestions = [...questions]; newQuestions[qIndex].subQuestions[subQIndex].options.push(''); setQuestions(newQuestions); };
    const removeSubOptionField = (qIndex, subQIndex, oIndex) => { const newQuestions = [...questions]; const subQ = newQuestions[qIndex].subQuestions[subQIndex]; const removedOption = subQ.options[oIndex]; if (subQ.correctAnswer === removedOption) { subQ.correctAnswer = ''; } subQ.options = subQ.options.filter((_, i) => i !== oIndex); setQuestions(newQuestions); };
    
    // --- PERBAIKAN UTAMA ADA DI FUNGSI INI ---
    const handleSaveDraft = () => {
        // Cek apakah ada sesuatu untuk disimpan
        if (questions.length === 0 || questions.every(q => q.question.trim() === '')) {
            alert('Tidak ada soal untuk disimpan sebagai draf.');
            return;
        }

        // Buat objek draf yang akan disimpan
        const draftToSave = {
            lastSaved: new Date().toISOString(),
            questions: questions.map(({ media, ...rest }) => ({ ...rest, media: media.map(f => ({ name: f.name, type: f.type, size: f.size }))}))
        };
        
        // Simpan ke localStorage secara langsung
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draftToSave));
        
        // Beri notifikasi dan tutup modal
        alert('Draf berhasil disimpan!');
        onClose();
    };
    
    const handleSubmit = (e) => { e.preventDefault(); onSubmit(questions); localStorage.removeItem(DRAFT_KEY); onClose(); };

    if (!isOpen) return null;

    return (
        <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-3xl shadow-xl flex flex-col h-[90vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b"><h3 className="text-xl font-bold text-sesm-deep">Tambah Soal Baru</h3><p className="text-sm text-gray-500">Perubahan akan disimpan otomatis sebagai draf.</p></div>
                    <div className="p-6 space-y-6 flex-grow overflow-y-auto bg-gray-50/50">
                        {questions.map((q, qIndex) => (
                            <div key={q.id} className="bg-white p-5 rounded-xl border shadow-sm">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-grow space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-lg">{qIndex + 1}.</span>
                                            <select value={q.type} onChange={(e) => handleQuestionChange(qIndex, 'type', e.target.value)} className="p-2 border rounded-md">
                                                <option value="pilihan-ganda">Pilihan Ganda</option>
                                                <option value="esai">Esai</option>
                                                <option value="pilihan-ganda-esai">Pilihan Ganda & Esai</option>
                                            </select>
                                            <button type="button" onClick={() => addSubQuestion(qIndex)} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200"><FiPlus size={16}/> Tambah Sub Soal</button>
                                        </div>
                                        <textarea value={q.question} onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)} placeholder="Tulis pertanyaan utama di sini..." className="w-full p-2 border rounded-md h-24" required />
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer">
                                                    <FiPaperclip/> Lampirkan File
                                                    <input 
                                                        type="file" 
                                                        multiple 
                                                        onChange={(e) => handleMediaUpload(qIndex, e)} 
                                                        className="hidden" 
                                                        accept="image/*,video/*,audio/*,application/pdf,.doc,.docx"
                                                    />
                                                </label>
                                                <button type="button" onClick={() => setLinkInput({ qIndex, value: '' })} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"><FiLink/> Lampirkan Link</button>
                                                <button type="button" onClick={() => setTextInput({ qIndex, value: '' })} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"><FiType/> Lampirkan Teks</button>
                                            </div>
                                            <AnimatePresence>
                                                {linkInput.qIndex === qIndex && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex gap-2 items-center mb-2">
                                                        <input type="url" placeholder={`Link umum (https://...)`} value={linkInput.value} onChange={(e) => setLinkInput({ ...linkInput, value: e.target.value })} className="w-full p-2 border rounded-md" />
                                                        <button type="button" onClick={() => handleAddLink(qIndex)} className="px-3 py-2 bg-sesm-teal text-white rounded-md text-sm font-semibold">Simpan</button>
                                                        <button type="button" onClick={() => setLinkInput({ qIndex: null, value: ''})} className="p-2"><FiX/></button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <AnimatePresence>
                                                {textInput.qIndex === qIndex && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-2">
                                                        <textarea placeholder="Tulis teks atau catatan tambahan di sini..." value={textInput.value} onChange={(e) => setTextInput({ ...textInput, value: e.target.value })} className="w-full p-2 border rounded-md h-20 mb-2" />
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button" onClick={() => handleAddText(qIndex)} className="px-3 py-2 bg-sesm-teal text-white rounded-md text-sm font-semibold">Simpan Teks</button>
                                                            <button type="button" onClick={() => setTextInput({ qIndex: null, value: '' })} className="px-3 py-2 bg-gray-200 rounded-md text-sm font-semibold">Batal</button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            {(q.media.length > 0 || q.links.length > 0 || q.texts.length > 0) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md bg-gray-100">
                                                    {q.media.map((file, mIndex) => <MediaPreview key={`file-${mIndex}`} file={file} onRemove={() => removeMedia(qIndex, mIndex)} /> )}
                                                    {q.links.map((link, lIndex) => <LinkPreview key={`link-${lIndex}`} link={link} onRemove={() => removeLink(qIndex, link.id)} />)}
                                                    {q.texts.map((text, tIndex) => <TextPreview key={`text-${tIndex}`} text={text.content} onRemove={() => removeText(qIndex, text.id)} />)}
                                                </div>
                                            )}
                                        </div>
                                        {(q.type === 'pilihan-ganda' || q.type === 'pilihan-ganda-esai') && (
                                            <fieldset className="border p-3 rounded-md space-y-2">
                                                <legend className="text-sm font-medium px-1">Opsi Pilihan Ganda</legend>
                                                {q.options.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2"><input type="text" value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Pilihan ${oIndex + 1}`} className="w-full p-2 border rounded-md" required/><button type="button" onClick={() => removeOptionField(qIndex, oIndex)} disabled={q.options.length <= 2} className="p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed"><FiTrash2/></button></div>))}
                                                <button type="button" onClick={() => addOptionField(qIndex)} className="text-sm font-semibold flex items-center gap-1 px-3 py-1 bg-gray-100 border rounded-md hover:bg-gray-200 transition-colors"><FiPlus size={16}/> Tambah Opsi</button>
                                                <select value={q.correctAnswer} onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)} className="w-full p-2 border rounded-md mt-2" required><option value="" disabled>-- Pilih Jawaban Benar --</option>{q.options.filter(opt => opt.trim() !== '').map((opt, oIndex) => (<option key={oIndex} value={opt}>{opt}</option>))}</select>
                                            </fieldset>
                                        )}
                                        {(q.type === 'esai' || q.type === 'pilihan-ganda-esai') && (
                                            <fieldset className="border p-3 rounded-md">
                                                <legend className="text-sm font-medium px-1">Jawaban Esai</legend>
                                                 <input type="text" value={q.essayAnswer} onChange={(e) => handleQuestionChange(qIndex, 'essayAnswer', e.target.value)} placeholder="Kunci Jawaban Esai (opsional)" className="w-full p-2 border rounded-md"/>
                                            </fieldset>
                                        )}
                                        <AnimatePresence>
                                            {q.subQuestions.map((subQ, subQIndex) => (
                                                <motion.div key={subQ.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-gray-50 p-4 rounded-lg border border-dashed mt-4 space-y-3">
                                                    <div className="flex justify-between items-center pb-2 border-b"><h4 className="font-semibold text-sesm-deep">Sub Soal {qIndex + 1}.{subQIndex + 1}</h4><button type="button" onClick={() => removeSubQuestion(qIndex, subQIndex)} className="text-red-500 hover:text-red-700 p-1" title="Hapus Sub Soal"><FiTrash2 size={16}/></button></div>
                                                    <textarea value={subQ.question} onChange={(e) => handleSubQuestionChange(qIndex, subQIndex, 'question', e.target.value)} placeholder={`Tulis pertanyaan sub soal ${qIndex + 1}.${subQIndex + 1}...`} className="w-full p-2 border rounded-md" required />
                                                    <fieldset className="border p-3 rounded-md space-y-2">
                                                        <legend className="text-sm font-medium px-1">Opsi Pilihan Ganda Sub Soal</legend>
                                                        {subQ.options.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2"><input type="text" value={opt} onChange={(e) => handleSubOptionChange(qIndex, subQIndex, oIndex, e.target.value)} placeholder={`Pilihan ${oIndex + 1}`} className="w-full p-2 border rounded-md" required/><button type="button" onClick={() => removeSubOptionField(qIndex, subQIndex, oIndex)} disabled={subQ.options.length <= 2} className="p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed"><FiTrash2/></button></div>))}
                                                        <button type="button" onClick={() => addSubOptionField(qIndex, subQIndex)} className="text-sm font-semibold flex items-center gap-1 px-3 py-1 bg-gray-100 border rounded-md hover:bg-gray-200 transition-colors"><FiPlus size={16}/> Tambah Opsi Sub Soal</button>
                                                        <select value={subQ.correctAnswer} onChange={(e) => handleSubQuestionChange(qIndex, subQIndex, 'correctAnswer', e.target.value)} className="w-full p-2 border rounded-md mt-2" required><option value="" disabled>-- Pilih Jawaban Benar --</option>{subQ.options.filter(opt => opt.trim() !== '').map((opt, oIndex) => (<option key={oIndex} value={opt}>{opt}</option>))}</select>
                                                    </fieldset>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                    <button type="button" onClick={() => removeQuestionField(qIndex)} className="text-red-500 hover:text-red-700 p-1" title="Hapus Soal Ini"><FiTrash2 size={18}/></button>
                               </div>
                            </div>
                        ))}
                         <button type="button" onClick={addQuestionField} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded-lg text-sesm-deep hover:bg-sesm-teal/10 transition-colors"><FiPlus/> Tambah Soal Lagi</button>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-between items-center rounded-b-2xl border-t"><span className="text-sm text-gray-600">Total: {questions.length} soal</span><div><button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors mr-2">Batal</button><button type="button" onClick={handleSaveDraft} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors mr-3">Simpan Sementara</button><button type="submit" className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors">Publish Soal</button></div></div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default QuestionFormModal;