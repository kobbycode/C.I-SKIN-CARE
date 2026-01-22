import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';

const FAQManager: React.FC = () => {
    return (
        <AdminLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">Knowledge Base</h2>
                    <p className="text-stone-500 text-sm md:text-base">Manage frequently asked questions and concierge support guidance.</p>
                </div>
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-[#221C1D] text-white hover:bg-black transition-colors rounded shadow-sm">
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Question
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
                {/* Main FAQ List */}
                <div className="xl:col-span-8">
                    <div className="space-y-6">
                        {[
                            {
                                q: "Are C.I SKIN CARE products safe for sensitive skin?",
                                category: "Safety",
                                status: "Public",
                                views: "1.2k"
                            },
                            {
                                q: "What is the typical shelf life of the botanical serums?",
                                category: "Product Care",
                                status: "Public",
                                views: "856"
                            },
                            {
                                q: "Do you use synthetic fragrances? ",
                                category: "Ingredients",
                                status: "Public",
                                views: "2.1k"
                            },
                        ].map((faq, i) => (
                            <div key={i} className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${faq.status === 'Public' ? 'bg-green-50 text-green-600' : 'bg-stone-50 text-stone-500'}`}>
                                            {faq.status}
                                        </span>
                                        <span className="text-[9px] text-stone-300 font-black uppercase tracking-widest">
                                            {faq.category}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-stone-50 rounded-lg text-stone-200 hover:text-stone-600 transition-colors">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button className="p-2 hover:bg-stone-50 rounded-lg text-stone-200 hover:text-red-400 transition-colors">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-[#221C1D] mb-4 group-hover:text-[#F2A600] transition-colors cursor-pointer leading-snug">
                                    {faq.q}
                                </h3>
                                <div className="flex items-center gap-6 pt-6 border-t border-stone-50">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-stone-300 text-sm">visibility</span>
                                        <span className="text-[9px] font-bold text-stone-400">{faq.views} Reads</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-stone-300 text-sm">schedule</span>
                                        <span className="text-[9px] font-bold text-stone-400">2d ago</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Stats & Categories */}
                <div className="xl:col-span-4 space-y-8">
                    <section className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4 mb-6">Support Metrics</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <p className="text-[9px] font-bold text-stone-400 uppercase">Self-Service Score</p>
                                    <p className="text-[9px] font-bold text-green-600">84%</p>
                                </div>
                                <div className="w-full h-1.5 bg-stone-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[84%] shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100/50">
                                    <p className="text-xl font-bold text-[#221C1D]">24</p>
                                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Active Qs</p>
                                </div>
                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100/50">
                                    <p className="text-xl font-bold text-[#221C1D]">5.2k</p>
                                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Daily Hits</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Categories</h3>
                            <button className="text-[10px] font-bold text-[#F2A600] uppercase tracking-wider hover:underline">Manage</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Product Safety', count: 8 },
                                { name: 'Ingredients', count: 12 },
                                { name: 'Shipping', count: 5 },
                                { name: 'Authenticity', count: 4 }
                            ].map(cat => (
                                <div key={cat.name} className="flex justify-between items-center group cursor-pointer">
                                    <p className="text-xs font-bold text-stone-600 group-hover:text-[#F2A600] transition-colors">{cat.name}</p>
                                    <span className="px-2 py-0.5 bg-stone-50 rounded text-[9px] font-bold text-stone-400 group-hover:text-[#F2A600] transition-colors">{cat.count}</span>
                                </div>
                            ))}
                            <button className="w-full mt-4 py-3 border border-dashed border-stone-200 rounded-xl text-[9px] font-bold text-stone-400 uppercase tracking-widest hover:border-[#F2A600] hover:text-[#F2A600] hover:bg-amber-50/30 transition-all">
                                + Add Category
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
};

export default FAQManager;
