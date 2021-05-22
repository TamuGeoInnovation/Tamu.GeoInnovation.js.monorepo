import { async, TestBed } from '@angular/core/testing';
import { TestingModule } from './dev-tools-application-testing.module';

describe('DevToolsApplicationTestingModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TestingModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(TestingModule).toBeDefined();
  });
});
