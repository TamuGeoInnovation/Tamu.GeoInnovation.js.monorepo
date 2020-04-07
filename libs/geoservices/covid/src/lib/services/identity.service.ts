import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { County, User } from '@tamu-gisc/covid/common/entities';
import { LocalStoreService, StorageConfig } from '@tamu-gisc/common/ngx/local-store';
import { UsersService } from '@tamu-gisc/geoservices/data-access';

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

  constructor(private localStorage: LocalStoreService, private user: UsersService) {
    this._identity.next(this.localStorage.getStorage(storageOptions));

    this.validateLocalIdentity();
  }

  private validateLocalIdentity() {
    const ident = this._identity.getValue();

    if (ident && ident.user && ident.user.email) {
      this.user.verifyEmail(ident.user.email).subscribe((user) => {
        if (user.guid) {
          this._identity.next({ ...this.localStorage.getStorage(storageOptions), user });
        } else {
          this.resetLocalIdentity();
        }
      });
    } else {
      this.resetLocalIdentity();
    }
  }

  private resetLocalIdentity() {
    console.warn('Missing or incorrect identity schema. Setting to default.');

    this.localStorage.setStorage({ ...storageOptions, value: defaultStorage });
  }

  public registerEmail(email: string) {
    this.user.registerEmail(email).subscribe((res: Partial<User>) => {
      this.localStorage.setStorageObjectKeyValue({ ...storageOptions, subKey: 'user', value: res });

      this._identity.next(this.localStorage.getStorage(storageOptions));
    });
  }
}

interface CovidLocalStoreIdentity {
  county: Partial<County>;
  user: Partial<User>;
}
