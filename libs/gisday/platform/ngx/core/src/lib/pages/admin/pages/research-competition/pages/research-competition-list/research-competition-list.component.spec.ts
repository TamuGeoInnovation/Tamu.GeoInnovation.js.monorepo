import { SUBMISSION_CLASSIFICATION_OPTIONS, SUBMISSION_TYPE_OPTIONS } from '@tamu-gisc/gisday/platform/ngx/common';

import { withData } from './research-competition-list.component';

/** #2817: a filter offers All and only the choices the season's submissions have. */
describe('withData', () => {
  const season = [
    { submissionType: 'poster', classificationType: 'graduate' },
    { submissionType: 'presentation', classificationType: 'graduate' },
    { submissionType: 'poster', classificationType: 'undergraduate' }
  ];

  it('offers All and only the types the season has, in the form’s order', () => {
    expect(withData(SUBMISSION_TYPE_OPTIONS, season, 'submissionType').map((o) => o.label)).toEqual([
      'All',
      'Presentation',
      'Poster'
    ]);
  });

  it('offers only the classifications the season has', () => {
    expect(withData(SUBMISSION_CLASSIFICATION_OPTIONS, season.slice(0, 2), 'classificationType').map((o) => o.label)).toEqual([
      'All',
      'Graduate'
    ]);
  });

  it('offers only All for a season with no submissions', () => {
    expect(withData(SUBMISSION_TYPE_OPTIONS, [], 'submissionType').map((o) => o.label)).toEqual(['All']);
  });
});
