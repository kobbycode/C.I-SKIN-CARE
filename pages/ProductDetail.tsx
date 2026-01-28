
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { useProducts } from '../context/ProductContext';
import { useReviews } from '../context/ReviewContext';
import { useNotification } from '../context/NotificationContext';
import OptimizedImage from '../components/OptimizedImage';
import { SkeletonLine } from '../components/Skeletons';

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

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    author: '',
    rating: 5,
    title: '',
    content: ''
  });

  const product = products.find(p => p.id === id);
  const productReviews = useMemo(() => id ? getApprovedReviewsByProduct(id) : [], [id, getApprovedReviewsByProduct]);

  const averageRating = useMemo(() => {
    if (productReviews.length === 0) return 5.0; // Default for new products or as placeholder
    const sum = productReviews.reduce((acc, rev) => acc + rev.rating, 0);
    return (sum / productReviews.length).toFixed(1);
  }, [productReviews]);

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

  // Keep hooks unconditional: do not return early before useEffect below.
  const isReady = !loading && !!product;

  const isFavorited = product ? isInWishlist(product.id) : false;
  // WhatsApp caches previews aggressively. Add a unique query param to force fresh scraping.
  // This does NOT change the actual product route; it only affects shared URLs.
  const shareBaseUrl = window.location.href;
  const shareUniqueUrl = `${shareBaseUrl}${shareBaseUrl.includes('?') ? '&' : '?'}share=${Date.now()}`;
  const shareUrl = encodeURIComponent(shareUniqueUrl);
  const shareTitle = encodeURIComponent(product?.name ?? '');
  const shareImage = encodeURIComponent(product?.image ?? '');

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    x: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(
      `${product?.name ?? 'C.I Skin Care'}${product ? ` – GH₵${product.price.toFixed(2)}` : ''}\n${shareUniqueUrl}`
    )}`
  };

  const handleInstagramShare = async () => {
    const url = shareUniqueUrl;
    const title = product?.name ?? 'C.I Skin Care';
    const text = product ? `${title} – GH₵${product.price.toFixed(2)}` : title;

    try {
      // Best UX on mobile: use the native share sheet (user can pick Instagram).
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await (navigator as any).share({ title, text, url });
        return;
      }
    } catch {
      // ignore and fall back
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        showNotification('Link copied — open Instagram and paste it', 'success');
      } else {
        showNotification('Copy this link and share on Instagram', 'success');
      }
    } finally {
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    }
  };

  const images = product ? [product.image] : [];

  useEffect(() => {
    if (!product) return;
    const makeAbsolute = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    };
    const ogTitle = `${product.name} – GH₵${product.price.toFixed(2)} | C.I SKIN CARE`;
    const ogDesc = product.description || 'Discover science-backed luxury skincare.';
    const ogImage = makeAbsolute(product.image);
    const ogUrl = window.location.href;

    const setMeta = (property: string, content: string, isTwitter = false) => {
      const selector = isTwitter ? `meta[property="twitter:${property}"]` : `meta[property="og:${property}"]`;
      let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', isTwitter ? `twitter:${property}` : `og:${property}`);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    document.title = ogTitle;
    setMeta('title', ogTitle);
    setMeta('description', ogDesc);
    setMeta('image', ogImage);
    setMeta('image:secure_url', ogImage);
    setMeta('image:type', 'image/jpeg');
    setMeta('image:width', '1200');
    setMeta('image:height', '630');
    setMeta('url', ogUrl);
    setMeta('card', 'summary_large_image', true);
    setMeta('title', ogTitle, true);
    setMeta('description', ogDesc, true);
    setMeta('image', ogImage, true);

    let linkImage = document.head.querySelector('link[rel="image_src"]') as HTMLLinkElement | null;
    if (!linkImage) {
      linkImage = document.createElement('link');
      linkImage.setAttribute('rel', 'image_src');
      document.head.appendChild(linkImage);
    }
    linkImage.setAttribute('href', ogImage);

    const jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: [ogImage],
      description: ogDesc,
      brand: product.brand || 'C.I Skin Care',
      offers: {
        '@type': 'Offer',
        url: ogUrl,
        priceCurrency: 'GHS',
        price: product.price.toFixed(2),
        availability: 'https://schema.org/InStock'
      }
    };
    let ldTag = document.getElementById('product-jsonld') as HTMLScriptElement | null;
    if (!ldTag) {
      ldTag = document.createElement('script');
      ldTag.type = 'application/ld+json';
      ldTag.id = 'product-jsonld';
      document.head.appendChild(ldTag);
    }
    ldTag.textContent = JSON.stringify(jsonLd);
  }, [product?.name, product?.price, product?.description, product?.image]);

  // On direct visits from shared links, products load async. Show a loader until we know for sure.
  if (loading) {
    return (
      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-primary/5 dark:bg-white/5 rounded-lg overflow-hidden border border-primary/5 animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square rounded bg-primary/5 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-6">
            <SkeletonLine className="h-10 w-3/4" />
            <SkeletonLine className="h-4 w-40" />
            <SkeletonLine className="h-8 w-32" />
            <div className="space-y-3">
              <SkeletonLine className="h-3 w-full" />
              <SkeletonLine className="h-3 w-11/12" />
              <SkeletonLine className="h-3 w-10/12" />
            </div>
            <div className="h-14 w-full rounded bg-primary/10 dark:bg-white/10 animate-pulse" />
            <div className="h-14 w-full rounded bg-primary/10 dark:bg-white/10 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (!isReady) {
    return (
      <div className="pt-40 text-center min-h-screen">
        <h1 className="text-2xl font-display">Product Not Found</h1>
        <Link to="/shop" className="text-primary mt-4 inline-block underline">Back to Shop</Link>
      </div>
    );
  }

  const handleBuyNow = () => {
    if (!product) return;
    const count = Number.isFinite(qty) ? Math.max(1, qty) : 1;
    for (let i = 0; i < count; i++) addToCart({ ...product });
    // addToCart opens the drawer; close it and take user straight to checkout
    setCartOpen(false);
    navigate('/checkout');
  };

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
            <OptimizedImage
              src={images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="eager"
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

            <button
              onClick={handleBuyNow}
              className="w-full bg-gold-gradient text-primary font-black uppercase tracking-[0.2em] py-4 hover:opacity-90 transition-all rounded shadow-lg text-[10px]"
            >
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
                href="https://www.instagram.com/"
                onClick={(e) => {
                  e.preventDefault();
                  handleInstagramShare();
                }}
                className="w-10 h-10 flex items-center justify-center border border-stone-100 dark:border-stone-800 rounded hover:bg-stone-50 transition-all group"
                aria-label="Share on Instagram"
              >
                <svg className="w-4 h-4 fill-current text-stone-300 group-hover:text-primary transition-colors" viewBox="0 0 24 24">
                  <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm9 2h-9A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4z" />
                  <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                  <path d="M17.5 6.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
              </a>
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-stone-100 dark:border-stone-800 rounded hover:bg-stone-50 transition-all group"
                aria-label="Share on WhatsApp"
              >
                <svg className="w-4 h-4 fill-current text-stone-300 group-hover:text-primary transition-colors" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.49 2 12c0 1.86.51 3.6 1.39 5.1L2 22l4.01-1.36C7.47 21.49 9.68 22 12 22c5.52 0 10-4.49 10-10S17.52 2 12 2zm0 18c-2.06 0-3.97-.72-5.49-1.92l-.39-.3-2.38.81.8-2.32-.26-.41C3.73 14.64 3 13.38 3 12c0-4.41 3.58-8 8-8s8 3.59 8 8-3.58 8-8 8zm4.57-5.21c-.25-.13-1.47-.73-1.7-.82-.23-.08-.4-.13-.57.13-.17.25-.65.82-.8.99-.15.17-.3.19-.55.06-.25-.13-1.06-.39-2.03-1.25-.75-.66-1.25-1.47-1.4-1.72-.15-.25-.02-.39.11-.52.12-.12.25-.32.38-.48.13-.16.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.57-1.37-.78-1.87-.21-.5-.42-.43-.57-.44-.15 0-.32-.01-.49-.01-.17 0-.45.06-.69.32-.24.26-.91.89-.91 2.16s.94 2.51 1.07 2.69c.13.17 1.85 2.82 4.48 3.94.63.27 1.12.43 1.51.56.63.2 1.2.17 1.65.1.5-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29z"/>
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
                <span className="text-5xl font-black text-primary">{averageRating}</span>
                <div className="flex text-gold mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="material-icons text-sm">
                      {i < Math.floor(Number(averageRating)) ? 'star' : i < Number(averageRating) ? 'star_half' : 'star_border'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-12 w-px bg-stone-200 dark:bg-stone-800"></div>
              <p className="text-xs font-light text-stone-500 dark:text-stone-400 leading-relaxed uppercase tracking-widest">
                Based on {productReviews.length} detailed {productReviews.length === 1 ? 'assessment' : 'assessments'} from our ritual community.
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
