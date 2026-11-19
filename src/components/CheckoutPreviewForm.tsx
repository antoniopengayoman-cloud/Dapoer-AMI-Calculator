/* Formulir data pengiriman, penghitung estimasi ongkir zona/jarak, pratinjau pesan WhatsApp, dan simpan riwayat (FT-06, FT-07, FT-09, FT-10) */
import {
  AlertTriangle,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Lock,
  MessageCircle,
  Truck,
} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {BUSINESS_MESSAGES, SHIPPING_ZONES} from '../config.ts';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  calculateShippingEstimate,
  calculateTotals,
  validateOrderInquiry,
} from '../lib/calculator.ts';
import {formatRupiah} from '../lib/format.ts';
import type {
  CartItem,
  CategoryId,
  InquiryErrors,
  LeadTimeEvaluation,
  MoqEvaluation,
  OrderInquiry,
  ShippingZoneId,
} from '../types.ts';

interface CheckoutPreviewFormProps {
  cart: CartItem[];
  activeCategoryId: CategoryId;
  moq: MoqEvaluation;
  leadTime: LeadTimeEvaluation;
  inquiry: OrderInquiry;
  onChangeInquiry: (next: OrderInquiry) => void;
  onSaveToHistory: (trimmedInquiry: OrderInquiry, whatsappMessage: string) => void;
  nameInputRef: React.RefObject<HTMLInputElement | null>;
}

export function CheckoutPreviewForm({
  cart,
  activeCategoryId,
  moq,
  leadTime,
  inquiry,
  onChangeInquiry,
  onSaveToHistory,
  nameInputRef,
}: CheckoutPreviewFormProps) {
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [savedFeedback, setSavedFeedback] = useState(false);
  const addressInputRef = useRef<HTMLTextAreaElement | null>(null);
  const distanceInputRef = useRef<HTMLInputElement | null>(null);

  const effectiveCategoryId = cart.length > 0 ? cart[0].categoryId : activeCategoryId;
  const isFormUnlocked = cart.length > 0 && moq.isMoqValid;

  const totals = calculateTotals(cart);
  const shippingEstimate = calculateShippingEstimate(
    inquiry.shippingZoneId,
    inquiry.shippingDistanceKm,
  );
  const grandTotal = totals.totalEstimatedPrice + shippingEstimate.shippingCost;
  const selectedZone =
    SHIPPING_ZONES.find((z) => z.id === inquiry.shippingZoneId) ?? SHIPPING_ZONES[0];

  const previewValidation = validateOrderInquiry(inquiry);
  const canSendWhatsApp = isFormUnlocked && previewValidation.isValid;
  const previewMessage = canSendWhatsApp
    ? buildWhatsAppMessage(previewValidation.trimmed, cart, effectiveCategoryId)
    : '';
  const whatsappUrl = canSendWhatsApp ? buildWhatsAppUrl(previewMessage) : '';

  useEffect(() => {
    setSavedFeedback(false);
  }, [cart, inquiry]);

  const handleFieldChange = (field: keyof OrderInquiry, value: string) => {
    const next = {...inquiry, [field]: value};
    onChangeInquiry(next);
    if (errors[field as keyof InquiryErrors]) {
      setErrors((prev) => ({...prev, [field]: undefined}));
    }
  };

  const handleZoneChange = (zoneId: ShippingZoneId) => {
    const next: OrderInquiry = {
      ...inquiry,
      shippingZoneId: zoneId,
      shippingDistanceKm: zoneId === 'custom-distance' ? inquiry.shippingDistanceKm : '',
    };
    onChangeInquiry(next);
    if (errors.shippingDistanceKm) {
      setErrors((prev) => ({...prev, shippingDistanceKm: undefined}));
    }
  };

  const runValidation = (): OrderInquiry | null => {
    const result = validateOrderInquiry(inquiry);
    onChangeInquiry(result.trimmed);

    if (!result.isValid) {
      setErrors(result.errors);
      if (result.errors.customerName && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (result.errors.deliveryAddress && addressInputRef.current) {
        addressInputRef.current.focus();
      } else if (result.errors.shippingDistanceKm && distanceInputRef.current) {
        distanceInputRef.current.focus();
      }
      return null;
    }

    setErrors({});
    return result.trimmed;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormUnlocked) {
      return;
    }
    const trimmed = runValidation();
    if (!trimmed) {
      return;
    }
    const message = buildWhatsAppMessage(trimmed, cart, effectiveCategoryId);
    onSaveToHistory(trimmed, message);
    setSavedFeedback(true);
  };

  const handleSaveHistoryClick = () => {
    if (!isFormUnlocked) {
      return;
    }
    const trimmed = runValidation();
    if (!trimmed) {
      return;
    }
    const message = buildWhatsAppMessage(trimmed, cart, effectiveCategoryId);
    onSaveToHistory(trimmed, message);
    setSavedFeedback(true);
  };

  const handleWhatsAppLinkClick = () => {
    if (!canSendWhatsApp) {
      return;
    }
    onSaveToHistory(previewValidation.trimmed, previewMessage);
  };

  return (
    <section
      id="data-pengiriman"
      aria-labelledby="checkout-form-heading"
      className="mt-8 rounded-2xl bg-white p-6 sm:p-8"
    >
      <div>
        <h2
          id="checkout-form-heading"
          className="text-lg font-semibold text-neutral-900"
        >
          Data Pengiriman &amp; Estimasi Ongkos Kirim
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Lengkapi alamat Jakarta dan pilih zona atau jarak kirim untuk melihat total biaya Anda.
        </p>
      </div>

      {!isFormUnlocked && (
        <div
          role="status"
          className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
        >
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {cart.length === 0
              ? 'Pilih menu terlebih dahulu untuk mengisi data pengiriman Anda.'
              : moq.statusMessage}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="customerName"
            className="block text-sm font-medium text-neutral-900"
          >
            Nama Pemesan <span className="text-red-700">*</span>
          </label>
          <input
            ref={nameInputRef}
            id="customerName"
            name="customerName"
            type="text"
            autoComplete="name"
            disabled={!isFormUnlocked}
            value={inquiry.customerName}
            onChange={(e) => handleFieldChange('customerName', e.target.value)}
            placeholder="Contoh: Budi Santoso / Divisi Keuangan"
            aria-invalid={Boolean(errors.customerName)}
            aria-describedby={errors.customerName ? 'customerName-error' : undefined}
            className="mt-1.5 w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          />
          {errors.customerName && (
            <p id="customerName-error" className="mt-1.5 text-sm text-red-700">
              {errors.customerName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="deliveryDate"
              className="block text-sm font-medium text-neutral-900"
            >
              Tanggal Kirim (opsional)
            </label>
            <input
              id="deliveryDate"
              name="deliveryDate"
              type="date"
              disabled={!isFormUnlocked}
              value={inquiry.deliveryDate}
              onChange={(e) => handleFieldChange('deliveryDate', e.target.value)}
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
            />
            <p className="mt-1 text-xs text-neutral-600">
              Kosongkan bila jadwal menyesuaikan admin.
            </p>
          </div>

          <div>
            <label
              htmlFor="deliveryTime"
              className="block text-sm font-medium text-neutral-900"
            >
              Jam Kirim (opsional)
            </label>
            <input
              id="deliveryTime"
              name="deliveryTime"
              type="time"
              disabled={!isFormUnlocked}
              value={inquiry.deliveryTime}
              onChange={(e) => handleFieldChange('deliveryTime', e.target.value)}
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
            />
            <p className="mt-1 text-xs text-neutral-600">
              Waktu pengantaran area Jakarta (WIB).
            </p>
          </div>
        </div>

        {leadTime.hasBandungItem && leadTime.isDateTooSoon && leadTime.dateWarningMessage && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{leadTime.dateWarningMessage}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="deliveryAddress"
            className="block text-sm font-medium text-neutral-900"
          >
            Alamat Pengantaran Area Jakarta <span className="text-red-700">*</span>
          </label>
          <textarea
            ref={addressInputRef}
            id="deliveryAddress"
            name="deliveryAddress"
            rows={2}
            autoComplete="street-address"
            disabled={!isFormUnlocked}
            value={inquiry.deliveryAddress}
            onChange={(e) => handleFieldChange('deliveryAddress', e.target.value)}
            placeholder="Contoh: Menara Danareksa Lt. 5, Jl. Medan Merdeka Selatan No. 14"
            aria-invalid={Boolean(errors.deliveryAddress)}
            aria-describedby={errors.deliveryAddress ? 'deliveryAddress-error' : undefined}
            className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          />
          {errors.deliveryAddress && (
            <p id="deliveryAddress-error" className="mt-1.5 text-sm text-red-700">
              {errors.deliveryAddress}
            </p>
          )}
        </div>

        {/* Penghitung Estimasi Ongkos Kirim Zona / Jarak (FT-10) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={inquiry.shippingZoneId === 'custom-distance' ? '' : 'sm:col-span-2'}>
            <label
              htmlFor="shippingZoneId"
              className="block text-sm font-medium text-neutral-900"
            >
              Zona / Perkiraan Ongkos Kirim
            </label>
            <select
              id="shippingZoneId"
              name="shippingZoneId"
              disabled={!isFormUnlocked}
              value={inquiry.shippingZoneId}
              onChange={(e) => handleZoneChange(e.target.value as ShippingZoneId)}
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
            >
              {SHIPPING_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label}
                  {zone.id !== 'admin-confirm' && zone.id !== 'custom-distance'
                    ? ` (${zone.flatFee === 0 ? 'Gratis' : formatRupiah(zone.flatFee)})`
                    : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-600">{selectedZone.areaDetail}</p>
          </div>

          {inquiry.shippingZoneId === 'custom-distance' && (
            <div>
              <label
                htmlFor="shippingDistanceKm"
                className="block text-sm font-medium text-neutral-900"
              >
                Jarak dari Menara Danareksa (km) <span className="text-red-700">*</span>
              </label>
              <input
                ref={distanceInputRef}
                id="shippingDistanceKm"
                name="shippingDistanceKm"
                type="text"
                inputMode="decimal"
                disabled={!isFormUnlocked}
                value={inquiry.shippingDistanceKm}
                onChange={(e) => handleFieldChange('shippingDistanceKm', e.target.value)}
                placeholder="Contoh: 4,5"
                aria-invalid={Boolean(errors.shippingDistanceKm)}
                aria-describedby={
                  errors.shippingDistanceKm ? 'shippingDistanceKm-error' : undefined
                }
                className="mt-1.5 w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
              />
              {errors.shippingDistanceKm ? (
                <p id="shippingDistanceKm-error" className="mt-1.5 text-sm text-red-700">
                  {errors.shippingDistanceKm}
                </p>
              ) : (
                <p className="mt-1 text-xs text-neutral-600">
                  Isi antara 0,1 sampai 60 km (bisa pakai koma).
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-neutral-900"
          >
            Catatan Tambahan (opsional)
          </label>
          <input
            id="notes"
            name="notes"
            type="text"
            disabled={!isFormUnlocked}
            value={inquiry.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Contoh: Sambal dipisah atau catatan ruangan rapat"
            className="mt-1.5 w-full min-h-[44px] rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          />
        </div>

        {leadTime.hasBandungItem && leadTime.mandatoryNote && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{leadTime.mandatoryNote} (otomatis tercantum di pesan).</span>
          </div>
        )}

        {/* Ringkasan Subtotal + Estimasi Ongkos Kirim */}
        {isFormUnlocked && (
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <Truck className="h-4 w-4 text-orange-700" aria-hidden="true" />
              <span>Rincian Estimasi Biaya</span>
            </div>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-600">
                  Subtotal Menu ({totals.totalQty} porsi)
                </dt>
                <dd className="font-medium tabular-nums text-neutral-900">
                  {formatRupiah(totals.totalEstimatedPrice)}
                </dd>
              </div>

              <div className="flex items-center justify-between gap-2">
                <dt className="text-neutral-600">
                  Estimasi Ongkos Kirim
                  {shippingEstimate.isCalculated ? ` (${shippingEstimate.zoneLabel})` : ''}
                </dt>
                <dd className="font-medium tabular-nums text-neutral-900">
                  {shippingEstimate.isCalculated
                    ? shippingEstimate.shippingCost === 0
                      ? 'Rp 0 (Gratis area)'
                      : formatRupiah(shippingEstimate.shippingCost)
                    : 'Konfirmasi admin'}
                </dd>
              </div>

              <div className="flex items-baseline justify-between gap-2 border-t border-neutral-200 pt-2">
                <dt className="font-semibold text-neutral-900">
                  {shippingEstimate.isCalculated
                    ? 'Estimasi Total Keseluruhan'
                    : 'Total Estimasi Menu'}
                </dt>
                <dd className="text-xl font-semibold tabular-nums text-orange-700">
                  {formatRupiah(grandTotal)}
                </dd>
              </div>
            </dl>

            <p className="mt-2 text-xs text-neutral-600">
              {shippingEstimate.isCalculated
                ? BUSINESS_MESSAGES.shippingEstimateDisclaimer
                : BUSINESS_MESSAGES.shippingDetailNote}
            </p>
          </div>
        )}

        {previewMessage && (
          <div className="pt-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-neutral-900">
                  Pratinjau Pesan WhatsApp
                </h3>
              </div>
              <span className="text-xs tabular-nums text-neutral-600">
                {previewMessage.length} karakter
              </span>
            </div>

            <pre className="mt-2 whitespace-pre-wrap break-words rounded-xl border border-neutral-200 bg-neutral-50 p-4 font-sans text-sm leading-relaxed text-neutral-900">
              {previewMessage}
            </pre>
          </div>
        )}

        {savedFeedback && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Estimasi berhasil disimpan ke riwayat lokal Anda.</span>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          {canSendWhatsApp ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppLinkClick}
              aria-label="Kirim Pesan & Estimasi via WhatsApp"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 ease-out motion-reduce:transition-none sm:w-auto hover:bg-orange-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Kirim via WhatsApp</span>
            </a>
          ) : (
            <button
              type="submit"
              disabled={!isFormUnlocked}
              aria-label="Kirim Pesan & Estimasi via WhatsApp"
              className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors duration-150 ease-out motion-reduce:transition-none sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${
                isFormUnlocked
                  ? 'bg-orange-700 text-white hover:bg-orange-800'
                  : 'cursor-not-allowed bg-neutral-200 text-neutral-500'
              }`}
            >
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Kirim via WhatsApp</span>
            </button>
          )}

          <button
            type="button"
            disabled={!isFormUnlocked}
            onClick={handleSaveHistoryClick}
            className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-out motion-reduce:transition-none sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${
              isFormUnlocked
                ? 'border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100'
                : 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-500'
            }`}
          >
            <BookmarkCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Simpan Estimasi</span>
          </button>
        </div>
      </form>
    </section>
  );
}
