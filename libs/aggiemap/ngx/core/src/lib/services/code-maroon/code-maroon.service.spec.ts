import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CodeMaroonService, CODE_MAROON_FEED } from './code-maroon.service';
import { CODE_MAROON_SAMPLES } from './code-maroon.samples';

const EMPTY_FEED = `<rss version='2.0'><channel><title>Code Maroon Active Alerts</title></channel></rss>`;
const ACTIVE_FEED = `<rss version='2.0'><channel><item><title>Tornado Warning</title></item></channel></rss>`;

describe('CodeMaroonService', () => {
  let service: CodeMaroonService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CodeMaroonService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('reads the feed from this origin, not from Code Maroon directly', (done) => {
    // codemaroon.tamu.edu sends no Access-Control-Allow-Origin, so a cross-origin request would be
    // blocked by the browser. nginx proxies it to this path; requesting the upstream directly here
    // would pass in a test and fail in a browser.
    service.read().subscribe(() => done());

    const request = http.expectOne(CODE_MAROON_FEED);

    expect(request.request.url).not.toContain('codemaroon.tamu.edu');
    request.flush(EMPTY_FEED);
  });

  it('reports an empty feed as clear', (done) => {
    service.read().subscribe((state) => {
      expect(state.status).toBe('clear');
      expect(state.alerts).toEqual([]);
      done();
    });

    http.expectOne(CODE_MAROON_FEED).flush(EMPTY_FEED);
  });

  it('reports an alert as active', (done) => {
    service.read().subscribe((state) => {
      expect(state.status).toBe('active');
      expect(state.alerts[0].title).toBe('Tornado Warning');
      done();
    });

    http.expectOne(CODE_MAROON_FEED).flush(ACTIVE_FEED);
  });

  it('reports a failed request as unreachable, never as clear', (done) => {
    // The important one. A map that looks calm because the feed failed, during an emergency, is the
    // worst thing this could do - so the two must not collapse into one state.
    service.read().subscribe((state) => {
      expect(state.status).toBe('unreachable');
      expect(state.status).not.toBe('clear');
      done();
    });

    http.expectOne(CODE_MAROON_FEED).error(new ProgressEvent('network error'));
  });

  it('reports unparseable XML as unreachable rather than as no alerts', (done) => {
    service.read().subscribe((state) => {
      expect(state.status).toBe('unreachable');
      done();
    });

    http.expectOne(CODE_MAROON_FEED).flush('<rss><channel><item>');
  });

  it('marks sample data as a sample', (done) => {
    // What stops a demonstration being mistaken for a real alert; the overlay reads this flag.
    service.showSample([CODE_MAROON_SAMPLES['tornado']]);

    service.state.subscribe((state) => {
      expect(state.sample).toBe(true);
      expect(state.status).toBe('active');
      done();
    });
  });

  it('does not mark live data as a sample', (done) => {
    service.read().subscribe((state) => {
      expect(state.sample).toBe(false);
      done();
    });

    http.expectOne(CODE_MAROON_FEED).flush(ACTIVE_FEED);
  });

  it('labels every fabricated sample in its own text', (done) => {
    // The label has to survive a screenshot leaving its context, so it is in the content and not
    // only in the interface around it. The monthly test is exempt: that wording is genuine.
    Object.entries(CODE_MAROON_SAMPLES)
      .filter(([key]) => key !== 'test')
      .forEach(([, alert]) => {
        expect(alert.title).toContain('SAMPLE');
        expect(alert.description).toContain('NOT A REAL EMERGENCY');
      });

    done();
  });
});
