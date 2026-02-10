import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import socket from '../api/socket';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        socket.on('notification', (data) => {
            // Check if for this user or generic
            // For now, assuming generic or checking user in component would be better
            // But data.userId should match current user. 
            // Since we don't have user context here easily without circle dependency (AuthContext uses this?)
            // Let's just toast if we receive it. Ideally we pass user ID to a "register" socket event.
            // Simplified:
            if (data.type === 'comment') addNotification("New comment on an issue", 'info');
            else addNotification("You have a new notification", 'info');
        });

        return () => socket.off('notification');
    }, []);

    const addNotification = useCallback((message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const success = (msg) => addNotification(msg, 'success');
    const error = (msg) => addNotification(msg, 'error');
    const info = (msg) => addNotification(msg, 'info');

    return (
        <NotificationContext.Provider value={{ success, error, info }}>
            {children}
            
            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[9999] space-y-2 flex flex-col items-end pointer-events-none">
                {notifications.map(n => (
                    <div 
                        key={n.id}
                        className={`
                            pointer-events-auto transform transition-all duration-300 ease-out translate-x-0 opacity-100 flex items-center p-4 min-w-[300px] border shadow-lg
                            ${n.type === 'success' ? 'bg-corporate-bg border-green-500 text-corporate-text' : 
                              n.type === 'error' ? 'bg-corporate-bg border-red-500 text-corporate-text' : 
                              'bg-corporate-bg border-corporate-text text-corporate-text'}
                        `}
                    >
                        <div className={`mr-3 ${
                            n.type === 'success' ? 'text-green-500' :
                            n.type === 'error' ? 'text-red-500' :
                            'text-corporate-text'
                        }`}>
                            {n.type === 'success' && <CheckCircle size={20} />}
                            {n.type === 'error' && <AlertCircle size={20} />}
                            {n.type === 'info' && <Info size={20} />}
                        </div>
                        <p className="text-sm font-medium flex-1">{n.message}</p>
                        <button 
                            onClick={() => removeNotification(n.id)}
                            className="ml-4 text-corporate-muted hover:text-corporate-text transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
