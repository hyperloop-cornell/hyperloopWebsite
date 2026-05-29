const CACHE = "hyperloop-v10";

const PAGES = [
  "./", "./index.html", "./subteams.html", "./members.html",
  "./apply.html", "./sponsors.html",
  "./subteam-views/subteam-structures.html",
  "./subteam-views/subteam-braking.html",
  "./subteam-views/subteam-ecc.html",
  "./subteam-views/subteam-magnetic.html",
  "./subteam-views/subteam-power.html",
  "./subteam-views/subteam-business.html",
  "./shared.js", "./res/members.json"
];

self.addEventListener("install", e => {
  e.waitUntil(self.skipWaiting());
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
  let url;
  try {
    url = new URL(e.request.url);
  } catch {
    return;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  const isVideoAsset = url.pathname.endsWith(".mp4") || url.pathname.endsWith(".webm") || url.pathname.endsWith(".mov");
  const networkFirstAsset = url.pathname.endsWith("/shared.js") || url.pathname.endsWith("/res/tw.css");

  if (isVideoAsset || e.request.headers.has("range")) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(async cache => {
      if (e.request.mode === "navigate" || networkFirstAsset) {
        try {
          const fresh = await fetch(e.request);
          if (fresh.ok) await cache.put(e.request, fresh.clone());
          return fresh;
        } catch (err) {
          const cached = await cache.match(e.request);
          if (cached) return cached;
          throw err;
        }
      }

      const cached = await cache.match(e.request);
      if (cached) {
        fetch(e.request).then(res => {
          if (res.ok) {
            cache.put(e.request, res.clone()).catch(() => {});
          }
        }).catch(() => {});
        return cached;
      }

      const fresh = await fetch(e.request);
      if (fresh.ok) await cache.put(e.request, fresh.clone());
      return fresh;
    })
  );
});

self.addEventListener("message", e => {
  if (e.data !== "prefetch") return;
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PAGES.map(async url => {
      const hit = await cache.match(url);
      if (hit) return;

      try {
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res);
      } catch {
        // Ignore prefetch failures; the normal fetch path can retry.
      }
    }));
  })());
});
