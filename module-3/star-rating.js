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
            const starValue = Number(star.dataset.star);
            const isSelected = starValue === this.#value;
            const isFilled = starValue <= this.#value;

            star.textContent = isFilled ? '★' : '☆';
            star.setAttribute('aria-checked', isSelected ? 'true' : 'false');
            star.setAttribute('part', isSelected ? 'star selected-star' : 'star');

            if (isSelected || (this.#value === 0 && index === 0)) {
                star.setAttribute('tabindex', '0');
                if (shouldFocus && isSelected) star.focus();
            } else {
                star.removeAttribute('tabindex');
            }
        });
    }
}

customElements.define('star-rating', StarRating);