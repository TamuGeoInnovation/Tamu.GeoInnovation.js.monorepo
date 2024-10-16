import { NotificationProperties } from '@tamu-gisc/common/ngx/ui/notification';

export const NotificationEvents: NotificationProperties[] = [
  {
    id: 'changelog-update',
    title: 'Aggiemap Has Been Updated',
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
    title: 'Moving In?',
    range: [1723659767000, 1724047200000],
    acknowledge: false,
    message:
      'Get the best parking information on your move-in day with the <a href="https://aggiemap.tamu.edu/movein/" target="_blank">move-in day parking app</a>.',
    imgUrl: './assets/images/package-orig.svg',
    imgAltText: '"Box Icon'
  },
  {
    id: 'graduation',
    title: 'Graduation',
    range: [1557247098694, 1557637200000],
    acknowledge: false,
    message:
      'Attending graduation? Avoid the traffic and find best parking locations with the <a href="https://aggiemap.tamu.edu/graduation/arrival/" target="_blank">graduation day map</a>.',
    imgUrl: './assets/images/mortarboard.svg',
    imgAltText: '"Graduation Cap Icon'
  },
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
  },
  {
    id: 'feedback_submit',
    title: 'Feedback Submitted',
    acknowledge: false,
    message: 'Thank you! Your feedback has been submitted successfully and the Aggiemap team notified.',
    imgUrl: './assets/images/like.svg',
    imgAltText: 'Feedback Icon'
  }
  // {
  //   id: 'beta-prompt',
  //   title: 'Aggiemap Beta Branch',
  //   range: [0, 9999999999999],
  //   acknowledge: false,
  //   message:
  //     'Check out the latest and greatest features coming to Aggiemap @ <a href="https://dev.aggiemap.tamu.edu" target="_blank">dev.aggiemap.tamu.edu</a>.',
  //   imgUrl: './assets/images/text-lines.svg'
  // }
];
