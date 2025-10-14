// contoh-sesm-web/components/admin/QuizSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

const ToggleSwitch = ({ label, description, enabled, onToggle }) => (
    <div onClick={onToggle} className="flex justify-between items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-100 hover:bg-gray-200/60">
        <div className="flex-grow pr-4">
            <p className="font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${enabled ? 'bg-sesm-teal' : 'bg-gray-300'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </div>
    </div>
);

const QuizSettingsModal = ({ isOpen, onClose, onSave, quizData }) => {
    const [settings, setSettings] = useState({
        setting_time_per_question: 20,
        setting_randomize_questions: false,
        setting_randomize_answers: false,
        setting_show_leaderboard: true,
        setting_show_memes: true,
        setting_allow_redemption: false,
        setting_play_music: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (quizData) {
            setSettings(currentSettings => ({
                ...currentSettings,
                setting_time_per_question: quizData.setting_time_per_question ?? 20,
                setting_randomize_questions: !!quizData.setting_randomize_questions,
                setting_randomize_answers: !!quizData.setting_randomize_answers,
                setting_show_leaderboard: quizData.setting_show_leaderboard !== 0,
                setting_show_memes: quizData.setting_show_memes !== 0,
                setting_allow_redemption: !!quizData.setting_allow_redemption,
                setting_play_music: quizData.setting_play_music !== 0,
            }));
        }
    }, [quizData]);

    const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    const handleTimeChange = (e) => setSettings(prev => ({ ...prev, setting_time_per_question: e.target.value }));

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // PERBAIKAN: Pastikan nilai waktu adalah angka integer yang valid.
            // Jika input kosong atau tidak valid, gunakan nilai default 20.
            const timeValue = parseInt(settings.setting_time_per_question, 10);
            const settingsToSave = {
                ...settings,
                setting_time_per_question: !isNaN(timeValue) && timeValue > 0 ? timeValue : 20,
            };
            await onSave(quizData.id, settingsToSave);
        } catch (error) {
            alert("Gagal menyimpan pengaturan. Silakan cek konsol untuk detail.");
            console.error("Gagal menyimpan pengaturan kuis:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[90vh]">
                <header className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Pengaturan Kuis</h3>
                        <p className="text-sm text-gray-500 truncate">Untuk: {quizData?.title || "..."}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX size={22} /></button>
                </header>
                <main className="flex-grow overflow-y-auto p-6 space-y-4">
                    <div className="p-4 rounded-lg bg-gray-100">
                         <label className="font-semibold text-gray-800">Waktu per Soal (Detik)</label>
                         <p className="text-xs text-gray-500 mb-2">Atur batas waktu untuk menjawab setiap pertanyaan (5-300 detik).</p>
                         <input type="number" value={settings.setting_time_per_question} onChange={handleTimeChange} className="w-full p-2 border rounded-md" placeholder="Default: 20" min="5" max="300" />
                    </div>
                    <ToggleSwitch label="Acak Urutan Soal" description="Setiap siswa akan mendapatkan urutan soal yang berbeda." enabled={settings.setting_randomize_questions} onToggle={() => handleToggle('setting_randomize_questions')} />
                    <ToggleSwitch label="Acak Urutan Jawaban" description="Opsi jawaban untuk soal pilihan ganda akan diacak." enabled={settings.setting_randomize_answers} onToggle={() => handleToggle('setting_randomize_answers')} />
                    <ToggleSwitch label="Tampilkan Papan Skor" description="Tampilkan peringkat skor akhir setelah kuis selesai." enabled={settings.setting_show_leaderboard} onToggle={() => handleToggle('setting_show_leaderboard')} />
                    <ToggleSwitch label="Tampilkan Meme" description="Tampilkan gambar lucu (meme) setelah menjawab soal." enabled={settings.setting_show_memes} onToggle={() => handleToggle('setting_show_memes')} />
                    <ToggleSwitch label="Izinkan Pertanyaan Tebusan" description="Siswa mendapat kesempatan kedua untuk menjawab soal yang salah." enabled={settings.setting_allow_redemption} onToggle={() => handleToggle('setting_allow_redemption')} />
                    <ToggleSwitch label="Mainkan Musik Latar" description="Putar musik selama kuis berlangsung untuk menambah keseruan." enabled={settings.setting_play_music} onToggle={() => handleToggle('setting_play_music')} />
                </main>
                <footer className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200">Batal</button>
                    <button type="button" onClick={handleSave} disabled={isSaving} className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 flex items-center gap-2 disabled:bg-gray-400">
                        {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default QuizSettingsModal;