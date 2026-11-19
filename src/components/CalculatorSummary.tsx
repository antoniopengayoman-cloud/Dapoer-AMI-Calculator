/* Ringkasan kalkulator estimasi, validasi MOQ, dan peringatan H-2 Bandung dengan tata letak minimalis (FT-04 & FT-05) */
import {AlertTriangle, CheckCircle2, Clock, Minus, Plus, ShoppingBag, Trash2} from 'lucide-react';
import {BUSINESS_MESSAGES, CATEGORIES} from '../config.ts';
import {formatRupiah} from '../lib/format.ts';
import type {
  CartItem,
  CategoryId,
  LeadTimeEvaluation,
  MoqEvaluation,
  TotalsSummary,
} from '../types.ts';

interface CalculatorSummaryProps {
  cart: CartItem[];
  activeCategoryId: CategoryId;
  moq: MoqEvaluation;
  leadTime: LeadTimeEvaluation;
  totals: TotalsSummary;
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onProceedToCheckoutForm: () => void;
}

export function CalculatorSummary({
  cart,
  activeCategoryId,
  moq,
  leadTime,
  totals,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckoutForm,
}: CalculatorSummaryProps) {
  const effectiveCategoryId = cart.length > 0 ? cart[0].categoryId : activeCategoryId;
  const categoryName =
    CATEGORIES.find((c) => c.id === effectiveCategoryId)?.name ?? 'Paket Catering';

  const progressRatio =
    moq.minOrderQty > 1 ? Math.min(100, Math.round((moq.totalQty / moq.minOrderQty) * 100)) : 100;

  if (cart.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Kalkulator Estimasi</h2>
            <p className="text-sm text-neutral-600">Keranjang Anda masih kosong.</p>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-neutral-600">
          Pilih menu pada katalog untuk menghitung estimasi biaya dan memeriksa minimal porsi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Kalkulator Estimasi</h2>
          <p className="text-sm text-neutral-600">
            {categoryName} · <span className="tabular-nums">{totals.totalQty}</span> porsi
          </p>
        </div>
        <button
          type="button"
          onClick={onClearCart}
          className="min-h-[44px] rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
        >
          Kosongkan
        </button>
      </div>

      {/* Indikator validasi MOQ (FT-05) */}
      <div
        role="status"
        className={`rounded-xl p-3 text-sm ${
          moq.isMoqValid
            ? 'bg-emerald-50 text-emerald-800'
            : 'bg-amber-50 text-amber-800'
        }`}
      >
        <div className="flex items-start gap-2">
          {moq.isMoqValid ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="font-medium">{moq.statusMessage}</span>
        </div>

        {moq.minOrderQty > 1 && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white">
            <div
              className={`h-full transition-transform duration-200 ease-out motion-reduce:transition-none ${
                moq.isMoqValid ? 'bg-emerald-700' : 'bg-amber-600'
              }`}
              style={{width: `${progressRatio}%`}}
            />
          </div>
        )}
      </div>

      {/* Peringatan wajib H-2 Baso Tahu Bandoeng (FT-05 / BL-04) */}
      {leadTime.hasBandungItem && leadTime.mandatoryNote && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
        >
          <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{leadTime.mandatoryNote}</span>
        </div>
      )}

      {/* Daftar item keranjang */}
      <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
        {cart.map((item) => (
          <li key={item.cartItemId} className="py-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-neutral-900">{item.name}</p>
                {item.optionSummary && (
                  <p className="mt-0.5 text-xs text-neutral-600">{item.optionSummary}</p>
                )}
                <p className="mt-1 text-xs tabular-nums text-neutral-600">
                  {item.quantity} porsi × {formatRupiah(item.unitPrice)}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Hapus ${item.name}`}
                onClick={() => onRemoveItem(item.cartItemId)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Kurangi porsi ${item.name}`}
                  onClick={() => onUpdateQty(item.cartItemId, -1)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="min-w-[32px] text-center text-sm font-semibold tabular-nums text-neutral-900">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Tambah porsi ${item.name}`}
                  onClick={() => onUpdateQty(item.cartItemId, 1)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <p className="text-sm font-semibold tabular-nums text-neutral-900">
                {formatRupiah(item.unitPrice * item.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {/* Total estimasi & disclaimer ongkos kirim */}
      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-neutral-600">Total Estimasi</span>
          <span className="text-3xl font-semibold tabular-nums text-neutral-900">
            {formatRupiah(totals.totalEstimatedPrice)}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-neutral-600">
          {BUSINESS_MESSAGES.shippingDetailNote}
        </p>
      </div>

      <button
        type="button"
        disabled={!moq.isMoqValid}
        onClick={onProceedToCheckoutForm}
        className={`w-full min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${
          moq.isMoqValid
            ? 'bg-orange-700 text-white hover:bg-orange-800'
            : 'cursor-not-allowed bg-neutral-200 text-neutral-500'
        }`}
      >
        Isi Data Pengiriman
      </button>
    </div>
  );
}
