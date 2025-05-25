import { Window } from 'happy-dom';

// Setup Happy DOM window
const window = new Window();
global.window = window;
global.document = window.document;
global.customElements = window.customElements;
global.HTMLElement = window.HTMLElement;
global.CSSStyleSheet = window.CSSStyleSheet;

// Make component work in SSR
HTMLElement.prototype.attachShadow = function(options) {
  return window.document.createElement('div');
};
window.HTMLElement.prototype.attachShadow = HTMLElement.prototype.attachShadow;

// Fix for adoptedStyleSheets
Object.defineProperty(window.ShadowRoot.prototype, 'adoptedStyleSheets', {
  get() { return []; },
  set() {}
});

// Import our component
await import('./star-rating.js');

// Create simple markup
const markup = `
<star-rating value="4">
  <span slot="label">Server Rendered</span>
</star-rating>
`;

// Render to HTML with Declarative Shadow DOM
document.body.innerHTML = markup;
const html = document.body.innerHTML;

// Log the result
console.log('--- Rendered HTML ---');
console.log(html);
console.log('---------------------');
