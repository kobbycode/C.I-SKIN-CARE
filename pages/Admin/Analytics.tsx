import React, { useMemo } from 'react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const Analytics: React.FC = () => {
    const { orders } = useOrders();
    const { products } = useProducts();

    // 1. Revenue Rituals (Daily Revenue for last 7 days)
    const revenueData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }).reverse();

        return last7Days.map(date => {
            const dayOrders = orders.filter(o => o.date.includes(date) && o.status !== 'Cancelled');
            const total = dayOrders.reduce((acc, o) => acc + o.total, 0);
            return { date, revenue: total };
        });
    }, [orders]);

    // 2. Status Synchronization (Distribution of orders by status)
    const statusData = useMemo(() => {
        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        return statuses.map(status => ({
            name: status,
            value: orders.filter(o => o.status === status).length
        })).filter(s => s.value > 0);
    }, [orders]);

    // 3. Alchemy Favorites (Top 5 Products)
    const topProductsData = useMemo(() => {
        const productCounts: Record<string, number> = {};
        orders.forEach(o => {
            if (o.status === 'Cancelled') return;
            o.items?.forEach(item => {
                productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
            });
        });

        return Object.entries(productCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [orders]);

    // 4. Inventory Omens (Low stock alerts)
    const lowStockProducts = useMemo(() => {
        return products.filter(p => {
            if (p.variants && p.variants.length > 0) {
                return p.variants.some(v => v.stock < 5);
            }
            return p.stock < 5;
        }).slice(0, 5);
    }, [products]);

    const COLORS = ['#F2A600', '#221C1D', '#8B8B8B', '#00C49F', '#FF8042'];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div>
                <h2 className="text-2xl font-display font-bold text-[#221C1D] uppercase tracking-wider">Analytics Sanctuary</h2>
                <p className="text-stone-400 text-xs">A mystical overview of your skincare empire's performance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">Revenue Rituals (Last 7 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F2A600" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#F2A600" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F5" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#A3A3A3' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#A3A3A3' }} tickFormatter={(v) => `GH₵${v}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#F2A600" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">Status Synchronization</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">Alchemy Favorites</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProductsData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F5F5F5" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#221C1D', width: 100 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#221C1D" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                    <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">Inventory Omens</h3>
                    <div className="space-y-4">
                        {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                                <div>
                                    <p className="text-xs font-bold text-[#221C1D]">{p.name}</p>
                                    <p className="text-[9px] text-stone-400 uppercase">Awaiting Replenishment</p>
                                </div>
                                <div className="text-right">
                                    <span className="px-2 py-1 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase">
                                        Stock: {p.variants?.[0]?.stock ?? p.stock}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center">
                                <span className="material-symbols-outlined text-green-200 text-4xl mb-2">check_circle</span>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Stock is Abundant</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
