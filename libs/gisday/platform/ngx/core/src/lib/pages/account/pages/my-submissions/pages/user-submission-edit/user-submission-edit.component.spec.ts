import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSubmissionEditComponent } from './user-submission-edit.component';

describe('UserSubmissionEditComponent', () => {
  let component: UserSubmissionEditComponent;
  let fixture: ComponentFixture<UserSubmissionEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserSubmissionEditComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSubmissionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
