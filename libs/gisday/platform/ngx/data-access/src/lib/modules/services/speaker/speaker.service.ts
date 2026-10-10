import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

import { BaseService } from '../_base/base.service';

@Injectable({
  providedIn: 'root'
})
export class SpeakerService extends BaseService<Speaker> {
  private http1 = inject(HttpClient);

  public resource: string;

  constructor() {
    super('speakers');
  }

  public getPresenter(guid: string) {
    return this.http1.get<Partial<Speaker>>(`${this.resource}/${guid}`);
  }

  public getPresenters() {
    return this.http1.get<Array<Partial<Speaker>>>(`${this.resource}`);
  }

  public getParticipatingPresenters() {
    return this.http1.get<Array<Partial<Speaker>>>(`${this.resource}/participating`);
  }

  public getActivePresenters() {
    return this.http1.get<Array<Partial<Speaker>>>(`${this.resource}/season/active`);
  }

  /**
   * Gets a list of speakers that are part of the organizing committee.
   */
  public getOrganizingEntitiesForSeason(seasonGuid: string) {
    return this.http1.get<Array<Partial<Speaker>>>(`${this.resource}/organizers/season/${seasonGuid}`);
  }

  public getOrganizingEntitiesForActiveSeason() {
    return this.http1.get<Array<Partial<Speaker>>>(`${this.resource}/organizers/season/active`);
  }

  public getOrganizingEntities() {
    return this.http1.get<Array<Partial<Speaker>>>(`${this.resource}/organizers`);
  }

  public updateSpeakerInfo(guid: string, data: FormData) {
    return this.http1.patch(`${this.resource}/${guid}`, data);
  }

  public insertSpeakerInfo(data: FormData) {
    return this.http1.post(`${this.resource}`, data);
  }
}

export interface IPhotoReponse {
  base64: string;
}
