import { TestBed } from '@angular/core/testing';

import { NodeTypesService } from './node-types.service';

describe('NodeTypesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NodeTypesService = TestBed.get(NodeTypesService);
    expect(service).toBeTruthy();
  });
});
