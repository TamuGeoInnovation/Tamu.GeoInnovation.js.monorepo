import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressMatchTypeAttributeListComponent } from './address-match-type-attribute-list.component';

describe('AddressMatchTypeAttributeListComponent', () => {
  let component: AddressMatchTypeAttributeListComponent;
  let fixture: ComponentFixture<AddressMatchTypeAttributeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddressMatchTypeAttributeListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressMatchTypeAttributeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
