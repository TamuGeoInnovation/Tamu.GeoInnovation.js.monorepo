import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutParkingSpacePopupComponent } from './move-in-out-parking-space-popup.component';

describe('MoveInOutParkingSpacePopupComponent', () => {
  let component: MoveInOutParkingSpacePopupComponent;
  let fixture: ComponentFixture<MoveInOutParkingSpacePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInOutParkingSpacePopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutParkingSpacePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
