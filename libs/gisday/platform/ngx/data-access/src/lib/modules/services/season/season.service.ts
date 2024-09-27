import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, startWith, Subject, switchMap, tap } from 'rxjs';

import { ActiveSeasonDto, Season } from '@tamu-gisc/gisday/platform/data-api';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SeasonService extends BaseService<Season> {
  private _signal$: Subject<void> = new Subject();

  public seasons$: Observable<Array<Partial<Season>>> = this._signal$.pipe(
    startWith(null),
    switchMap(() => this.getEntities()),
    shareReplay(1)
  );
  public activeSeason$: Observable<ActiveSeasonDto> = this._signal$.pipe(
    startWith(null),
    switchMap(() => this.getActiveSeason()),
    shareReplay(1)
  );

  constructor(private env1: EnvironmentService, private http1: HttpClient) {
    super(env1, http1, 'seasons');
  }

  public getActiveSeason() {
    return this.http1.get<ActiveSeasonDto>(this.resource + '/active');
  }

  public override createEntity(newEntity?: Partial<Season>) {
    return this.http1.post<Partial<Season>>(this.resource, newEntity).pipe(tap(() => this._signal$.next()));
  }

  public override deleteEntity(entityGuid: string) {
    return this.http1.delete<Partial<Season>>(`${this.resource}/${entityGuid}`).pipe(tap(() => this._signal$.next()));
  }
}
