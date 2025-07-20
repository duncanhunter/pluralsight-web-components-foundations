const starRatingStyles = new CSSStyleSheet();
starRatingStyles.replaceSync(`
    [part="star"] {
        cursor: pointer;
    }
    ::slotted([slot="label"]) {
        font-weight: bold;
    }
`);

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
        this.shadowRoot.adoptedStyleSheets = [starRatingStyles];
        this.shadowRoot.innerHTML = `
            <label id="label">
                <slot name="label"></slot>
            </label>
            <div aria-labelledby="label" role="radiogroup">
                <span role="radio" data-star="1">☆</span>
                <span role="radio" data-star="2">☆</span>
                <span role="radio" data-star="3">☆</span>
                <span role="radio" data-star="4">☆</span>
                <span role="radio" data-star="5">☆</span>
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
        }
    }

    #handleClick = (event) => {
        const selectedStar = event.target.closest('[data-star]');
        if (!selectedStar) return;

        this.#value = Number(selectedStar.dataset.star);
        this.#updateDisplay();
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }

    #updateDisplay(shouldFocus = false) {
        const stars = this.shadowRoot.querySelectorAll('[role="radio"]');
        stars.forEach((star, index) => {
            const starValue = +star.dataset.star;
            const isSelectedStar = starValue === this.#value;
            const isFilledStar = starValue <= this.#value;

            if (isSelectedStar) {
                star.setAttribute('aria-checked', 'true');
                star.textContent = '★';
                star.setAttribute('tabindex', '0');
                 if (shouldFocus && isSelected) star.focus();
            } else {
                star.setAttribute('aria-checked', 'false');
                star.textContent = isFilledStar ? '★' : '☆';
                star.removeAttribute('tabindex');
            }
        });
    }
}

customElements.define('star-rating', StarRating);