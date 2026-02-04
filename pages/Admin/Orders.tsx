import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import ConfirmModal from '../../components/Admin/ConfirmModal';
import { useOrders } from '../../context/OrderContext';
import { db } from '../../firebaseConfig';
import { useInAppNotifications } from '../../context/InAppNotificationContext';
import { useUser } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import { doc, updateDoc, runTransaction, arrayUnion, deleteDoc } from 'firebase/firestore';
import { Order } from '../../types';

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
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const { getIdToken } = useUser();

    const filteredOrders = useMemo(() => {
        let result = orders;

        // Filter by tab
        if (activeTab !== 'All Orders') {
            if (activeTab.startsWith('Returns')) {
                result = result.filter(o => o.returnRequested);
            } else {
                // Extract status safely from "Pending (5)" or "Pending(5)" format
                const status = activeTab.split('(')[0].trim();
                result = result.filter(o => o.status === status);
            }
        }

        // Filter by search
        if (searchTerm) {
            const lowSearch = searchTerm.toLowerCase();
            result = result.filter(o =>
                o.customerName.toLowerCase().includes(lowSearch) ||
                o.id.toLowerCase().includes(lowSearch) ||
                o.customerEmail.toLowerCase().includes(lowSearch) ||
                (o.customerPhone && o.customerPhone.toLowerCase().includes(lowSearch))
            );
        }

        // Filter by date range
        if (startDate || endDate) {
            result = result.filter(o => {
                // Convert order date string "January 31, 2026" to comparable date
                const orderDate = new Date(o.date);
                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    if (orderDate < start) return false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (orderDate > end) return false;
                }
                return true;
            });
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
        setOrderToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteOrder = async () => {
        if (!orderToDelete) return;
        const id = orderToDelete;
        setIsProcessingAction('delete');
        try {
            await deleteDoc(doc(db, 'orders', id));
            showNotification('Order deleted permanently', 'success');
            setSelectedOrderId(null);
        } catch (error) {
            showNotification('Deletion failed', 'error');
        } finally {
            setIsProcessingAction(null);
            setIsDeleteModalOpen(false);
            setOrderToDelete(null);
        }
    };

    const handleMarkAsPaid = async (id: string) => {
        setIsProcessingAction('paid');
        try {
            await updateDoc(doc(db, 'orders', id), {
                paymentStatus: 'paid'
            });
            showNotification('Order marked as paid', 'success');
        } catch (error) {
            showNotification('Status update failed', 'error');
        } finally {
            setIsProcessingAction(null);
        }
    };

    const handleBulkStatusUpdate = async (newStatus: Order['status']) => {
        if (selectedIds.size === 0) return;
        setIsProcessingAction(`bulk-status-${newStatus}`);
        try {
            const batch = Array.from(selectedIds).map(id =>
                updateDoc(doc(db, 'orders', id), { status: newStatus })
            );
            await Promise.all(batch);
            showNotification(`Updated ${selectedIds.size} orders to ${newStatus}`, 'success');
            setSelectedIds(new Set());
        } catch (error) {
            showNotification('Bulk update failed', 'error');
        } finally {
            setIsProcessingAction(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Are you sure you want to permanently delete ${selectedIds.size} orders?`)) return;
        setIsProcessingAction('bulk-delete');
        try {
            const batch = Array.from(selectedIds).map(id =>
                deleteDoc(doc(db, 'orders', id))
            );
            await Promise.all(batch);
            showNotification(`Deleted ${selectedIds.size} orders`, 'success');
            setSelectedIds(new Set());
            setSelectedOrderId(null);
        } catch (error) {
            showNotification('Bulk deletion failed', 'error');
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

                    {/* Status Tabs Sub-nav */}
                    <div className="flex gap-8 overflow-x-auto pb-4 mb-4 border-b border-stone-100 scrollbar-hide">
                        {[
                            'All Orders',
                            'Pending',
                            'Processing',
                            'Shipped',
                            'Delivered',
                            'Cancelled',
                            'Returns'
                        ].map((status) => {
                            const count = status === 'All Orders' ? orders.length :
                                status === 'Returns' ? orders.filter(o => o.returnRequested).length :
                                    orders.filter(o => o.status === status).length;
                            const isActive = activeTab === status || activeTab.startsWith(status + ' (');

                            return (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setActiveTab(status === 'All Orders' ? status : `${status} (${count})`);
                                        setSelectedOrderId(null);
                                    }}
                                    className={`flex items-center gap-2 pb-3 whitespace-nowrap transition-all relative ${isActive ? 'text-[#221C1D] font-bold' : 'text-stone-400 hover:text-stone-600 font-medium'}`}
                                >
                                    <span className="text-[10px] uppercase tracking-[0.2em]">{status}</span>
                                    {count > 0 && (
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-[#F2A600] text-[#221C1D]' : 'bg-stone-50 text-stone-400'}`}>
                                            {count}
                                        </span>
                                    )}
                                    {isActive && (
                                        <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#F2A600] rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Order Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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

                    {/* Search & Filter Bar */}
                    <div className="bg-white border border-stone-100 rounded-xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] p-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                        <div className="relative flex-1 w-full max-w-sm">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-300 text-lg">search</span>
                            <input
                                type="text"
                                placeholder="Search Name, ID, Phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-transparent rounded-lg text-xs focus:outline-none focus:border-[#F2A600] transition-colors"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-lg border border-stone-100 w-full md:w-auto overflow-hidden">
                                <span className="text-[9px] font-bold text-stone-400 uppercase shrink-0">Range</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent text-[10px] focus:outline-none min-w-0"
                                />
                                <span className="text-stone-300 text-xs shrink-0">→</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent text-[10px] focus:outline-none min-w-0"
                                />
                                {(startDate || endDate) && (
                                    <button
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                        className="ml-1 material-symbols-outlined text-xs text-stone-400 hover:text-red-500 shrink-0"
                                    >
                                        close
                                    </button>
                                )}
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
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{o.id.slice(-6).toUpperCase()}</span>
                                                    {(o.customerPhone || o.deliveryContactPhone || o.deliveryPhone) && (
                                                        <span className="text-[9px] text-stone-500 font-bold flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[10px]">phone</span>
                                                            {o.customerPhone || o.deliveryContactPhone || o.deliveryPhone}
                                                        </span>
                                                    )}
                                                </div>
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
                                        <th className="px-4 md:px-6 py-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-stone-300 text-[#F2A600] focus:ring-[#F2A600]"
                                                    checked={filteredOrders.length > 0 && selectedIds.size === filteredOrders.length}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedIds(new Set(filteredOrders.map(o => o.id)));
                                                        } else {
                                                            setSelectedIds(new Set());
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </th>
                                        <th className="px-4 md:px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order ID</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-50">
                                    {filteredOrders.map((o) => (
                                        <tr
                                            key={o.id}
                                            onClick={() => setSelectedOrderId(o.id)}
                                            className={`border-b border-stone-50 transition-colors cursor-pointer ${selectedOrderId === o.id ? 'bg-amber-50/50' : 'hover:bg-stone-50/50'}`}
                                        >
                                            <td className="px-4 md:px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-stone-300 text-[#F2A600] focus:ring-[#F2A600]"
                                                    checked={selectedIds.has(o.id)}
                                                    onChange={(e) => {
                                                        const newSelected = new Set(selectedIds);
                                                        if (e.target.checked) {
                                                            newSelected.add(o.id);
                                                        } else {
                                                            newSelected.delete(o.id);
                                                        }
                                                        setSelectedIds(newSelected);
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 md:px-6 py-5 text-sm font-bold text-[#221C1D] whitespace-nowrap">{o.id.slice(-6).toUpperCase()}</td>
                                            <td className="px-4 md:px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 uppercase flex-shrink-0">
                                                        {o.customerName.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-[#221C1D] truncate">{o.customerName}</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-stone-400 truncate">{o.customerEmail}</span>
                                                            {(o.customerPhone || o.deliveryContactPhone || o.deliveryPhone) && (
                                                                <span className="text-[10px] text-stone-600 font-bold flex items-center gap-1 mt-0.5">
                                                                    <span className="material-symbols-outlined text-[10px]">phone</span>
                                                                    {o.customerPhone || o.deliveryContactPhone || o.deliveryPhone}
                                                                </span>
                                                            )}
                                                        </div>
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
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <p className="text-[10px] text-stone-400 font-medium">{selectedOrder.paymentMethod} • GH₵{selectedOrder.total.toFixed(2)}</p>
                                            {(selectedOrder.customerPhone || selectedOrder.deliveryContactPhone || selectedOrder.deliveryPhone) && (
                                                <p className="text-[10px] text-stone-900 font-bold flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">phone</span>
                                                    {selectedOrder.customerPhone || selectedOrder.deliveryContactPhone || selectedOrder.deliveryPhone}
                                                </p>
                                            )}
                                        </div>
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
                                        <div className="space-y-1">
                                            <p className="text-[10px] text-stone-600 truncate">{selectedOrder.customerEmail}</p>
                                            {(selectedOrder.customerPhone || selectedOrder.deliveryContactPhone || selectedOrder.deliveryPhone) && (
                                                <p className="text-[10px] text-stone-600 font-medium truncate flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[10px]">phone</span>
                                                    {selectedOrder.customerPhone || selectedOrder.deliveryContactPhone || selectedOrder.deliveryPhone}
                                                </p>
                                            )}
                                        </div>
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

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-[#221C1D] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Bulk Actions</span>
                            <span className="text-xs font-bold">{selectedIds.size} Rituals Selected</span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                        <div className="flex items-center gap-2">
                            <button
                                disabled={!!isProcessingAction}
                                onClick={() => handleBulkStatusUpdate('Processing')}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                Process
                            </button>
                            <button
                                disabled={!!isProcessingAction}
                                onClick={() => handleBulkStatusUpdate('Shipped')}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                Dispatch
                            </button>
                            <button
                                disabled={!!isProcessingAction}
                                onClick={() => handleBulkStatusUpdate('Delivered')}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                Deliver
                            </button>
                            <button
                                disabled={!!isProcessingAction}
                                onClick={handleBulkDelete}
                                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-stone-400"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Delete Order Permanently"
                message="CRITICAL: This will permanently delete this order from the archive. This action cannot be undone. Proceed?"
                confirmLabel="Delete Forever"
                cancelLabel="Cancel"
                variant="danger"
                onConfirm={confirmDeleteOrder}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setOrderToDelete(null);
                }}
            />
        </AdminLayout>
    );
};

export default Orders;
