
import React, { useMemo } from 'react';
import { useReviews } from '../context/ReviewContext';

const Reviews: React.FC = () => {
  const { reviews, loading } = useReviews();
  const approvedReviews = useMemo(() => reviews.filter(r => r.status === 'Approved'), [reviews]);

  const stats = useMemo(() => {
    if (approvedReviews.length === 0) return { avg: 5.0, count: 0, rows: [100, 0, 0, 0, 0] };
    const avg = (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1);
    const rows = [5, 4, 3, 2, 1].map(star => {
      const count = approvedReviews.filter(r => r.rating === star).length;
      return Math.round((count / approvedReviews.length) * 100);
    });
    return { avg, count: approvedReviews.length, rows };
  }, [approvedReviews]);

  if (loading) {
    return (
      <div className="pt-48 pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">Gathering Ritual Testimonials</p>
      </div>
    );
  }

  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="font-display text-5xl md:text-6xl text-secondary dark:text-primary mb-4">The Luxury Verdict</h1>
        <p className="text-sm font-light italic opacity-60">Real stories from our global community of skincare enthusiasts.</p>
      </div>

      {/* Stats Summary */}
      <div className="flex flex-col lg:flex-row gap-8 mb-16 bg-white dark:bg-zinc-900 p-10 rounded-2xl border border-primary/10">
        <div className="flex flex-col items-center lg:items-start lg:w-1/3">
          <p className="text-7xl font-black text-secondary dark:text-primary mb-2 tracking-tighter">{stats.avg}</p>
          <div className="flex text-primary mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="material-icons text-xl">
                {i < Math.floor(Number(stats.avg)) ? 'star' : i < Number(stats.avg) ? 'star_half' : 'star_border'}
              </span>
            ))}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-40">Based on {stats.count} {stats.count === 1 ? 'review' : 'reviews'}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {['HYDRATING', 'GLOW-BOOSTING', 'SENSITIVE SAFE'].map(chip => (
              <span key={chip} className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black rounded-full border border-primary/20">
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          {[5, 4, 3, 2, 1].map((star, i) => (
            <div key={star} className="flex items-center gap-4">
              <span className="text-xs font-bold w-4">{star}</span>
              <div className="flex-1 h-2 bg-primary/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${stats.rows[i]}%` }}></div>
              </div>
              <span className="text-xs opacity-40 w-8">{stats.rows[i]}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {approvedReviews.length > 0 ? approvedReviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-primary/10 flex flex-col h-full hover:shadow-xl transition-shadow duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="flex text-primary">
                {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-icons text-sm">{i <= review.rating ? 'star' : 'star_border'}</span>)}
              </div>
              <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{review.date}</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm font-bold text-secondary dark:text-white">{review.author}</p>
              {review.verified && (
                <span className="flex items-center gap-1 text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  <span className="material-icons text-[12px]">verified</span> VERIFIED BUYER
                </span>
              )}
            </div>
            <h3 className="font-display text-xl mb-4 italic leading-relaxed">"{review.title}"</h3>
            <p className="text-sm font-light leading-relaxed opacity-70 mb-8 flex-grow">{review.content}</p>
            {review.images && review.images.length > 0 && (
              <div className="flex gap-2">
                {review.images.map((img, idx) => (
                  <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-primary/5">
                    <img src={img} alt="User result" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-full text-center py-20 opacity-30 italic">No ritual experiences documented yet. Be the first to share your journey.</div>
        )}
      </div>

      <div className="mt-20 text-center">
        <button className="gold-gradient text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:brightness-110 shadow-2xl transition-all">
          Write a Luxury Review
        </button>
      </div>
    </main>
  );
};

export default Reviews;
