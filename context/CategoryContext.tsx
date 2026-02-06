import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, getDocs, writeBatch } from 'firebase/firestore';
import { Category } from '../types';

interface CategoryContextType {
    categories: Category[];
    loading: boolean;
    addCategory: (category: Omit<Category, 'id'>) => Promise<string>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

const SEED_CATEGORIES: Omit<Category, 'id'>[] = [
    { name: 'Cleansers', status: 'Active', displayOrder: 1 },
    { name: 'Serums & Elixirs', status: 'Active', displayOrder: 2 },
    { name: 'Moisturizers', status: 'Active', displayOrder: 3 },
    { name: 'Treatments', status: 'Active', displayOrder: 4 },
    { name: 'Collections', status: 'Seasonal', displayOrder: 5 }
];

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const categoriesRef = collection(db, 'categories');

        const unsubscribe = onSnapshot(categoriesRef, {
            next: (snapshot) => {
                const items: Category[] = [];
                snapshot.forEach(doc => {
                    items.push(doc.data() as Category);
                });

                if (items.length === 0) {
                    setCategories(SEED_CATEGORIES as Category[]);
                } else {
                    setCategories(items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
                }
                setLoading(false);
            },
            error: (error) => {
                console.error("Category onSnapshot error:", error);
                setCategories(SEED_CATEGORIES as Category[]);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const addCategory = async (category: Omit<Category, 'id'>) => {
        const categoriesRef = collection(db, 'categories');
        const newDoc = doc(categoriesRef);
        const data = { ...category, id: newDoc.id };
        await setDoc(newDoc, data);
        return newDoc.id;
    };

    const updateCategory = async (id: string, updates: Partial<Category>) => {
        const docRef = doc(db, 'categories', id);
        await setDoc(docRef, updates, { merge: true });
    };

    const deleteCategory = async (id: string) => {
        const docRef = doc(db, 'categories', id);
        await deleteDoc(docRef);
    };

    return (
        <CategoryContext.Provider value={{ categories, loading, addCategory, updateCategory, deleteCategory }}>
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (!context) throw new Error('useCategories must be used within a CategoryProvider');
    return context;
};
