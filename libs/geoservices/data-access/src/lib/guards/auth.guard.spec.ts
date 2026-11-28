import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { Observable, of, firstValueFrom, throwError } from 'rxjs';

import { AuthGuard } from './auth.guard';
import { AuthService, LoggedInState } from '../services/auth/auth.service';

// What the guard actually does, rather than that it can be constructed. The spec here was a generator scaffold -
// `should ...` with `toBeTruthy` - which is the shape CLAUDE.md asks nobody to commit, and it is why the `api`
// redirect below went unnoticed: `api` is not a route in geoservices-angular, whose paths are `internal`, `docs`
// and `''`. The guard is not wired to a route today, deliberately and for recorded reasons (#1877, #3919), so these
// cases are what the decision there starts from.
describe('AuthGuard', () => {
  const guardWith = (state: Observable<LoggedInState>): AuthGuard => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { state } }]
    });

    return TestBed.inject(AuthGuard);
  };

  const signedIn: LoggedInState = { loggedIn: true, isManager: false, data: null };
  const signedOut: LoggedInState = { loggedIn: false, isManager: false, data: null };

  it('lets a signed-in visitor through', async () => {
    const guard = guardWith(of(signedIn));

    await expect(firstValueFrom(guard.canActivate() as Observable<boolean | UrlTree>)).resolves.toBe(true);
  });

  it('lets a signed-in visitor through to a child route too', async () => {
    const guard = guardWith(of(signedIn));

    await expect(firstValueFrom(guard.canActivateChild() as Observable<boolean | UrlTree>)).resolves.toBe(true);
  });

  it('sends a signed-out visitor to api, which is not a route in this application (#3919)', async () => {
    const guard = guardWith(of(signedOut));

    const result = await firstValueFrom(guard.canActivate() as Observable<boolean | UrlTree>);

    expect(result).toBeInstanceOf(UrlTree);
    expect(String(result)).toBe('/api');
  });

  it('can always be loaded, so the pages are fetched either way', () => {
    const guard = guardWith(of(signedOut));

    expect(guard.canLoad()).toBe(true);
  });

  // The guard has no error handling of its own: it passes whatever AuthService.state emits. Today that is safe,
  // because AuthService catches its own HTTP failures and reports `loggedIn: false` - which is the risk recorded on
  // #3919, since a briefly unreachable legacy API then reads as signed out and would turn a signed-in user away.
  // This case is what would happen if that catch were ever removed: the guard would throw rather than redirect.
  it('passes an error through, having no handling of its own', async () => {
    const guard = guardWith(throwError(() => new Error('legacy API unreachable')));

    await expect(firstValueFrom(guard.canActivate() as Observable<boolean | UrlTree>)).rejects.toThrow(
      'legacy API unreachable'
    );
  });
});
