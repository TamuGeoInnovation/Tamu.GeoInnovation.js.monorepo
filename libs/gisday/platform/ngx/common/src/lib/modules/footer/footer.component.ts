import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  public activeSeason$: Observable<Partial<Season>>;

  constructor(private readonly ss: SeasonService) {}

  public ngOnInit(): void {
    this.activeSeason$ = this.ss.activeSeason$;
  }
}
