const CACHE_NAME = "fb-cache-v8-10";

const urlsToCache = [
  "./index.html",
  "./icons/icon512_maskable.png",
  "./icons/icon512_rounded.png",
  "https://unpkg.com/vue@3/dist/vue.global.js",
  "https://cdn.jsdelivr.net/npm/vuetify@3.6.4/dist/vuetify.min.css",
  "https://cdn.jsdelivr.net/npm/vuetify@3.6.4/dist/vuetify.min.js",
  "https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css",
  "./offline.html",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    fetch(event.request).catch(function () {
      return caches.match(event.request).then(function (response) {
        return response || caches.match("./offline.html");
      });
    })
  );
});
