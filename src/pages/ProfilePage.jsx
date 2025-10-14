import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import {
  FiChevronRight, FiUser, FiHelpCircle, FiLogOut, FiTrendingUp,
  FiFeather, FiCheckSquare, FiClock, FiZap, FiAlertTriangle, FiLoader
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';

// --- Komponen-komponen kecil (Helper Components) ---

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                                <FiAlertTriangle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-500 mt-2">{message}</p>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
                            <button onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                                Ya, Logout
                            </button>
                            <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                                Batal
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ranks = [
    { name: 'Murid Baru', points: 0, color: '#CD7F32' },
    { name: 'Siswa Rajin', points: 5000, color: '#C0C0C0' },
    { name: 'Bintang Kelas', points: 12000, color: '#FFD700' },
    { name: 'Juara Harapan', points: 25000, color: '#4682B4' },
    { name: 'Cendekiawan Muda', points: 50000, color: '#9370DB' },
    { name: 'Legenda Sekolah', points: 100000, color: '#FF4500' },
];

const RankCard = ({ currentUserPoints = 0, onNavigate }) => {
    const currentRankIndex = ranks.slice().reverse().findIndex(r => currentUserPoints >= r.points);
    const currentRank = ranks[ranks.length - 1 - currentRankIndex];

    return (
        <motion.button
            onClick={() => onNavigate('rank')}
            className="w-full bg-white p-5 rounded-2xl shadow-sm text-left border hover:border-gray-300"
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-500 text-sm">Peringkat Saat Ini</h3>
                    <p className="text-lg font-bold" style={{ color: currentRank.color }}>{currentRank.name}</p>
                    <p className="text-sm text-gray-600 flex items-center font-semibold">
                        <FiZap className="mr-1 text-yellow-500" /> {currentUserPoints.toLocaleString()} Poin
                    </p>
                </div>
                <FiChevronRight className="text-gray-400" size={24} />
            </div>
        </motion.button>
    );
};

const AnimatedNumber = ({ value = 0 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const controls = animate(0, parseInt(value) || 0, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(latest) { setDisplayValue(Math.round(latest)); }
        });
        return () => controls.stop();
    }, [value]);
    return <>{displayValue.toLocaleString()}</>;
};

const ProfileMenuItem = ({ icon: Icon, label, hasChevron = true, isLogout = false, onClick }) => (
    <motion.button
        onClick={onClick}
        className={`w-full flex items-center justify-between text-left px-5 py-4 bg-white rounded-xl shadow-sm transition-colors ${isLogout ? 'text-red-500' : 'text-gray-700'} hover:bg-gray-50`}
        whileTap={{ scale: 0.98 }}
    >
        <div className="flex items-center space-x-4">
            <Icon className={isLogout ? 'text-red-500' : 'text-sesm-deep'} size={22} />
            <span className="font-semibold">{label}</span>
        </div>
        {hasChevron && <FiChevronRight className="text-gray-400" size={20} />}
    </motion.button>
);

const StatItem = ({ icon: Icon, value, label, color }) => (
    <div className="flex items-center space-x-4 p-3">
        <Icon className={`${color} text-3xl`} />
        <div>
            <p className="text-lg font-bold text-gray-800"><AnimatedNumber value={value} /></p>
            <p className="text-sm text-gray-500 -mt-1">{label}</p>
        </div>
    </div>
);


// --- Komponen Utama Halaman Profil (Struktur Baru) ---
const ProfilePage = ({ onNavigate }) => {
    const { user, logout } = useAuth();
    const { getPointsSummary } = useData();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [pointsData, setPointsData] = useState({ totalPoints: user?.points || 0 });
    const [loadingPoints, setLoadingPoints] = useState(true);
    const API_URL = 'http://localhost:8080';

    useEffect(() => {
        getPointsSummary()
            .then(response => setPointsData(response.data))
            .catch(error => {
                console.error("Gagal memuat ringkasan poin:", error);
                setPointsData({ totalPoints: user?.points || 0 });
            })
            .finally(() => setLoadingPoints(false));
    }, [getPointsSummary, user]);

    const handleLogout = () => {
        setIsLogoutModalOpen(false);
        logout();
    };

    if (!user) {
        return <div className="flex justify-center items-center h-screen"><FiLoader className="animate-spin text-4xl text-sesm-teal" /></div>;
    }

    const userLevel = user.jenjang && user.kelas ? `${user.jenjang} - Kelas ${user.kelas}` : (user.jenjang || 'Belum diatur');
    let userAvatar = `https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${user.username}`;
    if (user.avatar) {
        if (user.avatar.startsWith('http')) {
            userAvatar = user.avatar;
        } else {
            userAvatar = `${API_URL}/${user.avatar}`;
        }
    }

    const userStats = [
        { icon: FiTrendingUp, value: (pointsData.totalPoints), label: 'Total Poin', color: 'text-yellow-500' },
        { icon: FiCheckSquare, value: '8', label: 'Tugas Selesai', color: 'text-green-500' },
        { icon: FiClock, value: '5 Jam', label: 'Waktu Belajar', color: 'text-sky-500' },
    ];

    return (
        <>
            <ConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
                title="Konfirmasi Logout"
                message="Apakah Anda yakin ingin keluar dari akun Anda?"
            />

            {/* --- Tampilan Mobile --- */}
            <div className="md:hidden">
                <div className="bg-gray-100 min-h-screen pb-28">
                    <div className="bg-gradient-to-br from-sesm-teal to-sesm-deep text-white p-6 pb-8 rounded-b-3xl shadow-lg">
                        <h1 className="text-xl font-bold text-center mt-4 mb-6">Profil Saya</h1>
                        <div className="flex items-center space-x-4 mb-6">
                            <img src={userAvatar} alt="User Avatar" className="w-20 h-20 rounded-full border-4 border-sesm-sky object-cover" />
                            <div>
                                <h2 className="text-xl font-bold">{user.nama || user.username}</h2>
                                <p className="text-sm opacity-80">{userLevel}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {userStats.map(stat => (
                                <div key={stat.label} className="bg-white/20 backdrop-blur-sm p-3 rounded-xl flex flex-col items-center justify-center text-center">
                                    <stat.icon className={`${stat.color} text-2xl mb-1`} />
                                    <p className="text-lg font-bold text-white"><AnimatedNumber value={stat.value} /></p>
                                    <p className="text-xs text-white/80">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <main className="p-4 -mt-6">
                        <div className="space-y-4">
                            {loadingPoints ? (
                                <div className="w-full h-24 bg-gray-200 rounded-2xl animate-pulse"></div>
                            ) : (
                                <RankCard currentUserPoints={pointsData.totalPoints} onNavigate={onNavigate} />
                            )}
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-2">Aktivitas Saya</h3>
                                <div className="space-y-3">
                                    <ProfileMenuItem icon={FiTrendingUp} label="Laporan Belajar" onClick={() => onNavigate('studyReport')} />
                                    <ProfileMenuItem icon={FiFeather} label="Buku Harian Saya" onClick={() => onNavigate('diary')} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-2">Pengaturan</h3>
                                <div className="space-y-3">
                                    <ProfileMenuItem icon={FiUser} label="Pengaturan Akun" onClick={() => onNavigate('accountSettings')} />
                                    <ProfileMenuItem icon={FiHelpCircle} label="Pusat Bantuan" />
                                </div>
                            </div>
                            <div className="pt-4">
                                <ProfileMenuItem icon={FiLogOut} label="Logout" hasChevron={false} isLogout={true} onClick={() => setIsLogoutModalOpen(true)} />
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* --- Tampilan Desktop (Struktur Baru) --- */}
            <div className="hidden md:block min-h-screen bg-gray-100 p-8">
                <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Kolom Kiri */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-gradient-to-br from-sesm-teal to-sesm-deep text-white p-8 rounded-2xl shadow-lg">
                                <div className="flex flex-col items-center text-center">
                                    <img src={userAvatar} alt="User Avatar" className="w-28 h-28 rounded-full border-4 border-sesm-sky mb-4 object-cover" />
                                    <h2 className="text-2xl font-bold">{user.nama || user.username}</h2>
                                    <p className="text-md opacity-80 mb-4">{userLevel}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4 border">
                                <h3 className="font-bold text-gray-800 text-lg">Statistik Belajar</h3>
                                {userStats.map(stat => <StatItem key={stat.label} {...stat} />)}
                            </div>
                        </div>
                        {/* Kolom Kanan */}
                        <div className="lg:col-span-2 space-y-8">
                            {loadingPoints ? (
                                <div className="w-full h-32 bg-gray-200 rounded-2xl animate-pulse"></div>
                            ) : (
                                <RankCard currentUserPoints={pointsData.totalPoints} onNavigate={onNavigate} />
                            )}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-3">Aktivitas Saya</h3>
                                    <div className="space-y-3">
                                        <ProfileMenuItem icon={FiTrendingUp} label="Laporan Belajar" onClick={() => onNavigate('studyReport')} />
                                        <ProfileMenuItem icon={FiFeather} label="Buku Harian Saya" onClick={() => onNavigate('diary')} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-3">PENGATURAN</h3>
                                    <div className="space-y-3">
                                        <ProfileMenuItem icon={FiUser} label="Pengaturan Akun" onClick={() => onNavigate('accountSettings')} />
                                        <ProfileMenuItem icon={FiHelpCircle} label="Pusat Bantuan" />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <ProfileMenuItem icon={FiLogOut} label="Logout" hasChevron={false} isLogout={true} onClick={() => setIsLogoutModalOpen(true)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;