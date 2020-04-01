import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, Observable, Subject } from 'rxjs';
import { switchMap, startWith, take } from 'rxjs/operators';

import { UsersService } from '@tamu-gisc/geoservices/data-access';
import { LocalStoreService } from '@tamu-gisc/common/ngx/local-store';

const storageOptions = { primaryKey: 'tamu-covid-vga' };

@Component({
  selector: 'tamu-gisc-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public form: FormGroup;

  /**
   * Email from local storage
   */
  public storeEmail: Observable<string>;

  /**
   * Used as a scheduler to retrieved the email local storage value.
   */
  public registerUpdate: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private user: UsersService, private localStore: LocalStoreService) {}

  public ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.required]
    });

    this.storeEmail = this.registerUpdate.pipe(
      startWith(true),
      switchMap((value) => {
        return of(
          this.localStore.getStorageObjectKeyValue({
            ...storageOptions,
            subKey: 'email'
          })
        ) as Observable<string>;
      })
    );

    this.storeEmail.pipe(take(1)).subscribe((email) => {
      // Check if email has been set in local storage. If it has, verify with server.
      if (email && email.length > 0) {
        this.user.verifyEmail(email).subscribe((response) => {
          if (response.email) {
            this.form.setValue({ email: response.email });
          }
        });
      }
    });
  }

  public handleUserLink() {
    this.user.registerEmail(this.form.getRawValue().email).subscribe((res) => {
      this.localStore.setStorageObjectKeyValue({ ...storageOptions, subKey: 'email', value: res.email });

      this.registerUpdate.next(true);
    });
  }
}
