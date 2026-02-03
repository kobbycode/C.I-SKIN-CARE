import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc, query, getDocs, addDoc, where, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, type User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../types';

interface UserContextType {
    currentUser: UserProfile | null;
    allUsers: UserProfile[];
    loading: boolean;
    /** Returns a Firebase ID token for serverless API auth */
    getIdToken: () => Promise<string | null>;
    /** Convenience role helpers */
    hasRole: (roles: Array<NonNullable<UserProfile['role']>>) => boolean;
    updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
    registerWithEmail: (payload: { fullName: string; email: string; password: string }) => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => void;
    deleteAccount: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);



export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeCurrentUser: (() => void) | null = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                // Clean up previous current user listener
                if (unsubscribeCurrentUser) {
                    unsubscribeCurrentUser();
                    unsubscribeCurrentUser = null;
                }

                if (firebaseUser) {
                    setFirebaseUser(firebaseUser);
                    const userRef = doc(db, 'users', firebaseUser.uid);

                    try {
                        const snap = await getDoc(userRef);
                        if (snap.exists()) {
                            const userData = snap.data() as UserProfile;
                            // Sync email from Auth to Firestore if they differ
                            if (firebaseUser.email && userData.email !== firebaseUser.email) {
                                await setDoc(userRef, { email: firebaseUser.email }, { merge: true });
                                userData.email = firebaseUser.email;
                            }
                            setCurrentUser(userData);

                            unsubscribeCurrentUser = onSnapshot(userRef, (docSnap) => {
                                if (docSnap.exists()) {
                                    setCurrentUser(docSnap.data() as UserProfile);
                                }
                            });
                        } else {
                            const username =
                                (firebaseUser.email?.split('@')[0] || firebaseUser.displayName || 'member')
                                    .toLowerCase()
                                    .replace(/[^a-z0-9._-]/g, '');
                            const newUser: UserProfile = {
                                id: firebaseUser.uid,
                                username,
                                fullName: firebaseUser.displayName || 'Member',
                                email: firebaseUser.email || '',
                                statusLabel: 'Member',
                                role: 'customer',
                                skinType: 'Unknown',
                                skinTypeDetail: '',
                                focusRitual: 'None',
                                focusRitualDetail: '',
                                points: 0,
                                pointsTier: 'Bronze',
                                pointsToNextTier: 100,
                                joinedDate: new Date().toISOString(),
                                avatar: '',
                                registrationMethod: 'web'
                            };
                            await setDoc(userRef, newUser, { merge: true });
                            setCurrentUser(newUser);

                            unsubscribeCurrentUser = onSnapshot(userRef, (docSnap) => {
                                if (docSnap.exists()) {
                                    setCurrentUser(docSnap.data() as UserProfile);
                                }
                            });
                        }
                    } catch (err) {
                        console.error("Error fetching user profile:", err);
                        // Fallback: create a basic user profile in state so app doesn't break
                        // or just log it. If we can't fetch profile, we probably can't do much.
                        // But we MUST unset loading.
                    }
                } else {
                    setFirebaseUser(null);
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Auth state change error:", error);
            } finally {
                setLoading(false);
            }
        });
        return () => {
            unsubscribeAuth();
            if (unsubscribeCurrentUser) {
                unsubscribeCurrentUser();
            }
        };
    }, []);

    // Separated: Fetch all users ONLY for staff/admin roles to avoid permission errors
    useEffect(() => {
        const isAdmin = currentUser?.role && ['super-admin', 'admin', 'manager', 'editor'].includes(currentUser.role);

        if (!isAdmin) {
            setAllUsers([]);
            return;
        }

        const usersRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const users: UserProfile[] = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data() as Omit<UserProfile, 'id'>;
                users.push({ id: docSnap.id, ...data });
            });
            setAllUsers(users);
        }, (error) => {
            console.error("All users listener error:", error);
        });

        return () => unsubscribe();
    }, [currentUser?.role]);

    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!currentUser) return;
        const userRef = doc(db, 'users', currentUser.id);
        await setDoc(userRef, updates, { merge: true });
        setCurrentUser({ ...currentUser, ...updates });
    };

    const getIdToken = async () => {
        if (!firebaseUser) return null;
        return await firebaseUser.getIdToken();
    };

    const hasRole = (roles: Array<NonNullable<UserProfile['role']>>) => {
        const r = currentUser?.role || 'customer';
        return roles.includes(r);
    };

    const registerWithEmail = async ({ fullName, email, password }: { fullName: string; email: string; password: string }) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;
        const userRef = doc(db, 'users', uid);
        const username =
            (email?.split('@')[0] || fullName || 'member')
                .toLowerCase()
                .replace(/[^a-z0-9._-]/g, '');
        const newUser: UserProfile = {
            id: uid,
            username,
            fullName,
            email,
            statusLabel: 'Member',
            role: 'customer',
            skinType: 'Unknown',
            skinTypeDetail: '',
            focusRitual: 'None',
            focusRitualDetail: '',
            points: 0,
            pointsTier: 'Bronze',
            pointsToNextTier: 100,
            joinedDate: new Date().toISOString(),
            avatar: '',
            registrationMethod: 'web'
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
            const username =
                (firebaseUser.email?.split('@')[0] || firebaseUser.displayName || 'member')
                    .toLowerCase()
                    .replace(/[^a-z0-9._-]/g, '');
            const newUser: UserProfile = {
                id: firebaseUser.uid,
                username,
                fullName: firebaseUser.displayName || 'Member',
                email: firebaseUser.email || '',
                statusLabel: 'Member',
                role: 'customer',
                skinType: 'Unknown',
                skinTypeDetail: '',
                focusRitual: 'None',
                focusRitualDetail: '',
                points: 0,
                pointsTier: 'Bronze',
                pointsToNextTier: 100,
                joinedDate: new Date().toISOString(),
                avatar: firebaseUser.photoURL || '',
                registrationMethod: 'web'
            };
            await setDoc(userRef, newUser, { merge: true });
            setCurrentUser(newUser);
        }
    };

    const logout = () => {
        signOut(auth);
    };

    const deleteAccount = async () => {
        if (!currentUser || !firebaseUser) throw new Error('No user logged in');
        // Delete Firestore document first
        const userRef = doc(db, 'users', currentUser.id);
        await setDoc(userRef, { deleted: true, deletedAt: new Date().toISOString() }, { merge: true });
        // Delete Firebase Auth user
        await firebaseUser.delete();
    };

    return (
        <UserContext.Provider value={{ currentUser, allUsers, loading, getIdToken, hasRole, updateProfile, registerWithEmail, loginWithEmail, loginWithGoogle, logout, deleteAccount }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within a UserProvider');
    return context;
};
