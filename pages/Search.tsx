import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import { useProducts } from '../context/ProductContext';
import OptimizedImage from '../components/OptimizedImage';

const Search: React.FC = () => {
  const { addToCart } = useApp();
  const { products } = useProducts();
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
      p.status === 'Active' && (
        p.name.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery) ||
        p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
    );
  }, [query, products]);

  const trendingSearches = ['Vitamin C', 'Serum', 'Night Repair', 'Cleansing Balm'];

  return (
    <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto min-h-screen animate-in fade-in duration-700">
      <div className="max-w-3xl mx-auto text-center mb-20">
        <span className="text-[10px] uppercase tracking-[0.5em] text-primary mb-6 block font-bold">Discover Your Next Ritual</span>
        <div className="relative group">
          <input
            autoFocus
            type="text"
            placeholder="Search products, ingredients, concerns..."
            className="w-full bg-transparent border-b-2 border-stone-200 dark:border-stone-800 text-3xl md:text-5xl font-display py-6 focus:ring-0 focus:border-accent transition-colors placeholder:opacity-20 text-center"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className="absolute right-0 bottom-8 material-symbols-outlined text-3xl md:text-4xl text-accent opacity-20 group-focus-within:opacity-100 transition-opacity">
            search
          </span>
        </div>

        {!query && (
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary/40 mr-2 self-center">Trending:</span>
            {trendingSearches.map(term => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-4 py-2 border border-primary/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:border-accent hover:text-accent transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        )}
      </div>

      {query && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-12 border-b border-primary/5 pb-6">
            <h2 className="font-display text-2xl text-secondary dark:text-primary">
              {filteredProducts.length} Results for "{query}"
            </h2>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-symbols-outlined text-6xl mb-6 font-light opacity-20">inventory_2</span>
              <p className="text-xl font-display italic opacity-60">We couldn't find anything matching your search.</p>
              <button
                onClick={() => setQuery('')}
                className="mt-6 text-primary font-bold uppercase tracking-widest text-xs border-b border-primary pb-1"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col">
                  <div className="relative aspect-[4/5] bg-primary/5 overflow-hidden mb-6">
                    <Link to={`/product/${product.id}`}>
                      <OptimizedImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full transition-transform duration-1000 group-hover:scale-105"
                      />
                    </Link>
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-secondary text-white dark:bg-primary dark:text-background-dark py-3 text-[10px] font-bold uppercase tracking-widest hover:brightness-110 shadow-xl"
                      >
                        Quick Add
                      </button>
                    </div>
                  </div>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-display text-xl mb-1 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-primary text-sm font-bold mb-3">${product.price.toFixed(2)}</p>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold line-clamp-1">{product.category}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
          <div className="bg-primary/5 p-12 rounded-3xl border border-primary/10 group cursor-pointer hover:border-accent transition-colors" onClick={() => setQuery('Serum')}>
            <h4 className="font-display text-3xl mb-4 text-secondary dark:text-primary">Award Winning Serums</h4>
            <p className="text-sm font-light opacity-60 mb-8 leading-relaxed">Our clinical formulations represent the pinnacle of botanical engineering.</p>
            <span className="text-[10px] font-bold uppercase tracking-widest border-b border-accent pb-1">Explore Collections</span>
          </div>
          <div className="bg-stone-900 text-white p-12 rounded-3xl border border-white/5 group cursor-pointer hover:border-accent transition-colors" onClick={() => setQuery('Night')}>
            <h4 className="font-display text-3xl mb-4 text-primary">Night Rituals</h4>
            <p className="text-sm font-light opacity-60 mb-8 leading-relaxed">Deep cell repair while you dream of radiant tomorrows.</p>
            <span className="text-[10px] font-bold uppercase tracking-widest border-b border-accent pb-1">Browse Elixirs</span>
          </div>
        </div>
      )}
    </main>
  );
};

export default Search;
