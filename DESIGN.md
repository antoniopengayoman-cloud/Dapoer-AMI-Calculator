# DESIGN.md — Keputusan Desain & Token Visual Dapoer AMI

Dokumen ini mencatat keputusan desain antarmuka yang telah disetujui untuk aplikasi **Katalog Produk & Kalkulator Estimasi Dapoer AMI**.

## Keputusan Desain

| Keputusan | Pilihan Disetujui |
| :--- | :--- |
| Kesan visual & font | Ramah dan hangat (`Plus Jakarta Sans`, bobot 400, 500, 600 via npm `@fontsource/plus-jakarta-sans`) |
| Warna aksen | Oranye (`orange-700` utama, `orange-800` hover, `orange-50` latar terpilih) |
| Sapaan pengguna | Anda |
| Susunan halaman | Satu halaman bergulir (mobile-first mulai 360 px, grid responsif di layar besar) |
| Posisi aksi utama | Bar kalkulator menempel di bagian bawah layar |
| Tampilan gambar menu | Placeholder kotak netral (`bg-neutral-100`) dengan ikon `lucide-react` (`text-neutral-400`) dan nama menu |
| Logo merek | Logo resmi `Dapoer AMI` (`/assets/aistudio/Dapoer_AMI_LOGO_440421b5.webp`) di bagian atas kiri header |

## Token Visual & Aturan Gaya

### Permukaan & Bentuk
- **Latar halaman:** `bg-neutral-50`
- **Kartu & panel:** `bg-white` (tanpa kartu di dalam kartu, dipisahkan dengan ruang lega dan kontras permukaan)
- **Garis tepi:** `border-neutral-200` khusus untuk input, tabel, dan pemisah bagian
- **Sudut membulat:** `rounded-2xl` (kartu/panel), `rounded-xl` (tombol/input), `rounded-full` (badge)
- **Proporsi kartu menu:** Placeholder kotak `aspect-[16/9]` yang ringkas dan proporsional agar lebih banyak menu terlihat tanpa menggulir berlebih
- **Bayangan melayang:** `shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.08)]` hanya untuk elemen mengambang/modal/bar bawah
- **Skala spasi:** Memakai skala Tailwind `1, 2, 3, 4, 6, 8, 12`

### Warna & Kontras
- **Teks utama:** `text-neutral-900`
- **Teks pendukung:** `text-neutral-600`
- **Placeholder:** `text-neutral-500`
- **Tombol utama:** `bg-orange-700 hover:bg-orange-800 text-white`
- **Teks aksen:** `text-orange-700`
- **Elemen terpilih:** Garis tepi `border-orange-700` dan latar `bg-orange-50`
- **Cincin fokus:** `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700`
- **Status validasi:** Pasangan `-800` dan `-50` (hijau untuk MOQ terpenuhi, amber untuk peringatan H-2/kurang porsi, merah untuk error input) disertai ikon dan label teks

### Tipografi & Angka
- **Skala huruf:** Judul halaman `text-2xl`, judul bagian `text-lg`, isi `text-base`, label `text-sm`, angka total utama `text-3xl`
- **Input:** Minimal `16px` (`text-base`) agar tidak memicu zoom otomatis di ponsel
- **Angka sejajar:** Seluruh harga dan jumlah porsi memakai `tabular-nums`

### Aksesibilitas & Batasan
- Area sentuh seluruh tombol dan kontrol interaktif minimal `44 × 44 px`
- Aksi utama langsung terlihat pada layar `360 × 740 px` tanpa menggulir
- Tanpa gradasi, `backdrop-blur`, emoji pengganti ikon, pola titik dekoratif, atau animasi berat (hanya `transform` dan `opacity` 150–200 ms `ease-out` dengan `motion-reduce:transition-none`)
