// contoh-sesm-web/components/admin/EditQuestionToQuizModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// --- PERBAIKAN DI SINI: Menambahkan FiPlus ke dalam daftar import ---
import { FiSave, FiX, FiPaperclip, FiLink, FiImage, FiFilm, FiMusic, FiFile, FiTrash2, FiPlus } from 'react-icons/fi';

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
    const [question, setQuestion] = useState(null);

    useEffect(() => {
        if (questionData) {
            const correctAnswer = questionData.options.find(opt => opt.is_correct)?.option_text || '';
            setQuestion({
                id: questionData.id,
                question: questionData.question_text,
                type: 'pilihan-ganda',
                options: questionData.options.map(opt => opt.option_text),
                correctAnswer: correctAnswer,
                media: questionData.media_attachments || [],
            });
        }
    }, [questionData]);
    
    if (!isOpen || !question) return null;

    const handleUpdate = (field, value) => setQuestion(prev => ({ ...prev, [field]: value }));
    const handleOptionChange = (index, value) => {
        const newOptions = [...question.options];
        newOptions[index] = value;
        handleUpdate('options', newOptions);
    };
    const addOption = () => handleUpdate('options', [...question.options, '']);
    const removeOption = (index) => handleUpdate('options', question.options.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(question.id, question);
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
                        <div>
                            <label className="font-semibold text-sm mb-1 block">Teks Pertanyaan</label>
                            <textarea value={question.question} onChange={(e) => handleUpdate('question', e.target.value)} className="w-full p-2 border rounded-md h-24" required />
                        </div>
                        
                        {question.media.length > 0 && (
                            <div>
                                <label className="font-semibold text-sm mb-1 block">Lampiran Media</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md bg-gray-100">
                                    {question.media.map((item, index) => <MediaPreview key={index} item={item} onRemove={() => handleUpdate('media', question.media.filter((_, i) => i !== index))} />)}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Untuk mengubah file/link, hapus lampiran lama dan tambahkan yang baru melalui menu "Tambah Soal".</p>
                            </div>
                        )}
                        
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
                                {question.options.filter(opt => opt.trim() !== '').map((opt, oIndex) => (<option key={oIndex} value={opt}>{opt}</option>))}
                            </select>
                        </fieldset>
                    </div>
                    <div className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 flex items-center gap-2"><FiSave /> Simpan Perubahan</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditQuestionToQuizModal;