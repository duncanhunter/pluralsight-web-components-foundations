export class ReactiveElement extends HTMLElement {
  #p = {};
  #q = 0;
  #r = 0;
  #h;
  #i;
  #t = 0;

  static get observedAttributes() {
    return this.properties ? Object.entries(this.properties)
      .filter(([_, c]) => c.attribute !== false)
      .map(([p, c]) => c.attribute || p.replace(/([A-Z])/g, '-$1').toLowerCase()) : [];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.constructor.formAssociated && (this.#i = this.attachInternals());
    
    for (const [p, c] of Object.entries(this.constructor.properties || {})) {
      this.#p[p] = c.default ?? (c.type === Boolean ? false : null);
      Object.defineProperty(this, p, {
        get: () => this.#p[p],
        set: v => {
          const o = this.#p[p];
          v = c.type === Boolean ? !!v : c.type === Number ? +v : c.type === String ? ''+v : v;
          
          if (o !== v) {
            this.#p[p] = v;
            if (c.reflect && c.attribute !== false) {
              const a = c.attribute || p.replace(/([A-Z])/g, '-$1').toLowerCase();
              this.#r = 1;
              c.type === Boolean 
                ? v ? this.setAttribute(a, '') : this.removeAttribute(a)
                : v == null ? this.removeAttribute(a) : this.setAttribute(a, v);
              this.#r = 0;
            }
            this.#u();
          }
        }
      });
    }
    
    this.#h = e => {
      const a = '@' + e.type;
      for (const el of e.composedPath()) {
        if (el.hasAttribute?.(a)) {
          const m = el.getAttribute(a);
          if (typeof this[m] === 'function') {
            this[m](e);
            break;
          }
        }
      }
    };
  }

  connectedCallback() {
    this.#render();
    this.#i && this.#uf();
    this.#setupEvents(1);
  }

  disconnectedCallback() {
    this.#setupEvents();
  }

  #setupEvents(add) {
    const evts = new Set();
    this.shadowRoot.querySelectorAll('*').forEach(el => 
      [...el.attributes].forEach(a => 
        a.name[0] === '@' && evts.add(a.name.slice(1))
      )
    );
    evts.forEach(e => this[add ? 'addEventListener' : 'removeEventListener'](e, this.#h));
  }

  attributeChangedCallback(n, _, v) {
    if (this.#r) return;
    
    for (const [p, c] of Object.entries(this.constructor.properties || {})) {
      if ((c.attribute || p.replace(/([A-Z])/g, '-$1').toLowerCase()) === n) {
        this[p] = c.type === Boolean ? v !== null : c.type === Number ? (v === null ? null : +v) : v;
        break;
      }
    }
  }

  #u() {
    this.#q || (this.#q = 1, queueMicrotask(() => {
      this.#q = 0;
      this.#render();
      this.#i && this.#uf();
    }));
  }

  #render() {
    const h = this.render?.();
    if (!h) return;
    
    if (this.constructor.styles) {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(this.constructor.styles);
      this.shadowRoot.adoptedStyleSheets = [sheet];
    }
    
    this.shadowRoot.innerHTML = h.replace(/\${([^}]+)}/g, (_, e) => {
      try { return this[e.trim()] ?? Function('return ' + e).call(this) }
      catch { return '' }
    });
    
    const p = {}, i = {};
    
    this.shadowRoot.querySelectorAll('[part]').forEach(el => 
      el.getAttribute('part').split(' ').forEach(pt => (p[pt] = p[pt] || []).push(el))
    );
    
    this.shadowRoot.querySelectorAll('[id]').forEach(el => i[el.id] = el);
    
    this.$ = new Proxy({}, { get: (_, k) => p[k]?.[0] });
    this.$$ = new Proxy({}, { get: (_, k) => p[k] || [] });
    this['#'] = new Proxy({}, { get: (_, k) => i[k] });
  }

  render() { return '' }
  
  get form() { return this.#i?.form }
  get validity() { return this.#i?.validity }
  get validationMessage() { return this.#i?.validationMessage }
  get willValidate() { return this.#i?.willValidate }
  get touched() { return this.#t }
  set touched(v) { this.#t = v; this.#u() }

  checkValidity() { 
    return this.#i ? (this.#uf(), this.#i.checkValidity()) : true;
  }
  
  reportValidity() { 
    return this.#i ? (this.#t = 1, this.#uf(), this.#u(), this.#i.reportValidity()) : true;
  }
  
  setCustomValidity(m) { this.#i?.setCustomValidity(m) }

  formDisabledCallback(d) { this.#p.disabled = d; this.#u() }

  formResetCallback() {
    'value' in this.#p && (this.value = this.getAttribute('value') || '');
    this.#t = 0;
    this.#uf();
  }

  formStateRestoreCallback(s) { 'value' in this.#p && (this.value = s) }

  #uf() {
    if (!this.#i || !('value' in this.#p)) return;
    
    this.#i.setFormValue(this.value);
    
    const v = this.validate?.() || { valid: 1 };
    const f = {}, m = [];
    
    'badInput,customError,patternMismatch,rangeOverflow,rangeUnderflow,stepMismatch,tooLong,tooShort,typeMismatch,valueMissing'
      .split(',').forEach(s => {
        if (v[s]) {
          f[s] = 1;
          const msg = this.getAttribute(s.replace(/([A-Z])/g, '-$1').toLowerCase());
          msg && m.push(msg);
        }
      });
    
    this.#i.setValidity(f, m[0] || '');
    
    this.#t && 'error' in this.#p && (this.error = !v.valid ? m[0] || '' : '');
    
    this.#i.states && (this.#t && !v.valid ? this.#i.states.add('error') : this.#i.states.delete('error'), 
                       this.#t && v.valid ? this.#i.states.add('valid') : this.#i.states.delete('valid'));
  }
  
  validate() { return { valid: 1 } }
}

export const css = (s, ...v) => s.reduce((a, b, i) => a + b + (v[i] || ''), '');
export const html = css;