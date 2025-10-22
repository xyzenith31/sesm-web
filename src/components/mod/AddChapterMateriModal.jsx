import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import CustomSelect from '../ui/CustomSelect';
import Notification from '../ui/Notification';

const AddChapterMateriModal = ({ isOpen, onClose, onSubmit, mapelList, jenjang }) => {
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [judulBab, setJudulBab] = useState('');

    const [notification, setNotification] = useState({
        isOpen: false,
        title: '',
        message: '',
        success: true
    });

    useEffect(() => {
        if (isOpen) {
            setSelectedSubjectId('');
            setJudulBab('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedSubjectId || !judulBab.trim()) {
            setNotification({
                isOpen: true,
                title: "Peringatan",
                message: "Mata pelajaran dan judul bab tidak boleh kosong.",
                success: false
            });
            return;
        }
        onSubmit({ subjectId: selectedSubjectId, judul: judulBab.trim() });
    };

    const mapelOptions = useMemo(() => {
        return mapelList.map(m => ({
            value: m.subject_id,
            label: m.nama_mapel
        }));
    }, [mapelList]);

    if (!isOpen) return null;

    return (
        <>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
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
                                <h3 className="text-xl font-bold text-sesm-deep">Tambah Materi Baru</h3>
                                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                                    <FiX size={20}/>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Buat materi baru di dalam mata pelajaran untuk jenjang <span className="font-bold">{jenjang}</span>.</p>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Mata Pelajaran (Mapel)</label>
                                    <CustomSelect
                                        options={mapelOptions}
                                        value={selectedSubjectId}
                                        onChange={setSelectedSubjectId}
                                        placeholder="Pilih Mata Pelajaran"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Judul Materi Baru</label>
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

            <Notification
                isOpen={notification.isOpen}
                onClose={() => setNotification({ ...notification, isOpen: false })}
                title={notification.title}
                message={notification.message}
                success={notification.success}
                isConfirmation={false}
            />
        </>
    );
};

export default AddChapterMateriModal;