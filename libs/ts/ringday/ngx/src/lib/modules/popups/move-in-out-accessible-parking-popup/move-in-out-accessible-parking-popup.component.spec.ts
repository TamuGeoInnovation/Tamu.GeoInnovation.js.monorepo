import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutAccessibleParkingPopupComponent } from './move-in-out-accessible-parking-popup.component';

describe('MoveInOutAccessibleParkingPopupComponent', () => {
  let component: MoveInOutAccessibleParkingPopupComponent;
  let fixture: ComponentFixture<MoveInOutAccessibleParkingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInOutAccessibleParkingPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutAccessibleParkingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
