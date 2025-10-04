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
  FiFeather
} from 'react-icons/fi';

const ProfileMenuItem = ({ icon: Icon, label, hasChevron = true, isLogout = false, onClick }) => (
  <motion.button 
    onClick={onClick}
    className={`w-full flex items-center justify-between text-left px-5 py-4 bg-white rounded-xl shadow-sm transition-all duration-200 ${isLogout ? 'text-red-500' : 'text-gray-700'} hover:bg-gray-50`}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center space-x-4">
      <Icon className={isLogout ? 'text-red-500' : 'text-sesm-deep'} size={22} />
      <span className="font-semibold">{label}</span>
    </div>
    {hasChevron && <FiChevronRight className="text-gray-400" size={20} />}
  </motion.button>
);

const ProfilePage = ({ onNavigate }) => {
  const user = {
    name: 'Siswa Cerdas',
    level: 'SD - Kelas 4',
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=SiswaCerdas'
  };

  return (
    <>
      {/* Tampilan Mobile (Tidak Berubah) */}
      <div className="md:hidden">
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <header className="bg-sesm-deep text-white p-4 pt-8 text-center sticky top-0 z-10 shadow-md">
            <h1 className="text-xl font-bold">Profil Saya</h1>
          </header>
          
          <main className="flex-grow overflow-y-auto p-6 pb-28">
            <div className="bg-white p-5 rounded-2xl shadow-lg flex items-center space-x-4 mb-8">
              <img src={user.avatar} alt="User Avatar" className="w-20 h-20 rounded-full border-4 border-sesm-sky"/>
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                <p className="text-sm text-gray-500">{user.level}</p>
              </div>
              <button className="text-sesm-teal p-2 rounded-full hover:bg-gray-100"><FiEdit2 size={20} /></button>
            </div>

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
                <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-2">PENGATURAN</h3>
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
      {/* ============= TAMPILAN KHUSUS DESKTOP (DIUBAH) ========= */}
      {/* ====================================================== */}
      <div className="hidden md:flex flex-col items-center justify-start py-12 px-8 min-h-screen bg-gray-100">
        <div className="w-full max-w-2xl">
          <div className="text-left mb-8">
              <h1 className="text-4xl font-bold text-sesm-deep tracking-wider">Akun Saya</h1>
          </div>
          
          {/* Wrapper Konten Menjadi Satu Kolom Vertikal */}
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            {/* Bagian Informasi Pengguna */}
            <div className="flex items-center space-x-6 pb-8 border-b border-gray-200">
              <img 
                  src={user.avatar} 
                  alt="User Avatar"
                  className="w-24 h-24 rounded-full border-4 border-sesm-sky"
              />
              <div className="flex-grow">
                  <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
                  <p className="text-md text-gray-500">{user.level}</p>
              </div>
              <button className="flex items-center justify-center space-x-2 bg-sesm-teal/10 text-sesm-deep font-semibold py-2 px-4 rounded-lg hover:bg-sesm-teal/20 transition-colors">
                  <FiEdit2 size={16}/>
                  <span>Edit</span>
              </button>
            </div>
            
            {/* Bagian Menu-menu */}
            <div className="space-y-5">
              <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase px-2 mb-3">Aktivitas Saya</h3>
                  <div className="space-y-3">
                    {/* Menggunakan bg-white karena parent sudah putih, hover:bg-gray-50 ditambahkan di komponen */}
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