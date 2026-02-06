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
    image?: string;
}

export interface RitualStep {
    name: string;
    desc: string;
}

export interface Ritual {
    title: string;
    collection: string;
    image: string;
    steps: RitualStep[];
}

export interface CoreValue {
    title: string;
    desc: string;
    icon: string;
}

export interface StoryContent {
    aboutTitle: string;
    aboutText: string;
    mission: string;
    vision: string;
    visionSub: string;
    founderTitle: string;
    founderText: string[];
    founderName: string;
    founderImage: string;
    coreValues: CoreValue[];
}

export interface AnnouncementBar {
    text: string;
    link: string;
    active: boolean;
    backgroundColor: string;
    textColor: string;
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
    ritualGuide: Ritual[];
    story: StoryContent;
    announcementBar: AnnouncementBar;
}

interface SiteConfigContextType {
    siteConfig: SiteConfig;
    updateSiteConfig: (newConfig: Partial<SiteConfig>) => void;
    resetToDefaults: () => void;
}

const defaultNavLinks: NavLink[] = [
    { name: 'Shop All', path: '/shop' },
    { name: 'Our Story', path: '/story' },
    { name: 'Skin Blog', path: '/journal' },
    { name: 'Skin Quiz', path: '/quiz' },
    { name: 'Contact', path: '/contact' },
];

const defaultFooterSections: FooterSection[] = [
    {
        title: 'Products',
        links: [
            { name: 'Shop All', path: '/shop' },
            { name: 'Cleansers', path: '/shop?q=Cleansers' },
            { name: 'Serums', path: '/shop?q=Serums' },
            { name: 'Loyalty Program', path: '/loyalty' }
        ]
    },
    {
        title: 'About Us',
        links: [
            { name: 'Our Story', path: '/story' },
            { name: 'Skin Blog', path: '/journal' },
            { name: 'Contact', path: '/contact' },
            { name: 'Skin Quiz', path: '/quiz' }
        ]
    },
    {
        title: 'Customer Service',
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
    email: "support@ciskincare.com",
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
    { title: 'Nighttime Essentials', sub: 'Restore Your Skin', img: '/products/gluta-master-set.jpg', status: 'Scheduled' }
];

const defaultPhilosophy: Philosophy = {
    title: "About C.I SKIN CARE",
    content: "We believe that high-quality skincare should be safe and effective. Our products are made with natural ingredients to give you real results you can see."
};

const defaultTestimonials: Testimonial[] = [
    { author: 'Ama O.', quote: 'My skin has never felt better. The Radiance Serum is my favorite. It makes my skin look so healthy.', image: '/assets/customer-portrait.png' },
    { author: 'Sophia R.', quote: 'Definitely worth it. I saw results very quickly.', image: '/assets/customer-portrait.png' }
];

const defaultRitualGuide: Ritual[] = [
    {
        title: "The 5D Gluta Glow Routine",
        collection: "5D Gluta Miracle",
        image: "/products/5d-gluta-diamond-box.jpg",
        steps: [
            { name: "Cleanse", desc: "Start with the Exfoliating Gel to clean your skin." },
            { name: "Apply Serum", desc: "Use 3-4 drops of the 5D Gluta Serum on damp skin." },
            { name: "Moisturize", desc: "Finish with the 5D Gluta Moisturizer to keep your skin hydrated." }
        ]
    },
    {
        title: "The Bel Eclat Routine",
        collection: "BEL ECLAT Tumeric",
        image: "/products/bel-eclat-hero.jpg",
        steps: [
            { name: "Wash", desc: "Use the Tumeric Cleanser to soothe your skin." },
            { name: "Hydrate", desc: "Apply the Tumeric Face Cream for a natural glow." },
            { name: "Protect", desc: "Finish with the Bel Eclat Body Lotion." }
        ]
    }
];

const defaultStory: StoryContent = {
    aboutTitle: "Beauty is Confidence",
    aboutText: "Confidence comes from taking care of yourself. At C.I Skin Care, we want to give you quality and safe body care products that help you feel ready to take on the world.",
    mission: "To help our customers feel confident in their own skin by using our products.",
    vision: "To be the best customer-focused skincare company in Ghana and Africa, offering safe and affordable products.",
    visionSub: "We promise to meet your needs by selling only safe and high-quality skincare.",
    founderTitle: "Authentic Quality",
    founderText: [
        "When I started C.I Skin Care, my goal was simple: to create a brand that gives everyone confidence.",
        "Every product we make is tested for safety. We believe that good skincare is a promise of quality."
    ],
    founderName: "Comfort I.",
    founderImage: "/assets/founder.png",
    coreValues: [
        { title: 'Customer First', desc: 'We put our customers and their well-being first.', icon: 'person_heart' },
        { title: 'Integrity', desc: 'We follow all skincare rules and are open about how we work.', icon: 'verified_user' },
        { title: 'Quality', desc: 'We never compromise on the quality of our products.', icon: 'high_quality' },
        { title: 'Teamwork', desc: 'We work together and respect each other.', icon: 'group' }
    ]
};

const defaultAnnouncementBar: AnnouncementBar = {
    text: "Free shipping on orders over GH₵500",
    link: "/shop",
    active: true,
    backgroundColor: "#221C1D",
    textColor: "#FFFFFF"
};

const defaultSiteConfig: SiteConfig = {
    navLinks: defaultNavLinks,
    footerSections: defaultFooterSections,
    socialLinks: defaultSocialLinks,
    contactInfo: defaultContactInfo,
    homeSections: defaultHomeSections,
    heroBanners: defaultHeroBanners,
    philosophy: defaultPhilosophy,
    testimonials: defaultTestimonials,
    ritualGuide: defaultRitualGuide,
    story: defaultStory,
    announcementBar: defaultAnnouncementBar
};



const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [siteConfig, setSiteConfig] = useState<SiteConfig>(defaultSiteConfig);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const configRef = doc(db, 'settings', 'siteConfig');

        const unsubscribe = onSnapshot(configRef, {
            next: (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Merge with defaults to ensure completeness of schema
                    setSiteConfig({
                        ...defaultSiteConfig,
                        ...data,
                        // Deeper merge for nested objects if necessary, but SiteConfig is mostly arrays/objects
                        contactInfo: { ...defaultSiteConfig.contactInfo, ...data.contactInfo },
                        philosophy: { ...defaultSiteConfig.philosophy, ...data.philosophy },
                        story: { ...defaultSiteConfig.story, ...data.story },
                        announcementBar: { ...defaultSiteConfig.announcementBar, ...data.announcementBar },
                    } as SiteConfig);
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
                    }).catch(err => {
                        console.error("Failed to initialize site config doc", err);
                        setSiteConfig(initialConfig);
                        setLoading(false);
                    });
                }
            },
            error: (error) => {
                console.error("SiteConfig onSnapshot error:", error);
                setSiteConfig(defaultSiteConfig);
                setLoading(false);
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
