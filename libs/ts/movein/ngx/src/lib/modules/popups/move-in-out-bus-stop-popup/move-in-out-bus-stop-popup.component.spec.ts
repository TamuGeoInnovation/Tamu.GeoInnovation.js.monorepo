import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutBusStopPopupComponent } from './move-in-out-bus-stop-popup.component';

describe('MoveInOutBusStopPopupComponent', () => {
  let component: MoveInOutBusStopPopupComponent;
  let fixture: ComponentFixture<MoveInOutBusStopPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInOutBusStopPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutBusStopPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

