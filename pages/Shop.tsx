
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../App';
import { MOCK_PRODUCTS } from '../constants';

const Shop: React.FC = () => {
  const { addToCart } = useApp();
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

  // Filter Options
  const categories = ['All', 'Cleansers', 'Serums & Elixirs', 'Moisturizers', 'Treatments', 'Body Care', 'Bundles & Sets'];
  const skinTypes = ['All', 'All Skin Types', 'Dry & Dehydrated', 'Oily & Acne-Prone', 'Mature Skin', 'Sensitive', 'Sensitive Skins'];
  const concerns = ['All', 'Aging', 'Dullness', 'Dehydration', 'Dryness', 'Dark Circles', 'Fine Lines', 'Dark Spots', 'Uneven Tone', 'Redness', 'Facial Burns'];
  const brands = ['All', 'BEL ECLAT', 'Gluta Master', '5D Gluta', 'C.I Skin Care', 'SPA Rituals', 'Pomegranate Line', 'Bismid Cosmetics'];

  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSkinType = activeSkinType === 'All' || p.skinTypes?.includes(activeSkinType);
      const matchesConcern = activeConcern === 'All' || p.concerns?.includes(activeConcern);
      const matchesBrand = activeBrand === 'All' || p.brand === activeBrand;

      const matchesSearch = !query ||
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query));

      return matchesCategory && matchesSkinType && matchesConcern && matchesBrand && matchesSearch;
    });
  }, [activeCategory, activeSkinType, activeConcern, activeBrand, query]);

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
          {filteredProducts.length === 0 ? (
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
                {visibleProducts.map((product) => (
                  <div key={product.id} className="group flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
                    <div className="bg-white dark:bg-stone-900 rounded-2xl overflow-hidden border border-primary/5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
                      {/* Image Area */}
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <Link to={`/product/${product.id}`} className="block h-full">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                          />
                        </Link>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 pointer-events-none"></div>
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full bg-white/90 backdrop-blur-md text-secondary py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all shadow-2xl rounded-lg"
                          >
                            Quick Add to Ritual
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
                ))}
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

export default Shop;
