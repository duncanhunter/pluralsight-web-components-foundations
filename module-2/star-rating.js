class StarRating extends HTMLElement {
    #value = 0;

    static get observedAttributes() {
        return ['value'];
    }

    constructor() {
        super();
        this.innerHTML = `
            <div role="radiogroup">
                <span role="radio" data-star="1"">☆</span>
                <span role="radio" data-star="2"">☆</span>
                <span role="radio" data-star="3"">☆</span>
                <span role="radio" data-star="4"">☆</span>
                <span role="radio" data-star="5"">☆</span>
                </div>`;
        this.addEventListener('click', this);
        this.#updateDisplay();
    }

    connectedCallback() {

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