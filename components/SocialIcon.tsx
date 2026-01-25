import React from 'react';

interface SocialIconProps {
    platform: string;
    className?: string;
}

const SocialIcon: React.FC<SocialIconProps> = ({ platform, className = "w-5 h-5" }) => {
    const p = platform.toLowerCase();

    switch (p) {
        case 'facebook':
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                    <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V1.74c-.75-.07-2.47-.24-4.68-.24-4.55 0-7.3 2.7-7.3 8.3v2H2.5v4H5.5v12h5v-12h3.5z" />
                </svg>
            );
        case 'instagram':
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
                </svg>
            );
        case 'twitter':
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
            );
        case 'youtube':
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                    <path d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M10,16.5v-9l6,4.5L10,16.5z" />
                </svg>
            );
        case 'tiktok':
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
            );
        case 'jiji':
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
                    {/* Simplified Jiji-like block logo - Jiji logo is complex, using a stylized block J */}
                    <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm4.5 9a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5V8h-2v4a.5.5 0 0 1-.5.5.5.5 0 0 1-.5-.5V8H9.5v4z M12 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
                </svg>
            );
        default:
            return <span className="material-symbols-outlined text-lg">link</span>;
    }
};

export default SocialIcon;
