/* Komponen utama aplikasi Katalog Produk & Kalkulator Estimasi Dapoer AMI (FT-01 hingga FT-07 & FT-09) */
import {MapPin, Phone} from 'lucide-react';
import {useEffect, useMemo, useRef, useState} from 'react';
import {CalculatorDrawer} from './components/CalculatorDrawer.tsx';
import {CalculatorSummary} from './components/CalculatorSummary.tsx';
import {CategorySwitchModal} from './components/CategorySwitchModal.tsx';
import {CategoryTabs} from './components/CategoryTabs.tsx';
import {CheckoutPreviewForm} from './components/CheckoutPreviewForm.tsx';
import {FloatingAdminButton} from './components/FloatingAdminButton.tsx';
import {FloatingCartBar} from './components/FloatingCartBar.tsx';
import {LunchBoxConfiguratorModal} from './components/LunchBoxConfiguratorModal.tsx';
import {MenuCatalog} from './components/MenuCatalog.tsx';
import {OrderHistorySection} from './components/OrderHistorySection.tsx';
import {ProductDetailModal} from './components/ProductDetailModal.tsx';
import {BRAND_INFO, CATEGORIES, MENU_ITEMS, SUB_CATEGORIES} from './config.ts';
import {
  calculateTotals,
  checkBandungLeadTime,
  evaluateMoq,
  isCategoryConflict,
  updateCartItemQuantity,
  upsertCartItem,
} from './lib/calculator.ts';
import {loadAppState, saveAppState, upsertHistoryEntry} from './lib/storage.ts';
import type {
  CartItem,
  CategoryId,
  MenuItem,
  OrderHistoryEntry,
  OrderInquiry,
  PackageSelection,
} from './types.ts';

type PendingSwitchAction =
  | {type: 'add-regular'; menuItem: MenuItem}
  | {type: 'open-configurator'; menuItem: MenuItem};

export default function App() {
  const initialState = useMemo(() => loadAppState(), []);

  const [activeCategoryId, setActiveCategoryId] = useState<CategoryId>(
    initialState.activeCategoryId,
  );
  const [activeSubCategory, setActiveSubCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>(initialState.cart);
  const [inquiry, setInquiry] = useState<OrderInquiry>(initialState.inquiry);
  const [history, setHistory] = useState<OrderHistoryEntry[]>(initialState.history);

  const [configuratorItem, setConfiguratorItem] = useState<MenuItem | null>(null);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState<PendingSwitchAction | null>(null);

  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    saveAppState({
      activeCategoryId,
      cart,
      inquiry,
      history,
    });
  }, [activeCategoryId, cart, inquiry, history]);

  const cartCategoryId: CategoryId | null = cart.length > 0 ? cart[0].categoryId : null;
  const effectiveCategoryId: CategoryId = cartCategoryId ?? activeCategoryId;

  const moqEvaluation = useMemo(
    () => evaluateMoq(effectiveCategoryId, cart),
    [effectiveCategoryId, cart],
  );
  const leadTimeEvaluation = useMemo(
    () => checkBandungLeadTime(cart, inquiry.deliveryDate),
    [cart, inquiry.deliveryDate],
  );
  const totalsSummary = useMemo(() => calculateTotals(cart), [cart]);

  const visibleMenuItems = useMemo(
    () =>
      MENU_ITEMS.filter(
        (item) => item.isVisible && item.categoryId === activeCategoryId,
      ),
    [activeCategoryId],
  );

  const handleSelectCategory = (categoryId: CategoryId) => {
    setActiveCategoryId(categoryId);
    setActiveSubCategory('Semua');
    setSearchQuery('');
  };

  const handleAddRegularItem = (menuItem: MenuItem) => {
    if (isCategoryConflict(cart, menuItem.categoryId)) {
      setPendingSwitch({type: 'add-regular', menuItem});
      return;
    }
    setCart((prev) => upsertCartItem(prev, menuItem, 1));
  };

  const handleUpdateRegularQty = (menuItemId: string, delta: number) => {
    setCart((prev) => updateCartItemQuantity(prev, menuItemId, delta));
  };

  const handleOpenConfigurator = (menuItem: MenuItem) => {
    if (isCategoryConflict(cart, menuItem.categoryId)) {
      setPendingSwitch({type: 'open-configurator', menuItem});
      return;
    }
    setConfiguratorItem(menuItem);
  };

  const handleSaveConfiguredPackage = (
    menuItem: MenuItem,
    quantity: number,
    selection: PackageSelection,
    optionSummary: string,
  ) => {
    setCart((prev) => upsertCartItem(prev, menuItem, quantity, selection, optionSummary));
    setConfiguratorItem(null);
  };

  const handleConfirmCategorySwitch = () => {
    if (!pendingSwitch) {
      return;
    }
    const action = pendingSwitch;
    setPendingSwitch(null);
    setActiveCategoryId(action.menuItem.categoryId);

    if (action.type === 'add-regular') {
      setCart(upsertCartItem([], action.menuItem, 1));
    } else {
      setCart([]);
      setConfiguratorItem(action.menuItem);
    }
  };

  const handleUpdateCartItemQty = (cartItemId: string, delta: number) => {
    setCart((prev) => updateCartItemQuantity(prev, cartItemId, delta));
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedToCheckoutForm = () => {
    const section = document.getElementById('data-pengiriman');
    if (section) {
      section.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
    window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 250);
  };

  const handleSaveToHistory = (trimmedInquiry: OrderInquiry, whatsappMessage: string) => {
    const categoryName =
      CATEGORIES.find((c) => c.id === effectiveCategoryId)?.name ?? 'Paket Catering';
    const entryId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `est-${Date.now()}`;

    const newEntry: OrderHistoryEntry = {
      id: entryId,
      savedAtIso: new Date().toISOString(),
      categoryId: effectiveCategoryId,
      categoryName,
      items: cart.map((item) => ({...item})),
      totalQty: totalsSummary.totalQty,
      totalEstimatedPrice: totalsSummary.totalEstimatedPrice,
      hasBandungItem: leadTimeEvaluation.hasBandungItem,
      inquiry: {...trimmedInquiry},
      whatsappMessage,
    };

    setHistory((prev) => upsertHistoryEntry(prev, newEntry));
  };

  const handleLoadHistoryEntry = (entry: OrderHistoryEntry) => {
    setActiveCategoryId(entry.categoryId);
    setActiveSubCategory('Semua');
    setCart(entry.items.map((item) => ({...item})));
    setInquiry({...entry.inquiry});
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleDeleteHistoryEntry = (entryId: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== entryId));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4 lg:px-8">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 sm:h-14 sm:w-14">
              <img
                src="/assets/aistudio/Dapoer_AMI_LOGO_440421b5.webp"
                alt="Logo Dapoer AMI"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
                {BRAND_INFO.name}
              </h1>
              <p className="text-sm text-neutral-600">{BRAND_INFO.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600 sm:justify-end">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
                <span>{BRAND_INFO.serviceArea}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Phone className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
                <span>{BRAND_INFO.operationalContact}</span>
              </span>
            </div>

            <nav aria-label="Navigasi cepat" className="hidden items-center gap-4 md:flex">
              <a
                href="#data-pengiriman"
                className="whitespace-nowrap text-sm font-medium text-neutral-700 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
              >
                Pengiriman
              </a>
              <a
                href="#riwayat-estimasi"
                className="whitespace-nowrap text-sm font-medium text-neutral-700 hover:text-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
              >
                Riwayat{history.length > 0 ? ` (${history.length})` : ''}
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-36 pt-6 sm:px-6 lg:px-8 lg:pb-24">
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-8">
            <CategoryTabs
              categories={CATEGORIES}
              activeCategoryId={activeCategoryId}
              cartCategoryId={cartCategoryId}
              onSelectCategory={handleSelectCategory}
            />

            <MenuCatalog
              activeCategoryId={activeCategoryId}
              items={visibleMenuItems}
              subCategories={SUB_CATEGORIES[activeCategoryId]}
              activeSubCategory={activeSubCategory}
              searchQuery={searchQuery}
              cart={cart}
              onSelectSubCategory={setActiveSubCategory}
              onSearchChange={setSearchQuery}
              onAddRegularItem={handleAddRegularItem}
              onUpdateRegularQty={handleUpdateRegularQty}
              onOpenConfigurator={handleOpenConfigurator}
              onSelectDetail={setDetailItem}
            />

            <CheckoutPreviewForm
              cart={cart}
              activeCategoryId={activeCategoryId}
              moq={moqEvaluation}
              leadTime={leadTimeEvaluation}
              inquiry={inquiry}
              onChangeInquiry={setInquiry}
              onSaveToHistory={handleSaveToHistory}
              nameInputRef={nameInputRef}
            />

            <OrderHistorySection
              history={history}
              onLoadEntry={handleLoadHistoryEntry}
              onDeleteEntry={handleDeleteHistoryEntry}
              onClearHistory={handleClearHistory}
            />
          </div>

          <aside
            aria-label="Ringkasan Kalkulator Estimasi"
            className="hidden lg:sticky lg:top-6 lg:col-span-4 lg:block"
          >
            <div className="rounded-2xl bg-white p-6">
              <CalculatorSummary
                cart={cart}
                activeCategoryId={activeCategoryId}
                moq={moqEvaluation}
                leadTime={leadTimeEvaluation}
                totals={totalsSummary}
                onUpdateQty={handleUpdateCartItemQty}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
                onProceedToCheckoutForm={handleProceedToCheckoutForm}
              />
            </div>
          </aside>
        </div>
      </main>

      <FloatingCartBar
        totals={totalsSummary}
        moq={moqEvaluation}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      <FloatingAdminButton activeCategoryId={activeCategoryId} />

      <CalculatorDrawer
        isOpen={isDrawerOpen}
        cart={cart}
        activeCategoryId={activeCategoryId}
        moq={moqEvaluation}
        leadTime={leadTimeEvaluation}
        totals={totalsSummary}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateQty={handleUpdateCartItemQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onProceedToCheckoutForm={handleProceedToCheckoutForm}
      />

      <LunchBoxConfiguratorModal
        menuItem={configuratorItem}
        onClose={() => setConfiguratorItem(null)}
        onSaveToCart={handleSaveConfiguredPackage}
      />

      <ProductDetailModal
        menuItem={detailItem}
        onClose={() => setDetailItem(null)}
        onAddRegularItem={handleAddRegularItem}
        onOpenConfigurator={handleOpenConfigurator}
      />

      <CategorySwitchModal
        isOpen={pendingSwitch !== null}
        currentCategoryId={cartCategoryId}
        targetCategoryId={pendingSwitch?.menuItem.categoryId ?? null}
        onConfirmSwitch={handleConfirmCategorySwitch}
        onCancel={() => setPendingSwitch(null)}
      />
    </div>
  );
}
