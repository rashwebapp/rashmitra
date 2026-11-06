# PROMPT GOOGLE STITCH & FIGMA AI — RASH MITRA (WARM TERRACOTTA & CREAM SOFT-UI)
*Design Reference: Warm Claymorphic / Soft Minimalist UI (Tortilla Style) adapted to RASH Mitra PRD*

```markdown
Design a complete, high-fidelity UI/UX design suite for "RASH Mitra" (Smart POS & Mini ERP Multi-Vertical Application for MSMEs).
The visual aesthetic MUST strictly replicate the reference design: Warm Minimalist Claymorphism / Soft-UI, featuring a cozy cream porcelain background, rich burnt terracotta orange accents, soft 3D diffuse shadows, tactile pill containers, and delicious photorealistic product imagery.

---

## 1. Visual & Design Identity (Strict Reference Style)

- **Design Philosophy:** Warm, organic, tactile, and appetizing. Bridges the gap between cozy boutique consumer charm and high-efficiency operational POS.
- **Color Palette:**
  - **Canvas Background:** Warm Oat Milk / Cream Porcelain (`#FAF5EE` / `#F8F3EA`) — ultra-soft, zero eye strain, tactile warm feel.
  - **Primary Accent:** Rich Burnt Terracotta / Roasted Cinnamon Orange (`#B84E29` / `#BC5A36`) — for hero banners, primary action pills, floating cart badges, and "+" add triggers.
  - **Secondary Brand Tone:** Warm Caramel Gold (`#D9822B` / `#E69A3E`) — for rewards, ratings, and active highlights.
  - **Card Surface:** Pure Soft White (`#FFFFFF`) with delicate warm ambient drop shadow: `box-shadow: 0 10px 28px -4px rgba(184, 78, 41, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)`.
  - **Typography Color:**
    - Headlines & Titles: Deep Roasted Espresso / Dark Chocolate (`#2C1A14`).
    - Body & Subtitles: Warm Hazelnut Slate (`#75665E`).
    - Monospace Numbers & Currency: JetBrains Mono / Plus Jakarta Sans bold tabular (`#2C1A14`).
  - **Status & Alerts:**
    - Success / Ready: Fresh Garden Basil Green (`#2D7A4D`).
    - In-Process / Cooking: Warm Terracotta Flame (`#B84E29`).
    - Warning / Low Stock: Spiced Paprika Red (`#D93829`).
- **Typography:**
  - Brand Logo: Editorial Bold Serif or Clean Slab (e.g., Playfair Display or Hanken Grotesk Bold, 24px).
  - UI & Form Elements: Plus Jakarta Sans / Inter Rounded (clean, modern, highly legible).
  - Currency & Pricing: JetBrains Mono or bold tabular font with large glyphs.
- **Corner Radii & Shapes:**
  - Main Cards: 22px to 26px rounded corners.
  - Buttons & Badges: Full capsule pill (`rounded-full` 9999px).
  - Floating Dock: 32px rounded-full capsule.
  - Category Squircles: 18px rounded soft squares.
- **Tactile Soft 3D Details:**
  - Circular buttons have a subtle dual-layer bevel or soft inner glow.
  - Floating elements have a soft warm diffuse drop shadow mimicking natural morning tabletop lighting.

---

## 2. Key Screen Specifications (Conforming to RASH Mitra PRD)

### Screen 1: Mobile Customer Self-Order Catalog (`katalog.html`)
*Layout: Native mobile portrait (393x852px, iPhone 16 Pro mockup style)*
- **Top Status & Header Bar:**
  - Time "9:41", dynamic island notch, wifi & battery icons.
  - Centered Brand Header: Bold serif title **"RASH MITRA"** with tagline *"Smart Ordering & Mini ERP"*.
  - Circular soft-embossed action buttons: Left [🔔 Notifications] and Right [👤 Customer Profile].
- **Search & Table Pill:**
  - Floating pill card: Location/Table pin icon, text *"Meja No. 04 — Dine-in (Ketuk untuk ganti meja)"*, and search magnifier icon `🔍`.
- **Hero Promotional Banner:**
  - Rich Terracotta Orange card (`#B84E29`) with 24px rounded corners.
  - Headline in bold uppercase white: **"FRESH. AUTHENTIC. FAST."**
  - Subtitle: *"Pesan mandiri langsung ke dapur tanpa antre. Nikmati diskon pembukaan 15%."*
  - White capsule pill CTA button: **"Pesan Sekarang →"** with terracotta bold text.
  - Photorealistic appetizing food cut-out (e.g. gourmet burrito / sizzling hot bowl / fresh roasted coffee) integrated into the right side.
  - 3-dot pagination carousel indicator underneath.
- **Category Squircle Switcher:**
  - Horizontal scrollable row of tactile soft-white squircle tiles (~18px radius).
  - Each tile features a miniature 3D photorealistic icon:
    1. [Burritos / Nasi Bowl] (Active: elevated white card with subtle terracotta glow)
    2. [Tacos & Snack]
    3. [Minuman Segar]
    4. [Retail Sembako]
    5. [Laundry Kiloan]
  - Label in espresso text beneath each squircle.
- **Product Grid ("Menu Terlaris / Popular Picks"):**
  - 2-column or 3-card carousel of floating white rounded cards.
  - Top tag: Small warm pill badge e.g. *"🔥 Best Seller"*.
  - Appetizing top-down photography.
  - Product title in 2 lines: **"Spicy Grilled Chicken Bowl"**, price **"Rp 28.000"**.
  - Bottom-right action: **Terracotta circular "+" button** with white plus icon for instant tactile 1-tap ordering.
- **Loyalty & WhatsApp Rewards Card:**
  - White rounded card with soft golden star badge, title **"RASH REWARDS"**, description *"Kumpulkan poin setiap transaksi & dapatkan voucher WA gratis"*, with terracotta pill button **"Gabung Member"**.
- **Floating Bottom Capsule Dock:**
  - Floating white pill dock elevated from the bottom with soft diffuse shadow.
  - 5 Navigation items:
    - [🏠 Beranda (Active: Terracotta pill with white icon & label)]
    - [📋 Menu]
    - [🛒 Central Floating Cart Badge: Elevated terracotta circle with shopping cart icon and white numerical badge "3"]
    - [🛵 Lacak Pesanan]
    - [⚙️ Profil]

---

### Screen 2: Real-Time Order Tracking & Kitchen Milestone Screen
*Layout: Customer order tracking view on mobile & cashier display*
- **Header:** *"Status Pesanan #ORD-9821"* with live timestamp.
- **Visual Milestone Tracker (4 Steps in Warm Terracotta Palette):**
  - Step 1: **Pesanan Diterima** (Terracotta check icon, "09:15 WIB - Dikonfirmasi Kasir").
  - Step 2: **Sedang Dimasak / Diproses** (Active animated warm glowing pulse, cooking icon, "Estimasi 12 menit lagi").
  - Step 3: **Siap Disajikan / Diambil** (Soft golden bell icon, "Meja 04 atau Ambil di Counter").
  - Step 4: **Selesai / Lunas** (Emerald green badge with verified checkmark).
- **Order Summary Card:** White tactile card showing ordered items, notes (*"Tanpa bawang bombay, pedas level 2"*), and dynamic QR code for payment verification.
- **WhatsApp Support Action:** Full-width terracotta capsule button: *"Hubungi Kasir via WhatsApp 📲"*.

---

### Screen 3: Fast Touchscreen POS Cashier Station (`pos.html` / Desktop & Tablet)
*Layout: High-density 60/40 Split Screen for Touchscreen Terminals*
- **Top Hardware HUD Bar:**
  - Warm oat milk bar with store title: **"RASH Coffee & Kitchen (Shift Pagi)"**.
  - Hardware pill indicators: `[🟢 Thermal 58mm: Ready]` `[🟢 Cloud Drive: Synced]` `[🟢 WA Bot: Active]`.
  - Cashier Chip: Avatar circle "Budi Santoso" + Clock-in duration badge (08:00 - 16:00).
  - Button: Compact terracotta outline pill *"Tutup Shift Kasir (Shift Lock)"*.
- **Left Panel (60% Catalog & Barcode Fast Engine):**
  - Search & Barcode input bar with barcode scanner icon, camera trigger, and `[F2]` shortcut tag.
  - Category selector with soft rounded pills matching the terracotta/cream palette.
  - 3x3 Responsive Product Cards: Clean white cards with product photos, SKU mono tags (`SKU-BUR-01`), stock counters (`Sisa 18 porsi`), and bold prices. Tapping a card triggers a tactile press effect.
- **Right Panel (40% Active Ticket Register & Checkout):**
  - Ticket Header: Invoice `#INV-2026-0042` with Table selector or Laundry weight counter.
  - Scrollable ticket list with item name, price, tactile `[-] Qty [+]` steppers, and delete trash icon.
  - Summary Container: Subtotal, Tax, and Grand Total in large 28px JetBrains Mono bold espresso typography.
  - Payment Tender Tabs: `[💵 Tunai (F4)]` `[📱 Dynamic QRIS]` `[🏦 Transfer / Debit]`.
  - Quick Cash Pills: `[Uang Pas]` `[Rp 50.000]` `[Rp 100.000]` `[Rp 200.000]`.
  - Primary Action Button: Full-width high-contrast Terracotta button: **"BAYAR & CETAK STRUK 58MM (Enter) 🖨️"**.

---

### Screen 4: Login & Attendance Gate (`index.html`)
*Layout: Ambient centered card on a warm oat-milk & gentle terracotta gradient backdrop*
- Floating white card with 26px rounded corners, brand seal with golden lightning bolt.
- Mode Selector: Segmented toggle with smooth slide: **[Staf Kasir (PIN)]** | **[Super Admin (Google / Darurat)]**.
- Cashier Mode:
  - Cashier selection avatar dropdown.
  - 4-digit PIN masked bubble indicators (`• • • •`).
  - Tactile on-screen 3x4 numpad with soft-raised circular buttons.
  - Terracotta capsule button: **"Buka Mesin Kasir POS →"**.
  - Quick-test pill: *"⚡ Masuk Cepat Demo Kasir"*.
- Super Admin Mode:
  - Official "Sign in with Google" white button with Google G icon.
  - Emergency master credential fallback (Username 'darurat' + Password).
  - Primary button: Champagne Terracotta gradient *"Buka Panel Super Admin 🔓"*.

---

### Screen 5: Master Inventory & Stock CRUD Table (`admin.html`)
*Layout: Clean, responsive executive dashboard*
- Header: Title **"Master Produk & Inventori Stok"** + Terracotta capsule button **"+ Tambah Produk Baru"**.
- Real-time search filter and stock alert status chips (`Semua`, `Stok Aman`, `Stok Kritis < 5`).
- Tactile White Data Table:
  - Columns: [SKU / Barcode in mono font] [Product Name + Thumbnail] [Kategori] [Harga Modal] [Harga Jual] [Stok Fisik] [Status: Hijau Aman / Merah Kritis] [Aksi Cepat: Tombol -1, +5, +10, Edit].
- Add Product Drawer / Modal: Form with clean inputs, category selector, image upload preview, and barcode generator.

---

### Screen 6: Super Admin Multi-Vertical Master Settings (`admin.html`)
*Layout: Executive Control Panel*
- **Business Model Switcher Cards:**
  - 3 Large Interactive Cards with soft warm shadows:
    1. **🍽️ Restoran & Kafe:** Table numbers, dine-in/takeaway toggles, kitchen ticket printer.
    2. **🏬 Retail & Warung:** Barcode fast-lookup, wholesale tiers, low stock auto-alert.
    3. **🧺 Laundry & Jasa:** Weight scales (Kg), express 24h toggle, wash/dry/iron milestone tracking.
- **Third-Party API Integration Box:** Masked Fonnte WhatsApp token (`fonn••••••••xyz`) and Dynamic QRIS Merchant API credentials.
- **Automated Staff Payroll Calculator:** Monthly attendance ledger with calculated net salaries and one-click *"Cetak Slip Gaji Thermal 58mm"*.

---

## 3. Global Styling & UI Engine Rules

- **Elevation & Lighting:** Realistic morning soft diffuse light. Light source from top-left. Card shadows use `rgba(184, 78, 41, 0.07)` and `rgba(0, 0, 0, 0.04)`.
- **Button Feedback:** Active state scales down slightly (`scale(0.97)`), buttons have distinct hover/focus warm glow.
- **Empty States:** Hand-drawn minimal food/retail illustration in warm terracotta line-art with friendly message and primary CTA button.
- **Responsive Adaptability:** Mobile-first layout for customer ordering (`katalog.html`), and high-density tablet/desktop widescreen for cashier POS (`pos.html`) and admin settings (`admin.html`).
```
