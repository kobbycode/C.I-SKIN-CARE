import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../types';
import { useUser } from './UserContext';
import { useProducts } from './ProductContext';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface WishlistContextType {
    wishlist: Product[];
    toggleWishlist: (product: Product) => Promise<void>;
    isInWishlist: (id: string) => boolean;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
    return context;
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useUser();
    const { products } = useProducts();
    const [localWishlist, setLocalWishlist] = useState<string[]>(() => {
        const saved = localStorage.getItem('wishlist_ids');
        return saved ? JSON.parse(saved) : [];
    });

    // Derived state: actual Product objects
    const getWishlistProducts = (): Product[] => {
        const ids = currentUser ? (currentUser.wishlist || []) : localWishlist;
        // Map IDs to Products, filtering out any that might not exist in products list
        return ids
            .map(id => products.find(p => p.id === id))
            .filter((p): p is Product => p !== undefined && p.status === 'Active');
    };

    const wishlist = getWishlistProducts();

    // Sync local changes to localStorage
    useEffect(() => {
        if (!currentUser) {
            localStorage.setItem('wishlist_ids', JSON.stringify(localWishlist));
        }
    }, [localWishlist, currentUser]);

    const toggleWishlist = async (product: Product) => {
        const productId = product.id;

        if (currentUser) {
            // User Logic: Update Firestore
            const userRef = doc(db, 'users', currentUser.id);
            const isInfavorites = currentUser.wishlist?.includes(productId);

            try {
                if (isInfavorites) {
                    await updateDoc(userRef, { wishlist: arrayRemove(productId) });
                } else {
                    await updateDoc(userRef, { wishlist: arrayUnion(productId) });
                }
            } catch (error) {
                console.error('Failed to update wishlist', error);
            }
        } else {
            // Guest Logic: Update Local State
            setLocalWishlist(prev => {
                if (prev.includes(productId)) {
                    return prev.filter(id => id !== productId);
                }
                return [...prev, productId];
            });
        }
    };

    const isInWishlist = (id: string) => {
        if (currentUser) {
            return currentUser.wishlist?.includes(id) || false;
        }
        return localWishlist.includes(id);
    };

    const clearWishlist = () => {
        if (!currentUser) setLocalWishlist([]);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, clearWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
