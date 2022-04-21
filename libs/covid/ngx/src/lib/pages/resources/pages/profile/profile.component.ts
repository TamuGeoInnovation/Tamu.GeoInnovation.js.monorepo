import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, of } from 'rxjs';
import { pluck, switchMap } from 'rxjs/operators';

import { User } from '@tamu-gisc/covid/common/entities';

import { IdentityService } from '../../../../services/identity.service';

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
  public storeEmail: Observable<Partial<User['email']>>;

  /**
   * Used as a scheduler to retrieved the email local storage value.
   */
  public registerUpdate: Subject<boolean> = new Subject();

  constructor(private fb: FormBuilder, private is: IdentityService) {}

  public ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.required]
    });

    this.storeEmail = this.is.identity.pipe(
      pluck('user', 'email'),
      switchMap((someString) => {
        // Map it to an undefined value in case the email is an empty string
        return of(someString && someString.length > 0 ? someString : undefined);
      })
    );

    this.storeEmail.subscribe((email) => {
      if (email) {
        this.form.setValue({ email: email });
      }
    });
  }

  public handleUserLink() {
    this.is.registerEmail(this.form.getRawValue().email);
  }
}
