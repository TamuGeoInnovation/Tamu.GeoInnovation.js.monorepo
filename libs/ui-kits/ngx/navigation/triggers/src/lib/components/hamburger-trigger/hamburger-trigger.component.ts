import { Component, HostListener, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-hamburger-trigger',
  templateUrl: './hamburger-trigger.component.html',
  styleUrls: ['./hamburger-trigger.component.scss'],
  animations: [
    trigger('topBun', [
      state(
        'up',
        style({
          transform: 'rotate3d(0, 0, 1, -135deg) translate3d(-0.45rem, -0.4rem, 0rem)'
        })
      ),
      state(
        'down',
        style({
          transform: 'none'
        })
      ),
      transition('* <=> *', [animate('.3s ease')])
    ]),
    trigger('patty', [
      state(
        'up',
        style({
          width: '0rem'
        })
      ),
      state(
        'down',
        style({
          width: '*'
        })
      ),
      transition('* <=> *', [animate('.2s 100ms ease')])
    ]),
    trigger('bottomBun', [
      state(
        'up',
        style({
          transform: 'rotate3d(0, 0, 1, 135deg) translate3d(-2.0rem, -0.3rem, 0rem)'
        })
      ),
      state(
        'down',
        style({
          transform: 'none'
        })
      ),
      transition('* <=> *', [animate('.3s ease')])
    ])
  ]
})
export class HamburgerTriggerComponent implements OnChanges {
  /**
   * Describes the visible status. On value update, the internal
   * trigger state is also updated to initiate animation transition
   * between states.
   */
  @Input()
  public active: boolean;

  /**
   * Event emitted when the hamburger nav element is clicked on by client.
   */
  @Output()
  public poked: EventEmitter<boolean> = new EventEmitter();

  // Internal trigger state
  private _state: BehaviorSubject<boolean> = new BehaviorSubject(false);

  // Map trigger state to an animation state
  public animationState: Observable<string> = this._state.asObservable().pipe(switchMap((s) => of(s ? 'up' : 'down')));

  @HostListener('click')
  private _poke() {
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
