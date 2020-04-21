import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { User, CountyClaim } from '@tamu-gisc/covid/common/entities';
import { LocalStoreService, StorageConfig } from '@tamu-gisc/common/ngx/local-store';
import { UsersService, CountyClaimsService } from '@tamu-gisc/geoservices/data-access';
import { tap } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

const storageOptions: Partial<StorageConfig> = { primaryKey: 'tamu-covid-vgi' };

const defaultStorage: CovidLocalStoreIdentity = {
  claim: {
    guid: undefined,
    county: {
      countyFips: undefined
    }
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

  constructor(private localStorage: LocalStoreService, private user: UsersService, private claim: CountyClaimsService) {
    this.validateLocalIdentity();
  }

  private validateLocalIdentity() {
    const ident = this.localStorage.getStorage(storageOptions) as CovidLocalStoreIdentity;

    if (ident && ident.user && ident.user.email) {
      this.user.verifyEmail(ident.user.email).subscribe((user) => {
        if (user.guid) {
          this.localStorage.setStorage({ ...storageOptions, value: { user: user } });

          this._identity.next(this.localStorage.getStorage(storageOptions));

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
      this.localStorage.setStorage({ ...storageOptions, value: { user: res } });

      this._identity.next(this.localStorage.getStorage(storageOptions));

      this.assignLocalActiveClaim(res.email);
    });
  }

  /**
   * Using the local stored email, that has been verified at this point, assign any claims assigned to the verified email.
   */
  public assignLocalActiveClaim(email: string) {
    this.claim.getActiveClaimsForUser(email).subscribe((claims) => {
      if (claims.length > 0) {
        this.localStorage.setStorageObjectKeyValue({ ...storageOptions, subKey: 'claim', value: claims[0] });

        this._identity.next(this.localStorage.getStorage(storageOptions));
      } else {
        this.localStorage.setStorageObjectKeyValue({ ...storageOptions, subKey: 'claim', value: undefined });

        this._identity.next(this.localStorage.getStorage(storageOptions));
      }
    });
  }

  public registerCountyClaim(claim: DeepPartial<CountyClaim>, phoneNumbers?, websites?) {
    return this.claim.registerClaim(claim, phoneNumbers, websites).pipe(
      tap((registration) => {
        if (registration.guid) {
          this.localStorage.setStorageObjectKeyValue({ ...storageOptions, subKey: 'claim', value: registration });

          this._identity.next(this.localStorage.getStorage(storageOptions));
        } else {
          console.error('There was an error claiming this county:', registration);
        }
      })
    );
  }

  public unregisterCountyClaim(claim?: DeepPartial<CountyClaim>) {
    const c = claim && claim.guid ? claim.guid : this._identity.value.claim.guid;

    this.claim.closeClaim(c).subscribe((res) => {
      const options: CovidLocalStoreIdentity = this.localStorage.getStorage(storageOptions);

      options.claim = {
        county: {}
      };

      this.localStorage.setStorage({ ...storageOptions, value: options });

      this._identity.next(this.localStorage.getStorage(storageOptions));
    });
  }

  public refresh(){
    this.validateLocalIdentity();
  }
}

interface CovidLocalStoreIdentity {
  claim: DeepPartial<CountyClaim>;
  user: Partial<User>;
}
