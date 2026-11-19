import { Component, ElementRef, AfterContentInit, DestroyRef, effect, inject, input, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AccordionService } from './services/accordion.service';

@Component({
  selector: 'tamu-gisc-accordion',
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
  providers: [AccordionService]
})
export class AccordionComponent implements AfterContentInit {
  private el = inject(ElementRef);
  private comm = inject(AccordionService);

  /**
   * Whether the accordion is open. It follows the parent's binding whenever that changes, not only on the first draw
   * (#3221), and `[(expanded)]` hears the header open or close it, so a parent can open it from code and know its state.
   */
  public readonly expanded = model(false);

  public readonly resize = input(false);

  public readonly animate = input(false);

  constructor() {
    effect(() => this.comm.update({ expanded: this.expanded() }));

    // The header toggles the shared state; report it back through `expanded`.
    this.comm.state.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((state) => {
      if (state.expanded !== this.expanded()) {
        this.expanded.set(state.expanded);
      }
    });
  }

  public ngAfterContentInit() {
    this.comm.update({
      animate: this.animate(),
      expanded: this.expanded(),
      resize: this.resize()
    });
  }

  public toggle() {
    this.expanded.set(!this.expanded());
  }
}
