import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useSiteConfig, SiteConfig } from '../../context/SiteConfigContext';
import { useNotification } from '../../context/NotificationContext';

const CMSSettings: React.FC = () => {
    const { siteConfig, updateSiteConfig } = useSiteConfig();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState<SiteConfig>(siteConfig);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setFormData(siteConfig);
    }, [siteConfig]);

    const handleChange = (section: keyof SiteConfig, value: any) => {
        setFormData(prev => ({ ...prev, [section]: value }));
        setIsDirty(true);
    };

    const handleNestedChange = (section: keyof SiteConfig, index: number, field: string, value: any) => {
        setFormData(prev => {
            const list = [...(prev[section] as any[])];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [section]: list };
        });
        setIsDirty(true);
    };

    const handleFooterLinkChange = (sectionIndex: number, linkIndex: number, field: string, value: any) => {
        setFormData(prev => {
            const newFooterSections = [...prev.footerSections];
            newFooterSections[sectionIndex].links[linkIndex] = {
                ...newFooterSections[sectionIndex].links[linkIndex],
                [field]: value
            };
            return { ...prev, footerSections: newFooterSections };
        });
        setIsDirty(true);
    };

    const handleSave = () => {
        updateSiteConfig(formData);
        setIsDirty(false);
        showNotification('Site configuration published successfully!', 'success');
    };

    return (
        <AdminLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">CMS & Storefront Controls</h2>
                    <p className="text-stone-500 text-sm md:text-base">Curate your brand's digital presence and visual identity.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setFormData(siteConfig)}
                        disabled={!isDirty}
                        className={`px-6 py-3 border border-stone-200 text-[#221C1D] text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-all rounded shadow-sm ${!isDirty ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className={`px-8 py-3 bg-[#221C1D] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all rounded shadow-sm ${!isDirty ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Publish Changes
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
                {/* Left Column: Hero, Sections, Navigation */}
                <div className="xl:col-span-2 space-y-12">
                    {/* Navigation Management */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-xl font-bold text-[#221C1D]">Main Navigation</h3>
                        </div>
                        <div className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 space-y-4">
                            {formData.navLinks.map((link, i) => (
                                <div key={i} className="flex gap-4 items-center">
                                    <input
                                        value={link.name}
                                        onChange={(e) => handleNestedChange('navLinks', i, 'name', e.target.value)}
                                        className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm font-bold text-[#221C1D] focus:outline-none focus:border-[#F2A600]"
                                        placeholder="Link Name"
                                    />
                                    <input
                                        value={link.path}
                                        onChange={(e) => handleNestedChange('navLinks', i, 'path', e.target.value)}
                                        className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-600 focus:outline-none focus:border-[#F2A600]"
                                        placeholder="Link Path"
                                    />
                                    <button
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                navLinks: prev.navLinks.filter((_, index) => index !== i)
                                            }));
                                            setIsDirty(true);
                                        }}
                                        className="w-10 h-10 flex items-center justify-center bg-stone-50 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        navLinks: [...prev.navLinks, { name: '', path: '' }]
                                    }));
                                    setIsDirty(true);
                                }}
                                className="w-full py-3 border border-dashed border-stone-300 rounded-xl text-stone-400 font-bold uppercase text-[10px] tracking-widest hover:border-[#F2A600] hover:text-[#F2A600] transition-all"
                            >
                                + Add Navigation Link
                            </button>
                        </div>
                    </section>

                    {/* Hero Banner Management */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h3 className="text-xl font-bold text-[#221C1D]">Hero Banners</h3>
                            <button className="text-[10px] font-bold text-[#F2A600] uppercase tracking-wider hover:underline">Add Slide</button>
                        </div>
                        <div className="space-y-4">
                            {formData.heroBanners.map((hero, i) => (
                                <div key={i} className="group relative h-48 md:h-64 rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                                    <img src={hero.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={hero.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/70 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                                        <div className={`absolute top-4 right-4 md:top-6 md:right-6 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${hero.status === 'Live' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'} flex items-center`}>
                                            <select
                                                value={hero.status}
                                                onChange={(e) => handleNestedChange('heroBanners', i, 'status', e.target.value)}
                                                className="bg-transparent border-none text-white focus:ring-0 cursor-pointer appearance-none pr-1 outline-none"
                                            >
                                                <option value="Live" className="text-black">Live</option>
                                                <option value="Scheduled" className="text-black">Scheduled</option>
                                                <option value="Draft" className="text-black">Draft</option>
                                            </select>
                                            <span className="material-symbols-outlined text-[10px] ml-1 pointer-events-none">expand_more</span>
                                        </div>
                                        <div className="flex flex-col gap-2 mb-4">
                                            <input
                                                value={hero.sub}
                                                onChange={(e) => handleNestedChange('heroBanners', i, 'sub', e.target.value)}
                                                className="bg-transparent border-b border-white/30 text-[9px] font-bold text-stone-300 uppercase tracking-[0.2em] focus:outline-none focus:border-white w-full md:w-1/2"
                                            />
                                            <input
                                                value={hero.title}
                                                onChange={(e) => handleNestedChange('heroBanners', i, 'title', e.target.value)}
                                                className="bg-transparent border-b border-white/30 text-xl md:text-2xl font-bold text-white focus:outline-none focus:border-white w-full md:w-2/3"
                                            />
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
                            {formData.homeSections.map((section, i) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-stone-50 rounded-xl transition-colors cursor-move group">
                                    <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                                        <span className="material-symbols-outlined text-stone-300 group-hover:text-stone-400">drag_indicator</span>
                                        <div className="truncate">
                                            <p className="text-sm font-bold text-stone-800 truncate">{section.name}</p>
                                            <p className="text-[9px] text-stone-400 font-bold uppercase">{section.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 md:gap-4 items-center flex-shrink-0">
                                        <button
                                            onClick={() => handleNestedChange('homeSections', i, 'active', !section.active)}
                                            className={`w-9 h-5 rounded-full relative transition-colors ${section.active ? 'bg-[#F2A600]' : 'bg-stone-200'}`}
                                        >
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
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <input
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm font-bold text-[#221C1D] focus:outline-none focus:border-[#F2A600] transition-colors"
                                        placeholder="Section Title"
                                        value={formData.philosophy?.title || ''}
                                        onChange={(e) => handleChange('philosophy', { ...formData.philosophy, title: e.target.value })}
                                    />
                                    <textarea
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-600 min-h-[120px] resize-none focus:outline-none focus:border-[#F2A600] transition-colors"
                                        value={formData.philosophy?.content || ''}
                                        onChange={(e) => handleChange('philosophy', { ...formData.philosophy, content: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Testimonials Management */}
                            <div className="space-y-6 pt-10 border-t border-stone-50">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Curated Quotes</p>
                                    <button className="text-[10px] font-bold text-[#F2A600] uppercase hover:underline">+ Add</button>
                                </div>
                                <div className="space-y-4">
                                    {formData.testimonials.map((t, i) => (
                                        <div key={i} className="p-4 bg-stone-50 border border-stone-100 rounded-xl flex flex-col gap-3 group hover:bg-white hover:shadow-sm transition-all duration-300">
                                            <input
                                                value={t.author}
                                                onChange={(e) => handleNestedChange('testimonials', i, 'author', e.target.value)}
                                                className="bg-transparent text-xs font-bold text-[#221C1D] focus:outline-none border-b border-transparent focus:border-[#F2A600]"
                                                placeholder="Author Name"
                                            />
                                            <textarea
                                                value={t.quote}
                                                onChange={(e) => handleNestedChange('testimonials', i, 'quote', e.target.value)}
                                                className="bg-transparent text-[10px] text-stone-500 italic w-full resize-none focus:outline-none border-b border-transparent focus:border-[#F2A600]"
                                                rows={2}
                                                placeholder="Quote"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Global Appearance & Contact */}
                <div className="space-y-8 lg:space-y-12">
                    {/* Footer Management */}
                    <section>
                        <h3 className="text-xl font-bold text-[#221C1D] mb-6">Footer Links</h3>
                        <div className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 space-y-8">
                            {formData.footerSections.map((section, sIndex) => (
                                <div key={sIndex}>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">{section.title}</p>
                                    <div className="space-y-3">
                                        {section.links.map((link, lIndex) => (
                                            <div key={lIndex} className="flex gap-2">
                                                <input
                                                    value={link.name}
                                                    onChange={(e) => handleFooterLinkChange(sIndex, lIndex, 'name', e.target.value)}
                                                    className="w-1/2 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-[10px] text-[#221C1D] focus:outline-none focus:border-[#F2A600]"
                                                />
                                                <input
                                                    value={link.path}
                                                    onChange={(e) => handleFooterLinkChange(sIndex, lIndex, 'path', e.target.value)}
                                                    className="w-1/2 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-[10px] text-stone-500 focus:outline-none focus:border-[#F2A600]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-[#221C1D] mb-6">Concierge & Socials</h3>
                        <div className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 space-y-8">
                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Contact Info</p>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-stone-400 uppercase">Address</label>
                                        <textarea
                                            value={formData.contactInfo.address}
                                            onChange={(e) => handleChange('contactInfo', { ...formData.contactInfo, address: e.target.value })}
                                            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[11px] text-[#221C1D] resize-none focus:outline-none focus:border-[#F2A600]"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-stone-400 uppercase">Email</label>
                                        <input
                                            value={formData.contactInfo.email}
                                            onChange={(e) => handleChange('contactInfo', { ...formData.contactInfo, email: e.target.value })}
                                            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[11px] text-[#221C1D] focus:outline-none focus:border-[#F2A600]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black text-stone-400 uppercase">Phone</label>
                                        <input
                                            value={formData.contactInfo.phone}
                                            onChange={(e) => handleChange('contactInfo', { ...formData.contactInfo, phone: e.target.value })}
                                            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-[11px] text-[#221C1D] focus:outline-none focus:border-[#F2A600]"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Digital Footprint</p>
                                <div className="space-y-3">
                                    {formData.socialLinks.map((social, i) => (
                                        <div key={social.platform} className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-stone-50 rounded-lg flex items-center justify-center border border-stone-100 flex-shrink-0">
                                                <span className="material-symbols-outlined text-stone-400 text-base">link</span>
                                            </div>
                                            <input
                                                value={social.url}
                                                onChange={(e) => handleNestedChange('socialLinks', i, 'url', e.target.value)}
                                                className="flex-1 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2 text-[10px] text-[#221C1D] focus:outline-none focus:border-[#F2A600]"
                                                placeholder={`${social.platform} URL`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CMSSettings;
