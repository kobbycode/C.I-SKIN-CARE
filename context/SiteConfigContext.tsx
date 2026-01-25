import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

export interface NavLink {
    name: string;
    path: string;
}

export interface FooterSection {
    title: string;
    links: NavLink[];
}

export interface SocialLink {
    platform: string;
    url: string;
}

export interface ContactInfo {
    address: string;
    email: string;
    phone: string;
}

export interface HomeSection {
    id: string;
    name: string;
    type: string;
    active: boolean;
}

export interface HeroBanner {
    title: string;
    sub: string;
    img: string;
    status: 'Live' | 'Scheduled' | 'Draft';
}

export interface Philosophy {
    title: string;
    content: string;
}

export interface Testimonial {
    author: string;
    quote: string;
}

export interface SiteConfig {
    navLinks: NavLink[];
    footerSections: FooterSection[];
    socialLinks: SocialLink[];
    contactInfo: ContactInfo;
    homeSections: HomeSection[];
    heroBanners: HeroBanner[];
    philosophy: Philosophy;
    testimonials: Testimonial[];
}

interface SiteConfigContextType {
    siteConfig: SiteConfig;
    updateSiteConfig: (newConfig: Partial<SiteConfig>) => void;
    resetToDefaults: () => void;
}

const defaultNavLinks: NavLink[] = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Our Story', path: '/story' },
    { name: 'Skin Journal', path: '/journal' },
    { name: 'Skin Quiz', path: '/quiz' },
    { name: 'Contact', path: '/contact' },
];

const defaultFooterSections: FooterSection[] = [
    {
        title: 'The Collection',
        links: [
            { name: 'Shop All', path: '/shop' },
            { name: 'Cleansers', path: '/shop?q=Cleansers' },
            { name: 'Serums', path: '/shop?q=Serums' },
            { name: 'Loyalty Ritual', path: '/loyalty' }
        ]
    },
    {
        title: 'The Brand',
        links: [
            { name: 'Our Story', path: '/story' },
            { name: 'Skin Journal', path: '/journal' },
            { name: 'Contact', path: '/contact' },
            { name: 'Skin Quiz', path: '/quiz' }
        ]
    },
    {
        title: 'Concierge',
        links: [
            { name: 'Shipping', path: '/faq' },
            { name: 'Returns', path: '/faq' },
            { name: 'Privacy', path: '/faq' },
            { name: 'FAQ', path: '/faq' }
        ]
    }
];

const defaultSocialLinks: SocialLink[] = [
    { platform: 'Instagram', url: '' },
    { platform: 'Facebook', url: '' },
    { platform: 'Twitter', url: '' },
    { platform: 'YouTube', url: '' },
    { platform: 'TikTok', url: '' },
    { platform: 'Jiji', url: '' }
];

const defaultContactInfo: ContactInfo = {
    address: "452 Fifth Avenue, Suite 1200\nNew York, NY 10018, USA",
    email: "concierge@ciskincare.com",
    phone: "+1 (800) 555-SKIN"
};

const defaultHomeSections: HomeSection[] = [
    { id: '1', name: 'Featured Products Grid', type: 'Product Carousel', active: true },
    { id: '2', name: 'Philosophy Quote', type: 'Typography Block', active: true },
    { id: '3', name: 'Natural Ingredients', type: 'Grid Gallery', active: true },
    { id: '4', name: 'Instagram Feed', type: 'Social Plugin', active: false }
];

const defaultHeroBanners: HeroBanner[] = [
    { title: 'The Science of Glow', sub: 'Spring Collection 2024', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAboFWaO4tGfvMQ6x8YVJhB4MsX9dAZvyVpImJ-E-HQ5E0T6G3kprf7DBc12UgFaVPuHeEOkebv_0CJBJ_wQ4VbOtkKjBYLJ_dF_vQOsq9jMlTOLcKsMyexRCotCfntLS2pyoB4LRlymwjKRwEg4dgR7SJCdOC_JztikGLdytoTpzKHG-0hClG3QDNBaSwD3QxxksB6ZJ4NhHGCpAdfx3Y2ICUr635Lbhmi0u3gMw2mEeFkH8-ZukAvPyJRQjCEZgE6nmgU6H2u__Y', status: 'Live' },
    { title: 'Ritual of Restoration', sub: 'Nighttime Essentials', img: '/products/gluta-master-set.jpg', status: 'Scheduled' }
];

const defaultPhilosophy: Philosophy = {
    title: "The Philosophy of C.I SKIN CARE",
    content: "We believe that luxury should never compromise integrity. Our formulations are crafted with botanical extracts and clinical actives to deliver transformative results you can see and feel."
};

const defaultTestimonials: Testimonial[] = [
    { author: 'Elena V.', quote: 'My skin has never felt more alive. The Radiance Serum is my holy grail. It\'s not just skincare, it\'s a daily ritual of self-love.' },
    { author: 'Sophia R.', quote: 'A literal game changer for my morning routine. I have never seen such fast results.' }
];

const defaultSiteConfig: SiteConfig = {
    navLinks: defaultNavLinks,
    footerSections: defaultFooterSections,
    socialLinks: defaultSocialLinks,
    contactInfo: defaultContactInfo,
    homeSections: defaultHomeSections,
    heroBanners: defaultHeroBanners,
    philosophy: defaultPhilosophy,
    testimonials: defaultTestimonials
};



const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const configRef = doc(db, 'settings', 'siteConfig');

        const unsubscribe = onSnapshot(configRef, (docSnap) => {
            if (docSnap.exists()) {
                setSiteConfig(docSnap.data() as SiteConfig);
                setLoading(false);
            } else {
                // Migration: Check local storage or use defaults
                let initialConfig = defaultSiteConfig;
                try {
                    const localData = localStorage.getItem('siteConfig_v2');
                    if (localData) {
                        initialConfig = { ...defaultSiteConfig, ...JSON.parse(localData) };
                    }
                } catch (e) {
                    console.error("Local storage error", e);
                }

                // Initialize Firestore
                setDoc(configRef, initialConfig).then(() => {
                    setSiteConfig(initialConfig);
                    setLoading(false);
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const updateSiteConfig = async (newConfig: Partial<SiteConfig>) => {
        // Optimistic update
        const updated = { ...siteConfig, ...newConfig };
        setSiteConfig(updated);

        try {
            const configRef = doc(db, 'settings', 'siteConfig');
            await setDoc(configRef, updated, { merge: true });
        } catch (error) {
            console.error("Failed to update site config in Firestore", error);
            // Revert? For now, simplistic handling.
        }
    };

    const resetToDefaults = async () => {
        setSiteConfig(defaultSiteConfig);
        try {
            const configRef = doc(db, 'settings', 'siteConfig');
            await setDoc(configRef, defaultSiteConfig);
        } catch (error) {
            console.error("Failed to reset site config", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-[#E5D3B3] border-t-[#A68966] rounded-full animate-spin"></div>
                    <div className="text-[10px] uppercase tracking-[0.4em] text-[#A68966] font-bold animate-pulse">Initializing Boutique</div>
                </div>
            </div>
        );
    }

    return (
        <SiteConfigContext.Provider value={{ siteConfig, updateSiteConfig, resetToDefaults }}>
            {children}
        </SiteConfigContext.Provider>
    );
};

export const useSiteConfig = () => {
    const context = useContext(SiteConfigContext);
    if (!context) {
        throw new Error('useSiteConfig must be used within a SiteConfigProvider');
    }
    return context;
};
