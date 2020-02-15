import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseViewerComponent } from './response-viewer.component';

describe('ResponseViewerComponent', () => {
  let component: ResponseViewerComponent;
  let fixture: ComponentFixture<ResponseViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponseViewerComponent ]
    })
    .compileComponents();
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
