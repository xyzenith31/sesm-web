import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiPaperclip, FiImage, FiFilm, FiMusic, FiFile, FiX, FiLink, FiType } from 'react-icons/fi';
import DataService from '../../services/dataService';
import CustomSelect from '../ui/CustomSelect';
import useDebounce from '../../hooks/useDebounce';
import SaveStatusIcon from '../ui/SaveStatusIcon';
import Notification from '../ui/Notification'; 

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
    const questionTypeOptions = [
        { value: 'pilihan-ganda', label: 'Pilihan Ganda' },
        { value: 'esai', label: 'Esai' },
        { value: 'pilihan-ganda-esai', label: 'Pilihan Ganda & Esai' }
    ];

    const DRAFT_KEY = `materi_${chapterId}`;
    const [questions, setQuestions] = useState([]);
    const [linkInput, setLinkInput] = useState({ qIndex: null, value: '' });
    const [textInput, setTextInput] = useState({ qIndex: null, value: '' });
    const [saveStatus, setSaveStatus] = useState('Tersimpan');

    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });

    const getNewQuestion = () => ({ type: 'pilihan-ganda', question: '', options: ['', ''], correctAnswer: '', essayAnswer: '', media: [], links: [], texts: [], subQuestions: [], id: Date.now() + Math.random() });
    const getNewSubQuestion = () => ({ type: 'pilihan-ganda', question: '', options: ['', ''], correctAnswer: '', essayAnswer: '', id: Date.now() + Math.random() + '_sub' });

    const debouncedQuestions = useDebounce(questions, 200);

    const saveDraftToBackend = useCallback(async (draftData) => {
        if (!draftData || draftData.length === 0 || (draftData.length === 1 && draftData[0].question.trim() === '' && draftData[0].media.length === 0 && draftData[0].links.length === 0 && draftData[0].texts.length === 0 && draftData[0].subQuestions.length === 0)) {
            setSaveStatus('Tersimpan');
            return;
        }
        setSaveStatus('Menyimpan...');
        try {
            const serializableData = draftData.map(({ media, ...rest }) => ({
                ...rest,
                subQuestions: rest.subQuestions?.map(({ media, ...subRest }) => subRest) || []
            }));
            await DataService.saveDraft(DRAFT_KEY, serializableData);
            setSaveStatus('Tersimpan');
        } catch (error) {
            console.error("Gagal menyimpan draf ke server:", error);
            setSaveStatus('Gagal');
        }
    }, [DRAFT_KEY]);


    useEffect(() => {
        if (isOpen) {
            saveDraftToBackend(debouncedQuestions);
        }
    }, [debouncedQuestions, isOpen, saveDraftToBackend]);

    useEffect(() => {
        if (isOpen) {
            setSaveStatus('Memuat...');
            DataService.getDraft(DRAFT_KEY)
                .then(response => {
                    if (response.data && response.data.content && response.data.content.length > 0) {
                        setQuestions(response.data.content.map(q => ({
                            ...getNewQuestion(),
                            ...q,
                            media: [], 
                            links: q.links || [],
                            texts: q.texts || [],
                            subQuestions: (q.subQuestions || []).map(sq => ({...getNewSubQuestion(), ...sq, media: []}))
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
             setLinkInput({ qIndex: null, value: '' });
             setTextInput({ qIndex: null, value: '' });
             setNotif({ isOpen: false, message: '', success: true, title: '' });
        }
    }, [isOpen, DRAFT_KEY]);

    const handleSaveDraft = () => {
        if (questions.length === 0 || questions.every(q => q.question.trim() === '')) {
            setNotif({isOpen: true, title: "Info", message: "Tidak ada soal untuk disimpan sebagai draf.", success: true });
            return;
        }
        saveDraftToBackend(questions);
        setNotif({isOpen: true, title: "Berhasil", message: "Draf berhasil disimpan!", success: true });
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

            if(q.subQuestions && q.subQuestions.length > 0) {
                for (let j = 0; j < q.subQuestions.length; j++){
                    const subQ = q.subQuestions[j];
                     if ((subQ.type === 'pilihan-ganda' || subQ.type === 'pilihan-ganda-esai') && (!subQ.correctAnswer || subQ.correctAnswer.trim() === '')) {
                         setNotif({
                            isOpen: true,
                            title: "Validasi Gagal",
                            message: `Sub Soal nomor ${i + 1}.${j+1} (${subQ.type}) belum memiliki jawaban benar. Silakan pilih jawaban yang benar.`,
                            success: false
                        });
                        return; 
                    }
                }
            }
        }

        onSubmit(questions);
        DataService.deleteDraft(DRAFT_KEY).catch(err => console.error("Gagal menghapus draft:", err));
        onClose();
    };

    const handleQuestionChange = (index, field, value) => { const newQuestions = [...questions]; newQuestions[index][field] = value; setQuestions(newQuestions); };
    const handleOptionChange = (qIndex, oIndex, value) => { const newQuestions = [...questions]; newQuestions[qIndex].options[oIndex] = value; if (newQuestions[qIndex].correctAnswer === questions[qIndex].options[oIndex]) { newQuestions[qIndex].correctAnswer = value; } setQuestions(newQuestions); };
    const addOptionField = (qIndex) => { const newQuestions = [...questions]; newQuestions[qIndex].options.push(''); setQuestions(newQuestions); };
    const removeOptionField = (qIndex, oIndex) => { const newQuestions = [...questions]; const removedOption = newQuestions[qIndex].options[oIndex]; if (newQuestions[qIndex].correctAnswer === removedOption) { newQuestions[qIndex].correctAnswer = ''; } newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex); setQuestions(newQuestions); };
    const handleMediaUpload = (qIndex, event) => { const files = Array.from(event.target.files); const newQuestions = [...questions]; newQuestions[qIndex].media = [...newQuestions[qIndex].media, ...files]; setQuestions(newQuestions); };
    const removeMedia = (qIndex, mediaIndex) => { const newQuestions = [...questions]; newQuestions[qIndex].media = newQuestions[qIndex].media.filter((_, i) => i !== mediaIndex); setQuestions(newQuestions); };
    const addQuestionField = () => { setQuestions([...questions, getNewQuestion()]); };
    const removeQuestionField = (index) => { if(questions.length > 1) setQuestions(questions.filter((_, i) => i !== index)); };
    const handleAddLink = (qIndex) => { if (!linkInput.value.startsWith('http')) { alert('URL tidak valid.'); return; } const newQuestions = [...questions]; newQuestions[qIndex].links.push({ id: Date.now(), url: linkInput.value }); setQuestions(newQuestions); setLinkInput({ qIndex: null, value: '' }); };
    const removeLink = (qIndex, linkId) => { const newQuestions = [...questions]; newQuestions[qIndex].links = newQuestions[qIndex].links.filter(link => link.id !== linkId); setQuestions(newQuestions); };
    const handleAddText = (qIndex) => { if (textInput.value.trim() === '') { alert('Teks tidak boleh kosong.'); return; } const newQuestions = [...questions]; newQuestions[qIndex].texts.push({ id: Date.now(), content: textInput.value }); setQuestions(newQuestions); setTextInput({ qIndex: null, value: '' }); };
    const removeText = (qIndex, textId) => { const newQuestions = [...questions]; newQuestions[qIndex].texts = newQuestions[qIndex].texts.filter(text => text.id !== textId); setQuestions(newQuestions); };
    const addSubQuestion = (qIndex) => { const newQuestions = [...questions]; newQuestions[qIndex].subQuestions.push(getNewSubQuestion()); setQuestions(newQuestions); };
    const removeSubQuestion = (qIndex, subQIndex) => { const newQuestions = [...questions]; newQuestions[qIndex].subQuestions = newQuestions[qIndex].subQuestions.filter((_, i) => i !== subQIndex); setQuestions(newQuestions); };
    const handleSubQuestionChange = (qIndex, subQIndex, field, value) => { const newQuestions = [...questions]; newQuestions[qIndex].subQuestions[subQIndex][field] = value; setQuestions(newQuestions); };
    const handleSubOptionChange = (qIndex, subQIndex, oIndex, value) => { const newQuestions = [...questions]; const subQ = newQuestions[qIndex].subQuestions[subQIndex]; const oldOption = subQ.options[oIndex]; subQ.options[oIndex] = value; if (subQ.correctAnswer === oldOption) { subQ.correctAnswer = value; } setQuestions(newQuestions); };
    const addSubOptionField = (qIndex, subQIndex) => { const newQuestions = [...questions]; newQuestions[qIndex].subQuestions[subQIndex].options.push(''); setQuestions(newQuestions); };
    const removeSubOptionField = (qIndex, subQIndex, oIndex) => { const newQuestions = [...questions]; const subQ = newQuestions[qIndex].subQuestions[subQIndex]; const removedOption = subQ.options[oIndex]; if (subQ.correctAnswer === removedOption) { subQ.correctAnswer = ''; } subQ.options = subQ.options.filter((_, i) => i !== oIndex); setQuestions(newQuestions); };

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
                                <h3 className="text-xl font-bold text-sesm-deep">Tambah Soal Baru</h3>
                                <p className="text-sm text-gray-500">Perubahan akan disimpan otomatis sebagai draf.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <SaveStatusIcon status={saveStatus} />
                                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                            </div>
                        </div>
                        <div className="p-6 space-y-6 flex-grow overflow-y-auto bg-gray-50/50">
                            {questions.map((q, qIndex) => (
                                <div key={q.id} className="bg-white p-5 rounded-xl border shadow-sm relative">
                                    {questions.length > 1 && (
                                         <button type="button" onClick={() => removeQuestionField(qIndex)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-700" title="Hapus Soal Ini">
                                            <FiX size={16}/>
                                        </button>
                                    )}
                                    <div className="flex-grow space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-lg">{qIndex + 1}.</span>
                                            <CustomSelect
                                                options={questionTypeOptions}
                                                value={q.type}
                                                onChange={(value) => handleQuestionChange(qIndex, 'type', value)}
                                            />
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
                                                <button type="button" onClick={() => { setLinkInput({ qIndex, value: '' }); setTextInput({ qIndex: null, value: '' }); }} className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"><FiLink/> Lampirkan Link</button>
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
                                                    {q.media.map((file, mIndex) => <MediaPreview key={`file-${q.id}-${mIndex}`} file={file} onRemove={() => removeMedia(qIndex, mIndex)} /> )}
                                                    {q.links.map((link, lIndex) => <LinkPreview key={`link-${q.id}-${lIndex}`} link={link} onRemove={() => removeLink(qIndex, link.id)} />)}
                                                    {q.texts.map((text, tIndex) => <TextPreview key={`text-${q.id}-${tIndex}`} text={text.content} onRemove={() => removeText(qIndex, text.id)} />)}
                                                </div>
                                            )}
                                        </div>
                                        {(q.type === 'pilihan-ganda' || q.type === 'pilihan-ganda-esai') && (
                                            <fieldset className="border p-3 rounded-md space-y-2">
                                                <legend className="text-sm font-medium px-1">Opsi Pilihan Ganda</legend>
                                                {q.options.map((opt, oIndex) => (<div key={oIndex} className="flex items-center gap-2"><input type="text" value={opt} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder={`Pilihan ${oIndex + 1}`} className="w-full p-2 border rounded-md" required/><button type="button" onClick={() => removeOptionField(qIndex, oIndex)} disabled={q.options.length <= 2} className="p-2 text-gray-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed"><FiTrash2/></button></div>))}
                                                <button type="button" onClick={() => addOptionField(qIndex)} className="text-sm font-semibold flex items-center gap-1 px-3 py-1 bg-gray-100 border rounded-md hover:bg-gray-200 transition-colors"><FiPlus size={16}/> Tambah Opsi</button>

                                                <CustomSelect
                                                    options={q.options.filter(opt => opt.trim() !== '').map(opt => ({ value: opt, label: opt }))}
                                                    value={q.correctAnswer}
                                                    onChange={(value) => handleQuestionChange(qIndex, 'correctAnswer', value)}
                                                    placeholder="Pilih Jawaban Benar"
                                                />
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
                                                        <CustomSelect
                                                            options={subQ.options.filter(opt => opt.trim() !== '').map(opt => ({ value: opt, label: opt }))}
                                                            value={subQ.correctAnswer}
                                                            onChange={(value) => handleSubQuestionChange(qIndex, subQIndex, 'correctAnswer', value)}
                                                            placeholder="Pilih Jawaban Benar"
                                                        />
                                                    </fieldset>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ))}
                             <button type="button" onClick={addQuestionField} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded-lg text-sesm-deep hover:bg-sesm-teal/10 transition-colors"><FiPlus/> Tambah Soal Lagi</button>
                        </div>
                        <div className="bg-gray-50 p-4 flex justify-between items-center rounded-b-2xl border-t"><span className="text-sm text-gray-600 font-semibold">Total: {questions.length} soal</span><div><button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors mr-2">Batal</button><button type="button" onClick={handleSaveDraft} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors mr-3">Simpan Draf</button><button type="submit" className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors">Publish Soal</button></div></div>
                    </form>
                </motion.div>
            </motion.div>
        </>
    );
};

export default QuestionFormModal;