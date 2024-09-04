import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutNoParkingPopupComponent } from './move-in-out-no-parking-popup.component';

describe('MoveInOutNoParkingPopupComponent', () => {
  let component: MoveInOutNoParkingPopupComponent;
  let fixture: ComponentFixture<MoveInOutNoParkingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInOutNoParkingPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutNoParkingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
