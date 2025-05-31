import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('lit-star-rating')
export class LitStarRating extends LitElement {
    static formAssociated = true;
    static styles = css`
    [part="star"] {
      cursor: pointer;
    }
    :host([readonly]) {
      pointer-events: none;
    }
    :host([required]) label::after {
      content: " *";
      color: red;
    }
    :host(:state(touched):invalid) div[role="radiogroup"] {
      border: 2px solid red;
    }
    ::slotted([slot="label"]) {
      font-weight: bold;
    }
  `;

    @property({ type: Number, reflect: true }) value = 0;
    @property({ type: Boolean, reflect: true }) required = false;
    @property({ type: Boolean, reflect: true }) readonly = false;

    @state() #touched = false;
    #internals = this.attachInternals?.() ?? null;

    updated() {
        if (this.#internals) {
            if (this.#touched) {
                this.#internals.states.add('touched');
            } else {
                this.#internals.states.delete('touched');
            }
            this.#internals.setFormValue(String(this.value));
            if (this.required && this.value === 0) {
                this.#internals.setValidity(
                    { valueMissing: true },
                    'Please select a rating',
                    this.renderRoot.querySelector('[role="radio"][tabindex="0"]')
                );
            } else {
                this.#internals.setValidity({});
            }
        }
    }

    render() {
        return html`
      <label id="label">
        <slot name="label"></slot>
      </label>
      <div
        aria-labelledby="label"
        role="radiogroup"
        aria-required="${this.required ? 'true' : 'false'}"
        @click=${this.#onClick}
        @focusout=${this.#onFocusOut}
      >
        ${[1, 2, 3, 4, 5].map(i => html`
          <span
            part="star${this.value === i ? ' selected-star' : ''}"
            role="radio"
            data-star="${i}"
            aria-checked="${this.value === i ? 'true' : 'false'}"
            tabindex="${this.value === 0 && i === 1 || this.value === i ? '0' : '-1'}"
            @keydown=${this.#onKeyDown}
          >${i <= this.value ? '★' : '☆'}</span>
        `)}
      </div>
    `;
    }

    #onClick = (e) => {
        if (this.readonly) return;
        const star = (e.target).closest('[data-star]');
        if (!star) return;
        this.value = +star.dataset.star;
        this.#touched = true;
    };

    #onFocusOut = () => {
        this.#touched = true;
    };

    #onKeyDown = (e) => {
        if (this.readonly) return;
        const stars = Array.from(this.renderRoot.querySelectorAll('[role="radio"]'));
        const current = stars.findIndex(star => star.tabIndex === 0);
        let next = current;
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            next = Math.min(current + 1, stars.length - 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            next = Math.max(current - 1, 0);
        } else if (e.key === 'Home') {
            next = 0;
        } else if (e.key === 'End') {
            next = stars.length - 1;
        } else if (e.key === ' ' || e.key === 'Enter') {
            this.value = current + 1;
            this.#touched = true;
            e.preventDefault();
            return;
        }
        if (next !== current) {
            stars[next].focus();
            e.preventDefault();
        }
    };

    formResetCallback?() {
        this.value = 0;
        this.#touched = false;
    }
}