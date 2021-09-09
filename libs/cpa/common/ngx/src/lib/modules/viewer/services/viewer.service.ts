import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { IScenariosResponseResolved, ISnapshotsResponse, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';
import { ResponseService, WorkshopService, SnapshotService, ScenarioService } from '@tamu-gisc/cpa/data-access';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  private _workshopGuid: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public workshopGuid: Observable<string> = this._workshopGuid.asObservable();

  public workshop: Observable<IWorkshopRequestPayload>;

  public workshopSnapshots: Observable<Array<ISnapshotsResponse>>;
  public workshopContexts: Observable<Array<ISnapshotsResponse>>;
  public workshopScenarios: Observable<Array<IScenariosResponseResolved>>;

  /**
   * Flattened collection of both snapshots and scenarios for a workshop
   */
  public snapshotsAndScenarios: Observable<Array<TypedSnapshotOrScenario>>;

  /**
   * Selected snapshot and scenario by index
   */
  public snapshotOrScenario: Observable<TypedSnapshotOrScenario>;

  public snapshotHistory: BehaviorSubject<TypedSnapshotOrScenario[]> = new BehaviorSubject([]);
  private selectionGuid: BehaviorSubject<string> = new BehaviorSubject(null);

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

  public updateSelectionIndex(guid: string) {
    this.selectionGuid.next(guid);
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

    this.workshopContexts = this.workshop.pipe(
      switchMap((workshop) => {
        return this.sss.getContextsForWorkshop(workshop.guid);
      }),
      shareReplay(1)
    );

    this.workshopScenarios = this.workshop.pipe(
      switchMap((workshop) => {
        return this.sns.getForWorkshop(workshop.guid);
      })
    );

    this.snapshotsAndScenarios = combineLatest([this.workshopSnapshots, this.workshopScenarios]).pipe(
      map(([snapshots, scenarios]) => {
        const typedSnapshots: Array<TypedSnapshotOrScenario> = snapshots.map((s) => {
          return { ...s, type: 'snapshot' };
        });

        const typedScenarios: Array<TypedSnapshotOrScenario> = scenarios.map((s) => {
          return { ...s, type: 'scenario' };
        });

        return [...typedSnapshots, ...typedScenarios];
      }),
      shareReplay(1)
    );

    this.snapshotOrScenario = combineLatest([
      this.snapshotsAndScenarios,
      this.selectionGuid.pipe(distinctUntilChanged())
    ]).pipe(
      map(([snapshots, guid]) => {
        if (guid === null) {
          return snapshots[0];
        } else {
          const found = snapshots.find((s) => s.guid === guid);

          // In the event of a not found event, redirection fallback to the first snapshot.
          if (found === undefined) {
            return snapshots[0];
          } else {
            return found;
          }
        }
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
  private addToSnapshotHistory(snapshot: TypedSnapshotOrScenario) {
    const prevValue = this.snapshotHistory.getValue();

    const newValue = [...prevValue, snapshot].slice(-2);

    this.snapshotHistory.next(newValue);
  }
}

type ISnapshotOrScenario = ISnapshotsResponse | IScenariosResponseResolved;

export type TypedSnapshotOrScenario = ISnapshotOrScenario & { type: 'scenario' | 'snapshot' };
