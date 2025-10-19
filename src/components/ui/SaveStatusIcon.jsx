import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCloud, FiCloudOff, FiAlertTriangle } from 'react-icons/fi';

const SaveStatusIcon = ({ status }) => {
    // Definisi path untuk SVG
    const cloudPath = "M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z";
    const checkPath = "M22 11.08V12a10 10 0 1 1-5.93-9.14";
    const polylinePath = "M22 4L12 14.01l-3-3";
    const arrowUpPath = "M12 17V11";
    const arrowHeadPath = "M9 14l3-3 3 3";

    // Varian animasi untuk Framer Motion
    const cloudVariants = {
        initial: { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1, transition: { duration: 0.8, ease: "easeInOut" } },
        exit: { opacity: 0 }
    };
    const checkVariants = {
        initial: { pathLength: 0 },
        animate: { pathLength: 1, transition: { duration: 0.4, ease: "easeOut", delay: 0.5 } }
    };
    const arrowVariants = {
        initial: { y: 3, opacity: 0 },
        animate: { y: -3, opacity: [0, 1, 1, 0], transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }
    };

    let icon;
    let text;
    // Ganti warna utama menjadi biru (#3B82F6)
    const activeColor = "#3B82F6"; 

    switch (status) {
        case 'Menyimpan...':
            icon = (
                <motion.svg key="saving" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path d={cloudPath} variants={cloudVariants} initial="initial" animate="animate" />
                    <motion.path d={arrowUpPath} variants={arrowVariants} />
                    <motion.path d={arrowHeadPath} variants={arrowVariants} />
                </motion.svg>
            );
            text = "Menyimpan...";
            break;
        case 'Tersimpan':
            icon = (
                <motion.svg key="saved" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <motion.path d={checkPath} variants={cloudVariants} initial="initial" animate="animate" />
                    <motion.polyline points="22 4 12 14.01 9 11" variants={checkVariants} initial="initial" animate="animate" />
                </motion.svg>
            );
            text = "Tersimpan";
            break;
        case 'Gagal':
            icon = <FiAlertTriangle size={18} className="text-red-500" />;
            text = "Gagal";
            break;
        default:
            icon = <FiCloudOff size={18} />;
            text = "Simpan otomatis nonaktif";
            break;
    }

    return (
        <div className="flex items-center space-x-2 text-sm font-semibold text-gray-500 w-32">
            <AnimatePresence mode="wait">
                <motion.div
                    key={status}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex-shrink-0"
                >
                    {icon}
                </motion.div>
            </AnimatePresence>
            <span>{text}</span>
        </div>
    );
};

export default SaveStatusIcon;