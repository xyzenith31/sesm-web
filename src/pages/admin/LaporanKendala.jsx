// contoh-sesm-web/pages/admin/LaporanKendala.jsx
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiInbox, FiLoader, FiAlertCircle, FiChevronLeft, FiChevronRight,
    FiTrash2, FiEdit, FiLink, FiCheckSquare, FiTool, 
    FiEye, FiCoffee, FiCheck, FiXCircle, FiCornerDownRight
} from 'react-icons/fi';
import { FaBug, FaLightbulb, FaCommentDots } from 'react-icons/fa'; 
import FeedbackService from '../../services/feedbackService'; 
import CustomSelect from '../../components/ui/CustomSelect';
import Notification from '../../components/ui/Notification';
import { Menu, Transition } from '@headlessui/react'; 

// --- Komponen Modal (Tidak ada perubahan) ---
const NotesModal = ({ isOpen, onClose, initialNotes, onSave, isSaving }) => {
    const [notes, setNotes] = useState(initialNotes || '');
    useEffect(() => { if (isOpen) setNotes(initialNotes || ''); }, [isOpen, initialNotes]);
    if (!isOpen) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Catatan Admin</h3>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal" placeholder="Tambahkan catatan internal..." />
                </div>
                <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse rounded-b-2xl">
                    <button onClick={() => onSave(notes)} disabled={isSaving} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sesm-deep text-base font-medium text-white hover:bg-opacity-90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400"> {isSaving ? 'Menyimpan...' : 'Simpan Catatan'} </button>
                    <button onClick={onClose} type="button" disabled={isSaving} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"> Batal </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Komponen Utama Halaman ---
const LaporanKendala = () => {
    const API_URL = 'http://localhost:8080'; 
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [filters, setFilters] = useState({ status: 'semua', type: 'semua', page: 1, limit: 10 });
    const [sort, setSort] = useState({ sortBy: 'created_at', sortDir: 'DESC' }); 

    const [notif, setNotif] = useState({ isOpen: false, title: '', message: '', success: true, isConfirmation: false, onConfirm: () => {} });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingNotesReport, setEditingNotesReport] = useState(null);

    const statusOptions = [ { value: 'semua', label: 'Semua Status' }, { value: 'baru', label: 'Baru' }, { value: 'dilihat', label: 'Dilihat' }, { value: 'diproses', label: 'Diproses' }, { value: 'selesai', label: 'Selesai' }, { value: 'ditolak', label: 'Ditolak' }];
    const typeOptions = [ { value: 'semua', label: 'Semua Tipe' }, { value: 'bug', label: 'Bug' }, { value: 'fitur', label: 'Usul Fitur' }, { value: 'saran', label: 'Saran' }, { value: 'kendala', label: 'Kendala' }];
    const sortOptions = [ { value: 'created_at-DESC', label: 'Terbaru Dibuat' }, { value: 'created_at-ASC', label: 'Terlama Dibuat' }, { value: 'type-ASC', label: 'Tipe (A-Z)' }, { value: 'status-ASC', label: 'Status (A-Z)' }];

    // --- (Fungsi Fetch Data, Handlers, dll tetap sama) ---
    const fetchReports = useCallback(async () => {
        setLoading(true); setError(null);
        const params = { page: filters.page, limit: filters.limit, sortBy: sort.sortBy, sortDir: sort.sortDir };
        if (filters.status !== 'semua') params.status = filters.status;
        if (filters.type !== 'semua') params.type = filters.type;

        try {
            const response = await FeedbackService.getAllFeedbackReports(params);
            setReports(response.data.reports);
            setPagination({ currentPage: response.data.currentPage, totalPages: response.data.totalPages, totalItems: response.data.totalItems });
        } catch (err) {
            setError('Gagal memuat laporan.'); console.error(err);
        } finally { setLoading(false); }
    }, [filters, sort]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleFilterChange = (name, value) => setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    const handleSortChange = (value) => { const [sortBy, sortDir] = value.split('-'); setSort({ sortBy, sortDir }); };
    const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= pagination.totalPages) setFilters(prev => ({ ...prev, page: newPage })); };

    const handleUpdateStatus = async (reportId, newStatus) => {
        setIsSubmitting(true);
        try {
            await FeedbackService.updateFeedbackStatus(reportId, newStatus);
            fetchReports(); 
            setNotif({ isOpen: true, title: "Sukses", message: "Status laporan diperbarui.", success: true });
        } catch (err) { setNotif({ isOpen: true, title: "Gagal", message: "Gagal memperbarui status.", success: false }); } 
        finally { setIsSubmitting(false); }
    };

    const handleSaveNotes = async (notes) => {
        if (!editingNotesReport) return;
        setIsSubmitting(true);
        try {
            await FeedbackService.updateFeedbackAdminNotes(editingNotesReport.id, notes);
            setEditingNotesReport(null); 
            fetchReports(); 
            setNotif({ isOpen: true, title: "Sukses", message: "Catatan disimpan.", success: true });
        } catch (err) { setNotif({ isOpen: true, title: "Gagal", message: "Gagal menyimpan catatan.", success: false }); } 
        finally { setIsSubmitting(false); }
    };

    const handleDelete = (report) => setNotif({ isOpen: true, title: "Konfirmasi Hapus", message: `Yakin hapus laporan "${report.title || report.type}" ini?`, isConfirmation: true, success: false, onConfirm: () => confirmDelete(report.id), confirmText: "Ya, Hapus" });
    const confirmDelete = async (reportId) => {
        setIsSubmitting(true); setNotif(prev => ({ ...prev, isOpen: false })); await new Promise(resolve => setTimeout(resolve, 300));
        try {
            await FeedbackService.deleteFeedbackReport(reportId);
            setNotif({ isOpen: true, title: "Sukses", message: "Laporan dihapus.", success: true });
            fetchReports(); 
        } catch (err) { setNotif({ isOpen: true, title: "Gagal", message: "Gagal menghapus laporan.", success: false }); } 
        finally { setIsSubmitting(false); }
    };

    // --- (Helper UI tetap sama) ---
    const getStatusBadge = (status) => { 
        switch (status) { 
            case 'baru': return <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full"><FiInbox size={12}/>Baru</span>; 
            case 'dilihat': return <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full"><FiEye size={12}/>Dilihat</span>; 
            case 'diproses': return <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full"><FiCoffee size={12}/>Diproses</span>; 
            case 'selesai': return <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full"><FiCheck size={12}/>Selesai</span>; 
            case 'ditolak': return <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full"><FiXCircle size={12}/>Ditolak</span>; 
            default: return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">{status}</span>; 
        } 
    };
    const getTypeIcon = (type) => { 
        switch (type) { 
            case 'bug': return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-500" title="Bug"><FaBug /></div>; 
            case 'fitur': return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-500" title="Usul Fitur"><FaLightbulb /></div>; 
            case 'saran': return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-500" title="Saran"><FaCommentDots /></div>; 
            case 'kendala': return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-100 text-orange-500" title="Kendala"><FiTool /></div>; 
            default: return <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-500" title="Lainnya"><FiAlertCircle /></div>; 
        } 
    };

    return (
        <>
            <AnimatePresence> {editingNotesReport && <NotesModal isOpen={true} onClose={() => setEditingNotesReport(null)} initialNotes={editingNotesReport.admin_notes} onSave={handleSaveNotes} isSaving={isSubmitting} /> } </AnimatePresence>
            <Notification isOpen={notif.isOpen} onClose={() => setNotif({ ...notif, isOpen: false })} onConfirm={notif.onConfirm} title={notif.title} message={notif.message} isConfirmation={notif.isConfirmation} success={notif.success} confirmText={notif.isConfirmation ? (isSubmitting ? 'Memproses...' : (notif.confirmText || 'Ya')) : 'Oke'} cancelText="Batal" />

            <div className="bg-white p-6 rounded-xl shadow-lg flex-grow flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200"> 
                    <h1 className="text-3xl font-bold text-sesm-deep flex items-center gap-3"> <FiTool /> Laporan Kendala & Saran </h1> 
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap"> 
                        <div className="w-full sm:w-40"><CustomSelect options={statusOptions} value={filters.status} onChange={(v) => handleFilterChange('status', v)} /></div> 
                        <div className="w-full sm:w-40"><CustomSelect options={typeOptions} value={filters.type} onChange={(v) => handleFilterChange('type', v)} /></div> 
                        <div className="w-full sm:w-44"><CustomSelect options={sortOptions} value={`${sort.sortBy}-${sort.sortDir}`} onChange={handleSortChange} /></div> 
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto -mx-6 px-6">
                    {loading ? ( <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-4xl text-sesm-teal" /></div> 
                    ) : error ? ( <div className="text-center text-red-500 py-16"><FiAlertCircle className="mx-auto text-4xl mb-2" /><p>{error}</p></div> 
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="text-xs text-gray-800 uppercase bg-gray-100 sticky top-0 z-10"> 
                                    <tr> 
                                        <th scope="col" className="px-4 py-3 w-10">Tipe</th> 
                                        <th scope="col" className="px-6 py-3">Judul / Deskripsi</th> 
                                        <th scope="col" className="px-6 py-3">Pelapor</th> 
                                        <th scope="col" className="px-6 py-3">Halaman</th> 
                                        <th scope="col" className="px-6 py-3">Lampiran</th> 
                                        <th scope="col" className="px-6 py-3">Tanggal</th> 
                                        <th scope="col" className="px-6 py-3">Status</th> 
                                        <th scope="col" className="px-6 py-3 text-center">Aksi</th> 
                                    </tr> 
                                </thead>
                                
                                <tbody className="divide-y divide-gray-100">
                                    <AnimatePresence>
                                        {reports.map(report => (
                                            <motion.tr key={report.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-gray-50 align-top">
                                                <td className="px-4 py-4">{getTypeIcon(report.type)}</td>
                                                <td className="px-6 py-4 max-w-xs"> 
                                                    <p className="font-bold text-sesm-deep capitalize">{report.title || `(${report.type})`}</p> 
                                                    <p className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{report.description}</p> 
                                                    {report.admin_notes && (
                                                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                                            <div className="flex gap-2">
                                                                <FiCornerDownRight size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="text-xs font-bold text-purple-800">Catatan Admin:</p>
                                                                    <p className="text-xs text-purple-700 mt-1 whitespace-pre-wrap">
                                                                        {report.admin_notes}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )} 
                                                </td>
                                                <td className="px-6 py-4"> 
                                                    <p className="font-semibold text-gray-800">{report.reporter_nama || <span className='italic text-gray-400'>N/A</span>}</p>
                                                    <p className="text-xs text-gray-500">{report.reporter_username || report.reporter_email}</p>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">{report.page_context || '-'}</td>
                                                <td className="px-6 py-4"> {report.attachment_url ? <a href={`${API_URL}${report.attachment_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1"> <FiLink size={14}/> Lihat </a> : '-'} </td>
                                                <td className="px-6 py-4 text-gray-500 text-xs">{new Date(report.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                                <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className='flex justify-center items-center gap-1'>
                                                        <Menu as="div" className="relative inline-block text-left">
                                                            <Menu.Button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" title="Ubah Status" disabled={isSubmitting}> <FiCheckSquare size={16}/> </Menu.Button>
                                                            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                                                                <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-20">
                                                                    
                                                                    {/* --- ✅ PERBAIKAN ERROR DI SINI --- */}
                                                                    <div className="px-1 py-1"> 
                                                                        {statusOptions.filter(s => s.value !== 'semua').map(s => ( 
                                                                            <Menu.Item
                                                                                key={s.value}
                                                                                as="button" // Gunakan 'as="button"'
                                                                                onClick={() => handleUpdateStatus(report.id, s.value)}
                                                                                disabled={isSubmitting}
                                                                                className={({ active }) => // Pindahkan className ke sini
                                                                                    `${ active ? 'bg-sesm-teal text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm disabled:text-gray-400`
                                                                                }
                                                                            >
                                                                                {s.label}
                                                                            </Menu.Item>
                                                                        ))} 
                                                                    </div>
                                                                    {/* --- AKHIR PERBAIKAN --- */}

                                                                </Menu.Items>
                                                            </Transition>
                                                        </Menu>
                                                        <button onClick={() => setEditingNotesReport(report)} className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" title="Edit Catatan Admin" disabled={isSubmitting}><FiEdit size={16}/></button>
                                                        <button onClick={() => handleDelete(report)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" title="Hapus Laporan" disabled={isSubmitting}><FiTrash2 size={16}/></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                    
                                    {reports.length === 0 && !loading && (
                                        <tr>
                                            <td colSpan="8" className="text-center text-gray-400 py-16">
                                                <FiInbox size={40} className="mx-auto mb-3"/>
                                                <span className="font-semibold">Tidak ada laporan</span>
                                                <p className="text-sm">Saat ini tidak ada laporan yang sesuai dengan filter.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                {!loading && pagination.totalPages > 1 && ( 
                    <div className="flex justify-between items-center pt-4 mt-4 border-t flex-shrink-0"> 
                        <span className="text-sm text-gray-500"> 
                            Hal <span className="font-bold">{pagination.currentPage}</span> dari <span className="font-bold">{pagination.totalPages}</span> (Total {pagination.totalItems} laporan)
                        </span> 
                        <div className="flex gap-2"> 
                            <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><FiChevronLeft/></button> 
                            <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><FiChevronRight/></button> 
                        </div> 
                    </div> 
                )}
            </div>
        </>
    );
};

export default LaporanKendala;