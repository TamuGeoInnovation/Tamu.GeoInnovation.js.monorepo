import { TestBed } from '@angular/core/testing';

import { AccordionService } from './accordion.service';

describe('AccordionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AccordionService = TestBed.get(AccordionService);
    expect(service).toBeTruthy();
  });
});
