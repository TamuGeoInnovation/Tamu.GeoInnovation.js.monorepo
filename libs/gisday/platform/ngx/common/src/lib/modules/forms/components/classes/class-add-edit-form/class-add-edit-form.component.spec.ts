import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassAddEditFormComponent } from './class-add-edit-form.component';

describe('ClassAddEditFormComponent', () => {
  let component: ClassAddEditFormComponent;
  let fixture: ComponentFixture<ClassAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClassAddEditFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
