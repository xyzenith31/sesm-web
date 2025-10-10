// src/components/DraftsModal.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiFileText, FiTrash2 } from 'react-icons/fi';

const DraftsModal = ({ isOpen, onClose, allData, onContinue, onDelete }) => {
    const [drafts, setDrafts] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const allKeys = Object.keys(localStorage);
            const draftKeys = allKeys.filter(key => key.startsWith('question_draft_'));
            
            const loadedDrafts = draftKeys.map(key => {
                try {
                    const chapterId = key.replace('question_draft_', '');
                    const draftData = JSON.parse(localStorage.getItem(key));
                    
                    let chapterTitle = 'Bab Tidak Ditemukan';
                    // --- PERBAIKAN LOGIKA PENCARIAN JUDUL ---
                    if (allData) {
                        for (const mapelName in allData) {
                            const mapel = allData[mapelName];
                            const found = mapel.chapters.find(ch => ch.materiKey === chapterId);
                            if (found) {
                                chapterTitle = found.judul;
                                break;
                            }
                        }
                    }
                    
                    return {
                        key,
                        chapterId,
                        title: chapterTitle,
                        questionCount: draftData.questions?.length || 0,
                        lastSaved: new Date(draftData.lastSaved).toLocaleString('id-ID')
                    };
                } catch (e) {
                    console.error("Gagal memuat draf:", key, e);
                    return null; // Abaikan draf yang korup
                }
            }).filter(Boolean); // Hapus hasil null

            setDrafts(loadedDrafts);
        }
    }, [isOpen, allData]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[70vh]">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-sesm-deep">Soal Tersimpan (Draf)</h3>
                        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><FiX size={20}/></button>
                    </div>
                     <p className="text-sm text-gray-500">Lanjutkan mengerjakan atau hapus draf yang sudah tidak diperlukan.</p>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    {drafts.length > 0 ? (
                        <div className="space-y-3">
                            {drafts.map(draft => (
                                <div key={draft.key} className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <FiFileText className="text-sesm-teal" size={24}/>
                                        <div>
                                            <p className="font-bold text-gray-800">{draft.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {draft.questionCount} soal tersimpan • Terakhir diubah: {draft.lastSaved}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onDelete(draft.key)} className="p-2 text-red-500 hover:bg-red-100 rounded-md" title="Hapus Draf">
                                            <FiTrash2/>
                                        </button>
                                        <button onClick={() => onContinue(draft.chapterId)} className="px-4 py-2 text-sm bg-sesm-teal text-white font-semibold rounded-md hover:bg-sesm-deep">
                                            Lanjutkan
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 h-full flex flex-col justify-center items-center">
                           <FiFileText size={48}/>
                           <p className="mt-2 font-semibold">Tidak ada draf tersimpan.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DraftsModal;