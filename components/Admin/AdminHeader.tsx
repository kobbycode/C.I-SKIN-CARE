
import React from 'react';

interface AdminHeaderProps {
    onMenuClick: () => void;
    title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick, title = "Management Suite" }) => {
    return (
        <header className="lg:hidden bg-[#221C1D] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 hover:bg-stone-800 rounded-lg transition-colors"
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
                <button className="p-2 hover:bg-stone-800 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-xl text-stone-400">notifications</span>
                </button>
                <div className="w-8 h-8 rounded-full bg-cover bg-center border border-stone-800 shadow-inner" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&auto=format&fit=crop')" }}></div>
            </div>
        </header>
    );
};

export default AdminHeader;
