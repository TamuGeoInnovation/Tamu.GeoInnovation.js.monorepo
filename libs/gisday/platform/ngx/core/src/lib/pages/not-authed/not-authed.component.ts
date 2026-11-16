import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

/**
 * A page that says the visitor cannot see what they asked for: by default, that they are not signed in or lack the
 * rights (`/forbidden`). A route can give its own words and links in `data` (`message`, `links`), as the catch-all does
 * for an address the site does not know (#1765).
 */
@Component({
  selector: 'tamu-gisc-not-authed',
  templateUrl: './not-authed.component.html',
  styleUrls: ['./not-authed.component.scss'],
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class NotAuthedComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;

  public readonly message: string =
    this.data['message'] ?? 'Either you have not logged in or you lack sufficient rights to view this page.';

  public readonly links: Array<{ text: string; to: string }> = this.data['links'] ?? [];
}
