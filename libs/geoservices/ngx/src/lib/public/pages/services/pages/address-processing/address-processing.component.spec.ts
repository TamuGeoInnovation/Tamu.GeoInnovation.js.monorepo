import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressProcessingComponent } from './address-processing.component';

describe('AddressProcessingComponent', () => {
  let component: AddressProcessingComponent;
  let fixture: ComponentFixture<AddressProcessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddressProcessingComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
