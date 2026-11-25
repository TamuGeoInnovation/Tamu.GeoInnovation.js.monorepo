import { Component, Injector, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, map, of } from 'rxjs';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';

/**
 * A page that says the visitor cannot see what they asked for: by default, that they are not signed in or lack the
 * rights (`/forbidden`). A route can give its own words and links in `data` (`heading`, `message`, `links`), as the
 * catch-all does for an address the site does not know (#1765), and `/signed-in` for a visitor already signed in (#3154).
 * With `title`, the browser tab says it, beside the site's name; with `showSignedInAs`, the page names the account the
 * visitor is signed in with. Both are read only when asked for, so the other routes need neither the site nor Auth0.
 */
@Component({
  selector: 'tamu-gisc-not-authed',
  templateUrl: './not-authed.component.html',
  styleUrls: ['./not-authed.component.scss'],
  imports: [RouterLink, AsyncPipe]
})
export class NotAuthedComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  private readonly injector = inject(Injector);

  /** The page's heading: "Sorry" unless the route gives its own, as the already-signed-in page does (#3154). */
  public readonly heading: string = this.data['heading'] ?? 'Sorry';

  public readonly message: string =
    this.data['message'] ?? 'Either you have not logged in or you lack sufficient rights to view this page.';

  public readonly links: Array<{ text: string; to: string }> = this.data['links'] ?? [];

  /** Who the visitor is signed in as, by their name or else their email, where the route asks (#3154). */
  public readonly signedInAs$: Observable<string | null> = this.data['showSignedInAs']
    ? this.injector.get(AuthService).user$.pipe(map((user) => user?.name?.trim() || user?.email?.trim() || null))
    : of(null);

  constructor() {
    const title: string | undefined = this.data['title'];

    if (title) {
      this.injector.get(Title).setTitle(`${title} | ${this.injector.get(GISDAY_SITE).name}`);
    }
  }
}
