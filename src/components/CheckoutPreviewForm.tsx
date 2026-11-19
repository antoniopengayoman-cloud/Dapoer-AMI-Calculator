/* Formulir data pengiriman, pratinjau pesan WhatsApp, dan simpan riwayat (FT-06, FT-07, FT-09) */
import {
  AlertTriangle,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Lock,
  MapPin,
  MessageCircle,
  Package,
  StickyNote,
  Wallet,
} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {BUSINESS_MESSAGES} from '../config.ts';
import {
  buildWhatsAppMessage,
  buildWhatsAppPreviewData,
  buildWhatsAppUrl,
  validateOrderInquiry,
} from '../lib/calculator.ts';
import type {
  CartItem,
  CategoryId,
  InquiryErrors,
  LeadTimeEvaluation,
  MoqEvaluation,
  OrderInquiry,
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

  const effectiveCategoryId = cart.length > 0 ? cart[0].categoryId : activeCategoryId;
  const isFormUnlocked = cart.length > 0 && moq.isMoqValid;

  const previewValidation = validateOrderInquiry(inquiry);
  const canSendWhatsApp = isFormUnlocked && previewValidation.isValid;
  const previewData = canSendWhatsApp
    ? buildWhatsAppPreviewData(previewValidation.trimmed, cart, effectiveCategoryId)
    : null;
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

  const runValidation = (): OrderInquiry | null => {
    const result = validateOrderInquiry(inquiry);
    onChangeInquiry(result.trimmed);

    if (!result.isValid) {
      setErrors(result.errors);
      if (result.errors.customerName && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (result.errors.deliveryAddress && addressInputRef.current) {
        addressInputRef.current.focus();
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
          Data Pengiriman &amp; Pratinjau WhatsApp
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Lengkapi alamat Jakarta Anda untuk menyiapkan pesan pesanan ke admin.
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
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-900"
            >
              <Calendar className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
              <span>Tanggal Kirim (opsional)</span>
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
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-900"
            >
              <Clock className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
              <span>Jam Kirim (opsional)</span>
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
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-900"
          >
            <MapPin className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
            <span>
              Alamat Pengantaran Area Jakarta <span className="text-red-700">*</span>
            </span>
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

        <div>
          <label
            htmlFor="notes"
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-900"
          >
            <StickyNote className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden="true" />
            <span>Catatan Tambahan (opsional)</span>
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

        {previewData && (
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

            <div className="mt-2 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-900">
              <p>{previewData.greeting}</p>

              <div className="space-y-1.5">
                <p>Kategori: {previewData.categoryName}</p>
                <p>Nama Pemesan: {previewData.customerName}</p>
                <p className="flex items-start gap-2">
                  <Calendar
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-700"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-medium">Tanggal &amp; Jam Kirim:</span>{' '}
                    {previewData.dateTimeDisplay}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-700"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-medium">Alamat Pengantaran (Area Jakarta):</span>{' '}
                    {previewData.deliveryAddress}
                  </span>
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 font-medium text-neutral-900">
                  <ClipboardList
                    className="h-4 w-4 shrink-0 text-orange-700"
                    aria-hidden="true"
                  />
                  <span>Rincian Pesanan:</span>
                </p>
                <ul className="mt-1 space-y-1">
                  {previewData.items.map((item) => (
                    <li key={`${item.marker}-${item.titleLine}`}>
                      <div>
                        {item.marker} {item.titleLine}
                      </div>
                      <div className="pl-4 tabular-nums">{item.priceLine}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <p className="flex items-start gap-2">
                  <Package
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-700"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-medium">Total Porsi:</span>{' '}
                    <span className="tabular-nums">{previewData.totalQty} porsi</span>
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Wallet
                    className="mt-0.5 h-4 w-4 shrink-0 text-orange-700"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="font-medium">Total Estimasi Harga:</span>{' '}
                    <span className="tabular-nums">
                      {previewData.totalEstimatedPriceFormatted}
                    </span>
                  </span>
                </p>
                <p>{previewData.shippingNote}</p>
              </div>

              <p className="flex items-start gap-2">
                <StickyNote
                  className="mt-0.5 h-4 w-4 shrink-0 text-orange-700"
                  aria-hidden="true"
                />
                <span>
                  <span className="font-medium">Catatan Tambahan:</span>{' '}
                  {previewData.notesDisplay}
                </span>
              </p>

              <p>{previewData.closing}</p>
            </div>

            <p className="mt-2 text-xs text-neutral-600">
              {BUSINESS_MESSAGES.shippingDetailNote}
            </p>
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
