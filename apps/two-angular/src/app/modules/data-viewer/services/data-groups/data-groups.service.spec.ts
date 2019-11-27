import { TestBed } from '@angular/core/testing';

import { DataGroupsService } from './data-groups.service';

describe('DataGroupsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DataGroupsService = TestBed.get(DataGroupsService);
    expect(service).toBeTruthy();
  });
});
