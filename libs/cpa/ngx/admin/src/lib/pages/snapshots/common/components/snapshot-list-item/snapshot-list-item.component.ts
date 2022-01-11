import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DeepPartial } from 'typeorm';
import { from, Observable, of } from 'rxjs';
import { map, pluck, shareReplay, skip, switchMap, toArray } from 'rxjs/operators';

import { Workshop } from '@tamu-gisc/cpa/common/entities';
import { ISnapshotPartial } from '@tamu-gisc/cpa/data-api';

@Component({
  selector: 'tamu-gisc-snapshot-list-item',
  templateUrl: './snapshot-list-item.component.html',
  styleUrls: ['./snapshot-list-item.component.scss']
})
export class SnapshotListItemComponent implements OnInit {
  @Input()
  public snapshot: ISnapshotPartial;

  @Output()
  public copy: EventEmitter<string> = new EventEmitter();

  public snapshotWorkshops: Observable<Array<DeepPartial<Workshop>>>;
  public snapshotWorkshopsCount: Observable<number>;
  public firstWorkshop: Observable<DeepPartial<Workshop>>;
  public remainingWorkshops: Observable<Array<DeepPartial<Workshop>>>;

  constructor() {}

  public ngOnInit(): void {
    this.snapshotWorkshops = of(this.snapshot).pipe(
      pluck('workshops'),
      switchMap((relationships) => {
        return from(relationships);
      }),
      map((relationship) => {
        return relationship.workshop;
      }),
      toArray(),
      shareReplay()
    );

    this.snapshotWorkshopsCount = this.snapshotWorkshops.pipe(map((w) => w.length));

    this.firstWorkshop = this.snapshotWorkshops.pipe(pluck('0'), shareReplay());

    this.remainingWorkshops = this.snapshotWorkshops.pipe(
      switchMap((ws) => from(ws)),
      skip(1),
      toArray(),
      shareReplay()
    );
  }

  public emitCopy(guid: string) {
    this.copy.emit(guid);
  }
}
