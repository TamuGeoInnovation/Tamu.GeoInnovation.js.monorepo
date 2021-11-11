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
  /**
   * The obfuscated identity string. Previously was first letter of first name, first letter
   * of last name and the last 4 of their user guid.
   */
  identity: string;

  /**
   * User guid. This is used to match the current user to their leader board item on the leader board so it
   * shows "You" instead of the identity above.
   */
  guid: string;

  /**
   * Number of points.
   */
  points: number;
}
