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

  it('should be created', () => {
    service.toggle('expanded');
    expect(service.state).toEqual({
      _isScalar: false,
      source: {
        _isScalar: false,
        _value: { animate: false, expanded: true, resize: false },
        closed: false,
        hasError: false,
        isStopped: false,
        observers: [],
        thrownError: null
      }
    });
    service.toggle('expanded');
    expect(service.state).toEqual({
      _isScalar: false,
      source: {
        _isScalar: false,
        _value: { animate: false, expanded: false, resize: false },
        closed: false,
        hasError: false,
        isStopped: false,
        observers: [],
        thrownError: null
      }
    });
  });
  it('should be created', () => {
    service.update({ expanded: true, resize: true, animate: true });
    expect(service.state).toEqual({
      _isScalar: false,
      source: {
        _isScalar: false,
        _value: { animate: true, expanded: true, resize: true },
        closed: false,
        hasError: false,
        isStopped: false,
        observers: [],
        thrownError: null
      }
    });
  });
});
