import { trigger, state, style, transition, animate } from '@angular/animations';

export const slide = trigger('slide', [
  state(
    'true',
    style({
      transform: 'translateX(0)'
    })
  ),
  state(
    'false',
    style({
      transform: 'translate({{xLimit}})'
    }),
    { params: { xLimit: 0 } }
  ),
  transition('* => *', [animate('350ms cubic-bezier(0.25, 0, 0.25, 1)')])
]);
