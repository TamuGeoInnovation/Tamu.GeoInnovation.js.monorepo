import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { County, User } from '@tamu-gisc/covid/common/entities';
import { LocalStoreService, StorageConfig } from '@tamu-gisc/common/ngx/local-store';
import { UsersService, CountiesService } from '@tamu-gisc/geoservices/data-access';
import { tap } from 'rxjs/operators';

const storageOptions: Partial<StorageConfig> = { primaryKey: 'tamu-covid-vgi' };

const defaultStorage: CovidLocalStoreIdentity = {
  county: {
    countyFips: undefined
  },
  user: {
    guid: undefined,
    email: undefined
  }
};

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  private _identity: BehaviorSubject<CovidLocalStoreIdentity> = new BehaviorSubject(defaultStorage);
  public identity: Observable<CovidLocalStoreIdentity> = this._identity.asObservable();

  constructor(private localStorage: LocalStoreService, private user: UsersService, private county: CountiesService) {
    this.validateLocalIdentity();
  }

  private validateLocalIdentity() {
    const ident = this.localStorage.getStorage(storageOptions) as CovidLocalStoreIdentity;

    if (ident && ident.user && ident.user.email) {
      this.user.verifyEmail(ident.user.email).subscribe((user) => {
        if (user.guid) {
          this._identity.next({ ...this.localStorage.getStorage(storageOptions), user });

          this.assignLocalActiveClaim(user.email);
        } else {
          this.resetLocalIdentity();
        }
      });
    } else {
      this.resetLocalIdentity();
    }
  }

  /**
   * Resets whatever local store schema value. This is used when the schema changes and needs to
   * be updated on the client side.
   */
  private resetLocalIdentity() {
    console.warn('Missing or incorrect identity schema. Setting to default.');

    this.localStorage.setStorage({ ...storageOptions, value: defaultStorage });
  }

  /**
   * Register or validate an email.
   *
   * Sets the local store user.
   */
  public registerEmail(email: string) {
    this.user.registerEmail(email).subscribe((res: Partial<User>) => {
      this.localStorage.setStorageObjectKeyValue({ ...storageOptions, subKey: 'user', value: res });

      this._identity.next(this.localStorage.getStorage(storageOptions));

      this.assignLocalActiveClaim(res.email);
    });
  }

  /**
   * Using the local stored email, that has been verified at this point, assign any claims assigned to the verified email.
   */
  public assignLocalActiveClaim(email: string) {
    this.county.getClaimsForUser(email).subscribe((claims) => {
      if (claims.length > 0) {
        this.localStorage.setStorageObjectKeyValue({ ...storageOptions, subKey: 'county', value: claims[0].county });

        this._identity.next(this.localStorage.getStorage(storageOptions));
      }
    });
  }

  public registerCountyClaim(email: string, countyFips: number) {
    return this.county.registerUserToCounty(email, countyFips).pipe(
      tap((registration) => {
        if (registration.guid) {
          this.localStorage.setStorageObjectKeyValue({ ...storageOptions, subKey: 'county', value: registration.county });

          this._identity.next(this.localStorage.getStorage(storageOptions));
        } else {
          console.error('There was an error claiming this county:', registration);
        }
      })
    );
  }
}

interface CovidLocalStoreIdentity {
  county: Partial<County>;
  user: Partial<User>;
}
