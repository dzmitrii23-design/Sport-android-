self.addEventListener('install', (e) => { 
  self.skipWaiting(); 
}); 

self.addEventListener('fetch', (e) => {
  // Service Worker нужен для того, чтобы браузер (особенно Chrome на Android) 
  // распознал приложение как PWA и предложил кнопку установки.
});
