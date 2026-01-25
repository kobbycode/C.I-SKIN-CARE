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

const DEFAULT_USER: UserProfile = {
    id: 'elena-rossi-9921',
    fullName: 'Elena Rossi',
    email: 'elena.rossi@luxury.it',
    statusLabel: 'Muse Status Since 2022',
    skinType: 'Combination',
    skinTypeDetail: 'Sensitive t-zone, balanced cheeks.',
    focusRitual: 'Radiance Boost',
    focusRitualDetail: 'Vitamin C and light hydration.',
    points: 840,
    pointsTier: 'Gold Ritual',
    pointsToNextTier: 160,
    joinedDate: 'Oct 2022',
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = collection(db, 'users');

        // Seed default user if none exists
        const seedIfEmpty = async () => {
            const q = query(usersRef);
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                await setDoc(doc(usersRef, DEFAULT_USER.id), DEFAULT_USER);
            }
        };

        seedIfEmpty().then(() => {
            const unsubscribe = onSnapshot(usersRef, (snapshot) => {
                const users: UserProfile[] = [];
                snapshot.forEach(doc => {
                    const data = doc.data() as UserProfile;
                    users.push(data);
                    // For now, we simulate being logged in as the default user
                    if (data.id === DEFAULT_USER.id) {
                        setCurrentUser(data);
                    }
                });
                setAllUsers(users);
                setLoading(false);
            });
            return () => unsubscribe();
        });
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
