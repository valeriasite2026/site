// Renders the site's #app HTML in plain Node (no browser, no npm packages) for SEO.
import fs from 'fs'; import vm from 'vm';
const [, , appFile, pathname] = process.argv;
const code = fs.readFileSync(appFile, 'utf8');
// a permissive fake DOM: any property is a callable, chainable no-op
const stub = () => new Proxy(function () {}, {
  get(t, k) { if (k === Symbol.toPrimitive) return () => ''; if (k in t) return t[k]; return (t[k] = stub()); },
  set(t, k, v) { t[k] = v; return true; },
  apply() { return stub(); },
});
const app = { innerHTML: '' };
const doc = stub();
doc.getElementById = (id) => (id === 'app' ? app : null);
doc.querySelectorAll = () => [];
doc.querySelector = () => null;
const win = stub();
Object.assign(win, {
  location: { pathname, hash: '', replace() {} },
  history: { pushState() {} },
  getComputedStyle: () => ({ fontSize: '0' }),
  requestAnimationFrame: () => 0,
  navigator: {}, isSecureContext: true,
});
const ctx = { window: win, document: doc, location: win.location, history: win.history,
  getComputedStyle: win.getComputedStyle, requestAnimationFrame: win.requestAnimationFrame,
  navigator: win.navigator, console };
win.document = doc;
vm.createContext(ctx);
// app.js refers to `window.CONTENT`, so make window the global as well
vm.runInContext('var self=window;' + code.replace(/^window\.CONTENT=/, 'window.CONTENT='), ctx);
process.stdout.write(app.innerHTML);
