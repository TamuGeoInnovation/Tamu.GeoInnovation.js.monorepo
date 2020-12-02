import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of } from 'rxjs';
import { pluck, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { IResponseResponse, ISnapshotsResponse, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';
import { ResponseService, WorkshopService } from '@tamu-gisc/cpa/data-access';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  private _workshopGuid: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public workshopGuid: Observable<string> = this._workshopGuid.asObservable();

  private _snapshotGuid: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public snapshotGuid: Observable<string> = this._snapshotGuid.asObservable();

  public workshop: Observable<IWorkshopRequestPayload>;
  public snapshot: Observable<ISnapshotsResponse>;

  public snapshotHistory: BehaviorSubject<ISnapshotsResponse[]> = new BehaviorSubject([]);
  public snapshotIndex: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(private ws: WorkshopService, private rs: ResponseService) {
    this.init();
  }

  public updateWorkshopGuid(guid: string) {
    this._workshopGuid.next(guid);
  }

  public updateSnapshotGuid(guid: string) {
    this._snapshotGuid.next(guid);
  }

  public updateSnapshotIndex(index: number) {
    this.snapshotIndex.next(index);
  }

  public init(): void {
    this.workshop = this._workshopGuid.pipe(
      switchMap((guid) => {
        return this.ws.getWorkshop(guid);
      }),
      shareReplay(1)
    );

    this.snapshot = combineLatest([this.workshop, this.snapshotIndex]).pipe(
      switchMap(([workshop, snapshotIndex]: [IWorkshopRequestPayload, number]) => {
        return of(workshop).pipe(
          pluck<IResponseResponse, ISnapshotsResponse[]>('snapshots'),
          pluck(snapshotIndex)
        );
      }),
      tap((snapshot) => {
        this.addToSnapshotHistory(snapshot);
      }),
      shareReplay(1)
    );
  }

  /**
   * Manages the history of the SnapshotHistory behavior subject, to only keep a maximum of 2 entires (curr and prev).
   *
   * This history is used to add/remove layers for snapshots.
   */
  private addToSnapshotHistory(snapshot: ISnapshotsResponse) {
    const prevValue = this.snapshotHistory.getValue();

    const newValue = [...prevValue, snapshot].slice(-2);

    this.snapshotHistory.next(newValue);
  }

  public scanSnapshot(direction: 'prev' | 'next') {
    forkJoin([this.snapshotIndex.pipe(take(1)), this.workshop]).subscribe(([snapshotIndex, workshop]) => {
      if (direction) {
        if (direction === 'prev') {
          if (snapshotIndex > 0) this.snapshotIndex.next(snapshotIndex - 1);
        } else if (direction === 'next') {
          this.snapshotIndex.next(snapshotIndex + 1);
        }
      }
    });
  }
}
