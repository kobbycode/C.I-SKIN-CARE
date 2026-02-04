
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { useProducts } from '../context/ProductContext';
import { useReviews } from '../context/ReviewContext';
import { useNotification } from '../context/NotificationContext';
import OptimizedImage from '../components/OptimizedImage';
import { ProductDetailSkeleton } from '../components/Skeletons';
import { ProductVariant } from '../types';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist, setCartOpen } = useApp();
  const { products, loading } = useProducts();
  const { getApprovedReviewsByProduct, addReview } = useReviews();
  const { showNotification } = useNotification();

  const [qty, setQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Back in stock notification state
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [showNotifySuccess, setShowNotifySuccess] = useState(false);

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    title: '',
    content: ''
  });

  const product = products.find(p => p.id === id);
  const productReviews = useMemo(() => id ? getApprovedReviewsByProduct(id) : [], [id, getApprovedReviewsByProduct]);

  // Set default variant if available
  useEffect(() => {
    if (product?.variants && product?.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, selectedVariant]);

  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return 5.0; // Default for new products or as placeholder
    const sum = productReviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / productReviews.length).toFixed(1);
  }, [productReviews]);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail || !product) return;

    try {
      setIsSubmittingNotify(true);
      await addDoc(collection(db, 'restock_requests'), {
        productId: product.id,
        productName: product.name,
        variantId: selectedVariant?.id || null,
        variantName: selectedVariant?.name || null,
        email: notifyEmail,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setShowNotifySuccess(true);
      setNotifyEmail('');
      showNotification('Restock alert set! We will notify you.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Failed to set alert', 'error');
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  const images = useMemo(() => {
    if (!product) return [];
    return [product.image, ...(product.gallery || [])];
  }, [product]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product || product.status !== 'Active') {
    return (
      <div className="pt-40 pb-24 text-center">
        <p className="font-display text-2xl mb-6">Mistery Ritual Not Found</p>
        <p className="text-xs text-stone-500 mb-8 uppercase tracking-widest font-bold">The formula you seek is currently being refined in our alchemical laboratory.</p>
        <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Return to Collection</Link>
      </div>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmittingReview(true);
    try {
      await addReview({
        ...reviewForm,
        productId: id,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      setReviewSubmitted(true);
      showNotification('Review submitted for moderation', 'success');
    } catch (err) {
      showNotification('Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <main className="pt-24 lg:pt-40 pb-24 px-6 lg:px-10 bg-white dark:bg-stone-950">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        {/* Left: Product Images */}
        <div className="lg:sticky lg:top-40 h-fit space-y-6 max-w-[420px] mx-auto lg:max-w-lg">
          <div className="aspect-square bg-stone-50 rounded-3xl overflow-hidden relative group border border-stone-100 dark:border-stone-900">
            {activeImageIdx === images.length ? (
              <video
                src={product.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <OptimizedImage
                src={images[activeImageIdx]}
                alt={product.name}
                className="w-full h-full group-hover:scale-105 transition-transform duration-1000"
              />
            )}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="bg-white/90 backdrop-blur px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-secondary rounded shadow-sm">
                  {tag}
                </span>
              ))}
            </div>
            {isInWishlist(product.id) && (
              <div className="absolute top-6 right-6 w-8 h-8 bg-white rounded-full flex items-center justify-center text-red-500 shadow-lg">
                <span className="material-symbols-outlined text-sm">favorite</span>
              </div>
            )}
          </div>
          {(images.length > 1 || product.videoUrl) && (
            <div className="grid grid-cols-5 gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`aspect-square rounded overflow-hidden border-2 transition-all ${activeImageIdx === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
              {product.videoUrl && (
                <button
                  onClick={() => setActiveImageIdx(images.length)}
                  className={`aspect-square rounded overflow-hidden border-2 transition-all flex flex-col items-center justify-center bg-stone-100 ${activeImageIdx === images.length ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <span className="material-symbols-outlined text-stone-500">play_circle</span>
                  <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">Video</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <h1 className="font-display text-3xl lg:text-5xl text-stone-900 dark:text-white mb-2 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="material-icons text-sm">
                  {i < Math.floor(Number(averageRating)) ? 'star' : i < Number(averageRating) ? 'star_half' : 'star_border'}
                </span>
              ))}
            </div>
            <a href="#reviews" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors">
              ({productReviews.length} {productReviews.length === 1 ? 'Review' : 'Reviews'})
            </a>
          </div>

          <div className="text-3xl font-light text-primary dark:text-gold mb-8">GH₵{(selectedVariant ? selectedVariant.price : product.price).toFixed(2)}</div>

          {/* Variant Selector */}
          {product?.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D] dark:text-stone-300 mb-3 block">Select Option</label>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v) => {
                  const variantOutOfStock = (v.stock ?? 0) <= 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-3 rounded border text-xs font-bold uppercase tracking-wider transition-all min-w-[3rem] relative ${selectedVariant?.id === v.id
                        ? 'bg-primary text-white border-primary shadow-md'
                        : 'bg-transparent border-stone-200 dark:border-stone-700 text-stone-500 hover:border-primary hover:text-primary'
                        } ${variantOutOfStock ? 'opacity-50' : ''}`}
                    >
                      {v.name}
                      {variantOutOfStock && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[7px] px-1 py-0.5 rounded font-black uppercase tracking-tighter">Out</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Coupon Compatibility Banner */}
          {product.couponCodes && product.couponCodes.length > 0 && (
            <div className="mb-8 p-4 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-100/50 dark:border-green-900/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-green-600 text-sm">confirmation_number</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-700">Eligible Ritual Savings</span>
              </div>
              <p className="text-[9px] text-green-600/80 uppercase font-bold tracking-widest leading-loose">
                Use code(s): {product.couponCodes.map((code, idx) => (
                  <span key={code} className="text-stone-900 dark:text-white bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-green-100 mx-1">{code}</span>
                ))}
              </p>
            </div>
          )}

          {/* Stock Notification */}
          {(() => {
            const currentStock = selectedVariant ? (selectedVariant.stock ?? 0) : (product.stock ?? 0);
            if (currentStock <= 0) {
              return (
                <div className="mb-8 flex flex-col gap-4 bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20">
                  <div className="flex items-center gap-2 text-red-600">
                    <span className="material-symbols-outlined text-lg">error</span>
                    <p className="text-xs font-bold uppercase tracking-widest">Currently Out of Stock</p>
                  </div>

                  {showNotifySuccess ? (
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                      <p className="text-[10px] font-black uppercase tracking-widest">We'll Notify Your Inner Muse</p>
                    </div>
                  ) : (
                    <form onSubmit={handleNotifySubmit} className="space-y-3">
                      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest leading-relaxed">
                        Join our priority waitlist to be rituals-ready upon replenishment.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          required
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          placeholder="Your Email"
                          className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded px-4 py-2 text-xs focus:ring-0 focus:border-red-400"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingNotify}
                          className="bg-red-600 text-white px-4 py-2 rounded text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all"
                        >
                          {isSubmittingNotify ? 'Setting...' : 'Notify Me'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            }
            if (currentStock <= 10) {
              return (
                <div className="mb-8 flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30">
                  <span className="material-symbols-outlined text-lg">priority_high</span>
                  <p className="text-xs font-bold uppercase tracking-widest">Only {currentStock} Left in Ritual Vault</p>
                </div>
              );
            }
            return null;
          })()}

          <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed font-light">
            {product.description} Engineered with our proprietary cellular complex, this formulation targets visible signs of aging while providing an instant, luminous glow that lasts all day.
          </p>

          {/* Action Row */}
          {(() => {
            const currentStock = selectedVariant ? (selectedVariant.stock ?? 0) : (product.stock ?? 0);
            const isOutOfStock = currentStock <= 0;

            return (
              <div className="flex flex-col space-y-4 mb-10">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center border border-stone-200 dark:border-stone-700 rounded h-14 w-32 shrink-0 ${isOutOfStock ? 'opacity-30 pointer-events-none' : ''}`}>
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 hover:text-primary transition-colors">-</button>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                      className="w-full text-center border-none bg-transparent focus:ring-0 font-bold"
                    />
                    <button onClick={() => setQty(qty + 1)} className="px-4 hover:text-primary transition-colors">+</button>
                  </div>

                  <button
                    onClick={() => {
                      if (product) {
                        addToCart(product, selectedVariant || undefined, qty);
                        setCartOpen(true);
                      }
                    }}
                    disabled={isOutOfStock}
                    className={`flex-1 font-bold uppercase tracking-[0.2em] text-[10px] h-14 shadow-lg transition-all rounded ${isOutOfStock
                      ? 'bg-stone-100 dark:bg-stone-900 text-stone-400 cursor-not-allowed shadow-none border border-stone-200 dark:border-stone-800'
                      : 'bg-primary text-white hover:brightness-110 shimmer-btn'
                      }`}
                  >
                    {isOutOfStock ? 'Restock Imminent' : 'Add to Ritual Bag'}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className="w-14 h-14 flex items-center justify-center border border-stone-200 dark:border-stone-800 rounded hover:bg-stone-50 dark:hover:bg-stone-900 transition-all group shrink-0"
                  >
                    <span className={`material-symbols-outlined transition-all ${isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-stone-400 group-hover:text-primary'}`}>
                      {isInWishlist(product.id) ? 'favorite' : 'favorite'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Details Tabs */}
          <div className="border-t border-stone-100 dark:border-stone-900 pt-10 space-y-8">
            <details className="group" open>
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D] dark:text-stone-300">Skin Ritual Guide</span>
                <span className="material-symbols-outlined text-stone-300 group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="pt-4 text-xs text-stone-500 dark:text-stone-400 font-light leading-loose uppercase tracking-widest">
                After cleansing, apply 2-3 drops to face and neck. Gently massage until rituals are absorbed. Follow with moisturizer.
              </div>
            </details>
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#221C1D] dark:text-stone-300">The Alchemist's Blend</span>
                <span className="material-symbols-outlined text-stone-300 group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="pt-4 text-xs text-stone-500 dark:text-stone-400 font-light leading-loose uppercase tracking-widest">
                Rosa Damascena Flower Water, Hyaluronic Acid, Squalane, Vitamin C (ascorbate), Botanical Extracts. Free from parabens, sulfates, and synthetic fragrances.
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section id="reviews" className="mt-20 lg:mt-32 max-w-[1000px] mx-auto pt-16 lg:pt-24 border-t border-stone-100 dark:border-stone-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4 block underline">Community Evidence</span>
            <h2 className="font-display text-3xl lg:text-4xl text-stone-900 dark:text-white">Customer Chronicles</h2>
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-8 py-3 bg-luxury-brown text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-black transition-all shadow-xl"
          >
            Leave Your Evidence
          </button>
        </div>

        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="mb-20 bg-stone-50 dark:bg-stone-900/50 p-10 rounded-3xl animate-in slide-in-from-top duration-500 border border-stone-100 dark:border-stone-800">
            {reviewSubmitted ? (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-green-500 text-5xl mb-4">task_alt</span>
                <p className="font-display text-2xl mb-2">Evidence Recorded</p>
                <p className="text-xs text-stone-500">Your ritual experience has been sent for archival moderation.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Your Name</label>
                    <input
                      required
                      value={reviewForm.author}
                      onChange={e => setReviewForm({ ...reviewForm, author: e.target.value })}
                      className="w-full bg-white dark:bg-stone-950 border border-primary/10 rounded px-4 py-3 text-xs focus:ring-accent focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Rating</label>
                    <select
                      value={reviewForm.rating}
                      onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-stone-950 border border-primary/10 rounded px-4 py-3 text-xs focus:ring-accent focus:border-accent"
                    >
                      <option value="5">5 Stars — Excellent</option>
                      <option value="4">4 Stars — Very Good</option>
                      <option value="3">3 Stars — Average</option>
                      <option value="2">2 Stars — Poor</option>
                      <option value="1">1 Star — Fails Ritual</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Evidence Title</label>
                  <input
                    required
                    value={reviewForm.title}
                    onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="w-full bg-white dark:bg-stone-950 border border-primary/10 rounded px-4 py-3 text-xs focus:ring-accent focus:border-accent"
                    placeholder="Briefly summarize your reaction..."
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">The Narrative</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.content}
                    onChange={e => setReviewForm({ ...reviewForm, content: e.target.value })}
                    className="w-full bg-white dark:bg-stone-950 border border-primary/10 rounded px-4 py-3 text-xs focus:ring-accent focus:border-accent"
                    placeholder="Tell us about the texture, scent, and results of this ritual..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full py-4 bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded hover:brightness-110 transition-all shadow-lg"
                >
                  {isSubmittingReview ? 'Recording Narrative...' : 'Submit Evidence'}
                </button>
              </div>
            )}
          </form>
        )}

        <div className="space-y-12">
          {productReviews.length > 0 ? productReviews.map((review, i) => (
            <div key={i} className="pb-12 border-b border-stone-50 dark:border-stone-900 last:border-0">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`material-icons text-xs ${i < review.rating ? 'text-gold' : 'text-stone-200'}`}>star</span>
                  ))}
                </div>
                <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold italic">{review.date}</span>
              </div>
              <h4 className="font-bold text-lg mb-3 text-stone-900 dark:text-white uppercase tracking-tight">{review.title}</h4>
              <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed italic mb-4">"{review.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                  {review.author[0]}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{review.author}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 opacity-20">
              <span className="material-symbols-outlined text-6xl mb-4 font-light">history_edu</span>
              <p className="font-display text-xl uppercase tracking-widest">Awaiting First Evidence</p>
            </div>
          )}
        </div>
      </section>

      {/* Suggested Rituals */}
      <section className="mt-20 lg:mt-32 pt-16 lg:pt-24 border-t border-stone-100 dark:border-stone-900">
        <h3 className="font-display text-2xl lg:text-3xl text-[#221C1D] dark:text-white mb-10 lg:mb-16 text-center">Complete Your Ritual</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {products.filter(p => p.id !== id).slice(0, 4).map(p => (
            <Link to={`/product/${p.id}`} key={p.id} className="group flex flex-col items-center text-center">
              <div className="aspect-[3/4] w-full bg-stone-50 rounded-2xl overflow-hidden mb-6">
                <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <h4 className="font-display text-xl mb-1">{p.name}</h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1">Start Ritual</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
