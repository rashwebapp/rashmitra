Create detailed wireframes for RASH Mitra (Mini ERP & POS Multi-Vertical Web Application).
Use grayscale/black-and-white wireframe style only — no colors, no images, just layout structure, placeholder boxes, labels, and navigation flow.

## Application Context
RASH Mitra is an all-in-one standalone Mini ERP and POS system built for MSMEs (UMKM). It serves three distinct user roles: Public Customers (browsing digital catalog and placing self-orders), Staff/Cashiers (performing daily attendance clock-in before unlocking the fast POS register with 58mm thermal printing), and Owners (managing inventory, automated payroll, transactions CRM, WhatsApp automations via Fonnte, and dynamic multi-vertical business settings for Retail, Restaurant, and Laundry).

Has 3 main sections across 12 wireframe pages:
1. Public Customer Self-Ordering Portal (W-01 to W-03)
2. Staff Gated POS & Attendance Station (W-04 to W-07)
3. Owner Executive Back-Office & Multi-Vertical Settings (W-08 to W-12)

---

## Wireframe Pages Required

### --- SECTION 1: PUBLIC CUSTOMER PORTAL ---

--- PAGE W-01: CUSTOMER DIGITAL CATALOG (DESKTOP & MOBILE BREAKPOINTS) ---
Layout: Sticky top store header | Category filter tabs | Main responsive product grid | Sticky floating bottom cart bar
- Header: [Logo box: Store Brand] [Store Name + Open/Closed Badge] [Address & Hours Info] [Search input: "Search menu / items..."]
- Dynamic Vertical Banner:
  - If Retail: [Promotional banner box with X]
  - If Restoran: [Banner + "Table Number: [Table #3]" indicator]
  - If Laundry: [Banner + "Drop-off Service Estimations: Reguler (2 Days) / Express (6 Hours)"]
- Category Pill Tabs: [All Items (active)] [Category A] [Category B] [Category C] [Promo / Best Seller]
- Product Grid (3-4 columns desktop, 2 columns mobile):
  - Card: [Image box with X]
  - Card Header: [Item Name label] [Category / Tag badge]
  - Card Body: [Price: "Rp 25.000"] [Stock availability: "Tersedia"]
  - Card Footer: [-] [Qty: 1] [+] [Primary button: "+ Tambah"]
- Sticky Bottom Floating Cart Bar (Mobile):
  - [Icon: Shopping Bag] ["3 Items | Rp 75.000"] ............ [Filled Button: "Lihat Keranjang →"]

--- PAGE W-02: SELF-ORDER CHECKOUT MODAL / DRAWER ---
Layout: Centered modal (Desktop) / Slide-up bottom sheet (Mobile)
- Modal Header: [H2: "Keranjang Pesanan Anda"] [Close btn: X]
- Order Items List:
  - Row item 1: [Image box with X] [Item Name] [Notes input: "e.g. Pedas sedang, tanpa seledri"] [Price x Qty] [Delete trash icon]
  - Row item 2: [Image box with X] [Item Name] [Notes input] [Price x Qty] [Delete trash icon]
- Customer Details Form:
  - [Input field: Nama Pemesan (Full Name)]
  - [Input field: Nomor WhatsApp (e.g. 0812xxxxxx) — for automated E-Receipt]
- Dynamic Vertical Fields:
  - If Resto: [Radio / Dropdown: Dine-In / Takeaway] [Input field: Nomor Meja]
  - If Laundry: [Input field: Perkiraan Berat Kg] [Dropdown: Jenis Layanan (Cuci Kering / Setrika)]
- Pricing Breakdown Box:
  - [Subtotal: Rp XX.XXX]
  - [Diskon / Promo: -Rp X.XXX]
  - [Total Tagihan: Rp XX.XXX (Bold)]
- Payment Method Selector:
  - [Radio Card 1: Dynamic QRIS (Instant)]
  - [Radio Card 2: Transfer Bank (BCA / Mandiri / BRI)]
  - [Radio Card 3: Bayar di Kasir (Cash)]
- Sticky Actions: [Outline btn: "Tambah Menu Lain"] [Filled dark btn: "Kirim Pesanan Sekarang →"]

--- PAGE W-03: ORDER CONFIRMATION & E-RECEIPT SCREEN ---
Layout: Centered receipt voucher card on clean backdrop
- Success Header: [Checkmark icon circle] [H2: "Pesanan Berhasil Dibuat!"] [Order No: #ORD-20261106-0042]
- Dynamic Payment Display:
  - If QRIS selected: [Large QR Code placeholder box] ["Scan QRIS ini dengan GoPay, OVO, Dana, BCA Mobile"] [Nominal Pas: Rp XX.XXX] [Countdown timer: 14:59]
  - If Bank Transfer selected: [Bank Name + Account No box] [Copy btn] [Upload Proof File Input + Submit btn]
- Order Summary Card:
  - [Customer Name & WhatsApp]
  - [Itemized receipt rows + Total]
  - [Status badge: "Menunggu Pembayaran / Diproses Kasir"]
- WhatsApp Automation Notice: [Icon: WhatsApp] ["Struk digital otomatis dikirim ke nomor WhatsApp Anda."]
- Actions: [Outline btn: "Download Struk PDF"] [Filled dark btn: "Kembali ke Katalog"]

---

### --- SECTION 2: STAFF GATED POS & ATTENDANCE STATION ---

--- PAGE W-04: STAFF & OWNER GOOGLE OAUTH LOGIN ---
Layout: Centered clean auth box
- Card:
  - [App Logo box: RASH Mitra by RASH WebApp Builder]
  - [H2: "Masuk ke Dashboard Operasional"]
  - [Subtext: "Silakan gunakan akun Google terdaftar untuk staf dan owner."]
  - [Filled Dark Button with Google Icon: "Sign in with Google"]
  - [Divider]
  - [Small text: "Protected by Google Identity Services & Standalone Instance Security"]

--- PAGE W-05: GATED ATTENDANCE CLOCK-IN SCREEN (POS LOCK) ---
Layout: Full-screen overlay lock dialog (locks all POS operations until staff clocks in)
- Lock Screen Header: [Padlock icon] [H2: "Akses POS Kasir Terkunci"]
- Staff Info Banner: [Avatar circle] ["Halo, Budi Santoso (Staff Kasir)"] [Current Date & Live Digital Clock: "08:02:15 WIB"]
- Attendance Form Box:
  - [Dropdown: Pilih Shift Kerja (Shift Pagi: 08:00 - 16:00 / Shift Siang: 14:00 - 22:00)]
  - [Status Badge Preview: "Tepat Waktu (On-Time)" or "Terlambat (Late)"]
  - [File/Camera upload box: "Unggah Foto Selfie Kehadiran (Opsional/Wajib)"]
  - [Input field: Catatan Kehadiran (Opsional)]
- Action: [Full-width Large Filled Button: "Lakukan Clock-In & Buka Kasir Sekarang 🔓"]
- Small note: "Waktu clock-in server anti-manipulasi tersimpan langsung ke Google Sheets."

--- PAGE W-06: POS CASHIER STATION (TABLET & DESKTOP SPLIT VIEW) ---
Layout: Fixed top status bar | 2-Column split workspace (Left 60% Catalog, Right 40% Bill Register)
- Top Bar:
  - [Store Name & Logo] [Staff: Budi (Clocked-in 08:00)] [Shift: Pagi]
  - [Hardware Status: Thermal Printer 58mm Bluetooth (🟢 Connected)]
  - [Queue Badge: "Pesanan Masuk (3 Baru)"] [Close Shift btn]
- Left Column (Catalog & Fast Search):
  - [Barcode Scanner Input: "Scan barcode / ketik SKU (F2)..."] [Category pills]
  - [Product Cards Grid (compact)]: [Thumb box] [Name] [Price] [Stock badge: "24 pcs"] [+ Add btn]
- Right Column (Cart & Register):
  - Cart Header: [Order Type: Dine-In / Takeaway / Direct] [Customer Name / No HP input]
  - Item List (scrollable table):
    - [Item Name] [Price] [Qty stepper - 1 +] [Total] [Delete btn]
  - Calculation Summary:
    - [Subtotal] [Diskon voucher] [Pajak/Tax] [Grand Total (Large Bold Text)]
  - Quick Payment Controls:
    - Quick Cash Buttons: [Uang Pas] [50.000] [100.000] [200.000]
    - Payment Method Tabs: [Tunai (F4)] [QRIS Dinamis (F8)] [Transfer (F9)]
  - Bottom Action Bar:
    - [Outline btn: "Tahan Pesanan (Hold)"]
    - [Outline btn: "Cetak Ulang Struk Thermal"]
    - [Large Filled Button: "BAYAR & CETAK STRUK (Enter) →"]

--- PAGE W-07: END-OF-DAY CLOSE SHIFT MODAL ---
Layout: Centered reconciliation review modal
- Modal Header: [H2: "Tutup Kasir & Serah Terima Shift"] [Close btn: X]
- Shift Details: [Staff Name] [Clock-in: 08:00 WIB] [Clock-out time: Now (16:05 WIB)]
- Cash Drawer Reconciliation:
  - [Input: Kas Awal Modal (Opening Float)]
  - [System Calculation: Total Penjualan Tunai]
  - [Input: Hitungan Fisik Kas Aktual di Laci Kasir]
  - [Discrepancy Display: Selisih (Rp 0 / Match)]
- Non-Cash Summary:
  - [Total Transaksi QRIS: Rp XXX.XXX (N transaksi)]
  - [Total Transaksi Transfer: Rp XXX.XXX (N transaksi)]
  - [Total Penjualan Shift: Rp X.XXX.XXX]
- Automated WA Report Checkbox:
  - [☑ Checkbox checked: "Kirim ringkasan laporan tutup kasir otomatis ke WhatsApp Owner via Fonnte"]
- Actions: [Outline btn: "Batal"] [Filled Dark Button: "Konfirmasi Tutup Shift & Clock-Out 🔒"]

---

### --- SECTION 3: OWNER EXECUTIVE BACK-OFFICE & DYNAMIC SETTINGS ---

--- PAGE W-08: OWNER EXECUTIVE ANALYTICS DASHBOARD ---
Layout: Left fixed sidebar (240px) | Top bar with store vertical indicator | Main content dashboard
- Sidebar:
  - [Brand Logo: RASH Mitra]
  - Navigation: [Dashboard (active)] [Katalog & Stok] [Pesanan & Kasir] [Data Pelanggan (CRM)] [HR & Absensi] [Penggajian (Payroll)] [Master Settings]
  - [Logout button at bottom]
- Top Bar:
  - [Active Business Vertical Badge: "Mode Restoran" / "Mode Retail" / "Mode Laundry"]
  - [Date range picker: "Hari Ini: 06 Nov 2026"]
  - [Store Name dropdown] [Owner Profile avatar]
- Row 1: KPI Stat Metric Cards (4 cards with gold accent line):
  - Card 1: [Total Omzet Hari Ini: "Rp 3.850.000" (+12% vs kemarin)]
  - Card 2: [Total Transaksi: "48 Pesanan"]
  - Card 3: [Staf Hadir Hari Ini: "4 / 4 Orang (100%)"]
  - Card 4: [Peringatan Stok Rendah: "3 Produk Kritis"]
- Row 2: Charts & Visuals:
  - Left Frame (65%): [Line / Bar Chart placeholder: "Tren Penjualan 7 Hari Terakhir (Cash vs QRIS vs TF)"]
  - Right Frame (35%): [Donut Chart placeholder: "Metode Pembayaran Terpopuler"]
- Row 3: Operational Quick Tables:
  - Left Mini-table: [Pesanan Terkini & Status Pembayaran]
  - Right Mini-table: [Rekap Absensi Staf Hari Ini (Jam Masuk, Shift, Status)]

--- PAGE W-09: PRODUCT & INVENTORY MANAGEMENT (CRUD & STOCK) ---
Layout: Sidebar + Top bar + Main DataTables interface
- Header: [H2: "Manajemen Produk & Stok Inventaris"] [Filled btn: "+ Tambah Produk Baru"] [Outline btn: "Import / Export CSV"]
- Search & Filter Row:
  - [Search input: "Cari nama produk, SKU, barcode..."]
  - [Dropdown: Filter Kategori] [Dropdown: Filter Status Stok (Semua / Stok Aman / Menipis / Habis)]
- Data Table:
  - Columns: [Image] [Barcode / SKU] [Nama Produk] [Kategori] [Harga Modal] [Harga Jual] [Stok Saat Ini] [Status] [Aksi]
  - Status Pills: ["Aman (45 pcs)"] ["Menipis (2 pcs) - Warning"]
  - Actions: [Edit pencil icon] [Adjust Stock box icon] [Delete trash icon]
- Bottom: Pagination [< 1 2 3 ... 10 >] + "Menampilkan 1-10 dari 95 produk"
- Slide-over Drawer (Add/Edit Product):
  - [Input: Nama Produk] [Input: Barcode/SKU + Auto-generate btn]
  - [Input: Harga Modal] [Input: Harga Jual]
  - [Input: Stok Awal] [Input: Batas Minimum Stok Alert]
  - [Dynamic Vertical Attributes: e.g. "Nomor Meja Resto" / "Satuan Kg Laundry"]
  - [Image Upload placeholder box]
  - Sticky bottom: [Batal] [Simpan Produk btn]

--- PAGE W-10: HR ATTENDANCE & AUTOMATED PAYROLL GENERATOR ---
Layout: Sidebar + Top bar + Tabbed layout (Tab 1: Log Absensi, Tab 2: Hitung Slip Gaji)
- Header: [H2: "SDM & Penggajian Karyawan (Payroll)"] [Month-Year Picker: "November 2026"]
- Tab 1: Rekap Absensi Staf:
  - [Table: Nama Staf | Total Hari Kerja | Hadir Tepat Waktu | Terlambat | Izin/Sakit | Aksi Cek Foto Selfie]
- Tab 2: Kalkulator Slip Gaji Otomatis:
  - Formula Banner: ["Gaji Bersih = Gaji Pokok + (Hari Hadir × Tunjangan Harian) + Bonus Lembur - Potongan"]
  - Data Table:
    - Columns: [Nama Karyawan] [Hari Masuk] [Gaji Pokok] [Tunjangan Harian] [Bonus/Lembur] [Potongan] [Total Gaji Bersih] [Status: Draft/Paid] [Aksi]
    - Row sample: ["Budi Santoso | 26 Hari | Rp 2.500.000 | Rp 520.000 | Rp 150.000 | Rp 0 | Rp 3.170.000 | [Draft] | [Review & Cetak Slip]"]
- Modal Preview Slip Gaji Karyawan:
  - [Slip Card Header: Logo Toko + "SLIP GAJI KARYAWAN - PERIODE NOV 2026"]
  - [Employee metadata: Nama, Jabatan, Rekening]
  - [Earnings breakdown table] [Deductions breakdown table]
  - [Take Home Pay box: Large Bold]
  - Actions: [Filled btn: "Cetak Slip (Thermal/A4)"] [Outline btn: "Download PDF"] [Filled btn: "Kirim Slip via WhatsApp"]

--- PAGE W-11: TRANSACTIONS, CRM & AUDIT REPORT ---
Layout: Sidebar + Top bar + DataTables & Customer CRM view
- Header: [H2: "Riwayat Transaksi & Database Pelanggan (CRM)"] [Export Excel/CSV btn]
- Tab Switcher: [Tab: Transaksi Penjualan] [Tab: Database Pelanggan (CRM)]
- Content View (Transaksi):
  - Filter Bar: [Date Range: 01 Nov - 06 Nov 2026] [Metode: Semua / QRIS / Cash / TF] [Status: Paid / Pending]
  - Table: [No Order] [Waktu] [Pelanggan] [Kasir] [Total Belanja] [Metode Bayar] [Bukti Transfer link] [Status Struk WA] [Aksi Detail]
- Content View (CRM Pelanggan):
  - Table: [Nama Pelanggan] [Nomor WhatsApp] [Total Transaksi] [Total Belanja Kumulatif (LTV)] [Kunjungan Terakhir] [Aksi: Tombol "Sapa via WA"]

--- PAGE W-12: MASTER SETTINGS & MULTI-VERTICAL DYNAMIC CONFIG ---
Layout: Sidebar + Top bar + Sectioned settings cards with live preview
- Header: [H2: "Pengaturan Master Sistem (RASH Mitra)"] [Save All Changes btn]
- Section 1: Profil Toko & Brand Identity:
  - [Input: Nama Toko] [Input: Alamat Lengkap & Nomor Kontak Toko]
  - [Logo Upload Box with X placeholder] [Favicon Upload]
  - [Textarea: Footer Catatan Struk Thermal 58mm]
- Section 2: Pemilih Vertikal Bisnis Dinamis (Multi-Vertical Switch):
  - [Radio Card A: Mode Retail / Warung (Barcode fast search, Unit Pcs/Dus)]
  - [Radio Card B: Mode Restoran / Kafe (Nomor Meja, Status Masak Dapur, Dine-in/Takeaway)]
  - [Radio Card C: Mode Laundry / Jasa (Timbangan Kg, Status Cucian, Estimasi Selesai)]
  - [Info banner: "Perubahan vertikal akan mengubah form transaksi dan struk secara real-time."]
- Section 3: Integrasi API WhatsApp (Fonnte):
  - [Input: Fonnte API Token (Secret masked input)]
  - [Input: Nomor WhatsApp Owner (Untuk menerima Laporan Tutup Kasir)]
  - [Toggle: Otomatis kirim E-Receipt ke Pelanggan (ON)]
  - [Toggle: Otomatis kirim Laporan Tutup Kasir ke Owner (ON)]
  - [Test Connection Button: "Kirim Pesan Tes WA"]
- Section 4: Konfigurasi Pembayaran (QRIS & Bank):
  - [Input: QRIS Merchant ID / Static Payload string (Auto Dynamic QRIS Engine)]
  - [Input: Nama Bank, Nomor Rekening, & Atas Nama]
  - [Toggle: Izinkan Upload Bukti Transfer Pelanggan (ON)]

---

## Wireframe Style Notes
- Use only grayscale: white (#FFFFFF), light gray (#F4F4F5), medium gray (#A1A1AA), dark gray (#27272A), black (#09090B)
- Text placeholders: Use actual representative Indonesian business labels, not "Lorem Ipsum"
- Buttons: Show shape and label clearly — primary buttons filled dark, secondary outlined with border
- Images/covers: Show as plain box with X through it (standard wireframe placeholder)
- Charts: Show as empty chart frames with axis labels, legends, and chart type indicator inside
- Icons: Show as simple labeled square brackets [icon: name]
- Flow arrows between key pages:
  - W-01 (Katalog) → W-02 (Checkout) → W-03 (E-Receipt / QRIS)
  - W-04 (Login) → W-05 (Gated Clock-In) → W-06 (POS Station) → W-07 (Tutup Shift & WA Report)
  - W-08 (Dashboard) → W-09 (Katalog) / W-10 (Payroll) / W-11 (CRM) / W-12 (Master Settings)
- Show mobile responsive frame for W-01 (Customer Catalog) and W-02 (Customer Checkout)
