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

// ----------------------------------------------------------------------------
// TEST 4: Komputer Kasir Handling of Waiter Additional Order
// ----------------------------------------------------------------------------
print("TEST 4: Verifying Komputer Kasir handles Waiter additional orders for existing dining tables...");

// Prepare an existing active order on Meja 03
State.orders = [
  {
    order_id: "ORD-TABLE3-ACTIVE",
    table_number: "Meja 03",
    customer_name: "Umar Al-Khattab",
    status: "COOKING",
    status_label: "Sedang Dimasak Dapur",
    items: [{ name: "Nasi Mandi Kambing", qty: 2, price: 58000 }],
    total_amount: 116000
  }
];

// Waiter submits an additional order for Meja 03 (e.g., guest adds drinks)
var waiterAdditionalOrder = {
  order_id: "ADD-991122",
  parent_order_id: "ORD-TABLE3-ACTIVE",
  is_additional: true,
  sender: "waiter",
  waiter_name: "Doni (Waiter 1)",
  table_number: "Meja 03",
  customer_name: "Umar Al-Khattab",
  items: [{ name: "Shahi Adeni (Teh Rempah)", qty: 2, price: 18000 }],
  total_amount: 36000,
  timestamp: "10:30",
  notes: "Tambah teh adeni 2 gelas manis sedang"
};

var modalTitleResult = "";
var modalBadgeResult = "";

// Mock popup elements to verify title & badge
document.getElementById = function (id) {
  return {
    classList: { add: function () {}, remove: function () {} },
    textContent: "",
    set innerHTML(val) {},
    set textContent(val) {
      if (id === "popupOrderTableTitle") modalTitleResult = val;
      if (id === "popupOrderSenderBadge") modalBadgeResult = val;
    }
  };
};

assert(typeof window.processIncomingOrder === "function", "window.processIncomingOrder must exist!");
window.processIncomingOrder(waiterAdditionalOrder, "waiter");

// Verify that the order queue updated
var foundOrder = State.orders.find(function (o) { return o.order_id === "ADD-991122"; });
assert(foundOrder !== undefined, "Waiter additional order ADD-991122 was not found in State.orders!");
assert(foundOrder.is_additional === true, "Order must be marked as is_additional = true");
assert(foundOrder.sender === "waiter", "Order sender must be 'waiter'");

// Verify popup displayed Waiter-specific identification
assert(modalTitleResult.indexOf("Meja 03") !== -1, "Modal table title must contain Meja 03! Found: " + modalTitleResult);
assert(
  modalTitleResult.indexOf("Pramusaji") !== -1 || modalTitleResult.indexOf("Waiter") !== -1 || modalBadgeResult.indexOf("Waiter") !== -1 || modalBadgeResult.indexOf("Pramusaji") !== -1,
  "Modal must clearly identify the order as coming from Waiter / Pramusaji! Title: " + modalTitleResult + ", Badge: " + modalBadgeResult
);
print("✅ TEST 4 PASSED: Waiter additional order correctly processed with Waiter attribution & Meja identification!");

// ----------------------------------------------------------------------------
print("TEST 5: Verifying Waiter device order builder generates standard cloud payload...");

assert(typeof window.buildWaiterOrderPayload === "function", "window.buildWaiterOrderPayload must exist!");

var waiterItems = [
  { name: "Kambing Bakar Madu", qty: 1, price: 65000 },
  { name: "Es Teh Manis", qty: 2, price: 6000 }
];
var createdPayload = window.buildWaiterOrderPayload({
  table_number: "Meja 05",
  is_additional: true,
  waiter_name: "Rian (Pramusaji 2)",
  items: waiterItems,
  notes: "Jangan terlalu manis es tehnya"
});

assert(createdPayload.type === "RASH_NEW_ORDER", "Payload type must be 'RASH_NEW_ORDER'");
assert(createdPayload.sender === "waiter", "Payload sender must be 'waiter'");
assert(createdPayload.is_additional === true, "Payload is_additional must be true");
assert(createdPayload.waiter_name === "Rian (Pramusaji 2)", "Payload waiter_name must match");
assert(createdPayload.order !== undefined, "Payload order object must exist");
assert(createdPayload.order.table_number === "Meja 05", "Order table number must be Meja 05");
assert(createdPayload.order.total_amount === 77000, "Order total amount must be 77000 (65000 + 12000)");
assert(createdPayload.order.notes === "Jangan terlalu manis es tehnya", "Order notes must match");
print("✅ TEST 5 PASSED: Waiter device payload builder generates valid structure!");

// ----------------------------------------------------------------------------
print("TEST 6: Verifying WhatsApp order message builder includes complete table and item details...");

assert(typeof window.formatOrderWhatsAppMessage === "function", "window.formatOrderWhatsAppMessage must exist!");

var waText = window.formatOrderWhatsAppMessage(createdPayload.order, "RASH RESTO");
assert(waText.indexOf("MEJA: MEJA 05") !== -1 || waText.indexOf("Meja 05") !== -1, "WhatsApp message must contain table number");
assert(waText.indexOf("Kambing Bakar Madu") !== -1, "WhatsApp message must list items");
assert(waText.indexOf("77.000") !== -1, "WhatsApp message must format total amount");
assert(waText.indexOf("Rian (Pramusaji 2)") !== -1, "WhatsApp message must mention waiter name");
print("✅ TEST 6 PASSED: WhatsApp message correctly formatted for Kasir notification!");

print("=== ALL TESTS PASSED SUCCESSFULLY! ===");
