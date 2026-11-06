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
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwTNrMFml2_ESf6Cnz9wrS1ogyWKyGQhk4JE9nSrFFtCyRf238kvohrPK3i6duNLmdqEw/exec',
  
  // Informasi Toko & Brand
  BRAND_NAME: 'RASH Mitra',
  BUILDER_NAME: 'RASH WebApp Builder',
  VERSION: '1.0.0-turbo',
  
  // Fallback Mock Data — Memastikan simulator langsung interaktif seketika (0ms lag)
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
      unit_measure: 'cup',
      vertical: 'RESTO',
      image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500',
      description: 'Matcha Uji Jepang berpadu susu segar lembut.'
    },
    // Mode Retail / Warung
    {
      product_id: 'P004',
      barcode_sku: 'RETAIL-01',
      product_name: 'Beras Premium Ramos 5 Kg',
      category: 'Sembako',
      cost_price: 62000,
      selling_price: 72000,
      current_stock: 28,
      unit_measure: 'pack',
      vertical: 'RETAIL',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
      description: 'Beras pulen pilihan tanpa pemutih dan tanpa pengawet.'
    },
    {
      product_id: 'P005',
      barcode_sku: 'RETAIL-02',
      product_name: 'Minyak Goreng Pouch 2 Liter',
      category: 'Sembako',
      cost_price: 31000,
      selling_price: 36000,
      current_stock: 40,
      unit_measure: 'pouch',
      vertical: 'RETAIL',
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
      description: 'Minyak kelapa sawit murni berkualitas tinggi 2x penyaringan.'
    },
    // Mode Laundry / Jasa
    {
      product_id: 'P006',
      barcode_sku: 'LND-01',
      product_name: 'Cuci Kering Setrika Reguler (2 Hari)',
      category: 'Laundry Kiloan',
      cost_price: 3000,
      selling_price: 7000,
      current_stock: 999,
      unit_measure: 'kg',
      vertical: 'LAUNDRY',
      image_url: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=500',
      description: 'Pencucian higienis + pelembut parfum sakura + setrika uap rapi.'
    },
    {
      product_id: 'P007',
      barcode_sku: 'LND-02',
      product_name: 'Cuci Kilat Express 6 Jam Selesai',
      category: 'Laundry Express',
      cost_price: 5000,
      selling_price: 14000,
      current_stock: 999,
      unit_measure: 'kg',
      vertical: 'LAUNDRY',
      image_url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=500',
      description: 'Selesai dalam 6 jam. Prioritas mesin tanpa antrean.'
    }
  ],
  
  MOCK_SETTINGS: {
    STORE_NAME: 'RASH Mitra UMKM Center',
    BUSINESS_VERTICAL: 'RESTO',
    STORE_ADDRESS: 'Jl. Merdeka No. 45, Jakarta',
    QRIS_MERCHANT_ID: 'NMID-RASH-99887766',
    BANK_ACCOUNT_INFO: 'BCA 8735123456 a.n. RASH Mitra',
    THERMAL_FOOTER: 'Struk resmi ini sah dicetak thermal 58mm. Terima kasih!',
    FONNTE_CONNECTED: true,
    FONNTE_TOKEN_MASKED: 'fonn••••••xyz'
  }
};
