
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { useSiteConfig } from '../context/SiteConfigContext';

const Header: React.FC = () => {
  const { siteConfig } = useSiteConfig();
  const { cart, setCartOpen } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = siteConfig.navLinks;

  return (
    <>
      <nav className="fixed w-full z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-5 flex justify-between items-center">

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center material-symbols-outlined text-secondary dark:text-primary text-[28px] font-light hover:text-accent transition-colors"
          >
            menu
          </button>

          <Link to="/" className="flex items-center gap-2 md:gap-4 ml-2 lg:ml-0">
            <img
              alt="C.I SKIN CARE Logo"
              className="h-8 md:h-10 w-auto"
              src="/logo.jpg"
            />
            <span className="font-display text-sm md:text-xl font-medium tracking-[0.15em] text-secondary dark:text-primary whitespace-nowrap">C.I SKIN CARE</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex space-x-12 text-[10px] uppercase tracking-[0.25em] font-medium text-secondary/70 dark:text-primary/70">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `hover:text-primary transition-colors ${isActive ? 'text-primary underline decoration-2 underline-offset-4' : ''}`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <Link
              to="/search"
              className="material-symbols-outlined text-secondary dark:text-primary text-[22px] font-light hover:text-accent transition-colors"
            >
              search
            </Link>
            <Link to="/profile" className="hidden sm:block material-symbols-outlined text-secondary dark:text-primary text-[22px] font-light hover:text-accent transition-colors">
              person
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="material-symbols-outlined text-secondary dark:text-primary text-[22px] font-light relative hover:text-accent transition-colors"
            >
              shopping_bag
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-full max-w-xs h-full bg-background-light dark:bg-background-dark shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center">
              <span className="font-display text-lg tracking-widest text-primary">MENU</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="material-symbols-outlined text-2xl font-light hover:text-accent"
              >
                close
              </button>
            </div>

            <nav className="flex-1 p-8 space-y-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-sm uppercase tracking-[0.3em] font-medium text-secondary/80 dark:text-primary/80 hover:text-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-stone-200 dark:bg-stone-800 my-8" />
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] font-medium text-secondary/80 dark:text-primary/80 hover:text-accent transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] font-light">person</span>
                My Profile
              </Link>
              <Link
                to="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] font-medium text-secondary/80 dark:text-primary/80 hover:text-accent transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] font-light">search</span>
                Search
              </Link>
            </nav>

            <div className="p-8 border-t border-stone-200 dark:border-stone-800">
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary mb-4">The Ritual Continues</p>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-secondary/40">auto_awesome</span>
                <span className="material-symbols-outlined text-secondary/40">water_drop</span>
                <span className="material-symbols-outlined text-secondary/40">flare</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
