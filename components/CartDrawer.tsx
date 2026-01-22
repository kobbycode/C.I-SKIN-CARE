
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setCartOpen, removeFromCart, updateQuantity } = useApp();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 200;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md h-full bg-background-light dark:bg-background-dark shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="px-6 py-5 border-b border-primary/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-secondary dark:text-primary">Your Ritual Bag</h2>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
              {cart.length} Items Selected
            </p>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-primary/10 rounded-full transition-colors"
          >
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        {/* Shipping Tracker */}
        <div className="px-6 py-6 bg-primary/5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold">Free Shipping Tracker</p>
            {remainingForFreeShipping > 0 ? (
              <p className="text-primary text-xs font-bold">GH₵{remainingForFreeShipping.toFixed(2)} more for free shipping</p>
            ) : (
              <p className="text-green-600 text-xs font-bold uppercase tracking-wider">Unlocked Free Luxury Shipping</p>
            )}
          </div>
          <div className="h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar text-stone-800 dark:text-stone-200">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <span className="material-symbols-outlined text-6xl mb-4">shopping_bag</span>
              <p className="text-lg">Your bag is currently empty.</p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-4 text-primary font-bold uppercase tracking-widest text-xs border-b border-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-24 h-24 bg-primary/5 rounded-lg overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-secondary dark:text-primary">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="material-icons-outlined text-xs text-secondary/40 hover:text-red-500 transition-colors"
                        >
                          delete
                        </button>
                      </div>
                      <p className="text-[10px] text-secondary/60 dark:text-primary/60 mt-0.5 uppercase tracking-wider">
                        {item.category}
                      </p>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3 px-3 py-1 bg-primary/5 rounded-full">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="text-xs font-bold w-4 hover:text-primary"
                        >-</button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="text-xs font-bold w-4 hover:text-primary"
                        >+</button>
                      </div>
                      <p className="text-sm font-bold text-secondary dark:text-primary">
                        GH₵{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white dark:bg-background-dark border-t border-primary/10">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Subtotal</span>
              <span className="font-bold">GH₵{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Estimated Shipping</span>
              <span className="font-bold text-primary">{subtotal >= freeShippingThreshold ? 'FREE' : 'GH₵15.00'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-60">Estimated Tax (8%)</span>
              <span className="font-bold">GH₵{(subtotal * 0.08).toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-primary/5 flex justify-between items-center">
              <span className="text-lg font-display font-bold">Total</span>
              <span className="text-xl font-bold text-primary">
                GH₵{(subtotal + (subtotal >= freeShippingThreshold ? 0 : 15) + (subtotal * 0.08)).toFixed(2)}
              </span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-gold-gradient text-white py-4 rounded font-bold uppercase tracking-widest text-xs hover:brightness-110 shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Secure Checkout
            <span className="material-icons-outlined text-sm">arrow_forward</span>
          </button>
          <p className="text-[10px] text-center mt-4 opacity-40 uppercase tracking-widest font-bold">
            <span className="material-icons-outlined text-[12px] align-middle mr-1">lock</span>
            Encrypted & Secure Payments
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
