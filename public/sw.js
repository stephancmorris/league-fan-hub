if (!self.define) {
  let e,
    s = {}
  const a = (a, t) => (
    (a = new URL(a + '.js', t).href),
    s[a] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script')
          ;((e.src = a), (e.onload = s), document.head.appendChild(e))
        } else ((e = a), importScripts(a), s())
      }).then(() => {
        let e = s[a]
        if (!e) throw new Error(`Module ${a} didn’t register its module`)
        return e
      })
  )
  self.define = (t, i) => {
    const n = e || ('document' in self ? document.currentScript.src : '') || location.href
    if (s[n]) return
    let c = {}
    const r = (e) => a(e, n),
      o = { module: { uri: n }, exports: c, require: r }
    s[n] = Promise.all(t.map((e) => o[e] || r(e))).then((e) => (i(...e), c))
  }
}
define(['./workbox-4754cb34'], function (e) {
  'use strict'
  ;(importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        { url: '/_next/app-build-manifest.json', revision: '784897a87cddffccbb729de0ecae27d7' },
        {
          url: '/_next/static/1AUzza8LAUgdl_m2hg1nJ/_buildManifest.js',
          revision: '4a5186f4061ae19bd063993c13cd21e5',
        },
        {
          url: '/_next/static/1AUzza8LAUgdl_m2hg1nJ/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        { url: '/_next/static/chunks/197-63b5e6311babf9d8.js', revision: '63b5e6311babf9d8' },
        { url: '/_next/static/chunks/231.aa465a0b458bce47.js', revision: 'aa465a0b458bce47' },
        { url: '/_next/static/chunks/255-55a7b5c136cc37c0.js', revision: '55a7b5c136cc37c0' },
        { url: '/_next/static/chunks/26-a2103e6382a4395a.js', revision: 'a2103e6382a4395a' },
        { url: '/_next/static/chunks/356-4fbb963125176205.js', revision: '4fbb963125176205' },
        { url: '/_next/static/chunks/4bd1b696-409494caf8c83275.js', revision: '409494caf8c83275' },
        { url: '/_next/static/chunks/560-5038bf22800e4eb9.js', revision: '5038bf22800e4eb9' },
        { url: '/_next/static/chunks/619-f072ac750404f9da.js', revision: 'f072ac750404f9da' },
        { url: '/_next/static/chunks/698.5569d7d0b130d6aa.js', revision: '5569d7d0b130d6aa' },
        { url: '/_next/static/chunks/72-b3a0b6d09a162b0d.js', revision: 'b3a0b6d09a162b0d' },
        { url: '/_next/static/chunks/932.129940dc9612cb44.js', revision: '129940dc9612cb44' },
        { url: '/_next/static/chunks/aaea2bcf-e726b3f47dfe43dc.js', revision: 'e726b3f47dfe43dc' },
        {
          url: '/_next/static/chunks/app/_not-found/page-93c5e2ace598f3af.js',
          revision: '93c5e2ace598f3af',
        },
        {
          url: '/_next/static/chunks/app/api/admin/matches/%5BmatchId%5D/calculate-points/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/admin/matches/%5BmatchId%5D/update/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/admin/users/%5BuserId%5D/role/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/admin/users/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/auth/%5Bauth0%5D/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/auth/sync/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/leaderboard/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/matches/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/notifications/subscribe/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/notifications/unsubscribe/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/predictions/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/predictions/submit/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/protected/profile/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/api/users/%5BuserId%5D/stats/route-a319066441285677.js',
          revision: 'a319066441285677',
        },
        {
          url: '/_next/static/chunks/app/error/auth/page-acd57abca2384438.js',
          revision: 'acd57abca2384438',
        },
        {
          url: '/_next/static/chunks/app/layout-1b99282b0f695991.js',
          revision: '1b99282b0f695991',
        },
        {
          url: '/_next/static/chunks/app/leaderboard/page-52dcc9411cb0021d.js',
          revision: '52dcc9411cb0021d',
        },
        {
          url: '/_next/static/chunks/app/matches/page-eae72f32377c3c6f.js',
          revision: 'eae72f32377c3c6f',
        },
        {
          url: '/_next/static/chunks/app/offline/page-a8fa344fd2ec221a.js',
          revision: 'a8fa344fd2ec221a',
        },
        { url: '/_next/static/chunks/app/page-08402b19d161fb6a.js', revision: '08402b19d161fb6a' },
        {
          url: '/_next/static/chunks/app/predictions/page-894ab9a654fbc825.js',
          revision: '894ab9a654fbc825',
        },
        {
          url: '/_next/static/chunks/app/settings/page-8e997243cf47bf6b.js',
          revision: '8e997243cf47bf6b',
        },
        { url: '/_next/static/chunks/framework-3311683cffde0ebf.js', revision: '3311683cffde0ebf' },
        { url: '/_next/static/chunks/main-app-86f877d86f1780c4.js', revision: '86f877d86f1780c4' },
        { url: '/_next/static/chunks/main-ff03f7423e3bf248.js', revision: 'ff03f7423e3bf248' },
        {
          url: '/_next/static/chunks/pages/_app-5addca2b3b969fde.js',
          revision: '5addca2b3b969fde',
        },
        {
          url: '/_next/static/chunks/pages/_error-022e4ac7bbb9914f.js',
          revision: '022e4ac7bbb9914f',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        { url: '/_next/static/chunks/webpack-533f17816d24266b.js', revision: '533f17816d24266b' },
        { url: '/_next/static/css/7014542773fb444f.css', revision: '7014542773fb444f' },
        {
          url: '/_next/static/media/19cfc7226ec3afaa-s.woff2',
          revision: '9dda5cfc9a46f256d0e131bb535e46f8',
        },
        {
          url: '/_next/static/media/21350d82a1f187e9-s.woff2',
          revision: '4e2553027f1d60eff32898367dd4d541',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/ba9851c3c22cd980-s.woff2',
          revision: '9e494903d6b0ffec1a1e14d34427d44d',
        },
        {
          url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2',
          revision: '027a89e9ab733a145db70f09b8a18b42',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        { url: '/manifest.json', revision: '359a753d3e96d37328c58bcb8eddcde1' },
        { url: '/robots.txt', revision: '6bba05e052d0be285371f33ba4d48471' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({ request: e, response: s, event: a, state: t }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-webfonts',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: 'google-fonts-stylesheets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-image',
        plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: 'static-audio-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: 'static-video-assets',
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: 'next-data',
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /\/api\/.*$/i,
      new e.NetworkFirst({
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ),
    e.registerRoute(
      /.*/i,
      new e.NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
      }),
      'GET'
    ))
})
