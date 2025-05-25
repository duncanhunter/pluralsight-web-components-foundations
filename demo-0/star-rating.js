
const starElementBefore = document.querySelector('star-rating');
console.log('Before definition:', starElementBefore.constructor.name);

class StarRating extends HTMLElement {
    constructor() {
        super();
        console.log('Constructor called:', this);
    }

    connectedCallback() {
        console.log('Connected callback - element is in the DOM');
    }
}

customElements.whenDefined('star-rating').then(() => {
    console.log('Star-rating element defined');
});

customElements.define('star-rating', StarRating);

const starElementAfter = document.querySelector('star-rating');
console.log('After definition:', starElementAfter.constructor.name);