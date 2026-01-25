import React, { createContext, useContext, useState, useEffect } from 'react';

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
    { platform: 'Instagram', url: 'https://instagram.com' },
    { platform: 'Facebook', url: '' },
    { platform: 'Twitter', url: '' },
    { platform: 'YouTube', url: '' }
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
    { title: 'The Science of Glow', sub: 'Spring Collection 2024', img: '/products/bel-eclat-hero.jpg', status: 'Live' },
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
    const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
        try {
            const savedConfig = localStorage.getItem('siteConfig');
            return savedConfig ? JSON.parse(savedConfig) : defaultSiteConfig;
        } catch (error) {
            console.error("Failed to load site config from local storage", error);
            return defaultSiteConfig;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('siteConfig', JSON.stringify(siteConfig));
        } catch (error) {
            console.error("Failed to save site config to local storage", error);
        }
    }, [siteConfig]);

    const updateSiteConfig = (newConfig: Partial<SiteConfig>) => {
        setSiteConfig(prev => ({ ...prev, ...newConfig }));
    };

    const resetToDefaults = () => {
        setSiteConfig(defaultSiteConfig);
    };

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
