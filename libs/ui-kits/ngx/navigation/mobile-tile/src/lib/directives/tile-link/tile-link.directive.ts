import { Directive, ElementRef, EventEmitter, HostListener, Output, Renderer2, inject, input } from '@angular/core';
import { Router } from '@angular/router';

@Directive({ selector: '[tamuGiscTileLink]' })
export class TileLinkDirective {
  private router = inject(Router);
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);

  /**
   * Location of the link to redirect to. Can be internal relative URL or absolute external URL
   *
   */
  public readonly location = input<string>(undefined);

  /**
   * Used when input location is a relative application link
   */
  public readonly fragment = input<string>(undefined);

  @Output()
  public clicked: EventEmitter<HTMLElement> = new EventEmitter();

  @HostListener('click', ['$event.target'])
  protected _click(target: HTMLElement) {
    const lt = this.testLocation(this.location());

    if (lt === LocationType.EXTERNAL) {
      window.location.href = this.location();
    } else if (lt === LocationType.INTERNAL) {
      const fragment = this.fragment();
      this.router.navigate([this.location()], fragment ? { fragment: fragment } : undefined);
    }

    this.clicked.next(target);
  }

  private testLocation(loc: string): LocationType {
    const reg = new RegExp('^(http|https)://', 'i');
    const isAbsolute = reg.test(loc);

    if (isAbsolute) {
      return LocationType.EXTERNAL;
    } else {
      return LocationType.INTERNAL;
    }
  }
}

export enum LocationType {
  INTERNAL,
  EXTERNAL
}
