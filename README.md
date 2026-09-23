# Cart Quest 🛒🎮

This project was created for FALL HACKS 2025 as a themed hackathon build.
The concept was a fusion of two very different ideas: food delivery and
video games. We combined the excitement of a game quest with the everyday
experience of ordering a meal, turning grocery shopping into a playful
challenge where users collect ingredients to complete a recipe before
checking out.

Cart Quest is a gamified shopping and food-delivery experience: pick a
cuisine and a dish, then hunt down every ingredient in a virtual grocery
store before you check out. No backend — everything runs in the browser.

This project is complete and lives in a different repository, but it is
derived from the original project at https://github.com/iba21-04/CartQuest.

## How to run it

Just open `pages/home.html` in a browser (double-click works, or serve
the folder with any static file server). No build step, no install.

## Flow

home.html → prompt.html → game.html → CartPage.html → CreditCard.html → delivery.html

- **home.html** – landing page, "Start" begins a new quest.
- **prompt.html** – pick a cuisine, then a dish. Choices come from `data/ingredients.js`.
- **game.html** – the store: an aisle map, then per-aisle shelves. Drag
  (or click, or use the keyboard) ingredients into your cart. A shopping
  list on the side tracks what's still missing, with optional aisle
  hints, a timer, and a live score.
- **CartPage.html** – review the cart, adjust quantities, see whether
  the recipe is complete.
- **CreditCard.html** – demo checkout form (no real payment). Any
  16-digit card number works, or use "Fill demo details".
- **delivery.html** – order receipt, quest score, and an animated
  delivery map (falls back gracefully if there's no internet connection).

## Data / shared state

- `data/store.js` – every shelf product: name, emoji, price, aisle, and
  the pixel rectangle it occupies on that aisle's artwork.
- `data/ingredients.js` – the 20 dishes (4 cuisines × 5 dishes) and their
  ingredient lists. Every ingredient maps to a real shelf item, so every
  dish can be completed. Kept as a `.js` file (not `.json`) so it still
  loads when the page is opened directly from disk.
- `js/cartquest.js` – shared game state (cuisine/dish, cart, score,
  order) saved to `localStorage`, with a `window.name` fallback for
  browsers that block local-file storage.
- `js/game.js` + `css/game.css` – the store screen itself.

## Tech stack

- Frontend: HTML5, CSS3, JavaScript (no frameworks, no build tools)
- Animations: CSS keyframes + a little Web Animations API for the drag ghost
- Map: Leaflet + Leaflet Routing Machine (loaded from a CDN; delivery.html
  falls back to a straight-line route if there's no connection)

## Future roadmap

- User profiles / accounts (would need a backend)
- More cuisines and dishes
- Sound effects
- In-aisle mini-games

## Contributors

Divij Gupta · Ira Batra · Vansh Bansal · Grace Chhabra
