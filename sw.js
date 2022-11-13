const staticCashName = 'site-static-v5';
const dynamicCasheName = 'site-dynamic-v1';
const assets = [
  '/',
  '/index.html',
  '/js/app.js',
  '/js/ui.js',
  '/js/materialize.min.js',
  '/css/styles.css',
  '/css/materialize.min.css',
  '/img/dish.png',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://fonts.gstatic.com/s/materialicons/v139/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
  '/pages/fallback.html',
];

// install event
self.addEventListener('install', evt => {
  // console.log('service worker has been installed');
  evt.waitUntil(
    caches.open(staticCashName).then(cache => {
      console.log('caching shell assets');
      cache.addAll(assets);
    }),
  );
});

// activate event
self.addEventListener('activate', evt => {
  // console.log('service worker has been activated');
  evt.waitUntil(
    caches.keys().then(keys => {
      // console.log(keys);
      return Promise.all(
        keys
          .filter(key => key !== staticCashName && key !== dynamicCasheName)
          .map(key => caches.delete(key)),
      );
    }),
  );
});

// fetch event
self.addEventListener('fetch', evt => {
  // console.log('fetch event', evt);
  evt.respondWith(
    caches
      .match(evt.request)
      .then(cacheRes => {
        return (
          cacheRes ||
          fetch(evt.request).then(async fetchRes => {
            const cache = await caches.open(dynamicCasheName);
            cache.put(evt.request.url, fetchRes.clone());
            return fetchRes;
          })
        );
      })
      .catch(() => {
        // if (evt.request.url.indexOf('.html') > -1) {
        if (evt.request.destination === 'document') {
          return caches.match('/pages/fallback.html');
        }
      }),
  );
});
