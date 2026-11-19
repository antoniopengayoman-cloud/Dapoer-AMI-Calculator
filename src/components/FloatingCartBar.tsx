/* Bar kalkulator estimasi yang menempel di bawah layar untuk perangkat ponsel dan tablet kecil (FT-04) */
import {ChevronUp} from 'lucide-react';
import {BUSINESS_MESSAGES} from '../config.ts';
import {formatRupiah} from '../lib/format.ts';
import type {MoqEvaluation, TotalsSummary} from '../types.ts';

interface FloatingCartBarProps {
  totals: TotalsSummary;
  moq: MoqEvaluation;
  onOpenDrawer: () => void;
}

export function FloatingCartBar({totals, moq, onOpenDrawer}: FloatingCartBarProps) {
  const hasItems = totals.totalQty > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0">
          {hasItems ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-semibold tabular-nums text-neutral-900">
                  {formatRupiah(totals.totalEstimatedPrice)}
                </span>
                <span className="text-xs tabular-nums text-neutral-600">
                  · {totals.totalQty} porsi
                </span>
              </div>
              <p
                className={`truncate text-xs ${
                  moq.isMoqValid ? 'text-emerald-800' : 'text-amber-800'
                }`}
              >
                {moq.isMoqValid
                  ? `${BUSINESS_MESSAGES.shippingDisclaimer} · Siap lanjut`
                  : `Kurang ${moq.remainingQty} porsi lagi`}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-neutral-900">
                Kalkulator Estimasi
              </p>
              <p className="truncate text-xs text-neutral-600">
                Pilih menu untuk mulai menghitung
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenDrawer}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-orange-700 px-4 py-2 text-sm font-medium text-white whitespace-nowrap hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
        >
          <span>{hasItems ? 'Cek Estimasi' : 'Lihat Keranjang'}</span>
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
