import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { IParticipant } from '@tamu-gisc/cpa/common/entities';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  public resource: string;

  constructor(private environment: EnvironmentService, private http: HttpClient) {
    this.resource = this.environment.value(`api_url`) + 'participants';
  }

  public getParticipantsForWorkshop(workshopGuidOrAlias: string) {
    return this.http.get<Array<IParticipant>>(`${this.resource}/workshop/${workshopGuidOrAlias}`);
  }

  public updateParticipant(participantGuid: string, participantName: string) {
    return this.http.patch<IParticipant>(`${this.resource}`, { participantGuid, name: participantName });
  }

  public createParticipantForWorkshop(workshopGuid: string, name: string) {
    return this.http.post<IParticipant>(`${this.resource}/workshop`, { workshopGuid, name });
  }

  public deleteParticipant(participantGuid: string) {
    return this.http.delete<IParticipant>(`${this.resource}/${participantGuid}`);
  }
}
