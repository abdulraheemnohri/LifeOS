const CACHE_NAME = 'lifeos-cache-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/api.js',
    '/sync.js',
    '/storage.js',
    '/components/dashboard.js',
    '/components/income.js',
    '/components/bills.js',
    '/components/loans.js',
    '/components/notes.js',
    '/components/experience.js',
    '/components/profile.js',
    '/components/settings.js',
    '/components/wifi.js',
    '/components/tasks.js',
    '/components/groceries.js',
    '/components/utilities.js',
    '/components/habits.js',
    '/components/secrets.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});

// Logic to handle skipWaiting for immediate updates
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
