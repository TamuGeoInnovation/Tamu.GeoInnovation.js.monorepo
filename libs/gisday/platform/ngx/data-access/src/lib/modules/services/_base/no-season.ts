import { HttpErrorResponse } from '@angular/common/http';
import { catchError, MonoTypeOperatorFunction, of, throwError } from 'rxjs';

/**
 * Answers `fallback` when the API says there is no active season, and fails on anything else.
 *
 * A site with no season yet, such as a new one, gets a 404 from every request about the active season
 * ("No active season found."). That is an answer, not a failure: there is no season, and nothing in it.
 * Left as an error it ended the observables pages wait on, so they showed spinners for ever (#2076).
 *
 * @example this.http.get<Array<Tag>>(`${url}/season/active`).pipe(noSeasonAs([]))
 */
export function noSeasonAs<T>(fallback: T): MonoTypeOperatorFunction<T> {
  return catchError((error: unknown) =>
    error instanceof HttpErrorResponse && error.status === 404 ? of(fallback) : throwError(() => error)
  );
}
