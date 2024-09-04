import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutDiningPopupComponent } from './move-in-out-dining-popup.component';

describe('MoveInOutDiningPopupComponent', () => {
  let component: MoveInOutDiningPopupComponent;
  let fixture: ComponentFixture<MoveInOutDiningPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInOutDiningPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutDiningPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
