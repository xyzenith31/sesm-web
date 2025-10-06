import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiTrash2, FiFolder, FiFilePlus, FiSave,
    FiCloud, FiCloudOff, FiCheckCircle, FiAlertTriangle, FiInfo,
    FiMinus, FiPlus
} from 'react-icons/fi';
import { FaPaintBrush, FaEraser } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

// --- Komponen Modal (Tidak perlu diubah) ---
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
                    <button onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Lanjutkan</button>
                    <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Batal</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

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

const colors = ['#000000', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#FFFFFF'];

const ColorSwatch = ({ color, isActive, onClick }) => (
  <motion.div onClick={onClick} className="w-10 h-10 rounded-full cursor-pointer border-2" style={{ backgroundColor: color, borderColor: isActive ? '#3B82F6' : 'rgba(255,255,255,0.5)' }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
    {isActive && <motion.div layoutId="color-indicator" className="w-full h-full rounded-full border-2 border-white" />}
  </motion.div>
);


// === Komponen Utama DrawingPage ===
const DrawingPage = ({ onNavigate }) => {
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [tool, setTool] = useState('brush');

    // State Management dari WritingPage
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
    const [saveStatus, setSaveStatus] = useState('Tersimpan');
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isAutoSaveConfirmOpen, setIsAutoSaveConfirmOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState({ title: '', message: '' });

    const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId) || null, [projects, activeProjectId]);

    const redrawCanvas = useCallback((imageData) => {
        const canvas = contextRef.current?.canvas;
        if (!canvas || !contextRef.current) return;

        const context = contextRef.current;
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (imageData) {
            const image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
            };
            image.src = imageData;
        }
    }, []);
    
    // **FIX: Menggunakan useCallback ref untuk inisialisasi kanvas yang aman**
    const canvasRef = useCallback((canvasNode) => {
        if (!canvasNode) return; // Jika kanvas belum ada, keluar
        
        // Atur ukuran kanvas
        canvasNode.width = canvasNode.offsetWidth * window.devicePixelRatio;
        canvasNode.height = canvasNode.offsetHeight * window.devicePixelRatio;
        
        // Dapatkan konteks 2D
        const context = canvasNode.getContext('2d');
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.lineCap = 'round';
        contextRef.current = context; // Simpan konteks ke ref
        
        // Memuat proyek saat kanvas pertama kali siap
        try {
            const savedProjects = JSON.parse(localStorage.getItem('sesm-drawing-projects')) || [];
            const lastActiveId = localStorage.getItem('sesm-drawing-last-active-id');
            if (savedProjects.length > 0) {
                setProjects(savedProjects);
                const activeId = lastActiveId && savedProjects.some(p => p.id === lastActiveId) ? lastActiveId : savedProjects[0].id;
                setActiveProjectId(activeId);
                const projectToLoad = savedProjects.find(p => p.id === activeId);
                 if (projectToLoad) redrawCanvas(projectToLoad.imageData);
            } else {
                const newProject = { id: uuidv4(), title: 'Kanvas Pertamaku', imageData: null, lastModified: Date.now() };
                setProjects([newProject]);
                setActiveProjectId(newProject.id);
                redrawCanvas(null);
                localStorage.setItem('sesm-drawing-projects', JSON.stringify([newProject]));
                localStorage.setItem('sesm-drawing-last-active-id', newProject.id);
            }
        } catch (error) { console.error("Gagal memuat proyek gambar:", error); }

    }, [redrawCanvas]); // Depedensi ke redrawCanvas


    // Menyimpan semua proyek ke local storage
    const saveAllProjects = useCallback((projectList, currentActiveId) => {
        localStorage.setItem('sesm-drawing-projects', JSON.stringify(projectList));
        const finalActiveId = currentActiveId || activeProjectId;
        if (finalActiveId) { localStorage.setItem('sesm-drawing-last-active-id', finalActiveId); }
        setSaveStatus('Tersimpan');
    }, [activeProjectId]);
    
    // Autosave setelah selesai menggambar
    const finishDrawingAndSave = () => {
        if (!isDrawing) return;
        contextRef.current.closePath();
        setIsDrawing(false);

        if (isAutoSaveEnabled) {
            setSaveStatus('Menyimpan...');
            const canvas = contextRef.current.canvas;
            const imageData = canvas.toDataURL('image/png');
            const updatedProjects = projects.map(p =>
                p.id === activeProjectId ? { ...p, imageData, lastModified: Date.now() } : p
            );
            setProjects(updatedProjects);
            setTimeout(() => saveAllProjects(updatedProjects), 500);
        }
    };
    
    // Fungsi tombol header
    const handleCreateProject = () => {
        const newProject = { id: uuidv4(), title: 'Kanvas Baru', imageData: null, lastModified: Date.now() };
        const updatedProjects = [newProject, ...projects];
        setProjects(updatedProjects);
        setActiveProjectId(newProject.id);
        redrawCanvas(null);
        saveAllProjects(updatedProjects, newProject.id);
    };

    const handleSelectProject = (projectId) => {
        const projectToLoad = projects.find(p => p.id === projectId);
        if (projectToLoad) {
            setActiveProjectId(projectId);
            redrawCanvas(projectToLoad.imageData);
            localStorage.setItem('sesm-drawing-last-active-id', projectId);
            setIsProjectModalOpen(false);
        }
    };
    
    const handleDeleteProject = () => {
        if (projects.length <= 1) {
            setNotificationMessage({ title: "Aksi Gagal", message: "Tidak bisa menghapus satu-satunya kanvas." });
            setIsNotificationOpen(true);
            return;
        }
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteProject = () => {
        const updatedProjects = projects.filter(p => p.id !== activeProjectId);
        const newActiveId = updatedProjects.length > 0 ? updatedProjects[0].id : null;
        setProjects(updatedProjects);
        setActiveProjectId(newActiveId);
        if (newActiveId) {
            const projectToLoad = updatedProjects.find(p => p.id === newActiveId);
            redrawCanvas(projectToLoad?.imageData);
        }
        saveAllProjects(updatedProjects, newActiveId);
        setIsDeleteConfirmOpen(false);
    };

    const updateActiveProjectTitle = (title) => {
        const updatedProjects = projects.map(p => p.id === activeProjectId ? { ...p, title, lastModified: Date.now() } : p);
        setProjects(updatedProjects);
        // Judul akan tersimpan saat autosave gambar berikutnya
    };

    const handleManualSave = () => {
        setSaveStatus('Menyimpan...');
        const canvas = contextRef.current.canvas;
        const imageData = canvas.toDataURL('image/png');
        const updatedProjects = projects.map(p =>
            p.id === activeProjectId ? { ...p, imageData, lastModified: Date.now() } : p
        );
        setProjects(updatedProjects);
        setTimeout(() => saveAllProjects(updatedProjects), 500);
    };
    
    const handleToggleAutoSave = () => {
        if(isAutoSaveEnabled) {
             setIsAutoSaveConfirmOpen(true)
        } else {
            setIsAutoSaveEnabled(true);
            setSaveStatus('Aktif');
        }
    }
    const confirmDisableAutoSave = () => {
        setIsAutoSaveEnabled(false);
        setSaveStatus('Nonaktif');
        setIsAutoSaveConfirmOpen(false);
    }
    
    // Fungsi menggambar
    useEffect(() => { if (contextRef.current) { contextRef.current.strokeStyle = tool === 'eraser' ? 'white' : color; contextRef.current.lineWidth = brushSize; } }, [color, brushSize, tool]);
    const getCoords = (event) => { const rect = contextRef.current.canvas.getBoundingClientRect(); const touch = event.touches ? event.touches[0] : event; return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }; };
    const startDrawing = (e) => { const { x, y } = getCoords(e); contextRef.current.beginPath(); contextRef.current.moveTo(x, y); setIsDrawing(true); };
    const draw = (e) => { if (!isDrawing) return; const { x, y } = getCoords(e); contextRef.current.lineTo(x, y); contextRef.current.stroke(); };

    return (
    <div className="w-full h-screen bg-blue-50 flex flex-col font-sans overflow-hidden">
        {/* Header dengan tema biru */}
        <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="bg-gradient-to-r from-sesm-teal to-sesm-deep p-3 flex justify-between items-center shadow-lg z-20">
            <button onClick={() => onNavigate('creativeZone')} className="p-2 rounded-full text-white hover:bg-white/20"><FiArrowLeft size={22} /></button>
            <div className='flex items-center gap-2'>
                <div className='flex items-center space-x-2 text-white/90 text-sm bg-black/10 px-3 py-1.5 rounded-full'>
                    {saveStatus === 'Menyimpan...' && <FiSave size={16} className='animate-spin' />}
                    {saveStatus === 'Tersimpan' && <FiCheckCircle size={16} />}
                    {saveStatus === 'Nonaktif' && <FiCloudOff size={16} />}
                    <span>{saveStatus}</span>
                </div>
                <button onClick={handleManualSave} className="p-2 rounded-full text-white hover:bg-white/20" title="Simpan Manual"><FiSave size={20} /></button>
                <div className="w-px h-6 bg-white/20"></div>
                <button onClick={handleCreateProject} className="p-2 rounded-full text-white hover:bg-white/20" title="Kanvas Baru"><FiFilePlus size={20} /></button>
                <button onClick={() => setIsProjectModalOpen(true)} className="p-2 rounded-full text-white hover:bg-white/20" title="Buka Kanvas"><FiFolder size={20} /></button>
                <button onClick={handleDeleteProject} className="p-2 rounded-full text-white hover:bg-white/20" title="Hapus Kanvas"><FiTrash2 size={20} /></button>
            </div>
            <button onClick={handleToggleAutoSave} className={`p-2 rounded-full text-white transition-colors ${isAutoSaveEnabled ? 'bg-green-500/50 hover:bg-green-500/80' : 'bg-red-500/50 hover:bg-red-500/80'}`} title={isAutoSaveEnabled ? 'Simpan Otomatis Aktif' : 'Simpan Otomatis Nonaktif'}>
                {isAutoSaveEnabled ? <FiCloud size={20} /> : <FiCloudOff size={20} />}
            </button>
        </motion.header>

        {/* Area Menggambar */}
        <main className="flex-1 flex flex-col p-4 md:p-8 relative overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full flex-1 flex flex-col bg-white rounded-2xl shadow-inner overflow-hidden">
                {activeProject &&
                    <div className="p-4 border-b bg-gray-50">
                        <input type="text" value={activeProject.title} onChange={(e) => updateActiveProjectTitle(e.target.value)} className="w-full text-xl font-bold text-center text-sesm-deep bg-transparent focus:outline-none" placeholder="Judul Karyamu" />
                    </div>
                }
                <div className='w-full h-full'>
                    <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" onMouseDown={startDrawing} onMouseUp={finishDrawingAndSave} onMouseMove={draw} onMouseLeave={finishDrawingAndSave} onTouchStart={startDrawing} onTouchEnd={finishDrawingAndSave} onTouchMove={draw} />
                </div>
            </motion.div>
        </main>
        
        {/* Footer */}
        <motion.footer initial={{ y: 200 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }} className="bg-white/80 backdrop-blur-md p-4 rounded-t-2xl shadow-2xl z-20">
             <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex space-x-2"><button onClick={() => setTool('brush')} className={`p-3 rounded-xl ${tool === 'brush' ? 'bg-sesm-deep text-white' : 'bg-gray-200'}`}><FaPaintBrush size={20}/></button><button onClick={() => setTool('eraser')} className={`p-3 rounded-xl ${tool === 'eraser' ? 'bg-sesm-deep text-white' : 'bg-gray-200'}`}><FaEraser size={20}/></button></div>
                <div className="flex items-center space-x-3 bg-gray-200 p-1 rounded-xl"><button onClick={() => setBrushSize(s => Math.max(1, s - 2))} className="p-2"><FiMinus /></button><div className="w-5 h-5 rounded-full bg-gray-700" style={{ transform: `scale(${brushSize/10})` }}></div><button onClick={() => setBrushSize(s => Math.min(50, s + 2))} className="p-2"><FiPlus /></button></div>
            </div>
            <div className="flex justify-center items-center space-x-2 overflow-x-auto pb-2">
                <AnimatePresence>{colors.map((c) => ( <ColorSwatch key={c} color={c} isActive={color === c && tool !== 'eraser'} onClick={() => { setColor(c); setTool('brush'); }} /> ))}</AnimatePresence>
            </div>
        </motion.footer>

        {/* --- Kumpulan Modal --- */}
        <AnimatePresence>
            {isProjectModalOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsProjectModalOpen(false)}>
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold p-5 border-b text-gray-800">Buka Kanvas</h2>
                <div className="overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {projects.sort((a, b) => b.lastModified - a.lastModified).map(project => (
                    <div key={project.id} onClick={() => handleSelectProject(project.id)} className={`rounded-lg cursor-pointer transition-all border-2 ${activeProjectId === project.id ? 'border-sesm-teal' : 'border-transparent'}`}>
                        <div className={`p-3 rounded-lg ${activeProjectId === project.id ? 'bg-sesm-teal/10' : 'bg-gray-100 hover:bg-gray-200'}`}>
                            <div className="w-full h-32 bg-white rounded-md mb-2 overflow-hidden border">
                                {project.imageData ? <img alt={project.title} src={project.imageData} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Kosong</div>}
                            </div>
                            <p className="font-bold truncate text-gray-800">{project.title}</p>
                            <p className="text-xs opacity-60 text-gray-600 mt-1">{new Date(project.lastModified).toLocaleString()}</p>
                        </div>
                    </div>
                    ))}
                </div>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>

        <ConfirmationModal isOpen={isAutoSaveConfirmOpen} onClose={() => setIsAutoSaveConfirmOpen(false)} onConfirm={confirmDisableAutoSave} title="Nonaktifkan Simpan Otomatis?" message="Gambar tidak akan tersimpan otomatis setiap selesai menggambar." />
        <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={confirmDeleteProject} title="Hapus Kanvas Ini?" message={`Karya "${activeProject?.title || ''}" akan dihapus permanen.`} />
        <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} title={notificationMessage.title} message={notificationMessage.message} />
    </div>
    );
};

export default DrawingPage;