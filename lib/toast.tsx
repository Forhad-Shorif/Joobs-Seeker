import { toast } from 'react-toastify';

const cleanStyle = {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '600' as const,
    padding: '12px 18px',
    maxWidth: '340px',
    width: 'fit-content',
    margin: '0 auto',
};

export const showToast = {
    success: (msg: string) => toast.success(msg, { 
        position: "top-center", 
        autoClose: 1500,
        hideProgressBar: true, 
        closeButton: false, 
        style: { ...cleanStyle, color: '#16a34a' } 
    }),
    error: (msg: string) => toast.error(msg, { 
        position: "top-center", 
        autoClose: 2000,
        hideProgressBar: true, 
        closeButton: false, 
        style: { ...cleanStyle, color: '#dc2626' } 
    })
};