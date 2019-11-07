import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  constructor(private http: HttpClient, private environment: EnvironmentService) {}

  public getScores(): Observable<ILeaderboardItem[]> {
    return this.http.get(this.environment.value('LeaderboardUrl')).pipe(pluck('items'));
  }
}

export interface ILeaderboardItem {
  identity: string;
  guid: string;
  points: number;
}
