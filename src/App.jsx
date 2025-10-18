import { AnimatePresence, motion } from 'framer-motion';
import { useNavigation } from './hooks/useNavigation';

// Komponen-komponen halaman
import AppRoutes from './AppRoutes'; // Komponen baru untuk mengatur semua rute
import LoadingBar from './components/ui/LoadingBar'; // Komponen baru untuk loading bar

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.4,
};

function App() {
  // Ambil state loading dari navigation context
  const { isLoading, currentView } = useNavigation();

  return (
    <>
      {/* Loading bar akan muncul di atas semua konten jika isLoading true */}
      <AnimatePresence>
        {isLoading && <LoadingBar />}
      </AnimatePresence>
      
      {/* AppRoutes sekarang menangani semua logika tampilan halaman */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView} // Key di sini penting untuk memicu animasi saat view berubah
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <AppRoutes />
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export default App;