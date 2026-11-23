import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { SeasonWinnersAdminDto, SeasonWinnersDto, WinnerChoice } from '@tamu-gisc/gisday/common';

/** A season's winners (#3239): the homepage's read, and the admins' Winners page. */
@Injectable({ providedIn: 'root' })
export class SeasonWinnersService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(EnvironmentService).value('api_url');

  /** The active season's winners once its GIS Day is over, else null. */
  public shown() {
    return this.http.get<SeasonWinnersDto | null>(`${this.api}/season-winners`);
  }

  /** A season's judged competitions, each with its accepted entries, and the places picked. */
  public forSeason(seasonGuid: string) {
    return this.http.get<SeasonWinnersAdminDto>(`${this.api}/season-winners/season/${seasonGuid}`);
  }

  /** Every judged place of a season, which replace those it had. */
  public save(seasonGuid: string, winners: Array<WinnerChoice>) {
    return this.http.put<SeasonWinnersAdminDto>(`${this.api}/season-winners/season/${seasonGuid}`, { winners });
  }
}
