/**
 * ============================================================================
 * RASH MITRA — APP CONTROLLER & OPERATIONAL WORKSPACE
 * Theme: Blue - Green - White (Restoran & Kuliner Timur Tengah)
 * Modules: POS Kasir Resto | Meja 1-10 (+QR Code Mandiri) | Stok | Antrean Dapur
 * ============================================================================
 */

(function () {
  'use strict';

  // State Management Aplikasi
  const State = {
    user: null, // { name: '', role: 'STAFF' | 'OWNER', email: '' }
    isDemo: false,
    currentVertical: 'RESTO',
    currentAppTab: 'pos', // pos | produk | pesanan | admin
    products: [],
    orders: [],
    tables: [], // Daftar Meja: Meja 01 s/d Meja 10 (+ meja tambahan)
    customers: [], // Data Pelanggan CRM (Kontak & Riwayat)
    settings: {},
    posCart: [],
    posClockedIn: true,
    posSelectedCategory: 'ALL',
    posSearchQuery: '',
    posPayMethod: 'CASH',
    posCashTendered: 0,
    posSelectedTable: 'Meja 01',
    editingProductSku: null,
    editingCustomerId: null
  };
  window.State = State;

  // Helper Safe Storage (Mencegah SecurityError di iframe / Safari / strict mode)
  const SafeStorage = {
    getItem: function (key) {
      try { return sessionStorage.getItem(key) || localStorage.getItem(key); } catch (e) { return null; }
    },
    setItem: function (key, val) {
      try { sessionStorage.setItem(key, val); } catch (e) {}
      try { localStorage.setItem(key, val); } catch (e) {}
    },
    removeItem: function (key) {
      try { sessionStorage.removeItem(key); } catch (e) {}
      try { localStorage.removeItem(key); } catch (e) {}
    }
  };

  // Toast Helper
  function showToast(message, duration) {
    try {
      duration = duration || 3000;
      let toast = document.getElementById('toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast-box';
        document.body.appendChild(toast);
      }
      toast.innerHTML = `<span class="material-symbols-outlined text-[18px] text-emerald-400">info</span><span>${message}</span>`;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, duration);
    } catch (e) {
      console.log('Toast:', message);
    }
  }

  function formatIDR(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  }

  // Helper Format Nomor & URL WhatsApp Resmi (Konversi 08... -> 628... Standar Internasional)
  window.formatWhatsAppUrl = function (phone, message = '') {
    if (!phone || phone === '-') return '#';
    let clean = String(phone).replace(/\D/g, '');
    if (!clean) return '#';

    // Konversi nomor lokal Indonesia (08... atau 8...) ke format internasional (628...)
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (clean.startsWith('8')) {
      clean = '62' + clean;
    }

    const encodedMsg = message ? encodeURIComponent(message) : '';
    // api.whatsapp.com/send membuka WhatsApp Desktop Mac & Web tanpa error "Tautan tidak dapat dibuka"
    return encodedMsg 
      ? `https://api.whatsapp.com/send?phone=${clean}&text=${encodedMsg}`
      : `https://api.whatsapp.com/send?phone=${clean}`;
  };

  function UtilitiesFormatDate() {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}${mo}${da}`;
  }

  // ============================================================================
  // PERSISTENSI DATA (ORDERS, PRODUK, & MEJA)
  // ============================================================================
  function loadPersistedOrders() {
    try {
      const stored = localStorage.getItem('RASH_MITRA_ORDERS');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Gagal membaca orders dari localStorage:', e);
    }
    return JSON.parse(JSON.stringify(window.APP_CONFIG.MOCK_ORDERS || []));
  }

  function savePersistedOrders(ordersList) {
    try {
      localStorage.setItem('RASH_MITRA_ORDERS', JSON.stringify(ordersList));
    } catch (e) {}
  }

  function loadPersistedSettings() {
    try {
      const s = localStorage.getItem('RASH_MITRA_SETTINGS');
      if (s) {
        return Object.assign({}, window.APP_CONFIG.MOCK_SETTINGS || {}, JSON.parse(s));
      }
    } catch (e) {}
    return Object.assign({}, window.APP_CONFIG.MOCK_SETTINGS || {});
  }

  function savePersistedSettings(settingsObj) {
    try {
      localStorage.setItem('RASH_MITRA_SETTINGS', JSON.stringify(settingsObj));
      if (settingsObj.KASIR_WA_NUMBER) {
        localStorage.setItem('RASH_MITRA_KASIR_WA', settingsObj.KASIR_WA_NUMBER);
      }
    } catch (e) {}
  }

  const RESTO_MENU_VERSION = '20261107_ARAB_V3';

  function loadPersistedProducts() {
    try {
      const storedVer = localStorage.getItem('RASH_MITRA_MENU_VER');
      const stored = localStorage.getItem('RASH_MITRA_PRODUCTS');
      let parsed = null;
      if (stored) {
        try { parsed = JSON.parse(stored); } catch (e) {}
      }

      // Deteksi apakah data di localStorage masih menu lama (bukan menu masakan Arab)
      const hasArabMenu = Array.isArray(parsed) && parsed.length > 0 && parsed.some(p => 
        p.product_name && (
          p.product_name.includes('Mandi') || 
          p.product_name.includes('Kebuli') || 
          p.product_name.includes('Briyani') ||
          p.category === 'Nasi Rempah Arab'
        )
      );

      // Jika versi belum update ATAU data tersimpan masih menu lama, sinkronkan otomatis ke menu Arab MOCK_PRODUCTS
      if (storedVer !== RESTO_MENU_VERSION || !hasArabMenu) {
        const defaultArabMenu = JSON.parse(JSON.stringify(window.APP_CONFIG.MOCK_PRODUCTS || []));
        localStorage.setItem('RASH_MITRA_PRODUCTS', JSON.stringify(defaultArabMenu));
        localStorage.setItem('RASH_MITRA_MENU_VER', RESTO_MENU_VERSION);
        return defaultArabMenu;
      }

      return parsed;
    } catch (e) {
      console.warn('Gagal membaca products dari localStorage:', e);
    }
    return JSON.parse(JSON.stringify(window.APP_CONFIG.MOCK_PRODUCTS || []));
  }

  // Fungsi Reset Manual Menu Resto Arab (Bisa dipanggil dari tombol UI)
  window.resetToDefaultArabMenu = function () {
    if (confirm('Muat ulang seluruh master menu masakan Arab default (Nasi Mandi, Kebuli, Briyani, Kebab, dll)?')) {
      const defaultArabMenu = JSON.parse(JSON.stringify(window.APP_CONFIG.MOCK_PRODUCTS || []));
      savePersistedProducts(defaultArabMenu);
      localStorage.setItem('RASH_MITRA_MENU_VER', RESTO_MENU_VERSION);
      State.products = defaultArabMenu;
      renderPosCatalog();
      renderPosCategories();
      renderInventoryTable();
      showToast('✅ Menu masakan Arab default berhasil dimuat ulang!');
    }
  };

  function savePersistedProducts(prodsList) {
    try {
      localStorage.setItem('RASH_MITRA_PRODUCTS', JSON.stringify(prodsList));
    } catch (e) {}
  }

  function loadPersistedTables() {
    try {
      const stored = localStorage.getItem('RASH_MITRA_TABLES');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Gagal membaca tables dari localStorage:', e);
    }
    return JSON.parse(JSON.stringify(window.APP_CONFIG.DEFAULT_TABLES || [
      'Meja 01', 'Meja 02', 'Meja 03', 'Meja 04', 'Meja 05',
      'Meja 06', 'Meja 07', 'Meja 08', 'Meja 09', 'Meja 10'
    ]));
  }

  function savePersistedTables(tablesList) {
    try {
      localStorage.setItem('RASH_MITRA_TABLES', JSON.stringify(tablesList));
    } catch (e) {}
  }

  function loadPersistedCustomers() {
    try {
      const stored = localStorage.getItem('RASH_MITRA_CUSTOMERS');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Gagal membaca customers dari localStorage:', e);
    }
    return JSON.parse(JSON.stringify(window.APP_CONFIG.DEFAULT_CUSTOMERS || []));
  }

  function savePersistedCustomers(customersList) {
    try {
      localStorage.setItem('RASH_MITRA_CUSTOMERS', JSON.stringify(customersList));
    } catch (e) {}
  }

  window.upsertCustomerFromOrder = function (name, phone, orderAmount, tableNumber) {
    if (!phone || phone === '-') return null;

    let customers = loadPersistedCustomers();
    const cleanPhone = phone.replace(/\D/g, '');
    let existing = customers.find(c => c.phone.replace(/\D/g, '') === cleanPhone);

    if (existing) {
      if (name && !name.startsWith('Tamu') && name !== 'Pelanggan') {
        existing.name = name;
      }
      existing.total_orders = (existing.total_orders || 0) + 1;
      existing.total_spent = (existing.total_spent || 0) + (Number(orderAmount) || 0);
      existing.last_visit = new Date().toISOString();
      if (tableNumber) existing.favorite_table = tableNumber;
    } else {
      existing = {
        customer_id: 'CUST-' + Date.now().toString().slice(-4),
        name: name || 'Tamu Baru',
        phone: phone,
        email: '',
        total_orders: 1,
        total_spent: Number(orderAmount) || 0,
        favorite_table: tableNumber || 'Meja 01',
        notes: 'Pemesanan Kasir / Mandiri',
        created_at: new Date().toISOString().split('T')[0]
      };
      customers.push(existing);
    }

    savePersistedCustomers(customers);
    State.customers = customers;
    return existing;
  };

  // ============================================================================
  // 1. INISIALISASI APLIKASI
  // ============================================================================
  async function initApp() {
    State.settings = loadPersistedSettings();
    State.products = loadPersistedProducts();
    State.orders = loadPersistedOrders();
    State.tables = loadPersistedTables();
    State.customers = loadPersistedCustomers();
    State.currentVertical = 'RESTO';

    populateAdminSettingsUI();

    // Cek Sesi Login
    const savedSession = SafeStorage.getItem('RASH_USER_SESSION');
    if (savedSession) {
      try {
        State.user = JSON.parse(savedSession);
        enterMainApplication();
      } catch (e) {
        showLoginGate();
      }
    } else {
      showLoginGate();
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth') === 'owner') {
        window.switchAuthTab('owner');
      }
    }

    setupEventListeners();
    initCloudOrderSync();

    // Sinkronisasi realtime saat tamu memesan dari katalog meja
    window.addEventListener('storage', (e) => {
      if (e.key === 'RASH_MITRA_ORDERS' || e.key === 'RASH_MITRA_NEW_ORDER_EVENT') {
        State.orders = loadPersistedOrders();
        renderOrdersQueueTable();
        updatePendingOrderBadge();

        let incomingOrder = null;
        if (e.key === 'RASH_MITRA_NEW_ORDER_EVENT' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            incomingOrder = parsed.order;
          } catch (err) {}
        }
        if (!incomingOrder && State.orders.length > 0) {
          incomingOrder = State.orders[0];
        }

        if (incomingOrder) {
          window.processIncomingOrder(incomingOrder, 'local_storage');
        }
      }
      if (e.key === 'RASH_MITRA_PRODUCTS') {
        State.products = loadPersistedProducts();
        renderPosCatalog();
        renderInventoryTable();
      }
      if (e.key === 'RASH_MITRA_TABLES') {
        State.tables = loadPersistedTables();
        renderActiveModelUI();
        renderTablesManager();
      }
      if (e.key === 'RASH_MITRA_CUSTOMERS') {
        State.customers = loadPersistedCustomers();
        renderActiveModelUI();
        if (State.currentAppTab === 'pelanggan') renderCustomersTable();
      }
      if (e.key === 'RASH_MITRA_SETTINGS') {
        State.settings = loadPersistedSettings();
        populateAdminSettingsUI();
        initCloudOrderSync();
      }
    });
  }

  // ============================================================================
  // 2. SISTEM LOGIN & OTORISASI
  // ============================================================================
  function showLoginGate() {
    const authGate = document.getElementById('authGateView');
    const mainApp = document.getElementById('mainAppView');
    if (authGate) authGate.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');
  }

  function enterMainApplication() {
    const authGate = document.getElementById('authGateView');
    const mainApp = document.getElementById('mainAppView');
    if (authGate) authGate.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');

    // Update Header Profil & Role
    const storeNameEl = document.getElementById('appStoreName');
    const userNameEl = document.getElementById('appUserName');
    if (storeNameEl) storeNameEl.textContent = State.settings.STORE_NAME || 'RASH Resto Timur Tengah';
    if (userNameEl) userNameEl.textContent = State.user.name;

    const roleBadge = document.getElementById('appRoleBadge');
    const navAdmin = document.getElementById('navTabAdmin');
    const isSuperAdmin = State.user.role === 'OWNER' || State.isDemo;

    if (roleBadge) {
      if (State.isDemo) {
        roleBadge.textContent = 'MODE DEMO RESTO';
        roleBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200';
      } else if (State.user.role === 'OWNER') {
        roleBadge.textContent = 'SUPER ADMIN RESTO';
        roleBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200';
      } else {
        roleBadge.textContent = 'KASIR RESTO AKTIF';
        roleBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200';
      }
    }

    if (navAdmin) {
      navAdmin.style.display = isSuperAdmin ? 'flex' : 'none';
    }

    // Inisialisasi tampilan secara aman (fail-safe rendering)
    try { renderActiveModelUI(); } catch (e) { console.error('Error renderActiveModelUI:', e); }
    try { renderPosCategories(); } catch (e) { console.error('Error renderPosCategories:', e); }
    try { renderPosCatalog(); } catch (e) { console.error('Error renderPosCatalog:', e); }
    try { renderInventoryTable(); } catch (e) { console.error('Error renderInventoryTable:', e); }
    try { renderOrdersQueueTable(); } catch (e) { console.error('Error renderOrdersQueueTable:', e); }
    try { renderTablesManager(); } catch (e) { console.error('Error renderTablesManager:', e); }
    try { updatePosCartUI(); } catch (e) { console.error('Error updatePosCartUI:', e); }
    try { updatePendingOrderBadge(); } catch (e) { console.error('Error updatePendingOrderBadge:', e); }
    try { generateInvoiceNumber(); } catch (e) { console.error('Error generateInvoiceNumber:', e); }
  }

  function updatePendingOrderBadge() {
    const badge = document.getElementById('pendingOrdersBadge');
    if (!badge) return;
    const pendingCount = State.orders.filter(o => o.status === 'PENDING' || o.status === 'RECEIVED' || o.status === 'COOKING').length;
    if (pendingCount > 0) {
      badge.textContent = pendingCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  function generateInvoiceNumber() {
    const invEl = document.getElementById('posInvoiceId');
    if (invEl) {
      invEl.textContent = '#INV-' + UtilitiesFormatDate() + '-' + Math.floor(100 + Math.random() * 900);
    }
  }

  window.switchAuthTab = function (tab) {
    const isStaff = tab === 'staff';
    const staffForm = document.getElementById('authStaffForm');
    const ownerForm = document.getElementById('authOwnerForm');
    const staffBtn = document.getElementById('authTabStaffBtn');
    const ownerBtn = document.getElementById('authTabOwnerBtn');

    if (staffForm) staffForm.classList.toggle('hidden', !isStaff);
    if (ownerForm) ownerForm.classList.toggle('hidden', isStaff);

    if (staffBtn) {
      staffBtn.className = isStaff
        ? 'flex-1 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-sm transition-all flex items-center justify-center gap-1.5'
        : 'flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:text-blue-600 transition-all flex items-center justify-center gap-1.5';
    }
    if (ownerBtn) {
      ownerBtn.className = !isStaff
        ? 'flex-1 py-2.5 text-xs font-bold rounded-xl bg-blue-600 text-white shadow-sm transition-all flex items-center justify-center gap-1.5'
        : 'flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:text-blue-600 transition-all flex items-center justify-center gap-1.5';
    }
  };

  window.handleStaffLogin = function () {
    const select = document.getElementById('loginStaffSelect');
    const pinInput = document.getElementById('loginStaffPin');
    const staffName = select ? select.value : 'Budi Santoso (Kasir 1)';
    const pin = pinInput ? pinInput.value.trim() : '';

    if (pin !== '1234') {
      showToast('⚠️ PIN Kasir keliru! Gunakan PIN default: 1234');
      return;
    }

    State.user = { name: staffName, role: 'STAFF', email: 'kasir@rashresto.id' };
    State.isDemo = false;
    SafeStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
    enterMainApplication();
    showToast(`👋 Selamat bertugas, ${staffName}!`);
  };

  window.handleOwnerLogin = function () {
    const user = (document.getElementById('ownerUser')?.value || '').trim();
    if (user.toLowerCase() === 'darurat' || user.toLowerCase() === 'admin') {
      State.user = { name: 'Super Admin Resto (Owner)', role: 'OWNER', email: 'owner@rashresto.id' };
      State.isDemo = false;
      SafeStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
      enterMainApplication();
      showToast('🔓 Panel Super Admin Resto Terbuka!');
    } else {
      showToast('⚠️ Username darurat: ketik "darurat"');
    }
  };

  window.handleGoogleLogin = function () {
    State.user = { name: 'Owner Google Workspace', role: 'OWNER', email: 'owner.resto@gmail.com' };
    State.isDemo = false;
    SafeStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
    enterMainApplication();
    showToast('✅ Berhasil masuk sebagai Super Admin Resto!');
  };

  window.quickDemoLogin = function (role) {
    State.isDemo = true;
    if (role === 'staff') {
      State.user = { name: 'Kasir Demo (Budi)', role: 'STAFF', email: 'demo-kasir@rash.id' };
    } else {
      State.user = { name: 'Super Admin Resto', role: 'OWNER', email: 'demo-owner@rash.id' };
    }
    SafeStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
    enterMainApplication();
    showToast(`⚡ Masuk instan sebagai ${State.user.name}`);
  };

  window.handleLogoutApp = function () {
    SafeStorage.removeItem('RASH_USER_SESSION');
    State.user = null;
    State.isDemo = false;
    State.posCart = [];
    showLoginGate();
    showToast('🔒 Sesi kasir telah ditutup dengan aman.');
  };

  // ============================================================================
  // 3. NAVIGASI TAB APLIKASI
  // ============================================================================
  window.switchAppTab = function (tab) {
    State.currentAppTab = tab;

    // Sembunyikan semua panel
    document.querySelectorAll('.app-panel').forEach(p => p.classList.add('hidden'));

    // Tampilkan panel aktif
    if (tab === 'pos') {
      document.getElementById('panelTabPos')?.classList.remove('hidden');
      renderPosCatalog();
    }
    if (tab === 'produk') {
      document.getElementById('panelTabProduk')?.classList.remove('hidden');
      renderInventoryTable();
    }
    if (tab === 'pesanan') {
      document.getElementById('panelTabPesanan')?.classList.remove('hidden');
      renderOrdersQueueTable();
      updatePendingOrderBadge();
    }
    if (tab === 'pelanggan') {
      document.getElementById('panelTabPelanggan')?.classList.remove('hidden');
      renderCustomersTable();
    }
    if (tab === 'admin') {
      if (State.user.role !== 'OWNER' && !State.isDemo) {
        showToast('⛔ Akses Terbatas: Khusus Super Admin.');
        window.switchAppTab('pos');
        return;
      }
      document.getElementById('panelTabAdmin')?.classList.remove('hidden');
      renderTablesManager();
    }

    // Styling tombol navigasi
    document.querySelectorAll('.nav-app-btn').forEach(btn => {
      btn.className = 'nav-app-btn px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-all shrink-0';
    });

    const activeMap = {
      pos: 'navTabPos',
      produk: 'navTabProduk',
      pesanan: 'navTabPesanan',
      pelanggan: 'navTabPelanggan',
      admin: 'navTabAdmin'
    };

    const activeEl = document.getElementById(activeMap[tab]);
    if (activeEl) {
      activeEl.className = 'nav-app-btn px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center gap-2 transition-all shrink-0';
    }
  };

  // ============================================================================
  // 4. MANAJEMEN MEJA RESTORAN & POS REGISTER INPUTS
  // ============================================================================
  function renderActiveModelUI() {
    const inputsBox = document.getElementById('posVerticalInputs');
    if (!inputsBox) return;

    // Dapatkan daftar meja yang sedang memiliki antrean aktif
    const occupiedTables = State.orders
      .filter(o => o.status === 'COOKING' || o.status === 'RECEIVED' || o.status === 'READY')
      .map(o => o.table_number);

    inputsBox.innerHTML = `
      <div>
        <label class="block text-[11px] font-bold text-slate-700 mb-1">Nomor Meja Restoran:</label>
        <select id="posTableNumberSelect" onchange="window.handlePosTableChange(this.value)" class="w-full text-xs font-bold rounded-xl border-slate-200 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500">
          ${State.tables.map(t => {
            const isOccupied = occupiedTables.includes(t);
            const isSelected = t === State.posSelectedTable;
            return `<option value="${t}" ${isSelected ? 'selected' : ''}>
              ${isOccupied ? '🔴' : '🟢'} ${t} ${isOccupied ? '(Ada Pesanan)' : '(Kosong)'}
            </option>`;
          }).join('')}
          <option value="Takeaway (Bungkus)" ${State.posSelectedTable === 'Takeaway (Bungkus)' ? 'selected' : ''}>🥡 Takeaway (Bungkus)</option>
          <option value="Delivery Ojol" ${State.posSelectedTable === 'Delivery Ojol' ? 'selected' : ''}>🛵 Delivery Ojek Online</option>
        </select>
      </div>
      <div>
        <label class="block text-[11px] font-bold text-slate-700 mb-1">Tipe Layanan:</label>
        <select id="posServiceType" class="w-full text-xs font-semibold rounded-xl border-slate-200 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500">
          <option value="Dine-in">Makan di Tempat (Dine-in)</option>
          <option value="Takeaway">Bungkus Pulang (Takeaway)</option>
        </select>
      </div>

      <!-- Data Pelanggan CRM Resto (Kirim Resi WA Otomatis) -->
      <div class="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div class="flex items-center justify-between mb-1.5">
          <label class="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">contacts</span>
            <span>Data Pelanggan (Resi WA):</span>
          </label>
          <button type="button" onclick="window.openCustomerModal()" class="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5">
            + Tambah Baru
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <select id="posCustomerSelect" onchange="window.handlePosCustomerSelect(this.value)" class="w-full text-xs rounded-xl border-slate-200 p-2 bg-white font-medium focus:ring-2 focus:ring-blue-500">
              <option value="">-- Tamu Walk-in / Umum --</option>
              ${State.customers.map(c => `
                <option value="${c.customer_id}">${c.name} (${c.phone})</option>
              `).join('')}
            </select>
          </div>
          <div>
            <input type="tel" id="posCustomerPhone" oninput="window.handlePosPhoneInput(this.value)" placeholder="No. WA: 081234567..." class="w-full text-xs font-mono rounded-xl border-slate-200 p-2 bg-white focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div class="mt-2 flex items-center justify-between gap-2">
          <input type="text" id="posCustomerName" placeholder="Nama Pelanggan / Tamu..." class="flex-1 text-xs rounded-xl border-slate-200 p-1.5 bg-white font-medium focus:ring-2 focus:ring-blue-500" />
          <label class="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600 shrink-0 cursor-pointer">
            <input type="checkbox" id="posSaveCustomerCheckbox" checked class="rounded text-blue-600 focus:ring-blue-500 text-xs" />
            <span>Simpan Kontak</span>
          </label>
        </div>
      </div>

      <div class="col-span-2">
        <label class="block text-[10px] font-bold text-slate-500 mb-1">Catatan Khusus Koki Dapur (Opsional):</label>
        <input type="text" id="posKitchenNotes" placeholder="Contoh: Sambal dhabah dipisah, porsi nasi banyak..." class="w-full text-xs rounded-xl border-slate-200 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500" />
      </div>
    `;
  }

  window.handlePosCustomerSelect = function (custId) {
    const c = State.customers.find(item => item.customer_id === custId);
    const nameInput = document.getElementById('posCustomerName');
    const phoneInput = document.getElementById('posCustomerPhone');

    if (c) {
      if (nameInput) nameInput.value = c.name;
      if (phoneInput) phoneInput.value = c.phone;
      showToast(`👤 Terhubung: ${c.name} (${c.favorite_table ? 'Favorit: ' + c.favorite_table : c.phone})`);
    } else {
      if (nameInput) nameInput.value = '';
      if (phoneInput) phoneInput.value = '';
    }
  };

  window.handlePosPhoneInput = function (val) {
    const clean = val.replace(/\D/g, '');
    if (clean.length >= 8) {
      const c = State.customers.find(item => item.phone.replace(/\D/g, '').includes(clean));
      if (c) {
        const nameInput = document.getElementById('posCustomerName');
        const select = document.getElementById('posCustomerSelect');
        if (nameInput && !nameInput.value) nameInput.value = c.name;
        if (select) select.value = c.customer_id;
        showToast(`✨ Pelanggan Ditemukan: ${c.name}`);
      }
    }
  };

  window.handlePosTableChange = function (val) {
    State.posSelectedTable = val;
  };

  // --- FITUR KELOLA MEJA (SUPER ADMIN) ---
  window.getCatalogTableQrUrl = function (tableName) {
    const currentPath = window.location.pathname;
    let catalogBase;
    if (currentPath.includes('/frontend/')) {
      catalogBase = `${window.location.origin}${currentPath.replace(/\/frontend\/.*$/, '')}/frontend/katalog.html`;
    } else {
      const base = `${window.location.origin}${currentPath.replace(/\/index\.html.*$/, '').replace(/\/$/, '')}`;
      catalogBase = `${base}/katalog.html`;
    }

    const kasirPhone = (State.settings && State.settings.KASIR_WA_NUMBER) || 
                       (window.APP_CONFIG && window.APP_CONFIG.KASIR_WA_NUMBER) || 
                       '6281234567890';
    const cleanPhone = normalizeKasirPhoneNumber(kasirPhone);

    return `${catalogBase}?meja=${encodeURIComponent(tableName)}&kasir=${encodeURIComponent(cleanPhone)}`;
  };

  window.renderTablesManager = function () {
    const container = document.getElementById('tablesGridContainer');
    if (!container) return;

    const countEl = document.getElementById('totalTablesCount');
    if (countEl) countEl.textContent = State.tables.length;

    container.innerHTML = State.tables.map((tableName, idx) => {
      const qrUrl = window.getCatalogTableQrUrl(tableName);
      const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}`;

      return `
        <div class="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-400 shadow-xs flex flex-col justify-between transition-all group">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[15px]">table_restaurant</span>
                ${tableName}
              </span>
              <button onclick="window.deleteTable('${tableName}')" class="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors" title="Hapus Meja Ini">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>

            <!-- QR Code Mini Thumbnail -->
            <div class="w-full aspect-square max-w-[140px] mx-auto bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center justify-center mb-3">
              <img src="${qrImgSrc}" alt="QR ${tableName}" class="w-full h-full object-contain" loading="lazy" />
            </div>

            <p class="text-[10px] text-center text-slate-500 line-clamp-1 mb-2 font-mono">
              ${tableName} • Scan Mandiri
            </p>
          </div>

          <!-- Actions -->
          <div class="space-y-1.5 pt-2 border-t border-slate-100">
            <button onclick="window.openTableQrModal('${tableName}')" class="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all">
              <span class="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>Cetak QR Stand</span>
            </button>
            <a href="${qrUrl}" target="_blank" class="w-full py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] flex items-center justify-center gap-1 border border-slate-200 transition-colors">
              <span class="material-symbols-outlined text-[14px]">open_in_new</span>
              <span>Tes Buka Menu</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  };

  window.addNewTable = function () {
    const input = document.getElementById('newTableNameInput');
    let name = (input ? input.value : '').trim();

    if (!name) {
      // Rekomendasikan nama meja otomatis
      const nextNum = State.tables.length + 1;
      name = `Meja ${String(nextNum).padStart(2, '0')}`;
    }

    if (State.tables.includes(name)) {
      showToast(`⚠️ Nama "${name}" sudah terdaftar! Gunakan nama lain.`);
      return;
    }

    State.tables.push(name);
    savePersistedTables(State.tables);

    if (input) input.value = '';
    renderTablesManager();
    renderActiveModelUI();
    showToast(`✅ ${name} berhasil ditambahkan ke daftar meja resto!`);
  };

  window.deleteTable = function (name) {
    if (confirm(`Yakin ingin menghapus ${name}? Tamu tidak akan bisa lagi scan barcode meja ini.`)) {
      State.tables = State.tables.filter(t => t !== name);
      savePersistedTables(State.tables);
      renderTablesManager();
      renderActiveModelUI();
      showToast(`🗑️ ${name} telah dihapus.`);
    }
  };

  window.openTableQrModal = function (tableName) {
    const modal = document.getElementById('tableQrModal');
    if (!modal) return;

    const targetUrl = window.getCatalogTableQrUrl(tableName);
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(targetUrl)}`;

    document.getElementById('tableQrModalTitle').textContent = tableName;
    document.getElementById('tableQrModalImg').src = qrImgSrc;
    document.getElementById('tableQrModalUrl').textContent = targetUrl;
    document.getElementById('tableQrModalBtnPrint').onclick = function () {
      window.printTableQrStand(tableName, qrImgSrc, targetUrl);
    };
    document.getElementById('tableQrModalBtnTest').href = targetUrl;

    modal.classList.remove('opacity-0', 'pointer-events-none');
  };

  window.closeTableQrModal = function () {
    const modal = document.getElementById('tableQrModal');
    if (modal) modal.classList.add('opacity-0', 'pointer-events-none');
  };

  // ============================================================================
  // UNIVERSAL IFRAME PRINTER (ISOLASI DOKUMEN CETAK 58MM BEBAS BLANK PAGE)
  // ============================================================================
  window.printReceiptHtml = function (htmlContent, title = 'Struk Kasir 58mm') {
    let iframe = document.getElementById('receiptPrintIframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'receiptPrintIframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
    }

    const frameDoc = iframe.contentWindow || iframe.contentDocument;
    const doc = frameDoc.document || frameDoc;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page {
            size: 58mm auto;
            margin: 0mm;
          }
          @media print {
            html, body {
              width: 58mm !important;
              max-width: 58mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              background: #fff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            width: 58mm;
            max-width: 58mm;
            margin: 0 auto;
            padding: 3mm 2mm;
            font-family: 'JetBrains Mono', 'Courier New', Courier, monospace;
            font-size: 11px;
            line-height: 1.35;
            color: #000;
            background: #fff;
            -webkit-font-smoothing: antialiased;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .divider {
            border-top: 1px dashed #000;
            margin: 5px 0;
          }
          .double-divider {
            border-top: 2px dashed #000;
            margin: 6px 0;
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 3px;
          }
          .item-name {
            flex: 1;
            padding-right: 4px;
            word-break: break-word;
          }
          .item-price {
            white-space: nowrap;
            text-align: right;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
            }, 100);
          };
        <\/script>
      </body>
      </html>
    `);
    doc.close();
  };

  window.printTableQrStand = function (tableName, qrImgSrc, targetUrl) {
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; text-align: center; border: 2px solid #000; padding: 18px; border-radius: 14px; width: 100%; max-width: 320px; margin: 0 auto; box-sizing: border-box;">
        <div style="font-size: 13px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">${State.settings.STORE_NAME || 'RASH RESTO TIMUR TENGAH'}</div>
        <div style="font-size: 10px; color: #555; margin-top: 2px;">Smart Ordering & QR Menu Digital</div>
        <div style="border-top: 1px dashed #999; margin: 10px 0;"></div>
        
        <h2 style="font-size: 24px; font-weight: 900; margin: 0; color: #000;">${tableName}</h2>
        <p style="font-size: 11px; font-weight: 600; color: #333; margin: 4px 0 10px;">Scan QR Code dengan Kamera HP Anda</p>
        
        <div style="display: inline-block; padding: 8px; background: #fff; border: 1.5px solid #000; border-radius: 12px;">
          <img src="${qrImgSrc}" style="width: 180px; height: 180px; display: block;" />
        </div>

        <div style="margin-top: 10px; font-size: 10px; color: #000; line-height: 1.4; text-align: left; padding: 0 8px;">
          <strong>1.</strong> Arahkan kamera HP ke QR Code<br>
          <strong>2.</strong> Pilih Menu Timur Tengah Lezat & Kirim Pesanan<br>
          <strong>3.</strong> Pesanan langsung dimasak di dapur resto kami!
        </div>

        <div style="border-top: 1px dashed #999; margin: 10px 0;"></div>
        <div style="font-size: 9px; color: #777;">Powered by RASH Mitra POS</div>
      </div>
    `;

    const container = document.getElementById('tableQrPrintContainer');
    if (container) container.innerHTML = html;

    window.printReceiptHtml(html, `Stand-QR-${tableName}`);
  };

  window.printAllTableQrStands = function () {
    const html = State.tables.map(tableName => {
      const targetUrl = window.getCatalogTableQrUrl(tableName);
      const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}`;
      return `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; text-align: center; border: 2px solid #000; padding: 18px; border-radius: 14px; margin-bottom: 25px; page-break-after: always; max-width: 320px; margin-left: auto; margin-right: auto; box-sizing: border-box;">
          <div style="font-size: 13px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;">${State.settings.STORE_NAME || 'RASH RESTO TIMUR TENGAH'}</div>
          <div style="font-size: 10px; color: #555;">Buku Menu Digital Meja</div>
          <div style="border-top: 1px dashed #000; margin: 10px 0;"></div>
          <h2 style="font-size: 24px; font-weight: 900; margin: 0;">${tableName}</h2>
          <p style="font-size: 11px; margin: 4px 0 10px;">Scan QR untuk Memesan Langsung</p>
          <img src="${qrImgSrc}" style="width: 180px; height: 180px; margin: 0 auto; display: block;" />
          <div style="margin-top: 10px; font-size: 10px;">Pesanan langsung masuk ke Dapur & Kasir Resto</div>
        </div>
      `;
    }).join('');

    const container = document.getElementById('tableQrPrintContainer');
    if (container) container.innerHTML = html;

    window.printReceiptHtml(html, 'Semua-QR-Meja-Resto');
  };

  // ============================================================================
  // 5. STASIUN KASIR RESTO (POS REGISTER & CATALOG)
  // ============================================================================
  function renderPosCategories() {
    const container = document.getElementById('posCategoryPills');
    if (!container) return;

    const categories = ['ALL', ...new Set(State.products.map(p => p.category))];

    container.innerHTML = categories.map(cat => {
      const isSel = State.posSelectedCategory === cat;
      const label = cat === 'ALL' ? 'Semua Menu Arab' : cat;
      return `
        <button onclick="window.filterPosCategory('${cat}', this)" class="pos-cat-pill px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
          isSel ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }">
          ${label}
        </button>
      `;
    }).join('');
  }

  window.filterPosCategory = function (cat, el) {
    State.posSelectedCategory = cat;
    renderPosCategories();
    renderPosCatalog();
  };

  window.handlePosSearchInput = function (query) {
    State.posSearchQuery = (query || '').trim().toLowerCase();
    renderPosCatalog();
  };

  function renderPosCatalog() {
    const container = document.getElementById('posCatalogGrid');
    if (!container) return;

    let items = State.products;

    if (State.posSelectedCategory !== 'ALL') {
      items = items.filter(p => p.category.toLowerCase() === State.posSelectedCategory.toLowerCase());
    }

    if (State.posSearchQuery) {
      items = items.filter(p =>
        p.product_name.toLowerCase().includes(State.posSearchQuery) ||
        p.barcode_sku.toLowerCase().includes(State.posSearchQuery)
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center text-slate-400">
          <span class="material-symbols-outlined text-4xl mb-1">search_off</span>
          <p class="text-xs font-semibold">Tidak ada menu yang cocok dengan pencarian.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(p => {
      const isLowStock = p.current_stock <= (p.min_stock_alert || 5);
      return `
        <div onclick="window.addToPosCart('${p.barcode_sku}')" class="bg-white rounded-2xl p-3 border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group active:scale-[0.98]">
          <div>
            <div class="h-28 w-full rounded-xl overflow-hidden mb-2.5 relative bg-slate-100">
              <img src="${p.image_url}" alt="${p.product_name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
              <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white font-mono text-[9px] font-bold">
                ${p.barcode_sku}
              </span>
              <span class="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md font-bold text-[10px] shadow-sm ${
                isLowStock ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
              }">
                Stok: ${p.current_stock}
              </span>
            </div>
            <h4 class="font-bold text-xs text-slate-900 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">${p.product_name}</h4>
            <p class="text-[10px] text-slate-500 line-clamp-1">${p.category}</p>
          </div>
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span class="font-mono font-black text-sm text-blue-700">${formatIDR(p.selling_price)}</span>
            <button type="button" class="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center font-bold transition-all shadow-sm">
              <span class="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.addToPosCart = function (sku) {
    const prod = State.products.find(p => p.barcode_sku === sku);
    if (!prod) return;

    if (prod.current_stock <= 0) {
      showToast(`⚠️ Stok menu "${prod.product_name}" habis!`);
      return;
    }

    const exist = State.posCart.find(i => i.barcode_sku === sku);
    if (exist) {
      if (exist.qty >= prod.current_stock) {
        showToast(`⚠️ Tidak bisa melebihi stok tersedia (${prod.current_stock}).`);
        return;
      }
      exist.qty++;
    } else {
      State.posCart.push({
        barcode_sku: prod.barcode_sku,
        name: prod.product_name,
        price: prod.selling_price,
        qty: 1
      });
    }

    updatePosCartUI();
  };

  window.changePosCartQty = function (idx, delta) {
    if (!State.posCart[idx]) return;
    const item = State.posCart[idx];
    const prod = State.products.find(p => p.barcode_sku === item.barcode_sku);

    if (delta > 0 && prod && item.qty >= prod.current_stock) {
      showToast(`⚠️ Batas stok menu tercapai (${prod.current_stock}).`);
      return;
    }

    item.qty += delta;
    if (item.qty <= 0) {
      State.posCart.splice(idx, 1);
    }
    updatePosCartUI();
  };

  window.removePosCartItem = function (idx) {
    State.posCart.splice(idx, 1);
    updatePosCartUI();
  };

  window.clearPosCart = function () {
    if (State.posCart.length === 0) return;
    State.posCart = [];
    updatePosCartUI();
    showToast('🗑️ Pesanan kasir dikosongkan.');
  };

  function updatePosCartUI() {
    const list = document.getElementById('posCartItemsList');
    const subtotalEl = document.getElementById('posSubtotalText');
    const grandEl = document.getElementById('posGrandTotalText');
    const countEl = document.getElementById('posCartItemCount');

    if (!list) return;

    const totalQty = State.posCart.reduce((sum, i) => sum + i.qty, 0);
    const grandTotal = State.posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);

    if (countEl) countEl.textContent = totalQty;
    if (subtotalEl) subtotalEl.textContent = formatIDR(grandTotal);
    if (grandEl) grandEl.textContent = formatIDR(grandTotal);

    if (State.posPayMethod === 'CASH') {
      window.recalculatePosChange();
    }

    if (State.posCart.length === 0) {
      State.posCashTendered = 0;
      const cashInput = document.getElementById('posCashTenderedInput');
      if (cashInput) cashInput.value = '';
      window.recalculatePosChange();
      list.innerHTML = `
        <div class="text-center py-10 text-slate-400">
          <span class="material-symbols-outlined text-3xl mb-1 text-slate-300">point_of_sale</span>
          <p class="text-xs font-semibold">Pesanan meja masih kosong.</p>
          <p class="text-[10px] text-slate-400 mt-0.5">Pilih menu Timur Tengah di sebelah kiri untuk menambah ke tagihan.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = State.posCart.map((item, idx) => `
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
        <div class="flex-1 pr-2 truncate">
          <div class="font-bold text-slate-800 truncate">${item.name}</div>
          <div class="text-[11px] text-slate-500 font-mono">${formatIDR(item.price)}</div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button onclick="window.changePosCartQty(${idx}, -1)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold flex items-center justify-center">-</button>
          <span class="w-6 text-center font-bold font-mono text-slate-900">${item.qty}</span>
          <button onclick="window.changePosCartQty(${idx}, 1)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold flex items-center justify-center">+</button>
          <span class="font-bold font-mono text-blue-700 w-20 text-right">${formatIDR(item.price * item.qty)}</span>
          <button onclick="window.removePosCartItem(${idx})" class="w-6 h-6 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    `).join('');
  }

  window.setPosPayMethod = function (method) {
    State.posPayMethod = method;
    const btnCash = document.getElementById('payMethodCashBtn');
    const btnQris = document.getElementById('payMethodQrisBtn');
    const btnTf = document.getElementById('payMethodTransferBtn');
    const quickCashBox = document.getElementById('quickCashPillsBox');

    if (btnCash) btnCash.className = method === 'CASH'
      ? 'py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1'
      : 'py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1';

    if (btnQris) btnQris.className = method === 'QRIS'
      ? 'py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1'
      : 'py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1';

    if (btnTf) btnTf.className = method === 'TRANSFER'
      ? 'py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center justify-center gap-1'
      : 'py-2 rounded-xl text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center gap-1';

    if (quickCashBox) {
      quickCashBox.style.display = method === 'CASH' ? 'block' : 'none';
      if (method === 'CASH') {
        window.recalculatePosChange();
      }
    }
  };

  // Kalkulasi & Input Nominal Uang Tunai Diterima
  window.handleCashTenderInput = function (val) {
    const clean = String(val || '').replace(/\D/g, '');
    const num = clean ? parseInt(clean, 10) : 0;
    State.posCashTendered = num;

    const input = document.getElementById('posCashTenderedInput');
    if (input) {
      input.value = num ? Number(num).toLocaleString('id-ID') : '';
    }
    window.recalculatePosChange();
  };

  window.clearCashTenderInput = function () {
    State.posCashTendered = 0;
    const input = document.getElementById('posCashTenderedInput');
    if (input) {
      input.value = '';
      if (typeof input.focus === 'function') input.focus();
    }
    window.recalculatePosChange();
  };

  window.setQuickCash = function (val) {
    const grand = State.posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    if (val === 'EXACT') {
      State.posCashTendered = grand;
    } else {
      State.posCashTendered = Number(val);
    }

    const input = document.getElementById('posCashTenderedInput');
    if (input) {
      input.value = State.posCashTendered ? Number(State.posCashTendered).toLocaleString('id-ID') : '';
    }
    window.recalculatePosChange();

    if (val === 'EXACT') {
      showToast(`💵 Uang Pas: ${formatIDR(grand)}`);
    } else {
      const diff = State.posCashTendered - grand;
      if (diff >= 0) {
        showToast(`💵 Diterima: ${formatIDR(val)} | Kembalian: ${formatIDR(diff)}`);
      } else {
        showToast(`⚠️ Uang kurang ${formatIDR(Math.abs(diff))}`);
      }
    }
  };

  window.recalculatePosChange = function () {
    const grand = State.posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const tendered = Number(State.posCashTendered) || 0;

    const card = document.getElementById('posChangeCard');
    const labelEl = document.getElementById('posChangeLabel');
    const textEl = document.getElementById('posChangeText');
    const badgeEl = document.getElementById('posChangeBadge');
    const iconEl = document.getElementById('posChangeIcon');

    if (!card || !textEl || !labelEl || !badgeEl) return;

    if (tendered === 0) {
      if (grand > 0) {
        card.className = 'p-2.5 rounded-xl border transition-all flex items-center justify-between bg-slate-50 border-slate-200 text-slate-700';
        if (iconEl) {
          iconEl.textContent = 'payments';
          iconEl.className = 'material-symbols-outlined text-[22px] text-slate-400';
        }
        labelEl.textContent = 'Nominal Tunai:';
        labelEl.className = 'text-[9px] font-bold uppercase tracking-wider text-slate-500';
        textEl.textContent = 'Masukkan Nominal';
        textEl.className = 'font-mono text-xs font-bold leading-tight text-slate-500';
        badgeEl.textContent = 'Belum Diisi';
        badgeEl.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300';
      } else {
        card.className = 'p-2.5 rounded-xl border transition-all flex items-center justify-between bg-emerald-50 border-emerald-200 text-emerald-800';
        if (iconEl) {
          iconEl.textContent = 'change_circle';
          iconEl.className = 'material-symbols-outlined text-[22px] text-emerald-600';
        }
        labelEl.textContent = 'Kembalian Kasir:';
        labelEl.className = 'text-[9px] font-bold uppercase tracking-wider text-slate-500';
        textEl.textContent = 'Rp 0';
        textEl.className = 'font-mono text-base font-black leading-tight text-emerald-700';
        badgeEl.textContent = 'Uang Pas';
        badgeEl.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200';
      }
      return;
    }

    const diff = tendered - grand;

    if (diff >= 0) {
      // Uang cukup atau ada kembalian
      card.className = 'p-2.5 rounded-xl border transition-all flex items-center justify-between bg-emerald-50 border-emerald-300 text-emerald-900';
      if (iconEl) {
        iconEl.textContent = 'change_circle';
        iconEl.className = 'material-symbols-outlined text-[22px] text-emerald-600';
      }
      labelEl.textContent = 'Kembalian Kasir:';
      labelEl.className = 'text-[9px] font-bold uppercase tracking-wider text-emerald-700';
      textEl.textContent = formatIDR(diff);
      textEl.className = 'font-mono text-base font-black leading-tight text-emerald-700';

      if (diff === 0) {
        badgeEl.textContent = 'Uang Pas';
        badgeEl.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
      } else {
        badgeEl.textContent = `Kembali ${formatIDR(diff)}`;
        badgeEl.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300';
      }
    } else {
      // Uang kurang
      const deficit = Math.abs(diff);
      card.className = 'p-2.5 rounded-xl border transition-all flex items-center justify-between bg-amber-50 border-amber-300 text-amber-900';
      if (iconEl) {
        iconEl.textContent = 'warning';
        iconEl.className = 'material-symbols-outlined text-[22px] text-amber-600';
      }
      labelEl.textContent = '⚠️ Uang Kurang:';
      labelEl.className = 'text-[9px] font-bold uppercase tracking-wider text-amber-700';
      textEl.textContent = formatIDR(deficit);
      textEl.className = 'font-mono text-base font-black leading-tight text-amber-700';
      badgeEl.textContent = `Kurang ${formatIDR(deficit)}`;
      badgeEl.className = 'text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 border border-amber-300';
    }
  };

  window.handlePosCheckoutSubmit = function () {
    if (State.posCart.length === 0) {
      showToast('⚠️ Keranjang pesanan masih kosong!');
      return;
    }

    const grand = State.posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const invoiceNo = document.getElementById('posInvoiceId')?.textContent || ('#INV-' + Date.now().toString().slice(-6));
    const tableSelect = document.getElementById('posTableNumberSelect');
    const tableNo = tableSelect ? tableSelect.value : (State.posSelectedTable || 'Meja 01');
    const notes = (document.getElementById('posKitchenNotes')?.value || '').trim();

    // Validasi Pembayaran Tunai & Kalkulasi Kembalian
    let cashTendered = 0;
    let cashChange = 0;

    if (State.posPayMethod === 'CASH') {
      if (!State.posCashTendered || State.posCashTendered === 0) {
        // Otomatis asumsikan Uang Pas jika kasir langsung menekan tombol bayar
        State.posCashTendered = grand;
        const input = document.getElementById('posCashTenderedInput');
        if (input) input.value = Number(grand).toLocaleString('id-ID');
        window.recalculatePosChange();
      }

      if (State.posCashTendered < grand) {
        const deficit = grand - State.posCashTendered;
        showToast(`⚠️ Uang tunai masih kurang ${formatIDR(deficit)}! Masukkan nominal yang cukup.`);
        const inEl = document.getElementById('posCashTenderedInput');
        if (inEl && typeof inEl.focus === 'function') inEl.focus();
        return;
      }

      cashTendered = State.posCashTendered;
      cashChange = Math.max(0, State.posCashTendered - grand);
    }

    // Data Pelanggan (CRM)
    const custId = document.getElementById('posCustomerSelect')?.value;
    const custPhone = (document.getElementById('posCustomerPhone')?.value || '').trim();
    let custName = (document.getElementById('posCustomerName')?.value || '').trim();
    if (!custName) {
      custName = custPhone ? 'Pelanggan Meja' : `Tamu (${tableNo})`;
    }
    const saveContact = document.getElementById('posSaveCustomerCheckbox')?.checked;

    // Simpan/update otomatis ke CRM jika ada no WA
    if (custPhone && (saveContact || custId)) {
      window.upsertCustomerFromOrder(custName, custPhone, grand, tableNo);
    }

    // Potong stok produk
    State.posCart.forEach(ci => {
      const p = State.products.find(prod => prod.barcode_sku === ci.barcode_sku);
      if (p) p.current_stock = Math.max(0, p.current_stock - ci.qty);
    });
    savePersistedProducts(State.products);

    const newOrder = {
      order_id: invoiceNo.replace('#', ''),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      customer_name: custName,
      customer_phone: custPhone,
      vertical: 'RESTO',
      table_number: tableNo,
      notes: notes,
      items: JSON.parse(JSON.stringify(State.posCart)),
      total_amount: grand,
      payment_method: State.posPayMethod === 'CASH' ? 'Tunai di Kasir' : State.posPayMethod === 'QRIS' ? 'QRIS Dinamis' : 'Transfer Bank',
      cash_tendered: cashTendered,
      cash_change: cashChange,
      status: 'COMPLETED',
      status_label: 'Selesai (Lunas)'
    };

    State.orders.unshift(newOrder);
    savePersistedOrders(State.orders);

    // Struk Thermal
    showThermalReceipt(newOrder);

    // Reset keranjang & input kasir
    State.posCart = [];
    State.posCashTendered = 0;
    const cashInput = document.getElementById('posCashTenderedInput');
    if (cashInput) cashInput.value = '';
    window.recalculatePosChange();

    if (document.getElementById('posKitchenNotes')) document.getElementById('posKitchenNotes').value = '';
    updatePosCartUI();
    renderPosCatalog();
    renderInventoryTable();
    renderOrdersQueueTable();
    renderActiveModelUI();
    generateInvoiceNumber();

    showToast(`✅ Transaksi ${newOrder.order_id} (${tableNo}) Berhasil!`);
  };

  // ============================================================================
  // 6. MASTER PRODUK & STOK RESTO
  // ============================================================================
  function renderInventoryTable() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    let items = State.products;
    const searchVal = (document.getElementById('inventorySearchInput')?.value || '').toLowerCase().trim();
    const catVal = document.getElementById('inventoryCategoryFilter')?.value || 'ALL';
    const alertVal = document.getElementById('inventoryStockAlertFilter')?.value || 'ALL';

    if (catVal !== 'ALL') {
      items = items.filter(p => p.category.toLowerCase() === catVal.toLowerCase());
    }
    if (alertVal === 'LOW') {
      items = items.filter(p => p.current_stock <= (p.min_stock_alert || 5));
    } else if (alertVal === 'SAFE') {
      items = items.filter(p => p.current_stock > (p.min_stock_alert || 5));
    }
    if (searchVal) {
      items = items.filter(p =>
        p.product_name.toLowerCase().includes(searchVal) ||
        p.barcode_sku.toLowerCase().includes(searchVal) ||
        p.category.toLowerCase().includes(searchVal)
      );
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" class="p-8 text-center text-slate-400">
            Tidak ada menu yang cocok dengan filter.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(p => {
      const isLow = p.current_stock <= (p.min_stock_alert || 5);
      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
          <td class="p-3.5 font-mono font-bold text-blue-600">${p.barcode_sku}</td>
          <td class="p-3.5">
            <div class="flex items-center gap-3">
              <img src="${p.image_url}" class="w-10 h-10 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0" />
              <div>
                <span class="font-bold text-slate-800 block">${p.product_name}</span>
                <span class="text-[10px] text-slate-400 font-normal line-clamp-1">${p.description || '-'}</span>
              </div>
            </div>
          </td>
          <td class="p-3.5">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">${p.category}</span>
          </td>
          <td class="p-3.5 font-mono text-slate-500">${formatIDR(p.cost_price || 0)}</td>
          <td class="p-3.5 font-mono font-bold text-slate-900">${formatIDR(p.selling_price)}</td>
          <td class="p-3.5 text-center">
            <span class="font-mono font-black text-sm ${isLow ? 'text-red-600' : 'text-emerald-700'}">
              ${p.current_stock}
            </span>
            <span class="text-[10px] text-slate-400 font-normal block">${p.unit_measure || 'porsi'}</span>
          </td>
          <td class="p-3.5 text-center">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${
              isLow ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }">
              ${isLow ? '⚠️ Menipis' : '✅ Aman'}
            </span>
          </td>
          <td class="p-3.5 text-center">
            <div class="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button onclick="window.adjustStock('${p.barcode_sku}', -1)" title="Kurang 1" class="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 font-bold text-xs shadow-xs transition-colors">-1</button>
              <button onclick="window.adjustStock('${p.barcode_sku}', 1)" title="Tambah 1" class="w-7 h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 font-bold text-xs shadow-xs transition-colors">+1</button>
              <button onclick="window.adjustStock('${p.barcode_sku}', 5)" title="Tambah 5" class="px-2 h-7 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-[11px] shadow-xs transition-colors">+5</button>
            </div>
          </td>
          <td class="p-3.5 text-center">
            <div class="flex items-center justify-center gap-1">
              <button onclick="window.openQuickEditProduct('${p.barcode_sku}')" title="Edit Harga Menu" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors">
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button onclick="window.deleteProduct('${p.barcode_sku}')" title="Hapus Menu" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 flex items-center justify-center transition-colors">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.handleInventoryFilter = function () {
    renderInventoryTable();
  };

  window.adjustStock = function (sku, delta) {
    const p = State.products.find(prod => prod.barcode_sku === sku);
    if (!p) return;
    p.current_stock = Math.max(0, p.current_stock + delta);
    savePersistedProducts(State.products);
    renderInventoryTable();
    renderPosCatalog();
    showToast(`📦 Stok "${p.product_name}": ${p.current_stock}`);
  };

  window.openQuickEditProduct = function (sku) {
    const p = State.products.find(prod => prod.barcode_sku === sku);
    if (!p) return;

    const newPrice = prompt(`Ubah Harga Jual untuk "${p.product_name}":`, p.selling_price);
    if (newPrice !== null && !isNaN(newPrice) && Number(newPrice) >= 0) {
      p.selling_price = Number(newPrice);
      savePersistedProducts(State.products);
      renderInventoryTable();
      renderPosCatalog();
      showToast(`✅ Harga ${p.product_name} diubah menjadi ${formatIDR(p.selling_price)}`);
    }
  };

  window.deleteProduct = function (sku) {
    const p = State.products.find(prod => prod.barcode_sku === sku);
    if (!p) return;

    if (confirm(`Hapus "${p.product_name}" (${sku}) dari katalog resto?`)) {
      State.products = State.products.filter(prod => prod.barcode_sku !== sku);
      savePersistedProducts(State.products);
      renderInventoryTable();
      renderPosCatalog();
      showToast(`🗑️ Menu ${p.product_name} telah dihapus.`);
    }
  };

  window.openAddProductModal = function () {
    const m = document.getElementById('addProductModal');
    if (m) m.classList.remove('opacity-0', 'pointer-events-none');
  };

  window.closeAddProductModal = function () {
    const m = document.getElementById('addProductModal');
    if (m) m.classList.add('opacity-0', 'pointer-events-none');
  };

  window.submitNewProduct = function () {
    const name = (document.getElementById('newProdName')?.value || '').trim();
    const sku = (document.getElementById('newProdSku')?.value || '').trim().toUpperCase();
    const cat = document.getElementById('newProdCategory')?.value || 'Nasi Rempah Arab';
    const cost = Number(document.getElementById('newProdCostPrice')?.value) || 0;
    const price = Number(document.getElementById('newProdSellingPrice')?.value) || 0;
    const stock = Number(document.getElementById('newProdStock')?.value) || 0;
    const unit = (document.getElementById('newProdUnit')?.value || 'porsi').trim();
    const imgUrl = (document.getElementById('newProdImageUrl')?.value || '').trim() || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600';

    if (!name || !sku) {
      showToast('⚠️ Nama menu dan SKU wajib diisi!');
      return;
    }

    if (State.products.some(p => p.barcode_sku === sku)) {
      showToast('⚠️ SKU tersebut sudah digunakan oleh menu lain!');
      return;
    }

    const newProd = {
      product_id: 'P' + Date.now().toString().slice(-4),
      barcode_sku: sku,
      product_name: name,
      category: cat,
      cost_price: cost,
      selling_price: price,
      current_stock: stock,
      min_stock_alert: 5,
      unit_measure: unit,
      vertical: 'RESTO',
      image_url: imgUrl,
      description: 'Menu masakan Timur Tengah lezat.'
    };

    State.products.unshift(newProd);
    savePersistedProducts(State.products);

    window.closeAddProductModal();
    renderInventoryTable();
    renderPosCatalog();
    showToast(`✅ Menu baru "${name}" berhasil ditambahkan!`);
  };

  // ============================================================================
  // 7. ANTREAN PESANAN MEJA (KITCHEN QUEUE & ACTIONS)
  // ============================================================================
  function renderOrdersQueueTable() {
    const tbody = document.getElementById('ordersQueueTableBody');
    if (!tbody) return;

    let items = State.orders;
    const searchVal = (document.getElementById('orderTrackSearchInput')?.value || '').toLowerCase().trim();

    if (searchVal) {
      items = items.filter(o =>
        o.order_id.toLowerCase().includes(searchVal) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(searchVal)) ||
        (o.customer_phone && o.customer_phone.includes(searchVal)) ||
        (o.table_number && o.table_number.toLowerCase().includes(searchVal))
      );
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="p-10 text-center text-slate-400">
            <span class="material-symbols-outlined text-4xl mb-1">restaurant</span>
            <p class="text-xs font-semibold">Belum ada antrean pesanan dari meja resto.</p>
            <p class="text-[10px] text-slate-400">Pesanan dari scan QR meja akan otomatis muncul di sini.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(o => {
      const itemsText = Array.isArray(o.items)
        ? o.items.map(it => `<div class="text-[11px]">• ${it.name} <strong class="text-slate-800">(x${it.qty})</strong></div>`).join('')
        : `<div class="text-[11px]">${o.items}</div>`;

      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
          <td class="p-3.5">
            <span class="font-mono font-black text-blue-600 block">${o.order_id}</span>
            <span class="text-[10px] text-slate-400 font-mono">${o.timestamp}</span>
          </td>
          <td class="p-3.5">
            <div class="font-black text-slate-900 flex items-center gap-1.5">
              <span class="px-2.5 py-0.5 rounded-lg text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
                🍽️ ${o.table_number || 'Meja Umum'}
              </span>
            </div>
            <div class="text-xs font-bold text-slate-700 mt-1">${o.customer_name}</div>
            ${o.notes ? `<div class="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-0.5 border border-amber-200">Catatan: ${o.notes}</div>` : ''}
          </td>
          <td class="p-3.5 text-slate-700">
            <div class="space-y-0.5 max-w-xs">${itemsText}</div>
          </td>
          <td class="p-3.5 font-mono font-black text-slate-900">
            <div>${formatIDR(o.total_amount)}</div>
            <div class="text-[10px] text-slate-500 font-sans font-normal">
              ${o.payment_method || 'Kasir'}
              ${o.cash_tendered ? `<span class="block text-[9px] text-emerald-700 font-mono font-bold">Tunai: ${formatIDR(o.cash_tendered)} | Kembalian: ${formatIDR(o.cash_change || 0)}</span>` : ''}
            </div>
          </td>
          <td class="p-3.5 text-center">
            <span class="px-3 py-1 rounded-full text-[11px] font-bold ${getOrderStatusBadgeClass(o.status)}">
              ${o.status_label || o.status}
            </span>
          </td>
          <td class="p-3.5 text-center">
            <div class="inline-flex items-center gap-1.5">
              <select onchange="window.updateOrderStatus('${o.order_id}', this.value)" class="text-xs font-bold rounded-xl border-slate-200 p-1.5 bg-white focus:ring-2 focus:ring-blue-500 shadow-xs">
                <option value="RECEIVED" ${o.status === 'RECEIVED' || o.status === 'PENDING' ? 'selected' : ''}>1. Diterima Kasir</option>
                <option value="COOKING" ${o.status === 'COOKING' ? 'selected' : ''}>2. Dimasak Dapur</option>
                <option value="READY" ${o.status === 'READY' ? 'selected' : ''}>3. Siap Diantar Meja</option>
                <option value="COMPLETED" ${o.status === 'COMPLETED' ? 'selected' : ''}>4. Selesai (Lunas)</option>
              </select>
              <button onclick="window.reprintCustomerReceipt('${o.order_id}')" class="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-colors shadow-xs" title="Lihat / Cetak Struk Kasir">
                <span class="material-symbols-outlined text-[16px]">receipt_long</span>
              </button>
              <button onclick="window.printKitchenTicket('${o.order_id}')" class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shadow-xs" title="Cetak Tiket Koki Dapur">
                <span class="material-symbols-outlined text-[16px]">skillet</span>
              </button>
              ${o.customer_phone ? `
                <a href="${window.formatWhatsAppUrl(o.customer_phone, `Halo ${o.customer_name}, pesanan Anda di ${o.table_number} statusnya: ${o.status_label || o.status}`)}" target="_blank" class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors shadow-xs" title="Chat WhatsApp Pelanggan">
                  <span class="material-symbols-outlined text-[16px]">chat</span>
                </a>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function getOrderStatusBadgeClass(st) {
    if (st === 'READY') return 'bg-amber-100 text-amber-800 border border-amber-300';
    if (st === 'COMPLETED') return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    if (st === 'COOKING') return 'bg-blue-100 text-blue-800 border border-blue-300';
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  }

  window.updateOrderStatus = function (orderId, newStatus) {
    const ord = State.orders.find(o => o.order_id === orderId);
    if (!ord) return;

    ord.status = newStatus;
    if (newStatus === 'RECEIVED') ord.status_label = 'Pesanan Diterima Kasir';
    if (newStatus === 'COOKING') ord.status_label = 'Sedang Dimasak Dapur';
    if (newStatus === 'READY') ord.status_label = 'Siap Diantar ke Meja';
    if (newStatus === 'COMPLETED') ord.status_label = 'Selesai (Lunas)';

    savePersistedOrders(State.orders);
    renderOrdersQueueTable();
    updatePendingOrderBadge();
    renderActiveModelUI();
    broadcastOrderStatusCloud(ord);
    showToast(`📋 Status pesanan ${orderId} (${ord.table_number}): ${ord.status_label}`);
  };

  window.handleOrderSearch = function (val) {
    renderOrdersQueueTable();
  };

  // Cetak Tiket Koki Dapur (Kitchen Order Ticket - KOT 58mm)
  window.printKitchenTicket = function (orderId) {
    const ord = State.orders.find(o => o.order_id === orderId);
    if (!ord) return;

    const itemsHtml = Array.isArray(ord.items)
      ? ord.items.map(i => `
          <div class="row" style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">
            <span class="item-name">${i.name}</span>
            <span class="font-bold">x${i.qty}</span>
          </div>
        `).join('')
      : `<div>${ord.items}</div>`;

    const kotHtml = `
      <div class="text-center">
        <div style="font-size: 13px; font-weight: 900; letter-spacing: 1px;">*** TIKET DAPUR / KOT ***</div>
        <div style="font-size: 16px; font-weight: 900; margin: 6px 0; border: 2px solid #000; padding: 4px;">${ord.table_number || 'MEJA UMUM'}</div>
        <div class="row" style="font-size: 10px;">
          <span>No: ${ord.order_id}</span>
          <span>${ord.timestamp}</span>
        </div>
        <div class="row" style="font-size: 10px; margin-top: 2px;">
          <span>Tamu: <strong>${ord.customer_name}</strong></span>
          <span>Dine-in</span>
        </div>
        <div class="divider"></div>
        ${itemsHtml}
        ${ord.notes ? `<div style="border-top: 1px dashed #000; margin: 6px 0; padding-top: 4px; font-size: 11px; font-weight: bold; text-align: left;">CATATAN: ${ord.notes}</div>` : ''}
        <div class="double-divider"></div>
        <div style="font-size: 9px; text-align: center;">Segera dimasak panas & disajikan!</div>
      </div>
    `;

    const container = document.getElementById('thermalPrintContainer');
    if (container) container.innerHTML = kotHtml;

    window.printReceiptHtml(kotHtml, `KOT-${ord.order_id}`);
  };

  // ============================================================================
  // 8. MODAL PRATINJAU & CETAK STRUK THERMAL 58MM (BILLING KASIR)
  // ============================================================================
  window.currentReceiptOrder = null;

  function buildReceiptHtml(orderData) {
    const itemsHtml = Array.isArray(orderData.items)
      ? orderData.items.map(i => `
          <div class="row" style="margin-bottom: 3px;">
            <span class="item-name">${i.name} x${i.qty}</span>
            <span class="item-price font-bold">${formatIDR(i.price * i.qty)}</span>
          </div>
        `).join('')
      : `<div>${orderData.items}</div>`;

    const storeName = State.settings.STORE_NAME || 'RASH RESTO TIMUR TENGAH';
    const storeAddress = State.settings.STORE_ADDRESS || 'Jl. Raden Saleh No. 18, Cikini, Jakarta Pusat';
    const footerMsg = State.settings.THERMAL_FOOTER || 'Syukron katsiran atas kunjungan Anda!';
    const tableNo = orderData.table_number || 'MEJA KASIR';
    const invoiceNo = orderData.order_id || '#INV-001';
    const orderTime = orderData.timestamp || new Date().toLocaleTimeString('id-ID');
    const payMethod = orderData.payment_method || 'TUNAI';

    return `
      <div class="text-center" style="margin-bottom: 6px;">
        <div style="font-weight: 900; font-size: 13px; letter-spacing: 0.5px;">${storeName}</div>
        <div style="font-size: 10px; color: #444; margin-top: 1px;">${storeAddress}</div>
        <div class="divider"></div>
        <div class="row" style="font-size: 10px;">
          <span>No: ${invoiceNo}</span>
          <span>${orderTime}</span>
        </div>
        <div class="row" style="font-size: 10px;">
          <span>Kasir: ${State.user?.name || 'Kasir Resto'}</span>
          <span>Dine-in</span>
        </div>
      </div>

      <div class="text-center" style="font-weight: 900; font-size: 13px; margin: 4px 0; padding: 2px 0; border: 1px solid #000;">
        ${tableNo}
      </div>

      <div class="divider"></div>
      <div style="margin: 4px 0;">
        ${itemsHtml}
      </div>
      <div class="divider"></div>

      <div class="row" style="font-size: 12px; font-weight: 900; margin-top: 3px;">
        <span>TOTAL:</span>
        <span>${formatIDR(orderData.total_amount)}</span>
      </div>

      <div class="row" style="font-size: 10px; margin-top: 2px;">
        <span>Pembayaran:</span>
        <span class="font-bold">${payMethod}</span>
      </div>

      ${orderData.cash_tendered ? `
        <div class="row" style="font-size: 10px; margin-top: 1px;">
          <span>Tunai:</span>
          <span style="font-family: monospace; font-weight: bold;">${formatIDR(orderData.cash_tendered)}</span>
        </div>
        <div class="row" style="font-size: 10px; margin-top: 1px; font-weight: bold;">
          <span>Kembalian:</span>
          <span style="font-family: monospace; font-weight: bold;">${formatIDR(orderData.cash_change || 0)}</span>
        </div>
      ` : ''}

      ${orderData.notes ? `
        <div class="divider"></div>
        <div style="font-size: 10px; text-align: left;"><em>Catatan: ${orderData.notes}</em></div>
      ` : ''}

      <div class="divider"></div>
      <div class="text-center" style="font-size: 9px; margin-top: 6px; line-height: 1.3;">
        <div>${footerMsg}</div>
        <div style="margin-top: 3px; font-weight: bold;">*** LUNAS ***</div>
        <div style="margin-top: 2px; color: #666;">RASH Mitra Smart Cloud POS</div>
      </div>
    `;
  }

  function showThermalReceipt(orderData) {
    window.currentReceiptOrder = orderData;
    const receiptHtml = buildReceiptHtml(orderData);

    // Update pratinjau visual di modal struk
    const previewPaper = document.getElementById('receiptPreviewPaper');
    if (previewPaper) previewPaper.innerHTML = receiptHtml;

    // Pasang juga di kontainer cetak DOM
    const printContainer = document.getElementById('thermalPrintContainer');
    if (printContainer) printContainer.innerHTML = receiptHtml;

    // Tampilkan modal struk kasir
    const modal = document.getElementById('receiptModal');
    if (modal) {
      modal.classList.remove('opacity-0', 'pointer-events-none');
    } else {
      window.printReceiptHtml(receiptHtml, `Struk-${orderData.order_id}`);
    }
  }

  window.closeReceiptModal = function () {
    const modal = document.getElementById('receiptModal');
    if (modal) modal.classList.add('opacity-0', 'pointer-events-none');
    window.currentReceiptOrder = null;
  };

  window.printCurrentReceipt = function () {
    if (!window.currentReceiptOrder) return;
    const receiptHtml = buildReceiptHtml(window.currentReceiptOrder);
    window.printReceiptHtml(receiptHtml, `Struk-${window.currentReceiptOrder.order_id}`);
  };

  window.printCurrentKitchenTicket = function () {
    if (!window.currentReceiptOrder) return;
    window.printKitchenTicket(window.currentReceiptOrder.order_id);
  };

  window.sendCurrentReceiptWhatsApp = function () {
    if (!window.currentReceiptOrder) return;
    const ord = window.currentReceiptOrder;
    let targetPhone = ord.customer_phone && ord.customer_phone !== '-' ? ord.customer_phone : '';

    if (!targetPhone) {
      targetPhone = prompt('Masukkan Nomor WhatsApp Pelanggan (contoh: 08123456789):');
    }
    if (!targetPhone) return;

    const itemsText = Array.isArray(ord.items)
      ? ord.items.map(i => `• ${i.qty}x ${i.name} (${formatIDR(i.price * i.qty)})`).join('\n')
      : ord.items;

    const cashInfo = ord.cash_tendered 
      ? `\nTunai Diterima: ${formatIDR(ord.cash_tendered)}\nKembalian: ${formatIDR(ord.cash_change || 0)}` 
      : '';

    const text = 
`*STRUK PEMBAYARAN RESMI* 🧾
*${State.settings.STORE_NAME || 'RASH RESTO TIMUR TENGAH'}*
-----------------------------------
No. Transaksi: *${ord.order_id}*
Waktu: ${ord.timestamp}
Meja: *${ord.table_number || 'Dine-in'}*
Pembayaran: *${ord.payment_method || 'TUNAI'} (LUNAS)*
-----------------------------------
*Rincian Menu:*
${itemsText}
-----------------------------------
*Total Pembayaran: ${formatIDR(ord.total_amount)}*${cashInfo}

_${State.settings.THERMAL_FOOTER || 'Syukron katsiran atas kunjungan Anda! Selamat menikmati.'}_`;

    const url = window.formatWhatsAppUrl(targetPhone, text);
    if (!url || url === '#') {
      showToast('⚠️ Nomor WhatsApp pelanggan tidak valid.');
      return;
    }
    window.open(url, '_blank');
  };

  window.reprintCustomerReceipt = function (orderId) {
    const ord = State.orders.find(o => o.order_id === orderId);
    if (!ord) {
      showToast('⚠️ Pesanan tidak ditemukan');
      return;
    }
    showThermalReceipt(ord);
  };

  // ============================================================================
  // 9. DATA PELANGGAN & CRM RESTO (RESI WHATSAPP OTOMATIS)
  // ============================================================================
  window.renderCustomersTable = function () {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;

    const countEl = document.getElementById('totalCustomersCount');
    if (countEl) countEl.textContent = State.customers.length;

    const searchVal = (document.getElementById('customerSearchInput')?.value || '').toLowerCase().trim();

    let items = State.customers;
    if (searchVal) {
      items = items.filter(c =>
        c.name.toLowerCase().includes(searchVal) ||
        c.phone.includes(searchVal) ||
        (c.favorite_table && c.favorite_table.toLowerCase().includes(searchVal)) ||
        (c.notes && c.notes.toLowerCase().includes(searchVal))
      );
    }

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-8 text-center text-slate-400">
            <span class="material-symbols-outlined text-3xl mb-1 text-slate-300">contacts</span>
            <p class="font-bold text-xs">Belum ada data pelanggan yang cocok.</p>
            <p class="text-[10px] text-slate-400 mt-0.5">Kontak pelanggan otomatis tersimpan saat pemesanan kasir atau katalog mandiri.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(c => {
      const cleanPhone = c.phone.replace(/\D/g, '');
      const isVip = (c.total_orders || 0) >= 5;

      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
          <td class="p-3.5">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                ${c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>${c.name}</span>
                  ${isVip ? '<span class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200">👑 VIP</span>' : ''}
                </div>
                <span class="text-[10px] text-slate-400 font-mono">${c.customer_id}</span>
              </div>
            </div>
          </td>
          <td class="p-3.5">
            <a href="${window.formatWhatsAppUrl(c.phone)}" target="_blank" class="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-mono font-bold hover:underline" title="Chat WhatsApp">
              <span class="material-symbols-outlined text-[15px]">chat</span>
              <span>${c.phone}</span>
            </a>
          </td>
          <td class="p-3.5 text-center font-bold font-mono text-slate-800">
            <span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs">
              ${c.total_orders || 0}x Kunjungan
            </span>
          </td>
          <td class="p-3.5 font-bold font-mono text-blue-700">
            ${formatIDR(c.total_spent || 0)}
          </td>
          <td class="p-3.5">
            <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              🍽️ ${c.favorite_table || 'Meja Umum'}
            </span>
          </td>
          <td class="p-3.5 text-slate-600 max-w-xs truncate text-[11px]" title="${c.notes || '-'}">
            ${c.notes || '-'}
          </td>
          <td class="p-3.5 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button onclick="window.sendWhatsAppToCustomer('${c.phone}', '${c.name.replace(/'/g, "\\'")}')" class="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-[11px] flex items-center gap-1 transition-all" title="Kirim Resi/Pesan WA">
                <span class="material-symbols-outlined text-[15px]">send</span>
                <span>Kirim WA</span>
              </button>
              <button onclick="window.editCustomer('${c.customer_id}')" class="w-7 h-7 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors" title="Edit Kontak">
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button onclick="window.deleteCustomer('${c.customer_id}')" class="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors" title="Hapus Kontak">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.handleCustomerSearch = function () {
    renderCustomersTable();
  };

  window.openCustomerModal = function (custId = null) {
    const modal = document.getElementById('customerModal');
    if (!modal) return;

    State.editingCustomerId = custId;
    const tableSelect = document.getElementById('custModalTable');
    if (tableSelect) {
      tableSelect.innerHTML = State.tables.map(t => `<option value="${t}">${t}</option>`).join('');
    }

    if (custId) {
      const c = State.customers.find(item => item.customer_id === custId);
      if (c) {
        document.getElementById('customerModalTitle').textContent = 'Edit Data Pelanggan';
        document.getElementById('custModalName').value = c.name;
        document.getElementById('custModalPhone').value = c.phone;
        document.getElementById('custModalEmail').value = c.email || '';
        document.getElementById('custModalTable').value = c.favorite_table || State.tables[0];
        document.getElementById('custModalNotes').value = c.notes || '';
      }
    } else {
      document.getElementById('customerModalTitle').textContent = 'Tambah Data Pelanggan Baru';
      document.getElementById('custModalName').value = '';
      document.getElementById('custModalPhone').value = '';
      document.getElementById('custModalEmail').value = '';
      document.getElementById('custModalNotes').value = '';
    }

    modal.classList.remove('opacity-0', 'pointer-events-none');
  };

  window.closeCustomerModal = function () {
    const modal = document.getElementById('customerModal');
    if (modal) modal.classList.add('opacity-0', 'pointer-events-none');
    State.editingCustomerId = null;
  };

  window.submitCustomerModal = function () {
    const name = (document.getElementById('custModalName')?.value || '').trim();
    const phone = (document.getElementById('custModalPhone')?.value || '').trim();
    const email = (document.getElementById('custModalEmail')?.value || '').trim();
    const table = document.getElementById('custModalTable')?.value;
    const notes = (document.getElementById('custModalNotes')?.value || '').trim();

    if (!name || !phone) {
      showToast('⚠️ Nama dan Nomor WhatsApp wajib diisi!');
      return;
    }

    if (State.editingCustomerId) {
      const c = State.customers.find(item => item.customer_id === State.editingCustomerId);
      if (c) {
        c.name = name;
        c.phone = phone;
        c.email = email;
        c.favorite_table = table;
        c.notes = notes;
        showToast(`✅ Kontak ${name} berhasil diperbarui!`);
      }
    } else {
      const newCust = {
        customer_id: 'CUST-' + String(State.customers.length + 1).padStart(3, '0'),
        name: name,
        phone: phone,
        email: email,
        total_orders: 0,
        total_spent: 0,
        favorite_table: table,
        notes: notes,
        created_at: new Date().toISOString().split('T')[0]
      };
      State.customers.unshift(newCust);
      showToast(`✅ Pelanggan baru ${name} berhasil ditambahkan!`);
    }

    savePersistedCustomers(State.customers);
    window.closeCustomerModal();
    renderCustomersTable();
    renderActiveModelUI();
  };

  window.editCustomer = function (custId) {
    window.openCustomerModal(custId);
  };

  window.deleteCustomer = function (custId) {
    const c = State.customers.find(item => item.customer_id === custId);
    if (!c) return;

    if (confirm(`Hapus data pelanggan ${c.name} (${c.phone})?`)) {
      State.customers = State.customers.filter(item => item.customer_id !== custId);
      savePersistedCustomers(State.customers);
      renderCustomersTable();
      renderActiveModelUI();
      showToast(`🗑️ Data pelanggan ${c.name} telah dihapus.`);
    }
  };

  window.sendWhatsAppToCustomer = function (phone, name) {
    const msg = `Halo Bapak/Ibu *${name}*, salam hangat dari *${State.settings.STORE_NAME || 'RASH Resto Timur Tengah'}*! 🙏\n\nTerima kasih telah menjadi pelanggan setia kami. Kami siap melayani hidangan Timur Tengah otentik favorit Anda. Ada yang bisa kami bantu seputar reservasi meja atau pesanan hari ini?`;
    const url = window.formatWhatsAppUrl(phone, msg);
    if (!url || url === '#') {
      showToast('⚠️ Nomor WhatsApp pelanggan tidak valid.');
      return;
    }
    window.open(url, '_blank');
  };

  // ============================================================================
  // 10. SUPER ADMIN SETTINGS & NOMOR WA KASIR
  // ============================================================================
  function populateAdminSettingsUI() {
    if (document.getElementById('settStoreName')) {
      document.getElementById('settStoreName').value = State.settings.STORE_NAME || 'RASH Resto Timur Tengah';
    }
    if (document.getElementById('settStoreAddress')) {
      document.getElementById('settStoreAddress').value = State.settings.STORE_ADDRESS || 'Jl. Raden Saleh No. 18, Cikini, Jakarta Pusat';
    }
    if (document.getElementById('settThermalFooter')) {
      document.getElementById('settThermalFooter').value = State.settings.THERMAL_FOOTER || 'Syukron katsiran atas kunjungan Anda. Selamat menikmati!';
    }
    if (document.getElementById('settQrisNmid')) {
      document.getElementById('settQrisNmid').value = State.settings.QRIS_MERCHANT_ID || 'NMID-RASH-99887766';
    }
    if (document.getElementById('settKasirPhone')) {
      document.getElementById('settKasirPhone').value = State.settings.KASIR_WA_NUMBER || '081234567890';
    }
    const channelLabel = document.getElementById('cloudChannelLabel');
    if (channelLabel) {
      channelLabel.textContent = getCloudSyncChannel();
    }
  }

  window.saveAdminSettings = function () {
    const store = (document.getElementById('settStoreName')?.value || '').trim();
    const addr = (document.getElementById('settStoreAddress')?.value || '').trim();
    const footer = (document.getElementById('settThermalFooter')?.value || '').trim();
    const qris = (document.getElementById('settQrisNmid')?.value || '').trim();
    const kasirPhone = (document.getElementById('settKasirPhone')?.value || '').trim();

    if (store) State.settings.STORE_NAME = store;
    if (addr) State.settings.STORE_ADDRESS = addr;
    if (footer) State.settings.THERMAL_FOOTER = footer;
    if (qris) State.settings.QRIS_MERCHANT_ID = qris;
    if (kasirPhone) State.settings.KASIR_WA_NUMBER = kasirPhone;

    savePersistedSettings(State.settings);

    const storeTitleEl = document.getElementById('appStoreName');
    if (storeTitleEl) storeTitleEl.textContent = State.settings.STORE_NAME;

    // Perbarui koneksi Cloud Order Sync ke nomor kasir baru
    initCloudOrderSync();

    // Perbarui barcode meja di tab Kelola Meja
    renderTablesManager();

    showToast('💾 Pengaturan resto & Nomor WA Kasir berhasil disimpan! Cloud Sync aktif.');
  };

  // ============================================================================
  // 11. NOTIFIKASI LONCENG & CLOUD REALTIME SYNC (HP TAMU -> LAPTOP KASIR)
  // ============================================================================

  // Normalisasi nomor telepon kasir ke format seragam untuk identifikasi Cloud Channel
  function normalizeKasirPhoneNumber(phone) {
    let clean = (phone || '').replace(/\D/g, '');
    if (clean.startsWith('08')) {
      clean = '62' + clean.slice(1);
    }
    if (!clean || clean.length < 5) {
      clean = '6281234567890';
    }
    return clean;
  }

  function normalizeKasirChannelId(phone) {
    return 'rash_mitra_' + normalizeKasirPhoneNumber(phone);
  }

  function getCloudSyncChannel() {
    const phone = (State.settings && State.settings.KASIR_WA_NUMBER) || 
                  (window.APP_CONFIG && window.APP_CONFIG.KASIR_WA_NUMBER) || 
                  '6281234567890';
    return normalizeKasirChannelId(phone);
  }

  window.normalizeKasirPhoneNumber = normalizeKasirPhoneNumber;
  window.normalizeKasirChannelId = normalizeKasirChannelId;
  window.getCloudSyncChannel = getCloudSyncChannel;

  // Audio Context Shared & Auto-Unlock on user interaction
  let sharedAudioCtx = null;
  function getSharedAudioContext() {
    try {
      if (!sharedAudioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) sharedAudioCtx = new AudioCtx();
      }
      if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume().catch(() => {});
      }
    } catch (e) {}
    return sharedAudioCtx;
  }

  window.addEventListener('click', () => { getSharedAudioContext(); }, { once: true });
  window.addEventListener('touchstart', () => { getSharedAudioContext(); }, { once: true });

  // Suara Lonceng Notifikasi Kasir (Ding-Dong-Ding via Web Audio API, tanpa file eksternal)
  function playOrderBell() {
    try {
      const ctx = getSharedAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Nada 1: E5 (659Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Nada 2: G#5 (830Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(830.61, now + 0.12);
      gain2.gain.setValueAtTime(0.4, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.7);

      // Nada 3: B5 (987Hz - Ding!)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(987.77, now + 0.25);
      gain3.gain.setValueAtTime(0.45, now + 0.25);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.25);
      osc3.stop(now + 1.2);
    } catch (err) {
      console.warn('Audio bell:', err);
    }
  }

  // Set Pelacak Deduplikasi Pesanan
  window.lastProcessedOrderIds = window.lastProcessedOrderIds || new Set();

  // Pengolah Pesanan Masuk Terpadu (Dari Cloud SSE atau LocalStorage)
  window.processIncomingOrder = function (order, source = 'cloud') {
    if (!order || !order.order_id) return;

    if (window.lastProcessedOrderIds.has(order.order_id)) {
      console.log(`[${source}] Order #${order.order_id} sudah diproses sebelumnya.`);
      return;
    }
    window.lastProcessedOrderIds.add(order.order_id);

    if (window.lastProcessedOrderIds.size > 200) {
      const arr = Array.from(window.lastProcessedOrderIds);
      window.lastProcessedOrderIds = new Set(arr.slice(-100));
    }

    const exists = State.orders.some(o => o.order_id === order.order_id);
    if (!exists) {
      State.orders.unshift(order);
      savePersistedOrders(State.orders);
    }

    if (order.customer_phone && order.customer_phone !== '-') {
      try {
        window.upsertCustomerFromOrder(
          order.customer_name,
          order.customer_phone,
          order.total_amount,
          order.table_number
        );
        if (State.currentAppTab === 'pelanggan') renderCustomersTable();
      } catch (err) {
        console.warn('Upsert customer error:', err);
      }
    }

    renderOrdersQueueTable();
    updatePendingOrderBadge();

    window.showNewIncomingOrderPopup(order);
    showToast(`🔔 Pesanan baru masuk dari ${order.table_number || 'Meja'}! (#${order.order_id})`);
  };

  // Inisialisasi Pendengar Realtime Cloud SSE (ntfy.sh)
  let cloudReconnectTimer = null;

  function initCloudOrderSync() {
    const channel = getCloudSyncChannel();
    console.log('📡 Mengaktifkan Realtime Cloud Order Listener di channel:', channel);

    const channelLabel = document.getElementById('cloudChannelLabel');
    if (channelLabel) channelLabel.textContent = channel;

    if (window._rashOrderEventSource) {
      try {
        window._rashOrderEventSource.close();
      } catch (e) {}
      window._rashOrderEventSource = null;
    }

    try {
      // WAJIB menggunakan endpoint /sse untuk browser native EventSource
      const es = new EventSource(`https://ntfy.sh/${channel}/sse`);
      window._rashOrderEventSource = es;

      es.onopen = () => {
        console.log('🟢 Cloud Sync Kasir Terhubung (SSE onopen):', channel);
        updateCloudSyncStatusBadge(true, channel);
      };

      es.addEventListener('open', () => {
        console.log('🟢 Cloud Sync Kasir Terhubung (SSE event open):', channel);
        updateCloudSyncStatusBadge(true, channel);
      });

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'message' && data.message) {
            const payload = JSON.parse(data.message);
            if (payload && payload.type === 'RASH_NEW_ORDER' && payload.order) {
              console.log('📥 Pesanan diterima via Cloud Meja:', payload.order.order_id);
              window.processIncomingOrder(payload.order, 'cloud');
            }
          }
        } catch (e) {
          console.warn('Gagal membaca pesan order SSE:', e);
        }
      };

      es.onerror = (err) => {
        console.warn('⚠️ Koneksi Cloud SSE terputus, mencoba menyambung ulang... ReadyState:', es.readyState, err);
        updateCloudSyncStatusBadge(false, channel);
        // Jika koneksi tertutup permanen, jadwalkan instansiasi ulang
        if (es.readyState === 2) {
          if (cloudReconnectTimer) clearTimeout(cloudReconnectTimer);
          cloudReconnectTimer = setTimeout(() => {
            initCloudOrderSync();
          }, 3000);
        }
      };
    } catch (err) {
      console.error('Gagal membuat EventSource Cloud:', err);
      updateCloudSyncStatusBadge(false, channel);
    }

    // Pasang Watchdog Pemulihan Koneksi Otomatis (jika tab laptop tidur / bangun kembali)
    if (!window._rashWatchdogInstalled) {
      window._rashWatchdogInstalled = true;

      // Cek setiap 8 detik jika status SSE tertutup (CLOSED = 2)
      setInterval(() => {
        if (!window._rashOrderEventSource || window._rashOrderEventSource.readyState === 2) {
          console.log('🔄 Watchdog: Memulihkan sambungan Cloud SSE...');
          initCloudOrderSync();
        }
      }, 8000);

      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          if (!window._rashOrderEventSource || window._rashOrderEventSource.readyState !== 1) {
            initCloudOrderSync();
          }
        }
      });

      window.addEventListener('online', () => {
        console.log('🌐 Koneksi internet laptop kembali online.');
        initCloudOrderSync();
      });
    }
  }

  // Tombol Reconnect Manual jika kasir mengklik badge
  window.reconnectCloudSync = function () {
    showToast('🔄 Menyambungkan ulang ke saluran Cloud...');
    initCloudOrderSync();
  };

  function updateCloudSyncStatusBadge(isOnline, channelName) {
    const badge = document.getElementById('cloudSyncStatusBadge');
    if (badge) {
      if (isOnline) {
        badge.className = 'cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:opacity-80 transition-opacity';
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span><span>Cloud Meja Aktif</span>`;
        badge.title = `Cloud Sync Terhubung (${channelName || ''}) • Klik untuk refresh`;
      } else {
        badge.className = 'cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:opacity-80 transition-opacity';
        badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span><span>Reconnecting...</span>`;
        badge.title = 'Sedang menyambung ulang ke Cloud Channel • Klik untuk paksa sambung';
      }
    }

    const adminStatusPill = document.getElementById('adminCloudStatusPill');
    if (adminStatusPill) {
      if (isOnline) {
        adminStatusPill.className = 'cursor-pointer px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 hover:opacity-80 transition-opacity';
        adminStatusPill.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>Cloud Online</span>';
        adminStatusPill.title = 'Klik untuk refresh koneksi Cloud';
      } else {
        adminStatusPill.className = 'cursor-pointer px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 hover:opacity-80 transition-opacity';
        adminStatusPill.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span><span>Reconnecting...</span>';
        adminStatusPill.title = 'Klik untuk paksa sambungkan ulang Cloud';
      }
    }
  }

  // Broadcast perubahan status pesanan ke Cloud
  function broadcastOrderStatusCloud(order) {
    if (!order || !order.order_id) return;
    try {
      const channel = getCloudSyncChannel();
      const payload = {
        type: 'RASH_ORDER_STATUS_UPDATE',
        order_id: order.order_id,
        status: order.status,
        status_label: order.status_label,
        timestamp: Date.now()
      };
      fetch(`https://ntfy.sh/${channel}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Title': `Status Pesanan: ${order.order_id} -> ${order.status_label || order.status}`,
          'Priority': 'default'
        }
      }).catch(e => console.warn('Gagal broadcast status:', e));
    } catch (err) {}
  }

  // Tombol Uji Cloud Realtime (HP -> Laptop)
  window.testCloudIncomingOrder = async function () {
    const channel = getCloudSyncChannel();
    showToast('📡 Mengirim sinyal uji coba ke Cloud ntfy.sh...');

    const demoTestOrder = {
      order_id: 'ORD-CLOUD-' + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      customer_name: 'Faisal Basalamah (Tes Cloud HP)',
      customer_phone: '081398765432',
      table_number: 'Meja 05',
      notes: 'Tes notifikasi real-time antar-perangkat HP ke Laptop Kasir via Cloud',
      items: [
        { name: 'Nasi Kebuli Daging Kambing', qty: 2, price: 58000 },
        { name: 'Shahi Adeni (Teh Rempah Yaman)', qty: 2, price: 18000 }
      ],
      total_amount: 152000,
      payment_method: 'Tunai di Kasir',
      status: 'RECEIVED',
      status_label: 'Pesanan Diterima Kasir'
    };

    const payload = {
      type: 'RASH_NEW_ORDER',
      sender: 'test_cloud_button',
      order: demoTestOrder,
      timestamp: Date.now()
    };

    try {
      const res = await fetch(`https://ntfy.sh/${channel}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Title': `Uji Pesanan Meja: ${demoTestOrder.table_number}`,
          'Priority': 'urgent',
          'Tags': 'bell,plate'
        }
      });

      if (res.ok) {
        showToast('✅ Berhasil dikirim ke Cloud! Tunggu pop-up & lonceng berbunyi...');
      } else {
        showToast('⚠️ Gagal broadcast ke cloud: HTTP ' + res.status);
      }
    } catch (err) {
      console.error('Error test cloud:', err);
      showToast('❌ Gagal menghubungi server cloud: ' + err.message);
    }
  };

  window.showNewIncomingOrderPopup = function (order) {
    if (!order) return;
    window.activeIncomingOrder = order;

    // Bunyikan lonceng resto
    playOrderBell();

    const modal = document.getElementById('newIncomingOrderModal');
    if (!modal) return;

    // Isi rincian data ke modal popup
    const tableTitle = document.getElementById('popupOrderTableTitle');
    if (tableTitle) tableTitle.textContent = `Pesanan dari ${order.table_number || 'Meja Tamu'}`;

    const timeMeta = document.getElementById('popupOrderTimeMeta');
    if (timeMeta) timeMeta.textContent = `No. Order: #${order.order_id} • Waktu: ${order.timestamp || 'Baru Saja'}`;

    const custName = document.getElementById('popupOrderCustomerName');
    if (custName) custName.textContent = order.customer_name || 'Pelanggan Meja';

    const custPhone = document.getElementById('popupOrderCustomerPhone');
    if (custPhone) custPhone.textContent = order.customer_phone || '-';

    const payMethod = document.getElementById('popupOrderPaymentMethod');
    if (payMethod) payMethod.textContent = order.payment_method || 'Tunai di Kasir';

    const notesBox = document.getElementById('popupOrderNotesBox');
    const notesText = document.getElementById('popupOrderNotesText');
    if (notesBox && notesText) {
      if (order.notes) {
        notesText.textContent = order.notes;
        notesBox.classList.remove('hidden');
      } else {
        notesBox.classList.add('hidden');
      }
    }

    const itemsContainer = document.getElementById('popupOrderItemsList');
    if (itemsContainer) {
      if (Array.isArray(order.items)) {
        itemsContainer.innerHTML = order.items.map(it => `
          <div class="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
            <span class="font-bold text-slate-800">${it.qty}x ${it.name}</span>
            <span class="font-mono text-slate-600">${formatIDR(it.price * it.qty)}</span>
          </div>
        `).join('');
      } else {
        itemsContainer.innerHTML = `<div class="text-xs text-slate-800">${order.items}</div>`;
      }
    }

    const grandEl = document.getElementById('popupOrderGrandTotal');
    if (grandEl) grandEl.textContent = formatIDR(order.total_amount);

    const chatBtn = document.getElementById('popupChatWaBtn');
    if (chatBtn) {
      if (order.customer_phone && order.customer_phone !== '-') {
        chatBtn.classList.remove('hidden');
      } else {
        chatBtn.classList.add('hidden');
      }
    }

    // Tampilkan modal secara langsung
    modal.classList.remove('opacity-0', 'pointer-events-none');
  };

  window.closeNewIncomingOrderModal = function () {
    const modal = document.getElementById('newIncomingOrderModal');
    if (modal) modal.classList.add('opacity-0', 'pointer-events-none');
    window.activeIncomingOrder = null;
  };

  window.acceptAndSendToKitchen = function () {
    if (!window.activeIncomingOrder) return;
    const ord = window.activeIncomingOrder;
    window.updateOrderStatus(ord.order_id, 'COOKING');
    window.printKitchenTicket(ord.order_id);
    window.closeNewIncomingOrderModal();
    showToast(`👨‍🍳 Pesanan #${ord.order_id} (${ord.table_number}) diteruskan ke dapur!`);
  };

  window.printPopupKitchenTicket = function () {
    if (!window.activeIncomingOrder) return;
    window.printKitchenTicket(window.activeIncomingOrder.order_id);
  };

  window.chatPopupCustomerWhatsApp = function () {
    if (!window.activeIncomingOrder || !window.activeIncomingOrder.customer_phone) return;
    const ord = window.activeIncomingOrder;
    const msg = `Halo Bapak/Ibu *${ord.customer_name}*, pesanan Anda untuk *${ord.table_number}* (No: ${ord.order_id}) telah diterima kasir dan sedang disiapkan dapur resto. Mohon ditunggu ya! 🙏`;
    const url = window.formatWhatsAppUrl(ord.customer_phone, msg);
    if (url && url !== '#') {
      window.open(url, '_blank');
    }
  };

  window.testIncomingOrderNotification = function () {
    const demoOrder = {
      order_id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      customer_name: 'Ahmad Al-Attas',
      customer_phone: '081298765432',
      table_number: 'Meja 03',
      notes: 'Sambal dhabah dipisah, ekstra acar nanas',
      items: [
        { name: 'Nasi Mandi Kambing Muda (Signature)', qty: 2, price: 58000 },
        { name: 'Sambal Dhabah & Acar Nanas Khas Hadramaut', qty: 1, price: 8000 },
        { name: 'Shahi Adeni (Teh Rempah Susu Khas Yaman)', qty: 2, price: 18000 }
      ],
      total_amount: 160000,
      payment_method: 'Tunai di Kasir',
      status: 'RECEIVED',
      status_label: 'Pesanan Diterima Kasir'
    };

    State.orders.unshift(demoOrder);
    savePersistedOrders(State.orders);
    renderOrdersQueueTable();
    updatePendingOrderBadge();

    window.showNewIncomingOrderPopup(demoOrder);
    showToast('🔔 Simulasi pesanan baru masuk dari Meja 03!');
  };

  // Event Listeners Umum
  function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.getElementById('posBarcodeSearchInput');
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });

    const searchInput = document.getElementById('posBarcodeSearchInput');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const val = e.target.value.trim().toLowerCase();
          const match = State.products.find(p => p.barcode_sku.toLowerCase() === val || p.product_name.toLowerCase().includes(val));
          if (match) {
            window.addToPosCart(match.barcode_sku);
            e.target.value = '';
            showToast(`⚡ Menu ditambahkan: ${match.product_name}`);
          }
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initApp);
})();
