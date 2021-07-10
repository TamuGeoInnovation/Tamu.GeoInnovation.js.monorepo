import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable} from 'rxjs';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';

import { UserService } from '@tamu-gisc/ues/common/ngx';
import { ValveIntervention } from '@tamu-gisc/ues/cold-water/data-api';

import { InterventionService } from '../../../core/services/intervention/intervention.service';

@Component({
  selector: 'tamu-gisc-intervention',
  templateUrl: './intervention.component.html',
  styleUrls: ['./intervention.component.scss'],
  providers: [InterventionService]
})
export class InterventionComponent implements OnInit {
  public form: FormGroup;
  public optionValues = {
    Reason: [
      {
        label: 'Planned Outage',
        code: 'Outage'
      },
      {
        label: 'Emergency Repair',
        code: 'Repair'
      },
      {
        label: 'Abandoned Valve',
        code: 'Abandon'
      },
      {
        label: 'Other',
        code: 'Other'
      }
    ],
    YellowLidPlaced: [
      {
        label: 'Yes',
        code: 'Yes'
      },
      {
        label: 'No',
        code: 'No'
      }
    ],
    LockoutTagePlaced: [
      {
        label: 'Yes',
        code: 'Yes'
      },
      {
        label: 'No',
        code: 'No'
      }
    ],
    DoesMapNeedUpdate: [
      {
        label: 'Yes',
        code: 'Yes'
      },
      {
        label: 'No',
        code: 'No'
      }
    ]
  };

  public valveId: Observable<number>;
  public interventionId: Observable<number>;

  public intervention: Observable<Partial<ValveIntervention>>;

  public user = this.usr.user;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private usr: UserService,
    private is: InterventionService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      ValveNumber: ['', Validators.required],
      SubmittedBy: ['', Validators.required],
      Date: [Date.now()],
      OperatorName: [''],
      LocationDescription: [''],
      Reason: [''],
      AffectedBuildings: [''],
      EstimatedRestoration: [Date.now()],
      YellowLidPlaced: [''],
      LockoutTagePlaced: [''],
      DoesMapNeedUpdate: [''],
      WorkOrder: ['']
    });

    this.interventionId = this.route.params.pipe(pluck('id'), shareReplay(1));
    this.valveId = this.route.params.pipe(pluck('valveId'), shareReplay(1));

    this.intervention = this.interventionId.pipe(
      switchMap((id) => {
        // If this is a "view intervention" route, get the intervention details.
        // Otherwise, it's a "create intervention" view and we need to get
        // partial information to pre-populate the form.
        if (id) {
          return this.is.getIntervention(id);
        } else {
          return combineLatest([this.user, this.valveId]).pipe(
            map(([user, valveId]) => {
              return {
                SubmittedBy: user.name,
                ValveNumber: valveId
              };
            })
          );
        }
      })
    );

    // Internal subscription so we can patch in the form values.
    // The value will either be a pre-existing intervention record
    // or partial information to populate the form with basic information
    // for a new intervention entry.
    this.intervention.subscribe((res) => {
      this.form.patchValue(res);
    });
  }

  public submitIntervention() {
    const formValue = this.form.getRawValue();

    this.is.addIntervention(formValue).subscribe((res) => {
      // TODO: Add feedback
      console.log(res);
    });
  }
}
