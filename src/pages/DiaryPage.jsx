import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSave, FiEdit2, FiTrash2, FiInfo, FiAlertTriangle } from 'react-icons/fi';

// --- Komponen Modal ---
// Komponen-komponen ini saya letakkan di sini agar file tetap tunggal sesuai permintaan,
// namun idealnya diletakkan di folder /components terpisah.

// Modal untuk notifikasi (cth: "Simpan Berhasil")
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
                    <button onClick={onClose} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sesm-teal text-base font-medium text-white hover:bg-sesm-deep focus:outline-none sm:w-auto sm:text-sm">Oke</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Modal untuk konfirmasi (cth: "Yakin ingin menghapus?")
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

// Modal untuk mengedit entri
const EditEntryModal = ({ isOpen, onClose, onSave, entryContent, setEntryContent }) => {
    if (!isOpen) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Edit Catatan</h3>
                    <textarea
                        value={entryContent}
                        onChange={(e) => setEntryContent(e.target.value)}
                        className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sesm-teal"
                        placeholder="Tulis catatanmu..."
                    ></textarea>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse rounded-b-2xl">
                    <button onClick={onSave} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sesm-deep text-base font-medium text-white hover:bg-opacity-90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Selesai</button>
                    <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">Batal</button>
                </div>
            </motion.div>
        </motion.div>
    );
};


// Data contoh awal
const initialEntries = [
  {
    id: 2,
    date: "3 Oktober 2025",
    content: "Hari ini aku belajar tentang perkalian di sekolah. Awalnya susah, tapi setelah latihan di SESM jadi lebih mengerti! Besok mau coba lagi ah."
  },
  {
    id: 1,
    date: "2 Oktober 2025",
    content: "Pelajaran IPS tentang peta Indonesia seru sekali. Aku jadi tahu letak pulau Bali dan Sumatera. Kapan-kapan ingin liburan ke sana."
  },
];

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
                <p className="text-xs font-bold text-sesm-deep mb-1">{entry.date}</p>
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
  const [entries, setEntries] = useState(initialEntries);
  const [newEntry, setNewEntry] = useState('');
  
  // State untuk modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  // State untuk data yang dipilih
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editText, setEditText] = useState('');

  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // --- Fungsi-fungsi Handler ---

  const handleSaveNewEntry = () => {
    if (newEntry.trim() === '') return;
    const newId = entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1;
    const entryToAdd = {
        id: newId,
        date: today,
        content: newEntry
    };
    setEntries([entryToAdd, ...entries]);
    setNewEntry('');
    setIsNotificationOpen(true);
  };
  
  const handleOpenEditModal = (entry) => {
    setSelectedEntry(entry);
    setEditText(entry.content);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    setEntries(entries.map(e => e.id === selectedEntry.id ? { ...e, content: editText } : e));
    setIsEditModalOpen(false);
    setSelectedEntry(null);
    setIsNotificationOpen(true);
  };

  const handleOpenDeleteModal = (entry) => {
    setSelectedEntry(entry);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    setEntries(entries.filter(e => e.id !== selectedEntry.id));
    setIsDeleteModalOpen(false);
    setSelectedEntry(null);
  };


  return (
    <>
      <AnimatePresence>
        <EditEntryModal 
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSaveEdit}
            entryContent={editText}
            setEntryContent={setEditText}
        />
        <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            title="Hapus Catatan?"
            message="Apakah Anda yakin ingin menghapus catatan ini secara permanen?"
        />
        <NotificationModal
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            title="Berhasil!"
            message="Catatan harian Anda telah berhasil disimpan."
        />
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
              <div className="space-y-4">
                <AnimatePresence>
                  {entries.map((entry) => (
                      <DiaryEntry 
                        key={entry.id} 
                        entry={entry}
                        onEdit={handleOpenEditModal}
                        onDelete={handleOpenDeleteModal}
                      />
                  ))}
                </AnimatePresence>
              </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default DiaryPage;