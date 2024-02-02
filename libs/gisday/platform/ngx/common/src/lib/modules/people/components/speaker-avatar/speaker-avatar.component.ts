import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, catchError, filter, mapTo, of, shareReplay, startWith, switchMap } from 'rxjs';

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
   * The names to use to generate the initials when `fallbackStyle` is set to `initials`.
   *
   * This should be a space-delimited string of the avatar's full name.
   *
   * The first letter of each name will be used to generate the initials.
   *
   * Can use this property or `avatarInitials` to set the initials, but not both.
   *
   * If both are set, `avatarNames` will take precedence.
   */
  @Input()
  public avatarNames: string;

  /**
   * The initials to display when `fallbackStyle` is set to `initials`.
   *
   * Can use this property or `avatarNames` to set the initials, but not both.
   *
   * If both are set, `avatarNames` will take precedence.
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
  public initials$: Observable<string>;

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
      startWith(false),
      shareReplay()
    );

    this.initials$ = this.imageExists$.pipe(
      switchMap(() => {
        if (this.avatarNames !== undefined && this.avatarNames !== null && this.avatarNames.trim().length > 0) {
          return of(
            this.avatarNames
              .split(' ')
              .map((name) => name[0])
              .join('')
          );
        } else if (
          this.avatarInitials !== undefined &&
          this.avatarInitials !== null &&
          this.avatarInitials.trim().length > 0
        ) {
          return of(this.avatarInitials);
        } else {
          return of('...');
        }
      })
    );
  }
}
