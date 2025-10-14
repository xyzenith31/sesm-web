import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrendingUp, FiCheckCircle, FiClock, FiLoader } from 'react-icons/fi';
import { FaBook, FaCalculator, FaFlask, FaPalette, FaEdit, FaQuestionCircle } from 'react-icons/fa';
import DataService from '../services/dataService'; // Impor DataService

const iconMap = {
    'Cerita Interaktif': FaBook,
    'Tantangan Harian': FaCalculator,
    'Menulis Kreatif': FaEdit,
    'Menggambar': FaPalette,
    'QUIZ_COMPLETION': FaQuestionCircle, // Ikon untuk kuis
    'default': FiCheckCircle
};

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
    // Tentukan ikon berdasarkan activity_type atau category
    const Icon = iconMap[item.activity_type] || iconMap[item.category] || iconMap.default;
    const activity = item.activity_details || item.activity;
    const points = item.points_earned || item.points;
    const time = new Date(item.created_at || item.time).toLocaleString('id-ID');

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
                <p className="text-xs text-gray-500">{time}</p>
            </div>
            <div className="flex-shrink-0 font-bold text-green-500 text-right">
                <p>+{points}</p>
                <p className="text-xs">Poin</p>
            </div>
        </motion.div>
    )
};

const StudyReportPage = ({ onNavigate }) => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    DataService.getPointsHistory()
        .then(response => {
            setReportData(response.data);
        })
        .catch(err => {
            console.error("Gagal memuat riwayat poin:", err);
            // Anda bisa menampilkan pesan error di sini
        })
        .finally(() => {
            setLoading(false);
        });
  }, []);

  const totalPoints = reportData.reduce((sum, item) => sum + item.points_earned, 0);
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
                <StatCard label="Total Poin Didapat" value={loading ? '...' : totalPoints} icon={FiTrendingUp} />
                <StatCard label="Aktivitas Selesai" value={loading ? '...' : totalActivities} icon={FiCheckCircle} />
            </div>
        </div>

        <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">Riwayat Aktivitas</h2>
            {loading ? (
                <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-2xl text-sesm-teal"/></div>
            ) : (
                <div className="space-y-3">
                    {reportData.length > 0 ? (
                        reportData.map((item, index) => (
                            <ReportItem key={item.created_at + index} item={item} index={index} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">Belum ada aktivitas yang tercatat.</p>
                    )}
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default StudyReportPage;