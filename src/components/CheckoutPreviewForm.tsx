/* Formulir data pengiriman area Jakarta, pratinjau pesan WhatsApp, simpan riwayat lokal, dan tombol Kirim via WhatsApp (FT-06, FT-07, FT-09) */
import {AlertTriangle, BookmarkCheck, CheckCircle2, Clock, Lock, MessageCircle} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {
  buildWhatsAppMessage,
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
          Data Pengiriman &amp; Kirim WhatsApp
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Lengkapi nama dan alamat pengantaran Anda untuk mengirim atau menyimpan estimasi.
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

        {previewMessage && (
          <div className="pt-2">
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
