# Меблерія Project Guidelines

## Overview

**Меблерія** is a responsive furniture store website (static frontend with API integration). No build process or dependencies—pure vanilla HTML/CSS/JavaScript. All features complete and production-ready.

## Code Style

### JavaScript
- **ES6+ vanilla** (classes, const/let, arrow functions, async/await, template literals)
- **No frameworks or bundlers**—direct browser code
- **Class-based architecture**: `main.js` exports `FurnitureApp` constructor; global `app` instance manages the entire app
- **Delegated event listeners** for dynamic content (furniture cards, modals)
- **Async/Await + Fetch API** for all API calls (no jQuery for XHR)
- **Comments in Ukrainian** where relevant; inline comments explain non-obvious logic

**Key JS files exemplify patterns:**
- [js/main.js](js/main.js) — `FurnitureApp` class, API wrapper, DOM refs, event setup, modal/burger/loader logic
- Event pattern: `addEventListener` on static containers with delegated `.closest()` for dynamic children
- Loader/spinner managed via `Spinner` class; modals via `refs` object with `closeAllModals()` helper
- Form submission validates and POSTs to `/orders` endpoint; responses show `iziToast` notifications (success/error)

### CSS
- **CSS3 Flexbox/Grid, Custom Properties (variables), Animations**
- **Responsive Design**: Mobile-first with breakpoints
  - `375px` (mobile)
  - `768px` (tablet)  
  - `1440px` (desktop)
- **Custom Properties** for colors, shadows, fonts—define at root or section level
- **No preprocessor**—raw CSS in [css/styles.css](css/styles.css)
- **Figma design** is the source of truth for spacing, shadows, typography, colors

### HTML
- **Semantic HTML5**: `<header>`, `<section>`, `<footer>`, `<main>` where appropriate
- **Accessibility**: `aria-label`, `role` attributes, semantic link/button elements
- **External libraries via CDN** (Swiper, iziToast, raty-js, jQuery, Google Fonts Raleway)
- **No templating**—static markup + JS DOM manipulation

## Architecture

The app follows a **linear initialization pattern**:

1. **FurnitureApp constructor** runs immediately when page loads
2. **DOM References** collected in `getRefs()` (burger menu, modals, grid, forms, etc.)
3. **API wrapper class** (`FurnitureApi`) handles all `/api` calls
4. **Event setup** in `init()` — click listeners, form handlers, smooth scroll
5. **Async data loading** — `loadCategories()`, `loadFurniture()`, `loadFeedbacks()`, `loadFAQ()`
6. **Swiper + raty initialization** after `window.load` event (wait for images)
7. **Modals and side effects** — order submission, furniture details popup, burger menu toggle

**Modal flow:**
- Click `.details-btn` → `openDetails(furnitureId)` → fetch furniture data → populate modal
- Submit order form → validate → POST to `/orders` → show success toast or error toast
- Press ESC or click backdrop → `closeAllModals()` (applies to all modals)

**File organization:**
- `index.html` — single-page markup (header, hero, sections, modals, footer)
- `css/styles.css` — all styling (no separate files)
- `js/main.js` — all JavaScript logic (classes, API, event handlers)
- `assets/images/` — logo.svg, placeholders, any static images (API serves furniture images)

## Build and Test

**No build process required.**

### To run locally:
1. Open [index.html](index.html) in a modern browser (Chrome, Firefox, Safari, Edge v100+)
   - Use **VS Code Live Server extension** (right-click → Open with Live Server) for development
   - Or simple: `python -m http.server 8000` then visit `http://localhost:8000`
2. Site loads with real API from [Furniture Store V2 API](https://furniture-store-v2.b.goit.study/api-docs/)
3. Check browser console (`F12`) — should have no errors

### Responsive testing:
- Chrome DevTools: `F12` → Device toolbar (`Ctrl+Shift+M`)
- Test at breakpoints: **375px**, **768px**, **1440px**
- Verify no horizontal scroll; touch interactions work (burger menu, buttons)
- Images load (retina-ready SVG + API images with fallbacks)

## Conventions

### API Integration
- **Base URL**: `https://furniture-store-v2.b.goit.study/api`
- **All endpoints**:
  - `GET /categories` — list all product categories
  - `GET /furniture?category={id}&page={n}&limit={size}` — paginated furniture list
  - `GET /furniture/{id}` — furniture details (images, colors, rating, description)
  - `GET /feedbacks?page={n}&limit={size}` — customer feedback/reviews
  - `POST /orders` — submit furniture order (body: `{ email, name, phone, furniture_id, color, comment }`)
- **Error handling**: Fetch errors → `iziToast.error()` pop-up with user message
- **Loading state**: Show `#loader` spinner during API calls via `this.spinner.show()/hide()`

### Naming & Selectors
- **CSS classes**: kebab-case (`.furniture-card`, `.details-btn`, `.faq-question`)
- **Data attributes**: `data-id` for resource IDs (furniture, category)
- **IDs**: Used for main sections (`#header`, `#hero`, `#furniture`, `#faq`, `#feedback`, `#about`) and modals (`#details-modal`, `#order-modal`)
- **DOM refs**: Collected in `getRefs()` as an object with camelCase keys (`this.refs.furnitureGrid`, `this.refs.orderForm`)

### Responsive Images
- **Figma design** provides hero image and placeholders
- **API images** served for furniture cards (with fallback placeholder)
- **Retina ready** — SVGs for logo/icons; images optimized for high DPI
- **Picture elements** or `srcset` not required (single source works at all breakpoints)

### Color & Typography
- **Font**: Google Fonts **Raleway** (weights: 300–800, italic + normal)
- **Colors**: Defined as CSS custom properties (e.g., `--color-primary`, `--color-text`, `--color-bg`)
- **Shadows & spacing**: Inspect [css/styles.css](css/styles.css) → root section for design tokens

### Modal & Form Validation
- **Order form** fields: email, name, phone (required), furniture_id (hidden), color (selection), comment (optional)
- **Validation**: UA phone format `+38...` or (0xx) xxx-xx-xx; email via regex
- **On submit**: POST to `/orders` → on success show "Замовлення створено!" and reset form → on error show `iziToast.error(message)` from API
- **Modal escape**: ESC key or backdrop click triggers `closeAllModals()`

### Swiper Configuration
- **Feedback slider**: Swiper with pagination bullets, prev/next arrows, 1–3 items per breakpoint
- **Popular furniture slider**: Similar config (if present)
- **Init after load**: `window.addEventListener('load', () => this.initSwiper())` — wait for images before calculating dimensions

### FAQ Accordion
- **Behavior**: One open at a time (closing previous when clicking a new item)
- **FAQ data**: Currently hardcoded in JS as array of `{ q, a }` objects (can be moved to API endpoint later)
- **Click handler**: Toggles `.open` class on `.faq-item`; CSS applied max-height transition for smooth open/close

## FAQ

**Do I need Node.js or npm?**  
No. This is a static site—just HTML, CSS, JS. Open in browser or use Live Server.

**Can I modify the API endpoints?**  
Yes, but the live endpoint works. If building a local backend, update `API_BASE` in [js/main.js](js/main.js).

**How do I add new sections?**  
Add markup to [index.html](index.html), style in [css/styles.css](css/styles.css), add event listeners and logic in [js/main.js](js/main.js).

**Is there a database?**  
No—the API (furniture-store-v2) manages the database. The frontend is pure client-side.

**Why Swiper/iziToast/raty instead of npm packages?**  
Minimal dependencies via CDN. If the project grows, migrate to a bundler + npm packages.

---

See [README.md](README.md) for full feature list and [TODO.md](TODO.md) for completed milestones.
