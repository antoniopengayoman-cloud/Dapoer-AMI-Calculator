/* Definisi tipe data untuk katalog, konfigurasi paket, keranjang, dan validasi Dapoer AMI */

export type CategoryId = 'catering' | 'snack' | 'warung';

export interface Category {
  id: CategoryId;
  name: string;
  minOrderQty: number;
  moqShortLabel: string;
  description: string;
}

export interface MenuItem {
  id: string;
  categoryId: CategoryId;
  subCategory: string;
  name: string;
  price: number;
  unitNote?: string;
  description: string;
  isBestSeller: boolean;
  isCustomizable: boolean;
  requiredLaukCount: 0 | 3 | 4;
  leadTimeNote?: string;
  servingTip: string;
  isVisible: boolean;
}

export type OptionGroupId = 'nasi' | 'lauk_1' | 'lauk_2' | 'lauk_3' | 'lauk_4';

export interface PackageOptionGroup {
  groupId: OptionGroupId;
  groupName: string;
  shortLabel: string;
  options: string[];
}

export interface PackageSelection {
  nasi: string;
  laukList: string[];
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  categoryId: CategoryId;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedOptions?: PackageSelection;
  optionSummary?: string;
  subtotal: number;
  leadTimeNote?: string;
}

export type ShippingZoneId =
  | 'admin-confirm'
  | 'danareksa'
  | 'jakpus'
  | 'jaksel'
  | 'jakbar'
  | 'jaktim'
  | 'jakut'
  | 'custom-distance';

export interface ShippingZoneOption {
  id: ShippingZoneId;
  label: string;
  areaDetail: string;
  flatFee: number;
}

export interface ShippingEstimate {
  zoneId: ShippingZoneId;
  zoneLabel: string;
  isCalculated: boolean;
  shippingCost: number;
  distanceKm: number | null;
  isDistanceValid: boolean;
  distanceError?: string;
}

export interface OrderInquiry {
  customerName: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  shippingZoneId: ShippingZoneId;
  shippingDistanceKm: string;
  notes: string;
}

export interface InquiryErrors {
  customerName?: string;
  deliveryAddress?: string;
  shippingDistanceKm?: string;
}

export interface MoqEvaluation {
  categoryId: CategoryId;
  totalQty: number;
  minOrderQty: number;
  isMoqValid: boolean;
  remainingQty: number;
  statusMessage: string;
}

export interface LeadTimeEvaluation {
  hasBandungItem: boolean;
  mandatoryNote: string | null;
  isDateTooSoon: boolean;
  dateWarningMessage: string | null;
}

export interface TotalsSummary {
  totalQty: number;
  totalEstimatedPrice: number;
  shippingCost: number;
}

export interface PendingCartAddition {
  menuItem: MenuItem;
  quantity: number;
  selectedOptions?: PackageSelection;
  optionSummary?: string;
}

export interface OrderHistoryEntry {
  id: string;
  savedAtIso: string;
  categoryId: CategoryId;
  categoryName: string;
  items: CartItem[];
  totalQty: number;
  totalEstimatedPrice: number;
  hasBandungItem: boolean;
  inquiry: OrderInquiry;
  whatsappMessage: string;
}
