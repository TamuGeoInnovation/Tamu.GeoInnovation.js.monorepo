import { Component, DestroyRef, OnInit, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, debounceTime } from 'rxjs';

import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ClipboardCopyDirective } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

/**
 * The search a link carried to the page (#2919), for the page's control to start from:
 * `new FormControl(searchFromAddress(inject(ActivatedRoute)))`. Read when the page is made, so its list is matched to it
 * from the first draw rather than changed under it.
 */
export function searchFromAddress(route: ActivatedRoute): string {
  return route.snapshot?.queryParamMap?.get('search') ?? '';
}

/**
 * A page's search box that can be linked to (#2919, #2921, #3027): the address follows the box as `?search=...`,
 * replacing the history entry rather than adding one per keystroke, and keeping the page's other parameters; and Copy
 * link, inside the box beside its clear, gives the whole link, ready to paste into an email. The page owns the control,
 * started from `searchFromAddress`, and does its own matching. First the Presenters page's, now the Sessions page's too.
 */
@Component({
  selector: 'tamu-gisc-linked-search',
  templateUrl: './linked-search.component.html',
  styleUrls: ['./linked-search.component.scss'],
  imports: [TextboxComponent, ReactiveFormsModule, AsyncPipe, ClipboardCopyDirective]
})
export class LinkedSearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /** The page's search, which the page matches its list against. */
  public readonly control = input.required<FormControl<string>>();
  public readonly placeholder = input('Search');
  /** What a screen reader hears for Copy link, such as "Copy a link to these 3 presenters". */
  public readonly copyLabel = input('Copy a link to this search');

  /** While Copy link has just copied, so it can say so. */
  public copied$: Observable<boolean>;

  public ngOnInit(): void {
    // The address follows the box (#2921), merged so the page's other parameters stay (#3027).
    this.control().valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe((search) => {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { search: search.trim() || null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  }

  /** The link to this page with the search filled in, whole, ready to paste into an email (#2921). */
  public link(): string {
    const tree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: { search: this.control().value.trim() },
      queryParamsHandling: 'merge'
    });

    return window.location.origin + this.router.serializeUrl(tree);
  }
}
