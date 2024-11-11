import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSubmissionAddEditFormComponent } from './user-submission-add-edit-form.component';

describe('UserSubmissionAddEditFormComponent', () => {
  let component: UserSubmissionAddEditFormComponent;
  let fixture: ComponentFixture<UserSubmissionAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSubmissionAddEditFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSubmissionAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
