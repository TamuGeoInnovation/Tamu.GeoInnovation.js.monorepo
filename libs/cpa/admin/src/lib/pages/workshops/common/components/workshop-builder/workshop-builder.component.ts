import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
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

      this.snapshotList = this.ss
        .getMany({
          prop: 'isContextual',
          value: false
        })
        .pipe(shareReplay(1));

      this.contextualSnapshotList = this.ss
        .getMany({
          prop: 'isContextual',
          value: true
        })
        .pipe(shareReplay(1));

      this.scenarioList = this.scenarioService.getForWorkshop(this.route.snapshot.params['guid']).pipe(shareReplay(1));
    }
  }

  public submitWorkshop(snapshot?: Partial<Snapshot>) {
    if (this.route.snapshot.params['guid']) {
      const payload = this.form.getRawValue();
      const snapshots = (this.form.getRawValue().snapshots as Array<Snapshot>).map((s) => s.guid);
      const scenarios = (this.form.getRawValue().scenarios as Array<Scenario>).map((s) => s.guid);

      // Need to pull properties from the form value since those are updated separately.
      // Sending them with workshop update will error the request
      delete payload.snapshots;
      delete payload.scenarios;
      delete payload.contexts;

      // Prepare requests
      const wsUpdate = this.ws.updateWorkshop(this.route.snapshot.params['guid'], payload);
      const snUpdate = this.ws.setSnapshots(this.route.snapshot.params['guid'], snapshots);
      const scUpdate = this.ws.setScenarios(this.route.snapshot.params['guid'], scenarios);

      forkJoin([wsUpdate, snUpdate, scUpdate]).subscribe(
        (status) => {
          console.log('Successfully updated workshop and snapshot.');
        },
        (err) => {
          if (err) {
            console.error('Error updating workshop and snapshots.');
          }
        }
      );
    } else {
      this.ws.createWorkshop(this.form.getRawValue()).subscribe((createStatus) => {
        console.log('Created workshop');
        this.router.navigate(['../'], { relativeTo: this.route });
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

  public addSnapshot(snapshot: Snapshot): void {
    const currentSnapshots: Array<Snapshot> = this.form.get('snapshots').value;

    const existingContainsIncoming = currentSnapshots.find((existingSnapshot) => existingSnapshot.guid === snapshot.guid);

    // Check if the provided snapshot already exists in the form value. Add snapshot if it doesn't exist.
    if (!existingContainsIncoming) {
      this.form.get('snapshots').patchValue([...this.form.get('snapshots').value, snapshot]);
    }
  }

  public removeSnapshot(snapshot: Snapshot) {
    const snapshots = (this.form.get('snapshots').value as Array<Snapshot>).filter(
      (formSnapshot) => formSnapshot.guid !== snapshot.guid
    );

    this.form.get('snapshots').patchValue(snapshots);
  }

  public addScenario(scenario?: Partial<Scenario>) {
    const currentScenarios: Array<Scenario> = this.form.get('scenarios').value;

    const existingContainsIncoming = currentScenarios.find((existingScenario) => existingScenario.guid === scenario.guid);

    // Check if the provided scenario already exists in the form value. Add scenario if it doesn't exist.
    if (!existingContainsIncoming) {
      this.form.get('scenarios').patchValue([...this.form.get('scenarios').value, scenario]);
    }
  }

  public removeScenario(scenario: Partial<Scenario>) {
    const scenarios = (this.form.get('scenarios').value as Array<Scenario>).filter(
      (formScenario) => formScenario.guid !== scenario.guid
    );

    this.form.get('scenarios').patchValue(scenarios);
  }

  public removeContext(snapshot: Partial<Snapshot>) {
    this.ws.deleteContextualSnapshot(this.route.snapshot.params['guid'], snapshot.guid).subscribe((snapshotRemoveStatus) => {
      this.form.patchValue(snapshotRemoveStatus);
    });
  }
}
