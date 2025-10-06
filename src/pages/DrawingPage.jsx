import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiTrash2, FiFolder, FiFilePlus, FiSave,
    FiCloud, FiCloudOff, FiCheckCircle, FiAlertTriangle, FiInfo,
    FiDownload, FiMinus, FiPlus
} from 'react-icons/fi';
import { FaPaintBrush, FaEraser } from 'react-icons/fa';

// === Komponen Modal Konfirmasi ===
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4"><FiAlertTriangle className="h-6 w-6 text-yellow-600" /></div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-2">{message}</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
                    <button onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Ya, Hapus</button>
                    <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Batal</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// === Komponen Modal Notifikasi ===
const NotificationModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4"><FiInfo className="h-6 w-6 text-blue-600" /></div>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-500 mt-2">{message}</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
                    <button onClick={onClose} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sesm-teal text-base font-medium text-white hover:bg-sesm-deep focus:outline-none sm:w-auto sm:text-sm">Mengerti</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Palet warna
const colors = ['#000000', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#FFFFFF'];

// Komponen Pilihan Warna
const ColorSwatch = ({ color, isActive, onClick }) => (
  <motion.div onClick={onClick} className="w-10 h-10 rounded-full cursor-pointer border-2" style={{ backgroundColor: color, borderColor: isActive ? '#3B82F6' : 'rgba(255,255,255,0.5)' }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
    {isActive && <motion.div layoutId="color-indicator" className="w-full h-full rounded-full border-2 border-white" />}
  </motion.div>
);


// === Komponen Utama yang Telah Diubah ===
const DrawingPage = ({ onNavigate }) => {
  // --- STATE MANAGEMENT UNTUK MENGGAMBAR ---
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('brush'); // 'brush' or 'eraser'
  const [status, setStatus] = useState({ text: 'Siap Menggambar', icon: <FiCheckCircle size={16} /> });

  // --- STATE MANAGEMENT MODAL ---
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({ title: '', message: '' });

  // Inisialisasi kanvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;
    const context = canvas.getContext('2d');
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.lineCap = 'round';
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    contextRef.current = context;
  }, []);

  // Update properti kuas saat state berubah
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize, tool]);
  
  // Fungsi-fungsi untuk menggambar
  const getCoords = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches ? event.touches[0] : event;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDrawing = (e) => { const { x, y } = getCoords(e); contextRef.current.beginPath(); contextRef.current.moveTo(x, y); setIsDrawing(true); };
  const finishDrawing = () => { contextRef.current.closePath(); setIsDrawing(false); };
  const draw = (e) => { if (!isDrawing) return; const { x, y } = getCoords(e); contextRef.current.lineTo(x, y); contextRef.current.stroke(); };

  // Fungsi-fungsi tombol header yang diadaptasi
  const handleSaveImage = () => {
    setStatus({ text: 'Menyimpan...', icon: <FiSave size={16} className="animate-spin" /> });
    setTimeout(() => {
        try {
            const canvas = canvasRef.current;
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `karyaku-${Date.now()}.png`;
            link.click();
            setStatus({ text: 'Tersimpan', icon: <FiCheckCircle size={16} /> });
        } catch (error) {
            console.error("Gagal menyimpan gambar:", error);
            setStatus({ text: 'Gagal', icon: <FiAlertTriangle size={16} /> });
        }
    }, 500);
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    contextRef.current.fillStyle = "white";
    contextRef.current.fillRect(0, 0, canvas.width, canvas.height);
    setIsDeleteConfirmOpen(false);
    setStatus({ text: 'Kanvas Dibersihkan', icon: <FiCheckCircle size={16} /> });
  };
  
  const showFeatureUnavailable = () => {
    setNotificationMessage({ title: "Fitur Belum Tersedia", message: "Fitur ini hanya untuk halaman menulis." });
    setIsNotificationOpen(true);
  };


  return (
    <div className="w-full h-screen bg-blue-50 flex flex-col font-sans overflow-hidden">
      {/* Header (menggunakan layout dari WritingPage dengan warna biru) */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="bg-gradient-to-r from-sesm-teal to-sesm-deep p-3 flex justify-between items-center shadow-lg z-20">
        <button onClick={() => onNavigate('creativeZone')} className="p-2 rounded-full text-white hover:bg-white/20"><FiArrowLeft size={22} /></button>
        <div className='flex items-center gap-2'>
            <div className='flex items-center space-x-2 text-white/90 text-sm bg-black/10 px-3 py-1.5 rounded-full'>
                {status.icon}
                <span>{status.text}</span>
            </div>
            <button onClick={handleSaveImage} className="p-2 rounded-full text-white hover:bg-white/20" title="Simpan Gambar"><FiSave size={20} /></button>
            <div className="w-px h-6 bg-white/20"></div>
            <button onClick={() => setIsDeleteConfirmOpen(true)} className="p-2 rounded-full text-white hover:bg-white/20" title="Kanvas Baru (Hapus Semua)"><FiFilePlus size={20} /></button>
            <button onClick={showFeatureUnavailable} className="p-2 rounded-full text-white hover:bg-white/20" title="Buka Proyek (Tidak Tersedia)"><FiFolder size={20} /></button>
            <button onClick={() => setIsDeleteConfirmOpen(true)} className="p-2 rounded-full text-white hover:bg-white/20" title="Hapus Kanvas"><FiTrash2 size={20} /></button>
        </div>
        <button onClick={showFeatureUnavailable} className={`p-2 rounded-full text-white transition-colors bg-gray-500/50 cursor-not-allowed`} title="Simpan Otomatis (Tidak Tersedia)">
            <FiCloudOff size={20} />
        </button>
      </motion.header>

      {/* Area Menggambar Utama */}
      <main className="flex-1 flex flex-col p-4 md:p-8 relative overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full flex-1 flex flex-col bg-white rounded-2xl shadow-inner overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startDrawing} onMouseUp={finishDrawing} onMouseMove={draw}
              onMouseLeave={finishDrawing} onTouchStart={startDrawing} onTouchEnd={finishDrawing} onTouchMove={draw}
            />
        </motion.div>
      </main>
      
      {/* Footer Kontrol Alat Gambar */}
      <motion.footer initial={{ y: 200 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }} className="bg-white/80 backdrop-blur-md p-4 rounded-t-2xl shadow-2xl z-20">
        <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex space-x-2">
                <button onClick={() => setTool('brush')} className={`p-3 rounded-xl ${tool === 'brush' ? 'bg-sesm-deep text-white' : 'bg-gray-200'}`}><FaPaintBrush size={20}/></button>
                <button onClick={() => setTool('eraser')} className={`p-3 rounded-xl ${tool === 'eraser' ? 'bg-sesm-deep text-white' : 'bg-gray-200'}`}><FaEraser size={20}/></button>
            </div>
            <div className="flex items-center space-x-3 bg-gray-200 p-1 rounded-xl">
                <button onClick={() => setBrushSize(s => Math.max(1, s - 2))} className="p-2"><FiMinus /></button>
                <div className="w-5 h-5 rounded-full bg-gray-700" style={{ transform: `scale(${brushSize/10})` }}></div>
                <button onClick={() => setBrushSize(s => Math.min(50, s + 2))} className="p-2"><FiPlus /></button>
            </div>
        </div>
        <div className="flex justify-center items-center space-x-2 overflow-x-auto pb-2">
          <AnimatePresence>
            {colors.map((c) => ( <ColorSwatch key={c} color={c} isActive={color === c && tool !== 'eraser'} onClick={() => { setColor(c); setTool('brush'); }} /> ))}
          </AnimatePresence>
        </div>
      </motion.footer>
      
      {/* === KUMPULAN MODAL === */}
      <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={handleClearCanvas} title="Hapus Semua Goresan?" message="Kanvas akan menjadi kosong kembali. Aksi ini tidak dapat diurungkan." />
      <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} title={notificationMessage.title} message={notificationMessage.message} />
    </div>
  );
};

export default DrawingPage;