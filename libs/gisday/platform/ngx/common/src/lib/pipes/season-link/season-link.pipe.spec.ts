import { SeasonLinkPipe } from './season-link.pipe';

describe('SeasonLinkPipe', () => {
  const pipe = new SeasonLinkPipe();

  it('links to the current year page when no year is being looked at', () => {
    expect(pipe.transform('sessions', null)).toEqual(['/sessions']);
    expect(pipe.transform('sessions', undefined)).toEqual(['/sessions']);
  });

  it('keeps the link inside the year being looked at', () => {
    expect(pipe.transform('presenters', 2025)).toEqual(['/seasons', 2025, 'presenters']);
  });

  it('accepts a path with a leading slash or several segments', () => {
    expect(pipe.transform('/sponsors', 2025)).toEqual(['/seasons', 2025, 'sponsors']);
    expect(pipe.transform('sessions/details', null)).toEqual(['/sessions/details']);
  });
});
