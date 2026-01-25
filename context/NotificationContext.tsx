import React, { createContext, useContext, useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000); // Auto dismiss after 4 seconds
    }, []);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {/* Notification Toast Container */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                {notifications.map(notification => (
                    <div
                        key={notification.id}
                        className={`
                pointer-events-auto
                min-w-[300px] max-w-sm
                p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] 
                border-l-4 
                flex items-start gap-3
                bg-white dark:bg-stone-900
                animate-in slide-in-from-right fade-in duration-300
                transition-all
                ${notification.type === 'success' ? 'border-green-500' :
                                notification.type === 'error' ? 'border-red-500' : 'border-[#F2A600]'}
            `}
                    >
                        <div className={`mt-0.5
                ${notification.type === 'success' ? 'text-green-500' :
                                notification.type === 'error' ? 'text-red-500' : 'text-[#F2A600]'}
             `}>
                            <span className="material-symbols-outlined text-xl">
                                {notification.type === 'success' ? 'check_circle' :
                                    notification.type === 'error' ? 'error' : 'info'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1
                    ${notification.type === 'success' ? 'text-green-600' :
                                    notification.type === 'error' ? 'text-red-600' : 'text-[#F2A600]'}
                 `}>
                                {notification.type}
                            </h4>
                            <p className="text-sm font-medium text-stone-700 dark:text-stone-300 leading-snug">
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-stone-400 hover:text-stone-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
