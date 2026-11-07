/**
 * ============================================================================
 * RASH MITRA — APP CONTROLLER & OPERATIONAL WORKSPACE
 * Theme: Blue - Green - White (Modern Fintech POS & Mini ERP)
 * Roles: Kasir (Staff) & Super Admin (Owner)
 * Modules: POS Kasir | Master Produk & Stok | Antrean Pesanan | Pengaturan
 * ============================================================================
 */

(function () {
  'use strict';

  // State Management
  const State = {
    user: null, // { name: '', role: 'STAFF' | 'OWNER', email: '' }
    isDemo: false,
    currentVertical: 'RESTO', // RESTO | RETAIL | LAUNDRY
    currentAppTab: 'pos', // pos | produk | pesanan | admin
    products: [],
    orders: [],
    settings: {},
    posCart: [],
    posClockedIn: true,
    posSelectedCategory: 'ALL',
    posSearchQuery: '',
    posPayMethod: 'CASH',
    posCashTendered: 0,
    editingProductSku: null
  };

  // Toast Helper
  function showToast(message, duration) {
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
  }

  function formatIDR(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  }

  function UtilitiesFormatDate() {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}${mo}${da}`;
  }

  // ============================================================================
  // LOCAL STORAGE ORDER SYNC (Realtime antar Tab / Katalog & Kasir)
  // ============================================================================
  function loadPersistedOrders() {
    try {
      const stored = localStorage.getItem('RASH_MITRA_ORDERS');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Gagal membaca orders dari localStorage:', e);
    }
    return JSON.parse(JSON.stringify(window.APP_CONFIG.MOCK_ORDERS || []));
  }

  function savePersistedOrders(ordersList) {
    try {
      localStorage.setItem('RASH_MITRA_ORDERS', JSON.stringify(ordersList));
    } catch (e) {
      console.warn('Gagal menyimpan orders ke localStorage:', e);
    }
  }

  function loadPersistedProducts() {
    try {
      const stored = localStorage.getItem('RASH_MITRA_PRODUCTS');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Gagal membaca products dari localStorage:', e);
    }
    return JSON.parse(JSON.stringify(window.APP_CONFIG.MOCK_PRODUCTS || []));
  }

  function savePersistedProducts(prodsList) {
    try {
      localStorage.setItem('RASH_MITRA_PRODUCTS', JSON.stringify(prodsList));
    } catch (e) {
      console.warn('Gagal menyimpan products ke localStorage:', e);
    }
  }

  // ============================================================================
  // 1. INISIALISASI APLIKASI
  // ============================================================================
  async function initApp() {
    // Muat data pengaturan & produk
    State.settings = window.APP_CONFIG.MOCK_SETTINGS || {};
    State.products = loadPersistedProducts();
    State.orders = loadPersistedOrders();
    State.currentVertical = State.settings.BUSINESS_VERTICAL || 'RESTO';

    // Periksa Sesi Login Tersimpan
    const savedSession = sessionStorage.getItem('RASH_USER_SESSION');
    if (savedSession) {
      try {
        State.user = JSON.parse(savedSession);
        enterMainApplication();
      } catch (e) {
        showLoginGate();
      }
    } else {
      showLoginGate();
      // Buka tab owner otomatis jika ada parameter ?auth=owner
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth') === 'owner') {
        window.switchAuthTab('owner');
      }
    }

    setupEventListeners();

    // Dengarkan event sinkronisasi localStorage saat pelanggan pesan dari tab katalog
    window.addEventListener('storage', (e) => {
      if (e.key === 'RASH_MITRA_ORDERS') {
        State.orders = loadPersistedOrders();
        renderOrdersQueueTable();
        updatePendingOrderBadge();
        showToast('🔔 Pesanan baru masuk dari Katalog Pelanggan!');
      }
      if (e.key === 'RASH_MITRA_PRODUCTS') {
        State.products = loadPersistedProducts();
        renderPosCatalog();
        renderInventoryTable();
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
    if (storeNameEl) storeNameEl.textContent = State.settings.STORE_NAME || 'RASH Smart POS';
    if (userNameEl) userNameEl.textContent = State.user.name;

    const roleBadge = document.getElementById('appRoleBadge');
    const demoBox = document.getElementById('demoModelSelectorBox');
    const navAdmin = document.getElementById('navTabAdmin');

    const isSuperAdmin = State.user.role === 'OWNER' || State.isDemo;

    if (roleBadge) {
      if (State.isDemo) {
        roleBadge.textContent = 'MODE DEMO';
        roleBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200';
      } else if (State.user.role === 'OWNER') {
        roleBadge.textContent = 'SUPER ADMIN';
        roleBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200';
      } else {
        roleBadge.textContent = 'KASIR AKTIF';
        roleBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200';
      }
    }

    // Pilihan 3 Model Vertikal disembunyikan untuk staf kasir biasa
    if (demoBox) {
      demoBox.style.display = isSuperAdmin ? 'flex' : 'none';
    }
    if (navAdmin) {
      navAdmin.style.display = isSuperAdmin ? 'flex' : 'none';
    }

    // Set dropdown model aktif
    const modelSelect = document.getElementById('activeModelSelect');
    if (modelSelect) modelSelect.value = State.currentVertical;

    // Inisialisasi tampilan
    renderActiveModelUI();
    renderPosCategories();
    renderPosCatalog();
    renderInventoryTable();
    renderOrdersQueueTable();
    updatePosCartUI();
    updatePendingOrderBadge();
    generateInvoiceNumber();
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
      showToast('⚠️ PIN Kasir keliru! Gunakan PIN demo: 1234');
      return;
    }

    State.user = { name: staffName, role: 'STAFF', email: 'kasir@rashmitra.id' };
    State.isDemo = false;
    sessionStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
    enterMainApplication();
    showToast(`👋 Selamat bertugas, ${staffName}!`);
  };

  window.handleOwnerLogin = function () {
    const user = (document.getElementById('ownerUser')?.value || '').trim();
    const pass = (document.getElementById('ownerPass')?.value || '').trim();

    if (user.toLowerCase() === 'darurat' || user.toLowerCase() === 'admin') {
      State.user = { name: 'Super Admin (Owner)', role: 'OWNER', email: 'owner@rashmitra.id' };
      State.isDemo = false;
      sessionStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
      enterMainApplication();
      showToast('🔓 Akses Penuh Super Admin Terbuka!');
    } else {
      showToast('⚠️ Username darurat: ketik "darurat"');
    }
  };

  window.handleGoogleLogin = function () {
    State.user = { name: 'Owner Google Workspace', role: 'OWNER', email: 'owner.mitra@gmail.com' };
    State.isDemo = false;
    sessionStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
    enterMainApplication();
    showToast('✅ Berhasil masuk sebagai Super Admin Google Workspace!');
  };

  window.quickDemoLogin = function (role) {
    State.isDemo = true;
    if (role === 'staff') {
      State.user = { name: 'Kasir Demo (Budi)', role: 'STAFF', email: 'demo-kasir@rash.id' };
    } else {
      State.user = { name: 'Super Admin Demo', role: 'OWNER', email: 'demo-owner@rash.id' };
    }
    sessionStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
    enterMainApplication();
    showToast(`⚡ Masuk instan sebagai ${State.user.name}`);
  };

  window.handleLogoutApp = function () {
    sessionStorage.removeItem('RASH_USER_SESSION');
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
    if (tab === 'admin') {
      if (State.user.role !== 'OWNER' && !State.isDemo) {
        showToast('⛔ Akses Terbatas: Hanya Super Admin.');
        window.switchAppTab('pos');
        return;
      }
      document.getElementById('panelTabAdmin')?.classList.remove('hidden');
    }

    // Styling tombol navigasi
    document.querySelectorAll('.nav-app-btn').forEach(btn => {
      btn.className = 'nav-app-btn px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-2 transition-all shrink-0';
    });

    const activeMap = {
      pos: 'navTabPos',
      produk: 'navTabProduk',
      pesanan: 'navTabPesanan',
      admin: 'navTabAdmin'
    };

    const activeEl = document.getElementById(activeMap[tab]);
    if (activeEl) {
      activeEl.className = 'nav-app-btn px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center gap-2 transition-all shrink-0';
    }
  };

  // ============================================================================
  // 4. MULTI-VERTIKAL ENGINE (RESTO / RETAIL / LAUNDRY)
  // ============================================================================
  window.changeBusinessModel = function (newModel) {
    State.currentVertical = newModel;
    State.settings.BUSINESS_VERTICAL = newModel;

    const select = document.getElementById('activeModelSelect');
    if (select) select.value = newModel;

    // Highlight opsi model di tab admin
    document.querySelectorAll('.model-card-option').forEach(c => {
      const isSel = c.dataset.val === newModel;
      c.className = isSel
        ? 'model-card-option p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/70 shadow-sm cursor-pointer transition-all'
        : 'model-card-option p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-all';
    });

    renderActiveModelUI();
    renderPosCategories();
    renderPosCatalog();
    renderInventoryTable();
    renderOrdersQueueTable();

    const label = { RESTO: 'Restoran / Kafe', RETAIL: 'Retail / Warung', LAUNDRY: 'Laundry / Jasa' }[newModel];
    showToast(`🔄 Model Bisnis Aktif: ${label}`);
  };

  function renderActiveModelUI() {
    const inputsBox = document.getElementById('posVerticalInputs');
    if (!inputsBox) return;

    if (State.currentVertical === 'RESTO') {
      inputsBox.innerHTML = `
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">Nomor Meja:</label>
          <input type="text" id="posTableNumber" placeholder="Contoh: Meja 04" class="w-full text-xs font-semibold rounded-xl border-slate-200 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500" value="Meja 01" />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">Tipe Pesanan:</label>
          <select id="posServiceType" class="w-full text-xs font-semibold rounded-xl border-slate-200 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500">
            <option value="Dine-in">Makan di Tempat (Dine-in)</option>
            <option value="Takeaway">Bungkus (Takeaway)</option>
          </select>
        </div>
      `;
    } else if (State.currentVertical === 'LAUNDRY') {
      inputsBox.innerHTML = `
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">Berat Laundry (Kg):</label>
          <input type="number" id="posLaundryWeight" step="0.5" placeholder="cth: 3.5" class="w-full text-xs font-semibold rounded-xl border-slate-200 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500" value="3.0" />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">Paket Layanan:</label>
          <select id="posLaundryService" class="w-full text-xs font-semibold rounded-xl border-slate-200 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500">
            <option value="Reguler (2 Hari)">Reguler (2 Hari)</option>
            <option value="Kilat Express (6 Jam)">Kilat Express (6 Jam)</option>
            <option value="Satuan Dry Clean">Satuan Dry Clean</option>
          </select>
        </div>
      `;
    } else {
      inputsBox.innerHTML = `
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">Nama Pembeli:</label>
          <input type="text" id="posRetailCustomer" placeholder="Pelanggan Umum" class="w-full text-xs font-semibold rounded-xl border-slate-200 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500" value="Pelanggan Umum" />
        </div>
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">No. WhatsApp:</label>
          <input type="tel" id="posRetailPhone" placeholder="08xxxxxxxxxx" class="w-full text-xs font-semibold rounded-xl border-slate-200 p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500" />
        </div>
      `;
    }
  }

  // ============================================================================
  // 5. STASIUN KASIR (POS) LENGKAP & INTERAKTIF
  // ============================================================================
  function getProductsByVertical() {
    return State.products.filter(p => {
      if (State.currentVertical === 'RESTO') return p.vertical === 'RESTO' || p.category === 'Makanan' || p.category === 'Minuman' || p.category === 'Burritos' || p.category === 'Bowls' || p.category === 'Tacos' || p.category === 'Quesadillas';
      if (State.currentVertical === 'RETAIL') return p.vertical === 'RETAIL' || p.category === 'Sembako';
      if (State.currentVertical === 'LAUNDRY') return p.vertical === 'LAUNDRY' || p.category.includes('Laundry');
      return true;
    });
  }

  function renderPosCategories() {
    const container = document.getElementById('posCategoryPills');
    if (!container) return;

    const items = getProductsByVertical();
    const categories = ['ALL', ...new Set(items.map(p => p.category))];

    container.innerHTML = categories.map(cat => {
      const isSel = State.posSelectedCategory === cat;
      const label = cat === 'ALL' ? 'Semua Menu' : cat;
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

    let items = getProductsByVertical();

    // Filter Kategori
    if (State.posSelectedCategory !== 'ALL') {
      items = items.filter(p => p.category.toLowerCase() === State.posSelectedCategory.toLowerCase());
    }

    // Filter Pencarian
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
          <p class="text-xs font-semibold">Tidak ada produk yang cocok dengan pencarian.</p>
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
      showToast(`⚠️ Stok ${prod.product_name} habis! Lakukan restock terlebih dahulu.`);
      return;
    }

    const exist = State.posCart.find(i => i.barcode_sku === sku);
    if (exist) {
      if (exist.qty >= prod.current_stock) {
        showToast(`⚠️ Tidak bisa melebihi stok yang tersedia (${prod.current_stock}).`);
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
      showToast(`⚠️ Batas stok tercapai (${prod.current_stock}).`);
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
    showToast('🗑️ Keranjang kasir dikosongkan.');
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

    if (State.posCart.length === 0) {
      list.innerHTML = `
        <div class="text-center py-10 text-slate-400">
          <span class="material-symbols-outlined text-3xl mb-1 text-slate-300">point_of_sale</span>
          <p class="text-xs font-semibold">Keranjang masih kosong.</p>
          <p class="text-[10px] text-slate-400 mt-0.5">Klik menu di sebelah kiri untuk menambah pesanan.</p>
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
    }
  };

  window.setQuickCash = function (val) {
    const grand = State.posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    if (val === 'EXACT') {
      State.posCashTendered = grand;
      showToast(`💵 Uang Pas: ${formatIDR(grand)}`);
    } else {
      State.posCashTendered = Number(val);
      const change = State.posCashTendered - grand;
      if (change >= 0) {
        showToast(`💵 Diterima: ${formatIDR(val)} | Kembalian: ${formatIDR(change)}`);
      } else {
        showToast(`⚠️ Uang kurang ${formatIDR(Math.abs(change))}`);
      }
    }
  };

  window.handlePosCheckoutSubmit = function () {
    if (State.posCart.length === 0) {
      showToast('⚠️ Keranjang kasir masih kosong!');
      return;
    }

    const grand = State.posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const invoiceNo = document.getElementById('posInvoiceId')?.textContent || ('#INV-' + Date.now().toString().slice(-6));

    // Potong stok produk di State & Simpan ke Persistensi
    State.posCart.forEach(ci => {
      const p = State.products.find(prod => prod.barcode_sku === ci.barcode_sku);
      if (p) {
        p.current_stock = Math.max(0, p.current_stock - ci.qty);
      }
    });
    savePersistedProducts(State.products);

    // Metadata vertikal
    let tableNo = '';
    let laundryWeight = '';
    let custName = 'Pelanggan Walk-in';

    if (State.currentVertical === 'RESTO') {
      tableNo = document.getElementById('posTableNumber')?.value || 'Meja 01';
      custName = `Kasir (${tableNo})`;
    } else if (State.currentVertical === 'LAUNDRY') {
      laundryWeight = (document.getElementById('posLaundryWeight')?.value || '3.0') + ' Kg';
      custName = 'Pelanggan Laundry';
    } else {
      custName = document.getElementById('posRetailCustomer')?.value || 'Pelanggan Retail';
    }

    const newOrder = {
      order_id: invoiceNo.replace('#', ''),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      customer_name: custName,
      customer_phone: '',
      vertical: State.currentVertical,
      table_number: tableNo,
      laundry_weight: laundryWeight,
      items: JSON.parse(JSON.stringify(State.posCart)),
      total_amount: grand,
      payment_method: State.posPayMethod,
      status: 'COMPLETED',
      status_label: 'Selesai (Lunas)'
    };

    State.orders.unshift(newOrder);
    savePersistedOrders(State.orders);

    // Tampilkan & Cetak Struk Thermal
    showThermalReceipt(newOrder);

    // Reset keranjang
    State.posCart = [];
    updatePosCartUI();
    renderPosCatalog();
    renderInventoryTable();
    renderOrdersQueueTable();
    generateInvoiceNumber();

    showToast(`✅ Transaksi ${newOrder.order_id} berhasil disimpan!`);
  };

  // ============================================================================
  // 6. MASTER PRODUK & STOK INVENTORI (SUPER ADMIN EDITING)
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
            Tidak ada produk yang cocok dengan filter.
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
                <span class="text-[10px] text-slate-400 font-normal">${p.description || '-'}</span>
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
            <span class="text-[10px] text-slate-400 font-normal block">${p.unit_measure || 'pcs'}</span>
          </td>
          <td class="p-3.5 text-center">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${
              isLow ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }">
              ${isLow ? '⚠️ Stok Menipis' : '✅ Aman'}
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
              <button onclick="window.openQuickEditProduct('${p.barcode_sku}')" title="Edit Harga & Nama" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors">
                <span class="material-symbols-outlined text-[16px]">edit</span>
              </button>
              <button onclick="window.deleteProduct('${p.barcode_sku}')" title="Hapus Produk" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 flex items-center justify-center transition-colors">
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
    showToast(`📦 Stok ${p.product_name}: ${p.current_stock}`);
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

    if (confirm(`Yakin ingin menghapus produk "${p.product_name}" (${sku}) dari katalog?`)) {
      State.products = State.products.filter(prod => prod.barcode_sku !== sku);
      savePersistedProducts(State.products);
      renderInventoryTable();
      renderPosCatalog();
      showToast(`🗑️ Produk ${p.product_name} telah dihapus.`);
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
    const cat = document.getElementById('newProdCategory')?.value || 'Burritos';
    const cost = Number(document.getElementById('newProdCostPrice')?.value) || 0;
    const price = Number(document.getElementById('newProdSellingPrice')?.value) || 0;
    const stock = Number(document.getElementById('newProdStock')?.value) || 0;
    const unit = (document.getElementById('newProdUnit')?.value || 'porsi').trim();
    const imgUrl = (document.getElementById('newProdImageUrl')?.value || '').trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600';

    if (!name || !sku) {
      showToast('⚠️ Nama produk dan SKU wajib diisi!');
      return;
    }

    if (State.products.some(p => p.barcode_sku === sku)) {
      showToast('⚠️ SKU tersebut sudah digunakan oleh produk lain!');
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
      vertical: State.currentVertical,
      image_url: imgUrl,
      description: 'Menu produk baru.'
    };

    State.products.unshift(newProd);
    savePersistedProducts(State.products);

    window.closeAddProductModal();
    renderInventoryTable();
    renderPosCatalog();
    showToast(`✅ Produk baru "${name}" berhasil ditambahkan!`);
  };

  // ============================================================================
  // 7. ANTREAN & LACAK PESANAN (ORDER TRACKER & KASIR ACTIONS)
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
            <span class="material-symbols-outlined text-4xl mb-1">receipt_long</span>
            <p class="text-xs font-semibold">Belum ada antrean pesanan.</p>
            <p class="text-[10px] text-slate-400">Pesanan dari katalog mandiri pelanggan akan otomatis muncul di sini.</p>
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
            <div class="font-bold text-slate-900">${o.customer_name}</div>
            <div class="flex items-center gap-1.5 mt-0.5">
              ${o.table_number ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">🍽️ ${o.table_number}</span>` : ''}
              ${o.customer_phone ? `<span class="text-[10px] text-emerald-600 font-mono font-bold">WA: ${o.customer_phone}</span>` : ''}
            </div>
          </td>
          <td class="p-3.5 text-slate-700">
            <div class="space-y-0.5 max-w-xs">${itemsText}</div>
          </td>
          <td class="p-3.5 font-mono font-black text-slate-900">${formatIDR(o.total_amount)}</td>
          <td class="p-3.5 text-center">
            <span class="px-3 py-1 rounded-full text-[11px] font-bold ${getOrderStatusBadgeClass(o.status)}">
              ${o.status_label || o.status}
            </span>
          </td>
          <td class="p-3.5 text-center">
            <div class="inline-flex items-center gap-1.5">
              <select onchange="window.updateOrderStatus('${o.order_id}', this.value)" class="text-xs font-bold rounded-xl border-slate-200 p-1.5 bg-white focus:ring-2 focus:ring-blue-500 shadow-xs">
                <option value="RECEIVED" ${o.status === 'RECEIVED' || o.status === 'PENDING' ? 'selected' : ''}>1. Diterima Kasir</option>
                <option value="COOKING" ${o.status === 'COOKING' || o.status === 'WASHING' ? 'selected' : ''}>2. Sedang Dimasak</option>
                <option value="READY" ${o.status === 'READY' ? 'selected' : ''}>3. Siap Saji / Diantar</option>
                <option value="COMPLETED" ${o.status === 'COMPLETED' ? 'selected' : ''}>4. Selesai (Lunas)</option>
              </select>
              ${o.customer_phone ? `
                <a href="https://wa.me/${o.customer_phone.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(o.customer_name)},%20pesanan%20Anda%20${o.order_id}%20statusnya:%20${encodeURIComponent(o.status_label || o.status)}" target="_blank" class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors shadow-xs" title="Chat WhatsApp Pelanggan">
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
    if (st === 'COOKING' || st === 'WASHING') return 'bg-blue-100 text-blue-800 border border-blue-300';
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  }

  window.updateOrderStatus = function (orderId, newStatus) {
    const ord = State.orders.find(o => o.order_id === orderId);
    if (!ord) return;

    ord.status = newStatus;
    if (newStatus === 'RECEIVED') ord.status_label = 'Pesanan Diterima';
    if (newStatus === 'COOKING') ord.status_label = State.currentVertical === 'LAUNDRY' ? 'Sedang Dicuci' : 'Sedang Dimasak Dapur';
    if (newStatus === 'READY') ord.status_label = State.currentVertical === 'LAUNDRY' ? 'Siap Diambil' : 'Siap Diantar ke Meja';
    if (newStatus === 'COMPLETED') ord.status_label = 'Selesai (Lunas)';

    savePersistedOrders(State.orders);
    renderOrdersQueueTable();
    updatePendingOrderBadge();
    showToast(`📋 Status pesanan ${orderId} diubah: ${ord.status_label}`);
  };

  window.handleOrderSearch = function (val) {
    renderOrdersQueueTable();
  };

  // ============================================================================
  // 8. CETAK STRUK THERMAL 58MM
  // ============================================================================
  function showThermalReceipt(orderData) {
    const container = document.getElementById('thermalPrintContainer');
    if (!container) return;

    const itemsHtml = Array.isArray(orderData.items)
      ? orderData.items.map(i => `
          <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
            <span>${i.name} x${i.qty}</span>
            <span>${formatIDR(i.price * i.qty)}</span>
          </div>
        `).join('')
      : `<div>${orderData.items}</div>`;

    container.innerHTML = `
      <div style="text-align:center; margin-bottom:8px;">
        <div style="font-weight:bold; font-size:13px;">${State.settings.STORE_NAME || 'RASH MITRA POS'}</div>
        <div style="font-size:10px;">${State.settings.STORE_ADDRESS || 'Smart POS System'}</div>
        <div style="font-size:10px; margin-top:4px;">No: ${orderData.order_id}</div>
        <div style="font-size:10px;">Waktu: ${orderData.timestamp}</div>
      </div>
      ${orderData.table_number ? `<div style="font-weight:bold; margin-bottom:4px;">MEJA: ${orderData.table_number}</div>` : ''}
      <div style="border-top:1px dashed #000; margin:6px 0;"></div>
      ${itemsHtml}
      <div style="border-top:1px dashed #000; margin:6px 0;"></div>
      <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:12px;">
        <span>TOTAL:</span>
        <span>${formatIDR(orderData.total_amount)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:10px; margin-top:2px;">
        <span>Metode:</span>
        <span>${orderData.payment_method || 'TUNAI'}</span>
      </div>
      <div style="border-top:1px dashed #000; margin:6px 0;"></div>
      <div style="text-align:center; font-size:9px; margin-top:6px;">
        <div>${State.settings.THERMAL_FOOTER || 'Terima kasih atas kunjungan Anda!'}</div>
        <div style="margin-top:4px; font-weight:bold;">Powered by RASH Mitra</div>
      </div>
    `;

    // Tampilkan notifikasi & opsi cetak
    if (confirm(`Transaksi ${orderData.order_id} berhasil!\n\nCetak struk thermal 58mm sekarang?`)) {
      window.print();
    }
  }

  // ============================================================================
  // 9. SUPER ADMIN SETTINGS
  // ============================================================================
  window.saveAdminSettings = function () {
    const store = (document.getElementById('settStoreName')?.value || '').trim();
    const addr = (document.getElementById('settStoreAddress')?.value || '').trim();
    const footer = (document.getElementById('settThermalFooter')?.value || '').trim();
    const qris = (document.getElementById('settQrisNmid')?.value || '').trim();

    if (store) State.settings.STORE_NAME = store;
    if (addr) State.settings.STORE_ADDRESS = addr;
    if (footer) State.settings.THERMAL_FOOTER = footer;
    if (qris) State.settings.QRIS_MERCHANT_ID = qris;

    document.getElementById('appStoreName').textContent = State.settings.STORE_NAME;
    showToast('💾 Pengaturan toko berhasil disimpan!');
  };

  // Event Listeners Umum
  function setupEventListeners() {
    // Barcode Search F2 Shortcut
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

  // Jalankan saat dokumen siap
  document.addEventListener('DOMContentLoaded', initApp);
})();
