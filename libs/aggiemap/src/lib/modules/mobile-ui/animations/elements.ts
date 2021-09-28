import { trigger, state, style, animate, transition, sequence } from '@angular/animations';

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

const animationTransitionFn = '200ms 50ms cubic-bezier(0.25, 0, 0.25, 1)';
export const offCanvasSlideInFromBottom = trigger('offCanvasSlideInFromBottom', [
  state(
    'true',
    style({
      transform: 'translateY(0%)',
      display: 'initial'
    })
  ),
  state(
    'false',
    style({
      transform: 'translateY(100%)',
      display: 'none'
    })
  ),
  transition('false => true', [sequence([style({ display: 'initial' }), animate(animationTransitionFn)])]),
  transition('true => false', [animate(animationTransitionFn)])
]);
