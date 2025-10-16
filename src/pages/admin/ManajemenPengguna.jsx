import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiPlus, FiSearch, FiLoader, FiEdit, FiTrash2, FiAlertCircle, FiBriefcase, FiUserCheck, FiArrowUp, FiArrowDown, FiChevronDown } from 'react-icons/fi';
import DataService from '../../services/dataService';
import UserFormModal from '../../components/admin/UserFormModal';
import Notification from '../../components/ui/Notification';

// Komponen Kartu Statistik (tidak ada perubahan)
const StatCard = ({ icon: Icon, value, label, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: delay * 0.1 }}
        className="bg-gray-50 p-4 rounded-lg flex-1 border hover:border-sesm-teal transition-colors"
    >
        <div className="flex items-center">
            <Icon className={`text-xl mr-3 ${color}`} />
            <div>
                <p className="text-2xl font-bold text-sesm-deep">{value}</p>
                <p className="text-xs text-gray-500 font-semibold uppercase">{label}</p>
            </div>
        </div>
    </motion.div>
);

// Komponen Header Tabel dengan Fitur Sortir (tidak ada perubahan)
const SortableHeader = ({ children, column, sortConfig, onSort }) => {
    const isSorted = sortConfig.key === column;
    const direction = isSorted ? sortConfig.direction : 'none';

    return (
        <th scope="col" className="px-6 py-3 cursor-pointer group" onClick={() => onSort(column)}>
            <div className="flex items-center gap-2">
                <span className="group-hover:text-sesm-deep transition-colors">{children}</span>
                <AnimatePresence>
                    {isSorted && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {direction === 'ascending' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </th>
    );
};


const ManajemenPengguna = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('Semua');
    
    const [sortConfig, setSortConfig] = useState({ key: 'nama', direction: 'ascending' });
    
    const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // --- State untuk notifikasi (info, sukses, error, konfirmasi) ---
    const [notif, setNotif] = useState({
        isOpen: false,
        title: '',
        message: '',
        isConfirmation: false,
        success: true,
        onConfirm: () => {},
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await DataService.getAllUsers();
            setUsers(response.data);
        } catch (err) {
            setError('Gagal memuat daftar pengguna.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const processedUsers = useMemo(() => {
        let filtered = users.filter(user =>
            (user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (roleFilter === 'Semua' || user.role === roleFilter.toLowerCase())
        );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA.toLowerCase() < valB.toLowerCase()) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA.toLowerCase() > valB.toLowerCase()) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [users, searchTerm, roleFilter, sortConfig]);

    const stats = useMemo(() => ({
        total: users.length,
        guru: users.filter(u => u.role === 'guru').length,
        siswa: users.filter(u => u.role === 'siswa').length,
    }), [users]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const handleSortChangeFromSelect = (e) => {
        const [key, direction] = e.target.value.split('-');
        setSortConfig({ key, direction });
    };

    const handleOpenUserFormModal = (user = null) => {
        setEditingUser(user);
        setIsUserFormModalOpen(true);
    };

    const handleCloseUserFormModal = () => {
        setIsUserFormModalOpen(false);
        setEditingUser(null);
    };

    // --- FUNGSI SIMPAN DENGAN NOTIFIKASI ---
    const handleSaveUser = async (userData) => {
        setIsSubmitting(true);
        try {
            if (editingUser) {
                await DataService.updateUserByAdmin(editingUser.id, userData);
                setNotif({ isOpen: true, title: "Berhasil!", message: "Data pengguna telah diperbarui.", success: true });
            } else {
                await DataService.createUserByAdmin(userData);
                setNotif({ isOpen: true, title: "Berhasil!", message: "Pengguna baru telah ditambahkan.", success: true });
            }
            fetchUsers();
            handleCloseUserFormModal();
        } catch (err) {
            setNotif({ isOpen: true, title: "Gagal!", message: err.response?.data?.message || 'Terjadi kesalahan.', success: false });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // --- FUNGSI HAPUS DENGAN MODAL KONFIRMASI ---
    const handleDeleteUser = (user) => {
        setNotif({
            isOpen: true,
            title: "Konfirmasi Hapus",
            message: `Anda yakin ingin menghapus pengguna "${user.nama}"?`,
            isConfirmation: true,
            success: false, // Menampilkan ikon peringatan
            onConfirm: () => confirmDeleteUser(user),
        });
    };

    // --- FUNGSI KONFIRMASI HAPUS DENGAN NOTIFIKASI ---
    const confirmDeleteUser = async (user) => {
        if (!user) return;
        setIsSubmitting(true);
        // Tutup modal konfirmasi dulu
        setNotif(prev => ({ ...prev, isOpen: false }));

        try {
            await DataService.deleteUserByAdmin(user.id);
            setNotif({ isOpen: true, title: "Berhasil!", message: `Pengguna "${user.nama}" telah dihapus.`, success: true });
            fetchUsers();
        } catch (err) {
            setNotif({ isOpen: true, title: "Gagal!", message: err.response?.data?.message || 'Gagal menghapus pengguna.', success: false });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getRoleBadge = (role) => {
        return role === 'guru'
            ? <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Guru</span>
            : <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">Siswa</span>;
    };
    
    const filterButtons = ['Semua', 'Guru', 'Siswa'];

    return (
        <>
            <AnimatePresence>
                {isUserFormModalOpen && (
                    <UserFormModal
                        isOpen={isUserFormModalOpen}
                        onClose={handleCloseUserFormModal}
                        onSubmit={handleSaveUser}
                        initialData={editingUser}
                        isSubmitting={isSubmitting} // Kirim status submitting ke modal
                    />
                )}
            </AnimatePresence>
            
            <Notification
                isOpen={notif.isOpen}
                onClose={() => setNotif({ ...notif, isOpen: false })}
                onConfirm={notif.onConfirm}
                title={notif.title}
                message={notif.message}
                isConfirmation={notif.isConfirmation}
                success={notif.success}
                confirmText={isSubmitting ? 'Memproses...' : 'Hapus'}
            />
            
            <div className="bg-white p-6 rounded-xl shadow-lg flex-grow flex flex-col h-full">
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-sesm-deep flex items-center gap-3">
                        <FiUsers />
                        Manajemen Pengguna
                    </h1>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenUserFormModal()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-sesm-teal text-white rounded-lg font-semibold hover:bg-sesm-deep shadow-sm"
                    >
                        <FiPlus /> Tambah Pengguna Baru
                    </motion.button>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard icon={FiUsers} value={loading ? '...' : stats.total} label="Total Pengguna" color="text-purple-500" delay={0}/>
                    <StatCard icon={FiBriefcase} value={loading ? '...' : stats.guru} label="Jumlah Guru" color="text-green-500" delay={1}/>
                    <StatCard icon={FiUserCheck} value={loading ? '...' : stats.siswa} label="Jumlah Siswa" color="text-blue-500" delay={2}/>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex items-center bg-gray-100 rounded-full p-1">
                        {filterButtons.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setRoleFilter(filter)}
                                className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${roleFilter === filter ? 'bg-white text-sesm-deep shadow' : 'text-gray-500'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative">
                            <select
                                value={`${sortConfig.key}-${sortConfig.direction}`}
                                onChange={handleSortChangeFromSelect}
                                className="appearance-none w-full md:w-auto p-3 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal text-sm font-semibold"
                            >
                                <option value="nama-ascending">Urutkan: Nama (A-Z)</option>
                                <option value="nama-descending">Urutkan: Nama (Z-A)</option>
                                <option value="role-ascending">Urutkan: Role (Guru dulu)</option>
                                <option value="role-descending">Urutkan: Role (Siswa dulu)</option>
                            </select>
                            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="relative flex-grow">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Cari pengguna..."
                                className="w-full p-3 pl-12 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto -mx-6 px-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-3xl text-sesm-teal" /></div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-16"><FiAlertCircle className="mx-auto text-4xl mb-2" /><p>{error}</p></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-700">
                                <thead className="text-xs text-gray-800 uppercase bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <SortableHeader column="nama" sortConfig={sortConfig} onSort={handleSort}>Nama Lengkap</SortableHeader>
                                        <SortableHeader column="username" sortConfig={sortConfig} onSort={handleSort}>Username</SortableHeader>
                                        <SortableHeader column="email" sortConfig={sortConfig} onSort={handleSort}>Email</SortableHeader>
                                        <SortableHeader column="role" sortConfig={sortConfig} onSort={handleSort}>Role</SortableHeader>
                                        <th scope="col" className="px-6 py-3 text-center rounded-r-lg">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <AnimatePresence>
                                        {processedUsers.length > 0 ? processedUsers.map(user => (
                                            <motion.tr
                                                key={user.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 font-bold text-sesm-deep">{user.nama}</td>
                                                <td className="px-6 py-4 text-gray-600">{user.username}</td>
                                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className='flex justify-center items-center gap-4'>
                                                        <button onClick={() => handleOpenUserFormModal(user)} className="font-medium text-blue-600 hover:text-blue-800" title="Edit"><FiEdit /></button>
                                                        <button onClick={() => handleDeleteUser(user)} className="font-medium text-red-600 hover:text-red-800" title="Hapus"><FiTrash2 /></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )) : (
                                            <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                <td colSpan="5" className="text-center text-gray-400 py-16">
                                                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ManajemenPengguna;