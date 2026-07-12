// Service Worker بسيط لتطبيق "دوري الأصحاب"
// الهدف: (1) خلي المتصفح يعتبر الموقع "قابل للتثبيت" PWA
// (2) كاش لملفات الشكل الثابتة (html/css/أيقونات) عشان تفتح بسرعة حتى لو النت ضعيف
// ملاحظة: بيانات المباريات نفسها بتيجي دايمًا لايف من الشيت (SHEET_API_URL)، مش من الكاش،
// عشان محدش ياخد بيانات قديمة.

const CACHE_NAME = 'fc-tracker-shell-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .catch(() => {}) // لو فيه ملف مش لاقيه، متوقفش التثبيت كله
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return; // من غير كاش لطلبات POST (زي حفظ البيانات)

  const url = new URL(req.url);

  // أي طلب لـ Google Apps Script (بيانات لايف) ياخد شبكة مباشرة، من غير كاش خالص
  if (url.hostname.includes('script.google.com')) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }

  // باقي الملفات الثابتة: كاش الأول وبعدين تحديث في الخلفية
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.ok) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
