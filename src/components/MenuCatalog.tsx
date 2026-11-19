/* Komponen katalog produk, pencarian nama menu, dan filter sub-kategori (FT-02) */
import {
  Award,
  Clock,
  Coffee,
  Minus,
  Plus,
  Search,
  SlidersHorizontal,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import {filterMenuItems} from '../lib/calculator.ts';
import {formatRupiah} from '../lib/format.ts';
import type {CartItem, MenuItem} from '../types.ts';

interface MenuCatalogProps {
  items: MenuItem[];
  subCategories: string[];
  activeSubCategory: string;
  searchQuery: string;
  cart: CartItem[];
  onSelectSubCategory: (subCategory: string) => void;
  onSearchChange: (query: string) => void;
  onAddRegularItem: (item: MenuItem) => void;
  onUpdateRegularQty: (menuItemId: string, delta: number) => void;
  onOpenConfigurator: (item: MenuItem) => void;
}

export function MenuCatalog({
  items,
  subCategories,
  activeSubCategory,
  searchQuery,
  cart,
  onSelectSubCategory,
  onSearchChange,
  onAddRegularItem,
  onUpdateRegularQty,
  onOpenConfigurator,
}: MenuCatalogProps) {
  const showSubFilters = subCategories.length > 1;
  const filteredItems = filterMenuItems(items, activeSubCategory, searchQuery);
  const hasActiveFilter = searchQuery.trim().length > 0 || activeSubCategory !== 'Semua';

  const getRegularCartQty = (menuItemId: string): number => {
    const found = cart.find((c) => c.menuItemId === menuItemId && !c.optionSummary);
    return found ? found.quantity : 0;
  };

  const getCustomCartQty = (menuItemId: string): number => {
    return cart
      .filter((c) => c.menuItemId === menuItemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleResetFilters = () => {
    onSearchChange('');
    onSelectSubCategory('Semua');
  };

  return (
    <section aria-label="Daftar Menu" className="mt-6">
      <div className="mb-4 space-y-3">
        <div>
          <label
            htmlFor="menu-search"
            className="block text-sm font-medium text-neutral-900"
          >
            Cari menu
          </label>
          <div className="relative mt-1.5">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
            <input
              id="menu-search"
              name="menuSearch"
              type="search"
              inputMode="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Contoh: Tongkol, Bento, Spaghetti"
              className="w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-11 text-base text-neutral-900 placeholder:text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                aria-label="Hapus pencarian"
                onClick={() => onSearchChange('')}
                className="absolute right-1 top-1/2 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-xl text-neutral-500 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {showSubFilters && (
          <div
            role="group"
            aria-label="Filter sub-kategori"
            className="flex flex-wrap gap-2"
          >
            {subCategories.map((sub) => {
              const isSelected = sub === activeSubCategory;
              return (
                <button
                  key={sub}
                  type="button"
                  onClick={() => onSelectSubCategory(sub)}
                  className={`min-h-[44px] rounded-xl border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${
                    isSelected
                      ? 'border-orange-700 bg-orange-50 text-orange-700'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center">
          <p className="text-sm text-neutral-600">
            {searchQuery.trim()
              ? `Tidak ada menu dengan nama "${searchQuery.trim()}" pada kategori ini.`
              : 'Belum ada menu yang sesuai pada sub-kategori ini.'}
          </p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
            >
              Reset Pencarian
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredItems.map((item) => {
            const regularQty = getRegularCartQty(item.id);
            const customQty = getCustomCartQty(item.id);
            const isDrink = item.subCategory === 'Minuman';
            const hasBadges =
              item.isBestSeller || Boolean(item.unitNote) || Boolean(item.leadTimeNote);

            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-2xl bg-white p-4 transition-transform duration-150 ease-out hover:-translate-y-0.5 motion-reduce:transition-none sm:p-5"
              >
                <div>
                  <div
                    role="img"
                    aria-label={`Placeholder foto ${item.name}`}
                    className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 rounded-xl bg-neutral-100 px-4 text-center"
                  >
                    {isDrink ? (
                      <Coffee className="h-6 w-6 text-neutral-400" aria-hidden="true" />
                    ) : (
                      <UtensilsCrossed className="h-6 w-6 text-neutral-400" aria-hidden="true" />
                    )}
                    <span className="line-clamp-1 text-sm text-neutral-500">
                      {item.name}
                    </span>
                  </div>

                  {hasBadges && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {item.isBestSeller && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                          <Award className="h-3.5 w-3.5" aria-hidden="true" />
                          Best Seller
                        </span>
                      )}
                      {item.unitNote && (
                        <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800">
                          {item.unitNote}
                        </span>
                      )}
                      {item.leadTimeNote && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {item.leadTimeNote}
                        </span>
                      )}
                    </div>
                  )}

                  <h2 className="mt-3 text-base font-semibold text-neutral-900">
                    {item.name}
                  </h2>

                  <p className="mt-1 text-sm leading-relaxed text-neutral-600">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 pt-2">
                  <div>
                    <p className="text-base font-semibold tabular-nums text-neutral-900">
                      {formatRupiah(item.price)}
                    </p>
                    <p className="text-xs text-neutral-500">per porsi</p>
                  </div>

                  {item.isCustomizable ? (
                    <button
                      type="button"
                      onClick={() => onOpenConfigurator(item)}
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-orange-700 px-4 py-2 text-sm font-medium text-white whitespace-nowrap transition-colors duration-150 ease-out hover:bg-orange-800 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                    >
                      <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {customQty > 0 ? `Pilih Lauk (${customQty})` : 'Pilih Lauk'}
                      </span>
                    </button>
                  ) : regularQty > 0 ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Kurangi porsi ${item.name}`}
                        onClick={() => onUpdateRegularQty(item.id, -1)}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                      >
                        <Minus className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <span
                        aria-label={`Jumlah ${item.name}`}
                        className="min-w-[32px] text-center text-sm font-semibold tabular-nums text-neutral-900"
                      >
                        {regularQty}
                      </span>
                      <button
                        type="button"
                        aria-label={`Tambah porsi ${item.name}`}
                        onClick={() => onUpdateRegularQty(item.id, 1)}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-orange-700 text-white hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                      >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onAddRegularItem(item)}
                      className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-orange-700 px-4 py-2 text-sm font-medium text-white whitespace-nowrap transition-colors duration-150 ease-out hover:bg-orange-800 motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Tambah</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
