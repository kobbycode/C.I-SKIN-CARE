import React, { useState, useRef, useEffect } from 'react';
import { useInAppNotifications } from '../context/InAppNotificationContext';
import { Link, useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useInAppNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (id: string, link?: string) => {
        await markAsRead(id);
        setIsOpen(false);
        if (link) {
            navigate(link);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // Less than an hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins}m ago`;
        }
        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }
        return date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
            >
                <span className="material-symbols-outlined text-xl">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-stone-950"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-900/50 backdrop-blur-sm">
                        <h3 className="font-bold text-sm text-stone-800 dark:text-stone-200">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-[10px] font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center opacity-40">
                                <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                                <p className="text-xs">No notifications yet</p>
                            </div>
                        ) : (
                            <ul>
                                {notifications.map((notification) => (
                                    <li
                                        key={notification.id}
                                        className={`border-b border-stone-100 dark:border-stone-800 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer group ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                        onClick={() => handleNotificationClick(notification.id, notification.link)}
                                    >
                                        <div className="p-4 flex gap-4">
                                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!notification.read ? 'bg-accent' : 'bg-transparent'}`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <h4 className={`text-sm ${!notification.read ? 'font-bold text-stone-900 dark:text-white' : 'font-medium text-stone-600 dark:text-stone-400'}`}>
                                                        {notification.title}
                                                    </h4>
                                                    <span className="text-[10px] text-stone-400 whitespace-nowrap">{formatTime(notification.date)}</span>
                                                </div>
                                                <p className="text-xs text-stone-500 dark:text-stone-500 line-clamp-2 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-500 transition-all self-start"
                                                title="Delete"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
