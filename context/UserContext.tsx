import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, query, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';

interface UserContextType {
    currentUser: UserProfile | null;
    allUsers: UserProfile[];
    loading: boolean;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);



export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = collection(db, 'users');

        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const users: UserProfile[] = [];
            snapshot.forEach(doc => {
                const data = doc.data() as UserProfile;
                users.push(data);
            });
            setAllUsers(users);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.id);
        await setDoc(userRef, updates, { merge: true });
    };

    return (
        <UserContext.Provider value={{ currentUser, allUsers, loading, updateProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
