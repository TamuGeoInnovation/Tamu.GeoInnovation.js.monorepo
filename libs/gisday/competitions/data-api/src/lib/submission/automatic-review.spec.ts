import { automaticReviewReasons, ReviewedSubmission } from './automatic-review';

/**
 * #2164: submissions are reviewed when they are saved. One that passes every check is verified by the
 * app; one that fails stays unverified, with the reasons, for a person to look at.
 */
describe('automaticReviewReasons', () => {
  // About 1 metre in degrees of latitude.
  const metre = 1 / 111195;
  const rudderPlaza = { latitude: 30.61316, longitude: -96.34062 };
  const north = (metres: number) => ({ latitude: rudderPlaza.latitude + metres * metre, longitude: rudderPlaza.longitude });

  // The 2026 form, as #2162 configures it.
  const form = [
    {
      attribute: 'memorial_type',
      isDiscriminator: true,
      options: [
        { name: 'Monument', value: 'monument', sameThingMetres: 15 },
        { name: 'Memorial marker', value: 'memorial_marker', sameThingMetres: 15 },
        {
          name: 'Tree or bench memorial plaque',
          value: 'tree_bench_plaque',
          sameThingMetres: 10,
          nameAttribute: 'memorial_name'
        }
      ]
    },
    { attribute: 'memorial_name', options: [] }
  ];

  const at = new Date('2026-11-12T16:00:00Z');
  const secondsBefore = (seconds: number) => new Date(at.getTime() - seconds * 1000);

  const submission = (overrides: Partial<ReviewedSubmission> = {}): ReviewedSubmission => ({
    created: at,
    value: { memorial_type: 'tree_bench_plaque', memorial_name: 'John Smith' },
    location: { ...rudderPlaza, accuracy: 5 },
    photos: 1,
    ...overrides
  });

  it('passes a submission with a photo, a name, a precise location on campus, and nothing like it before', () => {
    expect(automaticReviewReasons(submission(), [], form)).toEqual([]);
  });

  it('fails a submission with no photo', () => {
    expect(automaticReviewReasons(submission({ photos: 0 }), [], form)).toEqual(['No photo']);
  });

  it("fails a plaque with no name, only spaces, or only a plaque's wording", () => {
    for (const memorial_name of [undefined, '  ', 'In loving memory']) {
      expect(automaticReviewReasons(submission({ value: { memorial_type: 'tree_bench_plaque', memorial_name } }), [], form)).toEqual([
        'No name'
      ]);
    }
  });

  // #2428 review: only a type with a name question needs a name.
  it('does not ask for a name for a type without a name question', () => {
    expect(automaticReviewReasons(submission({ value: { memorial_type: 'monument' } }), [], form)).toEqual([]);
  });

  it('does not ask for a name when the form has no name question', () => {
    const noNames = [{ attribute: 'kind', isDiscriminator: true, options: [{ name: 'Monument', value: 'monument' }] }];

    expect(automaticReviewReasons(submission({ value: { kind: 'monument' } }), [], noNames)).toEqual([]);
  });

  it('passes the Main, West and RELLIS campuses', () => {
    const westCampus = { latitude: 30.6036, longitude: -96.3588 }; // Reed Arena
    const rellis = { latitude: 30.6466, longitude: -96.4758 };

    for (const place of [rudderPlaza, westCampus, rellis]) {
      expect(automaticReviewReasons(submission({ location: { ...place, accuracy: 5 } }), [], form)).toEqual([]);
    }
  });

  it('fails a location away from Texas A&M, or with no location', () => {
    const downtownBryan = { latitude: 30.6744, longitude: -96.3698 };
    const houston = { latitude: 29.7604, longitude: -95.3698 };

    expect(automaticReviewReasons(submission({ location: { ...downtownBryan, accuracy: 5 } }), [], form)).toEqual([
      'Not on Texas A&M property in Brazos County'
    ]);
    expect(automaticReviewReasons(submission({ location: { ...houston, accuracy: 5 } }), [], form)).toEqual([
      'Not on Texas A&M property in Brazos County'
    ]);
    expect(automaticReviewReasons(submission({ location: { latitude: 0, longitude: 0, accuracy: 0 } }), [], form)).toEqual([
      'No location'
    ]);
  });

  it('fails a location the phone did not give an accuracy for, or gave as worse than 15 m', () => {
    expect(automaticReviewReasons(submission({ location: { ...rudderPlaza, accuracy: 0 } }), [], form)).toEqual([
      'Location accuracy not recorded'
    ]);
    expect(automaticReviewReasons(submission({ location: { ...rudderPlaza, accuracy: 15 } }), [], form)).toEqual([]);
    expect(automaticReviewReasons(submission({ location: { ...rudderPlaza, accuracy: 42.5 } }), [], form)).toEqual([
      'Location accurate only to 43 m'
    ]);
  });

  it('fails the same participant submitting the same thing again', () => {
    const earlier = [submission({ created: secondsBefore(600) })];
    const again = submission({
      location: { ...north(4), accuracy: 5 },
      value: { memorial_type: 'tree_bench_plaque', memorial_name: 'john smith' }
    });

    expect(automaticReviewReasons(again, earlier, form)).toEqual(['Already submitted by this participant']);
  });

  // Dan's decision of 26 October (#2424): one person's own earlier submission of the type nearby is a
  // repeat, whatever the names; the review follows the scoring's rule.
  it('fails the same participant submitting another plaque of the type nearby, whatever its name', () => {
    const earlier = [submission({ created: secondsBefore(600) })];
    const neighbour = submission({
      location: { ...north(4), accuracy: 5 },
      value: { memorial_type: 'tree_bench_plaque', memorial_name: 'Jane Doe' }
    });

    expect(automaticReviewReasons(neighbour, earlier, form)).toEqual(['Already submitted by this participant']);
  });

  it('passes the same participant submitting another type at the spot, or the same type further away', () => {
    const earlier = [submission({ created: secondsBefore(600) })];

    expect(automaticReviewReasons(submission({ value: { memorial_type: 'monument', memorial_name: 'John Smith' } }), earlier, form)).toEqual(
      []
    );
    expect(automaticReviewReasons(submission({ location: { ...north(12), accuracy: 5 } }), earlier, form)).toEqual([]);
  });

  it("ignores the participant's discarded submissions", () => {
    const earlier = [submission({ created: secondsBefore(600), discarded: true })];

    expect(automaticReviewReasons(submission(), earlier, form)).toEqual([]);
  });

  it('fails a tenth submission within two minutes, but not a tenth spread over longer', () => {
    // Nine earlier ones, each at its own spot, so none is a repeat.
    const quick = Array.from({ length: 9 }, (_, i) =>
      submission({ created: secondsBefore(110 - i * 10), location: { ...north(100 * (i + 1)), accuracy: 5 } })
    );
    const slow = Array.from({ length: 9 }, (_, i) =>
      submission({ created: secondsBefore(900 - i * 90), location: { ...north(100 * (i + 1)), accuracy: 5 } })
    );

    expect(automaticReviewReasons(submission(), quick, form)).toEqual(['10 submissions in 2 minutes']);
    expect(automaticReviewReasons(submission(), slow, form)).toEqual([]);
  });

  it('lists every reason that applies', () => {
    expect(
      automaticReviewReasons(
        submission({ photos: 0, value: { memorial_type: 'tree_bench_plaque' }, location: { ...rudderPlaza, accuracy: 0 } }),
        [],
        form
      )
    ).toEqual(['No photo', 'No name', 'Location accuracy not recorded']);
  });
});
