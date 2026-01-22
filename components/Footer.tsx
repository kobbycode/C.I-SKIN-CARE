
import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';

const Footer: React.FC = () => {
  const { toggleDarkMode, isDarkMode } = useApp();

  return (
    <footer className="bg-secondary text-white py-24 px-6 border-t border-primary/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 mb-20 px-2 lg:px-0">
          {/* Brand Col */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-8">
              <img
                alt="C.I SKIN CARE Logo"
                className="h-10 w-auto"
                src="/logo.jpg"
              />
              <span className="font-display text-xl tracking-[0.2em] font-medium text-primary">C.I SKIN CARE</span>
            </Link>
            <p className="text-secondary-foreground/60 text-xs font-light leading-relaxed mb-10 max-w-sm">
              Crafting premium skincare solutions that merge scientific precision with the healing essence of botanical wisdom. Born in Ghana, refined for the world.
            </p>
            <div className="flex gap-4">
              {['facebook', 'photo_camera', 'alternate_email'].map(icon => (
                <button key={icon} className="w-10 h-10 border border-primary/20 rounded-full flex items-center justify-center text-primary/60 hover:border-primary hover:text-primary transition-all duration-500 transform hover:-translate-y-1">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">The Collection</h4>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-primary/40">
                <li className="hover:text-primary transition-colors cursor-pointer"><Link to="/shop">Shop All</Link></li>
                <li className="hover:text-primary transition-colors cursor-pointer"><Link to="/shop?q=Cleansers">Cleansers</Link></li>
                <li className="hover:text-primary transition-colors cursor-pointer"><Link to="/shop?q=Serums">Serums</Link></li>
                <li className="hover:text-primary transition-colors cursor-pointer"><Link to="/loyalty">Loyalty Ritual</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">The Brand</h4>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-primary/40">
                <li className="hover:text-primary transition-colors cursor-pointer"><Link to="/story">Our Story</Link></li>
                <li className="hover:text-primary transition-colors cursor-pointer"><Link to="/journal">Skin Journal</Link></li>
                <li className="hover:text-primary transition-colors cursor-pointer"><Link to="/contact">Contact</Link></li>
                <li className="hover:text-primary transition-colors cursor-pointer"><Link to="/faq">Skin Quiz</Link></li>
              </ul>
            </div>
            <div className="hidden sm:block">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Concierge</h4>
              <ul className="space-y-4 text-[11px] font-bold uppercase tracking-widest text-primary/40 text-left">
                <li className="hover:text-primary transition-colors cursor-pointer text-left"><Link to="/faq">Shipping</Link></li>
                <li className="hover:text-primary transition-colors cursor-pointer text-left"><Link to="/faq">Returns</Link></li>
                <li className="hover:text-primary transition-colors cursor-pointer text-left"><Link to="/faq">Privacy</Link></li>
                <li className="hover:text-primary transition-colors cursor-pointer text-left"><Link to="/faq">FAQ</Link></li>
              </ul>
            </div>
          </div>

          {/* Newsletter Col */}
          <div className="col-span-1 lg:col-span-1">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8">Le Cercle</h4>
            <p className="text-[11px] font-light text-primary/60 italic mb-8 leading-relaxed">
              Join our inner circle for botanical wisdom and private collection reveals.
            </p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-4 text-[10px] font-bold tracking-widest focus:outline-none focus:border-primary transition-colors"
                readOnly
              />
              <button className="w-full bg-primary text-secondary py-4 rounded-lg text-[10px] font-black uppercase tracking-[0.4em] hover:brightness-110 shadow-lg transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center text-[9px] tracking-[0.2em] uppercase text-primary/30">
          <p>© 2026 C.I SKIN CARE. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/faq" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/faq" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
