import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, combineLatest, forkJoin, iif, interval, NEVER, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap, take, tap } from 'rxjs/operators';

import { IScenariosResponse, ISnapshotsResponse, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';
import { ResponseService, WorkshopService, SnapshotService, ScenarioService } from '@tamu-gisc/cpa/data-access';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  private _workshopGuid: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public workshopGuid: Observable<string> = this._workshopGuid.asObservable();

  // TODO: This might not be necessary. Commenting out for now, delete later when sure.
  // private _snapshotGuid: BehaviorSubject<string> = new BehaviorSubject(undefined);
  // public snapshotGuid: Observable<string> = this._snapshotGuid.asObservable();

  public workshop: Observable<IWorkshopRequestPayload>;

  public workshopSnapshots: Observable<Array<ISnapshotsResponse>>;
  public workshopScenarios: Observable<Array<IScenariosResponse>>;

  /**
   * Flattened collection of both snapshots and scenarios for a workshop
   */
  public snapshotsAndScenarios: Observable<Array<ISnapshotsResponse | IScenariosResponse>>;

  /**
   * Selected snapshot and scenario by index
   */
  public snapshotOrScenario: Observable<ISnapshotsResponse>;

  public snapshotHistory: BehaviorSubject<ISnapshotsResponse[]> = new BehaviorSubject([]);
  public selectionIndex: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(
    private ws: WorkshopService,
    private sss: SnapshotService,
    private sns: ScenarioService,
    private rs: ResponseService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.init();
  }

  public updateWorkshopGuid(guid: string) {
    this._workshopGuid.next(guid);
  }

  // TODO: This might not be necessary. Commenting for now, deleting when certain.
  // public updateSnapshotGuid(guid: string) {
  //   this._snapshotGuid.next(guid);
  // }

  public updateSelectionIndex(index: number) {
    this.selectionIndex.next(index);
  }

  public init(): void {
    this.workshop = this._workshopGuid.pipe(
      switchMap((guid) => {
        return this.ws.getWorkshop(guid);
      }),
      shareReplay(1)
    );

    this.workshopSnapshots = this.workshop.pipe(
      switchMap((workshop) => {
        return this.sss.getForWorkshop(workshop.guid);
      }),
      shareReplay(1)
    );

    this.workshopScenarios = this.workshop.pipe(
      switchMap((workshop) => {
        return this.sns.getForWorkshop(workshop.guid);
      })
    );

    this.snapshotsAndScenarios = combineLatest([
      this.workshopSnapshots,
      interval(5000).pipe(
        startWith(0),
        switchMap(() => {
          return iif(() => this.document.hidden === false, this.workshopScenarios, NEVER);
        }),
        // Limit emissions only whenever the scenario response is different between intervals
        distinctUntilChanged((prev, curr) => {
          // Simple compare function. If ANYTHING (order, title, description, etc) about the response is
          // different,this will evaluate to true.
          return JSON.stringify(prev) === JSON.stringify(curr);
        })
      )
    ]).pipe(
      map(([snapshots, scenarios]) => {
        return [...snapshots, ...scenarios];
      })
    );

    this.snapshotOrScenario = combineLatest([this.workshopSnapshots, this.selectionIndex]).pipe(
      map(([snapshots, index]: [Array<ISnapshotsResponse>, number]) => {
        return snapshots[index];
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
    forkJoin([this.selectionIndex.pipe(take(1)), this.workshop]).subscribe(([index, workshop]) => {
      if (direction) {
        if (direction === 'prev') {
          if (index > 0) this.selectionIndex.next(index - 1);
        } else if (direction === 'next') {
          this.selectionIndex.next(index + 1);
        }
      }
    });
  }
}
