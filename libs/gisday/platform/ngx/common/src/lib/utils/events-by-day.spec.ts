import { Event } from '@tamu-gisc/gisday/platform/data-api';

import { groupEventsByDay } from './events-by-day';

const CST = 'GMT-0600 (Central Standard Time)';
const monday = { guid: 'day-mon', date: '2026-11-16T06:00:00.000Z' };
const tuesday = { guid: 'day-tue', date: '2026-11-17T06:00:00.000Z' };

const event = (name: string, day: typeof monday | null, start: string) =>
  ({ guid: name, name, day, startTime: start }) as unknown as Partial<Event>;

describe('groupEventsByDay', () => {
  it('puts each day in its own group, in day order, and each day in start-time order', () => {
    const groups = groupEventsByDay([
      event('tue lunch', tuesday, `11:45:00 ${CST}`),
      event('mon workshop', monday, `12:30:00 ${CST}`),
      event('tue panel', tuesday, `10:00:00 ${CST}`),
      event('mon early', monday, `09:00:00 ${CST}`)
    ]);

    expect(groups.map((g) => g.key)).toEqual(['day-mon', 'day-tue']);
    expect(groups[0].date.toISOString()).toBe('2026-11-16T06:00:00.000Z');
    expect(groups.map((g) => g.events.map((e) => e.name))).toEqual([
      ['mon early', 'mon workshop'],
      ['tue panel', 'tue lunch']
    ]);
  });

  it('puts events with no day last, in a group with no date', () => {
    const groups = groupEventsByDay([event('unscheduled', null, `09:00:00 ${CST}`), event('mon', monday, `09:00:00 ${CST}`)]);

    expect(groups.map((g) => [g.key, g.date === null])).toEqual([
      ['day-mon', false],
      ['no-day', true]
    ]);
  });

  it('keeps an event whose time cannot be read, last in its day (#1772)', () => {
    const groups = groupEventsByDay([event('broken', monday, 'Invalid Date'), event('fine', monday, `14:00:00 ${CST}`)]);

    expect(groups[0].events.map((e) => e.name)).toEqual(['fine', 'broken']);
  });

  it('answers no groups for no events, and leaves the list it was given alone', () => {
    const given = [event('b', tuesday, `09:00:00 ${CST}`), event('a', monday, `09:00:00 ${CST}`)];

    groupEventsByDay(given);

    expect(given.map((e) => e.name)).toEqual(['b', 'a']);
    expect(groupEventsByDay(null)).toEqual([]);
  });
});
