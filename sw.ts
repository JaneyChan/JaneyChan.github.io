/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
declare let self: ServiceWorkerGlobalScope

precacheAndRoute(self.__WB_MANIFEST || [])

self.skipWaiting()
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('message', (event: ExtendableMessageEvent) => {
    const data = (event.data || {}) as { type?: string; urls?: string[] }
    if (data.type === 'CACHE_URLS' && Array.isArray(data.urls)) {
        event.waitUntil((async () => {
            const cache = await caches.open('4dv-runtime-v1')
            await Promise.all(data.urls.map(async (u) => {
                try {
                    const r = await fetch(u, { cache: 'no-store', mode: 'cors', credentials: 'omit' })
                    if (!r.ok) throw new Error(String(r.status))
                    await cache.put(u, r.clone())
                } catch {
                    const r2 = await fetch(u, { cache: 'no-store', mode: 'no-cors', credentials: 'omit' })
                    await cache.put(u, r2.clone())
                }
            }))
        })())
    }
})
