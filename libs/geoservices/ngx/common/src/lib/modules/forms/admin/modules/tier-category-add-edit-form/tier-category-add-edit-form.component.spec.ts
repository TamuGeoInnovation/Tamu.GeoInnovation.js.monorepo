import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TierCategoryAddEditFormComponent } from './tier-category-add-edit-form.component';

describe('TierCategoryAddEditFormComponent', () => {
  let component: TierCategoryAddEditFormComponent;
  let fixture: ComponentFixture<TierCategoryAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TierCategoryAddEditFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TierCategoryAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
