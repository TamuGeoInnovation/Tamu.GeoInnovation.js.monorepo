import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DeepPartial } from 'typeorm';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { noSeasonAs } from './no-season';
import { withWireDates } from './wire-dates';

export abstract class BaseService<T> {
  private readonly environmentService = inject(EnvironmentService);
  private readonly httpClient = inject(HttpClient);

  public resource: string;

  private readonly wireDates: boolean;

  /**
   * @param route The resource's path under the API.
   * @param options `wireDates`: the resource's entities have `Date` fields, which the API sends as ISO text; each
   * response then carries Dates where its type says so (#3558).
   */
  constructor(route: string, options: { wireDates?: boolean } = {}) {
    this.resource = this.environmentService.value('api_url') + `/${route}`;
    this.wireDates = options.wireDates === true;
  }

  /** A response as its type describes it: with Dates for ISO text, for a resource that has them (#3558). */
  protected answer<R>(response: Observable<R>): Observable<R> {
    return this.wireDates ? response.pipe(withWireDates()) : response;
  }

  /**
   * The active season's records, or none on a site with no season yet: the API answers 404 then, and a
   * page waiting on that answer would wait for ever (#2076). Any other error still fails.
   */
  public getEntitiesForActiveSeason(): Observable<Array<Partial<T>>> {
    return this.answer(this.httpClient.get<Array<Partial<T>>>(`${this.resource}/season/active`)).pipe(noSeasonAs([]));
  }

  public getEntitiesForSeason(guid: string) {
    return this.answer(this.httpClient.get<Array<Partial<T>>>(`${this.resource}/season/${guid}`));
  }

  public getEntities() {
    return this.answer(this.httpClient.get<Array<Partial<T>>>(`${this.resource}/`));
  }

  public getEntityWithRelations(guid: string) {
    return this.answer(this.httpClient.get<DeepPartial<T>>(`${this.resource}/${guid}/deep`));
  }

  public getEntity(guid: string) {
    return this.answer(this.httpClient.get<Partial<T>>(`${this.resource}/${guid}`));
  }

  public updateEntity(guid: string, updatedEntity: Partial<T>) {
    return this.answer(this.httpClient.patch<Partial<T>>(`${this.resource}/${guid}`, updatedEntity));
  }

  public createEntity(newEntity?: Partial<T>) {
    return this.answer(this.httpClient.post<Partial<T>>(this.resource, newEntity));
  }

  public copyEntitiesIntoSeason(seasonGuid: string, existingEntityGuids: Array<string>) {
    return this.answer(this.httpClient.post<Partial<T>>(`${this.resource}/clone`, { seasonGuid, existingEntityGuids }));
  }

  public deleteEntities(entityGuids: Array<string>) {
    return this.answer(
      this.httpClient.delete<Partial<T>>(`${this.resource}/`, {
        body: {
          guid: entityGuids.join(',')
        }
      })
    );
  }

  public deleteEntity(entityGuid: string) {
    return this.answer(this.httpClient.delete<Partial<T>>(`${this.resource}/${entityGuid}`));
  }
}
