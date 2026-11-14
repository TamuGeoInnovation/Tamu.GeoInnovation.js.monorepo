import { fillReviewEmail, reviewEmailKind, reviewEmailTemplate, reviewEmailValues } from './review-email';

/** #2981: the review email as a template the reviewer can edit, filled in for each submission. */
describe('review email', () => {
  const site = { name: 'Texas A&M GIS Day', address: 'https://gisday.tamu.edu' };

  it('picks the email by decision and type', () => {
    expect(reviewEmailKind(true, 'poster')).toBe('poster');
    expect(reviewEmailKind(true, 'presentation')).toBe('presentation');
    expect(reviewEmailKind(false, 'poster')).toBe('rejection');
  });

  it('fills in every placeholder, and closes up an empty one on a line of its own', () => {
    const values = reviewEmailValues(
      { title: ' Flood maps ', participants: [{ name: 'Ana Ruiz' }], submissionType: 'poster', season: {} },
      site
    );
    const text = fillReviewEmail(reviewEmailTemplate('poster'), values);

    expect(text).toContain('Howdy Ana,');
    expect(text).toContain('"Flood maps"');
    expect(text).not.toMatch(/\{[a-z ]+\}/);
    expect(text).not.toMatch(/\n{3,}/);
  });

  it('greets someone with no name typed as "there", and gives the notes when there are some', () => {
    const values = reviewEmailValues({ title: 'T', message: 'Booth 4.', participants: [] }, site);

    expect(fillReviewEmail('Howdy {first name}, {notes}', values)).toBe('Howdy there, Additional notes: Booth 4.');
  });
});
