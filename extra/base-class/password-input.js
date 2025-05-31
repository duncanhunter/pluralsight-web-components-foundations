import { ReactiveElement, css, html } from './reactive-element.js';

class PasswordInput extends ReactiveElement {
  static formAssociated = true;
  
  static properties = {
    value: { type: String, default: '' },
    name: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    minlength: { type: Number, reflect: true },
    maxlength: { type: Number, reflect: true },
    pattern: { type: String, reflect: true },
    showPassword: { type: Boolean },
    showStrength: { type: Boolean },
    label: { type: String }
  };

  static styles = css`
    :host {
      display: block;
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.25rem;
      font-weight: 500;
    }
    
    .input-wrapper {
      position: relative;
    }
    
    input {
      width: 100%;
      padding: 0.5rem 2.5rem 0.5rem 0.75rem;
      font-size: 1rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
    }
    
    input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    :host(:state(error)) input {
      border-color: #ef4444;
    }
    
    .toggle {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: 0.25rem;
      cursor: pointer;
      color: #6b7280;
    }
    
    .toggle:hover {
      color: #374151;
    }
    
    .strength {
      margin-top: 0.5rem;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }
    
    .strength-bar {
      height: 100%;
      transition: width 0.3s, background-color 0.3s;
    }
    
    .strength-bar.weak { width: 33%; background: #ef4444; }
    .strength-bar.medium { width: 66%; background: #f59e0b; }
    .strength-bar.strong { width: 100%; background: #10b981; }
    
    .requirements {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }
    
    .requirement {
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .requirement.met {
      color: #10b981;
    }
    
    .error {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
  `;

  validate() {
    const v = {
      valueMissing: this.required && !this.value,
      tooShort: this.minlength && this.value.length < this.minlength,
      tooLong: this.maxlength && this.value.length > this.maxlength,
      patternMismatch: this.pattern && !new RegExp(this.pattern).test(this.value),
      valid: true
    };
    
    v.valid = !v.valueMissing && !v.tooShort && !v.tooLong && !v.patternMismatch;
    return v;
  }

  getPasswordStrength() {
    if (!this.value) return '';
    
    let strength = 0;
    
    // Length check
    if (this.value.length >= 8) strength++;
    if (this.value.length >= 12) strength++;
    
    // Character variety
    if (/[a-z]/.test(this.value)) strength++;
    if (/[A-Z]/.test(this.value)) strength++;
    if (/[0-9]/.test(this.value)) strength++;
    if (/[^a-zA-Z0-9]/.test(this.value)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  getRequirements() {
    return [
      { 
        label: `At least ${this.minlength || 8} characters`,
        met: this.value.length >= (this.minlength || 8)
      },
      { 
        label: 'One uppercase letter',
        met: /[A-Z]/.test(this.value)
      },
      { 
        label: 'One lowercase letter',
        met: /[a-z]/.test(this.value)
      },
      { 
        label: 'One number',
        met: /[0-9]/.test(this.value)
      },
      { 
        label: 'One special character',
        met: /[^a-zA-Z0-9]/.test(this.value)
      }
    ];
  }

  handleInput(e) {
    this.value = e.target.value;
    this.touched = true;
  }

  handleBlur() {
    this.touched = true;
  }

  toggleVisibility() {
    this.showPassword = !this.showPassword;
  }

  render() {
    const hasError = this.touched && !this.validity.valid;
    const strength = this.getPasswordStrength();
    const requirements = this.getRequirements();
    
    return html`
      ${this.label ? html`
        <label for="input" part="label">
          ${this.label}
          ${this.required ? html`<span style="color: #ef4444">*</span>` : ''}
        </label>
      ` : ''}
      
      <div class="input-wrapper">
        <input
          id="input"
          part="input"
          type="${this.showPassword ? 'text' : 'password'}"
          value="${this.value}"
          placeholder="${this.showPassword ? 'Your password' : '••••••••'}"
          minlength="${this.minlength || ''}"
          maxlength="${this.maxlength || ''}"
          aria-invalid="${hasError}"
          aria-describedby="${hasError ? 'error' : ''}"
          @input="handleInput"
          @blur="handleBlur"
        />
        
        <button
          type="button"
          class="toggle"
          part="toggle"
          @click="toggleVisibility"
          aria-label="${this.showPassword ? 'Hide password' : 'Show password'}"
        >
          ${this.showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      
      ${this.showStrength && this.value ? html`
        <div class="strength" part="strength">
          <div class="strength-bar ${strength}" part="strength-bar"></div>
        </div>
      ` : ''}
      
      ${this.showStrength && this.value && !hasError ? html`
        <div class="requirements" part="requirements">
          ${requirements.map(req => html`
            <div class="requirement ${req.met ? 'met' : ''}">
              <span>${req.met ? '✓' : '○'}</span>
              <span>${req.label}</span>
            </div>
          `)}
        </div>
      ` : ''}
      
      ${hasError ? html`
        <div id="error" class="error" part="error" role="alert">
          ${this.validationMessage}
        </div>
      ` : ''}
    `;
  }
}

customElements.define('password-input', PasswordInput);