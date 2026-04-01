// Меблерія Main JS
// Vanilla JS ES6+
// Libs: Swiper, iziToast, raty-js (requires jQuery)

const API_BASE = 'https://furniture-store-v2.b.goit.study/api';

let app;
class FurnitureApp {
  constructor() {
    app = this;
    this.selectedFurnitureId = null;
    this.selectedColor = '';
    this.init();
  }

  init() {
    this.refs = this.getRefs();
    this.api = new FurnitureApi();
    this.spinner = new Spinner(this.refs.loader);
    
    // Event listeners
    if (this.refs.burger) this.refs.burger.addEventListener('click', () => this.toggleBurger());
    if (this.refs.burgerOverlay) this.refs.burgerOverlay.addEventListener('click', () => this.closeBurger());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeAllModals(); });

    // Furniture card delegated click
    if (this.refs.furnitureGrid) {
      this.refs.furnitureGrid.addEventListener('click', (e) => {
        const detailsBtn = e.target.closest('.details-btn');
        if (detailsBtn) {
          const card = detailsBtn.closest('.furniture-card');
          const id = card?.dataset?.id;
          if (id) this.openDetails(id);
        }
      });
    }

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^=\"#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href').substring(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          this.closeBurger();
        }
      });
    });

    // Load initial data
    this.loadCategories();
    this.loadFurniture();
    this.loadFeedbacks();
    this.loadFAQ(); // Static or API if available

    // Init Swiper after DOM + images loaded
    window.addEventListener('load', () => this.initSwiper());

    // Modal close listeners
    document.addEventListener('click', (e) => {
      if (e.target.id === 'details-modal' || e.target.closest('#details-close')) this.closeAllModals();
      if (e.target.id === 'order-modal' || e.target.closest('#order-close')) this.closeAllModals();
    });
    
    // Load more if exists
    if (this.refs.loadMore) {
      this.refs.loadMore.addEventListener('click', () => this.loadFurniture(this.currentPage + 1, this.currentCategory));
    }

    // Order form
    if (this.refs.orderForm) {
      this.refs.orderForm.addEventListener('submit', (e) => this.onOrderSubmit(e));
    }
  }

  loadFAQ() {
    const faqData = [
      { q: 'Яка мінімальна сума замовлення?', a: 'Мінімальна сума замовлення становить 5000 грн.' },
      { q: 'Чи є доставка?', a: 'Так, доставка по всій Україні Новою Поштою.' },
      { q: 'Які терміни виготовлення?', a: 'Стандартні терміни 14-21 днів, термінові 7-10 днів.' },
      { q: 'Чи можна побачити зразки?', a: 'Так, за попередньою домовленістю в нашому шоурумі.' },
      { q: 'Які способи оплати?', a: 'Передоплата 50%, повна передоплата або післяплатою.' },
    ];
    const markup = faqData.map(({ q, a }) => `
      <div class="faq-item">
        <div class="faq-question">
          <h3>${q}</h3>
          <svg class="faq-icon" viewBox="0 0 32 32">
            <rect x="14" y="12" width="4" height="8" fill="#080C09"/>
            <rect x="12" y="14" width="8" height="4" fill="#080C09"/>
          </svg>
        </div>
        <div class="faq-answer">${a}</div>
      </div>
    `).join('');
    this.refs.faqList.innerHTML = markup;
    this.refs.faqList.onclick = (e) => {
      if (e.target.closest('.faq-question')) {
        const item = e.target.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        const isOpen = answer.classList.contains('show');
        this.refs.faqList.querySelectorAll('.faq-answer.show').forEach(ans => {
          ans.classList.remove('show');
          ans.previousElementSibling.querySelector('.faq-icon').style.transform = '';
        });
        if (!isOpen) {
          answer.classList.add('show');
          icon.style.transform = 'rotate(45deg)';
        }
      }
    };
  }

  async loadFeedbacks() {
    try {
      this.spinner.show();
      const data = await this.api.getFeedbacks();
      const feedbacks = data.feedbacks || data.data || [];
      this.renderFeedbacks(feedbacks.slice(0,10));
    } catch (error) {
      console.error(error);
      // fallback static 10
      const fallback = Array.from({length: 10}, (_, i) => ({
        rate: 4 + (Math.random() * 1),
        descr: 'Відмінні меблі, рекомендую!',
        name: `Клієнт ${String.fromCharCode(65 + i % 26)}`
      }));
      this.renderFeedbacks(fallback);
    } finally {
      this.spinner.hide();
    }
  }

  renderFeedbacks(feedbacks) {
    const markup = feedbacks.map(fb => `
      <div class="swiper-slide feedback-card">
        <div class="feedback-stars" data-score="${this.roundRating(fb.rate)}" data-full-stars="${Math.floor(fb.rate)}" data-half="${fb.rate % 1 > 0.25}"></div>
        <p class="feedback-text">"${fb.descr}"</p>
        <div class="feedback-author">${fb.name}</div>
      </div>
    `).join('');
    this.refs.feedbackWrapper.innerHTML = markup;
    // Simple CSS stars for now (raty needs images/jQuery fix later)
    setTimeout(() => this.initStars(), 100);
  }

  initStars() {
    document.querySelectorAll('.feedback-stars').forEach(starContainer => {
      const score = parseFloat(starContainer.dataset.score);
      const full = Math.floor(score);
      const hasHalf = score % 1 >= 0.25;
      starContainer.innerHTML = `
        ${'★'.repeat(full)}${hasHalf ? '☆' : ''}${'☆'.repeat(5 - full - (hasHalf ? 1 : 0))}
      `;
      starContainer.style.fontSize = '20px';
    });
  }

  roundRating(rating) {
    if (rating >= 3.3 && rating <= 3.7) return 3.5;
    if (rating >= 3.8 && rating <= 4.2) return 4;
    return Math.round(rating * 2) / 2; // to nearest 0.5
  }

  async onOrderSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.refs.orderForm);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      comment: formData.get('comment'),
      email: formData.get('email'),
      furniture_id: this.selectedFurnitureId, // from details
      color: this.selectedColor,
    };
    if (!this.validateOrder(data)) return;
    this.spinner.show();
    try {
      await this.api.createOrder(data);
      iziToast.success({ title: 'Успіх', message: 'Заявку надіслано!' });
      this.refs.orderForm.reset();
      this.closeAllModals();
    } catch {
      iziToast.error({ message: 'Помилка надсилання' });
    } finally {
      this.spinner.hide();
    }
  }

  validateOrder(data) {
    if (!data.name?.trim() || data.name.length < 2) {
      iziToast.warning({ message: 'Ім\'я повинно містити мінімум 2 символи' });
      return false;
    }
    if (!data.phone || !/^[\+]?[3]?[8]?[0](\s?)?(\d[\s-]?){9}$/.test(data.phone)) {
      iziToast.warning({ message: 'Телефон: +380 XX XXX XX XX або 0XX XXX XX XX' });
      return false;
    }
    return true;
  }

  // closeBurger = closeAllModals for burger too? No, separate
  closeBurger() {
    this.refs.burgerOverlay.classList.remove('active');
    this.refs.burger.setAttribute('aria-expanded', 'false');
  }

  getRefs() {
    return {
      burger: document.getElementById('burger'),
      burgerOverlay: document.getElementById('burger-overlay'),
      loader: document.getElementById('loader'),
      furnitureFilters: document.getElementById('furniture-filters'),
      furnitureGrid: document.getElementById('furniture-grid'),
      loadMore: document.getElementById('load-more'),
      faqList: document.getElementById('faq-list'),
      feedbackWrapper: document.getElementById('feedback-swiper-wrapper'),
      detailsModal: document.getElementById('details-modal'),
      detailsBody: document.getElementById('details-body'),
      orderModal: document.getElementById('order-modal'),
      detailsClose: document.getElementById('details-close'),
      orderClose: document.getElementById('order-close'),
      orderForm: document.getElementById('order-form'),
    };
  }

  async loadCategories() {
    try {
      this.spinner.show();
      const categories = await this.api.getCategories();
      this.renderCategories(categories);
    } catch (error) {
      iziToast.error({ title: 'Помилка', message: 'Не вдалося завантажити категорії' });
    } finally {
      this.spinner.hide();
    }
  }

  renderCategories(categories) {
    const markup = categories.map(cat => 
      `<button class="category-btn" data-category="${cat.name}">${cat.name}</button>`
    ).join('');
    this.refs.furnitureFilters.innerHTML = markup;
    // Add event listeners to buttons
    this.refs.furnitureFilters.addEventListener('click', (e) => {
      if (e.target.classList.contains('category-btn')) {
        document.querySelector('.category-btn.active')?.classList.remove('active');
        e.target.classList.add('active');
        this.currentCategory = e.target.dataset.category;
        this.loadFurniture(1);
      }
    });
    // All as default
    this.currentCategory = '';
  }

  currentPage = 1;
  currentCategory = '';
  pageSize = 8;
  furniture = [];

  async loadFurniture(page = 1, category = '') {
    this.currentPage = page;
    this.currentCategory = category;
    this.spinner.show();
    try {
      const response = await this.api.getFurniture(page, category);
      const items = response.furnitures || response.data || response || [];
      const totalPages = response.totalPages ?? Math.ceil((response.totalItems || response.total || items.length) / this.pageSize || 1);
      this.furniture = items;
      this.renderFurniture(items);
      if (this.refs.loadMore) {
        this.refs.loadMore.classList.toggle('hidden', page >= totalPages);
      }
    } catch (error) {
      console.error(error);
      iziToast.error({ message: 'Помилка завантаження меблів' });
    } finally {
      this.spinner.hide();
    }
  }

  renderFurniture(items) {
    const markup = items.map(item => `
      <div class="furniture-card" data-id="${item._id}">
        <div class="furniture-image" style="background-image: url(${item.images?.[0] || 'data:image/svg+xml;base64,PHN2Zz...'} )"></div>
        <div class="card-content">
          <h3>${item.name || 'Модель меблів'}</h3>
          <div class="card-category">${item.category?.name || 'Категорія'}</div>
          <div class="card-variants">
            ${item.color?.map(color => `<span class="color-variant" style="background: ${color}" title="${color}"></span>`).join('') || `
              <span class="color-variant color-beige" title="бежевий"></span>
              <span class="color-variant color-gold" title="золотий"></span>
              <span class="color-variant color-black" title="чорний"></span>
            `}
          </div>
          <div class="card-price">${item.price?.toLocaleString() || '0'} грн</div>
          <button class="btn btn-secondary details-btn">Детальніше</button>
        </div>
      </div>
    `).join('');
    this.refs.furnitureGrid.innerHTML = markup;
  }

  async openDetails(id) {
    this.selectedFurnitureId = id;
    this.spinner.show();
    try {
      const item = await this.api.getFurnitureById(id);
      this.renderDetails(item);
    this.refs.detailsModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    } catch (error) {
      iziToast.error({ message: 'Помилка завантаження деталей' });
    } finally {
      this.spinner.hide();
    }
  }

  renderDetails(item) {
    const colorsMarkup = (item.color || []).map(color => `
      <label class="color-checkbox">
        <input type="radio" name="color" value="${color}" style="background: ${color}" data-name="${color}">
        <span class="color-swatch" style="background: ${color}" title="${color}"></span>
        <span>${color}</span>
      </label>
    `).join('') || '<p>Кольори недоступні</p>';

    const imagesMarkup = (item.images || []).map(img => `<img src="${img}" alt="${item.name}" class="gallery-thumb">`).slice(0,6).join('') || '<div class="no-images">Зображення відсутні</div>';

    this.refs.detailsBody.innerHTML = `
      <div class="details-gallery">
        <img src="${item.images?.[0] || 'data:image/svg+xml;base64,PHN2Zz...grey rect'}" alt="${item.name}" class="main-image" id="main-detail-image">
        <div class="gallery-thumbs">${imagesMarkup}</div>
      </div>
      <div class="details-info">
        <h3>${item.name || 'Модель'}</h3>
        <div class="details-category">${item.category?.name}</div>
        <div class="details-price">${item.price?.toLocaleString()} грн</div>
        <div class="details-colors">
          <h4>Оберіть колір:</h4>
          <div class="colors-grid">${colorsMarkup}</div>
        </div>
        <button class="btn btn-primary order-from-details" onclick="app.openOrder()">Замовити</button>
      </div>
    `;

    // Color radio listeners
    this.refs.detailsBody.querySelectorAll('input[name="color"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.selectedColor = e.target.value;
        iziToast.info({ message: `Вибрано колір: ${e.target.dataset.name}` });
      });
    });

    // Gallery thumbs
    this.refs.detailsBody.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        document.getElementById('main-detail-image').src = e.target.src;
      });
    });
  }

  openOrder() {
    if (!this.selectedFurnitureId) {
      iziToast.warning({ message: 'Спочатку оберіть товар' });
      return;
    }
    this.refs.orderModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  // Similar for openOrder, onOrderSubmit validation + POST
  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.add('hidden'));
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    // Close burger too
    if (this.refs.burgerOverlay && this.refs.burgerOverlay.classList.contains('active')) {
      this.closeBurger();
    }
  }

  initSwiper() {
    new Swiper('.feedback-swiper', {
      slidesPerView: 1,
      spaceBetween: 16,
      pagination: { el: '.feedback-pagination', clickable: true },
      navigation: { nextEl: '.feedback-next', prevEl: '.feedback-prev' },
      breakpoints: {
        768: { slidesPerView: 2 },
        1440: { slidesPerView: 3 },
      },
    });
  }

  // loadFeedbacks, render w/raty: $('.stars').raty({ score: rating });
  // loadFAQ static or API
  // toggleBurger, closeBurger already
  // onOrderSubmit: validate, POST, toast success/error, reset form, close

  toggleBurger() {
    this.refs.burgerOverlay.classList.toggle('active');
    this.refs.burger.getAttribute('aria-expanded') === 'false' 
      ? this.refs.burger.setAttribute('aria-expanded', 'true')
      : this.refs.burger.setAttribute('aria-expanded', 'false');
  }

  // Placeholder classes
}

class FurnitureApi {
  constructor() {
    this.base = API_BASE;
  }

  async request(endpoint, options = {}) {
    const url = `${this.base}${endpoint}`;
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async getCategories() { return this.request('/categories'); }
  async getFurniture(page = 1, category = '', limit = 8) {
    const params = new URLSearchParams({ page, limit });
    if (category) params.append('category', category);
    return this.request(`/furnitures?${params}`);
  }
  async getFurnitureById(id) { return this.request(`/furnitures/${id}`); }
  async getFeedbacks() { return this.request('/feedbacks'); }
  async createOrder(data) { return this.request('/orders', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(data) }); }
}

class Spinner {
  constructor(loader) {
    this.loader = loader;
  }
  show() { this.loader.classList.remove('hidden'); }
  hide() { this.loader.classList.add('hidden'); }
}

// Init
document.addEventListener('DOMContentLoaded', () => new FurnitureApp());

