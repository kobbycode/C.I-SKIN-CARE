import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, query, getDocs, addDoc, where, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { UserProfile } from '../types';

interface UserContextType {
    currentUser: UserProfile | null;
    allUsers: UserProfile[];
    loading: boolean;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    registerWithEmail: (payload: { fullName: string; email: string; password: string }) => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);



export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = collection(db, 'users');
        const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
            const users: UserProfile[] = [];
            snapshot.forEach(doc => {
                const data = doc.data() as UserProfile;
                users.push(data);
            });
            setAllUsers(users);
        });
        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                    setCurrentUser(snap.data() as UserProfile);
                } else {
                    const newUser: UserProfile = {
                        id: firebaseUser.uid,
                        fullName: firebaseUser.displayName || 'Member',
                        email: firebaseUser.email || '',
                        statusLabel: 'Member',
                        skinType: 'Unknown',
                        skinTypeDetail: '',
                        focusRitual: 'None',
                        focusRitualDetail: '',
                        points: 0,
                        pointsTier: 'Bronze',
                        pointsToNextTier: 100,
                        joinedDate: new Date().toISOString(),
                        avatar: ''
                    };
                    await setDoc(userRef, newUser, { merge: true });
                    setCurrentUser(newUser);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return () => {
            unsubscribeUsers();
            unsubscribeAuth();
        };
    }, []);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.id);
        await setDoc(userRef, updates, { merge: true });
        setCurrentUser({ ...currentUser, ...updates });
    };

    const registerWithEmail = async ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;
        const userRef = doc(db, 'users', uid);
        const newUser: UserProfile = {
            id: uid,
            fullName,
            email,
            statusLabel: 'Member',
            skinType: 'Unknown',
            skinTypeDetail: '',
            focusRitual: 'None',
            focusRitualDetail: '',
            points: 0,
            pointsTier: 'Bronze',
            pointsToNextTier: 100,
            joinedDate: new Date().toISOString(),
            avatar: ''
        };
        await setDoc(userRef, newUser, { merge: true });
        setCurrentUser(newUser);
    };

    const loginWithEmail = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
            const newUser: UserProfile = {
                id: firebaseUser.uid,
                fullName: firebaseUser.displayName || 'Member',
                email: firebaseUser.email || '',
                statusLabel: 'Member',
                skinType: 'Unknown',
                skinTypeDetail: '',
                focusRitual: 'None',
                focusRitualDetail: '',
                points: 0,
                pointsTier: 'Bronze',
                pointsToNextTier: 100,
                joinedDate: new Date().toISOString(),
                avatar: firebaseUser.photoURL || ''
            };
            await setDoc(userRef, newUser, { merge: true });
            setCurrentUser(newUser);
        }
    };

    const logout = () => {
        signOut(auth);
    };

    return (
        <UserContext.Provider value={{ currentUser, allUsers, loading, updateProfile, registerWithEmail, loginWithEmail, loginWithGoogle, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
