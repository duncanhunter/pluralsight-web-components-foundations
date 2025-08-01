class StarRating extends HTMLElement {
    static get observedAttributes() { return ['value']; }

    #value;

    get value() {
        return this.#value;
    }

    set value(val) {
        this.#value = val;
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open', delegatesFocus: true });
        this.shadowRoot.innerHTML = `
            <style>
                :host::part(star) {
                    cursor: pointer;
                    color: var(--color-gold-600);
                }
                ::slotted([slot="label"]) {
                    font-weight: bold;
                }
            </style>           
            <label id="label">
                <slot name="label"></slot>
            </label>
            <div aria-labelledby="label" role="radiogroup">
                <span part="star" role="radio" data-star="1">☆</span>
                <span part="star" role="radio" data-star="2">☆</span>
                <span part="star" role="radio" data-star="3">☆</span>
                <span part="star" role="radio" data-star="4">☆</span>
                <span part="star" role="radio" data-star="5">☆</span>
            </div>`;
        this.#value = Number(this.getAttribute('value')) || 0;
        this.shadowRoot.addEventListener('click', this.#handleClick);
    }

    connectedCallback() {
        this.#updateDisplay();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
            this.#value = Number(newValue);
            this.#updateDisplay();
        }
    }

    #handleClick = (event) => {
        const selectedStar = event.target.closest('[data-star]');
        if (!selectedStar) return;

        this.#value = Number(selectedStar.dataset.star);
        this.#updateDisplay(true);
    }

    #updateDisplay(shouldFocus = false) {
        this.shadowRoot.querySelectorAll('[data-star]').forEach((star) => {
            const starValue = Number(star.dataset.star);
            const isSelectedStar = starValue === this.#value;
            const isFilledStar = starValue <= this.#value;

            if (isSelectedStar) {
                star.setAttribute('aria-checked', 'true');
                star.textContent = '★';
                star.setAttribute('tabindex', '0');

                if (shouldFocus) {
                    star.focus();
                }
            } else {
                star.setAttribute('aria-checked', 'false');
                star.textContent = isFilledStar ? '★' : '☆';

                if (this.#value === 0 && index === 0) {
                    star.setAttribute('tabindex', '0');
                } else {
                    star.removeAttribute('tabindex');
                }
            }
        });
    }
}

customElements.define('star-rating', StarRating);