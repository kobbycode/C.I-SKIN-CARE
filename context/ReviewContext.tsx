import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, writeBatch, getDocs, query, setDoc, deleteDoc, where } from 'firebase/firestore';
import { Review } from '../types';
import { MOCK_REVIEWS } from '../constants';

interface ReviewContextType {
    reviews: Review[];
    loading: boolean;
    getApprovedReviewsByProduct: (productId: string) => Review[];
    addReview: (review: Omit<Review, 'id' | 'status'>) => Promise<string>;
    updateReviewStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const reviewsRef = collection(db, 'reviews');





        // Subscribe to all changes (for Admin)
        const unsubscribe = onSnapshot(reviewsRef, (snapshot) => {
            const items: Review[] = [];
            snapshot.forEach(doc => {
                items.push(doc.data() as Review);
            });
            setReviews(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getApprovedReviewsByProduct = (productId: string) => {
        return reviews.filter(r => r.productId === productId && r.status === 'Approved');
    };

    const addReview = async (review: Omit<Review, 'id' | 'status'>) => {
        try {
            const reviewsRef = collection(db, 'reviews');
            const docRef = doc(reviewsRef);
            const newReview: Review = {
                ...review,
                id: docRef.id,
                status: 'Pending'
            };
            await setDoc(docRef, newReview);
            return docRef.id;
        } catch (error) {
            console.error("Error adding review:", error);
            throw error;
        }
    };

    const updateReviewStatus = async (id: string, status: 'Approved' | 'Rejected') => {
        try {
            const reviewRef = doc(db, 'reviews', id);
            await setDoc(reviewRef, { status }, { merge: true });
        } catch (error) {
            console.error("Error updating review status:", error);
            throw error;
        }
    };

    return (
        <ReviewContext.Provider value={{ reviews, loading, getApprovedReviewsByProduct, addReview, updateReviewStatus }}>
            {children}
        </ReviewContext.Provider>
    );
};

export const useReviews = () => {
    const context = useContext(ReviewContext);
    if (!context) {
        throw new Error('useReviews must be used within a ReviewProvider');
    }
    return context;
};
