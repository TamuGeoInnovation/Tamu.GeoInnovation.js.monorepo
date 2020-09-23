import { TestBed } from '@angular/core/testing';

import { AccordionService } from './accordion.service';

describe('AccordionService', () => {
  let service: AccordionService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new AccordionService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle and emit correct values', (done) => {
    service.toggle('expanded');
    const getEmit = service.state;
    getEmit.subscribe((emitted) => {
      expect(emitted).toMatchObject({ expanded: true, resize: false, animate: false });
      done();
    });
    service.toggle('expanded');
    const getEmitFinal = service.state;
    getEmitFinal.subscribe((emitted) => {
      expect(emitted).toMatchObject({ expanded: false, resize: false, animate: false });
      done();
    });
  });
  it('should update and emit correct values', (done) => {
    service.update({ expanded: true, resize: true, animate: true });
    const getEmit = service.state;
    getEmit.subscribe((emitted) => {
      expect(emitted).toMatchObject({ expanded: true, resize: true, animate: true });
      done();
    });
    service.update({ expanded: false, resize: true, animate: true });
    const getEmitFinal = service.state;
    getEmitFinal.subscribe((emitted) => {
      expect(emitted).toMatchObject({ expanded: false, resize: true, animate: true });
      done();
    });
  });
});
