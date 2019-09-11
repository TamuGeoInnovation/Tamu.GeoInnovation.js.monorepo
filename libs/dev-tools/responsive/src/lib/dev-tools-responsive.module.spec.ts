import { async, TestBed } from '@angular/core/testing';
import { ResponsiveModule } from './dev-tools-responsive.module';

describe('DevToolsResponsiveModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ResponsiveModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(ResponsiveModule).toBeDefined();
  });
});
