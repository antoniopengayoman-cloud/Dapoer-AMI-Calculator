/* Laci bawah kalkulator estimasi untuk melihat rincian dan mengubah kuantitas pada layar ponsel (FT-04 & FT-05) */
import {X} from 'lucide-react';
import type {
  CartItem,
  CategoryId,
  LeadTimeEvaluation,
  MoqEvaluation,
  TotalsSummary,
} from '../types.ts';
import {CalculatorSummary} from './CalculatorSummary.tsx';

interface CalculatorDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  activeCategoryId: CategoryId;
  moq: MoqEvaluation;
  leadTime: LeadTimeEvaluation;
  totals: TotalsSummary;
  onClose: () => void;
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckoutForm: () => void;
}

export function CalculatorDrawer({
  isOpen,
  cart,
  activeCategoryId,
  moq,
  leadTime,
  totals,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckoutForm,
}: CalculatorDrawerProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Laci Kalkulator Estimasi"
      className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/50 lg:hidden"
    >
      <div className="flex max-h-[88vh] w-full flex-col rounded-t-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
          <span className="text-sm font-semibold text-neutral-900">
            Ringkasan Estimasi Pesanan
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup ringkasan estimasi"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <CalculatorSummary
            cart={cart}
            activeCategoryId={activeCategoryId}
            moq={moq}
            leadTime={leadTime}
            totals={totals}
            onUpdateQty={onUpdateQty}
            onRemoveItem={onRemoveItem}
            onClearCart={onClearCart}
            onProceedToCheckoutForm={() => {
              onClose();
              onProceedToCheckoutForm();
            }}
          />
        </div>
      </div>
    </div>
  );
}
