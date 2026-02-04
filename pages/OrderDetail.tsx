import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useUser } from '../context/UserContext';
import { useNotification } from '../context/NotificationContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Order } from '../types';

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { orders } = useOrders();
    const { currentUser } = useUser();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [isUploadingTracking, setIsUploadingTracking] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
    const { showNotification } = useNotification();

    const handleReturnSubmit = async () => {
        if (!order || !returnReason) return;
        setIsSubmittingReturn(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            // Verify return eligibility (client-side check, should be enforced by rules/admin too)
            if (order.status !== 'Delivered') throw new Error('Order must be delivered to be returned');

            await updateDoc(orderRef, {
                returnRequested: true,
                returnReason: returnReason,
                returnStatus: 'Pending',
                returnDate: new Date().toISOString()
            });

            // Optimistic update (Context snapshop will eventually catch up)
            setOrder(prev => prev ? ({ ...prev, returnRequested: true, returnReason, returnStatus: 'Pending' }) : null);
            showNotification('Return request submitted for review', 'success');
            setShowReturnModal(false);
        } catch (error: any) {
            console.error(error);
            showNotification(error.message || 'Failed to submit return request', 'error');
        } finally {
            setIsSubmittingReturn(false);
        }
    };

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
                                <p>Status: <span className={`font-bold capitalize ${(order.paymentStatus === 'paid' || (order.status === 'Delivered' && order.paymentMethod === 'Pay on Delivery')) ? 'text-green-600' : 'text-orange-600'}`}>
                                    {(order.paymentStatus === 'paid' || (order.status === 'Delivered' && order.paymentMethod === 'Pay on Delivery')) ? 'Paid' : (order.paymentStatus || 'Pending')}
                                </span></p>
                                {order.paymentReference && <p className="text-xs">Ref: {order.paymentReference}</p>}

                                {order.discount && order.discount > 0 && (
                                    <p className="text-green-600 font-bold">Discount Applied: -GH₵{order.discount.toFixed(2)}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Return Request Section */}
                    {order.status === 'Delivered' && !order.returnRequested && (
                        <div className="p-8 border-t border-primary/10 bg-stone-50 dark:bg-stone-950/50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-sm text-secondary dark:text-white">Need to return an item?</h4>
                                    <p className="text-xs opacity-60 mt-1">Accepting returns within 30 days of delivery.</p>
                                </div>
                                <button
                                    onClick={() => setShowReturnModal(true)}
                                    className="px-6 py-3 border border-stone-200 dark:border-stone-700 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                >
                                    Request Return
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Return Status Banner */}
                    {order.returnRequested && (
                        <div className="p-6 bg-orange-50 dark:bg-orange-950/20 border-t border-orange-100 dark:border-orange-900/50">
                            <div className="flex items-start gap-4">
                                <span className="material-symbols-outlined text-orange-500">assignment_return</span>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-orange-700 dark:text-orange-400">Return Requested</h4>
                                    <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1">
                                        Status: <span className="font-bold uppercase">{order.returnStatus || 'Pending Review'}</span>
                                    </p>
                                    <p className="text-[10px] italic mt-2 opacity-70">Reason: {order.returnReason}</p>

                                    {/* Tracking Number Upload for Approved Returns */}
                                    {order.returnStatus === 'Approved' && (
                                        <div className="mt-6 p-4 bg-white dark:bg-stone-800 rounded-xl border border-orange-200 dark:border-orange-700">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D] dark:text-stone-300 mb-3 block">Submit Return Tracking</p>
                                            {order.returnTrackingNumber ? (
                                                <div className="flex items-center gap-2 text-green-600 font-bold text-[10px] uppercase">
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                    Tracking: {order.returnTrackingNumber}
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. DHL-987654321"
                                                        className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded px-3 py-2 text-xs focus:ring-accent"
                                                        onKeyDown={async (e) => {
                                                            if (e.key === 'Enter') {
                                                                const val = e.currentTarget.value;
                                                                if (!val) return;
                                                                if (isUploadingTracking) return;
                                                                setIsUploadingTracking(true);
                                                                try {
                                                                    await updateDoc(doc(db, 'orders', order.id), {
                                                                        returnTrackingNumber: val
                                                                    });
                                                                    setOrder(prev => prev ? { ...prev, returnTrackingNumber: val } : null);
                                                                    showNotification('Tracking number uploaded', 'success');
                                                                } catch (err) {
                                                                    showNotification('Failed to upload tracking', 'error');
                                                                } finally {
                                                                    setIsUploadingTracking(false);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={async (e) => {
                                                            const input = (e.currentTarget.previousSibling as HTMLElement).querySelector('input') || e.currentTarget.previousSibling as HTMLInputElement;
                                                            const val = (input as HTMLInputElement).value;
                                                            if (!val || isUploadingTracking) return;
                                                            setIsUploadingTracking(true);
                                                            try {
                                                                await updateDoc(doc(db, 'orders', order.id), {
                                                                    returnTrackingNumber: val
                                                                });
                                                                setOrder(prev => prev ? { ...prev, returnTrackingNumber: val } : null);
                                                                showNotification('Tracking number uploaded', 'success');
                                                            } catch (err) {
                                                                showNotification('Failed to upload tracking', 'error');
                                                            } finally {
                                                                setIsUploadingTracking(false);
                                                            }
                                                        }}
                                                        disabled={isUploadingTracking}
                                                        className="bg-[#221C1D] text-white px-4 py-2 rounded text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {isUploadingTracking ? (
                                                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                        ) : null}
                                                        Upload
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Return Modal */}
            {showReturnModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-primary/10">
                            <h3 className="font-display text-xl">Request Return</h3>
                            <p className="text-xs opacity-60 mt-1">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm opacity-80 leading-relaxed">
                                We're sorry the ritual didn't meet your expectations. Please describe the issue below, and our concierge team will review your request.
                            </p>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 block">Reason for Return</label>
                                <textarea
                                    className="w-full bg-primary/5 border-primary/10 rounded-lg p-3 text-sm focus:ring-accent min-h-[100px]"
                                    placeholder="e.g. Item damaged, Incorrect item sent..."
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-stone-50 dark:bg-stone-950/50 flex gap-3">
                            <button
                                onClick={() => setShowReturnModal(false)}
                                className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-stone-800 rounded transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReturnSubmit}
                                disabled={!returnReason || isSubmittingReturn}
                                className="flex-1 py-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default OrderDetail;
