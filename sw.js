const CACHE = 'hemiciclo-v31.0.0.5';
const ASSETS = ['./js/game-audio.js?v=31.0.0.5', './css/audio.css?v=31.0.0.5', './audio/ambience.mp3', './audio/card.mp3', './audio/coin.mp3', './audio/combat-base.mp3', './audio/combat-layer.mp3', './audio/defeat.mp3', './audio/error.mp3', './audio/expel.mp3', './audio/guard.mp3', './audio/heal.mp3', './audio/menu.mp3', './audio/normal.mp3', './audio/pack.mp3', './audio/reward.mp3', './audio/strong.mp3', './audio/timer.mp3', './audio/turn.mp3', './audio/ui.mp3', './audio/victory.mp3', './js/cabinet-presets.js?v=31.0.0.5', './css/cabinets.css?v=31.0.0.5', './js/battle-visuals.js?v=31.0.0.4', './css/battle-visuals.css?v=31.0.0.4-frame1', './js/battle-actions-ui.js?v=31.0.0.5', './css/battle-actions.css?v=31.0.0.5', './js/cloud-save.js?v=31.0.0.2', './js/cloud-ui.js?v=31.0.0.2', './css/cloud.css?v=31.0.0.2', './js/supabase-sdk.js?v=2.118.0', './js/supabase-config.js?v=31.0.0.4', './js/player-profile.js?v=31.0.0.4', './css/profile.css?v=31.0.0.1-profile', './js/player-backup.js?v=31.0.0.5', './js/ranked-seasons.js?v=30.2.61', './js/menu-tutorial.js?v=31.0.0.5', './js/launch-screen.js?v=30.2.61', './css/launch.css?v=31.0.0.2-logo-metal', './fonts/Anton-Regular.ttf', './js/battle-tutorial.js?v=31.0.0.5', './css/tutorial.css?v=31.0.0.4-frame1', './', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './js/card-confetti.js', './js/app-interaction.js?v=31.0.0.3', './js/changelog.js?v=31.0.0.5', './js/market-rules.js', './js/market-ui.js?v=31.0.0.5', './css/interface.css?v=30.2.61', './cards/donald-trump-golden-portrait.webp?v=nod-60', './cards/donald-trump-golden.webp?v=nod-60'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(ASSETS.map(url => c.add(new Request(url, { cache: 'reload' }))))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('hemiciclo-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  // Never cache account requests, tokens or responses from external services.
  if (new URL(req.url).origin !== self.location.origin) return;
  if (new URL(req.url).pathname.startsWith('/api/market/')) return;

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const saved = await cache.match('./index.html') || await cache.match('./');
      const controller = new AbortController();
      let timer;
      try {
        const res = await Promise.race([
          fetch(req, { signal: controller.signal }),
          new Promise((resolve, reject) => {
            timer = setTimeout(() => { controller.abort(); reject(new Error('Navigation timeout')); }, 3500);
          })
        ]);
        if (!res.ok) throw new Error('Navigation unavailable');
        e.waitUntil(cache.put('./index.html', res.clone()).catch(() => {}));
        return res;
      } catch (error) {
        return saved || new Response('Conéctate una vez para guardar el juego y poder abrirlo sin conexión.', {
          status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      } finally {
        clearTimeout(timer);
      }
    })());
    return;
  }

  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(res => {
      if (res && res.ok) {
        const c = res.clone();
        e.waitUntil(caches.open(CACHE).then(x => x.put(req, c)).catch(() => {}));
      }
      return res;
    }).catch(() => new Response('', { status: 404 })))
  );
});
