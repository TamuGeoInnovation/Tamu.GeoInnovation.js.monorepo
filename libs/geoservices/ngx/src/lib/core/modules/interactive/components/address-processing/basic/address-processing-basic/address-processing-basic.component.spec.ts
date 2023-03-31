import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressProcessingBasicComponent } from './address-processing-basic.component';

describe('AddressProcessingBasicComponent', () => {
  let component: AddressProcessingBasicComponent;
  let fixture: ComponentFixture<AddressProcessingBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddressProcessingBasicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressProcessingBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
