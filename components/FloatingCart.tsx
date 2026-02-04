import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

const FloatingCart: React.FC = () => {
    const { cart, setCartOpen } = useApp();
    const [isVisible, setIsVisible] = useState(false);
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    useEffect(() => {
        const handleScroll = () => {
            // Show after scrolling 300px
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isVisible || cartCount === 0) return null;

    return (
        <button
            onClick={() => setCartOpen(true)}
            className="lg:hidden fixed bottom-6 right-6 z-[60] bg-primary text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center animate-in fade-in zoom-in duration-300 shimmer-btn"
        >
            <span className="material-symbols-outlined fill-1">shopping_bag</span>
            <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-primary">
                {cartCount}
            </span>
        </button>
    );
};

export default FloatingCart;
