/* Modal konfirmasi saat pengguna menambah item dari kategori yang berbeda dengan isi keranjang (FT-01 / BL-01) */
import {AlertTriangle, X} from 'lucide-react';
import {BUSINESS_MESSAGES, CATEGORIES} from '../config.ts';
import type {CategoryId} from '../types.ts';

interface CategorySwitchModalProps {
  isOpen: boolean;
  currentCategoryId: CategoryId | null;
  targetCategoryId: CategoryId | null;
  onConfirmSwitch: () => void;
  onCancel: () => void;
}

export function CategorySwitchModal({
  isOpen,
  currentCategoryId,
  targetCategoryId,
  onConfirmSwitch,
  onCancel,
}: CategorySwitchModalProps) {
  if (!isOpen || !currentCategoryId || !targetCategoryId) {
    return null;
  }

  const currentName = CATEGORIES.find((c) => c.id === currentCategoryId)?.name ?? '';
  const targetName = CATEGORIES.find((c) => c.id === targetCategoryId)?.name ?? '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-switch-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2
              id="category-switch-title"
              className="text-lg font-semibold text-neutral-900"
            >
              {BUSINESS_MESSAGES.categorySwitchTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onCancel}
            aria-label="Tutup dialog"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          {BUSINESS_MESSAGES.categorySwitchDescription}
        </p>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
          <span>Keranjang saat ini: </span>
          <strong className="font-semibold text-neutral-900">{currentName}</strong>
          <span> · Kategori baru: </span>
          <strong className="font-semibold text-orange-700">{targetName}</strong>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            {BUSINESS_MESSAGES.categorySwitchCancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirmSwitch}
            className="min-h-[44px] rounded-xl bg-orange-700 px-4 py-2 text-sm font-medium text-white hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            {BUSINESS_MESSAGES.categorySwitchConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
