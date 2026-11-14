import { deadlineNotice } from './submission-deadline-notice';

/** #2934: what the submission page says about each competition's deadline. */
describe('deadlineNotice', () => {
  const now = new Date('2026-11-14T18:00:00.000Z');
  const season = {
    posterSubmissionsCloseAt: '2026-11-13T23:00:00.000Z',
    posterFilesCloseAt: '2026-11-20T23:00:00.000Z',
    presentationSubmissionsCloseAt: '2026-11-21T05:59:00.000Z'
  };

  it('says when a competition closed, in Central time', () => {
    expect(deadlineNotice(season, 'poster', 'submissions', now)).toEqual({
      closed: true,
      text: 'Submissions to the poster competition closed on Fri, Nov 13, 2026, 5:00 PM Central.'
    });
  });

  it('says when an open one will close', () => {
    expect(deadlineNotice(season, 'presentation', 'submissions', now)).toEqual({
      closed: false,
      text: 'Submissions to the presentation competition close on Fri, Nov 20, 2026, 11:59 PM Central.'
    });
  });

  it('keeps files open until their own, later deadline', () => {
    expect(deadlineNotice(season, 'poster', 'files', now)).toEqual({
      closed: false,
      text: 'Files can be attached until Fri, Nov 20, 2026, 5:00 PM Central.'
    });
    expect(deadlineNotice(season, 'poster', 'files', new Date('2026-11-21T00:00:00.000Z'))?.closed).toBe(true);
  });

  it('closes at the deadline itself, not a moment after', () => {
    expect(deadlineNotice(season, 'poster', 'submissions', new Date(season.posterSubmissionsCloseAt))?.closed).toBe(true);
  });

  it('says nothing when no deadline is set, for a type with none, or with no season', () => {
    expect(deadlineNotice(season, 'presentation', 'files', now)).toBeNull();
    expect(deadlineNotice(season, 'paper', 'submissions', now)).toBeNull();
    expect(deadlineNotice(null, 'poster', 'submissions', now)).toBeNull();
  });
});
