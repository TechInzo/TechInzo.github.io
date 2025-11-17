
const CACHE_NAME = 'pillpal-cache-v1';
const URLS_TO_CACHE = [
  'index.html',
  'index.tsx',
  'manifest.json',
  'service-worker.js',
  'App.tsx',
  'types.ts',
  'assets/icon-192.svg',
  'assets/icon-512.svg',
  'hooks/useLocalStorage.ts',
  'hooks/useReminders.ts',
  'services/geminiService.ts',
  'components/AddMedicationForm.tsx',
  'components/EditMedicationModal.tsx',
  'components/HistoryLog.tsx',
  'components/Icons.tsx',
  'components/MedicationInfoModal.tsx',
  'components/MedicationItem.tsx',
  'components/MedicationList.tsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});