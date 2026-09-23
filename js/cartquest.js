/*
 * Cart Quest – shared game state (no backend needed)
 *
 * Every page loads this file so they can share one "quest":
 *   prompt.html  -> picks a cuisine + dish            (CQ.newQuest)
 *   game.html    -> fills the cart                    (CQ.mutateCart)
 *   CartPage     -> reviews / edits the cart          (CQ.mutateCart)
 *   CreditCard   -> pays and creates the order        (CQ.placeOrder)
 *   delivery     -> shows the order + quest report    (CQ.get().order)
 *
 * State lives in localStorage. Because some browsers give every local
 * file:// page its own private storage, we ALSO mirror it into window.name
 * (which survives navigation inside the same tab) and use whichever copy is
 * newer. Card numbers are never stored – only the last four digits.
 */
(function () {
  var KEY = 'cartquest.v1';
  var STORE = window.CQ_STORE;
  var RECIPES = window.CQ_RECIPES;

  var DELIVERY_FEE = 3.99;
  var POINTS = { perIngredient: 100, perExtraUnit: -10, perfectCart: 100, maxTimeBonus: 300, timeBonusLoss: 2 };

  /* ---------- storage ---------- */

  function fresh() {
    return {
      v: 1, t: 0,
      cuisine: null, dish: null,
      cart: {},                 // { itemId: quantity }
      startedAt: null,          // ms timestamp when the quest began
      completedAt: null,        // ms timestamp when every ingredient was in the cart
      hints: true,              // show aisle hints on the shopping list
      order: null,              // filled in after checkout
      profile: {}               // { name, address }
    };
  }

  function readLocal() {
    try { var raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function readWindowName() {
    try { if (window.name && window.name.indexOf('CQ:') === 0) return JSON.parse(window.name.slice(3)); } catch (e) {}
    return null;
  }

  function get() {
    var a = readLocal(), b = readWindowName();
    var s = a && b ? (b.t > a.t ? b : a) : (a || b);
    return Object.assign(fresh(), s || {});
  }

  function save(s) {
    s.t = Date.now();
    var raw = JSON.stringify(s);
    try { localStorage.setItem(KEY, raw); } catch (e) {}
    try { window.name = 'CQ:' + raw; } catch (e) {}
    return s;
  }

  function update(fn) {
    var s = get();
    fn(s);
    return save(s);
  }

  /* ---------- helpers ---------- */

  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2); }

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec));
    return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- quest ---------- */

  function newQuest(cuisine, dish) {
    return update(function (s) {
      s.cuisine = cuisine;
      s.dish = dish;
      s.cart = {};
      s.startedAt = Date.now();
      s.completedAt = null;
      s.order = null;
    });
  }

  function restartQuest() {
    return update(function (s) {
      s.cart = {};
      s.startedAt = Date.now();
      s.completedAt = null;
    });
  }

  // Wipe the quest but remember the player's name/address and settings.
  function clearQuest() {
    return update(function (s) {
      var keep = { hints: s.hints, profile: s.profile };
      Object.assign(s, fresh(), keep);
    });
  }

  function getDish(s) {
    s = s || get();
    var c = RECIPES[s.cuisine];
    var d = c && c.dishes[s.dish];
    if (!d) return null;
    return { cuisine: s.cuisine, name: s.dish, emoji: d.emoji, note: d.note || '', ingredients: d.ingredients };
  }

  /* ---------- cart ---------- */

  function units(s) {
    s = s || get();
    return Object.keys(s.cart).reduce(function (n, id) { return n + s.cart[id]; }, 0);
  }

  function subtotal(s) {
    s = s || get();
    return Object.keys(s.cart).reduce(function (sum, id) {
      return sum + (STORE.items[id] ? STORE.items[id].price * s.cart[id] : 0);
    }, 0);
  }

  function deliveryFee(s) { return units(s) > 0 ? DELIVERY_FEE : 0; }
  function total(s) { return subtotal(s) + deliveryFee(s); }

  // Which recipe lines are covered by what is in the cart?
  function needs(s) {
    s = s || get();
    var dish = getDish(s);
    if (!dish) return [];
    var used = {};
    return dish.ingredients.map(function (ing) {
      var accepts = [ing.item].concat(ing.alt || []);
      var hit = null;
      for (var i = 0; i < accepts.length; i++) {
        var id = accepts[i];
        if ((s.cart[id] || 0) - (used[id] || 0) > 0) { hit = id; break; }
      }
      if (hit) used[hit] = (used[hit] || 0) + 1;
      return {
        item: ing.item,
        accepts: accepts,
        label: ing.label || STORE.items[ing.item].name,
        quantity: ing.quantity,
        aisles: accepts.map(function (id) { return STORE.items[id].aisle; }),
        foundWith: hit,
        done: !!hit
      };
    });
  }

  function isNeeded(itemId, s) {
    return needs(s).some(function (n) { return n.accepts.indexOf(itemId) !== -1; });
  }

  function progress(s, now) {
    s = s || get();
    var list = needs(s);
    var found = list.filter(function (n) { return n.done; }).length;
    var complete = list.length > 0 && found === list.length;
    var extraUnits = Math.max(0, units(s) - found);
    var elapsed = s.startedAt ? ((s.completedAt || now || Date.now()) - s.startedAt) / 1000 : 0;
    var timeBonus = 0, perfect = false;
    if (complete && s.completedAt) {
      timeBonus = Math.max(0, POINTS.maxTimeBonus - Math.floor(elapsed) * POINTS.timeBonusLoss);
      perfect = extraUnits === 0;
    }
    var points = found * POINTS.perIngredient + extraUnits * POINTS.perExtraUnit +
                 timeBonus + (perfect ? POINTS.perfectCart : 0);
    return {
      found: found, total: list.length, complete: complete,
      extraUnits: extraUnits, elapsed: Math.floor(elapsed),
      timeBonus: timeBonus, perfect: perfect, points: Math.max(0, points)
    };
  }

  // Change the cart, then keep `completedAt` in sync.
  // Returns { state, newlyComplete }.
  function mutateCart(fn) {
    var newlyComplete = false;
    var state = update(function (s) {
      fn(s.cart, s);
      var done = progress(s).complete;
      if (done && !s.completedAt) { s.completedAt = Date.now(); newlyComplete = true; }
      if (!done && s.completedAt) { s.completedAt = null; }
    });
    return { state: state, newlyComplete: newlyComplete };
  }

  function addItem(id, n) {
    return mutateCart(function (cart) { cart[id] = (cart[id] || 0) + (n || 1); });
  }
  function setQty(id, qty) {
    return mutateCart(function (cart) { if (qty > 0) cart[id] = qty; else delete cart[id]; });
  }
  function removeItem(id) { return setQty(id, 0); }
  function emptyCart() { return mutateCart(function (cart) { Object.keys(cart).forEach(function (k) { delete cart[k]; }); }); }

  /* ---------- checkout ---------- */

  function placeOrder(info) {
    var s = get();
    var p = progress(s);
    var dish = getDish(s);
    var items = Object.keys(s.cart).map(function (id) {
      var it = STORE.items[id];
      return { id: id, name: it.name, emoji: it.emoji, qty: s.cart[id], price: it.price };
    });
    var order = {
      id: 'CQ-' + Math.floor(10000 + Math.random() * 89999),
      placedAt: Date.now(),
      name: info.name, address: info.address, method: info.method, last4: info.last4 || '',
      items: items,
      subtotal: subtotal(s), delivery: deliveryFee(s), total: total(s),
      quest: dish ? {
        dish: dish.name, emoji: dish.emoji, cuisine: dish.cuisine,
        found: p.found, needed: p.total, complete: p.complete,
        extraUnits: p.extraUnits, points: p.points, elapsed: p.elapsed
      } : null
    };
    update(function (st) {
      st.order = order;
      st.cart = {};
      st.profile = info.remember ? { name: info.name, address: info.address } : {};
    });
    return order;
  }

  /* ---------- small UI helper: keep cart badges in sync ---------- */
  function paintBadges() {
    var s = get();
    var n = units(s);
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-count]'), function (el) { el.textContent = n; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-total]'), function (el) { el.textContent = money(subtotal(s)); });
  }

  window.CQ = {
    STORE: STORE, RECIPES: RECIPES, POINTS: POINTS, DELIVERY_FEE: DELIVERY_FEE,
    get: get, save: save, update: update,
    money: money, fmtTime: fmtTime, esc: esc,
    newQuest: newQuest, restartQuest: restartQuest, clearQuest: clearQuest, getDish: getDish,
    units: units, subtotal: subtotal, deliveryFee: deliveryFee, total: total,
    needs: needs, isNeeded: isNeeded, progress: progress,
    mutateCart: mutateCart, addItem: addItem, setQty: setQty, removeItem: removeItem, emptyCart: emptyCart,
    placeOrder: placeOrder, paintBadges: paintBadges
  };
})();
