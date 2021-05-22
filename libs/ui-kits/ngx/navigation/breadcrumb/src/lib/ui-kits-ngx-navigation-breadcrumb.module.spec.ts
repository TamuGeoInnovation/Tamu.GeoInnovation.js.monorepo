import { async, TestBed } from '@angular/core/testing';
import { NavigationBreadcrumbModule } from './ui-kits-ngx-navigation-breadcrumb.module';

describe('NavigationBreadcrumbModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NavigationBreadcrumbModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(NavigationBreadcrumbModule).toBeDefined();
  });
});
