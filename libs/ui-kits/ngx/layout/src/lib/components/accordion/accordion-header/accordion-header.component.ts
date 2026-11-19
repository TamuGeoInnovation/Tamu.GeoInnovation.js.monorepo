import { Component, HostListener, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { AccordionService } from '../services/accordion.service';
import { AbstractSlidingDrawerComponent } from '../../../abstracts/abstract-sliding-drawer/abstract-sliding-drawer.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-accordion-header',
  templateUrl: './accordion-header.component.html',
  styleUrls: ['./accordion-header.component.scss'],
  imports: [AbstractSlidingDrawerComponent, AsyncPipe],
  // A button to the keyboard and to a screen reader, saying whether it is open (#3221): it was a clickable box only.
  host: {
    role: 'button',
    tabindex: '0',
    '[attr.aria-expanded]': 'expanded() === true',
    '[class.plain]': "look() === 'plain'"
  }
})
export class AccordionHeaderComponent {
  private comm = inject(AccordionService);

  public state = this.comm.state;

  protected readonly expanded = toSignal(this.comm.state.pipe(map((state) => state.expanded)), { initialValue: false });

  /**
   * `bar`, the default, is a grey bar. `plain` leaves the header's own content as it is, with only the open and close
   * mark beside it, for a header that is already a heading, such as a GIS Day day's date (#3221).
   */
  public readonly look = input<'bar' | 'plain'>('bar');

  @HostListener('click')
  protected _onClick() {
    this.comm.toggle('expanded');
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  protected _onKey(event: Event) {
    event.preventDefault();
    this.comm.toggle('expanded');
  }
}
