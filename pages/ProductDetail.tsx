
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../App';
import { useProducts } from '../context/ProductContext';
import { useReviews } from '../context/ReviewContext';
import { useNotification } from '../context/NotificationContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const { products } = useProducts();
  const { getApprovedReviewsByProduct, addReview } = useReviews();
  const { showNotification } = useNotification();

  const [qty, setQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    title: '',
    content: ''
  });

  const product = products.find(p => p.id === id);
  const productReviews = useMemo(() => id ? getApprovedReviewsByProduct(id) : [], [id, getApprovedReviewsByProduct]);

  // Logic for related products
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter(p => p.id !== product.id) // Exclude current product
      .filter(p =>
        p.category === product.category ||
        p.tags.some(tag => product.tags.includes(tag))
      )
      .slice(0, 4); // Show up to 4 related products
  }, [product, products]);

  if (!product) {
    return (
      <div className="pt-40 text-center min-h-screen">
        <h1 className="text-2xl font-display">Product Not Found</h1>
        <Link to="/shop" className="text-primary mt-4 inline-block underline">Back to Shop</Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(product.name);
  const shareImage = encodeURIComponent(product.image);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    x: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${shareImage}&description=${shareTitle}`
  };

  const images = [product.image];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmittingReview(true);
    try {
      await addReview({
        ...reviewForm,
        productId: id,
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        verified: false,
        images: []
      });
      setReviewSubmitted(true);
      showNotification('Review submitted for moderation', 'success');
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewSubmitted(false);
        setReviewForm({ author: '', rating: 5, title: '', content: '' });
      }, 3000);
    } catch (error) {
      showNotification('Failed to submit review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <span>/</span>
        <span className="text-primary font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
        {/* Left: Product Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/5] bg-stone-50 dark:bg-stone-900 rounded-lg overflow-hidden relative group border border-primary/5">
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {product.status === 'Active' && (
              <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 text-[9px] uppercase tracking-widest font-bold border border-gold/30">
                Best Seller
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`aspect-square rounded overflow-hidden border-2 transition-all ${activeImageIdx === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          <h1 className="font-display text-4xl lg:text-5xl text-stone-900 dark:text-white mb-2 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex text-gold">
              {[1, 2, 3, 4].map(i => <span key={i} className="material-icons text-sm">star</span>)}
              <span className="material-icons text-sm">star_half</span>
            </div>
            <a href="#reviews" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors">
              ({productReviews.length + 125} Reviews)
            </a>
          </div>

          <div className="text-3xl font-light text-primary dark:text-gold mb-8">GH₵{product.price.toFixed(2)}</div>

          <p className="text-stone-600 dark:text-stone-400 mb-8 leading-relaxed font-light">
            {product.description} Engineered with our proprietary cellular complex, this formulation targets visible signs of aging while providing an instant, luminous glow that lasts all day.
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: 'flare', label: 'Radiance' },
              { icon: 'water_drop', label: 'Hydration' },
              { icon: 'auto_awesome', label: 'Firming' }
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-stone-50 dark:bg-stone-900 rounded border border-stone-100 dark:border-stone-800">
                <span className="material-icons text-primary text-xl mb-1">{item.icon}</span>
                <p className="text-[9px] uppercase font-black tracking-widest">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Expandable Sections */}
          <div className="border-t border-stone-100 dark:border-stone-800 mb-10">
            <details className="group py-5 border-b border-stone-100 dark:border-stone-800" open>
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="text-xs font-bold uppercase tracking-widest">Key Ingredients</span>
                <span className="material-icons text-stone-400 group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="pt-4 text-sm font-light text-stone-600 dark:text-stone-400 space-y-2">
                <p><strong className="text-primary dark:text-gold font-bold">2% Pure Vitamin C:</strong> Powerful antioxidant for instant brightness.</p>
                <p><strong className="text-primary dark:text-gold font-bold">Hyaluronic Acid:</strong> Triple-molecular weight for deep hydration.</p>
                <p><strong className="text-primary dark:text-gold font-bold">Niacinamide:</strong> Refines skin texture and minimizes pores.</p>
              </div>
            </details>
            <details className="group py-5 border-b border-stone-100 dark:border-stone-800">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <span className="text-xs font-bold uppercase tracking-widest">How To Use</span>
                <span className="material-icons text-stone-400 group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="pt-4 text-sm font-light text-stone-600 dark:text-stone-400">
                Apply 3-4 drops to cleansed skin, morning and night. Gently press into face and neck until fully absorbed. Follow with C.I Velvet Recovery Cream.
              </div>
            </details>
            <details className="group py-5 border-b border-stone-100 dark:border-stone-800">
              <summary className="flex justify-between items-center cursor-pointer list-none">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest">Real Results</span>
                  <span className="text-[9px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Clinical Focus</span>
                </div>
                <span className="material-symbols-outlined text-stone-400 group-open:rotate-180 transition-transform">expand_more</span>
              </summary>
              <div className="pt-6 space-y-6">
                <div className="flex gap-4 items-center p-4 bg-luxury-brown/5 rounded-xl border border-primary/5">
                  <div className="text-center shrink-0">
                    <p className="text-2xl font-display text-primary">94%</p>
                  </div>
                  <p className="text-[10px] text-stone-500 font-light leading-relaxed uppercase tracking-widest">
                    Agreed skin looked more luminous after just 7 days of consistent ritual use.
                  </p>
                </div>
                <div className="flex gap-4 items-center p-4 bg-luxury-brown/5 rounded-xl border border-primary/5">
                  <div className="text-center shrink-0">
                    <p className="text-2xl font-display text-primary">88%</p>
                  </div>
                  <p className="text-[10px] text-stone-500 font-light leading-relaxed uppercase tracking-widest">
                    Reported a significant reduction in visible dark spots and uneven pigmentation.
                  </p>
                </div>
              </div>
            </details>
          </div>

          {/* Auto-Replenish Logic */}
          <div className="mb-8 p-6 bg-luxury-brown/5 rounded-2xl border border-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary font-light">refresh</span>
                <span className="text-xs font-bold uppercase tracking-widest">Auto-Replenish & Save</span>
              </div>
              <span className="text-[9px] font-black text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Save 10%</span>
            </div>
            <p className="text-[11px] text-stone-500 mb-6 font-light leading-relaxed">
              Never miss a moment of radiance. Automatically delivered to your door based on your ritual frequency.
            </p>
            <div className="flex gap-2">
              {['30 Days', '60 Days', '90 Days'].map((freq) => (
                <button
                  key={freq}
                  className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-primary/20 rounded-lg hover:border-primary hover:bg-white dark:hover:bg-stone-800 transition-all focus:ring-1 focus:ring-primary outline-none"
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col space-y-4 mb-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded h-14 w-32 shrink-0">
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
                onClick={() => addToCart({ ...product })}
                className="flex-1 bg-primary text-white font-bold uppercase tracking-[0.2em] text-[10px] h-14 hover:brightness-110 shadow-lg transition-all rounded"
              >
                Add to Ritual Bag
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className="w-14 h-14 flex items-center justify-center border border-stone-200 dark:border-stone-800 rounded hover:bg-stone-50 dark:hover:bg-stone-900 transition-all group shrink-0"
                aria-label={isFavorited ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <span className={`material-symbols-outlined transition-all ${isFavorited ? 'text-accent fill-1' : 'text-stone-300 group-hover:text-accent'}`}>
                  favorite
                </span>
              </button>
            </div>

            <button className="w-full bg-gold-gradient text-primary font-black uppercase tracking-[0.2em] py-4 hover:opacity-90 transition-all rounded shadow-lg text-[10px]">
              Complete Selection Now
            </button>
          </div>

          {/* Social Sharing Section */}
          <div className="flex flex-wrap items-center gap-4 py-6 border-t border-stone-100 dark:border-stone-800">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Share Ritual:</span>
            <div className="flex gap-2">
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-stone-100 dark:border-stone-800 rounded hover:bg-stone-50 transition-all group"
                aria-label="Share on Facebook"
              >
                <svg className="w-4 h-4 fill-current text-stone-300 group-hover:text-primary transition-colors" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </a>
              <a
                href={shareLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-stone-100 dark:border-stone-800 rounded hover:bg-stone-50 transition-all group"
                aria-label="Share on X"
              >
                <svg className="w-3.5 h-3.5 fill-current text-stone-300 group-hover:text-primary transition-colors" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.134l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href={shareLinks.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-stone-100 dark:border-stone-800 rounded hover:bg-stone-50 transition-all group"
                aria-label="Share on Pinterest"
              >
                <svg className="w-4 h-4 fill-current text-stone-300 group-hover:text-primary transition-colors" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.27 2.67 7.9 6.47 9.35-.09-.8-.17-2.02.03-2.89.19-.79 1.2-5.07 1.2-5.07s-.31-.61-.31-1.5c0-1.41.82-2.46 1.83-2.46.86 0 1.28.65 1.28 1.43 0 .87-.55 2.16-.84 3.36-.24.99.49 1.81 1.46 1.81 1.76 0 3.1-1.85 3.1-4.52 0-2.36-1.7-4.01-4.12-4.01-2.81 0-4.46 2.11-4.46 4.28 0 .85.33 1.76.74 2.25.08.1.09.19.07.28-.08.31-.25 1.01-.28 1.15-.04.16-.14.2-.32.11-1.19-.55-1.93-2.3-1.93-3.7 0-3.01 2.19-5.78 6.31-5.78 3.31 0 5.88 2.36 5.88 5.5 0 3.3-2.08 5.96-4.97 5.96-1 0-1.94-.52-2.26-1.13l-.61 2.33c-.22.84-.81 1.89-1.21 2.54 1 .31 2.06.47 3.16.47 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between py-6 border-t border-stone-100 dark:border-stone-800">
            {[
              { icon: 'verified', label: 'Dermatologist\nTested' },
              { icon: 'eco', label: 'Vegan &\nCruelty Free' },
              { icon: 'recycling', label: 'Sustainably\nSourced' },
              { icon: 'local_shipping', label: 'Complimentary\nShipping' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center opacity-60">
                <span className="material-icons text-primary mb-1">{item.icon}</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-center whitespace-pre-line leading-tight">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-stone-100 dark:border-stone-800 pt-24 pb-12">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl text-stone-900 dark:text-white mb-4 uppercase tracking-[0.2em]">Related Rituals</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <div key={p.id} className="group flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-primary/5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
                  {/* Image Area */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Link to={`/product/${p.id}`} className="block h-full">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    </Link>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 pointer-events-none"></div>
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full bg-white/90 backdrop-blur-md text-secondary py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all shadow-2xl rounded-lg"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>

                  {/* Info Area (Dark Brown Background) */}
                  <div className="p-5 bg-luxury-brown text-white flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[8px] text-gold uppercase tracking-[0.3em] font-black mb-1.5 opacity-80">{p.brand}</p>
                      <Link to={`/product/${p.id}`}>
                        <h3 className="font-display text-base group-hover:text-gold transition-colors leading-tight line-clamp-2 mb-2">
                          {p.name}
                        </h3>
                      </Link>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-white/10 mt-2">
                      <p className="text-gold text-sm font-bold tracking-widest">GH₵{p.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section id="reviews" className="border-t border-stone-100 dark:border-stone-800 pt-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl text-stone-900 dark:text-white mb-4 uppercase tracking-widest">Ritual Reviews</h2>
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-5xl font-black text-primary">4.9</span>
                <div className="flex text-gold mt-1">
                  {[1, 2, 3, 4, 5].map(i => <span key={i} className="material-icons text-sm">star</span>)}
                </div>
              </div>
              <div className="h-12 w-px bg-stone-200 dark:bg-stone-800"></div>
              <p className="text-xs font-light text-stone-500 dark:text-stone-400 leading-relaxed uppercase tracking-widest">
                Based on 1,240 detailed assessments from our global collective.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-8 py-4 border border-primary text-primary font-bold uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all rounded shadow-sm"
          >
            {showReviewForm ? 'Cancel Ritual Feedback' : 'Document Your Ritual'}
          </button>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="bg-stone-50 dark:bg-stone-900 p-8 md:p-12 rounded-2xl mb-16 border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
            {reviewSubmitted ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-accent text-6xl mb-4 font-light">auto_awesome</span>
                <h3 className="font-display text-3xl mb-2">Thank You</h3>
                <p className="text-sm font-light opacity-60 uppercase tracking-widest">Your contribution to the collective is being reviewed.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="max-w-2xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Your Signature</label>
                    <input
                      required
                      type="text"
                      value={reviewForm.author}
                      onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                      placeholder="Full Name"
                      className="w-full bg-transparent border-b border-primary/20 focus:border-primary focus:ring-0 py-3 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Your Assessment</label>
                    <div className="flex gap-1 py-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: i })}
                          className={`material-icons text-gold text-2xl hover:scale-110 transition-transform ${reviewForm.rating >= i ? 'opacity-100' : 'opacity-20'}`}
                        >
                          star
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Summary Title</label>
                  <input
                    required
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    placeholder="e.g. A Transcendent Experience"
                    className="w-full bg-transparent border-b border-primary/20 focus:border-primary focus:ring-0 py-3 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Detailed Account</label>
                  <textarea
                    required
                    value={reviewForm.content}
                    onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                    placeholder="Describe your experience with this formulation..."
                    className="w-full bg-transparent border-b border-primary/20 focus:border-primary focus:ring-0 py-3 outline-none min-h-[120px] resize-none"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full bg-primary text-white py-5 rounded font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Processing...' : 'Publish Your Ritual'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Review List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          {productReviews.length > 0 ? productReviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all shadow-sm flex flex-col group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`material-icons text-xs ${i < review.rating ? '' : 'opacity-20'}`}>star</span>
                  ))}
                </div>
                <span className="text-[9px] font-bold opacity-30 uppercase tracking-[0.2em]">{review.date}</span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-widest">{review.author}</p>
                {review.verified && (
                  <span className="flex items-center gap-1.5 text-[8px] font-black text-primary bg-gold/10 px-2 py-1 rounded-full border border-gold/20 tracking-[0.1em]">
                    <span className="material-icons text-[12px]">verified</span> VERIFIED RITUAL
                  </span>
                )}
              </div>

              <h3 className="font-display text-xl mb-4 italic leading-relaxed text-stone-800 dark:text-stone-200">"{review.title}"</h3>
              <p className="text-sm font-light leading-relaxed opacity-60 mb-8 flex-grow">{review.content}</p>

              {review.images && review.images.length > 0 && (
                <div className="flex gap-3">
                  {review.images.map((img, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-primary/5 grayscale hover:grayscale-0 transition-all cursor-zoom-in">
                      <img src={img} alt="User Result" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )) : (
            <div className="col-span-full text-center py-20 opacity-30 italic"> No product assessments found for this formulation yet. </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="bg-background-dark text-white p-12 md:p-20 rounded-3xl text-center relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <img src="/products/shelf-display.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10">
            <h3 className="font-display text-3xl md:text-5xl mb-6 uppercase tracking-[0.2em]">Ready for Radiance?</h3>
            <p className="text-stone-400 max-w-lg mx-auto mb-10 font-light text-sm md:text-base leading-relaxed tracking-wide">
              Join thousands of members who have transformed their skin with our clinical-grade botanical formulations.
            </p>
            <Link to="/shop" className="inline-block bg-white text-stone-900 px-10 py-5 rounded font-bold uppercase tracking-[0.3em] text-[10px] hover:bg-gold hover:text-white transition-all shadow-2xl">
              Explore the Entire Ritual
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetail;
