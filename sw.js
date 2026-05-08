const CACHE = "hyperloop-v3";

const PAGES = [
  "/", "index.html", "subteams.html", "members.html",
  "apply.html", "sponsors.html", "updates.html",
  "subteam-views/subteam-structures.html",
  "subteam-views/subteam-braking.html",
  "subteam-views/subteam-ecc.html",
  "subteam-views/subteam-magnetic.html",
  "subteam-views/subteam-power.html",
  "subteam-views/subteam-business.html",
  "shared.js", "res/members.json"
];

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
    })
  );
});

self.addEventListener("message", e => {
  if (e.data !== "prefetch") return;
  caches.open(CACHE).then(cache => {
    PAGES.forEach(url => {
      cache.match(url).then(hit => {
        if (!hit) fetch(url).then(res => { if (res.ok) cache.put(url, res); }).catch(() => {});
      });
    });
  });
});
