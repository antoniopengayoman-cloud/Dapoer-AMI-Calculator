/* Modal konfigurator pemilihan nasi dan 3 atau 4 lauk untuk Lunch Box & Bento (FT-03 / BL-03 / AC-02) */
import {AlertCircle, Check, Minus, Plus, X} from 'lucide-react';
import {useEffect, useState} from 'react';
import {BUSINESS_MESSAGES, PACKAGE_OPTION_GROUPS} from '../config.ts';
import {validateLunchBoxSelection} from '../lib/calculator.ts';
import {formatRupiah} from '../lib/format.ts';
import type {MenuItem, PackageSelection} from '../types.ts';

interface LunchBoxConfiguratorModalProps {
  menuItem: MenuItem | null;
  onClose: () => void;
  onSaveToCart: (
    menuItem: MenuItem,
    quantity: number,
    selection: PackageSelection,
    optionSummary: string,
  ) => void;
}

export function LunchBoxConfiguratorModal({
  menuItem,
  onClose,
  onSaveToCart,
}: LunchBoxConfiguratorModalProps) {
  const [selectedNasi, setSelectedNasi] = useState('');
  const [lauk1, setLauk1] = useState('');
  const [lauk2, setLauk2] = useState('');
  const [lauk3, setLauk3] = useState('');
  const [lauk4, setLauk4] = useState('');
  const [flexibleLaukList, setFlexibleLaukList] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [showValidationHint, setShowValidationHint] = useState(false);

  useEffect(() => {
    setSelectedNasi('');
    setLauk1('');
    setLauk2('');
    setLauk3('');
    setLauk4('');
    setFlexibleLaukList([]);
    setQuantity(1);
    setShowValidationHint(false);
  }, [menuItem]);

  if (!menuItem) {
    return null;
  }

  const isSpecial1 = menuItem.requiredLaukCount === 3;

  const validation = validateLunchBoxSelection(
    menuItem,
    selectedNasi,
    lauk1,
    lauk2,
    lauk3,
    lauk4,
    flexibleLaukList,
  );

  const toggleFlexibleLauk = (option: string) => {
    setShowValidationHint(true);
    setFlexibleLaukList((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      }
      if (prev.length >= 2) {
        return prev;
      }
      return [...prev, option];
    });
  };

  const handleSave = () => {
    setShowValidationHint(true);
    if (!validation.isValid || !validation.selection || !validation.optionSummary) {
      return;
    }
    onSaveToCart(menuItem, quantity, validation.selection, validation.optionSummary);
  };

  const renderSingleChoiceGroup = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void,
  ) => (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-neutral-900">
        {title}
      </legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedValue === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                setShowValidationHint(true);
                onSelect(option);
              }}
              className={`flex min-h-[44px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${
                isSelected
                  ? 'border-orange-700 bg-orange-50 font-medium text-neutral-900'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>{option}</span>
              {isSelected && (
                <Check className="h-4 w-4 shrink-0 text-orange-700" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );

  const flexibleGroups = [
    PACKAGE_OPTION_GROUPS.lauk_2,
    PACKAGE_OPTION_GROUPS.lauk_3,
    PACKAGE_OPTION_GROUPS.lauk_4,
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="configurator-modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/50 sm:items-center sm:p-4"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-t-2xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)] sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4">
          <div>
            <h2
              id="configurator-modal-title"
              className="text-lg font-semibold text-neutral-900"
            >
              {menuItem.name}
            </h2>
            <p className="mt-0.5 text-sm text-neutral-600">
              <span className="font-semibold tabular-nums text-neutral-900">
                {formatRupiah(menuItem.price)}
              </span>
              <span> per porsi · {BUSINESS_MESSAGES.sambalIncludedLabel}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup konfigurator"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-4">
          {renderSingleChoiceGroup(
            PACKAGE_OPTION_GROUPS.nasi.groupName,
            PACKAGE_OPTION_GROUPS.nasi.options,
            selectedNasi,
            setSelectedNasi,
          )}

          {renderSingleChoiceGroup(
            PACKAGE_OPTION_GROUPS.lauk_1.groupName,
            PACKAGE_OPTION_GROUPS.lauk_1.options,
            lauk1,
            setLauk1,
          )}

          {isSpecial1 ? (
            <fieldset className="space-y-3">
              <legend className="text-sm font-semibold text-neutral-900">
                Lauk Pendamping Bebas (Pilih 2 dari Sayur / Pendamping / Gorengan —{' '}
                <span className="tabular-nums text-orange-700">
                  {flexibleLaukList.length}/2
                </span>
                )
              </legend>
              {flexibleGroups.map((group) => (
                <div key={group.groupId} className="space-y-2">
                  <p className="text-xs font-medium text-neutral-600">
                    {group.shortLabel}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {group.options.map((option) => {
                      const isSelected = flexibleLaukList.includes(option);
                      const isLimitReached = !isSelected && flexibleLaukList.length >= 2;
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={isSelected}
                          disabled={isLimitReached}
                          onClick={() => toggleFlexibleLauk(option)}
                          className={`flex min-h-[44px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${
                            isSelected
                              ? 'border-orange-700 bg-orange-50 font-medium text-neutral-900'
                              : isLimitReached
                                ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400'
                                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                          }`}
                        >
                          <span>{option}</span>
                          {isSelected && (
                            <Check className="h-4 w-4 shrink-0 text-orange-700" aria-hidden="true" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </fieldset>
          ) : (
            <>
              {renderSingleChoiceGroup(
                `${PACKAGE_OPTION_GROUPS.lauk_2.groupName} (Pilih 1)`,
                PACKAGE_OPTION_GROUPS.lauk_2.options,
                lauk2,
                setLauk2,
              )}
              {renderSingleChoiceGroup(
                `${PACKAGE_OPTION_GROUPS.lauk_3.groupName} (Pilih 1)`,
                PACKAGE_OPTION_GROUPS.lauk_3.options,
                lauk3,
                setLauk3,
              )}
              {renderSingleChoiceGroup(
                `${PACKAGE_OPTION_GROUPS.lauk_4.groupName} (Pilih 1)`,
                PACKAGE_OPTION_GROUPS.lauk_4.options,
                lauk4,
                setLauk4,
              )}
            </>
          )}
        </div>

        <div className="border-t border-neutral-200 px-6 py-4">
          {!validation.isValid && showValidationHint && validation.errorMessage && (
            <div
              role="status"
              className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{validation.errorMessage}</span>
            </div>
          )}

          {!showValidationHint && !validation.isValid && (
            <p className="mb-3 text-sm text-neutral-600">
              Wajib memilih 1 nasi dan {menuItem.requiredLaukCount} lauk sebelum menyimpan.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">Jumlah porsi:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Kurangi jumlah porsi paket"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="min-w-[36px] text-center text-base font-semibold tabular-nums text-neutral-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Tambah jumlah porsi paket"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={!validation.isValid}
              onClick={handleSave}
              className={`min-h-[44px] rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700 ${
                validation.isValid
                  ? 'bg-orange-700 hover:bg-orange-800'
                  : 'cursor-not-allowed bg-neutral-300 text-neutral-600'
              }`}
            >
              Simpan ke Keranjang ({formatRupiah(menuItem.price * quantity)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
