// contoh-sesm-web/pages/WritingPage.jsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft, FiTrash2, FiFolder, FiFilePlus, FiSave,
    FiCloud, FiCloudOff, FiCheckCircle, FiAlertTriangle, FiInfo, FiLoader,
    FiRotateCcw, FiRotateCw, FiMaximize, FiMinimize,
    FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight, FiRefreshCcw
} from 'react-icons/fi';
import { FaStrikethrough } from 'react-icons/fa';
import WritingService from '../services/writingService';
import Notification from '../components/ui/Notification';
import CustomSelect from '../components/ui/CustomSelect';

// --- Komponen Modal (Tidak perlu diubah) ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => { if (!isOpen) return null; return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}><motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}><div className="p-6 text-center"><div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4"><FiAlertTriangle className="h-6 w-6 text-yellow-600" /></div><h3 className="text-lg font-bold text-gray-900">{title}</h3><p className="text-sm text-gray-500 mt-2">{message}</p></div><div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl"><button onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Lanjutkan</button><button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Batal</button></div></motion.div></motion.div> );};

// Komponen Animasi Status Simpan Baru
const SaveStatusIcon = ({ status }) => {
    const cloudPath = "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z";
    const cloudVariants = { initial: { pathLength: 0 }, animate: { pathLength: 1, transition: { duration: 1.2, ease: "easeInOut" } } };
    const checkVariants = { initial: { pathLength: 0 }, animate: { pathLength: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.7 } } };
    const arrowVariants = { initial: { y: 3, opacity: 0 }, animate: { y: -3, opacity: [0, 1, 1, 0], transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } } };
    
    return (
        <div className="relative w-6 h-6">
            <AnimatePresence>
                {status === 'Menyimpan...' && ( <motion.svg key="saving" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><motion.path d={cloudPath} variants={cloudVariants} initial="initial" animate="animate" /><motion.path d="M12 17V11" variants={arrowVariants} /><motion.path d="M9 14l3-3 3 3" variants={arrowVariants} /></motion.svg> )}
                {status === 'Tersimpan' && ( <motion.svg key="saved" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><motion.path d={cloudPath} initial={{ pathLength: 0 }} animate={{ pathLength: 1, transition: { duration: 0.6 } }} /><motion.polyline points="9 12 12 15 15 9" variants={checkVariants} initial="initial" animate="animate" /></motion.svg> )}
                {status === 'Gagal' && <FiAlertTriangle size={18} className="text-red-400" />}
                {status === 'Nonaktif' && <FiCloudOff size={18} />}
            </AnimatePresence>
        </div>
    );
};
const useDebounce = (value, delay) => { const [debouncedValue, setDebouncedValue] = useState(value); useEffect(() => { const handler = setTimeout(() => { setDebouncedValue(value); }, delay); return () => { clearTimeout(handler); }; }, [value, delay]); return debouncedValue; };

const WritingPage = ({ onNavigate }) => {
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
    const [saveStatus, setSaveStatus] = useState('Tersimpan');
    const [isLoading, setIsLoading] = useState(true);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isAutoSaveConfirmOpen, setIsAutoSaveConfirmOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [notif, setNotif] = useState({ isOpen: false, message: '', success: true, title: '' });

    const [history, setHistory] = useState({});
    const [historyIndex, setHistoryIndex] = useState({});
    const isNavigatingHistory = useRef(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [fontSize, setFontSize] = useState(18);
    const [fontColor, setFontColor] = useState('#333333');
    const [fontFamily, setFontFamily] = useState("'Inter', sans-serif");
    
    const editorRef = useRef(null);
    const [editorContent, setEditorContent] = useState('');
    
    const fontOptions = [
        { value: "'Inter', sans-serif", label: "Inter" },
        { value: "'Roboto', sans-serif", label: "Roboto" },
        { value: "'Open Sans', sans-serif", label: "Open Sans" },
        { value: "'Lato', sans-serif", label: "Lato" },
        { value: "'Montserrat', sans-serif", label: "Montserrat" },
        { value: "'Poppins', sans-serif", label: "Poppins" },
        { value: "'Nunito', sans-serif", label: "Nunito" },
        { value: "'Raleway', sans-serif", label: "Raleway" },
        { value: "'Roboto Slab', serif", label: "Roboto Slab" },
        { value: "'Playfair Display', serif", label: "Playfair Display" },
        { value: "'Lora', serif", label: "Lora" },
        { value: "'Merriweather', serif", label: "Merriweather" },
        { value: "'Source Code Pro', monospace", label: "Source Code Pro" },
        { value: "'Caveat', cursive", label: "Caveat" },
        { value: "'Pacifico', cursive", label: "Pacifico" },
        { value: "'Special Elite', cursive", label: "Special Elite" },
        { value: "'Comic Neue', cursive", label: "Comic Neue" },
        { value: "Arial, sans-serif", label: "Arial" }, 
        { value: 'Verdana, sans-serif', label: "Verdana" }, 
        { value: 'Georgia, serif', label: "Georgia" }, 
        { value: "'Times New Roman', serif", label: "Times New Roman" },
        { value: "'Courier New', monospace", label: "Courier New" }, 
        { value: "'Brush Script MT', cursive", label: "Brush Script" }, 
        { value: "'Comic Sans MS', sans-serif", label: "Comic Sans" },
        { value: "Impact, fantasy", label: "Impact" }, 
        { value: "Luminari, fantasy", label: "Luminari" }, 
        { value: "Trattatello, fantasy", label: "Trattatello" },
    ];


    const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId) || null, [projects, activeProjectId]);
    const debouncedContent = useDebounce(editorContent, 1000);

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await WritingService.getProjects();
            let projectList = response.data;
            if (!projectList || projectList.length === 0) {
                const newProject = { title: 'Proyek Pertama', content: '<h1>Mulai Tulis di Sini!</h1><p>Gunakan toolbar di atas untuk berkreasi.</p>' };
                const createdProject = await WritingService.createProject(newProject);
                projectList = [createdProject.data];
            }
            const sortedProjects = projectList.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
            setProjects(sortedProjects);
            const activeId = sortedProjects[0].id;
            setActiveProjectId(activeId);
            setEditorContent(sortedProjects[0].content || '');
        } catch (error) {
            console.error("Gagal memuat proyek:", error);
            setNotif({ isOpen: true, title: "Error", message: "Gagal memuat proyek dari server.", success: false });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);
    
    useEffect(() => {
        if (debouncedContent === undefined || isNavigatingHistory.current) { isNavigatingHistory.current = false; return; }
        setHistory(prev => { const currentHistory = prev[activeProjectId]?.slice(0, (historyIndex[activeProjectId] ?? -1) + 1) || []; return { ...prev, [activeProjectId]: [...currentHistory, debouncedContent] }; });
        setHistoryIndex(prev => ({ ...prev, [activeProjectId]: (prev[activeProjectId]?.length ?? 0) }));
    }, [debouncedContent, activeProjectId]);

    useEffect(() => { if(activeProject && (!history[activeProjectId] || history[activeProjectId].length === 0)) { setHistory(prev => ({ ...prev, [activeProjectId]: [activeProject.content] })); setHistoryIndex(prev => ({ ...prev, [activeProjectId]: 0 })); } }, [activeProject, activeProjectId, history]);
    
    useEffect(() => {
        if (editorRef.current && editorContent !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = editorContent;
        }
    }, [editorContent]);

    const saveProject = useCallback(async (projectToSave) => {
        if (!isAutoSaveEnabled || !projectToSave) { setSaveStatus('Nonaktif'); return; }
        setSaveStatus('Menyimpan...');
        try {
            await WritingService.updateProject(projectToSave.id, { title: projectToSave.title, content: editorContent });
            setProjects(projs => projs.map(p => p.id === projectToSave.id ? {...p, content: editorContent, lastModified: new Date().toISOString()} : p));
            setTimeout(() => setSaveStatus('Tersimpan'), 1200);
        } catch (error) { console.error("Autosave gagal:", error); setSaveStatus('Gagal'); }
    }, [isAutoSaveEnabled, editorContent]);

    useEffect(() => { if (!activeProject || isLoading || !isAutoSaveEnabled) return; const handler = setTimeout(() => saveProject(activeProject), 2500); return () => clearTimeout(handler); }, [activeProject?.title, debouncedContent, isLoading, isAutoSaveEnabled, saveProject]);

    const handleCreateProject = async () => { try { const createdProject = await WritingService.createProject({ title: 'Proyek Baru', content: '' }); setProjects(prev => [createdProject.data, ...prev]); setActiveProjectId(createdProject.data.id); setEditorContent(''); setNotif({isOpen: true, title: "Berhasil", message: "Proyek baru telah dibuat.", success: true}); } catch (error) { setNotif({isOpen: true, title: "Gagal", message: "Gagal membuat proyek baru.", success: false}); } };
    const handleSelectProject = (projectId) => { const project = projects.find(p => p.id === projectId); if(project) { setActiveProjectId(projectId); setEditorContent(project.content || ''); } setIsProjectModalOpen(false); };
    const confirmDeleteProject = async () => { try { await WritingService.deleteProject(activeProjectId); const updatedProjects = projects.filter(p => p.id !== activeProjectId); setProjects(updatedProjects); const newActiveProject = updatedProjects[0] || null; setActiveProjectId(newActiveProject?.id); setEditorContent(newActiveProject?.content || ''); setNotif({isOpen: true, title: "Berhasil", message: "Proyek telah dihapus.", success: true}); } catch (error) { setNotif({isOpen: true, title: "Gagal", message: "Gagal menghapus proyek.", success: false}); } finally { setIsDeleteConfirmOpen(false); } };
    const updateActiveProjectTitle = (title) => { setProjects(projs => projs.map(p => p.id === activeProjectId ? { ...p, title } : p)); };
    const handleUndo = () => { const idx = historyIndex[activeProjectId] ?? 0; if (idx > 0) { isNavigatingHistory.current = true; const newIndex = idx - 1; setHistoryIndex(prev => ({...prev, [activeProjectId]: newIndex})); setEditorContent(history[activeProjectId][newIndex]); } };
    const handleRedo = () => { const idx = historyIndex[activeProjectId] ?? 0; const currentHistory = history[activeProjectId] || []; if (idx < currentHistory.length - 1) { isNavigatingHistory.current = true; const newIndex = idx + 1; setHistoryIndex(prev => ({...prev, [activeProjectId]: newIndex})); setEditorContent(history[activeProjectId][newIndex]); } };
    const handleManualSave = () => { if(activeProject) saveProject(activeProject); };
    const handleToggleAutoSave = () => { if (isAutoSaveEnabled) setIsAutoSaveConfirmOpen(true); else { setIsAutoSaveEnabled(true); setSaveStatus('Tersimpan'); setNotif({isOpen: true, title: "Info", message: "Simpan otomatis diaktifkan.", success: true}); } };
    const confirmDisableAutoSave = () => { setIsAutoSaveEnabled(false); setSaveStatus('Nonaktif'); setIsAutoSaveConfirmOpen(false); };
    const wordCount = useMemo(() => editorContent.replace(/<[^>]*>?/gm, '').trim() === '' ? 0 : editorContent.replace(/<[^>]*>?/gm, '').trim().split(/\s+/).length, [editorContent]);
    const applyStyle = (command, value = null) => { document.execCommand(command, false, value); editorRef.current.focus(); };
    const resetStyles = () => { applyStyle('removeFormat'); };

    if (isLoading) return <div className="w-full h-screen bg-amber-50 flex justify-center items-center"><FiLoader className="animate-spin text-3xl"/> Memuat Proyek...</div>;

    return (
        <div className={`w-full h-screen bg-amber-50 flex flex-col font-sans overflow-hidden ${isFullScreen ? 'fixed inset-0 z-[100]' : ''}`}>
            <Notification isOpen={notif.isOpen} onClose={() => setNotif({ ...notif, isOpen: false })} title={notif.title} message={notif.message} success={notif.success} />
            <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 flex justify-between items-center shadow-lg z-20 flex-shrink-0">
                <button onClick={() => isFullScreen ? setIsFullScreen(false) : onNavigate('creativeZone')} className="p-2 rounded-full text-white hover:bg-white/20"><FiArrowLeft size={22} /></button>
                <div className='flex items-center gap-2'>
                    <div className='flex items-center space-x-2 text-white/90 text-sm bg-black/10 px-3 py-1.5 rounded-full w-32 justify-center'> <SaveStatusIcon status={saveStatus}/> <span>{saveStatus}</span> </div>
                    <button onClick={handleUndo} disabled={(historyIndex[activeProjectId] ?? 0) <= 0} className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-50" title="Undo"><FiRotateCcw size={20} /></button>
                    <button onClick={handleRedo} disabled={(historyIndex[activeProjectId] ?? 0) >= (history[activeProjectId]?.length ?? 0) - 1} className="p-2 rounded-full text-white hover:bg-white/20 disabled:opacity-50" title="Redo"><FiRotateCw size={20} /></button>
                    <div className="w-px h-6 bg-white/20"></div>
                    <button onClick={handleCreateProject} className="p-2 rounded-full text-white hover:bg-white/20" title="Buat Proyek Baru"><FiFilePlus size={20} /></button>
                    <button onClick={() => setIsProjectModalOpen(true)} className="p-2 rounded-full text-white hover:bg-white/20" title="Buka Proyek"><FiFolder size={20} /></button>
                    <button onClick={() => setIsDeleteConfirmOpen(true)} className="p-2 rounded-full text-white hover:bg-white/20" title="Hapus Proyek"><FiTrash2 size={20} /></button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsFullScreen(fs => !fs)} className="p-2 rounded-full text-white hover:bg-white/20" title={isFullScreen ? "Keluar Layar Penuh" : "Layar Penuh"}> {isFullScreen ? <FiMinimize size={20}/> : <FiMaximize size={20}/>} </button>
                    <button onClick={handleToggleAutoSave} className={`p-2 rounded-full text-white transition-colors ${isAutoSaveEnabled ? 'bg-green-500/50 hover:bg-green-500/80' : 'bg-red-500/50 hover:bg-red-500/80'}`} title={isAutoSaveEnabled ? 'Simpan Otomatis Aktif' : 'Simpan Otomatis Nonaktif'}> {isAutoSaveEnabled ? <FiCloud size={20} /> : <FiCloudOff size={20} />} </button>
                </div>
            </motion.header>

            <main className="flex-1 flex flex-col p-4 md:p-8 relative overflow-y-auto">
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full flex-1 flex flex-col bg-white rounded-2xl shadow-inner overflow-hidden">
                    {activeProject && (
                        <div className="p-4 border-b bg-gray-50 flex justify-center">
                            <input type="text" value={activeProject.title} onChange={(e) => updateActiveProjectTitle(e.target.value)} className="w-full max-w-xl text-xl font-bold text-center text-sesm-deep bg-transparent focus:outline-none" placeholder="Judul Proyek" />
                        </div>
                    )}
                    <div className="p-2 border-b bg-gray-50 flex flex-wrap items-center justify-center gap-2">
                        <button onClick={() => applyStyle('bold')} className="p-2 rounded hover:bg-gray-200"><FiBold/></button>
                        <button onClick={() => applyStyle('italic')} className="p-2 rounded hover:bg-gray-200"><FiItalic/></button>
                        <button onClick={() => applyStyle('underline')} className="p-2 rounded hover:bg-gray-200"><FiUnderline/></button>
                        <button onClick={() => applyStyle('strikeThrough')} className="p-2 rounded hover:bg-gray-200"><FaStrikethrough/></button>
                        <div className="w-px h-6 bg-gray-300 mx-2"></div>
                        <button onClick={() => applyStyle('justifyLeft')} className="p-2 rounded hover:bg-gray-200"><FiAlignLeft/></button>
                        <button onClick={() => applyStyle('justifyCenter')} className="p-2 rounded hover:bg-gray-200"><FiAlignCenter/></button>
                        <button onClick={() => applyStyle('justifyRight')} className="p-2 rounded hover:bg-gray-200"><FiAlignRight/></button>
                        <div className="w-px h-6 bg-gray-300 mx-2"></div>
                        <div className="w-40"><CustomSelect options={fontOptions} value={fontFamily} onChange={(val) => {setFontFamily(val); applyStyle('fontName', val);}} /></div>
                        <input type="number" min="8" max="72" value={fontSize} onChange={e => { const size = e.target.value; setFontSize(size); }} className="w-16 p-1 border rounded text-sm text-center focus:outline-none"/>
                        <input type="color" value={fontColor} onChange={e => { const color = e.target.value; setFontColor(color); applyStyle('foreColor', color); }} className="w-8 h-8 rounded border"/>
                        <div className="w-px h-6 bg-gray-300 mx-2"></div>
                        <button onClick={resetStyles} className="p-2 rounded hover:bg-gray-200" title="Reset Gaya"><FiRefreshCcw/></button>
                    </div>
                    
                    <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={e => setEditorContent(e.currentTarget.innerHTML)}
                        style={{ fontFamily: fontFamily, fontSize: `${fontSize}px`, color: fontColor }}
                        className="w-full h-full p-6 text-lg leading-relaxed resize-none focus:outline-none"
                    />
                    <div className="p-3 bg-gray-50 text-right text-sm text-gray-500 font-semibold border-t">{wordCount} Kata</div>
                </motion.div>
            </main>
          
            <AnimatePresence>
                {isProjectModalOpen && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setIsProjectModalOpen(false)}>
                    <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>
                      <h2 className="text-xl font-bold p-5 border-b text-gray-800">Buka Proyek</h2>
                      <div className="overflow-y-auto p-3">
                        {projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)).map(project => (
                          <div key={project.id} onClick={() => handleSelectProject(project.id)} className={`p-4 mb-2 rounded-lg cursor-pointer transition-colors ${activeProjectId === project.id ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-amber-100'}`}>
                            <p className="font-bold truncate">{project.title}</p>
                            <div className="text-sm opacity-80 truncate" dangerouslySetInnerHTML={{ __html: project.content || "Tidak ada konten..." }} />
                            <p className="text-xs opacity-60 mt-1">{new Date(project.lastModified).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
            </AnimatePresence>
          
            <ConfirmationModal isOpen={isAutoSaveConfirmOpen} onClose={() => setIsAutoSaveConfirmOpen(false)} onConfirm={confirmDisableAutoSave} title="Nonaktifkan Simpan Otomatis?" message="Jika Anda melanjutkan, perubahan tidak akan tersimpan secara otomatis. Anda harus menyimpannya secara manual." />
            <ConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} onConfirm={confirmDeleteProject} title="Hapus Proyek Ini?" message={`Proyek "${activeProject?.title || ''}" akan dihapus secara permanen. Tindakan ini tidak dapat diurungkan.`} />
        </div>
    );
};

export default WritingPage;