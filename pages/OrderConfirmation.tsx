
import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CartItem } from '../types';

interface OrderSummary {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  date: string;
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const summary = location.state?.orderSummary as OrderSummary;

  if (!summary) {
    return <Navigate to="/shop" replace />;
  }

  return (
    <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Hero Success Section */}
      <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-accent/30">
          <span className="material-symbols-outlined text-4xl text-accent fill-1">check_circle</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-secondary dark:text-white mb-4 uppercase tracking-[0.2em]">Ritual Confirmed</h1>
        <p className="text-stone-500 dark:text-stone-400 font-light text-sm tracking-widest uppercase">
          Order {summary.orderId} • {summary.date}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Ritual Selection (Items) */}
        <div className="lg:col-span-7 space-y-12">
          <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-primary/5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 border-b border-primary/10 pb-4">Your Ritual Selection</h3>
            <div className="space-y-6">
              {summary.items.map((item) => (
                <div key={item.id} className="flex gap-6 items-center">
                  <div className="w-24 h-24 bg-stone-50 dark:bg-stone-800 rounded-lg overflow-hidden shrink-0 border border-primary/5">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-secondary dark:text-white mb-1">{item.name}</h4>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest mb-2">{item.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold opacity-60 uppercase">Quantity: {item.quantity}</span>
                      <span className="text-xs font-bold text-primary">GH₵{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6">What Happens Next</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary">mail</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Ritual Log Sent</p>
                  <p className="text-[11px] font-light opacity-60 leading-relaxed">A detailed confirmation and receipt have been sent to your inbox.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-primary">local_shipping</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Concierge Preparation</p>
                  <p className="text-[11px] font-light opacity-60 leading-relaxed">Our specialists are preparing your selection for safe transit.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Summary & Actions */}
        <aside className="lg:col-span-5 space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-primary/5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8">Financial Summary</h3>
            <div className="space-y-4 text-xs font-medium uppercase tracking-widest">
              <div className="flex justify-between">
                <span className="opacity-40">Subtotal</span>
                <span>GH₵{summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-40">Shipping</span>
                <span>{summary.shipping === 0 ? 'FREE' : `GH₵${summary.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-40">Taxes</span>
                <span>GH₵{summary.tax.toFixed(2)}</span>
              </div>
              <div className="pt-6 mt-4 border-t border-primary/10 flex justify-between items-center">
                <span className="font-black text-sm">Total Value</span>
                <span className="text-2xl font-display font-bold text-primary">GH₵{summary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              to="/shop"
              className="block w-full text-center bg-primary text-white py-4 rounded font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg hover:brightness-110 transition-all"
            >
              Continue Exploring Rituals
            </Link>
            <Link
              to="/profile"
              className="block w-full text-center border border-primary/20 text-primary py-4 rounded font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-primary/5 transition-all"
            >
              View Order in Profile
            </Link>
          </div>

          <div className="text-center p-6 border border-dashed border-primary/20 rounded-2xl">
            <span className="material-symbols-outlined text-accent mb-2">stars</span>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Member Privilege</p>
            <p className="text-[11px] font-light opacity-60 leading-relaxed">
              You've earned 185 points from this ritual. Explore rewards in your profile.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default OrderConfirmation;
