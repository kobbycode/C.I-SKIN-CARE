import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';

const AddProduct: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate luxury API delay
        setTimeout(() => {
            setIsSubmitting(false);
            navigate('/admin/inventory');
        }, 1500);
    };

    return (
        <AdminLayout>
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    <Link to="/admin/inventory" className="p-2 hover:bg-stone-50 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-stone-400">arrow_back</span>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold text-[#221C1D]">New Formulation</h2>
                        <p className="text-stone-500">Add a new clinical-grade botanical to the collection.</p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="max-w-5xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Essential Details */}
                    <div className="lg:col-span-8 space-y-8">
                        <section className="bg-white border border-stone-100 rounded-2xl p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4 mb-6">Core Information</h3>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Product Signature Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Midnight Radiance Elixir"
                                    className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Product Narrative</label>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Describe the formulation's purpose, key benefits, and sensory experience..."
                                    className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300 resize-none"
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Category</label>
                                    <select className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all appearance-none cursor-pointer">
                                        <option>Cleansers</option>
                                        <option>Serums & Elixirs</option>
                                        <option>Moisturizers</option>
                                        <option>Treatments</option>
                                        <option>Collections</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Brand Line</label>
                                    <select className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all appearance-none cursor-pointer">
                                        <option>Botanical Line</option>
                                        <option>Clinical Series</option>
                                        <option>Essential Collection</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border border-stone-100 rounded-2xl p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4 mb-6">Inventory & Pricing</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Base Price (GH₵)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">SKU Identifier</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="CI-XXXX-XX"
                                        className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300 uppercase"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D]">Initial Stock Level</label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="0"
                                        className="w-full bg-[#FDFCFB] border border-stone-100 focus:border-[#F2A600] focus:ring-1 focus:ring-[#F2A600] rounded-lg px-4 py-4 outline-none transition-all placeholder:text-stone-300"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border border-stone-100 rounded-2xl p-8 space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4 mb-6">Skin Intelligence (Targeting)</h3>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Target Skin Types</p>
                                    <div className="flex flex-wrap gap-3">
                                        {['All Skin Types', 'Dry & Dehydrated', 'Oily & Acne-Prone', 'Mature Skin', 'Sensitive', 'Normal'].map(type => (
                                            <button key={type} type="button" className="px-5 py-2 rounded-full border border-stone-100 text-[10px] font-bold uppercase tracking-wider hover:border-[#F2A600] hover:text-[#F2A600] transition-all">
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Primary Skin Concerns</p>
                                    <div className="flex flex-wrap gap-3">
                                        {['Aging', 'Dullness', 'Dehydration', 'Dryness', 'Dark Circles', 'Fine Lines', 'Congestion'].map(concern => (
                                            <button key={concern} type="button" className="px-5 py-2 rounded-full border border-stone-100 text-[10px] font-bold uppercase tracking-wider hover:border-[#F2A600] hover:text-[#F2A600] transition-all">
                                                {concern}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar Actions & Media */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="bg-white border border-stone-100 rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] border-b border-stone-50 pb-4 mb-6">Visual Identity</h3>

                            <div className="space-y-4">
                                <div className="aspect-[4/5] bg-[#FDFCFB] border-2 border-dashed border-stone-100 rounded-xl flex flex-col items-center justify-center text-center p-6 group hover:border-[#F2A600]/30 transition-all cursor-pointer">
                                    <span className="material-symbols-outlined text-4xl text-stone-200 mb-2 group-hover:text-[#F2A600]/30">image</span>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-[#221C1D]">Upload Product Imagery</p>
                                    <p className="text-[8px] text-stone-300 mt-1 uppercase">JPG, PNG, WEBP (Min 1000x1250px)</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="aspect-square bg-[#FDFCFB] border border-stone-100 rounded-lg flex items-center justify-center">
                                            <span className="material-symbols-outlined text-stone-200 text-lg">add</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className="bg-[#221C1D] text-white rounded-2xl p-8 space-y-6 shadow-xl">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 border-b border-white/10 pb-4 mb-4">Publishing Logic</h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-widest">Visibility</p>
                                    <select className="bg-transparent border-none focus:ring-0 text-[#F2A600] text-xs font-bold uppercase tracking-widest cursor-pointer">
                                        <option>Public</option>
                                        <option>Private</option>
                                        <option>Archived</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-widest">Status</p>
                                    <span className="text-[10px] font-bold bg-[#F2A600] text-[#221C1D] px-3 py-1 rounded-full uppercase tracking-widest">Draft</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#F2A600] text-[#221C1D] py-4 rounded-lg font-bold uppercase tracking-[0.2em] text-[10px] hover:brightness-110 shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-[#221C1D]/20 border-t-[#221C1D] rounded-full animate-spin"></div>
                                        Establishing...
                                    </>
                                ) : (
                                    <>Authenticating Product</>
                                )}
                            </button>
                            <button type="button" className="w-full text-stone-400 py-2 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                                Discard Ritual Draft
                            </button>
                        </section>

                        <section className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
                            <div className="flex gap-3 mb-2">
                                <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
                                <p className="text-[10px] font-bold text-amber-900 uppercase tracking-widest">Compliance Tip</p>
                            </div>
                            <p className="text-[10px] text-amber-800/80 leading-relaxed uppercase tracking-tighter">
                                Ensure all botanical ingredients are listed per INCI standard. Clinical studies must be cited in the description field for health claims.
                            </p>
                        </section>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
};

export default AddProduct;
