import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  public resource: string;

  constructor(private http: HttpClient, private environment: EnvironmentService, private readonly ns: NotificationService) {
    this.resource = `${this.environment.value('api_url')}/competitions/leaderboards`;
  }

  public getScoresForActive(): Observable<ILeaderboardItem[]> {
    return this.http.get<Array<ILeaderboardItem>>(`${this.resource}/active`).pipe(
      catchError((err) => {
        this.ns.toast({
          id: 'leaderboard-load-failure',
          title: 'Failed to Load Leader Board Totals',
          message: `The server experienced an error loading the leader board totals. Please try again later. (${err.status})`
        });

        throw new Error('Failed loading leaderboard');
      })
    );
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
