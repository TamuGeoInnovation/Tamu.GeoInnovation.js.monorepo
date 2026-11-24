import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, filter, map, of, switchMap, take } from 'rxjs';

import { Event } from '@tamu-gisc/gisday/platform/data-api';
import { CheckinService, EventService, UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CHECK_IN_CODE_KEPT, CHECK_IN_CODE_PARAM } from '@tamu-gisc/gisday/common';

/**
 * Where a QR code check-in stands (#3081). Each is the whole page, so an attendee is never left wondering.
 */
export type CheckInState =
  'checking' | 'signing-in' | 'signed-out' | 'profile' | 'done' | 'already' | 'failed' | 'no-code' | 'not-found';

/**
 * The page a session's check-in QR code opens (#3081): "Checking you in…", then the outcome in words (checked in, already
 * checked in, or why not), with a button to the session's page. Nothing moves on by itself, so the status stays on screen
 * until the attendee has read it. Signed out, it sends them to sign-in (Auth0's page also offers sign-up) once per scan,
 * and sign-in brings them back here with the code.
 */
@Component({
  selector: 'tamu-gisc-event-checkin',
  templateUrl: './event-checkin.component.html',
  styleUrls: ['./event-checkin.component.scss'],
  imports: [RouterLink, ButtonComponent]
})
export class EventCheckinComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly events = inject(EventService);
  private readonly checkins = inject(CheckinService);
  private readonly users = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly state = signal<CheckInState>('checking');
  public readonly event = signal<Partial<Event>>(undefined);

  /** Why it did not work, in the API's words where it gave them. */
  public readonly reason = signal<string>(undefined);

  public readonly guid = this.route.snapshot.paramMap.get('guid');
  /** The QR code's code: kept by the page, which takes it out of the address before anything reports it (#2572). */
  private readonly code = this.route.snapshot.queryParamMap.get(CHECK_IN_CODE_PARAM) ?? keptCode();

  public ngOnInit(): void {
    if (!this.code) {
      this.state.set('no-code');
      return;
    }

    this.events
      .getEvent(this.guid)
      .pipe(
        catchError(() => of(null)),
        switchMap((event) => {
          if (!event) {
            this.state.set('not-found');
            return of(undefined);
          }

          this.event.set(event);

          return this.auth.isAuthenticated$.pipe(take(1));
        }),
        filter((loggedIn) => loggedIn !== undefined),
        switchMap((loggedIn) => {
          if (!loggedIn) {
            if (firstSignInForCode(this.code)) {
              this.state.set('signing-in');
              this.signIn();
            } else {
              this.state.set('signed-out');
            }

            return of(undefined);
          }

          return this.auth.user$.pipe(
            take(1),
            switchMap((user) => this.users.getUserMetadata(user.sub)),
            map((info) => info?.app_metadata?.gisday?.completedProfile === true),
            // The API decides in the end; a profile that cannot be read does not stop the attempt.
            catchError(() => of(true))
          );
        }),
        filter((profileComplete) => profileComplete !== undefined),
        switchMap((profileComplete) => {
          if (!profileComplete) {
            this.state.set('profile');
            return of(undefined);
          }

          return this.checkins.getUserCheckinForEvent(this.guid).pipe(
            map(() => 'already' as const),
            catchError(() =>
              this.checkins.insertUserCheckin(this.guid, undefined, this.code).pipe(
                map(() => 'done' as const),
                catchError((err) => {
                  this.reason.set(
                    err instanceof HttpErrorResponse && err.error?.message
                      ? err.error.message
                      : 'Check-in did not work. Scan the code again, or ask a GIS Day organizer for help.'
                  );

                  return of('failed' as const);
                })
              )
            )
          );
        }),
        filter((outcome) => outcome !== undefined),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((outcome) => this.state.set(outcome));
  }

  /** Signs in or up, and comes back to this page with its code. */
  public signIn() {
    this.auth.login({ appState: { target: this.router.url } });
  }
}

/**
 * The check-in code the page took out of this page's address, if it did (#2572). Sign-in comes back to the same tab, so it
 * is still there afterwards.
 */
function keptCode(): string | undefined {
  try {
    return sessionStorage.getItem(CHECK_IN_CODE_KEPT + location.pathname) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Whether this tab has not yet been sent to sign-in for this check-in code, and marks it sent, so someone who cancels
 * sign-in comes back to the page and its button rather than being sent away again. Without storage every arrival counts
 * as the first.
 */
function firstSignInForCode(code: string): boolean {
  const key = `gisday-checkin-sign-in:${code}`;

  try {
    if (sessionStorage.getItem(key)) {
      return false;
    }

    sessionStorage.setItem(key, '1');
  } catch {
    // Storage refused: send them to sign-in anyway.
  }

  return true;
}
