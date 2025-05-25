class StarRating extends HTMLElement {
    #value = 0;
    #initialized = false;

    static get observedAttributes() {
        return ['value'];
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <div role="radiogroup">
                <span role="radio" data-star="1" aria-checked="false">☆</span>
                <span role="radio" data-star="2" aria-checked="false">☆</span>
                <span role="radio" data-star="3" aria-checked="false">☆</span>
                <span role="radio" data-star="4" aria-checked="false">☆</span>
                <span role="radio" data-star="5" aria-checked="false">☆</span>
            </div>`;

        this.#initialized = true;
        this.addEventListener('click', this);

        this.#updateDisplay();
    }

    disconnectedCallback() {
        this.removeEventListener('click', this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
            this.#value = +newValue;
        }
    }

    handleEvent(event) {
        if (event.type === 'click') {
            const selectedStar = event.target.closest('[data-star]');
            this.#value = +selectedStar.dataset.star;
            this.#updateDisplay();
        }
    }

    #updateDisplay() {
        if (!this.#initialized) { return; }

        this.querySelectorAll('[role="radio"]').forEach((star) => {
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