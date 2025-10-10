// contoh-sesm-web/pages/admin/ManajemenNilai.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FiLoader, FiAlertCircle, FiCheckCircle, FiEdit, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataService from '../../services/dataService';
import SubmissionDetailModal from '../../components/SubmissionDetailModal';

const jenjangOptions = {
    'TK': { jenjang: 'TK', kelas: null },
    'SD Kelas 1': { jenjang: 'SD', kelas: 1 },
    'SD Kelas 2': { jenjang: 'SD', kelas: 2 },
    'SD Kelas 3': { jenjang: 'SD', kelas: 3 },
    'SD Kelas 4': { jenjang: 'SD', kelas: 4 },
    'SD Kelas 5': { jenjang: 'SD', kelas: 5 },
    'SD Kelas 6': { jenjang: 'SD', kelas: 6 },
};

const ManajemenNilai = () => {
    const [selectedFilterKey, setSelectedFilterKey] = useState('TK');
    const [materiList, setMateriList] = useState({});
    const [selectedChapterId, setSelectedChapterId] = useState('');
    
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        const { jenjang, kelas } = jenjangOptions[selectedFilterKey];
        setLoading(true);
        setSelectedChapterId('');
        setSubmissions([]);
        DataService.getMateriForAdmin(jenjang, kelas)
            .then(response => setMateriList(response.data))
            .finally(() => setLoading(false));
    }, [selectedFilterKey]);

    useEffect(() => {
        if (!selectedChapterId) {
            setSubmissions([]);
            return;
        };
        setSubmissionsLoading(true);
        DataService.getSubmissionsForChapter(selectedChapterId)
            .then(response => setSubmissions(response.data))
            .finally(() => setSubmissionsLoading(false));
    }, [selectedChapterId]);
    
    const chapterOptions = useMemo(() => {
        return Object.values(materiList).flatMap(mapel => mapel.chapters);
    }, [materiList]);

    const handleGradeSubmitted = () => {
        setSelectedSubmission(null);
        // Refresh data setelah menilai
        if (selectedChapterId) {
            setSubmissionsLoading(true);
            DataService.getSubmissionsForChapter(selectedChapterId)
                .then(response => setSubmissions(response.data))
                .finally(() => setSubmissionsLoading(false));
        }
    };
    
    return (
        <>
            {selectedSubmission && (
                <SubmissionDetailModal 
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    onGradeSubmitted={handleGradeSubmitted}
                />
            )}
            <div>
                <h1 className="text-3xl font-bold text-sesm-deep mb-6">Manajemen Nilai Siswa</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    {/* KOLOM FILTER */}
                    <div className="md:col-span-1 bg-white p-4 rounded-xl shadow-md space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Pilih Jenjang & Kelas</label>
                            <select value={selectedFilterKey} onChange={(e) => setSelectedFilterKey(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sesm-teal">
                                {Object.keys(jenjangOptions).map(key => (<option key={key} value={key}>{key}</option>))}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Pilih Bab</label>
                            <select value={selectedChapterId} onChange={(e) => setSelectedChapterId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sesm-teal" disabled={loading}>
                                <option value="">-- Harap Pilih Bab --</option>
                                {chapterOptions.map(chap => (
                                    <option key={chap.chapter_id} value={chap.chapter_id}>{chap.judul}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* KOLOM DAFTAR SISWA */}
                    <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md min-h-[60vh]">
                        <h2 className="text-xl font-bold text-sesm-deep border-b pb-3 mb-4">Daftar Hasil Pengerjaan</h2>
                        {submissionsLoading ? (
                            <div className="flex justify-center items-center h-48"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                        ) : !selectedChapterId ? (
                            <div className="text-center text-gray-400 py-16"><p>Silakan pilih jenjang dan bab terlebih dahulu.</p></div>
                        ) : submissions.length === 0 ? (
                            <div className="text-center text-gray-400 py-16"><p>Belum ada siswa yang mengerjakan bab ini.</p></div>
                        ) : (
                            <div className="space-y-3">
                                {submissions.map(sub => (
                                    <motion.div key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-50 border rounded-lg p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-gray-800">{sub.student_name}</p>
                                            <p className="text-sm text-gray-500">
                                                Mengumpulkan: {new Date(sub.submission_date).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <div>
                                            {sub.status === 'dinilai' ? (
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-sesm-teal">{sub.score}</p>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sub.is_graded_by_system ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                        {sub.is_graded_by_system ? 'Otomatis' : 'Manual'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <button onClick={() => setSelectedSubmission(sub)} className="px-4 py-2 text-sm bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 flex items-center gap-2">
                                                    <FiClock size={14}/> Beri Nilai
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManajemenNilai;