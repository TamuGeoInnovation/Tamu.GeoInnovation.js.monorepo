import { Component, HostBinding, HostListener, OnChanges, SimpleChanges, input, output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'tamu-gisc-hamburger-trigger',
  templateUrl: './hamburger-trigger.component.html',
  styleUrls: ['./hamburger-trigger.component.scss']
})
export class HamburgerTriggerComponent implements OnChanges {
  /**
   * Describes the visible status. On value update, the internal
   * trigger state is also updated to initiate animation transition
   * between states. Unset until bound, and null while the `async` pipe
   * every caller binds it through has no value yet.
   */
  public readonly active = input<boolean | null | undefined>(undefined);

  /**
   * Event emitted when the hamburger nav element is clicked on by client.
   */
  public readonly poked = output<boolean>();

  // Internal trigger state
  private _state: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // The bars form an X while active: the up class, animated by libs/sass/motion's hamburger-bars (#2278).
  @HostBinding('class.up')
  protected get _up() {
    return this._state.getValue();
  }

  @HostListener('click')
  protected _poke() {
    this._state.next(!this._state.getValue());
    this.poked.emit(this._state.getValue());
  }

  public ngOnChanges(changes: SimpleChanges) {
    // Only update the state when the value changes its previous value.
    if (changes && changes.active !== undefined && changes.active.previousValue != changes.active.currentValue) {
      this._state.next(changes.active.currentValue === true);
    }
  }
}
