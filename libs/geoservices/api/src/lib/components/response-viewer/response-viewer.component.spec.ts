import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { HighlightPlusModule } from 'ngx-highlightjs/plus/';

import { ResponseViewerComponent } from './response-viewer.component';

describe('ResponseViewerComponent', () => {
  let component: ResponseViewerComponent<object, object>;
  let fixture: ComponentFixture<ResponseViewerComponent<object, object>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HighlightPlusModule, CommonModule],
      declarations: [ResponseViewerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
