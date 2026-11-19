/* Komponen daftar riwayat estimasi pesanan lokal dari localStorage (FT-09) */
import {
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  MessageCircle,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {useState} from 'react';
import {buildWhatsAppUrl} from '../lib/calculator.ts';
import {formatIndonesianTimestamp, formatRupiah} from '../lib/format.ts';
import type {OrderHistoryEntry} from '../types.ts';

interface OrderHistorySectionProps {
  history: OrderHistoryEntry[];
  onLoadEntry: (entry: OrderHistoryEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  onClearHistory: () => void;
}

export function OrderHistorySection({
  history,
  onLoadEntry,
  onDeleteEntry,
  onClearHistory,
}: OrderHistorySectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (entryId: string) => {
    setExpandedId((prev) => (prev === entryId ? null : entryId));
  };

  return (
    <section
      id="riwayat-estimasi"
      aria-labelledby="order-history-heading"
      className="mt-8 rounded-2xl bg-white p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="order-history-heading"
            className="text-lg font-semibold text-neutral-900"
          >
            Riwayat Estimasi Pesanan
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Tersimpan otomatis di perangkat Anda tanpa perlu login.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="min-h-[44px] rounded-xl px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            Hapus Semua
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-neutral-50 p-4 text-sm text-neutral-600">
          <History className="h-5 w-5 shrink-0 text-neutral-400" aria-hidden="true" />
          <span>Belum ada riwayat estimasi tersimpan di perangkat ini.</span>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-200 border-t border-neutral-200">
          {history.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const whatsappUrl = buildWhatsAppUrl(entry.whatsappMessage);

            return (
              <li key={entry.id} className="py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
                      <span className="font-medium text-orange-700">
                        {entry.categoryName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {formatIndonesianTimestamp(entry.savedAtIso)}
                      </span>
                      {entry.hasBandungItem && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          H-2 Bandung
                        </span>
                      )}
                    </div>

                    <p className="text-base font-semibold text-neutral-900">
                      {entry.inquiry.customerName}
                    </p>

                    <p className="text-sm text-neutral-600">
                      {entry.inquiry.deliveryAddress}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold tabular-nums text-neutral-900">
                      {formatRupiah(entry.totalEstimatedPrice)}
                    </p>
                    <p className="text-xs tabular-nums text-neutral-600">
                      {entry.totalQty} porsi · {entry.items.length} menu
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => toggleExpand(entry.id)}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                  >
                    <span>{isExpanded ? 'Tutup Detail' : 'Detail'}</span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onLoadEntry(entry)}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    <span>Muat Ulang</span>
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-orange-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>Kirim Ulang</span>
                  </a>

                  <button
                    type="button"
                    aria-label={`Hapus riwayat pesanan ${entry.inquiry.customerName}`}
                    onClick={() => onDeleteEntry(entry.id)}
                    className="ml-auto flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3 rounded-xl bg-neutral-50 p-4">
                    <div>
                      <p className="text-xs font-semibold text-neutral-600">
                        Rincian Menu
                      </p>
                      <ul className="mt-2 space-y-1.5 text-sm text-neutral-900">
                        {entry.items.map((item) => (
                          <li
                            key={item.cartItemId}
                            className="flex items-start justify-between gap-3"
                          >
                            <div>
                              <span className="font-medium">{item.name}</span>
                              {item.optionSummary && (
                                <p className="text-xs text-neutral-600">
                                  {item.optionSummary}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 tabular-nums text-neutral-700">
                              {item.quantity} × {formatRupiah(item.unitPrice)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-neutral-200 pt-3">
                      <p className="text-xs font-semibold text-neutral-600">
                        Teks Pesan WhatsApp
                      </p>
                      <pre className="mt-1.5 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-neutral-800">
                        {entry.whatsappMessage}
                      </pre>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
