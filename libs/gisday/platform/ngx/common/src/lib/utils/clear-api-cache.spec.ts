import { clearApiCache } from './clear-api-cache';

/** A Cache API holding `names`, which records what is deleted. */
function storeWith(names: Array<string>) {
  const deleted: Array<string> = [];
  const store = {
    keys: () => Promise.resolve([...names]),
    delete: (name: string) => {
      deleted.push(name);
      return Promise.resolve(true);
    }
  } as unknown as CacheStorage;

  return { store, deleted };
}

describe('clearApiCache', () => {
  it("deletes the service worker's cached API answers and nothing else", async () => {
    const { store, deleted } = storeWith([
      'ngsw:/:1:data:api:cache',
      'ngsw:/:1:data:api:lru',
      'ngsw:/:1:data:api:age',
      'ngsw:/:db:control',
      'ngsw:/:1:assets:app:cache',
      'something-else'
    ]);

    expect(await clearApiCache(store)).toBe(3);
    expect(deleted).toEqual(['ngsw:/:1:data:api:cache', 'ngsw:/:1:data:api:lru', 'ngsw:/:1:data:api:age']);
  });

  it('does nothing without the Cache API', async () => {
    expect(await clearApiCache(undefined)).toBe(0);
  });

  it('never fails, so Logout still happens', async () => {
    const store = { keys: () => Promise.reject(new Error('refused')) } as unknown as CacheStorage;

    expect(await clearApiCache(store)).toBe(0);
  });
});
