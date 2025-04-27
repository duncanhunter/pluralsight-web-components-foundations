# Pluralsight Course: Web Component Fundamentals
**Building an Accessible Carousel Demo**
**Total Duration:** ~67 minutes

---

## Module 1: Introduction to Web Components (10 min)

### Clip 1.1: What Are Web Components? (2 min)
- **Script:**
  > "Welcome to Web Component Fundamentals! In this module, we'll explore the core technologies that power Web Components: Custom Elements, Shadow DOM, HTML Templates, and ES Modules. Web Components let you build reusable, encapsulated UI widgets that work across frameworks and vanilla JS. Throughout this course, we'll use vanilla JavaScript without abstractions to understand the fundamentals clearly. While libraries like Lit and Stencil can reduce boilerplate, mastering the core APIs first will make you more effective with any tooling."
- **Slides:**
  1. Definition & Benefits
  2. Browser support matrix (Chrome, Firefox, Edge, Safari)
  3. Four specs: Custom Elements, Shadow DOM, Templates, Modules
  4. Vanilla approach vs. Libraries (Lit, Stencil) comparison
- **Demo Code (v1):**
  ```js
  class MyElement extends HTMLElement {}
  customElements.define('my-element', MyElement);
  ```

### Clip 1.2: Component Lifecycle Hooks (3 min)
- **Script:**
  > "Custom Elements expose lifecycle callbacks—`connectedCallback`, `disconnectedCallback`, and `attributeChangedCallback`—that let you tie behavior to your component's insertion, removal, and attribute updates. We'll implement these directly, though it's worth noting that libraries like Lit provide decorators and base classes that streamline this pattern."
- **Slides:**
  - `connectedCallback` / `disconnectedCallback` / `attributeChangedCallback`
  - `static get observedAttributes()`
  - How libraries reduce lifecycle boilerplate
- **Demo Code (v2):**
  ```js
  class MyElement extends HTMLElement {
    static get observedAttributes() { return ['value']; }
    connectedCallback() { console.log('inserted'); }
    disconnectedCallback() { console.log('removed'); }
    attributeChangedCallback(name, oldVal, newVal) {
      console.log(name, newVal);
    }
  }
  customElements.define('my-element', MyElement);
  ```

### Clip 1.3: Minimal Light-DOM Carousel Shell (5 min)
**Goal:** Get a working carousel with the same private-field API as our final component—but no Shadow DOM yet.
1. **Script:**
   > "Let's implement the simplest version of our carousel—no Shadow DOM yet, just private fields and arrow-method handlers. This gives us a working demo in under 30 lines, with the same API shape as our full component. While libraries like Lit and Stencil would handle much of this templating and state management for us, building in vanilla JS helps us understand what's happening under the hood. We'll point out where these libraries would simplify our code throughout the course."
2. **Slides:**
   - Why mirror your final API early (private fields, arrow handlers)
   - Light-DOM vs Shadow-DOM trade-offs
   - Library benefits preview (reactive properties, template handling)
3. **Demo Code (v3):**
   ```js
   class AccessibleCarousel extends HTMLElement {
     #slides = [];
     #currentIndex = 0;
     #total = 0;
     #prevButton;
     #nextButton;

     // Core methods, auto-bound via arrow syntax
     prev = () => {
       this.#currentIndex =
         (this.#currentIndex - 1 + this.#total) % this.#total;
       this.#updateSlides();
     };

     next = () => {
       this.#currentIndex = (this.#currentIndex + 1) % this.#total;
       this.#updateSlides();
     };

     // Set up slides & buttons
     #initialize = () => {
       this.#slides = Array.from(this.querySelectorAll('img'));
       this.#total = this.#slides.length;
       if (!this.#prevButton) {
         this.insertAdjacentHTML(
           'beforeend',
           '<button class="prev">‹</button>' +
           '<button class="next">›</button>'
         );
       }
       this.#prevButton = this.querySelector('.prev');
       this.#nextButton = this.querySelector('.next');
       this.#prevButton.addEventListener('click', this.prev);
       this.#nextButton.addEventListener('click', this.next);
       this.#updateSlides();
     };

     // Show/hide based on index
     #updateSlides = () => {
       this.#slides.forEach((slide, i) => {
         slide.style.display = i === this.#currentIndex ? '' : 'none';
       });
     };

     connectedCallback() {
       this.#initialize();
     }
   }
   customElements.define('accessible-carousel', AccessibleCarousel);
   ```
4. **Result:**
   Drop `<accessible-carousel><img…/><img…/><img…/></accessible-carousel>` into the page—you get Prev/Next functionality.
5. **Next:**
   Module 2 will encapsulate this in Shadow DOM and add styling.

---

## Module 2: Shadow DOM, Styling & Slotting (20 min)

### Clip 2.1: Shadow DOM Basics (5 min)
- **Script:**
  > "Shadow DOM provides encapsulation for markup, style, and behavior. By attaching a shadow root, you isolate styles from the page and other components."
- **Slides:**
  - `open` vs. `closed` mode
  - Shadow DOM tree diagram
- **Demo Code (v4):**
  ```js
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        .viewport { /* ... */ }
        img { /* ... */ }
      </style>
      <div class="viewport"><slot></slot></div>
    `;
  }
  ```

### Clip 2.2: CSS Parts & Custom Properties (5 min)
- **Script:**
  > "CSS Parts expose specific Shadow-DOM elements for styling, and custom properties let consumers theme your component."
- **Slides:**
  - `part="..."` attribute usage
  - Custom property cascading (`--carousel-button-color`)
- **Demo Code (v5):**
  ```html
  <!-- in shadow DOM -->
  <button part="prev-button">‹</button>
  <button part="next-button">›</button>
  ```
  ```css
  accessible-carousel::part(prev-button) {
    color: var(--carousel-button-color, #fff);
  }
  ```

### Clip 2.3: Constructible Stylesheets (5 min)
- **Script:**
  > "Instead of inline styles, Constructible Stylesheets offer better performance and reusability. Let's use the newer `CSSStyleSheet` API and `adoptedStyleSheets` to apply styles to our carousel."
- **Slides:**
  - Performance benefits of Constructible Stylesheets
  - Browser support comparison
- **Demo Code (v5.5):**
  ```js
  // Create and populate a stylesheet
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    :host { display: block; max-width: 600px; margin: auto; }
    .carousel { position: relative; overflow: hidden; }
    button:focus { outline: 2px solid gold; }
  `);
  
  // Apply the stylesheet to shadow DOM
  shadow.adoptedStyleSheets = [sheet];
  ```

### Clip 2.4: Slotting Content (5 min)
- **Script:**
  > "Slots allow consumers to inject markup. Use default and named slots for maximum flexibility. The `slotchange` event tells you when slotted content updates—perfect for rebuilding your internal slide list."
- **Slides:**
  - `<slot>` vs `<slot name="caption">`
  - slotchange event flowchart
- **Demo Code (v8):**
  ```html
  <div class="viewport"><slot></slot></div>
  <div class="caption"><slot name="caption"></slot></div>
  ```
- **Demo Code (v9):**
  ```js
  this.shadowRoot
    .querySelector('slot')
    .addEventListener('slotchange', this.#initialize);
  ```

---

## Module 3: Attributes, Properties & Reflection (10 min)

### Clip 3.1: `observedAttributes` & `attributeChangedCallback` (5 min)
- **Script:**
  > "Use `observedAttributes` and `attributeChangedCallback` to react when users change HTML attributes."
- **Slides:**
  - Attribute → property mapping
  - Boolean vs string attributes
- **Demo Code (v6):**
  ```js
  static get observedAttributes() {
    return ['autoplay', 'interval'];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'autoplay') {
      this.autoplay = newVal !== null;
    }
    if (name === 'interval') {
      this.interval = Number(newVal) || 5000;
    }
  }
  ```

### Clip 3.2: Getter/Setter Reflection (5 min)
- **Script:**
  > "Define getters/setters to reflect properties ↔ attributes so JS and HTML stay in sync."
- **Slides:**
  - Boolean attribute pattern
  - Numeric attribute pattern
- **Demo Code (v7):**
  ```js
  get autoplay() {
    return this.hasAttribute('autoplay');
  }
  set autoplay(val) {
    if (Boolean(val)) this.setAttribute('autoplay', '');
    else this.removeAttribute('autoplay');
  }

  get interval() {
    return Number(this.getAttribute('interval')) || 5000;
  }
  set interval(ms) {
    const n = Number(ms);
    if (!isNaN(n) && n > 0) this.setAttribute('interval', String(n));
    else this.removeAttribute('interval');
  }
  ```

---

## Module 4: Advanced Accessibility Patterns (9 min)

https://www.w3.org/WAI/ARIA/apg/patterns/carousel/examples/carousel-1-prev-next/

### Clip 4.1: Keyboard Navigation & ARIA Roles (3 min)
- **Script:**
  > "Make your carousel usable by keyboard and screen readers: add `role="region"`, `aria-roledescription="carousel"`, and arrow-key handlers."
- **Slides:**
  - ARIA role tree diagram
  - Example keydown handler snippet
- **Demo Code (v10):**
  ```js
  this.shadowRoot
    .querySelector('.carousel')
    .addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') this.next();
      if (e.key === 'ArrowLeft') this.prev();
    });
  ```

### Clip 4.2: Focus Delegation & `internals.states` (3 min)
- **Script:**
  > "Use `delegatesFocus: true` so `focus()` on the host goes straight into the carousel. Then demo `attachInternals()` + `internals.states.add('playing')` to expose a pseudo-state for styling."
- **Slides:**
  - Focus delegation diagram
  - Pseudo-state styling example (`:host(:state(playing)) .controls`)
- **Demo Code (v11):**
  ```js
  this.attachShadow({ mode: 'open', delegatesFocus: true });
  this._internals = this.attachInternals();
  this._internals.states.add('playing');
  ```

### Clip 4.3: ARIA Live-Region Updates (3 min)
- **Script:**
  > "Announce slide changes via `internals.ariaLive = 'polite'` and updating `internals.ariaLabel` so screen readers read out each new slide."
- **Slides:**
  - Live-region best practices
- **Demo Code (v12):**
  ```js
  this._internals.ariaLive = 'polite';
  this._internals.ariaAtomic = 'true';
  this._internals.ariaLabel = `Slide ${this.#currentIndex + 1} of ${this.#total}`;
  ```

---

## Module 5: Form Association & Native Input Behaviors (8 min)

### Clip 5.1: Form Association Fundamentals (3 min)
- **Script:**
  > "Web components can participate in forms just like native inputs through the ElementInternals API. Let's create a custom input that works with standard form validation and submission."
- **Slides:**
  - ElementInternals API diagram
  - formAssociated static property
  - Form lifecycle events
- **Demo Code (v13):**
  ```js
  class MyInput extends HTMLElement {
    static formAssociated = true;
    #internals;
    
    constructor() {
      super();
      this.#internals = this.attachInternals();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: inline-block;
          }
          input {
            padding: 8px;
            border: 2px solid #ccc;
            border-radius: 4px;
          }
          input:focus {
            outline: none;
            border-color: #0066ff;
          }
          :host([invalid]) input {
            border-color: #ff0000;
          }
        </style>
        <input type="text">
      `;
    }
  }
  customElements.define('my-input', MyInput);
  ```

### Clip 5.2: Value & Validity States (3 min)
- **Script:**
  > "Let's implement value handling and validation to mirror native input functionality. We'll reflect values between the internal input and form data, and manage validity states."
- **Slides:**
  - Form validation flow diagram
  - Validity states list
- **Demo Code (v14):**
  ```js
  class MyInput extends HTMLElement {
    static formAssociated = true;
    #internals;
    #input;
    
    constructor() {
      // ...existing code...
      this.#input = this.shadowRoot.querySelector('input');
      
      // Handle internal input changes
      this.#input.addEventListener('input', () => {
        this.value = this.#input.value;
      });
    }
    
    // Value getters and setters
    get value() {
      return this.#input?.value;
    }
    
    set value(val) {
      if (this.#input) {
        this.#input.value = val;
        this.#internals.setFormValue(val);
        
        // Update validation state
        this.#validate();
      }
    }
    
    #validate() {
      const isValid = this.required ? this.value.trim().length > 0 : true;
      
      if (!isValid) {
        this.#internals.setValidity({
          valueMissing: true
        }, 'This field is required', this.#input);
      } else {
        this.#internals.setValidity({});
      }
      
      return isValid;
    }
    
    // Reflect the required attribute
    get required() {
      return this.hasAttribute('required');
    }
    
    set required(val) {
      if (val) {
        this.setAttribute('required', '');
      } else {
        this.removeAttribute('required');
      }
      // Re-validate when required state changes
      this.#validate();
    }
    
    // Form control states
    formResetCallback() {
      this.value = '';
    }
    
    formStateRestoreCallback(state) {
      this.value = state;
    }
  }
  customElements.define('my-input', MyInput);
  ```

### Clip 5.3: Custom Events & Form Integration (2 min)
- **Script:**
  > "Complete the native input experience by dispatching the right events at the right time and supporting labels through the ElementInternals API."
- **Slides:**
  - Event lifecycle flowchart
  - Form events diagram (submit, reset, invalid)
- **Demo Code (v15):**
  ```js
  class MyInput extends HTMLElement {
    // ...existing code...
    
    constructor() {
      // ...existing code...
      
      // Input event handling
      this.#input.addEventListener('input', () => {
        this.value = this.#input.value;
        
        // Dispatch custom events that mirror native behavior
        this.dispatchEvent(new Event('input', { bubbles: true }));
        this.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Focus events
      this.#input.addEventListener('focus', () => {
        this.dispatchEvent(new Event('focus', { bubbles: true }));
      });
      
      this.#input.addEventListener('blur', () => {
        this.#validate(); // Validate on blur
        this.dispatchEvent(new Event('blur', { bubbles: true }));
      });
    }
    
    // Support form.elements access
    get form() {
      return this.#internals.form;
    }
    
    get validity() {
      return this.#internals.validity;
    }
    
    reportValidity() {
      return this.#internals.reportValidity();
    }
  }
  customElements.define('my-input', MyInput);
  ```

---

## Module 6: Templates and Server-Side Rendering (10 min)

### Clip 6.1: HTML Templates & Template Strings (5 min)
- **Script:**
  > "Let's explore how to define component markup more efficiently with both HTML's `<template>` elements and JavaScript template literals. Our carousel uses template literals for flexibility, but both approaches have their benefits."
- **Slides:**
  - HTML `<template>` vs. JS template strings
  - When to use each approach
- **Demo Code (v16):**
  ```js
  // Using HTML template element approach
  const template = document.createElement('template');
  template.innerHTML = `
    <div class="carousel" role="region">
      <div class="viewport"><slot></slot></div>
    </div>
  `;
  
  // In constructor
  this.shadowRoot.appendChild(template.content.cloneNode(true));
  ```
  ```js
  // Using template string approach (as in carousel.js)
  shadow.innerHTML = `
    <div class="carousel" role="region" aria-roledescription="carousel">
      <div class="viewport" part="viewport"><slot></slot></div>
      <!-- Other elements -->
    </div>
  `;
  ```

### Clip 6.2: Declarative Shadow DOM & SSR (5 min)
- **Script:**
  > "For server rendering, Declarative Shadow DOM lets us serialize components with their shadow roots intact. Let's see how our carousel works with SSR tools like Happy DOM."
- **Slides:**
  - Declarative Shadow DOM syntax
  - SSR workflow diagram
- **Demo Code (v17):**
  ```html
  <!-- Component with serialized shadow DOM -->
  <accessible-carousel>
    <template shadowrootmode="open">
      <div class="carousel" role="region">
        <div class="viewport"><slot></slot></div>
        <div class="controls">
          <button class="prev">‹</button>
          <button class="next">›</button>
        </div>
      </div>
    </template>
    <img src="slide1.jpg" alt="Slide 1">
    <img src="slide2.jpg" alt="Slide 2">
  </accessible-carousel>
  ```
  ```js
  // Server-side rendering with Happy DOM (simplified)
  import { Window } from 'happy-dom';
  const window = new Window();
  
  // Register component
  // ...import carousel class...
  
  // Render to HTML with shadow DOM
  document.body.innerHTML = `<accessible-carousel>...</accessible-carousel>`;
  const html = document.body.getHTML({ serializableShadowRoots: true });
  ```
