import { Component, OnInit, Renderer2, ElementRef, ChangeDetectionStrategy, inject, input, output } from '@angular/core';

@Component({
  selector: 'tamu-gisc-backdrop',
  templateUrl: './backdrop.component.html',
  styleUrls: ['./backdrop.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class BackdropComponent implements OnInit {
  private renderer = inject(Renderer2);
  private element = inject(ElementRef);

  /**
   * Background color of the backdrop. Can be a hex string, rgba() string, or web safe color string..
   */
  public readonly background = input<string>(undefined);

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
   */
  public readonly position = input<
    'off-top' | 'off-right' | 'off-bottom' | 'off-left' | 'on-top' | 'on-right' | 'on-bottom' | 'on-left'
  >(undefined);

  public readonly voidClick = output<MouseEvent>();

  public ngOnInit() {
    const rootElement = this.element.nativeElement;

    const background = this.background();
    if (background) {
      this.renderer.setStyle(rootElement, 'background-color', background);
    }

    const position = this.position();
    if (position) {
      this.renderer.addClass(rootElement, position);
    }

    this.renderer.listen(rootElement, 'click', (e: MouseEvent) => {
      this.voidClick.emit(e);
    });
  }
}
