
import React, { useState, createContext, useContext, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { CartItem, Product } from './types';
import Header from './components/Header';
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

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Search = lazy(() => import('./pages/Search'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Contact = lazy(() => import('./pages/Contact'));
const Reviews = lazy(() => import('./pages/Reviews'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Story = lazy(() => import('./pages/Story'));
const Journal = lazy(() => import('./pages/Journal'));
const Loyalty = lazy(() => import('./pages/Loyalty'));
const SkinQuiz = lazy(() => import('./pages/SkinQuiz'));
const RitualGuide = lazy(() => import('./pages/RitualGuide'));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));
const Inventory = lazy(() => import('./pages/Admin/Inventory'));
const Customers = lazy(() => import('./pages/Admin/Customers'));
const Orders = lazy(() => import('./pages/Admin/Orders'));
const CMSSettings = lazy(() => import('./pages/Admin/CMSSettings'));
const AdminReviews = lazy(() => import('./pages/Admin/Reviews'));
const AddProduct = lazy(() => import('./pages/Admin/AddProduct'));
const Categories = lazy(() => import('./pages/Admin/Categories'));
const FAQManager = lazy(() => import('./pages/Admin/FAQManager'));

// Component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

// Context for global state
interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
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

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setCartOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const isInWishlist = (id: string) => wishlist.some(item => item.id === id);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const clearCart = () => setCart([]);

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      isCartOpen, setCartOpen,
      isDarkMode, toggleDarkMode,
      wishlist, toggleWishlist, isInWishlist, clearCart
    }}>
      <SiteConfigProvider>
        <NotificationProvider>
          <ProductProvider>
            <ReviewProvider>
              <OrderProvider>
                <JournalProvider>
                  <FAQProvider>
                    <CategoryProvider>
                      <BrowserRouter>
                        <ScrollToTop />
                        <Suspense fallback={<PageLoader />}>
                          <MainLayout />
                        </Suspense>
                      </BrowserRouter>
                    </CategoryProvider>
                  </FAQProvider>
                </JournalProvider>
              </OrderProvider>
            </ReviewProvider>
          </ProductProvider>
        </NotificationProvider>
      </SiteConfigProvider>
    </AppContext.Provider>
  );
};

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
          <Route path="/rituals" element={<RitualGuide />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/story" element={<Story />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/inventory" element={<Inventory />} />
          <Route path="/admin/customers" element={<Customers />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/settings" element={<CMSSettings />} />
          <Route path="/admin/inventory/add" element={<AddProduct />} />
          <Route path="/admin/inventory/edit/:id" element={<AddProduct />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/faqs" element={<FAQManager />} />
        </Routes>
      </div>
      {!isAdminPage && <Footer />}
      <CartDrawer />
    </div>
  );
};

export default App;
