// contoh-sesm-web/components/admin/QuizSettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

// Komponen Toggle Switch internal
const ToggleSwitch = ({ label, description, enabled, onToggle }) => (
    <div
        onClick={onToggle}
        className="flex justify-between items-center p-4 rounded-lg cursor-pointer transition-colors duration-200 bg-gray-100 hover:bg-gray-200/60"
    >
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
        setting_strict_scoring: false,
        setting_points_per_correct: 100,
        setting_allow_repeat_points: false // <-- Tambahkan state default
    });
    // State untuk saklar timer dipisah agar logic AnimatePresence lebih mudah
    const [isTimerEnabled, setIsTimerEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (quizData) {
            // Muat status saklar timer
            setIsTimerEnabled(quizData.setting_is_timer_enabled);
            // Muat semua setting lainnya
            setSettings(currentSettings => ({
                ...currentSettings,
                // Pastikan semua setting diambil dari quizData jika ada, gunakan default jika tidak
                setting_time_per_question: quizData.setting_time_per_question ?? 20,
                setting_randomize_questions: quizData.setting_randomize_questions,
                setting_randomize_answers: quizData.setting_randomize_answers,
                setting_show_leaderboard: quizData.setting_show_leaderboard,
                setting_show_memes: quizData.setting_show_memes,
                setting_allow_redemption: quizData.setting_allow_redemption,
                setting_strict_scoring: quizData.setting_strict_scoring,
                setting_points_per_correct: quizData.setting_points_per_correct ?? 100,
                setting_allow_repeat_points: quizData.setting_allow_repeat_points // <-- Muat state dari data
            }));
        }
    }, [quizData]);

    const handleToggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    const handleValueChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Siapkan data yang akan disimpan, termasuk state isTimerEnabled
            const settingsToSave = {
                ...settings,
                setting_is_timer_enabled: isTimerEnabled, // Sertakan status saklar timer
                 // Pastikan nilai integer valid atau null
                setting_time_per_question: isTimerEnabled ? (parseInt(settings.setting_time_per_question, 10) || 20) : null, // Kirim null jika timer nonaktif
                setting_points_per_correct: settings.setting_strict_scoring ? (parseInt(settings.setting_points_per_correct, 10) || 100) : 100 // Gunakan 100 jika skor ketat nonaktif atau input tidak valid
                // setting_allow_repeat_points sudah boolean di state settings
            };
            // Pastikan onSave dipanggil dengan benar
            await onSave(quizData.id, settingsToSave);
             // onClose() dipanggil oleh parent (ManajemenKuis) jika sukses
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
                    {/* Timer */}
                    <ToggleSwitch
                        label="Aktifkan Timer per Soal"
                        description="Jika aktif, setiap soal akan memiliki batas waktu untuk dijawab."
                        enabled={isTimerEnabled}
                        onToggle={() => setIsTimerEnabled(prev => !prev)}
                    />
                    <AnimatePresence>
                        {isTimerEnabled && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="p-4 rounded-lg bg-gray-100 overflow-hidden"
                            >
                                <label className="font-semibold text-gray-800">Waktu per Soal (Detik)</label>
                                <p className="text-xs text-gray-500 mb-2">Atur batas waktu untuk menjawab (5-300 detik).</p>
                                <input
                                    type="number"
                                    value={settings.setting_time_per_question || ''}
                                    onChange={(e) => handleValueChange('setting_time_per_question', e.target.value)}
                                    className="w-full p-2 border rounded-md" placeholder="Default: 20" min="5" max="300" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                     {/* Skor Ketat */}
                     <ToggleSwitch
                        label="Skor Ketat (Salah = 0 Poin)"
                        description="Jika aktif, jawaban salah tidak mendapat poin. Jika nonaktif, salah mendapat 25 poin, benar 50 poin."
                        enabled={settings.setting_strict_scoring}
                        onToggle={() => handleToggle('setting_strict_scoring')}
                    />
                    <AnimatePresence>
                        {settings.setting_strict_scoring && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="p-4 rounded-lg bg-gray-100 overflow-hidden"
                            >
                                <label className="font-semibold text-gray-800">Poin per Jawaban Benar (Mode Skor Ketat)</label>
                                <p className="text-xs text-gray-500 mb-2">Atur poin untuk setiap jawaban benar (minimal 1).</p>
                                <input
                                    type="number"
                                    value={settings.setting_points_per_correct || ''}
                                    onChange={(e) => handleValueChange('setting_points_per_correct', e.target.value)}
                                    className="w-full p-2 border rounded-md" placeholder="Default: 100" min="1" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* --- ⭐ Tambahkan Toggle untuk Izinkan Poin Berulang --- */}
                    <ToggleSwitch
                        label="Izinkan Dapat Poin Lagi Jika Mengerjakan Ulang"
                        description="Jika aktif, siswa akan mendapat poin setiap kali mengerjakan kuis ini (meskipun sudah pernah)."
                        enabled={settings.setting_allow_repeat_points}
                        onToggle={() => handleToggle('setting_allow_repeat_points')}
                    />

                    {/* Opsi Lain */}
                    <ToggleSwitch label="Acak Urutan Soal" description="Setiap siswa akan mendapatkan urutan soal yang berbeda." enabled={settings.setting_randomize_questions} onToggle={() => handleToggle('setting_randomize_questions')} />
                    <ToggleSwitch label="Acak Urutan Jawaban" description="Opsi jawaban untuk soal pilihan ganda akan diacak." enabled={settings.setting_randomize_answers} onToggle={() => handleToggle('setting_randomize_answers')} />
                    <ToggleSwitch label="Tampilkan Papan Skor" description="Tampilkan peringkat skor akhir setelah kuis selesai." enabled={settings.setting_show_leaderboard} onToggle={() => handleToggle('setting_show_leaderboard')} />
                    <ToggleSwitch label="Tampilkan Meme" description="Tampilkan gambar lucu (meme) setelah menjawab soal." enabled={settings.setting_show_memes} onToggle={() => handleToggle('setting_show_memes')} />
                    <ToggleSwitch label="Izinkan Pertanyaan Tebusan" description="Siswa mendapat kesempatan kedua untuk menjawab soal PG yang salah." enabled={settings.setting_allow_redemption} onToggle={() => handleToggle('setting_allow_redemption')} />

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