import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';

const Customers: React.FC = () => {
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
                        {[
                            { label: 'Total Customers', value: '12,482', trend: '+12.4%', sub: 'Global clientele' },
                            { label: 'Avg. LTV', value: 'GH₵840.50', trend: '+5.2%', sub: 'Last 12 months' },
                            { label: 'Active Tickets', value: '14', trend: 'Urgent', sub: 'Pending support', isUrgent: true }
                        ].map((stat, i) => (
                            <div key={i} className="p-6 bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.isUrgent ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
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
                                <input type="text" placeholder="Search customers..." className="w-full pl-12 pr-4 py-2.5 bg-stone-50 border border-transparent rounded-lg text-xs focus:outline-none focus:border-[#F2A600] transition-colors" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['All', 'VIP', 'New'].map((f, i) => (
                                    <button key={f} className={`flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold rounded-lg transition-all ${i === 0 ? 'bg-stone-50 border border-stone-100 text-[#221C1D]' : 'text-stone-400 hover:bg-stone-50'}`}>
                                        {f}
                                    </button>
                                ))}
                                <button className="flex-1 sm:flex-none px-4 py-2 text-[10px] font-bold text-[#221C1D] flex items-center justify-center gap-2 hover:bg-stone-50 rounded-lg">
                                    <span className="material-symbols-outlined text-lg">tune</span>
                                    Filters
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-stone-50/50 flex gap-3 overflow-x-auto no-scrollbar border-t border-stone-50">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center mr-2 whitespace-nowrap">Skin Types:</span>
                            {['Oily', 'Dry', 'Combination', 'Sensitive'].map(type => (
                                <button key={type} className="px-4 py-1.5 bg-white border border-stone-100 rounded-full text-[9px] font-bold text-stone-600 hover:border-[#F2A600] hover:text-[#F2A600] transition-all whitespace-nowrap">
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Customer Table */}
                    <div className="bg-white border border-stone-100 rounded-xl overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                        <div className="md:hidden divide-y divide-stone-50">
                            {[
                                { name: 'Sophia Williams', email: 'sophia.w@email.com', type: 'Sensitive', value: 'GH₵2,450', points: '1,240' },
                                { name: 'Marcus Thorne', email: 'm.thorne@luxury.com', type: 'Oily', value: 'GH₵1,120', points: '640' },
                                { name: 'Amara Okafor', email: 'amara.o@lifestyle.me', type: 'Combination', value: 'GH₵3,890', points: '2,800' }
                            ].map((c, i) => (
                                <div key={i} className="p-6 space-y-4 active:bg-stone-50 transition-colors cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-cover shadow-sm" style={{ backgroundImage: `url('https://i.pravatar.cc/150?u=${c.name}')` }}></div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-[#221C1D] truncate">{c.name}</span>
                                                <span className="text-[10px] text-stone-400 font-medium truncate">{c.email}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${i === 0 ? 'bg-amber-50 text-amber-700' :
                                            i === 1 ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                            }`}>
                                            {c.type}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-stone-50">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mb-1">Lifetime Value</span>
                                            <span className="text-sm font-bold text-[#221C1D]">{c.value}</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mb-1">Ritual Points</span>
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="material-symbols-outlined text-[10px] text-[#F2A600]">stars</span>
                                                <span className="text-sm font-bold text-[#221C1D]">{c.points}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-stone-50/30">
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Skin Type</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">LTV</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Loyalty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {[
                                        { name: 'Sophia Williams', email: 'sophia.w@email.com', type: 'Sensitive', value: 'GH₵2,450', points: '1,240' },
                                        { name: 'Marcus Thorne', email: 'm.thorne@luxury.com', type: 'Oily', value: 'GH₵1,120', points: '640' },
                                        { name: 'Amara Okafor', email: 'amara.o@lifestyle.me', type: 'Combination', value: 'GH₵3,890', points: '2,800' }
                                    ].map((c, i) => (
                                        <tr key={i} className={`hover:bg-stone-50/50 transition-colors cursor-pointer ${i === 0 ? 'bg-stone-50/30' : ''}`}>
                                            <td className="px-4 md:px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-cover flex-shrink-0" style={{ backgroundImage: `url('https://i.pravatar.cc/150?u=${c.name}')` }}></div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-[#221C1D] truncate">{c.name}</span>
                                                        <span className="text-[10px] text-stone-400 truncate">{c.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${i === 0 ? 'bg-amber-50 text-amber-700' :
                                                    i === 1 ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                                                    }`}>
                                                    {c.type}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-5 text-sm font-bold text-[#221C1D]">{c.value}</td>
                                            <td className="px-4 md:px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm text-[#F2A600]">stars</span>
                                                    <span className="text-sm font-bold text-[#221C1D]">{c.points}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Profile Side Pane - Responsive */}
                <div className="w-full xl:w-96 bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-fit sticky top-0">
                    <div className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-10">
                            <h4 className="text-xl font-bold text-[#221C1D]">Quick Profile</h4>
                            <button className="lg:hidden text-stone-300 hover:text-stone-600"><span className="material-symbols-outlined">close</span></button>
                        </div>

                        <div className="text-center mb-10">
                            <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-stone-50 p-1">
                                <img src="https://i.pravatar.cc/150?u=Sophia%20Williams" className="w-full h-full rounded-full object-cover shadow-sm" alt="Profile" />
                            </div>
                            <h5 className="text-lg font-bold text-[#221C1D]">Sophia Williams</h5>
                            <p className="text-xs text-stone-400 uppercase tracking-widest font-medium">VIP Member</p>
                            <div className="flex justify-center gap-2 mt-6">
                                <button className="flex-1 px-4 py-2 bg-stone-50 text-[10px] font-bold rounded-lg border border-stone-100 hover:bg-stone-100 transition-colors">Edit</button>
                                <button className="flex-1 px-4 py-2 bg-stone-50 text-[10px] font-bold rounded-lg border border-stone-100 hover:bg-stone-100 transition-colors">Reset</button>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <h6 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Skin Profile</h6>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Type', val: 'Sensitive' },
                                        { label: 'Concern', val: 'Redness' },
                                        { label: 'Sun Sens.', val: 'High' },
                                        { label: 'Age', val: '25 - 34' }
                                    ].map(info => (
                                        <div key={info.label} className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                                            <p className="text-[8px] text-stone-400 font-bold uppercase mb-0.5">{info.label}</p>
                                            <p className="text-[10px] font-bold text-stone-800">{info.val}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4 text-[10px] font-bold uppercase tracking-widest">
                                    <h6 className="text-stone-400">Loyalty Status</h6>
                                    <span className="text-[#F2A600]">Gold Ritual</span>
                                </div>
                                <div className="p-5 bg-stone-50/50 border border-stone-100 rounded-2xl">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-[8px] font-bold text-stone-400 uppercase mb-0.5">Balance</p>
                                            <p className="text-xl font-bold text-[#221C1D]">1,240 <span className="text-[10px] font-semibold text-stone-400">PTS</span></p>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-stone-200 rounded-full overflow-hidden mb-2 shadow-inner">
                                        <div className="h-full bg-[#F2A600] w-[75%] rounded-full transition-all duration-1000" />
                                    </div>
                                    <p className="text-[8px] text-stone-400 font-medium text-center italic">260 points away from Platinum Ritual</p>
                                </div>
                            </div>

                            <button className="w-full bg-[#221C1D] text-white py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md group">
                                View Full History
                                <span className="material-symbols-outlined text-sm ml-2 align-middle transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Customers;
