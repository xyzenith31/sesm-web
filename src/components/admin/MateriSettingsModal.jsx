import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiLoader } from 'react-icons/fi';

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

const MateriSettingsModal = ({ isOpen, onClose, onSave, chapterData }) => {
    const [settings, setSettings] = useState({
        setting_penalty_on_wrong: false,
        setting_randomize_questions: false,
        setting_show_correct_answers: true,
        setting_time_limit_minutes: '',
        setting_require_all_answers: false,
        setting_strict_zero_on_wrong: false,
        setting_fail_on_any_wrong: false,
    });
    
    const [isTimeLimitEnabled, setIsTimeLimitEnabled] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (chapterData && chapterData.settings) {
            const timeLimit = chapterData.settings.setting_time_limit_minutes;
            
            setIsTimeLimitEnabled(timeLimit !== null && timeLimit !== undefined && timeLimit !== '');

            setSettings({
                ...settings,
                ...chapterData.settings,
                setting_time_limit_minutes: timeLimit || ''
            });
        }
    }, [chapterData]);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleTimeChange = (e) => {
        setSettings(prev => ({ ...prev, setting_time_limit_minutes: e.target.value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const settingsToSave = {
                ...settings,
                setting_time_limit_minutes: isTimeLimitEnabled ? (parseInt(settings.setting_time_limit_minutes, 10) || null) : null
            };
            await onSave(chapterData.chapter_id, settingsToSave);
        } catch (error) {
            console.error("Gagal menyimpan pengaturan:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-[90vh]">
                <header className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Pengaturan Materi</h3>
                        <p className="text-sm text-gray-500 truncate">Untuk: {chapterData?.judul || "..."}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><FiX size={22} /></button>
                </header>

                <main className="flex-grow overflow-y-auto p-6 space-y-4">
                    <ToggleSwitch
                        label="Penalti Jawaban Salah"
                        description="Jika aktif, jawaban salah akan mengurangi total skor siswa."
                        enabled={settings.setting_penalty_on_wrong}
                        onToggle={() => handleToggle('setting_penalty_on_wrong')}
                    />
                    <ToggleSwitch
                        label="Poin Nol Jika Salah"
                        description="Jika aktif, setiap jawaban yang salah akan diberi skor 0."
                        enabled={settings.setting_strict_zero_on_wrong}
                        onToggle={() => handleToggle('setting_strict_zero_on_wrong')}
                    />
                    <ToggleSwitch
                        label="Nilai Nol Jika Ada yang Salah"
                        description="Jika aktif, satu saja jawaban salah akan membuat total nilai akhir menjadi 0."
                        enabled={settings.setting_fail_on_any_wrong}
                        onToggle={() => handleToggle('setting_fail_on_any_wrong')}
                    />
                    <ToggleSwitch
                        label="Acak Urutan Soal"
                        description="Jika aktif, setiap siswa akan mendapatkan urutan soal yang berbeda."
                        enabled={settings.setting_randomize_questions}
                        onToggle={() => handleToggle('setting_randomize_questions')}
                    />
                    <ToggleSwitch
                        label="Wajib Jawab Semua Soal"
                        description="Jika aktif, siswa tidak bisa mengirimkan jawaban sebelum semua soal diisi."
                        enabled={settings.setting_require_all_answers}
                        onToggle={() => handleToggle('setting_require_all_answers')}
                    />
                    <ToggleSwitch
                        label="Tampilkan Jawaban Benar Setelah Selesai"
                        description="Jika nonaktif, siswa tidak akan bisa melihat kunci jawaban di akhir."
                        enabled={settings.setting_show_correct_answers}
                        onToggle={() => handleToggle('setting_show_correct_answers')}
                    />
                    
                    <ToggleSwitch
                        label="Aktifkan Batas Waktu"
                        description="Jika aktif, siswa akan memiliki batas waktu total untuk mengerjakan semua soal."
                        enabled={isTimeLimitEnabled}
                        onToggle={() => setIsTimeLimitEnabled(prev => !prev)}
                    />

                    <AnimatePresence>
                        {isTimeLimitEnabled && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }}
                                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                className="p-4 rounded-lg bg-gray-100 overflow-hidden"
                            >
                                 <label className="font-semibold text-gray-800">Batas Waktu Pengerjaan (Menit)</label>
                                 <p className="text-xs text-gray-500 mb-2">Masukkan angka saja. Contoh: 20</p>
                                 <input
                                    type="number"
                                    value={settings.setting_time_limit_minutes}
                                    onChange={handleTimeChange}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Contoh: 20"
                                    min="1"
                                 />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                <footer className="bg-gray-50 p-4 flex justify-end gap-3 rounded-b-2xl border-t">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-gray-800 rounded-lg font-semibold hover:bg-gray-200">
                        Batal
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2 bg-sesm-deep text-white rounded-lg font-semibold hover:bg-opacity-90 flex items-center gap-2 disabled:bg-gray-400"
                    >
                        {isSaving ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </footer>
            </motion.div>
        </motion.div>
    );
};

export default MateriSettingsModal;