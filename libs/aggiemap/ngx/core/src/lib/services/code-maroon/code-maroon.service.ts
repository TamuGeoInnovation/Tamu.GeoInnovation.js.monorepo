import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer, of } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';

import { parseCodeMaroonFeed } from './code-maroon.parser';
import { CodeMaroonAlert, CodeMaroonState } from './code-maroon.types';

/**
 * Reads the Code Maroon feed and says what it found (#1289).
 *
 * **The path is same-origin on purpose.** codemaroon.tamu.edu sends no `Access-Control-Allow-Origin`,
 * so the browser cannot read it directly. AggieMap's nginx reverse-proxies it, and that proxy also
 * caches the response for fifteen seconds - which is what keeps the load on Code Maroon fixed at
 * roughly four requests a minute however many people have a map open. That matters most during an
 * emergency, when visitors spike and their system must not.
 */
export const CODE_MAROON_FEED = '/code-maroon/feed.xml';

/**
 * How often each open map asks.
 *
 * Thirty seconds, against a fifteen second cache, puts the worst case between an alert being
 * published and appearing on the map at about forty-five seconds. Both numbers can come down; the
 * cost is requests to Code Maroon.
 */
export const CODE_MAROON_POLL_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class CodeMaroonService {
  private readonly _state = new BehaviorSubject<CodeMaroonState>({
    status: 'loading',
    alerts: [],
    sample: false
  });

  public readonly state: Observable<CodeMaroonState> = this._state.asObservable();

  constructor(private readonly http: HttpClient) {}

  /**
   * Polls until the returned observable is unsubscribed.
   *
   * `timer` rather than `interval` so the first read happens immediately: a visitor arriving during
   * an emergency should not wait thirty seconds to be told.
   */
  public watch(intervalMs: number = CODE_MAROON_POLL_MS): Observable<CodeMaroonState> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.read()),
      tap((state) => this._state.next(state)),
      map(() => this._state.value)
    );
  }

  /** One read. Never throws: a failure is a state, not an exception. */
  public read(): Observable<CodeMaroonState> {
    return this.http.get(CODE_MAROON_FEED, { responseType: 'text' }).pipe(
      map((xml) => {
        const alerts = parseCodeMaroonFeed(xml);

        return {
          status: alerts.length > 0 ? ('active' as const) : ('clear' as const),
          alerts,
          checkedAt: new Date(),
          sample: false
        };
      }),
      catchError((error) =>
        of({
          // Not folded into "clear". A map that shows nothing because the feed failed, while an
          // emergency is under way, is the worst thing this could do - so it is said out loud.
          status: 'unreachable' as const,
          alerts: [],
          checkedAt: new Date(),
          error: error?.message ?? 'The Code Maroon feed could not be read',
          sample: false
        })
      )
    );
  }

  /**
   * Shows a sample alert instead of live data, for demonstrating the map while the feed is empty -
   * which is its normal state between alerts.
   *
   * Everything shown this way is marked as a sample on screen and the route is development-only.
   * Fabricated emergency text that could be mistaken for a real alert is a hazard, not a demo.
   */
  public showSample(alerts: CodeMaroonAlert[]): void {
    this._state.next({
      status: alerts.length > 0 ? 'active' : 'clear',
      alerts,
      checkedAt: new Date(),
      sample: true
    });
  }
}
