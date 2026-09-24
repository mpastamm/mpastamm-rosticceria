/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import { isSupabaseConfigured, supabase } from './services/supabaseClient';
import { fetchRemoteSnapshot, subscribeToRemoteStore } from './services/supabaseStore';
import {
  Product,
  Category,
  Order,
  BusinessSettings,
  OpeningHourDay,
  CartItem,
  AvailabilityStatus,
  OrderStatus,
} from './types';

// Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminMobileNav } from './components/admin/AdminMobileNav';

// Public Pages
import { HomePage } from './pages/HomePage';
import { VetrinaPage } from './pages/VetrinaPage';
import { AboutPage } from './pages/AboutPage';
import { CateringPage } from './pages/CateringPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmedPage } from './pages/OrderConfirmedPage';
import { LocationPage } from './pages/LocationPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminVetrinaFastPage } from './pages/admin/AdminVetrinaFastPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminProductEditPage } from './pages/admin/AdminProductEditPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminHoursPage } from './pages/admin/AdminHoursPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminSiteContentPage } from './pages/admin/AdminSiteContentPage';

export default function App() {
  // Navigation Path
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Database / Repository States
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [settings, setSettings] = useState<BusinessSettings>(() => StorageService.getSettings());
  const [openingHours, setOpeningHours] = useState<OpeningHourDay[]>(() => StorageService.getOpeningHours());
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() =>
    isSupabaseConfigured ? false : StorageService.getAdminAuth().isAuthenticated
  );

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => StorageService.getCart());
  const [isCartOpen, setIsCartOpen] = useState(false);

  // UI Interactive States
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [recentAddedProductId, setRecentAddedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Subscribe to Storage updates (Realtime multi-tab & local changes)
  useEffect(() => {
    const unsubscribe = StorageService.subscribeToStore(() => {
      setProducts(StorageService.getProducts());
      setCategories(StorageService.getCategories());
      setOrders(StorageService.getOrders());
      setSettings(StorageService.getSettings());
      setOpeningHours(StorageService.getOpeningHours());
      setIsAdminAuthenticated(StorageService.getAdminAuth().isAuthenticated);
      setCartItems(StorageService.getCart());
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    const refreshFromRemote = async () => {
      try {
        const snapshot = await fetchRemoteSnapshot();
        if (active && snapshot) StorageService.hydrateRemoteSnapshot(snapshot);
      } catch (error) {
        console.error('Unable to load Supabase data:', error);
      }
    };

    void refreshFromRemote();
    const unsubscribe = subscribeToRemoteStore(() => void refreshFromRemote());

    return () => {
      active = false;
      unsubscribe();
    };
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const authenticated = Boolean(data.session);
      setIsAdminAuthenticated(authenticated);
      StorageService.setAdminAuth({
        isAuthenticated: authenticated,
        email: data.session?.user.email || '',
      });
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authenticated = Boolean(session);
      setIsAdminAuthenticated(authenticated);
      StorageService.setAdminAuth({
        isAuthenticated: authenticated,
        email: session?.user.email || '',
      });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sync browser URL with custom router
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1, notes?: string) => {
    StorageService.addToCart(product, quantity, notes);
    setCartItems(StorageService.getCart());

    // Flash visual feedback
    setRecentAddedProductId(product.id);
    setTimeout(() => {
      setRecentAddedProductId(null);
    }, 1800);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number, notes?: string) => {
    StorageService.updateCartQuantity(productId, quantity, notes);
    setCartItems(StorageService.getCart());
  };

  const handleRemoveCartItem = (productId: string, notes?: string) => {
    StorageService.removeFromCart(productId, notes);
    setCartItems(StorageService.getCart());
  };

  // Admin operations
  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    StorageService.setAdminAuth({ isAuthenticated: false, email: '' });
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  const handleUpdateProductStatus = (productId: string, status: AvailabilityStatus) => {
    StorageService.updateProductStatus(productId, status);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    StorageService.updateOrderStatus(orderId, status);
  };

  const handleSaveProduct = (data: Partial<Product>) => {
    if (data.id) {
      StorageService.updateProduct(data.id, data);
    } else {
      StorageService.createProduct(data as any);
    }
    setEditingProduct(null);
    setIsCreatingNewProduct(false);
    navigate('/admin/prodotti');
  };

  const handleDeleteProduct = (productId: string) => {
    StorageService.deleteProduct(productId);
  };

  const handleToggleProductVisibility = (productId: string, visible: boolean) => {
    StorageService.updateProduct(productId, { visible });
  };

  const handleToggleProductFeatured = (productId: string, featured: boolean) => {
    StorageService.updateProduct(productId, { featured });
  };

  const handleSaveCategory = (cat: Partial<Category>) => {
    if (cat.id) {
      StorageService.updateCategory(cat.id, cat);
    } else {
      StorageService.createCategory(cat as any);
    }
  };

  const handleDeleteCategory = (catId: string) => {
    StorageService.deleteCategory(catId);
  };

  const handleReorderCategory = (catId: string, direction: 'up' | 'down') => {
    StorageService.reorderCategory(catId, direction);
  };

  const handleSaveHours = (hours: OpeningHourDay[], slotInterval: number) => {
    StorageService.saveOpeningHours(hours);
    StorageService.saveSettings({ ...settings, slot_interval_minutes: slotInterval });
  };

  const handleSaveSettings = (newSettings: BusinessSettings) => {
    StorageService.saveSettings(newSettings);
  };

  const handleResetFactoryData = () => {
    StorageService.resetToFactoryData();
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Determine if route is admin
  const isAdminRoute = currentPath.startsWith('/admin');

  // Pending orders counter for admin badges
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'NUOVO' || o.status === 'ACCETTATO' || o.status === 'IN PREPARAZIONE'
  ).length;

  // Render Admin Area
  if (isAdminRoute) {
    if (!isAdminAuthenticated && currentPath !== '/admin/login') {
      return (
        <AdminLoginPage
          onLoginSuccess={() => navigate('/admin')}
          onBackToStore={() => navigate('/')}
        />
      );
    }

    if (currentPath === '/admin/login') {
      return (
        <AdminLoginPage
          onLoginSuccess={() => navigate('/admin')}
          onBackToStore={() => navigate('/')}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#F8F6F1] flex flex-col lg:flex-row text-[#1C211E]">
        {/* Desktop Sidebar */}
        <AdminSidebar
          currentPath={currentPath}
          onNavigate={navigate}
          onLogout={handleLogout}
          pendingOrdersCount={pendingOrdersCount}
        />

        {/* Main Admin Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-12">
          {/* Subroutes */}
          {currentPath === '/admin' && (
            <AdminDashboardPage
              orders={orders}
              onNavigate={navigate}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {currentPath === '/admin/vetrina' && (
            <AdminVetrinaFastPage
              products={products}
              categories={categories}
              onUpdateProductStatus={handleUpdateProductStatus}
              onEditProduct={(p) => {
                setEditingProduct(p);
                setIsCreatingNewProduct(false);
                navigate('/admin/prodotti/modifica');
              }}
            />
          )}

          {currentPath === '/admin/ordini' && (
            <AdminOrdersPage
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {currentPath === '/admin/prodotti' && !editingProduct && !isCreatingNewProduct && (
            <AdminProductsPage
              products={products}
              categories={categories}
              onAddNew={() => {
                setEditingProduct(null);
                setIsCreatingNewProduct(true);
                navigate('/admin/prodotti/modifica');
              }}
              onEdit={(p) => {
                setEditingProduct(p);
                setIsCreatingNewProduct(false);
                navigate('/admin/prodotti/modifica');
              }}
              onDelete={handleDeleteProduct}
              onToggleVisibility={handleToggleProductVisibility}
              onToggleFeatured={handleToggleProductFeatured}
            />
          )}

          {currentPath === '/admin/prodotti/modifica' && (
            <AdminProductEditPage
              product={editingProduct}
              categories={categories}
              onSave={handleSaveProduct}
              onCancel={() => {
                setEditingProduct(null);
                setIsCreatingNewProduct(false);
                navigate('/admin/prodotti');
              }}
            />
          )}

          {currentPath === '/admin/categorie' && (
            <AdminCategoriesPage
              categories={categories}
              products={products}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
              onReorderCategory={handleReorderCategory}
            />
          )}

          {currentPath === '/admin/orari' && (
            <AdminHoursPage
              openingHours={openingHours}
              settings={settings}
              onSaveHours={handleSaveHours}
            />
          )}

          {currentPath === '/admin/impostazioni' && (
            <AdminSettingsPage
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetFactoryData={handleResetFactoryData}
            />
          )}

          {currentPath === '/admin/contenuti' && (
            <AdminSiteContentPage
              settings={settings}
              categories={categories}
              onSaveSettings={handleSaveSettings}
              onSaveCategory={handleSaveCategory}
            />
          )}
        </main>

        {/* Smartphone Thumb Bottom Nav */}
        <AdminMobileNav
          currentPath={currentPath}
          onNavigate={navigate}
          onLogout={handleLogout}
          pendingOrdersCount={pendingOrdersCount}
        />
      </div>
    );
  }

  // Render Public Customer Experience
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1C211E] selection:bg-[#1B3B2B] selection:text-[#FAF7F2]">
      {/* Top Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentPath={currentPath}
        onNavigate={navigate}
        settings={settings}
        onSearch={(q) => setSearchQuery(q)}
      />

      {/* Main Public Content */}
      <main className="flex-1">
        {currentPath === '/' && (
          <HomePage
            products={products}
            categories={categories}
            settings={settings}
            onNavigate={navigate}
            onOpenProductModal={(p) => setSelectedProductForModal(p)}
            onQuickAdd={(p) => handleAddToCart(p, 1)}
            recentAddedId={recentAddedProductId}
            searchQuery={searchQuery}
          />
        )}

        {currentPath === '/vetrina' && (
          <HomePage
            products={products}
            categories={categories}
            settings={settings}
            onNavigate={navigate}
            onOpenProductModal={(p) => setSelectedProductForModal(p)}
            onQuickAdd={(p) => handleAddToCart(p, 1)}
            recentAddedId={recentAddedProductId}
            searchQuery={searchQuery}
          />
        )}

        {currentPath === '/chi-siamo' && (
          <AboutPage settings={settings} onNavigate={navigate} />
        )}

        {currentPath === '/catering' && (
          <CateringPage settings={settings} onNavigate={navigate} />
        )}

        {currentPath === '/carrello' && (
          <CartPage
            items={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onNavigate={navigate}
          />
        )}

        {currentPath === '/checkout' && (
          <CheckoutPage
            items={cartItems}
            settings={settings}
            openingHours={openingHours}
            onOrderCompleted={(order) => {
              setLastPlacedOrder(order);
              StorageService.clearCart();
              setCartItems([]);
            }}
            onNavigate={navigate}
          />
        )}

        {currentPath.startsWith('/ordine-confermato') && (
          <OrderConfirmedPage
            order={
              lastPlacedOrder ||
              orders.find((o) => currentPath.endsWith(o.order_number)) ||
              orders[0] ||
              null
            }
            settings={settings}
            onNavigate={navigate}
          />
        )}

        {currentPath === '/dove-siamo' && (
          <LocationPage settings={settings} openingHours={openingHours} />
        )}
      </main>

      {/* Product Customization / Detail Modal */}
      <ProductModal
        product={selectedProductForModal}
        categoryName={
          categories.find((c) => c.id === selectedProductForModal?.category_id)?.name
        }
        isOpen={Boolean(selectedProductForModal)}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Slide-in Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => navigate('/checkout')}
      />

      {/* Footer */}
      <Footer settings={settings} onNavigate={navigate} />
    </div>
  );
}
