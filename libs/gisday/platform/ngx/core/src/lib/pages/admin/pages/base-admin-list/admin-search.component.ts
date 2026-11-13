import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';

/**
 * The search box at the top of an admin list page (#2914), with how many the list holds, and how many of them it
 * shows while a search is in use.
 * The page's BaseAdminListComponent owns the search and does the filtering; this only draws it.
 */
@Component({
  selector: 'tamu-gisc-admin-search',
  template: `
    <div class="admin-search">
      <tamu-gisc-textbox type="text" [placeholder]="placeholder()" [formControl]="control()"></tamu-gisc-textbox>
      @if (counts(); as c) {
        <p class="admin-search-count">
          @if (control().value.trim()) {
            Showing <strong>{{ c.shown }}</strong> of {{ c.total }} {{ c.total === 1 ? one() : many() }}.
          } @else {
            <strong>{{ c.total }}</strong> {{ c.total === 1 ? one() : many() }}.
          }
        </p>
      }
    </div>
  `,
  styles: [
    `
      .admin-search {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.25rem 1rem;
        margin-bottom: 1rem;
      }

      tamu-gisc-textbox {
        flex: 0 1 32rem;
      }

      .admin-search-count {
        margin: 0;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextboxComponent, ReactiveFormsModule]
})
export class AdminSearchComponent {
  public readonly control = input.required<FormControl<string>>();
  public readonly placeholder = input('Search');
  /** What the list holds, one and many: 'class' and 'classes'. */
  public readonly one = input('item');
  public readonly many = input('items');
  /** How many rows the search shows, of how many; null until the list is read. */
  public readonly counts = input<{ shown: number; total: number } | null>(null);
}
