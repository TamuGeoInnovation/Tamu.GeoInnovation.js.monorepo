import { async, inject, TestBed } from '@angular/core/testing';
import { TimeUntilPipe } from './time-until.pipe';

describe('TimeUtilPipe', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [TimeUntilPipe]
    }).compileComponents();
  }));

  it('should work for 0 minutes', inject([TimeUntilPipe], (pipe: TimeUntilPipe) => {
    expect(pipe.transform(0)).toEqual('0 min');
  }));

  it('should work for 60 minutes', inject([TimeUntilPipe], (pipe: TimeUntilPipe) => {
    expect(pipe.transform(60)).toEqual('1:00 hr');
  }));
});
