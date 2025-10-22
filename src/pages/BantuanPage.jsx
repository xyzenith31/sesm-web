// contoh-sesm-web/pages/BantuanPage.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiHelpCircle, FiHome, FiBookOpen, FiSearch, FiBookmark,
    FiUser, FiAward, FiZap, FiEdit, FiCamera, FiSettings, FiLogOut, FiTrendingUp,
    FiMessageSquare, FiStar, FiCalendar, FiClock, FiChevronDown, FiChevronUp,
    FiCheckSquare, FiBook as FiBookIcon, FiFlag, FiSave, FiFilter, FiList, FiFolder, FiCloud,
    FiMail, FiUsers, FiCheckCircle // Added FiCheckCircle if needed, FiMail is already there
} from 'react-icons/fi';
import {
    FaPalette, FaTrophy, FaQuestionCircle, FaPenFancy,
    FaBug
} from 'react-icons/fa';
import { useNavigation } from '../hooks/useNavigation';
import FeedbackModal from '../components/mod/FeedbackModal';
import SupportChoiceModal from '../components/mod/SupportChoiceModal'; // Import modal kustom

// Data Bantuan (Bisa dipisah ke file lain jika terlalu besar)
const helpSections = [
    {
        id: 'home',
        title: 'Halaman Utama (Home)',
        icon: FiHome,
        content: [
            {
                subTitle: 'Navigasi Utama',
                description: 'Gunakan Sidebar (Desktop) atau Navbar Bawah (Mobile) untuk berpindah antar halaman utama: Home, Explore, Bookmark, dan Profile.',
                icon: FiHome,
            },
            {
                subTitle: 'Pencarian Materi',
                description: 'Gunakan kolom pencarian di bagian atas untuk mencari materi pelajaran dengan cepat.',
                icon: FiSearch,
            },
            {
                subTitle: 'Poin & Peringkat',
                description: 'Lihat total poin dan peringkat Anda saat ini. Klik untuk melihat detail peringkat dan leaderboard.',
                icon: FiAward,
            },
            {
                subTitle: 'Aktivitas Selesai',
                description: 'Menampilkan jumlah materi atau kuis yang telah Anda selesaikan. Klik untuk melihat Laporan Belajar.',
                icon: FiCheckSquare,
            },
            {
                subTitle: 'Mata Pelajaran',
                description: 'Pilih mata pelajaran yang ingin Anda pelajari. Setiap ikon mewakili satu mapel.',
                icon: FiBookOpen,
            },
            {
                subTitle: 'Fitur Unggulan',
                description: 'Akses cepat ke fitur-fitur menarik seperti Tantangan Harian, Zona Kreatif, Bank Buku (Bookmark), dan Kuis.',
                icon: FiStar,
            },
        ]
    },
    {
        id: 'mapel',
        title: 'Halaman Mata Pelajaran',
        icon: FiBookOpen,
        content: [
            {
                subTitle: 'Daftar Bab',
                description: 'Menampilkan semua bab materi yang tersedia untuk mata pelajaran yang dipilih.',
                icon: FiBookOpen,
            },
            {
                subTitle: 'Pencarian Bab',
                description: 'Cari bab spesifik dalam mata pelajaran menggunakan kolom pencarian.',
                icon: FiSearch,
            },
            {
                subTitle: 'Statistik Mapel',
                description: 'Lihat ringkasan progres Anda di mata pelajaran ini, seperti jumlah materi selesai dan nilai rata-rata.',
                icon: FiTrendingUp,
            },
            {
                subTitle: 'Riwayat & Nilai',
                description: 'Lihat daftar materi yang sudah pernah Anda kerjakan beserta skor dan poin yang didapat.',
                icon: FiClock,
            },
            {
                subTitle: 'Mulai Belajar',
                description: 'Klik pada salah satu bab untuk membuka halaman pengerjaan (Worksheet). Ikon medali menandakan bab sudah pernah dikerjakan.',
                icon: FiZap,
            },
        ]
    },
    {
        id: 'worksheet',
        title: 'Halaman Pengerjaan Materi (Worksheet)',
        icon: FiCheckSquare,
        content: [
            {
                subTitle: 'Navigasi Soal',
                description: 'Gunakan tombol panah atau daftar nomor soal (di sidebar/menu) untuk berpindah antar soal.',
                icon: FiChevronDown, // Menggunakan ikon yang relevan
            },
            {
                subTitle: 'Media Pembelajaran',
                description: 'Lihat materi pendukung seperti video, gambar, PDF, atau link eksternal yang disediakan guru.',
                icon: FiCamera,
            },
            {
                subTitle: 'Menjawab Soal',
                description: 'Pilih jawaban untuk soal Pilihan Ganda atau ketik jawaban Anda untuk soal Esai.',
                icon: FiEdit,
            },
            {
                subTitle: 'Tandai Ragu',
                description: 'Gunakan tombol bendera (Flag) untuk menandai soal yang ingin Anda tinjau kembali nanti.',
                icon: FiFlag,
            },
            {
                subTitle: 'Batas Waktu (Opsional)',
                description: 'Jika materi memiliki batas waktu, timer akan muncul di bagian atas.',
                icon: FiClock,
            },
            {
                subTitle: 'Kumpulkan Jawaban',
                description: 'Klik tombol "Kumpulkan Jawaban" setelah selesai. Anda mungkin perlu menjawab semua soal jika diwajibkan.',
                icon: FiSave,
            },
            {
                subTitle: 'Hasil & Poin',
                description: 'Setelah mengumpulkan, Anda akan melihat skor (jika dinilai otomatis) dan poin yang didapat. Anda juga bisa meninjau jawaban jika diizinkan.',
                icon: FiAward,
            },
        ]
    },
    {
        id: 'explore',
        title: 'Halaman Jelajahi (Explore)',
        icon: FiSearch,
        content: [
            {
                subTitle: 'Tantangan Harian',
                description: 'Selesaikan misi kuis singkat setiap hari untuk mendapatkan poin tambahan.',
                icon: FiZap,
            },
            {
                subTitle: 'Zona Kreatif',
                description: 'Asah kreativitas Anda dengan fitur Menggambar atau Menulis Kreatif.',
                icon: FaPalette,
            },
            {
                subTitle: 'Cerita Interaktif',
                description: 'Baca cerita dan tentukan alurnya sendiri. Setiap pilihan membawa ke akhir yang berbeda!',
                icon: FiBookIcon, // Menggunakan alias FiBookIcon
            },
            {
                subTitle: 'Kuis Pengetahuan',
                description: 'Uji wawasan Anda dengan berbagai kuis seru di luar materi pelajaran.',
                icon: FaQuestionCircle,
            },
        ]
    },
     {
        id: 'kreatif',
        title: 'Zona Kreatif',
        icon: FaPalette,
        content: [
            {
                subTitle: 'Menggambar & Mewarnai',
                description: 'Gunakan kanvas digital untuk menggambar bebas. Pilih kuas, warna, ukuran, dan stempel. Simpan karyamu atau buat kanvas baru.',
                icon: FaPalette,
            },
            {
                subTitle: 'Menulis Kreatif',
                description: 'Tulis cerpen, puisi, atau catatan lainnya di editor teks. Atur format tulisan (bold, italic, dll.), pilih font, dan simpan karyamu.',
                icon: FaPenFancy, // Menggunakan FaPenFancy
            },
             {
                subTitle: 'Manajemen Proyek',
                description: 'Setiap karya gambar atau tulisan disimpan sebagai proyek. Anda bisa membuka, menghapus, atau membuat proyek baru melalui tombol folder/plus.',
                icon: FiFolder,
            },
            {
                subTitle: 'Simpan Otomatis',
                description: 'Karya Anda di Zona Kreatif akan tersimpan otomatis secara berkala jika fitur ini aktif.',
                icon: FiCloud,
            },
        ]
    },
    {
        id: 'bookmark',
        title: 'Halaman Bookmark',
        icon: FiBookmark,
        content: [
            {
                subTitle: 'Daftar Materi',
                description: 'Menampilkan materi tambahan atau latihan soal yang ditandai (bookmark) oleh guru untuk Anda.',
                icon: FiBookmark,
            },
            {
                subTitle: 'Filter & Urutkan',
                description: 'Gunakan filter berdasarkan tipe materi, mapel, jenjang, atau urutkan berdasarkan tanggal atau judul.',
                icon: FiFilter,
            },
            {
                subTitle: 'Mengerjakan Materi',
                description: 'Klik pada materi untuk membuka detail dan mengerjakan soal latihan yang ada di dalamnya.',
                icon: FiEdit,
            },
            {
                subTitle: 'Riwayat & Nilai',
                description: 'Lihat riwayat pengerjaan materi bookmark Anda beserta skor dan status penilaian (jika ada).',
                icon: FiClock,
            },
        ]
    },
    {
        id: 'kuis',
        title: 'Halaman Kuis',
        icon: FaQuestionCircle,
        content: [
            {
                subTitle: 'Daftar Kuis',
                description: 'Temukan berbagai kuis pengetahuan umum atau kuis khusus yang dibuat guru.',
                icon: FiList,
            },
            {
                subTitle: 'Filter & Urutkan',
                description: 'Cari kuis berdasarkan judul, urutkan berdasarkan kuis terbaru, terpopuler, atau poin terbanyak.',
                icon: FiFilter,
            },
            {
                subTitle: 'Mulai Kuis',
                description: 'Klik pada kuis untuk melihat detailnya, lalu klik "Mulai Kuis!" untuk memulai tantangan.',
                icon: FiZap,
            },
             {
                subTitle: 'Pengerjaan Kuis',
                description: 'Jawab pertanyaan satu per satu. Perhatikan waktu jika timer aktif. Gunakan fitur "Tandai Ragu" jika perlu.',
                icon: FiEdit,
            },
            {
                subTitle: 'Hasil & Papan Skor',
                description: 'Setelah selesai, lihat skor, poin yang didapat, dan posisi Anda di papan skor (jika tersedia). Anda juga bisa meninjau jawaban.',
                icon: FaTrophy,
            },
            {
                subTitle: 'Riwayat Kuis',
                description: 'Lihat riwayat kuis yang pernah Anda ikuti beserta skor dan poin yang didapatkan.',
                icon: FiClock,
            },
        ]
    },
    {
        id: 'profil',
        title: 'Halaman Profil',
        icon: FiUser,
        content: [
             {
                subTitle: 'Informasi Akun',
                description: 'Lihat nama, jenjang/kelas, dan avatar Anda.',
                icon: FiUser,
            },
            {
                subTitle: 'Statistik Belajar',
                description: 'Ringkasan total poin, jumlah tugas selesai, dan perkiraan waktu belajar Anda.',
                icon: FiTrendingUp,
            },
            {
                subTitle: 'Peringkat Saat Ini',
                description: 'Lihat peringkat Anda berdasarkan total poin. Klik untuk melihat detail semua peringkat.',
                icon: FiAward,
            },
            {
                subTitle: 'Laporan Belajar',
                description: 'Lihat riwayat detail semua aktivitas yang memberikan Anda poin.',
                icon: FiBookOpen,
            },
            {
                subTitle: 'Buku Harian',
                description: 'Tulis dan lihat catatan harian pribadi Anda.',
                icon: FiMessageSquare,
            },
             {
                subTitle: 'Pengaturan Akun',
                description: 'Ubah nama, username, umur, password, dan foto profil/avatar Anda.',
                icon: FiSettings,
            },
            {
                subTitle: 'Pusat Bantuan',
                description: 'Akses halaman ini untuk mendapatkan panduan penggunaan aplikasi.',
                icon: FiHelpCircle,
            },
             {
                subTitle: 'Logout',
                description: 'Keluar dari akun Anda. Akses melalui menu dropdown di Sidebar (Desktop) atau Navbar Bawah (Mobile).',
                icon: FiLogOut,
            },
        ]
    },
    {
        id: 'lainnya',
        title: 'Fitur Lainnya',
        icon: FiStar,
        content: [
            {
                subTitle: 'Agenda/Kalender',
                description: 'Akses agenda pribadi Anda melalui ikon jam/kalender di Sidebar (Desktop) atau menu profil (Mobile). Tambah atau hapus jadwal kegiatan Anda.',
                icon: FiCalendar,
            },
            {
                subTitle: 'Notifikasi Poin',
                description: 'Setiap kali Anda mendapatkan poin dari menyelesaikan aktivitas (materi, kuis, tantangan, cerita), notifikasi poin akan muncul di pojok kanan atas.',
                icon: FiAward,
            },
             {
                subTitle: 'Animasi & Efek',
                description: 'Nikmati berbagai animasi halus saat berpindah halaman, membuka modal, atau saat progres belajar Anda meningkat.',
                icon: FiZap,
            },
        ]
    },
];

// Komponen Accordion Item
const AccordionItem = ({ section, isOpen, onClick }) => {
    const Icon = section.icon;
    return (
        <motion.div
            layout
            className={`bg-white rounded-xl shadow-sm border overflow-hidden mb-4 transition-all duration-300 ${isOpen ? 'border-sesm-teal ring-2 ring-sesm-teal/20' : 'border-gray-200'}`}
            whileHover={{ y: -3, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)" }}
        >
            <motion.header
                layout
                initial={false}
                onClick={onClick}
                className={`p-4 flex justify-between items-center cursor-pointer ${isOpen ? 'bg-sesm-teal/10' : 'hover:bg-gray-50'}`}
                whileTap={{ backgroundColor: isOpen ? 'rgba(13, 148, 136, 0.15)' : 'rgba(243, 244, 246, 1)' }} // Efek tap
            >
                <div className="flex items-center gap-3">
                    <Icon className={`text-xl transition-colors ${isOpen ? 'text-sesm-deep' : 'text-gray-500'}`} />
                    <h3 className={`font-bold text-lg transition-colors ${isOpen ? 'text-sesm-deep' : 'text-gray-700'}`}>{section.title}</h3>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <FiChevronDown className="text-gray-500" />
                </motion.div>
            </motion.header>
            <AnimatePresence>
                {isOpen && (
                    <motion.section
                        layout
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="px-4 pb-4 pt-2"
                    >
                        <div className="space-y-3 pl-8 border-l-2 border-sesm-teal/30 ml-2">
                            {section.content.map((item, index) => (
                                <motion.div
                                    key={index}
                                    variants={{ collapsed: { y: -10, opacity: 0 }, open: { y: 0, opacity: 1 } }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="flex items-start gap-3"
                                >
                                    {item.icon && <item.icon className="text-sesm-teal mt-1 flex-shrink-0" size={16} />}
                                    <div>
                                        {item.subTitle && <h4 className="font-semibold text-gray-700">{item.subTitle}</h4>}
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Komponen Utama BantuanPage
const BantuanPage = () => {
    const { navigate } = useNavigation();
    const [openSection, setOpenSection] = useState(null);
    const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

    const toggleSection = (id) => {
        setOpenSection(openSection === id ? null : id);
    };

    const handleContactClick = () => {
        setIsChoiceModalOpen(true);
    };

    const handleEmailAction = () => {
        window.location.href = 'mailto:sesmweb@gmail.com?subject=Kritik%20dan%20Saran%20untuk%20SESM';
        setIsChoiceModalOpen(false); // Close the choice modal
    };

    const handleFeedbackFormAction = () => {
        setIsChoiceModalOpen(false); // Close the choice modal first
        setTimeout(() => {
            setIsFeedbackModalOpen(true); // Open feedback modal after a short delay
        }, 150); // Delay allows the choice modal to animate out
    };

    return (
        <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">

            {/* === MODAL 1: Pilihan Kontak (Menggunakan SupportChoiceModal) === */}
            <AnimatePresence>
                {isChoiceModalOpen && (
                    <SupportChoiceModal
                        isOpen={isChoiceModalOpen}
                        onClose={() => setIsChoiceModalOpen(false)}
                        onEmailClick={handleEmailAction}
                        onFeedbackClick={handleFeedbackFormAction}
                    />
                )}
            </AnimatePresence>

            {/* === MODAL 2: Form Feedback === */}
            <FeedbackModal
                isOpen={isFeedbackModalOpen}
                onClose={() => setIsFeedbackModalOpen(false)}
            />

            {/* Header */}
            <header className="bg-white p-4 pt-8 md:pt-4 flex items-center sticky top-0 z-10 shadow-sm flex-shrink-0">
                <motion.button
                    onClick={() => navigate('profile')}
                    className="p-2 rounded-full hover:bg-gray-100"
                    whileTap={{ scale: 0.9 }}
                >
                    <FiArrowLeft size={24} className="text-gray-700" />
                </motion.button>
                <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep flex items-center justify-center">
                    <FiHelpCircle className="mr-2" /> Pusat Bantuan
                </h1>
                <div className="w-10"></div> {/* Spacer */}
            </header>

            {/* Konten utama (Scrollable) */}
            <main className="flex-grow overflow-y-auto p-4 md:p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full mx-auto"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Selamat Datang di SESM!</h2>
                        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Temukan panduan lengkap untuk menggunakan semua fitur belajar yang seru di sini.</p>
                    </div>

                    {/* Accordion Bantuan */}
                    <div className="w-full">
                        {helpSections.map((section) => (
                            <AccordionItem
                                key={section.id}
                                section={section}
                                isOpen={openSection === section.id}
                                onClick={() => toggleSection(section.id)}
                            />
                        ))}
                    </div>

                    {/* Kontak Bantuan */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: helpSections.length * 0.05 + 0.3 }}
                        className="mt-10 mb-6 text-center bg-sesm-teal/10 p-6 rounded-xl border border-sesm-teal/30"
                    >
                        <h3 className="font-bold text-lg text-sesm-deep">Masih Butuh Bantuan?</h3>
                        <p className="text-gray-600 mt-1 mb-4">Tim kami siap mendengarkan masukan Anda untuk menjadikan SESM lebih baik.</p>
                        <motion.button
                            onClick={handleContactClick}
                            className="inline-flex items-center gap-2 bg-sesm-deep text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sesm-deep"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiMessageSquare /> Hubungi Support
                        </motion.button>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

export default BantuanPage;