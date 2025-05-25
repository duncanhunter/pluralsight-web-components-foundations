const starRatingStyles = new CSSStyleSheet();
starRatingStyles.replaceSync(`
    [part="star"] {
        cursor: pointer;
    }
    :host[readonly] {
        pointer-events: none;
    }
    :host[required] label::after {
        content: " *";
        color: red;
    }
    :host(:state(touched):invalid) div[role="radiogroup"] {
        border: 2px solid red;
    }
    ::slotted([slot="label"]) {
        font-weight: bold;
    }
`);

const template = document.createElement('template');
template.innerHTML = `
    <label id="label">
        <slot name="label"></slot>
    </label>
    <div aria-labelledby="label" role="radiogroup">
        <span part="star" role="radio" data-star="1" aria-checked="false">☆</span>
        <span part="star" role="radio" data-star="2" aria-checked="false">☆</span>
        <span part="star" role="radio" data-star="3" aria-checked="false">☆</span>
        <span part="star" role="radio" data-star="4" aria-checked="false">☆</span>
        <span part="star" role="radio" data-star="5" aria-checked="false">☆</span>
    </div>
`;

export class StarRating extends HTMLElement {
    #value = 0;
    #internals;

    static formAssociated = true;
    static get observedAttributes() {
        return ['value', 'disabled', 'required'];
    }

    get value() {
        return this.#value;
    }

    set value(val) {
        this.#value = +val;
        this.#internals.setFormValue(String(this.#value));
        this.#updateDisplay();
    }

    get required() {
        return this.hasAttribute('required');
    }

    set required(value) {
        value ? this.setAttribute('required', '') : this.removeAttribute('required');
        this.#updateValidity();
    }

    constructor() {
        super();

        this.#internals = this.attachInternals();
        this.attachShadow({ mode: 'open', delegatesFocus: true });
        this.shadowRoot.adoptedStyleSheets = [starRatingStyles];
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.addEventListener('click', this);
        this.shadowRoot.addEventListener('focusout', this);

        const initialValue = this.hasAttribute('value') ? +this.getAttribute('value') : 0;
        this.#internals.setFormValue(String(initialValue));
        this.#updateDisplay();
        this.#updateValidity();
    }

    disconnectedCallback() {
        this.shadowRoot.removeEventListener('click', this);
        this.shadowRoot.removeEventListener('focusout', this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
            this.#value = +newValue;
            this.#internals.setFormValue(String(this.#value));
            this.#updateDisplay();
            this.#updateValidity();
        } else if (name === 'required') {
            this.#updateDisplay();
            this.#updateValidity();
        }
    }

    formResetCallback() {
        this.#value = +this.getAttribute('value') ?? 0;
        this.#internals.setFormValue(String(this.#value));
        this.#updateDisplay();
        this.#updateValidity();
        this.#internals.states.delete('touched');
    }

    handleEvent(event) {
        if (event.type === 'click') {
            const selectedStar = event.target.closest('[data-star]');
            if (!selectedStar) return;

            this.#value = +selectedStar.dataset.star;
            this.#internals.setFormValue(String(this.#value));
            this.#updateDisplay(true);
            this.#updateValidity();
        } else if (event.type === 'focusout') {
            this.#internals.states.add('touched');
        }
    }

    #updateDisplay(shouldFocus = false) {
        this.shadowRoot.querySelectorAll('[role="radio"]').forEach((star, index) => {
            const starValue = +star.dataset.star;
            const isSelectedStar = starValue === this.#value;
            const isFilledStar = starValue <= this.#value;

            if (isSelectedStar) {
                star.setAttribute('aria-checked', 'true');
                star.textContent = '★';
                star.setAttribute('tabindex', '0');
                star.setAttribute('part', 'star selected-star');

                if (shouldFocus) {
                    star.focus();
                }
            } else {
                star.setAttribute('aria-checked', 'false');
                star.textContent = isFilledStar ? '★' : '☆';
                star.setAttribute('part', 'star');
                if (this.#value === 0 && index === 0) {
                    star.setAttribute('tabindex', '0');
                } else {
                    star.removeAttribute('tabindex');
                }
            }
        });
    }

    #updateValidity() {
        const isValid = !this.hasAttribute('required') || this.#value > 0;

        if (isValid) {
            this.#internals.setValidity({});
        } else {
            this.#internals.setValidity(
                { valueMissing: true },
                'Please select a rating',
                this.shadowRoot.querySelector('[role="radio"][tabindex="0"]')
            );
        }
    }
}

customElements.define('star-rating', StarRating);