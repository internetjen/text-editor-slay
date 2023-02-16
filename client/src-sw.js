// Caching js and css requires workbox-strategies to be installed
// To actually respond to requests with a cached response, we need to use a strategy called CacheFirst.
// This strategy will first check the cache for a response, and if it finds one, it will return it.

const { offlineFallback, warmStrategyCache } = require('workbox-recipes');
const { CacheFirst, StaleWhileRevalidate } = require('workbox-strategies');
const { registerRoute } = require('workbox-routing');
const { CacheableResponsePlugin } = require('workbox-cacheable-response');
const { ExpirationPlugin } = require('workbox-expiration');
const { precacheAndRoute } = require('workbox-precaching/precacheAndRoute');

// The precacheAndRoute() method takes an array of URLs to precache. The self._WB_MANIFEST is an array that contains the list of URLs to precache.
precacheAndRoute(self.__WB_MANIFEST);

// Set up cache for HTML pages
const pageCache = new CacheFirst({
  // Name of the cache storage.
  cacheName: 'page-cache',
  plugins: [
    // This plugin will cache responses with these headers to a maximum-age of 30 days
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
    new ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60,
    }),
  ],
});

// Warm up cache
warmStrategyCache({
  urls: ['/index.html', '/'],
  strategy: pageCache,
});

// Use offlineFallback recipe to show fallback page when offline
offlineFallback({
  // Fallback to this HTML page when a URL is not in the cache and the user is offline
  pageFallback: '/offline.html',
  // Fallback to this image when a request for an image fails and the user is offline
  imageFallback: 'client/src/images/offline.png',
  // Use the CacheFirst strategy for the fallback page
  pageLoadFallbackStrategy: pageCache,
});


// Set up asset cache
registerRoute(({ request }) => request.mode === 'navigate', pageCache);

// TODO: Implement asset caching
registerRoute(
  // Here we define the callback function that will filter the requests we want to cache (in this case, JS and CSS files)
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    // Name of the cache storage.
    cacheName: 'asset-cache',
    plugins: [
      // This plugin will cache responses with these headers to a maximum-age of 30 days
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);