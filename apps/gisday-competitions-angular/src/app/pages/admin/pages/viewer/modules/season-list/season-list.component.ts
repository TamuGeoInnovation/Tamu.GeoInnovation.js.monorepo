import { Component, OnInit } from '@angular/core';
import { CompetitionSeason } from '@tamu-gisc/gisday/competitions';
import { Observable } from 'rxjs';
import { DeepPartial } from 'typeorm';

import { SeasonsService } from '../../../../../../modules/data-access/seasons/seasons.service';

@Component({
  selector: 'tamu-gisc-season-list',
  templateUrl: './season-list.component.html',
  styleUrls: ['./season-list.component.scss']
})
export class SeasonListComponent implements OnInit {
  public seasons: Observable<Array<DeepPartial<CompetitionSeason>>>;

  constructor(private ss: SeasonsService) {}

  public ngOnInit(): void {
    this.seasons = this.ss.getSeasons();
  }
}
