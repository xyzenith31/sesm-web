import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiLoader, FiAlertCircle, FiEdit, FiSave, FiX, FiBookmark } from 'react-icons/fi';
import BookmarkService from '../../services/bookmarkService';
import Notification from '../../components/Notification';

// --- Modal Penilaian (Tidak Berubah) ---
const SubmissionDetailModal = ({ submission, onClose, onGradeSubmitted }) => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (submission) {
            setLoading(true);
            BookmarkService.getSubmissionDetails(submission.id)
                .then(res => {
                    const formattedDetails = res.data.map(d => ({...d, is_correct: d.is_correct === null ? null : Boolean(d.is_correct)}));
                    setDetails(formattedDetails);
                    const correctCount = formattedDetails.filter(d => d.is_correct === true).length;
                    const calculatedScore = formattedDetails.length > 0 ? Math.round((correctCount / formattedDetails.length) * 100) : 0;
                    setScore(submission.score ?? calculatedScore);
                })
                .finally(() => setLoading(false));
        }
    }, [submission]);

    const toggleCorrectness = (answerId) => {
        const newDetails = details.map(d => d.id === answerId ? { ...d, is_correct: d.is_correct === null ? true : !d.is_correct } : d);
        setDetails(newDetails);
        const correctCount = newDetails.filter(d => d.is_correct === true).length;
        setScore(newDetails.length > 0 ? Math.round((correctCount / newDetails.length) * 100) : 0);
    };

    const handleGrade = async () => {
        try {
            const answerPayload = details.map(({ id, is_correct }) => ({ id, is_correct }));
            await BookmarkService.gradeSubmission(submission.id, score, answerPayload);
            onGradeSubmitted();
        } catch (error) { alert("Gagal menyimpan nilai."); }
    };
    
    return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"><motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[85vh]"><header className="p-5 border-b flex justify-between items-center"><h3 className="text-xl font-bold">Nilai Pengerjaan: {submission.student_name}</h3><button onClick={onClose}><FiX/></button></header><main className="flex-grow overflow-y-auto p-6 bg-gray-50">{loading ? <div className="flex justify-center"><FiLoader className="animate-spin"/></div> : details.map(item => (<div key={item.id} className="bg-white p-4 rounded-lg border mb-4"><p className="font-bold text-gray-800">{item.question_index + 1}. {item.question_text}</p><div className="mt-2 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg"><p>{item.answer_text || "(Tidak dijawab)"}</p></div><div className="mt-3 pt-3 border-t flex justify-end gap-2"><button onClick={() => toggleCorrectness(item.id)} className={`flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-md ${item.is_correct === false ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>Salah</button><button onClick={() => toggleCorrectness(item.id)} className={`flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-md ${item.is_correct === true ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}>Benar</button></div></div>))}</main><footer className="p-5 border-t flex justify-between items-center bg-white"><div className="flex items-center gap-3"><label className="font-bold text-lg">Nilai Akhir:</label><input type="number" value={score} onChange={e => setScore(e.target.value)} className="w-24 p-2 text-lg font-bold border rounded-lg" /></div><button onClick={handleGrade} className="px-6 py-3 bg-sesm-deep text-white rounded-lg font-semibold">Simpan Nilai</button></footer></motion.div></motion.div> );
};


// --- Komponen Modal Tambah/Edit Materi (Tidak Berubah) ---
const MaterialFormModal = ({ isOpen, onClose, onSave, initialData }) => {
    const isEditMode = Boolean(initialData);
    const [formData, setFormData] = useState({ title: '', description: '', subject: '', url_link: '', grading_type: 'manual' });
    const [tasks, setTasks] = useState([]);
    const [mainFile, setMainFile] = useState(null);
    const [coverImage, setCoverImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({ title: initialData.title, description: initialData.description, subject: initialData.subject, url_link: initialData.url, grading_type: initialData.grading_type });
            setTasks(initialData.tasks || []);
        } else {
            setFormData({ title: '', description: '', subject: '', url_link: '', grading_type: 'manual' });
            setTasks([]);
        }
        setMainFile(null);
        setCoverImage(null);
    }, [initialData, isOpen]);

    const handleTaskChange = (index, value) => { const newTasks = [...tasks]; newTasks[index] = value; setTasks(newTasks); };
    const addTask = () => setTasks([...tasks, '']);
    const removeTask = (index) => setTasks(tasks.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        const data = isEditMode ? {} : new FormData();
        
        if (isEditMode) {
            Object.assign(data, { ...formData, tasks: JSON.stringify(tasks.filter(t => t.trim() !== '')) });
        } else {
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('subject', formData.subject);
            data.append('url_link', formData.url_link);
            data.append('grading_type', formData.grading_type);
            data.append('tasks', JSON.stringify(tasks.filter(t => t.trim() !== '')));
            if (mainFile) data.append('mainFile', mainFile);
            if (coverImage) data.append('coverImage', coverImage);
        }
        
        await onSave(data, initialData?.id);
        setIsSaving(false);
    };

    const inputStyle = "w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal";

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col">
                <form onSubmit={handleSubmit}>
                    <header className="p-6 border-b"><h3 className="text-xl font-bold text-sesm-deep">{isEditMode ? 'Edit Materi & Soal' : 'Tambah Materi Baru'}</h3></header>
                    <main className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div><label className="font-semibold text-sm">Judul</label><input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={inputStyle} required /></div>
                        <div><label className="font-semibold text-sm">Mapel</label><input type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className={inputStyle} required /></div>
                        <div><label className="font-semibold text-sm">Deskripsi</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`${inputStyle} h-20`}></textarea></div>
                        {!isEditMode && ( <> <div><label className="font-semibold text-sm">File Utama (PDF, Video, dll.)</label><div className="border-2 border-dashed p-4 mt-1"><input type="file" id="main-upload" className="hidden" onChange={(e) => setMainFile(e.target.files[0])} /><label htmlFor="main-upload" className="cursor-pointer text-sesm-teal font-semibold flex items-center gap-2"> {mainFile ? mainFile.name : "Pilih file..."}</label></div></div><div><label className="font-semibold text-sm">Atau Link Video</label><input type="url" value={formData.url_link} onChange={(e) => setFormData({...formData, url_link: e.target.value})} className={inputStyle} /></div><div><label className="font-semibold text-sm">Gambar Sampul</label><div className="border-2 border-dashed p-4 mt-1"><input type="file" id="cover-upload" className="hidden" onChange={(e) => setCoverImage(e.target.files[0])} accept="image/*" /><label htmlFor="cover-upload" className="cursor-pointer text-sesm-teal font-semibold flex items-center gap-2">{coverImage ? coverImage.name : "Pilih gambar..."}</label></div></div> </>)}
                        <div className="border-t pt-4 space-y-3">
                            <div><label className="font-semibold text-sm">Tipe Penilaian</label><select value={formData.grading_type} onChange={(e) => setFormData({...formData, grading_type: e.target.value})} className={`${inputStyle} mt-1`}><option value="manual">Manual (Guru menilai)</option><option value="otomatis">Otomatis (Sistem menilai)</option></select><p className="text-xs text-gray-500 mt-1">Untuk penilaian otomatis, tulis soal dengan format: `Pertanyaan@@KunciJawaban`</p></div>
                            <h4 className="font-semibold">Soal / Tugas</h4>
                            {tasks.map((task, index) => (<div key={index} className="flex items-center gap-2"><input type="text" value={task} onChange={(e) => handleTaskChange(index, e.target.value)} placeholder={`Soal #${index + 1}`} className={inputStyle} /><button type="button" onClick={() => removeTask(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><FiTrash2/></button></div>))}
                            <button type="button" onClick={addTask} className="text-sm font-semibold text-sesm-teal"><FiPlus className="inline"/> Tambah Soal</button>
                        </div>
                    </main>
                    <footer className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t"><button type="button" onClick={onClose} className="px-5 py-2">Batal</button><button type="submit" disabled={isSaving} className="px-5 py-2 bg-sesm-deep text-white rounded-lg flex items-center gap-2">{isSaving ? 'Menyimpan...' : 'Simpan'}</button></footer>
                </form>
            </motion.div>
        </motion.div>
    );
};


const ManajemenBookmark = () => {
    const [activeTab, setActiveTab] = useState('materi');
    const [bookmarks, setBookmarks] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const [selectedBookmarkId, setSelectedBookmarkId] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    
    const fetchBookmarks = useCallback(async (selectIdAfterFetch = null) => {
        setLoading(true);
        try {
            const response = await BookmarkService.getAllBookmarks();
            setBookmarks(response.data);
            const initialId = selectIdAfterFetch || response.data[0]?.id;
            if (initialId) {
                setSelectedBookmarkId(initialId);
                if (activeTab === 'nilai') {
                    handleSelectBookmarkForGrading(initialId);
                }
            }
        } catch (error) {
            setNotif({ isOpen: true, message: "Gagal memuat materi.", success: false });
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

    const handleOpenModal = (material = null) => { setEditingMaterial(material); setIsModalOpen(true); };
    
    const handleSave = async (data, id) => {
        try {
            if (id) {
                await BookmarkService.updateBookmark(id, data);
                setNotif({ isOpen: true, message: "Materi berhasil diperbarui!", success: true });
            } else {
                await BookmarkService.createBookmark(data);
                setNotif({ isOpen: true, message: "Materi baru berhasil ditambahkan!", success: true });
            }
            setIsModalOpen(false);
            fetchBookmarks(id);
        } catch (error) {
            setNotif({ 
                isOpen: true, 
                message: error.response?.data?.message || "Gagal menyimpan. Periksa kembali isian Anda.", 
                success: false 
            });
        }
    };
    
    const handleDelete = async (id, title) => {
        if (window.confirm(`Yakin ingin menghapus materi "${title}"?`)) {
            try {
                await BookmarkService.deleteBookmark(id);
                setNotif({ isOpen: true, message: "Materi berhasil dihapus.", success: true });
                setBookmarks(prev => prev.filter(b => b.id !== id));
            } catch (error) {
                setNotif({ isOpen: true, message: "Gagal menghapus materi.", success: false });
            }
        }
    };

    const handleSelectBookmarkForGrading = async (bookmarkId) => {
        setLoading(true);
        setSelectedBookmarkId(bookmarkId);
        try {
            const res = await BookmarkService.getSubmissions(bookmarkId);
            setSubmissions(res.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isModalOpen && <MaterialFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingMaterial} />}
                {selectedSubmission && <SubmissionDetailModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} onGradeSubmitted={() => { setSelectedSubmission(null); handleSelectBookmarkForGrading(selectedBookmarkId); }} />}
            </AnimatePresence>
            <Notification isOpen={notif.isOpen} onClose={() => setNotif({ ...notif, isOpen: false })} title={notif.success ? "Sukses" : "Error"} message={notif.message} success={notif.success} />

            <div className="bg-white p-6 rounded-xl shadow-lg flex-grow flex flex-col h-full">
                <div className="flex justify-between items-start mb-4 pb-4 border-b">
                    <div>
                        <h1 className="text-3xl font-bold text-sesm-deep flex items-center gap-3"><FiBookmark /> Manajemen Bookmark</h1>
                        <p className="text-gray-500">Kelola materi, soal, dan penilaian untuk siswa.</p>
                    </div>
                    <div className="flex items-center bg-gray-100 rounded-full p-1">
                        <button onClick={() => setActiveTab('materi')} className={`px-4 py-1.5 text-sm font-semibold rounded-full ${activeTab === 'materi' ? 'bg-white shadow text-sesm-deep' : 'text-gray-500'}`}>Daftar Materi</button>
                        <button onClick={() => setActiveTab('nilai')} className={`px-4 py-1.5 text-sm font-semibold rounded-full ${activeTab === 'nilai' ? 'bg-white shadow text-sesm-deep' : 'text-gray-500'}`}>Manajemen Nilai</button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        {loading && <div className="flex-grow flex items-center justify-center py-16"><FiLoader className="animate-spin text-3xl"/></div>}
                        
                        {!loading && activeTab === 'materi' && (
                            <div>
                                <div className="text-right mb-4">
                                    <button onClick={() => handleOpenModal(null)} className="px-4 py-2 bg-sesm-teal text-white font-semibold rounded-lg flex items-center gap-2"><FiPlus/> Tambah Materi</button>
                                </div>
                                {bookmarks.length === 0 ? <div className="text-center py-16 text-gray-400"><FiAlertCircle size={48} className="mx-auto"/><p>Belum ada materi.</p></div> : (
                                    // --- PERBAIKAN TABEL DI SINI ---
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Judul</th>
                                                <th className="px-6 py-3 text-left">Mapel</th>
                                                <th className="px-6 py-3 text-center">Jumlah Soal</th>
                                                <th className="px-6 py-3 text-center">Penilaian</th>
                                                <th className="px-6 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>{bookmarks.map(item => ( <tr key={item.id} className="hover:bg-gray-50 border-b">
                                            <td className="px-6 py-4 font-bold text-gray-800">{item.title}</td>
                                            <td className="px-6 py-4">{item.subject}</td>
                                            <td className="px-6 py-4 text-center">{item.tasks?.length || 0}</td>
                                            <td className="px-6 py-4 capitalize text-center">{item.grading_type}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center items-center gap-4">
                                                    <button onClick={() => handleOpenModal(item)} className="text-blue-600 hover:text-blue-800"><FiEdit/></button>
                                                    <button onClick={() => handleDelete(item.id, item.title)} className="text-red-600 hover:text-red-800"><FiTrash2/></button>
                                                </div>
                                            </td>
                                        </tr>))}</tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {!loading && activeTab === 'nilai' && (
                            <div>
                                <div className="mb-4"><label className="font-semibold text-sm">Pilih Materi untuk Dinilai:</label><select value={selectedBookmarkId || ''} onChange={e => handleSelectBookmarkForGrading(parseInt(e.target.value))} className="w-full mt-1 p-2 border rounded-lg bg-gray-50"><option value="" disabled>-- Pilih Materi --</option>{bookmarks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select></div>
                                {submissions.length === 0 ? <p className="text-center text-gray-400 py-8">Belum ada siswa yang mengerjakan materi ini.</p> : (
                                    // --- PERBAIKAN TABEL DI SINI JUGA ---
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-gray-100">
                                            <tr>
                                                <th className="px-6 py-3 text-left">Nama Siswa</th>
                                                <th className="px-6 py-3 text-left">Tanggal</th>
                                                <th className="px-6 py-3 text-center">Status</th>
                                                <th className="px-6 py-3 text-center">Skor</th>
                                                <th className="px-6 py-3 text-center">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>{submissions.map(sub => (<tr key={sub.id} className="hover:bg-gray-50 border-b">
                                            <td className="px-6 py-4 font-bold">{sub.student_name}</td>
                                            <td className="px-6 py-4">{new Date(sub.submission_date).toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${sub.status === 'dinilai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{sub.status}</span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-center">{sub.score ?? '-'}</td>
                                            <td className="px-6 py-4 text-center"><button onClick={() => setSelectedSubmission(sub)} className="text-blue-600 hover:underline"><FiEdit/></button></td>
                                        </tr>))}</tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </>
    );
};

export default ManajemenBookmark;