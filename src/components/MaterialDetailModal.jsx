import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// --- PERBAIKAN DI SINI: FiLoader dan ikon lainnya ditambahkan ---
import { FiX, FiExternalLink, FiHelpCircle, FiCheck, FiXCircle, FiFileText, FiSave, FiCheckCircle, FiLoader } from 'react-icons/fi';
import BookmarkService from '../services/bookmarkService';

const MaterialDetailModal = ({ material, onClose }) => {
  const API_URL = 'http://localhost:8080';

  // State untuk jawaban, status submit, dan hasil
  const [answers, setAnswers] = useState(Array(material.tasks?.length || 0).fill(''));
  const [pristineStates, setPristineStates] = useState(Array(material.tasks?.length || 0).fill(true));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Handler untuk mengubah jawaban
  const handleAnswerChange = (e, index) => {
    const newAnswers = [...answers];
    newAnswers[index] = e.target.value;
    setAnswers(newAnswers);

    if (pristineStates[index]) {
      const newPristineStates = [...pristineStates];
      newPristineStates[index] = false;
      setPristineStates(newPristineStates);
    }
  };
  
  // Handler untuk mengirim jawaban ke backend
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        const response = await BookmarkService.submitAnswers(material.id, answers);
        setSubmissionResult(response.data);
    } catch (error) {
        setSubmissionResult({ message: error.response?.data?.message || "Gagal mengirim jawaban." });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  // Ikon untuk feedback input
  const getAnswerIcon = (index) => {
    if (pristineStates[index]) return <FiHelpCircle className="text-gray-400" />;
    if (answers[index] && answers[index].trim() !== '') return <FiCheck className="text-green-500" />;
    return <FiXCircle className="text-red-500" />;
  };
  
  // Helper untuk mengubah URL YouTube
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };
  
  // Fungsi untuk merender konten media
  const renderContent = () => {
    const fullUrl = `${API_URL}/${material.url}`;
    switch (material.type) {
      case 'video_link':
        return <div className="aspect-video bg-black rounded-lg overflow-hidden"><iframe className="w-full h-full" src={getYouTubeEmbedUrl(material.url)} title={material.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>;
      case 'video':
        return <div className="aspect-video bg-black rounded-lg overflow-hidden"><video src={fullUrl} controls className="w-full h-full" /></div>;
      case 'image':
        return <div className="w-full h-80 bg-gray-100 rounded-lg flex items-center justify-center"><img src={fullUrl} alt={material.title} className="max-w-full max-h-full object-contain rounded-lg" /></div>;
      case 'pdf':
        return <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden"><iframe src={fullUrl} className="w-full h-full" title={material.title}></iframe></div>;
      default:
        return <div className="w-full h-80 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center p-4"><FiFileText size={64} className="text-gray-400 mb-4" /><h3 className="font-bold text-gray-700">File Dokumen</h3><p className="text-sm text-gray-500 mb-4">{material.url?.split('/').pop()}</p><a href={fullUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-sesm-deep text-white rounded-lg font-semibold"><FiExternalLink /> Buka/Unduh File</a></div>;
    }
  };

  // Tampilan setelah submit berhasil
  if (submissionResult) {
    return (
        <motion.div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-md p-6 text-center shadow-xl">
                <FiCheckCircle className="text-green-500 text-6xl mx-auto mb-4"/>
                <h2 className="text-2xl font-bold text-sesm-deep">Berhasil!</h2>
                <p className="text-gray-600 my-2">{submissionResult.message}</p>
                {submissionResult.score !== null && submissionResult.score !== undefined && (
                    <p>Skor (jika dinilai otomatis): <span className="font-bold text-2xl text-sesm-teal">{submissionResult.score}</span></p>
                )}
                <button onClick={onClose} className="mt-6 w-full py-3 bg-sesm-deep text-white font-bold rounded-lg">Tutup</button>
            </motion.div>
        </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-sesm-deep">{material.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX className="text-gray-600" /></button>
        </header>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {renderContent()}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Deskripsi</h3>
            <p className="text-sm text-gray-600">{material.description || "Tidak ada deskripsi."}</p>
          </div>
          {material.tasks && material.tasks.length > 0 && (
            <div>
                <h3 className="font-bold text-gray-800 mb-3">Tugas</h3>
                <div className="space-y-4">
                    {material.tasks.map((task, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-gray-700 mb-2">{index + 1}. {task.split('@@')[0]}</p>
                            <div className="relative">
                                <textarea
                                    value={answers[index] || ''}
                                    onChange={(e) => handleAnswerChange(e, index)}
                                    placeholder="Tulis jawabanmu di sini..."
                                    className="w-full h-20 p-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                                />
                                <div className="absolute top-2.5 right-2.5 text-2xl">{getAnswerIcon(index)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
        </main>
        {material.tasks && material.tasks.length > 0 && (
             <footer className="p-4 border-t bg-gray-50 rounded-b-2xl">
                <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-3 bg-sesm-deep text-white font-bold rounded-lg shadow-lg disabled:bg-gray-400 flex items-center justify-center gap-2">
                    {isSubmitting && <FiLoader className="animate-spin"/>}
                    {isSubmitting ? 'Mengirim...' : 'Kumpulkan Jawaban'}
                </button>
            </footer>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MaterialDetailModal;