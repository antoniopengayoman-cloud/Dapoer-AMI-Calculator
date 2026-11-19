/* Seluruh logika perhitungan, validasi kategori, MOQ, konfigurasi paket, H-2 Bandung, dan generator template WhatsApp */
import {
  BANDUNG_ITEM_ID,
  BANDUNG_LEAD_TIME_DAYS,
  BRAND_INFO,
  BUSINESS_MESSAGES,
  CATEGORIES,
  DISTANCE_SHIPPING_RATE,
  SHIPPING_ZONES,
} from '../config.ts';
import type {
  CartItem,
  CategoryId,
  InquiryErrors,
  LeadTimeEvaluation,
  MenuItem,
  MoqEvaluation,
  OrderInquiry,
  PackageSelection,
  ShippingEstimate,
  ShippingZoneId,
  TotalsSummary,
} from '../types.ts';
import {
  formatDecimal,
  formatIndonesianDate,
  formatIndonesianTime,
  formatRupiah,
  getTodayIsoDate,
} from './format.ts';

export function isCategoryConflict(cart: CartItem[], targetCategoryId: CategoryId): boolean {
  if (cart.length === 0) {
    return false;
  }
  return cart[0].categoryId !== targetCategoryId;
}

export function filterMenuItems(
  items: MenuItem[],
  activeSubCategory: string,
  searchQuery: string,
): MenuItem[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    if (!item.isVisible) {
      return false;
    }
    if (activeSubCategory !== 'Semua' && item.subCategory !== activeSubCategory) {
      return false;
    }
    if (normalizedQuery && !item.name.toLowerCase().includes(normalizedQuery)) {
      return false;
    }
    return true;
  });
}

export function evaluateMoq(categoryId: CategoryId, cart: CartItem[]): MoqEvaluation {
  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const minOrderQty = category.minOrderQty;

  if (totalQty === 0) {
    return {
      categoryId,
      totalQty: 0,
      minOrderQty,
      isMoqValid: false,
      remainingQty: minOrderQty,
      statusMessage:
        minOrderQty > 1
          ? `Minimal pemesanan ${category.name} adalah ${minOrderQty} porsi.`
          : 'Pilih minimal 1 porsi menu.',
    };
  }

  if (minOrderQty > 1) {
    const isMoqValid = totalQty >= minOrderQty;
    const remainingQty = Math.max(0, minOrderQty - totalQty);
    const shortCategoryName =
      categoryId === 'catering' ? 'Catering' : categoryId === 'snack' ? 'Snack' : category.name;

    return {
      categoryId,
      totalQty,
      minOrderQty,
      isMoqValid,
      remainingQty,
      statusMessage: isMoqValid
        ? `Minimal ${minOrderQty} porsi terpenuhi`
        : `Minimal pemesanan kategori ${shortCategoryName} adalah ${minOrderQty} porsi. Tambah ${remainingQty} porsi lagi.`,
    };
  }

  return {
    categoryId,
    totalQty,
    minOrderQty,
    isMoqValid: totalQty >= 1,
    remainingQty: 0,
    statusMessage: 'Tanpa minimal porsi (siap dipesan)',
  };
}

export function validateLunchBoxSelection(
  menuItem: MenuItem,
  selectedNasi: string,
  lauk1: string,
  lauk2: string,
  lauk3: string,
  lauk4: string,
  flexibleLaukList: string[],
): {
  isValid: boolean;
  errorMessage: string | null;
  selection: PackageSelection | null;
  optionSummary: string | null;
} {
  if (!menuItem.isCustomizable) {
    return {isValid: true, errorMessage: null, selection: null, optionSummary: null};
  }

  if (menuItem.requiredLaukCount === 3) {
    const totalPickedLauk = (lauk1 ? 1 : 0) + flexibleLaukList.length;
    if (!selectedNasi || !lauk1 || flexibleLaukList.length !== 2) {
      return {
        isValid: false,
        errorMessage: `Wajib melengkapi 1 pilihan nasi dan 3 pilihan lauk (saat ini baru ${totalPickedLauk} lauk).`,
        selection: null,
        optionSummary: null,
      };
    }
    const laukList = [lauk1, ...flexibleLaukList];
    const optionSummary = `${selectedNasi} | ${laukList.join(', ')} + Sambal Kecombrang`;
    return {
      isValid: true,
      errorMessage: null,
      selection: {nasi: selectedNasi, laukList},
      optionSummary,
    };
  }

  const laukSlots = [lauk1, lauk2, lauk3, lauk4].filter(Boolean);
  if (!selectedNasi || laukSlots.length !== 4) {
    return {
      isValid: false,
      errorMessage: 'Wajib melengkapi 1 pilihan nasi dan 4 pilihan lauk.',
      selection: null,
      optionSummary: null,
    };
  }

  const optionSummary = `${selectedNasi} | ${laukSlots.join(', ')} + Sambal Kecombrang`;
  return {
    isValid: true,
    errorMessage: null,
    selection: {nasi: selectedNasi, laukList: laukSlots},
    optionSummary,
  };
}

function parseIsoDateLocal(isoDate: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  return Date.UTC(year, month, day);
}

export function checkBandungLeadTime(
  cart: CartItem[],
  deliveryDate: string,
  todayIsoDate: string = getTodayIsoDate(),
): LeadTimeEvaluation {
  const hasBandungItem = cart.some((item) => item.menuItemId === BANDUNG_ITEM_ID);
  if (!hasBandungItem) {
    return {
      hasBandungItem: false,
      mandatoryNote: null,
      isDateTooSoon: false,
      dateWarningMessage: null,
    };
  }

  let isDateTooSoon = false;
  let dateWarningMessage: string | null = null;

  if (deliveryDate.trim()) {
    const targetUtc = parseIsoDateLocal(deliveryDate);
    const todayUtc = parseIsoDateLocal(todayIsoDate);
    if (targetUtc !== null && todayUtc !== null) {
      const diffDays = (targetUtc - todayUtc) / 86400000;
      if (diffDays < BANDUNG_LEAD_TIME_DAYS) {
        isDateTooSoon = true;
        dateWarningMessage = BUSINESS_MESSAGES.bandungDateWarning;
      }
    }
  }

  return {
    hasBandungItem: true,
    mandatoryNote: BUSINESS_MESSAGES.bandungMandatoryNote,
    isDateTooSoon,
    dateWarningMessage,
  };
}

export function calculateTotals(cart: CartItem[]): TotalsSummary {
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalEstimatedPrice = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return {
    totalQty,
    totalEstimatedPrice,
    shippingCost: 0,
  };
}

export function buildCartItemId(menuItemId: string, optionSummary?: string): string {
  if (!optionSummary) {
    return menuItemId;
  }
  return `${menuItemId}::${optionSummary}`;
}

export function upsertCartItem(
  cart: CartItem[],
  menuItem: MenuItem,
  quantity: number,
  selectedOptions?: PackageSelection,
  optionSummary?: string,
): CartItem[] {
  const safeQty = Math.max(1, Math.round(quantity));
  const cartItemId = buildCartItemId(menuItem.id, optionSummary);
  const existingIndex = cart.findIndex((item) => item.cartItemId === cartItemId);

  if (existingIndex >= 0) {
    return cart.map((item, idx) => {
      if (idx !== existingIndex) {
        return item;
      }
      const nextQty = item.quantity + safeQty;
      return {
        ...item,
        quantity: nextQty,
        subtotal: item.unitPrice * nextQty,
      };
    });
  }

  const nextItem: CartItem = {
    cartItemId,
    menuItemId: menuItem.id,
    categoryId: menuItem.categoryId,
    name: menuItem.name,
    unitPrice: menuItem.price,
    quantity: safeQty,
    selectedOptions,
    optionSummary,
    subtotal: menuItem.price * safeQty,
    leadTimeNote: menuItem.leadTimeNote,
  };

  return [...cart, nextItem];
}

export function updateCartItemQuantity(
  cart: CartItem[],
  cartItemId: string,
  delta: number,
): CartItem[] {
  return cart
    .map((item) => {
      if (item.cartItemId !== cartItemId) {
        return item;
      }
      const nextQty = item.quantity + delta;
      if (nextQty <= 0) {
        return null;
      }
      return {
        ...item,
        quantity: nextQty,
        subtotal: item.unitPrice * nextQty,
      };
    })
    .filter((item): item is CartItem => item !== null);
}

export function calculateShippingEstimate(
  zoneId: ShippingZoneId,
  distanceKmInput: string,
): ShippingEstimate {
  const zone = SHIPPING_ZONES.find((z) => z.id === zoneId) ?? SHIPPING_ZONES[0];

  if (zone.id === 'admin-confirm') {
    return {
      zoneId: zone.id,
      zoneLabel: zone.label,
      isCalculated: false,
      shippingCost: 0,
      distanceKm: null,
      isDistanceValid: true,
    };
  }

  if (zone.id !== 'custom-distance') {
    return {
      zoneId: zone.id,
      zoneLabel: zone.label,
      isCalculated: true,
      shippingCost: zone.flatFee,
      distanceKm: null,
      isDistanceValid: true,
    };
  }

  const normalized = distanceKmInput.trim().replace(',', '.');
  if (!normalized || !/^\d+(\.\d+)?$/.test(normalized)) {
    return {
      zoneId: zone.id,
      zoneLabel: zone.label,
      isCalculated: false,
      shippingCost: 0,
      distanceKm: null,
      isDistanceValid: false,
      distanceError: 'Masukkan jarak antara 0,1 sampai 60 km, contoh: 4,5.',
    };
  }

  const parsedKm = Number.parseFloat(normalized);
  if (!Number.isFinite(parsedKm) || parsedKm <= 0 || parsedKm > DISTANCE_SHIPPING_RATE.maxKm) {
    return {
      zoneId: zone.id,
      zoneLabel: zone.label,
      isCalculated: false,
      shippingCost: 0,
      distanceKm: null,
      isDistanceValid: false,
      distanceError: 'Masukkan jarak antara 0,1 sampai 60 km, contoh: 4,5.',
    };
  }

  const shippingCost =
    parsedKm <= DISTANCE_SHIPPING_RATE.freeUpToKm
      ? 0
      : Math.round(
          (DISTANCE_SHIPPING_RATE.baseFee + parsedKm * DISTANCE_SHIPPING_RATE.perKmFee) /
            DISTANCE_SHIPPING_RATE.roundTo,
        ) * DISTANCE_SHIPPING_RATE.roundTo;

  return {
    zoneId: zone.id,
    zoneLabel: `Jarak ${formatDecimal(parsedKm)} km`,
    isCalculated: true,
    shippingCost,
    distanceKm: parsedKm,
    isDistanceValid: true,
  };
}

export function validateOrderInquiry(inquiry: OrderInquiry): {
  isValid: boolean;
  trimmed: OrderInquiry;
  errors: InquiryErrors;
} {
  const zoneId: ShippingZoneId = inquiry.shippingZoneId ?? 'admin-confirm';
  const trimmed: OrderInquiry = {
    customerName: inquiry.customerName.trim(),
    deliveryDate: inquiry.deliveryDate.trim(),
    deliveryTime: inquiry.deliveryTime.trim(),
    deliveryAddress: inquiry.deliveryAddress.trim(),
    shippingZoneId: zoneId,
    shippingDistanceKm: (inquiry.shippingDistanceKm ?? '').trim(),
    notes: inquiry.notes.trim(),
  };

  const errors: InquiryErrors = {};

  if (trimmed.customerName.length < 2) {
    errors.customerName = 'Masukkan nama pemesan terlebih dahulu, contoh: Budi Santoso.';
  }

  if (trimmed.deliveryAddress.length < 5) {
    errors.deliveryAddress =
      'Masukkan alamat pengantaran area Jakarta, contoh: Menara Danareksa Lt. 5, Jl. Medan Merdeka Selatan No. 14.';
  }

  const shippingEstimate = calculateShippingEstimate(
    trimmed.shippingZoneId,
    trimmed.shippingDistanceKm,
  );
  if (!shippingEstimate.isDistanceValid && shippingEstimate.distanceError) {
    errors.shippingDistanceKm = shippingEstimate.distanceError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    trimmed,
    errors,
  };
}

function getLetterMarker(index: number): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  if (index < letters.length) {
    return `${letters[index]}.`;
  }
  return `${index + 1}.`;
}

export function buildWhatsAppMessage(
  inquiry: OrderInquiry,
  cart: CartItem[],
  categoryId: CategoryId,
): string {
  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];
  const totals = calculateTotals(cart);
  const leadTime = checkBandungLeadTime(cart, inquiry.deliveryDate);
  const shipping = calculateShippingEstimate(
    inquiry.shippingZoneId ?? 'admin-confirm',
    inquiry.shippingDistanceKm ?? '',
  );

  const formattedDate = formatIndonesianDate(inquiry.deliveryDate);
  const formattedTime = formatIndonesianTime(inquiry.deliveryTime);

  let dateTimeDisplay = 'Menyesuaikan (konfirmasi admin)';
  if (formattedDate && formattedTime) {
    dateTimeDisplay = `${formattedDate}, ${formattedTime}`;
  } else if (formattedDate) {
    dateTimeDisplay = formattedDate;
  } else if (formattedTime) {
    dateTimeDisplay = formattedTime;
  }

  const itemLines = cart
    .map((item, idx) => {
      const marker = getLetterMarker(idx);
      const variantPart = item.optionSummary ? ` (${item.optionSummary})` : '';
      const unitFormatted = formatRupiah(item.unitPrice);
      const subtotalFormatted = formatRupiah(item.unitPrice * item.quantity);
      return `${marker} ${item.name}${variantPart}\n   ${item.quantity} porsi x ${unitFormatted} = ${subtotalFormatted}`;
    })
    .join('\n');

  const notesParts: string[] = [];
  if (inquiry.notes.trim()) {
    notesParts.push(inquiry.notes.trim());
  }
  if (leadTime.hasBandungItem) {
    notesParts.push(BUSINESS_MESSAGES.bandungMandatoryNote);
  }
  if (categoryId === 'warung') {
    notesParts.push(BUSINESS_MESSAGES.warungStockNote);
  }

  const notesDisplay = notesParts.length > 0 ? notesParts.join(' | ') : '-';

  const pricingLines = shipping.isCalculated
    ? [
        `Total Porsi: ${totals.totalQty} porsi`,
        `Subtotal Menu: ${formatRupiah(totals.totalEstimatedPrice)}`,
        `Estimasi Ongkos Kirim (${shipping.zoneLabel}): ${formatRupiah(shipping.shippingCost)}`,
        `Estimasi Total Keseluruhan: ${formatRupiah(totals.totalEstimatedPrice + shipping.shippingCost)}`,
        '(Catatan: Biaya kirim di atas adalah estimasi awal dan akan dikonfirmasi ulang oleh admin)',
      ]
    : [
        `Total Porsi: ${totals.totalQty} porsi`,
        `Total Estimasi Harga: ${formatRupiah(totals.totalEstimatedPrice)}`,
        '(Catatan: Harga belum termasuk ongkos kirim)',
      ];

  return [
    'Halo Dapoer AMI! Saya ingin melakukan pemesanan / estimasi harga dengan rincian berikut:',
    '',
    `Kategori: ${category.name}`,
    `Nama Pemesan: ${inquiry.customerName.trim()}`,
    `Tanggal & Jam Kirim: ${dateTimeDisplay}`,
    `Alamat Pengantaran (Area Jakarta): ${inquiry.deliveryAddress.trim()}`,
    '',
    'Rincian Pesanan:',
    itemLines,
    '',
    ...pricingLines,
    '',
    `Catatan Tambahan: ${notesDisplay}`,
    '',
    'Mohon konfirmasi ketersediaan dan total beserta ongkirnya. Terima kasih!',
  ].join('\n');
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${BRAND_INFO.whatsappTarget}?text=${encodeURIComponent(message)}`;
}
