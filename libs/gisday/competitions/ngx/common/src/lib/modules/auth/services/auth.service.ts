import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Subject, BehaviorSubject, of, Observable } from 'rxjs';

import { SettingsService } from '@tamu-gisc/common/ngx/settings';
import { pluck, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class AuthService {
  public authenticationDetails: Subject<object> = new BehaviorSubject({});

  constructor(private environment: EnvironmentService, private settings: SettingsService, private router: Router) {
    this.settings
      .init({
        settings: {
          guid: {
            value: undefined,
            persistent: true
          }
        },
        storage: {
          subKey: this.environment.value('LocalStoreSettings').subKey
        }
      })
      .subscribe((s) => {});
  }

  public authenticate(navigate?: string) {
    const windowContext = window.open(this.environment.value('AuthLoginUrl'));

    window.addEventListener('message', (e: MessageEvent) => {
      this.authorize(e.data);

      windowContext.close();

      if (navigate !== undefined) {
        this.router.navigate([navigate]);
      }
    });
  }

  /**
   * Sets the user Guid of the `authenticate` method in local storage.
   */
  private authorize(payload: IAuthPollResponse) {
    this.settings.updateSettings({ guid: payload.Guid });
  }

  /**
   * Handles checking if userGuid exists in local storage.
   *
   * Re-directs to login if not authenticated.
   */
  public isAuthenticated(): Observable<boolean> {
    return this.settings.getSimpleSettingsBranch(this.environment.value('LocalStoreSettings').subKey).pipe(
      pluck('guid'),
      switchMap((guid) => {
        return of(guid !== undefined);
      }),
      tap((can) => {
        if (Boolean(can) === false) {
          this.router.navigate(['login']);
        }
      })
    );
  }
}

interface IAuthPollResponse {
  Guid: string;
}
