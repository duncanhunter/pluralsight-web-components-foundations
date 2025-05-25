class StarRating extends HTMLElement {
    static formAssociated = true;
    #value = 0;
    #internals;

    constructor() {
        super();
        this.#internals = this.attachInternals();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: inline-block; cursor: pointer; }
                span { font-size: 1.5rem; user-select: none; padding: 0 0.1em; }
            </style>
            ${[...Array(5)].map((_, i) => `<span data-star="${i + 1}">☆</span>`).join('')}
        `;

        this.#updateDisplay();
    }

    connectedCallback() {
        this.shadowRoot.addEventListener('click', this);
    }

    disconnectedCallback() {
        this.shadowRoot.removeEventListener('click', this);
    }

    handleEvent(event) {
        const star = event.target.closest('span[data-star]');
        if (!star) { return };

        this.#value = Number(star.dataset.star);
        this.#updateDisplay();

        this.#internals.setFormValue(this.#value);
        this.#internals.setValidity({}, '', true);
    }

    #updateDisplay() {
        this.shadowRoot.querySelectorAll('span').forEach((starEl, idx) => {
            starEl.textContent = idx < this.#value ? '★' : '☆';
        });
    }

    formResetCallback() {
        this.#value = 0;
        this.#internals.setFormValue(this.#value);
        this.#updateDisplay();
    }
}

customElements.define('star-rating', StarRating);

document.getElementById('demo-form').addEventListener('submit', event => {
    event.preventDefault();
    const rating = new FormData(event.target).get('rating');
    alert(`Submitted rating: ${rating}`);
});