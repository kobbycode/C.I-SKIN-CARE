import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, writeBatch, getDocs, setDoc, runTransaction } from 'firebase/firestore';
import { Order } from '../types';

interface OrderContextType {
    orders: Order[];
    loading: boolean;
    addOrder: (order: Omit<Order, 'id'>) => Promise<string>;
    updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ordersRef = collection(db, 'orders');



        const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
            const items: Order[] = [];
            snapshot.forEach(doc => items.push(doc.data() as Order));
            setOrders(items.sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time}`).getTime();
                const dateB = new Date(`${b.date} ${b.time}`).getTime();
                return dateB - dateA;
            }));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addOrder = async (order: Omit<Order, 'id'>) => {
        try {
            const ordersRef = collection(db, 'orders');
            const docRef = doc(ordersRef);


            // Helper to recursively remove undefined values
            const removeUndefined = (obj: any): any => {
                if (Array.isArray(obj)) {
                    return obj.map(removeUndefined);
                } else if (obj !== null && typeof obj === 'object') {
                    return Object.entries(obj).reduce((acc, [key, value]) => {
                        if (value !== undefined) {
                            acc[key] = removeUndefined(value);
                        }
                        return acc;
                    }, {} as any);
                }
                return obj;
            };

            const newOrder = removeUndefined({ ...order, id: docRef.id });

            await runTransaction(db, async (transaction) => {
                // 1. Read all product docs first
                const productRefs = order.items.map(item => doc(db, 'products', item.id));
                const productSnaps = await Promise.all(productRefs.map(ref => transaction.get(ref)));

                // 2. Prepare stock updates
                productSnaps.forEach((docSnap, index) => {
                    if (!docSnap.exists()) return;

                    const item = order.items[index];
                    const productData = docSnap.data();

                    if (item.selectedVariant) {
                        const variants = [...(productData?.variants || [])];
                        const variantIndex = variants.findIndex((v: any) => v.id === item.selectedVariant?.id);
                        if (variantIndex !== -1) {
                            variants[variantIndex] = {
                                ...variants[variantIndex],
                                stock: Math.max(0, (variants[variantIndex].stock || 0) - item.quantity)
                            };
                            transaction.update(productRefs[index], { variants });
                        }
                    } else {
                        const currentStock = productData?.stock || 0;
                        transaction.update(productRefs[index], { stock: Math.max(0, currentStock - item.quantity) });
                    }
                });

                // 3. Set the order
                transaction.set(docRef, newOrder);
            });

            return docRef.id;
        } catch (error) {
            console.error("Error adding order:", error);
            throw error;
        }
    };

    const updateOrderStatus = async (id: string, status: Order['status']) => {
        try {
            const orderRef = doc(db, 'orders', id);
            await setDoc(orderRef, { status }, { merge: true });
        } catch (error) {
            console.error("Error updating order status:", error);
            throw error;
        }
    };

    return (
        <OrderContext.Provider value={{ orders, loading, addOrder, updateOrderStatus }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) throw new Error('useOrders must be used within an OrderProvider');
    return context;
};
