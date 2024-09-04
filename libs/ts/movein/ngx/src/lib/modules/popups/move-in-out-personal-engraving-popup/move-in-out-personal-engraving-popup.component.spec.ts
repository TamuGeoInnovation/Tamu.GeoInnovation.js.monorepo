import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutPersonalEngravingPopupComponent } from './move-in-out-personal-engraving-popup.component';

describe('MoveInOutPersonalEngravingPopupComponent', () => {
  let component: MoveInOutPersonalEngravingPopupComponent;
  let fixture: ComponentFixture<MoveInOutPersonalEngravingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInOutPersonalEngravingPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutPersonalEngravingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
