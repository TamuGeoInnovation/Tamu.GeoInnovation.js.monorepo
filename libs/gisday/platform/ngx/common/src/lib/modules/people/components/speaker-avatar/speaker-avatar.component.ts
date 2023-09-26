import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, catchError, mapTo, of, shareReplay, switchMap } from 'rxjs';

import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';

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

  constructor(private readonly http: HttpClient, private readonly sp: SpeakerService) {}

  public ngOnInit(): void {
    this.speakerImageUrl$ = this.sp.getPhotoUrl(this.avatarGuid).pipe(shareReplay());

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

