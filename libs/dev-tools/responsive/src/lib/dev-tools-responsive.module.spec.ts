import { async, TestBed } from '@angular/core/testing';
import { DevToolsResponsiveModule } from './dev-tools-responsive.module';

describe('DevToolsResponsiveModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DevToolsResponsiveModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DevToolsResponsiveModule).toBeDefined();
  });
});
