import React, { useState, useMemo } from 'react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useReviews } from '../../context/ReviewContext';
import { useProducts } from '../../context/ProductContext';
import { useNotification } from '../../context/NotificationContext';

const AdminReviews: React.FC = () => {
    const { reviews, updateReviewStatus } = useReviews();
    const { products } = useProducts();
    const { showNotification } = useNotification();
    const [activeTab, setActiveTab] = useState('All Reviews');

    const filteredReviews = useMemo(() => {
        if (activeTab === 'All Reviews') return reviews;
        if (activeTab.includes('Pending')) return reviews.filter(r => r.status === 'Pending');
        if (activeTab === '5 Stars') return reviews.filter(r => r.rating === 5);
        if (activeTab === 'Critical') return reviews.filter(r => r.rating <= 2);
        return reviews;
    }, [reviews, activeTab]);

    const stats = useMemo(() => ([
        { label: 'Total Reviews', value: reviews.length.toString(), trend: '+12', sub: 'Global collection' },
        { label: 'Pending', value: reviews.filter(r => r.status === 'Pending').length.toString(), trend: 'Urgent', sub: 'Action required', isUrgent: true },
        { label: 'Verified', value: Math.round((reviews.filter(r => r.verified).length / (reviews.length || 1)) * 100) + '%', trend: '+2%', sub: 'Authenticated' },
        { label: 'Avg Rating', value: (reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)).toFixed(1), trend: 'Steady', sub: 'Collective sentiment' }
    ]), [reviews]);

    const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
        try {
            await updateReviewStatus(id, status);
            showNotification(`Review ${status.toLowerCase()} successfully`, 'success');
        } catch (error) {
            showNotification('Update failed', 'error');
        }
    };
    return (
        <AdminLayout>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#221C1D]">Sentiment & Feedback</h2>
                    <p className="text-stone-500 text-sm md:text-base">Moderate and analyze customer experience and product ratings.</p>
                </div>
                <div className="flex items-center gap-2 px-6 py-2.5 bg-white border border-stone-100 rounded-lg shadow-sm whitespace-nowrap">
                    <span className="material-symbols-outlined text-[#F2A600]">star</span>
                    <span className="text-sm font-bold text-[#221C1D]">4.8</span>
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest ml-1">Avg Rating</span>
                </div>
            </header>

            {/* Review Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                    <div key={i} className="p-6 bg-white border border-stone-100 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${stat.isUrgent ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-[#221C1D] mb-1">{stat.value}</h3>
                        <p className="text-[10px] text-stone-400">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar py-2 -mx-2 px-2 scroll-smooth">
                {['All Reviews', `Pending (${reviews.filter(r => r.status === 'Pending').length})`, '5 Stars', 'Critical'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setActiveTab(f)}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === f ? 'bg-[#221C1D] text-white shadow-md' : 'bg-white border border-stone-100 text-stone-400 hover:border-[#F2A600] hover:text-[#F2A600]'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
                {filteredReviews.length > 0 ? filteredReviews.map((review) => {
                    const product = products.find(p => p.id === review.productId);
                    return (
                        <div key={review.id} className="bg-white border border-stone-100 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-stone-50 flex-shrink-0 bg-stone-100 flex items-center justify-center text-stone-400 font-bold uppercase">
                                        {review.author.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-sm font-bold text-[#221C1D] truncate">{review.author}</h4>
                                            {review.verified && <span className="material-symbols-outlined text-blue-500 text-sm">verified</span>}
                                        </div>
                                        <div className="flex gap-0.5 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`material-symbols-outlined text-sm ${i < review.rating ? 'text-[#F2A600]' : 'text-stone-200'}`}>star</span>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-stone-400 font-medium">
                                            {review.date} • <span className="text-[#F2A600] font-bold uppercase">{product?.name || 'Unknown Product'}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <span className={`flex-1 sm:flex-none text-center px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${review.status === 'Pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                        review.status === 'Approved' ? 'bg-green-50 text-green-600 border border-green-100' :
                                            'bg-red-50 text-red-600 border border-red-100'
                                        }`}>
                                        {review.status}
                                    </span>
                                    <button className="p-2 hover:bg-stone-50 rounded-lg transition-colors flex-shrink-0"><span className="material-symbols-outlined text-stone-300 text-lg">more_vert</span></button>
                                </div>
                            </div>
                            <p className="text-sm text-stone-600 leading-relaxed italic mb-8 p-4 bg-stone-50/50 rounded-xl border-l-4 border-stone-100">"{review.content}"</p>
                            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-stone-50">
                                {review.status === 'Pending' ? (
                                    <>
                                        <button onClick={() => handleAction(review.id, 'Approved')} className="flex-1 px-6 py-3 bg-[#221C1D] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-sm">Approve</button>
                                        <button onClick={() => handleAction(review.id, 'Rejected')} className="flex-1 px-6 py-3 border border-stone-200 text-stone-500 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-stone-50 transition-all">Reject</button>
                                    </>
                                ) : (
                                    <>
                                        {review.status === 'Approved' && (
                                            <button onClick={() => handleAction(review.id, 'Rejected')} className="flex-1 px-6 py-3 border border-stone-200 text-stone-500 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-stone-50 transition-all">Reject</button>
                                        )}
                                        {review.status === 'Rejected' && (
                                            <button onClick={() => handleAction(review.id, 'Approved')} className="flex-1 px-6 py-3 border border-stone-200 text-stone-500 text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-stone-50 transition-all">Approve</button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-20 bg-white border border-dashed border-stone-200 rounded-2xl opacity-40 italic">
                        No reviews found match your current filtration.
                    </div>
                )}
            </div>
            <div className="text-center pt-8">
                <button className="px-8 py-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest border border-stone-100 rounded-full hover:bg-stone-50 hover:text-[#221C1D] transition-all">Load More Feedback</button>
            </div>
        </AdminLayout>
    );
};

export default AdminReviews;
