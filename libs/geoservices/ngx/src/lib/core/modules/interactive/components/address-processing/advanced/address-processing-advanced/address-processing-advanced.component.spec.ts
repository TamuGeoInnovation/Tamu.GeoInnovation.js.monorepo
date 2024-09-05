import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressProcessingAdvancedComponent } from './address-processing-advanced.component';

describe('AddressProcessingAdvancedComponent', () => {
  let component: AddressProcessingAdvancedComponent;
  let fixture: ComponentFixture<AddressProcessingAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddressProcessingAdvancedComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressProcessingAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
