import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiMoreHorizontal, 
  FiChevronRight,
  FiStar,
  FiHome,
  FiCompass,
  FiBookmark,
  FiUser
} from 'react-icons/fi';
import { 
  FaFlask, 
  FaGlobeAmericas, 
  FaCalculator, 
  FaBook, 
  FaBalanceScale, 
  FaLanguage, 
  FaMosque 
} from 'react-icons/fa';
import UserLayout from '../layouts/UserLayout';
import BottomNavBar from '../components/BottomNavBar'; // Asumsi BottomNavBar sudah ada

// Data untuk ikon mata pelajaran
const subjects = [
  { icon: FaFlask, label: 'IPA', color: 'bg-green-500' },
  { icon: FaGlobeAmericas, label: 'IPS', color: 'bg-blue-500' },
  { icon: FaCalculator, label: 'Matematika', color: 'bg-yellow-500' },
  { icon: FaBook, label: 'B. Indo', color: 'bg-red-500' },
  { icon: FaBalanceScale, label: 'PKN', color: 'bg-purple-500' },
  { icon: FaLanguage, label: 'B. Inggris', color: 'bg-pink-500' },
  { icon: FaMosque, label: 'Agama Islam', color: 'bg-teal-500' },
  { icon: FiMoreHorizontal, label: 'See More', color: 'bg-gray-400' },
];

// Data untuk testimoni
const testimonials = [
  {
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Juliana',
    quote: 'Sejak ada sesm kak elsa mandiri dalam belajar',
    name: 'Juliana Lisvina',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Johanca',
    quote: 'Sesm sangat membantu sekali dalam belajar, mantap sekali!',
    name: 'Johanca',
  },
];

// Komponen kecil untuk tombol mata pelajaran
const SubjectButton = ({ icon: Icon, label, color }) => (
  <motion.div 
    className="flex flex-col items-center space-y-2"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl shadow-md ${color}`}>
      <Icon />
    </div>
    <p className="text-xs text-gray-700 font-semibold">{label}</p>
  </motion.div>
);

// Komponen kecil untuk kartu testimoni
const TestimonialCard = ({ avatar, quote, name }) => (
  <div className="bg-gray-200/80 rounded-2xl p-4 flex items-start space-x-3 shadow-sm">
    <img src={avatar} alt={name} className="w-12 h-12 rounded-full border-2 border-white" />
    <div className="flex-1">
      <p className="text-sm italic text-gray-800">"{quote}"</p>
      <p className="text-xs font-bold text-gray-600 mt-1">- {name}</p>
      <div className="flex items-center mt-2 text-yellow-500">
        {[...Array(5)].map((_, i) => <FiStar key={i} fill="currentColor" size={14} />)}
        <span className="text-xs text-gray-500 font-bold ml-2">5.0</span>
      </div>
    </div>
  </div>
);


const HomePage = () => {
  return (
    <UserLayout>
      {/* ====================================================== */}
      {/* ============ TAMPILAN KHUSUS MOBILE & TABLET =========== */}
      {/* ====================================================== */}
      <div className="md:hidden">
        <div className="relative min-h-screen bg-gray-50 pb-24">
          {/* Header */}
          <header className="absolute top-0 left-0 right-0 h-auto bg-gradient-to-b from-sesm-teal to-sesm-deep rounded-b-[3rem] text-white p-6 z-10 shadow-lg">
            <div className="mt-4 flex items-center space-x-3">
                <img src="/logo-sesm.png" alt="Sesm Logo" className="w-12 h-12"/>
                <div>
                    <h1 className="text-2xl font-bold tracking-wide">Welcome</h1>
                    <p className="text-xs font-light">SMART EDUCATION SMART MORALITY</p>
                </div>
            </div>
            <div className="relative mt-5 mb-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Coba Cari Materimu di sini" 
                className="w-full bg-white text-gray-800 rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sesm-teal"
              />
            </div>
          </header>
          
          {/* Konten Utama */}
          <main className="relative z-0 pt-[190px] px-6">
            {/* Grid Mata Pelajaran */}
            <div className="grid grid-cols-4 gap-x-4 gap-y-5">
              {subjects.map(subject => (
                <SubjectButton key={subject.label} {...subject} />
              ))}
            </div>

            {/* Fitur Unggulan */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800">Fitur Unggulan SESM</h2>
              <div className="mt-3 bg-sesm-deep rounded-2xl p-5 text-white shadow-lg">
                <motion.button 
                  className="w-full bg-gray-100/90 text-sesm-deep font-bold rounded-full flex items-center justify-between p-4 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center space-x-3">
                    <FiSearch className="text-yellow-500" size={22} />
                    <span>LATIHAN SOAL DI BANK BUKU</span>
                  </div>
                  <FiChevronRight size={24} />
                </motion.button>
              </div>
            </div>

            {/* Apa Kata Mereka */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                <FiStar className="text-yellow-500" />
                <span>Apa Kata Mereka</span>
              </h2>
              <div className="mt-4 space-y-4">
                {testimonials.map(testimonial => (
                  <TestimonialCard key={testimonial.name} {...testimonial} />
                ))}
              </div>
            </div>
          </main>

          <BottomNavBar />
        </div>
      </div>

      {/* ====================================================== */}
      {/* ============= TAMPILAN KHUSUS DESKTOP ================ */}
      {/* ====================================================== */}
      <div className="hidden md:flex flex-col items-center w-full min-h-screen bg-gray-100 p-8">
        <div className="w-full max-w-4xl mx-auto">
          {/* Header Desktop */}
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
                <img src="/logo-sesm.png" alt="Sesm Logo" className="w-14 h-14"/>
                <div>
                    <h1 className="text-3xl font-bold text-sesm-deep tracking-wide">Welcome</h1>
                    <p className="text-sm text-gray-500">SMART EDUCATION SMART MORALITY</p>
                </div>
            </div>
            <div className="relative w-1/3">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Cari Materi..." 
                className="w-full bg-white border border-gray-300 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-sesm-deep"
              />
            </div>
          </header>

          {/* Konten Desktop */}
          <main className="space-y-10">
            {/* Grid Mata Pelajaran */}
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="grid grid-cols-8 gap-6">
                {subjects.map(subject => (
                    <SubjectButton key={subject.label} {...subject} />
                ))}
                </div>
            </div>
            
            {/* Sections Wrapper */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fitur Unggulan */}
                <div className="bg-sesm-deep rounded-2xl p-6 text-white shadow-lg">
                    <h2 className="text-xl font-bold">Fitur Unggulan SESM</h2>
                    <motion.button 
                      className="mt-4 w-full bg-white text-sesm-deep font-bold rounded-full flex items-center justify-between p-4"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                    <div className="flex items-center space-x-3">
                        <FiSearch className="text-yellow-600" size={22} />
                        <span>LATIHAN SOAL DI BANK BUKU</span>
                    </div>
                    <FiChevronRight size={24} />
                    </motion.button>
                </div>

                {/* Apa Kata Mereka */}
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
                        <FiStar className="text-yellow-500" />
                        <span>Apa Kata Mereka</span>
                    </h2>
                    <div className="space-y-4">
                        {testimonials.map(testimonial => (
                        <TestimonialCard key={testimonial.name} {...testimonial} />
                        ))}
                    </div>
                </div>
            </div>
          </main>
        </div>
      </div>
    </UserLayout>
  );
};

export default HomePage;