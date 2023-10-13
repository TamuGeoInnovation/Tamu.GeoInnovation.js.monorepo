import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationLinkFormComponent } from './organization-link-form.component';

describe('OrganizationLinkFormComponent', () => {
  let component: OrganizationLinkFormComponent;
  let fixture: ComponentFixture<OrganizationLinkFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationLinkFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationLinkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
