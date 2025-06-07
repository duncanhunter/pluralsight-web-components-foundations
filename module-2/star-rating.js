
const starElementBefore = document.querySelector('star-rating');
console.log('Before definition custom element is a:', starElementBefore.constructor.name);

class StarRating extends HTMLElement {

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
    }
}

customElements.whenDefined('star-rating').then(() => {
    console.log('star-rating element whenDefined promise resolvedfff');
});

customElements.define('star-rating', StarRating);

const starElementAfter = document.querySelector('star-rating');
console.log('After definition custom element is a:', starElementAfter.constructor.name);