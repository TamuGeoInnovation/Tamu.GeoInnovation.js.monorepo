import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversityAddEditFormComponent } from './university-add-edit-form.component';

describe('UniversityAddEditFormComponent', () => {
  let component: UniversityAddEditFormComponent;
  let fixture: ComponentFixture<UniversityAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UniversityAddEditFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UniversityAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

