
import React, { useState, createContext, useContext, useEffect, lazy, Suspense } from 'react';
import { AppSkeleton } from './components/Skeletons';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CartItem, Product, ProductVariant } from './types';
import Header from './components/Header';
import FloatingCart from './components/FloatingCart';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProductProvider } from './context/ProductContext';
import { ReviewProvider } from './context/ReviewContext';
import { OrderProvider } from './context/OrderContext';
import { JournalProvider } from './context/JournalContext';
import { FAQProvider } from './context/FAQContext';
import { CategoryProvider } from './context/CategoryContext';
import { UserProvider } from './context/UserContext';
import AdminRoute from './components/Admin/AdminRoute';
import { InAppNotificationProvider } from './context/InAppNotificationContext';

// Helper for retrying lazy loads (fixes chunk loading errors after new deployments)
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      console.error("Chunk load failed, retrying page...", error);
      window.location.reload();
      return { default: () => null };
    }
  });

// Lazy load pages
const Home = lazyWithRetry(() => import('./pages/Home'));
const Shop = lazyWithRetry(() => import('./pages/Shop'));
const Search = lazyWithRetry(() => import('./pages/Search'));
const ProductDetail = lazyWithRetry(() => import('./pages/ProductDetail'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const Reviews = lazyWithRetry(() => import('./pages/Reviews'));
const FAQ = lazyWithRetry(() => import('./pages/FAQ'));
const Profile = lazyWithRetry(() => import('./pages/Profile'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Register = lazyWithRetry(() => import('./pages/Register'));
const Checkout = lazyWithRetry(() => import('./pages/Checkout'));
const OrderConfirmation = lazyWithRetry(() => import('./pages/OrderConfirmation'));
const OrderDetail = lazyWithRetry(() => import('./pages/OrderDetail'));
const Story = lazyWithRetry(() => import('./pages/Story'));
const Journal = lazyWithRetry(() => import('./pages/Journal'));
const JournalDetail = lazyWithRetry(() => import('./pages/JournalDetail'));
const Loyalty = lazyWithRetry(() => import('./pages/Loyalty'));
const SkinQuiz = lazyWithRetry(() => import('./pages/SkinQuiz'));
const SkinQuizResults = lazyWithRetry(() => import('./pages/SkinQuizResults'));
const RitualGuide = lazyWithRetry(() => import('./pages/RitualGuide'));
const Dashboard = lazyWithRetry(() => import('./pages/Admin/Dashboard'));
const Inventory = lazyWithRetry(() => import('./pages/Admin/Inventory'));
const Customers = lazyWithRetry(() => import('./pages/Admin/Customers'));
const Orders = lazyWithRetry(() => import('./pages/Admin/Orders'));
const CMSSettings = lazyWithRetry(() => import('./pages/Admin/CMSSettings'));
const AdminReviews = lazyWithRetry(() => import('./pages/Admin/Reviews'));
const JournalManager = lazyWithRetry(() => import('@/pages/Admin/JournalManager'));
const AddProduct = lazyWithRetry(() => import('./pages/Admin/AddProduct'));
const Categories = lazyWithRetry(() => import('./pages/Admin/Categories'));
const Coupons = lazyWithRetry(() => import('./pages/Admin/Coupons.tsx'));
const FAQManager = lazyWithRetry(() => import('./pages/Admin/FAQManager'));
const AdminLogin = lazyWithRetry(() => import('./pages/Admin/AdminLogin'));
const AdminAccount = lazyWithRetry(() => import('./pages/Admin/Account'));
const AdminUsers = lazyWithRetry(() => import('./pages/Admin/Users'));
const Analytics = lazyWithRetry(() => import('./pages/Admin/Analytics'));

// Component for Suspense fallback
const PageLoader = () => <AppSkeleton />;

// Context for global state
interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, initialQty?: number) => void;
  removeFromCart: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, delta: number, variantId?: string) => void;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

import { WishlistProvider, useWishlist } from './context/WishlistContext';

// ... (Imports remain the same, ensure WishlistProvider is imported)

// Extract AppContent to handle state that depends on other providers
const ScrollReveal: React.FC = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []); // Run on mount, but we might need to re-run or use a more dynamic approach if content changes

  return null;
};

const AppContent: React.FC = () => {
  // Cart and DarkMode state remain here
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setCartOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Use the specific hooks from providers
  const { wishlist, toggleWishlist, isInWishlist, clearWishlist } = useWishlist();

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addToCart = (product: Product, variant?: ProductVariant, initialQty: number = 1) => {
    setCart(prev => {
      // Find item with matching ID AND Variant ID
      const existing = prev.find(item =>
        item.id === product.id &&
        item.selectedVariant?.id === variant?.id
      );

      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.selectedVariant?.id === variant?.id)
            ? { ...item, quantity: item.quantity + initialQty }
            : item
        );
      }

      // Add new item with variant info
      return [...prev, {
        ...product,
        quantity: initialQty,
        selectedVariant: variant,
        // Override price if variant has specific price
        price: variant?.price || product.price
      }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string, variantId?: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedVariant?.id === variantId)));
  };

  const updateQuantity = (id: string, delta: number, variantId?: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedVariant?.id === variantId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      isCartOpen, setCartOpen,
      isDarkMode, toggleDarkMode,
      wishlist, toggleWishlist, isInWishlist, clearCart
    }}>
      <BrowserRouter>
        <ScrollToTop />
        <ScrollReveal />
        <Suspense fallback={<PageLoader />}>
          <MainLayout />
        </Suspense>
      </BrowserRouter>
    </AppContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <SiteConfigProvider>
      <NotificationProvider>
        <UserProvider>
          <ProductProvider>
            <WishlistProvider>
              <CategoryProvider>
                <FAQProvider>
                  <JournalProvider>
                    <OrderProvider>
                      <ReviewProvider>
                        <InAppNotificationProvider>
                          <AppContent />
                        </InAppNotificationProvider>
                      </ReviewProvider>
                    </OrderProvider>
                  </JournalProvider>
                </FAQProvider>
              </CategoryProvider>
            </WishlistProvider>
          </ProductProvider>
        </UserProvider>
      </NotificationProvider>
    </SiteConfigProvider>
  );
};

export default App;

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {!isAdminPage && <Header />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/search" element={<Search />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/quiz" element={<SkinQuiz />} />
          <Route path="/quiz/results" element={<SkinQuizResults />} />
          <Route path="/rituals" element={<RitualGuide />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/story" element={<Story />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:id" element={<JournalDetail />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
          <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/inventory" element={<AdminRoute><Inventory /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><Customers /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><Orders /></AdminRoute>} />
          <Route path="/admin/reviews" element={<AdminRoute><AdminReviews /></AdminRoute>} />
          <Route path="/admin/journal" element={<AdminRoute><JournalManager /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><CMSSettings /></AdminRoute>} />
          <Route path="/admin/account" element={<AdminRoute><AdminAccount /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute allow={['super-admin', 'admin']}><AdminUsers /></AdminRoute>} />
          <Route path="/admin/inventory/add" element={<AdminRoute><AddProduct /></AdminRoute>} />
          <Route path="/admin/inventory/edit/:id" element={<AdminRoute><AddProduct /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><Categories /></AdminRoute>} />
          <Route path="/admin/coupons" element={<AdminRoute><Coupons /></AdminRoute>} />
          <Route path="/admin/faqs" element={<AdminRoute><FAQManager /></AdminRoute>} />
        </Routes>
      </div>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <FloatingCart />}
      <CartDrawer />
    </div>
  );
};
