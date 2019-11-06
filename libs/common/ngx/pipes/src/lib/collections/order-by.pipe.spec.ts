import { async, inject, TestBed } from '@angular/core/testing';
import { OrderByPipe } from './order-by.pipe';

describe('orderBy.pipe', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [OrderByPipe]
    }).compileComponents();
  }));

  it('should return empty imput', inject([OrderByPipe], (pipe: OrderByPipe) => {
    expect(pipe.transform([], 'test')).toEqual([]);
  }));

  it('should apply ascending transformation', inject([OrderByPipe], (pipe: OrderByPipe) => {
    expect(pipe.transform([{ test: 1 }, { test: 0 }], 'test')).toEqual([{ test: 0 }, { test: 1 }]);
  }));

  it('should apply descending transformation', inject([OrderByPipe], (pipe: OrderByPipe) => {
    expect(pipe.transform([{ test: 1 }, { test: 0 }], 'test', 'desc')).toEqual([{ test: 1 }, { test: 0 }]);
  }));

  it('should handle undefined input', inject([OrderByPipe], (pipe: OrderByPipe) => {
    expect(pipe.transform([{ test: undefined }, { test: 0 }], 'test')).toEqual([{ test: undefined }, { test: 0 }]);
  }));

  it('should error for invalid direction', inject([OrderByPipe], (pipe: OrderByPipe) => {
    // tslint:disable
    expect(() => pipe.transform([{ test: 1 }, { test: 2 }], 'test', 'south' as any)).toThrowError(
      // tslint:enable
      new Error('Invalid ordering direction specified')
    );
  }));
});
