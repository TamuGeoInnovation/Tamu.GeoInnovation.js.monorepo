import { HttpException } from '@nestjs/common';

/**
 * For a catch block: an HttpException carries a deliberate status, so it is thrown as it is; anything else is thrown as
 * `fallback`, after `log` if it is given. Re-wrapping every error had turned intended 404s and 422s into 500s, so the caller could not tell "not
 * found" from "server broke". That catch block, and its comment, was pasted 62 times in 17 files (#3324).
 */
export function rethrowHttp(err: unknown, fallback: HttpException, log?: () => void): never {
  if (err instanceof HttpException) {
    throw err;
  }

  // Only what was not deliberate is logged, as each catch block did.
  log?.();

  throw fallback;
}
