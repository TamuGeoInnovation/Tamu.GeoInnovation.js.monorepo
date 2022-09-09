import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestViewerComponent } from './request-viewer.component';

describe('RequestViewerComponent', () => {
  let component: RequestViewerComponent;
  let fixture: ComponentFixture<RequestViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
