import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiEdit } from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa'; // DIPERBAIKI: Impor FaPalette dari react-icons/fa

const creativeFeatures = [
  {
    id: 'drawing',
    icon: FaPalette, // DIPERBAIKI: Menggunakan FaPalette
    title: "Menggambar & Mewarnai",
    description: "Tuangkan idemu di atas kanvas digital atau warnai gambar seru.",
    color: "from-sky-400 to-blue-500",
  },
  {
    id: 'writing',
    icon: FiEdit,
    title: "Menulis Kreatif",
    description: "Lanjutkan cerita yang ada atau buat puisi indah karyamu sendiri.",
    color: "from-amber-400 to-orange-500",
  }
];

const FeatureSelectionCard = ({ icon: Icon, title, description, color, index }) => {
  return (
    <motion.div
      className={`relative rounded-2xl shadow-lg overflow-hidden cursor-pointer group bg-gradient-to-br ${color} p-6 text-white`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.03, y: -5 }}
    >
      <div className="flex items-center space-x-4">
        <div className="bg-white/30 p-3 rounded-xl">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold tracking-wide">{title}</h3>
          <p className="text-white/90 text-sm mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const CreativeZonePage = ({ onNavigate }) => {
  const handleFeatureClick = (featureTitle) => {
    // Logika untuk navigasi ke fitur spesifik bisa ditambahkan di sini nanti
    alert(`Fitur '${featureTitle}' akan segera hadir!`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => onNavigate('explore')} className="p-2 rounded-full hover:bg-gray-100">
          <FiArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep">Zona Kreatif</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <main className="flex-grow p-6">
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Pilih Aktivitasmu</h2>
            <p className="text-gray-500">Apa yang ingin kamu lakukan hari ini?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {creativeFeatures.map((feature, index) => (
            <div key={feature.id} onClick={() => handleFeatureClick(feature.title)}>
              <FeatureSelectionCard {...feature} index={index} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CreativeZonePage;