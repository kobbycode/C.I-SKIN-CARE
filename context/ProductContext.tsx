import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, writeBatch, getDocs, query } from 'firebase/firestore';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';

interface ProductContextType {
    products: Product[];
    loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const productsRef = collection(db, 'products');

        // Check if we need to seed
        const seedProducts = async () => {
            try {
                const q = query(productsRef);
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    console.log("Seeding products to Firestore...");
                    const batch = writeBatch(db);

                    MOCK_PRODUCTS.forEach(product => {
                        const ref = doc(productsRef, product.id);
                        batch.set(ref, product);
                    });

                    await batch.commit();
                    console.log("Seeding complete.");
                }
            } catch (error) {
                console.error("Error seeding products:", error);
            }
        };

        // Run seed check once
        seedProducts();

        // Subscribe to changes
        const unsubscribe = onSnapshot(productsRef, (snapshot) => {
            const items: Product[] = [];
            snapshot.forEach(doc => {
                items.push(doc.data() as Product);
            });
            setProducts(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <ProductContext.Provider value={{ products, loading }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProducts = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
};
