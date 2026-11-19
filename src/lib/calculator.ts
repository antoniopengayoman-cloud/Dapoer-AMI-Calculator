/* Seluruh logika perhitungan, validasi kategori, MOQ, konfigurasi paket, H-2 Bandung, dan generator template WhatsApp */
import {
  BANDUNG_ITEM_ID,
  BANDUNG_LEAD_TIME_DAYS,
  BRAND_INFO,
  BUSINESS_MESSAGES,
  CATEGORIES,
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
  TotalsSummary,
} from '../types.ts';
import {
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

export function validateOrderInquiry(inquiry: OrderInquiry): {
  isValid: boolean;
  trimmed: OrderInquiry;
  errors: InquiryErrors;
} {
  const trimmed: OrderInquiry = {
    customerName: inquiry.customerName.trim(),
    deliveryDate: inquiry.deliveryDate.trim(),
    deliveryTime: inquiry.deliveryTime.trim(),
    deliveryAddress: inquiry.deliveryAddress.trim(),
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

export interface WhatsAppPreviewItem {
  marker: string;
  titleLine: string;
  priceLine: string;
}

export interface WhatsAppPreviewData {
  greeting: string;
  categoryName: string;
  customerName: string;
  dateTimeDisplay: string;
  deliveryAddress: string;
  items: WhatsAppPreviewItem[];
  totalQty: number;
  totalEstimatedPriceFormatted: string;
  shippingNote: string;
  notesDisplay: string;
  closing: string;
}

export function buildWhatsAppPreviewData(
  inquiry: OrderInquiry,
  cart: CartItem[],
  categoryId: CategoryId,
): WhatsAppPreviewData {
  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];
  const totals = calculateTotals(cart);
  const leadTime = checkBandungLeadTime(cart, inquiry.deliveryDate);

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

  const items: WhatsAppPreviewItem[] = cart.map((item, idx) => {
    const marker = getLetterMarker(idx);
    const variantPart = item.optionSummary ? ` (${item.optionSummary})` : '';
    const unitFormatted = formatRupiah(item.unitPrice);
    const subtotalFormatted = formatRupiah(item.unitPrice * item.quantity);
    return {
      marker,
      titleLine: `${item.name}${variantPart}`,
      priceLine: `${item.quantity} porsi x ${unitFormatted} = ${subtotalFormatted}`,
    };
  });

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

  return {
    greeting:
      'Halo Dapoer AMI! Saya ingin melakukan pemesanan / estimasi harga dengan rincian berikut:',
    categoryName: category.name,
    customerName: inquiry.customerName.trim(),
    dateTimeDisplay,
    deliveryAddress: inquiry.deliveryAddress.trim(),
    items,
    totalQty: totals.totalQty,
    totalEstimatedPriceFormatted: formatRupiah(totals.totalEstimatedPrice),
    shippingNote:
      '(Catatan: Harga belum termasuk ongkos kirim; konfirmasi ongkir via admin sesuai jarak pengantaran area Jakarta)',
    notesDisplay: notesParts.length > 0 ? notesParts.join(' | ') : '-',
    closing: 'Mohon konfirmasi ketersediaan dan total beserta ongkirnya. Terima kasih!',
  };
}

export function buildWhatsAppMessage(
  inquiry: OrderInquiry,
  cart: CartItem[],
  categoryId: CategoryId,
): string {
  const data = buildWhatsAppPreviewData(inquiry, cart, categoryId);
  const itemLines = data.items
    .map((item) => `${item.marker} ${item.titleLine}\n   ${item.priceLine}`)
    .join('\n');

  return [
    data.greeting,
    '',
    `Kategori: ${data.categoryName}`,
    `Nama Pemesan: ${data.customerName}`,
    `Tanggal & Jam Kirim: ${data.dateTimeDisplay}`,
    `Alamat Pengantaran (Area Jakarta): ${data.deliveryAddress}`,
    '',
    'Rincian Pesanan:',
    itemLines,
    '',
    `Total Porsi: ${data.totalQty} porsi`,
    `Total Estimasi Harga: ${data.totalEstimatedPriceFormatted}`,
    data.shippingNote,
    '',
    `Catatan Tambahan: ${data.notesDisplay}`,
    '',
    data.closing,
  ].join('\n');
}

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${BRAND_INFO.whatsappTarget}?text=${encodeURIComponent(message)}`;
}

export function buildAdminChatMessage(categoryId?: CategoryId): string {
  if (!categoryId) {
    return BUSINESS_MESSAGES.adminChatGreeting;
  }
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) {
    return BUSINESS_MESSAGES.adminChatGreeting;
  }
  return `${BUSINESS_MESSAGES.adminChatGreeting} (Kategori: ${category.name})`;
}

export function buildAdminWhatsAppUrl(categoryId?: CategoryId): string {
  return buildWhatsAppUrl(buildAdminChatMessage(categoryId));
}

