import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AliasAttributeTableComponent } from './alias-attribute-table.component';

describe('AliasAttributeTableComponent', () => {
  let component: AliasAttributeTableComponent;
  let fixture: ComponentFixture<AliasAttributeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AliasAttributeTableComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AliasAttributeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
