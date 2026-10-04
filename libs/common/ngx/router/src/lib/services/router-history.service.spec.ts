import { RouterHistoryService } from './router-history.service';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';

class MockRouter {
  public ne1 = new NavigationEnd(0, 'http://localhost:4200/test', 'http://localhost:4200/test');
  public ne2 = new NavigationEnd(1, 'http://localhost:4200/test2', 'http://localhost:4200/test2');
  public events = new Observable((observer) => {
    observer.next(this.ne1);
    observer.next(this.ne2);
    observer.complete();
  });
}

describe('RouterHistoryService', () => {
  it('should work for a single event', (done) => {
    const mockRouter = new MockRouter();
    const service: RouterHistoryService = new RouterHistoryService(mockRouter as unknown as Router);
    expect(service).toBeTruthy();
    service.last().subscribe((event) => {
      expect(event).toEqual(mockRouter.ne1);
      done();
    });
  });
});

/**
 * Production builds minify class names (#1348). There, Angular's NavigationEnd is a class named
 * something like `Wn`, so a check on `constructor.name` never matched and the history stayed empty on
 * production while working in development builds. This stands in for the minified class.
 */
class Wn extends NavigationEnd {}

describe('RouterHistoryService in a production build', () => {
  it('records NavigationEnd events whose class name has been minified', (done) => {
    // last() is the previous route, so it needs two navigations.
    const router = {
      events: new Observable((observer) => {
        observer.next(new Wn(0, 'http://localhost:4200/map', 'http://localhost:4200/map'));
        observer.next(new Wn(1, 'http://localhost:4200/all-maps', 'http://localhost:4200/all-maps'));
      })
    };
    const service = new RouterHistoryService(router as unknown as Router);

    service.last().subscribe((event) => {
      expect(event.url).toBe('http://localhost:4200/map');
      done();
    });
  });

  it('still ignores router events that are not a NavigationEnd', () => {
    const router = { events: new Observable((observer) => observer.next({ id: 0, url: '/elsewhere' })) };
    const service = new RouterHistoryService(router as unknown as Router);
    let historyLength = -1;

    service.history.subscribe((state) => (historyLength = state.historyEvents.length));

    expect(historyLength).toBe(0);
  });
});
