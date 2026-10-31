const CACHE = 'hemiciclo-v31.0.2.11-uniform7';
const ASSETS = ["./js/offline-engine-loader.js?v=31.0.2.10","./pruebas/index.html","./js/attack-forecast.js?v=31.0.2.10","./js/battle-insights.js?v=31.0.2.10","./js/tactical-policy.js?v=31.0.2.10","./js/cabinet-analysis.js?v=31.0.2.10","./js/orator-context.js?v=31.0.2.10","./js/strategy-ui.js?v=31.0.2.10","./css/strategy.css?v=31.0.2.10","./js/offline-rules-v8.js?v=31.0.2.10","./js/basic-effects-v3.js?v=31.0.2.9","./js/offline-rules-v7.js?v=31.0.2.9","./js/basic-effects-v2.js?v=31.0.2.8-states1","./js/offline-rules-v6.js?v=31.0.2.8-states1","./js/basic-effects-v1.js?v=31.0.2.8-wave2","./js/offline-rules-v5.js?v=31.0.2.8-wave2","./js/legal-documents.js?v=31.0.2.6-sources1","./js/legal-ui.js?v=31.0.2.6-sources1","./css/legal.css?v=31.0.2.5-legal1","./legal/index.html","./legal/documents.json","./legal/licenses/supabase-MIT.txt","./fonts/Inter-OFL.txt","./fonts/OFL.txt","./fonts/VT323-OFL.txt","./js/menu-navigation.js?v=31.0.2.11-nav4","./css/menu-navigation.css?v=31.0.2.5-sprites1","./assets/brand-wordmark.svg","./assets/menu-senate/title-loop.webp","./assets/menu-senate/title-still.webp","./js/menu-senate.js?v=31.0.2.6","./css/menu-senate.css?v=31.0.2.11-uniform7","./assets/menu-senate/chamber.webp","./assets/menu-senate/leaders-a.webp","./assets/menu-senate/leaders-b.webp","./assets/menu-senate/audience.webp","./fonts/VT323-Regular.ttf","./js/league-rewards.js?v=31.0.2.4-league1","./js/game-select.js?v=31.0.2.6-onboarding1","./css/game-select.css?v=31.0.2.6-onboarding1","./js/orator-catalog.js?v=31.0.2.10","./js/coin-toss.js?v=31.0.2.11-art2","./js/ui-preferences.js?v=31.0.2.11-options5","./js/tactical-practice.js?v=31.0.2.10","./css/readability.css?v=31.0.2.11-options5","./js/basic-effects.js?v=31.0.2.9","./js/basic-ability-preview.js?v=31.0.2.9","./js/battle-status.js?v=31.0.2.8-wave2","./js/balance-review.js?v=31.0.2.10","./js/offline-rules-v1.js?v=31.0.2.3","./css/orator-countries.css?v=31.0.2.3-reading1","./assets/flags/ar.svg","./assets/flags/ca.svg","./assets/flags/de.svg","./assets/flags/es.svg","./assets/flags/fr.svg","./assets/flags/gb.svg","./assets/flags/hu.svg","./assets/flags/it.svg","./assets/flags/mx.svg","./assets/flags/ru.svg","./assets/flags/tr.svg","./assets/flags/us.svg","./assets/flags/ve.svg","./css/progression-ui.css?v=31.0.2.3-reading1","./js/market-tutorial.js?v=31.0.2.4-market2","./js/battle-history-ui.js?v=31.0.2.10","./js/result-tally.js?v=31.0.2.2","./assets/launch/chamber-loop.webp","./assets/launch/chamber-still.webp","./assets/results/victory.webp?v=medium1","./assets/results/victory-still.webp","./assets/results/defeat.webp?v=medium1","./assets/results/defeat-still.webp","./js/economy-client.js?v=31.0.2.6","./js/offline-rules.js?v=31.0.2.3-actions2","./js/offline-rules-v3.js?v=31.0.2.7","./js/offline-rules-v4.js?v=31.0.2.8","./js/offline-rule-dispatch.js?v=31.0.2.10","./js/offline-combat.js?v=31.0.2.10","./js/result-transition.js?v=31.0.2.3-medium1","./css/result-transition.css?v=31.0.2.10-results1","./js/action-cards.js?v=31.0.2.3-actions2","./css/action-cards.css?v=31.0.2.3-reading1","./assets/actions/art-atlas.png","./js/online-ui.js?v=31.0.2.6","./js/online-combat-ui.js?v=31.0.2.5","./css/online.css?v=31.0.2.3-reading1","./fonts/InterVariable.woff2","./css/ui-polish.css?v=31.0.2.3-reading1","./js/objectives.js?v=31.0.2.11-mats3","./css/objectives.css?v=31.0.2.3-reading1","./js/legendary-mastery.js?v=31.0.1.2","./js/legendary-confetti.js?v=31.0.1.2","./css/legendary-confetti.css?v=31.0.2.3-reading1","./js/pack-presentation.js?v=31.0.1.1","./js/game-audio.js?v=31.0.2.11-options5","./css/audio.css?v=31.0.2.5-legal1","./audio/ambience.mp3","./audio/card.mp3","./audio/coin.mp3","./audio/combat-base.mp3","./audio/combat-layer.mp3","./audio/defeat.mp3","./audio/error.mp3","./audio/expel.mp3","./audio/guard.mp3","./audio/heal.mp3","./audio/menu.mp3","./audio/normal.mp3","./audio/pack.mp3","./audio/reward.mp3","./audio/strong.mp3","./audio/timer.mp3","./audio/turn.mp3","./audio/ui.mp3","./audio/victory.mp3","./js/cabinet-presets.js?v=31.0.1.4","./css/cabinets.css?v=31.0.2.3-reading1","./css/packs.css?v=31.0.2.11-frames6","./assets/packs/diario.svg?v=foil2","./assets/packs/semanal.svg?v=foil2","./assets/packs/comun.svg?v=foil2","./assets/packs/raro.svg?v=foil2","./assets/packs/legendario.svg?v=foil2","./assets/packs/mitico.svg?v=foil2","./js/battle-visuals.js?v=31.0.2.8-phrases1","./css/battle-visuals.css?v=31.0.2.8-guide1","./js/battle-actions-ui.js?v=31.0.2.11-mats3","./css/battle-actions.css?v=31.0.2.8-wave2","./js/cloud-save.js?v=31.0.2.2-cloud1","./js/cloud-ui.js?v=31.0.2.3","./css/cloud.css?v=31.0.2.3-reading1","./js/supabase-sdk.js?v=2.118.0","./js/supabase-config.js?v=31.0.0.4","./js/player-profile.js?v=31.0.2.11-polish1","./css/profile.css?v=31.0.2.3-reading1","./js/player-backup.js?v=31.0.2.11","./js/ranked-seasons.js?v=31.0.1.2-season1","./js/menu-tutorial.js?v=31.0.2.11","./js/launch-screen.js?v=31.0.2.6","./css/launch.css?v=31.0.2.5-legal1","./fonts/Anton-Regular.ttf","./js/battle-tutorial.js?v=31.0.2.8-phrases1","./css/tutorial.css?v=31.0.2.6-onboarding1","./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./js/card-confetti.js","./js/app-interaction.js?v=31.0.0.3","./js/changelog.js?v=31.0.2.11-uniform7","./js/market-rules.js?v=31.0.2.0","./js/market-ui.js?v=31.0.2.6","./css/interface.css?v=31.0.2.8-glass1","./cards/donald-trump-golden-portrait.webp?v=nod-60","./cards/donald-trump-golden.webp?v=nod-60","./css/app.css?v=31.0.2.6","./js/operation-status.js?v=31.0.2.6","./js/resource-loading.js?v=31.0.2.6","./js/battle-tips.js?v=31.0.2.8-targets1","./js/battle-rules.js?v=31.0.2.6","./cards/frame.webp","./fuentes/index.html","./css/orator-sources.css?v=31.0.2.6-sources1","./js/orator-sources.js?v=31.0.2.6-sources1","./js/progression-xp.js?v=31.0.2.11","./js/cosmetic-catalog.js?v=31.0.2.11-mats3","./js/cosmetic-ui.js?v=31.0.2.11-frames6","./css/cosmetics.css?v=31.0.2.11-uniform7","./assets/cosmetics/mats/cats.webp","./assets/cosmetics/mats/garden.webp","./assets/cosmetics/mats/imperial.webp","./assets/cosmetics/mats/orbital.webp","./assets/cosmetics/frames/classic.webp","./assets/cosmetics/frames/senate.webp","./assets/cosmetics/frames/parchment.webp","./assets/cosmetics/frames/book.webp","./assets/cosmetics/frames/orbital.webp","./assets/cosmetics/frames/hologram.webp","./assets/cosmetics/level-badge.webp","./assets/cosmetics/profile/badge-parchment.webp","./assets/cosmetics/profile/badge-hologram.webp","./assets/cosmetics/profile/scene-classic.webp","./assets/cosmetics/profile/badge-senate.webp","./assets/cosmetics/profile/badge-orbital.webp","./assets/cosmetics/profile/scene-orbital.webp","./assets/cosmetics/profile/badge-book.webp","./assets/cosmetics/profile/scene-book.webp","./fonts/Lora-Variable.ttf","./fonts/Lora-OFL.txt","./fonts/Rajdhani-Medium.ttf","./fonts/Rajdhani-Bold.ttf","./fonts/Rajdhani-OFL.txt","./assets/cosmetics/backs/classic.webp","./assets/cosmetics/coins/classic-cara.webp","./assets/cosmetics/coins/classic-cruz.webp","./assets/cosmetics/backs/marble.webp","./assets/cosmetics/coins/marble-cara.webp","./assets/cosmetics/coins/marble-cruz.webp","./assets/cosmetics/backs/imperial.webp","./assets/cosmetics/coins/imperial-cara.webp","./assets/cosmetics/coins/imperial-cruz.webp","./assets/cosmetics/backs/orbital.webp","./assets/cosmetics/coins/orbital-cara.webp","./assets/cosmetics/coins/orbital-cruz.webp","./assets/cosmetics/backs/garden.webp","./assets/cosmetics/coins/garden-cara.webp","./assets/cosmetics/coins/garden-cruz.webp","./assets/cosmetics/backs/cats.webp","./assets/cosmetics/coins/cats-cara.webp","./assets/cosmetics/coins/cats-cruz.webp","./assets/cosmetics/mats/classic.webp","./assets/cosmetics/mats/marble.webp","./fonts/Cinzel-Variable.ttf","./fonts/Cinzel-OFL.txt","./fonts/Orbitron-Variable.ttf","./fonts/Orbitron-OFL.txt"];

// Essential scripts stay atomic; unchanged cached media is carried over without
// fetching every animation and track before the new worker can activate.
const essential=url=>url==='./'||url==='./index.html'||url==='./legal/index.html'||url==='./fuentes/index.html'||url==='./pruebas/index.html'||/\.(js|css)(?:\?|$)/.test(url);
const core=url=>/\.(woff2?|ttf|json|txt|svg)(?:\?|$)/.test(url)||/still\.webp|icon-|cards\/frame\.webp/.test(url);
self.addEventListener('install', e => {
 e.waitUntil((async()=>{const cache=await caches.open(CACHE),old=(await caches.keys()).filter(k=>k.startsWith('hemiciclo-')&&k!==CACHE);
 async function load(url,critical){if(!critical)for(const key of old){const hit=await(await caches.open(key)).match(url);if(hit){await cache.put(url,hit);return;}}if(critical||core(url))await cache.add(new Request(url,{cache:'reload'}));}
 await Promise.all(ASSETS.filter(essential).map(url=>load(url,true)));
 await Promise.allSettled(ASSETS.filter(url=>!essential(url)).map(url=>load(url,false)));
 await self.skipWaiting();})());
});
let warming=null;
function warmAssets(options){
 if(warming)return options.force?warming.then(()=>warmAssets(options)):warming;
 const task=(async()=>{const cache=await caches.open(CACHE),jobs=ASSETS.filter(url=>options.force||!options.reducedMotion||!/loop\.webp|assets\/results\/(victory|defeat)\.webp/.test(url));let index=0;
 async function work(){while(index<jobs.length){const url=jobs[index++];if(await cache.match(url))continue;try{await cache.add(new Request(url,{cache:'reload'}));}catch{}}}
 await Promise.all([work(),work()]);let available=0;for(const url of ASSETS)if(await cache.match(url))available++;return {type:'hemicycle:cache-done',available:available,total:ASSETS.length};})();
 warming=task.finally(()=>{warming=null;});return warming;
}
self.addEventListener('message',e=>{if(!e.data||e.data.type!=='hemicycle:cache-warm')return;e.waitUntil(warmAssets(e.data).then(result=>{if(e.ports[0])e.ports[0].postMessage(result);}));});

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
      const scope = new URL(self.registration.scope), pathname = new URL(req.url).pathname;
      const isLegal = pathname === new URL('legal/', scope).pathname || pathname === new URL('legal/index.html', scope).pathname;
      const isSources = pathname === new URL('fuentes/', scope).pathname || pathname === new URL('fuentes/index.html', scope).pathname;
      const isApp = pathname === scope.pathname || pathname === new URL('index.html', scope).pathname;
      const isTrials = pathname === new URL('./pruebas/', self.registration.scope).pathname || pathname === new URL('./pruebas/index.html', self.registration.scope).pathname;
      const documentKey = isTrials ? './pruebas/index.html' : isLegal ? './legal/index.html' : isSources ? './fuentes/index.html' : isApp ? './index.html' : req;
      const saved = await cache.match(documentKey) || (isApp && await cache.match('./'));
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
        e.waitUntil(cache.put(documentKey, res.clone()).catch(() => {}));
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
