/**
 * ============================================================================
 * RASH MITRA — APP CONTROLLER & INTERACTIVE SIMULATOR ENGINE
 * Multi-Vertical: Retail | Restoran | Laundry
 * Roles: Pengunjung (Self-Order) | Kasir (Gated POS) | Owner (Dashboard)
 * ============================================================================
 */

(function () {
  'use strict';

  // State Management
  const State = {
    currentVertical: 'RESTO', // RESTO | RETAIL | LAUNDRY
    currentRole: 'customer',   // customer | staff | owner
    products: [],
    settings: {},
    cart: [],
    posCart: [],
    staffClockedIn: false,
    selectedCategory: 'ALL',
    posSearchQuery: '',
    posPayMethod: 'CASH'
  };

  // Toast Notification
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

  // Format Rupiah
  function formatIDR(num) {
    return 'Rp ' + Number(num || 0).toLocaleString('id-ID');
  }

  // ============================================================================
  // 1. INISIALISASI & LOAD DATA
  // ============================================================================
  async function initApp() {
    // Load Settings & Products via Turbo ApiClient
    const [settings, products] = await Promise.all([
      window.ApiClient.fetchData('getSettings'),
      window.ApiClient.fetchData('getProducts')
    ]);

    State.settings = settings || window.APP_CONFIG.MOCK_SETTINGS;
    State.products = products || window.APP_CONFIG.MOCK_PRODUCTS;
    State.currentVertical = State.settings.BUSINESS_VERTICAL || 'RESTO';

    setupVerticalSwitcher();
    setupRoleSwitcher();
    renderCustomerCatalog();
    renderPosCatalog();
    renderOwnerDashboard();
    setupLeadForm();
    setupModalEvents();

    console.info('🚀 [RASH Mitra] Engine aktif. Mode vertikal:', State.currentVertical);
  }

  // ============================================================================
  // 2. MULTI-VERTICAL CONTROLLER (RETAIL / RESTO / LAUNDRY)
  // ============================================================================
  function setupVerticalSwitcher() {
    const tabs = document.querySelectorAll('.vert-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        State.currentVertical = tab.dataset.vertical;

        // Reset Cart & Render View Baru
        State.cart = [];
        State.posCart = [];
        updateFloatingCart();
        updatePosCartSummary();
        renderCustomerCatalog();
        renderPosCatalog();
        renderOwnerDashboard();

        const indicator = document.getElementById('simulatorModeIndicator');
        if (indicator) {
          indicator.textContent = 'Mode: ' + (State.currentVertical === 'RESTO' ? 'Restoran / Kafe' : State.currentVertical === 'RETAIL' ? 'Retail / Warung' : 'Laundry & Jasa');
        }

        showToast('🔄 Berpindah ke Mode: ' + tab.innerText.trim());
      });
    });
  }

  // Filter Produk Sesuai Vertikal Aktif
  function getFilteredProducts() {
    return State.products.filter(p => {
      if (State.currentVertical === 'RESTO') {
        return p.vertical === 'RESTO' || p.category === 'Makanan' || p.category === 'Minuman';
      }
      if (State.currentVertical === 'RETAIL') {
        return p.vertical === 'RETAIL' || p.category === 'Sembako' || p.category === 'Retail';
      }
      if (State.currentVertical === 'LAUNDRY') {
        return p.vertical === 'LAUNDRY' || p.category.includes('Laundry');
      }
      return true;
    });
  }

  // ============================================================================
  // 3. ROLE SWITCHER (PENGUNJUNG / STAF KASIR / OWNER)
  // ============================================================================
  function setupRoleSwitcher() {
    const roleBtns = document.querySelectorAll('.role-tab-btn');
    const customerView = document.getElementById('viewCustomer');
    const staffView = document.getElementById('viewStaff');
    const ownerView = document.getElementById('viewOwner');

    roleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        State.currentRole = btn.dataset.role;

        customerView.style.display = 'none';
        staffView.style.display = 'none';
        ownerView.style.display = 'none';

        if (State.currentRole === 'customer') {
          customerView.style.display = 'block';
          renderCustomerCatalog();
        } else if (State.currentRole === 'staff') {
          staffView.style.display = 'block';
          checkStaffGatedStatus();
          renderPosCatalog();
        } else if (State.currentRole === 'owner') {
          ownerView.style.display = 'block';
          renderOwnerDashboard();
        }
      });
    });
  }

  // ============================================================================
  // 4. PORTAL PENGUNJUNG: KATALOG & SELF-ORDER (W-01 & W-02)
  // ============================================================================
  function renderCustomerCatalog() {
    const container = document.getElementById('customerProductsGrid');
    if (!container) return;

    const filtered = getFilteredProducts();
    if (filtered.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Belum ada produk untuk vertikal ini.</div>';
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div class="product-card">
        <div class="product-thumb-container">
          <img src="${p.image_url}" alt="${p.product_name}" loading="lazy" />
          <span class="product-badge-cat">${p.category}</span>
        </div>
        <div class="product-details">
          <h5>${p.product_name}</h5>
          <p class="product-meta-desc">${p.description || 'Kualitas terjamin untuk mitra UMKM.'}</p>
          <div class="product-bottom-row">
            <span class="product-price">${formatIDR(p.selling_price)}</span>
            <button class="btn-add-cart" onclick="window.addToCustomerCart('${p.barcode_sku}')">
              + Tambah
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.addToCustomerCart = function (sku) {
    const prod = State.products.find(p => p.barcode_sku === sku);
    if (!prod) return;

    const existing = State.cart.find(i => i.barcode_sku === sku);
    if (existing) {
      existing.qty++;
    } else {
      State.cart.push({
        barcode_sku: prod.barcode_sku,
        name: prod.product_name,
        price: prod.selling_price,
        qty: 1,
        notes: ''
      });
    }

    updateFloatingCart();
    showToast(`🛒 Ditambahkan: ${prod.product_name}`);
  };

  function updateFloatingCart() {
    const bar = document.getElementById('floatingCartBar');
    const countEl = document.getElementById('floatingCartCount');
    const totalEl = document.getElementById('floatingCartTotal');
    if (!bar) return;

    const totalItems = State.cart.reduce((sum, i) => sum + i.qty, 0);
    const totalPrice = State.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

    if (totalItems > 0) {
      bar.style.display = 'flex';
      countEl.textContent = `${totalItems} Menu Dipilih`;
      totalEl.textContent = formatIDR(totalPrice);
    } else {
      bar.style.display = 'none';
    }
  }

  // Buka Modal Checkout Self-Order
  window.openCustomerCheckoutModal = function () {
    const modal = document.getElementById('customerCheckoutModal');
    const itemsList = document.getElementById('checkoutItemsList');
    const totalDisplay = document.getElementById('checkoutTotalDisplay');
    const vertFields = document.getElementById('checkoutVerticalFields');

    if (!modal) return;

    // Render Items
    itemsList.innerHTML = State.cart.map((item, idx) => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 0; border-bottom: 1px dashed var(--border-light);">
        <div>
          <div style="font-weight:700; font-size:14px;">${item.name}</div>
          <div style="font-size:12px; color:var(--text-muted);">${formatIDR(item.price)} x ${item.qty}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button style="border:none; background:#f1f5f9; width:26px; height:26px; border-radius:4px; cursor:pointer;" onclick="window.changeCartQty(${idx}, -1)">-</button>
          <span style="font-weight:700; font-size:13px;">${item.qty}</span>
          <button style="border:none; background:#f1f5f9; width:26px; height:26px; border-radius:4px; cursor:pointer;" onclick="window.changeCartQty(${idx}, 1)">+</button>
        </div>
      </div>
    `).join('');

    const grandTotal = State.cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    totalDisplay.textContent = formatIDR(grandTotal);

    // Dynamic Fields Sesuai Mode
    if (State.currentVertical === 'RESTO') {
      vertFields.innerHTML = `
        <div class="form-group">
          <label>Tipe Pesanan & Nomor Meja:</label>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <select id="custOrderType"><option value="Dine-In">Makan di Tempat (Dine-In)</option><option value="Takeaway">Bungkus (Takeaway)</option></select>
            <input type="text" id="custTableNo" placeholder="Nomor Meja (cth: Meja 05)" />
          </div>
        </div>
      `;
    } else if (State.currentVertical === 'LAUNDRY') {
      vertFields.innerHTML = `
        <div class="form-group">
          <label>Estimasi Berat Cucian (Kg):</label>
          <input type="number" id="custLaundryWeight" placeholder="Masukkan perkiraan Kg (cth: 4.5)" value="3" />
        </div>
      `;
    } else {
      vertFields.innerHTML = '';
    }

    modal.classList.add('open');
  };

  window.changeCartQty = function (idx, delta) {
    if (!State.cart[idx]) return;
    State.cart[idx].qty += delta;
    if (State.cart[idx].qty <= 0) {
      State.cart.splice(idx, 1);
    }
    updateFloatingCart();
    if (State.cart.length === 0) {
      document.getElementById('customerCheckoutModal').classList.remove('open');
    } else {
      window.openCustomerCheckoutModal();
    }
  };

  // Submit Order Pengunjung
  window.submitCustomerOrder = async function () {
    const name = document.getElementById('custName').value.trim() || 'Pelanggan Walk-In';
    const phone = document.getElementById('custPhone').value.trim();
    const tableNo = document.getElementById('custTableNo') ? document.getElementById('custTableNo').value : '';
    const laundryWeight = document.getElementById('custLaundryWeight') ? document.getElementById('custLaundryWeight').value : '';

    const payload = {
      customerName: name,
      customerPhone: phone,
      tableNumber: tableNo,
      laundryWeight: laundryWeight,
      paymentMethod: 'DYNAMIC_QRIS',
      items: State.cart
    };

    showToast('⏳ Memproses pesanan mandiri...');
    const res = await window.ApiClient.postData('createPublicOrder', payload);

    document.getElementById('customerCheckoutModal').classList.remove('open');

    // Tampilkan Voucher E-Receipt & QRIS
    window.showReceiptModal({
      orderNumber: res.orderNumber || 'ORD-2026-DEMO',
      customerName: name,
      customerPhone: phone,
      items: State.cart,
      totalAmount: res.totalAmount || 50000,
      tableNumber: tableNo,
      laundryWeight: laundryWeight,
      paymentMethod: 'DYNAMIC_QRIS'
    });

    State.cart = [];
    updateFloatingCart();
  };

  // ============================================================================
  // 5. STASIUN KASIR POS & GATED CLOCK-IN ABSENSI (W-05, W-06, W-07)
  // ============================================================================
  function checkStaffGatedStatus() {
    const lockScreen = document.getElementById('posLockScreen');
    const posStation = document.getElementById('posActualStation');
    if (State.staffClockedIn) {
      lockScreen.style.display = 'none';
      posStation.style.display = 'block';
    } else {
      lockScreen.style.display = 'block';
      posStation.style.display = 'none';
    }
  }

  window.doStaffClockIn = async function () {
    const shift = document.getElementById('clockInShiftSelect').value;
    showToast('⏳ Memverifikasi kehadiran server...');

    const res = await window.ApiClient.postData('clockIn', { shift: shift, status: 'HADIR' });
    State.staffClockedIn = true;
    checkStaffGatedStatus();
    showToast(res.message || 'Clock-in berhasil! Kasir POS terbuka.');
  };

  function renderPosCatalog() {
    const container = document.getElementById('posProductItems');
    if (!container) return;

    const filtered = getFilteredProducts().filter(p => {
      if (!State.posSearchQuery) return true;
      const q = State.posSearchQuery.toLowerCase();
      return p.product_name.toLowerCase().includes(q) || p.barcode_sku.toLowerCase().includes(q);
    });

    container.innerHTML = filtered.map(p => `
      <div style="background:#fff; border:1px solid var(--border-light); border-radius:var(--radius-sm); padding:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="window.addToPosCart('${p.barcode_sku}')">
        <div>
          <div style="font-weight:700; font-size:13px; color:var(--text-main);">${p.product_name}</div>
          <div style="font-size:11px; color:var(--text-muted);">${p.barcode_sku} • Stok: ${p.current_stock}</div>
        </div>
        <div style="font-weight:800; font-size:13px; color:var(--primary);">${formatIDR(p.selling_price)}</div>
      </div>
    `).join('');
  }

  window.addToPosCart = function (sku) {
    const prod = State.products.find(p => p.barcode_sku === sku);
    if (!prod) return;

    const exist = State.posCart.find(i => i.barcode_sku === sku);
    if (exist) {
      exist.qty++;
    } else {
      State.posCart.push({
        barcode_sku: prod.barcode_sku,
        name: prod.product_name,
        price: prod.selling_price,
        qty: 1
      });
    }

    updatePosCartSummary();
  };

  function updatePosCartSummary() {
    const list = document.getElementById('posCartItemList');
    const grandDisplay = document.getElementById('posGrandTotalDisplay');
    if (!list) return;

    list.innerHTML = State.posCart.map((i, idx) => `
      <div class="pos-cart-item-row">
        <div>
          <div style="font-weight:700;">${i.name}</div>
          <div style="color:var(--text-muted); font-size:11px;">${formatIDR(i.price)} x ${i.qty}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:800; color:var(--primary-dark);">${formatIDR(i.price * i.qty)}</span>
          <button style="border:none; background:#fee2e2; color:#b91c1c; border-radius:4px; padding:2px 6px; cursor:pointer;" onclick="window.removePosCartItem(${idx})">✕</button>
        </div>
      </div>
    `).join('');

    const grand = State.posCart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    grandDisplay.textContent = formatIDR(grand);
  }

  window.removePosCartItem = function (idx) {
    State.posCart.splice(idx, 1);
    updatePosCartSummary();
  };

  window.setPosPayMethod = function (method) {
    State.posPayMethod = method;
    document.querySelectorAll('.pay-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.method === method);
    });
  };

  window.executePosCheckout = async function () {
    if (State.posCart.length === 0) {
      showToast('⚠️ Keranjang kasir masih kosong!');
      return;
    }

    const payload = {
      customerName: 'Pelanggan Kasir',
      paymentMethod: State.posPayMethod,
      items: State.posCart
    };

    showToast('⏳ Mencetak struk & menyimpan transaksi...');
    const res = await window.ApiClient.postData('createStaffOrder', payload);

    window.showReceiptModal({
      orderNumber: res.orderNumber || 'ORD-POS-9988',
      customerName: 'Pelanggan POS Kasir',
      items: State.posCart,
      totalAmount: res.totalAmount || 50000,
      paymentMethod: State.posPayMethod
    });

    State.posCart = [];
    updatePosCartSummary();
  };

  window.openCloseShiftModal = function () {
    document.getElementById('closeShiftModal').classList.add('open');
  };

  window.submitCloseShift = async function () {
    const cash = document.getElementById('shiftActualCash').value || 0;
    showToast('⏳ Menutup shift & mengirim ringkasan WA ke Owner...');

    await window.ApiClient.postData('closeShift', {
      actualCash: cash,
      totalSales: 1850000,
      qrisTotal: 920000,
      tfTotal: 400000,
      discrepancy: 0
    });

    State.staffClockedIn = false;
    document.getElementById('closeShiftModal').classList.remove('open');
    checkStaffGatedStatus();
    showToast('✅ Shift berhasil ditutup! Laporan WA terkirim ke Owner.');
  };

  // ============================================================================
  // 6. EXECUTIVE DASHBOARD OWNER (W-08)
  // ============================================================================
  function renderOwnerDashboard() {
    const storeNameEl = document.getElementById('ownerStoreName');
    if (storeNameEl) {
      storeNameEl.textContent = State.settings.STORE_NAME || 'RASH Mitra UMKM Center';
    }
  }

  // ============================================================================
  // 7. STRUK DIGITAL & VIRTUAL THERMAL PRINTER (58MM)
  // ============================================================================
  window.showReceiptModal = function (orderData) {
    const modal = document.getElementById('thermalReceiptModal');
    const content = document.getElementById('thermalReceiptPaper');
    if (!modal || !content) return;

    const now = new Date();
    const timeStr = now.toLocaleDateString('id-ID') + ' ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    content.innerHTML = `
      <div class="receipt-header">
        <div style="font-weight:bold; font-size:14px;">${State.settings.STORE_NAME || 'RASH MITRA'}</div>
        <div style="font-size:10px;">${State.settings.STORE_ADDRESS || 'Solusi Mini ERP UMKM'}</div>
        <div style="font-size:10px; margin-top:4px;">No: ${orderData.orderNumber}</div>
        <div style="font-size:10px;">${timeStr} WIB</div>
      </div>

      ${orderData.tableNumber ? `<div style="font-weight:bold;">MEJA: ${orderData.tableNumber}</div>` : ''}
      ${orderData.laundryWeight ? `<div style="font-weight:bold;">BERAT: ${orderData.laundryWeight} Kg</div>` : ''}
      <div class="receipt-divider"></div>

      ${orderData.items.map(i => `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span>${i.name} (x${i.qty})</span>
          <span>${formatIDR(i.price * i.qty)}</span>
        </div>
      `).join('')}

      <div class="receipt-divider"></div>
      <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:13px;">
        <span>TOTAL BAYAR</span>
        <span>${formatIDR(orderData.totalAmount)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:2px;">
        <span>METODE</span>
        <span>${orderData.paymentMethod}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px;">
        <span>STATUS</span>
        <span>LUNAS (PAID)</span>
      </div>

      <div class="receipt-divider"></div>
      <div style="text-align:center; font-size:10px; margin-top:8px;">
        <div>${State.settings.THERMAL_FOOTER || 'Barang yang dibeli tidak dapat ditukar.'}</div>
        <div style="margin-top:6px; font-weight:bold; color:#0A4D4D;">--- POWERED BY RASH MITRA ---</div>
      </div>
    `;

    modal.classList.add('open');
  };

  window.printReceipt = function () {
    window.print();
  };

  // ============================================================================
  // 8. MODAL HANDLERS & LEAD FORM SUBMISSION
  // ============================================================================
  function setupModalEvents() {
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });

    // Live search barcode di POS
    const barcodeInput = document.getElementById('posBarcodeInput');
    if (barcodeInput) {
      barcodeInput.addEventListener('input', (e) => {
        State.posSearchQuery = e.target.value.trim();
        renderPosCatalog();
      });
      barcodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const filtered = getFilteredProducts();
          const match = filtered.find(p => p.barcode_sku.toLowerCase() === e.target.value.trim().toLowerCase());
          if (match) {
            window.addToPosCart(match.barcode_sku);
            e.target.value = '';
            State.posSearchQuery = '';
            renderPosCatalog();
            showToast(`⚡ Barcode discan: ${match.product_name}`);
          }
        }
      });
    }
  }

  function setupLeadForm() {
    const form = document.getElementById('leadRegistrationForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Mengirim pendaftaran...';

      const payload = {
        name: document.getElementById('leadName').value,
        phone: document.getElementById('leadPhone').value,
        businessName: document.getElementById('leadBusinessName').value,
        businessType: document.getElementById('leadBusinessType').value,
        city: document.getElementById('leadCity').value,
        licensePlan: 'Lifetime License (Sekali Bayar Selamanya)'
      };

      const res = await window.ApiClient.postData('submitLead', payload);

      showToast(res.message || 'Pendaftaran berhasil dikirim!');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  }

  // Jalankan saat DOM siap
  document.addEventListener('DOMContentLoaded', initApp);
})();
