import { Component, ChangeDetectionStrategy, DestroyRef, inject, signal, afterNextRender } from '@angular/core';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { ClipboardCopyDirective } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

@Component({
  selector: 'tamu-gisc-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, NgTemplateOutlet, ClipboardCopyDirective]
})
export class FaqComponent {
  private titleService = inject(Title);
  private route = inject(ActivatedRoute);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  /** The question whose link was just copied, to show a tick for a moment. */
  public readonly copied = signal<string | null>(null);

  private copiedTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.titleService.setTitle(`FAQ | ${inject(GISDAY_SITE).name}`);

    // A link to one question (/faq#event-cost) opens that question and brings it into view (#2548), on arrival and
    // when a link on this page points at another question. The questions only exist once the page has rendered.
    afterNextRender(() => {
      this.route.fragment.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((fragment) => this.openQuestion(fragment));
    });
  }

  public onFaqItemClick(event: Event) {
    // The question's own element, not whichever child was clicked: the question now holds its text and a link button.
    const item = (event.currentTarget as HTMLElement).parentElement;

    item.classList.toggle('expanded');
  }

  /** The address of one question, to share. */
  public linkTo(id: string): string {
    const location = this.document.location;

    return `${location.origin}${location.pathname}#${id}`;
  }

  /** `clipboard-copy` does the copy; this keeps the click from also opening or closing the question. */
  public onCopyLink(event: Event, id: string) {
    event.stopPropagation();

    this.copied.set(id);
    clearTimeout(this.copiedTimer);
    this.copiedTimer = setTimeout(() => this.copied.set(null), 1500);
  }

  private openQuestion(id: string | null) {
    const item = id ? this.document.getElementById(id) : null;

    if (!item || !item.classList.contains('faq-item')) {
      return;
    }

    item.classList.add('expanded');
    item.scrollIntoView({ block: 'start' });
  }
}
