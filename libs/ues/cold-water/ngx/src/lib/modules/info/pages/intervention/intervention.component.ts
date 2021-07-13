import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, forkJoin, Observable, Subject } from 'rxjs';
import { finalize, map, pluck, shareReplay, switchMap, take, takeUntil } from 'rxjs/operators';

import { UserService } from '@tamu-gisc/ues/common/ngx';
import { ValveIntervention } from '@tamu-gisc/ues/cold-water/data-api';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { InterventionService } from '../../../core/services/intervention/intervention.service';
import { ColdWaterValvesService, MappedValve } from '../../../core/services/cold-water-valves/cold-water-valves.service';

@Component({
  selector: 'tamu-gisc-intervention',
  templateUrl: './intervention.component.html',
  styleUrls: ['./intervention.component.scss'],
  providers: [InterventionService]
})
export class InterventionComponent implements OnInit, OnDestroy {
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
    ],
    ValveState: [
      {
        label: 'Open',
        code: 'Open'
      },
      {
        label: 'Closed',
        code: 'Closed'
      }
    ]
  };

  public valveId: Observable<number>;
  public valve: Observable<MappedValve>;

  public interventionId: Observable<number>;
  public intervention: Observable<Partial<ValveIntervention>>;

  public user = this.usr.user;

  public formSubmitText = 'Submit';
  public formSubmitting = false;

  private _$destroy: Subject<boolean> = new Subject();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private usr: UserService,
    private is: InterventionService,
    private vs: ColdWaterValvesService,
    private ns: NotificationService
  ) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      ValveNumber: ['', Validators.required],
      SubmittedBy: ['', Validators.required],
      Date: [Date.now()],
      OperatorName: [''],
      ValveState: [''],
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
      }),
      shareReplay(1)
    );

    this.valveId = this.route.params.pipe(pluck('valveId'), shareReplay(1));
    this.valve = this.valveId.pipe(
      switchMap((v) => {
        return this.vs.getValve(v);
      })
    );
    // Internal subscription so we can patch in the form values.
    // The value will either be a pre-existing intervention record
    // or partial information to populate the form with basic information
    // for a new intervention entry.
    combineLatest([this.intervention, this.valve]).subscribe(([intervention, valve]) => {
      this.form.patchValue({ ...intervention, ValveState: valve.attributes.CurrentPosition_1 });
    });

    // Take the valve id from the URL and assign the selected valve so we can pull the current valve state.
    // Typically the flow into this component is from the details view where the valve would already be set,
    // but this will also support the case where users enter this view with a url route.
    this.route.params.pipe(pluck('valveId'), takeUntil(this._$destroy)).subscribe((valveId) => {
      this.vs.setSelectedValve(valveId);
    });
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public submitIntervention() {
    const formValue = this.form.getRawValue();
    const valveState = this.optionValues.ValveState.find((state) => (state.code = formValue.ValveState));

    this.formSubmitting = true;
    this.formSubmitText = 'Submitting...';

    forkJoin([
      this.is.addIntervention(formValue),
      this.valve.pipe(
        take(1),
        switchMap((valve) => {
          return this.vs.updateValveState(valve, valveState.code);
        })
      )
    ])
      .pipe(
        finalize(() => {
          this.formSubmitting = false;
          this.formSubmitText = 'Submit';
        })
      )
      .subscribe(
        (res) => {
          this.ns.toast({
            id: 'intervention-submit-success',
            message: 'Intervention event was created.',
            title: 'Created intervention event'
          });
        },
        (err) => {
          this.ns.toast({
            id: 'intervention-submit-error',
            message: 'Error creating intervention event.',
            title: 'An error occurred creating an intervention event.'
          });
        }
      );
  }
}
