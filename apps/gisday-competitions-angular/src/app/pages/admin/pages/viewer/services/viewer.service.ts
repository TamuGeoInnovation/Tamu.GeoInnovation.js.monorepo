import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { shareReplay, switchMap } from 'rxjs/operators';
import { DeepPartial } from 'typeorm';

import { CompetitionForm, CompetitionSeason } from '@tamu-gisc/gisday/competitions/data-api';

import { SeasonsService } from '../../../../../modules/data-access/seasons/seasons.service';
import { FormService } from '../../../../../modules/data-access/form/form.service';

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
      switchMap((guid) => {
        return this.ss.getSeason(seasonGuid).pipe();
      }),
      shareReplay()
    );

    this.seasonForm = this.season.pipe(
      switchMap((season) => {
        return this.sf.getFormForSeason(season.year);
      })
    );
  }
}
