import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

/*
 * Animation for the root menu container
 */
export const baseShowHideAnimation = trigger('baseShowHideAnimation', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'scale3d(0, 0, 0)',
      zIndex: -100
    }),
    animate(
      '.3s ease',
      style({
        opacity: 1,
        transform: 'none',
        zIndex: 10
      })
    )
  ]),
  transition(':leave', [
    style({
      opacity: '*',
      transform: '*',
      zIndex: '*'
    }),
    animate(
      '.4s ease',
      style({
        opacity: 0,
        transform: 'scale3d(0, 0, 0)',
        zIndex: -100
      })
    )
  ])
]);

/*
 * Animation for the submenu summoned after clicking on a tile with a defined submenu
 */
export const submenuShowHideAnimation = trigger('submenuShowHideAnimation', [
  transition(':enter', [
    style({
      transform: 'scale3d(0, 0, 0)',
      opacity: 0
    }),
    animate(
      '.3s ease',
      style({
        transform: 'scale3d(1, 1, 1)',
        opacity: 1
      })
    )
  ]),
  transition(':leave', [
    style({
      transform: '*',
      opacity: '*'
    }),
    animate(
      '.4s ease',
      style({
        transform: 'scale3d(0, 0, 0)',
        opacity: 0
      })
    )
  ])
]);

/*
 * Animation that staggers in the submenu list items
 */
export const tileStaggerAnimation = trigger('tileStaggerAnimation', [
  transition(':enter', [
    query(
      '.tiles tamu-gisc-tile',
      [
        style({
          opacity: 0,
          transform: 'translate3d(0, 50px, 0)'
        }),
        stagger(-30, [
          animate(
            '.25s .3s ease',
            style({
              opacity: 1,
              transform: 'none'
            })
          )
        ])
      ],
      { optional: true }
    )
  ])
]);

export const submenuListStagger = trigger('submenuListStagger', [
  transition(':enter', [
    query(
      '.body p',
      [
        style({
          opacity: 0,
          transform: 'translateY(20px)'
        }),
        stagger(30, [
          animate(
            '.4s 175ms ease',
            style({
              opacity: 1,
              transform: 'none'
            })
          )
        ])
      ],
      { optional: true }
    )
  ]),
  transition(':leave', [
    query(
      '.body p',
      [
        style({
          opacity: '*',
          transform: '*'
        }),
        stagger(30, [
          animate(
            '100ms ease',
            style({
              opacity: 0,
              transform: 'translateY(20px)'
            })
          )
        ])
      ],
      { optional: true }
    )
  ])
]);
