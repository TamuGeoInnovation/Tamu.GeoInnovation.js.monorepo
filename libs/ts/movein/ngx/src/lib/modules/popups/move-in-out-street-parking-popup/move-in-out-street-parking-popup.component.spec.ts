import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutStreetParkingPopupComponent } from './move-in-out-street-parking-popup.component';

describe('MoveInOutStreetParkingPopupComponent', () => {
  let component: MoveInOutStreetParkingPopupComponent;
  let fixture: ComponentFixture<MoveInOutStreetParkingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInOutStreetParkingPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutStreetParkingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
