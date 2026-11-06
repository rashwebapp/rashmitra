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
    // Mode Restoran / Kafe
    {
      product_id: 'P001',
      barcode_sku: 'RESTO-01',
      product_name: 'Kopi Susu Gula Aren Signature',
      category: 'Minuman',
      cost_price: 8000,
      selling_price: 18000,
      current_stock: 45,
      min_stock_alert: 10,
      unit_measure: 'cup',
      vertical: 'RESTO',
      image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500',
      description: 'Espresso robusta blend, susu murni, dan sirup aren organik.'
    },
    {
      product_id: 'P002',
      barcode_sku: 'RESTO-02',
      product_name: 'Croissant Butter Artisan',
      category: 'Makanan',
      cost_price: 12000,
      selling_price: 24000,
      current_stock: 20,
      min_stock_alert: 5,
      unit_measure: 'pcs',
      vertical: 'RESTO',
      image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
      description: 'Pastry renyah berlapis dengan butter Prancis aromatik.'
    },
    {
      product_id: 'P003',
      barcode_sku: 'RESTO-03',
      product_name: 'Matcha Latte Green Tea',
      category: 'Minuman',
      cost_price: 10000,
      selling_price: 22000,
      current_stock: 35,
      min_stock_alert: 8,
      unit_measure: 'cup',
      vertical: 'RESTO',
      image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500',
      description: 'Matcha Uji Jepang berpadu susu segar lembut.'
    },
    {
      product_id: 'P004',
      barcode_sku: 'RESTO-04',
      product_name: 'Nasi Goreng Spesial Telur',
      category: 'Makanan',
      cost_price: 13000,
      selling_price: 28000,
      current_stock: 30,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
      description: 'Nasi goreng harum rempah dengan suwiran ayam dan telur mata sapi.'
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
