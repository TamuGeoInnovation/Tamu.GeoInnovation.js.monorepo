import {Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2} from '@angular/core';
import {Router} from '@angular/router';

@Directive({
  selector: '[tamuGiscTileLink]'
})
export class TileLinkDirective implements OnInit {
  /**
   * Location of the link to redirect to. Can be internal relative URL or absolute external URL
   *
   */
  @Input()
  public location: string;

  @Output()
  public clicked: EventEmitter<HTMLElement> = new EventEmitter();

  constructor(private router: Router, private renderer: Renderer2, private el: ElementRef) {
  }

  public ngOnInit(): void {
    if (this.location) {
      // this.renderer.setAttribute(this.el.nativeElement, 'href', this.location);
    }
  }

  @HostListener('click', ['$event.target'])
  private _click(target: HTMLElement) {
    this.clicked.next(target);
  }
}

