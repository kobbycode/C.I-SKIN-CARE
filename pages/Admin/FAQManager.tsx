import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useFAQs, FAQ } from '../../context/FAQContext';
import { useNotification } from '../../context/NotificationContext';

const FAQManager: React.FC = () => {
    const { faqs, addFAQ, updateFAQ, deleteFAQ, loading } = useFAQs();
    const { showNotification } = useNotification();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
    const [formData, setFormData] = useState<{
        question: string;
        answer: string;
        category: string;
        status: 'Public' | 'Draft';
    }>({ question: '', answer: '', category: 'Safety', status: 'Draft' });

    const metrics = useMemo(() => {
        const activeQs = faqs.length;
        const totalHits = faqs.reduce((sum, f) => sum + (f.views || 0), 0);
        const publicFaqs = faqs.filter(f => f.status === 'Public');

        // Calculate self-service score: percentage of public FAQs with views
        const faqsWithViews = publicFaqs.filter(f => (f.views || 0) > 0).length;
        const selfServiceScore = publicFaqs.length > 0
            ? Math.round((faqsWithViews / publicFaqs.length) * 100)
            : 0;

        // Calculate category counts
        const catMap: Record<string, number> = {};
        faqs.forEach(f => {
            catMap[f.category] = (catMap[f.category] || 0) + 1;
        });

        const categoryList = Object.entries(catMap).map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

        return { activeQs, totalHits, selfServiceScore, categoryList };
    }, [faqs]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingFaq) {
                await updateFAQ(editingFaq.id, formData);
                showNotification('FAQ updated', 'success');
            } else {
                await addFAQ(formData);
                showNotification('FAQ created', 'success');
            }
            setIsModalOpen(false);
            setEditingFaq(null);
            setFormData({ question: '', answer: '', category: 'Safety', status: 'Draft' });
        } catch (error) {
            showNotification('Operation failed', 'error');
        }
    };

    const handleEdit = (faq: FAQ) => {
        setEditingFaq(faq);
        setFormData({ question: faq.question, answer: faq.answer, category: faq.category, status: faq.status });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this FAQ?')) {
            await deleteFAQ(id);
            showNotification('FAQ deleted', 'success');
        }
    };
    return (
        <AdminLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">Knowledge Base</h2>
                    <p className="text-stone-500 text-sm md:text-base">Manage frequently asked questions and concierge support guidance.</p>
                </div>
                <button
                    onClick={() => { setEditingFaq(null); setFormData({ question: '', answer: '', category: 'Safety', status: 'Draft' }); setIsModalOpen(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-[#221C1D] text-white hover:bg-black transition-colors rounded shadow-sm">
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Question
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
                {/* Main FAQ List */}
                <div className="xl:col-span-8">
                    <div className="space-y-6">
                        {faqs.length > 0 ? faqs.map((faq) => (
                            <div key={faq.id} className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all group">
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
                                        <button onClick={() => handleEdit(faq)} className="p-2 hover:bg-stone-50 rounded-lg text-stone-200 hover:text-stone-600 transition-colors">
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button onClick={() => handleDelete(faq.id)} className="p-2 hover:bg-stone-50 rounded-lg text-stone-200 hover:text-red-400 transition-colors">
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-base md:text-lg font-bold text-[#221C1D] mb-4 group-hover:text-[#F2A600] transition-colors cursor-pointer leading-snug">
                                    {faq.question}
                                </h3>
                                <p className="text-xs text-stone-500 leading-relaxed mb-6">{faq.answer}</p>
                                <div className="flex items-center gap-6 pt-6 border-t border-stone-50">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-stone-300 text-sm">visibility</span>
                                        <span className="text-[9px] font-bold text-stone-400">{faq.views.toLocaleString()} Reads</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-stone-300 text-sm">schedule</span>
                                        <span className="text-[9px] font-bold text-stone-400">Updated {new Date(faq.lastUpdated).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl opacity-40 italic font-display uppercase tracking-widest"> No questions recorded in the archives yet. </div>
                        )}
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
                                    <p className={`text-[9px] font-bold ${metrics.selfServiceScore >= 70 ? 'text-green-600' : metrics.selfServiceScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                        {metrics.selfServiceScore}%
                                    </p>
                                </div>
                                <div className="w-full h-1.5 bg-stone-50 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${metrics.selfServiceScore >= 70 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : metrics.selfServiceScore >= 40 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}
                                        style={{ width: `${metrics.selfServiceScore}%` }}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100/50">
                                    <p className="text-xl font-bold text-[#221C1D]">{metrics.activeQs}</p>
                                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Active Qs</p>
                                </div>
                                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100/50">
                                    <p className="text-xl font-bold text-[#221C1D]">
                                        {metrics.totalHits >= 1000
                                            ? `${(metrics.totalHits / 1000).toFixed(1)}k`
                                            : metrics.totalHits.toLocaleString()}
                                    </p>
                                    <p className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Global Hits</p>
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
                            {metrics.categoryList.map(cat => (
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

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[#221C1D]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
                            <h3 className="font-display text-2xl text-[#221C1D] uppercase tracking-widest">{editingFaq ? 'Edit Ritual Support' : 'New Support Entry'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-50 rounded-full transition-colors"><span className="material-symbols-outlined text-stone-400">close</span></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Question</label>
                                <input
                                    required
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full bg-stone-50 border-none rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#F2A600] transition-shadow"
                                    placeholder="Enter natural language inquiry..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Concierge Assessment (Answer)</label>
                                <textarea
                                    required
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    className="w-full bg-stone-50 border-none rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#F2A600] transition-shadow min-h-[150px] resize-none"
                                    placeholder="Provide detailed botanical guidance..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Classification</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-stone-50 border-none rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#F2A600] transition-shadow"
                                    >
                                        {['Safety', 'Product Care', 'Ingredients', 'Shipping', 'Ritual Guide'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Visibility</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Public' | 'Draft' })}
                                        className="w-full bg-stone-50 border-none rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#F2A600] transition-shadow"
                                    >
                                        <option value="Public">Public Access</option>
                                        <option value="Draft">Draft Only</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-6">
                                <button type="submit" className="w-full py-4 bg-[#221C1D] text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300">
                                    {editingFaq ? 'Synchronize Record' : 'Publish Archive Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default FAQManager;
