/*
 * Cart Quest – recipes (replaces the old ingredients.json)
 *
 * Why a .js file instead of .json?  Browsers block fetch() of local JSON files
 * when you open an HTML page by double-clicking it, so a plain <script> keeps
 * the project working without needing a server.
 *
 * Every `item` is an id from data/store.js, so every dish can actually be
 * completed in the store.
 *   quantity – what the recipe calls for (shown on the shopping list)
 *   alt      – other shelf items that also count (e.g. fresh OR canned peas)
 *   label    – optional name to show on the list instead of the shelf name
 *   note     – optional dish-level note about substitutions
 */
window.CQ_RECIPES = {
  Italian: {
    emoji: '🍕',
    dishes: {
      'Spaghetti Carbonara': {
        emoji: '🍝',
        ingredients: [
          { item: 'spaghetti', quantity: '200g' },
          { item: 'eggs',      quantity: '2' },
          { item: 'parmesan',  quantity: '50g' },
          { item: 'pancetta',  quantity: '100g' }
        ]
      },
      'Margherita Pizza': {
        emoji: '🍕',
        ingredients: [
          { item: 'pizza-dough',  quantity: '1 base' },
          { item: 'tomato-sauce', quantity: '100ml' },
          { item: 'mozzarella',   quantity: '100g' },
          { item: 'oil',          quantity: '1 tbsp' }
        ]
      },
      'Lasagna': {
        emoji: '🥘',
        ingredients: [
          { item: 'lasagna',      quantity: '200g' },
          { item: 'ground-beef',  quantity: '200g' },
          { item: 'tomato-sauce', quantity: '150ml' },
          { item: 'ricotta',      quantity: '100g' },
          { item: 'mozzarella',   quantity: '100g' }
        ]
      },
      'Pesto Pasta': {
        emoji: '🍝',
        note: 'No basil in stock, so this is a creamy avocado-and-peanut pesto.',
        ingredients: [
          { item: 'dry-pasta', quantity: '200g' },
          { item: 'avocado',   quantity: '1' },
          { item: 'parmesan',  quantity: '30g' },
          { item: 'peanuts',   quantity: '30g' },
          { item: 'oil',       quantity: '2 tbsp' }
        ]
      },
      'Tiramisu': {
        emoji: '🍰',
        note: 'Ricotta stands in for mascarpone and a quick flour sponge for ladyfingers.',
        ingredients: [
          { item: 'ricotta', quantity: '100g' },
          { item: 'eggs',    quantity: '2' },
          { item: 'sugar',   quantity: '50g' },
          { item: 'cream',   quantity: '50ml' },
          { item: 'flour',   quantity: '100g' }
        ]
      }
    }
  },

  Mexican: {
    emoji: '🌮',
    dishes: {
      'Tacos': {
        emoji: '🌮',
        ingredients: [
          { item: 'tortillas',   quantity: '4' },
          { item: 'ground-beef', quantity: '200g' },
          { item: 'cheddar',     quantity: '50g' },
          { item: 'tomato',      quantity: '1' },
          { item: 'onion',       quantity: '1/2' }
        ]
      },
      'Guacamole': {
        emoji: '🥑',
        ingredients: [
          { item: 'avocado',   quantity: '2' },
          { item: 'tomato',    quantity: '1' },
          { item: 'onion',     quantity: '1/2' },
          { item: 'red-chili', quantity: '1' }
        ]
      },
      'Quesadilla': {
        emoji: '🧀',
        ingredients: [
          { item: 'tortillas',   quantity: '2' },
          { item: 'cheddar',     quantity: '50g' },
          { item: 'chicken',     quantity: '100g' },
          { item: 'bell-pepper', quantity: '1/2' }
        ]
      },
      'Burrito': {
        emoji: '🌯',
        note: 'Yogurt stands in for sour cream.',
        ingredients: [
          { item: 'tortillas',   quantity: '1' },
          { item: 'rice',        quantity: '100g' },
          { item: 'black-beans', quantity: '100g' },
          { item: 'yogurt',      quantity: '30g' },
          { item: 'tomato',      quantity: '1' }
        ]
      },
      'Churros': {
        emoji: '🍩',
        ingredients: [
          { item: 'flour', quantity: '100g' },
          { item: 'sugar', quantity: '50g' },
          { item: 'eggs',  quantity: '1' },
          { item: 'oil',   quantity: '200ml' }
        ]
      }
    }
  },

  Indian: {
    emoji: '🍛',
    dishes: {
      'Butter Chicken': {
        emoji: '🍛',
        ingredients: [
          { item: 'chicken',      quantity: '200g' },
          { item: 'tomato-sauce', quantity: '100ml' },
          { item: 'cream',        quantity: '50ml' },
          { item: 'masala',       quantity: '1 tsp' },
          { item: 'oil',          quantity: '1 tbsp' }
        ]
      },
      'Chole': {
        emoji: '🍲',
        ingredients: [
          { item: 'chickpeas', quantity: '200g' },
          { item: 'onion',     quantity: '1' },
          { item: 'tomato',    quantity: '1' },
          { item: 'cumin',     quantity: '1 tsp' },
          { item: 'masala',    quantity: '1 tsp' }
        ]
      },
      'Paneer Tikka': {
        emoji: '🍢',
        ingredients: [
          { item: 'paneer',      quantity: '150g' },
          { item: 'yogurt',      quantity: '50g' },
          { item: 'red-chili',   quantity: '1' },
          { item: 'bell-pepper', quantity: '1/2' },
          { item: 'masala',      quantity: '1 tsp' }
        ]
      },
      'Biryani': {
        emoji: '🍚',
        ingredients: [
          { item: 'rice',    quantity: '200g' },
          { item: 'chicken', quantity: '200g' },
          { item: 'yogurt',  quantity: '50g' },
          { item: 'masala',  quantity: '1 tsp' },
          { item: 'onion',   quantity: '1' }
        ]
      },
      'Samosa': {
        emoji: '🥟',
        ingredients: [
          { item: 'flour',  quantity: '100g' },
          { item: 'potato', quantity: '150g' },
          { item: 'peas',   alt: ['canned-peas'], label: 'Peas', quantity: '50g' },
          { item: 'cumin',  quantity: '1 tsp' },
          { item: 'oil',    quantity: '50ml' }
        ]
      }
    }
  },

  Chinese: {
    emoji: '🍜',
    dishes: {
      'Fried Rice': {
        emoji: '🍚',
        ingredients: [
          { item: 'rice',      quantity: '200g' },
          { item: 'eggs',      quantity: '2' },
          { item: 'carrot',    quantity: '50g' },
          { item: 'soy-sauce', quantity: '2 tbsp' },
          { item: 'peas',      alt: ['canned-peas'], label: 'Peas', quantity: '50g' }
        ]
      },
      'Kung Pao Chicken': {
        emoji: '🍗',
        ingredients: [
          { item: 'chicken',     quantity: '200g' },
          { item: 'bell-pepper', quantity: '1' },
          { item: 'peanuts',     quantity: '30g' },
          { item: 'soy-sauce',   quantity: '2 tbsp' },
          { item: 'red-chili',   quantity: '1' }
        ]
      },
      'Spring Rolls': {
        emoji: '🌯',
        ingredients: [
          { item: 'spring-roll-wraps', quantity: '6' },
          { item: 'cabbage',           quantity: '50g' },
          { item: 'carrot',            quantity: '50g' },
          { item: 'soy-sauce',         quantity: '1 tbsp' }
        ]
      },
      'Sweet and Sour Pork': {
        emoji: '🍍',
        ingredients: [
          { item: 'pork',        quantity: '200g' },
          { item: 'pineapple',   quantity: '100g' },
          { item: 'bell-pepper', quantity: '1' },
          { item: 'vinegar',     quantity: '2 tbsp' },
          { item: 'sugar',       quantity: '1 tbsp' }
        ]
      },
      'Chow Mein': {
        emoji: '🍜',
        note: 'Spaghetti stands in for chow mein noodles.',
        ingredients: [
          { item: 'spaghetti', label: 'Noodles (spaghetti)', quantity: '200g' },
          { item: 'chicken',   quantity: '150g' },
          { item: 'cabbage',   quantity: '50g' },
          { item: 'carrot',    quantity: '50g' },
          { item: 'soy-sauce', quantity: '2 tbsp' }
        ]
      }
    }
  }
};
