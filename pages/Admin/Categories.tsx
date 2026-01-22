import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';

const Categories: React.FC = () => {
    return (
        <AdminLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">Taxonomy & Hierarchy</h2>
                    <p className="text-stone-500 text-sm md:text-base">Manage collection categories as they appear on the digital storefront.</p>
                </div>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-[#221C1D] text-white hover:bg-black transition-colors rounded shadow-sm">
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Category
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
                {/* Main Categories List */}
                <div className="xl:col-span-8">
                    <div className="bg-white border border-stone-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="md:hidden divide-y divide-stone-50">
                            {[
                                { name: 'Cleansers', count: 12, status: 'Active' },
                                { name: 'Serums & Elixirs', count: 24, status: 'Active' },
                                { name: 'Moisturizers', count: 18, status: 'Active' },
                                { name: 'Treatments', count: 9, status: 'Active' },
                                { name: 'Collections', count: 6, status: 'Seasonal' }
                            ].map((cat, i) => (
                                <div key={i} className="p-6 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="material-symbols-outlined text-stone-200">drag_indicator</span>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-[#221C1D] truncate">{cat.name}</span>
                                            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest truncate">
                                                {cat.count} Products • /{cat.name.toLowerCase().replace(/[^a-z]/g, '-')}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`flex-shrink-0 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${cat.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {cat.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left min-w-[500px]">
                                <thead>
                                    <tr className="bg-stone-50/50">
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest w-16">Ord</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Items</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">State</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {[
                                        { name: 'Cleansers', count: 12, status: 'Active' },
                                        { name: 'Serums & Elixirs', count: 24, status: 'Active' },
                                        { name: 'Moisturizers', count: 18, status: 'Active' },
                                        { name: 'Treatments', count: 9, status: 'Active' },
                                        { name: 'Collections', count: 6, status: 'Seasonal' }
                                    ].map((cat, i) => (
                                        <tr key={i} className="hover:bg-stone-50/50 transition-colors group">
                                            <td className="px-6 py-5">
                                                <span className="material-symbols-outlined text-stone-200 cursor-grab group-hover:text-stone-400">drag_indicator</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-[#221C1D] truncate">{cat.name}</span>
                                                    <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest truncate">/{cat.name.toLowerCase().replace(/[^a-z]/g, '-')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-xs text-stone-500 font-bold text-center whitespace-nowrap">{cat.count}</td>
                                            <td className="px-6 py-5 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${cat.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                                    {cat.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Taxonomy Rules Sidebar - Responsive */}
                <div className="xl:col-span-4 space-y-8">
                    <section className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4">Display Logic</h3>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Nav Mode</p>
                                <span className="text-[10px] font-bold text-[#221C1D]">Dropdown Multi</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Sync Status</p>
                                <span className="text-[10px] font-bold text-green-600 uppercase">Live</span>
                            </div>
                        </div>
                        <button className="w-full py-3 border border-stone-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-all">
                            Global Schema
                        </button>
                    </section>

                    <section className="p-6 bg-[#221C1D] text-white rounded-2xl shadow-lg border-t-4 border-[#F2A600]">
                        <div className="flex gap-3 mb-4 items-center">
                            <span className="material-symbols-outlined text-[#F2A600]">schema</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest">SEO Tip</p>
                        </div>
                        <p className="text-[10px] text-stone-400 leading-relaxed uppercase tracking-tighter">
                            Hierarchy directly influences breadcrumbs. Logical parent-child relationships improve crawler efficiency and user ritual navigation.
                        </p>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Categories;
