import { Component, OnInit } from '@angular/core';
import { filter, mergeMap, Observable, switchMap, toArray } from 'rxjs';

import { Place, Season } from '@tamu-gisc/gisday/platform/data-api';
import { PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { PlaceVisibilityOptions } from '../../enums/place-visibility-options.enum';

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
    this.organizations$ = this.activeSeason$.pipe(
      switchMap(() => {
        return this.os.getEntitiesForActiveSeason().pipe(
          mergeMap((places) => places),
          filter((place) => place?.visibilitySettings && place.visibilitySettings.includes(PlaceVisibilityOptions.Footer)),
          toArray()
        );
      })
    );
  }
}
