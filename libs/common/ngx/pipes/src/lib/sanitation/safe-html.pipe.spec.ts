import { async, inject, TestBed } from '@angular/core/testing';
import { SafeHtmlPipe } from './safe-html.pipe';

describe('SafeHtmlPipe', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [SafeHtmlPipe]
    }).compileComponents();
  }));

  it('should bypass security', inject([SafeHtmlPipe], (pipe: SafeHtmlPipe) => {
    expect(pipe.transform('Test')).toEqual({ changingThisBreaksApplicationSecurity: 'Test' });
  }));
});
