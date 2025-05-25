
const starElementBefore = document.querySelector('star-rating');
console.log('Before definition:', starElementBefore.constructor.name);

class StarRating extends HTMLElement {
    #value = 0;

    static get observedAttributes() {
        return ['value', 'readonly'];
    }

    constructor() {
        super();
        console.log('Constructor called:', this);
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

        console.log('Connected callback - element is in the DOM');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'value') {
            this.#value = +newValue;
        }

        console.log(`Attribute changed: ${name} from ${oldValue} to ${newValue}`);
    }
}

customElements.whenDefined('star-rating').then(() => {
    console.log('Star-rating element defined');
});

customElements.define('star-rating', StarRating);

const starElementAfter = document.querySelector('star-rating');
console.log('After definition:', starElementAfter.constructor.name);