import { async, inject, TestBed } from '@angular/core/testing';

import { ResponsiveService } from './responsive.service';

describe('ResponsiveService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [ResponsiveService] }).compileComponents();
  }));

  it('should be created', inject([ResponsiveService], (responsiveService: ResponsiveService) => {
    expect(responsiveService).toBeTruthy();
  }));
});
