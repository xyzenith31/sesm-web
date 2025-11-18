import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiTrash2, FiFolder, FiFilePlus, FiSave,
    FiCloud, FiCloudOff, FiCheckCircle, FiAlertTriangle, FiInfo, FiLoader,
    FiMinus, FiPlus, FiRotateCcw, FiRotateCw, FiDownload, FiLayers, FiStar, FiHeart, FiX
} from 'react-icons/fi';
import { FaPaintBrush, FaEraser, FaSmile, FaPalette } from 'react-icons/fa';
import DrawingService from '../services/drawingService';
import Notification from '../components/ui/Notification';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => { if (!isOpen) return null; return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}><motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}><div className="p-6 text-center"><div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4"><FiAlertTriangle className="h-6 w-6 text-yellow-600" /></div><h3 className="text-lg font-bold text-gray-900">{title}</h3><p className="text-sm text-gray-500 mt-2">{message}</p></div><div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl"><button onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Lanjutkan</button><button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Batal</button></div></motion.div></motion.div> );};

const SaveStatusIcon = ({ status }) => {
    const cloudPath = "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z";
    const cloudVariants = {
        initial: { pathLength: 0 },
        animate: { pathLength: 1, transition: { duration: 1.2, ease: "easeInOut" } }
    };
    const checkVariants = {
        initial: { pathLength: 0 },
        animate: { pathLength: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.7 } }
    };
    const arrowVariants = {
        initial: { y: 3, opacity: 0 },
        animate: { y: -3, opacity: [0, 1, 1, 0], transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }
    };

    return (
        <div className="relative w-6 h-6">
            <AnimatePresence>
                {status === 'Menyimpan...' && (
                    <motion.svg key="saving" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path d={cloudPath} variants={cloudVariants} initial="initial" animate="animate" />
                        <motion.path d="M12 17V11" variants={arrowVariants} />
                        <motion.path d="M9 14l3-3 3 3" variants={arrowVariants} />
                    </motion.svg>
                )}
                {status === 'Tersimpan' && (
                    <motion.svg key="saved" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <motion.path d={cloudPath} initial={{ pathLength: 0 }} animate={{ pathLength: 1, transition: { duration: 0.6 } }} />
                        <motion.polyline points="9 12 12 15 15 9" variants={checkVariants} initial="initial" animate="animate" />
                    </motion.svg>
                )}
                {status === 'Gagal' && <FiAlertTriangle size={18} className="text-red-400" />}
                {status === 'Nonaktif' && <FiCloudOff size={18} />}
            </AnimatePresence>
        </div>
    );
};

const colors = ['#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'];
const ColorSwatch = ({ color, isActive, onClick }) => ( <motion.div onClick={onClick} className="w-10 h-10 rounded-full cursor-pointer border-2" style={{ backgroundColor: color, borderColor: isActive ? '#3B82F6' : 'rgba(0,0,0,0.2)' }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>{isActive && <motion.div layoutId="color-indicator" className="w-full h-full rounded-full border-2 border-white" />}</motion.div>);

const stamps = [ { id: 'star', icon: FiStar }, { id: 'heart', icon: FiHeart }, { id: 'smile', icon: FaSmile } ];

const DrawingPage = ({ onNavigate }) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [tool, setTool] = useState('brush');
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
    const [saveStatus, setSaveStatus] = useState('Tersimpan');
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isAutoSaveConfirmOpen, setIsAutoSaveConfirmOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });

    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [activeStamp, setActiveStamp] = useState('star');

    const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId) || null, [projects, activeProjectId]);

    const saveCanvasState = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(dataUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const redrawCanvas = useCallback((imageData, saveToHistory = false) => {
        if (!contextRef.current) return;
        const context = contextRef.current;
        const canvas = context.canvas;
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
        if (imageData) {
            const image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
                if (saveToHistory) { setHistory([imageData]); setHistoryIndex(0); }
            };
            image.src = imageData;
        } else {
            if (saveToHistory) { const blankData = canvas.toDataURL('image/png'); setHistory([blankData]); setHistoryIndex(0); }
        }
    }, []);

    useEffect(() => {
        const initCanvas = () => {
            const canvas = canvasRef.current; if (!canvas) return;
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width * window.devicePixelRatio; canvas.height = height * window.devicePixelRatio;
            const context = canvas.getContext('2d');
            context.scale(window.devicePixelRatio, window.devicePixelRatio);
            context.lineCap = 'round'; contextRef.current = context;
        };
        const fetchAndInitProjects = async () => {
            setIsLoading(true);
            try {
                const response = await DrawingService.getProjects();
                let projectList = response.data;
                if (!projectList || projectList.length === 0) {
                    const newProject = { title: 'Kanvas Pertamaku', imageData: null };
                    const createdProject = await DrawingService.createProject(newProject);
                    projectList = [createdProject.data];
                }
                const sortedProjects = projectList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
                const activeId = sortedProjects[0].id;
                setProjects(sortedProjects); setActiveProjectId(activeId); initCanvas(); redrawCanvas(sortedProjects[0].imageData, true);
            } catch (error) {
                console.error("Gagal memuat proyek gambar:", error);
                setNotif({ isOpen: true, title: "Error", message: "Gagal memuat kanvas dari server.", success: false });
            } finally { setIsLoading(false); }
        };
        fetchAndInitProjects();
    }, [redrawCanvas]);

    const saveProject = useCallback(async (projectToSave) => {
        if (!isAutoSaveEnabled || !projectToSave || !contextRef.current) { setSaveStatus('Nonaktif'); return; }
        setSaveStatus('Menyimpan...');
        const imageData = history[historyIndex];
        try {
            await DrawingService.updateProject(projectToSave.id, { title: projectToSave.title, imageData });
            setProjects(projs => projs.map(p => p.id === projectToSave.id ? {...p, imageData, lastModified: new Date().toISOString()} : p));
            setTimeout(() => setSaveStatus('Tersimpan'), 1200);
        } catch (error) {
            console.error("Autosave gambar gagal:", error);
            setSaveStatus('Gagal');
        }
    }, [isAutoSaveEnabled, history, historyIndex]);

    useEffect(() => {
        if (!activeProject || isLoading || !isAutoSaveEnabled) return;
        const handler = setTimeout(() => saveProject(activeProject), 2500);
        return () => clearTimeout(handler);
    }, [activeProject?.title, historyIndex, isLoading, isAutoSaveEnabled, saveProject]);

    const finishDrawingAndSave = () => { if (!isDrawing) return; contextRef.current.closePath(); setIsDrawing(false); saveCanvasState(); if (isAutoSaveEnabled) saveProject(activeProject); };
    const handleCreateProject = async () => { const newProject = { title: 'Kanvas Baru', imageData: null }; try { const createdProject = await DrawingService.createProject(newProject); setProjects(prev => [createdProject.data, ...prev]); setActiveProjectId(createdProject.data.id); setHistory([]); setHistoryIndex(-1); redrawCanvas(null, true); setNotif({isOpen: true, title: "Berhasil", message: "Kanvas baru telah dibuat.", success: true}); } catch (error) { setNotif({isOpen: true, title: "Gagal", message: "Gagal membuat kanvas baru.", success: false}); } };
    const handleSelectProject = (projectId) => { const projectToLoad = projects.find(p => p.id === projectId); if (projectToLoad) { setActiveProjectId(projectId); setHistory([]); setHistoryIndex(-1); redrawCanvas(projectToLoad.imageData, true); setIsProjectModalOpen(false); } };
    const confirmDeleteProject = async () => { try { await DrawingService.deleteProject(activeProjectId); const updatedProjects = projects.filter(p => p.id !== activeProjectId); const newActiveId = updatedProjects.length > 0 ? updatedProjects[0].id : null; setProjects(updatedProjects); setActiveProjectId(newActiveId); if (newActiveId) { const projectToLoad = updatedProjects.find(p => p.id === newActiveId); setHistory([]); setHistoryIndex(-1); redrawCanvas(projectToLoad?.imageData, true); } else { redrawCanvas(null, true); } setNotif({isOpen: true, title: "Berhasil", message: "Kanvas telah dihapus.", success: true}); } catch (error) { setNotif({isOpen: true, title: "Gagal", message: "Gagal menghapus kanvas.", success: false}); } finally { setIsDeleteConfirmOpen(false); } };
    const handleUndo = () => { if (historyIndex > 0) { const newIndex = historyIndex - 1; setHistoryIndex(newIndex); redrawCanvas(history[newIndex]); } };
    const handleRedo = () => { if (historyIndex < history.length - 1) { const newIndex = historyIndex + 1; setHistoryIndex(newIndex); redrawCanvas(history[newIndex]); } };
    const handleClearCanvas = () => { if (window.confirm("Yakin ingin membersihkan seluruh kanvas?")) { redrawCanvas(null, true); } };
    const handleDownloadCanvas = () => { if (!canvasRef.current) return; const link = document.createElement('a'); link.download = `${activeProject?.title || 'karyaku'}.png`; link.href = canvasRef.current.toDataURL('image/png'); link.click(); };
    useEffect(() => { if (contextRef.current) { contextRef.current.strokeStyle = tool === 'eraser' ? 'white' : color; contextRef.current.lineWidth = brushSize; contextRef.current.fillStyle = tool === 'eraser' ? 'white' : color; } }, [color, brushSize, tool]);

    const drawStamp = (x, y) => { const ctx = contextRef.current; const size = brushSize * 5; ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.translate(x, y); if (activeStamp === 'star') { ctx.beginPath(); for (let i = 0; i < 5; i++) { ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * size, -Math.sin((18 + i * 72) / 180 * Math.PI) * size); ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * (size/2), -Math.sin((54 + i * 72) / 180 * Math.PI) * (size/2)); } ctx.closePath(); } else if (activeStamp === 'heart') { const d = size; ctx.beginPath(); ctx.moveTo(0, d/4); ctx.quadraticCurveTo(0, 0, d/4, 0); ctx.quadraticCurveTo(d/2, 0, d/2, d/4); ctx.quadraticCurveTo(d/2, 0, d*3/4, 0); ctx.quadraticCurveTo(d, 0, d, d/4); ctx.quadraticCurveTo(d, d/2, d*3/4, d*3/4); ctx.lineTo(d/2, d); ctx.lineTo(d/4, d*3/4); ctx.quadraticCurveTo(0, d/2, 0, d/4); ctx.closePath(); } else if (activeStamp === 'smile') { ctx.beginPath(); ctx.arc(0, 0, size / 2, 0, Math.PI * 2, true); ctx.moveTo(size * 0.25, -size * 0.1); ctx.arc(0, 0, size * 0.25, 0, Math.PI, false); ctx.moveTo(-size * 0.1, -size * 0.1); ctx.arc(-size * 0.15, -size * 0.1, size * 0.05, 0, Math.PI * 2, true); ctx.moveTo(size * 0.2, -size * 0.1); ctx.arc(size * 0.15, -size * 0.1, size * 0.05, 0, Math.PI * 2, true); } ctx.fill(); ctx.restore(); };
    const getCoords = (event) => { const canvas = canvasRef.current; if (!canvas) return { x: 0, y: 0 }; const rect = canvas.getBoundingClientRect(); const touch = event.touches ? event.touches[0] : event; return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }; };
    const startDrawing = (e) => { e.preventDefault(); const { x, y } = getCoords(e); if(tool === 'stamp') { drawStamp(x, y); finishDrawingAndSave(); return; } contextRef.current.beginPath(); contextRef.current.moveTo(x, y); setIsDrawing(true); };
    const draw = (e) => { e.preventDefault(); if (!isDrawing || tool === 'stamp') return; const { x, y } = getCoords(e); contextRef.current.lineTo(x, y); contextRef.current.stroke(); };
    const handleDeleteProject = () => { if (projects.length <= 1) { setNotif({ isOpen: true, title: "Aksi Gagal", message: "Tidak bisa menghapus satu-satunya kanvas.", success: false }); return; } setIsDeleteConfirmOpen(true); };
    const updateActiveProjectTitle = (title) => { setProjects(currentProjects => currentProjects.map(p => p.id === activeProjectId ? { ...p, title } : p)); };
    const handleManualSave = () => saveProject(activeProject);
    const handleToggleAutoSave = () => { if(isAutoSaveEnabled) setIsAutoSaveConfirmOpen(true); else { setIsAutoSaveEnabled(true); setSaveStatus('Tersimpan'); setNotif({isOpen: true, title: "Info", message: "Simpan otomatis diaktifkan.", success: true}); } };
    const confirmDisableAutoSave = () => { setIsAutoSaveEnabled(false); setSaveStatus('Nonaktif'); setIsAutoSaveConfirmOpen(false); };

    return (
        <div className="w-full h-screen bg-blue-50 flex flex-col font-sans overflow-hidden">
             <Notification isOpen={notif.isOpen} onClose={() => setNotif({ ...notif, isOpen: false })} title={notif.title} message={notif.message} success={notif.success} />
            {/* ========== HEADER ========== */}
            <motion.header
                initial={{ y: -100 }} animate={{ y: 0 }}
                // --- PERBAIKAN: Padding responsif dan flex-wrap ---
                className="bg-gradient-to-r from-sesm-teal to-sesm-deep p-2 sm:p-3 flex flex-wrap justify-between items-center gap-y-2 shadow-lg z-20"
            >
                {/* Bagian Kiri: Tombol Kembali */}
                <button onClick={() => onNavigate('creativeZone')} className="p-2 rounded-full text-white hover:bg-white/20">
                    <FiArrowLeft size={22} />
                </button>

                {/* Bagian Tengah: Tombol Aksi (dengan flex-wrap) */}
                {/* --- PERBAIKAN: flex-wrap dan justify-center --- */}
                <div className='flex flex-wrap justify-center items-center gap-1 sm:gap-2'>
                    {/* Save Status */}
                    <div className='flex items-center space-x-2 text-white/90 text-sm bg-black/10 px-3 py-1.5 rounded-full min-w-[120px] justify-center order-first sm:order-none'>
                        <SaveStatusIcon status={saveStatus} />
                        <span>{saveStatus}</span>
                    </div>
                    {/* Undo/Redo */}
                    <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-50" title="Undo"><FiRotateCcw size={20} /></button>
                    <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-50" title="Redo"><FiRotateCw size={20} /></button>
                    {/* Divider */}
                    <div className="w-px h-6 bg-white/20 hidden sm:block"></div>
                    {/* Aksi Lainnya */}
                    <button onClick={handleDownloadCanvas} className="p-2 rounded-full text-white hover:bg-white/20" title="Unduh Gambar"><FiDownload size={20} /></button>
                    <button onClick={handleCreateProject} className="p-2 rounded-full text-white hover:bg-white/20" title="Kanvas Baru"><FiFilePlus size={20} /></button>
                    <button onClick={() => setIsProjectModalOpen(true)} className="p-2 rounded-full text-white hover:bg-white/20" title="Buka Kanvas"><FiFolder size={20} /></button>
                    <button onClick={handleDeleteProject} className="p-2 rounded-full text-white hover:bg-white/20" title="Hapus Kanvas"><FiTrash2 size={20} /></button>
                </div>

                {/* Bagian Kanan: Autosave */}
                <button onClick={handleToggleAutoSave} className={`p-2 rounded-full text-white transition-colors ${isAutoSaveEnabled ? 'bg-green-500/50 hover:bg-green-500/80' : 'bg-red-500/50 hover:bg-red-500/80'}`} title={isAutoSaveEnabled ? 'Simpan Otomatis Aktif' : 'Simpan Otomatis Nonaktif'}>
                    {isAutoSaveEnabled ? <FiCloud size={20} /> : <FiCloudOff size={20} />}
                </button>
            </motion.header>

            {/* ========== MAIN CONTENT (CANVAS AREA) ========== */}
            <main className="flex-1 flex flex-col p-4 md:p-8 relative overflow-y-auto">
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full flex-1 flex flex-col bg-white rounded-2xl shadow-inner overflow-hidden">
                    {isLoading ? (
                        <div className="w-full h-full flex justify-center items-center flex-col gap-4 text-sesm-deep">
                            <FiLoader className="animate-spin text-4xl"/><span className="font-semibold">Memuat Kanvas...</span>
                        </div>
                     ) : (
                        <>
                            {activeProject && (
                                <div className="p-4 border-b bg-gray-50 flex-shrink-0">
                                    <input
                                        type="text"
                                        value={activeProject.title}
                                        onChange={(e) => updateActiveProjectTitle(e.target.value)}
                                        className="w-full text-xl font-bold text-center text-sesm-deep bg-transparent focus:outline-none"
                                        placeholder="Judul Karyamu"
                                    />
                                </div>
                            )}
                            <div className='w-full h-full flex-grow relative'> {/* Ensure canvas container takes space */}
                                <canvas
                                    ref={canvasRef}
                                    // --- PERBAIKAN KURSOR DISINI ---
                                    className="absolute inset-0 w-full h-full touch-none cursor-[url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\'><path d=\'M12 0 V24 M0 12 H24\' stroke=\'black\' stroke-width=\'1.5\'/></svg>')_12_12,_crosshair]"
                                    onMouseDown={startDrawing}
                                    onMouseUp={finishDrawingAndSave}
                                    onMouseMove={draw}
                                    onMouseLeave={finishDrawingAndSave}
                                    onTouchStart={startDrawing}
                                    onTouchEnd={finishDrawingAndSave}
                                    onTouchMove={draw}
                                />
                            </div>
                        </>
                    )}
                </motion.div>
            </main>

            {/* ========== FOOTER (TOOLBAR) ========== */}
            <motion.footer initial={{ y: 200 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.2 }} className="bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-t-2xl shadow-2xl z-20 flex-shrink-0">
                 {/* Baris Atas: Tools & Size/Stamp */}
                 <div className="flex flex-col sm:flex-row items-center justify-between mb-3 sm:mb-4 px-2 gap-y-2">
                    {/* Tools */}
                    <div className="flex space-x-1 sm:space-x-2">
                        <button onClick={() => setTool('brush')} className={`p-2 sm:p-3 rounded-xl ${tool === 'brush' ? 'bg-sesm-deep text-white' : 'bg-gray-200'}`}><FaPaintBrush size={20}/></button>
                        <button onClick={() => setTool('eraser')} className={`p-2 sm:p-3 rounded-xl ${tool === 'eraser' ? 'bg-sesm-deep text-white' : 'bg-gray-200'}`}><FaEraser size={20}/></button>
                        <button onClick={() => setTool('stamp')} className={`p-2 sm:p-3 rounded-xl ${tool === 'stamp' ? 'bg-sesm-deep text-white' : 'bg-gray-200'}`}><FiStar size={20}/></button>
                        <button onClick={handleClearCanvas} className="p-2 sm:p-3 rounded-xl bg-gray-200" title="Bersihkan Kanvas"><FiLayers size={20}/></button>
                    </div>
                    {/* Size/Stamp Picker */}
                    {tool === 'stamp' ? (
                        <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-200 p-1 rounded-xl">
                            {stamps.map(stamp => ( <button key={stamp.id} onClick={() => setActiveStamp(stamp.id)} className={`p-2 rounded-lg ${activeStamp === stamp.id ? 'bg-sesm-deep text-white' : ''}`}> <stamp.icon size={20}/> </button> ))}
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 sm:space-x-3 bg-gray-200 p-1 rounded-xl">
                            <button onClick={() => setBrushSize(s => Math.max(1, s - 2))} className="p-2"><FiMinus /></button>
                            <div className="w-5 h-5 rounded-full bg-gray-700" style={{ transform: `scale(${brushSize/10})` }}></div>
                            <button onClick={() => setBrushSize(s => Math.min(50, s + 2))} className="p-2"><FiPlus /></button>
                        </div>
                    )}
                </div>
                {/* Baris Bawah: Palet Warna */}
                <div className="flex justify-center items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 sm:pb-2">
                    <label htmlFor="color-picker" className="flex-shrink-0 w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 flex items-center justify-center relative overflow-hidden" style={{ background: 'conic-gradient(from 180deg at 50% 50%, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)'}}>
                        <input id="color-picker" type="color" value={color} onChange={(e) => {setColor(e.target.value); setTool('brush');}} className="absolute w-20 h-20 opacity-0 cursor-pointer"/>
                    </label>
                    {colors.map((c) => ( <ColorSwatch key={c} color={c} isActive={color === c && tool !== 'eraser'} onClick={() => { setColor(c); setTool('brush'); }} /> ))}
                </div>
            </motion.footer>

            {/* Modals */}
            <AnimatePresence>
                {isProjectModalOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setIsProjectModalOpen(false)}>
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl font-bold p-5 border-b text-gray-800 flex-shrink-0">Buka Kanvas</h2>
                    <div className="overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-4 gap-4 flex-grow">
                        {projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)).map(project => (
                        <div key={project.id} onClick={() => handleSelectProject(project.id)} className={`rounded-lg cursor-pointer transition-all border-2 ${activeProjectId === project.id ? 'border-sesm-teal ring-2 ring-sesm-teal/30' : 'border-transparent hover:border-gray-300'}`}>
                            <div className={`p-3 rounded-lg h-full flex flex-col ${activeProjectId === project.id ? 'bg-sesm-teal/10' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                <div className="w-full h-32 bg-white rounded-md mb-2 overflow-hidden border flex-shrink-0">
                                    {project.imageData ? <img alt={project.title} src={project.imageData} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm italic">Kosong</div>}
                                </div>
                                <p className="font-bold truncate text-gray-800 text-sm flex-grow">{project.title}</p>
                                <p className="text-xs opacity-60 text-gray-600 mt-1 flex-shrink-0">{new Date(project.lastModified).toLocaleString()}</p>
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
        </div>
    );
};

export default DrawingPage;