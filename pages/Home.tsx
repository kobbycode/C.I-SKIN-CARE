import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserGallery from '../components/UserGallery';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useProducts } from '../context/ProductContext';
import OptimizedImage from '../components/OptimizedImage';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_PRODUCTS } from '../constants';

const Home: React.FC = () => {
  const { siteConfig } = useSiteConfig();
  const { products, loading } = useProducts();
  const [email, setEmail] = React.useState('');
  const [isSubscribing, setIsSubscribing] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [activeTestimonial, setActiveTestimonial] = React.useState(0);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const heroProducts = useMemo(() => {
    const active = products.filter(p => p.status === 'Active' || !p.status);
    // Always provide something to cycle through. If no products yet (or loading), use mocks.
    if (active.length === 0) {
      return MOCK_PRODUCTS;
    }
    return active;
  }, [products]);

  useEffect(() => {
    if (heroProducts.length <= 1) return;

    const interval = setInterval(() => {
      setActiveHeroIndex(prev => (prev + 1) % heroProducts.length);
    }, 6000); // Change hero slide every 6 seconds

    return () => clearInterval(interval);
  }, [heroProducts.length]);

  React.useEffect(() => {
    if (!siteConfig.testimonials || siteConfig.testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % siteConfig.testimonials.length);
    }, 7000); // Change slide every 7 seconds

    return () => clearInterval(interval);
  }, [siteConfig.testimonials]);

  const dynamicSeasonSub = React.useMemo(() => {
    const m = new Date().getMonth();
    const y = new Date().getFullYear();
    const season =
      m === 11 || m === 0 || m === 1
        ? 'Winter'
        : m >= 2 && m <= 4
          ? 'Spring'
          : m >= 5 && m <= 7
            ? 'Summer'
            : 'Autumn';
    return `${season} Collection ${y}`;
  }, []);

  const isSectionActive = (name: string) => {
    const section = siteConfig.homeSections.find(s => s.name === name);
    return section ? section.active : true;
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setIsSubscribed(true);
      setEmail('');
    }, 1500);
  };

  const nextHero = () => {
    if (heroProducts.length === 0) return;
    setActiveHeroIndex(prev => (prev + 1) % heroProducts.length);
  };
  const prevHero = () => {
    if (heroProducts.length === 0) return;
    setActiveHeroIndex(prev => (prev - 1 + heroProducts.length) % heroProducts.length);
  };

  return (
    <div className="overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Hero Section - Product Carousel */}
      <header className="relative h-[85vh] lg:h-screen overflow-hidden group bg-stone-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroProducts[activeHeroIndex]?.id || 'initial'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-stone-900 flex items-center justify-center">
              <OptimizedImage
                src={heroProducts[activeHeroIndex]?.image || "https://lh3.googleusercontent.com/aida-public/AB6AXuAboFWaO4tGfvMQ6x8YVJhB4MsX9dAZvyVpImJ-E-HQ5E0T6G3kprf7DBc12UgFaVPuHeEOkebv_0CJBJ_wQ4VbOtkKjBYLJ_dF_vQOsq9jMlTOLcKsMyexRCotCfntLS2pyoB4LRlymwjKRwEg4dgR7SJCdOC_JztikGLdytoTpzKHG-0hClG3QDNBaSwD3QxxksB6ZJ4NhHGCpAdfx3Y2ICUr635Lbhmi0u3gMw2mEeFkH8-ZukAvPyJRQjCEZgE6nmgU6H2u__Y"}
                alt={heroProducts[activeHeroIndex]?.name || "Luxury Skincare"}
                className="w-full h-full object-contain"
                loading="eager"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            <div className="relative max-w-7xl mx-auto h-full flex flex-col justify-end items-start px-4 sm:px-6 lg:px-8 pb-20 lg:pb-32">
              <div className="max-w-2xl text-white">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-[9px] uppercase tracking-[0.6em] font-black text-white/50 mb-8 italic"
                >
                  {heroProducts[activeHeroIndex]?.name}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="grid grid-cols-2 md:flex items-center gap-3 md:gap-4 w-full md:w-auto"
                >
                  <Link to={heroProducts[activeHeroIndex] ? `/product/${heroProducts[activeHeroIndex].id}` : "/shop"} className="bg-white text-primary px-4 md:px-6 py-3.5 md:py-4 text-[10px] md:text-sm font-semibold tracking-widest uppercase hover:bg-gold hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 shimmer-btn whitespace-nowrap flex items-center justify-center">
                    View Product
                  </Link>
                  <a href="tel:0244737093" className="bg-gold text-white px-4 md:px-6 py-3.5 md:py-4 text-[10px] md:text-sm font-semibold tracking-widest uppercase hover:bg-black transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shimmer-btn shadow-lg whitespace-nowrap">
                    <span className="material-icons-outlined text-xs md:text-sm">call</span>
                    Call to Order
                  </a>
                  <Link to="/shop" className="col-span-2 md:col-span-1 border border-white text-white px-4 md:px-6 py-3.5 md:py-4 text-[10px] md:text-sm font-semibold tracking-widest uppercase hover:bg-white/10 transition-all duration-300 shimmer-btn whitespace-nowrap flex items-center justify-center">
                    Shop Collection
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Controls */}
        {heroProducts.length > 1 && (
          <>
            <button
              onClick={prevHero}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 z-20"
              aria-label="Previous slide"
            >
              <span className="material-icons-outlined">chevron_left</span>
            </button>
            <button
              onClick={nextHero}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 z-20"
              aria-label="Next slide"
            >
              <span className="material-icons-outlined">chevron_right</span>
            </button>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
              {heroProducts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveHeroIndex(i)}
                  className={`h-1 transition-all duration-500 rounded-full ${i === activeHeroIndex ? 'w-12 bg-gold' : 'w-4 bg-white/40 hover:bg-white/60'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </header>

      {/* The Collections Section */}
      {isSectionActive('Featured Products Grid') && (
        <section className="py-24 bg-white dark:bg-stone-900 reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl mb-4 text-stone-800 dark:text-stone-100 uppercase tracking-luxury">Shop Categories</h2>
              <div className="w-20 h-1 bg-gold mx-auto mb-6"></div>
              <p className="text-stone-500 dark:text-stone-400 max-w-xl mx-auto italic">Explore our products by category.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Cleanse & Prep',
                  img: '/products/spa-gels.jpg'
                },
                {
                  title: 'Target & Treat',
                  img: '/products/5d-gluta-miracle.jpg'
                },
                {
                  title: 'Hydrate & Glow',
                  img: '/products/bel-eclat-hero.jpg'
                }
              ].map((col, i) => (
                <div key={i} className="group cursor-pointer hero-zoom">
                  <div className="relative h-[500px] overflow-hidden">
                    <OptimizedImage src={col.img} alt={col.title} className="w-full h-full transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
                    <div className="absolute bottom-10 left-10 text-white">
                      <h3 className="font-display text-2xl mb-2">{col.title}</h3>
                      <Link to="/shop" className="text-xs tracking-widest uppercase border-b border-white pb-1 block w-max hover:text-gold hover:border-gold transition-colors">
                        Shop Collection
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Philosophy Section */}
      {isSectionActive('Philosophy Quote') && (
        <section className="py-24 bg-background-light dark:bg-background-dark reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                <OptimizedImage
                  src="/products/bel-eclat-tumericSet.jpg"
                  alt="Laboratory bottles and plants"
                  className="shadow-2xl grayscale-[20%] w-full rounded-2xl"
                />
              </div>
              <div className="lg:w-1/2">
                <h2 className="font-display text-3xl md:text-4xl mb-8 leading-tight tracking-luxury">
                  {siteConfig.philosophy?.title || "The Philosophy of"} <br />
                  <span className="gold-gradient italic">C.I SKIN CARE</span>
                </h2>
                <p className="text-stone-600 dark:text-stone-400 mb-10 leading-relaxed">
                  {siteConfig.philosophy?.content || "We believe that luxury should never compromise integrity."}
                </p>
                <div className="space-y-8">
                  {[
                    { icon: 'eco', title: 'Botanically Sourced', desc: 'Harnessing the power of organic ingredients from around the world.' },
                    { icon: 'science', title: 'Scientifically Proven', desc: 'Dermatologist tested and approved for all skin types, including sensitive skin.' },
                    { icon: 'cruelty_free', title: 'Ethically Crafted', desc: '100% Cruelty-free and sustainably packaged for a better planet.' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start">
                      <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-full mr-4">
                        <span className="material-icons-outlined text-primary">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1 tracking-wide">{item.title}</h4>
                        <p className="text-sm text-stone-500 dark:text-stone-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Community Gallery */}
      {isSectionActive('Instagram Feed') && (
        <UserGallery />
      )}

      {/* Testimonial Section */}
      {siteConfig.testimonials && siteConfig.testimonials.length > 0 && (
        <section className="py-24 bg-stone-100 dark:bg-stone-800/50 overflow-hidden reveal">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <span className="material-icons-outlined text-gold text-5xl mb-6">format_quote</span>
            <div className="relative min-h-[300px]">
              {siteConfig.testimonials.map((t, i) => (
                <div
                  key={i}
                  className={`transition-all duration-1000 absolute inset-0 flex flex-col items-center justify-center ${i === activeTestimonial ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'}`}
                >
                  <p className="text-2xl md:text-3xl font-display leading-snug mb-8 italic">
                    "{t.quote}"
                  </p>
                  <div className="flex flex-col items-center">
                    <img
                      alt={t.author}
                      className="w-16 h-16 rounded-full object-cover mb-4 border-2 border-gold/20 p-0.5"
                      src={t.image || "/assets/customer-portrait.png"}
                    />
                    <p className="font-semibold tracking-widest uppercase text-xs">{t.author} — Verified Buyer</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-3 mt-12">
              {siteConfig.testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === activeTestimonial ? 'bg-gold scale-125' : 'bg-stone-300 dark:bg-stone-600 hover:bg-stone-400'}`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-24 relative overflow-hidden bg-primary dark:bg-stone-900 reveal">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img
            alt="Logo Watermark"
            className="w-full h-full object-contain scale-150"
            src="/logo.jpg"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl mb-6">Subscribe to our Newsletter</h2>
          <p className="text-stone-100 mb-10 opacity-80">
            Subscribe to receive exclusive beauty rituals, early access to new launches, and a 15% welcome gift on your first order.
          </p>

          {isSubscribed ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-xl animate-in fade-in zoom-in duration-500 max-w-lg mx-auto">
              <span className="material-symbols-outlined text-4xl mb-2">mark_email_read</span>
              <h3 className="font-display text-2xl mb-2">Welcome!</h3>
              <p className="text-sm opacity-80">Check your inbox for your welcome gift.</p>
              <button
                onClick={() => setIsSubscribed(false)}
                className="mt-6 text-[10px] font-bold uppercase tracking-widest border-b border-white/40 pb-1 hover:text-gold hover:border-gold transition-all"
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto" onSubmit={handleSubscribe}>
              <input
                className="flex-grow bg-white/10 border border-white/20 text-white placeholder:text-white/60 px-6 py-4 focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold disabled:opacity-50"
                placeholder="Your Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing}
                required
              />
              <button
                className="bg-gold hover:bg-white hover:text-primary px-8 py-4 font-semibold tracking-widest uppercase transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] flex justify-center items-center"
                type="submit"
                disabled={isSubscribing}
              >
                {isSubscribing ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : 'Subscribe'}
              </button>
            </form>
          )}

          {!isSubscribed && (
            <p className="mt-6 text-[10px] uppercase tracking-widest opacity-60">By subscribing, you agree to our privacy policy.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
