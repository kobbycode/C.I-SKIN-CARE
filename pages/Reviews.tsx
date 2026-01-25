
import React, { useMemo, useState } from 'react';
import { useReviews } from '../context/ReviewContext';
import { useNotification } from '../context/NotificationContext';

const Reviews: React.FC = () => {
  const { reviews, loading, addReview } = useReviews();
  const { showNotification } = useNotification();
  const approvedReviews = useMemo(() => reviews.filter(r => r.status === 'Approved'), [reviews]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author: '',
    title: '',
    content: '',
    rating: 5
  });

  const stats = useMemo(() => {
    if (approvedReviews.length === 0) return { avg: 5.0, count: 0, rows: [100, 0, 0, 0, 0] };
    const avg = (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1);
    const rows = [5, 4, 3, 2, 1].map(star => {
      const count = approvedReviews.filter(r => r.rating === star).length;
      return Math.round((count / approvedReviews.length) * 100);
    });
    return { avg, count: approvedReviews.length, rows };
  }, [approvedReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addReview({
        ...formData,
        verified: false,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Pending'
      });

      showNotification('Review submitted! It will appear after approval.', 'success');
      setIsModalOpen(false);
      setFormData({
        author: '',
        title: '',
        content: '',
        rating: 5
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      showNotification('Failed to submit review. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <button
          onClick={() => setIsModalOpen(true)}
          className="gold-gradient text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:brightness-110 shadow-2xl transition-all"
        >
          Write a Luxury Review
        </button>
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-secondary dark:text-white">Share Your Experience</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmitReview} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Your Name</label>
                <input
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary/20"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="text-3xl transition-colors"
                    >
                      <span className={`material-icons ${star <= formData.rating ? 'text-primary' : 'text-stone-300'}`}>
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Review Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 ring-primary/20"
                  placeholder="Amazing results!"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Your Review</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-xl px-4 py-3 text-sm min-h-[150px] resize-none focus:ring-2 ring-primary/20"
                  placeholder="Share your experience with our products..."
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-stone-200 dark:border-stone-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-4 gold-gradient text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Reviews;
