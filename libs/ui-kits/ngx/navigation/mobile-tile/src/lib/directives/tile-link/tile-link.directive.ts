import { Directive, ElementRef, HostListener, Renderer2, inject, input, output } from '@angular/core';
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
  public readonly location = input.required<string>();

  /**
   * Used when input location is a relative application link
   */
  public readonly fragment = input<string | undefined>(undefined);

  public readonly clicked = output<HTMLElement>();

  @HostListener('click', ['$event.target'])
  protected _click(target: HTMLElement) {
    this.follow(target);
  }

  /** True when a node is the link's element or inside it: its own click handler has already followed it. */
  public contains(node: Node | null): boolean {
    return node !== null && (this.el.nativeElement as HTMLElement).contains(node);
  }

  /**
   * Goes to the link's location and says so. Its tile calls it for a tap anywhere else on the tile, so the whole box is
   * the tap target, not only the words the link sits on (#3198).
   */
  public follow(target: HTMLElement = this.el.nativeElement) {
    const lt = this.testLocation(this.location());

    if (lt === LocationType.EXTERNAL) {
      window.location.href = this.location();
    } else if (lt === LocationType.INTERNAL) {
      const fragment = this.fragment();
      this.router.navigate([this.location()], fragment ? { fragment: fragment } : undefined);
    }

    this.clicked.emit(target);
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
