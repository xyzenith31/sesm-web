import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiBook, FiClock, FiStar, FiCheckCircle } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';
import StoryReaderModal from '../components/StoryReaderModal';
import PointsNotification from '../components/PointsNotification';
// --- INI BAGIAN YANG DIPERBAIKI: Menambahkan ekstensi .js ---
import { kancilStory } from '../data/storyData.js';

// DATA CERITA TETAP ADA, TIDAK DIHAPUS
const stories = [
  {
    id: 'kancil-buaya',
    title: 'Kancil & Buaya yang Lapar',
    sinopsis: 'Bantu si Kancil menyeberangi sungai yang penuh dengan buaya lapar. Setiap pilihanmu menentukan nasibnya!',
    kategori: 'Fabel',
    waktuBaca: 5,
    totalAkhir: 4,
    coverImage: 'https://img.freepik.com/free-vector/flat-illustration-kancil-eat-cucumber_1308-117215.jpg?w=740&t=st=1728150493~exp=1728151093~hmac=e20f269a9b2b80a424ef287958597f776d6c6e7592359fa874cfd3aa4fcb30c5',
    storyData: kancilStory,
  },
  {
    id: 'petualangan-harta-karun',
    title: 'Petualangan Harta Karun',
    sinopsis: 'Ikuti peta misterius untuk menemukan harta karun tersembunyi. Awas, banyak rintangan menantimu!',
    kategori: 'Petualangan',
    waktuBaca: 10,
    totalAkhir: 5,
    coverImage: 'https://img.freepik.com/free-vector/adventure-background_1284-9337.jpg?w=740&t=st=1728150537~exp=1728151137~hmac=a45041a31950d8fc1c0c6609f92e624b45ef59a60641b9e672778d9b15655d22',
    storyData: null,
  },
    {
    id: 'misteri-kue-hilang',
    title: 'Misteri Kue yang Hilang',
    sinopsis: 'Kue ulang tahun Ibu tiba-tiba hilang! Siapakah pelakunya? Pecahkan teka-teki ini.',
    kategori: 'Misteri',
    waktuBaca: 8,
    totalAkhir: 3,
    coverImage: 'https://img.freepik.com/free-vector/hand-drawn-detective-illustration_23-2149452339.jpg?w=740&t=st=1728150570~exp=1728151170~hmac=05d1bb5315f005c1ab8082987158eb09361734914d95c2560a6e0df31032dfa5',
    storyData: null,
  },
];

// KOMPONEN STORYCARD JUGA TETAP ADA
const StoryCard = ({ story, index, onClick, endingsFound }) => {
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
                <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                {isCompleted && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2 shadow-md">
                        <FiCheckCircle size={20} />
                    </div>
                )}
            </div>
            <div className="p-5">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-sesm-teal/10 text-sesm-teal'}`}>{story.kategori}</span>
                <h3 className="font-bold text-lg text-sesm-deep mt-2">{story.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{story.sinopsis}</p>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1"><FiClock size={14} /><span>{story.waktuBaca} min</span></div>
                    <div className={`flex items-center space-x-1 font-semibold ${isCompleted ? 'text-green-600' : ''}`}><FiStar size={14} /><span>{endingsFound}/{story.totalAkhir} Akhir</span></div>
                </div>
            </div>
        </motion.div>
    );
};


const InteractiveStoryPage = ({ onNavigate }) => {
  const [activeStory, setActiveStory] = useState(null);
  const [completedEndings, setCompletedEndings] = useState({});
  const [showPoints, setShowPoints] = useState(false);
  // --- STATE TOTAL POIN DITARUH DI SINI ---
  const [totalPoints, setTotalPoints] = useState(2500);

  const handleStorySelect = (story) => {
    if (story.storyData) {
        setActiveStory(story);
    } else {
        alert('Cerita ini belum tersedia. Segera hadir!');
    }
  };

  const handleStoryComplete = (endingKey) => {
    const alreadyCompleted = completedEndings[activeStory.id]?.includes(endingKey);

    if (!alreadyCompleted) {
        // --- POIN LANGSUNG DI-UPDATE DI SINI ---
        setTotalPoints(currentPoints => currentPoints + 30);
        setShowPoints(true);
    }

    setCompletedEndings(prev => {
        const currentEndings = prev[activeStory.id] || [];
        if (!currentEndings.includes(endingKey)) {
            return { ...prev, [activeStory.id]: [...currentEndings, endingKey] };
        }
        return prev;
    });
    
    setActiveStory(null);
  };
  
  const handleCloseModal = () => setActiveStory(null);

  return (
    <>
      <AnimatePresence>
        {showPoints && <PointsNotification points={30} message="Cerita selesai!" onDone={() => setShowPoints(false)} />}
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
          {/* --- INI BAGIAN YANG DITAMBAHKAN SESUAI GAMBAR --- */}
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
          {/* --- BATAS AKHIR BAGIAN TAMBAHAN --- */}

          <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Pilih Petualanganmu</h2>
              <p className="text-gray-500 mt-1">Setiap pilihan akan membawamu ke akhir yang berbeda!</p>
          </div>
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
        </main>
      </div>
    </>
  );
};

export default InteractiveStoryPage;