class Carousel extends HTMLElement {
  #slides = [];
  #currentIndex = 0;
  #total = 0;
  #prevButton;
  #nextButton;

  // Auto-bound core methods
  prev = () => {
    this.#currentIndex = (this.#currentIndex - 1 + this.#total) % this.#total;
    this.#updateSlides();
  };

  next = () => {
    this.#currentIndex = (this.#currentIndex + 1) % this.#total;
    this.#updateSlides();
  };

  // Private initializer
  #initialize = () => {
    this.#slides = Array.from(this.querySelectorAll('img'));
    this.#total = this.#slides.length;
    if (!this.#prevButton) {
      this.insertAdjacentHTML('beforeend', '<button class="prev">‹</button><button class="next">›</button>');
    }
    this.#prevButton = this.querySelector('.prev');
    this.#nextButton = this.querySelector('.next');
    this.#prevButton.addEventListener('click', this.prev);
    this.#nextButton.addEventListener('click', this.next);
    this.#updateSlides();
  };

  // Private slide updater
  #updateSlides = () => {
    this.#slides.forEach((slide, i) => {
      slide.style.display = i === this.#currentIndex ? '' : 'none';
    });
  };

  connectedCallback() {
    this.#initialize();
  }
}
customElements.define('my-carousel', Carousel);