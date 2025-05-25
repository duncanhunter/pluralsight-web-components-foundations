const starRatingStyles = new CSSStyleSheet();
starRatingStyles.replaceSync(`
    [part="star"] {
        cursor: pointer;
    }
    :host[readonly] {
        pointer-events: none;
    }
    ::slotted([slot="label"]) {
        font-weight: bold;
    }
`);

class StarRating extends HTMLElement {
    #value = 0;
    #initialized = false;

    static get observedAttributes() {
        return ['value'];
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
                <span part="star" role="radio" data-star="1" aria-checked="false">☆</span>
                <span part="star" role="radio" data-star="2" aria-checked="false">☆</span>
                <span part="star" role="radio" data-star="3" aria-checked="false">☆</span>
                <span part="star" role="radio" data-star="4" aria-checked="false">☆</span>
                <span part="star" role="radio" data-star="5" aria-checked="false">☆</span>
            </div>`;

    }

    connectedCallback() {
        this.#initialized = true;
        this.shadowRoot.addEventListener('click', this);
        this.#updateDisplay();
    }

    disconnectedCallback() {
        this.shadowRoot.removeEventListener('click', this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
            this.#value = +newValue;
        }
    }

    handleEvent(event) {
        if (event.type === 'click') {
            const selectedStar = event.target.closest('[data-star]');
            if (!selectedStar) return;

            this.#value = +selectedStar.dataset.star;
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
                star.setAttribute('part', 'star');
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