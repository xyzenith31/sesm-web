import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AuthLayout from '../layouts/AuthLayout';
import Card from '../components/ui/Card';
import AuthService from '../services/authService';
import { useAuth } from '../hooks/useAuth'; // Impor useAuth

// --- Komponen Form Internal ---
const VerifyCodeForm = ({ identifier }) => { // Hapus onVerified
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [successful, setSuccessful] = useState(false);

    const [resendLoading, setResendLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const { loginWithOtp } = useAuth(); // Dapatkan fungsi loginWithOtp dari hook

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };
    const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500 text-center tracking-[1em]";

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setSuccessful(false);

        // Panggil fungsi loginWithOtp
        loginWithOtp(code, identifier)
            .then(response => {
                setMessage("Verifikasi berhasil! Anda akan diarahkan...");
                setSuccessful(true);
                setLoading(false);
                // Navigasi akan ditangani secara otomatis oleh NavigationContext
            })
            .catch(error => {
                const resMessage = (error.response?.data?.message) || error.message || error.toString();
                setMessage(resMessage);
                setSuccessful(false);
                setLoading(false);
            });
    };
    
    const handleResend = () => {
        setResendLoading(true);
        setResendMessage('');
        // Ganti dengan endpoint yang sesuai jika ada, atau gunakan forgotPassword untuk mengirim ulang
        AuthService.forgotPassword(identifier) 
            .then(response => {
                setResendMessage(response.data.message);
                setResendLoading(false);
            })
            .catch(error => {
                const resMessage = (error.response?.data?.message) || 'Gagal mengirim ulang.';
                setResendMessage(resMessage);
                setResendLoading(false);
            });
    };

    return (
        <>
            <motion.form variants={itemVariants} className="w-full space-y-4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="______"
                    maxLength="6"
                    className={inputStyles}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full px-5 py-3 text-base font-bold text-sesm-deep bg-white rounded-full shadow-lg transition-all duration-300 hover:bg-gray-200 active:scale-95 disabled:bg-gray-400"
                        disabled={loading}
                    >
                        {loading ? 'Memverifikasi...' : 'Verifikasi & Login'}
                    </button>
                </div>
            </motion.form>

            {message && (
                <motion.div variants={itemVariants} className={`p-3 mt-4 rounded-lg text-center font-bold w-full ${successful ? 'bg-green-500/80' : 'bg-red-500/80'} text-white`}>
                    {message}
                </motion.div>
            )}

            <motion.div variants={itemVariants} className="mt-8 text-sm text-center text-white/80">
                <p>
                    Tidak menerima kode?{' '}
                    <button onClick={handleResend} className="font-bold underline transition hover:text-white disabled:text-white/50" disabled={resendLoading}>
                        {resendLoading ? 'Mengirim...' : 'Kirim ulang'}
                    </button>
                </p>
                {resendMessage && (
                    <p className="mt-2 text-xs font-semibold">{resendMessage}</p>
                )}
            </motion.div>
        </>
    );
};


// --- Komponen Halaman Utama ---
const VerifyCodePage = ({ identifier }) => { // Hapus onVerified
    const itemContainerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <AuthLayout>
            <Card>
                <motion.div
                    className="flex flex-col items-center"
                    initial="hidden"
                    animate="visible"
                    variants={itemContainerVariants}
                >
                    <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white text-center mb-2">
                        Verifikasi Akun
                    </motion.h1>
                    <motion.p variants={itemVariants} className="text-white/80 text-center mb-6 text-sm max-w-xs">
                        Kami telah mengirimkan kode 6 digit ke <strong>{identifier}</strong>. Silakan masukkan di bawah ini.
                    </motion.p>
                    <VerifyCodeForm identifier={identifier} />
                </motion.div>
            </Card>
        </AuthLayout>
    );
};

export default VerifyCodePage;