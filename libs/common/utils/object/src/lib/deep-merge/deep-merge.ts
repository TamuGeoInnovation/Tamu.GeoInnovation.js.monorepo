/**
 * Keys that are never copied: assigning `__proto__` changes an object's prototype, and `constructor` and `prototype`
 * reach the same place through a class. A merge that copies them from untrusted input is prototype poisoning
 * (GHSA-gcqx-w48m-w2h4, the advisory against `deepmerge` 4.3.1, which this replaces in our code, #2698).
 */
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** An object made by `{}`, `Object.create(null)` or `JSON.parse`: the only kind that is merged key by key. */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

/** A copy of a value: plain objects and arrays are copied all the way down, anything else is kept as it is. */
function copy(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(copy);
  }

  if (isPlainObject(value)) {
    return merge({}, value);
  }

  return value;
}

function merge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const key of Object.keys(target)) {
    if (!UNSAFE_KEYS.has(key)) {
      result[key] = copy(target[key]);
    }
  }

  for (const key of Object.keys(source)) {
    if (UNSAFE_KEYS.has(key)) {
      continue;
    }

    const existing = result[key];
    const incoming = source[key];

    result[key] = isPlainObject(existing) && isPlainObject(incoming) ? merge(existing, incoming) : copy(incoming);
  }

  return result;
}

/**
 * `source` merged into `target`, as a new object. Neither input is changed.
 *
 * Plain objects are merged key by key, at any depth. Everything else in `source` replaces what `target` had: an array
 * replaces an array (it is not concatenated), and a class, a class instance, a `Date` or a function is kept as the
 * same reference. The keys `__proto__`, `constructor` and `prototype` are skipped wherever they appear.
 *
 * Written for the event maps' layer overrides (`{ visible: false }`, `{ native: { visible, listMode } }`,
 * `{ popupComponent: SomeClass }`), for which it gives what `deepmerge` 4.3.1 gave.
 */
export function deepMerge<T extends object, S extends object>(target: T, source: S): T & S {
  return merge(target as Record<string, unknown>, source as Record<string, unknown>) as T & S;
}
