/**
 * ============================================================================
 * RASH MITRA — KONFIGURASI FRONTEND
 * Standar: gas-pro-api & gas-rahasia-script-properties
 * Catatan Keamanan: HANYA URL /exec yang disimpan di sini.
 * Token API, Secret Key, dan Kredensial tersimpan di Script Properties Google.
 * ============================================================================
 */

window.APP_CONFIG = {
  // Ganti nilai ini dengan URL /exec Web App Apps Script setelah di-deploy
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwYOUR_DEPLOYMENT_ID/exec',
  
  // Informasi Toko & Brand
  BRAND_NAME: 'RASH Mitra',
  BUILDER_NAME: 'RASH WebApp Builder',
  VERSION: '1.1.0-prod',
  
  // Master Settings Default Toko
  MOCK_SETTINGS: {
    STORE_NAME: 'RASH Coffee & Eatery',
    BUSINESS_VERTICAL: 'RESTO', // RESTO | RETAIL | LAUNDRY
    STORE_ADDRESS: 'Jl. Merdeka No. 45, Jakarta Pusat',
    QRIS_MERCHANT_ID: 'NMID-RASH-99887766',
    BANK_ACCOUNT_INFO: 'BCA 8735123456 a.n. RASH Mitra',
    THERMAL_FOOTER: 'Barang yang dibeli tidak dapat ditukar. Terima kasih!',
    FONNTE_CONNECTED: true,
    FONNTE_TOKEN_MASKED: 'fonn••••••xyz'
  },

  // Fallback Mock Data Produk Multi-Vertikal
  MOCK_PRODUCTS: [
    // Mode Restoran / Kafe (Warm California & Burrito Aesthetic)
    {
      product_id: 'P001',
      barcode_sku: 'BUR-001',
      product_name: 'Chicken California Burrito',
      category: 'Burritos',
      cost_price: 18000,
      selling_price: 32000,
      current_stock: 24,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🔥 Hot Seller',
      image_url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600',
      description: 'Ayam panggang rempah, nasi herba, salsa fresca, dan creamy guacamole.'
    },
    {
      product_id: 'P002',
      barcode_sku: 'BWL-014',
      product_name: 'Korean BBQ Chicken Bowl',
      category: 'Bowls',
      cost_price: 16000,
      selling_price: 28000,
      current_stock: 18,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '⭐ Favorit',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      description: 'Nasi hangat, ayam saus gochujang, sayuran segar, dan biji wijen panggang.'
    },
    {
      product_id: 'P003',
      barcode_sku: 'TAC-005',
      product_name: 'Spicy Chicken Tacos (3 pcs)',
      category: 'Tacos',
      cost_price: 14000,
      selling_price: 26000,
      current_stock: 15,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🌶️ Pedas',
      image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600',
      description: 'Kulit taco renyah, suwiran ayam pedas saus habanero, selada, dan parutan keju.'
    },
    {
      product_id: 'P004',
      barcode_sku: 'DRN-008',
      product_name: 'Agua Fresca Berry Hibiscus',
      category: 'Minuman',
      cost_price: 6000,
      selling_price: 15000,
      current_stock: 30,
      min_stock_alert: 8,
      unit_measure: 'cup',
      vertical: 'RESTO',
      badge: '🌱 Segar',
      image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
      description: 'Seduhan kembang sepatu dingin dengan sari buah beri segar dan daun mint.'
    },
    {
      product_id: 'P005',
      barcode_sku: 'COF-002',
      product_name: 'Caramel Macchiato Oat Milk',
      category: 'Minuman',
      cost_price: 10000,
      selling_price: 22000,
      current_stock: 40,
      min_stock_alert: 10,
      unit_measure: 'cup',
      vertical: 'RESTO',
      badge: '☕ Kopi',
      image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600',
      description: 'Espresso blend mantap berpadu susu oat kental dan drizzle karamel gurih.'
    },
    {
      product_id: 'P006',
      barcode_sku: 'QSD-003',
      product_name: 'Cheesy Quesadilla Melt',
      category: 'Quesadillas',
      cost_price: 12000,
      selling_price: 25000,
      current_stock: 12,
      min_stock_alert: 4,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🧀 Keju',
      image_url: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600',
      description: 'Tortilla panggang isi keju mozzarella leleh, paprika, dan saus cocolan salsa.'
    },
    {
      product_id: 'P007',
      barcode_sku: 'BWL-022',
      product_name: 'Signature Beef Birria Bowl',
      category: 'Bowls',
      cost_price: 22000,
      selling_price: 38000,
      current_stock: 10,
      min_stock_alert: 3,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '👑 Chef Rec',
      image_url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600',
      description: 'Daging sapi braised empuk kaya rempah dengan kuah birria kaldu sedap.'
    },
    {
      product_id: 'P008',
      barcode_sku: 'SNK-007',
      product_name: 'Crispy Tortilla Chips & Guac',
      category: 'Quesadillas',
      cost_price: 8000,
      selling_price: 18000,
      current_stock: 8,
      min_stock_alert: 4,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '⚠️ Sisa 8',
      image_url: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600',
      description: 'Keripik jagung panggang renyah disajikan dengan guacamole alpukat murni.'
    },
    // Mode Retail / Warung
    {
      product_id: 'P005',
      barcode_sku: 'RETAIL-01',
      product_name: 'Beras Premium Ramos 5 Kg',
      category: 'Sembako',
      cost_price: 62000,
      selling_price: 72000,
      current_stock: 28,
      min_stock_alert: 5,
      unit_measure: 'pack',
      vertical: 'RETAIL',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
      description: 'Beras pulen pilihan tanpa pemutih dan tanpa pengawet.'
    },
    {
      product_id: 'P006',
      barcode_sku: 'RETAIL-02',
      product_name: 'Minyak Goreng Pouch 2 Liter',
      category: 'Sembako',
      cost_price: 31000,
      selling_price: 36000,
      current_stock: 40,
      min_stock_alert: 10,
      unit_measure: 'pouch',
      vertical: 'RETAIL',
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
      description: 'Minyak kelapa sawit murni berkualitas tinggi 2x penyaringan.'
    },
    {
      product_id: 'P007',
      barcode_sku: 'RETAIL-03',
      product_name: 'Gula Pasir Kristal 1 Kg',
      category: 'Sembako',
      cost_price: 15000,
      selling_price: 18000,
      current_stock: 50,
      min_stock_alert: 15,
      unit_measure: 'pack',
      vertical: 'RETAIL',
      image_url: 'https://images.unsplash.com/photo-1581447109200-bf276912b649?w=500',
      description: 'Gula tebu murni manis alami butiran kristal putih.'
    },
    // Mode Laundry / Jasa
    {
      product_id: 'P008',
      barcode_sku: 'LND-01',
      product_name: 'Cuci Kering Setrika Reguler (2 Hari)',
      category: 'Laundry Kiloan',
      cost_price: 3000,
      selling_price: 7000,
      current_stock: 999,
      min_stock_alert: 0,
      unit_measure: 'kg',
      vertical: 'LAUNDRY',
      image_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500',
      description: 'Pencucian higienis + pelembut parfum sakura + setrika uap rapi.'
    },
    {
      product_id: 'P009',
      barcode_sku: 'LND-02',
      product_name: 'Cuci Kilat Express (6 Jam)',
      category: 'Laundry Express',
      cost_price: 5000,
      selling_price: 14000,
      current_stock: 999,
      min_stock_alert: 0,
      unit_measure: 'kg',
      vertical: 'LAUNDRY',
      image_url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=500',
      description: 'Selesai dalam 6 jam. Prioritas mesin tanpa antrean.'
    },
    {
      product_id: 'P010',
      barcode_sku: 'LND-03',
      product_name: 'Cuci Bedcover Besar / Selimut Tebal',
      category: 'Laundry Satuan',
      cost_price: 10000,
      selling_price: 25000,
      current_stock: 999,
      min_stock_alert: 0,
      unit_measure: 'pcs',
      vertical: 'LAUNDRY',
      image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500',
      description: 'Pencucian dry clean khusus bahan tebal dan wangi tahan lama.'
    }
  ],

  // Mock Antrean Pesanan untuk Fitur Pelacakan (Order Tracking)
  MOCK_ORDERS: [
    {
      order_id: 'ORD-20261107-101',
      timestamp: '2026-11-07 09:42:00',
      customer_name: 'Rian Prasetyo',
      customer_phone: '081234567890',
      vertical: 'RESTO',
      table_number: 'Meja 03',
      laundry_weight: '',
      items: [
        { name: 'Kopi Susu Gula Aren Signature', qty: 2, price: 18000 },
        { name: 'Croissant Butter Artisan', qty: 1, price: 24000 }
      ],
      total_amount: 60000,
      payment_method: 'DYNAMIC_QRIS',
      status: 'COOKING', // PENDING | COOKING | READY | COMPLETED
      status_label: 'Sedang Dimasak Dapur',
      estimated_time: '15 Menit'
    },
    {
      order_id: 'ORD-20261107-102',
      timestamp: '2026-11-07 09:30:00',
      customer_name: 'Siti Rahma',
      customer_phone: '085678912345',
      vertical: 'RESTO',
      table_number: 'Meja 07',
      laundry_weight: '',
      items: [
        { name: 'Matcha Latte Green Tea', qty: 1, price: 22000 }
      ],
      total_amount: 22000,
      payment_method: 'CASH',
      status: 'READY',
      status_label: 'Siap Diantar ke Meja',
      estimated_time: 'Siap Saji'
    },
    {
      order_id: 'ORD-20261107-103',
      timestamp: '2026-11-07 08:15:00',
      customer_name: 'Budi Santoso',
      customer_phone: '087712345678',
      vertical: 'LAUNDRY',
      table_number: '',
      laundry_weight: '4.5 Kg',
      items: [
        { name: 'Cuci Kering Setrika Reguler', qty: 4.5, price: 7000 }
      ],
      total_amount: 31500,
      payment_method: 'BANK_TRANSFER',
      status: 'WASHING', // RECEIVED | WASHING | IRONING | READY | COMPLETED
      status_label: 'Sedang Dicuci & Dikeringkan',
      estimated_time: '08 Nov 2026 (16:00 WIB)'
    }
  ]
};
