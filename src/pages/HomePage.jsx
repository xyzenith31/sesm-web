import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiMoreHorizontal,
  FiChevronRight,
  FiStar,
  FiHelpCircle,
} from 'react-icons/fi';
import {
  FaFlask,
  FaGlobeAmericas,
  FaCalculator,
  FaBook,
  FaBalanceScale,
  FaLanguage,
  FaMosque,
  FaPencilAlt,
  FaBookReader,
} from 'react-icons/fa';
import logoSesm from '../assets/logo.png';
import AuthService from '../services/auth.service';

// Data mata pelajaran
const subjectsByGrade = {
  'tk': [
    { icon: FaBookReader, label: 'Membaca' },
    { icon: FaPencilAlt, label: 'Menulis' },
    { icon: FaCalculator, label: 'Berhitung' },
    { icon: FaLanguage, label: 'B.Inggris' },
    { icon: FiHelpCircle, label: 'Fokus Quiz' },
  ],
  'kelas 1 sd': [
    { icon: FaMosque, label: 'Agama Islam' },
    { icon: FaBook, label: 'B.Indo' },
    { icon: FaCalculator, label: 'Matematika' },
    { icon: FaLanguage, label: 'B.Inggris' },
    { icon: FaBalanceScale, label: 'PKN' },
  ],
  'kelas 2 sd': [
    { icon: FaMosque, label: 'Agama Islam' },
    { icon: FaBalanceScale, label: 'PKN' },
    { icon: FaBook, label: 'B.Indo' },
    { icon: FaCalculator, label: 'Matematika' },
    { icon: FaLanguage, label: 'B.Inggris' },
  ],
  'kelas 3&4': [
    { icon: FaMosque, label: 'Agama Islam' },
    { icon: FaBalanceScale, label: 'PKN' },
    { icon: FaBook, label: 'B.Indo' },
    { icon: FaCalculator, label: 'Matematika' },
    { icon: FaLanguage, label: 'B.Inggris' },
    { icon: FaFlask, label: 'IPA' },
    { icon: FaGlobeAmericas, label: 'IPS' },
  ],
  'kelas 5 sd': [
    { icon: FaMosque, label: 'Agama Islam' },
    { icon: FaBalanceScale, label: 'PKN' },
    { icon: FaBook, label: 'B.Indo' },
    { icon: FaCalculator, label: 'Matematika' },
    { icon: FaLanguage, label: 'B.Inggris' },
    { icon: FaFlask, label: 'IPA' },
    { icon: FaGlobeAmericas, label: 'IPS' },
  ],
  'kelas 6 sd': [
    { icon: FaMosque, label: 'Agama Islam' },
    { icon: FaBalanceScale, label: 'PKN' },
    { icon: FaBook, label: 'B.Indo' },
    { icon: FaCalculator, label: 'Matematika' },
    { icon: FaLanguage, label: 'B.Inggris' },
    { icon: FaFlask, label: 'IPA' },
    { icon: FaGlobeAmericas, label: 'IPS' },
  ]
};

const testimonials = [
    { avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Juliana', quote: 'Sejak ada sesm kak elsa mandiri dalam belajar', name: 'juliana lisvina' },
    { avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Johanca', quote: 'Sesm sangat membantu sekali dalam belajar, mantap sekali!', name: 'Johanca' },
];

const SubjectButton = ({ icon: Icon, label, onClick }) => (
    <motion.div onClick={onClick} className="flex flex-col items-center justify-center space-y-2 cursor-pointer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <div className="w-full h-16 bg-sesm-deep rounded-2xl flex items-center justify-center text-white text-3xl shadow-md">
            <Icon />
        </div>
        <p className="text-xs text-center text-gray-700 font-semibold">{label}</p>
    </motion.div>
);

const SeeMoreButton = () => (
    <motion.div className="flex flex-col items-center justify-center space-y-2" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <div className="w-full h-16 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-600 text-3xl shadow-md">
            <FiMoreHorizontal />
        </div>
        <p className="text-xs text-gray-700 font-semibold">See More</p>
    </motion.div>
);

const TestimonialCard = ({ avatar, quote, name }) => (
    <div className="bg-gray-200/80 rounded-2xl p-4 flex items-center space-x-3 shadow-sm">
        <img src={avatar} alt={name} className="w-12 h-12 rounded-full border-2 border-white flex-shrink-0" />
        <div className="flex-1">
            <p className="text-sm italic text-gray-800">"{quote}"</p>
            <p className="text-xs font-bold text-gray-600 mt-1">- {name}</p>
            <div className="flex items-center mt-1.5">
                <span className="text-xs text-gray-600 font-bold mr-2">5.0</span>
                <div className="flex text-yellow-500">{[...Array(5)].map((_, i) => <FiStar key={i} fill="currentColor" size={14} />)}</div>
            </div>
        </div>
    </div>
);

const HomePage = ({ onNavigate }) => {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    // Ambil data pengguna yang sedang login dari AuthService/localStorage
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const getGradeKey = () => {
    if (!currentUser) return 'tk'; // Default jika user tidak ditemukan
    
    const { jenjang, kelas } = currentUser;

    if (jenjang && jenjang.toLowerCase() === 'tk') {
      return 'tk';
    }

    if (jenjang && jenjang.toLowerCase() === 'sd') {
      if (kelas === 3 || kelas === 4) return 'kelas 3&4';
      if (kelas >= 1 && kelas <= 6) return `kelas ${kelas} sd`;
    }

    return 'tk'; // Fallback default
  };
  
  const gradeKey = getGradeKey();
  const currentSubjects = subjectsByGrade[gradeKey] || [];
  const userDisplayName = currentUser ? currentUser.username : 'Guest';
  
  const handleSubjectClick = (subjectLabel) => {
    if (subjectLabel === 'Matematika' && onNavigate) {
      onNavigate('matematika1');
    }
  };

  return (
    <>
      {/* Tampilan Mobile & Tablet */}
      <div className="md:hidden">
        <div className="min-h-screen bg-gray-50 pb-28">
          <header className="px-6 pt-8 pb-4">
            <div className="flex items-center space-x-3">
              <img src={logoSesm} alt="Sesm Logo" className="w-12 h-12"/>
              <div>
                <h1 className="text-xl font-bold text-sesm-deep tracking-wide">Welcome, {userDisplayName}!</h1>
                <p className="text-xs font-bold text-sesm-teal bg-sesm-teal/10 px-2 py-1 rounded-full inline-block mt-1">{gradeKey.toUpperCase()}</p>
              </div>
            </div>
            <div className="relative mt-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Coba Cari Materimu di sini" className="w-full bg-white text-gray-800 rounded-full py-3 pl-12 pr-4 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sesm-teal"/>
            </div>
          </header>

          <main className="px-6 mt-6">
            <h3 className="text-md font-bold text-gray-600 mb-3">Mata Pelajaranmu</h3>
            <div className="grid grid-cols-4 gap-x-4 gap-y-5">
              {currentSubjects.map(subject => (
                <SubjectButton
                  key={subject.label}
                  {...subject}
                  onClick={() => handleSubjectClick(subject.label)}
                />
              ))}
              <SeeMoreButton />
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800">Fitur Unggulan SESM</h2>
              <div className="mt-3 bg-sesm-deep rounded-2xl p-4 shadow-lg">
                <motion.button onClick={() => onNavigate('bookmark')} className="w-full bg-gray-100/90 text-sesm-deep font-bold rounded-full flex items-center justify-between p-3 text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <div className="flex items-center space-x-3">
                    <FiSearch className="text-yellow-500 text-xl" />
                    <span className='text-left'>LATIHAN SOAL DI BANK BUKU</span>
                  </div>
                  <FiChevronRight size={24} />
                </motion.button>
                <motion.button onClick={() => onNavigate('quiz')} className="mt-3 w-full bg-gray-100/90 text-sesm-deep font-bold rounded-full flex items-center justify-between p-3 text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <div className="flex items-center space-x-3">
                    <FiHelpCircle className="text-teal-500 text-xl" />
                    <span className='text-left'>KUIS PENGETAHUAN</span>
                  </div>
                  <FiChevronRight size={24} />
                </motion.button>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                <FiStar className="text-yellow-500" />
                <span>Apa Kata Mereka</span>
              </h2>
              <div className="mt-4 space-y-4">
                {testimonials.map(testimonial => <TestimonialCard key={testimonial.name} {...testimonial} />)}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Tampilan Desktop */}
      <div className="hidden md:flex flex-col items-center w-full min-h-screen bg-gray-100 p-8">
        <div className="w-full max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <img src={logoSesm} alt="Sesm Logo" className="w-14 h-14"/>
              <div>
                <h1 className="text-3xl font-bold text-sesm-deep tracking-wide">Welcome, {userDisplayName}!</h1>
                <p className="text-sm font-bold text-sesm-teal bg-sesm-teal/10 px-2 py-1 rounded-full inline-block mt-1">{gradeKey.toUpperCase()}</p>
              </div>
            </div>
            <div className="relative w-1/3">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Cari Materi..." className="w-full bg-white border border-gray-300 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-sesm-deep"/>
            </div>
          </header>

          <main className="space-y-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-bold text-gray-700 mb-4">Mata Pelajaranmu</h3>
              <div className="grid grid-cols-8 gap-6">
                {currentSubjects.map(subject => (
                  <SubjectButton
                    key={subject.label}
                    {...subject}
                    onClick={() => handleSubjectClick(subject.label)}
                  />
                ))}
                <SeeMoreButton />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-sesm-deep rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-xl font-bold mb-4">Fitur Unggulan SESM</h2>
                <div className='space-y-3'>
                  <motion.button onClick={() => onNavigate('bookmark')} className="w-full bg-white text-sesm-deep font-bold rounded-full flex items-center justify-between p-4" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <div className="flex items-center space-x-3">
                      <FiSearch className="text-yellow-600" size={22} />
                      <span>LATIHAN SOAL DI BANK BUKU</span>
                    </div>
                    <FiChevronRight size={24} />
                  </motion.button>
                  <motion.button onClick={() => onNavigate('quiz')} className="w-full bg-white text-sesm-deep font-bold rounded-full flex items-center justify-between p-4" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <div className="flex items-center space-x-3">
                      <FiHelpCircle className="text-teal-600" size={22} />
                      <span>KUIS PENGETAHUAN</span>
                    </div>
                    <FiChevronRight size={24} />
                  </motion.button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4">
                  <FiStar className="text-yellow-500" />
                  <span>Apa Kata Mereka</span>
                </h2>
                <div className="space-y-4">
                  {testimonials.map(testimonial => <TestimonialCard key={testimonial.name} {...testimonial} />)}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default HomePage;