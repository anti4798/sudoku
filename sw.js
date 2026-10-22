// 오프라인 지원: 네트워크 먼저 시도하고, 실패하면 캐시에서 꺼내 씀.
// 그래서 새로 배포하면 온라인일 땐 바로 최신 버전이 보임.
const CACHE = 'sudoku-v1';
const PRECACHE = [
    './',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Tailwind CDN, 구글 폰트 같은 외부 파일도 같이 캐시해서 오프라인에서도 모양이 유지되게 함
                const copy = response.clone();
                caches.open(CACHE).then((cache) => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request, { ignoreSearch: event.request.mode === 'navigate' }))
    );
});
