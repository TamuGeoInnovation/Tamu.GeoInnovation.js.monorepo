import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Place, Season } from '@tamu-gisc/gisday/platform/data-api';
import { PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  public activeSeason$: Observable<Partial<Season>>;
  public organizations$: Observable<Array<Partial<Place>>>;
  public currentYear: number;

  constructor(private readonly ss: SeasonService, private readonly os: PlaceService) {}

  public ngOnInit(): void {
    this.activeSeason$ = this.ss.activeSeason$;
    this.currentYear = new Date().getFullYear();
    this.organizations$ = this.os.getEntitiesForActiveSeason();
  }
}
