import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useOrders } from '../../context/OrderContext';
import { db } from '../../firebaseConfig';
import { useInAppNotifications } from '../../context/InAppNotificationContext';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { doc, updateDoc, runTransaction, arrayUnion, deleteDoc } from 'firebase/firestore';

const Orders: React.FC = () => {
    const { orders, updateOrderStatus, loading } = useOrders();
    const { showNotification } = useNotification();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const { createNotification } = useInAppNotifications();

    // Set selected order from URL parameter
    useEffect(() => {
        const orderId = searchParams.get('id');
        if (orderId) {
            setSelectedOrderId(orderId);
        }
    }, [searchParams]);
    const [activeTab, setActiveTab] = useState('All Orders');
    const [searchTerm, setSearchTerm] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
    const { getIdToken } = useUser();

    const filteredOrders = useMemo(() => {
        let result = orders;

        // Filter by tab
        if (activeTab !== 'All Orders') {
            if (activeTab.startsWith('Returns')) {
                result = result.filter(o => o.returnRequested);
            } else {
                // Extract status from "Pending (5)" format -> "Pending"
                const status = activeTab.split(' (')[0];
                result = result.filter(o => o.status === status);
            }
        }

        // Filter by search
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(o =>
                o.customerName.toLowerCase().includes(lowSearch) ||
                o.id.toLowerCase().includes(lowSearch) ||
                o.customerEmail.toLowerCase().includes(lowSearch)
            );
        }

        return result;
    }, [orders, activeTab, searchTerm]);

    const selectedOrder = useMemo(() => {
        if (filteredOrders.length > 0) {
            return orders.find(o => o.id === selectedOrderId) || filteredOrders[0];
        }
        return null;
    }, [orders, filteredOrders, selectedOrderId]);

    const stats = useMemo(() => {
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return [
            { label: 'Pending Shipments', value: orders.filter(o => o.status === 'Pending').length.toString(), trend: '+5%', sub: 'Immediate action' },
            { label: 'Orders Today', value: orders.filter(o => o.date === today).length.toString(), trend: '-2%', sub: 'Updated now' },
            { label: 'Total Volume', value: 'GH₵' + orders.reduce((sum, o) => sum + o.total, 0).toLocaleString(), trend: '+8.4%', sub: 'Cycle projection' }
        ];
    }, [orders]);

    const handleStatusUpdate = async (id: string, status: any) => {
        setIsProcessingAction('status-' + status);
        try {
            const orderRef = doc(db, 'orders', id);
            const updates: any = {
                status,
                journey: arrayUnion({
                    status: status,
                    date: new Date().toISOString(),
                    message: `Ritual status updated to ${status}.`
                })
            };
            if (status === 'Shipped' && trackingNumber) {
                updates.trackingNumber = trackingNumber;
            }

            if (status === 'Delivered') {
                const targetOrder = orders.find(o => o.id === id);
                if (targetOrder && targetOrder.paymentMethod === 'Pay on Delivery') {
                    updates.paymentStatus = 'paid';
                }
            }

            await updateDoc(orderRef, updates);
            await updateOrderStatus(id, status);
            showNotification(`Order status updated to ${status}`, 'success');

            const order = orders.find(o => o.id === id);
            if (order && order.userId) {
                await createNotification({
                    recipientId: order.userId,
                    title: `Order Update: #${id.slice(0, 8)}`,
                    message: `Your order status has been updated to: ${status}`,
                    link: `/order/${id}`,
                    type: 'info'
                });
            }

            if (status === 'Shipped' || status === 'Delivered') {
                try {
                    const token = await getIdToken();
                    const emailType = status === 'Shipped' ? 'shipping_notification' : 'delivery_confirmation';
                    const targetOrder = orders.find(o => o.id === id);
                    if (targetOrder) {
                        await fetch('/api/send-order-email', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                order: { ...targetOrder, ...updates },
                                type: emailType
                            }),
                        });
                    }
                } catch (emailErr) {
                    console.error('Failed to trigger status email:', emailErr);
                }
            }
            setTrackingNumber('');
        } catch (error) {
            showNotification('Update failed', 'error');
        } finally {
            setIsProcessingAction(null);
        }
    };

    const handleCancelOrder = async (id: string) => {
        if (!window.confirm('Are you sure you want to cancel this ritual?')) return;
        setIsProcessingAction('cancel');
        try {
            const orderRef = doc(db, 'orders', id);
            const status = 'Cancelled';
            const updates = {
                status,
                journey: arrayUnion({
                    status,
                    date: new Date().toISOString(),
                    message: 'Ritual has been cancelled by the administrator.'
                })
            };
            await updateDoc(orderRef, updates);
            await updateOrderStatus(id, status);
            showNotification('Order cancelled', 'success');
        } catch (error) {
            showNotification('Cancellation failed', 'error');
        } finally {
            setIsProcessingAction(null);
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (!window.confirm('CRITICAL: This will permanently delete this order from the archive. Proceed?')) return;
        setIsProcessingAction('delete');
        try {
            await deleteDoc(doc(db, 'orders', id));
            showNotification('Order deleted permanently', 'success');
            setSelectedOrderId(null); // Optional: clear selection
        } catch (error) {
            showNotification('Deletion failed', 'error');
        } finally {
            setIsProcessingAction(null);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        setIsProcessingAction('paid');
        try {
            const orderRef = doc(db, 'orders', id);
            await updateDoc(orderRef, { paymentStatus: 'paid' });
            showNotification('Order marked as paid', 'success');
        } catch (error) {
            showNotification('Failed to mark as paid', 'error');
        } finally {
            setIsProcessingAction(null);
        }
    };

    const handleReturnAction = async (id: string, action: 'Approved' | 'Rejected') => {
        setIsProcessingAction('return-' + action);
        try {
            const targetOrder = orders.find(o => o.id === id);
            if (!targetOrder) throw new Error('Order not found');

            await runTransaction(db, async (transaction) => {
                const orderRef = doc(db, 'orders', id);

                // 1. Update order
                transaction.update(orderRef, {
                    returnStatus: action,
                    ...(action === 'Approved' ? {
                        status: 'Refunded',
                        paymentStatus: 'refunded',
                        refundProcessedAt: new Date().toISOString(),
                        journey: arrayUnion({
                            status: 'Refunded',
                            date: new Date().toISOString(),
                            message: 'Ritual return approved. Financial refund initiated.'
                        })
                    } : {
                        journey: arrayUnion({
                            status: 'Return Rejected',
                            date: new Date().toISOString(),
                            message: 'Ritual return request was not approved.'
                        })
                    })
                });

                // 2. If approved, restore stock
                if (action === 'Approved') {
                    // Start Automated Financial Refund Simulation
                    console.log('Initiating Paystack Refund for Order:', targetOrder.id, 'Amount:', targetOrder.total);

                    const productRefs = targetOrder.items.map(item => doc(db, 'products', item.id));
                    const productSnaps = await Promise.all(productRefs.map(ref => transaction.get(ref)));

                    productSnaps.forEach((docSnap, index) => {
                        if (!docSnap.exists()) return;

                        const item = targetOrder.items[index];
                        const productData = docSnap.data();

                        if (item.selectedVariant) {
                            const variants = [...(productData?.variants || [])];
                            const variantIndex = variants.findIndex((v: any) => v.id === item.selectedVariant?.id);
                            if (variantIndex !== -1) {
                                variants[variantIndex] = {
                                    ...variants[variantIndex],
                                    stock: (variants[variantIndex].stock || 0) + item.quantity
                                };
                                transaction.update(productRefs[index], { variants });
                            }
                        } else {
                            const currentStock = productData?.stock || 0;
                            transaction.update(productRefs[index], { stock: currentStock + item.quantity });
                        }
                    });
                }
            });

            showNotification(action === 'Approved' ? 'Return Approved & Refund Initiated' : 'Return Rejected', 'success');
        } catch (error) {
            console.error(error);
            showNotification('Failed to update return status', 'error');
        } finally {
            setIsProcessingAction(null);
        }
    };

    return (
        <AdminLayout>
            <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">Order Management</h2>
                            <p className="text-stone-500 text-sm md:text-base">Monitor and fulfill luxury skincare purchases.</p>
                        </div>
                    </header>

                    {/* Order Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {stats.map((stat, i) => (
                            <div key={i} className="p-6 bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-hover hover:shadow-md">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {stat.trend}
                                    </span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold text-[#221C1D] mb-1">{stat.value}</h3>
                                <p className="text-[10px] text-stone-400">{stat.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Status Tabs & Search */}
                    <div className="bg-white border border-stone-100 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden mb-8">
                        <div className="p-6 border-b border-stone-50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
                            <div className="flex gap-6 overflow-x-auto pb-2 md:pb-0 scrollbar-hide border-b md:border-none border-stone-50">
                                {['All Orders', `Pending(${orders.filter(o => o.status === 'Pending').length})`, `Processing(${orders.filter(o => o.status === 'Processing').length})`, 'Shipped', `Returns(${orders.filter(o => o.returnRequested).length})`].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`text-[10px] md:text-xs font-bold uppercase tracking-widest pb-1 transition-all whitespace-nowrap ${activeTab === tab ? 'text-[#221C1D] border-b-2 border-[#F2A600]' : 'text-stone-400 hover:text-stone-600'}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full md:w-64">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-300 text-lg">search</span>
                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-transparent rounded-lg text-xs focus:outline-none focus:border-[#F2A600] transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white border border-stone-100 rounded-xl overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                        <div className="md:hidden divide-y divide-stone-50">
                            {filteredOrders.length > 0 ? filteredOrders.map((o) => (
                                <div key={o.id} onClick={() => setSelectedOrderId(o.id)} className={`p-6 space-y-4 transition-colors cursor-pointer ${selectedOrderId === o.id ? 'bg-amber-50/50 border-l-4 border-amber-400' : 'hover:bg-stone-50'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 uppercase">
                                                {o.customerName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-[#221C1D] truncate">{o.customerName}</span>
                                                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{o.id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${o.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                                            o.status === 'Shipped' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                            }`}>
                                            {o.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest leading-none mb-1">Date & Time</span>
                                            <span className="text-xs text-stone-600 font-medium">{o.date}</span>
                                            <span className="text-[9px] text-stone-400 uppercase">{o.time}</span>
                                        </div>
                                        <button className="text-[#F2A600] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                            Details <span className="material-symbols-outlined text-xs">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-10 text-center text-stone-400 italic">No orders found.</div>
                            )}
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-stone-50/30">
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order ID</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {filteredOrders.map((o) => (
                                        <tr key={o.id} onClick={() => setSelectedOrderId(o.id)} className={`hover:bg-stone-50/50 transition-colors cursor-pointer ${selectedOrderId === o.id ? 'bg-amber-50/50' : ''}`}>
                                            <td className="px-4 md:px-6 py-5 text-sm font-bold text-[#221C1D] whitespace-nowrap">{o.id.slice(-6).toUpperCase()}</td>
                                            <td className="px-4 md:px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 uppercase flex-shrink-0">
                                                        {o.customerName.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-[#221C1D] truncate">{o.customerName}</span>
                                                        <span className="text-[10px] text-stone-400 truncate">{o.customerEmail}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-5">
                                                <div className="flex flex-col whitespace-nowrap">
                                                    <span className="text-sm font-medium text-stone-600">{o.date}</span>
                                                    <span className="text-[9px] text-stone-400 uppercase">{o.time}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-5 text-sm font-bold text-[#221C1D]">GH₵{o.total.toFixed(2)}</td>
                                            <td className="px-4 md:px-6 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${o.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                                                    o.status === 'Shipped' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                                    }`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 text-center border-t border-stone-50">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Showing {filteredOrders.length} of {orders.length} orders</p>
                        </div>
                    </div>
                </div>

                {/* Journey Timeline Side Pane - Responsive */}
                <div className="w-full xl:w-[400px] bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-fit sticky top-0">
                    {selectedOrder ? (
                        <div className="p-6 md:p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h4 className="text-xl font-bold text-[#221C1D]">Order {selectedOrder.id.slice(-6).toUpperCase()}</h4>
                                    <p className="text-xs text-stone-400">Placed on {selectedOrder.date} at {selectedOrder.time}</p>
                                </div>
                            </div>

                            <div className="mb-10">
                                <h6 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">Journey Timeline</h6>
                                <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-50">
                                    <div className="relative pl-8">
                                        <div className={`absolute left-0 top-1 w-[14px] h-[14px] rounded-full border-4 border-white shadow-sm z-10 ${selectedOrder.status !== 'Pending' ? 'bg-[#F2A600]' : 'bg-stone-200'}`} />
                                        <p className="text-xs font-bold text-[#221C1D]">Order Received</p>
                                        <p className="text-[10px] text-stone-400">{selectedOrder.date}, {selectedOrder.time}</p>
                                    </div>
                                    <div className="relative pl-8">
                                        <div className={`absolute left-0 top-1 w-[14px] h-[14px] rounded-full border-4 border-white z-10 ${['Processing', 'Shipped', 'Delivered'].includes(selectedOrder.status) ? 'bg-[#F2A600]' : 'bg-stone-200'}`} />
                                        <p className="text-xs font-bold text-[#221C1D]">Processing Fulfillment</p>
                                        <p className="text-[10px] text-stone-400 italic">{selectedOrder.status === 'Processing' ? 'In Progress' : ['Shipped', 'Delivered'].includes(selectedOrder.status) ? 'Completed' : 'Awaiting Action'}</p>
                                    </div>
                                    <div className="relative pl-8">
                                        <div className={`absolute left-0 top-1 w-[14px] h-[14px] rounded-full border-4 border-white z-10 ${['Shipped', 'Delivered'].includes(selectedOrder.status) ? 'bg-[#F2A600]' : 'bg-stone-200 opacity-40'}`} />
                                        <p className={`text-xs font-bold ${['Shipped', 'Delivered'].includes(selectedOrder.status) ? 'text-[#221C1D]' : 'text-stone-400'}`}>Shipped</p>
                                        <p className="text-[10px] text-stone-400">{selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? 'Sent via Global Logistics' : 'In Queue'}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedOrder.items && selectedOrder.items.length > 0 && (
                                <div className="mb-10">
                                    <h6 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">Order Items</h6>
                                    <div className="space-y-4">
                                        {selectedOrder.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <p className="font-bold text-[#221C1D] truncate">{item.name}</p>
                                                    <p className="text-[9px] text-stone-400 uppercase">Qty: {item.quantity}</p>
                                                </div>
                                                <p className="font-bold text-[#221C1D]">GH₵{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-10 p-5 bg-[#FDFCFB] border border-stone-50 rounded-2xl">
                                <div className="flex gap-4 mb-5">
                                    <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 uppercase">
                                        {selectedOrder.customerName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-[#221C1D] truncate">{selectedOrder.customerName}</p>
                                        <p className="text-[10px] text-stone-400">{selectedOrder.paymentMethod} • GH₵{selectedOrder.total.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <p className="text-[8px] font-bold text-stone-400 uppercase mb-1.5">Shipping Address</p>
                                        <p className="text-[10px] text-stone-600 leading-relaxed italic">
                                            {selectedOrder.shippingAddress}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-bold text-stone-400 uppercase mb-1.5">Contact</p>
                                        <p className="text-[10px] text-stone-600 truncate">{selectedOrder.customerEmail}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-stone-100 mt-8">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Action Center</span>
                                    <span className="text-xl font-bold text-[#221C1D]">GH₵{selectedOrder.total.toFixed(2)}</span>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {selectedOrder.status === 'Pending' && (
                                        <button
                                            disabled={!!isProcessingAction}
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'Processing')}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-[#221C1D] text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {isProcessingAction === 'status-Processing' ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : null}
                                            Mark as Processing
                                        </button>
                                    )}
                                    {selectedOrder.status === 'Processing' && (
                                        <div className="space-y-3">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pl-1">Tracking Identifier (Optional)</label>
                                                <input
                                                    type="text"
                                                    disabled={!!isProcessingAction}
                                                    placeholder="e.g. DHL-123456"
                                                    value={trackingNumber}
                                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                                    className="w-full px-4 py-2 bg-stone-50 border border-stone-100 rounded-lg text-xs focus:outline-none focus:border-[#F2A600] transition-colors"
                                                />
                                            </div>
                                            <button
                                                disabled={!!isProcessingAction}
                                                onClick={() => handleStatusUpdate(selectedOrder.id, 'Shipped')}
                                                className="w-full flex items-center justify-center gap-2 py-3 bg-[#F2A600] text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#D49100] transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                {isProcessingAction === 'status-Shipped' ? <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : null}
                                                Dispatch Order
                                            </button>
                                        </div>
                                    )}
                                    {selectedOrder.status === 'Shipped' && (
                                        <button
                                            disabled={!!isProcessingAction}
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'Delivered')}
                                            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                                        >
                                            {isProcessingAction === 'status-Delivered' ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : null}
                                            Confirm Delivery
                                        </button>
                                    )}

                                    {/* Return Actions */}
                                    {selectedOrder.returnRequested && selectedOrder.returnStatus === 'Pending' && (
                                        <div className="space-y-3 pt-4 border-t border-stone-100">
                                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Return Request: {selectedOrder.returnReason}</p>
                                            <div className="flex gap-3">
                                                <button
                                                    disabled={!!isProcessingAction}
                                                    onClick={() => handleReturnAction(selectedOrder.id, 'Approved')}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-stone-800 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                                                >
                                                    {isProcessingAction === 'return-Approved' ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : null}
                                                    Approve
                                                </button>
                                                <button
                                                    disabled={!!isProcessingAction}
                                                    onClick={() => handleReturnAction(selectedOrder.id, 'Rejected')}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
                                                >
                                                    {isProcessingAction === 'return-Rejected' ? <div className="w-3 h-3 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div> : null}
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Cancel & Delete Actions */}
                                    {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && (
                                        <button
                                            disabled={!!isProcessingAction}
                                            onClick={() => handleCancelOrder(selectedOrder.id)}
                                            className="w-full flex items-center justify-center gap-2 py-3 border border-orange-100 text-orange-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-orange-50 transition-colors disabled:opacity-50"
                                        >
                                            {isProcessingAction === 'cancel' ? <div className="w-3 h-3 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div> : null}
                                            Cancel Ritual
                                        </button>
                                    )}

                                    {selectedOrder.paymentStatus !== 'paid' && (
                                        <button
                                            disabled={!!isProcessingAction}
                                            onClick={() => handleMarkAsPaid(selectedOrder.id)}
                                            className="w-full flex items-center justify-center gap-2 py-3 border border-green-100 text-green-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-green-50 transition-colors disabled:opacity-50"
                                        >
                                            {isProcessingAction === 'paid' ? <div className="w-3 h-3 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div> : null}
                                            Mark as Paid
                                        </button>
                                    )}

                                    <button
                                        disabled={!!isProcessingAction}
                                        onClick={() => handleDeleteOrder(selectedOrder.id)}
                                        className="w-full flex items-center justify-center gap-2 py-3 border border-red-100 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {isProcessingAction === 'delete' ? <div className="w-3 h-3 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div> : null}
                                        Delete Forever
                                    </button>

                                    <button className="w-full flex items-center justify-center gap-2 py-3 border border-stone-100 rounded-lg text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:bg-stone-50 transition-colors">
                                        <span className="material-symbols-outlined text-lg">print</span>
                                        Manifest
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
                                <span className="material-symbols-outlined text-3xl">receipt_long</span>
                            </div>
                            <h4 className="text-lg font-bold text-[#221C1D] mb-2 uppercase tracking-widest">No Selection</h4>
                            <p className="text-xs text-stone-400 leading-relaxed italic">Select an order from the archive to perform fulfillment rituals.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Orders;
