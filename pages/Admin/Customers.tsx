import { useState, useMemo } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useUser } from '../../context/UserContext';
import { useOrders } from '../../context/OrderContext';
import { AdminSkeleton } from '../../components/Skeletons';

const Customers: React.FC = () => {
    const { allUsers, loading: usersLoading } = useUser();
    const { orders, loading: ordersLoading } = useOrders();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [activeSkinFilter, setActiveSkinFilter] = useState('All');
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
            if (activeFilter === 'New') {
                const joinDate = new Date(u.joinedDate);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                matchesTab = joinDate >= thirtyDaysAgo;
            }

            return matchesSearch && matchesSkin && matchesTab;
        });
    }, [allUsers, searchQuery, activeSkinFilter, activeFilter]);

    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        const usersThisMonth = allUsers.filter(u => {
            const d = new Date(u.joinedDate);
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;

        const usersLastMonth = allUsers.filter(u => {
            const d = new Date(u.joinedDate);
            // Handle January
            const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
            const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
            return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
        }).length;

        // Total Customers Trend
        const customerTrend = usersLastMonth === 0
            ? (usersThisMonth > 0 ? '+100%' : '0%')
            : `${(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100).toFixed(1)}%`;

        // Avg LTV
        const totalLTV = allUsers.reduce((sum, u) => sum + getUserLTV(u.email), 0);
        const avgLTV = allUsers.length ? totalLTV / allUsers.length : 0;

        // Loyalty members trend (Active if > 0)
        const loyaltyMembers = allUsers.filter(u => u.points > 0).length;

        return [
            {
                label: 'Total Customers',
                value: allUsers.length.toLocaleString(),
                trend: customerTrend,
                sub: `${usersThisMonth} new this month`,
                trendUp: usersThisMonth >= usersLastMonth
            },
            {
                label: 'Avg. LTV',
                value: 'GH₵' + avgLTV.toFixed(2),
                trend: '+0%',
                sub: 'Across all clientele',
                trendUp: true
            },
            {
                label: 'Loyalty Members',
                value: loyaltyMembers.toString(),
                trend: loyaltyMembers > 0 ? 'Active' : 'Neutral',
                sub: 'In ritual program',
                trendUp: loyaltyMembers > 0
            }
        ];
    }, [allUsers, orders]);

    const selectedUser = useMemo(() => {
        if (filteredUsers.length > 0) {
            return allUsers.find(u => u.id === selectedUserId) || filteredUsers[0];
        }
        return null;
    }, [allUsers, filteredUsers, selectedUserId]);

    const selectedUserOrders = useMemo(() => {
        if (!selectedUser) return [];
        return orders.filter(o => o.customerEmail === selectedUser.email);
    }, [orders, selectedUser]);


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
                    {loading ? <AdminSkeleton /> : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                {stats.map((stat, i) => (
                                    <div key={i} className="p-6 bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-stone-50 text-stone-400'}`}>
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
                                    {filteredUsers.length > 0 ? filteredUsers.map((c) => (
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
                                    )) : (
                                        <div className="p-10 text-center text-stone-400 italic">No customers found in the archive.</div>
                                    )}
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
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedUserId(c.id); }}
                                                            className="p-2 text-stone-300 hover:text-[#F2A600] transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined">visibility</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Profile Detail Sidebar */}
                <div className="w-full xl:w-[400px] shrink-0">
                    {selectedUser ? (
                        <div className="bg-white border border-stone-100 rounded-xl p-8 sticky top-8 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-xl font-bold text-stone-400 shadow-inner">
                                    {selectedUser.fullName.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs text-stone-400 italic">{selectedUser.pointsTier || 'Base Ritual'}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-4 bg-stone-50 rounded-xl space-y-3">
                                    <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Skin Profile</span>
                                        <span className="px-2 py-0.5 bg-white rounded text-[10px] font-bold text-stone-600">{selectedUser.skinType}</span>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Skin Type Detail</p>
                                        <p className="text-xs text-stone-600 font-medium">{selectedUser.skinTypeDetail || 'Not Provided'}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Loyalty Points</span>
                                        <span className="text-sm font-bold text-[#F2A600]">{selectedUser.points}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">To Next Tier</span>
                                        <span className="text-xs font-bold text-stone-600">{selectedUser.pointsToNextTier ?? 0}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Member Since</p>
                                        <p className="text-xs text-stone-600 font-medium">{selectedUser.joinedDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Primary Email</p>
                                        <p className="text-xs text-stone-600 font-medium truncate">{selectedUser.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Focus Ritual</p>
                                        <p className="text-xs text-stone-600 font-medium">{selectedUser.focusRitual || 'Not Selected'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Focus Ritual Detail</p>
                                        <p className="text-xs text-stone-600 font-medium">{selectedUser.focusRitualDetail || 'Not Provided'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Delivery Address</p>
                                        <p className="text-xs text-stone-600 font-medium break-words">
                                            {selectedUser.deliveryAddress || 'Not Provided'}
                                        </p>
                                        <p className="text-xs text-stone-600 font-medium">
                                            {[selectedUser.deliveryCity, selectedUser.deliveryState, selectedUser.deliveryZipCode].filter(Boolean).join(', ') || ''}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Delivery Phone</p>
                                            <p className="text-xs text-stone-600 font-medium">{selectedUser.deliveryPhone || 'Not Provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Landmark</p>
                                            <p className="text-xs text-stone-600 font-medium">{selectedUser.deliveryLandmark || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-2">Delivery Instructions</p>
                                        <p className="text-xs text-stone-600 font-medium break-words">{selectedUser.deliveryInstructions || 'Not Provided'}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsHistoryOpen(true)}
                                    className="w-full mt-4 py-3 bg-[#221C1D] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-sm"
                                >
                                    View Full History
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-stone-100 rounded-xl p-12 text-center sticky top-8">
                            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
                                <span className="material-symbols-outlined text-3xl">account_circle</span>
                            </div>
                            <h4 className="text-lg font-bold text-[#221C1D] mb-2 uppercase tracking-widest">No Selection</h4>
                            <p className="text-xs text-stone-400 leading-relaxed italic">Select a customer from the registry to view their skincare journey.</p>
                        </div>
                    )}
                </div>
            </div >
            {
                isHistoryOpen && selectedUser && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl">
                            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold text-[#221C1D]">Order History</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{selectedUser.fullName}</p>
                                </div>
                                <button onClick={() => setIsHistoryOpen(false)} className="text-stone-400 hover:text-stone-600">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                                {selectedUserOrders.length === 0 ? (
                                    <div className="py-20 text-center opacity-40 italic">No orders found for this customer.</div>
                                ) : (
                                    selectedUserOrders.map((o) => (
                                        <div key={o.id} className="border border-stone-100 rounded-xl p-4 bg-stone-50">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-sm font-bold text-[#221C1D]">#{o.id.slice(-6)}</p>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{o.date} • {o.time}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-white border border-stone-100 text-stone-600">{o.status}</span>
                                                <p className="text-sm font-bold text-[#221C1D]">GH₵{o.total.toFixed(2)}</p>
                                            </div>
                                            <div className="mt-3 text-xs text-stone-600">
                                                <p className="font-medium">Items: {o.items.length}</p>
                                                <p className="font-medium">Shipping: {o.shippingAddress}</p>
                                                {o.paymentMethod && <p className="font-medium">Payment: {o.paymentMethod}</p>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-6 border-t border-stone-100 flex justify-end">
                                <button onClick={() => setIsHistoryOpen(false)} className="px-4 py-2 border border-stone-200 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-all">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </AdminLayout >
    );
};

export default Customers;
