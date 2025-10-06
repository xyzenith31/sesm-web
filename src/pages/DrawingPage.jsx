import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowLeft, FiTrash2, FiDownload, FiEdit2, FiDroplet, FiCircle, FiMinus, FiPlus
} from 'react-icons/fi';
import { FaPaintBrush, FaEraser } from 'react-icons/fa';

// Palet warna yang ceria
const colors = [
  '#000000', '#EF4444', '#F97316', '#F59E0B', '#84CC16',
  '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6',
  '#EC4899', '#F43F5E', '#FFFFFF'
];

// Komponen Tombol Aksi di Header
const ActionButton = ({ icon: Icon, onClick, label }) => (
  <motion.button
    onClick={onClick}
    className="p-3 bg-white/20 rounded-full text-white"
    whileTap={{ scale: 0.9 }}
    aria-label={label}
  >
    <Icon size={20} />
  </motion.button>
);

// Komponen Pilihan Warna
const ColorSwatch = ({ color, isActive, onClick }) => (
  <motion.div
    onClick={onClick}
    className="w-10 h-10 rounded-full cursor-pointer border-2"
    style={{
      backgroundColor: color,
      borderColor: isActive ? '#3B82F6' : 'rgba(255,255,255,0.5)',
    }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
  >
    {isActive && (
      <motion.div
        layoutId="color-indicator"
        className="w-full h-full rounded-full border-2 border-white"
      />
    )}
  </motion.div>
);

const DrawingPage = ({ onNavigate }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // State untuk alat gambar
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('brush'); // 'brush' or 'eraser'

  // Inisialisasi kanvas
  useEffect(() => {
    const canvas = canvasRef.current;
    // Menyesuaikan ukuran kanvas dengan ukuran elemen di layar
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    canvas.style.width = `${canvas.offsetWidth}px`;
    canvas.style.height = `${canvas.offsetHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    contextRef.current = context;
  }, []);

  // Update pengaturan kuas saat state berubah
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize, tool]);

  const getCoords = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (event.touches) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    }
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const startDrawing = (event) => {
    const { x, y } = getCoords(event);
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const { x, y } = getCoords(event);
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'karyaku-sesm.png';
    link.click();
  };

  return (
    <div className="w-full h-screen bg-gray-200 flex flex-col overflow-hidden">
      {/* Header dengan animasi */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="bg-gradient-to-r from-sesm-teal to-sesm-deep p-4 flex justify-between items-center shadow-lg z-20"
      >
        <ActionButton icon={FiArrowLeft} onClick={() => onNavigate('creativeZone')} label="Kembali" />
        <h1 className="text-white text-xl font-bold">Kanvas Ajaib</h1>
        <div className="flex items-center space-x-2">
          <ActionButton icon={FiTrash2} onClick={clearCanvas} label="Bersihkan" />
          <ActionButton icon={FiDownload} onClick={downloadImage} label="Simpan" />
        </div>
      </motion.header>

      {/* Area Kanvas */}
      <main className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-white"
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          onMouseLeave={finishDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={finishDrawing}
          onTouchMove={draw}
        />
      </main>

      {/* Toolbar bawah dengan animasi */}
      <motion.footer
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }}
        className="bg-white/80 backdrop-blur-md p-4 rounded-t-2xl shadow-2xl z-20"
      >
        {/* Kontrol Alat (Kuas & Penghapus) */}
        <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex space-x-2">
                <button onClick={() => setTool('brush')} className={`p-3 rounded-xl ${tool === 'brush' ? 'bg-sesm-deep text-white' : 'bg-gray-200'}`}><FaPaintBrush size={20}/></button>
                <button onClick={() => setTool('eraser')} className={`p-3 rounded-xl ${tool === 'eraser' ? 'bg-sesm-deep text-white' : 'bg-gray-200'}`}><FaEraser size={20}/></button>
            </div>
            {/* Kontrol Ukuran Kuas */}
            <div className="flex items-center space-x-3 bg-gray-200 p-1 rounded-xl">
                <button onClick={() => setBrushSize(s => Math.max(1, s - 1))} className="p-2"><FiMinus /></button>
                <FiCircle size={brushSize + 5} className="text-gray-700"/>
                <button onClick={() => setBrushSize(s => Math.min(50, s + 1))} className="p-2"><FiPlus /></button>
            </div>
        </div>

        {/* Palet Warna */}
        <div className="flex justify-center items-center space-x-2 overflow-x-auto pb-2">
          <AnimatePresence>
            {colors.map((c) => (
              <ColorSwatch
                key={c}
                color={c}
                isActive={color === c && tool !== 'eraser'}
                onClick={() => {
                  setColor(c);
                  setTool('brush');
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.footer>
    </div>
  );
};

export default DrawingPage;