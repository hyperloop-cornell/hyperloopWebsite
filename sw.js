const CACHE = "hyperloop-v5";

const PAGES = [
  "./", "./index.html", "./subteams.html", "./members.html",
  "./apply.html", "./sponsors.html", "./updates.html",
  "./subteam-views/subteam-structures.html",
  "./subteam-views/subteam-braking.html",
  "./subteam-views/subteam-ecc.html",
  "./subteam-views/subteam-magnetic.html",
  "./subteam-views/subteam-power.html",
  "./subteam-views/subteam-business.html",
  "./shared.js", "./res/members.json"
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
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        const fresh = fetch(e.request).then(res => {
          if (res.ok) cache.put(e.request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    )
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
