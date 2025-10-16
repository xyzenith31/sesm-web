import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import Card from '../components/ui/Card';
import { FiEye, FiEyeOff, FiAlertTriangle } from 'react-icons/fi';
import AuthService from '../services/authService';
import { useAuth } from '../hooks/useAuth';

const SkipConfirmationModal = ({ isOpen, onClose, onConfirm, loading }) => {
    if (!isOpen) return null;
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-2xl w-full max-w-sm flex flex-col shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4"><FiAlertTriangle className="h-6 w-6 text-blue-600" /></div>
                    <h3 className="text-lg font-bold text-gray-900">Lanjutkan Tanpa Mengganti Password?</h3>
                    <p className="text-sm text-gray-500 mt-2">Anda akan langsung masuk ke akun Anda tanpa mengubah password saat ini. Anda yakin?</p>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
                    <button onClick={onConfirm} disabled={loading} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sesm-deep text-base font-medium text-white hover:bg-opacity-90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400">
                        {loading ? 'Memproses...' : 'Ya, Lanjutkan'}
                    </button>
                    <button onClick={onClose} type="button" disabled={loading} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                        Batal
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// --- Komponen Form Internal ---
const ResetPasswordForm = ({ code, identifier, onPasswordReset }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [successful, setSuccessful] = useState(false);
    const { handleAuthentication } = useAuth();

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };
    const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500";

    const handlePasswordChangeSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Password dan Konfirmasi Password tidak cocok.");
            setSuccessful(false);
            return;
        }
        setLoading(true);
        setMessage('');
        setSuccessful(false);

        AuthService.resetPassword(code, identifier, password, confirmPassword)
            .then(response => {
                setMessage(response.data.message);
                setSuccessful(true);
                setLoading(false);
                handleAuthentication(response.data);
                setTimeout(() => {
                    onPasswordReset();
                }, 2000);
            })
            .catch(error => {
                const resMessage = (error.response?.data?.message) || error.message || error.toString();
                setMessage(resMessage);
                setSuccessful(false);
                setLoading(false);
            });
    };

    return (
        <>
            <form className="w-full space-y-4" onSubmit={handlePasswordChangeSubmit}>
                <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Password Baru" className={inputStyles} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">{showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}</button>
                </div>
                <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} placeholder="Konfirmasi Password Baru" className={inputStyles} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">{showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}</button>
                </div>
                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 disabled:bg-gray-400"
                        disabled={loading}
                    >
                        {loading ? 'Menyimpan...' : 'Ganti Password & Login'}
                    </button>
                </div>
            </form>
            {message && (
                <motion.div
                    variants={itemVariants}
                    className={`p-3 mt-4 rounded-lg text-center font-bold w-full ${successful ? 'bg-green-500/80' : 'bg-red-500/80'} text-white`}
                >
                    {message}
                </motion.div>
            )}
        </>
    );
};

// --- Komponen Halaman Utama ---
const ResetPasswordPage = ({ code, identifier, onPasswordReset }) => {
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState('choice'); // 'choice' | 'form'
    const [isSkipModalOpen, setSkipModalOpen] = useState(false);
    const { handleAuthentication } = useAuth();

    const itemContainerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
    const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    const handleSkipAndLogin = () => {
        setLoading(true);
        AuthService.loginWithCode(code, identifier)
            .then(response => {
                handleAuthentication(response.data);
                setSkipModalOpen(false);
                setLoading(false);
                onPasswordReset();
            })
            .catch(error => {
                const resMessage = (error.response?.data?.message) || "Gagal melanjutkan.";
                setLoading(false);
                alert(resMessage);
            });
    };

    return (
        <AuthLayout>
            <AnimatePresence>
                <SkipConfirmationModal
                    isOpen={isSkipModalOpen}
                    onClose={() => setSkipModalOpen(false)}
                    onConfirm={handleSkipAndLogin}
                    loading={loading}
                />
            </AnimatePresence>
            <Card>
                <motion.div
                    className="flex flex-col items-center"
                    initial="hidden"
                    animate="visible"
                    variants={itemContainerVariants}
                >
                    <AnimatePresence mode="wait">
                        {view === 'choice' && (
                            <motion.div
                                key="choice"
                                variants={itemVariants}
                                initial="hidden" animate="visible" exit="hidden"
                                className="w-full flex flex-col items-center text-center"
                            >
                                <h1 className="text-3xl font-bold text-white mb-2">Verifikasi Berhasil</h1>
                                <p className="text-white/80 text-sm max-w-xs mb-8">
                                    Apa yang ingin Anda lakukan selanjutnya?
                                </p>
                                <div className="w-full space-y-4">
                                    <button
                                        onClick={() => setView('form')}
                                        className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95"
                                    >
                                        Ganti Password
                                    </button>
                                    <button
                                        onClick={() => setSkipModalOpen(true)}
                                        className="w-full px-5 py-3 text-base font-bold text-white bg-transparent border-2 border-white rounded-full shadow-lg transition-all duration-300 hover:bg-white/20 active:scale-95"
                                    >
                                        Lanjutkan & Login
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {view === 'form' && (
                            <motion.div
                                key="form"
                                variants={itemVariants}
                                initial="hidden" animate="visible" exit="hidden"
                                className="w-full flex flex-col items-center"
                            >
                                <h1 className="text-3xl font-bold text-white text-center mb-2">
                                    Atur Password Baru
                                </h1>
                                <p className="text-white/80 text-center mb-6 text-sm max-w-xs">
                                    Pastikan password baru Anda kuat dan mudah diingat.
                                </p>
                                <ResetPasswordForm
                                    code={code}
                                    identifier={identifier}
                                    onPasswordReset={onPasswordReset}
                                />
                                <button onClick={() => setView('choice')} className="mt-6 text-sm text-white/80 font-semibold hover:text-white">Kembali</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </Card>
        </AuthLayout>
    );
};

export default ResetPasswordPage;