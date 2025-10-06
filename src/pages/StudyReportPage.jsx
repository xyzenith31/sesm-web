import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrendingUp, FiCheckCircle, FiClock } from 'react-icons/fi';
import { FaBook, FaCalculator, FaFlask, FaPalette, FaEdit } from 'react-icons/fa';

// Data dummy untuk laporan belajar
const reportData = [
  { id: 1, icon: FaBook, activity: "Menyelesaikan cerita 'Kancil & Buaya'", category: 'Cerita Interaktif', points: 30, time: 'Hari ini, 10:45' },
  { id: 2, icon: FaCalculator, activity: "Menyelesaikan kuis 'Raja Perkalian'", category: 'Tantangan Harian', points: 50, time: 'Hari ini, 09:30' },
  { id: 3, icon: FaEdit, activity: "Menulis 50 kata di 'Proyek Pertama'", category: 'Menulis Kreatif', points: 15, time: 'Kemarin, 16:20' },
  { id: 4, icon: FaFlask, activity: "Menjawab kuis 'Ahli Planet'", category: 'Tantangan Harian', points: 60, time: 'Kemarin, 11:00' },
  { id: 5, icon: FaPalette, activity: "Menyimpan karya 'Kanvas Pertamaku'", category: 'Menggambar', points: 25, time: '2 hari yang lalu' }
];

const StatCard = ({ label, value, icon: Icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex-1">
        <div className="flex items-center">
            <Icon className="text-sesm-teal text-2xl mr-3" />
            <div>
                <p className="text-lg font-bold text-sesm-deep">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
            </div>
        </div>
    </div>
);

const ReportItem = ({ item, index }) => {
    const { icon: Icon, activity, category, points, time } = item;
    return(
        <motion.div
            className="flex items-start space-x-4 p-4 bg-white rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Icon className="text-sesm-deep text-2xl mt-1 flex-shrink-0" />
            <div className="flex-grow">
                <p className="font-semibold text-gray-800">{activity}</p>
                <p className="text-xs text-gray-500">{category} • {time}</p>
            </div>
            <div className="flex-shrink-0 font-bold text-green-500 text-right">
                <p>+{points}</p>
                <p className="text-xs">Poin</p>
            </div>
        </motion.div>
    )
};

const StudyReportPage = ({ onNavigate }) => {
  const totalPoints = reportData.reduce((sum, item) => sum + item.points, 0);
  const totalActivities = reportData.length;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => onNavigate('profile')} className="p-2 rounded-full hover:bg-gray-100">
          <FiArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep flex items-center justify-center">
            <FiTrendingUp className="mr-2" />
            Laporan Belajar
        </h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow overflow-y-auto p-6 space-y-6">
        <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">Ringkasan Aktivitas</h2>
            <div className="flex space-x-4">
                <StatCard label="Total Poin Didapat" value={totalPoints} icon={FiTrendingUp} />
                <StatCard label="Aktivitas Selesai" value={totalActivities} icon={FiCheckCircle} />
            </div>
        </div>

        <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">Riwayat Aktivitas</h2>
            <div className="space-y-3">
                {reportData.map((item, index) => (
                    <ReportItem key={item.id} item={item} index={index} />
                ))}
            </div>
        </div>
      </main>
    </div>
  );
};

export default StudyReportPage;