import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { FiSearch, FiChevronRight, FiStar, FiHelpCircle, FiAlertCircle, FiAward, FiMessageSquare, FiX, FiZap, FiTrendingUp, FiCheckSquare } from 'react-icons/fi';
import { FaFlask, FaGlobeAmericas, FaCalculator, FaBook, FaBalanceScale, FaLanguage, FaMosque, FaBookReader, FaPencilAlt, FaBullseye, FaQuestionCircle, FaPalette } from 'react-icons/fa';
import logoSesm from '../assets/logo.png';
import { useAuth } from '../hooks/useAuth';
import { useData } from '../hooks/useData';

// --- KUMPULAN HELPER COMPONENT ---

const iconMap = {
  FaFlask, FaGlobeAmericas, FaCalculator, FaBook, FaBalanceScale,
  FaLanguage, FaMosque, FaBookReader, FaPencilAlt, FaBullseye, FaQuestionCircle
};

const subjectColors = {
  'Pendidikan Agama Islam': { text: 'text-green-600' },
  'Bahasa Indonesia': { text: 'text-red-600' },
  'Matematika': { text: 'text-orange-600' },
  'Bahasa Inggris': { text: 'text-purple-600' },
  'PKN': { text: 'text-yellow-700' },
  'IPA': { text: 'text-blue-600' },
  'IPS': { text: 'text-sky-600' },
  'Membaca': { text: 'text-indigo-600' },
  'Menulis': { text: 'text-pink-600' },
  'Berhitung': { text: 'text-teal-600' },
  'default': { text: 'text-gray-600' }
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

const AnimatedNumber = ({ value = 0 }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const controls = animate(0, parseInt(value) || 0, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate(latest) { setDisplayValue(Math.round(latest)); }
        });
        return () => controls.stop();
    }, [value]);
    return <>{displayValue.toLocaleString()}</>;
};

const RankIcon = ({ rank, size = "w-12 h-12" }) => {
  const iconStyle = `drop-shadow-lg ${size}`;
  switch (rank) {
    case 'bronze': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 39c-7.732 0-14-6.268-14-14S16.268 11 24 11s14 6.268 14 14-6.268 14-14 14z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18 25h12M24 19v12" /></g></svg>;
    case 'silver': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 42c-9.941 0-18-8.059-18-18S14.059 6 24 6s18 8.059 18 18-8.059 18-18 18z" /><path strokeLinecap="round" strokeLinejoin="round" d="M31 17l-7 7-7-7" /><path strokeLinecap="round" d="M24 24v12" /></g></svg>;
    case 'gold': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20z" /><path strokeLinecap="round" strokeLinejoin="round" d="M24 30l-5 5 5-10 5 10-5-5z" /><path d="M17 17h14" /></g></svg>;
    case 'platinum': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 18l13-13 13 13-13 13-13-13z" /><path strokeLinecap="round" strokeLinejoin="round" d="M11 18v18h26V18" /></g></svg>;
    case 'diamond': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 5L40 19 24 43 8 19 24 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 19h32" /></g></svg>;
    case 'master': return <svg className={iconStyle} viewBox="0 0 48 48"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M24 8l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2 6-12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4h24v4H12z" /></g></svg>;
    default: return <FiAward className={iconStyle} />;
  }
};

// [PERBAIKAN TOTAL] Kartu Peringkat Megah dengan Efek Aurora dan Partikel
const RankCardAurora = ({ rank, points, color, icon, onNavigate }) => {
    // Definisi warna gradien untuk aurora berdasarkan peringkat
    const rankColors = {
        platinum: 'from-sky-400 via-blue-500 to-indigo-500',
        diamond: 'from-purple-400 via-violet-500 to-fuchsia-500',
        master: 'from-amber-400 via-orange-500 to-red-600',
    };

    return (
        <motion.div
            onClick={() => onNavigate('rank')}
            className="relative p-1 rounded-3xl overflow-hidden cursor-pointer group"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
            {/* Efek Aurora Background */}
            <div
                className={`absolute inset-0 bg-gradient-to-r ${rankColors[icon] || 'from-gray-400 to-gray-600'}`}
                style={{
                    animation: 'aurora 8s ease-in-out infinite',
                    backgroundSize: '200% 200%',
                }}
            />
            {/* Partikel Berkilau */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `sparkle ${Math.random() * 5 + 3}s linear infinite`,
                            animationDelay: `${Math.random() * -8}s`,
                        }}
                    />
                ))}
            </div>

            {/* Konten Kartu */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-white/70" style={{ color: color }}>
                        <RankIcon rank={icon} size="w-10 h-10" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-sesm-deep leading-tight">{rank}</p>
                        <p className="text-sm font-semibold text-gray-600">
                            Poin: <AnimatedNumber value={points || 0} />
                        </p>
                    </div>
                </div>
                <FiChevronRight className="text-gray-500" size={24} />
            </div>
        </motion.div>
    );
};

// Kartu Peringkat Sederhana (dengan glow tipis) untuk peringkat rendah
const SimpleRankCard = ({ rank, points, color, icon, onNavigate }) => {
    return(
        <motion.div
            onClick={() => onNavigate('rank')}
            className="bg-white p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-md hover:shadow-lg"
            style={{boxShadow: `0 0 15px -3px ${color}60`}}
            whileHover={{y: -5}}
        >
             <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-100" style={{ color: color }}>
                    <RankIcon rank={icon} size="w-8 h-8" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-500">Poin & Peringkat</p>
                    <p className="text-lg font-bold text-sesm-deep leading-tight">
                        <AnimatedNumber value={points || 0} />
                        <span className="text-sm font-medium text-gray-600"> / {rank || 'N/A'}</span>
                    </p>
                </div>
            </div>
            <FiChevronRight className="text-gray-400" size={24} />
        </motion.div>
    )
}

const StatCard = ({ icon, value, label, color, onClick }) => {
    return (
        <motion.div
            className={`bg-white p-4 rounded-2xl flex-1 flex items-center space-x-4 cursor-pointer border hover:border-gray-300 transition-all shadow-md`}
            whileHover={{ y: -5 }}
            onClick={onClick}
        >
            <div className={`p-3 rounded-full ${color.bg} flex items-center justify-center`}>
                {React.createElement(icon, { className: `${color.text}`, size: 24 })}
            </div>
            <div>
                <div className="text-xl font-bold text-sesm-deep">{value}</div>
                <p className="text-sm text-gray-500 font-semibold">{label}</p>
            </div>
            {onClick && <FiChevronRight className="ml-auto text-gray-400" size={24} />}
        </motion.div>
    );
};

const SubjectButton = ({ icon: Icon, label, onClick, colors }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      onClick={onClick}
      className="flex flex-col items-center justify-center space-y-3 cursor-pointer group"
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
      variants={itemVariants}
    >
      <div className={`w-full aspect-square bg-white rounded-2xl flex items-center justify-center border-2 border-gray-100 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:border-current ${colors.text}`}>
        <Icon size={32} />
      </div>
      <p className={`text-xs font-bold text-center transition-colors ${colors.text}`}>{label}</p>
    </motion.div>
  );
};

const TestimonialCard = ({ avatar, quote, name }) => (
  <motion.div
    className="bg-gray-100/80 rounded-2xl p-4 flex items-center space-x-3 shadow-sm"
    whileHover={{ y: -5, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}
  >
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
  </motion.div>
);

const HomePage = ({ onNavigate }) => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  
  const [pointsSummary, setPointsSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const { user } = useAuth();
  const { getSubjects, getPointsSummary } = useData();
  
  useEffect(() => {
    if (user && user.jenjang) {
      setLoading(true);
      setError(null);
      getSubjects(user.jenjang, user.kelas)
        .then(response => {
          const subjectsWithIconsAndColors = response.data.map(subject => ({
            ...subject,
            icon: iconMap[subject.icon] || FaBook,
            colors: subjectColors[subject.label.trim()] || subjectColors.default
          }));
          setSubjects(subjectsWithIconsAndColors);
        })
        .catch(err => {
          setError(err.response?.data?.message || 'Gagal memuat mata pelajaran.');
        })
        .finally(() => setLoading(false));
    } else if (user) {
      setLoading(false);
      setError("Data jenjang pengguna tidak ditemukan. Silakan login ulang.");
    }
  }, [user, getSubjects]);

  useEffect(() => {
    setSummaryLoading(true);
    getPointsSummary()
      .then(response => {
        setPointsSummary(response.data);
      })
      .catch(err => {
        console.error("Gagal memuat ringkasan poin:", err);
        setPointsSummary({ totalPoints: 0, currentRank: { name: 'Murid Baru', icon: 'bronze', color: '#CD7F32' } });
      })
      .finally(() => {
        setSummaryLoading(false);
      });
  }, [getPointsSummary]);

  const handleSubjectClick = (subjectLabel) => {
    if (!onNavigate) return;
    const subjectToViewMap = {
      'Matematika': 'matematika', 'Membaca': 'membaca', 'Menulis': 'menulis',
      'Berhitung': 'berhitung', 'Pendidikan Agama Islam': 'pai', 'Bahasa Indonesia': 'bahasaIndonesia',
      'Bahasa Inggris': 'bahasaInggris', 'PKN': 'pkn', 'IPA': 'ipa', 'IPS': 'ips'
    };
    const view = subjectToViewMap[subjectLabel.trim()];
    if (view) onNavigate(view);
    else alert(`Halaman untuk "${subjectLabel}" belum tersedia.`);
  };

  const handleSendSuggestion = () => {
    console.log("Saran dikirim:", suggestionText);
    alert("Terima kasih atas sarannya!");
    setSuggestionText('');
    setShowSuggestionModal(false);
  };

  const SubjectLoader = () => (
    [...Array(8)].map((_, i) => (
      <div key={i} className="flex flex-col items-center justify-center space-y-3">
        <div className="w-full aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    ))
  );

  const ErrorDisplay = ({ message }) => (
    <div className="col-span-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
      <div className="flex items-center">
        <FiAlertCircle className="text-2xl mr-3" />
        <div><p className="font-bold">Terjadi Kesalahan</p><p className="text-sm">{message}</p></div>
      </div>
    </div>
  );

  const gridContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };
  
  // Logika untuk menentukan kartu peringkat mana yang akan ditampilkan
  const renderRankCard = () => {
    if (summaryLoading) {
        return <div className="w-full h-24 bg-gray-200 rounded-2xl animate-pulse"></div>;
    }
    const highRanks = ['platinum', 'diamond', 'master'];
    const isHighRank = highRanks.includes(pointsSummary?.currentRank.icon);

    if (isHighRank) {
        return <RankCardAurora 
                    rank={pointsSummary.currentRank.name}
                    points={pointsSummary.totalPoints}
                    color={pointsSummary.currentRank.color}
                    icon={pointsSummary.currentRank.icon}
                    onNavigate={onNavigate}
                />
    } else {
        return <SimpleRankCard 
                    rank={pointsSummary.currentRank.name}
                    points={pointsSummary.totalPoints}
                    color={pointsSummary.currentRank.color}
                    icon={pointsSummary.currentRank.icon}
                    onNavigate={onNavigate}
                />
    }
  }

  return (
    <>
      {/* ========== MOBILE & TABLET ========== */}
      <div className="md:hidden">
        <div className="min-h-screen bg-gray-50 pb-28">
          <header className="px-6 pt-8 pb-4">
            <div className="flex items-center space-x-3">
              <img src={logoSesm} alt="Sesm Logo" className="w-12 h-12 object-contain" />
              <div>
                <h1 className="text-xl font-bold text-sesm-deep">Welcome</h1>
                <p className="text-xs text-gray-500">SMART EDUCATION SMART MORALITY</p>
              </div>
            </div>
            <div className="relative mt-4">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Coba cari materimu di sini" className="w-full bg-white text-gray-800 rounded-full py-3 pl-12 pr-4 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sesm-teal"/>
            </div>
          </header>

          <main className="px-6 mt-4">
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {renderRankCard()}
            </motion.div>

            <h2 className="text-lg font-bold text-gray-800 mb-4">Mata Pelajaran</h2>
            <motion.div 
              className="grid grid-cols-4 gap-x-4 gap-y-5"
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {loading ? <SubjectLoader /> : error ? <ErrorDisplay message={error} /> : (
                subjects.map(subject => (
                  <SubjectButton key={subject.label} {...subject} onClick={() => handleSubjectClick(subject.label)} />
                ))
              )}
            </motion.div>
            
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800">Fitur Unggulan SESM</h2>
              <div className="mt-3 bg-sesm-deep rounded-2xl p-4 shadow-lg space-y-3">
                <motion.button onClick={() => onNavigate('dailyChallenge')} className="w-full bg-gray-100/90 text-sesm-deep font-bold rounded-full flex items-center justify-between p-3 text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} >
                  <div className="flex items-center space-x-3"> <FiAward className="text-amber-500 text-xl" /> <span>TANTANGAN HARIAN</span> </div>
                  <FiChevronRight size={24} />
                </motion.button>
                <motion.button onClick={() => onNavigate('creativeZone')} className="w-full bg-gray-100/90 text-sesm-deep font-bold rounded-full flex items-center justify-between p-3 text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} >
                  <div className="flex items-center space-x-3"> <FaPalette className="text-violet-500 text-xl" /> <span>ZONA KREATIF</span> </div>
                  <FiChevronRight size={24} />
                </motion.button>
                <motion.button onClick={() => onNavigate('bookmark')} className="w-full bg-gray-100/90 text-sesm-deep font-bold rounded-full flex items-center justify-between p-3 text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} >
                  <div className="flex items-center space-x-3"> <FiSearch className="text-yellow-500 text-xl" /> <span>LATIHAN SOAL DI BANK BUKU</span> </div>
                  <FiChevronRight size={24} />
                </motion.button>
                <motion.button onClick={() => onNavigate('quiz')} className="w-full bg-gray-100/90 text-sesm-deep font-bold rounded-full flex items-center justify-between p-3 text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} >
                  <div className="flex items-center space-x-3"> <FiHelpCircle className="text-teal-500 text-xl" /> <span>KUIS PENGETAHUAN</span> </div>
                  <FiChevronRight size={24} />
                </motion.button>
              </div>
            </div>
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2"> <FiStar className="text-yellow-500" /> <span>Apa Kata Mereka</span> </h2>
              <div className="mt-4 space-y-4">
                {testimonials.map(testimonial => (
                  <TestimonialCard key={testimonial.name} {...testimonial} />
                ))}
              </div>
              <motion.button
                onClick={() => setShowSuggestionModal(true)}
                className="w-full mt-6 bg-sesm-teal text-white font-bold rounded-full flex items-center justify-center p-3 text-sm shadow-md"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiMessageSquare className="mr-2" size={18} /> Berikan Saran
              </motion.button>
            </div>
          </main>
        </div>
      </div>

      {/* ========== DESKTOP ========== */}
      <div className="hidden md:flex flex-col items-center w-full min-h-screen bg-gray-100 p-8">
        <div className="w-full max-w-6xl mx-auto">
          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-md flex flex-col flex-grow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <header className="flex justify-between items-center mb-10">
              <div className="flex items-center space-x-4">
                <img src={logoSesm} alt="Sesm Logo" className="w-16 h-16 object-contain" />
                <div>
                  <h1 className="text-3xl font-bold text-sesm-deep">Welcome</h1>
                  <p className="text-sm text-gray-500">SMART EDUCATION SMART MORALITY</p>
                </div>
              </div>
              <div className="relative w-2/5">
                <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Cari Materi..." className="w-full bg-gray-100 border-2 border-gray-200 rounded-full py-3.5 pl-14 pr-5 focus:outline-none focus:ring-2 focus:ring-sesm-teal focus:bg-white focus:border-sesm-deep transition-all duration-300"/>
              </div>
            </header>

            <main className="space-y-12 flex flex-col flex-grow">
              <motion.div 
                className="grid grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                  {/* Perenderan Kartu Peringkat di Desktop */}
                  {renderRankCard()}
                  <StatCard 
                      icon={FiCheckSquare} 
                      value="15" 
                      label="Materi & Kuis Selesai"
                      color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                    />
                     <StatCard 
                      icon={FiTrendingUp} 
                      value="Lihat Detail" 
                      label="Laporan Belajar"
                      color={{ bg: 'bg-indigo-100', text: 'text-indigo-600' }}
                      onClick={() => onNavigate('studyReport')}
                    />
              </motion.div>
              
              <h2 className="text-xl font-bold text-gray-800 -mb-6">Mata Pelajaran</h2>
              <motion.div 
                className="grid grid-cols-8 gap-8"
                variants={gridContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {loading ? <SubjectLoader /> : error ? (
                  <div className="col-span-8"><ErrorDisplay message={error} /></div>
                ) : (
                  subjects.map(subject => (
                    <SubjectButton key={subject.label} {...subject} onClick={() => handleSubjectClick(subject.label)} />
                  ))
                )}
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
                <div className="bg-sesm-deep rounded-2xl p-6 text-white shadow-lg flex flex-col flex-grow">
                  <h2 className="text-xl font-bold mb-4">Fitur Unggulan SESM</h2>
                  <div className='space-y-3 flex-grow flex flex-col'>
                    <motion.button onClick={() => onNavigate('dailyChallenge')} className="w-full bg-white text-sesm-deep font-bold rounded-full flex items-center justify-between p-4 flex-grow" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} >
                      <div className="flex items-center space-x-3"> <FiAward className="text-amber-500" size={22} /> <span>TANTANGAN HARIAN</span> </div>
                      <FiChevronRight size={24} />
                    </motion.button>
                     <motion.button onClick={() => onNavigate('creativeZone')} className="w-full bg-white text-sesm-deep font-bold rounded-full flex items-center justify-between p-4 flex-grow" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} >
                      <div className="flex items-center space-x-3"> <FaPalette className="text-violet-500" size={22} /> <span>ZONA KREATIF</span> </div>
                      <FiChevronRight size={24} />
                    </motion.button>
                    <motion.button onClick={() => onNavigate('bookmark')} className="w-full bg-white text-sesm-deep font-bold rounded-full flex items-center justify-between p-4 flex-grow" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} >
                      <div className="flex items-center space-x-3"> <FiSearch className="text-yellow-600" size={22} /> <span>LATIHAN SOAL DI BANK BUKU</span> </div>
                      <FiChevronRight size={24} />
                    </motion.button>
                    <motion.button onClick={() => onNavigate('quiz')} className="w-full bg-white text-sesm-deep font-bold rounded-full flex items-center justify-between p-4 flex-grow" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} >
                      <div className="flex items-center space-x-3"> <FiHelpCircle className="text-teal-600" size={22} /> <span>KUIS PENGETAHUAN</span> </div>
                      <FiChevronRight size={24} />
                    </motion.button>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4"> <FiStar className="text-yellow-500" /> <span>Apa Kata Mereka</span> </h2>
                  <div className="space-y-4 flex-grow">
                    {testimonials.map(testimonial => (
                      <TestimonialCard key={testimonial.name} {...testimonial} />
                    ))}
                  </div>
                  <motion.button
                    onClick={() => setShowSuggestionModal(true)}
                    className="w-full mt-6 bg-sesm-teal text-white font-bold rounded-full flex items-center justify-center p-3 text-sm shadow-md"
                    whileHover={{ scale: 1.03, backgroundColor: '#0f766e' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiMessageSquare className="mr-2" size={18} /> Berikan Saran
                  </motion.button>
                </div>
              </div>
            </main>
          </motion.div>
        </div>
      </div>

      {/* --- Modal Berikan Saran --- */}
      <AnimatePresence>
        {showSuggestionModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuggestionModal(false)}
          >
            <motion.div
              className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSuggestionModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
              <h3 className="text-2xl font-bold text-sesm-deep mb-4">Berikan Saran Anda</h3>
              <p className="text-gray-700 mb-4">Kami sangat menghargai masukan Anda untuk meningkatkan SESM!</p>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sesm-teal resize-y min-h-[100px]"
                placeholder="Tulis saran atau komentar Anda di sini..."
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
              ></textarea>
              <div className="flex justify-end space-x-3 mt-5">
                <motion.button
                  onClick={() => setShowSuggestionModal(false)}
                  className="px-5 py-2 border border-gray-300 rounded-full text-gray-700 font-semibold"
                  whileHover={{ backgroundColor: '#f0f0f0' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={handleSendSuggestion}
                  className="px-5 py-2 bg-sesm-teal text-white rounded-full font-semibold shadow-md"
                  whileHover={{ backgroundColor: '#0f766e' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Kirim Saran
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomePage;