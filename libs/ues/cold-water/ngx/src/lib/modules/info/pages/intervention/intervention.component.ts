import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { pluck, shareReplay, switchMap } from 'rxjs/operators';

import { UserService } from '@tamu-gisc/ues/common/ngx';

import { InterventionService, ValveIntervention } from '../../../core/services/intervention/intervention.service';

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

  public intervention: Observable<ValveIntervention>;
  public valveId: Observable<number>;
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
      EstimatedRestoration: [Date.now()],
      YellowLidPlaced: [''],
      LockoutTagePlaced: [''],
      DoesMapNeedUpdate: [''],
      WorkOrder: ['']
    });

    this.valveId = this.route.params.pipe(pluck('valveId'), shareReplay(1));

    this.intervention = this.valveId.pipe(
      switchMap((id) => {
        if (id) {
          return this.is.getIntervention(id);
        } else {
          return of(undefined);
        }
      })
    );

    this.intervention.subscribe((res) => {
      debugger;
    });
  }
}
