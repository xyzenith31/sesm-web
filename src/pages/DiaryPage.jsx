import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSave, FiEdit2, FiTrash2, FiInfo, FiAlertTriangle, FiLoader } from 'react-icons/fi';
import DataService from '../services/dataService';

const NotificationModal = ({ isOpen, onClose, title, message }) => { if (!isOpen) return null; return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}><motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}><div className="p-6 text-center"><div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4"><FiInfo className="h-6 w-6 text-blue-600" /></div><h3 className="text-lg font-bold text-gray-900">{title}</h3><p className="text-sm text-gray-500 mt-2">{message}</p></div><div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl"><button onClick={onClose} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sesm-teal text-base font-medium text-white hover:bg-sesm-deep focus:outline-none sm:w-auto sm:text-sm">Oke</button></div></motion.div></motion.div> );};
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => { if (!isOpen) return null; return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}><motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}><div className="p-6 text-center"><div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4"><FiAlertTriangle className="h-6 w-6 text-yellow-600" /></div><h3 className="text-lg font-bold text-gray-900">{title}</h3><p className="text-sm text-gray-500 mt-2">{message}</p></div><div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl"><button onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Lanjutkan</button><button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Batal</button></div></motion.div></motion.div> );};
const EditEntryModal = ({ isOpen, onClose, onSave, entryContent, setEntryContent }) => { if (!isOpen) return null; return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}><motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}><div className="p-6"><h3 className="text-lg font-bold text-gray-900 mb-4">Edit Catatan</h3><textarea value={entryContent} onChange={(e) => setEntryContent(e.target.value)} className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal" placeholder="Tulis catatanmu..."></textarea></div><div className="bg-gray-50 px-6 py-3 flex flex-row-reverse rounded-b-2xl"><button onClick={onSave} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sesm-deep text-base font-medium text-white hover:bg-opacity-90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Selesai</button><button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Batal</button></div></motion.div></motion.div> );};


const DiaryEntry = ({ entry, onEdit, onDelete }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
        className="bg-white p-4 rounded-xl shadow-sm w-full"
    >
        <div className="flex justify-between items-start">
            <div className='flex-grow pr-4'>
                <p className="text-xs font-bold text-sesm-deep mb-1">{new Date(entry.entry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.content}</p>
            </div>
            <div className="flex space-x-3 text-gray-400 flex-shrink-0">
                <button onClick={() => onEdit(entry)} className="hover:text-sesm-teal"><FiEdit2 size={18}/></button>
                <button onClick={() => onDelete(entry)} className="hover:text-red-500"><FiTrash2 size={18}/></button>
            </div>
        </div>
    </motion.div>
);


const DiaryPage = ({ onNavigate }) => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editText, setEditText] = useState('');
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
        const response = await DataService.getDiaryEntries();
        setEntries(response.data);
    } catch (error) {
        console.error("Gagal memuat entri harian:", error);
        alert("Gagal memuat catatan harian.");
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSaveNewEntry = async () => {
    if (newEntry.trim() === '') return;
    try {
        await DataService.addDiaryEntry(newEntry);
        setNewEntry('');
        setIsNotificationOpen(true);
        fetchEntries();
    } catch (error) {
        alert("Gagal menyimpan catatan baru.");
    }
  };
  
  const handleOpenEditModal = (entry) => {
    setSelectedEntry(entry);
    setEditText(entry.content);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
        await DataService.updateDiaryEntry(selectedEntry.id, editText);
        setIsEditModalOpen(false);
        setSelectedEntry(null);
        setIsNotificationOpen(true);
        fetchEntries();
    } catch (error) {
        alert("Gagal memperbarui catatan.");
    }
  };

  const handleOpenDeleteModal = (entry) => {
    setSelectedEntry(entry);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    try {
        await DataService.deleteDiaryEntry(selectedEntry.id);
        setIsDeleteModalOpen(false);
        setSelectedEntry(null);
        fetchEntries();
    } catch (error) {
        alert("Gagal menghapus catatan.");
    }
  };


  return (
    <>
      <AnimatePresence>
        <EditEntryModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveEdit} entryContent={editText} setEntryContent={setEditText}/>
        <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} title="Hapus Catatan?" message="Apakah Anda yakin ingin menghapus catatan ini secara permanen?" />
        <NotificationModal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} title="Berhasil!" message="Catatan harian Anda telah berhasil disimpan." />
      </AnimatePresence>

      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white p-4 pt-8 flex items-center sticky top-0 z-10 shadow-sm">
          <button onClick={() => onNavigate('profile')} className="p-2 rounded-full hover:bg-gray-100">
            <FiArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-center flex-grow text-sesm-deep">Buku Harian Saya</h1>
          <div className="w-10"></div>
        </header>

        <main className="flex-grow overflow-y-auto p-6 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-md">
              <p className="font-bold text-gray-800">Catatan untuk hari ini</p>
              <p className="text-xs text-gray-500 mb-3">{today}</p>
              <textarea
                  value={newEntry}
                  onChange={(e) => setNewEntry(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                  placeholder="Apa yang kamu rasakan atau pelajari hari ini?"
              ></textarea>
              <motion.button
                  onClick={handleSaveNewEntry}
                  className="w-full mt-3 flex items-center justify-center space-x-2 bg-sesm-deep text-white font-bold py-3 rounded-lg shadow-lg hover:bg-opacity-90 disabled:bg-gray-400"
                  whileTap={{ scale: 0.95 }}
                  disabled={!newEntry.trim()}
              >
                  <FiSave />
                  <span>Simpan Catatan</span>
              </motion.button>
          </div>

          <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3">Catatan Sebelumnya</h2>
              {loading ? (
                <div className="flex justify-center items-center h-40"><FiLoader className="animate-spin text-2xl text-sesm-teal" /></div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {entries.length > 0 ? (
                        entries.map((entry) => (
                            <DiaryEntry 
                                key={entry.id} 
                                entry={entry}
                                onEdit={handleOpenEditModal}
                                onDelete={handleOpenDeleteModal}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">Belum ada catatan tersimpan.</p>
                    )}
                  </AnimatePresence>
                </div>
              )}
          </div>
        </main>
      </div>
    </>
  );
};

export default DiaryPage;