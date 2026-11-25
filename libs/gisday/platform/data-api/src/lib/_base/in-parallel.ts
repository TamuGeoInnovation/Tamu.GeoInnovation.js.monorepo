/**
 * How many emails a bulk send has in flight at once (#3067). One at a time, 48 profile emails took long enough for the
 * request to be given up on and repeated, so everyone got two (#3065). A few lanes keep it to seconds without flooding the
 * mailroom.
 */
export const EMAIL_LANES = 5;

/**
 * `work` for each item, at most `lanes` at a time, with the results in the items' order whatever order they finish in.
 * A rejection is the caller's to catch inside `work`: one that escapes stops nothing already running, and rejects the whole.
 */
export async function inParallel<T, R>(
  items: ReadonlyArray<T>,
  lanes: number,
  work: (item: T, index: number) => Promise<R>
): Promise<Array<R>> {
  const results = new Array<R>(items.length);
  let next = 0;

  const lane = async () => {
    while (next < items.length) {
      const index = next++;

      results[index] = await work(items[index], index);
    }
  };

  await Promise.all(Array.from({ length: Math.min(Math.max(lanes, 1), items.length) }, lane));

  return results;
}
