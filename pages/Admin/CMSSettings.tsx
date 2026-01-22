import React from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';

const CMSSettings: React.FC = () => {
    return (
        <AdminLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">CMS & Storefront Controls</h2>
                    <p className="text-stone-500 text-sm md:text-base">Curate your brand's digital presence and visual identity.</p>
                </div>
                <button className="w-full sm:w-auto px-8 py-3 bg-[#221C1D] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all rounded shadow-sm">
                    Publish Changes
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
                {/* Left Column: Hero & Sections */}
                <div className="xl:col-span-2 space-y-12">
                    {/* Hero Banner Management */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-xl font-bold text-[#221C1D]">Hero Banners</h3>
                            <button className="text-[10px] font-bold text-[#F2A600] uppercase tracking-wider hover:underline">Add Slide</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: 'The Science of Glow', sub: 'Spring Collection 2024', img: '/products/bel-eclat-hero.jpg', status: 'Live' },
                                { title: 'Ritual of Restoration', sub: 'Nighttime Essentials', img: '/products/gluta-master-set.jpg', status: 'Scheduled' }
                            ].map((hero, i) => (
                                <div key={i} className="group relative h-48 md:h-64 rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                                    <img src={hero.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={hero.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                                        <span className={`absolute top-4 right-4 md:top-6 md:right-6 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${hero.status === 'Live' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>
                                            {hero.status}
                                        </span>
                                        <p className="text-[9px] font-bold text-stone-300 uppercase tracking-[0.2em] mb-1">{hero.sub}</p>
                                        <h4 className="text-xl md:text-2xl font-bold text-white mb-4">{hero.title}</h4>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-bold text-white border border-white/20 hover:bg-white/20 transition-all">Edit Layout</button>
                                            <button className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-bold text-white border border-white/20 hover:bg-white/20 transition-all">Replace Media</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Storefront Sections */}
                    <section>
                        <h3 className="text-xl font-bold text-[#221C1D] mb-6">Active Frontpage Sections</h3>
                        <div className="bg-white border border-stone-100 rounded-2xl p-2 md:p-4 space-y-1">
                            {[
                                { name: 'Featured Products Grid', type: 'Product Carousel', active: true },
                                { name: 'Philosophy Quote', type: 'Typography Block', active: true },
                                { name: 'Natural Ingredients', type: 'Grid Gallery', active: true },
                                { name: 'Instagram Feed', type: 'Social Plugin', active: false }
                            ].map((section, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-stone-50 rounded-xl transition-colors cursor-move group">
                                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                        <span className="material-symbols-outlined text-stone-300 group-hover:text-stone-400">drag_indicator</span>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-stone-800 truncate">{section.name}</p>
                                            <p className="text-[9px] text-stone-400 font-bold uppercase">{section.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 md:gap-4 items-center flex-shrink-0">
                                        <button className={`w-9 h-5 rounded-full relative transition-colors ${section.active ? 'bg-[#F2A600]' : 'bg-stone-200'}`}>
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${section.active ? 'right-1' : 'left-1'}`} />
                                        </button>
                                        <button className="text-stone-300 hover:text-stone-600 transition-colors"><span className="material-symbols-outlined text-lg">settings</span></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Homepage Content Expansion */}
                    <section>
                        <h3 className="text-xl font-bold text-[#221C1D] mb-6">Homepage Content</h3>
                        <div className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 space-y-10">
                            {/* Philosophy Management */}
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Philosophy Section</p>
                                    <button className="text-[10px] font-bold text-[#F2A600] uppercase hover:underline">Reset</button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <input className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm font-bold text-[#221C1D] focus:outline-none focus:border-[#F2A600] transition-colors" defaultValue="The Philosophy of C.I SKIN CARE" placeholder="Section Title" />
                                    <textarea className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-600 min-h-[120px] resize-none focus:outline-none focus:border-[#F2A600] transition-colors" defaultValue="We believe that luxury should never compromise integrity. Our formulations are crafted with botanical extracts and clinical actives..." />
                                </div>
                            </div>

                            {/* Testimonials Management */}
                            <div className="space-y-6 pt-10 border-t border-stone-50">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Curated Quotes</p>
                                    <button className="text-[10px] font-bold text-[#F2A600] uppercase hover:underline">+ Add</button>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { author: 'Elena V.', quote: 'My skin has never felt more alive. The Radiance Serum is my holy grail...' },
                                        { author: 'Sophia R.', quote: 'A literal game changer for my morning routine...' }
                                    ].map((t, i) => (
                                        <div key={i} className="p-4 bg-stone-50 border border-stone-100 rounded-xl flex justify-between items-start group hover:bg-white hover:shadow-sm transition-all duration-300">
                                            <div className="flex-1 mr-4 overflow-hidden">
                                                <p className="text-xs font-bold text-[#221C1D] mb-1">{t.author}</p>
                                                <p className="text-[10px] text-stone-500 italic line-clamp-1">"{t.quote}"</p>
                                            </div>
                                            <button className="text-stone-300 hover:text-[#F2A600] transition-colors"><span className="material-symbols-outlined text-lg">edit</span></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Global Appearance & Contact */}
                <div className="space-y-8 lg:space-y-12">
                    <section>
                        <h3 className="text-xl font-bold text-[#221C1D] mb-6">Concierge & Socials</h3>
                        <div className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 space-y-8">
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Contact Info</p>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-stone-400 uppercase">Address</label>
                                        <textarea className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[11px] text-[#221C1D] resize-none focus:outline-none focus:border-[#F2A600]" rows={3} defaultValue={"452 Fifth Avenue, Suite 1200\nNew York, NY 10018, USA"} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-stone-400 uppercase">Email</label>
                                        <input className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[11px] text-[#221C1D] focus:outline-none focus:border-[#F2A600]" defaultValue="concierge@ciskincare.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-stone-400 uppercase">Phone</label>
                                        <input className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[11px] text-[#221C1D] focus:outline-none focus:border-[#F2A600]" defaultValue="+1 (800) 555-SKIN" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Digital Footprint</p>
                                <div className="space-y-3">
                                    {['Instagram', 'Facebook', 'Twitter', 'YouTube'].map(social => (
                                        <div key={social} className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-stone-50 rounded-lg flex items-center justify-center border border-stone-100 flex-shrink-0">
                                                <span className="material-symbols-outlined text-stone-400 text-base">link</span>
                                            </div>
                                            <input className="flex-1 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-[10px] text-[#221C1D] focus:outline-none focus:border-[#F2A600]" placeholder={`${social} URL`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-[#221C1D] mb-6">Global Identity</h3>
                        <div className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 space-y-8 shadow-sm">
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Brand Logo</p>
                                <div className="flex flex-col sm:flex-row xl:flex-col items-center gap-6">
                                    <div className="w-24 h-24 bg-[#221C1D] rounded-xl flex items-center justify-center border border-stone-100 overflow-hidden shadow-inner flex-shrink-0">
                                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="text-center sm:text-left xl:text-center space-y-2">
                                        <button className="text-[10px] font-bold text-[#F2A600] border-b border-[#F2A600] hover:text-[#D49100] transition-colors">Upload New</button>
                                        <p className="text-[8px] text-stone-400 uppercase leading-relaxed">SVG/PNG (400x400px)</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Core Palette</p>
                                <div className="grid grid-cols-4 gap-2 md:gap-3">
                                    {[
                                        { color: '#221C1D', name: 'Umber' },
                                        { color: '#F2A600', name: 'Gold' },
                                        { color: '#FDFCFB', name: 'Linen' },
                                        { color: '#8C8581', name: 'Muted' }
                                    ].map(c => (
                                        <div key={c.name} className="space-y-2 text-center">
                                            <div className="h-10 w-full rounded-lg border border-stone-100 shadow-sm" style={{ backgroundColor: c.color }} />
                                            <p className="text-[8px] font-black text-stone-400 uppercase truncate">{c.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Typography</p>
                                <div className="space-y-3">
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl flex justify-between items-center group cursor-pointer hover:bg-white hover:border-[#F2A600] transition-all">
                                        <div>
                                            <p className="text-[8px] font-black text-stone-400 uppercase mb-1">Headings</p>
                                            <p className="text-xs font-bold text-stone-800">Playfair Display</p>
                                        </div>
                                        <span className="material-symbols-outlined text-stone-300 group-hover:text-[#F2A600] text-lg">expand_more</span>
                                    </div>
                                    <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl flex justify-between items-center group cursor-pointer hover:bg-white hover:border-[#F2A600] transition-all">
                                        <div>
                                            <p className="text-[8px] font-black text-stone-400 uppercase mb-1">Body Text</p>
                                            <p className="text-xs font-medium text-stone-800">Inter</p>
                                        </div>
                                        <span className="material-symbols-outlined text-stone-300 group-hover:text-[#F2A600] text-lg">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl shadow-sm border-l-4 border-l-amber-400">
                            <div className="flex gap-3 mb-2 items-center">
                                <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
                                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Draft System</p>
                            </div>
                            <p className="text-[10px] text-amber-800 leading-relaxed uppercase tracking-tighter">
                                Changes are saved as drafts. Hit "Publish" to sync to the live storefront for all customers.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CMSSettings;
