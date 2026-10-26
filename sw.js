const CACHE = 'hemiciclo-v31.0.2.3-collection2';
const ASSETS = ['./js/orator-catalog.js?v=31.0.2.3-polish2','./js/coin-toss.js?v=31.0.2.3-polish2','./js/ui-preferences.js?v=31.0.2.3-polish2','./js/tactical-practice.js?v=31.0.2.3-polish2','./css/readability.css?v=31.0.2.3-polish2','./js/battle-status.js?v=31.0.2.3-polish2','./js/balance-review.js?v=31.0.2.3-medium1','./js/offline-rules-v1.js?v=31.0.2.3','./css/orator-countries.css?v=31.0.2.3','./assets/flags/ar.svg','./assets/flags/ca.svg','./assets/flags/de.svg','./assets/flags/es.svg','./assets/flags/fr.svg','./assets/flags/gb.svg','./assets/flags/hu.svg','./assets/flags/it.svg','./assets/flags/mx.svg','./assets/flags/ru.svg','./assets/flags/tr.svg','./assets/flags/us.svg','./assets/flags/ve.svg','./css/progression-ui.css?v=31.0.2.3-medium1','./js/market-tutorial.js?v=31.0.2.3-polish2','./js/battle-history-ui.js?v=31.0.2.3-medium1','./js/result-tally.js?v=31.0.2.2','./assets/launch/chamber-loop.webp','./assets/launch/chamber-still.webp','./assets/results/victory.webp?v=medium1','./assets/results/victory-still.webp','./assets/results/defeat.webp?v=medium1','./assets/results/defeat-still.webp','./js/economy-client.js?v=31.0.2.3-ops1','./js/offline-rules.js?v=31.0.2.3-actions2','./js/offline-combat.js?v=31.0.2.3','./js/result-transition.js?v=31.0.2.3-medium1','./css/result-transition.css?v=31.0.2.0-recovery2','./js/action-cards.js?v=31.0.2.3-actions2', './css/action-cards.css?v=31.0.2.3-actions2', './assets/actions/art-atlas.png', './js/online-ui.js?v=31.0.2.0-recovery2', './js/online-combat-ui.js?v=31.0.2.0-recovery2', './css/online.css?v=31.0.1.4', './fonts/InterVariable.woff2', './css/ui-polish.css?v=31.0.1.4-audio1', './js/objectives.js?v=31.0.1.2-ui2', './css/objectives.css?v=31.0.2.0-tabs1', './js/legendary-mastery.js?v=31.0.1.2', './js/legendary-confetti.js?v=31.0.1.2', './css/legendary-confetti.css?v=31.0.1.2-ui2', './js/pack-presentation.js?v=31.0.1.1', './js/game-audio.js?v=31.0.2.3-polish2', './css/audio.css?v=31.0.0.5-options1', './audio/ambience.mp3', './audio/card.mp3', './audio/coin.mp3', './audio/combat-base.mp3', './audio/combat-layer.mp3', './audio/defeat.mp3', './audio/error.mp3', './audio/expel.mp3', './audio/guard.mp3', './audio/heal.mp3', './audio/menu.mp3', './audio/normal.mp3', './audio/pack.mp3', './audio/reward.mp3', './audio/strong.mp3', './audio/timer.mp3', './audio/turn.mp3', './audio/ui.mp3', './audio/victory.mp3', './js/cabinet-presets.js?v=31.0.1.4', './css/cabinets.css?v=31.0.2.3-collection2', './css/packs.css?v=31.0.1.2', './assets/packs/diario.svg?v=foil1', './assets/packs/semanal.svg?v=foil1', './assets/packs/comun.svg?v=foil1', './assets/packs/raro.svg?v=foil1', './assets/packs/legendario.svg?v=foil1', './assets/packs/mitico.svg?v=foil1', './js/battle-visuals.js?v=31.0.2.3-medium1', './css/battle-visuals.css?v=31.0.2.3-polish2', './js/battle-actions-ui.js?v=31.0.2.3-polish2', './css/battle-actions.css?v=31.0.0.5', './js/cloud-save.js?v=31.0.2.2-cloud1', './js/cloud-ui.js?v=31.0.2.3', './css/cloud.css?v=31.0.0.2', './js/supabase-sdk.js?v=2.118.0', './js/supabase-config.js?v=31.0.0.4', './js/player-profile.js?v=31.0.2.2', './css/profile.css?v=31.0.2.3', './js/player-backup.js?v=31.0.2.0', './js/ranked-seasons.js?v=31.0.1.2-season1', './js/menu-tutorial.js?v=31.0.2.3-collection2', './js/launch-screen.js?v=31.0.2.1-cloud2', './css/launch.css?v=31.0.2.1-cloud2', './fonts/Anton-Regular.ttf', './js/battle-tutorial.js?v=31.0.2.3', './css/tutorial.css?v=31.0.1.4', './', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './js/card-confetti.js', './js/app-interaction.js?v=31.0.0.3', './js/changelog.js?v=31.0.2.3-collection2', './js/market-rules.js?v=31.0.2.0', './js/market-ui.js?v=31.0.2.3-polish2', './css/interface.css?v=31.0.2.3-polish2', './cards/donald-trump-golden-portrait.webp?v=nod-60', './cards/donald-trump-golden.webp?v=nod-60'];

self.addEventListener('install', e => {
 e.waitUntil((async()=>{const cache=await caches.open(CACHE),old=await caches.keys();
 async function load(url,critical){if(!critical){for(const key of old.filter(k=>k.startsWith('hemiciclo-')&&k!==CACHE)){const hit=await(await caches.open(key)).match(url);if(hit){await cache.put(url,hit);return;}}}await cache.add(new Request(url,{cache:'reload'}));}
 const essential=url=>url==='./'||url==='./index.html'||/\.(js|css)(?:\?|$)/.test(url);
 await Promise.all(ASSETS.filter(essential).map(url=>load(url,true)));
 await Promise.allSettled(ASSETS.filter(url=>!essential(url)).map(url=>load(url,false)));
 await self.skipWaiting();})());
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
