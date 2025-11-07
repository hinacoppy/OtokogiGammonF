/* serviceWorker.js */
// (参考) https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Offline_Service_workers
'use strict';

const cacheName = 'OtokogiGammonF-v20251107';
const ORIGIN = (location.hostname == 'localhost') ? '' : location.protocol + '//' + location.hostname;

const contentToCache = [
  ORIGIN + '/OtokogiGammonF/',
  ORIGIN + '/OtokogiGammonF/index.html',
  ORIGIN + '/OtokogiGammonF/manifest.json',
  ORIGIN + '/OtokogiGammonF/icon/favicon.ico',
  ORIGIN + '/OtokogiGammonF/icon/apple-touch-icon.png',
  ORIGIN + '/OtokogiGammonF/icon/android-chrome-96x96.png',
  ORIGIN + '/OtokogiGammonF/icon/android-chrome-192x192.png',
  ORIGIN + '/OtokogiGammonF/icon/android-chrome-512x512.png',
  ORIGIN + '/OtokogiGammonF/css/OtokogiGame.css',
  ORIGIN + '/OtokogiGammonF/css/OtokogiBoard.css',
  ORIGIN + '/OtokogiGammonF/js/Ogid_class.js',
  ORIGIN + '/OtokogiGammonF/js/OtokogiChequer_class.js',
  ORIGIN + '/OtokogiGammonF/js/OtokogiBoard_class.js',
  ORIGIN + '/OtokogiGammonF/js/OtokogiGame_class.js',
  ORIGIN + '/css/font-awesome-animation.min.css',
  ORIGIN + '/js/fontawesome-inuse.min.js',
  ORIGIN + '/js/jquery-3.7.1.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(contentToCache);
    })
  );
  self.skipWaiting();
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      return r || fetch(e.request).then((response) => {
        return caches.open(cacheName).then((cache) => {
          if (e.request.url.startsWith('http')) { //ignore chrome-extention: request (refuse error msg)
            cache.put(e.request, response.clone());
          }
          return response;
        });
      });
    })
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        const [kyappname, kyversion] = key.split('-');
        const [cnappname, cnversion] = cacheName.split('-');
        if (kyappname === cnappname && kyversion !== cnversion) {
          return caches.delete(key);
        }
      }));
    })
  );
});
