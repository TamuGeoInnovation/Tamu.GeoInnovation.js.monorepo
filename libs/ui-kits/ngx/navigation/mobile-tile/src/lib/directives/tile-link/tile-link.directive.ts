import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[tamuGiscTileLink]'
})
export class TileLinkDirective {
  /**
   * Location of the link to redirect to. Can be internal relative URL or absolute external URL
   *
   */
  @Input()
  public location: string;

  /**
   * Used when input location is a relative application link
   */
  @Input()
  public fragment: string;

  @Output()
  public clicked: EventEmitter<HTMLElement> = new EventEmitter();

  constructor(private router: Router, private renderer: Renderer2, private el: ElementRef) {}

  @HostListener('click', ['$event.target'])
  private _click(target: HTMLElement) {
    const lt = this.testLocation(this.location);

    if (lt === LocationType.EXTERNAL) {
      window.location.href = this.location;
    } else if (lt === LocationType.INTERNAL) {
      this.router.navigate([this.location], this.fragment ? { fragment: this.fragment } : undefined);
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
