import { Component, OnInit, HostListener, EventEmitter, Output } from '@angular/core';
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
export class HamburgerTriggerComponent implements OnInit {
  public flipped: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public animationState: Observable<string> = this.flipped.asObservable().pipe(switchMap((s) => of(s ? 'up' : 'down')));

  @Output()
  public poked: EventEmitter<boolean> = new EventEmitter();

  @HostListener('click')
  private _poke() {
    this.flipped.next(!this.flipped.getValue());
    this.poked.emit(this.flipped.getValue());
  }

  constructor() {}

  public ngOnInit() {}
}
