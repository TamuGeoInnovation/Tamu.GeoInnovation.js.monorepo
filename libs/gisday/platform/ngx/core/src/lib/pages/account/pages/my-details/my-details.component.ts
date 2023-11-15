import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable, Subject, map, shareReplay, startWith, switchMap, take } from 'rxjs';

import { AuthService } from '@auth0/auth0-angular';

import { OrganizationService, UniversityService, UserService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { GisDayAppMetadata, Organization, ParticipantType, University } from '@tamu-gisc/gisday/platform/data-api';

const infoCompletionValidator: ValidatorFn = (control: FormGroup): { [key: string]: any } | null => {
  const type = control.get('app_metadata.gisday.attendeeType');
  const education = control.get('user_metadata.education');
  const occupation = control.get('user_metadata.occupation');

  if (type.value === 'student') {
    const allFieldsValid = Object.entries(education.value).every(([key, value]) => {
      if (key === 'otherInstitution' && education.get('institution').value !== 'other') {
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
      if (key === 'otherEmployer' && occupation.get('employer').value !== 'other') {
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

@Component({
  selector: 'tamu-gisc-my-details',
  templateUrl: './my-details.component.html',
  styleUrls: ['./my-details.component.scss']
})
export class MyDetailsComponent implements OnInit {
  public form: FormGroup;

  public signedOnEntityIsSocial$: Observable<boolean>;
  public signedOnEntityHasCompletedInfo$: Observable<boolean>;
  public universities$: Observable<Array<Partial<University>>>;
  public organizations$: Observable<Array<Partial<Organization>>>;
  public otherInstitutionSelected$: Observable<boolean>;
  public otherEmployerSelected$: Observable<boolean>;
  public selectedParticipantType$: Observable<ParticipantType>;
  private _signedOnEntity: Observable<GisDayAppMetadata>;
  private _refresh$: Subject<boolean> = new Subject();

  constructor(
    private fb: FormBuilder,
    private ns: NotificationService,
    private readonly as: AuthService,
    private readonly us: UserService,
    private readonly is: UniversityService,
    private readonly os: OrganizationService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group(
      {
        user_info: this.fb.group({
          given_name: [null],
          family_name: [null],
          email: [{ value: null, disabled: true }]
        }),
        app_metadata: this.fb.group({
          gisday: this.fb.group({
            attendeeType: [null, Validators.required]
          })
        }),
        user_metadata: this.fb.group({
          education: this.fb.group({
            id: [null],
            institution: [null],
            fieldOfStudy: [null],
            classification: [null],
            otherInstitution: [null]
          }),
          occupation: this.fb.group({
            employer: [null],
            department: [null],
            position: [null],
            otherEmployer: [null]
          })
        })
      },
      { validators: [infoCompletionValidator] }
    );

    this.otherInstitutionSelected$ = this.form.get('user_metadata.education.institution').valueChanges.pipe(
      map((value) => {
        return value === 'other';
      }),
      shareReplay()
    );

    this.otherEmployerSelected$ = this.form.get('user_metadata.occupation.employer').valueChanges.pipe(
      map((value) => {
        return value === 'other';
      }),
      shareReplay()
    );

    this.selectedParticipantType$ = this.form.get('app_metadata.gisday.attendeeType').valueChanges.pipe(
      map((value) => {
        return value;
      })
    );

    this._signedOnEntity = this._refresh$.pipe(
      startWith(true),
      switchMap(() => {
        return this.as.user$;
      }),
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

    this.universities$ = this.is.getEntities().pipe(
      map((universities) => {
        universities.push({
          guid: 'other',
          name: 'Other'
        });

        return universities;
      }),
      shareReplay()
    );

    this.organizations$ = this.os.getEntities().pipe(
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
    this.form.get('app_metadata.gisday.attendeeType').setValue(type);

    // If attendee type is not student, clear the occupation employer field
    if (type !== 'student') {
      this.form.get('user_metadata.occupation.employer').setValue(null);
    }
  }

  public updateUserInfo() {
    const form: Partial<GisDayAppMetadata> = this.form.getRawValue();

    this.as.user$
      .pipe(
        take(1),
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
            message: 'Error updating user information.',
            id: 'user-info-update-error',
            title: 'Error'
          });

          console.error('Error updating user information.', e.message);
        }
      });
  }
}

