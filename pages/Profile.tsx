import { useApp } from '../App';
import LoyaltyPortal from '../components/LoyaltyPortal';
import { AccountSecurityEditor, NotificationPreferences } from '../components/ProfileComponents';
import { useUser } from '../context/UserContext';
import React, { useEffect, useState, useRef } from 'react';
import { useOrders } from '../context/OrderContext';
import { useNotification } from '../context/NotificationContext';
import { useProducts } from '../context/ProductContext';
import { Link, useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/Admin/ConfirmModal';

const Profile: React.FC = () => {
  const { toggleDarkMode, isDarkMode, wishlist, toggleWishlist } = useApp();
  const { currentUser, loading: userLoading, logout, updateProfile, deleteAccount } = useUser();
  const { orders, loading: ordersLoading } = useOrders();
  const { products } = useProducts();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'skin' | 'favorites' | 'addresses' | 'preferences' | 'account'>('orders');
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [jumpLoading, setJumpLoading] = useState(false);
  const ordersSectionRef = useRef<HTMLDivElement | null>(null);
  const skinSectionRef = useRef<HTMLDivElement | null>(null);
  const favoritesSectionRef = useRef<HTMLDivElement | null>(null);
  const addressesSectionRef = useRef<HTMLDivElement | null>(null);
  const preferencesSectionRef = useRef<HTMLDivElement | null>(null);
  const accountSectionRef = useRef<HTMLDivElement | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const loading = userLoading || ordersLoading;

  const userOrders = orders.filter(o => o.customerEmail === currentUser?.email);
  useEffect(() => {
    const sectionMap: Record<typeof activeTab, React.RefObject<HTMLDivElement>> = {
      orders: ordersSectionRef,
      skin: skinSectionRef,
      favorites: favoritesSectionRef,
      addresses: addressesSectionRef,
      preferences: preferencesSectionRef,
      account: accountSectionRef
    };
    const target = sectionMap[activeTab]?.current;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="pt-40 text-center uppercase tracking-widest opacity-30 font-display">
        Opening Personal Archives...
      </div>
    );
  }
  if (!currentUser) {
    return (
      <main className="pt-40 pb-24 px-10 min-h-screen">
        <div className="max-w-[900px] mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-accent mb-6 mx-auto flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-accent font-light">person</span>
          </div>
          <h1 className="font-display text-3xl mb-4">Welcome</h1>
          <p className="text-xs opacity-60 mb-8">Please register or login to view and manage your profile.</p>
          <div className="flex items-center justify-center gap-4">
            <a href="/register" className="bg-primary text-white py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px]">Register</a>
            <a href="/login" className="border border-primary/20 py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px]">Login</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-40 pb-24 px-10 bg-background-light dark:bg-background-dark min-h-screen">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 space-y-12">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-accent mb-6 flex items-center justify-center overflow-hidden">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                  }}
                />
              ) : (
                <span className="material-symbols-outlined text-5xl text-accent font-light">account_circle</span>
              )}
              {/* Fallback icon that shows if image fails (hidden by default if avatar exists) */}
              {currentUser.avatar && (
                <span className="material-symbols-outlined text-5xl text-accent font-light fallback-icon hidden">account_circle</span>
              )}
            </div>
            <h1 className="font-display text-2xl text-secondary dark:text-white mb-1">{currentUser.fullName}</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold">{currentUser.statusLabel}</p>
          </div>

          <nav className="space-y-6">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-secondary/30 dark:text-primary/30 border-b border-primary/10 pb-2">Account Rituals</h5>
            <ul className="space-y-4 text-xs font-medium uppercase tracking-[0.2em] text-secondary/70 dark:text-primary/70">
              <li onClick={() => setActiveTab('orders')} className={`cursor-pointer flex items-center gap-3 ${activeTab === 'orders' ? 'text-accent' : 'hover:text-accent transition-colors'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'orders' ? 'bg-accent' : 'bg-transparent'}`}></span>
                My Orders
              </li>
              <li onClick={() => setActiveTab('skin')} className={`cursor-pointer transition-colors flex items-center gap-3 ${activeTab === 'skin' ? 'text-accent' : 'hover:text-accent'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'skin' ? 'bg-accent' : 'bg-transparent'}`}></span>
                Skin Profile
              </li>
              <li onClick={() => setActiveTab('favorites')} className={`cursor-pointer transition-colors flex items-center gap-3 ${activeTab === 'favorites' ? 'text-accent' : 'hover:text-accent'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'favorites' ? 'bg-accent' : 'bg-transparent'}`}></span>
                Favorites
              </li>
              <li onClick={() => setActiveTab('addresses')} className={`cursor-pointer transition-colors flex items-center gap-3 ${activeTab === 'addresses' ? 'text-accent' : 'hover:text-accent'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'addresses' ? 'bg-accent' : 'bg-transparent'}`}></span>
                Addresses
              </li>
              <li onClick={() => setActiveTab('preferences')} className={`cursor-pointer transition-colors flex items-center gap-3 ${activeTab === 'preferences' ? 'text-accent' : 'hover:text-accent'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'preferences' ? 'bg-accent' : 'bg-transparent'}`}></span>
                Preferences
              </li>
              <li onClick={() => setActiveTab('account')} className={`cursor-pointer transition-colors flex items-center gap-3 ${activeTab === 'account' ? 'text-accent' : 'hover:text-accent'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'account' ? 'bg-accent' : 'bg-transparent'}`}></span>
                Account & Security
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
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className={`mt-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] ${signOutLoading ? 'text-stone-300' : 'text-red-400 hover:text-red-500'} transition-colors`}>
              <span className="material-symbols-outlined text-sm">logout</span>
              Sign Out
            </button>
          </div>
        </aside>

        <ConfirmModal
          isOpen={isLogoutModalOpen}
          title="Confirm Sign Out"
          message="Are you sure you want to sign out of your account?"
          confirmLabel="Sign Out"
          cancelLabel="Stay Signed In"
          variant="danger"
          onConfirm={async () => {
            try {
              setSignOutLoading(true);
              await logout();
              showNotification('Signed out', 'success');
              navigate('/login');
            } catch {
              showNotification('Failed to sign out', 'error');
            } finally {
              setSignOutLoading(false);
              setIsLogoutModalOpen(false);
            }
          }}
          onCancel={() => setIsLogoutModalOpen(false)}
        />

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          title="Delete Account?"
          message="This action cannot be undone. All your data, orders, and preferences will be permanently deleted."
          confirmLabel="Delete Forever"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={async () => {
            try {
              await deleteAccount();
              showNotification('Account deleted', 'success');
              navigate('/login');
            } catch (e: any) {
              showNotification(e?.message || 'Failed to delete account', 'error');
            } finally {
              setIsDeleteModalOpen(false);
            }
          }}
          onCancel={() => setIsDeleteModalOpen(false)}
        />

        {/* Content Area */}
        <section className="lg:col-span-9 space-y-16">

          {/* Loyalty Portal */}
          <LoyaltyPortal />

          {activeTab === 'orders' && (
            <div ref={ordersSectionRef} className="pt-8">
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
                  <Link to={`/order/${order.id}`} key={order.id} className="bg-white dark:bg-stone-900 border border-primary/5 p-8 rounded-xl flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-accent/20 transition-all block">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="w-16 h-16 bg-primary/5 rounded flex items-center justify-center">
                        <span className="material-symbols-outlined text-accent text-3xl font-light">package_2</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm tracking-widest uppercase mb-1">{order.id.slice(0, 8).toUpperCase()}</h4>
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
                  </Link>
                )) : (
                  <div className="p-12 text-center opacity-30 italic uppercase tracking-widest border border-dashed border-primary/10 rounded-2xl">
                    No rituals ordered yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div ref={addressesSectionRef} className="bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="font-display text-2xl text-secondary dark:text-white">Delivery Details</h2>
                  <p className="text-xs opacity-60">Manage your preferred delivery information.</p>
                </div>
              </div>
              <DeliveryDetailsEditor />
            </div>
          )}

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
              <button
                disabled={jumpLoading}
                onClick={() => {
                  setJumpLoading(true);
                  setActiveTab('skin');
                  setTimeout(() => setJumpLoading(false), 800);
                }}
                className={`px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/10 transition-all ${jumpLoading ? 'bg-stone-200 text-stone-500' : 'bg-white dark:bg-stone-800 text-secondary dark:text-primary hover:bg-primary hover:text-white'}`}
              >
                {jumpLoading ? 'Loading...' : 'Update Profile'}
              </button>
            </div>
          </div>

          {/* Recommended for You */}
          <div>
            <h2 className="font-display text-2xl text-secondary dark:text-white mb-8">Personalized for {currentUser.fullName.split(' ')[0]}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {(currentUser.skinType && currentUser.skinType !== 'Unknown'
                ? products.filter(p => p.skinTypes?.includes(currentUser.skinType)).slice(0, 2)
                : products.filter(p => p.tags.includes('Best Seller')).slice(0, 2)
              ).map(product => (
                <Link to={`/product/${product.id}`} key={product.id} className="flex gap-6 items-center p-6 bg-white dark:bg-stone-950 border border-primary/5 rounded-2xl group hover:shadow-xl transition-all cursor-pointer block">
                  <div className="w-24 h-24 rounded-lg bg-primary/5 overflow-hidden shrink-0">
                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg mb-1">{product.name}</h4>
                    <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-2">GH₵{product.price.toFixed(2)}</p>
                    <span className="text-[9px] uppercase tracking-widest opacity-40 font-bold border-b border-primary/20 pb-0.5">
                      {product.skinTypes?.join(', ') || 'All Skin Types'}
                    </span>
                  </div>
                </Link>
              ))}
              {products.length === 0 && (
                <div className="col-span-2 text-center text-xs opacity-50 italic">Loading recommendations...</div>
              )}
            </div>
          </div>
          {activeTab === 'skin' && <div ref={skinSectionRef}><SkinProfileEditor /></div>}
          {activeTab === 'favorites' && (
            <div ref={favoritesSectionRef} className="bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="font-display text-2xl text-secondary dark:text-white">Favorites</h2>
                  <p className="text-xs opacity-60">Your curated selections.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {wishlist.length > 0 ? wishlist.map(p => (
                  <div key={p.id} className="flex gap-6 items-center p-6 bg-primary/5 border border-primary/10 rounded-2xl">
                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-white">
                      <img src={p.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-base mb-1 truncate">{p.name}</h4>
                      <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-2">GH₵{p.price.toFixed(2)}</p>
                      <div className="flex gap-3">
                        <Link to={`/product/${p.id}`} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-accent border-b border-primary/20 pb-0.5">View</Link>
                        <button onClick={() => toggleWishlist(p)} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-500">Remove</button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center opacity-30 italic uppercase tracking-widest border border-dashed border-primary/10 rounded-2xl">
                    No favorites yet.
                  </div>
                )}
              </div>
            </div>
          )}
          {activeTab === 'preferences' && (
            <div ref={preferencesSectionRef} className="bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="font-display text-2xl text-secondary dark:text-white">Preferences</h2>
                  <p className="text-xs opacity-60">Tailor your experience.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Interface Theme</p>
                    <p className="text-[10px] opacity-60">Switch between Luminous and Nocturnal modes.</p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className="px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary text-white hover:bg-accent transition-colors"
                  >
                    {isDarkMode ? 'Switch to Luminous' : 'Switch to Nocturnal'}
                  </button>
                </div>
                <NotificationPreferences />
                <div className="border-t border-primary/10 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-red-600">Delete Account</p>
                      <p className="text-[10px] opacity-60">Permanently remove your account and all data.</p>
                    </div>
                    <button
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'account' && <div ref={accountSectionRef}><AccountSecurityEditor /></div>}
        </section>
      </div>
    </main>
  );
};

export default Profile;

const SkinProfileEditor: React.FC = () => {
  const { currentUser, updateProfile } = useUser();
  const { showNotification } = useNotification();
  const [form, setForm] = useState({
    skinType: 'Unknown',
    skinTypeDetail: '',
    focusRitual: 'None',
    focusRitualDetail: ''
  });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (currentUser) {
      setForm({
        skinType: currentUser.skinType || 'Unknown',
        skinTypeDetail: currentUser.skinTypeDetail || '',
        focusRitual: currentUser.focusRitual || 'None',
        focusRitualDetail: currentUser.focusRitualDetail || ''
      });
    }
  }, [currentUser]);
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const save = async () => {
    try {
      setSaving(true);
      await updateProfile(form);
      showNotification('Skin profile updated', 'success');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="bg-white dark:bg-stone-900 border border-primary/10 p-8 rounded-2xl">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-display text-2xl text-secondary dark:text-white">Skin Profile</h2>
          <p className="text-xs opacity-60">Refine your skin type and ritual focus.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Skin Type</span>
          <select
            name="skinType"
            value={form.skinType}
            onChange={onChange}
            className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent"
          >
            <option>Unknown</option>
            <option>Oily</option>
            <option>Dry</option>
            <option>Combination</option>
            <option>Sensitive</option>
          </select>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Focus Ritual</span>
          <select
            name="focusRitual"
            value={form.focusRitual}
            onChange={onChange}
            className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent"
          >
            <option>None</option>
            <option>Hydration</option>
            <option>Brightening</option>
            <option>Anti-Aging</option>
            <option>Acne Care</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Skin Type Detail</span>
          <textarea
            name="skinTypeDetail"
            value={form.skinTypeDetail}
            onChange={onChange}
            placeholder="Describe your skin behavior, triggers, routines..."
            className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent h-24"
          />
        </div>
        <div className="md:col-span-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary block mb-2">Focus Ritual Detail</span>
          <textarea
            name="focusRitualDetail"
            value={form.focusRitualDetail}
            onChange={onChange}
            placeholder="Share goals and observations for your focus ritual..."
            className="w-full bg-primary/5 border-primary/10 rounded px-4 py-3 text-[10px] uppercase font-bold tracking-widest focus:ring-accent h-24"
          />
        </div>
      </div>
      <div className="pt-4">
        <button
          disabled={saving}
          onClick={save}
          className={`py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px] ${saving ? 'bg-stone-300 text-white' : 'bg-accent text-white hover:bg-[#e19c00]'}`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
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
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

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
    try {
      setSaving(true);
      await updateProfile(form);
      showNotification('Profile updated successfully!', 'success');
    } finally {
      setSaving(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser.', 'error');
      setLocating(false);
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
      setLocating(false);
    }, (error) => {
      console.error('Geolocation error:', error);
      showNotification('Unable to fetch your location. Please check permissions.', 'error');
      setLocating(false);
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
          disabled={locating}
          onClick={handleUseCurrentLocation}
          className={`text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 ${locating ? 'text-stone-300' : 'text-primary hover:text-accent'}`}
        >
          <span className="material-symbols-outlined text-[14px]">{locating ? 'progress_activity' : 'my_location'}</span>
          {locating ? 'Locating...' : 'Use Current Location'}
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
          disabled={saving}
          onClick={save}
          className={`py-3 px-6 rounded font-bold uppercase tracking-[0.2em] text-[10px] ${saving ? 'bg-stone-300 text-white' : 'bg-accent text-white hover:bg-[#e19c00]'}`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
