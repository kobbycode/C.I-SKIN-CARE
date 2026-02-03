import React from 'react';
import { useUser } from '../../context/UserContext';
import NotificationBell from '../NotificationBell';

interface AdminHeaderProps {
    onMenuClick: () => void;
    title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick, title = "Management Suite" }) => {
    const { currentUser } = useUser();

    return (
        <header className="bg-[#221C1D] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-[50] shadow-md border-b border-stone-800">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 hover:bg-stone-800 rounded-lg transition-colors"
                    aria-label="Open Menu"
                >
                    <span className="material-symbols-outlined text-2xl">menu</span>
                </button>
                <div className="flex items-center gap-2">
                    <img src="/logo.jpg" alt="C.I" className="w-8 h-8 rounded-lg object-cover" />
                    <h1 className="text-xs font-bold tracking-wider uppercase">{title}</h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationBell />
                <div className="flex flex-col items-end">
                    <p className="text-[10px] font-bold tracking-wider">{currentUser?.fullName}</p>
                    <p className="text-[8px] text-stone-500 lowercase">{currentUser?.email}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-cover bg-center border border-stone-800 shadow-inner overflow-hidden"
                    style={{ backgroundImage: currentUser?.avatar ? `url('${currentUser.avatar}')` : 'none' }}>
                    {!currentUser?.avatar && <span className="material-symbols-outlined text-stone-600 flex items-center justify-center h-full">account_circle</span>}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
