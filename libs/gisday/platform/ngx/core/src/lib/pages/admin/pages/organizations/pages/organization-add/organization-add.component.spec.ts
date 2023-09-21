import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAddComponent } from './organization-add.component';

describe('OrganizationAddComponent', () => {
  let component: OrganizationAddComponent;
  let fixture: ComponentFixture<OrganizationAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
