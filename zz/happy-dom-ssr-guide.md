# Happy DOM SSR Guide

A quick reference for using Happy DOM to server-render Web Components (including Shadow DOM, ElementInternals stubs, and form-associated elements) in a Node.js environment or Hono app.

---

## 1. Installation

```bash
npm install happy-dom
```

## 2. Global Setup

```js
import { Window } from "happy-dom";

const window = new Window();
global.window = window;
global.document = window.document;
global.customElements = window.customElements;
global.HTMLElement = window.HTMLElement;
```

## 3. Polyfill ElementInternals & Form Association

```js
// Stub attachInternals if not present
if (!("attachInternals" in window.HTMLElement.prototype)) {
  window.HTMLElement.prototype.attachInternals = function() {
    return {
      formAssociated: this.constructor.formAssociated === true,
      setFormValue: () => {},
      setValidity: () => {},
      form: null,
      labels: [],
    };
  };
}

// Define global ElementInternals
if (typeof global.ElementInternals === "undefined") {
  global.ElementInternals = class {};
}
```

## 4. Define Your Custom Elements

```js
customElements.define(
  "my-input",
  class extends HTMLElement {
    static formAssociated = true;
    constructor() {
      super();
      this.internals = this.attachInternals();
      this.attachShadow({ mode: "open", serializable: true });
    }
    connectedCallback() {
      // Your logic here
    }
  }
);
```

## 5. Simple SSR Rendering

```js
window.document.documentElement.innerHTML = \`<my-input name="foo"></my-input>\`;
const html = window.document.documentElement.getHTML({
  serializableShadowRoots: true,
});
console.log(html);
```

## 6. Hono Integration Example

```ts
import { Hono } from 'hono';
import { Window } from 'happy-dom';
import './components/my-input.js';

const app = new Hono();

app.get('*', async (c) => {
  // 1. Render your TSX/HTML to string (e.g. via ReactDOMServer)
  const markup = /* your HTML string */;

  // 2. Setup Happy DOM globals
  const window = new Window();
  global.window = window;
  global.document = window.document;
  global.customElements = window.customElements;
  global.HTMLElement = window.HTMLElement;

  // 3. Polyfill Internals & Form Association (see section 3)

  // 4. Parse and upgrade elements
  window.document.documentElement.innerHTML = markup;

  // 5. Serialize with Shadow DOM
  const output = window.document.documentElement.getHTML({
    serializableShadowRoots: true
  });

  return c.html('<!DOCTYPE html>\n' + output);
});

app.fire();
```

## 7. Tips & Best Practices

- **Pre-define** your custom elements before parsing HTML so Happy DOM auto-upgrades them.
- Always pass `serializableShadowRoots: true` to `getHTML()` to emit `<template shadowroot="open">…</template>`.
- If you must define elements after parsing, you can manually upgrade:
  ```js
  document.querySelectorAll('my-widget').forEach(el => customElements.upgrade(el));
  ```
- Stub out any missing browser APIs (e.g., other ElementInternals methods) similarly to section 3.
