import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, writeBatch, getDocs, query, setDoc, deleteDoc } from 'firebase/firestore';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';

interface ProductContextType {
    products: Product[];
    loading: boolean;
    addProduct: (product: Omit<Product, 'id'>) => Promise<string>;
    updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
    bulkDeleteProducts: (ids: string[]) => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const productsRef = collection(db, 'products');





        // Subscribe to changes
        const unsubscribe = onSnapshot(productsRef, {
            next: (snapshot) => {
                // Fallback to mock data if Firestore is empty
                if (snapshot.empty) {
                    console.warn("Firestore product collection is empty. Falling back to MOCK_PRODUCTS.");
                    setProducts(MOCK_PRODUCTS);
                    setLoading(false);
                    return;
                }

                const items: Product[] = [];
                snapshot.forEach(docSnap => {
                    const data = docSnap.data() as Omit<Product, 'id'>;
                    // Ensure we always have a stable id field and default status to Active if missing
                    items.push({
                        id: docSnap.id,
                        ...data,
                        status: data.status || 'Active'
                    } as Product);
                });
                setProducts(items);
                setLoading(false);
            },
            error: (error) => {
                console.error("Firestore onSnapshot error:", error);
                console.warn("Falling back to MOCK_PRODUCTS due to error.");
                setProducts(MOCK_PRODUCTS);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const addProduct = async (product: Omit<Product, 'id'>) => {
        try {
            const productsRef = collection(db, 'products');
            const docRef = doc(productsRef); // Generate ID
            const newProduct = { ...product, id: docRef.id };
            await setDoc(docRef, newProduct);
            return docRef.id;
        } catch (error) {
            console.error("Error adding product:", error);
            throw error;
        }
    };

    const updateProduct = async (id: string, updates: Partial<Product>) => {
        try {
            const productRef = doc(db, 'products', id);
            await setDoc(productRef, updates, { merge: true });
        } catch (error) {
            console.error("Error updating product:", error);
            throw error;
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            const productRef = doc(db, 'products', id);
            await deleteDoc(productRef);
        } catch (error) {
            console.error("Error deleting product:", error);
            throw error;
        }
    };

    const bulkDeleteProducts = async (ids: string[]) => {
        try {
            const batch = writeBatch(db);
            ids.forEach(id => {
                const productRef = doc(db, 'products', id);
                batch.delete(productRef);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error bulk deleting products:", error);
            throw error;
        }
    };

    return (
        <ProductContext.Provider value={{ products, loading, addProduct, updateProduct, deleteProduct, bulkDeleteProducts }}>
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
