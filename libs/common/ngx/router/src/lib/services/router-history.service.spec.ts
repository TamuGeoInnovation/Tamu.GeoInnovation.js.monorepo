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
    const service: RouterHistoryService = new RouterHistoryService((mockRouter as unknown) as Router);
    expect(service).toBeTruthy();
    service.last().subscribe((event) => {
      expect(event).toEqual(mockRouter.ne1);
      done();
    });
  });
});
