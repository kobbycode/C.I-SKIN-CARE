import React, { useState } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';

const MOCK_ORDERS = [
    { id: '#ORD-9012', customer: 'Elena Larsson', email: 'elena.l@example.com', date: 'Oct 24, 2023', time: '10:45 AM', status: 'Processing', total: 'GH₵458.00', items: 2 },
    { id: '#ORD-9011', customer: 'James Whittaker', email: 'j.whit@provider.net', date: 'Oct 23, 2023', time: '04:12 PM', status: 'Shipped', total: 'GH₵280.00', items: 1 },
    { id: '#ORD-9010', customer: 'Sophia Martinez', email: 'sophia.m@gmail.com', date: 'Oct 23, 2023', time: '11:20 AM', status: 'Delivered', total: 'GH₵150.00', items: 1 }
];

const Orders: React.FC = () => {
    const [selectedOrderId, setSelectedOrderId] = useState(MOCK_ORDERS[0].id);
    const selectedOrder = MOCK_ORDERS.find(o => o.id === selectedOrderId) || MOCK_ORDERS[0];

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
                        {[
                            { label: 'Pending Shipments', value: '24', trend: '+5%', sub: 'Immediate action' },
                            { label: 'Orders Today', value: '142', trend: '-2%', sub: 'Updated 5m ago' },
                            { label: 'Total Volume', value: 'GH₵12,450', trend: '+8.4%', sub: 'Daily projection' }
                        ].map((stat, i) => (
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
                                {['All Orders', 'Pending (12)', 'Processing (8)', 'Shipped'].map((tab, i) => (
                                    <button key={tab} className={`text-[10px] md:text-xs font-bold uppercase tracking-widest pb-1 transition-all whitespace-nowrap ${i === 0 ? 'text-[#221C1D] border-b-2 border-[#F2A600]' : 'text-stone-400 hover:text-stone-600'}`}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                            <div className="relative w-full md:w-64">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-stone-300 text-lg">search</span>
                                <input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-transparent rounded-lg text-xs focus:outline-none focus:border-[#F2A600] transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white border border-stone-100 rounded-xl overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
                        <div className="md:hidden divide-y divide-stone-50">
                            {MOCK_ORDERS.map((o, i) => (
                                <div key={i} onClick={() => setSelectedOrderId(o.id)} className={`p-6 space-y-4 transition-colors cursor-pointer ${selectedOrderId === o.id ? 'bg-stone-50' : 'active:bg-stone-50'}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 uppercase">
                                                {o.customer.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-[#221C1D] truncate">{o.customer}</span>
                                                <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{o.id}</span>
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
                            ))}
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
                                    {MOCK_ORDERS.map((o, i) => (
                                        <tr key={i} onClick={() => setSelectedOrderId(o.id)} className={`hover:bg-stone-50/50 transition-colors cursor-pointer ${selectedOrderId === o.id ? 'bg-stone-50/30' : ''}`}>
                                            <td className="px-4 md:px-6 py-5 text-sm font-bold text-[#221C1D] whitespace-nowrap">{o.id}</td>
                                            <td className="px-4 md:px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 uppercase flex-shrink-0">
                                                        {o.customer.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-[#221C1D] truncate">{o.customer}</span>
                                                        <span className="text-[10px] text-stone-400 truncate">{o.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-5">
                                                <div className="flex flex-col whitespace-nowrap">
                                                    <span className="text-sm font-medium text-stone-600">{o.date}</span>
                                                    <span className="text-[9px] text-stone-400 uppercase">{o.time}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 md:px-6 py-5 text-sm font-bold text-[#221C1D]">{o.total}</td>
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
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Showing 1-10 of 1,245 orders</p>
                        </div>
                    </div>
                </div>

                {/* Journey Timeline Side Pane - Responsive */}
                <div className="w-full xl:w-[400px] bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] h-fit sticky top-0">
                    <div className="p-6 md:p-8">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h4 className="text-xl font-bold text-[#221C1D]">Order {selectedOrder.id}</h4>
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
                                    <p className="text-[10px] text-stone-400 italic">{selectedOrder.status === 'Processing' ? 'In Progress - Warehouse A' : 'Completed'}</p>
                                </div>
                                <div className="relative pl-8">
                                    <div className={`absolute left-0 top-1 w-[14px] h-[14px] rounded-full border-4 border-white z-10 ${['Shipped', 'Delivered'].includes(selectedOrder.status) ? 'bg-[#F2A600]' : 'bg-stone-200 opacity-40'}`} />
                                    <p className={`text-xs font-bold ${['Shipped', 'Delivered'].includes(selectedOrder.status) ? 'text-[#221C1D]' : 'text-stone-400'}`}>Shipped</p>
                                    <p className="text-[10px] text-stone-400">{selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered' ? 'Sent via Global Logistics' : 'Estimated Arrival: 2 Days'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10 p-5 bg-[#FDFCFB] border border-stone-50 rounded-2xl">
                            <div className="flex gap-4 mb-5">
                                <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-500 uppercase">
                                    {selectedOrder.customer.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-[#221C1D] truncate">{selectedOrder.customer}</p>
                                    <p className="text-[10px] text-stone-400">Platinum Member • 12 Orders</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <p className="text-[8px] font-bold text-stone-400 uppercase mb-1.5">Shipping Address</p>
                                    <p className="text-[10px] text-stone-600 leading-relaxed italic">
                                        1245 Strandvägen, Stockholm, 114 56, Sweden
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-bold text-stone-400 uppercase mb-1.5">Contact</p>
                                    <p className="text-[10px] text-stone-600 truncate">{selectedOrder.email}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-stone-100 mt-8">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Total Value</span>
                                <span className="text-xl font-bold text-[#221C1D]">{selectedOrder.total}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-stone-100 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors">
                                    <span className="material-symbols-outlined text-lg">print</span>
                                    Label
                                </button>
                                <button className="flex-[1.5] flex items-center justify-center gap-2 py-3 bg-[#F2A600] text-black rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-[#D49100] transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-lg">local_shipping</span>
                                    {selectedOrder.status === 'Processing' ? 'Ship Order' : 'Track Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Orders;
