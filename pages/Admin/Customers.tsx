import { useState, useMemo } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useUser } from '../../context/UserContext';
import { useOrders } from '../../context/OrderContext';

const Customers: React.FC = () => {
    const { allUsers, loading: usersLoading } = useUser();
    const { orders, loading: ordersLoading } = useOrders();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeSkinFilter, setActiveSkinFilter] = useState('All');

    const loading = usersLoading || ordersLoading;

    const getUserLTV = (email: string) => {
        return orders
            .filter(o => o.customerEmail === email)
            .reduce((sum, o) => sum + o.total, 0);
    };

    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => {
            const matchesSearch = u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesSkin = activeSkinFilter === 'All' || u.skinType === activeSkinFilter;

            let matchesTab = true;
            if (activeFilter === 'VIP') matchesTab = u.points > 1000;
            // 'New' could be based on registration date, for now we just show all

            return matchesSearch && matchesSkin && matchesTab;
        });
    }, [allUsers, searchQuery, activeSkinFilter, activeFilter]);

    const stats = useMemo(() => [
        { label: 'Total Customers', value: allUsers.length.toLocaleString(), trend: '+0%', sub: 'Global clientele' },
        { label: 'Avg. LTV', value: 'GH₵' + (allUsers.length ? (allUsers.reduce((sum, u) => sum + getUserLTV(u.email), 0) / allUsers.length).toFixed(2) : '0'), trend: '+0%', sub: 'Lifetime average' },
        { label: 'Loyalty Members', value: allUsers.filter(u => u.points > 0).length.toString(), trend: 'Active', sub: 'In ritual program' }
    ], [allUsers, orders]);

    const selectedUser = useMemo(() =>
        allUsers.find(u => u.id === selectedUserId) || allUsers[0],
        [allUsers, selectedUserId]);

    if (loading) return <div className="p-20 text-center uppercase tracking-widest opacity-30">Consulting Member Ledgers...</div>;

    return (
        <AdminLayout>
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">Customer Relations</h2>
                            <p className="text-stone-500 text-sm md:text-base">Manage your luxury clientele, loyalty tiers, and skin profile data.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider border border-stone-200 hover:bg-stone-50 transition-colors">
                                <span className="material-symbols-outlined text-sm">download</span>
                                Export
                            </button>
                            <button className="flex-2 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-[#F2A600] text-black hover:bg-[#D49100] transition-colors rounded shadow-sm">
                                <span className="material-symbols-outlined text-sm">person_add</span>
                                Add Customer
                            </button>
                        </div>
                    </header>

                    {/* Customer Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {stats.map((stat, i) => (
                            <div key={i} className="p-6 bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 text-green-600">
                                        {stat.trend}
                                    </span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-[#221C1D] mb-1">{stat.value}</h3>
                                <p className="text-[10px] text-stone-400">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white border border-stone-100 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden mb-8">
                        <div className="p-6 border-b border-stone-50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-none lg:max-w-md">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-300">search</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search customers..."
                                    className="w-full pl-12 pr-4 py-2.5 bg-stone-50 border border-transparent rounded-lg text-xs focus:outline-none focus:border-[#F2A600] transition-colors"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['All', 'VIP', 'New'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setActiveFilter(f)}
                                        className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold rounded-lg transition-all ${activeFilter === f ? 'bg-stone-50 border border-stone-100 text-[#221C1D]' : 'text-stone-400 hover:bg-stone-50'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-stone-50/50 flex gap-3 overflow-x-auto no-scrollbar border-t border-stone-50">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center mr-2 whitespace-nowrap">Skin Types:</span>
                            {['All', 'Oily', 'Dry', 'Combination', 'Sensitive'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setActiveSkinFilter(type)}
                                    className={`px-4 py-1.5 border rounded-full text-[9px] font-bold transition-all whitespace-nowrap ${activeSkinFilter === type ? 'bg-[#221C1D] text-[#F2A600] border-[#F2A600]' : 'bg-white border-stone-100 text-stone-600 hover:border-[#F2A600]'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Customer Table */}
                    <div className="bg-white border border-stone-100 rounded-xl overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                        <div className="md:hidden divide-y divide-stone-50">
                            {filteredUsers.map((c) => (
                                <div key={c.id} onClick={() => setSelectedUserId(c.id)} className={`p-6 space-y-4 transition-colors cursor-pointer ${selectedUserId === c.id ? 'bg-stone-50' : 'active:bg-stone-50'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-400">
                                                {c.fullName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-[#221C1D] truncate">{c.fullName}</span>
                                                <span className="text-[10px] text-stone-400 font-medium truncate">{c.email}</span>
                                            </div>
                                        </div>
                                        <span className="px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest bg-stone-50 text-stone-600">
                                            {c.skinType}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-stone-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Skin Type</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Points</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">LTV</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {filteredUsers.map((c) => (
                                        <tr key={c.id} onClick={() => setSelectedUserId(c.id)} className={`hover:bg-stone-50/50 transition-colors cursor-pointer ${selectedUserId === c.id ? 'bg-stone-50' : ''}`}>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-400">
                                                        {c.fullName.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-[#221C1D]">{c.fullName}</span>
                                                        <span className="text-[10px] text-stone-400">{c.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest bg-stone-50 text-stone-600">
                                                    {c.skinType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-bold text-[#221C1D]">{c.points}</td>
                                            <td className="px-6 py-5 text-sm font-bold text-[#221C1D]">GH₵{getUserLTV(c.email).toFixed(2)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <button className="p-2 text-stone-300 hover:text-[#F2A600] transition-colors"><span className="material-symbols-outlined">visibility</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Profile Detail Sidebar */}
                {selectedUser && (
                    <div className="w-full xl:w-[400px] shrink-0">
                        <div className="bg-white border border-stone-100 rounded-xl p-8 sticky top-8">
                            <h3 className="text-xl font-bold mb-4">{selectedUser.fullName}</h3>
                            <p className="text-stone-500 mb-6">{selectedUser.email}</p>
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-stone-400 text-sm">Skin Type</span>
                                    <span className="font-bold text-sm">{selectedUser.skinType}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-stone-400 text-sm">Points</span>
                                    <span className="font-bold text-sm text-[#F2A600]">{selectedUser.points}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Customers;
