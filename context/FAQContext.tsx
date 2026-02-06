import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    status: 'Public' | 'Draft';
    views: number;
    lastUpdated: string;
}

interface FAQContextType {
    faqs: FAQ[];
    loading: boolean;
    addFAQ: (faq: Omit<FAQ, 'id' | 'views' | 'lastUpdated'>) => Promise<string>;
    updateFAQ: (id: string, faq: Partial<FAQ>) => Promise<void>;
    deleteFAQ: (id: string) => Promise<void>;
}

const FAQContext = createContext<FAQContextType | undefined>(undefined);

export const FAQProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const faqsRef = collection(db, 'faqs');

        const unsubscribe = onSnapshot(faqsRef, {
            next: (snapshot) => {
                const items: FAQ[] = [];
                snapshot.forEach(doc => items.push(doc.data() as FAQ));
                setFaqs(items);
                setLoading(false);
            },
            error: (error) => {
                console.error("FAQ onSnapshot error:", error);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const addFAQ = async (faq: Omit<FAQ, 'id' | 'views' | 'lastUpdated'>) => {
        const faqsRef = collection(db, 'faqs');
        const docRef = doc(faqsRef);
        const newFAQ = {
            ...faq,
            id: docRef.id,
            views: 0,
            lastUpdated: new Date().toISOString()
        };
        await setDoc(docRef, newFAQ);
        return docRef.id;
    };

    const updateFAQ = async (id: string, faq: Partial<FAQ>) => {
        const faqRef = doc(db, 'faqs', id);
        await setDoc(faqRef, { ...faq, lastUpdated: new Date().toISOString() }, { merge: true });
    };

    const deleteFAQ = async (id: string) => {
        await deleteDoc(doc(db, 'faqs', id));
    };

    return (
        <FAQContext.Provider value={{ faqs, loading, addFAQ, updateFAQ, deleteFAQ }}>
            {children}
        </FAQContext.Provider>
    );
};

export const useFAQs = () => {
    const context = useContext(FAQContext);
    if (!context) throw new Error('useFAQs must be used within a FAQProvider');
    return context;
};
