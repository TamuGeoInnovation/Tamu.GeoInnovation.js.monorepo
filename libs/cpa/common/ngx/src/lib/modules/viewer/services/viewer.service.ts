import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of } from 'rxjs';
import { pluck, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { IResponseResponse, IScenariosResponse, IWorkshopRequestPayload } from '@tamu-gisc/cpa/data-api';

import { ResponseService } from '../../forms/services/response.service';
import { WorkshopService } from '../../forms/services/workshop.service';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  private _workshopGuid: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public workshopGuid: Observable<string> = this._workshopGuid.asObservable();

  private _snapshotGuid: BehaviorSubject<string> = new BehaviorSubject(undefined);
  public snapshotGuid: Observable<string> = this._snapshotGuid.asObservable();

  public workshop: Observable<IWorkshopRequestPayload>;
  public scenario: Observable<IScenariosResponse>;

  public scenarioHistory: BehaviorSubject<IScenariosResponse[]> = new BehaviorSubject([]);
  public scenarioIndex: BehaviorSubject<number> = new BehaviorSubject(0);

  constructor(private ws: WorkshopService, private rs: ResponseService) {
    this.init();
  }

  public updateWorkshopGuid(guid: string) {
    this._workshopGuid.next(guid);
  }

  public updateSnapshotGuid(guid: string) {
    this._snapshotGuid.next(guid);
  }

  public init(): void {
    this.workshop = this._workshopGuid.pipe(
      switchMap((guid) => {
        return this.ws.getWorkshop(guid);
      }),
      shareReplay(1)
    );

    this.scenario = combineLatest([this.workshop, this.scenarioIndex]).pipe(
      switchMap(([workshop, scenarioIndex]: [IWorkshopRequestPayload, number]) => {
        return of(workshop).pipe(
          pluck<IResponseResponse, IScenariosResponse[]>('scenarios'),
          pluck(scenarioIndex)
        );
      }),
      tap((scenario) => {
        this.addToScenarioHistory(scenario);
      }),
      shareReplay(1)
    );
  }

  /**
   * Manages the history of the ScenarioHistory behavior subject, to only keep a maximum of 2 entires (curr and prev).
   *
   * This history is used to add/remove layers for scenarios.
   */
  private addToScenarioHistory(scenario: IScenariosResponse) {
    const prevValue = this.scenarioHistory.getValue();

    const newValue = [...prevValue, scenario].slice(-2);

    this.scenarioHistory.next(newValue);
  }

  public scanScenario(direction: 'prev' | 'next') {
    forkJoin([this.scenarioIndex.pipe(take(1)), this.workshop]).subscribe(([scenarioIndex, workshop]) => {
      if (direction) {
        if (direction === 'prev') {
          if (scenarioIndex > 0) this.scenarioIndex.next(scenarioIndex - 1);
        } else if (direction === 'next') {
          this.scenarioIndex.next(scenarioIndex + 1);
        }
      }
    });
  }
}
