import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Angulartics2, Angulartics2Module } from 'angulartics2';

import { GisdayAnalytics, GISDAY_ANALYTICS_SETTINGS } from './analytics';

/**
 * GIS Day loads gtag (GA4), and its events have to reach it (#2275). They went to angulartics2's analytics.js
 * provider, which calls `ga()`, a function the page does not have, so nothing was sent.
 */
describe('GIS Day analytics', () => {
  let gtag: jest.Mock;

  beforeEach(() => {
    gtag = jest.fn();
    (window as unknown as { gtag: jest.Mock }).gtag = gtag;

    TestBed.configureTestingModule({
      providers: [
        importProvidersFrom(Angulartics2Module.forRoot(GISDAY_ANALYTICS_SETTINGS)),
        provideRouter([{ path: 'check-in', children: [] }])
      ]
    });

    TestBed.inject(GisdayAnalytics).startTracking();
  });

  afterEach(() => {
    delete (window as unknown as { gtag?: jest.Mock }).gtag;
  });

  it('sends an event to gtag', () => {
    TestBed.inject(Angulartics2).eventTrack.next({
      action: 'notification_action',
      properties: { category: 'ui_interaction', gstCustom: { name: 'made-up-notification' } }
    });

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'notification_action',
      expect.objectContaining({ event_category: 'ui_interaction', name: 'made-up-notification' })
    );
  });

  it("sends no page view of its own, so gtag's is the only one, and no address with a check-in code", async () => {
    await TestBed.inject(Router).navigateByUrl('/check-in?checkin=MADE-UP-CODE');

    expect(gtag).not.toHaveBeenCalled();
  });
});
