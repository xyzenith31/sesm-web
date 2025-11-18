import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiPlus, FiTrash2, FiLoader } from 'react-icons/fi';
import DataService from '../../services/dataService'; 

const CalenderModal = ({ isOpen, onClose }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [agendas, setAgendas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newAgendaTitle, setNewAgendaTitle] = useState('');

    const fetchAgendas = useCallback(() => {
        setLoading(true);
        const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).toISOString().split('T')[0];
        DataService.getAgendas(startOfMonth, endOfMonth)
            .then(response => setAgendas(response.data))
            .catch(err => console.error("Gagal memuat agenda:", err))
            .finally(() => setLoading(false));
    }, [viewDate]);

    useEffect(() => {
        fetchAgendas();
    }, [fetchAgendas]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const today = new Date();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

    const handleAddAgenda = async (e) => {
        e.preventDefault();
        if (!newAgendaTitle.trim()) return;
        const agendaData = {
            title: newAgendaTitle,
            date: selectedDate.toISOString().split('T')[0],
        };
        try {
            await DataService.createAgenda(agendaData);
            setNewAgendaTitle('');
            fetchAgendas();
        } catch (error) {
            alert("Gagal menyimpan agenda.");
        }
    };

    const handleDeleteAgenda = async (agendaId) => {
        if (window.confirm("Yakin ingin menghapus agenda ini?")) {
            try {
                await DataService.deleteAgenda(agendaId);
                fetchAgendas();
            } catch (error) {
                alert("Gagal menghapus agenda.");
            }
        }
    };

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) { calendarDays.push(<div key={`empty-${i}`} className="w-10 h-10"></div>); }
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const isToday = date.toDateString() === today.toDateString();
        const isSelected = date.toDateString() === selectedDate.toDateString();
        const dayAgendas = agendas.filter(a => new Date(a.date).toDateString() === date.toDateString());

        calendarDays.push(
            <div key={day} onClick={() => setSelectedDate(date)} className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all cursor-pointer relative ${isSelected ? 'bg-blue-500 text-white shadow-lg' : ''} ${!isSelected && isToday ? 'bg-gray-700 text-white' : ''} ${!isSelected && !isToday ? 'hover:bg-gray-600' : ''}`}>
                {day}
                {dayAgendas.length > 0 && <div className="absolute bottom-1 w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>}
            </div>
        );
    }
    const selectedDayAgendas = agendas.filter(a => new Date(a.date).toDateString() === selectedDate.toDateString());

    const changeMonth = (amount) => setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
    const goToToday = () => { setViewDate(new Date()); setSelectedDate(new Date()); };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-[100] flex items-start justify-end" onClick={onClose}>
                    <motion.div initial={{ x: "100%" }} animate={{ x: "0%" }} exit={{ x: "100%" }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="bg-[#2d2d2d] text-white rounded-l-lg w-full max-w-sm shadow-2xl h-auto m-4 mt-16 flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="font-semibold text-lg">{selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
                            <p className="text-3xl font-light tracking-wider">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-lg">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-gray-700"><FiChevronLeft/></button>
                                    <button onClick={goToToday} className="p-1.5 rounded-full hover:bg-gray-700 text-xs font-bold">Hari Ini</button>
                                    <button onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-gray-700"><FiChevronRight/></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-7 gap-y-2 place-items-center">
                                {dayNames.map(day => <div key={day} className="text-xs font-bold text-gray-400 w-10 h-10 flex items-center justify-center">{day}</div>)}
                                {calendarDays}
                            </div>
                        </div>
                        <div className="flex-grow p-4 border-t border-gray-700 bg-black/20">
                            <h4 className="font-semibold mb-2">Agenda untuk {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</h4>
                            {loading ? <div className="flex justify-center"><FiLoader className="animate-spin"/></div> : (
                                <div className="space-y-2 text-sm max-h-24 overflow-y-auto pr-2">
                                    {selectedDayAgendas.length > 0 ? selectedDayAgendas.map(agenda => (
                                        <div key={agenda.id} className="p-2 bg-blue-500/20 rounded-md flex justify-between items-center">
                                            <span>{agenda.title}</span>
                                            <button onClick={() => handleDeleteAgenda(agenda.id)} className="text-red-400 hover:text-red-200"><FiTrash2 size={14}/></button>
                                        </div>
                                    )) : <p className="text-xs text-gray-400 text-center py-2">Tidak ada agenda.</p>}
                                </div>
                            )}
                            <form onSubmit={handleAddAgenda} className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
                                <input type="text" value={newAgendaTitle} onChange={(e) => setNewAgendaTitle(e.target.value)} placeholder="Agenda baru..." className="w-full bg-gray-700 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"/>
                                <button type="submit" className="p-2 bg-blue-500 rounded-md hover:bg-blue-600"><FiPlus/></button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default CalenderModal;