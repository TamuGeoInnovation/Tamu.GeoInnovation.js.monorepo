import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutBuildingPopupComponent } from './move-in-out-building-popup.component';

describe('MoveInOutBuildingPopupComponent', () => {
  let component: MoveInOutBuildingPopupComponent;
  let fixture: ComponentFixture<MoveInOutBuildingPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInOutBuildingPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutBuildingPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
