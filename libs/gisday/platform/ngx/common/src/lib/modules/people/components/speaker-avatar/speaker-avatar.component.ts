import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectionStrategy, inject, input, signal } from '@angular/core';
import { Observable, catchError, filter, mapTo, of, shareReplay, startWith, switchMap, tap } from 'rxjs';

import { AssetsService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-speaker-avatar',
  templateUrl: './speaker-avatar.component.html',
  styleUrls: ['./speaker-avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [AsyncPipe]
})
export class SpeakerAvatarComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly as = inject(AssetsService);

  public readonly avatarImageUrl = input<string>(undefined);

  /**
   * If the avatar photo is not available, this will determine whether to display the avatar's initials or a default icon.
   *
   * Defaults to `icon`.
   *
   * When set to `initials`, the initials, `avatarInitials`, must be provided.
   */
  public readonly fallbackStyle = input<'initials' | 'icon'>('icon');

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
  public readonly avatarNames = input<string>(undefined);

  /**
   * The initials to display when `fallbackStyle` is set to `initials`.
   *
   * Can use this property or `avatarNames` to set the initials, but not both.
   *
   * If both are set, `avatarNames` will take precedence.
   */
  public readonly avatarInitials = input<string>(undefined);

  /**
   * The avatar's image URL, based on the avatars's GUID. This endpoint simply returns the relative path to the image.
   */
  public avatarImageUrl$: Observable<string>;

  /**
   * Performs a HEAD request to the against the avatar image url to determine if the image exists.
   */
  public imageExists$: Observable<boolean>;

  /**
   * Whether the photo itself is on screen, for anything drawn over it: the class banner shows only on a photo, never
   * on the initials or the person icon (#2568).
   */
  public readonly showingPhoto = signal(false);
  public initials$: Observable<string>;

  public ngOnInit(): void {
    this.avatarImageUrl$ = of(this.avatarImageUrl()).pipe(
      filter((guid) => {
        return guid !== undefined && guid !== null;
      }),
      switchMap((guid) => {
        return this.as.getAssetUrl(guid);
      })
    );

    this.imageExists$ = this.avatarImageUrl$.pipe(
      switchMap((url) => {
        return this.http.head(url).pipe(mapTo(true));
      }),
      catchError(() => {
        return of(false);
      }),
      startWith(false),
      tap((exists) => this.showingPhoto.set(exists)),
      shareReplay()
    );

    this.initials$ = this.imageExists$.pipe(
      switchMap(() => {
        const avatarNames = this.avatarNames();
        const avatarInitials = this.avatarInitials();
        if (avatarNames !== undefined && avatarNames !== null && avatarNames.trim().length > 0) {
          return of(
            avatarNames
              .split(' ')
              .map((name) => name[0])
              .join('')
          );
        } else if (avatarInitials !== undefined && avatarInitials !== null && avatarInitials.trim().length > 0) {
          return of(avatarInitials);
        } else {
          return of('...');
        }
      })
    );
  }
}
