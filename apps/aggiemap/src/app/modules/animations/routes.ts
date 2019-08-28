import { trigger, state, style, animate, transition, query, animateChild, group } from '@angular/animations';

export const routerTransition = trigger('routerTransition', [
  transition('* <=> *', [
    query(':enter', [
      style({
        transform: 'translateY(-125%)'
      })
    ]),
    query(':leave', animateChild(), { optional: true }),
    group([
      query(
        ':leave',
        [
          animate(
            '350ms cubic-bezier(0.25, 0, 0.25, 1)',
            style({
              transform: 'translateY(-125%)'
            })
          )
        ],
        { optional: true }
      ),
      query(':enter', [
        animate(
          '350ms cubic-bezier(0.25, 0, 0.25, 1)',
          style({
            transform: 'translateY(0)'
          })
        )
      ])
    ]),
    query(':enter', animateChild())
  ])
]);

export const hideTopTransition = trigger('hideTop', [
  state(
    'false',
    style({
      transform: 'translateY(0%)'
    })
  ),
  state(
    'true',
    style({
      transform: 'translateY(-125%)'
    })
  ),
  transition('* => *', [animate('250ms cubic-bezier(0.25, 0, 0.25, 1)')])
]);
