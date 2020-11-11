import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { pluck, shareReplay, map } from 'rxjs/operators';

import { IScenariosResponse } from '@tamu-gisc/cpa/data-api';
import { Scenario } from '@tamu-gisc/cpa/common/entities';
import { WorkshopService, ScenarioService } from '@tamu-gisc/cpa/data-access';

@Component({
  selector: 'tamu-gisc-workshop-builder',
  templateUrl: './workshop-builder.component.html',
  styleUrls: ['./workshop-builder.component.scss'],
  providers: [WorkshopService, ScenarioService]
})
export class WorkshopBuilderComponent implements OnInit {
  public form: FormGroup;

  public isExisting: Observable<boolean>;

  public scenarioList: Observable<IScenariosResponse[]>;

  constructor(
    private fb: FormBuilder,
    private ws: WorkshopService,
    private ss: ScenarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: [undefined],
      scenarios: [[]]
    });

    this.isExisting = this.route.params.pipe(
      pluck('guid'),
      map((guid) => {
        return guid !== undefined;
      }),
      shareReplay(1)
    );

    if (this.route.snapshot.params['guid']) {
      this.ws.getWorkshop(this.route.snapshot.params['guid']).subscribe((res) => {
        this.form.patchValue(res);
      });

      this.scenarioList = this.ss.getAll();
    }
  }

  public submitWorkshop(scenario?: Partial<Scenario>) {
    if (this.route.snapshot.params['guid']) {
      const payload = this.form.getRawValue();

      delete payload.scenarios;

      this.ws.updateWorkshop(this.route.snapshot.params['guid'], payload).subscribe((updateStatus) => {
        console.log('Updated workshop');
      });

      if (scenario) {
        console.log('Added scenario');
        this.ws.addScenario(this.route.snapshot.params['guid'], scenario.guid).subscribe((addScenarioStatus) => {
          this.form.patchValue(addScenarioStatus);
        });
      }
    } else {
      this.ws.createWorkshop(this.form.getRawValue()).subscribe((createStatus) => {
        console.log('Created workshop');
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    }
  }

  public removeScenario(scenario: Partial<Scenario>) {
    this.ws.deleteScenario(this.route.snapshot.params['guid'], scenario.guid).subscribe((scenarioRemoveStatus) => {
      this.form.patchValue(scenarioRemoveStatus);
    });
  }
}
