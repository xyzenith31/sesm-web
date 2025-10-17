// contoh-sesm-web/pages/admin/ManajemenNilai.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { FiLoader, FiSearch, FiStar, FiBarChart2, FiCheckCircle, FiEdit, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import DataService from '../../services/dataService';
import SubmissionDetailModal from '../../components/mod/SubmissionDetailModal';
import CustomSelect from '../../components/ui/CustomSelect';

const jenjangOptions = {
    'TK': { jenjang: 'TK', kelas: null },
    'SD Kelas 1': { jenjang: 'SD', kelas: 1 },
    'SD Kelas 2': { jenjang: 'SD', kelas: 2 },
    'SD Kelas 3': { jenjang: 'SD', kelas: 3 },
    'SD Kelas 4': { jenjang: 'SD', kelas: 4 },
    'SD Kelas 5': { jenjang: 'SD', kelas: 5 },
    'SD Kelas 6': { jenjang: 'SD', kelas: 6 },
};

const jenjangSelectOptions = Object.keys(jenjangOptions).map(key => ({
    value: key,
    label: key,
}));

const StatCard = ({ icon: Icon, value, label, color }) => (
    <div className="bg-gray-50 p-4 rounded-lg flex-1 border">
        <div className="flex items-center">
            <Icon className={`text-xl mr-3 ${color}`} />
            <div>
                <p className="text-xl font-bold text-sesm-deep">{value}</p>
                <p className="text-xs text-gray-500 font-semibold">{label}</p>
            </div>
        </div>
    </div>
);

const ManajemenNilai = ({ onNavigate }) => {
    const [selectedFilterKey, setSelectedFilterKey] = useState('TK');
    const [materiList, setMateriList] = useState({});
    const [selectedChapterId, setSelectedChapterId] = useState('');
    
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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
        DataService.getAllSubmissionsForChapter(selectedChapterId)
            .then(response => setSubmissions(response.data))
            .finally(() => setSubmissionsLoading(false));
    }, [selectedChapterId]);
    
    const chapterOptions = useMemo(() => {
        return Object.values(materiList).flatMap(mapel => 
            mapel.chapters.map(chapter => ({
                value: chapter.chapter_id,
                label: chapter.judul
            }))
        );
    }, [materiList]);

    const filteredSubmissions = useMemo(() => {
        if (!searchTerm) return submissions;
        return submissions.filter(sub => 
            sub.student_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [submissions, searchTerm]);
    
    const summaryStats = useMemo(() => {
        const gradedSubmissions = submissions.filter(s => s.status === 'dinilai' && s.score !== null);
        if (gradedSubmissions.length === 0) {
            return { count: submissions.length, avgScore: 'N/A', highScore: 'N/A' };
        }
        const totalScore = gradedSubmissions.reduce((sum, s) => sum + s.score, 0);
        const avgScore = Math.round(totalScore / gradedSubmissions.length);
        const highScore = Math.max(...gradedSubmissions.map(s => s.score));
        return {
            count: submissions.length,
            avgScore,
            highScore,
        };
    }, [submissions]);

    const handleGradeSubmitted = () => {
        setSelectedSubmission(null);
        if (selectedChapterId) {
            setSubmissionsLoading(true);
            DataService.getAllSubmissionsForChapter(selectedChapterId)
                .then(response => setSubmissions(response.data))
                .finally(() => setSubmissionsLoading(false));
        }
    };
    
    return (
        <>
            {selectedSubmission && (
                <SubmissionDetailModal 
                    submission={selectedSubmission}
                    isViewOnly={false} // <-- ✅ PERBAIKAN DI SINI
                    onClose={() => setSelectedSubmission(null)}
                    onGradeSubmitted={handleGradeSubmitted}
                />
            )}
            <div>
                <div className="flex items-center gap-4 mb-6">
                     <motion.button 
                        onClick={() => onNavigate('manajemenMateri')} 
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        whileTap={{ scale: 0.9 }}
                    >
                        <FiArrowLeft size={24} className="text-gray-700" />
                    </motion.button>
                    <h1 className="text-3xl font-bold text-sesm-deep">Manajemen Nilai Siswa</h1>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-md min-h-[75vh]"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Pilih Jenjang & Kelas</label>
                            <CustomSelect
                                options={jenjangSelectOptions}
                                value={selectedFilterKey}
                                onChange={setSelectedFilterKey}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Pilih Materi</label>
                            <CustomSelect
                                options={chapterOptions}
                                value={selectedChapterId}
                                onChange={setSelectedChapterId}
                                placeholder={loading ? 'Memuat...' : '-- Pilih Materi --'}
                            />
                        </div>
                        <div className="relative">
                             <label className="block text-sm font-bold text-gray-600 mb-1">Cari Nama Siswa</label>
                             <FiSearch className="absolute top-9 left-3 text-gray-400"/>
                             <input 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Ketik nama siswa..."
                                className="w-full p-2 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                                disabled={!selectedChapterId}
                             />
                        </div>
                    </div>

                    {submissionsLoading ? (
                        <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>
                    ) : !selectedChapterId ? (
                        <div className="text-center text-gray-400 py-24"><p>Silakan pilih jenjang dan materi terlebih dahulu untuk melihat hasil pengerjaan.</p></div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h3 className="font-bold text-gray-700 mb-3">Ringkasan Statistik</h3>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                                    <StatCard icon={FiCheckCircle} value={summaryStats.count} label="Total Pengerjaan" color="text-blue-500" />
                                    <StatCard icon={FiBarChart2} value={summaryStats.avgScore} label="Rata-rata Nilai" color="text-green-500" />
                                    <StatCard icon={FiStar} value={summaryStats.highScore} label="Nilai Tertinggi" color="text-orange-500" />
                                </div>
                            </div>
                        
                            <h2 className="text-xl font-bold text-sesm-deep mb-4">Daftar Hasil Pengerjaan</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">No</th>
                                            <th scope="col" className="px-6 py-3">Nama Siswa</th>
                                            <th scope="col" className="px-6 py-3">Tanggal</th>
                                            <th scope="col" className="px-6 py-3">Status</th>
                                            <th scope="col" className="px-6 py-3 text-right">Skor</th>
                                            <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubmissions.length > 0 ? filteredSubmissions.map((sub, index) => (
                                            <motion.tr 
                                                key={sub.id} 
                                                initial={{ opacity: 0 }} 
                                                animate={{ opacity: 1 }}
                                                className="bg-white border-b hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800">{sub.student_name}</td>
                                                <td className="px-6 py-4">{new Date(sub.submission_date).toLocaleString('id-ID')}</td>
                                                <td className="px-6 py-4">
                                                    {sub.status === 'dinilai' ? (
                                                        <span className="flex items-center gap-2 text-green-700">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div> Selesai
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2 text-orange-700">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-orange-500"></div> Menunggu
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-lg text-sesm-teal text-right">{sub.score ?? '--'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => setSelectedSubmission(sub)} 
                                                        className="flex items-center gap-1.5 mx-auto px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-sesm-teal/10 text-sesm-deep hover:bg-sesm-teal/20"
                                                    >
                                                        <FiEdit size={14} /> 
                                                        {sub.status === 'dinilai' ? 'Lihat/Ubah' : 'Beri Nilai'}
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="text-center text-gray-400 py-16">
                                                    <p>Tidak ada siswa yang cocok dengan pencarian Anda.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </>
    );
};

export default ManajemenNilai;