import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationAddEditFormComponent } from './organization-add-edit-form.component';

describe('OrganizationAddEditFormComponent', () => {
  let component: OrganizationAddEditFormComponent;
  let fixture: ComponentFixture<OrganizationAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationAddEditFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
