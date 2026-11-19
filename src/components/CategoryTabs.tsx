/* Komponen tab navigasi kategori utama dengan gaya minimalis dan indikator minimal porsi (FT-01) */
import type {Category, CategoryId} from '../types.ts';

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: CategoryId;
  cartCategoryId: CategoryId | null;
  onSelectCategory: (categoryId: CategoryId) => void;
}

export function CategoryTabs({
  categories,
  activeCategoryId,
  cartCategoryId,
  onSelectCategory,
}: CategoryTabsProps) {
  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? categories[0];

  return (
    <section aria-label="Kategori Layanan">
      <div
        role="tablist"
        aria-label="Pilih kategori menu"
        className="grid grid-cols-3 gap-2 sm:gap-3"
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          const hasCartItems = cartCategoryId === category.id;

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectCategory(category.id)}
              className={`min-h-[44px] flex flex-col items-start justify-center rounded-xl border px-3 py-2.5 text-left transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 sm:px-4 ${
                isActive
                  ? 'border-orange-700 bg-orange-50 text-neutral-900'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span className="w-full truncate text-sm font-semibold">
                {category.name}
              </span>
              <span
                className={`mt-0.5 text-xs ${
                  isActive ? 'font-medium text-orange-700' : 'text-neutral-600'
                }`}
              >
                {category.moqShortLabel}
                {hasCartItems ? ' · Aktif' : ''}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-sm text-neutral-600">
        {activeCategory.description}
      </p>
    </section>
  );
}
