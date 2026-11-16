import { Component, SecurityContext, ChangeDetectionStrategy, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgClass, AsyncPipe } from '@angular/common';

import { BehaviorSubject, Observable, catchError, of, switchMap } from 'rxjs';

import { PosterDto } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, UserSubmissionsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass, AsyncPipe, SelectComponent]
})
export class GalleryComponent {
  private submissionService = inject(UserSubmissionsService);
  private seasonService = inject(SeasonService);
  private sanitizer = inject(DomSanitizer);

  public seasons$ = this.seasonService.seasons$;
  public activeSeason$ = this.seasonService.activeSeason$;

  /** The season chosen in the list; undefined until one is, which asks for the active season. */
  public selectedSeason$ = new BehaviorSubject<string | undefined>(undefined);

  /** The chosen season's posters, or 'failed' when they could not be loaded. */
  public posters$: Observable<PosterDto[] | 'failed'> = this.selectedSeason$.pipe(
    switchMap((season) => this.submissionService.getPosters(season).pipe(catchError(() => of('failed' as const))))
  );

  public setSeason(guid: string) {
    this.selectedSeason$.next(guid || undefined);
  }

  public getSanitizedLink(link: string) {
    return this.sanitizer.sanitize(SecurityContext.URL, link);
  }
}
