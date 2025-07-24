import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryBenefitAddEditFormComponent } from './category-benefit-add-edit-form.component';

describe('CategoryBenefitAddEditFormComponent', () => {
  let component: CategoryBenefitAddEditFormComponent;
  let fixture: ComponentFixture<CategoryBenefitAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryBenefitAddEditFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryBenefitAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
