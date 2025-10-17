import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiBook, FiClock, FiStar, FiCheckCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import StoryReaderModal from '../components/mod/StoryReaderModal';
import PointsNotification from '../components/ui/PointsNotification.jsx';
import InteractiveStoryService from '../services/interactiveStoryService';

const StoryCard = ({ story, index, onClick, endingsFound }) => {
    const API_URL = 'http://localhost:8080';
    const imageUrl = story.cover_image ? `${API_URL}/${story.cover_image}` : `https://api.dicebear.com/7.x/shapes/svg?seed=${story.id}`;
    const isCompleted = endingsFound > 0;

    return (
        <motion.div
            onClick={onClick}
            className={`rounded-2xl shadow-lg overflow-hidden cursor-pointer group transition-colors duration-300 ${isCompleted ? 'bg-green-50' : 'bg-white'}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
            whileHover={{ scale: 1.03, y: -5 }}
        >
            <div className="h-40 overflow-hidden relative">
                <img src={imageUrl} alt={story.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                {isCompleted && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-md">
                        <FiCheckCircle size={20} />
                    </div>
                )}
            </div>
            <div className="p-5">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-sesm-teal/10 text-sesm-teal'}`}>{story.category}</span>
                <h3 className="font-bold text-lg text-sesm-deep mt-2">{story.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{story.synopsis}</p>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1"><FiClock size={14} /><span>{story.read_time} min</span></div>
                    <div className={`flex items-center space-x-1 font-semibold ${isCompleted ? 'text-green-600' : ''}`}><FiStar size={14} /><span>{endingsFound}/{story.total_endings} Akhir</span></div>
                </div>
            </div>
        </motion.div>
    );
};


const InteractiveStoryPage = ({ onNavigate }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeStory, setActiveStory] = useState(null);
  const [completedEndings, setCompletedEndings] = useState({});
  const [showPoints, setShowPoints] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0); // State untuk menyimpan poin yang didapat
  const [totalPoints, setTotalPoints] = useState(2500);

  useEffect(() => {
      setLoading(true);
      InteractiveStoryService.getAllStories()
        .then(response => {
            setStories(response.data);
            setError(null);
        })
        .catch(err => {
            console.error("Gagal memuat cerita:", err);
            setError("Tidak dapat memuat daftar cerita. Coba lagi nanti.");
        })
        .finally(() => {
            setLoading(false);
        });
        // Di sini Anda juga bisa memuat data `completedEndings` dari server jika disimpan
  }, []);

  const handleStorySelect = async (story) => {
    try {
        const response = await InteractiveStoryService.getStoryData(story.id);
        if (response.data) {
            setActiveStory({ ...story, storyData: response.data });
        } else {
            alert('Cerita ini belum tersedia. Segera hadir!');
        }
    } catch (err) {
        alert('Gagal memuat data cerita. Coba lagi nanti.');
    }
  };

  // [PERBAIKAN] Fungsi ini diubah untuk memanggil API
  const handleStoryComplete = (endingKey) => {
    InteractiveStoryService.completeStory(activeStory.id, endingKey)
        .then(response => {
            const awarded = response.data.pointsAwarded;
            if (awarded > 0) {
                setPointsAwarded(awarded);
                setTotalPoints(currentPoints => currentPoints + awarded);
                setShowPoints(true); // Tampilkan notifikasi poin

                // Update state lokal untuk UI
                setCompletedEndings(prev => {
                    const currentEndings = prev[activeStory.id] || [];
                    if (!currentEndings.includes(endingKey)) {
                        return { ...prev, [activeStory.id]: [...currentEndings, endingKey] };
                    }
                    return prev;
                });
            }
        })
        .catch(error => {
            console.error("Gagal mencatat penyelesaian:", error);
        });
    
    setActiveStory(null); // Tutup modal terlepas dari hasil API
  };
  
  const handleCloseModal = () => setActiveStory(null);
  
  const renderContent = () => {
      if (loading) {
          return <div className="flex justify-center items-center py-16"><FiLoader className="animate-spin text-3xl text-sesm-teal"/></div>;
      }
      if (error) {
          return <div className="text-center py-16 text-red-500"><FiAlertCircle size={48} className="mx-auto"/><p className="mt-4">{error}</p></div>;
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {stories.map((story, index) => (
              <StoryCard
                key={story.id}
                story={story}
                index={index}
                onClick={() => handleStorySelect(story)}
                endingsFound={completedEndings[story.id]?.length || 0}
              />
            ))}
        </div>
      );
  };

  return (
    <>
      <AnimatePresence>
        {showPoints && <PointsNotification points={pointsAwarded} message="Cerita selesai!" onDone={() => setShowPoints(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {activeStory && <StoryReaderModal storyData={activeStory.storyData} onClose={handleCloseModal} onComplete={handleStoryComplete} />}
      </AnimatePresence>

      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
          <button onClick={() => onNavigate('explore')} className="p-2 rounded-full hover:bg-gray-100">
            <FiArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep flex items-center justify-center">
              <FiBook className="mr-2 text-rose-500" /> Cerita Interaktif
          </h1>
          <div className="w-10"></div>
        </header>

        <main className="flex-grow p-6">
          <motion.div
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white p-4 rounded-2xl shadow-md flex items-center justify-between max-w-sm mx-auto"
          >
            <div className='text-left'>
              <p className='text-sm font-semibold text-gray-500'>Total Poin Kamu</p>
              <p className='text-2xl font-bold text-sesm-deep'>{totalPoints.toLocaleString()}</p>
            </div>
            <FaTrophy className='text-yellow-400 text-4xl' />
          </motion.div>

          <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Pilih Petualanganmu</h2>
              <p className="text-gray-500 mt-1">Setiap pilihan akan membawamu ke akhir yang berbeda!</p>
          </div>
          {renderContent()}
        </main>
      </div>
    </>
  );
};

export default InteractiveStoryPage;