import { async, TestBed } from '@angular/core/testing';
import { DevToolsApplicationTestingModule } from './dev-tools-application-testing.module';

describe('DevToolsApplicationTestingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DevToolsApplicationTestingModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(DevToolsApplicationTestingModule).toBeDefined();
  });
});
