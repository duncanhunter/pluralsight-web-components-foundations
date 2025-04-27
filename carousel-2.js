/**
 * Accessible Carousel Web Component
 *
 * Demonstrates:
 * - Class-field arrow functions for auto-bound handlers directly on core methods
 * - Observed attributes & attributeChangedCallback
 * - Reflecting properties to attributes (and vice versa)
 * - CSS parts & custom properties
 * - Named slots for control overrides and captions
 * - Custom events on slide change
 * - Adopted stylesheet (constructible CSSStyleSheet)
 * - delegatesFocus for keyboard focus delegation
 * - ElementInternals.states pseudo-states (playing)
 * - ARIA live-region via ElementInternals.ariaLive/ariaAtomic
 *
 * @attribute autoplay   Boolean: presence reflects enabled autoplay
 * @attribute interval   Number: milliseconds between slides
 */
class AccessibleCarousel extends HTMLElement {
    static get observedAttributes() { return ['autoplay', 'interval']; }
  
    // Private state
    #slides = [];
    #currentIndex = 0;
    #total = 0;
    #intervalId = null;
    #internals;
  
    // Element references
    #region;
    #slot;
    #controlsSlot;
    #captionSlot;
    #prevButton;
    #nextButton;
  
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open', delegatesFocus: true });
      this.#internals = this.attachInternals();
      this.#internals.ariaLive = 'polite';
      this.#internals.ariaAtomic = 'true';
  
      // Setup stylesheet
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(`
        :host { display: block; max-width: 600px; margin: auto; }
        .carousel { position: relative; overflow: hidden; }
        .viewport { display: flex; width: 100%; transition: transform var(--carousel-transition-duration,0.3s) ease; }
        ::slotted(img) { flex: 0 0 100%; display: none; width:100%; height:auto; }
        ::slotted([aria-hidden="false"]) { display:block; }
        .controls { position:absolute; top:50%; width:100%; display:flex; justify-content:space-between; transform:translateY(-50%); }
        :host(:state(playing)) .controls { opacity:0.5; }
        button { background:var(--carousel-button-bg,rgba(0,0,0,0.5)); border:none; color:var(--carousel-button-color,#fff); font-size:var(--carousel-button-size,2rem); padding:0.5em; cursor:pointer; }
        button:focus { outline:2px solid gold; }
        .caption { text-align:center; margin-top:0.5em; }
      `);
      shadow.adoptedStyleSheets = [sheet];
  
      // Template
      shadow.innerHTML = `
        <div class="carousel" role="region" aria-roledescription="carousel" tabindex="0" part="container">
          <div class="viewport" part="viewport"><slot></slot></div>
          <div class="controls" part="controls">
            <slot name="controls">
              <button class="prev" aria-label="Previous Slide">‹</button>
              <button class="next" aria-label="Next Slide">›</button>
            </slot>
          </div>
          <div class="caption" part="caption"><slot name="caption"></slot></div>
        </div>
      `;
  
      // References
      this.#region       = shadow.querySelector('.carousel');
      this.#slot         = shadow.querySelector('slot:not([name])');
      this.#controlsSlot = shadow.querySelector('slot[name="controls"]');
      this.#captionSlot  = shadow.querySelector('slot[name="caption"]');
  
      // Initial rendering
      this.#initialize();
    }
  
    /**
     * Reflect `autoplay` boolean attribute ↔ property
     */
    get autoplay() {
      return this.hasAttribute('autoplay');
    }
    set autoplay(value) {
      const isOn = Boolean(value);
      if (isOn) this.setAttribute('autoplay', '');
      else this.removeAttribute('autoplay');
    }
  
    /**
     * Reflect `interval` attribute ↔ property
     */
    get interval() {
      return Number(this.getAttribute('interval')) || 5000;
    }
    set interval(ms) {
      const n = Number(ms);
      if (!isNaN(n) && n > 0) this.setAttribute('interval', String(n));
      else this.removeAttribute('interval');
    }
  
    static get observedAttributes() { return ['autoplay','interval']; }
    attributeChangedCallback(name, oldVal, newVal) {
      if (name === 'autoplay') this.#updateAutoplay();
      if (name === 'interval') this.#updateAutoplay();
    }
  
    connectedCallback() {
      this.#slot.addEventListener('slotchange', this.#initialize);
      this.#controlsSlot.addEventListener('slotchange', this.#initialize);
      this.#region.addEventListener('keydown', this.#onKeydown);
      this.#updateAutoplay();
    }
  
    disconnectedCallback() {
      this.#removeListeners();
      this._internals.states.delete('playing');
      this.#clearAutoplay();
    }
  
    // Core setup
    #initialize = () => {
      this.#slides = this.#slot.assignedElements();
      this.#total  = this.#slides.length;
      const [prev, next] = this.shadowRoot.querySelectorAll('.prev, .next');
      this.#prevButton = prev; this.#nextButton = next;
      this.#removeListeners();
      this.#prevButton.addEventListener('click', this.prev);
      this.#nextButton.addEventListener('click', this.next);
      this.#updateSlides();
    }
  
    prev = () => { this.#move(-1); };
    next = () => { this.#move(+1); };
    #move(delta) {
      this.#currentIndex = (this.#currentIndex + delta + this.#total) % this.#total;
      this.#updateSlides();
    }
  
    #onKeydown = (e) => {
      if (e.key === 'ArrowLeft') { this.prev(); e.preventDefault(); }
      if (e.key === 'ArrowRight'){ this.next(); e.preventDefault(); }
    };
  
    #removeListeners() {
      if (this.#prevButton) this.#prevButton.removeEventListener('click', this.prev);
      if (this.#nextButton) this.#nextButton.removeEventListener('click', this.next);
    }
  
    #updateSlides() {
      const label = `Slide ${this.#currentIndex+1} of ${this.#total}`;
      this.#internals.ariaLabel = label;
      const vp = this.shadowRoot.querySelector('.viewport');
      this.#slides.forEach((sl,i)=>{
        const active = i===this.#currentIndex;
        sl.toggleAttribute('aria-hidden', !active);
        sl.tabIndex = active?0:-1;
        sl.setAttribute('role','group');
        sl.setAttribute('aria-roledescription','slide');
        sl.setAttribute('aria-label', `${i+1} of ${this.#total}`);
        sl.setAttribute('part','slide');
      });
      vp.style.transform = `translateX(-${this.#currentIndex*100}%)`;
      this.dispatchEvent(new CustomEvent('slidechange',{detail:{index:this.#currentIndex}}));
    }
  
    #updateAutoplay() {
      this.#clearAutoplay();
      if (this.autoplay) {
        this.#internals.states.add('playing');
        this.#intervalId = setInterval(this.next, this.interval);
      } else {
        this.#internals.states.delete('playing');
      }
    }
  
    #clearAutoplay() {
      if (this.#intervalId) { clearInterval(this.#intervalId); this.#intervalId=null; }
    }
  }
  
  customElements.define('accessible-carousel', AccessibleCarousel);
  