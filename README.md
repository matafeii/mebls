# Меблерія 🛋️

## Про проєкт

Сайт меблевого магазину "Меблерія" з інтеграцією реального API. Адаптивний дизайн за макетом Figma, функціонал завантаження товарів, фільтрація, модальні вікна замовлення, відгуки зі слайдером, FAQ акордеон.

**Задача:** Створити сучасний landing з повною інтеграцією бекенду.

## Технології

- HTML5
- CSS3 (Flexbox/Grid, Custom Properties, Animations)
- Vanilla JavaScript ES6+ (Fetch API, Async/Await, Modules-like)
- Бібліотеки (CDN):
  - Swiper.js 11 - слайдери відгуків/популярних
  - iziToast - пуш-повідомлення
  - raty-js + jQuery - зірковий рейтинг
  - Google Fonts: Raleway

## API

[Документація](https://furniture-store-v2.b.goit.study/api-docs/)

## Як запустити

1. Клонуйте репозиторій або скопіюйте файли
2. Відкрийте `index.html` у браузері (Live Server VSCode рекомендується)
3. Сайт готовий! API працює онлайн.

## Структура

```
.
├── index.html         # Головний файл
├── css/
│   └── styles.css     # Стилі + responsive
├── js/
│   └── main.js        # Логіка + API
├── assets/images/     # Зображення (API + placeholders)
└── TODO.md            # Статус розробки
```

## Функціонал

✅ Адаптивність (375px / 768px / 1440px)  
✅ Завантаження з API (/categories, /furniture, /feedbacks)  
✅ Фільтри/Пагінація/Load more  
✅ Модалки деталей/замовлення (POST /orders)  
✅ Swiper відгуки + raty зірки  
✅ Акордеон FAQ  
✅ Лоадери + Toasts помилок  
✅ Burger меню + smooth scroll  
✅ UI Kit стилі (hover/focus/active)

## Супутня інформація

- Макет: [Figma](https://www.figma.com/design/xmuUuDiEAbT0mjmpgzPrc0/Меблерія?node-id=5999-10563)
- Точки перелому: mobile 375px, tablet 768px, desktop 1440px
- Зображення: API + placeholders retina-ready

---

## Demo

Open `index.html` in browser to see live site with real API integration.

## Browser Support

- Chrome 100+
- Firefox 95+
- Safari 15+
- Edge 100+

## Features Complete ✅

- API: /categories /furniture paginated filter /feedbacks /furniture/{id} /orders POST
- UI: Responsive 375/768/1440px Figma exact shadows buttons
- JS: Modals details gallery colors checkboxes order validation UA phone POST toast
- Feedback Swiper pagination arrows swipe disable edges raty stars rounding
- Polish loaders all APIs iziToast success/error ESC/backdrop close body no-scroll cursor pointer
- Images retina SVG placeholders hero logo furniture API fallback
- Interactions burger smooth scroll FAQ accordion one-open load more categories

No console errors, retina-ready, responsive tested.

Створено з ❤️ using BLACKBOXAI
