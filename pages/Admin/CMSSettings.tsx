import React, { useState, useEffect } from 'react';
import SocialIcon from '../../components/SocialIcon';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useSiteConfig, SiteConfig, HeroBanner } from '../../context/SiteConfigContext';
import { useNotification } from '../../context/NotificationContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebaseConfig';

const CMSSettings: React.FC = () => {
    const { siteConfig, updateSiteConfig } = useSiteConfig();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState<SiteConfig>(siteConfig);
    const [isDirty, setIsDirty] = useState(false);
    const [activeModal, setActiveModal] = useState<{
        type: 'hero' | 'testimonial' | 'ritual';
        index: number;
        data: any;
    } | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const founderFileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFormData(siteConfig);
    }, [siteConfig]);

    const handleChange = (section: keyof SiteConfig, value: any) => {
        setFormData(prev => ({ ...prev, [section]: value }));
        setIsDirty(true);
    };

    const handleNestedChange = (section: keyof SiteConfig, index: number, field: string, value: any) => {
        setFormData(prev => {
            let list = [...(prev[section] as any[])];

            // Mutual exclusivity for hero banners: only one can be "Live"
            if (section === 'heroBanners' && field === 'status' && value === 'Live') {
                list = list.map((item, idx) => ({
                    ...item,
                    status: idx === index ? 'Live' : 'Draft'
                }));
            } else {
                list[index] = { ...list[index], [field]: value };
            }

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

    const handleRitualStepChange = (ritualIndex: number, stepIndex: number, field: string, value: any) => {
        setFormData(prev => {
            const newList = [...prev.ritualGuide];
            const newSteps = [...newList[ritualIndex].steps];
            newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value };
            newList[ritualIndex] = { ...newList[ritualIndex], steps: newSteps };
            return { ...prev, ritualGuide: newList };
        });
        setIsDirty(true);
    };

    const handleStoryChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            story: { ...prev.story, [field]: value }
        }));
        setIsDirty(true);
    };

    const handleSave = () => {
        updateSiteConfig(formData);
        setIsDirty(false);
        showNotification('Site configuration published successfully!', 'success');
    };

    const handleModalSave = () => {
        if (!activeModal) return;
        const { type, index, data } = activeModal;
        const section = type === 'hero' ? 'heroBanners' : type === 'testimonial' ? 'testimonials' : 'ritualGuide';

        setFormData(prev => {
            let newList = [...(prev[section] as any[])];

            // Mutual exclusivity for hero banners: only one can be "Live"
            if (section === 'heroBanners' && data.status === 'Live') {
                newList = newList.map(item => ({ ...item, status: 'Draft' }));
            }

            if (index === -1) {
                // Adding a new item
                newList.push(data);
            } else {
                // Updating an existing item
                newList[index] = data;
            }

            return { ...prev, [section]: newList };
        });
        setIsDirty(true);
        setActiveModal(null);
    };

    const handleFounderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        setUploadProgress(0);
        const storageRef = ref(storage, `cms/founder_${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                showNotification('Upload failed. Please try again.', 'error');
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setFormData(prev => ({
                    ...prev,
                    story: { ...prev.story, founderImage: downloadURL }
                }));
                setIsUploading(false);
                setUploadProgress(0);
                showNotification('Founder image uploaded successfully!', 'success');
                founderFileInputRef.current && (founderFileInputRef.current.value = '');
            }
        );
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !activeModal) return;

        setIsUploading(true);
        setUploadProgress(0);

        const storageRef = ref(storage, `cms/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                showNotification('Upload failed. Please try again.', 'error');
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                const { type, data } = activeModal;
                setActiveModal({
                    ...activeModal,
                    data: { ...data, [type === 'hero' ? 'img' : 'image']: downloadURL }
                });
                setIsUploading(false);
                setUploadProgress(0);
                showNotification('Image uploaded successfully!', 'success');
            }
        );
    };

    const CMSModal = () => {
        if (!activeModal) return null;
        const { type, data } = activeModal;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white dark:bg-stone-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="px-8 py-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center bg-stone-50/50 dark:bg-stone-800/50">
                        <h4 className="text-xl font-bold text-primary dark:text-white uppercase tracking-widest">
                            Edit {type === 'hero' ? 'Hero Slide' : type === 'testimonial' ? 'Quoate' : 'Ritual'}
                        </h4>
                        <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-full transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {/* Image Preview & URL */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">visual Asset</label>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800">
                                    <img
                                        src={data.img || data.image || '/assets/customer-portrait.png'}
                                        className="w-full h-full object-cover"
                                        alt="Preview"
                                    />
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex gap-2">
                                        <input
                                            value={data.img || data.image || ''}
                                            onChange={(e) => setActiveModal({ ...activeModal, data: { ...data, [type === 'hero' ? 'img' : 'image']: e.target.value } })}
                                            className="flex-1 bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary/20"
                                            placeholder="Paste image URL here..."
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="px-4 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors flex items-center justify-center min-w-[48px]"
                                            title="Upload from device"
                                        >
                                            {isUploading ? (
                                                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                            ) : (
                                                <span className="material-symbols-outlined text-stone-500">upload_file</span>
                                            )}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                    </div>

                                    {isUploading && (
                                        <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1 overflow-hidden">
                                            <div
                                                className="bg-primary h-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    )}

                                    <p className="text-[9px] text-stone-400 italic">Recommended: High-quality JPG or PNG. Portraits should be square.</p>
                                </div>
                            </div>
                        </div>

                        {/* Content Fields */}
                        <div className="grid grid-cols-1 gap-6 pt-4 border-t border-stone-50 dark:border-stone-800">
                            {type === 'hero' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Headline</label>
                                        <input
                                            value={data.title}
                                            onChange={(e) => setActiveModal({ ...activeModal, data: { ...data, title: e.target.value } })}
                                            className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Sub-headline</label>
                                        <input
                                            value={data.sub}
                                            onChange={(e) => setActiveModal({ ...activeModal, data: { ...data, sub: e.target.value } })}
                                            className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            {type === 'testimonial' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Client Name</label>
                                        <input
                                            value={data.author}
                                            onChange={(e) => setActiveModal({ ...activeModal, data: { ...data, author: e.target.value } })}
                                            className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Assessment Quote</label>
                                        <textarea
                                            value={data.quote}
                                            onChange={(e) => setActiveModal({ ...activeModal, data: { ...data, quote: e.target.value } })}
                                            className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm min-h-[100px] resize-none"
                                        />
                                    </div>
                                </>
                            )}

                            {type === 'ritual' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Ritual Title</label>
                                            <input
                                                value={data.title}
                                                onChange={(e) => setActiveModal({ ...activeModal, data: { ...data, title: e.target.value } })}
                                                className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Associated Collection</label>
                                            <input
                                                value={data.collection}
                                                onChange={(e) => setActiveModal({ ...activeModal, data: { ...data, collection: e.target.value } })}
                                                className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-stone-50 dark:bg-stone-800/50 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-3">
                        <button
                            onClick={() => setActiveModal(null)}
                            className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-stone-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleModalSave}
                            className="px-8 py-2.5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            Confirm Changes
                        </button>
                    </div>
                </div>
            </div>
        );
    };


    return (
        <AdminLayout>
            <CMSModal />

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
                            {(formData.navLinks || []).map((link, i) => (
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
                            <button
                                onClick={() => {
                                    const newHero: HeroBanner = { title: '', sub: '', img: '/products/bel-eclat-hero.jpg', status: 'Draft' };
                                    setActiveModal({ type: 'hero', index: -1, data: newHero });
                                }}
                                className="text-[10px] font-bold text-[#F2A600] uppercase tracking-wider hover:underline"
                            >
                                Add Slide
                            </button>
                        </div>
                        <div className="space-y-4">
                            {(formData.heroBanners || []).map((hero, i) => (
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
                                            <p className="text-[9px] font-bold text-stone-300 uppercase tracking-[0.2em]">{hero.sub}</p>
                                            <h4 className="text-xl md:text-2xl font-bold text-white mb-4 leading-tight">{hero.title}</h4>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setActiveModal({ type: 'hero', index: i, data: { ...hero } })}
                                                    className="w-max bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-white/30 transition-all flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span> Edit Slide
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, heroBanners: prev.heroBanners.filter((_, idx) => idx !== i) }));
                                                        setIsDirty(true);
                                                    }}
                                                    className="w-max bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-red-500/30 transition-all"
                                                >
                                                    Delete
                                                </button>
                                            </div>
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
                            {(formData.homeSections || []).map((section, i) => (
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
                                    <button
                                        onClick={() => {
                                            const newTestimonial = { author: '', quote: '', image: '/assets/customer-portrait.png' };
                                            setActiveModal({ type: 'testimonial', index: -1, data: newTestimonial });
                                        }}
                                        className="text-[10px] font-bold text-[#F2A600] uppercase hover:underline"
                                    >
                                        + Add Quoate
                                    </button>

                                </div>
                                <div className="space-y-4">
                                    {(formData.testimonials || []).map((t, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setActiveModal({ type: 'testimonial', index: i, data: { ...t } })}
                                            className="p-4 bg-stone-50 border border-stone-100 rounded-xl flex flex-col gap-3 group hover:bg-white hover:shadow-xl hover:scale-[1.02] cursor-pointer transition-all duration-300 relative"
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        testimonials: prev.testimonials.filter((_, idx) => idx !== i)
                                                    }));
                                                    setIsDirty(true);
                                                }}
                                                className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-200 flex-shrink-0">
                                                    <img src={t.image || '/assets/customer-portrait.png'} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-[#221C1D]">{t.author || 'Anonymous Client'}</p>
                                                    <p className="text-[9px] text-stone-400 uppercase tracking-widest">Verified Buyer</p>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-stone-500 italic line-clamp-2">"{t.quote || 'No assessment written yet...'}"</p>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Ritual Guide Management */}
                    <section>
                        <h3 className="text-xl font-bold text-[#221C1D] mb-6">Ritual Guides</h3>
                        <div className="space-y-6">
                            {(formData.ritualGuide || []).map((ritual, rIdx) => (
                                <div key={rIdx} className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex gap-4 items-center flex-1">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden border border-stone-100 flex-shrink-0 bg-stone-50">
                                                <img src={ritual.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-[#221C1D]">{ritual.title}</h4>
                                                <p className="text-[10px] text-stone-400 uppercase tracking-widest">{ritual.collection}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveModal({ type: 'ritual', index: rIdx, data: { ...ritual } })}
                                            className="px-6 py-2 border border-luxury-brown text-luxury-brown text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-brown hover:text-white transition-all rounded"
                                        >
                                            Edit Identity
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ritual Steps</p>
                                        {(ritual.steps || []).map((step, sIdx) => (
                                            <div key={sIdx} className="flex gap-4 items-start bg-stone-50 p-4 rounded-xl">
                                                <span className="w-6 h-6 rounded-full bg-luxury-brown text-gold flex items-center justify-center text-[10px] flex-shrink-0 mt-1">{sIdx + 1}</span>
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        value={step.name}
                                                        onChange={(e) => handleRitualStepChange(rIdx, sIdx, 'name', e.target.value)}
                                                        className="w-full bg-transparent border-b border-stone-200 text-xs font-bold focus:outline-none focus:border-gold"
                                                        placeholder="Step Name"
                                                    />
                                                    <textarea
                                                        value={step.desc}
                                                        onChange={(e) => handleRitualStepChange(rIdx, sIdx, 'desc', e.target.value)}
                                                        className="w-full bg-transparent border-none text-[10px] text-stone-500 italic resize-none focus:outline-none"
                                                        rows={2}
                                                        placeholder="Step Description"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Story Content Management */}
                    <section>
                        <h3 className="text-xl font-bold text-[#221C1D] mb-6">Our Story Content</h3>
                        <div className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">About Section</label>
                                <input
                                    value={formData.story.aboutTitle}
                                    onChange={(e) => handleStoryChange('aboutTitle', e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm font-bold"
                                    placeholder="About Us Title"
                                />
                                <textarea
                                    value={formData.story.aboutText}
                                    onChange={(e) => handleStoryChange('aboutText', e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm text-stone-600 min-h-[100px]"
                                    placeholder="About Us Text"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-stone-50">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Mission Statement</label>
                                    <textarea
                                        value={formData.story.mission}
                                        onChange={(e) => handleStoryChange('mission', e.target.value)}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-xs italic"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Vision Statement</label>
                                    <textarea
                                        value={formData.story.vision}
                                        onChange={(e) => handleStoryChange('vision', e.target.value)}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-xs italic"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4 pt-8 border-t border-stone-50">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Founder's Note</label>
                                <input
                                    value={formData.story.founderTitle}
                                    onChange={(e) => handleStoryChange('founderTitle', e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm font-bold"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Founder Name</label>
                                        <input
                                            value={formData.story.founderName}
                                            onChange={(e) => handleStoryChange('founderName', e.target.value)}
                                            className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm"
                                            placeholder="Founder Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Founder Image</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={formData.story.founderImage || ''}
                                                onChange={(e) => handleStoryChange('founderImage', e.target.value)}
                                                className="flex-1 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-sm"
                                                placeholder="Image URL"
                                            />
                                            <button
                                                onClick={() => founderFileInputRef.current?.click()}
                                                className="px-4 py-3 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors min-w-[48px]"
                                                title="Upload image"
                                                type="button"
                                            >
                                                <span className="material-symbols-outlined text-stone-500">upload_file</span>
                                            </button>
                                            <input
                                                ref={founderFileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFounderImageUpload}
                                                className="hidden"
                                            />
                                        </div>
                                        {isUploading && (
                                            <div className="w-full bg-stone-100 rounded-full h-1 overflow-hidden">
                                                <div className="bg-primary h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                                            </div>
                                        )}
                                        <div className="mt-3 w-24 h-24 rounded-xl overflow-hidden border border-stone-100 bg-stone-50">
                                            <img src={formData.story.founderImage || '/assets/founder.png'} alt="Founder Preview" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                </div>
                                {formData.story.founderText.map((para, pIdx) => (
                                    <textarea
                                        key={pIdx}
                                        value={para}
                                        onChange={(e) => {
                                            const newText = [...formData.story.founderText];
                                            newText[pIdx] = e.target.value;
                                            handleStoryChange('founderText', newText);
                                        }}
                                        className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 text-xs text-stone-600"
                                        rows={3}
                                    />
                                ))}
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
                            {(formData.footerSections || []).map((section, sIndex) => (
                                <div key={sIndex}>
                                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">{section.title}</p>
                                    <div className="space-y-3">
                                        {(section.links || []).map((link, lIndex) => (
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
                                    {(formData.socialLinks || []).map((social, i) => (
                                        <div key={social.platform} className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-stone-50 rounded-lg flex items-center justify-center border border-stone-100 flex-shrink-0 text-stone-400">
                                                <SocialIcon platform={social.platform} className="w-4 h-4" />
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
