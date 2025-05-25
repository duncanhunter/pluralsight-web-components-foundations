const starRatingStyles = new CSSStyleSheet();
starRatingStyles.replaceSync(`
    [part="star"] {
        cursor: pointer;
    }
    :host[readonly] {
        pointer-events: none;
    }
    :host(:disabled) {
        opacity: 0.4;
        pointer-events: none;
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
    #initialized = false;
    #internals;
    #disabled = false;

    static formAssociated = true;
    static get observedAttributes() {
        return ['value', 'disabled'];
    }

    get value() {
        return this.#value;
    }

    set value(val) {
        // not guarding for initalised
        const numVal = +val;
        if (numVal >= 0 && numVal <= 5) {
            this.#value = numVal;
            this.#internals.setFormValue(String(numVal));
            this.#updateDisplay();
        }
    }

    get disabled() {
        return this.#disabled;
    }

    set disabled(value) {
        const isDisabled = Boolean(value);
        this.#disabled = isDisabled;

        isDisabled ? this.setAttribute('disabled', '') : this.removeAttribute('disabled');
    }

    constructor() {
        super();

        this.#internals = this.attachInternals();
        this.attachShadow({ mode: 'open', delegatesFocus: true, serializable: true });
        this.shadowRoot.adoptedStyleSheets = [starRatingStyles];
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.#initialized = true;
        this.shadowRoot.addEventListener('click', this);

        const initialValue = this.hasAttribute('value') ? +this.getAttribute('value') : 0;
        if (this.#internals) {
            this.#internals.setFormValue(String(initialValue));
        }

        this.#updateDisplay();
    }

    disconnectedCallback() {
        this.removeEventListener('click', this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
            this.#value = +newValue;

            this.#internals.setFormValue(String(this.#value));
        }
        if (name === 'disabled') {
            this.#disabled = newValue !== null;
        }
    }

    formDisabledCallback(isDisabled) {
        this.#disabled = isDisabled;
    }

    handleEvent(event) {
        if (event.type === 'click') {
            if (this.#disabled) { return };

            const selectedStar = event.target.closest('[data-star]');
            if (!selectedStar) return;

            this.#value = +selectedStar.dataset.star;


            this.#internals.setFormValue(String(this.#value));

            this.#updateDisplay(true);
        }
    }

    #updateDisplay(shouldFocus = false) {
        if (!this.#initialized) { return; }

        this.shadowRoot.querySelectorAll('[role="radio"]').forEach((star) => {
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
                star.removeAttribute('tabindex');
                star.setAttribute('part', 'star');
            }
        });
    }
}

customElements.define('star-rating', StarRating);