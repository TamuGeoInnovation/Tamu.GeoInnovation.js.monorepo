import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressFormatFragmentComponent } from './address-format-fragment.component';

describe('AddressFormatFragmentComponent', () => {
  let component: AddressFormatFragmentComponent;
  let fixture: ComponentFixture<AddressFormatFragmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddressFormatFragmentComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressFormatFragmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
