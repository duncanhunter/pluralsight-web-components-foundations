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
        this.innerHTML = `
            <div role="radiogroup">
                <span role="radio" data-star="1">☆</span>
                <span role="radio" data-star="2">☆</span>
                <span role="radio" data-star="3">☆</span>
                <span role="radio" data-star="4">☆</span>
                <span role="radio" data-star="5">☆</span>
            </div>`;
        this.#value = Number(this.getAttribute('value')) || 0;
        this.addEventListener('click', this.#handleClick);
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

    #handleClick(event) {
        const selectedStar = event.target.closest('[data-star]');
        if (!selectedStar) return;

        this.#value = Number(selectedStar.dataset.star);
        this.#updateDisplay();
    }

    #updateDisplay() {
        this.querySelectorAll('[data-star]').forEach((star) => {
            const starValue = +star.dataset.star;
            const isSelectedStar = starValue === this.#value;
            const isFilledStar = starValue <= this.#value;

            if (isSelectedStar) {
                star.setAttribute('aria-checked', 'true');
                star.textContent = '★';
            } else {
                star.setAttribute('aria-checked', 'false');
                star.textContent = isFilledStar ? '★' : '☆';
            }
        });
    }
}

customElements.define('star-rating', StarRating);