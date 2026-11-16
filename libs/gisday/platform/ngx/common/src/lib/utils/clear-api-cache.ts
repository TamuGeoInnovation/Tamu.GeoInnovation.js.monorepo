/**
 * Deletes the answers the service worker keeps from the API (the `api` data group in ngsw-config.json), so the next
 * person on this browser is not handed an earlier one. Called on Logout: for up to five minutes, a slow network makes
 * the service worker answer from that cache, and an admin's answers carry contact details and speakers' emails, which
 * the API sends to admins only (decided 6 November 2026).
 *
 * The service worker names those caches `ngsw:<scope>:<version>:data:api:<part>`. Never fails: a browser without the
 * Cache API, or one that refuses, simply has nothing deleted.
 */
export async function clearApiCache(store: CacheStorage | undefined = globalThis.caches): Promise<number> {
  if (!store) {
    return 0;
  }

  try {
    const names = (await store.keys()).filter((name) => name.startsWith('ngsw:') && name.includes(':data:api:'));
    const deleted = await Promise.all(names.map((name) => store.delete(name)));

    return deleted.filter(Boolean).length;
  } catch {
    return 0;
  }
}
