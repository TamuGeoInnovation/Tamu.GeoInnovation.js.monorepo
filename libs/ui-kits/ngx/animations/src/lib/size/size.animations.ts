import { trigger, transition, style, animate } from '@angular/animations';

// Animation that makes the element grow by modifying the max-height attribute
// Being at 0% height and 100% opacity at the start of the animation and 100% height and 0% opacity at the end
export const growAnimationBuilder = (maxPixelHeight: number) => {
  return trigger('growAnimation', [
    transition(':enter', [
      style({
        maxHeight: '0px'
      }),
      animate(
        '.5s ease',
        style({
          maxHeight: `${maxPixelHeight}px`
        })
      )
    ]),
    transition(':leave', [
      style({
        maxHeight: `${maxPixelHeight}px`
      }),
      animate(
        '.5s ease',
        style({
          maxHeight: '0px'
        })
      )
    ])
  ]);
};
