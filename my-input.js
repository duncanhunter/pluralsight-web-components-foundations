/**
 * MyInput - A form-associated custom element
 * 
 * Demonstrates form integration for web components including:
 * - Form association via ElementInternals API
 * - Value handling and reflection
 * - Form validation
 * - Event propagation matching native inputs
 */
class MyInput extends HTMLElement {
  // Enable form association
  static formAssociated = true;
  
  // Private fields
  #internals;
  #input;
  
  // Initialize list of attributes to observe
  static get observedAttributes() {
    return ['required', 'disabled', 'placeholder', 'type', 'value'];
  }
  
  constructor() {
    super();
    
    // Set up ElementInternals
    this.#internals = this.attachInternals();
    
    // Create shadow DOM with focus delegation
    this.attachShadow({ mode: 'open', delegatesFocus: true });
    
    // Set up the component structure and styling
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          width: 200px;
        }
        
        input {
          width: 100%;
          padding: 8px;
          border: 2px solid #ccc;
          border-radius: 4px;
          font-family: inherit;
          font-size: inherit;
          box-sizing: border-box;
        }
        
        input:focus {
          outline: none;
          border-color: #0066ff;
        }
        
        :host([invalid]) input {
          border-color: #ff0000;
        }
        
        :host(:focus-within) {
          outline: 2px solid transparent;
        }
        
        :host([disabled]) input {
          background-color: #f0f0f0;
          color: #888;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #ff0000;
          font-size: 0.8em;
          margin-top: 4px;
          display: none;
        }
        
        :host([invalid]) .error-message {
          display: block;
        }
      </style>
      <input type="text" part="input">
      <div class="error-message" part="error"></div>
    `;
    
    // Store the reference to the internal input
    this.#input = this.shadowRoot.querySelector('input');
    
    // Set up event listeners
    this.#setupEventListeners();
  }
  
  #setupEventListeners() {
    // Handle input events
    this.#input.addEventListener('input', () => {
      // Update the form value and dispatch events
      this.value = this.#input.value;
      this.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // Handle change events (only fires on blur or Enter)
    this.#input.addEventListener('change', () => {
      this.dispatchEvent(new Event('change', { bubbles: true }));
    });
    
    // Handle focus events
    this.#input.addEventListener('focus', () => {
      this.dispatchEvent(new Event('focus', { bubbles: true }));
    });
    
    // Handle blur events
    this.#input.addEventListener('blur', () => {
      this.#validate(); // Validate on blur for better UX
      this.dispatchEvent(new Event('blur', { bubbles: true }));
    });
  }
  
  /**
   * Validate the current input value
   * @returns {boolean} Whether the input is valid
   */
  #validate() {
    const errorMessageEl = this.shadowRoot.querySelector('.error-message');
    
    // Different validation strategies based on input type
    let isValid = true;
    let message = '';
    
    // Required validation
    if (this.required && !this.value.trim()) {
      isValid = false;
      message = 'This field is required';
    }
    
    // Update error message
    errorMessageEl.textContent = message;
    
    // Update form validation state
    if (!isValid) {
      this.#internals.setValidity(
        { valueMissing: true }, 
        message,
        this.#input
      );
      this.setAttribute('invalid', '');
    } else {
      this.#internals.setValidity({});
      this.removeAttribute('invalid');
    }
    
    return isValid;
  }
  
  // Lifecycle callbacks
  
  connectedCallback() {
    // Initialize validation state
    this.#validate();
    
    // Initialize attributes on the internal input
    if (this.hasAttribute('placeholder')) {
      this.#input.placeholder = this.getAttribute('placeholder');
    }
    
    if (this.hasAttribute('type')) {
      this.#input.type = this.getAttribute('type');
    }
    
    if (this.hasAttribute('value')) {
      this.value = this.getAttribute('value');
    }
    
    if (this.hasAttribute('disabled')) {
      this.#input.disabled = true;
    }
    
    if (this.hasAttribute('required')) {
      this.#input.required = true;
    }
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    // Handle attribute changes
    switch (name) {
      case 'disabled':
        this.#input.disabled = this.hasAttribute('disabled');
        break;
      case 'required':
        this.#input.required = this.hasAttribute('required');
        this.#validate();
        break;
      case 'placeholder':
        this.#input.placeholder = newValue || '';
        break;
      case 'type':
        // Only allow certain types that make sense for this component
        const allowedTypes = ['text', 'email', 'password', 'search', 'tel', 'url'];
        this.#input.type = allowedTypes.includes(newValue) ? newValue : 'text';
        break;
      case 'value':
        if (this.value !== newValue) {
          this.value = newValue || '';
        }
        break;
    }
  }
  
  // Form-related callbacks
  
  formResetCallback() {
    // Reset to initial or empty value when form is reset
    this.value = this.getAttribute('value') || '';
  }
  
  formStateRestoreCallback(state) {
    // Restore saved state (e.g., after navigation)
    this.value = state;
  }
  
  // Properties and attribute reflections
  
  get value() {
    return this.#input?.value || '';
  }
  
  set value(val) {
    if (this.#input) {
      this.#input.value = val || '';
      // Update the form value
      this.#internals.setFormValue(val || '');
      // Re-validate with new value
      this.#validate();
    }
  }
  
  get required() {
    return this.hasAttribute('required');
  }
  
  set required(val) {
    if (val) {
      this.setAttribute('required', '');
    } else {
      this.removeAttribute('required');
    }
  }
  
  get disabled() {
    return this.hasAttribute('disabled');
  }
  
  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
  
  get placeholder() {
    return this.getAttribute('placeholder') || '';
  }
  
  set placeholder(val) {
    this.setAttribute('placeholder', val || '');
  }
  
  get type() {
    return this.getAttribute('type') || 'text';
  }
  
  set type(val) {
    this.setAttribute('type', val || 'text');
  }
  
  // Form element properties (match native input API)
  
  get form() {
    return this.#internals.form;
  }
  
  get name() {
    return this.getAttribute('name');
  }
  
  set name(val) {
    if (val) {
      this.setAttribute('name', val);
    } else {
      this.removeAttribute('name');
    }
  }
  
  get validity() {
    return this.#internals.validity;
  }
  
  get validationMessage() {
    return this.#internals.validationMessage;
  }
  
  get willValidate() {
    return this.#internals.willValidate;
  }
  
  // Form validation methods (match native input API)
  
  checkValidity() {
    return this.#internals.checkValidity();
  }
  
  reportValidity() {
    return this.#internals.reportValidity();
  }
}

// Register the custom element
customElements.define('my-input', MyInput);