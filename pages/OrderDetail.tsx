import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useUser } from '../context/UserContext';
import { Order } from '../types';

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { orders } = useOrders();
    const { currentUser } = useUser();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (orders.length > 0 && id) {
            const foundOrder = orders.find(o => o.id === id);
            if (foundOrder) {
                // simple security check: ensure order belongs to current user
                if (currentUser && foundOrder.customerEmail !== currentUser.email) {
                    navigate('/profile'); // Redirect if trying to view someone else's order
                    return;
                }
                setOrder(foundOrder);
            }
        }
    }, [orders, id, currentUser, navigate]);

    if (!order) {
        return (
            <div className="pt-40 pb-24 px-10 min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <main className="pt-32 pb-24 px-6 md:px-12 bg-background-light dark:bg-background-dark min-h-screen">
            <div className="max-w-4xl mx-auto">
                <Link to="/profile" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-accent mb-8 transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Back to Profile
                </Link>

                <div className="bg-white dark:bg-stone-900 border border-primary/10 rounded-2xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-8 border-b border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="font-display text-2xl md:text-3xl text-secondary dark:text-white">
                                    Order #{order.id.slice(0, 8).toUpperCase()}
                                </h1>
                                <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-600' :
                                        order.status === 'Cancelled' ? 'bg-red-500/10 text-red-600' :
                                            'bg-orange-500/10 text-orange-600'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-xs opacity-60">Placed on {formatDate(order.date)} at {order.time}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-1">Total Amount</p>
                            <p className="font-display text-2xl text-secondary dark:text-white">GH₵{order.total.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-8 border-b border-primary/10">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 mb-6">Ritual Selections</h3>
                        <div className="space-y-6">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex gap-6 items-center">
                                    <div className="w-20 h-20 bg-primary/5 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-display text-lg text-secondary dark:text-white mb-1">{item.name}</h4>
                                        <p className="text-xs opacity-60 mb-2">{item.category}</p>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="font-bold">Qty: {item.quantity}</span>
                                            <span className="text-accent">GH₵{item.price.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="text-right font-display text-lg">
                                        GH₵{(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Details */}
                    <div className="p-8 bg-primary/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 mb-4">Delivery Details</h3>
                            <address className="not-italic text-sm opacity-70 leading-relaxed">
                                <strong className="block text-secondary dark:text-white">{order.customerName}</strong>
                                {order.shippingAddress}<br />
                                {order.deliveryContactPhone && <span className="block mt-1">Phone: {order.deliveryContactPhone}</span>}
                                {order.deliveryNotes && <span className="block mt-2 italic text-xs">Note: {order.deliveryNotes}</span>}
                            </address>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 mb-4">Payment Information</h3>
                            <div className="text-sm opacity-70 space-y-2">
                                <p>Method: <span className="font-bold text-secondary dark:text-white capitalize">{order.paymentMethod}</span></p>
                                <p>Status: <span className={`font-bold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>{order.paymentStatus || 'Pending'}</span></p>
                                {order.paymentReference && <p className="text-xs">Ref: {order.paymentReference}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default OrderDetail;
