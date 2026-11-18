import { EventFormValue, eventFormProblems } from './event-form-problems';

const complete: EventFormValue = {
  day: 'day-2026-11-20',
  startTime: '14:00:00 GMT-0600 (Central Standard Time)',
  endTime: '16:00:00 GMT-0600 (Central Standard Time)',
  name: 'WORKSHOP: Trimble Equipment Demo II',
  abstract: 'Hands-on with the equipment.',
  mode: 'in-person',
  eventType: 'open',
  presentationType: 'individual',
  location: 'location-1'
};

describe('eventFormProblems', () => {
  it('accepts a complete event', () => {
    expect(eventFormProblems(complete)).toEqual([]);
  });

  it('lists everything missing from an empty form, in the order of the fields', () => {
    expect(eventFormProblems({})).toEqual([
      'Choose the day of the event.',
      'Set a start time; 12:00 AM is the unset default.',
      'Set an end time; 12:00 AM is the unset default.',
      'Give the event a name.',
      'Give the event an abstract.',
      'Choose a mode.',
      'Choose an event type.',
      'Choose a presentation type.',
      'Choose an event location.'
    ]);
  });

  it('refuses the default 12:00 AM start and end a new event opens with', () => {
    const problems = eventFormProblems({
      ...complete,
      startTime: '00:00:00 GMT-0600 (Central Standard Time)',
      endTime: '00:00:00 GMT-0600 (Central Standard Time)'
    });

    expect(problems).toEqual([
      'Set a start time; 12:00 AM is the unset default.',
      'Set an end time; 12:00 AM is the unset default.'
    ]);
  });

  it('refuses a time that cannot be read (#1772)', () => {
    expect(eventFormProblems({ ...complete, startTime: 'Invalid Date' })).toEqual([
      'Set a start time; 12:00 AM is the unset default.'
    ]);
  });

  it('refuses an end that is not after the start', () => {
    expect(eventFormProblems({ ...complete, endTime: complete.startTime })).toEqual([
      'The end time must be after the start time.'
    ]);
  });

  it('treats a blank name or abstract, and a select put back on its placeholder, as missing', () => {
    expect(eventFormProblems({ ...complete, name: '   ', abstract: '', mode: 'undefined', location: null })).toEqual([
      'Give the event a name.',
      'Give the event an abstract.',
      'Choose a mode.',
      'Choose an event location.'
    ]);
  });

  // #3209: each session's check-in window.
  it('accepts check-in minutes as the number box holds them', () => {
    expect(eventFormProblems({ ...complete, checkInMinutesBefore: '5', checkInMinutesAfter: 0 })).toEqual([]);
  });

  it('refuses check-in minutes that are not a whole number from 0 to a day', () => {
    expect(eventFormProblems({ ...complete, checkInMinutesBefore: '', checkInMinutesAfter: '-10' })).toEqual([
      'Check-in opens must be a whole number of minutes from 0 to 1440.',
      'Check-in closes must be a whole number of minutes from 0 to 1440.'
    ]);
  });
});
