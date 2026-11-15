/**
 * Whether an error is a browser failing to load one of the app's own code chunks.
 *
 * A tab opened before a deploy still runs the old build, and the old build asks for chunks by the old names. The
 * new build no longer has them, so the request fails and the page the visitor clicked to never draws (#2945). Each
 * browser words it differently:
 *
 * - Chrome and Edge: `Failed to fetch dynamically imported module: <url>`
 * - Firefox: `error loading dynamically imported module: <url>`
 * - Safari: `Importing a module script failed.`
 * - a webpack build: an error named `ChunkLoadError`, `Loading chunk <n> failed`
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return typeof error === 'string' && CHUNK_LOAD_MESSAGE.test(error);
  }

  const { name, message } = error as { name?: unknown; message?: unknown };

  return name === 'ChunkLoadError' || (typeof message === 'string' && CHUNK_LOAD_MESSAGE.test(message));
}

const CHUNK_LOAD_MESSAGE =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading chunk [\w-]+ failed/i;
