/* Fungsi pemformatan tunggal untuk Rupiah, angka desimal, tanggal, jam, dan nomor telepon */

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const absFormatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return rounded < 0 ? `-Rp ${absFormatted}` : `Rp ${absFormatted}`;
}

export function formatDecimal(value: number): string {
  const fixed = Number.isInteger(value) ? value.toString() : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return fixed.replace('.', ',');
}

export function formatIndonesianDate(isoDate: string): string {
  const trimmed = isoDate.trim();
  if (!trimmed) {
    return '';
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const monthName = INDONESIAN_MONTHS[monthIndex];
  if (!monthName || day < 1 || day > 31) {
    return trimmed;
  }
  return `${day} ${monthName} ${year}`;
}

export function formatIndonesianTime(timeValue: string): string {
  const trimmed = timeValue.trim();
  if (!trimmed) {
    return '';
  }
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) {
    return trimmed;
  }
  const hour = match[1].padStart(2, '0');
  const minute = match[2];
  return `${hour}.${minute} WIB`;
}

export function formatIndonesianPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (!digits) {
    return '';
  }
  if (digits.startsWith('62')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  return `62${digits}`;
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatIndonesianTimestamp(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    return isoTimestamp;
  }
  const day = date.getDate();
  const monthName = INDONESIAN_MONTHS[date.getMonth()] ?? '';
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${monthName} ${year}, ${hour}.${minute} WIB`;
}
