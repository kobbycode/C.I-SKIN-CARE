
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../App';
import { useProducts } from '../context/ProductContext';
import { useCategories } from '../context/CategoryContext';
import OptimizedImage from '../components/OptimizedImage';
import { ShopSkeleton } from '../components/Skeletons';

const Shop: React.FC = () => {
  const { addToCart } = useApp();
  const { products, loading: productsLoading } = useProducts();
  const { categories: dynamicCategories, loading: categoriesLoading } = useCategories();

  // Ensure we show loading on initial mount until data arrives
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  useEffect(() => {
    if (!productsLoading && !categoriesLoading) {
      setHasLoadedOnce(true);
    }
  }, [productsLoading, categoriesLoading]);

  const loading = !hasLoadedOnce || productsLoading || categoriesLoading;
  const [searchParams] = useSearchParams();

  // Filtering States
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSkinType, setActiveSkinType] = useState('All');
  const [activeConcern, setActiveConcern] = useState('All');
  const [activeBrand, setActiveBrand] = useState('All');

  const query = searchParams.get('q')?.toLowerCase() || '';

  // Infinite Scroll States
  const BATCH_SIZE = 6;
  const [displayLimit, setDisplayLimit] = useState(BATCH_SIZE);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Filter Options (Dynamic)
  const categories = useMemo(() => ['All', ...dynamicCategories
    .filter(c => c.status !== 'Draft')
    .map(c => c.name)], [dynamicCategories]);

  const skinTypes = useMemo(() => {
    const types = new Set<string>();
    products.forEach(p => p.skinTypes?.forEach(t => types.add(t)));
    return ['All', ...Array.from(types).sort()];
  }, [products]);

  const concerns = useMemo(() => {
    const items = new Set<string>();
    products.forEach(p => p.concerns?.forEach(c => items.add(c)));
    return ['All', ...Array.from(items).sort()];
  }, [products]);

  const brands = useMemo(() => {
    const items = new Set<string>();
    products.forEach(p => p.brand && items.add(p.brand));
    return ['All', ...Array.from(items).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSkinType = activeSkinType === 'All' || p.skinTypes?.includes(activeSkinType);
      const matchesConcern = activeConcern === 'All' || p.concerns?.includes(activeConcern);
      const matchesBrand = activeBrand === 'All' || p.brand === activeBrand;
      const isVisible = p.status === 'Active';

      const matchesSearch = !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query));

      return isVisible && matchesCategory && matchesSkinType && matchesConcern && matchesBrand && matchesSearch;
    });
  }, [activeCategory, activeSkinType, activeConcern, activeBrand, query, products]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, displayLimit);
  }, [filteredProducts, displayLimit]);

  // Reset infinite scroll when filters change
  useEffect(() => {
    setDisplayLimit(BATCH_SIZE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategory, activeSkinType, activeConcern, activeBrand, query]);

  const loadMore = useCallback(() => {
    if (displayLimit < filteredProducts.length && !isPageLoading) {
      setIsPageLoading(true);
      // Simulate luxury loading delay
      setTimeout(() => {
        setDisplayLimit(prev => prev + BATCH_SIZE);
        setIsPageLoading(false);
      }, 600);
    }
  }, [displayLimit, filteredProducts.length, isPageLoading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const target = observerTarget.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [loadMore]);

  // Reset category if query changes
  useEffect(() => {
    if (query) {
      setActiveCategory('All');
      setActiveSkinType('All');
      setActiveConcern('All');
      setActiveBrand('All');
    }
  }, [query]);

  const clearAllFilters = () => {
    setActiveCategory('All');
    setActiveSkinType('All');
    setActiveConcern('All');
    setActiveBrand('All');
    if (query) window.history.pushState({}, '', '#/shop');
  };

  const isAnyFilterActive = activeCategory !== 'All' || activeSkinType !== 'All' || activeConcern !== 'All' || activeBrand !== 'All';

  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-16">
        <h1 className="font-display text-5xl md:text-6xl text-secondary dark:text-primary mb-4">
          {query ? `Results for "${query}"` : 'Shop All Products'}
        </h1>
        <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold">
          {filteredProducts.length} Elegant Formulations Available
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-32">
            <div className="flex justify-between items-center mb-8 border-b border-primary/10 pb-4">
              <h3 className="text-xs font-black uppercase tracking-[0.2em]">Filters</h3>
              {isAnyFilterActive && (
                <button
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-gold transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar pr-4">
              {/* Filter sections... (same as before but in a scrollable sticky container) */}
              {[
                { title: 'Category', state: activeCategory, setState: setActiveCategory, options: categories },
                { title: 'Skin Type', state: activeSkinType, setState: setActiveSkinType, options: skinTypes },
                { title: 'Concern', state: activeConcern, setState: setActiveConcern, options: concerns },
                { title: 'Collection', state: activeBrand, setState: setActiveBrand, options: brands }
              ].map(section => (
                <div key={section.title}>
                  <h4 className="text-[10px] uppercase tracking-widest font-black text-secondary/40 dark:text-primary/40 mb-4">{section.title}</h4>
                  <ul className="space-y-2 text-sm">
                    {section.options.map(opt => (
                      <li key={opt}>
                        <button
                          onClick={() => section.setState(opt)}
                          className={`w-full text-left py-1 flex items-center gap-3 transition-all ${section.state === opt ? 'text-primary font-bold' : 'opacity-60 hover:opacity-100'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${section.state === opt ? 'bg-primary' : 'bg-transparent border border-primary/20'}`}></span>
                          {opt}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <ShopSkeleton count={6} />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 opacity-40">
              <span className="material-symbols-outlined text-6xl mb-4 font-light">search_off</span>
              <p className="text-xl font-display italic">We couldn't find any products matching your selection.</p>
              <button
                onClick={clearAllFilters}
                className="mt-6 text-primary font-bold uppercase tracking-widest text-xs border-b border-primary pb-1"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                {visibleProducts.map((product) => {
                  const isOutOfStock = product.variants && product.variants.length > 0
                    ? product.variants.every(v => (v.stock ?? 0) <= 0)
                    : (product.stock ?? 0) <= 0;

                  const isLowStock = !isOutOfStock && (product.variants && product.variants.length > 0
                    ? product.variants.some(v => (v.stock ?? 0) > 0 && (v.stock ?? 0) <= 10)
                    : (product.stock ?? 0) > 0 && (product.stock ?? 0) <= 10);

                  return (
                    <div key={product.id} className="group flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                      <div className={`bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-primary/5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                        {/* Image Area */}
                        <div className="relative aspect-[4/5] overflow-hidden">
                          <Link to={`/product/${product.id}`} className="block h-full">
                            <OptimizedImage
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                              loading="lazy"
                            />
                          </Link>

                          {/* Stock Badges */}
                          {isOutOfStock ? (
                            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-bold z-10 rounded-sm">
                              Out of Stock
                            </div>
                          ) : isLowStock && (
                            <div className="absolute top-4 left-4 bg-amber-500 text-white px-3 py-1 text-[9px] uppercase tracking-widest font-bold z-10 rounded-sm">
                              Limited Quantity
                            </div>
                          )}

                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 pointer-events-none"></div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <WishlistButton product={product} />
                          </div>
                          <div className="absolute bottom-4 left-4 right-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                            <button
                              onClick={() => !isOutOfStock && addToCart(product)}
                              disabled={isOutOfStock}
                              className={`w-full py-3 text-[10px] font-bold uppercase tracking-widest transition-all shadow-2xl rounded-lg ${isOutOfStock
                                ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                                : 'bg-white/90 backdrop-blur-md text-secondary hover:bg-gold hover:text-white'
                                }`}
                            >
                              {isOutOfStock ? 'Sold Out' : 'Quick Add to Ritual'}
                            </button>
                          </div>
                        </div>

                        {/* Info Area (Dark Brown Background) */}
                        <div className="p-6 bg-luxury-brown text-white flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[9px] text-gold uppercase tracking-[0.3em] font-black mb-2 opacity-80">{product.brand}</p>
                            <Link to={`/product/${product.id}`}>
                              <h3 className="font-display text-lg lg:text-xl group-hover:text-gold transition-colors leading-tight mb-3">
                                {product.name}
                              </h3>
                            </Link>
                          </div>
                          <div className="flex justify-between items-end pt-4 border-t border-white/10">
                            <p className="text-gold font-bold tracking-widest">GH₵{product.price.toFixed(2)}</p>
                            <div className="flex gap-1.5 items-center">
                              {product.tags.slice(0, 1).map((tag) => (
                                <span key={tag} className="text-[8px] border border-gold/30 text-gold/70 px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sentinel for infinite scroll */}
              <div ref={observerTarget} className="py-20 flex flex-col items-center justify-center">
                {isPageLoading && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary animate-pulse">Expanding the Collection</p>
                  </div>
                )}
                {!isPageLoading && displayLimit >= filteredProducts.length && filteredProducts.length > 0 && (
                  <div className="text-center opacity-30">
                    <div className="w-12 h-px bg-primary mx-auto mb-4"></div>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold">The Complete Ritual</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

const WishlistButton: React.FC<{ product: any }> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useApp();
  const isFavorited = isInWishlist(product.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist(product);
      }}
      className="p-2 bg-white/90 backdrop-blur rounded-full hover:bg-white text-stone-400 hover:text-red-500 transition-colors shadow-sm"
    >
      <span className={`material-symbols-outlined text-[20px] ${isFavorited ? 'fill-1 text-red-500' : ''}`}>
        favorite
      </span>
    </button>
  );
};

export default Shop;
