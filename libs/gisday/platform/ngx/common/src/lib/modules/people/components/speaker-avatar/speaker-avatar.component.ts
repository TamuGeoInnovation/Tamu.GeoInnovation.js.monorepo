import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, catchError, filter, mapTo, of, shareReplay, switchMap } from 'rxjs';

import { AssetsService } from '@tamu-gisc/gisday/platform/ngx/data-access';

@Component({
  selector: 'tamu-gisc-speaker-avatar',
  templateUrl: './speaker-avatar.component.html',
  styleUrls: ['./speaker-avatar.component.scss']
})
export class SpeakerAvatarComponent implements OnInit {
  @Input()
  public avatarGuid: string;

  /**
   * If the speaker photo is not available, this will determine whether to display the speaker's initials or a default icon.
   *
   * Defaults to `icon`.
   *
   * When set to `initials`, the initials, `avatarInitials`, must be provided.
   */
  @Input()
  public fallbackStyle: 'initials' | 'icon' = 'icon';

  /**
   * The initials to display when `fallbackStyle` is set to `initials`.
   */
  @Input()
  public avatarInitials: string;

  /**
   * The speaker's photo URL, based on the speaker's GUID.
   */
  public speakerImageUrl$: Observable<string>;

  /**
   * Performs a HEAD request to the against the speaker image url to determine if the image exists.
   */
  public imageExists$: Observable<boolean>;

  constructor(private readonly http: HttpClient, private readonly as: AssetsService) {}

  public ngOnInit(): void {
    this.speakerImageUrl$ = of(this.avatarGuid).pipe(
      filter((guid) => {
        return guid !== undefined && guid !== null;
      }),
      switchMap((guid) => {
        return this.as.getAssetUrl(guid);
      })
    );

    this.imageExists$ = this.speakerImageUrl$.pipe(
      switchMap((url) => {
        return this.http.head(url).pipe(mapTo(true));
      }),
      catchError(() => {
        return of(false);
      }),
      shareReplay()
    );
  }
}
