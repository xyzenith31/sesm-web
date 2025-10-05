import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiChevronRight, 
  FiUser, 
  FiHelpCircle, 
  FiLogOut,
  FiEdit2,
  FiTrendingUp,
  FiCalendar,
  FiFeather,
  FiAward,
  FiCheckSquare,
  FiClock
} from 'react-icons/fi';

// Komponen Menu Item
const ProfileMenuItem = ({ icon: Icon, label, hasChevron = true, isLogout = false, onClick }) => (
  <motion.button 
    onClick={onClick}
    className={`w-full flex items-center justify-between text-left px-5 py-4 bg-white rounded-xl shadow-sm transition-all duration-200 ${isLogout ? 'text-red-500' : 'text-gray-700'} hover:bg-gray-50 active:bg-gray-100`}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center space-x-4">
      <Icon className={isLogout ? 'text-red-500' : 'text-sesm-deep'} size={22} />
      <span className="font-semibold">{label}</span>
    </div>
    {hasChevron && <FiChevronRight className="text-gray-400" size={20} />}
  </motion.button>
);

// Komponen kartu statistik
const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl flex items-center space-x-3">
    <Icon className={`${color} text-3xl`} />
    <div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/80">{label}</p>
    </div>
  </div>
);

// Komponen Lencana/Badge
const Badge = ({ icon: Icon, label, color }) => (
  <div className="flex flex-col items-center text-center space-y-2">
    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${color} bg-gray-100`}>
      <Icon />
    </div>
    <p className="text-xs font-semibold text-gray-600">{label}</p>
  </div>
);


const ProfilePage = ({ onNavigate }) => {
  const user = {
    name: 'Siswa Cerdas',
    level: 'SD - Kelas 4',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=SiswaCerdas',
    stats: [
      { icon: FiTrendingUp, value: '15', label: 'Materi dilihat', color: 'text-yellow-300' },
      { icon: FiCheckSquare, value: '8', label: 'Tugas Selesai', color: 'text-green-300' },
      { icon: FiClock, value: '5 Jam', label: 'Waktu Belajar', color: 'text-sky-300' },
    ],
    badges: [
      { icon: FiAward, label: 'Penyelam Ilmu', color: 'text-yellow-400' },
      { icon: FiFeather, label: 'Penulis Cilik', color: 'text-blue-400' },
    ]
  };

  return (
    <>
      {/* ====================================================== */}
      {/* ============ TAMPILAN KHUSUS MOBILE ==================== */}
      {/* ====================================================== */}
      <div className="md:hidden">
        <div className="bg-gray-100">
          {/* Bagian Hero (Header + Info Profil + Statistik) */}
          <div className="bg-gradient-to-br from-sesm-teal to-sesm-deep text-white p-6 pb-8 rounded-b-3xl shadow-lg">
            <h1 className="text-xl font-bold text-center mt-4 mb-6">Profil Saya</h1>
            <div className="flex items-center space-x-4 mb-6">
              <img src={user.avatar} alt="User Avatar" className="w-20 h-20 rounded-full border-4 border-sesm-sky"/>
              <div className="flex-grow">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-sm opacity-80">{user.level}</p>
              </div>
              <button className="text-white p-2 rounded-full bg-white/20 hover:bg-white/30"><FiEdit2 size={20} /></button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {user.stats.map(stat => <StatCard key={stat.label} {...stat} />)}
            </div>
          </div>
          
          <main className="p-6 -mt-4">
            {/* Bagian Lencana Prestasi */}
            <div className="bg-white p-5 rounded-2xl shadow-md mb-6">
              <h3 className="font-bold text-gray-800 mb-4">Lencana Prestasi</h3>
              <div className="flex justify-around">
                {user.badges.map(badge => <Badge key={badge.label} {...badge} />)}
              </div>
            </div>

            {/* Menu Pengaturan */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-2">Aktivitas Saya</h3>
                <div className="space-y-3">
                  <ProfileMenuItem icon={FiTrendingUp} label="Laporan Belajar" />
                  <ProfileMenuItem icon={FiCalendar} label="Agenda" />
                  <ProfileMenuItem icon={FiFeather} label="Buku Harian Saya" onClick={() => onNavigate('diary')} />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-2">Pengaturan</h3>
                <div className="space-y-3">
                  <ProfileMenuItem icon={FiUser} label="Pengaturan Akun" />
                  <ProfileMenuItem icon={FiHelpCircle} label="Pusat Bantuan" />
                </div>
              </div>

              <div className="pt-4">
                 <ProfileMenuItem icon={FiLogOut} label="Logout" hasChevron={false} isLogout={true} />
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ====================================================== */}
      {/* ============= TAMPILAN KHUSUS DESKTOP ================ */}
      {/* ====================================================== */}
      <div className="hidden md:flex justify-center py-12 px-8 min-h-screen bg-gray-100">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Kolom Kiri: Profil Hero & Statistik */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gradient-to-br from-sesm-teal to-sesm-deep text-white p-8 rounded-2xl shadow-lg">
                <div className="flex flex-col items-center text-center">
                    <img src={user.avatar} alt="User Avatar" className="w-28 h-28 rounded-full border-4 border-sesm-sky mb-4"/>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-md opacity-80 mb-4">{user.level}</p>
                    <button className="flex items-center space-x-2 bg-white/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-colors text-sm">
                        <FiEdit2 size={16}/>
                        <span>Edit Profil</span>
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Statistik Belajar</h3>
              {user.stats.map(stat => (
                <div key={stat.label} className="flex items-center space-x-4">
                  <stat.icon className={`${stat.color} text-3xl`} />
                  <div>
                    <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Kolom Kanan: Menu & Lencana */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-800 text-lg mb-4">Lencana Prestasi</h3>
              <div className="flex items-center space-x-8">
                  {user.badges.map(badge => <Badge key={badge.label} {...badge} />)}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 space-y-5">
              <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-3">Aktivitas Saya</h3>
                  <div className="space-y-3">
                    <ProfileMenuItem icon={FiTrendingUp} label="Laporan Belajar" />
                    <ProfileMenuItem icon={FiCalendar} label="Agenda" />
                    <ProfileMenuItem icon={FiFeather} label="Buku Harian Saya" onClick={() => onNavigate('diary')} />
                  </div>
              </div>
              <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-3">PENGATURAN</h3>
                  <div className="space-y-3">
                    <ProfileMenuItem icon={FiUser} label="Pengaturan Akun" />
                    <ProfileMenuItem icon={FiHelpCircle} label="Pusat Bantuan" />
                  </div>
              </div>
              <div className="pt-4">
                  <ProfileMenuItem icon={FiLogOut} label="Logout" hasChevron={false} isLogout={true} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default ProfilePage;