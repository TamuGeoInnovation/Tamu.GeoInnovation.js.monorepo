import { TestBed } from '@angular/core/testing';

import { DragService } from './drag.service';

describe('DragService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DragService = TestBed.get(DragService);
    expect(service).toBeTruthy();
  });
});
