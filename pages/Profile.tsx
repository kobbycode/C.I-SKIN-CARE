import { useApp } from '../App';
import LoyaltyPortal from '../components/LoyaltyPortal';
import { useUser } from '../context/UserContext';
import React, { useEffect, useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { useNotification } from '../context/NotificationContext';

const Profile: React.FC = () => {
  const { toggleDarkMode, isDarkMode } = useApp();
  const { currentUser, loading: userLoading } = useUser();
  const { orders, loading: ordersLoading } = useOrders();

  const loading = userLoading || ordersLoading;

  const userOrders = orders.filter(o => o.customerEmail === currentUser?.email);

  if (loading || !currentUser) return (
    <div className="pt-40 text-center uppercase tracking-widest opacity-30 font-display">
      Opening Personal Archives...
    </div>
  );

  return (
    <main className="pt-40 pb-24 px-10 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-12">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-accent mb-6 flex items-center justify-center overflow-hidden">
              <span className="material-symbols-outlined text-5xl text-accent font-light">account_circle</span>
            </div>
            <h1 className="font-display text-2xl text-secondary dark:text-white mb-1">{currentUser.fullName}</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">{currentUser.statusLabel}</p>
          </div>

          <nav className="space-y-6">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary/30 dark:text-primary/30 border-b border-primary/10 pb-2">Account Rituals</h5>
            <ul className="space-y-4 text-xs font-medium uppercase tracking-[0.2em] text-secondary/70 dark:text-primary/70">
              <li className="text-accent cursor-pointer flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                My Orders
              </li>
              <li className="hover:text-accent cursor-pointer transition-colors flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
                Skin Profile
              </li>
              <li className="hover:text-accent cursor-pointer transition-colors flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
                Favorites
              </li>
              <li className="hover:text-accent cursor-pointer transition-colors flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
                Addresses
              </li>
              <li className="hover:text-accent cursor-pointer transition-colors flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-transparent"></span>
                Preferences
              </li>
            </ul>
          </nav>

          <div className="pt-10">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/40 hover:text-accent transition-colors"
            >
              <span className="material-symbols-outlined text-sm">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
              Toggle Interface: {isDarkMode ? 'Luminous' : 'Nocturnal'}
            </button>
            <button className="mt-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 hover:text-red-500 transition-colors">
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <section className="lg:col-span-9 space-y-16">

          {/* Loyalty Portal */}
          <LoyaltyPortal />

          {/* Recent Orders */}
          <div className="pt-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="font-display text-3xl text-secondary dark:text-white mb-2">My Orders</h2>
                <p className="text-xs font-light opacity-60">Tracking your journey to radiance.</p>
              </div>
              <button className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-primary/20 pb-1 hover:text-accent transition-colors">
                View All History
              </button>
            </div>

            <div className="space-y-6">
              {userOrders.length > 0 ? userOrders.map(order => (
                <div key={order.id} className="bg-white dark:bg-stone-900 border border-primary/5 p-8 rounded-xl flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-accent/20 transition-all">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-16 h-16 bg-primary/5 rounded flex items-center justify-center">
                      <span className="material-symbols-outlined text-accent text-3xl font-light">package_2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-widest uppercase mb-1">{order.id.slice(-6).toUpperCase()}</h4>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">{order.date} • {order.items.length} Items</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end">
                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full mb-2 ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                      }`}>
                      {order.status}
                    </span>
                    <p className="font-display text-xl text-secondary dark:text-white">GH₵{order.total.toFixed(2)}</p>
                  </div>
                  <button className="material-symbols-outlined text-stone-300 hover:text-accent transition-colors">chevron_right</button>
                </div>
              )) : (
                <div className="p-12 text-center opacity-30 italic uppercase tracking-widest border border-dashed border-primary/10 rounded-2xl">
                  No rituals ordered yet.
                </div>
              )}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="font-display text-2xl text-secondary dark:text-white">Delivery Details</h2>
                <p className="text-xs opacity-60">Manage your preferred delivery information.</p>
              </div>
            </div>
            <DeliveryDetailsEditor />
          </div>

          {/* Skin Profile Highlights */}
          <div className="bg-primary/5 border border-primary/10 p-12 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4 block">Skin Type</span>
              <h3 className="font-display text-2xl text-secondary dark:text-white">{currentUser.skinType}</h3>
              <p className="text-xs opacity-50 mt-2">{currentUser.skinTypeDetail}</p>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-4 block">Focus Ritual</span>
              <h3 className="font-display text-2xl text-secondary dark:text-white">{currentUser.focusRitual}</h3>
              <p className="text-xs opacity-50 mt-2">{currentUser.focusRitualDetail}</p>
            </div>
            <div className="text-center md:flex md:items-center md:justify-end">
              <button className="bg-white dark:bg-stone-800 text-secondary dark:text-primary px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/10 hover:bg-primary hover:text-white transition-all">
                Update Profile
              </button>
            </div>
          </div>

          {/* Recommended for You */}
          <div>
            <h2 className="font-display text-2xl text-secondary dark:text-white mb-8">Personalized for {currentUser.fullName.split(' ')[0]}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex gap-6 items-center p-6 bg-white dark:bg-stone-950 border border-primary/5 rounded-2xl group hover:shadow-xl transition-all cursor-pointer">
                <div className="w-24 h-24 rounded-lg bg-primary/5 overflow-hidden shrink-0">
                  <img src="/products/gluta-master-set.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h4 className="font-display text-lg mb-1">Gluta Master Set</h4>
                  <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-2">GH₵280.00</p>
                  <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold border-b border-primary/20 pb-0.5">Perfect for Mid-day Hydration</span>
                </div>
              </div>
              <div className="flex gap-6 items-center p-6 bg-white dark:bg-stone-950 border border-primary/5 rounded-2xl group hover:shadow-xl transition-all cursor-pointer">
                <div className="w-24 h-24 rounded-lg bg-primary/5 overflow-hidden shrink-0">
                  <img src="/products/5d-gluta-diamond-box.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div>
                  <h4 className="font-display text-lg mb-1">Diamond Facial Ritual</h4>
                  <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-2">GH₵92.00</p>
                  <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold border-b border-primary/20 pb-0.5">Targets Early Fatigue</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Profile;

const DeliveryDetailsEditor: React.FC = () => {
  const { currentUser, updateProfile } = useUser();
  const { showNotification } = useNotification();
  const [form, setForm] = useState({
    deliveryAddress: '',
    deliveryCity: '',
    deliveryState: '',
    deliveryZipCode: '',
    deliveryPhone: '',
    deliveryLandmark: '',
    deliveryInstructions: '',
    deliveryLocationLat: 0,
    deliveryLocationLng: 0
  });

  useEffect(() => {
    if (currentUser) {
      setForm({
        deliveryAddress: currentUser.deliveryAddress || '',
        deliveryCity: currentUser.deliveryCity || '',
        deliveryState: currentUser.deliveryState || '',
        deliveryZipCode: currentUser.deliveryZipCode || '',
        deliveryPhone: currentUser.deliveryPhone || '',
        deliveryLandmark: currentUser.deliveryLandmark || '',
        deliveryInstructions: currentUser.deliveryInstructions || '',
        deliveryLocationLat: currentUser.deliveryLocationLat || 0,
        deliveryLocationLng: currentUser.deliveryLocationLng || 0
      });
    }
  }, [currentUser]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const save = async () => {
    await updateProfile(form);
    showNotification('Profile updated successfully!', 'success');
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      // Update coordinates
      setForm(prev => ({
        ...prev,
        deliveryLocationLat: latitude,
        deliveryLocationLng: longitude
      }));

      try {
        // Reverse geocoding to find landmark/address
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        if (data && data.display_name) {
          setForm(prev => ({
            ...prev,
            deliveryLandmark: data.display_name,
            // Optionally update other fields if they are empty
            deliveryCity: prev.deliveryCity || data.address?.city || data.address?.town || data.address?.village || '',
            deliveryState: prev.deliveryState || data.address?.state || data.address?.region || '',
            deliveryZipCode: prev.deliveryZipCode || data.address?.postcode || ''
          }));
          showNotification('Location captured • Landmark filled', 'success');
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        showNotification('Location captured, but failed to find address details.', 'success');
      }
    }, (error) => {
      console.error('Geolocation error:', error);
      showNotification('Unable to fetch your location. Please check permissions.', 'error');
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleUseCurrentLocation}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-accent flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[14px]">my_location</span>
          Use Current Location
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="deliveryAddress"
          value={form.deliveryAddress}
          onChange={onChange}
          placeholder="Address"
          className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent"
        />
        <input
          name="deliveryPhone"
          value={form.deliveryPhone}
          onChange={onChange}
          placeholder="Phone"
          className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent"
        />
        <input
          name="deliveryCity"
          value={form.deliveryCity}
          onChange={onChange}
          placeholder="City"
          className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent"
        />
        <input
          name="deliveryState"
          value={form.deliveryState}
          onChange={onChange}
          placeholder="Region"
          className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent"
        />
        <input
          name="deliveryZipCode"
          value={form.deliveryZipCode}
          onChange={onChange}
          placeholder="Postal Code"
          className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent"
        />
        <input
          name="deliveryLandmark"
          value={form.deliveryLandmark}
          onChange={onChange}
          placeholder="Nearby Landmark"
          className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent"
        />
        <input
          name="deliveryInstructions"
          value={form.deliveryInstructions}
          onChange={onChange}
          placeholder="Delivery Instructions"
          className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent md:col-span-2"
        />
      </div>
      <div className="pt-2">
        <button
          onClick={save}
          className="bg-accent text-white py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px]"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
