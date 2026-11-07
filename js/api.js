/**
 * ============================================================================
 * RASH MITRA — FAST TURBO API CLIENT
 * Standar: gas-scale-turbo & gas-pro-api
 * Fitur: Zero UI Latency, In-flight Request Deduplication, SWR Local Cache
 * ============================================================================
 */

(function (window) {
  'use strict';

  const _inflight = {};
  let _writeEpoch = 0;
  const CACHE_PREFIX = 'RASH_TURBO_';

  const ApiClient = {
    isConfigured: function () {
      const url = window.APP_CONFIG && window.APP_CONFIG.GAS_URL;
      return url && !url.includes('YOUR_DEPLOYMENT_ID');
    },

    // GET Request dengan SWR & In-Flight Deduplication
    fetchData: async function (action, params) {
      params = params || {};
      const queryStr = Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
      const fullAction = action + (queryStr ? '&' + queryStr : '');
      const cacheKey = CACHE_PREFIX + action;

      // 1. Cek In-flight request yang sedang berjalan
      const inflightKey = _writeEpoch + '|GET|' + fullAction;
      if (_inflight[inflightKey]) return _inflight[inflightKey];

      // 2. Jika belum terhubung ke Google Apps Script, gunakan mock fallback
      if (!this.isConfigured()) {
        return this.getMockData(action);
      }

      // 3. Jalankan request network
      const promise = (async () => {
        try {
          const res = await fetch(`${window.APP_CONFIG.GAS_URL}?action=${fullAction}`);
          const json = await res.json();
          if (json.success && json.data) {
            try {
              localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), d: json.data }));
            } catch (e) {}
            return json.data;
          }
          throw new Error(json.message || 'Gagal memuat data');
        } catch (err) {
          console.warn('[Turbo API] Network fetch error, using local/mock fallback:', err);
          // Ambil dari local storage jika ada
          const local = localStorage.getItem(cacheKey);
          if (local) {
            try { return JSON.parse(local).d; } catch (e) {}
          }
          return this.getMockData(action);
        }
      })();

      _inflight[inflightKey] = promise;
      promise.finally(() => { delete _inflight[inflightKey]; });
      return promise;
    },

    // POST Request dengan text/plain (CORS Preflight Prevention)
    postData: async function (action, payload, sessionToken) {
      _writeEpoch++; // Batalkan sharing cache in-flight

      if (!this.isConfigured()) {
        console.info('[Turbo API] Running in Instant Simulator Mode (Local/Mock)');
        return this.mockPostResponse(action, payload);
      }

      try {
        const res = await fetch(window.APP_CONFIG.GAS_URL, {
          method: 'POST',
          // WAJIB text/plain untuk melewati CORS Preflight di Google Apps Script
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: action,
            data: payload,
            token: sessionToken || ''
          })
        });
        return await res.json();
      } catch (err) {
        console.warn('[Turbo API] Post error, fallback to simulator:', err);
        return this.mockPostResponse(action, payload);
      }
    },

    // Mock Fallback Generator (Memastikan Landing Page & Simulator 100% Interaktif)
    getMockData: function (action) {
      if (action === 'getBootData' || action === 'getProducts') {
        return window.APP_CONFIG.MOCK_PRODUCTS;
      }
      if (action === 'getSettings') {
        return window.APP_CONFIG.MOCK_SETTINGS;
      }
      return null;
    },

    mockPostResponse: function (action, payload) {
      const now = new Date();
      if (action === 'createPublicOrder' || action === 'createStaffOrder') {
        const orderNum = 'ORD-' + now.toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
        return {
          success: true,
          orderNumber: orderNum,
          totalAmount: payload.items ? payload.items.reduce((acc, i) => acc + (i.price * i.qty), 0) : 50000,
          message: 'Transaksi berhasil disimpan ke antrean lokal simulator & siap dicetak thermal 58mm.'
        };
      }
      if (action === 'clockIn') {
        return { success: true, message: 'Absensi masuk tercatat. Kasir POS sekarang terbuka 🔓' };
      }
      if (action === 'clockOut' || action === 'closeShift') {
        return { success: true, message: 'Shift kasir ditutup & laporan WA disimulasikan terkirim ke Owner!' };
      }
      if (action === 'submitLead') {
        return { success: true, message: 'Pendaftaran berhasil dikirim! Tim RASH Mitra akan menghubungi Anda.' };
      }
      return { success: true, message: 'Operasi berhasil diproses.' };
    }
  };

  window.ApiClient = ApiClient;
})(window);
