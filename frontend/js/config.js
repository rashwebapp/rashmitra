/**
 * ============================================================================
 * RASH MITRA — KONFIGURASI FRONTEND (KASIR RESTORAN TIMUR TENGAH)
 * Spesialisasi: Restoran & Kafe Kuliner Arab & Timur Tengah
 * Fitur: Meja 1-10 (+ Kelola Meja Admin & QR Scan Meja Mandiri)
 * ============================================================================
 */

window.APP_CONFIG = {
  // Ganti nilai ini dengan URL /exec Web App Apps Script setelah di-deploy
  GAS_URL: 'https://script.google.com/macros/s/AKfycbwYOUR_DEPLOYMENT_ID/exec',
  
  // Informasi Toko & Brand Restoran
  BRAND_NAME: 'RASH Mitra Resto',
  BUILDER_NAME: 'RASH WebApp Builder',
  VERSION: '2.0.0-resto-arab',
  KASIR_WA_NUMBER: '6281234567890', // Nomor WhatsApp Kasir Resto untuk Terima Pesanan Meja
  
  // Master Settings Default Restoran
  MOCK_SETTINGS: {
    STORE_NAME: 'RASH Resto Timur Tengah',
    BUSINESS_VERTICAL: 'RESTO',
    STORE_ADDRESS: 'Jl. Raden Saleh No. 18, Cikini, Jakarta Pusat',
    KASIR_WA_NUMBER: '6281234567890',
    QRIS_MERCHANT_ID: 'NMID-RASH-ARAB-7788',
    BANK_ACCOUNT_INFO: 'BCA 8735123456 a.n. RASH Resto',
    THERMAL_FOOTER: 'Syukron katsiran atas kunjungan Anda. Selamat menikmati hidangan!',
    FONNTE_CONNECTED: true,
    FONNTE_TOKEN_MASKED: 'fonn••••••xyz'
  },

  // Daftar Meja Restoran Default (Meja 01 s/d Meja 10 - Bisa ditambah/dihapus oleh Admin)
  DEFAULT_TABLES: [
    'Meja 01',
    'Meja 02',
    'Meja 03',
    'Meja 04',
    'Meja 05',
    'Meja 06',
    'Meja 07',
    'Meja 08',
    'Meja 09',
    'Meja 10'
  ],

  // Data Master Pelanggan Restoran (CRM Kontak & Resi WA Otomatis)
  DEFAULT_CUSTOMERS: [
    {
      customer_id: 'CUST-001',
      name: 'H. Sulaiman Al-Habsyi',
      phone: '081234567890',
      email: 'sulaiman@gmail.com',
      total_orders: 8,
      total_spent: 980000,
      favorite_table: 'Meja 03',
      notes: 'Pelanggan VIP - Suka Nasi Mandi Kambing & Teh Adeni manis',
      created_at: '2026-10-15'
    },
    {
      customer_id: 'CUST-002',
      name: 'dr. Faisal Basalamah',
      phone: '081398765432',
      email: 'faisal@yahoo.com',
      total_orders: 5,
      total_spent: 540000,
      favorite_table: 'Meja 01',
      notes: 'Porsi sambal dhabah dipisah',
      created_at: '2026-10-20'
    },
    {
      customer_id: 'CUST-003',
      name: 'Ustadz Ahmad Farhan',
      phone: '085712349988',
      email: 'ahmadfarhan@gmail.com',
      total_orders: 3,
      total_spent: 315000,
      favorite_table: 'Meja 05',
      notes: 'Langganan Nasi Kebuli Kambing',
      created_at: '2026-11-01'
    }
  ],

  // Katalog Kuliner Timur Tengah & Makanan Arab Otentik
  MOCK_PRODUCTS: [
    // 1. Kategori: Nasi Rempah Arab Signature
    {
      product_id: 'P001',
      barcode_sku: 'MND-001',
      product_name: 'Nasi Mandi Kambing Muda (Signature)',
      category: 'Nasi Rempah Arab',
      cost_price: 35000,
      selling_price: 58000,
      current_stock: 35,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '👑 Terlaris',
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600',
      description: 'Beras basmati aromatik dimasak rempah mandi khas Hadramaut dengan potongan daging kambing panggang lembut & sambal dhabah.'
    },
    {
      product_id: 'P002',
      barcode_sku: 'KBL-002',
      product_name: 'Nasi Kebuli Daging Kambing Spesial',
      category: 'Nasi Rempah Arab',
      cost_price: 32000,
      selling_price: 55000,
      current_stock: 28,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '⭐ Favorit',
      image_url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600',
      description: 'Nasi kebuli gurih minyak samin, rempah kapulaga & cengkeh, taburan kismis manis serta acar nanas segar.'
    },
    {
      product_id: 'P003',
      barcode_sku: 'BRY-003',
      product_name: 'Nasi Briyani Ayam Panggang Rempah',
      category: 'Nasi Rempah Arab',
      cost_price: 24000,
      selling_price: 42000,
      current_stock: 30,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🔥 Populer',
      image_url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600',
      description: 'Beras basmati saffron harum bertingkat dengan paha ayam panggang rempah khas Mughlai yang empuk meresap.'
    },
    {
      product_id: 'P004',
      barcode_sku: 'MND-004',
      product_name: 'Nasi Mandi Ayam Asap (Half Chicken)',
      category: 'Nasi Rempah Arab',
      cost_price: 26000,
      selling_price: 45000,
      current_stock: 22,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🍗 Porsi Kenyang',
      image_url: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600',
      description: 'Setengah ekor ayam bakar aroma asap arang khas Arab di atas hamparan nasi basmati harum kuning keemasan.'
    },
    {
      product_id: 'P005',
      barcode_sku: 'BRY-005',
      product_name: 'Nasi Briyani Kambing Kismis Kacang Kenari',
      category: 'Nasi Rempah Arab',
      cost_price: 36000,
      selling_price: 60000,
      current_stock: 20,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '✨ Premium',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600',
      description: 'Paduan daging kambing empuk berbumbu kari pekat dengan taburan kenari panggang gurih dan kismis manis.'
    },

    // 2. Kategori: Camilan & Roti Arab
    {
      product_id: 'P006',
      barcode_sku: 'SNK-001',
      product_name: 'Sambosa Daging Kari Keju (Isi 4)',
      category: 'Camilan & Roti Arab',
      cost_price: 14000,
      selling_price: 28000,
      current_stock: 40,
      min_stock_alert: 8,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🥟 Renyah',
      image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600',
      description: 'Pastry segitiga renyah isi cincangan daging sapi berbumbu kari gurih dan lelehan keju mozzarella.'
    },
    {
      product_id: 'P007',
      barcode_sku: 'MRY-002',
      product_name: 'Roti Maryam Coklat Keju Susu',
      category: 'Camilan & Roti Arab',
      cost_price: 10000,
      selling_price: 22000,
      current_stock: 35,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🧀 Manis Gurih',
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600',
      description: 'Roti canai/maryam berlapis mentega garing di luar lembut di dalam dengan parutan keju cheddar & susu coklat kental manis.'
    },
    {
      product_id: 'P008',
      barcode_sku: 'SWR-003',
      product_name: 'Shawarma Kebab Daging Sapi Arab',
      category: 'Camilan & Roti Arab',
      cost_price: 16000,
      selling_price: 30000,
      current_stock: 25,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🌯 Best Snack',
      image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600',
      description: 'Irisan daging sapi panggang berbumbu khas Timur Tengah digulung roti pita tipis dengan garlic sauce dan selada segar.'
    },
    {
      product_id: 'P009',
      barcode_sku: 'HMS-004',
      product_name: 'Hummus Creamy & Roti Pita Hangat',
      category: 'Camilan & Roti Arab',
      cost_price: 12000,
      selling_price: 25000,
      current_stock: 18,
      min_stock_alert: 4,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🌱 Otentik',
      image_url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600',
      description: 'Puree kacang arab lembut berpadu pasta wijen tahini, minyak zaitun extra virgin, disajikan dengan 2 roti pita hangat.'
    },

    // 3. Kategori: Minuman & Teh Rempah
    {
      product_id: 'P010',
      barcode_sku: 'DRN-001',
      product_name: 'Teh Adeni Susu Rempah (Shahi Adani)',
      category: 'Minuman & Teh Rempah',
      cost_price: 7000,
      selling_price: 18000,
      current_stock: 50,
      min_stock_alert: 10,
      unit_measure: 'cup',
      vertical: 'RESTO',
      badge: '☕ Best Seller',
      image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
      description: 'Seduhan teh hitam khas Yaman dengan rebusan susu kental, kapulaga, kayu manis, dan cengkeh hangat penenang badan.'
    },
    {
      product_id: 'P011',
      barcode_sku: 'DRN-002',
      product_name: 'Kopi Gahwa Arabica Cardamom (Ceret Kecil)',
      category: 'Minuman & Teh Rempah',
      cost_price: 10000,
      selling_price: 25000,
      current_stock: 30,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '✨ Tradisional',
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
      description: 'Kopi arabica sangrai ringan beraroma rempah kapulaga, disajikan hangat dengan 3 butir kurma ajwa manis legit.'
    },
    {
      product_id: 'P012',
      barcode_sku: 'DRN-003',
      product_name: 'Es Karkadeh Segar (Hibiscus Cooler)',
      category: 'Minuman & Teh Rempah',
      cost_price: 6000,
      selling_price: 16000,
      current_stock: 45,
      min_stock_alert: 10,
      unit_measure: 'cup',
      vertical: 'RESTO',
      badge: '❄️ Dingin Segar',
      image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600',
      description: 'Minuman sari bunga rosela dingin khas Mesir dengan rasa asam manis segar alami yang melegakan dahaga.'
    },

    // 4. Kategori: Penutup & Dessert
    {
      product_id: 'P013',
      barcode_sku: 'DST-001',
      product_name: 'Umm Ali Puff Pastry Pudding',
      category: 'Penutup & Dessert',
      cost_price: 13000,
      selling_price: 28000,
      current_stock: 15,
      min_stock_alert: 4,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🍮 Manis Lembut',
      image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
      description: 'Dessert tradisional Timur Tengah dari lapisan puff pastry, susu vanila kental manis panggang, almond, dan kismis.'
    },
    {
      product_id: 'P014',
      barcode_sku: 'DST-002',
      product_name: 'Baklava Pistachio Crispy (Isi 3)',
      category: 'Penutup & Dessert',
      cost_price: 16000,
      selling_price: 32000,
      current_stock: 18,
      min_stock_alert: 5,
      unit_measure: 'porsi',
      vertical: 'RESTO',
      badge: '🍯 Madu Gurih',
      image_url: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600',
      description: 'Kue filo pastry renyah berlapis cincangan kacang pistachio dan disiram sirup madu wangi air mawar.'
    }
  ],

  // Mock Antrean Pesanan Resto Awal
  MOCK_ORDERS: [
    {
      order_id: 'ORD-20261107-101',
      timestamp: '11:42',
      customer_name: 'Ahmad Faiz',
      customer_phone: '081234567890',
      vertical: 'RESTO',
      table_number: 'Meja 03',
      items: [
        { name: 'Nasi Mandi Kambing Muda (Signature)', qty: 2, price: 58000 },
        { name: 'Teh Adeni Susu Rempah', qty: 2, price: 18000 }
      ],
      total_amount: 152000,
      payment_method: 'QRIS Dinamis',
      status: 'COOKING',
      status_label: 'Sedang Dimasak Dapur',
      notes: 'Sambal dhabah dipisah ya'
    },
    {
      order_id: 'ORD-20261107-102',
      timestamp: '11:35',
      customer_name: 'Fatimah Az-Zahra',
      customer_phone: '085678912345',
      vertical: 'RESTO',
      table_number: 'Meja 07',
      items: [
        { name: 'Nasi Kebuli Daging Kambing Spesial', qty: 1, price: 55000 },
        { name: 'Sambosa Daging Kari Keju (Isi 4)', qty: 1, price: 28000 }
      ],
      total_amount: 83000,
      payment_method: 'Tunai di Kasir',
      status: 'READY',
      status_label: 'Siap Diantar ke Meja',
      notes: 'Acar nanas ditambah'
    },
    {
      order_id: 'ORD-20261107-103',
      timestamp: '11:20',
      customer_name: 'Habib Umar',
      customer_phone: '087712345678',
      vertical: 'RESTO',
      table_number: 'Meja 01',
      items: [
        { name: 'Nasi Briyani Ayam Panggang Rempah', qty: 2, price: 42000 },
        { name: 'Es Karkadeh Segar', qty: 2, price: 16000 }
      ],
      total_amount: 116000,
      payment_method: 'QRIS Dinamis',
      status: 'COMPLETED',
      status_label: 'Selesai (Lunas)',
      notes: ''
    }
  ]
};
