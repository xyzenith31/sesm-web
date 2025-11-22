import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Card from '../components/ui/Card';
import AuthService from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '../hooks/useNavigation';
import Notification from '../components/ui/Notification';

const VerifyCodeForm = ({ identifier, onShowNotification }) => { 
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const { loginWithOtp } = useAuth();

    const inputStyles = "w-full px-5 py-3 text-sesm-deep bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-sesm-sky/50 transition-shadow duration-300 placeholder:text-gray-500 text-center tracking-[1em]";
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await loginWithOtp(code, identifier);
            
            onShowNotification('success', "Verifikasi berhasil! Anda akan diarahkan...");
            
        } catch (error) {
            const resMessage = (error.response?.data?.message) || error.message || "Kode verifikasi salah.";
            onShowNotification('error', resMessage);
            setLoading(false);
        }
    };
    
    const handleResend = (e) => {
        e.preventDefault();
        setResendLoading(true);
        
        AuthService.forgotPassword(identifier) 
            .then(response => {
                onShowNotification('success', response.data.message || 'Kode baru telah dikirim.');
                setResendLoading(false);
            })
            .catch(error => {
                const resMessage = (error.response?.data?.message) || 'Gagal mengirim ulang.';
                onShowNotification('error', resMessage);
                setResendLoading(false);
            });
    };

    return (
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

            <div className="mt-8 text-sm text-center text-white/80">
                <p>
                    Tidak menerima kode?{' '}
                    <button 
                        type="button" 
                        onClick={handleResend} 
                        className="font-bold underline transition hover:text-white disabled:text-white/50" 
                        disabled={resendLoading}
                    >
                        {resendLoading ? 'Mengirim...' : 'Kirim ulang'}
                    </button>
                </p>
            </div>
        </motion.form>
    );
};

const VerifyCodePage = () => { 
    const { navigate, viewProps } = useNavigation();
    const [notification, setNotification] = useState(null);
    const identifier = viewProps?.identifier || viewProps?.email || '';
    const source = viewProps?.source || 'login';

    const itemContainerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const handleBack = () => {
        if (source === 'register') {
            navigate('register');
        } else {
            navigate('login');
        }
    };

    return (
        <AuthLayout>
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

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
                        Kami telah mengirimkan kode 6 digit ke <strong>{identifier || 'email anda'}</strong>. Silakan masukkan di bawah ini.
                    </motion.p>
                    
                    <VerifyCodeForm 
                        identifier={identifier} 
                        onShowNotification={(type, message) => setNotification({ type, message })}
                    />

                    <motion.div variants={itemVariants} className="mt-6 w-full border-t border-white/20 pt-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center justify-center w-full gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Kembali ke {source === 'register' ? 'Daftar' : 'Masuk'}
                        </button>
                    </motion.div>

                </motion.div>
            </Card>
        </AuthLayout>
    );
};

export default VerifyCodePage;