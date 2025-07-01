import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressCorrectionComponent } from './address-correction.component';

describe('AddressCorrectionComponent', () => {
  let component: AddressCorrectionComponent;
  let fixture: ComponentFixture<AddressCorrectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddressCorrectionComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressCorrectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
