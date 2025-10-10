import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiPlus, FiTrash2, FiImage } from 'react-icons/fi';

const AddQuestionToQuizModal = ({ isOpen, onClose, onSubmit, quizId }) => {
    const [question_text, setQuestionText] = useState('');
    const [question_type, setQuestionType] = useState('pilihan-ganda');
    const [options, setOptions] = useState([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    const [questionImage, setQuestionImage] = useState(null);
    const [preview, setPreview] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setQuestionImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };
    
    // --- PERBAIKAN 1: Logika update state dibuat lebih robust (immutable) ---
    const handleOptionChange = (index, text) => {
        const newOptions = options.map((opt, i) => {
            if (i === index) {
                // Jika jawaban yang diedit adalah jawaban benar, update juga statusnya
                const isStillCorrect = opt.isCorrect;
                return { ...opt, text: text, isCorrect: isStillCorrect };
            }
            return opt;
        });

        // Jika teks dari jawaban yang benar diubah, kita perlu memperbarui state isCorrect
        const correctAnswer = options.find(opt => opt.isCorrect);
        if (correctAnswer && options.indexOf(correctAnswer) === index) {
            const finalOptions = newOptions.map(opt => ({
                ...opt,
                isCorrect: opt.text === text && text.trim() !== ''
            }));
            setOptions(finalOptions);
        } else {
            setOptions(newOptions);
        }
    };

    // --- PERBAIKAN 2: Logika diubah untuk menangani value dari dropdown ---
    const handleCorrectChange = (selectedText) => {
        const newOptions = options.map(opt => ({
            ...opt,
            isCorrect: opt.text === selectedText
        }));
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, { text: '', isCorrect: false }]);
    const removeOption = (index) => {
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const resetForm = () => {
        setQuestionText('');
        setQuestionType('pilihan-ganda');
        setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
        setQuestionImage(null);
        setPreview('');
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('question_text', question_text);
        formData.append('question_type', question_type);
        if (questionImage) {
            formData.append('questionImage', questionImage);
        }
        if (question_type === 'pilihan-ganda') {
            formData.append('options', JSON.stringify(options));
        }
        onSubmit(quizId, formData);
        resetForm();
        onClose();
    };
    
    // Nilai untuk dropdown jawaban benar, diambil dari state 'options'
    const currentCorrectAnswer = options.find(opt => opt.isCorrect)?.text || '';

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-sesm-deep">Tambah Soal Baru</h3>
                            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="font-semibold text-sm">Teks Pertanyaan</label>
                                <textarea value={question_text} onChange={(e) => setQuestionText(e.target.value)} className="w-full p-2 border rounded-md mt-1 h-24" required />
                            </div>
                            <div>
                                <label className="font-semibold text-sm">Gambar Soal (Opsional)</label>
                                 <div className="mt-1 flex items-center gap-4">
                                     {preview && <img src={preview} alt="Preview Soal" className="h-20 w-20 object-cover rounded-md"/>}
                                    <label htmlFor="question-image-upload" className="flex-grow border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50">
                                        <FiImage className="mx-auto text-gray-400 mb-1" size={24}/>
                                        <span className="text-sm text-gray-600">{questionImage ? "Ganti Gambar" : "Pilih Gambar"}</span>
                                        <input id="question-image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*"/>
                                    </label>
                                 </div>
                            </div>
                            <div>
                                <label className="font-semibold text-sm">Tipe Soal</label>
                                <select value={question_type} onChange={(e) => setQuestionType(e.target.value)} className="w-full p-2 border rounded-md mt-1 bg-white">
                                    <option value="pilihan-ganda">Pilihan Ganda</option>
                                </select>
                            </div>
                            {question_type === 'pilihan-ganda' && (
                                <fieldset className="border p-3 rounded-md space-y-2">
                                    <legend className="font-semibold text-sm px-1">Opsi Jawaban</legend>
                                    {options.map((opt, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            {/* --- PERBAIKAN 3: Radio button dihapus --- */}
                                            <input type="text" placeholder={`Opsi ${index + 1}`} value={opt.text} onChange={(e) => handleOptionChange(index, e.target.value)} className="flex-grow p-2 border rounded-md" required/>
                                            <button type="button" onClick={() => removeOption(index)} disabled={options.length <= 2} className="p-2 text-red-500 disabled:opacity-50"><FiTrash2/></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addOption} className="text-sm font-semibold flex items-center gap-1 mt-2 text-sesm-teal"><FiPlus/> Tambah Opsi</button>
                                    
                                    {/* --- PERBAIKAN 3: Select dropdown ditambahkan --- */}
                                    <div className="pt-2">
                                        <label className="font-semibold text-xs text-gray-600">Jawaban Benar</label>
                                        <select 
                                            value={currentCorrectAnswer}
                                            onChange={(e) => handleCorrectChange(e.target.value)}
                                            className="w-full p-2 border rounded-md mt-1 bg-white"
                                            required
                                        >
                                            <option value="" disabled>-- Pilih Jawaban Benar --</option>
                                            {options.filter(opt => opt.text.trim() !== '').map((opt, index) => (
                                                <option key={index} value={opt.text}>{opt.text}</option>
                                            ))}
                                        </select>
                                    </div>
                                </fieldset>
                            )}
                        </div>
                    </div>
                     <div className="bg-gray-50 p-4 flex justify-end rounded-b-2xl">
                        <button type="submit" className="px-6 py-2 bg-sesm-deep text-white rounded-lg font-semibold">Simpan Soal</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default AddQuestionToQuizModal;