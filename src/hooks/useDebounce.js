import { useState, useEffect } from 'react';

// Custom hook untuk menunda eksekusi fungsi hingga user berhenti mengetik
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        // Batalkan timeout jika value berubah (user masih mengetik)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

export default useDebounce;