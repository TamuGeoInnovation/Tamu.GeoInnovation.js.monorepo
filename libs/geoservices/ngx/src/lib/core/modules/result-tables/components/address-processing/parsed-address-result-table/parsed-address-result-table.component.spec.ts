import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParsedAddressResultTableComponent } from './parsed-address-result-table.component';

describe('ParsedAddressResultTableComponent', () => {
  let component: ParsedAddressResultTableComponent;
  let fixture: ComponentFixture<ParsedAddressResultTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParsedAddressResultTableComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParsedAddressResultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
