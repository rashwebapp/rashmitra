/**
 * ============================================================================
 * RASH MITRA — APP CONTROLLER & OPERATIONAL WORKSPACE
 * Roles: Kasir (Staff) & Super Admin (Owner)
 * Modules: POS Kasir | Master Produk CRUD | Pelacakan Pesanan | Master Settings
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
    posClockedIn: false,
    posSelectedCategory: 'ALL',
    posSearchQuery: '',
    posPayMethod: 'CASH',
    posCashTendered: 0
  };

  // Toast Helper
  function showToast(message, duration) {
    duration = duration || 3200;
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast-box';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  function formatIDR(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  }

  // ============================================================================
  // 1. INISIALISASI
  // ============================================================================
  async function initApp() {
    // Muat data dari ApiClient (dengan fallback mock data)
    const [settings, products] = await Promise.all([
      window.ApiClient.fetchData('getSettings'),
      window.ApiClient.fetchData('getProducts')
    ]);

    State.settings = settings || window.APP_CONFIG.MOCK_SETTINGS;
    State.products = products || window.APP_CONFIG.MOCK_PRODUCTS;
    State.orders = JSON.parse(JSON.stringify(window.APP_CONFIG.MOCK_ORDERS || []));
    State.currentVertical = State.settings.BUSINESS_VERTICAL || 'RESTO';

    // Cek Sesi Tersimpan
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
    }

    setupEventListeners();
  }

  // ============================================================================
  // 2. SISTEM LOGIN & OTORISASI (PINTU MASUK)
  // ============================================================================
  function showLoginGate() {
    document.getElementById('authGateView').classList.remove('hidden');
    document.getElementById('mainAppView').classList.add('hidden');
  }

  function enterMainApplication() {
    document.getElementById('authGateView').classList.add('hidden');
    document.getElementById('mainAppView').classList.remove('hidden');

    // Update Header Identity
    document.getElementById('appStoreName').textContent = State.settings.STORE_NAME || 'RASH Mitra UMKM';
    document.getElementById('appUserName').textContent = State.user.name;

    const roleBadge = document.getElementById('appRoleBadge');
    const demoBox = document.getElementById('demoModelSelectorBox');
    const navAdmin = document.getElementById('navTabAdmin');

    if (State.user.role === 'OWNER' || State.isDemo) {
      roleBadge.textContent = State.isDemo ? 'MODE DEMO' : 'SUPER ADMIN';
      roleBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300';
      demoBox.style.display = 'flex';
      navAdmin.style.display = 'flex';
    } else {
      roleBadge.textContent = 'KASIR OPERASIONAL';
      roleBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800';
      // Sembunyikan selector model untuk kasir biasa (hanya Owner yang berhak mengubah model bisnis)
      demoBox.style.display = 'none';
      navAdmin.style.display = 'none';
    }

    // Set dropdown model aktif
    const modelSelect = document.getElementById('activeModelSelect');
    if (modelSelect) modelSelect.value = State.currentVertical;

    renderActiveModelUI();
    renderPosCatalog();
    renderInventoryTable();
    renderOrdersQueueTable();
    checkPosClockInStatus();
  }

  window.switchAuthTab = function (tab) {
    const isStaff = tab === 'staff';
    document.getElementById('authStaffForm').classList.toggle('hidden', !isStaff);
    document.getElementById('authOwnerForm').classList.toggle('hidden', isStaff);

    document.getElementById('authTabStaffBtn').className = isStaff
      ? 'flex-1 py-2.5 text-xs font-bold rounded-xl bg-primary text-white shadow-sm transition-all flex items-center justify-center gap-1.5'
      : 'flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:text-primary transition-all flex items-center justify-center gap-1.5';

    document.getElementById('authTabOwnerBtn').className = !isStaff
      ? 'flex-1 py-2.5 text-xs font-bold rounded-xl bg-primary text-white shadow-sm transition-all flex items-center justify-center gap-1.5'
      : 'flex-1 py-2.5 text-xs font-bold rounded-xl text-slate-600 hover:text-primary transition-all flex items-center justify-center gap-1.5';
  };

  window.handleStaffLogin = function () {
    const staffName = document.getElementById('loginStaffSelect').value;
    const pin = document.getElementById('loginStaffPin').value;

    if (pin !== '1234') {
      showToast('⚠️ PIN Kasir salah. Gunakan PIN default 1234 untuk demo.');
      return;
    }

    State.user = { name: staffName, role: 'STAFF', email: 'kasir@rashmitra.id' };
    State.isDemo = false;
    sessionStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
    enterMainApplication();
    showToast(`👋 Selamat bertugas, ${staffName}!`);
  };

  window.handleOwnerLogin = function () {
    const user = document.getElementById('ownerUser').value.trim();
    const pass = document.getElementById('ownerPass').value.trim();

    if (user === 'darurat') {
      State.user = { name: 'Owner Utama', role: 'OWNER', email: 'owner@rashmitra.id' };
      State.isDemo = false;
      sessionStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
      enterMainApplication();
      showToast('🔓 Selamat datang di Konsol Super Admin!');
    } else {
      showToast('⚠️ Kredensial Super Admin tidak cocok.');
    }
  };

  window.handleGoogleLogin = function () {
    // Simulasi login Google OAuth Owner
    State.user = { name: 'Owner Google Workspace', role: 'OWNER', email: 'mitra.owner@gmail.com' };
    State.isDemo = false;
    sessionStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
    enterMainApplication();
    showToast('✅ Berhasil masuk via Google OAuth Super Admin!');
  };

  window.quickDemoLogin = function (role) {
    State.isDemo = true;
    if (role === 'staff') {
      State.user = { name: 'Demo Kasir (Budi)', role: 'STAFF', email: 'demo-kasir@rash.id' };
    } else {
      State.user = { name: 'Demo Super Admin (Owner)', role: 'OWNER', email: 'demo-owner@rash.id' };
    }
    sessionStorage.setItem('RASH_USER_SESSION', JSON.stringify(State.user));
    enterMainApplication();
    showToast(`⚡ Masuk sebagai ${State.user.name}`);
  };

  window.handleLogoutApp = function () {
    sessionStorage.removeItem('RASH_USER_SESSION');
    State.user = null;
    State.isDemo = false;
    State.posClockedIn = false;
    State.posCart = [];
    showLoginGate();
    showToast('🔒 Anda telah keluar dari sesi kerja.');
  };

  // ============================================================================
  // 3. NAVIGASI TAB APLIKASI
  // ============================================================================
  window.switchAppTab = function (tab) {
    State.currentAppTab = tab;

    // Sembunyikan semua panel
    document.querySelectorAll('.app-panel').forEach(p => p.classList.add('hidden'));

    // Tampilkan panel aktif
    if (tab === 'pos') document.getElementById('panelTabPos').classList.remove('hidden');
    if (tab === 'produk') {
      document.getElementById('panelTabProduk').classList.remove('hidden');
      renderInventoryTable();
    }
    if (tab === 'pesanan') {
      document.getElementById('panelTabPesanan').classList.remove('hidden');
      renderOrdersQueueTable();
    }
    if (tab === 'admin') {
      if (State.user.role !== 'OWNER' && !State.isDemo) {
        showToast('⛔ Akses Terbatas: Hanya Super Admin / Owner.');
        window.switchAppTab('pos');
        return;
      }
      document.getElementById('panelTabAdmin').classList.remove('hidden');
    }

    // Update styling tab buttons
    document.querySelectorAll('.nav-app-btn').forEach(btn => {
      btn.className = 'nav-app-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-primary hover:bg-slate-200/60 flex items-center gap-1.5 transition-all';
    });

    const activeBtn = {
      pos: 'navTabPos',
      produk: 'navTabProduk',
      pesanan: 'navTabPesanan',
      admin: 'navTabAdmin'
    }[tab];

    if (activeBtn) {
      document.getElementById(activeBtn).className = 'nav-app-btn px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white shadow-sm flex items-center gap-1.5 transition-all';
    }
  };

  // ============================================================================
  // 4. MULTI-VERTIKAL ENGINE (RETAIL / RESTO / LAUNDRY)
  // ============================================================================
  window.changeBusinessModel = function (newModel) {
    State.currentVertical = newModel;
    State.settings.BUSINESS_VERTICAL = newModel;

    // Update selector jika ada
    const select = document.getElementById('activeModelSelect');
    if (select) select.value = newModel;

    // Update active highlight card di tab admin
    document.querySelectorAll('.model-card-option').forEach(c => {
      const isSel = c.dataset.val === newModel;
      c.className = isSel
        ? 'model-card-option p-4 rounded-2xl border-2 border-primary bg-primary/5 cursor-pointer transition-all text-center'
        : 'model-card-option p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-all text-center';
    });

    renderActiveModelUI();
    renderPosCatalog();
    renderInventoryTable();
    renderOrdersQueueTable();

    const label = { RESTO: 'Restoran & Kafe', RETAIL: 'Retail & Warung', LAUNDRY: 'Laundry & Jasa' }[newModel];
    showToast(`🔄 Model Bisnis Berganti: ${label}`);
  };

  function renderActiveModelUI() {
    const inputsBox = document.getElementById('posVerticalInputs');
    if (!inputsBox) return;

    if (State.currentVertical === 'RESTO') {
      inputsBox.innerHTML = `
        <div>
          <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Nomor Meja:</label>
          <input type="text" id="posTableNumber" placeholder="Contoh: Meja 03" class="w-full text-xs font-semibold rounded-lg border-slate-200 p-1.5 bg-slate-50" />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Tipe Layanan:</label>
          <select id="posServiceType" class="w-full text-xs font-semibold rounded-lg border-slate-200 p-1.5 bg-slate-50">
            <option value="Dine-In">Makan di Tempat (Dine-In)</option>
            <option value="Takeaway">Bungkus (Takeaway)</option>
          </select>
        </div>
      `;
    } else if (State.currentVertical === 'LAUNDRY') {
      inputsBox.innerHTML = `
        <div>
          <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Berat Timbangan (Kg):</label>
          <input type="number" id="posLaundryWeight" step="0.1" placeholder="cth: 4.5" class="w-full text-xs font-semibold rounded-lg border-slate-200 p-1.5 bg-slate-50" />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Paket Layanan:</label>
          <select id="posLaundryService" class="w-full text-xs font-semibold rounded-lg border-slate-200 p-1.5 bg-slate-50">
            <option value="Reguler (2 Hari)">Reguler (2 Hari)</option>
            <option value="Kilat Express (6 Jam)">Kilat Express (6 Jam)</option>
            <option value="Setrika Saja">Setrika Saja</option>
          </select>
        </div>
      `;
    } else {
      inputsBox.innerHTML = `
        <div>
          <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Nama Pelanggan:</label>
          <input type="text" id="posRetailCustomer" placeholder="Umum / Member" class="w-full text-xs font-semibold rounded-lg border-slate-200 p-1.5 bg-slate-50" />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Nomor WhatsApp:</label>
          <input type="tel" id="posRetailPhone" placeholder="08xxxxxxxxxx" class="w-full text-xs font-semibold rounded-lg border-slate-200 p-1.5 bg-slate-50" />
        </div>
      `;
    }
  }

  // ============================================================================
  // 5. STASIUN KASIR (POS) & GATED CLOCK-IN
  // ============================================================================
  function checkPosClockInStatus() {
    const lockGate = document.getElementById('appPosLockGate');
    const posStation = document.getElementById('appPosStation');

    if (State.posClockedIn) {
      lockGate.classList.add('hidden');
      posStation.classList.remove('hidden');
    } else {
      lockGate.classList.remove('hidden');
      posStation.classList.add('hidden');
    }
  }

  window.unlockPosClockIn = function () {
    const shift = document.getElementById('posClockInShift').value;
    State.posClockedIn = true;
    checkPosClockInStatus();
    showToast(`🔓 Absen Masuk Tercatat (${shift}). Register Kasir Terbuka!`);
  };

  function getProductsByVertical() {
    return State.products.filter(p => {
      if (State.currentVertical === 'RESTO') return p.vertical === 'RESTO' || p.category === 'Makanan' || p.category === 'Minuman';
      if (State.currentVertical === 'RETAIL') return p.vertical === 'RETAIL' || p.category === 'Sembako';
      if (State.currentVertical === 'LAUNDRY') return p.vertical === 'LAUNDRY' || p.category.includes('Laundry');
      return true;
    });
  }

  function renderPosCatalog() {
    const container = document.getElementById('posProductGrid');
    if (!container) return;

    let items = getProductsByVertical();

    // Filter Kategori
    if (State.posSelectedCategory !== 'ALL') {
      items = items.filter(p => p.category.toLowerCase().includes(State.posSelectedCategory.toLowerCase()));
    }

    // Filter Pencarian Barcode / SKU
    if (State.posSearchQuery) {
      const q = State.posSearchQuery.toLowerCase();
      items = items.filter(p => p.product_name.toLowerCase().includes(q) || p.barcode_sku.toLowerCase().includes(q));
    }

    if (items.length === 0) {
      container.innerHTML = '<div class="col-span-3 text-center py-12 text-xs text-text-muted">Tidak ada produk ditemukan.</div>';
      return;
    }

    container.innerHTML = items.map(p => `
      <div onclick="window.addToPosCart('${p.barcode_sku}')" class="bg-white rounded-2xl p-2.5 border border-slate-200 hover:border-primary shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group">
        <div class="h-24 w-full rounded-xl overflow-hidden mb-2 relative bg-slate-100">
          <img src="${p.image_url}" alt="${p.product_name}" class="w-full h-full object-cover group-hover:scale-105 transition-all" loading="lazy" />
          <span class="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[9px] font-bold backdrop-blur-sm">
            ${p.barcode_sku}
          </span>
          <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded ${p.current_stock <= (p.min_stock_alert || 5) ? 'bg-red-600 text-white' : 'bg-white/90 text-slate-800'} font-bold text-[9px] shadow-sm">
            Stok: ${p.current_stock}
          </span>
        </div>
        <div>
          <h4 class="font-bold text-xs text-primary leading-tight line-clamp-2 mb-1">${p.product_name}</h4>
          <div class="font-black text-xs text-slate-900 font-mono">${formatIDR(p.selling_price)}</div>
        </div>
      </div>
    `).join('');
  }

  window.filterPosCategory = function (cat, el) {
    State.posSelectedCategory = cat;
    document.querySelectorAll('.pos-cat-pill').forEach(btn => {
      btn.className = 'pos-cat-pill px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 shrink-0';
    });
    el.className = 'pos-cat-pill px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-white shadow-sm shrink-0';
    renderPosCatalog();
  };

  window.filterPosMenu = function (query) {
    State.posSearchQuery = query;
    document.getElementById('posBarcodeField').value = query;
    renderPosCatalog();
  };

  window.addToPosCart = function (sku) {
    const prod = State.products.find(p => p.barcode_sku === sku);
    if (!prod) return;

    if (prod.current_stock <= 0) {
      showToast(`⚠️ Stok ${prod.product_name} habis! Silakan lakukan restock.`);
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

  function updatePosCartUI() {
    const list = document.getElementById('posCartTableList');
    const subtotalEl = document.getElementById('posSubtotalText');
    const grandEl = document.getElementById('posGrandTotalText');

    if (State.posCart.length === 0) {
      list.innerHTML = '<div class="text-center py-10 text-xs text-text-muted">Keranjang kosong. Klik produk di sebelah kiri atau scan barcode.</div>';
      subtotalEl.textContent = 'Rp 0';
      grandEl.textContent = 'Rp 0';
      return;
    }

    list.innerHTML = State.posCart.map((i, idx) => `
      <div class="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs border border-slate-100">
        <div class="flex-1 pr-2">
          <div class="font-bold text-slate-800 line-clamp-1">${i.name}</div>
          <div class="text-[11px] text-text-muted font-mono">${formatIDR(i.price)}</div>
        </div>
        <div class="flex items-center gap-1.5">
          <button onclick="window.changePosCartQty(${idx}, -1)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 font-bold hover:bg-slate-100 flex items-center justify-center">-</button>
          <span class="w-6 text-center font-bold font-mono">${i.qty}</span>
          <button onclick="window.changePosCartQty(${idx}, 1)" class="w-6 h-6 rounded-lg bg-white border border-slate-200 font-bold hover:bg-slate-100 flex items-center justify-center">+</button>
          <span class="font-bold font-mono text-primary w-20 text-right">${formatIDR(i.price * i.qty)}</span>
          <button onclick="window.removePosCartItem(${idx})" class="text-red-500 hover:text-red-700 ml-1">✕</button>
        </div>
      </div>
    `).join('');

    const grand = State.posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    subtotalEl.textContent = formatIDR(grand);
    grandEl.textContent = formatIDR(grand);
  }

  window.changePosCartQty = function (idx, delta) {
    if (!State.posCart[idx]) return;
    State.posCart[idx].qty += delta;
    if (State.posCart[idx].qty <= 0) {
      State.posCart.splice(idx, 1);
    }
    updatePosCartUI();
  };

  window.removePosCartItem = function (idx) {
    State.posCart.splice(idx, 1);
    updatePosCartUI();
  };

  window.clearPosCart = function () {
    State.posCart = [];
    updatePosCartUI();
  };

  window.setPayMethod = function (method, el) {
    State.posPayMethod = method;
    document.querySelectorAll('.pos-pay-btn').forEach(btn => {
      btn.className = 'pos-pay-btn p-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex flex-col items-center gap-1';
    });
    el.className = 'pos-pay-btn active p-2 rounded-xl text-xs font-bold border border-primary bg-primary text-white shadow-sm flex flex-col items-center gap-1';
  };

  window.fillExactCash = function () {
    const grand = State.posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    State.posCashTendered = grand;
    showToast(`💵 Uang pas diinput: ${formatIDR(grand)}`);
  };

  window.fillCashAmount = function (amount) {
    State.posCashTendered = amount;
    showToast(`💵 Uang tunai diterima: ${formatIDR(amount)}`);
  };

  window.executeTransactionCheckout = function () {
    if (State.posCart.length === 0) {
      showToast('⚠️ Keranjang belanja masih kosong!');
      return;
    }

    const grand = State.posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const orderNo = 'ORD-' + UtilitiesFormatDate() + '-' + Math.floor(100 + Math.random() * 900);

    // Potong stok produk di State
    State.posCart.forEach(ci => {
      const p = State.products.find(prod => prod.barcode_sku === ci.barcode_sku);
      if (p) {
        p.current_stock = Math.max(0, p.current_stock - ci.qty);
      }
    });

    // Simpan ke riwayat transaksi
    const newOrder = {
      order_id: orderNo,
      timestamp: new Date().toLocaleString('id-ID'),
      customer_name: (document.getElementById('posRetailCustomer') && document.getElementById('posRetailCustomer').value) || 'Pelanggan Kasir',
      customer_phone: (document.getElementById('posRetailPhone') && document.getElementById('posRetailPhone').value) || '',
      vertical: State.currentVertical,
      table_number: (document.getElementById('posTableNumber') && document.getElementById('posTableNumber').value) || '',
      laundry_weight: (document.getElementById('posLaundryWeight') && document.getElementById('posLaundryWeight').value) || '',
      items: JSON.parse(JSON.stringify(State.posCart)),
      total_amount: grand,
      payment_method: State.posPayMethod,
      status: 'COMPLETED',
      status_label: 'Selesai (Lunas)'
    };

    State.orders.unshift(newOrder);

    // Tampilkan Struk Thermal
    showThermalReceipt(newOrder);

    // Reset keranjang
    State.posCart = [];
    updatePosCartUI();
    renderPosCatalog();
    renderInventoryTable();
    renderOrdersQueueTable();

    showToast(`✅ Transaksi ${orderNo} Sukses!`);
  };

  function UtilitiesFormatDate() {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}${mo}${da}`;
  }

  // ============================================================================
  // 6. FITUR DATA PRODUK & STOK (CRUD)
  // ============================================================================
  function renderInventoryTable() {
    const tbody = document.getElementById('inventoryTableBody');
    if (!tbody) return;

    let items = State.products;
    const searchVal = (document.getElementById('inventorySearchField') && document.getElementById('inventorySearchField').value.toLowerCase()) || '';
    const catVal = (document.getElementById('inventoryCategoryFilter') && document.getElementById('inventoryCategoryFilter').value) || 'ALL';

    if (catVal !== 'ALL') {
      items = items.filter(p => p.category.toLowerCase().includes(catVal.toLowerCase()));
    }
    if (searchVal) {
      items = items.filter(p => p.product_name.toLowerCase().includes(searchVal) || p.barcode_sku.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal));
    }

    tbody.innerHTML = items.map(p => `
      <tr class="hover:bg-slate-50 transition-all">
        <td class="p-3.5 font-mono font-bold text-primary">${p.barcode_sku}</td>
        <td class="p-3.5 font-bold text-slate-800">
          <div class="flex items-center gap-2.5">
            <img src="${p.image_url}" class="w-8 h-8 rounded-lg object-cover bg-slate-100" />
            <span>${p.product_name}</span>
          </div>
        </td>
        <td class="p-3.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">${p.category}</span></td>
        <td class="p-3.5 font-mono text-slate-500">${formatIDR(p.cost_price || 0)}</td>
        <td class="p-3.5 font-mono font-black text-slate-900">${formatIDR(p.selling_price)}</td>
        <td class="p-3.5 font-mono font-bold ${p.current_stock <= (p.min_stock_alert || 5) ? 'text-red-600' : 'text-emerald-700'}">
          ${p.current_stock} ${p.unit_measure || 'pcs'}
        </td>
        <td class="p-3.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${p.current_stock <= (p.min_stock_alert || 5) ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
            ${p.current_stock <= (p.min_stock_alert || 5) ? 'Stok Menipis' : 'Stok Aman'}
          </span>
        </td>
        <td class="p-3.5 text-center">
          <div class="flex items-center justify-center gap-1">
            <button onclick="window.adjustStock('${p.barcode_sku}', -1)" title="Kurangi Stok 1" class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold">-</button>
            <button onclick="window.adjustStock('${p.barcode_sku}', 5)" title="Tambah Stok 5" class="px-2 h-6 rounded bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px]">+5</button>
            <button onclick="window.adjustStock('${p.barcode_sku}', 10)" title="Tambah Stok 10" class="px-2 h-6 rounded bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[10px]">+10</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.filterInventoryTable = function () {
    renderInventoryTable();
  };

  window.adjustStock = function (sku, delta) {
    const p = State.products.find(prod => prod.barcode_sku === sku);
    if (!p) return;
    p.current_stock = Math.max(0, p.current_stock + delta);
    renderInventoryTable();
    renderPosCatalog();
    showToast(`📦 Stok ${p.product_name} disesuaikan menjadi: ${p.current_stock}`);
  };

  window.openAddProductModal = function () {
    document.getElementById('addProductModal').classList.add('open');
  };

  window.saveNewProduct = function (e) {
    e.preventDefault();
    const name = document.getElementById('newProdName').value.trim();
    const sku = document.getElementById('newProdSku').value.trim().toUpperCase();
    const category = document.getElementById('newProdCategory').value;
    const cost = Number(document.getElementById('newProdCost').value) || 0;
    const price = Number(document.getElementById('newProdPrice').value) || 0;
    const stock = Number(document.getElementById('newProdStock').value) || 0;
    const unit = document.getElementById('newProdUnit').value.trim() || 'pcs';

    // Cek duplikat SKU
    if (State.products.some(p => p.barcode_sku === sku)) {
      showToast('⚠️ SKU / Barcode sudah digunakan oleh produk lain!');
      return;
    }

    const newProd = {
      product_id: 'P' + Date.now().toString().slice(-4),
      barcode_sku: sku,
      product_name: name,
      category: category,
      cost_price: cost,
      selling_price: price,
      current_stock: stock,
      min_stock_alert: 5,
      unit_measure: unit,
      vertical: category === 'Makanan' || category === 'Minuman' ? 'RESTO' : category === 'Laundry' ? 'LAUNDRY' : 'RETAIL',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
      description: 'Produk baru ditambahkan ke master.'
    };

    State.products.unshift(newProd);

    document.getElementById('addProductForm').reset();
    document.getElementById('addProductModal').classList.remove('open');

    renderInventoryTable();
    renderPosCatalog();
    showToast(`✅ Produk ${name} berhasil ditambahkan ke database!`);
  };

  // ============================================================================
  // 7. ANTREAN & PELACAKAN STATUS PESANAN (ORDER TRACKER)
  // ============================================================================
  function renderOrdersQueueTable() {
    const tbody = document.getElementById('ordersQueueTableBody');
    if (!tbody) return;

    if (State.orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-10 text-text-muted">Belum ada antrean pesanan masuk.</td></tr>';
      return;
    }

    tbody.innerHTML = State.orders.map(o => `
      <tr class="hover:bg-slate-50 transition-all">
        <td class="p-3.5 font-mono font-bold text-primary">
          <div>${o.order_id}</div>
          <div class="text-[10px] text-text-muted font-sans">${o.timestamp}</div>
        </td>
        <td class="p-3.5">
          <div class="font-bold text-slate-800">${o.customer_name}</div>
          <div class="text-[10px] text-text-muted font-mono">${o.customer_phone || '-'}</div>
        </td>
        <td class="p-3.5 font-semibold text-slate-700">
          ${o.table_number ? `🍽️ ${o.table_number}` : o.laundry_weight ? `🧺 ${o.laundry_weight}` : 'Direct Kasir'}
        </td>
        <td class="p-3.5">
          <div class="space-y-0.5">
            ${o.items.map(it => `<div class="text-[11px]">• ${it.name} <span class="font-bold text-slate-700">(x${it.qty})</span></div>`).join('')}
          </div>
        </td>
        <td class="p-3.5 font-mono font-black text-slate-900">${formatIDR(o.total_amount)}</td>
        <td class="p-3.5">
          <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${getOrderStatusBadgeClass(o.status)}">
            ${o.status_label || o.status}
          </span>
        </td>
        <td class="p-3.5 text-center">
          <select onchange="window.updateOrderStatus('${o.order_id}', this.value)" class="text-[11px] font-bold rounded-lg border-slate-200 p-1 bg-white">
            <option value="COOKING" ${o.status === 'COOKING' || o.status === 'WASHING' ? 'selected' : ''}>Sedang Diproses</option>
            <option value="READY" ${o.status === 'READY' ? 'selected' : ''}>Siap Saji / Ambil</option>
            <option value="COMPLETED" ${o.status === 'COMPLETED' ? 'selected' : ''}>Selesai (Lunas)</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  function getOrderStatusBadgeClass(st) {
    if (st === 'READY') return 'bg-amber-100 text-amber-800 border border-amber-300';
    if (st === 'COMPLETED') return 'bg-emerald-100 text-emerald-800';
    return 'bg-blue-100 text-blue-800';
  }

  window.updateOrderStatus = function (orderId, newStatus) {
    const ord = State.orders.find(o => o.order_id === orderId);
    if (!ord) return;

    ord.status = newStatus;
    if (newStatus === 'COOKING') ord.status_label = State.currentVertical === 'LAUNDRY' ? 'Sedang Dicuci' : 'Sedang Dimasak Dapur';
    if (newStatus === 'READY') ord.status_label = State.currentVertical === 'LAUNDRY' ? 'Siap Diambil' : 'Siap Diantar ke Meja';
    if (newStatus === 'COMPLETED') ord.status_label = 'Selesai (Lunas)';

    renderOrdersQueueTable();
    showToast(`📋 Status pesanan ${orderId} diperbarui: ${ord.status_label}`);
  };

  window.searchAndTrackOrder = function () {
    const input = document.getElementById('trackOrderSearchInput');
    const query = input.value.trim().toLowerCase();
    const box = document.getElementById('liveTrackerDisplayBox');

    if (!query) {
      showToast('⚠️ Masukkan No. Order atau No. WhatsApp.');
      return;
    }

    const match = State.orders.find(o => o.order_id.toLowerCase().includes(query) || (o.customer_phone && o.customer_phone.includes(query)));

    if (!match) {
      box.classList.remove('hidden');
      box.innerHTML = `<div class="text-center py-4 text-xs text-red-600 font-bold">Pesanan tidak ditemukan. Pastikan nomor order atau nomor HP sudah benar.</div>`;
      return;
    }

    const step1Active = true;
    const step2Active = match.status === 'COOKING' || match.status === 'WASHING' || match.status === 'READY' || match.status === 'COMPLETED';
    const step3Active = match.status === 'READY' || match.status === 'COMPLETED';
    const step4Active = match.status === 'COMPLETED';

    box.classList.remove('hidden');
    box.innerHTML = `
      <div class="flex justify-between items-center pb-3 border-b border-gold-soft/40 mb-4">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-secondary">Pelacakan Realtime</span>
          <h4 class="font-black text-sm text-primary">${match.order_id} • ${match.customer_name}</h4>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-black ${getOrderStatusBadgeClass(match.status)}">
          ${match.status_label}
        </span>
      </div>

      <!-- Tracking Timeline Steps -->
      <div class="grid grid-cols-4 gap-2 text-center text-xs">
        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full ${step1Active ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-bold mb-1 shadow-sm">1</div>
          <span class="font-bold text-[11px] text-slate-800">Diterima</span>
          <span class="text-[9px] text-text-muted">Masuk Sistem</span>
        </div>

        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full ${step2Active ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-bold mb-1 shadow-sm">2</div>
          <span class="font-bold text-[11px] text-slate-800">Diproses</span>
          <span class="text-[9px] text-text-muted">${match.vertical === 'LAUNDRY' ? 'Cuci / Setrika' : 'Dimasak Dapur'}</span>
        </div>

        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full ${step3Active ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-bold mb-1 shadow-sm">3</div>
          <span class="font-bold text-[11px] text-slate-800">Siap</span>
          <span class="text-[9px] text-text-muted">${match.vertical === 'LAUNDRY' ? 'Siap Ambil' : 'Antar ke Meja'}</span>
        </div>

        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full ${step4Active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center font-bold mb-1 shadow-sm">4</div>
          <span class="font-bold text-[11px] text-slate-800">Selesai</span>
          <span class="text-[9px] text-text-muted">Lunas</span>
        </div>
      </div>
    `;
  };

  // ============================================================================
  // 8. CETAK STRUK THERMAL 58MM
  // ============================================================================
  function showThermalReceipt(orderData) {
    const modal = document.getElementById('thermalReceiptModal');
    const content = document.getElementById('thermalReceiptPaper');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="receipt-header">
        <div style="font-weight:bold; font-size:14px;">${State.settings.STORE_NAME || 'RASH MITRA'}</div>
        <div style="font-size:10px;">${State.settings.STORE_ADDRESS || 'Operasional UMKM'}</div>
        <div style="font-size:10px; margin-top:4px;">No: ${orderData.order_id}</div>
        <div style="font-size:10px;">${orderData.timestamp}</div>
      </div>

      ${orderData.table_number ? `<div style="font-weight:bold;">MEJA: ${orderData.table_number}</div>` : ''}
      ${orderData.laundry_weight ? `<div style="font-weight:bold;">BERAT: ${orderData.laundry_weight} Kg</div>` : ''}
      <div class="receipt-divider"></div>

      ${orderData.items.map(i => `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>${i.name} (x${i.qty})</span>
          <span>${formatIDR(i.price * i.qty)}</span>
        </div>
      `).join('')}

      <div class="receipt-divider"></div>
      <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:13px;">
        <span>TOTAL</span>
        <span>${formatIDR(orderData.total_amount)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
        <span>PEMBAYARAN</span>
        <span>${orderData.payment_method}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px;">
        <span>STATUS</span>
        <span>LUNAS (PAID)</span>
      </div>

      <div class="receipt-divider"></div>
      <div style="text-align:center; font-size:10px; margin-top:8px;">
        <div>${State.settings.THERMAL_FOOTER || 'Barang yang dibeli tidak dapat ditukar.'}</div>
        <div style="margin-top:6px; font-weight:bold; color:#003b4b;">--- STRUK RESMI RASH MITRA ---</div>
      </div>
    `;

    modal.classList.add('open');
  }

  window.printReceipt = function () {
    window.print();
  };

  // ============================================================================
  // 9. SUPER ADMIN & MASTER SETTINGS
  // ============================================================================
  window.saveMasterSettings = function () {
    const store = document.getElementById('cfgStoreName').value.trim();
    const qris = document.getElementById('cfgQrisId').value.trim();
    const footer = document.getElementById('cfgThermalFooter').value.trim();

    State.settings.STORE_NAME = store;
    State.settings.QRIS_MERCHANT_ID = qris;
    State.settings.THERMAL_FOOTER = footer;

    document.getElementById('appStoreName').textContent = store;
    showToast('💾 Master Settings berhasil disimpan!');
  };

  // Setup Event Listeners Umum
  function setupEventListeners() {
    // Barcode scanner trigger Enter
    const barcodeInput = document.getElementById('posBarcodeField');
    if (barcodeInput) {
      barcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const val = e.target.value.trim().toLowerCase();
          const match = State.products.find(p => p.barcode_sku.toLowerCase() === val || p.product_name.toLowerCase().includes(val));
          if (match) {
            window.addToPosCart(match.barcode_sku);
            e.target.value = '';
            showToast(`⚡ Barcode discan: ${match.product_name}`);
          } else {
            showToast('⚠️ Produk dengan SKU tersebut tidak ditemukan.');
          }
        }
      });
      barcodeInput.addEventListener('input', (e) => {
        window.filterPosMenu(e.target.value);
      });
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
      });
    });
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });
  }

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', initApp);
})();
