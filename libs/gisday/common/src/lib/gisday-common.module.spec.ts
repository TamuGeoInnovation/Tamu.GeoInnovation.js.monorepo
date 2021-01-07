import { async, TestBed } from '@angular/core/testing';
import { GisdayCommonModule } from './gisday-common.module';

describe('GisdayCommonModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [GisdayCommonModule]
    }).compileComponents();
  }));

  it('should create', () => {
    expect(GisdayCommonModule).toBeDefined();
  });
});
