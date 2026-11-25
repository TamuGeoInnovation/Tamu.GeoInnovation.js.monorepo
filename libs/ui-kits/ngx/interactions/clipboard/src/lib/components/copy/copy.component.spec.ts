import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { Angulartics2 } from 'angulartics2';

import { CopyComponent } from './copy.component';

/**
 * #3488. The copy field reports each copy through trackEvent now; the reports read `gstCustom` field for field, so the
 * event is the one it built by hand before: `{ guid, date, content }`, in that order.
 */
describe('CopyComponent, its analytics event', () => {
  const guid = '00000000-0000-4000-8000-000000000002';
  const now = new Date('2026-11-25T09:00:00.000Z');

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('is the event it built by hand before', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(guid);

    const eventTrack = new Subject<unknown>();
    const events: Array<unknown> = [];
    eventTrack.subscribe((e) => events.push(e));

    TestBed.configureTestingModule({ providers: [{ provide: Angulartics2, useValue: { eventTrack } }] });
    TestBed.overrideTemplate(CopyComponent, '');
    const fixture = TestBed.createComponent(CopyComponent);
    fixture.componentRef.setInput('text', '30.6187, -96.3365');

    fixture.componentInstance.copyCoordsClick();

    // As copy.component.ts built it before #3488.
    const byHand = {
      action: 'clipboard_copy',
      properties: { category: 'ui_interaction', gstCustom: { guid, date: now.getTime(), content: '30.6187, -96.3365' } }
    };

    expect(events).toEqual([byHand]);
    expect(JSON.stringify(events[0])).toBe(JSON.stringify(byHand));
  });
});
