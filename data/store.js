/*
 * Cart Quest – store data
 *
 * Everything the virtual store needs to know about the shelves in
 * images/aisle-1.png … aisle-6.png (each 700 x 500 px).
 *
 * Each product sits on a shelf row (0–3, top to bottom) and in a shelf
 * column: "full" (spans the whole shelf), "L" (left half) or "R" (right half).
 * The pixel rectangles for those slots are worked out below, so if you ever
 * redraw the aisle art you only need to tweak ROWS / COLS.
 */
(function () {
  // y-range (in image pixels) of each of the four shelf rows
  var ROWS = [[150, 218], [220, 294], [296, 364], [366, 436]];
  // x-range of each shelf column
  var COLS = { full: [12, 688], L: [12, 365], R: [365, 688] };

  function slot(row, col) {
    var y = ROWS[row], x = COLS[col];
    return { x: x[0], y: y[0], w: x[1] - x[0], h: y[1] - y[0] };
  }

  var AISLES = {
    1: { name: 'Grains & Pasta' },
    2: { name: 'Dairy & Eggs' },
    3: { name: 'Meat & Protein' },
    4: { name: 'Produce & Herbs' },
    5: { name: 'Baking & Pantry' },
    6: { name: 'Frozen & Canned' }
  };

  // id: [display name, emoji, aisle, price, shelf row, shelf column]
  var RAW = {
    // Aisle 1 – Grains & Pasta
    'spaghetti':        ['Spaghetti',        '🍝', 1, 2.49, 0, 'full'],
    'lasagna':          ['Lasagna sheets',   '🥘', 1, 2.99, 1, 'full'],
    'tortillas':        ['Tortillas',        '🫓', 1, 3.79, 2, 'L'],
    'dry-pasta':        ['Dry pasta',        '🍜', 1, 1.99, 2, 'R'],
    'pizza-dough':      ['Pizza dough',      '🍕', 1, 3.49, 3, 'L'],
    'rice':             ['Rice',             '🍚', 1, 4.99, 3, 'R'],
    // Aisle 2 – Dairy & Eggs
    'eggs':             ['Eggs',             '🥚', 2, 4.29, 0, 'L'],
    'yogurt':           ['Yogurt',           '🍨', 2, 3.99, 0, 'R'],
    'parmesan':         ['Parmesan',         '🧀', 2, 5.49, 1, 'L'],
    'cream':            ['Cream',            '🥛', 2, 3.29, 1, 'R'],
    'cheddar':          ['Cheddar',          '🧀', 2, 5.99, 2, 'full'],
    'mozzarella':       ['Mozzarella',       '🧀', 2, 4.99, 3, 'L'],
    'ricotta':          ['Ricotta',          '🧀', 2, 4.49, 3, 'R'],
    // Aisle 3 – Meat & Protein
    'pork':             ['Pork',             '🍖', 3, 8.99, 0, 'L'],
    'ground-beef':      ['Ground beef',      '🥩', 3, 7.49, 0, 'R'],
    'chicken':          ['Chicken',          '🍗', 3, 9.49, 1, 'L'],
    'black-beans':      ['Black beans',      '🫘', 3, 1.79, 1, 'R'],
    'chickpeas':        ['Chickpeas',        '🫘', 3, 1.99, 2, 'L'],
    'paneer':           ['Paneer',           '🧈', 3, 5.99, 2, 'R'],
    'peanuts':          ['Peanuts',          '🥜', 3, 3.49, 3, 'L'],
    'pancetta':         ['Pancetta',         '🥓', 3, 5.99, 3, 'R'],
    // Aisle 4 – Produce & Herbs
    'carrot':           ['Carrots',          '🥕', 4, 1.49, 0, 'L'],
    'cabbage':          ['Cabbage',          '🥬', 4, 2.29, 0, 'R'],
    'bell-pepper':      ['Bell peppers',     '🫑', 4, 1.29, 1, 'L'],
    'potato':           ['Potatoes',         '🥔', 4, 3.49, 1, 'R'],
    'peas':             ['Fresh peas',       '🌱', 4, 2.49, 2, 'L'],
    'onion':            ['Onions',           '🧅', 4, 1.99, 2, 'R'],
    'tomato':           ['Tomatoes',         '🍅', 4, 1.79, 3, 'L'],
    'avocado':          ['Avocados',         '🥑', 4, 1.99, 3, 'R'],
    // Aisle 5 – Baking & Pantry
    'vinegar':          ['Vinegar',          '🍾', 5, 2.49, 0, 'L'],
    'soy-sauce':        ['Soy sauce',        '🍶', 5, 2.99, 0, 'R'],
    'sugar':            ['Sugar',            '🍬', 5, 3.29, 1, 'L'],
    'red-chili':        ['Red chili',        '🌶️', 5, 1.49, 1, 'R'],
    'oil':              ['Cooking oil',      '🫒', 5, 5.99, 2, 'L'],
    'cumin':            ['Cumin seeds',      '🌰', 5, 2.79, 2, 'R'],
    'flour':            ['Flour',            '🌾', 5, 4.49, 3, 'L'],
    'masala':           ['Masala mix',       '🧂', 5, 3.49, 3, 'R'],
    // Aisle 6 – Frozen & Canned
    'pineapple':        ['Pineapple',        '🍍', 6, 3.99, 0, 'full'],
    'tomato-sauce':     ['Tomato sauce',     '🥫', 6, 1.79, 1, 'full'],
    'canned-peas':      ['Canned peas',      '🥫', 6, 1.29, 2, 'full'],
    'spring-roll-wraps':['Spring roll wraps','🥟', 6, 3.99, 3, 'full']
  };

  var ITEMS = {};
  Object.keys(RAW).forEach(function (id) {
    var r = RAW[id];
    ITEMS[id] = {
      id: id, name: r[0], emoji: r[1], aisle: r[2], price: r[3],
      rect: slot(r[4], r[5])
    };
  });

  window.CQ_STORE = {
    imageSize: { w: 700, h: 500 },
    // The artwork has empty white space above the pink aisle sign and we crop it out.
    crop: { top: 108, bottom: 500 },
    aisles: AISLES,
    items: ITEMS
  };
})();
