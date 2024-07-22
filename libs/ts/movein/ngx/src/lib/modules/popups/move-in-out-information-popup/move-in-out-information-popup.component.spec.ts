import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutInformationPopupComponent } from './move-in-out-information-popup.component';

describe('MoveInOutInformationPopupComponent', () => {
  let component: MoveInOutInformationPopupComponent;
  let fixture: ComponentFixture<MoveInOutInformationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInOutInformationPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutInformationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

