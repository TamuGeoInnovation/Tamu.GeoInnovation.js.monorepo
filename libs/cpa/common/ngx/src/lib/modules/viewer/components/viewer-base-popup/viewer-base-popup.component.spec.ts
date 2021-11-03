import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewerBasePopupComponent } from './viewer-base-popup.component';

describe('ViewerBasePopupComponent', () => {
  let component: ViewerBasePopupComponent;
  let fixture: ComponentFixture<ViewerBasePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewerBasePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerBasePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
