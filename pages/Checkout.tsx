
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const Checkout: React.FC = () => {
  const { cart, clearCart } = useApp();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 200 ? 0 : 15.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate luxury processing delay
    setTimeout(() => {
      const orderSummary = {
        orderId: `CI-${Math.floor(100000 + Math.random() * 900000)}`,
        items: [...cart],
        subtotal,
        shipping,
        tax,
        total,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      };

      setIsProcessing(false);
      clearCart();
      navigate('/order-confirmation', { state: { orderSummary } });
    }, 2500);
  };

  if (cart.length === 0) {
    return (
      <main className="pt-48 pb-24 text-center min-h-[60vh]">
        <h2 className="font-display text-3xl mb-4">Your bag is empty</h2>
        <Link to="/shop" className="text-primary font-bold underline">Discover Rituals</Link>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col items-center">
        <h1 className="font-display text-4xl md:text-5xl text-secondary dark:text-white mb-4 uppercase tracking-[0.2em]">Checkout</h1>
        <nav className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
          <span className="text-primary">Information</span>
          <span className="material-icons text-[12px]">chevron_right</span>
          <span>Shipping</span>
          <span className="material-icons text-[12px]">chevron_right</span>
          <span>Payment</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-12">

            {/* Contact Information */}
            <section>
              <div className="flex justify-between items-baseline mb-6 border-b border-primary/10 pb-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Contact Information</h3>
                <Link to="/profile" className="text-[10px] font-bold text-primary">Already have an account?</Link>
              </div>
              <div className="space-y-4">
                <input
                  required
                  type="email"
                  placeholder="Email Address for Order Updates"
                  className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                />
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="rounded text-primary focus:ring-accent w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100">Keep me updated on exclusive rituals and previews</span>
                </label>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 border-b border-primary/10 pb-2">Shipping Ritual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="First Name" className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200" />
                <input required placeholder="Last Name" className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200" />
                <input required placeholder="Address" className="w-full md:col-span-2 bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200" />
                <input placeholder="Apartment, suite, etc. (optional)" className="w-full md:col-span-2 bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200" />
                <input required placeholder="City" className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200" />
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="State" className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200" />
                  <input required placeholder="ZIP Code" className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200" />
                </div>
              </div>
            </section>

            {/* Shipping Method */}
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 border-b border-primary/10 pb-2">Shipping Method</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border border-accent rounded bg-accent/5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" defaultChecked className="text-accent focus:ring-accent" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest">Luxury Ground Shipping</p>
                      <p className="text-[10px] opacity-60">3-5 Business Days</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase">{shipping === 0 ? 'FREE' : `GH₵${shipping.toFixed(2)}`}</span>
                </label>
                <label className="flex items-center justify-between p-4 border border-primary/10 rounded hover:bg-primary/5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" className="text-accent focus:ring-accent" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest">Concierge Express</p>
                      <p className="text-[10px] opacity-60">Next Business Day</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase">GH₵35.00</span>
                </label>
              </div>
            </section>

            {/* Payment Information */}
            <section>
              <div className="flex justify-between items-center mb-6 border-b border-primary/10 pb-2">
                <h3 className="text-xs font-black uppercase tracking-[0.2em]">Secure Payment</h3>
                <div className="flex gap-2 opacity-40 grayscale">
                  <span className="material-icons text-xl">payments</span>
                  <span className="material-icons text-xl">credit_card</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <input required placeholder="Card Number" className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200" />
                  <span className="absolute right-4 top-4 material-symbols-outlined opacity-30">lock</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required placeholder="Expiry (MM/YY)" className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200" />
                  <input required placeholder="CVC" className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200" />
                </div>
              </div>
            </section>

            <div className="pt-8">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gold-gradient text-white py-5 rounded font-bold uppercase tracking-[0.3em] text-xs shadow-2xl hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Finalizing Ritual...
                  </>
                ) : (
                  <>
                    Complete Order • GH₵{total.toFixed(2)}
                  </>
                )}
              </button>
              <p className="text-center mt-4 text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">
                <span className="material-icons text-[12px] align-middle mr-1">verified_user</span>
                Encrypted & Secure Transaction guaranteed by CI concierge
              </p>
            </div>
          </form>
        </div>

        {/* Right: Summary */}
        <aside className="lg:col-span-5 lg:sticky lg:top-32">
          <div className="bg-primary/5 rounded-2xl border border-primary/10 p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8">Order Summary</h3>
            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-white dark:bg-stone-800 rounded-lg overflow-hidden shrink-0 border border-primary/5 relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider line-clamp-1">{item.name}</h4>
                    <p className="text-[9px] opacity-60 uppercase tracking-widest mt-1">{item.category}</p>
                    <p className="text-xs font-bold mt-2 text-primary">GH₵{item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-primary/10 text-stone-800 dark:text-stone-200">
              <div className="flex justify-between text-xs font-medium uppercase tracking-widest">
                <span className="opacity-60">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium uppercase tracking-widest">
                <span className="opacity-60">Shipping</span>
                <span className="text-primary">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-xs font-medium uppercase tracking-widest">
                <span className="opacity-60">Estimated Taxes</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="pt-6 mt-3 border-t border-primary/20 flex justify-between items-center">
                <span className="text-sm font-black uppercase tracking-[0.2em]">Total Ritual</span>
                <span className="text-2xl font-display font-bold text-primary">GH₵{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="mt-8 flex gap-3">
              <input
                placeholder="Ritual Code"
                className="flex-1 bg-white dark:bg-stone-800 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent text-stone-800 dark:text-stone-200"
              />
              <button className="px-6 border border-primary/20 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors">
                Apply
              </button>
            </div>
          </div>

          {/* Social Proof/Assurance */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-primary/5 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-primary mb-2">verified</span>
              <p className="text-[9px] font-black uppercase tracking-widest">Guaranteed Radiance</p>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-primary/5 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-primary mb-2">support_agent</span>
              <p className="text-[9px] font-black uppercase tracking-widest">Skincare Concierge</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;
