import { Component, OnInit, Input, Renderer2, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'backdrop',
  templateUrl: './backdrop.component.html',
  styleUrls: ['./backdrop.component.scss']
})
export class BackdropComponent implements OnInit {
  /**
   * Background color of the backdrop. Can be a hex string, rgba() string, or web safe color string..
   *
   * @type {(string | number[])}
   * @memberof BackdropComponent
   */
  @Input()
  public background: string;

  /**
   * Positioning attribute that also serves as a class that gets applied to the host element, positioning it correctly.
   *
   * Accepted values include:
   *
   * - 'off-top'
   * - 'off-right'
   * - 'off-bottom'
   * - 'off-left'
   * - 'on-top'
   * - 'on-right'
   * - 'on-bottom'
   * - 'on-left'
   *
   * @type {string}
   * @memberof BackdropComponent
   */
  @Input()
  public position: 'off-top' | 'off-right' | 'off-bottom' | 'off-left' | 'on-top' | 'on-right' | 'on-bottom' | 'on-left';

  @Output()
  public voidClick: EventEmitter<MouseEvent> = new EventEmitter();

  constructor(private renderer: Renderer2, private element: ElementRef) {}

  public ngOnInit() {
    const rootElement = this.element.nativeElement;

    if (this.background) {
      this.renderer.setStyle(rootElement, 'background-color', this.background);
    }

    if (this.position) {
      this.renderer.addClass(rootElement, this.position);
    }

    this.renderer.listen(rootElement, 'click', (e: MouseEvent) => {
      this.voidClick.emit(e);
    });
  }
}
