import { MIN_GAP, SLIDER_LENGTH, dayOf, spreadPositions } from './nearmap-timeline';

/**
 * The Aerial Imagery date slider is a timeline (#1541): ticks spaced by the time between captures, as
 * in Google Earth, except that captures days apart are kept far enough apart to see and pick.
 */
describe('Nearmap date slider timeline', () => {
  // The College Station captures Nearmap listed on 12 October 2026, oldest first.
  const captures = [
    '2016-09-30',
    '2017-07-28',
    '2018-07-27',
    '2019-07-21',
    '2020-10-06',
    '2021-10-30',
    '2022-03-22',
    '2022-03-23',
    '2022-09-30',
    '2023-08-20',
    '2023-12-17',
    '2024-11-20',
    '2025-11-22',
    '2025-11-26',
    '2026-10-05'
  ];
  const days = captures.map(dayOf);

  it('runs from the oldest capture at 0 to the newest at the end', () => {
    const positions = spreadPositions(days);

    expect(positions[0]).toBe(0);
    expect(positions[positions.length - 1]).toBeCloseTo(SLIDER_LENGTH, 6);
  });

  it('keeps every capture in date order', () => {
    const positions = spreadPositions(days);

    positions.slice(1).forEach((position, i) => expect(position).toBeGreaterThan(positions[i]));
  });

  it('keeps captures a day apart at least the minimum gap apart', () => {
    const positions = spreadPositions(days);
    const gaps = positions.slice(1).map((position, i) => position - positions[i]);

    gaps.forEach((gap) => expect(gap).toBeGreaterThanOrEqual(MIN_GAP - 1e-9));
    // 22 and 23 March 2022, one day apart.
    expect(positions[7] - positions[6]).toBeCloseTo(MIN_GAP, 6);
  });

  it('spaces captures far apart by the time between them', () => {
    const positions = spreadPositions(days);

    // Sep 2016 to Jul 2017 is ten months, Jul 2019 to Oct 2020 is fifteen: the second gap is wider.
    const tenMonths = positions[1] - positions[0];
    const fifteenMonths = positions[4] - positions[3];

    expect(fifteenMonths / tenMonths).toBeCloseTo((days[4] - days[3]) / (days[1] - days[0]), 6);
  });

  it('places evenly when the minimum gap cannot fit', () => {
    const many = Array.from({ length: 40 }, (_, i) => i);
    const positions = spreadPositions(many);

    expect(positions[0]).toBe(0);
    expect(positions[positions.length - 1]).toBeCloseTo(SLIDER_LENGTH, 6);
    positions.slice(1).forEach((position, i) => expect(position).toBeGreaterThan(positions[i]));
  });

  it('puts a single capture at the end, where the latest sits', () => {
    expect(spreadPositions([dayOf('2026-10-05')])).toEqual([SLIDER_LENGTH]);
  });
});
