// ponytail: this is the whole PWA offline story for a single-file app - cache the
// shell on install, so it still opens with no signal.
//
// ponytail: it used to be cache-first for EVERYTHING, index.html included. that is the
// trap that hands a returning visitor a dead app: their browser had the old shell, so a
// new Netlify deploy never reached them until someone remembered to bump CACHE by hand.
// netlify.toml already tells the CDN never to cache index.html - serving it from here
// first quietly undid that. so now:
//   · navigations  -> network first, cache only as the offline fallback
//   · static files -> serve the cache instantly, refresh it in the background
// a deploy lands on the next load without any version bump, and the app still opens offline.
const CACHE = "tahir-bot-v5";
const SHELL = ["./", "./index.html", "./manifest.json",
               "./css/style.css", "./css/gate.css", "./css/motion.css", "./css/chatkit.css",
               "./js/app.js", "./js/motion.js", "./js/chatkit.js", "./js/gate-lines.js", "./js/gate.js",
               "./js/intro.js",
               "./assets/tahir-og.jpeg",
               "./icons/icon-192.png"];
// ponytail: icon-512 is deliberately NOT precached. At 238KB it was 39% of everything a
// first-time visitor downloaded, and it is only ever used at the moment someone installs
// the app to their home screen - a casual visitor pays for a file they never see. The
// fetch handler below still caches it on demand, so installing offline-after-once works.

self.addEventListener("install", e => {
  // ponytail: one missing file used to reject addAll() and abort the whole install,
  // leaving no cache at all. cache each on its own so a single 404 cannot cost offline.
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(SHELL.map(u => c.add(u).catch(err => console.warn("skip caching", u, err))))
  ));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  // only our own GETs. a POST or a cross-origin font goes straight to the network -
  // caches.match on a non-GET never hits anyway, it just costs a lookup.
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  // the shell itself: always try the network, so a fresh deploy wins the moment
  // there is signal. the cached copy is the fallback, not the default.
  if (req.mode === "navigate" || req.destination === "document"){
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then(hit => hit || caches.match("./index.html")))
    );
    return;
  }

  // css / js / images: instant from cache, then quietly refreshed for the next load.
  e.respondWith(
    caches.match(req).then(hit => {
      const live = fetch(req)
        .then(res => {
          if (res && res.ok){
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);          // offline: the cached copy is the answer
      return hit || live;
    })
  );
});
