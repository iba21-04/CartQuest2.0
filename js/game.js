/*
 * Cart Quest – the shopping game
 *
 * Flow: store map -> open an aisle -> drag products into the cart.
 * Mouse/pen: press and drag a product onto the cart (button in the top bar
 * or the cart panel). Any pointer: a simple click/tap also adds the item.
 * Keyboard: Tab to a product and press Enter/Space.
 */
(function () {
  'use strict';

  var STORE = CQ.STORE;
  var $ = function (id) { return document.getElementById(id); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- start-up ---------- */

  var state = CQ.get();
  var dish = CQ.getDish(state);
  if (!dish) { window.location.replace('prompt.html'); return; }   // no dish picked yet
  if (!state.startedAt) state = CQ.update(function (s) { s.startedAt = Date.now(); });

  var currentAisle = null;
  var aisleNums = Object.keys(STORE.aisles).map(Number);

  $('dishEmoji').textContent = dish.emoji;
  $('dishName').textContent = dish.name;
  $('cuisineName').textContent = dish.cuisine + ' cuisine';
  if (dish.note) { $('dishNote').textContent = dish.note; $('dishNote').hidden = false; }
  $('hintsToggle').checked = !!state.hints;

  /* ---------- store map ---------- */

  $('mapCols').innerHTML = aisleNums.map(function (n) {
    return '<button type="button" data-aisle="' + n + '" aria-label="Aisle ' + n + ': ' + CQ.esc(STORE.aisles[n].name) + '">' +
           '<span>' + CQ.esc(STORE.aisles[n].name) + '</span></button>';
  }).join('');

  $('aisleChips').innerHTML = aisleNums.map(function (n) {
    return '<button type="button" class="chip" data-aisle="' + n + '"><b>' + n + '</b>' + CQ.esc(STORE.aisles[n].name) + '</button>';
  }).join('');

  function showMap() {
    currentAisle = null;
    $('mapView').hidden = false;
    $('aisleView').hidden = true;
    $('prevAisle').hidden = $('nextAisle').hidden = $('backToMap').hidden = true;
    $('storeTitle').textContent = 'Store map';
    $('storeSub').textContent = 'Pick an aisle to start shopping.';
    window.scrollTo({ top: 0 });
  }

  function showAisle(n) {
    currentAisle = n;
    var aisle = STORE.aisles[n];
    var crop = STORE.crop, W = STORE.imageSize.w, H = crop.bottom - crop.top;

    var html = '<img src="../images/aisle-' + n + '.png" alt="Shelves in ' + CQ.esc(aisle.name) + '" draggable="false">' +
               '<div class="sign">Aisle ' + n + ': ' + CQ.esc(aisle.name) + '</div>';

    Object.keys(STORE.items).forEach(function (id) {
      var it = STORE.items[id];
      if (it.aisle !== n) return;
      var r = it.rect;
      var style = 'left:' + (r.x / W * 100) + '%;top:' + ((r.y - crop.top) / H * 100) + '%;' +
                  'width:' + (r.w / W * 100) + '%;height:' + (r.h / H * 100) + '%';
      html += '<button type="button" class="hotspot" data-item="' + id + '" style="' + style + '" ' +
              'aria-label="Add ' + CQ.esc(it.name) + ', ' + CQ.money(it.price) + ', to cart">' +
              '<span class="tag">' + it.emoji + ' ' + CQ.esc(it.name) + ' &middot; ' + CQ.money(it.price) + '</span></button>';
    });
    $('stage').innerHTML = html;

    $('mapView').hidden = true;
    $('aisleView').hidden = false;
    $('prevAisle').hidden = $('nextAisle').hidden = $('backToMap').hidden = false;
    $('storeTitle').textContent = 'Aisle ' + n + ': ' + aisle.name;
    $('storeSub').textContent = 'Drag what you need into your cart.';
  }

  function stepAisle(dir) {
    var i = aisleNums.indexOf(currentAisle);
    showAisle(aisleNums[(i + dir + aisleNums.length) % aisleNums.length]);
  }

  document.addEventListener('click', function (e) {
    var go = e.target.closest('[data-aisle]');
    if (go) showAisle(Number(go.dataset.aisle));
  });
  $('backToMap').addEventListener('click', showMap);
  $('prevAisle').addEventListener('click', function () { stepAisle(-1); });
  $('nextAisle').addEventListener('click', function () { stepAisle(1); });

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || $('doneDialog').open) return;
    if (e.key >= '1' && e.key <= '6') showAisle(Number(e.key));
    else if (e.key === 'm' || e.key === 'M') showMap();
  });

  /* ---------- side panels ---------- */

  function renderList() {
    var list = CQ.needs(state), p = CQ.progress(state);
    $('listCount').textContent = p.found + ' / ' + p.total;
    $('listBar').style.width = (p.total ? p.found / p.total * 100 : 0) + '%';

    $('needsList').innerHTML = list.map(function (n) {
      var seen = {};
      var wheres = state.hints ? n.aisles.filter(function (a) { return seen[a] ? false : (seen[a] = true); }).map(function (a) {
        return '<button type="button" class="where" data-aisle="' + a + '">Aisle ' + a + ': ' + CQ.esc(STORE.aisles[a].name) + '</button>';
      }).join('') : '';
      return '<li class="need' + (n.done ? ' done' : '') + '">' +
             '<span class="check" aria-hidden="true">&#10003;</span>' +
             '<span class="what"><b>' + CQ.esc(n.label) + '</b><small>' + CQ.esc(n.quantity) + (n.done ? ' &middot; in your cart' : '') + '</small>' +
             (wheres ? '<span class="wheres">' + wheres + '</span>' : '') + '</span></li>';
    }).join('');
  }

  function renderCart() {
    var ids = Object.keys(state.cart);
    var units = CQ.units(state);
    $('cartUnits').textContent = units + (units === 1 ? ' item' : ' items');

    $('cartBody').innerHTML = ids.length
      ? '<ul class="cart-list">' + ids.map(function (id) {
          var it = STORE.items[id], q = state.cart[id];
          return '<li><span class="e">' + it.emoji + '</span>' +
                 '<span class="n">' + CQ.esc(it.name) + (CQ.isNeeded(id, state) ? '' : '<em>extra</em>') +
                 '<small>' + CQ.money(it.price) + ' each</small></span>' +
                 '<span class="qty"><button type="button" data-act="dec" data-item="' + id + '" aria-label="One less ' + CQ.esc(it.name) + '">&minus;</button>' +
                 '<b>' + q + '</b>' +
                 '<button type="button" data-act="inc" data-item="' + id + '" aria-label="One more ' + CQ.esc(it.name) + '">+</button></span>' +
                 '<button type="button" class="rm" data-act="rm" data-item="' + id + '" aria-label="Remove ' + CQ.esc(it.name) + '">&#10005;</button></li>';
        }).join('') + '</ul>'
      : '<div class="cart-empty"><span>🛒</span>Your cart is empty. Drag items here.</div>';

    CQ.paintBadges();
  }

  function tick() {
    var p = CQ.progress(state);
    $('timer').textContent = CQ.fmtTime(p.elapsed);
    $('score').textContent = p.points;
  }

  function refresh() { renderList(); renderCart(); tick(); }

  $('cartBody').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]');
    if (!b) return;
    var id = b.dataset.item, q = state.cart[id] || 0, r;
    if (b.dataset.act === 'inc') r = CQ.setQty(id, q + 1);
    else if (b.dataset.act === 'dec') r = CQ.setQty(id, q - 1);
    else r = CQ.removeItem(id);
    state = r.state; refresh();
    if (r.newlyComplete) celebrate();
  });

  $('hintsToggle').addEventListener('change', function () {
    var on = this.checked;
    state = CQ.update(function (s) { s.hints = on; });
    renderList();
  });

  $('checkoutBtn').addEventListener('click', function (e) {
    if (CQ.units(state) === 0) { e.preventDefault(); toast('Your cart is empty. Grab something first!'); }
  });

  $('restartBtn').addEventListener('click', function () {
    if (!window.confirm('Empty your cart and restart the timer?')) return;
    CQ.restartQuest(); state = CQ.get();
    refresh(); showMap(); toast('Fresh start. Good luck!');
  });

  /* ---------- picking items up ---------- */

  var toastTimer;
  function toast(msg, kind) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast show ' + (kind || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2300);
  }

  // Put one unit in the cart and tell the player how it went.
  function pick(id) {
    var it = STORE.items[id];
    var helpful = CQ.needs(state).some(function (n) { return !n.done && n.accepts.indexOf(id) !== -1; });
    var r = CQ.addItem(id);
    state = r.state;
    refresh();

    var btn = $('cartBtn');
    btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump');

    if (helpful) toast('✓ Added ' + it.emoji + ' ' + it.name + ' (on your list)', 'good');
    else toast('Added ' + it.emoji + ' ' + it.name + ' as an extra (not on your list, −10 pts)', 'extra');
    if (r.newlyComplete) setTimeout(celebrate, reduceMotion ? 0 : 600);
  }

  function centerOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function makeGhost(id) {
    var it = STORE.items[id];
    var g = document.createElement('div');
    g.className = 'ghost';
    g.innerHTML = '<span class="e">' + it.emoji + '</span>' + CQ.esc(it.name);
    document.body.appendChild(g);
    return g;
  }

  function tf(p, scale) { return 'translate(' + p.x + 'px,' + p.y + 'px) translate(-50%,-50%) scale(' + scale + ')'; }

  // Slide a ghost from A to B, then remove it.
  function glide(g, from, to, ms, endScale, endOpacity) {
    g.style.transform = tf(from, 1);
    if (reduceMotion) { g.remove(); return; }
    var a = g.animate(
      [{ transform: tf(from, 1), opacity: 1 }, { transform: tf(to, endScale), opacity: endOpacity }],
      { duration: ms, easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
    var done = function () { g.remove(); };
    a.onfinish = done; a.oncancel = done;
  }

  /* ---------- drag and drop (pointer events) ---------- */

  var drag = null;          // { id, hs, x0, y0, active, ghost, type }
  var overZone = null;

  function zoneAt(x, y) {
    var el = document.elementFromPoint(x, y);
    return el ? el.closest('.dropzone') : null;
  }

  function setOver(zone) {
    if (zone === overZone) return;
    if (overZone) overZone.classList.remove('over');
    overZone = zone;
    if (zone) zone.classList.add('over');
  }

  function endDrag() {
    document.body.classList.remove('dragging');
    setOver(null);
    if (drag && drag.hs) drag.hs.classList.remove('lifted');
  }

  $('stage').addEventListener('pointerdown', function (e) {
    var hs = e.target.closest('.hotspot');
    if (!hs || e.button !== 0) return;
    drag = { id: hs.dataset.item, hs: hs, x0: e.clientX, y0: e.clientY, active: false, ghost: null, type: e.pointerType };
    try { hs.setPointerCapture(e.pointerId); } catch (err) {}
  });

  document.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!drag.active) {
      // Touch keeps scrolling the page; tapping still adds the item.
      if (drag.type === 'touch' || Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
      drag.active = true;
      drag.ghost = makeGhost(drag.id);
      drag.hs.classList.add('lifted');
      document.body.classList.add('dragging');
    }
    drag.ghost.style.transform = tf({ x: e.clientX, y: e.clientY }, 1);
    setOver(zoneAt(e.clientX, e.clientY));
  });

  document.addEventListener('pointerup', function (e) {
    if (!drag) return;
    var d = drag, moved = Math.hypot(e.clientX - d.x0, e.clientY - d.y0);
    var zone = d.active ? zoneAt(e.clientX, e.clientY) : null;
    endDrag();
    drag = null;

    if (d.active) {
      if (zone) {
        glide(d.ghost, { x: e.clientX, y: e.clientY }, centerOf(zone), 220, 0.3, 0.2);
        pick(d.id);
      } else {
        glide(d.ghost, { x: e.clientX, y: e.clientY }, centerOf(d.hs), 280, 0.8, 0);   // float back to the shelf
        d.hs.classList.remove('shake'); void d.hs.offsetWidth; d.hs.classList.add('shake');
        toast('Drop it on your cart to pick it up');
      }
    } else if (moved < 10) {
      // A plain click or tap: send the item flying to the cart.
      var g = makeGhost(d.id);
      glide(g, { x: e.clientX, y: e.clientY }, centerOf($('cartBtn')), 520, 0.35, 0.25);
      pick(d.id);
    }
  });

  function cancelDrag() {
    if (!drag) return;
    var d = drag; endDrag(); drag = null;
    if (d.ghost) glide(d.ghost, { x: d.x0, y: d.y0 }, centerOf(d.hs), 200, 0.8, 0);
  }
  document.addEventListener('pointercancel', cancelDrag);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cancelDrag(); });

  // Keyboard users: Enter/Space fires a click with detail === 0.
  $('stage').addEventListener('click', function (e) {
    var hs = e.target.closest('.hotspot');
    if (!hs || e.detail !== 0) return;
    var g = makeGhost(hs.dataset.item);
    glide(g, centerOf(hs), centerOf($('cartBtn')), 520, 0.35, 0.25);
    pick(hs.dataset.item);
  });

  /* ---------- finishing the recipe ---------- */

  function celebrate() {
    var p = CQ.progress(state), P = CQ.POINTS;
    $('doneEmoji').textContent = dish.emoji;
    $('doneSub').textContent = 'Everything for ' + dish.name + ' is in your cart. Time: ' + CQ.fmtTime(p.elapsed) + '.';

    var rows = [['', 'Ingredients found (' + p.found + ' × ' + P.perIngredient + ')', '+' + p.found * P.perIngredient, 'pos']];
    if (p.timeBonus) rows.push(['', 'Speed bonus', '+' + p.timeBonus, 'pos']);
    if (p.perfect) rows.push(['', 'Perfect cart, no extras', '+' + P.perfectCart, 'pos']);
    if (p.extraUnits) rows.push(['', 'Extras (' + p.extraUnits + ' × ' + Math.abs(P.perExtraUnit) + ')', '−' + p.extraUnits * Math.abs(P.perExtraUnit), 'neg']);
    rows.push(['sum', 'Total score', String(p.points), '']);

    $('doneResult').innerHTML = rows.map(function (r) {
      return '<li class="' + (r[0] || r[3]) + '"><span>' + r[1] + '</span><b>' + r[2] + '</b></li>';
    }).join('');

    var dlg = $('doneDialog');
    if (dlg.open) return;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  $('keepShopping').addEventListener('click', function () { $('doneDialog').close(); });

  /* ---------- go ---------- */

  // Coming back from the cart page (browser Back) should show the latest cart.
  function resync() { state = CQ.get(); refresh(); }
  window.addEventListener('pageshow', resync);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) resync(); });

  showMap();
  refresh();
  setInterval(tick, 250);
})();
