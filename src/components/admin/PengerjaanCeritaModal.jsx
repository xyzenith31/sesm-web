import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiLoader, FiInbox } from 'react-icons/fi';
import InteractiveStoryService from '../../services/interactiveStoryService';
import { API_BASE_URL } from '../../utils/apiClient';

const PengerjaanCeritaModal = ({ isOpen, story, onClose }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && story) {
            setLoading(true);
            InteractiveStoryService.getSubmissions(story.id)
                .then(response => {
                    setSubmissions(response.data);
                })
                .catch(error => {
                    console.error("Gagal memuat data pengerjaan:", error);
                    setSubmissions([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [isOpen, story]);

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[70vh]">
                <header className="p-5 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-sesm-deep">Pengerjaan Cerita</h3>
                        <p className="text-sm text-gray-500">{story.title}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><FiX size={22}/></button>
                </header>
                <main className="flex-grow overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                    ) : submissions.length > 0 ? (
                        <div className="space-y-3">
                            {submissions.map((sub, index) => (
                                <div key={index} className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{sub.nama}</p>
                                        <p className="text-sm text-gray-500">
                                            Selesai pada: {new Date(sub.completed_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                        Akhir: {sub.ending_key}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
                           <FiInbox size={48}/>
                           <p className="mt-2 font-semibold">Belum ada siswa yang menyelesaikan.</p>
                        </div>
                    )}
                </main>
            </motion.div>
        </motion.div>
    );
};

export default PengerjaanCeritaModal;
