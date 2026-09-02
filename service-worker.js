// ponytail: this is the whole PWA offline story for a single-file app - cache the
// shell on install, serve it from cache first so it still opens with no signal.
const CACHE = "tahir-bot-v3";
const SHELL = ["./", "./index.html", "./manifest.json",
               "./css/style.css", "./css/gate.css", "./css/motion.css", "./css/chatkit.css",
               "./js/app.js", "./js/motion.js", "./js/chatkit.js", "./js/gate-lines.js", "./js/gate.js",
               "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
