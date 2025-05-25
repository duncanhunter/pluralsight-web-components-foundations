
class StarRating extends HTMLElement {
    #value = 0;

    static get observedAttributes() {
        return ['value', 'readonly'];
    }

    get readonly() {
        return this.hasAttribute('readonly');
    }
    set readonly(val) {
        if (val) {
            this.setAttribute('readonly', '');
        } else {
            this.removeAttribute('readonly');
        }
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
        this.addEventListener('click', this);
        this.#updateDisplay();
    }

    disconnectedCallback() {
        this.removeEventListener('click', this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
            const val = +newValue;
            if (!isNaN(val) && val !== this.#value) {
                this.#value = val;
                this.#updateDisplay();
            }
        }
    }

    handleEvent(event) {
        if (this.readonly) { return };
        if (event.type === 'click') {
            const selectedStar = event.target.closest('[data-star]');
            if (!selectedStar) { return };
            this.#value = +selectedStar.dataset.star;
            this.setAttribute('value', this.#value); // reflect change
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