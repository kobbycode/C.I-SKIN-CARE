import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, writeBatch, getDocs, setDoc, deleteDoc } from 'firebase/firestore';

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

        const seedFaqs = async () => {
            try {
                const snapshot = await getDocs(faqsRef);
                if (snapshot.empty) {
                    const batch = writeBatch(db);
                    const mockFaqs = [
                        {
                            question: "Are C.I SKIN CARE products safe for sensitive skin?",
                            answer: "All our formulations undergo rigorous dermatological testing under clinical supervision.",
                            category: "Safety",
                            status: "Public",
                            views: 1200,
                            lastUpdated: new Date().toISOString()
                        },
                        {
                            question: "What is the typical shelf life of the botanical serums?",
                            answer: "Our serums have a shelf life of 24 months unopened.",
                            category: "Product Care",
                            status: "Public",
                            views: 856,
                            lastUpdated: new Date().toISOString()
                        },
                        {
                            question: "Do you use synthetic fragrances? ",
                            answer: "No. Our scents are derived naturally from botanical extracts and essential oils.",
                            category: "Ingredients",
                            status: "Public",
                            views: 2100,
                            lastUpdated: new Date().toISOString()
                        }
                    ];

                    mockFaqs.forEach(f => {
                        const ref = doc(faqsRef);
                        batch.set(ref, { ...f, id: ref.id });
                    });
                    await batch.commit();
                }
            } catch (error) {
                console.error("Error seeding FAQs:", error);
            }
        };

        seedFaqs();

        const unsubscribe = onSnapshot(faqsRef, (snapshot) => {
            const items: FAQ[] = [];
            snapshot.forEach(doc => items.push(doc.data() as FAQ));
            setFaqs(items);
            setLoading(false);
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
