const CACHE = 'health-meter-bd-v5';
const ASSETS = [
  './',
  'index.html',
  'developer.html',
  'manifest.webmanifest',
  'photo.jpg',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'favicon-64.png',
  'favicon-32.png',
  'favicon.ico'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // বড় APK ফাইল ক্যাশ করা হবে না
  if (url.pathname.endsWith('.apk')) return;

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok && url.origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((m) => m || caches.match('index.html')))
  );
});
