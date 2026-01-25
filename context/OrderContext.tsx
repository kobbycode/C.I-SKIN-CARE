import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, writeBatch, getDocs, setDoc } from 'firebase/firestore';
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

        // Check if we need to seed
        const seedOrders = async () => {
            try {
                const snapshot = await getDocs(ordersRef);
                if (snapshot.empty) {
                    console.log("Seeding orders to Firestore...");
                    const batch = writeBatch(db);

                    const mockOrders: Omit<Order, 'id'>[] = [
                        {
                            customerName: 'Elena Larsson',
                            customerEmail: 'elena.l@example.com',
                            date: 'Oct 24, 2023',
                            time: '10:45 AM',
                            status: 'Processing',
                            total: 458.00,
                            items: [], // Mock empty for simplicity
                            shippingAddress: '1245 Strandvägen, Stockholm, 114 56, Sweden',
                            paymentMethod: 'Credit Card'
                        },
                        {
                            customerName: 'James Whittaker',
                            customerEmail: 'j.whit@provider.net',
                            date: 'Oct 23, 2023',
                            time: '04:12 PM',
                            status: 'Shipped',
                            total: 280.00,
                            items: [],
                            shippingAddress: 'Regent St, London, UK',
                            paymentMethod: 'PayPal'
                        }
                    ];

                    mockOrders.forEach(o => {
                        const ref = doc(ordersRef);
                        batch.set(ref, { ...o, id: ref.id });
                    });

                    await batch.commit();
                }
            } catch (error) {
                console.error("Error seeding orders:", error);
            }
        };

        seedOrders();

        const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
            const items: Order[] = [];
            snapshot.forEach(doc => items.push(doc.data() as Order));
            setOrders(items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const addOrder = async (order: Omit<Order, 'id'>) => {
        try {
            const ordersRef = collection(db, 'orders');
            const docRef = doc(ordersRef);
            const newOrder = { ...order, id: docRef.id };
            await setDoc(docRef, newOrder);
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
