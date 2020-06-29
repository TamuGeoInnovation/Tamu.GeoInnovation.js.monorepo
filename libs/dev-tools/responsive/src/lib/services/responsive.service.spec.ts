import { async, inject, TestBed } from '@angular/core/testing';

import { ResponsiveService } from './responsive.service';

describe('ResponsiveService', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [ResponsiveService] }).compileComponents();
  }));

  it('should be created', inject([ResponsiveService], (responsiveService: ResponsiveService) => {
    expect(responsiveService).toBeTruthy();
  }));

  it('should get snapshot', inject([ResponsiveService], (responsiveService: ResponsiveService) => {
    expect(responsiveService.snapshot).toEqual({ isMobile: false, screenWidth: 1024 });
  }));

  it('should get status', inject([ResponsiveService], (responsiveService: ResponsiveService) => {
    responsiveService.isMobile.forEach((value) => {
      expect(value).toEqual(false);
    });
  }));

  it('should be mobile for <768', () => {
    ((window as unknown) as { innerWidth: number }).innerWidth = 700;
    inject([ResponsiveService], (responsiveService: ResponsiveService) => {
      expect(responsiveService.snapshot).toEqual({ isMobile: true, screenWidth: 700 });
    })();
  });

  it('should not be mobile for >768 && <992', () => {
    ((window as unknown) as { innerWidth: number }).innerWidth = 900;
    inject([ResponsiveService], (responsiveService: ResponsiveService) => {
      expect(responsiveService.snapshot).toEqual({ isMobile: false, screenWidth: 900 });
    })();
  });
});
