// contoh-sesm-web/pages/admin/ManajemenNilaiBookmark.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSearch, FiLoader, FiInbox, FiBarChart2, FiCheckCircle, FiStar, FiEdit } from 'react-icons/fi';
import BookmarkService from '../../services/bookmarkService';
import SubmissionDetailBookmarkModal from '../../components/admin/SubmissionDetailBookmarkModal';
import CustomSelect from '../../components/ui/CustomSelect'; // 1. Impor CustomSelect

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

const ManajemenNilaiBookmark = ({ onNavigate }) => {
    const [bookmarks, setBookmarks] = useState([]);
    const [selectedBookmarkId, setSelectedBookmarkId] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBookmarks = useCallback(() => {
        setLoading(true);
        BookmarkService.getAllBookmarks()
            .then(res => setBookmarks(res.data))
            .catch(err => console.error("Gagal memuat bookmarks:", err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchBookmarks();
    }, [fetchBookmarks]);

    const fetchSubmissions = useCallback(() => {
        if (!selectedBookmarkId) {
            setSubmissions([]);
            return;
        }
        setSubmissionsLoading(true);
        BookmarkService.getSubmissions(selectedBookmarkId)
            .then(res => setSubmissions(res.data))
            .catch(err => console.error("Gagal memuat submissions:", err))
            .finally(() => setSubmissionsLoading(false));
    }, [selectedBookmarkId]);

    useEffect(() => {
        fetchSubmissions();
    }, [selectedBookmarkId, fetchSubmissions]);

    // 2. Format data bookmark untuk CustomSelect
    const bookmarkOptions = useMemo(() => 
        bookmarks.map(bm => ({
            value: bm.id,
            label: bm.title
        })), 
    [bookmarks]);

    const filteredSubmissions = useMemo(() => {
        if (!searchTerm) return submissions;
        return submissions.filter(sub =>
            sub.student_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [submissions, searchTerm]);

    const summaryStats = useMemo(() => {
        const graded = submissions.filter(s => s.status === 'dinilai' && s.score !== null);
        if (graded.length === 0) return { count: submissions.length, avgScore: 'N/A', highScore: 'N/A' };
        const totalScore = graded.reduce((sum, s) => sum + s.score, 0);
        return {
            count: submissions.length,
            avgScore: Math.round(totalScore / graded.length),
            highScore: Math.max(...graded.map(s => s.score)),
        };
    }, [submissions]);

    const handleGradeSubmitted = () => {
        setSelectedSubmission(null);
        fetchSubmissions(); // Refresh data
    };

    return (
        <>
            {selectedSubmission && (
                <SubmissionDetailBookmarkModal
                    submission={selectedSubmission}
                    onClose={() => setSelectedSubmission(null)}
                    onGradeSubmitted={handleGradeSubmitted}
                />
            )}
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <motion.button
                        onClick={() => onNavigate('manajemenBookmark')}
                        className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        whileTap={{ scale: 0.9 }}
                    >
                        <FiArrowLeft size={24} className="text-gray-700" />
                    </motion.button>
                    <h1 className="text-3xl font-bold text-sesm-deep">Manajemen Nilai Bookmark</h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-xl shadow-md min-h-[75vh]"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Pilih Materi Bookmark</label>
                            {/* 3. Ganti <select> dengan <CustomSelect> */}
                            <CustomSelect
                                options={bookmarkOptions}
                                value={selectedBookmarkId}
                                onChange={setSelectedBookmarkId}
                                placeholder={loading ? 'Memuat...' : '-- Pilih Materi --'}
                            />
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-600 mb-1">Cari Nama Siswa</label>
                            <FiSearch className="absolute top-9 left-3 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Ketik nama siswa..."
                                className="w-full p-2 pl-10 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                                disabled={!selectedBookmarkId}
                            />
                        </div>
                    </div>

                    {submissionsLoading ? (
                        <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin text-3xl text-sesm-teal" /></div>
                    ) : !selectedBookmarkId ? (
                        <div className="text-center text-gray-400 py-24"><FiInbox size={48} className="mx-auto mb-2" /><p>Silakan pilih materi terlebih dahulu untuk melihat hasil pengerjaan.</p></div>
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
                                            <motion.tr key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                                                <td className="px-6 py-4 font-bold text-gray-800">{sub.student_name}</td>
                                                <td className="px-6 py-4">{new Date(sub.submission_date).toLocaleString('id-ID')}</td>
                                                <td className="px-6 py-4">
                                                    {sub.status === 'dinilai' ? (
                                                        <span className="flex items-center gap-2 text-green-700 font-semibold">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div> Selesai
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2 text-yellow-700 font-semibold">
                                                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse"></div> Menunggu
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-lg text-sesm-teal text-right">{sub.score ?? '--'}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => setSelectedSubmission(sub)} className="font-medium text-sesm-deep hover:underline flex items-center gap-1 mx-auto">
                                                        <FiEdit size={14} /> {sub.status === 'dinilai' ? 'Lihat/Ubah' : 'Beri Nilai'}
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="text-center text-gray-400 py-16">
                                                    <p>Tidak ada data pengerjaan untuk materi ini.</p>
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

export default ManajemenNilaiBookmark;