// contoh-sesm-web/src/components/AddChapterModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const AddChapterModal = ({ isOpen, onClose, onSubmit, mapelList, jenjang }) => {
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [judulBab, setJudulBab] = useState('');

    useEffect(() => {
        if (isOpen && mapelList.length > 0) {
            setSelectedSubjectId(mapelList[0].id);
            setJudulBab('');
        }
    }, [isOpen, mapelList]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSubjectId || !judulBab.trim()) {
            alert('Mata pelajaran dan judul bab tidak boleh kosong.');
            return;
        }
        onSubmit({ subjectId: selectedSubjectId, judul: judulBab.trim() });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9, y: -20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="bg-white rounded-2xl w-full max-w-md shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-sesm-deep">Tambah Bab Baru</h3>
                            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                                <FiX size={20}/>
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">Buat bab baru di dalam mata pelajaran untuk jenjang <span className="font-bold">{jenjang}</span>.</p>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Mata Pelajaran (Mapel)</label>
                                <select 
                                    value={selectedSubjectId} 
                                    onChange={(e) => setSelectedSubjectId(e.target.value)} 
                                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                                    required
                                >
                                    {mapelList.length > 0 ? (
                                        mapelList.map(m => <option key={m.id} value={m.id}>{m.nama_mapel}</option>)
                                    ) : (
                                        <option disabled>Tidak ada mapel tersedia</option>
                                    )}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Bab Baru</label>
                                <input 
                                    type="text"
                                    value={judulBab}
                                    onChange={(e) => setJudulBab(e.target.value)}
                                    placeholder="cth: Pengenalan Alat Musik"
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 flex justify-end space-x-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                            Batal
                        </button>
                        <button type="submit" className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
                            Lanjutkan
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default AddChapterModal;