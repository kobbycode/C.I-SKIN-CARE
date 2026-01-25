import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/Admin/AdminLayout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOrders } from '../../context/OrderContext';
import { useUser } from '../../context/UserContext';
import { useReviews } from '../../context/ReviewContext';
import { useProducts } from '../../context/ProductContext';

const Dashboard: React.FC = () => {
  const { orders, loading: ordersLoading } = useOrders();
  const { allUsers, loading: usersLoading } = useUser();
  const { reviews, loading: reviewsLoading } = useReviews();
  const { products, loading: productsLoading } = useProducts();

  const loading = ordersLoading || usersLoading || reviewsLoading || productsLoading;

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const ordersToday = orders.filter(o => o.date === new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })).length;
    const pendingReviews = reviews.filter(r => r.status === 'Pending').length;

    return [
      { label: 'Total Revenue', value: 'GH₵' + totalRevenue.toLocaleString(), trend: '+12.5%', icon: 'payments', trendUp: true },
      { label: 'Orders (All Time)', value: orders.length.toString(), trend: '+5.2%', icon: 'shopping_bag', trendUp: true },
      { label: 'Total Customers', value: allUsers.length.toString(), trend: '+3.1%', icon: 'person_add', trendUp: true },
      { label: 'Pending Reviews', value: pendingReviews.toString(), trend: 'Urgent', icon: 'reviews', trendUp: pendingReviews > 0 }
    ];
  }, [orders, allUsers, reviews]);

  const chartData = useMemo(() => {
    // Group last 4 weeks of revenue
    const weeks = ['W1', 'W2', 'W3', 'W4'];
    return weeks.map((w, i) => {
      const weekOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        const now = new Date();
        const diffDays = (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= (4 - i) * 7 && diffDays > (3 - i) * 7;
      });
      return {
        name: w,
        revenue: weekOrders.reduce((sum, o) => sum + o.total, 0) || (i === 3 ? 0 : 2000 + (i * 500)) // Fallback for demo if no real orders in that week
      };
    });
  }, [orders]);

  const customerGrowthData = useMemo(() => {
    const weeks = ['W1', 'W2', 'W3', 'W4'];
    return weeks.map((w, i) => {
      const weekUsers = allUsers.filter(u => {
        const joinDate = new Date(u.joinedDate);
        const now = new Date();
        const diffDays = (now.getTime() - joinDate.getTime()) / (1000 * 3600 * 24);
        return diffDays <= (4 - i) * 7;
      });
      return { name: w, customers: weekUsers.length || (100 + (i * 50)) };
    });
  }, [allUsers]);

  const fulfillmentStats = useMemo(() => {
    return {
      newOrders: orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length,
      lowStock: products.filter(p => p.status === 'Low Stock' || (p.stock && p.stock <= 5)).length
    };
  }, [orders, products]);

  if (loading) return <AdminLayout><div className="p-20 text-center opacity-30">Aggregating Global Metrics...</div></AdminLayout>;
  return (
    <AdminLayout>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">Executive Overview</h2>
          <p className="text-stone-500 text-sm md:text-base">Welcome back, here is what happened in the last 24 hours.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider border border-stone-200 hover:bg-stone-50 transition-colors">Export PDF</button>
          <button className="flex-1 sm:flex-none px-6 py-2.5 text-[10px] font-bold uppercase tracking-wider bg-[#221C1D] text-white hover:bg-black transition-colors">Share Report</button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="p-2 bg-[#F2A600]/10 rounded-lg text-[#F2A600]">
                <span className="material-symbols-outlined">{stat.icon}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${stat.trendUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {stat.trend}
                <span className="material-symbols-outlined text-xs">{stat.trendUp ? 'trending_up' : 'trending_down'}</span>
              </span>
            </div>
            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-xl md:text-2xl font-bold text-[#221C1D]">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Revenue Chart */}
        <div className="p-6 md:p-8 bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-lg md:text-xl font-bold text-[#221C1D]">Revenue Overview</h4>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 px-3 py-1.5 rounded text-stone-600">Last 30 Days</span>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F2A600" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#F2A600" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#221C1D', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#F2A600' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#F2A600" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ fill: '#F2A600', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth Chart */}
        <div className="p-6 md:p-8 bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-lg md:text-xl font-bold text-[#221C1D]">Customer Growth</h4>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 px-3 py-1.5 rounded text-stone-600">Last 30 Days</span>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerGrowthData}>
                <defs>
                  <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5E3C" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#8B5E3C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280', fontWeight: 600 }} dy={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#221C1D', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#8B5E3C' }}
                />
                <Area type="monotone" dataKey="customers" stroke="#8B5E3C" strokeWidth={3} fillOpacity={1} fill="url(#colorCustomers)" dot={{ fill: '#8B5E3C', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Top Sellers Table */}
        <div className="lg:col-span-2 p-6 md:p-8 bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-lg md:text-xl font-bold text-[#221C1D]">Global Product Performance</h4>
            <button className="text-[10px] font-bold text-[#F2A600] uppercase underline tracking-wider">Full Catalog</button>
          </div>
          <div className="space-y-6">
            {products.slice(0, 3).map((product, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-stone-50 rounded-xl transition-colors">
                <img src={product.image} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" alt={product.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-[#221C1D]">{product.name}</p>
                  <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">{product.stock} in stock</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#221C1D]">GH₵{product.price.toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-green-600">Active</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Center */}
        <div className="p-6 md:p-8 bg-luxury-brown text-white border border-gold/20 rounded-xl shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-display text-xl mb-6">Fulfillment Ritual</h4>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">New Orders</p>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-display">{fulfillmentStats.newOrders}</span>
                  <Link to="/admin/orders" className="text-[9px] uppercase tracking-widest border-b border-gold/30 pb-0.5">Manage</Link>
                </div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-1">Low Inventory</p>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-display text-red-400">{fulfillmentStats.lowStock}</span>
                  <Link to="/admin/inventory" className="text-[9px] uppercase tracking-widest border-b border-gold/30 pb-0.5">Restock</Link>
                </div>
              </div>
            </div>
            <button className="w-full mt-8 py-4 bg-gold text-white font-bold uppercase tracking-widest text-[10px] rounded hover:bg-white hover:text-luxury-brown transition-all">
              Generate Executive Summary
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
            <img src="/logo.jpg" alt="" className="h-40 grayscale invert" />
          </div>
        </div>
      </div>

      {/* Recent Orders - Responsive Table */}
      <div className="bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-stone-50 flex justify-between items-center">
          <h4 className="text-lg md:text-xl font-bold text-[#221C1D]">Recent Orders</h4>
          <div className="flex gap-2">
            <button className="p-2 border border-stone-100 rounded hover:bg-stone-50 transition-colors"><span className="material-symbols-outlined text-stone-400 text-lg">filter_list</span></button>
            <button className="p-2 border border-stone-100 rounded hover:bg-stone-50 transition-colors"><span className="material-symbols-outlined text-stone-400 text-lg">download</span></button>
          </div>
        </div>

        <div className="md:hidden divide-y divide-stone-50">
          {orders.slice(0, 3).map((order) => (
            <div key={order.id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                    {order.customerName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-[#221C1D]">{order.customerName}</h5>
                    <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{order.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                    order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Date</span>
                  <span className="text-sm text-stone-600 font-medium">{order.date}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Amount</span>
                  <span className="text-sm font-bold text-[#221C1D]">GH₵{order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-stone-50/50">
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Order ID</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Customer</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Amount</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                <th className="px-4 md:px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/30 transition-colors">
                  <td className="px-4 md:px-6 py-5 text-sm font-bold text-[#221C1D]">{order.id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 md:px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 flex-shrink-0">
                        {order.customerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-stone-600 truncate">{order.customerName}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-5 text-sm text-stone-500 whitespace-nowrap">{order.date}</td>
                  <td className="px-4 md:px-6 py-5 text-sm font-bold text-[#221C1D]">GH₵{order.total.toFixed(2)}</td>
                  <td className="px-4 md:px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-5 text-right">
                    <button className="p-2 text-stone-300 hover:text-stone-600 transition-colors"><span className="material-symbols-outlined">more_horiz</span></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
