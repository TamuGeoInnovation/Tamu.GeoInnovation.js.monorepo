import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { pluck, shareReplay, map } from 'rxjs/operators';

import { IScenariosResponseResolved, ISnapshotsResponse } from '@tamu-gisc/cpa/data-api';
import { Scenario, Snapshot } from '@tamu-gisc/cpa/common/entities';
import { WorkshopService, SnapshotService, ScenarioService } from '@tamu-gisc/cpa/data-access';

@Component({
  selector: 'tamu-gisc-workshop-builder',
  templateUrl: './workshop-builder.component.html',
  styleUrls: ['./workshop-builder.component.scss'],
  providers: [WorkshopService, SnapshotService]
})
export class WorkshopBuilderComponent implements OnInit {
  public form: FormGroup;

  public isExisting: Observable<boolean>;

  public snapshotList: Observable<ISnapshotsResponse[]>;
  public contextualSnapshotList: Observable<IScenariosResponseResolved[]>;
  public scenarioList: Observable<IScenariosResponseResolved[]>;

  public host = `${window.location.origin}`;

  constructor(
    private fb: FormBuilder,
    private ws: WorkshopService,
    private ss: SnapshotService,
    private scenarioService: ScenarioService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      alias: [undefined],
      date: [undefined],
      snapshots: [[]],
      scenarios: [[]],
      contexts: [[]]
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

      this.snapshotList = this.ss.getAll().pipe(shareReplay(1));
      this.contextualSnapshotList = this.ss.getMany({
        prop: 'isContextual',
        value: true
      });
      this.scenarioList = this.scenarioService.getForWorkshop(this.route.snapshot.params['guid']).pipe(shareReplay(1));
    }
  }

  public submitWorkshop(snapshot?: Partial<Snapshot>) {
    if (this.route.snapshot.params['guid']) {
      const payload = this.form.getRawValue();

      delete payload.snapshots;
      delete payload.scenarios;
      delete payload.contexts;

      this.ws.updateWorkshop(this.route.snapshot.params['guid'], payload).subscribe((updateStatus) => {
        console.log('Updated workshop');
      });

      if (snapshot) {
        console.log('Added Snapshot');
        this.ws.addSnapshot(this.route.snapshot.params['guid'], snapshot.guid).subscribe((addSnapshotStatus) => {
          this.form.patchValue(addSnapshotStatus);
        });
      }
    } else {
      this.ws.createWorkshop(this.form.getRawValue()).subscribe((createStatus) => {
        console.log('Created workshop');
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    }
  }

  public submitWorkshopScenario(scenario?: Partial<Scenario>) {
    if (scenario) {
      this.ws.addScenario(this.route.snapshot.params['guid'], scenario.guid).subscribe((addScenarioStatus) => {
        this.form.patchValue(addScenarioStatus);
      });
    }
  }

  public submitWorkshopContext(snapshot?: Partial<Snapshot>) {
    if (snapshot) {
      this.ws.addContextualSnapshot(this.route.snapshot.params['guid'], snapshot.guid).subscribe((addSnapshotStatus) => {
        this.form.patchValue(addSnapshotStatus);
      });
    }
  }

  public removeSnapshot(snapshot: Partial<Snapshot>) {
    this.ws.deleteSnapshot(this.route.snapshot.params['guid'], snapshot.guid).subscribe((snapshotRemoveStatus) => {
      this.form.patchValue(snapshotRemoveStatus);
    });
  }

  public removeScenario(scenario: Partial<Scenario>) {
    this.ws.deleteScenario(this.route.snapshot.params['guid'], scenario.guid).subscribe((scenarioRemoveStatus) => {
      this.form.patchValue(scenarioRemoveStatus);
    });
  }

  public removeContext(snapshot: Partial<Snapshot>) {
    this.ws.deleteContextualSnapshot(this.route.snapshot.params['guid'], snapshot.guid).subscribe((snapshotRemoveStatus) => {
      this.form.patchValue(snapshotRemoveStatus);
    });
  }
}
