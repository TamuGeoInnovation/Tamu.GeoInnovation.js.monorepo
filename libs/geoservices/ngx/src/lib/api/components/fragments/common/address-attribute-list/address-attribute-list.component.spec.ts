import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressAttributeListComponent } from './address-attribute-list.component';

describe('AddressAttributeListComponent', () => {
  let component: AddressAttributeListComponent;
  let fixture: ComponentFixture<AddressAttributeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddressAttributeListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressAttributeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
