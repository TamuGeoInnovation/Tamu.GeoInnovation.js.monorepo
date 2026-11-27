import { Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { Observable, Subject, filter, map, shareReplay, startWith, switchMap, take } from 'rxjs';

import { AuthService, User } from '@auth0/auth0-angular';

import { OrganizationService, UniversityService, UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { GisDayAppMetadata, Organization, ParticipantType, University } from '@tamu-gisc/gisday/platform/data-api';
import { RouterLink } from '@angular/router';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { NgClass, AsyncPipe } from '@angular/common';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { GISDAY_SITE, serverMessage } from '@tamu-gisc/gisday/platform/ngx/common';

/**
 * Complete when the attendee type's own fields are all filled in: a student's education, anyone else's occupation. Given
 * the controls it reads, so it does not have to look them up by path.
 */
function infoCompletionValidator(
  type: AbstractControl,
  education: UntypedFormGroup,
  occupation: UntypedFormGroup
): ValidatorFn {
  return (): { [key: string]: boolean } | null => {
    if (type.value === 'student') {
      const allFieldsValid = Object.entries(education.value).every(([key, value]) => {
        if (key === 'otherInstitution' && education.controls['institution'].value !== 'other') {
          return true;
        }

        return value !== null && value !== undefined && value !== '';
      });

      if (allFieldsValid) {
        return null;
      }
    }

    if (type.value === 'industry' || type.value === 'academia') {
      const allFieldsValid = Object.entries(occupation.value).every(([key, value]) => {
        if (key === 'otherEmployer' && occupation.controls['employer'].value !== 'other') {
          return true;
        }

        return value !== null && value !== undefined && value !== '';
      });

      if (allFieldsValid) {
        return null;
      }
    }

    return { incomplete: true };
  };
}

@Component({
  selector: 'tamu-gisc-my-details',
  templateUrl: './my-details.component.html',
  styleUrls: ['./my-details.component.scss'],
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    TextboxComponent,
    NgClass,
    SelectComponent,
    ButtonComponent,
    AsyncPipe
  ]
})
export class MyDetailsComponent implements OnInit {
  /** Its name and contact address, as each GIS Day site has its own (#2077). */
  public readonly site = inject(GISDAY_SITE);

  private fb = inject(UntypedFormBuilder);
  private ns = inject(NotificationService);
  private readonly as = inject(AuthService);
  private readonly us = inject(UserService);
  private readonly is = inject(UniversityService);
  private readonly os = inject(OrganizationService);

  public form: UntypedFormGroup;
  private email: AbstractControl;
  private attendeeType: AbstractControl;
  private employer: AbstractControl;

  public signedOnEntityIsSocial$: Observable<boolean>;
  public signedOnEntityHasCompletedInfo$: Observable<boolean>;
  public universities$: Observable<Array<Partial<University>>>;
  public organizations$: Observable<Array<Partial<Organization>>>;
  public otherInstitutionSelected$: Observable<boolean>;
  public otherEmployerSelected$: Observable<boolean>;
  public selectedParticipantType$: Observable<ParticipantType>;
  private _signedOnEntity: Observable<GisDayAppMetadata>;
  private _refresh$: Subject<boolean> = new Subject();

  public ngOnInit(): void {
    const attendeeType = this.fb.control(null, Validators.required);
    const education = this.fb.group({
      id: [null],
      institution: [null],
      fieldOfStudy: [null],
      classification: [null],
      otherInstitution: [null]
    });
    const occupation = this.fb.group({
      employer: [null],
      department: [null],
      position: [null],
      otherEmployer: [null]
    });

    this.email = this.fb.control({ value: null, disabled: true });
    this.attendeeType = attendeeType;
    this.employer = occupation.controls['employer'];

    this.form = this.fb.group(
      {
        user_info: this.fb.group({
          given_name: [null],
          family_name: [null],
          email: this.email
        }),
        app_metadata: this.fb.group({
          gisday: this.fb.group({ attendeeType })
        }),
        user_metadata: this.fb.group({ education, occupation })
      },
      { validators: [infoCompletionValidator(attendeeType, education, occupation)] }
    );

    this.otherInstitutionSelected$ = education.controls['institution'].valueChanges.pipe(
      map((value) => {
        return value === 'other';
      }),
      shareReplay()
    );

    this.otherEmployerSelected$ = this.employer.valueChanges.pipe(
      map((value) => {
        return value === 'other';
      }),
      shareReplay()
    );

    this.selectedParticipantType$ = attendeeType.valueChanges.pipe(
      map((value) => {
        return value;
      })
    );

    this._signedOnEntity = this._refresh$.pipe(
      startWith(true),
      switchMap(() => {
        return this.as.user$;
      }),
      // Signed out there is nobody's details to load; the account pages are only reached signed in.
      filter(hasSub),
      switchMap((user) => this.us.getUserMetadata(user.sub)),
      shareReplay()
    );
    this.signedOnEntityIsSocial$ = this._signedOnEntity.pipe(
      map((user) => {
        return user.user_info.social;
      })
    );
    this.signedOnEntityHasCompletedInfo$ = this._signedOnEntity.pipe(
      map((user) => {
        return user?.app_metadata?.gisday?.completedProfile === true;
      })
    );

    this.universities$ = this.is.getEntitiesForActiveSeason().pipe(
      map((universities) => {
        universities.push({
          guid: 'other',
          name: 'Other'
        });

        return universities;
      }),
      shareReplay()
    );

    this.organizations$ = this.os.getEntitiesForActiveSeason().pipe(
      map((organizations) => {
        organizations.push({
          guid: 'other',
          name: 'Other'
        });

        return organizations;
      }),
      shareReplay()
    );

    this._signedOnEntity.subscribe({
      next: (result) => {
        this.form.patchValue(result);

        if (result?.user_info?.email === '' || result?.user_info?.email === null || result?.user_info?.email?.length === 0) {
          this.email.enable();
        }
      },
      error: (e) => {
        this.ns.toast({
          message: 'Error retrieving user information.',
          id: 'user-info-error',
          title: 'Error'
        });

        console.error('Error retrieving user information.', e.message);
      }
    });
  }

  public setAttendeeType(type: string) {
    this.attendeeType.setValue(type);

    // If attendee type is not student, clear the occupation employer field
    if (type !== 'student') {
      this.employer.setValue(null);
    }
  }

  public updateUserInfo() {
    const form: Partial<GisDayAppMetadata> = this.form.getRawValue();

    this.as.user$
      .pipe(
        take(1),
        filter(hasSub),
        switchMap((user) => {
          return this.us.updateUserMetadata(user.sub, form);
        })
      )
      .subscribe({
        next: () => {
          this._refresh$.next(true);
          this.ns.toast({
            message: 'User information updated.',
            id: 'user-info-update',
            title: 'Success'
          });
        },
        error: (e) => {
          this.ns.toast({
            message: serverMessage(e, 'Error updating user information.'),
            id: 'user-info-update-error',
            title: 'Error'
          });

          console.error('Error updating user information.', e.message);
        }
      });
  }
}

/** A signed-in Auth0 user, who always has a subject; signed out, `user$` emits null or undefined. */
function hasSub(user: User | null | undefined): user is User & { sub: string } {
  return typeof user?.sub === 'string';
}
