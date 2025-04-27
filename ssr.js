#!/usr/bin/env node
import { Window } from "happy-dom";

//
// Bootstrap a happy-dom environment on the global object
//
const window = new Window();
global.window = window;
global.document = window.document;
global.customElements = window.customElements;
global.HTMLElement = window.HTMLElement;

//
// Define your <greet-person> component inline
//
customElements.define(
  "greet-person",
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open", serializable: true });
    }
    connectedCallback() {
      const name = this.getAttribute("name") || "";
      this.shadowRoot.innerHTML = `<div part="btn"><slot name="btn"></slot></div><p>Hello, ${name}!</p>`;
    }
  }
);

//
// Render function and invocation in one file
//
(async () => {
  const html = `<button>foo</button><div><greet-person name="Duncan"><button slot="btn">inner</button></greet-person></div>`;
  // inject your markup
  window.document.documentElement.innerHTML = html;
  // serialize including shadow roots
  const output = window.document.documentElement.getHTML({
    serializableShadowRoots: true,
  });
  console.log(output);
})();