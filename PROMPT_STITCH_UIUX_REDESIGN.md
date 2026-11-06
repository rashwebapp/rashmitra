Design a complete, high-fidelity UI/UX design for RASH Mitra (Mini ERP & Smart POS Multi-Vertical Application).
RASH Mitra is an all-in-one standalone operational management system built for MSMEs (UMKM), combining a fast touch-screen Point of Sale (POS), Inventory & Stock CRUD, Real-Time Order Tracking, Automated Staff Payroll, and Super Admin Multi-Vertical settings (Restaurant, Retail, and Laundry).

## Design Identity
- Style: Modern Luxury Fintech & High-Density Operational POS.
- Aesthetic: Clean porcelain-ivory canvas, refined geometric cards, subtle metallic gold luster, crisp typography, and zero-clutter layout optimized for fast cashiers.
- Color Palette:
  - Primary: Deep Oceanic Emerald Teal (#003B4B & #095368) — conveys institutional stability, security, and modern business prestige.
  - Accent / Secondary: Luxury Champagne Gold (#D4AF37 & #C5A059) — highlights totals, VIP tags, primary actions, and status badges.
  - Canvas Background: Crisp Warm Pearl / Ivory (#F9F9F7 & #FCFBFA) — prevents eye fatigue during long 8-hour cashier shifts.
  - Card & Container Surface: Pure White (#FFFFFF) with delicate structural borders (#E2E8F0).
  - Text Primary: Deep Charcoal / Slate (#1E293B) for maximum readability.
  - Text Muted: Cool Slate (#64748B) for labels and secondary metadata.
  - Success: Emerald Green (#16A34A) for completed orders, clock-in status, and online devices.
  - Alert / Critical: Crimson Red (#DC2626) for low stock warnings and voids.
- Typography:
  - Headlines & App Branding: Plus Jakarta Sans / Hanken Grotesk (Bold, geometric, contemporary).
  - Body & Form Controls: Plus Jakarta Sans / Manrope (Clean, highly legible).
  - Numbers, Barcodes & Ledgers: JetBrains Mono (Tabular monospace for currency, SKU barcodes, and price tallies).
- Visual Reference: Inspired by Square POS Terminal, Toast POS, and high-end private banking concierge dashboards.
- Corner Radius: 12px (rounded-xl) for cards, 8px (rounded-lg) for buttons & input fields, full pill (rounded-full) for badges and status chips.
- Shadows: Soft ambient elevation `0 4px 20px -2px rgba(9, 83, 104, 0.06)` and delicate gold glow on primary action buttons `0 4px 14px rgba(212, 175, 55, 0.25)`.
- Spacing: 8px baseline grid with generous internal touch targets (minimum 44px for buttons).

---

## Detailed Pages Required

### 1. Application Entry Gate (Auth & Login Screen)
Centered modern card on an ambient deep emerald gradient background with subtle gold geometric watermark:
- Brand Header: Glowing emerald tile with metallic gold lightning bolt icon, bold title "RASH Mitra", subtitle "Sistem Operasional Kasir & Mini ERP".
- Role Tab Switcher: Segmented toggle with smooth slide animation between [Staf Kasir] and [Super Admin].
- Staff Login Mode:
  - Dropdown selector: "Pilih Petugas Kasir (e.g. Budi Santoso - Shift Pagi)".
  - 4-Digit PIN input field with masked dots (• • • •) and instant on-screen numpad.
  - Primary Action Button: Deep Emerald (#095368) "Buka Mesin Kasir POS →".
  - Quick 1-Click Demo Button: Dashed border with badge "⚡ Masuk Cepat Demo Kasir".
- Super Admin Login Mode:
  - "Sign in with Google (Owner Workspace)" white button with official Google multicolored G icon.
  - Emergency master credential fallback (Username 'darurat' + Password field).
  - Primary Button: Champagne Gold gradient with navy text "Buka Panel Super Admin 🔓".
- Footer link: Subtle text "Buka Katalog Publik Pelanggan →".

### 2. Fast POS Cashier Station (Split-Screen Workspace)
Layout: Fixed top hardware HUD bar + 60% Left Catalog Grid + 40% Right Active Ticket Register:
- Top Operational HUD:
  - Store Name: "RASH Coffee & Resto" with active vertical pill badge.
  - Cashier info: Avatar chip "Budi Santoso (Shift Pagi) • Clock-in: 08:00 WIB".
  - Hardware status pills: [🟢 Thermal 58mm Bluetooth: Ready] [🟢 G-Drive Live Sync] [📲 Fonnte WA Ready].
  - Close Register Shift button: Compact outline button with lock clock icon.
- Left Panel (Catalog & Barcode Accelerator):
  - Top Search Bar: Barcode scanner input field with USB scanner icon and [F2] badge, plus camera scan trigger.
  - Category Pills: Horizontal scrollable pills: [Semua Menu (active dark teal)] [Makanan] [Minuman] [Sembako] [Laundry].
  - Product Tiles Grid (3 columns):
    - White rounded cards with high-res food/retail photography.
    - Top badges: SKU pill (FOOD-NG-01) and stock count pill ("Sisa 24 pcs").
    - Title in bold navy, price in JetBrains Mono bold text.
    - Hover/Tap state: Delicate gold outline glow and immediate bounce feedback.
- Right Panel (Active Ticket & Instant Checkout):
  - Ticket Header: Invoice number (ORD-XXXX), Table Number / Laundry Weight input field.
  - Itemized List: Scrollable table showing item name, unit price, [- Qty +] stepper, subtotal, and red delete icon.
  - Pricing Box: Subtotal, Discount/Voucher, and Grand Total rendered in large 24px JetBrains Mono bold text.
  - Tender Method Selector: 3 quick tabs [💵 Tunai (F4)] [📱 Dynamic QRIS] [🏦 Transfer].
  - Quick Cash Tiles: [Uang Pas] [Rp 50.000] [Rp 100.000] [Rp 200.000].
  - Checkout Button: Full-width vibrant Gold/Emerald button "BAYAR & CETAK STRUK 58MM (Enter)".

### 3. Master Products & Inventory Management (CRUD Table)
Layout: Full-width table interface with top action bar:
- Header: Title "Master Produk & Inventori Stok", subtitle, and primary button "+ Tambah Produk Baru".
- Filter & Search Bar: Real-time search input for name/SKU, category dropdown filter, and stock alert filter (All / Safe / Low Stock).
- Data Table:
  - Columns: [SKU / Barcode in mono font] [Product Name + Thumbnail preview] [Category pill] [Cost Price] [Selling Price] [Physical Stock] [Status Badge: Safe (green) / Low Stock (red)] [Quick Stock Adjuster: -1, +5, +10 buttons].
- Add Product Drawer / Modal:
  - Clean stacked form: Product Name, SKU Barcode (with auto-generate button), Category selector, Cost & Selling Price, Stock count, Unit (pcs/kg/cup), and Image upload preview.

### 4. Real-Time Order Tracking & Kitchen Queue
Layout: Split view with live customer order stream and step-by-step visual tracker:
- Quick Search Box: "Ketik No. Order atau No. WhatsApp Pelanggan..." with search icon.
- Visual Progress Tracker Bar (Card with 4 milestone steps):
  - Step 1: Pesanan Diterima (Icon: receipt, timestamp).
  - Step 2: Sedang Diproses / Dimasak (Icon: soup_kitchen, animated pulse).
  - Step 3: Siap Saji / Siap Diambil (Icon: check_circle, glowing amber badge).
  - Step 4: Selesai / Lunas (Icon: verified, emerald green).
- Orders Queue Table:
  - Real-time incoming self-orders from customers browsing the digital catalog.
  - Columns: [Order ID + Time] [Customer Name & Phone] [Table # or Kg] [Item List] [Total Price] [Status Badge] [Dropdown to advance status: Diproses → Siap Saji → Selesai].

### 5. Super Admin Executive Back-Office & Master Settings
Layout: Restricted executive console (hidden from standard cashiers):
- Business Model Switcher Card:
  - 3 Interactive Multi-Vertical Cards:
    - [🍽️ Restoran & Kafe: Table Numbers, Dine-in/Takeaway, Kitchen Display].
    - [🏬 Retail & Warung: Barcode fast search, Wholesale stock].
    - [🧺 Laundry & Jasa: Weight scale Kg, Washing/Ironing tracking, Drop-off pickup date].
  - Info notice: "Changes dynamically adapt the cashier register and customer receipts in real-time."
- Store Profile Form: Store Name, Address, Thermal 58mm Receipt Footer notes.
- Third-Party Automations: Masked Fonnte WhatsApp API token (fonn••••••xyz) and Dynamic QRIS Merchant configuration.
- Automated Staff Payroll Calculator: Monthly table showing [Staff Name] [Days Worked] [Base Salary] [Daily Allowance] [Total Net Salary] with a button to "Print Thermal Payslip (58mm)".

### 6. Customer Self-Order Catalog with Order Tracking (`katalog.html`)
Layout: Mobile-first responsive catalog for restaurant tables or takeaway:
- Top Banner: Restaurant logo, Table number (#03), store open badge, and a prominent button "Lacak Pesanan 🔍".
- Category Tabs: Filter pills with smooth horizontal swipe.
- Menu Cards: Grid of delicious food/beverage photography, title, description, price, and "+ Tambah" button.
- Floating Cart Pill: Sticky bottom bar showing "3 Items | Rp 75.000" and button "Lihat Keranjang →".
- Checkout Modal: Customer Name, WhatsApp number for automated E-Receipt, and Dynamic QRIS code preview with countdown timer.
- Order Tracking Modal: Pop-up dialog allowing customers to enter their Order ID to view their meal preparation status in real-time.

---

## Global Design Requirements
- High contrast and ergonomic layout designed specifically for tablet touchscreens and desktop cash desks.
- Clean typography hierarchy: H1 (24px bold), H2 (18px bold), Body (14px regular), Monospace ledgers (16px bold).
- Skeleton loading states for all product grids and data tables.
- Monospace styling (JetBrains Mono) for all currency figures, order IDs, and barcodes.
- Realistic printable 58mm thermal receipt modal with authentic monospace font and tear-off dashed divider line.
- Overall feel: An authoritative, ultra-modern, and frictionless business operating system that empowers MSME owners with enterprise-grade speed and prestige.
