import { async, inject, TestBed } from '@angular/core/testing';
import { GroupByPipe } from './group-by.pipe';

describe('groupBy.pipe', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [GroupByPipe]
    }).compileComponents();
  }));

  it('should apply groupBy transformation', inject([GroupByPipe], (pipe: GroupByPipe<{ test: string }>) => {
    expect(pipe.transform([{ test: 'howdy' }], 'test')).toEqual([{ items: [{ test: 'howdy' }] }]);
  }));
});
