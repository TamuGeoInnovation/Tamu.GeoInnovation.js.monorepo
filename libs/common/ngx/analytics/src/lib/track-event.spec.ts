import { Subject } from 'rxjs';

import { stampedEvent, trackEvent } from './track-event';

/**
 * #3488. The reports read `gstCustom` field for field, so the helper must send exactly what the hand-built events did:
 * here, the object the AggieMap sidebar built before it, `{ guid, date, name }`, in that order.
 */
describe('trackEvent', () => {
  const guid = '00000000-0000-4000-8000-000000000001';
  const now = new Date('2026-11-25T09:00:00.000Z');

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(guid);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function sent(send: (analytics: { eventTrack: Subject<unknown> }) => void) {
    const analytics = { eventTrack: new Subject<unknown>() };
    const events: Array<unknown> = [];
    analytics.eventTrack.subscribe((e) => events.push(e));
    send(analytics);

    return events;
  }

  it('sends the event the sidebar built by hand, field for field', () => {
    // As sidebar.component.ts built it before #3488.
    const byHand = {
      action: 'sidebar_select',
      properties: {
        category: 'ui_interaction',
        gstCustom: { guid: crypto.randomUUID(), date: Date.now(), name: 'Directions' }
      }
    };

    const [event] = sent((analytics) => trackEvent(analytics, 'sidebar_select', 'ui_interaction', { name: 'Directions' }));

    expect(event).toEqual(byHand);
    expect(JSON.stringify(event)).toBe(JSON.stringify(byHand));
  });

  it('stamps guid, then date, then the event fields in the order given', () => {
    const custom: Record<string, unknown> = { travel_mode: 1, connection: 'walking', try_count: 0, stop_count: 2 };
    custom['stop_0'] = 'A';
    custom['stop_1'] = 'B';

    expect(Object.keys(stampedEvent(custom))).toEqual([
      'guid',
      'date',
      'travel_mode',
      'connection',
      'try_count',
      'stop_count',
      'stop_0',
      'stop_1'
    ]);
    expect(stampedEvent(custom)).toMatchObject({ guid, date: now.getTime() });
  });

  it('sends an event with no fields of its own as just its stamp', () => {
    const [event] = sent((analytics) => trackEvent(analytics, 'trip_planner_action', 'ui_interaction'));

    expect(event).toEqual({
      action: 'trip_planner_action',
      properties: { category: 'ui_interaction', gstCustom: { guid, date: now.getTime() } }
    });
  });
});
