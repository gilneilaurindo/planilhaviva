// sw.js - Service Worker para permitir instalação no celular
const CACHE_NAME = 'planilhaviva-pwa-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Apenas passa as requisições para a frente. Cumpre o requisito do navegador para instalação.
  e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});
