/**
 * Accessible Carousel Web Component
 *
 * A simple, highly accessible image carousel using slots for content.
 * Features:
 * - Keyboard navigation (ArrowLeft/ArrowRight)
 * - Screen reader announcements via ARIA
 * - Role and aria-roledescription for carousel and slides
 * - Customizable via CSS parts and CSS custom properties
 * - Clean setup and teardown of event listeners
 *
 * @example
 * <accessible-carousel>
 *   <img src="image1.jpg" alt="Mountain view at sunrise">
 *   <img src="image2.jpg" alt="Forest path in autumn">
 *   <img src="image3.jpg" alt="Beach during sunset">
 * </accessible-carousel>
 */
class AccessibleCarousel extends HTMLElement {
    #slides = [];
    #currentIndex = 0;
    #total = 0;
    #prevButton;
    #nextButton;
    #region;
    #slot;
  
    // Bound event handlers
    _boundPrev;
    _boundNext;
    _boundKeyDown;
    _boundSlotChange;
  
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          :host {
            display: block;
            max-width: 600px;
            margin: auto;
            --carousel-button-bg: rgba(0,0,0,0.5);
            --carousel-button-color: #fff;
            --carousel-button-size: 2rem;
            --carousel-transition-duration: 0.3s;
          }
          .carousel { position: relative; overflow: hidden; }
          .viewport {
            display: flex;
            width: 100%;
            transition: transform var(--carousel-transition-duration) ease;
          }
          ::slotted(img) { flex: 0 0 100%; display: none; width: 100%; height: auto; }
          ::slotted([aria-hidden="false"]) { display: block; }
          button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: var(--carousel-button-bg);
            border: none;
            color: var(--carousel-button-color);
            font-size: var(--carousel-button-size);
            padding: 0.5em;
            cursor: pointer;
          }
          button:focus { outline: 2px solid gold; }
          .prev { left: 0.5em; }
          .next { right: 0.5em; }
        </style>
        <div class="carousel" role="region" aria-roledescription="carousel" aria-label="Image Carousel" tabindex="0" part="container">
          <button part="prev-button" class="prev" aria-label="Previous Slide">‹</button>
          <div class="viewport" part="viewport">
            <slot></slot>
          </div>
          <button part="next-button" class="next" aria-label="Next Slide">›</button>
        </div>
      `;
  
      this.#region = shadow.querySelector('.carousel');
      this.#prevButton = shadow.querySelector('.prev');
      this.#nextButton = shadow.querySelector('.next');
      this.#slot = shadow.querySelector('slot');
  
      // Bind handlers
      this._boundPrev = this.prev.bind(this);
      this._boundNext = this.next.bind(this);
      this._boundKeyDown = this.#onKeydown.bind(this);
      this._boundSlotChange = this.#initialize.bind(this);
    }
  
    connectedCallback() {
      this.#slot.addEventListener('slotchange', this._boundSlotChange);
      if (this.#slot.assignedElements().length) {
        this._boundSlotChange();
      }
    }
  
    disconnectedCallback() {
      this.#prevButton.removeEventListener('click', this._boundPrev);
      this.#nextButton.removeEventListener('click', this._boundNext);
      this.#region.removeEventListener('keydown', this._boundKeyDown);
      this.#slot.removeEventListener('slotchange', this._boundSlotChange);
    }
  
    #initialize() {
      this.#slides = this.#slot.assignedElements();
      this.#total = this.#slides.length;
      // Register event listeners
      this.#prevButton.addEventListener('click', this._boundPrev);
      this.#nextButton.addEventListener('click', this._boundNext);
      this.#region.addEventListener('keydown', this._boundKeyDown);
      // Initial render
      this.#updateSlides();
    }
  
    #updateSlides() {
      const viewport = this.shadowRoot.querySelector('.viewport');
      this.#slides.forEach((slide, i) => {
        const isActive = i === this.#currentIndex;
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        slide.setAttribute('tabindex', isActive ? '0' : '-1');
        slide.setAttribute('role', 'group');
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${i + 1} of ${this.#total}`);
        slide.setAttribute('part', 'slide');
      });
      this.#region.setAttribute('aria-label', `Slide ${this.#currentIndex + 1} of ${this.#total}`);
      viewport.style.transform = `translateX(-${this.#currentIndex * 100}%)`;
    }
  
    prev() {
      this.#currentIndex = (this.#currentIndex - 1 + this.#total) % this.#total;
      this.#updateSlides();
    }
  
    next() {
      this.#currentIndex = (this.#currentIndex + 1) % this.#total;
      this.#updateSlides();
    }
  
    #onKeydown(event) {
      switch (event.key) {
        case 'ArrowLeft':
          this.prev();
          event.preventDefault();
          break;
        case 'ArrowRight':
          this.next();
          event.preventDefault();
          break;
      }
    }
  }
  
  customElements.define('accessible-carousel', AccessibleCarousel);
  