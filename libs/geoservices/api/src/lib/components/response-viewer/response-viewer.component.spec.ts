import { async, TestBed, inject } from '@angular/core/testing';

import { ResponseViewerComponent } from './response-viewer.component';
import { HighlightPlusModule } from 'ngx-highlightjs/plus/';
import { CommonModule } from '@angular/common';

describe('ResponseViewerComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HighlightPlusModule, CommonModule],
      providers: [ResponseViewerComponent]
    }).compileComponents();
  }));

  it('should create', inject([ResponseViewerComponent], (component: ResponseViewerComponent<{}, {}>) => {
    expect(component).toBeTruthy();
  }));
});
