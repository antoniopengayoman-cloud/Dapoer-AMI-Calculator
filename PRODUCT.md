# PRODUCT.md — Katalog Produk & Kalkulator Estimasi Dapoer AMI

Dokumen ini merangkum daftar fitur, prioritas, ketergantungan, dan status pengerjaan aplikasi **Katalog Produk & Kalkulator Estimasi Dapoer AMI (v0.1)** berdasarkan PRD resmi.

## Identitas Produk

- **Nama produk:** Katalog Produk & Kalkulator Estimasi Dapoer AMI (Aneka Masakan Ibu, Sejak 2024)
- **Kontak operasional:** 0812-1436-0806 / @dapoeramijkt (Area Jakarta / Menara Danareksa Foodcourt)
- **Cakupan permintaan saat ini:** Pengerjaan spesifikasi dan implementasi sampai **FT-07** (`Kirim via WhatsApp`).

## Daftar Fitur

| Kode | Nama Fitur | Prioritas | Logika Terkait | Ketergantungan | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| FT-01 | Navigasi Kategori Menu | Must | BL-01, BL-02 | — | Selesai |
| FT-02 | Katalog Produk & Filter Sub-kategori | Must | — | FT-01 | Selesai |
| FT-03 | Konfigurator Paket Lunch Box & Bento | Must | BL-03 | FT-02 | Selesai |
| FT-04 | Kalkulator Estimasi & Keranjang Real-time | Must | BL-01, BL-02, BL-05 | FT-01, FT-02, FT-03 | Selesai |
| FT-05 | Validasi MOQ & Peringatan H-2 | Must | BL-02, BL-04 | FT-04 | Selesai |
| FT-06 | Form Data Pengiriman & Preview Template WA | Must | BL-05, BL-06 | FT-04, FT-05 | Selesai |
| FT-07 | Direct WhatsApp Checkout Redirect | Must | BL-06 | FT-06 | Selesai |
| FT-08 | Salin Rincian Estimasi (Copy to Clipboard) | Should | BL-06 | FT-06 | Belum |
| FT-09 | Riwayat Estimasi Pesanan Lokal | Should | BL-01, BL-05, BL-06 | FT-06, FT-07 | Selesai |
| FT-10 | Estimasi Biaya Kirim Zona & Jarak | Should | BL-05, BL-06 | FT-06 | Selesai |
| FT-11 | Detail Produk & Tips Penyajian | Should | BL-01, BL-03 | FT-02 | Selesai |

## Catatan & Keputusan Klarifikasi PRD

1. **Komposisi Lauk Lunch Box Special 1 (3 Lauk):** Pelanggan wajib memilih 1 item dari Lauk 1 (Utama) dan 2 item berbeda dari kelompok Lauk 2 (Sayur), Lauk 3 (Pendamping), atau Lauk 4 (Gorengan), ditambah Sambal Kecombrang otomatis.
2. **Aturan Tanggal & Jam Kirim di FT-06:** Sesuai keputusan pemilik produk, kolom Tanggal Kirim dan Jam Kirim bersifat opsional pada formulir pengiriman. Apabila diisi dan tanggal berada di bawah H+2 saat memesan *Baso Tahu Bandoeng*, peringatan konfirmasi ketersediaan stok tampil otomatis.
3. **Item Tersembunyi MVP:** Item *Nasi Boboko* tetap disimpan pada data master dengan status `isVisible = false` hingga harga resmi diterbitkan.
4. **Format Rupiah:** Mengikuti format konsisten di PRD (`Rp 27.000`, dengan spasi setelah `Rp` dan titik pemisah ribuan tanpa desimal).
