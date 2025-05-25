import { Window } from "happy-dom";

const globals = new Window();
global.document = globals.document;
global.customElements = globals.customElements;
global.HTMLElement = globals.HTMLElement;

export async function render(html, imports = []) {
  await Promise.all(imports.map((init) => init()));

  document.documentElement.innerHTML = html;
  console.log("Document loaded", document.documentElement.innerHTML);
  return document.documentElement.getHTML({ serializableShadowRoots: true });
}

const html = `<!doctype html>
<html lang="en">
  <body>
    <star-rating value="2" ssr>
      <span slot="label">Rating</span>
    </star-rating>
  </body>
</html>
`;

const result = await render(html, [
  () => import("./star-rating-simple.js")
]);

console.log(result);