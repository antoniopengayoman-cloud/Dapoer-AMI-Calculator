/* Penyimpanan lokal berbasis satu kunci localStorage untuk keranjang, form, dan riwayat estimasi */
import type {
  CartItem,
  CategoryId,
  OrderHistoryEntry,
  OrderInquiry,
} from '../types.ts';

export const STORAGE_KEY = 'dapoer_ami_state_v1';
export const MAX_HISTORY_ENTRIES = 20;

export interface PersistedAppState {
  activeCategoryId: CategoryId;
  cart: CartItem[];
  inquiry: OrderInquiry;
  history: OrderHistoryEntry[];
}

const DEFAULT_INQUIRY: OrderInquiry = {
  customerName: '',
  deliveryDate: '',
  deliveryTime: '',
  deliveryAddress: '',
  notes: '',
};

const VALID_CATEGORIES = new Set<CategoryId>(['catering', 'snack', 'warung']);

function sanitizeCartItems(rawCart: unknown): CartItem[] {
  if (!Array.isArray(rawCart)) {
    return [];
  }
  return rawCart.filter(
    (item): item is CartItem =>
      Boolean(item) &&
      typeof item === 'object' &&
      typeof item.cartItemId === 'string' &&
      typeof item.menuItemId === 'string' &&
      typeof item.categoryId === 'string' &&
      VALID_CATEGORIES.has(item.categoryId as CategoryId) &&
      typeof item.name === 'string' &&
      typeof item.unitPrice === 'number' &&
      item.unitPrice > 0 &&
      typeof item.quantity === 'number' &&
      item.quantity >= 1,
  );
}

function sanitizeInquiry(rawInquiry: unknown): OrderInquiry {
  if (!rawInquiry || typeof rawInquiry !== 'object') {
    return DEFAULT_INQUIRY;
  }
  const obj = rawInquiry as Partial<OrderInquiry>;

  return {
    customerName: typeof obj.customerName === 'string' ? obj.customerName : '',
    deliveryDate: typeof obj.deliveryDate === 'string' ? obj.deliveryDate : '',
    deliveryTime: typeof obj.deliveryTime === 'string' ? obj.deliveryTime : '',
    deliveryAddress: typeof obj.deliveryAddress === 'string' ? obj.deliveryAddress : '',
    notes: typeof obj.notes === 'string' ? obj.notes : '',
  };
}

function sanitizeHistoryEntries(rawHistory: unknown): OrderHistoryEntry[] {
  if (!Array.isArray(rawHistory)) {
    return [];
  }

  return rawHistory
    .filter((entry): entry is OrderHistoryEntry => {
      if (!entry || typeof entry !== 'object') {
        return false;
      }
      const candidate = entry as Partial<OrderHistoryEntry>;
      if (
        typeof candidate.id !== 'string' ||
        typeof candidate.savedAtIso !== 'string' ||
        typeof candidate.categoryId !== 'string' ||
        !VALID_CATEGORIES.has(candidate.categoryId as CategoryId) ||
        typeof candidate.categoryName !== 'string' ||
        typeof candidate.totalQty !== 'number' ||
        candidate.totalQty < 1 ||
        typeof candidate.totalEstimatedPrice !== 'number' ||
        candidate.totalEstimatedPrice < 0 ||
        typeof candidate.whatsappMessage !== 'string'
      ) {
        return false;
      }
      const validItems = sanitizeCartItems(candidate.items);
      return validItems.length > 0;
    })
    .map((entry) => ({
      ...entry,
      items: sanitizeCartItems(entry.items),
      inquiry: sanitizeInquiry(entry.inquiry),
      hasBandungItem: Boolean(entry.hasBandungItem),
    }))
    .slice(0, MAX_HISTORY_ENTRIES);
}

export function parsePersistedAppState(raw: string | null): PersistedAppState {
  const fallback: PersistedAppState = {
    activeCategoryId: 'catering',
    cart: [],
    inquiry: DEFAULT_INQUIRY,
    history: [],
  };

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    const activeCategoryId =
      parsed.activeCategoryId && VALID_CATEGORIES.has(parsed.activeCategoryId)
        ? parsed.activeCategoryId
        : 'catering';

    const safeCart = sanitizeCartItems(parsed.cart);
    const homogenizedCart =
      safeCart.length > 0
        ? safeCart.filter((item) => item.categoryId === safeCart[0].categoryId)
        : [];

    return {
      activeCategoryId: homogenizedCart.length > 0 ? homogenizedCart[0].categoryId : activeCategoryId,
      cart: homogenizedCart,
      inquiry: sanitizeInquiry(parsed.inquiry),
      history: sanitizeHistoryEntries(parsed.history),
    };
  } catch {
    return fallback;
  }
}

export function loadAppState(): PersistedAppState {
  try {
    return parsePersistedAppState(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return {
      activeCategoryId: 'catering',
      cart: [],
      inquiry: DEFAULT_INQUIRY,
      history: [],
    };
  }
}

export function saveAppState(state: PersistedAppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Abaikan apabila mode privat membatasi penyimpanan lokal
  }
}

export function upsertHistoryEntry(
  history: OrderHistoryEntry[],
  newEntry: OrderHistoryEntry,
): OrderHistoryEntry[] {
  if (history.length > 0 && history[0].whatsappMessage === newEntry.whatsappMessage) {
    const updatedHead: OrderHistoryEntry = {
      ...history[0],
      savedAtIso: newEntry.savedAtIso,
    };
    return [updatedHead, ...history.slice(1)].slice(0, MAX_HISTORY_ENTRIES);
  }
  return [newEntry, ...history].slice(0, MAX_HISTORY_ENTRIES);
}
