import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiSearch,
  FiChevronRight,
  FiStar,
  FiHelpCircle,
  FiAlertCircle
} from 'react-icons/fi';
import {
  FaFlask, FaGlobeAmericas, FaCalculator, FaBook, FaBalanceScale,
  FaLanguage, FaMosque, FaBookReader, FaPencilAlt, FaBullseye, FaQuestionCircle
} from 'react-icons/fa';
import logoSesm from '../assets/logo.png';
import SubjectService from '../services/subject.service';

const iconMap = {
  FaFlask, FaGlobeAmericas, FaCalculator, FaBook, FaBalanceScale,
  FaLanguage, FaMosque, FaBookReader, FaPencilAlt, FaBullseye, FaQuestionCircle
};

const testimonials = [
  {
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Juliana',
    quote: 'Sejak ada SESM, kak Elsa jadi lebih mandiri dalam belajar.',
    name: 'Juliana Lisvina',
  },
  {
    avatar: 'https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Johanca',
    quote: 'SESM sangat membantu sekali dalam belajar, mantap!',
    name: 'Johanca',
  },
];

const SubjectButton = ({ icon: Icon, label, onClick }) => (
  <motion.div
    onClick={onClick}
    className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="w-full h-16 bg-sesm-deep rounded-2xl flex items-center justify-center text-white text-3xl shadow-md">
      {Icon ? <Icon /> : null}
    </div>
    <p className="text-xs text-gray-700 font-semibold text-center">{label}</p>
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
        <div className="flex text-yellow-500">
          {[...Array(5)].map((_, i) => <FiStar key={i} fill="currentColor" size={14} />)}
        </div>
      </div>
    </div>
  </div>
);

const HomePage = ({ onNavigate, user }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Data user:", user);
    if (user && user.jenjang) {
      setLoading(true);
      SubjectService.getSubjects(user.jenjang, user.kelas)
        .then(response => {
          const subjectsWithIcons = response.data.map(subject => ({
            ...subject,
            icon: iconMap[subject.icon] || FaBook,
          }));
          setSubjects(subjectsWithIcons);
        })
        .catch(err => {
          const msg = err.response?.data?.message || 'Gagal memuat mata pelajaran.';
          setError(msg);
          console.error("Error fetching subjects:", err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      setError("Data jenjang pengguna tidak ditemukan. Silakan login ulang.");
    }
  }, [user]);

  const handleSubjectClick = (subjectLabel) => {
    if (subjectLabel === 'Matematika' && onNavigate) {
      onNavigate('matematika1');
    }
  };

  const SubjectLoader = () => (
    [...Array(8)].map((_, i) => (
      <div key={i} className="flex flex-col items-center justify-center space-y-2">
        <div className="w-full h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="h-2 w-10 bg-gray-200 rounded animate-pulse mt-2"></div>
      </div>
    ))
  );

  const ErrorDisplay = ({ message }) => (
    <div className="col-span-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
      <div className="flex items-center">
        <FiAlertCircle className="text-2xl mr-3" />
        <div>
          <p className="font-bold">Terjadi Kesalahan</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ========== MOBILE & TABLET ========== */}
      <div className="md:hidden">
        <div className="min-h-screen bg-gray-50 pb-28">
          <header className="px-6 pt-8 pb-4">
            <div className="flex items-center space-x-3">
              <img src={logoSesm} alt="Sesm Logo" className="w-12 h-12" />
              <div>
                <h1 className="text-xl font-bold text-sesm-deep">Welcome</h1>
                <p className="text-xs text-gray-500">SMART EDUCATION SMART MORALITY</p>
              </div>
            </div>
            <div className="relative mt-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Coba cari materimu di sini"
                className="w-full bg-white text-gray-800 rounded-full py-3 pl-12 pr-4 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sesm-teal"
              />
            </div>
          </header>

          <main className="px-6 mt-4">
            <div className="grid grid-cols-4 gap-x-4 gap-y-5">
              {loading ? <SubjectLoader /> : error ? <ErrorDisplay message={error} /> : (
                subjects.map(subject => (
                  <SubjectButton key={subject.label} {...subject} onClick={() => handleSubjectClick(subject.label)} />
                ))
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800">Fitur Unggulan SESM</h2>
              <div className="mt-3 bg-sesm-deep rounded-2xl p-4 shadow-lg space-y-3">
                <motion.button
                  onClick={() => onNavigate('bookmark')}
                  className="w-full bg-gray-100/90 text-sesm-deep font-bold rounded-full flex items-center justify-between p-3 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center space-x-3">
                    <FiSearch className="text-yellow-500 text-xl" />
                    <span>LATIHAN SOAL DI BANK BUKU</span>
                  </div>
                  <FiChevronRight size={24} />
                </motion.button>

                <motion.button
                  onClick={() => onNavigate('quiz')}
                  className="w-full bg-gray-100/90 text-sesm-deep font-bold rounded-full flex items-center justify-between p-3 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center space-x-3">
                    <FiHelpCircle className="text-teal-500 text-xl" />
                    <span>KUIS PENGETAHUAN</span>
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
                {testimonials.map(testimonial => (
                  <TestimonialCard key={testimonial.name} {...testimonial} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ========== DESKTOP ========== */}
      <div className="hidden md:flex flex-col items-center w-full min-h-screen bg-gray-100 p-8">
        <div className="w-full max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <img src={logoSesm} alt="Sesm Logo" className="w-14 h-14" />
              <div>
                <h1 className="text-3xl font-bold text-sesm-deep">Welcome</h1>
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

          <main className="space-y-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="grid grid-cols-8 gap-6">
                {loading ? <SubjectLoader /> : error ? (
                  <div className="col-span-8"><ErrorDisplay message={error} /></div>
                ) : (
                  subjects.map(subject => (
                    <SubjectButton key={subject.label} {...subject} onClick={() => handleSubjectClick(subject.label)} />
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-sesm-deep rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-xl font-bold mb-4">Fitur Unggulan SESM</h2>
                <div className='space-y-3'>
                  <motion.button
                    onClick={() => onNavigate('bookmark')}
                    className="w-full bg-white text-sesm-deep font-bold rounded-full flex items-center justify-between p-4"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <FiSearch className="text-yellow-600" size={22} />
                      <span>LATIHAN SOAL DI BANK BUKU</span>
                    </div>
                    <FiChevronRight size={24} />
                  </motion.button>

                  <motion.button
                    onClick={() => onNavigate('quiz')}
                    className="w-full bg-white text-sesm-deep font-bold rounded-full flex items-center justify-between p-4"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
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
                  {testimonials.map(testimonial => (
                    <TestimonialCard key={testimonial.name} {...testimonial} />
                  ))}
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