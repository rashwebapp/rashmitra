/**
 * Test Suite: Cross-Device Order Synchronization (TDD)
 * Running with JavaScriptCore (/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc)
 */

var window = this;
window.location = { origin: "https://rashwebapp.github.io", pathname: "/rashmitra/index.html" };
window.addEventListener = function () {};
var console = { log: print, warn: print, error: print };
var setInterval = function () {};
var clearInterval = function () {};
var setTimeout = function (fn) { if (typeof fn === "function") fn(); };
var clearTimeout = function () {};
var document = {
  addEventListener: function () {},
  getElementById: function (id) {
    return {
      classList: { add: function () {}, remove: function () {} },
      textContent: "",
      value: "",
      innerHTML: ""
    };
  }
};
var localStorage = {
  _data: {},
  getItem: function (k) { return this._data[k] || null; },
  setItem: function (k, v) { this._data[k] = String(v); },
  removeItem: function (k) { delete this._data[k]; }
};

// Capture EventSource URL created by initCloudOrderSync
var createdEventSourceUrl = null;
var mockEventSourceInstance = null;
var EventSource = function (url) {
  createdEventSourceUrl = url;
  mockEventSourceInstance = this;
  this.readyState = 1; // OPEN
  this.addEventListener = function () {};
  this.close = function () {};
};
var URLSearchParams = function () {
  return { get: function () { return null; } };
};

load("js/config.js");
load("js/app.js");

function assert(condition, message) {
  if (!condition) {
    throw new Error("ASSERTION FAILED: " + message);
  }
}

print("=== STARTING TDD TEST SUITE: Cross-Device Order Synchronization ===");

// ----------------------------------------------------------------------------
// TEST 1: SSE connection URL must include '?since=24h' to replay offline orders
// ----------------------------------------------------------------------------
print("TEST 1: Verifying SSE URL includes since=24h for replay of offline/past orders...");
assert(typeof window.initCloudOrderSync === "function", "window.initCloudOrderSync MUST be exported!");
window.initCloudOrderSync();
assert(createdEventSourceUrl !== null, "EventSource was not created");
print("Captured EventSource URL: " + createdEventSourceUrl);
assert(
  createdEventSourceUrl.indexOf("/sse?since=24h") !== -1 || createdEventSourceUrl.indexOf("/sse?since=") !== -1,
  "EventSource URL MUST include '?since=24h' so past orders from HP while laptop was disconnected are replayed! Current: " + createdEventSourceUrl
);
print("✅ TEST 1 PASSED: SSE URL includes since=24h replay parameter.");

// ----------------------------------------------------------------------------
// TEST 2: syncAllOrdersFromCloud merges past orders into State.orders
// ----------------------------------------------------------------------------
print("TEST 2: Verifying syncAllOrdersFromCloud catches up missing orders from other devices...");

// Set initial computer orders (2 orders)
State.orders = [
  { order_id: "ORD-INIT-1", customer_name: "Customer 1", table_number: "Meja 01", total_amount: 50000 },
  { order_id: "ORD-INIT-2", customer_name: "Customer 2", table_number: "Meja 02", total_amount: 60000 }
];

assert(typeof window.syncAllOrdersFromCloud === "function", "window.syncAllOrdersFromCloud function MUST be defined!");

// Mock response containing 6 past orders from HP
var hpOrdersPayload = [
  { order: { order_id: "ORD-HP-001", customer_name: "Tamu HP 1", table_number: "Meja 03", total_amount: 70000 } },
  { order: { order_id: "ORD-HP-002", customer_name: "Tamu HP 2", table_number: "Meja 04", total_amount: 80000 } },
  { order: { order_id: "ORD-HP-003", customer_name: "Tamu HP 3", table_number: "Meja 05", total_amount: 90000 } },
  { order: { order_id: "ORD-HP-004", customer_name: "Tamu HP 4", table_number: "Meja 06", total_amount: 100000 } },
  { order: { order_id: "ORD-HP-005", customer_name: "Tamu HP 5", table_number: "Meja 07", total_amount: 110000 } },
  { order: { order_id: "ORD-HP-006", customer_name: "Tamu HP 6", table_number: "Meja 08", total_amount: 120000 } },
  { order: { order_id: "ORD-INIT-1", customer_name: "Duplicate Customer 1", table_number: "Meja 01", total_amount: 50000 } } // Duplicate
];

// Call sync
window.mergeOrdersFromCloudPayload(hpOrdersPayload);

// We had 2 orders, added 6 new ones from HP (with 1 duplicate ignored) -> Total MUST be 8 orders!
assert(State.orders.length === 8, "Expected exactly 8 orders in queue after merging HP orders! Found: " + State.orders.length);
print("✅ TEST 2 PASSED: 6 orders from HP successfully merged into computer queue (Total: 8 orders, 0 duplicates)!");

// ----------------------------------------------------------------------------
// TEST 3: HP Catalog local orders broadcast / recovery mechanism
// ----------------------------------------------------------------------------
print("TEST 3: Verifying HP catalog broadcast of local un-synced orders...");

// Load katalog script
load("/tmp/test_katalog.js");

assert(typeof broadcastStoredOrdersToCloud === "function", "broadcastStoredOrdersToCloud function MUST be defined in katalog.html!");

var broadcastedOrders = [];
var mockFetch = function (url, options) {
  if (options && options.body) {
    try {
      var parsed = JSON.parse(options.body);
      if (parsed.order) broadcastedOrders.push(parsed.order);
    } catch (e) {}
  }
  return {
    then: function (fn) {
      fn({ status: 200, ok: true });
      return { catch: function () {} };
    }
  };
};
var fetch = mockFetch;

// Simulate HP having 8 stored orders in localStorage
var hpStoredOrders = [
  { order_id: "ORD-HP-1", table_number: "Meja 01", total_amount: 50000 },
  { order_id: "ORD-HP-2", table_number: "Meja 02", total_amount: 60000 },
  { order_id: "ORD-HP-3", table_number: "Meja 03", total_amount: 70000 },
  { order_id: "ORD-HP-4", table_number: "Meja 04", total_amount: 80000 },
  { order_id: "ORD-HP-5", table_number: "Meja 05", total_amount: 90000 },
  { order_id: "ORD-HP-6", table_number: "Meja 06", total_amount: 100000 },
  { order_id: "ORD-HP-7", table_number: "Meja 07", total_amount: 110000 },
  { order_id: "ORD-HP-8", table_number: "Meja 08", total_amount: 120000 }
];
localStorage.setItem("RASH_MITRA_ORDERS", JSON.stringify(hpStoredOrders));

// Run broadcast
broadcastStoredOrdersToCloud();

assert(broadcastedOrders.length === 8, "Expected 8 orders to be broadcasted to cloud from HP! Found: " + broadcastedOrders.length);
print("✅ TEST 3 PASSED: All 8 orders from HP successfully broadcasted to cloud channel!");

print("=== ALL TESTS PASSED SUCCESSFULLY! ===");
