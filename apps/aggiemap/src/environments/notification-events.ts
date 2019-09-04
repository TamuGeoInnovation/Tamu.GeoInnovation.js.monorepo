import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

export const NotificationEvents: NotificationProperties[] = [
  {
    id: 'changelog-update',
    title: 'Aggiemap Has Been Updated',
    range: [0, 9999999999999],
    acknowledge: false,
    message: 'Aggiemap has received a major update! Press me to be re-directed to the Aggiemap changelog to find out more.',
    imgUrl: './assets/images/text-lines.svg',
    imgAltText: 'Newspaper Icon',
    action: {
      type: 'route',
      value: 'changelog'
    }
  },
  {
    id: 'move_in',
    title: 'Move-In',
    range: [1534309200000, 1534957200000],
    acknowledge: false,
    message:
      'Moving-in? Get the best parking information on your move-in day with the <a href="https://aggiemap.tamu.edu/movein/" target="_blank">move-in day parking app</a>.',
    imgUrl: './assets/images/package-orig.svg',
    imgAltText: '"Box Icon'
  },
  {
    id: 'out_of_bounds',
    title: 'Outside County Limits',
    acknowledge: false,
    message:
      'Sorry, Aggiemap currently does not support direction enpoints outside the Brazos County limits. Please make sure start and end points are within the county limits and try again.',
    imgUrl: './assets/images/out-of-bounds.svg',
    imgAltText: 'Out of Bounds Icon'
  },
  {
    id: 'routing_support',
    title: 'Plan Your Trip',
    range: [0, 9999999999999],
    acknowledge: false,
    message:
      'Aggiemap now allows you to plan your trip throughout Aggieland! Press me to give it a whirl now or keep an eye out for the "Directions To Here" buttons in popups.',
    imgUrl: './assets/images/directions-new.svg',
    imgAltText: 'Directions Icon',
    action: {
      type: 'route',
      value: 'map/d/trip'
    }
  },
  {
    id: 'trip_fail',
    title: 'Trip Calculation Error',
    acknowledge: false,
    message:
      "Could not calculate trip with requested points. The Aggiemap team has been notified and will be working to fix the problem. If you haven't given up already, please try again with a slighty different set of points.",
    imgUrl: './assets/images/out-of-bounds.svg',
    imgAltText: 'Trip Fail Icon'
  },
  {
    id: 'feedback_submit',
    title: 'Feedback Submitted',
    acknowledge: false,
    message: 'Thank you! Your feedback has been sumitted successfully and the Aggiemap team notified.',
    imgUrl: './assets/images/like.svg',
    imgAltText: 'Feedback Icon'
  }
];
