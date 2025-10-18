// contoh-sesm-web/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import SidebarGuru from '../components/navigation/SidebarGuru';
import { motion } from 'framer-motion';

const AdminLayout = ({ children, activePage, onNavigate }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const toggleMinimize = () => setIsMinimized(!isMinimized);

    // Variabel lebar untuk animasi marginLeft
    const SIDEBAR_WIDTH_MAX = 256; // w-64
    const SIDEBAR_WIDTH_MIN = 80;  // w-20

    return (
        // flex-grow-0 dihapus dari div utama
        <div className="min-h-screen bg-gray-100 font-sans flex">
            <SidebarGuru
                activePage={activePage}
                onNavigate={onNavigate}
                isMinimized={isMinimized}
                toggleMinimize={toggleMinimize}
            />

            {/* Konten Utama dengan Margin Kiri Dinamis */}
            <motion.div
                className="flex-1 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                // Animasikan marginLeft secara langsung
                animate={{ marginLeft: isMinimized ? `${SIDEBAR_WIDTH_MIN}px` : `${SIDEBAR_WIDTH_MAX}px` }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} // Samakan transisi
            >
                {/* Area konten utama */}
                {/* Pastikan padding tidak terlalu besar jika sidebar minimize */}
                <main className={`flex-1 p-6 md:p-8 flex flex-col`}>
                    {children}
                </main>
            </motion.div>
        </div>
    );
};

export default AdminLayout;