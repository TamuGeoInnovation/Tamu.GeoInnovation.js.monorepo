import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiningPopupComponent } from './dining.component';

describe('DiningComponent', () => {
  let component: DiningPopupComponent;
  let fixture: ComponentFixture<DiningPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiningPopupComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiningPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
