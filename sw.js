/* ============================================
   SMART GARDEN — SERVICE WORKER
   Menangani notifikasi push di background/system
   tray HP, walau aplikasi/tab sudah ditutup total.
============================================ */

const SW_VERSION = 'hydroponik-sw-v9';
const SHELL_CACHE = "hydroponik-shell-v9";

// Aset inti ("app shell") yang di-precache saat install supaya aplikasi
// tetap bisa dibuka (login maupun dashboard) walau koneksi lemah/offline.
// Data sensor (/api/...) SENGAJA tidak dicache — selalu harus real-time.
const SHELL_ASSETS = [
    '/',
    './login.html',
    './dashboard.html',
    './auth-style.css',
    './dashboard.css',
    './login.js',
    './dashboard.js',
    './user-info.js',
    './auth.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-512.png',
    './icons/badge-72.png',
];

// ── Install & Activate ───────────────────────────────
// skipWaiting() + clients.claim() supaya service worker baru
// langsung aktif tanpa perlu user menutup semua tab dulu.
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(SHELL_CACHE).then((cache) =>
            // addAll akan gagal seluruhnya kalau salah satu URL 404 — pakai
            // Promise.allSettled supaya aset yang ada tetap ter-cache walau
            // ada path yang berbeda-beda tergantung cara deploy backend.
            Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url)))
        )
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((keys) =>
                Promise.all(keys.filter((key) => key !== SHELL_CACHE).map((key) => caches.delete(key)))
            ),
        ])
    );
});

// ── FETCH: strategi cache untuk app shell (offline-ready) ──
// Data API selalu diambil dari network (tidak boleh basi/cache).
// Aset shell pakai "stale-while-revalidate": langsung sajikan dari
// cache biar cepat & bisa offline, sambil diperbarui di latar belakang.
self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return; // biarkan CDN eksternal apa adanya
    if (url.pathname.startsWith('/api/')) return; // selalu network, jangan dicache

    // Network-first: selalu ambil versi terbaru, cache hanya untuk offline.
    event.respondWith(
        fetch(request)
            .then((response) => {
                if (response && response.ok) {
                    const copy = response.clone();
                    caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});

// ── PUSH: notifikasi masuk dari server walau aplikasi ditutup ──
// Inilah bagian yang membuat notifikasi tetap muncul di system tray
// HP meskipun user tidak sedang membuka aplikasi SmartGarden sama
// sekali (tab ditutup / browser di-background / layar terkunci).
self.addEventListener('push', (event) => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        // Kalau payload bukan JSON, tampilkan sebagai teks biasa
        data = {
            title: '🔔 SmartGarden',
            body: event.data ? event.data.text() : 'Ada pembaruan baru dari sensor Anda.',
        };
    }

    const title = data.title || '🔔 SmartGarden';
    const options = {
        body: data.body || 'Ada pembaruan baru dari sensor Anda.',
        icon: data.icon || './icons/icon-192.png',
        badge: data.badge || './icons/badge-72.png',
        tag: data.tag || 'smartgarden-push',
        renotify: true,
        vibrate: data.urgent === false ? [120] : [200, 100, 200, 100, 200],
        data: {
            url: data.url || '/',
        },
        requireInteraction: !!data.urgent,
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// ── Klik notifikasi: buka/fokuskan tab aplikasi yang sudah ada ──
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(targetUrl);
            }
        })
    );
});

// ── Kalau browser memperbarui/mencabut subscription push secara
// otomatis (mis. karena kedaluwarsa), daftarkan ulang ke server
// supaya notifikasi tidak berhenti diam-diam.
self.addEventListener('pushsubscriptionchange', (event) => {
    event.waitUntil(
        self.registration.pushManager
            .subscribe(event.oldSubscription ? event.oldSubscription.options : { userVisibleOnly: true })
            .then((subscription) =>
                fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription),
                })
            )
            .catch(() => {})
    );
});
