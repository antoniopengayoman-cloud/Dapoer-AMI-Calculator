/* Komponen utama aplikasi Katalog Produk & Kalkulator Estimasi Dapoer AMI (FT-01 hingga FT-07 & FT-09) */
import {useEffect, useMemo, useRef, useState} from 'react';
import {CalculatorDrawer} from './components/CalculatorDrawer.tsx';
import {CalculatorSummary} from './components/CalculatorSummary.tsx';
import {CategorySwitchModal} from './components/CategorySwitchModal.tsx';
import {CategoryTabs} from './components/CategoryTabs.tsx';
import {CheckoutPreviewForm} from './components/CheckoutPreviewForm.tsx';
import {FloatingCartBar} from './components/FloatingCartBar.tsx';
import {LunchBoxConfiguratorModal} from './components/LunchBoxConfiguratorModal.tsx';
import {MenuCatalog} from './components/MenuCatalog.tsx';
import {OrderHistorySection} from './components/OrderHistorySection.tsx';
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
  const [cart, setCart] = useState<CartItem[]>(initialState.cart);
  const [inquiry, setInquiry] = useState<OrderInquiry>(initialState.inquiry);
  const [history, setHistory] = useState<OrderHistoryEntry[]>(initialState.history);

  const [configuratorItem, setConfiguratorItem] = useState<MenuItem | null>(null);
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
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              {BRAND_INFO.name}
            </h1>
            <p className="text-sm text-neutral-600">{BRAND_INFO.subtitle}</p>
          </div>
          <p className="text-sm text-neutral-600">
            {BRAND_INFO.serviceArea} · {BRAND_INFO.operationalContact}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="lg:col-span-8">
            <CategoryTabs
              categories={CATEGORIES}
              activeCategoryId={activeCategoryId}
              cartCategoryId={cartCategoryId}
              onSelectCategory={handleSelectCategory}
            />

            <MenuCatalog
              items={visibleMenuItems}
              subCategories={SUB_CATEGORIES[activeCategoryId]}
              activeSubCategory={activeSubCategory}
              cart={cart}
              onSelectSubCategory={setActiveSubCategory}
              onAddRegularItem={handleAddRegularItem}
              onUpdateRegularQty={handleUpdateRegularQty}
              onOpenConfigurator={handleOpenConfigurator}
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
