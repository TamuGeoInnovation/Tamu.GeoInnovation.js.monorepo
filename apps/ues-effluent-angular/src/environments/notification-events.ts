import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

export const NotificationEvents: NotificationProperties[] = [
  {
    id: 'out_of_bounds',
    title: 'Outside County Limits',
    acknowledge: false,
    message:
      'Sorry, Aggiemap currently does not support direction endpoints outside the Brazos County limits. Please make sure start and end points are within the county limits and try again.',
    imgUrl: './assets/images/out-of-bounds.svg',
    imgAltText: 'Out of Bounds Icon'
  },
  {
    id: 'trip_fail',
    title: 'Trip Calculation Error',
    acknowledge: false,
    message:
      "Could not calculate trip with requested points. The Aggiemap team has been notified and will be working to fix the problem. If you haven't given up already, please try again with a slightly different set of points.",
    imgUrl: './assets/images/out-of-bounds.svg',
    imgAltText: 'Trip Fail Icon'
  }
];
