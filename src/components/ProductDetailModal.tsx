/* Modal detail produk berisi komposisi lengkap, tips penyajian, dan tombol tambah (FT-11) */
import {Award, BookOpen, Clock, Coffee, Plus, SlidersHorizontal, UtensilsCrossed, X} from 'lucide-react';
import {BUSINESS_MESSAGES, CATEGORIES} from '../config.ts';
import {formatRupiah} from '../lib/format.ts';
import type {MenuItem} from '../types.ts';

interface ProductDetailModalProps {
  menuItem: MenuItem | null;
  onClose: () => void;
  onAddRegularItem: (item: MenuItem) => void;
  onOpenConfigurator: (item: MenuItem) => void;
}

export function ProductDetailModal({
  menuItem,
  onClose,
  onAddRegularItem,
  onOpenConfigurator,
}: ProductDetailModalProps) {
  if (!menuItem) {
    return null;
  }

  const categoryName =
    CATEGORIES.find((c) => c.id === menuItem.categoryId)?.name ?? 'Menu';
  const isDrink = menuItem.subCategory === 'Minuman';

  const handlePrimaryAction = () => {
    const item = menuItem;
    onClose();
    if (item.isCustomizable) {
      onOpenConfigurator(item);
    } else {
      onAddRegularItem(item);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/50 sm:items-center sm:p-4"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)] sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
          <div className="min-w-0">
            <p className="text-sm text-neutral-600">
              {categoryName} · {menuItem.subCategory}
            </p>
            <h2
              id="product-detail-title"
              className="mt-0.5 text-lg font-semibold text-neutral-900"
            >
              {menuItem.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail menu"
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {menuItem.imageUrl ? (
            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-50 p-1">
              <img
                src={menuItem.imageUrl}
                alt={`Foto menu ${menuItem.name}`}
                className="h-full w-full object-contain"
              />
            </div>
          ) : (
            <div
              role="img"
              aria-label={`Placeholder foto ${menuItem.name}`}
              className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1.5 rounded-xl bg-neutral-100 px-4 text-center"
            >
              {isDrink ? (
                <Coffee className="h-7 w-7 text-neutral-400" aria-hidden="true" />
              ) : (
                <UtensilsCrossed className="h-7 w-7 text-neutral-400" aria-hidden="true" />
              )}
              <span className="text-sm text-neutral-500">{menuItem.name}</span>
            </div>
          )}

          {(menuItem.isBestSeller || menuItem.unitNote || menuItem.leadTimeNote) && (
            <div className="flex flex-wrap items-center gap-2">
              {menuItem.isBestSeller && (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                  <Award className="h-3.5 w-3.5" aria-hidden="true" />
                  Best Seller
                </span>
              )}
              {menuItem.unitNote && (
                <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800">
                  {menuItem.unitNote}
                </span>
              )}
              {menuItem.leadTimeNote && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {menuItem.leadTimeNote}
                </span>
              )}
            </div>
          )}

          <div>
            <p className="text-base leading-relaxed text-neutral-700">
              {menuItem.description}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-neutral-900">
              {formatRupiah(menuItem.price)}
              <span className="ml-1.5 text-sm font-normal text-neutral-600">
                per porsi
              </span>
            </p>
          </div>

          {menuItem.leadTimeNote && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{BUSINESS_MESSAGES.bandungMandatoryNote}</span>
            </div>
          )}

          {/* Blok Tips Penyajian (FT-11) */}
          <div className="space-y-3 rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-orange-700" aria-hidden="true" />
              <h3 className="text-base font-semibold text-neutral-900">
                Tips Penyajian
              </h3>
            </div>

            <div className="text-sm">
              <div>
                <p className="font-medium text-neutral-900">Cara Saji</p>
                <p className="mt-0.5 leading-relaxed text-neutral-700">
                  {menuItem.servingTip}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-neutral-200 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handlePrimaryAction}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-2 text-sm font-medium text-white hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            {menuItem.isCustomizable ? (
              <>
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>Pilih Nasi &amp; Lauk</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Tambah ke Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
