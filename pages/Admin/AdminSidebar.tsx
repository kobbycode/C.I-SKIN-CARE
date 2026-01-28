
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AdminSidebarProps {
  onMobileClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onMobileClose }) => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: 'grid_view', path: '/admin' },
    { label: 'Inventory', icon: 'inventory_2', path: '/admin/inventory' },
    { label: 'Categories', icon: 'category', path: '/admin/categories' },
    { label: 'FAQ Manager', icon: 'quiz', path: '/admin/faqs' },
    { label: 'Skin Journal', icon: 'edit_note', path: '/admin/journal' },
    { label: 'Orders', icon: 'shopping_cart', path: '/admin/orders' },
    { label: 'Customers', icon: 'group', path: '/admin/customers' },
    { label: 'Reviews', icon: 'star', path: '/admin/reviews' },
    { label: 'Site Settings', icon: 'settings', path: '/admin/settings' },
    { label: 'Staff & Roles', icon: 'admin_panel_settings', path: '/admin/users' },
    { label: 'Account', icon: 'manage_accounts', path: '/admin/account' }
  ];

  return (
    <aside className="w-72 lg:w-64 bg-[#221C1D] text-white flex flex-col h-full shrink-0 shadow-2xl lg:shadow-none">
      <div className="p-8 flex flex-col h-full relative">
        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden absolute top-6 right-6 p-2 text-stone-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <Link to="/admin" className="flex items-center gap-3 group mb-12">
          <img src="/logo.jpg" alt="C.I Skin Care" className="w-10 h-10 rounded-lg object-cover" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-wider">C.I SKIN CARE</h1>
            <p className="text-[10px] text-[#A68966] font-medium uppercase tracking-widest">Management Suite</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-2 grow">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                  ? 'bg-[#3D342F] text-[#F2A600] font-semibold border-l-4 border-[#F2A600]'
                  : 'text-stone-400 hover:bg-stone-800 hover:text-white'
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {item.icon}
                </span>
                <p className="text-sm">{item.label}</p>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-6">
          <Link
            to="/admin/inventory/add"
            onClick={onMobileClose}
            className="w-full bg-[#F2A600] text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-white transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            <span className="text-sm uppercase tracking-wider">New Product</span>
          </Link>

          <div className="pt-6 border-t border-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center text-stone-500">
              <span className="material-symbols-outlined text-lg">account_circle</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">System Admin</p>
              <p className="text-[9px] text-stone-600 uppercase truncate">Access Level 1</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
