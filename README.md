# ⚡ RASH Mitra — Mini ERP & POS Multi-Vertikal

> Solusi manajemen operasional bisnis & kasir POS multi-vertikal untuk UMKM. Sekali bayar seumur hidup (*Lifetime License*), tanpa biaya langganan bulanan (*Zero Subscription*), dengan kedaulatan data 100% di Google Workspace milik mitra sendiri.

Dikembangkan oleh: **RASH WebApp Builder**  
Arsitektur: **Google Apps Script REST API + GitHub Pages Static Frontend**

---

## 🌟 Fitur Utama

- **Multi-Vertikal Dinamis:** Berpindah instan antara **Mode Restoran / Kafe** (Nomor Meja), **Mode Retail / Warung** (Barcode SKU), dan **Mode Laundry & Jasa** (Timbangan Kg).
- **Self-Order Digital Catalog:** Pengunjung dapat memilih menu dan checkout mandiri tanpa ribet registrasi akun.
- **Kasir POS Cepat & Gated Clock-In:** Kasir terkunci sampai staf melakukan absensi masuk harian (*Clock-in*).
- **Printer Thermal 58mm:** Kompatibel dengan Web Bluetooth dan cetak thermal raw CSS tanpa dialog peramban berlebih.
- **Dynamic QRIS & Transfer Bank:** QRIS dinamis otomatis pas nominal dan verifikasi bukti transfer.
- **Otomasi WhatsApp (Fonnte API):** E-Receipt instan dikirim ke pelanggan dan Laporan Tutup Kasir harian ditembakkan langsung ke WA Owner.
- **HR & Payroll Otomatis:** Perhitungan slip gaji bulanan berdasarkan rekaman absensi harian staf.
- **Kecepatan Turbo (gas-scale-turbo):** Caching berlapis (*LocalStorage SWR + CacheX*) memastikan klik antar menu 0ms tanpa loading lag.

---

## 📁 Struktur Direktori

- `index.html` : Halaman utama Landing Page & Interactive Simulator
- `css/` : Sistem desain resmi (*Deep Emerald Teal & Luxury Champagne Gold*)
- `js/` :
  - `config.js` : Konfigurasi endpoint `GAS_URL`
  - `api.js` : Turbo API Client dengan deduplikasi request
  - `app.js` : Controller simulator, keranjang, POS, dan owner dashboard
- `backend/` : Berkas serverless Google Apps Script (`Kode.gs`)
- `PANDUAN-DEPLOY-GITHUB-PAGES.md` : Panduan instalasi ke GitHub Pages
