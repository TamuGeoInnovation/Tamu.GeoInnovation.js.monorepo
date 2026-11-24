import { inParallel } from './in-parallel';

/** #3067: bulk sends run a few at a time, with their results in order. */
describe('inParallel', () => {
  it('runs at most the given number at once, and keeps the results in order', async () => {
    let running = 0;
    let most = 0;
    const results = await inParallel([30, 10, 20, 5, 15, 1], 3, async (ms, i) => {
      running++;
      most = Math.max(most, running);
      await new Promise((r) => setTimeout(r, ms));
      running--;

      return i;
    });

    expect(results).toEqual([0, 1, 2, 3, 4, 5]);
    expect(most).toBe(3);
  });

  it('gives nothing for nothing', async () => {
    expect(await inParallel([], 5, async () => 1)).toEqual([]);
  });
});
