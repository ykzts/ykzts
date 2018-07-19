const CACHE_NAME = 'ykzts-website-cache-v1.0';
const ASSETS_REGEXP = /^https:\/\/(?:cdn\.ampproject\.org\/(?:.+)\.js$|(?:www\.)?gravatar\.com\/avatar\/)/i;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    return cache.add('https://cdn.ampproject.org/v0.js');
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheKeys = (await caches.keys()).filter(key => key !== CACHE_NAME);
    return Promise.all(cacheKeys.map(key => caches.delete(key)));
  })());
});

self.addEventListener('fetch', (event) => {
  const { method, url } = event.request;
  if (method === 'GET' && ASSETS_REGEXP.test(url)) {
    event.respondWith((async () => {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }
      const response = await fetch(event.request, {
        credentials: 'same-origin',
        mode: 'cors',
      });
      if (!response.ok) {
        return response;
      }
      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, response.clone());
      return response;
    })());
  }
});
