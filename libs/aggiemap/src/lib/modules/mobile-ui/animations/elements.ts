import { trigger, state, style, animate, transition, query, animateChild, group } from '@angular/animations';

export const offCanvasSlideUpFromTop = trigger('offCanvasSlideUpFromTop', [
  state(
    'true',
    style({
      transform: 'translateY(-25%)'
    })
  ),
  state(
    'false',
    style({
      transform: 'translateY(100%)'
    })
  ),
  transition('* => *', [animate('250ms cubic-bezier(0.25, 0, 0.25, 1)')])
]);

export const offCanvasSlideInFromBottom = trigger('offCanvasSlideInFromBottom', [
  state(
    'true',
    style({
      transform: 'translateY(0%)'
    })
  ),
  state(
    'false',
    style({
      transform: 'translateY(100%)'
    })
  ),
  transition('* => *', [animate('200ms cubic-bezier(0.25, 0, 0.25, 1)')])
]);
