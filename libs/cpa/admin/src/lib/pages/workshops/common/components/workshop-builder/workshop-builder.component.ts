import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { pluck, shareReplay, map } from 'rxjs/operators';

import { ISnapshotsResponse } from '@tamu-gisc/cpa/data-api';
import { Snapshot } from '@tamu-gisc/cpa/common/entities';
import { WorkshopService, SnapshotService } from '@tamu-gisc/cpa/data-access';

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

  constructor(
    private fb: FormBuilder,
    private ws: WorkshopService,
    private ss: SnapshotService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  public ngOnInit() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: [undefined],
      snapshots: [[]]
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

      this.snapshotList = this.ss.getAll();
    }
  }

  public submitWorkshop(snapshot?: Partial<Snapshot>) {
    if (this.route.snapshot.params['guid']) {
      const payload = this.form.getRawValue();

      delete payload.snapshots;

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

  public removeSnapshot(snapshot: Partial<Snapshot>) {
    this.ws.deleteSnapshot(this.route.snapshot.params['guid'], snapshot.guid).subscribe((snapshotRemoveStatus) => {
      this.form.patchValue(snapshotRemoveStatus);
    });
  }
}
