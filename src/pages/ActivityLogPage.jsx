import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiLogIn, FiUserPlus, FiBookOpen } from 'react-icons/fi';

const activityLog = [
  {
    icon: FiBookOpen,
    text: "Membuka materi 'Aljabar & Aritmatika'",
    time: "Hari ini, 10:05 WIB",
    color: "text-blue-500"
  },
  {
    icon: FiLogIn,
    text: "Berhasil login ke akun",
    time: "Hari ini, 09:30 WIB",
    color: "text-green-500"
  },
  {
    icon: FiBookOpen,
    text: "Menyelesaikan 'Latihan Soal Bank Buku'",
    time: "Kemarin, 15:45 WIB",
    color: "text-blue-500"
  },
  {
    icon: FiUserPlus,
    text: "Akun berhasil dibuat",
    time: "3 hari yang lalu, 11:20 WIB",
    color: "text-purple-500"
  },
];

const ActivityItem = ({ icon: Icon, text, time, color }) => (
  <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
    <Icon className={`${color} text-2xl mt-1`} />
    <div>
      <p className="font-semibold text-gray-800">{text}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </div>
);

const ActivityLogPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => onNavigate('profile')} className="p-2 rounded-full hover:bg-gray-100">
          <FiArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep">Log Aktivitas</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow overflow-y-auto p-6 space-y-4">
        {activityLog.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ActivityItem {...activity} />
          </motion.div>
        ))}
      </main>
    </div>
  );
};

export default ActivityLogPage;