import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface JournalPost {
    id: string;
    title: string;
    category: string;
    date: string;
    author: string;
    excerpt: string;
    content?: string;
    image: string;
    readTime: string;
    status: 'Published' | 'Draft';
}

interface JournalContextType {
    posts: JournalPost[];
    loading: boolean;
    addPost: (post: Omit<JournalPost, 'id'>) => Promise<string>;
    updatePost: (id: string, post: Partial<JournalPost>) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<JournalPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const postsRef = collection(db, 'journal');

        const unsubscribe = onSnapshot(postsRef, (snapshot) => {
            const items: JournalPost[] = [];
            snapshot.forEach(doc => items.push(doc.data() as JournalPost));
            setPosts(items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addPost = async (post: Omit<JournalPost, 'id'>) => {
        const postsRef = collection(db, 'journal');
        const docRef = doc(postsRef);
        await setDoc(docRef, { ...post, id: docRef.id });
        return docRef.id;
    };

    const updatePost = async (id: string, post: Partial<JournalPost>) => {
        const postRef = doc(db, 'journal', id);
        await setDoc(postRef, post, { merge: true });
    };

    const deletePost = async (id: string) => {
        await deleteDoc(doc(db, 'journal', id));
    };

    return (
        <JournalContext.Provider value={{ posts, loading, addPost, updatePost, deletePost }}>
            {children}
        </JournalContext.Provider>
    );
};

export const useJournal = () => {
    const context = useContext(JournalContext);
    if (!context) throw new Error('useJournal must be used within a JournalProvider');
    return context;
};
