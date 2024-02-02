import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { CompetitionForm, CompetitionSeason } from '@tamu-gisc/gisday/competitions/data-api';
import { SeasonsService, FormService } from '@tamu-gisc/gisday/competitions/ngx/data-access';

@Injectable({
  providedIn: 'root'
})
export class ViewerService {
  public seasonGuid: ReplaySubject<string> = new ReplaySubject();
  public season: Observable<DeepPartial<CompetitionSeason>>;
  public seasonForm: Observable<CompetitionForm>;

  constructor(private readonly ss: SeasonsService, private readonly sf: FormService) {}

  public updateSeason(seasonGuid: string) {
    this.seasonGuid.next(seasonGuid);

    this.season = this.seasonGuid.pipe(
      switchMap(() => {
        return this.ss.getSeason(seasonGuid).pipe();
      }),
      shareReplay()
    );

    this.seasonForm = this.season.pipe(
      switchMap((s) => {
        return this.sf.getFormForSeason(s.season.guid);
      })
    );
  }
}
