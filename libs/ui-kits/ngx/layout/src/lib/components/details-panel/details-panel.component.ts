import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, inject, input, output, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * One record opened over the page it was chosen from (#3230): a panel on the right of a wide screen, over the page dimmed
 * behind it, and the whole screen on a phone. Escape, or a click on the dimmed page, asks to close it through
 * `closeRequested`, so the page can stop it, to ask about unsaved changes first. A control inside that uses Escape itself,
 * such as a search box closing its matches, calls `preventDefault()` on it, and the panel stays open.
 *
 * While it is open, focus is in the panel and the page behind it does not scroll; when it closes, focus goes back to what
 * had it before, such as the row that opened it.
 */
@Component({
  selector: 'tamu-gisc-details-panel',
  templateUrl: './details-panel.component.html',
  styleUrls: ['./details-panel.component.scss']
})
export class DetailsPanelComponent implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);

  /** What the panel holds, read out by a screen reader as it opens, such as the record's name. */
  public readonly label = input<string>('Details');

  /** Escape, or a click outside the panel: the page closes it, or does not. */
  public readonly closeRequested = output<void>();

  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  /** What had focus before the panel opened, given it back when the panel closes. */
  private readonly returnFocusTo = this.document.activeElement as HTMLElement | null;
  private readonly bodyOverflow = this.document.body.style.overflow;

  public ngAfterViewInit(): void {
    this.document.body.style.overflow = 'hidden';
    this.panel().nativeElement.focus();
  }

  public ngOnDestroy(): void {
    this.document.body.style.overflow = this.bodyOverflow;
    this.returnFocusTo?.focus?.();
  }

  @HostListener('document:keydown.escape', ['$event'])
  public onEscape(event: KeyboardEvent): void {
    if (!event.defaultPrevented) {
      event.preventDefault();
      this.closeRequested.emit();
    }
  }
}
