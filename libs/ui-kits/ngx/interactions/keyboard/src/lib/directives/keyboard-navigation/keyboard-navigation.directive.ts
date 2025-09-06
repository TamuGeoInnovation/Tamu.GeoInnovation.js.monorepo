import { Directive, ElementRef, HostListener, Input, AfterViewInit } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[keyboardNavigation]'
})
export class KeyboardNavigationDirective implements AfterViewInit {
  /** CSS selector for option elements inside the host where focus/selection will occur. */
  @Input('keyboardNavigation') public optionSelector = '.autocomplete-item';

  /** Attribute name used to mark the active/focused option (will be set to true/false). */
  @Input() public activeAttr = 'aria-selected';

  private options: HTMLElement[] = [];
  private activeIndex = -1;
  private externalControl: HTMLElement | null = null;
  private externalKeydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(private host: ElementRef<HTMLElement>) {}

  public ngAfterViewInit() {
    this.refreshOptions();
  }

  @HostListener('document:focusin', ['$event'])
  public onDocumentFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const hostId = this.host.nativeElement.id;
    if (!hostId) {
      return;
    }

    // Walk up from focused element to find aria-controls referencing this host
    let node: HTMLElement | null = target;
    while (node) {
      const controls = node.getAttribute && node.getAttribute('aria-controls');
      if (controls && controls === hostId) {
        this.attachExternalKeydown(node);
        return;
      }
      node = node.parentElement;
    }
  }

  @HostListener('document:focusout')
  public onDocumentFocusOut() {
    this.detachExternalKeydown();
  }

  private attachExternalKeydown(el: HTMLElement) {
    if (this.externalControl === el) {
      return;
    }
    this.detachExternalKeydown();
    this.externalControl = el;
    this.externalKeydownHandler = (e: KeyboardEvent) => {
      // delegate to the existing document keydown logic path by calling it directly
      this.onDocumentKeydown(e);
    };
    el.addEventListener('keydown', this.externalKeydownHandler as EventListener);
  }

  private detachExternalKeydown() {
    if (this.externalControl && this.externalKeydownHandler) {
      this.externalControl.removeEventListener('keydown', this.externalKeydownHandler as EventListener);
    }
    this.externalControl = null;
    this.externalKeydownHandler = null;
  }

  public refreshOptions() {
    const el = this.host.nativeElement;
    this.options = Array.from(el.querySelectorAll(this.optionSelector)) as HTMLElement[];
    // Ensure options have tabindex for programmatic focus
    this.options.forEach((o) => {
      if (!o.hasAttribute('tabindex')) {
        o.setAttribute('tabindex', '-1');
      }
    });
  }

  @HostListener('keydown', ['$event'])
  public onKeydown(event: KeyboardEvent) {
    // If event is already prevented, don't handle it
    if (event.defaultPrevented) {
      return;
    }

    // Refresh options each keydown in case list changed
    this.refreshOptions();

    if (!this.options || this.options.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(-1);
        break;
      case 'Enter':
      case ' ': // space
        event.preventDefault();
        this.selectActive();
        break;
      case 'Escape':
        this.closeList();
        break;
      default:
        break;
    }
  }

  /**
   * Listen for key events from other elements (notably the input) that point to this list
   * using aria-controls. This enables jumping into the list from the input with ArrowDown.
   */
  @HostListener('document:keydown', ['$event'])
  public onDocumentKeydown(event: KeyboardEvent) {
    // If event is already prevented, don't handle it
    if (event.defaultPrevented) {
      return;
    }

    // If host contains the active element, host keydown will handle it.
    const active = document.activeElement as HTMLElement | null;
    if (!active) {
      return;
    }

    const hostEl = this.host.nativeElement;

    // If focus is already inside the host, ignore (host keydown will handle it)
    if (hostEl.contains(active)) {
      return;
    }

    // Walk up the active element's ancestor chain to find an element that declares aria-controls
    // pointing to this host's id. This handles cases where the native <input> is nested inside
    // a custom component (e.g., <tamu-gisc-textbox>) that has aria-controls on the outer element.
    let node: HTMLElement | null = active;
    let referencesThisHost = false;
    while (node) {
      try {
        const controls = node.getAttribute && node.getAttribute('aria-controls');
        if (controls && controls === hostEl.id) {
          referencesThisHost = true;
          break;
        }
      } catch (e) {
        // ignore
      }
      node = node.parentElement;
    }

    if (!referencesThisHost) {
      return;
    }

    // Refresh options in case the list has been updated
    this.refreshOptions();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.options.length > 0) {
          this.setActive(0);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (this.options.length > 0) {
          this.setActive(this.options.length - 1);
        }
        break;
      case 'Enter':
      case ' ': // space
        event.preventDefault();
        // If nothing active, activate first then select
        if (this.activeIndex < 0 && this.options.length > 0) {
          this.setActive(0);
        }
        this.selectActive();
        break;
      case 'Escape':
        this.closeList();
        break;
      default:
        break;
    }
  }

  private move(delta: number) {
    const len = this.options.length;
    if (len === 0) {
      return;
    }

    // compute next index
    let next = this.activeIndex + delta;
    if (next < 0) {
      next = len - 1;
    }
    if (next >= len) {
      next = 0;
    }

    this.setActive(next);
  }

  private setActive(index: number) {
    if (this.activeIndex >= 0 && this.options[this.activeIndex]) {
      this.options[this.activeIndex].setAttribute(this.activeAttr, 'false');
    }

    this.activeIndex = index;

    const el = this.options[this.activeIndex];
    if (el) {
      el.setAttribute(this.activeAttr, 'true');
      el.focus();
    }
  }

  private selectActive() {
    if (this.activeIndex >= 0 && this.options[this.activeIndex]) {
      // Dispatch click on the element so components relying on click handlers receive it.
      const el = this.options[this.activeIndex];
      el.click();
    }
  }

  private closeList() {
    // Blur focused element and attempt to close any open lists by dispatching Escape keyboard event
    const host = this.host.nativeElement;
    host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    // revert active state
    if (this.activeIndex >= 0 && this.options[this.activeIndex]) {
      this.options[this.activeIndex].setAttribute(this.activeAttr, 'false');
    }
    this.activeIndex = -1;
  }
}
