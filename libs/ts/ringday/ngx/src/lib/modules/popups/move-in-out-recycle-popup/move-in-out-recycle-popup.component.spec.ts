import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveInOutRecyclePopupComponent } from './move-in-out-recycle-popup.component';

describe('MoveInOutRecyclePopupComponent', () => {
  let component: MoveInOutRecyclePopupComponent;
  let fixture: ComponentFixture<MoveInOutRecyclePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveInOutRecyclePopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoveInOutRecyclePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
