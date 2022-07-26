import { async, TestBed, inject } from '@angular/core/testing';

import { HighlightPlusModule } from 'ngx-highlightjs/plus/';

import { ResponseViewerComponent } from './response-viewer.component';

describe('ResponseViewerComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HighlightPlusModule],
      providers: [ResponseViewerComponent]
    }).compileComponents();
  }));

  it('should create', inject([ResponseViewerComponent], (component: ResponseViewerComponent<object, object>) => {
    expect(component).toBeTruthy();
  }));
});
