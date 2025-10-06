import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiArrowLeft, FiTrash2, FiFolder, FiFilePlus, FiSave, 
    FiCloud, FiCloudOff, FiCheckCircle, FiAlertTriangle, FiInfo
} from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

// === Komponen Modal Konfirmasi ===
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Lanjutkan", confirmButtonClass = "bg-red-600 hover:bg-red-700" }) => {
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
                    <button onClick={onConfirm} className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm ${confirmButtonClass}`}>{confirmText}</button>
                    <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Batal</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// === Komponen Modal Notifikasi (BARU) ===
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
                    <button onClick={onClose} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-base font-medium text-white hover:bg-amber-700 focus:outline-none sm:w-auto sm:text-sm">Mengerti</button>
                </div>
            </motion.div>
        </motion.div>
    );
};


// === Komponen Utama ===
const WritingPage = ({ onNavigate }) => {
  // --- STATE MANAGEMENT ---
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [saveStatus, setSaveStatus] = useState('Tersimpan');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAutoSaveConfirmOpen, setIsAutoSaveConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false); // State untuk modal notifikasi
  const [notificationMessage, setNotificationMessage] = useState({ title: '', message: '' }); // State untuk pesan notifikasi

  const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId) || null, [projects, activeProjectId]);

  useEffect(() => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem('sesm-projects')) || [];
      const lastActiveId = localStorage.getItem('sesm-last-active-project-id');
      if (savedProjects.length > 0) {
        setProjects(savedProjects);
        setActiveProjectId(lastActiveId && savedProjects.some(p => p.id === lastActiveId) ? lastActiveId : savedProjects[0].id);
      } else {
        const newProject = { id: uuidv4(), title: 'Proyek Pertama', text: '', lastModified: Date.now() };
        setProjects([newProject]);
        setActiveProjectId(newProject.id);
        saveAllProjects([newProject], newProject.id);
      }
    } catch (error) { console.error("Gagal memuat proyek:", error); }
  }, []);

  const saveAllProjects = useCallback((projectList, currentActiveId) => {
    localStorage.setItem('sesm-projects', JSON.stringify(projectList));
    const finalActiveId = currentActiveId || activeProjectId;
    if (finalActiveId) { localStorage.setItem('sesm-last-active-project-id', finalActiveId); }
    setSaveStatus('Tersimpan');
  }, [activeProjectId]);

  useEffect(() => {
    if (!isAutoSaveEnabled || !activeProject) { setSaveStatus('Nonaktif'); return; }
    setSaveStatus('Menyimpan...');
    const handler = setTimeout(() => saveAllProjects(projects), 1500);
    return () => clearTimeout(handler);
  }, [projects, isAutoSaveEnabled, saveAllProjects, activeProject]);

  const handleCreateProject = () => {
    const newProject = { id: uuidv4(), title: 'Proyek Baru', text: '', lastModified: Date.now() };
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    setActiveProjectId(newProject.id);
    saveAllProjects(updatedProjects, newProject.id);
  };

  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    setIsProjectModalOpen(false);
  };
  
  // FUNGSI HAPUS PROYEK (DIPERBARUI)
  const handleDeleteProject = () => {
    if (projects.length <= 1) {
      setNotificationMessage({
        title: "Aksi Tidak Diizinkan",
        message: "Tidak bisa menghapus satu-satunya proyek yang ada."
      });
      setIsNotificationOpen(true);
      return;
    }
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteProject = () => {
    const updatedProjects = projects.filter(p => p.id !== activeProjectId);
    const newActiveId = updatedProjects[0]?.id || null;
    setProjects(updatedProjects);
    setActiveProjectId(newActiveId);
    saveAllProjects(updatedProjects, newActiveId);
    setIsDeleteConfirmOpen(false);
  };

  const updateActiveProject = (field, value) => {
    setProjects(currentProjects => currentProjects.map(p => p.id === activeProjectId ? { ...p, [field]: value, lastModified: Date.now() } : p));
  };

  const handleManualSave = () => {
    setSaveStatus('Menyimpan...');
    setTimeout(() => saveAllProjects(projects), 500);
  };

  const handleToggleAutoSave = () => {
    if (isAutoSaveEnabled) { setIsAutoSaveConfirmOpen(true); } else { setIsAutoSaveEnabled(true); }
  };

  const confirmDisableAutoSave = () => {
    setIsAutoSaveEnabled(false);
    setIsAutoSaveConfirmOpen(false);
  };
  
  const wordCount = useMemo(() => {
    if (!activeProject) return 0;
    return activeProject.text.trim() === '' ? 0 : activeProject.text.trim().split(/\s+/).length;
  }, [activeProject]);

  if (!activeProject) {
    return <div className="w-full h-screen bg-amber-50 flex justify-center items-center">Memuat Proyek...</div>;
  }

  return (
    <div className="w-full h-screen bg-amber-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <motion.header initial={{ y: -100 }} animate={{ y: 0 }} className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 flex justify-between items-center shadow-lg z-20">
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
            <button onClick={handleCreateProject} className="p-2 rounded-full text-white hover:bg-white/20" title="Buat Proyek Baru"><FiFilePlus size={20} /></button>
            <button onClick={() => setIsProjectModalOpen(true)} className="p-2 rounded-full text-white hover:bg-white/20" title="Buka Proyek"><FiFolder size={20} /></button>
            <button onClick={handleDeleteProject} className="p-2 rounded-full text-white hover:bg-white/20" title="Hapus Proyek"><FiTrash2 size={20} /></button>
        </div>
        <button onClick={handleToggleAutoSave} className={`p-2 rounded-full text-white transition-colors ${isAutoSaveEnabled ? 'bg-green-500/50 hover:bg-green-500/80' : 'bg-red-500/50 hover:bg-red-500/80'}`} title={isAutoSaveEnabled ? 'Simpan Otomatis Aktif' : 'Simpan Otomatis Nonaktif'}>
            {isAutoSaveEnabled ? <FiCloud size={20} /> : <FiCloudOff size={20} />}
        </button>
      </motion.header>

      {/* Area Menulis Utama */}
      <main className="flex-1 flex flex-col p-4 md:p-8 relative overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-full flex-1 flex flex-col bg-white rounded-2xl shadow-inner overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <input type="text" value={activeProject.title} onChange={(e) => updateActiveProject('title', e.target.value)} className="w-full text-xl font-bold text-center text-sesm-deep bg-transparent focus:outline-none" placeholder="Judul Proyek" />
            </div>
            <textarea key={activeProject.id} value={activeProject.text} onChange={(e) => updateActiveProject('text', e.target.value)} className="w-full h-full p-6 text-gray-800 text-lg leading-relaxed resize-none focus:outline-none placeholder:text-gray-400" placeholder="Mulai tulis ceritamu..." />
            <div className="p-3 bg-gray-50 text-right text-sm text-gray-500 font-semibold border-t">{wordCount} Kata</div>
        </motion.div>
      </main>
      
      {/* === KUMPULAN MODAL === */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsProjectModalOpen(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold p-5 border-b text-gray-800">Buka Proyek</h2>
              <div className="overflow-y-auto p-3">
                {projects.sort((a, b) => b.lastModified - a.lastModified).map(project => (
                  <div key={project.id} onClick={() => handleSelectProject(project.id)} className={`p-4 mb-2 rounded-lg cursor-pointer transition-colors ${activeProjectId === project.id ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-amber-100'}`}>
                    <p className="font-bold truncate">{project.title}</p>
                    <p className="text-sm opacity-80 truncate">{project.text.substring(0, 80) || "Tidak ada konten..."}</p>
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
      
      {/* MODAL NOTIFIKASI BARU */}
      <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} title={notificationMessage.title} message={notificationMessage.message} />
    </div>
  );
};

export default WritingPage;