import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, catchError, mapTo, of, shareReplay, switchMap } from 'rxjs';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-presenter-card',
  templateUrl: './presenter-card.component.html',
  styleUrls: ['./presenter-card.component.scss']
})
export class PresenterCardComponent implements OnInit {
  @Input()
  public speaker: Partial<Speaker>;

  public imageExists$: Observable<boolean>;
  public speakerImageUrl$: Observable<string>;
  public speakerInitials: string;

  constructor(private readonly si: SpeakerService, private readonly httpClient: HttpClient) {}

  public ngOnInit(): void {
    this.speakerImageUrl$ = this.si.getPhotoUrl(this.speaker.guid).pipe(shareReplay());

    this.imageExists$ = this.speakerImageUrl$.pipe(
      switchMap((url) => {
        return this.httpClient.head(url).pipe(mapTo(true));
      }),
      catchError(() => {
        return of(false);
      }),
      shareReplay()
    );

    this.speakerInitials = this.speaker?.firstName[0] + this.speaker?.lastName[0];
  }
}

