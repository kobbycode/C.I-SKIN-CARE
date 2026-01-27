
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePaystackPayment } from 'react-paystack';
import { useApp } from '../App';
import { useOrders } from '../context/OrderContext';
import { useNotification } from '../context/NotificationContext';

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  landmark?: string;
  deliveryInstructions?: string;
}

const Checkout: React.FC = () => {
  const { cart, clearCart } = useApp();
  const { addOrder } = useOrders();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<'paystack' | 'mtn_momo' | 'telecel_cash' | 'airteltigo_money' | 'pay_on_delivery'>('paystack');
  const paymentImages = {
    telecel_cash: (import.meta.env.VITE_IMG_TELECEL_CASH as string) || '/assets/telecel-cash.jpeg',
    airteltigo_money: (import.meta.env.VITE_IMG_AIRTELTIGO_MONEY as string) || '/assets/airteltigo-money.png',
    mtn_momo: (import.meta.env.VITE_IMG_MTN_MOMO as string) || '/assets/mtn-momo.png',
    pay_on_delivery: (import.meta.env.VITE_IMG_POD as string) || '/assets/cash-on-delivery.jpg'
  };
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    landmark: '',
    deliveryInstructions: ''
  });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal >= 200 ? 0 : 15.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Paystack configuration
  const paystackConfig = {
    reference: `CI-${new Date().getTime()}`,
    email: formData.email,
    amount: Math.round(total * 100), // Convert to pesewas (smallest currency unit)
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_', // Add your Paystack public key
    channels: selectedPayment === 'paystack' ? ['card', 'bank_transfer', 'mobile_money'] : ['mobile_money'],
    metadata: {
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: `${formData.firstName} ${formData.lastName}`
        },
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: formData.phone
        },
        {
          display_name: "Preferred Payment",
          variable_name: "preferred_payment",
          value: selectedPayment
        }
      ]
    }
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const onPaymentSuccess = async (reference: any) => {
    const orderSummary = {
      customerName: `${formData.firstName} ${formData.lastName}`,
      customerEmail: formData.email,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending' as const,
      total,
      items: [...cart],
      shippingAddress: `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
      paymentMethod:
        selectedPayment === 'mtn_momo'
          ? 'MTN MoMo via Paystack'
          : selectedPayment === 'telecel_cash'
          ? 'Telecel Cash via Paystack'
          : selectedPayment === 'airteltigo_money'
          ? 'AirtelTigo Money via Paystack'
          : 'Paystack'
    };

    try {
      const orderId = await addOrder(orderSummary);
      showNotification('Order placed successfully!', 'success');
      clearCart();
      navigate('/order-confirmation', { state: { orderSummary: { ...orderSummary, id: orderId } } });
    } catch (error) {
      console.error(error);
      showNotification('Failed to record order. Please contact support.', 'error');
    }
  };

  const onPaymentClose = () => {
    setIsProcessing(false);
    alert('Payment was cancelled. You can try again when ready.');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.lastName) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedPayment === 'pay_on_delivery') {
      (async () => {
        try {
          setIsProcessing(true);
          const orderSummary = {
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerEmail: formData.email,
            date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: 'Pending' as const,
            total,
            items: [...cart],
            shippingAddress: `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
            paymentMethod: 'Pay on Delivery'
          };
          const orderId = await addOrder(orderSummary);
          showNotification('Order placed. Pay on delivery selected.', 'success');
          clearCart();
          navigate('/order-confirmation', { state: { orderSummary: { ...orderSummary, id: orderId } } });
        } catch (error) {
          console.error(error);
          showNotification('Failed to record order. Please contact support.', 'error');
        } finally {
          setIsProcessing(false);
        }
      })();
      return;
    }

    setIsProcessing(true);

    // Initialize Paystack payment
    initializePayment({
      onSuccess: onPaymentSuccess,
      onClose: onPaymentClose
    });
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
        <nav className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.3em]">
          <span className={step >= 1 ? "text-primary cursor-pointer" : "opacity-40"}>Information</span>
          <span className="material-icons text-[12px] opacity-40">chevron_right</span>
          <span className={step >= 2 ? "text-primary cursor-pointer" : "opacity-40"}>Shipping</span>
          <span className="material-icons text-[12px] opacity-40">chevron_right</span>
          <span className={step >= 3 ? "text-primary" : "opacity-40"}>Payment</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left: Form */}
        <div className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-12">

            {/* Step 1: Information */}
            {step === 1 && (
              <div className="animate-in slide-in-from-right duration-500">
                {/* Contact Information */}
                <section className="mb-10">
                  <div className="flex justify-between items-baseline mb-6 border-b border-primary/10 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Contact Information</h3>
                    <Link to="/profile" className="text-[10px] font-bold text-primary">Already have an account?</Link>
                  </div>
                  <div className="space-y-4">
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address for Order Updates"
                      className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                    />
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number (e.g. +233 XX XXX XXXX)"
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
                    <input
                      required
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="First Name"
                      className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                    />
                    <input
                      required
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                      className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                    />
                    <input
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Address"
                      className="w-full md:col-span-2 bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                    />
                    <input
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      placeholder="Apartment, suite, etc. (optional)"
                      className="w-full md:col-span-2 bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                    />
                    <input
                      required
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        required
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="Region"
                        className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                      />
                      <input
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="Postal Code"
                        className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                      />
                    </div>
                  </div>
                </section>

                <div className="pt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.email && formData.firstName && formData.lastName && formData.address && formData.city && formData.state) {
                        setStep(2);
                        window.scrollTo(0, 0);
                      } else {
                        alert('Please fill in all required fields.');
                      }
                    }}
                    className="bg-primary text-white py-4 px-8 rounded font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    Continue to Shipping
                    <span className="material-icons text-[12px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Shipping Method */}
            {step === 2 && (
              <div className="animate-in slide-in-from-right duration-500">
                {/* Summary of Step 1 */}
                <div className="border border-primary/10 rounded-lg p-4 mb-8 text-[11px] space-y-2">
                  <div className="flex justify-between border-b border-primary/5 pb-2">
                    <span className="opacity-60">Contact</span>
                    <span className="font-medium text-right">{formData.email}</span>
                    <button type="button" onClick={() => setStep(1)} className="text-primary font-bold hover:underline">Change</button>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="opacity-60">Ship to</span>
                    <span className="font-medium text-right truncate max-w-[200px]">{formData.address}, {formData.city}, {formData.state} {formData.zipCode}</span>
                    <button type="button" onClick={() => setStep(1)} className="text-primary font-bold hover:underline">Change</button>
                  </div>
                </div>

                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 border-b border-primary/10 pb-2">Shipping Method</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border border-accent rounded bg-accent/5 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" checked={shipping === 0} onChange={() => { }} className="text-accent focus:ring-accent" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest">Luxury Ground Shipping</p>
                          <p className="text-[10px] opacity-60">3-5 Business Days</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold uppercase">{shipping === 0 ? 'FREE' : `GH₵${shipping.toFixed(2)}`}</span>
                    </label>
                    <label className="flex items-center justify-between p-4 border border-primary/10 rounded hover:bg-primary/5 cursor-pointer opacity-50">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="shipping" disabled checked={false} className="text-accent focus:ring-accent" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest">Concierge Express</p>
                          <p className="text-[10px] opacity-60">Next Business Day (Coming Soon)</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold uppercase">GH₵35.00</span>
                    </label>
                  </div>
                </section>

                <div className="pt-8 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 hover:opacity-70"
                  >
                    <span className="material-icons text-[12px]">arrow_back</span>
                    Return to Information
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(3);
                      window.scrollTo(0, 0);
                    }}
                    className="bg-primary text-white py-4 px-8 rounded font-bold uppercase tracking-[0.2em] text-[10px] shadow-lg hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    Continue to Payment
                    <span className="material-icons text-[12px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="animate-in slide-in-from-right duration-500">
                <section className="mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 border-b border-primary/10 pb-2">Select Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedPayment('mtn_momo')}
                      className={`p-4 rounded-lg border transition-all text-left ${selectedPayment === 'mtn_momo' ? 'border-accent bg-accent/5' : 'border-primary/10 hover:bg-primary/5'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={paymentImages.mtn_momo}
                            alt="MTN MoMo"
                            className="w-12 h-12 object-contain rounded bg-white dark:bg-stone-800 border border-primary/10 p-1"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.jpg'; }}
                          />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">MTN MoMo</span>
                        </div>
                        <span className="px-2 py-1 text-[9px] rounded bg-yellow-400 text-black font-bold uppercase shrink-0">MoMo</span>
                      </div>
                      <p className="text-[10px] mt-2 opacity-70">Pay with MTN Mobile Money. Redirects securely via Paystack.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPayment('telecel_cash')}
                      className={`p-4 rounded-lg border transition-all text-left ${selectedPayment === 'telecel_cash' ? 'border-accent bg-accent/5' : 'border-primary/10 hover:bg-primary/5'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={paymentImages.telecel_cash}
                            alt="Telecel Cash"
                            className="w-12 h-12 object-contain rounded bg-white dark:bg-stone-800 border border-primary/10 p-1"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.jpg'; }}
                          />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">Telecel Cash</span>
                        </div>
                        <span className="px-2 py-1 text-[9px] rounded bg-red-500 text-white font-bold uppercase shrink-0">Cash</span>
                      </div>
                      <p className="text-[10px] mt-2 opacity-70">Pay with Telecel/Vodafone Cash. Redirects securely via Paystack.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPayment('airteltigo_money')}
                      className={`p-4 rounded-lg border transition-all text-left ${selectedPayment === 'airteltigo_money' ? 'border-accent bg-accent/5' : 'border-primary/10 hover:bg-primary/5'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={paymentImages.airteltigo_money}
                            alt="AirtelTigo Money"
                            className="w-12 h-12 object-contain rounded bg-white dark:bg-stone-800 border border-primary/10 p-1"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.jpg'; }}
                          />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">AirtelTigo Money</span>
                        </div>
                        <span className="px-2 py-1 text-[9px] rounded bg-blue-500 text-white font-bold uppercase shrink-0">MoMo</span>
                      </div>
                      <p className="text-[10px] mt-2 opacity-70">Pay with AirtelTigo Money. Redirects securely via Paystack.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPayment('pay_on_delivery')}
                      className={`p-4 rounded-lg border transition-all text-left ${selectedPayment === 'pay_on_delivery' ? 'border-accent bg-accent/5' : 'border-primary/10 hover:bg-primary/5'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={paymentImages.pay_on_delivery}
                            alt="Cash on Delivery"
                            className="w-12 h-12 object-contain rounded bg-white dark:bg-stone-800 border border-primary/10 p-1"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo.jpg'; }}
                          />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">Cash On Delivery</span>
                        </div>
                        <span className="px-2 py-1 text-[9px] rounded bg-stone-900 text-white font-bold uppercase shrink-0">POD</span>
                      </div>
                      <p className="text-[10px] mt-2 opacity-70">Place order and pay when your items arrive.</p>
                    </button>
                  </div>
                </section>
                {/* Summary of Step 1 & 2 */}
                <div className="border border-primary/10 rounded-lg p-4 mb-8 text-[11px] space-y-2">
                  <div className="flex justify-between border-b border-primary/5 pb-2">
                    <span className="opacity-60">Contact</span>
                    <span className="font-medium text-right">{formData.email}</span>
                    <button type="button" onClick={() => setStep(1)} className="text-primary font-bold hover:underline">Change</button>
                  </div>
                  <div className="flex justify-between border-b border-primary/5 pb-2 pt-1">
                    <span className="opacity-60">Phone</span>
                    <span className="font-medium text-right">{formData.phone}</span>
                    <button type="button" onClick={() => setStep(1)} className="text-primary font-bold hover:underline">Change</button>
                  </div>
                  <div className="flex justify-between border-b border-primary/5 pb-2 pt-1">
                    <span className="opacity-60">Ship to</span>
                    <span className="font-medium text-right truncate max-w-[200px]">{formData.address}, {formData.city}, {formData.state} {formData.zipCode}</span>
                    <button type="button" onClick={() => setStep(1)} className="text-primary font-bold hover:underline">Change</button>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="opacity-60">Method</span>
                    <span className="font-medium text-right">{shipping === 0 ? 'Luxury Ground Shipping (Free)' : 'Concierge Express'}</span>
                    <button type="button" onClick={() => setStep(2)} className="text-primary font-bold hover:underline">Change</button>
                  </div>
                </div>

                {/* Payment with Paystack */}
                <section>
                  <div className="flex justify-between items-center mb-6 border-b border-primary/10 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                      {selectedPayment === 'pay_on_delivery' ? 'Pay on Delivery' : 'Secure Payment via Paystack'}
                    </h3>
                    <div className="flex gap-2">
                      <img src="/assets/paystack-logo.png" alt="Paystack" className="h-6" />
                    </div>
                  </div>
                  {selectedPayment === 'pay_on_delivery' ? (
                    <div className="p-6 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="flex items-start gap-3 mb-2">
                        <span className="material-symbols-outlined text-primary">local_shipping</span>
                        <div>
                          <p className="text-sm font-bold mb-1">Pay on Delivery</p>
                          <p className="text-xs opacity-70">We will process your order and you can pay when your items arrive.</p>
                        </div>
                      </div>
                      <p className="text-[10px] opacity-70">Cash or mobile money accepted upon delivery.</p>
                    </div>
                  ) : (
                    <div className="p-6 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="material-symbols-outlined text-primary">lock</span>
                        <div>
                          <p className="text-sm font-bold mb-1">Secure Payment Processing</p>
                          <p className="text-xs opacity-70">You'll be redirected to Paystack's secure payment page to complete your purchase. Choose card, bank transfer, or mobile money.</p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-white dark:bg-stone-800 rounded text-[9px] font-bold uppercase">Visa</span>
                        <span className="px-3 py-1 bg-white dark:bg-stone-800 rounded text-[9px] font-bold uppercase">Mastercard</span>
                        <span className="px-3 py-1 bg-white dark:bg-stone-800 rounded text-[9px] font-bold uppercase">MTN Mobile Money</span>
                        <span className="px-3 py-1 bg-white dark:bg-stone-800 rounded text-[9px] font-bold uppercase">AirtelTigo Money</span>
                        <span className="px-3 py-1 bg-white dark:bg-stone-800 rounded text-[9px] font-bold uppercase">Telecel Cash</span>
                      </div>
                      {selectedPayment !== 'paystack' && (
                        <p className="text-[10px] mt-3 opacity-70">On Paystack, select Mobile Money and choose your network.</p>
                      )}
                    </div>
                  )}
                </section>
                <section className="pt-6 border-t border-primary/10">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4">Delivery Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      name="landmark"
                      value={formData.landmark || ''}
                      onChange={handleInputChange}
                      placeholder="Nearby landmark (optional)"
                      className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                    />
                    <input
                      name="deliveryInstructions"
                      value={formData.deliveryInstructions || ''}
                      onChange={handleInputChange}
                      placeholder="Delivery instructions (e.g., gate code, floor)"
                      className="w-full bg-primary/5 border-primary/10 focus:ring-1 focus:ring-accent rounded px-4 py-4 placeholder:text-stone-400 placeholder:text-xs text-stone-800 dark:text-stone-200"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        const query = `${formData.address}, ${formData.city}, ${formData.state}`;
                        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                        window.open(url, '_blank');
                      }}
                      className="bg-primary text-white py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[12px]">map</span>
                      Track Location
                    </button>
                  </div>
                </section>

                <div className="pt-8 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 hover:opacity-70"
                  >
                    <span className="material-icons text-[12px]">arrow_back</span>
                    Return to Shipping
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="bg-gold-gradient text-white py-5 px-10 rounded font-bold uppercase tracking-[0.3em] text-xs shadow-2xl hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        {selectedPayment === 'pay_on_delivery' ? 'Place Order (Pay on Delivery)' : `Pay GH₵${total.toFixed(2)}`}
                      </>
                    )}
                  </button>
                </div>
                {selectedPayment !== 'pay_on_delivery' && (
                  <p className="text-center mt-4 text-[9px] font-bold uppercase tracking-[0.2em] opacity-40">
                    <span className="material-icons text-[12px] align-middle mr-1">verified_user</span>
                    Secured by Paystack • 256-bit SSL Encryption
                  </p>
                )}
              </div>
            )}
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
                <span>GH₵{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium uppercase tracking-widest">
                <span className="opacity-60">Shipping</span>
                <span className="text-primary">{shipping === 0 ? 'FREE' : `GH₵${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-xs font-medium uppercase tracking-widest">
                <span className="opacity-60">Estimated Taxes</span>
                <span>GH₵{tax.toFixed(2)}</span>
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
